import { vi } from '../i18n/vi';
import { Panel } from '../design/Panel';

/** Dev-only diacritics check for P0 (`?glyphs`). */
export function GlyphSample() {
  return (
    <Panel data-hud="glyphs" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-2 whitespace-nowrap p-6">
      <p className="font-serif text-[28px] font-semibold">{vi.glyphSample}</p>
      <p className="font-sans text-[28px]">{vi.glyphSample}</p>
    </Panel>
  );
}
