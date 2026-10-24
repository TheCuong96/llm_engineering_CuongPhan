import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
});
test.afterEach(() => expect(errors, errors.join('\n')).toEqual([]));

const pause = (page: Page) => page.evaluate(() => (window.__sim!().clock.paused = true));
const speed = (page: Page, x: number) => page.evaluate((v) => { const c = window.__sim!().clock; c.paused = false; c.setSpeed(v); }, x);
const settle = (page: Page) => page.waitForTimeout(700);
const detailKind = (page: Page) => page.locator('[data-hud="detail"] [data-detail-kind]').getAttribute('data-detail-kind');
const overlay = (page: Page) => page.evaluate(() => ({ ...window.__overlay! }));

/** Screen point of a world position, offset upward by `lift` metres. */
const screenOf = (page: Page, pos: number[], lift = 0) =>
  page.evaluate(([p, l]) => window.__project!([p![0]!, p![1]! + (l as number), p![2]!]), [pos, lift] as const);

async function clickWorld(page: Page, pos: number[], lift = 0) {
  const { x, y } = await screenOf(page, pos, lift);
  await page.mouse.click(x, y);
  await settle(page);
}

test('clicking a disciple, a chest, an array and the island in the scene opens the matching card', async ({ page }) => {
  await pause(page);
  await settle(page);

  const worker = await page.evaluate(() => [...window.__render!.workers.entries()][0]!);
  await clickWorld(page, worker[1].pos, 1.4);
  expect(await detailKind(page)).toBe('worker');
  await expect(page.locator('[data-hud="detail"]')).toContainText(worker[0]);
  expect((await overlay(page)).frame).toBe(`worker:${worker[0]}`);
  await expect(page.locator('[data-scene-label="selected"]')).toContainText(`${worker[0]} · `);

  const chest = await page.evaluate(() => [...window.__render!.chests.entries()][0]!);
  await clickWorld(page, chest[1], 0.3);
  expect(await detailKind(page)).toBe('chest');
  await expect(page.locator('[data-hud="detail"]')).toContainText(chest[0]);
  expect((await overlay(page)).frame).toBe(`chest:${chest[0]}`);

  const array = await page.evaluate(() => window.__sim!().world.peaks[0]!.arrays[0]!.pos);
  await clickWorld(page, array, 0.25);
  expect(await detailKind(page)).toBe('array');
  await expect(page.locator('[data-hud="detail"]')).toContainText('Tụ Linh Trận · PH-01');

  const plaza = await page.evaluate(() => {
    const p = window.__sim!().world.peaks[0]!;
    return p.geometry.yardSlots[0]!.map((v, i) => (v + p.geometry.home[i]!) / 2); // open plaza between yard and home
  });
  await clickWorld(page, [plaza[0]! + 3, plaza[1]!, plaza[2]! + 6]);
  expect(await detailKind(page)).toBe('peak');

  await page.keyboard.press('Escape');
  await settle(page);
  expect((await overlay(page)).frame).toBeNull();
  await expect(page.locator('[data-hud="detail"]')).toContainText('Chủ phong · PH-01');
});

test('hover shows a floating chip and the bát quái ring under pads; an empty pad opens the peak card at Phi chu đài', async ({ page }) => {
  await pause(page);
  await settle(page);
  const worker = await page.evaluate(() => [...window.__render!.workers.entries()][0]!);
  const w = await screenOf(page, worker[1].pos, 1.4);
  await page.mouse.move(w.x, w.y);
  await expect(page.locator('[data-scene-label="hovered"]')).toContainText(`${worker[0]} · `);

  const pad = await page.evaluate(() => {
    const p = window.__sim!().world.peaks[0]!;
    const free = p.pads.find((x) => x.state === 'free')!;
    return { id: free.id, label: free.label, pos: free.pos };
  });
  const pp = await screenOf(page, pad.pos, 0.2);
  await page.mouse.move(pp.x, pp.y);
  await settle(page);
  expect((await overlay(page)).ring).toBe(`PH-01/${pad.id}`);
  await expect(page.locator('[data-scene-label="pad"]')).toHaveText(`${pad.label} · Sẵn sàng`);
  await page.mouse.click(pp.x, pp.y);
  await settle(page);
  expect(await detailKind(page)).toBe('peak');
  await expect(page.locator('[data-hud="detail"] [data-anchor="pads"]')).toBeInViewport();
});

test('board, search and Định vị all select the same thing the scene frames, and the camera flies there', async ({ page }) => {
  await pause(page);
  await page.getByRole('tab', { name: /Đệ tử/ }).click();
  await page.locator('[data-tab="workers"] [data-row="DT-03"]').click();
  await page.waitForTimeout(1500);
  expect((await overlay(page)).frame).toBe('worker:DT-03');
  const near = await page.evaluate(() => {
    const t = window.__view!.target;
    const p = window.__render!.workers.get('DT-03')!.pos;
    return Math.hypot(t[0] - p[0], t[2] - p[2]);
  });
  expect(near).toBeLessThan(2);

  await page.keyboard.press('/');
  await page.keyboard.type('huyet linh chi');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const chestId = await page.evaluate(() => window.__overlay!.frame);
  expect(chestId).toMatch(/^chest:R-\d+$/);
  await expect(page.locator('[data-hud="detail"]')).toContainText(chestId!.replace('chest:', ''));

  // pan away, then "Định vị" brings the camera back to the selection
  await page.mouse.move(400, 400);
  await page.mouse.down();
  await page.mouse.move(700, 600, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Định vị' }).click();
  await page.waitForTimeout(1500);
  const back = await page.evaluate((id) => {
    const t = window.__view!.target;
    const p = window.__render!.chests.get(id)!;
    return Math.hypot(t[0] - p[0], t[2] - p[2]);
  }, chestId!.replace('chest:', ''));
  expect(back).toBeLessThan(2);
});

test('incoming ship: flight path, barrier ripple at the gate, and no crash when it leaves while selected', async ({ page }) => {
  test.setTimeout(240_000);
  await speed(page, 60);
  await page.waitForFunction(() => [...window.__sim!().world.ships.values()].some((s) => s.homePeakId === 'PH-01' && s.state === 'sailing'), null, { timeout: 120_000 });
  const shipId = await page.evaluate(() => [...window.__sim!().world.ships.values()].find((s) => s.homePeakId === 'PH-01' && s.state === 'sailing')!.id);
  await page.getByRole('tab', { name: /Linh chu/ }).click();
  await page.locator(`[data-tab="ships"] [data-row="${shipId}"]`).click();
  await expect.poll(async () => (await overlay(page)).path).toMatch(/solid|both/);

  const ripplesBefore = await page.evaluate(() => window.__barrier!.ripples);
  await page.waitForFunction((id) => window.__sim!().world.ships.get(id)?.state === 'landing', shipId, { timeout: 120_000 });
  expect(await page.evaluate(() => window.__barrier!.ripples)).toBeGreaterThan(ripplesBefore);
  await expect.poll(async () => (await overlay(page)).path).toBe('dashed');

  await page.waitForFunction((id) => window.__sim!().world.ships.get(id)?.peakId == null, shipId, { timeout: 180_000 });
  await settle(page);
  expect((await overlay(page)).frame).toBeNull();
  await expect(page.locator('[data-hud="detail"] [data-departed]')).toContainText('Đã rời PH-01');
});
