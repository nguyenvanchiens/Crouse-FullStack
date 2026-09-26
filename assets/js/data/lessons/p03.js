/* Nội dung bài học chương p03 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p03.m0.t0": {
    sections: [
      {
        h: "Node.js gồm những gì",
        p: [
          "Node.js không phải một ngôn ngữ mà là một runtime ghép từ nhiều thành phần. Hai thành phần quan trọng nhất là V8 và libuv. V8 là JavaScript engine của Google (cũng dùng trong Chrome): nó biên dịch JavaScript sang mã máy bằng JIT, quản lý heap và garbage collector. libuv là thư viện C lo phần I/O bất đồng bộ: event loop, socket, file system, timer, thread pool.",
          "Giữa hai phần là các binding C++ của Node, giúp code JavaScript như `fs.readFile` hay `http.createServer` gọi xuống libuv và hệ điều hành."
        ]
      },
      {
        h: "Một luồng JavaScript, nhiều việc I/O song song",
        p: [
          "Code JavaScript của bạn chạy trên một luồng chính duy nhất. Node vẫn phục vụ được hàng nghìn kết nối cùng lúc vì hầu hết thời gian của một request backend là chờ I/O: chờ database trả kết quả, chờ Redis, chờ API bên ngoài. Trong lúc chờ, luồng chính rảnh để xử lý request khác.",
          "libuv dùng hai cơ chế khác nhau để làm I/O không chặn:"
        ],
        list: [
          "Network I/O (TCP, HTTP, kết nối tới Postgres/Redis): dùng cơ chế thông báo của hệ điều hành như epoll (Linux), kqueue (macOS), IOCP (Windows). Không tốn thread nào cho mỗi kết nối.",
          "Những việc hệ điều hành không có API bất đồng bộ tốt: đẩy sang thread pool của libuv. Gồm phần lớn thao tác `fs`, `dns.lookup`, một số hàm `crypto` (`pbkdf2`, `scrypt`, `randomBytes` dạng callback) và `zlib`.",
          "Thread pool mặc định có 4 thread, chỉnh bằng biến môi trường `UV_THREADPOOL_SIZE` trước khi process khởi động."
        ]
      },
      {
        h: "Ảnh hưởng thực tế",
        p: [
          "Giả sử API đăng nhập dùng hash mật khẩu bằng `crypto.scrypt`. Mỗi lần hash chiếm một thread của pool trong vài chục mili giây. Khi có nhiều request đăng nhập cùng lúc, 4 thread bị chiếm hết, các thao tác `fs` hay `dns.lookup` khác phải xếp hàng chờ, dù CPU còn trống.",
          "Ngược lại, phiên bản đồng bộ `scryptSync` còn tệ hơn: nó chạy ngay trên luồng chính và chặn mọi request khác."
        ],
        code: {
          lang: "typescript",
          file: "src/auth/password.ts",
          src: `import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  // Chạy trên thread pool của libuv, không chặn event loop
  const key = (await scryptAsync(plain, salt, 64)) as Buffer;
  return salt.toString('hex') + ':' + key.toString('hex');
}

export async function verifyPassword(plain: string, stored: string) {
  const [saltHex, keyHex] = stored.split(':');
  const key = (await scryptAsync(plain, Buffer.from(saltHex, 'hex'), 64)) as Buffer;
  return timingSafeEqual(key, Buffer.from(keyHex, 'hex'));
}`
        }
      },
      {
        h: "Node phù hợp và không phù hợp với gì",
        p: [
          "Node rất mạnh với workload nặng I/O: REST/GraphQL API, gateway, realtime WebSocket, worker xử lý queue gọi dịch vụ khác. Node kém phù hợp khi phần lớn thời gian là tính toán CPU trên luồng chính, như xử lý ảnh, nén video, tính toán số lớn. Khi đó bạn cần worker threads, tách sang service khác, hoặc dùng ngôn ngữ khác cho phần đó."
        ]
      }
    ],
    summary: [
      "V8 chạy và tối ưu JavaScript; libuv lo event loop và I/O bất đồng bộ.",
      "Network I/O dùng epoll/kqueue/IOCP, không dùng thread pool.",
      "fs, dns.lookup, crypto nặng, zlib dùng thread pool (mặc định 4 thread).",
      "Hàm *Sync chạy trên luồng chính và chặn toàn bộ server."
    ],
    pitfalls: [
      "Dùng `bcrypt.hashSync`, `fs.readFileSync` trong request handler: chặn event loop. Dùng phiên bản async.",
      "Nghĩ mỗi kết nối DB cần một thread của pool: không, socket mạng không đi qua thread pool.",
      "Đặt `UV_THREADPOOL_SIZE` bên trong code sau khi đã dùng pool: pool đã được tạo, giá trị mới không có tác dụng. Đặt qua biến môi trường khi khởi động."
    ],
    quiz: [
      {
        q: "Thao tác nào sau đây KHÔNG dùng thread pool của libuv?",
        options: ["Đọc file bằng fs.readFile", "Hash bằng crypto.pbkdf2", "Nhận dữ liệu từ socket TCP", "Nén bằng zlib.gzip"],
        answer: 2,
        explain: "Network I/O dùng cơ chế thông báo của OS (epoll/kqueue/IOCP). fs, pbkdf2 và zlib chạy trên thread pool."
      },
      {
        q: "Vì sao một process Node đơn luồng vẫn phục vụ được nhiều request đồng thời?",
        options: ["V8 tự tạo một thread JavaScript riêng cho mỗi request", "Trong lúc request chờ I/O, luồng chính rảnh để xử lý request khác", "Node mặc định fork nhiều process theo số core của máy", "Hệ điều hành chia code JavaScript ra chạy song song trên các core"],
        answer: 1,
        explain: "Mô hình non-blocking I/O cho phép luồng chính không đứng chờ. JavaScript vẫn chạy trên một luồng."
      },
      {
        q: "Dùng `scryptSync` trong API đăng nhập gây hậu quả gì?",
        options: ["Chỉ request đăng nhập đó chậm, request khác không ảnh hưởng", "Luồng chính bị chặn, mọi request khác phải chờ hash xong", "Node tự tăng số thread của pool để bù lại", "Hash chạy trên thread pool nên chỉ chiếm một thread"],
        answer: 1,
        explain: "Hàm Sync chạy trực tiếp trên luồng chính nên toàn bộ server không xử lý được gì khác trong thời gian đó."
      }
    ]
  },
  "p03.m0.t1": {
    sections: [
      {
        h: "Event loop là gì",
        p: [
          "Event loop là vòng lặp của libuv chạy liên tục trên luồng chính. Mỗi vòng, nó đi qua các pha theo thứ tự và chạy các callback đã sẵn sàng của từng pha. Khi không còn việc gì (không timer, không socket mở), vòng lặp kết thúc và process thoát."
        ],
        list: [
          "timers: chạy callback của `setTimeout`/`setInterval` đã đến hạn.",
          "pending callbacks: một số callback I/O bị hoãn từ vòng trước (ví dụ một số lỗi TCP).",
          "idle, prepare: dùng nội bộ.",
          "poll: lấy sự kiện I/O mới và chạy callback của chúng; nếu không có việc, có thể chờ ở đây.",
          "check: chạy callback của `setImmediate`.",
          "close callbacks: callback sự kiện `close`, ví dụ `socket.on('close')`."
        ]
      },
      {
        h: "Microtask: nextTick và Promise",
        p: [
          "Ngoài các pha, Node còn có hàng đợi microtask. Sau mỗi callback, Node xả hết hàng đợi `process.nextTick` rồi tới hàng đợi Promise (`.then`, phần sau `await`). Vì vậy microtask luôn chạy trước khi event loop chuyển sang callback hoặc pha tiếp theo.",
          "Trong một callback I/O, `setImmediate` luôn chạy trước `setTimeout(fn, 0)` vì pha check đến ngay sau poll. Ở cấp cao nhất của module, thứ tự hai hàm này không đảm bảo.",
          "Một chi tiết mới: từ libuv 1.45 (Node.js 20 trở lên), timer được chạy sau pha poll trong mỗi vòng thay vì trước poll như các bản cũ; libuv vẫn chạy timer một lần trước khi vào vòng lặp để giữ tương thích. Thứ tự các pha liệt kê ở trên là cách mô tả truyền thống và vẫn đúng để suy luận; chỉ đừng viết code phụ thuộc vào thứ tự chính xác giữa timer và `setImmediate` ngoài callback I/O."
        ],
        code: {
          lang: "javascript",
          file: "order.mjs",
          src: `import { readFile } from 'node:fs';

readFile(import.meta.filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  Promise.resolve().then(() => console.log('promise'));
  process.nextTick(() => console.log('nextTick'));
});
// Kết quả: nextTick, promise, immediate, timeout`
        }
      },
      {
        h: "Code CPU nặng chặn cả server",
        p: [
          "Event loop chỉ chuyển sang việc khác khi callback hiện tại chạy xong. Một vòng lặp tính toán 2 giây, một `JSON.parse` trên chuỗi 200MB, hay một regex bị backtracking thảm hoạ (ReDoS) đều giữ luồng chính. Trong thời gian đó, không request nào được trả lời, health check timeout, và Kubernetes có thể restart Pod.",
          "Bạn đo được độ trễ event loop bằng `monitorEventLoopDelay` và nên đưa chỉ số này vào metrics. Độ trễ tăng cao là dấu hiệu có code chặn luồng chính."
        ],
        code: {
          lang: "typescript",
          file: "src/metrics/loop-delay.ts",
          src: `import { monitorEventLoopDelay } from 'node:perf_hooks';

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  // Giá trị tính bằng nano giây
  console.log({ p99ms: h.percentile(99) / 1e6, maxms: h.max / 1e6 });
  h.reset();
}, 10_000).unref();`
        }
      },
      {
        h: "Cách tránh chặn event loop",
        list: [
          "Luôn dùng API bất đồng bộ cho I/O.",
          "Xử lý dữ liệu lớn theo stream hoặc theo lô nhỏ, không nạp một lần.",
          "Đẩy việc CPU nặng sang worker thread hoặc background job.",
          "Giới hạn kích thước request body và kiểm tra regex với input do người dùng nhập."
        ],
        p: [
          "Cẩn thận với đệ quy `process.nextTick`: vì nextTick được xả hết trước khi sang pha tiếp theo, gọi nó liên tục sẽ làm I/O không bao giờ được xử lý (starvation)."
        ]
      }
    ],
    summary: [
      "Các pha chính: timers → pending → poll → check → close.",
      "nextTick và Promise microtask chạy sau mỗi callback, trước pha kế tiếp.",
      "Trong callback I/O, setImmediate chạy trước setTimeout 0.",
      "Một callback chạy lâu chặn toàn bộ server; đo bằng monitorEventLoopDelay."
    ],
    pitfalls: [
      "Lọc/sắp xếp mảng hàng trăm nghìn phần tử trong request handler: chuyển xuống database hoặc phân trang.",
      "Tin rằng `async` biến code CPU thành không chặn: hàm async vẫn chạy đồng bộ trên luồng chính cho đến `await` đầu tiên.",
      "Dùng regex phức tạp (lồng quantifier) trên input người dùng: có thể gây ReDoS."
    ],
    quiz: [
      {
        q: "Callback của `setImmediate` chạy ở pha nào?",
        options: ["timers", "poll", "check", "close callbacks"],
        answer: 2,
        explain: "setImmediate được thiết kế để chạy ở pha check, ngay sau poll."
      },
      {
        q: "Trong cùng một callback, thứ tự nào đúng?",
        options: ["Promise → nextTick", "nextTick → Promise", "setTimeout → nextTick", "setImmediate → Promise"],
        answer: 1,
        explain: "Node xả hàng đợi nextTick trước, rồi đến Promise microtask, sau đó mới tới các pha của event loop."
      },
      {
        q: "Viết `async function` chứa vòng lặp tính toán 3 giây có còn chặn server không?",
        options: ["Không, vì hàm async tự chạy trên thread pool", "Có, vì vòng lặp đồng bộ vẫn chạy trên luồng chính", "Không, vì Promise tự chia nhỏ việc tính toán", "Chỉ chặn khi hàm được gọi mà không có await"],
        answer: 1,
        explain: "async chỉ cho phép dùng await; phần tính toán đồng bộ vẫn giữ luồng chính cho đến khi xong."
      }
    ]
  },
  "p03.m0.t2": {
    sections: [
      {
        h: "Buffer và vì sao cần Stream",
        p: [
          "Buffer là vùng nhớ chứa dữ liệu nhị phân thô, nằm ngoài heap JavaScript thông thường. Khi đọc file hay nhận dữ liệu từ socket, bạn nhận Buffer. Nếu đọc toàn bộ một file export 2GB bằng `readFile`, process cần ít nhất 2GB RAM cho một request, trong khi container có thể chỉ được cấp 512MB.",
          "Stream xử lý dữ liệu theo từng mảnh (chunk), mặc định cỡ vài chục KB. Bộ nhớ dùng gần như không đổi dù file lớn bao nhiêu, và byte đầu tiên đến tay client sớm hơn."
        ],
        list: [
          "Readable: nguồn dữ liệu (file, HTTP request body, kết quả query dạng cursor).",
          "Writable: đích (file, HTTP response, socket).",
          "Transform: vừa đọc vừa ghi, biến đổi dữ liệu (gzip, CSV → JSON).",
          "Duplex: đọc và ghi độc lập (socket TCP)."
        ]
      },
      {
        h: "Backpressure",
        p: [
          "Nếu nguồn đọc nhanh hơn đích ghi (đọc từ SSD nhanh, gửi cho client mạng chậm), dữ liệu sẽ dồn trong bộ nhớ. Backpressure là cơ chế để đích báo \"chậm lại\": `writable.write()` trả về `false` khi buffer nội bộ vượt `highWaterMark`, và nguồn phải tạm dừng cho tới sự kiện `drain`.",
          "Tự quản lý việc này dễ sai. `pipeline()` từ `node:stream/promises` nối các stream, tự xử lý backpressure, và quan trọng không kém: nếu một stream lỗi, mọi stream khác được huỷ và tài nguyên (file descriptor) được đóng."
        ],
        code: {
          lang: "typescript",
          file: "scripts/compress-log.ts",
          src: `import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

await pipeline(
  createReadStream('app.log'),
  createGzip(),
  createWriteStream('app.log.gz'),
);
console.log('Nén xong, RAM dùng gần như không đổi dù file lớn');`
        }
      },
      {
        h: "Stream trong API NestJS",
        p: [
          "Khi cần trả file lớn hoặc báo cáo CSV, trả về `StreamableFile` thay vì đọc hết vào Buffer. Nest sẽ pipe stream vào response và đặt header phù hợp."
        ],
        code: {
          lang: "typescript",
          file: "src/reports/reports.controller.ts",
          src: `import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller('reports')
export class ReportsController {
  @Get('monthly')
  download(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'exports/monthly.csv'));
    return new StreamableFile(file, {
      type: 'text/csv',
      disposition: 'attachment; filename="monthly.csv"',
    });
  }
}`
        }
      },
      {
        h: "Readable là async iterable",
        p: [
          "Mọi Readable stream đều dùng được với `for await...of`. Cách này dễ đọc và vẫn tôn trọng backpressure, vì vòng lặp chỉ lấy chunk tiếp theo khi bạn xử lý xong chunk hiện tại. Ví dụ: đọc từng dòng file CSV bằng `readline` và insert theo lô 1000 dòng vào Postgres, thay vì nạp cả file."
        ]
      }
    ],
    summary: [
      "Buffer là dữ liệu nhị phân; Stream xử lý dữ liệu theo từng chunk.",
      "Stream giữ RAM ổn định và giảm thời gian tới byte đầu tiên.",
      "Backpressure: write() trả false thì chờ drain.",
      "Dùng pipeline() để tự xử lý backpressure và dọn dẹp khi lỗi.",
      "NestJS trả StreamableFile cho file lớn."
    ],
    pitfalls: [
      "Dùng `.pipe()` nối nhiều stream mà không xử lý lỗi: một stream lỗi có thể làm rò rỉ file descriptor. Dùng `pipeline()`.",
      "Bỏ qua giá trị trả về của `write()` trong vòng lặp ghi: bộ nhớ tăng không kiểm soát.",
      "Gom toàn bộ chunk vào mảng rồi `Buffer.concat` \"cho tiện\": mất hết lợi ích của stream."
    ],
    quiz: [
      {
        q: "`writable.write(chunk)` trả về `false` nghĩa là gì?",
        options: ["Ghi thất bại, chunk vừa ghi đã bị mất", "Buffer nội bộ vượt highWaterMark, nên chờ sự kiện drain", "Stream đã đóng, mọi lần ghi sau sẽ lỗi", "Phải gọi end() ngay để kết thúc stream"],
        answer: 1,
        explain: "false là tín hiệu backpressure. Chunk vẫn được nhận, nhưng bạn nên chờ drain trước khi ghi tiếp."
      },
      {
        q: "Ưu điểm của `pipeline()` so với chuỗi `.pipe()`?",
        options: ["Truyền dữ liệu nhanh gấp đôi nhờ chạy trên thread pool", "Khi một stream lỗi, lỗi được truyền ra và mọi stream được huỷ", "Bỏ hẳn cơ chế backpressure để đọc với tốc độ tối đa", "Tự gom mọi chunk vào bộ nhớ rồi ghi một lần cho gọn"],
        answer: 1,
        explain: "`.pipe()` không chuyển lỗi giữa các stream. `pipeline()` xử lý lỗi và đóng tài nguyên đúng cách."
      },
      {
        q: "Endpoint export file 1GB bằng `readFile` rồi `res.send`, khi 5 người tải cùng lúc sẽ ra sao?",
        options: ["Không vấn đề, file được đọc từ cache của OS", "Process cần khoảng 5GB RAM, dễ bị OOM kill", "Node tự chuyển readFile sang stream khi file lớn", "Chỉ chậm hơn một chút vì đọc đĩa tuần tự"],
        answer: 1,
        explain: "Mỗi request nạp toàn bộ file vào RAM. Dùng stream thì mỗi request chỉ tốn vài chục KB buffer."
      }
    ]
  },
  "p03.m0.t3": {
    sections: [
      {
        h: "Hai bài toán khác nhau",
        p: [
          "Worker threads và Cluster thường bị nhầm, nhưng giải quyết hai việc khác nhau. Worker threads tách một tác vụ CPU nặng khỏi luồng chính để event loop không bị chặn. Cluster chạy nhiều process Node giống nhau để tận dụng nhiều core cho việc phục vụ request.",
          "Mỗi worker thread có V8 isolate và event loop riêng, nhưng nằm trong cùng process. Chúng giao tiếp bằng message (`postMessage`), dữ liệu được sao chép theo thuật toán structured clone; có thể chuyển quyền sở hữu `ArrayBuffer` hoặc dùng `SharedArrayBuffer` để tránh sao chép."
        ]
      },
      {
        h: "Worker threads cho tác vụ CPU-bound",
        p: [
          "Ví dụ: API nhận file và cần tạo báo cáo tính toán nặng, hoặc resize ảnh bằng thư viện JavaScript thuần. Chạy trên luồng chính sẽ chặn mọi request. Đưa sang worker giữ API phản hồi nhanh. Khởi tạo worker tốn vài chục mili giây và bộ nhớ, nên thực tế dùng một pool worker tái sử dụng (thư viện Piscina là lựa chọn phổ biến)."
        ],
        code: {
          lang: "typescript",
          file: "src/heavy/run-in-worker.ts",
          src: `import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

function fib(n: number): number {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

if (!isMainThread) {
  parentPort!.postMessage(fib(workerData as number));
}

export function fibInWorker(n: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: n });
    worker.once('message', resolve);
    worker.once('error', reject);
  });
}`
        }
      },
      {
        h: "Cluster và lựa chọn thay thế trong container",
        p: [
          "Module `cluster` cho process chính (primary) fork nhiều worker process chia sẻ cùng một port. Mỗi process có bộ nhớ riêng, nên state trong RAM (cache, session) không dùng chung được. PM2 cluster mode cũng dựa trên cơ chế này.",
          "Khi chạy trên Docker/Kubernetes, cách phổ biến hơn là mỗi container chạy một process Node, và scale bằng số replica. Orchestrator lo việc khởi động lại, phân tải, giới hạn tài nguyên cho từng process, và log/metrics đơn giản hơn vì một container tương ứng một process."
        ],
        list: [
          "Một process mỗi container, scale bằng replica: đơn giản, phù hợp Kubernetes, ECS.",
          "Cluster/PM2: hữu ích khi deploy lên một VM lớn không có orchestrator.",
          "Worker threads: dùng trong process cho tác vụ CPU cụ thể, không phải để phục vụ nhiều request hơn.",
          "Tác vụ CPU nặng không cần kết quả ngay: đưa vào background job (BullMQ) chạy ở worker riêng."
        ]
      },
      {
        h: "Khi nào đừng dùng",
        p: [
          "Worker threads không giúp gì cho I/O: gọi DB hay HTTP trong worker không nhanh hơn luồng chính, còn tốn thêm chi phí. Cũng đừng tạo worker mới cho mỗi request trong production; hãy dùng pool có giới hạn kích thước theo số core được cấp."
        ]
      }
    ],
    summary: [
      "Worker threads: tách tác vụ CPU-bound, cùng process, giao tiếp bằng message.",
      "Cluster: nhiều process chia sẻ port để dùng nhiều core.",
      "Trong container, ưu tiên một process mỗi container và scale bằng replica.",
      "Dùng pool worker (như Piscina), không tạo worker mỗi request."
    ],
    pitfalls: [
      "Dùng worker threads để \"tăng tốc\" gọi database: I/O vốn đã không chặn, chỉ thêm overhead.",
      "Chạy cluster 8 process trong container chỉ được cấp 1 CPU: các process tranh nhau, còn chậm hơn.",
      "Lưu session trong RAM khi chạy nhiều process/replica: request sau có thể tới process khác. Dùng Redis."
    ],
    quiz: [
      {
        q: "Tác vụ nào hưởng lợi rõ nhất từ worker threads?",
        options: ["Chạy query PostgreSQL", "Gọi API thanh toán bên ngoài", "Resize ảnh bằng JavaScript thuần", "Đọc key từ Redis"],
        answer: 2,
        explain: "Worker threads giải quyết tác vụ CPU-bound. Các lựa chọn khác là I/O, vốn không chặn event loop."
      },
      {
        q: "Trên Kubernetes, cách phổ biến để tận dụng nhiều core cho API Node là gì?",
        options: ["Một process mỗi container, tăng số replica", "Chạy cluster 8 process trong mỗi container", "Tăng UV_THREADPOOL_SIZE bằng số core", "Tạo một worker thread cho mỗi request"],
        answer: 0,
        explain: "Orchestrator scale replica dễ quản lý hơn. Cluster trong container thêm phức tạp và cần cấp CPU tương ứng."
      },
      {
        q: "Dữ liệu gửi qua `postMessage` giữa các worker thread mặc định được xử lý thế nào?",
        options: ["Chia sẻ tham chiếu trực tiếp", "Sao chép theo structured clone", "Chuyển qua file tạm", "Bị chuyển thành chuỗi JSON bắt buộc"],
        answer: 1,
        explain: "Mặc định dữ liệu được clone. Muốn tránh sao chép, dùng transfer ArrayBuffer hoặc SharedArrayBuffer."
      }
    ]
  },
  "p03.m0.t4": {
    sections: [
      {
        h: "Vì sao không hard-code cấu hình",
        p: [
          "Cùng một image cần chạy ở dev, staging và production với database, khoá bí mật và mức log khác nhau. Nếu URL database hay JWT secret nằm trong code, bạn phải build lại cho mỗi môi trường và secret nằm luôn trong git. Nguyên tắc: code giống nhau ở mọi nơi, chỉ cấu hình thay đổi, và cấu hình đến từ biến môi trường.",
          "Biến môi trường luôn là chuỗi. `PORT=3000` là chuỗi \"3000\", `ENABLE_CACHE=false` là chuỗi \"false\" (và `Boolean('false')` là `true`!). Vì vậy cần một lớp parse và validate."
        ]
      },
      {
        h: "Fail fast khi khởi động",
        p: [
          "Thiếu `DATABASE_URL` mà ứng dụng vẫn khởi động, bạn chỉ phát hiện khi request đầu tiên chạm DB, có khi là lúc 3 giờ sáng. Validate toàn bộ env ngay khi khởi động: thiếu hoặc sai kiểu thì in lỗi rõ ràng và thoát với exit code khác 0. Trên Kubernetes, Pod sẽ ở trạng thái CrashLoopBackOff, rolling update dừng lại và bản cũ tiếp tục phục vụ."
        ],
        code: {
          lang: "typescript",
          file: "src/config/env.ts",
          src: `import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    console.error('Cấu hình không hợp lệ:', result.error.issues);
    throw new Error('Invalid environment variables');
  }
  return result.data;
}`
        }
      },
      {
        h: "Tích hợp vào NestJS",
        p: [
          "`@nestjs/config` nhận hàm `validate`, chạy khi module khởi tạo. Sau đó bạn inject `ConfigService` thay vì đọc `process.env` rải rác khắp nơi, vừa có kiểu, vừa dễ mock khi test."
        ],
        code: {
          lang: "typescript",
          file: "src/app.module.ts",
          src: `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // Trong production, biến đến từ orchestrator, không cần file .env
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
  ],
})
export class AppModule {}

// Dùng: constructor(private config: ConfigService<Env, true>) {}
// this.config.get('PORT', { infer: true }) // kiểu number`
        }
      },
      {
        h: "Nguồn cấu hình và secret",
        list: [
          "Dev: file `.env` (không commit), có `.env.example` mô tả các biến. Node 24 hỗ trợ sẵn `node --env-file=.env`.",
          "CI/CD: biến và secret của nền tảng (GitHub Actions secrets).",
          "Production: orchestrator nạp từ secret manager (AWS Secrets Manager, Kubernetes Secret, Vault).",
          "Cấu hình không nhạy cảm và ít đổi (danh sách feature, timeout) có thể để giá trị mặc định trong schema."
        ],
        p: [
          "Không log toàn bộ object cấu hình khi khởi động, vì sẽ in luôn secret ra log."
        ]
      }
    ],
    summary: [
      "Cấu hình đến từ env; cùng image chạy mọi môi trường.",
      "Env luôn là chuỗi: cần parse và validate kiểu.",
      "Validate lúc khởi động, sai thì thoát ngay (fail fast).",
      "NestJS: ConfigModule.forRoot({ validate }) và inject ConfigService.",
      "Secret đến từ secret manager, không commit, không log."
    ],
    pitfalls: [
      "Dùng `Boolean(process.env.FLAG)` để đọc cờ: chuỗi \"false\" vẫn ra true. Parse tường minh bằng schema.",
      "Đọc `process.env.X` ở hàng chục chỗ: khó biết ứng dụng cần những biến nào. Tập trung một nơi.",
      "Commit `.env` hoặc in cấu hình ra log khi debug: secret bị lộ."
    ],
    quiz: [
      {
        q: "Vì sao nên validate env ngay khi khởi động?",
        options: ["Để request chạy nhanh hơn nhờ cache cấu hình", "Để lỗi cấu hình lộ ra lúc deploy, trước khi nhận traffic", "Vì NestJS không khởi động được nếu thiếu bước này", "Để giá trị secret được mã hoá trong bộ nhớ"],
        answer: 1,
        explain: "Fail fast làm lỗi hiện ra ngay khi deploy, rolling update dừng lại và bản cũ vẫn phục vụ."
      },
      {
        q: "`process.env.PORT` có kiểu gì trong runtime?",
        options: ["number", "string hoặc undefined", "number nếu giá trị là số, còn lại string", "boolean hoặc string"],
        answer: 1,
        explain: "Biến môi trường luôn là chuỗi hoặc không tồn tại. Cần `z.coerce.number()` hoặc tự parse."
      },
      {
        q: "Cách cung cấp JWT_SECRET cho production phù hợp nhất?",
        options: ["Hard-code làm hằng số trong code", "Ghi vào Dockerfile bằng lệnh ENV", "Nạp từ secret manager lúc container chạy", "Commit file .env.production vào repo"],
        answer: 2,
        explain: "Secret không được nằm trong code, image hay git. Orchestrator nạp nó vào môi trường lúc chạy."
      }
    ]
  },
  "p03.m0.t5": {
    sections: [
      {
        h: "Điều gì xảy ra khi Pod bị dừng",
        p: [
          "Mỗi lần deploy, scale down hay node bị thu hồi, Kubernetes dừng Pod cũ. Trình tự: Pod được đánh dấu Terminating và bị gỡ khỏi Service endpoints (song song, không đợi nhau), hook `preStop` chạy nếu có, container nhận SIGTERM, và sau `terminationGracePeriodSeconds` (mặc định 30 giây) nếu vẫn chưa thoát thì bị SIGKILL.",
          "Nếu ứng dụng thoát ngay khi nhận SIGTERM, các request đang xử lý bị cắt giữa chừng, transaction dở dang, job BullMQ đang chạy bị bỏ lại. Người dùng thấy lỗi 502 mỗi lần bạn deploy."
        ]
      },
      {
        h: "Trình tự shutdown đúng",
        list: [
          "Nhận SIGTERM: chuyển readiness sang không sẵn sàng để không nhận traffic mới.",
          "Ngừng nhận kết nối mới (`server.close()`), chờ request đang xử lý hoàn tất.",
          "Dừng consumer: worker BullMQ chờ job hiện tại xong (`worker.close()`), ngừng lấy job mới.",
          "Đóng kết nối ra ngoài: database pool, Redis, message broker.",
          "Thoát với exit code 0, trước khi hết grace period."
        ],
        p: [
          "Vì gỡ endpoint và gửi SIGTERM diễn ra song song, trong vài giây đầu vẫn có thể có request mới tới. Nhiều đội thêm `preStop` sleep ngắn (ví dụ 5 giây) để load balancer kịp cập nhật trước khi ứng dụng đóng server."
        ]
      },
      {
        h: "Graceful shutdown trong NestJS",
        p: [
          "Nest chỉ lắng nghe tín hiệu hệ thống khi bạn gọi `app.enableShutdownHooks()`. Khi nhận tín hiệu, Nest gọi lần lượt `onModuleDestroy`, `beforeApplicationShutdown`, đóng HTTP server, rồi `onApplicationShutdown` của các provider. Bạn đặt logic dọn dẹp vào các hook này."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(); // lắng nghe SIGTERM, SIGINT
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

// src/queue/email.worker.ts
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class EmailWorker implements OnApplicationShutdown {
  private connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
  private worker = new Worker('email', async (job) => { /* ... */ }, {
    connection: this.connection,
  });

  async onApplicationShutdown(signal?: string) {
    // Chờ job đang chạy xong, không nhận job mới
    await this.worker.close();
    await this.connection.quit();
  }
}`
        }
      },
      {
        h: "Kiểm tra và các chi tiết hay quên",
        p: [
          "Thử bằng `docker stop` hoặc `kill -TERM <pid>` khi đang có request chậm: request phải hoàn tất và process thoát trong vài giây. Nếu container luôn mất đúng 10 giây mới dừng, tín hiệu không tới được Node (xem bài HEALTHCHECK & tín hiệu ở chương Docker).",
          "Đặt timeout cho quá trình shutdown ngắn hơn grace period, để nếu có kết nối treo, bạn vẫn tự thoát có kiểm soát và ghi log, thay vì bị SIGKILL. Với job dài hơn grace period, thiết kế job idempotent để chạy lại an toàn."
        ]
      }
    ],
    summary: [
      "Kubernetes gửi SIGTERM, chờ grace period (mặc định 30s), rồi SIGKILL.",
      "Trình tự: ngừng nhận mới → xong request dở → dừng consumer → đóng DB/Redis → thoát.",
      "NestJS cần app.enableShutdownHooks() để chạy các hook shutdown.",
      "preStop sleep ngắn giúp tránh request tới sau khi server đóng.",
      "Job dài phải idempotent vì có thể bị ngắt."
    ],
    pitfalls: [
      "Quên `enableShutdownHooks()`: các hook `onApplicationShutdown` không bao giờ chạy.",
      "Gọi `process.exit()` ngay trong handler SIGTERM: cắt đứt request đang xử lý.",
      "Chạy bằng `npm start` trong container nên SIGTERM không tới Node: dùng `CMD [\"node\", \"dist/main.js\"]` và tini."
    ],
    quiz: [
      {
        q: "Mặc định Kubernetes chờ bao lâu sau SIGTERM trước khi gửi SIGKILL?",
        options: ["5 giây", "10 giây", "30 giây", "Không bao giờ"],
        answer: 2,
        explain: "terminationGracePeriodSeconds mặc định là 30 giây. 10 giây là mặc định của `docker stop`."
      },
      {
        q: "Trong NestJS, điều kiện để onApplicationShutdown được gọi khi nhận SIGTERM là gì?",
        options: ["Đánh dấu provider bằng @Global() trong module gốc", "Gọi app.enableShutdownHooks() trong bootstrap", "Đăng ký provider vào mảng exports của AppModule", "Chạy ứng dụng qua PM2 để PM2 chuyển tiếp tín hiệu"],
        answer: 1,
        explain: "Nest không tự lắng nghe tín hiệu hệ thống; cần enableShutdownHooks()."
      },
      {
        q: "Vì sao nên có preStop sleep vài giây?",
        options: ["Để Pod giảm CPU trước khi bị dừng hẳn", "Vì gỡ khỏi endpoint và SIGTERM diễn ra song song", "Để kịp chạy migration trước khi Pod mới lên", "Vì thời gian sleep được cộng thêm vào grace period"],
        answer: 1,
        explain: "Load balancer và kube-proxy cần thời gian cập nhật. Đóng server ngay có thể làm request mới bị từ chối."
      }
    ]
  },
  "p03.m1.t0": {
    sections: [
      {
        h: "Vòng đời một request trong Express",
        p: [
          "Express là framework HTTP tối giản và là nền mặc định của NestJS. Ý tưởng cốt lõi là middleware: các hàm `(req, res, next)` xếp thành chuỗi. Request đi qua từng middleware theo đúng thứ tự bạn `app.use()`. Mỗi middleware có thể đọc/sửa `req`, trả response luôn (kết thúc chuỗi), hoặc gọi `next()` để chuyển tiếp.",
          "Route handler thực chất cũng là middleware ở cuối chuỗi. Nếu không middleware nào trả response, Express trả 404 mặc định."
        ]
      },
      {
        h: "Thứ tự middleware quyết định hành vi",
        p: [
          "Vì chạy tuần tự, thứ tự là tất cả. Middleware parse body phải đứng trước route cần `req.body`. Middleware gán request-id nên đứng đầu để mọi log sau có id. Middleware xác thực đặt trước các route cần bảo vệ nhưng sau route công khai như `/health`."
        ],
        code: {
          lang: "typescript",
          file: "src/server.ts",
          src: `import express, { type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

const app = express();

// 1. Gán request-id sớm nhất
app.use((req, res, next) => {
  const id = req.get('x-request-id') ?? randomUUID();
  res.setHeader('x-request-id', id);
  res.locals.requestId = id;
  next();
});
// 2. Parse JSON, giới hạn kích thước body
app.use(express.json({ limit: '1mb' }));

// 3. Route công khai
app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

// 4. Route nghiệp vụ: Express 5 tự chuyển Promise bị reject sang error middleware
app.get('/v1/projects/:id', async (req, res) => {
  const project = await findProject(req.params.id); // ném lỗi nếu DB lỗi
  if (!project) { res.status(404).json({ title: 'Not Found' }); return; }
  res.json(project);
});

// 5. Error middleware: 4 tham số, đặt cuối cùng
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error({ requestId: res.locals.requestId, err });
  res.status(500).json({ title: 'Internal Server Error' });
});

app.listen(3000);

declare function findProject(id: string): Promise<unknown>;`
        }
      },
      {
        h: "Error middleware và điểm mới của Express 5",
        p: [
          "Express nhận diện error middleware bằng số tham số: đúng 4 tham số `(err, req, res, next)`. Khi một middleware gọi `next(err)` hoặc ném lỗi, Express bỏ qua các middleware thường và nhảy tới error middleware gần nhất phía sau.",
          "Ở Express 4, lỗi trong hàm async không được bắt tự động; bạn phải `try/catch` rồi `next(err)`, nếu không request treo hoặc process báo unhandled rejection. Express 5 xử lý Promise bị reject từ handler và middleware, chuyển thẳng sang error middleware. Express 5 cũng đổi cú pháp path pattern: wildcard phải có tên, ví dụ `/*splat` thay vì `*`."
        ]
      },
      {
        h: "Express và NestJS",
        p: [
          "NestJS dùng Express bên dưới (hoặc Fastify nếu bạn chọn adapter). Middleware Express vẫn dùng được trong Nest qua `app.use()` hoặc `MiddlewareConsumer`. Hiểu Express giúp bạn debug khi Nest \"làm phép\": cuối cùng mọi thứ vẫn là một chuỗi hàm xử lý `req` và `res`."
        ]
      }
    ],
    summary: [
      "Middleware chạy tuần tự theo thứ tự app.use(); gọi next() để chuyển tiếp.",
      "Đặt request-id, body parser, auth theo đúng thứ tự phụ thuộc.",
      "Error middleware có 4 tham số, đặt cuối cùng.",
      "Express 5 tự chuyển lỗi từ hàm async sang error middleware.",
      "NestJS chạy trên Express (mặc định) nên các khái niệm này vẫn áp dụng."
    ],
    pitfalls: [
      "Quên gọi `next()` hoặc không trả response: request treo tới khi client timeout.",
      "Error middleware chỉ có 3 tham số: Express coi nó là middleware thường và không gọi khi có lỗi.",
      "Gửi response hai lần (`res.json` rồi lại `next()` tới handler khác gửi tiếp): lỗi `Cannot set headers after they are sent`."
    ],
    quiz: [
      {
        q: "Express nhận biết error middleware dựa vào đâu?",
        options: ["Tên hàm có chứa chữ error", "Hàm khai báo đúng 4 tham số", "Hàm được đăng ký bằng app.error()", "Hàm được đặt sau mọi route"],
        answer: 1,
        explain: "Express kiểm tra số tham số của hàm (function.length). Đúng 4 tham số là error middleware."
      },
      {
        q: "Trong Express 5, handler async ném lỗi thì điều gì xảy ra?",
        options: ["Process crash vì unhandled rejection", "Request treo tới khi client timeout", "Lỗi được chuyển tới error middleware", "Express bỏ qua và trả 404 mặc định"],
        answer: 2,
        explain: "Express 5 bắt Promise bị reject và gọi next(err). Express 4 thì không."
      },
      {
        q: "Vì sao middleware `express.json()` phải đứng trước route POST?",
        options: ["Vì body parser đặt sau sẽ parse lại body hai lần", "Vì middleware chạy theo thứ tự đăng ký, route cần req.body đã parse", "Vì Express báo lỗi khởi động nếu route đứng trước", "Vì express.json() còn bật CORS cho các route phía sau"],
        answer: 1,
        explain: "Route đăng ký trước body parser sẽ nhận req.body là undefined."
      }
    ]
  },
  "p03.m1.t1": {
    sections: [
      {
        h: "Module, Controller, Provider",
        p: [
          "NestJS tổ chức ứng dụng bằng ba khối. Module gom nhóm theo tính năng (UsersModule, OrdersModule) và khai báo cái gì được export cho module khác. Controller nhận HTTP request và trả response. Provider là mọi class có `@Injectable()` như service, repository, client, được Nest khởi tạo và tiêm vào nơi cần.",
          "Dependency Injection (DI) container của Nest đọc kiểu tham số constructor (nhờ metadata TypeScript), tự tạo instance và truyền vào. Bạn không `new UsersService(new UsersRepository(...))` thủ công, và khi test có thể thay provider bằng bản giả."
        ],
        code: {
          lang: "typescript",
          file: "src/users/users.module.ts",
          src: `import { Controller, Get, Injectable, Module, Param, ParseUUIDPipe } from '@nestjs/common';

@Injectable()
export class UsersService {
  findOne(id: string) { return { id, name: 'An' }; }
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOne(id);
  }
}

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // module khác import UsersModule mới dùng được
})
export class UsersModule {}`
        }
      },
      {
        h: "Scope và lifecycle hooks",
        p: [
          "Mặc định provider là singleton (`Scope.DEFAULT`): một instance dùng chung cho cả ứng dụng. Đây là lựa chọn nhanh nhất và đúng cho hầu hết trường hợp. `Scope.REQUEST` tạo instance mới cho mỗi request, và lan truyền lên mọi provider phụ thuộc vào nó, nên tốn chi phí; `Scope.TRANSIENT` tạo instance riêng cho mỗi nơi inject.",
          "Lifecycle hooks cho phép chạy code theo vòng đời: `onModuleInit` (kết nối, warm-up), `onApplicationBootstrap`, và khi dừng: `onModuleDestroy`, `beforeApplicationShutdown`, `onApplicationShutdown`."
        ]
      },
      {
        h: "Guards, Interceptors, Pipes, Filters",
        p: [
          "Đây là các điểm mở rộng quanh handler, chạy theo thứ tự cố định: Middleware → Guards → Interceptors (trước) → Pipes → Handler → Interceptors (sau) → Exception Filters (khi có lỗi)."
        ],
        list: [
          "Guard: quyết định request có được đi tiếp không (xác thực, phân quyền). Trả false thì Nest ném 403.",
          "Interceptor: bọc quanh handler, dùng RxJS; log thời gian, biến đổi response, cache, timeout.",
          "Pipe: biến đổi và validate tham số (`ParseIntPipe`, `ValidationPipe`).",
          "Exception Filter: bắt lỗi và định dạng response lỗi."
        ],
        code: {
          lang: "typescript",
          file: "src/common/timing.interceptor.ts",
          src: `import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const start = performance.now();
    return next.handle().pipe(
      tap(() => this.logger.log(req.method + ' ' + req.url + ' ' + Math.round(performance.now() - start) + 'ms')),
    );
  }
}`
        }
      },
      {
        h: "Chọn đúng công cụ",
        p: [
          "Câu hỏi thường gặp là nên đặt logic ở đâu. Kiểm tra JWT và quyền: Guard. Chuẩn hoá và validate input: Pipe. Đo thời gian, bọc response, cache: Interceptor. Chuyển exception thành JSON thống nhất: Filter. Đặt đúng chỗ giúp controller chỉ còn nhận input và gọi service."
        ]
      }
    ],
    summary: [
      "Module gom tính năng; Controller xử lý HTTP; Provider chứa logic và được DI tiêm vào.",
      "Provider mặc định là singleton; REQUEST scope tốn chi phí và lan truyền.",
      "Thứ tự: Middleware → Guard → Interceptor → Pipe → Handler → Interceptor → Filter.",
      "Guard cho phân quyền, Pipe cho validate, Interceptor cho cross-cutting, Filter cho lỗi."
    ],
    pitfalls: [
      "Quên thêm provider vào `exports` rồi gặp lỗi \"Nest can't resolve dependencies\" ở module khác.",
      "Dùng REQUEST scope chỉ để lấy user hiện tại: làm mọi provider phụ thuộc bị tạo lại mỗi request. Truyền user qua tham số hoặc dùng AsyncLocalStorage.",
      "Viết logic phân quyền trong Interceptor: Guard chạy trước và dành riêng cho việc này."
    ],
    quiz: [
      {
        q: "Trong NestJS, thành phần nào chạy trước: Guard hay Pipe?",
        options: ["Pipe", "Guard", "Chạy song song", "Tuỳ thứ tự khai báo"],
        answer: 1,
        explain: "Guard chạy trước Interceptor và Pipe, để request không được phép bị chặn sớm trước khi tốn công validate."
      },
      {
        q: "Scope mặc định của provider là gì?",
        options: ["REQUEST", "TRANSIENT", "Singleton (DEFAULT)", "Mỗi module một instance"],
        answer: 2,
        explain: "Mặc định một instance dùng chung toàn ứng dụng."
      },
      {
        q: "Bạn cần đo thời gian xử lý mọi request và log lại. Nên dùng gì?",
        options: ["Guard", "Pipe", "Interceptor", "Exception Filter"],
        answer: 2,
        explain: "Interceptor bọc quanh handler nên thấy được cả lúc bắt đầu và lúc kết thúc."
      }
    ]
  },
  "p03.m1.t2": {
    sections: [
      {
        h: "Vì sao phân lớp",
        p: [
          "Khi mọi thứ nằm trong controller (parse request, query SQL, tính giá, gửi email), code nhanh chóng khó test và khó thay đổi. Kiến trúc phân lớp tách trách nhiệm để mỗi lớp chỉ có một lý do thay đổi:"
        ],
        list: [
          "Controller (lớp HTTP): nhận request, validate input qua DTO, gọi service, trả response. Không chứa quy tắc nghiệp vụ.",
          "Service (lớp nghiệp vụ): quy tắc của domain, ví dụ \"không được đặt quá 5 task ưu tiên cao\", điều phối transaction.",
          "Repository (lớp dữ liệu): đọc/ghi database, giấu chi tiết ORM hay SQL."
        ]
      },
      {
        h: "Nghiệp vụ không phụ thuộc framework",
        p: [
          "Service không nên biết về `Request`, `Response` hay `HttpException`. Nó ném lỗi domain như `ProjectLimitExceededError`; lớp HTTP mới quyết định lỗi đó thành status 409 hay 422. Nhờ vậy cùng service dùng được cho REST controller, GraphQL resolver, worker BullMQ hay CLI script.",
          "Service phụ thuộc vào một interface repository chứ không phụ thuộc trực tiếp Prisma. Khi test unit, bạn truyền repository giả trong bộ nhớ, không cần database."
        ],
        code: {
          lang: "typescript",
          file: "src/tasks/tasks.service.ts",
          src: `import { Inject, Injectable } from '@nestjs/common';

export interface Task { id: string; projectId: string; title: string; priority: 'low' | 'high'; }

export interface TaskRepository {
  countHighPriority(projectId: string): Promise<number>;
  create(data: Omit<Task, 'id'>): Promise<Task>;
}
export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export class TooManyHighPriorityTasksError extends Error {
  constructor(readonly projectId: string) { super('Project has too many high priority tasks'); }
}

@Injectable()
export class TasksService {
  constructor(@Inject(TASK_REPOSITORY) private readonly repo: TaskRepository) {}

  async create(input: Omit<Task, 'id'>): Promise<Task> {
    if (input.priority === 'high' && (await this.repo.countHighPriority(input.projectId)) >= 5) {
      throw new TooManyHighPriorityTasksError(input.projectId);
    }
    return this.repo.create(input);
  }
}`
        }
      },
      {
        h: "Đăng ký implementation trong module",
        code: {
          lang: "typescript",
          file: "src/tasks/tasks.module.ts",
          src: `import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService, TASK_REPOSITORY } from './tasks.service';
import { PrismaTaskRepository } from './prisma-task.repository';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
  ],
})
export class TasksModule {}`
        },
        p: [
          "Trong test, bạn chỉ cần `{ provide: TASK_REPOSITORY, useValue: fakeRepo }`."
        ]
      },
      {
        h: "Đừng làm quá",
        p: [
          "Phân lớp có chi phí: thêm file, thêm interface. Với CRUD đơn giản không có quy tắc nghiệp vụ, service chỉ chuyển tiếp sang repository là chấp nhận được. Hãy giữ ranh giới rõ ràng (controller không gọi thẳng ORM, service không đụng HTTP), nhưng không cần tạo abstraction cho mọi thứ ngay từ đầu. Khi domain phức tạp lên, bạn có nền để tách tiếp."
        ]
      }
    ],
    summary: [
      "Controller lo HTTP, Service lo nghiệp vụ, Repository lo dữ liệu.",
      "Service ném lỗi domain, không ném HttpException.",
      "Service phụ thuộc interface repository, inject bằng token.",
      "Nhờ vậy nghiệp vụ tái dùng được cho REST, GraphQL, worker và dễ test unit.",
      "Giữ ranh giới rõ nhưng tránh abstraction thừa cho CRUD đơn giản."
    ],
    pitfalls: [
      "Controller gọi thẳng `prisma.task.findMany()`: nghiệp vụ và truy cập dữ liệu dính vào lớp HTTP.",
      "Service ném `NotFoundException` của Nest: không dùng lại được trong worker hay CLI một cách tự nhiên.",
      "Repository trả về entity ORM rồi controller trả thẳng ra ngoài: lộ field nhạy cảm như passwordHash. Map sang DTO response."
    ],
    quiz: [
      {
        q: "Quy tắc \"một project tối đa 5 task ưu tiên cao\" nên đặt ở lớp nào?",
        options: ["Controller", "Service", "Repository", "Middleware"],
        answer: 1,
        explain: "Đây là quy tắc nghiệp vụ, thuộc lớp service. Controller chỉ lo HTTP, repository chỉ lo đọc/ghi."
      },
      {
        q: "Lợi ích chính của việc service phụ thuộc interface repository thay vì Prisma trực tiếp?",
        options: ["Query chạy nhanh hơn vì bỏ qua lớp ORM", "Dễ thay implementation và test bằng repository giả", "Bundle nhỏ hơn vì Prisma không được import", "NestJS bắt buộc mọi provider phải có interface"],
        answer: 1,
        explain: "Dependency inversion cho phép inject bản giả khi test và đổi công nghệ lưu trữ mà không sửa nghiệp vụ."
      },
      {
        q: "Service nên báo lỗi \"vượt giới hạn task\" thế nào?",
        options: ["Ném ConflictException của NestJS", "Gọi res.status(409) ngay trong service", "Ném domain error riêng để lớp HTTP ánh xạ", "Ghi console.error rồi trả về null"],
        answer: 2,
        explain: "Domain error giữ service độc lập với HTTP. Exception filter sẽ ánh xạ nó sang 409 hoặc 422."
      }
    ]
  },
  "p03.m1.t3": {
    sections: [
      {
        h: "Validate tại biên hệ thống",
        p: [
          "Mọi dữ liệu từ bên ngoài (body, query, params, header, message từ queue, webhook) đều không đáng tin. Nguyên tắc là validate một lần ở biên, ngay khi dữ liệu vào hệ thống, rồi bên trong làm việc với kiểu đã được đảm bảo. TypeScript không giúp gì ở runtime: `body: CreateTaskDto` chỉ là khai báo, client vẫn gửi được bất cứ thứ gì.",
          "DTO (Data Transfer Object) mô tả hình dạng dữ liệu hợp lệ cho từng endpoint. Trong NestJS có hai cách phổ biến: class-validator (decorator trên class) và Zod (schema)."
        ]
      },
      {
        h: "class-validator với ValidationPipe",
        code: {
          lang: "typescript",
          file: "src/tasks/dto/create-task.dto.ts",
          src: `import { IsEnum, IsOptional, IsString, IsUUID, Length, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @Length(1, 200)
  title!: string;

  @IsEnum(['low', 'high'])
  priority!: 'low' | 'high';

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

// src/main.ts
// app.useGlobalPipes(new ValidationPipe({
//   whitelist: true,             // loại bỏ field không khai báo trong DTO
//   forbidNonWhitelisted: true,  // hoặc trả 400 nếu có field lạ
//   transform: true,             // chuyển plain object thành instance DTO, ép kiểu params
// }));`
        },
        p: [
          "Request sai định dạng sẽ bị trả 400 kèm danh sách lỗi trước khi vào controller."
        ]
      },
      {
        h: "Mass-assignment và whitelist",
        p: [
          "Mass-assignment xảy ra khi bạn truyền nguyên body vào ORM: `prisma.user.update({ data: req.body })`. Kẻ tấn công chỉ cần gửi thêm `\"role\": \"admin\"` hoặc `\"balance\": 999999` là ghi được field lẽ ra không được sửa.",
          "`whitelist: true` loại bỏ mọi field không có decorator trong DTO, còn `forbidNonWhitelisted: true` từ chối hẳn request. Kết hợp với việc tạo DTO riêng cho từng hành động (CreateUserDto khác UpdateProfileDto, không có field `role`), bạn chặn được lớp lỗi này."
        ]
      },
      {
        h: "Zod: một schema, cả kiểu lẫn validate",
        p: [
          "Zod định nghĩa schema bằng code và suy ra kiểu TypeScript bằng `z.infer`, không cần decorator. Zod mặc định bỏ qua (strip) key không khai báo, dùng `.strict()` để từ chối. Zod hợp với dự án chia sẻ schema giữa frontend và backend. class-validator gắn chặt hơn với hệ sinh thái Nest (Swagger plugin đọc được decorator). Chọn một cách và dùng thống nhất."
        ],
        code: {
          lang: "typescript",
          file: "src/common/zod-validation.pipe.ts",
          src: `import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z, type ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}
  transform(value: unknown): T {
    const r = this.schema.safeParse(value);
    if (!r.success) throw new BadRequestException(r.error.issues);
    return r.data;
  }
}

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'high']),
}).strict();

// @Post() create(@Body(new ZodValidationPipe(createTaskSchema)) dto: z.infer<typeof createTaskSchema>) {}`
        }
      }
    ],
    summary: [
      "Validate mọi input ở biên; TypeScript không kiểm tra runtime.",
      "ValidationPipe với whitelist, forbidNonWhitelisted, transform.",
      "Mass-assignment: không truyền nguyên body vào ORM; mỗi hành động một DTO.",
      "Zod suy ra kiểu từ schema; class-validator tích hợp sâu với Nest.",
      "Chọn một cách và dùng thống nhất trong dự án."
    ],
    pitfalls: [
      "Bật ValidationPipe nhưng quên `whitelist`: field lạ vẫn lọt vào DTO và có thể tới ORM.",
      "Dùng một DTO chung cho create/update/admin: field chỉ admin được sửa bị lộ cho user thường.",
      "Chỉ validate body mà quên query và params: `?limit=100000` có thể kéo sập DB."
    ],
    quiz: [
      {
        q: "Vì sao khai báo kiểu `@Body() dto: CreateTaskDto` là chưa đủ để an toàn?",
        options: ["Vì Nest chỉ đọc kiểu DTO khi bật strict mode", "Vì kiểu TypeScript bị xoá khi biên dịch, không kiểm tra lúc chạy", "Vì DTO phải được đánh dấu @Injectable mới được kiểm tra", "Vì @Body() chỉ kiểm tra kiểu với field bắt buộc"],
        answer: 1,
        explain: "Kiểu chỉ tồn tại lúc compile. Cần ValidationPipe hoặc Zod để kiểm tra dữ liệu thực tế."
      },
      {
        q: "`whitelist: true` trong ValidationPipe có tác dụng gì?",
        options: ["Chỉ cho các IP trong danh sách được gọi API", "Loại bỏ field không có decorator trong DTO", "Chỉ validate các field nằm trong danh sách", "Trả 400 cho mọi request có field lạ"],
        answer: 1,
        explain: "Field không có decorator validation bị loại khỏi object, giúp chặn mass-assignment."
      },
      {
        q: "Mass-assignment là gì?",
        options: ["Client gửi quá nhiều request trong thời gian ngắn", "Client ghi được field cấm vì server đưa nguyên body vào ORM", "Server tạo hàng loạt bản ghi trong một transaction", "Một user được gán nhiều role cùng lúc"],
        answer: 1,
        explain: "Ví dụ gửi thêm role: admin trong body khi server dùng body làm data cập nhật trực tiếp."
      }
    ]
  },
  "p03.m1.t4": {
    sections: [
      {
        h: "Vì sao cần xử lý lỗi tập trung",
        p: [
          "Nếu mỗi controller tự `try/catch` và tự trả JSON lỗi theo kiểu riêng, client nhận mười định dạng khác nhau, và sớm muộn có chỗ trả nguyên `err.stack` ra ngoài. Stack trace tiết lộ đường dẫn file, thư viện, câu SQL, là thông tin quý cho kẻ tấn công.",
          "Cách tốt hơn: code nghiệp vụ chỉ ném lỗi, một nơi duy nhất (Exception Filter trong NestJS) quyết định ánh xạ sang HTTP status, định dạng response và ghi log."
        ]
      },
      {
        h: "Định dạng chuẩn: RFC 9457 Problem Details",
        p: [
          "RFC 9457 (thay thế RFC 7807) định nghĩa định dạng lỗi JSON với content-type `application/problem+json`. Các field chuẩn: `type` (URI định danh loại lỗi), `title` (mô tả ngắn, cố định theo loại), `status`, `detail` (giải thích cho lần xảy ra cụ thể), `instance` (định danh lần xảy ra). Bạn được thêm field mở rộng như `errors` hay `traceId`."
        ],
        code: {
          lang: "json",
          file: "response 409",
          src: `{
  "type": "https://api.example.com/problems/too-many-high-priority-tasks",
  "title": "Too many high priority tasks",
  "status": 409,
  "detail": "Project 7f3a... already has 5 high priority tasks.",
  "instance": "/v1/projects/7f3a.../tasks",
  "traceId": "b1c2d3e4"
}`
        }
      },
      {
        h: "Exception Filter ánh xạ domain error",
        code: {
          lang: "typescript",
          file: "src/common/problem-details.filter.ts",
          src: `import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { TooManyHighPriorityTasksError } from '../tasks/tasks.service';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let status = 500;
    let title = 'Internal Server Error';
    let detail: string | undefined;

    if (exception instanceof TooManyHighPriorityTasksError) {
      status = 409; title = 'Too many high priority tasks'; detail = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus(); title = exception.message;
    } else {
      // Lỗi không lường trước: log đầy đủ, trả thông tin tối thiểu
      this.logger.error(exception);
    }

    res.status(status).type('application/problem+json').json({
      type: 'about:blank', title, status, detail, instance: req.originalUrl,
    });
  }
}
// main.ts: app.useGlobalFilters(new ProblemDetailsFilter());`
        },
        p: [
          "`type: \"about:blank\"` là giá trị RFC cho phép khi lỗi không cần thêm ngữ nghĩa ngoài status. Với lỗi domain quan trọng, hãy dùng URI riêng để client xử lý theo `type` thay vì so sánh chuỗi `title`."
        ]
      },
      {
        h: "Phân loại lỗi",
        list: [
          "Lỗi người dùng (4xx): input sai, không có quyền, không tìm thấy. Trả detail rõ ràng, log mức warn hoặc info.",
          "Lỗi hệ thống (5xx): bug, DB mất kết nối. Trả thông báo chung, log mức error kèm stack và request-id để tra cứu.",
          "Luôn trả kèm request-id/trace-id để người dùng báo lỗi và bạn tìm log tương ứng."
        ],
        p: [
          "Không để lỗi \"lọt\" ra ngoài filter: bắt cả `unhandledRejection` ở mức process để log, nhưng đừng coi đó là cơ chế xử lý lỗi chính."
        ]
      }
    ],
    summary: [
      "Code nghiệp vụ ném lỗi; một Exception Filter quyết định HTTP response.",
      "Dùng RFC 9457 Problem Details: type, title, status, detail, instance.",
      "Content-type application/problem+json.",
      "Không bao giờ trả stack trace hay thông điệp lỗi nội bộ cho client.",
      "Kèm request-id để truy vết log."
    ],
    pitfalls: [
      "Trả `err.message` của lỗi database ra client: có thể lộ tên bảng, câu SQL.",
      "Client so sánh chuỗi `title` để xử lý logic: dùng `type` ổn định thay thế.",
      "Log lỗi 4xx ở mức error: log bị nhiễu, cảnh báo giả liên tục."
    ],
    quiz: [
      {
        q: "RFC nào hiện là chuẩn cho Problem Details for HTTP APIs?",
        options: ["RFC 7231", "RFC 7807", "RFC 9457", "RFC 6749"],
        answer: 2,
        explain: "RFC 9457 thay thế RFC 7807. RFC 7231 là HTTP semantics cũ, RFC 6749 là OAuth 2.0."
      },
      {
        q: "Với lỗi 500 không lường trước, response cho client nên chứa gì?",
        options: ["Stack trace đầy đủ để client gửi lại khi báo lỗi", "Thông báo chung kèm request-id; chi tiết chỉ nằm trong log", "Nguyên err.message của thư viện database", "Body rỗng với status 200 để client không hiển thị lỗi"],
        answer: 1,
        explain: "Chi tiết nội bộ chỉ nên nằm trong log. Client cần biết có lỗi và id để báo cáo."
      },
      {
        q: "Field nào trong Problem Details dùng để client phân biệt loại lỗi một cách ổn định?",
        options: ["title", "detail", "type", "instance"],
        answer: 2,
        explain: "type là URI định danh loại lỗi. detail thay đổi theo từng lần, title chỉ để con người đọc."
      }
    ]
  },
  "p03.m1.t5": {
    sections: [
      {
        h: "Vì sao log dạng JSON",
        p: [
          "Log dạng chữ tự do như `User 42 created order 99` dễ đọc bằng mắt nhưng khó tìm kiếm khi có hàng triệu dòng. Structured logging ghi mỗi dòng là một object JSON với các field cố định: `level`, `time`, `msg`, `reqId`, `userId`, `orderId`. Hệ thống log (Loki, Elasticsearch, CloudWatch) lọc được theo field: \"mọi log của request abc\", \"mọi lỗi của userId 42 trong 1 giờ qua\".",
          "Pino là logger phổ biến nhất cho Node vì rất nhanh (ghi JSON tối giản; việc định dạng hay gửi log đi nơi khác được đẩy sang transport chạy trong worker thread riêng, hoặc để công cụ bên ngoài xử lý). Winston linh hoạt hơn về transport nhưng chậm hơn. Với NestJS, `nestjs-pino` tích hợp Pino và tự log mỗi request."
        ]
      },
      {
        h: "Request-id và correlation-id",
        p: [
          "Một request đi qua API gateway, API, worker và service khác. Để ghép log của cùng một luồng, mỗi request mang một id: nhận từ header `x-request-id` nếu có (do gateway sinh), không có thì tự sinh, gắn vào mọi dòng log, trả lại trong response header, và truyền tiếp khi gọi service khác hoặc đẩy job vào queue. Khi dùng OpenTelemetry, trace-id đóng vai trò tương tự và nên được đưa vào log."
        ],
        code: {
          lang: "typescript",
          file: "src/app.module.ts",
          src: `import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: (req, res) => {
          const id = (req.headers['x-request-id'] as string) ?? randomUUID();
          res.setHeader('x-request-id', id);
          return id;
        },
        redact: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
        // Dev: định dạng dễ đọc; production: JSON thuần ra stdout
        transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
      },
    }),
  ],
})
export class AppModule {}
// main.ts: const app = await NestFactory.create(AppModule, { bufferLogs: true });
//          app.useLogger(app.get(Logger));  // Logger từ 'nestjs-pino'`
        }
      },
      {
        h: "Log level và cách viết log",
        list: [
          "`error`: lỗi cần người xử lý (DB mất kết nối, job fail hết số lần retry).",
          "`warn`: bất thường nhưng hệ thống vẫn chạy (retry, gần chạm giới hạn).",
          "`info`: sự kiện nghiệp vụ quan trọng (order created, user signed up).",
          "`debug`: chi tiết cho dev, tắt ở production mặc định."
        ],
        p: [
          "Đưa dữ liệu vào field, không nối chuỗi: `logger.info({ orderId, amount }, 'order created')`. Thông điệp giữ cố định để dễ đếm và cảnh báo, còn dữ liệu biến đổi nằm ở field."
        ]
      },
      {
        h: "Không log dữ liệu nhạy cảm",
        p: [
          "Log thường được giữ lâu và nhiều người truy cập. Không bao giờ log mật khẩu, token, header Authorization, cookie, số thẻ, và hạn chế log dữ liệu cá nhân (email, số điện thoại) theo quy định bảo vệ dữ liệu. Dùng `redact` của Pino để che các đường dẫn nhạy cảm, và cẩn thận khi log nguyên object request hay entity."
        ]
      }
    ],
    summary: [
      "Log JSON có field cố định để tìm kiếm và lọc.",
      "Pino nhanh, nestjs-pino tích hợp sẵn log request.",
      "Mỗi request có request-id, trả trong header và truyền sang service/queue khác.",
      "Dùng đúng level; dữ liệu vào field, message cố định.",
      "Redact token, mật khẩu, cookie; hạn chế dữ liệu cá nhân."
    ],
    pitfalls: [
      "Dùng `pino-pretty` ở production: tốn CPU và phá định dạng JSON mà hệ thống log cần.",
      "Log nguyên `req.body` của endpoint đăng nhập: mật khẩu nằm trong log.",
      "Nối chuỗi `'order ' + id + ' created'`: không lọc được theo orderId và không gom nhóm được thông điệp."
    ],
    quiz: [
      {
        q: "Ưu điểm chính của structured logging là gì?",
        options: ["Log dễ đọc bằng mắt hơn khi xem terminal", "Lọc và tổng hợp log theo field trên hệ thống log", "Log chiếm ít dung lượng đĩa hơn log chữ", "Không còn cần đặt log level cho từng dòng"],
        answer: 1,
        explain: "Mỗi dòng là JSON có field nên truy vấn được như dữ liệu."
      },
      {
        q: "Request-id nên được xử lý thế nào khi API đẩy job vào BullMQ?",
        options: ["Bỏ đi, vì job chạy sau khi request đã kết thúc", "Đưa vào dữ liệu job để worker gắn vào log của nó", "Để worker tự sinh id mới cho mỗi lần xử lý job", "Chỉ lưu vào database cùng bản ghi nghiệp vụ"],
        answer: 1,
        explain: "Truyền id theo job giúp nối log từ request tới lúc worker xử lý."
      },
      {
        q: "Cách viết log nào tốt nhất?",
        options: ["logger.info('user ' + id + ' login')", "logger.info({ userId: id }, 'user login')", "console.log(user)", "logger.error('ok')"],
        answer: 1,
        explain: "Dữ liệu ở field để lọc, message cố định để gom nhóm. console.log(user) có thể lộ dữ liệu nhạy cảm."
      }
    ]
  },
  "p03.m1.t6": {
    sections: [
      {
        h: "12-Factor App là gì",
        p: [
          "12-Factor App là bộ nguyên tắc do đội Heroku đúc kết để xây ứng dụng chạy tốt trên nền tảng cloud: dễ deploy tự động, dễ scale ngang, ít khác biệt giữa môi trường. Hầu hết các nền tảng hiện nay (Kubernetes, ECS, Cloud Run) đều ngầm giả định ứng dụng tuân theo những nguyên tắc này. Đây là lý do nó là nền tảng cho CI/CD.",
          "Bạn không cần thuộc cả 12 mục, nhưng nên nắm chắc những mục ảnh hưởng trực tiếp đến backend Node."
        ]
      },
      {
        h: "Mười hai nguyên tắc",
        p: [
          "Dưới đây là 12 mục, diễn giải theo ngữ cảnh một backend Node chạy trong container."
        ],
        list: [
          "Codebase: một repo, nhiều lần deploy (dev, staging, prod) từ cùng code.",
          "Dependencies: khai báo đầy đủ và khoá phiên bản (package-lock.json), không dựa vào công cụ cài sẵn trên máy.",
          "Config: mọi thứ khác nhau giữa các môi trường nằm trong env, không nằm trong code.",
          "Backing services: DB, Redis, S3 là tài nguyên gắn vào qua URL; đổi từ Postgres local sang RDS chỉ là đổi env.",
          "Build, release, run: tách rõ build image, kết hợp image với config thành release, và chạy release.",
          "Processes: stateless, không lưu dữ liệu cần giữ trong bộ nhớ hay đĩa cục bộ.",
          "Port binding: ứng dụng tự mở HTTP server và lắng nghe một port (Node làm việc này sẵn), không phụ thuộc vào web server bên ngoài như Apache/Tomcat nạp nó vào.",
          "Concurrency: scale bằng thêm process (api, worker) thay vì làm một process to hơn.",
          "Disposability: khởi động nhanh, tắt êm (graceful shutdown).",
          "Dev/prod parity: dev dùng cùng loại Postgres, Redis như production (Docker Compose).",
          "Logs: ghi ra stdout như luồng sự kiện; nền tảng lo thu thập.",
          "Admin processes: migration, script một lần chạy cùng image và config với ứng dụng."
        ]
      },
      {
        h: "Stateless process trong thực tế",
        p: [
          "Khi chạy 3 replica sau load balancer, request tiếp theo của cùng người dùng có thể tới replica khác. Vì vậy session, rate-limit counter, cache dùng chung phải ở Redis. File upload phải lên S3, không ghi vào `./uploads` của container. Replica có thể bị xoá bất cứ lúc nào, và mọi thứ ghi cục bộ biến mất theo."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `// Log ra stdout (Pino mặc định), không tự ghi file log
// Port và host lấy từ env (port binding + config)
await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');

// Không làm:
// fs.appendFileSync('/var/log/app.log', ...)   -> mất khi container bị xoá
// const sessions = new Map()                    -> không dùng chung giữa replica`
        }
      },
      {
        h: "Mối liên hệ với CI/CD",
        p: [
          "Khi config nằm ở env và process stateless, pipeline chỉ cần build một image, rồi promote cùng image đó qua staging và production với config khác. Rollback là chạy lại image cũ. Scale là tăng số replica. Nếu ứng dụng vi phạm (hard-code config, ghi file cục bộ), mỗi bước tự động hoá đều gặp ngoại lệ phải xử lý tay."
        ]
      }
    ],
    summary: [
      "12-Factor là nguyên tắc cho ứng dụng chạy tốt trên cloud.",
      "Config qua env; backing services gắn qua URL.",
      "Process stateless: state dùng chung ở Redis/DB/S3.",
      "Log ra stdout; khởi động nhanh, tắt êm.",
      "Dev/prod parity và một image cho mọi môi trường là nền của CI/CD."
    ],
    pitfalls: [
      "Lưu file upload vào ổ cục bộ của container: mất khi Pod bị thay, không thấy ở replica khác.",
      "Dev dùng SQLite, production dùng Postgres: lỗi chỉ lộ ra ở production. Dùng Compose với Postgres thật.",
      "Chạy migration thủ công từ máy dev lên production: dùng cùng image và config như một admin process trong pipeline."
    ],
    quiz: [
      {
        q: "Theo 12-Factor, ứng dụng nên xử lý log thế nào?",
        options: ["Ghi file log xoay vòng trong container", "Ghi ra stdout, để nền tảng thu thập", "Gửi thẳng tới hệ thống log qua SDK", "Lưu vào một bảng trong database chính"],
        answer: 1,
        explain: "Ứng dụng coi log là luồng sự kiện ra stdout; Docker/Kubernetes và agent log lo thu thập."
      },
      {
        q: "Vì sao session không nên lưu trong RAM của process khi scale nhiều replica?",
        options: ["Vì RAM của container đắt hơn RAM của Redis", "Vì request sau có thể tới replica không có session đó", "Vì Map trong Node không an toàn khi có nhiều request", "Vì TLS yêu cầu session lưu ngoài process"],
        answer: 1,
        explain: "Process phải stateless; state dùng chung đặt ở backing service như Redis."
      },
      {
        q: "Nguyên tắc \"Backing services\" nghĩa là gì?",
        options: ["Luôn tự host database cùng máy với ứng dụng", "DB, cache, queue gắn vào qua cấu hình, đổi được mà không sửa code", "Chỉ được dùng dịch vụ managed của nhà cung cấp cloud", "Mỗi service phải chạy database riêng trong cùng container"],
        answer: 1,
        explain: "Đổi từ Postgres local sang RDS chỉ cần đổi DATABASE_URL."
      }
    ]
  },
  "p03.m2.t0": {
    sections: [
      {
        h: "REST xoay quanh resource",
        p: [
          "REST (Representational State Transfer) mô hình hoá API thành các resource (tài nguyên) được định danh bằng URL, và thao tác trên chúng bằng các HTTP method có ngữ nghĩa sẵn. URL là danh từ, method là động từ. Nhờ quy ước chung, người dùng API đoán được endpoint mà không cần đọc tài liệu từng cái, và hạ tầng HTTP (cache, proxy, retry) hiểu được ý nghĩa request.",
          "Quy ước phổ biến: danh từ số nhiều, chữ thường, gạch nối giữa các từ: `/v1/projects`, `/v1/projects/{id}`, `/v1/time-entries`."
        ]
      },
      {
        h: "Dùng đúng method",
        list: [
          "`GET /projects`: lấy danh sách; `GET /projects/{id}`: lấy một. An toàn (không thay đổi dữ liệu), cache được.",
          "`POST /projects`: tạo mới, server sinh id, trả 201 và header `Location`.",
          "`PUT /projects/{id}`: thay thế toàn bộ resource. Idempotent.",
          "`PATCH /projects/{id}`: cập nhật một phần.",
          "`DELETE /projects/{id}`: xoá. Idempotent."
        ],
        p: [
          "Hành động không khớp CRUD, như \"lưu trữ project\" hay \"gửi lại email xác nhận\", có hai cách: biểu diễn như thay đổi trạng thái (`PATCH /projects/{id}` với `{ \"status\": \"archived\" }`), hoặc tạo sub-resource hành động `POST /projects/{id}/archive`. Cả hai đều chấp nhận được; quan trọng là thống nhất. Tránh kiểu RPC như `POST /archiveProject`."
        ]
      },
      {
        h: "Quan hệ lồng nhau: tối đa 2 cấp",
        p: [
          "`GET /projects/{id}/tasks` diễn đạt rõ \"task của project này\". Nhưng `/orgs/{o}/projects/{p}/tasks/{t}/comments/{c}` thì quá sâu: URL dài, client phải biết mọi id cha, và quyền truy cập bị lặp lại ở mỗi cấp. Khi resource con có id toàn cục, hãy truy cập trực tiếp: `GET /tasks/{id}`, `GET /tasks/{id}/comments`. Lọc theo cha có thể dùng query: `GET /tasks?projectId=...`."
        ],
        code: {
          lang: "typescript",
          file: "src/tasks/tasks.controller.ts",
          src: `import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get('projects/:projectId/tasks')          // 2 cấp: task thuộc project
  list(@Param('projectId', ParseUUIDPipe) projectId: string) { return this.tasks.list(projectId); }

  @Post('projects/:projectId/tasks')
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create({ ...dto, projectId });
  }

  @Patch('tasks/:id')                         // task có id toàn cục: truy cập trực tiếp
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) { return this.tasks.update(id, dto); }

  @Delete('tasks/:id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.tasks.remove(id); }
}`
        }
      },
      {
        h: "HATEOAS ở mức khái niệm",
        p: [
          "HATEOAS (Hypermedia as the Engine of Application State) là ràng buộc của REST \"thuần\": response chứa link tới các hành động tiếp theo, ví dụ `\"links\": { \"next\": \"/v1/tasks?cursor=abc\" }`, để client điều hướng theo link thay vì tự ghép URL. Trong thực tế hầu hết API chỉ áp dụng một phần, phổ biến nhất là link phân trang. Bạn nên biết khái niệm, nhưng không cần theo đuổi triệt để."
        ]
      }
    ],
    summary: [
      "URL là danh từ số nhiều; method là động từ.",
      "GET an toàn; PUT và DELETE idempotent; POST tạo mới trả 201.",
      "Hành động đặc biệt: đổi trạng thái hoặc sub-resource hành động, thống nhất một kiểu.",
      "Lồng tối đa 2 cấp; resource có id toàn cục thì truy cập trực tiếp.",
      "HATEOAS thường chỉ áp dụng cho link phân trang."
    ],
    pitfalls: [
      "Dùng GET cho thao tác thay đổi dữ liệu (`GET /tasks/1/delete`): crawler, prefetch hoặc cache có thể vô tình kích hoạt.",
      "Trộn số ít và số nhiều (`/project/1`, `/tasks`): API khó đoán.",
      "Lồng quá sâu khiến client phải có đủ id cha mới gọi được resource con."
    ],
    quiz: [
      {
        q: "Endpoint nào theo đúng quy ước REST để tạo task trong một project?",
        options: ["POST /createTask", "GET /projects/1/tasks/create", "POST /projects/1/tasks", "PUT /projects/1/task"],
        answer: 2,
        explain: "POST lên collection con để tạo mới. Các lựa chọn khác dùng động từ trong URL hoặc sai method."
      },
      {
        q: "Method nào dùng để cập nhật một phần resource?",
        options: ["PUT", "PATCH", "POST", "GET"],
        answer: 1,
        explain: "PATCH cập nhật một phần; PUT thay thế toàn bộ."
      },
      {
        q: "URL `/orgs/1/projects/2/tasks/3/comments/4` có vấn đề gì?",
        options: ["Không có vấn đề, URL càng chi tiết càng rõ nghĩa", "Lồng quá sâu, nên truy cập qua /tasks/3/comments", "Sai quy ước, tên resource phải dùng số ít", "Thiếu tiền tố version nên không hợp lệ"],
        answer: 1,
        explain: "Quá nhiều cấp làm URL dài, client phải biết mọi id cha. Giới hạn khoảng 2 cấp."
      }
    ]
  },
  "p03.m2.t1": {
    sections: [
      {
        h: "Status code là hợp đồng với client",
        p: [
          "Status code cho client, proxy và công cụ giám sát biết kết quả mà không cần đọc body. Trả 200 kèm `{ \"error\": true }` phá vỡ hợp đồng này: retry tự động, dashboard tỷ lệ lỗi và cảnh báo đều không hoạt động đúng. Nhóm 2xx là thành công, 4xx là lỗi do phía client (gửi lại y hệt sẽ lại lỗi), 5xx là lỗi do phía server (có thể thử lại sau)."
        ]
      },
      {
        h: "Các mã bạn sẽ dùng hằng ngày",
        p: [
          "Bạn không cần nhớ mọi status code trong đặc tả HTTP. Nhóm mã dưới đây đủ cho gần như mọi API backend."
        ],
        list: [
          "200 OK: thành công, có body. 201 Created: tạo mới thành công, kèm header Location. 204 No Content: thành công, không có body (DELETE, cập nhật không trả dữ liệu).",
          "400 Bad Request: request sai định dạng hoặc không qua validate.",
          "401 Unauthorized: chưa xác thực hoặc token không hợp lệ/hết hạn.",
          "403 Forbidden: đã xác thực nhưng không có quyền.",
          "404 Not Found: resource không tồn tại (hoặc cố tình ẩn với người không có quyền).",
          "409 Conflict: xung đột với trạng thái hiện tại (email đã tồn tại, sửa đồng thời bản ghi đã bị đổi).",
          "422 Unprocessable Content: đúng định dạng nhưng vi phạm quy tắc nghiệp vụ. Nhiều đội gộp chung vào 400; hãy chọn một quy ước.",
          "429 Too Many Requests: vượt rate limit, kèm `Retry-After`.",
          "500 Internal Server Error: lỗi không lường trước. 502 Bad Gateway: proxy/gateway nhận response lỗi từ upstream. 503 Service Unavailable: tạm thời không phục vụ được (quá tải, bảo trì)."
        ]
      },
      {
        h: "Phân biệt 401 và 403",
        p: [
          "401 nghĩa là \"tôi không biết bạn là ai\": thiếu token, token sai chữ ký, token hết hạn. Client nên đăng nhập lại hoặc refresh token. Theo chuẩn HTTP, response 401 kèm header `WWW-Authenticate`. 403 nghĩa là \"tôi biết bạn là ai, nhưng bạn không được làm việc này\": user thường gọi API của admin. Đăng nhập lại không giúp gì.",
          "Khi không muốn tiết lộ resource có tồn tại hay không (ví dụ project của công ty khác), nhiều API trả 404 thay cho 403."
        ],
        code: {
          lang: "typescript",
          file: "src/projects/projects.controller.ts",
          src: `import { Controller, Delete, ForbiddenException, HttpCode, NotFoundException, Param, UnauthorizedException, Req } from '@nestjs/common';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() req: { user?: { id: string; role: string } }) {
    if (!req.user) throw new UnauthorizedException();          // 401: chưa đăng nhập
    const project = await this.projects.findById(id);
    if (!project) throw new NotFoundException();               // 404
    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenException();                          // 403: không có quyền
    }
    await this.projects.remove(id);                            // 204: không body
  }
}

declare class ProjectsService {
  findById(id: string): Promise<{ ownerId: string } | null>;
  remove(id: string): Promise<void>;
}`
        },
        p: [
          "Thực tế, kiểm tra 401 nên nằm trong Guard xác thực; ví dụ gộp vào handler chỉ để minh hoạ."
        ]
      },
      {
        h: "5xx: 500, 502, 503",
        p: [
          "500 là lỗi trong chính ứng dụng. 502 thường do Nginx hay load balancer không nhận được response hợp lệ từ ứng dụng (ứng dụng crash, đóng kết nối). 503 là tín hiệu chủ động \"tạm thời không phục vụ\", có thể kèm `Retry-After`. Phân biệt đúng giúp bạn khoanh vùng sự cố nhanh: 502 tăng vọt khi deploy thường là dấu hiệu thiếu graceful shutdown."
        ]
      }
    ],
    summary: [
      "Status code là hợp đồng; không trả 200 cho lỗi.",
      "201 kèm Location khi tạo; 204 khi không có body.",
      "401 là chưa xác thực; 403 là không có quyền.",
      "409 cho xung đột trạng thái; 422 cho vi phạm quy tắc (hoặc thống nhất dùng 400).",
      "429 kèm Retry-After; 502 thường do upstream lỗi, 503 là tạm thời không phục vụ."
    ],
    pitfalls: [
      "Trả 403 cho token hết hạn: client không biết cần refresh token.",
      "Trả 500 cho lỗi validate: làm sai lệch tỷ lệ lỗi server và kích hoạt cảnh báo giả.",
      "Trả 404 cho endpoint danh sách rỗng: danh sách rỗng là 200 với mảng rỗng."
    ],
    quiz: [
      {
        q: "User đã đăng nhập gọi API xoá project của người khác và không có quyền. Mã phù hợp?",
        options: ["401 Unauthorized", "403 Forbidden", "400 Bad Request", "409 Conflict"],
        answer: 1,
        explain: "User đã xác thực nhưng thiếu quyền là 403 (một số API trả 404 để ẩn việc resource tồn tại). 401 chỉ dành cho chưa xác thực hoặc token không hợp lệ."
      },
      {
        q: "Đăng ký với email đã tồn tại, mã nào hợp lý nhất?",
        options: ["200 OK", "404 Not Found", "409 Conflict", "503 Service Unavailable"],
        answer: 2,
        explain: "Request hợp lệ nhưng xung đột với trạng thái hiện có: 409 Conflict."
      },
      {
        q: "`GET /projects?status=archived` không có kết quả nào. Nên trả gì?",
        options: ["404 Not Found", "204 No Content", "200 OK với mảng rỗng", "400 Bad Request"],
        answer: 2,
        explain: "Collection tồn tại, chỉ là rỗng. 200 kèm [] giữ cấu trúc response nhất quán cho client."
      }
    ]
  },
  "p03.m2.t2": {
    sections: [
      {
        h: "Không bao giờ trả toàn bộ collection",
        p: [
          "Bảng tasks hôm nay có 100 dòng, năm sau có 5 triệu. Endpoint trả hết sẽ chậm dần, tốn RAM và có thể làm sập server. Mọi endpoint danh sách cần phân trang với `limit` mặc định và giới hạn tối đa (ví dụ mặc định 20, tối đa 100), kèm lọc và sắp xếp qua query string: `GET /v1/tasks?status=open&sort=-createdAt&limit=20`.",
          "Chỉ cho phép sort và filter trên các field đã whitelist và có index. Nhận tên cột tuỳ ý từ query rồi đưa thẳng vào SQL là lỗ hổng SQL injection và dễ gây full table scan."
        ]
      },
      {
        h: "Offset pagination",
        p: [
          "`?page=3&limit=20` dịch thành `LIMIT 20 OFFSET 40`. Dễ hiểu, cho phép nhảy thẳng tới trang bất kỳ và hiển thị tổng số trang. Nhưng có hai nhược điểm lớn:"
        ],
        list: [
          "Chậm ở trang sâu: database vẫn phải đọc và bỏ qua mọi dòng trước offset. `OFFSET 1000000` đọc một triệu dòng.",
          "Không ổn định: nếu có bản ghi mới chèn vào đầu trong lúc người dùng xem, trang sau sẽ lặp lại hoặc bỏ sót phần tử.",
          "`COUNT(*)` để tính tổng trang cũng tốn kém trên bảng lớn."
        ]
      },
      {
        h: "Cursor (keyset) pagination",
        p: [
          "Thay vì \"bỏ qua N dòng\", cursor pagination nói \"lấy các dòng sau vị trí này\". Cursor mã hoá giá trị của cột sắp xếp ở phần tử cuối trang trước. Với index phù hợp, database nhảy thẳng tới vị trí đó nên tốc độ gần như không đổi dù ở trang nào, và kết quả ổn định khi có dữ liệu mới. Cột sắp xếp phải duy nhất, nên thường kết hợp `created_at` với `id` để phá hoà."
        ],
        code: {
          lang: "sql",
          file: "queries/list-tasks.sql",
          src: `-- Index hỗ trợ sắp xếp và lọc
CREATE INDEX idx_tasks_project_created ON tasks (project_id, created_at DESC, id DESC);

-- Trang đầu: lấy limit + 1 dòng để biết còn trang sau không
SELECT id, title, created_at FROM tasks
WHERE project_id = $1
ORDER BY created_at DESC, id DESC
LIMIT 21;

-- Trang sau: cursor = (created_at, id) của phần tử cuối trang trước
SELECT id, title, created_at FROM tasks
WHERE project_id = $1 AND (created_at, id) < ($2, $3)
ORDER BY created_at DESC, id DESC
LIMIT 21;`
        }
      },
      {
        h: "Định dạng response và đánh đổi",
        code: {
          lang: "json",
          file: "GET /v1/projects/7f3a/tasks?limit=20",
          src: `{
  "data": [{ "id": "b21c", "title": "Viết migration", "createdAt": "2026-09-20T08:00:00Z" }],
  "page": {
    "nextCursor": "eyJjIjoiMjAyNi0wOS0yMFQwODowMDowMFoiLCJpIjoiYjIxYyJ9",
    "hasMore": true
  }
}`
        },
        p: [
          "Cursor thường được mã hoá base64 để client coi nó là chuỗi mờ (opaque), không tự ghép. Đánh đổi: cursor không cho nhảy tới trang 57 và khó hiển thị tổng số trang. Dùng offset cho bảng quản trị nhỏ cần số trang; dùng cursor cho feed, danh sách lớn, infinite scroll và API công khai."
        ]
      }
    ],
    summary: [
      "Mọi danh sách cần limit mặc định và tối đa.",
      "Sort/filter chỉ trên field whitelist và có index.",
      "Offset đơn giản nhưng chậm ở trang sâu và không ổn định khi dữ liệu thay đổi.",
      "Cursor dùng điều kiện WHERE theo vị trí, nhanh và ổn định; cần cột sắp xếp duy nhất.",
      "Lấy limit + 1 dòng để biết còn trang sau."
    ],
    pitfalls: [
      "Cursor chỉ dựa trên `created_at`: hai bản ghi cùng thời điểm có thể bị bỏ sót hoặc lặp. Thêm `id` để phá hoà.",
      "Đưa tham số `sort` từ query thẳng vào câu SQL: SQL injection. Ánh xạ qua whitelist.",
      "Không giới hạn `limit`: `?limit=1000000` biến phân trang thành vô nghĩa."
    ],
    quiz: [
      {
        q: "Vì sao `OFFSET 500000` chậm trên PostgreSQL?",
        options: ["Vì câu query thiếu mệnh đề LIMIT đi kèm", "Vì database vẫn phải duyệt qua 500000 dòng bị bỏ", "Vì PostgreSQL chặn offset lớn hơn 100000", "Vì OFFSET luôn buộc sắp xếp lại cả bảng"],
        answer: 1,
        explain: "Offset phải đếm qua các dòng bị bỏ. Keyset pagination dùng điều kiện WHERE để nhảy thẳng tới vị trí."
      },
      {
        q: "Vì sao cursor thường kết hợp `created_at` với `id`?",
        options: ["Để cursor khó đoán, tránh client tự ghép", "Để thứ tự là duy nhất khi created_at bị trùng", "Vì PostgreSQL chỉ tạo index được trên cột id", "Để query dùng được OFFSET song song với cursor"],
        answer: 1,
        explain: "Cột sắp xếp phải phân biệt tuyệt đối từng dòng; id phá hoà khi timestamp trùng."
      },
      {
        q: "Trường hợp nào offset pagination vẫn phù hợp?",
        options: ["Feed mạng xã hội có hàng triệu bài viết", "Bảng quản trị nhỏ cần nhảy tới trang bất kỳ", "API công khai trả danh sách rất lớn", "Danh sách infinite scroll trên app mobile"],
        answer: 1,
        explain: "Với dữ liệu nhỏ, nhược điểm của offset không đáng kể, còn tính năng nhảy trang hữu ích."
      }
    ]
  },
  "p03.m2.t3": {
    sections: [
      {
        h: "API là lời hứa với client",
        p: [
          "Khi app mobile đã phát hành, bạn không thể buộc mọi người cập nhật ngay. Đổi tên field `name` thành `title`, đổi kiểu `price` từ số sang chuỗi, hay xoá endpoint là breaking change: client cũ hỏng ngay lập tức. Mục tiêu là tiến hoá API mà không phá client đang chạy.",
          "Thay đổi tương thích ngược (an toàn): thêm endpoint mới, thêm field mới vào response, thêm tham số tuỳ chọn. Thay đổi phá vỡ: xoá hoặc đổi tên field, đổi kiểu dữ liệu, thêm tham số bắt buộc, đổi ý nghĩa status code, siết validate chặt hơn."
        ]
      },
      {
        h: "Cách đánh version",
        list: [
          "URL: `/v1/projects`, `/v2/projects`. Rõ ràng, dễ test bằng trình duyệt, dễ định tuyến và cache. Phổ biến nhất.",
          "Header: `Accept: application/vnd.myapp.v2+json` hoặc header tuỳ chỉnh. URL sạch hơn nhưng khó debug hơn.",
          "Query: `?version=2`. Ít dùng cho API chính thức."
        ],
        p: [
          "Chỉ tăng major version khi thật sự có breaking change không tránh được. Phần lớn thay đổi nên được thiết kế theo cách thêm vào, để v1 sống được lâu."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `import { VersioningType } from '@nestjs/common';

app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
// => route có dạng /v1/...

// src/projects/projects.controller.ts
@Controller({ path: 'projects', version: '1' })
export class ProjectsV1Controller {
  @Get(':id') findOne(@Param('id') id: string) { /* trả { id, name } */ }
}

@Controller({ path: 'projects', version: '2' })
export class ProjectsV2Controller {
  @Get(':id') findOne(@Param('id') id: string) { /* trả { id, title, owner } */ }
}`
        }
      },
      {
        h: "Deprecation policy",
        p: [
          "Khi cần ngừng một version, hãy có quy trình công khai: thông báo trước (ví dụ 6 tháng), đánh dấu trong tài liệu OpenAPI (`deprecated: true`), trả header cảnh báo trong response, theo dõi xem còn client nào gọi version cũ (log theo version và client id), liên hệ trực tiếp những client lớn, rồi mới tắt.",
          "Header `Sunset` (RFC 8594) cho biết thời điểm endpoint dự kiến ngừng hoạt động; header `Deprecation` (RFC 9745) cho biết endpoint đã bị đánh dấu lỗi thời. Kèm header `Link` trỏ tới tài liệu hướng dẫn chuyển đổi."
        ],
        code: {
          lang: "text",
          file: "HTTP response",
          src: `HTTP/1.1 200 OK
Deprecation: @1767225600
Sunset: Wed, 30 Jun 2027 00:00:00 GMT
Link: <https://docs.example.com/migrate-v2>; rel="deprecation"`
        }
      },
      {
        h: "Nguyên tắc cho client và server",
        p: [
          "Phía client nên bỏ qua field lạ trong response (tolerant reader), để server thêm field không làm client hỏng. Phía server nên chấp nhận đầu vào cũ lâu nhất có thể. Kiểm thử hợp đồng (contract test) dựa trên spec OpenAPI giúp phát hiện breaking change ngay trong CI trước khi merge."
        ]
      }
    ],
    summary: [
      "Thêm là an toàn; xoá, đổi tên, đổi kiểu là breaking change.",
      "URL versioning (/v1) phổ biến và dễ dùng nhất.",
      "NestJS hỗ trợ enableVersioning và version trên controller.",
      "Deprecation cần thông báo, header Deprecation/Sunset, theo dõi usage rồi mới tắt.",
      "Client nên bỏ qua field lạ; contract test bắt breaking change trong CI."
    ],
    pitfalls: [
      "Đổi tên field trong v1 \"cho đẹp\": app mobile cũ hỏng. Thêm field mới, giữ field cũ cho tới khi deprecate.",
      "Tạo v2 cho mỗi thay đổi nhỏ: phải bảo trì quá nhiều version song song.",
      "Tắt version cũ mà không đo xem còn ai dùng."
    ],
    quiz: [
      {
        q: "Thay đổi nào là tương thích ngược?",
        options: ["Đổi tên field name thành title", "Thêm một field mới vào response", "Đổi price từ number sang string", "Thêm một tham số query bắt buộc"],
        answer: 1,
        explain: "Client tuân thủ tolerant reader bỏ qua field mới. Các thay đổi còn lại làm client cũ hỏng."
      },
      {
        q: "Header nào cho biết thời điểm endpoint dự kiến ngừng hoạt động?",
        options: ["Retry-After", "Sunset", "Cache-Control", "ETag"],
        answer: 1,
        explain: "Sunset (RFC 8594) báo thời điểm resource sẽ không còn phục vụ."
      },
      {
        q: "Ưu điểm chính của URL versioning so với header versioning?",
        options: ["URL ngắn và gọn hơn", "Dễ thấy, dễ gọi bằng curl và dễ định tuyến", "Ẩn được version khỏi người dùng", "Không cần cập nhật tài liệu OpenAPI"],
        answer: 1,
        explain: "Version nằm ngay trong URL nên dễ thấy, dễ gọi bằng trình duyệt/curl và dễ cấu hình ở gateway."
      }
    ]
  },
  "p03.m2.t4": {
    sections: [
      {
        h: "Idempotent là gì và vì sao quan trọng",
        p: [
          "Một thao tác idempotent cho cùng kết quả trạng thái dù thực hiện một hay nhiều lần. Mạng không đáng tin: client gửi request thanh toán, server xử lý xong nhưng response bị mất vì timeout. Client không biết đã thành công hay chưa, nên retry. Nếu endpoint không idempotent, khách hàng bị trừ tiền hai lần.",
          "Theo HTTP, GET, PUT, DELETE là idempotent theo ngữ nghĩa: `PUT /tasks/1 { title: 'A' }` gọi 3 lần vẫn cho kết quả title là A; `DELETE /tasks/1` lần hai có thể trả 404 nhưng trạng thái vẫn là \"đã xoá\". POST và PATCH mặc định không idempotent: mỗi `POST /payments` tạo một giao dịch mới."
        ]
      },
      {
        h: "Idempotency-Key cho POST",
        p: [
          "Giải pháp phổ biến (Stripe và nhiều API thanh toán dùng) là header `Idempotency-Key`: client sinh một UUID cho mỗi thao tác nghiệp vụ và gửi lại đúng key đó khi retry. IETF đang chuẩn hoá header này trong bản nháp `draft-ietf-httpapi-idempotency-key-header`; tới thời điểm viết bài nó vẫn là Internet-Draft, chưa thành RFC, nên chi tiết có thể còn đổi. Server lưu key cùng kết quả xử lý lần đầu:"
        ],
        list: [
          "Key chưa có: xử lý bình thường, lưu kết quả (status, body) gắn với key.",
          "Key đã có và đã xử lý xong: trả lại đúng kết quả đã lưu, không xử lý lại.",
          "Key đang được xử lý (request đầu chưa xong): trả 409 để client thử lại sau.",
          "Cùng key nhưng body khác: trả lỗi (bản nháp gợi ý 422), vì client dùng sai key.",
          "Endpoint bắt buộc có key mà request thiếu header: trả 400 (theo bản nháp).",
          "Key có thời hạn lưu (ví dụ 24 giờ) để bảng không phình vô hạn."
        ]
      },
      {
        h: "Cài đặt với PostgreSQL",
        p: [
          "Điểm then chốt là chống race condition khi hai request cùng key đến đồng thời. Dùng ràng buộc unique trong database: chỉ một request insert được key, request kia nhận xung đột. Ghi kết quả thanh toán và cập nhật bản ghi key trong cùng transaction để không có trạng thái nửa vời."
        ],
        code: {
          lang: "typescript",
          file: "src/payments/payments.service.ts",
          src: `// Bảng: idempotency_keys(key text primary key, request_hash text, status_code int, response jsonb, created_at timestamptz)
async createPayment(key: string, dto: CreatePaymentDto) {
  const hash = sha256(JSON.stringify(dto));
  return this.db.transaction(async (tx) => {
    const inserted = await tx.query(
      'INSERT INTO idempotency_keys (key, request_hash) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING RETURNING key',
      [key, hash],
    );
    if (inserted.rowCount === 0) {
      const existing = await tx.query('SELECT * FROM idempotency_keys WHERE key = $1', [key]);
      const row = existing.rows[0];
      if (row.request_hash !== hash) throw new IdempotencyKeyMismatchError();
      if (row.response === null) throw new RequestInProgressError(); // -> 409
      return row.response;                                           // trả lại kết quả cũ
    }
    const payment = await this.charge(tx, dto);
    await tx.query('UPDATE idempotency_keys SET status_code = 201, response = $2 WHERE key = $1', [key, payment]);
    return payment;
  });
}`
        },
        p: [
          "Lưu ý: khi request đầu còn đang chạy trong transaction chưa commit, request thứ hai với cùng key sẽ bị chặn ở lệnh INSERT cho tới khi transaction đầu kết thúc, rồi thấy kết quả đã lưu. Nếu gọi cổng thanh toán bên ngoài mất nhiều giây, nhiều hệ thống tách thành các bước có trạng thái riêng thay vì giữ transaction lâu."
        ]
      },
      {
        h: "Idempotency ở mọi nơi có retry",
        p: [
          "Nguyên tắc này không chỉ cho HTTP. Job BullMQ có thể chạy lại khi worker crash, webhook từ Stripe có thể gửi lặp, message từ queue có thể được giao hơn một lần (at-least-once). Mọi consumer nên xử lý trùng an toàn, ví dụ dựa trên id sự kiện đã xử lý hoặc ràng buộc unique."
        ]
      }
    ],
    summary: [
      "Idempotent: làm nhiều lần cho cùng trạng thái như làm một lần.",
      "GET, PUT, DELETE idempotent theo ngữ nghĩa; POST thì không.",
      "POST quan trọng (thanh toán, tạo đơn) dùng Idempotency-Key do client sinh.",
      "Ràng buộc unique trong DB chống race condition giữa các request trùng key.",
      "Consumer queue, webhook, job cũng phải xử lý trùng an toàn."
    ],
    pitfalls: [
      "Kiểm tra \"key đã tồn tại chưa\" bằng SELECT rồi mới INSERT: hai request đồng thời đều thấy chưa có. Dùng unique constraint.",
      "Server tự sinh idempotency key mỗi request: vô nghĩa, key phải do client sinh và gửi lại khi retry.",
      "Lưu key trong RAM của một instance: request retry tới instance khác sẽ bị xử lý lại."
    ],
    quiz: [
      {
        q: "Method nào mặc định KHÔNG idempotent?",
        options: ["GET", "PUT", "DELETE", "POST"],
        answer: 3,
        explain: "Mỗi POST thường tạo resource mới. GET, PUT, DELETE idempotent theo ngữ nghĩa HTTP."
      },
      {
        q: "Client retry `POST /payments` với cùng Idempotency-Key sau khi request đầu đã thành công. Server nên làm gì?",
        options: ["Tạo thanh toán mới vì đây là request mới", "Trả lại đúng kết quả đã lưu của lần đầu", "Trả 409 vì key đã được dùng", "Huỷ thanh toán cũ rồi xử lý lại từ đầu"],
        answer: 1,
        explain: "Mục đích của key là cho phép retry an toàn: trả lại kết quả cũ, không trừ tiền lần hai."
      },
      {
        q: "Cơ chế nào chống hai request cùng key chạy đồng thời hiệu quả nhất?",
        options: ["SELECT kiểm tra key trước, chưa có mới INSERT", "Ràng buộc unique trên cột key trong database", "Chờ setTimeout ngẫu nhiên trước khi xử lý", "Lưu key đang xử lý trong một Set toàn cục của Node"],
        answer: 1,
        explain: "Database đảm bảo chỉ một insert thành công. Kiểm tra bằng SELECT có race condition; biến toàn cục không dùng chung giữa instance."
      }
    ]
  },
  "p03.m2.t5": {
    sections: [
      {
        h: "OpenAPI là hợp đồng máy đọc được",
        p: [
          "OpenAPI Specification (trước đây gọi là Swagger) mô tả REST API bằng YAML hoặc JSON: các endpoint, tham số, schema request/response, mã lỗi, cách xác thực. Swagger giờ là tên bộ công cụ xung quanh (Swagger UI, Swagger Editor). Phiên bản 3.1 tương thích hoàn toàn với JSON Schema.",
          "Vì máy đọc được, một file spec mở ra nhiều thứ: trang tài liệu tương tác, sinh client SDK và kiểu TypeScript cho frontend, mock server để frontend làm việc trước khi backend xong, và kiểm tra hợp đồng trong CI."
        ]
      },
      {
        h: "Code-first với NestJS",
        p: [
          "Với `@nestjs/swagger`, spec được sinh từ controller và DTO. Plugin CLI của Nest có thể tự đọc kiểu TypeScript và decorator class-validator để giảm việc viết `@ApiProperty` thủ công."
        ],
        code: {
          lang: "typescript",
          file: "src/main.ts",
          src: `import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Task API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // Swagger UI tại /docs, JSON tại /docs-json

  await app.listen(3000);
}
bootstrap();

// DTO
// export class CreateTaskDto {
//   @ApiProperty({ example: 'Viết migration' }) @IsString() title!: string;
// }`
        }
      },
      {
        h: "API-first: thiết kế hợp đồng trước",
        p: [
          "Code-first nhanh nhưng dễ để spec trôi theo code. API-first làm ngược lại: frontend và backend thống nhất file `openapi.yaml` qua review, rồi mỗi bên triển khai song song. Frontend sinh kiểu và dùng mock, backend dùng spec để validate hoặc viết test hợp đồng. Chọn cách nào cũng được, miễn spec là nguồn sự thật được review như code."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Sinh kiểu TypeScript cho frontend từ spec
npx openapi-typescript http://localhost:3000/docs-json -o src/api/schema.d.ts

# Trong CI: lint spec theo quy ước
npx @redocly/cli lint openapi.yaml

# Trong CI: phát hiện breaking change so với spec của nhánh main (công cụ oasdiff)
oasdiff breaking openapi.main.yaml openapi.yaml`
        }
      },
      {
        h: "Đưa vào quy trình",
        list: [
          "Commit file spec vào repo (xuất từ app trong CI nếu dùng code-first) để diff được trong PR.",
          "Lint spec để đảm bảo quy ước đặt tên, mô tả lỗi đầy đủ.",
          "Chạy công cụ so sánh spec (ví dụ oasdiff) để chặn breaking change không chủ ý.",
          "Không public trang /docs ở production nếu API là nội bộ; hoặc bảo vệ bằng xác thực."
        ],
        p: [
          "Khi spec là hợp đồng, câu hỏi \"field này có thể null không?\" được trả lời bằng tài liệu chứ không bằng tin nhắn."
        ]
      }
    ],
    summary: [
      "OpenAPI mô tả API dạng máy đọc được; Swagger là bộ công cụ.",
      "Spec sinh ra docs, client SDK, kiểu TypeScript, mock server.",
      "NestJS code-first với @nestjs/swagger và DocumentBuilder.",
      "API-first: thống nhất spec trước, hai bên làm song song.",
      "Commit, lint và diff spec trong CI để bắt breaking change."
    ],
    pitfalls: [
      "Spec không khai báo response lỗi: frontend không biết xử lý 409 hay 422 thế nào.",
      "Spec sinh tự động nhưng không ai review: tên và mô tả lộn xộn, kiểu sai (thiếu nullable).",
      "Để Swagger UI công khai trên production cho API nội bộ: lộ toàn bộ bề mặt tấn công."
    ],
    quiz: [
      {
        q: "Khác biệt giữa OpenAPI và Swagger hiện nay?",
        options: ["Là hai chuẩn cạnh tranh do hai tổ chức khác nhau duy trì", "OpenAPI là đặc tả; Swagger là tên bộ công cụ xung quanh", "Swagger là bản mới của OpenAPI, hỗ trợ thêm GraphQL", "OpenAPI dùng YAML, còn Swagger chỉ dùng JSON"],
        answer: 1,
        explain: "Swagger Specification được đổi tên thành OpenAPI; tên Swagger được giữ cho các công cụ."
      },
      {
        q: "Lợi ích của API-first với đội FE và BE?",
        options: ["BE không cần viết test vì spec đã mô tả đủ", "Hai bên chốt hợp đồng trước rồi làm song song", "Spec tự validate input nên BE bỏ được DTO", "API chạy nhanh hơn vì được sinh từ spec"],
        answer: 1,
        explain: "Hợp đồng rõ ràng từ đầu giảm phụ thuộc chờ đợi và hiểu nhầm."
      },
      {
        q: "Cách phát hiện breaking change API sớm nhất?",
        options: ["Theo dõi lỗi người dùng báo sau khi release", "So sánh spec OpenAPI với nhánh main trong CI", "Theo dõi tỷ lệ lỗi 4xx trong log production", "Tăng major version ở mỗi lần deploy"],
        answer: 1,
        explain: "Diff spec trong CI chặn thay đổi phá vỡ ngay tại PR."
      }
    ]
  },
  "p03.m2.t6": {
    sections: [
      {
        h: "GraphQL giải quyết vấn đề gì",
        p: [
          "Với REST, màn hình dashboard có thể cần gọi `/me`, `/projects`, rồi `/projects/{id}/tasks` cho từng project (under-fetching, nhiều round-trip), và mỗi response trả nhiều field không dùng (over-fetching). GraphQL cho client gửi một query mô tả chính xác dữ liệu cần, server trả đúng hình dạng đó qua một endpoint duy nhất (thường `POST /graphql`).",
          "Schema là hợp đồng có kiểu chặt: định nghĩa type, field, query (đọc), mutation (ghi) và subscription (realtime). Resolver là hàm lấy dữ liệu cho từng field."
        ],
        code: {
          lang: "text",
          file: "schema.graphql",
          src: `type Project {
  id: ID!
  name: String!
  tasks(first: Int = 20): [Task!]!
}

type Task {
  id: ID!
  title: String!
  assignee: User
}

type User { id: ID!, name: String! }

type Query {
  projects: [Project!]!
}

# Client chỉ lấy những field cần:
# query { projects { name tasks { title assignee { name } } } }`
        }
      },
      {
        h: "Vấn đề N+1 và DataLoader",
        p: [
          "Resolver chạy theo từng field. Query trên lấy 50 task, và resolver `assignee` chạy 50 lần, mỗi lần một câu `SELECT * FROM users WHERE id = ?`. Đó là N+1 query: 1 query danh sách + N query con. Với dữ liệu lồng sâu, số query bùng nổ.",
          "DataLoader gom mọi lời gọi `load(id)` trong cùng một tick của event loop thành một lần gọi hàm batch, rồi chia kết quả trả về đúng thứ tự. 50 lời gọi thành một câu `WHERE id = ANY($1)`. DataLoader cũng cache theo id trong phạm vi một request, vì vậy phải tạo instance mới cho mỗi request để không lộ dữ liệu giữa người dùng."
        ],
        code: {
          lang: "typescript",
          file: "src/graphql/loaders.ts",
          src: `import DataLoader from 'dataloader';

interface User { id: string; name: string }
declare const db: { query(sql: string, params: unknown[]): Promise<{ rows: User[] }> };

// Tạo mới cho MỖI request (đặt trong GraphQL context)
export function createLoaders() {
  return {
    userById: new DataLoader<string, User | null>(async (ids) => {
      const { rows } = await db.query('SELECT id, name FROM users WHERE id = ANY($1)', [ids]);
      const map = new Map(rows.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null); // đúng thứ tự và đúng số lượng
    }),
  };
}

// Resolver field Task.assignee
// assignee: (task, _args, ctx) => task.assigneeId ? ctx.loaders.userById.load(task.assigneeId) : null`
        }
      },
      {
        h: "Khi nào nên và không nên dùng",
        list: [
          "Nên: nhiều client (web, mobile) cần dữ liệu khác nhau từ cùng một domain; màn hình tổng hợp nhiều nguồn; muốn schema có kiểu chặt làm hợp đồng; làm lớp BFF gom nhiều service.",
          "Không nên: API đơn giản CRUD cho một frontend; API công khai cần cache HTTP mạnh (GraphQL qua POST khó cache ở CDN); upload file lớn; đội chưa sẵn sàng xử lý độ phức tạp.",
          "Rủi ro cần kiểm soát: query quá sâu hoặc quá tốn kém (giới hạn độ sâu, độ phức tạp), phân quyền theo từng field, giám sát theo tên operation thay vì theo URL."
        ],
        p: [
          "NestJS hỗ trợ GraphQL qua `@nestjs/graphql` với Apollo hoặc Mercurius, theo hướng code-first (sinh schema từ class TypeScript) hoặc schema-first."
        ]
      }
    ],
    summary: [
      "GraphQL: client chọn chính xác field, một endpoint, schema có kiểu chặt.",
      "Resolver chạy theo field nên dễ gây N+1 query.",
      "DataLoader gom lời gọi trong một tick thành một batch query; tạo mới mỗi request.",
      "Phù hợp nhiều client đa dạng và màn hình tổng hợp; kém hợp với CRUD đơn giản và cache HTTP.",
      "Cần giới hạn độ sâu/độ phức tạp query và phân quyền theo field."
    ],
    pitfalls: [
      "Dùng một DataLoader toàn cục cho mọi request: cache giữ dữ liệu cũ và có thể lộ dữ liệu giữa người dùng.",
      "Hàm batch trả mảng khác thứ tự hoặc khác số lượng so với ids: DataLoader báo lỗi hoặc gán sai dữ liệu.",
      "Không giới hạn độ sâu query: một query lồng nhiều cấp có thể làm quá tải database."
    ],
    quiz: [
      {
        q: "DataLoader giải quyết N+1 bằng cách nào?",
        options: ["Nạp sẵn toàn bộ bảng users vào cache khi khởi động", "Gom các lời gọi load() trong cùng tick thành một batch", "Chạy N query con song song trên nhiều worker thread", "Tự viết lại resolver thành một câu JOIN duy nhất"],
        answer: 1,
        explain: "DataLoader trì hoãn đến cuối tick để gom id, rồi gọi một query cho tất cả."
      },
      {
        q: "Vì sao DataLoader nên được tạo mới cho mỗi request?",
        options: ["Vì instance cũ bị khoá sau khi batch đầu tiên chạy", "Vì cache theo id có thể giữ dữ liệu cũ và lộ giữa người dùng", "Vì DataLoader không chạy được khi là singleton", "Vì GraphQL server từ chối context dùng chung"],
        answer: 1,
        explain: "Cache của DataLoader dành cho phạm vi một request."
      },
      {
        q: "Trường hợp nào GraphQL ít phù hợp nhất?",
        options: ["App web và mobile cần dữ liệu khác nhau", "Dashboard tổng hợp dữ liệu từ nhiều nguồn", "API công khai cần cache mạnh ở CDN", "Lớp BFF gom dữ liệu từ nhiều microservice"],
        answer: 2,
        explain: "GraphQL thường dùng POST một endpoint nên khó tận dụng cache HTTP/CDN như REST GET."
      }
    ]
  },
  "p03.m2.t7": {
    sections: [
      {
        h: "gRPC là gì",
        p: [
          "gRPC là framework RPC do Google phát triển, chạy trên HTTP/2 và dùng Protocol Buffers (Protobuf) làm định dạng dữ liệu. Thay vì nghĩ theo resource và URL như REST, bạn định nghĩa service với các method, rồi gọi từ xa như gọi hàm: `ordersClient.getOrder({ id })`.",
          "Protobuf là định dạng nhị phân có schema. Message nhỏ hơn và parse nhanh hơn JSON; schema trong file `.proto` là nguồn sự thật, từ đó sinh code client và server cho nhiều ngôn ngữ (Go, Java, TypeScript...)."
        ],
        code: {
          lang: "text",
          file: "proto/orders.proto",
          src: `syntax = "proto3";
package orders.v1;

service OrdersService {
  rpc GetOrder (GetOrderRequest) returns (Order);
  rpc WatchOrderStatus (GetOrderRequest) returns (stream OrderStatus); // server streaming
}

message GetOrderRequest { string id = 1; }

message Order {
  string id = 1;
  string customer_id = 2;
  int64 total_cents = 3;
  repeated string item_ids = 4;
}

message OrderStatus { string id = 1; string status = 2; }`
        }
      },
      {
        h: "Schema chặt và tiến hoá an toàn",
        p: [
          "Mỗi field có số thứ tự (field number), và chính số này, không phải tên, được ghi vào dữ liệu nhị phân. Quy tắc tương thích: thêm field mới với số mới là an toàn (client cũ bỏ qua); không bao giờ đổi số hoặc đổi kiểu của field đã dùng; khi xoá field, đánh dấu `reserved` số đó để không ai dùng lại. Nhờ vậy service có thể nâng cấp độc lập."
        ]
      },
      {
        h: "Bốn kiểu gọi và dùng trong NestJS",
        list: [
          "Unary: một request, một response (giống REST).",
          "Server streaming: một request, luồng response (theo dõi trạng thái đơn).",
          "Client streaming: luồng request, một response (upload dữ liệu cảm biến).",
          "Bidirectional streaming: hai chiều cùng lúc (chat, đồng bộ)."
        ],
        code: {
          lang: "typescript",
          file: "src/orders/orders.grpc.controller.ts",
          src: `// main.ts
// app.connectMicroservice<MicroserviceOptions>({
//   transport: Transport.GRPC,
//   options: { package: 'orders.v1', protoPath: join(__dirname, '../proto/orders.proto'), url: '0.0.0.0:50051' },
// });
// await app.startAllMicroservices();

import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class OrdersGrpcController {
  @GrpcMethod('OrdersService', 'GetOrder')
  getOrder(data: { id: string }) {
    return { id: data.id, customerId: 'c1', totalCents: 125000, itemIds: ['i1'] };
  }
}`
        },
        p: [
          "Loader protobuf mặc định chuyển tên field `snake_case` thành `camelCase` trong JavaScript, nên `customer_id` xuất hiện là `customerId`."
        ]
      },
      {
        h: "Khi nào chọn gRPC",
        p: [
          "gRPC phù hợp cho giao tiếp nội bộ service-to-service: nhiều lời gọi, cần độ trễ thấp, nhiều ngôn ngữ, muốn hợp đồng chặt và streaming. Nó kém phù hợp cho API công khai hoặc gọi trực tiếp từ trình duyệt: trình duyệt không hỗ trợ gRPC gốc, cần gRPC-Web qua proxy. Dữ liệu nhị phân cũng khó debug bằng curl; dùng công cụ như `grpcurl`. Mô hình phổ biến: REST hoặc GraphQL ở biên cho client, gRPC giữa các service bên trong."
        ]
      }
    ],
    summary: [
      "gRPC: RPC trên HTTP/2 với Protobuf nhị phân có schema.",
      "File .proto sinh code client/server cho nhiều ngôn ngữ.",
      "Field number là định danh; không đổi số/kiểu, dùng reserved khi xoá.",
      "Hỗ trợ unary và ba kiểu streaming.",
      "Hợp cho nội bộ service-to-service; biên công khai thường dùng REST/GraphQL."
    ],
    pitfalls: [
      "Đổi số field hoặc kiểu field trong .proto đang dùng: dữ liệu bị giải mã sai âm thầm giữa các phiên bản service.",
      "Gọi gRPC trực tiếp từ trình duyệt: không được, cần gRPC-Web và proxy.",
      "Không đặt deadline/timeout cho lời gọi gRPC: một service chậm kéo cả chuỗi gọi bị treo."
    ],
    quiz: [
      {
        q: "gRPC mặc định chạy trên giao thức và định dạng nào?",
        options: ["HTTP/1.1 và JSON", "HTTP/2 và Protocol Buffers", "WebSocket và XML", "UDP và MessagePack"],
        answer: 1,
        explain: "gRPC dùng HTTP/2 (multiplexing, streaming) và Protobuf nhị phân."
      },
      {
        q: "Trong Protobuf, thay đổi nào an toàn với client cũ?",
        options: ["Đổi field number của một field đang dùng", "Đổi kiểu một field từ string sang int64", "Thêm field mới với field number chưa dùng", "Dùng lại field number của field đã xoá"],
        answer: 2,
        explain: "Client cũ bỏ qua field không biết. Đổi số/kiểu hoặc dùng lại số cũ làm giải mã sai."
      },
      {
        q: "Vì sao gRPC ít dùng cho API công khai gọi từ trình duyệt?",
        options: ["Vì Protobuf chậm hơn JSON khi parse", "Vì trình duyệt không gọi được gRPC gốc", "Vì gRPC không có schema cho client", "Vì gRPC không hỗ trợ kết nối TLS"],
        answer: 1,
        explain: "Trình duyệt không cho kiểm soát HTTP/2 framing cần thiết; gRPC-Web là lớp chuyển đổi."
      }
    ]
  },
  "p03.m3.t0": {
    sections: [
      {
        h: "Vì sao cần WebSocket",
        p: [
          "HTTP theo mô hình request-response: client hỏi, server trả lời. Với chat, bảng Kanban cộng tác hay thông báo realtime, server cần chủ động đẩy dữ liệu ngay khi có sự kiện. Polling mỗi vài giây vừa trễ vừa lãng phí.",
          "WebSocket bắt đầu bằng một HTTP request có header `Upgrade: websocket`; server đồng ý với status 101 và từ đó kết nối TCP được giữ mở, hai bên gửi message bất kỳ lúc nào với overhead rất nhỏ. Kết nối là stateful: mỗi client giữ một socket với một instance server cụ thể."
        ]
      },
      {
        h: "Socket.IO trong NestJS",
        p: [
          "Socket.IO là thư viện xây trên WebSocket, bổ sung tự kết nối lại, room (nhóm socket), acknowledgement, và fallback sang HTTP long-polling. Lưu ý Socket.IO có giao thức riêng: client Socket.IO không nói chuyện được với server WebSocket thuần và ngược lại. NestJS hỗ trợ qua `@nestjs/websockets` và `@nestjs/platform-socket.io`."
        ],
        code: {
          lang: "typescript",
          file: "src/board/board.gateway.ts",
          src: `import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/board', cors: { origin: ['https://app.example.com'] } })
export class BoardGateway {
  @WebSocketServer() server!: Server;

  // Xác thực nên làm lúc handshake (middleware/guard), ở đây giản lược
  @SubscribeMessage('join')
  join(@MessageBody() projectId: string, @ConnectedSocket() socket: Socket) {
    socket.join('project:' + projectId);
    return { ok: true }; // acknowledgement gửi lại client
  }

  // Gọi từ service khi task thay đổi
  notifyTaskUpdated(projectId: string, task: { id: string; title: string }) {
    this.server.to('project:' + projectId).emit('task.updated', task);
  }
}`
        }
      },
      {
        h: "Scale nhiều instance bằng Redis adapter",
        p: [
          "Khi chạy 3 replica, user A kết nối instance 1, user B kết nối instance 2. Instance 1 emit vào room chỉ tới được socket của chính nó; user B không nhận gì. Redis adapter giải quyết bằng pub/sub: mỗi lần emit tới room, instance publish lên Redis, các instance khác nhận và gửi tới socket cục bộ của mình."
        ],
        code: {
          lang: "typescript",
          file: "src/redis-io.adapter.ts",
          src: `import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import type { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor!: ReturnType<typeof createAdapter>;

  async connectToRedis(url: string) {
    const pub = createClient({ url });
    const sub = pub.duplicate();
    await Promise.all([pub.connect(), sub.connect()]);
    this.adapterConstructor = createAdapter(pub, sub);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
// main.ts:
// const adapter = new RedisIoAdapter(app); await adapter.connectToRedis(process.env.REDIS_URL!);
// app.useWebSocketAdapter(adapter);`
        }
      },
      {
        h: "Những điều cần lưu ý khi vận hành",
        list: [
          "Nếu cho phép fallback long-polling, load balancer cần sticky session, vì các HTTP request của một phiên phải tới cùng instance. Chỉ dùng transport websocket thì không cần.",
          "Xác thực lúc handshake (token trong `auth` của client), và kiểm tra quyền khi join room.",
          "Mỗi kết nối tốn bộ nhớ; đặt giới hạn kích thước message và theo dõi số kết nối.",
          "Khi deploy, kết nối bị ngắt; client phải tự kết nối lại và đồng bộ lại trạng thái."
        ],
        p: [
          "WebSocket nên là kênh thông báo; nguồn sự thật vẫn là REST API và database. Client nhận `task.updated` rồi cập nhật UI, và khi kết nối lại thì gọi API để lấy trạng thái mới nhất."
        ]
      }
    ],
    summary: [
      "WebSocket giữ kết nối hai chiều sau HTTP Upgrade (101).",
      "Socket.IO thêm room, reconnect, ack, fallback; không tương thích WebSocket thuần.",
      "Nhiều instance cần Redis adapter để emit tới socket ở instance khác.",
      "Long-polling fallback cần sticky session.",
      "Xác thực lúc handshake; WebSocket là kênh thông báo, không phải nguồn sự thật."
    ],
    pitfalls: [
      "Scale lên 2 replica mà không có adapter: một nửa người dùng không nhận được sự kiện.",
      "Không xác thực khi join room: ai biết projectId cũng nghe được dữ liệu.",
      "Dùng client WebSocket thuần để kết nối server Socket.IO: không kết nối được vì khác giao thức."
    ],
    quiz: [
      {
        q: "Vì sao cần Redis adapter khi chạy Socket.IO trên nhiều instance?",
        options: ["Để lưu lại mọi tin nhắn đã gửi trong Redis", "Để emit tới được socket kết nối ở instance khác", "Để mã hoá dữ liệu giữa client và server", "Để giữ kết nối khi instance bị restart"],
        answer: 1,
        explain: "Mỗi instance chỉ biết socket của mình. Redis pub/sub phát sự kiện tới mọi instance."
      },
      {
        q: "Server trả status nào để đồng ý nâng cấp kết nối lên WebSocket?",
        options: ["200 OK", "101 Switching Protocols", "204 No Content", "426 Upgrade Required"],
        answer: 1,
        explain: "101 Switching Protocols xác nhận chuyển từ HTTP sang giao thức WebSocket."
      },
      {
        q: "Khi nào load balancer cần sticky session cho Socket.IO?",
        options: ["Luôn luôn, với mọi transport", "Khi bật transport HTTP long-polling", "Chỉ khi dùng Redis adapter", "Không bao giờ, vì Socket.IO tự xử lý"],
        answer: 1,
        explain: "Long-polling gồm nhiều request HTTP của cùng một phiên, phải đến cùng instance giữ phiên đó."
      }
    ]
  },
  "p03.m3.t1": {
    sections: [
      {
        h: "Luồng một chiều không cần WebSocket",
        p: [
          "Nhiều tính năng realtime thực chất chỉ cần server đẩy dữ liệu xuống: thông báo, tiến độ xử lý file, giá cập nhật, hay stream từng token câu trả lời AI. Server-Sent Events (SSE) làm đúng việc đó trên một HTTP response bình thường có `Content-Type: text/event-stream`, được giữ mở và gửi từng sự kiện dạng text.",
          "Vì là HTTP thường, SSE đi qua proxy, load balancer, dùng cookie/header xác thực như mọi request khác. Trình duyệt có sẵn `EventSource`, tự kết nối lại khi mất mạng và gửi header `Last-Event-ID` để server tiếp tục từ sự kiện cuối."
        ],
        code: {
          lang: "text",
          file: "định dạng luồng SSE",
          src: `id: 42
event: task.updated
data: {"id":"t1","status":"done"}

: dòng bắt đầu bằng dấu hai chấm là comment, dùng làm heartbeat

id: 43
data: {"progress":80}
`
        }
      },
      {
        h: "SSE trong NestJS",
        p: [
          "Decorator `@Sse()` nhận một Observable; mỗi giá trị phát ra thành một sự kiện. Nest đặt header phù hợp và dọn subscription khi client ngắt."
        ],
        code: {
          lang: "typescript",
          file: "src/notifications/notifications.controller.ts",
          src: `import { Controller, MessageEvent, Sse, UseGuards, Req } from '@nestjs/common';
import { Observable, filter, map } from 'rxjs';
import { NotificationBus } from './notification.bus';
import { AuthGuard } from '../auth/auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly bus: NotificationBus) {}

  @Sse('stream')
  @UseGuards(AuthGuard)
  stream(@Req() req: { user: { id: string } }): Observable<MessageEvent> {
    return this.bus.events$.pipe(
      filter((e) => e.userId === req.user.id),
      map((e) => ({ id: e.id, type: e.type, data: e.payload })),
    );
  }
}
// Frontend: const es = new EventSource('/notifications/stream', { withCredentials: true });
// es.addEventListener('task.assigned', (e) => console.log(JSON.parse(e.data)));`
        },
        p: [
          "Khi chạy nhiều instance, `NotificationBus` nên nhận sự kiện từ Redis pub/sub để instance nào giữ kết nối cũng nhận được."
        ]
      },
      {
        h: "Long polling",
        p: [
          "Long polling là kỹ thuật cũ hơn: client gửi request, server giữ request cho đến khi có dữ liệu mới hoặc hết thời gian (ví dụ 30 giây), trả response, và client lập tức gửi request tiếp theo. Nó chạy được ở mọi nơi có HTTP, nhưng mỗi sự kiện tốn một request đầy đủ header, và phải tự xử lý việc không bỏ sót sự kiện giữa hai request. Ngày nay long polling chủ yếu là phương án dự phòng."
        ]
      },
      {
        h: "Chọn giữa SSE, WebSocket, long polling",
        list: [
          "SSE: server → client, dạng text, đơn giản, tự reconnect. Phù hợp thông báo, streaming AI, tiến độ job.",
          "WebSocket: hai chiều, tần suất cao, hỗ trợ nhị phân. Phù hợp chat, cộng tác, game.",
          "Long polling: dự phòng khi môi trường chặn kết nối lâu dài.",
          "Với HTTP/1.1, trình duyệt giới hạn khoảng 6 kết nối mỗi domain, nên mở nhiều tab SSE có thể chạm giới hạn; HTTP/2 multiplex nên không gặp vấn đề này."
        ],
        p: [
          "Proxy như Nginx mặc định buffer response, khiến sự kiện SSE bị giữ lại. Tắt buffering cho endpoint SSE (header `X-Accel-Buffering: no` hoặc `proxy_buffering off`) và gửi heartbeat định kỳ để kết nối không bị cắt vì idle timeout."
        ]
      }
    ],
    summary: [
      "SSE là HTTP response text/event-stream giữ mở, server đẩy sự kiện một chiều.",
      "EventSource tự reconnect và gửi Last-Event-ID.",
      "NestJS: @Sse() trả Observable<MessageEvent>.",
      "Long polling là phương án dự phòng, tốn request cho mỗi sự kiện.",
      "Tắt buffering ở proxy và gửi heartbeat cho SSE."
    ],
    pitfalls: [
      "Đặt SSE sau Nginx với buffering mặc định: client nhận sự kiện theo cục hoặc không nhận.",
      "Không gửi heartbeat: load balancer cắt kết nối sau idle timeout (ví dụ 60 giây).",
      "Chọn WebSocket cho tính năng chỉ cần đẩy thông báo: thêm độ phức tạp không cần thiết."
    ],
    quiz: [
      {
        q: "Content-Type của response SSE là gì?",
        options: ["application/json", "text/event-stream", "application/octet-stream", "multipart/form-data"],
        answer: 1,
        explain: "SSE dùng text/event-stream với các dòng id:, event:, data:."
      },
      {
        q: "Tính năng nào phù hợp nhất với SSE?",
        options: ["Game nhiều người chơi cập nhật liên tục", "Stream từng token câu trả lời AI xuống", "Chat hai chiều với tần suất rất cao", "Client gửi file nhị phân lớn lên server"],
        answer: 1,
        explain: "Đó là luồng một chiều server → client dạng text, đúng thế mạnh của SSE."
      },
      {
        q: "Client SSE mất kết nối rồi kết nối lại. Cơ chế nào giúp server gửi tiếp từ sự kiện còn thiếu?",
        options: ["Cookie session do trình duyệt gửi", "Header Last-Event-ID do EventSource gửi", "Header Retry-After do server trả về", "Header If-None-Match kèm ETag"],
        answer: 1,
        explain: "EventSource gửi id của sự kiện cuối đã nhận để server tiếp tục từ đó."
      }
    ]
  },
  "p03.m3.t2": {
    sections: [
      {
        h: "Vì sao cần background job",
        p: [
          "Một số việc không nên làm trong request: gửi email, tạo PDF, resize ảnh, gọi webhook bên thứ ba, đồng bộ dữ liệu. Chúng chậm, có thể lỗi tạm thời, và người dùng không cần chờ kết quả. Đưa chúng vào queue giúp API trả lời nhanh, và nếu dịch vụ ngoài lỗi thì job được thử lại mà không mất.",
          "BullMQ là thư viện queue cho Node dùng Redis làm nơi lưu job. Producer (API) thêm job vào queue; worker (process riêng) lấy job ra xử lý. Job có vòng đời: waiting → active → completed hoặc failed, cùng các trạng thái delayed khi chờ retry."
        ]
      },
      {
        h: "Producer và worker với @nestjs/bullmq",
        p: [
          "Ví dụ dưới đây: API gọi `ReportsProducer.enqueue()` rồi trả 202 Accepted ngay; `ReportsWorker` chạy trong process worker và tạo báo cáo. Trong production, worker thường là một entrypoint riêng (`dist/worker.js`) dùng chung codebase với API."
        ],
        code: {
          lang: "typescript",
          file: "src/reports/reports.queue.ts",
          src: `import { Injectable, Module } from '@nestjs/common';
import { BullModule, InjectQueue, Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

@Injectable()
export class ReportsProducer {
  constructor(@InjectQueue('reports') private readonly queue: Queue) {}

  enqueue(reportId: string) {
    return this.queue.add('generate', { reportId }, {
      jobId: 'report-' + reportId,        // chống thêm trùng cùng một báo cáo
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }, // 2s, 4s, 8s, ...
      removeOnComplete: { age: 24 * 3600 },
      removeOnFail: { age: 7 * 24 * 3600 },
    });
  }
}

@Processor('reports', { concurrency: 5 })
export class ReportsWorker extends WorkerHost {
  async process(job: Job<{ reportId: string }>) {
    // Idempotent: nếu báo cáo đã tạo xong thì bỏ qua
    await generateReportIfMissing(job.data.reportId);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      // Hết lượt retry: đưa sang dead-letter queue hoặc cảnh báo
      console.error({ jobId: job.id, err: err.message }, 'job moved to DLQ');
    }
  }
}

@Module({
  imports: [
    BullModule.forRoot({ connection: { host: 'redis', port: 6379 } }),
    BullModule.registerQueue({ name: 'reports' }),
  ],
  providers: [ReportsProducer, ReportsWorker],
})
export class ReportsModule {}

declare function generateReportIfMissing(id: string): Promise<void>;`
        }
      },
      {
        h: "Retry, backoff, dead-letter, concurrency",
        p: [
          "Các tuỳ chọn này quyết định job của bạn chịu lỗi tốt đến đâu."
        ],
        list: [
          "Retry với `attempts`: lỗi tạm thời (timeout, 503) thường tự hết sau vài lần thử.",
          "Backoff exponential: giãn khoảng cách giữa các lần thử để không dồn dập vào dịch vụ đang quá tải.",
          "Dead-letter: BullMQ giữ job hết lượt retry trong tập failed; nhiều đội chuyển chúng sang một queue riêng để điều tra và chạy lại thủ công.",
          "Concurrency: số job một worker xử lý đồng thời. Job I/O có thể đặt cao; job CPU nặng nên thấp và scale bằng nhiều worker process.",
          "Lỗi không thể thành công khi retry (dữ liệu sai) nên ném `UnrecoverableError` để dừng retry ngay."
        ]
      },
      {
        h: "Job phải idempotent",
        p: [
          "BullMQ đảm bảo at-least-once, không phải exactly-once: worker có thể crash sau khi gửi email nhưng trước khi đánh dấu job hoàn thành, hoặc job bị coi là stalled và chạy lại. Vì vậy mỗi job phải chạy lại được an toàn: kiểm tra trạng thái trước khi làm (báo cáo đã tồn tại chưa), dùng khoá idempotency khi gọi API thanh toán, ghi kết quả bằng upsert.",
          "Chạy worker trong process/container riêng với API, để job nặng không ảnh hưởng độ trễ request, và scale hai bên độc lập. Đừng quên graceful shutdown bằng `worker.close()`."
        ]
      }
    ],
    summary: [
      "Việc chậm, có thể lỗi, không cần kết quả ngay: đưa vào queue.",
      "BullMQ dùng Redis; producer thêm job, worker xử lý.",
      "attempts + exponential backoff cho lỗi tạm thời; UnrecoverableError cho lỗi vĩnh viễn.",
      "Job hết retry cần được theo dõi như dead-letter.",
      "At-least-once nên job phải idempotent; worker chạy process riêng."
    ],
    pitfalls: [
      "Không đặt `removeOnComplete`/`removeOnFail`: Redis đầy dần vì hàng triệu job cũ.",
      "Job không idempotent: chạy lại gửi hai email hoặc trừ tiền hai lần.",
      "Cấu hình Redis với `maxmemory-policy` evict key: BullMQ có thể mất job. Redis dùng cho BullMQ nên đặt `noeviction`."
    ],
    quiz: [
      {
        q: "Vì sao job BullMQ cần idempotent?",
        options: ["Để BullMQ xử lý job nhanh hơn nhờ bỏ qua kiểm tra", "Vì một job có thể bị xử lý hơn một lần khi retry hay crash", "Vì Redis từ chối lưu job không có jobId cố định", "Để job chiếm ít bộ nhớ Redis hơn khi đang chờ"],
        answer: 1,
        explain: "Hệ thống queue thường chỉ đảm bảo ít nhất một lần; xử lý trùng phải an toàn."
      },
      {
        q: "Exponential backoff giúp gì?",
        options: ["Tăng số job worker chạy song song khi có lỗi", "Giãn dần khoảng cách giữa các lần retry", "Tự xoá job sau một số lần thất bại", "Ưu tiên job mới hơn job đang retry"],
        answer: 1,
        explain: "Ví dụ 2s, 4s, 8s... cho dịch vụ phía sau thời gian hồi phục."
      },
      {
        q: "Job gặp lỗi dữ liệu không hợp lệ, retry cũng không thể thành công. Nên làm gì?",
        options: ["Tăng attempts lên 100 cho chắc", "Ném UnrecoverableError để dừng retry", "Bắt lỗi rồi return như thành công", "Đặt backoff dài hơn để chờ dữ liệu tự đúng"],
        answer: 1,
        explain: "Retry lỗi vĩnh viễn chỉ tốn tài nguyên. Đánh dấu failed ngay để điều tra."
      }
    ]
  },
  "p03.m3.t3": {
    sections: [
      {
        h: "Cron trong ứng dụng",
        p: [
          "Nhiều việc chạy theo lịch: dọn token hết hạn mỗi giờ, gửi báo cáo tổng hợp 8 giờ sáng, đồng bộ tỷ giá mỗi 15 phút. Biểu thức cron gồm 5 trường (phút, giờ, ngày trong tháng, tháng, ngày trong tuần); một số thư viện hỗ trợ thêm trường giây ở đầu. Ví dụ `0 8 * * 1-5` là 8:00 các ngày thứ Hai đến thứ Sáu.",
          "NestJS có `@nestjs/schedule` để khai báo cron ngay trong provider. Luôn nghĩ đến múi giờ: server trong container thường chạy UTC, nên \"8 giờ sáng giờ Việt Nam\" cần khai báo `timeZone` rõ ràng."
        ],
        code: {
          lang: "typescript",
          file: "src/cleanup/cleanup.service.ts",
          src: `import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpiredTokens() {
    this.logger.log('purge expired tokens');
  }

  @Cron('0 8 * * 1-5', { timeZone: 'Asia/Ho_Chi_Minh' })
  async sendDailyDigest() { /* ... */ }
}
// AppModule: imports: [ScheduleModule.forRoot()]`
        }
      },
      {
        h: "Vấn đề khi có nhiều instance",
        p: [
          "`@Cron` chạy trong mỗi process. Scale API lên 3 replica thì báo cáo 8 giờ sáng được gửi 3 lần. Có vài cách giải quyết:"
        ],
        list: [
          "Distributed lock: trước khi chạy, instance cố lấy khoá trong Redis; chỉ instance lấy được mới chạy.",
          "Để queue lo lịch: BullMQ job scheduler lưu lịch trong Redis và chỉ tạo một job cho mỗi lần đến hạn, worker nào rảnh sẽ xử lý.",
          "Tách ra ngoài: Kubernetes CronJob hoặc EventBridge Scheduler chạy một container riêng theo lịch.",
          "Postgres advisory lock (`pg_try_advisory_lock`) nếu job chủ yếu làm việc với database."
        ]
      },
      {
        h: "Distributed lock với Redis",
        code: {
          lang: "typescript",
          file: "src/common/redis-lock.ts",
          src: `import { randomUUID } from 'node:crypto';
import type { RedisClientType } from 'redis';

// Xoá khoá chỉ khi đúng chủ sở hữu (tránh xoá khoá của instance khác)
const RELEASE = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";

export async function withLock(redis: RedisClientType, key: string, ttlMs: number, fn: () => Promise<void>) {
  const token = randomUUID();
  // node-redis v5; tương đương lệnh: SET key token NX PX ttlMs
  const ok = await redis.set(key, token, { condition: 'NX', expiration: { type: 'PX', value: ttlMs } });
  if (ok !== 'OK') return false;            // instance khác đang giữ khoá
  try {
    await fn();
    return true;
  } finally {
    await redis.eval(RELEASE, { keys: [key], arguments: [token] });
  }
}

// @Cron('0 8 * * 1-5', { timeZone: 'Asia/Ho_Chi_Minh' })
// digest() { return withLock(this.redis, 'lock:daily-digest', 10 * 60_000, () => this.send()); }`
        },
        p: [
          "`SET NX PX` đặt khoá chỉ khi chưa tồn tại, kèm thời hạn để khoá tự hết nếu instance crash. TTL phải dài hơn thời gian chạy dự kiến của job; nếu job có thể chạy lâu hơn TTL, cần gia hạn khoá hoặc chọn cách khác."
        ]
      },
      {
        h: "BullMQ job scheduler",
        code: {
          lang: "typescript",
          file: "src/digest/digest.scheduler.ts",
          src: `// Gọi lúc khởi động; upsert nên nhiều instance gọi cũng chỉ có một lịch
await digestQueue.upsertJobScheduler(
  'daily-digest',
  { pattern: '0 8 * * 1-5', tz: 'Asia/Ho_Chi_Minh' },
  { name: 'send-digest', data: {} },
);`
        },
        p: [
          "Cách này tận dụng retry, backoff và giám sát sẵn có của queue. Dù dùng cách nào, job định kỳ vẫn nên idempotent, vì một lần chạy có thể bị lặp khi retry."
        ]
      }
    ],
    summary: [
      "Cron 5 trường; khai báo timeZone rõ ràng vì container thường chạy UTC.",
      "@Cron chạy trên mọi instance, gây chạy trùng khi scale.",
      "Giải pháp: Redis lock, BullMQ job scheduler, Kubernetes CronJob, advisory lock.",
      "Lock Redis: SET NX PX với token, giải phóng bằng so sánh token.",
      "Job định kỳ vẫn phải idempotent."
    ],
    pitfalls: [
      "Giải phóng khoá bằng `DEL` không kiểm tra token: có thể xoá khoá mà instance khác vừa lấy sau khi khoá của bạn hết hạn.",
      "Đặt TTL khoá ngắn hơn thời gian job chạy: hai instance cùng chạy.",
      "Quên múi giờ: báo cáo \"8 giờ sáng\" được gửi lúc 15 giờ giờ Việt Nam."
    ],
    quiz: [
      {
        q: "API chạy 3 replica, mỗi replica có `@Cron` gửi báo cáo. Điều gì xảy ra?",
        options: ["Chỉ replica khởi động đầu tiên chạy", "Báo cáo được gửi 3 lần", "NestJS tự bầu một replica để chạy", "Cron tự tắt khi phát hiện trùng"],
        answer: 1,
        explain: "@nestjs/schedule chạy độc lập trong mỗi process, không có điều phối giữa các instance."
      },
      {
        q: "Vì sao khoá Redis cần giá trị token ngẫu nhiên thay vì chỉ `SET key 1`?",
        options: ["Để key chiếm ít bộ nhớ hơn trong Redis", "Để khi giải phóng chỉ xoá khoá mình đang giữ", "Vì SET NX chỉ nhận giá trị dạng chuỗi ngẫu nhiên", "Để khoá tự gia hạn khi job chạy lâu"],
        answer: 1,
        explain: "Nếu khoá của bạn đã hết hạn và instance khác lấy lại, DEL mù sẽ xoá nhầm khoá của họ."
      },
      {
        q: "Tuỳ chọn `NX` trong lệnh `SET` của Redis nghĩa là gì?",
        options: ["Đặt key không bao giờ hết hạn", "Chỉ đặt khi key chưa tồn tại", "Chỉ đặt khi key đã tồn tại", "Xoá key ngay sau lần đọc đầu"],
        answer: 1,
        explain: "NX = Not eXists. Kết hợp PX (thời hạn mili giây) tạo khoá có tự hết hạn."
      }
    ]
  },
  "p03.m3.t4": {
    sections: [
      {
        h: "Upload qua server: multipart/form-data",
        p: [
          "Form upload file gửi request `multipart/form-data`: body chia thành nhiều phần, mỗi phần là một field hoặc một file. Trong NestJS (Express), Multer parse body này qua `FileInterceptor`. Mặc định Multer giữ file trong bộ nhớ (memory storage) nếu bạn không cấu hình nơi lưu, nên giới hạn kích thước là bắt buộc: không có giới hạn, vài request 2GB là đủ làm process OOM.",
          "Đặt giới hạn ở nhiều tầng: `client_max_body_size` ở Nginx/load balancer, `limits.fileSize` của Multer, và validator trong Nest."
        ],
        code: {
          lang: "typescript",
          file: "src/avatars/avatars.controller.ts",
          src: `import { Controller, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('avatars')
export class AvatarsController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024, files: 1 } }))
  upload(
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /^image\\/(png|jpeg|webp)$/ }),
      ],
    }))
    file: Express.Multer.File,
  ) {
    return { size: file.size, type: file.mimetype };
  }
}`
        }
      },
      {
        h: "Kiểm tra MIME đúng cách",
        p: [
          "Header `Content-Type` của từng phần và phần mở rộng file do client gửi, nên giả mạo được: đổi `shell.php` thành `shell.png` là xong. Cách chắc chắn hơn là kiểm tra magic bytes (vài byte đầu file đặc trưng cho từng định dạng, ví dụ PNG bắt đầu bằng `89 50 4E 47`), bằng thư viện như `file-type`. Ở các bản NestJS hiện hành, `FileTypeValidator` mặc định đã xác định MIME từ magic number của nội dung file (cần file nằm trong bộ nhớ như ví dụ trên); với Fastify hay khi stream, nó không đọc được buffer và phải cấu hình `skipMagicNumbersValidation`, lúc đó bạn cần tự kiểm tra ở bước sau. Với ảnh, xử lý lại bằng thư viện ảnh (resize, re-encode) còn loại bỏ được metadata EXIF và nội dung ẩn.",
          "Ngoài ra: không dùng tên file của người dùng làm đường dẫn lưu (nguy cơ path traversal như `../../etc/passwd`), hãy sinh tên mới bằng UUID; phục vụ file người dùng tải lên từ domain riêng hoặc với `Content-Disposition: attachment` để tránh XSS."
        ]
      },
      {
        h: "Upload thẳng lên S3 bằng presigned URL",
        p: [
          "Với file lớn (video, tài liệu), đẩy mọi byte qua API là lãng phí băng thông, CPU và giữ kết nối lâu. Cách tốt hơn: API chỉ cấp một presigned URL, là URL có chữ ký tạm thời cho phép PUT một object cụ thể lên S3 trong vài phút. Trình duyệt upload thẳng lên S3, sau đó báo cho API để ghi nhận."
        ],
        code: {
          lang: "typescript",
          file: "src/uploads/uploads.service.ts",
          src: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const s3 = new S3Client({ region: 'ap-southeast-1' });
const ALLOWED = new Set(['application/pdf', 'image/png', 'image/jpeg']);

export async function createUploadUrl(userId: string, contentType: string) {
  if (!ALLOWED.has(contentType)) throw new Error('Unsupported type');
  const key = 'uploads/' + userId + '/' + randomUUID();
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.UPLOAD_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }, // 5 phút
  );
  return { url, key };
}
// Client: await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
// Rồi gọi POST /v1/documents { key } để API kiểm tra object tồn tại và lưu metadata.`
        }
      },
      {
        h: "Đánh đổi và bước sau upload",
        list: [
          "Presigned PUT không giới hạn được kích thước chắc chắn; nếu cần, dùng presigned POST với điều kiện `content-length-range`, hoặc kiểm tra sau upload.",
          "Sau khi client báo xong, đưa job vào queue để kiểm tra định dạng thật, quét virus, tạo thumbnail.",
          "Bucket để private; tải xuống cũng dùng presigned GET có thời hạn.",
          "Đặt lifecycle rule xoá object upload dở không được xác nhận sau một thời gian."
        ],
        p: [
          "File nhỏ như avatar đi qua server là chấp nhận được và dễ kiểm soát. File lớn hoặc lưu lượng cao nên dùng presigned URL."
        ]
      }
    ],
    summary: [
      "multipart/form-data parse bằng Multer; luôn giới hạn kích thước ở nhiều tầng.",
      "Content-Type và đuôi file giả mạo được; kiểm tra magic bytes.",
      "Sinh tên file mới, không dùng tên người dùng làm đường dẫn.",
      "File lớn: presigned URL để client upload thẳng lên S3.",
      "Sau upload: xác nhận, quét, xử lý qua queue; bucket private."
    ],
    pitfalls: [
      "Không đặt `limits` cho Multer với memory storage: vài request file lớn làm process hết RAM.",
      "Tin `file.mimetype` do client gửi: kẻ tấn công upload file thực thi đội lốt ảnh.",
      "Lưu file vào ổ đĩa container: mất khi Pod bị thay, replica khác không thấy (vi phạm stateless)."
    ],
    quiz: [
      {
        q: "Vì sao không nên chỉ dựa vào Content-Type do client gửi để kiểm tra loại file?",
        options: ["Vì trình duyệt luôn gửi sai Content-Type", "Vì client có thể tự đặt bất kỳ giá trị nào", "Vì Multer không đọc được header của từng phần", "Vì S3 ghi đè Content-Type khi lưu file"],
        answer: 1,
        explain: "Header do client kiểm soát. Kiểm tra magic bytes hoặc xử lý lại file cho kết quả đáng tin hơn."
      },
      {
        q: "Lợi ích chính của presigned URL khi upload file lớn?",
        options: ["S3 tự nén file trước khi lưu", "Byte file đi thẳng lên S3, không qua API", "Client không cần xác thực với API nữa", "S3 tự quét virus cho mọi file tải lên"],
        answer: 1,
        explain: "API chỉ ký URL; băng thông và kết nối dài không đè lên server ứng dụng."
      },
      {
        q: "Lưu file upload với tên gốc `../../app/main.js` gây rủi ro gì?",
        options: ["Không rủi ro, hệ điều hành tự chuẩn hoá tên", "Ghi đè file nằm ngoài thư mục upload", "Chỉ làm tên file dài và khó đọc", "SQL injection khi lưu tên vào database"],
        answer: 1,
        explain: "Tên chứa ../ có thể thoát khỏi thư mục đích. Hãy sinh tên mới bằng UUID."
      }
    ]
  },
  "p03.m3.t5": {
    sections: [
      {
        h: "Không gửi email trong request",
        p: [
          "Gửi email qua SMTP hay API của nhà cung cấp mất từ vài trăm mili giây đến vài giây, và có thể lỗi tạm thời (rate limit, mạng chập chờn). Nếu gửi ngay trong request đăng ký, người dùng phải chờ, và khi SMTP lỗi thì cả request đăng ký thất bại dù tài khoản đã được tạo. Tệ hơn, nếu bạn gửi email trước khi transaction commit và transaction bị rollback, người dùng nhận email xác nhận cho tài khoản không tồn tại.",
          "Cách đúng: request chỉ ghi dữ liệu và đẩy job `send-email` vào queue sau khi commit. Worker gửi email với retry và backoff. API phản hồi nhanh, lỗi email không ảnh hưởng nghiệp vụ chính."
        ]
      },
      {
        h: "SMTP hay API của nhà cung cấp",
        p: [
          "Có hai cách phổ biến để gửi email từ backend, và vài việc bắt buộc dù bạn chọn cách nào."
        ],
        list: [
          "SMTP: chuẩn chung, dùng với mọi nhà cung cấp và với Mailpit khi dev. Nodemailer là thư viện phổ biến.",
          "API HTTP (Amazon SES, SendGrid, Postmark, Resend): thường nhanh hơn, có webhook báo bounce/complaint, dễ theo dõi.",
          "Dù chọn gì, hãy cấu hình SPF, DKIM, DMARC cho domain gửi; thiếu chúng email dễ vào spam hoặc bị từ chối.",
          "Xử lý bounce và complaint: ngừng gửi tới địa chỉ lỗi vĩnh viễn để giữ uy tín domain."
        ],
        code: {
          lang: "typescript",
          file: "src/email/email.worker.ts",
          src: `import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { renderTemplate } from './templates';

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // dev: mailpit, prod: SMTP của SES
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

interface EmailJob { to: string; template: 'welcome' | 'reset-password'; vars: Record<string, string>; messageId: string }

@Processor('email', { concurrency: 10 })
export class EmailWorker extends WorkerHost {
  async process(job: Job<EmailJob>) {
    const { subject, html, text } = await renderTemplate(job.data.template, job.data.vars);
    await transport.sendMail({
      from: 'Task App <no-reply@example.com>',
      to: job.data.to,
      subject, html, text,
      headers: { 'X-Message-Id': job.data.messageId }, // phục vụ truy vết và chống gửi trùng
    });
  }
}`
        }
      },
      {
        h: "Template và nội dung",
        p: [
          "Tách nội dung email khỏi code bằng template (Handlebars, MJML, React Email). Luôn có cả phiên bản HTML và text thuần. Escape dữ liệu người dùng khi đưa vào HTML. Với link đặt lại mật khẩu, token phải ngẫu nhiên, dùng một lần, có hạn ngắn, và chỉ lưu hash của token trong DB.",
          "Để tránh gửi trùng khi job retry, ghi lại việc đã gửi theo `messageId` (ví dụ bảng `email_log` với unique key), hoặc chấp nhận rủi ro nhỏ với email không quan trọng."
        ]
      },
      {
        h: "Mở rộng thành hệ thống thông báo",
        p: [
          "Khi có nhiều kênh (email, push, SMS, in-app), hãy tạo một service thông báo nhận sự kiện nghiệp vụ như `task.assigned`, tra cài đặt của người dùng (kênh nào bật, giờ im lặng), rồi đẩy job cho từng kênh. Nghiệp vụ chỉ phát sự kiện, không cần biết chi tiết từng kênh. Để đảm bảo sự kiện không bị mất khi ghi DB thành công nhưng đẩy queue thất bại, có thể dùng outbox pattern: ghi sự kiện vào bảng outbox trong cùng transaction, rồi một tiến trình đẩy sang queue."
        ]
      }
    ],
    summary: [
      "Không gửi email trong request; đẩy job vào queue sau khi commit.",
      "Worker gửi với retry/backoff; lỗi email không làm hỏng nghiệp vụ.",
      "SMTP với Nodemailer hoặc API nhà cung cấp; cấu hình SPF, DKIM, DMARC.",
      "Template tách khỏi code, có bản HTML và text, escape dữ liệu.",
      "Nhiều kênh: service thông báo nhận sự kiện; outbox chống mất sự kiện."
    ],
    pitfalls: [
      "Đẩy job email trước khi transaction commit: rollback xong vẫn gửi email.",
      "Không cấu hình SPF/DKIM: email vào spam, người dùng không nhận được link xác nhận.",
      "Đưa trực tiếp tên người dùng vào HTML không escape: có thể chèn nội dung độc hại vào email."
    ],
    quiz: [
      {
        q: "Vì sao nên gửi email qua queue thay vì trong request?",
        options: ["Vì queue giúp email hiển thị đúng trên mọi client", "Vì request trả lời nhanh và email được retry khi lỗi", "Vì gửi qua queue không tốn phí nhà cung cấp", "Vì thư viện SMTP chỉ chạy được trong worker"],
        answer: 1,
        explain: "Tách việc chậm và dễ lỗi ra khỏi request giúp API ổn định và email không bị mất."
      },
      {
        q: "Thời điểm đúng để đẩy job gửi email xác nhận đăng ký?",
        options: ["Trước khi bắt đầu transaction tạo user", "Ngay sau lệnh INSERT, trong transaction", "Sau khi transaction tạo user đã commit", "Khi user đăng nhập lần đầu tiên"],
        answer: 2,
        explain: "Gửi trước commit có thể gửi email cho dữ liệu bị rollback. Muốn chắc chắn không mất job khi đẩy queue lỗi sau commit, dùng outbox pattern."
      },
      {
        q: "SPF, DKIM, DMARC dùng để làm gì?",
        options: ["Mã hoá nội dung email trên đường truyền", "Xác thực email thật sự đến từ domain gửi", "Giới hạn dung lượng file đính kèm", "Tăng tốc kết nối tới máy chủ SMTP"],
        answer: 1,
        explain: "Các bản ghi DNS này cho máy chủ nhận kiểm tra email có thực sự đến từ domain của bạn."
      }
    ]
  },

  "p03.m2.t8": {
    "sections": [
      {
        "h": "Vì sao backend vẫn phải biết SOAP",
        "p": [
          "SOAP là giao thức trao đổi thông điệp XML có từ đầu những năm 2000. Dự án mới hiếm khi chọn SOAP, nhưng rất nhiều hệ thống lõi ngân hàng, cổng thanh toán, bảo hiểm, hải quan và dịch vụ công vẫn cung cấp API dạng SOAP. Khi tích hợp với các đối tác này ở Việt Nam, bạn gần như chắc chắn sẽ gặp nó.",
          "Khác REST, SOAP có hợp đồng chặt chẽ mô tả bằng file WSDL: danh sách operation, kiểu dữ liệu đầu vào và đầu ra, địa chỉ endpoint. Mọi thông điệp đều nằm trong một Envelope gồm Header (tuỳ chọn, thường chứa thông tin bảo mật như WS-Security) và Body. Lỗi được trả về dưới dạng phần tử Fault trong Body."
        ],
        "code": {
          "lang": "text",
          "file": "SOAP 1.1 request",
          "src": "POST /PaymentService HTTP/1.1\nContent-Type: text/xml; charset=utf-8\nSOAPAction: \"http://bank.example.com/GetBalance\"\n\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\n  <soap:Header/>\n  <soap:Body>\n    <GetBalance xmlns=\"http://bank.example.com/\">\n      <AccountNo>0123456789</AccountNo>\n    </GetBalance>\n  </soap:Body>\n</soap:Envelope>"
        }
      },
      {
        "h": "Gọi dịch vụ SOAP từ Node.js",
        "p": [
          "Thư viện `soap` trên npm đọc WSDL và sinh sẵn các hàm tương ứng với từng operation. Hàm `createClientAsync(url)` trả về client; mỗi operation có phiên bản `<TênOperation>Async` trả về Promise, và kết quả là một mảng mà phần tử đầu là dữ liệu đã chuyển từ XML sang object.",
          "SOAP 1.1 dùng Content-Type `text/xml` kèm header `SOAPAction`, còn SOAP 1.2 dùng `application/soap+xml`. Thư viện tự xử lý chi tiết này dựa trên WSDL."
        ],
        "code": {
          "lang": "typescript",
          "file": "src/bank/bank-soap.client.ts",
          "src": "import * as soap from 'soap';\n\nexport async function getBalance(accountNo: string): Promise<number> {\n  const client = await soap.createClientAsync(process.env.BANK_WSDL_URL!, {\n    wsdl_options: { timeout: 5000 },\n  });\n  try {\n    const [result] = await client.GetBalanceAsync({ AccountNo: accountNo });\n    return Number(result.Balance);\n  } catch (err: any) {\n    // SOAP Fault: đọc mã lỗi của đối tác để map sang lỗi nghiệp vụ của mình\n    const fault = err?.root?.Envelope?.Body?.Fault;\n    throw new Error(`Bank SOAP fault: ${fault?.faultstring ?? err.message}`);\n  }\n}"
        }
      },
      {
        "h": "Bọc hệ thống cũ bằng Anti-Corruption Layer",
        "p": [
          "Đừng để kiểu dữ liệu và tên gọi của hệ thống cũ lan khắp code của bạn. Hãy tạo một lớp adapter duy nhất, gọi là Anti-Corruption Layer, chuyển dữ liệu SOAP thành model trong domain của bạn và chuyển SOAP Fault thành lỗi nghiệp vụ rõ ràng.",
          "Hệ thống của đối tác thường chậm và kém ổn định hơn hệ thống của bạn. Hãy luôn đặt timeout, retry có giới hạn cho thao tác đọc, dùng circuit breaker, ghi log request và response (đã che thông tin nhạy cảm), và cache WSDL thay vì tải lại mỗi request."
        ]
      }
    ],
    "summary": [
      "SOAP vẫn phổ biến ở ngân hàng, thanh toán và dịch vụ công",
      "WSDL mô tả hợp đồng; thông điệp là XML Envelope gồm Header và Body",
      "Lỗi trả về dạng SOAP Fault, cần map sang lỗi nghiệp vụ",
      "Bọc hệ thống cũ bằng một Anti-Corruption Layer duy nhất",
      "Luôn đặt timeout, retry có giới hạn và circuit breaker khi gọi đối tác"
    ],
    "pitfalls": [
      "Tạo SOAP client mới cho mỗi request, tải lại WSDL nên rất chậm",
      "Để object sinh từ WSDL đi thẳng vào controller và database, khiến code phụ thuộc chặt vào đối tác",
      "Retry thao tác ghi như chuyển tiền mà không có mã giao dịch duy nhất, gây giao dịch trùng"
    ],
    "quiz": [
      {
        "q": "Trong SOAP, file WSDL dùng để làm gì?",
        "options": [
          "Mô tả các operation, kiểu dữ liệu và endpoint của dịch vụ",
          "Lưu khoá bí mật dùng để ký thông điệp XML",
          "Nén thông điệp XML trước khi gửi qua mạng",
          "Ghi log mọi request gửi tới dịch vụ SOAP"
        ],
        "answer": 0,
        "explain": "WSDL là hợp đồng mô tả dịch vụ. Thư viện đọc WSDL để sinh hàm gọi tương ứng với từng operation."
      },
      {
        "q": "Dịch vụ SOAP trả về lỗi nghiệp vụ. Lỗi đó nằm ở đâu?",
        "options": [
          "Trong header HTTP tên X-SOAP-Error",
          "Trong phần tử Fault bên trong Body",
          "Trong phần tử Header của Envelope",
          "Trong query string của URL phản hồi"
        ],
        "answer": 1,
        "explain": "SOAP trả lỗi bằng phần tử Fault đặt trong Body của Envelope, chứa mã lỗi và mô tả lỗi."
      },
      {
        "q": "Vì sao nên có một Anti-Corruption Layer khi tích hợp hệ thống cũ?",
        "options": [
          "Để tăng tốc độ phân tích XML",
          "Để không cần đặt timeout khi gọi đối tác",
          "Để model và lỗi của hệ thống cũ không lan vào domain của bạn",
          "Để chuyển SOAP thành GraphQL tự động"
        ],
        "answer": 2,
        "explain": "Anti-Corruption Layer là lớp adapter chuyển dữ liệu và lỗi của hệ thống cũ sang ngôn ngữ domain của bạn, giữ phần còn lại của code độc lập với đối tác."
      }
    ]
  },
  "p03.m0.t6": {
    sections: [
      {
        h: "CPU profile và flame graph",
        p: [
          "Khi API chậm hoặc CPU lên 100%, đừng đoán rồi sửa. Hãy đo. Node có sẵn công cụ chẩn đoán, không cần cài gì thêm. Cờ `--cpu-prof` bật CPU profiler của V8 lúc khởi động và ghi file `.cpuprofile` khi process thoát. Mặc định file nằm ở thư mục hiện tại với tên dạng `CPU.<ngày>.<giờ>.<pid>...cpuprofile`; đổi thư mục bằng `--cpu-prof-dir`.",
          "Quy trình thực tế: chạy app với cờ này, bắn tải vào endpoint nghi ngờ, rồi cho process thoát bình thường. Mở file trong Chrome DevTools (tab Performance, kéo thả file vào) hoặc speedscope để xem flame graph. Trục ngang là tổng thời gian CPU của hàm, không phải thứ tự thời gian; khối càng rộng càng tốn CPU. Tìm khối rộng nằm trong code của bạn, ví dụ `JSON.stringify` một object khổng lồ, regex phức tạp hay vòng lặp tính toán chặn event loop."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `npm run build
node --cpu-prof --cpu-prof-dir=./profiles dist/main.js

# Terminal khác: bắn tải 20 giây vào endpoint nghi ngờ
npx autocannon -c 50 -d 20 http://localhost:3000/reports

# Dừng app để profile được ghi ra ./profiles/*.cpuprofile
# Để chắc chắn, app nên bắt SIGINT/SIGTERM rồi gọi process.exit()`
        }
      },
      {
        h: "Heap snapshot để tìm memory leak",
        p: [
          "Dấu hiệu memory leak: bộ nhớ tăng dần qua nhiều giờ, không giảm sau GC, cuối cùng container bị OOM kill. Heap snapshot chụp lại toàn bộ object trong heap cùng quan hệ ai đang giữ ai.",
          "Chạy app với `--heapsnapshot-signal=SIGUSR2`, sau đó gửi `kill -USR2 <pid>` để Node ghi file `.heapsnapshot` (không dùng SIGUSR1 vì Node dành nó để bật inspector). Chụp ba lần: sau khi khởi động, sau một đợt tải, sau đợt tải thứ hai. Mở trong tab Memory của Chrome DevTools, chọn chế độ Comparison để xem loại object nào tăng mãi, rồi xem mục Retainers để biết cái gì giữ chúng. Thủ phạm hay gặp: `Map` dùng làm cache không giới hạn, listener đăng ký theo từng request mà không gỡ, closure giữ request cũ.",
          "Nếu leak chỉ lộ ra lúc sắp hết bộ nhớ, dùng `--heapsnapshot-near-heap-limit=1` để Node tự ghi snapshot khi heap gần chạm giới hạn."
        ]
      },
      {
        h: "Đo event loop delay",
        p: [
          "Event loop delay là thời gian callback phải chờ vì luồng chính đang bận. Chỉ số này tăng là mọi request đều chậm theo, kể cả health check. `perf_hooks.monitorEventLoopDelay()` trả về histogram với đơn vị nano giây, `resolution` mặc định 10 ms. Histogram được cập nhật bằng timer nên giá trị lúc rảnh xấp xỉ bằng `resolution`; hãy theo dõi phần vượt lên trên mức đó và xu hướng của p99, rồi đẩy vào hệ thống metrics để cảnh báo."
        ],
        code: {
          lang: "typescript",
          file: "src/observability/event-loop.ts",
          src: `import { monitorEventLoopDelay } from 'node:perf_hooks';

const RESOLUTION_MS = 20;
const histogram = monitorEventLoopDelay({ resolution: RESOLUTION_MS });
histogram.enable();

const toMs = (ns: number) => Number((ns / 1e6).toFixed(1));

setInterval(() => {
  console.log(JSON.stringify({
    metric: 'event_loop_delay_ms',
    p50: toMs(histogram.percentile(50)),
    p99: toMs(histogram.percentile(99)),
    max: toMs(histogram.max),
  }));
  histogram.reset(); // mỗi chu kỳ đo lại từ đầu
}, 10_000).unref(); // không giữ process sống chỉ vì timer này`
        }
      },
      {
        h: "AsyncLocalStorage cho request context",
        p: [
          "Khi đọc log production, bạn cần biết dòng log nào thuộc request nào. Truyền `requestId` qua mọi hàm thì rất phiền. `AsyncLocalStorage` (module `node:async_hooks`, đã stable) giữ một store đi theo chuỗi thao tác bất đồng bộ: mọi `await`, timer, callback tạo ra bên trong `run()` đều đọc được cùng store bằng `getStore()`. Ngoài `run()` thì `getStore()` trả về `undefined`, ví dụ trong cron job hay lúc khởi động."
        ],
        code: {
          lang: "typescript",
          file: "src/common/request-context.ts",
          src: `import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

type RequestContext = { requestId: string; userId?: string };
export const requestContext = new AsyncLocalStorage<RequestContext>();

// main.ts: app.use(requestContextMiddleware);
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id') ?? randomUUID();
  res.setHeader('x-request-id', requestId);
  requestContext.run({ requestId }, () => next());
}

export function log(message: string, extra: Record<string, unknown> = {}) {
  const ctx = requestContext.getStore(); // undefined nếu ở ngoài request
  console.log(JSON.stringify({ time: new Date().toISOString(), requestId: ctx?.requestId, message, ...extra }));
}`
        }
      }
    ],
    summary: [
      "Đo trước khi tối ưu: --cpu-prof ghi file .cpuprofile, xem bằng flame graph để tìm hàm tốn CPU",
      "Trong flame graph, khối càng rộng càng tốn CPU; trục ngang không phải dòng thời gian",
      "Heap snapshot chụp nhiều lần rồi so sánh bằng Comparison và Retainers để tìm memory leak",
      "monitorEventLoopDelay đo độ trễ event loop theo nano giây; theo dõi p99 để phát hiện code chặn luồng chính",
      "AsyncLocalStorage mang requestId qua mọi await mà không cần truyền tham số thủ công"
    ],
    pitfalls: [
      "Chụp heap snapshot trên production mà không tính trước: thao tác đồng bộ, chặn event loop và cần bộ nhớ khoảng gấp đôi heap, có thể làm container bị OOM kill",
      "Để `--cpu-prof` bật thường trực trên production hoặc kill process bằng SIGKILL rồi thắc mắc vì sao không có file profile",
      "Dùng `enterWith()` thay cho `run()` khiến context rò sang code chạy sau trong cùng luồng; `enterWith` vẫn đang experimental"
    ],
    quiz: [
      {
        q: "Trong flame graph tạo từ file `.cpuprofile`, độ rộng của một khối thể hiện điều gì?",
        options: [
          "Thứ tự thời điểm hàm được gọi",
          "Lượng bộ nhớ mà hàm đã cấp phát",
          "Tổng thời gian CPU dành cho hàm đó",
          "Số dòng code bên trong hàm đó"
        ],
        answer: 2,
        explain: "Flame graph gộp các stack giống nhau, độ rộng tỉ lệ với thời gian CPU. Trục ngang không phải dòng thời gian, và CPU profile không đo bộ nhớ cấp phát."
      },
      {
        q: "Vì sao nên dùng `--heapsnapshot-signal=SIGUSR2` thay vì SIGUSR1?",
        options: [
          "SIGUSR1 đã được Node dùng để bật inspector",
          "SIGUSR1 không tồn tại trên hệ điều hành Linux",
          "SIGUSR2 tạo ra file snapshot nhỏ hơn nhiều",
          "SIGUSR2 là tín hiệu mặc định Docker gửi đi"
        ],
        answer: 0,
        explain: "Node dành SIGUSR1 để kích hoạt inspector cho debugger. SIGUSR2 còn trống nên dùng cho heap snapshot; kích thước file không phụ thuộc vào tín hiệu."
      },
      {
        q: "`requestContext.getStore()` trả về gì khi được gọi trong một cron job chạy ngoài mọi `run()`?",
        options: [
          "Store của request gần nhất vừa xử lý",
          "Một object rỗng được tạo tự động",
          "Ném lỗi vì chưa khởi tạo context",
          "Giá trị `undefined` vì không có context"
        ],
        answer: 3,
        explain: "Ngoài ngữ cảnh do `run()` hoặc `enterWith()` tạo ra, `getStore()` trả về `undefined`. Vì vậy code log phải xử lý trường hợp không có requestId."
      }
    ]
  }
});
