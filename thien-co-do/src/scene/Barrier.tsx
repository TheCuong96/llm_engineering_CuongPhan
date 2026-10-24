import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, BackSide, Color, FrontSide, ShaderMaterial, SphereGeometry, Vector3 } from 'three';
import { color } from '../design/tokens';
import { BARRIER_RADIUS } from '../sim/layout';
import type { Peak } from '../sim/types';
import { useSim } from '../store/sim';

export const RIPPLE_S = 0.6; // spec §5.4: the dome shows for 0.6 s
const geometry = new SphereGeometry(BARRIER_RADIUS, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);

/** Static faint dome for far peaks (LOD): same fresnel rim, never ripples. */
export function lodDomeMaterial(): ShaderMaterial {
  return lodDome;
}
export const domeGeometry = geometry;

declare global {
  interface Window {
    __barrier?: { ripples: number; lastRippleAt: number };
  }
}
const barrierState = { ripples: 0, lastRippleAt: -1 };
if (typeof window !== 'undefined') window.__barrier = barrierState;

const vertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

// ("active" is a reserved word in GLSL ES 3.0, hence "flash".)
// Faint fresnel rim at rest; on a crossing the whole dome brightens and a ring spreads
// from the contact point, both fading over RIPPLE_S.
const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uOrigin;
  uniform float uAge;
  uniform float uDuration;
  uniform float uRadius;
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
    float k = clamp(uAge / uDuration, 0.0, 1.0);
    float flash = uAge >= 0.0 && uAge <= uDuration ? 1.0 - k : 0.0;
    float d = distance(vWorld, uOrigin);
    float front = k * uRadius * 1.6;
    float band = smoothstep(4.0, 0.0, abs(d - front)) * flash;
    float alpha = fresnel * (0.05 + 0.35 * flash) + band * 0.45;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const lodDome = new ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uColor: { value: new Color(color.accent) },
    uOrigin: { value: new Vector3() },
    uAge: { value: -1 },
    uDuration: { value: RIPPLE_S },
    uRadius: { value: BARRIER_RADIUS },
  },
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
});

/**
 * Hộ Sơn Đại Trận: a near-invisible violet dome that flashes with a ripple whenever the gate
 * opens for a ship (barrier_opened). Transparent, no depth writes, own render order (spec §12).
 */
export function Barrier({ peak }: { peak: Peak }) {
  const seen = useRef(-1);
  const startedAt = useRef(-1e9);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color.accent) },
      uOrigin: { value: new Vector3() },
      uAge: { value: -1 },
      uDuration: { value: RIPPLE_S },
      uRadius: { value: BARRIER_RADIUS },
    }),
    [],
  );
  const materials = useMemo(
    () =>
      [BackSide, FrontSide].map(
        (side) =>
          new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending, side }),
      ),
    [uniforms],
  );

  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useFrame(({ clock }) => {
    const { world } = useSim.getState();
    const { events, seq } = world.log;
    if (seen.current < 0) seen.current = seq; // ignore history on mount / peak switch
    const fresh = Math.min(seq - seen.current, events.length);
    for (let i = events.length - fresh; i < events.length; i++) {
      const e = events[i]!;
      if (e.type !== 'barrier_opened' || e.peakId !== peak.id) continue;
      const ship = world.ships.get(e.entityId);
      uniforms.uOrigin.value.set(...(ship?.pos ?? peak.geometry.gate));
      startedAt.current = clock.elapsedTime;
      barrierState.ripples++;
      barrierState.lastRippleAt = world.t;
    }
    seen.current = seq;
    uniforms.uAge.value = clock.elapsedTime - startedAt.current;
  });

  return (
    <group position={peak.geometry.center} name="barrier">
      {materials.map((m, i) => (
        <mesh key={i} geometry={geometry} material={m} renderOrder={10 + i} raycast={() => null} />
      ))}
    </group>
  );
}
