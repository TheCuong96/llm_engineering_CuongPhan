import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const ready = (page: Page) => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
const quality = (page: Page) => page.evaluate(() => window.__quality!());

/** Press Tab until the focused element matches `selector` (keyboard-only navigation). */
async function tabTo(page: Page, selector: string, max = 80) {
  for (let i = 0; i < max; i++) {
    if (await page.evaluate((s) => document.activeElement?.matches(s) ?? false, selector)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Tab never reached ${selector}`);
}

test.describe('quality governor (spec P7: step down when FPS < 45 for 3 s)', () => {
  test('a sustained 30 fps steps quality down to the last level: no shadows, DPR 1', async ({ page }) => {
    await page.goto('/?fps=30');
    await ready(page);
    // SwiftShader starts at "no-post"; three more low seconds take it to "no-shadows".
    await page.waitForFunction(() => window.__quality!().level === 3, null, { timeout: 15_000 });
    expect(await quality(page)).toMatchObject({ post: false, shadows: false, maxDpr: 1 });
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => window.__perf!.dpr)).toBeLessThanOrEqual(1);
  });

  test('a healthy frame rate never steps down', async ({ page }) => {
    await page.goto('/?fps=120');
    await ready(page);
    const start = (await quality(page)).level;
    await page.waitForTimeout(5000);
    expect((await quality(page)).level).toBe(start);
  });

  test('full quality mounts AO, bloom and tilt-shift and keeps rendering', async ({ page }) => {
    await page.goto('/?autoQuality=off');
    await ready(page);
    expect(await quality(page)).toMatchObject({ level: 0, ao: true, post: true, shadows: true });
    // SwiftShader can take seconds per frame with AO on, so wait for progress instead of a fixed window.
    const before = await page.evaluate(() => window.__perf!.frames);
    await page.waitForFunction((n) => window.__perf!.frames > n, before, { timeout: 30_000 });
  });
});

test.describe('keyboard (spec 6: every main action from the keyboard)', () => {
  test('search, select, clear, switch site, fleet board, camera, speed and pause without a mouse', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    await ready(page);

    // "/" → search → Enter selects and flies there; Esc clears.
    await page.keyboard.press('/');
    await page.keyboard.type('FL-01');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__selection!().selected)).toEqual({ kind: 'forklift', id: 'FL-01' });
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => window.__selection!().selected)).toBeNull();

    // Site switcher: Tab to it, Enter opens, Tab to WH-03, Enter switches.
    await tabTo(page, '[data-slot="site-switcher"] button[aria-haspopup]');
    await page.keyboard.press('Enter');
    await tabTo(page, '[data-site-option="WH-03"]');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__sim!().viewSiteId)).toBe('WH-03');

    // Fleet board: arrow keys move between tabs, Enter on a row selects it.
    await tabTo(page, '[data-region="fleet"] [role="tab"][data-state="active"]');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Forklifts/ })).toHaveAttribute('data-state', 'active');
    await tabTo(page, '[data-tab="forklifts"] [data-row]');
    const row = await page.evaluate(() => (document.activeElement as HTMLElement).dataset.row!);
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__selection!().selected)).toEqual({ kind: 'forklift', id: row });

    // Camera buttons.
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.__view?.flying === false);
    await tabTo(page, '[data-map-action="home"]');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1200);
    const d0 = await page.evaluate(() => window.__view!.distance);
    await tabTo(page, '[data-map-action="zoom-in"]');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__view!.distance)).toBeLessThan(d0 - 5);

    // Simulation speed popover.
    await tabTo(page, 'button[aria-label^="Simulation clock"]');
    await page.keyboard.press('Enter');
    await tabTo(page, '[data-speed="60"]');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__sim!().clock.speed)).toBe(60);
    await page.keyboard.press('Escape');
  });

  test('Space pauses and resumes; on a focused button it presses the button instead', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    const paused = () => page.evaluate(() => window.__sim!().clock.paused);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('Space');
    expect(await paused()).toBe(true);
    await expect(page.locator('[data-live-clock]').locator('..')).toContainText('Paused');
    await page.keyboard.press('Space');
    expect(await paused()).toBe(false);

    // Focus a fleet-board row: Space activates it (selects), the sim keeps running.
    await page.locator('[data-tab="docks"] [data-row]').first().focus();
    await page.keyboard.press('Space');
    expect(await paused()).toBe(false);
    expect(await page.evaluate(() => window.__selection!().selected)).not.toBeNull();

    // Typing a space in search types a space.
    await page.keyboard.press('/');
    await page.keyboard.type('Riverside Hub');
    expect(await paused()).toBe(false);
    await expect(page.getByRole('combobox')).toHaveValue('Riverside Hub');
  });
});

test.describe('empty and error states (spec P7)', () => {
  test('search with no hits says so and suggests what to type', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.keyboard.press('/');
    await page.keyboard.type('zzzz');
    await expect(page.locator('#search-results [data-empty]')).toContainText('No matches for “zzzz”');
    await expect(page.locator('#search-results [data-empty]')).toContainText('TRK-2205');
  });

  test('a selection that resolves to nothing shows a message, never a blank panel', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.evaluate(() => window.__selection!().select({ kind: 'truck', id: 'TRK-0000' }));
    await expect(page.locator('[data-region="detail"] [data-empty]')).toContainText('Nothing to show');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-region="detail"]')).toContainText('Riverside Hub');
  });

  test('without WebGL the scene shows an error card and the HUD still works', async ({ page }) => {
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext;
      // @ts-expect-error -- narrowing the overloads is not the point here
      HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
        return /webgl/.test(type) ? null : real.call(this, type, ...(rest as []));
      };
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('[data-scene-error]')).toContainText('3D view unavailable');
    // Boards and search keep working off the sim alone.
    await page.locator('[data-tab="docks"] [data-row]').first().click();
    await page.keyboard.press('/');
    await page.keyboard.type('FL-02');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-region="detail"]')).toContainText('FL-02');
    await expect(page.locator('[data-live-clock]')).not.toHaveText('09:40', { timeout: 15_000 });
    expect(errors).toEqual([]);
  });

  test('a lost WebGL context shows a notice, and the scene comes back when it is restored', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.evaluate(() => {
      const gl = document.querySelector('canvas')!.getContext('webgl2')!;
      (window as unknown as { __lose: WEBGL_lose_context }).__lose = gl.getExtension('WEBGL_lose_context')!;
      (window as unknown as { __lose: WEBGL_lose_context }).__lose.loseContext();
    });
    await expect(page.locator('[data-scene-error]')).toContainText('Reconnecting');
    await page.evaluate(() => (window as unknown as { __lose: WEBGL_lose_context }).__lose.restoreContext());
    await expect(page.locator('[data-scene-error]')).toHaveCount(0);
    const before = await page.evaluate(() => window.__perf!.frames);
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => window.__perf!.frames)).toBeGreaterThan(before);
  });
});

test.describe('phone layout < 768 px (spec 13: bottom sheet)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('one bottom sheet replaces the side panels, nothing overflows sideways', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await expect(page.locator('[data-region="sheet"]')).toBeVisible();
    await expect(page.locator('[data-region="map-controls"]')).toHaveCount(0);
    await expect(page.locator('[data-region="sheet"] [data-region="detail"]')).toContainText('Riverside Hub');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    // Top bar, KPI row and sheet do not overlap.
    const box = async (sel: string) => (await page.locator(sel).boundingBox())!;
    const top = await box('[data-region="topbar"]');
    const kpi = await box('[data-region="kpi"]');
    const sheet = await box('[data-region="sheet"]');
    expect(kpi.y).toBeGreaterThanOrEqual(top.y + top.height);
    expect(sheet.y).toBeGreaterThan(kpi.y + kpi.height);

    // Fleet tab → tap a row → the sheet jumps back to Details for it.
    await page.getByRole('tab', { name: 'Fleet' }).click();
    await page.getByRole('tab', { name: /Forklifts/ }).click();
    await page.locator('[data-tab="forklifts"] [data-row="FL-01"]').click();
    await expect(page.getByRole('tab', { name: 'Details' })).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-region="sheet"] [data-region="detail"]')).toContainText('FL-01');

    // The handle expands and collapses the sheet.
    const peek = sheet.height;
    await page.locator('[data-sheet-toggle]').click();
    await expect.poll(async () => (await box('[data-region="sheet"]')).height).toBeGreaterThan(peek + 200);
    await page.locator('[data-sheet-toggle]').click();
    await expect.poll(async () => (await box('[data-region="sheet"]')).height).toBeLessThan(peek + 5);
  });
});
