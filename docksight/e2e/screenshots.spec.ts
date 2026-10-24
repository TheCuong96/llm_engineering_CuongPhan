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

test('screenshot rotated 90°', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.click('[data-map-action="rotate-right"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/rotated-1440x900.png` });
});
