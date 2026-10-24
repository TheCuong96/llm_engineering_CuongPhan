import { Boxes, Clock3, TrendingDown, TrendingUp, Truck, type LucideIcon } from 'lucide-react';
import { Chip, Panel } from '../design/primitives';
import { siteKpis } from '../sim/selectors';
import { fmt1, fmtDelta, fmtInt } from './format';
import { useCountUp, useSimTick } from './hooks';

/** B. Three KPI cards, top-left (spec 4.2). Values count from the old site to the new one. */
export function KpiBar() {
  const { world, viewSiteId } = useSimTick();
  const k = siteKpis(world, viewSiteId);
  return (
    <div
      data-region="kpi"
      // Phones: the three cards scroll sideways instead of overflowing the screen.
      className="absolute flex gap-3 max-md:right-0 max-md:gap-2 max-md:overflow-x-auto max-md:pr-[var(--hud-gap)] max-md:pb-2"
      style={{ top: 'var(--hud-top)', left: 'var(--hud-gap)' }}
    >
      <KpiCard
        id="stock"
        icon={Boxes}
        label="Stock on hand"
        value={k.stockOnHand.value}
        siteId={viewSiteId}
        format={fmtInt}
        delta={fmtDelta(k.stockOnHand.delta)}
        up={k.stockOnHand.delta >= 0}
        caption={`pallets · ${viewSiteId}`}
      />
      <KpiCard
        id="trucks"
        icon={Truck}
        label="Trucks on site"
        value={k.trucksOnSite.value}
        siteId={viewSiteId}
        format={fmtInt}
        delta={fmtDelta(k.trucksOnSite.delta)}
        up={k.trucksOnSite.delta >= 0}
        caption={`${k.trucksOnSite.inbound} inbound · ${viewSiteId}`}
      />
      <KpiCard
        id="ontime"
        icon={Clock3}
        label="On-time delivery"
        value={k.onTime.value}
        siteId={viewSiteId}
        format={(v) => `${fmt1(v)}%`}
        delta={`${fmtDelta(k.onTime.delta, 1)}%`}
        up={k.onTime.delta >= 0}
        caption="last 30 days"
      />
    </div>
  );
}

function KpiCard(props: {
  id: string;
  icon: LucideIcon;
  label: string;
  value: number;
  siteId: string;
  format: (v: number) => string;
  delta: string;
  up: boolean;
  caption: string;
}) {
  const shown = useCountUp(props.value, props.siteId);
  const Icon = props.icon;
  const Trend = props.up ? TrendingUp : TrendingDown;
  return (
    <Panel data-kpi={props.id} className="w-[clamp(180px,11.5vw,228px)] shrink-0 p-3.5 max-md:w-[156px] max-md:p-2.5">
      <div className="flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-[9px] bg-tile text-accent">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="text-[12px] font-medium text-ink-muted">{props.label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span data-kpi-value className="text-[24px] leading-none max-md:text-[20px] font-bold tracking-tight tabular-nums">
          {props.format(shown)}
        </span>
        <Chip tone={props.up ? 'success' : 'warning'} className="!px-1.5 !text-[11px]">
          <Trend className="mr-0.5 size-3" aria-hidden="true" />
          {props.delta}
        </Chip>
      </div>
      <div className="mt-1.5 truncate text-[11.5px] text-ink-muted">{props.caption}</div>
    </Panel>
  );
}
