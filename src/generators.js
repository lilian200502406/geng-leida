/**
 * MemeRadar · 搞笑创意生成器（纯前端，无需联网 / 无需密钥）
 * ------------------------------------------------------------
 * 六种生成器：
 *  1. 段子剧本       —— 三幕 + 反转，输出可直接拍的短剧脚本
 *  2. 一句话梗       —— 铺垫 + 抖包袱
 *  3. 谐音 & 双关     —— 中文特有语言梗
 *  4. 短视频分镜      —— 带时间轴、画面、台词、字幕的完整分镜表
 *  5. 反差设定       —— 高概念创意种子（设定越荒谬越好）
 *  6. 梗改编          —— 把今日热梗套进经典结构
 *
 * 所有素材本地内置，用「槽点 + 场景 + 语气」的错位组合保证组合空间足够大。
 */

export const DICTIONARY = {
  // 主角身份
  roles: [
    '一位坚信自己很会带娃的父亲',
    '刚转正三天的实习生',
    '刚退休但不肯认输的中学语文老师',
    '每天直播八小时的美食博主',
    '自称“人形自走导航”的网约车司机',
    '在农村搞 AI 创业的返乡青年',
    '情绪稳定得反常的客服',
    '被算法支配的外卖骑手',
    '拍短视频拍了五年没火的小镇青年',
    '把猫当儿子的独居女孩',
    '相亲三十次全失败但从不反思的男生',
    '在写字楼里偷偷养了一盆绿萝的程序员',
    '家里有个永远抢不到遥控器的中年人',
    '退休后开始管全小区的业委会主任',
    '自学三个月就成为“老中医”的健身教练',
  ],

  // 荒诞处境
  situations: [
    '去小区门口摆摊，卖「帮人吵架」服务',
    '意外获得「能听见别人心里吐槽」的能力',
    '被算法推荐成了隔壁小区的「风水大师」',
    '接下了一个要求「必须不专业」的活儿',
    '被邀请去参加一场没人说真话的婚礼',
    '误入一个只讲黑话的行业群',
    '被迫给自己的猫写一份工作周报',
    '意外混进一场全员都在演的领导视察',
    '被安排做一场「必须失败」的直播带货',
    '报名参加了一档「谁最正常」的比赛',
    '被邻居投诉「笑声扰民」，从此只能憋笑生活',
    '突然被任命为一个不存在的部门的负责人',
    '用三天时间准备一场准备了三十年的演讲',
    '在一个所有人都在假装不熟的饭局上撑足全场',
    '被拉进一个全是前任的家庭群',
  ],

  // 具体槽点
  hooks: [
    '他把每句话都加了“格局”两个字',
    '对方全程只用表情包回复',
    '所有人都在等一个根本不存在的电梯',
    '他掏出的是老家的方言版说明书',
    '领导把 PPT 念成了散文朗诵',
    '她的手机屏保是自己的简历',
    '那位大爷把二维码贴在了自己的帽子上',
    '他把“随便”理解成了“必须按我的来”',
    '全场唯一清醒的是那只狗',
    '她带了三个保温杯，里面装着同一款茶',
    '这位同学在简历上写“精通摆烂”',
    '他把会议室的白板当成了微博评论区',
    '店里的招牌写着“今天不营业，明天看心情”',
    '群里的最后一条消息是“大家不用回了”，然后回了三百条',
    '所有人都穿了一样的格子衫',
  ],

  // 转折 / 反转
  twists: [
    '结果对方比他更不专业，还拿了奖',
    '最后发现从头到尾都是他一个人在自言自语',
    '真相是他自己才是那个被观察的样本',
    '反转在于——这件事居然被写进了优秀案例',
    '原来全场的演员都是他请来的，除了他自己',
    '最后他成功了，但原因是完全相反的那个理由',
    '方案的唯一价值是让所有人意识到原方案有多好',
    '他输了比赛，却因为“过程特别真实”被请去做评委',
    '所有人都感动落泪，只有他知道这是个误会',
    '最后得出一个结论：还是别折腾了',
    '结局是他把这件事做成了新的生意',
    '其实没人关心结果，大家只是在等散场',
    '全场只有他妈认真听了，并且当众复述了一遍',
    '他发现真正的对手是自己上个礼拜的承诺',
    '最后字幕打出：“本故事纯属真实，请勿模仿”',
  ],

  // 场景
  scenes: [
    '凌晨三点的家庭群',
    '公司年会的后台休息室',
    '小区门口的快递柜前',
    '三线城市的相亲茶楼',
    '一间常年空调坏掉的办公室',
    '高铁上的二等座',
    '深夜的便利店',
    '村里的集市',
    '一场同学聚会',
    '线上会议的等待室',
    '早高峰的地铁',
    '网红打卡店的排队队伍',
    '一间刚装修完的出租屋',
    '直播间',
    '医院走廊',
    '县城最好的那家理发店',
  ],

  // 语气/风格
  tones: [
    '一本正经地胡说八道',
    '全程用新闻联播的语气',
    '用教科书的口吻',
    '像在念产品说明书',
    '冷面瘫脸，一句一个包袱',
    '假装很急，其实完全没事',
    '夸张到失控的边缘',
    '极度克制，越克制越好笑',
    '用长辈口吻训人',
    '像在给甲方汇报',
  ],

  // 反转类型
  reversals: [
    '身份反转',
    '动机反转',
    '时间线反转',
    '视角反转（换人讲同一个故事）',
    '身份补一刀（最后一句揭底）',
    '一句话撤回（正在感动时突然破功）',
  ],

  // 谐音素材
  homophones: [
    { word: '内卷', sound: '内圈', joke: '健身房最新课程：内圈，跟着一起卷，谁先停下谁请客' },
    { word: '摸鱼', sound: '摩鱼', joke: '摸鱼摸久了，我把鱼摸出了包浆' },
    { word: '社死', sound: '射死', joke: '社死现场：我以为没人看见，结果全场都在直播' },
    { word: '躺平', sound: '躺瓶', joke: '躺平的最高境界是像一瓶矿泉水，横着还立得住' },
    { word: '破防', sound: '破房', joke: '防破了我可以补，房破了我只能哭' },
    { word: '上岸', sound: '上谙', joke: '别人上岸是靠努力，我上岸是因为船沉了' },
    { word: '自律', sound: '自绿', joke: '自律使人自由，自绿使人自闭' },
    { word: '尴尬', sound: '赶尬', joke: '为了赶走尴尬，我决定先下手为强，先尬为敬' },
    { word: '人设', sound: '人涉', joke: '人设崩塌的本质是——人设从来没立住过' },
    { word: '补充', sound: '不充', joke: '视频补充说明：不用充值，因为看了会想退钱' },
    { word: '目标', sound: '木标', joke: '今年目标：先立个木标，能倒就倒，不能倒就当景观' },
    { word: '带娃', sound: '戴娃', joke: '带娃带了三年，我已经学会把孩子当成配饰' },
    { word: '加班', sound: '假班', joke: '研究表明，晚上八点后的加班属于“假班”，因为人已经不在了' },
    { word: '理财', sound: '离财', joke: '我这不是理财，是离财，离开那些钱' },
    { word: '面试', sound: '面世', joke: '面试失败了，但我的黑眼圈终于面世了' },
    { word: '开会', sound: '开烩', joke: '一场会开下来，大家把话都炖成了一锅烩' },
  ],

  // 短剧结构模板
  structures: [
    { name: '三幕反转', beats: ['建立日常', '异常闯进来', '用力过猛', '反转打脸'] },
    { name: '误会流', beats: ['误会成立', '各方自洽', '误会升级', '真相大白但没人认'] },
    { name: '对比流', beats: ['理想版本', '现实版本', '加倍现实', '一句话收尾'] },
    { name: '递进失控', beats: ['小问题', '处理不当', '连锁灾难', '摆烂式解决'] },
    { name: '身份揭底', beats: ['路人视角', '细节露出马脚', '全场错愕', '揭底一句话'] },
  ],

  // 短视频钩子（前 3 秒）
  openers: [
    '如果你也在凌晨三点改过这个文件，请举手。',
    '这件事我本来不打算说的。',
    '我先说结论：不是我的问题。',
    '我以为这辈子不会遇到的。',
    '全场只有我一个人觉得不对吗？',
    '这条视频可能会被删，但我还是要说。',
    '别划走，最后三秒有反转。',
    '我用了三十年才明白这个道理。',
    '说个真事，你别笑。',
    '我朋友让我别说，但我忍不住。',
  ],

  // 结尾金句
  closers: [
    '后来我把这件事写进了简历，成了我唯一的工作经验。',
    '所以现在我明白了：专业的事，还是交给不专业的人吧。',
    '我不后悔，我只是不想再提。',
    '这世界最不缺的就是解释，缺的是有人愿意听。',
    '该配合演出的我，最后还是没演好。',
    '生活给了我一巴掌，我回了它一个笑。',
    '我唯一学会的是：下次提前问清楚。',
    '故事的结尾是——我先走了，你们慢慢聊。',
    '如果非要总结一句：别学我。',
    '再后来，我们都学会了假装没发生过。',
  ],
};

/* ------------------------------------------------------------------ */
/* 工具                                                                */
/* ------------------------------------------------------------------ */

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

const pickN = (arr, n) => {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
};

/** 从采集到的真实热梗里取标题作为「料」 */
function pickLive(ctx, n = 1) {
  const pool = (ctx.items || []).filter((i) => i.kind === 'video' || i.kind === 'text');
  if (!pool.length) return [];
  return pickN(pool.map((i) => i.title), n);
}

/* ------------------------------------------------------------------ */
/* 生成器                                                              */
/* ------------------------------------------------------------------ */

/** 1. 段子剧本 —— 完整短剧脚本 */
export function genScript(ctx = {}) {
  const role = rnd(DICTIONARY.roles);
  const scene = rnd(DICTIONARY.scenes);
  const hook = rnd(DICTIONARY.hooks);
  const situation = rnd(DICTIONARY.situations);
  const twist = rnd(DICTIONARY.twists);
  const tone = rnd(DICTIONARY.tones);
  const closer = rnd(DICTIONARY.closers);
  const st = rnd(DICTIONARY.structures);

  const live = pickLive(ctx, 1)[0];

  const title = `${role.replace(/^一[位个名]/, '')}，在${scene}${rnd([
    '决定搞一件大事',
    '做了个大胆的决定',
    '非要证明自己',
    '准备让所有人刮目相看',
  ])}`;

  const body = `【场景】${scene}
【人物】${role}（下称 A）
【基调】${tone}

第一幕 · 铺垫
A ${situation}。
关键在于：${hook}。
A 对此的解释是：“这叫差异化竞争。”

第二幕 · 升级
A 越做越认真，甚至准备了一份完整的方案。
围观的人没有一个懂，但所有人都点头。
有人小声说了句“有点意思”，A 当场把它理解成了“非常认可”。

第三幕 · 反转
${twist}。
A 愣了三秒，然后说：“这在我的计划之内。”
${closer}

【可拍摄要点】
· 全程 ${tone}
· 关键道具只需要一件，越日常越好
· 反转必须在前 15 秒埋下伏笔${
    live ? `\n\n【可用热点作嫁接】「${live}」——把上述结构套到这个热梗上，更容易起量。` : ''
  }`;

  return {
    type: 'script',
    label: '段子剧本',
    title,
    body,
    meta: { 结构: st.name, 反转类型: rnd(DICTIONARY.reversals), 建议时长: '45–60 秒' },
  };
}

/** 2. 一句话梗 */
export function genOneLiner() {
  const a = rnd(DICTIONARY.roles);
  const h = rnd(DICTIONARY.hooks);
  const t = rnd(DICTIONARY.twists);

  const templates = [
    `${a}最大的问题不是${h.replace(/^他|^她/, '他')}，是他真的以为这叫本事。`,
    `别人是“能力配不上野心”，我不一样，我是“野心配不上我的沙发”。`,
    `我妈说我做事没有规划，我说这叫给生活留白。她说那你留的是空白。`,
    `我问了三位专家，两位不说话，一位说“你说得对”。`,
    `${h.replace(/^他|^她/, '他')}——这件事本身没错，错的是他当着所有人的面做。`,
    `我不是不会说话，我是话到嘴边的时候发现没必要。`,
    `后来我才知道，${t.replace(/^最后|^结果/, '原来')}。`,
    `我一直以为我在等一个机会，其实机会一直在等我先闭嘴。`,
    `他们把这件事做成了优秀案例，我把这件事做成了心病。`,
    `不是我玻璃心，是这届生活太会挑地方扎。`,
  ];
  return {
    type: 'oneliner',
    label: '一句话梗',
    title: rnd(templates),
    body: '',
    meta: { 用法: '评论区 / 标题 / 口播开头' },
  };
}

/** 3. 谐音双关 */
export function genPun() {
  const p = rnd(DICTIONARY.homophones);
  const scene = rnd(DICTIONARY.scenes);
  const wrap = [
    `${scene}，有人问：${p.word}是什么？我说：${p.joke}`,
    `「${p.word}」的正确写法是「${p.sound}」——${p.joke}`,
    `今日词汇：${p.word}（读音同「${p.sound}」）。例句：${p.joke}`,
  ];
  return {
    type: 'pun',
    label: '谐音梗',
    title: `${p.word} → ${p.sound}`,
    body: rnd(wrap),
    meta: { 原词: p.word, 谐音: p.sound },
  };
}

/** 4. 短视频分镜表 */
export function genStoryboard(ctx = {}) {
  const scene = rnd(DICTIONARY.scenes);
  const role = rnd(DICTIONARY.roles);
  const hook = rnd(DICTIONARY.hooks);
  const twist = rnd(DICTIONARY.twists);
  const opener = rnd(DICTIONARY.openers);
  const closer = rnd(DICTIONARY.closers);
  const live = pickLive(ctx, 1)[0];

  const rows = [
    {
      t: '0–3s',
      shot: '特写 · 人物正脸',
      line: opener,
      sub: '钩子：先抛结论',
    },
    {
      t: '3–8s',
      shot: '中景 · 环境交代',
      line: `${scene}。${role}今天要做一件不太寻常的事。`,
      sub: '建立场景',
    },
    {
      t: '8–16s',
      shot: '近景 · 细节特写',
      line: hook,
      sub: '埋钩子，观众开始疑惑',
    },
    {
      t: '16–26s',
      shot: '跟拍 · 动作升级',
      line: '事情开始朝着所有人都没想到的方向发展。',
      sub: '节奏加快，加入拟音',
    },
    {
      t: '26–36s',
      shot: '正反打 · 双人对话',
      line: '“你是不是搞错了？”  “没有，我很确定。”',
      sub: '对话推动，制造悬念',
    },
    {
      t: '36–44s',
      shot: '大特写 · 表情',
      line: twist,
      sub: '反转点，必须卡在黄金位',
    },
    {
      t: '44–50s',
      shot: '全景 · 拉远',
      line: closer,
      sub: '收尾金句，留余味',
    },
  ];

  const body = rows
    .map((r) => `${r.t.padEnd(8)}| ${r.shot} | 台词：${r.line}\n         字幕：${r.sub}`)
    .join('\n');

  return {
    type: 'storyboard',
    label: '短视频分镜',
    title: `${scene} · 50 秒反转短剧分镜`,
    body,
    meta: { 时长: '50 秒', 机位: '3 个', 难度: '低' },
    hint: live ? `可嫁接今日热梗：「${live}」` : '',
  };
}

/** 5. 反差设定（高概念创意种子） */
export function genPremise() {
  const role = rnd(DICTIONARY.roles);
  const situation = rnd(DICTIONARY.situations);
  const twist = rnd(DICTIONARY.twists);
  const tone = rnd(DICTIONARY.tones);

  const titles = [
    `${role.replace(/^一[位个名]/, '')}的年度述职报告`,
    `我在${rnd(DICTIONARY.scenes)}搞了场改革`,
    `${situation.slice(0, 14)}的那些天`,
    `一家人整整齐齐地${rnd(['不说话', '假装很忙', '演了一出戏'])}`,
    `当${role.replace(/^一[位个名]/, '')}遇上${rnd(['KPI', '家长会', '年度考核', '相亲角'])}`,
  ];

  return {
    type: 'premise',
    label: '反差设定',
    title: rnd(titles),
    body: `一句话故事：${role}${situation}，全程${tone}。
看点：${twist}。
为什么好笑：身份与处境严重错配，当事人越认真，观众越好笑。
可延展：系列化，每集换一个场景，主角不变。`,
    meta: { 类型: '高概念', 适合: '系列短剧 / 连载' },
  };
}

/** 6. 热梗改编 */
export function genRemix(ctx = {}) {
  const lives = pickLive(ctx, 3);
  const structure = rnd(DICTIONARY.structures);
  if (!lives.length) return genOneLiner();

  const seed = lives[0];
  const body = `【原梗】${seed}
【改编方向】套用「${structure.name}」结构：${structure.beats.join(' → ')}

① ${structure.beats[0]}：把原梗还原成一个具体的人在做一件具体的事
② ${structure.beats[1]}：加入一个不合时宜的第三人（同事 / 亲戚 / 物业）
③ ${structure.beats[2]}：让主角用力过猛，越解释越糟
④ ${structure.beats[3]}：一句话收尾，把观众刚建立的同情撤回

【改写的三个坑】
· 不要复述原梗，要换场景、换人物、换动机
· 热点只是"引子"，前三秒点一下就走
· 结尾必须比开头更荒谬${
    lives[1] ? `\n\n【可叠加】另可联动：「${lives[1]}」` : ''
  }`;

  return {
    type: 'remix',
    label: '热梗改编',
    title: `把「${seed.slice(0, 18)}」改成短剧`,
    body,
    meta: { 原梗来源: '今日采集库', 结构: structure.name },
  };
}

/** 统一入口 */
export function generate(kind, ctx = {}) {
  switch (kind) {
    case 'script':
      return genScript(ctx);
    case 'oneliner':
      return genOneLiner();
    case 'pun':
      return genPun();
    case 'storyboard':
      return genStoryboard(ctx);
    case 'premise':
      return genPremise();
    case 'remix':
      return genRemix(ctx);
    default:
      return genScript(ctx);
  }
}

export const GENERATORS = [
  { id: 'script', name: '段子剧本', desc: '三幕 + 反转，可直接开拍' },
  { id: 'storyboard', name: '短视频分镜', desc: '带时间轴的完整分镜表' },
  { id: 'remix', name: '热梗改编', desc: '把今日真实热梗改写成短剧' },
  { id: 'premise', name: '反差设定', desc: '高概念创意种子，适合系列化' },
  { id: 'oneliner', name: '一句话梗', desc: '标题 / 评论区 / 口播开头' },
  { id: 'pun', name: '谐音双关', desc: '中文特有的语言梗' },
];
