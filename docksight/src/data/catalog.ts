// Goods, carriers and people. Every name here is invented (spec rule 7: no real brands).

import type { SkuDef } from '../sim/config';
import type { Carrier } from '../sim/types';

export const catalog: SkuDef[] = [
  { sku: 'BOX-M', name: 'Cardboard Box (M)', category: 'Packaging', qtyPerPallet: 400, weightKg: 180, icon: 'package' },
  { sku: 'CNT-PL', name: 'Plastic Container', category: 'Packaging', qtyPerPallet: 60, weightKg: 240, icon: 'container' },
  { sku: 'PPE-HLM', name: 'Safety Helmet', category: 'PPE', qtyPerPallet: 120, weightKg: 95, icon: 'hard-hat' },
  { sku: 'TAPE-48', name: 'Packing Tape', category: 'Packaging', qtyPerPallet: 720, weightKg: 210, icon: 'scroll' },
  { sku: 'LED-6060', name: 'LED Panel 60×60', category: 'Electrical', qtyPerPallet: 80, weightKg: 260, icon: 'lightbulb' },
  { sku: 'PPE-GLV', name: 'Nitrile Gloves', category: 'PPE', qtyPerPallet: 200, weightKg: 150, icon: 'hand' },
  { sku: 'FRZ-PEA', name: 'Frozen Peas 10 kg', category: 'Frozen', qtyPerPallet: 60, weightKg: 620, icon: 'snowflake' },
  { sku: 'WTR-24', name: 'Spring Water 24-pack', category: 'Beverage', qtyPerPallet: 70, weightKg: 640, icon: 'droplets' },
  { sku: 'CHR-OFC', name: 'Office Chair', category: 'Furniture', qtyPerPallet: 12, weightKg: 190, icon: 'armchair' },
];

// Four liveries (spec 5.2): blue; white + teal; white + orange; white + navy.
export const carriers: Carrier[] = [
  { id: 'kitefin', name: 'Kitefin Freight', livery: { cab: '#2f6fe4', trailer: '#2f6fe4', stripe: '#ffffff' } },
  { id: 'saltmarsh', name: 'Saltmarsh Haulage', livery: { cab: '#ffffff', trailer: '#ffffff', stripe: '#17a8a0' } },
  { id: 'emberline', name: 'Emberline', livery: { cab: '#ffffff', trailer: '#ffffff', stripe: '#f08a24' } },
  { id: 'corvid', name: 'Corvid Lines', livery: { cab: '#1c2c5b', trailer: '#ffffff', stripe: '#1c2c5b' } },
];

export const customers = [
  { name: 'Harborview Supply', city: 'Philadelphia, PA', distanceKm: 140 },
  { name: 'Maple & Finch Retail', city: 'Trenton, NJ', distanceKm: 95 },
  { name: 'Quayside Builders', city: 'Jersey City, NJ', distanceKm: 18 },
  { name: 'Brightmoor Clinics', city: 'Paterson, NJ', distanceKm: 28 },
  { name: 'Lantern Grocers', city: 'Edison, NJ', distanceKm: 42 },
] as const;

export const drivers = [
  'Sam Haddad', 'Priya Nair', 'Marcus Lee', 'Elena Ruiz', 'Tom Okafor', 'Hana Kim',
  'Diego Alvarez', 'Ruth Mendel', 'Kofi Mensah', 'Ava Laurent', 'Jonah Pike', 'Mei Tan',
] as const;
