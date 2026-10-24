import { Panel } from '../design/primitives';

const STEPS = ['Order Confirmed', 'Picked', 'Loading', 'In Transit', 'Delivered'];

/** E. Shipment tracking, bottom-left: five-step stepper + shipment card. Driven by the selected truck in P4. */
export function ShipmentTracking() {
  return (
    <Panel
      data-region="tracking"
      className="absolute flex gap-5 p-4"
      style={{ left: 'var(--hud-gap)', bottom: 'var(--hud-gap)', width: 'var(--hud-track-w)', height: 'var(--hud-track-h)' }}
    >
      <ol className="flex flex-[3] items-start justify-between">
        {STEPS.map((step) => (
          <li key={step} className="flex flex-1 flex-col items-center gap-2 text-center text-ink-muted">
            <span className="size-8 rounded-full bg-tile" />
            <span className="text-[12px]">{step}</span>
          </li>
        ))}
      </ol>
      <div className="flex-[2] rounded-tile bg-tile" />
    </Panel>
  );
}
