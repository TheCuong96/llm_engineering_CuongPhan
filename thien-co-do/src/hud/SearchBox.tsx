import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { vi } from '../i18n/vi';
import { useSim } from '../store/sim';
import { selectEntity } from './hooks';
import { searchWorld, SEARCH_ORDER, type SearchHit } from './search';

const t = vi.topBar;

/** Global search (spec §4.7): "/" focuses, ↑↓ moves, Enter selects and flies there, Esc closes. */
export function SearchBox() {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const viewPeakId = useSim((s) => s.viewPeakId);
  const hits = useMemo(
    () => (query.trim() ? searchWorld(useSim.getState().world, query, viewPeakId) : []),
    [query, viewPeakId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (hit: SearchHit | undefined) => {
    if (!hit) return;
    selectEntity(hit.target, hit.peakId);
    setQuery('');
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div className="relative">
      <label className="flex h-9 w-[min(28vw,420px)] max-md:w-[27vw] items-center gap-2 rounded-full bg-white/70 px-3 text-ink-muted ring-1 ring-accent/10 focus-within:ring-2 focus-within:ring-accent/50">
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <input
          ref={input}
          type="search"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls="search-results"
          aria-activedescendant={hits[active] ? `search-${hits[active]!.kind}-${hits[active]!.id}` : undefined}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, hits.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              choose(hits[active]);
            } else if (e.key === 'Escape') {
              setQuery('');
              input.current?.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
        />
        <kbd className="rounded-md bg-neutral-bg px-1.5 text-[11px] font-medium text-neutral-ink max-md:hidden">{t.searchHint}</kbd>
      </label>

      {open && query.trim() && (
        <div
          id="search-results"
          role="listbox"
          data-hud="search-results"
          className="hud-panel absolute left-0 top-11 z-30 max-h-[60vh] w-[min(34vw,480px)] overflow-auto p-2 max-md:fixed max-md:inset-x-2 max-md:top-[calc(var(--hud-top)+4px)] max-md:w-auto"
        >
          {hits.length === 0 && <p className="px-3 py-2 text-[13px] text-ink-muted">{vi.search.noResults}</p>}
          {SEARCH_ORDER.map((kind) => {
            const group = hits.filter((h) => h.kind === kind);
            if (!group.length) return null;
            return (
              <div key={kind} className="py-1">
                <p className="eyebrow px-3 py-1">{vi.search.groups[kind]}</p>
                {group.map((h) => {
                  const i = hits.indexOf(h);
                  return (
                    <div
                      key={`${h.kind}-${h.id}`}
                      id={`search-${h.kind}-${h.id}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        choose(h);
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-[10px] px-3 py-1.5 text-[13px] ${i === active ? 'bg-accent-tint text-accent-ink' : ''}`}
                    >
                      <span className="truncate font-medium">{h.title}</span>
                      <span className="shrink-0 text-[12px] text-ink-muted">{h.subtitle}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {hits.length > 0 && <p className="border-t border-ink/5 px-3 pt-2 text-[11px] text-ink-muted">{vi.search.hint}</p>}
        </div>
      )}
    </div>
  );
}
