import { Canvas } from '@react-three/fiber';
import { useSim, viewSite } from '../store/sim';
import { CameraRig, FlyToSelection } from './CameraRig';
import { Forklifts } from './Forklifts';
import { HitAreas } from './HitAreas';
import { Overlays } from './Overlays';
import { sceneColor } from './palette';
import { Pallets } from './Pallets';
import { PerfProbe } from './PerfProbe';
import { SiteScenery } from './SiteScenery';
import { Trucks } from './Trucks';
import { YardProps } from './YardProps';

export const MAX_DPR = 1.5; // spec P2 budget

/** Full-screen scene root (spec 5). Sits under every HUD panel. */
export function World() {
  const site = useSim(viewSite);
  const c = site.worldPos;

  return (
    <Canvas
      data-scene="world"
      className="!absolute inset-0"
      dpr={[1, MAX_DPR]}
      flat
      shadows="soft"
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 1, far: 1500, position: [c[0] + 90, 100, c[2] + 120] }}
    >
      <color attach="background" args={[sceneColor.sky]} />
      {/* Lavender haze at the far edges (spec 5.3). */}
      <fog attach="fog" args={[sceneColor.sky, 320, 760]} />
      <hemisphereLight args={['#ffffff', '#d2d8eb', 2.1]} />
      <directionalLight
        position={[c[0] + 60, 110, c[2] + 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-radius={4}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={10}
        shadow-camera-far={300}
      >
        <object3D attach="target" position={c} />
      </directionalLight>

      <SiteScenery site={site} />
      <YardProps site={site} />
      <Trucks siteId={site.id} />
      <Forklifts siteId={site.id} />
      <Pallets siteId={site.id} />
      <HitAreas site={site} />
      <Overlays />
      <CameraRig center={c} />
      <FlyToSelection />
      <PerfProbe />
    </Canvas>
  );
}
