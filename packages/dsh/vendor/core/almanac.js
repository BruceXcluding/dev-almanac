// Built from hooks/almanac.ts by scripts/build-dsh.mjs. Do not edit.
// The daily almanac (黄历), computed offline and deterministically from the
// vendored lunar-javascript, with the traditional 宜/忌 terms mapped to coding.
import { Solar } from './vendor/lunar.js';
import { hash } from './seed.js';
import { flavorOf } from './flavor.js';
const ELEMENTS = ['木', '火', '土', '金', '水'];
/** The element that 生 (generates) the given one: 水生木, 木生火, 火生土, 土生金, 金生水. */
export const generatorOf = (e) => ({ 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' }[e]);
// Each term: [zh activity, en activity]. Terms not listed keep their name.
const DEV = {
    破土: ['新建项目', 'start a new project'],
    动土: ['git init', 'git init'],
    起基: ['搭脚手架', 'scaffold a project'],
    起基动土: ['新建仓库', 'create a new repo'],
    开市: ['发版上线', 'release / go live'],
    挂匾: ['发布公告', 'publish the changelog'],
    立券: ['签 API 契约', 'agree an API contract'],
    立券交易: ['定接口协议', 'sign off an interface'],
    交易: ['对接第三方', 'integrate a vendor API'],
    嫁娶: ['合并分支', 'merge branches'],
    订婚: ['提 PR', 'open a PR'],
    订盟: ['结对编程', 'pair-program'],
    纳采: ['发起 Code Review', 'request a review'],
    问名: ['给变量起名', 'name things'],
    纳婿: ['引入新依赖', 'add a dependency'],
    合帐: ['合并配置', 'merge configs'],
    会亲友: ['开站会', 'hold stand-up'],
    会友: ['技术分享', 'give a tech talk'],
    见贵: ['找架构师聊聊', 'talk to the architect'],
    修造: ['重构', 'refactor'],
    修门: ['修 API 网关', 'fix the gateway'],
    修饰垣墙: ['美化 UI', 'polish the UI'],
    补垣: ['补测试', 'backfill tests'],
    盖屋: ['搭新服务', 'build a new service'],
    造屋: ['搭新模块', 'build a new module'],
    上梁: ['定核心架构', 'set the core architecture'],
    竖柱: ['立基础设施', 'stand up infra'],
    定磉: ['定技术选型', 'pick the stack'],
    作梁: ['写核心模块', 'write the core module'],
    架马: ['搭 CI', 'set up CI'],
    造桥: ['写适配层', 'write an adapter'],
    筑堤: ['加限流', 'add rate limiting'],
    塞穴: ['修安全漏洞', 'patch a vulnerability'],
    断蚁: ['捉 bug', 'squash bugs'],
    平治道涂: ['修 CI 流水线', 'fix the pipeline'],
    开渠: ['打通数据管道', 'wire up a data pipeline'],
    放水: ['放开灰度', 'widen the rollout'],
    作陂放水: ['开 feature flag', 'flip a feature flag'],
    掘井: ['深挖性能', 'dig into performance'],
    开井开池: ['建连接池', 'add a connection pool'],
    开池: ['开缓存', 'add a cache'],
    出行: ['部署', 'deploy'],
    移徙: ['迁移服务器', 'migrate servers'],
    入宅: ['切到新环境', 'move into the new env'],
    分居: ['拆微服务', 'split a service'],
    赴任: ['接手老项目', 'take over legacy code'],
    乘船: ['上云', 'move to the cloud'],
    渡水: ['跨域联调', 'cross-team integration'],
    祭祀: ['写文档', 'write docs'],
    祈福: ['写 README', 'write the README'],
    焚香: ['给仓库点 star', 'star a repo'],
    酬神: ['感谢开源维护者', 'thank a maintainer'],
    谢土: ['写复盘', 'write a postmortem'],
    开光: ['首次部署', 'first deploy'],
    塑绘: ['画架构图', 'draw the architecture'],
    雕刻: ['抠像素', 'pixel-push'],
    纳财: ['做计费功能', 'build billing'],
    求财: ['做付费墙', 'build the paywall'],
    开仓: ['开放 API', 'open up the API'],
    出货财: ['做退款', 'build refunds'],
    置产: ['买域名', 'buy a domain'],
    买车: ['升级电脑', 'upgrade the laptop'],
    解除: ['删死代码', 'delete dead code'],
    扫舍: ['还技术债', 'pay down tech debt'],
    拆卸: ['下线旧服务', 'decommission a service'],
    破屋: ['推倒重写', 'rewrite from scratch'],
    坏垣: ['删旧接口', 'remove an old API'],
    破屋坏垣: ['大重写', 'big rewrite'],
    安床: ['配开发环境', 'set up the environment'],
    安门: ['配权限', 'set up permissions'],
    安香: ['配 dotfiles', 'tune your dotfiles'],
    安机械: ['装依赖', 'install dependencies'],
    安机: ['配构建机', 'set up a build box'],
    安碓磑: ['调编译器', 'tune the compiler'],
    作灶: ['调配置', 'tweak configs'],
    祀灶: ['清理缓存', 'clear the cache'],
    沐浴: ['格式化代码', 'run the formatter'],
    理发: ['修 lint 警告', 'fix lint warnings'],
    剃头: ['删注释掉的代码', 'drop commented-out code'],
    整手足甲: ['整理 import', 'tidy imports'],
    裁衣: ['裁剪依赖', 'trim dependencies'],
    经络: ['布线写中间件', 'write middleware'],
    酝酿: ['写技术方案', 'draft a design doc'],
    习艺: ['学新语言', 'learn a new language'],
    入学: ['读源码', 'read the source'],
    栽种: ['写单元测试', 'plant unit tests'],
    牧养: ['照看线上服务', 'babysit prod'],
    纳畜: ['收 issue', 'triage issues'],
    捕捉: ['抓 bug', 'catch bugs'],
    畋猎: ['排查线上问题', 'hunt a prod issue'],
    取渔: ['抓日志', 'fish through logs'],
    结网: ['配网络', 'configure the network'],
    求医: ['请人帮忙看 bug', 'ask for help'],
    治病: ['修线上故障', 'fix an outage'],
    求医疗病: ['找 senior 结对排障', 'debug with a senior'],
    针灸: ['精准打补丁', 'surgical hotfix'],
    探病: ['看监控', 'check the dashboards'],
    词讼: ['争论 tab 还是空格', 'argue tabs vs spaces'],
    雇佣: ['招人', 'hire'],
    进人口: ['新人入职', 'onboard a teammate'],
    归宁: ['回去看老项目', 'revisit an old project'],
    冠笄: ['发 1.0', 'ship 1.0'],
    成服: ['定代码规范', 'set a style guide'],
    除服: ['移除弃用标记', 'drop deprecations'],
    安葬: ['归档仓库', 'archive a repo'],
    立碑: ['写变更日志', 'write the changelog'],
    修坟: ['维护老代码', 'maintain legacy code'],
    行丧: ['回滚', 'roll back'],
    入殓: ['封版', 'code freeze'],
    移柩: ['迁移遗留系统', 'move a legacy system'],
    启钻: ['考古 git blame', 'git blame archaeology'],
    开生坟: ['标记 deprecated', 'mark deprecated'],
    合寿木: ['写降级方案', 'write a fallback'],
    求嗣: ['fork 新项目', 'fork a project'],
    出火: ['清掉旧进程', 'kill stale processes'],
    造仓: ['建数据库', 'create a database'],
    造仓库: ['建数据仓库', 'build a data warehouse'],
    造船: ['造轮子', 'reinvent the wheel'],
    造车器: ['写 CLI 工具', 'write a CLI'],
    鼓铸: ['打包镜像', 'build images'],
    作染: ['改主题色', 'change the theme'],
    伐木: ['剪枝', 'prune branches'],
    伐木做梁: ['抽公共库', 'extract a shared lib'],
    开厕: ['开日志通道', 'open a log sink'],
    作厕: ['加日志', 'add logging'],
    开柱眼: ['开调试端口', 'open a debug port'],
    穿屏扇架: ['搭前端框架', 'set up the frontend'],
    盖屋合脊: ['收尾上线', 'wrap up and ship'],
    合脊: ['收尾', 'wrap things up'],
    造庙: ['搭内部平台', 'build an internal platform'],
    斋醮: ['静心读日志', 'meditate on the logs'],
    齐醮: ['全员 review', 'all-hands review'],
    普渡: ['帮新人排障', 'help a newcomer'],
    教牛马: ['写教程', 'write a tutorial'],
    割蜜: ['收割 star', 'collect stars'],
    造畜稠: ['建测试集群', 'build a test cluster'],
    挽面: ['清理 UI', 'clean up the UI'],
    开容: ['改 UI', 'redesign the UI'],
    归岫: ['早点下班', 'log off early'],
    诸事不宜: ['摸鱼', 'take it easy'],
    馀事勿取: ['别的别碰', 'leave the rest alone'],
};
// 忌 reads differently for a few terms: the warning, not the activity.
const DEV_JI = {
    动土: ['改数据库表结构', 'change the DB schema'],
    破土: ['新开坑', 'start yet another project'],
    开市: ['周五上线', 'release on Friday'],
    嫁娶: ['合并大分支', 'merge a long-lived branch'],
    出行: ['部署生产', 'deploy to prod'],
    移徙: ['迁移数据库', 'migrate the database'],
    修造: ['大重构', 'big refactors'],
    安葬: ['删仓库', 'delete repos'],
    拆卸: ['rm -rf', 'rm -rf'],
    行丧: ['强推 main', 'force-push main'],
};
const GROUPS = {
    newProject: { yi: ['新建项目 · git init', 'new project & git init'], ji: ['改表结构 · 新开坑', 'schema changes & new projects'] },
    release: { yi: ['发版上线', 'release & go live'], ji: ['周五上线', 'Friday releases'] },
    merge: { yi: ['合并分支 · 提 PR', 'merge & open PRs'], ji: ['合并大分支', 'merging long-lived branches'] },
    docs: { yi: ['写文档 · README', 'docs & README'] },
    deploy: { yi: ['部署 · 迁移', 'deploy & migrate'], ji: ['部署生产 · 迁库', 'prod deploys & DB migrations'] },
    build: { yi: ['重构 · 搭架构', 'refactor & build'], ji: ['大重构', 'big refactors'] },
    cleanup: { yi: ['删死代码 · 还技术债', 'delete dead code & pay debt'], ji: ['rm -rf · 下线服务', 'rm -rf & decommissions'] },
    archive: { yi: ['归档 · 封版', 'archive & freeze'], ji: ['删仓库 · 强推', 'deleting repos & force-pushing'] },
    billing: { yi: ['计费 · 付费功能', 'billing & payments'] },
    fix: { yi: ['修 bug · 排障', 'fix & debug'] },
    hunt: { yi: ['抓 bug', 'hunt bugs'] },
    env: { yi: ['配开发环境', 'set up the env'] },
    learn: { yi: ['读源码 · 学新东西', 'read source & learn'] },
    meet: { yi: ['开会 · 技术分享', 'meet & share'] },
    tidy: { yi: ['格式化 · 修 lint', 'format & lint'] },
    tools: { yi: ['造轮子 · 写工具', 'build tools'] },
};
const GROUP_OF = {
    破土: 'newProject', 动土: 'newProject', 起基: 'newProject', 起基动土: 'newProject',
    开市: 'release', 冠笄: 'release', 盖屋合脊: 'release', 合脊: 'release', 挂匾: 'release',
    嫁娶: 'merge', 订婚: 'merge', 合帐: 'merge',
    祭祀: 'docs', 祈福: 'docs', 立碑: 'docs', 谢土: 'docs',
    出行: 'deploy', 移徙: 'deploy', 入宅: 'deploy', 乘船: 'deploy', 开光: 'deploy',
    修造: 'build', 盖屋: 'build', 造屋: 'build', 上梁: 'build', 竖柱: 'build', 作梁: 'build',
    解除: 'cleanup', 扫舍: 'cleanup', 拆卸: 'cleanup', 坏垣: 'cleanup', 破屋: 'cleanup', 破屋坏垣: 'cleanup', 剃头: 'cleanup', 出火: 'cleanup', 伐木: 'cleanup',
    安葬: 'archive', 行丧: 'archive', 入殓: 'archive', 移柩: 'archive', 修坟: 'archive', 启钻: 'archive', 开生坟: 'archive', 合寿木: 'archive', 成服: 'archive', 除服: 'archive',
    纳财: 'billing', 求财: 'billing', 开仓: 'billing', 出货财: 'billing',
    求医: 'fix', 治病: 'fix', 求医疗病: 'fix', 针灸: 'fix', 探病: 'fix',
    捕捉: 'hunt', 畋猎: 'hunt', 取渔: 'hunt', 断蚁: 'hunt',
    安床: 'env', 安机械: 'env', 安机: 'env', 作灶: 'env', 安香: 'env', 安碓磑: 'env',
    入学: 'learn', 习艺: 'learn',
    会亲友: 'meet', 会友: 'meet', 见贵: 'meet',
    沐浴: 'tidy', 理发: 'tidy', 整手足甲: 'tidy',
    造船: 'tools', 造车器: 'tools', 鼓铸: 'tools',
};
const toDev = (term, lang, table) => {
    const hit = table[term] ?? DEV[term];
    return { term, terms: [term], dev: hit ? hit[lang === 'zh' ? 0 : 1] : term };
};
/**
 * Activities in the almanac's order, filler terms (馀事勿取) dropped when
 * others exist, synonyms of one group merged into the line of its first.
 */
export function mapActivities(terms, lang, isJi) {
    const k = lang === 'zh' ? 0 : 1;
    const real = terms.filter(t => t !== '馀事勿取' && t !== '无');
    const list = real.length > 0 ? real : [...terms];
    const out = [];
    const byGroup = new Map();
    for (const term of list) {
        const group = GROUP_OF[term];
        const one = toDev(term, lang, isJi ? DEV_JI : DEV);
        if (!group) {
            out.push(one);
            continue;
        }
        const line = byGroup.get(group);
        if (!line) {
            byGroup.set(group, one);
            out.push(one);
            continue;
        }
        line.terms.push(term);
        line.term = line.terms.slice(0, 2).join('·');
        const words = GROUPS[group];
        line.dev = (isJi ? words?.ji ?? words?.yi : words?.yi)?.[k] ?? line.dev;
    }
    return out;
}
export const ymdKey = ({ y, m, d }) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export function localYmd(ms) {
    const t = new Date(ms);
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
}
const addDays = ({ y, m, d }, n) => {
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
const lunarOf = (day) => Solar.fromYmd(day.y, day.m, day.d).getLunar();
const isGoodDay = (l) => l.getDayTianShenLuck() === '吉';
/** The 大吉 day of the lunar month `day` falls in: one 黄道 day, chosen by hash. */
export function daJiOfMonth(day) {
    const l = lunarOf(day);
    const first = addDays(day, 1 - l.getDay());
    const days = [];
    for (let i = 0; i < 31; i++) {
        const one = addDays(first, i);
        const lo = lunarOf(one);
        if (i > 0 && lo.getDay() === 1)
            break;
        days.push({ key: ymdKey(one), isGood: isGoodDay(lo) });
    }
    const good = days.filter(x => x.isGood);
    const pool = good.length > 0 ? good : days;
    const monthTag = `${l.getYear()}-${l.getMonth()}`;
    return (pool[hash(`daji:${monthTag}`) % pool.length] ?? days[0])?.key ?? '';
}
const naYinOf = (name) => {
    const element = ELEMENTS.find(e => name.endsWith(e)) ?? '土';
    return { name, element };
};
export function almanacFor(day, lang) {
    const l = lunarOf(day);
    const term = l.getJieQi();
    return {
        date: ymdKey(day),
        lunar: `${l.getMonthInChinese()}月${l.getDayInChinese()}`,
        lunarMD: { m: l.getMonth(), d: l.getDay() },
        lunarYear: l.getYearInChinese(),
        ganzhi: { year: l.getYearInGanZhi(), month: l.getMonthInGanZhi(), day: l.getDayInGanZhi() },
        yearAnimal: l.getYearShengXiao(),
        yi: mapActivities(l.getDayYi(), lang, false),
        ji: mapActivities(l.getDayJi(), lang, true),
        naYin: naYinOf(l.getDayNaYin()),
        chong: { animal: l.getDayChongShengXiao(), desc: l.getDayChongDesc() },
        sha: l.getDaySha(),
        solarTerm: term ? { name: term, isToday: true } : { name: l.getPrevJieQi().getName(), isToday: false },
        dayGod: { name: l.getDayTianShen(), luck: isGoodDay(l) ? 'good' : 'bad' },
        zhiXing: l.getZhiXing(),
        // getTimes() lists 13 periods (早子 and 晚子); keep the first twelve.
        hours: l
            .getTimes()
            .slice(0, 12)
            .map(t => ({
            zhi: t.getZhi(),
            range: `${t.getMinHm()}-${t.getMaxHm()}`,
            luck: t.getTianShenLuck() === '吉' ? 'good' : 'bad',
        })),
        isDaJi: daJiOfMonth(day) === ymdKey(day),
        flavor: flavorOf({
            solar: day,
            weekday: new Date(Date.UTC(day.y, day.m - 1, day.d)).getUTCDay(),
            lunarMonth: l.getMonth(),
            lunarDay: l.getDay(),
            isNewYearsEve: lunarOf(addDays(day, 1)).getMonth() === 1 && lunarOf(addDays(day, 1)).getDay() === 1,
            termToday: term || undefined,
        }, lang),
    };
}
/** The Chinese zodiac animal of a birth date, by the lunar year it falls in. */
export const zodiacOf = (birth) => lunarOf(birth).getYearShengXiao();
export const ANIMALS_EN = {
    鼠: 'Rat', 牛: 'Ox', 虎: 'Tiger', 兔: 'Rabbit', 龙: 'Dragon', 蛇: 'Snake',
    马: 'Horse', 羊: 'Goat', 猴: 'Monkey', 鸡: 'Rooster', 狗: 'Dog', 猪: 'Pig',
};
export const DIRECTIONS_EN = { 东: 'east', 南: 'south', 西: 'west', 北: 'north' };
