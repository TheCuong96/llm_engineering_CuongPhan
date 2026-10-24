import { test } from '@playwright/test';

// Evidence for each phase: PHASE=P0 npm run shots
const phase = process.env.PHASE ?? 'dev';
// Full quality: on software GL the governor would otherwise drop AO, bloom and shadows within seconds.
const HOME = '/?autoQuality=off';
// Full post-processing costs seconds per frame on SwiftShader, which also slows the rAF-driven sim.
// Shots about HUD state or sim activity use the no-post level; the hero shots keep full quality.
const FAST = '/?autoQuality=off&quality=2';
test.setTimeout(120_000);
const viewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

for (const vp of viewports) {
  test(`screenshot ${vp.width}x${vp.height}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto(HOME);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
    await page.waitForTimeout(800); // camera smoothing settles
    await page.screenshot({ path: `evidence/${phase}/hud-${vp.width}x${vp.height}.png` });
  });
}

test('screenshot close-up after zooming in', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(HOME);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  for (let i = 0; i < 4; i++) await page.click('[data-map-action="zoom-in"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/closeup-1440x900.png` });
});

test('screenshot live activity at the docks', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(FAST);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => {
      const { world } = window.__sim!();
      const busy = [...world.trucks.values()].some((t) => t.siteId === 'WH-01' && (t.state === 'loading' || t.state === 'unloading'));
      return busy && [...world.forklifts.values()].some((f) => f.carrying);
    },
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  for (let i = 0; i < 2; i++) await page.click('[data-map-action="zoom-in"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/activity-1440x900.png` });
});

test('screenshot detail variants, search and notifications', async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(FAST);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(
    () => [...window.__sim!().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.state === 'loading' && t.cargo.pallets >= 2),
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  const shot = (name: string) => page.screenshot({ path: `evidence/${phase}/${name}-1440x900.png` });
  const pick = async (sel: { kind: string; id: string }) => {
    await page.evaluate((s) => window.__selection!().select(s as never), sel);
    await page.waitForTimeout(500);
  };

  const truck = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && t.state === 'loading')!.id);
  await page.getByRole('tab', { name: /Trucks/ }).click();
  await page.locator(`[data-tab="trucks"] [data-row="${truck}"]`).click();
  await page.waitForTimeout(500);
  await shot('detail-truck');
  await page.getByRole('tab', { name: /Forklifts/ }).click();
  await pick({ kind: 'forklift', id: 'FL-01' });
  await shot('detail-forklift');
  await pick({ kind: 'pallet', id: 'PAL-1026' });
  await shot('detail-pallet');
  await pick({ kind: 'charger', id: 'WH-01/C1' });
  await shot('detail-charger');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(400);
  await shot('detail-site');

  await page.keyboard.press('/');
  await page.keyboard.type('trk');
  await page.waitForTimeout(300);
  await shot('search');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /Notifications/ }).click();
  await page.waitForTimeout(300);
  await shot('notifications');
});

test('screenshot selection overlays (frame + chip, route, dock plate, departed card)', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(FAST);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  const run = async (cond: string) => {
    await page.evaluate(() => {
      window.__sim!().clock.paused = false;
      window.__sim!().clock.setSpeed(60);
    });
    await page.waitForFunction(cond, null, { timeout: 120_000 });
    await page.evaluate(() => (window.__sim!().clock.paused = true));
  };

  // Incoming truck: route to the gate, dashed leg to the pin in its bay.
  await run(`[...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.state === 'en_route' && t.dockId === undefined) || [...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.state === 'at_gate' && t.dockId)`);
  const incoming = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && (t.state === 'en_route' || t.state === 'at_gate'))!.id);
  await page.evaluate((id) => window.__selection!().select({ kind: 'truck', id }), incoming);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `evidence/${phase}/route-1440x900.png` });

  // Forklift at work: corner frame + floating chip.
  await page.keyboard.press('Escape');
  await run(`[...window.__sim().world.forklifts.values()].some((f) => f.carrying)`);
  const fl = await page.evaluate(() => [...window.__sim!().world.forklifts.values()].find((f) => f.carrying)!.id);
  await page.evaluate((id) => window.__selection!().select({ kind: 'forklift', id }), fl);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `evidence/${phase}/selected-forklift-1440x900.png` });

  // Hover an empty dock: blue plate and "Bay n · Available".
  await page.keyboard.press('Escape');
  const dock = await page.evaluate(() => {
    const d = window.__sim!().world.sites[0]!.docks.find((x) => x.state === 'available') ?? window.__sim!().world.sites[0]!.docks[0]!;
    return window.__project!([d.pos[0], 0.3, d.pos[2]]);
  });
  await page.mouse.move(dock.x, dock.y);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `evidence/${phase}/dock-hover-1440x900.png` });

  // An outbound truck drives off: the card dims with "Left WH-01 · heading to …".
  await page.mouse.move(5, 450);
  await run(`[...window.__sim().world.trucks.values()].some((t) => t.siteId === 'WH-01' && t.direction === 'outbound' && t.state === 'departing')`);
  const leaving = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && t.direction === 'outbound' && t.state === 'departing')!.id);
  await page.evaluate((id) => window.__selection!().select({ kind: 'truck', id }), leaving);
  await run(`window.__sim().world.trucks.get('${leaving}')?.state === 'in_transit'`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `evidence/${phase}/departed-1440x900.png` });
});

test('screenshot every site, and the camera mid-flight between two', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(FAST);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  // Let every site get some traffic first, then freeze so the shots are steady.
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.__sim!().clock.setSpeed(1));
  for (const id of ['WH-02', 'WH-03', 'WH-04', 'WH-05', 'WH-01']) {
    await page.getByRole('button', { name: /choose site/ }).click();
    await page.locator(`[data-site-option="${id}"]`).click();
    if (id === 'WH-03') {
      await page.waitForTimeout(600);
      await page.screenshot({ path: `evidence/${phase}/flight-midway-1440x900.png` });
    }
    await page.waitForFunction(() => window.__view?.flying === false, null, { timeout: 10_000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `evidence/${phase}/site-${id}-1440x900.png` });
  }
});

test('screenshot rotated 90°', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(HOME);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  await page.click('[data-map-action="rotate-right"]');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `evidence/${phase}/rotated-1440x900.png` });
});

test('screenshot P7 states: phone sheet, empty search, no WebGL, quality steps', async ({ page }) => {
  test.setTimeout(180_000);
  const ready = () => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
  const shot = (name: string) => page.screenshot({ path: `evidence/${phase}/${name}.png` });

  // Each quality step, same frame, so the difference is visible side by side.
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const level of [0, 2, 3]) {
    await page.goto(`/?autoQuality=off&quality=${level}`);
    await ready();
    await page.evaluate(() => (window.__sim!().clock.paused = true));
    await page.waitForTimeout(1500);
    await shot(`quality-${level}-1440x900`);
  }

  await page.goto(HOME);
  await ready();
  await page.keyboard.press('/');
  await page.keyboard.type('zzzz');
  await page.waitForTimeout(300);
  await shot('empty-search-1440x900');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(HOME);
  await ready();
  await page.waitForTimeout(1500);
  await shot('phone-sheet-390x844');
  await page.getByRole('tab', { name: 'Fleet' }).click();
  await page.waitForTimeout(400);
  await shot('phone-fleet-390x844');
  await page.locator('[data-tab="docks"] [data-row]').first().click();
  await page.locator('[data-sheet-toggle]').click();
  await page.waitForTimeout(600);
  await shot('phone-expanded-390x844');
});

test('screenshot the no-WebGL fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const real = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error -- test shim
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      return /webgl/.test(type) ? null : real.call(this, type, ...(rest as []));
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(HOME);
  await page.locator('[data-scene-error]').waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `evidence/${phase}/no-webgl-1440x900.png` });
});
