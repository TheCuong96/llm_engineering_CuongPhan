import * as Popover from '@radix-ui/react-popover';
import { Bell, Box, ChevronDown, ChevronRight, Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '../design/primitives';
import { SPEED_MAX, SPEED_MIN } from '../sim/clock';
import { siteSummary } from '../sim/hudSelectors';
import { fillPct } from '../sim/selectors';
import type { World } from '../sim/world';
import { useSim } from '../store/sim';
import { selectEntity, switchSite, useSimTick } from './hooks';
import { collectNotices, useNotices } from './notifications';
import { SearchBox } from './SearchBox';
import { simClockLabel, timeAt } from './viewModels';

const popoverCls =
  'z-30 rounded-card border border-white/70 bg-white/95 p-2 shadow-hud backdrop-blur-[16px] outline-none data-[state=open]:animate-none';

/** A. Top bar (spec 4.1): logo · search (/) · site switcher · Live clock · bell · avatar. */
export function TopBar() {
  const { world, viewSiteId } = useSimTick();
  return (
    // z-20: backdrop-blur makes the bar its own stacking context, so the search results inside it
    // can only rise above the KPI cards if the bar itself does.
    <header
      data-region="topbar"
      className="absolute top-3 right-3 left-3 z-20 flex h-16 items-center gap-4 rounded-card border border-white/70 bg-topbar/90 px-4 shadow-hud backdrop-blur-[16px]"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-white">
          <Box size={20} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span className="text-[19px] font-bold tracking-tight">DockSight</span>
      </div>

      <SearchBox />
      <SiteSwitcher world={world} viewSiteId={viewSiteId} />

      <div className="flex-1" />

      <LiveClock world={world} />
      <Notifications world={world} />
      <div className="h-8 w-px bg-line" aria-hidden="true" />
      <div data-slot="avatar" className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-full bg-lavender text-[13px] font-bold text-ink">DW</span>
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold">Dana Whitfield</span>
          <span className="block text-[11.5px] text-ink-muted">Operations Manager</span>
        </span>
        <ChevronDown size={16} className="text-ink-muted" aria-hidden="true" />
      </div>
    </header>
  );
}

function siteLine(world: World, siteId: string) {
  const sum = siteSummary(world, siteId);
  return `${Math.round(fillPct(world, siteId))}% full · ${sum.occupiedBays}/${sum.totalBays} docked`;
}

/** Badge + name + "78% full · 1/2 docked", a next-site button and a dropdown of every site. */
function SiteSwitcher({ world, viewSiteId }: { world: World; viewSiteId: string }) {
  const [open, setOpen] = useState(false);
  const site = world.sites.find((s) => s.id === viewSiteId)!;
  const next = () => {
    const i = world.sites.findIndex((s) => s.id === viewSiteId);
    switchSite(world.sites[(i + 1) % world.sites.length]!.id);
  };
  return (
    <div data-slot="site-switcher" className="flex h-11 items-center gap-1 rounded-full bg-white pr-1 pl-1.5">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          aria-label={`Site ${site.id} ${site.name}, choose site`}
          className="flex min-w-0 items-center gap-2.5 rounded-full py-1 pr-2 pl-0.5 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="rounded-full bg-accent px-2 py-1 text-[11.5px] font-bold text-white tabular-nums">{site.id}</span>
          <span className="min-w-0 text-left leading-tight">
            <span className="block truncate text-[13px] font-semibold">{site.name}</span>
            <span data-site-line className="block truncate text-[11.5px] text-ink-muted tabular-nums">
              {siteLine(world, site.id)}
            </span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start" sideOffset={8} className={`${popoverCls} w-72`}>
            <ul aria-label="Sites">
              {world.sites.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    data-site-option={s.id}
                    onClick={() => {
                      switchSite(s.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-tile px-2.5 py-2 text-left hover:bg-tile focus-visible:outline-2 focus-visible:outline-accent ${s.id === viewSiteId ? 'bg-tile' : ''}`}
                  >
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">{s.id}</span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-[13px] font-semibold">{s.name}</span>
                      <span className="block truncate text-[11.5px] text-ink-muted">{siteLine(world, s.id)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <button
        type="button"
        aria-label="Next site"
        title="Next site"
        onClick={next}
        disabled={world.sites.length < 2}
        className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-tile focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const SPEEDS = [1, 12, 30, 60];

/** Green "Live 09:40" chip with a blinking dot; opens the sim speed (1×–60×) and pause control. */
function LiveClock({ world }: { world: World }) {
  const clock = useSim((s) => s.clock);
  useSim((s) => s.version);
  const set = (fn: () => void) => {
    fn();
    useSim.setState((s) => ({ version: s.version + 1 }));
  };
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={`Simulation clock ${simClockLabel(world)}, ${clock.paused ? 'paused' : `${clock.speed}×`}`} className="rounded-full focus-visible:outline-2 focus-visible:outline-accent">
        <Chip tone={clock.paused ? 'neutral' : 'success'} className="gap-1.5 !py-1">
          <span aria-hidden="true" className={`size-2 rounded-full bg-success-bar ${clock.paused ? 'opacity-40' : 'animate-pulse motion-reduce:animate-none'}`} />
          <span>{clock.paused ? 'Paused' : 'Live'}</span>
          <span data-live-clock className="tabular-nums">{simClockLabel(world)}</span>
        </Chip>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className={`${popoverCls} w-56 p-3`}>
          <div className="text-eyebrow font-semibold tracking-[0.08em] text-accent uppercase">Simulation speed</div>
          <div className="mt-2 flex gap-1.5" role="group" aria-label="Simulation speed">
            {SPEEDS.filter((s) => s >= SPEED_MIN && s <= SPEED_MAX).map((s) => (
              <button
                key={s}
                type="button"
                data-speed={s}
                aria-pressed={clock.speed === s}
                onClick={() => set(() => clock.setSpeed(s))}
                className="flex-1 rounded-full py-1 text-[12.5px] font-semibold tabular-nums hover:bg-tile focus-visible:outline-2 focus-visible:outline-accent aria-pressed:bg-accent aria-pressed:text-white"
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            type="button"
            data-pause
            onClick={() => set(() => clock.togglePause())}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-tile py-1.5 text-[12.5px] font-semibold hover:bg-chip-info-bg focus-visible:outline-2 focus-visible:outline-accent"
          >
            {clock.paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            {clock.paused ? 'Resume' : 'Pause'}
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Bell: a filter over the event log (spec 4.7). The dot counts unread; clicking a notice selects its entity. */
function Notifications({ world }: { world: World }) {
  const lastRead = useNotices((s) => s.lastReadSeq);
  const markRead = useNotices((s) => s.markRead);
  const notices = collectNotices(world);
  const unread = notices.filter((n) => n.seq > lastRead).length;
  return (
    <Popover.Root onOpenChange={(open) => open && notices[0] && markRead(notices[0].seq)}>
      <Popover.Trigger
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative grid size-10 place-items-center rounded-full text-ink-muted hover:bg-white focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Bell size={18} aria-hidden="true" />
        {unread > 0 && (
          <span data-unread={unread} className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-4 font-bold text-white tabular-nums">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className={`${popoverCls} max-h-[60vh] w-80 overflow-y-auto`}>
          <div className="px-2 pt-1 pb-2 text-eyebrow font-semibold tracking-[0.08em] text-accent uppercase">Notifications</div>
          {notices.length === 0 && <p className="px-2 pb-2 text-[13px] text-ink-muted">All clear.</p>}
          <ul>
            {notices.map((n) => (
              <li key={n.seq}>
                <Popover.Close asChild>
                  <button
                    type="button"
                    data-notice={n.target.id}
                    onClick={() => selectEntity(n.target, n.siteId)}
                    className="flex w-full items-start gap-2.5 rounded-tile px-2 py-2 text-left hover:bg-tile focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${n.seq > lastRead ? 'bg-accent' : 'bg-line'}`} />
                    <span className="min-w-0 flex-1 text-[13px] leading-snug">{n.text}</span>
                    <span className="shrink-0 text-[11.5px] text-ink-muted tabular-nums">{timeAt(world, n.t)}</span>
                  </button>
                </Popover.Close>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
