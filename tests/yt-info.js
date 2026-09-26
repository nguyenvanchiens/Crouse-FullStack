// Lấy thông tin thật của video YouTube để xác minh trước khi gắn link vào bài học.
// Dùng: node tests/yt-info.js <videoId> [videoId...]
// In ra: id, còn tồn tại hay không (oEmbed), tiêu đề, kênh, độ dài (phút), ngày đăng, có cho nhúng không.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36';

async function info(id) {
  const out = { id, ok: false };
  try {
    const o = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { headers: { 'User-Agent': UA } });
    if (!o.ok) { out.error = `oEmbed HTTP ${o.status} (video không tồn tại hoặc bị ẩn)`; return out; }
    const j = await o.json();
    out.ok = true;
    out.title = j.title;
    out.channel = j.author_name;
  } catch (e) { out.error = 'oEmbed lỗi: ' + e.message; return out; }
  try {
    const w = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
    const html = await w.text();
    const len = html.match(/"lengthSeconds":"(\d+)"/);
    const date = html.match(/"uploadDate":"([^"]+)"/) || html.match(/itemprop="uploadDate" content="([^"]+)"/);
    const embeddable = html.match(/"playableInEmbed":(true|false)/);
    if (len) out.minutes = Math.max(1, Math.round(Number(len[1]) / 60));
    if (date) out.uploaded = date[1].slice(0, 10);
    if (embeddable) out.embeddable = embeddable[1] === 'true';
  } catch (e) { out.pageError = e.message; }
  return out;
}

module.exports = { info };

if (require.main === module) {
  (async () => {
    const ids = process.argv.slice(2);
    if (!ids.length) { console.log('Dùng: node tests/yt-info.js <videoId> [videoId...]'); process.exit(1); }
    for (const id of ids) console.log(JSON.stringify(await info(id)));
  })();
}
