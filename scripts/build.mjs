#!/usr/bin/env node
/**
 * 把 data/items.json + src/generators.js + src/ui.js 内联成单文件 index.html
 * 产物可直接双击打开，也可作为 GitHub Pages 首页。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const read = (p) => fs.readFile(path.join(ROOT, p), 'utf8');

async function main() {
  const [itemsRaw, runsRaw, generators, ui, html] = await Promise.all([
    read('data/items.json').catch(() => '{"items":[],"count":0,"days":[]}'),
    read('data/runs.json').catch(() => '{"runs":[]}'),
    read('src/generators.js'),
    read('src/ui.js'),
    read('src/index.template.html'),
  ]);

  const data = JSON.parse(itemsRaw);
  const runs = JSON.parse(runsRaw);

  // 精简字段，减小体积：只保留前端用得到的
  const slim = {
    updatedAt: data.updatedAt,
    count: data.count,
    days: data.days || [],
    runs: (runs.runs || []).slice(0, 14),
    items: (data.items || []).map((i) => ({
      id: i.id,
      t: i.title,
      b: i.body || undefined,
      u: i.url,
      a: i.author || undefined,
      c: i.cover || undefined,
      k: i.kind,
      p: i.platform,
      h: i.heat,
      s: i.sourceCount || 1,
      tp: i.topics || [],
      d: i.lastSeen,
      f: i.firstSeen,
      pl: i.extra && i.extra.play,
      ds: i.extra && i.extra.desc,
      pd: i.extra && i.extra.pubdate,
      du: i.extra && i.extra.duration,
    })),
  };

  // 生成器与 UI 都是一个 ES module，去掉相互之间的 import/export 后拼接
  const genBody = generators
    .replace(/^export\s+/gm, '')
    .replace(/import[^;]+;/g, '');
  const uiBody = ui
    .replace(/^export\s+/gm, '')
    .replace(/import\s*\{[^}]*\}\s*from[^;]+;/g, '')
    .replace(/import[^;]+;/g, '');

  const bundle = `${genBody}\n\n${uiBody}`;

  const out = html
    .replace('/*__DATA__*/', () => `window.__DATA__ = ${JSON.stringify(slim)};\nwindow.__META__ = ${JSON.stringify(
      { generatedAt: new Date().toISOString(), itemCount: slim.items.length }
    )};`)
    .replace('/*__BUNDLE__*/', () => bundle);

  await fs.writeFile(path.join(ROOT, 'index.html'), out, 'utf8');
  const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(0);
  console.log(`✓ 构建完成 index.html  (${kb} KB, ${slim.items.length} 条物料)`);
}

main().catch((e) => {
  console.error('构建失败：', e);
  process.exit(1);
});
