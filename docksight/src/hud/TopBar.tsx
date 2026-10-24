import { Bell, Box, ChevronDown, Search } from 'lucide-react';

/** A. Top bar: logo · search (/) · site switcher · Live clock · bell · avatar. Content arrives in P4. */
export function TopBar() {
  return (
    <header
      data-region="topbar"
      className="absolute top-3 right-3 left-3 flex h-16 items-center gap-4 rounded-card border border-white/70 bg-topbar/90 px-4 shadow-hud backdrop-blur-[16px]"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-white">
          <Box size={20} strokeWidth={2.2} />
        </span>
        <span className="text-[19px] font-bold tracking-tight">DockSight</span>
      </div>

      <div data-slot="search" className="flex h-10 w-[min(420px,28vw)] items-center gap-2 rounded-full bg-white px-4 text-ink-muted">
        <Search size={16} />
        <span className="flex-1 truncate">Search sites, trucks, forklifts, pallets, shipments...</span>
        <kbd className="rounded-md border border-line px-1.5 text-[11px]">/</kbd>
      </div>

      <div data-slot="site-switcher" className="h-11 w-[min(280px,18vw)] rounded-full bg-white" />

      <div className="flex-1" />

      <div data-slot="live" className="h-7 w-24 rounded-full bg-chip-success-bg" />
      <button type="button" aria-label="Notifications" className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-white">
        <Bell size={18} />
      </button>
      <div className="h-8 w-px bg-line" />
      <div data-slot="avatar" className="flex items-center gap-2">
        <span className="size-9 rounded-full bg-lavender" />
        <ChevronDown size={16} className="text-ink-muted" />
      </div>
    </header>
  );
}
