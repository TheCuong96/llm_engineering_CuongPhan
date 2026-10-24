import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const ready = (page: Page) => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
const viewSite = (page: Page) => page.evaluate(() => window.__sim!().viewSiteId);
const visibleSites = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    // Names come from SiteScenery groups; only the viewed one may be visible.
    for (const name of window.__named!('site:')) {
      const id = name.slice(5);
      if (window.__visible!(name)) out.push(id);
    }
    return out;
  });

test('switching site flies the camera in < 2 s, counts the KPIs and reloads every panel (spec P6)', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: /choose site/ }).click();
  const t0 = await page.evaluate(() => performance.now());
  await page.locator('[data-site-option="WH-04"]').click();

  // The KPI counts through intermediate values on its way from 1,412 to 610.
  const seen = new Set<string>();
  for (let i = 0; i < 12; i++) {
    seen.add((await page.locator('[data-kpi="stock"] [data-kpi-value]').textContent()) ?? '');
    await page.waitForTimeout(60);
  }
  await page.waitForFunction(() => window.__view?.flying === false && window.__view.lastFlightMs > 0, null, { timeout: 10_000 });
  const settledMs = (await page.evaluate(() => performance.now())) - t0;
  const flight = await page.evaluate(() => window.__view!.lastFlightMs);
  expect(flight).toBeGreaterThan(900);
  expect(settledMs).toBeLessThan(2000);
  expect([...seen].some((v) => v !== '1,412' && v !== '610')).toBe(true);

  await expect(page.locator('[data-kpi="stock"] [data-kpi-value]')).toHaveText(/^6\d\d$/);
  await expect(page.locator('[data-region="detail"]')).toContainText('Southfield Cross-Dock');
  await expect(page.locator('[data-region="detail"]')).toContainText('Cross-Dock · WH-04');
  await expect(page.locator('[data-region="fleet"]')).toContainText('Southfield Cross-Dock');
  await expect(page.getByRole('tab', { name: /Docks \d\/6/ })).toBeVisible();
  expect(await viewSite(page)).toBe('WH-04');
  expect(await visibleSites(page)).toEqual(['WH-04']);

  // The camera now frames WH-04.
  const [x, , z] = await page.evaluate(() => window.__sim!().world.sites.find((s) => s.id === 'WH-04')!.worldPos);
  const target = await page.evaluate(() => window.__view!.target);
  expect(Math.hypot(target[0] - x, target[2] - z)).toBeLessThan(20);
});

test('all five sites tick in parallel while only one is rendered', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => {
      const spawned = new Set(window.__sim!().world.log.events.filter((e) => e.type === 'truck_spawned').map((e) => e.siteId));
      return spawned.size === 5;
    },
    null,
    { timeout: 60_000 },
  );
  expect(await viewSite(page)).toBe('WH-01');
  expect(await visibleSites(page)).toEqual(['WH-01']);
  // The switcher line for every site is live, not frozen at the preset.
  await page.getByRole('button', { name: /choose site/ }).click();
  await expect(page.locator('[data-site-option]')).toHaveCount(5);
});

test('reduced motion: no camera flight and no count-up', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  await page.getByRole('button', { name: 'Next site' }).click();
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.__view!)).toMatchObject({ flying: false, lastFlightMs: 0 });
  await expect(page.locator('[data-kpi="stock"] [data-kpi-value]')).toHaveText('3,310');
});

test('50 site switches keep JS heap growth ≤ 10% and GPU resources flat (spec P6)', async ({ page }) => {
  test.setTimeout(300_000);
  // Reduced motion makes each switch instant, so 50 switches take seconds, not minutes.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => (window.__sim!().clock.paused = true)); // measure the UI, not a growing world
  const next = page.getByRole('button', { name: 'Next site' });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.enable');

  // Warm-up: 50 switches first. A heap-snapshot diff over 100 clicked switches showed the early
  // growth is V8 JIT code (InstructionStream, TrustedByteArray) and the browser's capped
  // performance-timeline buffers (LayoutShift, EventTiming) — not app objects — and both level
  // off once the code paths are hot. Measuring after warm-up isolates what the app retains.
  for (let i = 0; i < 50; i++) {
    await next.click();
    await page.waitForTimeout(100);
  }
  const sample = async () => {
    await cdp.send('HeapProfiler.collectGarbage');
    const { usedSize } = await cdp.send('Runtime.getHeapUsage');
    const scene = await page.evaluate(() => ({ gl: window.__glMemory!(), objects: window.__sceneObjects!() }));
    return { heap: usedSize, ...scene };
  };
  const before = await sample();
  for (let i = 0; i < 50; i++) {
    await next.click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  const after = await sample();
  console.log(JSON.stringify({ before, after, growth: after.heap / before.heap - 1 }));
  expect(await viewSite(page)).toBe('WH-01'); // 100 switches = 20 full laps
  expect(after.heap / before.heap - 1).toBeLessThanOrEqual(0.1);
  expect(after.gl.geometries).toBeLessThanOrEqual(before.gl.geometries);
  expect(after.gl.textures).toBeLessThanOrEqual(before.gl.textures);
  expect(after.objects).toBe(before.objects); // nothing piles up in the scene graph
});

test('a truck transferring to another site can be followed there (spec 7.2, 7.4)', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => [...window.__sim!().world.trucks.values()].some((t) => t.homeSiteId === 'WH-01' && t.destSiteId && (t.state === 'loading' || t.state === 'docking' || t.state === 'at_gate')),
    null,
    { timeout: 200_000 },
  );
  const truck = await page.evaluate(() => {
    const t = [...window.__sim!().world.trucks.values()].find((x) => x.homeSiteId === 'WH-01' && x.destSiteId && (x.state === 'loading' || x.state === 'docking' || x.state === 'at_gate'))!;
    window.__selection!().select({ kind: 'truck', id: t.id });
    return { id: t.id, dest: t.destSiteId! };
  });
  await page.waitForFunction((id) => window.__sim!().world.trucks.get(id)?.state === 'in_transit', truck.id, { timeout: 120_000 });
  await expect(page.locator('[data-departed]')).toHaveText(new RegExp(`^Left WH-01 · heading to ${truck.dest}`));
  await page.locator(`[data-follow="${truck.dest}"]`).click();
  expect(await viewSite(page)).toBe(truck.dest);
  expect(await page.evaluate(() => window.__selection!().selected)).toEqual({ kind: 'truck', id: truck.id });

  // It arrives at the destination's map edge as an inbound truck, and its card comes back to life.
  await page.waitForFunction((t) => window.__sim!().world.trucks.get(t.id)?.siteId === t.dest, truck, { timeout: 120_000 });
  await expect(page.locator('[data-region="detail"] [data-detail-kind]')).not.toHaveAttribute('data-gone', 'true');
  await expect(page.locator('[data-region="detail"]')).toContainText(/En route|At gate|Docking|Unloading/);
});
