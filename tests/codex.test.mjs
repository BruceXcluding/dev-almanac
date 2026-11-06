// Tests for the Codex plugin (plugins/codex): its MCP messages and tools with
// the store in memory and the clock fixed, and the real server process over
// stdio with its settings in a temporary folder. Needs
// `node scripts/build-dsh.mjs` first, which builds plugins/codex/vendor.
// Run: node --test tests/codex.test.mjs
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { memoryStore } from '../plugins/codex/vendor/almanac.js'
import { TOOLS, callTool, handle, signIndex } from '../plugins/codex/server.mjs'

// 2026-11-05 10:00 local time: 九月廿七 癸未日, during Mercury retrograde.
const AT = new Date(2026, 10, 5, 10, 0).getTime()
const deps = (store = memoryStore()) => ({ store, now: () => AT })
const textOf = result => result.content.map(c => c.text).join('')

test('initialize and tools/list', () => {
  const init = handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } }, deps())
  assert.equal(init.result.protocolVersion, '2025-03-26')
  assert.equal(init.result.serverInfo.name, 'dev-almanac')
  assert.deepEqual(init.result.capabilities, { tools: {} })
  assert.equal(handle({ jsonrpc: '2.0', method: 'notifications/initialized' }, deps()), undefined)
  const list = handle({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, deps())
  assert.deepEqual(
    list.result.tools.map(t => t.name),
    ['almanac_today', 'draw_fortune_slip', 'set_almanac_birthday', 'set_almanac_language'],
  )
  for (const t of TOOLS) assert.equal(t.inputSchema.type, 'object')
  assert.equal(handle({ jsonrpc: '2.0', id: 3, method: 'nope' }, deps()).error.code, -32601)
})

test('almanac_today: a 宜/忌 table, the details and a horoscope', () => {
  const md = textOf(callTool('almanac_today', {}, deps()))
  assert.match(md, /^### 🀄 2026-11-05 星期四/)
  assert.match(md, /\| 宜 \| \| 忌 \| \|/)
  assert.match(md, /\| 祭祀 \| 写文档 \|/)
  assert.match(md, /\*\*冲煞\*\* 冲\(丁丑\)牛 · 煞西/)
  assert.match(md, /水逆中/)
  assert.match(md, /告诉我你的生日/)
  assert.match(md, /_仅供娱乐，代码质量还得靠测试。_$/)
})

test('a sign by name in either language, or the user’s own', () => {
  assert.equal(signIndex('天蝎座'), 7)
  assert.equal(signIndex('天蝎'), 7)
  assert.equal(signIndex('scorpio'), 7)
  assert.equal(signIndex('♏'), 7)
  assert.equal(signIndex('nope'), null)
  const md = textOf(callTool('almanac_today', { sign: 'Scorpio' }, deps()))
  assert.match(md, /\*\*♏ 天蝎座\*\* [★☆]{5}/)
  assert.match(md, /幸运色 \*\*\S+\*\* · .+（水生木）/)
  const store = memoryStore({ birthday: '1997-06-01' })
  assert.match(textOf(callTool('almanac_today', {}, deps(store))), /\*\*♊ 双子座（你）\*\*/)
})

test('draw_fortune_slip draws anew each time', () => {
  const d = deps()
  const first = textOf(callTool('draw_fortune_slip', {}, d))
  const second = textOf(callTool('draw_fortune_slip', {}, d))
  assert.match(first, /^🎋 \*\*第 \d+ 签 · \S+签\*\*\n/)
  assert.match(second, /（今日第 2 摇）/)
  assert.notEqual(first.split('\n')[0], second.split('\n')[0])
})

test('settings: birthday and language, bad values come back as errors', () => {
  const d = deps()
  assert.match(textOf(callTool('set_almanac_birthday', { birthday: '1997-06-01' }, d)), /1997-06-01/)
  const bad = callTool('set_almanac_birthday', { birthday: 'soon' }, d)
  assert.equal(bad.isError, true)
  assert.match(textOf(bad), /YYYY-MM-DD/)
  assert.equal(textOf(callTool('set_almanac_language', { language: 'en' }, d)), 'dev-almanac switched to English.')
  assert.match(textOf(callTool('almanac_today', {}, d)), /^### 🀄 2026-11-05 Thursday[\s\S]*\| Do \| \| Don’t \| \|[\s\S]*Gemini \(you\)/)
  assert.equal(callTool('set_almanac_language', { language: 'fr' }, d).isError, true)
  assert.equal(callTool('nope', {}, d).isError, true)
})

test('the manifest, the MCP config, the skill and the marketplace agree', () => {
  const root = new URL('../', import.meta.url)
  const plugin = JSON.parse(readFileSync(new URL('plugins/codex/.codex-plugin/plugin.json', root), 'utf8'))
  const mcp = JSON.parse(readFileSync(new URL('plugins/codex/.mcp.json', root), 'utf8'))
  const market = JSON.parse(readFileSync(new URL('.agents/plugins/marketplace.json', root), 'utf8'))
  assert.equal(plugin.name, 'dev-almanac')
  assert.equal(plugin.mcpServers, './.mcp.json')
  assert.deepEqual(mcp.mcpServers['dev-almanac'].args, ['server.mjs'])
  // codex exec cannot ask: the tools run without a prompt (they only touch their own settings file).
  assert.equal(mcp.mcpServers['dev-almanac'].default_tools_approval_mode, 'approve')
  assert.equal(TOOLS[0].annotations.readOnlyHint, true)
  for (const t of TOOLS) assert.equal(t.annotations.openWorldHint, false)
  assert.equal(market.plugins[0].source.path, './plugins/codex')
  assert.equal(market.plugins[0].version, plugin.version)
  const skill = readFileSync(new URL('plugins/codex/skills/almanac/SKILL.md', root), 'utf8')
  assert.match(skill, /^---\nname: almanac\ndescription: /)
})

test('the real server answers over stdio and keeps its settings in DEV_ALMANAC_HOME', async () => {
  const home = mkdtempSync(join(tmpdir(), 'dev-almanac-codex-'))
  const server = fileURLToPath(new URL('../plugins/codex/server.mjs', import.meta.url))
  const child = spawn(process.execPath, [server], { cwd: join(server, '..'), env: { ...process.env, DEV_ALMANAC_HOME: home } })
  try {
    const answers = []
    let buffer = ''
    const waitFor = n =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('no answer')), 5000)
        const check = () => {
          if (answers.length >= n) {
            clearTimeout(timer)
            resolve()
          }
        }
        child.stdout.on('data', chunk => {
          buffer += chunk
          let i
          while ((i = buffer.indexOf('\n')) !== -1) {
            answers.push(JSON.parse(buffer.slice(0, i)))
            buffer = buffer.slice(i + 1)
          }
          check()
        })
      })
    const send = m => child.stdin.write(`${JSON.stringify(m)}\n`)
    const done = waitFor(3)
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } })
    send({ jsonrpc: '2.0', method: 'notifications/initialized' })
    send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'set_almanac_language', arguments: { language: 'en' } } })
    send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'almanac_today', arguments: {} } })
    await done
    assert.equal(answers[0].result.serverInfo.name, 'dev-almanac')
    assert.match(answers[2].result.content[0].text, /^### 🀄 \d{4}-\d{2}-\d{2} \w+day/)
    assert.deepEqual(JSON.parse(readFileSync(join(home, 'state.json'), 'utf8')), { lang: 'en' })
  } finally {
    child.kill()
    rmSync(home, { recursive: true, force: true })
  }
})
