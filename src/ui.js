/**
 * MemeRadar 前端逻辑
 * 与 generators.js 一起被打包进 index.html（同一作用域）。
 */

const D = window.__DATA__ || { items: [], days: [], runs: [], count: 0 };

const state = {
  view: 'video',
  q: '',
  platform: 'all',
  topic: 'all',
  sort: 'heat',
  gen: 'script',
};

/* ------------------------------ 工具 ------------------------------ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);

function fmtNum(n) {
  n = Number(n) || 0;
  if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '万';
  return String(Math.round(n));
}

function fmtDur(sec) {
  sec = Number(sec) || 0;
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function relDate(d) {
  if (!d) return '';
  const today = new Date();
  const t = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  if (d === t) return '今天';
  const y = new Date(today.getTime() - today.getTimezoneOffset() * 60000 - 864e5)
    .toISOString()
    .slice(0, 10);
  if (d === y) return '昨天';
  return d.slice(5);
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el.__t);
  el.__t = setTimeout(() => el.classList.remove('show'), 1800);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('已复制到剪贴板');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast('已复制到剪贴板');
  }
}

/* ------------------------------ 顶部状态 ------------------------------ */

function renderStatbar() {
  const last = D.runs && D.runs[0];
  const okCount = last ? last.sources.filter((s) => s.status === 'ok').length : 0;
  const allCount = last ? last.sources.filter((s) => s.status !== 'disabled').length : 0;
  const videos = D.items.filter((i) => i.k === 'video').length;
  const texts = D.items.filter((i) => i.k === 'text').length;
  const hots = D.items.filter((i) => i.k === 'hotword').length;

  const updated = D.updatedAt
    ? new Date(D.updatedAt).toLocaleString('zh-CN', { hour12: false })
    : '—';

  $('#statbar').innerHTML = `
    <span class="pill"><span class="dot ${okCount === allCount ? '' : okCount ? 'warn' : 'bad'}"></span>
      数据源 <b>${okCount}/${allCount}</b> 在线</span>
    <span class="pill">库内 <b>${D.items.length}</b> 条</span>
    <span class="pill">视频 <b>${videos}</b></span>
    <span class="pill">段子 <b>${texts}</b></span>
    <span class="pill">热梗 <b>${hots}</b></span>
    <span class="pill">更新于 <b>${esc(updated)}</b></span>
  `;

  $('#footMeta').innerHTML = D.updatedAt
    ? `上次采集：${esc(updated)} · 共 ${D.items.length} 条物料 · 支持每日自动更新`
    : '尚未采集数据，请先运行 <code>npm run collect</code>';
}

/* ------------------------------ 筛选器 ------------------------------ */

function renderFilters() {
  const pool = viewable();
  const plats = {};
  const topics = {};
  for (const i of D.items) plats[i.p] = (plats[i.p] || 0) + 1;
  for (const i of D.items) for (const t of i.tp || []) topics[t] = (topics[t] || 0) + 1;

  const platEntries = Object.entries(plats).sort((a, b) => b[1] - a[1]);
  const topicEntries = Object.entries(topics).sort((a, b) => b[1] - a[1]).slice(0, 9);

  const html = [];
  html.push(
    `<button class="chip ${state.platform === 'all' ? 'on' : ''}" data-plat="all">全部平台</button>`
  );
  for (const [p, n] of platEntries) {
    html.push(
      `<button class="chip ${state.platform === p ? 'on' : ''}" data-plat="${esc(p)}">${esc(
        p
      )}<span class="n">${n}</span></button>`
    );
  }
  if (topicEntries.length) {
    html.push('<div class="sep"></div>');
    html.push(
      `<button class="chip ${state.topic === 'all' ? 'on' : ''}" data-topic="all">全部话题</button>`
    );
    for (const [t, n] of topicEntries) {
      html.push(
        `<button class="chip ${state.topic === t ? 'on' : ''}" data-topic="${esc(t)}">${esc(
          t
        )}<span class="n">${n}</span></button>`
      );
    }
  }
  if (state.view === 'video') {
    html.push('<div class="sep"></div>');
    html.push(
      `<button class="chip ${state.sort === 'heat' ? 'on' : ''}" data-sort="heat">按梗度</button>`
    );
    html.push(
      `<button class="chip ${state.sort === 'new' ? 'on' : ''}" data-sort="new">按最新</button>`
    );
    html.push(
      `<button class="chip ${state.sort === 'play' ? 'on' : ''}" data-sort="play">按播放</button>`
    );
  }
  $('#filters').innerHTML = html.join('');
  $('#filters').hidden = state.view === 'gen' || state.view === 'runs';
}

/* ------------------------------ 数据视图 ------------------------------ */

function viewable() {
  let list = D.items.slice();
  if (state.view === 'video') list = list.filter((i) => i.k === 'video');
  else if (state.view === 'text') list = list.filter((i) => i.k === 'text');
  else if (state.view === 'hotword') list = list.filter((i) => i.k === 'hotword');

  if (state.platform !== 'all') list = list.filter((i) => i.p === state.platform);
  if (state.topic !== 'all') list = list.filter((i) => (i.tp || []).includes(state.topic));

  if (state.q) {
    const q = state.q.toLowerCase();
    list = list.filter((i) =>
      `${i.t} ${i.ds || ''} ${(i.tp || []).join(' ')} ${i.b || ''}`.toLowerCase().includes(q)
    );
  }

  const sorters = {
    heat: (a, b) => (b.h || 0) - (a.h || 0) || (b.pl || 0) - (a.pl || 0),
    new: (a, b) =>
      String(b.d).localeCompare(String(a.d)) ||
      (b.pd || 0) - (a.pd || 0) ||
      (b.h || 0) - (a.h || 0),
    play: (a, b) => (b.pl || 0) - (a.pl || 0),
    rank: (a, b) => (b.h || 0) - (a.h || 0),
  };
  list.sort(sorters[state.sort] || sorters.heat);
  return list;
}

function cardHTML(i) {
  const isText = i.k === 'text';
  const cover = i.c
    ? `<div class="cover"><img loading="lazy" src="${esc(i.c)}" alt="" referrerpolicy="no-referrer"
         onerror="this.parentNode.style.display='none'">
         ${i.du ? `<span class="dur">${fmtDur(i.du)}</span>` : ''}
       </div>`
    : '';

  const body = isText
    ? `<div class="body">${esc(i.b || i.t)}</div>`
    : `<h3>${esc(i.t)}</h3>${i.ds ? `<div class="desc">${esc(i.ds)}</div>` : ''}`;

  const heatLabel = i.h >= 70 ? ' hi' : '';

  return `<article class="card ${isText ? 'text-card' : ''}">
    <a class="card-link" href="${esc(i.u)}" target="_blank" rel="noopener noreferrer">
      ${cover}
      ${body}
    </a>
    <div class="card-meta">
      <span class="tagp ${esc(i.p)}">${esc(i.p)}</span>
      ${(i.tp || []).slice(0, 2).map((t) => `<span style="color:var(--tx3)">#${esc(t)}</span>`).join('')}
      <span class="heat${heatLabel}"><i></i>${i.h}</span>
    </div>
  </article>`;
}

function hotItemHTML(i, idx) {
  return `<a class="hotitem" href="${esc(i.u)}" target="_blank" rel="noopener noreferrer">
    <span class="rk ${idx < 3 ? 'top' : ''}">${idx + 1}</span>
    <span style="flex:1;min-width:0">
      <div class="tx">${esc(i.t)}</div>
      <div class="sub">
        <span class="tagp ${esc(i.p)}" style="font-size:10.5px">${esc(i.p)}</span>
        <span>梗度 ${i.h}</span>
        <span>${esc(relDate(i.d))}</span>
      </div>
    </span>
  </a>`;
}

function renderFeed() {
  const list = viewable();
  const box = $('#feed');

  if (!list.length) {
    box.innerHTML = `<div class="empty"><b>没有匹配的内容</b>
      ${D.items.length ? '试试换个关键词或清空筛选' : '还没有数据，先运行 npm run collect 采集一次'}</div>`;
    return;
  }

  if (state.view === 'hotword') {
    box.innerHTML = `<div class="hotlist">${list
      .slice(0, 120)
      .map((i, n) => hotItemHTML(i, n))
      .join('')}</div>`;
  } else {
    box.innerHTML = `<div class="grid">${list.slice(0, 200).map(cardHTML).join('')}</div>`;
  }
}

/* ------------------------------ 生成器 ------------------------------ */

function renderGenTabs() {
  $('#genTabs').innerHTML = GENERATORS.map(
    (g) => `<button class="gtab ${state.gen === g.id ? 'on' : ''}" data-gen="${g.id}">
      <b>${g.name}</b><i>${g.desc}</i></button>`
  ).join('');
}

function renderGen() {
  const r = generate(state.gen, { items: D.items });
  const metaHTML = r.meta
    ? `<div class="meta-row">${Object.entries(r.meta)
        .map(([k, v]) => `<span>${esc(k)}：${esc(v)}</span>`)
        .join('')}</div>`
    : '';

  $('#genResult').innerHTML = `
    <div class="result-top">
      <h3>${esc(r.title)}</h3>
      <span class="badge">${esc(r.label)}</span>
    </div>
    ${r.body ? `<pre class="script">${esc(r.body)}</pre>` : ''}
    ${r.hint ? `<div style="margin-top:12px;font-size:12.5px;color:var(--tx3)">${esc(r.hint)}</div>` : ''}
    ${metaHTML}
    <div class="actions">
      <button class="btn" id="btnAgain">换一个</button>
      <button class="btn ghost" id="btnCopy">复制全文</button>
      <button class="btn ghost" id="btnBatch">批量生成 10 条</button>
    </div>
  `;

  $('#btnAgain').onclick = renderGen;
  $('#btnCopy').onclick = () => copy(`${r.title}\n\n${r.body || ''}`);
  $('#btnBatch').onclick = () => {
    const out = [];
    for (let n = 0; n < 10; n++) {
      const x = generate(state.gen, { items: D.items });
      out.push(`${n + 1}. ${x.title}${x.body ? '\n' + x.body : ''}`);
    }
    copy(out.join('\n\n———\n\n'));
  };
}

/* ------------------------------ 采集日志 ------------------------------ */

function renderRuns() {
  const runs = D.runs || [];
  if (!runs.length) {
    $('#runsBox').innerHTML = `<div class="empty"><b>暂无采集记录</b>运行 npm run collect 后会在这里显示</div>`;
    return;
  }
  $('#runsBox').innerHTML = runs
    .map((r) => {
      const t = r.finishedAt
        ? new Date(r.finishedAt).toLocaleString('zh-CN', { hour12: false })
        : r.startedAt;
      const srcs = (r.sources || [])
        .map((s) => {
          const cls = s.status === 'ok' ? 'ok' : s.status === 'error' ? 'err' : '';
          const txt =
            s.status === 'ok'
              ? `${s.name} ${s.count}条`
              : s.status === 'error'
              ? `${s.name} 失败`
              : `${s.name} 跳过`;
          return `<span class="src ${cls}" title="${esc(s.error || '')}">${esc(txt)}</span>`;
        })
        .join('');
      return `<div class="run">
        <div class="run-h"><b>${esc(r.date || '')}</b>
          <span style="color:var(--tx2);font-size:12px">新增 ${r.newItems || 0} · 库内 ${
        r.totalItems || 0
      }</span>
          <span class="t">${esc(t)}</span>
        </div>
        <div class="srclist">${srcs}</div>
      </div>`;
    })
    .join('');
}

/* ------------------------------ 视图切换 ------------------------------ */

function setView(v) {
  state.view = v;
  $$('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  $('#view-feed').hidden = v === 'gen' || v === 'runs';
  $('#view-gen').hidden = v !== 'gen';
  $('#view-runs').hidden = v !== 'runs';
  $('#filters').hidden = v === 'gen' || v === 'runs';

  if (v === 'gen') {
    renderGenTabs();
    renderGen();
  } else if (v === 'runs') {
    renderRuns();
  } else {
    renderFilters();
    renderFeed();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function boot() {
  renderStatbar();
  renderFilters();
  renderFeed();
  setView(state.q || D.items.some((i) => i.k === 'video') ? 'video' : 'hotword');

  // 搜索
  let timer;
  $('#q').addEventListener('input', (e) => {
    clearTimeout(timer);
    const v = e.target.value.trim();
    timer = setTimeout(() => {
      state.q = v;
      if (state.view === 'gen' || state.view === 'runs') setView('video');
      else {
        renderFilters();
        renderFeed();
      }
    }, 140);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== $('#q')) {
      e.preventDefault();
      $('#q').focus();
    }
    if (e.key === 'Escape' && document.activeElement === $('#q')) {
      $('#q').value = '';
      state.q = '';
      renderFeed();
      $('#q').blur();
    }
  });

  // 导航
  $('#nav').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-view]');
    if (b) setView(b.dataset.view);
  });

  // 筛选（事件委托）
  $('#filters').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    if (b.dataset.plat !== undefined) {
      state.platform = b.dataset.plat;
      renderFilters();
      renderFeed();
    } else if (b.dataset.topic !== undefined) {
      state.topic = b.dataset.topic;
      renderFilters();
      renderFeed();
    } else if (b.dataset.sort !== undefined) {
      state.sort = b.dataset.sort;
      renderFilters();
      renderFeed();
    }
  });

  // 生成器 tab
  $('#genTabs').addEventListener('click', (e) => {
    const b = e.target.closest('.gtab');
    if (b) {
      state.gen = b.dataset.gen;
      renderGenTabs();
      renderGen();
    }
  });
}

window.boot = boot;
