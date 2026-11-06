# dev-almanac

<p align="center"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">中文</a></p>

<p align="center"><strong>程序员黄历 + 今日星运：给 Claude Code 加一点每日仪式感。</strong></p>

<p align="center"><sub>离线 · 确定性 · 不耗 token · 绝不打扰正事</sub></p>

---

一个 Claude Code mod，把黄历和每日星运放在你写代码的地方。传统宜忌翻译成编程活动：破土＝`git init`，开市＝发版上线，
嫁娶＝合并分支，祭祀＝写文档，解除＝删死代码，忌动土＝今天别改数据库表结构。

## 功能

- **输入框上方的一行卡片**：农历日期、宜忌、你的星座星级、水逆标记。点 **详情** 展开；发出第一条消息后自动收起。
- **中英切换**：点卡片或面板上的 🌐，或输入 `/almanac en` / `/almanac zh`，选择会被记住。
- **状态栏**：例如 `🀄 宜写文档 ☿ 水逆`。
- **`/almanac`**（或 `/huangli`）：打开完整黄历面板：干支、宜忌（附传统说法）、冲煞、节气、吉时、十二星座运势（‹ › 切换）和今日签文。
- **`/qiuqian`**（或 `/fortune`）：从 100 支签（上上签 … 下下签）中求一支，附程序员签诗。不满意可以再摇一次，换一支。
- **大吉之日**：大约每个农历月一次，金色卡片 + 提示。

星运包括综合、编码、调试、评审星级，幸运色（同时给卡片描边）、幸运物、以 HTTP 状态码/端口/退出码呈现的幸运数字、
幸运语言或工具、幸运时辰（取自今日吉时）、最佳结对星座、贵人、小心事项和一句建议。水逆时调试减一星并提示；
今日所冲恰好是你的生肖时也会温柔提醒。

一切都在本机根据日期计算：不联网、不调用模型、不耗 token。仅供娱乐。

## 安装

在终端会话的输入框中：

```
/plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
```

按 `y` 添加 marketplace，再选择安装范围。在 shell 中：

```bash
claude plugin install dev-almanac --marketplace BruceXcluding/dev-almanac
```

在桌面应用中（不支持 `/plugin`）：点输入框旁的 +，选 Plugins，用 `BruceXcluding/dev-almanac` 添加 marketplace，再添加插件。

## 设置

**生日：** 在 `/almanac` 面板的 🎂 输入框里填写，或输入 `/almanac birthday 1997-06-01`（`/almanac birthday clear` 清除）。只保存在本机。

默认值也可以通过插件选项设置（`dev-almanac.birthday`、`dev-almanac.language`、`dev-almanac.level`）：

| 设置 | 取值 | 默认 |
| --- | --- | --- |
| `birthday` | `YYYY-MM-DD`：用于星座和生肖 | 空 |
| `language` | `zh`、`en` | `zh` |
| `level` | `lively`（卡片、状态栏、提示）、`quiet`（仅状态栏）、`off`（仅命令） | `lively` |

## 开发

```bash
claude plugin validate .
claude plugin test .
```

黄历数据来自 6tail 的 [lunar-javascript](https://github.com/6tail/lunar-javascript) 1.7.7（MIT），随附于 `hooks/vendor/` 并保留其许可证。
水逆日期取自 Farmers' Almanac。

## 许可证

MIT
