// The pure parts: the almanac against known dates, the horoscope's
// determinism, 冲, 水逆, 大吉 days and the 100 slips.
import { describe, expect, test } from 'claude-code/testing'
import { almanacFor, daJiOfMonth, mapActivities, ymdKey, zodiacOf } from '../hooks/almanac'
import type { Ymd } from '../hooks/almanac'
import { parseBirthday, todayFor } from '../hooks/day'
import type { Settings } from '../hooks/day'
import { LEVELS, slipNumberFor, slipOf, TOTAL_SLIPS } from '../hooks/fortune'
import { COLORS, signOf } from '../hooks/horoscope'
import { mercury } from '../hooks/mercury'

const zh: Settings = { lang: 'zh', level: 'lively', birthday: undefined }

// Day pillars are checked by the Julian-day rule (JD + 49) mod 60, with
// 2000-01-01 = 戊午; lunar dates and 春节 against the official calendar.
describe('almanac on known dates', () => {
  test('2000-01-01: 己卯年 冬月廿五 戊午日', () => {
    const a = almanacFor({ y: 2000, m: 1, d: 1 }, 'zh')
    expect(a.ganzhi.year).toBe('己卯')
    expect(a.lunar).toBe('冬月廿五')
    expect(a.ganzhi.day).toBe('戊午')
  })

  test('2024-02-10 is 春节: 甲辰年 正月初一 甲辰日, the year of the 龙', () => {
    const a = almanacFor({ y: 2024, m: 2, d: 10 }, 'zh')
    expect(a.lunar).toBe('正月初一')
    expect(a.ganzhi.year).toBe('甲辰')
    expect(a.ganzhi.day).toBe('甲辰')
    expect(a.yearAnimal).toBe('龙')
  })

  test('2025-01-29 is 春节: 乙巳年 正月初一 戊戌日', () => {
    const a = almanacFor({ y: 2025, m: 1, d: 29 }, 'zh')
    expect(a.lunar).toBe('正月初一')
    expect(a.ganzhi.year).toBe('乙巳')
    expect(a.ganzhi.day).toBe('戊戌')
  })

  test('2026-11-05: 丙午年 戊戌月 癸未日, 九月廿七, clashes with the 牛', () => {
    const a = almanacFor({ y: 2026, m: 11, d: 5 }, 'zh')
    expect(a.lunar).toBe('九月廿七')
    expect(a.ganzhi).toEqual({ year: '丙午', month: '戊戌', day: '癸未' })
    expect(a.chong.animal).toBe('牛')
    expect(a.solarTerm).toEqual({ name: '霜降', isToday: false })
    expect(a.hours).toHaveLength(12)
    // 祭祀 maps to writing docs, 纳财 to billing; 忌动土 is the schema.
    expect(a.yi.map(x => x.dev)).toContain('写文档')
    expect(a.yi.map(x => x.dev)).toContain('做计费功能')
    // 忌 动土 and 破土 are one group: one line, the schema warning first.
    expect(a.ji.find(x => x.terms.includes('动土'))).toEqual({ term: '动土·破土', terms: ['动土', '破土'], dev: '改表结构 · 新开坑' })
    expect(a.ji.map(x => x.dev)).toContain('周五上线')
  })

  test('solar terms: 冬至 on 2024-12-21, 立冬 on 2026-11-07', () => {
    expect(almanacFor({ y: 2024, m: 12, d: 21 }, 'zh').solarTerm).toEqual({ name: '冬至', isToday: true })
    expect(almanacFor({ y: 2026, m: 11, d: 7 }, 'zh').solarTerm).toEqual({ name: '立冬', isToday: true })
  })

  test('English maps the same terms', () => {
    const a = almanacFor({ y: 2026, m: 11, d: 5 }, 'en')
    expect(a.yi.find(x => x.term === '祭祀')?.dev).toBe('write docs')
    expect(a.ji.find(x => x.terms.includes('动土'))?.dev).toBe('schema changes & new projects')
  })
})

describe('horoscope', () => {
  test('the same date and sign give the same horoscope; others differ', () => {
    const one = todayFor({ y: 2026, m: 11, d: 5 }, zh)
    const again = todayFor({ y: 2026, m: 11, d: 5 }, { ...zh })
    expect(again.horoscopeOf(7)).toEqual(one.horoscopeOf(7))
    const all = Array.from({ length: 12 }, (_, i) => JSON.stringify({ ...one.horoscopeOf(i), sign: 0 }))
    expect(new Set(all).size).toBeGreaterThan(6)
    const tomorrow = todayFor({ y: 2026, m: 11, d: 6 }, zh)
    expect(JSON.stringify(tomorrow.horoscopeOf(7))).not.toBe(JSON.stringify(one.horoscopeOf(7)))
  })

  test('lucky hour is one of the 吉时; partner is another sign; stars are 1..5', () => {
    for (let d = 1; d <= 28; d++) {
      const t = todayFor({ y: 2027, m: 2, d }, zh)
      for (let s = 0; s < 12; s++) {
        const h = t.horoscopeOf(s)
        const good = t.almanac.hours.filter(x => x.luck === 'good')
        expect(good).toContainEqual(h.hour)
        expect(h.partner).not.toBe(s)
        for (const n of [h.overall, h.coding, h.debugging, h.review]) {
          expect(n >= 1 && n <= 5).toBe(true)
        }
      }
    }
  })

  test('signs from birthdays, edges included', () => {
    expect(signOf({ y: 1990, m: 3, d: 21 })).toBe(0) // Aries
    expect(signOf({ y: 1990, m: 3, d: 20 })).toBe(11) // Pisces
    expect(signOf({ y: 1990, m: 11, d: 5 })).toBe(7) // Scorpio
    expect(signOf({ y: 1990, m: 12, d: 22 })).toBe(9) // Capricorn
    expect(signOf({ y: 1990, m: 1, d: 19 })).toBe(9) // Capricorn
    expect(signOf({ y: 1990, m: 1, d: 20 })).toBe(10) // Aquarius
  })

  test('birthdays parse strictly', () => {
    expect(parseBirthday('1997-06-01')).toEqual({ y: 1997, m: 6, d: 1 })
    expect(parseBirthday('1997/6/1')).toEqual({ y: 1997, m: 6, d: 1 })
    expect(parseBirthday('1997-02-30')).toBeUndefined()
    expect(parseBirthday('')).toBeUndefined()
  })
})

describe('冲 and the zodiac', () => {
  test('the zodiac follows the lunar year: 1997-01-15 is still 鼠, 1997-06-01 is 牛', () => {
    expect(zodiacOf({ y: 1997, m: 1, d: 15 })).toBe('鼠')
    expect(zodiacOf({ y: 1997, m: 6, d: 1 })).toBe('牛')
  })

  test('a 牛 clashes on 2026-11-05 (冲牛); a 鼠 does not', () => {
    const ox = todayFor({ y: 2026, m: 11, d: 5 }, { ...zh, birthday: { y: 1997, m: 6, d: 1 } })
    expect(ox.isClash).toBe(true)
    const rat = todayFor({ y: 2026, m: 11, d: 5 }, { ...zh, birthday: { y: 1997, m: 1, d: 15 } })
    expect(rat.isClash).toBe(false)
    expect(todayFor({ y: 2026, m: 11, d: 5 }, zh).isClash).toBe(false)
  })
})

describe('水逆', () => {
  test('inside, on the edges and outside a retrograde', () => {
    expect(mercury('2026-11-05')).toEqual({ isRetrograde: true, ends: '2026-11-13' })
    expect(mercury('2026-10-24').isRetrograde).toBe(true)
    expect(mercury('2026-11-13').isRetrograde).toBe(true)
    expect(mercury('2026-11-14')).toEqual({ isRetrograde: false, next: '2027-02-09' })
    expect(mercury('2026-10-23').isRetrograde).toBe(false)
  })

  test('a retrograde takes a debugging star, never below one', () => {
    const t = todayFor({ y: 2026, m: 11, d: 5 }, zh)
    expect(t.mercury.isRetrograde).toBe(true)
    for (let s = 0; s < 12; s++) expect(t.horoscopeOf(s).debugging >= 1).toBe(true)
  })
})

describe('大吉 days', () => {
  const addDays = ({ y, m, d }: Ymd, n: number): Ymd => {
    const t = new Date(Date.UTC(y, m - 1, d + n))
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
  }

  test('one per lunar month, on a 黄道 day, about twelve a year', () => {
    const start: Ymd = { y: 2026, m: 1, d: 1 }
    const days: string[] = []
    for (let i = 0; i < 365; i++) {
      const day = addDays(start, i)
      const a = almanacFor(day, 'zh')
      if (a.isDaJi) {
        days.push(ymdKey(day))
        expect(a.dayGod.luck).toBe('good')
      }
    }
    expect(days.length >= 11 && days.length <= 14).toBe(true)
    // Each is its own month's pick, so no lunar month has two.
    for (const d of days) expect(daJiOfMonth(parseBirthday(d) as Ymd)).toBe(d)
  })

  test('a 大吉 day gives every sign five stars overall', () => {
    const key = daJiOfMonth({ y: 2026, m: 11, d: 5 })
    const t = todayFor(parseBirthday(key) as Ymd, zh)
    expect(t.almanac.isDaJi).toBe(true)
    for (let s = 0; s < 12; s++) expect(t.horoscopeOf(s).overall).toBe(5)
  })
})

describe('slips', () => {
  test('100 slips, all different, best grades rarest at the top', () => {
    expect(TOTAL_SLIPS).toBe(100)
    const poems = new Set<string>()
    for (let n = 1; n <= 100; n++) {
      const s = slipOf(n, 'zh')
      poems.add(s.poem.join('|'))
      expect(slipOf(n, 'en').poem[0].length > 0).toBe(true)
    }
    expect(poems.size).toBe(100)
    expect(slipOf(1, 'zh').level).toBe('上上签')
    expect(slipOf(100, 'zh').level).toBe('下下签')
    expect(LEVELS[0]?.count).toBe(8)
  })

  test('the draw is fixed by date and person', () => {
    const a = slipNumberFor('2026-11-05', '1997-6-1')
    expect(slipNumberFor('2026-11-05', '1997-6-1')).toBe(a)
    expect(a >= 1 && a <= 100).toBe(true)
    const spread = new Set(Array.from({ length: 60 }, (_, i) => slipNumberFor(`2026-01-${i}`, 'anyone')))
    expect(spread.size).toBeGreaterThan(30)
  })
})

describe('flavor lines', () => {
  const flavor = (y: number, m: number, d: number, lang: 'zh' | 'en' = 'zh') => almanacFor({ y, m, d }, lang).flavor

  test('festivals, lunar and solar, come first; the weekday line is last', () => {
    expect(flavor(2026, 2, 17)[0]).toContain('春节快乐') // 正月初一
    expect(flavor(2026, 2, 16)[0]).toContain('除夕')
    expect(flavor(2026, 9, 25)[0]).toContain('中秋') // 八月十五
    expect(flavor(2026, 10, 24)[0]).toContain('1024 程序员节')
    expect(flavor(2026, 10, 24, 'en')[0]).toContain("Programmers' Day")
    expect(flavor(2026, 2, 13).join(' ')).toContain('黑色星期五')
    expect(flavor(2026, 9, 13)[0]).toContain('第 256 天')
    expect(flavor(2024, 12, 21).join(' ')).toContain('冬至')
    expect(flavor(2026, 11, 6).at(-1)).toContain('周五')
  })

  test('an ordinary day has only its weekday line', () => {
    expect(flavor(2026, 11, 5)).toEqual(['📋 周四：写周报前先回忆一下这周干了啥。'])
  })
})

test('no violet or lavender among the lucky colours', () => {
  for (const c of COLORS) expect(c.name[1]).not.toMatch(/purple|violet|lavender/i)
})

describe('lucky colours follow the five elements', () => {
  test('the colour belongs to the element that generates the day\'s 纳音 element', () => {
    for (let d = 1; d <= 30; d++) {
      const t = todayFor({ y: 2026, m: 11, d }, zh)
      const feeds = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' } as const
      for (let s = 0; s < 12; s++) {
        const c = t.horoscopeOf(s).color
        expect(c.dayElement).toBe(t.almanac.naYin.element)
        expect(c.element).toBe(feeds[c.dayElement])
      }
    }
  })

  test('2026-11-05 癸未 is 杨柳木, so its colours are of 水 (水生木)', () => {
    const t = todayFor({ y: 2026, m: 11, d: 5 }, zh)
    expect(t.almanac.naYin).toEqual({ name: '杨柳木', element: '木' })
    expect(['天青', '黛蓝', '靛青', '水绿']).toContain(t.horoscopeOf(0).color.name)
  })

  test('four colours to every element, so the twelve signs of a day show several', () => {
    for (const e of ['木', '火', '土', '金', '水'] as const) expect(COLORS.filter(c => c.element === e)).toHaveLength(4)
    for (let d = 1; d <= 30; d++) {
      const t = todayFor({ y: 2026, m: 11, d }, zh)
      const seen = new Set(Array.from({ length: 12 }, (_, s) => t.horoscopeOf(s).color.name))
      expect(seen.size).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('synonyms merge', () => {
  test('a group of two or more reads as one line under the group\'s words; a lone term keeps its own', () => {
    expect(mapActivities(['祭祀', '祈福', '出行'], 'zh', false)).toEqual([
      { term: '祭祀·祈福', terms: ['祭祀', '祈福'], dev: '写文档 · README' },
      { term: '出行', terms: ['出行'], dev: '部署' },
    ])
    expect(mapActivities(['出行', '移徙', '入宅'], 'en', false)).toEqual([
      { term: '出行·移徙', terms: ['出行', '移徙', '入宅'], dev: 'deploy & migrate' },
    ])
    expect(mapActivities(['动土'], 'zh', true)[0]?.dev).toBe('改数据库表结构')
  })

  test('merging never loses a term, and no line repeats', () => {
    for (let d = 1; d <= 30; d++) {
      const a = almanacFor({ y: 2026, m: 11, d }, 'zh')
      for (const list of [a.yi, a.ji]) {
        expect(new Set(list.map(x => x.dev)).size).toBe(list.length)
      }
    }
  })
})
