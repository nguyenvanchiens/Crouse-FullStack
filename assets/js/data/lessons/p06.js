/* Nội dung bài học chương p06 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p06.m0.t0": {
    videos: [
      { id: "YaXJeUkBe4Y", title: "5 Types of Testing Software Every Developer Needs to Know!", channel: "Alex Hyett", lang: "en", minutes: 6, embed: true }
    ],
    sections: [
      {
        h: "Vì sao cần chiến lược kiểm thử",
        p: [
          "Mục tiêu của test không phải là có thật nhiều test, mà là tự tin deploy mà không sợ hỏng. Mỗi loại test có chi phí khác nhau: thời gian viết, thời gian chạy, độ \"giòn\" (hay vỡ khi đổi code không liên quan) và mức độ tin cậy nó mang lại. Chiến lược kiểm thử là cách phân bổ công sức để đạt độ tin cậy cao nhất với chi phí hợp lý.",
          "Khi CI/CD tự deploy mỗi lần merge, bộ test chính là người gác cổng. Bộ test chậm thì mọi người né chạy; bộ test hay fail ngẫu nhiên (flaky) thì mọi người bấm chạy lại cho tới khi xanh, và nó mất giá trị."
        ]
      },
      {
        h: "Test pyramid",
        p: [
          "Mô hình kim tự tháp (Mike Cohn) gợi ý: đáy rộng là unit test (nhiều, nhanh, rẻ), giữa là integration test (ít hơn, kiểm tra các thành phần làm việc cùng nhau), đỉnh hẹp là e2e test (ít nhất, chậm, đắt nhưng giống người dùng thật nhất)."
        ],
        list: [
          "Unit: kiểm tra một hàm hoặc class, không I/O, chạy tính bằng mili giây.",
          "Integration: kiểm tra code với database, Redis, message queue thật, chạy tính bằng giây.",
          "E2E: gọi hệ thống qua HTTP hoặc giao diện như người dùng, chạy tính bằng giây tới phút."
        ]
      },
      {
        h: "Test trophy và cách áp dụng cho backend",
        p: [
          "Mô hình trophy (Kent C. Dodds) có bốn tầng: static (TypeScript, ESLint), unit, integration, e2e, và nhấn mạnh integration là phần lớn nhất. Lý do: rất nhiều lỗi backend nằm ở chỗ nối, như query SQL sai, migration thiếu cột, transaction không đúng, mà unit test với mock không bắt được.",
          "Với một API NestJS + PostgreSQL, cách phân bổ thực tế thường là: logic nghiệp vụ thuần (tính giá, kiểm tra trạng thái) viết unit test kỹ; repository và luồng quan trọng viết integration test với Postgres thật qua Testcontainers; vài e2e test cho luồng sống còn như đăng ký, đăng nhập, tạo đơn."
        ],
        code: {
          lang: "text",
          file: "test-layout.txt",
          src: `src/
  tasks/
    task.policy.ts
    task.policy.spec.ts          # unit: quy tắc nghiệp vụ thuần
    tasks.repository.ts
    tasks.repository.int.spec.ts # integration: Postgres thật (Testcontainers)
test/
  tasks.e2e-spec.ts              # e2e: HTTP qua Supertest
  load/tasks.k6.js               # load test: chạy riêng, không chạy mỗi commit`
        }
      }
    ],
    summary: [
      "Chiến lược kiểm thử là phân bổ công sức để có độ tin cậy cao với chi phí hợp lý.",
      "Pyramid: nhiều unit, ít integration hơn, ít e2e nhất.",
      "Trophy: thêm tầng static và nhấn mạnh integration, rất hợp với backend có DB.",
      "Bộ test phải nhanh và ổn định thì CI/CD mới đáng tin."
    ],
    pitfalls: [
      "Kim tự tháp ngược: phần lớn là e2e chậm và flaky, ít unit và integration.",
      "Chỉ có unit test với mock DB, pass hết nhưng production lỗi vì query SQL sai.",
      "Chấp nhận test flaky và bấm chạy lại; hãy cách ly và sửa ngay, nếu không cả bộ test mất uy tín."
    ],
    quiz: [
      {
        q: "Theo test pyramid, loại test nào nên có nhiều nhất?",
        options: ["E2E test", "Unit test", "Manual test", "Load test"],
        answer: 1,
        explain: "Unit test nhanh và rẻ nên chiếm phần đáy rộng. E2E chậm và đắt nên ở đỉnh hẹp."
      },
      {
        q: "Vì sao mô hình trophy nhấn mạnh integration test cho backend?",
        options: ["Vì integration test luôn chạy nhanh hơn unit test", "Vì nhiều lỗi nằm ở chỗ nối với DB, mock không bắt được", "Vì đã có integration test thì bỏ hẳn unit test", "Vì e2e test không chạy được trong pipeline CI"],
        answer: 1,
        explain: "Query sai, migration thiếu, transaction lỗi chỉ lộ ra khi chạy với DB thật. Unit test vẫn cần, chỉ không phải phần duy nhất."
      },
      {
        q: "Tầng static trong test trophy gồm những gì?",
        options: ["Load test với k6", "Type check và lint", "Test giao diện bằng trình duyệt", "Snapshot test cho response"],
        answer: 1,
        explain: "Static analysis (TypeScript, ESLint) bắt lỗi kiểu và lỗi phổ biến mà không cần chạy code, là lớp phòng thủ rẻ nhất. Load test, test giao diện và snapshot test đều phải chạy code."
      }
    ]
  },

  "p06.m0.t1": {
    videos: [
      { id: "lgkyhEHIC_c", title: "Code không bug cùng với Unit Test và Automation Testing - Code Cùng Code Dạo", channel: "Phạm Huy Hoàng", lang: "vi", minutes: 9, embed: true },
      { id: "XdDZKeM5_pQ", title: "Unit Testing (Vitest) Tutorial #1 - What is Unit Testing?", channel: "Net Ninja", lang: "en", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Unit test là gì và nên test cái gì",
        p: [
          "Unit test kiểm tra một đơn vị logic nhỏ, thường là một hàm hoặc class, tách khỏi I/O. Nó chạy rất nhanh nên bạn chạy được liên tục khi code (watch mode). Nơi đáng viết unit test nhất là logic nghiệp vụ có nhiều nhánh: tính tiền, kiểm tra chuyển trạng thái, phân quyền, xử lý ngày giờ.",
          "Vitest và Jest là hai test runner phổ biến trong hệ sinh thái TypeScript. Vitest nhanh, hỗ trợ ESM và TypeScript tốt, API gần như tương thích Jest. NestJS mặc định sinh cấu hình Jest, nhưng chuyển sang Vitest cũng khá phổ biến."
        ]
      },
      {
        h: "Mẫu AAA",
        p: [
          "Mỗi test gồm ba phần rõ ràng: Arrange (chuẩn bị dữ liệu, đối tượng), Act (gọi hành vi cần test, thường chỉ một dòng), Assert (kiểm tra kết quả). Cấu trúc này giúp test dễ đọc, và người khác nhìn vào là biết test đang kiểm tra điều gì."
        ],
        code: {
          lang: "typescript",
          file: "src/tasks/task.policy.spec.ts",
          src: `import { describe, it, expect } from 'vitest';
import { canTransition, TaskStatus } from './task.policy';

describe('canTransition', () => {
  it('cho phép chuyển từ TODO sang IN_PROGRESS', () => {
    // Arrange
    const from: TaskStatus = 'TODO';
    // Act
    const result = canTransition(from, 'IN_PROGRESS');
    // Assert
    expect(result).toBe(true);
  });

  it('không cho mở lại task đã DONE', () => {
    expect(canTransition('DONE', 'TODO')).toBe(false);
  });

  it.each([
    ['TODO', 'DONE', false],
    ['IN_PROGRESS', 'DONE', true],
  ] as const)('%s -> %s trả về %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });
});`
        }
      },
      {
        h: "Đặt tên test mô tả hành vi",
        p: [
          "Tên test nên nói hành vi mong đợi từ góc nhìn nghiệp vụ, không nói chi tiết cài đặt. Khi test fail trong CI, chỉ đọc tên là biết quy tắc nào bị vi phạm."
        ],
        list: [
          "Tốt: `từ chối tạo task khi tiêu đề rỗng`, `tính phí ship 0 đồng cho đơn trên 500.000đ`.",
          "Kém: `test1`, `should work`, `gọi hàm validate`.",
          "Test hành vi công khai (input, output), không test hàm private hay số lần gọi nội bộ, để refactor không làm vỡ test.",
          "Mỗi test độc lập, không phụ thuộc thứ tự chạy hay trạng thái để lại từ test trước."
        ]
      },
      {
        h: "Chạy test",
        code: {
          lang: "bash",
          file: "terminal",
          src: `npm i -D vitest
npx vitest              # watch mode khi dev
npx vitest run          # chạy một lần (dùng trong CI)
npx vitest run task.policy   # lọc theo tên file`
        },
        p: [
          "Để test dễ viết, hãy tách logic thuần khỏi code I/O. Hàm nhận dữ liệu và trả kết quả dễ test hơn nhiều so với hàm vừa query DB vừa tính toán vừa gửi email."
        ]
      }
    ],
    summary: [
      "Unit test kiểm tra logic nhỏ, không I/O, chạy rất nhanh.",
      "Mẫu AAA: Arrange, Act, Assert giúp test rõ ràng.",
      "Tên test mô tả hành vi nghiệp vụ; test qua interface công khai.",
      "Tách logic thuần khỏi I/O để code dễ test."
    ],
    pitfalls: [
      "Test chi tiết cài đặt (hàm private, số lần gọi nội bộ), khiến mỗi lần refactor là hàng loạt test vỡ dù hành vi không đổi.",
      "Test phụ thuộc lẫn nhau qua biến dùng chung, pass khi chạy cả file nhưng fail khi chạy riêng.",
      "Một test kiểm tra quá nhiều thứ, khi fail không biết lỗi ở đâu."
    ],
    quiz: [
      {
        q: "Trong mẫu AAA, bước Act thường là gì?",
        options: ["Tạo dữ liệu giả", "Gọi hành vi cần kiểm tra", "Kiểm tra kết quả", "Dọn dẹp database"],
        answer: 1,
        explain: "Arrange chuẩn bị, Act thực hiện hành vi (thường một dòng), Assert kiểm tra kết quả."
      },
      {
        q: "Tên test nào tốt nhất?",
        options: ["`test createTask`", "`should work`", "`từ chối tạo task khi tiêu đề rỗng`", "`gọi validateTitle 1 lần`"],
        answer: 2,
        explain: "Tên mô tả hành vi nghiệp vụ và kết quả mong đợi. Tên về số lần gọi hàm là chi tiết cài đặt, dễ vỡ khi refactor."
      },
      {
        q: "Code nào dễ viết unit test nhất?",
        options: ["Hàm vừa query DB, vừa tính toán, vừa gửi email", "Hàm thuần chỉ nhận input và trả output", "Controller gắn nhiều decorator và guard", "Script migration thay đổi schema DB"],
        answer: 1,
        explain: "Hàm thuần không có I/O nên không cần mock, kết quả chỉ phụ thuộc input. Đó là lý do nên tách logic nghiệp vụ khỏi I/O."
      }
    ]
  },

  "p06.m0.t2": {
    videos: [
      { id: "NPp2pvhGbkM", title: "Unit Tests and Test Doubles like Mocks, Stubs & Fakes", channel: "The Theory Of Code", lang: "en", minutes: 18, embed: true }
    ],
    sections: [
      {
        h: "Bốn loại test double",
        p: [
          "Test double là đối tượng thay thế phụ thuộc thật trong test. Các thuật ngữ hay bị dùng lẫn, nhưng phân biệt được giúp bạn chọn đúng công cụ:"
        ],
        list: [
          "Stub: trả về dữ liệu dựng sẵn, ví dụ API tỷ giá luôn trả 25.000. Dùng để điều khiển đầu vào gián tiếp.",
          "Spy: ghi lại cách nó được gọi (tham số, số lần) để kiểm tra sau. Có thể bọc hàm thật.",
          "Mock: đối tượng được lập trình sẵn kỳ vọng về cách gọi, test fail nếu không được gọi đúng. Trong Vitest/Jest, `vi.fn()` vừa là stub vừa là spy vừa là mock.",
          "Fake: bản cài đặt đơn giản nhưng chạy thật, ví dụ repository lưu trong `Map` thay vì PostgreSQL, hoặc SMTP server giả như Mailpit."
        ]
      },
      {
        h: "Mock ở biên hệ thống",
        p: [
          "Nguyên tắc: mock những thứ bạn không kiểm soát và ở rìa hệ thống: API thanh toán, gửi email, SMS, dịch vụ bên thứ ba, đồng hồ hệ thống. Không mock code của chính bạn ở giữa (service gọi service), và cân nhắc không mock database, vì đó là nơi hay có lỗi nhất.",
          "Test mock quá nhiều thường chỉ kiểm tra rằng \"code gọi đúng những gì code gọi\", pass khi logic sai và vỡ khi refactor."
        ],
        code: {
          lang: "typescript",
          file: "src/orders/order.service.spec.ts",
          src: `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderService } from './order.service';

describe('OrderService.confirm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00Z')); // cố định "bây giờ"
  });
  afterEach(() => vi.useRealTimers());

  it('gửi email xác nhận với đúng địa chỉ khách', async () => {
    const mailer = { send: vi.fn().mockResolvedValue(undefined) };       // mock biên
    const repo = { markConfirmed: vi.fn().mockResolvedValue({ id: 1, email: 'a@x.vn' }) };
    const service = new OrderService(repo, mailer);

    const order = await service.confirm(1);

    expect(order.confirmedAt).toEqual(new Date('2026-01-15T10:00:00Z'));
    expect(mailer.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@x.vn', template: 'order-confirmed' }),
    );
  });
});`
        }
      },
      {
        h: "Mock HTTP ở tầng mạng",
        p: [
          "Thay vì mock từng hàm client HTTP, bạn có thể chặn ở tầng mạng bằng thư viện như MSW (Mock Service Worker, có hỗ trợ Node.js) hoặc nock. Code thật của bạn vẫn chạy, bao gồm cả việc tạo URL, header, parse JSON; chỉ có response là giả. Cách này bắt được nhiều lỗi hơn và ít phụ thuộc cài đặt hơn.",
          "Với fake, hãy đảm bảo fake cư xử giống thật ở những điểm quan trọng. Một cách tốt là chạy cùng một bộ test hợp đồng trên cả fake và bản thật."
        ]
      }
    ],
    summary: [
      "Stub trả dữ liệu dựng sẵn, spy ghi lại lời gọi, mock kiểm tra kỳ vọng, fake là bản cài đặt đơn giản chạy thật.",
      "Mock ở biên hệ thống: API ngoài, email, thời gian; hạn chế mock code nội bộ.",
      "Dùng fake timer để test code phụ thuộc thời gian một cách ổn định.",
      "Mock HTTP ở tầng mạng (MSW, nock) để code thật được chạy nhiều hơn."
    ],
    pitfalls: [
      "Mock mọi phụ thuộc, test chỉ còn xác nhận các lời gọi hàm và không phát hiện được lỗi logic thật.",
      "Quên khôi phục mock hoặc fake timer giữa các test (`vi.restoreAllMocks()`, `vi.useRealTimers()`), làm test sau bị ảnh hưởng.",
      "Mock DB bằng hàm trả dữ liệu cứng, bỏ sót lỗi SQL, ràng buộc unique và transaction."
    ],
    quiz: [
      {
        q: "Bạn muốn kiểm tra hàm `sendWelcome` được gọi với đúng email. Loại test double nào phù hợp?",
        options: ["Fake database", "Spy hoặc mock", "Stub trả dữ liệu cố định", "Không cần test double"],
        answer: 1,
        explain: "Spy/mock ghi lại tham số và số lần gọi để assert. Stub chỉ cung cấp dữ liệu, không kiểm tra cách được gọi."
      },
      {
        q: "Nên mock thành phần nào trong unit test của một service tạo đơn hàng?",
        options: ["Hàm tính tổng tiền nội bộ của service", "Cổng thanh toán bên thứ ba và dịch vụ email", "Toàn bộ class của chính service đang test", "Không mock gì, gọi cả cổng thanh toán thật"],
        answer: 1,
        explain: "Cổng thanh toán và email là biên hệ thống, chậm, tốn tiền, không kiểm soát được. Logic nội bộ nên được chạy thật."
      },
      {
        q: "Cách test ổn định một hàm tính \"hết hạn sau 24 giờ\"?",
        options: ["Cho test chờ thật 24 giờ bằng `sleep`", "Dùng fake timer và `vi.setSystemTime`", "Bỏ qua test này trong CI cho nhanh", "Lên lịch chạy test đúng lúc nửa đêm"],
        answer: 1,
        explain: "Cố định thời gian giúp test cho cùng kết quả mọi lúc và chạy tức thì. Phụ thuộc giờ thật khiến test flaky."
      }
    ]
  },

  "p06.m0.t3": {
    videos: [
      { id: "sNg0bnMF_qY", title: "Testcontainers have forever changed the way I write tests", channel: "Dreams of Code", lang: "en", minutes: 12, embed: true }
    ],
    sections: [
      {
        h: "Vì sao dùng database thật khi test",
        p: [
          "Mock DB không kiểm tra được câu SQL có đúng không, index unique có chặn trùng không, migration có chạy được không, hay transaction có rollback đúng không. SQLite in-memory cũng không thay được PostgreSQL vì khác kiểu dữ liệu, khác hành vi JSONB, khác cách khoá.",
          "Testcontainers là thư viện khởi động container Docker thật (PostgreSQL, Redis, Kafka...) ngay trong code test, trả về thông tin kết nối, và tự dọn khi xong. Mỗi lần chạy test bạn có một môi trường sạch, giống production, mà không cần cài gì ngoài Docker."
        ]
      },
      {
        h: "Integration test cho repository",
        p: [
          "Ví dụ dưới đây khởi động PostgreSQL 18 một lần cho cả file, chạy migration thật, và làm sạch bảng trước mỗi test. Điểm đáng chú ý là test thứ hai: nó kiểm tra ràng buộc unique do database thực thi, thứ mà mock repository không bao giờ phát hiện được."
        ],
        code: {
          lang: "typescript",
          file: "src/tasks/tasks.repository.int.spec.ts",
          src: `import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { TasksRepository } from './tasks.repository';
import { runMigrations } from '../db/migrate';

let container: StartedPostgreSqlContainer;
let pool: Pool;
let repo: TasksRepository;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18-alpine').start();
  pool = new Pool({ connectionString: container.getConnectionUri() });
  await runMigrations(pool);            // chạy migration thật
  repo = new TasksRepository(pool);
}, 60_000);                              // lần đầu cần thời gian kéo image

afterAll(async () => {
  await pool.end();
  await container.stop();
});

beforeEach(async () => {
  await pool.query('TRUNCATE tasks RESTART IDENTITY CASCADE'); // mỗi test một DB sạch
});

describe('TasksRepository', () => {
  it('tạo và đọc lại task', async () => {
    const created = await repo.create({ title: 'Viết test', ownerId: 1 });
    expect(await repo.findById(created.id)).toMatchObject({ title: 'Viết test' });
  });

  it('chặn trùng tiêu đề trong cùng owner (ràng buộc unique)', async () => {
    await repo.create({ title: 'A', ownerId: 1 });
    await expect(repo.create({ title: 'A', ownerId: 1 })).rejects.toThrow();
  });
});`
        }
      },
      {
        h: "Tốc độ và cách tổ chức",
        p: [
          "Khởi động container mất vài giây, nên hãy khởi động một lần cho cả file hoặc cả bộ test (dùng `globalSetup` của Vitest), rồi làm sạch dữ liệu giữa các test bằng `TRUNCATE` hoặc bọc mỗi test trong transaction rồi rollback. Dùng cùng phiên bản image với production, ví dụ `postgres:18-alpine`.",
          "Redis cũng làm tương tự với `@testcontainers/redis`. Trong GitHub Actions, runner Ubuntu có sẵn Docker nên Testcontainers chạy được ngay."
        ],
        list: [
          "Tách lệnh chạy: `vitest run` cho unit (nhanh), và một project hoặc lệnh riêng cho `*.int.spec.ts`.",
          "Không dùng chung DB giữa các test chạy song song; mỗi worker nên có database hoặc schema riêng.",
          "Đặt timeout đủ dài cho `beforeAll` vì lần đầu phải kéo image."
        ]
      }
    ],
    summary: [
      "Integration test với DB thật bắt lỗi SQL, ràng buộc, migration và transaction mà mock bỏ sót.",
      "Testcontainers khởi động container thật trong code test và tự dọn.",
      "Dùng cùng phiên bản image với production, chạy migration thật trước khi test.",
      "Khởi động container một lần, làm sạch dữ liệu giữa các test để vừa nhanh vừa độc lập."
    ],
    pitfalls: [
      "Dùng SQLite in-memory thay PostgreSQL rồi gặp lỗi khác biệt hành vi ở production.",
      "Khởi động container mới cho từng test, bộ test chậm tới mức không ai muốn chạy.",
      "Không dọn dữ liệu giữa các test, kết quả phụ thuộc thứ tự chạy."
    ],
    quiz: [
      {
        q: "Lỗi nào integration test với Postgres thật bắt được nhưng unit test mock repository thì không?",
        options: ["Sai logic trong hàm tính tổng tiền", "Vi phạm ràng buộc unique hoặc SQL sai", "Tên biến khó hiểu, không đúng quy ước", "Code sai định dạng so với Prettier"],
        answer: 1,
        explain: "Chỉ DB thật mới thực thi SQL và ràng buộc. Logic tính tiền thuần thì unit test đã đủ."
      },
      {
        q: "Cách tổ chức Testcontainers hợp lý về tốc độ?",
        options: ["Khởi động container mới cho từng test", "Một container cho cả file, dọn dữ liệu giữa các test", "Dùng chung database staging cho mọi test", "Một container, không bao giờ dọn dữ liệu"],
        answer: 1,
        explain: "Khởi động container tốn vài giây, dọn bằng TRUNCATE hoặc rollback thì chỉ tốn mili giây. DB staging chung khiến test ảnh hưởng lẫn nhau."
      },
      {
        q: "Testcontainers cần gì để chạy trong CI?",
        options: ["PostgreSQL cài sẵn trên runner", "Docker hoặc runtime tương thích", "Một cluster Kubernetes", "Tài khoản cloud có quyền tạo VM"],
        answer: 1,
        explain: "Testcontainers điều khiển Docker để chạy container. Runner Ubuntu của GitHub Actions có sẵn Docker."
      }
    ]
  },

  "p06.m0.t4": {
    videos: [
      { id: "FKnzS_icp20", title: "Testing Node Server with Jest and Supertest", channel: "Sam Meech-Ward", lang: "en", minutes: 12, embed: true }
    ],
    sections: [
      {
        h: "API e2e test kiểm tra gì",
        p: [
          "API e2e test gửi request HTTP thật vào ứng dụng đầy đủ: routing, middleware, guard xác thực, validation pipe, service, database. Nó kiểm tra hợp đồng mà client nhìn thấy: status code, body, header. Đây là lớp bắt lỗi cấu hình, như quên gắn guard, sai prefix route, DTO validation không bật.",
          "Supertest nhận một HTTP server Node.js và cho phép gọi nó mà không cần mở cổng thật. Kết hợp với Testcontainers, bạn có môi trường gần như production ngay trong test.",
          "Vì e2e test chậm hơn unit test, hãy tập trung vào hợp đồng và luồng quan trọng, không lặp lại mọi trường hợp biên của logic nghiệp vụ đã có unit test. Mỗi test nên tự tạo dữ liệu cần dùng để có thể chạy riêng lẻ và song song."
        ]
      },
      {
        h: "Ví dụ với NestJS",
        p: [
          "Test dưới đây dựng toàn bộ `AppModule`, bật cùng ValidationPipe như `main.ts`, rồi gọi API qua Supertest. Ngoài trường hợp thành công, nó kiểm tra cả thiếu token, dữ liệu sai và truy cập chéo giữa hai user."
        ],
        code: {
          lang: "typescript",
          file: "test/tasks.e2e-spec.ts",
          src: `// Jest (mặc định khi tạo dự án NestJS) cung cấp sẵn describe/it/expect toàn cục
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let tokenA: string;

  beforeAll(async () => {
    // DATABASE_URL đã trỏ tới Postgres của Testcontainers trong globalSetup
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // giống main.ts
    await app.init();
    tokenA = await login(app, 'a@example.com');
  });

  afterAll(() => app.close());

  it('401 khi không có token', () =>
    request(app.getHttpServer()).get('/tasks').expect(401));

  it('400 khi tiêu đề rỗng', () =>
    request(app.getHttpServer())
      .post('/tasks').set('Authorization', \`Bearer \${tokenA}\`)
      .send({ title: '' }).expect(400));

  it('201 và trả task vừa tạo', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks').set('Authorization', \`Bearer \${tokenA}\`)
      .send({ title: 'Viết e2e' }).expect(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), title: 'Viết e2e' });
  });

  it('404 khi user B đọc task của user A', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks').set('Authorization', \`Bearer \${tokenA}\`).send({ title: 'Riêng tư' });
    const tokenB = await login(app, 'b@example.com');
    await request(app.getHttpServer())
      .get(\`/tasks/\${created.body.id}\`).set('Authorization', \`Bearer \${tokenB}\`)
      .expect(404);
  });
});

async function login(app: INestApplication, email: string): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login').send({ email, password: 'Password123!' }).expect(200);
  return res.body.accessToken;
}`
        }
      },
      {
        h: "Test cả đường lỗi và phân quyền",
        p: [
          "Broken Access Control đứng đầu OWASP Top 10:2025 (A01). Lỗi kinh điển là IDOR: user B đổi id trên URL và đọc được dữ liệu của user A. Unit test hiếm khi bắt được vì lỗi nằm ở chỗ thiếu điều kiện `owner_id` trong query hoặc thiếu guard, đúng thứ e2e test nhìn thấy.",
          "Mỗi endpoint nên có ít nhất: một test thành công, một test thiếu hoặc sai xác thực (401), một test sai quyền (403 hoặc 404), một test dữ liệu không hợp lệ (400 hoặc 422). Lưu ý phải cấu hình app trong test giống `main.ts` (global pipe, prefix, filter), nếu không bạn đang test một ứng dụng khác."
        ]
      }
    ],
    summary: [
      "API e2e gọi HTTP vào ứng dụng đầy đủ, kiểm tra status, body, header mà client thấy.",
      "Supertest gọi server Node.js trực tiếp; kết hợp Testcontainers để có DB thật.",
      "Luôn test đường lỗi: 401, 403/404, 400/422, không chỉ đường thành công.",
      "Test phân quyền giữa các user để chặn IDOR, thuộc nhóm A01 Broken Access Control."
    ],
    pitfalls: [
      "Cấu hình app trong test khác `main.ts` (thiếu ValidationPipe, global prefix), nên test pass nhưng production cư xử khác.",
      "Chỉ test happy path, bỏ sót lỗi thiếu guard hoặc thiếu kiểm tra quyền sở hữu.",
      "Các test e2e dùng chung dữ liệu và phụ thuộc thứ tự chạy."
    ],
    quiz: [
      {
        q: "Lỗi nào API e2e test phù hợp nhất để phát hiện?",
        options: ["Hàm tính thuế làm tròn sai", "Endpoint quên gắn guard xác thực", "Biến đặt tên chưa rõ nghĩa", "Hàm phức tạp thiếu comment"],
        answer: 1,
        explain: "Guard là cấu hình ở tầng HTTP, chỉ lộ ra khi request đi qua toàn bộ pipeline. Lỗi làm tròn thì unit test bắt tốt hơn."
      },
      {
        q: "User B gọi `GET /tasks/42` của user A. API nên trả gì và vì sao cần test?",
        options: ["200, vì B đã đăng nhập hợp lệ", "403 hoặc 404, để chặn lỗi IDOR", "500, vì đây là lỗi phía server", "302, chuyển B về trang chủ"],
        answer: 1,
        explain: "Đăng nhập không có nghĩa được xem mọi dữ liệu. Trả 404 còn giúp không tiết lộ tài nguyên tồn tại. Đây là nhóm lỗi A01 phổ biến nhất."
      },
      {
        q: "Vì sao trong test phải gọi `useGlobalPipes` giống `main.ts`?",
        options: ["Vì global pipe giúp test chạy nhanh hơn", "Vì cấu hình trong `main.ts` không tự áp dụng", "Vì Supertest báo lỗi nếu thiếu global pipe", "Không cần, NestJS tự nạp lại `main.ts`"],
        answer: 1,
        explain: "Cấu hình trong `main.ts` không tự áp dụng trong test. Cách tốt là tách hàm cấu hình app dùng chung cho cả `main.ts` và test."
      }
    ]
  },

  "p06.m0.t5": {
    videos: [
      { id: "U05q0zJsKsU", title: "[Introduction to contract testing - Part 1] The problem with end-to-end integrated tests", channel: "PactFlow", lang: "en", minutes: 6, embed: true },
      { id: "IetyhDr48RI", title: "[Introduction to contract testing - Part 2] Contract testing and how Pact works", channel: "PactFlow", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Vấn đề giữa các service",
        p: [
          "Khi frontend hoặc service A (consumer) gọi service B (provider), cả hai đội đều có test riêng và đều xanh, nhưng khi deploy thì vỡ vì B đổi tên trường `userName` thành `username`. E2E test chạy toàn bộ hệ thống có thể bắt được, nhưng chậm, khó dựng và hay flaky.",
          "Contract testing kiểm tra riêng lẻ từng bên dựa trên một hợp đồng chung: consumer cần gì từ provider, provider có đáp ứng đúng như vậy không. Pact là công cụ phổ biến nhất theo hướng consumer-driven."
        ]
      },
      {
        h: "Pact hoạt động thế nào",
        p: [
          "Quy trình gồm bốn bước, chia đều cho hai phía và một nơi lưu trữ trung gian:"
        ],
        list: [
          "Consumer viết test với mock server của Pact, khai báo request sẽ gửi và response mong đợi. Test chạy sinh ra file pact (JSON) mô tả hợp đồng.",
          "File pact được publish lên Pact Broker (tự host hoặc PactFlow).",
          "Provider chạy bước verify: Pact phát lại các request trong hợp đồng vào provider thật và so response.",
          "Trước khi deploy, `can-i-deploy` hỏi Broker xem phiên bản này có tương thích với các bên đang chạy ở môi trường đích không."
        ],
        code: {
          lang: "typescript",
          file: "web/src/api/tasks.pact.spec.ts",
          src: `import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { describe, it, expect } from 'vitest';
import { getTask } from './tasks-client';

const { like, integer } = MatchersV3;
const provider = new PactV3({ consumer: 'web-app', provider: 'task-api' });

describe('task-api contract', () => {
  it('lấy một task theo id', () => {
    provider
      .given('task 42 tồn tại')
      .uponReceiving('yêu cầu lấy task 42')
      .withRequest({ method: 'GET', path: '/tasks/42' })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { id: integer(42), title: like('Viết test'), status: like('TODO') },
      });

    return provider.executeTest(async (mockServer) => {
      const task = await getTask(mockServer.url, 42);
      expect(task.title).toBe('Viết test');
    });
  });
});`
        }
      },
      {
        h: "Khi nào đáng dùng",
        p: [
          "Contract testing đáng giá khi có nhiều service do nhiều đội phát triển và deploy độc lập, hoặc khi API của bạn có nhiều consumer. Với một monolith và một frontend cùng repo, type chia sẻ (ví dụ sinh từ OpenAPI) cùng e2e test thường đã đủ.",
          "Matcher như `like` và `integer` kiểm tra kiểu và cấu trúc thay vì giá trị chính xác, giúp hợp đồng không quá chặt. Consumer chỉ nên khai báo những trường nó thực sự dùng, nhờ đó provider tự do thêm trường mới mà không phá hợp đồng."
        ]
      }
    ],
    summary: [
      "Contract testing kiểm tra tương thích giữa consumer và provider mà không cần dựng toàn hệ thống.",
      "Pact: consumer sinh hợp đồng từ test, provider verify hợp đồng với code thật.",
      "Pact Broker lưu hợp đồng; `can-i-deploy` chặn deploy phiên bản không tương thích.",
      "Đáng dùng khi nhiều service, nhiều đội deploy độc lập."
    ],
    pitfalls: [
      "Khai báo hợp đồng với giá trị chính xác cho mọi trường, khiến hợp đồng vỡ vì dữ liệu thay đổi vô hại.",
      "Consumer khai báo cả những trường không dùng, trói tay provider khi muốn thay đổi.",
      "Có hợp đồng nhưng không chạy verify và `can-i-deploy` trong pipeline, nên hợp đồng không bảo vệ được gì."
    ],
    quiz: [
      {
        q: "Trong consumer-driven contract testing, ai định nghĩa hợp đồng?",
        options: ["Provider, qua tài liệu OpenAPI", "Consumer, qua test của chính nó", "Đội QA, qua test thủ công", "Pact Broker, tự sinh từ log"],
        answer: 1,
        explain: "Consumer khai báo những gì mình cần. Provider verify rằng mình đáp ứng được các hợp đồng đó."
      },
      {
        q: "Vì sao dùng matcher `like()` thay cho giá trị cố định?",
        options: ["Để test consumer chạy nhanh hơn", "Để kiểm tra kiểu và cấu trúc, không ép giá trị", "Để bỏ qua bước verify ở provider", "Vì Pact không cho dùng giá trị cố định"],
        answer: 1,
        explain: "Hợp đồng quan tâm hình dạng dữ liệu. Ràng buộc giá trị cụ thể làm hợp đồng giòn mà không thêm giá trị."
      },
      {
        q: "Khi nào contract testing ít cần thiết nhất?",
        options: ["20 microservice do 6 đội deploy độc lập", "API công khai có nhiều consumer bên ngoài", "Monolith và frontend cùng repo, cùng deploy", "Mobile app gọi nhiều backend của nhiều đội"],
        answer: 2,
        explain: "Khi mọi thứ deploy cùng nhau và dùng chung type, lỗi lệch hợp đồng đã được type check và e2e bắt. Contract testing hữu ích nhất khi deploy độc lập."
      }
    ]
  },

  "p06.m0.t6": {
    videos: [
      { id: "ghuo8m7AXEM", title: "How to do Performance Testing with k6", channel: "Alex Hyett", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Các loại test hiệu năng",
        p: [
          "Test chức năng trả lời \"có đúng không\", còn test hiệu năng trả lời \"có đủ nhanh và chịu được tải không\". Một endpoint chạy đúng với 1 người dùng có thể sập với 500 người do cạn connection pool, khoá DB hay rò bộ nhớ.",
          "Trước khi chạy, hãy xác định mục tiêu cụ thể dựa trên SLO hoặc lưu lượng thực tế, ví dụ \"p95 dưới 300 ms với 200 request mỗi giây\". Không có mục tiêu thì kết quả load test chỉ là những con số khó ra quyết định."
        ],
        list: [
          "Smoke test: vài người dùng ảo trong thời gian ngắn, kiểm tra script và hệ thống cơ bản ổn.",
          "Load test: tải ở mức dự kiến bình thường và cao điểm, kiểm tra đạt mục tiêu độ trễ.",
          "Stress test: tăng tải vượt mức để tìm điểm gãy và xem hệ thống hồi phục thế nào.",
          "Soak test: tải vừa phải trong nhiều giờ để phát hiện rò rỉ bộ nhớ hoặc kết nối."
        ]
      },
      {
        h: "Script k6 với threshold",
        p: [
          "k6 là công cụ load test viết script bằng JavaScript, chạy bằng một binary nhanh (viết bằng Go). Threshold là tiêu chí pass/fail: nếu vi phạm, k6 thoát với mã khác 0, nhờ đó pipeline CI tự fail.",
          "Mỗi VU (virtual user) chạy hàm `default` lặp đi lặp lại. `check` giống assert nhưng không dừng test, còn threshold mới quyết định pass hay fail cho cả lần chạy."
        ],
        code: {
          lang: "javascript",
          file: "test/load/tasks.k6.js",
          src: `import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.TOKEN;

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // tăng dần lên 20 VU
    { duration: '1m', target: 20 },   // giữ tải
    { duration: '15s', target: 0 },   // giảm về 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% request dưới 300ms
    http_req_failed: ['rate<0.01'],   // lỗi dưới 1%
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get(\`\${BASE}/tasks?limit=20\`, {
    headers: { Authorization: \`Bearer \${TOKEN}\` },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1); // giả lập thời gian người dùng suy nghĩ
}`
        }
      },
      {
        h: "Chạy và đọc kết quả",
        code: {
          lang: "bash",
          file: "terminal",
          src: `k6 run -e BASE_URL=https://staging.example.com -e TOKEN=$TOKEN test/load/tasks.k6.js
# hoặc bằng Docker:
docker run --rm -i -e BASE_URL=https://staging.example.com grafana/k6 run - < test/load/tasks.k6.js
echo $?   # khác 0 nếu vi phạm threshold`
        },
        p: [
          "Nhìn vào percentile (p95, p99) thay vì trung bình: trung bình 80 ms có thể che giấu 5% người dùng chờ 3 giây. Chạy load test trên môi trường giống production (staging), không chạy vào production khi chưa có kế hoạch. Chỉ đưa vào pipeline cho vài endpoint quan trọng, chạy theo lịch hoặc trước release, vì load test tốn thời gian và tài nguyên."
        ]
      }
    ],
    summary: [
      "Smoke, load, stress, soak kiểm tra các khía cạnh hiệu năng khác nhau.",
      "k6 viết script bằng JavaScript; `stages` mô tả mức tải theo thời gian.",
      "Threshold như `p(95)<300` và `rate<0.01` biến kết quả thành pass/fail cho CI.",
      "Đánh giá bằng percentile, chạy trên môi trường giống production."
    ],
    pitfalls: [
      "Chỉ nhìn thời gian trung bình, bỏ qua đuôi độ trễ p95, p99 mà người dùng thật gặp.",
      "Chạy load test từ laptop yếu hoặc qua mạng chậm: máy tạo tải trở thành nút thắt, kết quả sai.",
      "Load test vào production không báo trước, gây sự cố thật hoặc kích hoạt rate limit và chống DDoS."
    ],
    quiz: [
      {
        q: "Threshold `http_req_duration: ['p(95)<300']` nghĩa là gì?",
        options: ["Mọi request đều dưới 300ms", "95% request có thời gian dưới 300ms", "Thời gian trung bình dưới 300ms", "Tối đa 95 request trong mỗi 300ms"],
        answer: 1,
        explain: "p(95) là percentile 95: 95% request nhanh hơn giá trị này. Nó không yêu cầu mọi request, cũng không phải trung bình."
      },
      {
        q: "Loại test nào phù hợp để phát hiện rò rỉ bộ nhớ xuất hiện sau vài giờ?",
        options: ["Smoke test", "Soak test", "Unit test", "Stress test ngắn"],
        answer: 1,
        explain: "Soak test chạy tải vừa phải trong thời gian dài, đủ để rò rỉ bộ nhớ hay kết nối lộ ra."
      },
      {
        q: "Làm sao để pipeline CI fail khi hiệu năng không đạt?",
        options: ["Đọc log k6 thủ công sau mỗi lần chạy", "Đặt threshold để k6 thoát mã khác 0", "Tăng `sleep` trong script cho ổn định", "Tăng số VU cho tới khi hệ thống lỗi"],
        answer: 1,
        explain: "CI dựa vào exit code. Threshold biến tiêu chí hiệu năng thành điều kiện pass/fail tự động."
      }
    ]
  },

  "p06.m0.t7": {
    videos: [
      { id: "Jv2uxzhPFl4", title: "Test-Driven Development // Fun TDD Introduction with JavaScript", channel: "Fireship", lang: "en", minutes: 13, embed: true }
    ],
    sections: [
      {
        h: "TDD: Red, Green, Refactor",
        p: [
          "Test-Driven Development là viết test trước khi viết code. Vòng lặp ngắn gồm ba bước: Red (viết một test mô tả hành vi mới, chạy thấy fail), Green (viết lượng code tối thiểu để test pass), Refactor (dọn code cho sạch, test vẫn xanh). Mỗi vòng chỉ vài phút.",
          "Lợi ích lớn nhất không chỉ là có test, mà là buộc bạn nghĩ về interface và hành vi trước khi nghĩ về cài đặt. Code viết theo TDD thường dễ test vì nó được thiết kế từ góc nhìn người dùng API."
        ],
        code: {
          lang: "typescript",
          file: "src/pricing/shipping.spec.ts",
          src: `import { it, expect } from 'vitest';
import { shippingFee } from './shipping';

// 1. RED: viết test trước, chưa có hàm => fail
it('miễn phí ship cho đơn từ 500.000đ', () => {
  expect(shippingFee(500_000)).toBe(0);
});
it('phí 30.000đ cho đơn nhỏ hơn 500.000đ', () => {
  expect(shippingFee(499_999)).toBe(30_000);
});

// 2. GREEN (src/pricing/shipping.ts):
// export const shippingFee = (total: number) => (total >= 500_000 ? 0 : 30_000);
// 3. REFACTOR: đưa 500_000 và 30_000 ra hằng số có tên, test vẫn xanh`
        }
      },
      {
        h: "Khi nào TDD phát huy",
        list: [
          "Logic nghiệp vụ có quy tắc rõ ràng: tính giá, khuyến mãi, chuyển trạng thái, phân quyền.",
          "Sửa bug: viết test tái hiện bug trước (Red), rồi sửa (Green). Bug đó sẽ không bao giờ quay lại âm thầm.",
          "Ít phát huy khi đang khám phá, thử nghiệm thư viện mới hoặc làm prototype; khi đó viết test sau khi thiết kế đã ổn định."
        ],
        p: [
          "Bạn không cần áp dụng TDD cho mọi dòng code. Riêng thói quen \"viết test tái hiện bug trước khi sửa\" đã mang lại giá trị rất lớn."
        ]
      },
      {
        h: "Coverage là công cụ, không phải mục tiêu",
        p: [
          "Coverage đo tỷ lệ dòng, nhánh, hàm được chạy qua khi test. Nó rất tốt để tìm chỗ chưa có test, ví dụ một nhánh xử lý lỗi chưa ai chạm tới. Nhưng coverage cao không có nghĩa là test tốt: một test gọi hàm mà không assert gì vẫn làm coverage tăng.",
          "Khi coverage thành chỉ tiêu KPI, người ta viết test vô nghĩa để đạt số. Cách hợp lý: đặt ngưỡng vừa phải để chặn giảm đột ngột, ưu tiên branch coverage cho module nghiệp vụ, và review chất lượng assert trong PR."
        ],
        code: {
          lang: "typescript",
          file: "vitest.config.ts",
          src: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',                      // cần cài @vitest/coverage-v8
      reporter: ['text', 'lcov'],          // lcov cho SonarQube
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.module.ts', 'src/main.ts'],
      thresholds: { lines: 80, branches: 75 },
    },
  },
});`
        }
      }
    ],
    summary: [
      "TDD: Red (test fail), Green (code tối thiểu), Refactor (dọn code, test vẫn xanh).",
      "TDD giúp thiết kế interface tốt và rất hiệu quả khi sửa bug.",
      "Coverage giúp tìm chỗ thiếu test, không chứng minh test tốt.",
      "Đặt ngưỡng coverage vừa phải, ưu tiên branch coverage cho code nghiệp vụ."
    ],
    pitfalls: [
      "Viết test không có assert chỉ để tăng coverage.",
      "Bỏ qua bước Refactor, code pass test nhưng ngày càng rối.",
      "Đặt coverage 100% bắt buộc, dẫn tới test cho getter, DTO, file cấu hình mà không thêm độ tin cậy."
    ],
    quiz: [
      {
        q: "Thứ tự đúng của vòng TDD?",
        options: ["Green, Red, Refactor", "Red, Green, Refactor", "Refactor, Red, Green", "Code, Test, Deploy"],
        answer: 1,
        explain: "Viết test fail trước (Red), làm cho pass (Green), rồi cải thiện code (Refactor)."
      },
      {
        q: "Coverage 95% nói lên điều gì?",
        options: ["Code gần như chắc chắn không còn bug", "95% dòng được chạy qua, chưa chắc được kiểm tra", "95% số test trong bộ test đã pass", "Hiệu năng đạt 95% mục tiêu đề ra"],
        answer: 1,
        explain: "Coverage chỉ đo code có được chạy hay không. Test không assert vẫn tăng coverage, nên nó không chứng minh tính đúng."
      },
      {
        q: "Khi nhận một bug report, cách làm theo tinh thần TDD là gì?",
        options: ["Sửa ngay rồi deploy, viết test sau", "Viết test tái hiện bug, rồi mới sửa", "Viết thêm test để tăng coverage", "Xoá test cũ liên quan để làm lại"],
        answer: 1,
        explain: "Test tái hiện chứng minh bạn hiểu bug, xác nhận bản sửa có hiệu quả, và ngăn bug quay lại sau này."
      }
    ]
  },

  "p06.m1.t0": {
    videos: [
      { id: "K4fAs0OFqtk", title: "Setup dự án Node.js CHUẨN với TypeScript ESLint Prettier | Express.js hay Fastify đều dùng được", channel: "Được Dev", lang: "vi", minutes: 22, embed: true }
    ],
    sections: [
      {
        h: "Lint và format là hai việc khác nhau",
        p: [
          "Prettier lo định dạng: thụt lề, dấu chấm phẩy, xuống dòng, nháy đơn hay kép. Nó không có ý kiến về logic, chỉ in lại code theo một kiểu duy nhất, nên cả đội hết tranh luận về style. ESLint lo chất lượng: phát hiện biến không dùng, promise không được await, so sánh `==`, import vòng, và nhiều lỗi tiềm ẩn khác.",
          "Để hai công cụ không giẫm chân nhau, hãy tắt các rule định dạng của ESLint bằng `eslint-config-prettier`, còn định dạng giao hẳn cho Prettier."
        ]
      },
      {
        h: "Type-aware lint cho TypeScript",
        p: [
          "typescript-eslint có hai nhóm rule. Nhóm thường chỉ đọc cú pháp. Nhóm type-aware dùng thông tin kiểu từ trình biên dịch TypeScript nên bắt được những lỗi rất đáng giá ở backend: `no-floating-promises` (quên `await` khiến lỗi bị nuốt và transaction chạy lệch), `no-misused-promises` (truyền hàm async vào chỗ không chờ promise), `no-unsafe-*` (dùng giá trị `any` không kiểm soát). Đổi lại, lint chậm hơn vì phải phân tích kiểu.", "Cấu hình dưới đây dùng flat config (`eslint.config.mjs`), định dạng duy nhất từ ESLint v10 (phát hành 2/2026, yêu cầu Node.js 20.19 trở lên); các file `.eslintrc.*` và `.eslintignore` không còn được đọc. Gặp hướng dẫn cũ dùng `.eslintrc.json` thì cần chuyển sang flat config."
        ],
        code: {
          lang: "javascript",
          file: "eslint.config.mjs",
          src: `import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig(
  { ignores: ['dist/', 'coverage/'] },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      eqeqeq: 'error',
    },
  },
  prettier, // đặt cuối để tắt rule định dạng xung đột với Prettier
);`
        }
      },
      {
        h: "Tích hợp vào quy trình",
        code: {
          lang: "json",
          file: "package.json",
          src: `{
  "scripts": {
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  }
}`
        },
        p: [
          "Trong editor, bật format khi lưu và hiển thị lỗi ESLint trực tiếp. Trong CI, chạy `format:check`, `lint` và `typecheck` như các bước bắt buộc; `--max-warnings=0` giúp cảnh báo không tích tụ dần. Khi áp dụng cho dự án cũ, hãy bật rule chặt dần theo từng thư mục hoặc để mức `warn` một thời gian, tránh một PR sửa hàng nghìn file khó review.",
          "Commit file `.prettierrc` và cấu hình ESLint vào repo để máy dev và CI dùng đúng một bộ quy tắc, và ghim phiên bản công cụ trong `package-lock.json` để kết quả không đổi giữa các máy."
        ]
      }
    ],
    summary: [
      "Prettier định dạng code, ESLint tìm lỗi chất lượng; tắt rule định dạng của ESLint bằng eslint-config-prettier.",
      "Type-aware lint bắt lỗi quan trọng như quên `await` với `no-floating-promises`.",
      "ESLint dùng flat config (`eslint.config.mjs`); từ ESLint v10 (2/2026) định dạng `.eslintrc` cũ đã bị bỏ hẳn.",
      "Chạy `format:check`, `lint`, `typecheck` trong CI với `--max-warnings=0`."
    ],
    pitfalls: [
      "Để ESLint và Prettier cùng định dạng, gây vòng lặp sửa qua sửa lại và cảnh báo mâu thuẫn.",
      "Tắt rule bằng `eslint-disable` tràn lan thay vì sửa lỗi hoặc điều chỉnh rule có lý do.",
      "Chỉ chạy lint trên máy dev, không chạy trong CI, nên code vi phạm vẫn vào được `main`."
    ],
    quiz: [
      {
        q: "Vai trò của `eslint-config-prettier` là gì?",
        options: ["Tự định dạng code thay cho Prettier", "Tắt rule ESLint xung đột với Prettier", "Chạy Prettier như một rule của ESLint", "Bật kiểm tra kiểu TypeScript cho ESLint"],
        answer: 1,
        explain: "Gói này chỉ tắt rule định dạng của ESLint, để Prettier là nguồn duy nhất về định dạng. Nó không tự định dạng code."
      },
      {
        q: "Rule `@typescript-eslint/no-floating-promises` bắt lỗi gì?",
        options: ["Khai báo biến bằng `var` thay cho `let`", "Promise không được await hay xử lý lỗi", "Import một module nhưng không dùng tới", "Hàm async không khai báo kiểu trả về"],
        answer: 1,
        explain: "Promise không được chờ có thể làm lỗi bị nuốt và thao tác chạy lệch thứ tự. Rule này cần thông tin kiểu nên thuộc nhóm type-aware."
      },
      {
        q: "Vì sao dùng `--max-warnings=0` trong CI?",
        options: ["Để ESLint bỏ qua rule chậm và chạy nhanh hơn", "Để có bất kỳ cảnh báo nào cũng làm lint fail", "Để tắt mọi rule đang ở mức warn", "Để ESLint tự sửa các cảnh báo còn lại"],
        answer: 1,
        explain: "Nếu warning không làm fail, chúng tích tụ tới hàng trăm và không ai đọc nữa. Cờ này biến mọi cảnh báo thành điều kiện chặn."
      }
    ]
  },

  "p06.m1.t1": {
    videos: [
      { id: "Kr4VxMbF3LY", title: "Lint Like a Senior Developer w/ eslint + husky + lint staged + github actions", channel: "Syntax", lang: "en", minutes: 20, embed: true }
    ],
    sections: [
      {
        h: "Git hooks là gì",
        p: [
          "Git hooks là script Git tự chạy tại một số thời điểm: `pre-commit` trước khi tạo commit, `commit-msg` sau khi viết message, `pre-push` trước khi push. Nếu script thoát với mã khác 0, thao tác bị huỷ. Hook giúp phát hiện lỗi sớm nhất, ngay trên máy dev, thay vì chờ CI vài phút.",
          "Vấn đề là hook nằm trong `.git/hooks` và không được commit. Husky giải quyết bằng cách lưu hook trong thư mục `.husky/` của repo và tự cấu hình Git dùng thư mục đó khi chạy `npm install`.",
          "Từ Husky v9, file hook chỉ là các lệnh shell thông thường, không cần dòng shebang hay dòng nạp script như các phiên bản cũ."
        ]
      },
      {
        h: "Husky + lint-staged + commitlint",
        p: [
          "lint-staged chỉ chạy công cụ trên các file đang được stage, nên hook chạy trong vài giây dù repo lớn. commitlint kiểm tra commit message theo Conventional Commits.",
          "Sau khi cấu hình, thử commit với message \"sửa bug\" sẽ bị commitlint chặn vì thiếu type, còn \"fix: sửa lỗi phân trang\" thì qua. Tương tự, một file có lỗi ESLint không tự sửa được sẽ khiến commit bị huỷ."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `npm i -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init        # tạo .husky/pre-commit và thêm script "prepare": "husky"

echo "npx lint-staged" > .husky/pre-commit
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.mjs`
        }
      },
      {
        h: "Cấu hình lint-staged",
        code: {
          lang: "json",
          file: "package.json",
          src: `{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,js,mjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}`
        },
        p: [
          "Giữ hook nhanh: lint và format file thay đổi ở `pre-commit`, có thể chạy unit test liên quan ở `pre-push`. Không chạy integration test hay build đầy đủ trong hook; hook chậm khiến mọi người bỏ qua bằng `git commit --no-verify`.",
          "Quan trọng: hook chạy trên máy cá nhân và có thể bị bỏ qua, nên nó chỉ là lớp tiện lợi. CI phải chạy lại đầy đủ lint, test và commitlint (ví dụ kiểm tra tiêu đề PR khi dùng squash merge). Trong môi trường CI hoặc Docker build không cần hook, đặt biến `HUSKY=0` để tắt."
        ]
      }
    ],
    summary: [
      "Git hooks chạy tự động ở các thời điểm như pre-commit, commit-msg, pre-push.",
      "Husky lưu hook trong repo (`.husky/`) để cả đội dùng chung.",
      "lint-staged chỉ xử lý file đã stage nên hook nhanh; commitlint kiểm tra message.",
      "Hook là lớp tiện lợi, có thể bị bỏ qua; CI phải kiểm tra lại toàn bộ."
    ],
    pitfalls: [
      "Chạy toàn bộ test suite và build trong pre-commit, khiến mỗi commit mất vài phút và mọi người dùng `--no-verify`.",
      "Tin rằng hook đủ đảm bảo chất lượng mà không chạy lại kiểm tra trong CI.",
      "Quên script `prepare`, nên người mới clone repo không có hook nào hoạt động."
    ],
    quiz: [
      {
        q: "Vì sao dùng lint-staged thay vì chạy `eslint .` trong pre-commit?",
        options: ["Vì lint-staged tự sửa được mọi bug", "Vì chỉ chạy trên file đã stage nên nhanh", "Vì ESLint không chạy được trong git hook", "Vì lint-staged thay thế luôn Prettier"],
        answer: 1,
        explain: "Lint cả repo mỗi lần commit rất chậm. lint-staged giới hạn phạm vi vào file đang được commit."
      },
      {
        q: "Hook nào phù hợp để chạy commitlint?",
        options: ["pre-commit", "commit-msg", "post-merge", "pre-rebase"],
        answer: 1,
        explain: "`commit-msg` nhận đường dẫn file chứa message làm tham số, đúng lúc để kiểm tra nội dung message."
      },
      {
        q: "Vì sao CI vẫn phải chạy lint dù đã có pre-commit hook?",
        options: ["Vì hook chỉ chạy được trên Linux", "Vì hook có thể bị bỏ qua hoặc chưa cài", "Vì CI chạy ESLint nhanh hơn máy dev", "Vì ESLint trong hook là bản khác"],
        answer: 1,
        explain: "Hook chạy trên máy cá nhân và không thể bắt buộc. CI là nơi kiểm soát chất lượng có hiệu lực cho mọi thay đổi."
      }
    ]
  },

  "p06.m1.t2": {
    videos: [
      { id: "GRVA4AiO7OM", title: "SonarQube Tutorial: Everything You Need to Know for Beginners", channel: "Sonar", lang: "en", minutes: 43, embed: true }
    ],
    sections: [
      {
        h: "Static analysis nhìn thấy gì",
        p: [
          "Static analysis phân tích code mà không chạy nó. ESLint là một dạng, nhưng các nền tảng như SonarQube (tự host) và SonarQube Cloud (trước đây gọi là SonarCloud) đi xa hơn: theo dõi code smell, code trùng lặp (duplication), độ phức tạp, lỗi tiềm ẩn (bug), lỗ hổng bảo mật và security hotspot, rồi hiển thị xu hướng theo thời gian trên dashboard.",
          "Giá trị lớn nhất nằm ở việc nhìn toàn cảnh: module nào đang phức tạp dần, phần nào trùng lặp nhiều, coverage của code mới ra sao. Các chỉ số này giúp đội ưu tiên việc trả nợ kỹ thuật dựa trên dữ liệu thay vì cảm giác."
        ]
      },
      {
        h: "Quality gate và \"clean as you code\"",
        p: [
          "Quality gate là tập điều kiện mà dự án phải đạt để được coi là pass. Cách tiếp cận Sonar khuyến nghị là áp điều kiện lên code mới (new code): coverage của code mới, tỷ lệ trùng lặp của code mới, không có bug hay lỗ hổng mới, mọi security hotspot mới đã được review.",
          "Tập trung vào code mới thực tế hơn nhiều so với đòi cả dự án cũ đạt chuẩn ngay. Mỗi PR chỉ cần không làm tệ thêm, và chất lượng tổng thể cải thiện dần theo thời gian."
        ]
      },
      {
        h: "Chạy trong GitHub Actions",
        code: {
          lang: "yaml",
          file: ".github/workflows/quality.yml",
          src: `name: quality
on:
  pull_request:
  push:
    branches: [main]

jobs:
  sonar:
    runs-on: ubuntu-latest
    steps:
      # Pin action theo commit SHA đầy đủ, ghi chú tag để dễ đọc
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0            # cần lịch sử đầy đủ để xác định code mới
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx vitest run --coverage   # sinh coverage/lcov.info
      - uses: SonarSource/sonarqube-scan-action@ba9859eae8dd6bd29e412f25ddbbef3d032000f4 # v8.2.2
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.qualitygate.wait=true`
        },
        p: [
          "Pin action theo commit SHA thay vì tag, vì tag có thể bị ghi đè. Sự cố với `aquasecurity/trivy-action` ngày 19/3/2026, khi 76 trên 77 tag bị ghi đè trỏ tới mã độc, cho thấy chỉ SHA mới bất biến. `sonar.qualitygate.wait=true` khiến bước này chờ kết quả quality gate và fail nếu không đạt."
        ]
      },
      {
        h: "Cấu hình dự án",
        code: {
          lang: "ini",
          file: "sonar-project.properties",
          src: `sonar.projectKey=my-org_task-api
sonar.organization=my-org
sonar.sources=src
sonar.tests=src,test
sonar.test.inclusions=**/*.spec.ts,**/*.e2e-spec.ts
# sources và tests cùng gốc src nên phải loại file test khỏi phần source
sonar.exclusions=**/*.spec.ts,**/*.module.ts,src/main.ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info`
        },
        p: [
          "Vì file test nằm cạnh code trong `src/`, `sonar.sources` và `sonar.tests` cùng trỏ vào `src`; khi đó phải dùng `sonar.test.inclusions` để chọn file test và `sonar.exclusions` để loại chúng khỏi phần source, nếu không một file sẽ bị xếp vào cả hai nhóm và phân tích lỗi. Công cụ static analysis có thể báo nhầm (false positive). Khi đó hãy đánh dấu và ghi lý do trên nền tảng, thay vì tắt cả rule cho toàn dự án."
        ]
      }
    ],
    summary: [
      "Static analysis tìm code smell, duplication, bug, lỗ hổng mà không cần chạy code.",
      "SonarQube / SonarQube Cloud theo dõi chất lượng theo thời gian trên dashboard.",
      "Quality gate áp lên code mới giúp chất lượng cải thiện dần mà không chặn đứng dự án cũ.",
      "Trong CI, chờ quality gate và fail nếu không đạt; pin action theo commit SHA."
    ],
    pitfalls: [
      "Áp quality gate cho toàn bộ code cũ ngay từ đầu, pipeline đỏ mãi và đội bỏ qua công cụ.",
      "Checkout với lịch sử nông (mặc định `fetch-depth: 1`), khiến Sonar không xác định đúng code mới và blame.",
      "Tắt rule hàng loạt để đạt quality gate thay vì xử lý hoặc đánh dấu false positive có lý do."
    ],
    quiz: [
      {
        q: "Vì sao nên áp quality gate lên \"code mới\"?",
        options: ["Vì code cũ đã chạy ổn nên không thể có lỗi", "Để mỗi thay đổi không làm chất lượng tệ thêm", "Vì Sonar không phân tích được code cũ", "Để bỏ qua yêu cầu coverage cho cả dự án"],
        answer: 1,
        explain: "Đòi cả dự án cũ đạt chuẩn ngay là không thực tế. Kiểm soát code mới giúp nợ kỹ thuật không tăng và giảm dần theo thời gian."
      },
      {
        q: "Tác dụng của `sonar.qualitygate.wait=true` trong CI?",
        options: ["Bỏ qua bước tính coverage cho nhanh", "Chờ kết quả quality gate, không đạt thì fail", "Tắt quality gate cho nhánh pull request", "Tự sửa code smell trước khi gửi báo cáo"],
        answer: 1,
        explain: "Mặc định scanner gửi báo cáo rồi kết thúc. Tham số này làm pipeline phản ánh kết quả quality gate."
      },
      {
        q: "Vì sao nên pin GitHub Action theo commit SHA?",
        options: ["Vì action pin theo SHA chạy nhanh hơn", "Vì tag có thể bị ghi đè, còn SHA thì không", "Vì GitHub từ chối chạy action pin theo tag", "Vì pin SHA giúp tiết kiệm phút chạy CI"],
        answer: 1,
        explain: "Sự cố trivy-action 19/3/2026 cho thấy tag bị ghi đè hàng loạt. Pin SHA đảm bảo bạn chạy đúng mã đã review, thuộc nhóm rủi ro chuỗi cung ứng phần mềm (A03:2025)."
      }
    ]
  },

  "p06.m1.t3": {
    videos: [
      { id: "d9_fweNDjKw", title: "Better Code Reviews in 6 SIMPLE STEPS", channel: "Modern Software Engineering", lang: "en", minutes: 20, embed: true }
    ],
    sections: [
      {
        h: "Code review để làm gì",
        p: [
          "Code review không chỉ để bắt bug. Nó chia sẻ kiến thức (ít nhất hai người hiểu mỗi phần code), giữ thiết kế nhất quán, và là lớp kiểm tra bảo mật do con người thực hiện. Theo hướng dẫn review của Google, tiêu chí chính là: thay đổi có làm sức khoẻ tổng thể của codebase tốt hơn không, kể cả khi chưa hoàn hảo.",
          "Review hiệu quả khi người viết giúp người review: PR nhỏ, một mục đích, có mô tả rõ, đã tự review diff trước khi nhờ người khác."
        ]
      },
      {
        h: "Checklist khi review",
        p: [
          "Đi qua từng nhóm câu hỏi, từ quan trọng nhất tới ít quan trọng:"
        ],
        list: [
          "Đúng nghiệp vụ: giải quyết đúng yêu cầu chưa? Trường hợp biên (rỗng, trùng, đồng thời, múi giờ) xử lý thế nào?",
          "Bảo mật: có kiểm tra quyền sở hữu tài nguyên không (A01 Broken Access Control)? Input có được validate, query có tham số hoá (A05 Injection)? Có log lộ token, mật khẩu, dữ liệu cá nhân không? Dependency mới có đáng tin không (A03 Software Supply Chain Failures)?",
          "Xử lý lỗi: lỗi có được bắt đúng chỗ, trả mã phù hợp, không nuốt lỗi (A10 Mishandling of Exceptional Conditions)?",
          "Hiệu năng: có query N+1, thiếu index, tải cả bảng vào bộ nhớ, gọi API ngoài trong vòng lặp không?",
          "Dữ liệu: migration có an toàn khi chạy trên bảng lớn và tương thích ngược với phiên bản đang chạy không?",
          "Dễ đọc và có test: tên rõ nghĩa, không phức tạp thừa, có test cho hành vi mới và bug được sửa."
        ]
      },
      {
        h: "Viết PR và bình luận tốt",
        code: {
          lang: "text",
          file: ".github/pull_request_template.md",
          src: `## Vấn đề
Liên kết issue, mô tả ngắn vì sao cần thay đổi.

## Giải pháp
Cách làm, các lựa chọn đã cân nhắc.

## Kiểm tra
- [ ] Unit / integration test
- [ ] Đã chạy thử local: các bước tái hiện

## Rủi ro & triển khai
Migration? Biến môi trường mới? Feature flag? Cách rollback?`
        },
        p: [
          "Khi bình luận, nhận xét về code chứ không về người, và giải thích lý do. Phân biệt rõ mức độ: dùng tiền tố như \"nit:\" cho góp ý nhỏ không bắt buộc, để người viết biết điều gì chặn merge. Phản hồi review trong vòng một ngày làm việc; PR chờ lâu khiến nhánh cũ đi và conflict tăng."
        ]
      }
    ],
    summary: [
      "Review để bắt lỗi, chia sẻ kiến thức, giữ thiết kế nhất quán và kiểm tra bảo mật.",
      "Checklist: nghiệp vụ, bảo mật, xử lý lỗi, hiệu năng, dữ liệu, dễ đọc và test.",
      "PR nhỏ, có template mô tả vấn đề, giải pháp, cách kiểm tra và rủi ro.",
      "Bình luận về code, giải thích lý do, đánh dấu mức độ, phản hồi nhanh."
    ],
    pitfalls: [
      "Dành cả buổi review tranh luận dấu cách và tên biến, bỏ qua lỗ hổng phân quyền.",
      "Approve PR hàng nghìn dòng chỉ sau vài phút lướt qua.",
      "Bình luận mang tính công kích cá nhân hoặc không giải thích lý do, khiến review thành căng thẳng."
    ],
    quiz: [
      {
        q: "Endpoint `GET /invoices/:id` lấy hoá đơn chỉ theo id, không kiểm tra người gọi. Đây là vấn đề thuộc nhóm nào?",
        options: ["A05 Injection", "A01 Broken Access Control", "A04 Cryptographic Failures", "Chỉ là code smell"],
        answer: 1,
        explain: "Thiếu kiểm tra quyền sở hữu cho phép người dùng đọc hoá đơn của người khác (IDOR), thuộc A01 Broken Access Control trong OWASP Top 10:2025."
      },
      {
        q: "Tiền tố \"nit:\" trong bình luận review có ý nghĩa gì?",
        options: ["Lỗi nghiêm trọng, phải sửa trước khi merge", "Góp ý nhỏ, không bắt buộc, không chặn merge", "Yêu cầu viết lại toàn bộ phần code đó", "Người review đã approve phần code này"],
        answer: 1,
        explain: "Đánh dấu mức độ giúp người viết biết đâu là điều bắt buộc, đâu là gợi ý, tránh sửa lan man."
      },
      {
        q: "Việc nào giúp review hiệu quả nhất từ phía người viết PR?",
        options: ["Gộp nhiều tính năng vào một PR cho tiện", "Giữ PR nhỏ, một mục đích, tự review trước", "Bỏ mô tả để người review tự đọc code", "Mở PR sớm khi test vẫn còn đỏ"],
        answer: 1,
        explain: "PR nhỏ và rõ giúp người review hiểu nhanh và phát hiện nhiều vấn đề hơn. PR lớn thường bị review hời hợt."
      }
    ]
  },

  "p06.m1.t4": {
    videos: [
      { id: "7o_PgOQWqdY", title: "What is the C4 model?", channel: "IcePanel", lang: "en", minutes: 4, embed: true },
      { id: "6H6zfCNeqek", title: "Architecture Decision Records (ADR) as a LOG that answers \"WHY?\"", channel: "CodeOpinion", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "README chạy được trong 5 phút",
        p: [
          "README là cửa vào của dự án. Tiêu chuẩn thực tế: một người mới clone repo, làm theo README và có ứng dụng chạy trên máy trong khoảng 5 phút. Nếu README nói một đằng, code làm một nẻo, người mới mất cả ngày hỏi han, và bạn cũng quên mất khi quay lại dự án sau vài tháng."
        ],
        code: {
          lang: "text",
          file: "README.md",
          src: `# Task API
API quản lý công việc (NestJS, PostgreSQL 18, Redis 8).

## Yêu cầu
Node.js 24 (xem .nvmrc), Docker

## Chạy local
cp .env.example .env
docker compose up -d        # Postgres + Redis
npm ci
npm run db:migrate
npm run start:dev           # http://localhost:3000/docs

## Kiểm thử
npm test                    # unit
npm run test:int            # integration (cần Docker)

## Tài liệu khác
docs/adr/                   # quyết định kiến trúc
docs/architecture.md        # sơ đồ C4`
        }
      },
      {
        h: "ADR: ghi lại quyết định và lý do",
        p: [
          "Architecture Decision Record là một file ngắn ghi một quyết định kiến trúc quan trọng: bối cảnh lúc đó, quyết định, và hệ quả. Sau một năm, câu hỏi \"sao lại chọn thế này?\" có câu trả lời thay vì phỏng đoán. ADR được lưu cùng repo (ví dụ `docs/adr/0003-dung-postgresql.md`), đánh số tăng dần, và không sửa nội dung cũ: khi đổi ý, viết ADR mới đánh dấu thay thế ADR cũ.",
          "Nên viết ADR khi quyết định khó đảo ngược hoặc ảnh hưởng nhiều người: chọn database, cách xác thực, monolith hay microservice, chiến lược multi-tenant, message broker."
        ],
        code: {
          lang: "text",
          file: "docs/adr/0003-dung-postgresql.md",
          src: `# 3. Dùng PostgreSQL làm database chính

Trạng thái: Accepted (2026-03-10)

## Bối cảnh
Dữ liệu task, project, user có quan hệ chặt, cần transaction và ràng buộc.
Đội đã quen SQL. Cần tìm kiếm cơ bản và một số trường linh hoạt.

## Quyết định
Dùng PostgreSQL 18 (managed service trên cloud). Trường linh hoạt dùng JSONB.
Không dùng MongoDB ở giai đoạn này.

## Hệ quả
+ Transaction ACID, ràng buộc khoá ngoại, migration có kiểm soát.
+ Một hệ quản trị cho cả dữ liệu quan hệ và bán cấu trúc.
- Cần thiết kế index cẩn thận khi dữ liệu lớn.
- Scale ghi theo chiều ngang phức tạp hơn; xem lại nếu vượt khả năng một primary.`
        }
      },
      {
        h: "Sơ đồ C4",
        p: [
          "Mô hình C4 (Simon Brown) mô tả kiến trúc theo bốn mức phóng to dần, mỗi mức cho một nhóm người đọc khác nhau. Thường bạn chỉ cần hai mức đầu, cập nhật khi kiến trúc thay đổi."
        ],
        list: [
          "Context: hệ thống của bạn, người dùng và các hệ thống bên ngoài (cổng thanh toán, email). Dành cho mọi người, kể cả phi kỹ thuật.",
          "Container: các phần chạy riêng biệt: web app, API, worker, PostgreSQL, Redis, và cách chúng giao tiếp. Container ở đây là đơn vị triển khai, không nhất thiết là Docker container.",
          "Component: các thành phần chính bên trong một container, ví dụ các module NestJS.",
          "Code: sơ đồ class, hiếm khi cần vẽ tay vì IDE sinh được."
        ]
      }
    ],
    summary: [
      "README tốt giúp người mới chạy dự án trong khoảng 5 phút, và phải được giữ đúng với code.",
      "ADR ghi bối cảnh, quyết định, hệ quả; lưu trong repo, không sửa ADR cũ mà viết ADR mới thay thế.",
      "C4 mô tả kiến trúc theo bốn mức: Context, Container, Component, Code.",
      "Tài liệu sống cùng code, được review trong PR như code."
    ],
    pitfalls: [
      "README chứa lệnh đã lỗi thời; hãy chạy thử README định kỳ, hoặc để CI chạy đúng các lệnh đó.",
      "Viết ADR sau khi đã quên lý do, chỉ còn ghi lại kết quả mà thiếu bối cảnh và phương án đã cân nhắc.",
      "Vẽ sơ đồ quá chi tiết ở mọi mức, lỗi thời ngay sau vài sprint."
    ],
    quiz: [
      {
        q: "Một ADR tối thiểu nên có những phần nào?",
        options: ["Tên công nghệ được chọn và ngày chọn", "Bối cảnh, quyết định, hệ quả và trạng thái", "Đoạn code mẫu minh hoạ công nghệ mới", "Biên bản họp và danh sách người tham dự"],
        answer: 1,
        explain: "Giá trị của ADR là giải thích vì sao. Thiếu bối cảnh và hệ quả thì người đọc sau không đánh giá được khi nào nên xem lại quyết định."
      },
      {
        q: "Khi quyết định trong ADR cũ không còn phù hợp, nên làm gì?",
        options: ["Sửa lại nội dung ADR cũ", "Xoá ADR cũ", "Viết ADR mới và đánh dấu ADR cũ là đã bị thay thế", "Không cần làm gì"],
        answer: 2,
        explain: "ADR là nhật ký quyết định. Giữ ADR cũ giúp hiểu lịch sử; ADR mới ghi bối cảnh đã thay đổi thế nào."
      },
      {
        q: "Trong C4, mức Container thể hiện gì?",
        options: ["Chỉ các Docker container đang chạy", "Các đơn vị chạy riêng: web app, API, database", "Sơ đồ class bên trong từng module", "Người dùng và các hệ thống bên ngoài"],
        answer: 1,
        explain: "Container trong C4 là đơn vị có thể triển khai hoặc chạy riêng, không nhất thiết là Docker. Người dùng và hệ thống ngoài thuộc mức Context."
      }
    ]
  },

  "p06.m1.t5": {
    videos: [
      { id: "KmOKQS9u-90", title: "Scrum cơ bản | Quy trình phát triển phần mềm | Ong Dev", channel: "Ông Dev", lang: "vi", minutes: 16, embed: true }
    ],
    "sections": [
      {
        "h": "Code tốt chưa đủ, còn phải làm việc nhóm tốt",
        "p": [
          "Trong công ty, phần lớn thời gian của bạn không phải gõ code mà là hiểu yêu cầu, chia nhỏ việc, trao đổi với đồng đội và báo cáo tiến độ. Hầu hết các đội phần mềm làm việc theo tinh thần Agile, và khung phổ biến nhất là Scrum.",
          "Theo Scrum Guide (bản 2020), Scrum Team gồm Product Owner (chịu trách nhiệm tối đa hoá giá trị sản phẩm, quản lý Product Backlog), Scrum Master (giúp đội áp dụng Scrum hiệu quả) và Developers (những người làm ra sản phẩm, gồm cả bạn)."
        ]
      },
      {
        "h": "Nhịp làm việc của một Sprint",
        "p": [
          "Sprint là chu kỳ cố định, tối đa một tháng, thường là hai tuần. Mỗi Sprint có Sprint Planning (chọn việc và đặt Sprint Goal), Daily Scrum (tối đa 15 phút mỗi ngày để điều chỉnh kế hoạch), Sprint Review (trình bày kết quả cho các bên liên quan) và Sprint Retrospective (nhìn lại để cải thiện cách làm).",
          "Definition of Done là tiêu chí chung để một việc được coi là xong, ví dụ: đã review, có test, CI xanh, đã deploy lên staging. Nhờ nó, chữ \"xong\" có cùng một nghĩa với cả đội."
        ],
        "list": [
          "Product Backlog: danh sách mọi việc có thể làm, được sắp xếp theo độ ưu tiên",
          "Sprint Backlog: việc đã chọn cho Sprint hiện tại và kế hoạch thực hiện",
          "Increment: phần sản phẩm hoạt động được, đạt Definition of Done"
        ]
      },
      {
        "h": "Viết ticket và ước lượng",
        "p": [
          "Một ticket tốt cho người đọc biết: vấn đề là gì, vì sao cần làm, tiêu chí chấp nhận (acceptance criteria) và phạm vi không làm. User story hay được viết theo mẫu \"Là [vai trò], tôi muốn [hành động] để [lợi ích]\".",
          "Ước lượng thường dùng story point, là con số tương đối về độ phức tạp chứ không phải số giờ. Nếu một ticket quá lớn để ước lượng tự tin, hãy chia nhỏ nó. Khi bị chặn, hãy báo sớm kèm lý do và phương án, đừng im lặng tới cuối Sprint."
        ],
        "code": {
          "lang": "text",
          "file": "ticket mẫu",
          "src": "Tiêu đề: Cho phép khách hàng huỷ đơn khi đơn chưa giao\n\nLà khách hàng, tôi muốn tự huỷ đơn chưa giao để không phải gọi tổng đài.\n\nTiêu chí chấp nhận:\n- Chỉ huỷ được đơn ở trạng thái PENDING hoặc CONFIRMED\n- Huỷ xong thì hoàn lại tồn kho và gửi email xác nhận\n- API trả 409 nếu đơn đã chuyển sang SHIPPING\n- Có test cho cả 3 trường hợp trên\n\nNgoài phạm vi: hoàn tiền tự động (ticket riêng #512)"
        }
      }
    ],
    "summary": [
      "Scrum Team gồm Product Owner, Scrum Master và Developers",
      "Sprint tối đa một tháng, gồm Planning, Daily Scrum, Review và Retrospective",
      "Definition of Done giúp cả đội hiểu chữ \"xong\" giống nhau",
      "Ticket tốt có bối cảnh, tiêu chí chấp nhận và phạm vi rõ ràng",
      "Báo sớm khi bị chặn, kèm lý do và phương án"
    ],
    "pitfalls": [
      "Nhận ticket mơ hồ rồi làm theo cách hiểu riêng mà không hỏi lại",
      "Coi story point là số giờ làm việc, dẫn tới so sánh năng suất giữa người với người",
      "Biến Daily Scrum thành buổi báo cáo dài cho quản lý thay vì điều chỉnh kế hoạch của đội"
    ],
    "quiz": [
      {
        "q": "Theo Scrum Guide 2020, ai chịu trách nhiệm quản lý Product Backlog?",
        "options": [
          "Scrum Master",
          "Product Owner",
          "Developers",
          "Trưởng phòng kỹ thuật"
        ],
        "answer": 1,
        "explain": "Product Owner chịu trách nhiệm quản lý Product Backlog và tối đa hoá giá trị sản phẩm. Scrum Master hỗ trợ đội áp dụng Scrum."
      },
      {
        "q": "Definition of Done dùng để làm gì?",
        "options": [
          "Liệt kê các ticket sẽ làm trong Sprint",
          "Đặt thời hạn cuối cho từng ticket",
          "Thống nhất tiêu chí để một việc được coi là hoàn thành",
          "Ghi lại các lỗi phát hiện sau khi phát hành"
        ],
        "answer": 2,
        "explain": "Definition of Done là tiêu chí chất lượng chung, ví dụ đã review, có test, CI xanh, giúp cả đội hiểu chữ \"xong\" giống nhau."
      },
      {
        "q": "Một ticket lớn tới mức cả đội không ước lượng được. Nên làm gì?",
        "options": [
          "Chia nhỏ thành các ticket có phạm vi rõ ràng hơn",
          "Gán số point lớn nhất rồi bắt đầu làm ngay",
          "Giao cho người có kinh nghiệm nhất tự ước lượng",
          "Bỏ qua ước lượng cho ticket này"
        ],
        "answer": 0,
        "explain": "Việc không ước lượng được thường do phạm vi quá lớn hoặc chưa rõ. Chia nhỏ giúp hiểu rõ hơn và ước lượng đáng tin cậy hơn."
      }
    ]
  }
});
