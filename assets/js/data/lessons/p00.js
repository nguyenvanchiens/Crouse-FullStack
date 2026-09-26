/* Nội dung bài học chương p00 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p00.m0.t0": {
    sections: [
      {
        h: "Bốn thành phần bạn cần hình dung",
        p: [
          "CPU là nơi thực thi lệnh. Nó rất nhanh nhưng chỉ làm việc được với dữ liệu nằm gần nó: thanh ghi và các tầng cache L1, L2, L3. RAM là bộ nhớ làm việc, lớn hơn cache nhiều nhưng chậm hơn khoảng vài chục đến hàng trăm lần. Disk (SSD, HDD) giữ dữ liệu lâu dài, mất điện không mất, nhưng lại chậm hơn RAM hàng nghìn lần.",
          "I/O (Input/Output) là mọi thao tác trao đổi dữ liệu với bên ngoài CPU và RAM: đọc file, ghi log, gọi database qua mạng, gọi API bên thứ ba. Đây chính là phần tốn thời gian nhất trong một request backend."
        ]
      },
      {
        h: "Độ trễ theo từng tầng",
        p: [
          "Con số tuyệt đối thay đổi theo phần cứng, nhưng thứ tự độ lớn thì khá ổn định. Hãy nhớ tỉ lệ giữa các tầng, không cần nhớ chính xác từng con số."
        ],
        list: [
          "Cache L1: khoảng 1 ns",
          "RAM: khoảng 100 ns",
          "Đọc ngẫu nhiên trên SSD: khoảng 100 µs (100.000 ns)",
          "Round-trip mạng trong cùng datacenter: khoảng 0,5 ms",
          "Round-trip mạng xuyên lục địa: khoảng 100–150 ms"
        ],
        code: {
          lang: "text",
          file: "latency-scale.txt",
          src: `Nếu 1 ns = 1 giây thì:
L1 cache        ~ 1 giây
RAM             ~ 1,5 phút
SSD random read ~ 1 ngày
Mạng cùng DC    ~ 6 ngày
Mạng liên lục địa ~ 4 năm`
        }
      },
      {
        h: "Vì sao I/O là nút thắt của backend",
        p: [
          "Một API điển hình nhận request, parse JSON, rồi gọi database hai ba lần và có thể gọi thêm Redis. Phần tính toán trên CPU thường chỉ mất vài trăm micro giây, còn mỗi truy vấn DB mất vài mili giây. Như vậy hơn 90% thời gian là chờ I/O.",
          "Hệ quả thực tế: muốn API nhanh hơn, bạn thường tối ưu số lần đi mạng (gộp query, tránh N+1, thêm cache, thêm index) chứ không phải viết vòng lặp nhanh hơn. Đây cũng là lý do Node.js chọn mô hình I/O không chặn: trong lúc chờ DB trả lời, tiến trình có thể phục vụ request khác."
        ]
      },
      {
        h: "Quan sát tài nguyên trên máy thật",
        p: [
          "Khi server chậm, câu hỏi đầu tiên là: nó đang thiếu CPU, thiếu RAM hay đang chờ disk/mạng? Các lệnh dưới đây giúp bạn trả lời nhanh trên Linux."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `nproc                # số core CPU
free -h              # RAM đã dùng / còn trống
df -h                # dung lượng disk
htop                 # CPU, RAM theo từng process
vmstat 1 5           # cột wa (I/O wait) cao => CPU đang chờ disk
iostat -x 1 3        # chi tiết I/O từng disk (gói sysstat)`
        }
      }
    ],
    summary: [
      "CPU nhanh nhất, rồi đến cache, RAM, SSD và mạng; mỗi tầng chậm hơn tầng trước nhiều bậc.",
      "Phần lớn thời gian xử lý một request backend là chờ I/O (DB, cache, API ngoài).",
      "Tối ưu backend thường là giảm số lần và độ trễ của I/O, không phải tối ưu vòng lặp.",
      "Dùng htop, free, df, vmstat để biết hệ thống đang nghẽn ở tầng nào."
    ],
    pitfalls: [
      "Tối ưu code tính toán trong khi nút thắt thật là 50 query DB trong một request. Hãy đo trước khi tối ưu.",
      "Gọi DB hoặc API ngoài bên trong vòng lặp (N+1). Hãy gộp lại thành một query hoặc một batch.",
      "Nghĩ rằng RAM đầy là xấu: Linux dùng RAM trống làm page cache. Hãy nhìn cột `available` trong `free -h` (RAM còn dùng được, gồm cả cache có thể giải phóng) thay vì cột `free`."
    ],
    quiz: [
      {
        q: "Sắp xếp theo độ trễ tăng dần, thứ tự nào đúng?",
        options: ["RAM, L1 cache, SSD, mạng", "L1 cache, RAM, SSD, mạng liên lục địa", "SSD, RAM, L1 cache, mạng", "L1 cache, SSD, RAM, mạng"],
        answer: 1,
        explain: "L1 khoảng 1 ns, RAM khoảng 100 ns, SSD khoảng 100 µs, mạng liên lục địa hàng trăm ms. Các phương án khác đảo vị trí RAM với L1 hoặc SSD với RAM."
      },
      {
        q: "Một API mất 200 ms, trong đó có 40 query DB tuần tự. Cách cải thiện hiệu quả nhất thường là gì?",
        options: ["Đổi sang CPU mạnh hơn", "Viết lại vòng lặp bằng for thay cho map", "Giảm số query bằng cách gộp hoặc JOIN, thêm index/cache", "Tăng RAM cho server"],
        answer: 2,
        explain: "Thời gian chủ yếu là chờ I/O của 40 lần đi DB. Giảm số lần round-trip mới giảm độ trễ đáng kể. CPU, RAM và cách viết vòng lặp gần như không ảnh hưởng."
      },
      {
        q: "Trong `vmstat`, cột `wa` cao liên tục cho biết điều gì?",
        options: ["CPU đang tính toán rất nhiều", "CPU đang rảnh vì chờ I/O (thường là disk)", "Hết RAM", "Mạng bị mất gói"],
        answer: 1,
        explain: "`wa` là tỉ lệ thời gian CPU chờ I/O hoàn tất. Giá trị cao nghĩa là disk (hoặc storage mạng) đang là nút thắt, không phải CPU hay RAM."
      }
    ]
  },

  "p00.m0.t1": {
    sections: [
      {
        h: "Process: chương trình đang chạy",
        p: [
          "Khi bạn chạy `node server.js`, hệ điều hành tạo một process. Mỗi process có không gian địa chỉ bộ nhớ riêng, bảng file descriptor riêng và một PID. Process A không thể đọc thẳng bộ nhớ của process B. Muốn trao đổi, chúng phải dùng IPC: pipe, socket, shared memory hoặc qua database.",
          "Sự cô lập này là ưu điểm lớn: một process crash không kéo theo process khác. Nhưng tạo process tốn tài nguyên hơn tạo thread, và giao tiếp giữa các process chậm hơn."
        ]
      },
      {
        h: "Thread: luồng thực thi trong process",
        p: [
          "Một process có thể có nhiều thread. Các thread chia sẻ chung heap, biến toàn cục và file descriptor, nhưng mỗi thread có stack và thanh ghi riêng. Nhờ chia sẻ bộ nhớ, thread trao đổi dữ liệu rất nhanh, nhưng cũng dễ giẫm chân lên nhau.",
          "Context switch là việc CPU dừng một luồng, lưu trạng thái rồi chuyển sang luồng khác. Chuyển giữa các thread cùng process rẻ hơn chuyển giữa các process, nhưng vẫn có chi phí. Hàng nghìn thread hoạt động cùng lúc sẽ khiến CPU tốn nhiều thời gian chỉ để chuyển qua lại."
        ]
      },
      {
        h: "Race condition và deadlock",
        p: [
          "Race condition xảy ra khi kết quả phụ thuộc vào thứ tự chạy của các luồng. Ví dụ kinh điển: hai thread cùng thực hiện `count++`. Lệnh này thực chất là đọc, cộng, ghi. Nếu hai thread cùng đọc giá trị 5, cả hai ghi 6, bạn mất một lần tăng.",
          "Deadlock xảy ra khi thread A giữ khoá X và chờ khoá Y, trong khi thread B giữ Y và chờ X. Cả hai chờ nhau mãi mãi. Cách phòng tránh phổ biến là luôn lấy khoá theo cùng một thứ tự. Cùng vấn đề này cũng xảy ra với transaction trong PostgreSQL, nên kiến thức này dùng lại được ở tầng database."
        ],
        code: {
          lang: "javascript",
          file: "race.mjs",
          src: `// Node.js: 2 worker thread cùng tăng một biến trong SharedArrayBuffer
import { Worker, isMainThread, workerData } from 'node:worker_threads';

if (isMainThread) {
  const shared = new Int32Array(new SharedArrayBuffer(4));
  const workers = [0, 1].map(() => new Worker(new URL(import.meta.url), { workerData: shared }));
  await Promise.all(workers.map((w) => new Promise((r) => w.on('exit', r))));
  console.log('Kỳ vọng 2000000, thực tế:', shared[0]); // thường nhỏ hơn
} else {
  const arr = workerData;
  for (let i = 0; i < 1_000_000; i++) arr[0]++;      // không nguyên tử => race
  // Sửa: Atomics.add(arr, 0, 1);
}`
        }
      },
      {
        h: "Áp dụng vào backend",
        p: [
          "Node.js chạy JavaScript trên một thread chính, nên code JS của bạn ít gặp race condition ở mức bộ nhớ. Tuy nhiên race condition vẫn xảy ra ở mức nghiệp vụ: hai request cùng đọc số dư rồi cùng trừ tiền. Khi đó bạn cần khoá ở database (`SELECT ... FOR UPDATE`) hoặc cập nhật nguyên tử (`UPDATE ... SET balance = balance - 10`).",
          "Để tận dụng nhiều core, Node.js thường chạy nhiều process (cluster, nhiều container) thay vì nhiều thread chia sẻ bộ nhớ."
        ]
      }
    ],
    summary: [
      "Process có vùng nhớ riêng và cô lập; thread chia sẻ bộ nhớ trong cùng process.",
      "Context switch có chi phí; quá nhiều luồng hoạt động làm giảm hiệu năng.",
      "Race condition do thao tác không nguyên tử trên dữ liệu chung; deadlock do chờ khoá vòng tròn.",
      "Trong backend, race condition nghiệp vụ thường được giải quyết ở database bằng khoá hoặc cập nhật nguyên tử."
    ],
    pitfalls: [
      "Nghĩ Node.js đơn luồng nên không bao giờ có race condition. Race vẫn xảy ra giữa các request đồng thời truy cập cùng bản ghi DB.",
      "Đọc giá trị, tính trong code, rồi ghi lại (read-modify-write) mà không có khoá hay điều kiện. Hãy dùng câu `UPDATE` nguyên tử hoặc optimistic locking theo version.",
      "Lấy nhiều khoá theo thứ tự khác nhau ở các nơi trong code, dẫn tới deadlock khó tái hiện."
    ],
    quiz: [
      {
        q: "Điểm khác biệt cốt lõi giữa process và thread là gì?",
        options: ["Thread luôn nhanh hơn process gấp 10 lần", "Process có không gian bộ nhớ riêng, các thread trong một process chia sẻ heap", "Process không thể chạy song song", "Thread không có stack riêng"],
        answer: 1,
        explain: "Process được cô lập bộ nhớ, còn thread cùng process dùng chung heap và biến toàn cục. Mỗi thread vẫn có stack riêng, và process hoàn toàn chạy song song được trên nhiều core."
      },
      {
        q: "Vì sao `count++` từ hai thread có thể cho kết quả sai?",
        options: ["Vì JavaScript không hỗ trợ số nguyên", "Vì `++` gồm đọc, cộng, ghi và không nguyên tử", "Vì thread không được ghi vào bộ nhớ", "Vì hệ điều hành chặn thao tác cộng"],
        answer: 1,
        explain: "Hai thread có thể đọc cùng giá trị cũ rồi cùng ghi giá trị mới, làm mất một lần tăng. Dùng `Atomics.add` hoặc khoá để khắc phục."
      },
      {
        q: "Hai request cùng trừ tiền từ một tài khoản trong API Node.js. Cách an toàn là gì?",
        options: ["Không cần làm gì, vì Node.js chạy JavaScript trên một thread", "`SELECT` số dư, trừ trong JS, rồi `UPDATE` giá trị mới", "Một câu `UPDATE ... SET balance = balance - $1 WHERE ... AND balance >= $1`", "Thêm `setTimeout` ngẫu nhiên giữa lúc đọc và lúc ghi"],
        answer: 2,
        explain: "Câu UPDATE nguyên tử để database xử lý đồng thời và kiểm tra điều kiện trong cùng một thao tác. Đọc rồi ghi trong JS vẫn bị race giữa các request, còn setTimeout không đảm bảo gì."
      }
    ]
  },

  "p00.m0.t2": {
    sections: [
      {
        h: "Hai khái niệm dễ nhầm",
        p: [
          "Concurrency (đồng thời) là khả năng quản lý nhiều việc trong cùng một khoảng thời gian bằng cách xen kẽ chúng. Parallelism (song song) là thực sự chạy nhiều việc tại cùng một thời điểm, cần nhiều core CPU.",
          "Ví dụ đời thường: một người phục vụ quán cà phê nhận order bàn 1, trong lúc chờ pha chế thì sang nhận order bàn 2. Đó là concurrency. Ba người phục vụ làm cùng lúc ba bàn là parallelism. Có thể có concurrency mà không có parallelism, và ngược lại."
        ]
      },
      {
        h: "Node.js dùng concurrency qua event loop",
        p: [
          "Code JavaScript của bạn chạy trên một thread. Khi gặp I/O như truy vấn DB hay đọc file, Node.js giao việc đó cho hệ điều hành (hoặc thread pool của libuv với một số thao tác như file system, DNS lookup, crypto), rồi tiếp tục xử lý request khác. Khi I/O xong, callback được đưa vào hàng đợi và event loop sẽ chạy nó.",
          "Nhờ vậy một process Node.js có thể phục vụ hàng nghìn kết nối đồng thời, miễn là mỗi request chủ yếu chờ I/O. Nếu một request chạy vòng lặp CPU nặng vài giây, toàn bộ request khác bị chặn."
        ],
        code: {
          lang: "typescript",
          file: "src/concurrency.ts",
          src: `const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchUser(id: number) {
  await sleep(100); // giả lập 1 query DB mất 100ms
  return { id };
}

console.time('tuần tự');
for (const id of [1, 2, 3]) await fetchUser(id);  // ~300ms
console.timeEnd('tuần tự');

console.time('đồng thời');
await Promise.all([1, 2, 3].map(fetchUser));       // ~100ms
console.timeEnd('đồng thời');`
        }
      },
      {
        h: "Khi nào cần parallelism",
        p: [
          "Với tác vụ nặng CPU (resize ảnh, nén file, tính hash mật khẩu với chi phí cao, xử lý báo cáo lớn), concurrency không giúp được vì CPU luôn bận. Bạn cần chạy song song trên nhiều core."
        ],
        list: [
          "Worker threads (`node:worker_threads`): chạy JS trên thread khác trong cùng process.",
          "Nhiều process: `node:cluster`, PM2, hoặc chạy nhiều container/pod sau load balancer.",
          "Tách ra job queue (BullMQ + Redis) để worker riêng xử lý, API trả lời ngay."
        ]
      },
      {
        h: "Đánh đổi cần nhớ",
        p: [
          "`Promise.all` tăng tốc nhưng gửi cùng lúc nhiều query có thể làm cạn connection pool của DB. Với danh sách lớn, hãy giới hạn mức đồng thời (ví dụ xử lý theo lô 10 phần tử). Parallelism bằng nhiều process thì tốn RAM hơn và phải đồng bộ trạng thái qua Redis hay DB, không dùng biến trong bộ nhớ được."
        ]
      }
    ],
    summary: [
      "Concurrency là xen kẽ nhiều việc; parallelism là chạy thật sự cùng lúc trên nhiều core.",
      "Node.js đạt concurrency cao nhờ event loop và I/O không chặn.",
      "Tác vụ nặng CPU chặn event loop; hãy đưa sang worker thread, process khác hoặc job queue.",
      "Dùng `Promise.all` cho các I/O độc lập, nhưng giới hạn mức đồng thời để bảo vệ DB."
    ],
    pitfalls: [
      "`await` tuần tự trong vòng lặp cho các lời gọi độc lập, làm API chậm gấp nhiều lần không cần thiết.",
      "Chạy tác vụ CPU nặng (ví dụ `JSON.parse` file hàng trăm MB, hash đồng bộ) trên thread chính làm mọi request khác bị treo.",
      "`Promise.all` với 10.000 phần tử gọi DB cùng lúc, gây cạn pool và timeout."
    ],
    quiz: [
      {
        q: "Một process Node.js trên máy 1 core phục vụ 1.000 kết nối chờ DB. Đây là ví dụ của gì?",
        options: ["Parallelism", "Concurrency", "Deadlock", "Multi-processing"],
        answer: 1,
        explain: "Chỉ có 1 core nên không có gì chạy song song thật. Event loop xen kẽ xử lý các kết nối trong lúc chúng chờ I/O, đó là concurrency."
      },
      {
        q: "Endpoint resize ảnh làm các API khác của cùng process bị chậm. Giải pháp phù hợp nhất?",
        options: ["Thêm `async` vào hàm resize", "Đưa việc resize sang worker thread hoặc job queue", "Tăng số connection DB", "Bọc trong `setTimeout(fn, 0)`"],
        answer: 1,
        explain: "Resize là tác vụ CPU, chạy trên thread chính sẽ chặn event loop. `async` hay `setTimeout` không làm nó chạy song song; cần thread hoặc process khác."
      },
      {
        q: "Ba lời gọi DB độc lập, mỗi lời gọi 100 ms. Dùng `Promise.all` thì tổng thời gian xấp xỉ bao nhiêu?",
        options: ["300 ms", "100 ms", "33 ms", "0 ms"],
        answer: 1,
        explain: "Ba lời gọi được gửi gần như cùng lúc và chờ song song, nên tổng thời gian xấp xỉ lời gọi chậm nhất, khoảng 100 ms."
      }
    ]
  },

  "p00.m0.t3": {
    sections: [
      {
        h: "Stack và heap khác nhau thế nào",
        p: [
          "Stack là vùng nhớ theo kiểu chồng đĩa, gắn với từng lời gọi hàm. Khi gọi hàm, một stack frame được đẩy vào, chứa tham số, biến cục bộ và địa chỉ trả về. Hàm kết thúc thì frame bị gỡ ra. Cấp phát trên stack rất nhanh và tự dọn, nhưng kích thước nhỏ và có giới hạn.",
          "Heap là vùng nhớ lớn cho dữ liệu có vòng đời linh hoạt: object, mảng, closure. Trong JavaScript, gần như mọi object đều nằm trên heap, còn biến trên stack chỉ giữ tham chiếu tới chúng. Heap cần một cơ chế để biết khi nào vùng nhớ không còn dùng nữa."
        ],
        code: {
          lang: "javascript",
          file: "stack-overflow.js",
          src: `function recurse(n) { return recurse(n + 1); }
try { recurse(0); }
catch (e) { console.log(e.message); } // Maximum call stack size exceeded`
        }
      },
      {
        h: "Garbage Collection hoạt động ra sao",
        p: [
          "Garbage Collector (GC) tìm các object không còn truy cập được từ các gốc (biến toàn cục, stack hiện tại) và thu hồi chúng. V8, engine của Node.js, chia heap thành vùng young generation cho object mới và old generation cho object sống lâu. Hầu hết object chết trẻ, nên vùng young được dọn thường xuyên và nhanh.",
          "GC không miễn phí. Khi heap lớn và nhiều object sống lâu, các lần dọn old generation tốn thời gian hơn và có thể làm tăng độ trễ p99 của API."
        ]
      },
      {
        h: "Memory leak trong ngôn ngữ có GC",
        p: [
          "GC chỉ thu hồi thứ không còn ai tham chiếu. Leak xảy ra khi code vô tình vẫn giữ tham chiếu tới dữ liệu không cần nữa. Heap tăng dần cho tới khi process bị kill vì hết bộ nhớ (OOM)."
        ],
        list: [
          "Cache bằng `Map` toàn cục không có giới hạn kích thước hay TTL.",
          "Đăng ký event listener mỗi request mà không gỡ bỏ.",
          "`setInterval` giữ closure tham chiếu tới object lớn và không bao giờ `clearInterval`.",
          "Mảng toàn cục lưu log hoặc request để debug rồi quên xoá."
        ],
        code: {
          lang: "typescript",
          file: "src/leak.ts",
          src: `// Leak: Map lớn dần theo mỗi user mới, không bao giờ xoá
const cache = new Map<string, unknown>();
export function getProfile(userId: string) {
  if (!cache.has(userId)) cache.set(userId, loadProfile(userId));
  return cache.get(userId);
}
// Sửa: dùng LRU có giới hạn (vd. thư viện lru-cache với max, ttl)
// hoặc đưa cache ra Redis có TTL.
declare function loadProfile(id: string): unknown;`
        }
      },
      {
        h: "Phát hiện và xử lý",
        p: [
          "Theo dõi chỉ số heap theo thời gian. Nếu sau mỗi lần GC heap vẫn không quay về mức nền mà cứ tăng dần, gần như chắc chắn có leak. Dùng `process.memoryUsage()` để xem nhanh, và dùng `node --inspect` kết hợp Chrome DevTools để chụp heap snapshot, so sánh hai snapshot để tìm loại object tăng bất thường.",
          "Trong container, hãy đặt giới hạn heap phù hợp với memory limit, ví dụ `node --max-old-space-size=384 dist/main.js` cho container 512 MB, để process báo lỗi rõ ràng thay vì bị kernel kill đột ngột."
        ]
      }
    ],
    summary: [
      "Stack giữ frame của lời gọi hàm, nhanh và tự dọn; heap giữ object có vòng đời linh hoạt.",
      "GC thu hồi object không còn truy cập được từ gốc; V8 chia heap theo thế hệ.",
      "Memory leak trong JS là do vẫn giữ tham chiếu: cache không giới hạn, listener, timer, biến toàn cục.",
      "Dùng `process.memoryUsage()`, heap snapshot và giới hạn heap để phát hiện và kiểm soát."
    ],
    pitfalls: [
      "Dùng `Map` hoặc object toàn cục làm cache mà không có giới hạn kích thước hay thời gian sống.",
      "Thấy RAM tăng liền kết luận leak. Hãy quan sát xu hướng sau GC trong thời gian dài, vì heap tăng tạm thời là bình thường.",
      "Không đặt memory limit cho container và `--max-old-space-size`, khiến process bị OOM kill không để lại log."
    ],
    quiz: [
      {
        q: "Trong JavaScript, object tạo bằng `const u = { name: 'A' }` bên trong hàm nằm ở đâu?",
        options: ["Object và biến đều nằm trên stack", "Object nằm trên heap, biến `u` giữ tham chiếu tới nó", "Object nằm trong CPU cache", "Object nằm trên disk"],
        answer: 1,
        explain: "Object được cấp phát trên heap. Biến cục bộ chỉ giữ tham chiếu. Khi không còn tham chiếu nào, GC có thể thu hồi object."
      },
      {
        q: "Vì sao ngôn ngữ có GC vẫn bị memory leak?",
        options: ["Vì GC chỉ chạy khi restart", "Vì code vẫn giữ tham chiếu tới dữ liệu không còn cần", "Vì GC không xử lý được mảng", "Vì heap không có giới hạn"],
        answer: 1,
        explain: "GC chỉ thu hồi object không còn truy cập được. Nếu một Map toàn cục hay listener vẫn giữ tham chiếu, GC coi object đó còn dùng và không thu hồi."
      },
      {
        q: "Dấu hiệu đáng tin nhất của memory leak là gì?",
        options: ["Heap tăng trong một request lớn", "Mức heap sau mỗi lần GC tăng dần theo thời gian và không quay về mức nền", "CPU cao", "Có nhiều request cùng lúc"],
        answer: 1,
        explain: "Heap dao động là bình thường. Khi mức nền sau GC liên tục tăng, nghĩa là object đang tích luỹ mà không được giải phóng."
      }
    ]
  },

  "p00.m0.t4": {
    sections: [
      {
        h: "Inode và đường dẫn",
        p: [
          "Trên Linux, mỗi file được mô tả bởi một inode: chứa quyền, owner, kích thước, thời gian và vị trí dữ liệu trên disk. Tên file thực chất chỉ là một mục trong thư mục trỏ tới inode. Vì vậy một inode có thể có nhiều tên (hard link), và `mv` trong cùng một filesystem rất nhanh vì chỉ đổi mục thư mục, không chép dữ liệu.",
          "Đường dẫn tuyệt đối bắt đầu từ `/`, ví dụ `/var/log/nginx/access.log`. Đường dẫn tương đối tính từ thư mục hiện tại, ví dụ `./config/app.json`. Trong script chạy bằng cron hay systemd, thư mục hiện tại thường không phải nơi bạn nghĩ, nên hãy dùng đường dẫn tuyệt đối."
        ]
      },
      {
        h: "Quyền rwx, owner và group",
        p: [
          "Mỗi file có ba nhóm quyền: owner (u), group (g) và others (o). Mỗi nhóm có read (r=4), write (w=2), execute (x=1). Với thư mục, x nghĩa là được đi vào thư mục đó, r là được liệt kê nội dung."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `ls -l app.sh
# -rwxr-x--- 1 deploy www 512 ... app.sh
#  owner=rwx(7) group=r-x(5) others=---(0)

chmod 750 app.sh              # đặt lại quyền bằng số
chmod u+x,o-rwx deploy.sh     # đặt bằng ký hiệu
chown deploy:www app.sh       # đổi owner và group
chmod 600 ~/.ssh/id_ed25519   # private key chỉ owner đọc được
stat app.sh                   # xem inode, quyền, thời gian`
        }
      },
      {
        h: "File descriptor",
        p: [
          "Khi process mở một file hay socket, kernel trả về một số nguyên gọi là file descriptor (fd). Theo quy ước: 0 là stdin, 1 là stdout, 2 là stderr. Mỗi kết nối TCP, mỗi file đang mở đều chiếm một fd.",
          "Mỗi process có giới hạn số fd (xem bằng `ulimit -n`). Server có nhiều kết nối đồng thời, hoặc code quên đóng file/stream, sẽ gặp lỗi `EMFILE: too many open files`. Bạn có thể xem fd của một process qua `ls -l /proc/<PID>/fd` hoặc `lsof -p <PID>`."
        ]
      },
      {
        h: "Liên hệ với backend",
        list: [
          "Container chạy bằng user non-root: file ứng dụng cần đúng owner để process đọc được nhưng không sửa được code.",
          "File `.env` hoặc key chỉ nên có quyền `600`, không để `777` cho tiện.",
          "Ghi log ra stdout/stderr (fd 1, 2) thay vì file, để Docker và Kubernetes thu thập.",
          "Volume mount từ host vào container hay gặp lỗi `permission denied` do UID khác nhau."
        ],
        p: [
          "Khi gặp lỗi quyền, hãy kiểm tra ba thứ: process đang chạy bằng user nào (`id`, `ps -o user`), file thuộc về ai (`ls -l`), và từng thư mục cha có quyền x hay không."
        ]
      }
    ],
    summary: [
      "Inode chứa metadata của file; tên file chỉ là mục thư mục trỏ tới inode.",
      "Quyền gồm r/w/x cho owner, group, others; biểu diễn bằng số như 755, 640, 600.",
      "File descriptor là số định danh file/socket đang mở; có giới hạn theo process.",
      "Dùng đường dẫn tuyệt đối trong script tự động và nguyên tắc cấp quyền tối thiểu."
    ],
    pitfalls: [
      "`chmod -R 777` để sửa lỗi quyền. Cách này mở toang hệ thống; hãy sửa owner hoặc group cho đúng.",
      "Quên rằng thư mục cha cũng cần quyền x thì mới truy cập được file bên trong.",
      "Không đóng stream/file trong code, dần dần gặp lỗi `EMFILE`."
    ],
    quiz: [
      {
        q: "`chmod 640 config.yml` cho kết quả gì?",
        options: ["Owner rw, group r, others không có quyền", "Owner rwx, group rw, others không có quyền", "Mọi người đều đọc được", "Owner r, group rw, others r"],
        answer: 0,
        explain: "6 = r+w, 4 = r, 0 = không có quyền. Vậy owner đọc ghi, group chỉ đọc, others không làm gì được."
      },
      {
        q: "Vì sao `mv` một file 10 GB trong cùng một filesystem gần như tức thì?",
        options: ["Vì Linux nén file trước", "Vì chỉ đổi mục thư mục trỏ tới inode, dữ liệu không bị chép", "Vì file được đưa vào RAM", "Vì mv chạy ở background"],
        answer: 1,
        explain: "Dữ liệu và inode giữ nguyên, chỉ tên trong thư mục thay đổi. Chuyển sang filesystem khác thì mv mới phải chép dữ liệu."
      },
      {
        q: "Server Node.js báo `EMFILE: too many open files`. Nguyên nhân khả dĩ nhất?",
        options: ["Hết dung lượng disk", "Vượt giới hạn số file descriptor do nhiều kết nối hoặc quên đóng file", "Sai quyền chmod", "Hết RAM"],
        answer: 1,
        explain: "EMFILE nghĩa là process đã dùng hết số fd cho phép. Cần kiểm tra rò rỉ fd và điều chỉnh `ulimit -n` nếu thật sự cần nhiều kết nối."
      }
    ]
  },

  "p00.m0.t5": {
    sections: [
      {
        h: "Byte không phải ký tự",
        p: [
          "Máy tính chỉ lưu byte. Encoding là quy tắc chuyển giữa ký tự và byte. ASCII dùng 7 bit, chỉ có 128 ký tự: chữ Latin không dấu, số, dấu câu. Nó không có chỗ cho chữ `ệ` hay `ư`.",
          "Unicode gán cho mỗi ký tự một code point, ví dụ `ệ` là U+1EC7. UTF-8 là cách mã hoá code point thành 1 đến 4 byte: ký tự ASCII giữ nguyên 1 byte, chữ tiếng Việt có dấu thường 2 hoặc 3 byte, emoji 4 byte. UTF-8 tương thích ngược với ASCII nên là chuẩn mặc định trên web."
        ],
        code: {
          lang: "javascript",
          file: "encoding.mjs",
          src: `const s = 'Việt';
console.log(s.length);                      // 4 (đơn vị UTF-16)
console.log(Buffer.byteLength(s, 'utf8'));  // 6 byte
console.log('😀'.length);                   // 2, vì emoji cần 2 đơn vị UTF-16
console.log([...'😀'].length);              // 1 ký tự thật

// Unicode normalization: 'é' có thể viết 2 kiểu
console.log('\\u00e9' === 'e\\u0301');                  // false
console.log('\\u00e9'.normalize() === 'e\\u0301'.normalize()); // true (NFC)`
        }
      },
      {
        h: "Vì sao tiếng Việt bị lỗi font",
        p: [
          "Chuỗi `Việt` bị hiển thị thành `Viá»‡t` là dấu hiệu kinh điển: dữ liệu được ghi bằng UTF-8 nhưng lại được đọc như Latin-1 hoặc Windows-1252. Mỗi byte bị hiểu thành một ký tự riêng. Lỗi xảy ra ở chỗ hai bên không thống nhất encoding, không phải do font."
        ],
        list: [
          "HTTP response thiếu `Content-Type: application/json; charset=utf-8` hoặc trang HTML thiếu thẻ `meta charset=\"utf-8\"`.",
          "Database hoặc kết nối DB không dùng UTF-8 (với PostgreSQL, tạo DB với `ENCODING 'UTF8'`).",
          "File CSV mở bằng Excel không nhận ra UTF-8; thêm BOM hoặc chọn encoding khi import.",
          "Cắt chuỗi theo byte làm đứt một ký tự nhiều byte ở giữa."
        ]
      },
      {
        h: "Base64 là mã hoá biểu diễn, không phải bảo mật",
        p: [
          "Base64 biến dữ liệu nhị phân thành chuỗi chỉ gồm 64 ký tự an toàn (A–Z, a–z, 0–9, +, /) để truyền qua kênh chỉ hỗ trợ văn bản: JSON, email, header HTTP. Cứ 3 byte thành 4 ký tự, nên kích thước tăng khoảng 33%. Biến thể Base64URL thay `+ /` bằng `- _` để dùng trong URL và JWT.",
          "Ai cũng giải mã Base64 được mà không cần khoá. Header `Authorization: Basic` chỉ là `user:password` được Base64, nên phải đi kèm HTTPS. Payload của JWT cũng chỉ là Base64URL, đừng để dữ liệu nhạy cảm trong đó."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `echo -n 'admin:secret' | base64        # YWRtaW46c2VjcmV0
echo 'YWRtaW46c2VjcmV0' | base64 -d     # admin:secret  (ai cũng đọc được)
node -e "console.log(Buffer.from('hi').toString('base64url'))"`
        }
      }
    ],
    summary: [
      "Encoding là quy tắc chuyển ký tự thành byte; UTF-8 là chuẩn mặc định, tương thích ASCII.",
      "Một ký tự tiếng Việt có thể chiếm 2–3 byte; độ dài chuỗi khác số byte.",
      "Lỗi font thường do ghi bằng UTF-8 nhưng đọc bằng encoding khác.",
      "Base64 chỉ biểu diễn dữ liệu nhị phân dưới dạng văn bản, không bảo vệ gì cả."
    ],
    pitfalls: [
      "Giới hạn độ dài theo `string.length` trong khi cột DB hay giao thức giới hạn theo byte.",
      "Coi Base64 là mã hoá bảo mật để lưu mật khẩu hoặc token.",
      "So sánh chuỗi tiếng Việt có dấu mà không chuẩn hoá Unicode (NFC), khiến tìm kiếm hoặc so trùng bị sai."
    ],
    quiz: [
      {
        q: "Chuỗi `Việt` hiển thị thành `Viá»‡t`. Nguyên nhân phổ biến nhất?",
        options: ["Máy thiếu font tiếng Việt", "Dữ liệu UTF-8 bị đọc như Latin-1/Windows-1252", "Dữ liệu bị mã hoá AES", "Chuỗi quá dài"],
        answer: 1,
        explain: "Các byte UTF-8 của chữ `ệ` bị hiểu thành nhiều ký tự Latin-1. Đây là lỗi không thống nhất encoding giữa bên ghi và bên đọc."
      },
      {
        q: "Phát biểu nào đúng về Base64?",
        options: ["Cần khoá bí mật mới giải mã được, nên dùng để giấu token", "Nén dữ liệu, kết quả nhỏ hơn bản gốc khoảng 33%", "Biểu diễn byte thành văn bản, lớn hơn khoảng 33%, ai cũng giải mã được", "Là hàm băm một chiều, không thể lấy lại dữ liệu gốc"],
        answer: 2,
        explain: "Base64 là mã hoá biểu diễn có thể đảo ngược mà không cần khoá. Nó làm dữ liệu lớn hơn chứ không nhỏ hơn và không phải hàm băm."
      },
      {
        q: "Trong UTF-8, một ký tự ASCII như `A` chiếm bao nhiêu byte?",
        options: ["1 byte", "2 byte", "3 byte", "4 byte"],
        answer: 0,
        explain: "UTF-8 giữ nguyên ký tự ASCII ở 1 byte, nhờ vậy tương thích ngược với ASCII. Ký tự ngoài ASCII mới cần 2–4 byte."
      }
    ]
  },

  "p00.m1.t0": {
    sections: [
      {
        h: "Internet là mạng của các mạng",
        p: [
          "Internet không phải một mạng lớn duy nhất. Nó là hàng chục nghìn mạng độc lập (gọi là Autonomous System, AS) của ISP, công ty, nhà cung cấp cloud, nối với nhau. Dữ liệu đi trên đó dưới dạng gói tin (packet): mỗi gói có header chứa địa chỉ IP nguồn, IP đích, và phần dữ liệu.",
          "Router ở mỗi chặng nhìn IP đích rồi quyết định chuyển gói sang chặng kế tiếp. Không router nào biết toàn bộ đường đi. Giữa các AS, giao thức BGP dùng để công bố \"dải IP này đi qua tôi\". Khi cấu hình BGP sai, cả một dịch vụ lớn có thể biến mất khỏi Internet dù server vẫn chạy bình thường."
        ]
      },
      {
        h: "TCP: kết nối tin cậy",
        p: [
          "IP chỉ cố gắng giao gói, không đảm bảo gói tới nơi hay tới đúng thứ tự. TCP xây trên IP để cung cấp luồng byte tin cậy: đánh số thứ tự, xác nhận (ACK), gửi lại gói mất, kiểm soát tốc độ để không làm nghẽn mạng.",
          "Trước khi gửi dữ liệu, TCP bắt tay 3 bước: client gửi SYN, server trả SYN-ACK, client gửi ACK. Việc này tốn một round-trip. Nếu server ở xa 100 ms, riêng bắt tay đã mất 100 ms trước khi gửi được byte HTTP đầu tiên. Đó là lý do connection pool và keep-alive rất quan trọng."
        ],
        code: {
          lang: "text",
          file: "tcp-handshake.txt",
          src: `Client                          Server
  | ---- SYN (seq=x) ---------->  |
  | <--- SYN-ACK (seq=y, ack=x+1) |
  | ---- ACK (ack=y+1) -------->  |
  | ==== dữ liệu HTTP =========   |`
        }
      },
      {
        h: "UDP: nhanh, không kết nối",
        p: [
          "UDP chỉ gửi datagram đi, không bắt tay, không gửi lại, không đảm bảo thứ tự. Nghe có vẻ kém, nhưng nó phù hợp khi độ trễ quan trọng hơn độ chính xác tuyệt đối, hoặc khi ứng dụng tự lo phần tin cậy."
        ],
        list: [
          "Truy vấn DNS thông thường dùng UDP cổng 53.",
          "Gọi video, game online: gói trễ thì bỏ qua còn hơn chờ.",
          "QUIC (nền của HTTP/3) chạy trên UDP và tự cài đặt cơ chế tin cậy, mã hoá."
        ]
      },
      {
        h: "Tự quan sát đường đi của gói tin",
        p: [
          "Khi một request chậm, hãy tách thời gian: bao nhiêu cho DNS, bao nhiêu cho kết nối TCP, bao nhiêu cho TLS, bao nhiêu server xử lý. Mỗi phần có cách tối ưu khác nhau."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `ping -c 4 example.com          # round-trip time tới host
traceroute example.com         # các chặng router trên đường đi (Windows: tracert)
ss -tn state established       # các kết nối TCP đang mở trên máy
curl -o /dev/null -s -w 'dns: %{time_namelookup}s  connect: %{time_connect}s  tls: %{time_appconnect}s  total: %{time_total}s\\n' https://example.com`
        }
      }
    ],
    summary: [
      "Internet gồm nhiều mạng độc lập nối nhau; router chuyển gói theo IP đích, BGP định tuyến giữa các mạng lớn.",
      "TCP đảm bảo tin cậy và đúng thứ tự, cần bắt tay 3 bước trước khi gửi dữ liệu.",
      "UDP không kết nối, nhanh, phù hợp DNS, media thời gian thực và là nền của QUIC.",
      "Tái sử dụng kết nối (keep-alive, pool) giúp tránh chi phí bắt tay lặp lại."
    ],
    pitfalls: [
      "Mở kết nối mới tới DB hay API ngoài cho mỗi request thay vì dùng connection pool.",
      "Chặn toàn bộ ICMP trên firewall rồi dùng `ping` để kết luận server chết. Hãy kiểm tra bằng `curl` hoặc `nc` tới đúng cổng.",
      "Nghĩ UDP luôn tốt hơn vì nhanh; khi cần dữ liệu đầy đủ, bạn phải tự xử lý mất gói."
    ],
    quiz: [
      {
        q: "Thứ tự đúng của TCP three-way handshake là gì?",
        options: ["SYN → ACK → SYN-ACK", "SYN → SYN-ACK → ACK", "ACK → SYN → FIN", "HELLO → SYN → ACK"],
        answer: 1,
        explain: "Client gửi SYN, server đáp SYN-ACK, client xác nhận ACK. Sau đó mới gửi dữ liệu. FIN dùng để đóng kết nối, còn HELLO thuộc TLS."
      },
      {
        q: "Vì sao dùng connection pool tới database lại giảm độ trễ?",
        options: ["Vì pool nén dữ liệu", "Vì tránh phải bắt tay TCP (và TLS, xác thực) cho mỗi truy vấn", "Vì pool dùng UDP", "Vì pool cache kết quả query"],
        answer: 1,
        explain: "Mỗi kết nối mới tốn round-trip cho bắt tay TCP, TLS và xác thực DB. Pool giữ sẵn kết nối để dùng lại. Pool không cache kết quả và không đổi giao thức."
      },
      {
        q: "HTTP/3 chạy trên giao thức vận chuyển nào?",
        options: ["TCP", "UDP thông qua QUIC", "ICMP", "SCTP"],
        answer: 1,
        explain: "HTTP/3 dùng QUIC, một giao thức xây trên UDP, tự cài đặt cơ chế tin cậy và tích hợp TLS 1.3."
      }
    ]
  },

  "p00.m1.t1": {
    sections: [
      {
        h: "Vì sao cần mô hình phân tầng",
        p: [
          "Mạng máy tính phức tạp, nên người ta chia nó thành các tầng. Mỗi tầng chỉ lo một việc và dùng dịch vụ của tầng bên dưới. Nhờ vậy HTTP không cần biết dữ liệu đang đi qua Wi-Fi hay cáp quang. Với kỹ sư backend, giá trị lớn nhất của mô hình là giúp khoanh vùng lỗi: lỗi đang ở tầng nào?"
        ]
      },
      {
        h: "OSI 7 tầng và TCP/IP 4 tầng",
        p: [
          "OSI là mô hình tham chiếu 7 tầng, dùng nhiều khi giảng dạy và khi trao đổi (ví dụ \"load balancer tầng 4\", \"tầng 7\"). TCP/IP là mô hình thực tế Internet đang dùng, gộp lại thành 4 tầng."
        ],
        list: [
          "Tầng 7 Application (TCP/IP: Application): HTTP, DNS, SMTP, gRPC.",
          "Tầng 6 Presentation và 5 Session: trong TCP/IP gộp vào Application; TLS thường được xếp quanh đây.",
          "Tầng 4 Transport (TCP/IP: Transport): TCP, UDP, cổng (port).",
          "Tầng 3 Network (TCP/IP: Internet): IP, định tuyến, ICMP.",
          "Tầng 2 Data Link và 1 Physical (TCP/IP: Link): Ethernet, Wi-Fi, địa chỉ MAC, tín hiệu vật lý."
        ]
      },
      {
        h: "Khoanh vùng lỗi theo tầng",
        p: [
          "Khi `curl https://api.example.com` thất bại, hãy kiểm tra theo từng bước của request. Mỗi thông báo lỗi thường chỉ ra tầng gặp sự cố."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# DNS: tên có phân giải được không?
dig +short api.example.com        # lỗi curl: "Could not resolve host"

# Tầng 3: IP có tới được không? (ICMP có thể bị chặn)
ping -c 3 203.0.113.10

# Tầng 4: cổng có mở không?
nc -vz api.example.com 443        # "Connection refused" hoặc timeout

# TLS: chứng chỉ có hợp lệ không?
openssl s_client -connect api.example.com:443 -servername api.example.com </dev/null

# Tầng 7: HTTP trả gì?
curl -v https://api.example.com/health   # 502, 503, 401...`
        }
      },
      {
        h: "Đọc lỗi trong vận hành",
        list: [
          "`Could not resolve host`: lỗi DNS, chưa hề có kết nối TCP.",
          "`Connection refused`: tới được máy nhưng không có process nào lắng nghe cổng đó (hoặc bị từ chối chủ động).",
          "Timeout khi kết nối: gói bị drop, thường do security group hoặc firewall.",
          "`certificate has expired`: lỗi TLS, kết nối TCP vẫn ổn.",
          "HTTP 502 từ Nginx: proxy chạy tốt, nhưng upstream (ứng dụng của bạn) lỗi hoặc không phản hồi hợp lệ."
        ],
        p: [
          "Load balancer tầng 4 chỉ nhìn IP và cổng, chuyển tiếp nhanh. Load balancer tầng 7 đọc được HTTP nên có thể định tuyến theo path, header, và kết thúc TLS."
        ]
      }
    ],
    summary: [
      "OSI có 7 tầng, TCP/IP có 4 tầng; TCP/IP là mô hình Internet thực sự dùng.",
      "Các tầng quan trọng với backend: Network (IP), Transport (TCP/UDP), Application (HTTP, DNS) và TLS.",
      "Thông báo lỗi thường cho biết tầng gặp sự cố: DNS, TCP, TLS hay HTTP.",
      "Load balancer L4 làm việc với IP và cổng, L7 hiểu nội dung HTTP."
    ],
    pitfalls: [
      "Thấy HTTP 502 liền đi sửa DNS. 502 nghĩa là DNS, TCP, TLS tới proxy đều ổn; hãy kiểm tra upstream.",
      "Nhầm `Connection refused` (có máy, không có service lắng nghe) với timeout (gói bị chặn hoặc máy không tới được).",
      "Học thuộc tên 7 tầng mà không biết dùng nó để chẩn đoán lỗi."
    ],
    quiz: [
      {
        q: "TCP và UDP thuộc tầng nào trong mô hình OSI?",
        options: ["Tầng 3 Network", "Tầng 4 Transport", "Tầng 7 Application", "Tầng 2 Data Link"],
        answer: 1,
        explain: "TCP và UDP là giao thức tầng Transport. IP ở tầng Network, HTTP ở Application, Ethernet ở Data Link."
      },
      {
        q: "`curl` báo `Could not resolve host`. Lỗi nằm ở đâu?",
        options: ["Chứng chỉ TLS hết hạn", "Ứng dụng trả 500", "Phân giải DNS thất bại", "Cổng 443 bị đóng"],
        answer: 2,
        explain: "curl chưa lấy được địa chỉ IP nên chưa hề mở kết nối TCP. Cần kiểm tra DNS với `dig` hoặc cấu hình resolver."
      },
      {
        q: "Muốn định tuyến `/api/*` tới service A và `/static/*` tới service B, bạn cần load balancer loại nào?",
        options: ["Tầng 3", "Tầng 4", "Tầng 7", "Tầng 2"],
        answer: 2,
        explain: "Path là thông tin của HTTP, chỉ load balancer tầng 7 mới đọc được. Tầng 4 chỉ thấy IP và cổng."
      }
    ]
  },

  "p00.m1.t2": {
    sections: [
      {
        h: "DNS là danh bạ của Internet",
        p: [
          "Máy tính kết nối bằng địa chỉ IP, còn con người nhớ tên miền. DNS là hệ thống phân tán chuyển tên như `api.example.com` thành IP. Nó được thiết kế phân cấp để không có máy chủ nào phải biết mọi tên miền, và dùng cache ở nhiều tầng để chịu được lượng truy vấn khổng lồ."
        ]
      },
      {
        h: "Quá trình phân giải",
        p: [
          "Khi ứng dụng hỏi `api.example.com`, hệ điều hành gửi truy vấn tới recursive resolver (của ISP, của cloud, hoặc 1.1.1.1, 8.8.8.8). Nếu resolver chưa có trong cache, nó đi hỏi lần lượt:"
        ],
        list: [
          "Root server: \"tôi không biết, nhưng TLD `.com` do các server này quản lý\".",
          "TLD server `.com`: \"`example.com` có name server (NS) là ns1.provider.net\".",
          "Authoritative server của `example.com`: \"`api.example.com` có IP 203.0.113.10, TTL 300 giây\".",
          "Resolver lưu cache kết quả trong thời gian TTL rồi trả về cho client."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `dig api.example.com            # xem đáp án, TTL, server đã trả lời
dig +trace api.example.com     # đi từ root xuống như một resolver
dig example.com MX +short      # bản ghi mail
dig @1.1.1.1 example.com TXT   # hỏi thẳng một resolver cụ thể`
        }
      },
      {
        h: "Các loại bản ghi thường dùng",
        p: [
          "Mỗi bản ghi có tên, loại, giá trị và TTL. Bạn sẽ gặp các loại sau gần như hằng ngày:"
        ],
        list: [
          "A: tên trỏ tới địa chỉ IPv4. AAAA: tới IPv6.",
          "CNAME: tên này là bí danh của tên khác, ví dụ `www` trỏ tới `app.hosting-provider.com`. Không đặt CNAME ở apex domain (`example.com`) vì nó không được cùng tồn tại với bản ghi khác như MX, NS; nhiều nhà cung cấp có ALIAS hoặc CNAME flattening thay thế.",
          "MX: máy chủ nhận email cho domain.",
          "TXT: văn bản tuỳ ý, dùng cho SPF, DKIM, DMARC và xác minh sở hữu domain.",
          "NS: name server có thẩm quyền cho domain hoặc subdomain."
        ]
      },
      {
        h: "TTL, cache và chuyện đổi IP",
        p: [
          "TTL cho biết resolver được giữ đáp án bao lâu. TTL dài giảm tải và nhanh hơn, nhưng khi đổi IP thì người dùng có thể còn thấy IP cũ tới hết TTL. Mẹo khi migrate server: hạ TTL xuống 60–300 giây trước ít nhất một khoảng bằng TTL cũ, đổi bản ghi, chờ ổn định rồi tăng TTL lại.",
          "Cache DNS có ở nhiều nơi: trình duyệt, hệ điều hành, resolver. Trong Kubernetes, DNS nội bộ cluster (CoreDNS) là nguyên nhân phổ biến của lỗi kết nối chập chờn, nên hãy kiểm tra DNS khi các service gọi nhau thất bại."
        ]
      }
    ],
    summary: [
      "DNS phân cấp: resolver hỏi root, TLD, rồi authoritative server.",
      "Bản ghi chính: A, AAAA, CNAME, MX, TXT, NS.",
      "TTL quyết định thời gian cache; hạ TTL trước khi đổi IP.",
      "`dig` và `dig +trace` là công cụ chính để chẩn đoán DNS."
    ],
    pitfalls: [
      "Đổi IP khi TTL đang là 86400 giây rồi ngạc nhiên vì người dùng vẫn vào server cũ cả ngày.",
      "Đặt CNAME cho apex domain cùng MX/TXT, gây xung đột bản ghi. Dùng A/AAAA hoặc tính năng ALIAS của nhà cung cấp.",
      "Quên kiểm tra DNS khi service không kết nối được, mặc định nghĩ lỗi ở ứng dụng."
    ],
    quiz: [
      {
        q: "Bản ghi nào dùng để chỉ định máy chủ nhận email của domain?",
        options: ["A", "CNAME", "MX", "NS"],
        answer: 2,
        explain: "MX (Mail Exchange) chỉ ra mail server. A trỏ tới IPv4, CNAME là bí danh, NS chỉ name server có thẩm quyền."
      },
      {
        q: "Bạn sắp chuyển API sang IP mới. Nên làm gì với TTL?",
        options: ["Tăng TTL lên 1 tuần trước khi đổi", "Hạ TTL xuống thấp từ trước, rồi mới đổi IP", "TTL không ảnh hưởng", "Xoá bản ghi rồi tạo lại"],
        answer: 1,
        explain: "Resolver đang cache theo TTL cũ. Hạ TTL trước đủ lâu để cache cũ hết hạn, khi đổi IP thì thay đổi lan nhanh."
      },
      {
        q: "Trong chuỗi phân giải, server nào trả lời IP cuối cùng của `api.example.com`?",
        options: ["Root server", "TLD server `.com`", "Authoritative name server của `example.com`", "Router nhà bạn"],
        answer: 2,
        explain: "Root và TLD chỉ chỉ đường tới server tiếp theo. Authoritative server của domain mới giữ bản ghi thật."
      }
    ]
  },

  "p00.m1.t3": {
    sections: [
      {
        h: "Cấu trúc một request và response",
        p: [
          "HTTP là giao thức request/response. Request gồm method, path, header và body tuỳ chọn. Response gồm status code, header và body. Header mang metadata như `Content-Type`, `Authorization`, `Cache-Control`, `Accept`."
        ],
        code: {
          lang: "text",
          file: "http-message.txt",
          src: `POST /api/tasks HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"title":"Viết test"}

HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/tasks/42

{"id":42,"title":"Viết test"}`
        }
      },
      {
        h: "Method và status code",
        p: [
          "Safe method không thay đổi trạng thái server: GET, HEAD, OPTIONS. Idempotent method gọi nhiều lần cho cùng trạng thái cuối như gọi một lần: GET, PUT, DELETE cùng các safe method. POST không idempotent: gửi lại có thể tạo hai bản ghi. PATCH không được đảm bảo idempotent. Client, proxy và retry logic dựa vào tính chất này để quyết định có được gửi lại hay không."
        ],
        list: [
          "2xx thành công: 200 OK, 201 Created, 204 No Content.",
          "3xx chuyển hướng: 301, 302, 304 Not Modified.",
          "4xx lỗi phía client: 400, 401 chưa xác thực, 403 không có quyền, 404, 409 xung đột, 422, 429 quá nhiều request.",
          "5xx lỗi phía server: 500, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout."
        ]
      },
      {
        h: "HTTP/1.1, HTTP/2, HTTP/3",
        list: [
          "HTTP/1.1: dạng văn bản, keep-alive để dùng lại kết nối TCP, nhưng mỗi kết nối chỉ xử lý một request tại một thời điểm, nên trình duyệt mở nhiều kết nối song song.",
          "HTTP/2: nhị phân, multiplexing nhiều stream trên một kết nối, nén header (HPACK). Vẫn trên TCP nên một gói mất làm chậm mọi stream (head-of-line blocking ở tầng TCP).",
          "HTTP/3: chạy trên QUIC (UDP). Các stream độc lập nên mất gói chỉ ảnh hưởng stream đó; bắt tay gộp với TLS 1.3 nên nhanh hơn, và kết nối có thể sống sót khi đổi mạng (Wi-Fi sang 4G)."
        ],
        p: [
          "Trong thực tế, ứng dụng Node.js thường nói HTTP/1.1 với reverse proxy hoặc load balancer, còn phía trước (CDN, load balancer) đảm nhận HTTP/2 và HTTP/3 với trình duyệt."
        ]
      },
      {
        h: "Quan sát bằng curl",
        p: [
          "Hãy tập đọc header response như `Cache-Control`, `Set-Cookie`, `Content-Encoding`. Chúng giải thích rất nhiều hành vi \"khó hiểu\" của trình duyệt."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `curl -v https://example.com              # xem header gửi và nhận
curl -I https://example.com              # chỉ lấy header (HEAD)
curl --http2 -sI https://example.com | head -1
curl -X POST https://api.example.com/api/tasks \\
  -H 'Content-Type: application/json' -d '{"title":"demo"}'`
        }
      }
    ],
    summary: [
      "HTTP gồm method, path, header, body; response có status code, header, body.",
      "Safe method không đổi trạng thái; idempotent method gọi lặp cho cùng kết quả. POST không idempotent.",
      "Nhóm 4xx là lỗi client, 5xx là lỗi server; chọn đúng giúp client và monitoring xử lý đúng.",
      "HTTP/2 multiplexing trên TCP; HTTP/3 chạy trên QUIC, tránh head-of-line blocking của TCP."
    ],
    pitfalls: [
      "Dùng GET để xoá hoặc thay đổi dữ liệu. Crawler, prefetch hay retry có thể vô tình kích hoạt.",
      "Trả 200 kèm `{\"error\": ...}` cho mọi lỗi, khiến client, monitoring và retry không phân biệt được.",
      "Retry POST tự động khi timeout mà không có idempotency key, dẫn tới tạo trùng đơn hàng."
    ],
    quiz: [
      {
        q: "Method nào sau đây là idempotent nhưng không safe?",
        options: ["GET", "POST", "DELETE", "HEAD"],
        answer: 2,
        explain: "DELETE thay đổi trạng thái nên không safe, nhưng xoá nhiều lần vẫn cho cùng trạng thái cuối nên idempotent. GET, HEAD vừa safe vừa idempotent; POST không idempotent."
      },
      {
        q: "Người dùng đã đăng nhập nhưng truy cập tài nguyên không thuộc quyền. Status code phù hợp?",
        options: ["401 Unauthorized", "403 Forbidden", "Luôn luôn 404 Not Found", "500 Internal Server Error"],
        answer: 1,
        explain: "401 là chưa xác thực. 403 là đã biết bạn là ai nhưng không cho phép. Đôi khi hệ thống trả 404 để giấu sự tồn tại của tài nguyên, nhưng không phải luôn luôn."
      },
      {
        q: "Ưu điểm chính của HTTP/2 so với HTTP/1.1 là gì?",
        options: ["Chạy trên UDP để tránh bắt tay TCP", "Nhiều request song song trên một kết nối TCP", "Bỏ hẳn yêu cầu TLS cho mọi kết nối", "Thay status code bằng mã lỗi nhị phân"],
        answer: 1,
        explain: "HTTP/2 cho phép nhiều stream song song (multiplexing) trên một kết nối và nén header bằng HPACK. Chạy trên UDP là đặc điểm của HTTP/3; HTTP/2 vẫn giữ nguyên method và status code."
      }
    ]
  },

  "p00.m1.t4": {
    sections: [
      {
        h: "TLS giải quyết ba vấn đề",
        p: [
          "HTTPS là HTTP chạy bên trong TLS. TLS đảm bảo ba điều: bảo mật (người ở giữa không đọc được nội dung), toàn vẹn (không sửa được dữ liệu mà không bị phát hiện), và xác thực (bạn đang nói chuyện đúng với `api.example.com` chứ không phải kẻ giả mạo).",
          "Không có TLS, bất kỳ ai trên đường truyền như Wi-Fi quán cà phê, router công ty, hay một máy khác trong cùng mạng đều có thể đọc token, mật khẩu, và chèn nội dung vào response."
        ]
      },
      {
        h: "Chứng chỉ và CA",
        p: [
          "Server có một cặp khoá: private key giữ bí mật, public key nằm trong chứng chỉ (certificate). Chứng chỉ gắn public key với tên miền và được ký bởi một Certificate Authority (CA). Trình duyệt và hệ điều hành có sẵn danh sách root CA tin cậy, nên kiểm tra được chuỗi: chứng chỉ server, được ký bởi intermediate CA, được ký bởi root CA.",
          "Let's Encrypt cấp chứng chỉ miễn phí, tự động gia hạn qua giao thức ACME (certbot, cert-manager trong Kubernetes, hoặc Caddy/Traefik tích hợp sẵn). Thời hạn chứng chỉ công khai đang bị rút ngắn theo lộ trình của CA/Browser Forum (tối đa 200 ngày từ 15/3/2026, 100 ngày từ 15/3/2027, 47 ngày từ 15/3/2029); Let's Encrypt dự kiến giảm mặc định từ 90 xuống 64 ngày (2/2027) rồi 45 ngày (2/2028). Vì vậy gia hạn thủ công không còn khả thi: bắt buộc phải tự động hoá."
        ]
      },
      {
        h: "TLS 1.3 handshake và SNI",
        p: [
          "Handshake là bước hai bên thống nhất thuật toán, xác thực server và tạo khoá phiên. Tóm tắt với TLS 1.3:"
        ],
        list: [
          "Client gửi ClientHello: phiên bản hỗ trợ, bộ mã, khoá trao đổi tạm thời, và SNI (tên miền muốn truy cập).",
          "Server trả ServerHello kèm chứng chỉ; hai bên tính ra khoá phiên chung (ECDHE), sau đó dữ liệu được mã hoá đối xứng.",
          "TLS 1.3 hoàn tất trong 1 round-trip, TLS 1.2 cần 2 round-trip.",
          "SNI cho phép một IP phục vụ nhiều domain với nhiều chứng chỉ, vì server biết client muốn domain nào ngay từ ClientHello."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Xem chuỗi chứng chỉ, phiên bản TLS, bộ mã
openssl s_client -connect example.com:443 -servername example.com </dev/null

# Xem ngày hết hạn và bên cấp chứng chỉ
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \\
  | openssl x509 -noout -dates -subject -issuer`
        }
      },
      {
        h: "Vì sao cả API nội bộ cũng cần HTTPS",
        p: [
          "Mạng nội bộ không an toàn như bạn nghĩ: một máy bị xâm nhập có thể nghe lén traffic cùng mạng. Mô hình zero trust coi mọi kết nối là không tin cậy. Các chuẩn như PCI DSS, và nghĩa vụ bảo vệ dữ liệu cá nhân theo Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, đều hướng tới việc mã hoá dữ liệu trên đường truyền.",
          "Trong thực tế: bật TLS cho kết nối PostgreSQL và Redis khi đi qua mạng, dùng mTLS hoặc service mesh giữa các service, và không bao giờ tắt kiểm tra chứng chỉ (`rejectUnauthorized: false`, `curl -k`) ở production."
        ]
      }
    ],
    summary: [
      "TLS cung cấp bảo mật, toàn vẹn và xác thực cho kết nối.",
      "Chứng chỉ gắn public key với domain, được CA ký; client kiểm tra chuỗi tới root CA tin cậy.",
      "TLS 1.3 bắt tay trong 1 round-trip; SNI cho phép nhiều domain trên cùng IP.",
      "Nên mã hoá cả traffic nội bộ, và không tắt kiểm tra chứng chỉ ở production."
    ],
    pitfalls: [
      "Đặt `NODE_TLS_REJECT_UNAUTHORIZED=0` để \"chạy cho được\", mở cửa cho tấn công man-in-the-middle.",
      "Quên tự động gia hạn chứng chỉ, dẫn tới sự cố hết hạn vào ngày nghỉ. Hãy dùng ACME và cảnh báo trước ngày hết hạn.",
      "Cấu hình server thiếu intermediate certificate: trình duyệt có thể vẫn chạy nhờ cache, nhưng curl hay Node.js báo lỗi."
    ],
    quiz: [
      {
        q: "Vai trò của CA trong TLS là gì?",
        options: ["Mã hoá toàn bộ dữ liệu thay cho server", "Ký chứng chỉ để xác nhận public key thuộc về domain", "Lưu private key cho server", "Phân giải DNS"],
        answer: 1,
        explain: "CA xác minh quyền kiểm soát domain rồi ký chứng chỉ. Private key luôn nằm ở server, dữ liệu do server và client tự mã hoá."
      },
      {
        q: "SNI giúp được điều gì?",
        options: ["Nén dữ liệu HTTPS", "Một IP phục vụ nhiều domain với chứng chỉ khác nhau", "Bỏ qua bước kiểm tra chứng chỉ", "Tăng độ dài khoá"],
        answer: 1,
        explain: "Client gửi tên miền trong ClientHello, nhờ đó server chọn đúng chứng chỉ trước khi mã hoá bắt đầu."
      },
      {
        q: "Vì sao không nên đặt `rejectUnauthorized: false` khi kết nối DB ở production?",
        options: ["Vì mỗi truy vấn sẽ chậm đi đáng kể do phải kiểm tra thêm", "Vì vẫn mã hoá nhưng không xác thực server, dễ bị giả mạo", "Vì PostgreSQL không hỗ trợ TLS nên tuỳ chọn này vô nghĩa", "Vì nó tắt hoàn toàn mã hoá, dữ liệu đi dạng văn bản thuần"],
        answer: 1,
        explain: "Tắt kiểm tra chứng chỉ thì bạn không biết đầu bên kia là ai, nên man-in-the-middle có thể chen vào. Mã hoá mà không xác thực thì mất phần lớn giá trị."
      }
    ]
  },

  "p00.m1.t5": {
    sections: [
      {
        h: "Từ HTML tới pixel",
        p: [
          "Sau khi nhận HTML, trình duyệt parse nó thành DOM (cây phần tử). CSS được parse thành CSSOM. Hai cây kết hợp thành render tree, chỉ chứa phần tử thực sự hiển thị. Tiếp theo là layout (tính vị trí, kích thước), paint (vẽ màu, chữ, ảnh) và composite (ghép các lớp lên màn hình).",
          "Khi parser gặp một thẻ script thông thường, nó dừng parse HTML để tải và chạy script, vì script có thể sửa DOM. Đó là lý do nên dùng thuộc tính `defer` hoặc `async`. CSS cũng chặn render: trình duyệt không vẽ khi chưa có CSSOM để tránh giao diện bị nháy."
        ]
      },
      {
        h: "Backend ảnh hưởng tới tốc độ trang ra sao",
        p: [
          "Dù bạn không viết frontend, nhiều chỉ số hiệu năng trang phụ thuộc trực tiếp vào backend:"
        ],
        list: [
          "TTFB (Time To First Byte): thời gian server trả byte đầu tiên. API chậm, SSR chậm thì cả trang chậm.",
          "Nén response (gzip, brotli) và header cache (`Cache-Control`, `ETag`) giảm dữ liệu phải tải lại.",
          "Trả đúng `Content-Type`; nếu sai, trình duyệt có thể từ chối chạy script hoặc áp style.",
          "Số request và kích thước JSON trả về cho SPA ảnh hưởng trực tiếp tới thời gian hiển thị dữ liệu."
        ]
      },
      {
        h: "Same-origin policy và CORS",
        p: [
          "Origin gồm ba phần: scheme, host, port. `https://app.example.com` và `https://api.example.com` là hai origin khác nhau. Same-origin policy ngăn JavaScript của origin này đọc response từ origin khác, để trang độc hại không đọc được dữ liệu ngân hàng của bạn nhờ cookie có sẵn.",
          "CORS là cơ chế để server nói rõ \"tôi cho phép origin X đọc response\". Với request không đơn giản (ví dụ có header `Authorization` hoặc `Content-Type: application/json`), trình duyệt gửi preflight `OPTIONS` trước. Lưu ý: CORS do trình duyệt thực thi, nó không bảo vệ API khỏi curl hay server khác."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['https://app.example.com'], // liệt kê cụ thể, không dùng '*' khi có credentials
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  await app.listen(3000);
}
bootstrap();`
        }
      }
    ],
    summary: [
      "Trình duyệt dựng DOM và CSSOM, kết hợp thành render tree, rồi layout, paint, composite.",
      "Script không có defer/async và CSS chặn quá trình hiển thị.",
      "Backend ảnh hưởng hiệu năng trang qua TTFB, nén, cache header và kích thước dữ liệu.",
      "Same-origin policy bảo vệ người dùng; CORS là cách server nới lỏng có kiểm soát, do trình duyệt thực thi."
    ],
    pitfalls: [
      "Đặt `Access-Control-Allow-Origin: *` cùng credentials; trình duyệt sẽ từ chối. Còn phản chiếu mọi origin thì mất an toàn.",
      "Nghĩ CORS là cơ chế xác thực bảo vệ API. Kẻ tấn công gọi trực tiếp bằng curl không bị CORS chặn.",
      "Middleware xác thực chặn request preflight `OPTIONS`, khiến frontend báo lỗi CORS khó hiểu."
    ],
    quiz: [
      {
        q: "Hai URL nào cùng origin?",
        options: ["http://example.com và https://example.com", "https://example.com và https://example.com:443/api", "https://a.example.com và https://b.example.com", "https://example.com:3000 và https://example.com:4000"],
        answer: 1,
        explain: "Cổng mặc định của https là 443 nên hai URL cùng scheme, host, port; path không tính vào origin. Các cặp khác khác scheme, host hoặc port."
      },
      {
        q: "CORS bảo vệ chống lại điều gì?",
        options: ["Mọi request trái phép tới API, kể cả từ curl", "JS của trang khác origin đọc response trong trình duyệt", "Kẻ tấn công chèn câu lệnh SQL qua tham số", "Lượng request khổng lồ làm sập server (DDoS)"],
        answer: 1,
        explain: "CORS và same-origin policy là cơ chế của trình duyệt. Chúng không chặn request từ curl, server hay công cụ tấn công, nên API vẫn cần xác thực và phân quyền."
      },
      {
        q: "Vì sao nên đặt `defer` cho thẻ script?",
        options: ["Để script chạy ngay, trước khi HTML được parse", "Để tải script song song và chạy sau khi parse HTML xong", "Để trình duyệt không cache file script này", "Để script được gọi API khác origin mà không cần CORS"],
        answer: 1,
        explain: "Script thường chặn parser. `defer` cho phép tải song song và chạy theo thứ tự sau khi DOM đã parse xong, giúp trang hiển thị sớm hơn."
      }
    ]
  },

  "p00.m1.t6": {
    sections: [
      {
        h: "Domain hoạt động thế nào",
        p: [
          "Bạn mua quyền sử dụng tên miền qua registrar (nhà đăng ký). Với `.vn` là các nhà đăng ký được VNNIC công nhận; với `.com` có Cloudflare, Namecheap và nhiều bên khác. Registrar ghi thông tin name server (NS) của domain lên registry của TLD. Từ đó mọi truy vấn DNS về domain được chuyển tới name server bạn chọn.",
          "Name server có thể là của chính registrar, hoặc một dịch vụ DNS riêng như Cloudflare DNS, AWS Route 53. Tách DNS khỏi registrar giúp bạn quản lý bản ghi bằng Terraform và chuyển hosting mà không đổi nơi mua domain."
        ]
      },
      {
        h: "Trỏ domain về server",
        p: [
          "Sau khi tạo bản ghi, kiểm tra bằng `dig +short api.example.com`. Nếu vẫn thấy giá trị cũ, có thể do cache theo TTL. Cuối cùng cấu hình HTTPS cho domain, thường bằng Let's Encrypt."
        ],
        code: {
          lang: "text",
          file: "zone-example.txt",
          src: `example.com.        300  IN  A      203.0.113.10
www.example.com.    300  IN  CNAME  example.com.
api.example.com.    300  IN  A      203.0.113.20
example.com.        300  IN  MX 10  mail.provider.com.
example.com.        300  IN  TXT    "v=spf1 include:_spf.provider.com ~all"`
        }
      },
      {
        h: "Các lựa chọn hosting",
        p: [
          "Mỗi lựa chọn đánh đổi giữa chi phí, quyền kiểm soát và công vận hành:"
        ],
        list: [
          "Shared hosting: nhiều website chung một server, rẻ, quản lý qua control panel. Phù hợp PHP/WordPress, thường không hợp cho Node.js chạy lâu dài hay Docker.",
          "VPS: máy ảo riêng, có quyền root. Bạn tự cài Node, Docker, Nginx, tự lo bảo mật, backup, cập nhật. Chi phí thấp, học được nhiều.",
          "Cloud IaaS (AWS, GCP, Azure): tài nguyên linh hoạt, dịch vụ managed (RDS, ElastiCache, load balancer), tính tiền theo sử dụng, cấu hình phức tạp hơn.",
          "PaaS (Render, Fly.io, Railway, Google Cloud Run...): đẩy code hoặc image lên là chạy, TLS sẵn, scale dễ. Nhanh nhất để ra mắt, nhưng chi phí cao hơn khi lớn và ít quyền kiểm soát. Hãy xét cả tương lai của nền tảng: ví dụ từ 2/2026 Heroku chuyển sang chế độ sustaining engineering (chỉ vá lỗi, không phát triển tính năng mới)."
        ]
      },
      {
        h: "Chọn thế nào cho dự án của bạn",
        p: [
          "Khi học, một VPS nhỏ giúp bạn hiểu Linux, SSH, Nginx, firewall. Khi làm sản phẩm với đội nhỏ, PaaS hoặc container service managed giảm công vận hành. Khi hệ thống lớn, có yêu cầu mạng riêng, tuân thủ, tối ưu chi phí, cloud IaaS kết hợp Terraform và Kubernetes là lựa chọn phổ biến.",
          "Dù chọn gì, hãy để database ở dịch vụ managed nếu có thể: backup, bản vá, failover là việc tốn công và rủi ro nếu tự làm."
        ]
      }
    ],
    summary: [
      "Registrar quản lý quyền sử dụng domain; name server quyết định bản ghi DNS.",
      "Trỏ domain bằng bản ghi A/AAAA hoặc CNAME, kiểm tra bằng `dig`.",
      "Shared hosting, VPS, cloud IaaS, PaaS đánh đổi giữa chi phí, quyền kiểm soát và công vận hành.",
      "Ưu tiên database managed để giảm rủi ro vận hành."
    ],
    pitfalls: [
      "Quên gia hạn domain, hoặc đăng ký bằng email cá nhân của nhân viên đã nghỉ, dẫn tới mất domain.",
      "Mở VPS ra Internet mà không cấu hình firewall, SSH key và cập nhật bảo mật.",
      "Chọn PaaS vì rẻ ban đầu mà không tính chi phí khi traffic và dữ liệu tăng."
    ],
    quiz: [
      {
        q: "Khi đổi name server của domain sang Cloudflare, bạn thay đổi ở đâu?",
        options: ["Trong file /etc/hosts của server", "Tại registrar nơi đăng ký domain", "Trong cấu hình Nginx", "Trong package.json"],
        answer: 1,
        explain: "Registrar cập nhật bản ghi NS lên registry của TLD. File hosts chỉ ảnh hưởng máy cục bộ, Nginx không quyết định DNS."
      },
      {
        q: "Lựa chọn nào cho bạn quyền root và tự quản lý toàn bộ phần mềm với chi phí thấp?",
        options: ["Shared hosting", "VPS", "PaaS", "CDN"],
        answer: 1,
        explain: "VPS là máy ảo riêng có quyền root. Shared hosting và PaaS giới hạn quyền kiểm soát, CDN chỉ phân phối nội dung."
      },
      {
        q: "Ưu điểm chính của PaaS là gì?",
        options: ["Luôn rẻ nhất khi hệ thống lên quy mô lớn", "Triển khai nhanh, nền tảng lo hạ tầng và TLS", "Được quyền root và tuỳ chỉnh kernel của máy", "Không cần domain hay DNS cho ứng dụng"],
        answer: 1,
        explain: "PaaS giảm công vận hành để bạn tập trung vào code. Đổi lại chi phí thường cao hơn khi lớn và bạn ít quyền kiểm soát hạ tầng."
      }
    ]
  },

  "p00.m2.t0": {
    sections: [
      {
        h: "Cấu trúc thư mục Linux",
        p: [
          "Linux có một cây thư mục duy nhất bắt đầu từ `/`. Ổ đĩa khác được mount vào một nhánh của cây này, không có ổ C, ổ D như Windows. Biết mỗi thư mục chứa gì giúp bạn tìm config, log và dữ liệu rất nhanh khi SSH vào server lạ."
        ],
        list: [
          "`/etc`: file cấu hình hệ thống và dịch vụ (nginx, ssh, systemd unit tuỳ chỉnh).",
          "`/var`: dữ liệu thay đổi: `/var/log` cho log, `/var/lib` cho dữ liệu dịch vụ (docker, postgresql).",
          "`/usr`: chương trình và thư viện cài từ package manager; `/usr/local` cho phần mềm bạn tự cài.",
          "`/home/<user>`: thư mục của từng người dùng; `/root` là home của root.",
          "`/tmp`: file tạm, có thể bị xoá khi khởi động lại; `/opt` thường chứa ứng dụng đóng gói sẵn."
        ]
      },
      {
        h: "Các lệnh điều hướng và thao tác file",
        code: {
          lang: "bash",
          file: "terminal",
          src: `pwd                         # đang ở đâu
ls -lah                     # liệt kê cả file ẩn, kích thước dễ đọc
cd /var/log && cd -         # cd - quay lại thư mục trước
mkdir -p app/{src,logs}     # tạo nhiều thư mục lồng nhau
cp -r app app-backup        # chép thư mục
mv old.conf new.conf        # đổi tên hoặc di chuyển
rm -r app-backup            # xoá thư mục (không có thùng rác!)
tree -L 2                   # xem cây thư mục 2 cấp (cần cài gói tree)`
        },
        p: [
          "Dùng phím Tab để tự hoàn thành tên file và `Ctrl+R` để tìm lại lệnh đã gõ. Hai thói quen này giúp bạn nhanh gấp đôi trên terminal.",
          "Trước khi xoá hàng loạt, hãy chạy lệnh ở dạng chỉ liệt kê (ví dụ `ls` hoặc `find` không có `-delete`) để xem chính xác những gì sẽ bị ảnh hưởng."
        ]
      },
      {
        h: "Tìm file và kiểm tra dung lượng",
        p: [
          "Sự cố kinh điển ở production: disk đầy vì log hoặc Docker image cũ, khiến database không ghi được và ứng dụng lỗi hàng loạt. `df` cho biết filesystem nào đầy, `du` cho biết thư mục nào chiếm chỗ, `find` giúp tìm file theo tên, kích thước, thời gian.",
          "Khi disk đầy, hãy dọn có chủ đích: cấu hình logrotate cho log ứng dụng, chạy `docker image prune` để xoá image lơ lửng (dangling, không còn tag) hoặc `docker image prune -a` để xoá mọi image không có container nào dùng, và đặt cảnh báo khi disk vượt khoảng 80% để xử lý trước khi sự cố xảy ra. Đừng xoá bừa trong `/var/lib`, vì đó là dữ liệu của database và Docker."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `df -h                                   # dung lượng từng filesystem
du -sh /var/log/* | sort -h | tail      # thư mục nào lớn nhất
find /var/log -name '*.log' -size +100M # file log lớn hơn 100MB
find /tmp -type f -mtime +7             # file sửa đổi hơn 7 ngày trước
find . -name 'node_modules' -type d -prune  # tìm node_modules
docker system df                        # dung lượng Docker dùng`
        }
      }
    ],
    summary: [
      "Linux có một cây thư mục duy nhất từ `/`; biết `/etc`, `/var`, `/usr`, `/home`, `/tmp` chứa gì.",
      "Thành thạo `ls`, `cd`, `cp`, `mv`, `rm`, `mkdir -p` cùng phím Tab và `Ctrl+R`.",
      "`df -h` cho biết filesystem nào đầy, `du -sh` cho biết thư mục nào chiếm chỗ.",
      "`find` tìm file theo tên, loại, kích thước, thời gian sửa đổi."
    ],
    pitfalls: [
      "Chạy `rm -rf` với biến rỗng, ví dụ `rm -rf $DIR/`, có thể xoá nhầm thư mục gốc. Dùng `set -u` và kiểm tra biến trước.",
      "Xoá file log đang được process ghi: dung lượng không được giải phóng cho tới khi process đóng file. Hãy truncate (`: > file.log`) hoặc cấu hình logrotate.",
      "Lưu dữ liệu quan trọng trong `/tmp` rồi mất sau khi reboot."
    ],
    quiz: [
      {
        q: "File cấu hình của Nginx thường nằm ở đâu?",
        options: ["/var/log/nginx", "/etc/nginx", "/usr/bin/nginx", "/tmp/nginx"],
        answer: 1,
        explain: "`/etc` chứa cấu hình hệ thống và dịch vụ. `/var/log/nginx` chứa log, `/usr/bin` hoặc `/usr/sbin` chứa file thực thi."
      },
      {
        q: "Disk báo đầy 100%. Lệnh nào giúp tìm thư mục chiếm nhiều dung lượng nhất?",
        options: ["`df -h`", "`du -sh /* | sort -h`", "`ls -l /`", "`free -h`"],
        answer: 1,
        explain: "`du` đo dung lượng từng thư mục, sắp xếp giúp thấy thư mục lớn nhất. `df` chỉ cho biết filesystem đầy, `free` là RAM."
      },
      {
        q: "Bạn xoá file log 5GB bằng `rm` nhưng `df` vẫn báo đầy. Vì sao?",
        options: ["Linux chuyển file đã xoá vào thùng rác", "Process vẫn giữ file mở nên dữ liệu chưa được giải phóng", "`df` lưu cache kết quả, vài giờ sau mới cập nhật", "Phải reboot thì filesystem mới tính lại dung lượng"],
        answer: 1,
        explain: "Xoá chỉ gỡ tên file; inode và dữ liệu còn đó khi process còn giữ file descriptor. Restart process hoặc truncate file thay vì xoá. `lsof | grep deleted` giúp tìm ra."
      }
    ]
  },

  "p00.m2.t1": {
    sections: [
      {
        h: "User, group và root",
        p: [
          "Mỗi process chạy dưới danh nghĩa một user (UID) và thuộc các group (GID). Quyền truy cập file được kiểm tra dựa trên các định danh này. root (UID 0) có toàn quyền, vượt qua gần như mọi kiểm tra quyền.",
          "Vì vậy nguyên tắc least privilege (quyền tối thiểu) rất quan trọng: mỗi dịch vụ chạy bằng user riêng, chỉ có quyền đúng với những gì nó cần. Nếu ứng dụng Node.js bị khai thác lỗ hổng, kẻ tấn công chỉ có quyền của user `app`, không phải root."
        ]
      },
      {
        h: "Quản lý người dùng và sudo",
        code: {
          lang: "bash",
          file: "terminal",
          src: `sudo adduser deploy                 # tạo user có home, hỏi mật khẩu (Debian/Ubuntu)
sudo usermod -aG sudo deploy        # thêm vào nhóm sudo (-a: giữ các nhóm cũ)
sudo usermod -aG docker deploy      # cho phép dùng Docker (tương đương quyền root!)
id deploy                           # xem UID, GID, các nhóm
sudo useradd --system --no-create-home --shell /usr/sbin/nologin app  # user dịch vụ
sudo -u app whoami                  # chạy lệnh dưới danh nghĩa user app
sudo visudo                         # sửa /etc/sudoers an toàn (kiểm tra cú pháp)`
        },
        p: [
          "`sudo` cho phép chạy lệnh với quyền root và ghi lại lịch sử, tốt hơn nhiều so với đăng nhập thẳng bằng root. Chú ý rằng nhóm `docker` có quyền tương đương root, vì ai điều khiển Docker daemon đều có thể mount thư mục gốc của host vào container."
        ]
      },
      {
        h: "chmod, chown và umask",
        p: [
          "`chmod` đổi quyền, `chown` đổi owner và group. `umask` quyết định quyền mặc định khi tạo file mới: với umask `022`, file mới có quyền `644` và thư mục `755`. Với umask `077`, chỉ owner truy cập được."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `sudo chown -R app:app /opt/task-api      # ứng dụng thuộc user app
sudo chmod 750 /opt/task-api             # owner full, group đọc/vào, others không
sudo chmod 640 /opt/task-api/.env        # secret: owner rw, group r
umask                                    # xem umask hiện tại, thường 0022`
        }
      },
      {
        h: "Áp dụng trong thực tế",
        list: [
          "Không dùng root cho SSH hằng ngày; tạo user riêng có sudo.",
          "Ứng dụng chạy bằng user hệ thống không có shell đăng nhập.",
          "Trong Dockerfile, thêm `USER node` (hoặc user riêng) để container không chạy bằng root.",
          "Cấp sudo có giới hạn: một user chỉ được `sudo systemctl restart task-api`, không phải mọi lệnh."
        ],
        p: [
          "Kiểm tra định kỳ: ai có trong nhóm `sudo`, `docker`, và ai có SSH key trong `authorized_keys`. Nhân viên nghỉ việc thì phải thu hồi ngay."
        ]
      }
    ],
    summary: [
      "Mỗi process chạy với UID/GID; root có toàn quyền nên hạn chế dùng.",
      "Dùng `sudo` thay vì đăng nhập root, và tạo user hệ thống riêng cho từng dịch vụ.",
      "`chmod`, `chown`, `umask` kiểm soát quyền file; secret chỉ nên `600` hoặc `640`.",
      "Nhóm `docker` tương đương quyền root, cần cấp cẩn thận."
    ],
    pitfalls: [
      "Dùng `usermod -G` thiếu cờ `-a`, làm user bị gỡ khỏi mọi nhóm cũ, kể cả nhóm sudo.",
      "Chạy ứng dụng Node.js hoặc container bằng root \"cho khỏi lỗi quyền\".",
      "Sửa `/etc/sudoers` trực tiếp bằng editor thường, lỗi cú pháp có thể khoá mất quyền sudo. Luôn dùng `visudo`."
    ],
    quiz: [
      {
        q: "Nguyên tắc least privilege nghĩa là gì?",
        options: ["Mọi dịch vụ chạy bằng root cho đơn giản", "Mỗi user, dịch vụ chỉ được cấp đúng quyền cần thiết", "Chỉ root được SSH", "Không dùng group"],
        answer: 1,
        explain: "Cấp quyền tối thiểu giới hạn thiệt hại khi một thành phần bị xâm nhập. Chạy mọi thứ bằng root thì một lỗ hổng là mất cả server."
      },
      {
        q: "Vì sao thêm user vào nhóm `docker` cần cân nhắc như cấp quyền root?",
        options: ["Vì container chạy chậm hơn khi user không phải root", "Vì user đó có thể mount `/` của host vào container và sửa như root", "Vì Docker sẽ xoá file trong home của user đó", "Vì nhóm docker bỏ qua mật khẩu khi đăng nhập SSH"],
        answer: 1,
        explain: "Docker daemon chạy bằng root. Ai điều khiển được nó có thể chạy container với volume `/:/host` và sửa mọi file trên máy."
      },
      {
        q: "Với umask `022`, file mới tạo có quyền mặc định là gì?",
        options: ["777", "644", "600", "755"],
        answer: 1,
        explain: "File mặc định bắt đầu từ 666, trừ đi 022 thành 644. Thư mục bắt đầu từ 777 nên thành 755."
      }
    ]
  },

  "p00.m2.t2": {
    sections: [
      {
        h: "Xem và tìm process",
        p: [
          "Mỗi process có PID, process cha (PPID), user, trạng thái, lượng CPU và RAM đang dùng. Khi server chậm, việc đầu tiên là tìm process đang ngốn tài nguyên.",
          "Nhớ phân biệt: `%CPU` cao liên tục thường là vòng lặp nặng hoặc GC, RSS tăng dần theo thời gian gợi ý rò rỉ bộ nhớ, còn process ở trạng thái `D` đang chờ I/O không ngắt được, thường do disk hoặc storage mạng chậm. Process `Z` (zombie) là process con đã thoát nhưng cha chưa thu hồi."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `ps aux --sort=-%mem | head         # process tốn RAM nhất
ps -ef --forest | less             # cây process cha/con
pgrep -a node                      # tìm PID các process node
htop                               # giao diện tương tác (F6 sắp xếp, F9 kill)
ss -ltnp                           # process nào đang lắng nghe cổng nào`
        }
      },
      {
        h: "Signal: SIGTERM và SIGKILL",
        p: [
          "`kill` thực chất là gửi signal tới process. SIGTERM (15, mặc định) là lời yêu cầu dừng lịch sự: process có thể bắt signal này, đóng kết nối, hoàn tất request đang xử lý rồi mới thoát. SIGKILL (9) do kernel thực thi ngay, process không bắt được, không kịp dọn dẹp gì.",
          "Docker, Kubernetes và systemd đều gửi SIGTERM trước, chờ một khoảng thời gian (Kubernetes mặc định 30 giây), hết thời gian mới gửi SIGKILL. Ứng dụng backend cần xử lý SIGTERM để graceful shutdown, nếu không mỗi lần deploy sẽ làm rớt request.",
          "Một lưu ý khi chạy trong container: process PID 1 không được kernel áp dụng hành vi mặc định cho signal, nên nếu Node.js chạy qua shell (`CMD npm start`) thì SIGTERM có thể không tới được ứng dụng. Dùng dạng exec `CMD [\"node\", \"dist/main.js\"]` hoặc một init nhỏ như tini."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `// NestJS: bật shutdown hooks để onModuleDestroy/onApplicationShutdown chạy khi nhận SIGTERM
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();
await app.listen(3000);

// Node.js thuần:
// process.on('SIGTERM', async () => { server.close(); await pool.end(); process.exit(0); });`
        }
      },
      {
        h: "systemd và journalctl",
        p: [
          "Trên hầu hết bản phân phối Linux hiện đại, systemd là process đầu tiên (PID 1) và quản lý các dịch vụ. Một unit file mô tả cách chạy dịch vụ: lệnh, user, biến môi trường, tự khởi động lại khi crash. Log của dịch vụ được thu vào journal và đọc bằng `journalctl`."
        ],
        code: {
          lang: "ini",
          file: "/etc/systemd/system/task-api.service",
          src: `[Unit]
Description=Task API
After=network-online.target
Wants=network-online.target

[Service]
User=app
WorkingDirectory=/opt/task-api
EnvironmentFile=/opt/task-api/.env
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target`
        }
      },
      {
        h: "Lệnh vận hành hằng ngày",
        code: {
          lang: "bash",
          file: "terminal",
          src: `sudo systemctl daemon-reload            # nạp lại sau khi sửa unit file
sudo systemctl enable --now task-api    # bật khi khởi động và chạy ngay
systemctl status task-api               # trạng thái và vài dòng log cuối
sudo systemctl restart task-api
journalctl -u task-api -f               # theo dõi log trực tiếp
journalctl -u task-api --since '1 hour ago' -p err   # chỉ lỗi trong 1 giờ qua`
        },
        p: [
          "Khi dịch vụ không lên, `systemctl status` và `journalctl -u` gần như luôn cho bạn biết lý do: sai đường dẫn, thiếu biến môi trường, cổng đã bị chiếm."
        ]
      }
    ],
    summary: [
      "Dùng `ps`, `htop`, `pgrep`, `ss -ltnp` để tìm process và cổng đang dùng.",
      "SIGTERM cho phép dọn dẹp; SIGKILL dừng ngay, không bắt được.",
      "Ứng dụng backend phải xử lý SIGTERM để graceful shutdown khi deploy.",
      "systemd quản lý dịch vụ qua unit file; `journalctl -u` để đọc log."
    ],
    pitfalls: [
      "Dùng `kill -9` như thói quen. Hãy thử SIGTERM trước để process đóng kết nối DB và hoàn tất request.",
      "Quên `systemctl daemon-reload` sau khi sửa unit file, nên thay đổi không có hiệu lực.",
      "Không xử lý SIGTERM trong ứng dụng, khiến mỗi lần rolling deploy đều có request lỗi 502."
    ],
    quiz: [
      {
        q: "Khác biệt quan trọng giữa SIGTERM và SIGKILL?",
        options: ["SIGTERM dừng process nhanh hơn SIGKILL", "Process bắt được SIGTERM để dọn dẹp, SIGKILL thì không", "Chỉ root mới gửi được SIGKILL tới process", "Hai signal giống nhau, chỉ khác số hiệu"],
        answer: 1,
        explain: "SIGTERM là yêu cầu dừng, ứng dụng có thể xử lý để thoát an toàn. SIGKILL do kernel thực thi ngay lập tức."
      },
      {
        q: "Kubernetes dừng một pod như thế nào?",
        options: ["Gửi SIGKILL ngay để giải phóng tài nguyên", "Gửi SIGTERM, chờ grace period (30 giây), rồi mới SIGKILL", "Gửi SIGHUP để process tự nạp lại cấu hình", "Gửi SIGSTOP rồi xoá container khỏi node"],
        answer: 1,
        explain: "Kubernetes cho ứng dụng thời gian graceful shutdown qua `terminationGracePeriodSeconds`, mặc định 30 giây, rồi mới buộc dừng."
      },
      {
        q: "Lệnh nào xem log của dịch vụ systemd `task-api` theo thời gian thực?",
        options: ["`tail -f /etc/task-api`", "`journalctl -u task-api -f`", "`systemctl log task-api`", "`ps -f task-api`"],
        answer: 1,
        explain: "`journalctl -u <unit> -f` đọc journal của unit và theo dõi dòng mới. Các lệnh khác không tồn tại hoặc không đọc log."
      }
    ]
  },

  "p00.m2.t3": {
    sections: [
      {
        h: "Pipe và redirect",
        p: [
          "Triết lý Unix: mỗi công cụ làm tốt một việc, rồi nối chúng lại. Pipe `|` đưa stdout của lệnh trước làm stdin của lệnh sau. Redirect `>` ghi đè ra file, `>>` nối thêm, `2>` chuyển stderr, `2>&1` gộp stderr vào stdout.",
          "Nhờ vậy, bạn có thể phân tích file log vài GB trên server trong vài giây mà không cần tải về hay viết script.",
          "Lưu ý `>` ghi đè không hỏi lại. Khi cần vừa xem output trên màn hình vừa lưu ra file, dùng `tee`: `npm test 2>&1 | tee test.log`."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `npm run build > build.log 2>&1        # ghi cả stdout lẫn stderr vào file
cmd 2>/dev/null                        # bỏ stderr
grep -c ' 500 ' access.log             # đếm dòng có mã 500
cat access.log | wc -l                 # đếm tổng số dòng`
        }
      },
      {
        h: "Bộ công cụ xử lý văn bản",
        p: [
          "Mỗi công cụ dưới đây nhỏ và chuyên một việc. Sức mạnh đến từ việc nối chúng thành một pipeline."
        ],
        list: [
          "`grep`: lọc dòng theo mẫu. `-i` không phân biệt hoa thường, `-v` đảo ngược, `-E` regex mở rộng, `-r` đệ quy, `-C 3` in thêm 3 dòng ngữ cảnh.",
          "`cut` và `awk`: lấy cột. `awk '{print $9}'` in cột thứ 9 (tách theo khoảng trắng).",
          "`sort`, `uniq -c`: sắp xếp và đếm số lần xuất hiện (uniq chỉ gộp các dòng trùng liền kề, nên phải sort trước).",
          "`sed`: thay thế văn bản theo luồng, ví dụ `sed 's/foo/bar/g'`.",
          "`xargs`: biến stdin thành tham số cho lệnh khác.",
          "`jq`: truy vấn và định dạng JSON, không thể thiếu khi log có cấu trúc."
        ]
      },
      {
        h: "Ví dụ đọc log thực tế",
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Top 10 IP gọi nhiều nhất (Nginx combined log)
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head

# Phân bố status code
awk '{print $9}' access.log | sort | uniq -c | sort -rn

# Top endpoint trả 5xx
awk '$9 ~ /^5/ {print $7}' access.log | sort | uniq -c | sort -rn | head

# Log JSON của ứng dụng (pino): lọc lỗi, lấy thời gian và message
jq -r 'select(.level >= 50) | "\\(.time) \\(.msg)"' app.log | tail -20

# Tìm và xoá file .tmp (an toàn với tên có khoảng trắng)
find . -name '*.tmp' -print0 | xargs -0 rm -f`
        },
        p: [
          "Log JSON có cấu trúc giúp `jq` lọc theo field chính xác, ví dụ theo `requestId` hay `userId`, thay vì dò bằng regex dễ sai.",
          "Với log đang được ghi liên tục, `tail -f app.log | grep --line-buffered ERROR` giúp theo dõi lỗi theo thời gian thực. Khi log đã tập trung về hệ thống như Loki hay Elasticsearch, các kỹ năng lọc và đếm này vẫn giữ nguyên giá trị, chỉ đổi cú pháp truy vấn."
        ]
      }
    ],
    summary: [
      "Pipe nối stdout lệnh này vào stdin lệnh kia; redirect đưa output ra file.",
      "`grep` lọc dòng, `awk`/`cut` lấy cột, `sort | uniq -c` đếm tần suất.",
      "`sed` thay thế văn bản, `xargs` biến dòng thành tham số, `jq` xử lý JSON.",
      "Kết hợp các công cụ này để phân tích log lớn ngay trên server."
    ],
    pitfalls: [
      "Dùng `uniq` khi chưa `sort`, kết quả đếm sai vì uniq chỉ gộp dòng trùng liền kề.",
      "Viết `cmd 2>&1 > file` thay vì `cmd > file 2>&1`; thứ tự redirect sai khiến stderr vẫn in ra màn hình.",
      "Dùng `sed -i` trên file quan trọng mà không backup; trên macOS cú pháp `-i` còn khác GNU."
    ],
    quiz: [
      {
        q: "Lệnh nào đếm số lần xuất hiện của mỗi IP trong file đã có một IP mỗi dòng?",
        options: ["`uniq -c ips.txt`", "`sort ips.txt | uniq -c`", "`grep -c ips.txt`", "`wc -l ips.txt`"],
        answer: 1,
        explain: "`uniq -c` chỉ gộp các dòng giống nhau liền kề, nên phải `sort` trước. `wc -l` chỉ đếm tổng số dòng."
      },
      {
        q: "`npm test > out.log 2>&1` làm gì?",
        options: ["Chỉ ghi stderr vào file", "Ghi cả stdout và stderr vào out.log", "Ghi stdout vào file, stderr ra màn hình", "Chạy lệnh ở background"],
        answer: 1,
        explain: "Đầu tiên stdout được chuyển vào file, sau đó `2>&1` cho stderr đi cùng chỗ với stdout, tức là cùng vào file."
      },
      {
        q: "Công cụ nào phù hợp nhất để lọc log dạng JSON theo field `level`?",
        options: ["cut", "jq", "tr", "wc"],
        answer: 1,
        explain: "`jq` hiểu cấu trúc JSON nên lọc theo field chính xác. cut, tr, wc chỉ làm việc với văn bản thuần."
      }
    ]
  },

  "p00.m2.t4": {
    sections: [
      {
        h: "SSH và xác thực bằng khoá",
        p: [
          "SSH là giao thức đăng nhập và chạy lệnh từ xa qua kênh mã hoá. Có hai cách xác thực chính: mật khẩu và khoá. Với khoá, bạn có private key giữ trên máy mình, còn public key được đặt vào `~/.ssh/authorized_keys` trên server. Server kiểm tra rằng bạn có private key tương ứng mà không bao giờ cần gửi nó qua mạng.",
          "Đăng nhập bằng khoá an toàn hơn mật khẩu nhiều: không bị dò mật khẩu (brute force), và mỗi máy hoặc mỗi người có khoá riêng, thu hồi dễ dàng. Hiện nay nên dùng loại khoá ed25519: ngắn, nhanh, an toàn.",
          "Passphrase bảo vệ private key nếu laptop bị mất. Để không phải gõ lại liên tục, dùng `ssh-agent` (hoặc keychain của hệ điều hành) để giữ khoá đã mở khoá trong phiên làm việc."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `ssh-keygen -t ed25519 -C "ban@laptop"        # tạo khoá, nên đặt passphrase
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@203.0.113.10
ssh deploy@203.0.113.10`
        }
      },
      {
        h: "~/.ssh/config giúp gõ ít hơn",
        code: {
          lang: "text",
          file: "~/.ssh/config",
          src: `Host staging
  HostName 203.0.113.10
  User deploy
  IdentityFile ~/.ssh/id_ed25519

Host db-private
  HostName 10.0.2.15
  User deploy
  ProxyJump staging        # đi qua staging (bastion) để vào máy trong mạng riêng`
        },
        p: [
          "Giờ chỉ cần `ssh staging` hoặc `ssh db-private`. `ProxyJump` rất hữu ích khi server nằm trong mạng riêng và chỉ truy cập được qua một bastion host."
        ]
      },
      {
        h: "Chép file và port forwarding",
        code: {
          lang: "bash",
          file: "terminal",
          src: `scp ./dist.tar.gz staging:/tmp/                    # chép một file
rsync -avz --delete ./dist/ staging:/opt/app/dist/ # đồng bộ thư mục, chỉ gửi phần thay đổi

# Local forwarding: mở localhost:5433 trên máy bạn, đi qua staging tới Postgres nội bộ
ssh -N -L 5433:10.0.2.20:5432 staging
psql -h localhost -p 5433 -U app taskdb`
        },
        p: [
          "Local port forwarding cho phép bạn truy cập database trong mạng riêng mà không cần mở cổng 5432 ra Internet.",
          "Ngược lại, remote forwarding (`ssh -R`) mở một cổng trên server trỏ về máy bạn, đôi khi dùng để demo nhanh một dịch vụ đang chạy local. Hãy tắt đường hầm khi không dùng, vì nó là một lối vào mạng nội bộ."
        ]
      },
      {
        h: "Làm cứng SSH server",
        p: [
          "Sau khi chắc chắn đăng nhập bằng khoá thành công (giữ nguyên một phiên đang mở để phòng hờ), sửa `/etc/ssh/sshd_config` hoặc tạo file trong `/etc/ssh/sshd_config.d/`:"
        ],
        code: {
          lang: "text",
          file: "/etc/ssh/sshd_config.d/00-hardening.conf",
          src: `PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes`
        },
        list: [
          "Với sshd, giá trị ĐẦU TIÊN đọc được của mỗi tuỳ chọn sẽ thắng, và file trong `sshd_config.d/` được nạp theo thứ tự tên. Vì vậy đặt tên bắt đầu bằng `00-` để không bị file khác (ví dụ `50-cloud-init.conf` trên image cloud có thể chứa `PasswordAuthentication yes`) lấn át. Xem cấu hình thực sự đang áp dụng bằng `sudo sshd -T | grep -Ei 'passwordauth|permitroot'`.",
          "Kiểm tra cú pháp bằng `sudo sshd -t` rồi reload dịch vụ SSH (tên unit là `ssh` trên Ubuntu/Debian, `sshd` trên nhiều bản khác).",
          "Chỉ mở cổng 22 cho IP cần thiết bằng firewall (ufw, security group), cân nhắc thêm fail2ban."
        ]
      }
    ],
    summary: [
      "Dùng khoá ed25519 thay mật khẩu; public key nằm trong `authorized_keys` trên server.",
      "`~/.ssh/config` đặt alias; `ProxyJump` đi qua bastion vào mạng riêng.",
      "`scp` chép file, `rsync` đồng bộ hiệu quả, `ssh -L` chuyển tiếp cổng an toàn.",
      "Tắt đăng nhập root và mật khẩu sau khi đã kiểm tra đăng nhập bằng khoá."
    ],
    pitfalls: [
      "Tắt `PasswordAuthentication` khi chưa thử đăng nhập bằng khoá, tự khoá mình khỏi server. Luôn giữ một phiên SSH đang mở khi sửa cấu hình.",
      "Chia sẻ một private key cho cả nhóm hoặc commit key vào repo.",
      "Quyền `~/.ssh` quá rộng khiến SSH từ chối dùng khoá; thư mục cần `700`, private key `600`."
    ],
    quiz: [
      {
        q: "Khi đăng nhập SSH bằng khoá, file nào nằm trên server?",
        options: ["Private key", "Public key trong `~/.ssh/authorized_keys`", "Cả hai", "Không cần file nào"],
        answer: 1,
        explain: "Server chỉ giữ public key. Private key luôn ở máy client và không bao giờ được gửi đi."
      },
      {
        q: "Lệnh `ssh -N -L 5433:10.0.2.20:5432 staging` dùng để làm gì?",
        options: ["Mở cổng 5432 của máy bạn ra Internet", "Chuyển tiếp localhost:5433 trên máy bạn qua staging tới 10.0.2.20:5432", "Chép database về máy", "Đổi cổng SSH"],
        answer: 1,
        explain: "Đây là local port forwarding: kết nối tới cổng 5433 trên máy bạn được đưa qua đường hầm SSH tới Postgres trong mạng riêng."
      },
      {
        q: "Trước khi đặt `PasswordAuthentication no`, bạn cần làm gì?",
        options: ["Reboot server", "Kiểm tra đăng nhập bằng khoá thành công và giữ một phiên đang mở", "Xoá authorized_keys", "Đổi mật khẩu root"],
        answer: 1,
        explain: "Nếu khoá chưa hoạt động mà đã tắt mật khẩu, bạn sẽ bị khoá ngoài. Phiên đang mở giúp bạn sửa lại nếu có sai sót."
      }
    ]
  },

  "p00.m2.t5": {
    sections: [
      {
        h: "Vì sao cần bash script",
        p: [
          "Mọi việc bạn gõ tay hơn hai lần đều nên được viết thành script: cài môi trường, backup, deploy đơn giản, dọn log. Script giúp công việc lặp lại được, ít sai và có thể review như code. Dù CI/CD dùng YAML, bên trong mỗi bước thường vẫn là lệnh shell, nên viết bash tốt là kỹ năng dùng hằng ngày."
        ]
      },
      {
        h: "Cú pháp cơ bản và strict mode",
        p: [
          "Mặc định bash rất dễ dãi: lệnh lỗi vẫn chạy tiếp, biến chưa đặt được coi là rỗng. `set -euo pipefail` bật chế độ nghiêm ngặt: `-e` dừng khi một lệnh lỗi, `-u` báo lỗi khi dùng biến chưa đặt, `-o pipefail` làm pipe thất bại nếu bất kỳ lệnh nào trong pipe lỗi."
        ],
        code: {
          lang: "bash",
          file: "scripts/backup.sh",
          src: `#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="\${1:?Cách dùng: backup.sh <thư mục> [nơi lưu]}"
DEST_DIR="\${2:-/var/backups/app}"
KEEP_DAYS=7
STAMP="$(date +%Y%m%d-%H%M%S)"

log() { echo "[$(date -Iseconds)] $*"; }

mkdir -p "$DEST_DIR"
ARCHIVE="$DEST_DIR/backup-$STAMP.tar.gz"

log "Nén $SRC_DIR -> $ARCHIVE"
tar -czf "$ARCHIVE" -C "$(dirname "$SRC_DIR")" "$(basename "$SRC_DIR")"

log "Xoá bản backup cũ hơn $KEEP_DAYS ngày"
find "$DEST_DIR" -name 'backup-*.tar.gz' -mtime +"$KEEP_DAYS" -print -delete

for f in "$DEST_DIR"/backup-*.tar.gz; do
  if [[ -s "$f" ]]; then log "OK: $f"; fi
done`
        }
      },
      {
        h: "Exit code và idempotent",
        p: [
          "Mọi lệnh trả về exit code: 0 là thành công, khác 0 là lỗi. `$?` chứa exit code của lệnh vừa chạy. CI dựa vào exit code để quyết định pipeline pass hay fail, nên script của bạn phải thoát khác 0 khi có lỗi.",
          "Idempotent nghĩa là chạy nhiều lần cho cùng kết quả: `mkdir -p` thay vì `mkdir`, kiểm tra đã cài rồi thì bỏ qua (`command -v docker >/dev/null || install_docker`). Điều này đặc biệt quan trọng với script cài đặt môi trường.",
          "Dùng `trap` để dọn dẹp khi script thoát giữa chừng, ví dụ `trap 'rm -f \"$TMP\"' EXIT` xoá file tạm dù script thành công hay lỗi."
        ]
      },
      {
        h: "Lập lịch bằng cron",
        code: {
          lang: "bash",
          file: "terminal",
          src: `crontab -e
# phút giờ ngày tháng thứ  lệnh
# Chạy backup lúc 2:30 sáng mỗi ngày, ghi log
30 2 * * * /opt/scripts/backup.sh /opt/task-api/uploads >> /var/log/backup.log 2>&1`
        },
        p: [
          "Cron chạy với môi trường tối giản: PATH ngắn, thư mục hiện tại khác. Luôn dùng đường dẫn tuyệt đối và ghi log ra file. Trên hệ thống dùng systemd, systemd timer là lựa chọn thay thế có log trong journal và dễ theo dõi hơn."
        ]
      }
    ],
    summary: [
      "Bắt đầu script bằng `#!/usr/bin/env bash` và `set -euo pipefail`.",
      "Luôn đặt biến trong dấu ngoặc kép, ví dụ `\"$DIR\"`, để tránh lỗi với khoảng trắng.",
      "Exit code 0 là thành công; CI dựa vào đó để pass hoặc fail.",
      "Viết script idempotent và dùng đường dẫn tuyệt đối khi chạy qua cron."
    ],
    pitfalls: [
      "Không đặt biến trong ngoặc kép, khiến tên file có khoảng trắng bị tách thành nhiều tham số.",
      "Thiếu `set -e`, bước nén lỗi nhưng bước xoá bản cũ vẫn chạy, và bạn mất hết backup.",
      "Script chạy tay thì được nhưng chạy bằng cron thì lỗi vì PATH và thư mục hiện tại khác."
    ],
    quiz: [
      {
        q: "`set -o pipefail` có tác dụng gì?",
        options: ["Dừng script khi gặp biến chưa đặt", "Làm pipe trả mã lỗi nếu bất kỳ lệnh nào trong pipe thất bại", "Chạy pipe song song", "Tắt pipe"],
        answer: 1,
        explain: "Mặc định exit code của pipe là của lệnh cuối. Với pipefail, lỗi ở giữa pipe cũng được phát hiện. Kiểm tra biến chưa đặt là việc của `-u`."
      },
      {
        q: "Exit code nào báo hiệu lệnh chạy thành công?",
        options: ["1", "0", "-1", "255"],
        answer: 1,
        explain: "Theo quy ước Unix, 0 là thành công, mọi giá trị khác 0 là lỗi."
      },
      {
        q: "Vì sao script chạy bằng cron nên dùng đường dẫn tuyệt đối?",
        options: ["Vì cron chạy nhanh hơn", "Vì cron có PATH và thư mục làm việc khác với phiên đăng nhập của bạn", "Vì cron không hỗ trợ bash", "Vì đường dẫn tương đối bị cấm"],
        answer: 1,
        explain: "Cron chạy với môi trường tối giản, không nạp profile của bạn. Đường dẫn tương đối và lệnh ngoài PATH mặc định có thể không tìm thấy."
      }
    ]
  },

  "p00.m2.t6": {
    sections: [
      {
        h: "Kiểm tra kết nối từng bước",
        p: [
          "Khi service A không gọi được service B, bạn cần công cụ để trả lời: có phân giải được tên không, có tới được máy không, cổng có mở không, HTTP trả về gì. Mỗi công cụ dưới đây trả lời một câu hỏi.",
          "Đi theo đúng thứ tự này giúp bạn khoanh vùng nhanh: DNS sai thì không cần xem firewall, cổng đóng thì không cần đọc log ứng dụng. Trong container hay pod, nhớ chạy lệnh từ chính nơi gặp lỗi (ví dụ `kubectl exec` hoặc `docker exec`), vì mạng bên trong có thể khác hẳn máy của bạn."
        ],
        list: [
          "`ping`: máy có phản hồi ICMP không, độ trễ bao nhiêu. Nhiều cloud chặn ICMP nên không ping được chưa chắc là máy chết.",
          "`traceroute` (hoặc `mtr`): gói đi qua những chặng nào, nghẽn ở đâu.",
          "`dig`: phân giải DNS ra sao.",
          "`nc -vz host port`: cổng TCP có mở không.",
          "`curl -v`: toàn bộ cuộc hội thoại HTTP/TLS; `wget` để tải file."
        ]
      },
      {
        h: "curl cho kỹ sư backend",
        code: {
          lang: "bash",
          file: "terminal",
          src: `curl -v https://api.example.com/health
curl -sS -X POST http://localhost:3000/api/tasks \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"title":"Học curl"}' | jq

curl -o /dev/null -s -w '%{http_code} %{time_total}s\\n' https://example.com
curl --resolve api.example.com:443:203.0.113.20 https://api.example.com/  # test server mới trước khi đổi DNS`
        },
        p: [
          "Mẹo `--resolve` cho phép bạn kiểm tra server mới với đúng tên miền và chứng chỉ trước khi trỏ DNS sang."
        ]
      },
      {
        h: "Xem kết nối và bắt gói tin",
        code: {
          lang: "bash",
          file: "terminal",
          src: `ss -ltnp                          # cổng TCP đang lắng nghe và process
ss -tn state established '( dport = :5432 )'   # kết nối tới Postgres
nc -l 8080                        # mở cổng tạm để thử kết nối từ máy khác
sudo tcpdump -i any -nn port 5432 -c 20        # bắt 20 gói tới/từ cổng 5432
sudo tcpdump -i any -nn -w cap.pcap port 443   # ghi ra file, mở bằng Wireshark`
        },
        p: [
          "`ss` thay thế `netstat` trên Linux hiện đại. Một lỗi hay gặp: ứng dụng lắng nghe `127.0.0.1:3000` trong container, nên từ ngoài container không vào được. Cần lắng nghe `0.0.0.0`. `ss -ltnp` cho thấy ngay địa chỉ bind.",
          "`tcpdump` là công cụ cuối cùng khi mọi thứ khác không giải thích được. Traffic TLS thì bạn chỉ thấy gói mã hoá, nhưng vẫn biết được có kết nối, có reset hay có truyền lại."
        ]
      }
    ],
    summary: [
      "Chẩn đoán theo thứ tự: DNS (`dig`), đường đi (`ping`, `traceroute`), cổng (`nc`), HTTP (`curl -v`).",
      "`curl` là công cụ chính để thử API, đo thời gian và giả lập DNS với `--resolve`.",
      "`ss -ltnp` cho biết process nào lắng nghe cổng nào và bind địa chỉ nào.",
      "`tcpdump` bắt gói tin khi cần xem tầng mạng thực sự."
    ],
    pitfalls: [
      "Kết luận server chết chỉ vì `ping` không phản hồi, trong khi ICMP bị chặn.",
      "Ứng dụng trong container bind `127.0.0.1` nên không truy cập được từ ngoài; hãy bind `0.0.0.0`.",
      "Chạy tcpdump không có bộ lọc trên server bận, tạo lượng output khổng lồ và tốn CPU."
    ],
    quiz: [
      {
        q: "Lệnh nào kiểm tra nhanh cổng 5432 của host `db` có mở không?",
        options: ["`ping db`", "`nc -vz db 5432`", "`dig db`", "`traceroute db`"],
        answer: 1,
        explain: "`nc -vz` thử mở kết nối TCP tới cổng. ping chỉ dùng ICMP, dig chỉ phân giải DNS, traceroute xem đường đi."
      },
      {
        q: "`ss -ltnp` hiện `127.0.0.1:3000` cho process node trong container. Hệ quả?",
        options: ["Truy cập được từ mọi nơi", "Chỉ truy cập được từ bên trong container đó", "Cổng 3000 bị đóng hoàn toàn", "Chỉ nhận UDP"],
        answer: 1,
        explain: "Bind vào loopback chỉ nhận kết nối nội bộ. Port mapping của Docker không đi vào được, cần bind `0.0.0.0`."
      },
      {
        q: "Tác dụng của `curl --resolve api.example.com:443:203.0.113.20`?",
        options: ["Đổi DNS công khai", "Ép curl dùng IP chỉ định cho tên miền đó, không cần sửa DNS", "Tắt TLS", "Xoá cache DNS"],
        answer: 1,
        explain: "curl dùng IP bạn chỉ định nhưng vẫn gửi đúng SNI và Host header, rất tiện để kiểm tra server mới trước khi chuyển DNS."
      }
    ]
  },

  "p00.m2.t7": {
    sections: [
      {
        h: "Package manager làm gì",
        p: [
          "Package manager tải phần mềm từ kho (repository) tin cậy, tự cài các thư viện phụ thuộc, kiểm tra chữ ký gói, và giúp cập nhật bảo mật dễ dàng. Mỗi họ hệ điều hành có công cụ riêng: `apt` cho Debian/Ubuntu, `dnf` cho Fedora/RHEL, `apk` cho Alpine (hay gặp trong Docker image), `brew` cho macOS.",
          "Trong Dockerfile, gộp cập nhật chỉ mục và cài gói vào cùng một lệnh `RUN` rồi dọn cache (`rm -rf /var/lib/apt/lists/*`) để image nhỏ và không dùng chỉ mục cũ từ layer cache."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `sudo apt update                    # tải danh sách gói mới nhất
sudo apt upgrade -y                # nâng cấp gói đã cài
sudo apt install -y git curl jq htop
apt list --installed | grep nginx
sudo apt remove --purge nginx      # gỡ kèm cấu hình

sudo dnf install -y git            # Fedora/RHEL
apk add --no-cache curl            # Alpine (trong Dockerfile)
brew install jq                    # macOS`
        }
      },
      {
        h: "Cài Node.js và công cụ phát triển",
        p: [
          "Gói Node.js trong kho mặc định của bản phân phối thường cũ. Với môi trường dev, hãy dùng version manager như `nvm`, `fnm` hoặc `mise` để cài và chuyển giữa các phiên bản. Với server, dùng repo chính thức NodeSource hoặc tốt hơn là chạy ứng dụng trong Docker image `node:24`.",
          "Ghi phiên bản Node vào file `.nvmrc` hoặc trường `engines` trong `package.json` để cả đội và CI dùng cùng phiên bản (tại thời điểm 9/2026, Node.js 24 là Active LTS tới 20/10/2026, còn Node.js 26 dự kiến lên LTS ngày 28/10/2026; xem lịch ở github.com/nodejs/Release)."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Sau khi cài nvm theo hướng dẫn chính thức
nvm install 24
nvm use 24
echo "24" > .nvmrc
node -v`
        }
      },
      {
        h: "Sửa file trên server bằng vim hoặc nano",
        p: [
          "Server thường không có giao diện đồ hoạ, nên bạn cần sửa được file cấu hình ngay trên terminal. `nano` đơn giản: phím tắt hiện ở cuối màn hình, `Ctrl+O` lưu, `Ctrl+X` thoát. `vim` mạnh hơn và gần như luôn có sẵn, nhưng cần biết vài lệnh cơ bản."
        ],
        list: [
          "Mở file: `vim /etc/nginx/nginx.conf`. Ban đầu ở chế độ Normal.",
          "`i` vào chế độ Insert để gõ; `Esc` quay lại Normal.",
          "`:w` lưu, `:q` thoát, `:wq` lưu và thoát, `:q!` thoát không lưu.",
          "`/từ` tìm kiếm, `n` tới kết quả tiếp; `dd` xoá dòng, `u` hoàn tác.",
          "Sửa file cần quyền root: `sudo vim file` hoặc `sudoedit file`."
        ]
      }
    ],
    summary: [
      "Package manager cài gói từ kho tin cậy, xử lý phụ thuộc và cập nhật bảo mật.",
      "Chạy `apt update` trước `apt install`; Alpine dùng `apk add --no-cache`.",
      "Dùng version manager (nvm, fnm, mise) cho Node.js ở máy dev, ghi phiên bản vào `.nvmrc`.",
      "Biết các lệnh vim cơ bản để sửa cấu hình trên server."
    ],
    pitfalls: [
      "Chạy script cài đặt tải từ Internet qua `curl ... | sudo bash` mà không đọc nội dung hay kiểm tra nguồn.",
      "Cài Node.js từ kho mặc định rồi gặp lỗi vì phiên bản quá cũ so với dự án.",
      "Không bao giờ chạy cập nhật bảo mật trên VPS; hãy bật `unattended-upgrades` hoặc lên lịch cập nhật."
    ],
    quiz: [
      {
        q: "Trên Ubuntu, vì sao nên chạy `apt update` trước `apt install`?",
        options: ["Để nâng cấp kernel", "Để làm mới danh sách gói và phiên bản từ kho", "Để xoá gói cũ", "Không cần thiết"],
        answer: 1,
        explain: "`apt update` tải chỉ mục gói mới nhất. Không có nó, apt có thể tìm phiên bản đã bị xoá khỏi kho và báo lỗi 404."
      },
      {
        q: "Trong vim, làm sao thoát mà không lưu thay đổi?",
        options: ["`:wq`", "`:q!`", "`Ctrl+S`", "`:save`"],
        answer: 1,
        explain: "`:q!` thoát và bỏ mọi thay đổi. `:wq` lưu rồi thoát. `Ctrl+S` trong terminal có thể làm đơ màn hình (thoát bằng `Ctrl+Q`)."
      },
      {
        q: "Cách tốt để cả đội dùng cùng phiên bản Node.js là gì?",
        options: ["Ai cài bản nào cũng được", "Ghi phiên bản vào `.nvmrc` hoặc `engines` và dùng version manager", "Luôn dùng bản mới nhất mỗi sáng", "Cài từ kho apt mặc định"],
        answer: 1,
        explain: "Ghi rõ phiên bản giúp máy dev, CI và production đồng nhất, tránh lỗi \"chạy được trên máy tôi\"."
      }
    ]
  },

  "p00.m3.t0": {
    sections: [
      {
        h: "Git lưu snapshot, không lưu diff",
        p: [
          "Nhiều người nghĩ Git lưu các thay đổi giữa các phiên bản. Thực ra mỗi commit là một snapshot toàn bộ cây thư mục tại thời điểm đó. Git tiết kiệm dung lượng vì file không đổi thì commit mới chỉ trỏ lại đúng object cũ, và các object được nén, đóng gói (packfile).",
          "Mọi thứ trong Git là object, được định danh bằng hash nội dung (Git 2.x mặc định SHA-1 và hỗ trợ SHA-256 khi tạo repo bằng `git init --object-format=sha256`; Git 3.0 đang được chuẩn bị sẽ chuyển mặc định sang SHA-256 cho repo mới). Cùng nội dung thì cùng hash, sửa một byte thì hash đổi. Đây là lý do lịch sử Git rất khó bị sửa lén."
        ]
      },
      {
        h: "Bốn loại object và ref",
        p: [
          "Bên trong thư mục `.git` chỉ có vài khái niệm. Nắm được chúng, bạn sẽ hiểu hầu hết lệnh Git đang làm gì."
        ],
        list: [
          "Blob: nội dung một file (không chứa tên file).",
          "Tree: danh sách tên file, quyền, và hash của blob hoặc tree con, tức là một thư mục.",
          "Commit: trỏ tới một tree gốc, commit cha (một hoặc nhiều), tác giả, thời gian, message.",
          "Tag (annotated): trỏ tới một commit, kèm tên, message, có thể có chữ ký.",
          "Ref: tên dễ nhớ trỏ tới một commit, ví dụ `refs/heads/main`. Branch chỉ là một ref, thực chất là một file nhỏ chứa hash.",
          "HEAD: ref đặc biệt cho biết bạn đang ở đâu, thường trỏ tới một branch."
        ]
      },
      {
        h: "Tự khám phá bên trong .git",
        code: {
          lang: "bash",
          file: "terminal",
          src: `git config --global init.defaultBranch main   # Git 2.x mặc định tên nhánh đầu là master
git init demo && cd demo
echo "hello" > a.txt && git add a.txt && git commit -m "feat: add a"

cat .git/HEAD                    # ref: refs/heads/main
cat .git/refs/heads/main         # hash của commit mới nhất
git cat-file -t HEAD             # commit
git cat-file -p HEAD             # tree <hash>, author, message
git cat-file -p 'HEAD^{tree}'    # 100644 blob <hash>  a.txt
git log --oneline --graph --all  # xem đồ thị commit`
        },
        p: [
          "Khi tạo branch mới bằng `git switch -c feature`, Git chỉ tạo một file ref mới trỏ tới commit hiện tại. Không có gì được sao chép. Vì vậy tạo branch trong Git gần như tức thì và rẻ."
        ]
      },
      {
        h: "Ba vùng làm việc",
        p: [
          "Working directory là file bạn đang sửa. Staging area (index) là nơi bạn chuẩn bị snapshot tiếp theo bằng `git add`. Repository là nơi lưu các commit. `git status` cho biết file đang ở vùng nào; `git diff` so working directory với staging, `git diff --staged` so staging với commit cuối.",
          "Hiểu mô hình này giúp bạn bình tĩnh khi gặp lệnh \"đáng sợ\" như reset hay rebase: chúng chủ yếu chỉ di chuyển ref, còn commit cũ vẫn nằm đó và có thể lấy lại."
        ]
      }
    ],
    summary: [
      "Commit là snapshot toàn bộ cây, trỏ tới tree và commit cha.",
      "Object gồm blob, tree, commit, tag, định danh bằng hash nội dung.",
      "Branch chỉ là con trỏ tới commit; HEAD cho biết bạn đang ở đâu.",
      "Ba vùng: working directory, staging area, repository."
    ],
    pitfalls: [
      "Nghĩ xoá branch là mất code ngay. Commit vẫn còn tới khi bị garbage collect, và có thể tìm lại qua reflog.",
      "Commit file nhị phân lớn (video, dump DB); mỗi phiên bản là một blob mới, repo phình to mãi mãi. Dùng Git LFS hoặc lưu ngoài repo.",
      "Nhầm `git diff` với `git diff --staged` rồi commit thiếu hoặc thừa thay đổi."
    ],
    quiz: [
      {
        q: "Branch trong Git thực chất là gì?",
        options: ["Một bản sao toàn bộ code", "Một con trỏ (ref) tới một commit", "Một thư mục riêng trên disk", "Một file diff"],
        answer: 1,
        explain: "Branch là một ref nhỏ chứa hash của commit. Tạo branch không sao chép file nào, nên rất nhanh."
      },
      {
        q: "Object nào lưu tên file trong Git?",
        options: ["Blob", "Tree", "Commit", "Không object nào"],
        answer: 1,
        explain: "Blob chỉ chứa nội dung. Tree liệt kê tên file, quyền và hash của blob hoặc tree con."
      },
      {
        q: "Vì sao hai file có nội dung giống hệt nhau chỉ tốn một blob?",
        options: ["Git tự xoá file trùng", "Blob được định danh bằng hash nội dung nên cùng nội dung thì cùng object", "Git nén bằng zip", "Do .gitignore"],
        answer: 1,
        explain: "Git lưu object theo địa chỉ nội dung. Cùng nội dung sinh cùng hash, nên hai tree cùng trỏ tới một blob."
      }
    ]
  },

  "p00.m3.t1": {
    sections: [
      {
        h: "Ba cách tích hợp thay đổi",
        p: [
          "Khi nhánh `feature` cần đưa vào `main`, có ba khả năng. Fast-forward: nếu `main` chưa có commit mới kể từ khi tách nhánh, Git chỉ việc dời con trỏ `main` lên đầu `feature`, lịch sử thẳng, không có commit mới.",
          "Merge commit: khi cả hai nhánh đều có commit mới, `git merge` tạo một commit có hai cha, giữ nguyên lịch sử thật của cả hai nhánh. Rebase: lấy các commit của `feature` và phát lại (replay) chúng lên đầu `main`, tạo ra các commit mới với hash mới, cho lịch sử thẳng như thể bạn bắt đầu từ `main` mới nhất."
        ],
        code: {
          lang: "text",
          file: "history.txt",
          src: `Trước:        A---B---C  main
                   \\
                    D---E  feature

merge:        A---B---C-------M  main
                   \\         /
                    D-------E

rebase:       A---B---C---D'---E'  feature (rồi fast-forward main)`
        }
      },
      {
        h: "Lệnh thực hành",
        p: [
          "Quy trình thường gặp: tạo nhánh, commit, cập nhật nhánh theo `main` mới nhất, rồi gộp vào `main`."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `git switch -c feature/login        # tạo và chuyển nhánh
# ... commit ...
git fetch origin
git rebase origin/main             # cập nhật nhánh của bạn lên main mới nhất
git push --force-with-lease        # đẩy lại nhánh đã rebase (an toàn hơn --force)

git switch main
git merge --ff-only feature/login  # chỉ chấp nhận fast-forward
git merge --no-ff feature/login    # luôn tạo merge commit`
        }
      },
      {
        h: "Chọn cách nào",
        p: [
          "Không có lựa chọn đúng tuyệt đối. Điều quan trọng là cả đội thống nhất một quy ước:"
        ],
        list: [
          "Merge: an toàn, không viết lại lịch sử, giữ ngữ cảnh nhánh. Nhược điểm: đồ thị rối nếu có nhiều merge nhỏ.",
          "Rebase: lịch sử thẳng, dễ đọc, dễ `git bisect`. Nhược điểm: viết lại hash, xử lý conflict theo từng commit.",
          "Squash merge (trên GitHub): gộp cả PR thành một commit trên `main`. Gọn, nhưng mất chi tiết từng commit nhỏ.",
          "Nhiều đội dùng: rebase nhánh cá nhân để cập nhật, rồi squash hoặc merge khi đóng PR."
        ]
      },
      {
        h: "Quy tắc vàng: không rebase nhánh đã chia sẻ",
        p: [
          "Rebase tạo commit mới thay thế commit cũ. Nếu người khác đã dựa trên commit cũ (ví dụ nhánh `main` hoặc nhánh cả đội cùng làm), lịch sử của họ và của bạn sẽ lệch nhau, dẫn tới commit bị trùng hoặc mất khi họ pull.",
          "Chỉ rebase nhánh mà chỉ mình bạn làm việc. Khi buộc phải push lại, dùng `--force-with-lease`: lệnh này từ chối ghi đè nếu trên remote có commit mà bạn chưa thấy, tránh xoá mất công của đồng nghiệp."
        ]
      }
    ],
    summary: [
      "Fast-forward chỉ dời con trỏ; merge tạo commit hai cha; rebase phát lại commit lên nền mới.",
      "Rebase cho lịch sử thẳng nhưng viết lại hash commit.",
      "Không rebase nhánh đã chia sẻ như `main`.",
      "Dùng `--force-with-lease` thay cho `--force` khi push nhánh đã rebase."
    ],
    pitfalls: [
      "Rebase nhánh `main` hoặc nhánh chung rồi force push, làm hỏng lịch sử của cả đội.",
      "Dùng `git push --force` và vô tình xoá commit đồng nghiệp vừa đẩy lên.",
      "Merge `main` vào nhánh feature liên tục tạo hàng chục merge commit rối mắt; cân nhắc rebase cho nhánh cá nhân."
    ],
    quiz: [
      {
        q: "Khi nào Git có thể fast-forward?",
        options: ["Khi hai nhánh có conflict", "Khi nhánh đích không có commit mới kể từ lúc tách nhánh", "Khi dùng rebase", "Luôn luôn"],
        answer: 1,
        explain: "Nếu `main` vẫn là tổ tiên trực tiếp của `feature`, Git chỉ cần dời con trỏ. Nếu `main` đã có commit mới, cần merge commit hoặc rebase."
      },
      {
        q: "Vì sao không nên rebase nhánh đã được người khác dùng?",
        options: ["Rebase xoá file", "Rebase tạo commit mới với hash mới, làm lịch sử của người khác lệch với remote", "Rebase chậm", "GitHub cấm rebase"],
        answer: 1,
        explain: "Người khác đang dựa trên commit cũ. Sau rebase và force push, lịch sử của họ không còn khớp, gây trùng hoặc mất commit."
      },
      {
        q: "`git push --force-with-lease` khác `--force` thế nào?",
        options: ["Không khác", "Từ chối ghi đè nếu remote có commit mới mà bạn chưa fetch", "Chỉ đẩy tag", "Tự động merge"],
        answer: 1,
        explain: "`--force-with-lease` kiểm tra remote vẫn ở trạng thái bạn đã biết. Nếu ai đó vừa đẩy lên, lệnh thất bại thay vì xoá công của họ."
      }
    ]
  },

  "p00.m3.t2": {
    sections: [
      {
        h: "Conflict xảy ra khi nào",
        p: [
          "Git tự gộp được khi hai nhánh sửa những phần khác nhau của file. Conflict chỉ xảy ra khi hai bên sửa cùng một vùng dòng, hoặc một bên sửa file còn bên kia xoá file. Git không đoán ý định nghiệp vụ, nên dừng lại và nhờ bạn quyết định.",
          "Conflict không phải lỗi, mà là tín hiệu hai người cùng thay đổi một chỗ. Điều nguy hiểm hơn là merge \"sạch\" nhưng sai logic: Git gộp được hai thay đổi ở hai nơi khác nhau, nhưng kết hợp lại thì hỏng. Vì vậy luôn chạy test sau khi merge, kể cả khi không có conflict."
        ]
      },
      {
        h: "Đọc conflict markers",
        code: {
          lang: "text",
          file: "src/config.ts",
          src: `export const config = {
<<<<<<< HEAD
  timeoutMs: 5000,
=======
  timeoutMs: 10000,
  retries: 3,
>>>>>>> feature/retry
};`
        },
        p: [
          "Phần giữa `<<<<<<<` và `=======` là phiên bản của nhánh hiện tại (HEAD). Phần giữa `=======` và `>>>>>>>` là của nhánh đang được gộp vào. Lưu ý: khi rebase, vai trò bị đảo, HEAD là nhánh nền (ví dụ `main`) còn phần dưới là commit của bạn đang được phát lại.",
          "Bật `git config --global merge.conflictStyle zdiff3` để Git hiện thêm phần gốc chung (base). Biết base giúp bạn hiểu mỗi bên đã thay đổi gì, thay vì chỉ thấy hai kết quả."
        ]
      },
      {
        h: "Quy trình giải quyết",
        p: [
          "Giải quyết conflict là sửa file cho đúng ý định của cả hai bên, rồi báo cho Git biết bạn đã xong."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `git merge feature/retry            # hoặc git rebase main
git status                         # liệt kê file "both modified"
# sửa file: giữ phần đúng, xoá hết marker
npm test                           # chạy test trước khi hoàn tất!
git add src/config.ts
git merge --continue               # hoặc git rebase --continue

git merge --abort                  # bỏ cuộc, về trạng thái trước khi merge
git checkout --ours  path/file     # lấy nguyên phiên bản bên HEAD
git checkout --theirs path/file    # lấy nguyên phiên bản bên kia
git mergetool                      # mở công cụ 3 cột đã cấu hình`
        }
      },
      {
        h: "git rerere và giảm conflict",
        p: [
          "`rerere` (reuse recorded resolution) ghi nhớ cách bạn giải một conflict. Lần sau gặp đúng conflict đó (thường khi rebase lại nhiều lần), Git tự áp dụng lời giải. Bật bằng `git config --global rerere.enabled true`."
        ],
        list: [
          "Giữ PR nhỏ và merge thường xuyên; nhánh sống càng lâu conflict càng nhiều.",
          "Cập nhật nhánh từ `main` hằng ngày.",
          "Dùng formatter (Prettier) chung cho cả đội để tránh conflict do khác định dạng.",
          "Không gộp refactor lớn và tính năng mới vào cùng một PR."
        ]
      }
    ],
    summary: [
      "Conflict xảy ra khi hai bên sửa cùng vùng dòng hoặc xoá/sửa cùng file.",
      "HEAD là bên hiện tại; khi rebase, HEAD là nhánh nền.",
      "Sửa file, xoá marker, chạy test, `git add`, rồi `--continue`; bỏ cuộc bằng `--abort`.",
      "`zdiff3` hiện phần gốc chung; `rerere` ghi nhớ lời giải; PR nhỏ giảm conflict."
    ],
    pitfalls: [
      "Commit file còn sót conflict marker. Hãy chạy test, lint, hoặc `git diff --check` trước khi hoàn tất.",
      "Chọn bừa \"ours\" hoặc \"theirs\" cho cả file, làm mất thay đổi hợp lệ của bên kia.",
      "Nhầm vai trò ours/theirs khi rebase, vì nó ngược với khi merge."
    ],
    quiz: [
      {
        q: "Trong khi `git merge feature`, phần giữa `<<<<<<< HEAD` và `=======` là gì?",
        options: ["Phiên bản của nhánh feature", "Phiên bản của nhánh hiện tại", "Phiên bản gốc chung", "Nội dung đã bị xoá"],
        answer: 1,
        explain: "Khi merge, HEAD là nhánh bạn đang đứng. Phần dưới dấu `=======` là của nhánh được gộp vào."
      },
      {
        q: "Bạn đang rebase và rối vì conflict. Cách quay về trạng thái ban đầu?",
        options: ["`git rebase --abort`", "`git reset --hard HEAD~10`", "Xoá thư mục .git", "`git commit -am wip`"],
        answer: 0,
        explain: "`--abort` huỷ rebase và đưa nhánh về đúng trạng thái trước khi bắt đầu. Reset hoặc xoá .git có thể làm mất dữ liệu."
      },
      {
        q: "`git rerere` giúp gì?",
        options: ["Tự tránh mọi conflict", "Ghi nhớ và tự áp dụng lại cách giải conflict đã từng làm", "Xoá lịch sử", "Đổi tên nhánh"],
        answer: 1,
        explain: "rerere lưu lời giải của từng conflict. Khi cùng conflict xuất hiện lại, ví dụ khi rebase lại, Git tự áp dụng."
      }
    ]
  },

  "p00.m3.t3": {
    sections: [
      {
        h: "Ba workflow phổ biến",
        list: [
          "Git Flow: nhánh `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`. Phù hợp phần mềm phát hành theo phiên bản (app mobile, thư viện có nhiều bản song song), nhưng nặng nề với web service deploy liên tục.",
          "GitHub Flow: chỉ có `main` luôn deploy được. Mỗi thay đổi là một nhánh ngắn, mở PR, review, CI xanh, merge rồi deploy. Đơn giản, phù hợp đa số dự án web.",
          "Trunk-based development: mọi người tích hợp vào trunk (`main`) rất thường xuyên, ít nhất mỗi ngày, nhánh sống vài giờ tới một hai ngày. Tính năng chưa xong được ẩn sau feature flag. Cần CI mạnh và test tốt."
        ],
        p: [
          "Nghiên cứu DORA liên hệ trunk-based development với năng lực giao hàng cao. Với đội backend làm web service, GitHub Flow hoặc trunk-based thường là lựa chọn hợp lý."
        ]
      },
      {
        h: "Pull Request và code review",
        p: [
          "Pull Request (PR) là nơi đề xuất thay đổi, chạy CI, thảo luận và review trước khi vào `main`. Một PR tốt nhỏ (dưới vài trăm dòng thay đổi), tập trung một mục đích, có mô tả rõ: vấn đề là gì, giải pháp, cách kiểm tra, ảnh hưởng tới migration hay cấu hình.",
          "Người review tập trung vào đúng nghiệp vụ, bảo mật, khả năng bảo trì và test. Những thứ máy làm được như format, lint thì để CI lo, đừng tranh luận trong review."
        ]
      },
      {
        h: "Branch protection",
        p: [
          "Bảo vệ nhánh `main` bằng branch protection rule hoặc ruleset trên GitHub, để quy trình không phụ thuộc vào sự tự giác:"
        ],
        list: [
          "Bắt buộc qua PR, không push thẳng vào `main`.",
          "Yêu cầu ít nhất một approval; tự huỷ approval khi có commit mới.",
          "Bắt buộc status check CI (lint, test, build) phải xanh.",
          "Cấm force push và xoá nhánh; có thể yêu cầu lịch sử tuyến tính hoặc commit có chữ ký.",
          "Dùng file `CODEOWNERS` để tự động yêu cầu review từ người phụ trách từng thư mục."
        ],
        code: {
          lang: "text",
          file: ".github/CODEOWNERS",
          src: `# Mặc định
*                    @org/backend-team
# Migration DB cần DBA xem
/src/migrations/     @org/dba
# Pipeline và hạ tầng
/.github/workflows/  @org/platform
/infra/              @org/platform`
        }
      }
    ],
    summary: [
      "Git Flow hợp phần mềm phát hành theo phiên bản; GitHub Flow và trunk-based hợp web service deploy liên tục.",
      "PR nhỏ, một mục đích, mô tả rõ giúp review nhanh và chính xác.",
      "Để CI lo format và lint; review tập trung nghiệp vụ, bảo mật, thiết kế.",
      "Branch protection và CODEOWNERS biến quy trình thành luật, không dựa vào tự giác."
    ],
    pitfalls: [
      "Áp dụng Git Flow đầy đủ cho một API nhỏ deploy mỗi ngày, tạo ra nhiều nhánh và merge không cần thiết.",
      "PR hàng nghìn dòng: người review chỉ lướt qua và bấm approve.",
      "Nhánh feature sống hàng tuần, cuối cùng merge gặp conflict lớn và rủi ro cao."
    ],
    quiz: [
      {
        q: "Đặc điểm chính của trunk-based development?",
        options: ["Mỗi tính năng có nhánh sống vài tháng", "Tích hợp vào nhánh chính thường xuyên, nhánh ngắn, dùng feature flag cho tính năng chưa xong", "Không cần CI", "Chỉ có một người được commit"],
        answer: 1,
        explain: "Trunk-based dựa vào tích hợp nhỏ và thường xuyên. Tính năng dang dở được ẩn bằng feature flag thay vì giữ trên nhánh dài."
      },
      {
        q: "Branch protection nên bắt buộc điều gì cho `main`?",
        options: ["Cho phép force push để sửa nhanh", "Qua PR, có approval và CI xanh trước khi merge", "Chỉ admin được đọc", "Tự động xoá commit cũ"],
        answer: 1,
        explain: "Mục tiêu là mọi thay đổi vào `main` đều được review và kiểm tra tự động. Force push lên `main` là điều cần cấm."
      },
      {
        q: "Việc nào nên để máy làm thay vì tranh luận trong code review?",
        options: ["Kiểm tra logic nghiệp vụ", "Định dạng code và lint", "Đánh giá thiết kế", "Kiểm tra lỗ hổng phân quyền"],
        answer: 1,
        explain: "Prettier và ESLint trong CI xử lý định dạng tự động và nhất quán. Người review nên dành thời gian cho những thứ máy không đánh giá được."
      }
    ]
  },

  "p00.m3.t4": {
    sections: [
      {
        h: "Conventional Commits",
        p: [
          "Conventional Commits là quy ước viết commit message theo cấu trúc `type(scope): mô tả`. Nhờ có cấu trúc, máy có thể đọc lịch sử để tự sinh changelog và quyết định phiên bản tiếp theo, còn con người đọc log dễ hơn."
        ],
        code: {
          lang: "text",
          file: "commit-examples.txt",
          src: `feat(tasks): thêm lọc theo trạng thái
fix(auth): sửa lỗi refresh token hết hạn sớm
docs: cập nhật hướng dẫn chạy local
chore(deps): nâng cấp @nestjs/core
refactor(db): tách repository khỏi service
test(tasks): bổ sung integration test cho API tạo task
ci: cache node_modules trong GitHub Actions

feat(api)!: đổi định dạng phân trang

BREAKING CHANGE: trường \`page\` thay bằng \`cursor\`.`
        },
        list: [
          "`feat`: tính năng mới. `fix`: sửa lỗi. Đây là hai type ảnh hưởng tới version.",
          "`docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`: các type phổ biến khác, không tạo release (trừ khi bạn cấu hình khác).",
          "Dấu `!` sau type hoặc footer `BREAKING CHANGE:` đánh dấu thay đổi phá vỡ tương thích."
        ]
      },
      {
        h: "Semantic Versioning",
        p: [
          "SemVer đánh phiên bản dạng `MAJOR.MINOR.PATCH`. Tăng MAJOR khi phá vỡ tương thích API, MINOR khi thêm tính năng tương thích ngược, PATCH khi sửa lỗi tương thích ngược. Với phiên bản `0.x`, API được coi là chưa ổn định.",
          "Ánh xạ tự nhiên: `fix` thành PATCH, `feat` thành MINOR, `BREAKING CHANGE` thành MAJOR. Ví dụ từ 1.4.2, có một commit `feat` và hai commit `fix`, phiên bản tiếp theo là 1.5.0.",
          "Với một API web, SemVer còn dùng để đặt phiên bản cho hợp đồng API (ví dụ `/v1`, `/v2`), còn với thư viện npm thì người dùng khai báo khoảng như `^1.4.2` và tin rằng bản MINOR, PATCH không phá vỡ code của họ. Phá vỡ lời hứa đó là cách nhanh nhất làm mất lòng tin."
        ]
      },
      {
        h: "Tự động hoá trong CI/CD",
        p: [
          "Các công cụ như semantic-release hoặc release-please đọc commit từ lần phát hành trước, tính version mới, sinh `CHANGELOG.md`, tạo git tag và GitHub Release. Kết hợp với commitlint chạy ở git hook và CI để đảm bảo mọi commit đúng quy ước. Khi đội dùng squash merge, hãy đặt tiêu đề PR theo Conventional Commits vì đó sẽ là message của commit trên `main`."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `npm i -D @commitlint/cli @commitlint/config-conventional
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.mjs
echo "feat: thêm API" | npx commitlint     # hợp lệ
echo "sửa bug" | npx commitlint            # báo lỗi: thiếu type`
        }
      }
    ],
    summary: [
      "Conventional Commits: `type(scope): mô tả`, với `feat`, `fix` và dấu hiệu breaking change.",
      "SemVer: MAJOR cho thay đổi phá vỡ, MINOR cho tính năng mới, PATCH cho sửa lỗi.",
      "Commit có cấu trúc cho phép tự sinh version, changelog và release trong CI.",
      "commitlint kiểm tra message; với squash merge, tiêu đề PR phải đúng quy ước."
    ],
    pitfalls: [
      "Đánh dấu thay đổi phá vỡ API là `fix`, khiến người dùng nâng PATCH và ứng dụng hỏng.",
      "Commit message kiểu \"update\", \"wip\", \"fix bug\": lịch sử vô dụng khi điều tra sự cố.",
      "Bật squash merge nhưng không kiểm tra tiêu đề PR, làm công cụ release bỏ qua thay đổi."
    ],
    quiz: [
      {
        q: "Phiên bản hiện tại 2.3.1. Có commit `feat: thêm export CSV` và `fix: sửa timezone`. Phiên bản tiếp theo?",
        options: ["2.3.2", "2.4.0", "3.0.0", "2.4.1"],
        answer: 1,
        explain: "Có `feat` nên tăng MINOR và đặt PATCH về 0. Chỉ có `fix` mới là 2.3.2; cần breaking change mới lên 3.0.0."
      },
      {
        q: "Cách đánh dấu breaking change trong Conventional Commits?",
        options: ["Viết chữ hoa toàn bộ message", "Thêm `!` sau type/scope hoặc footer `BREAKING CHANGE:`", "Dùng type `major`", "Thêm tag v2"],
        answer: 1,
        explain: "Spec quy định `!` hoặc footer `BREAKING CHANGE:`. Công cụ release dựa vào đó để tăng MAJOR."
      },
      {
        q: "Vì sao Conventional Commits có ích cho CI/CD?",
        options: ["Làm build nhanh hơn", "Máy đọc được lịch sử để tự tính version và sinh changelog", "Thay thế test", "Mã hoá commit"],
        answer: 1,
        explain: "Cấu trúc thống nhất giúp công cụ như semantic-release, release-please tự động hoá phát hành. Nó không ảnh hưởng tốc độ build hay thay test."
      }
    ]
  },

  "p00.m3.t5": {
    sections: [
      {
        h: "Dọn lịch sử với rebase -i và cherry-pick",
        p: [
          "Trước khi mở PR, bạn có thể dọn các commit \"wip\", \"sửa typo\" bằng interactive rebase. Lệnh này mở danh sách commit trong editor, bạn đổi từ khoá đầu dòng để gộp, sửa message, đổi thứ tự hoặc bỏ commit. Chỉ làm trên nhánh chưa chia sẻ.",
          "Cherry-pick tạo commit mới có cùng thay đổi nhưng khác hash. Nếu sau đó merge hai nhánh, Git thường nhận ra thay đổi trùng, nhưng dùng cherry-pick tràn lan sẽ làm lịch sử khó theo dõi, nên chỉ dùng cho trường hợp cụ thể như đưa bản sửa lỗi sang nhánh release."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `git rebase -i origin/main
# pick a1b2c3 feat: thêm API task
# fixup d4e5f6 sửa typo            <- gộp vào commit trên, bỏ message
# reword 789abc test: thêm test    <- sửa message
# drop  aaa111 debug log           <- bỏ commit

git commit --fixup a1b2c3          # tạo commit fixup cho a1b2c3
git rebase -i --autosquash origin/main   # tự sắp xếp và gộp fixup

git cherry-pick 4f3e2d1            # chép một commit sang nhánh hiện tại (vd. hotfix sang release)`
        }
      },
      {
        h: "stash, tag",
        code: {
          lang: "bash",
          file: "terminal",
          src: `git stash push -m "đang sửa form"   # cất tạm thay đổi chưa commit
git stash list
git stash pop                        # lấy lại và xoá khỏi stash
git stash push -u                    # cất cả file chưa được track

git tag -a v1.2.0 -m "Release 1.2.0" # annotated tag
git push origin v1.2.0
git tag -l 'v1.*'`
        },
        p: [
          "Dùng annotated tag cho release vì nó lưu người tạo, thời gian, message và có thể ký. Lightweight tag chỉ là một ref đơn giản.",
          "`git stash` hữu ích khi cần chuyển nhánh gấp để sửa hotfix mà code đang dang dở. Nếu công việc dài hơn vài phút, cân nhắc commit tạm trên nhánh của bạn (rồi gộp lại bằng rebase -i sau), vì commit dễ tìm lại hơn stash."
        ]
      },
      {
        h: "bisect: tìm commit gây bug",
        p: [
          "Khi biết bản cũ chạy đúng và bản mới lỗi, `git bisect` tìm kiếm nhị phân qua các commit ở giữa. Với 1.000 commit, chỉ cần khoảng 10 bước. Nếu có lệnh tự kiểm tra (exit 0 là tốt, khác 0 là lỗi), Git làm hết cho bạn.",
          "Bisect hiệu quả nhất khi lịch sử gồm các commit nhỏ và mỗi commit đều build được. Đây là một lý do nữa để giữ commit gọn gàng và không để commit \"hỏng build\" trong nhánh chính."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `git bisect start
git bisect bad HEAD
git bisect good v1.4.0
git bisect run npm test -- tests/tasks.spec.ts   # tự chạy test ở mỗi bước
git bisect reset                                  # quay lại nhánh ban đầu`
        }
      },
      {
        h: "reflog: phao cứu sinh",
        p: [
          "Reflog ghi lại mọi lần HEAD và branch di chuyển trên máy bạn: commit, reset, rebase, checkout. Lỡ `git reset --hard` hay rebase hỏng, commit cũ vẫn còn và reflog cho bạn biết hash của nó. Mục reflog mặc định được giữ khoảng 90 ngày (với mục không còn truy cập được từ nhánh là 30 ngày) trước khi bị dọn."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `git reflog
# 3c4d5e6 HEAD@{0}: reset: moving to HEAD~3
# 9a8b7c6 HEAD@{1}: commit: feat: thêm lọc task
git branch rescue 9a8b7c6        # tạo nhánh trỏ vào commit tưởng đã mất
# hoặc: git reset --hard HEAD@{1}`
        }
      }
    ],
    summary: [
      "`rebase -i` và `--autosquash` giúp dọn commit trước khi mở PR.",
      "`cherry-pick` chép commit cụ thể sang nhánh khác, hữu ích cho hotfix.",
      "`stash` cất tạm thay đổi; annotated tag dùng cho release.",
      "`bisect` tìm commit gây lỗi bằng tìm kiếm nhị phân; `reflog` cứu commit bị mất."
    ],
    pitfalls: [
      "Dùng `rebase -i` trên nhánh đã chia sẻ, viết lại lịch sử của người khác.",
      "Để stash tồn đọng hàng chục mục rồi quên mất nội dung; nên đặt message và dọn thường xuyên.",
      "Hoảng loạn sau `reset --hard` rồi xoá cả repo clone lại, trong khi `git reflog` có thể cứu lại commit."
    ],
    quiz: [
      {
        q: "Bạn lỡ `git reset --hard HEAD~3` và mất 3 commit chưa push. Cách lấy lại?",
        options: ["Không thể lấy lại", "Tìm hash trong `git reflog` rồi reset hoặc tạo nhánh tới đó", "`git stash pop`", "`git pull`"],
        answer: 1,
        explain: "Commit vẫn còn trong object database. Reflog ghi vị trí HEAD trước khi reset, nên bạn quay lại được. Chưa push thì pull không giúp gì."
      },
      {
        q: "`git bisect` dùng thuật toán gì để tìm commit lỗi?",
        options: ["Duyệt tuần tự từng commit", "Tìm kiếm nhị phân giữa commit tốt và xấu", "Chọn ngẫu nhiên", "So sánh diff lớn nhất"],
        answer: 1,
        explain: "Mỗi bước bisect loại một nửa số commit còn lại, nên chỉ cần khoảng log2(N) bước."
      },
      {
        q: "Trong `rebase -i`, từ khoá `fixup` làm gì?",
        options: ["Xoá commit", "Gộp commit vào commit phía trên và bỏ message của nó", "Sửa message", "Tách commit"],
        answer: 1,
        explain: "`fixup` giống `squash` nhưng bỏ message của commit được gộp. `drop` xoá, `reword` sửa message, `edit` cho phép tách commit."
      }
    ]
  },

  "p00.m3.t6": {
    sections: [
      {
        h: ".gitignore đúng cách",
        p: [
          "`.gitignore` báo Git bỏ qua file không nên theo dõi: dependency, file build, log, cấu hình máy cá nhân và secret. Nó chỉ tác dụng với file chưa được track. Nếu file đã được commit, bạn phải gỡ nó khỏi index bằng `git rm --cached`."
        ],
        code: {
          lang: "text",
          file: ".gitignore",
          src: `node_modules/
dist/
coverage/
*.log
.env
.env.*
!.env.example
.DS_Store
.idea/
.vscode/*
!.vscode/extensions.json`
        },
        list: [
          "Commit file `.env.example` chứa tên biến và giá trị giả, để người mới biết cần cấu hình gì.",
          "Dùng `git check-ignore -v <file>` để biết quy tắc nào đang bỏ qua một file."
        ]
      },
      {
        h: "Lỡ commit secret thì làm gì",
        p: [
          "Khi secret đã được push lên remote, hãy coi như nó đã bị lộ. Bot quét GitHub công khai tìm key trong vài phút, bản fork và clone của người khác vẫn giữ lịch sử, và cache hay các bản sao khác không bị ảnh hưởng khi bạn sửa lịch sử. Vì vậy thứ tự đúng là:"
        ],
        list: [
          "1. Rotate ngay: thu hồi key cũ, tạo key mới tại nhà cung cấp (AWS, Stripe, DB password).",
          "2. Kiểm tra log truy cập xem key cũ đã bị dùng chưa.",
          "3. Xoá secret khỏi code, chuyển sang biến môi trường hoặc secret manager.",
          "4. Nếu cần, dọn lịch sử bằng `git filter-repo` và force push, báo cả đội clone lại. Bước này là phụ, không thay thế bước 1."
        ]
      },
      {
        h: "Phòng ngừa từ đầu",
        p: [
          "Tốt nhất là chặn secret trước khi nó vào repo. Kết hợp nhiều lớp:"
        ],
        list: [
          "Bật secret scanning và push protection của GitHub để chặn push chứa key đã biết định dạng.",
          "Chạy gitleaks (hoặc công cụ tương tự) trong pre-commit hook và trong CI.",
          "Không đặt secret trong Dockerfile, file YAML của CI hay code; dùng GitHub Actions secrets, OIDC, Vault hoặc cloud secret manager.",
          "Review file `.env*` và file cấu hình trong mỗi PR."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `git rm --cached .env && git commit -m "chore: stop tracking .env"
gitleaks git -v            # quét lịch sử repo (gitleaks v8.19+; bản cũ dùng: gitleaks detect)
git log --all -p -S 'AKIA' # tìm chuỗi nghi là AWS access key trong lịch sử`
        }
      }
    ],
    summary: [
      ".gitignore chỉ áp dụng cho file chưa track; file đã commit cần `git rm --cached`.",
      "Commit `.env.example`, không bao giờ commit `.env` thật.",
      "Secret đã push thì coi như lộ: rotate trước, dọn lịch sử sau.",
      "Chặn sớm bằng push protection, gitleaks trong hook và CI, và secret manager."
    ],
    pitfalls: [
      "Chỉ xoá secret bằng một commit mới: nó vẫn nằm trong lịch sử và ai clone cũng thấy.",
      "Dọn lịch sử bằng filter-repo nhưng không rotate key, trong khi key đã bị sao chép.",
      "Thêm `.env` vào .gitignore sau khi đã commit và tưởng rằng Git sẽ ngừng theo dõi nó."
    ],
    quiz: [
      {
        q: "Bạn phát hiện AWS key bị push lên repo công khai 1 giờ trước. Việc đầu tiên cần làm?",
        options: ["Force push để xoá commit", "Thu hồi và tạo lại key ngay (rotate)", "Đổi repo sang private", "Thêm key vào .gitignore"],
        answer: 1,
        explain: "Key có thể đã bị bot thu thập. Chỉ rotate mới vô hiệu hoá key cũ. Xoá lịch sử hay đổi private không thu hồi được bản đã bị sao chép."
      },
      {
        q: "`.env` đã được commit từ trước. Thêm vào .gitignore có đủ không?",
        options: ["Đủ, Git sẽ tự ngừng theo dõi", "Không, cần `git rm --cached .env` rồi commit", "Cần xoá repo", "Cần đổi tên file"],
        answer: 1,
        explain: ".gitignore không ảnh hưởng file đã track. Phải gỡ khỏi index; và nếu file chứa secret thật thì vẫn phải rotate."
      },
      {
        q: "Cách chặn secret trước khi nó lên remote hiệu quả nhất?",
        options: ["Nhắc nhở trong README", "Push protection của GitHub kết hợp gitleaks ở pre-commit và CI", "Chỉ review bằng mắt", "Mã hoá Base64 secret trong code"],
        answer: 1,
        explain: "Nhiều lớp tự động bắt được lỗi con người. Base64 không phải mã hoá bảo mật, còn review bằng mắt dễ bỏ sót."
      }
    ]
  },

  "p00.m0.t6": {
    "sections": [
      {
        "h": "Vì sao cần chuẩn bị môi trường ngay từ đầu",
        "p": [
          "Môi trường lập trình là bộ công cụ bạn dùng mỗi ngày: trình soạn thảo code, terminal, Git và runtime của ngôn ngữ (ở khóa này là Node.js). Cài đúng một lần giúp bạn tránh hàng loạt lỗi vặt kiểu `node: command not found`, lệch phiên bản giữa máy bạn và máy đồng đội, hay file bị đổi ký tự xuống dòng khi commit.",
          "Nguyên tắc chung: mọi thứ phải lặp lại được. Phiên bản Node của dự án được ghi vào file, cấu hình editor được ghi vào repo, để người mới clone về là chạy được như bạn."
        ]
      },
      {
        "h": "Bộ công cụ tối thiểu",
        "p": [
          "Trình soạn thảo phổ biến nhất hiện nay là VS Code. Hãy cài thêm vài extension cơ bản rồi học phím tắt mở file nhanh (Ctrl+P), tìm trong toàn dự án (Ctrl+Shift+F) và đổi tên biến an toàn (F2).",
          "Không cài Node trực tiếp từ file cài đặt nếu bạn làm nhiều dự án. Hãy dùng trình quản lý phiên bản như `fnm` hoặc `nvm` (trên Windows có dự án riêng là nvm-windows), để mỗi dự án dùng đúng phiên bản của nó. Phiên bản LTS hiện hành cho production là Node.js 24."
        ],
        "list": [
          "VS Code + extension: ESLint, Prettier, EditorConfig, GitLens, Docker",
          "Git: cấu hình `user.name`, `user.email` trước lần commit đầu tiên",
          "Terminal: trên Windows nên dùng WSL 2 (Ubuntu) để có môi trường giống server Linux",
          "Node.js qua fnm/nvm, kèm file `.nvmrc` hoặc `.node-version` trong repo"
        ],
        "code": {
          "lang": "bash",
          "file": "terminal",
          "src": "# Cài fnm (macOS/Linux/WSL), sau đó mở terminal mới\ncurl -fsSL https://fnm.vercel.app/install | bash\n\nfnm install 24          # cài Node 24 LTS\nfnm use 24\nnode -v && npm -v\n\n# Ghi phiên bản vào repo để cả nhóm dùng giống nhau\necho \"24\" > .node-version\n\n# Git: danh tính và nhánh mặc định\ngit config --global user.name \"Nguyen Van A\"\ngit config --global user.email \"a@example.com\"\ngit config --global init.defaultBranch main"
        }
      },
      {
        "h": "Chuẩn hoá cấu hình trong repo",
        "p": [
          "File `.editorconfig` thống nhất cách thụt lề và ký tự xuống dòng cho mọi editor. File `.gitattributes` với dòng `* text=auto eol=lf` giúp repo luôn lưu kiểu xuống dòng LF, tránh lỗi script bash chạy hỏng trên Linux vì ký tự CRLF từ Windows.",
          "Thư mục `.vscode/extensions.json` có thể gợi ý extension cho cả nhóm. Khi người mới mở dự án, VS Code tự hỏi có muốn cài các extension đó không."
        ],
        "code": {
          "lang": "ini",
          "file": ".editorconfig",
          "src": "root = true\n\n[*]\ncharset = utf-8\nend_of_line = lf\nindent_style = space\nindent_size = 2\ninsert_final_newline = true\ntrim_trailing_whitespace = true"
        }
      }
    ],
    "summary": [
      "Cài Node bằng trình quản lý phiên bản (fnm/nvm) và ghi phiên bản vào repo",
      "Trên Windows, dùng WSL 2 để có môi trường giống server Linux",
      "Cấu hình Git danh tính trước lần commit đầu tiên",
      "Dùng .editorconfig và .gitattributes để cả nhóm có cùng định dạng file"
    ],
    "pitfalls": [
      "Cài Node bằng file cài đặt rồi không đổi được phiên bản khi dự án yêu cầu bản khác",
      "Code trên thư mục Windows (/mnt/c) trong WSL làm Git và npm chạy rất chậm, nên để code trong thư mục home của Linux",
      "Commit file có ký tự xuống dòng CRLF khiến script bash lỗi `bad interpreter` trên server"
    ],
    "quiz": [
      {
        "q": "Vì sao nên cài Node bằng fnm hoặc nvm thay vì file cài đặt?",
        "options": [
          "Để chuyển nhanh giữa các phiên bản Node theo từng dự án",
          "Vì file cài đặt không có npm đi kèm",
          "Vì fnm chạy JavaScript nhanh hơn Node gốc",
          "Vì file cài đặt chỉ hỗ trợ phiên bản cũ"
        ],
        "answer": 0,
        "explain": "Trình quản lý phiên bản cho phép mỗi dự án dùng đúng phiên bản Node của nó. Node cài từ file cài đặt vẫn có npm và chạy nhanh như nhau."
      },
      {
        "q": "Dòng `* text=auto eol=lf` trong .gitattributes giải quyết vấn đề gì?",
        "options": [
          "Chặn commit file lớn hơn giới hạn cho phép",
          "Lưu file văn bản với ký tự xuống dòng LF thống nhất",
          "Tự động format code trước mỗi lần commit",
          "Mã hoá nội dung file trước khi đẩy lên remote"
        ],
        "answer": 1,
        "explain": "Thuộc tính eol=lf chuẩn hoá ký tự xuống dòng, tránh CRLF từ Windows làm hỏng script trên Linux. Nó không format code hay mã hoá file."
      },
      {
        "q": "Trên Windows, lựa chọn nào giúp môi trường dev giống server Linux nhất?",
        "options": [
          "Dùng PowerShell với các alias giống lệnh Linux",
          "Dùng Git Bash cho mọi tác vụ phát triển",
          "Dùng WSL 2 và để code trong thư mục home của Linux",
          "Cài Docker Desktop và không cần gì thêm"
        ],
        "answer": 2,
        "explain": "WSL 2 chạy kernel Linux thật. Để code trong filesystem của Linux giúp Git, npm và file watcher chạy nhanh và đúng như trên server."
      }
    ]
  },
  "p00.m1.t7": {
    sections: [
      {
        h: "Địa chỉ IP và các vùng private",
        p: [
          "Mỗi máy trong mạng cần một địa chỉ IP để gói tin biết đi tới đâu. IPv4 dài 32 bit, viết thành 4 số 0–255 như `192.168.1.10`, chỉ có khoảng 4,3 tỷ địa chỉ. IPv6 dài 128 bit, viết dạng hex như `2001:db8::1`.",
          "Để tiết kiệm IPv4, RFC 1918 dành ba vùng private chỉ dùng trong mạng nội bộ, không được định tuyến trên Internet:"
        ],
        list: [
          "`10.0.0.0/8` (10.0.0.0 – 10.255.255.255): hay dùng cho VPC.",
          "`172.16.0.0/12` (172.16.0.0 – 172.31.255.255): chứa mạng bridge mặc định `172.17.0.0/16` của Docker.",
          "`192.168.0.0/16`: mạng gia đình, văn phòng nhỏ.",
          "`127.0.0.1` là loopback (chính máy mình)."
        ]
      },
      {
        h: "Subnet và ký hiệu CIDR",
        p: [
          "CIDR (RFC 4632) viết dải địa chỉ dạng `địa_chỉ/prefix`. Số sau `/` là số bit đầu dành cho phần mạng, phần còn lại cho máy. `/24` còn 8 bit nên có 2^8 = 256 địa chỉ; `/16` có 65.536 địa chỉ. Prefix càng lớn mạng càng nhỏ: `/32` là một địa chỉ, `/0` là tất cả.",
          "Ví dụ: VPC `10.0.0.0/16` chia subnet public `10.0.1.0/24` cho load balancer và subnet private `10.0.2.0/24` cho NestJS và PostgreSQL. AWS giữ lại 5 địa chỉ mỗi subnet. Trong security group, `0.0.0.0/0` là mọi nơi, còn `10.0.0.0/16` chỉ là máy trong VPC.",
          "`net.BlockList` của Node kiểm tra IP thuộc dải nào, hữu ích để chặn SSRF khi server tải URL do người dùng gửi."
        ],
        code: {
          lang: "typescript",
          file: "src/common/private-ip.ts",
          src: `import { BlockList, isIPv4 } from 'node:net';

const privateRanges = new BlockList();
privateRanges.addSubnet('10.0.0.0', 8);
privateRanges.addSubnet('172.16.0.0', 12);
privateRanges.addSubnet('192.168.0.0', 16);
privateRanges.addSubnet('127.0.0.0', 8); // loopback

export function isPrivateIPv4(ip: string): boolean {
  return isIPv4(ip) && privateRanges.check(ip, 'ipv4');
}

console.log(isPrivateIPv4('172.31.255.1')); // true
console.log(isPrivateIPv4('172.32.0.1'));   // false, ngoài /12
console.log(isPrivateIPv4('8.8.8.8'));      // false`
        }
      },
      {
        h: "NAT: nhiều máy dùng chung một IP public",
        p: [
          "NAT (Network Address Translation) cho cả nhà dùng chung một IP public. Khi laptop `192.168.1.10` gọi ra Internet, router thay địa chỉ nguồn bằng IP public của nó và ghi ánh xạ vào bảng NAT để dịch ngược gói trả về. Kết nối từ ngoài không tự vào được máy nội bộ, trừ khi cấu hình port forwarding.",
          "Trên cloud, server ở subnet private gọi API bên ngoài qua NAT gateway. Docker dùng NAT khi chạy `-p 8080:3000`: cổng 8080 của host chuyển vào cổng 3000 của container. Khi đối tác cần whitelist IP, hãy đưa IP public của NAT gateway, không phải IP private của server."
        ]
      },
      {
        h: "Port và socket",
        p: [
          "IP đưa gói tin tới đúng máy; port (0–65535) chọn đúng tiến trình. Theo RFC 6335: 0–1023 là System Ports (22 SSH, 443 HTTPS), 1024–49151 là User Ports (5432 PostgreSQL, 6379 Redis), 49152–65535 là Dynamic Ports. Trên Linux, mở cổng dưới 1024 cần quyền đặc biệt, nên app Node thường chạy cổng 3000 sau Nginx.",
          "Kết nối TCP được xác định bởi bộ bốn: IP và port nguồn, IP và port đích; port phía client do hệ điều hành cấp tạm. Socket là đầu mút gắn với IP và port đó. Server lắng nghe `127.0.0.1:3000` chỉ nhận kết nối từ chính máy, phải lắng nghe `0.0.0.0:3000` mới nhận từ mạng. Đây là lỗi kinh điển khi app trong container chạy nhưng host gọi không được."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# IP của các interface trên máy (Linux)
ip -4 addr show

# Tiến trình nào đang lắng nghe cổng nào, trên địa chỉ nào
ss -tlnp

# IP public mà Internet nhìn thấy (sau NAT)
curl -s https://ifconfig.me

# Dải CIDR của mạng bridge mặc định trong Docker
docker network inspect bridge --format '{{(index .IPAM.Config 0).Subnet}}'`
        }
      }
    ],
    summary: [
      "IPv4 dài 32 bit, IPv6 dài 128 bit; RFC 1918 dành 10/8, 172.16/12 và 192.168/16 cho mạng private",
      "Trong CIDR, prefix /n giữ n bit cho phần mạng; /24 có 256 địa chỉ, /16 có 65.536 địa chỉ",
      "NAT cho nhiều máy private đi ra Internet qua một IP public nhưng chặn kết nối tự đi vào",
      "Port chọn tiến trình trên máy; kết nối TCP xác định bởi IP và port của hai đầu",
      "Server phải lắng nghe 0.0.0.0 thay vì 127.0.0.1 để nhận kết nối từ ngoài container hoặc máy"
    ],
    pitfalls: [
      "Đặt dải VPC hoặc mạng Docker trùng dải mạng văn phòng/VPN khiến gói tin đi nhầm đường, rất khó debug",
      "Mở security group `0.0.0.0/0` cho cổng database 5432 thay vì chỉ cho dải CIDR của subnet app",
      "Đưa IP private của server cho đối tác whitelist, trong khi request thực tế đi ra bằng IP của NAT gateway"
    ],
    quiz: [
      {
        q: "Subnet `10.0.2.0/24` có tổng cộng bao nhiêu địa chỉ IPv4?",
        options: ["24 địa chỉ", "65.536 địa chỉ", "256 địa chỉ", "16.777.216 địa chỉ"],
        answer: 2,
        explain: "/24 giữ 24 bit cho phần mạng, còn 32 − 24 = 8 bit cho máy, tức 2^8 = 256 địa chỉ. 65.536 là của /16, 16.777.216 là của /8."
      },
      {
        q: "Địa chỉ nào nằm trong vùng private theo RFC 1918?",
        options: ["172.20.5.9", "172.32.0.1", "192.169.1.1", "11.0.0.1"],
        answer: 0,
        explain: "Vùng 172.16.0.0/12 kéo dài từ 172.16.0.0 đến 172.31.255.255 nên 172.20.5.9 là private. 172.32.0.1 và 192.169.1.1 nằm ngay ngoài biên các vùng private."
      },
      {
        q: "App Node trong container chạy bình thường, đã `-p 8080:3000`, nhưng từ host gọi `localhost:8080` không được. Nguyên nhân thường gặp là gì?",
        options: [
          "Cổng 8080 thuộc nhóm Dynamic Ports",
          "Docker không dùng NAT khi chạy trên Linux",
          "Container chưa được cấp địa chỉ IPv6",
          "App chỉ lắng nghe 127.0.0.1 trong container"
        ],
        answer: 3,
        explain: "127.0.0.1 trong container là loopback của riêng container, nên kết nối được chuyển từ host vào không tới được app. Cần lắng nghe 0.0.0.0. Cổng 8080 là User Port và Docker vẫn dùng NAT cho port mapping."
      }
    ]
  }
});
