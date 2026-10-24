import { Canvas } from '@react-three/fiber';
import { PlaneGeometry } from 'three';
import { useSim, viewSite } from '../store/sim';
import { CameraRig, FlyToSelection } from './CameraRig';
import { Forklifts } from './Forklifts';
import { HitAreas } from './HitAreas';
import { Overlays } from './Overlays';
import { mat, sceneColor } from './palette';
import { Pallets } from './Pallets';
import { PerfProbe } from './PerfProbe';
import { SiteScenery } from './SiteScenery';
import { Trucks } from './Trucks';
import { YardProps } from './YardProps';

const mapGround = new PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2);

export const MAX_DPR = 1.5; // spec P2 budget

/** Full-screen scene root (spec 5). Sits under every HUD panel. */
export function World() {
  const site = useSim(viewSite);
  const sites = useSim((s) => s.world.sites);
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

      {/* Shared ground under every site: flights between sites pass over land, not a void. */}
      <mesh name="map-ground" geometry={mapGround} material={mat.ground} position={[700, -0.02, 300]} receiveShadow />
      {/* All five dioramas stay mounted; switching only flips visibility (no rebuild, no GPU churn). */}
      {sites.map((s) => (
        <SiteScenery key={s.id} site={s} visible={s.id === site.id} />
      ))}
      {sites.map((s) => (
        <YardProps key={s.id} site={s} visible={s.id === site.id} />
      ))}
      <Trucks siteId={site.id} />
      <Forklifts siteId={site.id} />
      <Pallets siteId={site.id} />
      <HitAreas key={site.id} site={site} />
      <Overlays />
      <CameraRig center={c} />
      <FlyToSelection />
      <PerfProbe />
    </Canvas>
  );
}
