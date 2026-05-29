/**
 * Agent & Skill Pages - 共享数据引擎
 * 只负责从 README.md 读取数据，不涉及布局。
 * 每个 HTML 自带完整布局。
 */

const RAW_URL = 'https://raw.githubusercontent.com/68110923/agent-skill/main/README.md';

// 解析 markdown 表格
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

// 渲染表格行
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

// 加载数据
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
