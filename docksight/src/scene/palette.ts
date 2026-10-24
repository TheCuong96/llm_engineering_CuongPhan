// Shared flat materials for the diorama (spec 5.3: matte, no textures). Colours come from
// tokens; the extras below are 3D-only and never reach the HUD.

import { Color, MeshLambertMaterial } from 'three';
import { color } from '../design/colors';

export const sceneColor = {
  sky: '#eef1f9', // background + fog: between ground and lavender
  yard: '#f3f5fb',
  road: '#dde2f0',
  roadLine: '#ffffff',
  grass: '#d7ead2',
  treeLight: '#86c97a',
  treeDark: '#5fb05e',
  trunk: '#a08465',
  wall: '#ffffff',
  wallRib: '#e3e8f5',
  doorFrame: '#1c3f9e',
  doorShadow: '#24315e',
  paint: '#f2a93b', // bay lines on the yard floor: yellow-orange
  fence: '#aab3c8',
  curb: '#e8ecf6',
} as const;

const lambert = (hex: string, extra: Partial<MeshLambertMaterial> = {}) =>
  Object.assign(new MeshLambertMaterial({ color: new Color(hex), flatShading: true }), extra);

export const mat = {
  ground: lambert(color.ground),
  lavender: lambert(color.lavender),
  yard: lambert(sceneColor.yard),
  road: lambert(sceneColor.road),
  roadLine: lambert(sceneColor.roadLine),
  grass: lambert(sceneColor.grass),
  treeLight: lambert(sceneColor.treeLight),
  treeDark: lambert(sceneColor.treeDark),
  trunk: lambert(sceneColor.trunk),
  wall: lambert(sceneColor.wall),
  wallRib: lambert(sceneColor.wallRib),
  roof: lambert(color.brandRoof),
  doorFrame: lambert(sceneColor.doorFrame),
  doorShadow: lambert(sceneColor.doorShadow),
  paint: lambert(sceneColor.paint),
  curb: lambert(sceneColor.curb),
  fencePost: lambert(sceneColor.fence),
  fencePanel: new MeshLambertMaterial({ color: sceneColor.fence, transparent: true, opacity: 0.28, depthWrite: false }),
};
