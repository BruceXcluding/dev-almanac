#!/usr/bin/env node
// dev-almanac for Codex: an MCP server over stdio with four tools. It uses
// the same almanac, horoscope and slip code as the Claude Code mod and the
// dsh plugin (vendor/, built by scripts/build-dsh.mjs), and the same settings
// file as the dsh plugin. No dependencies, no network, no model calls.
import { createInterface } from 'node:readline'
import { pathToFileURL } from 'node:url'

import { dayView, draw, fileStore, set } from './vendor/almanac.js'
import { SIGNS } from './vendor/core/horoscope.js'

const VERSION = '0.1.0'

// ---------------------------------------------------------------- Markdown

const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n)
const MOODS = {
  zh: ['', '🫠 今日宜躺平', '😅 稳住别浪', '🙂 平平稳稳', '😎 手感火热', '🤩 天选码农'],
  en: ['', '🫠 a couch day', '😅 steady now', '🙂 smooth sailing', '😎 on fire', '🤩 the chosen coder'],
}
const ELEMENT_EN = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' }

/** Finds a sign by its Chinese or English name, or its glyph, in either language. */
export function signIndex(name) {
  if (typeof name !== 'string' || name.trim() === '') return null
  const q = name.trim().toLowerCase().replace(/座$/, '')
  const i = SIGNS.findIndex(s => [s.zh.replace(/座$/, ''), s.en.toLowerCase(), s.glyph].includes(q))
  return i === -1 ? null : i
}

/** Today's almanac as Markdown: the 宜/忌 table, the day's details and one horoscope. */
export function todayMarkdown(view, signName) {
  const zh = view.lang === 'zh'
  const out = [`### 🀄 ${view.date} ${view.weekday}`, '', `${view.lunar}  `, view.dayGod, '']
  const special = view.flavor.length > 1 ? view.flavor.slice(0, -1) : []
  for (const line of [...special, view.flavor.at(-1) ?? '', ...view.notices.map(n => n.text)]) if (line) out.push(`> ${line}  `)
  out.push('')
  const rows = Math.max(view.yi.length, view.ji.length)
  out.push(zh ? '| 宜 | | 忌 | |' : '| Do | | Don’t | |', '| --- | --- | --- | --- |')
  for (let i = 0; i < rows; i++) {
    const y = view.yi[i]
    const j = view.ji[i]
    const cell = x => (x ? [x.term, x.dev === x.term ? '—' : x.dev] : ['', ''])
    out.push(`| ${[...cell(y), ...cell(j)].join(' | ')} |`)
  }
  const good = view.hours.filter(x => x.luck === 'good').map(x => x.zhi).join(' ')
  out.push(
    '',
    zh
      ? `**冲煞** ${view.chong} · **节气** ${view.solarTerm} · **吉时** ${good}`
      : `**Clash** ${view.chong} · **Solar term** ${view.solarTerm} · **Lucky hours** ${good}`,
    '',
  )
  const asked = signIndex(signName)
  const i = asked ?? view.mySign
  if (i === null) {
    out.push(zh ? '🎂 告诉我你的生日（YYYY-MM-DD），就能看到你的星座运势。' : '🎂 Tell me your birthday (YYYY-MM-DD) to see your horoscope.')
  } else {
    const sign = view.signs[i]
    const hs = sign.horoscope
    const partner = view.signs[hs.partner]
    const reason = zh ? `${hs.color.element}生${hs.color.dayElement}` : `${ELEMENT_EN[hs.color.element]} feeds ${ELEMENT_EN[hs.color.dayElement]}`
    const you = i === view.mySign ? (zh ? '（你）' : ' (you)') : ''
    const hour = hs.hour ? `${hs.hour.zhi} ${hs.hour.range}` : '—'
    out.push(
      `**${sign.glyph} ${sign.name}${you}** ${stars(hs.overall)} ${MOODS[view.lang][hs.overall] ?? ''}`,
      '',
      zh
        ? `编码 ${stars(hs.coding)} · 调试 ${stars(hs.debugging)} · 评审 ${stars(hs.review)}`
        : `Coding ${stars(hs.coding)} · Debugging ${stars(hs.debugging)} · Review ${stars(hs.review)}`,
      '',
      zh
        ? `幸运色 **${hs.color.name}** · ${hs.color.nickname}（${reason}） · 幸运物 ${hs.item} · 幸运数字 ${hs.number.what} · 语言工具 ${hs.tool} · 幸运时辰 ${hour} · 结对星座 ${partner.glyph} ${partner.name} · 贵人 ${hs.helper} · 小心 ${hs.watch}`
        : `Color **${hs.color.name}** · ${hs.color.nickname} (${reason}) · Item ${hs.item} · Number ${hs.number.what} · Tool ${hs.tool} · Hour ${hour} · Pair with ${partner.glyph} ${partner.name} · Helper ${hs.helper} · Watch out ${hs.watch}`,
      '',
      `💡 ${hs.advice}`,
    )
  }
  out.push('', `_${view.disclaimer}_`)
  return out.join('\n')
}

/** A slip as Markdown. */
export function slipMarkdown(lang, slip, disclaimer) {
  const zh = lang === 'zh'
  const head = zh ? `🎋 **第 ${slip.number} 签 · ${slip.level}**` : `🎋 **Slip ${slip.number} · ${slip.level}**`
  const count = slip.count > 1 ? (zh ? `（今日第 ${slip.count} 摇）` : ` (shake #${slip.count} today)`) : ''
  return [
    head + count,
    '',
    `> ${slip.poem[0]}  `,
    `> ${slip.poem[1]}`,
    '',
    `${zh ? '解签：' : 'Reading: '}${slip.reading}`,
    '',
    `_${disclaimer}_`,
  ].join('\n')
}

// ---------------------------------------------------------------- tools

export const TOOLS = [
  {
    name: 'almanac_today',
    description:
      "Today's programmer's almanac (程序员黄历): the lunar date, 宜 (do) and 忌 (avoid) mapped to coding tasks, 冲煞, 节气, lucky hours, and a horoscope. Show the result to the user as returned. For fun; computed offline.",
    inputSchema: {
      type: 'object',
      properties: {
        sign: {
          type: 'string',
          description: 'A zodiac sign to show (天蝎座, Scorpio, ♏). Empty: the user’s own sign, if they set a birthday.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'draw_fortune_slip',
    description:
      'Draw a fortune slip (求签): one of 100 slips from 上上签 to 下下签, each with a code-themed couplet. Each draw gives a new slip. Show the slip to the user as returned.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'set_almanac_birthday',
    description:
      "Save the user's birthday, which gives their zodiac sign and 生肖. Only when the user gives it. Use \"clear\" to remove it.",
    inputSchema: {
      type: 'object',
      properties: { birthday: { type: 'string', description: 'YYYY-MM-DD, or "clear"' } },
      required: ['birthday'],
      additionalProperties: false,
    },
  },
  {
    name: 'set_almanac_language',
    description: 'Set the language of the almanac: zh (Chinese, the default) or en (English).',
    inputSchema: {
      type: 'object',
      properties: { language: { type: 'string', enum: ['zh', 'en'] } },
      required: ['language'],
      additionalProperties: false,
    },
  },
]

/** Runs one tool. Returns MCP content; a bad argument comes back as an error result, never a throw. */
export function callTool(name, args, { store, now = () => Date.now() }) {
  const text = t => ({ content: [{ type: 'text', text: t }] })
  const fail = t => ({ content: [{ type: 'text', text: t }], isError: true })
  try {
    if (name === 'almanac_today') return text(todayMarkdown(dayView(now(), store.read()), args?.sign))
    if (name === 'draw_fortune_slip') {
      const { slip } = draw(now(), store)
      const view = dayView(now(), store.read())
      return text(slipMarkdown(view.lang, slip, view.disclaimer))
    }
    if (name === 'set_almanac_birthday') return text(set(store, { birthday: args?.birthday ?? '' }))
    if (name === 'set_almanac_language') return text(set(store, { lang: args?.language }))
    return fail(`unknown tool: ${name}`)
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err))
  }
}

// ---------------------------------------------------------------- MCP over stdio

/** Answers one JSON-RPC message; undefined for a notification. */
export function handle(message, deps) {
  const { id, method, params } = message ?? {}
  const reply = result => ({ jsonrpc: '2.0', id, result })
  if (id === undefined || id === null) return undefined
  if (method === 'initialize') {
    return reply({
      protocolVersion: params?.protocolVersion ?? '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'dev-almanac', version: VERSION },
      instructions:
        "Programmer's almanac (程序员黄历) and daily horoscope. Use almanac_today when the user asks what today is good or bad for, and draw_fortune_slip when they want a fortune (求签). For fun only.",
    })
  }
  if (method === 'ping') return reply({})
  if (method === 'tools/list') return reply({ tools: TOOLS })
  if (method === 'tools/call') return reply(callTool(params?.name, params?.arguments ?? {}, deps))
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } }
}

export function serve({ input = process.stdin, output = process.stdout, deps = { store: fileStore() } } = {}) {
  const lines = createInterface({ input, crlfDelay: Infinity })
  lines.on('line', line => {
    if (line.trim() === '') return
    let message
    try {
      message = JSON.parse(line)
    } catch {
      output.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'parse error' } })}\n`)
      return
    }
    const answer = handle(message, deps)
    if (answer) output.write(`${JSON.stringify(answer)}\n`)
  })
  return lines
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) serve()
