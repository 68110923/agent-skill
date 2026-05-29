#!/usr/bin/env node
/**
 * 生成完整 HTML 页面，布局写死在 HTML 中，CSS/JS 共享。
 * 改 README 后重新运行此脚本即可同步。
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const REPO = '68110923/agent-skill';
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/README.md`;

const NAV = `
    <nav class="nav">
      <a href="index.html">🏠 总览</a>
      <a href="agent.html" id="nav-agent">🤖 Agent 框架</a>
      <a href="tools.html" id="nav-tools">🔧 工具</a>
      <a href="skills.html" id="nav-skills">⚡ Skill</a>
    </nav>`;

const FOOTER = `
    <div class="footer">
      数据实时从 <a href="${RAW_URL}">README.md</a> 获取 · 修改 README 刷新即同步
    </div>`;

function pageHTML(sectionKey, pageId, title, subtitle, headers, linkCol) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Agent & Skill</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    ${NAV.replace(`id="nav-${pageId}"`, `id="nav-${pageId}" class="active"`)}
    <div id="error-msg" class="error"></div>
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody id="table-body">
          <tr><td colspan="99" class="loading">正在加载</td></tr>
        </tbody>
      </table>
    </div>
    ${FOOTER}
  </div>
  <script src="app.js"></script>
  <script>
    loadData().then(tables => {
      const t = tables.find(t => t.section.startsWith('${sectionKey}'));
      document.getElementById('table-body').innerHTML =
        t && t.rows.length ? renderRows(t.rows, ${linkCol})
        : '<tr><td colspan="99" class="empty">未找到数据</td></tr>';
    });
  </script>
</body>
</html>`;
}

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent & Skill 精选清单</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="stylesheet" href="style.css">
</head>
<body class="landing">
  <div class="container">
    <div class="hero-icon">⚡</div>
    <h1>Agent &amp; Skill</h1>
    <p class="subtitle">Agent 框架与 工具 和配套 Skill 的精选推荐，每个场景只收录最优秀的。</p>
    <div class="cards">
      <a href="agent.html" class="card">
        <span class="card-icon">🤖</span>
        <div class="card-body"><h2>Agent 框架</h2><p>终端 Agent、IDE 插件、自进化框架等主流方案</p></div>
        <span class="card-count" id="count-agent">...</span>
      </a>
      <a href="tools.html" class="card">
        <span class="card-icon">🔧</span>
        <div class="card-body"><h2>工具</h2><p>Agent 配套辅助工具，提升日常使用体验</p></div>
        <span class="card-count" id="count-tools">...</span>
      </a>
      <a href="skills.html" class="card">
        <span class="card-icon">⚡</span>
        <div class="card-body"><h2>Skill</h2><p>按场景分类的精选 Skill，覆盖通用、逆向、大项目、数据库等</p></div>
        <span class="card-count" id="count-skills">...</span>
      </a>
    </div>
    <div id="error-msg" class="error"></div>
    ${FOOTER}
  </div>
  <script src="app.js"></script>
  <script>
    loadData().then(tables => {
      const map = { 'Agent 框架': 'agent', '工具': 'tools', 'Skill': 'skills' };
      for (const [sec, key] of Object.entries(map)) {
        const t = tables.find(t => t.section.startsWith(sec));
        document.getElementById('count-' + key).textContent =
          (t && t.rows.length) ? t.rows.length + ' 个' : '0 个';
      }
    });
  </script>
</body>
</html>`;

// 写入
const pages = [
  ['Agent 框架', 'agent',  'Agent 框架', '终端 Agent、IDE 插件、自进化框架等主流方案', ['名称', '说明'], 0],
  ['工具',       'tools',  '工具',       'Agent 配套辅助工具，提升日常使用体验',        ['名称', '说明'], 0],
  ['Skill',      'skills', 'Skill',      '按场景分类的精选 Skill，覆盖通用、逆向、大项目、数据库等', ['场景', '名称', '说明'], 1],
];

writeFileSync(join(root, 'docs', 'index.html'), indexHtml);
console.log('  📄 docs/index.html');

for (const [sec, id, title, sub, hdrs, lc] of pages) {
  writeFileSync(join(root, 'docs', id + '.html'), pageHTML(sec, id, title, sub, hdrs, lc));
  console.log('  📄 docs/' + id + '.html');
}

console.log('\n✅ 生成完成');
