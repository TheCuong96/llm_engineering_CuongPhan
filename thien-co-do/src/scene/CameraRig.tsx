import { CameraControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import CameraControlsImpl from 'camera-controls';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Box3, Fog, PerspectiveCamera, Vector3 } from 'three';
import { motion as motionTokens } from '../design/tokens';
import type { Vec3 } from '../sim/geometry';
import { useCamera } from '../store/camera';
import { useSelection } from '../store/selection';
import { useSim } from '../store/sim';
import { entityPos, FRAME } from './entityPos';

const { ACTION } = CameraControlsImpl;

declare global {
  interface Window {
    __view?: {
      azimuth: number;
      polar: number;
      distance: number;
      target: [number, number, number];
      mode: string;
      flying: boolean;
      lastFlightMs: number;
    };
  }
}

const scratch = new Vector3();
const deg = (d: number) => (d * Math.PI) / 180;

// Isometric-style framing (spec §5.1): tilt 35–50° above the horizon, 90° rotation steps.
export const VIEW = {
  polarDefault: deg(90 - 42),
  polarMin: deg(90 - 50),
  polarMax: deg(90 - 35),
  /** Added to the peak's facing so its pad edge sits to the right, slightly toward the viewer. */
  azimuthFromFacing: deg(30),
  distanceDefault: 165,
  distanceMin: 28,
  distanceMax: 260,
  /** Shift the projection centre into the HUD-free area (left of the detail panel, above the bottom bar). */
  viewOffset: { x: 0.14, y: 0.04 },
  /** Phones: the bottom sheet covers the lower half, so lift the scene instead. */
  viewOffsetMobile: { x: 0, y: 0.2 },
  panHalfExtent: 70, // reaches the barrier gate (55 m) so incoming ships can be framed
  zoomStep: 22,
};

/** Toàn cảnh tông môn: high and far enough to see all five peaks over the cloud sea. */
export const OVERVIEW = { polar: deg(90 - 40), distanceMax: 2600, panHalfExtent: 420, chipLift: 18 };
/** Screen area left free by the HUD (fractions of the viewport), where the overview must fit. */
const FREE = { left: 0.03, right: 0.68, top: 0.24, bottom: 0.74 };
/** Flight over the cloud sea (spec §5.1: 1.2–1.6 s, ease-in-out), arcing this far above both ends. */
const FLIGHT = { ms: motionTokens.cameraFlyMs, lift: 140 };
const FOG = { peak: [220, 900], overview: [1400, 3600] } as const;

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

function homePosition(target: Vec3, azimuth: number, polar: number, distance: number): Vec3 {
  return [
    target[0] + distance * Math.sin(polar) * Math.sin(azimuth),
    target[1] + distance * Math.cos(polar),
    target[2] + distance * Math.sin(polar) * Math.cos(azimuth),
  ];
}

export function sectCentre(): Vec3 {
  const peaks = useSim.getState().world.peaks;
  const n = peaks.length;
  return peaks.reduce<Vec3>((acc, p) => [acc[0] + p.worldPos[0] / n, acc[1] + p.worldPos[1] / n, acc[2] + p.worldPos[2] / n], [0, 0, 0]);
}

/**
 * Smallest camera distance at which every peak (and its chip) projects inside the HUD-free
 * area, found by bisection on a scratch camera that carries the real view offset.
 */
function fitOverviewDistance(camera: PerspectiveCamera, target: Vec3, azimuth: number, peaks: Vec3[]): number {
  const probe = camera.clone();
  const p = new Vector3();
  const fits = (d: number) => {
    probe.position.set(...homePosition(target, azimuth, OVERVIEW.polar, d));
    probe.lookAt(...target);
    probe.updateMatrixWorld();
    return peaks.every(([x, y, z]) =>
      [0, OVERVIEW.chipLift].every((dy) => {
        p.set(x, y + dy, z).project(probe);
        const sx = (p.x + 1) / 2;
        const sy = (1 - p.y) / 2;
        return sx > FREE.left && sx < FREE.right && sy > FREE.top && sy < FREE.bottom;
      }),
    );
  };
  let lo = 300;
  let hi = OVERVIEW.distanceMax;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

interface Flight {
  start: number;
  fromPos: Vec3;
  fromTarget: Vec3;
  toPos: Vec3;
  toTarget: Vec3;
  done: () => void;
}

/**
 * Drag = pan, wheel = zoom, rotation only through the HUD buttons in 90° steps. Changing peak
 * or entering the sect overview flies over the cloud sea; reduced motion swaps that for a fade.
 */
export function CameraRig({ target, facingRad }: { target: Vec3; facingRad: number }) {
  const ref = useRef<CameraControlsImpl>(null);
  const reduced = useReducedMotion() ?? false;
  const register = useCamera((s) => s.register);
  const mode = useCamera((s) => s.mode);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const scene = useThree((s) => s.scene);
  const flight = useRef<Flight | null>(null);
  const lastFlightMs = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    const { width: w, height: h } = size;
    if (!('setViewOffset' in camera)) return;
    const offset = w < 768 ? VIEW.viewOffsetMobile : VIEW.viewOffset;
    camera.setViewOffset(w, h, w * offset.x, h * offset.y, w, h);
    return () => camera.clearViewOffset();
  }, [camera, size]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const azimuth = facingRad + VIEW.azimuthFromFacing;
    const overview = mode === 'overview';
    const goalTarget = overview ? sectCentre() : target;
    const peakPositions = useSim.getState().world.peaks.map((p) => p.worldPos);
    const goalPos = overview
      ? homePosition(goalTarget, azimuth, OVERVIEW.polar, fitOverviewDistance(camera as PerspectiveCamera, goalTarget, azimuth, peakPositions))
      : homePosition(goalTarget, azimuth, VIEW.polarDefault, VIEW.distanceDefault);

    const settle = () => {
      const e = overview ? OVERVIEW.panHalfExtent : VIEW.panHalfExtent;
      const [x, y, z] = goalTarget;
      c.maxDistance = overview ? OVERVIEW.distanceMax : VIEW.distanceMax;
      c.minPolarAngle = VIEW.polarMin;
      c.maxPolarAngle = VIEW.polarMax;
      c.setBoundary(new Box3(new Vector3(x - e, y - 10, z - e), new Vector3(x + e, y + 20, z + e)));
      void c.setLookAt(...goalPos, ...goalTarget, false);
      c.saveState();
      useCamera.setState({ flying: false });
    };

    if (first.current || reduced) {
      if (!first.current) useCamera.setState((s) => ({ fadeNonce: s.fadeNonce + 1 }));
      first.current = false;
      settle();
    } else {
      // Free the controls for the flight (no boundary, wide limits); settle() restores them.
      c.setBoundary(undefined);
      c.maxDistance = OVERVIEW.distanceMax * 1.5;
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI / 2;
      const fromPos = camera.position.toArray() as Vec3;
      const fromTarget = c.getTarget(scratch).toArray() as Vec3;
      useCamera.setState({ flying: true });
      flight.current = { start: performance.now(), fromPos, fromTarget, toPos: goalPos, toTarget: goalTarget, done: settle };
    }

    const animate = !reduced;
    register({
      zoomIn: () => void c.dolly(VIEW.zoomStep, animate),
      zoomOut: () => void c.dolly(-VIEW.zoomStep, animate),
      rotateLeft: () => void c.rotate(deg(-90), 0, animate),
      rotateRight: () => void c.rotate(deg(90), 0, animate),
      reset: () => {
        if (useCamera.getState().mode === 'overview') useCamera.getState().setMode('peak');
        else void c.reset(animate);
      },
      focus: (pos, distance) => {
        void c.moveTo(pos[0], pos[1], pos[2], animate);
        if (c.distance > distance) void c.dollyTo(distance, animate);
      },
    });
    return () => register(null);
  }, [target, facingRad, mode, reduced, register, camera]);

  useFrame(() => {
    const c = ref.current;
    if (!c) return;
    const f = flight.current;
    if (f) {
      const elapsed = performance.now() - f.start;
      const k = Math.min(1, elapsed / FLIGHT.ms);
      const e = easeInOut(k);
      // Quadratic arc: rise over the cloud sea, glide, then descend onto the new view.
      const mid: Vec3 = [
        (f.fromPos[0] + f.toPos[0]) / 2,
        Math.max(f.fromPos[1], f.toPos[1]) + FLIGHT.lift,
        (f.fromPos[2] + f.toPos[2]) / 2,
      ];
      const pos = [0, 1, 2].map((i) => (1 - e) ** 2 * f.fromPos[i]! + 2 * (1 - e) * e * mid[i]! + e * e * f.toPos[i]!) as Vec3;
      const tgt = [0, 1, 2].map((i) => f.fromTarget[i]! + (f.toTarget[i]! - f.fromTarget[i]!) * e) as Vec3;
      void c.setLookAt(...pos, ...tgt, false);
      if (k >= 1) {
        flight.current = null;
        lastFlightMs.current = elapsed;
        f.done();
      }
    }

    // Distance fog follows the mode so far peaks read as ink-wash silhouettes (spec §5.3).
    const fog = scene.fog as Fog | null;
    if (fog) {
      const [near, far] = FOG[useCamera.getState().mode];
      fog.near += (near - fog.near) * 0.08;
      fog.far += (far - fog.far) * 0.08;
    }

    const t = c.getTarget(scratch);
    window.__view = {
      azimuth: c.azimuthAngle,
      polar: c.polarAngle,
      distance: c.distance,
      target: [t.x, t.y, t.z],
      mode: useCamera.getState().mode,
      flying: useCamera.getState().flying,
      lastFlightMs: lastFlightMs.current,
    };
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

/**
 * Flies the camera to the selection whenever someone asks (search Enter, a board row, a notice,
 * the "Định vị" button). Waits while a peak-to-peak flight is running or the entity has not
 * been placed yet.
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
    if (p.tries <= 0 || useCamera.getState().flying) return;
    const api = useCamera.getState().api;
    if (!api) return;
    if (!selected || selected.kind === 'peak') {
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
