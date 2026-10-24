import * as Tabs from '@radix-ui/react-tabs';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSelection } from '../store/selection';
import { DetailPanel } from './DetailPanel';
import { FleetBoard } from './FleetBoard';
import { ShipmentTracking } from './ShipmentTracking';

type Section = 'details' | 'fleet' | 'shipment';
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'shipment', label: 'Shipment' },
];
/** Peek leaves the scene visible above the sheet; full is for reading a long card. */
const HEIGHT = { peek: '44vh', full: '82vh' } as const;

/**
 * Phone layout (< 768 px, spec 13): the detail panel, fleet board and shipment tracking share one
 * bottom sheet with tabs, so the scene keeps the top half of the screen.
 */
export function MobileSheet() {
  const reduced = useReducedMotion() ?? false;
  const selected = useSelection((s) => s.selected);
  const [section, setSection] = useState<Section>('details');
  const [size, setSize] = useState<keyof typeof HEIGHT>('peek');

  // Picking something (scene tap, search, a board row) brings its card forward.
  useEffect(() => {
    if (selected) setSection('details');
  }, [selected]);

  return (
    <motion.section
      data-region="sheet"
      data-size={size}
      aria-label="Operations sheet"
      initial={false}
      animate={{ height: HEIGHT[size] }}
      transition={reduced ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-card border border-white/70 bg-white/92 shadow-hud backdrop-blur-[16px]"
    >
      <button
        type="button"
        data-sheet-toggle
        aria-label={size === 'peek' ? 'Expand sheet' : 'Collapse sheet'}
        aria-expanded={size === 'full'}
        onClick={() => setSize((s) => (s === 'peek' ? 'full' : 'peek'))}
        className="mx-auto mt-1.5 flex h-6 w-16 shrink-0 items-center justify-center rounded-full text-ink-muted focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span aria-hidden="true" className="h-1 w-10 rounded-full bg-line" />
      </button>
      <Tabs.Root value={section} onValueChange={(v) => setSection(v as Section)} className="flex min-h-0 flex-1 flex-col">
        <Tabs.List aria-label="Sheet sections" className="flex shrink-0 gap-1.5 px-3 pb-2">
          {SECTIONS.map((s) => (
            <Tabs.Trigger
              key={s.id}
              value={s.id}
              className="flex-1 rounded-full py-1.5 text-[13px] font-semibold text-ink-muted focus-visible:outline-2 focus-visible:outline-accent data-[state=active]:bg-accent data-[state=active]:text-white"
            >
              {s.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="details" className="min-h-0 flex-1 outline-none data-[state=inactive]:hidden">
          <DetailPanel embedded />
        </Tabs.Content>
        <Tabs.Content value="fleet" className="min-h-0 flex-1 outline-none data-[state=inactive]:hidden">
          <FleetBoard embedded />
        </Tabs.Content>
        <Tabs.Content value="shipment" className="min-h-0 flex-1 overflow-y-auto outline-none data-[state=inactive]:hidden">
          <ShipmentTracking embedded />
        </Tabs.Content>
      </Tabs.Root>
    </motion.section>
  );
}
