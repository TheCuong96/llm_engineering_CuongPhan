// Canh giờ (spec §7.4): the day split into 12 two-hour watches named after the earthly
// branches. Display names live in vi.canhGio; the engine only deals in these keys.

export const EARTHLY_BRANCHES = [
  'rat', // Tý    23–1
  'ox', // Sửu    1–3
  'tiger', // Dần 3–5
  'rabbit', // Mão 5–7
  'dragon', // Thìn 7–9
  'snake', // Tỵ  9–11
  'horse', // Ngọ 11–13
  'goat', // Mùi  13–15
  'monkey', // Thân 15–17
  'rooster', // Dậu 17–19
  'dog', // Tuất  19–21
  'pig', // Hợi   21–23
] as const;

export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

/** Which watch a local wall-clock time falls in. Tý wraps past midnight (23:00–00:59). */
export function toCanhGio(date: Date): EarthlyBranch {
  const hour = date.getHours(); // 0–23, local time
  // Shift by one hour so Tý (23:00–00:59) becomes the contiguous block 0–1, then 2 hours per watch.
  return EARTHLY_BRANCHES[Math.floor(((hour + 1) % 24) / 2)]!;
}
