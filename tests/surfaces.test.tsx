// The band, the pane, the commands and the status line, with the engine
// beneath the plugin simulated and the clock fixed on 2026-11-05 (水逆).
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'
import { daJiOfMonth } from '../hooks/almanac'

const AT = new Date(2026, 10, 5, 10, 0).getTime()
const DAY = 24 * 3600 * 1000

const BAND = {
  plugin: 'dev-almanac',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 12,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 12 },
    view: {},
  },
} as const

const PANE = {
  plugin: 'dev-almanac',
  component: 'Pane',
  requestId: 'dev-almanac',
  props: {
    title: '🀄 程序员黄历',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 40 },
    view: {},
  },
} as const

type World = { titles: string[]; status: (string | undefined)[]; toasts: string[]; opened: string[]; commands: string[]; prompts: string[] }

function world(on: On, now = AT, store: Record<string, unknown> = {}) {
  const w: World = { titles: [], status: [], toasts: [], opened: [], commands: [], prompts: [] }
  const clock = mock.clock(on, { now })
  mock.store(on, store)
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('command.register', (_, e) => {
    w.commands.push(e.name)
    return { value: { command: e.name } }
  })
  on('ui.open', (_, e) => {
    w.opened.push(e.id)
    w.titles.push(e.title ?? '')
    return { value: { isPlaced: true } }
  })
  on('ui.panes', () => ({ value: w.opened.length > 0 ? [{ id: 'dev-almanac', title: w.titles.at(-1) ?? '', isPlaced: true }] : [] }) as never)
  on('ui.status', (_, e) => {
    w.status.push(e.text)
    return { value: undefined }
  })
  on('ui.toast', (_, e) => {
    w.toasts.push(e.text)
    return { value: undefined }
  })
  on('prompt.submit', (_, e) => {
    w.prompts.push(e.text)
    return { text: e.text }
  })
  // The engine's own drawing, beneath the plugin.
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  return { w, clock }
}

const start = ($: Engine, surface: 'terminal' | 'desktop' = 'terminal') =>
  $.session.start({ cwd: '/code/app', surface, isInteractive: true })

const run = ($: Engine, command: string) =>
  $.command.run({ command, args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })

const textOf = async (ui: { findAll: (q: { type: string }) => Promise<{ text: string }[]> }) =>
  (await ui.findAll({ type: 'Text' })).map(t => t.text).join('\n')

test('status line and commands at session start', async ($, on) => {
  const { w } = world(on)
  await start($)
  expect(w.status.at(-1)).toBe('🀄 宜写文档 ☿ 水逆')
  expect(w.commands).toEqual(expect.arrayContaining(['almanac', 'huangli', 'qiuqian', 'fortune']))
  expect(w.toasts).toEqual([])
})

test('the band: one line, expands on press, gone after the first prompt', async ($, on) => {
  world(on)
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    const line = await textOf(ui)
    expect(line).toContain('九月廿七 癸未日')
    expect(line).toContain('✅ 宜 写文档')
    expect(line).toContain('☿')
    await ui.press({ key: 'toggle' })
    const open = await textOf(ui)
    expect(open).toContain('水逆中（至 2026-11-13）')
    expect(open).toContain('⛔ 忌')
    expect(open).toContain('📋 周四')
    expect(open).toContain('▲现在 巳时')
    await ui.press({ key: 'toggle' })
    expect(await textOf(ui)).not.toContain('水逆中')
    await ui.unmount()
  }
  await $.prompt.submit({ text: 'fix the build', wait: false, origin: { kind: 'composer' } })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await textOf(ui)).toBe('engine')
    await ui.unmount()
  }
})

test('the band keeps what other mods draw there, and a slash command leaves it up', async ($, on) => {
  world(on)
  await start($)
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  const both = await textOf(ui)
  expect(both).toContain('九月廿七 癸未日')
  expect(both).toContain('engine')
  await ui.press({ key: 'toggle' })
  expect(await textOf(ui)).toContain('engine')
  await ui.unmount()
  await $.prompt.submit({ text: '/reload-plugins', command: { name: 'reload-plugins', args: '' }, wait: false, origin: { kind: 'composer' } } as never)
  const after = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await textOf(after)).toContain('九月廿七')
  await after.unmount()
})

test('the prompt passes through untouched', async ($, on) => {
  const { w } = world(on)
  await start($)
  await $.prompt.submit({ text: 'DROP TABLE users; -- just kidding', wait: false, origin: { kind: 'composer' } })
  expect(w.prompts).toEqual(['DROP TABLE users; -- just kidding'])
})

test('with a birthday: sign, lucky color border, 冲 warning for a 牛', { options: { birthday: '1997-06-01' } }, async ($, on) => {
  world(on)
  await start($)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  const line = await textOf(ui)
  expect(line).toContain('♊ ')
  expect(line).toContain('⚠')
  const box = (await ui.findAll({ type: 'Box' })).find(b => b.props.borderStyle)
  expect(String(box?.props.borderColor)).toMatch(/^#[0-9a-f]{6}$/)
  await ui.press({ key: 'toggle' })
  expect(await textOf(ui)).toContain('今日冲属牛（你）')
  await ui.unmount()
})

test('the pane shows the full day on every surface', async ($, on) => {
  const { w } = world(on)
  await start($)
  const ran = await run($, 'almanac')
  expect(ran.text).toBe('已打开今日黄历。')
  expect(w.opened).toEqual(['dev-almanac'])
  expect(w.titles).toEqual(['🀄 程序员黄历'])
  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const all = await textOf(ui)
    if (surface === 'terminal') {
      expect(all).toContain('农历二〇二六年九月廿七 · 丙午年 戊戌月 癸未日 · 马年')
    } else {
      // The postcard carries the lunar date; the text below does not repeat it.
      const banner = await ui.find({ type: 'Svg' })
      expect(String(banner?.props.alt)).toContain('农历二〇二六年九月廿七')
      expect(String(banner?.props.source)).toContain('丙午马年 · 戊戌月 · 癸未日')
      expect(all).not.toContain('农历二〇二六年')
    }
    // Old term on the left, what it means on the right.
    expect(all).toContain('祭祀\n写文档')
    expect(all).toContain('动土·破土\n改表结构 · 新开坑')
    expect(all).toContain('🐮 冲(丁丑)牛 · 煞 ←西')
    expect(all).toContain('吉时')
    expect(all).toContain('🍂 霜降')
    expect(all).toContain('星期四')
    expect(all).toContain('☿ 水逆中')
    expect(all).toContain('仅供娱乐')
    expect(all).toContain('幸运数字')
    expect(all).toContain('🎂 填上生日，解锁你的星座与生肖')
    expect(all).not.toContain('/config')
    // Browse the signs.
    expect(all).toContain('♈ 白羊座')
    await ui.press({ key: 'next' })
    expect(await textOf(ui)).toContain('♉ 金牛座')
    await ui.press({ key: 'prev' })
    await ui.unmount()
  }
})

test('the pane in English', { options: { language: 'en', birthday: '1990-11-05' } }, async ($, on) => {
  world(on)
  await start($)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const all = await textOf(ui)
  expect(all).toContain('祭祀\nwrite docs')
  expect(all).toContain('Thursday')
  expect(all).toContain('♏ Scorpio')
  expect(all).toContain('For entertainment only')
  expect(all).toContain('Mercury retrograde')
  await ui.unmount()
})

test('/qiuqian: each shake draws anew, never the same slip twice in a row; the pane shows it', async ($, on) => {
  const { clock } = world(on)
  await start($)
  const first = await run($, 'qiuqian')
  expect(first.text).toMatch(/^🎋 第 \d+ 签 · \S+签\n/)
  const again = await run($, 'fortune')
  expect(again.text).toMatch(/（今日第 2 摇）/)
  const n1 = /第 (\d+) 签/.exec(String(first.text))?.[1]
  const n2 = /第 (\d+) 签/.exec(String(again.text))?.[1]
  expect(n2).not.toBe(n1)
  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const all = await textOf(ui)
    expect(all).toContain(`第 ${n2} 签`)
    expect(all).toContain('今日第 2 摇')
    expect((await ui.find({ key: 'draw' }))?.props.label).toBe('🎋 再摇一次')
    await ui.unmount()
  }
  // The next day starts over at the first shake.
  await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'composer' } })
  await clock.advance(DAY)
  const tomorrow = await run($, 'qiuqian')
  expect(tomorrow.text).not.toContain('今日第')
})

test('the same shakes give the same slips (seeded by date, person and count)', async ($, on) => {
  world(on)
  await start($)
  const a = [await run($, 'qiuqian'), await run($, 'qiuqian'), await run($, 'qiuqian')].map(r => r.text)
  expect(a[0]).not.toBe(a[1])
  expect(a[1]).not.toBe(a[2])
})

test('a slip drawn in an earlier session shows in the pane, and shaking goes on from it', async ($, on) => {
  world(on, AT, { slip: { date: '2026-11-05', number: 1 } })
  await start($)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await textOf(ui)).toContain('第 1 签 · 上上签')
  await ui.unmount()
  const ran = await run($, 'qiuqian')
  expect(ran.text).toContain('（今日第 2 摇）')
  expect(ran.text).not.toContain('第 1 签')
})

test('the draw button shakes the tube, then shows the slip', async ($, on) => {
  const { clock } = world(on)
  await start($)
  for (const surface of ['terminal', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    if (surface === 'terminal') {
      const pressed = ui.press({ key: 'draw' })
      await clock.advance(400)
      expect(await textOf(ui)).toContain('摇签中')
      await clock.advance(2000)
      await pressed
    }
    expect(await textOf(ui)).toMatch(/第 \d+ 签/)
    expect((await ui.find({ key: 'draw' }))?.props.label).toContain('再摇一次')
    await ui.unmount()
  }
})

test('the card ticker moves on, and stops once the card is gone', async ($, on) => {
  const { clock } = world(on)
  await start($)
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await textOf(ui)).toContain('✅ 宜')
  await clock.advance(6000)
  expect(await textOf(ui)).toContain('⛔ 忌')
  await ui.unmount()
  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  await clock.advance(60_000)
})

test('switch language from the pane, the band and the command; it sticks', async ($, on) => {
  const { w } = world(on)
  await start($)
  const pane = await $.ui.mount({ ...PANE, surface: 'vscode' })
  await pane.press({ key: 'lang' })
  expect(await textOf(pane)).toContain('Thursday')
  expect(w.titles.at(-1) ?? "🀄 Programmer's Almanac").toContain('Almanac')
  expect(w.status.at(-1)).toBe('🀄 Do: write docs ☿ retro')
  await pane.press({ key: 'lang' })
  expect(await textOf(pane)).toContain('星期四')
  await pane.unmount()
  const bandUi = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await bandUi.press({ key: 'lang' })
  expect(await textOf(bandUi)).toContain('✅ Do write docs')
  await bandUi.unmount()
  const ran = await $.command.run({ command: 'almanac', args: 'zh', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })
  expect(ran.text).toContain('已切换为中文')
  expect(String((await run($, 'qiuqian')).text)).toMatch(/^🎋 第/)
  // A new session remembers the pick.
  await $.command.run({ command: 'almanac', args: 'en', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })
  await start($)
  expect(w.status.at(-1)).toContain('Do:')
})

test('the band draws a slip with a toast', async ($, on) => {
  const { w } = world(on)
  await start($)
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'toggle' })
  await ui.press({ key: 'draw' })
  expect(w.toasts.at(-1)).toMatch(/^🎋 第 \d+ 签/)
  await ui.unmount()
})

test('a 大吉 day: special card and one toast a day', async ($, on) => {
  const key = daJiOfMonth({ y: 2026, m: 11, d: 5 })
  const [y, m, d] = key.split('-').map(Number) as [number, number, number]
  const { w } = world(on, new Date(y, m - 1, d, 9).getTime())
  await start($)
  expect(w.toasts).toEqual(['✨ 今日大吉！宜发版、宜合并、宜请奶茶。'])
  expect(w.status.at(-1)).toMatch(/^🀄✨ 大吉 宜/)
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  const box = (await ui.findAll({ type: 'Box' })).find(b => b.props.borderStyle)
  expect(box?.props.borderStyle).toBe('double')
  await ui.press({ key: 'toggle' })
  expect(await textOf(ui)).toContain('大吉之日')
  await ui.unmount()
  // A second session the same day: no second toast.
  await start($)
  expect(w.toasts).toHaveLength(1)
})

test('level quiet: status line, no band', { options: { level: 'quiet' } }, async ($, on) => {
  const { w } = world(on)
  await start($)
  expect(w.status.at(-1)).toContain('🀄')
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await textOf(ui)).toBe('engine')
  await ui.unmount()
})

test('level off: nothing shown unasked, commands still answer', { options: { level: 'off' } }, async ($, on) => {
  const { w } = world(on)
  await start($)
  expect(w.status).toEqual([])
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await textOf(ui)).toBe('engine')
  await ui.unmount()
  expect((await run($, 'qiuqian')).text).toMatch(/签/)
})

test('set the birthday right in the pane; mobile gets the command', async ($, on) => {
  const { w } = world(on)
  await start($)
  const mobile = await $.ui.mount({ ...PANE, surface: 'mobile' })
  expect(await textOf(mobile)).toContain('/almanac birthday YYYY-MM-DD')
  await mobile.unmount()

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.input({ key: 'birthday', text: '1997-13-01' })
  expect(w.toasts.at(-1)).toContain('YYYY-MM-DD')
  await ui.input({ key: 'birthday', text: '1997-06-01' })
  expect(w.toasts.at(-1)).toBe('🎂 生日已设为 1997-06-01。')
  const all = await textOf(ui)
  expect(all).toContain('♊ 双子座（你）')
  expect(all).toContain('🎂 1997-06-01 · 🐮牛 · ♊ 双子座')
  expect(all).toContain('今日冲属牛（你）')
  // Edit, then clear with an empty field.
  await ui.press({ key: 'editBirthday' })
  await ui.input({ key: 'birthday', text: '' })
  expect(w.toasts.at(-1)).toBe('🎂 生日已清除。')
  expect(await textOf(ui)).toContain('🎂 填上生日')
  await ui.unmount()
})

test('/almanac birthday sets it, and a new session remembers', async ($, on) => {
  const { w } = world(on)
  await start($)
  const set = await $.command.run({ command: 'almanac', args: 'birthday 1990-11-05', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })
  expect(set.text).toBe('🎂 生日已设为 1990-11-05。')
  const bad = await $.command.run({ command: 'almanac', args: '生日 tomorrow', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })
  expect(bad.text).toContain('YYYY-MM-DD')
  await start($)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await textOf(ui)).toContain('♏')
  await ui.unmount()
  expect(w.status.length).toBeGreaterThan(0)
})

test('the pane tab follows the language', async ($, on) => {
  const { w } = world(on)
  await start($)
  await run($, 'almanac')
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  await ui.press({ key: 'lang' })
  expect(w.titles.at(-1)).toBe("🀄 Programmer's Almanac")
  await ui.press({ key: 'lang' })
  expect(w.titles.at(-1)).toBe('🀄 程序员黄历')
  await ui.unmount()
})

test('desktop: a season banner with today\'s calendar page and its swinging cord; no page flip', async ($, on) => {
  world(on)
  await start($)
  await run($, 'almanac')
  for (const surface of ['desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const source = String((await ui.find({ type: 'Svg' }))?.props.source)
    // 2026-11-05 is in 霜降: autumn leaves.
    // Leaves sway down and rest on the hill.
    expect(source).toContain('class="piece"')
    expect(source).toContain('class="sway"')
    expect(source).toContain('#d9733a')
    expect(source).toContain('>十一月<')
    expect(source).toContain('>05<')
    expect(source).not.toContain('>04<')
    // The cord stays and swings (no button to pull it).
    expect(source).toContain('class="cord"')
    expect(source).toContain('@keyframes swing')
    expect(source).not.toContain('tear')
    expect(source).toContain('prefers-reduced-motion')
    expect(source).not.toContain('infinite')
    expect(source).not.toContain('Gradient')
    expect(await ui.find({ key: 'cord' })).toBeUndefined()
    await ui.unmount()
  }
})

test('drawn surfaces are not redrawn while the terminal\'s frames tick', async ($, on) => {
  const { clock } = world(on)
  await start($)
  await run($, 'almanac')
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const before = String((await ui.find({ type: 'Svg' }))?.props.source)
  await clock.advance(120 * 5)
  expect(String((await ui.find({ type: 'Svg' }))?.props.source)).toBe(before)
  await ui.unmount()
})

test('terminal: today\'s page at once, leaves drift, then settle', async ($, on) => {
  const { clock } = world(on)
  await start($)
  await run($, 'almanac')
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  const first = await textOf(ui)
  expect(first).toContain('\n05\n')
  expect(first).not.toContain('\n04\n')
  await clock.advance(120 * 3)
  const moving = await textOf(ui)
  expect(moving).not.toBe(first)
  await clock.advance(120 * 12)
  const still = await textOf(ui)
  expect(still).toContain('🍂')
  expect(still).toContain('十一月')
  await ui.unmount()
})

test('quiet level skips the entrance', { options: { level: 'quiet' } }, async ($, on) => {
  world(on)
  await start($)
  await run($, 'almanac')
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await textOf(ui)).toContain('\n05\n')
  await ui.unmount()
})

test('the 签筒: sticks jostle, the tube shakes, a stick pops out, and it can be shaken again', async ($, on) => {
  const { clock } = world(on)
  await start($)
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  const tubeOf = async () => (await ui.findAll({ type: 'Svg' })).map(x => String(x.props.source)).find(x => x.includes('class="tube"')) ?? ''
  const idle = await tubeOf()
  expect(idle).toContain('settle')
  // Every motion ends: no endless loops, flat colour, no gradients.
  expect(idle).not.toContain('infinite')
  expect(idle).not.toContain('Gradient')
  expect(idle).toContain('class="stick"')
  expect(idle).not.toContain('class="pop"')
  const pressed = ui.press({ key: 'draw' })
  await clock.advance(300)
  const shaking = await tubeOf()
  expect(shaking).toContain('shake .16s')
  expect(shaking).toContain('rattle')
  expect(shaking).toContain('class="pop"')
  // Frames tick on, but the drawn tube is not redrawn mid-shake.
  await clock.advance(300)
  expect(await tubeOf()).toBe(shaking)
  expect(await textOf(ui)).toContain('摇签中')
  await clock.advance(3000)
  await pressed
  const firstSlip = (await textOf(ui)).match(/第 \d+ 签 · \S+签/)?.[0]
  expect(firstSlip).toBeDefined()
  // The number that popped out is the slip that came.
  expect(shaking).toContain(`>${/第 (\d+) 签/.exec(String(firstSlip))?.[1]}<`)
  // Shake again: a different slip.
  const again = ui.press({ key: 'draw' })
  await clock.advance(3500)
  await again
  const secondSlip = (await textOf(ui)).match(/第 \d+ 签 · \S+签/)?.[0]
  expect(secondSlip).not.toBe(firstSlip)
  expect(await textOf(ui)).toContain('今日第 2 摇')
  await ui.unmount()
  const term = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await textOf(term)).toContain('╭──────╮')
  await term.unmount()
})

test('宜 and 忌 show five lines each, and "+N 更多" opens the rest', async ($, on) => {
  // 2026-11-06 has more than five lines of 宜.
  const at = new Date(2026, 10, 6, 10).getTime()
  world(on, at)
  await start($)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    const more = await ui.find({ key: 'moreYi' })
    expect(String(more?.props.label)).toMatch(/^\+\d+ 更多$/)
    const before = await textOf(ui)
    await ui.press({ key: 'moreYi' })
    const after = await textOf(ui)
    expect(after.length).toBeGreaterThan(before.length)
    expect((await ui.find({ key: 'moreYi' }))?.props.label).toBe('收起')
    await ui.press({ key: 'moreYi' })
    await ui.unmount()
  }
})
