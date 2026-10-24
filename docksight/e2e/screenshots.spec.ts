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
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
    await page.waitForTimeout(800); // camera smoothing settles
    await page.screenshot({ path: `evidence/${phase}/hud-${vp.width}x${vp.height}.png` });
  });
}

test('screenshot close-up after zooming in', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  for (let i = 0; i < 4; i++) await page.click('[data-map-action="zoom-in"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/closeup-1440x900.png` });
});

test('screenshot live activity at the docks', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => {
      const { world } = window.__sim!();
      const busy = [...world.trucks.values()].some((t) => t.siteId === 'WH-01' && (t.state === 'loading' || t.state === 'unloading'));
      return busy && [...world.forklifts.values()].some((f) => f.carrying);
    },
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  for (let i = 0; i < 2; i++) await page.click('[data-map-action="zoom-in"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/activity-1440x900.png` });
});

test('screenshot detail variants, search and notifications', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => [...window.__sim!().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.state === 'loading' && t.cargo.pallets >= 2),
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  const shot = (name: string) => page.screenshot({ path: `evidence/${phase}/${name}-1440x900.png` });
  const pick = async (sel: { kind: string; id: string }) => {
    await page.evaluate((s) => window.__selection!().select(s as never), sel);
    await page.waitForTimeout(500);
  };

  const truck = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && t.state === 'loading')!.id);
  await page.getByRole('tab', { name: /Trucks/ }).click();
  await page.locator(`[data-tab="trucks"] [data-row="${truck}"]`).click();
  await page.waitForTimeout(500);
  await shot('detail-truck');
  await page.getByRole('tab', { name: /Forklifts/ }).click();
  await pick({ kind: 'forklift', id: 'FL-01' });
  await shot('detail-forklift');
  await pick({ kind: 'pallet', id: 'PAL-1026' });
  await shot('detail-pallet');
  await pick({ kind: 'charger', id: 'WH-01/C1' });
  await shot('detail-charger');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(400);
  await shot('detail-site');

  await page.keyboard.press('/');
  await page.keyboard.type('trk');
  await page.waitForTimeout(300);
  await shot('search');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.waitForTimeout(300);
  await shot('notifications');
});

test('screenshot rotated 90°', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.click('[data-map-action="rotate-right"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/rotated-1440x900.png` });
});
