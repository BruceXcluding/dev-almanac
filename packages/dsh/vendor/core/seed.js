// Built from hooks/seed.ts by scripts/build-dsh.mjs. Do not edit.
// Deterministic randomness: the same date and sign give the same day, all day.
/** FNV-1a, 32-bit: a stable, unsigned hash of a string. */
export function hash(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
/** A small seeded generator (mulberry32). */
export function rng(seed) {
    let a = hash(seed);
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export const pick = (next, list) => list[Math.floor(next() * list.length)];
/** 1..5, leaning to the middle. */
export const stars = (next) => 1 + Math.floor((next() + next()) * 2.5);
