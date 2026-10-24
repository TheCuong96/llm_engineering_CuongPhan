// Shared flat materials for the diorama. Colours come from tokens (§8); the few extras
// below are 3D-only and never reach the HUD.

import { Color, DoubleSide, MeshBasicMaterial, MeshLambertMaterial } from 'three';
import { color } from '../design/tokens';

export const sceneColor = {
  sky: '#EEEAF3', // fog + background: between cloud-low and mist
  grass: '#C9CFAE',
  snow: '#EEF2F6',
  ice: '#BFDCEB',
  brass: '#B08A4A',
  bronze: '#5A4A3C',
  smoke: '#F2C6D6',
  wallIvory: '#F3EEE3',
  wood: '#8A6A4F',
  pineDark: '#4F6F5E',
  doorShadow: '#3A3346',
  runeGold: '#E9D9A6',
  runeInk: '#B08A3E', // pad numbers: darker gold so they read on paper-white stone
  lampGlow: '#F4E7C2',
} as const;

const lambert = (hex: string) => new MeshLambertMaterial({ color: new Color(hex), flatShading: true });

export const mat = {
  paper: lambert(color.groundPaper),
  grass: lambert(sceneColor.grass),
  snow: lambert(sceneColor.snow),
  ice: new MeshLambertMaterial({ color: new Color(sceneColor.ice), flatShading: true, transparent: true, opacity: 0.9 }),
  brass: lambert(sceneColor.brass),
  bronze: lambert(sceneColor.bronze),
  stone: lambert(color.stone),
  wall: lambert(sceneColor.wallIvory),
  pillar: lambert(color.pillarCinnabar),
  roof: new MeshLambertMaterial({ color: new Color(color.roofJade), flatShading: true, side: DoubleSide }),
  wood: lambert(sceneColor.wood),
  pine: lambert(sceneColor.pineDark),
  door: lambert(sceneColor.doorShadow),
  // Clouds stay soft: smooth shading plus a little self-light so undersides never go stone-grey.
  cloud: new MeshLambertMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.35 }),
  rune: new MeshBasicMaterial({ color: sceneColor.runeGold, transparent: true, opacity: 0.9 }),
  lamp: new MeshBasicMaterial({ color: sceneColor.lampGlow }),
};
