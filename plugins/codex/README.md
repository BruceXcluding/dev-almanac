# dev-almanac for Codex

A Codex plugin with the [dev-almanac](../../README.md) tools: today's programmer's almanac, a daily horoscope and fortune slips. It uses the same almanac code as the Claude Code mod and the dsh plugin.

## Install

1. Add this repository as a plugin marketplace:

   ```bash
   codex plugin marketplace add BruceXcluding/dev-almanac
   ```

2. Install the plugin:

   ```bash
   codex plugin add dev-almanac@dev-almanac
   ```

3. Start a new Codex session.

The plugin needs Node.js 20 or later on your `PATH`.

## Use

Ask Codex in your own words:

- "What does the almanac say about today?"
- "What does the almanac say about deploying today?"
- "Draw me a fortune slip", then "Shake again"
- "My birthday is 1997-06-01"
- "Show me today's horoscope for Scorpio"

Codex understands the same requests in Chinese.

| Tool | What it does |
| --- | --- |
| `almanac_today` | Shows the lunar date, the do and don't lists as coding tasks, the clash, the solar term, the lucky hours and a horoscope |
| `draw_fortune_slip` | Draws one of 100 fortune slips. Each draw gives a new slip. |
| `set_almanac_birthday` | Saves your birthday, for your sign and your Chinese zodiac animal |
| `set_almanac_language` | Sets the language to `zh` or `en` |

## Settings and privacy

The tools keep your birthday, your language and today's slip in `~/.cache/dev-almanac/state.json`. The dsh plugin uses the same file. To use another folder, set `DEV_ALMANAC_HOME`.

The plugin reads the clock and that file. It makes no network calls. Codex shows the results with its own model.

## Develop

The files in `vendor/` are built from the mod's `hooks/*.ts`. Do not edit them. To rebuild them, run this from the repository root:

```bash
node scripts/build-dsh.mjs
```
