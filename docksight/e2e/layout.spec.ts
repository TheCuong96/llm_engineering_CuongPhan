import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const REGIONS = ['topbar', 'kpi', 'map-controls', 'detail', 'tracking', 'fleet'] as const;
type Box = { x: number; y: number; width: number; height: number };

async function boxes(page: Page) {
  const out = {} as Record<(typeof REGIONS)[number], Box>;
  for (const r of REGIONS) {
    const b = await page.locator(`[data-region="${r}"]`).boundingBox();
    expect(b, `region ${r} rendered`).not.toBeNull();
    out[r] = b!;
  }
  return out;
}

const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

for (const vp of viewports) {
  test(`HUD layout matches spec section 3 at ${vp.width}x${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/');
    const b = await boxes(page);

    // No two HUD regions overlap.
    for (let i = 0; i < REGIONS.length; i++)
      for (let j = i + 1; j < REGIONS.length; j++)
        expect(overlaps(b[REGIONS[i]!], b[REGIONS[j]!]), `${REGIONS[i]} vs ${REGIONS[j]}`).toBe(false);

    // Proportions from the spec: detail ~23%, tracking ~60%, fleet ~30% of the width.
    expect(b.detail.width / vp.width).toBeCloseTo(0.23, 1);
    expect(b.tracking.width / vp.width).toBeCloseTo(0.6, 1);
    expect(b.fleet.width / vp.width).toBeCloseTo(0.3, 1);

    // Placement: top bar spans the top; KPI top-left under it; controls hug the detail panel's left edge;
    // detail sits above the fleet board on the right; tracking bottom-left, fleet bottom-right.
    expect(b.topbar.y).toBeLessThan(20);
    expect(b.topbar.width).toBeGreaterThan(vp.width * 0.95);
    expect(b.kpi.x).toBeLessThan(24);
    expect(b.kpi.y).toBeGreaterThan(b.topbar.y + b.topbar.height);
    expect(b.detail.x - (b['map-controls'].x + b['map-controls'].width)).toBeLessThan(24);
    expect(vp.width - (b.detail.x + b.detail.width)).toBeLessThan(24);
    expect(b.detail.y + b.detail.height).toBeLessThan(b.fleet.y);
    expect(vp.height - (b.tracking.y + b.tracking.height)).toBeLessThan(24);
    expect(vp.width - (b.fleet.x + b.fleet.width)).toBeLessThan(24);
    expect(b.tracking.x + b.tracking.width).toBeLessThan(b.fleet.x);
  });
}

test('Inter is the loaded UI font', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('16px "Inter Variable"'))).toBe(true);
});
