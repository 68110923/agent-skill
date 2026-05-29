/**
 * Agent & Skill Pages - 共享数据引擎与页面渲染
 * 导航、页脚、详情页布局由 JS 动态渲染，各 HTML 只提供配置数据。
 */

const RAW_URL = 'https://raw.githubusercontent.com/68110923/agent-skill/main/README.md';

// ===== 导航 & 页脚（只定义一次） =====

const NAV_ITEMS = [
  { href: 'index.html',                                       icon: '🏠', text: '总览' },
  { href: 'agent.html',  id: 'nav-agent',  activeFor: 'agent',  icon: '🤖', text: 'Agent 框架' },
  { href: 'tools.html',  id: 'nav-tools',  activeFor: 'tools',  icon: '🔧', text: '工具' },
  { href: 'skills.html', id: 'nav-skills', activeFor: 'skills', icon: '⚡', text: 'Skill' },
];

const FOOTER_HTML = `
    <div class="footer">
      <p>前往 「GitHub 仓库」 查看 <a href="https://github.com/68110923/agent-skill" target="_blank">README.md</a> 源文件</p>
    </div>`;

// ===== 详情页渲染 =====

function renderPage(config) {
  const root = document.getElementById('root');
  if (!root) return;

  const navHtml = NAV_ITEMS.map(item => {
    const isActive = item.activeFor === config.pageId;
    const idAttr = item.id ? ` id="${item.id}"` : '';
    const cls = isActive ? ' class="active"' : '';
    return `<a href="${item.href}"${idAttr}${cls}>${item.icon} ${item.text}</a>`;
  }).join('\n      ');

  root.innerHTML = `\
    <div class="container">
      <div class="header">
        <h1>${esc(config.title)}</h1>
        <p>${esc(config.subtitle)}</p>
      </div>
      <nav class="nav">
        ${navHtml}
      </nav>
      <div id="error-msg" class="error"></div>
      <div class="table-wrap">
        <table>
          <thead><tr>${config.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
          <tbody id="table-body">
            <tr><td colspan="99" class="loading">正在加载</td></tr>
          </tbody>
        </table>
      </div>
      ${FOOTER_HTML}
    </div>`;

  loadData().then(tables => {
    const t = tables.find(t => t.section.startsWith(config.sectionKey));
    document.getElementById('table-body').innerHTML =
      t && t.rows.length ? renderRows(t.rows, config.linkCol)
      : '<tr><td colspan="99" class="empty">未找到数据</td></tr>';
  });
}

// ===== 总览页渲染 =====

const LANDING_CARDS = [
  { href: 'agent.html',  icon: '🤖', title: 'Agent 框架', desc: '终端 Agent、IDE 插件、自进化框架等主流方案',            sectionKey: 'Agent 框架' },
  { href: 'tools.html',  icon: '🔧', title: '工具',       desc: 'Agent 配套辅助工具，提升日常使用体验',                   sectionKey: '工具' },
  { href: 'skills.html', icon: '⚡', title: 'Skill',      desc: '按场景分类的精选 Skill，覆盖通用、逆向、大项目、数据库等', sectionKey: 'Skill' },
];

function renderLanding() {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `\
    <div class="container">
      <div class="hero-icon">⚡</div>
      <h1>Agent &amp; Skill</h1>
      <p class="subtitle">Agent 框架与 工具 和配套 Skill 的精选推荐，每个场景只收录最优秀的。</p>
      <div class="cards">
        ${LANDING_CARDS.map(c => `\
        <a href="${c.href}" class="card">
          <span class="card-icon">${c.icon}</span>
          <div class="card-body"><h2>${esc(c.title)}</h2><p>${esc(c.desc)}</p></div>
          <span class="card-count" id="count-${c.sectionKey}">...</span>
        </a>`).join('\n')}
      </div>
      <div id="error-msg" class="error"></div>
      ${FOOTER_HTML}
    </div>`;

  loadData().then(tables => {
    for (const c of LANDING_CARDS) {
      const t = tables.find(t => t.section.startsWith(c.sectionKey));
      document.getElementById('count-' + c.sectionKey).textContent =
        (t && t.rows.length) ? t.rows.length + ' 个' : '0 个';
    }
  });
}

// ===== 解析 Markdown 表格 =====

function parseTables(md) {
  const tables = [];
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith('## ')) {
      const section = lines[i].replace('## ', '').trim();
      i++;
      while (i < lines.length) {
        if (lines[i].trim().startsWith('|') && lines[i + 1]?.includes('---')) {
          const hdr = lines[i].split('|').filter(Boolean).map(c => c.trim());
          const rows = [];
          let j = i + 2;
          while (j < lines.length && lines[j].trim().startsWith('|')) {
            const cells = lines[j].split('|').filter(Boolean).map(c => c.trim());
            if (cells.length >= hdr.length) {
              rows.push(cells.map(c => {
                const m = c.match(/\[([^\]]+)\]\(([^)]+)\)/);
                return m ? { text: m[1], url: m[2] } : { text: c, url: null };
              }));
            }
            j++;
          }
          tables.push({ section, header: hdr, rows });
          i = j;
          break;
        }
        i++;
      }
    } else i++;
  }
  return tables;
}

// ===== 渲染表格行 =====

function renderRows(rows, linkCol) {
  if (!rows.length) return '<tr><td colspan="99" class="empty">暂无数据</td></tr>';
  return rows.map(r => '<tr>' + r.map((c, i) =>
    `<td>${i === linkCol && c.url ? `<a href="${c.url}" target="_blank">${esc(c.text)}</a>` : esc(c.text)}</td>`
  ).join('') + '</tr>').join('\n');
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ===== 加载数据 =====

async function loadData() {
  try {
    const r = await fetch(RAW_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return parseTables(await r.text());
  } catch (e) {
    const el = document.getElementById('error-msg');
    if (el) { el.textContent = '⚠️ ' + e.message; el.style.display = 'block'; }
    return [];
  }
}
