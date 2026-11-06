# dev-almanac

<p align="center"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a></p>

<p align="center"><strong>程序员黄历 + 今日星运: a playful daily almanac and horoscope for Claude Code.</strong></p>

<p align="center"><sub>offline · deterministic · no tokens · never blocks your work</sub></p>

---

A Claude Code mod that puts a Chinese almanac (黄历) and a daily horoscope where you work. The traditional
宜/忌 become coding advice: 破土 is `git init`, 开市 is a release, 嫁娶 is merging branches, 祭祀 is writing
docs, 解除 is deleting dead code, and 忌动土 means don't change the DB schema today.

## What you get

- **A card above the prompt**: today's lunar date, 宜/忌, your sign's stars, a 水逆 badge. Click **详情** to expand it; it steps aside after your first prompt.
- **中文 / English**: press 🌐 on the card or in the pane, or run `/almanac en` / `/almanac zh`. The pick is remembered.
- **A status-line entry** such as `🀄 宜写文档 ☿ 水逆`.
- **`/almanac`** (also `/huangli`): a pane with the full day: 干支, 宜/忌 with their traditional names, 冲煞, 节气, 吉时, the horoscope for every sign (‹ › to browse) and today's slip.
- **`/qiuqian`** (also `/fortune`): draw one of 100 fortune slips (上上签 … 下下签) with a code-themed couplet. Not happy with it? Shake again for another.
- **大吉 days**: about once a lunar month a special gold card and a toast.

The horoscope gives overall, coding, debugging and review stars, a lucky color (it tints the card's border), lucky
item, lucky number as an HTTP status, port or exit code, lucky language or tool, lucky hour (one of today's 吉时),
best pair-programming sign, a helpful person, something to watch out for and one line of advice. 水逆 takes a
debugging star and shows a warning; when today's 冲 falls on your 生肖 you get a gentle warning too.

Everything is computed on your machine from the date: no network, no model calls, no tokens. For entertainment only.

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
| `level` | `lively` (card, status line, toasts), `quiet` (status line only), `off` (commands only) | `lively` |

## Develop

```bash
claude plugin validate .
claude plugin test .
```

The almanac comes from [lunar-javascript](https://github.com/6tail/lunar-javascript) 1.7.7 by 6tail (MIT),
vendored in `hooks/vendor/` with its license. 水逆 dates are from the Farmers' Almanac tables.

## License

MIT
