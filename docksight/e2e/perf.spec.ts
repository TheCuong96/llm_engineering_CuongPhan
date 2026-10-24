import { expect, test } from '@playwright/test';

// P2 budget: ≥ 55 fps at 1080p with DPR ≤ 1.5. Needs a real GPU, so it runs headed and
// only on request: PERF=1 npx playwright test e2e/perf.spec.ts
test.skip(!process.env.PERF, 'set PERF=1 to measure on real hardware');
test.use({
  headless: false,
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1.5,
  launchOptions: { args: ['--disable-frame-rate-limit', '--disable-gpu-vsync'] },
});

test('sustains ≥ 55 fps at 1920×1080, DPR 1.5', async ({ page }) => {
  // Full quality with the governor off: the budget must hold with AO, bloom and tilt-shift on.
  await page.goto('/?perf&autoQuality=off');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 120, null, { timeout: 30_000 });
  const samples: number[] = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(1000);
    samples.push(await page.evaluate(() => window.__perf!.fps));
  }
  // Rotate during the last samples: the criterion is "xoay mượt", not just a still frame.
  for (let i = 0; i < 4; i++) {
    await page.click('[data-map-action="rotate-right"]');
    await page.waitForTimeout(1000);
    samples.push(await page.evaluate(() => window.__perf!.fps));
  }
  const info = await page.evaluate(() => window.__perf!);
  expect(await page.evaluate(() => window.__quality!().post)).toBe(true);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const min = Math.min(...samples);
  console.log(JSON.stringify({ renderer: info.renderer, dpr: info.dpr, calls: info.calls, triangles: info.triangles, avg, min, samples }));
  await page.screenshot({ path: `evidence/${process.env.PHASE ?? 'dev'}/perf-1920x1080.png` });
  expect(info.dpr).toBeLessThanOrEqual(1.5);
  expect(min).toBeGreaterThanOrEqual(55);
});
