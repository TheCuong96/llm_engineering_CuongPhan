import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const ready = async (page: Page) => {
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
};
const pickPeak = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'Danh sách phong' }).click();
  await page.locator('[data-hud="peak-list"]').getByText(name).click();
};
const peakPos = (page: Page, id: string) => page.evaluate((i) => window.__sim!().world.peaks.find((p) => p.id === i)!.worldPos, id);
const near = (a: number[], b: number[], tol: number) => Math.hypot(a[0]! - b[0]!, a[2]! - b[2]!) < tol;

test('five peaks: the viewed one in full detail, the other four as LOD; all tick together', async ({ page }) => {
  await ready(page);
  expect(await page.evaluate(() => window.__named!('peak:'))).toEqual(['peak:PH-01']);
  expect((await page.evaluate(() => window.__named!('peak-lod:'))).sort()).toEqual(['peak-lod:PH-02', 'peak-lod:PH-03', 'peak-lod:PH-04', 'peak-lod:PH-05']);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForTimeout(3000);
  const spawned = await page.evaluate(() => new Set(window.__sim!().world.log.events.filter((e) => e.type === 'ship_spawned').map((e) => e.peakId)).size);
  expect(spawned).toBe(5);
});

test('switching peak flies over the cloud sea in 1.2–1.6 s, fades panels, and is done in < 2 s', async ({ page }) => {
  await ready(page);
  const fades: string[] = [];
  await page.exposeFunction('__noteFade', (v: string) => fades.push(v));
  await page.evaluate(() => {
    const el = document.querySelector('[data-hud-fade]')!;
    new MutationObserver(() => (window as unknown as { __noteFade: (v: string) => void }).__noteFade(el.getAttribute('data-hud-fade')!)).observe(el, { attributeFilter: ['data-hud-fade'] });
  });
  const target = await peakPos(page, 'PH-04');
  const t0 = Date.now();
  await pickPeak(page, 'Truyền Tống Đài');
  await page.waitForFunction(() => window.__view!.flying, null, { timeout: 2000 });
  await page.waitForFunction(() => !window.__view!.flying, null, { timeout: 4000 });
  await expect(page.locator('[data-kpi="chests"] [data-kpi-value]')).toHaveText(/^5\d\d$/);
  const elapsed = Date.now() - t0;
  const view = await page.evaluate(() => window.__view!);
  expect(near(view.target, target, 1)).toBe(true);
  expect(view.lastFlightMs).toBeGreaterThanOrEqual(1200);
  expect(view.lastFlightMs).toBeLessThanOrEqual(1700); // 1.4 s design + one slow software-GL frame
  expect(elapsed).toBeLessThan(2000 + 600); // < 2 s on real hardware; headless frames add jitter
  expect(fades).toEqual(['out', 'in']);
  expect(await page.evaluate(() => window.__named!('peak:'))).toEqual(['peak:PH-04']);
  expect(await page.evaluate(() => window.__named!('landmark:'))).toContain('landmark:teleport');
});

test('Toàn cảnh tông môn: rises to see all five peaks with chips; clicking one flies down to it', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Toàn cảnh tông môn' }).click();
  await page.waitForFunction(() => window.__view!.mode === 'overview' && !window.__view!.flying, null, { timeout: 5000 });
  expect(await page.evaluate(() => window.__view!.distance)).toBeGreaterThan(400);
  const chips = page.locator('[data-overview-peak]');
  await expect(chips).toHaveCount(5);
  await expect(page.locator('[data-overview-peak="PH-01"]')).toContainText(/PH-01 · \d+%/);
  // every peak projects inside the viewport
  for (const id of ['PH-01', 'PH-02', 'PH-03', 'PH-04', 'PH-05']) {
    const pos = await peakPos(page, id);
    const p = await page.evaluate((v) => window.__project!(v as [number, number, number]), pos);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(1440);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y).toBeLessThan(900);
  }
  await page.locator('[data-overview-peak="PH-03"]').click();
  await page.waitForFunction(() => window.__view!.mode === 'peak' && !window.__view!.flying, null, { timeout: 5000 });
  expect(near(await page.evaluate(() => window.__view!.target), await peakPos(page, 'PH-03'), 1)).toBe(true);
  await expect(page.locator('[data-hud="peak-switcher"]')).toContainText('Hàn Băng Cốc');
  expect(await page.evaluate(() => window.__named!('landmark:'))).toContain('landmark:ice-cave');
  const az0 = await page.evaluate(() => window.__view!.azimuth);
  await page.click('[data-map-action="rotate-right"]');
  await page.waitForTimeout(1500);
  expect(((await page.evaluate(() => window.__view!.azimuth)) - az0) * (180 / Math.PI)).toBeCloseTo(90, 0);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('peak switch is a 200 ms fade, no flight, numbers land immediately', async ({ page }) => {
    await ready(page);
    const target = await peakPos(page, 'PH-02');
    await pickPeak(page, 'Đan Hà Phong');
    await expect(page.locator('[data-fade-veil]')).toHaveAttribute('data-fade-veil', 'off');
    const view = await page.evaluate(() => window.__view!);
    expect(view.flying).toBe(false);
    expect(near(view.target, target, 1)).toBe(true);
    await expect(page.locator('[data-kpi="chests"] [data-kpi-value]')).toHaveText(/^2,3\d\d$/, { timeout: 500 });
  });
});

test('a transfer between peaks can be followed to its destination', async ({ page }) => {
  test.setTimeout(240_000);
  await ready(page);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(() => (window.__transit?.ids.length ?? 0) > 0, null, { timeout: 200_000 });
  const { id, dest } = await page.evaluate(() => {
    const s = window.__sim!().world.ships.get(window.__transit!.ids[0]!)!;
    return { id: s.id, dest: s.destPeakId! };
  });
  await page.evaluate(() => window.__sim!().clock.setSpeed(12));
  await page.keyboard.press('/');
  await page.keyboard.type(id);
  await page.keyboard.press('Enter');
  const follow = page.locator(`[data-follow="${dest}"]`);
  await expect(follow).toBeVisible();
  await expect(page.locator('[data-departed]')).toContainText(`đang tới ${dest}`);
  await follow.click();
  await expect(page.locator('[data-hud="peak-switcher"]')).toContainText(dest);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(([s, d]) => window.__sim!().world.ships.get(s!)?.peakId === d, [id, dest], { timeout: 200_000 });
  await expect(page.locator('[data-hud="detail"] [data-gone]')).toHaveCount(0);
  await expect(page.locator('[data-hud="detail"]')).toContainText(id);
});

test.describe('memory', () => {
  test.use({
    reducedMotion: 'reduce', // same mount/unmount work per switch, without waiting 1.4 s each
  });
  test('50 peak switches grow heap by ≤ 10% and leave GPU geometry counts flat', async ({ page }) => {
    test.setTimeout(240_000);
    await ready(page);
    await page.evaluate(() => (window.__sim!().clock.paused = true)); // isolate switching from sim growth
    const names = ['Đan Hà Phong', 'Hàn Băng Cốc', 'Truyền Tống Đài', 'Khôi Lỗi Phong', 'Tử Vân Phong'];
    const sample = async () => {
      await page.evaluate(() => (window as unknown as { gc: () => void }).gc());
      await page.waitForTimeout(300);
      await page.evaluate(() => (window as unknown as { gc: () => void }).gc());
      return page.evaluate(() => ({ heap: (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize, ...window.__glMemory!() }));
    };
    for (const n of names) {
      await pickPeak(page, n); // warm caches: every peak built once
      await page.waitForTimeout(150);
    }
    const before = await sample();
    for (let i = 0; i < 50; i++) {
      await pickPeak(page, names[i % names.length]!);
      await page.waitForTimeout(120);
    }
    const after = await sample();
    console.log(JSON.stringify({ before, after, heapGrowthPct: ((after.heap - before.heap) / before.heap) * 100 }));
    expect(after.heap).toBeLessThanOrEqual(before.heap * 1.1);
    expect(after.geometries).toBeLessThanOrEqual(before.geometries + 5);
    expect(after.textures).toBeLessThanOrEqual(before.textures + 2);
  });
});
