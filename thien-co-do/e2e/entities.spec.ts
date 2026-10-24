import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const ready = (page: Page) => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });

/** Snapshot engine vs render in the same JS turn, so both describe the same frame. */
const snapshot = (page: Page) =>
  page.evaluate(() => {
    const { world, viewPeakId } = window.__sim!();
    const r = window.__render!;
    const ships = [...world.ships.values()]
      .filter((s) => s.homePeakId === viewPeakId && s.peakId !== null)
      .map((s) => ({ id: s.id, state: s.state, pos: s.pos, speed: s.speedMps, rendered: r.ships.get(s.id)?.pos ?? null }));
    const workers = [...world.workers.values()]
      .filter((w) => w.peakId === viewPeakId)
      .map((w) => ({ id: w.id, state: w.state, pos: w.pos, moving: Boolean(w.motion), speed: w.speedKmh / 3.6, rendered: r.workers.get(w.id)?.pos ?? null }));
    const chestsOnPeak = [...world.chests.values()].filter((c) => {
      if (c.location.kind === 'slot') return c.peakId === viewPeakId;
      if (c.location.kind === 'worker') return world.workers.get(c.location.ref)?.peakId === viewPeakId;
      const s = world.ships.get(c.location.ref);
      return s?.homePeakId === viewPeakId && s.peakId !== null;
    }).length;
    return { t: world.t, ships, workers, chestsOnPeak, counts: { ...r.counts }, instanced: window.__instanced!() };
  });

const dist = (a: number[], b: number[]) => Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!);

test('ships, workers and chests are drawn where the engine says they are', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  // wait for real activity: a ship being worked and someone carrying a chest
  await page.waitForFunction(
    () => {
      const { world } = window.__sim!();
      return [...world.ships.values()].some((s) => s.homePeakId === 'PH-01' && (s.state === 'loading' || s.state === 'unloading'))
        && [...world.workers.values()].some((w) => w.peakId === 'PH-01' && w.carrying);
    },
    null,
    { timeout: 90_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  await page.waitForTimeout(400);

  for (let i = 0; i < 5; i++) {
    const s = await snapshot(page);
    expect(s.ships.length).toBeGreaterThan(0);
    for (const ship of s.ships) {
      expect(ship.rendered, `${ship.id} rendered`).not.toBeNull();
      // render = engine pos advanced by < 1 tick, plus bob (≤ 0.25 m)
      expect(dist(ship.rendered!, ship.pos), `${ship.id} in ${ship.state}`).toBeLessThan(ship.speed * 0.1 + 0.3);
    }
    for (const w of s.workers) {
      expect(w.rendered, `${w.id} rendered`).not.toBeNull();
      // idle figures fan out 1.6 m from the shared home point; moving ones stay within a tick
      const tolerance = w.moving ? w.speed * 0.1 + 0.05 : 1.7;
      expect(dist(w.rendered!, w.pos), `${w.id} in ${w.state}`).toBeLessThan(tolerance);
    }
    expect(s.counts.chests, `chests drawn at t=${s.t}`).toBe(s.chestsOnPeak);
    await page.waitForTimeout(300);
  }
});

test('repeated props are instanced', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const instanced = await page.evaluate(() => window.__instanced!());
  expect(instanced['clouds']).toBeGreaterThan(200);
  expect(instanced['clouds']).toBeLessThanOrEqual(300);
  expect(instanced['pine-crowns']).toBeGreaterThan(15);
  expect(instanced['chest-bodies']).toBeGreaterThan(0);
  expect(Object.keys(instanced)).toEqual(expect.arrayContaining(['pine-trunks', 'chest-bands', 'talismans', 'qi-motes']));
});
