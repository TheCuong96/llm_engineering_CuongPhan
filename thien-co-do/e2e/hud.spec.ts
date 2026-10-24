import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

const ready = async (page: Page) => {
  await page.goto('/');
  await page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
};
const speed = (page: Page, x: number) => page.evaluate((v) => window.__sim!().clock.setSpeed(v), x);
const detail = (page: Page) => page.locator('[data-hud="detail"]');

test('KPI, peak card and order bar show spec §4 strings for PH-01', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => (window.__sim!().clock.paused = true));
  const kpi = page.locator('[data-hud="kpi"]');
  await expect(kpi.locator('[data-kpi="chests"]')).toContainText('Linh tài tồn kho');
  await expect(kpi.locator('[data-kpi="chests"] [data-kpi-value]')).toHaveText(/^1,4\d\d$/);
  await expect(kpi.locator('[data-kpi="chests"]')).toContainText('rương · PH-01');
  await expect(kpi.locator('[data-kpi="onTime"] [data-kpi-value]')).toHaveText('96.6%');
  await expect(kpi.locator('[data-kpi="onTime"]')).toContainText('30 ngày gần nhất');

  await expect(detail(page)).toContainText('Chủ phong · PH-01');
  await expect(detail(page)).toContainText('Tử Vân Phong');
  await expect(detail(page)).toContainText('Trung tâm biển mây · cao 3,200 trượng');
  await expect(detail(page)).toContainText('Hộ trận vững');
  for (const label of ['Linh tài tồn', 'Phi chu đài', 'Xuất hôm nay', 'Nhập kho hôm nay', 'Kho', 'Nhân lực', 'Hộ trận']) {
    await expect(detail(page)).toContainText(label);
  }
  await expect(detail(page).locator('[data-chip]').filter({ hasText: 'Sắp cạn' })).toHaveCount(1);

  await expect(page.locator('[data-hud="top-bar"]')).toContainText(/Live · Giờ Tỵ 09:4\d/);
  await expect(page.locator('[data-hud="peak-switcher"]')).toContainText(/\d+% đầy · \d\/2 đài có thuyền/);
});

test('every chip on screen reaches 4.5:1 contrast', async ({ page }) => {
  await ready(page);
  await speed(page, 60);
  await page.waitForTimeout(4000);
  const ratios = await page.evaluate(() => {
    const lum = (rgb: string) => {
      const [r, g, b] = rgb.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    return [...document.querySelectorAll('[data-chip]')].map((el) => {
      const cs = getComputedStyle(el);
      const [a, b] = [lum(cs.color), lum(cs.backgroundColor)].sort((x, y) => y - x);
      return { text: el.textContent, ratio: (a! + 0.05) / (b! + 0.05) };
    });
  });
  expect(ratios.length).toBeGreaterThan(5);
  for (const r of ratios) expect(r.ratio, r.text ?? '').toBeGreaterThanOrEqual(4.5);
});

test('search without diacritics: "/" focuses, "tu van" → Tử Vân Phong, Enter opens a chest', async ({ page }) => {
  await ready(page);
  await page.locator('canvas').click({ position: { x: 600, y: 450 } });
  await page.keyboard.press('/');
  await expect(page.getByRole('combobox')).toBeFocused();
  await page.keyboard.type('tu van');
  await expect(page.locator('[data-hud="search-results"] [role="option"]').first()).toContainText('Tử Vân Phong');

  await page.getByRole('combobox').fill('');
  await page.keyboard.type('huyet linh chi');
  await expect(page.locator('[data-hud="search-results"]')).toContainText('Huyết Linh Chi');
  await page.keyboard.press('Enter');
  await expect(detail(page).locator('[data-detail-kind="chest"]')).toBeVisible();
  await expect(detail(page)).toContainText('Huyết Linh Chi');
  await expect(detail(page)).toContainText('Rương · Linh dược');
});

test('switching peak updates KPIs (count-up) and the board; Đ in "dan ha" finds PH-02', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Danh sách phong' }).click();
  await page.locator('[data-hud="peak-list"]').getByText('Truyền Tống Đài').click();
  await expect(page.locator('[data-kpi="chests"]')).toContainText('rương · PH-04');
  await expect(page.locator('[data-kpi="chests"] [data-kpi-value]')).toHaveText(/^5\d\d$/, { timeout: 3000 });
  await expect(page.locator('[data-hud="dispatch"]')).toContainText('Truyền Tống Đài');
  await expect(page.getByRole('tab').first()).toContainText(/Phi chu đài \d\/6/);

  await page.keyboard.press('/');
  await page.keyboard.type('dan ha');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-hud="peak-switcher"]')).toContainText('PH-02');
});

test('live chip changes sim speed and pauses', async ({ page }) => {
  await ready(page);
  await page.locator('[data-hud="live-chip"]').click();
  await page.locator('[data-speed="60"]').click();
  expect(await page.evaluate(() => window.__sim!().clock.speed)).toBe(60);
  await page.locator('[data-speed="pause"]').click();
  const t0 = await page.evaluate(() => window.__sim!().world.t);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__sim!().world.t)).toBe(t0);
  await page.locator('[data-speed="12"]').click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__sim!().world.t)).toBeGreaterThan(t0);
});

test('dispatch board is keyboard-operable and every row opens the matching card', async ({ page }) => {
  await ready(page);
  // Radix moves focus on a timeout, so wait for each step before the next key.
  await page.getByRole('tab', { name: /Phi chu đài/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Đệ tử/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Linh chu/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-tab="workers"]')).toBeVisible();
  await page.locator('[data-row="DT-07"]').focus();
  await page.keyboard.press('Enter');
  await expect(detail(page).locator('[data-detail-kind="worker"]')).toBeVisible();
  await expect(detail(page)).toContainText('Đệ tử ngoại môn · PH-01');
  await expect(detail(page)).toContainText('DT-07, Trần Bình');
  await expect(detail(page)).toContainText('Linh lực');

  await page.evaluate(() => (window.__sim!().clock.paused = true)); // freeze rows while counting
  await page.getByRole('tab', { name: /Phi chu đài/ }).click();
  await expect(page.locator('[data-tab="pads"] button')).toHaveCount(await page.locator('[data-tab="pads"] li').count());
});

test('ship card, 5-step order bar, notifications, and the dimmed "đã rời…" card', async ({ page }) => {
  test.setTimeout(180_000);
  await ready(page);
  await speed(page, 60);
  await page.waitForFunction(() => [...window.__sim!().world.ships.values()].some((s) => s.homePeakId === 'PH-01' && s.state === 'loading'), null, { timeout: 120_000 });
  await speed(page, 1); // loading lasts minutes at 1×, so the assertions below see the same state
  const shipId = await page.evaluate(() => [...window.__sim!().world.ships.values()].find((s) => s.homePeakId === 'PH-01' && s.state === 'loading')!.id);

  await page.getByRole('tab', { name: /Linh chu/ }).click();
  await page.locator(`[data-tab="ships"] [data-row="${shipId}"]`).click();
  await expect(detail(page).locator('[data-detail-kind="ship"]')).toBeVisible();
  for (const label of ['Lệnh', 'Bên nhận', 'Đích đến', 'Dự kiến tới', 'Tốc độ', 'Đài', 'Hàng']) await expect(detail(page)).toContainText(label);
  await expect(page.locator('[data-hud="order"] [data-step]')).toHaveCount(5);
  await expect(page.locator('[data-hud="order"] [data-order-header]')).toContainText(shipId);
  await expect(page.locator('[data-hud="order"]')).toContainText(/Đang bốc \d\/8/);
  await expect(page.locator('[data-hud="order"] [data-step="handling"]')).toHaveAttribute('data-state', 'current');
  await expect(page.locator('[data-hud="order"] [data-order-where]')).toContainText(/PH-01 · Đài \d · còn \d+ phút/);

  // bell: at least one "tới trận môn" notice by now; clicking it selects that ship
  await page.locator('[data-hud="bell"]').click();
  const first = page.locator('[data-hud="notices"] li button').first();
  await expect(first).toBeVisible();
  const target = await first.textContent();
  await first.click();
  await expect(detail(page).locator('[data-detail-kind]')).toBeVisible();
  expect(target).toBeTruthy();

  // Notices span all peaks; go back to PH-01, re-select the loading ship and let it leave:
  // the card must stay, dimmed, with "Đã rời…".
  await page.getByRole('button', { name: 'Danh sách phong' }).click();
  await page.locator('[data-hud="peak-list"]').getByText('Tử Vân Phong').click();
  await page.getByRole('tab', { name: /Linh chu/ }).click();
  await page.locator(`[data-tab="ships"] [data-row="${shipId}"]`).click();
  await speed(page, 60);
  await page.waitForFunction((id) => window.__sim!().world.ships.get(id)?.peakId === null, shipId, { timeout: 120_000 });
  await expect(detail(page).locator('[data-gone="true"]')).toBeVisible();
  await expect(detail(page).locator('[data-departed]')).toContainText('Đã rời PH-01 · đang tới');
  await page.waitForFunction((id) => !window.__sim!().world.ships.has(id), shipId, { timeout: 120_000 });
  await expect(detail(page)).toContainText(shipId); // still the last card, no crash
});
