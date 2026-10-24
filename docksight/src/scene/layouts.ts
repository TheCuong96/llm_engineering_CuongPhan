// Per-site scene presets (spec 7.1, "Nét riêng của scene"). All warehouses keep their dock
// face on z = 0 so the engine's dock, yard and charger anchors fit every layout.

export interface WarehouseLayout {
  x0: number;
  x1: number;
  z0: number;
  height: number;
  roof: 'gable' | 'flat';
  /** Closed decorative doors added along the front, beyond the working docks. */
  extraDoors: number;
  /** Blue-tinted glass band across the upper front wall. */
  glass?: 'blue' | 'cyan';
  /** Rooftop condenser fans (cold store). */
  fans?: boolean;
  /** White silos beside the building (cold store). */
  silos?: boolean;
  /** Blue structural frame on the edges (automated DC). */
  frame?: boolean;
  /** Outdoor racking and stacked containers in the yard (depot). */
  racks?: boolean;
  containers?: boolean;
}

export const LAYOUTS: Record<string, WarehouseLayout> = {
  // WH-01: blue-roofed sheds, pallet racks and containers out in the yard.
  depot: { x0: -35, x1: 35, z0: -30, height: 10, roof: 'gable', extraDoors: 0, racks: true, containers: true },
  // WH-02: very long building, more than eight dock doors, glass frontage.
  distribution_center: { x0: -48, x1: 48, z0: -34, height: 12, roof: 'gable', extraDoors: 6, glass: 'blue' },
  // WH-03: flat roof with condenser fans, white silos.
  cold_store: { x0: -32, x1: 32, z0: -28, height: 9, roof: 'flat', extraDoors: 0, fans: true, silos: true },
  // WH-04: a row of doors with trucks in and out, wide yard, forklift charging yard.
  cross_dock: { x0: -30, x1: 30, z0: -18, height: 8, roof: 'gable', extraDoors: 0 },
  // WH-05: white block with a blue frame and four large doors.
  automated_dc: { x0: -38, x1: 38, z0: -32, height: 13, roof: 'flat', extraDoors: 0, glass: 'cyan', frame: true },
};

export const layoutOf = (key: string): WarehouseLayout => LAYOUTS[key] ?? LAYOUTS.depot!;
