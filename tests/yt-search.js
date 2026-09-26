// Tìm video trên YouTube từ kết quả tìm kiếm thật (không đoán ID).
// Dùng: node tests/yt-search.js "từ khoá" [số kết quả, mặc định 8]
// In mỗi dòng: id | tiêu đề | kênh | độ dài | đăng khi nào | lượt xem
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36';

async function search(q, limit = 8) {
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAQ%253D%253D'; // chỉ lấy video
  const html = await (await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'vi,en;q=0.8' } })).text();
  const m = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/);
  if (!m) return [];
  const data = JSON.parse(m[1]);
  const out = [];
  const text = (x) => (x && (x.simpleText || (x.runs || []).map((r) => r.text).join(''))) || '';
  const walk = (o) => {
    if (!o || typeof o !== 'object' || out.length >= limit) return;
    if (o.videoRenderer) {
      const v = o.videoRenderer;
      out.push({ id: v.videoId, title: text(v.title), channel: text(v.ownerText), length: text(v.lengthText), published: text(v.publishedTimeText), views: text(v.viewCountText) });
      return;
    }
    for (const k of Object.keys(o)) walk(o[k]);
  };
  walk(data);
  return out;
}

module.exports = { search };

if (require.main === module) {
  (async () => {
    const q = process.argv[2];
    if (!q) { console.log('Dùng: node tests/yt-search.js "từ khoá" [số kết quả]'); process.exit(1); }
    const res = await search(q, Number(process.argv[3]) || 8);
    if (!res.length) console.log('(không có kết quả)');
    for (const r of res) console.log([r.id, r.title, r.channel, r.length, r.published, r.views].join(' | '));
  })();
}
