import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const ready = async (page: Page, query = '') => {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
};
const quality = (page: Page) => page.evaluate(() => window.__quality!());

test('quality steps down every 3 s under 45 fps: particles → bloom → cranes → waterfall; HUD untouched', async ({ page }) => {
  test.setTimeout(90_000);
  await ready(page, '?fps=30');
  const seen: number[] = [];
  const start = Date.now();
  while (Date.now() - start < 22_000) {
    const q = await quality(page);
    if (seen.at(-1) !== q.level) seen.push(q.level);
    if (q.level === 4) break;
    await page.waitForTimeout(250);
  }
  // software GL starts at step 2 (no bloom); the governor then continues from there
  expect(seen.at(-1)).toBe(4);
  for (let i = 1; i < seen.length; i++) expect(seen[i]).toBe(seen[i - 1]! + 1);
  expect(await quality(page)).toEqual({ level: 4, particles: false, bloom: false, cranes: false, waterfallMotion: false });
  expect(await page.evaluate(() => window.__instanced!()['qi-motes'])).toBe(0);
  for (const region of ['top-bar', 'kpi', 'detail', 'order', 'dispatch']) await expect(page.locator(`[data-hud="${region}"]`)).toBeVisible();
});

test('full quality on a fast machine: bloom, cranes and waterfall present', async ({ page }) => {
  await ready(page, '?autoQuality=off');
  expect(await quality(page)).toEqual({ level: 0, particles: true, bloom: true, cranes: true, waterfallMotion: true });
  expect(await page.evaluate(() => window.__instanced!()['cranes'])).toBe(9);
  expect(await page.evaluate(() => window.__named!('waterfall').length)).toBeGreaterThanOrEqual(4); // every peak but the cold vault
});

test('Space pauses and resumes, but never steals Space from a focused control', async ({ page }) => {
  await ready(page);
  const paused = () => page.evaluate(() => window.__sim!().clock.paused);
  await page.locator('canvas').click({ position: { x: 300, y: 450 } });
  await page.keyboard.press('Space');
  expect(await paused()).toBe(true);
  await expect(page.locator('[data-hud="live-chip"]')).toContainText('Tạm dừng');
  await page.keyboard.press('Space');
  expect(await paused()).toBe(false);
  await page.getByRole('tab', { name: /Đệ tử/ }).focus();
  await page.keyboard.press('Space');
  expect(await paused()).toBe(false);
});

test('main tasks work from the keyboard alone: switch peak, search, select, zoom, overview', async ({ page }) => {
  await ready(page, '?autoQuality=off');
  // switch peak through the menu
  // Radix opens the menu in a portal and moves focus asynchronously: wait before each key.
  await page.getByRole('button', { name: 'Danh sách phong' }).focus();
  await page.keyboard.press('Enter');
  const items = page.locator('[data-hud="peak-list"] [role="menuitem"]');
  await expect(items.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-hud="peak-switcher"]')).toContainText('PH-03');
  // search and open
  await page.keyboard.press('/');
  await page.keyboard.type('dt-25');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-hud="detail"]')).toContainText('DT-25');
  // camera controls are plain buttons
  const d0 = await page.evaluate(() => window.__view!.distance);
  await page.locator('[data-map-action="zoom-in"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => window.__view!.distance)).toBeLessThan(d0);
  await page.locator('[data-map-action="overview"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__view!.mode === 'overview', null, { timeout: 5000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-hud="detail"]')).toContainText('Băng khố · PH-03');
});

test('empty states: no search hits, a peak with no ships, a quiet bell', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => (window.__sim!().clock.paused = true));
  await page.keyboard.press('/');
  await page.keyboard.type('zzzz');
  await expect(page.locator('[data-hud="search-results"]')).toContainText('Không tìm thấy');
  await page.keyboard.press('Escape');

  const quiet = await page.evaluate(() => {
    const { world } = window.__sim!();
    return world.peaks.find((p) => ![...world.ships.values()].some((s) => s.homePeakId === p.id && s.peakId !== null))?.name ?? null;
  });
  test.skip(!quiet, 'every peak already has a ship');
  await page.getByRole('button', { name: 'Danh sách phong' }).click();
  await page.locator('[data-hud="peak-list"]').getByText(quiet!).click();
  await expect(page.locator('[data-hud="order"]')).toContainText('Chọn một linh chu để xem lệnh vận chuyển');
  await page.getByRole('tab', { name: /Linh chu/ }).click();
  await expect(page.locator('[data-tab="ships"]')).toContainText('Không có gì để hiện');
});

test('a crashed scene shows a retry card while the simulation and HUD keep going', async ({ page }) => {
  await page.goto('/?crashScene');
  await expect(page.locator('[data-scene-error="crashed"]')).toBeVisible();
  await expect(page.locator('[data-scene-error="crashed"]')).toContainText('Thử lại');
  const t0 = await page.evaluate(() => window.__sim!().world.t);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => window.__sim!().world.t)).toBeGreaterThan(t0);
  await page.keyboard.press('/');
  await page.keyboard.type('tu van');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-hud="detail"]')).toContainText('Tử Vân Phong');
});

test('losing the WebGL context shows a banner until it is restored', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    const ext = document.querySelector('canvas')!.getContext('webgl2')!.getExtension('WEBGL_lose_context')!;
    (window as unknown as { __lose: WEBGL_lose_context }).__lose = ext;
    ext.loseContext();
  });
  await expect(page.locator('[data-context-lost]')).toContainText('Mất kết nối đồ hoạ');
  await page.evaluate(() => (window as unknown as { __lose: WEBGL_lose_context }).__lose.restoreContext());
  await expect(page.locator('[data-context-lost]')).toHaveCount(0, { timeout: 10_000 });
});

test.describe('phone layout', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('detail card is a bottom sheet with order and dispatch as tabs; nothing overflows', async ({ page }) => {
    await ready(page, '?autoQuality=off');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const sheet = page.locator('[data-hud="mobile-sheet"]');
    await expect(sheet).toBeVisible();
    await expect(page.locator('[data-hud="dispatch"]').first()).toBeHidden();
    const box = (await sheet.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(844);
    expect(box.height).toBeGreaterThan(300);
    for (const region of ['top-bar', 'kpi', 'map-controls']) {
      const b = (await page.locator(`[data-hud="${region}"]`).boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + Math.min(b.width, 390)).toBeLessThanOrEqual(390);
    }
    // every top-bar control (last one: the bell) fits on screen
    const bell = (await page.locator('[data-hud="bell"]').boundingBox())!;
    expect(bell.x + bell.width).toBeLessThanOrEqual(390);
    await expect(page.locator('[data-hud="live-chip"]')).toContainText(/Giờ \S+ \d\d:\d\d/);
    await sheet.getByRole('tab', { name: 'Điều phối' }).click();
    await page.getByRole('tab', { name: /Đệ tử/ }).click();
    await page.locator('[data-row="DT-07"]').click();
    await expect(sheet.getByRole('tab', { name: 'Ngọc giản' })).toHaveAttribute('aria-selected', 'true');
    await expect(sheet).toContainText('DT-07, Trần Bình');
    await sheet.getByRole('button', { name: 'Thu bảng' }).click();
    await expect(sheet).toHaveAttribute('data-open', 'false');
    await page.waitForTimeout(400); // height transition
    expect(await sheet.evaluate((el) => (el as HTMLElement).offsetHeight)).toBeLessThan(80);
    await page.screenshot({ path: 'evidence/P7/phone-390x844-collapsed.png' });
    await sheet.getByRole('button', { name: 'Mở bảng' }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'evidence/P7/phone-390x844.png' });
  });
});
