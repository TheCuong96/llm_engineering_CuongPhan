// Global search (spec §4.7): match ids (PH-, LC-, DT-, KL-, R-, LVC-) and names without
// diacritics, grouped by kind, ≤ 5 per group, the viewed peak first.

import type { World } from '../sim/world';
import type { Sel } from '../store/selection';

/**
 * Lower-case, strip Vietnamese diacritics. NFD splits most marks off their base letter,
 * but "đ/Đ" is a separate letter (U+0111/U+0110) with no decomposition, so map it by hand.
 */
export function normalizeVi(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export type SearchKind = 'peak' | 'ship' | 'worker' | 'chest' | 'order';
export const SEARCH_ORDER: SearchKind[] = ['peak', 'ship', 'worker', 'chest', 'order'];
export const MAX_PER_GROUP = 5;

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  peakId: string;
  /** What selecting this hit selects (an order selects its ship). */
  target: Sel;
}

function entries(world: World): SearchHit[] {
  const out: SearchHit[] = [];
  for (const p of world.peaks) {
    out.push({ kind: 'peak', id: p.id, title: p.name, subtitle: p.id, peakId: p.id, target: { kind: 'peak', id: p.id } });
  }
  for (const s of world.ships.values()) {
    const guild = world.guilds.find((g) => g.id === s.guildId)?.name ?? '';
    out.push({ kind: 'ship', id: s.id, title: s.id, subtitle: `${guild} · ${s.homePeakId}`, peakId: s.homePeakId, target: { kind: 'ship', id: s.id } });
  }
  for (const w of world.workers.values()) {
    out.push({ kind: 'worker', id: w.id, title: `${w.id} · ${w.name}`, subtitle: w.peakId, peakId: w.peakId, target: { kind: 'worker', id: w.id } });
  }
  for (const c of world.chests.values()) {
    out.push({ kind: 'chest', id: c.id, title: `${c.id} · ${c.name}`, subtitle: c.peakId, peakId: c.peakId, target: { kind: 'chest', id: c.id } });
  }
  for (const o of world.orders.values()) {
    out.push({ kind: 'order', id: o.id, title: o.id, subtitle: `${o.shipId} · ${o.destination}`, peakId: o.peakId, target: { kind: 'ship', id: o.shipId } });
  }
  return out;
}

export function searchWorld(world: World, query: string, viewPeakId: string): SearchHit[] {
  const q = normalizeVi(query).replace(/^#/, '');
  if (!q) return [];
  const terms = q.split(' ');
  const scored = entries(world)
    .map((hit) => {
      const hay = normalizeVi(`${hit.id} ${hit.title} ${hit.subtitle}`).replace(/#/g, '');
      if (!terms.every((term) => hay.includes(term))) return null;
      const idStarts = normalizeVi(hit.id).replace(/^#/, '').startsWith(q) ? 0 : 1;
      return { hit, rank: [hit.peakId === viewPeakId ? 0 : 1, idStarts, hit.id] as const };
    })
    .filter((x) => x !== null)
    .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.rank[2].localeCompare(b.rank[2]));

  const out: SearchHit[] = [];
  for (const kind of SEARCH_ORDER) out.push(...scored.filter((s) => s.hit.kind === kind).slice(0, MAX_PER_GROUP).map((s) => s.hit));
  return out;
}

