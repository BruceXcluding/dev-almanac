// dev-almanac: 程序员黄历 + 今日星运. Everything is computed offline from the
// date and the settings; no hook here blocks, rewrites or delays real work.
//
// Seams for later versions (not hooked yet):
// - personality mode: an `on('prompt.compose')` hook adding one section built
//   from `todayAt(now, settings)` (one line of flavor, fixed for the thread).
// - playful toasts: an `on('tool.call', { tool: 'Bash' })` hook that awaits
//   `next(e)` first and only then toasts (force push / DROP TABLE on a 忌 day,
//   `git rebase` while `today.mercury.isRetrograde`); never a deny.
// - an end-of-day recap line from `turn.complete`, a sound on 大吉 days via
//   `$.audio.play` with an asset of the mod's, and an optional once-a-day
//   advice line from `$.model.complete` with `$.session.model()` (never a
//   hardcoded alias), cached in `$.store` by date.
import { atom, read, update } from 'claude-code'
import type { ElementTable, EngineInterface, Register, RenderChildren } from 'claude-code'

import { ANIMALS_EN, DIRECTIONS_EN } from './almanac'
import type { Activity, LuckyHour } from './almanac'
import { parseBirthday, settingsOf, todayAt } from './day'
import type { Settings, Today } from './day'
import { slipNumberFor, slipOf } from './fortune'
import { signAt, signName, starBar } from './horoscope'
import type { Horoscope } from './horoscope'
import { INTRO_FRAMES, INTRO_MS, bannerSvg, particleLine, seasonOfTerm, terminalTube, tubeSvg } from './art'
import { words } from './i18n'
import type { Lang } from './i18n'
import type { DrawnSlip } from '../types'

const PANE = 'dev-almanac'
const band = atom({ plugin: 'dev-almanac', key: 'band' } as const, 'card')
const shownSign = atom({ plugin: 'dev-almanac', key: 'shownSign' } as const, null)
const slip = atom({ plugin: 'dev-almanac', key: 'slip' } as const, null, { shape: 'slip-1' })
const langPick = atom({ plugin: 'dev-almanac', key: 'lang' } as const, null)
const tick = atom({ plugin: 'dev-almanac', key: 'tick' } as const, 0)
const shake = atom({ plugin: 'dev-almanac', key: 'shake' } as const, 0)
const birthdayPick = atom({ plugin: 'dev-almanac', key: 'birthday' } as const, null)
const isShaking = atom({ plugin: 'dev-almanac', key: 'isShaking' } as const, false)
const intro = atom({ plugin: 'dev-almanac', key: 'intro' } as const, 0)
const introRun = atom({ plugin: 'dev-almanac', key: 'introRun' } as const, 0)
const isActivitiesOpen = atom({ plugin: 'dev-almanac', key: 'isActivitiesOpen' } as const, false)
const isEditingBirthday = atom({ plugin: 'dev-almanac', key: 'isEditingBirthday' } as const, false)

const PANE_COMMANDS = ['almanac', 'huangli', '黄历'] as const
const SLIP_COMMANDS = ['qiuqian', 'fortune', '求签'] as const

/** How often the card's ticker moves on, and the draw animation's frames. */
export const TICK_MS = 6000
const SHAKE_FRAMES = 10
const SHAKE_MS = 160

const GOLD = '#e3b341'
const SEASON_NAME = { spring: ['春', 'SPRING'], summer: ['夏', 'SUMMER'], autumn: ['秋', 'AUTUMN'], winter: ['冬', 'WINTER'] } as const
const DAJI = '#d4a72c'
const GOOD = 'success'
const BAD = 'error'

const ANIMAL_EMOJI: Record<string, string> = {
  鼠: '🐭', 牛: '🐮', 虎: '🐯', 兔: '🐰', 龙: '🐲', 蛇: '🐍',
  马: '🐴', 羊: '🐑', 猴: '🐵', 鸡: '🐔', 狗: '🐶', 猪: '🐷',
}
const SHA_ARROW: Record<string, string> = { 东: '→', 南: '↓', 西: '←', 北: '↑' }
const SEASON: readonly [string, string][] = [
  ['立春雨水惊蛰春分清明谷雨', '🌸'],
  ['立夏小满芒种夏至小暑大暑', '☀️'],
  ['立秋处暑白露秋分寒露霜降', '🍂'],
  ['立冬小雪大雪冬至小寒大寒', '❄️'],
]
const SLIP_COLORS = [DAJI, GOOD, 'cyan', 'text', 'warning', '#f0883e', 'gray']

type UI = ElementTable

const sepOf = (lang: Lang) => (lang === 'zh' ? '：' : ': ')
const join = (list: readonly Activity[], n: number, lang: Lang) =>
  list
    .slice(0, n)
    .map(a => a.dev)
    .join(lang === 'zh' ? '·' : ' · ')
const animal = (t: Today, zh: string) => (t.lang === 'zh' ? zh : ANIMALS_EN[zh] ?? zh)
const animalTag = (t: Today, zh: string) => `${ANIMAL_EMOJI[zh] ?? ''}${animal(t, zh)}`
const seasonOf = (term: string) => SEASON.find(([names]) => names.includes(term))?.[1] ?? '🌿'
export const moodOf = (t: Today, stars: number) => words(t.lang).moods[stars] ?? ''

/** The 时辰 index of a clock hour: 子 is 23:00-00:59. */
export const zhiIndexOf = (hour: number) => Math.floor((hour + 1) / 2) % 12

/** The settings with the language the person picked in the UI, if any. */
async function settingsNow($: EngineInterface, base: Settings): Promise<Settings> {
  const picked = await read($, langPick)
  const birthday = parseBirthday(await read($, birthdayPick)) ?? base.birthday
  return { ...base, lang: picked ?? base.lang, birthday }
}

async function todayNow($: EngineInterface, base: Settings) {
  const s = await settingsNow($, base)
  const ms = await $.clock.now()
  return { s, t: todayAt(ms, s), ms }
}

export const statusText = (t: Today): string => {
  const w = words(t.lang)
  const first = t.almanac.yi[0]?.dev ?? ''
  const head = t.almanac.isDaJi ? `🀄✨ ${t.lang === 'zh' ? '大吉' : 'Great'} ` : '🀄 '
  const what = t.lang === 'zh' ? `宜${first}` : `${w.yi}: ${first}`
  return `${head}${what}${t.mercury.isRetrograde ? ` ${w.retroShort}` : ''}`
}

export function drawSlip(t: Today, s: Settings, stored: DrawnSlip | null) {
  const w = words(t.lang)
  const who = s.birthday ? `${s.birthday.y}-${s.birthday.m}-${s.birthday.d}` : 'anyone'
  // Each shake draws anew; the first of the day keeps its old seed.
  const previous = stored !== null && stored.date === t.almanac.date ? stored : null
  const count = (previous?.count ?? (previous ? 1 : 0)) + 1
  let number = slipNumberFor(t.almanac.date, count === 1 ? who : `${who}#${count}`)
  if (previous && number === previous.number) number = (number % 100) + 1
  const one = slipOf(number, t.lang)
  const isAgain = previous !== null
  const text = [
    `🎋 ${w.slipHeader(one.number, one.level)}${count > 1 ? `（${w.shakeCount(count)}）` : ''}`,
    `　${one.poem[0]}`,
    `　${one.poem[1]}`,
    `${w.slipReading}${sepOf(t.lang)}${one.reading}`,
    w.disclaimer,
  ].join('\n')
  return { drawn: { date: t.almanac.date, number, count }, text, isAgain, slip: one }
}

/** What the one-line card's ticker cycles through. */
export function tickerOf(t: Today): string[] {
  const w = words(t.lang)
  const a = t.almanac
  const sep = sepOf(t.lang)
  const special = a.flavor.length > 1 ? a.flavor.slice(0, -1) : []
  const out = [...special, `✅ ${w.yi} ${join(a.yi, 3, t.lang)}`, `⛔ ${w.ji} ${join(a.ji, 3, t.lang)}`]
  if (t.mySign !== undefined) {
    const mine = t.horoscopeOf(t.mySign)
    out.push(`🍀 ${w.item}${sep}${mine.item}`, `🔢 ${w.number}${sep}${mine.number.what}`, `💡 ${mine.advice}`)
  }
  out.push(`${ANIMAL_EMOJI[a.chong.animal] ?? ''} ${w.chong}${animal(t, a.chong.animal)} · ${w.sha}${t.lang === 'zh' ? a.sha : DIRECTIONS_EN[a.sha] ?? a.sha}`)
  if (t.mercury.isRetrograde) out.push(`☿ ${t.lang === 'zh' ? '水逆中，rebase 前先备份' : 'Mercury retrograde: back up before you rebase'}`)
  const weekday = a.flavor.at(-1)
  if (weekday) out.push(weekday)
  return out
}

export function cardHead(t: Today): string {
  const a = t.almanac
  return t.lang === 'zh' ? `🀄 ${a.lunar} ${a.ganzhi.day}日` : `🀄 ${a.date.slice(5)} · ${a.ganzhi.day} day`
}

type Labels = Record<
  'yi' | 'ji' | 'clash' | 'term' | 'hours' | 'overall' | 'coding' | 'debugging' | 'review' | 'color' | 'item' | 'number' | 'tool' | 'hour' | 'partner' | 'helper' | 'watch',
  string
>

const LABELS: Record<Lang, Labels> = {
  zh: {
    yi: '宜', ji: '忌', clash: '冲煞', term: '节气', hours: '吉时', overall: '综合', coding: '编码',
    debugging: '调试', review: '评审', color: '幸运色', item: '幸运物', number: '幸运数字', tool: '语言工具',
    hour: '幸运时辰', partner: '结对星座', helper: '贵人', watch: '小心',
  },
  en: {
    yi: 'Do', ji: "Don't", clash: 'Clash', term: 'Solar term', hours: 'Lucky hours', overall: 'Overall',
    coding: 'Coding', debugging: 'Debugging', review: 'Review', color: 'Color', item: 'Item', number: 'Number',
    tool: 'Tool', hour: 'Hour', partner: 'Pair with', helper: 'Helper', watch: 'Watch out',
  },
}
/** The label column, in cells: CJK labels are two cells a character. */
const LABEL_WIDTH: Record<Lang, number> = { zh: 10, en: 13 }

type Parts = Pick<UI, 'Box' | 'Text'>
type Child = ReturnType<UI['Text']> | string

/** One aligned row: a dim label in a fixed column, then the value. */
function row(ui: Parts, lang: Lang, label: string, value: Child | Child[]) {
  const { Box, Text } = ui
  return (
    <Box flexDirection="row">
      <Box width={LABEL_WIDTH[lang]} flexShrink={0}>
        <Text dimColor>{label}</Text>
      </Box>
      <Box flexGrow={1} flexShrink={1}>
        {typeof value === 'string' ? <Text>{value}</Text> : <Text>{value}</Text>}
      </Box>
    </Box>
  )
}

const ELEMENT_EN = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' } as const

/** Why this colour: today's 纳音 element, and the element that feeds it. */
export const colorReason = (lang: Lang, element: keyof typeof ELEMENT_EN, day: keyof typeof ELEMENT_EN) =>
  lang === 'zh' ? `  ${element}生${day}` : `  ${ELEMENT_EN[element]} feeds ${ELEMENT_EN[day]}`

function starText(Text: UI['Text'], n: number) {
  return (
    <Text>
      <Text color={GOLD}>{'★'.repeat(n)}</Text>
      <Text dimColor>{'☆'.repeat(5 - n)}</Text>
    </Text>
  )
}

function hourChips(t: Today, Text: UI['Text'], hours: readonly LuckyHour[], nowZhi: number) {
  const w = words(t.lang)
  return [
    ...hours.map((one, i) =>
      i === nowZhi ? (
        <Text inverse bold color={one.luck === 'good' ? GOOD : undefined}>{` ${one.zhi} `}</Text>
      ) : one.luck === 'good' ? (
        <Text color={GOOD} bold>{` ${one.zhi} `}</Text>
      ) : (
        <Text dimColor>{` ${one.zhi} `}</Text>
      ),
    ),
    <Text dimColor>{`  ▲${w.now} ${hours[nowZhi]?.zhi ?? ''}${t.lang === 'zh' ? '时' : ''}`}</Text>,
  ]
}

/** Notices with a colored bar, most important first. */
function notices(t: Today, Text: UI['Text']) {
  const w = words(t.lang)
  const out = []
  if (t.almanac.isDaJi) out.push(<Text color={DAJI} bold>{`▌ ${w.daJi}`}</Text>)
  if (t.mercury.isRetrograde) out.push(<Text color="warning">{`▌ ${w.retro(t.mercury.ends ?? '')}`}</Text>)
  if (t.isClash) out.push(<Text color={BAD}>{`▌ ${w.clash(animal(t, t.myAnimal ?? ''))}`}</Text>)
  return out
}

/** How many lines each of 宜 and 忌 shows before "+N more". */
export const ACTIVITY_LINES = 5
/** The old-term column, in cells (two terms of a group fit). */
const TERM_WIDTH = 10

/**
 * 宜 or 忌 as a small two-column table: the almanac's own term on the left,
 * dim and fixed in width as in a dictionary, and what it means for a coder on
 * the right. At most five lines unless opened.
 */
function activityBox(t: Today, ui: Parts, isJi: boolean, wide: boolean, isOpen: boolean, more: RenderChildren) {
  const { Box, Text } = ui
  const L = LABELS[t.lang]
  const list = isJi ? t.almanac.ji : t.almanac.yi
  const shown = isOpen ? list : list.slice(0, ACTIVITY_LINES)
  const color = isJi ? BAD : GOOD
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={color} borderDimColor paddingX={1} flexGrow={1} width={wide ? '50%' : undefined}>
      <Text bold color={color}>{isJi ? `⛔ ${L.ji}` : `✅ ${L.yi}`}</Text>
      {shown.map(x => (
        <Box flexDirection="row">
          <Box width={TERM_WIDTH} flexShrink={0}>
            <Text dimColor wrap="truncate-end">{x.term}</Text>
          </Box>
          <Box flexGrow={1} flexShrink={1}>
            <Text>{x.dev === x.term ? '—' : x.dev}</Text>
          </Box>
        </Box>
      ))}
      {list.length > ACTIVITY_LINES ? more : ''}
    </Box>
  )
}

function horoscopeBox(
  t: Today,
  ui: Pick<UI, 'Box' | 'Text' | 'Button'>,
  hs: Horoscope,
  wide: boolean,
  onStep: (d: number) => () => unknown,
  profile: RenderChildren,
) {
  const { Box, Text, Button } = ui
  const w = words(t.lang)
  const L = LABELS[t.lang]
  const sign = signAt(hs.sign)
  const hour = hs.hour ? `${hs.hour.zhi}${t.lang === 'zh' ? '时' : ''} ${hs.hour.range}` : '—'
  const partner = `${signAt(hs.partner).glyph} ${signName(hs.partner, t.lang)}`
  const isMine = hs.sign === t.mySign
  const r = (label: string, value: Child | Child[]) => row({ Box, Text }, t.lang, label, value)
  const luck = [
    r(L.overall, [starText(Text, hs.overall), `  ${moodOf(t, hs.overall)}`]),
    r(L.coding, [starText(Text, hs.coding)]),
    r(L.debugging, [starText(Text, hs.debugging)]),
    r(L.review, [starText(Text, hs.review)]),
  ]
  const lucky = [
    r(L.color, [
      <Text color={hs.color.hex}>{'██ '}</Text>,
      `${hs.color.name} · ${hs.color.nickname}`,
      <Text dimColor>{colorReason(t.lang, hs.color.element, hs.color.dayElement)}</Text>,
    ]),
    r(L.item, hs.item),
    r(L.number, hs.number.what),
    r(L.tool, hs.tool),
  ]
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={hs.color.hex} paddingX={1} gap={1}>
      <Box flexDirection="row" gap={1}>
        <Box flexGrow={1} flexShrink={1}>
          <Text bold>
            {`✦ ${w.horoscope}  `}
            <Text color={hs.color.hex}>{`${sign.glyph} ${signName(hs.sign, t.lang)}`}</Text>
            {isMine ? <Text dimColor>{t.lang === 'zh' ? '（你）' : ' (you)'}</Text> : ''}
          </Text>
        </Box>
        <Button key="prev" label={w.prevSign} onPress={onStep(-1)} />
        <Button key="next" label={w.nextSign} onPress={onStep(1)} />
      </Box>
      {profile}
      {wide ? (
        <Box flexDirection="row" gap={2}>
          <Box flexDirection="column" width="50%">
            {luck}
          </Box>
          <Box flexDirection="column" flexGrow={1}>
            {lucky}
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column">
          {luck}
          {lucky}
        </Box>
      )}
      <Box flexDirection="column">
        {r(L.hour, hour)}
        {r(L.partner, partner)}
        {r(L.helper, hs.helper)}
        {r(L.watch, hs.watch)}
      </Box>
      <Text italic color="cyan">{`“${hs.advice}”`}</Text>
    </Box>
  )
}

async function refreshStatus($: EngineInterface, base: Settings) {
  if (base.level === 'off') return
  const { t } = await todayNow($, base)
  $.ui.status(statusText(t))
}

async function draw($: EngineInterface, base: Settings) {
  const { s, t } = await todayNow($, base)
  const stored = ((await $.store.get('slip')) as DrawnSlip | undefined) ?? null
  const out = drawSlip(t, s, stored)
  await $.store.set('slip', out.drawn)
  await update($, slip, () => out.drawn)
  return out
}

/** Shake the tube in the pane for a moment, then reveal the slip. */
async function shakeAndDraw($: EngineInterface, base: Settings) {
  if ((await read($, isShaking)) || (await read($, shake)) > 0) return
  await update($, isShaking, () => true)
  await update($, shake, () => 1)
  for (let frame = 2; frame <= SHAKE_FRAMES; frame++) {
    await $.clock.sleep(SHAKE_MS)
    await update($, shake, () => frame)
  }
  await $.clock.sleep(SHAKE_MS)
  await draw($, base)
  await update($, shake, () => 0)
  await update($, isShaking, () => false)
}

const ymdText = (b: { y: number; m: number; d: number }) =>
  `${b.y}-${String(b.m).padStart(2, '0')}-${String(b.d).padStart(2, '0')}`

/** Sets (or, with an empty text or "clear", clears) the birthday; answers the line to show. */
async function setBirthday($: EngineInterface, base: Settings, text: string): Promise<{ isSet: boolean; line: string }> {
  const { s } = await todayNow($, base)
  const w = words(s.lang)
  const raw = text.trim()
  if (raw === '' || raw === 'clear' || raw === '清除') {
    await update($, birthdayPick, () => null)
    await $.store.delete('birthday')
    await update($, isEditingBirthday, () => false)
    await refreshStatus($, base)
    return { isSet: false, line: w.birthdayCleared }
  }
  const parsed = parseBirthday(raw)
  if (!parsed) return { isSet: false, line: w.birthdayBad }
  const value = ymdText(parsed)
  await update($, birthdayPick, () => value)
  await $.store.set('birthday', value)
  await update($, shownSign, () => null)
  await update($, isEditingBirthday, () => false)
  await refreshStatus($, base)
  return { isSet: true, line: w.birthdaySet(value) }
}

async function switchLang($: EngineInterface, base: Settings, to?: Lang) {
  const current = (await read($, langPick)) ?? base.lang
  const next: Lang = to ?? (current === 'zh' ? 'en' : 'zh')
  await update($, langPick, () => next)
  await $.store.set('lang', next)
  await refreshStatus($, base)
  // An open pane's tab follows the language.
  if ((await $.ui.panes()).some(p => p.id === PANE)) await $.ui.open({ id: PANE, title: `🀄 ${words(next).title}` })
  return next
}

/** Opens the pane and plays its entrance: the season and the calendar dropping in. */
async function openPane($: EngineInterface, base: Settings) {
  const { t } = await todayNow($, base)
  await $.ui.open({ id: PANE, title: `🀄 ${words(t.lang).title}` })
  await playIntro($, base)
}

async function playIntro($: EngineInterface, base: Settings) {
  if (base.level === 'quiet') return
  await update($, introRun, n => n + 1)
  await update($, intro, () => 1)
  const timer = $.clock.every(INTRO_MS, () => {
    void update($, intro, n => (n >= INTRO_FRAMES || n === 0 ? 0 : n + 1))
      .then(async () => {
        if ((await read($, intro)) === 0) timer.cancel()
      })
      .catch(() => timer.cancel())
  })
}

export const register: Register = (on, options) => {
  const settings = settingsOf(options)

  on('session.start', async ($, e, next) => {
    for (const name of [...PANE_COMMANDS, ...SLIP_COMMANDS]) {
      const isPane = (PANE_COMMANDS as readonly string[]).includes(name)
      try {
        await $.command.register({
          name,
          description: isPane
            ? '程序员黄历 + 今日星运 · zh|en 切换语言 · birthday YYYY-MM-DD 设置生日'
            : '求签：今日一签 (draw today’s fortune slip)',
          ...(isPane ? { argumentHint: '[zh|en | birthday YYYY-MM-DD]' } : {}),
        })
      } catch {
        // A name this build refuses leaves the others registered.
      }
    }
    try {
      const saved = await $.store.get('lang')
      if (saved === 'zh' || saved === 'en') await update($, langPick, () => saved)
      const savedBirthday = await $.store.get('birthday')
      if (typeof savedBirthday === 'string' && parseBirthday(savedBirthday)) await update($, birthdayPick, () => savedBirthday)
      const { t } = await todayNow($, settings)
      await refreshStatus($, settings)
      if (settings.level === 'lively' && t.almanac.isDaJi && (await $.store.get('toastedOn')) !== t.almanac.date) {
        $.ui.toast(words(t.lang).daJiToast)
        await $.store.set('toastedOn', t.almanac.date)
      }
      const stored = (await $.store.get('slip')) as DrawnSlip | undefined
      if (stored && stored.date === t.almanac.date) await update($, slip, () => stored)
      // The card's ticker, until the card steps aside.
      if (settings.level === 'lively') {
        const timer = $.clock.every(TICK_MS, () => {
          void (async () => {
            if ((await read($, band)) === 'gone') return timer.cancel()
            await update($, tick, n => n + 1)
          })().catch(() => timer.cancel())
        })
      }
    } catch {
      // Fun only: never stand in the way of the session starting.
    }
    return next(e)
  })

  // The card collapses after the first prompt; the status line carries on.
  // The prompt itself passes on untouched.
  on('prompt.submit', async ($, e, next) => {
    try {
      if ((await read($, band)) !== 'gone') await update($, band, () => 'gone')
      await refreshStatus($, settings)
    } catch {
      // ignore
    }
    return next(e)
  })

  on('command.run', { command: ['almanac', 'huangli', '黄历'] }, async ($, e) => {
    const [verb = '', ...rest] = e.args.trim().split(/\s+/)
    if (['birthday', 'bday', '生日'].includes(verb.toLowerCase())) {
      const out = await setBirthday($, settings, rest.join(' ') || 'clear')
      const { t } = await todayNow($, settings)
      await openPane($, settings)
      return { text: out.line }
    }
    const arg = e.args.trim().toLowerCase()
    const to: Lang | undefined = arg === 'en' || arg === 'english' ? 'en' : arg === 'zh' || arg === '中文' || arg === 'cn' ? 'zh' : undefined
    if (to) await switchLang($, settings, to)
    const { t } = await todayNow($, settings)
    const w = words(t.lang)
    await openPane($, settings)
    return { text: to ? `${w.langSwitched} ${w.paneOpened}` : w.paneOpened }
  }).catch(() => ({ text: '🀄 dev-almanac' }))

  on('command.run', { command: ['qiuqian', 'fortune', '求签'] }, async $ => ({ text: (await draw($, settings)).text })).catch(
    () => ({ text: '🎋 dev-almanac' }),
  )

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (settings.level !== 'lively' || e.props.hasSurvey) return next(e)
    const mode = await read($, band)
    if (mode === 'gone') return next(e)
    const { t, ms } = await todayNow($, settings)
    const w = words(t.lang)
    const L = LABELS[t.lang]
    const { Box, Text, Button } = $.ui.resolve(e)
    const a = t.almanac
    const mine = t.mySign !== undefined ? t.horoscopeOf(t.mySign) : undefined
    const accent = a.isDaJi ? DAJI : mine?.color.hex ?? 'gray'
    const style = a.isDaJi ? 'double' : 'round'
    const controls = [
      <Button key="lang" plain label={`🌐 ${w.langButton}`} onPress={() => switchLang($, settings)} />,
      <Button
        key="toggle"
        plain
        label={mode === 'open' ? `▴ ${w.less}` : `▾ ${w.details}`}
        onPress={() => update($, band, m => (m === 'open' ? 'card' : 'open'))}
      />,
    ]
    const badges = [
      mine ? <Text color={mine.color.hex}>{` ${signAt(mine.sign).glyph} `}</Text> : '',
      mine ? starText(Text, mine.overall) : '',
      t.mercury.isRetrograde ? <Text color="warning">{' ☿'}</Text> : '',
      t.isClash ? <Text color={BAD}>{' ⚠'}</Text> : '',
    ]
    if (mode === 'card') {
      const ticker = tickerOf(t)
      const at = (await read($, tick)) % ticker.length
      const dots = ticker.map((_, i) => (i === at ? '●' : '·')).join('')
      return (
        <Box borderStyle={style} borderColor={accent} paddingX={1} flexDirection="row" gap={1}>
          <Box flexGrow={1} flexShrink={1}>
            <Text wrap="truncate-end">
              <Text bold color={a.isDaJi ? DAJI : undefined}>{`${a.isDaJi ? '✨' : ''}${cardHead(t)}`}</Text>
              {badges}
              <Text dimColor>{'  │  '}</Text>
              {ticker[at] ?? ''}
              <Text dimColor>{`  ${dots}`}</Text>
            </Text>
          </Box>
          {controls}
        </Box>
      )
    }
    const nowZhi = zhiIndexOf(new Date(ms).getHours())
    const r = (label: string, value: Child | Child[]) => row({ Box, Text }, t.lang, label, value)
    return (
      <Box borderStyle={style} borderColor={accent} paddingX={1} flexDirection="column">
        <Box flexDirection="row" gap={1}>
          <Box flexGrow={1} flexShrink={1}>
            <Text wrap="truncate-end">
              <Text bold color={a.isDaJi ? DAJI : undefined}>{`🀄 ${w.title}`}</Text>
              <Text dimColor>{`   ${a.date} · ${a.lunar} · ${w.yearOf(a.ganzhi.year, animal(t, a.yearAnimal))}`}</Text>
            </Text>
          </Box>
          {controls}
        </Box>
        <Text italic color="cyan">{a.flavor[0] ?? ''}</Text>
        {notices(t, Text)}
        {r(`✅ ${L.yi}`, join(a.yi, 4, t.lang))}
        {r(`⛔ ${L.ji}`, join(a.ji, 4, t.lang))}
        {r(`⏰ ${L.hours}`, hourChips(t, Text, a.hours, nowZhi))}
        {mine
          ? r(`✦ ${signName(mine.sign, t.lang)}`, [starText(Text, mine.overall), `  ${moodOf(t, mine.overall)} · ${mine.item} · ${mine.number.n}`])
          : <Text dimColor>{`${w.noBirthday} → ${w.fullAlmanac}`}</Text>}
        {mine ? <Text italic dimColor>{`“${mine.advice}”`}</Text> : ''}
        <Box flexDirection="row" gap={2}>
          <Button key="pane" variant="primary" label={`🀄 ${w.fullAlmanac}`} onPress={() => openPane($, settings)} />
          <Button
            key="draw"
            label={`🎋 ${w.draw}`}
            onPress={async () => {
              const out = await draw($, settings)
              $.ui.toast(`🎋 ${words(t.lang).slipHeader(out.slip.number, out.slip.level)} · ${out.slip.poem.join(t.lang === 'zh' ? '' : ' ')}`)
            }}
          />
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { t, ms } = await todayNow($, settings)
    const w = words(t.lang)
    const L = LABELS[t.lang]
    const { Box, Text, Button } = $.ui.resolve(e)
    const a = t.almanac
    const wide = e.props.bodyColumns >= 64
    const browsed = await read($, shownSign)
    const hs = t.horoscopeOf(browsed ?? t.mySign ?? 0)
    const drawn = await read($, slip)
    // Drawn surfaces animate in CSS: they read only whether the tube shakes, so
    // the frame ticks (the terminal's) never redraw, and so restart, their art.
    const isSvgSurface = e.surface !== 'terminal'
    const shakingNow = await read($, isShaking)
    const frame = isSvgSurface ? (shakingNow ? 1 : 0) : await read($, shake)
    const today = drawn && drawn.date === a.date ? slipOf(drawn.number, t.lang) : undefined
    const step = (d: number) => () => update($, shownSign, s => ((s ?? t.mySign ?? 0) + d + 12) % 12)
    const weekday = w.weekdays[new Date(ms).getDay()] ?? ''
    const lunar =
      t.lang === 'zh'
        ? `农历${a.lunarYear}年${a.lunar} · ${a.ganzhi.year}年 ${a.ganzhi.month}月 ${a.ganzhi.day}日 · ${a.yearAnimal}年`
        : `Lunar ${a.lunar} · ${a.ganzhi.year} year, ${a.ganzhi.month} month, ${a.ganzhi.day} day · Year of the ${animal(t, a.yearAnimal)}`
    const dayGod = `${a.dayGod.luck === 'good' ? '🌞' : '🌚'} ${a.dayGod.name} · ${a.dayGod.luck === 'good' ? w.dayGood : w.dayBad} · ${a.zhiXing}`
    const sep = sepOf(t.lang)
    const dir = t.lang === 'zh' ? a.sha : DIRECTIONS_EN[a.sha] ?? a.sha
    const term = `${seasonOf(a.solarTerm.name)} ${a.solarTerm.name}${a.solarTerm.isToday ? (t.lang === 'zh' ? '（今日）' : ' (today)') : ''}`
    const chong = `${ANIMAL_EMOJI[a.chong.animal] ?? ''} ${t.lang === 'zh' ? `冲${a.chong.desc}` : animal(t, a.chong.animal)} · ${w.sha} ${SHA_ARROW[a.sha] ?? ''}${dir}`
    const nowZhi = zhiIndexOf(new Date(ms).getHours())
    const table = $.ui.resolve(e)
    // Mobile has no text field: it gets the command instead.
    const Input = e.surface !== 'mobile' && 'Input' in table ? table.Input : undefined
    const editing = await read($, isEditingBirthday)
    const s = await settingsNow($, settings)
    const submit = async (value: string) => {
      const out = await setBirthday($, settings, value)
      $.ui.toast(out.line)
    }
    const field = Input ? (
      <Input
        key="birthday"
        label={w.birthdayLabel}
        placeholder={w.birthdayPlaceholder}
        value={editing && s.birthday ? ymdText(s.birthday) : undefined}
        submitLabel={w.birthdaySave}
        onSubmit={value => submit(value)}
      />
    ) : (
      <Text dimColor>{w.birthdayCommand}</Text>
    )
    const profile =
      t.mySign === undefined || !s.birthday ? (
        <Box flexDirection="column">
          <Text color={GOLD}>{w.noBirthday}</Text>
          {field}
        </Box>
      ) : editing ? (
        field
      ) : (
        <Box flexDirection="row" gap={1}>
          <Box flexGrow={1} flexShrink={1}>
            <Text dimColor>
              {`🎂 ${ymdText(s.birthday)} · ${animalTag(t, t.myAnimal ?? '')} · ${signAt(t.mySign).glyph} ${signName(t.mySign, t.lang)}`}
            </Text>
          </Box>
          <Button key="editBirthday" plain label={w.birthdayEdit} onPress={() => update($, isEditingBirthday, () => true)} />
        </Box>
      )
    const foot = `${w.disclaimer}${!t.mercury.isRetrograde && t.mercury.next ? `  ·  ${w.nextRetro(t.mercury.next)}` : ''}`
    const isOpen = await read($, isActivitiesOpen)
    const toggleLines = (isJi: boolean) => {
      const hidden = (isJi ? a.ji : a.yi).length - ACTIVITY_LINES
      return (
        <Button
          key={isJi ? 'moreJi' : 'moreYi'}
          plain
          label={isOpen ? w.fewerLines : w.moreLines(hidden)}
          onPress={() => update($, isActivitiesOpen, v => !v)}
        />
      )
    }
    const lists = [
      activityBox(t, { Box, Text }, false, wide, isOpen, toggleLines(false)),
      activityBox(t, { Box, Text }, true, wide, isOpen, toggleLines(true)),
    ]
    const r = (label: string, value: Child | Child[]) => row({ Box, Text }, t.lang, label, value)
    const slipColor = today ? SLIP_COLORS[today.rank] ?? 'gray' : GOLD
    const special = a.flavor.length > 1 ? a.flavor.slice(0, -1) : []
    // The drawn parts: an Svg where the surface has one, text frames on the terminal.
    const Svg = e.surface !== 'terminal' && 'Svg' in table ? table.Svg : undefined
    const season = seasonOfTerm(a.solarTerm.name)
    const nowDate = new Date(ms)
    const run = await read($, introRun)
    const introFrame = Svg ? 0 : await read($, intro)
    const pageColor = a.isDaJi ? DAJI : '#c0392b'
    const lunarDay = t.lang === 'zh' ? a.lunar : `${a.ganzhi.day} · ${a.lunar}`
    const headLines = [
      <Text>{lunar}</Text>,
      <Text dimColor>{dayGod}</Text>,
      ...special.map(line => <Text bold color={DAJI}>{line}</Text>),
      <Text italic color="cyan">{a.flavor.at(-1) ?? ''}</Text>,
    ]
    const header = Svg ? (
      <Box flexDirection="column">
        <Svg
          source={bannerSvg({
            season,
            month: w.months[nowDate.getMonth()] ?? '',
            day: nowDate.getDate(),
            weekday: w.weekdayShort[nowDate.getDay()] ?? '',
            lunarDay,
            accent: pageColor,
            seed: a.date,
            run,
            isRedDay: nowDate.getDay() === 0 || nowDate.getDay() === 6 || a.flavor.length > 1,
            tag: t.lang === 'zh' ? `${a.solarTerm.name} · ${SEASON_NAME[season][0]}` : `${a.solarTerm.name} · ${SEASON_NAME[season][1]}`,
            big: t.lang === 'zh' ? `${a.lunar}` : `Lunar ${Math.abs(a.lunarMD.m)}·${a.lunarMD.d}`,
            small:
              t.lang === 'zh'
                ? `${a.ganzhi.year}${a.yearAnimal}年 · ${a.ganzhi.month}月 · ${a.ganzhi.day}日 · ${a.naYin.name}`
                : `${a.ganzhi.year} · ${a.ganzhi.month} · ${a.ganzhi.day} · Year of the ${animal(t, a.yearAnimal)}`,
          })}
          alt={w.bannerAlt(`${a.date} ${weekday} · ${lunar}`)}
        />
        <Box flexDirection="column" paddingX={1}>
          {headLines.slice(1)}
        </Box>
      </Box>
    ) : (
      <Box flexDirection="row" gap={2}>
        <Box flexDirection="column" flexGrow={1} flexShrink={1}>
          <Text color={season === 'winter' ? 'cyan' : season === 'spring' ? '#ee8fb0' : season === 'summer' ? 'cyan' : '#d9822b'}>
            {particleLine(season, a.date, introFrame, Math.max(16, e.props.bodyColumns - 20))}
          </Text>
          {headLines}
        </Box>
        <Box flexDirection="column" alignItems="center" flexShrink={0}>
          <Box flexDirection="column" alignItems="center" borderStyle="round" borderColor={pageColor} width={10}>
            <Text bold color={pageColor}>{w.months[nowDate.getMonth()] ?? ''}</Text>
            <Text bold>{String(nowDate.getDate()).padStart(2, '0')}</Text>
            <Text dimColor>{w.weekdayShort[nowDate.getDay()] ?? ''}</Text>
          </Box>
        </Box>
      </Box>
    )
    const pendingDraw = drawSlip(t, await settingsNow($, settings), drawn).drawn
    const pending = pendingDraw.number
    const tube = (isShaking: boolean) =>
      Svg ? (
        <Svg source={tubeSvg({ isShaking, number: pending, label: w.tubeLabel, run: pendingDraw.count ?? 1 })} alt={w.tubeAlt} width={112} height={138} />
      ) : (
        <Box flexDirection="column">
          {terminalTube(isShaking ? frame : 0, w.tubeLabel).map(line => (
            <Text color={GOLD}>{line}</Text>
          ))}
        </Box>
      )
    return (
      <Box flexDirection="column" gap={1}>
        {Svg ? (
          // The pane's own frame carries the title; the postcard is the card.
          <Box flexDirection="column" gap={1}>
            <Box flexDirection="row" alignItems="center" gap={1}>
              <Box flexGrow={1} flexShrink={1}>
                <Text dimColor>{`${a.isDaJi ? '✨ ' : ''}${a.date} ${weekday}`}</Text>
              </Box>
              <Button key="lang" label={`🌐 ${w.langButton}`} onPress={() => switchLang($, settings)} />
            </Box>
            {header}
          </Box>
        ) : (
          <Box flexDirection="column" borderStyle={a.isDaJi ? 'double' : 'round'} borderColor={a.isDaJi ? DAJI : hs.color.hex} paddingX={1}>
            <Box flexDirection="row" gap={1}>
              <Box flexGrow={1} flexShrink={1}>
                <Text bold color={a.isDaJi ? DAJI : undefined}>{`${a.isDaJi ? '✨ ' : ''}🀄 ${w.title}`}</Text>
              </Box>
              <Text dimColor>{`${a.date} ${weekday}`}</Text>
              <Button key="lang" label={`🌐 ${w.langButton}`} onPress={() => switchLang($, settings)} />
            </Box>
            {header}
          </Box>
        )}
        {notices(t, Text).length > 0 ? <Box flexDirection="column">{notices(t, Text)}</Box> : null}
        {wide ? (
          <Box flexDirection="row" gap={1}>
            {lists}
          </Box>
        ) : (
          <Box flexDirection="column">{lists}</Box>
        )}
        <Box flexDirection="column" paddingX={1}>
          {r(L.clash, chong)}
          {r(L.term, term)}
          {r(L.hours, hourChips(t, Text, a.hours, nowZhi))}
        </Box>
        {horoscopeBox(t, { Box, Text, Button }, hs, wide, step, profile)}
        <Box
          flexDirection="row"
          gap={2}
          alignItems="center"
          borderStyle="round"
          borderColor={today && !shakingNow ? slipColor : GOLD}
          borderDimColor={!today && !shakingNow}
          paddingX={1}
        >
          {tube(shakingNow || frame > 0)}
          {shakingNow || frame > 0 ? (
            <Box flexDirection="column" flexGrow={1} flexShrink={1} gap={1}>
              <Text bold color={GOLD}>{`${w.shaking}${'.'.repeat((frame % 3) + 1)}`}</Text>
              <Text dimColor>{t.lang === 'zh' ? '心诚则灵……' : 'Concentrate on your question…'}</Text>
            </Box>
          ) : today ? (
            <Box flexDirection="column" flexGrow={1} flexShrink={1}>
              <Box flexDirection="row">
                <Box flexGrow={1} flexShrink={1}>
                  <Text bold color={slipColor}>{`🎋 ${w.slipHeader(today.number, today.level)}`}</Text>
                </Box>
                <Text dimColor>{a.date}</Text>
              </Box>
              <Box flexDirection="column" paddingX={2} paddingY={1}>
                <Text italic>{today.poem[0]}</Text>
                <Text italic>{today.poem[1]}</Text>
              </Box>
              <Text dimColor>{`${w.slipReading}${sep}${today.reading}`}</Text>
              <Box flexDirection="row" marginTop={1} gap={2} alignItems="center">
                <Button key="draw" label={w.shakeAgain} onPress={() => shakeAndDraw($, settings)} />
                <Text dimColor>{(drawn?.count ?? 1) > 1 ? w.shakeCount(drawn?.count ?? 1) : w.shakeHint}</Text>
              </Box>
            </Box>
          ) : (
            <Box flexDirection="column" flexGrow={1} flexShrink={1} gap={1}>
              <Text bold color={GOLD}>{t.lang === 'zh' ? '🎋 今日一签' : "🎋 Today's slip"}</Text>
              <Text dimColor>{t.lang === 'zh' ? '心诚则灵。摇出不满意的，可以再摇。' : 'Concentrate, then shake. Not happy? Shake again.'}</Text>
              <Button key="draw" variant="primary" label={w.shakeButton} onPress={() => shakeAndDraw($, settings)} />
            </Box>
          )}
        </Box>
        <Box paddingX={1}>
          <Text dimColor italic>
            {foot}
          </Text>
        </Box>
      </Box>
    )
  })
}
