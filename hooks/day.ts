// Everything the surfaces show for one day, built from the date and the
// settings alone, so every surface (and every later feature) reads one value.
import type { PluginOptions } from 'claude-code'
import { almanacFor, localYmd, zodiacOf } from './almanac'
import type { Almanac, Ymd } from './almanac'
import { horoscopeFor, signOf } from './horoscope'
import type { Horoscope } from './horoscope'
import { mercury } from './mercury'
import type { Retrograde } from './mercury'
import type { Lang } from './i18n'

export type Level = 'off' | 'quiet' | 'lively'

export type Settings = { lang: Lang; level: Level; birthday: Ymd | undefined }

export function parseBirthday(text: unknown): Ymd | undefined {
  const hit = /^\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s*$/.exec(String(text ?? ''))
  if (!hit) return undefined
  const [y, m, d] = [Number(hit[1]), Number(hit[2]), Number(hit[3])]
  const t = new Date(Date.UTC(y, m - 1, d))
  const isReal = t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
  return isReal && y >= 1900 && y <= 2100 ? { y, m, d } : undefined
}

export function settingsOf(options: PluginOptions): Settings {
  const lang: Lang = options.language === 'en' ? 'en' : 'zh'
  const level: Level = options.level === 'off' || options.level === 'quiet' ? options.level : 'lively'
  return { lang, level, birthday: parseBirthday(options.birthday) }
}

export type Today = {
  lang: Lang
  almanac: Almanac
  mercury: Retrograde
  /** The person's own sign and animal, from the birthday. */
  mySign: number | undefined
  myAnimal: string | undefined
  /** Today's 冲 falls on the person's animal. */
  isClash: boolean
  horoscopeOf: (sign: number) => Horoscope
}

const cache = new Map<string, Today>()

export function todayFor(day: Ymd, s: Settings): Today {
  const key = `${day.y}-${day.m}-${day.d}:${s.lang}:${s.birthday ? `${s.birthday.y}-${s.birthday.m}-${s.birthday.d}` : ''}`
  const hit = cache.get(key)
  if (hit) return hit
  const almanac = almanacFor(day, s.lang)
  const retro = mercury(almanac.date)
  const myAnimal = s.birthday ? zodiacOf(s.birthday) : undefined
  const ctx = { isDaJi: almanac.isDaJi, isRetrograde: retro.isRetrograde, hours: almanac.hours, element: almanac.naYin.element }
  const today: Today = {
    lang: s.lang,
    almanac,
    mercury: retro,
    mySign: s.birthday ? signOf(s.birthday) : undefined,
    myAnimal,
    isClash: myAnimal !== undefined && myAnimal === almanac.chong.animal,
    horoscopeOf: sign => horoscopeFor(almanac.date, sign, s.lang, ctx),
  }
  if (cache.size > 8) cache.clear()
  cache.set(key, today)
  return today
}

export const todayAt = (ms: number, s: Settings): Today => todayFor(localYmd(ms), s)
