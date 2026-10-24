import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Crosshair, Maximize2, Minimize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Chip, Eyebrow, Field, IconButton, Panel, ProgressBar, Tile } from '../design/primitives';
import { useSelection, type Sel } from '../store/selection';
import { useSimTick } from './hooks';
import { InventoryIcon } from './icons';
import { cardFor, type CardVM } from './viewModels';

const GONE = 'No longer on site';

/**
 * D. Detail panel (spec 4.4): the selection, or the viewed site when nothing is selected.
 * If the selected entity disappears the last card stays, dimmed, with a "left …" line
 * instead of going blank (spec 7.2).
 */
export function DetailPanel() {
  const { world, viewSiteId } = useSimTick();
  const selected = useSelection((s) => s.selected);
  const select = useSelection((s) => s.select);
  const focusSection = useSelection((s) => s.focusSection);
  const reduced = useReducedMotion() ?? false;
  const [expanded, setExpanded] = useState(false);
  const sel: Sel = selected ?? { kind: 'site', id: viewSiteId };
  const last = useRef<CardVM | null>(null);
  const body = useRef<HTMLDivElement>(null);

  const live = cardFor(world, sel);
  if (live) last.current = live;
  const card = live ?? (last.current && last.current.sel.id === sel.id ? last.current : null);
  const gone = !live && card ? GONE : card?.departed;

  // The map controls hug the panel's left edge through the same variable, so they move with it.
  useEffect(() => {
    document.documentElement.style.setProperty('--hud-detail-w', expanded ? '32vw' : '23vw');
  }, [expanded]);

  useEffect(() => {
    if (!focusSection) return;
    body.current?.querySelector(`[data-anchor="${focusSection}"]`)?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }, [focusSection, sel.id, reduced]);

  return (
    <Panel
      data-region="detail"
      aria-label={card ? `${card.eyebrow}: ${card.title}` : 'Details'}
      className="absolute flex flex-col overflow-hidden transition-[width] duration-300"
      style={{
        top: 'var(--hud-top)',
        right: 'var(--hud-gap)',
        width: 'var(--hud-detail-w)',
        bottom: 'calc(var(--hud-fleet-h) + var(--hud-gap) * 2)',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${sel.kind}:${sel.id}`}
          ref={body}
          data-detail-kind={sel.kind}
          data-detail-id={sel.id}
          data-gone={gone ? 'true' : undefined}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: gone ? 0.55 : 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5"
        >
          {card && (
            <>
              <header className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Eyebrow>{card.eyebrow}</Eyebrow>
                  <h2 className="mt-1 truncate text-title leading-snug font-bold">{card.title}</h2>
                  <p className="truncate text-[13px] text-ink-muted">{card.subtitle}</p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <IconButton label="Locate on map" onClick={() => useSelection.getState().requestFly()} disabled={Boolean(gone)}>
                    <Crosshair className="size-4" />
                  </IconButton>
                  <IconButton label={expanded ? 'Collapse panel' : 'Expand panel'} onClick={() => setExpanded((x) => !x)} pressed={expanded}>
                    {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                  </IconButton>
                  <IconButton label="Close" onClick={() => select(null)} disabled={!selected}>
                    <X className="size-4" />
                  </IconButton>
                </div>
              </header>

              {gone && (
                <div data-departed className="mt-3 rounded-tile bg-chip-neutral-bg px-3 py-2 text-[12px] font-medium text-chip-neutral-text">
                  {gone}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <Chip tone={card.chip.tone}>{card.chip.text}</Chip>
                {card.site && <span className="text-[12px] text-ink-muted">{card.site.summary}</span>}
                {card.desc && <span className="text-[12px] text-ink-muted">{card.desc}</span>}
              </div>

              {card.progress && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="text-ink-muted">{card.progress.label}</span>
                    <span className="font-semibold tabular-nums">{card.progress.caption}</span>
                  </div>
                  <ProgressBar value={card.progress.value} tone={card.progress.tone} label={card.progress.label} />
                </div>
              )}

              {card.site && <SiteBody card={card} />}

              {card.fields.length > 0 && (
                <dl className="mt-3 divide-y divide-line">
                  {card.fields.map((f) => (
                    <Field key={f.label} label={f.label}>
                      {f.value}
                    </Field>
                  ))}
                </dl>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Panel>
  );
}

function SiteBody({ card }: { card: CardVM }) {
  const s = card.site!;
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Tile label="Stock on hand" value={s.stock.value}>
          <ProgressBar value={s.stock.fraction} tone="info" label="Stock on hand" />
        </Tile>
        <div data-anchor="bays">
          <Tile label="Truck bays" value={s.bays.value}>
            <ProgressBar value={s.bays.fraction} tone="success" label="Truck bays" />
          </Tile>
        </div>
        <Tile label="Outbound today" value={s.outboundToday} />
        <Tile label="Put-aways today" value={s.putAwaysToday} />
      </div>

      <h3 className="mt-5 text-[14px] font-bold">Inventory</h3>
      <ul className="mt-1.5 divide-y divide-line">
        {s.inventory.map((i) => (
          <li key={i.sku} className="flex items-center gap-2.5 py-1.5 text-[13px]">
            <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-tile text-accent">
              <InventoryIcon name={i.icon} />
            </span>
            <span className="min-w-0 flex-1 truncate">{i.name}</span>
            <span className="font-semibold tabular-nums">{i.qty}</span>
            <Chip tone={i.low ? 'warning' : 'success'}>{i.low ? 'Low Stock' : 'In Stock'}</Chip>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-baseline justify-between">
        <h3 className="text-[14px] font-bold">Forklift fleet</h3>
        <span className="text-[12px] text-ink-muted">{s.fleet.value}</span>
      </div>
      <ul className="mt-1.5 space-y-2.5">
        {s.fleet.rows.map((r) => (
          <li key={r.id} className="text-[13px]">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate">{r.name}</span>
              <span className="flex items-center gap-2">
                <Chip tone={r.chip.tone}>{r.chip.text}</Chip>
                <span className="w-9 text-right text-[12px] font-semibold tabular-nums">{r.caption}</span>
              </span>
            </div>
            <ProgressBar value={r.value} tone={r.tone} label={`${r.id} battery`} />
          </li>
        ))}
      </ul>
    </>
  );
}
