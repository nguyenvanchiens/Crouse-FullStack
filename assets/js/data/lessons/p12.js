/* Nội dung bài học chương p12 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p12.m0.t0": {
    sections: [
      {
        h: "Scale dọc và scale ngang là gì",
        p: [
          "Khi hệ thống chậm vì tải tăng, bạn có hai hướng. Scale dọc (vertical scaling, scale up) là nâng cấp một máy: thêm CPU, RAM, ổ NVMe nhanh hơn. Scale ngang (horizontal scaling, scale out) là thêm nhiều máy chạy cùng một service và chia tải cho chúng qua load balancer.",
          "Scale dọc đơn giản nhất: không đổi code, không đổi kiến trúc. Nhưng nó có trần cứng (máy lớn nhất vẫn có giới hạn), giá tăng nhanh hơn tuyến tính ở phân khúc cao cấp, và một máy vẫn là single point of failure. Nâng cấp thường cần downtime.",
          "Scale ngang gần như không có trần, chịu lỗi tốt hơn (một instance chết thì instance khác gánh), và tận dụng được autoscaling. Cái giá là độ phức tạp: bạn cần load balancer, cần service không giữ state cục bộ, và phải xử lý các vấn đề phân tán như nhất quán dữ liệu."
        ]
      },
      {
        h: "Stateless: điều kiện để scale ngang",
        p: [
          "Một service stateless không lưu dữ liệu nào của người dùng trong bộ nhớ hay ổ đĩa cục bộ giữa các request. Mọi request có thể đi vào bất kỳ instance nào và cho cùng kết quả. Nhờ vậy bạn thêm hoặc bớt instance thoải mái, và instance chết cũng không làm mất gì.",
          "State không biến mất, nó được đưa ra ngoài: session vào Redis hoặc dùng JWT, dữ liệu nghiệp vụ vào PostgreSQL, file upload vào object storage (S3, MinIO), job nền vào queue. Các thành phần giữ state này được scale bằng kỹ thuật riêng như replication và sharding."
        ],
        list: [
          "Session lưu trong RAM của process: user bị đăng xuất khi request rơi vào instance khác.",
          "File upload ghi vào ổ đĩa local: instance khác không đọc được file.",
          "Cache in-memory: mỗi instance một bản, dễ lệch nhau; chỉ dùng cho dữ liệu chấp nhận hơi cũ.",
          "Cron job chạy trong mọi instance: chạy trùng N lần, cần leader election hoặc scheduler riêng."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `// Session lưu ở Redis thay vì RAM của process -> instance nào cũng đọc được
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, maxAge: 7 * 24 * 3600 * 1000 },
}));`
        }
      },
      {
        h: "Chọn hướng nào trong thực tế",
        p: [
          "Lời khuyên thực tế: scale dọc trước cho database vì nó rẻ về công sức, và thiết kế app stateless ngay từ đầu để scale ngang tầng ứng dụng. Một PostgreSQL trên máy mạnh chịu được tải lớn hơn nhiều người nghĩ, nhất là khi có index tốt và read replica.",
          "Trong phỏng vấn, khi nói “thêm server”, hãy nói rõ thành phần nào stateless (API, worker) và state nằm ở đâu. Người phỏng vấn muốn thấy bạn biết điểm nghẽn thật thường là tầng dữ liệu, không phải tầng app."
        ]
      }
    ],
    summary: [
      "Scale dọc: nâng cấp một máy, đơn giản nhưng có trần và là single point of failure.",
      "Scale ngang: thêm máy sau load balancer, gần như không trần nhưng phức tạp hơn.",
      "Service phải stateless mới scale ngang được; state đưa ra DB, cache, object storage, queue.",
      "Điểm nghẽn thường nằm ở tầng dữ liệu; tầng app stateless là phần dễ scale nhất."
    ],
    pitfalls: [
      "Lưu session hoặc file upload trên máy local rồi mới bật nhiều replica: lỗi đăng xuất ngẫu nhiên, mất file. Hãy đưa state ra Redis/S3 trước khi scale.",
      "Để cron job chạy trong mọi instance: job chạy trùng. Dùng scheduler riêng, queue có khóa, hoặc distributed lock.",
      "Nghĩ rằng thêm instance app sẽ giải quyết mọi thứ: nếu DB đã quá tải, thêm app chỉ làm DB tệ hơn vì nhiều connection hơn."
    ],
    quiz: [
      {
        q: "Vì sao service cần stateless để scale ngang dễ dàng?",
        options: ["Vì stateless chạy nhanh hơn trên CPU","Vì load balancer chỉ hỗ trợ service stateless","Vì stateless không cần database","Vì request có thể vào bất kỳ instance nào mà không phụ thuộc dữ liệu cục bộ"],
        answer: 3,
        explain: "Stateless nghĩa là không có dữ liệu người dùng nằm riêng trong một instance, nên thêm/bớt/mất instance không ảnh hưởng. Stateless vẫn cần DB; nó không nhanh hơn về CPU; load balancer vẫn làm việc được với service có state (qua sticky session) nhưng đó là cách nên tránh."
      },
      {
        q: "Nhược điểm chính của scale dọc là gì?",
        options: ["Phải viết lại toàn bộ code", "Không dùng được với PostgreSQL", "Có giới hạn phần cứng, chi phí tăng mạnh ở cấu hình cao và vẫn là một điểm lỗi duy nhất", "Không thể tăng RAM"],
        answer: 2,
        explain: "Scale dọc không đòi đổi code và rất hợp với DB, nhưng máy lớn nhất vẫn có trần, giá cao cấp đắt, và một máy chết là hệ thống chết."
      },
      {
        q: "Ứng dụng NestJS lưu file upload vào thư mục `./uploads` trên máy. Khi scale lên 3 pod, điều gì xảy ra?",
        options: ["File chỉ tồn tại ở pod đã nhận upload, các pod khác trả 404 khi đọc","Không có vấn đề gì","Kubernetes tự đồng bộ thư mục giữa các pod","Load balancer tự chuyển request về đúng pod"],
        answer: 0,
        explain: "Ổ đĩa của pod là cục bộ (và mất khi pod bị thay). Kubernetes không tự đồng bộ, load balancer không biết file nằm ở đâu. Giải pháp là object storage như S3/MinIO."
      }
    ]
  },

  "p12.m0.t1": {
    sections: [
      {
        h: "Load balancer làm gì",
        p: [
          "Load balancer (LB) đứng trước nhóm server, nhận request và chia cho các server phía sau. Nó giúp scale ngang, loại server hỏng khỏi vòng quay và cho phép deploy từng phần (rolling update) mà không downtime.",
          "Có hai loại chính. LB tầng 4 (L4) làm việc với TCP/UDP: nó chỉ nhìn IP và port, chuyển tiếp kết nối mà không đọc nội dung. Rất nhanh, tốn ít tài nguyên, hợp với cả giao thức không phải HTTP. LB tầng 7 (L7) hiểu HTTP: đọc path, header, cookie, nên có thể route `/api` sang service A, `/static` sang service B, terminate TLS, nén, thêm header, rate limit. Đổi lại tốn CPU hơn L4.",
          "Ví dụ: AWS NLB là L4, AWS ALB, Nginx, Envoy, HAProxy (chế độ http) là L7. Kubernetes Service mặc định cân bằng ở tầng kết nối, còn Ingress/Gateway là L7."
        ]
      },
      {
        h: "Thuật toán phân phối",
        p: ["Mỗi thuật toán hợp với một kiểu tải khác nhau:"],
        list: [
          "Round robin: lần lượt từng server. Đơn giản, tốt khi các request có chi phí tương đương.",
          "Weighted round robin: server mạnh nhận nhiều hơn theo trọng số, hữu ích khi các máy không đồng đều hoặc khi canary.",
          "Least connections: gửi vào server đang có ít kết nối nhất. Tốt khi thời gian xử lý chênh lệch lớn, ví dụ WebSocket hoặc request dài.",
          "IP hash / consistent hash: cùng một khóa (IP, userId) luôn vào cùng server. Dùng cho cache cục bộ hoặc khi bắt buộc có affinity.",
          "Power of two choices: chọn ngẫu nhiên 2 server rồi lấy server tải thấp hơn. Gần tốt như least connections nhưng rẻ hơn khi có nhiều LB."
        ],
        code: {
          lang: "nginx",
          file: "nginx.conf",
          src: `upstream api {
    least_conn;
    server 10.0.0.11:3000 max_fails=3 fail_timeout=10s;
    server 10.0.0.12:3000 max_fails=3 fail_timeout=10s;
    server 10.0.0.13:3000 weight=2;
    keepalive 64;
}

server {
    listen 443 ssl;
    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_connect_timeout 2s;
        proxy_read_timeout 10s;
        proxy_next_upstream error timeout;
    }
}`
        }
      },
      {
        h: "Health check và sticky session",
        p: [
          "Health check giúp LB biết server nào còn sống. Passive check dựa trên lỗi thật của request (như `max_fails` ở trên). Active check gọi định kỳ một endpoint như `/health`. Hãy tách liveness (process còn chạy) và readiness (sẵn sàng nhận tải: đã kết nối DB, đã warm up). Khi shutdown, app nên báo not ready trước, chờ LB rút ra, xử lý xong request đang chạy rồi mới thoát.",
          "Sticky session (session affinity) ép một user luôn vào một server, thường qua cookie. Nên tránh vì: tải lệch khi vài user nặng dính vào một máy, server chết thì user mất session, và scale in/out bị khó. Cách đúng là làm service stateless. Ngoại lệ hợp lý là kết nối WebSocket, vốn tự nhiên gắn với một server trong suốt vòng đời kết nối."
        ]
      }
    ],
    summary: [
      "L4 chuyển tiếp TCP/UDP, nhanh và rẻ; L7 hiểu HTTP nên route theo path/header, terminate TLS được.",
      "Round robin cho tải đều; least connections cho request dài; hash khi cần affinity theo khóa.",
      "Health check nên tách liveness và readiness, kết hợp graceful shutdown.",
      "Tránh sticky session; hãy làm service stateless."
    ],
    pitfalls: [
      "Endpoint `/health` kiểm tra luôn cả DB rồi dùng làm liveness: DB chậm một chút là Kubernetes restart toàn bộ pod, gây sập dây chuyền. Liveness chỉ nên kiểm tra process; phụ thuộc bên ngoài để ở readiness một cách thận trọng.",
      "Không có graceful shutdown: khi deploy, request đang xử lý bị cắt giữa chừng và trả 502. Bắt SIGTERM, ngừng nhận request mới, chờ request cũ xong.",
      "Để LB retry mọi request khi timeout, kể cả POST không idempotent: có thể tạo đơn hàng hai lần."
    ],
    quiz: [
      {
        q: "Bạn cần route `/api/*` sang service API và `/admin/*` sang service admin. Loại LB nào phù hợp?",
        options: ["L4, vì nhanh hơn","DNS round robin","L7, vì cần đọc path HTTP","Không LB nào làm được"],
        answer: 2,
        explain: "Chỉ L7 đọc được nội dung HTTP như path. L4 chỉ thấy IP/port. DNS round robin không biết path."
      },
      {
        q: "Service WebSocket có kết nối kéo dài hàng giờ với thời lượng rất khác nhau. Thuật toán nào hợp lý nhất?",
        options: ["Round robin","Luôn gửi vào server đầu tiên","Random không điều kiện","Least connections"],
        answer: 3,
        explain: "Với kết nối dài và không đều, round robin có thể dồn nhiều kết nối vào một máy. Least connections cân bằng theo số kết nối đang mở."
      },
      {
        q: "Vì sao nên tránh sticky session cho REST API?",
        options: ["Vì nó gây lệch tải, mất session khi server chết và khó autoscale","Vì nó làm TLS không hoạt động","Vì trình duyệt không hỗ trợ cookie","Vì nó bắt buộc dùng L4"],
        answer: 0,
        explain: "Sticky session gắn user với một máy, nên tải không đều và state mất theo máy. TLS và cookie vẫn hoạt động bình thường; sticky thường làm ở L7 bằng cookie."
      }
    ]
  },

  "p12.m0.t2": {
    sections: [
      {
        h: "Các tầng cache từ client đến DB",
        p: [
          "Cache là lưu bản sao dữ liệu ở nơi gần người dùng hơn hoặc rẻ hơn để đọc. Một request có thể gặp nhiều tầng cache, tầng càng gần client thì càng rẻ nhưng càng khó kiểm soát việc làm mới."
        ],
        list: [
          "Browser cache: điều khiển bằng `Cache-Control`, `ETag`. Không tốn gì của server nhưng bạn không xóa được từ xa.",
          "CDN: lưu nội dung tĩnh và cả response API công khai ở edge gần người dùng. Có API purge.",
          "API gateway / reverse proxy: cache response theo URL, hợp với dữ liệu công khai đọc nhiều.",
          "Application cache: Redis dùng chung, hoặc cache in-memory trong process (rất nhanh nhưng mỗi instance một bản).",
          "Database: shared buffers của PostgreSQL và page cache của hệ điều hành giữ các trang dữ liệu nóng trong RAM."
        ]
      },
      {
        h: "Cache-aside và các chiến lược ghi",
        p: [
          "Cache-aside (lazy loading) là mẫu phổ biến nhất: đọc cache, nếu miss thì đọc DB rồi ghi vào cache với TTL. Khi ghi, cập nhật DB rồi xóa key cache. Xóa thay vì cập nhật cache giúp tránh ghi đè giá trị cũ khi hai request chạy song song.",
          "Các chiến lược khác: write-through (ghi cache và DB cùng lúc, đọc luôn tươi nhưng ghi chậm hơn), write-behind (ghi cache trước, đẩy xuống DB sau, nhanh nhưng có thể mất dữ liệu), read-through (thư viện cache tự nạp từ DB)."
        ],
        code: {
          lang: "typescript",
          file: "src/products/product.cache.ts",
          src: `const TTL = 300; // giây

async function getProduct(id: string): Promise<Product | null> {
  const key = 'product:' + id;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);

  const row = await db.product.findUnique({ where: { id } });
  // Thêm jitter vào TTL để các key không hết hạn cùng lúc
  const ttl = TTL + Math.floor(Math.random() * 60);
  // Cache cả kết quả rỗng (negative cache) để chặn truy vấn lặp vào id không tồn tại
  await redis.set(key, JSON.stringify(row), { EX: row ? ttl : 30 });
  return row;
}

async function updateProduct(id: string, data: Partial<Product>) {
  await db.product.update({ where: { id }, data });
  await redis.del('product:' + id); // invalidate sau khi DB commit
}`
        }
      },
      {
        h: "Invalidation và các sự cố kinh điển",
        p: [
          "Invalidation khó vì dữ liệu nằm ở nhiều nơi và các thao tác xen kẽ nhau. Ví dụ race: request A đọc DB được giá trị cũ, request B cập nhật DB và xóa cache, rồi A ghi giá trị cũ vào cache. Giá trị sai sống đến hết TTL. TTL luôn là lưới an toàn cuối cùng; với dữ liệu quan trọng có thể dùng xóa trễ lần hai (delayed double delete) hoặc invalidate theo sự kiện từ CDC/outbox.",
          "Cache stampede (thundering herd): key nóng hết hạn, hàng nghìn request cùng miss và cùng đánh vào DB. Cách chống: jitter TTL, chỉ cho một request nạp lại (lock hoặc single-flight), hoặc làm mới sớm trước khi hết hạn. Cache penetration: truy vấn id không tồn tại liên tục; chống bằng negative cache hoặc Bloom filter."
        ]
      }
    ],
    summary: [
      "Có nhiều tầng cache: browser, CDN, gateway, app (Redis/in-memory), DB buffer.",
      "Cache-aside: đọc cache, miss thì đọc DB và set có TTL; ghi DB xong thì xóa key.",
      "TTL là lưới an toàn cho mọi lỗi invalidation; thêm jitter để tránh hết hạn đồng loạt.",
      "Chống stampede bằng lock/single-flight, chống penetration bằng negative cache hoặc Bloom filter."
    ],
    pitfalls: [
      "Cache không có TTL: một lần invalidate hỏng là dữ liệu sai vĩnh viễn.",
      "Cache dữ liệu riêng tư ở CDN với `Cache-Control: public`: người dùng này thấy dữ liệu của người khác. Dùng `private` hoặc `no-store` cho response theo user.",
      "Xóa cache trước khi transaction DB commit: request khác có thể nạp lại giá trị cũ ngay lúc đó. Xóa sau khi commit."
    ],
    quiz: [
      {
        q: "Trong cache-aside, khi cập nhật dữ liệu, cách thường được khuyên là gì?",
        options: ["Cập nhật cache trước rồi mới ghi DB","Không làm gì, chờ TTL","Ghi DB rồi xóa key cache","Xóa toàn bộ Redis"],
        answer: 2,
        explain: "Ghi DB rồi xóa key giúp lần đọc sau nạp giá trị mới. Cập nhật cache trước có thể để cache lệch nếu ghi DB thất bại. Chỉ chờ TTL thì dữ liệu cũ quá lâu; xóa toàn bộ Redis gây stampede."
      },
      {
        q: "Một key rất nóng hết hạn và DB bị hàng nghìn truy vấn giống nhau đánh cùng lúc. Hiện tượng này gọi là gì?",
        options: ["Cache penetration","Hot partition","Replication lag","Cache stampede"],
        answer: 3,
        explain: "Cache stampede là nhiều request cùng miss một key và cùng nạp lại. Penetration là truy vấn dữ liệu không tồn tại nên luôn miss."
      },
      {
        q: "Vì sao thêm jitter ngẫu nhiên vào TTL?",
        options: ["Để các key được nạp cùng lúc không hết hạn cùng lúc","Để tiết kiệm RAM","Để Redis chạy nhanh hơn","Để dữ liệu luôn nhất quán tuyệt đối"],
        answer: 0,
        explain: "Nhiều key được nạp cùng thời điểm (ví dụ sau deploy) sẽ hết hạn đồng loạt và dồn tải vào DB. Jitter trải thời điểm hết hạn ra. Nó không đảm bảo nhất quán hay tiết kiệm RAM."
      }
    ]
  },

  "p12.m0.t3": {
    sections: [
      {
        h: "Vì sao cần replication",
        p: [
          "Replication là giữ nhiều bản sao dữ liệu trên nhiều máy. Mục tiêu: chịu lỗi (máy chết vẫn có bản khác), scale đọc (chia truy vấn đọc cho nhiều replica), và đặt dữ liệu gần người dùng ở vùng địa lý khác.",
          "Mô hình phổ biến nhất là leader-follower (primary-replica). Mọi thao tác ghi đi vào leader. Leader ghi log thay đổi (với PostgreSQL là WAL) và gửi cho các follower để áp dụng lại. Follower chỉ phục vụ đọc. Khi leader chết, một follower được promote thành leader mới (failover), thủ công hoặc qua công cụ như Patroni."
        ]
      },
      {
        h: "Đồng bộ, bất đồng bộ và replication lag",
        p: [
          "Replication đồng bộ: leader chờ ít nhất một follower xác nhận rồi mới báo commit thành công. Không mất dữ liệu khi leader chết, nhưng ghi chậm hơn và nếu follower đồng bộ chết thì ghi bị treo. Bất đồng bộ: leader commit ngay rồi gửi sau. Nhanh, nhưng failover có thể mất vài giao dịch cuối. Trong PostgreSQL, `synchronous_standby_names` và `synchronous_commit` điều khiển việc này.",
          "Với bất đồng bộ, follower luôn trễ leader một khoảng gọi là replication lag, bình thường vài mili giây nhưng có thể lên nhiều giây khi tải nặng. Hậu quả điển hình: user sửa hồ sơ, trang tải lại đọc từ replica và vẫn thấy dữ liệu cũ."
        ],
        code: {
          lang: "sql",
          file: "monitor-lag.sql",
          src: `-- Chạy trên primary: xem độ trễ của từng replica
SELECT application_name,
       state,
       sync_state,
       write_lag, flush_lag, replay_lag
FROM pg_stat_replication;

-- Chạy trên replica: dữ liệu đang trễ bao lâu
SELECT now() - pg_last_xact_replay_timestamp() AS replay_delay;`
        }
      },
      {
        h: "Read-your-writes và multi-leader",
        p: [
          "Read-your-writes (read-after-write consistency) đảm bảo người vừa ghi sẽ thấy dữ liệu của chính mình. Các cách làm: đọc từ leader trong một khoảng ngắn sau khi user ghi (ví dụ 5 giây, đánh dấu bằng cookie hoặc Redis); luôn đọc dữ liệu “của tôi” từ leader; hoặc lưu vị trí WAL (LSN) sau khi ghi và chỉ đọc từ replica đã replay tới LSN đó. Monotonic reads là yêu cầu liên quan: user không được thấy dữ liệu “lùi thời gian” khi các request rơi vào replica trễ khác nhau; gắn user với một replica cố định sẽ giải quyết.",
          "Multi-leader cho phép ghi ở nhiều leader, thường mỗi vùng một leader. Ghi nhanh ở mọi vùng và chịu được mất một vùng, nhưng phải giải quyết xung đột khi hai nơi sửa cùng một bản ghi: last-write-wins (dễ mất dữ liệu), merge theo nghiệp vụ, hoặc CRDT. Vì phức tạp, hầu hết hệ thống nên bắt đầu bằng single-leader. Leaderless (kiểu Dynamo, Cassandra) là nhánh thứ ba, dùng quorum, sẽ nói ở bài CAP."
        ]
      }
    ],
    summary: [
      "Leader-follower: ghi vào leader, follower nhận log thay đổi và phục vụ đọc.",
      "Đồng bộ an toàn hơn nhưng chậm và dễ treo; bất đồng bộ nhanh nhưng có lag và có thể mất dữ liệu khi failover.",
      "Replication lag gây lỗi đọc dữ liệu cũ; xử lý bằng read-your-writes và monotonic reads.",
      "Multi-leader phải giải quyết xung đột ghi; chỉ dùng khi thật cần ghi đa vùng."
    ],
    pitfalls: [
      "Chuyển toàn bộ truy vấn đọc sang replica mà không xét lag: luồng “tạo xong rồi redirect sang trang chi tiết” trả 404. Đọc từ primary cho các luồng ngay sau ghi.",
      "Không giám sát replication lag: replica trễ nhiều phút mà không ai biết. Cảnh báo theo `replay_lag`.",
      "Failover tự động mà không fencing leader cũ: hai node cùng nghĩ mình là leader (split-brain) và cùng nhận ghi."
    ],
    quiz: [
      {
        q: "User cập nhật avatar, trang tải lại vẫn hiện avatar cũ vài giây. Nguyên nhân khả dĩ nhất?",
        options: ["Leader bị lỗi","Index bị hỏng","Đọc từ replica bất đồng bộ đang bị replication lag","Transaction bị rollback"],
        answer: 2,
        explain: "Ghi đã vào leader nhưng replica chưa kịp áp dụng. Nếu transaction rollback thì sẽ không bao giờ thấy ảnh mới; đây chỉ là trễ tạm thời."
      },
      {
        q: "Nhược điểm của replication đồng bộ là gì?",
        options: ["Có thể mất giao dịch đã commit khi failover","Không dùng được với PostgreSQL","Không đọc được từ replica","Ghi chậm hơn và có thể bị chặn nếu replica đồng bộ không phản hồi"],
        answer: 3,
        explain: "Đồng bộ phải chờ replica xác nhận nên thêm độ trễ và phụ thuộc vào replica. Việc mất giao dịch khi failover là nhược điểm của bất đồng bộ."
      },
      {
        q: "Thách thức riêng lớn nhất của multi-leader so với single-leader là gì?",
        options: ["Xử lý xung đột khi nhiều leader cùng ghi một bản ghi","Không scale đọc được","Không chịu được lỗi một node","Không dùng được WAL"],
        answer: 0,
        explain: "Khi hai leader nhận ghi đồng thời cho cùng dữ liệu, hệ thống phải có chiến lược giải quyết xung đột. Single-leader tránh được điều này vì mọi ghi đi qua một chỗ."
      }
    ]
  },

  "p12.m0.t4": {
    sections: [
      {
        h: "Partitioning là gì và khi nào cần",
        p: [
          "Replication nhân bản cùng một dữ liệu. Partitioning (sharding) thì chia dữ liệu thành nhiều phần, mỗi phần nằm trên một node. Mục tiêu là scale ghi và dung lượng: khi một máy không còn chứa nổi dữ liệu hoặc không chịu nổi lượng ghi, bạn chia ra. Thường mỗi shard lại có replication riêng.",
          "Sharding rất tốn kém về vận hành: truy vấn chéo shard, transaction chéo shard, join, thay đổi schema và cân bằng lại đều khó hơn. Hãy thử hết các cách rẻ hơn trước: tối ưu index, scale dọc, read replica, cache, lưu trữ dữ liệu cũ. PostgreSQL có declarative partitioning (chia bảng trong một server) giúp quản lý bảng lớn, nhưng đó chưa phải sharding qua nhiều máy."
        ]
      },
      {
        h: "Range và hash partitioning",
        p: [
          "Chia theo range: mỗi shard giữ một khoảng khóa liên tục, ví dụ theo thời gian hoặc theo chữ cái đầu. Ưu điểm là truy vấn theo khoảng hiệu quả. Nhược điểm là dễ lệch tải: dữ liệu theo thời gian sẽ dồn mọi thao tác ghi mới vào shard cuối cùng.",
          "Chia theo hash: tính `hash(key) mod N` để chọn shard. Tải phân bố đều hơn, nhưng mất khả năng truy vấn theo khoảng và khi đổi N thì gần như mọi key phải di chuyển. Chọn shard key là quyết định quan trọng nhất: nó nên xuất hiện trong hầu hết truy vấn (ví dụ `tenant_id`, `user_id`) để truy vấn chỉ chạm một shard."
        ]
      },
      {
        h: "Consistent hashing",
        p: [
          "Consistent hashing đặt cả node và key lên một vòng hash. Mỗi key thuộc về node đầu tiên gặp khi đi theo chiều kim đồng hồ. Khi thêm hoặc bớt một node, chỉ các key trong đoạn vòng liền kề bị chuyển, khoảng 1/N số key, thay vì gần như tất cả như `mod N`. Mỗi node thật được đặt nhiều virtual node trên vòng để phân bố đều hơn. Kỹ thuật này dùng trong Cassandra, DynamoDB và nhiều client cache. Redis Cluster dùng biến thể khác: 16384 hash slot cố định chia cho các node."
        ],
        code: {
          lang: "typescript",
          file: "src/sharding/ring.ts",
          src: `import { createHash } from 'node:crypto';

const h = (s: string) => createHash('md5').update(s).digest().readUInt32BE(0);

export class HashRing {
  private ring: { point: number; node: string }[] = [];

  constructor(nodes: string[], private vnodes = 100) {
    for (const n of nodes) this.add(n);
  }

  add(node: string) {
    for (let i = 0; i < this.vnodes; i++) this.ring.push({ point: h(node + '#' + i), node });
    this.ring.sort((a, b) => a.point - b.point);
  }

  get(key: string): string {
    const p = h(key);
    // tìm điểm đầu tiên >= p (tìm nhị phân), quay vòng về đầu nếu vượt
    let lo = 0, hi = this.ring.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.ring[mid].point < p) lo = mid + 1; else hi = mid; }
    return this.ring[lo % this.ring.length].node;
  }
}`
        }
      },
      {
        h: "Hot partition",
        p: [
          "Dù hash đều, một key đơn lẻ vẫn có thể cực nóng: tài khoản người nổi tiếng, sản phẩm flash sale. Mọi request cho key đó rơi vào một shard. Cách xử lý: cache mạnh key nóng, thêm hậu tố ngẫu nhiên vào key (key salting) để rải ghi ra nhiều shard rồi gộp khi đọc, hoặc tách riêng các khách hàng lớn ra shard riêng. Theo dõi phân phối tải theo shard để phát hiện sớm."
        ]
      }
    ],
    summary: [
      "Sharding chia dữ liệu để scale ghi và dung lượng; chỉ dùng khi các cách rẻ hơn đã hết tác dụng.",
      "Range tốt cho truy vấn khoảng nhưng dễ lệch; hash đều hơn nhưng mất truy vấn khoảng.",
      "Shard key nên có mặt trong hầu hết truy vấn để tránh scatter-gather.",
      "Consistent hashing chỉ di chuyển khoảng 1/N key khi đổi số node; virtual node giúp phân bố đều.",
      "Hot key cần cache, key salting hoặc cách ly riêng."
    ],
    pitfalls: [
      "Chọn shard key theo thời gian tạo: mọi ghi mới dồn vào một shard.",
      "Dùng `hash mod N` trực tiếp rồi thêm node: gần như toàn bộ dữ liệu phải di chuyển. Dùng consistent hashing hoặc số slot cố định lớn hơn nhiều so với số node.",
      "Shard quá sớm khi dữ liệu vẫn vừa một máy: tăng độ phức tạp mà không được lợi."
    ],
    quiz: [
      {
        q: "Hệ thống SaaS nhiều tenant, hầu hết truy vấn đều lọc theo `tenant_id`. Shard key hợp lý là gì?",
        options: ["created_at","Một số ngẫu nhiên","tenant_id","email người dùng"],
        answer: 2,
        explain: "Shard theo `tenant_id` giúp mỗi truy vấn chỉ chạm một shard. `created_at` gây dồn ghi, số ngẫu nhiên buộc truy vấn mọi shard."
      },
      {
        q: "Lợi ích chính của consistent hashing so với `hash(key) mod N`?",
        options: ["Hash nhanh hơn","Không cần replication","Hỗ trợ truy vấn theo khoảng","Khi thêm/bớt node chỉ một phần nhỏ key phải di chuyển"],
        answer: 3,
        explain: "Với mod N, đổi N làm hầu hết key đổi vị trí. Consistent hashing chỉ chuyển các key ở đoạn vòng bị ảnh hưởng. Nó không giúp truy vấn khoảng và không thay replication."
      },
      {
        q: "Một sản phẩm flash sale nhận 90% lượt đọc. Cách xử lý phù hợp nhất?",
        options: ["Cache mạnh key đó (kể cả cache cục bộ ngắn hạn) và cân nhắc nhân bản key","Tăng số shard lên gấp đôi","Chuyển sang range partitioning","Xóa sản phẩm"],
        answer: 0,
        explain: "Thêm shard không giúp vì một key vẫn nằm ở một shard. Hot key cần cache hoặc nhân bản để rải tải đọc."
      }
    ]
  },

  "p12.m0.t5": {
    sections: [
      {
        h: "CAP nói gì, và không nói gì",
        p: [
          "Định lý CAP: trong hệ phân tán, khi xảy ra network partition (các node không liên lạc được với nhau), bạn phải chọn giữa Consistency (mọi lần đọc thấy lần ghi mới nhất, theo nghĩa linearizable) và Availability (mọi node còn sống vẫn trả lời). Partition tolerance không phải thứ để “bỏ” vì mạng luôn có thể lỗi.",
          "Hiểu đúng: CAP chỉ bàn về lúc có partition. Khi mạng bình thường, hệ thống có thể vừa nhất quán vừa sẵn sàng. Hệ CP (ví dụ etcd, ZooKeeper) sẽ từ chối phục vụ ở phía thiểu số khi partition. Hệ AP (ví dụ Cassandra với cấu hình mặc định) tiếp tục nhận đọc/ghi ở cả hai phía rồi hòa giải sau."
        ]
      },
      {
        h: "PACELC: đánh đổi cả lúc bình thường",
        p: [
          "PACELC mở rộng CAP: nếu có Partition thì chọn A hoặc C; Else (lúc bình thường) chọn giữa Latency và Consistency. Đây là đánh đổi bạn gặp hằng ngày: muốn nhất quán mạnh thì phải chờ nhiều replica xác nhận, tức là chậm hơn. Ví dụ một PostgreSQL với replica đồng bộ chọn C trên L; DynamoDB mặc định đọc eventual consistency cho nhanh và rẻ, có tùy chọn strongly consistent read."
        ]
      },
      {
        h: "Các mô hình nhất quán",
        list: [
          "Strong (linearizable): như có một bản dữ liệu duy nhất; ghi xong thì mọi người đọc đều thấy. Đắt, cần đồng thuận hoặc quorum.",
          "Sequential/causal: các thao tác có quan hệ nhân quả được thấy theo đúng thứ tự (thấy câu trả lời thì phải thấy câu hỏi). Rẻ hơn strong.",
          "Read-your-writes, monotonic reads: đảm bảo ở góc nhìn một phiên người dùng.",
          "Eventual: nếu ngừng ghi, các replica cuối cùng sẽ hội tụ. Không nói trước bao lâu, có thể đọc dữ liệu cũ."
        ],
        p: [
          "Chọn mô hình theo nghiệp vụ: số dư tài khoản, tồn kho khi đặt hàng cần strong; số lượt like, feed, gợi ý chấp nhận eventual."
        ]
      },
      {
        h: "Quorum",
        p: [
          "Trong hệ leaderless với N replica, mỗi lần ghi chờ W node xác nhận, mỗi lần đọc hỏi R node. Nếu W + R > N thì tập đọc và tập ghi luôn giao nhau ít nhất một node, nên lần đọc có cơ hội thấy bản mới nhất (lấy bản có version cao nhất). Cấu hình hay gặp: N=3, W=2, R=2. W=1, R=1 nhanh nhưng chỉ eventual.",
          "Lưu ý: quorum W + R > N không tự động cho linearizability; các trường hợp như ghi đồng thời, sloppy quorum, hay ghi thất bại một phần vẫn có thể cho kết quả bất ngờ. Nói trong phỏng vấn rằng quorum giúp tăng khả năng đọc được dữ liệu mới, còn nhất quán mạnh thật sự cần thuật toán đồng thuận như Raft."
        ],
        code: {
          lang: "text",
          file: "quorum.txt",
          src: `N = 3 replica: [A] [B] [C]

Ghi v2 với W = 2:   A=v2  B=v2  C=v1   (C chưa kịp nhận)
Đọc với R = 2:      hỏi B và C -> nhận v2 và v1
                    -> chọn version cao nhất = v2 (đúng)
                    -> có thể sửa C (read repair)

W + R = 4 > N = 3  => tập đọc luôn chạm ít nhất một node có bản mới`
        }
      }
    ],
    summary: [
      "CAP chỉ áp dụng khi có network partition: chọn nhất quán hoặc sẵn sàng.",
      "PACELC thêm đánh đổi lúc bình thường: độ trễ và nhất quán.",
      "Có nhiều mức nhất quán: strong, causal, read-your-writes, eventual; chọn theo nghiệp vụ.",
      "Quorum W + R > N làm tập đọc và ghi giao nhau, nhưng nhất quán mạnh tuyệt đối cần đồng thuận."
    ],
    pitfalls: [
      "Nói “hệ thống của tôi là CA”: trong hệ phân tán qua mạng, partition luôn có thể xảy ra, nên lựa chọn thật là hành vi khi partition.",
      "Áp dụng eventual consistency cho dữ liệu tiền hoặc tồn kho: dẫn đến bán vượt hoặc số dư âm.",
      "Coi quorum là nhất quán mạnh tuyệt đối mà bỏ qua ghi đồng thời và conflict."
    ],
    quiz: [
      {
        q: "Theo CAP, khi nào hệ thống buộc phải chọn giữa Consistency và Availability?",
        options: ["Luôn luôn, mọi lúc","Khi CPU quá tải","Khi xảy ra network partition","Khi dùng nhiều hơn 3 node"],
        answer: 2,
        explain: "CAP chỉ nói về tình huống có partition. Lúc mạng bình thường có thể có cả hai; đánh đổi khi bình thường là latency và consistency theo PACELC."
      },
      {
        q: "Với N = 3, cấu hình nào đảm bảo tập đọc và tập ghi luôn giao nhau?",
        options: ["W=1, R=1", "W=1, R=2", "W=2, R=2", "W=0, R=3"],
        answer: 2,
        explain: "Cần W + R > N. Chỉ W=2, R=2 cho tổng 4 > 3. W=1,R=2 cho 3, không lớn hơn N. W=0 nghĩa là không chờ xác nhận nào."
      },
      {
        q: "Tính năng nào hợp nhất với eventual consistency?",
        options: ["Trừ tiền trong ví","Cấp số thứ tự hóa đơn không trùng","Giữ ghế trong rạp chiếu phim","Đếm số lượt xem bài viết"],
        answer: 3,
        explain: "Lượt xem hơi lệch vài giây không gây hại. Ba lựa chọn còn lại cần nhất quán mạnh để tránh sai tiền, bán trùng ghế hay trùng số."
      }
    ]
  },

  "p12.m0.t6": {
    sections: [
      {
        h: "Vì sao cần ước lượng",
        p: [
          "Back-of-the-envelope là tính nhanh bằng số tròn để biết hệ thống cần cỡ nào: vài nghìn QPS hay vài trăm nghìn, vài GB hay vài trăm TB. Con số quyết định kiến trúc: 500 QPS thì một PostgreSQL là đủ, 500.000 QPS ghi thì phải nghĩ đến sharding hoặc kho dữ liệu khác. Trong phỏng vấn, hãy nêu giả định rõ ràng, làm tròn mạnh, và nói con số dẫn đến quyết định gì."
        ],
        list: [
          "1 ngày ≈ 86.400 giây ≈ 10^5 giây (làm tròn cho dễ nhân chia).",
          "1 triệu request/ngày ≈ 12 request/giây trung bình.",
          "Peak thường lấy gấp 2 đến 5 lần trung bình, tùy đặc thù.",
          "Đơn vị: KB = 10^3, MB = 10^6, GB = 10^9, TB = 10^12 byte (xấp xỉ).",
          "Độ trễ cỡ lớn: đọc RAM cỡ trăm nano giây, round-trip trong cùng datacenter cỡ dưới 1 ms, đọc SSD ngẫu nhiên cỡ vài chục đến trăm micro giây, round-trip liên lục địa cỡ trăm ms."
        ]
      },
      {
        h: "Ví dụ: 10 triệu người dùng hoạt động mỗi ngày",
        p: [
          "Giả định một ứng dụng mạng xã hội nhỏ: 10 triệu DAU, mỗi người đọc 50 lần và đăng 2 bài mỗi ngày, mỗi bài trung bình 1 KB text, 10% bài kèm ảnh 200 KB. Các con số là giả định để luyện tập, không phải số liệu thật."
        ],
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Đọc:  10M x 50 = 500M/ngày  / 10^5 s  ≈ 5.000 QPS   (peak x3 ≈ 15.000)
Ghi:  10M x 2  = 20M/ngày   / 10^5 s  ≈ 200 QPS     (peak x3 ≈ 600)
Tỉ lệ đọc:ghi ≈ 25:1  -> hệ thống đọc nhiều, ưu tiên cache + read replica

Lưu trữ text: 20M bài x 1 KB        = 20 GB/ngày
Lưu trữ ảnh:  2M ảnh  x 200 KB      = 400 GB/ngày
5 năm:        ~420 GB x 365 x 5     ≈ 770 TB  (chưa tính replication x3)
-> text vừa PostgreSQL (vài chục TB sau 5 năm, cần partition/archive),
   ảnh phải ở object storage + CDN

Băng thông ra (ảnh): giả sử 20% lượt đọc tải 1 ảnh 200 KB
   5.000 x 0,2 x 200 KB ≈ 200 MB/s ≈ 1,6 Gbps trung bình -> cần CDN

Cache: 20% bài nóng trong ngày = 4M x 1 KB ≈ 4 GB -> vừa một Redis`
        }
      },
      {
        h: "Dùng con số để ra quyết định",
        p: [
          "Từ kết quả trên bạn rút ra: ghi 600 QPS lúc peak một PostgreSQL chịu được; đọc 15.000 QPS nên đi qua cache để giảm tải DB; ảnh chiếm gần hết dung lượng nên phải tách sang object storage; băng thông ảnh lớn nên cần CDN. Tức là ước lượng chỉ ra phần nào là điểm nghẽn.",
          "Mẹo khi làm: viết giả định trước, dùng lũy thừa 10, chỉ giữ một hai chữ số có nghĩa, kiểm tra lại đơn vị (bit hay byte, giây hay ngày). Người phỏng vấn đánh giá cách suy luận hơn là độ chính xác tuyệt đối."
        ]
      }
    ],
    summary: [
      "Nhớ vài hằng số: 1 ngày ≈ 10^5 giây, 1 triệu/ngày ≈ 12/giây, peak gấp 2 đến 5 lần.",
      "Tính riêng QPS đọc, QPS ghi, dung lượng theo thời gian và băng thông.",
      "Nêu rõ giả định và làm tròn mạnh; quan trọng là suy luận.",
      "Mỗi con số phải dẫn tới một quyết định thiết kế: cache, replica, shard, CDN, object storage."
    ],
    pitfalls: [
      "Nhầm bit và byte khi tính băng thông: sai 8 lần.",
      "Chỉ tính trung bình mà quên peak: hệ thống được thiết kế cho trung bình sẽ sập đúng giờ cao điểm.",
      "Quên hệ số replication và index khi tính dung lượng: dung lượng thật thường gấp vài lần dữ liệu thô."
    ],
    quiz: [
      {
        q: "100 triệu request/ngày tương ứng khoảng bao nhiêu QPS trung bình?",
        options: ["Khoảng 100", "Khoảng 1.000", "Khoảng 10.000", "Khoảng 100.000"],
        answer: 1,
        explain: "100 x 10^6 / 10^5 giây ≈ 1.000 QPS (chính xác hơn là khoảng 1.157)."
      },
      {
        q: "Ước lượng cho thấy ảnh chiếm hàng trăm TB và băng thông vài Gbps. Quyết định hợp lý nhất?",
        options: ["Lưu ảnh trên object storage và phục vụ qua CDN","Lưu ảnh dạng BYTEA trong PostgreSQL","Lưu ảnh trong Redis","Lưu ảnh trên ổ đĩa của API server"],
        answer: 0,
        explain: "Object storage rẻ và gần như không giới hạn dung lượng; CDN gánh băng thông gần người dùng. DB và Redis quá đắt cho blob lớn; ổ đĩa server không scale ngang được."
      },
      {
        q: "Vì sao cần tính QPS lúc peak chứ không chỉ trung bình?",
        options: ["Vì trung bình luôn bằng 0","Vì peak dễ tính hơn","Vì hệ thống phải chịu được lúc tải cao nhất, thường gấp vài lần trung bình","Vì người phỏng vấn không quan tâm trung bình"],
        answer: 2,
        explain: "Tải thực tế dao động theo giờ trong ngày và sự kiện. Thiết kế theo trung bình thì giờ cao điểm sẽ quá tải."
      }
    ]
  },

"p12.m1.t0": {
    sections: [
      {
        h: "Ba kiểu kiến trúc",
        p: [
          "Monolith là một ứng dụng, một lần deploy, thường một database. Dễ phát triển, dễ debug, gọi hàm thay vì gọi mạng, transaction ACID trọn vẹn. Vấn đề chỉ xuất hiện khi code lớn và không có ranh giới: mọi thứ gọi lẫn nhau, sửa một chỗ vỡ chỗ khác, nhiều đội dẫm chân nhau khi deploy.",
          "Modular monolith vẫn là một đơn vị deploy nhưng chia thành các module có ranh giới rõ: mỗi module sở hữu dữ liệu của mình (schema hoặc bảng riêng), chỉ lộ ra một API công khai, module khác không được truy cập thẳng vào bảng hay class nội bộ. Bạn có kỷ luật của microservices mà không phải trả chi phí mạng.",
          "Microservices tách mỗi năng lực nghiệp vụ thành service riêng, deploy độc lập, database riêng, giao tiếp qua HTTP/gRPC hoặc message. Lợi ích: các đội tự chủ, scale riêng từng phần, cô lập lỗi, chọn công nghệ riêng. Chi phí: mạng không tin cậy, transaction phân tán, nhất quán cuối cùng, cần observability, CI/CD, service discovery, và vận hành nhiều thứ hơn hẳn."
        ]
      },
      {
        h: "Vì sao nên bắt đầu bằng modular monolith",
        p: [
          "Ở giai đoạn đầu, bạn chưa biết ranh giới nghiệp vụ đúng nằm ở đâu. Cắt sai trong monolith thì refactor trong vài giờ; cắt sai giữa hai microservice thì phải đổi API, di chuyển dữ liệu và phối hợp nhiều đội. Modular monolith cho bạn thời gian học domain, đồng thời giữ đường lui: module có ranh giới tốt có thể tách ra thành service sau này.",
          "Lý do chính đáng để tách service: nhiều đội cần deploy độc lập và đang cản nhau; một phần có yêu cầu scale hoặc tài nguyên rất khác (ví dụ xử lý video cần GPU); cần cô lập lỗi hoặc bảo mật (thanh toán, PCI); hoặc cần công nghệ khác. “Microservices cho hiện đại” không phải lý do."
        ]
      },
      {
        h: "Giữ ranh giới trong NestJS",
        p: [
          "Trong NestJS, mỗi module chỉ `exports` một facade service. Module khác inject facade đó, không import repository hay entity nội bộ. Có thể dùng lint rule (ví dụ `eslint-plugin-boundaries` hoặc dependency-cruiser) để CI chặn import sai. Giao tiếp không đồng bộ giữa module có thể dùng event nội bộ, sau này đổi thành message broker khi tách service."
        ],
        code: {
          lang: "typescript",
          file: "src/modules/billing/billing.module.ts",
          src: `// Chỉ BillingFacade là API công khai; repository và entity là nội bộ
@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  providers: [BillingFacade, InvoiceRepository, InvoiceService],
  exports: [BillingFacade],
})
export class BillingModule {}

// src/modules/orders/order.service.ts
@Injectable()
export class OrderService {
  constructor(private readonly billing: BillingFacade) {}

  async checkout(orderId: string) {
    // Gọi qua facade, không truy vấn thẳng bảng invoices
    return this.billing.createInvoiceForOrder(orderId);
  }
}`
        }
      },
      {
        h: "Distributed monolith: kết quả tệ nhất",
        p: [
          "Nếu bạn tách service nhưng chúng dùng chung database, phải deploy cùng lúc, hoặc một request đi qua chuỗi 6 lời gọi đồng bộ, bạn có distributed monolith: mọi nhược điểm của monolith cộng với mọi nhược điểm của hệ phân tán. Dấu hiệu nhận biết: không thể deploy một service mà không deploy service khác, hoặc một service chết kéo sập tất cả."
        ]
      }
    ],
    summary: [
      "Monolith đơn giản và nhanh cho giai đoạn đầu; vấn đề thật là thiếu ranh giới, không phải là một khối.",
      "Modular monolith: một lần deploy, nhưng module có dữ liệu và API công khai riêng.",
      "Microservices đổi độ phức tạp vận hành lấy khả năng deploy và scale độc lập.",
      "Tách service vì lý do tổ chức, scale, cô lập; tránh distributed monolith."
    ],
    pitfalls: [
      "Tách microservices từ ngày đầu với đội 3 người: tốn thời gian cho hạ tầng thay vì sản phẩm.",
      "Nhiều service dùng chung một database và join bảng của nhau: không thể thay đổi schema độc lập.",
      "Module trong monolith import thẳng repository của nhau: ranh giới chỉ trên giấy, không tách ra được sau này."
    ],
    quiz: [
      {
        q: "Đặc điểm nào phân biệt modular monolith với monolith thông thường?",
        options: ["Deploy thành nhiều container","Không dùng database","Mỗi module dùng ngôn ngữ lập trình khác","Các module có ranh giới rõ, sở hữu dữ liệu riêng và chỉ giao tiếp qua API công khai"],
        answer: 3,
        explain: "Modular monolith vẫn là một đơn vị deploy; khác biệt nằm ở kỷ luật ranh giới bên trong."
      },
      {
        q: "Lý do nào là lý do tốt để tách một phần thành microservice?",
        options: ["Vì microservices là xu hướng", "Vì đội muốn thử Kubernetes", "Phần đó cần scale và tài nguyên rất khác (ví dụ xử lý video cần GPU)", "Vì file code quá dài"],
        answer: 2,
        explain: "Nhu cầu scale/tài nguyên khác biệt là lý do kỹ thuật thật. File dài hay xu hướng giải quyết bằng tổ chức code tốt hơn, không cần tách mạng."
      },
      {
        q: "Hai service phải deploy cùng lúc mỗi lần thay đổi và cùng đọc ghi một database. Đây là dấu hiệu của gì?",
        options: ["Distributed monolith","Microservices chuẩn mực","Event sourcing","Serverless"],
        answer: 0,
        explain: "Coupling chặt về deploy và dữ liệu nghĩa là chúng không thật sự độc lập; bạn trả chi phí phân tán mà không được lợi ích."
      }
    ]
  },

  "p12.m1.t1": {
    sections: [
      {
        h: "Ý tưởng cốt lõi",
        p: [
          "Clean Architecture và Hexagonal Architecture (Ports and Adapters) cùng một ý: logic nghiệp vụ nằm ở trung tâm và không phụ thuộc vào framework, database hay giao thức. Mọi phụ thuộc hướng vào trong. Domain không biết đến NestJS, TypeORM, Express hay Kafka.",
          "Hexagonal mô tả bằng port và adapter. Port là interface do tầng nghiệp vụ định nghĩa, ví dụ `OrderRepository` hay `PaymentGateway`. Adapter là cài đặt cụ thể: `PostgresOrderRepository`, `StripePaymentGateway`. Có hai loại: driving adapter gọi vào ứng dụng (HTTP controller, consumer của queue, CLI) và driven adapter được ứng dụng gọi ra (DB, API bên ngoài, broker)."
        ]
      },
      {
        h: "Cấu trúc thư mục và code",
        code: {
          lang: "typescript",
          file: "src/orders/application/place-order.use-case.ts",
          src: `// domain/ : entity, value object, quy tắc nghiệp vụ (không import framework)
// application/ : use case + port (interface)
// infrastructure/ : adapter cho DB, HTTP client, broker
// interface/ : controller, consumer

export interface OrderRepository {            // port (driven)
  save(order: Order): Promise<void>;
}
export interface PaymentGateway {             // port (driven)
  charge(customerId: string, amount: Money): Promise<{ chargeId: string }>;
}

export class PlaceOrderUseCase {
  constructor(private orders: OrderRepository, private payments: PaymentGateway) {}

  async execute(cmd: { customerId: string; items: Item[] }) {
    const order = Order.create(cmd.customerId, cmd.items); // quy tắc nằm trong domain
    const { chargeId } = await this.payments.charge(cmd.customerId, order.total());
    order.markPaid(chargeId);
    await this.orders.save(order);
    return order.id;
  }
}

// infrastructure/postgres-order.repository.ts : implements OrderRepository
// Trong NestJS: { provide: 'OrderRepository', useClass: PostgresOrderRepository }`
        },
        p: [
          "Controller chỉ chuyển HTTP request thành command và gọi use case. Use case điều phối, còn quy tắc (ví dụ đơn hàng phải có ít nhất một sản phẩm, không được thanh toán hai lần) nằm trong entity `Order`. NestJS DI ghép adapter thật vào port lúc chạy.",
          "Quy tắc phụ thuộc có thể kiểm tra tự động: thư mục `domain` không được import từ `infrastructure` hay từ `@nestjs/*`, và `application` chỉ biết interface chứ không biết class adapter cụ thể. Khi test, bạn thay `PostgresOrderRepository` bằng một `InMemoryOrderRepository` dùng `Map`, và thay cổng thanh toán bằng bản giả luôn trả thành công hoặc luôn lỗi để kiểm tra các nhánh xử lý. Nhờ vậy use case được test đầy đủ mà không cần container PostgreSQL hay tài khoản sandbox của nhà cung cấp thanh toán."
        ]
      },
      {
        h: "Lợi ích và cái giá",
        p: [
          "Lợi ích lớn nhất là test: bạn test use case với adapter giả in-memory, chạy trong mili giây, không cần DB. Thứ hai là thay công nghệ dễ hơn: đổi Stripe sang nhà cung cấp khác chỉ viết adapter mới. Thứ ba là logic nghiệp vụ dễ đọc vì không lẫn chi tiết kỹ thuật.",
          "Cái giá: nhiều file và nhiều lớp mapping (entity domain, model ORM, DTO). Với service CRUD đơn giản, việc này thừa. Áp dụng ở mức vừa phải: dùng đầy đủ cho phần có nghiệp vụ phức tạp (thanh toán, định giá), còn phần CRUD quản trị có thể để controller gọi thẳng repository. Đừng tạo interface cho mọi thứ chỉ vì “kiến trúc sạch”."
        ]
      }
    ],
    summary: [
      "Domain ở trung tâm, phụ thuộc chỉ hướng vào trong; domain không import framework.",
      "Port là interface do ứng dụng định nghĩa; adapter là cài đặt cho DB, HTTP, queue.",
      "Driving adapter gọi vào (controller, consumer); driven adapter được gọi ra (DB, API ngoài).",
      "Lợi ích chính: test nhanh với adapter giả và thay công nghệ dễ; cái giá là thêm lớp và mapping."
    ],
    pitfalls: [
      "Để entity domain kế thừa hoặc gắn decorator của ORM rồi gọi đó là Clean Architecture: domain vẫn phụ thuộc hạ tầng.",
      "Áp dụng đầy đủ các lớp cho mọi màn CRUD: code phình to mà không thêm giá trị.",
      "Đặt quy tắc nghiệp vụ trong controller hoặc adapter: logic bị phân tán và không test độc lập được."
    ],
    quiz: [
      {
        q: "Trong Hexagonal Architecture, `PaymentGateway` interface nằm ở tầng nào?",
        options: ["Infrastructure","Controller","Application/domain (port), do tầng nghiệp vụ định nghĩa","Trong thư viện của Stripe"],
        answer: 2,
        explain: "Port được định nghĩa bởi tầng trong theo nhu cầu nghiệp vụ; adapter ở tầng ngoài cài đặt nó. Nhờ vậy phụ thuộc hướng vào trong."
      },
      {
        q: "Consumer đọc message từ RabbitMQ rồi gọi use case thuộc loại adapter nào?",
        options: ["Driven adapter","Port","Domain entity","Driving adapter"],
        answer: 3,
        explain: "Consumer kích hoạt ứng dụng từ bên ngoài, giống HTTP controller, nên là driving adapter. Driven adapter là thứ ứng dụng gọi ra như DB."
      },
      {
        q: "Lợi ích thực tế lớn nhất của việc domain không phụ thuộc DB là gì?",
        options: ["Test logic nghiệp vụ nhanh với adapter giả mà không cần DB thật","Chạy nhanh hơn trên production","Không cần viết migration","Không cần transaction"],
        answer: 0,
        explain: "Tách phụ thuộc giúp unit test use case trong bộ nhớ. Nó không làm production nhanh hơn và vẫn cần migration, transaction ở adapter."
      }
    ]
  },

  "p12.m1.t2": {
    sections: [
      {
        h: "Ubiquitous language và bounded context",
        p: [
          "Domain-Driven Design (DDD) là cách thiết kế phần mềm bám sát nghiệp vụ. Ubiquitous language là bộ từ vựng chung giữa dev và người nghiệp vụ, dùng nhất quán trong họp, tài liệu và cả tên class, tên hàm. Nếu nghiệp vụ nói “đơn bị hủy do quá hạn thanh toán” thì code nên có `order.expire()`, không phải `updateStatus(4)`.",
          "Bounded context là ranh giới mà trong đó một mô hình và một bộ từ vựng có nghĩa nhất quán. Cùng từ “Product” nhưng trong Catalog là mô tả, ảnh, danh mục; trong Inventory là số lượng tồn theo kho; trong Billing là giá và thuế. Thay vì một class Product khổng lồ, mỗi context có mô hình riêng. Bounded context là ứng viên tự nhiên cho module hoặc microservice. Context map mô tả cách các context liên hệ, ví dụ dùng anti-corruption layer để dịch mô hình của hệ thống bên ngoài."
        ]
      },
      {
        h: "Aggregate: ranh giới nhất quán",
        p: [
          "Aggregate là một cụm entity và value object được xử lý như một đơn vị nhất quán, có một aggregate root làm cửa ngõ duy nhất. Ví dụ `Order` là root, `OrderLine` nằm bên trong; code bên ngoài không sửa `OrderLine` trực tiếp mà gọi `order.addLine()`. Root bảo vệ các bất biến (invariant) như tổng tiền không âm, không thêm hàng vào đơn đã thanh toán.",
          "Quy tắc thực hành: mỗi transaction chỉ sửa một aggregate; aggregate khác tham chiếu nhau bằng ID, không giữ object; giữ aggregate nhỏ. Nhất quán giữa các aggregate đạt được qua domain event và eventual consistency. Aggregate cũng là đơn vị để dùng optimistic locking bằng cột version."
        ],
        code: {
          lang: "typescript",
          file: "src/orders/domain/order.ts",
          src: `export class Order {
  private events: DomainEvent[] = [];
  private constructor(
    readonly id: string,
    private status: 'draft' | 'placed' | 'paid' | 'cancelled',
    private lines: OrderLine[],
    public version: number,
  ) {}

  addLine(productId: string, qty: number, price: Money) {
    if (this.status !== 'draft') throw new DomainError('Chỉ sửa được đơn nháp');
    if (qty <= 0) throw new DomainError('Số lượng phải dương');
    this.lines.push(new OrderLine(productId, qty, price));
  }

  place() {
    if (this.lines.length === 0) throw new DomainError('Đơn trống');
    this.status = 'placed';
    this.events.push({ type: 'OrderPlaced', orderId: this.id, total: this.total() });
  }

  total(): Money { return this.lines.reduce((s, l) => s.add(l.subtotal()), Money.zero()); }
  pullEvents() { const e = this.events; this.events = []; return e; }
}`
        }
      },
      {
        h: "Domain event và khi nào dùng DDD",
        p: [
          "Domain event mô tả điều đã xảy ra trong nghiệp vụ, đặt tên ở thì quá khứ: `OrderPlaced`, `PaymentFailed`. Aggregate ghi nhận event, repository lưu aggregate rồi phát event (lý tưởng là qua outbox trong cùng transaction). Context khác phản ứng: Inventory giữ hàng, Notification gửi email. Nhờ vậy các context không gọi trực tiếp nhau.",
          "DDD chiến lược (bounded context, ubiquitous language) hữu ích cho hầu hết hệ thống vừa và lớn. DDD chiến thuật (aggregate, value object, repository) đáng dùng ở core domain có nghiệp vụ phức tạp. Với phần phụ trợ đơn giản thì CRUD thẳng là đủ."
        ]
      }
    ],
    summary: [
      "Ubiquitous language: dùng cùng từ vựng nghiệp vụ trong trao đổi và trong code.",
      "Bounded context: mỗi ngữ cảnh có mô hình riêng; là ứng viên tốt cho module/service.",
      "Aggregate là ranh giới nhất quán, sửa qua root, một transaction một aggregate, tham chiếu nhau bằng ID.",
      "Domain event (thì quá khứ) giúp các context phối hợp mà không gọi trực tiếp nhau."
    ],
    pitfalls: [
      "Aggregate quá lớn (Customer chứa mọi Order): khóa tranh chấp nhiều và tải dữ liệu nặng. Tách nhỏ, tham chiếu bằng ID.",
      "Entity chỉ có getter/setter, mọi quy tắc nằm trong service (anemic domain model): mất lợi ích chính của DDD.",
      "Một mô hình dùng chung cho mọi context: class phình to và thay đổi ở context này làm vỡ context khác."
    ],
    quiz: [
      {
        q: "Vì sao nên để các aggregate tham chiếu nhau bằng ID thay vì giữ object?",
        options: ["Để tiết kiệm RAM","Vì TypeScript không hỗ trợ tham chiếu object","Để giữ ranh giới nhất quán và transaction nhỏ, tránh sửa nhiều aggregate cùng lúc","Để dùng được UUID"],
        answer: 2,
        explain: "Tham chiếu bằng ID ngăn code vô tình sửa aggregate khác trong cùng transaction, giữ mỗi aggregate là một đơn vị nhất quán độc lập."
      },
      {
        q: "Tên nào phù hợp cho domain event?",
        options: ["PlaceOrder","UpdateOrderStatus","OrderService","OrderPlaced"],
        answer: 3,
        explain: "Event mô tả điều đã xảy ra nên dùng thì quá khứ. `PlaceOrder` là command (yêu cầu làm gì đó), các tên còn lại là class hoặc hàm kỹ thuật."
      },
      {
        q: "Từ “Customer” có thuộc tính khác nhau trong Sales và Support. Theo DDD, cách xử lý là gì?",
        options: ["Mỗi bounded context có mô hình Customer riêng, liên kết bằng ID","Gộp tất cả thuộc tính vào một class Customer chung","Đổi tên để tránh trùng","Chỉ giữ mô hình của Sales"],
        answer: 0,
        explain: "Bounded context cho phép cùng một khái niệm có mô hình khác nhau theo ngữ cảnh, tránh class khổng lồ và coupling giữa các đội."
      }
    ]
  },

  "p12.m1.t3": {
    sections: [
      {
        h: "CQRS: tách mô hình đọc và ghi",
        p: [
          "CQRS (Command Query Responsibility Segregation) tách phía ghi (command: thay đổi trạng thái, kiểm tra quy tắc) và phía đọc (query: trả dữ liệu, không thay đổi gì). Lý do: nhu cầu hai phía rất khác nhau. Phía ghi cần mô hình chuẩn hóa để bảo vệ bất biến; phía đọc cần dữ liệu đã join sẵn, phẳng, phù hợp từng màn hình.",
          "CQRS có nhiều mức. Mức nhẹ: cùng một database, nhưng command đi qua domain model còn query dùng SQL tối ưu hoặc view. Mức nặng: phía đọc là kho riêng (bảng denormalized, Elasticsearch, Redis) được cập nhật từ event của phía ghi. Mức nặng cho phép scale đọc độc lập nhưng phía đọc chỉ nhất quán cuối cùng: vừa ghi xong có thể chưa thấy ngay."
        ]
      },
      {
        h: "Event Sourcing: lưu sự kiện thay vì trạng thái",
        p: [
          "Với Event Sourcing, bạn không lưu trạng thái hiện tại mà lưu chuỗi sự kiện bất biến: `AccountOpened`, `MoneyDeposited(100)`, `MoneyWithdrawn(30)`. Trạng thái hiện tại tính bằng cách áp dụng lần lượt các sự kiện. Event store chỉ ghi nối (append-only). Để tránh hai lệnh ghi đè nhau, mỗi lần append kiểm tra version mong đợi của stream (optimistic concurrency)."
        ],
        code: {
          lang: "sql",
          file: "event-store.sql",
          src: `CREATE TABLE events (
  stream_id   uuid        NOT NULL,
  version     int         NOT NULL,
  type        text        NOT NULL,
  data        jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (stream_id, version)   -- trùng version => xung đột đồng thời
);

-- Append: ứng dụng đọc stream ở version 7, ghi event tiếp theo là 8.
-- Nếu lệnh khác đã ghi version 8 trước, INSERT lỗi unique => reload và thử lại.
INSERT INTO events (stream_id, version, type, data)
VALUES ($1, 8, 'MoneyWithdrawn', '{"amount": 30}');

-- Rebuild trạng thái
SELECT type, data FROM events WHERE stream_id = $1 ORDER BY version;`
        }
      },
      {
        h: "Projection, snapshot và đánh đổi",
        p: [
          "Projection là tiến trình đọc event và xây mô hình đọc (ví dụ bảng `account_balances`). Đây là chỗ CQRS và Event Sourcing gặp nhau. Bạn có thể xóa projection và dựng lại từ đầu, hoặc tạo projection mới cho nhu cầu báo cáo mới từ dữ liệu lịch sử. Stream dài thì dùng snapshot: lưu trạng thái ở version N để không phải replay từ đầu.",
          "Lợi ích: audit log đầy đủ tự nhiên, tái hiện trạng thái tại mọi thời điểm, debug bằng cách replay. Hợp với tài chính, sổ cái, hệ thống cần truy vết. Chi phí: khó hơn nhiều so với CRUD. Thay đổi schema event (versioning, upcasting) phức tạp vì event cũ tồn tại mãi; truy vấn phải qua projection; projection trễ; xóa dữ liệu cá nhân theo GDPR cần kỹ thuật riêng như crypto-shredding. Đừng dùng Event Sourcing cho toàn hệ thống; chỉ cho aggregate thật sự hưởng lợi."
        ]
      }
    ],
    summary: [
      "CQRS tách command (ghi, bảo vệ quy tắc) và query (đọc, tối ưu theo màn hình).",
      "CQRS mức nặng dùng kho đọc riêng, phía đọc nhất quán cuối cùng.",
      "Event Sourcing lưu chuỗi event bất biến; trạng thái là kết quả replay.",
      "Projection dựng mô hình đọc từ event; snapshot tránh replay dài.",
      "Mạnh cho audit và tài chính nhưng phức tạp; chỉ dùng nơi thật sự cần."
    ],
    pitfalls: [
      "Áp dụng Event Sourcing cho mọi entity CRUD: tăng độ phức tạp mà không có nhu cầu audit/replay.",
      "Sửa hoặc xóa event cũ trong event store: phá vỡ tính bất biến. Hãy thêm event bù trừ hoặc dùng upcaster khi đọc.",
      "Giao diện đọc ngay từ projection sau khi ghi mà không xử lý độ trễ: người dùng tưởng thao tác thất bại."
    ],
    quiz: [
      {
        q: "Trong CQRS với kho đọc riêng, hệ quả phổ biến là gì?",
        options: ["Phía đọc nhất quán cuối cùng so với phía ghi", "Không thể dùng SQL", "Phía ghi không kiểm tra quy tắc", "Không cần database"],
        answer: 0,
        explain: "Kho đọc được cập nhật bất đồng bộ từ event nên có độ trễ. Phía ghi vẫn kiểm tra quy tắc và cả hai phía đều có thể dùng SQL."
      },
      {
        q: "Khóa chính `(stream_id, version)` trong bảng event dùng để làm gì?",
        options: ["Tăng tốc truy vấn full-text","Nén dữ liệu","Phát hiện hai lệnh ghi đồng thời lên cùng stream (optimistic concurrency)","Tự động tạo snapshot"],
        answer: 2,
        explain: "Nếu hai tiến trình cùng muốn ghi version 8, chỉ một thành công; tiến trình kia nhận lỗi unique, phải đọc lại và thử lại."
      },
      {
        q: "Khi nào Event Sourcing đáng dùng nhất?",
        options: ["Trang quản trị danh mục đơn giản","Cache session","Blog cá nhân","Sổ cái tài chính cần audit và tái hiện trạng thái theo thời gian"],
        answer: 3,
        explain: "Lịch sử đầy đủ và khả năng replay là giá trị cốt lõi của Event Sourcing, rất hợp với sổ cái. Các trường hợp còn lại dùng CRUD là đủ."
      }
    ]
  },

  "p12.m1.t4": {
    sections: [
      {
        h: "API Gateway làm gì",
        p: [
          "API Gateway là điểm vào duy nhất cho client, đứng trước các service. Thay vì client biết địa chỉ của 10 service, nó gọi một domain, gateway route tới đúng service. Gateway xử lý tập trung các mối quan tâm chung (cross-cutting concerns) để service không phải lặp lại."
        ],
        list: [
          "Routing theo path/host/header, và canary theo trọng số.",
          "Xác thực: kiểm tra JWT hoặc API key, rồi chuyển thông tin user xuống service qua header tin cậy.",
          "Rate limiting và quota theo API key, user hoặc IP.",
          "Terminate TLS, CORS, nén, giới hạn kích thước body.",
          "Logging, metrics, gắn trace id cho mọi request.",
          "Ví dụ công cụ: Kong, Envoy, NGINX, Traefik, AWS API Gateway."
        ]
      },
      {
        h: "Giữ gateway mỏng",
        p: [
          "Gateway là tầng mọi request đi qua, nên nó phải nhanh, ổn định và chạy nhiều instance. Đừng đặt logic nghiệp vụ vào gateway: logic ở đó khó test, khó deploy và biến gateway thành một monolith mới mà mọi đội phải xếp hàng sửa. Gateway nên lo hạ tầng; service lo nghiệp vụ, kể cả phân quyền chi tiết (user này có được sửa đơn hàng kia không).",
          "Gateway cũng không thay thế bảo mật trong mạng nội bộ. Nếu service tin mọi header `x-user-id` mà không kiểm tra nguồn, kẻ tấn công vào được mạng nội bộ sẽ giả mạo được. Dùng mTLS giữa các service hoặc để service tự verify token."
        ]
      },
      {
        h: "Backend-for-Frontend (BFF)",
        p: [
          "Web, mobile và đối tác có nhu cầu khác nhau: mobile cần payload nhỏ, ít round-trip vì mạng chậm; web cần dữ liệu phong phú; đối tác cần API ổn định có version. Một API chung cho tất cả thường thành thỏa hiệp tệ. BFF là một backend riêng cho từng loại client, do chính đội frontend đó sở hữu, gom dữ liệu từ nhiều service thành đúng hình dạng màn hình cần.",
          "Đánh đổi: nhiều BFF là nhiều code phải duy trì và dễ lặp logic. Giữ BFF chỉ làm aggregation và định dạng, logic nghiệp vụ vẫn ở service. Nếu chỉ có một web app, một gateway cộng một API tốt là đủ. GraphQL cũng là một cách giải quyết bài toán tương tự."
        ],
        code: {
          lang: "typescript",
          file: "bff-mobile/src/home.controller.ts",
          src: `@Controller('home')
export class HomeController {
  constructor(private users: UserClient, private orders: OrderClient, private promos: PromoClient) {}

  @Get()
  async home(@Req() req: AuthedRequest) {
    // Gọi song song; khuyến mãi là phụ nên lỗi thì trả rỗng
    const [user, recent, promos] = await Promise.all([
      this.users.get(req.userId),
      this.orders.recent(req.userId, 3),
      this.promos.forUser(req.userId).catch(() => []),
    ]);
    // Trả đúng hình dạng màn hình mobile cần, gọn nhẹ
    return {
      name: user.displayName,
      avatar: user.avatarThumbUrl,
      recentOrders: recent.map((o) => ({ id: o.id, status: o.status, total: o.total })),
      promos: promos.slice(0, 5),
    };
  }
}`
        }
      }
    ],
    summary: [
      "API Gateway là điểm vào chung: routing, xác thực, rate limit, TLS, observability.",
      "Giữ gateway mỏng, không đặt logic nghiệp vụ; phân quyền chi tiết để ở service.",
      "BFF là backend riêng cho từng loại client, gom và định hình dữ liệu cho màn hình.",
      "BFF thêm code phải duy trì; chỉ dùng khi các client có nhu cầu thật sự khác nhau."
    ],
    pitfalls: [
      "Đưa logic nghiệp vụ vào plugin của gateway: khó test, khó deploy và thành nút cổ chai về tổ chức.",
      "Chạy một instance gateway: điểm lỗi duy nhất cho toàn hệ thống.",
      "Service tin header danh tính mà không có mTLS hoặc kiểm tra token: dễ bị giả mạo từ trong mạng nội bộ."
    ],
    quiz: [
      {
        q: "Việc nào KHÔNG nên đặt ở API Gateway?",
        options: ["Kiểm tra JWT", "Rate limit theo API key", "Tính giá đơn hàng theo khuyến mãi", "Terminate TLS"],
        answer: 2,
        explain: "Tính giá là logic nghiệp vụ, thuộc về service. Ba việc còn lại là mối quan tâm chung, rất hợp với gateway."
      },
      {
        q: "Vì sao ứng dụng mobile hưởng lợi từ BFF?",
        options: ["Vì BFF gom nhiều lời gọi thành một response gọn, giảm round-trip trên mạng chậm","Vì mobile không hỗ trợ HTTP","Vì BFF thay thế database","Vì BFF bắt buộc dùng GraphQL"],
        answer: 0,
        explain: "Mạng di động có độ trễ cao, nên gom dữ liệu phía server và cắt bớt trường thừa giúp màn hình tải nhanh hơn. BFF không bắt buộc GraphQL."
      },
      {
        q: "Ai thường sở hữu BFF?",
        options: ["Đội hạ tầng","Nhà cung cấp cloud","Đội frontend của loại client tương ứng","Đội database"],
        answer: 2,
        explain: "BFF gắn chặt với nhu cầu màn hình, nên đội frontend tương ứng sở hữu để thay đổi nhanh theo UI."
      }
    ]
  },

  "p12.m1.t5": {
    sections: [
      {
        h: "Serverless là gì",
        p: [
          "Serverless (Function as a Service) như AWS Lambda, Google Cloud Functions, Azure Functions cho phép bạn chỉ viết hàm xử lý sự kiện: HTTP request, file mới trên S3, message trong queue, lịch cron. Nhà cung cấp lo server, scale và vá hệ điều hành. Bạn trả tiền theo số lần gọi và thời gian chạy, không chạy thì gần như không tốn.",
          "Mô hình này hợp với tải không đều hoặc không đoán trước: webhook, xử lý ảnh sau upload, job định kỳ, API nội bộ ít dùng, prototype. Tải tăng đột ngột thì nền tảng tự tạo thêm instance."
        ],
        code: {
          lang: "typescript",
          file: "src/handlers/thumbnail.ts",
          src: `import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import type { S3Event } from 'aws-lambda';
import sharp from 'sharp';

// Khởi tạo ngoài handler để tái sử dụng giữa các lần gọi (warm start)
const s3 = new S3Client({});

export const handler = async (event: S3Event) => {
  for (const r of event.Records) {
    const Bucket = r.s3.bucket.name;
    const Key = decodeURIComponent(r.s3.object.key.replace(/\\+/g, ' '));
    const obj = await s3.send(new GetObjectCommand({ Bucket, Key }));
    const input = Buffer.from(await obj.Body!.transformToByteArray());
    const thumb = await sharp(input).resize(256).webp().toBuffer();
    // Ghi sang bucket khác để không tự kích hoạt lại chính hàm này
    await s3.send(new PutObjectCommand({ Bucket: Bucket + '-thumbs', Key: Key + '.webp', Body: thumb }));
  }
};`
        }
      },
      {
        h: "Những giới hạn cần biết",
        list: [
          "Cold start: lần gọi đầu (hoặc khi scale thêm) phải khởi động môi trường, tải code, chạy init; có thể thêm từ trăm ms đến vài giây tùy runtime và kích thước bundle. Giảm bằng bundle nhỏ, init ít, hoặc provisioned concurrency (tốn tiền).",
          "Giới hạn thời gian chạy: ví dụ Lambda tối đa 15 phút. Job dài phải chia nhỏ hoặc dùng container/workflow.",
          "Không có state cục bộ bền vững; bộ nhớ và /tmp chỉ tái sử dụng may rủi giữa các lần gọi.",
          "Kết nối DB: hàng nghìn instance đồng thời có thể làm cạn connection của PostgreSQL. Cần connection pooler (RDS Proxy, PgBouncer) và giới hạn concurrency.",
          "Vendor lock-in: trigger, IAM, cấu hình gắn chặt với một cloud. Giữ logic nghiệp vụ tách khỏi handler để dễ di chuyển."
        ],
        p: [
          "Ngoài ra còn khó debug và test cục bộ hơn, và cần observability tốt vì một luồng có thể đi qua nhiều hàm."
        ]
      },
      {
        h: "Khi nào chọn và khi nào không",
        p: [
          "Về chi phí: với tải thấp hoặc thất thường, serverless thường rẻ hơn vì không trả cho thời gian rảnh. Với tải cao và ổn định suốt ngày, container hoặc VM chạy liên tục thường rẻ hơn tính trên mỗi request. Hãy tính theo số liệu tải của chính bạn trước khi quyết định.",
          "Không hợp với: API cần độ trễ thấp ổn định mà không chịu được cold start, kết nối lâu dài như WebSocket (trừ khi dùng dịch vụ quản lý riêng), xử lý dài hoặc cần GPU. Nhiều hệ thống dùng kết hợp: API chính chạy container trên Kubernetes, các tác vụ phụ theo sự kiện chạy Lambda."
        ]
      }
    ],
    summary: [
      "Serverless: viết hàm theo sự kiện, nền tảng lo scale, trả tiền theo lượt dùng.",
      "Hợp với tải không đều: webhook, xử lý file, cron, prototype.",
      "Lưu ý cold start, giới hạn thời gian chạy, không có state, cạn connection DB.",
      "Vendor lock-in: tách logic nghiệp vụ khỏi handler; tải cao ổn định thường rẻ hơn với container."
    ],
    pitfalls: [
      "Lambda ghi output vào chính bucket kích hoạt nó: tạo vòng lặp vô hạn và hóa đơn lớn. Ghi sang bucket hoặc prefix khác và lọc trigger.",
      "Mở kết nối PostgreSQL mới trong mỗi lần gọi và không giới hạn concurrency: DB hết connection khi tải tăng.",
      "Xử lý message không idempotent: trigger từ queue có thể gọi lại hàm nhiều lần cho cùng một message."
    ],
    quiz: [
      {
        q: "Cold start là gì?",
        options: ["Lỗi khi hàm hết bộ nhớ","Thời gian chờ khi DB khởi động","Hàm chạy ở vùng có nhiệt độ thấp","Độ trễ thêm khi nền tảng phải khởi tạo môi trường mới cho hàm"],
        answer: 3,
        explain: "Khi chưa có instance ấm, nền tảng phải tạo môi trường và chạy code khởi tạo, làm lần gọi đó chậm hơn."
      },
      {
        q: "Một job xử lý video mất 40 phút. Lựa chọn nào hợp lý?",
        options: ["Chạy trên container/batch job hoặc chia nhỏ thành nhiều bước ngắn","Một Lambda duy nhất","Tăng RAM cho Lambda để vượt giới hạn thời gian","Dùng Cloud Function với cron"],
        answer: 0,
        explain: "Lambda có giới hạn thời gian tối đa 15 phút; tăng RAM không nới giới hạn đó. Job dài hợp với container hoặc được chia bước bằng workflow."
      },
      {
        q: "Vì sao serverless có thể làm cạn connection PostgreSQL?",
        options: ["Vì Lambda không hỗ trợ TCP","Vì PostgreSQL chặn cloud","Vì mỗi instance đồng thời mở connection riêng và số instance có thể tăng rất nhanh","Vì serverless dùng UDP"],
        answer: 2,
        explain: "Scale tự động tạo nhiều instance, mỗi cái giữ connection riêng. Cần pooler như RDS Proxy/PgBouncer và giới hạn concurrency."
      }
    ]
  },

"p12.m2.t0": {
    sections: [
      {
        h: "Vì sao dùng messaging",
        p: [
          "Khi service A gọi HTTP đồng bộ sang B, A phải chờ, và nếu B chết thì A cũng lỗi. Messaging đặt một broker ở giữa: A gửi message rồi đi tiếp, B xử lý khi sẵn sàng. Lợi ích: tách thời gian (B có thể tạm ngừng), hấp thụ tải đột biến (queue làm bộ đệm), retry dễ, và thêm consumer mới mà không sửa producer. Cái giá: độ trễ cuối cùng, khó debug hơn, và phải xử lý message trùng hoặc lệch thứ tự."
        ]
      },
      {
        h: "Queue: chia việc cho worker",
        p: [
          "Mô hình queue (point-to-point): mỗi message được đúng một consumer trong nhóm xử lý. Nhiều worker cùng đọc một queue để chia tải (competing consumers). Dùng cho công việc cần làm một lần: gửi email, resize ảnh, tạo PDF hóa đơn. Muốn xử lý nhanh hơn thì thêm worker.",
          "Consumer xác nhận (ack) sau khi xử lý xong. Nếu worker chết trước khi ack, broker giao lại message cho worker khác. Vì vậy xử lý phải chịu được việc chạy lại."
        ]
      },
      {
        h: "Pub/Sub: phát sự kiện cho nhiều bên",
        p: [
          "Mô hình publish/subscribe: producer phát một event, mọi subscriber quan tâm đều nhận bản riêng. Event `OrderPaid` có thể được Inventory, Notification, Analytics và Loyalty cùng nhận, mỗi bên xử lý độc lập. Producer không biết ai đang nghe, nên thêm tính năng mới chỉ cần thêm subscriber.",
          "Trong thực tế hai mô hình thường kết hợp: mỗi subscriber là một nhóm, bên trong nhóm các instance chia nhau message như queue. RabbitMQ làm bằng fanout/topic exchange trỏ tới nhiều queue, mỗi dịch vụ một queue. Kafka làm bằng consumer group: mỗi group nhận toàn bộ topic, trong group các consumer chia partition."
        ],
        code: {
          lang: "text",
          file: "queue-vs-pubsub.txt",
          src: `QUEUE (competing consumers)
  Producer --> [ queue: send-email ] --> Worker 1   (msg 1, 3)
                                     --> Worker 2   (msg 2, 4)
  Mỗi message chỉ một worker xử lý.

PUB/SUB
  Producer --OrderPaid--> [exchange/topic] --> queue inventory     --> Inventory svc
                                           --> queue notification  --> Notification svc
                                           --> queue analytics     --> Analytics svc
  Mỗi subscriber nhận một bản; bên trong mỗi subscriber lại chia tải như queue.`
        }
      },
      {
        h: "Command và event",
        p: [
          "Phân biệt thêm hai loại message. Command là yêu cầu làm việc gì đó, gửi tới một đích cụ thể: `SendWelcomeEmail`. Event là thông báo điều đã xảy ra, ai muốn thì nghe: `UserRegistered`. Command hợp với queue; event hợp với pub/sub. Thiết kế theo event giúp giảm coupling, nhưng luồng nghiệp vụ trở nên khó theo dõi hơn nếu không có tài liệu và tracing."
        ]
      }
    ],
    summary: [
      "Messaging tách producer và consumer về thời gian, hấp thụ tải đột biến và cho phép retry.",
      "Queue: mỗi message một consumer xử lý; thêm worker để chia tải.",
      "Pub/Sub: mỗi subscriber nhận một bản; thêm subscriber không cần sửa producer.",
      "Command gửi tới một đích; event phát cho ai quan tâm."
    ],
    pitfalls: [
      "Cho nhiều service khác nhau cùng đọc chung một queue để “nhận event”: mỗi message chỉ tới một service. Mỗi subscriber cần queue hoặc consumer group riêng.",
      "Dùng messaging cho thao tác người dùng cần kết quả ngay (kiểm tra mật khẩu): thêm độ trễ và phức tạp không cần thiết.",
      "Xử lý message không idempotent: khi redelivery xảy ra, email bị gửi hai lần."
    ],
    quiz: [
      {
        q: "Ba instance của service email cùng đọc một queue. Một message sẽ được xử lý bởi bao nhiêu instance (trường hợp bình thường)?",
        options: ["Cả ba","Không instance nào cho đến khi có ack","Hai","Một"],
        answer: 3,
        explain: "Đây là competing consumers: broker giao mỗi message cho một consumer. Chỉ khi consumer đó lỗi không ack thì message mới được giao lại."
      },
      {
        q: "Event `OrderPaid` cần được Inventory và Notification cùng xử lý. Cách đúng là gì?",
        options: ["Pub/sub: mỗi service có queue hoặc consumer group riêng nhận bản sao event","Cho hai service đọc chung một queue","Gọi HTTP lần lượt từ producer","Ghi event vào file log"],
        answer: 0,
        explain: "Đọc chung một queue thì mỗi message chỉ tới một service. Pub/sub cho mỗi subscriber một bản."
      },
      {
        q: "Tên nào là một command chứ không phải event?",
        options: ["UserRegistered", "PaymentFailed", "GenerateInvoicePdf", "OrderShipped"],
        answer: 2,
        explain: "Command là yêu cầu hành động (mệnh lệnh). Ba tên còn lại ở thì quá khứ, mô tả điều đã xảy ra."
      }
    ]
  },

  "p12.m2.t1": {
    sections: [
      {
        h: "Mô hình của RabbitMQ",
        p: [
          "RabbitMQ là message broker theo giao thức AMQP 0-9-1. Producer không gửi thẳng vào queue mà gửi tới exchange kèm routing key. Exchange dựa vào binding để quyết định copy message vào queue nào. Consumer đọc từ queue. Tách exchange và queue giúp đổi cách định tuyến mà không sửa producer."
        ],
        list: [
          "Direct exchange: gửi vào queue có binding key trùng khớp chính xác với routing key.",
          "Topic exchange: khớp theo mẫu với từ phân cách bằng dấu chấm; `*` khớp đúng một từ, `#` khớp không hoặc nhiều từ. Ví dụ `order.*.vn` hoặc `order.#`.",
          "Fanout exchange: bỏ qua routing key, copy tới mọi queue đã bind. Dùng cho broadcast.",
          "Headers exchange: định tuyến theo header, ít dùng."
        ]
      },
      {
        h: "Ack, prefetch và độ bền",
        p: [
          "Consumer nên dùng manual ack: xử lý xong mới `ack`. Nếu lỗi, `nack` với `requeue=false` để chuyển sang dead-letter, hoặc để kết nối đóng thì message được giao lại. `prefetch` giới hạn số message chưa ack mà một consumer giữ cùng lúc, giúp chia đều tải và không làm tràn bộ nhớ worker.",
          "Để message không mất khi broker restart: khai báo queue durable, gửi message persistent, và bật publisher confirms để producer biết broker đã nhận. Với RabbitMQ hiện đại, nên dùng quorum queue (replicate bằng Raft) thay cho classic mirrored queue đã bị loại bỏ. RabbitMQ cũng có Streams cho nhu cầu đọc lại kiểu log."
        ]
      },
      {
        h: "Dead-letter exchange và retry",
        p: [
          "Dead-letter exchange (DLX) nhận message bị reject không requeue, hết hạn TTL, hoặc vượt giới hạn độ dài queue. Mẫu phổ biến: message lỗi đi vào queue retry có TTL, hết TTL thì dead-letter quay lại queue chính; thử quá N lần thì đưa vào parking queue để người xem xét. Quorum queue còn hỗ trợ `x-delivery-limit` để giới hạn số lần giao lại."
        ],
        code: {
          lang: "typescript",
          file: "src/messaging/order-consumer.ts",
          src: `import amqp from 'amqplib';

const conn = await amqp.connect(process.env.AMQP_URL!);
const ch = await conn.createChannel();

await ch.assertExchange('orders', 'topic', { durable: true });
await ch.assertExchange('orders.dlx', 'fanout', { durable: true });
await ch.assertQueue('orders.dead', { durable: true });
await ch.bindQueue('orders.dead', 'orders.dlx', '');

await ch.assertQueue('billing.order-paid', {
  durable: true,
  arguments: {
    'x-queue-type': 'quorum',
    'x-dead-letter-exchange': 'orders.dlx',
    'x-delivery-limit': 5,
  },
});
await ch.bindQueue('billing.order-paid', 'orders', 'order.paid');

await ch.prefetch(20);
await ch.consume('billing.order-paid', async (msg) => {
  if (!msg) return;
  try {
    await handleOrderPaid(JSON.parse(msg.content.toString())); // phải idempotent
    ch.ack(msg);
  } catch (e) {
    const permanent = e instanceof ValidationError;
    // Lỗi vĩnh viễn: sang DLX ngay. Lỗi tạm thời: requeue, giới hạn bởi x-delivery-limit
    ch.nack(msg, false, !permanent);
  }
});`
        }
      },
      {
        h: "Khi nào chọn RabbitMQ",
        p: [
          "RabbitMQ mạnh ở định tuyến linh hoạt, task queue, độ trễ thấp, ưu tiên và TTL theo message. Message thường bị xóa sau khi ack, nên nó không phải lựa chọn tự nhiên khi bạn cần đọc lại lịch sử hoặc nhiều consumer đọc ở các vị trí khác nhau; khi đó Kafka hoặc RabbitMQ Streams hợp hơn."
        ]
      }
    ],
    summary: [
      "Producer gửi tới exchange; binding quyết định message vào queue nào.",
      "Direct khớp chính xác, topic khớp mẫu với * và #, fanout phát cho mọi queue.",
      "Manual ack, prefetch, durable queue, persistent message và publisher confirms giúp không mất message.",
      "Dead-letter exchange gom message lỗi; kết hợp TTL hoặc delivery limit để retry có giới hạn."
    ],
    pitfalls: [
      "Dùng auto-ack: worker chết giữa chừng là message mất vĩnh viễn.",
      "Requeue vô hạn message lỗi vĩnh viễn (poison message): consumer quay vòng mãi, chặn các message khác. Đặt giới hạn và DLX.",
      "Không đặt prefetch: broker đẩy hàng nghìn message vào một worker, worker khác rảnh và bộ nhớ worker tăng vọt."
    ],
    quiz: [
      {
        q: "Với topic exchange, binding `order.#` khớp routing key nào?",
        options: ["Chỉ `order`","Chỉ `order.paid`","`order.paid` và `order.paid.vn`","`payment.order`"],
        answer: 2,
        explain: "`#` khớp không hoặc nhiều từ, nên `order`, `order.paid`, `order.paid.vn` đều khớp. Lựa chọn nói “chỉ” là sai; `payment.order` không bắt đầu bằng `order`."
      },
      {
        q: "Vì sao nên dùng manual ack thay cho auto-ack?",
        options: ["Để tăng tốc độ","Vì auto-ack không tồn tại","Để bỏ qua dead-letter","Để message chỉ bị xóa sau khi xử lý xong, tránh mất khi consumer chết"],
        answer: 3,
        explain: "Với auto-ack, broker xóa message ngay khi giao. Manual ack đảm bảo at-least-once."
      },
      {
        q: "Message nào sẽ đi tới dead-letter exchange?",
        options: ["Message bị reject/nack với requeue=false, hết TTL hoặc vượt giới hạn queue","Message được ack thành công","Mọi message sau 24 giờ","Message có routing key sai"],
        answer: 0,
        explain: "Đó là các điều kiện dead-letter chuẩn. Message routing key không khớp binding nào thì bị bỏ (hoặc trả về nếu dùng cờ mandatory / alternate exchange), không đi DLX."
      }
    ]
  },

  "p12.m2.t2": {
    sections: [
      {
        h: "Kafka là một log phân tán",
        p: [
          "Kafka không phải queue theo nghĩa truyền thống mà là commit log phân tán. Topic được chia thành nhiều partition; mỗi partition là một dãy message chỉ ghi nối, mỗi message có offset tăng dần. Message không bị xóa khi đọc; nó ở lại đến khi hết retention (theo thời gian hoặc dung lượng), hoặc được giữ bản mới nhất theo key nếu bật log compaction.",
          "Mỗi partition có một leader và các follower replica trên broker khác (`replication.factor`, thường 3). Producer dùng `acks=all` cùng `min.insync.replicas=2` để chỉ coi là ghi thành công khi đủ replica đồng bộ đã nhận. Kafka hiện đại dùng KRaft để quản lý metadata thay cho ZooKeeper."
        ]
      },
      {
        h: "Key, partition và thứ tự",
        p: [
          "Producer chọn partition theo key: cùng key luôn vào cùng partition (với số partition không đổi). Kafka chỉ đảm bảo thứ tự trong một partition, không đảm bảo thứ tự giữa các partition của topic. Vì vậy nếu các event của một đơn hàng cần đúng thứ tự, dùng `orderId` làm key.",
          "Chú ý: tăng số partition làm thay đổi ánh xạ key sang partition, nên thứ tự cho các key bị ảnh hưởng có thể bị phá trong giai đoạn chuyển. Hãy chọn số partition đủ lớn từ đầu. Retry của producer có thể đảo thứ tự hoặc tạo trùng; bật idempotent producer (mặc định trong các bản gần đây) để tránh."
        ]
      },
      {
        h: "Consumer group và offset",
        p: [
          "Consumer group là nhóm consumer cùng đọc một topic. Mỗi partition được giao cho đúng một consumer trong group, nên số consumer hoạt động tối đa bằng số partition; consumer dư sẽ ngồi chờ. Các group khác nhau đọc độc lập, mỗi group có offset riêng, đây là cách Kafka làm pub/sub.",
          "Consumer commit offset để ghi nhớ đã xử lý tới đâu. Commit sau khi xử lý cho at-least-once; commit trước khi xử lý cho at-most-once. Khi consumer vào hoặc rời group, Kafka rebalance, chia lại partition. Vì message được giữ lại, bạn có thể reset offset để đọc lại (replay) sau khi sửa lỗi."
        ],
        code: {
          lang: "typescript",
          file: "src/kafka/consumer.ts",
          src: `import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'billing', brokers: ['kafka-1:9092', 'kafka-2:9092'] });

// Producer: key = orderId -> các event của một đơn nằm cùng partition, giữ thứ tự
const producer = kafka.producer({ idempotent: true });
await producer.connect();
await producer.send({
  topic: 'orders',
  acks: -1, // all
  messages: [{ key: order.id, value: JSON.stringify({ type: 'OrderPaid', orderId: order.id }) }],
});

// Consumer: tắt auto commit, commit sau khi xử lý xong => at-least-once
const consumer = kafka.consumer({ groupId: 'billing-service' });
await consumer.connect();
await consumer.subscribe({ topic: 'orders' });
await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message }) => {
    await handle(JSON.parse(message.value!.toString())); // idempotent
    const next = (BigInt(message.offset) + 1n).toString();
    await consumer.commitOffsets([{ topic, partition, offset: next }]);
  },
});`
        }
      },
      {
        h: "Kafka hay RabbitMQ",
        p: [
          "Chọn Kafka khi cần throughput rất cao, lưu event lâu để nhiều hệ thống đọc lại, event streaming, CDC, log pipeline, hoặc cần thứ tự theo key. Chọn RabbitMQ khi cần task queue với định tuyến phức tạp, ack từng message, độ trễ thấp, priority và vận hành đơn giản hơn ở quy mô vừa. Nhiều công ty dùng cả hai."
        ]
      }
    ],
    summary: [
      "Topic chia thành partition; mỗi partition là log chỉ ghi nối với offset tăng dần.",
      "Thứ tự chỉ được đảm bảo trong một partition; dùng key để các message liên quan vào cùng partition.",
      "Trong một consumer group, mỗi partition chỉ một consumer đọc; số consumer hữu ích tối đa bằng số partition.",
      "Message được giữ theo retention nên có thể replay bằng cách reset offset.",
      "Dùng acks=all, min.insync.replicas và idempotent producer để tránh mất và trùng khi ghi."
    ],
    pitfalls: [
      "Tạo 3 partition rồi chạy 10 consumer trong một group: 7 consumer không làm gì. Tính số partition theo mức song song cần thiết.",
      "Không đặt key rồi mong thứ tự theo đơn hàng: message được rải ra nhiều partition và xử lý lệch thứ tự.",
      "Bật auto commit rồi xử lý bất đồng bộ: offset được commit trước khi xử lý xong, consumer chết là mất message."
    ],
    quiz: [
      {
        q: "Kafka đảm bảo thứ tự message ở phạm vi nào?",
        options: ["Toàn bộ cluster", "Toàn bộ topic", "Trong một partition", "Không đảm bảo gì"],
        answer: 2,
        explain: "Mỗi partition là một log có thứ tự. Giữa các partition không có thứ tự toàn cục, nên cần key để gom message liên quan."
      },
      {
        q: "Topic có 6 partition, group có 8 consumer. Điều gì xảy ra?",
        options: ["Mỗi consumer đọc 0,75 partition","Kafka tự tạo thêm 2 partition","6 consumer mỗi cái nhận một partition, 2 consumer rảnh","Lỗi không khởi động được"],
        answer: 2,
        explain: "Trong một group, một partition chỉ giao cho một consumer. Consumer dư sẽ chờ làm dự phòng khi rebalance."
      },
      {
        q: "Vì sao Kafka cho phép replay dữ liệu còn queue truyền thống thường không?",
        options: ["Vì Kafka nén dữ liệu","Vì Kafka chỉ có một consumer","Vì Kafka dùng HTTP","Vì message được giữ theo retention và consumer tự quản lý offset"],
        answer: 3,
        explain: "Đọc không xóa message; offset chỉ là con trỏ của từng group. Reset con trỏ là đọc lại được."
      }
    ]
  },

  "p12.m2.t3": {
    sections: [
      {
        h: "Ba mức đảm bảo giao nhận",
        p: [
          "Mạng có thể mất gói, process có thể chết giữa chừng, nên mỗi hệ thống messaging phải chọn cách hành xử khi không chắc message đã được xử lý hay chưa."
        ],
        list: [
          "At-most-once: gửi một lần, không retry; hoặc commit/ack trước rồi mới xử lý. Có thể mất message, không bao giờ trùng. Hợp với metrics, log không quan trọng.",
          "At-least-once: retry cho đến khi được xác nhận; ack/commit sau khi xử lý. Không mất, nhưng có thể trùng. Đây là mặc định thực tế của hầu hết hệ thống.",
          "Exactly-once: mỗi message có hiệu ứng đúng một lần. Qua ranh giới hệ thống bất kỳ, việc giao đúng một lần là không đảm bảo được; điều làm được là xử lý có hiệu quả đúng một lần (effectively-once)."
        ]
      },
      {
        h: "Exactly-once thực tế đạt được thế nào",
        p: [
          "Trong phạm vi Kafka, idempotent producer (khử trùng khi producer retry) cộng transactions cho phép mẫu đọc từ topic, xử lý, ghi sang topic khác và commit offset trong một giao dịch nguyên tử; consumer dùng `isolation.level=read_committed`. Kafka Streams bật được chế độ exactly-once này. Nhưng nó chỉ bao phủ các thao tác bên trong Kafka.",
          "Khi hiệu ứng nằm ngoài Kafka (ghi PostgreSQL, gọi API thanh toán, gửi email), bạn cần consumer idempotent: at-least-once cộng khử trùng. Cách phổ biến là lưu `message_id` đã xử lý trong bảng có ràng buộc unique, cùng transaction với thay đổi nghiệp vụ. Nếu message tới lần hai, insert bị trùng và bạn bỏ qua."
        ],
        code: {
          lang: "typescript",
          file: "src/consumers/idempotent.ts",
          src: `// CREATE TABLE processed_messages (
//   consumer text, message_id text, processed_at timestamptz DEFAULT now(),
//   PRIMARY KEY (consumer, message_id));

export async function handleOrderPaid(msg: { id: string; orderId: string; amount: number }) {
  await db.transaction(async (tx) => {
    const res = await tx.query(
      'INSERT INTO processed_messages (consumer, message_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      ['loyalty', msg.id],
    );
    if (res.rowCount === 0) return; // đã xử lý rồi -> bỏ qua

    await tx.query(
      'UPDATE loyalty_accounts SET points = points + $1 WHERE customer_id = (SELECT customer_id FROM orders WHERE id = $2)',
      [Math.floor(msg.amount / 1000), msg.orderId],
    );
  }); // cả hai ghi cùng commit hoặc cùng rollback
  // ack/commit offset SAU khi transaction thành công
}`
        }
      },
      {
        h: "Các kỹ thuật idempotent khác",
        p: [
          "Không phải lúc nào cũng cần bảng khử trùng. Nhiều thao tác tự nhiên idempotent: `SET status = 'shipped'` chạy hai lần vẫn thế, còn `points = points + 10` thì không. Có thể dùng upsert theo khóa nghiệp vụ, điều kiện theo version (`WHERE version = 7`), hoặc gửi idempotency key cho API bên ngoài (nhiều cổng thanh toán hỗ trợ header `Idempotency-Key`).",
          "Với gửi email hay SMS, bên ngoài không có transaction chung với DB của bạn. Bạn chỉ giảm được xác suất trùng (ghi trạng thái “đã gửi” ngay sau khi gửi) chứ không loại bỏ hoàn toàn. Hãy nói rõ điều này khi phỏng vấn."
        ]
      }
    ],
    summary: [
      "At-most-once có thể mất; at-least-once có thể trùng; đây là lựa chọn phổ biến nhất.",
      "Exactly-once trong Kafka dựa trên idempotent producer và transactions, chỉ bao phủ đọc-xử lý-ghi trong Kafka.",
      "Với hiệu ứng ngoài Kafka, dùng at-least-once cộng consumer idempotent.",
      "Khử trùng bằng bảng message_id unique trong cùng transaction với thay đổi nghiệp vụ, hoặc idempotency key."
    ],
    pitfalls: [
      "Tin rằng bật exactly-once trong Kafka thì ghi DB hay gọi API cũng đúng một lần: không đúng, hiệu ứng bên ngoài vẫn cần idempotent.",
      "Ghi bảng khử trùng và thay đổi nghiệp vụ ở hai transaction riêng: chết giữa hai bước là lệch.",
      "Dùng thao tác tăng dần (`+=`) trong consumer at-least-once mà không khử trùng: cộng điểm, trừ kho hai lần."
    ],
    quiz: [
      {
        q: "Consumer commit offset TRƯỚC khi xử lý message. Đây là mức đảm bảo nào?",
        options: ["At-most-once","At-least-once","Exactly-once","Không xác định"],
        answer: 0,
        explain: "Nếu chết sau khi commit mà chưa xử lý, message bị bỏ qua vĩnh viễn: có thể mất, không trùng, tức at-most-once."
      },
      {
        q: "Consumer Kafka ghi vào PostgreSQL. Cách thực tế để đạt hiệu ứng đúng một lần là gì?",
        options: ["Chỉ cần bật transactions trong Kafka producer","Tăng số partition","Dùng auto commit","At-least-once cộng consumer idempotent (khử trùng bằng message id trong cùng transaction DB)"],
        answer: 3,
        explain: "Transactions của Kafka không bao phủ PostgreSQL. Cách đúng là cho phép giao lại và làm việc xử lý idempotent."
      },
      {
        q: "Thao tác nào tự nhiên idempotent?",
        options: ["UPDATE stock SET qty = qty - 1", "INSERT một dòng log không có khóa unique", "UPDATE orders SET status = 'shipped' WHERE id = 42", "Gửi email chào mừng"],
        answer: 2,
        explain: "Đặt một giá trị cố định chạy nhiều lần cho cùng kết quả. Trừ kho, insert không khóa và gửi email đều tạo hiệu ứng lặp."
      }
    ]
  },

  "p12.m2.t4": {
    sections: [
      {
        h: "Vấn đề dual-write",
        p: [
          "Luồng quen thuộc: lưu đơn hàng vào PostgreSQL rồi publish event `OrderPaid` lên Kafka. Đây là hai hệ thống, không có transaction chung. Nếu DB commit xong mà process chết trước khi publish, event mất và các service khác không bao giờ biết. Nếu publish trước rồi DB rollback, bạn phát một event về việc chưa từng xảy ra. Đảo thứ tự hay thêm try/catch đều không giải quyết triệt để. Đây gọi là vấn đề dual-write."
        ]
      },
      {
        h: "Transactional Outbox",
        p: [
          "Giải pháp: trong cùng transaction nghiệp vụ, ghi thêm một dòng vào bảng `outbox` mô tả event. Vì cùng một DB, hoặc cả hai được commit hoặc không cái nào. Sau đó một tiến trình relay đọc outbox và publish lên broker, publish thành công thì đánh dấu đã gửi.",
          "Relay có hai cách. Polling: định kỳ `SELECT` các dòng chưa gửi, dùng `FOR UPDATE SKIP LOCKED` để chạy nhiều relay song song không giẫm nhau. CDC (Change Data Capture): Debezium đọc WAL của PostgreSQL và đẩy thay đổi của bảng outbox lên Kafka, độ trễ thấp và không tạo tải truy vấn."
        ],
        code: {
          lang: "typescript",
          file: "src/orders/pay-order.ts",
          src: `// CREATE TABLE outbox (
//   id uuid PRIMARY KEY, aggregate_id text NOT NULL, type text NOT NULL,
//   payload jsonb NOT NULL, created_at timestamptz DEFAULT now(), published_at timestamptz);

export async function payOrder(orderId: string, chargeId: string) {
  await db.transaction(async (tx) => {
    await tx.query("UPDATE orders SET status = 'paid', charge_id = $2 WHERE id = $1", [orderId, chargeId]);
    await tx.query(
      'INSERT INTO outbox (id, aggregate_id, type, payload) VALUES ($1, $2, $3, $4)',
      [randomUUID(), orderId, 'OrderPaid', { orderId, chargeId }],
    );
  });
}

// Relay (polling)
export async function relayOnce(batch = 100) {
  await db.transaction(async (tx) => {
    const { rows } = await tx.query(
      'SELECT * FROM outbox WHERE published_at IS NULL ORDER BY created_at LIMIT $1 FOR UPDATE SKIP LOCKED',
      [batch],
    );
    for (const r of rows) {
      await producer.send({ topic: 'orders', messages: [{ key: r.aggregate_id, value: JSON.stringify({ id: r.id, type: r.type, ...r.payload }) }] });
    }
    if (rows.length) await tx.query('UPDATE outbox SET published_at = now() WHERE id = ANY($1)', [rows.map((r) => r.id)]);
  });
}`
        }
      },
      {
        h: "Đảm bảo và lưu ý",
        p: [
          "Outbox cho bạn at-least-once: relay có thể publish rồi chết trước khi đánh dấu, lần sau publish lại. Vì vậy event cần id duy nhất (dùng chính `outbox.id`) và consumer phải idempotent. Outbox cộng idempotent consumer là cặp đôi chuẩn để có luồng event tin cậy.",
          "Về thứ tự: dùng `aggregate_id` làm key Kafka để event của cùng một aggregate vào cùng partition. Relay nhiều luồng song song có thể đảo thứ tự giữa các dòng, nên nếu thứ tự theo aggregate quan trọng, hãy xử lý tuần tự theo aggregate hoặc dùng CDC. Dọn bảng outbox định kỳ (xóa dòng đã gửi quá vài ngày) để bảng không phình to.",
          "Mẫu đối xứng ở phía nhận là Inbox: ghi message nhận được vào bảng inbox với id unique trước khi xử lý, vừa khử trùng vừa có nhật ký."
        ]
      }
    ],
    summary: [
      "Dual-write (ghi DB rồi publish broker) có thể mất event hoặc phát event sai khi lỗi giữa chừng.",
      "Outbox: ghi event vào bảng trong cùng transaction nghiệp vụ; relay publish sau.",
      "Relay bằng polling với SKIP LOCKED hoặc CDC như Debezium đọc WAL.",
      "Outbox là at-least-once, nên cần event id và consumer idempotent."
    ],
    pitfalls: [
      "Publish lên Kafka bên trong transaction DB rồi mới commit: nếu commit thất bại, event đã phát đi mà dữ liệu không tồn tại.",
      "Relay đánh dấu published trước khi gửi thành công: mất event khi publish lỗi.",
      "Không dọn bảng outbox: bảng phình to làm truy vấn relay chậm dần. Thêm index một phần `WHERE published_at IS NULL` và job xóa định kỳ."
    ],
    quiz: [
      {
        q: "Outbox giải quyết vấn đề gì?",
        options: ["Không nhất quán giữa ghi DB và publish event khi lỗi xảy ra giữa hai bước","Truy vấn chậm","Cache stampede","Thiếu partition trong Kafka"],
        answer: 0,
        explain: "Ghi event cùng transaction với dữ liệu biến hai thao tác thành một thao tác nguyên tử trong DB; việc publish được làm lại cho tới khi thành công."
      },
      {
        q: "Vì sao consumer vẫn cần idempotent khi đã có outbox?",
        options: ["Vì outbox làm mất event","Không cần","Vì Kafka tự nhân đôi message","Vì relay có thể publish một event nhiều lần nếu chết trước khi đánh dấu đã gửi"],
        answer: 3,
        explain: "Outbox đảm bảo không mất (at-least-once) chứ không đảm bảo không trùng."
      },
      {
        q: "`FOR UPDATE SKIP LOCKED` trong relay polling giúp gì?",
        options: ["Cho nhiều relay chạy song song, mỗi relay lấy các dòng khác nhau mà không chờ khóa của nhau","Tăng tốc INSERT","Xóa dòng đã gửi","Tạo index"],
        answer: 0,
        explain: "Dòng đang bị relay khác khóa sẽ bị bỏ qua thay vì chờ, nên các relay chia việc mà không publish trùng cùng lúc."
      }
    ]
  },

  "p12.m2.t5": {
    sections: [
      {
        h: "Transaction phân tán qua chuỗi bước",
        p: [
          "Khi dữ liệu nằm ở nhiều service, bạn không thể dùng một transaction ACID. Two-phase commit (2PC) tồn tại nhưng chặn khi coordinator lỗi, cần mọi thành phần hỗ trợ, và làm giảm availability, nên hiếm khi dùng giữa microservices. Saga thay thế bằng chuỗi transaction cục bộ; mỗi bước có một bước bù trừ (compensation) để hoàn tác về mặt nghiệp vụ nếu bước sau thất bại.",
          "Ví dụ đặt hàng: (1) Order tạo đơn ở trạng thái PENDING, (2) Inventory giữ hàng, (3) Payment trừ tiền, (4) Order chuyển CONFIRMED. Nếu Payment thất bại: Inventory nhả hàng, Order chuyển CANCELLED. Compensation không phải rollback kỹ thuật: tiền đã trừ thì bù bằng hoàn tiền, email đã gửi thì gửi email xin lỗi."
        ]
      },
      {
        h: "Choreography và orchestration",
        p: [
          "Choreography: không có bộ điều phối trung tâm. Mỗi service nghe event và phát event tiếp theo: `OrderCreated` làm Inventory giữ hàng và phát `StockReserved`, Payment nghe và phát `PaymentFailed`, Inventory nghe để nhả hàng. Đơn giản khi ít bước, coupling thấp, nhưng khi luồng dài thì khó thấy toàn cảnh, khó debug và dễ có vòng phụ thuộc event.",
          "Orchestration: một orchestrator ra lệnh cho từng bước và quyết định bù trừ. Luồng nằm tập trung ở một chỗ, dễ đọc, dễ theo dõi trạng thái và timeout. Nhược điểm: orchestrator biết nhiều service. Workflow engine như Temporal lưu trạng thái workflow bền vững, tự retry activity, và tiếp tục đúng chỗ sau khi process chết, nên bạn viết saga như code tuần tự bình thường."
        ],
        code: {
          lang: "typescript",
          file: "src/workflows/place-order.workflow.ts",
          src: `import { proxyActivities } from '@temporalio/workflow';
import type * as acts from '../activities';

const { reserveStock, releaseStock, chargePayment, refundPayment, confirmOrder, cancelOrder } =
  proxyActivities<typeof acts>({
    startToCloseTimeout: '30 seconds',
    retry: { maximumAttempts: 5, initialInterval: '1s', backoffCoefficient: 2 },
  });

export async function placeOrder(orderId: string): Promise<void> {
  const compensations: (() => Promise<void>)[] = [];
  try {
    await reserveStock(orderId);
    compensations.unshift(() => releaseStock(orderId));

    await chargePayment(orderId); // activity gửi idempotency key = orderId
    compensations.unshift(() => refundPayment(orderId));

    await confirmOrder(orderId);
  } catch (err) {
    for (const undo of compensations) await undo(); // bù trừ theo thứ tự ngược
    await cancelOrder(orderId);
    throw err;
  }
}`
        }
      },
      {
        h: "Lưu ý khi thiết kế saga",
        p: [
          "Saga không có tính cô lập (isolation): trạng thái trung gian hiển thị cho người khác, ví dụ hàng đang bị giữ nhưng đơn chưa xác nhận. Dùng trạng thái rõ ràng như PENDING (semantic lock) để phần khác của hệ thống biết mà xử lý phù hợp.",
          "Mọi bước và mọi bước bù trừ phải idempotent vì sẽ bị retry. Bước bù trừ phải được thiết kế để cuối cùng thành công (retry đến khi xong hoặc chuyển người xử lý). Đặt các bước không thể hoàn tác (gửi hàng, gửi thông báo) ở cuối, sau bước “pivot” quyết định thành công."
        ]
      }
    ],
    summary: [
      "Saga thay transaction phân tán bằng chuỗi transaction cục bộ và các bước bù trừ.",
      "Compensation là hoàn tác nghiệp vụ (hoàn tiền, nhả hàng), không phải rollback kỹ thuật.",
      "Choreography dùng event, coupling thấp nhưng khó theo dõi khi luồng dài.",
      "Orchestration tập trung luồng; Temporal lưu trạng thái bền vững và tự retry.",
      "Bước và bước bù trừ phải idempotent; saga không có isolation."
    ],
    pitfalls: [
      "Bước bù trừ không idempotent: retry hoàn tiền hai lần cho khách.",
      "Đặt hành động không hoàn tác được (gửi email xác nhận) ở giữa saga: khi bước sau thất bại không rút lại được.",
      "Dùng choreography cho luồng 8 bước với nhiều nhánh: không ai biết một đơn đang kẹt ở đâu. Chuyển sang orchestration."
    ],
    quiz: [
      {
        q: "Vì sao saga thường được chọn thay cho 2PC giữa microservices?",
        options: ["Vì saga đảm bảo isolation đầy đủ","Vì 2PC không tồn tại","Vì saga không cần xử lý lỗi","Vì 2PC chặn khi coordinator lỗi và giảm availability, còn saga dùng transaction cục bộ"],
        answer: 3,
        explain: "2PC giữ khóa và chờ coordinator, dễ bị chặn. Saga không có isolation đầy đủ; đó là điểm yếu chứ không phải ưu điểm."
      },
      {
        q: "Payment thất bại sau khi Inventory đã giữ hàng. Saga sẽ làm gì?",
        options: ["Chạy bước bù trừ: nhả hàng và hủy đơn","Rollback transaction của Inventory bằng lệnh ROLLBACK","Bỏ qua lỗi","Thử lại Payment mãi mãi"],
        answer: 0,
        explain: "Transaction của Inventory đã commit, không ROLLBACK được. Saga chạy compensation để hoàn tác về mặt nghiệp vụ. Retry có giới hạn là hợp lý, nhưng lỗi nghiệp vụ như thẻ bị từ chối thì phải bù trừ."
      },
      {
        q: "Ưu điểm chính của orchestration so với choreography là gì?",
        options: ["Không cần service nào biết nhau","Luôn nhanh hơn","Không cần message broker hay workflow engine","Luồng nghiệp vụ tập trung một chỗ, dễ theo dõi trạng thái, timeout và bù trừ"],
        answer: 3,
        explain: "Orchestrator nắm toàn bộ luồng. Đổi lại nó biết các service tham gia, nên coupling cao hơn choreography."
      }
    ]
  },

"p12.m3.t0": {
    sections: [
      {
        h: "Vì sao mọi lời gọi mạng phải có timeout",
        p: [
          "Lời gọi không có timeout có thể chờ mãi. Khi service phụ thuộc bị treo (không trả lỗi mà chỉ không trả lời), mỗi request của bạn giữ một connection, một slot trong pool, một ít bộ nhớ. Vài phút sau pool cạn, event loop đầy promise treo, và service của bạn cũng ngừng phản hồi. Lỗi lan dần lên phía trên: đây là cascading failure. Một phụ thuộc chậm nguy hiểm hơn một phụ thuộc chết hẳn, vì chết hẳn thì lỗi nhanh.",
          "Mặc định của nhiều thư viện là không có timeout hoặc timeout rất dài. `fetch` trong Node.js không tự hủy theo thời gian bạn mong muốn; bạn phải truyền `AbortSignal`. Driver DB, client Redis, HTTP client, gRPC đều cần cấu hình timeout rõ ràng."
        ]
      },
      {
        h: "Các loại timeout",
        list: [
          "Connect timeout: thời gian thiết lập kết nối TCP/TLS; nên ngắn (vài trăm ms đến 1–2 giây trong cùng datacenter).",
          "Request/read timeout: thời gian chờ response sau khi đã kết nối.",
          "Tổng thời gian (deadline): tổng cho cả thao tác gồm mọi lần retry.",
          "Timeout phía DB: `statement_timeout`, `lock_timeout` và `idle_in_transaction_session_timeout` trong PostgreSQL chặn truy vấn chạy quá lâu hoặc giữ khóa.",
          "Timeout phía server: server cũng nên giới hạn thời gian xử lý mỗi request để không làm việc vô ích khi client đã bỏ đi."
        ],
        p: [
          "Chọn giá trị dựa trên số liệu thật: lấy p99 hoặc p99.9 độ trễ của phụ thuộc lúc bình thường, cộng một khoảng dư. Timeout quá dài không bảo vệ được gì; quá ngắn thì cắt cả request bình thường và gây retry thừa."
        ]
      },
      {
        h: "Deadline propagation",
        p: [
          "Nếu gateway cho request 2 giây, service A đã tốn 1,5 giây thì lời gọi xuống B chỉ còn 0,5 giây. Gọi B với timeout 5 giây là vô nghĩa, vì client đã bỏ đi. Truyền deadline xuống các tầng dưới (gRPC làm sẵn, HTTP có thể dùng header tự định nghĩa) và dùng thời gian còn lại làm timeout. Các tầng dưới nên có timeout ngắn hơn tầng trên."
        ],
        code: {
          lang: "typescript",
          file: "src/http/call-with-timeout.ts",
          src: `export async function getJson<T>(url: string, opts: { timeoutMs: number; signal?: AbortSignal }): Promise<T> {
  // Kết hợp timeout riêng với signal của request cha (client hủy thì cũng hủy lời gọi con)
  const signals = [AbortSignal.timeout(opts.timeoutMs)];
  if (opts.signal) signals.push(opts.signal);
  const res = await fetch(url, { signal: AbortSignal.any(signals) });
  if (!res.ok) throw new HttpError(res.status);
  return (await res.json()) as T;
}

// Truyền deadline: dùng thời gian còn lại, trừ một khoảng dự phòng
export function remainingMs(deadline: number, reserveMs = 50) {
  const left = deadline - Date.now() - reserveMs;
  if (left <= 0) throw new Error('Deadline exceeded');
  return left;
}

// PostgreSQL: giới hạn phía server cho mỗi truy vấn của role ứng dụng
// ALTER ROLE app SET statement_timeout = '3s';
// ALTER ROLE app SET idle_in_transaction_session_timeout = '10s';`
        }
      }
    ],
    summary: [
      "Không có timeout là một phụ thuộc chậm có thể kéo sập cả service của bạn (cascading failure).",
      "Cấu hình connect timeout, request timeout, deadline tổng và timeout phía DB.",
      "Chọn giá trị dựa trên p99 thực tế cộng khoảng dư.",
      "Truyền deadline xuống tầng dưới; tầng dưới luôn có timeout ngắn hơn tầng trên."
    ],
    pitfalls: [
      "Dùng `fetch` mặc định không có `AbortSignal`: request treo không bao giờ kết thúc.",
      "Timeout tầng dưới dài hơn tầng trên: tầng dưới vẫn làm việc khi client đã bỏ đi, lãng phí tài nguyên.",
      "Chỉ đặt timeout mà không có retry budget hay circuit breaker: mỗi request vẫn phải chờ hết timeout khi phụ thuộc hỏng."
    ],
    quiz: [
      {
        q: "Vì sao một phụ thuộc chậm (treo) thường nguy hiểm hơn một phụ thuộc chết hẳn?",
        options: ["Vì request chờ lâu giữ tài nguyên (connection, bộ nhớ) và có thể làm cạn pool, còn chết hẳn thì lỗi trả về nhanh","Vì chậm tốn điện hơn","Vì chết hẳn tự phục hồi","Vì chậm không thể đo được"],
        answer: 0,
        explain: "Connection refused trả lỗi ngay; treo thì giữ tài nguyên cho tới khi hết timeout, hoặc mãi mãi nếu không có timeout."
      },
      {
        q: "Gateway có deadline 2 giây, service A đã dùng 1,6 giây. A nên gọi B với timeout thế nào?",
        options: ["5 giây để chắc chắn", "Không đặt timeout", "Khoảng thời gian còn lại, dưới 0,4 giây", "Đúng 2 giây"],
        answer: 2,
        explain: "Sau 2 giây client đã bỏ đi, nên chờ lâu hơn thời gian còn lại là vô ích. Deadline propagation dùng phần thời gian còn lại."
      },
      {
        q: "Tham số PostgreSQL nào chặn một câu truy vấn chạy quá lâu?",
        options: ["max_connections","work_mem","shared_buffers","statement_timeout"],
        answer: 3,
        explain: "`statement_timeout` hủy câu lệnh vượt thời gian cho phép. Các tham số còn lại liên quan số kết nối và bộ nhớ."
      }
    ]
  },

  "p12.m3.t1": {
    sections: [
      {
        h: "Khi nào được retry",
        p: [
          "Retry giúp vượt qua lỗi tạm thời: mất gói, pod đang restart, 503 do quá tải ngắn. Nhưng retry sai chỗ gây hại. Chỉ retry khi hội đủ hai điều kiện: lỗi có khả năng tạm thời, và thao tác idempotent (chạy lại không gây hiệu ứng trùng).",
          "Lỗi nên retry: timeout, lỗi kết nối, 502/503/504, 429 (tôn trọng header `Retry-After`). Không retry: 400, 401, 403, 404, 422 vì gọi lại vẫn lỗi. Với POST tạo đơn hay thanh toán, chỉ retry khi có idempotency key để server khử trùng; nếu không, một timeout có thể là request đã thành công nhưng response bị mất."
        ]
      },
      {
        h: "Exponential backoff và jitter",
        p: [
          "Retry ngay lập tức làm dịch vụ đang quá tải càng quá tải. Exponential backoff tăng thời gian chờ theo cấp số nhân: 100 ms, 200 ms, 400 ms, 800 ms, có giới hạn trần. Nhưng nếu 10.000 client cùng lỗi lúc 12:00:00 thì chúng cùng retry lúc 12:00:00.1, rồi 12:00:00.3, tạo các đợt sóng đồng bộ. Jitter thêm ngẫu nhiên để trải đều. “Full jitter” chờ một giá trị ngẫu nhiên từ 0 đến mức backoff hiện tại, và được phân tích trong bài của AWS Builders' Library là cách hiệu quả để giảm tranh chấp."
        ],
        code: {
          lang: "typescript",
          file: "src/resilience/retry.ts",
          src: `type RetryOpts = { attempts: number; baseMs: number; capMs: number; isRetryable: (e: unknown) => boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function retry<T>(fn: (attempt: number) => Promise<T>, o: RetryOpts): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < o.attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastErr = e;
      if (!o.isRetryable(e) || attempt === o.attempts - 1) break;
      // Full jitter: ngẫu nhiên trong [0, min(cap, base * 2^attempt)]
      const backoff = Math.min(o.capMs, o.baseMs * 2 ** attempt);
      const retryAfter = e instanceof HttpError ? e.retryAfterMs : undefined;
      await sleep(retryAfter ?? Math.random() * backoff);
    }
  }
  throw lastErr;
}

// Dùng: chỉ retry lỗi tạm thời, gửi idempotency key cố định cho mọi lần thử
const key = randomUUID();
await retry(
  () => payments.charge({ orderId, amount }, { idempotencyKey: key, timeoutMs: 2000 }),
  {
    attempts: 4, baseMs: 100, capMs: 2000,
    isRetryable: (e) => e instanceof TimeoutError || (e instanceof HttpError && [429, 502, 503, 504].includes(e.status)),
  },
);`
        }
      },
      {
        h: "Retry storm và retry budget",
        p: [
          "Retry nhân lên theo tầng. Nếu gateway retry 3 lần, service A retry 3 lần, service B retry 3 lần, một request của người dùng có thể thành 27 lời gọi xuống C. Khi C chậm, lượng tải đổ vào nó tăng gấp nhiều lần đúng lúc nó yếu nhất: đó là retry storm.",
          "Cách phòng: chỉ retry ở một tầng (thường là tầng gần phụ thuộc nhất hoặc tầng ngoài cùng); giới hạn số lần (2–3); dùng retry budget, ví dụ chỉ cho phép retry chiếm tối đa 10% tổng request trong một cửa sổ thời gian; kết hợp circuit breaker để ngừng hẳn khi lỗi kéo dài; và tôn trọng deadline tổng."
        ]
      }
    ],
    summary: [
      "Chỉ retry khi lỗi tạm thời và thao tác idempotent (hoặc có idempotency key).",
      "Exponential backoff có trần, cộng jitter để các client không retry đồng loạt.",
      "Tôn trọng `Retry-After` khi nhận 429/503.",
      "Retry ở nhiều tầng nhân tải lên theo cấp số nhân; giới hạn số lần, dùng retry budget và circuit breaker."
    ],
    pitfalls: [
      "Retry POST thanh toán khi timeout mà không có idempotency key: khách có thể bị trừ tiền hai lần.",
      "Retry cả lỗi 400/401: lãng phí và làm log nhiễu, vì gọi lại vẫn lỗi.",
      "Mọi tầng đều retry 3 lần: một sự cố nhỏ ở tầng dưới biến thành cơn bão tải."
    ],
    quiz: [
      {
        q: "Vì sao cần jitter trong backoff?",
        options: ["Để các client lỗi cùng lúc không retry đồng loạt tạo đợt tải dồn","Để retry nhanh hơn","Để giảm số lần retry","Để thay thế timeout"],
        answer: 0,
        explain: "Không có jitter, các client đồng bộ nhau và cùng đánh vào server theo từng đợt. Jitter trải đều thời điểm retry."
      },
      {
        q: "Lỗi nào KHÔNG nên retry?",
        options: ["503 Service Unavailable", "Timeout kết nối", "422 Unprocessable Entity do dữ liệu không hợp lệ", "429 Too Many Requests (sau Retry-After)"],
        answer: 2,
        explain: "422 là lỗi dữ liệu phía client; gửi lại y hệt vẫn lỗi. Các lỗi còn lại có thể là tạm thời."
      },
      {
        q: "Ba tầng dịch vụ, mỗi tầng retry tối đa 3 lần (tổng 3 lần thử). Trường hợp xấu nhất, tầng dưới cùng nhận bao nhiêu lời gọi cho một request của người dùng?",
        options: ["3", "9", "27", "6"],
        answer: 2,
        explain: "Số lần thử nhân qua từng tầng: 3 x 3 x 3 = 27. Đây là lý do cần giới hạn retry ở một tầng và dùng retry budget."
      }
    ]
  },

  "p12.m3.t2": {
    sections: [
      {
        h: "Ý tưởng giống cầu dao điện",
        p: [
          "Khi phụ thuộc đang hỏng, tiếp tục gọi vào nó chỉ làm bạn chờ timeout, tốn tài nguyên và thêm tải cho bên đang yếu. Circuit breaker theo dõi tỉ lệ lỗi; vượt ngưỡng thì “ngắt mạch”: các lời gọi tiếp theo thất bại ngay lập tức (fail fast) hoặc trả fallback, không gọi mạng. Sau một thời gian, nó thử lại vài lời gọi để xem phụ thuộc đã hồi phục chưa."
        ]
      },
      {
        h: "Ba trạng thái",
        list: [
          "Closed: bình thường, mọi lời gọi đi qua; đếm lỗi trong cửa sổ trượt (theo số lượng hoặc thời gian).",
          "Open: tỉ lệ lỗi vượt ngưỡng (ví dụ 50% trong ít nhất 20 lời gọi); mọi lời gọi bị từ chối ngay trong một khoảng thời gian (ví dụ 30 giây).",
          "Half-open: hết thời gian chờ, cho một số ít lời gọi thử đi qua. Thành công thì về Closed, thất bại thì về Open và chờ tiếp."
        ],
        p: [
          "Timeout và lỗi 5xx được tính là lỗi; lỗi 4xx do client thường không nên tính, vì đó không phải dấu hiệu phụ thuộc hỏng. Cần ngưỡng số lượng tối thiểu để một hai lỗi lúc ít tải không làm mở mạch."
        ],
        code: {
          lang: "typescript",
          file: "src/resilience/circuit-breaker.ts",
          src: `type State = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: State = 'closed';
  private results: boolean[] = []; // cửa sổ N kết quả gần nhất (true = lỗi)
  private openedAt = 0;
  private trialInFlight = false;

  constructor(private o = { window: 20, minCalls: 10, failureRate: 0.5, openMs: 30_000 }) {}

  async exec<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt < this.o.openMs) return this.reject(fallback);
      this.state = 'half-open';
    }
    if (this.state === 'half-open') {
      if (this.trialInFlight) return this.reject(fallback); // chỉ một lời gọi thử
      this.trialInFlight = true;
    }
    try {
      const v = await fn();
      this.record(false);
      return v;
    } catch (e) {
      this.record(true);
      if (fallback) return fallback();
      throw e;
    }
  }

  private record(failed: boolean) {
    if (this.state === 'half-open') {
      this.trialInFlight = false;
      if (failed) return this.trip();
      this.state = 'closed';
      this.results = [];
      return;
    }
    this.results.push(failed);
    if (this.results.length > this.o.window) this.results.shift();
    const fails = this.results.filter(Boolean).length;
    if (this.results.length >= this.o.minCalls && fails / this.results.length >= this.o.failureRate) this.trip();
  }

  private trip() { this.state = 'open'; this.openedAt = Date.now(); }

  private reject<T>(fallback?: () => T): T {
    if (fallback) return fallback();
    throw new Error('Circuit open');
  }
}`
        }
      },
      {
        h: "Fallback và triển khai thực tế",
        p: [
          "Fallback là phản hồi thay thế: dữ liệu cache cũ, giá trị mặc định (danh sách gợi ý rỗng), đưa yêu cầu vào queue để xử lý sau, hoặc thông báo lỗi rõ ràng. Không phải chỗ nào cũng có fallback hợp lý: với thanh toán, thường fail fast và báo người dùng thử lại là trung thực nhất.",
          "Trong production, dùng thư viện đã kiểm chứng như `opossum` (Node.js) hoặc cơ chế outlier detection của service mesh (Envoy/Istio). Mỗi phụ thuộc một breaker riêng; phát metrics về trạng thái breaker để cảnh báo. Lưu ý mỗi instance có breaker riêng trong bộ nhớ, nên các instance có thể mở mạch ở thời điểm hơi khác nhau; điều này thường chấp nhận được."
        ]
      }
    ],
    summary: [
      "Circuit breaker ngừng gọi phụ thuộc đang hỏng để fail fast và cho nó thời gian hồi phục.",
      "Closed đếm lỗi, Open từ chối ngay, Half-open cho vài lời gọi thử.",
      "Tính timeout và 5xx là lỗi; cần ngưỡng số lời gọi tối thiểu.",
      "Fallback: cache cũ, mặc định, xếp hàng xử lý sau; mỗi phụ thuộc một breaker và có metrics."
    ],
    pitfalls: [
      "Dùng chung một breaker cho mọi phụ thuộc: một service lỗi làm ngắt cả các service khỏe.",
      "Tính lỗi 4xx vào tỉ lệ lỗi: client gửi dữ liệu sai cũng làm mở mạch.",
      "Fallback trả dữ liệu sai lệch nghiêm trọng (ví dụ số dư bằng 0) thay vì báo lỗi: người dùng hiểu nhầm."
    ],
    quiz: [
      {
        q: "Ở trạng thái Open, circuit breaker làm gì với lời gọi mới?",
        options: ["Gọi phụ thuộc với timeout dài hơn","Retry 3 lần","Xếp hàng chờ đến khi Closed","Từ chối ngay hoặc trả fallback mà không gọi phụ thuộc"],
        answer: 3,
        explain: "Mục đích của Open là fail fast và giảm tải cho phụ thuộc đang hỏng."
      },
      {
        q: "Trạng thái Half-open dùng để làm gì?",
        options: ["Cho một số ít lời gọi thử để kiểm tra phụ thuộc đã hồi phục chưa", "Chỉ cho request GET đi qua", "Giảm timeout một nửa", "Chia đôi tải cho hai phụ thuộc"],
        answer: 0,
        explain: "Half-open thăm dò có kiểm soát: thành công thì đóng mạch, thất bại thì mở lại."
      },
      {
        q: "Vì sao cần ngưỡng số lời gọi tối thiểu trước khi mở mạch?",
        options: ["Để tiết kiệm bộ nhớ","Để tăng tỉ lệ lỗi","Vì thư viện yêu cầu","Để tránh mở mạch do một hai lỗi ngẫu nhiên lúc lưu lượng thấp"],
        answer: 3,
        explain: "Với 2 lời gọi, 1 lỗi đã là 50%. Không có ngưỡng tối thiểu, breaker sẽ mở mạch vô lý khi ít tải."
      }
    ]
  },

  "p12.m3.t3": {
    sections: [
      {
        h: "Bulkhead: cô lập tài nguyên",
        p: [
          "Tên gọi lấy từ các khoang kín của tàu thủy: một khoang thủng nước không làm chìm cả tàu. Trong phần mềm, bulkhead chia tài nguyên (connection pool, thread, số request đồng thời) theo từng luồng hoặc từng phụ thuộc. Nếu gọi dịch vụ gợi ý bị treo, nó chỉ chiếm hết phần tài nguyên của mình, còn luồng thanh toán vẫn có phần riêng.",
          "Trong Node.js không có thread pool theo từng request như Java, nhưng ý tưởng giữ nguyên: giới hạn số lời gọi đồng thời tới mỗi phụ thuộc bằng semaphore, dùng HTTP agent với `maxSockets` riêng, pool DB riêng cho các tác vụ nặng như báo cáo, và ở mức hạ tầng thì triển khai riêng pod hoặc worker cho từng loại tải."
        ],
        code: {
          lang: "typescript",
          file: "src/resilience/bulkhead.ts",
          src: `export class Bulkhead {
  private active = 0;
  private queue: (() => void)[] = [];

  constructor(private maxConcurrent: number, private maxQueue: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      // Hàng chờ đầy: từ chối ngay thay vì tích tụ vô hạn (backpressure)
      if (this.queue.length >= this.maxQueue) throw new OverloadedError('Bulkhead full');
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }
}

// Mỗi phụ thuộc một bulkhead riêng
const recoBulkhead = new Bulkhead(20, 50);
const paymentBulkhead = new Bulkhead(100, 200);`
        }
      },
      {
        h: "Backpressure: từ chối sớm khi quá tải",
        p: [
          "Khi tải vượt khả năng xử lý, hàng đợi trong hệ thống dài ra, độ trễ tăng, cho đến khi mọi request đều timeout. Server lúc này vẫn làm việc hết sức nhưng toàn làm việc vô ích cho những client đã bỏ đi. Backpressure là cơ chế báo cho phía gửi chậm lại, còn load shedding là chủ động từ chối một phần tải để phần còn lại được phục vụ tốt.",
          "Với HTTP, trả 429 Too Many Requests khi một client vượt quota, và 503 Service Unavailable kèm `Retry-After` khi server quá tải chung. Từ chối sớm tốn rất ít tài nguyên so với xử lý dở dang. Tín hiệu quá tải có thể là số request đang xử lý, độ dài hàng chờ, độ trễ event loop của Node.js, hoặc thời gian request đã chờ trong hàng đợi (chờ quá lâu thì bỏ, vì client có lẽ đã timeout)."
        ]
      },
      {
        h: "Backpressure trong messaging và stream",
        p: [
          "Với queue, backpressure tự nhiên hơn: consumer chỉ lấy lượng message vừa sức nhờ `prefetch` trong RabbitMQ hoặc pull theo batch trong Kafka; message tồn đọng nằm an toàn trong broker. Nhưng cần giới hạn độ dài queue và cảnh báo khi consumer lag tăng, vì queue vô hạn chỉ dời vấn đề sang chỗ khác. Với Node.js stream, `pipeline()` tự tôn trọng backpressure: khi `write()` trả về false thì phía đọc tạm dừng cho đến sự kiện `drain`."
        ]
      }
    ],
    summary: [
      "Bulkhead chia tài nguyên theo luồng/phụ thuộc để một phần hỏng không kéo sập toàn bộ.",
      "Trong Node.js: semaphore giới hạn đồng thời, agent/pool riêng, pod riêng cho tải nặng.",
      "Backpressure và load shedding: từ chối sớm bằng 429/503 thay vì xử lý dở rồi timeout.",
      "Hàng đợi phải có giới hạn; queue vô hạn chỉ che giấu quá tải."
    ],
    pitfalls: [
      "Dùng chung một connection pool DB cho API và job báo cáo nặng: báo cáo chiếm hết connection, API timeout.",
      "Hàng chờ trong bộ nhớ không giới hạn: bộ nhớ tăng đến khi process bị OOM kill.",
      "Trả 503 mà không có `Retry-After` và client retry ngay: tăng tải thay vì giảm."
    ],
    quiz: [
      {
        q: "Mục tiêu chính của bulkhead là gì?",
        options: ["Tăng throughput tối đa","Cân bằng tải giữa các vùng","Mã hóa dữ liệu","Cô lập tài nguyên để sự cố của một phụ thuộc không lan sang luồng khác"],
        answer: 3,
        explain: "Bulkhead giới hạn phần tài nguyên mỗi luồng được dùng, nên một phụ thuộc treo chỉ làm cạn phần của nó."
      },
      {
        q: "Server đang quá tải chung. Mã phản hồi phù hợp khi từ chối sớm là gì?",
        options: ["200 kèm body rỗng", "400 Bad Request", "503 Service Unavailable kèm Retry-After", "301 Redirect"],
        answer: 2,
        explain: "503 báo server tạm thời không phục vụ được; `Retry-After` hướng dẫn client chờ. 429 dành cho trường hợp một client vượt quota của mình."
      },
      {
        q: "Vì sao từ chối sớm tốt hơn nhận hết request khi quá tải?",
        options: ["Vì từ chối sớm tốn ít tài nguyên và giúp phần request còn lại được phục vụ trong thời gian chấp nhận được", "Vì client thích bị từ chối", "Vì nó làm tăng độ trễ", "Vì nó thay thế autoscaling"],
        answer: 0,
        explain: "Nhận hết thì mọi request đều chậm và timeout, tức là 0% thành công thực chất. Load shedding bảo vệ phần tải mà hệ thống xử lý được."
      }
    ]
  },

  "p12.m3.t4": {
    sections: [
      {
        h: "Vì sao cần rate limit",
        p: [
          "Rate limiting giới hạn số request một đối tượng (user, API key, IP) được gửi trong một khoảng thời gian. Mục đích: bảo vệ hệ thống khỏi quá tải và lạm dụng (brute-force đăng nhập, scraping), chia tài nguyên công bằng giữa các khách hàng, và kiểm soát chi phí khi gọi API trả phí. Khi vượt giới hạn, trả 429 kèm các header cho client biết còn bao nhiêu lượt và khi nào thử lại."
        ]
      },
      {
        h: "Các thuật toán phổ biến",
        p: ["Mỗi thuật toán có cách đếm khác nhau, dẫn tới khác biệt về độ chính xác, bộ nhớ và khả năng cho phép burst:"],
        list: [
          "Fixed window: đếm theo cửa sổ cố định, ví dụ key `user:42:12:05` cho phút 12:05. Rất đơn giản (INCR + EXPIRE). Nhược điểm: ở ranh giới hai cửa sổ, client có thể gửi gần gấp đôi giới hạn trong thời gian ngắn (100 request lúc 12:05:59 và 100 lúc 12:06:00).",
          "Sliding window log: lưu timestamp từng request (ví dụ Redis sorted set), đếm số request trong N giây gần nhất. Chính xác, nhưng tốn bộ nhớ tỉ lệ với số request.",
          "Sliding window counter: ước lượng bằng trọng số giữa cửa sổ hiện tại và cửa sổ trước. Tiết kiệm bộ nhớ, sai số nhỏ, được dùng phổ biến.",
          "Token bucket: xô chứa tối đa B token, được nạp đều R token/giây; mỗi request lấy một token, hết token thì bị từ chối. Cho phép burst tới B nhưng tốc độ trung bình bị giới hạn ở R.",
          "Leaky bucket: request vào một hàng đợi và được xử lý ra với tốc độ cố định, như nước rỉ khỏi xô. Làm mượt tải đầu ra, nhưng request có thể phải chờ."
        ]
      },
      {
        h: "Token bucket cài đặt thế nào",
        p: [
          "Token bucket không cần timer nạp token. Chỉ cần lưu số token và thời điểm cập nhật cuối; khi có request, tính số token được nạp thêm theo thời gian đã trôi qua. Đoạn code dưới là bản in-memory để hiểu cơ chế; bản phân tán dùng Redis và Lua sẽ nằm trong bài tập Rate Limiter phân tán."
        ],
        code: {
          lang: "typescript",
          file: "src/ratelimit/token-bucket.ts",
          src: `export class TokenBucket {
  private tokens: number;
  private last = Date.now();

  constructor(private capacity: number, private refillPerSec: number) {
    this.tokens = capacity;
  }

  tryTake(cost = 1): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const elapsed = (now - this.last) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSec);
    this.last = now;

    if (this.tokens >= cost) {
      this.tokens -= cost;
      return { allowed: true, retryAfterMs: 0 };
    }
    const missing = cost - this.tokens;
    return { allowed: false, retryAfterMs: Math.ceil((missing / this.refillPerSec) * 1000) };
  }
}

// 10 request/giây trung bình, cho phép burst 20
const bucket = new TokenBucket(20, 10);`
        }
      },
      {
        h: "Chọn thuật toán và nơi đặt",
        p: [
          "Token bucket hợp với API công khai vì chấp nhận burst tự nhiên của người dùng. Leaky bucket hợp khi cần bảo vệ phụ thuộc chỉ chịu được tốc độ đều, ví dụ nhà cung cấp SMS. Sliding window counter là cân bằng tốt giữa chính xác và chi phí. Đặt rate limit ở nhiều lớp: edge/gateway chặn thô theo IP, tầng ứng dụng giới hạn theo user và theo loại thao tác (đăng nhập chặt hơn đọc)."
        ]
      }
    ],
    summary: [
      "Rate limit bảo vệ hệ thống, chống lạm dụng và chia tài nguyên công bằng; vượt thì trả 429.",
      "Fixed window đơn giản nhưng có hiệu ứng ranh giới; sliding window chính xác hơn.",
      "Token bucket cho phép burst tới dung lượng xô, giới hạn tốc độ trung bình.",
      "Leaky bucket làm mượt đầu ra với tốc độ cố định.",
      "Token bucket tính token lười theo thời gian trôi qua, không cần timer."
    ],
    pitfalls: [
      "Dùng fixed window cho giới hạn chặt như đăng nhập: kẻ tấn công khai thác ranh giới để gửi gấp đôi.",
      "Giới hạn theo IP cho mọi API: người dùng sau NAT công ty hoặc nhà mạng chung một IP bị chặn oan. Ưu tiên theo user/API key khi đã xác thực.",
      "Rate limit trong bộ nhớ từng instance rồi scale lên 10 instance: giới hạn thực tế gấp 10 lần mong muốn."
    ],
    quiz: [
      {
        q: "Token bucket dung lượng 20, nạp 5 token/giây, đang đầy. Client gửi 30 request ngay lập tức. Bao nhiêu request được chấp nhận ngay?",
        options: ["5", "20", "30", "25"],
        answer: 1,
        explain: "Xô đầy có 20 token nên 20 request đầu qua; 10 request còn lại bị từ chối vì token chưa kịp nạp lại."
      },
      {
        q: "Nhược điểm đặc trưng của fixed window là gì?",
        options: ["Tốn bộ nhớ tỉ lệ với số request","Không cho phép burst nào","Không cài được bằng Redis","Ở ranh giới hai cửa sổ, client có thể gửi gần gấp đôi giới hạn trong thời gian ngắn"],
        answer: 3,
        explain: "Bộ đếm reset đột ngột ở đầu cửa sổ mới. Tốn bộ nhớ theo số request là nhược điểm của sliding window log."
      },
      {
        q: "Cần gọi nhà cung cấp SMS chỉ chịu tối đa 50 tin/giây đều đặn. Thuật toán nào hợp nhất?",
        options: ["Leaky bucket (hàng đợi xả với tốc độ cố định)", "Fixed window 1 phút 3.000 tin", "Không cần rate limit", "Token bucket với dung lượng 10.000"],
        answer: 0,
        explain: "Leaky bucket xả đều, đúng với phụ thuộc chỉ chịu tốc độ cố định. Fixed window theo phút cho phép dồn 3.000 tin trong vài giây; token bucket dung lượng lớn cho phép burst lớn."
      }
    ]
  },

  "p12.m3.t5": {
    sections: [
      {
        h: "Giữ phần quan trọng nhất sống",
        p: [
          "Graceful degradation là thiết kế để khi một phần hỏng hoặc hệ thống quá tải, sản phẩm vẫn chạy với chức năng giảm bớt thay vì sập hoàn toàn. Trang sản phẩm vẫn hiện giá và nút mua dù khối “sản phẩm tương tự” trống; checkout vẫn chạy dù không tính được điểm thưởng ngay (sẽ cộng sau).",
          "Bước đầu tiên là phân loại tính năng theo mức quan trọng. Ví dụ với thương mại điện tử: tầng 1 là xem sản phẩm, giỏ hàng, thanh toán; tầng 2 là tìm kiếm nâng cao, đánh giá; tầng 3 là gợi ý, thống kê, huy hiệu. Khi có sự cố, tắt dần từ tầng 3."
        ]
      },
      {
        h: "Các kỹ thuật",
        p: ["Mỗi kỹ thuật dưới đây đổi một phần chất lượng hoặc độ tươi của dữ liệu để giữ cho luồng chính hoạt động:"],
        list: [
          "Fallback theo từng phụ thuộc: cache cũ (stale-while-revalidate), giá trị mặc định, danh sách phổ biến tĩnh thay cho gợi ý cá nhân hóa.",
          "Kill switch / feature flag: tắt tính năng phụ trong vài giây mà không cần deploy.",
          "Chuyển đồng bộ thành bất đồng bộ: nhận yêu cầu, xếp hàng, xử lý sau (gửi email, cập nhật thống kê).",
          "Chế độ chỉ đọc: khi DB primary gặp sự cố, vẫn cho xem dữ liệu từ replica và tạm khóa thao tác ghi, kèm thông báo rõ ràng.",
          "Giảm chất lượng: ảnh độ phân giải thấp hơn, ít kết quả hơn, bỏ các trường tốn kém trong response.",
          "Ưu tiên tải: load shedding bỏ request tầng thấp trước (bot, prefetch, analytics) để giữ request tầng cao."
        ],
        code: {
          lang: "typescript",
          file: "src/product/product-page.service.ts",
          src: `async getProductPage(id: string, userId?: string) {
  // Tầng 1: bắt buộc. Lỗi thì trả lỗi.
  const product = await this.catalog.get(id);

  // Tầng 3: phụ. Có flag tắt nhanh, timeout ngắn, lỗi thì dùng fallback.
  const recommendations = (await this.flags.isOn('recommendations'))
    ? await this.reco
        .forProduct(id, userId, { timeoutMs: 150 })
        .catch(() => this.cache.getStale('reco:popular') ?? [])
    : [];

  const reviews = await this.reviews.summary(id, { timeoutMs: 200 }).catch(() => null);

  return { product, recommendations, reviews, degraded: reviews === null };
}`
        }
      },
      {
        h: "Chuẩn bị trước, không phải lúc sự cố",
        p: [
          "Degradation phải được thiết kế và kiểm thử trước: frontend phải hiển thị ổn khi một khối dữ liệu là null; flag phải thật sự tắt được; runbook ghi rõ tắt gì theo thứ tự nào. Chaos testing hoặc game day (cố ý làm hỏng một phụ thuộc trong môi trường kiểm soát) giúp phát hiện chỗ chưa có fallback. Theo dõi tỉ lệ response ở chế độ suy giảm để biết khi nào hệ thống đang “sống sót” thay vì khỏe mạnh."
        ]
      }
    ],
    summary: [
      "Graceful degradation: hỏng một phần thì giảm chức năng, không sập toàn bộ.",
      "Phân tầng tính năng theo mức quan trọng; tắt tầng thấp trước.",
      "Kỹ thuật: fallback, feature flag/kill switch, bất đồng bộ hóa, chế độ chỉ đọc, giảm chất lượng.",
      "Phải thiết kế và kiểm thử trước bằng chaos testing/game day, và có metrics cho chế độ suy giảm."
    ],
    pitfalls: [
      "Tính năng phụ gọi đồng bộ không timeout ngay trong luồng checkout: gợi ý chậm làm thanh toán chậm theo.",
      "Frontend không xử lý trường null: backend degrade đúng nhưng trang vẫn trắng.",
      "Feature flag chưa bao giờ được thử tắt: đến lúc sự cố mới phát hiện tắt không có tác dụng."
    ],
    quiz: [
      {
        q: "Dịch vụ gợi ý sản phẩm bị lỗi. Cách xử lý đúng tinh thần graceful degradation là gì?",
        options: ["Trả 500 cho toàn bộ trang sản phẩm", "Hiển thị trang với danh sách phổ biến từ cache hoặc ẩn khối gợi ý", "Retry vô hạn cho đến khi gợi ý trả về", "Chuyển hướng người dùng sang trang lỗi"],
        answer: 1,
        explain: "Gợi ý là tính năng phụ; trang vẫn phải hiện sản phẩm và cho mua. Retry vô hạn làm chậm cả trang."
      },
      {
        q: "Công cụ nào giúp tắt tính năng phụ nhanh mà không cần deploy?",
        options: ["Database migration","Đổi DNS","Tăng số replica","Feature flag / kill switch"],
        answer: 3,
        explain: "Feature flag đổi hành vi lúc chạy trong vài giây. Các lựa chọn còn lại không nhắm vào việc tắt một tính năng."
      },
      {
        q: "DB primary gặp sự cố nhưng replica vẫn hoạt động. Chế độ suy giảm hợp lý là gì?",
        options: ["Cho ghi vào replica", "Chế độ chỉ đọc: vẫn xem dữ liệu từ replica, tạm khóa thao tác ghi và thông báo rõ", "Tắt toàn bộ hệ thống", "Ghi vào cache rồi bỏ qua DB"],
        answer: 1,
        explain: "Replica không nhận ghi; ghi vào cache rồi bỏ DB có nguy cơ mất dữ liệu. Chế độ chỉ đọc giữ được phần lớn giá trị cho người dùng."
      }
    ]
  },

"p12.m4.t0": {
    sections: [
      {
        h: "Yêu cầu",
        p: [
          "Bắt đầu buổi phỏng vấn bằng việc làm rõ phạm vi. Chức năng: tạo link ngắn từ URL dài (có thể tùy chọn alias riêng và thời hạn), redirect link ngắn về URL gốc, xem thống kê lượt click. Ngoài phạm vi: tài khoản phức tạp, chỉnh sửa link.",
          "Phi chức năng: redirect phải rất nhanh (p95 dưới vài chục ms phía server) và sẵn sàng cao, vì link hỏng là trải nghiệm tệ ở nơi khác trên internet. Link ngắn không được trùng, không nên đoán được theo thứ tự nếu có yêu cầu riêng tư. Analytics được phép trễ vài giây đến vài phút, và tuyệt đối không được làm chậm redirect."
        ]
      },
      {
        h: "Ước lượng",
        p: ["Giả định để luyện tập: 100 triệu link mới mỗi tháng, tỉ lệ đọc:ghi 100:1, lưu 5 năm, mỗi bản ghi khoảng 500 byte."],
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Ghi:  100M / tháng / (30 x 86.400 s ≈ 2,6 x 10^6 s)   ≈ 40 link/s   (peak ~200/s)
Đọc:  40 x 100                                         ≈ 4.000 redirect/s (peak ~20.000/s)
Tổng bản ghi 5 năm: 100M x 12 x 5                      = 6 x 10^9 link
Lưu trữ: 6 x 10^9 x 500 B                              ≈ 3 TB (chưa tính replica, index)
Độ dài mã: 62^7 ≈ 3,5 x 10^12  >>  6 x 10^9  -> 7 ký tự base62 là đủ dư
Cache: 20% link nóng mỗi ngày, giả sử 20M link x 500 B  ≈ 10 GB -> vừa một cụm Redis nhỏ`
        }
      },
      {
        h: "Thiết kế tổng thể",
        p: [
          "Sinh ID là quyết định trung tâm. Hash URL (MD5 rồi cắt 7 ký tự) dễ đụng độ và phải kiểm tra lại. Bộ đếm tăng dần mã hóa base62 cho mã ngắn và không đụng độ, nhưng lộ thứ tự và cần nguồn đếm chung; có thể cấp phát theo lô (mỗi instance xin một dải 10.000 số từ DB/Redis) để tránh điểm nghẽn. Snowflake ID (64 bit: timestamp 41 bit, machine id 10 bit, sequence 12 bit) sinh cục bộ không cần phối hợp, nhưng mã dài hơn (khoảng 11 ký tự base62). Muốn mã khó đoán thì dùng số ngẫu nhiên đủ lớn và kiểm tra trùng bằng ràng buộc unique.",
          "Redirect trả `302` nếu cần đếm mọi click (trình duyệt không cache), hoặc `301` để giảm tải nhưng mất bớt số liệu. Mỗi click đẩy một event vào Kafka một cách bất đồng bộ; worker gom theo lô và ghi vào kho phân tích như ClickHouse."
        ],
        code: {
          lang: "text",
          file: "architecture.txt",
          src: `Client --> CDN/LB --> Redirect service (stateless, nhiều replica)
                         |  1. GET cache Redis  code -> url
                         |  2. miss: đọc PostgreSQL (hoặc KV store), set cache
                         |  3. trả 302 Location: url
                         |  4. fire-and-forget: event click --> Kafka --> Analytics worker --> ClickHouse
                         |
Client --> API tạo link --> ID generator (dải số theo lô) --> base62 --> PostgreSQL (code PK)
                         \\--> rate limit theo user/IP để chống spam`
        }
      },
      {
        h: "Điểm nghẽn và đánh đổi",
        p: [
          "Đọc chiếm áp đảo, nên cache là then chốt; link rất nóng có thể cache thêm trong bộ nhớ từng instance vài giây. Dữ liệu 3 TB sau 5 năm vẫn có thể nằm trong PostgreSQL với partition, hoặc chuyển sang KV store như DynamoDB/Cassandra vì truy vấn chỉ là tra theo khóa. Analytics qua queue giúp redirect không phụ thuộc vào kho phân tích; nếu Kafka tạm lỗi, chấp nhận mất một ít click hoặc đệm cục bộ, nhưng redirect vẫn chạy.",
          "Các câu hỏi mở rộng hay gặp: xử lý link hết hạn (TTL và job dọn), chống lạm dụng (link lừa đảo, kiểm tra với danh sách đen), alias tùy chọn trùng nhau (ràng buộc unique và trả lỗi), và đa vùng (replica đọc ở mỗi vùng, ghi về một vùng)."
        ]
      }
    ],
    summary: [
      "Làm rõ chức năng, phi chức năng: redirect nhanh, sẵn sàng cao, analytics được trễ.",
      "Đọc gấp khoảng 100 lần ghi; 7 ký tự base62 dư cho hàng tỉ link.",
      "Sinh ID bằng bộ đếm cấp theo lô + base62, hoặc Snowflake; hash cắt ngắn dễ đụng độ.",
      "Cache Redis cho đường redirect; analytics bất đồng bộ qua Kafka.",
      "301 giảm tải nhưng mất số liệu click; 302 đếm đầy đủ."
    ],
    pitfalls: [
      "Ghi analytics đồng bộ vào DB trong mỗi redirect: kho phân tích chậm là redirect chậm.",
      "Dùng một bộ đếm trung tâm cho mỗi link mới mà không cấp theo lô: thành điểm nghẽn và điểm lỗi duy nhất.",
      "Trả 301 rồi phát hiện số liệu click thấp bất thường: trình duyệt đã cache redirect."
    ],
    quiz: [
      {
        q: "Vì sao 7 ký tự base62 đủ cho 6 tỉ link?",
        options: ["Vì 62^7 ≈ 3,5 nghìn tỉ, lớn hơn rất nhiều so với 6 tỉ", "Vì 7 là số may mắn", "Vì base62 nén URL gốc", "Vì mỗi ký tự chứa 62 bit"],
        answer: 0,
        explain: "Mỗi ký tự có 62 khả năng, 7 ký tự cho khoảng 3,5 x 10^12 tổ hợp. Mỗi ký tự base62 mang khoảng 5,95 bit chứ không phải 62 bit."
      },
      {
        q: "Cần thống kê chính xác mọi lượt click. Nên trả mã redirect nào?",
        options: ["301 Moved Permanently", "302 Found", "200 OK kèm URL trong body", "404"],
        answer: 1,
        explain: "301 được trình duyệt cache nên các lần sau không đi qua server. 302 buộc mỗi lần click đều gửi request tới server."
      },
      {
        q: "Cách ghi analytics hợp lý nhất để không làm chậm redirect?",
        options: ["INSERT đồng bộ vào PostgreSQL rồi mới redirect", "Đẩy event click vào queue bất đồng bộ, worker ghi theo lô vào kho phân tích", "Ghi file log trên máy rồi đọc thủ công", "Không cần analytics"],
        answer: 1,
        explain: "Tách analytics khỏi đường nóng giúp redirect chỉ phụ thuộc cache/DB tra khóa. Ghi theo lô cũng hiệu quả hơn cho kho phân tích."
      }
    ]
  },

  "p12.m4.t1": {
    sections: [
      {
        h: "Yêu cầu",
        p: [
          "Chức năng: giới hạn số request theo API key hoặc user (ví dụ 100 request/phút, cho phép burst ngắn), có thể cấu hình khác nhau theo gói dịch vụ và theo endpoint; trả 429 kèm header `RateLimit-Limit`, `RateLimit-Remaining`, `Retry-After`.",
          "Phi chức năng: giới hạn phải đúng trên toàn cụm, không phải trên từng node (20 instance gateway mà mỗi node đếm riêng thì giới hạn thực tế gấp 20). Độ trễ thêm vào mỗi request phải rất nhỏ, cỡ một round-trip tới Redis. Nếu kho đếm gặp sự cố, hệ thống phải có hành vi đã quyết định trước."
        ]
      },
      {
        h: "Ước lượng",
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Giả định: 50.000 request/s qua gateway, 10 triệu API key/user hoạt động
Mỗi request = 1 lần gọi script Redis  -> 50.000 lệnh/s
   Hàng chục nghìn lệnh/s là mức một Redis node thường xử lý được,
   nhưng cần benchmark; có dư địa thì dùng Redis Cluster chia theo key.
Bộ nhớ: mỗi key hash {tokens, ts} + overhead ~ 100 B
   10M x 100 B ≈ 1 GB  -> nhỏ; key có TTL tự dọn khi user ngừng gửi`
        },
        p: [
          "Con số cho thấy Redis không phải vấn đề về dung lượng; điều cần quan tâm là độ trễ mạng và tính sẵn sàng của Redis."
        ]
      },
      {
        h: "Thiết kế: token bucket bằng Redis và Lua",
        p: [
          "Đọc số token, tính toán rồi ghi lại là ba bước; nếu làm từ client thì hai gateway có thể đọc cùng giá trị và cùng cho qua (race condition). Lua script chạy nguyên tử trong Redis: không lệnh nào khác chen vào giữa, và chỉ tốn một round-trip. Lấy thời gian bằng lệnh `TIME` của Redis thay vì đồng hồ của gateway để tránh lệch giờ giữa các node. Script chỉ đụng một key nên chạy được trên Redis Cluster."
        ],
        code: {
          lang: "typescript",
          file: "src/ratelimit/redis-token-bucket.ts",
          src: `const LUA = \`
local key      = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])   -- token mỗi giây
local cost     = tonumber(ARGV[3])

local t   = redis.call('TIME')
local now = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)

local data   = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1]) or capacity
local ts     = tonumber(data[2]) or now

tokens = math.min(capacity, tokens + math.max(0, now - ts) * rate / 1000)
local allowed = 0
if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
end

redis.call('HSET', key, 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', key, math.ceil(capacity / rate * 1000) * 2)
local retryMs = 0
if allowed == 0 then retryMs = math.ceil((cost - tokens) / rate * 1000) end
return { allowed, math.floor(tokens), retryMs }
\`;

export async function consume(key: string, capacity: number, ratePerSec: number) {
  try {
    const [allowed, remaining, retryMs] = (await redis.eval(LUA, {
      keys: ['rl:' + key],
      arguments: [String(capacity), String(ratePerSec), '1'],
    })) as number[];
    return { allowed: allowed === 1, remaining, retryMs };
  } catch {
    // Redis lỗi: fail-open cho API thường, fail-closed cho đăng nhập/OTP (quyết định trước)
    return { allowed: true, remaining: -1, retryMs: 0 };
  }
}`
        }
      },
      {
        h: "Điểm nghẽn và đánh đổi",
        list: [
          "Fail-open hay fail-closed: Redis lỗi mà chặn hết thì một sự cố phụ làm sập toàn API; mở hết thì mất bảo vệ. Thường fail-open cho API thông thường, fail-closed cho endpoint nhạy cảm như đăng nhập, gửi OTP.",
          "Độ trễ: mỗi request thêm một round-trip. Có thể giảm bằng cách đặt Redis cùng vùng, dùng `EVALSHA` để không gửi lại nội dung script, hoặc kết hợp một limiter cục bộ thô ở mỗi node làm lớp chặn đầu.",
          "Chính xác và chi phí: có thể cho mỗi node “mượn” trước một lô token rồi đồng bộ định kỳ, giảm tải Redis nhưng giới hạn chỉ gần đúng.",
          "Đa vùng: một Redis toàn cầu thì chậm; mỗi vùng một Redis thì giới hạn là theo vùng. Thường chấp nhận giới hạn theo vùng.",
          "Hot key: một API key cực lớn dồn mọi lệnh vào một shard Redis; có thể tách key đó thành nhiều bucket con."
        ],
        p: [
          "Trong phỏng vấn, hãy nói rõ bạn chọn thuật toán nào (token bucket cho phép burst, sliding window counter cho giới hạn mượt hơn) và vì sao."
        ]
      }
    ],
    summary: [
      "Giới hạn phải đúng trên toàn cụm, nên cần kho đếm chung như Redis.",
      "Lua script đảm bảo đọc-tính-ghi nguyên tử và chỉ một round-trip.",
      "Dùng thời gian của Redis (`TIME`) để tránh lệch đồng hồ giữa các node.",
      "Quyết định trước fail-open hay fail-closed theo mức nhạy cảm của endpoint.",
      "Đánh đổi giữa độ chính xác, độ trễ và tải Redis; hot key cần tách."
    ],
    pitfalls: [
      "Dùng `GET` rồi `SET` từ ứng dụng thay vì Lua: hai node cùng đọc một giá trị và cùng cho qua, vượt giới hạn.",
      "Dùng `Date.now()` của từng gateway trong tính toán: đồng hồ lệch làm token nạp sai.",
      "Không đặt TTL cho key: hàng triệu key của user đã rời đi nằm mãi trong Redis."
    ],
    quiz: [
      {
        q: "Vì sao dùng Lua script thay vì các lệnh GET/SET riêng lẻ?",
        options: ["Lua chạy nhanh hơn C", "Script chạy nguyên tử trong Redis, tránh race giữa nhiều gateway và chỉ tốn một round-trip", "Redis không hỗ trợ SET", "Để mã hóa dữ liệu"],
        answer: 1,
        explain: "Tính nguyên tử là lý do chính; giảm round-trip là lợi ích phụ. Lua không nhanh hơn C, và Redis vẫn hỗ trợ SET."
      },
      {
        q: "Redis của rate limiter bị lỗi. Với endpoint gửi OTP qua SMS, lựa chọn hợp lý là gì?",
        options: ["Fail-open: cho mọi request qua", "Fail-closed: tạm chặn để tránh bị lạm dụng gửi SMS tốn tiền", "Xóa rate limit vĩnh viễn", "Chuyển sang fixed window trong RAM mà không giới hạn"],
        answer: 1,
        explain: "OTP là endpoint nhạy cảm, bị lạm dụng gây mất tiền và spam người dùng. API đọc thông thường thì hay chọn fail-open."
      },
      {
        q: "20 gateway, mỗi node tự giới hạn 100 request/phút trong bộ nhớ. Giới hạn thực tế cho một user có thể lên tới bao nhiêu?",
        options: ["100", "Khoảng 2.000", "5", "Không giới hạn"],
        answer: 1,
        explain: "Nếu request của user được chia đều cho 20 node, mỗi node cho 100, tổng khoảng 2.000 request/phút. Đó là lý do cần kho đếm chung."
      }
    ]
  },

  "p12.m4.t2": {
    sections: [
      {
        h: "Yêu cầu",
        p: [
          "Chức năng: chat 1-1 và nhóm (giới hạn, ví dụ 500 thành viên), gửi và nhận tin nhắn real-time, lưu lịch sử và tải lại khi mở ứng dụng, trạng thái online/last seen, trạng thái đã gửi/đã nhận, push notification khi người nhận offline.",
          "Phi chức năng: độ trễ gửi-nhận thấp (dưới vài trăm ms khi cả hai online), không mất tin nhắn đã được server xác nhận, thứ tự tin nhắn đúng trong mỗi cuộc hội thoại, sẵn sàng cao. Trạng thái online được phép hơi sai vài giây."
        ]
      },
      {
        h: "Ước lượng",
        p: ["Nêu giả định trước rồi tính. Hai con số quyết định kiến trúc ở đây là số kết nối đồng thời (quyết định số gateway) và dung lượng tin nhắn tích lũy (quyết định chọn kho lưu trữ)."],
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Giả định: 50M DAU, mỗi người gửi 40 tin/ngày, 20% DAU online đồng thời lúc peak
Tin nhắn: 50M x 40 = 2 x 10^9/ngày / 10^5 s   ≈ 20.000 tin/s (peak x3 ≈ 60.000)
Kết nối đồng thời: 50M x 20%                   = 10M WebSocket
   nếu mỗi gateway giữ ~100k kết nối (cần đo)  -> ~100 gateway node + dự phòng
Lưu trữ: 2 x 10^9 x 200 B                      ≈ 400 GB/ngày ≈ 150 TB/năm (chưa replica)
-> ghi nhiều, truy vấn theo (conversation, thời gian) -> hợp wide-column (Cassandra/ScyllaDB)`
        }
      },
      {
        h: "Thiết kế tổng thể",
        p: [
          "Client giữ kết nối WebSocket tới một WebSocket gateway (stateful, chỉ lo kết nối). Khi kết nối, gateway ghi vào session registry trong Redis: `user -> gateway id`. Khi A gửi tin: gateway chuyển cho Chat service; Chat service cấp id tăng dần theo cuộc hội thoại (hoặc id có thứ tự thời gian), lưu vào message store, trả ack cho A. Sau đó tra registry xem B đang ở gateway nào và đẩy tin qua kênh riêng của gateway đó (Redis Pub/Sub hoặc Kafka). B offline thì gửi push qua Notification service.",
          "Message store partition theo `conversation_id`, sắp xếp theo `message_id`, nên tải lịch sử là đọc tuần tự một partition. Client lưu `last_seen_message_id` để khi kết nối lại chỉ lấy phần còn thiếu. Nhóm nhỏ: fan-out lúc ghi tới từng thành viên online. Kênh rất lớn: không đẩy tới từng người, client kéo khi mở."
        ],
        code: {
          lang: "text",
          file: "architecture.txt",
          src: `Client A ==WS==> Gateway 1 --> Chat service --> Message store (Cassandra, PK: conversation_id)
                    ^               |   \\--> ack về A (đã lưu)
                    |               |
   Session registry (Redis): user_b -> gateway-7, presence TTL
                                    |
                                    v
                  pub/sub kênh "gw:7" --> Gateway 7 ==WS==> Client B
                                    \\--> B offline? --> Notification svc --> APNs/FCM`
        }
      },
      {
        h: "Điểm nghẽn và đánh đổi",
        list: [
          "Gateway stateful: deploy hay node chết làm hàng trăm nghìn client kết nối lại cùng lúc. Client phải reconnect với backoff + jitter và đồng bộ lại từ `last_seen_message_id`.",
          "Thứ tự: chỉ cần đúng trong một cuộc hội thoại. Sequence theo conversation (hoặc Kafka partition theo conversation_id) đủ; không cần thứ tự toàn cục.",
          "Giao nhận: server lưu xong mới ack; client gửi kèm `client_message_id` để retry không tạo tin trùng (idempotent).",
          "Presence: heartbeat mỗi 30 giây, key Redis TTL khoảng 60 giây; phát thay đổi presence cho mọi bạn bè rất tốn, nên chỉ gửi cho người đang mở cuộc chat hoặc cho client kéo khi cần.",
          "Mã hóa đầu cuối (end-to-end) làm server không đọc được nội dung, ảnh hưởng tìm kiếm và kiểm duyệt; nêu như một hướng mở rộng."
        ],
        p: [
          "Nếu người phỏng vấn hỏi vì sao không dùng HTTP polling: long polling vẫn là phương án dự phòng hợp lý khi mạng chặn WebSocket, nhưng WebSocket cho độ trễ và chi phí mỗi tin thấp hơn."
        ]
      }
    ],
    summary: [
      "WebSocket gateway giữ kết nối; Chat service lưu và định tuyến; registry Redis ánh xạ user tới gateway.",
      "Lưu tin theo conversation_id, sắp theo message_id; thứ tự chỉ cần trong mỗi cuộc hội thoại.",
      "Ack sau khi lưu, client_message_id để retry idempotent, đồng bộ lại bằng last_seen_message_id.",
      "Presence bằng heartbeat + TTL, chấp nhận sai lệch vài giây.",
      "Người offline nhận push; kênh lớn chuyển sang mô hình kéo."
    ],
    pitfalls: [
      "Ack cho người gửi trước khi lưu tin: server chết là mất tin mà người gửi tưởng đã gửi.",
      "Mọi client reconnect ngay lập tức khi gateway restart: tạo thundering herd vào các gateway còn lại.",
      "Broadcast mọi thay đổi online/offline cho toàn bộ danh bạ: lượng event tăng bùng nổ."
    ],
    quiz: [
      {
        q: "Làm sao Chat service biết phải đẩy tin cho user B qua gateway nào?",
        options: ["Gửi tới mọi gateway", "Tra session registry (ví dụ Redis) ánh xạ user -> gateway đang giữ kết nối", "Hỏi client B qua HTTP", "Dựa vào IP của B"],
        answer: 1,
        explain: "Registry cập nhật khi kết nối và ngắt kết nối cho phép định tuyến chính xác. Gửi tới mọi gateway lãng phí khi có hàng trăm node."
      },
      {
        q: "Để tránh tin nhắn trùng khi client retry do mạng chập chờn, cần gì?",
        options: ["Tăng timeout", "Client gửi `client_message_id` duy nhất, server khử trùng theo id đó", "Dùng HTTP/1.0", "Xóa tin trùng thủ công"],
        answer: 1,
        explain: "Id do client sinh làm cho thao tác gửi trở nên idempotent: server thấy id đã có thì chỉ trả lại ack cũ."
      },
      {
        q: "Phạm vi thứ tự tin nhắn cần đảm bảo trong ứng dụng chat là gì?",
        options: ["Thứ tự toàn cục trên mọi cuộc hội thoại", "Trong từng cuộc hội thoại", "Không cần thứ tự", "Theo thứ tự bảng chữ cái của user"],
        answer: 1,
        explain: "Người dùng chỉ quan sát thứ tự trong một cuộc hội thoại. Thứ tự toàn cục đắt và không cần thiết."
      }
    ]
  },

"p12.m4.t3": {
    sections: [
      {
        h: "Yêu cầu",
        p: [
          "Chức năng: người dùng đăng bài, follow người khác, xem news feed gồm bài của những người mình follow, sắp theo thời gian (bản đơn giản) và phân trang cuộn vô hạn. Ngoài phạm vi ban đầu: xếp hạng bằng machine learning, quảng cáo.",
          "Phi chức năng: mở feed nhanh (p95 dưới khoảng 200 ms), sẵn sàng cao; bài mới được phép xuất hiện trễ vài giây (eventual consistency). Hệ thống đọc nhiều hơn ghi rất nhiều, và có một số tài khoản có hàng triệu follower."
        ]
      },
      {
        h: "Ước lượng",
        p: ["Giả định dưới đây chỉ để luyện tập. Điều quan trọng là thấy được khuếch đại ghi khi fan-out và vấn đề của các tài khoản có rất nhiều follower."],
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Giả định: 100M DAU, mỗi người mở feed 10 lần/ngày, 10M bài mới/ngày,
          trung bình mỗi người có 200 follower
Đọc feed: 100M x 10 = 10^9/ngày / 10^5 s   ≈ 10.000 QPS (peak ~30.000)
Đăng bài: 10^7 / 10^5 s                    ≈ 100 bài/s
Fan-out on write: 100 bài/s x 200 follower ≈ 20.000 lượt ghi vào feed/s
Tài khoản 10M follower: 1 bài = 10^7 lượt ghi -> không thể fan-out trực tiếp
Feed cache: giữ 500 post id x 8 B cho người dùng hoạt động
   100M x 500 x 8 B ≈ 400 GB (chưa overhead) -> cần Redis Cluster, hoặc chỉ giữ cho user active`
        }
      },
      {
        h: "Fan-out on write, on read và mô hình lai",
        p: [
          "Fan-out on write (push): khi A đăng bài, worker chèn post id vào feed đã tính sẵn của từng follower (Redis sorted set theo thời gian). Đọc feed chỉ là lấy N phần tử đầu, rất nhanh. Nhược điểm: ghi khuếch đại theo số follower, lãng phí cho follower không bao giờ mở app, và tài khoản nổi tiếng tạo hàng triệu lượt ghi.",
          "Fan-out on read (pull): khi mở feed, lấy danh sách người mình follow, đọc bài mới nhất của từng người và trộn lại. Không tốn ghi, nhưng đọc chậm và tốn khi follow nhiều người. Mô hình lai là đáp án chuẩn: người dùng bình thường dùng push; tài khoản vượt ngưỡng follower (ví dụ 10.000) không fan-out, bài của họ được kéo lúc đọc rồi trộn với feed đã tính sẵn."
        ],
        code: {
          lang: "typescript",
          file: "src/feed/feed.service.ts",
          src: `const CELEB_THRESHOLD = 10_000;
const FEED_MAX = 500;

// Worker nghe event PostCreated từ Kafka
export async function onPostCreated(post: { id: string; authorId: string; ts: number }) {
  const author = await users.get(post.authorId);
  if (author.followerCount >= CELEB_THRESHOLD) return; // celeb: kéo lúc đọc

  for await (const batch of follows.followerIdsInBatches(post.authorId, 1000)) {
    const pipe = redis.multi();
    for (const fid of batch) {
      pipe.zAdd('feed:' + fid, { score: post.ts, value: post.id });
      pipe.zRemRangeByRank('feed:' + fid, 0, -(FEED_MAX + 1)); // chỉ giữ 500 mới nhất
    }
    await pipe.exec();
  }
}

export async function getFeed(userId: string, limit = 20) {
  const pushed = await redis.zRangeWithScores('feed:' + userId, 0, limit - 1, { REV: true });
  const celebs = await follows.celebritiesFollowedBy(userId);
  const pulled = await posts.latestByAuthors(celebs, limit); // có cache theo tác giả
  const merged = [...pushed.map((x) => ({ id: x.value, ts: x.score })), ...pulled]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);
  return posts.hydrate(merged.map((m) => m.id)); // lấy nội dung, tác giả, số like
}`
        }
      },
      {
        h: "Kiến trúc và đánh đổi",
        code: {
          lang: "text",
          file: "architecture.txt",
          src: `Post API --> Posts DB (sharded theo post_id) --outbox--> Kafka "post-created"
                                                           |
                                                  Fan-out workers --> Redis feed:{user} (sorted set)
Feed API --> Redis feed:{user} + bài của celeb (cache theo tác giả) --> merge --> hydrate
            \\--> Post cache / Posts DB, User cache, Counter service (like, comment)`
        },
        list: [
          "Phân trang bằng cursor (score/thời gian của phần tử cuối), không dùng offset, vì feed thay đổi liên tục.",
          "User lâu không đăng nhập: không fan-out cho họ; khi quay lại thì dựng feed bằng pull rồi cache.",
          "Xóa bài: không cần xóa khỏi hàng triệu feed ngay; lọc khi hydrate (bài đã xóa thì bỏ qua).",
          "Xếp hạng: tầng ranking đọc tập ứng viên từ feed rồi chấm điểm; đó là phần mở rộng."
        ],
        p: [
          "Đánh đổi chính: push tối ưu độ trễ đọc với cái giá là lượng ghi và bộ nhớ; pull tiết kiệm ghi nhưng đọc tốn. Ngưỡng chuyển đổi là tham số cần đo đạc và điều chỉnh."
        ]
      }
    ],
    summary: [
      "Feed đọc nhiều hơn ghi rất nhiều; eventual consistency vài giây là chấp nhận được.",
      "Fan-out on write cho đọc nhanh nhưng khuếch đại ghi; fan-out on read tiết kiệm ghi nhưng đọc chậm.",
      "Mô hình lai: push cho người thường, pull cho tài khoản nhiều follower, trộn lúc đọc.",
      "Feed lưu post id trong Redis sorted set có giới hạn độ dài; hydrate nội dung khi đọc.",
      "Phân trang bằng cursor; lọc bài đã xóa khi hydrate."
    ],
    pitfalls: [
      "Fan-out on write cho tài khoản hàng triệu follower: một bài làm nghẽn worker và Redis hàng phút.",
      "Lưu toàn bộ nội dung bài trong từng feed: tốn bộ nhớ nhân theo follower và khó cập nhật khi sửa bài. Chỉ lưu id.",
      "Phân trang bằng OFFSET: bài mới chèn vào đầu làm trang sau lặp hoặc sót bài."
    ],
    quiz: [
      {
        q: "Nhược điểm lớn nhất của fan-out on write là gì?",
        options: ["Đọc feed chậm", "Khuếch đại ghi theo số follower, rất tệ với tài khoản nổi tiếng", "Không dùng được Redis", "Không hỗ trợ phân trang"],
        answer: 1,
        explain: "Mỗi bài tạo số lượt ghi bằng số follower. Đọc chậm là nhược điểm của fan-out on read."
      },
      {
        q: "Trong mô hình lai, bài của tài khoản có 5 triệu follower được đưa vào feed thế nào?",
        options: ["Fan-out tới 5 triệu feed", "Không fan-out; kéo lúc người dùng đọc feed rồi trộn với feed đã tính sẵn", "Gửi email cho từng follower", "Không hiển thị"],
        answer: 1,
        explain: "Tài khoản vượt ngưỡng được xử lý bằng pull để tránh hàng triệu lượt ghi cho mỗi bài."
      },
      {
        q: "Vì sao feed nên phân trang bằng cursor thay vì OFFSET?",
        options: ["Vì OFFSET không có trong SQL", "Vì feed thay đổi liên tục; OFFSET làm lặp hoặc sót bài khi có bài mới chèn vào đầu", "Vì cursor dùng ít RAM hơn ở client", "Vì Redis không hỗ trợ số"],
        answer: 1,
        explain: "Cursor neo theo vị trí của phần tử cuối đã xem nên ổn định khi dữ liệu mới xuất hiện. OFFSET tính theo vị trí nên bị xê dịch."
      }
    ]
  },

  "p12.m4.t4": {
    sections: [
      {
        h: "Yêu cầu",
        p: [
          "Chức năng: các service khác gửi yêu cầu thông báo (ví dụ “đơn hàng đã giao” cho user 42); hệ thống chọn kênh email, SMS, push hoặc in-app theo loại thông báo và tùy chọn của người dùng; dùng template đa ngôn ngữ; hỗ trợ gửi ngay và gửi theo lịch, gửi hàng loạt cho chiến dịch; theo dõi trạng thái đã gửi, thất bại, đã mở.",
          "Phi chức năng: không mất thông báo quan trọng (OTP, giao dịch), không gửi trùng khi retry, OTP phải tới trong vài giây, chiến dịch marketing được phép chậm. Tôn trọng opt-out và giờ yên lặng, giới hạn tần suất để không spam người dùng. Chịu được nhà cung cấp bên ngoài lỗi hoặc giới hạn tốc độ."
        ]
      },
      {
        h: "Ước lượng",
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Giả định: 50M thông báo/ngày (push 70%, email 25%, SMS 5%)
Trung bình: 5 x 10^7 / 10^5 s ≈ 500/s
Chiến dịch: 10M push trong 10 phút ≈ 17.000/s -> đỉnh lớn hơn trung bình nhiều lần
SMS: 2,5M/ngày; nhà cung cấp giới hạn tốc độ và tính phí từng tin -> cần rate limit + khử trùng
Log trạng thái: 50M x 3 sự kiện x 200 B ≈ 30 GB/ngày -> kho phân tích, TTL vài tháng`
        },
        p: ["Đỉnh chiến dịch là điểm quyết định: phải có queue làm bộ đệm và tách luồng ưu tiên cao khỏi luồng marketing."]
      },
      {
        h: "Thiết kế tổng thể",
        code: {
          lang: "text",
          file: "architecture.txt",
          src: `Services --> Notification API (xác thực, idempotency key, validate)
                   |
                   v
          Preference & rules: opt-out, kênh ưa thích, giờ yên lặng, frequency cap
                   |  render template (ngôn ngữ của user)
                   v
   Kafka/RabbitMQ: topic theo kênh x mức ưu tiên
     push.high  push.low  email.high  email.low  sms.high
                   |
          Channel workers (rate limit theo provider, retry backoff + jitter, circuit breaker)
                   |               \\--> lỗi hết số lần retry --> DLQ --> cảnh báo/xem lại
                   v
        APNs / FCM / nhà cung cấp email / SMS gateway
                   |
     webhook trạng thái (delivered, bounced, opened) --> Status store --> Analytics`
        },
        p: [
          "Tách queue theo kênh và mức ưu tiên là bulkhead: chiến dịch 10 triệu push không làm OTP phải xếp hàng sau. Worker của mỗi kênh scale độc lập và có rate limit riêng khớp với giới hạn của nhà cung cấp. Có thể cấu hình dự phòng: SMS gửi qua nhà cung cấp thứ hai khi circuit breaker của nhà cung cấp chính mở."
        ]
      },
      {
        h: "Khử trùng, retry và đánh đổi",
        p: [
          "Queue giao at-least-once, retry có thể xảy ra ở nhiều chỗ, nên mỗi thông báo có id duy nhất (từ idempotency key của bên gọi). Worker đánh dấu trước khi gửi bằng `SET NX` với TTL; lỗi tạm thời thì xóa dấu để lần retry được gửi. Vì nhà cung cấp bên ngoài không nằm trong transaction của bạn, trường hợp gửi xong nhưng chết trước khi ghi trạng thái vẫn có thể tạo trùng hiếm hoi; nếu nhà cung cấp hỗ trợ idempotency key thì truyền id cho họ."
        ],
        code: {
          lang: "typescript",
          file: "src/notify/sms.worker.ts",
          src: `export async function handleSms(job: { id: string; userId: string; text: string; priority: 'high' | 'low' }) {
  const prefs = await preferences.get(job.userId);
  if (!prefs.sms.enabled) return status.mark(job.id, 'skipped_opt_out');
  if (job.priority === 'low' && isQuietHours(prefs.timezone)) return scheduler.delayUntilMorning(job);

  // Khử trùng: chỉ một worker được gửi job này
  const first = await redis.set('notif:sent:' + job.id, '1', { NX: true, EX: 7 * 86400 });
  if (!first) return; // đã gửi hoặc đang gửi

  try {
    await smsBreaker.exec(() => smsProvider.send(prefs.phone, job.text, { idempotencyKey: job.id }));
    await status.mark(job.id, 'sent');
  } catch (e) {
    await redis.del('notif:sent:' + job.id); // cho phép retry
    throw e; // để queue retry với backoff; hết lượt thì vào DLQ
  }
}`
        },
        list: [
          "Push: token thiết bị hết hạn phải được dọn khi APNs/FCM báo không hợp lệ.",
          "In-app: lưu vào bảng thông báo của user, đọc qua API hoặc đẩy qua WebSocket.",
          "Đánh đổi: gom thông báo (digest) giảm spam nhưng chậm hơn; nhiều kênh dự phòng tăng tỉ lệ tới nhưng có thể làm người dùng nhận cùng tin hai lần."
        ]
      }
    ],
    summary: [
      "Làm rõ kênh, ưu tiên, tùy chọn người dùng, giờ yên lặng và giới hạn tần suất.",
      "Queue tách theo kênh và mức ưu tiên để chiến dịch không chặn OTP (bulkhead).",
      "Worker có rate limit theo nhà cung cấp, retry với backoff + jitter, circuit breaker và DLQ.",
      "Khử trùng bằng id thông báo; truyền idempotency key cho nhà cung cấp nếu có.",
      "Theo dõi trạng thái qua webhook để biết đã giao, bị bounce hay đã mở."
    ],
    pitfalls: [
      "Dùng chung một queue cho OTP và marketing: OTP tới chậm hàng chục phút khi có chiến dịch.",
      "Retry không giới hạn khi nhà cung cấp trả lỗi vĩnh viễn (số điện thoại sai): tốn tiền và làm nghẽn queue. Phân loại lỗi và đưa vào DLQ.",
      "Bỏ qua opt-out và giờ yên lặng: vi phạm trải nghiệm và có thể vi phạm quy định pháp lý về tin nhắn quảng cáo."
    ],
    quiz: [
      {
        q: "Vì sao tách queue theo kênh và mức ưu tiên?",
        options: ["Để giảm số dòng code", "Để luồng quan trọng (OTP) không bị chặn sau luồng số lượng lớn (marketing), và mỗi kênh scale riêng", "Vì Kafka chỉ cho phép một consumer mỗi topic", "Để mã hóa nội dung"],
        answer: 1,
        explain: "Đây là bulkhead áp dụng cho messaging. Kafka cho phép nhiều consumer group trên một topic, nên đó không phải lý do."
      },
      {
        q: "Nhà cung cấp SMS trả lỗi “số điện thoại không hợp lệ”. Worker nên làm gì?",
        options: ["Retry vô hạn với backoff", "Coi là lỗi vĩnh viễn: không retry, ghi trạng thái thất bại hoặc đưa vào DLQ", "Gửi lại ngay lập tức", "Chuyển sang gửi email mà không cần xem tùy chọn người dùng"],
        answer: 1,
        explain: "Lỗi vĩnh viễn không tự hết khi gọi lại. Chuyển kênh chỉ hợp lệ nếu quy tắc và tùy chọn người dùng cho phép."
      },
      {
        q: "Vì sao cần id duy nhất cho mỗi thông báo?",
        options: ["Để sắp xếp theo bảng chữ cái", "Để khử trùng khi queue giao lại hoặc bên gọi retry, tránh gửi hai lần", "Vì APNs yêu cầu UUID", "Để tăng tốc render template"],
        answer: 1,
        explain: "Hệ thống messaging thường là at-least-once. Id cho phép worker và nhà cung cấp nhận ra yêu cầu lặp."
      }
    ]
  },

  "p12.m4.t5": {
    sections: [
      {
        h: "Yêu cầu",
        p: [
          "Chức năng: mở bán một số lượng hàng hoặc vé có hạn (ví dụ 10.000 vé) vào đúng một thời điểm; người dùng giữ chỗ, thanh toán trong thời hạn (ví dụ 10 phút), quá hạn thì chỗ được trả lại; mỗi người mua tối đa một số lượng.",
          "Phi chức năng: tuyệt đối không bán vượt số lượng (oversell). Chịu được lượng truy cập tăng đột biến gấp hàng trăm lần bình thường trong vài phút, không làm sập các phần khác của hệ thống. Công bằng ở mức hợp lý và chống bot. Chấp nhận việc phần lớn người dùng sẽ không mua được, nhưng họ phải nhận câu trả lời rõ ràng và nhanh."
        ]
      },
      {
        h: "Ước lượng",
        code: {
          lang: "text",
          file: "estimate.txt",
          src: `Giả định: 1M người chờ sẵn, 10.000 vé, mở bán lúc 10:00
Trong 60 giây đầu, mỗi người bấm/refresh ~5 lần:
   1M x 5 / 60 s ≈ 80.000 request/s vào luồng mua
Số giao dịch thành công tối đa: 10.000 -> tỉ lệ thành công ~1%
-> 99% request phải bị từ chối RẺ và SỚM, không chạm DB
Ghi DB thực sự: tối đa ~10.000 đơn giữ chỗ trong vài phút -> vài trăm ghi/s là đủ`
        },
        p: ["Con số cho thấy bài toán không phải là ghi nhiều mà là chặn đúng chỗ: lọc tải trước khi tới DB và đảm bảo tính nguyên tử khi trừ tồn kho."]
      },
      {
        h: "Thiết kế tổng thể",
        code: {
          lang: "text",
          file: "architecture.txt",
          src: `Trang sự kiện tĩnh (CDN) --> Hàng đợi ảo (waiting room): cấp token có thứ tự, cho vào theo tốc độ
        |  chỉ request có token hợp lệ mới vào
        v
Gateway: rate limit theo user/thiết bị, CAPTCHA/chống bot
        v
Reserve service --> Redis Lua: kiểm tra hạn mức user + trừ tồn kho nguyên tử
        |  thành công: tạo reservation (TTL 10 phút) --> queue --> Order worker --> PostgreSQL
        |  hết hàng: trả "đã bán hết" ngay
        v
Payment --> xác nhận đơn (UPDATE có điều kiện trong DB)
Sweeper / delayed message: reservation hết hạn --> trả vé về kho (Redis + DB)`
        },
        p: [
          "Hàng đợi ảo biến cơn lũ thành dòng chảy có kiểm soát: người dùng vào phòng chờ, được cấp vị trí, hệ thống cho vào theo tốc độ mà backend chịu được. Redis giữ bộ đếm tồn kho nóng và thực hiện trừ nguyên tử bằng Lua; DB là nguồn sự thật cuối cùng với ràng buộc chặn oversell ở tầng dữ liệu."
        ]
      },
      {
        h: "Chống oversell và giữ chỗ có thời hạn",
        p: [
          "Lớp 1 (Redis): script kiểm tra user đã giữ chưa, kiểm tra còn hàng, rồi trừ, tất cả trong một thao tác nguyên tử. Lớp 2 (DB): câu `UPDATE ... WHERE available >= 1` hoặc ràng buộc `CHECK (available >= 0)` đảm bảo dù Redis lỗi cũng không bán vượt. Nếu vé có chỗ ngồi cụ thể, mỗi ghế là một dòng với ràng buộc unique, giữ ghế bằng `UPDATE seats SET status = 'held' ... WHERE status = 'available'`."
        ],
        code: {
          lang: "typescript",
          file: "src/flash-sale/reserve.ts",
          src: `const RESERVE_LUA = \`
-- KEYS[1] = stock:{sale}   KEYS[2] = buyers:{sale}   ARGV[1] = userId
if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then return -2 end  -- đã mua/giữ
local left = tonumber(redis.call('GET', KEYS[1]) or '0')
if left <= 0 then return -1 end                                    -- hết hàng
redis.call('DECR', KEYS[1])
redis.call('SADD', KEYS[2], ARGV[1])
return left - 1
\`;
// {sale} là hash tag: hai key nằm cùng slot trên Redis Cluster

export async function reserve(saleId: string, userId: string) {
  const tag = '{' + saleId + '}';
  const r = Number(await redis.eval(RESERVE_LUA, { keys: ['stock:' + tag, 'buyers:' + tag], arguments: [userId] }));
  if (r === -1) return { ok: false, reason: 'SOLD_OUT' };
  if (r === -2) return { ok: false, reason: 'ALREADY_RESERVED' };

  const reservationId = randomUUID();
  // Ghi reservation qua queue; DB vẫn kiểm tra điều kiện lần cuối
  await queue.publish('reservations', { reservationId, saleId, userId, expiresAt: Date.now() + 10 * 60_000 });
  return { ok: true, reservationId };
}

// Order worker (DB là chốt chặn cuối):
// UPDATE sale_inventory SET available = available - 1
//   WHERE sale_id = $1 AND available >= 1 RETURNING available;
// 0 dòng => hết hàng thật sự => hoàn lại Redis và báo người dùng`
        },
        list: [
          "Giữ chỗ hết hạn: dùng delayed message hoặc job quét `expires_at`; trả vé bằng thao tác có điều kiện `WHERE status = 'held' AND expires_at < now()` để không trả nhầm vé đã thanh toán.",
          "Redis và DB có thể lệch khi lỗi giữa chừng; cần job đối soát định kỳ, và DB luôn thắng.",
          "Đánh đổi: trừ trực tiếp trong DB đơn giản và đúng nhưng hàng chờ khóa trên một dòng nóng giới hạn throughput; Redis nhanh nhưng thêm bước đối soát. Chia tồn kho thành nhiều bucket giảm tranh chấp nhưng phức tạp khi gần hết hàng."
        ]
      }
    ],
    summary: [
      "Phần lớn request phải bị từ chối sớm và rẻ; bài toán là lọc tải và trừ kho nguyên tử.",
      "Hàng đợi ảo, CDN cho trang tĩnh, rate limit và chống bot giảm tải trước khi vào backend.",
      "Redis + Lua trừ kho nguyên tử; DB với UPDATE có điều kiện là chốt chặn cuối chống oversell.",
      "Giữ chỗ có TTL; trả chỗ bằng thao tác có điều kiện và đối soát Redis với DB.",
      "Cô lập hạ tầng flash sale để không kéo sập phần còn lại của hệ thống."
    ],
    pitfalls: [
      "Đọc số tồn rồi mới trừ ở hai bước riêng (`SELECT` rồi `UPDATE`): hai request cùng thấy còn 1 và cùng bán.",
      "Chỉ tin vào Redis mà không có ràng buộc trong DB: Redis failover mất vài thao tác cuối là oversell.",
      "Để mọi request đổ thẳng vào DB lúc mở bán: DB quá tải kéo theo cả trang chủ và các luồng khác."
    ],
    quiz: [
      {
        q: "Câu SQL nào chống oversell đúng khi nhiều request đồng thời?",
        options: ["SELECT available rồi nếu > 0 thì UPDATE available = available - 1", "UPDATE inventory SET available = available - 1 WHERE sku = $1 AND available >= 1", "UPDATE inventory SET available = $1 với giá trị tính ở ứng dụng", "INSERT đơn hàng trước, kiểm tra tồn kho sau"],
        answer: 1,
        explain: "UPDATE có điều kiện là một thao tác nguyên tử: kiểm tra và trừ cùng lúc, trả 0 dòng nếu hết. Đọc rồi ghi hoặc ghi giá trị tính ở ứng dụng đều có race."
      },
      {
        q: "Mục đích chính của hàng đợi ảo (waiting room) là gì?",
        options: ["Tăng số vé", "Biến lượng truy cập đột biến thành dòng vào có kiểm soát theo sức chịu của backend", "Thay thế thanh toán", "Lưu vé vào CDN"],
        answer: 1,
        explain: "Waiting room điều tiết tốc độ người dùng vào luồng mua, bảo vệ backend và tạo trải nghiệm công bằng hơn."
      },
      {
        q: "Reservation hết hạn 10 phút. Trả vé về kho bằng cách nào là an toàn?",
        options: ["Cộng lại tồn kho cho mọi reservation sau 10 phút mà không kiểm tra", "Cập nhật có điều kiện: chỉ trả khi reservation vẫn ở trạng thái held và đã quá hạn", "Xóa toàn bộ bảng reservation mỗi giờ", "Chờ người dùng tự hủy"],
        answer: 1,
        explain: "Người dùng có thể vừa thanh toán ngay trước khi hết hạn. Điều kiện trạng thái ngăn việc trả lại vé đã bán, tránh oversell."
      }
    ]
  },
});
