import { expect, test, type Page } from '@playwright/test';

const ready = (page: Page) => page.waitForFunction(() => (window.__perf?.frames ?? 0) > 3, null, { timeout: 30_000 });
const detail = (page: Page) => page.locator('[data-region="detail"] [data-detail-kind]');

test.use({ viewport: { width: 1440, height: 900 } });

test('top bar, KPIs and the site card show the WH-01 preset (spec 4.1, 4.2, 4.4)', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => (window.__sim!().clock.paused = true));
  await expect(page.locator('[data-kpi="stock"] [data-kpi-value]')).toHaveText('1,412');
  await expect(page.locator('[data-kpi="ontime"] [data-kpi-value]')).toHaveText('96.6%');
  await expect(page.locator('[data-kpi="stock"]')).toContainText('pallets · WH-01');
  await expect(page.locator('[data-kpi="ontime"]')).toContainText('last 30 days');
  await expect(page.locator('[data-site-line]')).toHaveText(/^78% full · \d\/2 docked$/);
  await expect(page.locator('[data-live-clock]')).toHaveText(/^09:4\d$/);

  const d = detail(page);
  await expect(d).toHaveAttribute('data-detail-kind', 'site');
  await expect(d).toContainText('Depot · WH-01');
  await expect(d).toContainText('Riverside Hub');
  await expect(d).toContainText('Operational');
  await expect(d).toContainText('1,412 / 1,800');
  await expect(d).toContainText('Packing Tape');
  await expect(d.locator('[data-chip="warning"]', { hasText: 'Low Stock' })).toHaveCount(1);
  await expect(d).toContainText('Forklift fleet');
});

test('fleet board rows open the forklift card; tabs show counters (spec 4.6)', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await expect(page.getByRole('tab', { name: /Docks \d\/2/ })).toBeVisible();
  await page.getByRole('tab', { name: /Forklifts \d\/2/ }).click();
  await page.locator('[data-tab="forklifts"] [data-row="FL-01"]').click();
  const d = detail(page);
  await expect(d).toHaveAttribute('data-detail-kind', 'forklift');
  await expect(d).toContainText('FL-01');
  await expect(d).toContainText('Sam Haddad · Kestrel EF-18');
  await expect(d).toContainText('Battery');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(detail(page)).toHaveAttribute('data-detail-kind', 'site');
});

test('search: "/" focuses, Enter opens the pallet card (spec 4.7)', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.keyboard.press('/');
  await expect(page.getByRole('combobox')).toBeFocused();
  await page.keyboard.type('helmet');
  await expect(page.locator('[data-hit="PAL-1026"]')).toBeVisible();
  // The result list sits above the KPI cards (it shares their screen area).
  const hit = await page.locator('[data-hit="PAL-1026"]').boundingBox();
  const topmost = await page.evaluate(([x, y]) => document.elementFromPoint(x!, y!)?.closest('[data-hit]')?.getAttribute('data-hit'), [hit!.x + 20, hit!.y + hit!.height / 2]);
  expect(topmost).toBe('PAL-1026');
  await page.keyboard.press('Enter');
  const d = detail(page);
  await expect(d).toHaveAttribute('data-detail-kind', 'pallet');
  await expect(d).toContainText('Pallet · PPE');
  await expect(d).toContainText('Safety Helmet');
  await expect(d).toContainText('PAL-1026 · PPE-HLM');
  expect(await page.evaluate(() => window.__selection!().selected)).toEqual({ kind: 'pallet', id: 'PAL-1026' });

  await page.keyboard.press('/');
  await page.keyboard.type('zzzz');
  await expect(page.getByText('No matches')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox')).not.toBeFocused();
});

test('live truck: tracking stepper, truck card, notifications and speed control', async ({ page }) => {
  test.setTimeout(150_000);
  await page.goto('/');
  await ready(page);

  await page.getByRole('button', { name: /Simulation clock/ }).click();
  await page.locator('[data-speed="60"]').click();
  expect(await page.evaluate(() => window.__sim!().clock.speed)).toBe(60);
  await page.keyboard.press('Escape');

  // Wait for a truck backed into a bay; the tracking card follows it with the 3rd step current.
  await page.waitForFunction(
    () => [...window.__sim!().world.trucks.values()].some((t) => t.siteId === 'WH-01' && (t.state === 'loading' || t.state === 'unloading')),
    null,
    { timeout: 120_000 },
  );
  await page.evaluate(() => (window.__sim!().clock.paused = true));
  const truckId = await page.evaluate(() => [...window.__sim!().world.trucks.values()].find((t) => t.siteId === 'WH-01' && (t.state === 'loading' || t.state === 'unloading'))!.id);
  await expect(page.locator('[data-tracking-truck]')).toContainText(truckId);
  await expect(page.locator('[data-step="handling"]')).toHaveAttribute('data-state', 'current');
  await expect(page.locator('[data-step="handling"]')).toContainText(/(Loading|Unloading) \d\/6/);
  await expect(page.locator('[data-step="confirmed"]')).toHaveAttribute('data-state', 'done');
  await expect(page.locator('[data-region="tracking"]')).toContainText(/WH-01 · Bay \d · \d+ min left/);

  await page.locator('[data-shipment-card]').click();
  const d = detail(page);
  await expect(d).toHaveAttribute('data-detail-kind', 'truck');
  await expect(d).toContainText(truckId);
  await expect(d).toContainText(/\d\/6 pallets/);
  await expect(d).toContainText(/#SHP-\d+/);

  // A truck reached the gate earlier: the bell shows it, and clicking it selects that truck.
  await expect(page.locator('[data-unread]')).toBeVisible();
  await page.getByRole('button', { name: /Notifications/ }).click();
  const notice = page.locator('[data-notice]').filter({ hasText: 'arrived at the WH-01 gate' }).first();
  const target = await notice.getAttribute('data-notice');
  await notice.click();
  expect(await page.evaluate(() => window.__selection!().selected)).toEqual({ kind: 'truck', id: target });
});

test('every chip on screen reaches 4.5:1 text contrast (spec 4.6)', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => window.__sim!().clock.setSpeed(60));
  await page.waitForFunction(() => document.querySelectorAll('[data-chip]').length >= 6, null, { timeout: 60_000 });
  const ratios = await page.evaluate(() => {
    const rgb = (s: string) => s.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const lum = (c: number[]) => {
      const [r, g, b] = c.map((v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    return [...document.querySelectorAll<HTMLElement>('[data-chip]')].map((el) => {
      const cs = getComputedStyle(el);
      const [a, b] = [lum(rgb(cs.color)), lum(rgb(cs.backgroundColor))];
      return { text: el.textContent, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
    });
  });
  expect(ratios.length).toBeGreaterThanOrEqual(6);
  for (const r of ratios) expect(r.ratio, r.text ?? '').toBeGreaterThanOrEqual(4.5);
});
