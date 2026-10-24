// Global search (spec 4.7): match ids (WH-, TRK-, FL-, PAL-, SHP-) and names, case-insensitive
// and fuzzy, grouped by kind, ≤ 5 per group, the viewed site first.

import type { World } from '../sim/world';
import type { Sel } from '../store/selection';

export type SearchKind = 'site' | 'truck' | 'forklift' | 'pallet' | 'shipment';
export const SEARCH_ORDER: SearchKind[] = ['site', 'truck', 'forklift', 'pallet', 'shipment'];
export const GROUP_LABEL: Record<SearchKind, string> = {
  site: 'Sites',
  truck: 'Trucks',
  forklift: 'Forklifts',
  pallet: 'Pallets',
  shipment: 'Shipments',
};
export const MAX_PER_GROUP = 5;

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  siteId: string;
  /** What choosing this hit selects (a shipment selects its truck). */
  target: Sel;
}

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[#\s]+/g, ' ')
    .trim();

/** Every query character appears in order ("trk22" finds TRK-2205). Hyphens are ignored. */
export function fuzzyIncludes(hay: string, needle: string): boolean {
  const h = hay.replace(/-/g, '');
  const n = needle.replace(/-/g, '');
  let i = 0;
  for (const ch of h) if (ch === n[i]) i++;
  return i === n.length;
}

function entries(world: World): SearchHit[] {
  const out: SearchHit[] = [];
  for (const s of world.sites) {
    out.push({ kind: 'site', id: s.id, title: s.name, subtitle: s.id, siteId: s.id, target: { kind: 'site', id: s.id } });
  }
  for (const t of world.trucks.values()) {
    const carrier = world.carriers.find((c) => c.id === t.carrierId)?.name ?? '';
    out.push({ kind: 'truck', id: t.id, title: t.id, subtitle: `${carrier} · ${t.homeSiteId}`, siteId: t.homeSiteId, target: { kind: 'truck', id: t.id } });
  }
  for (const f of world.forklifts.values()) {
    out.push({ kind: 'forklift', id: f.id, title: `${f.id} · ${f.driver}`, subtitle: f.siteId, siteId: f.siteId, target: { kind: 'forklift', id: f.id } });
  }
  for (const p of world.pallets.values()) {
    out.push({ kind: 'pallet', id: p.id, title: `${p.id} · ${p.name}`, subtitle: p.siteId, siteId: p.siteId, target: { kind: 'pallet', id: p.id } });
  }
  for (const s of world.shipments.values()) {
    out.push({ kind: 'shipment', id: s.id, title: s.id, subtitle: `${s.truckId} · ${s.destination}`, siteId: s.siteId, target: { kind: 'truck', id: s.truckId } });
  }
  return out;
}

export function searchWorld(world: World, query: string, viewSiteId: string): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(' ');
  const scored = entries(world)
    .map((hit) => {
      const hay = normalize(`${hit.id} ${hit.title} ${hit.subtitle}`);
      const exact = terms.every((term) => hay.includes(term));
      if (!exact && !(terms.length === 1 && fuzzyIncludes(normalize(hit.id), q))) return null;
      const idStarts = normalize(hit.id).replace(/-/g, '').startsWith(q.replace(/-/g, '')) ? 0 : 1;
      return { hit, rank: [hit.siteId === viewSiteId ? 0 : 1, exact ? 0 : 1, idStarts, hit.id] as const };
    })
    .filter((x) => x !== null)
    .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.rank[2] - b.rank[2] || a.rank[3].localeCompare(b.rank[3]));

  const out: SearchHit[] = [];
  for (const kind of SEARCH_ORDER) out.push(...scored.filter((s) => s.hit.kind === kind).slice(0, MAX_PER_GROUP).map((s) => s.hit));
  return out;
}
