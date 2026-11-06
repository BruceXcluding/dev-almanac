# dev-almanac

<p align="center"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a></p>

<p align="center"><strong>A programmer's almanac and daily horoscope for Claude Code.</strong></p>

<p align="center"><sub>程序员黄历 · 今日星运 · 求签 · offline · deterministic · no tokens · never blocks your work</sub></p>

<p align="center">
<img src="https://img.shields.io/badge/version-0.8.1-b83227?style=flat-square" alt="version 0.8.1">
<img src="https://img.shields.io/badge/tests-51%20passing-5b8c5a?style=flat-square" alt="51 tests passing">
<a href="./LICENSE"><img src="https://img.shields.io/github/license/BruceXcluding/dev-almanac?style=flat-square" alt="license"></a>
<a href="https://claude.com/product/claude-code" title="Claude Code"><img src="https://img.shields.io/badge/Claude%20Code-mod-D97757?style=flat-square" alt="Claude Code mod"></a>
</p>

---

A Chinese almanac (黄历) tells you what to do and what to avoid on each day. **dev-almanac** translates it for programmers. The almanac says 宜嫁娶, so you merge branches today. It says 忌动土, so you leave the database schema alone.

The mod also gives a horoscope for the twelve signs, a fortune tube (签筒) with 100 slips, and a small card above the prompt. Everything comes from the date. The mod makes no network or model calls and uses no tokens.

<p align="center">
<img src="./docs/postcard.svg" width="620" alt="The almanac postcard: 霜降, 九月廿八, autumn leaves on a hill, and a tear-off calendar page for 6 November">
</p>

| Part | What it shows |
| --- | --- |
| **Card above the prompt** | The lunar date, your sign's stars, and a ticker of 宜, 忌, your lucky item and today's festival |
| **Status line** | One short entry, such as `🀄 宜写文档 ☿ 水逆` |
| **Almanac pane** (`/almanac`) | The full day: a seasonal postcard, 宜/忌, 冲煞, 节气, the twelve 时辰, the horoscope and the 签筒 |
| **Fortune slips** (`/qiuqian`) | One of 100 slips, from 上上签 to 下下签, each with a code-themed couplet |

## Quick start

1. At the prompt of a terminal session, type:

   ```
   /plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
   ```

2. Type `y` to add the marketplace.
3. Select a scope. The mod is active at once.
4. Type `/almanac` to open the almanac.
5. Type your birthday in the 🎂 field. This shows your sign and your 生肖.

From a shell, use this command:

```bash
claude plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
```

The desktop app does not run `/plugin`. In the app, do these steps:

1. Click **+** next to the prompt box, then click **Plugins**.
2. Click **Add marketplace** and type `BruceXcluding/dev-almanac`.
3. Click **Add plugin**.

### dsh (DeepSeek Harness)

The repository also has a dsh version in [`packages/dsh`](packages/dsh/README.md). It gives a 程序员黄历 tab in the right sidebar, the `/almanac` and `/qiuqian` commands, and an `almanac_today` tool for the agent. It uses the same almanac code as the Claude Code mod.

### Codex

The repository also has a Codex plugin in [`plugins/codex`](plugins/codex/README.md). It gives Codex four tools: `almanac_today`, `draw_fortune_slip`, `set_almanac_birthday` and `set_almanac_language`. To install it, run these commands:

```bash
codex plugin marketplace add BruceXcluding/dev-almanac
codex plugin add dev-almanac@dev-almanac
```

Then ask Codex "今天黄历怎么说？" or "帮我求一支签".

## Commands

| Command | What it does |
| --- | --- |
| `/almanac` | Opens the almanac pane. `/huangli` does the same. |
| `/almanac en` | Shows the mod in English. `/almanac zh` shows it in Chinese. |
| `/almanac birthday 1997-06-01` | Sets your birthday. `/almanac birthday clear` removes it. |
| `/qiuqian` | Draws a fortune slip. `/fortune` does the same. Each draw gives a new slip. |

## The almanac

The mod calculates the almanac for your local date. It shows:

- the lunar date and the 干支 of the year, month and day
- 宜 (do) and 忌 (avoid), each term next to its meaning for a programmer
- 冲 (the animal that clashes with today) and 煞 (the direction to avoid)
- the 节气 (solar term) and the 黄道 or 黑道 day
- the twelve 时辰, with the lucky hours marked

Some examples of the 宜/忌 mapping:

| Almanac term | In the 宜 list | In the 忌 list |
| --- | --- | --- |
| 破土, 动土 | Start a new project, `git init` | Change the database schema |
| 开市 | Release, go live | Release on a Friday |
| 嫁娶 | Merge branches | Merge a long-lived branch |
| 祭祀 | Write docs | |
| 解除, 扫舍 | Delete dead code, pay tech debt | |
| 出行, 移徙 | Deploy, migrate servers | Deploy to production |

Special days get their own line on the card and in the pane. These include the Lunar New Year, 中秋, 1024 Programmers' Day and the first day of each 节气. About once in each lunar month, a 大吉 day shows a gold card and a toast.

## The horoscope

Each sign gets a new horoscope every day. The same date and sign always give the same result.

| Item | Example |
| --- | --- |
| Stars | Overall, coding, debugging and review, from 1 to 5 |
| Lucky color | 天青 · VS Code blue (the color also tints the card's border) |
| Lucky item | A rubber duck, a mechanical keyboard, an iced Americano |
| Lucky number | An HTTP status, a port or an exit code, such as `418 I'm a teapot` |
| Lucky language or tool | Rust, `git bisect`, `jq` |
| Lucky hour | One of today's lucky 时辰 |
| Pair partner | The best sign for pair programming today |
| Helpful person, watch out for, advice | One line each |

During Mercury retrograde (水逆), debugging loses one star and the card shows a warning. If today's 冲 is your 生肖, the card also shows a warning.

## Fortune slips

<p align="center">
<img src="./docs/fortune-tube.svg" width="140" alt="A bamboo fortune tube with one slip rising out of it, numbered 30">
</p>

1. Open the almanac with `/almanac`.
2. Click **🎋 摇一摇 · 求签**. The tube shakes and one slip comes out.
3. Read the slip: its grade, a two-line couplet and its meaning.
4. If you do not like the slip, click **🎋 再摇一次** to draw again.

There are 100 slips in seven grades, from 上上签 to 下下签. For the same birthday, the first draw of the day is the same on every machine. Each new draw gives a different slip.

## Settings

The birthday and the language are set in the pane, and the mod remembers them. You can also set defaults as plugin options:

| Option | Values | Default |
| --- | --- | --- |
| `birthday` | A date as `YYYY-MM-DD`. It gives your sign and your 生肖. | empty |
| `language` | `zh` or `en` | `zh` |
| `level` | `lively`: card, status line, toasts and animations. `quiet`: status line only. `off`: commands only. | `lively` |

## Design principles

These rules decide how the mod works. Keep them when you change it.

1. **Never block work.** No hook stops, changes or delays a prompt or a tool call. If a part fails, the session continues without it.
2. **Offline and deterministic.** The output depends only on the date and your birthday. The mod makes no network or model calls.
3. **Keep the pairing visible.** The joke is the old term next to the modern task. Each 宜/忌 row shows the almanac term on the left and its coding meaning on the right.
4. **One table for all mappings.** All mappings are in `hooks/almanac.ts`. Terms with the same meaning share a group, and a group shows as one row. Each list shows five rows. The other rows are under **+N 更多**.
5. **Colors follow the five elements.** The palette has 20 traditional Chinese colors, four for each element. The day's color comes from the element that generates the day's 纳音 element (生我者吉). The pane shows the reason, such as `金生水`.
6. **No violet.** The design guidance keeps violet out of accents, because it is the usual color of generic generated interfaces. It also clashes with the warm colors of the almanac.
7. **Flat and readable.** The drawings use flat color, one corner-radius scale and text with a contrast of 4.5:1 or more. They follow [design-taste-frontend](https://github.com/Leonxlnx/taste-skill).
8. **Motion stops.** Each animation plays once and stops in about five seconds. With the system's reduced-motion setting, nothing moves and nothing is hidden.
9. **Settings where you use them.** You type your birthday in the horoscope box, not in a menu.
10. **For fun only.** The pane says so. Tests decide code quality, not slips.

## Privacy

- **Local.** The mod reads the clock and its own saved settings. It sends nothing over the network.
- **Your birthday stays on your machine.** The mod keeps it in Claude Code's local plugin store.
- **No model calls.** The mod uses no tokens and needs no API key.

## How it works

```
the local date, your birthday
        │
hooks/almanac.ts    lunar-javascript → lunar date, 干支, 宜/忌 groups, 冲煞, 节气, 时辰, 纳音
hooks/horoscope.ts  seeded by date and sign → stars, lucky color (五行), item, number, hour
hooks/fortune.ts    seeded by date, birthday and draw count → one of 100 slips
hooks/flavor.ts     festivals, 节气 and weekday lines
        │
hooks/day.ts        one Today value for every part
        │
hooks/register.tsx  card above the prompt · status line · almanac pane · /qiuqian
hooks/art.ts        the postcard and the 签筒 as SVG, and text frames for the terminal
```

## Develop

```bash
claude plugin validate .
claude plugin test .
```

The tests cover known dates, the horoscope, 冲, 水逆, the slips and each part on every surface.

## Credits

- The almanac uses [lunar-javascript](https://github.com/6tail/lunar-javascript) 1.7.7 by 6tail (MIT). The library is in `hooks/vendor/` with its license.
- The Mercury retrograde dates come from the Farmers' Almanac tables.

## License

[MIT](./LICENSE)
