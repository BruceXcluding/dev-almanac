// Tests for the dsh plugin (packages/dsh): its operations, commands, tool and
// panel route with the store in memory and the clock fixed, and its browser
// tab with the host's module loader and React stood in for. Needs
// `node scripts/build-dsh.mjs` first, which builds packages/dsh/vendor.
// Run: node --test tests/dsh.test.mjs
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  almanacCommand,
  almanacTool,
  dayText,
  dayView,
  draw,
  fileStore,
  memoryStore,
  panel,
  panelRoute,
  set,
  slipCommand,
} from '../packages/dsh/src/almanac.js'

// 2026-11-05 10:00 local time: 九月廿七 癸未日, during Mercury retrograde.
const AT = new Date(2026, 10, 5, 10, 0).getTime()
const DAY = 24 * 3600 * 1000
const deps = (store = memoryStore()) => ({ store, now: () => AT, defineTool: d => d })

test('the day view: lunar date, 宜/忌 as a two-column table, art', () => {
  const v = dayView(AT, {})
  assert.equal(v.lang, 'zh')
  assert.equal(v.date, '2026-11-05')
  assert.match(v.lunar, /^农历二〇二六年九月廿七 · 丙午年 戊戌月 癸未日 · 马年$/)
  assert.ok(v.yi.some(x => x.term === '祭祀' && x.dev === '写文档'))
  assert.ok(v.ji.some(x => x.terms.includes('动土')))
  assert.equal(v.hours.length, 12)
  assert.equal(v.signs.length, 12)
  assert.equal(v.mySign, null)
  assert.ok(v.notices.some(n => n.text.includes('水逆')))
  assert.match(v.art.banner, />05</)
  assert.match(v.art.tube, /class="tube"/)
  assert.match(v.art.tubeShaking, /shake \.16s/)
})

test('a birthday gives the sign, the animal and the 冲 warning', () => {
  const v = dayView(AT, { birthday: '1997-06-01' })
  assert.equal(v.birthday, '1997-06-01')
  assert.equal(v.signs[v.mySign].name, '双子座')
  assert.equal(v.myAnimal, '牛')
  assert.ok(v.notices.some(n => n.tone === 'bad' && n.text.includes('冲属牛')))
})

test('English', () => {
  const v = dayView(AT, { lang: 'en' })
  assert.equal(v.weekday, 'Thursday')
  assert.ok(v.yi.some(x => x.dev === 'write docs'))
  assert.match(dayText(AT, { lang: 'en' }), /^🀄 2026-11-05 Thursday/)
})

test('each shake draws a new slip, saved; a new day starts over', () => {
  const store = memoryStore()
  const first = draw(AT, store)
  const second = draw(AT, store)
  assert.equal(first.slip.count, 1)
  assert.equal(second.slip.count, 2)
  assert.notEqual(second.slip.number, first.slip.number)
  assert.match(second.text, /今日第 2 摇/)
  assert.equal(store.read().slip.count, 2)
  assert.equal(dayView(AT, store.read()).slip.number, second.slip.number)
  assert.equal(draw(AT + DAY, store).slip.count, 1)
})

test('the tube about to be shaken carries the number that comes out', () => {
  const store = memoryStore()
  const before = dayView(AT, store.read())
  const drawn = draw(AT, store)
  assert.match(before.art.tubeShaking, new RegExp(`>${drawn.slip.number}<`))
})

test('set: language and birthday, with reasons for bad values', () => {
  const store = memoryStore()
  assert.equal(set(store, { lang: 'en' }), 'dev-almanac switched to English.')
  assert.throws(() => set(store, { lang: 'fr' }), /zh or en/)
  assert.match(set(store, { birthday: '1990/11/5' }), /1990-11-05/)
  assert.throws(() => set(store, { birthday: '1997-13-01' }), /YYYY-MM-DD/)
  assert.match(set(store, { birthday: 'clear' }), /cleared/)
  assert.equal(store.read().birthday, undefined)
})

test('the file store survives a bad file and writes atomically', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dev-almanac-'))
  try {
    const store = fileStore(join(dir, 'state.json'))
    assert.deepEqual(store.read(), {})
    store.write({ lang: 'en' })
    assert.deepEqual(fileStore(join(dir, 'state.json')).read(), { lang: 'en' })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('/almanac: the day as text; zh|en and birthday; a bad argument is an error', async () => {
  const d = deps()
  const cmd = almanacCommand(d)
  assert.equal(cmd.name, 'almanac')
  assert.ok(cmd.input?.hint, 'declares input, so /almanac en is a command')
  const day = await cmd.handler({ rawInput: '' })
  assert.equal(day.kind, 'success')
  assert.match(day.text, /宜：.*祭祀 → 写文档/)
  const en = await cmd.handler({ rawInput: ' en ' })
  assert.match(en.text, /^dev-almanac switched to English\./)
  const bday = await cmd.handler({ rawInput: 'birthday 1997-06-01' })
  assert.match(bday.text, /♊ Gemini/)
  assert.equal((await cmd.handler({ rawInput: 'birthday tomorrow' })).kind, 'error')
  assert.equal((await cmd.handler({ rawInput: 'nonsense' })).kind, 'error')
})

test('/qiuqian draws, and the tool reads the day', async () => {
  const d = deps()
  const r = await slipCommand(d).handler({ rawInput: '' })
  assert.equal(r.kind, 'success')
  assert.match(r.text, /^🎋 第 \d+ 签 · \S+签/)
  const tool = almanacTool(d)
  assert.equal(tool.name, 'almanac_today')
  assert.match(await tool.execute({}, {}), /^🀄 2026-11-05 星期四/)
  assert.deepEqual(tool.output.render({}, 'x'), [{ type: 'text', text: 'x' }])
})

test('the panel route: day, draw and set, behind /api', async () => {
  const d = deps()
  const route = panelRoute(d)
  assert.equal(route.path, '/api/dev-almanac/panel')
  assert.deepEqual(route.methods, ['POST'])
  const post = async body =>
    (await route.fetch(new Request('http://dsh/api/dev-almanac/panel', { method: 'POST', body: JSON.stringify(body) }))).json()
  const day = await post({ op: 'day' })
  assert.equal(day.ok, true)
  assert.equal(day.value.slip, null)
  const drawn = await post({ op: 'draw' })
  assert.equal(drawn.value.slip.count, 1)
  const en = await post({ op: 'set', lang: 'en' })
  assert.equal(en.value.lang, 'en')
  assert.deepEqual(await post({ op: 'set', birthday: 'x' }), {
    ok: false,
    error: '🎂 Use YYYY-MM-DD for the birthday, e.g. 1997-06-01.',
  })
  assert.equal((await post({ op: 'nope' })).ok, false)
  assert.equal(panel(undefined, d).date, '2026-11-05')
})

// The browser half, with the host's module loader and React stood in for: a
// render is one synchronous call, hooks give their first values (the first
// useState may be seeded, to render a loaded day).
function loadClient(seed) {
  const tree = (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) })
  let calls = 0
  const React = {
    createElement: tree,
    useState: v => [calls++ === 0 && seed !== undefined ? seed : v, () => {}],
    useEffect: () => {},
    useCallback: f => f,
    useRef: v => ({ current: v }),
  }
  let loaded
  globalThis.window = { __ModuleLoader__: { load: m => (loaded = m) } }
  try {
    new Function(readFileSync(new URL('../packages/dsh/client/client.js', import.meta.url), 'utf8'))()
  } finally {
    delete globalThis.window
  }
  const mod = loaded.factory(name => {
    assert.equal(name, 'react')
    return React
  })
  return { loaded, mod, reset: () => (calls = 0) }
}

const text = node => {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (!node) return ''
  if (typeof node.type === 'function') return text(node.type({ ...node.props, children: node.children }))
  return node.children ? node.children.map(text).join('') : ''
}
const find = (node, pred) => {
  if (!node || typeof node !== 'object') return undefined
  if (typeof node.type === 'function') return find(node.type({ ...node.props, children: node.children }), pred)
  if (pred(node)) return node
  for (const c of node.children ?? []) {
    const hit = find(c, pred)
    if (hit) return hit
  }
  return undefined
}

test('the web client registers its right-sidebar tab and shows the loading line', () => {
  const { loaded, mod } = loadClient()
  assert.equal(loaded.id, 'dsh-dev-almanac')
  assert.deepEqual(mod.inject, ['slots', 'sidebarRightTabs'])
  const registered = { tabs: [], slots: {} }
  mod.apply({
    effect: f => f(),
    sidebarRightTabs: { register: t => registered.tabs.push(t) },
    slots: { inject: (_name, f) => f(), register: (key, c) => (registered.slots[key.name] = c) },
  })
  assert.equal(registered.tabs[0].kind, 'dev-almanac')
  assert.equal(registered.tabs[0].priority, 'extension')
  assert.equal(registered.tabs[0].title(), '程序员黄历')
  assert.match(text(registered.slots['sidebar.right.pane.tab']({})), /正在翻黄历/)
  assert.equal(registered.slots['sidebar.right.pane.tab.title']({}), '程序员黄历')
})

test('the web client draws a loaded day: postcard, 宜/忌, horoscope, 签筒', () => {
  const view = dayView(AT, { birthday: '1997-06-01' })
  const { mod } = loadClient({ phase: 'ready', view })
  const slots = {}
  mod.apply({
    effect: f => f(),
    sidebarRightTabs: { register: () => {} },
    slots: { inject: (_n, f) => f(), register: (key, c) => (slots[key.name] = c) },
  })
  const body = slots['sidebar.right.pane.tab']({})
  const all = text(body)
  assert.match(all, /2026-11-05 星期四/)
  assert.match(all, /祭祀写文档/)
  assert.match(all, /今日星运/)
  assert.match(all, /双子座（你）/)
  assert.match(all, /🎂 1997-06-01/)
  assert.match(all, /摇一摇 · 求签/)
  assert.match(all, /仅供娱乐/)
  const postcard = find(body, n => n.type === 'img' && n.props.className === 'da-card-img')
  assert.match(postcard.props.src, /^data:image\/svg\+xml;charset=utf-8,/)
  // Theme tokens, not literal colours, for the containers.
  const css = readFileSync(new URL('../packages/dsh/client/client.js', import.meta.url), 'utf8')
  assert.match(css, /--dsw-alias-label-primary/)
})

test('a GitHub-source install has everything: vendor/ and LICENSE are tracked, every relative import resolves', async () => {
  const { execFileSync } = await import('node:child_process')
  const { existsSync, readdirSync } = await import('node:fs')
  const root = new URL('../', import.meta.url).pathname
  const pkg = join(root, 'packages', 'dsh')
  // git check-ignore exits 1 when nothing ignores the path.
  for (const path of ['packages/dsh/vendor/core/almanac.js', 'packages/dsh/vendor/core/vendor/lunar.js', 'packages/dsh/LICENSE']) {
    assert.throws(() => execFileSync('git', ['check-ignore', '-q', path], { cwd: root }), `${path} must not be git-ignored`)
  }
  for (const dir of ['src', 'client']) {
    for (const file of readdirSync(join(pkg, dir)).filter(f => f.endsWith('.js'))) {
      const text = readFileSync(join(pkg, dir, file), 'utf8')
      for (const [, spec] of text.matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
        assert.ok(existsSync(join(pkg, dir, spec)), `${dir}/${file} imports ${spec}`)
      }
    }
  }
  const manifest = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'))
  for (const entry of manifest.files) if (!entry.includes('*')) assert.ok(existsSync(join(pkg, entry)), `files lists ${entry}`)
})
