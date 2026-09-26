/* Nội dung bài học chương p01 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p01.m0.t0": {
    sections: [
      {
        h: "Primitive và reference: giá trị nằm ở đâu",
        p: [
          "JavaScript có 7 kiểu primitive: `string`, `number`, `bigint`, `boolean`, `undefined`, `null` và `symbol`. Mọi thứ còn lại (object, array, function, Date, Map...) đều là object, tức kiểu reference.",
          "Primitive là bất biến và được so sánh theo giá trị. Khi bạn gán `let b = a` với `a` là số, `b` nhận một bản sao độc lập. Với object, biến chỉ giữ một tham chiếu tới vùng nhớ. Gán `const b = a` rồi sửa `b.name` thì `a.name` cũng đổi, vì cả hai cùng trỏ vào một object.",
          "Trong backend, lỗi này hay xuất hiện khi bạn sửa trực tiếp object config dùng chung hoặc object nhận từ cache trong bộ nhớ. Một request vô tình làm hỏng dữ liệu của request khác."
        ],
        code: {
          lang: "typescript", file: "src/reference.ts",
          src: `const defaults = { retries: 3, timeoutMs: 1000 };

const cfgA = defaults;          // cùng tham chiếu
cfgA.retries = 10;
console.log(defaults.retries);  // 10 - defaults bị sửa theo!

const cfgB = { ...defaults, retries: 5 }; // object mới
console.log(defaults.retries);  // vẫn 10

console.log({ a: 1 } === { a: 1 }); // false: khác tham chiếu
console.log("abc" === "abc");       // true: so sánh theo giá trị`
        }
      },
      {
        h: "== và ===, truthy và falsy",
        p: [
          "`===` so sánh cả kiểu và giá trị, không ép kiểu. `==` ép kiểu trước khi so sánh theo một bảng quy tắc khá rối: `'0' == 0` là true, `[] == false` là true, `null == undefined` là true. Quy tắc an toàn: luôn dùng `===`. Ngoại lệ duy nhất hay gặp là `x == null` để bắt cả `null` lẫn `undefined`, nhưng bạn có thể thay bằng `x ?? giá_trị_mặc_định`.",
          "Giá trị falsy gồm: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`. Mọi thứ khác là truthy, kể cả `'0'`, `[]` và `{}`. Đây là nguồn bug kinh điển: `const limit = req.query.limit || 20` sẽ biến limit `0` thành `20`. Hãy dùng `??` vì nó chỉ thay thế khi giá trị là `null` hoặc `undefined`."
        ]
      },
      {
        h: "NaN và số thực dấu phẩy động",
        p: [
          "`number` trong JS là số thực 64-bit theo chuẩn IEEE 754. Số như 0.1 không biểu diễn chính xác được ở hệ nhị phân, nên `0.1 + 0.2` cho ra `0.30000000000000004`. Số nguyên chỉ an toàn tới `Number.MAX_SAFE_INTEGER` (2^53 - 1). Id kiểu `bigint` từ PostgreSQL vượt ngưỡng này nên driver thường trả về dạng string.",
          "`NaN` là kết quả của phép toán không hợp lệ, ví dụ `Number('abc')`. Điểm lạ: `NaN !== NaN`. Hãy kiểm tra bằng `Number.isNaN(x)`, đừng dùng `isNaN` toàn cục vì nó ép kiểu trước."
        ],
        list: [
          "Tiền tệ: lưu theo đơn vị nhỏ nhất (đồng, cent) bằng số nguyên, hoặc dùng kiểu `numeric` ở database và thư viện decimal ở code.",
          "So sánh số thực: dùng sai số, ví dụ `Math.abs(a - b) < Number.EPSILON`.",
          "Số rất lớn: dùng `bigint` (`123n`), nhưng lưu ý `JSON.stringify` không serialize được bigint."
        ],
        code: {
          lang: "typescript", file: "src/money.ts",
          src: `console.log(0.1 + 0.2 === 0.3);           // false
console.log(Number.isNaN(Number("abc")));  // true

// Tính tiền bằng số nguyên (đơn vị: đồng)
const priceVnd = 19_990;
const qty = 3;
const total = priceVnd * qty;              // 59970, chính xác

const opts: { limit?: number } = { limit: 0 };
console.log(opts.limit || 20);             // 20: mất giá trị 0 hợp lệ
console.log(opts.limit ?? 20);             // 0: chỉ thay khi null/undefined`
        }
      }
    ],
    summary: [
      "Primitive so sánh và sao chép theo giá trị; object so sánh và gán theo tham chiếu.",
      "Luôn dùng `===`; dùng `??` thay cho `||` khi 0 hoặc chuỗi rỗng là giá trị hợp lệ.",
      "Số trong JS là IEEE 754: không dùng số thực để tính tiền, cẩn thận với số nguyên vượt 2^53 - 1.",
      "Kiểm tra NaN bằng `Number.isNaN`, vì `NaN !== NaN`."
    ],
    pitfalls: [
      "Dùng `value || default` cho tham số số, làm mất giá trị `0`. Hãy dùng `??`.",
      "Sửa trực tiếp object dùng chung (config, cache) vì tưởng phép gán tạo bản sao. Hãy tạo object mới bằng spread hoặc `structuredClone`.",
      "Parse id `bigint` từ database thành `number`, làm sai lệch các chữ số cuối. Hãy giữ dạng string hoặc dùng `BigInt`."
    ],
    quiz: [
      {
        q: "Biểu thức nào trả về `true`?",
        options: ["`NaN === NaN`", "`[] === []`", "`null == undefined`", "`'0' === 0`"],
        answer: 2,
        explain: "`==` coi `null` và `undefined` là bằng nhau. `NaN` không bằng chính nó, hai mảng rỗng là hai tham chiếu khác nhau, còn `===` không ép kiểu nên `'0'` khác `0`."
      },
      {
        q: "`const page = Number(req.query.page) || 1`. Người dùng gửi `page=0`. Kết quả là gì?",
        options: ["0", "1", "NaN", "Lỗi runtime"],
        answer: 1,
        explain: "`0` là falsy nên `||` trả về vế phải là 1. Nếu 0 là giá trị hợp lệ, bạn cần `??` hoặc kiểm tra tường minh."
      },
      {
        q: "Cách nào phù hợp nhất để lưu giá sản phẩm và tính tổng đơn hàng?",
        options: ["Dùng `number` với phần thập phân rồi làm tròn cuối cùng", "Dùng số nguyên theo đơn vị nhỏ nhất hoặc kiểu decimal", "Lưu dạng string rồi `parseFloat` khi tính", "Dùng `Math.round` sau mỗi phép cộng"],
        answer: 1,
        explain: "Số thực IEEE 754 có sai số với các giá trị như 0.1. Số nguyên theo đơn vị nhỏ nhất hoặc kiểu decimal cho kết quả chính xác. Các cách còn lại vẫn dựa trên số thực nên sai số vẫn tích lũy."
      }
    ]
  },

  "p01.m0.t1": {
    sections: [
      {
        h: "Lexical scope: phạm vi được quyết định khi viết code",
        p: [
          "JavaScript dùng lexical scope. Một biến nhìn thấy được ở đâu phụ thuộc vào vị trí bạn khai báo nó trong mã nguồn, không phụ thuộc vào nơi hàm được gọi. Khi tìm một biến, engine tìm ở scope hiện tại, rồi lần ra các scope bao ngoài cho tới global. Chuỗi này gọi là scope chain.",
          "`var` có phạm vi hàm (function scope). `let` và `const` có phạm vi khối (block scope), tức chỉ sống trong cặp `{}` gần nhất như `if`, `for`. Code hiện đại nên dùng `const` mặc định, `let` khi cần gán lại, và gần như không dùng `var`."
        ]
      },
      {
        h: "Hoisting và Temporal Dead Zone",
        p: [
          "Trước khi chạy một scope, engine đăng ký tất cả khai báo trong đó. Hiện tượng này gọi là hoisting. Khai báo `function` được hoist cả phần thân, nên gọi được trước dòng khai báo. Biến `var` được hoist và khởi tạo bằng `undefined`.",
          "`let`, `const` và `class` cũng được hoist, nhưng không được khởi tạo. Từ đầu scope tới dòng khai báo, biến nằm trong Temporal Dead Zone (TDZ). Truy cập trong vùng này ném `ReferenceError`. TDZ giúp bạn phát hiện lỗi dùng biến trước khi gán, thay vì âm thầm nhận `undefined` như `var`."
        ],
        code: {
          lang: "javascript", file: "src/hoisting.js",
          src: `console.log(greet("An")); // chạy được: function được hoist cả thân
function greet(name) { return "Xin chào " + name; }

console.log(a); // undefined (var)
var a = 1;

try {
  console.log(b); // ReferenceError: đang ở TDZ
} catch (e) { console.log(e.name); }
let b = 2;

for (var i = 0; i < 3; i++) setTimeout(() => console.log("var", i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log("let", j)); // 0 1 2`
        }
      },
      {
        h: "Closure: hàm nhớ môi trường nơi nó được tạo",
        p: [
          "Closure là khi một hàm giữ được tham chiếu tới các biến của scope bao ngoài, kể cả sau khi hàm ngoài đã chạy xong. Engine không giải phóng các biến đó vì vẫn còn hàm bên trong dùng tới.",
          "Closure cho bạn cách đóng gói trạng thái riêng tư mà không cần class. Trong backend, bạn gặp nó ở khắp nơi: middleware factory nhận options rồi trả về hàm xử lý request, rate limiter giữ bộ đếm, hàm `memoize` giữ cache. Vòng lặp `let` in ra 0 1 2 ở ví dụ trên cũng nhờ mỗi vòng lặp tạo một binding mới cho closure bắt lấy."
        ],
        code: {
          lang: "typescript", file: "src/rate-limiter.ts",
          src: `function createCounter(limit: number) {
  let count = 0; // trạng thái riêng, bên ngoài không truy cập được
  return {
    hit(): boolean {
      if (count >= limit) return false;
      count++;
      return true;
    },
    reset() { count = 0; },
  };
}

const limiter = createCounter(2);
console.log(limiter.hit(), limiter.hit(), limiter.hit()); // true true false`
        }
      }
    ],
    summary: [
      "Lexical scope: phạm vi biến do vị trí khai báo trong code quyết định.",
      "`let`/`const` có block scope và TDZ; `var` có function scope và được khởi tạo `undefined`.",
      "Closure giữ tham chiếu tới biến ngoài, dùng để đóng gói trạng thái như bộ đếm, cache, middleware factory.",
      "Mặc định dùng `const`, chỉ dùng `let` khi cần gán lại."
    ],
    pitfalls: [
      "Dùng `var` trong vòng lặp có callback bất đồng bộ, khiến mọi callback thấy cùng một giá trị cuối. Dùng `let`.",
      "Closure vô tình giữ object lớn (ví dụ cả request) trong một cache sống lâu, gây rò rỉ bộ nhớ. Chỉ bắt những giá trị thật sự cần.",
      "Nghĩ rằng `let` không được hoist nên gọi trước khai báo sẽ nhận `undefined`. Thực tế là `ReferenceError` do TDZ."
    ],
    quiz: [
      {
        q: "Đoạn `console.log(x); let x = 5;` cho kết quả gì?",
        options: ["In ra `undefined`", "In ra 5", "Ném ReferenceError", "In ra `null`"],
        answer: 2,
        explain: "`let` được hoist nhưng chưa khởi tạo. Truy cập trước dòng khai báo nằm trong TDZ nên ném ReferenceError. Chỉ `var` mới cho `undefined`."
      },
      {
        q: "Closure là gì?",
        options: ["Hàm được gọi ngay khi khai báo", "Hàm giữ được truy cập tới biến của scope nơi nó được tạo, kể cả khi scope đó đã kết thúc", "Hàm không có tham số", "Cơ chế giải phóng bộ nhớ tự động"],
        answer: 1,
        explain: "Closure là hàm cùng với môi trường lexical nó bắt được. IIFE là hàm gọi ngay, không phải định nghĩa closure. Garbage collector là cơ chế khác."
      },
      {
        q: "Vì sao `for (let i...)` với `setTimeout` in ra 0 1 2 còn `var` in ra 3 3 3?",
        options: ["`let` chạy đồng bộ còn `var` bất đồng bộ", "Mỗi vòng lặp `let` tạo binding mới, còn `var` chỉ có một biến dùng chung cho cả hàm", "`setTimeout` bỏ qua biến `var`", "`var` bị TDZ"],
        answer: 1,
        explain: "Với `let`, mỗi vòng lặp có một biến `i` riêng mà closure bắt lấy. Với `var`, chỉ có một biến ở function scope, khi callback chạy thì vòng lặp đã kết thúc và giá trị là 3."
      }
    ]
  },

  "p01.m0.t2": {
    sections: [
      {
        h: "4 quy tắc binding của this",
        p: [
          "`this` không được quyết định lúc viết hàm mà lúc gọi hàm. Với hàm thường, có 4 quy tắc theo thứ tự ưu tiên từ cao xuống thấp:"
        ],
        list: [
          "new binding: `new Foo()` tạo object mới và gán `this` cho object đó.",
          "Explicit binding: `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)` chỉ định `this` tường minh.",
          "Implicit binding: `obj.method()` thì `this` là `obj`, tức object đứng trước dấu chấm lúc gọi.",
          "Default binding: gọi trơn `fn()` thì `this` là `undefined` trong strict mode (module ES và class luôn strict), hoặc global object nếu không strict."
        ]
      },
      {
        h: "Arrow function và lỗi mất this",
        p: [
          "Arrow function không có `this` riêng. Nó lấy `this` từ scope bao ngoài lúc được tạo (lexical this), và `call`/`bind` không đổi được. Vì vậy arrow function rất hợp làm callback bên trong method.",
          "Lỗi kinh điển: truyền method làm callback, ví dụ `router.get('/', controller.list)`. Khi router gọi hàm, không còn `controller.` đứng trước, nên implicit binding mất và `this` là `undefined`. Cách sửa: `controller.list.bind(controller)`, bọc bằng arrow `(req, res) => controller.list(req, res)`, hoặc khai báo method dạng class field arrow."
        ],
        code: {
          lang: "typescript", file: "src/this-binding.ts",
          src: `class UserController {
  private prefix = "user:";

  list() { return this.prefix + "list"; }
  listArrow = () => this.prefix + "arrow"; // class field arrow: this cố định
}

const c = new UserController();
const detached = c.list;
// detached();                 // TypeError: this là undefined
console.log(detached.call(c)); // "user:list" (explicit binding)
const fn = c.listArrow;
console.log(fn());             // "user:arrow"`
        }
      },
      {
        h: "Prototype chain và class là cú pháp đường",
        p: [
          "Mỗi object có một liên kết ẩn tới object khác gọi là prototype (xem bằng `Object.getPrototypeOf`). Khi truy cập thuộc tính không có trên object, engine tìm tiếp trên prototype, rồi prototype của prototype, cho tới `null`. Đó là prototype chain.",
          "`class` trong JS là cú pháp đường trên cơ chế này. Method khai báo trong class nằm trên `Foo.prototype` và được mọi instance dùng chung, không sao chép vào từng object. `extends` nối prototype của lớp con vào lớp cha. Class vẫn có thêm vài hành vi riêng: bắt buộc gọi bằng `new`, luôn chạy strict mode, có private field `#x` thật sự."
        ],
        code: {
          lang: "javascript", file: "src/prototype.js",
          src: `class Animal { speak() { return "..."; } }
class Dog extends Animal { speak() { return "Gâu"; } }

const d = new Dog();
console.log(Object.getPrototypeOf(d) === Dog.prototype);           // true
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // true
console.log(d.hasOwnProperty("speak")); // false: method nằm trên prototype
console.log(typeof Dog);                // "function"`
        }
      }
    ],
    summary: [
      "`this` được xác định lúc gọi hàm theo 4 quy tắc: new, explicit, implicit, default.",
      "Arrow function dùng `this` của scope bao ngoài và không bị `bind` thay đổi.",
      "Truyền method làm callback sẽ mất `this`; dùng `bind`, arrow wrapper hoặc class field arrow.",
      "Class là cú pháp đường trên prototype; method nằm trên prototype và được chia sẻ."
    ],
    pitfalls: [
      "Truyền `service.method` trực tiếp cho `setTimeout`, `array.map` hoặc router rồi gặp `Cannot read properties of undefined`. Hãy bind hoặc bọc bằng arrow.",
      "Dùng arrow function làm method trên object literal rồi mong `this` là object đó. Arrow lấy `this` từ bên ngoài nên không trỏ tới object.",
      "Sửa prototype của kiểu dựng sẵn như `Array.prototype`. Việc này ảnh hưởng toàn bộ ứng dụng và thư viện, hãy tránh."
    ],
    quiz: [
      {
        q: "Trong ES module, `const f = obj.method; f();` thì `this` bên trong `method` (hàm thường) là gì?",
        options: ["`obj`", "`globalThis`", "`undefined`", "Chính hàm `f`"],
        answer: 2,
        explain: "Gọi trơn là default binding. ES module luôn chạy strict mode nên `this` là `undefined`. Implicit binding chỉ áp dụng khi gọi dạng `obj.method()`."
      },
      {
        q: "Phát biểu nào đúng về arrow function?",
        options: ["Có thể đổi `this` bằng `bind`", "Lấy `this` từ scope bao ngoài lúc được tạo", "Luôn có `this` là global object", "Dùng được với `new`"],
        answer: 1,
        explain: "Arrow function không có `this` riêng mà dùng lexical this. `bind`/`call` không đổi được nó, và arrow function không dùng với `new` được."
      },
      {
        q: "Method khai báo trong class được lưu ở đâu?",
        options: ["Sao chép vào mỗi instance", "Trên `ClassName.prototype`, dùng chung cho mọi instance", "Trong biến global", "Trong closure của constructor"],
        answer: 1,
        explain: "Method thường của class nằm trên prototype nên mọi instance chia sẻ một bản. Chỉ class field (kể cả field arrow) mới được tạo riêng trên từng instance."
      }
    ]
  },

  "p01.m0.t3": {
    sections: [
      {
        h: "Vì sao cần event loop",
        p: [
          "JavaScript chạy code của bạn trên một luồng duy nhất với một call stack. Nếu mọi thao tác I/O (đọc file, gọi database, gọi HTTP) đều chặn luồng này, server chỉ phục vụ được một request tại một thời điểm.",
          "Node.js giải quyết bằng cách giao I/O cho hệ điều hành và thread pool của libuv. Khi I/O xong, callback được xếp vào hàng đợi. Event loop là vòng lặp liên tục kiểm tra: nếu call stack rỗng thì lấy việc tiếp theo trong hàng đợi đưa vào chạy. Nhờ vậy một process Node phục vụ được hàng nghìn kết nối đồng thời, miễn là không có code nào chiếm CPU quá lâu."
        ]
      },
      {
        h: "Microtask và macrotask",
        p: [
          "Có hai loại hàng đợi quan trọng. Macrotask (task) gồm callback của `setTimeout`, `setInterval`, I/O, `setImmediate`. Microtask gồm callback của Promise (`then`, `catch`, `finally`, phần sau `await`) và `queueMicrotask`.",
          "Quy tắc cốt lõi: sau mỗi macrotask, event loop chạy hết toàn bộ microtask queue, kể cả microtask mới sinh ra trong lúc chạy, rồi mới sang macrotask tiếp theo. Riêng Node còn có `process.nextTick`, thường được chạy trước cả Promise microtask (ngoại lệ: khi code đang chạy bên trong một microtask, ví dụ lúc thực thi module ESM, thì hàng đợi Promise được xả trước)."
        ],
        code: {
          lang: "javascript", file: "src/order.cjs",
          src: `console.log("1: sync");

setTimeout(() => console.log("6: timeout"), 0);

Promise.resolve().then(() => console.log("4: promise"));
queueMicrotask(() => console.log("5: microtask"));
process.nextTick(() => console.log("3: nextTick"));

(async () => {
  console.log("2: trong async, trước await");
  await null;
  console.log("5b: sau await");
})();

// Kết quả (CommonJS): 1, 2, 3, 4, 5, 5b, 6
// Lưu ý: chạy dưới dạng ESM (.mjs) thì "3: nextTick" in sau "5b",
// vì module ESM được thực thi bên trong một microtask.`
        }
      },
      {
        h: "Cách dự đoán thứ tự log và bài học cho backend",
        p: [
          "Khi đọc đề, hãy làm ba bước. Bước 1: chạy hết code đồng bộ, lưu ý thân hàm async chạy đồng bộ cho tới `await` đầu tiên. Bước 2: chạy nextTick rồi các microtask theo thứ tự được xếp. Bước 3: mới tới timeout và các macrotask.",
          "Bài học thực tế: code đồng bộ nặng như `JSON.parse` một payload hàng chục MB, vòng lặp tính toán lớn hay hàm `*Sync` sẽ chặn event loop. Trong thời gian đó mọi request khác đều phải chờ, độ trễ p99 tăng vọt. Hãy chia nhỏ công việc, chuyển sang `worker_threads`, hoặc đẩy vào job queue chạy nền."
        ],
        list: [
          "Tránh `fs.readFileSync`, `crypto.pbkdf2Sync` trong handler request.",
          "Vòng đệ quy microtask (Promise tự gọi lại chính nó) có thể làm macrotask và I/O không bao giờ được chạy.",
          "Theo dõi event loop lag bằng `perf_hooks.monitorEventLoopDelay` trong production."
        ]
      }
    ],
    summary: [
      "JS chạy trên một luồng; event loop đưa callback từ hàng đợi vào call stack khi stack rỗng.",
      "Sau mỗi macrotask, toàn bộ microtask (Promise, queueMicrotask) được chạy hết.",
      "Trong Node, `process.nextTick` chạy trước Promise microtask; `setTimeout(fn, 0)` luôn chạy sau chúng.",
      "Code đồng bộ nặng chặn event loop và làm chậm mọi request khác."
    ],
    pitfalls: [
      "Nghĩ `setTimeout(fn, 0)` chạy ngay lập tức. Nó chỉ được xếp vào macrotask queue và chạy sau mọi microtask.",
      "Dùng API `*Sync` hoặc tính toán CPU nặng trong request handler. Dùng bản async, worker_threads hoặc job nền.",
      "Quên rằng phần thân hàm async trước `await` đầu tiên chạy đồng bộ."
    ],
    quiz: [
      {
        q: "Thứ tự in của: `setTimeout(()=>log('A')); Promise.resolve().then(()=>log('B')); log('C');`",
        options: ["A B C", "C A B", "C B A", "B C A"],
        answer: 2,
        explain: "Code đồng bộ chạy trước nên C in đầu tiên. Sau đó là microtask của Promise (B), cuối cùng là macrotask của setTimeout (A)."
      },
      {
        q: "Điều gì xảy ra khi một request handler chạy vòng lặp CPU mất 2 giây?",
        options: ["Chỉ request đó chậm, các request khác không bị ảnh hưởng", "Node tự chuyển vòng lặp sang thread khác", "Mọi request khác trên process đó phải chờ vì event loop bị chặn", "Node tự hủy request sau 1 giây"],
        answer: 2,
        explain: "Code JS của bạn chạy trên một luồng. Khi luồng bận, event loop không lấy được callback nào khác. Node không tự chuyển code sang thread khác, bạn phải dùng worker_threads."
      },
      {
        q: "Microtask queue được xử lý khi nào?",
        options: ["Mỗi 4ms một lần", "Sau khi call stack rỗng, trước khi event loop chuyển sang macrotask tiếp theo", "Chỉ khi không còn macrotask nào", "Song song với macrotask"],
        answer: 1,
        explain: "Mỗi khi call stack rỗng sau một macrotask, event loop xả hết microtask queue rồi mới lấy macrotask tiếp. Không có chu kỳ cố định và không chạy song song."
      }
    ]
  },

  "p01.m0.t4": {
    sections: [
      {
        h: "Promise và async/await hoạt động thế nào",
        p: [
          "Promise là object đại diện cho một kết quả sẽ có trong tương lai. Nó có 3 trạng thái: pending, fulfilled, rejected. Khi đã chuyển sang fulfilled hoặc rejected thì không đổi nữa (settled).",
          "`async/await` là cú pháp trên Promise. Hàm `async` luôn trả về Promise. `await p` tạm dừng hàm hiện tại, trả quyền cho event loop, và tiếp tục khi `p` settled. Nếu `p` rejected, `await` ném lỗi, nên bạn bắt bằng `try/catch` như code đồng bộ. Promise rejected mà không ai bắt sẽ gây `unhandledRejection`, và từ Node 15 mặc định làm process thoát."
        ]
      },
      {
        h: "Bốn hàm tổ hợp: all, allSettled, race, any",
        list: [
          "`Promise.all`: chờ tất cả thành công, trả mảng kết quả theo đúng thứ tự đầu vào. Chỉ cần một cái reject là reject ngay. Dùng khi cần đủ mọi dữ liệu.",
          "`Promise.allSettled`: chờ tất cả settled, không bao giờ reject, trả về `{ status, value | reason }`. Dùng khi gửi thông báo tới nhiều kênh và muốn biết cái nào lỗi.",
          "`Promise.race`: settle theo Promise đầu tiên settled, thành công hay lỗi đều được. Hay dùng để cài timeout.",
          "`Promise.any`: lấy Promise đầu tiên thành công, chỉ reject (với `AggregateError`) khi tất cả đều lỗi. Dùng khi gọi nhiều mirror và lấy cái nhanh nhất."
        ],
        p: [
          "Lưu ý: các hàm này không hủy những Promise còn lại. Promise thua trong `race` vẫn chạy tiếp. Muốn hủy thật sự, bạn cần `AbortController`."
        ]
      },
      {
        h: "Tránh await tuần tự không cần thiết",
        p: [
          "Lỗi hiệu năng phổ biến nhất là `await` lần lượt các thao tác độc lập với nhau. Nếu lấy user mất 50ms và lấy đơn hàng mất 80ms, chạy tuần tự tốn 130ms, chạy song song chỉ khoảng 80ms.",
          "Ngược lại, đừng `Promise.all` cả nghìn truy vấn cùng lúc: bạn sẽ cạn connection pool của database. Với danh sách lớn, hãy xử lý theo lô hoặc giới hạn số tác vụ đồng thời."
        ],
        code: {
          lang: "typescript", file: "src/dashboard.service.ts",
          src: `async function getDashboard(userId: string) {
  // Chậm: chạy lần lượt dù không phụ thuộc nhau
  // const user = await getUser(userId);
  // const orders = await getOrders(userId);

  // Nhanh: khởi chạy cả hai rồi chờ cùng lúc
  const [user, orders] = await Promise.all([getUser(userId), getOrders(userId)]);
  return { user, orders };
}

// Timeout thật sự bằng AbortSignal (Node 18+)
async function fetchWithTimeout(url: string, ms: number) {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

declare function getUser(id: string): Promise<{ id: string }>;
declare function getOrders(id: string): Promise<unknown[]>;`
        }
      }
    ],
    summary: [
      "Promise có 3 trạng thái và chỉ settle một lần; hàm async luôn trả về Promise.",
      "`all` cần tất cả thành công, `allSettled` lấy mọi kết quả, `race` lấy cái settle đầu tiên, `any` lấy cái thành công đầu tiên.",
      "Chạy song song các thao tác độc lập bằng `Promise.all` thay vì await từng cái.",
      "Giới hạn mức song song với danh sách lớn và dùng `AbortController` để hủy thật sự."
    ],
    pitfalls: [
      "Dùng `array.forEach(async ...)` rồi nghĩ code chờ xong. `forEach` không chờ Promise; hãy dùng `for...of` với await hoặc `Promise.all(array.map(...))`.",
      "Quên `await` hoặc `return` Promise trong `try/catch`, khiến lỗi thoát khỏi khối catch và thành unhandled rejection.",
      "Dùng `Promise.race` làm timeout rồi tưởng request đã bị hủy. Request vẫn chạy ngầm; dùng `AbortSignal.timeout`."
    ],
    quiz: [
      {
        q: "Bạn gửi email, SMS và push cùng lúc, muốn biết kênh nào lỗi mà không dừng các kênh khác. Nên dùng gì?",
        options: ["`Promise.all`", "`Promise.allSettled`", "`Promise.race`", "`Promise.any`"],
        answer: 1,
        explain: "`allSettled` chờ tất cả và trả trạng thái từng cái. `all` reject ngay khi có một lỗi, `race` và `any` chỉ quan tâm một kết quả."
      },
      {
        q: "Hai lời gọi `await a(); await b();` mất 100ms và 200ms, không phụ thuộc nhau. Viết lại bằng `Promise.all` thì mất khoảng bao lâu?",
        options: ["300ms", "200ms", "100ms", "50ms"],
        answer: 1,
        explain: "Chạy song song thì thời gian bằng tác vụ lâu nhất, khoảng 200ms. Tuần tự thì cộng dồn thành 300ms."
      },
      {
        q: "Khi `Promise.race([fetchData(), timeout(1000)])` kết thúc do timeout, điều gì xảy ra với `fetchData()`?",
        options: ["Bị hủy tự động", "Vẫn tiếp tục chạy, kết quả bị bỏ qua", "Ném lỗi AbortError", "Được thử lại"],
        answer: 1,
        explain: "Promise không có cơ chế hủy sẵn. `race` chỉ chọn kết quả đầu tiên; tác vụ còn lại vẫn chạy. Muốn hủy, truyền `AbortSignal` vào tác vụ."
      }
    ]
  },

  "p01.m0.t5": {
    sections: [
      {
        h: "CommonJS và ESM khác nhau ở đâu",
        p: [
          "CommonJS (CJS) là hệ module gốc của Node: `require()` và `module.exports`. `require` chạy đồng bộ, được gọi ở bất cứ đâu, và trả về một bản sao giá trị exports tại thời điểm đó.",
          "ES Modules (ESM) là chuẩn chính thức của ngôn ngữ: `import`/`export`. Import được phân tích tĩnh trước khi code chạy, nên công cụ biết chính xác bạn dùng gì. Binding là live: nếu module gốc cập nhật biến export, bên import thấy giá trị mới. ESM hỗ trợ top-level `await` và luôn chạy strict mode."
        ],
        list: [
          "Node coi file là ESM khi có đuôi `.mjs`, hoặc đuôi `.js` và `package.json` có `\"type\": \"module\"`.",
          "Trong ESM không có `__dirname`; dùng `import.meta.dirname` (Node 20.11+) hoặc `import.meta.url`.",
          "Trong ESM, đường dẫn import tương đối phải có đuôi file, ví dụ `./user.js`.",
          "Node hiện đại (22.12+, 24) cho phép `require()` một module ESM đồng bộ, miễn module đó không dùng top-level await."
        ]
      },
      {
        h: "Import động",
        p: [
          "`import()` là một biểu thức trả về Promise, dùng được cả trong CJS lẫn ESM. Nó cho phép nạp module khi thật sự cần, ví dụ chỉ nạp thư viện xuất PDF nặng khi người dùng gọi endpoint xuất báo cáo, giúp khởi động server nhanh hơn. Nó cũng là cách CJS nạp một module ESM có top-level await."
        ],
        code: {
          lang: "typescript", file: "src/report.ts",
          src: `// package.json: { "type": "module" }
import { readFile } from "node:fs/promises";
import { formatDate } from "./utils/date.js"; // ESM cần đuôi file

export async function exportReport(format: "pdf" | "csv") {
  if (format === "pdf") {
    // Chỉ nạp khi cần
    const { renderPdf } = await import("./renderers/pdf.js");
    return renderPdf();
  }
  const template = await readFile(new URL("./tpl.csv", import.meta.url), "utf8");
  return template + formatDate(new Date());
}`
        }
      },
      {
        h: "Tree-shaking",
        p: [
          "Tree-shaking là việc bundler (Vite, esbuild, Rollup, webpack) loại bỏ code được export nhưng không ai import. Nó chỉ hoạt động tốt với ESM vì import/export là tĩnh, bundler biết chắc phần nào không dùng. Với CJS, `require` có thể nằm trong `if` hoặc nhận tên động, nên bundler thường phải giữ lại toàn bộ.",
          "Ở frontend, tree-shaking giảm kích thước bundle trực tiếp. Ở backend, bạn ít bundle hơn, nhưng vẫn có lợi khi build serverless function hoặc CLI. Để tree-shaking hiệu quả: dùng named export, tránh side effect ở cấp module, và khai báo `\"sideEffects\": false` trong package.json của thư viện nếu đúng như vậy."
        ]
      }
    ],
    summary: [
      "CJS dùng `require` đồng bộ, động; ESM dùng `import`/`export` tĩnh, có live binding và top-level await.",
      "Dự án Node mới nên dùng ESM với `\"type\": \"module\"` và import có đuôi file.",
      "`import()` nạp module theo yêu cầu, giảm thời gian khởi động.",
      "Tree-shaking dựa vào tính tĩnh của ESM và việc module không có side effect."
    ],
    pitfalls: [
      "Viết `import x from './x'` thiếu đuôi trong ESM của Node, gặp `ERR_MODULE_NOT_FOUND`. Thêm `.js` (kể cả khi file nguồn là `.ts` và biên dịch bằng tsc).",
      "Dùng `__dirname` trong ESM. Thay bằng `import.meta.dirname`.",
      "Trộn lẫn CJS và ESM trong cùng dự án mà không cấu hình rõ, dẫn đến lỗi `require is not defined` hoặc import default sai."
    ],
    quiz: [
      {
        q: "Vì sao tree-shaking hoạt động tốt với ESM hơn CommonJS?",
        options: ["ESM chạy nhanh hơn", "Import/export của ESM là tĩnh nên bundler phân tích được trước khi chạy", "CommonJS không hỗ trợ export", "ESM tự nén code"],
        answer: 1,
        explain: "Cấu trúc import/export tĩnh cho phép bundler xác định code không dùng. `require` có thể được gọi động nên khó phân tích. Tốc độ chạy và nén không liên quan."
      },
      {
        q: "Node coi file `server.js` là ESM khi nào?",
        options: ["Luôn luôn", "Khi `package.json` gần nhất có `\"type\": \"module\"`", "Khi file có dòng `use strict`", "Khi chạy bằng `node --watch`"],
        answer: 1,
        explain: "Với đuôi `.js`, Node dựa vào trường `type` trong package.json gần nhất. Không có trường này thì mặc định là CommonJS."
      },
      {
        q: "Lợi ích chính của `await import('./heavy.js')` trong một endpoint ít dùng là gì?",
        options: ["Module được nạp khi cần, giảm thời gian khởi động và bộ nhớ ban đầu", "Module chạy trên thread khác", "Tránh được mọi lỗi runtime", "Module được cache vĩnh viễn trên đĩa"],
        answer: 0,
        explain: "Import động trì hoãn việc nạp tới khi thật sự cần. Nó không tạo thread mới và không ngăn lỗi. Module được cache trong bộ nhớ của process, không phải trên đĩa."
      }
    ]
  },

  "p01.m0.t6": {
    sections: [
      {
        h: "Vì sao tránh mutate state",
        p: [
          "Mutate nghĩa là sửa trực tiếp object hoặc mảng đang có, ví dụ `arr.push(x)` hay `user.role = 'admin'`. Vì object được truyền theo tham chiếu, mọi nơi đang giữ tham chiếu đó đều thấy thay đổi, kể cả nơi bạn không ngờ tới.",
          "Code bất biến (immutable) tạo object mới thay vì sửa object cũ. Lợi ích: hàm dễ đoán và dễ test, so sánh thay đổi chỉ cần `===`, tránh bug do chia sẻ state giữa các request. React, Redux và nhiều thư viện dựa hoàn toàn vào quy ước này."
        ]
      },
      {
        h: "map, filter, reduce và các method không mutate",
        p: [
          "`map` biến đổi từng phần tử, `filter` giữ lại phần tử thỏa điều kiện, `reduce` gộp mảng thành một giá trị. Cả ba trả về kết quả mới và không đổi mảng gốc. Kết hợp chúng giúp code xử lý dữ liệu đọc như một chuỗi bước rõ ràng.",
          "Cẩn thận: `sort`, `reverse`, `splice` mutate mảng gốc. Từ ES2023 đã có bản bất biến tương ứng là `toSorted`, `toReversed`, `toSpliced` và `with(index, value)`, dùng được trên Node 20+."
        ],
        code: {
          lang: "typescript", file: "src/orders.ts",
          src: `type Order = { id: string; status: "paid" | "pending"; total: number };

const orders: Order[] = [
  { id: "a", status: "paid", total: 120 },
  { id: "b", status: "pending", total: 80 },
  { id: "c", status: "paid", total: 50 },
];

const paidRevenue = orders
  .filter((o) => o.status === "paid")
  .reduce((sum, o) => sum + o.total, 0);            // 170

const byTotal = orders.toSorted((a, b) => b.total - a.total); // không đổi orders
const updated = orders.map((o) =>
  o.id === "b" ? { ...o, status: "paid" as const } : o,
);
console.log(paidRevenue, byTotal[0].id, orders[1].status); // 170 "a" "pending"`
        }
      },
      {
        h: "Spread là sao chép nông, structuredClone là sao chép sâu",
        p: [
          "Spread `{ ...obj }` và `[...arr]` chỉ sao chép một tầng. Các object lồng bên trong vẫn là tham chiếu chung. Muốn cập nhật object lồng một cách bất biến, bạn phải spread từng tầng bị thay đổi.",
          "`structuredClone(value)` (có sẵn từ Node 17) tạo bản sao sâu, hỗ trợ `Date`, `Map`, `Set` và tham chiếu vòng. Nó không sao chép được function và class instance sẽ mất prototype. Cách cũ `JSON.parse(JSON.stringify(x))` làm mất `Date`, `undefined` và `Map`, nên hãy tránh."
        ],
        code: {
          lang: "typescript", file: "src/clone.ts",
          src: `const state = { user: { name: "An", tags: ["admin"] }, at: new Date() };

const shallow = { ...state };
shallow.user.name = "Bình";
console.log(state.user.name); // "Bình": object lồng bị chia sẻ

const next = { ...state, user: { ...state.user, name: "Chi" } }; // spread từng tầng
const deep = structuredClone(state);
deep.user.tags.push("editor");
console.log(state.user.tags, deep.at instanceof Date); // ["admin"] true`
        }
      }
    ],
    summary: [
      "Mutate object dùng chung gây bug khó tìm; ưu tiên tạo object mới.",
      "`map`, `filter`, `reduce`, `toSorted` không đổi mảng gốc; `sort`, `splice`, `push` thì có.",
      "Spread chỉ sao chép nông; object lồng cần spread từng tầng.",
      "`structuredClone` sao chép sâu và giữ được Date, Map, Set."
    ],
    pitfalls: [
      "Gọi `arr.sort()` trên mảng nhận từ tham số rồi làm thay đổi dữ liệu của hàm gọi. Dùng `toSorted()` hoặc sao chép trước.",
      "Tưởng `{ ...obj }` là deep copy rồi sửa object lồng. Dùng spread từng tầng hoặc `structuredClone`.",
      "Dùng `reduce` cho mọi thứ, tạo code khó đọc. Nếu chỉ cần lọc hoặc biến đổi, `filter`/`map` hoặc vòng `for...of` rõ ràng hơn."
    ],
    quiz: [
      {
        q: "Method nào mutate mảng gốc?",
        options: ["`map`", "`toSorted`", "`sort`", "`filter`"],
        answer: 2,
        explain: "`sort` sắp xếp ngay trên mảng gốc. `map`, `filter` và `toSorted` đều trả về mảng mới."
      },
      {
        q: "Sau `const b = { ...a }`, sửa `b.address.city` thì sao?",
        options: ["Chỉ `b` thay đổi", "`a.address.city` cũng thay đổi vì `address` là tham chiếu chung", "Ném lỗi vì object bị đóng băng", "Không có gì thay đổi"],
        answer: 1,
        explain: "Spread là sao chép nông: thuộc tính `address` của hai object cùng trỏ vào một object. Cần `structuredClone` hoặc spread cả tầng `address`."
      },
      {
        q: "Hạn chế nào của `JSON.parse(JSON.stringify(x))` mà `structuredClone` khắc phục được?",
        options: ["Không sao chép được chuỗi", "Biến `Date` thành string và làm mất `Map`, `Set`", "Không sao chép được số", "Chạy bất đồng bộ"],
        answer: 1,
        explain: "JSON không có kiểu Date, Map, Set nên chúng bị biến đổi hoặc mất. `structuredClone` giữ được các kiểu này. Chuỗi và số thì cả hai cách đều xử lý được."
      }
    ]
  },

  "p01.m1.t0": {
    sections: [
      {
        h: "TypeScript làm gì cho bạn",
        p: [
          "TypeScript là JavaScript cộng với hệ thống kiểu tĩnh. Trình biên dịch kiểm tra kiểu lúc build, rồi xóa hết thông tin kiểu và xuất ra JavaScript thuần. Vì vậy kiểu không tốn chi phí lúc chạy, nhưng cũng không bảo vệ bạn lúc chạy.",
          "Hệ kiểu của TS là structural typing: hai kiểu tương thích nếu có cùng cấu trúc, không cần cùng tên. Một object có đủ `id` và `email` được chấp nhận ở chỗ cần kiểu `User` dù bạn không khai báo nó là `User`."
        ],
        list: [
          "Kiểu cơ bản: `string`, `number`, `boolean`, `bigint`, `null`, `undefined`, mảng `string[]`, tuple `[string, number]`.",
          "`unknown`: giá trị chưa biết kiểu, bắt buộc kiểm tra trước khi dùng. Hãy dùng thay cho `any`.",
          "`any`: tắt kiểm tra kiểu. Mỗi `any` là một lỗ hổng lan truyền trong code.",
          "`never`: kiểu không có giá trị nào, dùng cho hàm luôn ném lỗi và kiểm tra đủ trường hợp."
        ]
      },
      {
        h: "interface và type alias",
        p: [
          "Cả hai đều mô tả được hình dạng object, và trong đa số trường hợp dùng cái nào cũng được. Khác biệt nằm ở khả năng.",
          "`interface` chỉ mô tả object và có declaration merging: khai báo cùng tên hai lần thì được gộp lại. Đây là cách mở rộng kiểu của thư viện, ví dụ thêm `user` vào `Request` của Express. Kế thừa bằng `extends` cho thông báo lỗi rõ và compiler xử lý nhanh.",
          "`type` đặt tên cho mọi loại kiểu: union `'a' | 'b'`, tuple, kiểu hàm, mapped type, conditional type. Những thứ này interface không làm được."
        ],
        code: {
          lang: "typescript", file: "src/types.ts",
          src: `interface User {
  id: string;
  email: string;
  createdAt: Date;
}

interface Admin extends User {
  permissions: string[];
}

type Role = "admin" | "member" | "guest";       // union: chỉ type làm được
type UserDto = Omit<User, "createdAt"> & { role: Role };
type Handler = (userId: string) => Promise<void>;

// Declaration merging: mở rộng kiểu của Express
declare global {
  namespace Express {
    interface Request { user?: User }
  }
}
export {};`
        }
      },
      {
        h: "Quy ước chọn lựa trong dự án",
        p: [
          "Một quy ước đơn giản mà nhiều team dùng: `interface` cho hình dạng object công khai, đặc biệt là thứ có thể được mở rộng (DTO, contract của service). `type` cho union, tuple, kiểu hàm và mọi phép biến đổi kiểu. Quan trọng nhất là thống nhất trong cả codebase, có thể bật rule `consistent-type-definitions` của typescript-eslint.",
          "Với dữ liệu đi vào từ bên ngoài như body request hay biến môi trường, đừng khai báo kiểu rồi ép `as User`. Kiểu đó chỉ là lời hứa với compiler. Hãy nhận vào dạng `unknown` rồi validate, bài Validation lúc runtime sẽ nói kỹ hơn."
        ]
      }
    ],
    summary: [
      "TypeScript kiểm tra kiểu lúc biên dịch; kiểu bị xóa khi chạy.",
      "Structural typing: tương thích theo cấu trúc, không theo tên.",
      "`interface` hợp cho object có thể mở rộng và declaration merging; `type` cho union, tuple, kiểu hàm, mapped/conditional type.",
      "Ưu tiên `unknown` thay cho `any`."
    ],
    pitfalls: [
      "Dùng `any` để hết lỗi nhanh, làm mất kiểm tra ở mọi chỗ giá trị đó đi qua. Dùng `unknown` rồi narrow.",
      "Ép kiểu `req.body as CreateUserDto` và tin rằng dữ liệu đã đúng. `as` không kiểm tra gì lúc chạy.",
      "Vô tình khai báo trùng tên interface trong cùng scope, khiến hai định nghĩa bị gộp và sinh thuộc tính lạ."
    ],
    quiz: [
      {
        q: "Kiểu nào chỉ có thể khai báo bằng `type`, không dùng `interface` được?",
        options: ["Object có thuộc tính `id`", "Union `'draft' | 'published'`", "Object kế thừa object khác", "Object có method"],
        answer: 1,
        explain: "Union là kiểu không phải object nên chỉ `type` biểu diễn được. Ba trường hợp còn lại interface đều làm được."
      },
      {
        q: "Vì sao nên dùng `unknown` thay vì `any` cho dữ liệu chưa rõ kiểu?",
        options: ["`unknown` chạy nhanh hơn", "`unknown` buộc bạn kiểm tra kiểu trước khi dùng, còn `any` tắt kiểm tra", "`unknown` tự validate lúc runtime", "`any` không dùng được trong strict mode"],
        answer: 1,
        explain: "Với `unknown`, compiler không cho gọi method hay truy cập thuộc tính cho tới khi bạn narrow. Cả hai đều không có tác động runtime, và `any` vẫn dùng được trong strict (chỉ implicit any bị cấm)."
      },
      {
        q: "Declaration merging của interface hữu ích nhất khi nào?",
        options: ["Khi cần union type", "Khi mở rộng kiểu của thư viện, ví dụ thêm thuộc tính vào `Express.Request`", "Khi muốn tăng tốc biên dịch", "Khi viết kiểu hàm"],
        answer: 1,
        explain: "Merging cho phép bổ sung thuộc tính vào interface đã khai báo ở nơi khác, như kiểu của thư viện. Nó không liên quan tới union hay kiểu hàm."
      }
    ]
  },

  "p01.m1.t1": {
    sections: [
      {
        h: "Generics: kiểu như một tham số",
        p: [
          "Generic cho phép bạn viết một hàm hay class làm việc với nhiều kiểu mà vẫn giữ thông tin kiểu. Thay vì nhận `any` và mất kiểu, bạn khai báo tham số kiểu `<T>` và để compiler nối kiểu đầu vào với kiểu đầu ra.",
          "Ví dụ `first<T>(arr: T[]): T | undefined`. Gọi với `number[]` thì kết quả là `number | undefined`, gọi với `User[]` thì là `User | undefined`. Một cài đặt, nhiều kiểu, không cần ép kiểu."
        ]
      },
      {
        h: "Suy luận kiểu và ràng buộc extends",
        p: [
          "Thường bạn không cần ghi `first<number>(...)`. Compiler tự suy luận `T` từ đối số truyền vào. Chỉ ghi tường minh khi không có đối số để suy luận, ví dụ `new Map<string, User>()`.",
          "Ràng buộc `T extends X` yêu cầu `T` phải có ít nhất cấu trúc của `X`, nhờ đó bạn dùng được thuộc tính của `X` bên trong hàm. `K extends keyof T` giới hạn `K` là một trong các key của `T`, rất hữu ích khi viết hàm truy cập thuộc tính an toàn."
        ],
        code: {
          lang: "typescript", file: "src/generics.ts",
          src: `function groupBy<T, K extends PropertyKey>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) {
    const k = keyFn(item);
    (out[k] ??= []).push(item);
  }
  return out;
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((i) => i[key]);
}

type Task = { id: number; status: "todo" | "done"; title: string };
const tasks: Task[] = [{ id: 1, status: "todo", title: "Viết test" }];

const byStatus = groupBy(tasks, (t) => t.status); // Record<"todo" | "done", Task[]>
const titles = pluck(tasks, "title");             // string[]
// pluck(tasks, "owner");                         // lỗi: "owner" không phải key của Task`
        }
      },
      {
        h: "Class generic trong backend",
        p: [
          "Mẫu hay gặp nhất là repository hoặc response wrapper generic. Một `Repository<T extends { id: string }>` cài một lần các thao tác `findById`, `save`, `delete` cho mọi entity. Một kiểu `Paginated<T>` mô tả kết quả phân trang cho mọi loại tài nguyên.",
          "Nguyên tắc: generic nên xuất hiện ít nhất hai lần trong chữ ký (liên kết đầu vào với đầu ra). Nếu `T` chỉ xuất hiện một lần, bạn thường không cần generic. Và đừng lồng quá nhiều tham số kiểu, vì code sẽ khó đọc hơn lợi ích nó mang lại."
        ],
        code: {
          lang: "typescript", file: "src/repository.ts",
          src: `interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
}

class InMemoryRepository<T extends { id: string }> {
  private store = new Map<string, T>();
  save(entity: T): T { this.store.set(entity.id, entity); return entity; }
  findById(id: string): T | undefined { return this.store.get(id); }
  list(page = 1, size = 20): Paginated<T> {
    const all = [...this.store.values()];
    return { items: all.slice((page - 1) * size, page * size), total: all.length, page };
  }
}`
        }
      }
    ],
    summary: [
      "Generic là tham số kiểu, giúp một cài đặt dùng cho nhiều kiểu mà vẫn an toàn.",
      "Compiler thường tự suy luận tham số kiểu từ đối số.",
      "`T extends X` ràng buộc cấu trúc; `K extends keyof T` giới hạn key hợp lệ.",
      "Generic hữu ích khi liên kết kiểu đầu vào với đầu ra; nếu `T` chỉ xuất hiện một lần thì thường không cần."
    ],
    pitfalls: [
      "Dùng generic nhưng bên trong lại ép `as any`, làm mất toàn bộ lợi ích. Hãy thêm ràng buộc `extends` phù hợp.",
      "Ghi tường minh tham số kiểu ở mọi lời gọi dù compiler suy luận được, khiến code rườm rà.",
      "Đặt quá nhiều tham số kiểu (`<A, B, C, D>`) cho một hàm; thường là dấu hiệu hàm làm quá nhiều việc."
    ],
    quiz: [
      {
        q: "Với `function pluck<T, K extends keyof T>(items: T[], key: K)`, ràng buộc `K extends keyof T` mang lại gì?",
        options: ["`key` phải là string bất kỳ", "`key` chỉ được là một trong các key của `T`, sai thì báo lỗi lúc biên dịch", "Hàm chạy nhanh hơn", "`key` được validate lúc runtime"],
        answer: 1,
        explain: "`keyof T` là union các key của `T`, nên truyền key không tồn tại sẽ lỗi biên dịch. Kiểu không ảnh hưởng tốc độ và không có kiểm tra runtime."
      },
      {
        q: "Khi nào bạn cần ghi tham số kiểu tường minh như `new Map<string, User>()`?",
        options: ["Luôn luôn", "Khi không có đối số để compiler suy luận kiểu", "Chỉ khi dùng class", "Không bao giờ"],
        answer: 1,
        explain: "`new Map()` không có đối số nên compiler không biết key và value là gì. Khi có đối số, compiler tự suy luận, ghi tường minh là thừa."
      },
      {
        q: "Hàm `function log<T>(x: T): void` có vấn đề gì?",
        options: ["Lỗi cú pháp", "`T` chỉ xuất hiện một lần nên generic không mang lại gì, dùng `unknown` là đủ", "Không gọi được với string", "Bắt buộc phải có `extends`"],
        answer: 1,
        explain: "Generic có ích khi liên kết nhiều vị trí trong chữ ký. Ở đây `T` không liên kết với gì nên `x: unknown` tương đương và đơn giản hơn. Code vẫn hợp lệ và gọi được với mọi kiểu."
      }
    ]
  },

  "p01.m1.t2": {
    sections: [
      {
        h: "Union và narrowing",
        p: [
          "Union `A | B` nghĩa là giá trị thuộc một trong các kiểu. Trước khi dùng thuộc tính riêng của `A`, bạn phải thu hẹp kiểu (narrowing) để compiler biết chắc giá trị đang là `A`.",
          "Compiler phân tích luồng điều khiển (control flow analysis) và tự thu hẹp kiểu sau các phép kiểm tra: `typeof x === 'string'`, `x instanceof Date`, `'email' in x`, `x !== null`, hoặc sau một `return` sớm. Bạn cũng có thể viết type guard riêng dạng `function isUser(x: unknown): x is User`."
        ]
      },
      {
        h: "Discriminated union: mô hình hóa trạng thái",
        p: [
          "Discriminated union là union các object cùng có một thuộc tính literal làm nhãn, thường tên `status`, `type` hoặc `kind`. Kiểm tra nhãn là compiler biết ngay đang ở nhánh nào và những thuộc tính nào tồn tại.",
          "So sánh với cách viết một object có mọi trường optional `{ loading?: boolean; data?: T; error?: string }`. Cách đó cho phép những trạng thái vô lý như vừa có `data` vừa có `error`. Với discriminated union, trạng thái không hợp lệ không biểu diễn được. Đây là ý 'make illegal states unrepresentable'."
        ],
        code: {
          lang: "typescript", file: "src/payment-state.ts",
          src: `type PaymentState =
  | { status: "pending" }
  | { status: "succeeded"; transactionId: string; paidAt: Date }
  | { status: "failed"; reason: string; retryable: boolean };

function describe(p: PaymentState): string {
  switch (p.status) {
    case "pending":
      return "Đang xử lý";
    case "succeeded":
      return "Đã thanh toán: " + p.transactionId; // chỉ nhánh này có transactionId
    case "failed":
      return p.retryable ? "Lỗi, có thể thử lại" : "Lỗi: " + p.reason;
    default: {
      const unreachable: never = p; // thêm trạng thái mới mà quên xử lý sẽ lỗi ở đây
      return unreachable;
    }
  }
}`
        }
      },
      {
        h: "Kiểm tra đủ trường hợp với never",
        p: [
          "Mẹo `const x: never = p` trong nhánh `default` gọi là exhaustiveness check. Nếu sau này bạn thêm trạng thái `refunded` mà quên xử lý trong `switch`, `p` ở nhánh default sẽ có kiểu `{ status: 'refunded' }` chứ không phải `never`, và compiler báo lỗi ngay. Compiler bắt lỗi thay bạn thay vì đợi bug lên production.",
          "Trong backend, discriminated union hợp để mô hình kết quả của một thao tác (`{ ok: true; value } | { ok: false; error }`), các loại event trong hệ thống message, hay trạng thái đơn hàng. Kết hợp với Zod `z.discriminatedUnion` để validate payload webhook có nhiều loại event."
        ]
      }
    ],
    summary: [
      "Union cần narrowing trước khi truy cập thuộc tính riêng; compiler hiểu `typeof`, `instanceof`, `in`, so sánh và return sớm.",
      "Discriminated union dùng một thuộc tính literal làm nhãn để phân biệt các biến thể.",
      "Mô hình trạng thái bằng union giúp trạng thái vô lý không biểu diễn được.",
      "Gán cho `never` ở nhánh default để compiler báo khi thiếu trường hợp."
    ],
    pitfalls: [
      "Dùng một object với nhiều trường optional để biểu diễn trạng thái, dẫn tới kiểm tra `if (data && !error)` khắp nơi. Chuyển sang discriminated union.",
      "Viết type guard `x is User` nhưng chỉ kiểm tra một phần, khiến compiler tin sai. Type guard là lời hứa, hãy kiểm tra đủ hoặc dùng Zod.",
      "Bỏ nhánh `default` với never, nên thêm biến thể mới thì code cũ âm thầm bỏ sót."
    ],
    quiz: [
      {
        q: "Trong `switch (p.status)`, vì sao ở `case 'succeeded'` bạn truy cập được `p.transactionId`?",
        options: ["Vì mọi biến thể đều có `transactionId`", "Vì compiler thu hẹp `p` về biến thể có `status: 'succeeded'`", "Vì TypeScript bỏ qua kiểm tra trong switch", "Vì `transactionId` là optional"],
        answer: 1,
        explain: "Nhãn `status` là literal nên compiler biết trong nhánh này chỉ còn một biến thể, và biến thể đó có `transactionId`. Các biến thể khác không có thuộc tính này."
      },
      {
        q: "Mục đích của `const unreachable: never = p` trong nhánh default là gì?",
        options: ["Tăng tốc runtime", "Báo lỗi biên dịch khi có biến thể chưa được xử lý", "Ném lỗi khi chạy", "Chuyển `p` thành null"],
        answer: 1,
        explain: "Nếu mọi biến thể đã xử lý, `p` ở default có kiểu `never` và phép gán hợp lệ. Còn thiếu biến thể thì phép gán lỗi lúc biên dịch. Bản thân dòng này không ném lỗi runtime."
      },
      {
        q: "Lợi ích chính của discriminated union so với object nhiều trường optional là gì?",
        options: ["Ít dòng code hơn", "Không thể tạo ra trạng thái vô lý như vừa thành công vừa lỗi", "Chạy nhanh hơn", "Không cần kiểm tra kiểu"],
        answer: 1,
        explain: "Mỗi biến thể chỉ có đúng các trường của nó, nên tổ hợp vô lý bị compiler từ chối. Số dòng có thể nhiều hơn và vẫn cần kiểm tra nhãn."
      }
    ]
  },

  "p01.m1.t3": {
    sections: [
      {
        h: "Utility types dựng sẵn",
        p: [
          "TypeScript có sẵn nhiều utility type để biến đổi kiểu từ kiểu có sẵn, thay vì viết lại. Nhờ đó khi entity gốc thay đổi, các kiểu dẫn xuất tự cập nhật theo."
        ],
        list: [
          "`Partial<T>`: mọi thuộc tính thành optional. Hợp cho DTO cập nhật (PATCH).",
          "`Required<T>`, `Readonly<T>`: ngược lại, bắt buộc hoặc chỉ đọc.",
          "`Pick<T, K>` và `Omit<T, K>`: chọn hoặc bỏ một số thuộc tính, ví dụ bỏ `passwordHash` khỏi response.",
          "`Record<K, V>`: object có key kiểu `K`, giá trị kiểu `V`.",
          "`ReturnType<F>`, `Parameters<F>`, `Awaited<T>`: lấy kiểu trả về, kiểu tham số, kiểu sau khi await."
        ]
      },
      {
        h: "keyof, typeof và mapped type",
        p: [
          "`keyof T` cho union các key của `T`. `typeof x` ở vị trí kiểu lấy kiểu của một giá trị. Kết hợp `as const` với `typeof` giúp bạn khai báo dữ liệu một lần rồi suy ra kiểu, ví dụ danh sách role hợp lệ.",
          "Mapped type duyệt qua các key để tạo kiểu mới: `{ [K in keyof T]: ... }`. `Partial` và `Readonly` dựng sẵn chính là mapped type. Có thể thêm hoặc bỏ modifier bằng `?`, `-?`, `readonly`."
        ],
        code: {
          lang: "typescript", file: "src/user.types.ts",
          src: `interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "member";
}

type PublicUser = Omit<User, "passwordHash">;
type UpdateUserDto = Partial<Pick<User, "email" | "role">>;

const ROLES = ["admin", "member", "guest"] as const;
type Role = (typeof ROLES)[number];               // "admin" | "member" | "guest"

type Validators<T> = { [K in keyof T]: (value: T[K]) => boolean };
const userValidators: Partial<Validators<User>> = {
  email: (v) => v.includes("@"),                  // v được suy ra là string
};

async function loadUser(): Promise<User> { throw new Error("demo"); }
type Loaded = Awaited<ReturnType<typeof loadUser>>; // User`
        }
      },
      {
        h: "Conditional type",
        p: [
          "Conditional type có dạng `T extends U ? X : Y`, giống toán tử ba ngôi nhưng cho kiểu. Khi `T` là union, conditional type được phân phối lên từng thành viên. `Exclude<T, U>` dựng sẵn chính là `T extends U ? never : T`.",
          "Từ khóa `infer` cho phép trích một phần kiểu, ví dụ lấy kiểu phần tử của mảng. Conditional type mạnh nhưng dễ khó đọc. Trong code ứng dụng, bạn chủ yếu dùng utility type có sẵn; tự viết conditional type phức tạp thường chỉ cần khi làm thư viện."
        ],
        code: {
          lang: "typescript", file: "src/conditional.ts",
          src: `type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
type A = ElementOf<string[]>;                    // string

type NonNullableFields<T> = { [K in keyof T]-?: NonNullable<T[K]> };
type B = NonNullableFields<{ name?: string | null }>; // { name: string }

type Status = "todo" | "doing" | "done";
type Open = Exclude<Status, "done">;             // "todo" | "doing"`
        }
      }
    ],
    summary: [
      "Utility type như `Partial`, `Pick`, `Omit`, `Record` giúp dẫn xuất kiểu từ kiểu gốc.",
      "`as const` kết hợp `typeof` cho phép khai báo dữ liệu một lần và suy ra kiểu.",
      "Mapped type duyệt key để tạo kiểu mới; conditional type chọn kiểu theo điều kiện và phân phối trên union.",
      "Dẫn xuất kiểu giúp các DTO tự đồng bộ khi entity thay đổi."
    ],
    pitfalls: [
      "Viết tay DTO lặp lại các trường của entity, để rồi hai bên lệch nhau. Dùng `Pick`/`Omit`/`Partial`.",
      "Nghĩ `Omit<User, 'passwordHash'>` sẽ xóa trường đó khỏi object lúc chạy. Kiểu không đổi dữ liệu; bạn vẫn phải tự loại bỏ trước khi trả response.",
      "Lạm dụng conditional type lồng nhiều tầng trong code ứng dụng, khiến thông báo lỗi khó hiểu."
    ],
    quiz: [
      {
        q: "DTO cho endpoint PATCH cho phép cập nhật tùy ý `email` và `name` của `User`. Kiểu nào phù hợp?",
        options: ["`Pick<User, 'email' | 'name'>`", "`Partial<Pick<User, 'email' | 'name'>>`", "`Required<User>`", "`Record<string, User>`"],
        answer: 1,
        explain: "`Pick` chọn hai trường, `Partial` biến chúng thành optional để client gửi một phần. Chỉ `Pick` thì bắt buộc gửi cả hai."
      },
      {
        q: "Với `const ROLES = ['a', 'b'] as const`, `(typeof ROLES)[number]` là kiểu gì?",
        options: ["`string`", "`string[]`", "`'a' | 'b'`", "`number`"],
        answer: 2,
        explain: "`as const` giữ literal và tạo tuple readonly. Truy cập bằng `[number]` cho union các phần tử. Không có `as const` thì kết quả chỉ là `string`."
      },
      {
        q: "`Exclude<'a' | 'b' | 'c', 'a'>` cho kết quả gì?",
        options: ["`'a'`", "`'b' | 'c'`", "`never`", "`'a' | 'b' | 'c'`"],
        answer: 1,
        explain: "Conditional type phân phối trên từng thành viên union: `'a'` thành `never`, `'b'` và `'c'` giữ nguyên. Union với `never` bị bỏ đi."
      }
    ]
  },

  "p01.m1.t4": {
    sections: [
      {
        h: "strict: bật ngay từ ngày đầu",
        p: [
          "`\"strict\": true` là một cờ gộp, bật cùng lúc nhiều kiểm tra: `strictNullChecks` (null và undefined là kiểu riêng, phải xử lý), `noImplicitAny` (cấm tham số không có kiểu bị ngầm hiểu là any), `strictFunctionTypes`, `strictPropertyInitialization`, `useUnknownInCatchVariables` (biến trong `catch` là `unknown`) và một số cờ khác.",
          "Bật strict ở dự án mới gần như không tốn gì. Bật ở dự án cũ thì có thể phát sinh hàng trăm lỗi, nhưng phần lớn là bug tiềm ẩn thật, chủ yếu quanh null và undefined. Hãy bật strict ngay từ đầu."
        ]
      },
      {
        h: "noUncheckedIndexedAccess và các cờ nên bật thêm",
        p: [
          "Mặc định, `arr[0]` có kiểu `T` dù mảng có thể rỗng, và `record[key]` có kiểu giá trị dù key có thể không tồn tại. `noUncheckedIndexedAccess` thêm `| undefined` vào các truy cập theo chỉ số, buộc bạn kiểm tra. Cờ này không nằm trong `strict` nên phải bật riêng.",
          "Các cờ hữu ích khác: `noImplicitOverride` (bắt buộc từ khóa `override`), `exactOptionalPropertyTypes` (phân biệt thuộc tính vắng mặt và thuộc tính bằng `undefined`, khá chặt), `noFallthroughCasesInSwitch`, `verbatimModuleSyntax` (buộc ghi `import type` cho import chỉ dùng kiểu)."
        ],
        code: {
          lang: "json", file: "tsconfig.json",
          src: `{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src"]
}`
        }
      },
      {
        h: "module resolution và paths",
        p: [
          "`module` và `moduleResolution` quyết định TypeScript hiểu import theo cách nào. Với code chạy trực tiếp trên Node, dùng `NodeNext`: TS tuân theo quy tắc ESM/CJS thật của Node, dựa vào trường `type` trong package.json, và yêu cầu đuôi `.js` trong import tương đối của ESM. Với code đi qua bundler (Vite, frontend), dùng `\"moduleResolution\": \"bundler\"`.",
          "`paths` tạo alias như `@/modules/user`. Lưu ý quan trọng: `paths` chỉ ảnh hưởng tới việc kiểm tra kiểu, `tsc` không viết lại đường dẫn trong output. Khi chạy, Node sẽ không tìm thấy `@/...` trừ khi bạn dùng bundler, công cụ như `tsc-alias`, hoặc tính năng `imports` với tiền tố `#` trong package.json mà Node hỗ trợ sẵn."
        ],
        code: {
          lang: "json", file: "package.json",
          src: `{
  "type": "module",
  "imports": {
    "#modules/*": "./dist/modules/*"
  }
}`
        }
      }
    ],
    summary: [
      "`strict: true` gộp nhiều kiểm tra quan trọng, đặc biệt `strictNullChecks` và `noImplicitAny`.",
      "`noUncheckedIndexedAccess` không nằm trong strict nhưng rất đáng bật để bắt lỗi truy cập mảng và record.",
      "Code chạy trên Node dùng `NodeNext`; code qua bundler dùng `bundler`.",
      "`paths` không đổi đường dẫn trong output; cần công cụ hoặc `imports` của package.json khi chạy."
    ],
    pitfalls: [
      "Cấu hình `paths` rồi build ra code lỗi `Cannot find module '@/...'` khi chạy. Dùng subpath imports `#` hoặc công cụ viết lại đường dẫn.",
      "Bật `skipLibCheck` rồi nghĩ code của mình cũng được bỏ qua kiểm tra. Cờ này chỉ bỏ qua file `.d.ts`.",
      "Tắt strict trong dự án cũ cho nhanh rồi không bao giờ bật lại. Hãy bật dần theo từng thư mục hoặc từng cờ."
    ],
    quiz: [
      {
        q: "Với `noUncheckedIndexedAccess`, `const first = users[0]` (users là `User[]`) có kiểu gì?",
        options: ["`User`", "`User | undefined`", "`User[]`", "`any`"],
        answer: 1,
        explain: "Cờ này thêm `undefined` vào truy cập theo chỉ số vì mảng có thể rỗng. Không bật cờ thì kiểu là `User` và lỗi chỉ lộ ra khi chạy."
      },
      {
        q: "Bạn cấu hình `paths: { '@/*': ['src/*'] }` và build bằng `tsc`. Điều gì xảy ra khi chạy `node dist/main.js`?",
        options: ["Chạy bình thường vì tsc viết lại đường dẫn", "Có thể lỗi không tìm thấy module vì tsc không viết lại alias", "tsc báo lỗi biên dịch", "Node tự đọc tsconfig"],
        answer: 1,
        explain: "`paths` chỉ giúp TypeScript kiểm tra kiểu. Output vẫn giữ nguyên `@/...`, và Node không đọc tsconfig nên không hiểu alias này."
      },
      {
        q: "Cờ nào KHÔNG được bật bởi `strict: true`?",
        options: ["`strictNullChecks`", "`noImplicitAny`", "`noUncheckedIndexedAccess`", "`useUnknownInCatchVariables`"],
        answer: 2,
        explain: "`noUncheckedIndexedAccess` phải bật riêng. Ba cờ còn lại đều nằm trong nhóm strict."
      }
    ]
  },

  "p01.m1.t5": {
    sections: [
      {
        h: "Vì sao kiểu TypeScript không đủ",
        p: [
          "Kiểu TypeScript bị xóa khi biên dịch. Lúc chạy, `req.body` chỉ là dữ liệu client gửi lên, có thể thiếu trường, sai kiểu, hoặc chứa trường độc hại. Viết `const dto = req.body as CreateUserDto` chỉ làm compiler im lặng, không kiểm tra gì cả.",
          "Mọi dữ liệu đi qua ranh giới hệ thống cần validate lúc chạy: body, query, params của request, biến môi trường, response của API bên thứ ba, message từ queue, file JSON đọc từ đĩa, và cả output của LLM. Nguyên tắc: 'parse, don't validate', tức biến dữ liệu `unknown` thành dữ liệu có kiểu chắc chắn ngay tại cổng vào, bên trong hệ thống không phải kiểm tra lại."
        ]
      },
      {
        h: "Zod: một schema, cả validate lẫn kiểu",
        p: [
          "Zod cho bạn khai báo schema bằng code. Từ schema, bạn vừa validate được dữ liệu lúc chạy, vừa suy ra được kiểu TypeScript bằng `z.infer`. Không còn cảnh interface và logic validate bị lệch nhau.",
          "`schema.parse(x)` trả dữ liệu đã được kiểm tra hoặc ném `ZodError`. `schema.safeParse(x)` không ném mà trả `{ success, data }` hoặc `{ success, error }`, hợp khi bạn muốn tự trả lỗi 400. Mặc định object schema loại bỏ các key không khai báo, giúp chặn việc client gửi thêm trường như `role: 'admin'`."
        ],
        code: {
          lang: "typescript", file: "src/users/create-user.schema.ts",
          src: `import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(100),
  age: z.coerce.number().int().min(13).optional(), // query string "20" -> 20
});
export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export function parseCreateUser(body: unknown) {
  const result = CreateUserSchema.safeParse(body);
  if (!result.success) {
    return { ok: false as const, issues: z.flattenError(result.error).fieldErrors };
  }
  return { ok: true as const, value: result.data }; // value có kiểu CreateUserDto
}`
        }
      },
      {
        h: "Validate biến môi trường khi khởi động",
        p: [
          "Một ứng dụng đọc `process.env.DATABASE_URL` rải rác khắp nơi sẽ chỉ phát hiện cấu hình sai khi đoạn code đó chạy, có khi là lúc đang phục vụ người dùng. Hãy validate toàn bộ biến môi trường một lần khi khởi động và cho process dừng ngay nếu thiếu (fail fast).",
          "Các lựa chọn khác gồm Valibot (nhỏ gọn hơn), ArkType, hoặc `class-validator` trong hệ sinh thái NestJS. Nguyên lý giống nhau: ranh giới nào cũng có schema."
        ],
        code: {
          lang: "typescript", file: "src/config/env.ts",
          src: `import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
});

export const env = EnvSchema.parse(process.env); // sai cấu hình: dừng ngay khi khởi động`
        }
      }
    ],
    summary: [
      "Kiểu TypeScript bị xóa khi chạy; `as` không kiểm tra dữ liệu.",
      "Validate mọi dữ liệu qua ranh giới hệ thống: request, env, API ngoài, message, output LLM.",
      "Zod dùng một schema cho cả validate runtime và suy ra kiểu bằng `z.infer`.",
      "Validate biến môi trường khi khởi động để fail fast."
    ],
    pitfalls: [
      "Validate xong nhưng vẫn dùng `req.body` gốc thay vì `result.data`, làm mất tác dụng loại bỏ trường thừa và coerce.",
      "Dùng `z.number()` cho query string rồi luôn bị lỗi vì query là chuỗi. Dùng `z.coerce.number()` ở những chỗ này.",
      "Trả nguyên thông báo lỗi nội bộ cho client khi validate response của API bên thứ ba thất bại. Lỗi đó nên được log và trả 502 hoặc 500, không phải 400."
    ],
    quiz: [
      {
        q: "Vì sao `const dto = req.body as CreateUserDto` không an toàn?",
        options: ["`as` làm chậm chương trình", "`as` chỉ thay đổi kiểu với compiler, không kiểm tra dữ liệu lúc chạy", "`as` xóa các trường thừa", "`as` chỉ dùng được với class"],
        answer: 1,
        explain: "Type assertion chỉ là cách bạn nói với compiler 'tin tôi đi'. Dữ liệu thực vẫn có thể sai hoàn toàn. Nó không xóa trường và không ảnh hưởng tốc độ."
      },
      {
        q: "`z.infer<typeof Schema>` dùng để làm gì?",
        options: ["Validate dữ liệu lúc chạy", "Suy ra kiểu TypeScript từ schema để không phải viết interface riêng", "Sinh tài liệu API", "Chuyển schema thành SQL"],
        answer: 1,
        explain: "`z.infer` hoạt động ở mức kiểu, lấy ra kiểu TS tương ứng với schema. Validate lúc chạy là việc của `parse`/`safeParse`."
      },
      {
        q: "Lợi ích của việc validate biến môi trường ngay khi khởi động là gì?",
        options: ["Ứng dụng chạy nhanh hơn", "Cấu hình sai được phát hiện ngay lúc deploy thay vì khi đang phục vụ người dùng", "Không cần file `.env` nữa", "Biến môi trường được mã hóa"],
        answer: 1,
        explain: "Fail fast giúp lỗi lộ ra sớm, thường ngay ở bước deploy hoặc health check. Nó không mã hóa gì và không thay thế nguồn cấu hình."
      }
    ]
  },

  "p01.m2.t0": {
    sections: [
      {
        h: "Big-O đo điều gì",
        p: [
          "Big-O mô tả thời gian chạy hoặc bộ nhớ tăng thế nào khi kích thước đầu vào `n` tăng. Nó bỏ qua hằng số và các số hạng nhỏ, chỉ giữ số hạng tăng nhanh nhất. `3n + 5` là O(n), `n^2 + n` là O(n^2). Big-O không cho biết code chạy bao nhiêu mili giây, nó cho biết code sẽ xử lý tốt hay sụp đổ khi dữ liệu lớn lên.",
          "Các bậc hay gặp, từ nhanh tới chậm: O(1) hằng số, O(log n) như binary search, O(n) duyệt một lượt, O(n log n) sắp xếp tốt, O(n^2) hai vòng lặp lồng nhau, O(2^n) thử mọi tập con. Với n = 1 triệu, O(n log n) khoảng 20 triệu phép tính, còn O(n^2) là 10^12, tức không chạy xong trong thời gian chấp nhận được."
        ]
      },
      {
        h: "Best, worst, average và amortized",
        list: [
          "Worst case: trường hợp xấu nhất, thường là thứ bạn quan tâm khi cam kết độ trễ.",
          "Average case: trung bình trên các đầu vào điển hình. Hash map có tra cứu O(1) trung bình nhưng O(n) trong trường hợp xấu nhất khi mọi key bị đụng độ.",
          "Best case: ít hữu ích, ví dụ tìm tuyến tính gặp ngay phần tử đầu.",
          "Amortized: chi phí trung bình trên một chuỗi thao tác. `array.push` thỉnh thoảng phải cấp phát lại và sao chép toàn bộ mảng (O(n)), nhưng vì dung lượng tăng theo cấp số nhân nên tính gộp mỗi lần push chỉ O(1)."
        ],
        p: [
          "Độ phức tạp bộ nhớ (space complexity) tính phần bộ nhớ thêm mà thuật toán cần. Đệ quy sâu n tầng tốn O(n) bộ nhớ cho call stack, dù bạn không tạo mảng nào."
        ]
      },
      {
        h: "Big-O trong code backend hằng ngày",
        p: [
          "Bạn ít khi tự cài thuật toán sắp xếp, nhưng rất hay vô tình viết O(n^2). Ví dụ điển hình: với mỗi đơn hàng, gọi `users.find()` để tìm người mua. Với 10.000 đơn và 10.000 user, đó là 100 triệu phép so sánh. Dựng một `Map` từ id sang user trước (O(n)) rồi tra cứu O(1) biến tổng chi phí thành O(n).",
          "Nguyên lý tương tự áp dụng cho database: truy vấn không có index là quét toàn bảng O(n), có B-Tree index thì O(log n). Còn lỗi N+1 query là O(n) lần đi-về mạng, mỗi lần tốn vài mili giây, tệ hơn nhiều so với O(n) phép tính trong bộ nhớ."
        ],
        code: {
          lang: "typescript", file: "src/join.ts",
          src: `type User = { id: string; name: string };
type Order = { id: string; userId: string };

// O(n * m): find duyệt lại users cho mỗi order
function attachSlow(orders: Order[], users: User[]) {
  return orders.map((o) => ({ ...o, user: users.find((u) => u.id === o.userId) }));
}

// O(n + m): dựng Map một lần, tra cứu O(1)
function attachFast(orders: Order[], users: User[]) {
  const byId = new Map(users.map((u) => [u.id, u] as const));
  return orders.map((o) => ({ ...o, user: byId.get(o.userId) }));
}`
        }
      }
    ],
    summary: [
      "Big-O mô tả tốc độ tăng chi phí theo kích thước đầu vào, bỏ qua hằng số.",
      "Thứ tự thường gặp: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n).",
      "Amortized O(1) nghĩa là thỉnh thoảng tốn kém nhưng trung bình trên chuỗi thao tác vẫn rẻ.",
      "Lỗi hay gặp nhất ở backend là `find` trong vòng lặp; thay bằng Map để từ O(n^2) xuống O(n)."
    ],
    pitfalls: [
      "Chỉ nhìn Big-O mà bỏ qua hằng số khi n nhỏ. Với vài chục phần tử, cách đơn giản thường đủ nhanh và dễ đọc hơn.",
      "Quên rằng các method như `includes`, `indexOf`, `find`, `splice` trên mảng là O(n), đặt trong vòng lặp là O(n^2).",
      "Bỏ qua chi phí I/O: một vòng lặp O(n) gọi database mỗi lần chậm hơn rất nhiều so với một truy vấn gộp."
    ],
    quiz: [
      {
        q: "Hai vòng lặp lồng nhau, mỗi vòng duyệt n phần tử, có độ phức tạp thời gian là?",
        options: ["O(n)", "O(2n)", "O(n^2)", "O(n log n)"],
        answer: 2,
        explain: "Với mỗi phần tử của vòng ngoài, vòng trong chạy n lần, tổng cộng n * n. O(2n) là hai vòng nối tiếp, rút gọn thành O(n)."
      },
      {
        q: "Vì sao `array.push` được coi là O(1) amortized?",
        options: ["Vì mảng JS luôn có dung lượng vô hạn", "Vì việc cấp phát lại O(n) hiếm khi xảy ra do dung lượng tăng theo cấp số nhân, chia đều ra mỗi lần push rẻ", "Vì push không bao giờ sao chép dữ liệu", "Vì engine dùng linked list"],
        answer: 1,
        explain: "Thỉnh thoảng mảng phải mở rộng và sao chép, nhưng mỗi lần mở rộng gấp đôi nên tổng chi phí cho n lần push là O(n), trung bình O(1) mỗi lần."
      },
      {
        q: "Tra cứu trong hash map có worst case là bao nhiêu?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answer: 2,
        explain: "Trung bình là O(1), nhưng nếu nhiều key đụng độ vào cùng bucket, tra cứu phải duyệt qua chúng, xấu nhất là O(n)."
      }
    ]
  },

  "p01.m2.t1": {
    sections: [
      {
        h: "Array: liên tục trong bộ nhớ",
        p: [
          "Array lưu phần tử liên tiếp nhau nên truy cập theo chỉ số là O(1): địa chỉ phần tử thứ i tính được trực tiếp. Thêm hoặc xóa ở cuối (`push`, `pop`) là O(1) amortized. Nhưng thêm hoặc xóa ở đầu hay giữa (`unshift`, `shift`, `splice`) là O(n) vì phải dịch chuyển các phần tử phía sau. Tìm kiếm theo giá trị (`includes`, `find`) cũng là O(n).",
          "Array hợp khi bạn cần thứ tự và duyệt tuần tự, ví dụ danh sách kết quả trả về client."
        ]
      },
      {
        h: "Hash Map hoạt động thế nào",
        p: [
          "Hash map dùng hàm băm biến key thành một số, rồi lấy số đó làm vị trí trong mảng bucket bên dưới. Tra cứu, thêm, xóa trung bình O(1). Khi hai key băm vào cùng bucket (collision), bảng phải xử lý thêm, và khi bảng đầy quá một ngưỡng thì được mở rộng và băm lại (rehash).",
          "Trong JS, dùng `Map` thay vì object thuần khi làm từ điển động. `Map` nhận key mọi kiểu (kể cả object), giữ thứ tự chèn, có `size`, và không dính rủi ro key đặc biệt như `__proto__`. Object thuần hợp hơn cho dữ liệu có cấu trúc cố định hoặc cần JSON hóa."
        ],
        list: [
          "Đếm tần suất: đếm số request theo IP, số lần xuất hiện của từ.",
          "Index trong bộ nhớ: tra user theo id thay vì duyệt mảng.",
          "Loại trùng và kiểm tra tồn tại bằng `Set`: đã xử lý message id này chưa (idempotency).",
          "Cache đơn giản trong process."
        ]
      },
      {
        h: "Ví dụ: Two Sum và loại trùng",
        p: [
          "Bài Two Sum là minh họa kinh điển cho việc đổi bộ nhớ lấy tốc độ. Cách vét cạn thử mọi cặp là O(n^2). Dùng map lưu các số đã gặp, với mỗi số chỉ cần hỏi 'số bù đã xuất hiện chưa' trong O(1), tổng cộng O(n) thời gian và O(n) bộ nhớ."
        ],
        code: {
          lang: "typescript", file: "src/hashing.ts",
          src: `function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // giá trị -> chỉ số
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]!;
    const j = seen.get(need);
    if (j !== undefined) return [j, i];
    seen.set(nums[i]!, i);
  }
  return null;
}

const processed = new Set<string>();
function handleMessage(msg: { id: string; body: string }) {
  if (processed.has(msg.id)) return;   // đã xử lý: bỏ qua (idempotent)
  processed.add(msg.id);
  // ... xử lý
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`
        }
      }
    ],
    summary: [
      "Array: truy cập theo chỉ số O(1), thêm/xóa ở cuối O(1), ở đầu hoặc giữa O(n), tìm theo giá trị O(n).",
      "Hash map và Set: tra cứu, thêm, xóa trung bình O(1) nhờ hàm băm.",
      "Trong JS, dùng `Map`/`Set` cho từ điển và tập hợp động thay vì object thuần.",
      "Đổi bộ nhớ lấy tốc độ bằng hash map là kỹ thuật được dùng nhiều nhất."
    ],
    pitfalls: [
      "Dùng `array.includes` trong vòng lặp để kiểm tra tồn tại. Chuyển mảng sang `Set` trước.",
      "Dùng object làm key trong `Map` rồi tra bằng object khác có cùng nội dung. `Map` so sánh key object theo tham chiếu; hãy dùng id dạng string.",
      "Để `Map`/`Set` làm cache trong process tăng mãi không giới hạn, gây tràn bộ nhớ. Cần giới hạn kích thước hoặc TTL."
    ],
    quiz: [
      {
        q: "Thao tác nào trên array có độ phức tạp O(n)?",
        options: ["`arr[5]`", "`arr.push(x)`", "`arr.shift()`", "`arr.pop()`"],
        answer: 2,
        explain: "`shift` xóa phần tử đầu và phải dịch mọi phần tử còn lại lên một vị trí. Truy cập chỉ số, push, pop đều O(1) (push là amortized)."
      },
      {
        q: "Vì sao nên dùng `Map` thay vì object thuần để đếm số request theo IP?",
        options: ["Object không lưu được số", "Map có key động mọi kiểu, có `size`, giữ thứ tự và không đụng các key đặc biệt như `__proto__`", "Map luôn nhanh hơn gấp 10 lần", "Object không cho thêm key sau khi tạo"],
        answer: 1,
        explain: "Map được thiết kế cho từ điển động. Object thuần có prototype và key đặc biệt có thể gây lỗi. Không có con số tốc độ cố định nào như 10 lần."
      },
      {
        q: "Two Sum dùng hash map có độ phức tạp thời gian và bộ nhớ là?",
        options: ["O(n^2) và O(1)", "O(n) và O(n)", "O(n log n) và O(1)", "O(1) và O(n)"],
        answer: 1,
        explain: "Duyệt một lượt với tra cứu O(1) cho O(n) thời gian, đổi lại map lưu tới n phần tử nên tốn O(n) bộ nhớ."
      }
    ]
  },

  "p01.m2.t2": {
    sections: [
      {
        h: "Stack và Queue",
        p: [
          "Stack là LIFO (vào sau ra trước): chỉ thao tác ở một đầu với `push` và `pop`, đều O(1). Call stack của chính JavaScript là một stack. Ứng dụng: chức năng undo, kiểm tra ngoặc hợp lệ, duyệt DFS không đệ quy, parse biểu thức.",
          "Queue là FIFO (vào trước ra trước): thêm ở cuối, lấy ở đầu. Ứng dụng: duyệt BFS, hàng đợi tác vụ, buffer xử lý theo thứ tự. Message queue như RabbitMQ hay BullMQ trên Redis cũng dựa trên ý tưởng này ở quy mô hệ thống."
        ],
        code: {
          lang: "typescript", file: "src/queue.ts",
          src: `// array.shift() là O(n). Queue O(1) dùng con trỏ đầu:
class Queue<T> {
  private items: (T | undefined)[] = [];
  private head = 0;
  enqueue(x: T) { this.items.push(x); }
  dequeue(): T | undefined {
    if (this.head >= this.items.length) return undefined;
    const x = this.items[this.head];
    this.items[this.head++] = undefined;           // cho GC thu hồi
    if (this.head > 1024 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head);    // thu gọn định kỳ
      this.head = 0;
    }
    return x;
  }
  get size() { return this.items.length - this.head; }
}`
        }
      },
      {
        h: "Linked List",
        p: [
          "Linked list là chuỗi node, mỗi node giữ giá trị và con trỏ tới node kế (doubly linked list có thêm con trỏ về node trước). Khi đã có tham chiếu tới node, thêm hoặc xóa tại đó là O(1), không phải dịch chuyển gì. Đổi lại, truy cập phần tử thứ i là O(n) vì phải đi từ đầu, và các node nằm rải rác nên kém thân thiện với CPU cache hơn array.",
          "Trong code ứng dụng JS, bạn hiếm khi cần linked list tự viết. Nhưng nó là mảnh ghép quan trọng của cấu trúc khác, tiêu biểu là LRU cache."
        ]
      },
      {
        h: "LRU cache: kết hợp hash map và danh sách có thứ tự",
        p: [
          "LRU (Least Recently Used) cache giới hạn số phần tử, khi đầy thì loại phần tử lâu nhất không được dùng. Cài đặt kinh điển là hash map cộng doubly linked list: map cho tra cứu O(1), list giữ thứ tự sử dụng để di chuyển và loại bỏ O(1).",
          "Trong JS có mẹo gọn: `Map` giữ thứ tự chèn. Khi truy cập, xóa key rồi set lại để đưa nó về cuối. Khi đầy, key đầu tiên trong `map.keys()` chính là key lâu nhất không dùng. Redis cũng có các chính sách loại bỏ kiểu LRU xấp xỉ như `allkeys-lru`."
        ],
        code: {
          lang: "typescript", file: "src/lru-cache.ts",
          src: `class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);       // đưa về cuối = mới dùng gần nhất
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value as K; // phần tử đầu = lâu nhất
      this.map.delete(oldest);
    }
  }
}`
        }
      }
    ],
    summary: [
      "Stack là LIFO (undo, DFS, kiểm tra ngoặc); Queue là FIFO (BFS, hàng đợi tác vụ).",
      "`array.shift()` là O(n); queue lớn cần cài đặt với con trỏ đầu hoặc cấu trúc chuyên dụng.",
      "Linked list thêm/xóa O(1) tại node đã biết nhưng truy cập theo chỉ số O(n).",
      "LRU cache = hash map + danh sách có thứ tự; trong JS có thể dùng tính giữ thứ tự của `Map`."
    ],
    pitfalls: [
      "Dùng `array.shift()` làm queue cho hàng trăm nghìn phần tử trong BFS, khiến thuật toán thành O(n^2).",
      "Quên cập nhật thứ tự khi `get` trong LRU, biến nó thành FIFO cache.",
      "Tự viết linked list trong code ứng dụng khi array hoặc Map đã đủ, làm code phức tạp mà không nhanh hơn."
    ],
    quiz: [
      {
        q: "Chức năng undo trong trình soạn thảo phù hợp với cấu trúc nào?",
        options: ["Queue", "Stack", "Hash Set", "Heap"],
        answer: 1,
        explain: "Undo hoàn tác thao tác gần nhất trước, đúng tính chất LIFO của stack. Queue sẽ hoàn tác thao tác cũ nhất trước."
      },
      {
        q: "LRU cache kinh điển kết hợp hai cấu trúc nào để đạt O(1) cho get và set?",
        options: ["Array và binary search", "Hash map và doubly linked list", "Stack và queue", "Heap và set"],
        answer: 1,
        explain: "Hash map cho tìm node O(1), doubly linked list cho phép di chuyển node lên đầu và xóa node cuối O(1). Binary search là O(log n), heap không cập nhật thứ tự dùng O(1)."
      },
      {
        q: "Trong cài đặt LRU bằng `Map` của JS, vì sao key đầu tiên của `map.keys()` là key cần loại bỏ?",
        options: ["Vì Map tự sắp xếp key theo chữ cái", "Vì Map giữ thứ tự chèn, và mỗi lần dùng key được xóa rồi chèn lại ở cuối", "Vì Map luôn lưu key nhỏ nhất ở đầu", "Vì key đầu tiên có hash nhỏ nhất"],
        answer: 1,
        explain: "Map duyệt theo thứ tự chèn. Việc delete rồi set khi truy cập đẩy key vừa dùng về cuối, nên đầu danh sách là key lâu nhất không được dùng."
      }
    ]
  },

  "p01.m2.t3": {
    sections: [
      {
        h: "Tree và cách duyệt",
        p: [
          "Tree là cấu trúc phân cấp: một node gốc, mỗi node có các node con, không có chu trình. Bạn gặp tree hằng ngày: cây thư mục, DOM, cây danh mục sản phẩm, cây comment lồng nhau, AST mà TypeScript dùng để phân tích code.",
          "Có hai cách duyệt chính. DFS (theo chiều sâu) đi hết một nhánh rồi mới quay lại, gồm pre-order (node trước con), in-order (trái, node, phải, chỉ có ý nghĩa với cây nhị phân), post-order (con trước node, ví dụ tính tổng dung lượng thư mục). BFS (theo tầng) dùng queue để duyệt từng mức, hợp khi cần in cây theo cấp."
        ],
        code: {
          lang: "typescript", file: "src/tree.ts",
          src: `type Category = { name: string; children: Category[] };

// DFS pre-order: in cây danh mục có thụt lề
function print(node: Category, depth = 0): void {
  console.log("  ".repeat(depth) + node.name);
  for (const child of node.children) print(child, depth + 1);
}

// Post-order: đếm tổng số danh mục
function count(node: Category): number {
  return 1 + node.children.reduce((sum, c) => sum + count(c), 0);
}`
        }
      },
      {
        h: "BST và vì sao database dùng B-Tree",
        p: [
          "Binary Search Tree (BST) là cây nhị phân mà mọi node bên trái nhỏ hơn node cha, mọi node bên phải lớn hơn. Tìm, thêm, xóa mất O(chiều cao). Nếu cây cân bằng, chiều cao là O(log n). Nếu chèn dữ liệu đã sắp xếp vào BST thường, cây suy biến thành một đường thẳng và mọi thao tác thành O(n). Vì vậy thực tế dùng cây tự cân bằng như AVL hay Red-Black tree.",
          "Database lưu dữ liệu trên đĩa theo trang (page), mỗi lần đọc một trang là tốn kém. B-Tree (PostgreSQL dùng biến thể B+Tree cho index mặc định) cho mỗi node chứa hàng trăm key, nên cây rất thấp: vài tầng là đủ cho hàng triệu dòng, tức vài lần đọc trang. Key trong B-Tree được sắp xếp, nên index này phục vụ được cả `=`, `<`, `>`, `BETWEEN`, `ORDER BY` và tìm tiền tố."
        ]
      },
      {
        h: "Heap và priority queue",
        p: [
          "Heap là cây nhị phân gần đầy đủ, lưu gọn trong mảng, đảm bảo node cha luôn nhỏ hơn (min-heap) hoặc lớn hơn (max-heap) các con. Lấy phần tử nhỏ nhất là O(1), thêm hoặc lấy ra là O(log n). Heap không sắp xếp toàn bộ, nó chỉ đảm bảo phần tử ưu tiên nhất ở đỉnh.",
          "Ứng dụng: priority queue cho job (job ưu tiên cao chạy trước), lập lịch theo thời điểm, thuật toán Dijkstra, và bài toán top-K. Tìm 10 sản phẩm bán chạy nhất trong 1 triệu dòng bằng min-heap kích thước 10 tốn O(n log k), rẻ hơn sắp xếp toàn bộ O(n log n). JS không có heap dựng sẵn, bạn tự cài hoặc dùng thư viện."
        ],
        code: {
          lang: "typescript", file: "src/min-heap.ts",
          src: `class MinHeap {
  private a: number[] = [];
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x: number) {
    const a = this.a; a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p]! <= a[i]!) break;
      [a[p], a[i]] = [a[i]!, a[p]!]; i = p;
    }
  }
  pop(): number | undefined {
    const a = this.a; if (!a.length) return undefined;
    const top = a[0]!; const last = a.pop()!;
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && a[l]! < a[m]!) m = l;
        if (r < a.length && a[r]! < a[m]!) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i]!, a[m]!]; i = m;
      }
    }
    return top;
  }
}

function topK(nums: number[], k: number): number[] {
  const h = new MinHeap();
  for (const n of nums) { h.push(n); if (h.size > k) h.pop(); } // giữ k số lớn nhất
  const out: number[] = []; while (h.size) out.push(h.pop()!);
  return out.reverse();
}`
        }
      }
    ],
    summary: [
      "Tree biểu diễn dữ liệu phân cấp; duyệt bằng DFS (pre/in/post-order) hoặc BFS theo tầng.",
      "BST cân bằng cho tìm kiếm O(log n); BST không cân bằng có thể suy biến thành O(n).",
      "B-Tree có node chứa nhiều key, cây thấp, tối ưu cho đọc theo trang trên đĩa; là index mặc định của PostgreSQL.",
      "Heap cho lấy phần tử ưu tiên O(1), thêm/lấy O(log n); dùng cho priority queue và top-K."
    ],
    pitfalls: [
      "Dùng đệ quy để duyệt cây rất sâu (dữ liệu do người dùng tạo, ví dụ comment lồng nhau) có thể tràn call stack. Giới hạn độ sâu hoặc duyệt bằng stack tường minh.",
      "Nghĩ heap là mảng đã sắp xếp. Chỉ phần tử đỉnh được đảm bảo; muốn thứ tự đầy đủ phải pop lần lượt.",
      "Sắp xếp cả triệu phần tử chỉ để lấy top 10, trong khi heap kích thước k hoặc `ORDER BY ... LIMIT` có index sẽ rẻ hơn."
    ],
    quiz: [
      {
        q: "Vì sao database dùng B-Tree thay vì BST nhị phân cho index?",
        options: ["B-Tree dùng ít bộ nhớ RAM hơn", "Mỗi node B-Tree chứa nhiều key nên cây thấp, giảm số lần đọc trang từ đĩa", "BST không sắp xếp được dữ liệu", "B-Tree không cần cân bằng"],
        answer: 1,
        explain: "Chi phí chính là đọc trang đĩa. Node rộng làm cây chỉ vài tầng. BST vẫn sắp xếp được nhưng cao hơn nhiều. B-Tree vẫn tự cân bằng khi thêm/xóa."
      },
      {
        q: "Tìm top 10 phần tử lớn nhất trong n phần tử bằng min-heap kích thước 10 có độ phức tạp là?",
        options: ["O(n log n)", "O(n log 10), tức gần O(n)", "O(n^2)", "O(log n)"],
        answer: 1,
        explain: "Mỗi phần tử có thể push/pop trên heap kích thước k với chi phí O(log k). Với k = 10 cố định, tổng gần như tuyến tính."
      },
      {
        q: "Tính tổng dung lượng của một thư mục (gồm mọi thư mục con) phù hợp với kiểu duyệt nào?",
        options: ["Pre-order", "Post-order", "In-order", "Binary search"],
        answer: 1,
        explain: "Cần biết dung lượng của các con trước rồi mới cộng cho node cha, đó là post-order. In-order chỉ có nghĩa với cây nhị phân."
      }
    ]
  },

  "p01.m2.t4": {
    sections: [
      {
        h: "Graph và cách biểu diễn",
        p: [
          "Graph gồm các đỉnh (node) và cạnh (edge) nối chúng. Cạnh có thể có hướng (A follow B) hoặc vô hướng (A là bạn của B), có trọng số (khoảng cách) hoặc không. Tree là trường hợp đặc biệt của graph. Graph xuất hiện trong backend nhiều hơn bạn nghĩ: quan hệ bạn bè, phụ thuộc giữa các package, thứ tự chạy migration, luồng workflow, mạng lưới giao hàng.",
          "Cách biểu diễn phổ biến là danh sách kề (adjacency list): mỗi đỉnh giữ danh sách các đỉnh kề, tốn O(V + E) bộ nhớ, phù hợp với graph thưa. Ma trận kề tốn O(V^2), chỉ hợp với graph dày hoặc khi cần kiểm tra cạnh O(1)."
        ]
      },
      {
        h: "BFS: đường đi ngắn nhất không trọng số",
        p: [
          "BFS duyệt từ đỉnh nguồn theo từng lớp: các đỉnh cách 1 bước, rồi 2 bước. Vì vậy lần đầu tiên BFS chạm tới một đỉnh là theo đường đi ít cạnh nhất. Đây là cách tính 'bạn của bạn' mức 2 hoặc số bước tối thiểu. Với cạnh có trọng số khác nhau, cần Dijkstra (dùng heap). Luôn đánh dấu đỉnh đã thăm để không lặp vô hạn khi có chu trình. Độ phức tạp O(V + E)."
        ],
        code: {
          lang: "typescript", file: "src/graph.ts",
          src: `type Graph = Map<string, string[]>;

function shortestPath(g: Graph, start: string, goal: string): string[] | null {
  const prev = new Map<string, string | null>([[start, null]]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {       // dùng chỉ số thay cho shift()
    const node = queue[i]!;
    if (node === goal) {
      const path: string[] = [];
      for (let cur: string | null = goal; cur !== null; cur = prev.get(cur) ?? null) path.push(cur);
      return path.reverse();
    }
    for (const next of g.get(node) ?? []) {
      if (!prev.has(next)) { prev.set(next, node); queue.push(next); }
    }
  }
  return null;
}

const g: Graph = new Map([["A", ["B", "C"]], ["B", ["D"]], ["C", ["D"]], ["D", []]]);
console.log(shortestPath(g, "A", "D")); // ["A", "B", "D"]`
        }
      },
      {
        h: "DFS và phát hiện chu trình",
        p: [
          "DFS đi sâu theo một nhánh tới cùng rồi quay lui. Nó hợp cho việc liệt kê mọi đường đi, tìm thành phần liên thông, và đặc biệt là phát hiện chu trình trong graph có hướng.",
          "Kỹ thuật tô ba màu: trắng (chưa thăm), xám (đang nằm trên đường DFS hiện tại), đen (đã xong). Gặp lại một đỉnh xám nghĩa là có cạnh quay ngược, tức có chu trình. Ứng dụng thực tế: phát hiện phụ thuộc vòng giữa các module hay các job, và topological sort để tìm thứ tự chạy hợp lệ. Graph có chu trình thì không có thứ tự như vậy."
        ],
        code: {
          lang: "typescript", file: "src/cycle.ts",
          src: `function hasCycle(g: Map<string, string[]>): boolean {
  const state = new Map<string, "visiting" | "done">();
  const visit = (n: string): boolean => {
    if (state.get(n) === "visiting") return true;  // gặp đỉnh xám: có chu trình
    if (state.get(n) === "done") return false;
    state.set(n, "visiting");
    for (const next of g.get(n) ?? []) if (visit(next)) return true;
    state.set(n, "done");
    return false;
  };
  return [...g.keys()].some((n) => visit(n));
}

// job "deploy" cần "build", "build" cần "test", "test" cần "deploy" -> vòng
console.log(hasCycle(new Map([["deploy", ["build"]], ["build", ["test"]], ["test", ["deploy"]]]))); // true`
        }
      }
    ],
    summary: [
      "Graph mô hình quan hệ giữa các thực thể; biểu diễn bằng danh sách kề cho graph thưa.",
      "BFS dùng queue, cho đường đi ít cạnh nhất trong graph không trọng số, O(V + E).",
      "DFS dùng đệ quy hoặc stack; tô ba màu để phát hiện chu trình trong graph có hướng.",
      "Luôn đánh dấu đỉnh đã thăm để tránh lặp vô hạn."
    ],
    pitfalls: [
      "Quên đánh dấu visited, dẫn tới vòng lặp vô hạn khi graph có chu trình.",
      "Đánh dấu visited khi lấy ra khỏi queue thay vì khi đưa vào, khiến một đỉnh bị thêm vào queue nhiều lần.",
      "Dùng BFS cho graph có trọng số khác nhau rồi tưởng là đường ngắn nhất. Cần Dijkstra."
    ],
    quiz: [
      {
        q: "Tìm số bước kết bạn ít nhất giữa hai người dùng nên dùng thuật toán nào?",
        options: ["DFS", "BFS", "Binary search", "Merge sort"],
        answer: 1,
        explain: "Cạnh không trọng số, BFS duyệt theo lớp nên lần đầu gặp đích là đường ít bước nhất. DFS có thể tìm ra đường dài hơn trước."
      },
      {
        q: "Trong phát hiện chu trình bằng DFS ba màu, gặp một đỉnh đang ở trạng thái 'visiting' nghĩa là gì?",
        options: ["Đỉnh đó cô lập", "Có cạnh quay về tổ tiên trên đường đi hiện tại, tức có chu trình", "Graph không có hướng", "DFS đã kết thúc"],
        answer: 1,
        explain: "'Visiting' nghĩa là đỉnh đang nằm trên đường DFS hiện tại. Quay lại nó là đi thành vòng. Đỉnh 'done' thì không tạo chu trình."
      },
      {
        q: "Danh sách kề tốn bao nhiêu bộ nhớ cho graph có V đỉnh, E cạnh?",
        options: ["O(V^2)", "O(V + E)", "O(E^2)", "O(1)"],
        answer: 1,
        explain: "Mỗi đỉnh có một danh sách, tổng độ dài các danh sách tỉ lệ với số cạnh. O(V^2) là của ma trận kề."
      }
    ]
  },

  "p01.m2.t5": {
    sections: [
      {
        h: "Merge sort và quick sort",
        p: [
          "Merge sort chia đôi mảng, sắp xếp đệ quy từng nửa, rồi trộn hai nửa đã sắp xếp. Luôn O(n log n) ở mọi trường hợp, ổn định (giữ thứ tự tương đối của phần tử bằng nhau), nhưng cần O(n) bộ nhớ phụ.",
          "Quick sort chọn một pivot, chia mảng thành phần nhỏ hơn và lớn hơn pivot, rồi đệ quy. Trung bình O(n log n) và thường rất nhanh thực tế vì sắp xếp tại chỗ, nhưng worst case O(n^2) khi pivot chọn tệ, ví dụ luôn lấy phần tử đầu với mảng đã sắp xếp. Chọn pivot ngẫu nhiên giảm rủi ro này.",
          "`Array.prototype.sort` của V8 dùng TimSort: lai giữa merge sort và insertion sort, O(n log n) và ổn định. Chuẩn ECMAScript yêu cầu `sort` phải ổn định từ ES2019. Lưu ý mặc định `sort` so sánh dạng chuỗi, `[10, 9, 1].sort()` cho `[1, 10, 9]`, nên luôn truyền hàm so sánh."
        ]
      },
      {
        h: "Binary search",
        p: [
          "Binary search tìm trong mảng đã sắp xếp bằng cách so với phần tử giữa rồi loại bỏ một nửa, O(log n). Tìm trong 1 tỷ phần tử chỉ cần khoảng 30 lần so sánh. Đây cũng là cách B-Tree index thu hẹp phạm vi tìm kiếm.",
          "Bạn nên viết dạng tìm cận: tìm vị trí đầu tiên thỏa điều kiện. Dạng này vừa trả lời 'có tồn tại không', vừa cho vị trí chèn."
        ],
        code: {
          lang: "typescript", file: "src/binary-search.ts",
          src: `// Vị trí đầu tiên có arr[i] >= target (lower bound)
function lowerBound(arr: number[], target: number): number {
  let lo = 0, hi = arr.length;          // khoảng [lo, hi)
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (arr[mid]! < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

console.log(lowerBound([1, 3, 5, 7], 5)); // 2
console.log(lowerBound([1, 3, 5, 7], 6)); // 3 (vị trí chèn)
console.log([10, 9, 1].sort((a, b) => a - b)); // [1, 9, 10]`
        }
      },
      {
        h: "Binary search trên đáp án",
        p: [
          "Khi đáp án là một con số nằm trong khoảng xác định, và có tính đơn điệu (nếu x thỏa thì mọi giá trị lớn hơn x cũng thỏa), bạn có thể binary search trực tiếp trên đáp án thay vì trên mảng.",
          "Ví dụ: cần gửi `n` job với tối đa `d` ngày, mỗi ngày xử lý tối đa `c` job. Tìm `c` nhỏ nhất. Với mỗi `c`, kiểm tra xem có xong trong `d` ngày không mất O(n). Tìm `c` bằng binary search trong khoảng từ job lớn nhất tới tổng số job, tổng cộng O(n log S). Dạng bài này xuất hiện nhiều trên LeetCode (Koko Eating Bananas, Capacity To Ship Packages)."
        ],
        code: {
          lang: "typescript", file: "src/ship-capacity.ts",
          src: `function minCapacity(weights: number[], days: number): number {
  const canShip = (cap: number) => {
    let need = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { need++; load = 0; }
      load += w;
    }
    return need <= days;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (canShip(mid)) hi = mid; else lo = mid + 1;
  }
  return lo;
}

console.log(minCapacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15`
        }
      }
    ],
    summary: [
      "Merge sort luôn O(n log n) và ổn định, cần O(n) bộ nhớ; quick sort nhanh trung bình nhưng worst case O(n^2).",
      "`Array.prototype.sort` ổn định nhưng mặc định so sánh chuỗi; luôn truyền hàm so sánh cho số.",
      "Binary search O(log n) trên dữ liệu đã sắp xếp; viết dạng lower bound để tránh lỗi biên.",
      "Binary search trên đáp án áp dụng khi điều kiện kiểm tra có tính đơn điệu."
    ],
    pitfalls: [
      "Gọi `nums.sort()` không có hàm so sánh với mảng số, cho kết quả sai thứ tự.",
      "Sai biên trong binary search (dùng `<=` hay `<`, `mid` hay `mid + 1`) gây vòng lặp vô hạn. Chọn một quy ước khoảng như `[lo, hi)` và giữ nhất quán.",
      "Binary search trên mảng chưa sắp xếp, cho kết quả sai mà không báo lỗi."
    ],
    quiz: [
      {
        q: "`[10, 9, 1].sort()` trả về gì?",
        options: ["`[1, 9, 10]`", "`[1, 10, 9]`", "`[10, 9, 1]`", "Ném lỗi"],
        answer: 1,
        explain: "Không có hàm so sánh, `sort` chuyển phần tử thành chuỗi và so sánh theo thứ tự chuỗi: '1' < '10' < '9'."
      },
      {
        q: "Khi nào quick sort rơi vào worst case O(n^2)?",
        options: ["Khi mảng có ít phần tử", "Khi pivot liên tục là phần tử nhỏ nhất hoặc lớn nhất, ví dụ lấy phần tử đầu của mảng đã sắp xếp", "Khi mảng có phần tử trùng", "Không bao giờ"],
        answer: 1,
        explain: "Pivot tệ làm mỗi lần chia chỉ bớt đi một phần tử, cho n tầng đệ quy mỗi tầng O(n). Chọn pivot ngẫu nhiên giảm rủi ro này."
      },
      {
        q: "Điều kiện để áp dụng binary search trên đáp án là gì?",
        options: ["Mảng đầu vào đã sắp xếp", "Hàm kiểm tra có tính đơn điệu trên miền đáp án", "Đáp án là số nguyên tố", "Đầu vào có ít hơn 1000 phần tử"],
        answer: 1,
        explain: "Tính đơn điệu (thỏa ở x thì thỏa ở mọi giá trị lớn hơn) cho phép loại bỏ một nửa miền mỗi bước. Mảng đầu vào không cần sắp xếp, như ví dụ ship capacity."
      }
    ]
  },

  "p01.m2.t6": {
    sections: [
      {
        h: "Two pointers và sliding window",
        p: [
          "Two pointers dùng hai chỉ số di chuyển trên mảng thay cho hai vòng lặp lồng nhau. Dạng phổ biến: hai con trỏ từ hai đầu tiến vào giữa trên mảng đã sắp xếp (tìm cặp có tổng bằng target), hoặc con trỏ chậm và nhanh (loại trùng tại chỗ, tìm chu trình trong linked list).",
          "Sliding window là biến thể cho bài toán về đoạn con liên tiếp: mở rộng cửa sổ bên phải, thu hẹp bên trái khi vi phạm điều kiện. Mỗi phần tử vào và ra khỏi cửa sổ tối đa một lần nên tổng là O(n). Ý tưởng này chính là nền của rate limiter sliding window: đếm số request trong 60 giây gần nhất."
        ],
        code: {
          lang: "typescript", file: "src/window.ts",
          src: `// Độ dài chuỗi con dài nhất không có ký tự lặp
function longestUnique(s: string): number {
  const lastSeen = new Map<string, number>();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right]!;
    const prev = lastSeen.get(ch);
    if (prev !== undefined && prev >= left) left = prev + 1; // thu hẹp cửa sổ
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
console.log(longestUnique("abcabcbb")); // 3`
        }
      },
      {
        h: "Prefix sum",
        p: [
          "Prefix sum tính trước `prefix[i]` là tổng i phần tử đầu tiên. Sau đó tổng của mọi đoạn `[l, r)` là `prefix[r] - prefix[l]`, trả lời trong O(1). Tốn O(n) để chuẩn bị, rồi mỗi truy vấn O(1). Trong báo cáo, bạn làm điều tương tự khi tính doanh thu lũy kế để trả lời nhanh doanh thu của mọi khoảng ngày. Kết hợp prefix sum với hash map giải được bài đếm số đoạn con có tổng bằng k trong O(n)."
        ]
      },
      {
        h: "Đệ quy, backtracking và DP cơ bản",
        p: [
          "Đệ quy giải bài toán bằng cách gọi lại chính nó trên bài toán nhỏ hơn, cần điều kiện dừng rõ ràng. Backtracking là đệ quy thử từng lựa chọn, nếu đi vào ngõ cụt thì hoàn tác và thử lựa chọn khác. Dùng để sinh mọi tổ hợp, hoán vị, giải sudoku. Độ phức tạp thường là hàm mũ nên cần cắt nhánh sớm.",
          "Dynamic programming (DP) áp dụng khi bài toán có các bài toán con chồng lấp: cùng một bài toán con được tính đi tính lại. Lưu kết quả lại (memoization, từ trên xuống) hoặc điền bảng từ nhỏ đến lớn (tabulation, từ dưới lên). Fibonacci đệ quy ngây thơ là O(2^n), có lưu kết quả thành O(n). Quy trình giải DP: xác định trạng thái, công thức chuyển trạng thái, trường hợp cơ sở, rồi thứ tự tính."
        ],
        code: {
          lang: "typescript", file: "src/dp.ts",
          src: `// Số cách leo n bậc thang, mỗi lần 1 hoặc 2 bậc (tabulation, O(n) thời gian, O(1) bộ nhớ)
function climbStairs(n: number): number {
  let a = 1, b = 1;             // ways(0), ways(1)
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

// Backtracking: sinh mọi tập con
function subsets<T>(items: T[]): T[][] {
  const out: T[][] = [];
  const path: T[] = [];
  const go = (i: number) => {
    if (i === items.length) { out.push([...path]); return; }
    go(i + 1);                  // không chọn items[i]
    path.push(items[i]!);       // chọn
    go(i + 1);
    path.pop();                 // hoàn tác
  };
  go(0);
  return out;
}
console.log(climbStairs(5), subsets([1, 2]).length); // 8 4`
        }
      }
    ],
    summary: [
      "Two pointers và sliding window biến nhiều bài O(n^2) thành O(n).",
      "Prefix sum chuẩn bị O(n) để trả lời tổng đoạn bất kỳ trong O(1).",
      "Backtracking thử và hoàn tác lựa chọn; thường là hàm mũ nên cần cắt nhánh.",
      "DP dùng khi có bài toán con chồng lấp: memoization từ trên xuống hoặc tabulation từ dưới lên."
    ],
    pitfalls: [
      "Quên hoàn tác (`path.pop()`) trong backtracking, khiến trạng thái rò rỉ sang nhánh khác.",
      "Push trực tiếp `path` vào kết quả thay vì bản sao `[...path]`, cuối cùng mọi phần tử kết quả là cùng một mảng rỗng.",
      "Học thuộc lời giải thay vì nhận diện dạng bài. Hãy ghi lại dấu hiệu: đoạn liên tiếp thì nghĩ sliding window, tổng đoạn thì prefix sum, bài toán con lặp lại thì DP."
    ],
    quiz: [
      {
        q: "Bài 'tìm đoạn con liên tiếp dài nhất có tổng không vượt quá k' (các số dương) hợp với kỹ thuật nào?",
        options: ["Backtracking", "Sliding window", "Binary search trên mảng chưa sắp xếp", "DFS"],
        answer: 1,
        explain: "Đoạn liên tiếp và điều kiện đơn điệu khi mở rộng hoặc thu hẹp là dấu hiệu của sliding window, cho O(n). Backtracking thử mọi tổ hợp là quá tốn kém."
      },
      {
        q: "Với mảng prefix sum `p`, tổng các phần tử từ chỉ số l tới r - 1 là?",
        options: ["`p[r] + p[l]`", "`p[r] - p[l]`", "`p[r - l]`", "`p[l] - p[r]`"],
        answer: 1,
        explain: "`p[r]` là tổng r phần tử đầu, `p[l]` là tổng l phần tử đầu. Hiệu của chúng chính là tổng đoạn `[l, r)`."
      },
      {
        q: "Dấu hiệu nào cho thấy bài toán nên dùng dynamic programming?",
        options: ["Dữ liệu đã sắp xếp", "Có bài toán con chồng lấp được tính lặp lại nhiều lần", "Cần duyệt theo tầng", "Chỉ có một phần tử"],
        answer: 1,
        explain: "DP tiết kiệm bằng cách lưu kết quả bài toán con để không tính lại. Dữ liệu sắp xếp gợi ý binary search, duyệt theo tầng gợi ý BFS."
      }
    ]
  },

  "p01.m3.t0": {
    sections: [
      {
        h: "Bốn trụ cột của OOP",
        list: [
          "Encapsulation (đóng gói): giấu trạng thái bên trong, chỉ cho thay đổi qua method có kiểm soát. Một `Order` không cho sửa `status` tùy ý mà chỉ qua `pay()`, `cancel()` với các kiểm tra hợp lệ.",
          "Abstraction (trừu tượng hóa): lộ ra giao diện đơn giản, giấu chi tiết cài đặt. Service chỉ cần biết `PaymentGateway.charge()`, không cần biết bên trong gọi API nào.",
          "Inheritance (kế thừa): lớp con thừa hưởng thuộc tính và hành vi của lớp cha.",
          "Polymorphism (đa hình): cùng một lời gọi, mỗi đối tượng xử lý theo cách riêng. Code gọi `notifier.send()` không quan tâm đó là email hay SMS."
        ],
        p: [
          "Trong TypeScript, `private` và `protected` chỉ được kiểm tra lúc biên dịch. Muốn đóng gói thật sự lúc chạy, dùng private field của JavaScript với tiền tố `#`."
        ]
      },
      {
        h: "Vấn đề của kế thừa sâu",
        p: [
          "Kế thừa tạo liên kết chặt nhất giữa hai lớp: lớp con phụ thuộc vào chi tiết của lớp cha. Sửa lớp cha có thể làm hỏng lớp con một cách bất ngờ (vấn đề fragile base class). Cây kế thừa sâu như `BaseService > CrudService > AuditedCrudService > UserService` khiến việc hiểu một method phải lần qua nhiều tầng.",
          "Kế thừa còn buộc bạn phân loại theo một trục duy nhất. Nếu có `EmailNotifier` và `RetryingNotifier`, vậy email có retry là lớp con của cái nào? Số lớp sẽ bùng nổ theo tổ hợp tính năng."
        ]
      },
      {
        h: "Ưu tiên composition",
        p: [
          "Composition nghĩa là một đối tượng chứa các đối tượng khác và ủy quyền công việc cho chúng (quan hệ 'có một' thay vì 'là một'). Các mảnh ghép nhỏ, độc lập, thay thế và test riêng được. Tổ hợp tính năng chỉ là ghép các mảnh lại với nhau.",
          "Kế thừa vẫn hợp lý khi quan hệ 'là một' thật sự rõ ràng và ổn định, ví dụ các lớp lỗi `NotFoundError extends AppError`, hay lớp cơ sở mà framework yêu cầu. Còn lại, hãy nghĩ tới interface cộng composition trước."
        ],
        code: {
          lang: "typescript", file: "src/notifications/notifier.ts",
          src: `interface Notifier {
  send(to: string, message: string): Promise<void>;
}

class EmailNotifier implements Notifier {
  async send(to: string, message: string) { console.log("email", to, message); }
}

// Thêm retry bằng composition: bọc bất kỳ Notifier nào
class RetryingNotifier implements Notifier {
  constructor(private readonly inner: Notifier, private readonly attempts = 3) {}
  async send(to: string, message: string) {
    for (let i = 1; ; i++) {
      try { return await this.inner.send(to, message); }
      catch (err) { if (i >= this.attempts) throw err; }
    }
  }
}

class Order {
  #status: "pending" | "paid" | "cancelled" = "pending"; // đóng gói thật lúc chạy
  get status() { return this.#status; }
  pay() {
    if (this.#status !== "pending") throw new Error("Không thể thanh toán");
    this.#status = "paid";
  }
}

const notifier: Notifier = new RetryingNotifier(new EmailNotifier());`
        }
      }
    ],
    summary: [
      "OOP có bốn trụ cột: đóng gói, trừu tượng hóa, kế thừa, đa hình.",
      "Kế thừa sâu tạo liên kết chặt và bùng nổ tổ hợp lớp.",
      "Composition ghép các đối tượng nhỏ qua interface, dễ thay thế và dễ test.",
      "`#field` đóng gói thật lúc chạy; `private` của TS chỉ kiểm tra lúc biên dịch."
    ],
    pitfalls: [
      "Tạo `BaseService` chung cho mọi thứ rồi nhồi method vào, khiến mọi service phụ thuộc vào một lớp khổng lồ.",
      "Để thuộc tính public cho phép code bên ngoài đổi trạng thái tùy ý, phá vỡ quy tắc nghiệp vụ. Hãy thay đổi trạng thái qua method có kiểm tra.",
      "Dùng kế thừa chỉ để tái sử dụng vài hàm tiện ích. Tách chúng thành hàm hoặc đối tượng riêng rồi dùng composition."
    ],
    quiz: [
      {
        q: "Vì sao 'ưu tiên composition hơn inheritance'?",
        options: ["Composition chạy nhanh hơn", "Composition tạo liên kết lỏng, ghép tính năng linh hoạt mà không bùng nổ số lớp", "TypeScript không hỗ trợ kế thừa tốt", "Inheritance không có đa hình"],
        answer: 1,
        explain: "Composition cho phép thay thế và kết hợp từng mảnh độc lập. Tốc độ không phải lý do chính, TS hỗ trợ kế thừa đầy đủ, và kế thừa vẫn có đa hình."
      },
      {
        q: "Khác biệt giữa `private x` của TypeScript và `#x` của JavaScript là gì?",
        options: ["Không có khác biệt", "`private` chỉ kiểm tra lúc biên dịch, `#x` là private thật lúc chạy", "`#x` chỉ dùng được trong interface", "`private` nhanh hơn"],
        answer: 1,
        explain: "Modifier `private` bị xóa khi biên dịch, code JS bên ngoài vẫn truy cập được. `#x` được engine bảo vệ, truy cập từ ngoài class là lỗi cú pháp."
      },
      {
        q: "`RetryingNotifier` nhận một `Notifier` khác trong constructor. Đây là ví dụ của điều gì?",
        options: ["Kế thừa nhiều tầng", "Composition: thêm hành vi bằng cách bọc một đối tượng khác", "Singleton", "Prototype chain"],
        answer: 1,
        explain: "`RetryingNotifier` chứa và ủy quyền cho một Notifier khác, thêm logic retry mà không kế thừa. Nó cũng dùng được cho SMS hay push notifier."
      }
    ]
  },

  "p01.m3.t1": {
    sections: [
      {
        h: "SOLID là gì",
        list: [
          "S - Single Responsibility: mỗi module chỉ có một lý do để thay đổi.",
          "O - Open/Closed: mở để mở rộng, đóng để sửa đổi. Thêm tính năng bằng cách thêm code mới, không sửa code đang chạy ổn.",
          "L - Liskov Substitution: lớp con thay được lớp cha mà không làm sai hành vi. Nếu `ReadonlyRepository` ném lỗi khi gọi `save()`, nó vi phạm LSP.",
          "I - Interface Segregation: nhiều interface nhỏ, chuyên biệt tốt hơn một interface to. Đừng bắt client phụ thuộc method nó không dùng.",
          "D - Dependency Inversion: module cấp cao không phụ thuộc module cấp thấp; cả hai phụ thuộc vào abstraction."
        ],
        p: [
          "Trong năm nguyên tắc, SRP và DIP có ảnh hưởng lớn nhất tới cách bạn tổ chức một dự án backend."
        ]
      },
      {
        h: "SRP: một lý do để thay đổi",
        p: [
          "'Một trách nhiệm' không có nghĩa là 'một hàm'. Nó nghĩa là module đó chỉ phục vụ một nhóm lý do thay đổi. Một controller vừa parse request, vừa tính giá, vừa viết SQL, vừa gửi email sẽ phải sửa khi đổi format API, khi đổi chính sách giá, khi đổi database, khi đổi template email. Bốn lý do, bốn nguy cơ làm hỏng nhau.",
          "Kiến trúc layered tách đúng theo các lý do đó: controller lo HTTP, service lo nghiệp vụ, repository lo lưu trữ, và các adapter lo tích hợp bên ngoài như gửi mail hay thanh toán."
        ]
      },
      {
        h: "DIP: nền tảng của hexagonal architecture",
        p: [
          "Nếu `OrderService` gọi thẳng `new PostgresOrderRepository()`, logic nghiệp vụ bị dính chặt vào PostgreSQL. Muốn test phải có database thật. DIP đảo chiều: service định nghĩa interface nó cần (port), và phần hạ tầng cài đặt interface đó (adapter). Phụ thuộc trong mã nguồn giờ trỏ vào lõi nghiệp vụ, không trỏ ra ngoài.",
          "Đó chính là ý tưởng của hexagonal architecture (ports and adapters) và clean architecture: lõi domain không import gì từ framework hay database. Đổi Postgres sang một kho khác, hay thay bằng bản in-memory để test, không phải sửa service."
        ],
        code: {
          lang: "typescript", file: "src/orders/order.service.ts",
          src: `// Port: do lõi nghiệp vụ định nghĩa
export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}
export interface PaymentGateway {
  charge(orderId: string, amount: number): Promise<{ transactionId: string }>;
}
export type Order = { id: string; amount: number; status: "pending" | "paid" };

// Service chỉ phụ thuộc abstraction
export class OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly payments: PaymentGateway,
  ) {}

  async pay(orderId: string): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === "paid") return order;          // idempotent
    await this.payments.charge(order.id, order.amount);
    const paid = { ...order, status: "paid" as const };
    await this.orders.save(paid);
    return paid;
  }
}
// Adapter PostgresOrderRepository, StripePaymentGateway nằm ở tầng infrastructure`
        }
      }
    ],
    summary: [
      "SOLID gồm SRP, OCP, LSP, ISP, DIP; SRP và DIP quan trọng nhất cho kiến trúc backend.",
      "SRP: mỗi module chỉ có một nhóm lý do để thay đổi; layered architecture tách theo các lý do đó.",
      "DIP: nghiệp vụ định nghĩa interface (port), hạ tầng cài đặt (adapter).",
      "Nhờ DIP, service test được với bản giả mà không cần database hay API thật."
    ],
    pitfalls: [
      "Hiểu SRP thành 'mỗi class một method', tạo ra hàng trăm lớp vụn vặt khó theo dõi.",
      "Tạo interface cho mọi thứ dù chỉ có một cài đặt và không cần thay thế khi test. Abstraction có chi phí, hãy dùng ở ranh giới với hạ tầng.",
      "Đặt interface repository trong thư mục infrastructure cạnh cài đặt Postgres, làm phụ thuộc vẫn trỏ ra ngoài. Port thuộc về lõi nghiệp vụ."
    ],
    quiz: [
      {
        q: "Một class vừa validate request, tính thuế, ghi database và gửi email vi phạm nguyên tắc nào rõ nhất?",
        options: ["Liskov Substitution", "Single Responsibility", "Interface Segregation", "Open/Closed"],
        answer: 1,
        explain: "Class có nhiều lý do thay đổi độc lập (API, luật thuế, database, email), đúng là vi phạm SRP."
      },
      {
        q: "Theo DIP, interface `OrderRepository` nên do ai định nghĩa?",
        options: ["Thư viện ORM", "Tầng nghiệp vụ, nơi sử dụng nó", "Database", "Controller"],
        answer: 1,
        explain: "Module cấp cao định nghĩa abstraction theo nhu cầu của mình, hạ tầng cài đặt theo. Nhờ vậy phụ thuộc trỏ vào lõi nghiệp vụ."
      },
      {
        q: "Lợi ích trực tiếp nhất của việc `OrderService` nhận `PaymentGateway` qua constructor là gì?",
        options: ["Thanh toán nhanh hơn", "Có thể thay bằng bản giả khi test và đổi nhà cung cấp mà không sửa service", "Không cần xử lý lỗi", "Tự động retry"],
        answer: 1,
        explain: "Service chỉ biết interface, nên truyền vào cài đặt nào cũng được: bản giả khi test, Stripe hay nhà cung cấp khác khi chạy thật."
      }
    ]
  },

  "p01.m3.t2": {
    sections: [
      {
        h: "Design pattern là gì và vì sao học",
        p: [
          "Design pattern là lời giải đã được đặt tên cho các vấn đề thiết kế lặp đi lặp lại. Giá trị lớn nhất của nó là từ vựng chung: nói 'bọc bằng một Adapter' là cả team hiểu ngay cấu trúc. Hãy học để nhận ra vấn đề, không phải để nhồi pattern vào mọi chỗ."
        ],
        list: [
          "Factory: gom logic tạo đối tượng vào một chỗ, trả về đúng cài đặt theo điều kiện. Ví dụ tạo storage client theo biến môi trường (S3 hay local disk).",
          "Strategy: đóng gói một họ thuật toán thay thế được cho nhau sau cùng interface. Ví dụ các cách tính phí vận chuyển.",
          "Observer: đối tượng phát sự kiện, nhiều bên đăng ký lắng nghe. `EventEmitter` của Node là ví dụ; ở quy mô hệ thống là pub/sub.",
          "Adapter: chuyển interface của thư viện bên ngoài về interface hệ thống của bạn cần.",
          "Decorator: bọc đối tượng để thêm hành vi (cache, log, retry) mà giữ nguyên interface.",
          "Singleton: chỉ một instance trong process, như connection pool. Trong Node, module được cache nên export một instance là đủ. DI container quản lý singleton tốt hơn biến global.",
          "Repository: trừu tượng hóa việc truy cập dữ liệu thành các thao tác theo nghiệp vụ như `findActiveByEmail`."
        ]
      },
      {
        h: "Strategy: tính phí vận chuyển",
        p: [
          "Khi thấy chuỗi `if/else` hay `switch` chọn cách tính toán theo loại và danh sách loại tăng dần, đó là dấu hiệu cần Strategy. Mỗi cách tính là một đối tượng riêng, test riêng. Thêm hãng vận chuyển mới là thêm một strategy và đăng ký vào map, không sửa code cũ (đúng tinh thần Open/Closed)."
        ],
        code: {
          lang: "typescript", file: "src/shipping/shipping.ts",
          src: `interface ShippingStrategy {
  calculate(weightKg: number, distanceKm: number): number; // VND
}

const standard: ShippingStrategy = {
  calculate: (w, d) => 15_000 + Math.ceil(w) * 5_000 + Math.ceil(d / 10) * 2_000,
};
const express: ShippingStrategy = {
  calculate: (w, d) => 2 * standard.calculate(w, d),
};
const freeOverThreshold = (inner: ShippingStrategy, orderTotal: number): ShippingStrategy => ({
  calculate: (w, d) => (orderTotal >= 500_000 ? 0 : inner.calculate(w, d)),
});

const strategies = { standard, express } satisfies Record<string, ShippingStrategy>;
type Method = keyof typeof strategies;

function shippingFee(method: Method, weightKg: number, distanceKm: number, total: number) {
  return freeOverThreshold(strategies[method], total).calculate(weightKg, distanceKm);
}

console.log(shippingFee("standard", 1.2, 25, 200_000)); // 31000`
        }
      },
      {
        h: "Adapter và Decorator trong thực tế",
        p: [
          "Adapter bảo vệ code của bạn khỏi thư viện bên ngoài. Thay vì gọi SDK của nhà cung cấp email ở hàng chục chỗ, bạn viết một `MailerAdapter` cài interface `Mailer` của mình. Đổi nhà cung cấp chỉ phải viết adapter mới.",
          "Decorator thêm hành vi cắt ngang. Một `CachedUserRepository` cài cùng interface với `UserRepository`, kiểm tra Redis trước rồi mới gọi repository thật. Lưu ý: decorator pattern khác với cú pháp decorator `@Injectable()` của TypeScript/NestJS, dù ý tưởng gần nhau."
        ]
      }
    ],
    summary: [
      "Pattern là từ vựng chung cho lời giải của vấn đề thiết kế lặp lại.",
      "Strategy thay chuỗi if/else chọn thuật toán; thêm biến thể không phải sửa code cũ.",
      "Adapter cô lập thư viện bên ngoài; Decorator thêm cache, log, retry mà giữ nguyên interface.",
      "Singleton trong Node thường chỉ là một instance được export hoặc do DI container quản lý."
    ],
    pitfalls: [
      "Áp pattern khi chưa có vấn đề: tạo Factory, Strategy cho logic chỉ có một biến thể. Hãy đợi tới khi thấy sự lặp lại.",
      "Dùng Singleton kiểu biến global có trạng thái thay đổi được, gây phụ thuộc ẩn và test chạy ảnh hưởng lẫn nhau.",
      "Để type của SDK bên ngoài lan khắp codebase, nên khi đổi nhà cung cấp phải sửa mọi nơi. Adapter nên trả về kiểu của bạn."
    ],
    quiz: [
      {
        q: "Bạn có `switch` 6 nhánh chọn cách tính giảm giá và danh sách này thường xuyên thay đổi. Pattern nào phù hợp?",
        options: ["Singleton", "Strategy", "Observer", "Adapter"],
        answer: 1,
        explain: "Strategy đóng gói mỗi thuật toán thành một đối tượng cùng interface, thêm hoặc bớt không phải sửa code gọi."
      },
      {
        q: "`CachedUserRepository` cài cùng interface với repository thật và kiểm tra cache trước khi gọi nó. Đây là pattern nào?",
        options: ["Factory", "Decorator", "Adapter", "Observer"],
        answer: 1,
        explain: "Decorator bọc đối tượng cùng interface để thêm hành vi. Adapter thì chuyển đổi giữa hai interface khác nhau."
      },
      {
        q: "Trong Node.js, vì sao export một instance từ module thường đủ để có hành vi singleton?",
        options: ["Vì Node chỉ có một thread", "Vì module được cache sau lần import đầu tiên, các nơi import nhận cùng một instance", "Vì TypeScript cấm tạo nhiều instance", "Vì V8 tự gộp các object giống nhau"],
        answer: 1,
        explain: "Hệ thống module cache kết quả đánh giá module, nên mọi import cùng nhận một object. Điều này không liên quan tới số thread."
      }
    ]
  },

  "p01.m3.t3": {
    sections: [
      {
        h: "Dependency Injection là gì",
        p: [
          "Dependency Injection (DI) nghĩa là một đối tượng nhận các phụ thuộc từ bên ngoài thay vì tự tạo ra chúng. `UserService` không gọi `new PostgresUserRepository()` bên trong, mà nhận repository qua constructor. DI là cách hiện thực hóa DIP trong code hằng ngày.",
          "Lợi ích rõ nhất là test được: trong unit test, bạn truyền vào repository in-memory hoặc mock và kiểm tra logic nghiệp vụ trong vài mili giây, không cần database. Lợi ích thứ hai là cấu hình tập trung: việc chọn cài đặt nào nằm ở một nơi duy nhất gọi là composition root."
        ]
      },
      {
        h: "DI thủ công trước, container sau",
        p: [
          "Bạn không cần framework để làm DI. Constructor injection cộng một file `main.ts` lắp ráp các đối tượng là đủ cho dự án nhỏ và giúp bạn hiểu rõ cơ chế."
        ],
        code: {
          lang: "typescript", file: "src/users/user.service.test.ts",
          src: `import { describe, it, expect } from "vitest";

interface UserRepository {
  findByEmail(email: string): Promise<{ id: string; email: string } | null>;
  create(email: string): Promise<{ id: string; email: string }>;
}

class UserService {
  constructor(private readonly repo: UserRepository) {}
  async register(email: string) {
    if (await this.repo.findByEmail(email)) throw new Error("EMAIL_TAKEN");
    return this.repo.create(email);
  }
}

class InMemoryUserRepo implements UserRepository {
  private rows: { id: string; email: string }[] = [];
  async findByEmail(email: string) { return this.rows.find((r) => r.email === email) ?? null; }
  async create(email: string) { const u = { id: String(this.rows.length + 1), email }; this.rows.push(u); return u; }
}

describe("UserService.register", () => {
  it("từ chối email trùng", async () => {
    const service = new UserService(new InMemoryUserRepo()); // tiêm bản giả
    await service.register("a@x.dev");
    await expect(service.register("a@x.dev")).rejects.toThrow("EMAIL_TAKEN");
  });
});`
        }
      },
      {
        h: "DI container trong NestJS",
        p: [
          "Khi ứng dụng có hàng chục service, lắp ráp thủ công trở nên dài dòng. DI container tự tạo đối tượng và phụ thuộc của nó theo đúng thứ tự. NestJS có container dựng sẵn: bạn đánh dấu class bằng `@Injectable()`, khai báo nó trong `providers` của module, và Nest đọc kiểu tham số constructor để tiêm vào. Mặc định mỗi provider là singleton trong phạm vi ứng dụng.",
          "Interface của TypeScript biến mất lúc chạy nên Nest không dùng nó làm khóa được. Khi muốn tiêm theo abstraction, bạn dùng một token (string hoặc Symbol) với `@Inject(TOKEN)` và khai báo `useClass` hoặc `useValue` trong module. Trong test, `Test.createTestingModule` cho phép ghi đè provider bằng bản giả."
        ],
        code: {
          lang: "typescript", file: "src/users/users.module.ts",
          src: `import { Inject, Injectable, Module } from "@nestjs/common";

export const USER_REPO = Symbol("USER_REPO");
export interface UserRepository { findByEmail(email: string): Promise<unknown>; }

@Injectable()
export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) { return null; /* truy vấn DB thật */ }
}

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPO) private readonly repo: UserRepository) {}
}

@Module({
  providers: [UsersService, { provide: USER_REPO, useClass: PrismaUserRepository }],
  exports: [UsersService],
})
export class UsersModule {}`
        }
      }
    ],
    summary: [
      "DI: đối tượng nhận phụ thuộc từ bên ngoài thay vì tự tạo.",
      "Lợi ích chính là test được bằng bản giả và cấu hình tập trung ở composition root.",
      "DI thủ công bằng constructor là đủ cho dự án nhỏ; container giúp khi có nhiều phụ thuộc.",
      "NestJS tiêm theo kiểu class; muốn tiêm theo interface cần token với `@Inject`."
    ],
    pitfalls: [
      "Gọi `new` phụ thuộc bên trong service, khiến không thể thay bằng bản giả khi test.",
      "Tiêm theo interface trong NestJS mà không có token, gặp lỗi Nest không resolve được dependency vì interface không tồn tại lúc chạy.",
      "Phụ thuộc vòng giữa hai service (A cần B, B cần A). Thường là dấu hiệu nên tách phần chung ra service thứ ba thay vì dùng `forwardRef`."
    ],
    quiz: [
      {
        q: "Lợi ích lớn nhất của DI khi viết unit test là gì?",
        options: ["Test chạy trên nhiều thread", "Có thể truyền bản giả cho phụ thuộc, test logic mà không cần database hay API thật", "Không cần viết assertion", "Tự sinh test case"],
        answer: 1,
        explain: "Vì phụ thuộc đến từ bên ngoài, test tự quyết định truyền cài đặt nào. DI không liên quan tới đa luồng hay tự sinh test."
      },
      {
        q: "Vì sao trong NestJS bạn cần token như `@Inject(USER_REPO)` khi tiêm theo interface?",
        options: ["Vì interface chậm", "Vì interface bị xóa khi biên dịch nên không có giá trị lúc chạy để làm khóa tra cứu", "Vì Nest cấm dùng interface", "Vì token giúp mã hóa dữ liệu"],
        answer: 1,
        explain: "Container cần một giá trị runtime làm khóa. Class tồn tại lúc chạy nên dùng được trực tiếp, còn interface thì không."
      },
      {
        q: "Composition root là gì?",
        options: ["Thư mục gốc của dự án", "Nơi duy nhất lắp ráp các đối tượng và chọn cài đặt cụ thể cho từng phụ thuộc", "Class cha của mọi service", "File cấu hình database"],
        answer: 1,
        explain: "Composition root là điểm lắp ráp đồ thị đối tượng, thường gần điểm khởi động như `main.ts` hoặc module gốc của Nest."
      }
    ]
  },

  "p01.m3.t4": {
    sections: [
      {
        h: "Pure function và immutability",
        p: [
          "Pure function là hàm với cùng đầu vào luôn cho cùng đầu ra, và không có side effect: không sửa biến bên ngoài, không ghi database, không đọc giờ hệ thống hay số ngẫu nhiên. Hàm thuần dễ test nhất có thể: không cần mock, chỉ cần gọi và so sánh kết quả. Nó cũng an toàn khi cache kết quả hoặc chạy song song.",
          "Immutability là không sửa dữ liệu đã có mà tạo bản mới. Kết hợp hai ý này, bạn có được logic nghiệp vụ tách biệt khỏi I/O."
        ]
      },
      {
        h: "Higher-order function và composition",
        p: [
          "Higher-order function là hàm nhận hàm làm tham số hoặc trả về hàm. `map`, `filter`, `reduce` là ví dụ quen thuộc. Middleware của Express hay hàm `withRetry(fn)` cũng vậy.",
          "Function composition là ghép các hàm nhỏ thành pipeline: đầu ra của hàm này là đầu vào của hàm kế tiếp. Mỗi bước nhỏ, dễ đặt tên và test riêng."
        ],
        code: {
          lang: "typescript", file: "src/pricing.ts",
          src: `type Cart = { items: { price: number; qty: number }[]; coupon?: string };

// Các hàm thuần: không I/O, không mutate
const subtotal = (c: Cart) => c.items.reduce((s, i) => s + i.price * i.qty, 0);
const applyCoupon = (coupon?: string) => (amount: number) =>
  coupon === "SALE10" ? Math.round(amount * 0.9) : amount;
const addVat = (rate: number) => (amount: number) => Math.round(amount * (1 + rate));

const pipe = <T>(...fns: ((x: T) => T)[]) => (x: T) => fns.reduce((acc, f) => f(acc), x);

export function total(cart: Cart): number {
  return pipe<number>(applyCoupon(cart.coupon), addVat(0.1))(subtotal(cart));
}

console.log(total({ items: [{ price: 100_000, qty: 2 }], coupon: "SALE10" })); // 198000`
        }
      },
      {
        h: "Functional core, imperative shell",
        p: [
          "Code backend không thể thuần hoàn toàn: nó phải đọc database, gọi API, ghi log. Mẫu thực dụng là 'functional core, imperative shell'. Phần lõi chứa quy tắc nghiệp vụ dưới dạng hàm thuần: nhận dữ liệu, trả quyết định. Lớp vỏ bên ngoài lo I/O: đọc dữ liệu, gọi lõi, rồi thực thi kết quả.",
          "Ví dụ: hàm thuần `decideRefund(order, now)` trả về `{ approve: true, amount }` hoặc lý do từ chối. Service đọc order từ DB, truyền thời gian hiện tại vào như một tham số, gọi hàm và ghi kết quả. Toàn bộ quy tắc hoàn tiền phức tạp được test bằng hàng chục ca kiểm thử mà không cần mock gì. Mẹo quan trọng là truyền thời gian và dữ liệu ngẫu nhiên vào hàm như tham số, thay vì gọi `Date.now()` bên trong."
        ]
      }
    ],
    summary: [
      "Pure function: cùng đầu vào cho cùng đầu ra, không side effect; dễ test và an toàn khi cache.",
      "Higher-order function nhận hoặc trả về hàm; composition ghép hàm nhỏ thành pipeline.",
      "Functional core, imperative shell: quy tắc nghiệp vụ thuần ở lõi, I/O ở lớp vỏ.",
      "Truyền thời gian và giá trị ngẫu nhiên vào như tham số để giữ hàm thuần."
    ],
    pitfalls: [
      "Gọi `Date.now()` hoặc `Math.random()` trong logic nghiệp vụ khiến test không ổn định. Hãy truyền vào như tham số.",
      "Lạm dụng composition và point-free style đến mức code khó đọc với người mới. Tên hàm rõ ràng quan trọng hơn sự gọn gàng.",
      "Nghĩ rằng FP và OOP loại trừ nhau. Trong TypeScript, class service dùng hàm thuần bên trong là cách kết hợp phổ biến."
    ],
    quiz: [
      {
        q: "Hàm nào là pure function?",
        options: ["`(x) => { console.log(x); return x; }`", "`(a, b) => a + b`", "`() => Date.now()`", "`(u) => { u.age++; return u; }`"],
        answer: 1,
        explain: "`a + b` chỉ phụ thuộc đầu vào và không có side effect. Log là side effect, `Date.now()` cho kết quả khác nhau mỗi lần, còn mutate `u` sửa dữ liệu bên ngoài."
      },
      {
        q: "Trong mẫu 'functional core, imperative shell', lời gọi database nằm ở đâu?",
        options: ["Trong lõi thuần", "Ở lớp vỏ bên ngoài, bao quanh lõi", "Trong mọi hàm", "Trong hàm compose"],
        answer: 1,
        explain: "Lõi chỉ chứa quyết định thuần. Mọi I/O như database được đẩy ra lớp vỏ để lõi dễ test."
      },
      {
        q: "`const applyCoupon = (coupon) => (amount) => ...` là ví dụ của gì?",
        options: ["Recursion", "Higher-order function trả về hàm (currying)", "Side effect", "Class"],
        answer: 1,
        explain: "Hàm ngoài nhận `coupon` và trả về một hàm mới nhận `amount`. Kỹ thuật này giúp tạo các bước cấu hình sẵn để ghép vào pipeline."
      }
    ]
  },

  "p01.m3.t5": {
    sections: [
      {
        h: "Code được đọc nhiều hơn được viết",
        p: [
          "Mỗi dòng code sẽ được đọc lại nhiều lần: khi review, khi debug, khi thêm tính năng. Clean code là code mà người khác, hoặc chính bạn sáu tháng sau, hiểu nhanh và sửa an toàn."
        ],
        list: [
          "Đặt tên theo ý nghĩa nghiệp vụ: `activeSubscribers` thay vì `list2`, `isExpired` cho boolean, động từ cho hàm như `calculateInvoice`.",
          "Hàm ngắn, làm một việc, ít tham số. Hơn 3 tham số thì gom thành một object có tên trường.",
          "Return sớm (guard clause) thay cho `if` lồng nhiều tầng.",
          "Tránh side effect ẩn: hàm tên `getUser` không được âm thầm ghi log audit hay cập nhật `lastSeen`.",
          "Comment giải thích 'vì sao', không lặp lại 'cái gì' mà code đã nói rõ.",
          "Thay magic number bằng hằng có tên: `MAX_LOGIN_ATTEMPTS = 5`."
        ]
      },
      {
        h: "Code smells hay gặp",
        p: [
          "Code smell là dấu hiệu bề mặt gợi ý vấn đề thiết kế sâu hơn. Nó không phải bug, nhưng làm code khó thay đổi. Các smell phổ biến: hàm dài hàng trăm dòng, class ôm quá nhiều việc (god class), code trùng lặp, danh sách tham số dài, dùng primitive cho khái niệm nghiệp vụ (tiền, email chỉ là `string` và `number` trần), `switch` theo kiểu lặp lại ở nhiều nơi, và shotgun surgery: một thay đổi nhỏ phải sửa ở mười file."
        ],
        code: {
          lang: "typescript", file: "src/refactor-example.ts",
          src: `type User = { active: boolean; emailVerified: boolean; plan: string };

// Trước: if lồng nhau, magic value
function canExport1(u: User | null) {
  if (u) {
    if (u.active) {
      if (u.emailVerified) {
        if (u.plan === "pro" || u.plan === "team") return true;
      }
    }
  }
  return false;
}

// Sau: guard clause, hằng có tên, tên rõ nghĩa
const PLANS_WITH_EXPORT = new Set(["pro", "team"]);

function canExport(user: User | null): boolean {
  if (!user?.active) return false;
  if (!user.emailVerified) return false;
  return PLANS_WITH_EXPORT.has(user.plan);
}`
        }
      },
      {
        h: "Refactor an toàn nhờ test",
        p: [
          "Refactoring là thay đổi cấu trúc code mà không đổi hành vi bên ngoài. Điều kiện tiên quyết là có test bao quanh phần sắp sửa. Với code cũ chưa có test, hãy viết characterization test trước: ghi lại hành vi hiện tại, kể cả hành vi trông lạ, rồi mới refactor.",
          "Quy trình an toàn: bước nhỏ, chạy test sau mỗi bước, commit thường xuyên. Tách refactor và thay đổi tính năng thành các commit hoặc PR riêng để review dễ dàng. Dùng công cụ refactor của IDE (rename, extract function, move file) thay vì sửa tay. Quy tắc hướng đạo sinh: rời khỏi đoạn code sạch hơn một chút so với lúc bạn đến."
        ]
      }
    ],
    summary: [
      "Đặt tên theo nghiệp vụ, hàm ngắn, guard clause, không side effect ẩn.",
      "Code smell là dấu hiệu thiết kế cần cải thiện: hàm dài, god class, trùng lặp, primitive obsession.",
      "Refactor là đổi cấu trúc, không đổi hành vi; cần test bao quanh trước khi bắt đầu.",
      "Làm từng bước nhỏ, chạy test liên tục, tách commit refactor khỏi commit tính năng."
    ],
    pitfalls: [
      "Refactor lớn cùng lúc với thêm tính năng trong một PR, khiến review không phân biệt được đâu là thay đổi hành vi.",
      "Refactor code chưa có test rồi vô tình đổi hành vi mà không ai biết. Viết characterization test trước.",
      "Viết comment mô tả lại từng dòng code thay vì đặt tên tốt hơn; comment sẽ lỗi thời khi code đổi."
    ],
    quiz: [
      {
        q: "Refactoring được định nghĩa là gì?",
        options: ["Viết lại toàn bộ từ đầu", "Thay đổi cấu trúc bên trong mà không thay đổi hành vi bên ngoài", "Thêm tính năng mới", "Sửa bug hiệu năng"],
        answer: 1,
        explain: "Refactoring giữ nguyên hành vi, chỉ cải thiện cấu trúc. Viết lại từ đầu hay thêm tính năng đều thay đổi phạm vi và rủi ro."
      },
      {
        q: "Trước khi refactor một module cũ không có test, bạn nên làm gì?",
        options: ["Xóa module và viết lại", "Viết characterization test ghi lại hành vi hiện tại", "Refactor rồi nhờ QA kiểm tra sau", "Tắt linter"],
        answer: 1,
        explain: "Characterization test là lưới an toàn, báo ngay khi hành vi thay đổi. Kiểm tra thủ công sau cùng dễ sót và chậm."
      },
      {
        q: "Hàm `getUser(id)` ngoài việc trả user còn cập nhật `lastSeenAt` trong database. Vấn đề là gì?",
        options: ["Hàm quá ngắn", "Side effect ẩn: tên hàm không cho biết nó ghi dữ liệu", "Tham số quá nhiều", "Không dùng generic"],
        answer: 1,
        explain: "Người gọi `getUser` mong đợi một thao tác đọc. Việc ghi ẩn gây bất ngờ, ví dụ khi gọi hàm này trong job báo cáo. Hãy tách thành hàm riêng có tên rõ."
      }
    ]
  },
});
