// Built from hooks/day.ts by scripts/build-dsh.mjs. Do not edit.
import { almanacFor, localYmd, zodiacOf } from './almanac.js';
import { horoscopeFor, signOf } from './horoscope.js';
import { mercury } from './mercury.js';
export function parseBirthday(text) {
    const hit = /^\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s*$/.exec(String(text ?? ''));
    if (!hit)
        return undefined;
    const [y, m, d] = [Number(hit[1]), Number(hit[2]), Number(hit[3])];
    const t = new Date(Date.UTC(y, m - 1, d));
    const isReal = t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
    return isReal && y >= 1900 && y <= 2100 ? { y, m, d } : undefined;
}
export function settingsOf(options) {
    const lang = options.language === 'en' ? 'en' : 'zh';
    const level = options.level === 'off' || options.level === 'quiet' ? options.level : 'lively';
    return { lang, level, birthday: parseBirthday(options.birthday) };
}
const cache = new Map();
export function todayFor(day, s) {
    const key = `${day.y}-${day.m}-${day.d}:${s.lang}:${s.birthday ? `${s.birthday.y}-${s.birthday.m}-${s.birthday.d}` : ''}`;
    const hit = cache.get(key);
    if (hit)
        return hit;
    const almanac = almanacFor(day, s.lang);
    const retro = mercury(almanac.date);
    const myAnimal = s.birthday ? zodiacOf(s.birthday) : undefined;
    const ctx = { isDaJi: almanac.isDaJi, isRetrograde: retro.isRetrograde, hours: almanac.hours, element: almanac.naYin.element };
    const today = {
        lang: s.lang,
        almanac,
        mercury: retro,
        mySign: s.birthday ? signOf(s.birthday) : undefined,
        myAnimal,
        isClash: myAnimal !== undefined && myAnimal === almanac.chong.animal,
        horoscopeOf: sign => horoscopeFor(almanac.date, sign, s.lang, ctx),
    };
    if (cache.size > 8)
        cache.clear();
    cache.set(key, today);
    return today;
}
export const todayAt = (ms, s) => todayFor(localYmd(ms), s);
