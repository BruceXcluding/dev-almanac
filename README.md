# dev-almanac

<p align="center"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a></p>

<p align="center"><strong>程序员黄历 + 今日星运: a playful daily almanac and horoscope for Claude Code.</strong></p>

<p align="center"><sub>offline · deterministic · no tokens · never blocks your work</sub></p>

---

A Claude Code mod that puts a Chinese almanac (黄历) and a daily horoscope where you work. The traditional
宜/忌 become coding advice: 破土 is `git init`, 开市 is a release, 嫁娶 is merging branches, 祭祀 is writing
docs, 解除 is deleting dead code, and 忌动土 means don't change the DB schema today.

## What you get

- **A card above the prompt**: today's lunar date, your sign's stars and a ticker that cycles through 宜, 忌, your lucky item and today's festival or weekday line. Click **详情** to expand it; it steps aside after your first prompt.
- **A status-line entry** such as `🀄 宜写文档 ☿ 水逆`.
- **`/almanac`** (also `/huangli`): a pane with the full day.
  - A seasonal postcard: leaves, snow, petals or a summer breeze, and a tear-off calendar with a swinging cord.
  - 宜/忌 as a two-column table, the almanac's term beside what it means for a coder.
  - 冲煞, 节气, and the twelve 时辰 with the lucky ones lit.
  - The horoscope for every sign (‹ › to browse), with your own sign marked once you add your 🎂 birthday.
  - A 签筒 you shake.
- **`/qiuqian`** (also `/fortune`): draw one of 100 fortune slips (上上签 … 下下签) with a code-themed couplet. Not happy with it? Shake again for another.
- **中文 / English**: press 🌐 on the card or in the pane, or run `/almanac en` / `/almanac zh`. The pick is remembered.
- **Special days**: Lunar New Year, 中秋 and the other festivals, 1024 Programmers' Day, each 节气 as it begins, and about once a lunar month a gold 大吉 card with a toast.

The horoscope gives:
- overall, coding, debugging and review stars
- a lucky color, which tints the card's border
- a lucky item
- a lucky number as an HTTP status, port or exit code
- a lucky language or tool
- a lucky hour, one of today's 吉时
- the best pair-programming sign
- a helpful person, something to watch out for, and one line of advice

水逆 takes a debugging star and shows a warning. When today's 冲 falls on your 生肖, you get a gentle warning too.

## Design

The rules this mod was built by, so a change can keep to them.

**It never gets in the way.** No hook blocks, rewrites or delays a prompt or a tool call. If any part fails, the session simply goes on without it. The card goes away after your first prompt, and `level` turns the extras down or off.

**Offline and deterministic.** Everything comes from the date and your birthday: no network, no model calls, no tokens. The same day gives the same almanac, horoscope and first slip on every machine. The almanac is computed with lunar-javascript, and 水逆 dates come from a published table.

**The joke is the pairing.** 宜/忌 keep the almanac's own term beside its coding meaning (嫁娶 → 合并分支). The term sits on the left, dim and in a fixed column, like a dictionary entry. All the pairings live in one table (`hooks/almanac.ts`), where synonyms share a group: when two terms of a group fall on one day (祭祀 and 祈福), they read as one line. A term on its own keeps its more specific wording. Each side shows five lines, with the rest behind "+N 更多".

**Lucky colors follow the five elements.** The palette has twenty traditional Chinese colors (竹青, 朱砂, 藤黄, 月白, 天青 …), each with a coder's nickname, four to each element.
- **How the day's color is chosen:** start from the day's 纳音 element, then take the element that generates it (生我者吉: 水生木, 木生火 …). Each sign picks one of that element's four colors, and the pane says why (`金生水`).
- **Readability:** every color is mid-tone with similar strength, so it reads as a border or a swatch on light and dark themes alike.
- **No violet:** the design guidance below keeps it out of accents, where it has become the stock color of generic generated interfaces. It would also clash with the almanac's warm vermilion, ochre and bamboo.

**Flat, calm, readable.** The drawings follow [design-taste-frontend](https://github.com/Leonxlnx/taste-skill) where it applies to small illustrations:
- flat color instead of gradients and soft shadows
- one radius scale and shallow nesting
- text at 4.5:1 contrast or better
- buttons that say what they do (🌐 English, 修改生日)
- no repeated words: the pane's frame carries the title and the postcard carries the lunar date

**Motion that ends.** Every animation plays once and settles within about five seconds:
- Leaves, snow and petals sway down and come to rest on the hill line, so the still scene is the same pieces at rest.
- The cord swings and sways once.
- The 签筒 wobbles once to invite a shake. Shaken, it rocks, its sticks rattle and the drawn stick slides out with its number.
- Under the system's reduce-motion setting everything rests, and nothing is hidden.
- The drawn parts are CSS inside SVG, so they are never redrawn mid-motion. The terminal gets text frames instead: drifting leaves and a jiggling tube.

**Set things where they are used.** Your birthday goes in the 🎂 field of the horoscope box (or `/almanac birthday …`), not in a settings menu. Language switches with one press. Both are remembered across sessions.

**For fun.** Every pane says it: for entertainment only, and code quality still comes from tests.

## Install

At the prompt of a terminal session:

```
/plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
```

Answer `y` to add the marketplace, then pick a scope. From a shell:

```bash
claude plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `BruceXcluding/dev-almanac`, then Add plugin.

## Settings

**Birthday:** type it into the 🎂 field in the `/almanac` pane, or run `/almanac birthday 1997-06-01` (`/almanac birthday clear` removes it). It is kept on this machine.

The defaults can also be set as plugin options (`dev-almanac.birthday`, `dev-almanac.language`, `dev-almanac.level`):

| Setting | Values | Default |
| --- | --- | --- |
| `birthday` | `YYYY-MM-DD`: your sign and 生肖 | empty |
| `language` | `zh`, `en` | `zh` |
| `level` | `lively` (card, status line, toasts, animations), `quiet` (status line only, no entrance), `off` (commands only) | `lively` |

## Develop

```bash
claude plugin validate .
claude plugin test .
```

The almanac comes from [lunar-javascript](https://github.com/6tail/lunar-javascript) 1.7.7 by 6tail (MIT),
vendored in `hooks/vendor/` with its license. 水逆 dates are from the Farmers' Almanac tables.

## License

MIT
