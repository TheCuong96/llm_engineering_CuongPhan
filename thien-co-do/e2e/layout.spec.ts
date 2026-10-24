import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

async function box(page: Page, region: string) {
  const b = await page.locator(`[data-hud="${region}"]`).boundingBox();
  if (!b) throw new Error(`missing HUD region ${region}`);
  return b;
}

for (const vp of viewports) {
  test.describe(`HUD layout ${vp.width}×${vp.height}`, () => {
    test.use({ viewport: vp });

    test('regions sit where spec §3 puts them', async ({ page }) => {
      await page.goto('/');
      const W = vp.width;
      const H = vp.height;
      const top = await box(page, 'top-bar');
      const kpi = await box(page, 'kpi');
      const controls = await box(page, 'map-controls');
      const detail = await box(page, 'detail');
      const order = await box(page, 'order');
      const dispatch = await box(page, 'dispatch');

      expect(top.y).toBeLessThan(16);
      expect(top.width).toBeGreaterThan(W * 0.95);

      expect(kpi.x).toBeLessThan(24);
      expect(kpi.y).toBeGreaterThanOrEqual(top.y + top.height);
      await expect(page.locator('[data-kpi]')).toHaveCount(3);

      expect(detail.x + detail.width).toBeGreaterThan(W - 24);
      expect(detail.width / W).toBeCloseTo(0.24, 2);
      expect(detail.y).toBeGreaterThanOrEqual(top.y + top.height);

      await expect(page.locator('[data-hud="map-controls"] button')).toHaveCount(6);
      expect(controls.x + controls.width).toBeLessThanOrEqual(detail.x);
      expect(detail.x - (controls.x + controls.width)).toBeLessThan(24);

      expect(order.x).toBeLessThan(24);
      expect(order.y + order.height).toBeGreaterThan(H - 24);
      expect(order.width / W).toBeCloseTo(0.6, 2);

      expect(dispatch.x + dispatch.width).toBeGreaterThan(W - 24);
      expect(dispatch.y + dispatch.height).toBeGreaterThan(H - 24);
      expect(dispatch.width / W).toBeGreaterThan(0.26);
      expect(dispatch.width / W).toBeLessThan(0.31);
      await expect(page.getByRole('tab')).toHaveCount(3);

      // Nothing overlaps: detail stops above dispatch, order stops left of dispatch.
      expect(detail.y + detail.height).toBeLessThanOrEqual(dispatch.y);
      expect(order.x + order.width).toBeLessThanOrEqual(dispatch.x);
    });
  });
}

test('Vietnamese glyphs load from the vietnamese subset in both fonts', async ({ page }) => {
  await page.goto('/?glyphs');
  const sample = 'Đữỡặỷ';
  const result = await page.evaluate(async (text) => {
    const check = async (font: string) => {
      const faces = await document.fonts.load(font, text);
      return faces.map((f) => ({ family: f.family, range: f.unicodeRange, status: f.status }));
    };
    return { serif: await check('600 28px "Noto Serif"'), sans: await check('400 28px "Be Vietnam Pro"') };
  }, sample);

  for (const faces of [result.serif, result.sans]) {
    const vietnamese = faces.find((f) => f.range.toUpperCase().includes('U+1EA0-1EF9'));
    expect(vietnamese, JSON.stringify(faces)).toBeDefined();
    expect(vietnamese!.status).toBe('loaded');
  }
});
