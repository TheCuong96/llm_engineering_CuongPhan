import { describe, expect, it } from 'vitest';
import { chipTones, contrastRatio } from '../design/tokens';
import { spawnShip } from '../sim/ships';
import { createChest, getPeak } from '../sim/state';
import { quietWorld, runUntil } from '../sim/testkit';
import { collectNotices } from './notifications';
import { cardFor, chestCard, peakCard, shipCard, workerCard } from './viewModels';

describe('detail cards (spec §4.4)', () => {
  it('Peak: eyebrow, location with altitude, barrier chip, tiles, inventory, workforce', () => {
    const w = quietWorld();
    const c = peakCard(w, getPeak(w, 'PH-01'));
    expect(c.eyebrow).toBe('Chủ phong · PH-01');
    expect(c.title).toBe('Tử Vân Phong');
    expect(c.subtitle).toBe('Trung tâm biển mây · cao 3,200 trượng');
    expect(c.chip).toEqual({ tone: 'success', text: 'Hộ trận vững' });
    expect(c.peak!.summary).toBe('0 đã đáp · 0 đang tới · 3 rương chờ');
    expect(c.peak!.stock.value).toBe('1,412 / 1,800');
    expect(c.peak!.pads.value).toBe('0 / 2 bận');
    expect(c.peak!.inventory).toHaveLength(4);
    expect(c.peak!.inventory.filter((i) => i.low).map((i) => i.name)).toEqual(['Phù giấy trống']);
    expect(c.peak!.workforce.value).toBe('0/2 đang làm');
  });

  it('Ship: guild eyebrow, captain line, state chip + description, progress, fields', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'outbound', 3);
    let c = shipCard(w, ship);
    expect(c.eyebrow).toBe(w.guilds.find((g) => g.id === ship.guildId)!.name);
    expect(c.subtitle).toMatch(/ · ấn hiệu \d{3}-\d{2}$/);
    expect(c.chip).toEqual({ tone: 'motion', text: 'Ngự không' });
    expect(c.progress!.caption).toMatch(/^còn [\d.]+ dặm$/);
    expect(c.fields.map((f) => f.label)).toEqual(['Lệnh', 'Bên nhận', 'Đích đến', 'Dự kiến tới', 'Tốc độ', 'Đài', 'Hàng']);
    runUntil(w, () => ship.state === 'loading' && ship.cargo.chests >= 1);
    c = shipCard(w, ship);
    expect(c.chip).toEqual({ tone: 'success', text: 'Đang bốc' });
    expect(c.desc).toBe('Đang bốc hàng tại Đài 1');
    expect(c.progress!.caption).toMatch(/^\d\/8 rương$/);
    runUntil(w, () => ship.peakId === null);
    expect(shipCard(w, ship).departed).toMatch(/^Đã rời PH-01 · đang tới /);
  });

  it('Worker: eyebrow, realm, chip, qi bar, carrying', () => {
    const w = quietWorld();
    const c = workerCard(w, w.workers.get('DT-07')!);
    expect(c.eyebrow).toBe('Đệ tử ngoại môn · PH-01');
    expect(c.title).toBe('DT-07, Trần Bình');
    expect(c.subtitle).toBe('Luyện Khí tầng 6');
    expect(c.chip.text).toBe('Rảnh');
    expect(c.progress).toMatchObject({ caption: '82%', label: 'Linh lực' });
    expect(c.fields[0]).toEqual({ label: 'Đang mang', value: 'Trống' });
  });

  it('Chest: category eyebrow, grade, location, cold-chain line', () => {
    const w = quietWorld();
    const lotus = createChest(w, 'PH-01', 'snow_lotus', 'staged', { kind: 'slot', ref: 'yard-3' });
    const c = chestCard(w, lotus);
    expect(c.eyebrow).toBe('Rương · Linh dược');
    expect(c.subtitle).toBe(`${lotus.id} · Ngũ phẩm`);
    expect(c.chip.text).toBe('Chờ bốc');
    expect(c.fields.find((f) => f.label === 'Vị trí')!.value).toBe('Ô sân 4');
    expect(c.progress!.caption).toBe('Hàn khí còn 45 phút');
  });

  it('returns null for entities that disappeared, so the panel can keep the last card', () => {
    const w = quietWorld();
    expect(cardFor(w, { kind: 'ship', id: 'LC-0000' })).toBeNull();
    expect(cardFor(w, { kind: 'array', id: 'PH-01/T1' })!.chip.text).toBe('Trống');
  });

  it('every chip tone used by the cards meets 4.5:1', () => {
    for (const { bg, ink } of Object.values(chipTones)) expect(contrastRatio(ink, bg)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('notifications', () => {
  it('keeps only actionable events and targets the related entity', () => {
    const w = quietWorld();
    const ship = spawnShip(w, getPeak(w, 'PH-01'), 'inbound', 2);
    w.workers.get('DT-03')!.qi = 21;
    runUntil(w, () => ship.state === 'landing');
    const notices = collectNotices(w);
    expect(notices.some((n) => n.text === `${ship.id} tới trận môn PH-01` && n.target.id === ship.id)).toBe(true);
    for (const n of notices) expect(['ship', 'peak', 'worker', 'chest']).toContain(n.target.kind);
    const seqs = notices.map((n) => n.seq);
    expect(seqs).toEqual([...seqs].sort((a, b) => b - a));
  });
});
