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
    await page.screenshot({ path: `evidence/${phase}/hud-${vp.width}x${vp.height}.png` });
  });
}
