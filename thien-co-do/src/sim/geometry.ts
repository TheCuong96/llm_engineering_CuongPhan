export type Vec3 = [number, number, number];

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function lerp3(a: Vec3, b: Vec3, k: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** Straight-line move at constant speed, evaluated against sim time. */
export interface Motion {
  from: Vec3;
  to: Vec3;
  start: number;
  duration: number;
}

export function startMotion(from: Vec3, to: Vec3, t: number, speedMps: number): Motion {
  return { from, to, start: t, duration: Math.max(distance(from, to) / speedMps, 0.1) };
}

export function motionPos(m: Motion, t: number): Vec3 {
  const k = Math.min(Math.max((t - m.start) / m.duration, 0), 1);
  return lerp3(m.from, m.to, k);
}

export function motionDone(m: Motion, t: number): boolean {
  return t >= m.start + m.duration - 1e-9;
}
