// Copied from packages/dsh/src/almanac.js by scripts/build-dsh.mjs. Do not edit.
// dsh-dev-almanac's operations, written once and called three ways: by the
// /almanac and /qiuqian commands, by the almanac_today tool, and by the
// sidebar tab through POST /api/dev-almanac/panel.
//
// Everything comes from the date and the saved settings (birthday, language,
// today's slip), kept in one small JSON file. No network, no model calls.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

import { ANIMALS_EN, DIRECTIONS_EN, localYmd } from './core/almanac.js'
import { bannerSvg, seasonOfTerm, tubeSvg } from './core/art.js'
import { parseBirthday, todayFor } from './core/day.js'
import { slipNumberFor, slipOf } from './core/fortune.js'
import { SIGNS, signName } from './core/horoscope.js'
import { words } from './core/i18n.js'

export const PANEL_PATH = '/api/dev-almanac/panel'

// ---------------------------------------------------------------- the store

/** Where the settings live: ~/.cache/dev-almanac/state.json, or $DEV_ALMANAC_HOME/state.json. */
export function defaultStorePath() {
  const base = process.env.DEV_ALMANAC_HOME || join(homedir(), '.cache', 'dev-almanac')
  return join(base, 'state.json')
}

/** A JSON file store. Reads never throw; a bad or missing file is empty. */
export function fileStore(path = defaultStorePath()) {
  return {
    read() {
      try {
        const value = JSON.parse(readFileSync(path, 'utf8'))
        return value && typeof value === 'object' ? value : {}
      } catch {
        return {}
      }
    },
    write(value) {
      mkdirSync(dirname(path), { recursive: true })
      const tmp = `${path}.${process.pid}.tmp`
      writeFileSync(tmp, JSON.stringify(value, null, 2))
      renameSync(tmp, path)
    },
  }
}

/** A store in memory, for tests. */
export function memoryStore(initial = {}) {
  let value = { ...initial }
  return {
    read: () => ({ ...value }),
    write: next => {
      value = { ...next }
    },
  }
}

// ---------------------------------------------------------------- the day

const lang = state => (state.lang === 'en' ? 'en' : 'zh')
const settingsOf = state => ({ lang: lang(state), level: 'lively', birthday: parseBirthday(state.birthday) })
const animalOf = (l, zh) => (l === 'zh' ? zh : ANIMALS_EN[zh] ?? zh)
const ymdText = b => `${b.y}-${String(b.m).padStart(2, '0')}-${String(b.d).padStart(2, '0')}`

/** The next slip a shake gives: a new one each time, never the same twice in a row. */
export function nextSlip(date, birthday, stored) {
  const who = birthday ? `${birthday.y}-${birthday.m}-${birthday.d}` : 'anyone'
  const previous = stored && stored.date === date ? stored : null
  const count = (previous?.count ?? (previous ? 1 : 0)) + 1
  let number = slipNumberFor(date, count === 1 ? who : `${who}#${count}`)
  if (previous && number === previous.number) number = (number % 100) + 1
  return { date, number, count }
}

const SEASON_NAME = { spring: ['春', 'SPRING'], summer: ['夏', 'SUMMER'], autumn: ['秋', 'AUTUMN'], winter: ['冬', 'WINTER'] }

/** Everything the sidebar tab draws for one moment, as plain JSON. */
export function dayView(ms, state) {
  const s = settingsOf(state)
  const l = s.lang
  const w = words(l)
  const t = todayFor(localYmd(ms), s)
  const a = t.almanac
  const when = new Date(ms)
  const season = seasonOfTerm(a.solarTerm.name)
  const slip = state.slip && state.slip.date === a.date ? state.slip : null
  const pending = nextSlip(a.date, s.birthday, slip)
  const k = l === 'zh' ? 0 : 1
  const banner = bannerSvg({
    season,
    month: w.months[when.getMonth()] ?? '',
    day: when.getDate(),
    weekday: w.weekdayShort[when.getDay()] ?? '',
    lunarDay: l === 'zh' ? a.lunar : `${a.ganzhi.day} · ${a.lunar}`,
    accent: a.isDaJi ? '#d4a72c' : '#b83227',
    seed: a.date,
    run: 1,
    isRedDay: when.getDay() === 0 || when.getDay() === 6 || a.flavor.length > 1,
    tag: `${a.solarTerm.name} · ${SEASON_NAME[season][k]}`,
    big: l === 'zh' ? a.lunar : `Lunar ${Math.abs(a.lunarMD.m)}·${a.lunarMD.d}`,
    small:
      l === 'zh'
        ? `${a.ganzhi.year}${a.yearAnimal}年 · ${a.ganzhi.month}月 · ${a.ganzhi.day}日 · ${a.naYin.name}`
        : `${a.ganzhi.year} · ${a.ganzhi.month} · ${a.ganzhi.day} · Year of the ${animalOf(l, a.yearAnimal)}`,
  })
  return {
    lang: l,
    date: a.date,
    weekday: w.weekdays[when.getDay()] ?? '',
    hour: when.getHours(),
    lunar:
      l === 'zh'
        ? `农历${a.lunarYear}年${a.lunar} · ${a.ganzhi.year}年 ${a.ganzhi.month}月 ${a.ganzhi.day}日 · ${a.yearAnimal}年`
        : `Lunar ${a.lunar} · ${a.ganzhi.year} year, ${a.ganzhi.month} month, ${a.ganzhi.day} day · Year of the ${animalOf(l, a.yearAnimal)}`,
    dayGod: `${a.dayGod.luck === 'good' ? '🌞' : '🌚'} ${a.dayGod.name} · ${a.dayGod.luck === 'good' ? w.dayGood : w.dayBad} · ${a.zhiXing}`,
    flavor: a.flavor,
    notices: [
      ...(a.isDaJi ? [{ tone: 'gold', text: w.daJi }] : []),
      ...(t.mercury.isRetrograde ? [{ tone: 'warn', text: w.retro(t.mercury.ends ?? '') }] : []),
      ...(t.isClash ? [{ tone: 'bad', text: w.clash(animalOf(l, t.myAnimal ?? '')) }] : []),
    ],
    yi: a.yi,
    ji: a.ji,
    chong: l === 'zh' ? `冲${a.chong.desc} · 煞${a.sha}` : `${animalOf(l, a.chong.animal)} · Sha: ${DIRECTIONS_EN[a.sha] ?? a.sha}`,
    solarTerm: `${a.solarTerm.name}${a.solarTerm.isToday ? (l === 'zh' ? '（今日）' : ' (today)') : ''}`,
    hours: a.hours,
    mySign: t.mySign ?? null,
    myAnimal: t.myAnimal ? animalOf(l, t.myAnimal) : null,
    birthday: s.birthday ? ymdText(s.birthday) : null,
    signs: SIGNS.map((sign, i) => ({ glyph: sign.glyph, name: signName(i, l), horoscope: t.horoscopeOf(i) })),
    slip: slip ? { ...slipOf(slip.number, l), count: slip.count ?? 1 } : null,
    art: {
      banner,
      tube: tubeSvg({ isShaking: false, number: pending.number, label: '签', run: pending.count }),
      tubeShaking: tubeSvg({ isShaking: true, number: pending.number, label: '签', run: pending.count + 100 }),
    },
    nextRetrograde: t.mercury.isRetrograde ? null : t.mercury.next ?? null,
    disclaimer: w.disclaimer,
  }
}

// ---------------------------------------------------------------- operations

/** Draws a new slip and saves it. Returns the slip and its text. */
export function draw(ms, store) {
  const state = store.read()
  const s = settingsOf(state)
  const date = todayFor(localYmd(ms), s).almanac.date
  const drawn = nextSlip(date, s.birthday, state.slip)
  store.write({ ...state, slip: drawn })
  const w = words(s.lang)
  const one = slipOf(drawn.number, s.lang)
  const text = [
    `🎋 ${w.slipHeader(one.number, one.level)}${drawn.count > 1 ? `（${w.shakeCount(drawn.count)}）` : ''}`,
    `　${one.poem[0]}`,
    `　${one.poem[1]}`,
    `${w.slipReading}${s.lang === 'zh' ? '：' : ': '}${one.reading}`,
    w.disclaimer,
  ].join('\n')
  return { slip: { ...one, count: drawn.count }, text }
}

/** Changes the language or the birthday. Returns the line to show, or throws with the reason. */
export function set(store, change) {
  const state = store.read()
  const next = { ...state }
  if (change.lang !== undefined) {
    if (change.lang !== 'zh' && change.lang !== 'en') throw new Error('language must be zh or en')
    next.lang = change.lang
  }
  if (change.birthday !== undefined) {
    const raw = String(change.birthday).trim()
    if (raw === '' || raw === 'clear' || raw === '清除') delete next.birthday
    else {
      const parsed = parseBirthday(raw)
      if (!parsed) throw new Error(words(lang(next)).birthdayBad)
      next.birthday = ymdText(parsed)
    }
  }
  store.write(next)
  const w = words(lang(next))
  if (change.birthday !== undefined) return next.birthday ? w.birthdaySet(next.birthday) : w.birthdayCleared
  return w.langSwitched
}

/** The day as text, for the command and the tool. */
export function dayText(ms, state) {
  const v = dayView(ms, state)
  const zh = v.lang === 'zh'
  const sep = zh ? '：' : ': '
  const acts = list => list.map(x => (x.dev === x.term ? x.term : `${x.term} → ${x.dev}`)).join(zh ? '；' : '; ')
  const good = v.hours.filter(x => x.luck === 'good').map(x => `${x.zhi} ${x.range}`).join(zh ? '、' : ', ')
  const lines = [
    `🀄 ${v.date} ${v.weekday} · ${v.lunar}`,
    v.dayGod,
    ...v.flavor,
    ...v.notices.map(n => n.text),
    `${zh ? '宜' : 'Do'}${sep}${acts(v.yi)}`,
    `${zh ? '忌' : "Don't"}${sep}${acts(v.ji)}`,
    `${zh ? '' : 'Clash: '}${v.chong} · ${zh ? '节气' : 'Solar term'}${sep}${v.solarTerm}`,
    `${zh ? '吉时' : 'Lucky hours'}${sep}${good}`,
  ]
  if (v.mySign !== null) {
    const sign = v.signs[v.mySign]
    const hs = sign.horoscope
    lines.push(
      `${sign.glyph} ${sign.name} ${'★'.repeat(hs.overall)}${'☆'.repeat(5 - hs.overall)} · ${zh ? '幸运色' : 'Lucky color'}${sep}${hs.color.name} · ${hs.color.nickname} · ${zh ? '幸运物' : 'Lucky item'}${sep}${hs.item}`,
      `💡 ${hs.advice}`,
    )
  }
  lines.push(v.disclaimer)
  return lines.join('\n')
}

// ---------------------------------------------------------------- the panel route

/** One panel request: { op: 'day' | 'draw' | 'set', lang?, birthday? }. */
export function panel(request, { now = () => Date.now(), store }) {
  const op = request?.op ?? 'day'
  const ms = now()
  if (op === 'draw') draw(ms, store)
  else if (op === 'set') set(store, { lang: request.lang, birthday: request.birthday })
  else if (op !== 'day') throw new Error(`unknown op: ${op}`)
  return dayView(ms, store.read())
}

export function panelRoute(deps) {
  return {
    path: PANEL_PATH,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async request => {
      let body
      try {
        const payload = await request.json().catch(() => ({}))
        body = { ok: true, value: panel(payload, deps) }
      } catch (err) {
        body = { ok: false, error: err instanceof Error ? err.message : String(err) }
      }
      return new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      })
    },
  }
}

// ---------------------------------------------------------------- commands and tool

const argsOf = invocation => (typeof invocation?.rawInput === 'string' ? invocation.rawInput.trim() : '')

/** `/almanac [zh|en | birthday YYYY-MM-DD | birthday clear]`. */
export function almanacCommand({ now = () => Date.now(), store }) {
  return {
    name: 'almanac',
    description: '程序员黄历 + 今日星运: today’s almanac and horoscope (zh|en to switch language, birthday YYYY-MM-DD)',
    // Declared so `/almanac en` is a command, not a message to the model.
    input: { hint: 'zh | en | birthday YYYY-MM-DD | birthday clear' },
    handler: async invocation => {
      const args = argsOf(invocation)
      const [verb = '', ...rest] = args.split(/\s+/)
      let head = ''
      try {
        if (['birthday', 'bday', '生日'].includes(verb.toLowerCase())) head = set(store, { birthday: rest.join(' ') || 'clear' })
        else if (['en', 'english'].includes(verb.toLowerCase())) head = set(store, { lang: 'en' })
        else if (['zh', 'cn', '中文'].includes(verb.toLowerCase())) head = set(store, { lang: 'zh' })
        else if (verb !== '') return { kind: 'error', text: 'Use /almanac, /almanac zh|en, or /almanac birthday YYYY-MM-DD' }
      } catch (err) {
        return { kind: 'error', text: err instanceof Error ? err.message : String(err) }
      }
      const text = dayText(now(), store.read())
      return { kind: 'success', text: head ? `${head}\n\n${text}` : text }
    },
  }
}

/** `/qiuqian`: draws a new slip each time. */
export function slipCommand({ now = () => Date.now(), store }) {
  return {
    name: 'qiuqian',
    description: '求签: draw a fortune slip (each draw gives a new one)',
    handler: async () => ({ kind: 'success', text: draw(now(), store).text }),
  }
}

/** The agent can read today's almanac too. */
export function almanacTool({ defineTool, now = () => Date.now(), store }) {
  return defineTool({
    name: 'almanac_today',
    description:
      "Today's programmer's almanac (程序员黄历) and horoscope: lunar date, 宜/忌 mapped to coding tasks, 冲煞, 节气, lucky hours, and the user's sign if they set a birthday. For fun; computed offline.",
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    execute: async () => dayText(now(), store.read()),
  })
}
