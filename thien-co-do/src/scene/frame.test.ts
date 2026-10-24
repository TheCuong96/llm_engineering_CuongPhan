import { Object3D, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { peakPresets } from '../data/peaks';
import { facingRad, toWorld } from '../sim/layout';

// Peak.tsx places props in a group rotated by facingRad; this proves that group frame
// is the same transform the engine uses for pads, gate, vault door and yard slots.
describe('scene frame matches sim/layout.toWorld', () => {
  it.each(peakPresets.map((p) => [p.id, p] as const))('%s', (_id, preset) => {
    const g = new Object3D();
    g.position.set(...preset.worldPos);
    g.rotation.y = facingRad(preset);
    g.updateMatrixWorld();
    for (const local of [[30, 0, 0], [-14, 0, -8], [5, 2, 17], [0, 12, -40]] as const) {
      const viaThree = g.localToWorld(new Vector3(...local));
      const viaSim = toWorld(preset, [...local]);
      expect(viaThree.distanceTo(new Vector3(...viaSim))).toBeLessThan(1e-9);
    }
  });
});
