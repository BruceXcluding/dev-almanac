---
name: almanac
description: Use when the user asks about today's almanac or 黄历, what today is good or bad for (宜/忌), their horoscope or 星运, a lucky color or number, or wants a fortune slip (求签, 抽签, 摇签). Calls the dev-almanac tools and shows their result.
---

# Programmer's almanac

The dev-almanac tools compute everything on this machine from the date. They need no network and no model of their own.

## Which tool to call

| The user asks | Call |
| --- | --- |
| What today is good or bad for, today's 黄历, 宜/忌, lucky hours | `almanac_today` |
| The horoscope of a sign (天蝎座, Scorpio) | `almanac_today` with `sign` |
| A fortune slip: 求签, 抽一签, "shake again" | `draw_fortune_slip` |
| "My birthday is 1997-06-01" | `set_almanac_birthday`, then `almanac_today` |
| English or Chinese for the almanac | `set_almanac_language`, then `almanac_today` |

## How to answer

1. Show the tool's Markdown as returned. Do not rewrite the table or the slip.
2. After it, add at most one short sentence of your own, in the user's language.
3. Each `draw_fortune_slip` call gives a new slip. Call it again only when the user asks to draw again.
4. Save a birthday only when the user gives it. Do not guess one.
5. Keep the "for entertainment only" line. The almanac is for fun and does not replace tests or review.
