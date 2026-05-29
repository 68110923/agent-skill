#!/usr/bin/env node
/**
 * 生成三个 HTML 页面，它们会在运行时从 GitHub 拉取 README.md 并解析表格。
 * 改 README 后无需重新运行此脚本，刷新页面即同步。
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function getRepoName() {
  try {
    const gitConfig = readFileSync(join(root, '.git', 'config'), 'utf-8');
    const m = gitConfig.match(/github\.com[/:](.+?)\.git/);
    return m ? m[1] : 'user/repo';
  } catch { return 'user/repo'; }
}

const REPO = getRepoName();
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/README.md`;

// 共享的解析 + 渲染 JavaScript
const SHARED_JS = `
// ===== Markdown 表格解析引擎 =====
function parseTables(markdown) {
  const tables = [];
  const lines = markdown.split('\\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith('## ')) {
      const sectionTitle = lines[i].replace('## ', '').trim();
      i++;
      // 查找下一个表格
      while (i < lines.length) {
        if (lines[i].trim().startsWith('|') && lines[i+1] && lines[i+1].includes('---')) {
          const header = lines[i].split('|').filter(c => c.trim()).map(c => c.trim());
          const rows = [];
          let j = i + 2;
          while (j < lines.length && lines[j].trim().startsWith('|')) {
            const cells = lines[j].split('|').filter(c => c.trim());
            if (cells.length >= header.length) {
              rows.push(cells.map(c => {
                const link = c.trim().match(/\\[([^\\]]+)\\]\\(([^)]+)\\)/);
                return link ? { text: link[1], url: link[2] } : { text: c.trim(), url: null };
              }));
            }
            j++;
          }
          tables.push({ section: sectionTitle, header, rows });
          i = j;
          break;
        }
        i++;
      }
    } else { i++; }
  }
  return tables;
}

function renderTable(header, rows, linkColIndex = 1) {
  if (!rows.length) return '<tr><td colspan="99" class="empty">暂无数据</td></tr>';
  return rows.map(row => {
    const cols = row.map((cell, idx) => {
      if (idx === 0 && cell.url) {
        // 场景列（可能也带链接）
        return \`<td class="scene-cell">\${cell.url ? '<a href="' + cell.url + '" target="_blank" rel="noopener">' + esc(cell.text) + '</a>' : esc(cell.text)}</td>\`;
      }
      if (idx === linkColIndex && cell.url) {
        return \`<td><a href="\${cell.url}" target="_blank" rel="noopener">\${esc(cell.text)}</a></td>\`;
      }
      return \`<td>\${esc(cell.text)}</td>\`;
    }).join('');
    return '<tr>' + cols + '</tr>';
  }).join('\\n');
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ===== 数据加载 =====
async function loadData() {
  try {
    const res = await fetch('${RAW_URL}');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const md = await res.text();
    return parseTables(md);
  } catch (e) {
    document.getElementById('error-msg').textContent =
      '⚠️ 无法加载 README.md：' + e.message;
    return [];
  }
}
`.trim();

// 页面模板工厂
function pageHTML(sectionKey, title, subtitle, headers, linkColIndex) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Agent & Skill</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <style>
    :root {
      --bg: #0d1117; --bg-card: #161b22; --border: #30363d;
      --text: #e6edf3; --text-muted: #8b949e; --accent: #58a6ff;
      --accent-green: #3fb950;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
      background: var(--bg); color: var(--text); line-height: 1.6;
      min-height: 100vh;
    }
    .container { max-width: 960px; margin: 0 auto; padding: 32px 20px; }
    .header {
      margin-bottom: 32px; padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    .header h1 {
      font-size: 28px; font-weight: 600; margin-bottom: 4px;
      background: linear-gradient(135deg, var(--accent), var(--accent-green));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .header p { color: var(--text-muted); font-size: 14px; }
    .nav { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .nav a {
      padding: 8px 16px; border-radius: 6px; text-decoration: none;
      font-size: 14px; font-weight: 500; color: var(--text-muted);
      border: 1px solid var(--border); transition: all 0.2s;
    }
    .nav a:hover { color: var(--text); border-color: var(--text-muted); }
    .nav a.active { color: #fff; background: var(--accent); border-color: var(--accent); }
    .table-wrap {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
      background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border);
    }
    tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: rgba(88,166,255,0.04); }
    tbody td { padding: 14px 16px; font-size: 14px; vertical-align: top; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .empty { padding: 40px; text-align: center; color: var(--text-muted); }
    .error {
      padding: 20px; text-align: center; color: #f85149;
      background: rgba(248,81,73,0.1); border-radius: 8px; margin-bottom: 16px;
    }
    .loading {
      padding: 40px; text-align: center; color: var(--text-muted);
    }
    .loading::after { content: '...'; animation: dots 1.5s steps(3,end) infinite; }
    @keyframes dots { 0% { content: ''; } 33% { content: '.'; } 66% { content: '..'; } }
    .footer {
      margin-top: 32px; padding-top: 16px;
      border-top: 1px solid var(--border); text-align: center;
      font-size: 12px; color: var(--text-muted);
    }
    .footer a { color: var(--accent); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .scene-cell { white-space: nowrap; font-weight: 500; }
    @media (max-width: 640px) {
      .container { padding: 16px 12px; }
      tbody td { padding: 10px 12px; font-size: 13px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    <nav class="nav">
      <a href="index.html">🏠 总览</a>
      <a href="agent.html"${title.includes('Agent') ? ' class="active"' : ''}>🤖 Agent 框架</a>
      <a href="tools.html"${title.includes('工具') ? ' class="active"' : ''}>🔧 工具</a>
      <a href="skills.html"${title.includes('Skill') ? ' class="active"' : ''}>⚡ Skill</a>
    </nav>
    <div id="error-msg" class="error" style="display:none"></div>
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody id="table-body">
          <tr><td colspan="99" class="loading">正在加载</td></tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      数据实时从 <a href="${RAW_URL}">README.md</a> 获取 · 修改 README 刷新即同步
    </div>
  </div>
  <script>
${SHARED_JS}

async function init() {
  const tbody = document.getElementById('table-body');
  const errEl = document.getElementById('error-msg');
  const tables = await loadData();

  // 找到对应 section 的表格：sectionKey（如 "Agent 框架"）开头
  const table = tables.find(t => t.section.startsWith('${sectionKey}'));
  if (!table || !table.rows.length) {
    tbody.innerHTML = '<tr><td colspan="99" class="empty">未找到数据</td></tr>';
    return;
  }
  tbody.innerHTML = renderTable(table.header, table.rows, ${linkColIndex});
}
init();
  </script>
</body>
</html>`;
}

// 生成 index.html（带实时计数）
const INDEX_RAW_URL = RAW_URL;
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent & Skill 精选清单</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <style>
    :root {
      --bg: #0d1117; --bg-card: #161b22; --border: #30363d;
      --text: #e6edf3; --text-muted: #8b949e; --accent: #58a6ff;
      --accent-green: #3fb950; --accent-purple: #bc8cff;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
      background: var(--bg); color: var(--text); line-height: 1.6;
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
    }
    .container { max-width: 720px; padding: 40px 24px; text-align: center; }
    .hero-icon { font-size: 64px; margin-bottom: 16px; }
    h1 {
      font-size: 36px; font-weight: 700; margin-bottom: 8px;
      background: linear-gradient(135deg, var(--accent), var(--accent-green), var(--accent-purple));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-muted); font-size: 16px; margin-bottom: 40px; }
    .cards { display: flex; flex-direction: column; gap: 16px; }
    .card {
      display: flex; align-items: center; gap: 20px; padding: 24px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 12px; text-decoration: none; color: var(--text);
      transition: all 0.2s; text-align: left;
    }
    .card:hover {
      border-color: var(--accent); transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(88,166,255,0.1);
    }
    .card-icon { font-size: 32px; flex-shrink: 0; }
    .card-body h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .card-body p { font-size: 14px; color: var(--text-muted); }
    .card-count {
      margin-left: auto; padding: 4px 12px; border-radius: 20px;
      font-size: 13px; font-weight: 500; color: var(--text-muted);
      background: rgba(255,255,255,0.04); white-space: nowrap;
    }
    .footer {
      margin-top: 40px; font-size: 12px; color: var(--text-muted);
    }
    .footer a { color: var(--accent); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .error {
      padding: 20px; text-align: center; color: #f85149;
      background: rgba(248,81,73,0.1); border-radius: 8px; margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero-icon">⚡</div>
    <h1>Agent &amp; Skill</h1>
    <p class="subtitle">Agent 框架与 工具 和配套 Skill 的精选推荐，每个场景只收录最优秀的。</p>
    <div class="cards">
      <a href="agent.html" class="card" id="card-agent">
        <span class="card-icon">🤖</span>
        <div class="card-body">
          <h2>Agent 框架</h2>
          <p>终端 Agent、IDE 插件、自进化框架等主流方案</p>
        </div>
        <span class="card-count" id="count-agent">...</span>
      </a>
      <a href="tools.html" class="card" id="card-tools">
        <span class="card-icon">🔧</span>
        <div class="card-body">
          <h2>工具</h2>
          <p>Agent 配套辅助工具，提升日常使用体验</p>
        </div>
        <span class="card-count" id="count-tools">...</span>
      </a>
      <a href="skills.html" class="card" id="card-skills">
        <span class="card-icon">⚡</span>
        <div class="card-body">
          <h2>Skill</h2>
          <p>按场景分类的精选 Skill，覆盖通用、逆向、大项目、数据库等</p>
        </div>
        <span class="card-count" id="count-skills">...</span>
      </a>
    </div>
    <div class="footer">
      数据实时从 <a href="${INDEX_RAW_URL}">README.md</a> 获取 · 修改 README 刷新即同步
    </div>
  </div>
  <div id="error-msg" class="error" style="display:none"></div>
  <script>
${SHARED_JS}

async function init() {
  const errEl = document.getElementById('error-msg');
  const tables = await loadData();
  const sectionMap = { 'Agent 框架': 'agent', '工具': 'tools', 'Skill': 'skills' };
  for (const [sec, key] of Object.entries(sectionMap)) {
    const t = tables.find(t => t.section.startsWith(sec));
    document.getElementById('count-' + key).textContent =
      (t && t.rows.length) ? t.rows.length + ' 个' : '0 个';
  }
}
init();
  </script>
</body>
</html>`;

// 写入文件
const pages = [
  { file: 'index.html', content: indexHtml },
  { file: 'agent.html', content: pageHTML('Agent 框架', 'Agent 框架', '终端 Agent、IDE 插件、自进化框架等主流方案', ['名称', '说明'], 0) },
  { file: 'tools.html', content: pageHTML('工具', '工具', 'Agent 配套辅助工具，提升日常使用体验', ['名称', '说明'], 0) },
  { file: 'skills.html', content: pageHTML('Skill', 'Skill', '按场景分类的精选 Skill，覆盖通用、逆向、大项目、数据库等', ['场景', '名称', '说明'], 1) },
];

for (const { file, content } of pages) {
  writeFileSync(join(root, 'docs', file), content);
  console.log('  📄 docs/' + file);
}

console.log('\\n✅ 全部生成完成 — 页面会在运行时从 README.md 实时加载数据');
console.log('   RAW URL: ' + RAW_URL);
