/* Nội dung bài học chương p04 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p04.m0.t0": {
    sections: [
      {
        h: "SELECT hoạt động theo thứ tự logic nào?",
        p: [
          "Bạn viết `SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT`, nhưng Postgres xử lý theo thứ tự logic khác: `FROM`/`JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`.",
          "Hiểu thứ tự này giải thích nhiều lỗi quen thuộc. Ví dụ bạn không dùng được alias định nghĩa trong `SELECT` ở mệnh đề `WHERE`, vì lúc `WHERE` chạy thì alias chưa tồn tại. Nhưng `ORDER BY` lại dùng được alias, vì nó chạy sau `SELECT`.",
          "`WHERE` lọc từng dòng trước khi gom nhóm. `HAVING` lọc các nhóm sau khi đã tính hàm tổng hợp như `COUNT`, `SUM`. Điều kiện nào lọc được sớm bằng `WHERE` thì nên đặt ở `WHERE` để giảm dữ liệu phải gom."
        ]
      },
      {
        h: "Các loại JOIN",
        p: [
          "JOIN ghép dòng của hai bảng theo điều kiện. Chọn sai loại JOIN là nguồn gốc của báo cáo thiếu hoặc thừa dữ liệu."
        ],
        list: [
          "`INNER JOIN`: chỉ giữ cặp dòng khớp ở cả hai bên. Khách hàng chưa có đơn sẽ biến mất khỏi kết quả.",
          "`LEFT JOIN`: giữ mọi dòng bên trái, bên phải không khớp thì điền NULL. Dùng khi cần liệt kê cả khách hàng chưa mua gì.",
          "`RIGHT JOIN`: ngược lại với LEFT; thực tế thường đổi chỗ bảng và dùng LEFT cho dễ đọc.",
          "`FULL OUTER JOIN`: giữ tất cả dòng hai bên, hay dùng khi đối soát dữ liệu giữa hai nguồn.",
          "`CROSS JOIN`: tích Descartes, mỗi dòng bên trái ghép với mọi dòng bên phải. Hữu ích để sinh lưới ngày × sản phẩm.",
          "Self join: bảng join với chính nó, ví dụ nhân viên và quản lý nằm cùng bảng `employees`."
        ],
        code: {
          lang: "sql",
          file: "report.sql",
          src: `-- Doanh thu theo khách hàng trong 2026, chỉ lấy khách chi hơn 5 triệu
SELECT c.id,
       c.full_name,
       COUNT(o.id)          AS order_count,
       SUM(o.total_amount)  AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
  AND o.created_at >= '2026-01-01'
GROUP BY c.id, c.full_name
HAVING SUM(o.total_amount) > 5000000
ORDER BY revenue DESC
LIMIT 20;

-- Khách hàng chưa từng đặt đơn: LEFT JOIN + lọc NULL
SELECT c.id, c.email
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`
        }
      },
      {
        h: "Subquery, EXISTS và UNION",
        p: [
          "Subquery là truy vấn lồng trong truy vấn khác. Với câu hỏi dạng \"có tồn tại hay không\", `EXISTS` thường rõ ý và an toàn hơn `IN`. Đặc biệt `NOT IN` với subquery có giá trị NULL sẽ trả về rỗng một cách bất ngờ, còn `NOT EXISTS` thì không bị vấn đề này.",
          "`UNION` gộp kết quả của hai truy vấn có cùng số cột và kiểu tương thích, đồng thời loại bỏ dòng trùng. `UNION ALL` giữ nguyên mọi dòng và nhanh hơn vì không phải khử trùng. Nếu bạn biết chắc không có trùng hoặc không quan tâm, hãy dùng `UNION ALL`."
        ],
        code: {
          lang: "sql",
          file: "subquery.sql",
          src: `-- Sản phẩm đã từng được bán ít nhất một lần
SELECT p.id, p.name
FROM products p
WHERE EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);

-- Gộp hai nguồn thông báo thành một luồng hoạt động
SELECT user_id, 'comment' AS kind, created_at FROM comments
UNION ALL
SELECT user_id, 'like'    AS kind, created_at FROM likes
ORDER BY created_at DESC
LIMIT 50;`
        }
      }
    ],
    summary: [
      "Thứ tự logic: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
      "WHERE lọc dòng trước khi gom nhóm, HAVING lọc nhóm sau khi tổng hợp.",
      "LEFT JOIN + `IS NULL` là mẫu tìm bản ghi \"không có liên kết\".",
      "Ưu tiên `EXISTS`/`NOT EXISTS` thay cho `NOT IN` khi subquery có thể chứa NULL.",
      "`UNION ALL` nhanh hơn `UNION` vì không khử trùng."
    ],
    pitfalls: [
      "Đặt điều kiện của bảng bên phải vào `WHERE` sau một `LEFT JOIN` (ví dụ `WHERE o.status = 'paid'`) vô tình biến nó thành INNER JOIN. Hãy đưa điều kiện đó vào mệnh đề `ON` nếu muốn giữ các dòng không khớp.",
      "Dùng `NOT IN (SELECT ...)` khi cột có NULL khiến kết quả rỗng. Dùng `NOT EXISTS` thay thế.",
      "`SELECT *` trong code ứng dụng làm tải thừa cột và dễ vỡ khi schema đổi. Hãy liệt kê cột cần dùng."
    ],
    quiz: [
      {
        q: "Muốn lọc các nhóm có tổng doanh thu lớn hơn 10 triệu, bạn đặt điều kiện ở đâu?",
        options: ["HAVING", "WHERE", "ORDER BY", "ON của JOIN"],
        answer: 0,
        explain: "HAVING chạy sau GROUP BY nên dùng được hàm tổng hợp như SUM. WHERE chạy trước khi gom nhóm nên không biết tổng; ORDER BY chỉ sắp xếp; ON chỉ là điều kiện ghép bảng."
      },
      {
        q: "Truy vấn nào liệt kê đúng khách hàng chưa có đơn hàng nào?",
        options: [
          "customers INNER JOIN orders ... WHERE o.id IS NULL",
          "customers LEFT JOIN orders ... WHERE o.id IS NULL",
          "customers CROSS JOIN orders",
          "customers FULL JOIN orders ... WHERE c.id IS NULL"
        ],
        answer: 1,
        explain: "LEFT JOIN giữ mọi khách hàng, dòng không có đơn sẽ có o.id là NULL, nên lọc IS NULL ra đúng tập cần tìm. INNER JOIN đã loại khách không có đơn từ đầu; CROSS JOIN ghép mọi cặp; điều kiện c.id IS NULL trong FULL JOIN lại tìm đơn không có khách."
      },
      {
        q: "Khác biệt chính giữa UNION và UNION ALL là gì?",
        options: [
          "UNION ALL loại bỏ dòng trùng, UNION thì không",
          "UNION chỉ dùng được với hai bảng giống hệt nhau",
          "UNION loại bỏ dòng trùng nên tốn thêm chi phí, UNION ALL giữ tất cả",
          "Không có khác biệt, chỉ là cú pháp khác"
        ],
        answer: 2,
        explain: "UNION phải khử trùng (sắp xếp hoặc băm) nên chậm hơn; UNION ALL giữ nguyên mọi dòng. Cả hai chỉ yêu cầu cùng số cột và kiểu tương thích, không cần bảng giống hệt."
      }
    ]
  },

  "p04.m0.t1": {
    sections: [
      {
        h: "CTE: đặt tên cho từng bước truy vấn",
        p: [
          "CTE (Common Table Expression) viết bằng `WITH` cho phép bạn đặt tên cho một truy vấn con rồi dùng lại như một bảng tạm. Truy vấn dài 60 dòng trở nên dễ đọc vì mỗi bước có tên rõ ràng: `paid_orders`, `monthly_revenue`, ...",
          "Từ PostgreSQL 12, CTE không đệ quy và chỉ được tham chiếu một lần sẽ được planner \"inline\" vào truy vấn chính, nên thường không chậm hơn subquery. Nếu bạn muốn ép Postgres tính CTE một lần rồi dùng lại, có thể viết `WITH x AS MATERIALIZED (...)`; ngược lại `NOT MATERIALIZED` để ép inline."
        ]
      },
      {
        h: "Recursive CTE cho dữ liệu dạng cây",
        p: [
          "Danh mục sản phẩm, cây bình luận, sơ đồ tổ chức đều là dữ liệu cây lưu bằng cột `parent_id`. `WITH RECURSIVE` gồm hai phần nối bằng `UNION ALL`: phần neo (anchor) lấy nút gốc, phần đệ quy join bảng với chính kết quả vừa sinh ra. Vòng lặp dừng khi phần đệ quy không trả thêm dòng nào.",
          "Hãy thêm cột `depth` hoặc giới hạn độ sâu để phòng dữ liệu bị vòng lặp (A là cha B, B lại là cha A). PostgreSQL 14+ còn có mệnh đề `CYCLE` để phát hiện chu trình."
        ],
        code: {
          lang: "sql",
          file: "category_tree.sql",
          src: `-- Lấy toàn bộ danh mục con của "Điện tử" (id = 1), kèm đường dẫn
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name, 1 AS depth, name::text AS path
  FROM categories
  WHERE id = 1
  UNION ALL
  SELECT c.id, c.parent_id, c.name, t.depth + 1, t.path || ' > ' || c.name
  FROM categories c
  JOIN tree t ON c.parent_id = t.id
  WHERE t.depth < 10
)
SELECT id, name, depth, path FROM tree ORDER BY path;`
        }
      },
      {
        h: "Window function: tính toán mà không gộp dòng",
        p: [
          "Khác với `GROUP BY` gộp nhiều dòng thành một, window function tính trên một \"cửa sổ\" các dòng liên quan nhưng vẫn giữ nguyên từng dòng. Cú pháp chung là `hàm() OVER (PARTITION BY ... ORDER BY ...)`.",
          "Ví dụ thực tế: lấy đơn hàng mới nhất của mỗi khách, xếp hạng sản phẩm bán chạy trong từng danh mục, tính doanh thu lũy kế theo ngày, so sánh doanh thu tháng này với tháng trước."
        ],
        list: [
          "`ROW_NUMBER()`: đánh số 1, 2, 3... không trùng, kể cả khi giá trị bằng nhau.",
          "`RANK()`: giá trị bằng nhau cùng hạng và bỏ qua hạng kế (1, 1, 3). `DENSE_RANK()` không bỏ hạng (1, 1, 2).",
          "`LAG()`/`LEAD()`: lấy giá trị của dòng trước/sau trong cửa sổ.",
          "`SUM() OVER (ORDER BY ...)`: tổng lũy kế."
        ],
        code: {
          lang: "sql",
          file: "window.sql",
          src: `-- Đơn mới nhất của mỗi khách hàng
SELECT *
FROM (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
  FROM orders o
) x
WHERE rn = 1;

-- Doanh thu theo ngày, lũy kế và chênh lệch so với ngày trước
SELECT day,
       revenue,
       SUM(revenue) OVER (ORDER BY day)  AS running_total,
       revenue - LAG(revenue) OVER (ORDER BY day) AS diff_vs_prev_day
FROM daily_revenue
ORDER BY day;`
        }
      }
    ],
    summary: [
      "CTE (`WITH`) giúp chia truy vấn phức tạp thành các bước có tên, dễ đọc và dễ debug.",
      "`WITH RECURSIVE` = phần neo + `UNION ALL` + phần đệ quy; phù hợp để duyệt dữ liệu cây.",
      "Window function tính trên tập dòng liên quan mà không gộp dòng như GROUP BY.",
      "ROW_NUMBER để lấy top-N mỗi nhóm; RANK/DENSE_RANK để xếp hạng; LAG/LEAD để so sánh dòng kề."
    ],
    pitfalls: [
      "Không đặt giới hạn độ sâu trong recursive CTE: dữ liệu có chu trình sẽ làm truy vấn chạy mãi. Thêm điều kiện `depth < N` hoặc dùng mệnh đề `CYCLE`.",
      "Lọc theo kết quả window function ngay trong `WHERE` (ví dụ `WHERE ROW_NUMBER() OVER(...) = 1`) là lỗi, vì WHERE chạy trước window. Hãy bọc trong subquery hoặc CTE rồi mới lọc.",
      "Quên `ORDER BY` trong `OVER()` khi dùng `LAG` hoặc tổng lũy kế khiến thứ tự không xác định và kết quả sai."
    ],
    quiz: [
      {
        q: "Bạn cần lấy đúng 1 đơn hàng mới nhất cho mỗi khách, kể cả khi có hai đơn cùng thời điểm. Hàm nào phù hợp nhất?",
        options: ["RANK()", "DENSE_RANK()", "COUNT(*)", "ROW_NUMBER()"],
        answer: 3,
        explain: "ROW_NUMBER luôn đánh số duy nhất nên lọc rn = 1 chắc chắn ra 1 dòng. RANK và DENSE_RANK cho hai dòng bằng nhau cùng hạng 1 nên có thể ra 2 dòng. COUNT không đánh số thứ tự."
      },
      {
        q: "Recursive CTE dừng lại khi nào?",
        options: [
          "Khi phần đệ quy không sinh thêm dòng mới nào",
          "Khi phần neo trả về rỗng lần thứ hai",
          "Sau đúng 100 vòng lặp",
          "Khi gặp ORDER BY"
        ],
        answer: 0,
        explain: "Postgres lặp lại phần đệ quy trên kết quả của vòng trước; khi vòng đó không trả dòng nào thì dừng. Không có giới hạn 100 vòng mặc định, vì vậy bạn phải tự chống chu trình."
      },
      {
        q: "Điểm khác biệt cốt lõi giữa window function và GROUP BY là gì?",
        options: [
          "Window function chỉ dùng được với số nguyên",
          "Window function giữ nguyên từng dòng, GROUP BY gộp các dòng thành một",
          "GROUP BY nhanh hơn trong mọi trường hợp",
          "Window function không dùng được cùng WHERE"
        ],
        answer: 1,
        explain: "Window function trả giá trị tính toán cho từng dòng mà không làm mất dòng, còn GROUP BY trả một dòng cho mỗi nhóm. Window function dùng được với nhiều kiểu dữ liệu và vẫn kết hợp với WHERE (WHERE lọc trước)."
      }
    ]
  },

  "p04.m0.t2": {
    sections: [
      {
        h: "Vì sao để database giữ ràng buộc?",
        p: [
          "Code ứng dụng có thể kiểm tra dữ liệu, nhưng nó không phải hàng rào cuối cùng. Một script migration, một admin chạy SQL tay, hay hai request đồng thời vượt qua cùng một lần kiểm tra \"email đã tồn tại chưa\" đều có thể đưa dữ liệu sai vào.",
          "Ràng buộc (constraint) trong database được kiểm tra cho mọi câu lệnh ghi, bất kể đến từ đâu, và an toàn khi chạy đồng thời. Validation ở tầng API giúp trả lỗi thân thiện; constraint trong DB đảm bảo tính toàn vẹn. Bạn cần cả hai."
        ]
      },
      {
        h: "Các loại ràng buộc chính",
        list: [
          "`PRIMARY KEY`: định danh duy nhất mỗi dòng, ngầm định NOT NULL + UNIQUE và tự tạo index.",
          "`FOREIGN KEY`: giá trị phải tồn tại ở bảng được tham chiếu. Postgres KHÔNG tự tạo index cho cột FK ở bảng con, bạn nên tự tạo.",
          "`UNIQUE`: không cho trùng. Mặc định nhiều NULL không bị coi là trùng; từ PostgreSQL 15 có `UNIQUE NULLS NOT DISTINCT` nếu muốn coi NULL là bằng nhau.",
          "`CHECK`: biểu thức phải đúng, ví dụ `price >= 0` hoặc `end_at > start_at`.",
          "`NOT NULL`: cột bắt buộc có giá trị. Nên là mặc định trừ khi có lý do rõ ràng để cho phép NULL."
        ],
        p: [
          "Đặt tên constraint rõ ràng (ví dụ `users_email_key`) giúp bạn map lỗi từ DB sang thông báo cho người dùng. Khi vi phạm UNIQUE, Postgres trả SQLSTATE `23505`; vi phạm FK là `23503`; CHECK là `23514`."
        ],
        code: {
          lang: "sql",
          file: "schema.sql",
          src: `CREATE TABLE users (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'cancelled')),
  total_amount numeric(14,2) NOT NULL CHECK (total_amount >= 0)
);

CREATE TABLE order_items (
  order_id   bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id bigint NOT NULL,
  quantity   int NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id)
);

-- FK không tự có index: tạo để JOIN và xoá cha không phải quét cả bảng
CREATE INDEX orders_user_id_idx ON orders (user_id);`
        }
      },
      {
        h: "Chọn hành vi ON DELETE",
        p: [
          "Khi xoá dòng cha, FK quyết định số phận dòng con. `RESTRICT`/`NO ACTION` (mặc định là NO ACTION) chặn xoá nếu còn con. `CASCADE` xoá luôn con, hợp với quan hệ \"sở hữu\" như order → order_items. `SET NULL` giữ con nhưng bỏ liên kết, hợp với bài viết khi tác giả rời đi.",
          "Hãy cân nhắc kỹ với `CASCADE`: xoá một user có thể kéo theo hàng nghìn dòng ở nhiều bảng. Với dữ liệu tài chính như đơn hàng, thường nên `RESTRICT` và dùng soft delete ở tầng nghiệp vụ."
        ]
      }
    ],
    summary: [
      "Constraint là hàng rào cuối cùng, được kiểm tra với mọi lệnh ghi và an toàn khi đồng thời.",
      "PK, FK, UNIQUE, CHECK, NOT NULL: dùng đủ để DB từ chối dữ liệu sai.",
      "Postgres không tự tạo index cho cột FK ở bảng con; hãy tự tạo.",
      "ON DELETE CASCADE cho quan hệ sở hữu, RESTRICT cho dữ liệu quan trọng, SET NULL cho liên kết tùy chọn."
    ],
    pitfalls: [
      "Chỉ kiểm tra trùng email ở code (SELECT rồi INSERT): hai request đồng thời vẫn tạo hai bản ghi. Hãy dựa vào UNIQUE constraint và bắt lỗi `23505`.",
      "Dùng `ON DELETE CASCADE` tràn lan khiến một lệnh xoá nhầm lan ra cả hệ thống. Chỉ dùng cho quan hệ cha-con thật sự.",
      "Quên index trên cột FK làm JOIN chậm và mỗi lần xoá dòng cha phải quét toàn bảng con."
    ],
    quiz: [
      {
        q: "Vì sao chỉ kiểm tra \"email đã tồn tại\" trong code là chưa đủ?",
        options: [
          "Vì code không đọc được database",
          "Vì Postgres không hỗ trợ so sánh chuỗi",
          "Vì hai request đồng thời có thể cùng vượt qua bước kiểm tra rồi cùng INSERT",
          "Vì UNIQUE constraint làm chậm SELECT"
        ],
        answer: 2,
        explain: "Đây là race condition kiểu check-then-act: cả hai request thấy email chưa có rồi cùng ghi. UNIQUE constraint được DB kiểm tra nguyên tử nên chặn được. Các lựa chọn khác sai về bản chất."
      },
      {
        q: "Quan hệ orders → order_items nên dùng ON DELETE gì?",
        options: ["SET NULL", "SET DEFAULT", "Không cần FK", "CASCADE"],
        answer: 3,
        explain: "order_items không có ý nghĩa khi không còn order, nên xoá order thì xoá luôn item (CASCADE). SET NULL tạo item mồ côi; bỏ FK làm mất toàn vẹn; SET DEFAULT không có giá trị mặc định hợp lý."
      },
      {
        q: "Khi tạo FOREIGN KEY, Postgres tự động làm gì?",
        options: [
          "Không tự tạo index cho cột FK ở bảng con; cột được tham chiếu phải có PK/UNIQUE",
          "Tạo index trên cả hai bảng",
          "Tạo index trên cột FK ở bảng con",
          "Tự chuyển cột thành NOT NULL"
        ],
        answer: 0,
        explain: "Cột được tham chiếu phải có PK hoặc UNIQUE (nên đã có index), nhưng cột FK ở bảng con không tự có index. FK cũng không tự đặt NOT NULL, bạn phải khai báo riêng."
      }
    ]
  },

  "p04.m0.t3": {
    sections: [
      {
        h: "Chọn kiểu dữ liệu là quyết định dài hạn",
        p: [
          "Đổi kiểu cột trên bảng hàng chục triệu dòng thường phải viết lại toàn bộ bảng và khoá lâu. Vì vậy chọn đúng kiểu từ đầu rẻ hơn rất nhiều so với sửa sau.",
          "Nguyên tắc chung: dùng kiểu mô tả đúng ý nghĩa dữ liệu, để DB kiểm tra giúp bạn. Ngày giờ lưu bằng kiểu thời gian chứ không phải chuỗi, tiền lưu bằng số chính xác chứ không phải số thực."
        ]
      },
      {
        h: "Những lựa chọn quan trọng",
        list: [
          "Khoá chính: `bigint GENERATED ALWAYS AS IDENTITY` gọn và nhanh. `uuid` hợp khi cần sinh ID ở client hoặc không muốn lộ số lượng bản ghi. PostgreSQL 18 có hàm `uuidv7()` sinh UUID có thứ tự thời gian, chèn vào B-tree tốt hơn UUID v4 ngẫu nhiên (`gen_random_uuid()`).",
          "Thời gian: dùng `timestamptz`. Postgres lưu nội bộ theo UTC và chuyển đổi theo `TimeZone` của session khi hiển thị. `timestamp` (không tz) chỉ lưu \"giờ đồng hồ\", dễ lệch khi server và người dùng khác múi giờ.",
          "Tiền: dùng `numeric(p, s)` hoặc lưu số nguyên đơn vị nhỏ nhất (đồng, cent) bằng `bigint`. Không dùng `real`/`double precision` vì số thực nhị phân không biểu diễn chính xác 0.1.",
          "Chuỗi: `text` và `varchar(n)` có hiệu năng như nhau trong Postgres. Dùng `text` kèm CHECK độ dài nếu cần giới hạn.",
          "`jsonb`: lưu JSON dạng nhị phân, hỗ trợ toán tử và GIN index. Hợp với thuộc tính linh hoạt, không thay thế cho cột có cấu trúc rõ.",
          "`enum`: gọn và an toàn kiểu, nhưng thêm giá trị dễ còn xoá/đổi tên giá trị thì khó. Nhiều đội chọn `text + CHECK` hoặc bảng tra cứu cho linh hoạt.",
          "Array (`text[]`): tiện cho danh sách nhỏ như tags, nhưng nếu cần JOIN hay ràng buộc FK thì nên tách bảng."
        ],
        p: [
          "Dưới đây là các lựa chọn bạn sẽ gặp trong hầu hết dự án backend, kèm lý do nên hoặc không nên dùng."
        ]
      },
      {
        h: "Ví dụ thực tế",
        p: [
          "Bảng sản phẩm dưới đây kết hợp các kiểu trên. Chú ý cách truy vấn `jsonb` bằng toán tử `->>` (lấy text) và `@>` (chứa), cùng GIN index để tăng tốc."
        ],
        code: {
          lang: "sql",
          file: "products.sql",
          src: `CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT uuidv7(),
  name        text NOT NULL CHECK (length(name) <= 200),
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  tags        text[] NOT NULL DEFAULT '{}',
  attributes  jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_attributes_gin ON products USING gin (attributes);

INSERT INTO products (name, price, tags, attributes)
VALUES ('Tai nghe X', 1990000.00, '{audio,bluetooth}', '{"color": "black", "warranty_months": 12}');

-- Lọc theo thuộc tính jsonb và tag
SELECT name, attributes->>'color' AS color
FROM products
WHERE attributes @> '{"color": "black"}'
  AND 'bluetooth' = ANY (tags);

-- Hiển thị theo giờ Việt Nam
SELECT created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' FROM products;

-- Vì sao không dùng float cho tiền
SELECT 0.1::float8 + 0.2::float8 = 0.3::float8 AS float_ok,   -- false
       0.1::numeric + 0.2::numeric = 0.3::numeric AS numeric_ok; -- true`
        }
      }
    ],
    summary: [
      "Dùng `timestamptz` cho mọi mốc thời gian; Postgres lưu theo UTC.",
      "Tiền dùng `numeric` hoặc số nguyên đơn vị nhỏ nhất, không bao giờ dùng float.",
      "`uuidv7()` (PostgreSQL 18) cho UUID có thứ tự, thân thiện với index hơn UUID v4.",
      "`jsonb` cho thuộc tính linh hoạt, kèm GIN index; đừng biến mọi thứ thành JSON.",
      "`text` và `varchar(n)` hiệu năng như nhau; enum khó sửa khi cần xoá giá trị."
    ],
    pitfalls: [
      "Lưu thời gian bằng `timestamp` không tz rồi server đổi múi giờ, dữ liệu lệch 7 tiếng. Luôn dùng `timestamptz`.",
      "Dùng `double precision` cho số dư ví, cộng dồn sai lệch từng đồng. Dùng `numeric` hoặc `bigint`.",
      "Nhét toàn bộ dữ liệu vào một cột `jsonb` để \"khỏi migration\": mất ràng buộc, khó truy vấn, khó index. Chỉ dùng jsonb cho phần thật sự linh hoạt."
    ],
    quiz: [
      {
        q: "Kiểu nào phù hợp nhất để lưu số tiền trong đơn hàng?",
        options: ["real", "numeric(14,2)", "double precision", "text"],
        answer: 1,
        explain: "numeric lưu số thập phân chính xác. real và double precision là số thực nhị phân, có sai số làm tròn. text không cho phép tính toán và kiểm tra kiểu."
      },
      {
        q: "Phát biểu nào đúng về `timestamptz` trong PostgreSQL?",
        options: [
          "Nó lưu kèm tên múi giờ của từng giá trị",
          "Nó chỉ dùng được khi server đặt múi giờ UTC",
          "Nó lưu thời điểm theo UTC và chuyển đổi theo TimeZone của session khi hiển thị",
          "Nó tốn gấp đôi dung lượng so với timestamp"
        ],
        answer: 2,
        explain: "timestamptz chuẩn hoá về UTC khi lưu và hiển thị theo TimeZone của session; nó không lưu tên múi giờ gốc. Cả timestamp và timestamptz đều dùng 8 byte."
      },
      {
        q: "Vì sao UUID v7 thường tốt hơn UUID v4 làm khoá chính?",
        options: [
          "UUID v7 ngắn hơn",
          "UUID v4 không lưu được trong cột uuid",
          "UUID v7 không bao giờ trùng còn v4 hay trùng",
          "UUID v7 có tiền tố thời gian nên giá trị mới tăng dần, chèn vào B-tree ít phân mảnh hơn"
        ],
        answer: 3,
        explain: "UUID v7 chứa timestamp ở đầu nên các giá trị mới nằm cuối index, giảm page split. Cả hai đều 128 bit, xác suất trùng đều cực nhỏ, và đều lưu được trong kiểu uuid."
      }
    ]
  },

  "p04.m0.t4": {
    sections: [
      {
        h: "View: đặt tên cho truy vấn",
        p: [
          "View là một truy vấn được lưu với một cái tên. Mỗi lần bạn `SELECT` từ view, Postgres thực chất chạy truy vấn gốc. View hữu ích để đơn giản hoá báo cáo, hoặc chỉ lộ một số cột cho một role chỉ đọc.",
          "Materialized view thì khác: nó lưu kết quả xuống đĩa và chỉ cập nhật khi bạn chạy `REFRESH MATERIALIZED VIEW`. Phù hợp cho dashboard tổng hợp nặng, chấp nhận dữ liệu trễ vài phút. Dùng `REFRESH ... CONCURRENTLY` (cần một UNIQUE index trên view) để không chặn người đọc trong lúc refresh."
        ],
        code: {
          lang: "sql",
          file: "views.sql",
          src: `CREATE MATERIALIZED VIEW daily_revenue AS
SELECT date_trunc('day', created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day,
       SUM(total_amount) AS revenue,
       COUNT(*)          AS orders
FROM orders
WHERE status = 'paid'
GROUP BY 1;

CREATE UNIQUE INDEX daily_revenue_day_idx ON daily_revenue (day);

-- Chạy định kỳ bằng cron/job scheduler
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;`
        }
      },
      {
        h: "Function và Trigger",
        p: [
          "Function (viết bằng SQL hoặc PL/pgSQL) chạy ngay trong database, gần dữ liệu. Trigger gắn function vào sự kiện `INSERT`/`UPDATE`/`DELETE` và chạy tự động, cùng transaction với câu lệnh gây ra nó.",
          "Trường hợp dùng trigger hợp lý: tự cập nhật cột `updated_at`, ghi audit log mức thấp, duy trì cột `tsvector` cho full-text search. Đây là những việc kỹ thuật, không phụ thuộc nghiệp vụ, và phải đúng với mọi nguồn ghi."
        ],
        code: {
          lang: "sql",
          file: "updated_at_trigger.sql",
          src: `CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();`
        }
      },
      {
        h: "Vì sao nên dùng có chừng mực?",
        p: [
          "Khi logic nghiệp vụ (tính khuyến mãi, gửi thông báo, trừ điểm thưởng) nằm trong trigger, đồng đội đọc code TypeScript sẽ không thấy nó. Một lệnh `UPDATE` đơn giản bỗng chậm vì trigger chạy ngầm, và bug rất khó lần ra.",
          "Code trong DB cũng khó test đơn vị, khó review, khó version hoá và khó scale ngang hơn code ứng dụng. Quy tắc thực dụng: logic nghiệp vụ đặt ở service layer; DB lo toàn vẹn dữ liệu (constraint) và vài việc kỹ thuật lặp lại. Nếu dùng trigger/function, hãy đưa chúng vào migration để có lịch sử trong git."
        ]
      }
    ],
    summary: [
      "View là truy vấn có tên, chạy lại mỗi lần đọc; materialized view lưu kết quả và cần REFRESH.",
      "`REFRESH MATERIALIZED VIEW CONCURRENTLY` không chặn đọc nhưng cần UNIQUE index.",
      "Trigger chạy trong cùng transaction với lệnh gây ra nó; hợp với `updated_at`, audit, tsvector.",
      "Không giấu nghiệp vụ trong trigger/function; mọi object DB phải nằm trong migration."
    ],
    pitfalls: [
      "Đặt logic gửi email hay gọi API ngoài trong trigger: transaction dài, khó retry, lỗi khó hiểu. Hãy dùng outbox pattern hoặc xử lý ở tầng ứng dụng.",
      "Tạo function/trigger bằng tay trên production mà không có migration: môi trường khác nhau, không ai biết nó tồn tại.",
      "Quên refresh materialized view nên dashboard hiện số liệu cũ mà không ai nhận ra. Hãy lập lịch và giám sát thời điểm refresh."
    ],
    quiz: [
      {
        q: "Khác biệt chính giữa view và materialized view?",
        options: [
          "Materialized view lưu kết quả xuống đĩa và cần REFRESH; view chạy lại truy vấn mỗi lần đọc",
          "View lưu dữ liệu, materialized view thì không",
          "Materialized view luôn luôn cập nhật theo thời gian thực",
          "View không thể JOIN nhiều bảng"
        ],
        answer: 0,
        explain: "Materialized view là ảnh chụp kết quả, chỉ mới khi REFRESH. View thường chỉ là truy vấn có tên, không lưu dữ liệu, và có thể JOIN tùy ý."
      },
      {
        q: "Việc nào sau đây là hợp lý để làm bằng trigger?",
        options: [
          "Tính giá khuyến mãi theo chiến dịch marketing",
          "Tự động cập nhật cột updated_at khi dòng thay đổi",
          "Gửi email xác nhận đơn hàng",
          "Gọi API thanh toán"
        ],
        answer: 1,
        explain: "Cập nhật updated_at là việc kỹ thuật, đơn giản, phải đúng với mọi nguồn ghi. Khuyến mãi là nghiệp vụ hay thay đổi; email và API ngoài là tác vụ I/O không nên chạy trong transaction DB."
      },
      {
        q: "Trigger BEFORE UPDATE chạy trong transaction nào?",
        options: [
          "Một transaction riêng, sau khi lệnh UPDATE commit",
          "Không có transaction",
          "Cùng transaction với lệnh UPDATE gây ra nó",
          "Một transaction nền do autovacuum tạo"
        ],
        answer: 2,
        explain: "Trigger chạy trong cùng transaction; nếu trigger lỗi thì cả lệnh UPDATE bị rollback. Đó cũng là lý do trigger chậm sẽ làm chậm chính câu lệnh ghi."
      }
    ]
  },

  "p04.m1.t0": {
    sections: [
      {
        h: "ERD: vẽ trước khi tạo bảng",
        p: [
          "ERD (Entity Relationship Diagram) mô tả các thực thể (User, Order, Product), thuộc tính của chúng và quan hệ giữa chúng. Vẽ ERD trước khi code giúp cả đội thống nhất nghiệp vụ: một đơn có nhiều sản phẩm không? Một sản phẩm thuộc nhiều danh mục không?",
          "Công cụ như dbdiagram.io, draw.io hoặc Mermaid `erDiagram` đều đủ dùng. Quan trọng là ghi rõ bản số (cardinality) ở mỗi đầu quan hệ và cột nào là khoá ngoại."
        ]
      },
      {
        h: "Ba kiểu quan hệ và cách hiện thực",
        list: [
          "1-1: một user có đúng một profile. Hiện thực bằng FK kèm UNIQUE ở bảng phụ, hoặc dùng chung khoá chính. Thường tách bảng khi phần phụ ít dùng hoặc nhạy cảm.",
          "1-n: một customer có nhiều order. FK đặt ở phía \"nhiều\" (`orders.customer_id`).",
          "n-n: một bài viết có nhiều tag, một tag gắn nhiều bài. Cần bảng trung gian `post_tags(post_id, tag_id)` với khoá chính ghép. Bảng trung gian có thể mang thêm dữ liệu, như `order_items` có `quantity` và `unit_price`."
        ],
        p: [
          "Mẹo: nếu bảng trung gian bắt đầu có nhiều thuộc tính và nghiệp vụ riêng, hãy coi nó là một thực thể thật (ví dụ `enrollments` giữa students và courses)."
        ],
        code: {
          lang: "sql",
          file: "relations.sql",
          src: `-- 1-1
CREATE TABLE user_profiles (
  user_id    bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url text,
  bio        text
);

-- n-n qua bảng trung gian
CREATE TABLE tags (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);
CREATE TABLE post_tags (
  post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  bigint NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
-- PK (post_id, tag_id) đã phục vụ truy vấn theo post; thêm index cho chiều ngược lại
CREATE INDEX post_tags_tag_id_idx ON post_tags (tag_id);`
        }
      },
      {
        h: "Soft delete và audit columns",
        p: [
          "Soft delete nghĩa là không xoá dòng mà đánh dấu `deleted_at`. Lợi ích: khôi phục được, giữ lịch sử cho báo cáo. Cái giá: mọi truy vấn phải nhớ lọc `deleted_at IS NULL`, và UNIQUE phải chuyển thành partial unique index để email của user đã xoá không chặn người đăng ký mới.",
          "Audit columns (`created_at`, `updated_at`, `created_by`, `updated_by`) nên có ở hầu hết bảng nghiệp vụ. Chúng rẻ và cực kỳ hữu ích khi điều tra sự cố. Với yêu cầu lịch sử đầy đủ (ai đổi gì, lúc nào), hãy dùng bảng audit log riêng."
        ],
        code: {
          lang: "sql",
          file: "soft_delete.sql",
          src: `ALTER TABLE users ADD COLUMN deleted_at timestamptz;

-- Email chỉ cần duy nhất trong các user chưa bị xoá
ALTER TABLE users DROP CONSTRAINT users_email_key;
CREATE UNIQUE INDEX users_email_active_key ON users (email) WHERE deleted_at IS NULL;

-- Soft delete
UPDATE users SET deleted_at = now() WHERE id = 42;`
        }
      }
    ],
    summary: [
      "Vẽ ERD để chốt nghiệp vụ và bản số quan hệ trước khi tạo bảng.",
      "1-n: FK ở phía nhiều; n-n: bảng trung gian với khoá chính ghép; 1-1: FK + UNIQUE hoặc chung PK.",
      "Soft delete cần lọc `deleted_at IS NULL` ở mọi truy vấn và dùng partial unique index.",
      "Audit columns rẻ nhưng rất giá trị khi điều tra sự cố."
    ],
    pitfalls: [
      "Lưu quan hệ n-n bằng chuỗi `\"1,5,9\"` trong một cột: không có FK, không JOIN được hiệu quả. Hãy dùng bảng trung gian.",
      "Bật soft delete nhưng quên lọc ở một vài truy vấn, dữ liệu \"đã xoá\" hiện lại cho người dùng. Cân nhắc view hoặc scope mặc định trong ORM.",
      "Giữ UNIQUE thường trên email khi dùng soft delete, người dùng đã xoá tài khoản không thể đăng ký lại."
    ],
    quiz: [
      {
        q: "Quan hệ giữa students và courses (một học viên học nhiều khoá, một khoá có nhiều học viên) nên hiện thực thế nào?",
        options: [
          "Thêm cột course_id vào students",
          "Thêm cột student_ids kiểu text vào courses",
          "Gộp hai bảng thành một",
          "Tạo bảng trung gian enrollments(student_id, course_id)"
        ],
        answer: 3,
        explain: "Đây là quan hệ n-n nên cần bảng trung gian, có thể kèm thuộc tính như ngày đăng ký, tiến độ. Một cột course_id chỉ cho mỗi học viên một khoá; chuỗi ID mất toàn vẹn dữ liệu."
      },
      {
        q: "Khi dùng soft delete, vì sao nên đổi UNIQUE(email) thành partial unique index `WHERE deleted_at IS NULL`?",
        options: [
          "Để user đã bị xoá mềm không chặn người khác đăng ký cùng email",
          "Để tăng tốc INSERT",
          "Vì Postgres không hỗ trợ UNIQUE trên text",
          "Để email được phép NULL"
        ],
        answer: 0,
        explain: "Dòng xoá mềm vẫn nằm trong bảng; UNIQUE thường sẽ coi email đó đã bị dùng. Partial index chỉ áp dụng cho dòng còn hoạt động."
      },
      {
        q: "Với quan hệ 1-n giữa customers và orders, khoá ngoại nằm ở đâu?",
        options: [
          "customers.order_id",
          "orders.customer_id",
          "Cả hai bảng",
          "Bảng trung gian customer_orders"
        ],
        answer: 1,
        explain: "FK đặt ở phía \"nhiều\": mỗi order trỏ về một customer. Đặt ở customers chỉ cho mỗi khách một đơn; bảng trung gian chỉ cần cho n-n."
      }
    ]
  },

  "p04.m1.t1": {
    sections: [
      {
        h: "Chuẩn hoá để làm gì?",
        p: [
          "Chuẩn hoá (normalization) là tổ chức bảng sao cho mỗi sự thật chỉ lưu ở một chỗ. Khi tên khách hàng được chép vào từng dòng đơn hàng, đổi tên phải sửa hàng nghìn dòng và rất dễ sót. Đó là update anomaly.",
          "Ba loại bất thường mà chuẩn hoá loại bỏ: update anomaly (sửa một chỗ quên chỗ khác), insert anomaly (không thêm được sản phẩm vì chưa có đơn nào), delete anomaly (xoá đơn cuối cùng làm mất luôn thông tin sản phẩm)."
        ]
      },
      {
        h: "1NF, 2NF, 3NF, BCNF bằng ví dụ",
        list: [
          "1NF: mỗi ô chứa một giá trị nguyên tố, không có nhóm lặp. Cột `phones = '090..., 091...'` vi phạm 1NF; tách ra bảng `user_phones`.",
          "2NF: đạt 1NF và mọi cột không khoá phụ thuộc vào toàn bộ khoá chính, không chỉ một phần. Trong `order_items(order_id, product_id, quantity, product_name)`, `product_name` chỉ phụ thuộc `product_id` nên phải chuyển về bảng `products`.",
          "3NF: đạt 2NF và không có phụ thuộc bắc cầu. Trong `employees(id, department_id, department_name)`, `department_name` phụ thuộc `department_id` chứ không phải `id`, nên tách bảng `departments`.",
          "BCNF: mọi phụ thuộc hàm X → Y đều có X là siêu khoá. Chặt hơn 3NF một chút; thực tế hiếm khi khác biệt."
        ],
        p: [
          "Với hầu hết hệ thống OLTP (giao dịch), đạt 3NF là mục tiêu mặc định hợp lý."
        ]
      },
      {
        h: "Phi chuẩn hoá có chủ đích",
        p: [
          "Chuẩn hoá tối đa có thể làm màn hình danh sách phải JOIN 6 bảng. Phi chuẩn hoá (denormalization) là cố ý lưu trùng dữ liệu để đọc nhanh hơn, và bạn chấp nhận trách nhiệm đồng bộ nó.",
          "Có một trường hợp phi chuẩn hoá là bắt buộc về nghiệp vụ: `order_items.unit_price` phải lưu giá tại thời điểm mua, vì giá sản phẩm sẽ thay đổi sau này. Đây là \"ảnh chụp lịch sử\", không phải dữ liệu trùng.",
          "Các dạng phổ biến khác: cột đếm `posts.comment_count`, cột tổng `orders.total_amount`, materialized view cho báo cáo, hoặc bản đọc trong Elasticsearch. Hãy đo trước, phi chuẩn hoá sau, và luôn có cách tính lại từ nguồn chuẩn."
        ],
        code: {
          lang: "sql",
          file: "denormalize.sql",
          src: `ALTER TABLE posts ADD COLUMN comment_count int NOT NULL DEFAULT 0;

-- Cập nhật đếm trong cùng transaction với việc thêm comment
BEGIN;
INSERT INTO comments (post_id, user_id, body) VALUES (10, 42, 'Bài hay!');
UPDATE posts SET comment_count = comment_count + 1 WHERE id = 10;
COMMIT;

-- Job đối soát định kỳ: tính lại từ nguồn chuẩn
UPDATE posts p
SET comment_count = sub.cnt
FROM (SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id) sub
WHERE sub.post_id = p.id AND p.comment_count <> sub.cnt;`
        }
      }
    ],
    summary: [
      "Chuẩn hoá giúp mỗi sự thật lưu một chỗ, loại bỏ update/insert/delete anomaly.",
      "3NF là mặc định tốt cho hệ thống giao dịch.",
      "Phi chuẩn hoá là đánh đổi: đọc nhanh hơn, đổi lại phải đồng bộ dữ liệu trùng.",
      "Giá tại thời điểm mua là dữ liệu lịch sử cần lưu lại, không phải trùng lặp thừa."
    ],
    pitfalls: [
      "Tham chiếu `products.price` hiện tại khi in lại hoá đơn cũ, số tiền bị sai. Lưu `unit_price` vào `order_items`.",
      "Phi chuẩn hoá khi chưa đo, sinh ra bug đồng bộ mà không tăng tốc bao nhiêu. Hãy dùng EXPLAIN ANALYZE và index trước.",
      "Cập nhật cột đếm ngoài transaction với thao tác chính, số liệu lệch dần. Hãy làm trong cùng transaction và có job đối soát."
    ],
    quiz: [
      {
        q: "Bảng `employees(id, department_id, department_name)` vi phạm dạng chuẩn nào?",
        options: ["1NF", "Không vi phạm", "3NF, vì có phụ thuộc bắc cầu id → department_id → department_name", "Chỉ vi phạm BCNF"],
        answer: 2,
        explain: "department_name phụ thuộc vào department_id, không trực tiếp vào khoá id, nên có phụ thuộc bắc cầu vi phạm 3NF. Mỗi ô vẫn nguyên tố nên không vi phạm 1NF."
      },
      {
        q: "Vì sao nên lưu `unit_price` trong `order_items` dù đã có `products.price`?",
        options: [
          "Để JOIN nhanh hơn",
          "Để tiết kiệm dung lượng",
          "Vì Postgres không cho JOIN với bảng products",
          "Vì giá sản phẩm thay đổi theo thời gian, đơn hàng phải giữ giá tại lúc mua"
        ],
        answer: 3,
        explain: "Đơn hàng là bản ghi lịch sử; giá lúc mua là một sự thật khác với giá hiện tại. Lưu thêm cột này tốn dung lượng hơn, không tiết kiệm."
      },
      {
        q: "Delete anomaly là gì?",
        options: [
          "Xoá một dòng làm mất luôn thông tin khác không liên quan vì chúng chỉ được lưu ở đó",
          "Không xoá được dòng vì có FK",
          "Xoá dòng làm index bị hỏng",
          "Lệnh DELETE chạy chậm"
        ],
        answer: 0,
        explain: "Nếu thông tin sản phẩm chỉ nằm trong bảng đơn hàng, xoá đơn cuối cùng cũng xoá mất sản phẩm. Chuẩn hoá tách sản phẩm ra bảng riêng để tránh điều này."
      }
    ]
  },

  "p04.m1.t2": {
    sections: [
      {
        h: "Index hoạt động thế nào?",
        p: [
          "Không có index, Postgres phải đọc từng dòng của bảng (Seq Scan) để tìm dữ liệu. Index giống mục lục sách: một cấu trúc riêng lưu giá trị cột đã sắp xếp kèm vị trí dòng, giúp tìm nhanh mà không đọc hết bảng.",
          "Loại mặc định là B-tree: cây cân bằng hỗ trợ `=`, `<`, `>`, `BETWEEN`, `ORDER BY` và `LIKE 'abc%'` (tiền tố, với collation phù hợp hoặc operator class `text_pattern_ops`). Độ phức tạp tìm kiếm là O(log n), nên bảng 100 triệu dòng vẫn chỉ cần vài lần đọc trang.",
          "Cái giá: mỗi `INSERT`/`UPDATE`/`DELETE` phải cập nhật mọi index liên quan, và index chiếm dung lượng. Bảng có 10 index sẽ ghi chậm hơn rõ rệt. Chỉ tạo index cho truy vấn thật sự cần."
        ]
      },
      {
        h: "Composite, partial và covering index",
        list: [
          "Composite `(a, b)`: dùng tốt cho điều kiện trên `a`, hoặc `a` và `b`, nhưng thường kém hiệu quả khi chỉ lọc `b` (PostgreSQL 18 có thêm skip scan giúp trường hợp này khi cột `a` có ít giá trị khác nhau, nhưng đừng dựa vào nó). Quy tắc: cột lọc bằng `=` đặt trước, cột lọc khoảng hoặc sắp xếp đặt sau.",
          "Partial: chỉ index một phần dòng thỏa `WHERE`. Ví dụ chỉ index đơn `pending` vì truy vấn chỉ quan tâm đến chúng; index nhỏ và nhanh hơn nhiều.",
          "Covering với `INCLUDE`: thêm cột vào lá của index để truy vấn lấy được dữ liệu ngay từ index (Index Only Scan) mà không phải đọc bảng.",
          "Expression index: index trên biểu thức, như `lower(email)`, để truy vấn `WHERE lower(email) = ...` dùng được index."
        ],
        p: [
          "Ví dụ: màn hình \"đơn hàng của tôi\" lọc theo `user_id` và sắp xếp `created_at DESC`. Index `(user_id, created_at DESC)` phục vụ cả lọc lẫn sắp xếp, không cần bước sort riêng."
        ],
        code: {
          lang: "sql",
          file: "indexes.sql",
          src: `-- Lọc theo user, sắp xếp mới nhất
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC);

-- Chỉ index đơn đang chờ xử lý
CREATE INDEX orders_pending_idx ON orders (created_at) WHERE status = 'pending';

-- Covering: lấy status, total_amount ngay từ index
CREATE INDEX orders_user_cover_idx ON orders (user_id) INCLUDE (status, total_amount);

-- Tìm email không phân biệt hoa thường
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- Tạo index trên bảng lớn đang chạy production mà không khoá ghi
CREATE INDEX CONCURRENTLY orders_status_idx ON orders (status);`
        }
      },
      {
        h: "GIN cho jsonb, mảng và full-text",
        p: [
          "B-tree lưu một giá trị cho mỗi dòng. Nhưng một cột `jsonb`, mảng `tags` hay `tsvector` chứa nhiều phần tử. GIN (Generalized Inverted Index) là index đảo ngược: với mỗi phần tử (key, tag, từ) nó lưu danh sách dòng chứa phần tử đó.",
          "GIN tăng tốc toán tử `@>`, `?` trên jsonb, `&&`/`@>` trên mảng và `@@` cho full-text. Đổi lại, GIN tốn công cập nhật hơn B-tree. Postgres còn có GiST (dữ liệu hình học, khoảng), BRIN (bảng rất lớn có dữ liệu tăng dần theo thời gian) và Hash."
        ],
        code: {
          lang: "sql",
          file: "gin.sql",
          src: `CREATE INDEX products_tags_gin ON products USING gin (tags);
SELECT id, name FROM products WHERE tags @> ARRAY['bluetooth'];

-- jsonb_path_ops: nhỏ hơn, chỉ hỗ trợ @> và các toán tử jsonpath
CREATE INDEX products_attr_path_gin ON products USING gin (attributes jsonb_path_ops);`
        }
      }
    ],
    summary: [
      "Index đổi tốc độ đọc lấy chi phí ghi và dung lượng; chỉ tạo cho truy vấn thật sự cần.",
      "B-tree là mặc định; composite index phụ thuộc thứ tự cột (bằng trước, khoảng/sắp xếp sau).",
      "Partial index nhỏ gọn cho tập con dữ liệu; INCLUDE cho phép Index Only Scan.",
      "GIN dành cho jsonb, mảng và full-text; dùng `CREATE INDEX CONCURRENTLY` trên production."
    ],
    pitfalls: [
      "Viết `WHERE lower(email) = $1` nhưng chỉ có index trên `email`, planner không dùng được index. Tạo expression index hoặc chuẩn hoá dữ liệu khi lưu.",
      "Tạo index `(created_at, user_id)` cho truy vấn lọc `user_id = ?`, index gần như vô dụng. Đặt cột lọc bằng lên trước.",
      "Chạy `CREATE INDEX` thường trên bảng lớn ở production, chặn mọi lệnh ghi trong nhiều phút. Dùng `CONCURRENTLY` (không chạy được trong transaction block)."
    ],
    quiz: [
      {
        q: "Có index `(user_id, created_at)`. Truy vấn nào tận dụng index kém nhất?",
        options: [
          "WHERE user_id = 5",
          "WHERE created_at > '2026-01-01'",
          "WHERE user_id = 5 AND created_at > '2026-01-01'",
          "WHERE user_id = 5 ORDER BY created_at"
        ],
        answer: 1,
        explain: "B-tree composite sắp xếp theo user_id trước, nên chỉ lọc created_at không tận dụng được thứ tự của index (skip scan ở PostgreSQL 18 chỉ giúp khi user_id có rất ít giá trị khác nhau). Ba truy vấn còn lại đều bắt đầu bằng user_id."
      },
      {
        q: "Loại index nào phù hợp cho truy vấn `attributes @> '{\"color\":\"black\"}'` trên cột jsonb?",
        options: ["B-tree", "Hash", "GIN", "Không index được jsonb"],
        answer: 2,
        explain: "GIN là index đảo ngược, lưu các key/giá trị bên trong jsonb nên hỗ trợ toán tử chứa @>. B-tree và Hash chỉ so sánh cả giá trị."
      },
      {
        q: "Mệnh đề `INCLUDE` trong CREATE INDEX dùng để làm gì?",
        options: [
          "Thêm cột vào khoá sắp xếp của index",
          "Tạo index trên nhiều bảng",
          "Bao gồm cả các dòng đã xoá",
          "Thêm cột vào lá của index để truy vấn có thể là Index Only Scan"
        ],
        answer: 3,
        explain: "Cột INCLUDE không tham gia sắp xếp/tìm kiếm nhưng được lưu trong index, giúp truy vấn lấy dữ liệu mà không đọc bảng (khi visibility map cho phép)."
      }
    ]
  },

  "p04.m1.t3": {
    sections: [
      {
        h: "Planner quyết định cách chạy truy vấn",
        p: [
          "SQL chỉ nói bạn muốn gì, không nói làm thế nào. Query planner của Postgres xem xét nhiều kế hoạch (dùng index nào, JOIN theo thứ tự nào, Nested Loop hay Hash Join) và chọn kế hoạch có cost ước tính thấp nhất. Ước tính dựa vào thống kê về dữ liệu: số dòng, phân bố giá trị, tỉ lệ NULL.",
          "`EXPLAIN` in kế hoạch dự kiến mà không chạy. `EXPLAIN ANALYZE` chạy thật truy vấn và in thêm thời gian, số dòng thực tế. Thêm `BUFFERS` để thấy số trang đọc từ cache hay từ đĩa. Lưu ý: `EXPLAIN ANALYZE` một lệnh `UPDATE`/`DELETE` sẽ thực sự thay đổi dữ liệu, hãy bọc trong `BEGIN ... ROLLBACK`."
        ],
        code: {
          lang: "sql",
          file: "explain.sql",
          src: `EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total_amount
FROM orders
WHERE user_id = 42
ORDER BY created_at DESC
LIMIT 20;

-- Với lệnh ghi: chạy thử rồi huỷ
BEGIN;
EXPLAIN ANALYZE UPDATE orders SET status = 'cancelled' WHERE id = 1;
ROLLBACK;`
        }
      },
      {
        h: "Đọc kết quả EXPLAIN",
        p: [
          "Kế hoạch là một cây; đọc từ nút trong cùng (thụt sâu nhất) ra ngoài. Mỗi nút có dạng `cost=khởi_động..tổng rows=ước_tính` và, với ANALYZE, `actual time=... rows=thực_tế loops=...`. Cost là đơn vị tương đối của planner, không phải mili giây."
        ],
        list: [
          "`Seq Scan`: đọc cả bảng. Bình thường với bảng nhỏ hoặc khi lấy phần lớn dòng; đáng lo khi bảng lớn mà chỉ lấy vài dòng.",
          "`Index Scan`: đi theo index rồi đọc dòng trong bảng. `Index Only Scan`: lấy hết dữ liệu từ index.",
          "`Bitmap Heap Scan`: gom vị trí từ index rồi đọc bảng theo thứ tự trang, hợp với số dòng trung bình.",
          "`Nested Loop`, `Hash Join`, `Merge Join`: ba chiến lược JOIN.",
          "`Sort` với `external merge Disk`: sắp xếp tràn ra đĩa, thường do thiếu index hoặc `work_mem` nhỏ."
        ],
        code: {
          lang: "text",
          file: "plan.txt",
          src: `Limit  (cost=0.43..8.95 rows=20 width=18) (actual time=0.031..0.062 rows=20 loops=1)
  ->  Index Scan using orders_user_created_idx on orders
        (cost=0.43..512.10 rows=1203 width=18) (actual time=0.030..0.058 rows=20 loops=1)
        Index Cond: (user_id = 42)
Planning Time: 0.180 ms
Execution Time: 0.085 ms
-- (Ví dụ minh hoạ; số liệu thực tế tuỳ dữ liệu của bạn)`
        }
      },
      {
        h: "Ước lượng sai và ANALYZE",
        p: [
          "Dấu hiệu quan trọng nhất là `rows` ước tính lệch xa `rows` thực tế (ví dụ ước 10, thực tế 500.000). Planner tin rằng chỉ có 10 dòng nên chọn Nested Loop, và truy vấn chậm hàng trăm lần.",
          "Nguyên nhân phổ biến là thống kê cũ, ví dụ ngay sau khi import hàng loạt dữ liệu. Autovacuum định kỳ chạy ANALYZE, nhưng sau các thay đổi lớn bạn nên chạy `ANALYZE ten_bang;` thủ công. Với các cột có tương quan (city và district), `CREATE STATISTICS` giúp planner ước tính tốt hơn.",
          "Quy trình tối ưu: bật `log_min_duration_statement` hoặc `pg_stat_statements` để tìm truy vấn chậm → `EXPLAIN (ANALYZE, BUFFERS)` → tìm nút tốn thời gian nhất và chỗ ước tính lệch → thêm index/viết lại truy vấn → đo lại."
        ],
        code: {
          lang: "sql",
          file: "stats.sql",
          src: `ANALYZE orders;

-- Top truy vấn tốn thời gian nhất (cần extension pg_stat_statements)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;`
        }
      }
    ],
    summary: [
      "EXPLAIN in kế hoạch dự kiến; EXPLAIN ANALYZE chạy thật và in số liệu thực tế.",
      "Cost là đơn vị tương đối, không phải mili giây; đọc cây từ nút trong cùng ra.",
      "Rows ước tính lệch xa thực tế là dấu hiệu thống kê cũ hoặc thiếu thống kê; chạy ANALYZE.",
      "Dùng pg_stat_statements để tìm truy vấn cần tối ưu trước khi đoán."
    ],
    pitfalls: [
      "Chạy `EXPLAIN ANALYZE DELETE ...` trên production mà quên ROLLBACK, dữ liệu bị xoá thật.",
      "Kết luận \"Seq Scan là xấu\" trên bảng 500 dòng. Với bảng nhỏ, Seq Scan thường nhanh hơn Index Scan.",
      "Test hiệu năng trên DB dev chỉ có vài trăm dòng, kế hoạch khác hoàn toàn production. Hãy test với lượng dữ liệu gần thực tế."
    ],
    quiz: [
      {
        q: "Khác biệt giữa EXPLAIN và EXPLAIN ANALYZE?",
        options: [
          "EXPLAIN ANALYZE chạy thật truy vấn và báo thời gian, số dòng thực tế",
          "Không khác biệt",
          "EXPLAIN ANALYZE cập nhật thống kê bảng",
          "EXPLAIN chỉ dùng được với SELECT"
        ],
        answer: 0,
        explain: "ANALYZE trong EXPLAIN nghĩa là thực thi. Nó không cập nhật thống kê (đó là lệnh ANALYZE riêng). EXPLAIN dùng được cho cả INSERT/UPDATE/DELETE."
      },
      {
        q: "Kế hoạch có `rows=5` ước tính nhưng `actual rows=800000`. Bước nên làm đầu tiên?",
        options: [
          "Tăng max_connections",
          "Chạy ANALYZE trên bảng liên quan để cập nhật thống kê rồi xem lại kế hoạch",
          "Xoá toàn bộ index",
          "Chuyển sang MongoDB"
        ],
        answer: 1,
        explain: "Ước tính lệch lớn thường do thống kê cũ; planner dựa trên thống kê để chọn kế hoạch. max_connections không liên quan, xoá index làm tệ hơn."
      },
      {
        q: "Giá trị `cost` trong EXPLAIN là gì?",
        options: [
          "Thời gian chạy tính bằng mili giây",
          "Số byte đọc từ đĩa",
          "Đơn vị ước tính tương đối của planner để so sánh các kế hoạch",
          "Số dòng trả về"
        ],
        answer: 2,
        explain: "Cost là con số tương đối dựa trên các tham số như seq_page_cost, cpu_tuple_cost. Thời gian thực nằm ở actual time; số dòng nằm ở rows."
      }
    ]
  },

  "p04.m1.t4": {
    sections: [
      {
        h: "N+1 là gì và vì sao nguy hiểm?",
        p: [
          "N+1 xảy ra khi bạn chạy 1 truy vấn lấy danh sách N bản ghi, rồi trong vòng lặp chạy thêm 1 truy vấn cho mỗi bản ghi để lấy dữ liệu liên quan. Tổng cộng N+1 truy vấn.",
          "Với 20 bài viết thì 21 truy vấn có vẻ ổn trên máy local, nơi mỗi truy vấn mất 0,2 ms. Trên production, mỗi round-trip tới DB có thể mất 1–2 ms, trang có 200 dòng thành 400 ms chỉ riêng độ trễ mạng, chưa kể tăng tải cho DB và chiếm kết nối trong pool.",
          "ORM làm N+1 rất dễ xảy ra vì lazy loading hoặc vì bạn gọi repository trong vòng lặp mà không nhận ra."
        ],
        code: {
          lang: "typescript",
          file: "n-plus-one.ts",
          src: `// SAI: 1 truy vấn lấy posts + N truy vấn lấy author
const posts = await prisma.post.findMany({ take: 50 });
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
  console.log(post.title, author?.name);
}`
        }
      },
      {
        h: "Nhận diện trong log",
        p: [
          "Bật log truy vấn ở môi trường dev (Prisma: `log: ['query']`, TypeORM: `logging: true`, Drizzle: `logger: true`). Dấu hiệu N+1: cùng một câu SQL chỉ khác tham số lặp lại hàng chục lần liên tiếp trong một request.",
          "Ở production, APM/tracing (OpenTelemetry) cho thấy một span HTTP chứa hàng trăm span DB nhỏ. `pg_stat_statements` cũng lộ ra truy vấn có `calls` rất cao nhưng `mean_exec_time` rất thấp."
        ]
      },
      {
        h: "Cách sửa",
        list: [
          "Eager loading/JOIN: yêu cầu ORM lấy quan hệ cùng lúc (`include` trong Prisma, `with` trong Drizzle relational query, `relations` trong TypeORM).",
          "Batch bằng `IN`: gom các ID rồi truy vấn một lần `WHERE id = ANY($1)`, sau đó ghép bằng Map trong code.",
          "DataLoader (GraphQL): gom mọi lời gọi `load(id)` trong cùng một tick thành một truy vấn batch, và cache trong phạm vi một request."
        ],
        p: [
          "Lưu ý: eager loading quá tay cũng có hại. Include 5 tầng quan hệ có thể kéo về hàng MB dữ liệu không dùng. Chỉ lấy những gì màn hình cần, và dùng `select` để giới hạn cột."
        ],
        code: {
          lang: "typescript",
          file: "fix.ts",
          src: `// ĐÚNG (cách 1): eager loading, Prisma sinh số truy vấn cố định
const posts = await prisma.post.findMany({
  take: 50,
  include: { author: { select: { id: true, name: true } } },
});

// ĐÚNG (cách 2): batch thủ công
const rows = await prisma.post.findMany({ take: 50 });
const authorIds = [...new Set(rows.map((p) => p.authorId))];
const authors = await prisma.user.findMany({ where: { id: { in: authorIds } } });
const byId = new Map(authors.map((a) => [a.id, a]));
const result = rows.map((p) => ({ ...p, author: byId.get(p.authorId) }));

// ĐÚNG (cách 3): DataLoader, tạo mới cho mỗi request
import DataLoader from 'dataloader';
const userLoader = new DataLoader<number, User | undefined>(async (ids) => {
  const users = await prisma.user.findMany({ where: { id: { in: [...ids] } } });
  const map = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => map.get(id)); // giữ đúng thứ tự ids
});`
        }
      }
    ],
    summary: [
      "N+1 = 1 truy vấn danh sách + N truy vấn con trong vòng lặp; chi phí chủ yếu là round-trip.",
      "Nhận diện bằng log truy vấn ở dev và tracing/pg_stat_statements ở production.",
      "Sửa bằng eager loading, batch với IN/ANY, hoặc DataLoader cho GraphQL.",
      "Không eager load quá mức; chọn đúng cột và quan hệ màn hình cần."
    ],
    pitfalls: [
      "Dùng một DataLoader toàn cục cho mọi request: cache bị chia sẻ giữa người dùng, lộ dữ liệu và dữ liệu cũ. Tạo DataLoader mới cho mỗi request.",
      "Hàm batch của DataLoader trả mảng không đúng thứ tự hoặc thiếu phần tử so với `ids`, dữ liệu bị gán nhầm. Luôn map lại theo thứ tự đầu vào.",
      "Chỉ test với 3 bản ghi ở local nên không thấy N+1. Viết test đếm số truy vấn hoặc seed dữ liệu đủ lớn."
    ],
    quiz: [
      {
        q: "Trong log bạn thấy `SELECT * FROM users WHERE id = $1` lặp lại 100 lần trong một request. Đây nhiều khả năng là gì?",
        options: ["Deadlock", "Lỗi SQL injection", "Thiếu connection pool", "Vấn đề N+1"],
        answer: 3,
        explain: "Cùng một truy vấn chỉ khác tham số, lặp theo số phần tử danh sách là dấu hiệu điển hình của N+1. Deadlock và injection có biểu hiện khác hẳn."
      },
      {
        q: "DataLoader giải quyết N+1 bằng cách nào?",
        options: [
          "Gom các lời gọi load(id) trong cùng một tick thành một truy vấn batch",
          "Cache kết quả vĩnh viễn trong Redis",
          "Tự tạo index cho bảng",
          "Chạy các truy vấn song song trên nhiều kết nối"
        ],
        answer: 0,
        explain: "DataLoader trì hoãn đến cuối tick hiện tại rồi gọi hàm batch một lần với toàn bộ ID. Cache của nó chỉ trong bộ nhớ, thường theo request, không phải Redis."
      },
      {
        q: "Vì sao N+1 thường không lộ ra ở môi trường local?",
        options: [
          "Vì ORM tự tắt N+1 ở local",
          "Vì dữ liệu ít và độ trễ tới DB local rất thấp nên tổng thời gian vẫn nhỏ",
          "Vì Postgres local không ghi log",
          "Vì local không dùng JOIN"
        ],
        answer: 1,
        explain: "Chi phí N+1 tỉ lệ với số bản ghi nhân độ trễ mỗi round-trip. Local có ít dữ liệu và DB ngay trên máy nên che giấu vấn đề."
      }
    ]
  },

  "p04.m1.t5": {
    sections: [
      {
        h: "Vì sao kết nối Postgres đắt?",
        p: [
          "Mỗi kết nối tới PostgreSQL được phục vụ bởi một tiến trình backend riêng trên server, tốn bộ nhớ và CPU để khởi tạo (bắt tay TCP, TLS, xác thực). Mở kết nối mới cho mỗi request làm tăng độ trễ đáng kể.",
          "Postgres giới hạn tổng số kết nối bằng `max_connections` (mặc định 100). Vượt quá, client nhận lỗi `too many connections`. Tăng con số này lên vài nghìn thường không phải giải pháp, vì nhiều tiến trình cạnh tranh CPU và bộ nhớ làm hiệu năng tụt."
        ]
      },
      {
        h: "Pool trong ứng dụng",
        p: [
          "Connection pool giữ sẵn một số kết nối mở và cho các request mượn rồi trả lại. Driver `pg` (node-postgres), Prisma, TypeORM đều có pool. Khi mọi kết nối đang bận, request mới phải xếp hàng chờ đến khi có kết nối rảnh hoặc hết thời gian chờ.",
          "Bài toán hay gặp khi scale: mỗi replica có pool riêng. 10 pod × pool 20 = 200 kết nối, vượt `max_connections = 100`. Công thức cần giữ: `số_replica × pool_size + kết_nối_khác (migration, cron, admin) < max_connections`. Nhớ tính cả lúc rolling deploy, khi pod cũ và pod mới cùng chạy.",
          "Pool lớn hơn không có nghĩa nhanh hơn. DB chỉ có số lõi CPU nhất định; một pool nhỏ vừa phải thường cho throughput tốt hơn một pool khổng lồ. Hãy đo bằng load test thay vì đoán."
        ],
        code: {
          lang: "typescript",
          file: "db.ts",
          src: `import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                        // tối đa 10 kết nối cho mỗi instance
  idleTimeoutMillis: 30_000,      // đóng kết nối rảnh sau 30s
  connectionTimeoutMillis: 5_000, // chờ tối đa 5s để mượn kết nối
});

export async function getUser(id: number) {
  const { rows } = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
  return rows[0];
}`
        }
      },
      {
        h: "PgBouncer: pool dùng chung ở giữa",
        p: [
          "PgBouncer là proxy nhẹ đứng giữa ứng dụng và Postgres. Hàng nghìn kết nối client tới PgBouncer được dồn vào một số ít kết nối thật tới DB. Nó đặc biệt hữu ích khi có nhiều replica, serverless function, hoặc nhiều service dùng chung một DB. Các dịch vụ managed thường có sẵn tính năng tương tự (ví dụ RDS Proxy)."
        ],
        list: [
          "Session mode: client giữ một kết nối server suốt phiên. An toàn nhất nhưng ít tiết kiệm.",
          "Transaction mode: kết nối server chỉ gán cho client trong một transaction. Tiết kiệm nhất và phổ biến nhất, nhưng các tính năng gắn với session như `SET` (không phải `SET LOCAL`), `LISTEN/NOTIFY`, advisory lock mức session sẽ không hoạt động đúng.",
          "Statement mode: gán theo từng câu lệnh, không hỗ trợ transaction nhiều câu lệnh."
        ],
        code: {
          lang: "ini",
          file: "pgbouncer.ini",
          src: `[databases]
app = host=10.0.0.5 port=5432 dbname=app

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 2000
default_pool_size = 20`
        }
      }
    ],
    summary: [
      "Mỗi kết nối Postgres là một tiến trình; mở kết nối đắt và bị giới hạn bởi max_connections.",
      "Pool trong ứng dụng tái sử dụng kết nối; tổng pool của mọi replica phải nhỏ hơn max_connections.",
      "Pool lớn không đồng nghĩa nhanh hơn; hãy load test để chọn kích thước.",
      "PgBouncer transaction mode tiết kiệm kết nối nhất nhưng không hỗ trợ tính năng mức session."
    ],
    pitfalls: [
      "Scale từ 3 lên 20 pod mà không giảm pool size, DB báo `too many connections` giữa giờ cao điểm. Tính tổng kết nối trước khi scale.",
      "Dùng `SET search_path` hoặc advisory lock mức session qua PgBouncer transaction mode, lệnh có thể áp dụng cho client khác. Dùng `SET LOCAL` trong transaction hoặc session mode.",
      "Giữ kết nối trong lúc gọi API bên ngoài bên trong transaction, pool cạn nhanh. Tách I/O ngoài ra khỏi transaction."
    ],
    quiz: [
      {
        q: "Có 8 replica, mỗi replica pool 15 kết nối, max_connections = 100. Điều gì xảy ra?",
        options: [
          "Không sao, Postgres tự tăng giới hạn",
          "Postgres chia đều 100 kết nối cho các replica",
          "Tổng 120 kết nối vượt giới hạn, một số kết nối sẽ bị từ chối khi tải cao",
          "Pool tự động giảm xuống 12"
        ],
        answer: 2,
        explain: "Postgres không biết gì về pool của ứng dụng; khi tổng kết nối vượt max_connections thì kết nối mới bị lỗi. Cần giảm pool size, giảm replica hoặc dùng PgBouncer."
      },
      {
        q: "Ở PgBouncer transaction mode, tính năng nào dễ gặp vấn đề?",
        options: [
          "SELECT đơn giản",
          "Transaction BEGIN ... COMMIT",
          "INSERT có RETURNING",
          "Advisory lock mức session và LISTEN/NOTIFY"
        ],
        answer: 3,
        explain: "Transaction mode trả kết nối server về pool sau mỗi transaction, nên trạng thái gắn với session (lock session, LISTEN, SET) không được giữ cho client. Truy vấn và transaction bình thường vẫn chạy tốt."
      },
      {
        q: "Vì sao tăng max_connections lên 5000 không phải cách tốt để phục vụ nhiều client?",
        options: [
          "Vì mỗi kết nối là một tiến trình tốn tài nguyên, quá nhiều sẽ làm DB chậm đi",
          "Vì Postgres không cho phép quá 100",
          "Vì PgBouncer sẽ ngừng hoạt động",
          "Vì kết nối sẽ tự đóng sau 1 giây"
        ],
        answer: 0,
        explain: "Có thể đặt max_connections cao, nhưng hàng nghìn tiến trình tranh CPU, bộ nhớ và khoá nội bộ làm hiệu năng giảm. Giải pháp đúng là pool và PgBouncer."
      }
    ]
  },

  "p04.m2.t0": {
    sections: [
      {
        h: "Transaction và bốn chữ ACID",
        p: [
          "Transaction gom nhiều câu lệnh thành một đơn vị: hoặc tất cả thành công, hoặc không có gì xảy ra. Ví dụ kinh điển: chuyển 500.000đ từ ví A sang ví B cần hai lệnh UPDATE. Nếu server sập giữa chừng, không được phép A bị trừ tiền mà B không được cộng.",
          "ACID là bốn tính chất mà transaction trong Postgres đảm bảo:"
        ],
        list: [
          "Atomicity (nguyên tử): tất cả hoặc không gì cả. Lỗi ở bất kỳ câu lệnh nào thì `ROLLBACK` huỷ mọi thay đổi.",
          "Consistency (nhất quán): transaction đưa DB từ trạng thái hợp lệ này sang trạng thái hợp lệ khác, không vi phạm constraint (FK, CHECK, UNIQUE). Phần \"hợp lệ theo nghiệp vụ\" vẫn là trách nhiệm của bạn.",
          "Isolation (cô lập): các transaction đồng thời không thấy trạng thái dở dang của nhau, mức độ cụ thể tùy isolation level.",
          "Durability (bền vững): đã `COMMIT` thành công thì dữ liệu không mất kể cả khi mất điện ngay sau đó."
        ],
        code: {
          lang: "sql",
          file: "transfer.sql",
          src: `BEGIN;
UPDATE wallets SET balance = balance - 500000 WHERE id = 1;
UPDATE wallets SET balance = balance + 500000 WHERE id = 2;
-- CHECK (balance >= 0) trên cột balance sẽ làm lệnh đầu lỗi nếu không đủ tiền,
-- và cả transaction bị huỷ
INSERT INTO wallet_transfers (from_id, to_id, amount) VALUES (1, 2, 500000);
COMMIT;`
        }
      },
      {
        h: "WAL: bí mật của Durability và Atomicity",
        p: [
          "Postgres dùng Write-Ahead Log (WAL): mọi thay đổi được ghi vào nhật ký tuần tự trước khi ghi vào file dữ liệu. Khi `COMMIT`, Postgres chỉ cần đảm bảo bản ghi WAL đã được flush xuống đĩa (fsync), còn các trang dữ liệu có thể ghi sau qua checkpoint.",
          "Ghi tuần tự vào WAL nhanh hơn nhiều so với ghi ngẫu nhiên vào nhiều trang dữ liệu. Khi server sập, lúc khởi động lại Postgres đọc WAL từ checkpoint gần nhất và phát lại (redo) để khôi phục trạng thái đã commit. Transaction chưa commit không được coi là có hiệu lực.",
          "WAL còn là nền tảng của replication (streaming WAL sang replica) và PITR (lưu trữ WAL để khôi phục về một thời điểm bất kỳ). Tham số `synchronous_commit = off` giúp commit nhanh hơn nhưng có thể mất vài transaction cuối khi sập; chỉ dùng cho dữ liệu chấp nhận mất."
        ]
      },
      {
        h: "Transaction trong code ứng dụng",
        p: [
          "Trong ORM, hãy dùng API transaction thay vì tự gửi `BEGIN`/`COMMIT` qua pool, vì mỗi câu có thể đi qua một kết nối khác nhau. Giữ transaction ngắn: không gọi API bên ngoài, không chờ người dùng trong transaction."
        ],
        code: {
          lang: "typescript",
          file: "transfer.service.ts",
          src: `await prisma.$transaction(async (tx) => {
  await tx.wallet.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
  await tx.wallet.update({ where: { id: toId },   data: { balance: { increment: amount } } });
  await tx.walletTransfer.create({ data: { fromId, toId, amount } });
  // Nếu có exception ở đây, Prisma rollback toàn bộ
});`
        }
      }
    ],
    summary: [
      "Transaction đảm bảo nhiều câu lệnh thành công hoặc thất bại cùng nhau.",
      "ACID: Atomicity, Consistency, Isolation, Durability.",
      "WAL ghi thay đổi trước vào nhật ký tuần tự; commit chỉ cần WAL đã xuống đĩa; khi sập thì phát lại WAL.",
      "WAL cũng là nền tảng cho replication và PITR.",
      "Giữ transaction ngắn và dùng API transaction của ORM để đảm bảo cùng một kết nối."
    ],
    pitfalls: [
      "Gửi `BEGIN` và `COMMIT` bằng các lời gọi `pool.query` riêng lẻ: mỗi lệnh có thể chạy trên kết nối khác nhau, transaction vô nghĩa. Dùng `pool.connect()` rồi chạy trên cùng client, hoặc API transaction của ORM.",
      "Gọi cổng thanh toán bên trong transaction DB: transaction kéo dài, giữ lock, và nếu rollback thì tiền đã trừ bên ngoài không quay lại. Tách thành các bước có trạng thái rõ ràng.",
      "Tắt `fsync` để \"tăng tốc\" trên production: sập điện có thể làm hỏng dữ liệu. Không bao giờ tắt fsync ngoài môi trường test."
    ],
    quiz: [
      {
        q: "Tính chất nào của ACID đảm bảo dữ liệu đã commit không mất khi server mất điện?",
        options: ["Atomicity", "Consistency", "Isolation", "Durability"],
        answer: 3,
        explain: "Durability nhờ WAL được flush xuống đĩa trước khi commit trả về. Atomicity nói về tất cả hoặc không; Isolation về giao dịch đồng thời; Consistency về trạng thái hợp lệ."
      },
      {
        q: "Vì sao WAL giúp commit nhanh mà vẫn bền vững?",
        options: [
          "Vì WAL lưu trong RAM, không ghi xuống đĩa",
          "Vì WAL nén dữ liệu",
          "Vì ghi tuần tự vào WAL rẻ hơn ghi ngẫu nhiên vào các trang dữ liệu; trang dữ liệu có thể ghi sau và khôi phục bằng cách phát lại WAL",
          "Vì WAL bỏ qua các constraint"
        ],
        answer: 2,
        explain: "WAL phải xuống đĩa khi commit (nên không chỉ trong RAM), nhưng là ghi tuần tự. Các trang dữ liệu được ghi sau qua checkpoint, và khi sập thì redo từ WAL."
      },
      {
        q: "Trong transaction chuyển tiền, lệnh UPDATE thứ hai lỗi. Điều gì xảy ra với lệnh UPDATE thứ nhất?",
        options: [
          "Vẫn được giữ lại",
          "Chỉ bị huỷ nếu dùng Serializable",
          "Được commit tự động",
          "Bị huỷ cùng toàn bộ transaction khi rollback"
        ],
        answer: 3,
        explain: "Atomicity: trong Postgres, lỗi làm transaction chuyển sang trạng thái aborted và phải rollback, huỷ mọi thay đổi. Điều này đúng ở mọi isolation level."
      }
    ]
  },

  "p04.m2.t1": {
    sections: [
      {
        h: "Các hiện tượng khi chạy đồng thời",
        p: [
          "Khi nhiều transaction chạy cùng lúc, có thể xảy ra các hiện tượng bất thường. Chuẩn SQL định nghĩa isolation level dựa trên việc cho phép hay chặn các hiện tượng này."
        ],
        list: [
          "Dirty read: đọc dữ liệu của transaction khác chưa commit. Postgres không bao giờ cho phép, kể cả khi bạn đặt `READ UNCOMMITTED` (nó hoạt động như Read Committed).",
          "Non-repeatable read: đọc cùng một dòng hai lần trong một transaction nhưng ra giá trị khác, vì transaction khác đã commit thay đổi ở giữa.",
          "Phantom read: chạy lại cùng truy vấn điều kiện và thấy thêm/bớt dòng.",
          "Lost update: hai transaction cùng đọc giá trị, cùng tính toán trong code rồi ghi đè, cập nhật của một bên bị mất.",
          "Write skew: hai transaction đọc cùng tập dữ liệu, mỗi bên ghi vào dòng khác nhau, kết quả chung vi phạm quy tắc nghiệp vụ (ví dụ cả hai bác sĩ cùng xin nghỉ ca trực)."
        ]
      },
      {
        h: "Ba mức trong PostgreSQL",
        list: [
          "Read Committed (mặc định): mỗi câu lệnh thấy snapshot tại thời điểm câu lệnh đó bắt đầu. Chặn dirty read nhưng cho phép non-repeatable read, phantom và lost update kiểu đọc-rồi-ghi trong code.",
          "Repeatable Read: cả transaction dùng một snapshot lấy ở câu lệnh đầu tiên. Trong Postgres (snapshot isolation) mức này chặn cả non-repeatable read lẫn phantom read. Nếu bạn cập nhật một dòng đã bị transaction khác thay đổi và commit sau snapshot, Postgres báo lỗi `could not serialize access due to concurrent update` (SQLSTATE `40001`). Vẫn có thể bị write skew.",
          "Serializable: dùng SSI (Serializable Snapshot Isolation), đảm bảo kết quả như thể các transaction chạy tuần tự, chặn cả write skew. Đổi lại có thể báo lỗi `40001` bất cứ lúc nào có xung đột nguy hiểm."
        ],
        p: [
          "Ở Repeatable Read và Serializable, ứng dụng phải sẵn sàng retry toàn bộ transaction khi gặp lỗi serialization. Đây không phải bug mà là cơ chế hoạt động bình thường."
        ]
      },
      {
        h: "Ví dụ và cách chọn",
        p: [
          "Với đa số API CRUD, Read Committed kết hợp câu lệnh nguyên tử (`UPDATE ... SET stock = stock - 1 WHERE stock > 0`) hoặc lock tường minh là đủ. Dùng Repeatable Read cho báo cáo cần nhìn dữ liệu nhất quán qua nhiều truy vấn. Dùng Serializable cho nghiệp vụ có quy tắc phức tạp dễ bị write skew, kèm cơ chế retry."
        ],
        code: {
          lang: "sql",
          file: "isolation.sql",
          src: `-- Báo cáo cần mọi truy vấn cùng một snapshot
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT COUNT(*) FROM orders WHERE status = 'paid';
SELECT SUM(total_amount) FROM orders WHERE status = 'paid';
COMMIT;

-- Lost update ở Read Committed: SAI khi làm trong code
--   stock = SELECT stock ...; UPDATE ... SET stock = <stock - 1>
-- ĐÚNG: để DB tính nguyên tử
UPDATE products SET stock = stock - 1
WHERE id = 7 AND stock > 0
RETURNING stock;`
        }
      }
    ],
    summary: [
      "Mức mặc định của PostgreSQL là Read Committed; dirty read không bao giờ xảy ra trong Postgres.",
      "Repeatable Read trong Postgres là snapshot isolation: chặn non-repeatable read và phantom, báo lỗi 40001 khi cập nhật đồng thời cùng dòng.",
      "Serializable (SSI) chặn cả write skew nhưng cần retry khi gặp lỗi 40001.",
      "Lost update thường đến từ đọc-tính-ghi trong code; sửa bằng UPDATE nguyên tử, lock hoặc optimistic locking."
    ],
    pitfalls: [
      "Nâng lên Serializable nhưng không viết logic retry, người dùng nhận lỗi 500 ngẫu nhiên khi tải cao. Bắt SQLSTATE `40001` và thử lại vài lần có backoff.",
      "Đọc số dư bằng SELECT, cộng trừ trong TypeScript rồi UPDATE giá trị mới ở Read Committed: mất cập nhật khi có request đồng thời.",
      "Nghĩ rằng Repeatable Read của Postgres giống MySQL InnoDB: hành vi khi xung đột ghi khác nhau. Hãy đọc tài liệu của đúng DB mình dùng."
    ],
    quiz: [
      {
        q: "Isolation level mặc định của PostgreSQL là gì?",
        options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
        answer: 1,
        explain: "Postgres mặc định Read Committed. Read Uncommitted được chấp nhận về cú pháp nhưng hoạt động như Read Committed."
      },
      {
        q: "Ở Repeatable Read, transaction T1 cập nhật dòng mà T2 đã sửa và commit sau khi T1 lấy snapshot. Postgres làm gì?",
        options: [
          "Ghi đè thay đổi của T2",
          "Báo lỗi could not serialize access (40001), T1 cần rollback và thử lại",
          "Chờ mãi mãi",
          "Tự động chuyển T1 sang Read Committed"
        ],
        answer: 1,
        explain: "Snapshot isolation không cho T1 ghi đè lên phiên bản mà nó không nhìn thấy, nên báo lỗi serialization. T1 có thể phải chờ T2 kết thúc trước (nếu T2 chưa commit), nhưng khi T2 commit thì T1 nhận lỗi."
      },
      {
        q: "Cách nào chống lost update khi trừ tồn kho ở Read Committed mà không cần đổi isolation level?",
        options: [
          "SELECT stock rồi UPDATE giá trị tính trong code",
          "Dùng UNION ALL",
          "UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0",
          "Tạo thêm index trên stock"
        ],
        answer: 2,
        explain: "UPDATE với biểu thức stock - 1 được thực hiện nguyên tử; ở Read Committed, nếu dòng bị khoá bởi transaction khác, Postgres chờ rồi đánh giá lại điều kiện trên phiên bản mới nhất. Index không giải quyết vấn đề đồng thời."
      }
    ]
  },

  "p04.m2.t2": {
    sections: [
      {
        h: "Row lock và SELECT ... FOR UPDATE",
        p: [
          "Khi `UPDATE` hoặc `DELETE`, Postgres tự khoá các dòng bị ảnh hưởng đến khi transaction kết thúc. Transaction khác muốn sửa cùng dòng phải chờ. Việc đọc bằng SELECT thường không bị chặn nhờ MVCC.",
          "Đôi khi bạn cần đọc rồi mới quyết định ghi, và muốn không ai sửa dòng đó trong lúc bạn đang tính toán. `SELECT ... FOR UPDATE` khoá dòng ngay lúc đọc. Các biến thể nhẹ hơn: `FOR NO KEY UPDATE` (không đổi khoá), `FOR SHARE` (cho phép người khác cũng khoá share, chặn sửa)."
        ],
        code: {
          lang: "sql",
          file: "for_update.sql",
          src: `BEGIN;
-- Khoá ví để kiểm tra hạn mức rồi mới trừ
SELECT balance, daily_limit_used
FROM wallets
WHERE id = 1
FOR UPDATE;
-- ... ứng dụng kiểm tra quy tắc nghiệp vụ ...
UPDATE wallets SET balance = balance - 200000, daily_limit_used = daily_limit_used + 200000
WHERE id = 1;
COMMIT;

-- Không muốn chờ: báo lỗi ngay nếu dòng đang bị khoá
SELECT * FROM wallets WHERE id = 1 FOR UPDATE NOWAIT;`
        }
      },
      {
        h: "SKIP LOCKED: làm job queue bằng Postgres",
        p: [
          "Nhiều worker cùng lấy job từ một bảng. Nếu dùng `FOR UPDATE` thường, các worker xếp hàng chờ cùng một dòng. `FOR UPDATE SKIP LOCKED` bỏ qua các dòng đang bị worker khác khoá và lấy dòng kế tiếp, nên các worker chạy song song mà không xử lý trùng job.",
          "Đây là cơ chế đằng sau các thư viện queue dựa trên Postgres như pg-boss hay Graphile Worker. Với tải vừa phải, bạn không cần thêm Redis hay RabbitMQ."
        ],
        code: {
          lang: "sql",
          file: "job_queue.sql",
          src: `CREATE TABLE jobs (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind       text NOT NULL,
  payload    jsonb NOT NULL,
  status     text NOT NULL DEFAULT 'queued',
  run_at     timestamptz NOT NULL DEFAULT now(),
  attempts   int NOT NULL DEFAULT 0
);
CREATE INDEX jobs_queued_idx ON jobs (run_at) WHERE status = 'queued';

-- Mỗi worker chạy câu này để nhận tối đa 10 job
UPDATE jobs SET status = 'running', attempts = attempts + 1
WHERE id IN (
  SELECT id FROM jobs
  WHERE status = 'queued' AND run_at <= now()
  ORDER BY run_at
  LIMIT 10
  FOR UPDATE SKIP LOCKED
)
RETURNING id, kind, payload;`
        }
      },
      {
        h: "Advisory lock: khoá theo ý nghĩa của bạn",
        p: [
          "Advisory lock không gắn với dòng hay bảng nào; bạn tự chọn một số nguyên (bigint) đại diện cho \"tài nguyên\" và Postgres đảm bảo chỉ một phiên giữ nó. Ứng dụng: đảm bảo chỉ một instance chạy cron job, chỉ một tiến trình chạy migration, hoặc tuần tự hoá xử lý cho một user.",
          "Có hai loại: mức transaction (`pg_advisory_xact_lock`, tự nhả khi transaction kết thúc, an toàn hơn) và mức session (`pg_advisory_lock`, phải tự `pg_advisory_unlock`). Phiên bản `try` trả về true/false ngay thay vì chờ."
        ],
        code: {
          lang: "sql",
          file: "advisory.sql",
          src: `BEGIN;
-- Chỉ một instance chạy job báo cáo đêm; các instance khác nhận false và bỏ qua
SELECT pg_try_advisory_xact_lock(hashtext('nightly-report'));
-- ... nếu true thì chạy job ...
COMMIT; -- lock tự nhả`
        }
      }
    ],
    summary: [
      "UPDATE/DELETE tự khoá dòng đến cuối transaction; SELECT thường không bị chặn nhờ MVCC.",
      "`SELECT ... FOR UPDATE` khoá dòng khi đọc để thực hiện đọc-quyết-định-ghi an toàn.",
      "`FOR UPDATE SKIP LOCKED` giúp nhiều worker lấy job song song không trùng lặp.",
      "Advisory lock khoá theo khoá số do bạn định nghĩa; ưu tiên loại mức transaction."
    ],
    pitfalls: [
      "Dùng `FOR UPDATE` bên ngoài transaction (autocommit): lock nhả ngay sau câu lệnh, không bảo vệ gì. Luôn đặt trong `BEGIN ... COMMIT`.",
      "Giữ lock lâu vì gọi API ngoài trong transaction, các request khác xếp hàng và timeout. Giữ vùng khoá càng ngắn càng tốt.",
      "Dùng advisory lock mức session qua PgBouncer transaction mode, lock có thể bị giữ trên kết nối đã trả cho client khác. Dùng loại `xact`."
    ],
    quiz: [
      {
        q: "Vì sao `FOR UPDATE SKIP LOCKED` phù hợp làm job queue?",
        options: [
          "Nó khoá toàn bộ bảng",
          "Nó bỏ qua các constraint",
          "Nó tự xoá job sau khi xử lý",
          "Các worker bỏ qua job đang bị worker khác khoá và lấy job kế tiếp, không chờ nhau và không xử lý trùng"
        ],
        answer: 3,
        explain: "SKIP LOCKED bỏ qua dòng đang bị khoá thay vì chờ, nên nhiều worker song song mỗi người nhận một nhóm job khác nhau. Nó chỉ khoá dòng được chọn, không khoá bảng."
      },
      {
        q: "Khác biệt giữa `pg_advisory_xact_lock` và `pg_advisory_lock`?",
        options: [
          "xact tự nhả khi transaction kết thúc; loại không xact giữ đến khi unlock hoặc hết session",
          "xact chỉ dùng được cho bảng",
          "Loại không xact nhanh hơn 10 lần",
          "Không có khác biệt"
        ],
        answer: 0,
        explain: "Advisory lock mức transaction gắn với transaction hiện tại và tự nhả khi commit/rollback; mức session tồn tại đến khi bạn unlock hoặc kết nối đóng. Cả hai không gắn với bảng nào."
      },
      {
        q: "Transaction A đang giữ `FOR UPDATE` trên dòng id=1. Transaction B chạy `SELECT * FROM wallets WHERE id = 1` (không có FOR UPDATE). Điều gì xảy ra?",
        options: [
          "B bị chặn cho đến khi A commit",
          "B đọc được ngay phiên bản đã commit gần nhất",
          "B nhận lỗi deadlock",
          "B đọc được thay đổi chưa commit của A"
        ],
        answer: 1,
        explain: "Nhờ MVCC, đọc thường không bị row lock chặn và chỉ thấy dữ liệu đã commit. Nếu B cũng dùng FOR UPDATE thì B mới phải chờ."
      }
    ]
  },

  "p04.m2.t3": {
    sections: [
      {
        h: "Bài toán: sản phẩm cuối cùng",
        p: [
          "Flash sale còn 1 chiếc điện thoại, 500 người bấm mua trong cùng một giây. Nếu mỗi request đọc `stock = 1`, thấy còn hàng rồi tạo đơn, bạn sẽ bán 500 chiếc không có thật. Có hai trường phái giải quyết: bi quan (pessimistic) và lạc quan (optimistic)."
        ]
      },
      {
        h: "Pessimistic locking: khoá trước, làm sau",
        p: [
          "Giả định xung đột sẽ xảy ra, nên khoá dòng ngay khi đọc bằng `SELECT ... FOR UPDATE`. Các request khác phải xếp hàng. Ưu điểm: đơn giản, chắc chắn đúng. Nhược điểm: giảm throughput khi tranh chấp cao, giữ kết nối lâu, có nguy cơ deadlock khi khoá nhiều dòng.",
          "Với trường hợp chỉ trừ tồn kho, cách gọn nhất là một UPDATE có điều kiện: DB tự khoá và kiểm tra nguyên tử. Nếu `rowCount = 0` nghĩa là hết hàng."
        ],
        code: {
          lang: "sql",
          file: "pessimistic.sql",
          src: `BEGIN;
SELECT stock FROM products WHERE id = 7 FOR UPDATE;
-- ứng dụng kiểm tra stock > 0, tạo đơn...
UPDATE products SET stock = stock - 1 WHERE id = 7;
INSERT INTO orders (user_id, product_id) VALUES (42, 7);
COMMIT;

-- Cách gọn hơn: UPDATE có điều kiện, 0 dòng bị ảnh hưởng = hết hàng
UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock > 0 RETURNING stock;`
        }
      },
      {
        h: "Optimistic locking: kiểm tra khi ghi",
        p: [
          "Giả định xung đột hiếm, nên không khoá khi đọc. Mỗi dòng có cột `version`. Khi ghi, bạn kèm điều kiện `WHERE version = <giá trị đã đọc>` và tăng version. Nếu có người khác đã sửa trước, câu UPDATE ảnh hưởng 0 dòng, ứng dụng biết có xung đột và thông báo hoặc thử lại.",
          "Optimistic locking rất hợp với chỉnh sửa có thời gian suy nghĩ dài: hai admin cùng mở form sửa sản phẩm, người lưu sau nhận thông báo \"dữ liệu đã thay đổi, vui lòng tải lại\" thay vì ghi đè im lặng. Trong API REST, cơ chế tương tự là header `ETag` + `If-Match`, trả 412 Precondition Failed khi không khớp."
        ],
        code: {
          lang: "typescript",
          file: "optimistic.ts",
          src: `async function updateProduct(id: number, version: number, data: { name: string; price: string }) {
  const result = await prisma.product.updateMany({
    where: { id, version },
    data: { ...data, version: { increment: 1 } },
  });
  if (result.count === 0) {
    throw new ConflictException('Sản phẩm đã được người khác cập nhật, vui lòng tải lại.');
  }
}`
        }
      },
      {
        h: "Chọn cách nào?",
        list: [
          "Tranh chấp thấp, thời gian giữa đọc và ghi dài (form chỉnh sửa): optimistic.",
          "Tranh chấp cao trên một dòng nóng, thao tác ngắn (trừ tồn kho): UPDATE nguyên tử có điều kiện, hoặc pessimistic lock.",
          "Tranh chấp cực cao (flash sale hàng chục nghìn request/giây): cân nhắc giữ tồn kho trong Redis với lệnh nguyên tử hoặc xếp hàng request, rồi ghi DB bất đồng bộ."
        ],
        p: [
          "Dù chọn cách nào, ràng buộc `CHECK (stock >= 0)` vẫn là lưới an toàn cuối cùng."
        ]
      }
    ],
    summary: [
      "Pessimistic: khoá khi đọc (FOR UPDATE), chắc chắn nhưng giảm throughput.",
      "Optimistic: cột version, UPDATE kèm `WHERE version = ?`, 0 dòng = xung đột.",
      "Với trừ tồn kho, UPDATE có điều kiện `stock > 0` là cách đơn giản và đúng.",
      "Optimistic hợp với form chỉnh sửa; trong HTTP dùng ETag/If-Match và 412."
    ],
    pitfalls: [
      "Dùng optimistic locking nhưng không kiểm tra số dòng bị ảnh hưởng, xung đột bị bỏ qua im lặng.",
      "Retry optimistic vô hạn khi tranh chấp cao, tạo bão request. Giới hạn số lần thử và có backoff.",
      "Tin vào kiểm tra `stock > 0` trong code mà không có ràng buộc trong DB. Thêm `CHECK (stock >= 0)`."
    ],
    quiz: [
      {
        q: "Với optimistic locking, câu `UPDATE ... WHERE id = 1 AND version = 3` trả về 0 dòng. Điều đó có nghĩa là gì?",
        options: [
          "Lỗi cú pháp",
          "Database bị khoá",
          "Dòng đã bị transaction khác cập nhật (version đã đổi) hoặc không tồn tại",
          "Cần chạy VACUUM"
        ],
        answer: 2,
        explain: "Điều kiện version không khớp nghĩa là ai đó đã ghi trước. Ứng dụng phải báo xung đột hoặc đọc lại rồi thử lại."
      },
      {
        q: "Trường hợp nào hợp với optimistic locking nhất?",
        options: [
          "Hàng nghìn request cùng trừ tồn kho của một sản phẩm trong một giây",
          "Cập nhật bộ đếm lượt xem",
          "Job queue nhiều worker",
          "Hai nhân viên thỉnh thoảng cùng mở form sửa thông tin khách hàng"
        ],
        answer: 3,
        explain: "Xung đột hiếm và thời gian giữ form dài nên không thể giữ lock. Tranh chấp cao như flash sale làm optimistic retry liên tục; job queue hợp với SKIP LOCKED; bộ đếm dùng UPDATE nguyên tử."
      },
      {
        q: "Nhược điểm chính của pessimistic locking khi tranh chấp cao là gì?",
        options: [
          "Các request phải xếp hàng chờ lock, giảm throughput và có nguy cơ deadlock",
          "Dữ liệu có thể sai",
          "Không dùng được trong PostgreSQL",
          "Không cần transaction"
        ],
        answer: 0,
        explain: "Pessimistic locking đảm bảo đúng nhưng tuần tự hoá truy cập vào dòng nóng. Nó cần transaction và được Postgres hỗ trợ đầy đủ."
      }
    ]
  },

  "p04.m2.t4": {
    sections: [
      {
        h: "MVCC: nhiều phiên bản của một dòng",
        p: [
          "Postgres dùng MVCC (Multi-Version Concurrency Control) để người đọc không chặn người ghi và ngược lại. Mỗi phiên bản dòng (tuple) có hai trường ẩn: `xmin` là ID transaction tạo ra nó, `xmax` là ID transaction đã xoá hoặc thay thế nó.",
          "`UPDATE` trong Postgres không sửa tại chỗ. Nó đánh dấu phiên bản cũ (đặt `xmax`) và ghi một phiên bản mới. Mỗi transaction có snapshot quyết định phiên bản nào là \"nhìn thấy được\" với mình. Đó là lý do transaction Repeatable Read vẫn thấy dữ liệu cũ dù người khác đã commit thay đổi."
        ],
        code: {
          lang: "sql",
          file: "mvcc.sql",
          src: `SELECT xmin, xmax, id, stock FROM products WHERE id = 7;
UPDATE products SET stock = stock - 1 WHERE id = 7;
SELECT xmin, xmax, id, stock FROM products WHERE id = 7; -- xmin đã đổi: đây là phiên bản mới

-- Xem số dòng "chết" và lần autovacuum gần nhất
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 5;`
        }
      },
      {
        h: "VACUUM dọn dẹp phiên bản cũ",
        p: [
          "Phiên bản cũ trở thành dead tuple khi không còn transaction nào cần nhìn thấy nó. Dead tuple vẫn chiếm chỗ, làm bảng và index phình to (bloat). `VACUUM` đánh dấu chỗ đó để tái sử dụng; nó không trả dung lượng cho hệ điều hành (trừ phần cuối file). `VACUUM FULL` viết lại cả bảng và trả dung lượng, nhưng khoá bảng hoàn toàn.",
          "Autovacuum chạy nền tự động và bạn gần như không bao giờ nên tắt nó. VACUUM còn một nhiệm vụ sống còn: \"đóng băng\" các transaction ID cũ để tránh transaction ID wraparound, vì ID transaction là số 32 bit.",
          "Kẻ thù lớn nhất của VACUUM là transaction chạy rất lâu (hoặc phiên `idle in transaction`): chừng nào nó còn mở, mọi phiên bản mà nó có thể cần đều không được dọn."
        ]
      },
      {
        h: "Deadlock: phát hiện và phòng tránh",
        p: [
          "Deadlock xảy ra khi T1 giữ khoá dòng A và chờ dòng B, trong khi T2 giữ B và chờ A. Không ai nhường. Sau khoảng `deadlock_timeout` (mặc định 1 giây), Postgres kiểm tra đồ thị chờ, phát hiện chu trình và huỷ một transaction với lỗi `deadlock detected` (SQLSTATE `40P01`). Transaction còn lại tiếp tục."
        ],
        list: [
          "Khoá theo thứ tự nhất quán: ví dụ chuyển tiền luôn khoá ví có id nhỏ hơn trước.",
          "Giữ transaction ngắn, khoá ít dòng nhất có thể.",
          "Đặt `lock_timeout` để không chờ lock vô hạn.",
          "Coi `40P01` như lỗi có thể retry: bắt lỗi và chạy lại cả transaction."
        ],
        code: {
          lang: "sql",
          file: "deadlock_safe.sql",
          src: `-- Chuyển tiền giữa ví 9 và ví 3: luôn khoá theo id tăng dần
BEGIN;
SET LOCAL lock_timeout = '3s';
SELECT id FROM wallets WHERE id IN (3, 9) ORDER BY id FOR UPDATE;
UPDATE wallets SET balance = balance - 100000 WHERE id = 9;
UPDATE wallets SET balance = balance + 100000 WHERE id = 3;
COMMIT;`
        }
      }
    ],
    summary: [
      "MVCC: UPDATE tạo phiên bản dòng mới; snapshot quyết định transaction thấy phiên bản nào.",
      "Dead tuple gây bloat; VACUUM (autovacuum) dọn và chống transaction ID wraparound.",
      "Transaction chạy lâu hoặc idle in transaction ngăn VACUUM dọn dẹp.",
      "Postgres tự phát hiện deadlock và huỷ một transaction (40P01); phòng tránh bằng khoá theo thứ tự nhất quán."
    ],
    pitfalls: [
      "Tắt autovacuum vì \"tốn tài nguyên\", bảng phình to rồi hệ thống chậm dần, thậm chí đối mặt wraparound. Hãy tinh chỉnh thay vì tắt.",
      "Để kết nối `idle in transaction` hàng giờ do code quên commit. Đặt `idle_in_transaction_session_timeout` và giám sát `pg_stat_activity`.",
      "Khoá hai ví theo thứ tự của request (from rồi to), hai giao dịch ngược chiều nhau gây deadlock. Sắp xếp theo id trước khi khoá."
    ],
    quiz: [
      {
        q: "Khi bạn UPDATE một dòng trong PostgreSQL, điều gì xảy ra bên trong?",
        options: [
          "Dòng được sửa trực tiếp tại chỗ",
          "Phiên bản cũ được đánh dấu hết hiệu lực và một phiên bản mới được ghi",
          "Cả bảng được viết lại",
          "Dòng bị xoá khỏi index vĩnh viễn"
        ],
        answer: 1,
        explain: "MVCC tạo phiên bản mới và đặt xmax cho phiên bản cũ. Phiên bản cũ sau đó được VACUUM dọn khi không còn ai cần."
      },
      {
        q: "Điều gì ngăn VACUUM dọn các dead tuple?",
        options: [
          "Có quá nhiều index",
          "Bảng dùng kiểu jsonb",
          "Một transaction đang mở rất lâu vẫn có thể cần nhìn thấy các phiên bản cũ",
          "Bật pg_stat_statements"
        ],
        answer: 2,
        explain: "VACUUM chỉ dọn phiên bản mà không transaction nào còn có thể thấy. Một transaction cũ còn mở giữ mốc đó lại, khiến dead tuple tích tụ."
      },
      {
        q: "Cách hiệu quả nhất để tránh deadlock khi khoá nhiều dòng?",
        options: [
          "Tăng deadlock_timeout lên 1 giờ",
          "Tắt autovacuum",
          "Dùng SELECT không có FOR UPDATE",
          "Khoá các dòng theo một thứ tự nhất quán (ví dụ id tăng dần) ở mọi nơi"
        ],
        answer: 3,
        explain: "Deadlock cần chu trình chờ; nếu mọi transaction khoá theo cùng thứ tự thì không tạo được chu trình. Tăng timeout chỉ làm chậm việc phát hiện; bỏ lock thì mất tính đúng đắn."
      }
    ]
  },

  "p04.m3.t0": {
    sections: [
      {
        h: "ORM và query builder khác nhau thế nào?",
        p: [
          "ORM (Object-Relational Mapper) ánh xạ bảng thành model/entity và cho bạn thao tác bằng object: `prisma.user.findMany({ include: { posts: true } })`. Query builder thì gần SQL hơn: bạn ghép câu truy vấn bằng hàm có kiểu, còn cấu trúc vẫn là SELECT/JOIN/WHERE.",
          "Cả hai đều giúp chống SQL injection (tham số hoá tự động), tăng năng suất và cho type-safety trong TypeScript. Đổi lại, chúng che giấu SQL thật, dễ sinh truy vấn kém hiệu quả nếu bạn không xem log."
        ],
        list: [
          "Prisma: schema riêng (`schema.prisma`), sinh client có kiểu rất tốt, migration tích hợp. API cao cấp, dễ học; truy vấn phức tạp đôi khi phải dùng raw SQL.",
          "Drizzle: định nghĩa schema bằng TypeScript, API sát SQL, nhẹ, type-safe. Hợp với người đã quen SQL.",
          "TypeORM: kiểu Active Record/Data Mapper với decorator, phổ biến trong hệ NestJS lâu năm.",
          "Knex: query builder thuần JavaScript, không có model; type-safety hạn chế hơn các lựa chọn trên."
        ]
      },
      {
        h: "Cùng một truy vấn, ba cách viết",
        p: [
          "Ví dụ lấy 10 đơn đã thanh toán gần nhất của một user. Chú ý rằng cả ba cách đều gửi tham số riêng, không nối chuỗi."
        ],
        code: {
          lang: "typescript",
          file: "queries.ts",
          src: `// Prisma
const a = await prisma.order.findMany({
  where: { userId, status: 'paid' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: { id: true, totalAmount: true, createdAt: true },
});

// Drizzle
import { and, desc, eq } from 'drizzle-orm';
const b = await db
  .select({ id: orders.id, totalAmount: orders.totalAmount, createdAt: orders.createdAt })
  .from(orders)
  .where(and(eq(orders.userId, userId), eq(orders.status, 'paid')))
  .orderBy(desc(orders.createdAt))
  .limit(10);

// Raw SQL an toàn trong Prisma: tagged template tự tham số hoá
const c = await prisma.$queryRaw\`
  SELECT id, total_amount, created_at
  FROM orders
  WHERE user_id = \${userId} AND status = 'paid'
  ORDER BY created_at DESC
  LIMIT 10\`;`
        }
      },
      {
        h: "Khi nào nên viết raw SQL?",
        p: [
          "ORM tốt cho 80–90% truy vấn CRUD. Hãy chuyển sang raw SQL (hoặc `sql` template của Drizzle) khi gặp: window function và CTE đệ quy, báo cáo tổng hợp phức tạp, `INSERT ... ON CONFLICT` với logic đặc biệt, cập nhật hàng loạt dựa trên JOIN, hoặc khi EXPLAIN cho thấy truy vấn ORM sinh ra kém hiệu quả.",
          "Khi viết raw SQL, luôn dùng API có tham số hoá (`$queryRaw` dạng tagged template, `sql` của Drizzle, `$1` của `pg`). Tránh các hàm \"unsafe\" như `$queryRawUnsafe` với chuỗi ghép từ input người dùng. Gói raw SQL vào repository có kiểu trả về rõ ràng và test tích hợp với Postgres thật."
        ]
      }
    ],
    summary: [
      "ORM thao tác qua model; query builder ghép truy vấn gần SQL; cả hai đều tham số hoá.",
      "Prisma mạnh về DX và type; Drizzle sát SQL và nhẹ; TypeORM phổ biến với decorator; Knex là builder thuần.",
      "Dùng raw SQL cho truy vấn phức tạp hoặc khi ORM sinh SQL kém hiệu quả.",
      "Raw SQL phải qua API tham số hoá, không ghép chuỗi."
    ],
    pitfalls: [
      "Dùng `$queryRawUnsafe` hoặc `sql.raw` với chuỗi ghép từ input, mở cửa cho SQL injection. Chỉ dùng tagged template có tham số.",
      "Chỉ biết ORM mà không đọc SQL sinh ra, không phát hiện N+1 hay truy vấn thiếu index. Bật log truy vấn ở dev.",
      "Đổi ORM giữa dự án vì \"trend\": chi phí migrate lớn, lợi ích nhỏ. Chọn một công cụ và dùng tốt."
    ],
    quiz: [
      {
        q: "Cách nào an toàn để chạy raw SQL với tham số từ người dùng trong Prisma?",
        options: [
          "$queryRaw dạng tagged template với biến nội suy",
          "$queryRawUnsafe với chuỗi nối bằng dấu +",
          "Tự escape dấu nháy đơn bằng replace",
          "Không có cách an toàn"
        ],
        answer: 0,
        explain: "$queryRaw dạng tagged template biến mỗi biến thành tham số riêng gửi tới DB. Tự escape rất dễ sót; ghép chuỗi với Unsafe là SQL injection."
      },
      {
        q: "Điểm khác biệt đặc trưng của Drizzle so với Prisma?",
        options: [
          "Drizzle không hỗ trợ PostgreSQL",
          "Drizzle định nghĩa schema bằng TypeScript và có API sát SQL",
          "Drizzle không có type-safety",
          "Drizzle chỉ chạy trên trình duyệt"
        ],
        answer: 1,
        explain: "Drizzle khai báo bảng bằng code TypeScript và cung cấp API kiểu select().from().where() gần SQL, có type-safety. Prisma dùng file schema.prisma riêng và API mức cao hơn."
      },
      {
        q: "Tình huống nào hợp lý nhất để viết raw SQL thay vì dùng ORM?",
        options: [
          "Lấy một user theo id",
          "Tạo một bản ghi mới",
          "Báo cáo doanh thu dùng window function và CTE",
          "Xoá một bản ghi theo id"
        ],
        answer: 2,
        explain: "Window function và CTE thường không được ORM hỗ trợ tốt; SQL tay rõ ràng hơn. CRUD đơn giản nên để ORM làm."
      }
    ]
  },

  "p04.m3.t1": {
    sections: [
      {
        h: "Migration là lịch sử của schema",
        p: [
          "Migration là các file mô tả thay đổi schema theo thứ tự: tạo bảng, thêm cột, thêm index. Mỗi file có phiên bản (thường là timestamp) và được commit vào git cùng với code dùng nó. Nhờ vậy mọi môi trường (máy dev, CI, staging, production) đều dựng lại được schema giống hệt nhau.",
          "Công cụ migration lưu các migration đã chạy vào một bảng riêng trong DB (Prisma dùng `_prisma_migrations`). Lần chạy tiếp theo, nó chỉ áp dụng những file chưa có trong bảng. Không bao giờ sửa schema production bằng tay qua GUI."
        ]
      },
      {
        h: "Quy trình làm việc",
        list: [
          "Dev: sửa schema, sinh migration (`prisma migrate dev --name add_orders_status` hoặc `drizzle-kit generate`), đọc lại file SQL sinh ra, commit.",
          "Code review: xem migration như code. Có khoá bảng lớn không? Có xoá dữ liệu không? Có cần `CONCURRENTLY` không?",
          "CI: dựng DB trống, chạy toàn bộ migration từ đầu và chạy test.",
          "CD: chạy migration tự động trước khi (hoặc trong lúc) deploy phiên bản mới, bằng lệnh chỉ áp dụng như `prisma migrate deploy` hoặc `drizzle-kit migrate`. Chạy một lần duy nhất, ví dụ trong một Job riêng, không phải mỗi pod tự chạy."
        ],
        p: [
          "Ví dụ pipeline dưới đây tách bước migrate thành job riêng; bước deploy chỉ chạy khi migration thành công."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/deploy.yml",
          src: `jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy ứng dụng sau khi migration thành công"`
        }
      },
      {
        h: "Không sửa migration đã chạy",
        p: [
          "Khi một migration đã chạy ở môi trường dùng chung (staging, production), nó trở thành lịch sử bất biến. Sửa nội dung file đó sẽ khiến các môi trường lệch nhau: nơi đã chạy bản cũ sẽ không chạy lại, nơi mới dựng sẽ chạy bản mới. Prisma còn so checksum và báo lỗi khi file đã áp dụng bị thay đổi.",
          "Muốn sửa sai, hãy tạo migration mới để điều chỉnh. Migration `down` (rollback) nghe hấp dẫn, nhưng trên production việc quay lui thường bằng một migration \"tiến\" mới, vì down có thể làm mất dữ liệu đã ghi vào cột mới."
        ]
      }
    ],
    summary: [
      "Migration là các file thay đổi schema có phiên bản, nằm trong git cùng code.",
      "Công cụ ghi lại migration đã chạy vào một bảng trong DB và chỉ áp dụng file mới.",
      "CD chạy migration một lần bằng lệnh deploy, không để mỗi instance tự chạy.",
      "Không sửa migration đã chạy ở môi trường chung; tạo migration mới để sửa."
    ],
    pitfalls: [
      "Dùng `prisma migrate dev` hoặc `db push` trên production: có thể reset hoặc đồng bộ schema ngoài lịch sử migration. Production chỉ dùng `migrate deploy`.",
      "Mỗi pod chạy migration khi khởi động, nhiều pod chạy đồng thời gây tranh chấp. Chạy trong một Job riêng hoặc dùng cơ chế lock của công cụ.",
      "Commit migration mà không đọc SQL sinh ra, không nhận ra ORM định xoá rồi tạo lại cột (mất dữ liệu) khi bạn chỉ đổi tên."
    ],
    quiz: [
      {
        q: "Migration đã chạy trên production có một lỗi nhỏ. Bạn nên làm gì?",
        options: [
          "Sửa trực tiếp file migration cũ",
          "Sửa DB bằng tay qua GUI",
          "Xoá bảng lịch sử migration",
          "Tạo một migration mới để điều chỉnh"
        ],
        answer: 3,
        explain: "Migration đã áp dụng là lịch sử bất biến; sửa file gây lệch môi trường và lỗi checksum. Sửa tay qua GUI làm schema lệch khỏi git."
      },
      {
        q: "Lệnh nào phù hợp để chạy migration trong pipeline CD với Prisma?",
        options: ["prisma migrate deploy", "prisma db push", "prisma migrate dev", "prisma migrate reset"],
        answer: 0,
        explain: "migrate deploy chỉ áp dụng các migration chưa chạy, không sinh migration mới và không reset. migrate dev và reset dành cho môi trường phát triển; db push bỏ qua lịch sử migration."
      },
      {
        q: "Vì sao migration nên nằm trong git cùng với code?",
        options: [
          "Để file nhỏ hơn",
          "Để mọi môi trường dựng lại schema giống nhau và thay đổi schema được review cùng code dùng nó",
          "Vì Postgres đọc migration từ git",
          "Để không cần backup"
        ],
        answer: 1,
        explain: "Git giữ lịch sử có thứ tự, giúp tái lập schema và review. Postgres không đọc git; migration cũng không thay thế backup."
      }
    ]
  },

  "p04.m3.t2": {
    sections: [
      {
        h: "Vì sao migration gây downtime?",
        p: [
          "Khi deploy kiểu rolling, trong vài phút cả phiên bản code cũ và mới cùng chạy trên cùng một database. Nếu migration xoá hoặc đổi tên cột mà code cũ còn dùng, code cũ lập tức lỗi. Ngược lại, code mới cần cột chưa tồn tại cũng lỗi.",
          "Nguồn downtime thứ hai là khoá. Nhiều lệnh `ALTER TABLE` cần khoá `ACCESS EXCLUSIVE`, chặn cả đọc lẫn ghi. Tệ hơn, nếu lệnh ALTER phải chờ một transaction dài, nó xếp hàng và mọi truy vấn đến sau cũng bị chặn sau nó. Hãy luôn đặt `lock_timeout` cho migration."
        ]
      },
      {
        h: "Mô hình expand → migrate → contract",
        p: [
          "Chia thay đổi phá vỡ thành nhiều bước tương thích ngược, mỗi bước là một lần deploy an toàn. Ví dụ đổi `users.name` thành hai cột `first_name`, `last_name`:"
        ],
        list: [
          "Expand: thêm cột mới dạng nullable. Code mới ghi vào cả cột cũ và cột mới (dual write), vẫn đọc cột cũ.",
          "Migrate: backfill dữ liệu cũ theo từng lô nhỏ để không khoá lâu và không tạo transaction khổng lồ.",
          "Chuyển đọc: code đọc từ cột mới. Khi dữ liệu đầy đủ, thêm ràng buộc NOT NULL theo cách an toàn.",
          "Contract: ngừng ghi cột cũ, deploy, rồi mới xoá cột cũ ở migration sau."
        ],
        code: {
          lang: "sql",
          file: "expand_contract.sql",
          src: `-- Bước 1: expand (nhanh, chỉ đổi metadata)
SET lock_timeout = '5s';
ALTER TABLE users ADD COLUMN first_name text;
ALTER TABLE users ADD COLUMN last_name text;

-- Bước 2: backfill theo lô, chạy lặp đến khi 0 dòng
UPDATE users
SET first_name = split_part(name, ' ', 1),
    last_name  = substr(name, length(split_part(name, ' ', 1)) + 2)
WHERE id IN (
  SELECT id FROM users WHERE first_name IS NULL LIMIT 5000
);

-- Bước 3: NOT NULL an toàn: CHECK NOT VALID không quét bảng,
-- VALIDATE quét nhưng không chặn ghi
ALTER TABLE users ADD CONSTRAINT users_first_name_nn CHECK (first_name IS NOT NULL) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT users_first_name_nn;
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL; -- dùng CHECK đã hợp lệ, bỏ qua quét
ALTER TABLE users DROP CONSTRAINT users_first_name_nn;

-- Bước 4: contract (ở lần deploy sau, khi không còn code nào dùng name)
ALTER TABLE users DROP COLUMN name;`
        }
      },
      {
        h: "Danh sách thao tác an toàn và nguy hiểm",
        list: [
          "An toàn: thêm cột nullable; thêm cột có DEFAULT hằng số (từ PostgreSQL 11 chỉ đổi metadata); `CREATE INDEX CONCURRENTLY`; thêm FK/CHECK với `NOT VALID` rồi `VALIDATE`.",
          "Nguy hiểm: đổi kiểu cột (thường viết lại cả bảng); `SET NOT NULL` trực tiếp trên bảng lớn (quét toàn bảng dưới khoá); đổi tên hoặc xoá cột mà code cũ còn dùng; `CREATE INDEX` thường trên bảng lớn."
        ],
        p: [
          "Công cụ như `squawk` có thể lint file migration SQL để cảnh báo các thao tác nguy hiểm trước khi merge."
        ]
      }
    ],
    summary: [
      "Rolling deploy nghĩa là code cũ và mới cùng chạy; migration phải tương thích với cả hai.",
      "Expand → migrate (backfill theo lô) → contract, mỗi bước là một lần deploy.",
      "Luôn đặt lock_timeout cho migration để không chặn dây chuyền các truy vấn.",
      "Thêm NOT NULL/FK trên bảng lớn bằng NOT VALID rồi VALIDATE; tạo index bằng CONCURRENTLY."
    ],
    pitfalls: [
      "Đổi tên cột trong một migration duy nhất rồi deploy: pod cũ đang chạy lỗi ngay. Thêm cột mới, dual write, rồi mới xoá cột cũ.",
      "Backfill cả 50 triệu dòng trong một UPDATE: transaction khổng lồ, bloat, replica trễ. Chia lô nhỏ và nghỉ giữa các lô.",
      "Xoá cột ngay trong cùng lần deploy ngừng dùng nó: nếu cần rollback code, phiên bản cũ không còn cột để đọc."
    ],
    quiz: [
      {
        q: "Vì sao không nên đổi tên cột trực tiếp khi deploy kiểu rolling?",
        options: [
          "Vì Postgres không hỗ trợ RENAME COLUMN",
          "Vì RENAME COLUMN xoá dữ liệu",
          "Vì trong lúc deploy, code phiên bản cũ vẫn chạy và truy vấn tên cột cũ sẽ lỗi",
          "Vì phải restart database"
        ],
        answer: 2,
        explain: "RENAME COLUMN nhanh và giữ dữ liệu, nhưng code cũ còn chạy song song sẽ tham chiếu tên cũ. Expand/contract giữ cả hai tên tồn tại trong giai đoạn chuyển tiếp."
      },
      {
        q: "Thứ tự đúng của mô hình expand/contract là gì?",
        options: [
          "Xoá cột cũ → thêm cột mới → backfill",
          "Thêm cột mới và xoá cột cũ trong cùng migration",
          "Backfill → xoá cột cũ → thêm cột mới",
          "Thêm cột mới → backfill và chuyển code sang cột mới → xoá cột cũ"
        ],
        answer: 3,
        explain: "Mở rộng trước, di chuyển dữ liệu và code, cuối cùng mới thu hẹp. Mọi thứ tự khác đều có lúc code đang chạy không tìm thấy dữ liệu nó cần."
      },
      {
        q: "Tác dụng của `lock_timeout` trong migration là gì?",
        options: [
          "Nếu không lấy được khoá trong thời gian quy định thì lệnh DDL thất bại, tránh xếp hàng chặn mọi truy vấn khác",
          "Làm migration chạy nhanh hơn",
          "Tự động retry migration",
          "Tắt khoá bảng"
        ],
        answer: 0,
        explain: "Lệnh ALTER chờ khoá sẽ chặn các truy vấn đến sau nó. lock_timeout làm lệnh thất bại sớm để bạn thử lại lúc ít tải, thay vì gây nghẽn toàn hệ thống. Nó không tự retry."
      }
    ]
  },

  "p04.m3.t3": {
    sections: [
      {
        h: "Seed khác gì dữ liệu test?",
        p: [
          "Seed là dữ liệu nền cần có để ứng dụng chạy được: danh sách role, quyền, tỉnh/thành, tài khoản admin mẫu ở dev. Dữ liệu test là dữ liệu tạo ra cho từng bài test, thường ngẫu nhiên và bị xoá sau test.",
          "Tách bạch hai loại giúp bạn tránh tình trạng test phụ thuộc vào một bản ghi \"ai đó đã seed tay\" và vỡ khi môi trường thay đổi."
        ]
      },
      {
        h: "Seed phải idempotent",
        p: [
          "Idempotent nghĩa là chạy một lần hay mười lần đều ra cùng kết quả. Seed được chạy lại mỗi lần dựng môi trường, sau mỗi migration trên staging, hoặc do ai đó chạy nhầm. Nếu seed dùng INSERT thuần, lần chạy thứ hai sẽ lỗi trùng khoá hoặc nhân đôi dữ liệu.",
          "Cách làm: dựa trên một khoá tự nhiên (mã role, email, mã tỉnh) và dùng `INSERT ... ON CONFLICT` hoặc `upsert` của ORM. Tuyệt đối không để seed dữ liệu giả chạy trên production; hãy kiểm tra biến môi trường trước khi chạy."
        ],
        code: {
          lang: "typescript",
          file: "prisma/seed.ts",
          src: `// prisma: PrismaClient dùng chung của dự án (khởi tạo trong src/db.ts)
import { prisma } from '../src/db';

const ROLES = [
  { code: 'admin', name: 'Quản trị viên' },
  { code: 'editor', name: 'Biên tập viên' },
  { code: 'member', name: 'Thành viên' },
];

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },   // code là cột UNIQUE
      update: { name: role.name },
      create: role,
    });
  }

  if (process.env.APP_ENV !== 'production') {
    await prisma.user.upsert({
      where: { email: 'admin@devpath.local' },
      update: {},
      create: { email: 'admin@devpath.local', roleCode: 'admin' },
    });
  }
}

main().finally(() => prisma.$disconnect());`
        }
      },
      {
        h: "Factory cho dữ liệu test",
        p: [
          "Factory là hàm tạo bản ghi với giá trị mặc định hợp lệ, cho phép ghi đè đúng trường mà bài test quan tâm. Test đọc rõ ý hơn: `createOrder({ status: 'paid' })` thay vì 20 dòng khai báo đầy đủ.",
          "Dùng `@faker-js/faker` để sinh dữ liệu giống thật. Đặt `faker.seed(...)` để kết quả có thể lặp lại khi debug test lỗi. Với test tích hợp, mỗi test nên tự tạo dữ liệu của mình và dọn dẹp (bằng transaction rollback hoặc TRUNCATE) để các test không ảnh hưởng nhau."
        ],
        code: {
          lang: "typescript",
          file: "test/factories.ts",
          src: `import { faker } from '@faker-js/faker';
import { prisma } from '../src/db';

type NewUser = { email: string; fullName: string; status?: 'active' | 'banned' };

faker.seed(2026);

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  return {
    email: faker.internet.email().toLowerCase(),
    fullName: faker.person.fullName(),
    ...overrides,
  };
}

export async function createUser(overrides: Partial<NewUser> = {}) {
  return prisma.user.create({ data: buildUser(overrides) });
}

// Trong test
// const banned = await createUser({ status: 'banned' });`
        }
      }
    ],
    summary: [
      "Seed là dữ liệu nền (role, danh mục); dữ liệu test do từng test tự tạo.",
      "Seed phải idempotent: upsert theo khoá tự nhiên hoặc INSERT ... ON CONFLICT.",
      "Không chạy seed dữ liệu giả trên production; kiểm tra môi trường trước.",
      "Factory + faker (có seed cố định) giúp test ngắn gọn và tái lập được."
    ],
    pitfalls: [
      "Seed bằng INSERT thuần, chạy lần hai bị lỗi trùng khoá hoặc nhân đôi dữ liệu. Dùng upsert.",
      "Test phụ thuộc vào user id=1 có sẵn trong DB dev, CI dựng DB mới thì test vỡ. Mỗi test tự tạo dữ liệu.",
      "Seed tài khoản admin với mật khẩu mặc định lên production. Tạo admin production bằng quy trình riêng, có mật khẩu mạnh."
    ],
    quiz: [
      {
        q: "Seed idempotent nghĩa là gì?",
        options: [
          "Seed chỉ chạy được một lần",
          "Chạy nhiều lần vẫn cho cùng kết quả, không lỗi và không nhân đôi dữ liệu",
          "Seed chạy nhanh",
          "Seed tự xoá dữ liệu cũ"
        ],
        answer: 1,
        explain: "Idempotent là tính chất lặp lại không đổi kết quả. Seed không cần xoá dữ liệu cũ, chỉ cần upsert theo khoá tự nhiên."
      },
      {
        q: "Vì sao nên gọi `faker.seed(...)` trong test?",
        options: [
          "Để faker sinh dữ liệu tiếng Việt",
          "Để faker ghi dữ liệu vào DB",
          "Để dữ liệu ngẫu nhiên có thể lặp lại giống hệt giữa các lần chạy, dễ debug",
          "Để tăng tốc test"
        ],
        answer: 2,
        explain: "Seed cố định bộ sinh số ngẫu nhiên, nên cùng chuỗi lời gọi sẽ ra cùng dữ liệu. Nó không liên quan đến ngôn ngữ hay tốc độ."
      },
      {
        q: "Dữ liệu nào phù hợp làm seed?",
        options: [
          "Đơn hàng giả cho một bài test cụ thể",
          "Log truy cập",
          "Dữ liệu khách hàng thật copy từ production",
          "Danh sách role và quyền mà ứng dụng cần để hoạt động"
        ],
        answer: 3,
        explain: "Role/quyền là dữ liệu nền, cần có ở mọi môi trường. Dữ liệu cho test cụ thể nên tạo trong test; dữ liệu thật của khách không được copy sang dev."
      }
    ]
  },

  "p04.m3.t4": {
    sections: [
      {
        h: "Các loại backup",
        list: [
          "Logical backup (`pg_dump`): xuất schema và dữ liệu thành SQL hoặc định dạng nén. Linh hoạt: khôi phục một bảng, chuyển sang phiên bản Postgres mới. Chậm với DB lớn và chỉ là ảnh chụp tại một thời điểm.",
          "Physical backup (`pg_basebackup`, pgBackRest, WAL-G): sao chép file dữ liệu của cả cluster. Nhanh hơn với DB lớn, khôi phục toàn bộ cluster.",
          "Snapshot đĩa/dịch vụ managed (RDS, Cloud SQL): nhanh và tiện, nhưng phụ thuộc nhà cung cấp.",
          "PITR (Point-In-Time Recovery): physical backup + lưu trữ liên tục WAL. Cho phép khôi phục về đúng thời điểm, ví dụ 14:32:10, một giây trước khi ai đó chạy nhầm `DELETE` không có WHERE."
        ],
        p: [
          "Hai chỉ số cần thống nhất với nghiệp vụ: RPO (được phép mất tối đa bao nhiêu dữ liệu, ví dụ 5 phút) và RTO (được phép mất bao lâu để khôi phục, ví dụ 1 giờ). Backup hàng đêm bằng pg_dump cho RPO tới 24 giờ; PITR cho RPO tính bằng giây đến phút."
        ]
      },
      {
        h: "pg_dump và pg_restore",
        p: [
          "Định dạng custom (`-Fc`) nén sẵn và cho phép `pg_restore` chọn đối tượng cần khôi phục, chạy song song với `--jobs`. Định dạng directory (`-Fd`) còn cho phép dump song song."
        ],
        code: {
          lang: "bash",
          file: "backup.sh",
          src: `# Dump định dạng custom
pg_dump -h db.internal -U backup -d app -Fc -f app_$(date +%Y%m%d_%H%M).dump

# Khôi phục sang DB mới để kiểm tra, chạy 4 luồng
createdb -h localhost -U postgres app_restore_test
pg_restore -h localhost -U postgres -d app_restore_test --jobs=4 --no-owner app_20260926_0200.dump

# Chỉ khôi phục một bảng
pg_restore -h localhost -U postgres -d app_restore_test -t orders app_20260926_0200.dump

# Kiểm tra nhanh dữ liệu sau khi restore
psql -h localhost -U postgres -d app_restore_test -c "SELECT COUNT(*), MAX(created_at) FROM orders;"`
        }
      },
      {
        h: "Backup chưa từng restore thử coi như chưa có",
        p: [
          "Rất nhiều sự cố thật cho thấy backup tồn tại nhưng không dùng được: file hỏng, thiếu quyền giải mã, thiếu WAL, script âm thầm lỗi từ ba tháng trước, hoặc chưa ai biết quy trình khôi phục mất bao lâu.",
          "Hãy tự động hoá việc restore định kỳ (ví dụ hàng tuần) vào một môi trường tạm, chạy vài truy vấn kiểm tra số dòng và bản ghi mới nhất, đo thời gian để so với RTO, rồi xoá môi trường đó. Có cảnh báo khi job backup hoặc restore thất bại.",
          "Áp dụng quy tắc 3-2-1: 3 bản sao, trên 2 loại lưu trữ khác nhau, 1 bản ở ngoài (khác region hoặc khác tài khoản cloud). Mã hoá backup và giới hạn quyền truy cập, vì backup chứa toàn bộ dữ liệu cá nhân của người dùng."
        ]
      }
    ],
    summary: [
      "pg_dump cho backup logic linh hoạt; physical backup + WAL archive cho PITR.",
      "Xác định RPO và RTO với nghiệp vụ để chọn chiến lược backup.",
      "Định dạng -Fc cho phép pg_restore chọn đối tượng và chạy song song.",
      "Tự động restore thử định kỳ và đo thời gian; backup chưa restore thử coi như chưa có.",
      "Quy tắc 3-2-1, mã hoá backup và giới hạn quyền truy cập."
    ],
    pitfalls: [
      "Chỉ lưu backup cùng server hoặc cùng tài khoản cloud với DB: một sự cố hoặc tài khoản bị chiếm là mất cả hai. Lưu một bản ở nơi tách biệt.",
      "Nghĩ replica là backup: lệnh `DELETE` nhầm được replicate sang replica ngay lập tức. Cần backup + PITR.",
      "Không giám sát job backup, nó lỗi âm thầm hàng tháng. Cảnh báo khi thất bại và khi bản backup mới nhất quá cũ."
    ],
    quiz: [
      {
        q: "Lúc 14:33 phát hiện ai đó đã xoá nhầm dữ liệu lúc 14:32. Cơ chế nào giúp khôi phục về 14:31 tốt nhất?",
        options: [
          "PITR: base backup + WAL archive",
          "Replica đồng bộ",
          "pg_dump chạy lúc 2 giờ sáng",
          "Tạo lại index"
        ],
        answer: 0,
        explain: "PITR phát lại WAL đến đúng thời điểm mong muốn. pg_dump đêm qua mất dữ liệu cả ngày; replica đã nhận lệnh xoá; index không liên quan."
      },
      {
        q: "RPO là gì?",
        options: [
          "Thời gian tối đa để khôi phục hệ thống",
          "Lượng dữ liệu tối đa được phép mất, tính theo thời gian",
          "Số bản backup cần giữ",
          "Tốc độ ghi của đĩa"
        ],
        answer: 1,
        explain: "RPO (Recovery Point Objective) là mốc dữ liệu có thể quay về, tức lượng dữ liệu chấp nhận mất. Thời gian khôi phục là RTO."
      },
      {
        q: "Vì sao cần restore thử backup định kỳ?",
        options: [
          "Để backup nhỏ lại",
          "Vì pg_dump yêu cầu",
          "Để chắc chắn backup dùng được và biết thời gian khôi phục thực tế",
          "Để xoá dữ liệu cũ"
        ],
        answer: 2,
        explain: "Chỉ có restore mới chứng minh backup hợp lệ và đầy đủ, đồng thời cho bạn số đo thời gian để so với RTO."
      }
    ]
  },

  "p04.m4.t0": {
    sections: [
      {
        h: "Redis là gì và vì sao nhanh?",
        p: [
          "Redis là kho dữ liệu key-value lưu trong RAM, mỗi thao tác thường chỉ tốn micro giây phía server. Các lệnh được thực thi tuần tự trên một luồng chính, nên mỗi lệnh là nguyên tử: `INCR` từ nhiều client đồng thời không bao giờ bị mất lượt đếm.",
          "Điểm mạnh của Redis không chỉ là tốc độ mà là các cấu trúc dữ liệu có sẵn. Bạn chọn đúng cấu trúc thì bài toán trở nên đơn giản. Redis có thể lưu xuống đĩa bằng RDB (snapshot) và AOF (nhật ký lệnh), nhưng hãy coi nó là nơi lưu dữ liệu có thể tái tạo, trừ khi bạn cấu hình và hiểu rõ mức độ bền vững. Redis 8 còn tích hợp sẵn JSON, time series và các cấu trúc xác suất vào bản chính."
        ]
      },
      {
        h: "Các cấu trúc chính và ứng dụng",
        list: [
          "String: giá trị đơn, tối đa 512 MB. Dùng cho cache JSON, bộ đếm (`INCR`), cờ tính năng.",
          "Hash: map field → value trong một key, hợp để lưu object như session hay profile, sửa từng field không cần đọc cả object.",
          "List: danh sách có thứ tự, thêm/lấy ở hai đầu nhanh. Dùng cho hàng đợi đơn giản, danh sách hoạt động gần đây.",
          "Set: tập không trùng lặp. Dùng cho tag, danh sách user đã like, phép giao/hợp.",
          "Sorted Set: mỗi phần tử có score, tự sắp xếp. Hoàn hảo cho leaderboard, hàng đợi theo thời gian, sliding window rate limit.",
          "Stream: log chỉ thêm (append-only) với consumer group, có ACK. Dùng cho event, queue cần độ tin cậy cao hơn List hay Pub/Sub."
        ],
        p: [
          "Quy ước đặt tên key có tiền tố và dấu hai chấm như `user:42:profile`, `cache:product:7` giúp dễ quản lý và tránh đụng độ giữa các module."
        ]
      },
      {
        h: "Lệnh thực tế",
        p: [
          "TTL (time to live) là thời gian sống của key. Khi hết hạn, Redis tự xoá key. Mọi dữ liệu cache đều nên có TTL để tránh phình bộ nhớ."
        ],
        code: {
          lang: "bash",
          file: "redis-cli",
          src: `# String + TTL: cache 5 phút
SET cache:product:7 '{"id":7,"name":"Tai nghe X"}' EX 300
TTL cache:product:7

# Bộ đếm lượt xem
INCR views:post:10

# Hash
HSET user:42 name "An" plan "pro"
HGET user:42 plan
HINCRBY user:42 login_count 1

# Set
SADD post:10:likes user:42 user:43
SISMEMBER post:10:likes user:42
SCARD post:10:likes

# Sorted Set: leaderboard
ZADD leaderboard 1500 user:42 1320 user:43
ZINCRBY leaderboard 50 user:43
ZRANGE leaderboard 0 9 REV WITHSCORES
ZREVRANK leaderboard user:42

# Stream + consumer group
XGROUP CREATE orders:events billing $ MKSTREAM
XADD orders:events * type paid order_id 1001
XREADGROUP GROUP billing worker-1 COUNT 10 BLOCK 5000 STREAMS orders:events >
XACK orders:events billing 1727330000000-0`
        }
      }
    ],
    summary: [
      "Redis chạy lệnh tuần tự trên một luồng chính nên mỗi lệnh là nguyên tử.",
      "Chọn cấu trúc theo bài toán: Hash cho object, Sorted Set cho xếp hạng, Stream cho event có ACK.",
      "Đặt TTL cho dữ liệu cache; đặt tên key có tiền tố rõ ràng.",
      "Coi Redis là nơi lưu dữ liệu có thể tái tạo trừ khi đã cấu hình persistence phù hợp."
    ],
    pitfalls: [
      "Dùng `KEYS *` trên production: lệnh duyệt toàn bộ key và chặn Redis. Dùng `SCAN` theo từng lô.",
      "Lưu một key khổng lồ (Hash hàng triệu field, String vài trăm MB): thao tác trên nó chặn luồng chính. Chia nhỏ theo khoá con.",
      "Không đặt TTL và không cấu hình `maxmemory-policy`, Redis đầy bộ nhớ rồi từ chối ghi. Dùng TTL và chính sách như `allkeys-lru` cho cache."
    ],
    quiz: [
      {
        q: "Cấu trúc nào phù hợp nhất cho bảng xếp hạng điểm người chơi?",
        options: ["List", "Set", "String", "Sorted Set"],
        answer: 3,
        explain: "Sorted Set giữ phần tử theo score, hỗ trợ lấy top-N và thứ hạng trong O(log n). List không tự sắp xếp; Set không có score."
      },
      {
        q: "Vì sao nhiều client cùng gọi `INCR` trên một key không bị mất lượt đếm?",
        options: [
          "Vì Redis thực thi các lệnh tuần tự trên một luồng chính nên mỗi lệnh là nguyên tử",
          "Vì Redis dùng transaction Serializable",
          "Vì client tự khoá key",
          "Vì INCR ghi xuống đĩa trước"
        ],
        answer: 0,
        explain: "Mô hình thực thi tuần tự khiến mỗi lệnh chạy trọn vẹn trước lệnh tiếp theo. Không cần khoá từ phía client."
      },
      {
        q: "Điểm khác biệt quan trọng của Stream so với Pub/Sub?",
        options: [
          "Stream nhanh gấp đôi",
          "Stream lưu message và hỗ trợ consumer group với ACK, consumer offline vẫn đọc lại được",
          "Pub/Sub lưu message vĩnh viễn",
          "Stream không có thứ tự"
        ],
        answer: 1,
        explain: "Pub/Sub là fire-and-forget: subscriber không kết nối sẽ mất message. Stream là log lưu trữ có ID tăng dần, consumer group theo dõi message chưa ACK."
      }
    ]
  },

  "p04.m4.t1": {
    sections: [
      {
        h: "Ba chiến lược cache phổ biến",
        list: [
          "Cache-aside (lazy loading): ứng dụng đọc cache trước; nếu miss thì đọc DB rồi ghi vào cache. Khi cập nhật, ghi DB rồi xoá key cache. Phổ biến nhất vì đơn giản và chỉ cache dữ liệu thực sự được đọc.",
          "Write-through: mọi lần ghi đều ghi vào cache và DB cùng lúc (thường qua một lớp trung gian). Cache luôn mới, đổi lại ghi chậm hơn và cache chứa cả dữ liệu ít đọc.",
          "Write-behind (write-back): ghi vào cache trước, sau đó đẩy xuống DB bất đồng bộ theo lô. Ghi rất nhanh, nhưng nếu cache sập trước khi đẩy xuống thì mất dữ liệu. Chỉ hợp với dữ liệu như bộ đếm lượt xem."
        ],
        p: [
          "Cache chỉ đáng dùng khi dữ liệu được đọc nhiều hơn ghi và bạn chấp nhận được dữ liệu cũ trong một khoảng ngắn. Hãy đo tỉ lệ hit trước khi kết luận cache có hiệu quả."
        ]
      },
      {
        h: "Cache-aside và invalidation",
        p: [
          "Khi dữ liệu thay đổi, xoá key cache thường an toàn hơn ghi đè giá trị mới: hai request cập nhật đồng thời có thể ghi đè cache theo thứ tự sai, để lại giá trị cũ vĩnh viễn. Xoá key thì lần đọc sau sẽ tải lại từ DB.",
          "TTL là lưới an toàn: kể cả khi bạn quên invalidate ở đâu đó, dữ liệu sai cũng chỉ tồn tại tối đa bằng TTL. Với dữ liệu phức tạp (danh sách, trang tìm kiếm), invalidation chính xác rất khó, hãy dùng TTL ngắn hoặc gắn version vào key."
        ],
        code: {
          lang: "typescript",
          file: "product.cache.ts",
          src: `import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL!);

const TTL = 300; // giây

export async function getProduct(id: number) {
  const key = \`cache:product:\${id}\`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const product = await prisma.product.findUnique({ where: { id } });
  if (product) {
    // Jitter: TTL lệch ngẫu nhiên để các key không hết hạn cùng lúc
    const ttl = TTL + Math.floor(Math.random() * 60);
    await redis.set(key, JSON.stringify(product), 'EX', ttl);
  }
  return product;
}

export async function updateProduct(id: number, data: { name: string }) {
  const product = await prisma.product.update({ where: { id }, data });
  await redis.del(\`cache:product:\${id}\`); // xoá sau khi DB đã commit
  return product;
}`
        }
      },
      {
        h: "Chống cache stampede",
        p: [
          "Cache stampede (thundering herd) xảy ra khi một key nóng hết hạn và hàng nghìn request cùng miss, cùng lao vào DB tính lại một giá trị. DB quá tải và có thể sập dây chuyền."
        ],
        list: [
          "Khoá khi tính lại: chỉ request lấy được `SET lock:key token NX PX 5000` mới đọc DB; request khác chờ ngắn rồi đọc lại cache hoặc trả giá trị cũ.",
          "Request coalescing (single-flight): trong một instance, gom các lời gọi trùng key đang chờ vào cùng một Promise.",
          "Jitter TTL: thêm độ lệch ngẫu nhiên để nhiều key không hết hạn cùng lúc.",
          "Stale-while-revalidate / làm mới sớm: lưu kèm thời điểm hết hạn mềm, khi gần hết hạn thì một request làm mới ở nền trong khi vẫn trả giá trị cũ.",
          "Cache giá trị rỗng với TTL ngắn để chống cache penetration (truy vấn liên tục các id không tồn tại)."
        ]
      }
    ],
    summary: [
      "Cache-aside phổ biến nhất: đọc cache, miss thì đọc DB và ghi cache; cập nhật thì xoá key.",
      "Write-through giữ cache luôn mới; write-behind ghi nhanh nhưng có rủi ro mất dữ liệu.",
      "Xoá key an toàn hơn ghi đè; TTL là lưới an toàn cho invalidation.",
      "Chống stampede bằng lock, single-flight, jitter TTL và stale-while-revalidate."
    ],
    pitfalls: [
      "Xoá cache trước khi transaction DB commit: request khác kịp đọc dữ liệu cũ từ DB và ghi lại vào cache. Xoá sau khi commit.",
      "Cache dữ liệu theo user trong key chung (ví dụ `cache:cart` không có userId), lộ dữ liệu giữa người dùng. Luôn đưa đủ định danh vào key.",
      "Không cache kết quả \"không tìm thấy\", kẻ tấn công gửi id ngẫu nhiên đi thẳng vào DB. Cache giá trị rỗng với TTL ngắn."
    ],
    quiz: [
      {
        q: "Trong cache-aside, khi cập nhật sản phẩm bạn nên làm gì với cache?",
        options: [
          "Không làm gì, chờ TTL",
          "Xoá toàn bộ Redis",
          "Cập nhật DB rồi xoá key cache tương ứng",
          "Chỉ cập nhật cache, không cập nhật DB"
        ],
        answer: 2,
        explain: "Xoá key sau khi DB commit để lần đọc sau tải giá trị mới. Chờ TTL để lại dữ liệu cũ; xoá toàn bộ gây stampede; chỉ ghi cache là write-behind thiếu an toàn."
      },
      {
        q: "Cache stampede là gì?",
        options: [
          "Redis hết bộ nhớ",
          "Key không có TTL",
          "Cache trả về dữ liệu của user khác",
          "Một key nóng hết hạn khiến rất nhiều request cùng miss và cùng truy vấn DB"
        ],
        answer: 3,
        explain: "Stampede là cơn bão request dồn xuống DB khi cache của key nóng biến mất. Giải pháp là lock, single-flight, jitter và làm mới sớm."
      },
      {
        q: "Rủi ro chính của write-behind là gì?",
        options: [
          "Dữ liệu chưa kịp ghi xuống DB có thể mất nếu cache gặp sự cố",
          "Đọc chậm",
          "Không dùng được với Redis",
          "Tỉ lệ cache hit thấp"
        ],
        answer: 0,
        explain: "Write-behind coi cache là nơi ghi đầu tiên và đẩy xuống DB sau, nên sự cố cache trước khi flush sẽ làm mất dữ liệu."
      }
    ]
  },

  "p04.m4.t2": {
    sections: [
      {
        h: "Session store và rate limiting",
        p: [
          "Khi chạy nhiều instance sau load balancer, session không thể nằm trong RAM của từng process. Lưu session trong Redis (Hash hoặc String có TTL) giúp mọi instance đọc cùng dữ liệu, và thu hồi session chỉ cần `DEL`.",
          "Rate limiting cũng cần trạng thái dùng chung. Cách đơn giản nhất là fixed window: `INCR` một key theo phút, đặt `EXPIRE` ở lần đầu. Nhược điểm là người dùng có thể dồn gấp đôi request quanh ranh giới hai cửa sổ. Sliding window dùng Sorted Set lưu timestamp từng request; token bucket thường viết bằng script Lua để đảm bảo nguyên tử."
        ],
        code: {
          lang: "typescript",
          file: "rate-limit.ts",
          src: `// Fixed window: tối đa 100 request/phút cho mỗi user
export async function allow(userId: string): Promise<boolean> {
  const windowKey = \`rl:\${userId}:\${Math.floor(Date.now() / 60_000)}\`;
  const [[, count]] = (await redis
    .multi()
    .incr(windowKey)
    .expire(windowKey, 60)
    .exec()) as [[Error | null, number], [Error | null, number]];
  return count <= 100;
}`
        }
      },
      {
        h: "Distributed lock",
        p: [
          "Khi nhiều instance cùng có thể làm một việc (gửi báo cáo, xử lý thanh toán của một đơn), bạn cần đảm bảo chỉ một nơi làm tại một thời điểm. Công thức cơ bản: `SET lock:<tên> <token_ngẫu_nhiên> NX PX <ms>`. `NX` chỉ đặt khi chưa tồn tại; `PX` để lock tự hết hạn nếu tiến trình chết.",
          "Khi nhả lock phải kiểm tra token là của mình rồi mới xoá, bằng script Lua để nguyên tử. Nếu chỉ `DEL`, bạn có thể xoá nhầm lock mà tiến trình khác vừa lấy sau khi lock của bạn hết hạn.",
          "Lưu ý quan trọng: lock dựa trên thời gian hết hạn không tuyệt đối an toàn, vì tiến trình có thể bị dừng (GC pause, mạng chậm) lâu hơn TTL. Với tác vụ cần đúng tuyệt đối, hãy kết hợp fencing token hoặc ràng buộc trong DB (UNIQUE, optimistic locking)."
        ],
        code: {
          lang: "bash",
          file: "redis-cli",
          src: `# Lấy lock trong 30 giây với token ngẫu nhiên
SET lock:report:2026-09-26 3f9a1c NX PX 30000

# Nhả lock an toàn: chỉ xoá nếu token khớp
EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 lock:report:2026-09-26 3f9a1c`
        }
      },
      {
        h: "Pub/Sub và queue",
        p: [
          "Pub/Sub gửi message tới mọi subscriber đang kết nối, không lưu lại. Hợp với tín hiệu tạm thời: đồng bộ WebSocket giữa các instance, báo xoá cache cục bộ. Subscriber mất kết nối sẽ mất message.",
          "Với job nền cần đảm bảo xử lý (gửi email, xử lý ảnh), hãy dùng queue có retry: BullMQ (xây trên Redis) phổ biến trong hệ Node.js/NestJS, hỗ trợ retry với backoff, delay, ưu tiên, giới hạn đồng thời. Redis Stream với consumer group là lựa chọn ở mức thấp hơn khi bạn muốn tự kiểm soát."
        ],
        code: {
          lang: "typescript",
          file: "email.queue.ts",
          src: `import { Queue, Worker } from 'bullmq';
const connection = { host: 'localhost', port: 6379 };

export const emailQueue = new Queue('email', { connection });
await emailQueue.add('welcome', { userId: 42 }, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: true,
});

new Worker('email', async (job) => {
  await sendWelcomeEmail(job.data.userId);
}, { connection, concurrency: 10 });`
        }
      }
    ],
    summary: [
      "Redis giữ trạng thái dùng chung cho nhiều instance: session, rate limit, lock.",
      "Fixed window đơn giản nhưng có hiệu ứng biên; sliding window và token bucket chính xác hơn.",
      "Lock: `SET key token NX PX`, nhả bằng Lua kiểm tra token; lock theo thời gian không tuyệt đối an toàn.",
      "Pub/Sub không lưu message; job quan trọng dùng queue có retry như BullMQ hoặc Stream."
    ],
    pitfalls: [
      "Nhả lock bằng `DEL` không kiểm tra token, xoá nhầm lock của tiến trình khác.",
      "Dùng Pub/Sub để giao việc gửi email, worker restart đúng lúc là mất việc. Dùng queue có lưu trữ và ACK.",
      "`INCR` rồi `EXPIRE` bằng hai lời gọi riêng, tiến trình chết giữa chừng để lại key không bao giờ hết hạn. Dùng MULTI/pipeline hoặc Lua."
    ],
    quiz: [
      {
        q: "Vì sao cần token ngẫu nhiên khi dùng Redis lock?",
        options: [
          "Để lock nhanh hơn",
          "Để khi nhả lock chỉ xoá nếu lock vẫn thuộc về mình, tránh xoá lock của tiến trình khác",
          "Để mã hoá dữ liệu",
          "Redis bắt buộc giá trị phải ngẫu nhiên"
        ],
        answer: 1,
        explain: "Nếu lock của bạn đã hết hạn và tiến trình khác vừa lấy lại, DEL thẳng sẽ xoá lock của họ. So token trước khi xoá (nguyên tử bằng Lua) tránh điều đó."
      },
      {
        q: "Nhược điểm của rate limit fixed window là gì?",
        options: [
          "Không dùng được với Redis",
          "Tốn quá nhiều bộ nhớ",
          "Người dùng có thể gửi gần gấp đôi giới hạn quanh ranh giới giữa hai cửa sổ",
          "Không có TTL"
        ],
        answer: 2,
        explain: "100 request cuối phút trước và 100 request đầu phút sau đều hợp lệ, tạo 200 request trong vài giây. Sliding window hoặc token bucket làm mượt điều này."
      },
      {
        q: "Công cụ nào phù hợp để gửi email chào mừng với retry khi lỗi?",
        options: ["Redis Pub/Sub", "Một biến toàn cục trong Node.js", "Lệnh KEYS", "BullMQ"],
        answer: 3,
        explain: "BullMQ lưu job trong Redis, hỗ trợ attempts và backoff. Pub/Sub không lưu message; biến toàn cục mất khi restart và không chia sẻ giữa instance."
      }
    ]
  },

  "p04.m4.t3": {
    sections: [
      {
        h: "Document database hoạt động thế nào?",
        p: [
          "MongoDB lưu dữ liệu dạng document (BSON, giống JSON có thêm kiểu như Date, ObjectId, Decimal128) trong các collection. Không bắt buộc schema cố định: hai document trong cùng collection có thể có trường khác nhau. Điều này hữu ích khi dữ liệu thật sự đa dạng, như catalog sản phẩm mà mỗi loại có bộ thuộc tính riêng.",
          "\"Schema linh hoạt\" không có nghĩa là không có schema. Schema chuyển từ database vào code ứng dụng. Bạn vẫn nên khai báo validation (JSON Schema validator của MongoDB, hoặc Mongoose/Zod ở tầng ứng dụng) để tránh dữ liệu rác."
        ]
      },
      {
        h: "Embed hay reference?",
        p: [
          "Câu hỏi thiết kế quan trọng nhất trong MongoDB. Quy tắc cơ bản: dữ liệu được đọc cùng nhau thì lưu cùng nhau."
        ],
        list: [
          "Embed (nhúng): đặt dữ liệu con bên trong document cha. Hợp với quan hệ \"thuộc về\", số lượng con có giới hạn, và luôn đọc cùng cha. Ví dụ: địa chỉ giao hàng và các dòng sản phẩm trong một đơn hàng. Một lần đọc lấy đủ dữ liệu, cập nhật trong một document là nguyên tử.",
          "Reference (tham chiếu): lưu ID và truy vấn riêng hoặc dùng `$lookup`. Hợp khi dữ liệu con tăng không giới hạn (bình luận của bài viết nổi tiếng), được chia sẻ bởi nhiều cha (tác giả), hoặc thường được truy cập độc lập.",
          "Giới hạn cứng: mỗi document tối đa 16 MB. Mảng nhúng tăng mãi là dấu hiệu nên chuyển sang reference."
        ],
        code: {
          lang: "javascript",
          file: "mongosh.js",
          src: `// Embed: đơn hàng chứa sẵn items và địa chỉ
db.orders.insertOne({
  userId: ObjectId("66f5a1b2c3d4e5f601234567"),
  status: "paid",
  shippingAddress: { city: "Hà Nội", street: "12 Láng Hạ" },
  items: [
    { productId: 7, name: "Tai nghe X", qty: 1, unitPrice: NumberDecimal("1990000") }
  ],
  createdAt: new Date()
});

// Reference: bình luận tách collection, index theo postId
db.comments.createIndex({ postId: 1, createdAt: -1 });
db.comments.find({ postId: ObjectId("66f5a1b2c3d4e5f601234568") })
  .sort({ createdAt: -1 }).limit(20);`
        }
      },
      {
        h: "Khi nào chọn MongoDB, khi nào ở lại Postgres?",
        p: [
          "MongoDB hợp với dữ liệu có cấu trúc thay đổi nhiều, truy cập chủ yếu theo từng document (lấy cả một hồ sơ, một cấu hình), cần scale ghi ngang bằng sharding. MongoDB có hỗ trợ transaction nhiều document, nhưng nếu nghiệp vụ của bạn cần nó ở khắp nơi, đó là dấu hiệu dữ liệu mang tính quan hệ.",
          "Postgres hợp với dữ liệu quan hệ chặt chẽ, nhiều JOIN, báo cáo, ràng buộc toàn vẹn. Với phần dữ liệu linh hoạt, cột `jsonb` của Postgres thường đủ dùng, giúp bạn không phải vận hành thêm một hệ thống. Lời khuyên thực dụng cho dự án mới: bắt đầu với Postgres, thêm MongoDB khi có lý do cụ thể."
        ]
      }
    ],
    summary: [
      "MongoDB lưu document BSON trong collection; schema linh hoạt nhưng vẫn cần validation.",
      "Embed khi dữ liệu con có giới hạn và luôn đọc cùng cha; reference khi con tăng không giới hạn hoặc được chia sẻ.",
      "Document tối đa 16 MB; cập nhật trong một document là nguyên tử.",
      "Dữ liệu quan hệ, nhiều JOIN: ưu tiên Postgres; jsonb thường đủ cho phần linh hoạt."
    ],
    pitfalls: [
      "Nhúng mảng bình luận không giới hạn vào bài viết, document phình tới giới hạn 16 MB và mỗi lần cập nhật rất nặng. Tách collection.",
      "Chọn MongoDB vì \"không cần thiết kế schema\", rồi dữ liệu mỗi nơi một kiểu. Luôn định nghĩa và validate schema.",
      "Mô hình hoá MongoDB y hệt bảng quan hệ rồi dùng `$lookup` khắp nơi, mất lợi thế của document và chậm. Thiết kế theo mẫu truy cập."
    ],
    quiz: [
      {
        q: "Địa chỉ giao hàng của một đơn hàng nên embed hay reference trong MongoDB?",
        options: [
          "Embed vào document đơn hàng",
          "Reference sang collection addresses",
          "Lưu ở một database khác",
          "Không lưu"
        ],
        answer: 0,
        explain: "Địa chỉ giao hàng thuộc về đơn, luôn đọc cùng đơn và là ảnh chụp tại lúc đặt. Embed giúp một lần đọc lấy đủ và không bị ảnh hưởng khi user đổi địa chỉ sau này."
      },
      {
        q: "Giới hạn kích thước mỗi document trong MongoDB là bao nhiêu?",
        options: ["1 MB", "16 MB", "512 MB", "Không giới hạn"],
        answer: 1,
        explain: "BSON document tối đa 16 MB. Dữ liệu lớn hơn cần tách document hoặc dùng GridFS cho file."
      },
      {
        q: "Tình huống nào gợi ý nên dùng reference thay vì embed?",
        options: [
          "Dữ liệu con luôn đọc cùng cha và có ít phần tử",
          "Dữ liệu con cần cập nhật nguyên tử cùng cha",
          "Dữ liệu con tăng không giới hạn và thường được truy vấn độc lập",
          "Dữ liệu con nhỏ và không bao giờ thay đổi"
        ],
        answer: 2,
        explain: "Con tăng không giới hạn sẽ làm document phình to, và nếu được truy vấn độc lập thì collection riêng với index phù hợp hiệu quả hơn. Các trường hợp còn lại đều nghiêng về embed."
      }
    ]
  },

  "p04.m4.t4": {
    sections: [
      {
        h: "Không có database tốt nhất, chỉ có phù hợp nhất",
        p: [
          "Mỗi loại NoSQL tối ưu cho một kiểu truy cập và đánh đổi những thứ khác. Chúng thường yêu cầu bạn thiết kế theo truy vấn (query-first): liệt kê các mẫu truy cập trước, rồi mới thiết kế key và bảng. Ngược với SQL, nơi bạn chuẩn hoá dữ liệu trước rồi truy vấn tùy ý sau.",
          "Với hầu hết sản phẩm, Postgres + Redis đã đủ. Chỉ thêm một hệ thống mới khi có yêu cầu cụ thể mà hai công cụ này không đáp ứng tốt, vì mỗi hệ thống thêm vào là thêm chi phí vận hành, backup, giám sát và học tập."
        ]
      },
      {
        h: "Bốn nhóm chính",
        list: [
          "Key-value (DynamoDB): truy cập bằng partition key (và sort key tùy chọn) với độ trễ thấp ổn định ở mọi quy mô, serverless, tính phí theo request hoặc capacity. Truy vấn ngoài khoá cần secondary index; không có JOIN. Thường dùng single-table design dựa trên mẫu truy cập.",
          "Wide-column (Cassandra, ScyllaDB): dữ liệu phân tán theo partition key trên nhiều node, không có master, ghi rất nhanh nhờ cấu trúc LSM. Consistency có thể tinh chỉnh theo từng truy vấn (ONE, QUORUM, ALL). Hợp với log sự kiện, dữ liệu IoT, tin nhắn quy mô rất lớn.",
          "Graph (Neo4j): lưu node và cạnh là thành phần hạng nhất, duyệt quan hệ nhiều bước nhanh. Hợp với mạng xã hội (bạn của bạn), gợi ý, phát hiện gian lận qua chuỗi giao dịch.",
          "Time-series (TimescaleDB, InfluxDB): tối ưu cho dữ liệu gắn thời gian ghi liên tục, truy vấn theo khoảng thời gian, nén và tự xoá dữ liệu cũ. TimescaleDB là extension của Postgres nên bạn vẫn dùng SQL."
        ],
        p: [
          "Ví dụ thực tế: một nền tảng thương mại điện tử dùng Postgres cho đơn hàng, Redis cho cache và giỏ hàng, TimescaleDB cho metric, và Elasticsearch cho tìm kiếm sản phẩm."
        ]
      },
      {
        h: "Ví dụ truy vấn",
        p: [
          "Hai ví dụ dưới cho thấy sự khác biệt về cách diễn đạt: Cypher của Neo4j mô tả mẫu đường đi, còn TimescaleDB là SQL bình thường cộng các hàm theo thời gian."
        ],
        code: {
          lang: "sql",
          file: "examples.sql",
          src: `-- TimescaleDB (extension của PostgreSQL)
CREATE TABLE metrics (
  time      timestamptz NOT NULL,
  device_id int NOT NULL,
  cpu       double precision
);
SELECT create_hypertable('metrics', by_range('time'));

SELECT time_bucket('5 minutes', time) AS bucket, device_id, avg(cpu)
FROM metrics
WHERE time > now() - interval '1 hour'
GROUP BY bucket, device_id
ORDER BY bucket;

-- Neo4j Cypher (không phải SQL): gợi ý "bạn của bạn"
-- MATCH (me:User {id: 42})-[:FOLLOWS]->(:User)-[:FOLLOWS]->(fof:User)
-- WHERE NOT (me)-[:FOLLOWS]->(fof) AND fof <> me
-- RETURN fof.name, count(*) AS mutual ORDER BY mutual DESC LIMIT 10;`
        }
      }
    ],
    summary: [
      "NoSQL thường thiết kế theo mẫu truy cập (query-first), đánh đổi tính linh hoạt truy vấn lấy quy mô hoặc tốc độ.",
      "DynamoDB: key-value serverless; Cassandra: wide-column ghi nhanh, consistency tinh chỉnh; Neo4j: duyệt quan hệ; TimescaleDB: time-series trên Postgres.",
      "Mỗi hệ thống thêm vào là thêm chi phí vận hành; chỉ thêm khi có nhu cầu rõ.",
      "Postgres + Redis đủ cho phần lớn sản phẩm giai đoạn đầu."
    ],
    pitfalls: [
      "Thiết kế bảng DynamoDB/Cassandra như bảng SQL chuẩn hoá rồi mới nghĩ truy vấn, sau đó không truy vấn được theo nhu cầu. Liệt kê mẫu truy cập trước.",
      "Chọn partition key có ít giá trị (ví dụ `country`), dữ liệu dồn vào một vài partition nóng. Chọn key phân tán đều.",
      "Thêm Neo4j chỉ để lưu quan hệ cha-con đơn giản mà recursive CTE của Postgres làm tốt."
    ],
    quiz: [
      {
        q: "Hệ thống nào phù hợp nhất cho gợi ý \"người bạn có thể biết\" qua nhiều bước quan hệ?",
        options: ["DynamoDB", "Redis String", "TimescaleDB", "Neo4j"],
        answer: 3,
        explain: "Graph database lưu cạnh như thành phần hạng nhất nên duyệt nhiều bước quan hệ hiệu quả. Các lựa chọn còn lại không tối ưu cho duyệt đồ thị."
      },
      {
        q: "Đặc điểm của cách thiết kế dữ liệu trong DynamoDB/Cassandra?",
        options: [
          "Liệt kê mẫu truy cập trước rồi thiết kế key/bảng phục vụ chúng",
          "Chuẩn hoá tới 3NF rồi truy vấn tùy ý",
          "Luôn dùng JOIN",
          "Không cần khoá"
        ],
        answer: 0,
        explain: "Các hệ thống này truy cập hiệu quả chủ yếu qua key, không có JOIN, nên phải thiết kế từ truy vấn. Chuẩn hoá rồi truy vấn tùy ý là cách tiếp cận của SQL."
      },
      {
        q: "Ưu điểm của TimescaleDB so với một time-series DB riêng biệt là gì?",
        options: [
          "Không cần lưu dữ liệu",
          "Là extension của PostgreSQL nên dùng SQL, JOIN với bảng nghiệp vụ và công cụ Postgres sẵn có",
          "Không hỗ trợ timestamp",
          "Chỉ chạy trên MongoDB"
        ],
        answer: 1,
        explain: "TimescaleDB chạy trong Postgres, bạn tận dụng SQL, backup và kinh nghiệm vận hành Postgres hiện có."
      }
    ]
  },

  "p04.m4.t5": {
    sections: [
      {
        h: "Vì sao LIKE '%từ%' không đủ?",
        p: [
          "`WHERE title ILIKE '%tai nghe%'` phải quét toàn bảng (B-tree không giúp được với ký tự đại diện ở đầu), không hiểu biến thể từ, không xếp hạng mức độ liên quan, và không tìm được khi người dùng gõ sai thứ tự từ.",
          "Full-text search tách văn bản thành các token (từ), chuẩn hoá chúng (chữ thường, bỏ từ dừng, đưa về gốc từ theo ngôn ngữ), rồi xây index đảo ngược từ token → tài liệu. Truy vấn cũng được tách token tương tự và so khớp trên index."
        ]
      },
      {
        h: "Full-text trong PostgreSQL",
        p: [
          "`tsvector` là văn bản đã tách token; `tsquery` là truy vấn. Toán tử `@@` kiểm tra khớp, `ts_rank` chấm điểm liên quan, GIN index tăng tốc. `websearch_to_tsquery` hiểu cú pháp quen thuộc: cụm trong ngoặc kép, dấu trừ để loại từ, `or`.",
          "Postgres không có cấu hình ngôn ngữ tiếng Việt sẵn; cấu hình `simple` (chỉ tách từ và đưa về chữ thường) thường dùng cho tiếng Việt. Để tìm không dấu, có thể dùng extension `unaccent`, nhưng hàm này không được đánh dấu IMMUTABLE nên không dùng trực tiếp trong generated column; cần bọc bằng một hàm IMMUTABLE riêng hoặc lưu thêm cột đã bỏ dấu. Extension `pg_trgm` hỗ trợ tìm gần đúng, chịu lỗi chính tả nhẹ và tăng tốc `ILIKE '%...%'`."
        ],
        code: {
          lang: "sql",
          file: "fts.sql",
          src: `ALTER TABLE products ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX products_search_idx ON products USING gin (search);

SELECT id, name, ts_rank(search, q) AS rank
FROM products, websearch_to_tsquery('simple', 'tai nghe -"có dây"') AS q
WHERE search @@ q
ORDER BY rank DESC
LIMIT 20;

-- Tìm gần đúng bằng trigram
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX products_name_trgm ON products USING gin (name gin_trgm_ops);
SELECT name FROM products WHERE name % 'tai ngh' ORDER BY similarity(name, 'tai ngh') DESC LIMIT 5;`
        }
      },
      {
        h: "Khi nào cần Elasticsearch/OpenSearch?",
        p: [
          "Postgres full-text đủ cho tìm kiếm blog, tài liệu nội bộ, danh sách sản phẩm vừa phải. Không phải vận hành thêm hệ thống, dữ liệu luôn nhất quán với giao dịch.",
          "Elasticsearch/OpenSearch (xây trên Lucene) đáng cân nhắc khi cần: analyzer phong phú (từ đồng nghĩa, autocomplete, tách từ tiếng Việt qua plugin), xếp hạng BM25 tinh chỉnh, faceted search (đếm theo thương hiệu, khoảng giá) trên hàng triệu tài liệu, tìm kiếm log quy mô lớn.",
          "Đánh đổi: đây là một hệ thống riêng, dữ liệu phải đồng bộ từ DB chính (qua outbox pattern, CDC như Debezium, hoặc job định kỳ) nên luôn có độ trễ (eventual consistency). Postgres vẫn là nguồn sự thật, index tìm kiếm là bản sao có thể dựng lại."
        ]
      }
    ],
    summary: [
      "`ILIKE '%...%'` không dùng được B-tree, không xếp hạng và không hiểu ngôn ngữ.",
      "Postgres FTS: tsvector + tsquery + GIN; websearch_to_tsquery cho cú pháp tìm kiếm quen thuộc.",
      "Tiếng Việt thường dùng cấu hình `simple`; pg_trgm cho tìm gần đúng.",
      "Elasticsearch/OpenSearch cho tìm kiếm nâng cao, đổi lại phải đồng bộ dữ liệu và chấp nhận độ trễ."
    ],
    pitfalls: [
      "Dùng cấu hình `english` cho nội dung tiếng Việt, stemming tiếng Anh làm sai token. Dùng `simple` hoặc giải pháp chuyên cho tiếng Việt.",
      "Tính `to_tsvector(...)` trong WHERE mà index lại tạo trên biểu thức khác, planner không dùng được index. Dùng generated column hoặc index trên đúng biểu thức.",
      "Coi Elasticsearch là nguồn dữ liệu chính, mất dữ liệu khi cluster lỗi. Luôn dựng lại được index từ DB chính."
    ],
    quiz: [
      {
        q: "Loại index nào dùng cho cột tsvector?",
        options: ["B-tree", "Hash", "GIN", "Không cần index"],
        answer: 2,
        explain: "GIN là index đảo ngược từ token đến dòng, phù hợp với toán tử @@. B-tree và Hash so sánh cả giá trị nên không dùng được."
      },
      {
        q: "Vì sao thường dùng cấu hình `simple` cho tiếng Việt trong Postgres?",
        options: [
          "Vì nó nhanh nhất",
          "Vì simple hỗ trợ từ đồng nghĩa",
          "Vì simple tự bỏ dấu",
          "Vì Postgres không có sẵn cấu hình tiếng Việt, simple chỉ tách từ và chuyển chữ thường, không áp stemming sai ngôn ngữ"
        ],
        answer: 3,
        explain: "Cấu hình simple không có stemming hay từ dừng theo ngôn ngữ nên an toàn với tiếng Việt. Nó không tự bỏ dấu (cần unaccent) và không có từ đồng nghĩa."
      },
      {
        q: "Đánh đổi chính khi thêm Elasticsearch cho tìm kiếm là gì?",
        options: [
          "Phải vận hành thêm hệ thống và đồng bộ dữ liệu, index tìm kiếm có độ trễ so với DB chính",
          "Không tìm được tiếng Việt",
          "Không hỗ trợ xếp hạng",
          "Phải bỏ PostgreSQL"
        ],
        answer: 0,
        explain: "Elasticsearch mạnh về tìm kiếm nhưng là hệ thống riêng cần đồng bộ, dẫn tới eventual consistency và chi phí vận hành. Postgres vẫn là nguồn sự thật."
      }
    ]
  },

  "p04.m4.t6": {
    sections: [
      {
        h: "Định lý CAP nói gì?",
        p: [
          "Trong một hệ thống dữ liệu phân tán, CAP gồm ba tính chất: Consistency (mọi lần đọc thấy lần ghi mới nhất, hoặc nhận lỗi), Availability (mọi request tới node còn sống đều nhận phản hồi không lỗi), Partition tolerance (hệ thống tiếp tục hoạt động khi mạng giữa các node bị chia cắt).",
          "Cách hiểu đúng: phân vùng mạng (network partition) chắc chắn sẽ xảy ra trong hệ phân tán, nên P không phải là lựa chọn. Khi có phân vùng, bạn buộc phải chọn: giữ Consistency (từ chối request ở phía không chắc chắn có dữ liệu mới) hoặc giữ Availability (vẫn trả lời nhưng có thể là dữ liệu cũ). Câu \"chọn 2 trong 3\" dễ gây hiểu nhầm."
        ]
      },
      {
        h: "Ví dụ CP và AP",
        list: [
          "CP: khi mất kết nối tới đa số node, hệ thống từ chối ghi thay vì chấp nhận dữ liệu có thể mâu thuẫn. etcd, ZooKeeper (dựa trên đồng thuận Raft/ZAB) hành xử như vậy. Postgres primary + replica đồng bộ cũng nghiêng về C: nếu replica đồng bộ không phản hồi, commit sẽ chờ.",
          "AP: mỗi phía vẫn nhận ghi, sau đó hoà giải khi mạng phục hồi. Cassandra, DynamoDB (ở chế độ eventually consistent read) là ví dụ. Hợp với giỏ hàng, lượt like, nơi hiện dữ liệu cũ vài giây chấp nhận được.",
          "Nhiều hệ thống cho phép tinh chỉnh theo từng thao tác: Cassandra với consistency level QUORUM; DynamoDB với strongly consistent read."
        ],
        p: [
          "Chọn theo nghiệp vụ: số dư tài khoản, tồn kho khi thanh toán cần C. Bộ đếm lượt xem, feed mạng xã hội thường ưu tiên A."
        ]
      },
      {
        h: "PACELC: khi không có sự cố thì sao?",
        p: [
          "CAP chỉ nói về lúc có phân vùng. PACELC bổ sung: if Partition, chọn Availability hoặc Consistency; Else (khi bình thường), chọn Latency hoặc Consistency. Nghĩa là ngay cả khi mạng ổn, đồng bộ dữ liệu sang nhiều node để đảm bảo nhất quán mạnh cũng tốn thời gian.",
          "Ví dụ gần gũi: ứng dụng NestJS đọc từ Postgres read replica (replication bất đồng bộ) để giảm tải primary. Độ trễ thấp hơn, nhưng người dùng vừa cập nhật hồ sơ có thể đọc lại thấy dữ liệu cũ. Giải pháp thường gặp là \"read-your-writes\": đọc từ primary trong vài giây sau khi user đó ghi, hoặc với các màn hình quan trọng."
        ],
        code: {
          lang: "typescript",
          file: "read-routing.ts",
          src: `// Đọc từ primary nếu user vừa ghi trong 5 giây gần đây, ngược lại đọc replica
async function getProfile(userId: number) {
  const recentlyWrote = await redis.exists(\`recent-write:\${userId}\`);
  const db = recentlyWrote ? primaryDb : replicaDb;
  return db.user.findUnique({ where: { id: userId } });
}

async function updateProfile(userId: number, data: { bio: string }) {
  await primaryDb.user.update({ where: { id: userId }, data });
  await redis.set(\`recent-write:\${userId}\`, '1', 'EX', 5);
}`
        }
      }
    ],
    summary: [
      "Phân vùng mạng là không tránh khỏi; khi xảy ra, phải chọn giữa Consistency và Availability.",
      "CP từ chối phục vụ để giữ đúng; AP vẫn phục vụ và hoà giải sau.",
      "PACELC: khi không có phân vùng, vẫn phải đánh đổi giữa Latency và Consistency.",
      "Read replica bất đồng bộ là ví dụ đời thường của đánh đổi L/C; dùng read-your-writes khi cần."
    ],
    pitfalls: [
      "Hiểu CAP là \"chọn 2 trong 3\" rồi tuyên bố hệ thống là \"CA\": trong hệ phân tán không thể bỏ P.",
      "Đọc từ replica ngay sau khi ghi và báo lỗi \"cập nhật không thành công\" cho người dùng. Định tuyến read-your-writes về primary.",
      "Áp một mức nhất quán cho mọi dữ liệu. Hãy chọn theo từng loại dữ liệu và tác động nghiệp vụ."
    ],
    quiz: [
      {
        q: "Theo cách hiểu đúng của CAP, khi xảy ra phân vùng mạng hệ thống phải làm gì?",
        options: [
          "Bỏ Partition tolerance",
          "Chọn giữ Consistency hoặc giữ Availability",
          "Giữ được cả ba tính chất nếu phần cứng đủ mạnh",
          "Tự động chuyển sang SQL"
        ],
        answer: 1,
        explain: "Phân vùng là thực tế của hệ phân tán, không thể chọn bỏ. Khi nó xảy ra, bạn chỉ có thể ưu tiên C hoặc A, phần cứng mạnh không thay đổi điều đó."
      },
      {
        q: "Phần \"ELC\" trong PACELC nói về điều gì?",
        options: [
          "Khi có phân vùng, chọn giữa độ trễ và nhất quán",
          "Mã hoá dữ liệu",
          "Khi không có phân vùng, vẫn phải đánh đổi giữa độ trễ và nhất quán",
          "Tốc độ ghi đĩa"
        ],
        answer: 2,
        explain: "Else Latency or Consistency: ở trạng thái bình thường, đồng bộ để nhất quán mạnh làm tăng độ trễ. Phần PAC mới nói về lúc có phân vùng."
      },
      {
        q: "Dữ liệu nào thường nên ưu tiên Consistency hơn Availability?",
        options: [
          "Số lượt xem video",
          "Số người đang online",
          "Danh sách bài viết gợi ý",
          "Số dư ví khi thực hiện thanh toán"
        ],
        answer: 3,
        explain: "Sai số dư có thể gây mất tiền, nên thà từ chối tạm thời còn hơn trả kết quả sai. Các dữ liệu còn lại chấp nhận sai lệch nhỏ trong thời gian ngắn."
      }
    ]
  },

});
