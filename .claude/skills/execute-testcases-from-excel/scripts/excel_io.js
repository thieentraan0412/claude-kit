#!/usr/bin/env node
/*
 * excel_io.js — Bản Node tương đương excel_io.py cho skill `execute-testcases-from-excel`.
 * Dùng khi môi trường KHÔNG có Python (chỉ có Node). Cần package `exceljs`.
 *
 *   node excel_io.js read  <input.xlsx|.csv> [--sheet NAME] [--out run/testcases.json]
 *   node excel_io.js write <input.xlsx> --results run/results.json [--out out.xlsx] [--in-place] [--sheet NAME]
 *
 * exceljs được resolve qua NODE_PATH nếu chưa cài cục bộ, ví dụ:
 *   NODE_PATH=<scratchpad>/tcgen/node_modules node excel_io.js read ...
 */
'use strict';
const fs = require('fs');
const path = require('path');
let ExcelJS;
try { ExcelJS = require('exceljs'); }
catch (e) {
  console.error('[excel_io] Thiếu package exceljs. Cài: npm i exceljs (hoặc set NODE_PATH tới node_modules có exceljs).');
  process.exit(2);
}

const FIELD_ALIASES = {
  tc_id:       ['tc id','tcid','tc','ma tc','ma test case','ma testcase','id','test case id','test id','ma','stt tc'],
  module:      ['module','chuc nang','mo dun','phan he','nhom chuc nang'],
  risk_level:  ['risk level','risk','muc rui ro','do rui ro','muc do rui ro'],
  title:       ['test title','title','tieu de','ten test case','ten testcase','test scenario','scenario','kich ban','test case','mo ta','description','noi dung','ten'],
  precondition:['pre condition','precondition','tien dieu kien','dieu kien tien quyet','dieu kien'],
  steps:       ['test steps','steps','cac buoc','cac buoc thuc hien','buoc thuc hien','steps to reproduce','thao tac','cac buoc kiem thu'],
  expected:    ['expected result','expected','ket qua mong doi','ket qua ky vong','ket qua mong muon','mong doi','ket qua du kien'],
  priority:    ['priority','do uu tien','muc uu tien','uu tien'],
  test_data:   ['test data','du lieu test','du lieu','data','du lieu kiem thu'],
};
const RESULT_COLUMNS = {
  'Actual Result': ['actual result','ket qua thuc te','actual','thuc te'],
  'Status':        ['status','trang thai','ket qua chay','verdict'],
  'Executed At':   ['executed at','thoi gian chay','ngay chay','execution time'],
  'Evidence':      ['evidence','bang chung','screenshot','anh','hinh anh'],
  'Note / Bug ID': ['note / bug id','note','bug id','ghi chu','bug','note bug id'],
};
const RESULT_ORDER = Object.keys(RESULT_COLUMNS);
const STATUS_FILL = { PASS:'FFC6EFCE', FAIL:'FFFFC7CE', BLOCKED:'FFD9D9D9', SKIP:'FFFFEB9C' };
const STATUS_FONT = { PASS:'FF006100', FAIL:'FF9C0006', BLOCKED:'FF3F3F3F', SKIP:'FF9C6500' };

function norm(s) {
  if (s === null || s === undefined) return '';
  s = String(s).trim().toLowerCase().replace(/đ/g, 'd');
  s = s.normalize('NFD').replace(/\p{Mn}/gu, '');
  for (const ch of ['_','-','.',':','(',')','/','\\','*','#']) s = s.split(ch).join(' ');
  return s.split(/\s+/).filter(Boolean).join(' ');
}
function matchField(cell) {
  const h = norm(cell);
  if (!h) return null;
  for (const [f, aliases] of Object.entries(FIELD_ALIASES)) if (aliases.includes(h)) return f;
  for (const [f, aliases] of Object.entries(FIELD_ALIASES)) for (const a of aliases) if (a.length >= 3 && h.includes(a)) return f;
  return null;
}
function detectHeader(rows, scan = 15) {
  let bestIdx = null, bestMap = {};
  for (let i = 0; i < Math.min(rows.length, scan); i++) {
    const mapping = {};
    const used = new Set();
    rows[i].forEach((cell, j) => {
      const f = matchField(cell);
      if (f && !used.has(f)) { mapping[j] = f; used.add(f); }
    });
    if (Object.keys(mapping).length > Object.keys(bestMap).length) { bestIdx = i; bestMap = mapping; }
  }
  if (bestIdx === null || Object.keys(bestMap).length < 2) {
    console.error('[excel_io] Không nhận diện được header test case (cần >=2 cột khớp). Kiểm tra file có TC ID, Test Steps, Expected Result... hoặc --sheet đúng.');
    process.exit(1);
  }
  return [bestIdx, bestMap];
}
function cellText(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if (Array.isArray(v.richText)) return v.richText.map(t => t.text).join('');
    if ('text' in v) return String(v.text);
    if ('result' in v) return String(v.result);
    if ('formula' in v) return String(v.result != null ? v.result : '');
    if (v instanceof Date) return v.toISOString();
  }
  return String(v);
}
async function loadRowsXlsx(input, sheet) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(input);
  const ws = sheet ? wb.getWorksheet(sheet) : wb.worksheets[0];
  if (!ws) { console.error('[excel_io] Không tìm thấy sheet: ' + sheet); process.exit(1); }
  const rows = [];
  const rc = ws.rowCount, cc = ws.columnCount;
  for (let r = 1; r <= rc; r++) {
    const row = ws.getRow(r), arr = [];
    for (let c = 1; c <= cc; c++) arr.push(cellText(row.getCell(c).value));
    rows.push(arr);
  }
  return [rows, sheet || ws.name, wb, ws];
}
function loadRowsCsv(input) {
  const txt = fs.readFileSync(input, 'utf8').replace(/^﻿/, '');
  const rows = [];
  let field = '', row = [], inq = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (inq) {
      if (ch === '"' && txt[i+1] === '"') { field += '"'; i++; }
      else if (ch === '"') inq = false; else field += ch;
    } else if (ch === '"') inq = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); field = ''; row = []; }
    else if (ch === '\r') { /* skip */ }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return [rows, 'csv'];
}

async function cmdRead(args) {
  const ext = path.extname(args.input).toLowerCase();
  let rows, sheet;
  if (ext === '.xlsx' || ext === '.xlsm') { [rows, sheet] = await loadRowsXlsx(args.input, args.sheet); }
  else if (ext === '.csv') { [rows, sheet] = loadRowsCsv(args.input); }
  else { console.error('[excel_io] Định dạng không hỗ trợ: ' + ext + ' (dùng .xlsx hoặc .csv).'); process.exit(1); }

  const [headerIdx, colmap] = detectHeader(rows);
  const records = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const rec = {}; for (const k of Object.keys(FIELD_ALIASES)) rec[k] = '';
    for (const [j, field] of Object.entries(colmap)) rec[field] = (row[j] != null ? String(row[j]).trim() : '');
    if (!Object.values(rec).some(v => String(v).trim())) continue;
    rec._row = i + 1; rec._sheet = sheet;
    records.push(rec);
  }
  const colsDetected = {}; for (const [j, f] of Object.entries(colmap)) colsDetected[f] = Number(j);
  const out = {
    source: path.resolve(args.input), sheet, header_row: headerIdx + 1,
    columns_detected: colsDetected, count: records.length, testcases: records,
  };
  const payload = JSON.stringify(out, null, 2);
  if (args.out) {
    fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
    fs.writeFileSync(args.out, payload, 'utf8');
    console.log(`[excel_io] Đọc ${records.length} test case -> ${args.out}`);
    console.log(`[excel_io] Cột nhận diện: ${Object.values(colmap).sort().join(', ')}`);
  } else console.log(payload);
}

function loadResults(p) {
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const items = Array.isArray(data) ? data : (data.results || []);
  const byRow = {}, byId = {};
  for (const it of items) {
    if (it._row != null) byRow[parseInt(it._row, 10)] = it;
    if (it.tc_id) byId[norm(it.tc_id)] = it;
  }
  return [byRow, byId];
}
function resultValue(item, key) {
  const ev = item.evidence;
  switch (key) {
    case 'Actual Result': return item.actual || '';
    case 'Status': return String(item.status || '').trim().toUpperCase();
    case 'Executed At': return item.executed_at || new Date().toISOString().slice(0,19).replace('T',' ');
    case 'Evidence': return Array.isArray(ev) ? ev.join(', ') : (ev || '');
    case 'Note / Bug ID': return [item.bug_id || '', item.note || ''].filter(Boolean).join(' ').trim();
    default: return '';
  }
}
async function cmdWrite(args) {
  const ext = path.extname(args.input).toLowerCase();
  if (ext !== '.xlsx' && ext !== '.xlsm') { console.error('[excel_io] Bản Node chỉ ghi .xlsx (CSV: dùng bản py).'); process.exit(1); }
  const [byRow, byId] = loadResults(args.results);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(args.input);
  const ws = args.sheet ? wb.getWorksheet(args.sheet) : wb.worksheets[0];
  const rc = ws.rowCount, cc = ws.columnCount;
  const rows = [];
  for (let r = 1; r <= rc; r++) { const row = ws.getRow(r), arr = []; for (let c = 1; c <= cc; c++) arr.push(cellText(row.getCell(c).value)); rows.push(arr); }
  const [headerIdx, colmap] = detectHeader(rows);
  const headerRowNo = headerIdx + 1;
  const tcidCol = Object.entries(colmap).find(([, f]) => f === 'tc_id');
  const tcidJ = tcidCol ? Number(tcidCol[0]) : null;

  const existing = {};
  rows[headerIdx].forEach((cell, j) => {
    const hn = norm(cell);
    for (const [canon, aliases] of Object.entries(RESULT_COLUMNS))
      if (hn === norm(canon) || aliases.includes(hn)) existing[canon] = j;
  });
  let nextCol = rows[headerIdx].length;
  const resultCol = {};
  for (const canon of RESULT_ORDER) {
    if (canon in existing) resultCol[canon] = existing[canon];
    else { resultCol[canon] = nextCol; ws.getRow(headerRowNo).getCell(nextCol + 1).value = canon; nextCol++; }
  }
  let written = 0;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const excelRow = i + 1;
    let item = byRow[excelRow];
    if (!item && tcidJ != null && tcidJ < rows[i].length) item = byId[norm(rows[i][tcidJ])];
    if (!item) continue;
    const status = String(item.status || '').trim().toUpperCase();
    for (const [canon, jcol] of Object.entries(resultCol))
      ws.getRow(excelRow).getCell(jcol + 1).value = resultValue(item, canon);
    if (STATUS_FILL[status]) {
      const scell = ws.getRow(excelRow).getCell(resultCol['Status'] + 1);
      scell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_FILL[status] } };
      scell.font = { color: { argb: STATUS_FONT[status] }, bold: (status === 'FAIL' || status === 'PASS') };
    }
    written++;
  }
  let out = args.in_place ? args.input : (args.out || args.input.replace(/(\.xlsm|\.xlsx)$/i, '_executed$1'));
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  await wb.xlsx.writeFile(out);
  console.log(`[excel_io] Ghi ${written} kết quả -> ${out}`);
}

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--in-place') a.in_place = true;
    else if (t === '--sheet') a.sheet = argv[++i];
    else if (t === '--out') a.out = argv[++i];
    else if (t === '--results') a.results = argv[++i];
    else a._.push(t);
  }
  return a;
}
(async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  args.input = args._[0];
  if (!cmd || !args.input) { console.error('Dùng: node excel_io.js <read|write> <file> [--sheet] [--out] [--results] [--in-place]'); process.exit(1); }
  if (cmd === 'read') await cmdRead(args);
  else if (cmd === 'write') { if (!args.results) { console.error('[excel_io] write cần --results'); process.exit(1); } await cmdWrite(args); }
  else { console.error('[excel_io] Lệnh không hợp lệ: ' + cmd); process.exit(1); }
})().catch(e => { console.error('[excel_io] Lỗi:', e.message); process.exit(1); });
