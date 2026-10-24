import { expect, test } from '@playwright/test';

// A browser without WebGL: the scene explains itself, everything else keeps working.
test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ['--disable-webgl', '--disable-3d-apis', '--disable-gpu'] },
});

test('without WebGL the scene shows a notice; simulation, board and search still work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-scene-error="webgl"]')).toContainText('Không mở được sa bàn 3D');
  const t0 = await page.evaluate(() => window.__sim!().world.t);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__sim!().world.t)).toBeGreaterThan(t0);
  await expect(page.locator('[data-kpi="chests"] [data-kpi-value]')).toHaveText(/^1,4\d\d$/);
  await page.getByRole('tab', { name: /Đệ tử/ }).click();
  await page.locator('[data-row="DT-07"]').click();
  await expect(page.locator('[data-hud="detail"]')).toContainText('DT-07, Trần Bình');
  await page.keyboard.press('/');
  await page.keyboard.type('dan ha');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-hud="peak-switcher"]')).toContainText('PH-02');
});
