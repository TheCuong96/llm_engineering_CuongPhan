import type { Peak as PeakModel } from '../sim/types';
import { Hall } from './Hall';
import { Island } from './Island';
import { Landmarks } from './Landmarks';
import { Pad } from './Pad';
import { Pines } from './Pines';
import { Racks } from './Racks';
import { Vault } from './Vault';
import { Waterfall } from './Waterfall';

const seedOf = (id: string) => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Full-detail diorama of one peak. Children use the same peak-local frame as
 * sim/layout.ts (group rotation.y = facingRad), so engine anchors land on the props.
 */
export function Peak({ peak, visible = true }: { peak: PeakModel; visible?: boolean }) {
  const seed = seedOf(peak.id);
  return (
    <group name={visible ? `peak:${peak.id}` : `peak-hidden:${peak.id}`} visible={visible}>
      <group position={peak.worldPos} rotation={[0, peak.facingRad, 0]}>
        <Island seed={seed} peakId={peak.id} snowy={peak.kind === 'cold_vault'} />
        <Landmarks kind={peak.kind} />
        {peak.kind !== 'cold_vault' && <Waterfall />}
        <Hall position={[-25, 0, 3]} tiers={peak.kind === 'main' ? 3 : 2} />
        <Vault position={[-19, 0, -8]} />
        <Pines seed={seed} />
        <Racks />
      </group>
      {peak.pads.map((pad, i) => (
        <Pad key={pad.id} pad={pad} index={i} facingRad={peak.facingRad} peakId={peak.id} />
      ))}
    </group>
  );
}
