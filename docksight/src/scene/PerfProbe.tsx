import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3, type InstancedMesh } from 'three';

declare global {
  interface Window {
    /** Instanced meshes in the scene: name → instance count (for e2e instancing checks). */
    __instanced?: () => Record<string, number>;
    /** Project a world point to CSS pixels (for e2e clicks on 3D entities). */
    __project?: (p: [number, number, number]) => { x: number; y: number };
    /** Names of scene objects starting with a prefix (e.g. "site:"). */
    __named?: (prefix: string) => string[];
    /** GPU resources currently held by the renderer. */
    __glMemory?: () => { geometries: number; textures: number };
    __visible?: (name: string) => boolean;
    __sceneObjects?: () => number;
    __perf?: { fps: number; frames: number; dpr: number; renderer: string; calls: number; triangles: number };
  }
}

/**
 * Rolling 1-second FPS sample published on window.__perf (read by the Playwright perf
 * spec and the `?perf` overlay). Always on: it costs one counter per frame.
 */
export function PerfProbe() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  window.__named = (prefix) => {
    const out: string[] = [];
    scene.traverse((o) => {
      if (o.name.startsWith(prefix)) out.push(o.name);
    });
    return out;
  };
  window.__glMemory = () => ({ ...gl.info.memory });
  /** Scene graph size, for leak checks (objects should not pile up across site switches). */
  window.__sceneObjects = () => {
    let n = 0;
    scene.traverse(() => void n++);
    return n;
  };
  /** Whether a named object and all its ancestors are visible (only the viewed site should be). */
  window.__visible = (name) => {
    let o = scene.getObjectByName(name) ?? null;
    if (!o) return false;
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  window.__project = ([x, y, z]) => {
    const v = new Vector3(x, y, z).project(camera);
    return { x: size.left + ((v.x + 1) / 2) * size.width, y: size.top + ((1 - v.y) / 2) * size.height };
  };
  window.__instanced = () => {
    const out: Record<string, number> = {};
    scene.traverse((o) => {
      if ((o as InstancedMesh).isInstancedMesh && o.name) out[o.name] = (o as InstancedMesh).count;
    });
    return out;
  };
  const acc = useRef({ frames: 0, total: 0, t0: performance.now() });

  useFrame(() => {
    const a = acc.current;
    a.frames++;
    a.total++;
    const now = performance.now();
    if (now - a.t0 < 1000) return;
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    window.__perf = {
      fps: (a.frames * 1000) / (now - a.t0),
      frames: a.total,
      dpr: gl.getPixelRatio(),
      renderer: ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'unknown',
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    };
    a.frames = 0;
    a.t0 = now;
    const el = document.getElementById('perf-overlay');
    if (el) el.textContent = `${window.__perf.fps.toFixed(0)} fps · dpr ${window.__perf.dpr} · ${window.__perf.calls} calls · ${window.__perf.triangles} tris`;
  });
  return null;
}
