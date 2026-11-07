# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## 0.8.3 - 2026-11-07

### Fixed
- The card above the prompt no longer takes the whole band: other mods' bars (a translation bar, say) show under it.
- A slash command such as `/almanac` or `/reload-plugins` no longer hides the card. Only a real prompt does.

## 0.8.2 - 2026-11-06

### Added
- A plugin icon (`.claude-plugin/icon.png`, 1024 px, drawn from `assets/icon.svg`), and `homepage` and `repository` in `plugin.json`.

## 0.8.1 - 2026-11-06

### Changed
- Four lucky colours to every element (twenty in all: 松绿, 柳绿, 绛红, 赭石, 秋香, 月白, 香槟, 靛青, 水绿 join the palette), so a day's twelve signs show several colours while keeping the 五行 rule.
- The README sets out the design principles the mod is built by.
- README rewritten in plain technical English (short sentences, numbered steps), structured like session-recap's, with drawn previews in `docs/`.

## 0.8.0 - 2026-11-06

### Changed
- 宜 and 忌 are small two-column tables: the almanac's term on the left, dim, in a fixed column; what it means for a coder on the right.
- Synonyms merge: terms that mean the same thing for a programmer (祭祀·祈福, 出行·移徙·入宅, 求医·治病 …) are one group in the mapping table and read as one line under the group's words; a lone term keeps its own words. Each side shows five lines, the rest behind "+N 更多".

## 0.7.0 - 2026-11-06

### Changed
- Lucky colours are one planned palette: eleven traditional Chinese colours (竹青, 朱砂, 藤黄, 天青 …), each with a coder's nickname, grouped by the five elements. The day's colour comes from the element that generates its 纳音 element (生我者吉), shown beside it (水生木). All are mid-tone, so they read as a border on light and dark themes. No violet: the design guidance keeps it out of accents, and it would clash with the almanac's warm vermilion, ochre and bamboo.
- Falling leaves (now with maples), snow and petals sway as they fall and come to rest on the hill line; the still scene is the same pieces at rest, and under reduced motion they are drawn at rest.
- On desktop, VS Code and mobile the pane no longer repeats its own title or the lunar date the postcard shows; the date and language switch sit on their own row with space before the postcard, and the lines under it are inset to match.
- Buttons say what they do: 🌐 English / 🌐 中文, 修改生日.

## 0.6.0 - 2026-11-06

### Changed
- Calendar, 签筒 and slips redrawn against the design-taste-frontend guidance (github.com/Leonxlnx/taste-skill), as far as it applies to small illustrations: flat colour instead of gradients and drop shadows, one radius scale, text kept at 4.5:1 contrast, no violet accents.
- The calendar is a ring-bound tear-off sheet on a short stack of pages; weekends and festival days print their number in red.
- The 签筒 is flat-shaded bamboo with two nodes, a lacquer rim and a framed 签 label; the drawn slip is wider, with a red band for its number.
- Every motion ends within about five seconds (leaves, snow, petals and breeze fall once; the cord swings then sways once; the tube invites one wobble), and under reduced motion everything rests with nothing hidden.
- The lucky color "Dracula purple" is replaced by "Gruvbox olive".

## 0.5.0 - 2026-11-06

### Changed
- Every shake draws a new slip (never the same twice in a row), in the pane and with `/qiuqian`; the count shows as 今日第 N 摇. A new day starts over.
- A new 签筒: a wooden tube with bamboo bands holding a fan of sticks that jostle while it rests; shaken, it rocks, the sticks rattle and one stick slides out with its number on a red band.

### Removed
- The pull-cord button, the calendar's drop-in and yesterday's page flip. The cord still hangs beside the calendar and swings, then sways gently. The season's falling leaves, snow, petals and breeze stay.

### Fixed
- Stutter: the drawn banner and tube were redrawn, and so restarted, on every frame of the terminal's animation. Drawn surfaces now redraw only when the tube starts or stops shaking.

## 0.4.1 - 2026-11-06

### Changed
- The 签筒 stays in the pane after the day's draw, beside the slip.

## 0.4.0 - 2026-11-06

### Added
- A seasonal postcard heads the pane (desktop, VS Code, mobile): falling leaves in autumn, snow in winter, petals and blooming flowers in spring, a breeze in summer, settling into a still scene; the big lunar date on the left.
- A tear-off calendar drops in on its cord, yesterday's page tears away to today's, and the cord swings. 🪢 Pull the cord replays it all. The terminal gets the same as text: the page flips from yesterday through a curl to today, and the season drifts across.
- A drawn 签筒 to press: it wobbles now and then, shakes when you draw, and the chosen stick rises with its number before the slip appears. The terminal shakes a text tube.
- All motion plays once, honours the system's reduce-motion setting, and is skipped at level quiet.

### Fixed
- The pane's tab title follows the language switch.

## 0.3.1 - 2026-11-06

### Changed
- The birthday is set where it is used: a 🎂 field in the horoscope box of `/almanac` (Enter saves, an empty field clears), or `/almanac birthday YYYY-MM-DD`. No more pointing at `/config`, which the desktop app has its own of. Remembered across sessions; mobile shows the command.

## 0.3.0 - 2026-11-06

### Added
- A line of personality for every day: lunar festivals (春节, 元宵, 端午, 七夕, 中秋, 除夕 …), solar and coder days (1024 程序员节, Day 256, π Day, Friday the 13th …), a line for each 节气 as it begins, and one per weekday. Shown in the pane header and the card's ticker.
- Bigger pools: about twice the lucky items, tools, helpers, watch-outs, advice and lucky numbers; 25 slip scenes and more outcomes per grade.

### Changed
- A more polished look: aligned label/value rows, the date and language switch in the header, notices with a colored bar, the horoscope in two columns when wide, quoted advice, and a framed slip.

## 0.2.0 - 2026-11-06

### Added
- Switch between 中文 and English from the card or the pane (🌐), or with `/almanac zh|en`; the pick is remembered across sessions.
- A livelier card: a ticker cycling 宜, 忌, lucky item, lucky number, advice, 冲煞 and 水逆, with colored stars and badges.
- A redesigned pane: 宜/忌 in green and red boxes (side by side when wide), a 12-时辰 strip with 吉 hours lit and the current hour marked, animal and season emoji, a mood line for the day's stars, icons per lucky item, and a shaking 签筒 before the slip appears, colored by its grade.
- The expanded card can draw a slip, shown as a toast.

## 0.1.0 - 2026-11-05

### Added
- 程序员黄历: lunar date, 干支 year/month/day, 宜/忌 mapped to coding activities, 冲煞, 节气, 吉时, computed offline with vendored lunar-javascript 1.7.7 (MIT).
- 今日星运 for the twelve signs, seeded by date and sign: stars, lucky color (tints the card), item, number, language/tool, hour (one of today's 吉时), pair partner, helpful person, watch-out and advice.
- 水逆 table through January 2030, 生肖 from the birthday with a 冲 warning.
- A one-line card above the prompt that expands on click and collapses after the first prompt; a status-line entry; `/almanac` (`/huangli`) pane; `/qiuqian` (`/fortune`) once-a-day fortune slips (100 of them).
- One 大吉 day per lunar month with a special card and a toast.
- Settings: birthday, language (zh/en), level (lively/quiet/off).
