// The only place classical units are defined (spec §7.1). Engine stores SI.

export const KG_PER_CAN = 0.5;
export const M_PER_DAM = 500;
export const M_PER_TRUONG = 3.33;

export const kgToCan = (kg: number) => kg / KG_PER_CAN;
export const canToKg = (can: number) => can * KG_PER_CAN;
export const mToDam = (m: number) => m / M_PER_DAM;
export const damToM = (dam: number) => dam * M_PER_DAM;
export const mToTruong = (m: number) => m / M_PER_TRUONG;
export const truongToM = (truong: number) => truong * M_PER_TRUONG;
export const mpsToKmh = (mps: number) => mps * 3.6;
export const kmhToMps = (kmh: number) => kmh / 3.6;
