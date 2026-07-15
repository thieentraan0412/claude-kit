#!/usr/bin/env node
/*
 * bugs_to_excel.js — Ghi danh sách BUG ra Excel theo MẪU 3 cột: id | web/flutter | Bug.
 * Dùng cho skill `explore-and-report-bugs-to-excel`. Cần package `exceljs`.
 *
 *   node bugs_to_excel.js write <bugs.json> [--out Result/bugs_<app>_<date>.xlsx]
 *
 * exceljs resolve qua NODE_PATH nếu chưa cài cục bộ, ví dụ:
 *   NODE_PATH=<node_modules_có_exceljs> node bugs_to_excel.js write run/bugs.json --out Result/bugs.xlsx
 *
 * Cột "Bug" được ghép từ:
 *   1. <bước 1>
 *   2. <bước 2>
 *   ...
 *   → Lỗi hiện tại: <actual>
 *   → Kết quả mong đợi: <expected>   (nếu có)
 *   → Cần fix: <fix>                 (nếu có)
 *
 * Cấu trúc bugs.json (xem references/bug-excel-schema.md):
 * {
 *   "meta": { "app","url","environment","engine","account","executed_at","scope" },
 *   "bugs": [ { id, platform, steps[], actual, expected, fix } ]
 * }
 */
'use strict';
const fs = require('fs');
const path = require('path');
let ExcelJS;
try { ExcelJS = require('exceljs'); }
catch (e) {
  console.error('[bugs_to_excel] Thiếu package exceljs. Cài: npm i exceljs (hoặc set NODE_PATH tới node_modules có exceljs).');
  process.exit(2);
}

const HEADER = ['id', 'web/flutter', 'Bug'];
const HEADER_FILL = 'FFFDE9D9'; // cam nhạt cho header, giống mẫu
const BORDER = { style: 'thin', color: { argb: 'FFD9D9D9' } };

function norm(s) { return String(s == null ? '' : s).trim(); }

// Ghép nội dung cột "Bug" từ steps + actual + expected/fix
function composeBug(b) {
  const lines = [];
  // Cho phép steps là mảng, hoặc chuỗi đã đánh số sẵn
  let steps = b.steps;
  if (Array.isArray(steps)) {
    steps.forEach((s, i) => { if (norm(s)) lines.push(`${i + 1}. ${norm(s)}`); });
  } else if (norm(steps)) {
    lines.push(norm(steps));
  }
  if (norm(b.actual))   lines.push(`→ Lỗi hiện tại: ${norm(b.actual)}`);
  if (norm(b.expected)) lines.push(`→ Kết quả mong đợi: ${norm(b.expected)}`);
  if (norm(b.fix))      lines.push(`→ Cần fix: ${norm(b.fix)}`);
  return lines.join('\n');
}

function cmdWrite(args) {
  const data = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  const meta = data.meta || {};
  const bugs = Array.isArray(data) ? data : (data.bugs || []);
  if (!bugs.length) console.error('[bugs_to_excel] Cảnh báo: không có bug nào trong input (ghi file rỗng).');

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Claude — explore-and-report-bugs-to-excel';

  // ----- Sheet Info (metadata lần chạy — không nằm trong mẫu chính) -----
  if (Object.keys(meta).length) {
    const info = wb.addWorksheet('Info');
    info.columns = [{ width: 22 }, { width: 70 }];
    const infoRows = [
      ['Ứng dụng',         meta.app || ''],
      ['URL / Môi trường', [meta.url, meta.environment].filter(Boolean).join('  —  ')],
      ['Engine',           meta.engine || ''],
      ['Tài khoản test',   meta.account || ''],
      ['Thời gian chạy',   meta.executed_at || ''],
      ['Phạm vi (scope)',  meta.scope || ''],
      ['Tổng số bug',      String(bugs.length)],
    ];
    infoRows.forEach((r, i) => {
      const row = info.getRow(i + 1);
      row.getCell(1).value = r[0]; row.getCell(1).font = { bold: true };
      row.getCell(2).value = r[1];
    });
  }

  // ----- Sheet Bug (mẫu 3 cột: id | web/flutter | Bug) -----
  const ws = wb.addWorksheet('Bug', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { key: 'id',       width: 6  },
    { key: 'platform', width: 14 },
    { key: 'bug',      width: 95 },
  ];

  // Header
  const header = ws.getRow(1);
  HEADER.forEach((h, j) => {
    const cell = header.getCell(j + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: j === 2 ? 'left' : 'center', wrapText: true };
    cell.border = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
  });
  header.height = 20;

  // Data rows
  let autoId = 0;
  bugs.forEach((b) => {
    autoId += 1;
    const row = ws.addRow({
      id: (b.id != null && norm(b.id) !== '') ? b.id : autoId,
      platform: norm(b.platform) || norm(meta.platform) || 'web/flutter',
      bug: composeBug(b),
    });
    row.getCell(1).alignment = { vertical: 'top', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    row.getCell(3).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    for (let c = 1; c <= 3; c++) row.getCell(c).border = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
  });

  const out = args.out || path.join('Result', 'bugs_report.xlsx');
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  return wb.xlsx.writeFile(out).then(() => {
    console.log(`[bugs_to_excel] Ghi ${bugs.length} bug -> ${out}`);
  });
}

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--out') a.out = argv[++i];
    else a._.push(t);
  }
  return a;
}

(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  args.input = args._[0];
  if (cmd !== 'write' || !args.input) {
    console.error('Dùng: node bugs_to_excel.js write <bugs.json> [--out Result/bugs.xlsx]');
    process.exit(1);
  }
  await cmdWrite(args);
})().catch(e => { console.error('[bugs_to_excel] Lỗi:', e.message); process.exit(1); });
