import { Check, ChevronRight, ClipboardCheck, PackageCheck, Truck as TruckIcon, Warehouse, type LucideIcon } from 'lucide-react';
import { Chip, Panel } from '../design/primitives';
import { secondsToNextMilestone, shipmentTimeline } from '../sim/hudSelectors';
import type { ShipmentStepKey, Truck } from '../sim/types';
import type { World } from '../sim/world';
import { useSelection } from '../store/selection';
import { minutesFrom } from './format';
import { selectEntity, useSimTick } from './hooks';
import { stepLabel, stepStates, type StepState } from './steps';
import { carrierName, dockLabel, timeAt, truckChip } from './viewModels';

const STEP_ICON: Record<ShipmentStepKey, LucideIcon> = {
  confirmed: ClipboardCheck,
  picked: PackageCheck,
  handling: Warehouse,
  in_transit: TruckIcon,
  delivered: Check,
};
const AT_DOCK: Truck['state'][] = ['loading', 'unloading', 'docking'];

/**
 * The truck the card follows (spec 4.5: "đổi theo xe đang chọn"): the selected truck, the truck
 * a selected forklift works for, else the busiest truck at the viewed site.
 */
export function trackedTruck(world: World, viewSiteId: string, selected: ReturnType<typeof useSelection.getState>['selected']): Truck | null {
  if (selected?.kind === 'truck' && world.trucks.has(selected.id)) return world.trucks.get(selected.id)!;
  if (selected?.kind === 'forklift') {
    const id = world.forklifts.get(selected.id)?.task?.truckId;
    if (id && world.trucks.has(id)) return world.trucks.get(id)!;
  }
  const here = [...world.trucks.values()].filter((t) => t.siteId === viewSiteId);
  return here.find((t) => AT_DOCK.includes(t.state)) ?? here.find((t) => t.state === 'at_gate' || t.state === 'en_route') ?? here[0] ?? null;
}

/** E. Shipment tracking, bottom-left: five-step stepper + shipment card (spec 4.5). */
export function ShipmentTracking() {
  const { world, viewSiteId } = useSimTick();
  const selected = useSelection((s) => s.selected);
  const truck = trackedTruck(world, viewSiteId, selected);
  const shipment = truck ? world.shipments.get(truck.shipmentId) : undefined;

  return (
    <Panel
      data-region="tracking"
      aria-label="Shipment tracking"
      className="absolute flex gap-5 p-4"
      style={{ left: 'var(--hud-gap)', bottom: 'var(--hud-gap)', width: 'var(--hud-track-w)', height: 'var(--hud-track-h)' }}
    >
      {!truck || !shipment ? (
        <p className="m-auto text-[13px] text-ink-muted">No trucks at {viewSiteId} right now.</p>
      ) : (
        <>
          <Stepper world={world} truck={truck} />
          <ShipmentCard world={world} truck={truck} />
        </>
      )}
    </Panel>
  );
}

function Stepper({ world, truck }: { world: World; truck: Truck }) {
  const shipment = world.shipments.get(truck.shipmentId)!;
  const steps = shipmentTimeline(world, shipment);
  const states = stepStates(steps);
  const handlingDone = states[2] === 'done';
  return (
    <div className="flex min-w-0 flex-[3] flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold">Shipment tracking</h2>
        <span data-tracking-truck={truck.id} className="text-[12px] text-ink-muted">
          {truck.id} · {carrierName(world, truck)}
        </span>
      </div>
      <ol className="mt-3 flex flex-1 items-start">
        {steps.map((s, i) => {
          const state = states[i]!;
          const when = s.at !== undefined ? timeAt(world, s.at) : s.eta !== undefined ? `ETA ${timeAt(world, s.eta)}` : '';
          const extra = s.key === 'handling' && state === 'current' ? `${truck.cargo.pallets}/${truck.cargo.capacity}` : null;
          return (
            <li key={s.key} data-step={s.key} data-state={state} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2 ${states[i - 1] === 'done' && state !== 'todo' ? 'bg-accent' : 'bg-line'}`}
                />
              )}
              <StepDot state={state} icon={STEP_ICON[s.key]} />
              <span className={`mt-1.5 text-[12px] leading-tight font-semibold ${state === 'todo' ? 'text-ink-muted' : ''}`}>
                {stepLabel(s.key, shipment.direction, handlingDone)}
                {extra && <> <span className="font-bold text-accent tabular-nums">{extra}</span></>}
              </span>
              <span className="text-[11px] text-ink-muted tabular-nums">{when}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepDot({ state, icon: Icon }: { state: StepState; icon: LucideIcon }) {
  const cls =
    state === 'done'
      ? 'bg-accent text-white'
      : state === 'current'
        ? 'bg-accent text-white ring-4 ring-accent/25'
        : 'bg-tile text-ink-muted';
  return (
    <span className={`relative z-10 grid size-8 place-items-center rounded-full ${cls}`}>
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

function ShipmentCard({ world, truck }: { world: World; truck: Truck }) {
  const shipment = world.shipments.get(truck.shipmentId)!;
  const site = world.sites.find((s) => s.id === truck.homeSiteId);
  const bay = dockLabel(site, truck.dockId);
  const left = secondsToNextMilestone(world, shipment);
  const where = [truck.siteId ?? 'On the road', bay, left !== null ? `${minutesFrom(left)} min left` : null].filter(Boolean).join(' · ');
  const chip = truckChip(truck);
  return (
    <button
      type="button"
      data-shipment-card={shipment.id}
      onClick={() => selectEntity({ kind: 'truck', id: truck.id }, truck.homeSiteId)}
      className="flex min-w-0 flex-[2] items-center gap-3 rounded-tile bg-tile px-3.5 text-left hover:bg-chip-info-bg focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-white text-accent">
        <TruckIcon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] font-bold tabular-nums">{shipment.id}</span>
          <Chip tone={chip.tone}>{chip.text}</Chip>
        </span>
        <span className="block truncate text-[12.5px]">To: {shipment.destination}</span>
        <span className="block truncate text-[12px] text-ink-muted">{where}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
    </button>
  );
}
