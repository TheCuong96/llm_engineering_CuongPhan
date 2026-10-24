import * as Tabs from '@radix-ui/react-tabs';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { Chip, EmptyState, Panel } from '../design/primitives';
import { secondsToNextMilestone, siteSummary } from '../sim/hudSelectors';
import type { Truck } from '../sim/types';
import type { World } from '../sim/world';
import { sameSel, useSelection, type Sel } from '../store/selection';
import { minutesFrom } from './format';
import { selectEntity, useSimTick } from './hooks';
import { carrierName, dockLabel, forkliftChip, forkliftTask, truckChip, type ChipVM } from './viewModels';

type Tab = 'docks' | 'forklifts' | 'trucks';
const TAB_LABEL: Record<Tab, string> = { docks: 'Docks', forklifts: 'Forklifts', trucks: 'Trucks' };
const TAB_EMPTY: Record<Tab, { title: string; hint: string }> = {
  docks: { title: 'No truck bays', hint: 'This site has no docks configured.' },
  forklifts: { title: 'No forklifts here', hint: 'This site has no forklift fleet assigned.' },
  trucks: { title: 'The yard is clear', hint: 'Trucks show up here as they reach the gate. Switch site to see other yards.' },
};

interface Row {
  key: string;
  dot?: string;
  title: string;
  subtitle: string;
  chip: ChipVM;
  metric?: string;
  /** What clicking the row selects, plus an optional detail section to scroll to. */
  target: Sel;
  focus?: string;
}

const ON_MAP: Truck['state'][] = ['en_route', 'at_gate', 'docking', 'unloading', 'loading', 'departing'];

/** The carrier's most recognisable colour: the cab, unless the cab is white (then the stripe). */
function liveryDot(world: World, t: Truck) {
  const l = world.carriers.find((c) => c.id === t.carrierId)?.livery;
  if (!l) return undefined;
  return l.cab.toLowerCase() === '#ffffff' ? (l.stripe ?? l.cab) : l.cab;
}

function truckMetric(world: World, t: Truck): string | undefined {
  if (t.state === 'loading' || t.state === 'unloading') return `${t.cargo.pallets}/${t.cargo.capacity}`;
  const shipment = world.shipments.get(t.shipmentId);
  const s = shipment ? secondsToNextMilestone(world, shipment) : null;
  return s !== null && (t.state === 'en_route' || t.state === 'at_gate') ? `${minutesFrom(s)} min` : undefined;
}

/** Docks tab (spec 4.6): one row per bay, then trucks still on their way in. */
function dockRows(world: World, siteId: string): Row[] {
  const site = world.sites.find((s) => s.id === siteId)!;
  const rows: Row[] = site.docks.map((d) => {
    const t = d.truckId ? world.trucks.get(d.truckId) : undefined;
    if (!t) {
      // Empty dock: open the site card at its "Truck bays" tile (spec 4.6).
      return { key: d.id, title: `${d.label} · ${siteId}`, subtitle: 'No truck assigned', chip: { tone: 'neutral', text: 'Available' }, target: { kind: 'site', id: siteId }, focus: 'bays' };
    }
    return {
      key: d.id,
      dot: liveryDot(world, t),
      title: `${d.label} · ${siteId}`,
      subtitle: `${t.id} · ${carrierName(world, t)}`,
      chip: truckChip(t),
      metric: truckMetric(world, t),
      target: { kind: 'truck', id: t.id },
    };
  });
  for (const t of world.trucks.values()) {
    if (t.siteId === siteId && !t.dockId && (t.state === 'en_route' || t.state === 'at_gate')) {
      rows.push({ key: t.id, dot: liveryDot(world, t), title: 'Inbound', subtitle: `${t.id} · ${carrierName(world, t)}`, chip: truckChip(t), metric: truckMetric(world, t), target: { kind: 'truck', id: t.id } });
    } else if (t.destSiteId === siteId && t.state === 'in_transit') {
      // A transfer from another site, still on the highway (spec 7.4).
      const mins = minutesFrom(Math.max(0, (t.eta ?? world.t) - world.t));
      rows.push({ key: t.id, dot: liveryDot(world, t), title: 'Inbound', subtitle: `${t.id} · from ${t.homeSiteId}`, chip: truckChip(t), metric: `${mins} min`, target: { kind: 'truck', id: t.id } });
    }
  }
  return rows;
}

function forkliftRows(world: World, siteId: string): Row[] {
  return [...world.forklifts.values()]
    .filter((f) => f.siteId === siteId)
    .map((f) => ({ key: f.id, title: f.id, subtitle: forkliftTask(world, f), chip: forkliftChip(f), metric: `${Math.round(f.battery)}%`, target: { kind: 'forklift', id: f.id } }));
}

function truckRows(world: World, siteId: string): Row[] {
  const site = world.sites.find((s) => s.id === siteId);
  return [...world.trucks.values()]
    .filter((t) => t.siteId === siteId && ON_MAP.includes(t.state))
    .map((t) => {
      const bay = dockLabel(site, t.dockId);
      const where = t.state === 'departing' ? `Leaving ${siteId}` : bay && t.state !== 'docking' ? `${siteId} · ${bay}` : `To ${siteId}`;
      return { key: t.id, dot: liveryDot(world, t), title: `${t.id} · ${carrierName(world, t)}`, subtitle: where, chip: truckChip(t), metric: truckMetric(world, t), target: { kind: 'truck', id: t.id } };
    });
}

/** F. Fleet board, bottom-right (spec 4.6): every row selects its entity and flies the camera there. */
export function FleetBoard({ embedded = false }: { embedded?: boolean }) {
  const { world, viewSiteId } = useSimTick();
  const selected = useSelection((s) => s.selected);
  const reduced = useReducedMotion() ?? false;
  const [tab, setTab] = useState<Tab>('docks');
  const sum = siteSummary(world, viewSiteId);
  const rows = tab === 'docks' ? dockRows(world, viewSiteId) : tab === 'forklifts' ? forkliftRows(world, viewSiteId) : truckRows(world, viewSiteId);
  const counters: Record<Tab, string> = {
    docks: `${sum.busyBays}/${sum.totalBays}`,
    forklifts: `${sum.forkliftsWorking}/${sum.forkliftsTotal}`,
    trucks: String(truckRows(world, viewSiteId).length),
  };

  return (
    <Panel
      data-region="fleet"
      aria-label="Fleet board"
      embedded={embedded}
      className={`flex flex-col ${embedded ? 'h-full px-3 pb-3' : 'absolute p-4'}`}
      style={embedded ? undefined : { right: 'var(--hud-gap)', bottom: 'var(--hud-gap)', width: 'var(--hud-fleet-w)', height: 'var(--hud-fleet-h)' }}
    >
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as Tab)} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <Tabs.List aria-label="Fleet board" className="flex shrink-0 gap-1.5">
            {(['docks', 'forklifts', 'trucks'] as Tab[]).map((t) => (
              <Tabs.Trigger
                key={t}
                value={t}
                className="rounded-full px-3 py-1 text-[12.5px] font-semibold whitespace-nowrap text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                {TAB_LABEL[t]} <span className="ml-0.5 tabular-nums opacity-80">{counters[t]}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {!embedded && <span className="min-w-0 truncate text-[12px] text-ink-muted">{world.sites.find((s) => s.id === viewSiteId)?.name}</span>}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-2.5 min-h-0 flex-1 overflow-y-auto"
          >
            <Tabs.Content value={tab} forceMount data-tab={tab} className="space-y-1.5 outline-none">
              {rows.length === 0 && <EmptyState {...TAB_EMPTY[tab]} />}
              {rows.map((r) => (
                <BoardRow key={r.key} row={r} active={sameSel(selected, r.target) && r.target.kind !== 'site'} siteId={viewSiteId} />
              ))}
            </Tabs.Content>
          </motion.div>
        </AnimatePresence>
      </Tabs.Root>
    </Panel>
  );
}

function BoardRow({ row, active, siteId }: { row: Row; active: boolean; siteId: string }) {
  return (
    <button
      type="button"
      data-row={row.target.kind === 'site' ? row.key : row.target.id}
      aria-current={active || undefined}
      onClick={() => selectEntity(row.target, siteId, row.focus)}
      className={`flex w-full items-center gap-2.5 rounded-tile px-3 py-2 text-left hover:bg-tile focus-visible:outline-2 focus-visible:outline-accent ${active ? 'bg-chip-info-bg' : 'bg-white/60'}`}
    >
      <Dot color={row.dot} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">{row.title}</span>
        <span className="block truncate text-[12px] text-ink-muted">{row.subtitle}</span>
      </span>
      <Chip tone={row.chip.tone}>{row.chip.text}</Chip>
      <Metric>{row.metric}</Metric>
    </button>
  );
}

/** Carrier colour dot; rows without a carrier keep the space so titles stay aligned. */
function Dot({ color }: { color?: string }) {
  return <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${color ? 'border border-ink/15' : ''}`} style={{ background: color ?? 'transparent' }} />;
}

function Metric({ children }: { children?: ReactNode }) {
  return <span className="w-11 shrink-0 text-right text-[12px] font-semibold tabular-nums">{children}</span>;
}
