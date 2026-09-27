/* Trang "Cách học": các chặng học theo thứ tự, cách học một bài, nhịp học và tiêu chí hoàn thành.
 * Thời lượng mỗi chương (weeks) trong phases.js tính theo 15–20 giờ/tuần, nên 1 tuần ≈ 17,5 giờ học.
 */
window.GUIDE = {
  hoursPerWeek: 17.5,

  paces: [
    { h: 8, t: 'Vừa đi làm, học buổi tối', d: 'Khoảng 1 giờ tối thứ 2–6 và 3 giờ cuối tuần.' },
    { h: 12, t: 'Vừa đi làm, học đều', d: 'Khoảng 1,5 giờ mỗi tối và 4–5 giờ cuối tuần.' },
    { h: 17.5, t: 'Nhịp chuẩn của khóa học', d: '15–20 giờ mỗi tuần, đúng với số tuần ghi ở từng chương.' },
    { h: 35, t: 'Học toàn thời gian', d: 'Khoảng 7 giờ mỗi ngày, 5 ngày một tuần.' }
  ],

  stages: [
    {
      t: 'Nền móng',
      ids: ['p00', 'p01'],
      why: 'Mọi thứ về sau đều đứng trên phần này: terminal, Git, mạng, HTTP và một ngôn ngữ lập trình dùng thành thạo.',
      can: [
        'Làm việc hằng ngày trên terminal Linux, SSH vào máy chủ, đọc log',
        'Dùng Git theo quy trình nhóm: nhánh, merge request, xử lý conflict',
        'Giải thích một request đi từ trình duyệt tới máy chủ như thế nào',
        'Viết chương trình TypeScript có kiểu chặt, chia module, xử lý bất đồng bộ đúng'
      ],
      gate: [
        'Làm xong dự án cuối của chương 00 và chương 01',
        'Tự giải được bài tập cấu trúc dữ liệu mức dễ và trung bình',
        'Quiz của hai chương đúng từ 80% trở lên'
      ]
    },
    {
      t: 'Backend cốt lõi',
      ids: ['p03', 'p04', 'p05', 'p06'],
      why: 'Đây là trái tim của nghề backend: API, database, bảo mật và kiểm thử. Học chậm và kỹ nhất ở chặng này.',
      can: [
        'Thiết kế và viết REST API bằng NestJS có validation, xử lý lỗi, phân trang, tài liệu OpenAPI',
        'Thiết kế schema PostgreSQL chuẩn hoá, đặt index đúng, đọc EXPLAIN, dùng transaction',
        'Làm đăng nhập, phân quyền, chống các lỗi OWASP phổ biến',
        'Viết unit test, integration test với database thật và chặn code lỗi bằng CI'
      ],
      gate: [
        'Task Management API chạy được, có auth, test và README hướng dẫn',
        'Tự giải thích được N+1, isolation level, JWT và refresh token trong 2 phút mỗi chủ đề',
        'Đến đây đã đủ nền để ứng tuyển thực tập hoặc Junior Backend'
      ]
    },
    {
      t: 'Đưa lên production',
      ids: ['p07', 'p08', 'p09'],
      why: 'Code chỉ có giá trị khi chạy được cho người dùng. Chặng này biến bạn thành người tự đóng gói, tự dựng pipeline và tự đưa hệ thống lên cloud.',
      can: [
        'Viết Dockerfile tối ưu, chạy cả hệ thống bằng Docker Compose',
        'Dựng pipeline CI/CD từ merge request tới production bằng GitHub Actions hoặc Jenkins, có duyệt và rollback',
        'Tích hợp quét bảo mật vào pipeline',
        'Dựng hạ tầng AWS bằng Terraform, cấu hình Nginx và TLS'
      ],
      gate: [
        'Làm xong Lab 01–05, Lab 08–10 và ít nhất một trong Lab 12, Lab 13',
        'Pipeline của dự án tự deploy staging, có bước duyệt production và rollback được trong 2 phút',
        'Hạ tầng dựng lại được từ đầu chỉ bằng code'
      ]
    },
    {
      t: 'Vận hành & mở rộng',
      ids: ['p10', 'p11', 'p12'],
      why: 'Từ Junior lên Mid: chạy hệ thống trên Kubernetes, biết nó đang khoẻ hay ốm, và thiết kế được hệ thống chịu tải lớn.',
      can: [
        'Deploy và vận hành ứng dụng trên Kubernetes theo GitOps',
        'Đặt metrics, log, trace, cảnh báo theo SLO và xử lý sự cố có quy trình',
        'Thiết kế hệ thống: cache, queue, sharding, các mẫu chống lỗi dây chuyền',
        'Trả lời được một buổi phỏng vấn system design 45 phút'
      ],
      gate: [
        'Làm xong Lab 06, Lab 07 và Lab 11',
        'URL Shortener chịu tải có dashboard p95 và cảnh báo',
        'Tự trình bày được ít nhất 3 bài thiết kế kinh điển của chương 12'
      ]
    },
    {
      t: 'Hoàn thiện & đi làm',
      ids: ['p13'],
      why: 'Dùng AI đúng cách trong công việc, rồi gom mọi thứ vào một sản phẩm hoàn chỉnh để chứng minh năng lực.',
      can: [
        'Dùng AI để tăng tốc mà vẫn tự kiểm soát chất lượng code',
        'Tích hợp LLM vào backend: gọi API, streaming, RAG, tool calling',
        'Hoàn thành Capstone ShopFlow và portfolio để ứng tuyển'
      ],
      gate: [
        'Capstone đạt các tiêu chí chấm ở trang Dự án',
        'Checklist ở trang Sự nghiệp được đánh dấu gần hết'
      ]
    }
  ],

  // Frontend không nằm trên đường chính của backend nhưng vẫn cần ở mức đủ dùng
  frontend: {
    id: 'p02',
    t: 'Frontend (chương 02): học ở mức đủ dùng',
    d: 'Mục tiêu là backend nên không cần học sâu React ngay. Học phần 1–2 (HTML/CSS, JavaScript trong trình duyệt) sau chặng Nền móng để hiểu client gọi API thế nào, CORS, cookie. Phần React và Next.js để lại, học khi cần làm fullstack hoặc khi làm Capstone.'
  },

  loop: [
    ['Đọc mục tiêu và phần tóm tắt trước', 'Biết bài này trả lời câu hỏi gì trước khi đọc chi tiết. Mất khoảng 2 phút.'],
    ['Xem video nếu bài có', 'Video giúp nắm bức tranh chung. Có thể bật tốc độ 1,25x; video tiếng Anh có thể bật phụ đề tự động tiếng Việt.'],
    ['Đọc kỹ và tự gõ lại code', 'Không copy. Gõ lại từng ví dụ, chạy thử, sửa một chỗ để xem điều gì thay đổi. Đây là bước quan trọng nhất.'],
    ['Làm quiz, sai thì đọc lại giải thích', 'Quiz không để lấy điểm mà để phát hiện chỗ hiểu nhầm. Sai câu nào thì đọc lại đúng đoạn đó.'],
    ['Ghi 3 dòng bằng lời của mình', 'Bài này nói gì, dùng khi nào, lỗi hay gặp là gì. Giải thích được bằng lời mình mới là hiểu.'],
    ['Đánh dấu hoàn thành', 'Chỉ đánh dấu khi đã làm đủ các bước trên. Trang Tiến độ dựa vào đây để biết bạn đang ở đâu.']
  ],

  // Tuần học mẫu ở nhịp 10–12 giờ/tuần
  week: [
    ['Thứ 2 – 6', '1–1,5 giờ mỗi tối', 'Học 1 bài mỗi tối theo vòng 6 bước. Tối thứ 6 làm lại quiz của các bài trong tuần.'],
    ['Thứ 7', '3 giờ', 'Làm lab hoặc phần dự án của chương. Push code lên GitHub.'],
    ['Chủ nhật', '1–2 giờ', 'Ôn lại quiz của tuần trước (ôn cách quãng), viết ghi chú tổng kết tuần, lên kế hoạch tuần sau.']
  ],

  rules: [
    'Học theo thứ tự chặng. Chương sau dùng kiến thức chương trước; nhảy cóc sẽ phải quay lại.',
    'Không sang chương mới khi chưa làm dự án cuối của chương cũ. Dự án là nơi kiến thức thành kỹ năng.',
    'Thực hành nhiều hơn đọc: khoảng 60% thời gian là gõ code, làm lab, làm dự án.',
    'Mỗi tuần push code lên GitHub ít nhất một lần. Sau một năm đó là portfolio của bạn.',
    'Bí quá 30 phút thì hỏi người khác hoặc hỏi AI, nhưng sau đó tự gõ lại lời giải mà không nhìn.',
    'Ôn lại quiz của tuần trước vào cuối mỗi tuần. Nhắc lại cách quãng giúp nhớ lâu hơn đọc lại nhiều lần.',
    'Chậm mà đều hơn nhanh rồi bỏ. Học 1 giờ mỗi ngày tốt hơn học 10 giờ một ngày rồi nghỉ hai tuần.'
  ],

  // Lối tắt cho người đang đi làm cần một kỹ năng ngay
  shortcuts: [
    {
      t: 'Công ty đang dùng GitLab + Jenkins, cần hiểu ngay',
      steps: [
        ['p00', 'Chương 00, phần 3–4: Linux & Terminal, Git & GitHub'],
        ['p07', 'Chương 07: Docker & Container'],
        ['p08', 'Chương 08, phần 1 và phần 7: khái niệm CI/CD và Jenkins thực chiến (đọc bài 7.12, 7.13 trước)'],
        ['lab13', 'Lab 13: GitLab → Jenkins với nhánh builds/dev và builds/prod']
      ],
      note: 'Khoảng 3–4 tuần ở nhịp 10 giờ/tuần. Xong thì quay lại học theo thứ tự chặng.'
    },
    {
      t: 'Được giao viết API ngay',
      steps: [
        ['p00', 'Chương 00, phần 2: Internet, HTTP & Web'],
        ['p03', 'Chương 03: Backend Core với Node.js & NestJS'],
        ['p04', 'Chương 04, phần 1–3: SQL, thiết kế schema, transaction'],
        ['p05', 'Chương 05, phần 1–2: Authentication, Authorization']
      ],
      note: 'Học song song với việc làm; mỗi bài học xong áp dụng luôn vào task thật.'
    }
  ],

  mastery: [
    'Tự thiết kế và viết một API hoàn chỉnh: validation, xử lý lỗi, phân trang, tài liệu, versioning',
    'Thiết kế schema database, tối ưu query chậm bằng index và EXPLAIN, xử lý đúng concurrency',
    'Làm auth an toàn và phân quyền, tránh được các lỗi OWASP Top 10',
    'Viết test nhiều tầng và giữ codebase sạch khi dự án lớn dần',
    'Đóng gói bằng Docker và tự dựng pipeline CI/CD tới production, có rollback',
    'Dựng hạ tầng cloud bằng code và chạy ứng dụng trên Kubernetes',
    'Giám sát hệ thống, đặt cảnh báo, xử lý sự cố và viết postmortem',
    'Thiết kế hệ thống chịu tải: cache, queue, scale, chống lỗi dây chuyền',
    'Giải thích được quyết định kỹ thuật của mình và đánh đổi của nó'
  ]
};
