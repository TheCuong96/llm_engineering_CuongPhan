// Simulation constants. Times are simulated seconds, distances metres, speeds km/h.

export const CARGO_CAPACITY = 6; // pallets per trailer ("n/6", spec 4.4)
export const ROAD_KMH = 30; // on the access road, en route to the gate
export const DOCKING_KMH = 14; // reversing into a bay (spec 7.3: 10–22 km/h)
export const YARD_KMH = 20; // pulling out of the yard
export const HIGHWAY_KMH = 60; // in transit, off-map
export const GATE_CHECKIN_S: [number, number] = [45, 150];
export const DELIVERED_LINGER_S = 60;
/** Trucks allowed per site beyond its dock count, so a queue can form at the gate. */
export const EXTRA_TRUCKS_PER_SITE = 2;
export const DUE_SLACK = 1.3;
export const HANDLING_EST_S_PER_PALLET = 60;

export const BATTERY_LOW = 20; // %, only checked while idle (spec 7.3)
export const BATTERY_CHARGED = 95;
export const BATTERY_COST_PER_MOVE = 4;
export const BATTERY_KWH = 29; // 48 V lithium-ion pack
