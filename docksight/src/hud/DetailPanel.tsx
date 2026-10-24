import { Eyebrow, Panel } from '../design/primitives';

/** D. Detail panel, right column between the top bar and the fleet board. Five variants land in P4. */
export function DetailPanel() {
  return (
    <Panel
      data-region="detail"
      className="absolute p-5"
      style={{
        top: 'var(--hud-top)',
        right: 'var(--hud-gap)',
        width: 'var(--hud-detail-w)',
        bottom: 'calc(var(--hud-fleet-h) + var(--hud-gap) * 2)',
      }}
    >
      <Eyebrow>Depot · WH-01</Eyebrow>
      <div className="mt-2 h-6 w-2/3 rounded-md bg-tile" />
      <div className="mt-2 h-4 w-1/2 rounded-md bg-tile" />
    </Panel>
  );
}
