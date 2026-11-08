// Built from hooks/fortune.ts by scripts/build-dsh.mjs. Do not edit.
// /求签: one of 100 fortune slips, the same one all day.
import { hash } from './seed.js';
// 100 slips in seven grades, best first.
export const LEVELS = [
    {
        name: ['上上签', 'Supreme'],
        count: 8,
        reading: ['大吉大利，今日写的代码一次过 CI。', 'Fortune smiles: today your code passes CI on the first try.'],
        outcomes: [
            ['一次提交过 CI，评审全员点赞来。', 'One commit, green CI; every reviewer approves.'],
            ['线上零告警，周报写得像诗篇。', 'Zero alerts in prod; your report reads like poetry.'],
            ['老板看了说好，产品看了不改。', 'The boss says great; the PM changes nothing.'],
            ['技术债一夜清零，README 自己更新。', 'Tech debt cleared overnight; the README updates itself.'],
        ],
    },
    {
        name: ['上签', 'Great'],
        count: 17,
        reading: ['顺风顺水，适合推进难啃的需求。', 'Fair winds: push the hard ticket forward.'],
        outcomes: [
            ['难题自有文档解，bug 未至先被拦。', 'The docs hold the answer; bugs are caught before they land.'],
            ['重构一处通全局，测试覆盖步步高。', 'One refactor untangles all; coverage climbs.'],
            ['需求一次说清楚，接口一次就对齐。', 'Requirements clear the first time; the API lines up at once.'],
            ['git bisect 三步到，元凶当场就落网。', 'git bisect, three steps: the culprit is caught.'],
        ],
    },
    {
        name: ['中上签', 'Good'],
        count: 20,
        reading: ['小有波折，耐心调试终有所得。', 'A few bumps; patient debugging pays off.'],
        outcomes: [
            ['一个 typo 寻半日，找到之后笑开颜。', 'Half a day for one typo; you laugh when you find it.'],
            ['依赖升级虽有坑，回滚之后路更宽。', 'The upgrade has pitfalls, but a rollback clears the way.'],
            ['CI 红了两三回，第四回终于转绿。', 'CI goes red twice, maybe thrice; the fourth run is green.'],
            ['会议虽长有收获，散会还能写两行。', 'A long meeting, but useful; two lines of code after.'],
        ],
    },
    {
        name: ['中签', 'Fair'],
        count: 25,
        reading: ['平平稳稳，按部就班就好。', 'Steady as she goes: stick to the plan.'],
        outcomes: [
            ['不求速成求稳妥，日志读完心自宽。', 'Not fast, but sure; read the logs and relax.'],
            ['需求改了三四遍，代码依旧能编译。', 'Requirements changed four times; it still compiles.'],
            ['今天不出大问题，也别指望出奇迹。', 'No disasters today; no miracles either.'],
            ['咖啡续到第三杯，bug 修到第三个。', 'Third coffee, third bug fixed.'],
        ],
    },
    {
        name: ['中下签', 'Mixed'],
        count: 15,
        reading: ['慎之又慎，提交前多看一眼 diff。', 'Tread carefully: read the diff once more before committing.'],
        outcomes: [
            ['本地能跑线上挂，环境差异要细查。', 'Runs locally, dies in prod: check the environment.'],
            ['合并冲突层层叠，先拉后推莫心急。', 'Conflicts pile up: pull before you push, no rush.'],
            ['时区一差八小时，定时任务半夜跑。', 'Eight hours off in time zones; the cron job runs at midnight.'],
            ['缓存未清看旧图，刷新三遍才相信。', 'A stale cache shows the old page; you refresh three times to believe it.'],
        ],
    },
    {
        name: ['下签', 'Poor'],
        count: 10,
        reading: ['宜守不宜攻，今天少碰生产环境。', 'Defend, don’t attack: stay away from prod today.'],
        outcomes: [
            ['缓存失效连环出，莫在今日动根基。', 'Caches fail in chains; don’t touch the foundations today.'],
            ['正则一行藏百错，不如明日再提交。', 'A one-line regex hides a hundred bugs; commit tomorrow.'],
            ['磁盘将满日志涨，先清空间再说话。', 'The disk fills with logs; free space before anything else.'],
            ['证书今夜悄过期，明早告警响一片。', 'A certificate expires tonight; tomorrow, alarms everywhere.'],
        ],
    },
    {
        name: ['下下签', 'Dire'],
        count: 5,
        reading: ['诸事谨慎，备份先行；签只是签，代码还得靠你。', 'Back up everything. A slip is only a slip; the code is still yours.'],
        outcomes: [
            ['force push 一声响，同事周末来加班。', 'One force push, and your teammates work the weekend.'],
            ['DROP TABLE 手一抖，备份恢复到天明。', 'DROP TABLE, a shaky hand; restoring backups till dawn.'],
            ['rm -rf 路径错，从此学会写 dry-run。', 'rm -rf, wrong path; from now on you write --dry-run.'],
        ],
    },
];
// The scene each slip opens with; paired with an outcome of its grade.
const SCENES = [
    ['深夜终端光微亮，', 'The terminal glows late at night;'],
    ['咖啡半杯键声忙，', 'Half a coffee, keys clatter on;'],
    ['分支如林路纵横，', 'Branches spread like a forest of paths;'],
    ['日志千行藏一字，', 'A thousand log lines hide one word;'],
    ['小黄鸭前三问答，', 'Three questions to the rubber duck;'],
    ['屏前月色照 PR，', 'Moonlight falls across the PR;'],
    ['编译声声如春雷，', 'The compiler rumbles like spring thunder;'],
    ['栈帧层层如登塔，', 'Stack frames rise like a pagoda;'],
    ['需求如雨落纷纷，', 'Requirements fall like rain;'],
    ['老代码里寻注释，', 'Searching old code for a comment;'],
    ['一行改动千行测，', 'One line changed, a thousand tests run;'],
    ['晨会三句定方向，', 'Three lines at stand-up set the course;'],
    ['云端集群如星河，', 'The cluster spreads like the Milky Way;'],
    ['键盘轻敲似流水，', 'Keys flow like running water;'],
    ['git log 里看往事，', 'Reading the past in git log;'],
    ['周五傍晚想上线，', 'Friday evening, tempted to ship;'],
    ['橡皮鸭默默点头，', 'The rubber duck nods in silence;'],
    ['依赖树上挂果实，', 'Fruit hangs on the dependency tree;'],
    ['正则如咒难解读，', 'A regex reads like a spell;'],
    ['屏幕右下弹通知，', 'A notification pops in the corner;'],
    ['会议室里白板满，', 'The meeting-room whiteboard is full;'],
    ['凌晨三点告警响，', 'An alert rings at 3 a.m.;'],
    ['新人提问声声细，', 'The new hire asks, softly;'],
    ['终端里敲 sudo，', 'You type sudo in the terminal;'],
    ['分号缺了一小个，', 'One little semicolon is missing;'],
];
export function slipOf(number, lang) {
    const k = lang === 'zh' ? 0 : 1;
    let start = 1;
    for (let rank = 0; rank < LEVELS.length; rank++) {
        const level = LEVELS[rank];
        if (number < start + level.count) {
            const i = number - start;
            // 7 and the 25 scenes share no factor, so a grade's slips (at most 25)
            // each open with a different scene: no two slips are the same.
            const scene = SCENES[(i * 7 + rank * 3) % SCENES.length];
            const outcome = level.outcomes[i % level.outcomes.length];
            return { number, level: level.name[k], poem: [scene[k], outcome[k]], reading: level.reading[k], rank };
        }
        start += level.count;
    }
    throw new Error(`no slip ${number}`);
}
/** Slips are numbered 1..100; who draws (the birthday, or 'anyone') changes the draw. */
export const slipNumberFor = (date, who) => 1 + (hash(`slip:${date}:${who}`) % 100);
export const TOTAL_SLIPS = LEVELS.reduce((n, l) => n + l.count, 0);
