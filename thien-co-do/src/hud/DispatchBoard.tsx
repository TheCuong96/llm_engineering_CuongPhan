import * as Tabs from '@radix-ui/react-tabs';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Chip } from '../design/primitives';
import { Panel } from '../design/Panel';
import type { ChipTone } from '../design/tokens';
import { vi } from '../i18n/vi';
import { isWorkerBusy, legProgress, peakSummary, shipProgress } from '../sim/hudSelectors';
import type { Ship } from '../sim/types';
import type { World } from '../sim/world';
import { sameSel, useSelection, type Sel } from '../store/selection';
import { minutesFrom } from './format';
import { selectEntity, useSimTick } from './hooks';
import { shipChip, workerChip, workerTask } from './viewModels';

const t = vi.dispatch;

interface Row {
  key: string;
  sel: Sel;
  focus?: string;
  dot?: string;
  title: string;
  subtitle: string;
  chip: { tone: ChipTone; text: string };
  value: string;
}

function shipValue(world: World, s: Ship): string {
  const p = shipProgress(world, s);
  if (p?.kind === 'chests') return `${p.done}/${s.cargo.capacity}`;
  if (s.state === 'sailing' && s.motion) return t.minutes(minutesFrom(s.motion.start + s.motion.duration - world.t));
  return '';
}

function guildShort(world: World, s: Ship) {
  return vi.names.guildShort[s.guildId as keyof typeof vi.names.guildShort] ?? world.guilds.find((g) => g.id === s.guildId)?.name ?? '';
}

function sail(world: World, s: Ship) {
  return world.guilds.find((g) => g.id === s.guildId)?.livery.sail;
}

/** Bottom-right board: pads, workers, ships of the viewed peak; every row selects (spec §4.6). */
export function DispatchBoard({ embedded = false }: { embedded?: boolean }) {
  const { world, viewPeakId } = useSimTick();
  const selected = useSelection((s) => s.selected);
  const reduced = useReducedMotion() ?? false;
  const [tab, setTab] = useState('pads');
  const peak = world.peaks.find((p) => p.id === viewPeakId)!;
  const sum = peakSummary(world, peak.id);
  const ships = [...world.ships.values()].filter((s) => s.homePeakId === peak.id && s.peakId !== null);
  const workers = [...world.workers.values()].filter((w) => w.peakId === peak.id);

  const padRows: Row[] = peak.pads.map((pad) => {
    const s = pad.shipId ? world.ships.get(pad.shipId) : undefined;
    return s
      ? { key: pad.id, sel: { kind: 'ship', id: s.id }, dot: sail(world, s), title: `${pad.label} · ${s.id} · ${guildShort(world, s)}`, subtitle: peak.id, chip: shipChip(s), value: shipValue(world, s) }
      : { key: pad.id, sel: { kind: 'peak', id: peak.id }, focus: 'pads', title: `${pad.label} · ${peak.id}`, subtitle: t.noShip, chip: { tone: 'neutral', text: vi.chip.padReady }, value: '' };
  });
  const incoming = ships.filter((s) => s.state === 'sailing' || (s.state === 'at_barrier' && !s.padId));
  padRows.push(
    ...incoming.map((s): Row => ({
      key: `in-${s.id}`,
      sel: { kind: 'ship', id: s.id },
      dot: sail(world, s),
      title: `${t.incoming}: ${s.id} · ${guildShort(world, s)}`,
      subtitle: t.toPeak(peak.id),
      chip: shipChip(s),
      value: shipValue(world, s),
    })),
  );

  const workerRows: Row[] = workers.map((w) => {
    const busy = isWorkerBusy(w);
    const pct = busy ? Math.round((legProgress(world, w) ?? 0) * 100) : Math.round(w.qi);
    return {
      key: w.id,
      sel: { kind: 'worker', id: w.id },
      title: w.id,
      subtitle: workerTask(world, w),
      chip: workerChip(w),
      value: busy ? `${pct}%` : `${w.kind === 'puppet' ? vi.detail.worker.stones : vi.detail.worker.qi} ${pct}%`,
    };
  });

  const shipRows: Row[] = ships.map((s) => {
    const pad = peak.pads.find((p) => p.id === s.padId);
    const landed = s.state === 'landing' || s.state === 'unloading' || s.state === 'loading';
    return {
      key: s.id,
      sel: { kind: 'ship', id: s.id },
      dot: sail(world, s),
      title: `${s.id} · ${guildShort(world, s)}`,
      subtitle: landed && pad ? t.atPad(peak.id, pad.label) : t.toPeak(peak.id),
      chip: shipChip(s),
      value: shipValue(world, s),
    };
  });

  const automaton = peak.kind === 'automaton';
  const tabs = [
    { value: 'pads', label: `${t.tabs.pads} ${sum.busyPads}/${sum.totalPads}`, rows: padRows },
    { value: 'workers', label: `${automaton ? t.tabs.puppets : t.tabs.disciples} ${sum.workersBusy}/${sum.workersTotal}`, rows: workerRows },
    { value: 'ships', label: `${t.tabs.ships} ${ships.length}`, rows: shipRows },
  ];
  const active = tabs.find((x) => x.value === tab)!;

  return (
    <Panel
      data-hud="dispatch"
      className={
        embedded
          ? 'relative h-full !rounded-none !border-0 !bg-transparent p-3 !shadow-none'
          : 'absolute bottom-[var(--hud-gap)] right-[var(--hud-gap)] h-[var(--hud-bottom-h)] w-[30vw] min-w-[380px] p-4'
      }
    >
      <Tabs.Root value={tab} onValueChange={setTab} className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2">
          <Tabs.List className="flex gap-1 rounded-full bg-neutral-bg p-1" aria-label={peak.name}>
            {tabs.map((x) => (
              <Tabs.Trigger
                key={x.value}
                value={x.value}
                className="whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium text-neutral-ink focus-visible:ring-2 focus-visible:ring-accent data-[state=active]:bg-white data-[state=active]:text-accent-ink data-[state=active]:shadow-sm"
              >
                {x.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {!embedded && <span className="truncate font-serif text-[13px] font-semibold">{peak.name}</span>}
        </div>
        <Tabs.Content value={tab} forceMount className="mt-2 min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={tab}
              data-tab={tab}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="space-y-0.5"
            >
              {active.rows.length === 0 && <li className="px-2 py-3 text-[13px] text-ink-muted">{t.empty}</li>}
              {active.rows.map((r) => (
                <li key={r.key}>
                  <button
                    type="button"
                    data-row={r.sel.id}
                    aria-current={sameSel(selected, r.sel) || undefined}
                    onClick={() => selectEntity(r.sel, peak.id, r.focus)}
                    onMouseEnter={() => useSelection.getState().hover(r.sel)}
                    onMouseLeave={() => useSelection.getState().hover(null)}
                    className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left hover:bg-accent-tint/70 focus-visible:bg-accent-tint focus-visible:outline-none aria-[current]:bg-accent-tint"
                  >
                    <span className="size-2.5 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: r.dot ?? 'transparent' }} aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-[13px] font-medium">{r.title}</span>
                      <span className="truncate text-[11px] text-ink-muted">{r.subtitle}</span>
                    </span>
                    <Chip tone={r.chip.tone} className="max-w-[40%] shrink-0">{r.chip.text}</Chip>
                    <span className="w-16 shrink-0 text-right text-[12px] tabular-nums text-ink-muted">{r.value}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </Tabs.Content>
      </Tabs.Root>
    </Panel>
  );
}
