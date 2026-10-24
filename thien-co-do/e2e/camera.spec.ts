import { expect, test, type Page } from '@playwright/test';

const view = (page: Page) => page.evaluate(() => window.__view!);
/** Waits until the camera has been still for 5 consecutive samples (software GL renders slowly). */
const settle = async (page: Page) => {
  await page.waitForFunction(() => window.__view !== undefined);
  let prev = await view(page);
  let still = 0;
  for (let i = 0; i < 80 && still < 5; i++) {
    await page.waitForTimeout(150);
    const next = await view(page);
    const same = Math.abs(next.azimuth - prev.azimuth) < 1e-4 && Math.abs(next.distance - prev.distance) < 1e-3;
    still = same ? still + 1 : 0;
    prev = next;
  }
  return prev;
};

test.use({ viewport: { width: 1440, height: 900 } });

test('map buttons zoom, rotate in 90° steps and reset; tilt stays 35–50°', async ({ page }) => {
  await page.goto('/');
  const home = await settle(page);
  expect(90 - (home.polar * 180) / Math.PI).toBeGreaterThanOrEqual(35);
  expect(90 - (home.polar * 180) / Math.PI).toBeLessThanOrEqual(50);

  await page.click('[data-map-action="zoom-in"]');
  const zoomed = await settle(page);
  expect(zoomed.distance).toBeLessThan(home.distance - 10);

  await page.click('[data-map-action="zoom-out"]');
  await page.click('[data-map-action="zoom-out"]');
  expect((await settle(page)).distance).toBeGreaterThan(zoomed.distance);

  await page.click('[data-map-action="rotate-right"]');
  const r = await settle(page);
  expect(((r.azimuth - home.azimuth) * 180) / Math.PI).toBeCloseTo(90, 0);

  await page.click('[data-map-action="rotate-left"]');
  await page.click('[data-map-action="rotate-left"]');
  const l = await settle(page);
  expect(((l.azimuth - home.azimuth) * 180) / Math.PI).toBeCloseTo(-90, 0);

  await page.click('[data-map-action="reset"]');
  const back = await settle(page);
  expect(back.azimuth).toBeCloseTo(home.azimuth, 3);
  expect(back.distance).toBeCloseTo(home.distance, 1);
});

test('wheel zoom is clamped and drag pans without leaving the peak', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const home = await settle(page);
  await page.mouse.move(700, 450);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -4000);
  expect((await settle(page)).distance).toBeGreaterThanOrEqual(27.9);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 4000);
  expect((await settle(page)).distance).toBeLessThanOrEqual(260.1); // VIEW.distanceMax

  // Drag far in one direction several times: the target must stay inside the pan box.
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(300, 300);
    await page.mouse.down();
    await page.mouse.move(1000, 700, { steps: 4 });
    await page.mouse.up();
  }
  const panned = await settle(page);
  const dx = Math.abs(panned.target[0] - home.target[0]);
  const dz = Math.abs(panned.target[2] - home.target[2]);
  expect(dx + dz).toBeGreaterThan(5); // it did pan
  expect(Math.max(dx, dz)).toBeLessThanOrEqual(70 + 1); // VIEW.panHalfExtent
});
