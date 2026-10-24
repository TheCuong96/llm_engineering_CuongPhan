import { test } from '@playwright/test';

// Evidence for each phase: PHASE=P0 npm run shots
const phase = process.env.PHASE ?? 'dev';
const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const vp of viewports) {
  test(`screenshot ${vp.width}x${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/?autoQuality=off');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
    await page.screenshot({ path: `evidence/${phase}/hud-${vp.width}x${vp.height}.png` });
  });
}

test('screenshot glyph sample', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?glyphs&autoQuality=off');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-hud="glyphs"]').screenshot({ path: `evidence/${phase}/glyphs.png` });
});

test('screenshot close-up after zooming in', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?autoQuality=off');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  for (let i = 0; i < 4; i++) await page.click('[data-map-action="zoom-in"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/closeup-1440x900.png` });
});

test('screenshot live activity at the pads', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?autoQuality=off');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => {
      const { world } = window.__sim!();
      const busy = [...world.ships.values()].some((s) => s.homePeakId === 'PH-01' && (s.state === 'loading' || s.state === 'unloading'));
      const carrying = [...world.workers.values()].filter((w) => w.peakId === 'PH-01' && w.carrying).length;
      return busy && carrying >= 1;
    },
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  for (let i = 0; i < 2; i++) await page.click('[data-map-action="zoom-in"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/activity-1440x900.png` });
});

test('screenshot detail variants (ship, worker, chest, array)', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?autoQuality=off');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => [...window.__sim!().world.ships.values()].some((s) => s.homePeakId === 'PH-01' && s.state === 'loading' && s.cargo.chests >= 2),
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  const ship = await page.evaluate(() => [...window.__sim!().world.ships.values()].find((s) => s.homePeakId === 'PH-01' && s.state === 'loading')!.id);
  await page.getByRole('tab', { name: /Linh chu/ }).click();
  await page.locator(`[data-tab="ships"] [data-row="${ship}"]`).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `evidence/${phase}/detail-ship-1440x900.png` });

  await page.getByRole('tab', { name: /Đệ tử/ }).click();
  await page.locator('[data-tab="workers"] [data-row="DT-07"]').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `evidence/${phase}/detail-worker-1440x900.png` });

  await page.keyboard.press('/');
  await page.keyboard.type('huyet linh chi');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `evidence/${phase}/detail-chest-1440x900.png` });

  await page.keyboard.press('/');
  await page.keyboard.type('tu van');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `evidence/${phase}/search-1440x900.png` });
});

test('screenshot selection overlays (rune frame, chip, flight path, pad ring)', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?autoQuality=off');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => [...window.__sim!().world.ships.values()].some((s) => s.homePeakId === 'PH-01' && s.state === 'at_barrier' && s.padId),
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => (window.__sim!().clock.paused = true));
  const ship = await page.evaluate(() => [...window.__sim!().world.ships.values()].find((s) => s.homePeakId === 'PH-01' && s.state === 'at_barrier')!.id);
  await page.getByRole('tab', { name: /Linh chu/ }).click();
  await page.locator(`[data-tab="ships"] [data-row="${ship}"]`).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `evidence/${phase}/selected-ship-path-1440x900.png` });

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Về góc nhìn gốc' }).click();
  await page.waitForTimeout(1200);
  const worker = await page.evaluate(() => [...window.__render!.workers.entries()][0]!);
  const w = await page.evaluate((p) => window.__project!([p[0]!, p[1]! + 1.4, p[2]!]), worker[1].pos);
  await page.mouse.click(w.x, w.y);
  const pad = await page.evaluate(() => window.__sim!().world.peaks[0]!.pads.find((p) => p.state === 'free')?.pos ?? window.__sim!().world.peaks[0]!.pads[0]!.pos);
  const pp = await page.evaluate((p) => window.__project!([p[0]!, p[1]! + 0.2, p[2]!]), pad);
  await page.mouse.move(pp.x, pp.y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `evidence/${phase}/selected-worker-pad-hover-1440x900.png` });
});

test('screenshot sect overview and a far peak with its landmark', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?autoQuality=off');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForTimeout(8000);
  await page.getByRole('button', { name: 'Toàn cảnh tông môn' }).click();
  await page.waitForFunction(() => window.__view!.mode === 'overview' && !window.__view!.flying, null, { timeout: 10_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `evidence/${phase}/overview-1440x900.png` });
  for (const id of ['PH-03', 'PH-02', 'PH-05', 'PH-04']) {
    // the button toggles, so only press it when not already in the overview
    if ((await page.evaluate(() => window.__view!.mode)) !== 'overview') await page.getByRole('button', { name: 'Toàn cảnh tông môn' }).click();
    await page.waitForFunction(() => window.__view!.mode === 'overview' && !window.__view!.flying, null, { timeout: 10_000 });
    await page.locator(`[data-overview-peak="${id}"]`).click();
    await page.waitForFunction(() => window.__view!.mode === 'peak' && !window.__view!.flying, null, { timeout: 10_000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `evidence/${phase}/peak-${id}-1440x900.png` });
  }
});
