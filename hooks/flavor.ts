// A line of personality for the day: festivals (lunar and solar), coder
// holidays, the 节气 when one begins, and the weekday. Fixed by the date.
import type { Lang } from './i18n'

type Pair = readonly [string, string]

/** Lunar festivals by 'month-day' of the lunar calendar (leap months skipped). */
const LUNAR: Record<string, Pair> = {
  '1-1': ['🧧 春节快乐！今日宜给代码发红包：每个函数都加一行注释。', '🧧 Happy Lunar New Year! Give every function a red envelope: one good comment.'],
  '1-15': ['🏮 元宵节：汤圆要圆，接口要全。', '🏮 Lantern Festival: round dumplings, complete APIs.'],
  '2-2': ['🐉 龙抬头：宜理发，也宜修 lint 警告。', '🐉 Dragon Raises Its Head: get a haircut, then fix the lint warnings.'],
  '5-5': ['🐲 端午节：划龙舟要齐心，结对编程也是。', '🐲 Dragon Boat Festival: row together, pair together.'],
  '7-7': ['💞 七夕：今日宜给你的 IDE 写一封情书（commit message）。', '💞 Qixi: write your IDE a love letter (a commit message).'],
  '7-15': ['🕯️ 中元节：别去翻那个没人敢动的老模块。', "🕯️ Ghost Festival: leave the haunted legacy module alone."],
  '8-15': ['🥮 中秋节：月饼可以五仁，代码不能五味杂陈。', '🥮 Mid-Autumn: mooncakes may be mixed-nut, code should not be.'],
  '9-9': ['⛰️ 重阳节：登高望远，看看系统架构图吧。', '⛰️ Double Ninth: climb high and look at the architecture diagram.'],
  '12-8': ['🥣 腊八节：腊八粥里什么都有，你的 utils.ts 也是。', '🥣 Laba: the porridge has everything in it. So does your utils.ts.'],
  '12-23': ['🧹 小年：宜扫舍，把 node_modules 也扫一扫。', '🧹 Little New Year: sweep the house, and node_modules too.'],
}

/** Solar dates, 'month-day'. */
const SOLAR: Record<string, Pair> = {
  '1-1': ['🎆 元旦：新的一年，新的 TODO（旧的也还在）。', '🎆 New Year: new TODOs (the old ones are still there).'],
  '2-14': ['💘 情人节：今天的 PR 请温柔地 review。', "💘 Valentine's Day: review today's PRs gently."],
  '3-14': ['🥧 π 日：3.14159… 精度够用就好。', '🥧 Pi Day: 3.14159… is precise enough.'],
  '4-1': ['🃏 愚人节：今天的 bug 报告先确认一下是不是玩笑。', "🃏 April Fools': check today's bug reports aren't jokes."],
  '5-1': ['🛠️ 劳动节：劳动最光荣，下班也光荣。', "🛠️ Labour Day: work is glorious; so is logging off."],
  '5-4': ['🌌 May the 4th be with you. 愿原力与你的构建同在。', '🌌 May the 4th be with you, and with your build.'],
  '6-1': ['🎈 儿童节：今天写代码要像孩子一样好奇。', "🎈 Children's Day: code with a child's curiosity."],
  '10-1': ['🇨🇳 国庆：长假前别上线，长假后先看监控。', "🇨🇳 National Day: don't ship before the holiday; check dashboards after."],
  '10-24': ['💻 1024 程序员节快乐！今天你最大，bug 最小。', "💻 Happy 1024 Programmers' Day! Today you're the biggest, bugs the smallest."],
  '10-31': ['🎃 万圣节：最吓人的是没有备份的生产库。', "🎃 Halloween: the scariest thing is a prod DB with no backup."],
  '11-11': ['🛒 双十一：今天的流量，全靠扩容。', "🛒 Singles' Day: today's traffic runs on autoscaling."],
  '12-24': ['🎄 平安夜：平安就是线上零告警。', '🎄 Christmas Eve: peace means zero alerts.'],
  '12-25': ['🎅 圣诞节：圣诞老人只给写了测试的孩子送礼物。', '🎅 Christmas: Santa only brings gifts to kids who wrote tests.'],
}

const NEW_YEARS_EVE: Pair = ['🧨 除夕：今夜不发版，守岁也守住生产环境。', "🧨 New Year's Eve: no releases tonight; guard prod as you guard the year."]

/** The first day of each 节气, a line each. */
const TERMS: Record<string, Pair> = {
  立春: ['🌱 立春：万物复苏，项目也该重启了。', '🌱 Start of Spring: everything wakes up, your project too.'],
  雨水: ['🌧️ 雨水：日志如雨，耐心读完。', '🌧️ Rain Water: logs pour down; read them patiently.'],
  惊蛰: ['🐛 惊蛰：春雷一响，bug 都醒了。', '🐛 Awakening of Insects: the thunder wakes the bugs.'],
  春分: ['⚖️ 春分：昼夜平分，读写也平衡一下。', '⚖️ Spring Equinox: balance day and night, reads and writes.'],
  清明: ['🌿 清明：缅怀那些被删除的分支。', '🌿 Qingming: remember the branches we deleted.'],
  谷雨: ['🌾 谷雨：播下单元测试，秋天收获稳定。', '🌾 Grain Rain: plant unit tests, harvest stability.'],
  立夏: ['☀️ 立夏：服务器也要防暑，看看 CPU 温度。', '☀️ Start of Summer: keep the servers cool, check the CPUs.'],
  小满: ['🌾 小满：小满即可，别过度设计。', '🌾 Grain Buds: a little is enough; don’t over-engineer.'],
  芒种: ['🌱 芒种：忙着种需求，也别忘了还债。', '🌱 Grain in Ear: busy planting features, still pay the debt.'],
  夏至: ['🌞 夏至：白天最长，适合把 PR 一口气 review 完。', '🌞 Summer Solstice: the longest day, review every PR.'],
  小暑: ['🍉 小暑：吃块西瓜再 debug。', '🍉 Minor Heat: eat watermelon, then debug.'],
  大暑: ['🔥 大暑：线上热，脑子要冷。', '🔥 Major Heat: hot prod, cool head.'],
  立秋: ['🍂 立秋：贴秋膘，也给缓存加点内存。', '🍂 Start of Autumn: fatten up, and give the cache more memory.'],
  处暑: ['🌬️ 处暑：暑气渐消，告警也该消了。', '🌬️ End of Heat: the heat fades, so should the alerts.'],
  白露: ['💧 白露：清晨的代码最清醒。', '💧 White Dew: morning code is the clearest.'],
  秋分: ['⚖️ 秋分：前后端各占一半，别吵了。', '⚖️ Autumn Equinox: half frontend, half backend, no fighting.'],
  寒露: ['🍁 寒露：天凉了，加件衣服，加个索引。', '🍁 Cold Dew: add a layer, add an index.'],
  霜降: ['❄️ 霜降：冻结需求，准备封版。', '❄️ Frost: freeze the scope, prepare the code freeze.'],
  立冬: ['🧣 立冬：进补的季节，补测试、补文档。', '🧣 Start of Winter: time to stock up: tests, docs.'],
  小雪: ['🌨️ 小雪：小步提交，像雪花一样。', '🌨️ Minor Snow: small commits, like snowflakes.'],
  大雪: ['☃️ 大雪：大雪封山，别大重构。', '☃️ Major Snow: snowed in, no big refactors.'],
  冬至: ['🥟 冬至：最长的夜，适合最长的 debug（但先吃饺子）。', '🥟 Winter Solstice: the longest night, the longest debug (dumplings first).'],
  小寒: ['🧊 小寒：冷启动要慢慢来。', '🧊 Minor Cold: take cold starts slowly.'],
  大寒: ['🥶 大寒：最冷的日子，最热的服务器。', '🥶 Major Cold: the coldest day, the hottest servers.'],
}

const WEEKDAYS: readonly Pair[] = [
  ['😴 周日：今天的 on-call 辛苦了。', '😴 Sunday: thank you, on-call.'],
  ['☕ 周一：先咖啡，后 git pull。', '☕ Monday: coffee first, git pull second.'],
  ['🚀 周二：一周最适合发版的日子。', '🚀 Tuesday: the best release day of the week.'],
  ['🐫 周三：驼峰日，变量名也要驼峰。', '🐫 Wednesday: hump day, camelCase day.'],
  ['📋 周四：写周报前先回忆一下这周干了啥。', '📋 Thursday: remember what you did before writing the weekly report.'],
  ['🙅 周五：只读不写，绝不上线。', '🙅 Friday: read-only. Never deploy.'],
  ['🎮 周六：side project 的好日子。', '🎮 Saturday: side-project day.'],
]

const FRIDAY_13: Pair = ['🔪 黑色星期五：今天 git push 前请三思。', '🔪 Friday the 13th: think three times before git push.']
const PROGRAMMERS_DAY: Pair = ["👩‍💻 第 256 天：国际程序员节！", "👩‍💻 Day 256: International Programmers' Day!"]

export type DayFacts = {
  solar: { y: number; m: number; d: number }
  weekday: number
  lunarMonth: number
  lunarDay: number
  isNewYearsEve: boolean
  /** The 节气 that begins today, if any. */
  termToday: string | undefined
}

const dayOfYear = ({ y, m, d }: DayFacts['solar']) => (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000 + 1

/** The day's flavor lines, the most special first; the weekday's always last. */
export function flavorOf(f: DayFacts, lang: Lang): string[] {
  const k = lang === 'zh' ? 0 : 1
  const out: Pair[] = []
  if (f.isNewYearsEve) out.push(NEW_YEARS_EVE)
  if (f.lunarMonth > 0) {
    const lunar = LUNAR[`${f.lunarMonth}-${f.lunarDay}`]
    if (lunar) out.push(lunar)
  }
  const solar = SOLAR[`${f.solar.m}-${f.solar.d}`]
  if (solar) out.push(solar)
  if (dayOfYear(f.solar) === 256) out.push(PROGRAMMERS_DAY)
  if (f.weekday === 5 && f.solar.d === 13) out.push(FRIDAY_13)
  if (f.termToday) {
    const term = TERMS[f.termToday]
    if (term) out.push(term)
  }
  const weekday = WEEKDAYS[f.weekday]
  if (weekday) out.push(weekday)
  return out.map(p => p[k])
}

/** Whether the day has more than its weekday line: a festival or a 节气. */
export const isSpecial = (lines: readonly string[]) => lines.length > 1
