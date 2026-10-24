import * as Tabs from '@radix-ui/react-tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { vi } from '../i18n/vi';
import { useSelection } from '../store/selection';
import { DetailPanel } from './DetailPanel';
import { DispatchBoard } from './DispatchBoard';
import { OrderTracking } from './OrderTracking';

const t = vi.mobile;

/**
 * Small screens (spec §12): the detail card becomes a bottom sheet, and the order bar and the
 * dispatch board fold into tabs of the same sheet. Choosing anything jumps back to the card.
 */
export function MobileSheet() {
  const [tab, setTab] = useState('detail');
  const [open, setOpen] = useState(true);
  const selected = useSelection((s) => s.selected);

  useEffect(() => {
    if (selected) {
      setTab('detail');
      setOpen(true);
    }
  }, [selected]);

  return (
    <section
      data-hud="mobile-sheet"
      data-open={open ? 'true' : 'false'}
      className={`hud-panel pointer-events-auto fixed inset-x-2 bottom-2 flex flex-col overflow-hidden !rounded-b-[18px] transition-[height] duration-300 ${open ? 'h-[48vh]' : 'h-[52px]'}`}
    >
      <Tabs.Root value={tab} onValueChange={(v) => { setTab(v); setOpen(true); }} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-2 pt-2">
          <Tabs.List className="flex flex-1 gap-1 rounded-full bg-neutral-bg p-1" aria-label={t.sheet}>
            {(['detail', 'order', 'dispatch'] as const).map((v) => (
              <Tabs.Trigger
                key={v}
                value={v}
                className="flex-1 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium text-neutral-ink focus-visible:ring-2 focus-visible:ring-accent data-[state=active]:bg-white data-[state=active]:text-accent-ink data-[state=active]:shadow-sm"
              >
                {t.tabs[v]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <button
            type="button"
            aria-label={open ? t.collapse : t.expand}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-accent-tint focus-visible:ring-2 focus-visible:ring-accent"
          >
            {open ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
        <Tabs.Content value="detail" className="min-h-0 flex-1">
          <DetailPanel embedded />
        </Tabs.Content>
        <Tabs.Content value="order" className="min-h-0 flex-1 overflow-y-auto">
          <OrderTracking embedded />
        </Tabs.Content>
        <Tabs.Content value="dispatch" className="min-h-0 flex-1">
          <DispatchBoard embedded />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
