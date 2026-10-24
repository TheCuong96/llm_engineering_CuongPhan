import { Selection } from '@react-three/postprocessing';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import type { DirectionalLight, HemisphereLight } from 'three';
import { add } from '../sim/geometry';
import { useSim, viewPeak } from '../store/sim';
import { SceneUnavailable, useSceneStatus } from '../hud/SceneStatus';
import { Barrier } from './Barrier';
import { CameraRig, FlyToSelection } from './CameraRig';
import { Chests } from './Chests';
import { Cranes } from './Cranes';
import { Effects, QualityGovernor } from './Effects';
import { GatheringArrays } from './GatheringArrays';
import { CloudSea } from './CloudSea';
import { sceneColor } from './palette';
import { Peak } from './Peak';
import { Overlays } from './Overlays';
import { OverviewChips } from './OverviewChips';
import { PeakLod } from './PeakLod';
import { TransitShips } from './TransitShips';
import { PerfProbe } from './PerfProbe';
import { Ships } from './Ships';
import { Workers } from './Workers';

export const MAX_DPR = 1.5; // spec §9 / P2 budget

// ?crashScene makes a scene component throw, to exercise the error state (P7).
const crashOnPurpose = new URLSearchParams(location.search).has('crashScene');
function Crash(): null {
  throw new Error('crashScene: deliberate scene failure');
}

/** Full-screen scene root (spec §5). Sits under every HUD panel. */
export function World() {
  const peak = useSim(viewPeak);
  const peaks = useSim((s) => s.world.peaks);
  const hemi = useRef<HemisphereLight>(null);
  const sun = useRef<DirectionalLight>(null);
  const center = peak.worldPos;

  return (
    <Canvas
      data-scene="world"
      className="!absolute inset-0"
      dpr={[1, MAX_DPR]}
      flat
      shadows="soft"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      fallback={<SceneUnavailable reason="webgl" />}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener('webglcontextlost', () => useSceneStatus.setState({ contextLost: true }));
        canvas.addEventListener('webglcontextrestored', () => useSceneStatus.setState({ contextLost: false }));
      }}
      camera={{ fov: 32, near: 1, far: 2500, position: add(center, [80, 90, 80]) }}
    >
      <color attach="background" args={[sceneColor.sky]} />
      <fog attach="fog" args={[sceneColor.sky, 220, 900]} />
      <Selection>
      <hemisphereLight ref={hemi} args={['#FFF6E6', '#DCD6EA', 1.9]} />
      <directionalLight
        ref={sun}
        position={add(center, [90, 120, -30])} // soft key light from the east
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={10}
        shadow-camera-far={400}
      >
        <object3D attach="target" position={center} />
      </directionalLight>

      {/* All five dioramas stay mounted; switching only flips visibility (no rebuild, no GPU churn). */}
      {peaks.map((p) => (
        <Peak key={p.id} peak={p} visible={p.id === peak.id} />
      ))}
      {peaks.map((p) => (
        <PeakLod key={p.id} peak={p} visible={p.id !== peak.id} />
      ))}
      <TransitShips />
      <OverviewChips />
      <GatheringArrays peak={peak} />
      <Ships peakId={peak.id} />
      <Workers peakId={peak.id} />
      <Chests peakId={peak.id} />
      <Barrier key={peak.id} peak={peak} />
      <Overlays />
      <CloudSea center={[0, 0, 0]} count={300} />
      <CameraRig target={center} facingRad={peak.facingRad} />
      <FlyToSelection />
      <Cranes center={center} />
      <Effects lights={[hemi, sun]} />
      </Selection>
      <QualityGovernor />
      <PerfProbe />
      {crashOnPurpose && <Crash />}
    </Canvas>
  );
}
