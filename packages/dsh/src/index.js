// dsh-dev-almanac: 程序员黄历 + 今日星运 for DeepSeek Harness (dsh). A cordis
// plugin, mounted by cordis.patch.yml. The almanac, horoscope and slips are
// the same code the Claude Code mod runs (vendor/core, built from hooks/*.ts).
import { defineTool } from '@deepseek-ai/dsh-tools'

import { almanacCommand, almanacTool, fileStore, panelRoute, slipCommand } from './almanac.js'

export const name = 'dsh-dev-almanac'
export const inject = ['tools']

export function apply(ctx) {
  const deps = { defineTool, store: fileStore() }
  ctx.tools.register(almanacTool(deps))
  // The commands and the panel route are optional: a host without them still has the tool.
  try {
    ctx.inject(['commands'], c => {
      c.commands.register(almanacCommand(deps))
      c.commands.register(slipCommand(deps))
    })
  } catch (err) {
    console.error(`[dsh-dev-almanac] commands not registered: ${err instanceof Error ? err.message : err}`)
  }
  try {
    ctx.inject(['connection'], c => {
      c.effect(() => c.connection.fetch.register(panelRoute(deps)), 'dev-almanac: panel route')
    })
  } catch (err) {
    console.error(`[dsh-dev-almanac] panel route not registered: ${err instanceof Error ? err.message : err}`)
  }
}
