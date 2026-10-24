import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSim } from '../store/sim';
import { selectEntity } from './hooks';
import { GROUP_LABEL, searchWorld, type SearchHit } from './search';

/** Global search (spec 4.7): "/" focuses, ↑↓ moves, Enter selects + flies there, Esc closes. */
export function SearchBox() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const viewSiteId = useSim((s) => s.viewSiteId);
  const hits = useMemo(() => (open ? searchWorld(useSim.getState().world, query, viewSiteId) : []), [query, open, viewSiteId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setActive(0), [query]);

  const choose = (hit: SearchHit | undefined) => {
    if (!hit) return;
    selectEntity(hit.target, hit.siteId);
    setOpen(false);
    setQuery('');
    input.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      choose(hits[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      input.current?.blur();
    }
  };

  const showList = open && query.trim().length > 0;
  return (
    <div data-slot="search" className="relative w-[min(420px,28vw)]">
      <label className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-ink-muted focus-within:outline-2 focus-within:outline-accent">
        <Search size={16} aria-hidden="true" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls="search-results"
          aria-activedescendant={showList && hits[active] ? `hit-${hits[active]!.kind}-${hits[active]!.id}` : undefined}
          aria-label="Search sites, trucks, forklifts, pallets, shipments"
          placeholder="Search sites, trucks, forklifts, pallets, shipments..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-muted"
        />
        <kbd className="rounded-md border border-line px-1.5 text-[11px]">/</kbd>
      </label>
      {showList && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute top-12 right-0 left-0 z-20 max-h-[60vh] overflow-y-auto rounded-card border border-white/70 bg-white/95 p-2 shadow-hud backdrop-blur-[16px]"
        >
          {hits.length === 0 && <li className="px-3 py-2 text-[13px] text-ink-muted">No matches</li>}
          {hits.map((h, i) => (
            <li key={`${h.kind}:${h.id}`} role="presentation">
              {(i === 0 || hits[i - 1]!.kind !== h.kind) && (
                <div className="px-3 pt-2 pb-1 text-eyebrow font-semibold tracking-[0.08em] text-accent uppercase">{GROUP_LABEL[h.kind]}</div>
              )}
              <div
                id={`hit-${h.kind}-${h.id}`}
                role="option"
                aria-selected={i === active}
                data-hit={h.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(h)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-tile px-3 py-1.5 text-[13px] ${i === active ? 'bg-chip-info-bg' : ''}`}
              >
                <span className="truncate font-medium">{h.title}</span>
                <span className="shrink-0 text-[12px] text-ink-muted">{h.subtitle}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
