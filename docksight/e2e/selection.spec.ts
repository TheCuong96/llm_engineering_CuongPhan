import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

type Vec3 = [number, number, number];
const ready = (page: Page) => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
const selected = (page: Page) => page.evaluate(() => window.__selection!().selected);
const detail = (page: Page) => page.locator('[data-region="detail"] [data-detail-kind]');
const screenOf = (page: Page, p: Vec3) => page.evaluate((v) => window.__project!(v), p);
const pause = (page: Page) => page.evaluate(() => (window.__sim!().clock.paused = true));
const resume = (page: Page) => page.evaluate(() => (window.__sim!().clock.paused = false));

/** Collect uncaught errors so every test can assert "no crash". */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

/** Unpause at 60× until the condition holds (callers may have paused for a stable click). */
async function runUntil(page: Page, fn: string, timeout = 120_000) {
  await page.evaluate(() => {
    const { clock } = window.__sim!();
    clock.paused = false;
    clock.setSpeed(60);
  });
  await page.waitForFunction(fn, null, { timeout });
}

test('scene, fleet board and search all select the same forklift (spec P5)', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await ready(page);
  await pause(page);
  await page.waitForTimeout(300);

  // 1. Click it in the scene.
  const fl = await page.evaluate(() => window.__render!.forklifts.get('FL-01')!.pos);
  const at = await screenOf(page, [fl[0], fl[1] + 1, fl[2]]);
  await page.mouse.click(at.x, at.y);
  expect(await selected(page)).toEqual({ kind: 'forklift', id: 'FL-01' });
  await expect(detail(page)).toHaveAttribute('data-detail-id', 'FL-01');
  await page.waitForFunction(() => window.__overlay!.frame === 'forklift:FL-01');
  await expect(page.locator('[data-scene-label="selected"]')).toHaveText(/^FL-01 · /);
  await page.getByRole('tab', { name: /Forklifts/ }).click();
  await expect(page.locator('[data-tab="forklifts"] [data-row="FL-01"]')).toHaveAttribute('aria-current', 'true');

  // 2. Esc clears it everywhere.
  await page.keyboard.press('Escape');
  expect(await selected(page)).toBeNull();
  await expect(detail(page)).toHaveAttribute('data-detail-kind', 'site');
  await page.waitForFunction(() => window.__overlay!.frame === null);

  // 3. The board row and 4. search land on the very same selection.
  await page.locator('[data-tab="forklifts"] [data-row="FL-01"]').click();
  expect(await selected(page)).toEqual({ kind: 'forklift', id: 'FL-01' });
  await page.keyboard.press('Escape');
  await page.keyboard.press('/');
  await page.keyboard.type('FL-01');
  await page.keyboard.press('Enter');
  expect(await selected(page)).toEqual({ kind: 'forklift', id: 'FL-01' });
  expect(errors).toEqual([]);
});

test('clicking a staged pallet, its pin, and the charger opens their cards', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await ready(page);
  await pause(page);
  await page.waitForTimeout(300);

  const pallet = await page.evaluate(() => window.__render!.pallets.get('PAL-1026')!);
  let at = await screenOf(page, [pallet[0], pallet[1] + 0.6, pallet[2]]);
  await page.mouse.click(at.x, at.y);
  expect(await selected(page)).toEqual({ kind: 'pallet', id: 'PAL-1026' });
  await expect(detail(page)).toContainText('Safety Helmet');

  await page.keyboard.press('Escape');
  at = await screenOf(page, [pallet[0], pallet[1] + 3.0, pallet[2]]); // the floating pin
  await page.mouse.click(at.x, at.y);
  expect(await selected(page)).toEqual({ kind: 'pallet', id: 'PAL-1026' });

  // Charger: hovering lights the plate, clicking opens the Charger card.
  const charger = await page.evaluate(() => window.__sim!().world.sites[0]!.chargers[0]!.pos);
  at = await screenOf(page, [charger[0] + 2, 1, charger[2]]);
  await page.mouse.move(at.x, at.y);
  await page.waitForFunction(() => window.__overlay!.plate === 'WH-01/C1');
  await page.mouse.click(at.x, at.y);
  expect(await selected(page)).toEqual({ kind: 'charger', id: 'WH-01/C1' });
  await expect(detail(page)).toContainText('48 V lithium-ion forklift charger');
  expect(errors).toEqual([]);
});

test('an empty dock shows "Bay · Available" on hover and opens the site card at Truck bays', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await pause(page);
  const dock = await page.evaluate(() => {
    const site = window.__sim!().world.sites[0]!;
    const d = site.docks.find((x) => x.state === 'available')!;
    return { key: `${site.id}/${d.id}`, label: d.label, pos: d.pos };
  });
  const at = await screenOf(page, [dock.pos[0], 0.3, dock.pos[2]]);
  await page.mouse.move(at.x, at.y);
  await page.waitForFunction((k) => window.__overlay!.plate === k, dock.key);
  await expect(page.locator('[data-scene-label="dock"]')).toHaveText(`${dock.label} · Available`);
  await page.mouse.click(at.x, at.y);
  expect(await page.evaluate(() => window.__selection!())).toMatchObject({ selected: { kind: 'site', id: 'WH-01' }, focusSection: 'bays' });
});

test('a docked truck: scene click, board row and tracking card agree; incoming route is drawn', async ({ page }) => {
  test.setTimeout(180_000);
  const errors = watchErrors(page);
  await page.goto('/');
  await ready(page);

  // An incoming truck shows its route: solid to the gate, dashed to the reserved bay.
  await runUntil(page, `[...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.state === 'at_gate' && t.dockId)`);
  await pause(page);
  const incoming = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && t.state === 'at_gate' && t.dockId)!.id);
  await page.getByRole('tab', { name: /Trucks/ }).click();
  await page.locator(`[data-tab="trucks"] [data-row="${incoming}"]`).click();
  await page.waitForFunction(() => window.__overlay!.path === 'both');
  await page.keyboard.press('Escape');
  // The board row flew the camera to the gate; return to the default view before clicking.
  await page.click('[data-map-action="home"]');
  await page.waitForTimeout(1500);

  await runUntil(page, `[...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && (t.state === 'loading' || t.state === 'unloading'))`);
  await pause(page);
  await page.waitForTimeout(300);
  const truck = await page.evaluate(() => {
    const t = [...window.__sim!().world.trucks.values()].find((x) => x.siteId === 'WH-01' && (x.state === 'loading' || x.state === 'unloading'))!;
    return { id: t.id, pos: window.__render!.trucks.get(t.id)!.pos };
  });
  const at = await screenOf(page, [truck.pos[0], 2.5, truck.pos[2] + 2]);
  await page.mouse.click(at.x, at.y);
  expect(await selected(page)).toEqual({ kind: 'truck', id: truck.id });
  await expect(detail(page)).toHaveAttribute('data-detail-id', truck.id);
  await expect(page.locator('[data-tracking-truck]')).toContainText(truck.id);
  await expect(page.locator(`[data-tab="trucks"] [data-row="${truck.id}"]`)).toHaveAttribute('aria-current', 'true');
  await page.waitForFunction((id) => window.__overlay!.frame === `truck:${id}`, truck.id);
  expect(errors).toEqual([]);
});

test('a selected truck that leaves keeps a dimmed card — never blank, never a crash (spec 7.2)', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = watchErrors(page);
  await page.goto('/');
  await ready(page);

  // Outbound truck: stays in the world on the highway → "Left WH-01 · heading to …".
  await runUntil(page, `[...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.direction === 'outbound' && t.state === 'loading')`);
  const outbound = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && t.direction === 'outbound' && t.state === 'loading')!.id);
  await page.evaluate((id) => window.__selection!().select({ kind: 'truck', id }), outbound);
  await runUntil(page, `window.__sim().world.trucks.get('${outbound}')?.state === 'in_transit'`);
  await expect(detail(page)).toHaveAttribute('data-gone', 'true');
  await expect(page.locator('[data-departed]')).toHaveText(/^Left WH-01 · heading to .+/);
  await expect(detail(page)).toContainText(outbound);
  await page.waitForFunction(() => window.__overlay!.frame === null); // nothing left to frame on this map

  // Inbound truck: removed from the world entirely → card stays, dimmed, "No longer on site".
  await page.keyboard.press('Escape');
  await runUntil(page, `[...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.direction === 'inbound' && t.state === 'unloading')`);
  const inbound = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && t.direction === 'inbound' && t.state === 'unloading')!.id);
  await page.evaluate((id) => window.__selection!().select({ kind: 'truck', id }), inbound);
  await runUntil(page, `!window.__sim().world.trucks.has('${inbound}')`);
  await page.waitForTimeout(500);
  await expect(detail(page)).toHaveAttribute('data-gone', 'true');
  await expect(page.locator('[data-departed]')).toHaveText('No longer on site');
  await expect(detail(page)).toContainText(inbound);
  await expect(page.locator('[data-region="tracking"]')).toBeVisible();

  // Esc drops the stale card; the site card returns.
  await page.keyboard.press('Escape');
  await expect(detail(page)).toHaveAttribute('data-detail-kind', 'site');
  await resume(page);
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});

test('board, search and notifications fly the camera to the entity', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await pause(page);
  const before = await page.evaluate(() => window.__view!);
  await page.getByRole('tab', { name: /Forklifts/ }).click();
  await page.locator('[data-tab="forklifts"] [data-row="FL-02"]').click();
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => window.__view!);
  const fl = await page.evaluate(() => window.__render!.forklifts.get('FL-02')!.pos);
  expect(after.distance).toBeLessThan(before.distance);
  expect(Math.hypot(after.target[0] - fl[0], after.target[2] - fl[2])).toBeLessThan(1.5);
});
