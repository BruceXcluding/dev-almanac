# dev-almanac

<p align="center"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a></p>

<p align="center"><strong>给 Claude Code 用的程序员黄历和每日星运。</strong></p>

<p align="center"><sub>程序员黄历 · 今日星运 · 求签 · 离线 · 确定性 · 不耗 token · 不打扰正事</sub></p>

<p align="center">
<img src="https://img.shields.io/badge/version-0.8.1-b83227?style=flat-square" alt="version 0.8.1">
<img src="https://img.shields.io/badge/tests-51%20passing-5b8c5a?style=flat-square" alt="51 tests passing">
<a href="./LICENSE"><img src="https://img.shields.io/github/license/BruceXcluding/dev-almanac?style=flat-square" alt="license"></a>
<a href="https://claude.com/product/claude-code" title="Claude Code"><img src="https://img.shields.io/badge/Claude%20Code-mod-D97757?style=flat-square" alt="Claude Code mod"></a>
</p>

---

黄历告诉你每天宜做什么、忌做什么。**dev-almanac** 把它翻译给程序员：黄历说宜嫁娶，今天就合并分支；黄历说忌动土，今天就别改数据库表结构。

此外还有十二星座的每日星运、一只装着 100 支签的签筒，以及输入框上方的一张小卡片。所有内容都由日期算出，不联网，不调用模型，不耗 token。

<p align="center">
<img src="./docs/postcard.svg" width="620" alt="黄历明信片：霜降、九月廿八、山坡上的秋叶，以及 11 月 6 日的撕页台历">
</p>

| 部分 | 显示什么 |
| --- | --- |
| **输入框上方的卡片** | 农历日期、你的星座星级，以及轮播的宜、忌、幸运物和今日节日 |
| **状态栏** | 一条简短信息，例如 `🀄 宜写文档 ☿ 水逆` |
| **黄历面板**（`/almanac`） | 完整的一天：季节明信片、宜忌、冲煞、节气、十二时辰、星运和签筒 |
| **求签**（`/qiuqian`） | 100 支签中的一支，从上上签到下下签，每支附一首程序员签诗 |

## 快速开始

1. 在终端会话的输入框中输入：

   ```
   /plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
   ```

2. 输入 `y`，添加 marketplace。
3. 选择安装范围。安装后立即生效。
4. 输入 `/almanac`，打开黄历。
5. 在 🎂 输入框中填写生日，即可看到你的星座和生肖。

在 shell 中，使用以下命令：

```bash
claude plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
```

桌面应用不支持 `/plugin`。在桌面应用中，按以下步骤操作：

1. 点击输入框旁的 **+**，再点击 **Plugins**。
2. 点击 **Add marketplace**，输入 `BruceXcluding/dev-almanac`。
3. 点击 **Add plugin**。

## 命令

| 命令 | 作用 |
| --- | --- |
| `/almanac` | 打开黄历面板。`/huangli` 作用相同。 |
| `/almanac en` | 切换为英文。`/almanac zh` 切换为中文。 |
| `/almanac birthday 1997-06-01` | 设置生日。`/almanac birthday clear` 清除生日。 |
| `/qiuqian` | 求一支签。`/fortune` 作用相同。每求一次都换一支新签。 |

## 黄历

黄历按你的本地日期计算，显示以下内容：

- 农历日期，以及年、月、日的干支
- 宜和忌，每个黄历词旁写着它对程序员的含义
- 冲（今日相冲的生肖）和煞（今日应避开的方位）
- 节气，以及当天是黄道日还是黑道日
- 十二时辰，吉时会标出

宜忌对照示例：

| 黄历词 | 在「宜」中 | 在「忌」中 |
| --- | --- | --- |
| 破土、动土 | 新建项目、`git init` | 改数据库表结构 |
| 开市 | 发版上线 | 周五上线 |
| 嫁娶 | 合并分支 | 合并长期分支 |
| 祭祀 | 写文档 | |
| 解除、扫舍 | 删死代码、还技术债 | |
| 出行、移徙 | 部署、迁移服务器 | 部署生产 |

特别的日子会在卡片和面板上多一行专属文字，包括春节、中秋、1024 程序员节和每个节气的第一天。大约每个农历月有一个大吉之日，会显示金色卡片并弹出提示。

## 星运

每个星座每天都有新的星运。同一日期、同一星座，结果永远相同。

| 项目 | 示例 |
| --- | --- |
| 星级 | 综合、编码、调试、评审，1 到 5 星 |
| 幸运色 | 天青 · VS Code 蓝（同时用作卡片的边框色） |
| 幸运物 | 小黄鸭、机械键盘、冰美式 |
| 幸运数字 | HTTP 状态码、端口或退出码，例如 `418 I'm a teapot` |
| 幸运语言或工具 | Rust、`git bisect`、`jq` |
| 幸运时辰 | 今日吉时之一 |
| 结对星座 | 今天最适合结对编程的星座 |
| 贵人、小心、建议 | 各一句 |

水逆期间，调试减一星，卡片上会显示提醒。如果今日所冲正是你的生肖，卡片也会提醒。

## 求签

<p align="center">
<img src="./docs/fortune-tube.svg" width="140" alt="竹制签筒，一支 30 号签正从筒中升起">
</p>

1. 输入 `/almanac`，打开黄历。
2. 点击 **🎋 摇一摇 · 求签**。签筒摇动，一支签升起。
3. 查看签文：签的等级、两句签诗和解签。
4. 不满意的话，点击 **🎋 再摇一次**，重新求签。

共 100 支签，分七个等级，从上上签到下下签。生日相同时，每天第一支签在任何机器上都相同；之后每求一次，都换一支不同的签。

## 设置

生日和语言都在面板里设置，mod 会记住它们。你也可以用插件选项设置默认值：

| 选项 | 取值 | 默认 |
| --- | --- | --- |
| `birthday` | `YYYY-MM-DD` 格式的日期，用于算出星座和生肖。 | 空 |
| `language` | `zh` 或 `en` | `zh` |
| `level` | `lively`：卡片、状态栏、提示和动画。`quiet`：只有状态栏。`off`：只保留命令。 | `lively` |

## 设计原则

这些原则决定了 mod 的行为。修改时请遵守。

1. **不打扰正事。** 没有任何 hook 会阻止、修改或拖慢输入和工具调用。某一部分出错时，会话照常继续。
2. **离线、确定。** 结果只取决于日期和你的生日。不联网，不调用模型。
3. **保留对照。** 笑点在古词与现代任务的并列。宜忌每行左边是黄历词，右边是编程含义。
4. **一张表管所有对照。** 所有对照都在 `hooks/almanac.ts` 中。意思相同的词归为一组，一组显示为一行。每边显示五行，其余收在 **+N 更多** 中。
5. **幸运色依五行。** 色板有 20 种中国传统色，每种五行四种。当天的颜色取自能生当日纳音五行的那一行（生我者吉），面板上写明来由，例如 `金生水`。
6. **不用紫色。** 设计规范不让紫色做强调色，因为它是千篇一律的生成式界面的常用色；它也和黄历的暖色不搭。
7. **平涂、易读。** 图形使用平涂色、统一的圆角尺寸，文字对比度不低于 4.5:1。参照 [design-taste-frontend](https://github.com/Leonxlnx/taste-skill)。
8. **动画会停。** 每个动画只播一次，约五秒内停下。系统开启"减少动态效果"时，全部静止，内容也不会被隐藏。
9. **在用到的地方设置。** 生日直接填在星运框里，不用去菜单里找。
10. **只为好玩。** 面板上写明仅供娱乐。代码质量靠测试，不靠签。

## 隐私

- **本地运行。** mod 只读取时钟和自己保存的设置，不通过网络发送任何内容。
- **生日只存在本机。** 保存在 Claude Code 本地的插件存储中。
- **不调用模型。** 不耗 token，也不需要 API key。

## 工作原理

```
本地日期、你的生日
        │
hooks/almanac.ts    lunar-javascript → 农历、干支、宜忌分组、冲煞、节气、时辰、纳音
hooks/horoscope.ts  以日期和星座为种子 → 星级、幸运色（五行）、幸运物、数字、时辰
hooks/fortune.ts    以日期、生日和摇签次数为种子 → 100 支签中的一支
hooks/flavor.ts     节日、节气和星期小语
        │
hooks/day.ts        所有部分共用的「今日」数据
        │
hooks/register.tsx  输入框上方的卡片 · 状态栏 · 黄历面板 · /qiuqian
hooks/art.ts        明信片和签筒的 SVG，以及终端里的文字动画
```

## 开发

```bash
claude plugin validate .
claude plugin test .
```

测试覆盖已知日期、星运、冲、水逆、求签，以及每个界面上的各个部分。

## 致谢

- 黄历计算使用 6tail 的 [lunar-javascript](https://github.com/6tail/lunar-javascript) 1.7.7（MIT），随附于 `hooks/vendor/` 并保留其许可证。
- 水逆日期取自 Farmers' Almanac。

## 许可证

[MIT](./LICENSE)
