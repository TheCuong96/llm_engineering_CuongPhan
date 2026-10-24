import { Check, ChevronRight, Sailboat } from 'lucide-react';
import { Chip } from '../design/primitives';
import { Panel } from '../design/Panel';
import { vi } from '../i18n/vi';
import { orderDoneAt, orderTimeline } from '../sim/hudSelectors';
import { useSelection } from '../store/selection';
import { focusShip } from './focusShip';
import { stepStates } from './orderSteps';
import { hhmm, minutesFrom } from './format';
import { selectEntity, useSimTick } from './hooks';
import { shipChip } from './viewModels';

const o = vi.order;

/** Bottom-left order card: 5-step stepper + order summary for the tracked ship (spec §4.5). */
export function OrderTracking({ embedded = false }: { embedded?: boolean }) {
  const { world, viewPeakId } = useSimTick();
  const selected = useSelection((s) => s.selected);
  const ship = focusShip(world, selected, viewPeakId);
  const order = ship ? world.orders.get(ship.orderId) : undefined;

  return (
    <Panel
      data-hud="order"
      className={
        embedded
          ? 'relative flex flex-col gap-4 !rounded-none !border-0 !bg-transparent p-4 !shadow-none'
          : 'absolute bottom-[var(--hud-gap)] left-[var(--hud-gap)] flex h-[var(--hud-bottom-h)] max-h-[180px] w-[60vw] gap-5 p-5'
      }
    >
      {!ship || !order ? (
        <div className="flex flex-1 flex-col">
          <h3 className="font-serif text-[16px] font-semibold">{o.title}</h3>
          <p className="mt-auto text-[13px] text-ink-muted">{o.none}</p>
        </div>
      ) : (
        <>
          <Stepper />
          <OrderCard />
        </>
      )}
    </Panel>
  );

  function Stepper() {
    const steps = orderTimeline(world, order!);
    const guild = world.guilds.find((g) => g.id === ship!.guildId)?.name ?? '';
    const states = stepStates(steps);
    const handlingLabel = order!.direction === 'outbound' ? o.steps.loading : o.steps.unloading;
    const moved = ship!.direction === 'outbound' ? ship!.cargo.chests : ship!.handling.done;
    const labels = [
      o.steps.accepted,
      o.steps.inspected,
      o.handlingCount(handlingLabel, moved, ship!.cargo.capacity),
      o.steps.inFlight,
      o.steps.delivered,
    ];
    const timeOf = (s: (typeof steps)[number]) => {
      const at = s.at ?? s.eta;
      if (at === undefined) return vi.common.empty;
      const text = hhmm(new Date(world.startEpochMs + at * 1000));
      return s.at !== undefined ? text : o.eta(text);
    };

    return (
      <div className="flex min-w-0 flex-[3] flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[16px] font-semibold">{o.title}</h3>
          <span data-order-header className="truncate text-[12px] text-ink-muted">{o.header(ship!.id, guild)}</span>
        </div>
        <ol className="mt-auto flex items-start" aria-label={o.title}>
          {steps.map((s, i) => {
            const done = states[i] === 'done';
            const isCurrent = states[i] === 'current';
            return (
              <li key={s.key} data-step={s.key} data-state={done ? 'done' : isCurrent ? 'current' : 'todo'} aria-current={isCurrent ? 'step' : undefined} className="flex flex-1 flex-col items-center gap-1.5 text-center">
                <div className="flex w-full items-center">
                  <span className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : done || isCurrent ? 'bg-accent' : 'bg-neutral-ink/20'}`} />
                  <span
                    className={`grid size-7 place-items-center rounded-full border-2 ${
                      done
                        ? 'border-accent bg-accent text-white'
                        : isCurrent
                          ? 'border-accent bg-white text-accent shadow-[0_0_0_5px_rgba(109,74,224,0.18),0_0_14px_rgba(109,74,224,0.45)]'
                          : 'border-neutral-ink/25 bg-neutral-bg'
                    }`}
                  >
                    {done && <Check className="size-3.5" aria-hidden="true" />}
                    {isCurrent && <span className="size-2 rounded-full bg-accent" aria-hidden="true" />}
                  </span>
                  <span className={`h-0.5 flex-1 ${i === steps.length - 1 ? 'invisible' : done ? 'bg-accent' : 'bg-neutral-ink/20'}`} />
                </div>
                <span className={`text-[12px] font-medium ${done || isCurrent ? 'text-ink' : 'text-neutral-ink'}`}>{labels[i]}</span>
                <span className="text-[11px] text-ink-muted">{timeOf(s)}</span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  function OrderCard() {
    const peak = world.peaks.find((p) => p.id === ship!.homePeakId);
    const pad = peak?.pads.find((p) => p.id === ship!.padId)?.label ?? null;
    const minutes = minutesFrom(orderDoneAt(world, order!) - world.t);
    const chip = shipChip(ship!);
    return (
      <button
        type="button"
        aria-label={`${o.openShip}: ${ship!.id}`}
        onClick={() => selectEntity({ kind: 'ship', id: ship!.id }, ship!.homePeakId)}
        className="flex min-w-0 flex-[2] items-center gap-3 rounded-tile bg-accent-tint/60 p-4 text-left hover:bg-accent-tint focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-white text-accent-ink">
          <Sailboat className="size-5" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2">
            <span className="font-serif text-[15px] font-semibold">{order!.id}</span>
            <Chip tone={chip.tone}>{chip.text}</Chip>
          </span>
          <span className="truncate text-[13px]">{o.to(order!.destination)}</span>
          <span data-order-where className="truncate text-[12px] text-ink-muted">{o.where(ship!.homePeakId, pad, minutes)}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
      </button>
    );
  }
}
