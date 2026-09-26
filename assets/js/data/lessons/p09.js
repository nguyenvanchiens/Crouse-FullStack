/* Nội dung bài học chương p09 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p09.m0.t0": {
    sections: [
      {
        h: "Nginx làm gì trong hệ thống backend",
        p: [
          "Nginx là web server và reverse proxy chạy theo mô hình event-driven: một vài worker process xử lý hàng nghìn kết nối cùng lúc mà không cần mỗi kết nối một thread. Nhờ vậy nó rất nhẹ khi phải giữ nhiều kết nối chậm (client mạng yếu, keep-alive).",
          "Trong một hệ thống backend điển hình, Nginx đứng trước ứng dụng Node.js/Go/Java. Nó nhận request từ Internet, xử lý các việc chung như TLS, nén, phục vụ file tĩnh, giới hạn kích thước body, rồi chuyển phần còn lại cho ứng dụng qua `proxy_pass`. Ứng dụng của bạn chỉ cần lắng nghe trên `127.0.0.1` và tập trung vào logic nghiệp vụ."
        ]
      },
      {
        h: "Load balancing với upstream",
        p: [
          "Khối `upstream` định nghĩa một nhóm server backend. Mặc định Nginx dùng round-robin: lần lượt chia request cho từng server. Với `least_conn`, request mới đi tới server đang có ít kết nối nhất, phù hợp khi thời gian xử lý mỗi request chênh lệch lớn (ví dụ có endpoint xuất báo cáo rất chậm).",
          "Nginx bản mã nguồn mở có passive health check: nếu một server lỗi liên tiếp `max_fails` lần trong `fail_timeout`, nó tạm bị loại khỏi vòng quay. Active health check (chủ động gọi `/health`) là tính năng của bản thương mại, nên bạn vẫn cần endpoint health cho các công cụ khác."
        ],
        code: {
          lang: "nginx", file: "/etc/nginx/conf.d/api.conf",
          src: `upstream api_backend {
  least_conn;
  server 127.0.0.1:3001 max_fails=3 fail_timeout=10s;
  server 127.0.0.1:3002 max_fails=3 fail_timeout=10s;
  keepalive 32;                      # giữ kết nối tới backend để tái sử dụng
}

server {
  listen 80;
  server_name api.example.com;

  client_max_body_size 10m;          # vượt quá trả 413 Request Entity Too Large

  gzip on;
  gzip_types application/json text/css application/javascript;
  gzip_min_length 1024;

  location /static/ {
    root /var/www/app;               # file ở /var/www/app/static/...
    expires 30d;
    add_header Cache-Control "public, immutable";
  }

  location / {
    proxy_pass http://api_backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";  # cần cho keepalive upstream
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}`
        }
      },
      {
        h: "Gzip, cache tĩnh và giới hạn body",
        p: [
          "Gzip giảm đáng kể kích thước JSON, CSS, JS khi truyền qua mạng, đổi lại tốn một ít CPU. Không nên nén ảnh JPEG/PNG hay file đã nén sẵn vì gần như không giảm thêm. `gzip_min_length` tránh nén các response quá nhỏ.",
          "File tĩnh có tên chứa hash (ví dụ `app.3f9c2a.js`) có thể cache lâu với `immutable` vì mỗi lần build tên file đổi. File không có hash như `index.html` thì nên cache ngắn hoặc `no-cache`.",
          "`client_max_body_size` mặc định là 1m. Nếu API cho upload file, bạn phải tăng giá trị này, nếu không client nhận lỗi 413 mà log ứng dụng không hề có dòng nào vì request bị chặn ngay tại Nginx."
        ],
        list: [
          "Luôn chạy `nginx -t` trước khi `systemctl reload nginx`.",
          "`reload` áp dụng cấu hình mới mà không cắt các kết nối đang xử lý; `restart` thì có.",
          "Log mặc định ở `/var/log/nginx/access.log` và `error.log`."
        ]
      }
    ],
    summary: [
      "Nginx là reverse proxy event-driven, gánh các việc chung như TLS, nén, file tĩnh trước ứng dụng.",
      "`upstream` + round-robin (mặc định) hoặc `least_conn` để chia tải; `max_fails` loại server lỗi tạm thời.",
      "Gzip cho dữ liệu dạng text; cache dài cho file có hash, cache ngắn cho HTML.",
      "`client_max_body_size` mặc định 1m, vượt quá bị trả 413 ngay tại Nginx."
    ],
    pitfalls: [
      "Quên `proxy_set_header Host` và `X-Forwarded-*`: ứng dụng thấy mọi request đến từ 127.0.0.1 qua HTTP, làm hỏng log IP và logic redirect HTTPS.",
      "Upload file bị lỗi 413 mà không thấy log ứng dụng: hãy tăng `client_max_body_size` cho đúng location.",
      "Reload Nginx khi cấu hình sai cú pháp: luôn chạy `nginx -t && systemctl reload nginx`."
    ],
    quiz: [
      { q: "Khi nào `least_conn` phù hợp hơn round-robin?", options: ["Khi mọi request có thời gian xử lý gần như bằng nhau", "Khi thời gian xử lý request chênh lệch lớn giữa các request", "Khi chỉ có một server backend", "Khi cần sticky session theo cookie"], answer: 1, explain: "`least_conn` gửi request tới server đang ít kết nối nhất, tránh dồn việc vào server đang bận với request chậm. Nếu request đồng đều, round-robin đã đủ; một server thì không cần cân bằng; sticky session là cơ chế khác (ví dụ `ip_hash`)." },
      { q: "Client upload file 5MB nhận lỗi 413, log ứng dụng không có gì. Nguyên nhân khả dĩ nhất?", options: ["Ứng dụng bị crash", "`client_max_body_size` vẫn đang là mặc định 1m", "Gzip chưa bật", "Upstream dùng round-robin"], answer: 1, explain: "Nginx chặn body lớn hơn `client_max_body_size` (mặc định 1m) và trả 413 trước khi request tới ứng dụng, vì vậy log ứng dụng trống. Gzip và thuật toán cân bằng tải không liên quan." },
      { q: "Vì sao có thể đặt `Cache-Control: public, immutable` với `app.3f9c2a.js` nhưng không nên với `index.html`?", options: ["Vì file JS luôn nhỏ hơn HTML", "Vì tên file JS chứa hash, nội dung đổi thì tên đổi; còn `index.html` giữ nguyên tên", "Vì trình duyệt không cache HTML", "Vì Nginx không phục vụ được HTML"], answer: 1, explain: "File có hash trong tên là bất biến: bản mới có tên mới nên cache lâu vẫn an toàn. `index.html` giữ nguyên tên, cache lâu sẽ khiến người dùng không thấy bản mới. Kích thước không phải lý do; trình duyệt vẫn cache HTML." }
    ]
  },
  "p09.m0.t1": {
    sections: [
      {
        h: "Forward proxy: đứng về phía client",
        p: [
          "Forward proxy nằm giữa client và Internet, hành động thay cho client. Công ty thường dùng forward proxy để lọc website, ghi log truy cập, hoặc cho máy trong mạng nội bộ ra Internet qua một điểm duy nhất. Server đích chỉ nhìn thấy IP của proxy, không biết client thật là ai.",
          "Client phải biết và cấu hình dùng proxy (biến `HTTP_PROXY`, `HTTPS_PROXY`, cài đặt trình duyệt). Ví dụ quen thuộc: Squid, proxy công ty, hay NAT Gateway trên cloud cũng đóng vai trò tương tự ở tầng mạng cho các server trong subnet private đi ra ngoài."
        ]
      },
      {
        h: "Reverse proxy: đứng về phía server",
        p: [
          "Reverse proxy nằm trước một hoặc nhiều server và hành động thay cho server. Client không biết phía sau có bao nhiêu server; nó chỉ gọi `api.example.com`. Nginx, HAProxy, Envoy, Traefik, AWS ALB, Cloudflare đều là reverse proxy.",
          "Chính vì đứng ở cửa ngõ, reverse proxy là chỗ lý tưởng để gom các việc cắt ngang (cross-cutting) thay vì lặp lại trong từng service."
        ],
        list: [
          "TLS termination: giải mã HTTPS tại proxy, backend chạy HTTP trong mạng nội bộ, chỉ một nơi quản lý chứng chỉ.",
          "Routing: `/api` tới service A, `/admin` tới service B, theo host hoặc path.",
          "Load balancing và loại bỏ backend lỗi.",
          "Bảo vệ backend: ẩn IP thật, rate limit, giới hạn body, timeout, chặn client chậm (slowloris).",
          "Nén, cache, thêm header bảo mật đồng nhất."
        ]
      },
      {
        h: "Giữ lại thông tin client thật",
        p: [
          "Khi đi qua reverse proxy, kết nối TCP tới backend xuất phát từ proxy, nên `req.ip` của ứng dụng luôn là IP của proxy. Quy ước là proxy gắn header `X-Forwarded-For` (chuỗi IP đã đi qua), `X-Forwarded-Proto` (http hay https) và `Host`. Chuẩn mới hơn là header `Forwarded` (RFC 7239), nhưng `X-Forwarded-*` vẫn phổ biến nhất.",
          "Ứng dụng chỉ nên tin các header này khi request đến từ proxy mà bạn kiểm soát. Nếu backend mở thẳng ra Internet, kẻ tấn công có thể tự gửi `X-Forwarded-For` giả để lách rate limit theo IP. Trong Express, bạn cấu hình `app.set('trust proxy', 1)` để chỉ tin một hop proxy."
        ],
        code: {
          lang: "javascript", file: "server.js",
          src: `const express = require('express');
const app = express();

// Tin đúng 1 proxy phía trước (Nginx). Không đặt true nếu không chắc.
app.set('trust proxy', 1);

app.get('/whoami', (req, res) => {
  res.json({ ip: req.ip, protocol: req.protocol, host: req.hostname });
});

// Chỉ lắng nghe trên loopback, mọi traffic phải đi qua Nginx
app.listen(3000, '127.0.0.1');`
        }
      }
    ],
    summary: [
      "Forward proxy đại diện cho client; reverse proxy đại diện cho server.",
      "Reverse proxy là nơi gom TLS termination, routing, load balancing, rate limit.",
      "Backend nhận IP client qua `X-Forwarded-For`; chỉ tin header này khi đến từ proxy của bạn.",
      "Backend nên bind `127.0.0.1` hoặc nằm trong mạng private để không bị gọi vòng qua proxy."
    ],
    pitfalls: [
      "Đặt `trust proxy` là `true` trong khi backend vẫn mở ra Internet: client có thể giả mạo IP qua `X-Forwarded-For`.",
      "Publish port container ra `0.0.0.0`, người ngoài gọi thẳng backend, bỏ qua mọi lớp bảo vệ ở proxy.",
      "Ứng dụng tự redirect sang HTTPS dựa trên `req.protocol` nhưng không đọc `X-Forwarded-Proto`, gây vòng lặp redirect."
    ],
    quiz: [
      { q: "Điểm khác biệt cốt lõi giữa forward proxy và reverse proxy là gì?", options: ["Forward proxy nhanh hơn", "Forward proxy đại diện cho client, reverse proxy đại diện cho server", "Reverse proxy chỉ dùng cho HTTPS", "Forward proxy luôn làm load balancing"], answer: 1, explain: "Phân biệt nằm ở phía mà proxy đại diện. Tốc độ không phải tiêu chí; reverse proxy dùng cho cả HTTP; load balancing là việc của reverse proxy chứ không phải forward proxy." },
      { q: "TLS termination tại reverse proxy mang lại lợi ích gì?", options: ["Backend không cần xử lý TLS, chứng chỉ quản lý tập trung ở một nơi", "Dữ liệu được mã hoá hai lần", "Không cần chứng chỉ nữa", "Client không cần dùng HTTPS"], answer: 0, explain: "Proxy giải mã HTTPS, backend nhận HTTP trong mạng nội bộ tin cậy, chứng chỉ chỉ cài ở proxy. Nó không mã hoá hai lần, vẫn cần chứng chỉ, và client vẫn dùng HTTPS tới proxy." },
      { q: "Vì sao không nên tin `X-Forwarded-For` từ mọi request?", options: ["Header này quá dài", "Client có thể tự gửi giá trị giả nếu request không đi qua proxy tin cậy", "Nginx không hỗ trợ header này", "Header này chỉ có trong HTTP/2"], answer: 1, explain: "Header chỉ là text do bên gửi đặt. Nếu backend nhận request trực tiếp, kẻ tấn công có thể giả IP để lách rate limit. Nginx hỗ trợ đầy đủ header này và nó dùng được với mọi phiên bản HTTP." }
    ]
  },
  "p09.m0.t2": {
    sections: [
      {
        h: "TLS và Let's Encrypt hoạt động thế nào",
        p: [
          "TLS mã hoá kết nối giữa client và server, đồng thời chứng minh server đúng là chủ của tên miền nhờ chứng chỉ do một CA (Certificate Authority) ký. Let's Encrypt là CA miễn phí, cấp chứng chỉ tự động qua giao thức ACME.",
          "Để cấp chứng chỉ, bạn phải chứng minh quyền kiểm soát domain. Có hai cách phổ biến: HTTP-01 (đặt một file bí mật tại `http://domain/.well-known/acme-challenge/...`, cần cổng 80 mở) và DNS-01 (tạo bản ghi TXT `_acme-challenge`, bắt buộc khi xin chứng chỉ wildcard `*.example.com`). Chứng chỉ Let's Encrypt có hạn ngắn nên việc gia hạn tự động là bắt buộc chứ không phải tùy chọn."
        ]
      },
      {
        h: "Cấp và tự gia hạn bằng certbot",
        p: [
          "Plugin `--nginx` của certbot tự tạo challenge, xin chứng chỉ và sửa file cấu hình Nginx. Trên Ubuntu, gói certbot cài sẵn systemd timer (hoặc cron) chạy `certbot renew` định kỳ; lệnh này chỉ gia hạn khi chứng chỉ sắp hết hạn."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com -m ops@example.com --agree-tos

# Kiểm tra timer gia hạn tự động
sudo systemctl list-timers | grep certbot

# Chạy thử quy trình gia hạn, không cấp thật
sudo certbot renew --dry-run`
        }
      },
      {
        h: "Redirect HTTP → HTTPS và HSTS",
        p: [
          "Mọi request HTTP nên được chuyển hướng 301 sang HTTPS. Tuy nhiên request HTTP đầu tiên vẫn đi dạng rõ, có thể bị chặn giữa đường. HSTS (header `Strict-Transport-Security`) bảo trình duyệt: trong `max-age` giây tới, luôn tự dùng HTTPS với domain này, kể cả khi người dùng gõ `http://`.",
          "Hãy bắt đầu HSTS với `max-age` nhỏ để thử, rồi tăng lên (ví dụ một năm). Chỉ thêm `includeSubDomains` khi chắc chắn mọi subdomain đều có HTTPS, vì trình duyệt sẽ từ chối truy cập subdomain nào còn chạy HTTP. Từ Nginx 1.25.1, HTTP/2 bật bằng chỉ thị riêng `http2 on;` thay vì tham số trong `listen`."
        ],
        code: {
          lang: "nginx", file: "/etc/nginx/sites-available/api.conf",
          src: `server {
  listen 80;
  server_name api.example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  http2 on;
  server_name api.example.com;

  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  add_header Strict-Transport-Security "max-age=31536000" always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}`
        }
      }
    ],
    summary: [
      "Let's Encrypt cấp chứng chỉ miễn phí qua ACME; HTTP-01 cần cổng 80, DNS-01 cần cho wildcard.",
      "Chứng chỉ có hạn ngắn, luôn kiểm tra gia hạn tự động bằng `certbot renew --dry-run`.",
      "Redirect 301 từ HTTP sang HTTPS, thêm HSTS để trình duyệt tự dùng HTTPS lần sau.",
      "Dùng `fullchain.pem` (kèm chứng chỉ trung gian), không phải chỉ `cert.pem`."
    ],
    pitfalls: [
      "Đóng cổng 80 trên firewall khiến HTTP-01 challenge thất bại và chứng chỉ không gia hạn được.",
      "Bật HSTS `includeSubDomains` với `max-age` dài khi còn subdomain chưa có HTTPS: người dùng bị chặn truy cập cho đến khi hết hạn.",
      "Dùng `cert.pem` thay cho `fullchain.pem`: trình duyệt desktop có thể vẫn chạy nhưng client di động hoặc curl báo lỗi chain."
    ],
    quiz: [
      { q: "Muốn xin chứng chỉ wildcard `*.example.com` từ Let's Encrypt, bạn phải dùng loại challenge nào?", options: ["HTTP-01", "DNS-01", "Không cần challenge", "TLS qua cổng 22"], answer: 1, explain: "Wildcard chỉ cấp qua DNS-01 (bản ghi TXT `_acme-challenge`). HTTP-01 chỉ chứng minh một hostname cụ thể; mọi chứng chỉ đều cần challenge; cổng 22 là SSH." },
      { q: "HSTS giải quyết vấn đề gì mà redirect 301 không giải quyết được?", options: ["Tăng tốc TLS handshake", "Request HTTP đầu tiên vẫn đi dạng rõ; HSTS khiến trình duyệt tự dùng HTTPS từ lần sau", "Tự gia hạn chứng chỉ", "Nén dữ liệu"], answer: 1, explain: "Redirect chỉ xảy ra sau khi request HTTP đã gửi đi. HSTS ghi nhớ ở trình duyệt để bỏ qua bước HTTP. Nó không liên quan tốc độ handshake, gia hạn hay nén." },
      { q: "Từ Nginx 1.25.1, cách bật HTTP/2 được khuyến nghị là gì?", options: ["`listen 443 ssl http2;`", "Chỉ thị riêng `http2 on;`", "`enable_http2 true;`", "HTTP/2 không hỗ trợ nữa"], answer: 1, explain: "Tham số `http2` trong `listen` đã deprecated từ 1.25.1, thay bằng chỉ thị `http2 on;`. `enable_http2` không tồn tại, và HTTP/2 vẫn được hỗ trợ." }
    ]
  },
  "p09.m0.t3": {
    sections: [
      {
        h: "CDN là gì và vì sao cần",
        p: [
          "CDN (Content Delivery Network) là mạng lưới máy chủ edge đặt ở nhiều nơi trên thế giới. Người dùng kết nối tới edge gần nhất; nếu edge có sẵn bản cache thì trả ngay, nếu không thì edge lấy từ origin (server của bạn) rồi lưu lại cho các lần sau.",
          "Lợi ích chính: giảm độ trễ vì dữ liệu đi quãng đường ngắn hơn, giảm tải và băng thông cho origin, và hấp thụ tấn công DDoS nhờ hạ tầng phân tán với dung lượng lớn. Cloudflare (proxy qua DNS của họ) và Amazon CloudFront (tích hợp S3, ALB) là hai lựa chọn phổ biến."
        ]
      },
      {
        h: "Header Cache-Control điều khiển cache ở edge",
        p: [
          "CDN tôn trọng header từ origin. `max-age` áp dụng cho trình duyệt, `s-maxage` áp dụng cho cache dùng chung như CDN và ghi đè `max-age` ở đó. `private` nghĩa là chỉ trình duyệt được cache, CDN không được lưu. `no-store` nghĩa là không ai được lưu.",
          "`stale-while-revalidate` cho phép trả bản cũ trong lúc đi lấy bản mới ở nền, giúp người dùng không phải chờ khi cache vừa hết hạn."
        ],
        code: {
          lang: "javascript", file: "routes.js",
          src: `// Asset có hash trong tên: cache 1 năm, không bao giờ đổi
app.use('/assets', express.static('dist/assets', {
  maxAge: '365d',
  immutable: true,
}));

// Danh sách sản phẩm công khai: CDN cache 60s, trình duyệt 0s
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=30');
  res.json(products);
});

// Dữ liệu cá nhân: tuyệt đối không cho CDN lưu
app.get('/api/me', auth, (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json(req.user);
});`
        }
      },
      {
        h: "Invalidation và đánh đổi",
        p: [
          "Khi nội dung thay đổi trước khi cache hết hạn, bạn phải invalidate (purge). Với CloudFront có thể dùng lệnh `aws cloudfront create-invalidation --distribution-id <ID> --paths \"/index.html\"`. Cách bền vững hơn là đặt hash vào tên file để không cần purge asset.",
          "Đánh đổi lớn nhất là tính nhất quán: TTL càng dài, origin càng nhẹ nhưng người dùng càng dễ thấy dữ liệu cũ. Rủi ro nguy hiểm nhất là cache nhầm response có dữ liệu cá nhân rồi trả cho người khác."
        ],
        list: [
          "Khóa cache (cache key) mặc định thường gồm host + path + query; header như `Cookie`, `Authorization` cần cân nhắc kỹ.",
          "Đặt origin chỉ nhận traffic từ CDN (ví dụ CloudFront Origin Access Control cho S3) để không bị gọi vòng.",
          "Theo dõi cache hit ratio để biết CDN có thật sự hiệu quả."
        ]
      }
    ],
    summary: [
      "CDN cache nội dung ở edge gần người dùng, giảm độ trễ và tải cho origin, hấp thụ DDoS.",
      "`s-maxage` điều khiển cache dùng chung (CDN), `max-age` cho trình duyệt, `private`/`no-store` để chặn cache.",
      "Dùng hash trong tên file thay vì purge thường xuyên.",
      "Không bao giờ để CDN cache response chứa dữ liệu người dùng."
    ],
    pitfalls: [
      "Endpoint `/api/me` không đặt `private, no-store`, CDN cache lại và trả thông tin của người A cho người B.",
      "Đặt TTL dài cho `index.html`: deploy xong người dùng vẫn tải bản cũ trỏ tới asset đã bị xoá.",
      "Origin vẫn mở công khai nên kẻ tấn công bỏ qua CDN và đánh thẳng vào server."
    ],
    quiz: [
      { q: "Header `Cache-Control: public, max-age=0, s-maxage=60` có nghĩa là gì?", options: ["Không ai được cache", "Trình duyệt không cache, CDN cache 60 giây", "Trình duyệt cache 60 giây, CDN không cache", "Cache vĩnh viễn"], answer: 1, explain: "`s-maxage` áp dụng cho cache dùng chung như CDN, `max-age=0` áp dụng cho trình duyệt. Muốn không ai cache thì dùng `no-store`." },
      { q: "Cách bền vững nhất để người dùng luôn nhận JS/CSS mới sau deploy mà vẫn cache lâu là gì?", options: ["Purge toàn bộ CDN mỗi lần deploy", "Đặt hash nội dung vào tên file", "Tắt CDN", "Đặt `max-age=1`"], answer: 1, explain: "Tên file đổi khi nội dung đổi, nên cache lâu vẫn an toàn và không cần purge. Purge toàn bộ tốn thời gian và làm tụt hit ratio; tắt CDN hoặc TTL 1 giây làm mất lợi ích cache." },
      { q: "Header nào đảm bảo CDN không lưu response chứa thông tin cá nhân?", options: ["`public`", "`s-maxage=0`", "`private, no-store`", "`immutable`"], answer: 2, explain: "`private` cấm cache dùng chung, `no-store` cấm mọi nơi lưu. `public` cho phép lưu; `s-maxage=0` vẫn có thể được lưu và revalidate; `immutable` chỉ nói nội dung không đổi." }
    ]
  },
  "p09.m0.t4": {
    sections: [
      {
        h: "Nguyên tắc: chỉ mở cái cần mở",
        p: [
          "Một server web công khai thường chỉ cần nhận cổng 80 (để redirect và cho Let's Encrypt HTTP-01) và 443 (HTTPS). Mọi cổng khác như 5432 (Postgres), 6379 (Redis), 3000 (ứng dụng) không được mở ra Internet. Bot quét toàn bộ dải IP liên tục, một Redis không mật khẩu mở ra ngoài có thể bị chiếm trong thời gian rất ngắn.",
          "SSH (22) là cửa quản trị nên phải khoá chặt: chỉ cho phép IP văn phòng/VPN, tắt đăng nhập bằng mật khẩu, chỉ dùng key. Tốt hơn nữa là không mở SSH ra Internet: dùng bastion host (một máy nhảy duy nhất được mở SSH) hoặc AWS Systems Manager Session Manager (SSM), cho phép mở shell qua IAM mà không cần mở cổng nào."
        ]
      },
      {
        h: "ufw trên VPS",
        p: [
          "`ufw` là giao diện đơn giản cho firewall của Linux. Hãy đặt mặc định chặn chiều vào, rồi mở từng cổng cần. Luôn thêm quy tắc SSH trước khi `enable`, nếu không bạn sẽ tự khoá mình ra ngoài."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 203.0.113.10 to any port 22 proto tcp   # chỉ IP văn phòng
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose

# Tắt đăng nhập SSH bằng mật khẩu
sudo sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload ssh`
        }
      },
      {
        h: "Security group trên AWS",
        p: [
          "Security group là firewall ảo gắn vào từng network interface (EC2, RDS, task ECS). Nó stateful: nếu chiều vào được cho phép thì response chiều ra tự động được đi, không cần quy tắc riêng. Mặc định chặn toàn bộ chiều vào.",
          "Điểm mạnh nhất là có thể tham chiếu security group khác thay vì dải IP: security group của RDS chỉ cho phép cổng 5432 từ security group của ứng dụng. Khi ứng dụng scale thêm máy, quy tắc vẫn đúng mà không cần sửa IP."
        ],
        code: {
          lang: "hcl", file: "sg.tf",
          src: `resource "aws_security_group" "db" {
  name   = "db-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.app.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "Postgres chỉ từ app"
}`
        }
      }
    ],
    summary: [
      "Mặc định chặn chiều vào, chỉ mở 80/443 cho web; DB, cache, cổng ứng dụng không mở ra Internet.",
      "SSH chỉ cho IP tin cậy, chỉ dùng key; tốt nhất dùng bastion hoặc SSM Session Manager.",
      "Security group là stateful và có thể tham chiếu security group khác thay cho IP.",
      "Với ufw, luôn mở SSH trước khi `ufw enable`."
    ],
    pitfalls: [
      "Mở `0.0.0.0/0` cho cổng 22 hoặc 5432 \"tạm thời\" rồi quên đóng.",
      "Docker publish port (`-p 3000:3000`) chèn quy tắc iptables riêng nên có thể vượt qua ufw; hãy bind `127.0.0.1:3000:3000`.",
      "`ufw enable` trước khi cho phép SSH và bị khoá khỏi server."
    ],
    quiz: [
      { q: "Vì sao nên cho RDS nhận cổng 5432 từ security group của app thay vì từ dải IP?", options: ["Vì AWS không cho dùng IP", "Quy tắc vẫn đúng khi app scale hoặc đổi IP, không cần sửa", "Để DB chạy nhanh hơn", "Để mở DB cho Internet"], answer: 1, explain: "Tham chiếu security group gắn quyền theo vai trò chứ không theo địa chỉ, nên máy mới của app tự được phép. AWS vẫn cho dùng CIDR; hiệu năng DB không đổi; mục đích là thu hẹp chứ không mở rộng quyền truy cập." },
      { q: "Security group là stateful nghĩa là gì?", options: ["Nó lưu log mọi gói tin", "Response của kết nối đã được cho phép chiều vào tự động được đi ra", "Nó chỉ áp dụng cho subnet", "Phải khai báo quy tắc cho cả hai chiều"], answer: 1, explain: "Stateful theo dõi kết nối nên response tự được phép. NACL mới là stateless và áp dụng cho subnet, cần quy tắc hai chiều. Security group không lưu log gói tin (đó là VPC Flow Logs)." },
      { q: "Cách nào cho phép vào shell EC2 mà không cần mở cổng 22 ra Internet?", options: ["Mở 22 cho 0.0.0.0/0 nhưng đặt mật khẩu mạnh", "AWS Systems Manager Session Manager", "Dùng cổng 2222", "Tắt security group"], answer: 1, explain: "Session Manager mở phiên qua agent SSM và quyền IAM, không cần cổng inbound. Mật khẩu mạnh vẫn phơi cổng; đổi cổng chỉ né bot đơn giản; không thể tắt security group." }
    ]
  },
  "p09.m0.t5": {
    sections: [
      {
        h: "Các loại bản ghi DNS cần biết",
        p: [
          "DNS dịch tên miền thành địa chỉ. Mỗi bản ghi có TTL (giây) cho biết resolver được cache kết quả bao lâu."
        ],
        list: [
          "`A`: tên → IPv4. `AAAA`: tên → IPv6.",
          "`CNAME`: tên này là bí danh của tên khác (ví dụ `www` → `app.example.net`). Không được đặt CNAME ở apex (`example.com`) và không được trùng với bản ghi khác cùng tên.",
          "`ALIAS`/`ANAME` hoặc Alias record của Route 53: giải quyết vấn đề apex, trỏ `example.com` tới ALB/CloudFront mà vẫn trả về bản ghi A.",
          "`MX`: mail server nhận email. `TXT`: văn bản tự do, dùng cho xác minh domain, SPF, DKIM, DMARC.",
          "`NS`: name server có thẩm quyền cho zone."
        ]
      },
      {
        h: "TTL khi chuyển đổi hệ thống",
        p: [
          "Khi sắp đổi IP (chuyển server, chuyển cloud), resolver trên thế giới có thể giữ bản ghi cũ tới hết TTL. Quy trình an toàn: vài ngày trước, hạ TTL xuống thấp (ví dụ 60–300 giây) và chờ ít nhất bằng TTL cũ để cache cũ hết hạn. Sau đó đổi bản ghi; nếu có sự cố, rollback cũng nhanh. Ổn định rồi thì tăng TTL trở lại để giảm số truy vấn.",
          "Trong thời gian chuyển đổi, hãy giữ server cũ chạy vì vẫn có client dùng cache cũ hoặc resolver không tôn trọng TTL."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `dig +short api.example.com A
dig api.example.com A +noall +answer      # xem cả TTL còn lại
dig @8.8.8.8 example.com MX +short        # hỏi resolver cụ thể
dig example.com TXT +short                # xem SPF
dig selector1._domainkey.example.com TXT +short
dig _dmarc.example.com TXT +short`
        }
      },
      {
        h: "DNS cho email: SPF, DKIM, DMARC",
        p: [
          "Nếu ứng dụng gửi email (xác nhận đăng ký, quên mật khẩu), thiếu ba bản ghi này thì email dễ vào spam hoặc bị từ chối. SPF (bản ghi TXT ở domain) liệt kê server được phép gửi thay domain. DKIM ký số email; khoá công khai đặt ở `<selector>._domainkey.example.com`. DMARC (`_dmarc.example.com`) nói bên nhận phải làm gì khi SPF/DKIM không khớp và gửi báo cáo về đâu.",
          "Hãy bắt đầu DMARC với `p=none` để thu báo cáo, kiểm tra mọi nguồn gửi hợp lệ đã pass, rồi mới nâng lên `quarantine` hoặc `reject`."
        ],
        code: {
          lang: "text", file: "zone (ví dụ)",
          src: `example.com.         300  IN  TXT  "v=spf1 include:amazonses.com -all"
_dmarc.example.com.  300  IN  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@example.com"
www.example.com.     300  IN  CNAME  example.com.`
        }
      }
    ],
    summary: [
      "A/AAAA trỏ tới IP, CNAME là bí danh (không dùng ở apex), ALIAS giải quyết apex cho ALB/CloudFront.",
      "Hạ TTL trước khi chuyển đổi, chờ hết TTL cũ, đổi bản ghi, sau đó tăng TTL lại.",
      "SPF, DKIM, DMARC là bắt buộc nếu ứng dụng gửi email.",
      "Dùng `dig` để kiểm tra bản ghi và TTL thực tế."
    ],
    pitfalls: [
      "Hạ TTL ngay lúc đổi IP: resolver vẫn giữ bản ghi cũ theo TTL cũ, người dùng bị lỗi hàng giờ.",
      "Có hai bản ghi SPF (`v=spf1`) cho cùng domain: SPF bị coi là lỗi, hãy gộp thành một.",
      "Đặt DMARC `p=reject` ngay từ đầu khi chưa cấu hình DKIM cho mọi dịch vụ gửi mail, làm email hợp lệ bị từ chối."
    ],
    quiz: [
      { q: "Muốn `example.com` (apex) trỏ tới một ALB trên AWS, nên dùng bản ghi nào?", options: ["CNAME", "Alias record của Route 53 (hoặc ALIAS/ANAME)", "MX", "NS"], answer: 1, explain: "CNAME không được đặt ở apex vì apex còn có SOA/NS. Alias record trả về IP của ALB như bản ghi A. MX dành cho email; NS dành cho ủy quyền zone." },
      { q: "Chuẩn bị chuyển server, TTL hiện là 86400 giây. Làm gì trước?", options: ["Đổi IP ngay rồi hạ TTL", "Hạ TTL xuống thấp, chờ ít nhất 86400 giây, rồi mới đổi IP", "Xoá bản ghi rồi tạo lại", "Tăng TTL lên"], answer: 1, explain: "Resolver đã cache theo TTL cũ, nên phải chờ hết TTL đó thì TTL mới thấp mới có hiệu lực. Đổi ngay hay xoá bản ghi đều khiến người dùng gặp lỗi; tăng TTL làm chuyển đổi chậm hơn." },
      { q: "Bản ghi nào cho bên nhận biết cách xử lý email không qua SPF/DKIM?", options: ["SPF", "DKIM", "DMARC", "MX"], answer: 2, explain: "DMARC định chính sách (`none`, `quarantine`, `reject`) và nơi gửi báo cáo. SPF liệt kê server được gửi; DKIM là chữ ký; MX là server nhận." }
    ]
  },
  "p09.m1.t0": {
    sections: [
      {
        h: "Các khái niệm cốt lõi của IAM",
        p: [
          "IAM (Identity and Access Management) trả lời câu hỏi: ai được làm gì trên tài nguyên nào. Mọi lời gọi API tới AWS, dù từ console, CLI hay SDK, đều được IAM kiểm tra. Mặc định là từ chối; chỉ những hành động được policy cho phép rõ ràng mới được thực hiện, và một `Deny` tường minh luôn thắng `Allow`."
        ],
        list: [
          "User: danh tính lâu dài cho người, có mật khẩu console và/hoặc access key. Ngày nay nên dùng IAM Identity Center (SSO) cho người thay vì tạo IAM user.",
          "Group: gom user để gắn policy chung, ví dụ nhóm `developers`.",
          "Role: danh tính không có mật khẩu, được \"đảm nhận\" (assume) để nhận credential tạm thời. Dùng cho EC2, ECS task, Lambda, CI/CD và truy cập chéo tài khoản.",
          "Policy: tài liệu JSON gồm `Effect`, `Action`, `Resource`, tùy chọn `Condition`."
        ]
      },
      {
        h: "Least privilege trong thực tế",
        p: [
          "Least privilege nghĩa là chỉ cấp đúng quyền cần cho công việc, trên đúng tài nguyên. Một service chỉ cần đọc và ghi vào một bucket thì policy chỉ nên có `s3:GetObject`, `s3:PutObject` trên `arn:aws:s3:::my-app-uploads/*`, không phải `s3:*` trên `*`. Nếu credential bị lộ, thiệt hại bị giới hạn trong phạm vi đó.",
          "Bắt đầu hẹp rồi mở rộng khi cần dễ hơn nhiều so với thu hẹp một policy quá rộng mà không biết ai đang dùng quyền gì. IAM Access Analyzer có thể giúp sinh policy dựa trên hoạt động thực tế trong CloudTrail."
        ],
        code: {
          lang: "json", file: "uploads-policy.json",
          src: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadWriteUploads",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-app-uploads/*"
    }
  ]
}`
        }
      },
      {
        h: "Root account, MFA và credential tạm thời",
        p: [
          "Tài khoản root (đăng nhập bằng email) có toàn quyền và không thể bị giới hạn bởi IAM policy. Hãy bật MFA cho root ngay ngày đầu, không tạo access key cho root, cất thông tin đăng nhập an toàn và chỉ dùng cho vài tác vụ bắt buộc (ví dụ đổi một số cài đặt tài khoản).",
          "Ưu tiên credential tạm thời thay vì access key dài hạn. Ứng dụng trên EC2/ECS nhận quyền qua role gắn vào máy hoặc task; SDK tự lấy credential, không cần biến môi trường. GitHub Actions dùng OIDC để assume role, không lưu access key trong secrets."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `# Bạn đang dùng danh tính nào?
aws sts get-caller-identity

# Đăng nhập qua IAM Identity Center (SSO) thay cho access key
aws configure sso
aws s3 ls --profile dev`
        }
      }
    ],
    summary: [
      "IAM mặc định từ chối; `Deny` tường minh luôn thắng `Allow`.",
      "Người dùng nên đăng nhập qua SSO; máy và CI dùng role với credential tạm thời.",
      "Least privilege: đúng action, đúng resource, bắt đầu hẹp.",
      "Root: bật MFA, không có access key, gần như không dùng."
    ],
    pitfalls: [
      "Commit access key vào Git: bot quét GitHub liên tục, key bị lạm dụng rất nhanh. Dùng role/OIDC và rotate ngay nếu lộ.",
      "Gắn `AdministratorAccess` cho role của ứng dụng cho nhanh, biến mọi lỗ hổng ứng dụng thành chiếm toàn bộ tài khoản.",
      "Dùng tài khoản root cho công việc hằng ngày."
    ],
    quiz: [
      { q: "Ứng dụng chạy trên ECS cần đọc S3. Cách cấp quyền đúng nhất?", options: ["Tạo IAM user và đặt access key vào biến môi trường", "Gắn task role có policy chỉ đọc bucket cần thiết", "Dùng access key của root", "Mở bucket public"], answer: 1, explain: "Task role cấp credential tạm thời, tự xoay vòng, và gắn đúng quyền. Access key dài hạn dễ lộ; root key không bao giờ nên dùng; bucket public làm lộ dữ liệu." },
      { q: "Một policy Allow `s3:*` và một policy khác Deny `s3:DeleteObject` cùng gắn cho role. Kết quả khi gọi DeleteObject?", options: ["Được phép vì Allow rộng hơn", "Bị từ chối vì Deny tường minh luôn thắng", "Tùy thứ tự gắn policy", "Lỗi cấu hình"], answer: 1, explain: "Logic đánh giá của IAM: Deny tường minh ghi đè mọi Allow, bất kể thứ tự. Đây là cấu hình hợp lệ và thường dùng để chặn hành động nguy hiểm." },
      { q: "Vì sao nên dùng OIDC cho GitHub Actions thay vì lưu access key trong secrets?", options: ["OIDC nhanh hơn", "Workflow nhận credential tạm thời qua assume role, không có key dài hạn để bị lộ", "Access key không dùng được trong CI", "OIDC miễn phí còn access key thì không"], answer: 1, explain: "OIDC cho phép trust policy giới hạn theo repo/branch và cấp credential ngắn hạn. Access key vẫn dùng được nhưng là rủi ro dài hạn; tốc độ và chi phí không phải lý do chính." }
    ]
  },
  "p09.m1.t1": {
    sections: [
      {
        h: "VPC, subnet public và private",
        p: [
          "VPC là mạng riêng ảo của bạn trên AWS, với một dải IP (CIDR) như `10.0.0.0/16`. Bên trong, bạn chia thành subnet, mỗi subnet nằm trong một Availability Zone (AZ). Để chịu được sự cố một AZ, hãy tạo subnet ở ít nhất hai AZ.",
          "Subnet \"public\" hay \"private\" không phải một cờ cấu hình mà do route table quyết định. Subnet public có route `0.0.0.0/0` tới Internet Gateway (IGW), nên tài nguyên có IP public trong đó giao tiếp hai chiều với Internet. Subnet private không có route tới IGW; nó ra Internet (tải package, gọi API bên ngoài) qua NAT Gateway đặt ở subnet public, nhưng Internet không thể chủ động kết nối vào.",
          "Quy tắc chung: chỉ load balancer (và có thể NAT Gateway, bastion) nằm ở subnet public. Ứng dụng, database, cache nằm ở subnet private."
        ]
      },
      {
        h: "Ví dụ bằng Terraform",
        p: [
          "Trong thực tế bạn thường dùng module `terraform-aws-modules/vpc/aws` như Lab 05. Viết tay vài resource giúp bạn hiểu module đang làm gì."
        ],
        code: {
          lang: "hcl", file: "vpc.tf",
          src: `resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "ap-southeast-1a"
}

resource "aws_eip" "nat" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id   # NAT nằm ở subnet public
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}`
        }
      },
      {
        h: "Security group vs NACL và chi phí NAT",
        p: [
          "Security group gắn vào network interface, stateful, chỉ có quy tắc Allow. NACL (Network ACL) gắn vào subnet, stateless (phải mở cả chiều về, gồm dải ephemeral port), có cả Allow và Deny, đánh giá theo số thứ tự. Phần lớn hệ thống chỉ cần security group; NACL dùng làm lớp chặn thô ở mức subnet, ví dụ chặn một dải IP xấu.",
          "NAT Gateway tính phí theo giờ cộng phí xử lý dữ liệu, xem bảng giá chính thức. Môi trường dev/staging thường dùng một NAT duy nhất; production dùng một NAT mỗi AZ để không phụ thuộc một AZ. Traffic tới S3/DynamoDB có thể đi qua Gateway VPC Endpoint để không phải qua NAT."
        ]
      }
    ],
    summary: [
      "VPC chia thành subnet theo AZ; dùng ít nhất hai AZ.",
      "Public/private do route table quyết định: route tới IGW là public, qua NAT là private.",
      "Chỉ load balancer ở subnet public; app và DB ở private.",
      "Security group: stateful, gắn ENI, chỉ Allow. NACL: stateless, gắn subnet, có Deny."
    ],
    pitfalls: [
      "Đặt RDS ở subnet public với `publicly_accessible = true`: DB lộ ra Internet chỉ còn security group bảo vệ.",
      "Quên NAT Gateway nên task ở subnet private không kéo được image hay gọi API ngoài, báo timeout khó hiểu.",
      "Chọn CIDR VPC trùng với mạng văn phòng hoặc VPC khác, sau này không thể peering/VPN được."
    ],
    quiz: [
      { q: "Điều gì khiến một subnet trở thành \"public\"?", options: ["Tên subnet có chữ public", "Route table của nó có route `0.0.0.0/0` tới Internet Gateway", "Subnet có NAT Gateway", "Subnet nằm ở AZ đầu tiên"], answer: 1, explain: "Tính public đến từ route tới IGW. Tên chỉ là nhãn; subnet private mới route qua NAT; AZ không quyết định." },
      { q: "Máy trong subnet private cần tải package từ Internet. Cần gì?", options: ["Gắn IP public cho máy", "Route `0.0.0.0/0` tới NAT Gateway đặt ở subnet public", "Mở security group 0.0.0.0/0 chiều vào", "Tạo NACL Deny all"], answer: 1, explain: "NAT cho phép đi ra nhưng không cho Internet chủ động vào. IP public vô dụng khi subnet không có route tới IGW; mở chiều vào không giúp đi ra; NACL Deny all chặn mọi thứ." },
      { q: "Khác biệt nào giữa security group và NACL là đúng?", options: ["Security group stateless, NACL stateful", "Security group gắn vào ENI và stateful; NACL gắn vào subnet và stateless", "Cả hai chỉ có quy tắc Allow", "NACL không áp dụng cho traffic ra"], answer: 1, explain: "Security group stateful ở mức interface; NACL stateless ở mức subnet và hỗ trợ cả Deny, áp dụng cho cả chiều vào và chiều ra." }
    ]
  },
  "p09.m1.t2": {
    sections: [
      {
        h: "Ba mức trừu tượng của compute",
        p: [
          "AWS cho bạn chọn mức kiểm soát và mức vận hành. Càng lên cao, bạn quản ít thứ hơn nhưng cũng bị ràng buộc nhiều hơn."
        ],
        list: [
          "EC2: máy ảo. Bạn chọn OS, vá hệ điều hành, cài runtime. Linh hoạt nhất, vận hành nặng nhất.",
          "ECS Fargate: chạy container mà không quản server. Bạn khai báo image, CPU, memory; AWS lo máy chạy phía dưới. Tính tiền theo vCPU và memory của task theo thời gian chạy.",
          "Lambda: chạy hàm theo sự kiện (HTTP qua API Gateway/Function URL, message SQS, file S3). Scale về 0 khi không có request, tính tiền theo số lần gọi và thời gian chạy. Có giới hạn thời gian chạy tối đa mỗi lần gọi (15 phút) và có cold start."
        ]
      },
      {
        h: "EC2 và Auto Scaling Group",
        p: [
          "Auto Scaling Group (ASG) giữ số lượng EC2 trong khoảng `min`/`max`, tạo máy từ Launch Template. Nếu máy chết hoặc health check thất bại, ASG thay máy mới. Với target tracking (ví dụ giữ CPU trung bình 60%), ASG tự thêm bớt máy. Kết hợp với ALB, máy mới tự được đăng ký vào target group.",
          "Vì máy có thể bị thay bất cứ lúc nào, máy trong ASG phải stateless: không lưu file upload hay session trên đĩa local."
        ]
      },
      {
        h: "ECS Fargate: lựa chọn mặc định cho API container",
        p: [
          "Với một backend đã đóng gói Docker, Fargate thường là điểm cân bằng tốt: không vá OS, không quản cluster, vẫn chạy được process dài hạn, WebSocket, worker. Task definition mô tả container; service giữ số task mong muốn, gắn vào ALB và rolling deploy khi đổi image."
        ],
        code: {
          lang: "hcl", file: "ecs.tf",
          src: `resource "aws_ecs_task_definition" "api" {
  family                   = "task-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution.arn  # kéo image, ghi log
  task_role_arn            = aws_iam_role.api_task.arn       # quyền của ứng dụng

  container_definitions = jsonencode([{
    name         = "api"
    image        = var.image
    essential    = true
    portMappings = [{ containerPort = 3000, protocol = "tcp" }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/task-api"
        awslogs-region        = var.region
        awslogs-stream-prefix = "api"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name            = "task-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.app.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }
}`
        }
      },
      {
        h: "Chọn cái nào?",
        p: [
          "Lưu lượng thất thường, tác vụ ngắn theo sự kiện (xử lý ảnh khi upload, webhook) hợp với Lambda. API chạy liên tục, cần kết nối DB ổn định hợp với Fargate. Cần GPU, kernel tuning, phần mềm đặc thù hoặc tối ưu chi phí ở quy mô lớn thì EC2. Nhiều hệ thống kết hợp cả ba."
        ]
      }
    ],
    summary: [
      "EC2 = máy ảo tự quản; Fargate = container không quản server; Lambda = hàm theo sự kiện.",
      "ASG giữ số máy trong khoảng min/max, tự thay máy lỗi; máy phải stateless.",
      "Fargate phân biệt execution role (kéo image, log) và task role (quyền ứng dụng).",
      "Lambda có giới hạn thời gian chạy và cold start; hợp với tác vụ ngắn, lưu lượng thất thường."
    ],
    pitfalls: [
      "Nhầm execution role với task role: gắn quyền S3 vào execution role nên ứng dụng vẫn bị AccessDenied.",
      "Lambda mở kết nối DB mới mỗi lần gọi, khi scale cao làm cạn connection của Postgres; dùng RDS Proxy hoặc pool ngoài handler.",
      "Lưu file upload trên đĩa EC2 trong ASG, máy bị thay là mất dữ liệu; dùng S3."
    ],
    quiz: [
      { q: "Trong ECS, quyền để ứng dụng đọc S3 nên gắn vào đâu?", options: ["Execution role", "Task role", "Security group", "Cluster"], answer: 1, explain: "Task role là danh tính của code trong container. Execution role chỉ dùng cho ECS agent kéo image, đọc secret khi khởi động và ghi log. Security group là firewall; cluster không mang quyền IAM cho ứng dụng." },
      { q: "Tác vụ nào không phù hợp với Lambda?", options: ["Resize ảnh khi có file mới trên S3", "Xử lý webhook thỉnh thoảng mới có", "Job xử lý dữ liệu chạy liên tục 2 giờ", "Cron nhỏ chạy mỗi giờ"], answer: 2, explain: "Lambda có giới hạn tối đa 15 phút mỗi lần gọi, nên job 2 giờ phải chạy trên Fargate/EC2 hoặc chia nhỏ. Ba trường hợp còn lại là tác vụ ngắn theo sự kiện, rất hợp Lambda." },
      { q: "Vì sao máy trong Auto Scaling Group phải stateless?", options: ["Vì ASG không hỗ trợ EBS", "Vì ASG có thể xoá và thay máy bất cứ lúc nào khi scale in hoặc máy lỗi", "Vì stateless chạy nhanh hơn", "Vì ALB yêu cầu"], answer: 1, explain: "Scale in hoặc thay máy lỗi sẽ xoá máy cùng dữ liệu local. ASG vẫn dùng EBS làm ổ gốc; lý do không phải hiệu năng hay yêu cầu của ALB." }
    ]
  },
  "p09.m1.t3": {
    sections: [
      {
        h: "S3, EBS, EFS: ba kiểu lưu trữ khác nhau",
        list: [
          "S3: object storage. Lưu file theo key trong bucket, truy cập qua HTTP API, dung lượng gần như không giới hạn, độ bền rất cao. Không mount như ổ đĩa, không sửa một phần file. Phù hợp file upload, backup, static site, data lake.",
          "EBS: block storage, như một ổ cứng gắn vào một EC2 trong cùng AZ. Dùng cho ổ gốc OS và database tự chạy. Có snapshot để backup.",
          "EFS: file system NFS dùng chung, nhiều máy (EC2, ECS, Lambda) ở nhiều AZ mount cùng lúc. Tiện khi phần mềm cũ bắt buộc cần thư mục chia sẻ."
        ],
        p: [
          "Với ứng dụng web hiện đại, mặc định hãy dùng S3 cho file của người dùng; ứng dụng vẫn stateless và scale tự do."
        ]
      },
      {
        h: "Bucket an toàn và lifecycle",
        p: [
          "Bucket mới mặc định bật Block Public Access và mã hoá phía server; hãy giữ nguyên. Quyền truy cập cấp qua IAM policy của role ứng dụng. Nếu cần phục vụ công khai, đặt CloudFront phía trước với Origin Access Control thay vì mở bucket public.",
          "Lifecycle rule tự chuyển object cũ sang lớp lưu trữ rẻ hơn hoặc xoá sau N ngày, ví dụ xoá file tạm sau 7 ngày, huỷ multipart upload dở dang."
        ],
        code: {
          lang: "hcl", file: "s3.tf",
          src: `resource "aws_s3_bucket" "uploads" {
  bucket = "myorg-task-uploads"
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "cleanup-tmp"
    status = "Enabled"
    filter { prefix = "tmp/" }
    expiration { days = 7 }
  }

  rule {
    id     = "abort-multipart"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload { days_after_initiation = 3 }
  }
}`
        }
      },
      {
        h: "Presigned URL: upload thẳng lên S3",
        p: [
          "Nếu client upload file qua server của bạn, server phải gánh băng thông và bộ nhớ. Presigned URL là URL có chữ ký tạm thời, cho phép client PUT hoặc GET một object cụ thể trong vài phút mà không cần credential AWS. Server chỉ kiểm tra quyền và sinh URL; file đi thẳng từ trình duyệt lên S3.",
          "URL được ký bằng credential của server, nên quyền của nó không vượt quá quyền của role đó, và hết hạn khi credential tạm thời hết hạn dù `expiresIn` dài hơn."
        ],
        code: {
          lang: "typescript", file: "upload.ts",
          src: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const s3 = new S3Client({ region: 'ap-southeast-1' });

export async function createUploadUrl(userId: string, contentType: string) {
  const key = \`users/\${userId}/\${randomUUID()}\`;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: 'myorg-task-uploads', Key: key, ContentType: contentType }),
    { expiresIn: 300 }, // 5 phút
  );
  return { url, key };
}`
        }
      }
    ],
    summary: [
      "S3 cho object/file người dùng, EBS là ổ đĩa của một EC2, EFS là file system dùng chung.",
      "Giữ Block Public Access; phục vụ công khai qua CloudFront + Origin Access Control.",
      "Lifecycle rule dọn file tạm và multipart upload dở dang.",
      "Presigned URL cho client upload/download trực tiếp, hết hạn sau vài phút."
    ],
    pitfalls: [
      "Tắt Block Public Access để \"cho nhanh\" và lộ toàn bộ dữ liệu người dùng.",
      "Dùng key do client gửi lên (ví dụ tên file gốc) mà không kiểm tra, người dùng ghi đè file của nhau; hãy sinh key phía server.",
      "Upload qua presigned URL bị lỗi CORS vì bucket chưa cấu hình CORS cho domain frontend."
    ],
    quiz: [
      { q: "Nhiều task ECS ở nhiều AZ cần cùng đọc ghi một thư mục chia sẻ kiểu POSIX. Chọn gì?", options: ["EBS", "EFS", "S3 mount như ổ đĩa", "Instance store"], answer: 1, explain: "EFS là NFS dùng chung đa AZ. EBS thường gắn vào một máy trong một AZ; S3 là object storage chứ không phải file system POSIX; instance store mất khi máy dừng." },
      { q: "Lợi ích chính của presigned URL cho upload là gì?", options: ["File được nén tự động", "Client upload thẳng lên S3, server không phải trung chuyển file", "Bucket trở thành public", "Không cần IAM nữa"], answer: 1, explain: "Server chỉ ký URL có hạn; băng thông đi thẳng tới S3. Bucket vẫn private, quyền vẫn dựa trên IAM của bên ký, và S3 không tự nén file." },
      { q: "Lifecycle rule `abort_incomplete_multipart_upload` dùng để làm gì?", options: ["Tăng tốc upload", "Dọn các phần multipart upload bị bỏ dở đang chiếm dung lượng", "Chặn upload file lớn", "Mã hoá file"], answer: 1, explain: "Multipart upload dở dang vẫn lưu các phần đã tải và vẫn bị tính dung lượng dù không thấy trong danh sách object. Rule này xoá chúng sau N ngày; nó không liên quan tốc độ, giới hạn kích thước hay mã hoá." }
    ]
  },
  "p09.m1.t4": {
    sections: [
      {
        h: "Vì sao dùng database managed",
        p: [
          "Tự chạy Postgres trên EC2 nghĩa là bạn tự lo backup, vá phiên bản, failover, giám sát đĩa. RDS và Aurora làm các việc đó: backup tự động kèm point-in-time recovery trong khoảng retention, cập nhật minor version trong maintenance window, Multi-AZ failover, metric sẵn trên CloudWatch. Đổi lại bạn không có quyền superuser đầy đủ và chỉ dùng được extension AWS hỗ trợ.",
          "Aurora PostgreSQL tương thích Postgres nhưng dùng tầng lưu trữ phân tán riêng, dữ liệu được nhân bản qua nhiều AZ và read replica chia sẻ cùng storage. RDS for PostgreSQL là Postgres \"chuẩn\" trên EBS. Với dự án nhỏ và vừa, RDS thường đơn giản hơn; Aurora hợp khi cần nhiều replica, failover nhanh hơn hoặc Serverless v2."
        ]
      },
      {
        h: "Multi-AZ khác read replica",
        list: [
          "Multi-AZ (dạng instance standby): một bản standby đồng bộ ở AZ khác, không nhận truy vấn đọc. Khi primary lỗi, AWS chuyển DNS endpoint sang standby. Mục đích: sẵn sàng cao.",
          "Read replica: bản sao bất đồng bộ nhận truy vấn đọc, có endpoint riêng. Mục đích: giảm tải đọc. Vì bất đồng bộ nên có replication lag, đọc ngay sau khi ghi có thể thấy dữ liệu cũ.",
          "Backup tự động: snapshot hằng ngày + transaction log, cho phép khôi phục về một thời điểm bất kỳ trong khoảng retention. Khôi phục luôn tạo instance mới."
        ],
        p: [
          "Ứng dụng nên kết nối qua endpoint DNS và có retry khi mất kết nối, vì failover làm gián đoạn kết nối trong thời gian ngắn."
        ]
      },
      {
        h: "RDS bằng Terraform",
        p: [
          "`manage_master_user_password = true` để RDS tự sinh mật khẩu và lưu trong Secrets Manager, mật khẩu không nằm trong code hay state dưới dạng biến bạn tự đặt."
        ],
        code: {
          lang: "hcl", file: "rds.tf",
          src: `resource "aws_db_subnet_group" "db" {
  name       = "task-db"
  subnet_ids = var.private_subnet_ids
}

resource "aws_db_instance" "main" {
  identifier                  = "task-prod"
  engine                      = "postgres"
  engine_version              = "17"
  instance_class              = "db.t4g.medium"
  allocated_storage           = 50
  storage_encrypted           = true
  db_name                     = "tasks"
  username                    = "app"
  manage_master_user_password = true

  multi_az                = true
  backup_retention_period = 7
  deletion_protection     = true
  publicly_accessible     = false

  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = [aws_security_group.db.id]

  skip_final_snapshot       = false
  final_snapshot_identifier = "task-prod-final"
}`
        }
      },
      {
        h: "ElastiCache Redis",
        p: [
          "ElastiCache cung cấp Redis (và Valkey, bản fork mã nguồn mở của Redis) managed cho cache, session, rate limit, hàng đợi nhẹ. Bật replication group có replica ở AZ khác và automatic failover cho production. Đặt trong subnet private, bật mã hoá khi truyền (in-transit) và AUTH. Hãy nhớ cache có thể mất dữ liệu; đừng dùng nó làm nơi lưu trữ duy nhất cho dữ liệu quan trọng."
        ]
      }
    ],
    summary: [
      "RDS/Aurora lo backup, point-in-time recovery, vá lỗi và failover thay bạn.",
      "Multi-AZ để sẵn sàng cao (standby không nhận đọc); read replica để giảm tải đọc, có lag.",
      "Bật `storage_encrypted`, `deletion_protection`, không public, mật khẩu do RDS quản lý trong Secrets Manager.",
      "ElastiCache Redis/Valkey cho cache và session, không làm kho dữ liệu duy nhất."
    ],
    pitfalls: [
      "Nghĩ Multi-AZ giúp tăng hiệu năng đọc; standby instance không phục vụ truy vấn.",
      "Đọc từ read replica ngay sau khi ghi và thấy dữ liệu cũ; truy vấn cần nhất quán phải đọc từ primary.",
      "Chưa bao giờ thử khôi phục backup; hãy định kỳ restore sang instance mới để kiểm tra."
    ],
    quiz: [
      { q: "Mục đích chính của Multi-AZ (instance standby) trên RDS là gì?", options: ["Tăng throughput đọc", "Sẵn sàng cao: tự failover sang standby ở AZ khác", "Giảm chi phí", "Chạy nhiều engine cùng lúc"], answer: 1, explain: "Standby đồng bộ để failover, không nhận đọc. Tăng đọc là việc của read replica; Multi-AZ tốn thêm chi phí; không liên quan nhiều engine." },
      { q: "Người dùng cập nhật hồ sơ rồi tải lại trang thấy dữ liệu cũ. Ứng dụng đọc từ read replica. Nguyên nhân?", options: ["Backup đang chạy", "Replication bất đồng bộ nên replica bị lag", "Multi-AZ đang failover", "Security group chặn"], answer: 1, explain: "Read replica nhận thay đổi bất đồng bộ nên có độ trễ. Đọc ngay sau ghi nên đi tới primary. Backup và security group không gây dữ liệu cũ; failover sẽ gây lỗi kết nối chứ không phải dữ liệu cũ." },
      { q: "`manage_master_user_password = true` mang lại lợi ích gì?", options: ["Không cần mật khẩu", "RDS tự sinh và lưu mật khẩu trong Secrets Manager, không phải đặt trong code", "Mật khẩu được gửi qua email", "Tắt mã hoá"], answer: 1, explain: "RDS tạo và quản lý secret trong Secrets Manager; ứng dụng đọc secret đó. Vẫn có mật khẩu, không gửi email, và không liên quan mã hoá storage." }
    ]
  },
  "p09.m1.t5": {
    sections: [
      {
        h: "Luồng request qua các dịch vụ",
        p: [
          "Một luồng phổ biến: người dùng truy vấn `api.example.com` trên Route 53, nhận về địa chỉ của ALB (hoặc CloudFront). ALB kết thúc TLS bằng chứng chỉ ACM, rồi chuyển request tới target group gồm task ECS hoặc EC2 trong subnet private. Với frontend tĩnh, CloudFront phục vụ từ S3 và có thể chuyển `/api/*` về ALB."
        ],
        list: [
          "ALB (Application Load Balancer): cân bằng tải tầng 7, routing theo host/path/header, health check target, hỗ trợ HTTP/2, WebSocket, gRPC.",
          "Route 53: DNS managed, Alias record trỏ apex tới ALB/CloudFront, health check và routing policy (weighted, failover, latency).",
          "ACM: cấp chứng chỉ TLS công khai miễn phí cho dịch vụ tích hợp (ALB, CloudFront, API Gateway) và tự gia hạn. Không xuất được private key của chứng chỉ công khai để cài lên server của bạn.",
          "CloudFront: CDN, cache ở edge, gắn WAF, chứng chỉ phải nằm ở region `us-east-1`."
        ]
      },
      {
        h: "ACM + ALB + Route 53 bằng Terraform",
        p: [
          "ACM xác minh domain qua bản ghi DNS. Khi zone ở Route 53, Terraform có thể tạo bản ghi xác minh và chờ chứng chỉ được cấp."
        ],
        code: {
          lang: "hcl", file: "edge.tf",
          src: `resource "aws_acm_certificate" "api" {
  domain_name       = "api.example.com"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for o in aws_acm_certificate.api.domain_validation_options : o.domain_name => o
  }
  zone_id = var.zone_id
  name    = each.value.resource_record_name
  type    = each.value.resource_record_type
  records = [each.value.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.api.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_route53_record" "api" {
  zone_id = var.zone_id
  name    = "api.example.com"
  type    = "A"
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}`
        }
      },
      {
        h: "Health check và các đánh đổi",
        p: [
          "Target group health check quyết định target nào nhận traffic. Endpoint health nên nhẹ và phản ánh việc ứng dụng có phục vụ được không. Khi deploy, ALB rút dần kết nối khỏi target cũ theo `deregistration_delay`; ứng dụng cần xử lý SIGTERM để hoàn thành request đang chạy.",
          "ALB tính phí theo giờ và theo mức sử dụng (LCU), xem bảng giá chính thức. Nhiều service có thể dùng chung một ALB bằng listener rule theo host/path thay vì mỗi service một ALB."
        ]
      }
    ],
    summary: [
      "Route 53 → ALB (TLS bằng ACM) → target group trong subnet private là mô hình chuẩn.",
      "ACM cấp và tự gia hạn chứng chỉ cho ALB/CloudFront; chứng chỉ cho CloudFront phải ở `us-east-1`.",
      "Dùng Alias record để trỏ apex và subdomain tới ALB/CloudFront.",
      "Một ALB có thể phục vụ nhiều service qua listener rule."
    ],
    pitfalls: [
      "Tạo chứng chỉ ACM ở region của ứng dụng rồi gắn cho CloudFront và không thấy chứng chỉ; CloudFront chỉ dùng chứng chỉ ở `us-east-1`.",
      "Health check trỏ vào endpoint gọi DB và dịch vụ ngoài, khi phụ thuộc chậm mọi target bị đánh dấu unhealthy cùng lúc.",
      "Security group của app mở cho 0.0.0.0/0 thay vì chỉ cho security group của ALB."
    ],
    quiz: [
      { q: "Chứng chỉ ACM dùng cho CloudFront phải được tạo ở region nào?", options: ["Region gần người dùng nhất", "`us-east-1`", "Cùng region với origin", "Bất kỳ region nào"], answer: 1, explain: "CloudFront là dịch vụ toàn cầu và chỉ đọc chứng chỉ ACM ở `us-east-1`. Với ALB thì chứng chỉ phải ở cùng region với ALB." },
      { q: "Vì sao dùng Alias record thay vì bản ghi A với IP của ALB?", options: ["IP của ALB có thể thay đổi; Alias luôn trỏ tới đúng tên DNS của ALB", "Alias nhanh hơn", "ALB không có IP", "Bản ghi A không hỗ trợ IPv4"], answer: 0, explain: "ALB scale và đổi IP theo thời gian, nên không được hard-code IP. Alias giải quyết điều đó và dùng được ở apex. ALB có IP nhưng không cố định." },
      { q: "Trong mô hình Route 53 → ALB → ECS, TLS thường được kết thúc ở đâu?", options: ["Ở Route 53", "Ở ALB với chứng chỉ ACM", "Ở từng container", "Không cần TLS"], answer: 1, explain: "ALB kết thúc TLS với chứng chỉ ACM tự gia hạn. Route 53 chỉ trả lời DNS; container có thể dùng TLS nội bộ nếu yêu cầu tuân thủ, nhưng không phải mặc định." }
    ]
  },
  "p09.m1.t6": {
    sections: [
      {
        h: "CloudWatch: logs, metrics, alarms",
        p: [
          "CloudWatch là dịch vụ giám sát mặc định của AWS. Hầu hết dịch vụ tự đẩy metric (CPU của ECS service, số 5xx của ALB, số kết nối RDS). Container ghi log ra stdout và driver `awslogs` đẩy vào log group. Logs Insights cho phép truy vấn log bằng ngôn ngữ truy vấn riêng.",
          "Alarm theo dõi một metric và chuyển trạng thái `OK` → `ALARM` khi vượt ngưỡng trong số chu kỳ định trước, rồi gửi thông báo qua SNS (email, chat, PagerDuty). Hãy đặt alarm cho những dấu hiệu người dùng cảm nhận được: tỉ lệ 5xx, độ trễ p99, và cho những thứ sắp hết: dung lượng đĩa RDS, số kết nối."
        ],
        code: {
          lang: "hcl", file: "alarms.tf",
          src: `resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/task-api"
  retention_in_days = 30   # mặc định là giữ vĩnh viễn
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "task-api-5xx"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "HTTPCode_Target_5XX_Count"
  dimensions          = { LoadBalancer = aws_lb.main.arn_suffix }
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 5
  threshold           = 20
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}`
        }
      },
      {
        h: "Budgets: đặt ngay ngày đầu",
        p: [
          "Chi phí cloud tăng âm thầm: một NAT Gateway quên xoá, một instance lớn chạy thử, log không đặt retention, egress data tăng vọt. AWS Budgets gửi cảnh báo khi chi phí thực tế hoặc dự báo vượt ngưỡng. Hãy tạo budget ngay khi mở tài khoản, trước khi tạo tài nguyên đầu tiên. Lưu ý budget chỉ cảnh báo, không tự dừng tài nguyên.",
          "Bổ sung thêm: bật Cost Anomaly Detection, gắn tag `project`/`env` cho mọi tài nguyên (qua `default_tags` của provider) để xem chi phí theo dự án trong Cost Explorer."
        ],
        code: {
          lang: "hcl", file: "budget.tf",
          src: `resource "aws_budgets_budget" "monthly" {
  name         = "monthly-total"
  budget_type  = "COST"
  limit_amount = "50"        # ngưỡng do bạn chọn
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = ["ops@example.com"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = ["ops@example.com"]
  }
}`
        }
      },
      {
        h: "Giảm nhiễu cảnh báo",
        p: [
          "Alarm kêu liên tục mà không ai cần làm gì sẽ khiến đội bỏ qua cả alarm thật. Mỗi alarm cần: ngưỡng có ý nghĩa, số chu kỳ đủ dài để tránh báo động giả, và một hành động rõ ràng (runbook). Metric chi tiết và log dung lượng lớn đều có phí, xem bảng giá chính thức; hãy đặt retention cho log group."
        ]
      }
    ],
    summary: [
      "CloudWatch gom metric của dịch vụ AWS, log từ container và alarm gửi qua SNS.",
      "Alarm cho triệu chứng người dùng thấy (5xx, độ trễ) và tài nguyên sắp cạn.",
      "Tạo AWS Budgets ngay ngày đầu, cảnh báo cả chi phí dự báo lẫn thực tế; budget không tự dừng tài nguyên.",
      "Gắn tag cho mọi tài nguyên và đặt retention cho log group."
    ],
    pitfalls: [
      "Log group không đặt retention, giữ log vĩnh viễn và chi phí lưu trữ tăng dần mỗi tháng.",
      "Nghĩ rằng budget sẽ tự tắt tài nguyên khi vượt ngưỡng; mặc định nó chỉ gửi thông báo.",
      "Alarm với `evaluation_periods = 1` trên metric dao động mạnh, báo động giả liên tục."
    ],
    quiz: [
      { q: "Khi chi phí vượt ngưỡng AWS Budgets, điều gì xảy ra theo mặc định?", options: ["Tài khoản bị khoá", "Mọi tài nguyên bị dừng", "Gửi thông báo tới người đăng ký", "AWS tự giảm giá"], answer: 2, explain: "Budget mặc định chỉ gửi cảnh báo (email/SNS). Muốn tự động hành động phải cấu hình thêm budget action. Tài khoản không bị khoá và tài nguyên không tự dừng." },
      { q: "Vì sao nên đặt notification `FORECASTED` bên cạnh `ACTUAL`?", options: ["Để được giảm giá", "Để biết sớm khi tốc độ chi tiêu dự báo sẽ vượt ngưỡng trước khi thật sự vượt", "Vì ACTUAL không hoạt động", "Để tắt cảnh báo"], answer: 1, explain: "Dự báo cho bạn thời gian phản ứng trước khi hoá đơn thật vượt ngưỡng. ACTUAL vẫn hoạt động nhưng chỉ báo khi đã vượt." },
      { q: "Alarm nào hữu ích nhất cho một API công khai?", options: ["CPU > 10% trong 1 phút", "Số response 5xx cao kéo dài nhiều phút", "Có một dòng log mới", "Số lần deploy trong ngày"], answer: 1, explain: "5xx kéo dài là triệu chứng người dùng thực sự bị ảnh hưởng. CPU 10% là bình thường; mỗi dòng log hay số lần deploy không cần đánh thức ai." }
    ]
  },
  "p09.m1.t7": {
    sections: [
      {
        h: "GCP và Azure: khái niệm tương đương",
        p: [
          "Ba cloud lớn có mô hình rất giống nhau, kiến thức AWS chuyển sang được phần lớn. Khác biệt nằm ở tên gọi, mô hình IAM và cách tổ chức tài nguyên (GCP dùng project, Azure dùng subscription và resource group)."
        ],
        list: [
          "Máy ảo: EC2 ~ Compute Engine ~ Azure Virtual Machines.",
          "Container không quản server: ECS Fargate ~ Cloud Run ~ Azure Container Apps.",
          "Kubernetes managed: EKS ~ GKE ~ AKS.",
          "Serverless function: Lambda ~ Cloud Functions (Cloud Run functions) ~ Azure Functions.",
          "Object storage: S3 ~ Cloud Storage ~ Blob Storage.",
          "Postgres managed: RDS/Aurora ~ Cloud SQL/AlloyDB ~ Azure Database for PostgreSQL."
        ]
      },
      {
        h: "PaaS cho dự án nhỏ",
        p: [
          "Render, Railway, Fly.io, DigitalOcean App Platform, Heroku cho phép deploy từ Git repo hoặc Dockerfile, có sẵn HTTPS, domain, Postgres managed, log và biến môi trường. Bạn không phải thiết kế VPC, IAM, load balancer. Với MVP, side project hay đội một hai người, đây thường là lựa chọn nhanh nhất để ra sản phẩm.",
          "Đánh đổi: ít tùy biến mạng và bảo mật (private network, compliance), giới hạn vùng triển khai, chi phí khi scale lớn có thể cao hơn tự quản, và bị phụ thuộc vào nền tảng. Một VPS (DigitalOcean Droplet, Hetzner, Lightsail) với Docker Compose và Nginx cũng là lựa chọn rẻ và dễ hiểu, nhưng bạn tự lo vá OS, backup, và nó là một điểm lỗi duy nhất."
        ]
      },
      {
        h: "Cách chọn",
        p: [
          "Đừng chọn cloud theo cảm tính. Hãy trả lời vài câu hỏi rồi mới quyết định. Dù chọn gì, giữ ứng dụng theo nguyên tắc 12-factor (cấu hình qua biến môi trường, stateless, log ra stdout) và đóng gói bằng container; việc chuyển nền tảng sau này sẽ nhẹ hơn nhiều."
        ],
        list: [
          "Đội có ai đã vận hành cloud đó chưa? Kinh nghiệm quan trọng hơn khác biệt tính năng.",
          "Có yêu cầu về vị trí dữ liệu, compliance, mạng riêng tới hệ thống khác không?",
          "Công ty đã có hợp đồng, credit, hay hệ thống sẵn trên cloud nào?",
          "Quy mô dự kiến trong 12 tháng tới: PaaS đủ dùng hay cần hạ tầng tuỳ biến?"
        ]
      }
    ],
    summary: [
      "AWS, GCP, Azure có dịch vụ tương đương cho máy ảo, container, Kubernetes, storage, DB.",
      "PaaS (Render, Railway, Fly.io...) nhanh nhất cho dự án nhỏ, đổi lại ít kiểm soát và phụ thuộc nền tảng.",
      "Chọn dựa trên kinh nghiệm đội, yêu cầu compliance và hệ sinh thái sẵn có.",
      "12-factor + container giúp chuyển nền tảng dễ hơn."
    ],
    pitfalls: [
      "Dựng VPC, EKS, multi-AZ cho một MVP chưa có người dùng: tốn thời gian và chi phí vận hành không cần thiết.",
      "Dùng sâu dịch vụ độc quyền của một PaaS (hàng đợi, auth riêng) mà không có lớp trừu tượng, khó rời đi sau này.",
      "Chạy production trên một VPS duy nhất mà không có backup tự động ra ngoài máy."
    ],
    quiz: [
      { q: "Dịch vụ nào của GCP tương đương gần nhất với ECS Fargate?", options: ["Compute Engine", "Cloud Run", "Cloud Storage", "BigQuery"], answer: 1, explain: "Cloud Run chạy container không cần quản server. Compute Engine là máy ảo; Cloud Storage là object storage; BigQuery là data warehouse." },
      { q: "Khi nào PaaS như Render/Railway là lựa chọn hợp lý?", options: ["Khi cần tùy biến mạng phức tạp và compliance chặt", "Khi làm MVP với đội nhỏ, cần ra sản phẩm nhanh", "Khi chạy hàng nghìn service", "Khi cần GPU tùy chỉnh"], answer: 1, explain: "PaaS giảm gần hết việc vận hành, rất hợp giai đoạn đầu. Các trường hợp còn lại cần mức kiểm soát mà cloud lớn đáp ứng tốt hơn." },
      { q: "Thực hành nào giúp ứng dụng dễ chuyển giữa các nền tảng nhất?", options: ["Hard-code endpoint DB trong code", "Đóng gói container, cấu hình qua biến môi trường, stateless", "Lưu file upload trên đĩa local", "Dùng SDK độc quyền ở mọi nơi"], answer: 1, explain: "Container và 12-factor tách ứng dụng khỏi nền tảng. Hard-code cấu hình, lưu file local và phụ thuộc SDK độc quyền đều khiến việc chuyển đổi khó hơn." }
    ]
  },
  "p09.m2.t0": {
    sections: [
      {
        h: "Khai báo trạng thái mong muốn",
        p: [
          "Terraform là công cụ Infrastructure as Code theo kiểu khai báo (declarative). Bạn không viết \"tạo bucket, rồi bật versioning\", mà mô tả \"phải tồn tại một bucket có versioning\". Terraform so sánh mô tả đó với state và hạ tầng thật, rồi tự tính ra cần tạo, sửa hay xoá gì. Kết quả hiển thị ở `terraform plan`, và chỉ thực thi khi bạn `apply`.",
          "Provider là plugin nói chuyện với API của một nền tảng (AWS, Cloudflare, GitHub, Kubernetes). Resource là một đối tượng Terraform quản lý vòng đời. Data source chỉ đọc thông tin có sẵn (ví dụ AMI mới nhất, zone Route 53) mà không quản lý nó. Terraform tự suy ra thứ tự tạo từ tham chiếu giữa các resource."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `terraform init        # tải provider, cấu hình backend
terraform fmt         # định dạng code
terraform validate    # kiểm tra cú pháp và kiểu
terraform plan        # xem thay đổi dự kiến
terraform apply       # thực thi (hỏi xác nhận)
terraform output bucket_name`
        }
      },
      {
        h: "Biến, locals, output",
        list: [
          "`variable`: tham số đầu vào, có `type`, `default`, `validation`, và `sensitive` để ẩn khỏi output của plan.",
          "`locals`: giá trị trung gian tính trong module, tránh lặp biểu thức.",
          "`output`: giá trị xuất ra cho người dùng hoặc module khác (ID VPC, endpoint DB)."
        ],
        p: [
          "Ví dụ dưới đây có đủ các thành phần. Chú ý cú pháp nội suy `\${...}` bên trong chuỗi, và việc tham chiếu `aws_s3_bucket.assets.id` tạo ra phụ thuộc ngầm: versioning chỉ được tạo sau khi bucket đã có."
        ],
        code: {
          lang: "hcl", file: "main.tf",
          src: `terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
}

provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "ap-southeast-1"
}

variable "env" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env phải là dev, staging hoặc prod."
  }
}

locals {
  name = "task-\${var.env}"
  tags = { project = "task-api", env = var.env }
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "assets" {
  bucket = "\${local.name}-assets-\${data.aws_caller_identity.current.account_id}"
  tags   = local.tags
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}

output "bucket_name" {
  value = aws_s3_bucket.assets.bucket
}`
        }
      },
      {
        h: "Ràng buộc phiên bản và lock file",
        p: [
          "`version = \"~> 6.0\"` cho phép mọi bản 6.x nhưng không lên 7.0, nơi có thể có thay đổi phá vỡ. `terraform init` ghi phiên bản chính xác và checksum vào `.terraform.lock.hcl`; hãy commit file này để mọi người và CI dùng cùng provider. Thư mục `.terraform/` thì không commit.",
          "So với script gọi CLI tuần tự, cách khai báo có lợi là chạy lại bao nhiêu lần cũng ra cùng kết quả (idempotent), và plan cho bạn xem trước tác động trước khi động vào hạ tầng thật."
        ]
      }
    ],
    summary: [
      "Terraform khai báo trạng thái mong muốn; plan cho biết sẽ tạo/sửa/xoá gì trước khi apply.",
      "Provider nói chuyện với API; resource được quản lý vòng đời; data source chỉ đọc.",
      "`variable` là đầu vào, `locals` là giá trị trung gian, `output` là đầu ra.",
      "Ghim provider bằng `~>` và commit `.terraform.lock.hcl`."
    ],
    pitfalls: [
      "Đọc lướt plan rồi apply: một thay đổi thuộc tính có thể buộc \"destroy and then create replacement\" với DB. Luôn tìm dòng `must be replaced`.",
      "Không ghim version provider, CI tự lên major mới và plan bất ngờ thay đổi hàng loạt.",
      "Đặt mật khẩu làm `default` của biến trong code; dùng Secrets Manager hoặc biến môi trường `TF_VAR_...`."
    ],
    quiz: [
      { q: "Khác biệt giữa `resource` và `data` trong Terraform?", options: ["Không khác gì", "`resource` được Terraform tạo và quản lý vòng đời; `data` chỉ đọc thông tin đã có", "`data` nhanh hơn", "`data` chỉ dùng cho biến"], answer: 1, explain: "Data source truy vấn tài nguyên có sẵn mà không tạo hay xoá nó. Resource thì Terraform chịu trách nhiệm tạo, cập nhật, xoá." },
      { q: "`version = \"~> 6.0\"` cho phép những phiên bản nào?", options: ["Chỉ 6.0.0", "6.x (>= 6.0, < 7.0)", "Mọi phiên bản >= 6.0", "Chỉ 6.0.x"], answer: 1, explain: "`~>` chỉ cho phép phần cuối cùng được chỉ định tăng: `~> 6.0` nghĩa là >= 6.0 và < 7.0. Nếu viết `~> 6.0.0` thì mới là chỉ 6.0.x." },
      { q: "File nào nên commit vào Git?", options: ["`.terraform/`", "`terraform.tfstate`", "`.terraform.lock.hcl`", "`tfplan` chứa giá trị nhạy cảm"], answer: 2, explain: "Lock file đảm bảo mọi người dùng cùng phiên bản provider. `.terraform/` là cache tải về; state và plan file có thể chứa secret, không commit." }
    ]
  },
  "p09.m2.t1": {
    sections: [
      {
        h: "State là gì và vì sao quan trọng",
        p: [
          "State (`terraform.tfstate`) là bản ghi ánh xạ giữa resource trong code và đối tượng thật trên cloud, ví dụ `aws_s3_bucket.assets` tương ứng bucket có ID nào. Terraform dựa vào state để biết cái gì nó đang quản lý, tính diff khi plan, và biết thứ tự xoá. Mất state thì Terraform \"quên\" hạ tầng: lần apply sau nó sẽ cố tạo mới và đụng lỗi trùng tên, hoặc để lại tài nguyên mồ côi.",
          "State lưu thuộc tính của resource dạng văn bản thuần, bao gồm cả giá trị nhạy cảm như mật khẩu DB được sinh ra. `sensitive = true` chỉ ẩn khỏi màn hình, không ẩn khỏi state. Vì vậy state không bao giờ được commit vào Git và phải được lưu ở nơi có mã hoá, giới hạn quyền truy cập."
        ]
      },
      {
        h: "Remote state trên S3 với state locking",
        p: [
          "Khi làm việc nhóm, state phải nằm ở một chỗ chung. Backend S3 là lựa chọn phổ biến trên AWS. Để tránh hai người apply cùng lúc làm hỏng state, cần locking. Từ Terraform 1.10, S3 backend hỗ trợ khoá trực tiếp bằng file lock trên S3 với `use_lockfile = true`; cách cũ dùng bảng DynamoDB (`dynamodb_table`) đã bị deprecated.",
          "Bucket state nên bật versioning để khôi phục bản trước nếu state bị hỏng hoặc bị ghi nhầm, bật mã hoá và chặn public access. Bucket này thường được tạo một lần bằng tay hoặc bằng một cấu hình bootstrap riêng."
        ],
        code: {
          lang: "hcl", file: "backend.tf",
          src: `terraform {
  required_version = ">= 1.10"
  backend "s3" {
    bucket       = "myorg-tfstate"
    key          = "task-api/staging.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true   # khoá bằng S3, không cần DynamoDB
  }
}`
        }
      },
      {
        h: "Thao tác với state an toàn",
        p: [
          "Bạn hiếm khi cần sửa state, và không bao giờ sửa file JSON bằng tay. Terraform có lệnh riêng. Khi đổi tên resource trong code, dùng khối `moved` để Terraform hiểu đó là cùng một đối tượng thay vì xoá rồi tạo lại."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `terraform state list
terraform state show aws_s3_bucket.assets
terraform state rm aws_s3_bucket.legacy     # ngừng quản lý, KHÔNG xoá trên cloud

# Nếu lock bị kẹt do tiến trình chết giữa chừng (chắc chắn không ai đang chạy):
terraform force-unlock <LOCK_ID>`
        }
      }
    ],
    summary: [
      "State ánh xạ code với tài nguyên thật; mất state là Terraform mất khả năng quản lý.",
      "State chứa secret dạng rõ: không commit, lưu ở backend mã hoá, giới hạn quyền.",
      "S3 backend với `use_lockfile = true` (Terraform >= 1.10) để khoá; `dynamodb_table` đã deprecated.",
      "Bật versioning cho bucket state; dùng `moved`, `state rm` thay vì sửa JSON tay."
    ],
    pitfalls: [
      "Commit `terraform.tfstate` lên Git làm lộ mật khẩu DB và gây xung đột state giữa các thành viên.",
      "Chạy `force-unlock` khi đồng nghiệp đang apply, dẫn tới hai tiến trình cùng ghi state.",
      "Đổi tên resource mà không có khối `moved`, plan đòi destroy rồi tạo lại (với DB là mất dữ liệu)."
    ],
    quiz: [
      { q: "Từ Terraform 1.10, cách khuyến nghị để khoá state trên S3 backend là gì?", options: ["`dynamodb_table`", "`use_lockfile = true`", "Không cần khoá", "Dùng Git lock"], answer: 1, explain: "S3 native lock qua `use_lockfile` thay cho DynamoDB, vốn đã deprecated. Không khoá thì apply đồng thời có thể làm hỏng state; Git không liên quan tới cơ chế lock của backend." },
      { q: "Vì sao không commit state vào Git dù đã đánh dấu biến `sensitive`?", options: ["File quá lớn", "`sensitive` chỉ ẩn khỏi output; state vẫn chứa giá trị dạng rõ", "Git không đọc được JSON", "State tự mã hoá"], answer: 1, explain: "`sensitive` chỉ ảnh hưởng hiển thị. State local không tự mã hoá; mã hoá đến từ backend. Kích thước và định dạng không phải vấn đề chính." },
      { q: "`terraform state rm aws_s3_bucket.legacy` làm gì?", options: ["Xoá bucket trên AWS", "Bỏ resource khỏi state, bucket trên AWS vẫn còn", "Đổi tên bucket", "Khôi phục bucket"], answer: 1, explain: "`state rm` chỉ khiến Terraform ngừng quản lý đối tượng; tài nguyên thật không bị động tới. Muốn xoá thật thì bỏ khỏi code rồi apply, hoặc dùng `destroy`." }
    ]
  },
  "p09.m2.t2": {
    sections: [
      {
        h: "Module: đóng gói hạ tầng tái sử dụng",
        p: [
          "Mọi thư mục chứa file `.tf` đều là một module. Thư mục bạn chạy `terraform apply` là root module; nó gọi các child module bằng khối `module`. Module gom một nhóm resource liên quan (VPC, ECS service, RDS) sau một giao diện gọn: biến đầu vào và output. Nhờ vậy dev, staging, prod dùng cùng một logic, chỉ khác tham số.",
          "Một module tốt giống một hàm tốt: làm một việc rõ ràng, có giá trị mặc định an toàn (mã hoá bật, không public), expose vừa đủ biến, và output những gì module khác cần như ID, ARN, security group."
        ],
        code: {
          lang: "text", file: "cấu trúc thư mục",
          src: `infra/
├── modules/
│   ├── rds-postgres/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── ecs-service/
└── envs/
    ├── staging/main.tf
    └── prod/main.tf`
        }
      },
      {
        h: "Viết và gọi module",
        code: {
          lang: "hcl", file: "modules/rds-postgres (rút gọn) và envs/staging/main.tf",
          src: `# modules/rds-postgres/variables.tf
variable "name"           { type = string }
variable "vpc_id"         { type = string }
variable "subnet_ids"     { type = list(string) }
variable "allowed_sg_ids" { type = list(string) }
variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

# modules/rds-postgres/outputs.tf
output "endpoint"   { value = aws_db_instance.this.address }
output "secret_arn" { value = aws_db_instance.this.master_user_secret[0].secret_arn }

# envs/staging/main.tf
module "db" {
  source         = "../../modules/rds-postgres"
  name           = "task-staging"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnets
  allowed_sg_ids = [module.app.service_sg_id]
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"
  name    = "task-staging"
  cidr    = "10.0.0.0/16"
  azs             = ["ap-southeast-1a", "ap-southeast-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]
  enable_nat_gateway = true
  single_nat_gateway = true
}`
        },
        p: [
          "Output của module được tham chiếu bằng `module.<tên>.<output>`. Sau khi thêm hoặc đổi `source`, chạy lại `terraform init` để tải module."
        ]
      },
      {
        h: "Module từ registry: dùng thế nào cho an toàn",
        p: [
          "Terraform Registry có nhiều module cộng đồng chất lượng, ví dụ `terraform-aws-modules/vpc/aws` trong Lab 05. Dùng chúng giúp tiết kiệm nhiều công và đã được nhiều người kiểm chứng. Tuy nhiên luôn ghim `version`, đọc biến và giá trị mặc định trước khi dùng, và xem changelog khi nâng major.",
          "Đừng lạm dụng module: bọc một resource duy nhất vào module chỉ để đổi tên biến thường làm code khó đọc hơn. Tránh lồng module quá nhiều tầng khiến việc debug plan trở nên khó.",
          "Khi có nhiều repo cùng dùng một module nội bộ, hãy tách module ra repo riêng và tham chiếu theo tag Git, ví dụ `source = \"git::https://github.com/my-org/tf-modules.git//rds-postgres?ref=v1.3.0\"`. Mỗi môi trường có thể nâng phiên bản module riêng: staging lên `v1.4.0` trước, chạy ổn rồi mới đến prod. Nhờ vậy một thay đổi trong module không lan ngay ra mọi môi trường cùng lúc."
        ]
      }
    ],
    summary: [
      "Mỗi thư mục `.tf` là một module; root module gọi child module qua khối `module`.",
      "Giao diện module gồm biến đầu vào và output; mặc định nên an toàn.",
      "Luôn ghim `version` khi dùng module từ registry và đọc giá trị mặc định.",
      "Tham chiếu output bằng `module.<tên>.<output>`; đổi source thì chạy lại `init`."
    ],
    pitfalls: [
      "Dùng module registry không ghim version, lần `init` sau kéo major mới và plan thay đổi hạ tầng hàng loạt.",
      "Module expose hàng chục biến cho mọi thuộc tính, trở thành bản sao rườm rà của resource gốc.",
      "Đổi tên khối `module` trong code mà không thêm `moved`, Terraform đòi tạo lại mọi thứ bên trong."
    ],
    quiz: [
      { q: "Trong Terraform, \"root module\" là gì?", options: ["Module trên registry", "Thư mục nơi bạn chạy `terraform plan/apply`", "Module do HashiCorp viết", "File `main.tf` duy nhất"], answer: 1, explain: "Root module là thư mục làm việc hiện tại; nó gọi các child module. Không liên quan tới registry hay tác giả, và root module có thể gồm nhiều file." },
      { q: "Làm sao module ứng dụng lấy được endpoint DB từ module `db`?", options: ["Đọc trực tiếp resource bên trong module", "Module `db` khai báo `output`, rồi dùng `module.db.endpoint`", "Dùng biến môi trường", "Không thể"], answer: 1, explain: "Resource bên trong module bị đóng gói; chỉ output mới truy cập được từ bên ngoài qua `module.<tên>.<output>`." },
      { q: "Vì sao phải ghim `version` cho module registry?", options: ["Để tải nhanh hơn", "Để tránh tự động kéo phiên bản mới có thay đổi phá vỡ", "Vì registry yêu cầu", "Để giảm chi phí AWS"], answer: 1, explain: "Không ghim, `init` có thể kéo bản mới nhất với thay đổi biến hoặc resource. Ghim giúp thay đổi có kiểm soát; không liên quan tốc độ hay chi phí." }
    ]
  },
  "p09.m2.t3": {
    sections: [
      {
        h: "Hai cách tách môi trường",
        p: [
          "dev, staging và prod phải có state riêng, để một lỗi ở dev không thể phá prod. Có hai cách phổ biến."
        ],
        list: [
          "Thư mục riêng cho mỗi env (`envs/dev`, `envs/staging`, `envs/prod`): mỗi thư mục có backend key riêng, gọi chung các module. Rõ ràng khi đọc code, có thể khác biệt cấu trúc giữa env (prod có thêm WAF), dễ phân quyền CI theo thư mục. Đây là cách được dùng nhiều nhất cho môi trường dài hạn.",
          "Terraform workspace: cùng một code, nhiều state (`terraform workspace new staging`). Nhanh, ít file, hợp với môi trường tạm (preview theo PR). Nhược điểm: dễ quên đang ở workspace nào, cùng một backend và thường cùng credential nên khó tách quyền giữa prod và dev."
        ]
      },
      {
        h: "tfvars cho khác biệt tham số",
        p: [
          "Khác biệt giữa env thường chỉ là tham số: kích thước instance, số replica, Multi-AZ. Đặt chúng trong file `.tfvars`. Terraform tự nạp `terraform.tfvars` và `*.auto.tfvars`; file khác phải truyền bằng `-var-file`.",
          "Không đặt secret trong tfvars được commit. Secret lấy từ Secrets Manager qua data source, hoặc truyền bằng biến môi trường `TF_VAR_<tên>` trong CI.",
          "Giữ khác biệt giữa các env ở mức tham số càng nhiều càng tốt. Nếu staging và prod khác nhau về cấu trúc (prod có thêm replica DB, WAF), staging không còn phản ánh đúng prod và lỗi chỉ lộ ra khi lên production."
        ],
        code: {
          lang: "hcl", file: "envs/prod/terraform.tfvars",
          src: `env            = "prod"
instance_class = "db.r7g.large"
multi_az       = true
desired_count  = 4
single_nat     = false   # một NAT mỗi AZ cho production`
        }
      },
      {
        h: "Chạy theo môi trường",
        code: {
          lang: "bash", file: "terminal",
          src: `# Cách thư mục
cd infra/envs/staging
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Cách workspace (cho môi trường tạm)
terraform workspace new pr-123
terraform apply -var-file=preview.tfvars
terraform destroy -var-file=preview.tfvars
terraform workspace select default
terraform workspace delete pr-123`
        },
        p: [
          "Mạnh nhất là tách luôn tài khoản AWS cho prod và non-prod (AWS Organizations). Khi đó credential dev không có quyền gì trên prod, giới hạn thiệt hại khi có sai sót. Trong code, dùng `terraform.workspace` hoặc biến `env` để đặt tên tài nguyên khác nhau, tránh trùng tên bucket giữa các env."
        ]
      }
    ],
    summary: [
      "Mỗi môi trường phải có state riêng.",
      "Thư mục riêng cho env dài hạn; workspace hợp với môi trường tạm.",
      "Khác biệt tham số đặt trong `.tfvars`; secret không nằm trong tfvars được commit.",
      "Tách tài khoản AWS giữa prod và non-prod để giới hạn thiệt hại."
    ],
    pitfalls: [
      "Chạy `apply` khi đang ở nhầm workspace, thay đổi dành cho dev áp lên prod. Luôn kiểm tra `terraform workspace show`.",
      "Copy-paste toàn bộ resource giữa các thư mục env thay vì gọi module chung, các env dần lệch nhau.",
      "Commit `prod.tfvars` chứa mật khẩu DB."
    ],
    quiz: [
      { q: "Vì sao thư mục riêng cho mỗi env thường được ưa chuộng cho prod?", options: ["Chạy nhanh hơn", "Rõ ràng, backend key riêng, dễ phân quyền CI và cho phép khác biệt cấu trúc", "Workspace không có state", "Vì Terraform không hỗ trợ workspace với S3"], answer: 1, explain: "Thư mục riêng làm môi trường hiển hiện trong code và pipeline. Workspace vẫn có state riêng và hỗ trợ S3 backend; tốc độ không khác biệt." },
      { q: "Terraform tự động nạp file nào mà không cần `-var-file`?", options: ["`prod.tfvars`", "`terraform.tfvars` và `*.auto.tfvars`", "Mọi file `.tfvars`", "`variables.tf`"], answer: 1, explain: "Chỉ `terraform.tfvars` (và `.json`) cùng `*.auto.tfvars` được nạp tự động. File tên khác phải truyền `-var-file`. `variables.tf` là nơi khai báo biến, không phải giá trị." },
      { q: "Cách nào an toàn để truyền mật khẩu vào Terraform trong CI?", options: ["Ghi vào tfvars và commit", "Biến môi trường `TF_VAR_db_password` từ secret của CI hoặc đọc Secrets Manager", "Đặt làm default của biến", "Ghi trong README"], answer: 1, explain: "Secret nên đến từ kho secret lúc chạy. Commit hay đặt default đều đưa secret vào Git." }
    ]
  },
  "p09.m2.t4": {
    sections: [
      {
        h: "Pipeline Terraform theo PR",
        p: [
          "Thay đổi hạ tầng nên đi qua cùng quy trình như code: pull request, review, tự động kiểm tra. Mô hình phổ biến là: khi mở PR, CI chạy kiểm tra tĩnh và `terraform plan`, đăng kết quả plan vào PR để reviewer thấy chính xác tài nguyên nào bị tạo, sửa, xoá. Khi PR merge vào main, CI chạy `apply` với đúng file plan đã lưu, qua một bước duyệt thủ công (GitHub environment có required reviewers) cho môi trường quan trọng."
        ],
        list: [
          "`terraform fmt -check -recursive`: định dạng thống nhất.",
          "`terraform validate`: cú pháp và kiểu dữ liệu.",
          "`tflint`: lỗi mà validate bỏ qua, ví dụ loại instance không tồn tại, biến khai báo nhưng không dùng.",
          "`checkov` hoặc `trivy config`: quét cấu hình sai về bảo mật như bucket public, security group mở 0.0.0.0/0, DB không mã hoá."
        ]
      },
      {
        h: "Workflow GitHub Actions",
        p: [
          "CI nhận credential AWS qua OIDC (`id-token: write`), không có access key lưu sẵn. Nên dùng role plan chỉ đọc cho PR và role apply có quyền ghi chỉ dùng trong job apply. Lab 05 có workflow đầy đủ; dưới đây là phần cốt lõi."
        ],
        code: {
          lang: "yaml", file: ".github/workflows/terraform.yml",
          src: `name: Terraform
on:
  pull_request:
    paths: ["infra/**"]
  push:
    branches: [main]
    paths: ["infra/**"]

jobs:
  plan:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read, pull-requests: write }
    defaults: { run: { working-directory: infra/envs/staging } }
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: hashicorp/setup-terraform@dfe3c3f87815947d99a8997f908cb6525fc44e9e # v4.0.1
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0
        with:
          role-to-assume: \${{ vars.AWS_TF_PLAN_ROLE_ARN }}
          aws-region: ap-southeast-1
      - run: terraform fmt -check -recursive
      - run: terraform init -input=false
      - run: terraform validate
      - run: terraform plan -input=false -no-color -out=tfplan
      - run: terraform show -no-color tfplan > plan.txt
      - if: github.event_name == 'pull_request'
        run: gh pr comment \${{ github.event.pull_request.number }} --body-file plan.txt
        env:
          GH_TOKEN: \${{ github.token }}`
        }
      },
      {
        h: "Apply có kiểm soát",
        p: [
          "Apply từ đúng file plan đã review (`terraform apply tfplan`) đảm bảo thứ được áp là thứ đã được xem. Nếu có thay đổi khác lọt vào giữa chừng, plan file cũ sẽ bị từ chối vì state đã khác. Plan file có thể chứa giá trị nhạy cảm, nên chỉ lưu dưới dạng artifact nội bộ trong thời gian ngắn.",
          "Không ai nên apply prod từ laptop. Quyền ghi hạ tầng prod chỉ dành cho role của pipeline, người chỉ có quyền đọc và \"break-glass\" khi khẩn cấp. Các action được ghim theo commit SHA (kèm comment phiên bản) như Lab 05 để tránh bị thay code phía sau một tag."
        ]
      }
    ],
    summary: [
      "PR chạy fmt, validate, tflint, checkov và plan; plan được đăng vào PR để review.",
      "Merge vào main thì apply đúng plan đã lưu, qua environment có duyệt.",
      "CI dùng OIDC, tách role plan (đọc) và role apply (ghi).",
      "Không apply prod từ máy cá nhân."
    ],
    pitfalls: [
      "Chạy `terraform apply -auto-approve` trên main mà không dùng plan đã review, thay đổi khác với thứ reviewer thấy.",
      "Đăng plan chứa giá trị nhạy cảm công khai trong PR của repo public.",
      "Cho role của PR (kể cả PR từ fork) quyền ghi hạ tầng."
    ],
    quiz: [
      { q: "Vì sao nên `terraform apply tfplan` thay vì `terraform apply` chạy lại plan?", options: ["Nhanh hơn", "Đảm bảo thứ được áp dụng đúng là plan đã review", "Không cần state", "Không cần credential"], answer: 1, explain: "Plan file cố định tập thay đổi đã được duyệt; chạy plan mới có thể ra kết quả khác nếu hạ tầng hoặc code đã đổi. Vẫn cần state và credential." },
      { q: "Công cụ nào phát hiện security group mở 0.0.0.0/0 cho cổng 22 trong code Terraform?", options: ["`terraform fmt`", "`checkov`", "`terraform output`", "`terraform init`"], answer: 1, explain: "Checkov (hoặc trivy config) quét cấu hình theo bộ quy tắc bảo mật. `fmt` chỉ định dạng, `output` in giá trị, `init` tải provider." },
      { q: "CI nên lấy credential AWS thế nào?", options: ["Access key của admin trong secrets", "OIDC assume role, tách role plan và apply", "Hard-code trong workflow", "Dùng root"], answer: 1, explain: "OIDC cấp credential tạm thời, trust policy có thể giới hạn repo và branch; tách role giúp PR không có quyền ghi." }
    ]
  },
  "p09.m2.t5": {
    sections: [
      {
        h: "Drift là gì",
        p: [
          "Drift xảy ra khi hạ tầng thật khác với code và state: ai đó sửa security group trên console lúc xử lý sự cố, một script tự thay đổi tag, AWS thay đổi giá trị mặc định. Lần `plan` tiếp theo, Terraform sẽ muốn đưa mọi thứ về đúng code, tức là âm thầm hoàn tác sửa đổi thủ công đó, có thể gây sự cố lần hai.",
          "Phát hiện drift sớm giúp bạn quyết định: đưa thay đổi vào code (nếu nó đúng) hoặc để Terraform hoàn tác (nếu nó sai)."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `# Chỉ cập nhật state theo thực tế, không đổi hạ tầng; xem Terraform phát hiện gì
terraform plan -refresh-only

# Dùng trong job định kỳ: exit code 0 = không đổi, 1 = lỗi, 2 = có thay đổi
terraform plan -detailed-exitcode -input=false`
        }
      },
      {
        h: "Chạy kiểm tra drift định kỳ",
        p: [
          "Đặt một job CI chạy theo lịch (ví dụ mỗi sáng) với `-detailed-exitcode`. Nếu exit code là 2, gửi cảnh báo vào kênh chat của đội. Kết hợp với chính sách: mọi thay đổi khẩn cấp trên console phải được đưa vào code trong ngày. Một số tài nguyên có thuộc tính thay đổi ngoài ý muốn hợp lệ (ví dụ `desired_count` do autoscaling điều chỉnh); dùng `lifecycle { ignore_changes = [desired_count] }` để Terraform không kéo lại."
        ]
      },
      {
        h: "Import tài nguyên có sẵn",
        p: [
          "Nhiều hệ thống có tài nguyên tạo tay từ trước khi dùng Terraform. Import đưa chúng vào state để quản lý tiếp mà không tạo lại. Từ Terraform 1.5 có khối `import` khai báo ngay trong code, đi qua plan như mọi thay đổi khác, và có thể sinh sẵn code cấu hình bằng `-generate-config-out`. Lệnh cũ `terraform import` vẫn dùng được nhưng không có bước plan để review.",
          "Sau khi import, chạy plan cho đến khi báo không có thay đổi: nghĩa là code đã khớp thực tế. Code sinh tự động thường dài và cần dọn lại cho gọn trước khi commit."
        ],
        code: {
          lang: "hcl", file: "imports.tf",
          src: `import {
  to = aws_s3_bucket.legacy_uploads
  id = "myorg-legacy-uploads"
}

# Lần đầu: terraform plan -generate-config-out=generated.tf
# Sau đó rà soát generated.tf, chuyển vào file chính, rồi:
# terraform plan   (mong đợi: 1 to import, 0 to add, 0 to change, 0 to destroy)
# terraform apply`
        }
      }
    ],
    summary: [
      "Drift là khác biệt giữa hạ tầng thật và code; plan tiếp theo sẽ hoàn tác sửa đổi thủ công.",
      "`plan -refresh-only` để xem drift, `-detailed-exitcode` để tự động hoá kiểm tra định kỳ.",
      "`ignore_changes` cho thuộc tính được hệ thống khác điều chỉnh hợp lệ.",
      "Khối `import` (Terraform >= 1.5) đưa tài nguyên có sẵn vào quản lý qua plan có review."
    ],
    pitfalls: [
      "Sửa khẩn cấp trên console rồi quên, lần apply sau Terraform âm thầm hoàn tác và sự cố quay lại.",
      "Import xong apply ngay khi plan vẫn còn thay đổi, vô tình sửa cấu hình tài nguyên production.",
      "Lạm dụng `ignore_changes` cho mọi thuộc tính, Terraform không còn phát hiện được drift thật."
    ],
    quiz: [
      { q: "`terraform plan -detailed-exitcode` trả về 2 nghĩa là gì?", options: ["Lỗi", "Không có thay đổi", "Plan thành công và có thay đổi", "Bị khoá state"], answer: 2, explain: "0 là không thay đổi, 1 là lỗi, 2 là có thay đổi. Điều này giúp job CI phân biệt drift với lỗi." },
      { q: "ECS service được Application Auto Scaling thay đổi `desired_count`. Làm sao để Terraform không kéo lại mỗi lần apply?", options: ["Xoá service khỏi state", "`lifecycle { ignore_changes = [desired_count] }`", "Tắt autoscaling", "Chạy `terraform import` mỗi ngày"], answer: 1, explain: "`ignore_changes` bỏ qua drift ở thuộc tính được quản lý bởi hệ thống khác. Xoá khỏi state làm mất quản lý; tắt autoscaling bỏ mất tính năng; import không liên quan." },
      { q: "Ưu điểm của khối `import` so với lệnh `terraform import`?", options: ["Nhanh hơn", "Đi qua plan để review và có thể sinh sẵn cấu hình", "Không cần provider", "Tự xoá tài nguyên cũ"], answer: 1, explain: "Khối `import` là một phần của code, được plan và review như mọi thay đổi, và hỗ trợ `-generate-config-out`. Nó vẫn cần provider và không xoá gì." }
    ]
  },
  "p09.m2.t6": {
    sections: [
      {
        h: "OpenTofu: fork mã nguồn mở của Terraform",
        p: [
          "Năm 2023, HashiCorp đổi giấy phép Terraform từ MPL sang BSL. Cộng đồng tạo OpenTofu, một fork dưới Linux Foundation, giữ giấy phép MPL. OpenTofu dùng cùng ngôn ngữ HCL, cùng provider, lệnh gần như giống hệt (`tofu init`, `tofu plan`). Theo thời gian hai dự án có thêm tính năng riêng, ví dụ OpenTofu có mã hoá state phía client. Nếu tổ chức quan tâm giấy phép, OpenTofu là lựa chọn chuyển đổi ít tốn công nhất; hãy kiểm tra độ tương thích với phiên bản bạn đang dùng trước khi chuyển."
        ]
      },
      {
        h: "Pulumi và AWS CDK: IaC bằng ngôn ngữ lập trình",
        p: [
          "Pulumi cho phép viết hạ tầng bằng TypeScript, Python, Go, C#. Bạn có vòng lặp, hàm, kiểu dữ liệu, test đơn vị và IDE quen thuộc. Pulumi vẫn có state và mô hình preview/up tương tự plan/apply. AWS CDK cũng dùng ngôn ngữ lập trình nhưng sinh ra template CloudFormation rồi để CloudFormation triển khai; nó chỉ dành cho AWS và có các construct cấp cao tạo nhiều tài nguyên với mặc định hợp lý."
        ],
        code: {
          lang: "typescript", file: "index.ts (Pulumi)",
          src: `import * as aws from '@pulumi/aws';

const envs = ['dev', 'staging'];

for (const env of envs) {
  new aws.s3.Bucket(\`assets-\${env}\`, {
    tags: { project: 'task-api', env },
  });
}`
        }
      },
      {
        h: "CloudFormation và cách chọn",
        p: [
          "CloudFormation là IaC gốc của AWS, viết bằng YAML/JSON. State do AWS quản lý trong stack nên không cần backend, có rollback tự động khi triển khai thất bại. Đổi lại cú pháp dài, chỉ cho AWS, và thường hỗ trợ tính năng mới chậm hơn provider Terraform."
        ],
        list: [
          "Terraform/OpenTofu: đa nền tảng (AWS + Cloudflare + GitHub + Datadog trong một nơi), cộng đồng lớn nhất, nhiều người biết nhất.",
          "Pulumi: đội muốn dùng ngôn ngữ lập trình thực sự và chia sẻ code với ứng dụng.",
          "AWS CDK: đội chỉ dùng AWS, muốn construct cấp cao và không muốn quản state.",
          "CloudFormation thuần: khi tổ chức bắt buộc hoặc cần tích hợp sâu (StackSets, Service Catalog)."
        ],
        p: [
          "Dù chọn công cụ nào, nguyên tắc giống nhau: code trong Git, review qua PR, plan trước apply, không sửa tay trên console."
        ]
      }
    ],
    summary: [
      "OpenTofu là fork MPL của Terraform, tương thích cao, lệnh `tofu`.",
      "Pulumi và CDK viết IaC bằng ngôn ngữ lập trình; CDK sinh CloudFormation.",
      "CloudFormation: state do AWS quản lý, rollback tự động, chỉ cho AWS.",
      "Nguyên tắc chung không đổi: Git, review, preview trước khi áp dụng."
    ],
    pitfalls: [
      "Dùng sức mạnh của ngôn ngữ lập trình trong Pulumi/CDK để viết logic phức tạp, hạ tầng khó đoán và khó review hơn HCL.",
      "Trộn nhiều công cụ quản lý cùng một tài nguyên (vừa CDK vừa Terraform), hai bên liên tục ghi đè nhau.",
      "Chuyển từ Terraform sang OpenTofu mà không kiểm tra phiên bản tương thích và tính năng đang dùng."
    ],
    quiz: [
      { q: "AWS CDK triển khai hạ tầng như thế nào?", options: ["Gọi API AWS trực tiếp và lưu state trên S3", "Sinh template CloudFormation rồi CloudFormation triển khai", "Dùng provider Terraform", "Chạy Ansible"], answer: 1, explain: "CDK synth ra CloudFormation template; state nằm trong CloudFormation stack. Nó không dùng provider Terraform hay Ansible (CDKTF là dự án khác)." },
      { q: "Lý do chính cộng đồng tạo ra OpenTofu?", options: ["Terraform ngừng phát triển", "HashiCorp đổi giấy phép Terraform sang BSL", "Terraform không hỗ trợ AWS", "OpenTofu dùng ngôn ngữ mới"], answer: 1, explain: "OpenTofu ra đời sau khi giấy phép đổi sang BSL, để giữ một bản mã nguồn mở MPL. Terraform vẫn phát triển và hỗ trợ AWS; OpenTofu vẫn dùng HCL." },
      { q: "Khi hạ tầng trải trên AWS, Cloudflare và GitHub, công cụ nào phù hợp nhất để quản lý ở một nơi?", options: ["CloudFormation", "AWS CDK", "Terraform/OpenTofu", "AWS Console"], answer: 2, explain: "Terraform/OpenTofu có provider cho rất nhiều nền tảng. CloudFormation và CDK tập trung vào AWS; console là thao tác tay, không phải IaC." }
    ]
  },
  "p09.m3.t0": {
    sections: [
      {
        h: "Ansible: quản lý cấu hình không cần agent",
        p: [
          "Terraform tạo máy; Ansible cấu hình những gì chạy bên trong máy: cài package, tạo user, đặt file cấu hình, bật service. Ansible kết nối tới máy qua SSH và chạy module Python, không cần cài agent trên server. Bạn mô tả trạng thái mong muốn trong playbook YAML.",
          "Các khái niệm chính: inventory là danh sách máy và nhóm máy; playbook gồm các play, mỗi play áp một danh sách task lên một nhóm host; module là đơn vị hành động (`apt`, `copy`, `template`, `systemd`, `user`); handler là task chỉ chạy khi được `notify` bởi task có thay đổi, ví dụ reload Nginx chỉ khi file cấu hình thật sự đổi; role đóng gói task, template, handler, biến để tái sử dụng."
        ],
        code: {
          lang: "ini", file: "inventory.ini",
          src: `[web]
web1 ansible_host=203.0.113.21
web2 ansible_host=203.0.113.22

[web:vars]
ansible_user=deploy`
        }
      },
      {
        h: "Playbook cấu hình VPS",
        code: {
          lang: "yaml", file: "site.yml",
          src: `- name: Cấu hình web server
  hosts: web
  become: true
  vars:
    app_domain: api.example.com
  tasks:
    - name: Cài gói cần thiết
      ansible.builtin.apt:
        name: [nginx, ufw, fail2ban]
        state: present
        update_cache: true

    - name: Tắt đăng nhập SSH bằng mật khẩu
      ansible.builtin.lineinfile:
        path: /etc/ssh/sshd_config
        regexp: '^#?PasswordAuthentication'
        line: 'PasswordAuthentication no'
      notify: Reload ssh

    - name: Cấu hình Nginx cho ứng dụng
      ansible.builtin.template:
        src: templates/api.conf.j2
        dest: /etc/nginx/sites-enabled/api.conf
        mode: "0644"
      notify: Reload nginx

    - name: Mở cổng web
      community.general.ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop: ["80", "443"]

  handlers:
    - name: Reload nginx
      # kiểm tra toàn bộ cấu hình trước, sai cú pháp thì handler lỗi và không reload
      ansible.builtin.shell: nginx -t && systemctl reload nginx
    - name: Reload ssh
      ansible.builtin.systemd:
        name: ssh
        state: reloaded`
        },
        p: [
          "Chạy thử với `ansible-playbook -i inventory.ini site.yml --check --diff` để xem thay đổi mà không áp dụng, rồi bỏ `--check` để chạy thật. Handler reload Nginx chạy `nginx -t` trước: file site chỉ là một mảnh cấu hình nên không kiểm tra riêng được, phải kiểm tra toàn bộ cấu hình rồi mới reload."
        ]
      },
      {
        h: "Idempotent và khi nào dùng Ansible",
        p: [
          "Idempotent nghĩa là chạy playbook lần hai không thay đổi gì nếu máy đã đúng trạng thái; output sẽ báo `changed=0`. Các module chuẩn tự kiểm tra trước khi hành động. Module `shell`/`command` thì không: chúng chạy mỗi lần, nên hãy tránh hoặc dùng `creates`/`changed_when` để khai báo điều kiện.",
          "Ansible rất hợp để cấu hình hàng loạt VPS, máy on-premise, hoặc làm bước provision bên trong Packer. Với hạ tầng container (ECS, Kubernetes), bạn ít cần Ansible hơn vì cấu hình đã đóng trong image."
        ]
      }
    ],
    summary: [
      "Ansible cấu hình máy qua SSH, không cần agent; Terraform tạo máy, Ansible cấu hình bên trong.",
      "Inventory liệt kê máy, playbook chứa task, handler chạy khi được notify, role để tái sử dụng.",
      "Module chuẩn là idempotent; chạy lần hai phải ra `changed=0`.",
      "Luôn thử bằng `--check --diff` trước khi chạy thật."
    ],
    pitfalls: [
      "Dùng `shell: apt-get install ...` thay vì module `apt`, mất idempotent và khó biết có thay đổi hay không.",
      "Tắt đăng nhập mật khẩu SSH trước khi chắc chắn key đã được cài, tự khoá mình khỏi server.",
      "Đặt mật khẩu trong biến playbook dạng rõ; dùng Ansible Vault hoặc kho secret."
    ],
    quiz: [
      { q: "Handler trong Ansible chạy khi nào?", options: ["Mỗi lần chạy playbook", "Khi được notify bởi một task có trạng thái changed, thường ở cuối play", "Chỉ khi task lỗi", "Trước mọi task"], answer: 1, explain: "Handler chỉ chạy khi có task báo changed và notify nó, và mặc định chạy một lần ở cuối play. Nhờ vậy Nginx chỉ reload khi cấu hình thật sự đổi." },
      { q: "Chạy cùng một playbook lần thứ hai trên máy đã cấu hình đúng, kết quả mong đợi là gì?", options: ["Mọi task báo changed", "`changed=0`", "Lỗi vì đã cài rồi", "Máy khởi động lại"], answer: 1, explain: "Tính idempotent đảm bảo không có thay đổi khi trạng thái đã đúng. Module chuẩn không báo lỗi khi package đã có." },
      { q: "Ansible khác Terraform ở điểm nào là chính?", options: ["Ansible chỉ chạy trên Windows", "Ansible chủ yếu cấu hình phần mềm bên trong máy; Terraform chủ yếu tạo và quản lý tài nguyên hạ tầng có state", "Terraform cần agent trên máy", "Ansible không dùng YAML"], answer: 1, explain: "Hai công cụ bổ trợ nhau: Terraform tạo VPC, EC2, DB và lưu state; Ansible cài và cấu hình phần mềm qua SSH. Terraform không cần agent; Ansible dùng YAML." }
    ]
  },
  "p09.m3.t1": {
    sections: [
      {
        h: "Golden image là gì",
        p: [
          "Nếu mỗi EC2 khởi động rồi mới cài package, tải runtime, cấu hình, thì việc scale chậm (vài phút mỗi máy) và kết quả có thể khác nhau: một mirror tạm lỗi, một package vừa ra bản mới. Golden image là image máy (AMI trên AWS) đã cài sẵn mọi thứ cần thiết. Máy mới từ image đó khởi động nhanh và giống hệt nhau.",
          "Packer là công cụ build image từ code. Nó tạo một máy tạm từ image gốc, chạy provisioner (shell, Ansible), chụp thành AMI mới, rồi xoá máy tạm. Cùng một template có thể build cho nhiều nền tảng (AWS, GCP, Azure, Docker)."
        ]
      },
      {
        h: "Template Packer HCL",
        code: {
          lang: "hcl", file: "api.pkr.hcl",
          src: `packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1"
    }
  }
}

variable "app_version" {
  type = string
}

locals {
  ts = formatdate("YYYYMMDDhhmm", timestamp())
}

source "amazon-ebs" "api" {
  region        = "ap-southeast-1"
  instance_type = "t3.small"
  ssh_username  = "ubuntu"
  ami_name      = "task-api-\${var.app_version}-\${local.ts}"

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"]   # Canonical
    most_recent = true
  }

  tags = {
    app     = "task-api"
    version = var.app_version
  }
}

build {
  sources = ["source.amazon-ebs.api"]

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx docker.io",
      "sudo systemctl enable nginx docker",
    ]
  }

  provisioner "ansible" {
    playbook_file = "./site.yml"
  }
}`
        },
        p: [
          "Provisioner `ansible` cần plugin `github.com/hashicorp/ansible` khai báo thêm trong `required_plugins` và Ansible cài trên máy chạy Packer. Build bằng `packer init .`, `packer validate .`, rồi `packer build -var app_version=1.4.0 .`."
        ]
      },
      {
        h: "Nướng sẵn bao nhiêu là đủ",
        p: [
          "Có hai cách tiếp cận. Nướng toàn bộ (full bake): image chứa cả ứng dụng phiên bản cụ thể, mỗi release build một AMI. Khởi động nhanh nhất, rollback bằng cách quay về AMI cũ, nhưng pipeline build chậm hơn. Nướng một phần: image chứa OS, runtime, agent giám sát; ứng dụng được kéo lúc khởi động qua user data (ví dụ `docker pull`). Build image ít hơn, nhưng khởi động phụ thuộc registry.",
          "Dù cách nào, hãy build image định kỳ (ví dụ hằng tuần) để có bản vá bảo mật mới nhất, gắn tag phiên bản, và dọn các AMI cùng snapshot cũ vì chúng vẫn tốn phí lưu trữ. Trong thế giới container, Dockerfile đóng vai trò tương tự golden image, còn AMI chỉ cần chứa hệ điều hành cho node."
        ]
      }
    ],
    summary: [
      "Golden image cài sẵn mọi thứ, giúp máy mới khởi động nhanh và giống hệt nhau.",
      "Packer tạo máy tạm, chạy provisioner, chụp thành AMI, rồi xoá máy tạm.",
      "Full bake cho khởi động nhanh và rollback dễ; partial bake build ít hơn nhưng phụ thuộc lúc khởi động.",
      "Rebuild định kỳ để có bản vá, dọn AMI và snapshot cũ."
    ],
    pitfalls: [
      "Nướng secret (mật khẩu DB, key) vào AMI; bất kỳ ai dùng được AMI đều đọc được. Lấy secret lúc chạy từ Secrets Manager.",
      "Chỉ build image một lần rồi dùng nhiều tháng, bỏ lỡ bản vá bảo mật của OS.",
      "Dùng `source_ami` cố định ID cũ thay vì `source_ami_filter` với `most_recent`, image gốc không bao giờ được cập nhật."
    ],
    quiz: [
      { q: "Packer làm gì khi build một AMI?", options: ["Sửa trực tiếp các EC2 đang chạy", "Tạo máy tạm, chạy provisioner, chụp AMI và xoá máy tạm", "Tạo VPC", "Deploy container lên ECS"], answer: 1, explain: "Packer chỉ tạo image; nó không động tới máy đang chạy, không tạo VPC hay deploy ECS. Việc dùng AMI để tạo máy là của Terraform/ASG." },
      { q: "Ưu điểm chính của golden image so với cài đặt lúc khởi động?", options: ["Không cần hệ điều hành", "Khởi động nhanh và nhất quán, không phụ thuộc mạng/mirror lúc scale", "Không bao giờ cần build lại", "Không tốn dung lượng"], answer: 1, explain: "Mọi thứ đã có sẵn nên máy lên nhanh và giống nhau. Vẫn cần OS, vẫn phải rebuild để vá lỗi, và AMI có chi phí lưu trữ snapshot." },
      { q: "Nên xử lý mật khẩu DB thế nào với golden image?", options: ["Ghi vào `/etc/app.env` trong image", "Lấy lúc khởi động hoặc lúc chạy từ Secrets Manager/SSM Parameter Store", "Đặt trong tên AMI", "Đặt trong tag"], answer: 1, explain: "Image có thể được chia sẻ và tồn tại lâu, secret trong image là lộ secret. Tag và tên AMI đều hiển thị công khai với người có quyền xem." }
    ]
  },
  "p09.m3.t2": {
    sections: [
      {
        h: "Sửa tại chỗ và thay mới",
        p: [
          "Cách truyền thống (mutable) là SSH vào server rồi cập nhật: `apt upgrade`, sửa file cấu hình, deploy code mới. Sau nhiều tháng, mỗi server tích luỹ những thay đổi nhỏ khác nhau, gọi là configuration drift. Server trở thành \"bông tuyết\" (snowflake): không ai dám động vào, không ai tái tạo được nếu nó chết.",
          "Immutable infrastructure làm ngược lại: server đã chạy thì không sửa. Muốn thay đổi (bản vá OS, phiên bản ứng dụng, cấu hình), bạn build image mới, tạo server mới từ image đó, chuyển traffic sang, rồi huỷ server cũ. Container là ví dụ rõ nhất: bạn không `docker exec` vào để sửa code, mà build image mới và thay container."
        ]
      },
      {
        h: "Lợi ích và đánh đổi",
        list: [
          "Nhất quán: mọi máy chạy cùng image đã được test, không có drift.",
          "Rollback đơn giản: chạy lại image trước đó.",
          "Tái tạo được: mất máy không sao, ASG hoặc orchestrator tạo lại từ image.",
          "Bảo mật tốt hơn: kẻ tấn công cài backdoor vào máy thì backdoor mất khi máy bị thay."
        ],
        p: [
          "Đánh đổi: cần pipeline build image tự động, thay đổi nhỏ cũng phải đi hết quy trình, và dữ liệu phải nằm ngoài máy (DB managed, S3, EFS), vì đĩa local sẽ bị xoá cùng máy. Log cũng phải được đẩy đi (CloudWatch, Loki) chứ không nằm trên đĩa."
        ]
      },
      {
        h: "Triển khai với ASG instance refresh",
        p: [
          "Trên AWS, kết hợp AMI từ Packer, Launch Template và Auto Scaling Group. Khi Launch Template trỏ tới AMI mới, instance refresh lần lượt thay máy cũ bằng máy mới, giữ tối thiểu phần trăm máy khoẻ mạnh trong suốt quá trình."
        ],
        code: {
          lang: "hcl", file: "asg.tf",
          src: `data "aws_ami" "api" {
  most_recent = true
  owners      = ["self"]
  filter {
    name   = "name"
    values = ["task-api-\${var.app_version}-*"]
  }
}

resource "aws_launch_template" "api" {
  name_prefix            = "task-api-"
  image_id               = data.aws_ami.api.id
  instance_type          = "t3.small"
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile { name = aws_iam_instance_profile.api.name }
}

resource "aws_autoscaling_group" "api" {
  name                = "task-api"
  min_size            = 2
  max_size            = 6
  vpc_zone_identifier = var.private_subnets
  target_group_arns   = [aws_lb_target_group.api.arn]
  health_check_type   = "ELB"

  launch_template {
    id      = aws_launch_template.api.id
    version = aws_launch_template.api.latest_version
  }

  instance_refresh {
    strategy = "Rolling"
    preferences { min_healthy_percentage = 90 }
  }
}`
        }
      }
    ],
    summary: [
      "Immutable: không sửa server đang chạy, thay bằng server mới từ image mới.",
      "Loại bỏ configuration drift và server snowflake; rollback bằng image cũ.",
      "Yêu cầu dữ liệu và log nằm ngoài máy.",
      "Trên AWS: Packer AMI + Launch Template + ASG instance refresh; với container là image mới + rolling update."
    ],
    pitfalls: [
      "SSH vào \"sửa nhanh\" một máy trong ASG; lần thay máy tiếp theo bản sửa biến mất và lỗi quay lại.",
      "Lưu file upload hoặc log quan trọng trên đĩa local của máy immutable.",
      "Dùng `health_check_type = \"EC2\"` nên ASG coi máy là khoẻ dù ứng dụng không phục vụ được; dùng `ELB` để dựa vào health check của load balancer."
    ],
    quiz: [
      { q: "Configuration drift là gì?", options: ["Server chạy ở nhiều region", "Các server lệch cấu hình dần do sửa tay và cập nhật khác nhau theo thời gian", "Image quá lớn", "Terraform chạy chậm"], answer: 1, explain: "Drift là sự khác biệt tích luỹ giữa các server hoặc giữa server và cấu hình chuẩn. Immutable infrastructure loại bỏ nó bằng cách luôn tạo máy từ image." },
      { q: "Trong mô hình immutable, cần vá lỗ hổng OpenSSL thì làm gì?", options: ["SSH vào từng máy chạy `apt upgrade`", "Build image mới có bản vá, rồi thay dần máy cũ", "Đợi máy tự khởi động lại", "Tắt OpenSSL"], answer: 1, explain: "Mọi thay đổi đi qua image mới và thay máy. Sửa tay phá vỡ tính immutable; chờ khởi động lại không cập nhật gì." },
      { q: "Điều kiện tiên quyết để áp dụng immutable infrastructure cho web server?", options: ["Server phải stateless, dữ liệu nằm ở DB/S3 bên ngoài", "Phải dùng Windows", "Không dùng load balancer", "Mỗi server một IP tĩnh"], answer: 0, explain: "Máy bị huỷ bất cứ lúc nào nên dữ liệu phải ở ngoài. Load balancer lại rất cần để chuyển traffic giữa máy cũ và mới; IP tĩnh và OS không phải điều kiện." }
    ]
  },
});
