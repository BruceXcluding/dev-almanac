// Mercury retrograde (水逆) windows, geocentric, by calendar date, inclusive.
// Source: Farmers' Almanac and Almanac.com tables (checked 2026-11). Past the
// table's end the card shows no warning; extend the list for later years.
export const RETROGRADES: readonly (readonly [string, string])[] = [
  ['2025-03-15', '2025-04-07'],
  ['2025-07-18', '2025-08-11'],
  ['2025-11-09', '2025-11-29'],
  ['2026-02-26', '2026-03-20'],
  ['2026-06-29', '2026-07-23'],
  ['2026-10-24', '2026-11-13'],
  ['2027-02-09', '2027-03-03'],
  ['2027-06-10', '2027-07-04'],
  ['2027-10-07', '2027-10-28'],
  ['2028-01-24', '2028-02-14'],
  ['2028-05-21', '2028-06-13'],
  ['2028-09-19', '2028-10-11'],
  ['2029-01-07', '2029-01-27'],
  ['2029-05-01', '2029-05-25'],
  ['2029-09-02', '2029-09-24'],
  ['2029-12-22', '2030-01-11'],
]

export type Retrograde = { isRetrograde: boolean; ends?: string; next?: string }

/** `date` is YYYY-MM-DD; ISO strings compare in date order. */
export function mercury(date: string): Retrograde {
  const now = RETROGRADES.find(([a, b]) => a <= date && date <= b)
  if (now) return { isRetrograde: true, ends: now[1] }
  return { isRetrograde: false, next: RETROGRADES.find(([a]) => a > date)?.[0] }
}
