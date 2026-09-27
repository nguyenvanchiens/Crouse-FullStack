# DevPath: khóa học Backend & Fullstack Engineer

Website khóa học tự học (HTML/CSS/JS thuần, không cần build), giao diện kiểu nền tảng khóa học F8/Udemy. Mục tiêu: học xong có thể tự xây, test, đóng gói, deploy (CI/CD) và vận hành một sản phẩm thật.

Nội dung đối chiếu với roadmap.sh (Backend, DevOps, Full Stack), OWASP Top 10:2025, 12-Factor App, Google SRE. Các phiên bản công cụ và GitHub Action được tra cứu lại vào 26/09/2026.

## Nội dung

| Mục | Chi tiết |
| --- | --- |
| 14 khóa học (chương) | Nền tảng → JS/TS → Frontend → Backend Node/NestJS → Database → Security → Testing → Docker → **CI/CD & DevSecOps** → Cloud & Terraform → Kubernetes → Observability/SRE → System Design → AI cho kỹ sư |
| 350 bài học | Mỗi bài: giải thích chi tiết, ví dụ code, tóm tắt, lỗi thường gặp, 3 câu quiz có giải thích |
| 12 Labs | Dockerfile, Compose, GitHub Actions CI, CD + OIDC + rollback, Terraform AWS, K8s + Gateway API, Argo CD, GitLab CI, Jenkins, Nginx blue-green, Prometheus, Jenkins dựng bằng JCasC |
| Dự án | 1 dự án cuối mỗi chương, 12 bậc dự án và Capstone *ShopFlow* có mốc và tiêu chí chấm |
| Video | 462 video YouTube tuyển chọn cho 314/350 bài (ưu tiên tiếng Việt), xem ngay trong trang hoặc mở trên YouTube |
| Sự nghiệp | Checklist sẵn sàng đi làm, portfolio, câu hỏi phỏng vấn |

Tính năng:
- Trang chủ dạng lưới khóa học, trang chi tiết khóa học, trang học (player) có danh sách bài bên phải.
- Theo dõi tiến độ, quiz lưu kết quả, xuất/nhập tiến độ bằng file JSON.
- Tìm kiếm `Ctrl+K` (gõ không dấu vẫn tìm được), chuyển bài bằng phím ← →.
- Dark mode, responsive, nút sao chép code.
- Video tham khảo: khung YouTube (youtube-nocookie) chỉ tải khi bấm "Phát ngay".

## Chạy

```bash
npm start          # http://localhost:5173
```

Nên chạy qua server thay vì mở thẳng `index.html`, vì nội dung bài học được nạp theo từng chương.

## Kiểm thử

```bash
npm install
npx playwright install chromium
npm test                       # desktop + mobile, gồm accessibility (axe) và kiểm tra nội dung
node tests/validate-lessons.js # kiểm tra định dạng nội dung bài học
npm run verify:videos          # kiểm tra lại video còn tồn tại, đúng tiêu đề/kênh (chạy chậm để tránh bị YouTube chặn)
```

## Deploy lên Cloudflare

Website là trang tĩnh. `npm run build` copy các file cần thiết (`index.html`, `_headers`, `assets/`) vào `dist/`.

### Cách 1: Cloudflare Workers, tự build khi push (khuyến nghị)

1. Vào Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import a repository**, chọn repo này.
2. Điền cấu hình build:
   - Build command: để trống (hoặc `npm run build`, đều được)
   - Deploy command: `npx wrangler deploy`
   - Root directory: để trống

   `wrangler deploy` tự chạy `npm run build` trước khi deploy (khai báo ở trường `build.command` trong `wrangler.jsonc`).
3. Bấm **Deploy**. Từ lần sau, mỗi lần push lên nhánh `main` sẽ tự build và deploy lại.

Cấu hình nằm trong [wrangler.jsonc](wrangler.jsonc): tên Worker là `devpath-course`, phục vụ file tĩnh từ `dist/`.

### Cách 2: Cloudflare Pages

**Workers & Pages** → **Create** → **Pages** → **Connect to Git**, chọn repo, rồi điền:
- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`

### Cách 3: Deploy từ máy

```bash
npx wrangler login
npm run deploy        # wrangler deploy (tự build trước)
npm run preview       # chạy thử bằng môi trường Cloudflare ở máy (http://localhost:8787)
```

Header bảo mật (CSP, X-Frame-Options...) và cache được khai báo trong [_headers](_headers). Muốn chạy test vào bản build Cloudflare, bật `npm run preview` rồi chạy `BASE_URL=http://localhost:8787 npm test`.

## Cấu trúc

- `assets/js/data/phases.js`: chương, phần, bài học (tiêu đề và mô tả ngắn)
- `assets/js/data/lessons/pXX.js`: nội dung chi tiết từng bài của chương pXX
- `assets/js/data/labs.js`: các lab (trong template literal phải viết `\${{ }}` cho cú pháp GitHub Actions)
- `assets/js/data/projects.js`: thang dự án, Capstone, phần sự nghiệp
- `assets/js/app.js`, `assets/css/style.css`: giao diện

Tiến độ được lưu theo id dạng `p03.m1.t2` (chương, phần, bài). Nếu chèn bài vào giữa danh sách, id của các bài phía sau sẽ bị lệch, nên hãy thêm bài mới vào cuối phần.
