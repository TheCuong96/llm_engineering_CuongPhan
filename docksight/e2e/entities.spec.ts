import { expect, test, type Page } from '@playwright/test';

const ready = (page: Page) => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });

test.use({ viewport: { width: 1440, height: 900 } });

test('repeated props and pallets are instanced', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const inst = await page.evaluate(() => window.__instanced!());
  for (const name of ['rack-uprights', 'rack-beams', 'rack-cartons', 'charger-bodies', 'container-ribs', 'pallet-bases', 'pallet-loads', 'pin-heads']) {
    expect(inst[name], name).toBeGreaterThan(0);
  }
  // Three pallets wait in the yard at start, each with a locator pin.
  expect(await page.evaluate(() => window.__render!.counts)).toMatchObject({ pallets: 3, pins: 3 });
});

test('drawn trucks and forklifts follow the engine, and a carried pallet rides the forks', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));

  // A truck backed into its bay is drawn on the dock, squared up with the bay lines.
  await page.waitForFunction(
    () => [...window.__sim!().world.trucks.values()].some((t) => t.siteId === 'WH-01' && (t.state === 'loading' || t.state === 'unloading')),
    null,
    { timeout: 120_000 },
  );
  await page.waitForTimeout(300);
  const docked = await page.evaluate(() => {
    const { world } = window.__sim!();
    const t = [...world.trucks.values()].find((x) => x.siteId === 'WH-01' && (x.state === 'loading' || x.state === 'unloading'))!;
    const dock = world.sites[0]!.docks.find((d) => d.id === t.dockId)!;
    const drawn = window.__render!.trucks.get(t.id)!;
    return { dock: dock.pos, drawn: drawn.pos, heading: drawn.heading };
  });
  expect(Math.hypot(docked.drawn[0] - docked.dock[0], docked.drawn[2] - docked.dock[2])).toBeLessThan(0.05);
  expect(Math.cos(docked.heading)).toBeCloseTo(1, 3);

  // Every drawn truck is within one tick's travel of its engine position (interpolation, not drift).
  const gaps = await page.evaluate(() => {
    const { world } = window.__sim!();
    return [...window.__render!.trucks.entries()].map(([id, p]) => {
      const t = world.trucks.get(id)!;
      return Math.hypot(p.pos[0] - t.pos[0], p.pos[2] - t.pos[2]) / Math.max(t.speedKmh / 3.6, 1);
    });
  });
  for (const g of gaps) expect(g).toBeLessThanOrEqual(0.1 + 1e-6); // seconds of travel ≤ one 0.1 s tick

  // A pallet on the forks is drawn exactly where the forks are in the same frame.
  await page.waitForFunction(() => [...window.__sim!().world.forklifts.values()].some((f) => f.carrying), null, { timeout: 120_000 });
  await page.evaluate(() => (window.__sim!().clock.paused = true));
  await page.waitForTimeout(300);
  const fork = await page.evaluate(() => {
    const fl = [...window.__sim!().world.forklifts.values()].find((f) => f.carrying)!;
    return { forklift: window.__render!.forklifts.get(fl.id)!, pallet: window.__render!.pallets.get(fl.carrying!)! };
  });
  const [fx, , fz] = fork.forklift.pos;
  const h = fork.forklift.heading;
  // FORKS = [0, 0.35, 1.75] rotated by the heading.
  expect(fork.pallet[0]).toBeCloseTo(fx + 1.75 * Math.sin(h), 3);
  expect(fork.pallet[2]).toBeCloseTo(fz + 1.75 * Math.cos(h), 3);
});

test('the simulation keeps running and the clock is live', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const t0 = await page.evaluate(() => window.__sim!().world.t);
  await page.waitForTimeout(1500);
  const t1 = await page.evaluate(() => window.__sim!().world.t);
  expect(t1 - t0).toBeGreaterThan(10); // default 12×: ~18 sim seconds in 1.5 s
  expect(await page.evaluate(() => window.__sim!().clock.speed)).toBe(12);
});
