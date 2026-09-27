/* Lộ trình Fullstack / Backend / DevOps
 * Tham chiếu: roadmap.sh (backend, devops, full-stack), OWASP, 12factor, Google SRE book, DDIA.
 * Cấu trúc: phase -> modules -> topics [tiêu đề, giải thích]
 */
window.PHASES = [
  {
    id: "p00",
    title: "Nền tảng máy tính & Internet",
    tag: "Foundation",
    weeks: 4,
    summary: "Hiểu máy tính, mạng và công cụ hằng ngày. Đây là phần mọi thứ phía sau dựa vào: không vững nó thì debug production sẽ rất vất vả.",
    outcomes: [
      "Giải thích được chuyện gì xảy ra từ lúc gõ URL tới khi trang hiển thị",
      "Làm việc thành thạo trên Linux terminal và qua SSH",
      "Dùng Git chuyên nghiệp: branch, rebase, giải quyết conflict, review PR"
    ],
    modules: [
      {
        t: "Máy tính & Hệ điều hành",
        topics: [
          ["CPU, RAM, Disk, I/O", "Độ trễ từng tầng (L1 cache ~1ns, RAM ~100ns, SSD ~100µs, mạng ~ms). Hiểu vì sao I/O là nút thắt của hầu hết backend."],
          ["Process vs Thread", "Process có vùng nhớ riêng, thread chia sẻ bộ nhớ. Context switch, race condition, deadlock."],
          ["Concurrency vs Parallelism", "Concurrency là xử lý xen kẽ nhiều việc, parallelism là chạy thật sự đồng thời trên nhiều core. Node.js dùng concurrency qua event loop."],
          ["Stack, Heap & Garbage Collection", "Biến cục bộ nằm trên stack, object nằm trên heap. Memory leak trong ngôn ngữ có GC xảy ra do vẫn còn giữ tham chiếu."],
          ["File system & quyền truy cập", "Inode, đường dẫn tuyệt đối/tương đối, quyền rwx, owner/group, file descriptor."],
          ["Encoding: ASCII, UTF-8, Base64", "Vì sao tiếng Việt bị lỗi font, byte vs ký tự, Base64 chỉ là mã hoá chứ KHÔNG phải mã hoá bảo mật."],
          ["Thiết lập môi trường lập trình", "VS Code và extension cần thiết, cài Node bằng trình quản lý phiên bản (fnm/nvm), Git, terminal, WSL trên Windows."]
        ],
        practice: ["Dùng htop quan sát CPU/RAM khi chạy một script vòng lặp vô hạn", "Viết chương trình tạo 2 thread cùng tăng một biến đếm và quan sát race condition"],
        res: [["Teach Yourself CS", "https://teachyourselfcs.com/"], ["Latency numbers every programmer should know", "https://gist.github.com/jboner/2841832"]]
      },
      {
        t: "Internet, HTTP & Web",
        topics: [
          ["Internet hoạt động thế nào", "Gói tin, IP, routing, ISP, BGP ở mức khái niệm. TCP bắt tay 3 bước, UDP không kết nối."],
          ["Mô hình OSI & TCP/IP", "7 tầng OSI vs 4 tầng TCP/IP. Biết lỗi đang nằm ở tầng nào (DNS? TCP? TLS? HTTP?)."],
          ["DNS", "Resolver → Root → TLD → Authoritative. Bản ghi A, AAAA, CNAME, MX, TXT, NS. TTL và cache DNS."],
          ["HTTP/1.1, HTTP/2, HTTP/3", "Method, status code, header, body. Keep-alive, multiplexing (H2), QUIC (H3). Idempotent vs safe methods."],
          ["HTTPS & TLS", "Chứng chỉ, CA, TLS handshake, SNI. Vì sao phải HTTPS kể cả API nội bộ."],
          ["Trình duyệt hoạt động thế nào", "Parse HTML → DOM, CSSOM → render tree → layout → paint. Same-origin policy."],
          ["Domain & Hosting", "Đăng ký domain, trỏ DNS, shared hosting vs VPS vs cloud vs PaaS."],
          ["IP, subnet/CIDR, NAT & cổng","IPv4/IPv6, địa chỉ private, ký hiệu CIDR (/16, /24), NAT, port và socket. Nền để hiểu VPC, security group và mạng Docker."]
        ],
        practice: ["Dùng `dig`, `curl -v`, `openssl s_client` để phân tích một request tới google.com", "Mở DevTools > Network, giải thích từng cột Timing"],
        res: [["MDN – HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP"], ["How DNS works (comic)", "https://howdns.works/"], ["roadmap.sh – Backend", "https://roadmap.sh/backend"]]
      },
      {
        t: "Linux & Terminal",
        topics: [
          ["Điều hướng & thao tác file", "ls, cd, cp, mv, rm, find, tree, du, df. Hiểu cấu trúc /etc, /var, /usr, /home, /tmp."],
          ["Quyền & người dùng", "chmod, chown, sudo, nhóm người dùng, umask. Nguyên tắc least privilege."],
          ["Process & service", "ps, top/htop, kill, signal (SIGTERM vs SIGKILL), systemd, journalctl."],
          ["Xử lý văn bản", "Pipe, redirect, grep, sed, awk, cut, sort, uniq, xargs, jq. Đọc log cực nhanh."],
          ["SSH", "Tạo key ed25519, ~/.ssh/config, scp/rsync, tắt đăng nhập bằng mật khẩu, port forwarding."],
          ["Bash scripting", "Biến, if/for, hàm, exit code, `set -euo pipefail`, cron."],
          ["Công cụ mạng", "curl, wget, ping, traceroute, dig, ss/netstat, nc, tcpdump cơ bản."],
          ["Package manager & editor", "apt/dnf, brew; dùng được vim hoặc nano để sửa file trên server."]
        ],
        practice: ["Thuê 1 VPS rẻ (hoặc WSL/VM), tạo user mới, tắt root login, cấu hình SSH key", "Viết script backup thư mục, nén, xoá bản cũ > 7 ngày, chạy bằng cron"],
        res: [["The Missing Semester (MIT)", "https://missing.csail.mit.edu/"], ["Linux Journey", "https://labex.io/linuxjourney"], ["roadmap.sh – Linux", "https://roadmap.sh/linux"]]
      },
      {
        t: "Git & GitHub chuyên nghiệp",
        topics: [
          ["Mô hình dữ liệu của Git", "Blob, tree, commit, ref, HEAD. Commit là snapshot, branch chỉ là con trỏ."],
          ["Branch, merge, rebase", "Fast-forward vs merge commit vs rebase. Khi nào KHÔNG được rebase (nhánh đã chia sẻ)."],
          ["Giải quyết conflict", "Đọc conflict markers, dùng mergetool, `git rerere`."],
          ["Workflow nhóm", "Git Flow vs GitHub Flow vs Trunk-based. Pull Request, code review, branch protection."],
          ["Conventional Commits & SemVer", "feat/fix/chore/BREAKING CHANGE → tự động sinh version & changelog trong CI/CD."],
          ["Lệnh nâng cao", "rebase -i, cherry-pick, stash, bisect, reflog (cứu commit bị mất), tag."],
          [".gitignore & bảo mật repo", "Không bao giờ commit .env/secret. Nếu lỡ commit thì phải rotate secret, không chỉ xoá commit."]
        ],
        practice: ["Tạo repo, 2 nhánh sửa cùng dòng, tự tạo conflict và giải quyết bằng cả merge lẫn rebase", "Dùng `git bisect` tìm commit gây bug trong repo mẫu"],
        res: [["Pro Git Book", "https://git-scm.com/book/en/v2"], ["Learn Git Branching", "https://learngitbranching.js.org/"], ["Conventional Commits", "https://www.conventionalcommits.org/"]]
      }
    ],
    project: {
      title: "Dotfiles & Bootstrap Script",
      desc: "Một repo GitHub chứa script bash tự cài môi trường dev (git, node, docker, zsh) trên Ubuntu mới, kèm cấu hình SSH và alias.",
      reqs: ["Chạy lại nhiều lần không lỗi (idempotent)", "Dùng `set -euo pipefail` và log rõ ràng", "README hướng dẫn, commit theo Conventional Commits"]
    },
    checkpoint: ["Giải thích chi tiết luồng URL → trang web (DNS, TCP, TLS, HTTP, render)", "SSH vào server, tìm process chiếm nhiều RAM nhất và đọc log của một service", "Rebase một nhánh feature có conflict mà không làm mất commit"]
  },

  {
    id: "p01",
    title: "Lập trình cốt lõi: JavaScript, TypeScript & Tư duy",
    tag: "Programming",
    weeks: 7,
    summary: "Chọn một ngôn ngữ và học tới mức hiểu cách nó chạy bên trong. Lộ trình này dùng JavaScript/TypeScript vì một ngôn ngữ dùng được cho cả frontend lẫn backend. Nguyên lý học được áp dụng được cho Go, Java hay Python.",
    outcomes: [
      "Hiểu event loop, closure, prototype, async ở mức giải thích được cho người khác",
      "Viết TypeScript strict, dùng generics và kiểu an toàn",
      "Giải được bài toán thuật toán mức Easy–Medium, áp dụng SOLID & design patterns"
    ],
    modules: [
      {
        t: "JavaScript chuyên sâu",
        topics: [
          ["Kiểu dữ liệu & ép kiểu", "Primitive vs reference, == vs ===, truthy/falsy, NaN, số thực dấu phẩy động (0.1+0.2)."],
          ["Scope, hoisting, closure", "Lexical scope, TDZ với let/const, closure để đóng gói trạng thái."],
          ["this, prototype, class", "4 quy tắc binding của this, prototype chain, class chỉ là cú pháp đường (syntactic sugar)."],
          ["Event loop", "Call stack, task queue, microtask (Promise) vs macrotask (setTimeout). Dự đoán thứ tự log."],
          ["Promise & async/await", "Promise.all/allSettled/race/any, xử lý lỗi, tránh await tuần tự không cần thiết."],
          ["Modules", "ESM vs CommonJS, import động, tree-shaking."],
          ["Xử lý mảng & object bất biến", "map/filter/reduce, spread, structuredClone, tránh mutate state."],
          ["Debugging: đọc lỗi & dùng debugger", "Đọc stack trace, đặt breakpoint trong VS Code, node --inspect, thu hẹp phạm vi lỗi thay vì đoán mò."]
        ],
        practice: ["Tự cài đặt Promise.all và debounce/throttle", "Giải 10 câu đố thứ tự event loop"],
        res: [["javascript.info", "https://javascript.info/"], ["You Don't Know JS", "https://github.com/getify/You-Dont-Know-JS"], ["Loupe – event loop visualizer", "http://latentflip.com/loupe/"]]
      },
      {
        t: "TypeScript",
        topics: [
          ["Kiểu cơ bản, interface vs type", "Khi nào dùng interface (mở rộng được) và khi nào dùng type (union, mapped type)."],
          ["Generics", "Hàm/class generic, ràng buộc `extends`, suy luận kiểu."],
          ["Union, narrowing, discriminated union", "Mô hình hoá trạng thái (loading/success/error) để compiler bắt lỗi thay bạn."],
          ["Utility & mapped types", "Partial, Pick, Omit, Record, ReturnType, keyof, typeof, conditional types."],
          ["tsconfig strict", "strict, noUncheckedIndexedAccess, paths, module resolution."],
          ["Validation lúc runtime", "Kiểu TS mất khi chạy. Dùng Zod để validate input từ bên ngoài và suy ra kiểu."]
        ],
        practice: ["Viết type-safe event emitter bằng generics", "Làm 20 bài type-challenges mức easy"],
        res: [["TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"], ["type-challenges", "https://github.com/type-challenges/type-challenges"], ["Zod", "https://zod.dev/"]]
      },
      {
        t: "Cấu trúc dữ liệu & Giải thuật",
        topics: [
          ["Big-O", "Độ phức tạp thời gian/bộ nhớ, best/worst/amortized."],
          ["Array, Hash Map, Set", "Hash map O(1) trung bình. Đây là cấu trúc được dùng nhiều nhất khi làm backend."],
          ["Stack, Queue, Linked List", "Ứng dụng: undo, BFS, LRU cache."],
          ["Tree, BST, Heap", "Duyệt cây, heap cho top-K / priority queue. B-Tree là nền của database index."],
          ["Graph: BFS, DFS", "Biểu diễn danh sách kề, tìm đường ngắn nhất không trọng số, phát hiện chu trình."],
          ["Sắp xếp & tìm kiếm nhị phân", "Merge/quick sort, binary search trên đáp án."],
          ["Kỹ thuật phổ biến", "Two pointers, sliding window, prefix sum, recursion & backtracking, DP cơ bản."]
        ],
        practice: ["Giải NeetCode 75 (tối thiểu 50 bài)", "Tự cài LRU Cache với Map"],
        res: [["NeetCode Roadmap", "https://neetcode.io/roadmap"], ["VisuAlgo", "https://visualgo.net/"], ["roadmap.sh – DSA", "https://roadmap.sh/datastructures-and-algorithms"]]
      },
      {
        t: "Thiết kế phần mềm & Clean Code",
        topics: [
          ["OOP", "Encapsulation, abstraction, inheritance, polymorphism, và vì sao nên ưu tiên composition."],
          ["SOLID", "Đặc biệt là SRP và DIP. Chúng là nền tảng của kiến trúc layered/hexagonal ở backend."],
          ["Design Patterns thiết yếu", "Factory, Strategy, Observer, Adapter, Decorator, Singleton, Repository."],
          ["Dependency Injection", "Tách phụ thuộc giúp test được. NestJS dùng DI container."],
          ["Functional programming", "Pure function, immutability, higher-order function, composition."],
          ["Clean code & refactoring", "Đặt tên, hàm ngắn, tránh side-effect ẩn, code smells, refactor an toàn nhờ test."]
        ],
        practice: ["Refactor một file 300 dòng thành các module theo SRP", "Cài Strategy pattern cho tính phí vận chuyển"],
        res: [["Refactoring.Guru", "https://refactoring.guru/"], ["Martin Fowler – Refactoring", "https://refactoring.com/"]]
      }
    ],
    project: {
      title: "task-cli bằng TypeScript",
      desc: "Ứng dụng dòng lệnh quản lý công việc (add/update/delete/list theo trạng thái), lưu JSON, theo đề bài roadmap.sh.",
      reqs: ["TypeScript strict, không dùng `any`", "Unit test bằng Vitest cho toàn bộ logic", "Publish lên npm hoặc chạy qua `npx`"]
    },
    checkpoint: ["Giải thích output của đoạn code trộn setTimeout, Promise, async", "Viết hàm generic `groupBy<T, K>` đúng kiểu", "Giải 2 bài LeetCode Medium trong 45 phút"]
  },

  {
    id: "p02",
    title: "Frontend hiện đại: HTML/CSS, React & Next.js",
    tag: "Frontend",
    weeks: 7,
    summary: "Fullstack nghĩa là tự dựng được giao diện dùng tốt, responsive và truy cập được (accessibility). Trọng tâm là React vì nó có hệ sinh thái lớn nhất và nhiều việc làm nhất.",
    outcomes: [
      "Dựng layout responsive bằng Flexbox/Grid/Tailwind, đạt chuẩn accessibility cơ bản",
      "Xây SPA React có routing, form, server state và xử lý lỗi",
      "Hiểu SSR/SSG/RSC trong Next.js và tối ưu Core Web Vitals"
    ],
    modules: [
      {
        t: "HTML, CSS & Tailwind",
        topics: [
          ["HTML ngữ nghĩa & Accessibility", "header/main/nav/article, label cho input, alt ảnh, ARIA khi cần, điều hướng bàn phím."],
          ["Box model & Specificity", "margin/padding/border, box-sizing, cascade, specificity, CSS variables."],
          ["Flexbox & Grid", "Flex cho layout 1 chiều, Grid cho 2 chiều. Làm được mọi layout phổ biến."],
          ["Responsive, mobile-first", "Media query, clamp(), đơn vị rem/vw, ảnh responsive."],
          ["Tailwind CSS", "Utility-first, cấu hình theme, component hoá bằng React thay vì @apply tràn lan."]
        ],
        practice: ["Clone lại trang landing của một sản phẩm SaaS thật", "Chạy Lighthouse và đạt Accessibility ≥ 95"],
        res: [["MDN – Learn web development", "https://developer.mozilla.org/en-US/docs/Learn"], ["CSS Tricks – Flexbox guide", "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"], ["Tailwind CSS", "https://tailwindcss.com/docs"]]
      },
      {
        t: "JavaScript trong trình duyệt",
        topics: [
          ["DOM & Events", "Query, tạo phần tử, event bubbling/capturing, event delegation."],
          ["Fetch & gọi API", "fetch, AbortController, xử lý lỗi HTTP, retry. Hiểu lỗi CORS xuất phát từ đâu."],
          ["Lưu trữ phía client", "Cookie vs localStorage vs sessionStorage vs IndexedDB. Không lưu token nhạy cảm ở localStorage."],
          ["Hiệu năng web", "Core Web Vitals (LCP, INP, CLS), lazy loading, code splitting, cache."]
        ],
        practice: ["Viết ứng dụng Todo bằng vanilla JS có lọc và lưu localStorage"],
        res: [["web.dev – Learn Performance", "https://web.dev/learn/performance"]]
      },
      {
        t: "React",
        topics: [
          ["Component, props, state", "Luồng dữ liệu một chiều, lifting state up, key trong list."],
          ["Hooks", "useState, useEffect (đồng bộ với bên ngoài chứ không phải lifecycle), useRef, useMemo, useCallback, custom hooks."],
          ["Rendering & Reconciliation", "Khi nào component re-render, React.memo, tránh tối ưu sớm."],
          ["Form & validation", "React Hook Form + Zod, dùng chung schema với backend."],
          ["Routing", "React Router / TanStack Router, nested routes, protected routes."],
          ["State management", "Local state → Context → Zustand/Redux Toolkit. Tách client state với server state."],
          ["Server state", "TanStack Query: cache, refetch, optimistic update, pagination."],
          ["TypeScript cho React","Kiểu cho props, children, event, ref, custom hook và component generic; khi nào để TypeScript tự suy luận."]
        ],
        practice: ["Xây một dashboard gọi API công khai, có loading/error/empty state đầy đủ"],
        res: [["react.dev", "https://react.dev/learn"], ["TanStack Query", "https://tanstack.com/query/latest"]]
      },
      {
        t: "Next.js & công cụ",
        topics: [
          ["CSR / SSR / SSG / ISR / RSC", "Chọn chiến lược render theo nhu cầu SEO, độ mới dữ liệu, hiệu năng."],
          ["App Router & Server Actions", "Layout, loading/error boundary, server component vs client component."],
          ["Package manager & bundler", "npm/pnpm, lockfile, semver range, Vite, monorepo cơ bản (Turborepo)."],
          ["Testing frontend", "Vitest + Testing Library (test hành vi, không test chi tiết cài đặt), Playwright e2e."],
          ["Deploy frontend lên PaaS", "Vercel, Netlify, Cloudflare Pages/Workers: build từ Git, preview theo PR, biến môi trường, domain riêng."]
        ],
        practice: ["Chuyển dashboard sang Next.js, trang chi tiết dùng SSR, trang blog dùng SSG"],
        res: [["Next.js Docs", "https://nextjs.org/docs"], ["Testing Library", "https://testing-library.com/"], ["Playwright", "https://playwright.dev/"]]
      }
    ],
    project: {
      title: "Dashboard quản lý (React + TanStack Query)",
      desc: "Ứng dụng quản trị có đăng nhập giả lập, bảng dữ liệu phân trang/lọc/sắp xếp, form tạo/sửa, biểu đồ. Deploy lên Vercel.",
      reqs: ["Responsive, hỗ trợ dark mode, Lighthouse ≥ 90 mọi hạng mục", "Có test component và 1 luồng e2e Playwright", "Xử lý đầy đủ loading/error/empty state"]
    },
    checkpoint: ["Dựng layout trang từ design Figma trong 2 giờ", "Giải thích vì sao useEffect chạy 2 lần trong StrictMode", "So sánh SSR và RSC, cho ví dụ lúc nào dùng cái nào"]
  },

  {
    id: "p03",
    title: "Backend Core với Node.js & NestJS",
    tag: "Backend",
    weeks: 8,
    summary: "Đây là trọng tâm của lộ trình. Bạn sẽ hiểu runtime, kiến trúc phân lớp, thiết kế API chuẩn, xử lý nền và real-time. Ví dụ dùng NestJS vì kiến trúc của nó giống Spring/.NET, sau này chuyển stack dễ hơn.",
    outcomes: [
      "Thiết kế và xây REST API chuẩn: status code, phân trang, versioning, idempotency, có OpenAPI",
      "Tổ chức code theo layer (controller, service, repository), có DI, validation và xử lý lỗi tập trung",
      "Xây được job nền, WebSocket, upload file, gửi email"
    ],
    modules: [
      {
        t: "Node.js runtime",
        topics: [
          ["V8 & libuv", "V8 chạy JS, libuv lo I/O bất đồng bộ và thread pool (fs, crypto, dns)."],
          ["Các pha của event loop", "timers → pending → poll → check → close. Code CPU nặng sẽ chặn toàn bộ server."],
          ["Streams & Buffers", "Xử lý file/response lớn mà không nạp hết vào RAM, backpressure, pipeline()."],
          ["Worker threads & Cluster", "Tách tác vụ CPU-bound, tận dụng đa core (hoặc để container/K8s scale thay)."],
          ["Cấu hình & biến môi trường", "Validate env lúc khởi động (fail fast), không hard-code config."],
          ["Graceful shutdown", "Bắt SIGTERM, ngừng nhận request, đóng DB/queue rồi mới thoát. Bắt buộc khi chạy trên Kubernetes."],
          ["Profiling & chẩn đoán Node.js","CPU profile (--cpu-prof) và flame graph, heap snapshot tìm memory leak, đo event loop delay, AsyncLocalStorage cho request context."]
        ],
        practice: ["Dùng stream để export 1 triệu dòng CSV với RAM < 100MB", "Đo xem một vòng lặp đồng bộ 2 giây ảnh hưởng thế nào tới các request khác"],
        res: [["Node.js Docs – Event loop", "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick"], ["Node.js Best Practices", "https://github.com/goldbergyoni/nodebestpractices"], ["roadmap.sh – Node.js", "https://roadmap.sh/nodejs"]]
      },
      {
        t: "Framework & kiến trúc ứng dụng",
        topics: [
          ["Express & middleware", "Vòng đời request, thứ tự middleware, error middleware."],
          ["NestJS: Module, Controller, Provider", "DI container, scope, lifecycle hooks, Guards, Interceptors, Pipes, Filters."],
          ["Kiến trúc phân lớp", "Controller (HTTP) → Service (nghiệp vụ) → Repository (dữ liệu). Nghiệp vụ không phụ thuộc framework."],
          ["Validation & DTO", "class-validator/Zod tại biên hệ thống, whitelist field và chặn mass-assignment."],
          ["Xử lý lỗi tập trung", "Domain error → HTTP error, format lỗi thống nhất (RFC 9457 Problem Details), không lộ stack trace."],
          ["Structured logging", "Pino/Winston log JSON, request-id/correlation-id, log level, không log dữ liệu nhạy cảm."],
          ["12-Factor App", "Config qua env, stateless process, log ra stdout, dev/prod parity. Đây là nền tảng để làm CI/CD."]
        ],
        practice: ["Xây cùng một API bằng Express thuần và NestJS, so sánh"],
        res: [["NestJS Docs", "https://docs.nestjs.com/"], ["The Twelve-Factor App", "https://12factor.net/"], ["RFC 9457 Problem Details", "https://www.rfc-editor.org/rfc/rfc9457"]]
      },
      {
        t: "Thiết kế API",
        topics: [
          ["Nguyên tắc REST", "Resource là danh từ số nhiều, dùng đúng method, quan hệ lồng nhau tối đa 2 cấp, HATEOAS ở mức khái niệm."],
          ["Status code chuẩn", "200/201/204, 400/401/403/404/409/422/429, 500/502/503. Phân biệt 401 và 403."],
          ["Phân trang, lọc, sắp xếp", "Offset vs cursor pagination (cursor ổn định và nhanh hơn với dữ liệu lớn)."],
          ["Versioning & tương thích ngược", "URL /v1 hoặc header; không phá vỡ client cũ; deprecation policy."],
          ["Idempotency", "PUT/DELETE vốn idempotent; POST thanh toán cần Idempotency-Key để retry an toàn."],
          ["OpenAPI / Swagger", "API-first, sinh docs và client SDK tự động, contract giữa FE và BE."],
          ["GraphQL", "Schema, resolver, DataLoader chống N+1, khi nào nên và không nên dùng."],
          ["gRPC & Protobuf", "Giao tiếp service-to-service hiệu năng cao, streaming, định nghĩa schema chặt."],
          ["SOAP & tích hợp hệ thống cũ", "WSDL, XML envelope, SOAP Fault; gọi dịch vụ SOAP của ngân hàng/đối tác từ Node và bọc lại bằng Anti-Corruption Layer."]
        ],
        practice: ["Viết OpenAPI spec trước, sau đó mới cài đặt (API-first)", "Thêm cursor pagination và Idempotency-Key cho endpoint tạo đơn hàng"],
        res: [["Microsoft REST API Guidelines", "https://github.com/microsoft/api-guidelines"], ["OpenAPI Spec", "https://spec.openapis.org/oas/latest.html"], ["roadmap.sh – API Design", "https://roadmap.sh/api-design"]]
      },
      {
        t: "Real-time & xử lý nền",
        topics: [
          ["WebSocket", "Kết nối 2 chiều, Socket.IO, scale nhiều instance bằng Redis adapter."],
          ["Server-Sent Events & Long polling", "SSE đơn giản cho luồng một chiều (thông báo, streaming AI)."],
          ["Background jobs", "BullMQ + Redis: retry, backoff, dead-letter, concurrency, job idempotent."],
          ["Scheduled jobs", "Cron, và tránh chạy trùng khi có nhiều instance (distributed lock)."],
          ["Upload file", "Multipart, giới hạn kích thước, kiểm tra MIME, upload thẳng lên S3 bằng presigned URL."],
          ["Email & thông báo", "SMTP/SES, template, gửi qua queue chứ không gửi trong request."]
        ],
        practice: ["Làm chức năng export báo cáo chạy nền, xong thì báo cho người dùng qua WebSocket"],
        res: [["BullMQ Docs", "https://docs.bullmq.io/"], ["MDN – Server-sent events", "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events"]]
      }
    ],
    project: {
      title: "Task Management API (NestJS)",
      desc: "API quản lý dự án và công việc nhiều người dùng: projects, tasks, comments, gắn thẻ, đính kèm file, thông báo real-time.",
      reqs: ["OpenAPI đầy đủ, lỗi theo Problem Details", "Cursor pagination, filter, sort; Idempotency-Key cho POST", "Job nền gửi email nhắc deadline; WebSocket thông báo; graceful shutdown"]
    },
    checkpoint: ["Thiết kế endpoint cho luồng đặt hàng và thanh toán, trả lời vì sao chọn từng status code", "Giải thích điều gì xảy ra khi Pod nhận SIGTERM giữa lúc đang xử lý request", "Xây CRUD có validation, log và test trong 1 buổi"]
  },

  {
    id: "p04",
    title: "Database: PostgreSQL, Modeling, Redis & NoSQL",
    tag: "Data",
    weeks: 7,
    summary: "Phần lớn vấn đề hiệu năng và mất dữ liệu nằm ở tầng database. Học SQL thật sâu, hiểu index, transaction và cách migrate không downtime.",
    outcomes: [
      "Viết SQL phức tạp (JOIN, CTE, window function) và đọc được EXPLAIN ANALYZE",
      "Thiết kế schema chuẩn hoá, chọn index đúng, xử lý concurrency bằng transaction và lock",
      "Dùng Redis cho cache, rate limit, lock; biết khi nào nên dùng NoSQL"
    ],
    modules: [
      {
        t: "SQL & PostgreSQL",
        topics: [
          ["Truy vấn cơ bản đến nâng cao", "SELECT, JOIN các loại, GROUP BY/HAVING, subquery, UNION."],
          ["CTE & Window functions", "WITH, recursive CTE (cây danh mục), ROW_NUMBER, RANK, LAG, SUM OVER."],
          ["Ràng buộc", "PK, FK (ON DELETE), UNIQUE, CHECK, NOT NULL. Để DB bảo vệ tính toàn vẹn dữ liệu."],
          ["Kiểu dữ liệu", "uuid, timestamptz (luôn lưu UTC), numeric cho tiền (không dùng float), jsonb, enum, array."],
          ["View, Function, Trigger", "Dùng có chừng mực, tránh giấu nghiệp vụ vào DB."]
        ],
        practice: ["Làm hết bài tập pgexercises.com", "Viết báo cáo doanh thu theo tháng có % tăng trưởng dùng window function"],
        res: [["PostgreSQL Docs", "https://www.postgresql.org/docs/current/"], ["PostgreSQL Exercises", "https://pgexercises.com/"], ["roadmap.sh – PostgreSQL", "https://roadmap.sh/postgresql-dba"]]
      },
      {
        t: "Thiết kế schema & hiệu năng",
        topics: [
          ["ERD & quan hệ", "1-1, 1-n, n-n qua bảng trung gian; soft delete; audit columns."],
          ["Chuẩn hoá & phi chuẩn hoá", "1NF → 3NF/BCNF; phi chuẩn hoá có chủ đích để tăng tốc đọc."],
          ["Index", "B-tree, composite (thứ tự cột quan trọng), partial, covering (INCLUDE), GIN cho jsonb/full-text. Index làm chậm ghi."],
          ["EXPLAIN ANALYZE", "Seq Scan vs Index Scan, cost, rows ước lượng vs thực tế, cập nhật thống kê bằng ANALYZE."],
          ["Vấn đề N+1", "Nhận diện trong log ORM, sửa bằng JOIN/eager loading/DataLoader."],
          ["Connection pooling", "Giới hạn kết nối, PgBouncer, cấu hình pool size khi chạy nhiều replica."],
          ["Replication, HA & partitioning PostgreSQL","Streaming vs logical replication, replication lag, failover với dịch vụ managed/Patroni, declarative partitioning và dọn dữ liệu cũ."]
        ],
        practice: ["Seed 1 triệu đơn hàng, đo truy vấn trước và sau khi thêm index, ghi lại kết quả"],
        res: [["Use The Index, Luke", "https://use-the-index-luke.com/"], ["explain.dalibo.com", "https://explain.dalibo.com/"]]
      },
      {
        t: "Transaction & Concurrency",
        topics: [
          ["ACID", "Atomicity, Consistency, Isolation, Durability, và vai trò của WAL."],
          ["Isolation levels", "Read Committed, Repeatable Read, Serializable; các hiện tượng dirty read, non-repeatable read, phantom, lost update."],
          ["Lock", "Row lock, SELECT ... FOR UPDATE, SKIP LOCKED (làm job queue), advisory lock."],
          ["Optimistic vs Pessimistic", "Cột version cho optimistic locking; xử lý khi nhiều người cùng mua sản phẩm cuối cùng."],
          ["MVCC & Deadlock", "Cách Postgres giữ nhiều phiên bản dòng, VACUUM, phát hiện và tránh deadlock."]
        ],
        practice: ["Mô phỏng 100 request đồng thời trừ tồn kho, chứng minh bug lost update rồi sửa bằng 2 cách"],
        res: [["Designing Data-Intensive Applications", "https://dataintensive.net/"], ["Postgres – Transaction Isolation", "https://www.postgresql.org/docs/current/transaction-iso.html"]]
      },
      {
        t: "ORM, Migrations & Backup",
        topics: [
          ["ORM / Query builder", "Prisma, TypeORM, Drizzle, Knex. Biết khi nào nên viết raw SQL."],
          ["Migrations có phiên bản", "Migration nằm trong git, chạy tự động trong pipeline CD, không sửa migration đã chạy."],
          ["Migration không downtime", "Mô hình expand → migrate → contract: thêm cột nullable, backfill, rồi mới đổi code và xoá cột cũ."],
          ["Seed & dữ liệu test", "Factory dữ liệu, seed idempotent cho môi trường dev/staging."],
          ["Backup & Restore", "pg_dump, snapshot, PITR. Backup chưa từng restore thử coi như chưa có backup."]
        ],
        practice: ["Đổi tên một cột trên bảng lớn theo expand–contract mà API vẫn chạy liên tục"],
        res: [["Prisma Docs", "https://www.prisma.io/docs"], ["Drizzle ORM", "https://orm.drizzle.team/"]]
      },
      {
        t: "Redis, NoSQL & Search",
        topics: [
          ["Cấu trúc dữ liệu Redis", "String, Hash, List, Set, Sorted Set (leaderboard), Stream, TTL."],
          ["Chiến lược cache", "Cache-aside, write-through, write-behind; invalidation; chống cache stampede."],
          ["Redis cho hạ tầng", "Session store, rate limiting, distributed lock, pub/sub, queue."],
          ["Document DB (MongoDB)", "Mô hình embed vs reference; hợp với dữ liệu linh hoạt, không cần JOIN nhiều."],
          ["Các loại NoSQL khác", "Key-value (DynamoDB), wide-column (Cassandra), graph (Neo4j), time-series (TimescaleDB)."],
          ["Full-text search", "Postgres tsvector cho nhu cầu đơn giản; Elasticsearch/OpenSearch khi cần tìm kiếm nâng cao."],
          ["Định lý CAP", "Khi có phân vùng mạng phải chọn giữa Consistency và Availability; PACELC."]
        ],
        practice: ["Thêm cache-aside cho API danh sách sản phẩm, đo p95 trước/sau", "Cài rate limiter sliding window bằng Redis"],
        res: [["Redis Docs", "https://redis.io/docs/latest/"], ["MongoDB University", "https://learn.mongodb.com/"], ["roadmap.sh – Redis", "https://roadmap.sh/redis"]]
      }
    ],
    project: {
      title: "Schema & tối ưu cho E-commerce",
      desc: "Thiết kế DB cho sàn TMĐT (users, products, variants, inventory, orders, payments, reviews), seed dữ liệu lớn và tối ưu.",
      reqs: ["ERD + migration có phiên bản", "Chống bán vượt tồn kho khi có đồng thời cao", "Báo cáo EXPLAIN trước/sau tối ưu; cache Redis cho trang sản phẩm"]
    },
    checkpoint: ["Chọn index cho 5 truy vấn cho trước và giải thích", "Giải thích vì sao Repeatable Read vẫn có thể bị lost update ở một số DB", "Thiết kế migration đổi kiểu cột không downtime"]
  },

  {
    id: "p05",
    title: "Authentication, Authorization & Bảo mật",
    tag: "Security",
    weeks: 4,
    summary: "Một lỗ hổng bảo mật có thể xoá sạch công sức của cả sản phẩm. Học cách xác thực và phân quyền đúng, cùng OWASP Top 10.",
    outcomes: [
      "Cài đặt đăng nhập an toàn: hash mật khẩu, session/JWT, refresh token rotation, OAuth2/OIDC",
      "Phân quyền RBAC/ABAC, chống IDOR",
      "Phòng chống OWASP Top 10 và quản lý secret đúng cách"
    ],
    modules: [
      {
        t: "Authentication",
        topics: [
          ["Hash mật khẩu", "Dùng Argon2id hoặc bcrypt (có salt, chậm có chủ đích). Tuyệt đối không dùng MD5/SHA1 cho mật khẩu."],
          ["Session cookie vs Token", "Stateful session (thu hồi dễ) vs JWT stateless (khó thu hồi). Chọn theo bài toán."],
          ["JWT đúng cách", "Header.Payload.Signature; access token ngắn hạn, refresh token xoay vòng (rotation) và phát hiện tái sử dụng."],
          ["Cookie an toàn", "HttpOnly, Secure, SameSite, __Host- prefix, thời hạn."],
          ["OAuth 2.0 & PKCE", "Authorization Code + PKCE cho SPA/mobile; client credentials cho service-to-service."],
          ["OpenID Connect & SSO", "ID token, discovery, đăng nhập Google/GitHub; SAML trong doanh nghiệp."],
          ["MFA & quên mật khẩu", "TOTP, token reset dùng một lần, có hạn, lưu dạng hash."],
          ["Passkeys & WebAuthn","Đăng nhập không mật khẩu chống phishing: đăng ký/xác thực bằng khoá công khai, relying party, triển khai bằng thư viện đã kiểm chứng."]
        ],
        practice: ["Cài refresh token rotation, phát hiện token bị đánh cắp (reuse detection)"],
        res: [["OWASP Authentication Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"], ["OAuth 2.0 Simplified", "https://www.oauth.com/"], ["jwt.io", "https://jwt.io/introduction"]]
      },
      {
        t: "Authorization",
        topics: [
          ["RBAC", "Role → Permission, gán role cho user, kiểm tra ở Guard/middleware."],
          ["ABAC & policy", "Quyết định dựa trên thuộc tính (chủ sở hữu, phòng ban, trạng thái); dùng CASL/OPA."],
          ["IDOR / Broken Access Control", "Vẫn là lỗ hổng số 1 trong OWASP Top 10:2025: luôn kiểm tra quyền sở hữu tài nguyên, không tin ID từ client."],
          ["Multi-tenant", "Cô lập dữ liệu theo tenant: cột tenant_id, schema riêng, hoặc Row Level Security của Postgres."]
        ],
        practice: ["Viết test chứng minh user A không đọc/sửa được tài nguyên của user B"],
        res: [["OWASP Authorization Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"]]
      },
      {
        t: "Web Security & OWASP Top 10",
        topics: [
          ["OWASP Top 10:2025", "A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures (mới), A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging & Alerting Failures, A10 Mishandling of Exceptional Conditions (mới)."],
          ["SQL/NoSQL Injection", "Luôn dùng parameterized query; cẩn thận với raw query trong ORM."],
          ["XSS & CSP", "Escape output, sanitize HTML, Content-Security-Policy."],
          ["CSRF", "SameSite cookie, CSRF token khi dùng cookie auth."],
          ["CORS", "Là cơ chế của trình duyệt, không phải cơ chế bảo mật server. Không dùng `*` kèm credentials."],
          ["SSRF", "Chặn request tới IP nội bộ/metadata cloud (169.254.169.254) khi server tải URL do người dùng đưa vào."],
          ["Rate limiting & brute-force", "Giới hạn theo IP/user, lockout, CAPTCHA."],
          ["Security headers", "HSTS, X-Content-Type-Options, frame-ancestors; dùng helmet."],
          ["Bảo mật upload file & webhook","Giới hạn kích thước, kiểm tra loại file, lưu ngoài web root/object storage; ký webhook bằng HMAC, chống replay bằng timestamp."]
        ],
        practice: ["Làm các lab trong OWASP Juice Shop", "Chạy OWASP ZAP baseline scan vào API của bạn"],
        res: [["OWASP Top 10:2025", "https://owasp.org/Top10/2025/"], ["OWASP Juice Shop", "https://owasp.org/www-project-juice-shop/"], ["PortSwigger Web Security Academy", "https://portswigger.net/web-security"]]
      },
      {
        t: "Secrets & Supply chain",
        topics: [
          ["Quản lý secret", ".env chỉ dùng ở local; production dùng Vault, AWS Secrets Manager hoặc SSM; rotate định kỳ."],
          ["Bảo mật dependency", "npm audit, Dependabot/Renovate, lockfile, chỉ dùng package đáng tin."],
          ["Mã hoá", "TLS khi truyền (in transit), mã hoá khi lưu (at rest), không tự viết thuật toán mã hoá."],
          ["Audit log & PII", "Ghi lại hành động quan trọng; che/giảm thiểu dữ liệu cá nhân (tuân thủ Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, hiệu lực từ 01/01/2026)."]
        ],
        practice: ["Bật Dependabot, secret scanning và CodeQL cho repo"],
        res: [["OWASP Cheat Sheet Series", "https://cheatsheetseries.owasp.org/"], ["roadmap.sh – Cyber Security", "https://roadmap.sh/cyber-security"]]
      }
    ],
    project: {
      title: "Auth Service độc lập",
      desc: "Service xác thực dùng chung: đăng ký, xác minh email, đăng nhập, refresh rotation, đăng nhập Google (OIDC), MFA TOTP, RBAC.",
      reqs: ["Argon2id, cookie HttpOnly/SameSite, rate limit đăng nhập", "Test cho mọi luồng, kể cả tấn công token reuse", "Báo cáo ZAP scan không còn cảnh báo High"]
    },
    checkpoint: ["Vẽ luồng OAuth2 Authorization Code + PKCE", "Tìm và sửa 5 lỗ hổng trong đoạn code mẫu", "Giải thích vì sao lưu JWT trong localStorage là rủi ro"]
  },

  {
    id: "p06",
    title: "Testing & Chất lượng mã nguồn",
    tag: "Quality",
    weeks: 3,
    summary: "CI/CD chỉ đáng tin khi bộ test đáng tin. Học viết test có giá trị và tự động hoá việc kiểm soát chất lượng.",
    outcomes: [
      "Viết unit, integration (DB thật qua Testcontainers), e2e và load test",
      "Thiết lập lint, format, pre-commit hook, commitlint",
      "Review code có hệ thống, viết tài liệu kỹ thuật và ADR"
    ],
    modules: [
      {
        t: "Chiến lược kiểm thử",
        topics: [
          ["Test pyramid / trophy", "Nhiều unit test nhanh, integration test cho phần quan trọng, ít e2e."],
          ["Unit test", "Vitest/Jest, mẫu AAA (Arrange, Act, Assert), đặt tên test mô tả hành vi."],
          ["Mock, stub, spy, fake", "Mock ở biên hệ thống (HTTP, email), không mock mọi thứ."],
          ["Integration test với Testcontainers", "Chạy Postgres/Redis thật trong Docker khi test, đáng tin hơn mock DB."],
          ["API e2e", "Supertest gọi app thật, test cả mã lỗi và phân quyền."],
          ["Contract testing", "Pact giữa consumer và provider, tránh phá vỡ API giữa các service."],
          ["Load & performance test", "k6: đặt ngưỡng p95, error rate; đưa vào pipeline cho endpoint quan trọng."],
          ["TDD & coverage", "Red → Green → Refactor. Coverage là công cụ tìm chỗ thiếu test, không phải mục tiêu."]
        ],
        practice: ["Viết integration test cho repository dùng Testcontainers", "Viết k6 script với threshold p95 < 300ms"],
        res: [["Testcontainers", "https://testcontainers.com/"], ["k6 Docs", "https://grafana.com/docs/k6/latest/"], ["JavaScript Testing Best Practices", "https://github.com/goldbergyoni/javascript-testing-best-practices"]]
      },
      {
        t: "Code quality & quy trình",
        topics: [
          ["ESLint + Prettier", "Rule chặt, type-aware lint, format tự động."],
          ["Git hooks", "Husky + lint-staged chạy lint/test nhanh trước commit; commitlint kiểm tra message."],
          ["Static analysis", "SonarQube/SonarCloud: code smell, duplication, quality gate trong CI."],
          ["Code review", "Checklist: đúng nghiệp vụ, bảo mật, hiệu năng, dễ đọc, có test. PR nhỏ, mô tả rõ."],
          ["Tài liệu", "README chạy được trong 5 phút, ADR (Architecture Decision Record), sơ đồ C4."],
          ["Làm việc nhóm: Agile/Scrum & ticket", "Sprint, backlog, user story, definition of done, ước lượng, viết ticket và báo cáo tiến độ rõ ràng."]
        ],
        practice: ["Viết 3 ADR cho các quyết định lớn của dự án Task API"],
        res: [["Google Engineering Practices – Code Review", "https://google.github.io/eng-practices/review/"], ["C4 Model", "https://c4model.com/"], ["ADR GitHub", "https://adr.github.io/"]]
      }
    ],
    project: {
      title: "Bộ test hoàn chỉnh cho Task API",
      desc: "Bổ sung test đầy đủ, quality gate và tài liệu cho dự án ở Phase 3–5.",
      reqs: ["Unit + integration (Testcontainers) + e2e, coverage nghiệp vụ ≥ 80%", "Husky, lint-staged, commitlint", "Load test k6 có threshold, báo cáo kết quả"]
    },
    checkpoint: ["Viết test cho một hàm có phụ thuộc thời gian và HTTP", "Giải thích khi nào dùng mock và khi nào dùng container thật", "Review một PR mẫu và chỉ ra ít nhất 5 vấn đề"]
  },

  {
    id: "p07",
    title: "Docker & Container",
    tag: "Containers",
    weeks: 3,
    summary: "Container là đơn vị để build, test và deploy trong mọi pipeline hiện đại. Học đóng gói ứng dụng nhỏ gọn, an toàn và chạy giống nhau ở mọi nơi.",
    outcomes: [
      "Viết Dockerfile multi-stage tối ưu, chạy user non-root, image nhỏ",
      "Dựng môi trường dev nhiều service bằng Docker Compose với một lệnh",
      "Quét lỗ hổng image, gắn tag đúng chiến lược và đẩy lên registry"
    ],
    modules: [
      {
        t: "Nền tảng container",
        topics: [
          ["Container vs VM", "Container chia sẻ kernel, cô lập bằng namespaces và giới hạn tài nguyên bằng cgroups."],
          ["Image & layer", "Mỗi lệnh tạo một layer; layer được cache; union filesystem."],
          ["Registry", "Docker Hub, GHCR, ECR; pull/push, xác thực, image digest (sha256) không thay đổi."],
          ["OCI & runtime", "containerd, runc; Docker chỉ là một trong nhiều công cụ tuân chuẩn OCI."]
        ],
        practice: ["Dùng `docker history` và `dive` để phân tích layer của một image"],
        res: [["Docker Docs", "https://docs.docker.com/get-started/"], ["roadmap.sh – Docker", "https://roadmap.sh/docker"]]
      },
      {
        t: "Dockerfile chuyên nghiệp",
        topics: [
          ["Multi-stage build", "Stage build có devDependencies, stage runtime chỉ chứa thứ cần để chạy."],
          ["Tối ưu cache", "COPY package*.json trước, cài dependency, rồi mới COPY source; dùng .dockerignore."],
          ["Bảo mật image", "Base tối giản (alpine/distroless/slim), USER non-root, không nhúng secret vào image."],
          ["HEALTHCHECK & tín hiệu", "Dùng dạng exec cho CMD để nhận SIGTERM, hoặc dùng tini làm init."],
          ["Chiến lược tag", "Tag theo git SHA (không đổi) và semver; tránh deploy bằng `latest`."],
          ["BuildKit & buildx", "Cache mount, secret mount khi build, build đa kiến trúc amd64/arm64."]
        ],
        practice: ["Giảm image NestJS từ ~1GB xuống < 150MB"],
        res: [["Dockerfile best practices", "https://docs.docker.com/build/building/best-practices/"], ["Distroless images", "https://github.com/GoogleContainerTools/distroless"]]
      },
      {
        t: "Docker Compose & vận hành",
        topics: [
          ["Compose nhiều service", "api + postgres + redis + worker; depends_on với healthcheck."],
          ["Volume & network", "Named volume cho dữ liệu, bind mount khi dev, network nội bộ giữa các service."],
          ["Env & profiles", "env_file, override file cho dev/test, profiles bật/tắt service."],
          ["Debug container", "logs -f, exec, inspect, stats; lỗi hay gặp: port, quyền, DNS nội bộ."],
          ["Giới hạn tài nguyên", "Giới hạn memory/cpu; hiểu lỗi OOMKilled."],
          ["Quét image", "Trivy/Grype phát hiện CVE; chặn build khi có lỗ hổng CRITICAL."]
        ],
        practice: ["`docker compose up` là chạy được toàn bộ hệ thống kèm seed dữ liệu"],
        res: [["Compose Docs", "https://docs.docker.com/compose/"], ["Trivy", "https://trivy.dev/"]]
      }
    ],
    project: {
      title: "Container hoá toàn bộ hệ thống",
      desc: "Đóng gói frontend, API, worker; compose cho dev và cho chạy integration test.",
      reqs: ["Image API < 150MB, non-root, có healthcheck", "Một lệnh để dựng môi trường dev", "Trivy scan không có CVE CRITICAL"]
    },
    checkpoint: ["Giải thích vì sao đổi thứ tự COPY làm build nhanh gấp 10 lần", "Debug container bị restart liên tục", "Giải thích container khác VM ở kernel như thế nào"]
  },

  {
    id: "p08",
    title: "CI/CD chuyên sâu & DevSecOps",
    tag: "CI/CD",
    weeks: 7,
    summary: "Mỗi commit được tự động kiểm tra, build, quét bảo mật, đóng gói và đưa lên môi trường một cách an toàn và có thể rollback. Đây là kỹ năng giúp một backend developer nổi bật hơn.",
    outcomes: [
      "Tự thiết kế pipeline hoàn chỉnh từ PR tới production bằng GitHub Actions (và đọc hiểu GitLab CI)",
      "Viết, vận hành và bảo mật Jenkins trong doanh nghiệp: Jenkinsfile, agent Docker/Kubernetes, shared library, JCasC",
      "Triển khai rolling, blue-green, canary, có migration tự động, smoke test và rollback",
      "Tích hợp bảo mật vào pipeline (SAST, SCA, container scan, secret scan, SBOM) và vận hành theo GitOps"
    ],
    modules: [
      {
        t: "Khái niệm & quy trình",
        topics: [
          ["CI, Continuous Delivery, Continuous Deployment", "CI: tích hợp và test liên tục. Delivery: luôn sẵn sàng release. Deployment: tự động lên production."],
          ["Các stage của pipeline", "Lint → Test → Build → Scan → Publish artifact → Deploy staging → Test → Deploy production → Verify."],
          ["Trunk-based development", "Nhánh sống ngắn, merge vào main nhiều lần mỗi ngày, dùng feature flag cho tính năng chưa xong."],
          ["Branch protection & required checks", "Không ai push thẳng lên main; PR phải qua CI và review."],
          ["Build once, deploy many", "Build một artifact (image theo SHA) rồi dùng lại cho staging và production, config khác nhau qua env."],
          ["Environments", "dev / staging / production; parity giữa các môi trường; preview environment cho mỗi PR."],
          ["Versioning & Release tự động", "SemVer + Conventional Commits → release-please/semantic-release sinh tag, changelog, GitHub Release."],
          ["DORA metrics", "5 chỉ số chia 2 nhóm. Throughput: change lead time, deployment frequency, failed deployment recovery time. Instability: change fail rate, deployment rework rate."]
        ],
        practice: ["Vẽ sơ đồ pipeline mong muốn cho dự án của bạn trước khi viết YAML"],
        res: [["Martin Fowler – Continuous Integration", "https://martinfowler.com/articles/continuousIntegration.html"], ["Trunk Based Development", "https://trunkbaseddevelopment.com/"], ["DORA", "https://dora.dev/"]]
      },
      {
        t: "GitHub Actions chuyên sâu",
        topics: [
          ["Workflow, job, step, runner", "Job chạy song song trên runner riêng, step chạy tuần tự; `needs` để tạo phụ thuộc."],
          ["Triggers", "push, pull_request, workflow_dispatch, schedule, release, tag; lọc theo paths/branches."],
          ["Service containers", "Chạy Postgres/Redis trong job để integration test."],
          ["Matrix build", "Test trên nhiều phiên bản Node/OS; fail-fast; include/exclude."],
          ["Caching & artifacts", "actions/cache, setup-node cache, Docker layer cache (type=gha); upload/download artifact giữa các job."],
          ["Secrets, variables & environments", "Environment protection rules, người duyệt bắt buộc, secret theo môi trường."],
          ["OIDC tới cloud", "Không lưu AWS access key; GitHub OIDC → assume IAM role tạm thời."],
          ["Reusable workflows & composite actions", "DRY cho nhiều repo; versioning action; pin theo commit SHA để an toàn."],
          ["Concurrency & self-hosted runner", "Huỷ run cũ khi có commit mới; runner riêng cho build nặng hoặc mạng nội bộ."]
        ],
        practice: ["Làm Lab 03 và Lab 04 trên trang Labs"],
        res: [["GitHub Actions Docs", "https://docs.github.com/en/actions"], ["Security hardening for GitHub Actions", "https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions"], ["roadmap.sh – DevOps", "https://roadmap.sh/devops"]]
      },
      {
        t: "Công cụ CI/CD khác",
        topics: [
          ["GitLab CI", ".gitlab-ci.yml: stages, jobs, rules, needs (DAG), artifacts, cache, environments, GitLab Runner."],
          ["Jenkins", "Declarative Jenkinsfile, agent, stage, credentials, shared library; vẫn phổ biến trong doanh nghiệp VN."],
          ["CircleCI, Buildkite, TeamCity", "Biết để đọc hiểu; khái niệm tương đương nhau."],
          ["Artifact repository", "Nexus, Artifactory, GHCR/ECR: lưu image, package có phiên bản, chính sách giữ lại."]
        ],
        practice: ["Chuyển pipeline GitHub Actions sang GitLab CI (Lab 08) và Jenkinsfile (Lab 09)"],
        res: [["GitLab CI/CD Docs", "https://docs.gitlab.com/ci/"], ["Jenkins Pipeline", "https://www.jenkins.io/doc/book/pipeline/"]]
      },
      {
        t: "Chiến lược triển khai & Rollback",
        topics: [
          ["Recreate & Rolling update", "Rolling: thay dần từng instance; cần readiness probe và maxUnavailable/maxSurge."],
          ["Blue-Green", "Hai môi trường giống nhau, chuyển traffic tức thì, rollback bằng cách chuyển lại."],
          ["Canary", "Đưa 5% → 25% → 100% traffic, theo dõi metric, tự động dừng nếu lỗi tăng (Argo Rollouts/Flagger)."],
          ["Feature flags", "Tách deploy khỏi release; bật tắt theo nhóm người dùng (Unleash, LaunchDarkly, OpenFeature)."],
          ["Migration trong pipeline", "Chạy migration như một job riêng trước khi deploy; migration phải tương thích ngược với code cũ."],
          ["Smoke test & health check", "Sau deploy gọi các endpoint then chốt; nếu thất bại thì rollback tự động."],
          ["Rollback", "Deploy lại image SHA trước đó; `kubectl rollout undo`; roll forward khi migration không đảo ngược được."]
        ],
        practice: ["Thực hiện blue-green trên VPS bằng Nginx + 2 container, chuyển đổi không rớt request"],
        res: [["Argo Rollouts", "https://argoproj.github.io/rollouts/"], ["OpenFeature", "https://openfeature.dev/"], ["Kubernetes – Deployments", "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"]]
      },
      {
        t: "DevSecOps: bảo mật trong pipeline",
        topics: [
          ["SAST", "Phân tích mã tĩnh: CodeQL, Semgrep; chạy mỗi PR."],
          ["SCA", "Quét dependency có CVE: npm audit, Dependabot, Snyk, OSV-Scanner."],
          ["Container & IaC scanning", "Trivy quét image, Dockerfile, Terraform, Kubernetes manifest; Checkov."],
          ["Secret scanning", "gitleaks/trufflehog chặn commit chứa secret; GitHub push protection."],
          ["DAST", "OWASP ZAP quét ứng dụng đang chạy trên staging."],
          ["SBOM & ký image", "Syft sinh SBOM, Cosign ký image, xác minh chữ ký trước khi deploy (SLSA)."],
          ["Policy as code", "OPA/Kyverno chặn deploy image chưa ký hoặc container chạy root."],
          ["Bảo mật chính pipeline", "Pin action theo commit SHA thay vì tag; cấp permissions tối thiểu; không dùng pull_request_target với code lạ. Bài học thật: 19/3/2026 kẻ tấn công ghi đè 76/77 tag của trivy-action để đánh cắp secret từ CI; pin SHA chỉ bảo vệ đúng tầng bạn pin, action con gọi theo tag vẫn có thể bị nhiễm."]
        ],
        practice: ["Thêm job security vào pipeline; build fail khi có lỗ hổng HIGH/CRITICAL"],
        res: [["roadmap.sh – DevSecOps", "https://roadmap.sh/devsecops"], ["SLSA", "https://slsa.dev/"], ["Sigstore Cosign", "https://docs.sigstore.dev/"], ["Trivy supply chain incident (3/2026)", "https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23"]]
      },
      {
        t: "GitOps",
        topics: [
          ["Nguyên tắc GitOps", "Git là nguồn sự thật duy nhất; trạng thái khai báo; agent trong cluster tự kéo và đồng bộ (pull-based)."],
          ["Argo CD", "Application, sync policy, self-heal, prune, app-of-apps, rollback bằng git revert."],
          ["Flux CD", "Lựa chọn thay thế, dùng Kustomization + HelmRelease."],
          ["Repo cấu hình & thăng cấp môi trường", "Tách repo app và repo config; CI cập nhật tag image; promotion staging → prod bằng PR."],
          ["Secret trong GitOps", "Sealed Secrets, External Secrets Operator, SOPS."]
        ],
        practice: ["Làm Lab 07: Argo CD tự đồng bộ khi CI cập nhật tag image"],
        res: [["Argo CD Docs", "https://argo-cd.readthedocs.io/"], ["OpenGitOps", "https://opengitops.dev/"], ["External Secrets", "https://external-secrets.io/"]]
      },
      {
        t: "Jenkins thực chiến trong doanh nghiệp",
        topics: [
          ["Kiến trúc Jenkins & cài đặt", "Controller, agent, executor, label, JENKINS_HOME; dòng LTS; Java 21/25; không build trên controller."],
          ["Loại job & chuyển từ Freestyle", "Freestyle, Pipeline, Multibranch, Organization Folder; ánh xạ sang Jenkinsfile; đối chiếu GitHub Actions/GitLab CI."],
          ["Declarative Pipeline đầy đủ", "options, parameters, triggers, when/beforeAgent, parallel, input, trạng thái build và post."],
          ["Groovy, CPS & sandbox", "Groovy đủ dùng, script block, Groovy chạy trên controller, NotSerializableException, @NonCPS, Script Approval."],
          ["Agent: tĩnh, Docker, Kubernetes", "Agent cố định vs tạm thời, agent Docker, pod template, build image không cần Docker daemon."],
          ["Credentials & phân quyền", "Loại và scope credential, withCredentials, LDAP/SSO, Matrix/Role-based, cập nhật plugin."],
          ["Multibranch, webhook & PR", "Branch Source plugin, webhook, báo trạng thái PR, PR từ fork không được tin cậy."],
          ["Shared library nâng cao", "vars/src/resources, trusted vs untrusted, pin phiên bản, thử nghiệm và JenkinsPipelineUnit."],
          ["Pipeline build → deploy hoàn chỉnh", "Test, build image theo commit, staging, smoke test, duyệt, lock, rollback; biến thể Helm/GitOps."],
          ["Configuration as Code & quản trị", "Image có plugin pin phiên bản, JCasC, Job DSL seed job, backup, nâng cấp LTS, giám sát."],
          ["Debug, tối ưu & xử lý sự cố", "Lỗi thường gặp, Replay, Restart from Stage, linter, tăng tốc pipeline và xử lý hàng đợi."],
          ["Nhánh theo môi trường: builds/dev & builds/prod", "GitLab webhook → job theo nhánh → build image → registry → deploy; branch rules, hotfix, dùng lại image bằng fast-forward."],
          ["Ngày đầu với Jenkins của công ty", "Lần theo một commit, đọc Console Output, những việc chưa nên làm, xử lý khi build đỏ, câu hỏi cho DevOps."]
        ],
        practice: ["Làm Lab 12: dựng Jenkins bằng JCasC, multibranch pipeline có agent Docker, duyệt và deploy", "Làm Lab 13: GitLab tự host + Jenkins với hai nhánh builds/dev và builds/prod", "Chọn một job Freestyle ở công ty, viết lại thành Jenkinsfile và chạy song song hai tuần"],
        res: [["Jenkins User Handbook", "https://www.jenkins.io/doc/book/"], ["Pipeline Syntax", "https://www.jenkins.io/doc/book/pipeline/syntax/"], ["Pipeline Best Practices", "https://www.jenkins.io/doc/book/pipeline/pipeline-best-practices/"], ["Configuration as Code", "https://plugins.jenkins.io/configuration-as-code/"], ["Jenkins Security Advisories", "https://www.jenkins.io/security/advisories/"]]
      }
    ],
    project: {
      title: "Pipeline production-grade",
      desc: "PR → lint/test (có Postgres service) → build image → scan → push GHCR → tự deploy staging → smoke test → duyệt tay → production → tự rollback nếu smoke test lỗi.",
      reqs: ["OIDC thay cho access key; pin action theo SHA; concurrency", "Release tự động theo Conventional Commits", "Lead time từ merge tới production < 15 phút; tài liệu hoá pipeline"]
    },
    checkpoint: ["Vẽ và giải thích pipeline của bạn trong 5 phút", "Chuyển một job Jenkins Freestyle thành Jenkinsfile có duyệt và rollback", "Giải thích 'build once, deploy many' và vì sao không build lại cho production", "Rollback production trong vòng dưới 2 phút"]
  },

  {
    id: "p09",
    title: "Cloud, Server & Infrastructure as Code",
    tag: "Cloud & IaC",
    weeks: 5,
    summary: "Hạ tầng cũng nên được viết thành code, review và tái tạo được. Học AWS core, Nginx, TLS và Terraform để tự dựng hạ tầng cho sản phẩm.",
    outcomes: [
      "Cấu hình Nginx reverse proxy, load balancing, TLS với Let's Encrypt",
      "Hiểu và dùng các dịch vụ AWS cốt lõi với IAM least privilege",
      "Viết Terraform có module, remote state, chạy plan/apply qua CI"
    ],
    modules: [
      {
        t: "Web server, proxy & mạng",
        topics: [
          ["Nginx", "Reverse proxy, load balancing (round-robin, least_conn), gzip, cache tĩnh, giới hạn body."],
          ["Forward vs Reverse proxy", "Reverse proxy đứng trước server: TLS termination, routing, bảo vệ backend."],
          ["TLS & Let's Encrypt", "certbot, tự gia hạn, HSTS, redirect HTTP → HTTPS."],
          ["CDN", "Cloudflare/CloudFront: cache ở edge, chống DDoS, header cache-control."],
          ["Firewall & Security group", "Chỉ mở 80/443, SSH giới hạn IP hoặc dùng bastion/SSM; ufw."],
          ["DNS thực chiến", "A/AAAA/CNAME/ALIAS, TTL khi chuyển đổi hệ thống, DNS cho email (SPF, DKIM, DMARC)."]
        ],
        practice: ["Làm Lab 10: Nginx + TLS cho API trên VPS"],
        res: [["Nginx Docs", "https://nginx.org/en/docs/"], ["Let's Encrypt", "https://letsencrypt.org/getting-started/"]]
      },
      {
        t: "AWS cốt lõi",
        topics: [
          ["IAM", "User, group, role, policy; least privilege; không dùng tài khoản root; MFA."],
          ["VPC & mạng", "Subnet public/private, Internet Gateway, NAT Gateway, route table, security group vs NACL."],
          ["Compute", "EC2 & Auto Scaling Group; ECS Fargate (container không cần quản server); Lambda (serverless)."],
          ["Lưu trữ", "S3 (policy, lifecycle, presigned URL), EBS, EFS."],
          ["Database managed", "RDS/Aurora Postgres: Multi-AZ, read replica, backup tự động; ElastiCache Redis."],
          ["Mạng & phân phối", "ALB, Route 53, ACM (chứng chỉ), CloudFront."],
          ["Giám sát & chi phí", "CloudWatch logs/metrics/alarms; Budgets & cost alert. Đặt budget ngay ngày đầu để tránh hoá đơn bất ngờ."],
          ["Lựa chọn khác", "GCP, Azure; PaaS như Render, Railway, Fly.io, DigitalOcean cho dự án nhỏ."]
        ],
        practice: ["Deploy thủ công API lên ECS Fargate + RDS qua Console một lần để hiểu các thành phần, sau đó xoá và làm lại bằng Terraform"],
        res: [["AWS Skill Builder", "https://skillbuilder.aws/"], ["AWS Well-Architected", "https://aws.amazon.com/architecture/well-architected/"], ["roadmap.sh – AWS", "https://roadmap.sh/aws"]]
      },
      {
        t: "Terraform",
        topics: [
          ["HCL, provider, resource", "Khai báo trạng thái mong muốn; data source; biến, output, locals."],
          ["State", "State là nguồn sự thật của Terraform; remote state trên S3 kèm khoá bằng `use_lockfile` (GA từ Terraform 1.11); không commit state."],
          ["Module", "Đóng gói VPC/ECS/RDS thành module tái sử dụng; dùng module từ registry."],
          ["Môi trường", "Tách thư mục theo env (dev/staging/prod) hoặc workspace; tfvars."],
          ["Terraform trong CI", "fmt/validate/tflint/checkov → plan comment vào PR → apply sau khi merge (có duyệt)."],
          ["Drift & import", "Phát hiện thay đổi ngoài Terraform; import tài nguyên có sẵn."],
          ["Lựa chọn khác", "OpenTofu, Pulumi (IaC bằng TypeScript), AWS CDK, CloudFormation."]
        ],
        practice: ["Làm Lab 05: dựng VPC + ECS + RDS bằng Terraform"],
        res: [["Terraform Tutorials", "https://developer.hashicorp.com/terraform/tutorials"], ["terraform-aws-modules", "https://registry.terraform.io/namespaces/terraform-aws-modules"], ["roadmap.sh – Terraform", "https://roadmap.sh/terraform"]]
      },
      {
        t: "Configuration management",
        topics: [
          ["Ansible", "Inventory, playbook, role, handler; idempotent; cấu hình VPS hàng loạt."],
          ["Packer & golden image", "Build AMI dựng sẵn để khởi động nhanh và nhất quán."],
          ["Immutable infrastructure", "Thay server mới thay vì sửa server đang chạy; nền tảng của container và ASG."]
        ],
        practice: ["Viết playbook Ansible harden VPS: user, SSH, ufw, fail2ban, Docker"],
        res: [["Ansible Docs", "https://docs.ansible.com/"]]
      }
    ],
    project: {
      title: "Hạ tầng AWS bằng Terraform",
      desc: "VPC 2 AZ, ALB + ECS Fargate chạy API, RDS Postgres ở private subnet, S3 cho file, Route 53 + ACM; pipeline Terraform plan/apply.",
      reqs: ["Remote state + lock; module hoá; 2 môi trường staging/prod", "Pipeline ứng dụng deploy lên ECS qua OIDC", "Có budget alert; `terraform destroy` sạch sẽ"]
    },
    checkpoint: ["Vẽ kiến trúc mạng VPC và giải thích luồng request", "Giải thích điều gì xảy ra nếu hai người cùng apply khi không có state lock", "Viết IAM policy tối thiểu cho CI push image lên ECR"]
  },

  {
    id: "p10",
    title: "Kubernetes & Orchestration",
    tag: "Kubernetes",
    weeks: 5,
    summary: "Kubernetes là nền tảng vận hành container phổ biến nhất ở quy mô lớn. Học đủ để deploy, cấu hình, scale và debug ứng dụng trên K8s.",
    outcomes: [
      "Hiểu kiến trúc cluster và các object cốt lõi",
      "Deploy ứng dụng có probe, resource limit, HPA, ConfigMap/Secret, Gateway API + TLS",
      "Đóng gói bằng Helm/Kustomize, triển khai qua GitOps"
    ],
    modules: [
      {
        t: "Kiến trúc & object cốt lõi",
        topics: [
          ["Control plane & Node", "api-server, etcd, scheduler, controller-manager; kubelet, kube-proxy, container runtime."],
          ["Pod", "Đơn vị nhỏ nhất; sidecar, init container; Pod là thứ dùng xong bỏ, không sửa trực tiếp."],
          ["Deployment & ReplicaSet", "Khai báo số replica, rolling update, lịch sử rollout."],
          ["Service", "ClusterIP, NodePort, LoadBalancer; DNS nội bộ; selector & label."],
          ["Gateway API (thay cho Ingress)", "GatewayClass → Gateway → HTTPRoute, routing theo host/path, chia traffic theo trọng số. Ingress NGINX đã ngừng bảo trì từ 3/2026, dự án mới nên dùng Gateway API (Envoy Gateway, NGINX Gateway Fabric, Istio, Cilium...); cert-manager cấp TLS tự động."],
          ["Namespace", "Tách môi trường/đội; ResourceQuota, LimitRange."]
        ],
        practice: ["Dựng cluster bằng kind, cài Envoy Gateway, deploy nginx và truy cập qua HTTPRoute"],
        res: [["Kubernetes Docs", "https://kubernetes.io/docs/home/"], ["Gateway API", "https://gateway-api.sigs.k8s.io/"], ["Ingress NGINX Retirement", "https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/"], ["roadmap.sh – Kubernetes", "https://roadmap.sh/kubernetes"], ["Kubernetes The Hard Way", "https://github.com/kelseyhightower/kubernetes-the-hard-way"]]
      },
      {
        t: "Cấu hình & vận hành",
        topics: [
          ["ConfigMap & Secret", "Tách cấu hình khỏi image; Secret chỉ là base64, cần mã hoá ở etcd hoặc dùng External Secrets."],
          ["Requests & Limits", "Scheduler dựa vào requests; vượt memory limit thì bị OOMKilled; QoS class."],
          ["Probes", "startup, readiness (khi nào nhận traffic), liveness (khi nào khởi động lại). Cấu hình sai probe gây restart liên tục."],
          ["HPA & autoscaling", "Scale theo CPU/memory/custom metric; Cluster Autoscaler/Karpenter."],
          ["Stateful workloads", "StatefulSet, PV/PVC, StorageClass. Với production, dùng DB managed thay vì tự chạy DB trên K8s."],
          ["Job & CronJob", "Chạy migration, tác vụ định kỳ."],
          ["RBAC & ServiceAccount", "Quyền tối thiểu cho Pod và cho CI."],
          ["NetworkPolicy & Pod Security", "Chặn traffic mặc định, runAsNonRoot, readOnlyRootFilesystem."],
          ["PodDisruptionBudget & nâng cấp cluster","PDB, drain node, topologySpreadConstraints, nâng cấp control plane và node group mà không rớt request."]
        ],
        practice: ["Làm Lab 06: Deployment đầy đủ probes, limits, HPA và test bằng k6"],
        res: [["Kubernetes – Configure Probes", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"], ["Production best practices", "https://learnk8s.io/production-best-practices"]]
      },
      {
        t: "Hệ sinh thái",
        topics: [
          ["kubectl thành thạo", "get/describe/logs/exec/port-forward, -o yaml, context & namespace, k9s."],
          ["Debug", "CrashLoopBackOff, ImagePullBackOff, Pending, OOMKilled: cách đọc events và xử lý."],
          ["Helm", "Chart, values theo môi trường, template, release, rollback."],
          ["Kustomize", "Base + overlays; tích hợp sẵn trong kubectl."],
          ["Cluster local & managed", "kind/k3d/minikube khi dev; EKS/GKE/AKS khi production."],
          ["Service mesh", "Istio/Linkerd: mTLS, traffic splitting, retry. Chỉ cần khi có nhiều service."]
        ],
        practice: ["Viết Helm chart cho API với values-staging và values-prod"],
        res: [["Helm Docs", "https://helm.sh/docs/"], ["Kustomize", "https://kustomize.io/"], ["k9s", "https://k9scli.io/"]]
      }
    ],
    project: {
      title: "Chạy hệ thống trên Kubernetes bằng GitOps",
      desc: "Deploy API, worker, frontend lên cluster (kind hoặc EKS) bằng Helm và Argo CD, có Gateway API + TLS, HPA, External Secrets.",
      reqs: ["Probes và limits chuẩn, rolling update không rớt request", "HPA scale khi chạy load test k6", "Cập nhật image bằng PR vào repo config, Argo CD tự đồng bộ"]
    },
    checkpoint: ["Debug 5 Pod lỗi khác nhau trong 30 phút", "Giải thích readiness khác liveness thế nào, cho ví dụ cấu hình sai", "Giải thích luồng request từ Internet tới Pod"]
  },

  {
    id: "p11",
    title: "Observability & SRE",
    tag: "Observability",
    weeks: 3,
    summary: "Phải thấy được hệ thống thì mới vận hành được. Học log, metric, trace, cảnh báo và cách xử lý sự cố một cách chuyên nghiệp.",
    outcomes: [
      "Instrument ứng dụng bằng OpenTelemetry: log có cấu trúc, metric, trace",
      "Dựng Prometheus + Grafana + Loki/Tempo, định nghĩa SLO và cảnh báo có ý nghĩa",
      "Xử lý sự cố, viết postmortem không đổ lỗi, có kế hoạch backup/DR"
    ],
    modules: [
      {
        t: "Ba trụ cột: Logs, Metrics, Traces",
        topics: [
          ["Structured logging", "Log JSON, trace_id/request_id trong mọi dòng log, log level, sampling."],
          ["Metrics", "Counter, gauge, histogram; phương pháp RED (Rate, Errors, Duration) cho service, USE cho tài nguyên."],
          ["Prometheus", "Mô hình pull, PromQL, exporter, recording rules; cardinality (không dùng userId làm label)."],
          ["Grafana", "Dashboard theo RED; biến template; dashboard as code."],
          ["Distributed tracing", "Span, context propagation (W3C traceparent); tìm service chậm trong chuỗi gọi."],
          ["OpenTelemetry", "Chuẩn mở: SDK + auto-instrumentation + Collector, xuất tới Jaeger/Tempo/Datadog."],
          ["Tập trung log", "Loki, ELK/OpenSearch, CloudWatch; retention và chi phí."],
          ["Giám sát phía người dùng","Real User Monitoring (Web Vitals thật), frontend error tracking, synthetic monitoring; đo SLO từ góc nhìn người dùng."]
        ],
        practice: ["Làm Lab 11: expose /metrics, dashboard p95 latency và error rate"],
        res: [["OpenTelemetry Docs", "https://opentelemetry.io/docs/"], ["Prometheus Docs", "https://prometheus.io/docs/introduction/overview/"], ["Grafana Docs", "https://grafana.com/docs/"]]
      },
      {
        t: "Reliability & xử lý sự cố",
        topics: [
          ["SLI, SLO, SLA & Error budget", "Ví dụ: 99.9% request < 300ms trong 30 ngày; hết error budget thì tạm dừng tính năng, ưu tiên độ ổn định."],
          ["Alerting", "Cảnh báo dựa trên triệu chứng người dùng thấy (SLO burn rate), không cảnh báo mọi thứ; Alertmanager."],
          ["On-call & Incident response", "Vai trò incident commander, kênh liên lạc, trang trạng thái (status page), mức độ nghiêm trọng."],
          ["Postmortem không đổ lỗi", "Dòng thời gian, nguyên nhân gốc (5 Whys), hành động khắc phục có người chịu trách nhiệm."],
          ["Runbook", "Hướng dẫn xử lý từng loại cảnh báo, liên kết thẳng từ alert."],
          ["Backup & Disaster Recovery", "RPO/RTO, backup nhiều vùng, diễn tập khôi phục định kỳ."],
          ["Chaos engineering", "Chủ động gây lỗi (kill pod, tăng độ trễ) để kiểm chứng khả năng chịu lỗi."]
        ],
        practice: ["Tự gây sự cố (DB chậm) trên staging, xử lý theo runbook và viết postmortem"],
        res: [["Google SRE Books", "https://sre.google/books/"], ["PagerDuty Incident Response", "https://response.pagerduty.com/"]]
      }
    ],
    project: {
      title: "Observability stack cho hệ thống",
      desc: "OpenTelemetry cho API và worker, Prometheus, Grafana, Loki, Tempo; SLO và alert; một postmortem thực tế.",
      reqs: ["Từ một log lỗi nhảy được sang trace tương ứng", "Dashboard RED cho từng service; alert theo SLO burn rate", "Runbook cho 3 cảnh báo quan trọng"]
    },
    checkpoint: ["Tìm nguyên nhân p95 tăng đột biến chỉ bằng dashboard và trace", "Định nghĩa SLO cho API thanh toán", "Giải thích vì sao label userId làm sập Prometheus"]
  },

  {
    id: "p12",
    title: "System Design, Kiến trúc & Scale",
    tag: "Architecture",
    weeks: 6,
    summary: "Thiết kế hệ thống chịu được tải lớn và chịu lỗi. Phần này quyết định bạn dừng ở mid-level hay lên được senior, và là vòng phỏng vấn khó nhất.",
    outcomes: [
      "Thiết kế hệ thống phân tán: cache, replication, sharding, queue",
      "Chọn kiến trúc phù hợp (modular monolith, microservices, event-driven), áp dụng DDD, CQRS, Saga, Outbox",
      "Làm được bài phỏng vấn system design trong 45 phút"
    ],
    modules: [
      {
        t: "Nền tảng hệ thống phân tán",
        topics: [
          ["Scale dọc & ngang", "Service stateless để scale ngang; state đưa ra DB/cache/object storage."],
          ["Load balancing", "L4 vs L7, thuật toán, sticky session (nên tránh), health check."],
          ["Caching nhiều tầng", "Browser → CDN → API gateway → app (Redis) → DB buffer. Invalidation là phần khó nhất."],
          ["Replication", "Leader-follower, multi-leader; replication lag và read-your-writes."],
          ["Partitioning & Sharding", "Theo range/hash; consistent hashing; hot partition."],
          ["CAP, PACELC & mô hình nhất quán", "Strong, eventual, causal consistency; quorum."],
          ["Ước lượng nhanh", "Tính QPS, dung lượng lưu trữ, băng thông (back-of-the-envelope)."],
          ["Caching nâng cao", "Refresh-ahead, chống cache stampede, TTL có jitter, Memcached vs Redis, CDN push vs pull."]
        ],
        practice: ["Ước lượng tài nguyên cho hệ thống 10 triệu người dùng/ngày"],
        res: [["System Design Primer", "https://github.com/donnemartin/system-design-primer"], ["ByteByteGo", "https://bytebytego.com/"], ["roadmap.sh – System Design", "https://roadmap.sh/system-design"]]
      },
      {
        t: "Kiến trúc ứng dụng",
        topics: [
          ["Monolith, Modular monolith, Microservices", "Bắt đầu bằng modular monolith; chỉ tách service khi có lý do về tổ chức hoặc scale."],
          ["Clean / Hexagonal Architecture", "Domain ở trung tâm, adapter cho DB/HTTP/queue; dễ test và dễ thay công nghệ."],
          ["Domain-Driven Design", "Ubiquitous language, bounded context, aggregate, domain event."],
          ["CQRS & Event Sourcing", "Tách mô hình đọc/ghi; lưu chuỗi sự kiện thay vì trạng thái. Mạnh nhưng phức tạp."],
          ["API Gateway & BFF", "Xác thực, rate limit, routing tập trung; Backend-for-Frontend cho từng loại client."],
          ["Serverless", "Lambda/Cloud Functions: tốt cho tải không đều; lưu ý cold start, giới hạn thời gian chạy, vendor lock-in."],
          ["Mẫu thiết kế cloud", "Strangler Fig, Anti-Corruption Layer, Sidecar/Ambassador, Gateway Offloading, Queue-Based Load Leveling, Valet Key."]
        ],
        practice: ["Tái cấu trúc Task API thành modular monolith với ranh giới module rõ ràng"],
        res: [["Microservices.io patterns", "https://microservices.io/patterns/"], ["Martin Fowler – Microservices", "https://martinfowler.com/articles/microservices.html"]]
      },
      {
        t: "Messaging & Event-driven",
        topics: [
          ["Queue vs Pub/Sub", "Queue: mỗi message một consumer xử lý. Pub/Sub: phát cho nhiều subscriber."],
          ["RabbitMQ", "Exchange (direct/topic/fanout), queue, binding, ack, dead-letter exchange."],
          ["Kafka", "Topic, partition, offset, consumer group, retention; thứ tự đảm bảo trong một partition."],
          ["Delivery semantics", "At-most-once, at-least-once, exactly-once (thực chất là idempotent consumer)."],
          ["Transactional Outbox", "Ghi sự kiện vào bảng outbox cùng transaction nghiệp vụ, relay sẽ publish. Tránh mất sự kiện."],
          ["Saga pattern", "Transaction phân tán qua chuỗi bước và bước bù trừ (compensation); choreography vs orchestration (Temporal)."]
        ],
        practice: ["Cài Outbox + consumer idempotent cho luồng 'đơn hàng đã thanh toán'"],
        res: [["RabbitMQ Tutorials", "https://www.rabbitmq.com/tutorials"], ["Kafka Documentation", "https://kafka.apache.org/documentation/"], ["Temporal", "https://docs.temporal.io/"]]
      },
      {
        t: "Resilience patterns",
        topics: [
          ["Timeout", "Mọi lời gọi mạng đều phải có timeout, không có ngoại lệ."],
          ["Retry + backoff + jitter", "Chỉ retry khi lỗi tạm thời và thao tác idempotent; tránh retry storm."],
          ["Circuit breaker", "Ngắt khi service phụ thuộc lỗi liên tục, trả fallback, thử lại sau (half-open)."],
          ["Bulkhead & Backpressure", "Cô lập tài nguyên theo luồng; từ chối sớm khi quá tải (429/503)."],
          ["Rate limiting algorithms", "Token bucket, leaky bucket, fixed/sliding window."],
          ["Graceful degradation", "Tắt tính năng phụ (gợi ý, thống kê) để giữ tính năng chính (thanh toán)."],
          ["Anti-pattern hiệu năng", "Chatty I/O, Extraneous Fetching, Busy Database, No Caching, Retry Storm, Noisy Neighbor, Synchronous I/O."]
        ],
        practice: ["Thêm timeout, retry và circuit breaker cho client gọi payment gateway giả lập"],
        res: [["AWS Builders' Library – Timeouts, retries, backoff", "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/"]]
      },
      {
        t: "Bài tập thiết kế kinh điển",
        topics: [
          ["URL Shortener", "Sinh ID (base62, Snowflake), cache đọc nhiều, analytics bất đồng bộ."],
          ["Rate Limiter phân tán", "Redis + Lua, nhất quán giữa nhiều node."],
          ["Chat real-time", "WebSocket gateway, lưu tin nhắn, trạng thái online, fan-out."],
          ["News Feed", "Fan-out on write vs on read, người dùng có nhiều follower."],
          ["Notification System", "Nhiều kênh (email/SMS/push), queue, retry, tuỳ chọn người dùng."],
          ["Hệ thống đặt vé / Flash sale", "Chống oversell, hàng đợi ảo, giữ chỗ có thời hạn."],
          ["Khung trả lời phỏng vấn system design","Làm rõ yêu cầu → ước lượng → API → data model → kiến trúc tổng thể → đi sâu → đánh đổi, và cách phân bổ 45 phút."]
        ],
        practice: ["Mỗi tuần viết 1 design doc: yêu cầu, ước lượng, sơ đồ, đánh đổi"],
        res: [["Hello Interview – System Design", "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction"], ["High Scalability", "http://highscalability.com/"]]
      }
    ],
    project: {
      title: "URL Shortener chịu tải cao",
      desc: "Design doc đầy đủ và bản cài đặt: API tạo/redirect, cache Redis, analytics qua queue, rate limit, deploy trên K8s kèm dashboard.",
      reqs: ["Design doc có ước lượng và phần đánh đổi", "Load test đạt ≥ 2.000 RPS redirect với p95 < 50ms trên máy local/cluster nhỏ", "Analytics không làm chậm redirect (bất đồng bộ)"]
    },
    checkpoint: ["Mock interview system design 45 phút với bạn học", "Giải thích Outbox giải quyết vấn đề dual-write thế nào", "Chọn giữa RabbitMQ và Kafka cho 3 tình huống"]
  },

  {
    id: "p13",
    title: "AI cho kỹ sư phần mềm",
    tag: "AI Engineering",
    weeks: 2,
    summary: "roadmap.sh bản mới đã thêm AI vào lộ trình backend. Kỹ sư cần dùng AI để tăng năng suất một cách có kiểm soát, và biết tích hợp LLM vào sản phẩm.",
    outcomes: [
      "Dùng công cụ AI coding hiệu quả nhưng vẫn review nghiêm ngặt",
      "Tích hợp LLM API: streaming, structured output, tool calling",
      "Xây tính năng RAG với embeddings và pgvector; hiểu MCP"
    ],
    modules: [
      {
        t: "AI-assisted development",
        topics: [
          ["Công cụ", "Claude Code, GitHub Copilot, Cursor: sinh code, refactor, viết test, giải thích codebase."],
          ["Prompt cho lập trình", "Cung cấp ngữ cảnh, ràng buộc và ví dụ; chia nhỏ nhiệm vụ; yêu cầu viết test trước."],
          ["Review code do AI sinh ra", "Kiểm tra bảo mật, edge case, dependency lạ, license. Bạn là người chịu trách nhiệm."],
          ["AI trong CI", "Review PR tự động, sinh tài liệu, tóm tắt sự cố. Vẫn giữ con người trong vòng duyệt."]
        ],
        practice: ["Dùng AI viết test cho một module cũ, sau đó tự review và sửa những test sai"],
        res: [["Claude Code Docs", "https://docs.claude.com/en/docs/claude-code/overview"], ["GitHub Copilot Docs", "https://docs.github.com/en/copilot"]]
      },
      {
        t: "Tích hợp LLM vào backend",
        topics: [
          ["LLM hoạt động thế nào", "Token, context window, temperature, hallucination; chi phí tính theo token."],
          ["Gọi API & streaming", "Anthropic/OpenAI SDK, stream qua SSE về client, timeout và retry."],
          ["Structured outputs & Tool calling", "Ép đầu ra theo JSON schema; cho model gọi hàm của hệ thống bạn một cách có kiểm soát."],
          ["Embeddings & Vector DB", "pgvector, tìm kiếm ngữ nghĩa, chunking tài liệu."],
          ["RAG", "Truy xuất → đưa vào ngữ cảnh → sinh câu trả lời có trích dẫn; đánh giá chất lượng."],
          ["MCP (Model Context Protocol)", "Chuẩn mở để kết nối AI agent với công cụ và dữ liệu."],
          ["An toàn & chi phí", "Prompt injection, lọc PII, cache kết quả, giới hạn chi phí theo người dùng."]
        ],
        practice: ["Thêm chức năng 'hỏi đáp tài liệu dự án' vào Task API bằng RAG + pgvector"],
        res: [["Anthropic Docs", "https://docs.claude.com/"], ["pgvector", "https://github.com/pgvector/pgvector"], ["Model Context Protocol", "https://modelcontextprotocol.io/"], ["roadmap.sh – AI Engineer", "https://roadmap.sh/ai-engineer"]]
      }
    ],
    project: {
      title: "Trợ lý tài liệu (RAG)",
      desc: "Upload tài liệu → chunk → embedding → pgvector; API hỏi đáp có trích dẫn, stream qua SSE; chạy ingest bằng job nền.",
      reqs: ["Có trích dẫn nguồn và từ chối trả lời khi không đủ căn cứ", "Giới hạn chi phí và rate limit theo người dùng", "Bộ câu hỏi đánh giá (eval) chạy trong CI"]
    },
    checkpoint: ["Giải thích RAG và khi nào không cần dùng", "Chỉ ra 3 rủi ro bảo mật khi cho LLM gọi tool"]
  }
];
