/* Dự án theo bậc (dựa trên các checkpoint của roadmap.sh full-stack) + Capstone + Sự nghiệp */
window.LADDER = [
  { lv: 1, t: "Static webpage", d: "Trang giới thiệu bản thân / CV online bằng HTML + CSS, responsive, deploy GitHub Pages.", skills: ["HTML", "CSS", "Git"] },
  { lv: 2, t: "Interactivity", d: "Thêm tương tác bằng JavaScript: bộ lọc dự án, form liên hệ có validate, dark mode.", skills: ["DOM", "Events"] },
  { lv: 3, t: "External packages", d: "Dùng npm package (chart, date), bundler Vite, hiểu package.json và lockfile.", skills: ["npm", "Vite"] },
  { lv: 4, t: "CLI app", d: "task-cli / GitHub activity CLI bằng Node + TypeScript, có test.", skills: ["Node.js", "TypeScript", "Vitest"] },
  { lv: 5, t: "Simple CRUD API", d: "REST API ghi chú / blog với Postgres, validation, OpenAPI.", skills: ["NestJS", "PostgreSQL", "REST"] },
  { lv: 6, t: "Frontend app", d: "Ứng dụng React gọi API ở trên: routing, form, TanStack Query.", skills: ["React", "Tailwind"] },
  { lv: 7, t: "Complete app", d: "Ứng dụng đầy đủ có JWT auth, phân quyền, upload file, job nền, cache Redis.", skills: ["Auth", "Redis", "BullMQ"] },
  { lv: 8, t: "Deployment", d: "Đưa ứng dụng lên VPS/AWS: Docker, Nginx, TLS, domain riêng.", skills: ["Docker", "Nginx", "Linux"] },
  { lv: 9, t: "CI/CD", d: "Pipeline GitHub Actions: test → build → scan → deploy staging/prod, rollback.", skills: ["GitHub Actions", "GHCR", "OIDC"] },
  { lv: 10, t: "Infrastructure as Code", d: "Terraform dựng toàn bộ hạ tầng; Ansible cấu hình server.", skills: ["Terraform", "AWS", "Ansible"] },
  { lv: 11, t: "Monitoring", d: "Prometheus, Grafana, alert, log tập trung, trace.", skills: ["OpenTelemetry", "Prometheus", "Grafana"] },
  { lv: 12, t: "Automation & Scale", d: "Kubernetes + GitOps, autoscaling, backup tự động, runbook.", skills: ["Kubernetes", "Argo CD", "Helm"] }
];

window.CAPSTONE = {
  name: "ShopFlow: nền tảng thương mại điện tử production-grade",
  pitch: "Dự án tốt nghiệp gộp mọi thứ đã học. Khi hoàn thành, bạn có một sản phẩm thật để đưa vào CV và để trình bày chi tiết trong buổi phỏng vấn.",
  architecture: [
    ["web", "Next.js storefront + trang admin (SSR, RSC, Tailwind)"],
    ["api", "NestJS modular monolith: catalog, cart, order, payment, user"],
    ["worker", "BullMQ: email, xuất báo cáo, xử lý ảnh, outbox relay"],
    ["data", "PostgreSQL (RDS), Redis (cache, session, rate limit), S3 (ảnh)"],
    ["events", "RabbitMQ hoặc Kafka cho order.paid → inventory, notification"],
    ["infra", "Terraform (AWS VPC, EKS/ECS, RDS), Helm + Argo CD"],
    ["obs", "OpenTelemetry → Prometheus/Grafana/Loki/Tempo, alert theo SLO"]
  ],
  milestones: [
    { t: "M1 – Nền móng (2 tuần)", items: ["Monorepo (pnpm + Turborepo), lint, commitlint, husky", "Docker Compose dev, CI chạy test với Postgres service", "ADR-001: chọn modular monolith"] },
    { t: "M2 – Nghiệp vụ lõi (3 tuần)", items: ["Catalog có tìm kiếm full-text, variant, tồn kho", "Giỏ hàng (Redis), đặt hàng chống oversell (transaction + lock)", "Thanh toán giả lập có webhook, Idempotency-Key, Outbox"] },
    { t: "M3 – Bảo mật & chất lượng (1 tuần)", items: ["Auth OIDC + RBAC admin/customer", "Testcontainers, e2e Playwright luồng mua hàng, k6 load test", "ZAP baseline + CodeQL + Trivy trong pipeline"] },
    { t: "M4 – Hạ tầng & CD (2 tuần)", items: ["Terraform 2 môi trường, remote state", "GitOps với Argo CD, promotion staging → prod bằng PR", "Canary 10% → 100% với Argo Rollouts, tự động abort khi lỗi"] },
    { t: "M5 – Vận hành (1 tuần)", items: ["SLO: 99.9% checkout thành công, p95 < 400ms", "Dashboard RED, alert burn-rate, runbook", "Game day: tắt Redis/DB replica, viết postmortem"] }
  ],
  rubric: [
    ["Chạy được", "Người khác clone repo và chạy được toàn bộ hệ thống bằng 1 lệnh trong < 10 phút"],
    ["Đúng nghiệp vụ", "Không oversell khi 500 request đồng thời; thanh toán retry không bị trừ tiền hai lần"],
    ["Pipeline", "Merge → production < 15 phút; có cổng duyệt; rollback < 2 phút"],
    ["Bảo mật", "Không có secret trong git; không có CVE CRITICAL; kiểm soát quyền được kiểm chứng bằng test"],
    ["Quan sát được", "Từ một alert tìm được trace và log liên quan trong < 5 phút"],
    ["Tài liệu", "README, sơ đồ C4, ADR, runbook, video demo 5 phút"]
  ]
};

window.CAREER = {
  skills: [
    "Tự xây và deploy một ứng dụng fullstack có auth, DB, cache, job nền",
    "Thiết kế REST API chuẩn và schema DB chuẩn hoá, có index hợp lý",
    "Viết test nhiều tầng; pipeline CI chặn được code lỗi",
    "Đóng gói Docker tối ưu; pipeline CD có staging, duyệt tay, rollback",
    "Dựng hạ tầng bằng Terraform; vận hành cơ bản trên Kubernetes",
    "Gắn log, metric, trace; xử lý sự cố có quy trình",
    "Trình bày một thiết kế hệ thống cùng các đánh đổi trong 45 phút",
    "Dùng AI để tăng năng suất nhưng vẫn review và chịu trách nhiệm với code"
  ],
  portfolio: [
    ["GitHub", "Pin 3–4 repo tốt nhất; README có ảnh chụp, sơ đồ kiến trúc, badge CI, link demo"],
    ["Dự án Capstone", "Demo chạy thật trên domain riêng; video 5 phút giới thiệu kiến trúc và pipeline"],
    ["Blog kỹ thuật", "Viết 5–10 bài về những gì bạn đã giải quyết (ví dụ: 'Chống oversell bằng SELECT FOR UPDATE')"],
    ["CV", "1 trang; mỗi dự án ghi rõ vấn đề, giải pháp và kết quả đo được (p95 giảm 60%, deploy từ 1 giờ xuống 10 phút)"]
  ],
  interview: [
    { t: "Kiến thức nền", q: ["Chuyện gì xảy ra khi gõ URL vào trình duyệt?", "Process khác thread thế nào?", "TCP khác UDP thế nào? HTTP/2 cải tiến gì so với HTTP/1.1?"] },
    { t: "JavaScript / Node.js", q: ["Giải thích event loop và thứ tự chạy của microtask", "Làm sao xử lý tác vụ CPU nặng trong Node?", "Closure là gì? Cho ví dụ gây memory leak"] },
    { t: "Database", q: ["Khi nào index không được dùng?", "Các isolation level và hiện tượng tương ứng", "Giải quyết N+1 query thế nào?", "Thiết kế schema cho hệ thống đặt phòng khách sạn"] },
    { t: "API & Bảo mật", q: ["401 khác 403 thế nào?", "Làm sao để thanh toán idempotent?", "JWT và session: ưu nhược điểm", "Giải thích XSS, CSRF, SQL injection và cách phòng chống"] },
    { t: "DevOps / CI/CD", q: ["Mô tả pipeline CI/CD bạn đã xây", "Blue-green khác canary thế nào?", "Làm sao migrate DB không downtime?", "Readiness khác liveness thế nào?", "Vì sao không nên dùng tag latest?"] },
    { t: "System Design", q: ["Thiết kế URL shortener", "Thiết kế rate limiter", "Thiết kế hệ thống thông báo", "Làm sao đảm bảo không mất sự kiện khi vừa ghi DB vừa publish message?"] }
  ],
  habits: [
    "Học theo dự án: mỗi chương phải ra một sản phẩm có trên GitHub",
    "Quy tắc 30/70: 30% đọc/xem, 70% tự gõ code và làm bài tập",
    "Ghi chép kiểu Feynman: giải thích lại bằng lời của mình trên blog/Notion",
    "Mỗi tuần đọc code một dự án open-source tốt (NestJS, Cal.com, Supabase...)",
    "Tham gia cộng đồng: code review cho nhau, mock interview, đóng góp open-source",
    "Duy trì 15–20 giờ/tuần đều đặn tốt hơn học dồn cuối tuần"
  ]
};
