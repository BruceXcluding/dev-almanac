# dsh-dev-almanac

<p align="center"><strong>A programmer's almanac and daily horoscope for dsh (DeepSeek Harness).</strong></p>

<p align="center"><sub>Chinese almanac · daily horoscope · fortune slips · offline · deterministic · no tokens</sub></p>

This is the dsh version of [dev-almanac](https://github.com/BruceXcluding/dev-almanac). It uses the same almanac, horoscope and fortune-slip code as the Claude Code mod.

| Part | What it does |
| --- | --- |
| **Almanac tab** | A tab in the right sidebar with the full day: the seasonal postcard, the do and don't lists, the clash, the solar term, the twelve double-hours, the horoscope, your birthday and the fortune tube |
| `/almanac` | Shows today's almanac as text. `/almanac en` or `/almanac zh` sets the language. `/almanac birthday 1997-06-01` sets your birthday. |
| `/qiuqian` | Draws a fortune slip. Each draw gives a new slip. |
| `almanac_today` tool | Lets the agent read today's almanac |

## Install

1. Run this command. It installs the plugin from its release:

   ```bash
   dsh plugin --profile web add https://github.com/BruceXcluding/dev-almanac/releases/download/dev-almanac-v0.1.1/dsh-dev-almanac-0.1.1.tgz
   ```

   You can also install it from the plugin store, or from the source with `github:BruceXcluding/dev-almanac#path:/packages/dsh`.

2. Restart dsh.
3. Open a session, click **+** in the right sidebar, and select the almanac tab. Its name is **程序员黄历** in Chinese, the default, and **Programmer's almanac** in English.
4. To show the tab in English, press **🌐 English** at its top.

## Settings

The tab and the `/almanac` command share one settings file: `~/.cache/dev-almanac/state.json`. It holds your birthday, your language and today's slip. To use another folder, set `DEV_ALMANAC_HOME`.

## Privacy

The plugin reads the clock and its settings file. It makes no network or model calls. The tab gets its data from the plugin's own route, `POST /api/dev-almanac/panel`, which dsh protects with its browser sign-in. Nothing is written into the chat.

## Develop

From the repository root:

```bash
node scripts/build-dsh.mjs           # compiles hooks/*.ts into packages/dsh/vendor
node --test tests/dsh.test.mjs
node scripts/build-dsh.mjs --pack    # writes dist/dsh-dev-almanac-<version>.tgz and dist/dsh-dev-almanac.tgz
```

Attach both tarballs to every release of this repository, including releases of the Claude Code mod. The dsh plugin list installs `releases/latest/download/dsh-dev-almanac.tgz`, so a latest release without that file breaks installs from the store.

The build needs the `typescript` package. To use a copy from another folder, set `TYPESCRIPT_PATH`.

## License

MIT. The almanac uses [lunar-javascript](https://github.com/6tail/lunar-javascript) 1.7.7 by 6tail (MIT), with its license in `vendor/core/vendor/`.
