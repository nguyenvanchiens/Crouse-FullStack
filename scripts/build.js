// Build tĩnh cho Cloudflare: copy các file chạy web sang dist/ (không gồm test, node_modules...)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const INCLUDE = ['index.html', '_headers', 'assets'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let files = 0, bytes = 0;
function copy(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(OUT, rel);
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) copy(path.join(rel, name));
  } else {
    fs.copyFileSync(src, dst);
    files++; bytes += st.size;
  }
}
INCLUDE.forEach(copy);

// Kiểm tra nhanh: mọi chương phải có file nội dung bài học
const phasesSrc = fs.readFileSync(path.join(ROOT, 'assets/js/data/phases.js'), 'utf8');
const ids = [...phasesSrc.matchAll(/id: "(p\d\d)"/g)].map((m) => m[1]);
const missing = ids.filter((id) => !fs.existsSync(path.join(OUT, 'assets/js/data/lessons', id + '.js')));
if (missing.length) {
  console.error('Thiếu nội dung bài học: ' + missing.join(', '));
  process.exit(1);
}

console.log(`Đã build ${files} file (${(bytes / 1024 / 1024).toFixed(2)} MB) vào dist/`);
