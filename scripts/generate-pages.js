#!/usr/bin/env node
/**
 * 生成极简 HTML 骨架 — 布局（header/nav/footer）由 app.js 统一注入。
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SIZE = { title: 'Agent 框架', subtitle: '终端 Agent、IDE 插件、自进化框架等主流方案' };
const TOOLS = { title: '工具', subtitle: 'Agent 配套辅助工具，提升日常使用体验' };
const SKILL = { title: 'Skill', subtitle: '按场景分类的精选 Skill，覆盖通用、逆向、大项目、数据库等' };

function render(page, title, subtitle, headers, linkCol) {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-page="${page}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Agent & Skill</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container" id="root">
    <script src="app.js"></script>
    <script>
      injectLayout('${title}', '${subtitle}');
      document.getElementById('table-head').innerHTML =
        '<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>';
      loadData().then(tables => {
        const t = tables.find(t => t.section.startsWith('${page.split('|')[0]}'));
        document.getElementById('table-body').innerHTML =
          t && t.rows.length ? renderTable(t.header, t.rows, ${linkCol})
          : '<tr><td colspan="99" class="empty">未找到数据</td></tr>';
      });
    </script>
  </div>
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
    <div class="footer">
      数据实时从 <a href="https://raw.githubusercontent.com/68110923/agent-skill/main/README.md">README.md</a> 获取 · 修改 README 刷新即同步
    </div>
  </div>
  <div id="error-msg" class="error"></div>
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

// 子页面配置：[page, title, subtitle, headers, linkColIndex]
const pages = [
  ['Agent 框架|Agent 框架', ...Object.values(SIZE), ['名称', '说明'], 0],
  ['工具|工具',           ...Object.values(TOOLS), ['名称', '说明'], 0],
  ['Skill|Skill',         ...Object.values(SKILL), ['场景', '名称', '说明'], 1],
];

writeFileSync(join(root, 'docs', 'index.html'), indexHtml);
console.log('  📄 docs/index.html');

for (const [page, title, subtitle, headers, linkCol] of pages) {
  const filename = page.split('|')[1].toLowerCase() + '.html';
  const html = render(page, title, subtitle, headers, linkCol);
  writeFileSync(join(root, 'docs', filename), html);
  console.log('  📄 docs/' + filename);
}

console.log('\n✅ 生成完成');
