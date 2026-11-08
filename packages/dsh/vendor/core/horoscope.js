// Built from hooks/horoscope.ts by scripts/build-dsh.mjs. Do not edit.
// 今日星运: the twelve Western signs, seeded by date + sign, no model calls.
import { pick, rng, stars } from './seed.js';
import { generatorOf } from './almanac.js';
export const SIGNS = [
    { zh: '白羊座', en: 'Aries', glyph: '♈' },
    { zh: '金牛座', en: 'Taurus', glyph: '♉' },
    { zh: '双子座', en: 'Gemini', glyph: '♊' },
    { zh: '巨蟹座', en: 'Cancer', glyph: '♋' },
    { zh: '狮子座', en: 'Leo', glyph: '♌' },
    { zh: '处女座', en: 'Virgo', glyph: '♍' },
    { zh: '天秤座', en: 'Libra', glyph: '♎' },
    { zh: '天蝎座', en: 'Scorpio', glyph: '♏' },
    { zh: '射手座', en: 'Sagittarius', glyph: '♐' },
    { zh: '摩羯座', en: 'Capricorn', glyph: '♑' },
    { zh: '水瓶座', en: 'Aquarius', glyph: '♒' },
    { zh: '双鱼座', en: 'Pisces', glyph: '♓' },
];
// First day of each sign, by month: Aries starts 3/21, ...
const STARTS = [
    [3, 21, 0], [4, 20, 1], [5, 21, 2], [6, 22, 3], [7, 23, 4], [8, 23, 5],
    [9, 23, 6], [10, 24, 7], [11, 23, 8], [12, 22, 9], [1, 20, 10], [2, 19, 11],
];
/** Index into SIGNS of a birthday. */
export function signOf({ m, d }) {
    const sorted = [...STARTS].sort((a, b) => a[0] * 100 + a[1] - (b[0] * 100 + b[1]));
    let sign = 9; // before 1/20: Capricorn
    for (const [sm, sd, i] of sorted)
        if (m * 100 + d >= sm * 100 + sd)
            sign = i;
    return sign;
}
/** The sign at `i` (wrapped into 0..11). */
export const signAt = (i) => SIGNS[((i % 12) + 12) % 12];
export const signName = (i, lang) => (lang === 'zh' ? signAt(i).zh : signAt(i).en);
const L = (p, lang) => (lang === 'zh' ? p[0] : p[1]);
/**
 * Lucky colours, planned as one palette: twenty traditional Chinese colours,
 * each with a coder's nickname, four to each of the five elements. All sit in the
 * middle of the lightness range with similar strength, so any of them reads
 * as a border or a swatch on a light or a dark theme, and none outshouts the
 * warm paper of the almanac. No violet or lavender: the design guidance this
 * mod follows keeps them out of accents (they are the stock colour of
 * generated, samey interfaces), and a purple beside the vermilion, ochre and
 * bamboo here would read as a stranger.
 */
export const COLORS = [
    { name: ['竹青', 'bamboo green'], nickname: ['终端绿', 'terminal green'], hex: '#5b8c5a', element: '木' },
    { name: ['碧青', 'jade teal'], nickname: ['Solarized 青', 'Solarized cyan'], hex: '#2a9d8f', element: '木' },
    { name: ['松绿', 'pine green'], nickname: ['CI 通过绿', 'CI-pass green'], hex: '#3f7d64', element: '木' },
    { name: ['柳绿', 'willow green'], nickname: ['新分支绿', 'fresh-branch green'], hex: '#7f9f4a', element: '木' },
    { name: ['朱砂', 'cinnabar'], nickname: ['报错红', 'stack-trace red'], hex: '#c8553d', element: '火' },
    { name: ['柿橙', 'persimmon'], nickname: ['Rust 橙', 'Rust orange'], hex: '#d9733a', element: '火' },
    { name: ['胭脂', 'rouge'], nickname: ['樱花粉', 'sakura pink'], hex: '#c25b7a', element: '火' },
    { name: ['绛红', 'crimson lake'], nickname: ['热修复红', 'hotfix red'], hex: '#a63d40', element: '火' },
    { name: ['藤黄', 'gamboge'], nickname: ['警告黄', 'warning yellow'], hex: '#d4a32a', element: '土' },
    { name: ['檀褐', 'sandalwood'], nickname: ['咖啡棕', 'espresso brown'], hex: '#9c6b4a', element: '土' },
    { name: ['赭石', 'ochre'], nickname: ['日志黄', 'log-file amber'], hex: '#b8743a', element: '土' },
    { name: ['秋香', 'autumn olive'], nickname: ['祖传代码绿', 'legacy-code olive'], hex: '#a39a4a', element: '土' },
    { name: ['银灰', 'silver'], nickname: ['暗黑模式灰', 'dark-mode gray'], hex: '#8d99a6', element: '金' },
    { name: ['赤金', 'old gold'], nickname: ['发版金', 'release gold'], hex: '#b8924a', element: '金' },
    { name: ['月白', 'moon white'], nickname: ['浅色模式白', 'light-mode white'], hex: '#9fb3c4', element: '金' },
    { name: ['香槟', 'champagne'], nickname: ['上线香槟', 'launch champagne'], hex: '#c4a874', element: '金' },
    { name: ['天青', 'celadon blue'], nickname: ['VS Code 蓝', 'VS Code blue'], hex: '#4a90c2', element: '水' },
    { name: ['黛蓝', 'indigo ink'], nickname: ['深夜蓝', 'midnight blue'], hex: '#3d5a80', element: '水' },
    { name: ['靛青', 'indigo'], nickname: ['Docker 蓝', 'Docker blue'], hex: '#2f6690', element: '水' },
    { name: ['水绿', 'water teal'], nickname: ['运维青', 'ops teal'], hex: '#4f9fa3', element: '水' },
];
const ITEMS = [
    ['小黄鸭', 'rubber duck'],
    ['机械键盘', 'mechanical keyboard'],
    ['冰美式', 'iced Americano'],
    ['降噪耳机', 'noise-cancelling headphones'],
    ['第二块显示器', 'a second monitor'],
    ['便利贴', 'sticky notes'],
    ['珍珠奶茶', 'bubble tea'],
    ['白板笔', 'whiteboard marker'],
    ['人体工学椅', 'ergonomic chair'],
    ['键盘上的猫', 'a cat on the keyboard'],
    ['保温杯枸杞', 'a thermos of goji tea'],
    ['站立办公桌', 'standing desk'],
    ['薄荷糖', 'mint candy'],
    ['盆栽绿萝', 'a desk plant'],
    ['手写待办清单', 'a handwritten todo list'],
    ['竖屏显示器', 'a portrait monitor'],
    ['热红茶', 'hot black tea'],
    ['一包辣条', 'a pack of spicy strips'],
    ['蓝牙鼠标（电量满）', 'a fully charged mouse'],
    ['桌面小风扇', 'a tiny desk fan'],
    ['旧 T 恤（开源大会纪念款）', 'an old conference T-shirt'],
    ['数据线（能用的那根）', 'the one cable that works'],
    ['速溶咖啡三连', 'three instant coffees'],
    ['降压的深呼吸', 'one deep breath'],
];
const NUMBERS = [
    { n: 418, what: ["HTTP 418 I'm a teapot", "HTTP 418 I'm a teapot"] },
    { n: 200, what: ['HTTP 200 OK', 'HTTP 200 OK'] },
    { n: 204, what: ['HTTP 204 No Content（少说多做）', 'HTTP 204 No Content (say less, ship more)'] },
    { n: 201, what: ['HTTP 201 Created', 'HTTP 201 Created'] },
    { n: 304, what: ['HTTP 304 Not Modified（稳）', 'HTTP 304 Not Modified (steady)'] },
    { n: 8080, what: ['端口 8080', 'port 8080'] },
    { n: 3000, what: ['端口 3000', 'port 3000'] },
    { n: 5432, what: ['端口 5432（Postgres）', 'port 5432 (Postgres)'] },
    { n: 6379, what: ['端口 6379（Redis）', 'port 6379 (Redis)'] },
    { n: 443, what: ['端口 443', 'port 443'] },
    { n: 22, what: ['端口 22（ssh）', 'port 22 (ssh)'] },
    { n: 0, what: ['退出码 0（一切正常）', 'exit code 0 (all good)'] },
    { n: 42, what: ['42：一切的答案', '42: the answer to everything'] },
    { n: 1337, what: ['1337', '1337'] },
    { n: 127, what: ['退出码 127（命令找不到也没关系）', "exit code 127 (command not found, and that's fine)"] },
    { n: 404, what: ['HTTP 404（烦恼找不到你）', 'HTTP 404 (trouble cannot find you)'] },
    { n: 202, what: ['HTTP 202 Accepted（先接下，慢慢做）', 'HTTP 202 Accepted (take it, do it later)'] },
    { n: 9000, what: ['端口 9000（over 9000!）', 'port 9000 (over 9000!)'] },
    { n: 27017, what: ['端口 27017（MongoDB）', 'port 27017 (MongoDB)'] },
    { n: 65535, what: ['端口 65535（上限也是一种圆满）', 'port 65535 (the limit is a kind of completeness)'] },
    { n: 1024, what: ['1024（程序员的整数）', "1024 (a programmer's round number)"] },
];
const TOOLS = [
    'Rust', 'Go', 'Python', 'TypeScript', 'Zig', 'Kotlin', 'Haskell', 'SQL', 'Bash', 'Lua',
    'Vim', 'Emacs', 'git bisect', 'jq', 'Docker', 'curl', 'tmux', 'ripgrep', 'htop', 'Makefile',
    'Elixir', 'OCaml', 'Swift', 'C', 'Nix', 'fzf', 'gdb', 'strace', 'Wireshark', 'Postman',
    'Neovim', 'Helix', 'sed', 'awk', 'Terraform', 'Kubernetes', 'SQLite', 'Redis',
];
const HELPERS = [
    ['写测试的同事', 'the teammate who writes tests'],
    ['2013 年 Stack Overflow 高赞回答', 'a 2013 Stack Overflow answer'],
    ['凌晨还在线的运维', 'the on-call SRE'],
    ['你的小黄鸭', 'your rubber duck'],
    ['写 README 的人', 'whoever wrote the README'],
    ['QA 同学', 'your QA'],
    ['难得讲道理的产品经理', 'a reasonable product manager'],
    ['开源项目维护者', 'an open-source maintainer'],
    ['刚入职的实习生（新视角）', 'the new intern (fresh eyes)'],
    ['三个月前的你（留了注释）', 'you, three months ago (who left comments)'],
    ['隔壁组的 DBA', 'the DBA next door'],
    ['写过同样 bug 的前任', 'the predecessor who wrote the same bug'],
    ['GitHub issue 里的陌生人', 'a stranger in a GitHub issue'],
    ['楼下咖啡店的店员', 'the barista downstairs'],
    ['设计师（给你切好了图）', 'the designer (assets already exported)'],
    ['周报写得很好的组长', 'the lead with great weekly reports'],
    ['会画架构图的人', 'whoever can draw the architecture'],
    ['知道密码在哪的运维', 'the ops person who knows where the password is'],
    ['你自己的 git log', 'your own git log'],
    ['耐心的 code reviewer', 'a patient code reviewer'],
];
const WATCH = [
    ['周五下午的发布', 'Friday-afternoon releases'],
    ['没有测试的 PR', 'PRs without tests'],
    ['时区', 'time zones'],
    ['差一错误 (off-by-one)', 'off-by-one errors'],
    ['缓存失效', 'cache invalidation'],
    ['正则表达式', 'regular expressions'],
    ['依赖大版本升级', 'major dependency upgrades'],
    ['merge conflict', 'merge conflicts'],
    ['空指针', 'null pointers'],
    ['浮点数精度', 'floating-point precision'],
    ['“我本地是好的”', '"works on my machine"'],
    ['生产环境的 console.log', 'console.log in prod'],
    ['半夜的 cron job', 'midnight cron jobs'],
    ['“小改动”', '"a tiny change"'],
    ['没关的 feature flag', 'stale feature flags'],
    ['复制粘贴的配置', 'copy-pasted configs'],
    ['跨年的日期计算', 'dates across New Year'],
    ['隐式类型转换', 'implicit type coercion'],
    ['巨型 PR', 'giant PRs'],
    ['过期的证书', 'expiring certificates'],
    ['磁盘满了', 'full disks'],
    ['线上直接改数据', 'hand-editing prod data'],
];
const ADVICE = [
    ['先写测试，再写代码，最后写周报。', 'Tests first, code second, status report last.'],
    ['遇到 bug 先喝口水，答案常在第二口。', 'Hit a bug? Sip water. The answer comes on the second sip.'],
    ['今天的提交信息请写完整句子。', 'Write commit messages in full sentences today.'],
    ['小步提交，频繁推送（但别 --force）。', 'Commit small, push often (just not --force).'],
    ['把那个 TODO 变成 issue。', 'Turn that TODO into an issue.'],
    ['重启解决一半问题，读日志解决另一半。', 'Restarting fixes half; reading logs fixes the rest.'],
    ['命名困难时，先叫 thing，明天再改。', 'Stuck on a name? Call it thing and rename tomorrow.'],
    ['review 别人代码时多夸一句。', 'Leave one extra compliment in a review.'],
    ['今天适合删代码，越删越顺。', 'A good day to delete code: the more you remove, the smoother it runs.'],
    ['对着小黄鸭把问题讲一遍。', 'Explain the problem to the duck, out loud.'],
    ['先跑通，再跑快。', 'Make it work, then make it fast.'],
    ['别在 main 上直接改。', "Don't edit on main."],
    ['写注释时想象读者是凌晨三点的你。', 'Write comments for yourself at 3 a.m.'],
    ['不确定就加个 feature flag。', 'Unsure? Put it behind a feature flag.'],
    ['准点下班也是一种工程能力。', 'Logging off on time is an engineering skill too.'],
    ['今天的第一个 commit 请从修一个 typo 开始。', 'Start today with a commit that fixes a typo.'],
    ['先读报错的最后一行，再读第一行。', 'Read the last line of the error, then the first.'],
    ['代码写不动时，去倒杯水。', 'When the code stalls, refill your water.'],
    ['每个魔法数字都值得一个名字。', 'Every magic number deserves a name.'],
    ['今天别和编译器争辩，它通常是对的。', "Don't argue with the compiler today; it's usually right."],
    ['给明天的自己留一个清晰的 TODO。', 'Leave tomorrow-you one clear TODO.'],
    ['删掉一个没人用的配置项。', 'Delete one config option nobody uses.'],
    ['把重复三次的代码抽成函数。', 'Third time you copy it, make it a function.'],
    ['问问题时附上复现步骤。', 'When you ask, include the repro steps.'],
    ['今天适合升级一个小依赖，大的改天。', 'Upgrade one small dependency today; the big one can wait.'],
    ['打开一次很久没看的监控面板。', 'Open a dashboard you have not looked at in a while.'],
    ['拒绝一次“顺便改一下”。', 'Say no to one "while you are at it".'],
    ['git status 一下，看看你忘了什么。', 'Run git status. See what you forgot.'],
    ['写完别急着推，先自己 review 一遍。', 'Review your own diff before you push.'],
    ['午饭后的第一个小时，适合写文档。', 'The hour after lunch is for writing docs.'],
];
export function horoscopeFor(date, sign, lang, ctx) {
    const next = rng(`horoscope:${date}:${sign}`);
    const overall = ctx.isDaJi ? 5 : stars(next);
    const coding = stars(next);
    const debug = stars(next);
    const review = stars(next);
    // 生我者吉: the colour belongs to the element that generates today's.
    const lucky = generatorOf(ctx.element);
    const family = COLORS.filter(c => c.element === lucky);
    const color = pick(next, family.length > 0 ? family : COLORS);
    const good = ctx.hours.filter(h => h.luck === 'good');
    const others = SIGNS.map((_, i) => i).filter(i => i !== sign);
    const number = pick(next, NUMBERS);
    return {
        sign,
        overall,
        coding,
        // Mercury retrograde: debugging takes a star.
        debugging: ctx.isRetrograde ? Math.max(1, debug - 1) : debug,
        review,
        color: { name: L(color.name, lang), nickname: L(color.nickname, lang), hex: color.hex, element: color.element, dayElement: ctx.element },
        item: L(pick(next, ITEMS), lang),
        number: { n: number.n, what: L(number.what, lang) },
        tool: pick(next, TOOLS),
        // The lucky hour is one of today's 吉时.
        hour: good.length > 0 ? pick(next, good) : undefined,
        partner: pick(next, others),
        helper: L(pick(next, HELPERS), lang),
        watch: L(pick(next, WATCH), lang),
        advice: L(pick(next, ADVICE), lang),
    };
}
export const starBar = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
