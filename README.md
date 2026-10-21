# 梗雷达 MemeRadar 🎯

> 全网爆笑梗 · 段子剧本 · 搞笑创意的每日采集站。
> 每天自动从抖音、B站、知乎、微博、头条、百度等平台抓取热门搞笑内容，
> 打分、去重、归类，并内置六种**离线可用**的搞笑创意生成器。

![MemeRadar](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![data](https://img.shields.io/badge/数据-每日更新-orange)

## 它能做什么

**① 每日采集「笑料弹药库」**

| 平台 | 抓什么 | 说明 |
|---|---|---|
| 抖音热榜 | 热梗词 50 条 | 每天最新的玩梗风向 |
| B站热门 | 全站热门视频 | 综合热度 |
| B站定向搜索 | 「搞笑 / 沙雕 / 整活…」8 组关键词 | 按发布时间排序，只收近 60 天，保证新鲜 |
| 知乎热榜 | 热榜 30 条 | 潜在梗源 |
| 微博热搜 | 热搜 50 条 | 梗出现最快的平台 |
| 今日头条热榜 | 热榜 50 条 | 大众话题 |
| 百度热搜 | 实时榜 50 条 | 全民热点 |
| 一言 | 段子向文本 | 可直接用作口播素材 |

单源失败自动跳过、不影响整体；跨平台同梗自动合并并标记「多平台共振」；
每条内容按**梗词密度 + 平台权重 + 热度量级**计算 0–100 的「梗度」分。

**② 搞笑创意生成器（六种，全部离线可用、无需 API 密钥）**

- 📝 **段子剧本**——三幕 + 反转的完整短剧脚本，可直接开拍
- 🎬 **短视频分镜**——带时间轴、机位、台词、字幕提示的 50 秒分镜表
- 🔥 **热梗改编**——把今日真实采集到的热梗套进经典喜剧结构
- 💡 **反差设定**——高概念创意种子，适合系列化连载
- 💬 **一句话梗**——标题 / 评论区 / 口播开头
- 🈶 **谐音双关**——中文特有的语言梗

支持一键复制、批量生成 10 条，创作类素材可嫁接当日采集的真实热梗。

**③ 单文件站点，双击即用**

`index.html` 把全部数据、逻辑、样式内联为一个文件（约 170 KB），
无需服务器、无需网络，双击即可打开浏览与生成。

## 快速开始

```bash
git clone https://github.com/你的用户名/meme-radar.git
cd meme-radar

# 无任何第三方依赖，直接跑
node scripts/collect.mjs   # 采集（约 20 秒）
node scripts/build.mjs     # 构建单文件站点

# 打开 index.html 即可
```

或者一条命令：

```bash
npm run update
```

## 每日自动更新（三种方式任选）

### 方式 A：GitHub Actions（推荐，免费）

仓库已内置 [.github/workflows/daily-collect.yml](.github/workflows/daily-collect.yml)，
每天北京时间 9:30 自动采集并提交最新的 `data/items.json` 与 `index.html`。
开启 GitHub Pages 后即是**自动更新的在线版**。

### 方式 B：本机定时任务

```bash
# Windows 任务计划程序 / Linux crontab
30 9 * * * cd /path/to/meme-radar && node scripts/collect.mjs && node scripts/build.mjs
```

### 方式 C：AI 助手自动化

在 WorkBuddy 等支持定时任务的助手里配置一条每日指令即可。

## 项目结构

```
meme-radar/
├── scripts/
│   ├── collect.mjs      # 采集器：多源适配 / 去重合并 / 梗度评分 / 持久化
│   ├── build.mjs        # 构建器：数据+代码内联为单文件 index.html
│   └── serve.mjs        # 本地预览服务器（可选）
├── src/
│   ├── generators.js    # 六种搞笑创意生成器（纯函数，可独立使用）
│   ├── ui.js            # 前端逻辑
│   └── index.template.html
├── data/
│   ├── sources.json     # 采集源配置（可自行增删源、调整关键词与权重）
│   ├── items.json       # 采集结果（增量合并，保留历史）
│   └── runs.json        # 每次运行的采集日志
├── .github/workflows/
│   └── daily-collect.yml  # GitHub Actions 每日定时采集
└── index.html           # 构建产物：双击即用的单文件站点
```

## 自定义采集源

编辑 `data/sources.json`：

```jsonc
{
  "id": "bilibili-search",
  "enabled": true,           // false 即跳过
  "weight": 1.2,             // 平台权重，影响梗度评分
  "keywords": ["搞笑", "沙雕"],  // B站定向搜索的关键词，可随意增删
  "maxPerKeyword": 6
}
```

`memeWords` 数组是梗词表，可按自己的领域补充（游戏圈、二次元圈黑话等）。

## 隐私与边界

- 只采集**公开接口的标题、摘要与热度指标**，不抓正文全文、不抓用户信息
- 尊重各平台 robots 与访问频率（内置 250–300ms 间隔）
- 数据版权归原作者；项目仅用于个人创作参考

## License

MIT
