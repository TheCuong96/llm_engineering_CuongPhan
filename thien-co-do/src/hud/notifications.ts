// Truyền âm (spec §4.7): a filter over the event log keeping only events that need action.

import { create } from 'zustand';
import type { ChipTone } from '../design/tokens';
import { vi } from '../i18n/vi';
import type { SimEvent } from '../sim/events';
import type { World } from '../sim/world';
import type { Sel } from '../store/selection';

const t = vi.notify;

export interface Notice {
  seq: number;
  t: number;
  peakId: string;
  text: string;
  tone: ChipTone;
  target: Sel;
}

export function toNotice(world: World, e: SimEvent, seq: number): Notice | null {
  const base = { seq, t: e.t, peakId: e.peakId };
  switch (e.type) {
    case 'ship_state':
      if (e.payload?.to !== 'at_barrier') return null;
      return { ...base, text: t.shipAtGate(e.entityId, e.peakId), tone: 'warning', target: { kind: 'ship', id: e.entityId } };
    case 'low_stock': {
      const item = world.catalog.get(e.entityId)?.name ?? e.entityId;
      return { ...base, text: t.lowStock(item, e.peakId), tone: 'warning', target: { kind: 'peak', id: e.peakId } };
    }
    case 'qi_low': {
      const qi = Math.round(Number(e.payload?.qi ?? 0));
      return { ...base, text: t.qiLow(e.entityId, String(qi)), tone: 'warning', target: { kind: 'worker', id: e.entityId } };
    }
    case 'cold_warning':
      return { ...base, text: t.coldWarning(e.entityId), tone: 'warning', target: { kind: 'chest', id: e.entityId } };
    case 'barrier_weak':
      return { ...base, text: t.barrierWeak(e.peakId), tone: 'danger', target: { kind: 'peak', id: e.peakId } };
    case 'ship_late':
      return { ...base, text: t.shipLate(e.entityId), tone: 'warning', target: { kind: 'ship', id: e.entityId } };
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
