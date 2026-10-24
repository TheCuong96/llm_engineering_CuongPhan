// Notifications (spec 4.7): a filter over the event log keeping only events that need action —
// a truck at the gate, an item dropping to Low Stock, a forklift battery under 20%, a late truck.

import { create } from 'zustand';
import type { Tone } from '../design/primitives';
import type { SimEvent } from '../sim/events';
import type { World } from '../sim/world';
import type { Sel } from '../store/selection';

export interface Notice {
  seq: number;
  t: number;
  siteId: string;
  text: string;
  tone: Tone;
  target: Sel;
}

export function toNotice(world: World, e: SimEvent, seq: number): Notice | null {
  const base = { seq, t: e.t, siteId: e.siteId };
  switch (e.type) {
    case 'truck_state':
      if (e.payload?.to !== 'at_gate') return null;
      return { ...base, text: `${e.entityId} arrived at the ${e.siteId} gate`, tone: 'warning', target: { kind: 'truck', id: e.entityId } };
    case 'low_stock': {
      const item = world.catalog.get(e.entityId)?.name ?? e.entityId;
      return { ...base, text: `${item} is low on stock at ${e.siteId}`, tone: 'warning', target: { kind: 'site', id: e.siteId } };
    }
    case 'battery_low': {
      const pct = Math.round(Number(e.payload?.battery ?? 0));
      return { ...base, text: `${e.entityId} battery at ${pct}%`, tone: 'warning', target: { kind: 'forklift', id: e.entityId } };
    }
    case 'truck_late':
      return { ...base, text: `${e.entityId} is running late`, tone: 'warning', target: { kind: 'truck', id: e.entityId } };
    default:
      return null;
  }
}

/** Newest first. Sequence numbers survive log trimming, so read state stays stable. */
export function collectNotices(world: World, max = 40): Notice[] {
  const { events, seq } = world.log;
  const first = seq - events.length;
  const out: Notice[] = [];
  for (let i = events.length - 1; i >= 0 && out.length < max; i--) {
    const n = toNotice(world, events[i]!, first + i);
    if (n) out.push(n);
  }
  return out;
}

interface NoticeState {
  lastReadSeq: number;
  markRead(seq: number): void;
}

export const useNotices = create<NoticeState>((set) => ({
  lastReadSeq: -1,
  markRead: (seq) => set((s) => ({ lastReadSeq: Math.max(s.lastReadSeq, seq) })),
}));
