// Build tĩnh cho Cloudflare: copy các file chạy web sang dist/ (không gồm test, node_modules...)
// và gắn phiên bản (?v=hash) vào URL của JS/CSS để trình duyệt không dùng bản cũ sau mỗi lần deploy.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const INCLUDE = ['index.html', '_headers', 'assets'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let files = 0, bytes = 0;
const hash = crypto.createHash('sha256');
function copy(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(OUT, rel);
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src).sort()) copy(path.join(rel, name));
  } else {
    fs.copyFileSync(src, dst);
    if (rel.startsWith('assets')) hash.update(rel).update(fs.readFileSync(src));
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

// Gắn phiên bản vào index.html; app.js đọc window.DEVPATH_VERSION khi nạp file bài học
const version = hash.digest('hex').slice(0, 10);
const indexPath = path.join(OUT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/(src|href)="(assets\/[^"?]+\.(?:js|css))"/g, `$1="$2?v=${version}"`);
html = html.replace('<script>', `<script>window.DEVPATH_VERSION = "${version}";\n    `);
const tagged = (html.match(/\?v=/g) || []).length;
if (tagged < 5 || !html.includes('DEVPATH_VERSION')) {
  console.error('Không gắn được phiên bản vào index.html');
  process.exit(1);
}
fs.writeFileSync(indexPath, html);

console.log(`Đã build ${files} file (${(bytes / 1024 / 1024).toFixed(2)} MB) vào dist/, phiên bản ${version} (${tagged} URL)`);
