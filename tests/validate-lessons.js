// Kiểm tra file nội dung bài học: node tests/validate-lessons.js [p03 p08 ...]
// Không truyền tham số thì kiểm tra mọi file trong assets/js/data/lessons/.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/js/data/phases.js'), 'utf8'), ctx);
const PHASES = ctx.window.PHASES;

const dir = path.join(ROOT, 'assets/js/data/lessons');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^p\d\d\.js$/.test(f)).map((f) => f.slice(0, 3)) : []);
const LANGS = ['bash', 'yaml', 'typescript', 'javascript', 'json', 'sql', 'dockerfile', 'hcl', 'nginx', 'groovy', 'text', 'html', 'css', 'tsx', 'python', 'go', 'promql', 'ini'];

let errors = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };
const isStr = (s) => typeof s === 'string' && s.trim().length > 0;

for (const pid of ids) {
  const file = path.join(dir, pid + '.js');
  console.log(`\n${pid}.js`);
  if (!fs.existsSync(file)) { err('không tìm thấy file'); continue; }
  const src = fs.readFileSync(file, 'utf8');
  const c = { window: {} };
  vm.createContext(c);
  try { vm.runInContext(src, c, { filename: file }); } catch (e) { err('lỗi cú pháp: ' + e.message); continue; }
  const L = c.window.LESSON_CONTENT || {};
  const phase = PHASES.find((p) => p.id === pid);
  if (!phase) { err('không có phase ' + pid); continue; }
  const expected = [];
  phase.modules.forEach((m, mi) => m.topics.forEach((t, ti) => expected.push([`${pid}.m${mi}.t${ti}`, t[0]])));
  const keys = Object.keys(L).filter((k) => k.startsWith(pid + '.'));
  for (const k of keys) if (!expected.find(([e]) => e === k)) err(`key thừa/không hợp lệ: ${k}`);
  let words = 0, done = 0;
  for (const [k, title] of expected) {
    const x = L[k];
    if (!x) { err(`thiếu bài ${k} (${title})`); continue; }
    done++;
    if (!Array.isArray(x.sections) || x.sections.length < 2) err(`${k}: cần ≥ 2 sections`);
    (x.sections || []).forEach((s, i) => {
      if (!isStr(s.h)) err(`${k}.sections[${i}]: thiếu h`);
      if (!Array.isArray(s.p) || !s.p.length || !s.p.every(isStr)) err(`${k}.sections[${i}]: p phải là mảng chuỗi không rỗng`);
      if (s.list && (!Array.isArray(s.list) || !s.list.every(isStr))) err(`${k}.sections[${i}]: list phải là mảng chuỗi`);
      if (s.code) {
        if (!LANGS.includes(s.code.lang)) err(`${k}.sections[${i}].code.lang không hợp lệ: ${s.code.lang}`);
        if (!isStr(s.code.src)) err(`${k}.sections[${i}].code.src rỗng`);
        if (/\$\{(?!\{)/.test(s.code.src) && /undefined/.test(s.code.src)) err(`${k}: có thể nội suy sai \${}`);
      }
      words += [...(s.p || []), ...(s.list || [])].join(' ').split(/\s+/).length;
    });
    if (!Array.isArray(x.summary) || x.summary.length < 2 || !x.summary.every(isStr)) err(`${k}: summary cần ≥ 2 ý`);
    if (!Array.isArray(x.pitfalls) || !x.pitfalls.length || !x.pitfalls.every(isStr)) err(`${k}: pitfalls cần ≥ 1`);
    if (!Array.isArray(x.quiz) || x.quiz.length < 2) err(`${k}: quiz cần ≥ 2 câu`);
    (x.quiz || []).forEach((q, i) => {
      if (!isStr(q.q) || !Array.isArray(q.options) || q.options.length < 3 || !q.options.every(isStr)) err(`${k}.quiz[${i}]: cần q và ≥ 3 options`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options || []).length) err(`${k}.quiz[${i}]: answer sai chỉ số`);
      if (!isStr(q.explain)) err(`${k}.quiz[${i}]: thiếu explain`);
    });
  }
  console.log(`  ${done}/${expected.length} bài, khoảng ${words} từ (trung bình ${done ? Math.round(words / done) : 0} từ/bài)`);
}
console.log(errors ? `\n${errors} lỗi` : '\nOK, không có lỗi');
process.exit(errors ? 1 : 0);
