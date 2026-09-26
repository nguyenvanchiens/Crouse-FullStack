/* Nội dung bài học chương p11 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p11.m0.t0": {
    sections: [
      {
        h: "Vì sao log phải có cấu trúc",
        p: [
          "Log dạng chữ tự do như `User 42 failed to pay order 991` dễ đọc với người, nhưng khó tìm kiếm và thống kê khi có hàng triệu dòng. Structured logging ghi mỗi dòng log là một object JSON với các trường cố định: `level`, `time`, `msg`, `service`, cùng dữ liệu ngữ cảnh như `userId`, `orderId`. Hệ thống log tập trung (Loki, Elasticsearch, CloudWatch) có thể lọc theo trường, ví dụ mọi lỗi của `payment-service` có `orderId=991`.",
          "Ở Node.js, pino là thư viện phổ biến: ghi JSON rất nhanh vì hạn chế xử lý trên luồng chính. Trong môi trường dev, dùng `pino-pretty` để hiển thị đẹp; production giữ JSON và ghi ra stdout để hạ tầng (Docker, Kubernetes) thu gom."
        ],
        code: {
          lang: "typescript", file: "src/logger.ts",
          src: `import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "order-api", env: process.env.NODE_ENV },
  redact: ["req.headers.authorization", "password", "*.cardNumber"],
});

logger.info({ orderId: 991, amount: 250000 }, "order created");
// {"level":30,"time":1758850000000,"service":"order-api","env":"production",
//  "orderId":991,"amount":250000,"msg":"order created"}`
        }
      },
      {
        h: "trace_id và request_id trong mọi dòng log",
        p: [
          "Một request đi qua nhiều hàm và nhiều service. Nếu mọi dòng log của request đó mang cùng một `request_id` (và `trace_id` nếu có tracing), bạn chỉ cần lọc theo một giá trị là thấy toàn bộ câu chuyện. Có `trace_id` còn giúp nhảy từ log sang trace trong Grafana và ngược lại.",
          "Trong Node.js, `AsyncLocalStorage` giữ ngữ cảnh xuyên suốt chuỗi async của một request, nên bạn không phải truyền logger qua mọi tham số hàm. Nếu dùng OpenTelemetry, các gói instrumentation cho pino có thể tự chèn `trace_id` và `span_id` vào log."
        ],
        code: {
          lang: "typescript", file: "src/request-context.ts",
          src: `import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

const als = new AsyncLocalStorage<{ log: typeof logger }>();

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);
  als.run({ log: logger.child({ requestId }) }, next);
}

export const log = () => als.getStore()?.log ?? logger;
// Ở bất kỳ đâu: log().error({ err }, "payment failed");`
        }
      },
      {
        h: "Log level và sampling",
        list: [
          "`error`: có lỗi cần người xem, ví dụ không ghi được đơn hàng.",
          "`warn`: bất thường nhưng hệ thống vẫn chạy, ví dụ retry lần 2.",
          "`info`: sự kiện nghiệp vụ quan trọng, ví dụ đơn hàng được tạo.",
          "`debug`: chi tiết để gỡ lỗi, thường tắt ở production."
        ],
        p: [
          "Log tốn tiền: mỗi GB được lưu và đánh chỉ mục đều có chi phí. Sampling nghĩa là chỉ giữ một phần log có giá trị thấp, ví dụ 10% log `info` của endpoint health check, nhưng giữ 100% log `error`. Không bao giờ log mật khẩu, token, số thẻ; dùng tính năng redact để che."
        ]
      }
    ],
    summary: [
      "Log JSON có trường cố định để lọc và thống kê được.",
      "Mọi dòng log mang request_id/trace_id để lần theo một request.",
      "AsyncLocalStorage giữ ngữ cảnh request mà không truyền tham số khắp nơi.",
      "Chọn level đúng, sampling log giá trị thấp, redact dữ liệu nhạy cảm."
    ],
    pitfalls: [
      "Nối chuỗi vào message (`\"user \" + id + \" failed\"`) thay vì đưa vào trường riêng, không lọc được. Đặt dữ liệu vào object.",
      "Log toàn bộ request body, lộ mật khẩu hoặc dữ liệu cá nhân. Cấu hình redact và chỉ log trường cần thiết.",
      "Để level `debug` ở production, chi phí lưu trữ tăng vọt và log quan trọng bị chìm."
    ],
    quiz: [
      { q: "Lợi ích chính của log JSON so với log chữ tự do là gì?", options: ["Dễ đọc hơn với mắt người", "Có thể lọc và tổng hợp theo từng trường trong hệ thống log", "Dung lượng luôn nhỏ hơn", "Không cần hệ thống log tập trung"], answer: 1, explain: "Trường có cấu trúc cho phép truy vấn chính xác như service=x và level=error. JSON thường không nhỏ hơn, cũng không dễ đọc hơn với người." },
      { q: "Vì sao nên gắn request_id vào mọi dòng log?", options: ["Để log đẹp hơn", "Để gom được mọi log của một request khi điều tra", "Để thay thế metrics", "Để mã hóa log"], answer: 1, explain: "Một request sinh nhiều dòng log xen kẽ với request khác. Lọc theo request_id cho bạn đúng chuỗi sự kiện của request đó." },
      { q: "Chiến lược sampling hợp lý là gì?", options: ["Giữ 10% mọi loại log", "Giữ toàn bộ log error, lấy mẫu log info có giá trị thấp", "Bỏ toàn bộ log error", "Chỉ log debug"], answer: 1, explain: "Log lỗi hiếm và quan trọng nên giữ hết. Log lặp lại nhiều, giá trị thấp như health check có thể lấy mẫu để giảm chi phí." }
    ]
  },
  "p11.m0.t1": {
    sections: [
      {
        h: "Metrics là gì và khác log thế nào",
        p: [
          "Metric là con số đo theo thời gian, ví dụ số request mỗi giây hay độ trễ p95. Mỗi điểm dữ liệu chỉ gồm tên, nhãn (labels), giá trị và thời gian, nên rất rẻ để lưu và truy vấn trên khoảng thời gian dài. Log kể chi tiết từng sự kiện; metric cho bức tranh tổng thể và là nền tảng cho dashboard và cảnh báo."
        ]
      },
      {
        h: "Counter, gauge, histogram",
        list: [
          "Counter: chỉ tăng (hoặc về 0 khi process khởi động lại). Dùng cho tổng số request, tổng số lỗi. Bạn hầu như không nhìn giá trị thô mà nhìn tốc độ tăng bằng `rate()`.",
          "Gauge: tăng giảm tự do, là giá trị tại một thời điểm. Dùng cho số kết nối đang mở, bộ nhớ đang dùng, độ dài hàng đợi.",
          "Histogram: đếm số quan sát rơi vào từng khoảng (bucket), kèm tổng và số lượng. Dùng cho độ trễ, kích thước payload, từ đó tính percentile như p95, p99."
        ],
        p: [
          "Vì sao cần percentile thay vì trung bình? Nếu 95 request mất 50ms và 5 request mất 5 giây, trung bình khoảng 300ms trông ổn, nhưng cứ 20 người thì một người phải chờ 5 giây. p99 phơi bày những người dùng chịu thiệt đó. Summary là loại thứ tư, tính percentile ngay trong ứng dụng, nhưng không cộng gộp được giữa nhiều instance, nên histogram thường được ưu tiên."
        ],
        code: {
          lang: "typescript", file: "src/metrics.ts",
          src: `import client from "prom-client";

export const ordersCreated = new client.Counter({
  name: "orders_created_total",
  help: "Tổng số đơn hàng được tạo",
  labelNames: ["channel"],
});

export const queueDepth = new client.Gauge({
  name: "email_queue_depth",
  help: "Số email đang chờ gửi",
});

export const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Độ trễ HTTP",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

ordersCreated.inc({ channel: "web" });
queueDepth.set(42);`
        }
      },
      {
        h: "Phương pháp RED và USE",
        p: [
          "RED dành cho service phục vụ request: Rate (số request mỗi giây), Errors (số hoặc tỉ lệ request lỗi), Duration (phân bố độ trễ, thường là p50, p95, p99). Ba chỉ số này trả lời câu hỏi người dùng có đang ổn không. Một histogram độ trễ có nhãn `status` là đủ để tính cả ba.",
          "USE dành cho tài nguyên như CPU, bộ nhớ, ổ đĩa, connection pool: Utilization (phần trăm thời gian bận hoặc dung lượng đã dùng), Saturation (mức quá tải, việc phải chờ, ví dụ độ dài hàng đợi), Errors (lỗi của tài nguyên). RED cho bạn biết có vấn đề, USE giúp tìm nguyên nhân nằm ở tài nguyên nào."
        ]
      }
    ],
    summary: [
      "Metric là con số theo thời gian, rẻ để lưu lâu và dùng cho cảnh báo.",
      "Counter chỉ tăng, gauge lên xuống, histogram đo phân bố để tính percentile.",
      "Dùng percentile (p95, p99) thay vì trung bình cho độ trễ.",
      "RED cho service, USE cho tài nguyên."
    ],
    pitfalls: [
      "Dùng gauge cho số request rồi tự cộng dồn, mất dữ liệu khi restart. Dùng counter và `rate()`.",
      "Chỉ theo dõi độ trễ trung bình, bỏ sót đuôi chậm. Theo dõi p95/p99.",
      "Chọn bucket histogram không phủ vùng SLO (ví dụ SLO 300ms nhưng không có bucket 0.3), percentile tính ra rất thô."
    ],
    quiz: [
      { q: "Số kết nối database đang mở nên dùng loại metric nào?", options: ["Counter", "Gauge", "Histogram", "Summary"], answer: 1, explain: "Số kết nối tăng giảm theo thời gian và là giá trị tại một thời điểm, đúng định nghĩa gauge." },
      { q: "Chữ E trong RED nghĩa là gì?", options: ["Efficiency", "Errors", "Events", "Energy"], answer: 1, explain: "RED gồm Rate, Errors, Duration: tốc độ request, lỗi và độ trễ." },
      { q: "Vì sao histogram thường được ưu tiên hơn summary khi chạy nhiều instance?", options: ["Histogram chính xác tuyệt đối", "Bucket của histogram cộng gộp được giữa các instance rồi mới tính percentile", "Summary không có trong prom-client", "Histogram không tốn bộ nhớ"], answer: 1, explain: "Percentile đã tính sẵn của summary không cộng được với nhau. Histogram cộng số đếm từng bucket rồi dùng histogram_quantile trên tổng." }
    ]
  },
  "p11.m0.t2": {
    sections: [
      {
        h: "Mô hình pull và exporter",
        p: [
          "Prometheus chủ động gọi HTTP tới endpoint `/metrics` của từng target theo chu kỳ (scrape interval, thường 15–30 giây) và lưu dữ liệu vào time series database của nó. Đây là mô hình pull: ứng dụng chỉ cần phơi metric ra, không cần biết Prometheus ở đâu. Prometheus cũng tự tạo metric `up` cho mỗi target, bằng 0 khi scrape thất bại, nên bạn biết ngay service nào chết.",
          "Với phần mềm bạn không sửa được code (PostgreSQL, Redis, máy chủ Linux), dùng exporter: một process nhỏ đọc thông tin từ hệ thống rồi phơi ra định dạng Prometheus. Ví dụ `node_exporter` cho CPU, RAM, ổ đĩa; `postgres_exporter` cho PostgreSQL. Với job ngắn hạn kết thúc trước khi kịp bị scrape, có Pushgateway, nhưng chỉ nên dùng cho trường hợp đó."
        ],
        code: {
          lang: "yaml", file: "prometheus/prometheus.yml",
          src: `global:
  scrape_interval: 15s
rule_files: [rules.yml]
scrape_configs:
  - job_name: task-api
    static_configs:
      - targets: ["api:3000"]
  - job_name: node
    static_configs:
      - targets: ["node-exporter:9100"]
  - job_name: postgres
    static_configs:
      - targets: ["postgres-exporter:9187"]`
        }
      },
      {
        h: "PromQL cơ bản",
        p: [
          "Selector chọn chuỗi dữ liệu theo tên và nhãn: `http_request_duration_seconds_count{status=~\"5..\"}`. Thêm `[5m]` thành range vector. `rate()` tính tốc độ tăng trung bình mỗi giây của counter trong khoảng đó và tự xử lý khi counter bị reset. `sum by (route)` gộp theo nhãn. `histogram_quantile()` tính percentile từ các bucket; luôn giữ nhãn `le` khi gộp."
        ],
        code: {
          lang: "promql", file: "queries.promql",
          src: `# Request mỗi giây theo route
sum by (route) (rate(http_request_duration_seconds_count[5m]))

# Tỉ lệ lỗi 5xx
sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_request_duration_seconds_count[5m]))

# p95 độ trễ theo route
histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))

# Target nào đang không scrape được
up == 0`
        }
      },
      {
        h: "Recording rules và cardinality",
        p: [
          "Truy vấn phức tạp chạy lại mỗi lần dashboard refresh sẽ tốn tài nguyên. Recording rule tính sẵn biểu thức theo chu kỳ và lưu thành metric mới. Quy ước đặt tên thường là `level:metric:operations`.",
          "Cardinality là số chuỗi thời gian khác nhau, bằng tích số giá trị của các nhãn. Mỗi tổ hợp nhãn là một chuỗi riêng tốn bộ nhớ. Dùng `userId`, `email` hay URL thật chứa id (`/orders/123`) làm nhãn sẽ tạo ra hàng triệu chuỗi và có thể làm sập Prometheus. Nhãn chỉ nên có tập giá trị nhỏ và hữu hạn: method, route dạng template (`/orders/:id`), status. Thông tin theo từng người dùng thuộc về log và trace."
        ],
        code: {
          lang: "yaml", file: "prometheus/rules.yml",
          src: `groups:
  - name: task-api-recording
    rules:
      - record: route:http_requests:rate5m
        expr: sum by (route) (rate(http_request_duration_seconds_count[5m]))
      - record: route:http_request_duration_seconds:p95_5m
        expr: histogram_quantile(0.95, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))`
        }
      }
    ],
    summary: [
      "Prometheus pull metric từ `/metrics`; metric `up` báo target sống hay chết.",
      "Exporter phơi metric cho phần mềm không sửa được code.",
      "Dùng `rate()` cho counter, `histogram_quantile()` với nhãn `le` cho percentile.",
      "Recording rule tính sẵn truy vấn nặng.",
      "Giữ cardinality thấp: không dùng userId hay URL thật làm nhãn."
    ],
    pitfalls: [
      "Dùng `req.url` làm nhãn route, mỗi id là một chuỗi mới, bùng nổ cardinality. Dùng route template.",
      "Áp `rate()` lên gauge hoặc `sum` trước rồi mới `rate`, kết quả sai. Luôn `rate` từng counter trước rồi mới `sum`.",
      "Bỏ nhãn `le` khi gộp trước `histogram_quantile`, hàm không tính được. Giữ `by (le, ...)`."
    ],
    quiz: [
      { q: "Trong mô hình pull, ai chủ động khởi tạo kết nối để lấy metric?", options: ["Ứng dụng đẩy lên Prometheus", "Prometheus gọi tới endpoint /metrics của target", "Grafana", "Alertmanager"], answer: 1, explain: "Prometheus scrape theo chu kỳ. Ứng dụng chỉ phơi endpoint. Pushgateway là ngoại lệ cho job ngắn hạn." },
      { q: "Nhãn nào an toàn về cardinality?", options: ["user_id", "request_id", "route dạng template như /orders/:id", "URL đầy đủ có query string"], answer: 2, explain: "Route template có số giá trị nhỏ và hữu hạn. Các lựa chọn còn lại có số giá trị gần như vô hạn, mỗi giá trị là một chuỗi mới." },
      { q: "Vì sao dùng `rate()` với counter thay vì nhìn giá trị thô?", options: ["Giá trị thô luôn bằng 0", "Counter chỉ tăng dần, tốc độ tăng mới phản ánh tải hiện tại, và rate xử lý được việc reset", "rate làm tròn số", "Prometheus không lưu giá trị thô"], answer: 1, explain: "Giá trị thô của counter là tổng từ lúc process khởi động, không có ý nghĩa trực tiếp. rate cho số sự kiện mỗi giây và bù trừ khi counter về 0 do restart." }
    ]
  },
  "p11.m0.t3": {
    sections: [
      {
        h: "Dashboard theo RED",
        p: [
          "Grafana là công cụ trực quan hóa, kết nối tới nhiều data source như Prometheus, Loki, Tempo, PostgreSQL. Một dashboard tốt trả lời nhanh câu hỏi \"service có đang ổn không?\" trong vài giây. Hãy đặt ba panel RED lên hàng đầu: Rate (request/giây), Errors (tỉ lệ lỗi %), Duration (p50, p95, p99). Các panel USE (CPU, bộ nhớ, connection pool) và chi tiết theo route đặt bên dưới để đào sâu khi cần.",
          "Mỗi panel nên có đơn vị đúng (giây, %, req/s), ngưỡng màu gắn với SLO (ví dụ vạch đỏ ở 300ms), và tiêu đề rõ nghĩa. Tránh dashboard 40 panel mà không ai biết nhìn vào đâu."
        ],
        code: {
          lang: "promql", file: "panels.promql",
          src: `# Rate
sum(rate(http_request_duration_seconds_count{job="$job"}[$__rate_interval]))

# Errors (%)
100 * sum(rate(http_request_duration_seconds_count{job="$job", status=~"5.."}[$__rate_interval]))
    / sum(rate(http_request_duration_seconds_count{job="$job"}[$__rate_interval]))

# Duration p95 theo route
histogram_quantile(0.95,
  sum by (le, route) (rate(http_request_duration_seconds_bucket{job="$job", route=~"$route"}[$__rate_interval])))`
        }
      },
      {
        h: "Biến template",
        p: [
          "Biến template biến một dashboard thành công cụ dùng cho nhiều service hay môi trường. Biến kiểu Query lấy danh sách giá trị từ data source, ví dụ `label_values(http_request_duration_seconds_count, job)` trả về mọi job. Người xem chọn trong dropdown ở đầu dashboard, và mọi truy vấn dùng `$job` sẽ đổi theo. Biến cho phép chọn nhiều giá trị thì dùng toán tử `=~` trong selector.",
          "Grafana còn có biến dựng sẵn như `$__rate_interval`, tự chọn khoảng thời gian phù hợp cho `rate()` dựa trên scrape interval và độ phân giải của biểu đồ, tránh đồ thị trống khi zoom."
        ]
      },
      {
        h: "Dashboard as code",
        p: [
          "Dashboard tạo bằng tay trên giao diện dễ bị sửa lung tung và mất khi cài lại Grafana. Dashboard as code nghĩa là lưu định nghĩa dashboard (JSON) trong Git, review qua pull request và triển khai tự động. Cách đơn giản nhất là provisioning: Grafana đọc file cấu hình khi khởi động và nạp mọi dashboard JSON trong một thư mục. Ngoài ra có thể dùng Terraform provider cho Grafana, hoặc sinh JSON bằng thư viện như Grafonnet hay Grafana Foundation SDK.",
          "Data source cũng provisioning được, nên toàn bộ môi trường observability có thể dựng lại từ Git."
        ],
        code: {
          lang: "yaml", file: "grafana/provisioning/dashboards/default.yml",
          src: `apiVersion: 1
providers:
  - name: default
    folder: Services
    type: file
    allowUiUpdates: false
    options:
      path: /var/lib/grafana/dashboards   # chứa các file *.json từ Git`
        }
      }
    ],
    summary: [
      "Đặt ba panel RED ở đầu dashboard, chi tiết và USE bên dưới.",
      "Panel cần đơn vị đúng và ngưỡng gắn với SLO.",
      "Biến template (`$job`, `$route`) giúp một dashboard dùng cho nhiều service.",
      "`$__rate_interval` chọn khoảng rate phù hợp tự động.",
      "Lưu dashboard trong Git và nạp bằng provisioning hoặc Terraform."
    ],
    pitfalls: [
      "Dashboard quá nhiều panel không có thứ tự ưu tiên, khi có sự cố không ai tìm ra chỗ cần nhìn.",
      "Dùng khoảng rate cố định quá nhỏ (ví dụ `[15s]` với scrape 15s), đồ thị bị trống. Khoảng rate nên ít nhất gấp bốn lần scrape interval, hoặc dùng `$__rate_interval`.",
      "Sửa dashboard provisioning trực tiếp trên giao diện rồi mất khi Grafana khởi động lại. Sửa trong Git."
    ],
    quiz: [
      { q: "Dashboard cho một API nên ưu tiên hiển thị gì ở đầu?", options: ["Danh sách container", "Ba chỉ số RED: rate, tỉ lệ lỗi, độ trễ percentile", "Số dòng code", "Nhiệt độ CPU"], answer: 1, explain: "RED phản ánh trực tiếp trải nghiệm người dùng của service. Tài nguyên như CPU dùng để tìm nguyên nhân sau đó." },
      { q: "Biến template kiểu Query trong Grafana dùng để làm gì?", options: ["Lưu mật khẩu data source", "Lấy danh sách giá trị từ data source cho dropdown, các panel dùng lại qua $ten_bien", "Tạo alert", "Đổi theme"], answer: 1, explain: "Biến Query lấy giá trị như danh sách job hoặc route, giúp người xem lọc dashboard mà không phải sửa truy vấn." },
      { q: "Lợi ích của dashboard as code là gì?", options: ["Dashboard tải nhanh hơn", "Có lịch sử thay đổi, review được và dựng lại được từ Git", "Không cần data source", "Tự động tạo alert"], answer: 1, explain: "Lưu JSON trong Git cho phép review, rollback và tái tạo môi trường. Nó không đổi tốc độ hiển thị." }
    ]
  },
  "p11.m0.t4": {
    sections: [
      {
        h: "Trace và span",
        p: [
          "Trong hệ thống nhiều service, một request của người dùng có thể đi qua API gateway, order-service, payment-service, database và hàng đợi. Metric cho biết p95 tăng, log cho biết từng sự kiện, nhưng khó thấy thời gian bị tiêu ở đâu trong chuỗi gọi. Distributed tracing giải quyết điều đó.",
          "Một trace đại diện cho toàn bộ hành trình của một request, gồm nhiều span. Mỗi span là một đơn vị công việc có tên, thời điểm bắt đầu, thời lượng, trạng thái và thuộc tính (attributes) như `http.route`, `db.system`. Span có quan hệ cha con: span gọi HTTP sang payment-service là cha của span xử lý request bên payment-service. Hiển thị lên, bạn có biểu đồ thác nước (waterfall) cho thấy rõ bước nào chậm."
        ]
      },
      {
        h: "Context propagation và W3C traceparent",
        p: [
          "Để các service nối span của nhau thành một trace, ngữ cảnh trace phải đi theo request. Chuẩn W3C Trace Context định nghĩa header `traceparent` gồm 4 phần: version, trace-id (32 ký tự hex), parent span-id (16 ký tự hex) và flags (ví dụ `01` là được lấy mẫu). Service nhận request đọc header này, tạo span con với cùng trace-id, và khi gọi tiếp service khác thì gửi `traceparent` mới chứa span-id của mình.",
          "Với hàng đợi như Kafka hay RabbitMQ, ngữ cảnh được đặt vào header của message. Chỉ cần một service ở giữa không chuyển tiếp header là trace bị đứt làm hai."
        ],
        code: {
          lang: "text", file: "HTTP header",
          src: `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             │  │                                │                │
             │  trace-id (chung cho cả trace)    parent span-id   flags (01 = sampled)
             version`
        }
      },
      {
        h: "Tìm service chậm trong chuỗi gọi",
        list: [
          "Bắt đầu từ metric: p95 của endpoint `/checkout` tăng từ 200ms lên 1.5s.",
          "Mở công cụ trace (Jaeger, Tempo), lọc trace của `/checkout` có thời lượng lớn hơn 1s.",
          "Nhìn waterfall: tìm span dài nhất, hoặc các span con chạy tuần tự lẽ ra có thể song song.",
          "Xem attributes của span chậm, ví dụ câu SQL, host đích, số lần retry; nhảy sang log cùng trace_id nếu cần.",
          "Dấu hiệu thường gặp: N+1 query (hàng chục span DB giống nhau), gọi service bên ngoài chờ timeout, retry lặp lại."
        ],
        p: [
          "Tracing thường dùng sampling vì lưu mọi trace rất tốn. Head sampling quyết định ngay từ đầu request (ví dụ giữ 10%). Tail sampling quyết định sau khi trace hoàn tất, cho phép giữ mọi trace lỗi hoặc chậm, nhưng cần thành phần trung gian như OpenTelemetry Collector gom đủ span."
        ]
      }
    ],
    summary: [
      "Trace là hành trình của một request, gồm các span có quan hệ cha con.",
      "Header W3C `traceparent` mang trace-id và span-id qua các service.",
      "Một mắt xích không chuyển tiếp ngữ cảnh là trace bị đứt.",
      "Dùng waterfall để tìm span chậm, N+1 query, gọi tuần tự.",
      "Head sampling đơn giản; tail sampling giữ được trace lỗi và chậm."
    ],
    pitfalls: [
      "Gọi HTTP bằng client không được instrument hoặc tự tạo request mà không chèn header, trace bị đứt. Dùng auto-instrumentation hoặc propagator của SDK.",
      "Ghi dữ liệu nhạy cảm (token, nội dung body) vào attributes của span. Chỉ ghi dữ liệu cần để debug.",
      "Head sampling tỉ lệ thấp khiến các trace lỗi hiếm bị bỏ mất. Cân nhắc tail sampling để giữ trace lỗi."
    ],
    quiz: [
      { q: "Header W3C nào mang ngữ cảnh trace giữa các service?", options: ["x-request-id", "traceparent", "authorization", "x-forwarded-for"], answer: 1, explain: "traceparent là header chuẩn của W3C Trace Context chứa trace-id, parent span-id và flags. x-request-id là quy ước riêng, không phải chuẩn tracing." },
      { q: "Waterfall của một trace có 40 span `SELECT` gần giống nhau chạy tuần tự. Đây thường là dấu hiệu của gì?", options: ["Cache hoạt động tốt", "N+1 query", "Mạng nhanh", "Sampling sai"], answer: 1, explain: "Truy vấn lặp lại cho từng phần tử là mẫu N+1. Nên gộp thành một truy vấn hoặc dùng join/batch." },
      { q: "Ưu điểm của tail sampling so với head sampling là gì?", options: ["Không tốn tài nguyên", "Quyết định sau khi trace hoàn tất nên giữ được mọi trace lỗi hoặc chậm", "Không cần Collector", "Giữ 100% trace"], answer: 1, explain: "Head sampling quyết định trước khi biết kết quả. Tail sampling nhìn toàn bộ trace nên chọn giữ được trace đáng quan tâm, đổi lại cần gom span ở Collector." }
    ]
  },
  "p11.m0.t5": {
    sections: [
      {
        h: "OpenTelemetry là gì",
        p: [
          "OpenTelemetry (OTel) là chuẩn mở của CNCF để tạo và gửi telemetry: trace, metric và log. Trước OTel, mỗi nhà cung cấp (Datadog, New Relic, Jaeger) có SDK riêng, đổi nhà cung cấp nghĩa là sửa code instrument khắp nơi. Với OTel, bạn instrument một lần theo chuẩn, rồi chọn nơi gửi dữ liệu bằng cấu hình.",
          "OTel gồm các phần: API và SDK cho từng ngôn ngữ; các gói instrumentation tự động cho thư viện phổ biến (HTTP, Express, NestJS, pg, Redis); giao thức OTLP để truyền dữ liệu; và Collector, một process độc lập nhận, xử lý và chuyển tiếp telemetry."
        ]
      },
      {
        h: "SDK và auto-instrumentation cho Node.js",
        p: [
          "Với Node.js, gói `@opentelemetry/sdk-node` kết hợp `@opentelemetry/auto-instrumentations-node` sẽ tự tạo span cho request HTTP đến và đi, truy vấn PostgreSQL, gọi Redis mà bạn không phải sửa code nghiệp vụ. File khởi tạo phải chạy trước khi ứng dụng import các thư viện đó, vì instrumentation hoạt động bằng cách vá (patch) module lúc được nạp. Thường dùng cờ `--import` (ESM) hoặc `--require` (CommonJS) khi khởi động Node."
        ],
        code: {
          lang: "typescript", file: "src/instrumentation.ts",
          src: `import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

const sdk = new NodeSDK({
  serviceName: "order-api",
  traceExporter: new OTLPTraceExporter(),   // mặc định gửi tới http://localhost:4318
  metricReader: new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on("SIGTERM", () => sdk.shutdown().finally(() => process.exit(0)));

// Khởi động: node --import ./dist/instrumentation.js dist/main.js
// Cấu hình qua biến môi trường: OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318`
        }
      },
      {
        h: "Collector và xuất tới backend",
        p: [
          "Ứng dụng gửi OTLP tới Collector thay vì gửi thẳng tới nhà cung cấp. Collector có pipeline gồm receivers (nhận dữ liệu), processors (gom lô, lọc thuộc tính nhạy cảm, lấy mẫu) và exporters (gửi tới Jaeger, Grafana Tempo, Prometheus, Datadog...). Đổi backend chỉ cần sửa cấu hình Collector, ứng dụng không phải deploy lại. Collector cũng giảm tải cho ứng dụng vì việc retry và gom lô diễn ra bên ngoài.",
          "Bạn vẫn có thể tạo span thủ công cho logic nghiệp vụ quan trọng bằng `trace.getTracer(\"order\").startActiveSpan(...)` để thấy chi tiết hơn phần auto-instrumentation."
        ],
        code: {
          lang: "yaml", file: "otel-collector.yaml",
          src: `receivers:
  otlp:
    protocols:
      grpc: { endpoint: 0.0.0.0:4317 }
      http: { endpoint: 0.0.0.0:4318 }

processors:
  batch: {}

exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls: { insecure: true }
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:  { receivers: [otlp], processors: [batch], exporters: [otlp/tempo] }
    metrics: { receivers: [otlp], processors: [batch], exporters: [prometheus] }`
        }
      }
    ],
    summary: [
      "OpenTelemetry là chuẩn mở cho trace, metric, log, không khóa vào nhà cung cấp.",
      "Auto-instrumentation tạo span cho HTTP, DB mà không sửa code nghiệp vụ.",
      "File khởi tạo SDK phải chạy trước khi nạp các thư viện cần instrument.",
      "Collector nhận OTLP, xử lý, rồi xuất tới Jaeger, Tempo, Prometheus, Datadog."
    ],
    pitfalls: [
      "Import SDK sau khi đã import express hoặc pg, instrumentation không vá kịp nên không có span. Dùng `--import`/`--require` để nạp trước.",
      "Không gọi `sdk.shutdown()` khi tắt process, mất các span còn trong bộ đệm.",
      "Bật mọi instrumentation mặc định khiến dữ liệu nhiều và nhiễu (ví dụ span của thao tác file system). Tắt các instrumentation không cần qua cấu hình."
    ],
    quiz: [
      { q: "Lợi ích chính của OpenTelemetry so với SDK riêng của từng nhà cung cấp là gì?", options: ["Miễn phí lưu trữ", "Instrument một lần theo chuẩn mở, đổi backend bằng cấu hình", "Không cần sampling", "Tự sửa lỗi code"], answer: 1, explain: "OTel tách việc tạo telemetry khỏi nơi lưu trữ. Đổi nhà cung cấp chỉ cần đổi exporter hoặc cấu hình Collector." },
      { q: "Vì sao file khởi tạo OTel phải được nạp trước code ứng dụng?", options: ["Để giảm dung lượng bundle", "Vì auto-instrumentation vá module lúc chúng được nạp", "Vì TypeScript yêu cầu", "Để bật HTTPS"], answer: 1, explain: "Instrumentation chèn logic vào module khi module được require/import. Nếu thư viện đã được nạp trước thì có thể không bị vá." },
      { q: "Thành phần nào của Collector chịu trách nhiệm gửi dữ liệu tới Tempo hay Datadog?", options: ["Receiver", "Processor", "Exporter", "Extension"], answer: 2, explain: "Receiver nhận dữ liệu vào, processor biến đổi hoặc gom lô, exporter gửi dữ liệu ra backend." }
    ]
  },
  "p11.m0.t6": {
    sections: [
      {
        h: "Vì sao cần tập trung log",
        p: [
          "Khi ứng dụng chạy trên nhiều container, SSH vào từng máy để đọc log là bất khả thi, và container bị xóa thì log cũng mất. Tập trung log nghĩa là một agent (Promtail, Grafana Alloy, Fluent Bit, Vector) thu log từ stdout của mọi container, gắn thêm metadata (service, pod, namespace) và gửi về một nơi lưu trữ chung để tìm kiếm.",
          "Ba lựa chọn phổ biến có cách lưu khác nhau, dẫn tới chi phí và khả năng truy vấn khác nhau."
        ]
      },
      {
        h: "Loki, ELK/OpenSearch và CloudWatch",
        list: [
          "Loki (Grafana): chỉ đánh chỉ mục nhãn (service, env, level), nội dung log được nén thành chunk trên object storage như S3. Rẻ và đơn giản, truy vấn bằng LogQL, tích hợp tốt với Grafana. Tìm kiếm toàn văn trên khoảng thời gian dài chậm hơn vì phải quét chunk.",
          "ELK (Elasticsearch, Logstash, Kibana) hoặc OpenSearch: đánh chỉ mục toàn văn mọi trường, tìm kiếm và thống kê rất mạnh. Đổi lại tốn nhiều CPU, RAM, ổ đĩa, vận hành cluster phức tạp.",
          "CloudWatch Logs (AWS): dịch vụ quản lý sẵn, không phải vận hành, tích hợp với Lambda, ECS. Tính tiền theo lượng dữ liệu nạp vào, lưu trữ và dữ liệu được quét khi truy vấn; dễ phát sinh chi phí lớn nếu log nhiều."
        ],
        p: [
          "Giống Prometheus, nhãn trong Loki phải có cardinality thấp. Không đặt `userId` hay `requestId` làm nhãn; để chúng trong nội dung JSON và lọc lúc truy vấn."
        ],
        code: {
          lang: "text", file: "LogQL",
          src: `# Lỗi của order-api ở production, lọc theo trường JSON
{service="order-api", env="prod"} | json | level="error" | orderId="991"

# Đếm số dòng lỗi mỗi phút theo service
sum by (service) (count_over_time({env="prod"} | json | level="error" [1m]))`
        }
      },
      {
        h: "Retention và chi phí",
        p: [
          "Chi phí log tỉ lệ với lượng dữ liệu nạp vào và thời gian giữ. Hãy đặt retention theo nhu cầu: log debug giữ vài ngày, log ứng dụng 14–30 ngày, log audit phục vụ tuân thủ thì giữ lâu hơn ở kho lưu trữ rẻ (ví dụ S3 lớp lưu trữ lạnh). Yêu cầu pháp lý của từng ngành quyết định con số cụ thể.",
          "Cách giảm chi phí hiệu quả nhất là giảm log ngay tại nguồn: bỏ log lặp vô ích, lấy mẫu log info có giá trị thấp, không log toàn bộ payload. Theo dõi lượng log mỗi service theo ngày để phát hiện service đột ngột log gấp mười lần do lỗi vòng lặp."
        ]
      }
    ],
    summary: [
      "Agent thu log từ stdout của container và gửi về kho tập trung.",
      "Loki chỉ index nhãn nên rẻ; ELK/OpenSearch index toàn văn nên mạnh nhưng đắt.",
      "CloudWatch không phải vận hành nhưng tính tiền theo dữ liệu nạp, lưu và quét.",
      "Nhãn log phải có cardinality thấp; id đặt trong nội dung JSON.",
      "Đặt retention theo loại log và giảm log ngay tại nguồn."
    ],
    pitfalls: [
      "Ghi log ra file bên trong container, container bị xóa là mất log. Ghi ra stdout/stderr để agent thu gom.",
      "Đặt `requestId` làm nhãn Loki, số stream bùng nổ và Loki chậm hoặc từ chối nạp. Để trong nội dung log.",
      "Không đặt retention (giữ vô thời hạn) trên CloudWatch, chi phí tăng dần mà không ai để ý."
    ],
    quiz: [
      { q: "Vì sao Loki thường rẻ hơn Elasticsearch khi lưu cùng lượng log?", options: ["Loki không lưu nội dung log", "Loki chỉ đánh chỉ mục nhãn và nén nội dung trên object storage", "Loki xóa log sau 1 giờ", "Loki không hỗ trợ truy vấn"], answer: 1, explain: "Index toàn văn tốn nhiều tài nguyên. Loki chỉ index tập nhãn nhỏ, nội dung lưu nén giá rẻ, đổi lại tìm toàn văn chậm hơn." },
      { q: "Ứng dụng trong container nên ghi log ra đâu?", options: ["File trong container", "stdout/stderr", "Gửi email", "localStorage"], answer: 1, explain: "Runtime container thu stdout/stderr và agent log đọc từ đó. File trong container mất khi container bị xóa." },
      { q: "Cách giảm chi phí log hiệu quả nhất là gì?", options: ["Tăng retention", "Giảm lượng log ngay tại nguồn: bỏ log vô ích, lấy mẫu, không log payload lớn", "Chuyển hết sang level debug", "Tắt nén"], answer: 1, explain: "Chi phí tỉ lệ với dữ liệu nạp và lưu. Ít log vô ích hơn thì mọi chi phí phía sau đều giảm." }
    ]
  },
  "p11.m1.t0": {
    sections: [
      {
        h: "SLI, SLO, SLA khác nhau thế nào",
        p: [
          "SLI (Service Level Indicator) là một con số đo được phản ánh trải nghiệm người dùng, thường viết dạng tỉ lệ: số sự kiện tốt chia tổng số sự kiện. Ví dụ tỉ lệ request trả về không phải 5xx và nhanh hơn 300ms.",
          "SLO (Service Level Objective) là mục tiêu nội bộ cho SLI trong một cửa sổ thời gian: \"99.9% request thành công và dưới 300ms, tính trong 30 ngày trượt\". SLA (Service Level Agreement) là cam kết với khách hàng có hậu quả kèm theo, ví dụ hoàn tiền nếu dưới 99.5%. SLA nên lỏng hơn SLO để bạn có vùng đệm cảnh báo trước khi vi phạm hợp đồng."
        ],
        list: [
          "Chọn SLI từ góc nhìn người dùng: tỉ lệ thành công, độ trễ, độ mới dữ liệu, không phải CPU.",
          "Đo càng gần người dùng càng tốt, ví dụ ở load balancer thay vì trong từng instance.",
          "Bắt đầu với 1–3 SLO cho các hành trình quan trọng như đăng nhập, thanh toán."
        ]
      },
      {
        h: "Error budget",
        p: [
          "Error budget là phần được phép thất bại: 100% trừ SLO. Với SLO 99.9% trong 30 ngày, budget là 0.1%. Nếu tính theo thời gian, đó là khoảng 43 phút mỗi 30 ngày (30 × 24 × 60 × 0.001 ≈ 43.2 phút). Nếu tính theo request, với 10 triệu request mỗi tháng, bạn được phép có 10.000 request xấu.",
          "Không đặt mục tiêu 100%: nó bất khả thi, cực kỳ tốn kém, và người dùng cũng không nhận ra khác biệt vì mạng của họ đã kém tin cậy hơn thế. Mỗi số 9 thêm vào làm budget nhỏ đi mười lần."
        ],
        code: {
          lang: "promql", file: "slo.promql",
          src: `# SLI: tỉ lệ request tốt (không 5xx và <= 300ms) trong 30 ngày
sum(increase(http_request_duration_seconds_bucket{le="0.3", status!~"5.."}[30d]))
  / sum(increase(http_request_duration_seconds_count[30d]))

# Phần error budget còn lại (1 = còn nguyên, 0 = hết, âm = vượt)
1 - (
  (1 - (
    sum(increase(http_request_duration_seconds_bucket{le="0.3", status!~"5.."}[30d]))
      / sum(increase(http_request_duration_seconds_count[30d]))
  )) / 0.001
)`
        }
      },
      {
        h: "Dùng error budget để ra quyết định",
        p: [
          "Error budget biến tranh luận \"ra tính năng hay làm ổn định\" thành quyết định dựa trên số liệu. Còn nhiều budget: đội được phép deploy nhanh, thử nghiệm. Budget sắp hết hoặc đã hết: theo chính sách đã thống nhất trước, tạm dừng ra tính năng mới (trừ bản sửa lỗi và bảo mật), dồn sức vào độ ổn định như sửa nguyên nhân sự cố, thêm test, cải thiện rollback.",
          "Chính sách này phải được sản phẩm và kỹ thuật cùng đồng ý bằng văn bản từ trước, nếu không đến lúc hết budget sẽ không ai chịu dừng."
        ]
      }
    ],
    summary: [
      "SLI là tỉ lệ sự kiện tốt, SLO là mục tiêu nội bộ, SLA là cam kết có hậu quả.",
      "SLA nên lỏng hơn SLO để có vùng đệm.",
      "Error budget = 100% − SLO; 99.9% trong 30 ngày khoảng 43 phút.",
      "Hết budget thì ưu tiên ổn định theo chính sách đã thống nhất trước."
    ],
    pitfalls: [
      "Chọn SLI là CPU hay RAM thay vì trải nghiệm người dùng. CPU 90% mà người dùng vẫn ổn thì không phải sự cố.",
      "Đặt SLO 99.99% cho mọi thứ mà không tính chi phí. Chọn mức phù hợp với kỳ vọng thực tế của người dùng.",
      "Có SLO nhưng không có chính sách khi hết budget, SLO chỉ còn là con số trang trí."
    ],
    quiz: [
      { q: "SLO 99.9% trong 30 ngày tương ứng error budget khoảng bao nhiêu thời gian?", options: ["4.3 phút", "43 phút", "7.2 giờ", "3 ngày"], answer: 1, explain: "30 ngày có 43.200 phút; 0.1% của nó là 43.2 phút. 4.3 phút ứng với 99.99%, 7.2 giờ ứng với 99%." },
      { q: "Quan hệ hợp lý giữa SLA và SLO là gì?", options: ["SLA chặt hơn SLO", "SLA lỏng hơn SLO để có vùng đệm trước khi vi phạm cam kết", "Luôn bằng nhau", "Không liên quan"], answer: 1, explain: "SLO nội bộ chặt hơn giúp bạn phát hiện và xử lý trước khi chạm ngưỡng SLA có phạt." },
      { q: "Khi error budget đã hết, cách phản ứng phù hợp là gì?", options: ["Deploy thêm tính năng để bù", "Tạm dừng tính năng mới, ưu tiên công việc tăng độ ổn định", "Nâng SLO lên cao hơn", "Tắt cảnh báo"], answer: 1, explain: "Hết budget nghĩa là người dùng đã chịu quá mức cho phép. Chính sách chuẩn là dồn sức cho độ ổn định đến khi budget hồi phục." }
    ]
  },
  "p11.m1.t1": {
    sections: [
      {
        h: "Cảnh báo theo triệu chứng",
        p: [
          "Một alert tốt đánh thức người trực khi người dùng đang hoặc sắp bị ảnh hưởng, và việc cần làm là rõ ràng. Cảnh báo theo nguyên nhân như CPU 80%, bộ nhớ 70% thường gây nhiễu: CPU cao lúc chạy batch vẫn bình thường, trong khi nhiều sự cố thật lại không làm CPU tăng. Hãy cảnh báo theo triệu chứng người dùng thấy: tỉ lệ lỗi, độ trễ vượt SLO. Các tín hiệu nguyên nhân dùng trên dashboard để chẩn đoán, hoặc làm cảnh báo mức thấp (ticket) nếu chúng dự báo sự cố chắc chắn, như ổ đĩa sẽ đầy trong 4 giờ.",
          "Mỗi cảnh báo đánh thức người phải hành động được. Cảnh báo không ai xử lý sẽ dạy đội phớt lờ mọi cảnh báo (alert fatigue)."
        ]
      },
      {
        h: "SLO burn rate",
        p: [
          "Burn rate là tốc độ tiêu error budget so với tốc độ \"vừa đủ hết đúng lúc cuối cửa sổ\". Burn rate 1 nghĩa là tiêu hết budget sau đúng 30 ngày. Burn rate 14.4 nghĩa là tiêu 2% budget trong 1 giờ, cứ thế thì hết sau khoảng 2 ngày. Công thức: tỉ lệ lỗi hiện tại chia (1 − SLO).",
          "Cách phổ biến (theo sách SRE Workbook của Google) là cảnh báo đa cửa sổ: page khi burn rate cao ở cả cửa sổ dài (1 giờ) và cửa sổ ngắn (5 phút). Cửa sổ dài tránh báo vì vài giây lỗi thoáng qua, cửa sổ ngắn giúp alert tự tắt nhanh khi sự cố đã hết. Burn rate thấp hơn trong cửa sổ dài hơn (ví dụ 6 giờ) thì tạo ticket thay vì page."
        ],
        code: {
          lang: "yaml", file: "prometheus/slo-alerts.yml",
          src: `groups:
  - name: slo-burn-rate
    rules:
      - alert: ErrorBudgetBurnFast
        expr: |
          (
            sum(rate(http_request_duration_seconds_count{job="task-api", status=~"5.."}[1h]))
              / sum(rate(http_request_duration_seconds_count{job="task-api"}[1h]))
          ) > (14.4 * 0.001)
          and
          (
            sum(rate(http_request_duration_seconds_count{job="task-api", status=~"5.."}[5m]))
              / sum(rate(http_request_duration_seconds_count{job="task-api"}[5m]))
          ) > (14.4 * 0.001)
        labels:
          severity: page
        annotations:
          summary: "task-api đang tiêu error budget nhanh gấp 14.4 lần"
          runbook_url: "https://wiki.example.com/runbooks/task-api-errors"`
        }
      },
      {
        h: "Alertmanager",
        p: [
          "Prometheus đánh giá rule và gửi alert đang firing tới Alertmanager. Alertmanager lo phần còn lại: gom nhóm (grouping) nhiều alert liên quan thành một thông báo, định tuyến (routing) theo nhãn như `severity` hay `team` tới đúng kênh (PagerDuty, Slack, email), khử trùng lặp, im lặng tạm thời (silence) khi bảo trì, và ức chế (inhibition), ví dụ không báo từng service lỗi khi cả cluster đã mất kết nối."
        ],
        code: {
          lang: "yaml", file: "alertmanager.yml",
          src: `route:
  receiver: slack-default
  group_by: [alertname, job]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - matchers: [severity="page"]
      receiver: pagerduty-oncall
receivers:
  - name: slack-default
    slack_configs:
      - api_url: https://hooks.slack.com/services/XXX
        channel: "#alerts"
  - name: pagerduty-oncall
    pagerduty_configs:
      - routing_key: <PAGERDUTY_KEY>`
        }
      }
    ],
    summary: [
      "Cảnh báo theo triệu chứng người dùng thấy, không theo mọi chỉ số tài nguyên.",
      "Mọi page phải hành động được; nhiễu dẫn tới alert fatigue.",
      "Burn rate = tỉ lệ lỗi / (1 − SLO); dùng đa cửa sổ dài và ngắn.",
      "Alertmanager gom nhóm, định tuyến, silence và inhibition."
    ],
    pitfalls: [
      "Page cho CPU cao lúc 3 giờ sáng dù người dùng không bị ảnh hưởng. Chuyển thành dashboard hoặc ticket.",
      "Alert không kèm runbook, người trực mất thời gian đoán phải làm gì. Luôn gắn `runbook_url`.",
      "Ngưỡng tỉ lệ lỗi cố định với lưu lượng rất thấp (ban đêm 1/2 request lỗi là 50%). Cân nhắc điều kiện số request tối thiểu."
    ],
    quiz: [
      { q: "Cảnh báo nào phù hợp để page người trực?", options: ["CPU một node vượt 80%", "Tỉ lệ lỗi 5xx đang tiêu error budget nhanh gấp 14 lần", "Có bản cập nhật hệ điều hành", "Bộ nhớ tăng 5%"], answer: 1, explain: "Burn rate cao nghĩa là người dùng đang bị ảnh hưởng và SLO sắp vỡ, cần hành động ngay. Các lựa chọn khác không trực tiếp phản ánh trải nghiệm người dùng." },
      { q: "Với SLO 99.9%, tỉ lệ lỗi 1.44% ứng với burn rate bao nhiêu?", options: ["1.44", "14.4", "144", "0.144"], answer: 1, explain: "Burn rate = 0.0144 / 0.001 = 14.4." },
      { q: "Chức năng nào thuộc Alertmanager chứ không phải Prometheus?", options: ["Đánh giá biểu thức PromQL", "Scrape metric", "Gom nhóm và định tuyến thông báo tới Slack/PagerDuty", "Lưu time series"], answer: 2, explain: "Prometheus đánh giá rule và gửi alert. Alertmanager nhận alert rồi gom nhóm, khử trùng lặp, định tuyến và gửi thông báo." }
    ]
  },
  "p11.m1.t2": {
    sections: [
      {
        h: "Chuẩn bị on-call",
        p: [
          "On-call là việc luân phiên chịu trách nhiệm phản hồi sự cố ngoài giờ. On-call bền vững cần lịch xoay vòng công bằng (thường một tuần mỗi người), có người trực chính và người dự phòng, quy trình bàn giao đầu ca, và giới hạn số lần bị gọi. Nếu một ca bị gọi dậy nhiều lần mỗi đêm, vấn đề nằm ở hệ thống hoặc cảnh báo, không phải ở người trực.",
          "Trước khi vào ca, người trực cần quyền truy cập đầy đủ (VPN, cloud console, dashboard), biết runbook nằm đâu và biết leo thang (escalate) cho ai."
        ]
      },
      {
        h: "Mức độ nghiêm trọng và vai trò",
        list: [
          "SEV1: sự cố nghiêm trọng, ví dụ toàn bộ hệ thống sập, mất dữ liệu, lộ dữ liệu. Huy động ngay, cập nhật liên tục.",
          "SEV2: tính năng chính bị ảnh hưởng với nhiều người dùng, ví dụ thanh toán lỗi 20%.",
          "SEV3: ảnh hưởng nhỏ hoặc có cách né, xử lý trong giờ làm việc."
        ],
        p: [
          "Định nghĩa cụ thể của từng mức do mỗi tổ chức tự đặt, quan trọng là viết rõ và thống nhất. Với sự cố lớn, tách vai trò giúp tránh hỗn loạn. Incident Commander (IC) điều phối, ra quyết định, phân việc; IC không nhất thiết là người sửa lỗi. Operations/người xử lý kỹ thuật điều tra và thực hiện thay đổi. Communications lead cập nhật cho bên liên quan và status page. Scribe ghi lại dòng thời gian để phục vụ postmortem."
        ]
      },
      {
        h: "Quy trình xử lý và giao tiếp",
        p: [
          "Mục tiêu đầu tiên là giảm thiểu ảnh hưởng (mitigate), không phải tìm nguyên nhân gốc. Nếu sự cố xuất hiện ngay sau lần deploy, rollback trước rồi điều tra sau. Các bước điển hình: nhận alert và xác nhận, đánh giá mức độ, mở kênh sự cố riêng (ví dụ Slack `#inc-2026-09-26-checkout`), chỉ định IC, giảm thiểu, xác nhận đã phục hồi bằng metric, đóng sự cố và lên lịch postmortem.",
          "Status page thông báo cho người dùng bằng ngôn ngữ đơn giản: đang có gì, ảnh hưởng tới ai, lần cập nhật tiếp theo khi nào. Cập nhật đều đặn kể cả khi chưa có tin mới, vì im lặng làm khách hàng lo lắng hơn."
        ],
        code: {
          lang: "text", file: "mẫu cập nhật sự cố",
          src: `[SEV2] Thanh toán thất bại một phần - cập nhật lúc 14:20
Ảnh hưởng: ~15% giao dịch thẻ thất bại từ 13:55.
Hiện trạng: đã rollback bản deploy 13:50, tỉ lệ lỗi đang giảm.
Đang làm: theo dõi 15 phút để xác nhận phục hồi.
IC: @lan | Kênh: #inc-2026-09-26-checkout
Cập nhật tiếp theo: 14:40`
        }
      }
    ],
    summary: [
      "On-call cần lịch xoay vòng công bằng, người dự phòng và quy trình leo thang.",
      "Định nghĩa rõ mức SEV để mọi người phản ứng nhất quán.",
      "Tách vai trò: Incident Commander, người xử lý, giao tiếp, ghi chép.",
      "Ưu tiên giảm thiểu ảnh hưởng (như rollback) trước khi tìm nguyên nhân gốc.",
      "Cập nhật status page đều đặn bằng ngôn ngữ đơn giản."
    ],
    pitfalls: [
      "IC tự lao vào debug và không còn ai điều phối. IC nên giao việc kỹ thuật cho người khác.",
      "Cố tìm nguyên nhân gốc trong khi người dùng vẫn bị ảnh hưởng. Rollback hoặc tắt feature flag trước.",
      "Thảo luận sự cố rải rác trong nhiều kênh chat riêng, mất thông tin cho postmortem. Dùng một kênh sự cố duy nhất."
    ],
    quiz: [
      { q: "Vai trò chính của Incident Commander là gì?", options: ["Viết code sửa lỗi", "Điều phối, ra quyết định và phân công trong sự cố", "Viết postmortem một mình", "Trả lời khách hàng qua điện thoại"], answer: 1, explain: "IC giữ bức tranh tổng thể và điều phối. Việc sửa lỗi giao cho người xử lý kỹ thuật để IC không bị cuốn vào chi tiết." },
      { q: "Sự cố xảy ra 5 phút sau một lần deploy. Hành động đầu tiên hợp lý là gì?", options: ["Đọc hết code thay đổi để tìm nguyên nhân gốc", "Rollback bản deploy để giảm thiểu ảnh hưởng, điều tra sau", "Chờ xem có tự hết không", "Viết postmortem"], answer: 1, explain: "Mục tiêu đầu tiên là đưa người dùng về trạng thái ổn. Rollback nhanh và an toàn, nguyên nhân có thể điều tra khi hệ thống đã ổn định." },
      { q: "Vì sao nên cập nhật status page đều đặn kể cả khi chưa có tin mới?", options: ["Để tăng SEO", "Để người dùng biết sự cố đang được xử lý và khi nào có thông tin tiếp", "Vì SLA bắt buộc mỗi 1 phút", "Để tắt cảnh báo"], answer: 1, explain: "Im lặng khiến người dùng nghĩ không ai xử lý. Cập nhật định kỳ với thời điểm cập nhật tiếp theo giữ được niềm tin." }
    ]
  },
  "p11.m1.t3": {
    sections: [
      {
        h: "Vì sao postmortem phải không đổ lỗi",
        p: [
          "Postmortem là tài liệu viết sau sự cố để hiểu chuyện gì đã xảy ra và làm sao để nó không lặp lại. Không đổ lỗi (blameless) nghĩa là giả định mọi người đã hành động hợp lý với thông tin họ có lúc đó. Câu hỏi không phải \"ai làm sai\" mà là \"hệ thống nào đã cho phép lỗi này xảy ra và không phát hiện sớm\".",
          "Lý do rất thực tế: nếu người ta bị trách phạt, lần sau họ sẽ giấu thông tin, và tổ chức mất đi cơ hội học. Một kỹ sư chạy nhầm lệnh xóa database production là dấu hiệu hệ thống thiếu rào chắn (quyền truy cập quá rộng, không có xác nhận, không có backup đã kiểm thử), không phải vấn đề của riêng người đó."
        ]
      },
      {
        h: "Cấu trúc một postmortem",
        list: [
          "Tóm tắt: chuyện gì xảy ra, trong bao lâu, ảnh hưởng tới ai và bao nhiêu (số request lỗi, số đơn hàng, phần error budget đã tiêu).",
          "Dòng thời gian: các mốc có giờ cụ thể, từ lúc bắt đầu, lúc phát hiện, các hành động, đến lúc phục hồi. Lấy từ kênh sự cố, alert, lịch sử deploy.",
          "Nguyên nhân gốc và các yếu tố góp phần.",
          "Điều gì hoạt động tốt, điều gì chưa tốt, chỗ nào may mắn.",
          "Hành động khắc phục: mỗi việc có người chịu trách nhiệm, hạn hoàn thành, và được theo dõi trong hệ thống ticket."
        ],
        p: [
          "Hai chỉ số hay được theo dõi qua các postmortem là thời gian phát hiện (time to detect) và thời gian phục hồi (time to recover). Chúng cho biết cảnh báo và quy trình của bạn có đang tốt lên không."
        ]
      },
      {
        h: "5 Whys và hành động khắc phục",
        p: [
          "5 Whys là kỹ thuật hỏi \"tại sao\" lặp lại để đi từ triệu chứng xuống nguyên nhân sâu hơn. Con số 5 chỉ là gợi ý. Hãy dừng khi tới điều bạn có thể thay đổi ở mức hệ thống. Sự cố thực tế thường có nhiều yếu tố góp phần, nên có thể có nhiều nhánh \"tại sao\".",
          "Hành động tốt phải cụ thể và kiểm chứng được. \"Cẩn thận hơn\" không phải hành động. \"Thêm migration check vào CI, chặn lệnh khóa bảng lớn hơn 1 triệu dòng\" là hành động."
        ],
        code: {
          lang: "text", file: "postmortem-5whys.md",
          src: `Triệu chứng: API trả 503 trong 22 phút (14:05 - 14:27).
1. Vì sao 503? Mọi instance hết connection tới PostgreSQL.
2. Vì sao hết connection? Query đều chờ khóa trên bảng orders.
3. Vì sao có khóa? Migration thêm cột có DEFAULT chạy lúc cao điểm, giữ khóa lâu.
4. Vì sao migration nguy hiểm lọt qua? CI không kiểm tra loại khóa của migration.
5. Vì sao chạy lúc cao điểm? Pipeline tự chạy migration ngay khi merge.

Hành động:
- [ ] Thêm kiểm tra migration nguy hiểm vào CI (@minh, 10/10)
- [ ] Đặt lock_timeout cho migration (@lan, 03/10)
- [ ] Cảnh báo khi connection pool > 90% (@huy, 05/10)`
        }
      }
    ],
    summary: [
      "Postmortem không đổ lỗi tập trung vào hệ thống, không vào cá nhân.",
      "Gồm tóm tắt ảnh hưởng, dòng thời gian, nguyên nhân, bài học và hành động.",
      "5 Whys giúp đi từ triệu chứng xuống nguyên nhân có thể sửa ở mức hệ thống.",
      "Mỗi hành động có người chịu trách nhiệm, hạn và được theo dõi."
    ],
    pitfalls: [
      "Dừng ở \"lỗi do con người\", bỏ qua vì sao hệ thống cho phép lỗi đó. Hỏi tiếp tại sao.",
      "Hành động mơ hồ như \"test kỹ hơn\", không đo được và không ai làm. Viết hành động cụ thể, có chủ và hạn.",
      "Viết postmortem xong rồi cất đi, hành động không bao giờ được thực hiện. Theo dõi trong backlog và review định kỳ."
    ],
    quiz: [
      { q: "Mục đích chính của postmortem không đổ lỗi là gì?", options: ["Tìm người chịu trách nhiệm để kỷ luật", "Học từ sự cố và cải thiện hệ thống để giảm khả năng lặp lại", "Báo cáo cho khách hàng", "Đóng ticket nhanh"], answer: 1, explain: "Blameless giúp mọi người chia sẻ thật thông tin, từ đó tìm ra điểm yếu của hệ thống. Kỷ luật cá nhân làm người ta giấu thông tin." },
      { q: "Hành động khắc phục nào tốt nhất?", options: ["Mọi người cẩn thận hơn khi deploy", "Thêm kiểm tra tự động trong CI chặn migration khóa bảng lớn, giao cho một người, hạn 10/10", "Họp lại vào tuần sau", "Không làm gì vì đã sửa xong"], answer: 1, explain: "Hành động tốt cụ thể, kiểm chứng được, có chủ và hạn. Các lựa chọn khác mơ hồ hoặc không tạo thay đổi." },
      { q: "Khi nào nên dừng hỏi \"tại sao\" trong 5 Whys?", options: ["Đúng sau câu thứ 5", "Khi tìm ra người gây lỗi", "Khi tới nguyên nhân có thể thay đổi ở mức hệ thống hoặc quy trình", "Sau câu đầu tiên"], answer: 2, explain: "Số 5 chỉ là gợi ý. Mục tiêu là tới điểm có thể hành động để ngăn tái diễn, không phải tìm người để trách." }
    ]
  },
  "p11.m1.t4": {
    sections: [
      {
        h: "Runbook là gì",
        p: [
          "Runbook (còn gọi playbook) là tài liệu hướng dẫn từng bước xử lý một loại cảnh báo hay sự cố cụ thể. Lúc 3 giờ sáng, người trực vừa bị đánh thức không nên phải nghĩ từ đầu. Runbook giúp người mới vào đội cũng xử lý được, giảm thời gian phục hồi và giảm phụ thuộc vào một vài người \"biết hết\".",
          "Mỗi alert gửi đi nên kèm link thẳng tới runbook tương ứng qua annotation như `runbook_url`. Người trực bấm một lần là tới đúng hướng dẫn."
        ]
      },
      {
        h: "Một runbook tốt gồm gì",
        list: [
          "Ý nghĩa của alert: đang đo cái gì, ảnh hưởng tới người dùng thế nào.",
          "Cách xác nhận: dashboard nào, truy vấn nào để biết alert đúng hay báo nhầm.",
          "Các nguyên nhân thường gặp và cách chẩn đoán từng cái.",
          "Các bước giảm thiểu an toàn, kèm lệnh cụ thể có thể copy: rollback, scale, tắt feature flag.",
          "Khi nào và leo thang cho ai (đội sở hữu, DBA, nhà cung cấp).",
          "Ngày cập nhật gần nhất và người sở hữu tài liệu."
        ],
        p: [
          "Runbook phải được cập nhật sau mỗi sự cố: nếu người trực phải làm điều gì không có trong runbook, hãy thêm vào. Runbook lỗi thời còn nguy hiểm hơn không có."
        ]
      },
      {
        h: "Ví dụ và tự động hóa",
        p: [
          "Bước nào lặp lại và an toàn thì nên tự động hóa dần: từ lệnh copy-paste thành script, rồi thành nút bấm, rồi thành hệ thống tự phục hồi. Tuy vậy, giữ lại phần chẩn đoán bằng người cho các tình huống lạ."
        ],
        code: {
          lang: "text", file: "runbooks/high-error-rate.md",
          src: `# HighErrorRate - task-api
Ý nghĩa: >2% request trả 5xx trong 5 phút. Người dùng thấy lỗi khi lưu task.
Dashboard: https://grafana.example.com/d/task-api

1. Xác nhận
   - Panel "Errors (%)" > 2%? Lỗi tập trung ở route nào?
2. Có deploy trong 30 phút gần đây?
   - Có: rollback
     kubectl rollout undo deployment/task-api -n prod
     kubectl rollout status deployment/task-api -n prod
3. Lỗi kết nối database trong log?
   {service="task-api"} | json | level="error" |= "ECONNREFUSED"
   - Kiểm tra dashboard PostgreSQL (connection, CPU). Leo thang @dba-oncall.
4. Không rõ nguyên nhân sau 15 phút: nâng lên SEV2, gọi @backend-lead.

Chủ sở hữu: team-backend | Cập nhật: 2026-09-20`
        }
      }
    ],
    summary: [
      "Runbook là hướng dẫn từng bước cho từng loại alert.",
      "Link runbook trực tiếp từ alert qua `runbook_url`.",
      "Gồm ý nghĩa, cách xác nhận, chẩn đoán, lệnh giảm thiểu, leo thang.",
      "Cập nhật sau mỗi sự cố; tự động hóa dần các bước lặp lại."
    ],
    pitfalls: [
      "Runbook chung chung kiểu \"kiểm tra hệ thống\", không có lệnh cụ thể. Viết lệnh có thể copy chạy được.",
      "Runbook nằm rải rác, người trực không tìm thấy. Gắn link ngay trong alert.",
      "Lệnh trong runbook đã lỗi thời (tên deployment đổi), chạy sai lúc sự cố. Review runbook định kỳ, thử lệnh trong buổi diễn tập."
    ],
    quiz: [
      { q: "Cách tốt nhất để người trực tìm được runbook là gì?", options: ["Hỏi đồng nghiệp trên chat", "Gắn link runbook trực tiếp trong annotation của alert", "Tìm trong email cũ", "In ra giấy"], answer: 1, explain: "Link trong alert đưa người trực tới đúng tài liệu ngay lập tức, không phụ thuộc vào việc ai đang thức." },
      { q: "Nội dung nào không cần thiết trong runbook?", options: ["Cách xác nhận alert", "Lệnh rollback cụ thể", "Lịch sử phát triển toàn bộ sản phẩm", "Người cần leo thang"], answer: 2, explain: "Runbook phục vụ hành động nhanh. Lịch sử sản phẩm không giúp xử lý sự cố và làm tài liệu dài vô ích." },
      { q: "Khi nào nên cập nhật runbook?", options: ["Không bao giờ", "Sau mỗi sự cố mà người trực phải làm điều chưa có hoặc sai trong runbook", "Mỗi 5 năm", "Chỉ khi đổi công ty"], answer: 1, explain: "Mỗi sự cố cho thấy chỗ runbook thiếu hoặc sai. Cập nhật ngay giúp lần sau xử lý nhanh hơn." }
    ]
  },
  "p11.m1.t5": {
    sections: [
      {
        h: "RPO và RTO",
        p: [
          "Hai con số định hình mọi chiến lược backup. RPO (Recovery Point Objective) là lượng dữ liệu tối đa bạn chấp nhận mất, tính bằng thời gian: RPO 5 phút nghĩa là khi thảm họa xảy ra, bạn chỉ được mất tối đa 5 phút dữ liệu gần nhất. RTO (Recovery Time Objective) là thời gian tối đa để hệ thống hoạt động lại. RPO và RTO càng nhỏ thì càng tốn kém, nên phải chọn theo giá trị nghiệp vụ: hệ thống thanh toán cần RPO gần 0, còn blog nội bộ có thể chấp nhận RPO 24 giờ.",
          "Replication không phải backup. Nếu ai đó chạy `DELETE` nhầm, lệnh đó được nhân bản sang replica ngay lập tức. Bạn cần backup có thể khôi phục về một thời điểm trước lỗi."
        ]
      },
      {
        h: "Chiến lược backup PostgreSQL",
        list: [
          "Logical backup bằng `pg_dump`: xuất cấu trúc và dữ liệu, dễ khôi phục từng bảng, nhưng chậm với database lớn. RPO bằng chu kỳ chạy dump.",
          "Physical backup (`pg_basebackup`) kết hợp lưu trữ WAL liên tục: cho phép Point-in-Time Recovery (PITR), khôi phục về bất kỳ thời điểm nào trong khoảng giữ lại. Các công cụ như pgBackRest, WAL-G tự động hóa việc này.",
          "Dịch vụ quản lý như Amazon RDS có snapshot tự động và PITR, nhưng bạn vẫn phải cấu hình thời gian giữ và thử khôi phục."
        ],
        p: [
          "Quy tắc 3-2-1 là điểm khởi đầu tốt: 3 bản sao dữ liệu, trên 2 loại lưu trữ khác nhau, 1 bản ở nơi khác (vùng khác, tài khoản khác). Lưu backup ở tài khoản cloud riêng hoặc dùng object lock để kẻ tấn công chiếm được tài khoản chính cũng không xóa được backup."
        ],
        code: {
          lang: "bash", file: "backup.sh",
          src: `# Logical backup định dạng custom (nén, khôi phục chọn lọc được)
pg_dump -h db.internal -U backup -d orders -Fc -f "orders_$(date +%F).dump"

# Sao chép sang bucket ở vùng khác
aws s3 cp "orders_$(date +%F).dump" s3://acme-backup-apse1/postgres/ --storage-class STANDARD_IA

# Khôi phục vào database kiểm thử
createdb -h restore-test.internal -U postgres orders_restore
pg_restore -h restore-test.internal -U postgres -d orders_restore --jobs=4 "orders_$(date +%F).dump"`
        }
      },
      {
        h: "Diễn tập khôi phục định kỳ",
        p: [
          "Backup chưa từng được khôi phục thử thì coi như chưa có. Nhiều đội chỉ phát hiện backup hỏng, thiếu quyền hoặc mất khóa giải mã đúng lúc cần. Hãy lên lịch diễn tập định kỳ (ví dụ hàng tháng hoặc hàng quý): khôi phục vào môi trường riêng, chạy kiểm tra dữ liệu (đếm dòng, truy vấn mẫu), đo thời gian thực tế và so với RTO.",
          "Với disaster recovery cấp vùng, cần tài liệu cho việc dựng lại toàn bộ hạ tầng ở vùng khác. Hạ tầng dưới dạng code (Terraform) cùng backup ở vùng khác giúp việc này khả thi. Tự động hóa việc kiểm tra backup và cảnh báo khi job backup thất bại hoặc bản mới nhất quá cũ."
        ]
      }
    ],
    summary: [
      "RPO là lượng dữ liệu được phép mất, RTO là thời gian được phép ngừng.",
      "Replication không thay thế backup vì lỗi logic cũng được nhân bản.",
      "PITR bằng base backup và WAL cho RPO nhỏ; pg_dump hợp với khôi phục chọn lọc.",
      "Theo quy tắc 3-2-1, lưu một bản ở vùng và tài khoản khác.",
      "Diễn tập khôi phục định kỳ và đo thời gian thực so với RTO."
    ],
    pitfalls: [
      "Chỉ có replica mà không có backup, lệnh xóa nhầm lan sang mọi bản sao.",
      "Backup lưu cùng tài khoản, cùng vùng với production; mất tài khoản hoặc cả vùng là mất hết.",
      "Không bao giờ thử khôi phục, tới lúc cần mới biết file hỏng hoặc mất 8 giờ thay vì 1 giờ như RTO."
    ],
    quiz: [
      { q: "RPO 15 phút nghĩa là gì?", options: ["Hệ thống phải hoạt động lại trong 15 phút", "Chấp nhận mất tối đa 15 phút dữ liệu gần nhất", "Backup giữ trong 15 ngày", "Mỗi 15 phút restart server"], answer: 1, explain: "RPO đo lượng dữ liệu được phép mất theo thời gian. Thời gian phục hồi hoạt động là RTO." },
      { q: "Vì sao replication không thay thế được backup?", options: ["Replica chậm hơn", "Lỗi logic như DELETE nhầm cũng được nhân bản sang replica", "Replica không lưu dữ liệu", "Replication tốn tiền hơn"], answer: 1, explain: "Replication sao chép mọi thay đổi, kể cả thay đổi sai. Backup cho phép quay về thời điểm trước lỗi." },
      { q: "Cách duy nhất để chắc chắn backup dùng được là gì?", options: ["Kiểm tra dung lượng file", "Khôi phục thử định kỳ và kiểm tra dữ liệu", "Backup hai lần mỗi ngày", "Dùng dịch vụ cloud"], answer: 1, explain: "Chỉ khôi phục thật mới phát hiện file hỏng, thiếu quyền hay thời gian vượt RTO. Dung lượng file không nói lên tính toàn vẹn." }
    ]
  },
  "p11.m1.t6": {
    sections: [
      {
        h: "Chaos engineering là gì",
        p: [
          "Chaos engineering là chủ động đưa lỗi vào hệ thống một cách có kiểm soát để kiểm chứng rằng hệ thống chịu được lỗi như bạn tin. Bạn đã thiết kế retry, timeout, circuit breaker, nhiều replica, nhưng chúng chỉ thật sự được chứng minh khi lỗi xảy ra. Tốt hơn là tự gây lỗi lúc 10 giờ sáng khi cả đội đang tỉnh táo, thay vì để nó tự xảy ra lúc 3 giờ sáng.",
          "Đây không phải phá hệ thống ngẫu nhiên. Nó là thí nghiệm khoa học có giả thuyết, phạm vi và điều kiện dừng rõ ràng."
        ]
      },
      {
        h: "Quy trình một thí nghiệm",
        list: [
          "Xác định trạng thái ổn định bằng metric: ví dụ tỉ lệ thành công 99.9%, p95 dưới 300ms.",
          "Đặt giả thuyết: \"Khi kill một trong ba pod của order-api, tỉ lệ thành công vẫn trên 99.5%\".",
          "Giới hạn phạm vi ảnh hưởng (blast radius): bắt đầu ở staging, một pod, một phần nhỏ lưu lượng.",
          "Đặt điều kiện dừng (abort): nếu tỉ lệ lỗi vượt 2% thì dừng thí nghiệm ngay.",
          "Chạy, quan sát dashboard, so với giả thuyết.",
          "Ghi lại kết quả và sửa điểm yếu tìm được, rồi mở rộng phạm vi dần."
        ],
        p: [
          "Các lỗi hay thử: kill pod hoặc instance, tăng độ trễ mạng giữa hai service, làm service phụ thuộc trả lỗi, làm đầy ổ đĩa, CPU tăng cao, mất cả một availability zone."
        ]
      },
      {
        h: "Công cụ và ví dụ",
        p: [
          "Trên Kubernetes, Chaos Mesh và LitmusChaos định nghĩa thí nghiệm bằng manifest. AWS Fault Injection Service hỗ trợ dịch vụ AWS. Với thử nghiệm nhỏ, bạn có thể bắt đầu bằng lệnh đơn giản như xóa một pod, hoặc dùng Toxiproxy để thêm độ trễ vào kết nối giữa ứng dụng và database trong môi trường test.",
          "Chỉ làm chaos khi đã có observability tốt: nếu không đo được trạng thái ổn định thì không biết thí nghiệm thành công hay thất bại. Thông báo cho đội liên quan trước khi chạy."
        ],
        code: {
          lang: "yaml", file: "chaos/network-delay.yaml",
          src: `# Chaos Mesh: thêm 300ms độ trễ cho một pod của payment-service trong 5 phút
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: payment-delay
  namespace: staging
spec:
  action: delay
  mode: one
  selector:
    namespaces: [staging]
    labelSelectors:
      app: payment-service
  delay:
    latency: "300ms"
    jitter: "50ms"
  duration: "5m"

# Kiểm chứng đơn giản hơn: kill một pod và theo dõi dashboard
# kubectl delete pod -n staging -l app=order-api --wait=false
# (lưu ý: selector có thể khớp nhiều pod; chọn đúng tên một pod khi chỉ muốn xóa một)`
        }
      }
    ],
    summary: [
      "Chaos engineering chủ động gây lỗi có kiểm soát để kiểm chứng khả năng chịu lỗi.",
      "Mỗi thí nghiệm có trạng thái ổn định, giả thuyết, blast radius và điều kiện dừng.",
      "Bắt đầu nhỏ ở staging, mở rộng dần khi đã tự tin.",
      "Cần observability tốt trước khi làm chaos.",
      "Công cụ: Chaos Mesh, LitmusChaos, AWS FIS, Toxiproxy."
    ],
    pitfalls: [
      "Chạy thí nghiệm trên production ngay lần đầu mà không có điều kiện dừng. Bắt đầu ở staging với phạm vi nhỏ.",
      "Không có dashboard đo trạng thái ổn định, không biết kết quả thí nghiệm. Chuẩn bị metric trước.",
      "Tìm ra điểm yếu nhưng không tạo hành động khắc phục. Mỗi phát hiện cần ticket có người chịu trách nhiệm."
    ],
    quiz: [
      { q: "Điều gì phân biệt chaos engineering với việc phá hệ thống ngẫu nhiên?", options: ["Dùng công cụ đắt tiền", "Có giả thuyết, phạm vi giới hạn và điều kiện dừng rõ ràng", "Chỉ chạy vào ban đêm", "Không cần thông báo cho ai"], answer: 1, explain: "Chaos engineering là thí nghiệm có kiểm soát: đo trạng thái ổn định, đặt giả thuyết, giới hạn blast radius và dừng khi vượt ngưỡng." },
      { q: "Blast radius nghĩa là gì?", options: ["Tốc độ lỗi lan", "Phạm vi hệ thống và người dùng có thể bị ảnh hưởng bởi thí nghiệm", "Số server bị xóa", "Thời gian chạy thí nghiệm"], answer: 1, explain: "Giới hạn blast radius, ví dụ một pod hay 1% lưu lượng, giữ thiệt hại nhỏ nếu giả thuyết sai." },
      { q: "Điều kiện tiên quyết quan trọng nhất trước khi làm chaos engineering là gì?", options: ["Có Kubernetes", "Có observability đo được trạng thái ổn định của hệ thống", "Có 100 server", "Không có bug nào"], answer: 1, explain: "Không đo được thì không biết thí nghiệm ảnh hưởng thế nào và khi nào phải dừng. Kubernetes chỉ là một môi trường có thể dùng." }
    ]
  },
});
