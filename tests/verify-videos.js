// Kiểm tra lại mọi link video trong bài học: còn tồn tại trên YouTube và đúng tiêu đề/kênh đã ghi.
// Dùng: node tests/verify-videos.js   (cần mạng; chạy định kỳ để phát hiện video bị gỡ)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { info } = require('./yt-info.js');

const dir = path.join(__dirname, '..', 'assets/js/data/lessons');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of fs.readdirSync(dir).filter((f) => /^p\d\d\.js$/.test(f))) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx);

(async () => {
  const items = [];
  for (const [key, l] of Object.entries(ctx.window.LESSON_CONTENT)) for (const v of l.videos || []) items.push({ key, v });
  let bad = 0;
  for (const { key, v } of items) {
    const r = await info(v.id);
    const problems = [];
    if (!r.ok) problems.push(r.error);
    else {
      if (r.title !== v.title) problems.push(`tiêu đề khác: "${r.title}"`);
      if (r.channel !== v.channel) problems.push(`kênh khác: "${r.channel}"`);
    }
    if (problems.length) { bad++; console.log(`✗ ${key} ${v.id}: ${problems.join('; ')}`); }
  }
  console.log(`${items.length} video, ${bad} lỗi`);
  process.exit(bad ? 1 : 0);
})();
