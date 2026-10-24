// Selection → formatted card data for the detail panel (spec §4.4). Pure: no React.

import { kgToCan, mpsToKmh, mToDam, mToTruong } from '../data/units';
import type { ChipTone } from '../design/tokens';
import type { BarTone } from '../design/primitives';
import { vi } from '../i18n/vi';
import { isWorkerBusy, legProgress, orderDoneAt, peakSummary, shipProgress } from '../sim/hudSelectors';
import { chestsOnHand, simDate } from '../sim/selectors';
import type { Chest, Peak, Ship, Worker } from '../sim/types';
import type { World } from '../sim/world';
import type { Sel } from '../store/selection';
import { fmt1, fmtInt, hhmm, minutesFrom } from './format';

const d = vi.detail;
const chip = vi.chip;

export interface CardVM {
  sel: Sel;
  peakId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  chip: { tone: ChipTone; text: string };
  desc?: string;
  progress?: { value: number; caption: string; tone: BarTone; label: string };
  fields: { label: string; value: string }[];
  peak?: PeakExtras;
  /** Set when the entity left the viewed peak but still exists (ship flying away). */
  departed?: string;
}

export interface PeakExtras {
  summary: string;
  stock: { value: string; fraction: number };
  pads: { value: string; fraction: number };
  outToday: string;
  inToday: string;
  inventory: { sku: string; icon: string; name: string; qty: string; low: boolean }[];
  workforce: { value: string; rows: { id: string; name: string; chip: { tone: ChipTone; text: string }; value: number; tone: BarTone }[] };
  barrier: { value: number; weak: boolean };
}

// --- tones (spec §4.6) ------------------------------------------------------

export function shipChip(s: Ship): { tone: ChipTone; text: string } {
  const tone: Record<Ship['state'], ChipTone> = {
    sailing: 'motion',
    at_barrier: 'warning',
    landing: 'motion',
    unloading: 'success',
    loading: 'success',
    departing: 'motion',
    in_transit: 'motion',
    delivered: 'neutral',
  };
  return { tone: tone[s.state], text: chip.ship[s.state] };
}

export function workerChip(w: Worker): { tone: ChipTone; text: string } {
  switch (w.state) {
    case 'loading_ship':
    case 'unloading_ship':
      return { tone: 'success', text: chip.worker[w.state] };
    case 'restoring':
      return { tone: 'warning', text: w.kind === 'puppet' ? chip.worker.restoringPuppet : chip.worker.restoring };
    case 'queued_for_array':
      return { tone: 'warning', text: chip.worker.queued_for_array };
    case 'fetching':
      return { tone: 'motion', text: chip.worker.fetching };
    default:
      return { tone: 'neutral', text: chip.worker[w.state] };
  }
}

export function chestChip(c: Chest): { tone: ChipTone; text: string } {
  if (c.needsCold?.warned) return { tone: 'warning', text: chip.chest.coldLow };
  if (c.state === 'carried') return { tone: 'motion', text: chip.chest.moving };
  if (c.state === 'loaded') return { tone: 'neutral', text: chip.chest.loaded };
  return { tone: 'neutral', text: chip.chest.waiting };
}

// --- helpers ------------------------------------------------------------------

const peakOf = (world: World, id: string) => world.peaks.find((p) => p.id === id);
const padLabel = (peak: Peak | undefined, padId?: string) => peak?.pads.find((p) => p.id === padId)?.label ?? null;
const timeAt = (world: World, simSeconds: number) => hhmm(new Date(world.startEpochMs + simSeconds * 1000));

export function chestLocation(c: Chest): string {
  const { kind, ref } = c.location;
  if (kind === 'worker') return d.chest.onShoulder(ref);
  if (kind === 'ship') return d.chest.onShip(ref);
  if (ref === 'vault') return d.chest.inVault;
  return d.chest.atSlot(Number(ref.replace('yard-', '')) + 1);
}

export function workerTask(world: World, w: Worker): string {
  const peak = peakOf(world, w.peakId);
  const t = vi.dispatch.workerTask;
  const arrayLabel = w.arrayId ?? '';
  switch (w.state) {
    case 'fetching':
      return t.fetching(padLabel(peak, w.task?.padId) ?? '');
    case 'loading_ship':
      return t.loadingShip(w.task?.shipId ?? '', padLabel(peak, w.task?.padId) ?? '');
    case 'unloading_ship':
      return t.unloadingShip(w.task?.shipId ?? '', padLabel(peak, w.task?.padId) ?? '');
    case 'returning':
      return t.returning;
    case 'queued_for_array':
      return t.queued(arrayLabel);
    case 'restoring':
      return w.kind === 'puppet' ? t.restoringPuppet(arrayLabel) : t.restoring(arrayLabel);
    default:
      return t.idle;
  }
}

// --- cards ----------------------------------------------------------------------

export function peakCard(world: World, peak: Peak): CardVM {
  const sum = peakSummary(world, peak.id);
  const stock = chestsOnHand(world, peak.id);
  const workers = [...world.workers.values()].filter((w) => w.peakId === peak.id);
  return {
    sel: { kind: 'peak', id: peak.id },
    peakId: peak.id,
    eyebrow: `${d.peakEyebrow[peak.kind]} · ${peak.id}`,
    title: peak.name,
    subtitle: d.peak.location(peak.locationLabel, fmtInt(mToTruong(peak.altitudeM))),
    chip: peak.barrier.weak ? { tone: 'danger', text: chip.barrierWeak } : { tone: 'success', text: chip.barrierStrong },
    fields: [],
    peak: {
      summary: d.peak.summary(sum.landed, sum.incoming, sum.waiting),
      stock: { value: `${fmtInt(stock)} / ${fmtInt(peak.capacity)}`, fraction: stock / peak.capacity },
      pads: { value: d.peak.padsValue(sum.busyPads, sum.totalPads), fraction: sum.busyPads / sum.totalPads },
      outToday: fmtInt(peak.today.outChests),
      inToday: fmtInt(peak.today.inChests),
      inventory: peak.inventory.map((i) => ({
        sku: i.sku,
        icon: i.icon,
        name: i.name,
        qty: fmtInt(i.qty),
        low: i.qty < i.lowStockThreshold,
      })),
      workforce: {
        value: d.peak.workforceValue(sum.workersBusy, sum.workersTotal),
        rows: workers.map((w) => ({
          id: w.id,
          name: w.kind === 'puppet' ? w.id : `${w.id} · ${w.name}`,
          chip: workerChip(w),
          value: isWorkerBusy(w) ? (legProgress(world, w) ?? 0) : w.qi / 100,
          tone: isWorkerBusy(w) ? 'accent' : w.qi < 20 ? 'warning' : 'success',
        })),
      },
      barrier: { value: peak.barrier.strength, weak: peak.barrier.weak },
    },
  };
}

export function shipCard(world: World, s: Ship): CardVM {
  const guild = world.guilds.find((g) => g.id === s.guildId);
  const order = world.orders.get(s.orderId);
  const peak = peakOf(world, s.homePeakId);
  const pad = padLabel(peak, s.padId) ?? '';
  const desc = d.ship.desc;
  const dest = order?.destination ?? '';
  const descText: Record<Ship['state'], string> = {
    sailing: desc.sailing,
    at_barrier: desc.atBarrier(s.padId ? pad : null),
    landing: desc.landing(pad),
    unloading: desc.unloading(pad),
    loading: desc.loading(pad),
    departing: desc.departing,
    in_transit: desc.inTransit(dest),
    delivered: desc.delivered(dest),
  };
  const p = shipProgress(world, s);
  const progress: CardVM['progress'] =
    p?.kind === 'chests'
      ? { value: p.target ? p.done / p.target : 0, caption: d.ship.chestsProgress(p.done, s.cargo.capacity), tone: 'accent', label: d.ship.cargo }
      : p?.kind === 'distance'
        ? { value: p.fraction, caption: d.ship.remaining(fmt1(mToDam(p.remainingM))), tone: 'accent', label: d.ship.destination }
        : undefined;
  return {
    sel: { kind: 'ship', id: s.id },
    peakId: s.homePeakId,
    eyebrow: guild?.name ?? '',
    title: s.id,
    subtitle: d.ship.captainLine(s.captain, s.sealNo),
    chip: shipChip(s),
    desc: descText[s.state],
    progress,
    fields: [
      { label: d.ship.order, value: s.orderId },
      { label: d.ship.recipient, value: order?.recipient ?? vi.common.empty },
      { label: d.ship.destination, value: dest || vi.common.empty },
      { label: d.ship.eta, value: order ? timeAt(world, orderDoneAt(world, order)) : vi.common.empty },
      { label: d.ship.speed, value: d.ship.speedValue(fmtInt(mpsToKmh(s.speedMps))) },
      { label: d.ship.pad, value: pad || vi.common.empty },
      { label: d.ship.cargo, value: d.ship.cargoValue(s.cargo.chests, s.cargo.capacity, fmtInt(kgToCan(s.cargo.weightKg))) },
    ],
    departed: s.peakId === null ? d.gone(s.homePeakId, s.destPeakId ?? dest) : undefined,
  };
}

export function workerCard(world: World, w: Worker): CardVM {
  const peak = peakOf(world, w.peakId);
  const carrying = w.carrying ? world.chests.get(w.carrying) : undefined;
  const busy = isWorkerBusy(w);
  return {
    sel: { kind: 'worker', id: w.id },
    peakId: w.peakId,
    eyebrow: `${w.kind === 'puppet' ? d.worker.eyebrowPuppet : d.worker.eyebrowDisciple} · ${w.peakId}`,
    title: w.kind === 'puppet' ? w.id : `${w.id}, ${w.name}`,
    subtitle: w.kind === 'puppet' ? (w.model ?? '') : w.realm ? d.worker.realm(w.realm.layer) : '',
    chip: workerChip(w),
    desc: workerTask(world, w),
    progress: {
      value: w.qi / 100,
      caption: `${Math.round(w.qi)}%`,
      tone: w.qi < 20 ? 'warning' : busy ? 'accent' : 'success',
      label: w.kind === 'puppet' ? d.worker.stones : d.worker.qi,
    },
    fields: [
      { label: d.worker.carrying, value: carrying ? `${carrying.id} · ${carrying.name}` : d.worker.nothing },
      { label: d.worker.movesToday, value: fmtInt(w.movesToday) },
      { label: d.worker.speed, value: d.worker.speedValue(fmt1(w.speedKmh)) },
      { label: d.worker.array, value: w.arrayId ?? peak?.arrays[0]?.id ?? vi.common.empty },
      { label: d.worker.peak, value: `${w.peakId} · ${peak?.name ?? ''}` },
    ],
  };
}

export function chestCard(world: World, c: Chest): CardVM {
  const peak = peakOf(world, c.peakId);
  const cold = c.needsCold;
  const fields = [
    { label: d.chest.qty, value: fmtInt(c.qty) },
    { label: d.chest.weight, value: d.chest.weightValue(fmtInt(kgToCan(c.weightKg))) },
    { label: d.chest.location, value: chestLocation(c) },
    { label: d.chest.lot, value: c.lot },
    { label: d.chest.receivedAt, value: timeAt(world, c.receivedAt) },
    { label: d.chest.peak, value: `${c.peakId} · ${peak?.name ?? ''}` },
  ];
  return {
    sel: { kind: 'chest', id: c.id },
    peakId: c.peakId,
    eyebrow: `${d.chest.eyebrow} · ${d.category[c.category]}`,
    title: c.name,
    subtitle: `${c.id} · ${d.chest.grade(c.grade)}`,
    chip: chestChip(c),
    progress: cold
      ? {
          value: Math.max(0, 1 - cold.minutesOutside / cold.maxMinutesOutside),
          caption: d.chest.coldLeft(fmtInt(Math.max(0, cold.maxMinutesOutside - cold.minutesOutside))),
          tone: cold.warned ? 'warning' : 'accent',
          label: d.chest.coldLeft(''),
        }
      : undefined,
    fields,
  };
}

export function arrayCard(world: World, peak: Peak, arrayId: string): CardVM | null {
  const a = peak.arrays.find((x) => x.id === arrayId);
  if (!a) return null;
  const occupant = a.occupantId ? world.workers.get(a.occupantId) : undefined;
  const gathering = occupant?.state === 'restoring' && !occupant.motion;
  return {
    sel: { kind: 'array', id: `${peak.id}/${a.id}` },
    peakId: peak.id,
    eyebrow: `${d.array.eyebrow} · ${peak.id}`,
    title: a.id,
    subtitle: a.label,
    chip: gathering && occupant ? { tone: 'warning', text: chip.arrayBusy(occupant.id) } : { tone: 'success', text: chip.arrayFree },
    progress: gathering && occupant ? { value: occupant.qi / 100, caption: `${Math.round(occupant.qi)}%`, tone: 'accent', label: d.worker.qi } : undefined,
    fields: [
      { label: d.array.sessionsToday, value: fmtInt(a.sessionsToday) },
      { label: d.array.qiToday, value: `${fmtInt(a.qiToday)}%` },
      { label: d.array.rate, value: d.array.rateValue(fmtInt(a.ratePctPerMin)) },
      { label: d.array.queue, value: a.queue.length ? a.queue.join(', ') : d.array.queueNone },
      { label: d.array.peak, value: `${peak.id} · ${peak.name}` },
    ],
  };
}

/** Card for a selection, or null when the entity no longer exists (caller keeps the last one). */
export function cardFor(world: World, sel: Sel): CardVM | null {
  switch (sel.kind) {
    case 'peak': {
      const p = peakOf(world, sel.id);
      return p ? peakCard(world, p) : null;
    }
    case 'ship': {
      const s = world.ships.get(sel.id);
      return s ? shipCard(world, s) : null;
    }
    case 'worker': {
      const w = world.workers.get(sel.id);
      return w ? workerCard(world, w) : null;
    }
    case 'chest': {
      const c = world.chests.get(sel.id);
      return c ? chestCard(world, c) : null;
    }
    case 'array': {
      const [peakId, arrayId] = sel.id.split('/');
      const p = peakOf(world, peakId ?? '');
      return p && arrayId ? arrayCard(world, p, arrayId) : null;
    }
  }
}

export const simClockLabel = (world: World) => hhmm(simDate(world));
export { minutesFrom };
