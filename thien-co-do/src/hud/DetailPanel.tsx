import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Crosshair, Maximize2, Minimize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Chip, Field, ProgressBar, Tile } from '../design/primitives';
import { Panel } from '../design/Panel';
import { vi } from '../i18n/vi';
import { useSelection, type Sel } from '../store/selection';
import { useSim } from '../store/sim';
import { useSimTick } from './hooks';
import { InventoryIcon } from './icons';
import { cardFor, type CardVM } from './viewModels';

const d = vi.detail;

/**
 * Ngọc giản (spec §4.4). Shows the selection, or the viewed peak when nothing is selected.
 * If the selected entity disappears the last card stays, dimmed, with a "đã rời…" line.
 */
export function DetailPanel({ embedded = false }: { embedded?: boolean }) {
  const { world, viewPeakId } = useSimTick();
  const selected = useSelection((s) => s.selected);
  const select = useSelection((s) => s.select);
  const focusSection = useSelection((s) => s.focusSection);
  const reduced = useReducedMotion() ?? false;
  const [expanded, setExpanded] = useState(false);
  const sel: Sel = selected ?? { kind: 'peak', id: viewPeakId };
  const last = useRef<CardVM | null>(null);
  const body = useRef<HTMLDivElement>(null);

  const live = cardFor(world, sel);
  if (live) last.current = live;
  const card = live ?? (last.current && last.current.sel.id === sel.id ? last.current : null);
  const gone = !live && card ? (sel.kind === 'chest' ? d.goneChest : d.goneGeneric) : card?.departed;
  // A transfer in flight can be followed: switch the view to its destination peak and wait there.
  const followTo = sel.kind === 'ship' ? world.ships.get(sel.id)?.destPeakId : undefined;

  useEffect(() => {
    if (!focusSection) return;
    body.current?.querySelector(`[data-anchor="${focusSection}"]`)?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }, [focusSection, sel.id, reduced]);

  return (
    <Panel
      data-hud="detail"
      aria-label={card?.title}
      className={
        embedded
          ? 'relative flex h-full flex-col overflow-hidden !rounded-none !border-0 !bg-transparent !shadow-none'
          : `absolute right-[var(--hud-gap)] top-[calc(var(--hud-top)+var(--hud-gap))] bottom-[calc(var(--hud-bottom-h)+var(--hud-gap)*2)] flex flex-col overflow-hidden transition-[width] duration-300 ${expanded ? 'w-[34vw]' : 'w-[24vw]'}`
      }
    >
      <CloudMotif />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${sel.kind}:${sel.id}`}
          ref={body}
          data-detail-kind={sel.kind}
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
                  <p className="eyebrow truncate">{card.eyebrow}</p>
                  <h2 className="mt-1 font-serif text-[20px] font-semibold leading-snug">{card.title}</h2>
                  <p className="text-[13px] text-ink-muted">{card.subtitle}</p>
                </div>
                <div className="relative flex shrink-0 gap-1">
                  <IconButton label={d.locate} onClick={() => useSelection.getState().requestFly()} disabled={Boolean(gone)}>
                    <Crosshair className="size-4" />
                  </IconButton>
                  {!embedded && <IconButton label={d.expand} onClick={() => setExpanded((x) => !x)} pressed={expanded}>
                    {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                  </IconButton>}
                  <IconButton label={d.close} onClick={() => select(null)} disabled={!selected}>
                    <X className="size-4" />
                  </IconButton>
                </div>
              </header>

              {gone && (
                <div data-departed className="mt-3 flex items-center justify-between gap-2 rounded-tile bg-neutral-bg px-3 py-2 text-[12px] font-medium text-neutral-ink">
                  <span className="min-w-0 truncate">{gone}</span>
                  {followTo && (
                    <button
                      type="button"
                      data-follow={followTo}
                      onClick={() => useSim.setState({ viewPeakId: followTo })}
                      className="shrink-0 rounded-full bg-accent px-3 py-0.5 text-[12px] font-semibold text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                    >
                      {vi.scene.follow}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Chip tone={card.chip.tone}>{card.chip.text}</Chip>
                {card.peak && <span className="text-[12px] text-ink-muted">{card.peak.summary}</span>}
                {card.desc && <span className="text-[12px] text-ink-muted">{card.desc}</span>}
              </div>

              {card.progress && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="text-ink-muted">{card.progress.label}</span>
                    <span className="font-medium">{card.progress.caption}</span>
                  </div>
                  <ProgressBar value={card.progress.value} tone={card.progress.tone} label={card.progress.label} />
                </div>
              )}

              {card.peak && <PeakBody card={card} />}

              {card.fields.length > 0 && (
                <dl className="mt-3 divide-y divide-ink/5">
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

function PeakBody({ card }: { card: CardVM }) {
  const p = card.peak!;
  const t = d.peak;
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Tile label={t.stock} value={p.stock.value}>
          <ProgressBar value={p.stock.fraction} tone="accent" label={t.stock} />
        </Tile>
        <div data-anchor="pads">
          <Tile label={t.pads} value={p.pads.value}>
            <ProgressBar value={p.pads.fraction} tone="jade" label={t.pads} />
          </Tile>
        </div>
        <Tile label={t.outToday} value={p.outToday} />
        <Tile label={t.inToday} value={p.inToday} />
      </div>

      <h3 className="mt-5 font-serif text-[15px] font-semibold">{t.inventory}</h3>
      <ul className="mt-1.5 divide-y divide-ink/5">
        {p.inventory.map((i) => (
          <li key={i.sku} className="flex items-center gap-2.5 py-1.5 text-[13px]">
            <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-accent-tint text-accent-ink">
              <InventoryIcon name={i.icon} />
            </span>
            <span className="min-w-0 flex-1 truncate">{i.name}</span>
            <span className="tabular-nums font-medium">{i.qty}</span>
            <Chip tone={i.low ? 'warning' : 'success'}>{i.low ? vi.chip.stockLow : vi.chip.stockOk}</Chip>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-baseline justify-between">
        <h3 className="font-serif text-[15px] font-semibold">{t.workforce}</h3>
        <span className="text-[12px] text-ink-muted">{p.workforce.value}</span>
      </div>
      <ul className="mt-1.5 space-y-2">
        {p.workforce.rows.map((r) => (
          <li key={r.id} className="text-[13px]">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate">{r.name}</span>
              <Chip tone={r.chip.tone}>{r.chip.text}</Chip>
            </div>
            <ProgressBar value={r.value} tone={r.tone} label={r.name} />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between text-[13px]">
        <span className="text-ink-muted">{t.barrier}</span>
        <span className="font-medium">{Math.round(p.barrier.value)}%</span>
      </div>
      <div className="mt-1">
        <ProgressBar value={p.barrier.value / 100} tone={p.barrier.weak ? 'warning' : 'accent'} label={t.barrier} />
      </div>
    </>
  );
}

function IconButton({
  label,
  children,
  onClick,
  disabled,
  pressed,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full hover:bg-accent-tint focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

/** The single cloud ornament allowed on the panel (spec §4). */
function CloudMotif() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="pointer-events-none absolute -right-2 -top-1 w-32 text-accent/15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M10 40c8-14 26-14 32-2 4-12 22-14 30-2 6-10 24-10 30 4" />
      <path d="M30 50c6-8 18-8 22 0 4-7 16-7 20 0" />
      <circle cx="58" cy="26" r="5" />
    </svg>
  );
}
