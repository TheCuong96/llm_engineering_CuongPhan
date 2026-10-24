import { CameraControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import CameraControlsImpl from 'camera-controls';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Box3, Vector3 } from 'three';
import type { Vec3 } from '../sim/geometry';
import { useCamera } from '../store/camera';
import { useSelection } from '../store/selection';
import { useSim } from '../store/sim';
import { entityPos, FRAME } from './entityPos';

const { ACTION } = CameraControlsImpl;

declare global {
  interface Window {
    __view?: { azimuth: number; polar: number; distance: number; target: [number, number, number] };
  }
}

const scratch = new Vector3();
const deg = (d: number) => (d * Math.PI) / 180;

// Isometric-style framing (spec 5.1): tilt 35–50° above the horizon, 90° rotation steps,
// bounded distance and pan so the user cannot get lost.
export const VIEW = {
  polarDefault: deg(90 - 42),
  polarMin: deg(90 - 50),
  polarMax: deg(90 - 35),
  azimuthDefault: deg(32), // from the front-right, looking at the dock face
  distanceDefault: 235, // the whole fenced compound plus the road fits between the HUD panels
  distanceMin: 25,
  distanceMax: 320,
  /** Look slightly in front of the dock face so yard and road share the frame. */
  targetOffset: [0, 0, 4] as Vec3,
  /** Shift the projection centre into the HUD-free area (left of the detail panel, above the bottom bar). */
  viewOffset: { x: 0.12, y: 0.06 },
  panHalfExtent: 70, // reaches the gate at x = −50 so trucks queuing there can be framed
  zoomStep: 22,
};

function homePosition(target: Vec3, azimuth: number, polar: number, distance: number): Vec3 {
  return [
    target[0] + distance * Math.sin(polar) * Math.sin(azimuth),
    target[1] + distance * Math.cos(polar),
    target[2] + distance * Math.sin(polar) * Math.cos(azimuth),
  ];
}

/**
 * Flies the camera to the selection whenever someone asks (search Enter, a board row, a
 * notification, the locate button). Retries for a couple of seconds while the entity has not
 * been drawn yet, e.g. right after a site switch.
 */
export function FlyToSelection() {
  const pending = useRef({ request: useSelection.getState().flyRequest, tries: 0 });
  useFrame(() => {
    const p = pending.current;
    const { flyRequest, selected } = useSelection.getState();
    if (flyRequest !== p.request) {
      p.request = flyRequest;
      p.tries = 120;
    }
    if (p.tries <= 0) return;
    const api = useCamera.getState().api;
    if (!api) return;
    if (!selected || selected.kind === 'site') {
      if (selected?.kind === 'site') api.reset();
      p.tries = 0;
      return;
    }
    const pos = entityPos(useSim.getState().world, selected);
    p.tries--;
    if (!pos) return;
    api.focus(pos, FRAME[selected.kind].flyDistance);
    p.tries = 0;
  });
  return null;
}

/** Drag = pan, wheel = zoom, rotation only through the HUD buttons in 90° steps. */
export function CameraRig({ center }: { center: Vec3 }) {
  const ref = useRef<CameraControlsImpl>(null);
  const reduced = useReducedMotion() ?? false;
  const register = useCamera((s) => s.register);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    const { width: w, height: h } = size;
    if (!('setViewOffset' in camera)) return;
    camera.setViewOffset(w, h, w * VIEW.viewOffset.x, h * VIEW.viewOffset.y, w, h);
    return () => camera.clearViewOffset();
  }, [camera, size]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const target: Vec3 = [center[0] + VIEW.targetOffset[0], center[1] + VIEW.targetOffset[1], center[2] + VIEW.targetOffset[2]];
    const e = VIEW.panHalfExtent;
    c.setBoundary(new Box3(new Vector3(target[0] - e, -10, target[2] - e), new Vector3(target[0] + e, 20, target[2] + e)));
    void c.setLookAt(...homePosition(target, VIEW.azimuthDefault, VIEW.polarDefault, VIEW.distanceDefault), ...target, false);
    c.saveState();

    const animate = !reduced;
    register({
      zoomIn: () => void c.dolly(VIEW.zoomStep, animate),
      zoomOut: () => void c.dolly(-VIEW.zoomStep, animate),
      rotateLeft: () => void c.rotate(deg(-90), 0, animate),
      rotateRight: () => void c.rotate(deg(90), 0, animate),
      reset: () => void c.reset(animate),
      focus: (pos, distance) => {
        void c.moveTo(pos[0], pos[1], pos[2], animate);
        if (c.distance > distance) void c.dollyTo(distance, animate);
      },
    });
    return () => register(null);
  }, [center, reduced, register]);

  useFrame(() => {
    const c = ref.current;
    if (!c) return;
    const t = c.getTarget(scratch);
    window.__view = { azimuth: c.azimuthAngle, polar: c.polarAngle, distance: c.distance, target: [t.x, t.y, t.z] };
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minPolarAngle={VIEW.polarMin}
      maxPolarAngle={VIEW.polarMax}
      minDistance={VIEW.distanceMin}
      maxDistance={VIEW.distanceMax}
      smoothTime={reduced ? 0 : 0.35}
      mouseButtons={{ left: ACTION.TRUCK, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.DOLLY }}
      touches={{ one: ACTION.TOUCH_TRUCK, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
    />
  );
}
