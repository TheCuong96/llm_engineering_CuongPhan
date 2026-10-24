import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { Bell, ChevronDown, ChevronRight, Pause } from 'lucide-react';
import { vi } from '../i18n/vi';
import { busyPads, fillPct, simDate } from '../sim/selectors';
import { toCanhGio } from '../sim/canhGio';
import { fmtInt, hhmm } from './format';
import { selectEntity, switchPeak, useSimTick } from './hooks';
import { collectNotices, useNotices } from './notifications';
import { SearchBox } from './SearchBox';
import { SectSeal } from './SectSeal';
import { Chip } from '../design/primitives';

const t = vi.topBar;
const SPEEDS = [1, 12, 60];

export function TopBar() {
  return (
    <header
      data-hud="top-bar"
      className="hud-panel pointer-events-auto absolute inset-x-[var(--hud-gap)] top-2 z-20 flex h-[calc(var(--hud-top)-8px)] items-center gap-4 rounded-[16px] px-3 max-md:inset-x-2 max-md:gap-1 max-md:px-1.5"
    >
      <div className="flex items-center gap-2.5 pr-2 max-md:hidden">
        <SectSeal />
        <span className="font-serif text-[18px] font-semibold tracking-tight max-md:hidden">{vi.app.name}</span>
      </div>
      <SearchBox />
      <PeakSwitcher />
      <div className="flex-1" />
      <LiveChip />
      <Notifications />
      <span className="h-7 w-px bg-ink/10 max-md:hidden" aria-hidden="true" />
      <div className="flex items-center gap-2.5 max-md:hidden">
        <span className="grid size-9 place-items-center rounded-full bg-accent-tint font-serif text-[14px] font-semibold text-accent-ink" aria-hidden="true">
          {t.userName.split(' ').at(-1)?.[0]}
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold">{t.userName}</span>
          <span className="text-[11px] text-ink-muted">{t.userRole}</span>
        </span>
      </div>
    </header>
  );
}

function PeakSwitcher() {
  const { world, viewPeakId } = useSimTick();
  const peak = world.peaks.find((p) => p.id === viewPeakId)!;
  const pads = busyPads(world, peak.id);
  const idx = world.peaks.indexOf(peak);
  const next = world.peaks[(idx + 1) % world.peaks.length]!;

  return (
    <div data-hud="peak-switcher" className="flex shrink-0 items-center gap-2 rounded-full bg-white/60 py-1 pl-1 pr-1 ring-1 ring-accent/10 max-md:gap-0.5">
      <span className="whitespace-nowrap rounded-full bg-accent px-2.5 py-1 text-[12px] font-semibold text-white max-md:px-2">{peak.id}</span>
      <span className="flex min-w-[150px] flex-col leading-tight max-md:hidden">
        <span className="font-serif text-[14px] font-semibold">{peak.name}</span>
        <span className="text-[11px] text-ink-muted">{t.peakSubline(fmtInt(fillPct(world, peak.id)), pads.busy, pads.total)}</span>
      </span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger aria-label={t.peakList} className="grid size-7 place-items-center rounded-full hover:bg-accent-tint focus-visible:ring-2 focus-visible:ring-accent">
          <ChevronDown className="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content data-hud="peak-list" sideOffset={10} align="start" className="hud-panel z-40 w-72 p-1.5">
            {world.peaks.map((p) => (
              <DropdownMenu.Item
                key={p.id}
                onSelect={() => switchPeak(p.id)}
                className="flex cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2 outline-none data-[highlighted]:bg-accent-tint"
              >
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.id === viewPeakId ? 'bg-accent text-white' : 'bg-accent-tint text-accent-ink'}`}>{p.id}</span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-serif text-[14px] font-semibold">{p.name}</span>
                  <span className="text-[11px] text-ink-muted">{t.peakListRow(fmtInt(fillPct(world, p.id)), busyPads(world, p.id).busy)}</span>
                </span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <button
        type="button"
        aria-label={`${t.nextPeak}: ${next.id}`}
        onClick={() => switchPeak(next.id)}
        className="grid size-7 place-items-center rounded-full hover:bg-accent-tint focus-visible:ring-2 focus-visible:ring-accent max-md:hidden"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function LiveChip() {
  const { world, clock } = useSimTick();
  const date = simDate(world);
  const label = t.clock(vi.canhGio[toCanhGio(date)], hhmm(date));
  const setSpeed = (x: number | 'pause') => {
    if (x === 'pause') clock.paused = true;
    else {
      clock.paused = false;
      clock.setSpeed(x);
    }
  };
  return (
    <Popover.Root>
      <Popover.Trigger
        data-hud="live-chip"
        aria-label={`${t.live} · ${label} · ${t.speedTitle}`}
        className="flex items-center gap-2 whitespace-nowrap rounded-full bg-accent-tint px-3 py-1.5 text-[12px] font-medium text-accent-ink focus-visible:ring-2 focus-visible:ring-accent max-md:gap-1 max-md:px-2"
      >
        {clock.paused ? (
          <Pause className="size-3" aria-hidden="true" />
        ) : (
          <span className="size-2 rounded-full bg-accent motion-safe:animate-pulse" aria-hidden="true" />
        )}
        <span className="max-md:hidden">{t.live} · </span>
        {label}
        <span className="text-[11px] opacity-80 max-md:hidden">{clock.paused ? t.pause : t.speed(clock.speed)}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={10} align="end" className="hud-panel z-40 p-2">
          <p className="eyebrow px-2 pb-1">{t.speedTitle}</p>
          <div className="flex gap-1" role="group" aria-label={t.speedTitle}>
            {SPEEDS.map((x) => (
              <button
                key={x}
                type="button"
                data-speed={x}
                aria-pressed={!clock.paused && clock.speed === x}
                onClick={() => setSpeed(x)}
                className="rounded-full px-3 py-1 text-[12px] font-medium aria-pressed:bg-accent aria-pressed:text-white hover:bg-accent-tint"
              >
                {t.speed(x)}
              </button>
            ))}
            <button
              type="button"
              data-speed="pause"
              aria-pressed={clock.paused}
              onClick={() => setSpeed('pause')}
              className="rounded-full px-3 py-1 text-[12px] font-medium aria-pressed:bg-accent aria-pressed:text-white hover:bg-accent-tint"
            >
              {t.pause}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Notifications() {
  const { world } = useSimTick();
  const lastRead = useNotices((s) => s.lastReadSeq);
  const markRead = useNotices((s) => s.markRead);
  const notices = collectNotices(world);
  const unread = notices.filter((n) => n.seq > lastRead).length;

  return (
    <Popover.Root onOpenChange={(open) => !open && notices[0] && markRead(notices[0].seq)}>
      <Popover.Trigger
        aria-label={`${t.notifications}${unread ? ` (${unread})` : ''}`}
        data-hud="bell"
        className="relative grid size-9 place-items-center rounded-full hover:bg-accent-tint focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span data-unread={unread} className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content data-hud="notices" sideOffset={10} align="end" className="hud-panel z-40 w-[360px] p-2">
          <div className="flex items-center justify-between px-2 pb-1">
            <p className="eyebrow">{vi.notify.title}</p>
            {notices[0] && (
              <button type="button" onClick={() => markRead(notices[0]!.seq)} className="text-[12px] text-accent-ink hover:underline">
                {vi.notify.markAllRead}
              </button>
            )}
          </div>
          {notices.length === 0 && <p className="px-2 py-3 text-[13px] text-ink-muted">{vi.notify.empty}</p>}
          <ul className="max-h-[50vh] overflow-auto">
            {notices.map((n) => (
              <li key={n.seq}>
                <Popover.Close asChild>
                  <button
                    type="button"
                    onClick={() => selectEntity(n.target, n.peakId)}
                    className="flex w-full items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-[13px] hover:bg-accent-tint focus-visible:bg-accent-tint focus-visible:outline-none"
                  >
                    <span className={`size-1.5 shrink-0 rounded-full ${n.seq > lastRead ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{n.text}</span>
                    <Chip tone="neutral">{n.peakId}</Chip>
                    <span className="shrink-0 text-[11px] text-ink-muted">{hhmm(new Date(world.startEpochMs + n.t * 1000))}</span>
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
