import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { Color, DoubleSide, PlaneGeometry, ShaderMaterial } from 'three';
import { effects, useQuality } from '../store/quality';

const geometry = new PlaneGeometry(4, 34, 1, 1).translate(0, -17, 0);

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// No texture (spec §5.3): falling streaks are a procedural stripe pattern whose v coordinate
// slides with time — the "UV trượt" of spec §5.2 — fading into the cloud sea at the bottom.
const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFoam;
  uniform vec3 uWater;
  varying vec2 vUv;
  void main() {
    float v = vUv.y + uTime * 0.35;
    float streak = smoothstep(0.55, 1.0, sin((vUv.x * 9.0 + sin(v * 3.0)) * 3.1416) * 0.5 + 0.5);
    float flow = fract(v * 4.0 + vUv.x * 0.7);
    vec3 c = mix(uWater, uFoam, streak * (0.4 + 0.6 * flow));
    float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float fade = smoothstep(0.0, 0.45, vUv.y);
    gl_FragColor = vec4(c, 0.85 * edge * fade);
  }
`;

/** Thác nước spilling off the island rim; its motion is the last effect to stop (static at step 4). */
export function Waterfall() {
  const moving = useQuality((s) => effects(s.level).waterfallMotion);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: { uTime: { value: 0 }, uFoam: { value: new Color('#FFFFFF') }, uWater: { value: new Color('#BFD3E6') } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [],
  );
  useFrame((_, dt) => {
    if (moving) material.uniforms.uTime!.value += dt;
  });
  // Peak-local: on the rim behind the hall, away from the pad edge (+X).
  return (
    <group name="waterfall" position={[-27, -0.6, -20]} rotation={[0, Math.PI * 0.8, 0]}>
      <mesh geometry={geometry} material={material} renderOrder={5} raycast={() => null} />
    </group>
  );
}
