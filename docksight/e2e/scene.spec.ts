import { expect, test } from '@playwright/test';

test('static scene renders with instanced repeats and DPR ≤ 1.5', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  const inst = await page.evaluate(() => window.__instanced!());
  for (const name of ['trees-small', 'trees-large', 'tree-trunks', 'fence-posts', 'road-dashes', 'bay-lines', 'wall-ribs']) {
    expect(inst[name], name).toBeGreaterThan(1);
  }
  expect(inst['trees-small']! + inst['trees-large']!).toBe(inst['tree-trunks']);
  expect(await page.evaluate(() => window.__perf!.dpr)).toBeLessThanOrEqual(1.5);
  expect(await page.evaluate(() => window.__named!('site:'))).toEqual(['site:WH-01']);
});

test('dragging over the empty middle of the HUD reaches the canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(() => window.__view !== undefined, null, { timeout: 30_000 });
  const hit = await page.evaluate(() => document.elementFromPoint(600, 450)?.tagName);
  expect(hit).toBe('CANVAS');
});
