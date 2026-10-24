import { ArrowDownRight, ArrowUpRight, Package, Sailboat, Timer, type LucideIcon } from 'lucide-react';
import { vi } from '../i18n/vi';
import { Panel } from '../design/Panel';
import { peakKpis } from '../sim/selectors';
import { fmt1, fmtDelta, fmtInt } from './format';
import { useCountUp, useSimTick } from './hooks';

interface CardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: number;
  delta: number;
  caption: string;
  format: (n: number) => string;
  deltaDigits: number;
  suffix?: string;
  peakId: string;
}

function KpiCard({ id, label, icon: Icon, value, delta, caption, format, deltaDigits, suffix = '', peakId }: CardProps) {
  const shown = useCountUp(value, peakId);
  const up = delta >= 0;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <Panel data-kpi={id} className="flex w-[clamp(200px,15vw,250px)] shrink-0 gap-3 p-3.5 max-md:w-[168px] max-md:gap-2 max-md:p-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent-tint text-accent-ink">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[12px] text-ink-muted">{label}</span>
        <span className="flex items-baseline gap-2">
          <span data-kpi-value className="font-serif text-[24px] font-semibold leading-tight">
            {format(shown)}
            {suffix}
          </span>
          <span className={`flex items-center text-[12px] font-medium ${up ? 'text-success-ink' : 'text-warning-ink'}`}>
            <Arrow className="size-3.5" aria-hidden="true" />
            {fmtDelta(delta, deltaDigits)}
            {suffix}
          </span>
        </span>
        <span className="truncate text-[11px] text-ink-muted">{caption}</span>
      </div>
    </Panel>
  );
}

/** Three KPIs of the viewed peak (spec §4.2); numbers count up when the peak changes. */
export function KpiBar() {
  const { world, viewPeakId } = useSimTick();
  const k = peakKpis(world, viewPeakId);
  const t = vi.kpi;
  return (
    <div data-hud="kpi" className="absolute left-[var(--hud-gap)] top-[calc(var(--hud-top)+var(--hud-gap))] flex gap-3 max-md:inset-x-2 max-md:gap-2 max-md:overflow-x-auto max-md:pb-1">
      <KpiCard id="chests" label={t.chestsOnHand} icon={Package} value={k.chestsOnHand.value} delta={k.chestsOnHand.delta} caption={t.chestsCaption(viewPeakId)} format={fmtInt} deltaDigits={0} peakId={viewPeakId} />
      <KpiCard id="ships" label={t.shipsAtPeak} icon={Sailboat} value={k.shipsAtPeak.value} delta={k.shipsAtPeak.delta} caption={t.shipsCaption(k.shipsAtPeak.incoming, viewPeakId)} format={fmtInt} deltaDigits={0} peakId={viewPeakId} />
      <KpiCard id="onTime" label={t.onTime} icon={Timer} value={k.onTime.value} delta={k.onTime.delta} caption={t.last30d} format={fmt1} deltaDigits={1} suffix="%" peakId={viewPeakId} />
    </div>
  );
}
