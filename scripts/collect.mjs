#!/usr/bin/env node
/**
 * MemeRadar 采集器
 * ------------------------------------------------------------
 * 从多个公开平台抓取搞笑内容（热梗 / 视频 / 段子文本），
 * 统一标准化 -> 去重 -> 热度打分 -> 持久化。
 *
 * 设计原则：
 * 1. 只抓「标题 / 摘要 / 公开热度指标」，不抓正文全文与用户隐私。
 * 2. 单源失败不影响整体，失败原因写入 runs 日志。
 * 3. 增量合并：老条目保留，更新热度与最后出现时间。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const RUNS_FILE = path.join(DATA_DIR, 'runs.json');
const SOURCES_FILE = path.join(DATA_DIR, 'sources.json');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TIMEOUT = 15000;
const MAX_ITEMS = 4000;

/* ------------------------------------------------------------------ */
/* 工具函数                                                            */
/* ------------------------------------------------------------------ */

const log = (...a) => console.log(...a);

function todayKey(d = new Date()) {
  // 使用本地时区生成 YYYY-MM-DD
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
}

async function fetchJSON(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout ?? TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    // B站等接口偶尔返回 HTML 风控页，给出更清晰的错误
    const trimmed = text.trim();
    if (trimmed.startsWith('<')) throw new Error('返回 HTML（可能触发风控）');
    return JSON.parse(trimmed);
  } finally {
    clearTimeout(timer);
  }
}

/** 稳定短哈希：同一标题在不同源/不同时间可得到同一 id，便于去重 */
function hashId(str) {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return (h1.toString(36) + h2.toString(36)).slice(0, 12);
}

/** 归一化文本用于相似度比较 */
function normTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '')
    .replace(/[，。！？、；：""''（）【】《》~·…—\-_,.!?;:"'()\[\]<>|/\\]/g, '')
    .replace(/[^\p{Script=Han}a-z0-9]/gu, '')
    .slice(0, 80);
}

/** 二元组 Jaccard 相似度，用于跨平台同梗合并 */
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = (s) => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const A = grams(a);
  const B = grams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / (A.size + B.size - inter);
}

/** 对数缩放，把不同量级的热度拉到可比区间 0~100 */
function scaleHot(value, cap = 1e8) {
  const v = Math.max(0, Number(value) || 0);
  if (!v) return 0;
  return Math.min(100, (Math.log10(v + 1) / Math.log10(cap)) * 100);
}

/* ------------------------------------------------------------------ */
/* 采集适配器                                                          */
/* ------------------------------------------------------------------ */

const adapters = {
  /** 抖音热榜 */
  'douyin-hot': async (cfg) => {
    const d = await fetchJSON('https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/');
    const list = (d.word_list || []).slice(0, 50);
    return list.map((w, i) => ({
      title: w.word,
      url: `https://www.douyin.com/search/${encodeURIComponent(w.word)}`,
      hot: w.hot_value,
      rank: i + 1,
      extra: { label: w.label },
    }));
  },

  /** B站全站热门 */
  'bilibili-popular': async (cfg) => {
    const d = await fetchJSON(
      'https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1',
      { headers: { Referer: 'https://www.bilibili.com/' } }
    );
    const list = (d.data && d.data.list) || [];
    return list.map((v, i) => ({
      title: v.title,
      url: v.short_link_v2 || `https://www.bilibili.com/video/${v.bvid}`,
      author: v.owner && v.owner.name,
      cover: (v.pic || '').replace(/^http:/, 'https:'),
      hot: v.stat && v.stat.view,
      rank: i + 1,
      kind: 'video',
      extra: {
        bvid: v.bvid,
        play: v.stat && v.stat.view,
        like: v.stat && v.stat.like,
        danmaku: v.stat && v.stat.danmaku,
        duration: v.duration,
        cate: v.tname,
        desc: (v.desc || '').slice(0, 140),
      },
    }));
  },

  /** B站关键词定向搜索（获取真正「搞笑类」而非泛热门） */
  'bilibili-search': async (cfg) => {
    const out = [];
    const keywords = cfg.keywords || ['搞笑'];
    const max = cfg.maxPerKeyword || 6;
    for (const kw of keywords) {
      try {
        // order=pubdate 保证拿到新内容，再按互动数据二次排序，避免全站老爆款
        const d = await fetchJSON(
          'https://api.bilibili.com/x/web-interface/wbi/search/type' +
            `?search_type=video&keyword=${encodeURIComponent(kw)}&order=pubdate&page=1`,
          {
            headers: {
              Referer: 'https://search.bilibili.com/',
              Cookie: 'buvid3=0',
            },
          }
        );
        const res = ((d.data && d.data.result) || [])
          .filter((v) => {
            const age = Date.now() / 1000 - (v.pubdate || 0);
            return age >= 0 && age < 60 * 86400; // 只保留最近 60 天
          })
          .sort((a, b) => (Number(b.play) || 0) - (Number(a.play) || 0));
        for (const v of res.slice(0, max)) {
          const bvid = v.bvid || '';
          out.push({
            title: (v.title || '').replace(/<[^>]+>/g, ''),
            url: bvid
              ? `https://www.bilibili.com/video/${bvid}`
              : `https://search.bilibili.com/all?keyword=${encodeURIComponent(kw)}`,
            author: v.author,
            cover: (v.pic || '').replace(/^\/\//, 'https://'),
            hot: v.play,
            kind: 'video',
            extra: {
              bvid,
              keyword: kw,
              play: v.play,
              like: v.like,
              pubdate: v.pubdate,
              duration: v.duration,
              cate: v.typename,
              desc: (v.description || '').replace(/<[^>]+>/g, '').slice(0, 140),
            },
          });
        }
      } catch (e) {
        log(`   ! 关键词「${kw}」失败：${e.message}`);
      }
      await sleep(250);
    }
    return out;
  },

  /** 知乎热榜 */
  'zhihu-hot': async (cfg) => {
    const d = await fetchJSON(
      'https://api.zhihu.com/topstory/hot-lists/total?limit=50',
      { headers: { Referer: 'https://www.zhihu.com/hot' } }
    );
    const list = d.data || [];
    return list.map((it, i) => {
      const t = it.target || {};
      const detail = it.detail_text || '';
      // detail_text 形如 "1234 万热度"
      const m = /([\d.]+)\s*万/.exec(detail);
      const hot = m ? parseFloat(m[1]) * 1e4 : 0;
      return {
        title: t.title || (it.card_label && it.card_label.type) || '',
        url:
          t.type === 'question'
            ? `https://www.zhihu.com/question/${t.id}`
            : `https://www.zhihu.com/question/${t.id}`,
        hot,
        rank: i + 1,
        extra: {
          excerpt: (t.excerpt || '').replace(/<[^>]+>/g, '').slice(0, 140),
          answerCount: t.answer_count,
          detail,
        },
      };
    });
  },

  /** 今日头条热榜 */
  'toutiao-hot': async (cfg) => {
    const d = await fetchJSON('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc');
    const list = d.data || [];
    return list.map((w, i) => ({
      title: w.Title,
      url: w.Url,
      hot: Number(w.HotValue) || 0,
      rank: i + 1,
      extra: { label: w.Label },
    }));
  },

  /** 百度热搜 */
  'baidu-hot': async (cfg) => {
    const d = await fetchJSON('https://top.baidu.com/api/board?platform=wise&tab=realtime');
    const cards = (d.data && d.data.cards) || [];
    const out = [];
    for (const card of cards) {
      for (const block of card.content || []) {
        for (const w of block.content || []) {
          if (!w.word) continue;
          out.push({
            title: w.word,
            url: w.url || `https://www.baidu.com/s?wd=${encodeURIComponent(w.word)}`,
            hot: Number(w.hotScore) || 0,
            rank: w.index ? Number(w.index) + 1 : out.length + 1,
            extra: { desc: (w.desc || '').slice(0, 140), tag: w.hotTag },
          });
        }
      }
    }
    return out;
  },

  /** 一言段子库：k=哲学 d=文学，这里取 k 类中的「段子」向内容 */
  'hitokoto-joke': async (cfg) => {
    const out = [];
    const cats = cfg.categories || ['k'];
    for (const c of cats) {
      for (let i = 0; i < 8; i++) {
        try {
          const d = await fetchJSON(
            `https://v1.hitokoto.cn/?c=${c}&encode=json`,
            { timeout: 8000 }
          );
          if (d && d.hitokoto) {
            out.push({
              title: d.hitokoto.slice(0, 40),
              body: d.hitokoto,
              url: `https://hitokoto.cn/?uuid=${d.uuid}`,
              author: d.from_who || d.from,
              hot: 0,
              kind: 'text',
              extra: { from: d.from, source: 'hitokoto' },
            });
          }
        } catch {
          break;
        }
        await sleep(120);
      }
    }
    return out;
  },

  /** 微博热搜（部分网络环境 403，失败自动跳过） */
  'weibo-hot': async (cfg) => {
    const d = await fetchJSON('https://weibo.com/ajax/side/hotSearch', {
      headers: { Referer: 'https://weibo.com/' },
    });
    const list = (d.data && d.data.realtime) || [];
    return list
      .filter((x) => !x.is_ad)
      .map((x, i) => ({
        title: x.word,
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent('#' + x.word + '#')}`,
        hot: Number(x.num) || Number(x.raw_hot) || 0,
        rank: i + 1,
        extra: { label: x.label_name },
      }));
  },

  /** Reddit r/funny：网络不可达时自动跳过 */
  'reddit-funny': async (cfg) => {
    const d = await fetchJSON('https://www.reddit.com/r/funny/top.json?t=day&limit=30', {
      headers: { Accept: 'application/json' },
    });
    const list = (d.data && d.data.children) || [];
    return list.map((c, i) => {
      const p = c.data || {};
      return {
        title: p.title,
        url: 'https://www.reddit.com' + (p.permalink || ''),
        author: p.author,
        hot: p.ups,
        rank: i + 1,
        kind: p.post_hint === 'video' || p.is_video ? 'video' : 'text',
        extra: {
          subreddit: p.subreddit,
          comments: p.num_comments,
          thumbnail: (p.thumbnail || '').startsWith('http') ? p.thumbnail : '',
        },
      };
    });
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* 分类与标签                                                          */
/* ------------------------------------------------------------------ */

/** 内容形态分类 */
function classifyKind(item, srcCfg) {
  if (item.kind) return item.kind;
  if (srcCfg.type === 'video') return 'video';
  if (srcCfg.type === 'text') return 'text';
  return 'hotword'; // 热搜词：潜在梗源
}

/** 主题标签推导 */
const TOPIC_RULES = [
  { tag: '职场', re: /职场|打工|老板|加班|上班|摸鱼|离职|裁员|同事|工资|会议/i },
  { tag: '校园', re: /学生|老师|考试|宿舍|上课|作业|家长|毕业|校园|军训/i },
  { tag: '家庭', re: /妈|爸|父母|婆婆|老公|老婆|对象|相亲|结婚|孩子|催婚|亲戚|岳母/i },
  { tag: '恋爱', re: /恋爱|分手|暗恋|前任|表白|情商|出轨|舔狗|约会/i },
  { tag: '沙雕', re: /沙雕|离谱|抽象|整活|社死|翻车|无语|笑死|破防/i },
  { tag: '动物', re: /猫|狗|宠物|鹦鹉|仓鼠|鸡|鸟|猴/i },
  { tag: '影视', re: /电影|电视剧|综艺|动画|动漫|番剧|小品|相声|脱口秀/i },
  { tag: '游戏', re: /游戏|玩家|匹配|队友|开局|王者|原神|吃鸡|上分/i },
  { tag: '吃货', re: /吃|美食|外卖|螺蛳粉|火锅|烧烤|奶茶|食堂|减肥/i },
  { tag: '科技', re: /AI|机器人|算法|程序员|代码|DeepSeek|手机|电脑/i },
  { tag: '社会', re: /热搜|通报|回应|官方|警方|网友|评论区/i },
  { tag: '方言', re: /东北|四川|广东|河南|上海|天津|方言|口音/i },
];

function deriveTopics(text) {
  const tags = [];
  for (const r of TOPIC_RULES) if (r.re.test(text)) tags.push(r.tag);
  return tags.slice(0, 3);
}

/** 梗度评分：命中梗词 + 平台权重 + 热度量级 + 形态加成 */
function memeScore(item, cfg, memeWords) {
  const text = `${item.title || ''} ${(item.extra && item.extra.desc) || ''}`;
  let hits = 0;
  for (const w of memeWords) if (text.includes(w)) hits++;
  const base = 28 + Math.min(hits, 3) * 13; // 28 ~ 67 梗词密度是主信号
  const hotPart = scaleHot(item.hot, cfg.type === 'video' ? 5e6 : 1e6) * 0.18; // 0 ~ 18
  const wPart = (cfg.weight || 1) * 3;
  const kindBonus = item.kind === 'video' ? 8 : item.kind === 'text' ? 3 : 0;
  return Math.round(Math.min(100, base + hotPart + wPart + kindBonus));
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

async function readJSON(file, fallback) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main() {
  const startedAt = new Date();
  const day = todayKey(startedAt);
  log(`\n🎯 MemeRadar 采集开始  ${startedAt.toLocaleString('zh-CN')}\n`);

  const cfgFile = await readJSON(SOURCES_FILE, { sources: [], memeWords: [] });
  const memeWords = cfgFile.memeWords || [];
  const store = await readJSON(ITEMS_FILE, { items: [], updatedAt: null, days: [] });
  const runs = await readJSON(RUNS_FILE, { runs: [] });

  const existing = new Map(store.items.map((it) => [it.id, it]));
  const normIndex = store.items.map((it) => ({ id: it.id, n: it.norm }));

  const runReport = {
    date: day,
    startedAt: startedAt.toISOString(),
    finishedAt: null,
    sources: [],
    newItems: 0,
    updatedItems: 0,
    totalItems: 0,
  };

  for (const cfg of cfgFile.sources) {
    if (!cfg.enabled) {
      runReport.sources.push({ id: cfg.id, name: cfg.name, status: 'disabled', count: 0 });
      continue;
    }
    const adapter = adapters[cfg.id];
    if (!adapter) {
      runReport.sources.push({ id: cfg.id, name: cfg.name, status: 'no-adapter', count: 0 });
      continue;
    }
    process.stdout.write(`  → ${cfg.name.padEnd(14, ' ')} `);
    try {
      const raw = await adapter(cfg);
      let added = 0;
      let merged = 0;

      for (const item of raw) {
        if (!item.title || !String(item.title).trim()) continue;
        const title = String(item.title).trim();
        const norm = normTitle(title);
        if (norm.length < 4) continue;

        const kind = classifyKind(item, cfg);
        const topics = deriveTopics(`${title} ${(item.extra && item.extra.desc) || ''}`);
        const score = memeScore({ ...item, kind }, cfg, memeWords);
        const id = hashId(cfg.id + '::' + norm);

        // 跨源同梗合并：相似度 > 0.86 视为同一条，只累加出现次数与来源
        let dupId = null;
        for (const e of normIndex) {
          if (e.id === id) { dupId = null; break; }
          if (Math.abs(e.n.length - norm.length) > 12) continue;
          if (similarity(e.n, norm) > 0.86) { dupId = e.id; break; }
        }
        if (dupId && existing.has(dupId)) {
          const t = existing.get(dupId);
          t.sources = Array.from(new Set([...(t.sources || []), cfg.platform]));
          t.sourceCount = t.sources.length;
          t.lastSeen = day;
          t.heat = Math.max(t.heat || 0, score);
          merged++;
          continue;
        }

        const prev = existing.get(id);
        if (prev) {
          prev.lastSeen = day;
          prev.hot = Math.max(prev.hot || 0, item.hot || 0);
          prev.rank = item.rank || prev.rank;
          prev.heat = Math.max(prev.heat || 0, score);
          runReport.updatedItems++;
          continue;
        }

        const rec = {
          id,
          title,
          body: item.body || null,
          url: item.url || cfg.home,
          author: item.author || null,
          cover: item.cover || null,
          kind,
          platform: cfg.platform,
          sources: [cfg.platform],
          sourceCount: 1,
          sourceId: cfg.id,
          hot: item.hot || 0,
          rank: item.rank || null,
          heat: score,
          topics,
          firstSeen: day,
          lastSeen: day,
          norm,
          extra: item.extra || {},
        };
        existing.set(id, rec);
        normIndex.push({ id, n: norm });
        added++;
        runReport.newItems++;
      }

      log(`✓ 抓取 ${raw.length} 条 / 新增 ${added} / 合并 ${merged}`);
      runReport.sources.push({
        id: cfg.id,
        name: cfg.name,
        platform: cfg.platform,
        status: 'ok',
        count: raw.length,
        added,
        merged,
      });
    } catch (e) {
      log(`✗ ${e.message}`);
      runReport.sources.push({
        id: cfg.id,
        name: cfg.name,
        platform: cfg.platform,
        status: 'error',
        count: 0,
        error: String(e.message || e),
      });
    }
    await sleep(300);
  }

  // 过滤规则：
  // - 视频/文本类：全部保留（本身就是内容）
  // - 热搜词：必须命中梗词才收录，否则只是新闻，不是物料
  let items = Array.from(existing.values())
    .filter((it) => {
      if (it.kind === 'video' || it.kind === 'text') return true;
      return (it.heat || 0) >= 45;
    })
    .sort((a, b) => {
      if (b.lastSeen !== a.lastSeen) return b.lastSeen.localeCompare(a.lastSeen);
      return (b.heat || 0) - (a.heat || 0);
    });

  if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);

  const days = Array.from(new Set(items.map((i) => i.lastSeen))).sort().reverse();

  runReport.finishedAt = new Date().toISOString();
  runReport.totalItems = items.length;
  runReport.day = day;

  runs.runs.unshift(runReport);
  runs.runs = runs.runs.slice(0, 60);

  await fs.writeFile(
    ITEMS_FILE,
    JSON.stringify(
      { updatedAt: new Date().toISOString(), count: items.length, days, items },
      null,
      1
    ),
    'utf8'
  );
  await fs.writeFile(RUNS_FILE, JSON.stringify(runs, null, 2), 'utf8');

  const ok = runReport.sources.filter((s) => s.status === 'ok').length;
  const fail = runReport.sources.filter((s) => s.status === 'error').length;
  log(
    `\n📦 完成：库内 ${items.length} 条（今日新增 ${runReport.newItems}）  ` +
      `源成功 ${ok} / 失败 ${fail}\n`
  );
}

main().catch((e) => {
  console.error('\n采集失败：', e);
  process.exit(1);
});
