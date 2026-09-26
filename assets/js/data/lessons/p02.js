/* Nội dung bài học chương p02 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p02.m0.t0": {
    videos: [
      { id: "bOUhq46fd5g", title: "Why & When to Use Semantic HTML Elements over Divs", channel: "ByteGrad", lang: "en", minutes: 12, embed: true },
      { id: "2oiBKSjOOFE", title: "The Only Accessibility Video You Will Ever Need", channel: "Web Dev Simplified", lang: "en", minutes: 38, embed: true }
    ],
    sections: [
      {
        h: "Vì sao HTML ngữ nghĩa quan trọng",
        p: [
          "HTML ngữ nghĩa (semantic HTML) là dùng đúng thẻ cho đúng ý nghĩa: `header` cho phần đầu, `nav` cho điều hướng, `main` cho nội dung chính, `article` cho một nội dung độc lập, `button` cho hành động. Trình duyệt dựng từ đó một cây accessibility (accessibility tree) mà trình đọc màn hình (screen reader) như NVDA hay VoiceOver dùng để đọc trang cho người khiếm thị.",
          "Nếu bạn làm mọi thứ bằng `div` và `span`, cây này gần như trống: screen reader không biết đâu là menu, đâu là nút. Người dùng bàn phím cũng không Tab tới được một `div` có `onclick`. Ngoài ra, công cụ tìm kiếm hiểu cấu trúc trang tốt hơn khi bạn dùng heading `h1`–`h6` theo đúng thứ bậc."
        ],
        code: {
          lang: "html", file: "index.html",
          src: `<body>
  <header>
    <nav aria-label="Điều hướng chính">
      <ul>
        <li><a href="/">Trang chủ</a></li>
        <li><a href="/courses" aria-current="page">Khóa học</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <h1>Khóa học Backend</h1>
    <article>
      <h2>Node.js cơ bản</h2>
      <img src="/node.png" alt="Logo Node.js" width="120" height="120" />
      <button type="button">Đăng ký</button>
    </article>
  </main>
  <footer>© 2026 DevPath</footer>
</body>`
        }
      },
      {
        h: "Form dễ tiếp cận: label, alt và thông báo lỗi",
        p: [
          "Mỗi `input` cần một `label` gắn bằng thuộc tính `for` trùng với `id`. Nhờ vậy screen reader đọc được tên trường, và bấm vào chữ cũng focus vào ô nhập. Placeholder không thay được label vì nó biến mất khi người dùng gõ.",
          "Ảnh mang thông tin cần `alt` mô tả nội dung. Ảnh trang trí thì để `alt=\"\"` để screen reader bỏ qua. Thông báo lỗi nên liên kết với input qua `aria-describedby` để được đọc kèm."
        ],
        code: {
          lang: "html", file: "login.html",
          src: `<form>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required
         aria-invalid="true" aria-describedby="email-error" />
  <p id="email-error">Email không đúng định dạng.</p>
  <button type="submit">Đăng nhập</button>
</form>`
        }
      },
      {
        h: "ARIA chỉ khi cần và điều hướng bàn phím",
        p: [
          "Quy tắc đầu tiên của ARIA: nếu có thẻ HTML gốc làm được việc đó thì dùng thẻ gốc. Một `button` thật đã có sẵn role, focus, phím Enter và Space. Tự làm bằng `div role=\"button\"` thì bạn phải tự thêm `tabindex=\"0\"` và xử lý phím, rất dễ sót.",
          "ARIA hữu ích cho các widget mà HTML không có sẵn, ví dụ tab, combobox, hoặc vùng cập nhật động (`aria-live`). Hãy tự kiểm tra bằng cách rút chuột ra và chỉ dùng Tab, Shift+Tab, Enter, Esc để đi hết trang."
        ],
        list: [
          "Đừng xóa outline focus bằng `outline: none` mà không có kiểu focus thay thế (dùng `:focus-visible`).",
          "Thứ tự Tab nên theo thứ tự DOM; tránh `tabindex` dương.",
          "Dùng Lighthouse hoặc axe DevTools để quét lỗi cơ bản, nhưng vẫn cần thử tay."
        ]
      }
    ],
    summary: [
      "Thẻ ngữ nghĩa tạo ra accessibility tree cho screen reader và giúp SEO.",
      "Mỗi input cần label; ảnh cần alt phù hợp (rỗng nếu chỉ trang trí).",
      "Ưu tiên phần tử HTML gốc; ARIA chỉ bổ sung khi HTML không đủ.",
      "Trang phải dùng được hoàn toàn bằng bàn phím."
    ],
    pitfalls: [
      "Dùng `div onClick` thay cho `button`: không focus được, không bấm được bằng phím. Hãy dùng `button type=\"button\"`.",
      "Chỉ dùng placeholder thay label: mất ngữ cảnh khi gõ và screen reader có thể không đọc. Luôn có `label`.",
      "Thêm ARIA sai (ví dụ `role=\"button\"` cho thẻ `a` có href) làm thông tin đọc ra mâu thuẫn. Chỉ thêm ARIA khi hiểu rõ nó."
    ],
    quiz: [
      { q: "Vì sao nên dùng `<button>` thay vì `<div onclick>`?", options: ["Button tải nhanh hơn và nhẹ hơn div", "Button có sẵn role, focus và kích hoạt bằng phím", "Div hoàn toàn không nhận được sự kiện click", "Button luôn tự gửi dữ liệu lên server khi bấm"], answer: 1, explain: "Button gốc có sẵn ngữ nghĩa và hành vi bàn phím. Div vẫn nhận click nhưng không focus được và không có role. Button chỉ gửi form khi type là submit trong form." },
      { q: "Ảnh chỉ để trang trí nên có alt thế nào?", options: ["Bỏ hẳn thuộc tính alt", "alt=\"image\"", "alt=\"\" (rỗng)", "alt bằng tên file"], answer: 2, explain: "alt rỗng báo cho screen reader bỏ qua ảnh. Thiếu alt khiến một số screen reader đọc tên file; alt kiểu \"image\" là thông tin vô ích." },
      { q: "Quy tắc đầu tiên khi dùng ARIA là gì?", options: ["Luôn thêm role cho mọi thẻ để screen reader đọc", "Có phần tử HTML gốc phù hợp thì dùng nó thay ARIA", "Dùng aria-label thay cho label của mọi input", "Chỉ dùng ARIA cho ảnh và biểu tượng trang trí"], answer: 1, explain: "HTML gốc đã có sẵn ngữ nghĩa và hành vi. ARIA chỉ thay đổi thông tin cho công nghệ hỗ trợ, không thêm hành vi, nên dùng khi HTML không đáp ứng được." }
    ]
  },
  "p02.m0.t1": {
    videos: [
      { id: "AgZ0PX28bnA", title: "Mức độ ưu tiên trong CSS", channel: "F8 Official", lang: "vi", minutes: 11, embed: true },
      { id: "bv16wjxgV4U", title: "CSS Box-sizing | Tính ứng dụng của Box-sizing", channel: "F8 Official", lang: "vi", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "Box model: mỗi phần tử là một chiếc hộp",
        p: [
          "Mỗi phần tử trong CSS là một hộp gồm 4 lớp từ trong ra ngoài: content, padding, border, margin. Padding là khoảng đệm bên trong viền và có màu nền của phần tử. Margin là khoảng cách bên ngoài, trong suốt.",
          "Mặc định `box-sizing: content-box` nghĩa là `width` chỉ tính phần content. Một hộp `width: 300px` có `padding: 20px` và `border: 1px` sẽ chiếm 342px thực tế, dễ vỡ layout. Với `box-sizing: border-box`, width bao gồm cả padding và border, nên tính toán trực quan hơn. Hầu hết dự án đặt quy tắc này cho mọi phần tử.",
          "Lưu ý margin dọc của hai khối liền kề có thể gộp lại (margin collapsing): margin 20px và 30px chỉ tạo khoảng cách 30px. Hiện tượng này không xảy ra trong flex hoặc grid container."
        ],
        code: {
          lang: "css", file: "reset.css",
          src: `*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  width: 300px;        /* tổng chiều rộng thật là 300px */
  padding: 20px;
  border: 1px solid #ddd;
  margin-block: 16px;  /* margin trên và dưới */
}`
        }
      },
      {
        h: "Cascade và specificity",
        p: [
          "Khi nhiều quy tắc cùng áp vào một phần tử, trình duyệt chọn theo cascade: nguồn và độ quan trọng (`!important`), rồi cascade layer (`@layer`), rồi specificity, cuối cùng là thứ tự xuất hiện (quy tắc viết sau thắng).",
          "Specificity được tính như bộ ba (A, B, C): A là số id, B là số class, attribute và pseudo-class, C là số thẻ và pseudo-element. So sánh từ trái sang phải. Ví dụ `#nav a` là (1,0,1) thắng `.menu .item a` là (0,2,1) vì A lớn hơn. Inline style thắng mọi selector thông thường."
        ],
        list: [
          "`a` → (0,0,1)",
          "`.btn:hover` → (0,2,0)",
          "`#app .btn` → (1,1,0)",
          "`:where(.btn)` → (0,0,0), hữu ích để viết style mặc định dễ ghi đè"
        ]
      },
      {
        h: "CSS variables (custom properties)",
        p: [
          "Biến CSS khai báo bằng `--ten-bien` và dùng qua `var()`. Khác với biến của Sass (được thay lúc build), biến CSS sống lúc runtime, kế thừa theo cây DOM và có thể đổi bằng JavaScript hay media query. Đây là cách phổ biến để làm theme sáng/tối."
        ],
        code: {
          lang: "css", file: "theme.css",
          src: `:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --space-md: 1rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #121212;
    --color-text: #eeeeee;
  }
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  padding: var(--space-md, 16px); /* giá trị dự phòng */
}`
        }
      }
    ],
    summary: [
      "Box model gồm content, padding, border, margin; dùng `box-sizing: border-box` cho dễ tính.",
      "Cascade xét độ quan trọng, layer, specificity rồi mới đến thứ tự.",
      "Specificity so sánh theo (id, class, thẻ) từ trái sang phải.",
      "CSS variables sống lúc runtime, kế thừa theo DOM, rất hợp để làm theme."
    ],
    pitfalls: [
      "Lạm dụng `!important` để thắng specificity khiến CSS ngày càng khó sửa. Hãy giảm specificity (dùng class đơn) thay vì tăng lên.",
      "Style bằng id (`#header`) có specificity rất cao, về sau khó ghi đè. Ưu tiên class.",
      "Quên margin collapsing rồi thắc mắc vì sao khoảng cách nhỏ hơn mong đợi. Dùng `gap` trong flex/grid để kiểm soát khoảng cách."
    ],
    quiz: [
      { q: "Với `box-sizing: border-box`, `width: 200px; padding: 10px; border: 2px` thì hộp rộng bao nhiêu?", options: ["200px", "224px", "220px", "212px"], answer: 0, explain: "border-box tính cả padding và border vào width, nên hộp rộng đúng 200px. 224px là kết quả của content-box." },
      { q: "Selector nào có specificity cao nhất?", options: [".nav .item a", "#menu a", "ul li a.active", "a:hover"], answer: 1, explain: "#menu a là (1,0,1), có một id nên thắng mọi selector không có id: .nav .item a là (0,2,1), ul li a.active là (0,1,3), a:hover là (0,1,1)." },
      { q: "Điểm khác cơ bản giữa CSS variable và biến Sass là gì?", options: ["CSS variable chỉ dùng được cho giá trị màu", "CSS variable tồn tại lúc runtime, kế thừa theo DOM", "Biến Sass đổi được bằng JavaScript sau khi tải", "Biến Sass kế thừa theo cây DOM như CSS variable"], answer: 1, explain: "Biến Sass bị thay bằng giá trị cố định lúc build. CSS variable tồn tại trong trình duyệt, có thể đổi theo media query, class cha hay JavaScript." }
    ]
  },
  "p02.m0.t2": {
    videos: [
      { id: "G19jZzK5FWI", title: "Học Flexbox CSS qua ví dụ | Flexbox CSS | Flexbox layout | Flexbox example | Flexbox trong CSS", channel: "F8 Official", lang: "vi", minutes: 35, embed: true },
      { id: "hJHQVpv6-Z8", title: "CSS Grid trong 30 phút (2022)", channel: "Holetex", lang: "vi", minutes: 28, embed: true }
    ],
    sections: [
      {
        h: "Flexbox: bố cục một chiều",
        p: [
          "Flexbox sắp xếp các phần tử con theo một trục chính (main axis), ngang theo mặc định (`flex-direction: row`). `justify-content` căn theo trục chính, `align-items` căn theo trục phụ. `gap` tạo khoảng cách giữa các phần tử mà không cần margin.",
          "Thuộc tính `flex: 1` trên phần tử con là viết tắt của `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`, nghĩa là chia đều phần không gian còn trống. Flex rất hợp cho thanh điều hướng, nhóm nút, căn giữa một phần tử, hoặc hàng thẻ có số lượng thay đổi."
        ],
        code: {
          lang: "css", file: "navbar.css",
          src: `.navbar {
  display: flex;
  align-items: center;         /* căn giữa theo chiều dọc */
  justify-content: space-between;
  gap: 1rem;
}

.navbar .search {
  flex: 1;                     /* chiếm hết phần còn lại */
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`
        }
      },
      {
        h: "Grid: bố cục hai chiều",
        p: [
          "Grid điều khiển cùng lúc hàng và cột. Bạn định nghĩa khung trên container bằng `grid-template-columns` và `grid-template-rows`, rồi đặt phần tử vào ô. Đơn vị `fr` chia phần không gian còn lại theo tỉ lệ.",
          "`grid-template-areas` cho phép vẽ layout bằng tên vùng, rất dễ đọc với bố cục trang có header, sidebar, main, footer. Kết hợp `repeat(auto-fill, minmax(240px, 1fr))` bạn có lưới thẻ tự xuống dòng mà không cần media query."
        ],
        code: {
          lang: "css", file: "layout.css",
          src: `.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}`
        }
      },
      {
        h: "Chọn Flex hay Grid?",
        p: [
          "Một quy tắc dễ nhớ: nội dung quyết định kích thước thì dùng Flex; khung quyết định vị trí nội dung thì dùng Grid. Thực tế hai thứ thường lồng nhau: Grid cho khung trang, Flex cho từng thành phần bên trong như header hay card footer."
        ],
        list: [
          "Thanh công cụ, nhóm nút, căn giữa: Flex.",
          "Layout trang, dashboard, gallery cần các cột thẳng hàng: Grid.",
          "Cả hai đều hỗ trợ `gap`, nên hạn chế dùng margin để tạo khoảng cách giữa các phần tử con."
        ]
      }
    ],
    summary: [
      "Flexbox dành cho bố cục một chiều, căn chỉnh theo trục chính và trục phụ.",
      "Grid dành cho bố cục hai chiều với hàng, cột, `fr` và `grid-template-areas`.",
      "`repeat(auto-fill, minmax(...))` tạo lưới responsive không cần media query.",
      "Thực tế thường kết hợp: Grid cho khung, Flex cho thành phần."
    ],
    pitfalls: [
      "Nhầm `justify-content` và `align-items` khi đổi `flex-direction: column`: trục chính đổi thành chiều dọc. Hãy nghĩ theo trục chứ không theo ngang/dọc.",
      "Phần tử flex không co lại được vì nội dung dài (ví dụ URL) do `min-width: auto`. Thêm `min-width: 0` cho phần tử con.",
      "Dùng Flex với `flex-wrap` để giả lập lưới rồi hàng cuối bị kéo giãn lệch. Lưới đều cột thì dùng Grid."
    ],
    quiz: [
      { q: "Layout nào phù hợp với Grid hơn Flex?", options: ["Nhóm 3 nút trên một hàng", "Căn giữa một spinner", "Dashboard có header, sidebar, nội dung, footer", "Thanh menu ngang"], answer: 2, explain: "Dashboard cần kiểm soát cả hàng và cột nên hợp với Grid. Các lựa chọn còn lại là bố cục một chiều, Flex làm gọn hơn." },
      { q: "`flex: 1` trên phần tử con có tác dụng gì?", options: ["Phần tử có chiều rộng cố định đúng 1px", "Chia đều không gian trống với phần tử cùng flex: 1", "Phần tử luôn được đẩy lên đầu hàng", "Phần tử giữ nguyên kích thước, không co lại"], answer: 1, explain: "flex: 1 đặt flex-grow bằng 1 và flex-basis bằng 0, nên các phần tử chia đều không gian còn lại. Nó vẫn cho phép co lại vì flex-shrink bằng 1." },
      { q: "`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` làm gì?", options: ["Tạo đúng 200 cột có độ rộng bằng nhau", "Tạo số cột tối đa vừa khung, mỗi cột ≥ 200px", "Tạo một cột duy nhất rộng đúng 200px", "Chỉ tạo lưới khi màn hình hẹp hơn 200px"], answer: 1, explain: "auto-fill tạo số cột tối đa vừa container, minmax đảm bảo mỗi cột ít nhất 200px và chia đều phần dư bằng 1fr. Kết quả là lưới tự xuống dòng theo độ rộng." }
    ]
  },
  "p02.m0.t3": {
    videos: [
      { id: "x4u1yp3Msao", title: "A practical guide to responsive web design", channel: "Kevin Powell", lang: "en", minutes: 23, embed: true }
    ],
    sections: [
      {
        h: "Mobile-first là gì và vì sao",
        p: [
          "Mobile-first nghĩa là viết CSS mặc định cho màn hình nhỏ, rồi dùng `@media (min-width: ...)` để bổ sung cho màn hình lớn hơn. Cách này buộc bạn ưu tiên nội dung quan trọng, và CSS cho mobile thường đơn giản hơn (một cột), nên phần mở rộng cho desktop là cộng thêm chứ không phải ghi đè ngược.",
          "Đừng quên thẻ meta viewport trong `head`. Thiếu nó, trình duyệt di động sẽ giả lập màn hình rộng khoảng 980px rồi thu nhỏ trang, làm media query của bạn không hoạt động như mong đợi."
        ],
        code: {
          lang: "css", file: "responsive.css",
          src: `/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;          /* mobile: 1 cột */
}

@media (min-width: 48rem) {            /* ~768px */
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 64rem) {            /* ~1024px */
  .grid { grid-template-columns: repeat(3, 1fr); }
}`
        }
      },
      {
        h: "Đơn vị tương đối và clamp()",
        p: [
          "`rem` tính theo cỡ chữ của phần tử gốc `html` (thường 16px). Khi người dùng tăng cỡ chữ mặc định trong trình duyệt, mọi thứ dùng rem sẽ lớn theo, tốt cho accessibility. `em` tính theo cỡ chữ của chính phần tử hoặc phần tử cha, dễ bị nhân dồn khi lồng nhau. `vw` và `vh` là phần trăm kích thước viewport.",
          "Hàm `clamp(min, preferred, max)` giới hạn một giá trị trong khoảng. Với typography, `clamp(1.5rem, 1rem + 2vw, 2.5rem)` cho tiêu đề co giãn mượt theo màn hình nhưng không quá nhỏ hay quá lớn. Nên cộng thêm một phần rem vào vw để chữ vẫn phóng to được khi người dùng zoom."
        ],
        code: {
          lang: "css", file: "typography.css",
          src: `h1 {
  font-size: clamp(1.75rem, 1rem + 3vw, 3rem);
}

.container {
  width: min(100% - 2rem, 72rem); /* luôn chừa 1rem mỗi bên, tối đa 72rem */
  margin-inline: auto;
}`
        }
      },
      {
        h: "Ảnh responsive",
        p: [
          "Ảnh thường là tài nguyên nặng nhất trên trang. Thuộc tính `srcset` kèm `sizes` cho trình duyệt tự chọn file phù hợp với độ rộng hiển thị và mật độ điểm ảnh, nên điện thoại không phải tải ảnh 2000px. Luôn khai báo `width` và `height` để trình duyệt giữ chỗ trước, tránh nhảy layout (CLS)."
        ],
        code: {
          lang: "html", file: "hero.html",
          src: `<img
  src="/img/hero-800.jpg"
  srcset="/img/hero-400.jpg 400w, /img/hero-800.jpg 800w, /img/hero-1600.jpg 1600w"
  sizes="(min-width: 64rem) 50vw, 100vw"
  width="1600" height="900"
  alt="Lập trình viên đang làm việc"
  loading="lazy"
/>`
        }
      }
    ],
    summary: [
      "Viết CSS cho mobile trước, mở rộng bằng `min-width` media query.",
      "Cần thẻ meta viewport để media query hoạt động đúng trên điện thoại.",
      "Ưu tiên `rem` cho cỡ chữ và khoảng cách; `clamp()` cho giá trị co giãn có giới hạn.",
      "Ảnh dùng `srcset`/`sizes`, khai báo width/height để tránh CLS."
    ],
    pitfalls: [
      "Đặt `font-size` chỉ bằng `vw` khiến chữ không phóng to khi người dùng zoom. Kết hợp rem trong `clamp()`.",
      "Dùng `loading=\"lazy\"` cho ảnh hero ở màn hình đầu tiên làm LCP chậm đi. Chỉ lazy ảnh nằm dưới màn hình đầu.",
      "Đặt breakpoint theo từng thiết bị cụ thể (iPhone X, iPad...) thay vì theo điểm nội dung bị vỡ. Hãy chọn breakpoint theo nội dung."
    ],
    quiz: [
      { q: "Trong mobile-first, media query thường dùng điều kiện nào?", options: ["max-width", "min-width", "orientation", "hover"], answer: 1, explain: "Style mặc định cho mobile, sau đó min-width bổ sung khi màn hình rộng hơn. max-width là cách tiếp cận desktop-first." },
      { q: "`clamp(1rem, 2vw, 2rem)` trả về gì khi 2vw bằng 40px và 1rem = 16px?", options: ["16px", "40px", "32px", "56px"], answer: 2, explain: "Giá trị ưu tiên 40px vượt mức tối đa 2rem = 32px nên bị giới hạn về 32px." },
      { q: "Vì sao cần khai báo width và height cho thẻ img?", options: ["Để trình duyệt tải ảnh nhanh hơn", "Để giữ chỗ đúng tỉ lệ, tránh layout shift", "Để ảnh không co giãn theo màn hình", "Để công cụ tìm kiếm xếp hạng cao hơn"], answer: 1, explain: "Trình duyệt dùng width/height để tính aspect-ratio và giữ chỗ trước, giảm CLS. Ảnh vẫn co giãn được bằng CSS như max-width: 100% và height: auto." }
    ]
  },
  "p02.m0.t4": {
    videos: [
      { id: "6biMWgD6_JY", title: "Tailwind CSS v4 Full Course 2026 | Master Tailwind in One Hour", channel: "JavaScript Mastery", lang: "en", minutes: 54, embed: true }
    ],
    sections: [
      {
        h: "Utility-first là gì",
        p: [
          "Tailwind CSS cung cấp các class nhỏ, mỗi class làm một việc: `flex`, `p-4`, `text-sm`, `bg-blue-600`. Bạn ghép chúng ngay trong markup thay vì tự đặt tên class và viết file CSS riêng. Lúc build, Tailwind quét mã nguồn và chỉ sinh CSS cho các class thực sự được dùng, nên file CSS cuối cùng nhỏ.",
          "Lợi ích: không phải nghĩ tên class, không lo CSS chết, sửa giao diện tại chỗ, và mọi giá trị đi theo một hệ thống thiết kế nhất quán (thang spacing, màu). Đánh đổi: markup dài hơn, và cần làm quen với tên class. Các biến thể như `hover:`, `focus-visible:`, `md:`, `dark:` giúp viết trạng thái và responsive ngay trên phần tử."
        ],
        code: {
          lang: "tsx", file: "src/components/Card.tsx",
          src: `export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-gray-200 p-4 shadow-sm md:p-6 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{children}</div>
    </article>
  );
}`
        }
      },
      {
        h: "Cấu hình theme",
        p: [
          "Từ Tailwind v4, cấu hình theme chủ yếu viết trực tiếp trong CSS bằng `@import \"tailwindcss\"` và khối `@theme`. Mỗi biến theme như `--color-brand-500` sẽ sinh ra các class tương ứng (`bg-brand-500`, `text-brand-500`) và đồng thời là CSS variable dùng được ở mọi nơi. Ở v3 trở về trước, bạn cấu hình trong `tailwind.config.js` với khóa `theme.extend`.",
          "Hãy định nghĩa màu thương hiệu, font và breakpoint trong theme thay vì dùng giá trị tùy ý như `bg-[#1d4ed8]` rải rác khắp nơi."
        ],
        code: {
          lang: "css", file: "src/app.css",
          src: `@import "tailwindcss";

@theme {
  --color-brand-500: oklch(0.62 0.19 259);
  --color-brand-600: oklch(0.55 0.2 262);
  --font-sans: "Inter", system-ui, sans-serif;
}`
        }
      },
      {
        h: "Tái sử dụng bằng component, không phải @apply",
        p: [
          "Khi một nhóm class lặp lại, phản xạ tự nhiên là gom vào `@apply` trong CSS. Làm vậy tràn lan sẽ đưa bạn quay lại vấn đề cũ: đặt tên class, file CSS lớn dần, khó biết style ở đâu. Trong React, cách tái sử dụng tốt hơn là tạo component. Một component `Button` với prop `variant` giữ toàn bộ class ở một chỗ.",
          "`@apply` vẫn có chỗ dùng hợp lý, ví dụ style cho HTML sinh ra từ Markdown mà bạn không kiểm soát được class."
        ],
        code: {
          lang: "tsx", file: "src/components/Button.tsx",
          src: `const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-500",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
} as const;

type Props = React.ComponentProps<"button"> & { variant?: keyof typeof variants };

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={\`rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-2 \${variants[variant]} \${className}\`}
      {...props}
    />
  );
}`
        }
      }
    ],
    summary: [
      "Tailwind ghép các utility class nhỏ, chỉ sinh CSS cho class được dùng.",
      "Biến thể `hover:`, `md:`, `dark:` xử lý trạng thái và responsive ngay trên phần tử.",
      "Định nghĩa màu, font trong theme (khối `@theme` ở v4) thay vì giá trị tùy ý.",
      "Tái sử dụng bằng React component; hạn chế `@apply`."
    ],
    pitfalls: [
      "Ghép tên class động như `bg-${color}-500`: Tailwind quét mã tĩnh nên không thấy class đầy đủ và không sinh CSS. Hãy dùng bảng ánh xạ chứa tên class đầy đủ.",
      "Lạm dụng giá trị tùy ý `w-[347px]` làm mất tính nhất quán của thiết kế. Thêm giá trị vào theme nếu cần dùng lại.",
      "Khi ghép `className` từ ngoài vào, hai class xung đột (ví dụ `p-2` và `p-4`) không đảm bảo class nào thắng theo thứ tự bạn viết. Dùng thư viện như tailwind-merge để xử lý."
    ],
    quiz: [
      { q: "Vì sao file CSS build ra từ Tailwind thường nhỏ?", options: ["Tailwind tự nén CSS bằng gzip khi build", "Tailwind chỉ sinh CSS cho class thấy trong mã", "Tailwind thay CSS bằng inline style lúc chạy", "Tailwind tải phần CSS còn thiếu từ CDN"], answer: 1, explain: "Tailwind quét file nguồn tìm tên class và chỉ sinh các quy tắc tương ứng. Nén gzip là việc của server, không phải lý do chính." },
      { q: "Cách tái sử dụng style được khuyến nghị trong dự án React dùng Tailwind là gì?", options: ["Gom mọi nhóm class lặp lại vào @apply", "Tạo component React đóng gói các class", "Chuyển toàn bộ style sang inline style", "Copy nguyên nhóm class sang mọi nơi dùng"], answer: 1, explain: "Component giữ markup và class ở một chỗ, dễ đổi và có thể nhận prop biến thể. @apply tràn lan tái tạo lại vấn đề của CSS truyền thống." },
      { q: "Vì sao `className={\"text-\" + color + \"-600\"}` có thể không có style?", options: ["React không cho nối chuỗi trong className", "Tailwind quét tĩnh, không thấy tên class đầy đủ", "Tên màu trong Tailwind phải viết hoa", "Class ghép động cần thêm !important"], answer: 1, explain: "Tailwind không chạy code của bạn; nó tìm chuỗi class hoàn chỉnh trong file. Tên được ghép lúc runtime sẽ không được sinh CSS." }
    ]
  },
  "p02.m1.t0": {
    videos: [
      { id: "AA3WWZAMv_0", title: "DOM events", channel: "F8 Official", lang: "en", minutes: 27, embed: true },
      { id: "cOoP8-NPLSo", title: "Learn Event Delegation In 10 Minutes", channel: "Web Dev Simplified", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "DOM là gì",
        p: [
          "DOM (Document Object Model) là cây đối tượng mà trình duyệt dựng từ HTML. Mỗi thẻ thành một node, và JavaScript có thể đọc, sửa, thêm, xóa node để thay đổi giao diện. React, Vue hay Svelte rốt cuộc cũng thao tác DOM, chỉ là chúng làm hộ bạn và tối ưu số lần cập nhật.",
          "Truy vấn phần tử bằng `document.querySelector` (lấy phần tử đầu tiên khớp selector CSS) và `querySelectorAll` (trả về NodeList tĩnh). Tạo phần tử bằng `document.createElement`, gán nội dung bằng `textContent` và gắn vào cây bằng `append`. Ưu tiên `textContent` hơn `innerHTML` khi hiển thị dữ liệu người dùng, vì `innerHTML` phân tích chuỗi thành HTML và mở đường cho XSS."
        ],
        code: {
          lang: "javascript", file: "todo.js",
          src: `const list = document.querySelector("#todo-list");
const form = document.querySelector("#todo-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();                 // chặn tải lại trang
  const input = form.elements.namedItem("title");
  const li = document.createElement("li");
  li.textContent = input.value;           // an toàn, không phân tích HTML
  li.dataset.id = crypto.randomUUID();
  list.append(li);
  input.value = "";
});`
        }
      },
      {
        h: "Luồng sự kiện: capturing và bubbling",
        p: [
          "Khi bạn click vào một phần tử, sự kiện đi qua 3 pha. Pha capturing đi từ `window` xuống dần tới phần tử đích. Pha target xảy ra tại chính phần tử đó. Pha bubbling đi ngược từ phần tử đích lên `window`. Mặc định `addEventListener` lắng nghe ở pha bubbling; truyền `{ capture: true }` để nghe ở pha capturing.",
          "`event.target` là phần tử thực sự bị click, còn `event.currentTarget` là phần tử đang gắn listener. `stopPropagation()` dừng sự kiện lan tiếp, `preventDefault()` hủy hành vi mặc định (gửi form, mở link). Hai hàm này làm hai việc khác nhau."
        ]
      },
      {
        h: "Event delegation",
        p: [
          "Thay vì gắn listener cho từng nút trong danh sách 1000 dòng, bạn gắn một listener lên phần tử cha và dựa vào bubbling để biết phần tử con nào được click. Cách này tiết kiệm bộ nhớ và tự động áp dụng cho phần tử thêm sau này. Hàm `closest()` giúp tìm phần tử tổ tiên khớp selector, kể cả khi người dùng click vào icon bên trong nút."
        ],
        code: {
          lang: "javascript", file: "delegation.js",
          src: `list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='delete']");
  if (!button || !list.contains(button)) return;
  const item = button.closest("li");
  item.remove();
});`
        },
        list: [
          "Một số sự kiện như `focus`, `blur` không bubble; dùng `focusin`, `focusout` nếu cần delegation.",
          "Nhớ gỡ listener bằng `removeEventListener` hoặc `AbortController` (`{ signal }`) khi không còn dùng."
        ]
      }
    ],
    summary: [
      "DOM là cây node mà JavaScript thao tác để đổi giao diện.",
      "Dùng `textContent` để hiển thị dữ liệu người dùng, tránh `innerHTML` gây XSS.",
      "Sự kiện đi qua capturing, target, bubbling; mặc định listener nghe ở bubbling.",
      "Event delegation gắn một listener ở cha, dùng `closest()` để xác định phần tử con."
    ],
    pitfalls: [
      "Nhầm `event.target` với `event.currentTarget` khi click trúng phần tử con như icon. Dùng `closest()` để tìm đúng phần tử.",
      "Gọi `stopPropagation()` tùy tiện làm hỏng các listener ở cấp cao hơn (ví dụ analytics, đóng dropdown khi click ra ngoài).",
      "Gán `innerHTML` với dữ liệu từ API hay input người dùng dẫn tới XSS. Dùng `textContent` hoặc sanitize."
    ],
    quiz: [
      { q: "Mặc định `addEventListener(\"click\", fn)` lắng nghe ở pha nào?", options: ["Capturing", "Bubbling", "Chỉ pha target", "Cả hai pha"], answer: 1, explain: "Mặc định capture là false nên listener chạy ở pha bubbling (và tại target). Muốn nghe capturing phải truyền { capture: true }." },
      { q: "Lợi ích chính của event delegation là gì?", options: ["Sự kiện được trình duyệt xử lý nhanh hơn", "Một listener ở cha xử lý cả phần tử con thêm sau", "Không cần dùng đến event object nữa", "Tự chặn mọi hành vi mặc định của trình duyệt"], answer: 1, explain: "Nhờ bubbling, listener ở cha nhận sự kiện từ mọi con, kể cả con mới thêm, và ít listener hơn nên tiết kiệm bộ nhớ." },
      { q: "`preventDefault()` khác `stopPropagation()` thế nào?", options: ["Hai hàm giống nhau, chỉ khác tên gọi", "preventDefault hủy hành vi mặc định; stopPropagation chặn lan truyền", "preventDefault chặn bubbling; stopPropagation hủy gửi form", "stopPropagation hủy hành vi mặc định; preventDefault chặn lan truyền"], answer: 1, explain: "Hai hàm độc lập: một cái hủy hành vi của trình duyệt như gửi form, cái kia chặn sự kiện lan lên cha. Bạn có thể dùng một hoặc cả hai." }
    ]
  },
  "p02.m1.t1": {
    videos: [
      { id: "iYgAWJ2Djkw", title: "62. CORS đâu có lỗi lầm gì? | Rất nhiều bạn đang hiểu nhầm về CORS | NodeJS + MongoDB | TrungQuanDev", channel: "TrungQuanDev - Một Lập Trình Viên", lang: "vi", minutes: 28, embed: true },
      { id: "BeZfiCPhZbI", title: "I Cannot Believe Abort Controller Can Do This", channel: "Web Dev Simplified", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "fetch và xử lý lỗi HTTP",
        p: [
          "`fetch` là API chuẩn để gọi HTTP, trả về Promise của một `Response`. Điểm hay gây nhầm: Promise chỉ bị reject khi lỗi mạng (mất kết nối, DNS lỗi, bị CORS chặn). Nếu server trả 404 hay 500, Promise vẫn resolve bình thường. Bạn phải tự kiểm tra `response.ok` (true khi status 200–299).",
          "Hãy gói fetch trong một hàm dùng chung để kiểm tra status, parse JSON và ném lỗi có thông tin. Như vậy mọi nơi trong ứng dụng xử lý lỗi thống nhất."
        ],
        code: {
          lang: "typescript", file: "src/lib/http.ts",
          src: `export class HttpError extends Error {
  constructor(public status: number, public body: unknown) {
    super(\`HTTP \${status}\`);
  }
}

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new HttpError(res.status, body);
  }
  return res.json() as Promise<T>;
}`
        }
      },
      {
        h: "Hủy request với AbortController và retry",
        p: [
          "`AbortController` cho phép hủy request đang chạy, ví dụ khi người dùng rời trang hoặc gõ ô tìm kiếm liên tục. Truyền `signal` vào fetch; khi gọi `abort()`, fetch reject với lỗi (DOMException) tên `AbortError`. `AbortSignal.timeout(ms)` tạo sẵn signal tự hủy sau thời gian chờ; khi hết giờ, fetch reject với lỗi tên `TimeoutError` (không phải `AbortError`), nên code xử lý lỗi cần phân biệt cả hai tên.",
          "Retry chỉ nên áp dụng cho lỗi tạm thời: lỗi mạng, 502, 503, 504, hoặc 429 (Too Many Requests; nếu server gửi header `Retry-After` thì chờ đúng khoảng đó). Không retry các lỗi 4xx khác như 400, 401, 404 vì gửi lại cũng vậy. Giữa các lần thử dùng exponential backoff (chờ 200ms, 400ms, 800ms...) để không dội thêm tải lên server đang quá tải. Chỉ retry tự động với request idempotent như GET."
        ],
        code: {
          lang: "typescript", file: "src/lib/retry.ts",
          src: `const RETRYABLE = new Set([429, 502, 503, 504]);

export async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!RETRYABLE.has(res.status) || attempt >= retries) return res;
    } catch (err) {
      if (attempt >= retries) throw err;
    }
    await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
  }
}`
        }
      },
      {
        h: "CORS xuất phát từ đâu",
        p: [
          "Trình duyệt áp dụng Same-Origin Policy: script ở `https://app.example.com` không được đọc response từ origin khác (khác scheme, host hoặc port) trừ khi server đích cho phép. CORS là cơ chế để server cho phép, qua header `Access-Control-Allow-Origin`. Với request không đơn giản (ví dụ có header `Authorization` hoặc `Content-Type: application/json`), trình duyệt gửi trước một request `OPTIONS` gọi là preflight.",
          "Điều quan trọng: CORS là chính sách của trình duyệt, không phải của server. Cùng request đó gọi bằng curl hay Postman vẫn chạy. Vì vậy lỗi CORS phải sửa ở phía server (cấu hình header), không sửa được bằng code frontend. Trong môi trường dev, có thể dùng proxy của Vite hoặc Next.js để gọi cùng origin."
        ]
      }
    ],
    summary: [
      "fetch không reject khi gặp 4xx/5xx; luôn kiểm tra `response.ok`.",
      "Dùng `AbortController` hoặc `AbortSignal.timeout` để hủy và đặt timeout.",
      "Chỉ retry lỗi tạm thời, với exponential backoff, cho request idempotent.",
      "CORS do trình duyệt thực thi; sửa bằng header phía server."
    ],
    pitfalls: [
      "Gọi `res.json()` mà không kiểm tra `res.ok` rồi hiển thị dữ liệu lỗi như dữ liệu thật. Kiểm tra status trước.",
      "Retry cả request POST tạo đơn hàng dẫn tới tạo trùng. Chỉ retry request idempotent hoặc dùng idempotency key.",
      "Đặt `Access-Control-Allow-Origin: *` cùng với credentials: trình duyệt sẽ từ chối. Khi gửi cookie phải chỉ định origin cụ thể."
    ],
    quiz: [
      { q: "Server trả về 500, Promise của fetch sẽ thế nào?", options: ["Reject với một lỗi HTTP 500", "Resolve với response có ok = false", "Treo cho tới khi hết timeout", "Tự retry rồi reject nếu vẫn lỗi"], answer: 1, explain: "fetch chỉ reject khi lỗi mạng hoặc bị hủy. Response 500 vẫn là response hợp lệ, bạn phải tự kiểm tra ok hoặc status." },
      { q: "Lỗi nào không nên retry?", options: ["503 Service Unavailable", "Lỗi mạng tạm thời", "400 Bad Request", "504 Gateway Timeout"], answer: 2, explain: "400 nghĩa là request sai; gửi lại y hệt vẫn sai. 503, 504 và lỗi mạng thường là tạm thời nên retry có ý nghĩa." },
      { q: "Vì sao cùng một API, gọi bằng curl chạy được nhưng từ trình duyệt bị lỗi CORS?", options: ["curl dùng HTTP/3 nên bỏ qua CORS", "CORS do trình duyệt thực thi, curl không áp dụng", "Server nhận diện và chặn riêng trình duyệt", "Trình duyệt không đọc được JSON từ API"], answer: 1, explain: "Same-Origin Policy và CORS nằm trong trình duyệt để bảo vệ người dùng. Công cụ như curl không áp chính sách này." }
    ]
  },
  "p02.m1.t2": {
    videos: [
      { id: "DfQJjR2PISQ", title: "Lưu access token ở local storage hay Cookies? | Ông Dev | Techlog", channel: "Ông Dev", lang: "vi", minutes: 7, embed: true },
      { id: "YLRTSVetPQ0", title: "Cookies vs Local Storage vs Session Storage", channel: "Holetex", lang: "en", minutes: 20, embed: true }
    ],
    sections: [
      {
        h: "Bốn lựa chọn lưu trữ",
        p: [
          "Trình duyệt có nhiều nơi lưu dữ liệu, mỗi nơi có đặc điểm riêng. Chọn sai có thể gây lỗi bảo mật hoặc hiệu năng.",
          "Cookie được gửi tự động kèm mọi request tới domain tương ứng, dung lượng nhỏ (khoảng 4KB mỗi cookie). `localStorage` lưu chuỗi key-value, tồn tại đến khi bị xóa, chia sẻ giữa các tab cùng origin. `sessionStorage` giống vậy nhưng chỉ sống trong một tab và mất khi đóng tab. IndexedDB là cơ sở dữ liệu bất đồng bộ, lưu được object, Blob và dữ liệu lớn, dùng cho ứng dụng offline."
        ],
        list: [
          "Cookie: phiên đăng nhập, được server đặt qua header `Set-Cookie`.",
          "localStorage: tùy chọn giao diện như theme, ngôn ngữ.",
          "sessionStorage: trạng thái tạm của một tab, ví dụ bước đang dở của form nhiều bước.",
          "IndexedDB: cache dữ liệu lớn, hàng đợi thao tác offline."
        ]
      },
      {
        h: "Vì sao không lưu token nhạy cảm ở localStorage",
        p: [
          "Mọi JavaScript chạy trên trang đều đọc được `localStorage`, gồm cả script của bên thứ ba và script bị chèn qua lỗ hổng XSS. Nếu access token hoặc refresh token nằm ở đó, kẻ tấn công chỉ cần một dòng code là lấy được và dùng từ máy khác.",
          "Cookie có cờ `HttpOnly` thì JavaScript không đọc được, nên XSS không trực tiếp đánh cắp được token. Kết hợp `Secure` (chỉ gửi qua HTTPS) và `SameSite=Lax` hoặc `Strict` (hạn chế gửi kèm request từ site khác) để giảm nguy cơ CSRF. XSS vẫn có thể gửi request thay người dùng khi họ đang mở trang, nên phòng XSS vẫn là việc chính; HttpOnly chỉ giảm thiệt hại."
        ],
        code: {
          lang: "typescript", file: "src/auth/login.controller.ts",
          src: `// Server (Express/NestJS) đặt cookie phiên sau khi đăng nhập
res.cookie("session", sessionId, {
  httpOnly: true,     // JS phía client không đọc được
  secure: true,       // chỉ gửi qua HTTPS
  sameSite: "lax",    // hạn chế gửi kèm request cross-site
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
});`
        }
      },
      {
        h: "Dùng localStorage đúng cách",
        p: [
          "`localStorage` là API đồng bộ, chặn main thread khi đọc ghi, nên chỉ hợp với dữ liệu nhỏ. Nó chỉ lưu chuỗi, vì vậy phải `JSON.stringify` và `JSON.parse`. Luôn bọc trong try/catch vì có thể bị chặn (chế độ riêng tư, hết dung lượng) hoặc dữ liệu cũ không parse được."
        ],
        code: {
          lang: "typescript", file: "src/lib/prefs.ts",
          src: `type Prefs = { theme: "light" | "dark"; lang: string };

export function loadPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem("prefs");
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem("prefs", JSON.stringify(p));
  } catch {
    /* bỏ qua: không lưu được cũng không làm hỏng ứng dụng */
  }
}`
        }
      }
    ],
    summary: [
      "Cookie gửi kèm request; localStorage bền; sessionStorage theo tab; IndexedDB cho dữ liệu lớn.",
      "Mọi script trên trang đọc được localStorage, nên không lưu token nhạy cảm ở đó.",
      "Dùng cookie `HttpOnly`, `Secure`, `SameSite` cho phiên đăng nhập.",
      "localStorage là API đồng bộ, chỉ lưu chuỗi; bọc try/catch khi dùng."
    ],
    pitfalls: [
      "Lưu JWT dài hạn ở localStorage: một lỗi XSS là mất tài khoản. Dùng cookie HttpOnly hoặc giữ access token ngắn hạn trong bộ nhớ.",
      "Lưu dữ liệu lớn vào localStorage làm giật giao diện vì API đồng bộ. Dùng IndexedDB cho dữ liệu lớn.",
      "Nghĩ rằng cookie HttpOnly miễn nhiễm mọi tấn công. Vẫn cần phòng XSS và CSRF (SameSite, CSRF token)."
    ],
    quiz: [
      { q: "Cờ nào khiến JavaScript phía client không đọc được cookie?", options: ["Secure", "SameSite", "HttpOnly", "Domain"], answer: 2, explain: "HttpOnly ẩn cookie khỏi document.cookie. Secure chỉ giới hạn gửi qua HTTPS, SameSite kiểm soát gửi kèm request cross-site." },
      { q: "Dữ liệu nào hợp để lưu ở sessionStorage?", options: ["Refresh token dùng để gia hạn phiên", "Bước đang làm dở của form nhiều bước", "Ảnh dung lượng lớn để xem offline", "Cài đặt theme dùng lâu dài giữa các lần mở"], answer: 1, explain: "sessionStorage chỉ sống trong tab hiện tại, hợp với trạng thái tạm. Token không nên nằm ở storage đọc được bằng JS, dữ liệu lớn nên ở IndexedDB, cài đặt lâu dài nên ở localStorage." },
      { q: "Vì sao lưu access token ở localStorage bị coi là rủi ro?", options: ["localStorage bị xóa ngay khi đóng tab", "Mọi script trên trang, kể cả do XSS, đọc được nó", "localStorage tự gửi token tới mọi domain", "localStorage không được HTTPS mã hóa"], answer: 1, explain: "Rủi ro chính là XSS: script độc đọc được token rồi gửi đi. localStorage không tự gửi kèm request và không mất khi đóng tab." }
    ]
  },
  "p02.m1.t3": {
    videos: [
      { id: "KZ1kxzsJZ5g", title: "How to optimize web responsiveness with Interaction to Next Paint", channel: "Chrome for Developers", lang: "en", minutes: 15, embed: true }
    ],
    sections: [
      {
        h: "Core Web Vitals",
        p: [
          "Core Web Vitals là ba chỉ số Google dùng để đo trải nghiệm thực tế của người dùng. LCP (Largest Contentful Paint) đo thời gian phần tử nội dung lớn nhất hiển thị, tốt khi ≤ 2.5 giây. INP (Interaction to Next Paint) đo độ trễ từ lúc người dùng tương tác đến lúc giao diện vẽ lại, tốt khi ≤ 200ms; INP quan sát mọi lần click, chạm, gõ phím trong suốt lượt truy cập và báo cáo gần như lần chậm nhất, và đã thay thế FID (chỉ đo độ trễ của tương tác đầu tiên) từ tháng 3/2024. CLS (Cumulative Layout Shift) đo mức độ nội dung bị xô lệch bất ngờ, tốt khi ≤ 0.1.",
          "Ngưỡng được đánh giá ở phân vị 75 của lượt truy cập thật. Dữ liệu phòng lab (Lighthouse) giúp debug, còn dữ liệu thật (field data, ví dụ Chrome UX Report hoặc thư viện `web-vitals`) mới phản ánh người dùng."
        ],
        code: {
          lang: "typescript", file: "src/vitals.ts",
          src: `import { onCLS, onINP, onLCP } from "web-vitals";

function send(metric: { name: string; value: number; id: string }) {
  navigator.sendBeacon("/api/vitals", JSON.stringify(metric));
}

onLCP(send);
onINP(send);
onCLS(send);`
        }
      },
      {
        h: "Cải thiện từng chỉ số",
        list: [
          "LCP: giảm thời gian phản hồi server, tối ưu ảnh hero (định dạng AVIF/WebP, kích thước đúng), không lazy-load ảnh ở màn hình đầu, có thể thêm `fetchpriority=\"high\"`.",
          "INP: chia nhỏ tác vụ JavaScript dài trên main thread, giảm lượng JS tải về, tránh re-render lớn khi gõ phím, đẩy việc nặng sang Web Worker.",
          "CLS: khai báo kích thước cho ảnh, video, iframe; giữ chỗ cho quảng cáo và nội dung chèn động; dùng `font-display` hợp lý để tránh nhảy chữ."
        ],
        p: [
          "Mỗi chỉ số có nguyên nhân khác nhau, nên hãy đo trước để biết đang yếu ở đâu rồi mới sửa."
        ]
      },
      {
        h: "Lazy loading, code splitting và cache",
        p: [
          "Lazy loading trì hoãn tải tài nguyên chưa cần: ảnh dưới màn hình đầu dùng `loading=\"lazy\"`, component nặng tải khi cần bằng dynamic `import()`. Code splitting chia bundle JavaScript thành nhiều file nhỏ theo route hoặc tính năng, để trang đầu chỉ tải phần cần thiết. Vite và Next.js tự tách theo route.",
          "Cache giúp lần truy cập sau gần như tức thì. Với file tĩnh có hash trong tên (`app.3f9a1c.js`), đặt `Cache-Control: public, max-age=31536000, immutable` vì nội dung đổi thì tên đổi. Với HTML, dùng `no-cache` để trình duyệt luôn kiểm tra phiên bản mới (vẫn dùng ETag để tránh tải lại nếu không đổi)."
        ],
        code: {
          lang: "tsx", file: "src/pages/Report.tsx",
          src: `import { lazy, Suspense } from "react";

// Thư viện biểu đồ nặng chỉ tải khi trang này được mở
const Chart = lazy(() => import("./Chart"));

export default function Report() {
  return (
    <Suspense fallback={<p>Đang tải biểu đồ...</p>}>
      <Chart />
    </Suspense>
  );
}`
        }
      }
    ],
    summary: [
      "Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, xét ở phân vị 75.",
      "INP thay thế FID từ 3/2024 và đo mọi tương tác, không chỉ lần đầu.",
      "Đo bằng dữ liệu thật (web-vitals, CrUX), dùng Lighthouse để debug.",
      "Lazy loading, code splitting và cache bằng tên file có hash giảm tải và tăng tốc."
    ],
    pitfalls: [
      "Chỉ nhìn điểm Lighthouse trên máy mạnh của mình. Hãy đo field data vì người dùng thật có máy và mạng yếu hơn.",
      "Lazy-load ảnh LCP khiến trình duyệt tải nó muộn. Ảnh hero phải tải ngay.",
      "Đặt cache dài hạn cho file không có hash (ví dụ `index.html`), người dùng kẹt ở phiên bản cũ. Chỉ cache immutable cho file có hash."
    ],
    quiz: [
      { q: "Chỉ số nào đo độ phản hồi khi người dùng tương tác?", options: ["LCP", "CLS", "INP", "TTFB"], answer: 2, explain: "INP đo thời gian từ tương tác đến lần vẽ tiếp theo. LCP đo tải nội dung chính, CLS đo độ ổn định layout, TTFB không phải Core Web Vital." },
      { q: "Nguyên nhân phổ biến làm CLS cao là gì?", options: ["Server phản hồi chậm ở request đầu tiên", "Ảnh thiếu kích thước, nội dung chèn không giữ chỗ", "Trang tải quá nhiều file CSS cùng lúc", "Trang dùng HTTPS thay vì HTTP"], answer: 1, explain: "CLS tăng khi nội dung đẩy các phần tử khác lệch đi sau khi đã hiển thị. Khai báo kích thước và giữ chỗ trước sẽ khắc phục." },
      { q: "File `app.3f9a1c.js` nên có Cache-Control thế nào?", options: ["no-store", "no-cache", "public, max-age=31536000, immutable", "private, max-age=0"], answer: 2, explain: "Tên chứa hash nội dung nên khi nội dung đổi, tên file đổi. Vì vậy có thể cache rất lâu và đánh dấu immutable an toàn." }
    ]
  },
  "p02.m2.t0": {
    videos: [
      { id: "TvE2FuYiuXo", title: "Props là gì? | Dùng props khi nào? | Khái niệm Props", channel: "F8 Official", lang: "vi", minutes: 26, embed: true },
      { id: "7jKMAWvlAbY", title: "TẠI SAO không nên dùng Index làm Key trong React???", channel: "Holetex", lang: "vi", minutes: 6, embed: true }
    ],
    sections: [
      {
        h: "Component là hàm trả về UI",
        p: [
          "Trong React, component là một hàm nhận `props` và trả về JSX mô tả giao diện. Bạn chia màn hình thành nhiều component nhỏ, mỗi cái lo một việc, rồi ghép lại. Props là dữ liệu cha truyền xuống con và là chỉ đọc: con không được sửa props. State là dữ liệu component tự sở hữu và có thể thay đổi theo thời gian; mỗi lần state đổi, React render lại component đó.",
          "Hãy nghĩ UI là một hàm của state: `UI = f(state)`. Bạn không tự sửa DOM; bạn đổi state, React tính ra giao diện mới và cập nhật DOM cho bạn."
        ],
        code: {
          lang: "tsx", file: "src/Counter.tsx",
          src: `import { useState } from "react";

type Props = { label: string; step?: number };

export function Counter({ label, step = 1 }: Props) {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + step)}>
      {label}: {count}
    </button>
  );
}`
        }
      },
      {
        h: "Luồng dữ liệu một chiều và lifting state up",
        p: [
          "Dữ liệu trong React chảy một chiều từ cha xuống con qua props. Con muốn báo lên cha thì cha truyền xuống một hàm callback. Nhờ vậy bạn luôn biết dữ liệu đến từ đâu và ai được quyền sửa.",
          "Khi hai component anh em cần dùng chung một state, hãy nâng state đó lên component cha gần nhất (lifting state up). Cha giữ state, truyền giá trị cho con này và hàm cập nhật cho con kia. Chỉ có một nguồn sự thật (single source of truth), tránh hai bản sao lệch nhau."
        ],
        code: {
          lang: "tsx", file: "src/SearchPage.tsx",
          src: `import { useState } from "react";

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} aria-label="Tìm kiếm" />;
}

function ResultList({ query }: { query: string }) {
  const items = ["React", "Node.js", "PostgreSQL"].filter((x) =>
    x.toLowerCase().includes(query.toLowerCase()),
  );
  return <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>;
}

export function SearchPage() {
  const [query, setQuery] = useState("");   // state nâng lên cha
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <ResultList query={query} />
    </>
  );
}`
        }
      },
      {
        h: "key trong danh sách",
        p: [
          "Khi render một mảng, mỗi phần tử cần prop `key` duy nhất và ổn định giữa các lần render. React dùng key để biết phần tử nào được thêm, xóa hay đổi chỗ, từ đó giữ đúng state và DOM của từng phần tử.",
          "Dùng id từ dữ liệu làm key. Dùng index của mảng chỉ an toàn khi danh sách không bao giờ sắp xếp lại, thêm hay xóa ở giữa. Nếu không, state của phần tử (ví dụ nội dung ô input) có thể bị gắn nhầm sang phần tử khác. Ngược lại, đổi key là cách chủ động reset state của một component."
        ]
      }
    ],
    summary: [
      "Component là hàm nhận props (chỉ đọc) và có state riêng.",
      "Dữ liệu chảy một chiều từ cha xuống con; con báo lên qua callback.",
      "State dùng chung giữa anh em thì nâng lên cha gần nhất.",
      "key phải duy nhất và ổn định, ưu tiên id thay vì index."
    ],
    pitfalls: [
      "Sửa trực tiếp props hoặc state (`state.items.push(x)`) khiến React không nhận ra thay đổi. Luôn tạo mảng/object mới.",
      "Dùng index làm key cho danh sách có thể sắp xếp hay xóa, gây lệch state giữa các dòng. Dùng id ổn định.",
      "Sao chép props vào state (`useState(props.value)`) rồi không đồng bộ khi props đổi. Thường chỉ cần dùng thẳng props."
    ],
    quiz: [
      { q: "Hai component anh em cần cùng một giá trị, cách làm chuẩn là gì?", options: ["Mỗi component giữ một bản state riêng", "Nâng state lên cha chung, truyền qua props", "Lưu giá trị vào một biến toàn cục", "Hai component tự sửa props của nhau"], answer: 1, explain: "Lifting state up tạo một nguồn sự thật duy nhất. Hai bản state riêng sẽ lệch nhau, biến toàn cục không kích hoạt render, props thì chỉ đọc." },
      { q: "Vì sao không nên dùng index làm key khi danh sách có thể xóa phần tử ở giữa?", options: ["Index không phải chuỗi nên key không hợp lệ", "React báo lỗi cú pháp khi key là số", "Index phía sau dịch đi, state bị gắn nhầm", "Index làm React gửi thêm request mạng"], answer: 2, explain: "Xóa phần tử làm index phía sau dịch đi, React tưởng phần tử cũ vẫn còn và tái dùng state của nó cho dữ liệu khác." },
      { q: "Điều gì kích hoạt một component render lại?", options: ["Gán lại một biến cục bộ trong hàm", "Gọi hàm set của state với giá trị mới", "Gọi console.log bên trong component", "Sửa DOM thủ công bằng querySelector"], answer: 1, explain: "Gọi setState với giá trị khác (so sánh bằng Object.is) sẽ lên lịch render lại. Biến cục bộ bị tạo lại mỗi lần render và không báo cho React." }
    ]
  },
  "p02.m2.t1": {
    videos: [
      { id: "hjIxfXKmkjk", title: "React useEffect hook chi tiết dành cho người mới | React JS", channel: "F8 Official", lang: "vi", minutes: 25, embed: true },
      { id: "V1f8MOQiHRw", title: "You might not need useEffect() ...", channel: "Academind", lang: "en", minutes: 22, embed: true }
    ],
    sections: [
      {
        h: "useState và useRef",
        p: [
          "`useState` lưu giá trị giữa các lần render và kích hoạt render khi bạn gọi hàm set. Khi giá trị mới phụ thuộc giá trị cũ, dùng dạng hàm `setCount(c => c + 1)` để luôn dựa trên giá trị mới nhất.",
          "`useRef` cũng giữ giá trị qua các lần render, nhưng thay đổi `ref.current` không gây render. Dùng nó để trỏ tới phần tử DOM (focus input), hoặc giữ giá trị không ảnh hưởng giao diện như id của timer."
        ]
      },
      {
        h: "useEffect để đồng bộ với bên ngoài",
        p: [
          "Đừng coi `useEffect` là \"componentDidMount\". Hãy coi nó là cách đồng bộ component với một hệ thống bên ngoài React: kết nối WebSocket, đăng ký sự kiện window, gọi thư viện không phải React. Effect chạy sau khi render được commit, và chạy lại khi một giá trị trong mảng phụ thuộc thay đổi. Hàm cleanup chạy trước lần chạy kế tiếp và khi component unmount.",
          "Nếu bạn chỉ tính một giá trị từ props hay state, không cần effect: tính thẳng trong lúc render. Nếu phản hồi một sự kiện người dùng, xử lý trong event handler. Ở chế độ dev với StrictMode, React cố ý chạy effect, cleanup rồi chạy lại một lần để giúp bạn phát hiện thiếu cleanup."
        ],
        code: {
          lang: "tsx", file: "src/useOnlineStatus.ts",
          src: `import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {                     // cleanup
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}`
        }
      },
      {
        h: "useMemo, useCallback và custom hook",
        p: [
          "`useMemo(fn, deps)` ghi nhớ kết quả tính toán cho tới khi deps đổi. `useCallback(fn, deps)` ghi nhớ chính hàm. Chúng có ích khi phép tính thật sự tốn kém, hoặc khi bạn truyền giá trị cho component đã bọc `memo` hay làm dependency của effect. Dùng khắp nơi chỉ làm code rối mà không nhanh hơn. React Compiler có thể tự động ghi nhớ nếu dự án bật nó.",
          "Custom hook là hàm bắt đầu bằng `use` và gọi các hook khác, giúp tái sử dụng logic có state. Mỗi component gọi hook nhận state riêng, không chia sẻ. Quy tắc của hook: chỉ gọi ở cấp cao nhất của component hoặc custom hook, không gọi trong if, vòng lặp hay hàm lồng."
        ],
        code: {
          lang: "tsx", file: "src/useDebounce.ts",
          src: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`
        }
      }
    ],
    summary: [
      "useState giữ state và gây render; useRef giữ giá trị mà không gây render.",
      "useEffect đồng bộ với hệ thống bên ngoài, luôn có cleanup khi cần.",
      "Không dùng effect để tính dữ liệu dẫn xuất hay xử lý sự kiện người dùng.",
      "useMemo/useCallback chỉ dùng khi có lý do đo được; custom hook tái sử dụng logic."
    ],
    pitfalls: [
      "Thiếu dependency trong mảng deps khiến effect dùng giá trị cũ (stale closure). Bật rule `react-hooks/exhaustive-deps` của ESLint.",
      "Dùng effect để set state dẫn xuất (`useEffect(() => setFull(a + b), [a, b])`) gây render thừa. Tính thẳng trong render.",
      "Gọi hook trong điều kiện if làm lệch thứ tự hook giữa các lần render và gây lỗi."
    ],
    quiz: [
      { q: "Khi nào nên dùng useEffect?", options: ["Để tính tổng tiền từ danh sách sản phẩm", "Để đăng ký và hủy sự kiện resize của window", "Để xử lý click nút gửi form", "Để thay thế mọi phương thức lifecycle của class"], answer: 1, explain: "Effect dùng để đồng bộ với hệ thống bên ngoài như window. Tổng tiền tính trong render, click xử lý trong event handler." },
      { q: "Thay đổi `ref.current` có gây render lại không?", options: ["Có, luôn luôn", "Không", "Chỉ khi là phần tử DOM", "Chỉ trong StrictMode"], answer: 1, explain: "useRef trả về object ổn định; sửa current không báo cho React. Muốn giao diện cập nhật thì phải dùng state." },
      { q: "Vì sao ở chế độ dev effect có vẻ chạy hai lần?", options: ["React có lỗi khiến effect chạy lặp", "StrictMode cố ý chạy setup, cleanup, setup lại", "Bundler nạp module hai lần khi dev", "Trình duyệt render trang hai lần khi dev"], answer: 1, explain: "StrictMode chỉ ở môi trường dev chạy thêm một chu kỳ setup/cleanup. Effect có cleanup đúng sẽ không bị ảnh hưởng. Production không làm vậy." }
    ]
  },
  "p02.m2.t2": {
    videos: [
      { id: "724nBX6jGRQ", title: "React reconciliation: how it works and why should we care", channel: "Developer Way", lang: "en", minutes: 15, embed: true },
      { id: "feEY3Qajrwg", title: "Preventing re-renders with React.memo", channel: "Developer Way", lang: "en", minutes: 12, embed: true }
    ],
    sections: [
      {
        h: "Render và commit",
        p: [
          "Trong React, \"render\" là việc gọi hàm component để lấy ra cây phần tử mới, chưa đụng tới DOM. Sau đó React so sánh cây mới với cây cũ (reconciliation) và chỉ áp những thay đổi cần thiết vào DOM ở pha commit. Vì vậy một component render lại chưa chắc làm DOM thay đổi.",
          "Khi so sánh, React dựa vào hai quy tắc: phần tử khác loại (ví dụ `div` thành `section`, hoặc component A thành component B) thì cây con bị hủy và tạo mới, kèm mất state; phần tử cùng loại thì giữ nguyên và chỉ cập nhật thuộc tính. Với danh sách, `key` giúp ghép đúng phần tử cũ và mới."
        ]
      },
      {
        h: "Khi nào component render lại",
        list: [
          "State của chính nó thay đổi.",
          "Component cha render lại: mặc định mọi con cũng render lại, dù props không đổi.",
          "Context mà nó dùng (`use` hoặc `useContext`) đổi giá trị.",
          "Một hook bên trong (ví dụ store bên ngoài qua `useSyncExternalStore`) báo có thay đổi."
        ],
        p: [
          "Render lại thường rất rẻ. Chỉ khi một component nặng render lại liên tục (ví dụ mỗi lần gõ phím) thì mới đáng tối ưu. Hãy dùng React DevTools Profiler để xem component nào render và tốn bao lâu trước khi sửa."
        ]
      },
      {
        h: "React.memo và cách tránh tối ưu sớm",
        p: [
          "`memo(Component)` bỏ qua render lại nếu props mới bằng props cũ theo so sánh nông (`Object.is` cho từng prop). Nó chỉ hiệu quả khi props thật sự ổn định; nếu cha tạo object hoặc hàm mới mỗi lần render thì memo vô tác dụng, lúc đó mới cần `useMemo`/`useCallback` ở phía cha.",
          "Trước khi dùng memo, thử các cách đơn giản hơn: đưa state xuống gần nơi dùng nó, hoặc truyền phần UI nặng qua `children` để nó không bị render lại khi state của wrapper đổi. Nếu dự án bật React Compiler, phần lớn việc ghi nhớ được làm tự động."
        ],
        code: {
          lang: "tsx", file: "src/ProductList.tsx",
          src: `import { memo, useCallback, useState } from "react";

const Row = memo(function Row({ name, onSelect }: { name: string; onSelect: (n: string) => void }) {
  return <li onClick={() => onSelect(name)}>{name}</li>;
});

export function ProductList({ names }: { names: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const handleSelect = useCallback((n: string) => setSelected(n), []); // hàm ổn định
  return (
    <>
      <p>Đang chọn: {selected ?? "chưa có"}</p>
      <ul>{names.map((n) => <Row key={n} name={n} onSelect={handleSelect} />)}</ul>
    </>
  );
}`
        }
      }
    ],
    summary: [
      "Render là gọi hàm component; commit mới là cập nhật DOM.",
      "Reconciliation so sánh theo loại phần tử và key; khác loại thì tạo lại và mất state.",
      "Cha render thì con render, trừ khi con được bọc memo với props ổn định.",
      "Đo bằng Profiler trước khi tối ưu; ưu tiên đưa state xuống thấp và dùng children."
    ],
    pitfalls: [
      "Bọc memo nhưng truyền `style={{...}}` hay arrow function mới mỗi lần render, khiến memo không có tác dụng.",
      "Khai báo component bên trong component khác: mỗi lần render tạo ra loại component mới, React hủy và mount lại, mất state. Khai báo ở cấp module.",
      "Tối ưu khi chưa đo, làm code phức tạp mà không nhanh hơn. Dùng Profiler trước."
    ],
    quiz: [
      { q: "Component cha render lại, component con không bọc memo sẽ thế nào?", options: ["Không render lại vì props không đổi", "Render lại", "Bị unmount", "Chỉ render khi có key"], answer: 1, explain: "Mặc định React render lại toàn bộ cây con của component vừa render. memo mới cho phép bỏ qua khi props bằng nhau." },
      { q: "Vì sao `memo` có thể không có tác dụng?", options: ["memo chỉ hoạt động với class component", "Cha tạo object hoặc hàm mới mỗi lần render", "memo so sánh sâu nên quá chậm", "Component con có state riêng của nó"], answer: 1, explain: "memo so sánh bằng Object.is từng prop. Object hay hàm tạo mới mỗi lần render luôn khác tham chiếu, nên memo luôn render lại." },
      { q: "Đổi `<div>` bọc ngoài thành `<section>` ảnh hưởng gì tới state của các component con?", options: ["Không ảnh hưởng vì chỉ đổi thẻ bọc", "Cây con bị hủy và mount lại, mất state", "Chỉ đổi CSS, state vẫn được giữ", "React báo lỗi và dừng render"], answer: 1, explain: "Phần tử khác loại khiến React bỏ cây cũ và mount cây mới, nên state của các con bên trong bị mất." }
    ]
  },
  "p02.m2.t3": {
    videos: [
      { id: "cc_xmawJ8Kg", title: "React Hook Form - Complete Tutorial (with Zod)", channel: "Cosden Solutions", lang: "en", minutes: 28, embed: true }
    ],
    sections: [
      {
        h: "Vì sao dùng React Hook Form",
        p: [
          "Form có nhiều trường nếu mỗi ô đều là controlled input bằng `useState` thì mỗi phím gõ làm cả form render lại, và bạn phải tự viết logic lỗi, touched, submit. React Hook Form (RHF) mặc định dùng input không kiểm soát (uncontrolled) và đăng ký qua `register`, nên ít render hơn và code gọn hơn.",
          "RHF quản lý trạng thái lỗi, trạng thái đang gửi (`isSubmitting`) và hỗ trợ resolver để giao việc validate cho thư viện schema như Zod."
        ]
      },
      {
        h: "Zod schema làm nguồn sự thật",
        p: [
          "Zod mô tả dữ liệu bằng schema và suy ra kiểu TypeScript qua `z.infer`. Bạn định nghĩa quy tắc một lần: trường nào bắt buộc, định dạng email, độ dài tối thiểu. Resolver `zodResolver` từ gói `@hookform/resolvers` nối schema vào RHF."
        ],
        code: {
          lang: "tsx", file: "src/features/auth/RegisterForm.tsx",
          src: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@acme/shared/schemas";

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="password">Mật khẩu</label>
      <input id="password" type="password" {...register("password")} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <button type="submit" disabled={isSubmitting}>Đăng ký</button>
    </form>
  );
}`
        }
      },
      {
        h: "Dùng chung schema với backend",
        p: [
          "Validate ở frontend chỉ để trải nghiệm tốt hơn: báo lỗi ngay, không phải chờ server. Nó không phải lớp bảo mật, vì ai cũng có thể gửi request thẳng tới API. Backend bắt buộc phải validate lại.",
          "Trong monorepo, đặt schema ở một package dùng chung (ví dụ `packages/shared`). Frontend dùng cho form, backend NestJS hoặc Express dùng `schema.safeParse(body)` để kiểm tra request. Hai bên không bao giờ lệch quy tắc, và kiểu TypeScript cũng thống nhất."
        ],
        code: {
          lang: "typescript", file: "packages/shared/src/schemas.ts",
          src: `import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Phía backend:
// const result = registerSchema.safeParse(req.body);
// if (!result.success) return res.status(400).json(z.flattenError(result.error));
// (Zod 4: phương thức error.flatten() đã deprecated, dùng z.flattenError hoặc z.treeifyError)`
        }
      }
    ],
    summary: [
      "React Hook Form dùng input uncontrolled, giảm render và code lặp.",
      "Zod định nghĩa quy tắc và suy ra kiểu TypeScript bằng `z.infer`.",
      "`zodResolver` nối schema Zod vào form.",
      "Validate frontend cho UX; backend luôn validate lại bằng cùng schema."
    ],
    pitfalls: [
      "Chỉ validate ở frontend và tin dữ liệu gửi lên. Backend phải kiểm tra lại mọi request.",
      "Hiển thị lỗi mà không liên kết với input (thiếu `aria-invalid`, `role=\"alert\"` hoặc `aria-describedby`), screen reader không báo lỗi.",
      "Copy schema sang hai nơi rồi sửa một bên, quy tắc lệch nhau. Đặt schema trong package dùng chung."
    ],
    quiz: [
      { q: "Vì sao React Hook Form thường render ít hơn form tự viết bằng useState cho từng ô?", options: ["Nó không dùng React để render form", "Nó dùng input uncontrolled, ít cập nhật state", "Nó cache DOM của form giữa các trang", "Nó bỏ qua bước validate khi gõ phím"], answer: 1, explain: "RHF đọc giá trị trực tiếp từ input đăng ký qua ref thay vì lưu từng phím gõ vào state, nên không render lại cả form mỗi lần gõ." },
      { q: "`z.infer<typeof schema>` dùng để làm gì?", options: ["Chạy validate lúc runtime", "Suy ra kiểu TypeScript từ schema", "Sinh form tự động", "Chuyển schema sang JSON"], answer: 1, explain: "z.infer là tiện ích kiểu ở compile time, cho kiểu dữ liệu tương ứng schema. Validate lúc runtime dùng parse hoặc safeParse." },
      { q: "Vì sao backend vẫn phải validate dù frontend đã validate?", options: ["Để request được xử lý chậm và an toàn hơn", "Vì có thể gửi request thẳng tới API", "Vì Zod không chạy được trên trình duyệt", "Không cần, validate frontend là đủ"], answer: 1, explain: "Frontend có thể bị bỏ qua bằng curl hay script. Chỉ validate phía server mới bảo vệ dữ liệu và hệ thống." }
    ]
  },
  "p02.m2.t4": {
    videos: [
      { id: "5jYlY4y5Dfs", title: "React Router V6 | Thư viện React router dom | Định tuyến trong ReactJS", channel: "F8 Official", lang: "vi", minutes: 15, embed: true },
      { id: "oTIJunBa6MA", title: "React Router - Complete Tutorial", channel: "Cosden Solutions", lang: "en", minutes: 24, embed: true }
    ],
    sections: [
      {
        h: "Client-side routing hoạt động thế nào",
        p: [
          "Trong ứng dụng một trang (SPA), khi người dùng bấm link, router chặn việc tải lại trang, đổi URL bằng History API (`history.pushState`) rồi render component ứng với URL mới. Nút Back/Forward vẫn hoạt động vì router lắng nghe sự kiện `popstate`. Server cần cấu hình trả về `index.html` cho mọi đường dẫn, nếu không người dùng F5 ở `/courses/42` sẽ gặp 404.",
          "Hai lựa chọn phổ biến: React Router (lâu đời, phổ biến nhất) và TanStack Router (type-safe mạnh, params và search params có kiểu). Nếu dùng Next.js thì routing dựa trên thư mục và bạn không cần hai thư viện này."
        ]
      },
      {
        h: "Nested routes và layout",
        p: [
          "Nested routes cho phép route con hiển thị bên trong route cha. Route cha render phần khung chung (sidebar, header), còn `<Outlet />` là chỗ route con hiện ra. Khi chuyển giữa các route con, khung không bị mount lại nên giữ được state như vị trí cuộn của sidebar."
        ],
        code: {
          lang: "tsx", file: "src/router.tsx",
          src: `// React Router v7: gói "react-router"; RouterProvider cho DOM lấy từ "react-router/dom"
import { createBrowserRouter, Outlet, Link } from "react-router";
import { RouterProvider } from "react-router/dom";

function DashboardLayout() {
  return (
    <div className="grid grid-cols-[220px_1fr]">
      <nav>
        <Link to="/dashboard">Tổng quan</Link>
        <Link to="/dashboard/orders">Đơn hàng</Link>
      </nav>
      <main><Outlet /></main>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,               // bảo vệ mọi route bên dưới
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Overview /> },
          { path: "orders", element: <Orders /> },
          { path: "orders/:orderId", element: <OrderDetail /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}`
        }
      },
      {
        h: "Protected routes",
        p: [
          "Protected route là route chỉ hiển thị khi người dùng đã đăng nhập (hoặc có quyền). Cách gọn là một layout route không có path, kiểm tra trạng thái đăng nhập: nếu chưa đăng nhập thì chuyển hướng tới `/login` kèm đường dẫn cũ để quay lại sau; nếu đã đăng nhập thì render `<Outlet />`.",
          "Hãy nhớ đây chỉ là trải nghiệm người dùng. Mã JavaScript của trang vẫn tải được về máy, nên dữ liệu nhạy cảm phải được bảo vệ ở API bằng kiểm tra xác thực và phân quyền phía server."
        ],
        code: {
          lang: "tsx", file: "src/auth/RequireAuth.tsx",
          src: `import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./useAuth";

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Đang kiểm tra đăng nhập...</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}`
        }
      }
    ],
    summary: [
      "Router phía client đổi URL bằng History API và render component tương ứng.",
      "Server phải trả `index.html` cho mọi đường dẫn của SPA.",
      "Nested routes dùng `<Outlet />` để giữ layout chung.",
      "Protected route chỉ là UX; bảo mật thật nằm ở API."
    ],
    pitfalls: [
      "Dùng thẻ `<a href>` cho link nội bộ làm tải lại cả trang và mất state. Dùng `<Link>` của router.",
      "Quên trạng thái đang tải khi kiểm tra đăng nhập, người dùng đã đăng nhập bị đá về `/login` trong tích tắc. Xử lý `isLoading` trước khi quyết định.",
      "Chỉ ẩn route mà không chặn API, người dùng vẫn gọi được endpoint nhạy cảm."
    ],
    quiz: [
      { q: "Người dùng F5 ở `/orders/5` của một SPA thì bị 404. Nguyên nhân thường là gì?", options: ["Router phía client bị lỗi cấu hình", "Server không fallback về index.html", "Danh sách route thiếu prop key", "Trình duyệt chặn JavaScript khi F5"], answer: 1, explain: "Khi F5, trình duyệt gửi request thật tới server. Server phải fallback về index.html để router phía client xử lý đường dẫn." },
      { q: "`<Outlet />` dùng để làm gì?", options: ["Chuyển hướng người dùng sang route khác", "Vị trí route con hiển thị trong layout cha", "Tải dữ liệu trước khi render route", "Xóa phiên đăng nhập của người dùng"], answer: 1, explain: "Outlet là chỗ trống trong layout cha, nơi route con khớp với URL sẽ hiển thị." },
      { q: "Protected route phía client có đủ để bảo vệ dữ liệu không?", options: ["Có, vì người dùng không thấy được trang", "Không, API phải tự kiểm tra quyền", "Có, nếu dùng TanStack Router", "Có, nếu code đã được minify"], answer: 1, explain: "Mọi logic phía client đều có thể bị bỏ qua. Người dùng có thể gọi thẳng API, nên server phải kiểm tra." }
    ]
  },
  "p02.m2.t5": {
    videos: [
      { id: "_ngCLZ5Iz-0", title: "Zustand - Complete Tutorial", channel: "Cosden Solutions", lang: "en", minutes: 19, embed: true },
      { id: "VenLRGHx3D4", title: "State Managers Are Making Your Code Worse In React", channel: "Web Dev Simplified", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Bậc thang quản lý state",
        p: [
          "Không phải state nào cũng cần thư viện. Hãy bắt đầu từ đơn giản nhất và chỉ leo lên khi thật sự cần. Bậc 1 là local state bằng `useState`/`useReducer` trong component. Bậc 2 là nâng state lên cha và truyền props. Bậc 3 là Context, khi nhiều component ở xa nhau cần cùng một giá trị ít đổi như theme, ngôn ngữ, người dùng hiện tại. Bậc 4 là store toàn cục như Zustand hoặc Redux Toolkit khi state phức tạp, cập nhật thường xuyên và được nhiều nơi dùng.",
          "Context không phải công cụ quản lý state mà là cơ chế truyền giá trị xuống sâu. Khi value của Provider đổi, mọi component dùng context đó đều render lại. Với dữ liệu thay đổi liên tục, điều này có thể gây chậm."
        ]
      },
      {
        h: "Zustand: store gọn nhẹ",
        p: [
          "Zustand tạo store bằng một hàm, không cần Provider. Component chọn đúng phần state nó cần qua selector, nên chỉ render lại khi phần đó đổi. Redux Toolkit phù hợp khi đội muốn quy ước chặt chẽ, DevTools mạnh và middleware phong phú; đánh đổi là nhiều khái niệm hơn."
        ],
        code: {
          lang: "typescript", file: "src/stores/cart.ts",
          src: `import { create } from "zustand";

type Item = { id: string; name: string; qty: number };
type CartState = {
  items: Item[];
  add: (item: Omit<Item, "qty">) => void;
  remove: (id: string) => void;
};

export const useCart = create<CartState>()((set) => ({
  items: [],
  add: (item) =>
    set((s) => {
      const found = s.items.find((i) => i.id === item.id);
      return {
        items: found
          ? s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
          : [...s.items, { ...item, qty: 1 }],
      };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

// Trong component: chỉ render lại khi số lượng thay đổi
// const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));`
        }
      },
      {
        h: "Tách client state và server state",
        p: [
          "Client state là dữ liệu chỉ tồn tại trên trình duyệt: modal đang mở, tab đang chọn, giỏ hàng chưa gửi. Server state là bản sao của dữ liệu nằm trên server: danh sách đơn hàng, hồ sơ người dùng. Server state có vấn đề riêng: có thể cũ đi, cần cache, cần refetch, nhiều người cùng sửa.",
          "Sai lầm phổ biến là fetch dữ liệu rồi nhét vào Redux hay Zustand, sau đó tự viết logic loading, lỗi, cache, làm mới. Hãy để thư viện chuyên cho server state như TanStack Query lo phần đó, còn store toàn cục chỉ giữ client state. Kết quả là store nhỏ hơn rất nhiều."
        ]
      }
    ],
    summary: [
      "Leo dần: local state, lifting up, Context, rồi mới đến store toàn cục.",
      "Context truyền giá trị ít đổi; value đổi thì mọi consumer render lại.",
      "Zustand gọn, dùng selector để hạn chế render; Redux Toolkit cho quy ước chặt.",
      "Server state để TanStack Query quản lý; store chỉ giữ client state."
    ],
    pitfalls: [
      "Đưa mọi thứ vào store toàn cục ngay từ đầu, khiến code khó theo dõi. Giữ state gần nơi dùng nhất có thể.",
      "Lấy cả store trong Zustand (`useCart()` không selector) làm component render lại với mọi thay đổi. Chọn đúng phần cần dùng.",
      "Truyền object mới làm value của Context mỗi lần render (`value={{ user, setUser }}`) khiến mọi consumer render lại. Ghi nhớ value bằng useMemo khi cần."
    ],
    quiz: [
      { q: "Dữ liệu nào là server state?", options: ["Trạng thái mở/đóng của modal", "Danh sách đơn hàng lấy từ API", "Tab đang chọn", "Giá trị ô tìm kiếm đang gõ"], answer: 1, explain: "Danh sách đơn hàng là bản sao dữ liệu trên server, có thể cũ đi và cần đồng bộ. Các lựa chọn khác chỉ tồn tại trên client." },
      { q: "Điểm yếu của Context với dữ liệu thay đổi liên tục là gì?", options: ["Không truyền được hàm qua context", "Value đổi thì mọi consumer render lại", "Mỗi context chỉ dùng được một lần", "Context không hỗ trợ TypeScript"], answer: 1, explain: "Context không có selector; value đổi thì mọi consumer render lại, dễ gây chậm với dữ liệu cập nhật thường xuyên." },
      { q: "Vì sao dùng selector khi đọc Zustand store?", options: ["Cú pháp của Zustand bắt buộc có selector", "Chỉ render lại khi phần được chọn đổi", "Selector tự lưu store vào localStorage", "Selector giúp store chạy được trên server"], answer: 1, explain: "Zustand so sánh kết quả selector giữa các lần cập nhật; chỉ khi khác mới render lại. Không có selector thì mọi thay đổi đều gây render." }
    ]
  },
  "p02.m2.t6": {
    videos: [
      { id: "mPaCnwpFvZY", title: "TanStack Query - How to become a React Query God", channel: "Austin Davis", lang: "en", minutes: 29, embed: true }
    ],
    sections: [
      {
        h: "TanStack Query giải quyết gì",
        p: [
          "TanStack Query (trước đây là React Query) quản lý server state: gọi API, cache kết quả theo `queryKey`, loại bỏ request trùng lặp, tự refetch khi dữ liệu cũ, và cung cấp sẵn trạng thái `isPending`, `isError`, `data`. Bạn không phải tự viết `useEffect` + `useState` cho mỗi lần fetch.",
          "Hai khái niệm thời gian quan trọng ở v5: `staleTime` là bao lâu dữ liệu được coi là mới (mặc định 0, tức cũ ngay). Dữ liệu cũ vẫn hiển thị nhưng sẽ được refetch ngầm khi component mount lại, cửa sổ được focus lại hoặc mạng kết nối lại. `gcTime` (tên cũ là cacheTime) là bao lâu cache không còn ai dùng thì bị dọn, mặc định 5 phút."
        ],
        code: {
          lang: "tsx", file: "src/features/todos/useTodos.ts",
          src: `import { useQuery, keepPreviousData } from "@tanstack/react-query";

type Todo = { id: number; title: string; done: boolean };
export type Page = { items: Todo[]; hasMore: boolean };

export function useTodos(page: number) {
  return useQuery({
    queryKey: ["todos", { page }],
    queryFn: async ({ signal }): Promise<Page> => {
      const res = await fetch(\`/api/todos?page=\${page}\`, { signal });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return res.json();
    },
    staleTime: 30_000,                 // 30 giây coi là mới
    placeholderData: keepPreviousData, // giữ trang cũ khi đang tải trang mới
  });
}`
        }
      },
      {
        h: "Mutation và optimistic update",
        p: [
          "Thao tác ghi dùng `useMutation`. Sau khi thành công, gọi `queryClient.invalidateQueries` để đánh dấu các query liên quan là cũ và refetch. Optimistic update là cập nhật giao diện ngay trước khi server trả lời, giúp ứng dụng có cảm giác tức thì. Nếu server báo lỗi, bạn khôi phục dữ liệu cũ.",
          "Quy trình trong `onMutate`: hủy các refetch đang chạy để không ghi đè, lưu snapshot dữ liệu hiện tại, cập nhật cache. `onError` khôi phục snapshot. `onSettled` invalidate để đồng bộ với server dù thành công hay thất bại."
        ],
        code: {
          lang: "tsx", file: "src/features/todos/useToggleTodo.ts",
          src: `import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Page } from "./useTodos";

export function useToggleTodo(page: number) {
  const qc = useQueryClient();
  const key = ["todos", { page }];

  return useMutation({
    mutationFn: (todo: { id: number; done: boolean }) =>
      fetch(\`/api/todos/\${todo.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: todo.done }),
      }).then((r) => { if (!r.ok) throw new Error("Cập nhật thất bại"); }),
    onMutate: async (todo) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Page>(key);
      qc.setQueryData<Page>(key, (old) =>
        old && { ...old, items: old.items.map((t) => (t.id === todo.id ? { ...t, done: todo.done } : t)) },
      );
      return { previous };
    },
    onError: (_err, _todo, ctx) => qc.setQueryData(key, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });
}`
        }
      },
      {
        h: "Phân trang và thiết kế queryKey",
        p: [
          "`queryKey` là mảng mô tả duy nhất dữ liệu, gồm mọi tham số ảnh hưởng tới kết quả (trang, bộ lọc, id). Khi key đổi, TanStack Query tự fetch dữ liệu mới. Với phân trang kiểu số trang, `placeholderData: keepPreviousData` giữ trang cũ trên màn hình trong lúc tải trang mới, tránh nhấp nháy. Với cuộn vô hạn, dùng `useInfiniteQuery` với `initialPageParam` và `getNextPageParam`.",
          "Invalidate theo tiền tố: `invalidateQueries({ queryKey: [\"todos\"] })` làm cũ mọi query có key bắt đầu bằng `todos`, gồm mọi trang và bộ lọc."
        ]
      }
    ],
    summary: [
      "TanStack Query cache server state theo queryKey, tự dedupe và refetch.",
      "`staleTime` quyết định khi nào dữ liệu cũ; `gcTime` quyết định khi nào cache bị dọn.",
      "Mutation xong thì invalidate query liên quan.",
      "Optimistic update: snapshot trong onMutate, rollback trong onError, invalidate trong onSettled.",
      "queryKey phải chứa mọi tham số ảnh hưởng dữ liệu."
    ],
    pitfalls: [
      "Quên đưa tham số (page, filter) vào queryKey, dữ liệu các trang dùng chung một cache và hiển thị sai.",
      "Không ném lỗi khi `res.ok` là false, TanStack Query coi request thành công. queryFn phải throw khi HTTP lỗi.",
      "Copy dữ liệu từ useQuery sang useState rồi sửa, mất đồng bộ với cache. Đọc thẳng từ `data` hoặc cập nhật qua `setQueryData`."
    ],
    quiz: [
      { q: "Với `staleTime` mặc định là 0 ở TanStack Query v5, điều gì xảy ra khi cửa sổ được focus lại?", options: ["Không có gì xảy ra cho tới lần mount sau", "Query được refetch ngầm vì dữ liệu đã cũ", "Cache của query bị xóa hoàn toàn", "Toàn bộ trang được tải lại từ server"], answer: 1, explain: "Dữ liệu cũ ngay sau khi fetch, và refetchOnWindowFocus mặc định bật, nên query được refetch ngầm trong khi vẫn hiển thị dữ liệu cũ." },
      { q: "Trong optimistic update, `onError` nên làm gì?", options: ["Hiện alert báo lỗi rồi giữ nguyên cache", "Khôi phục cache từ snapshot lưu ở onMutate", "Xóa toàn bộ cache của QueryClient", "Gọi lại mutation cho tới khi thành công"], answer: 1, explain: "UI đã cập nhật trước khi server xác nhận. Nếu lỗi, cần trả cache về trạng thái cũ từ snapshot để giao diện đúng với server." },
      { q: "`gcTime` quy định điều gì?", options: ["Thời gian dữ liệu còn được coi là mới", "Thời gian giữ cache khi không còn ai dùng", "Thời gian tối đa chờ một request", "Khoảng cách giữa các lần retry"], answer: 1, explain: "gcTime (tên cũ cacheTime) là thời gian giữ cache không hoạt động. Thời gian dữ liệu còn mới là staleTime." }
    ]
  },
  "p02.m3.t0": {
    videos: [
      { id: "HLEu57iLrRo", title: "SSR & CSR | Sever side rendering | Client side rendering", channel: "F8 Official", lang: "en", minutes: 13, embed: true },
      { id: "S5tjBqzs31w", title: "Next.js CSR vs SSR vs SSG vs ISR and now PPR!", channel: "ByteGrad", lang: "en", minutes: 34, embed: true }
    ],
    sections: [
      {
        h: "Các chiến lược render",
        p: [
          "Câu hỏi cốt lõi: HTML được tạo ra ở đâu và khi nào? Câu trả lời ảnh hưởng tới SEO, tốc độ hiển thị đầu tiên, độ mới của dữ liệu và chi phí server.",
          "Nhiều framework hiện đại như Next.js cho phép chọn chiến lược theo từng route, thậm chí từng phần của trang. Bạn không phải chọn một cho cả ứng dụng."
        ],
        list: [
          "CSR (Client-Side Rendering): server gửi HTML gần như rỗng và bundle JS; trình duyệt tải, chạy JS rồi mới vẽ nội dung. Rẻ cho server, nhưng hiển thị đầu chậm và SEO kém hơn.",
          "SSR (Server-Side Rendering): server tạo HTML cho mỗi request, gửi về rồi JS hydrate để trang tương tác được. Dữ liệu luôn mới, SEO tốt, đổi lại tốn tài nguyên server mỗi request.",
          "SSG (Static Site Generation): HTML tạo sẵn lúc build, phục vụ từ CDN. Nhanh nhất và rẻ nhất, nhưng dữ liệu chỉ mới khi build lại.",
          "ISR (Incremental Static Regeneration): như SSG nhưng tự tạo lại trang sau một khoảng thời gian hoặc khi được yêu cầu (revalidate), không cần build lại toàn bộ.",
          "RSC (React Server Components): component chạy hoàn toàn trên server, gửi kết quả render về client, code của chúng không nằm trong bundle JS. Có thể kết hợp với SSR, SSG, streaming."
        ]
      },
      {
        h: "Chọn chiến lược theo nhu cầu",
        p: [
          "Trang marketing, blog, tài liệu: nội dung ít đổi, cần SEO, nên dùng SSG hoặc ISR. Trang sản phẩm thương mại điện tử: cần SEO và giá tồn kho khá mới, hợp với ISR có revalidate ngắn hoặc SSR. Dashboard sau đăng nhập: không cần SEO, dữ liệu riêng từng người, có thể dùng SSR cho khung và CSR/TanStack Query cho phần tương tác nhiều.",
          "Hydration là bước React gắn sự kiện vào HTML có sẵn từ server. Trước khi hydrate xong, trang nhìn thấy được nhưng bấm có thể chưa phản hồi. Bundle JS càng lớn thì hydration càng lâu, ảnh hưởng INP. RSC giúp giảm JS vì component chỉ hiển thị dữ liệu không cần gửi code xuống client."
        ]
      },
      {
        h: "Ví dụ trong Next.js App Router",
        p: [
          "Trong App Router, trang mặc định là Server Component. Cách bạn fetch dữ liệu và các tùy chọn cache quyết định trang được render tĩnh hay động. Mặc định giữa các phiên bản Next.js đã thay đổi (từ Next.js 15, `fetch` không còn được cache mặc định; tuy vậy nếu route được prerender tĩnh thì `fetch` chỉ chạy một lần lúc `next build`), nên hãy khai báo rõ ý định bằng `cache: 'force-cache'` hoặc `cache: 'no-store'` thay vì dựa vào mặc định.",
          "Ví dụ dưới dùng mô hình cache truyền thống (route segment config `revalidate` và tùy chọn `next.revalidate` của fetch). Từ Next.js 16 có thêm chế độ Cache Components (bật bằng `cacheComponents: true` trong `next.config.ts`): dữ liệu mặc định là động, bạn chủ động đánh dấu phần cần cache bằng chỉ thị `\"use cache\"` kết hợp `cacheLife` và `cacheTag`, và trang được prerender thành một khung tĩnh rồi stream phần động vào (Partial Prerendering). Khi bật chế độ này, một số route segment config như `revalidate` được thay bằng `cacheLife`, nên hãy đọc hướng dẫn migrate trước khi bật."
        ],
        code: {
          lang: "tsx", file: "app/products/[id]/page.tsx",
          src: `// ISR: trang được tạo lại tối đa mỗi 60 giây
export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(\`https://api.example.com/products/\${id}\`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Không tải được sản phẩm");
  const product: { name: string; price: number } = await res.json();

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.price.toLocaleString("vi-VN")} đ</p>
    </main>
  );
}`
        }
      }
    ],
    summary: [
      "CSR rẻ cho server nhưng hiển thị đầu chậm; SSR luôn mới nhưng tốn server.",
      "SSG nhanh nhất cho nội dung ít đổi; ISR thêm khả năng làm mới định kỳ.",
      "RSC chạy trên server và không gửi code xuống client, giảm bundle.",
      "Chọn theo từng route dựa trên SEO, độ mới dữ liệu và chi phí."
    ],
    pitfalls: [
      "Dùng CSR cho trang cần SEO như blog, bot có thể không thấy nội dung đầy đủ. Dùng SSG/ISR.",
      "Dùng SSR cho mọi trang dù nội dung tĩnh, tốn chi phí server vô ích. Trang tĩnh để CDN phục vụ.",
      "Render giá trị khác nhau giữa server và client (ví dụ `Date.now()`, `Math.random()`) gây lỗi hydration mismatch. Tạo giá trị đó trong effect hoặc truyền từ server."
    ],
    quiz: [
      { q: "Blog cá nhân cập nhật vài lần mỗi tuần, cần SEO tốt. Chiến lược phù hợp nhất?", options: ["CSR", "SSR mỗi request", "SSG hoặc ISR", "Chỉ dùng Web Worker"], answer: 2, explain: "Nội dung ít đổi nên tạo sẵn HTML và phục vụ từ CDN là nhanh và rẻ nhất; ISR giúp cập nhật mà không cần build lại toàn bộ." },
      { q: "Đặc điểm nổi bật của React Server Components là gì?", options: ["Chạy trên trình duyệt nhanh hơn component thường", "Code của chúng không nằm trong bundle JS client", "Thay thế hoàn toàn API backend của ứng dụng", "Chỉ dùng được với trang SSG tạo lúc build"], answer: 1, explain: "RSC render trên server và chỉ gửi kết quả; code và thư viện dùng bên trong không vào bundle client. Chúng vẫn kết hợp được với SSR, SSG." },
      { q: "Hydration là gì?", options: ["Nén HTML trước khi gửi xuống client", "Gắn event handler vào HTML render từ server", "Trì hoãn tải ảnh nằm dưới màn hình đầu", "Tạo sẵn HTML cho mọi trang lúc build"], answer: 1, explain: "Hydration biến HTML tĩnh từ server thành ứng dụng tương tác bằng cách chạy JS và gắn event handler." }
    ]
  },
  "p02.m3.t1": {
    videos: [
      { id: "gSSsZReIFRk", title: "Next.js App Router: Routing, Data Fetching, Caching", channel: "Vercel", lang: "en", minutes: 15, embed: true },
      { id: "BWJJwk2j-7A", title: "Server Actions - Viết code backend trong React ???", channel: "Holetex", lang: "vi", minutes: 19, embed: true }
    ],
    sections: [
      {
        h: "Cấu trúc App Router",
        p: [
          "Next.js App Router dùng thư mục `app/` và định tuyến theo cây thư mục. Mỗi thư mục là một đoạn URL; file `page.tsx` làm cho đoạn đó truy cập được. Các file đặc biệt khác: `layout.tsx` bọc các trang con và giữ nguyên khi điều hướng giữa chúng; `loading.tsx` hiển thị trong lúc trang đang tải (thực chất là một Suspense boundary); `error.tsx` bắt lỗi khi render (phải là Client Component); `not-found.tsx` hiển thị khi gọi `notFound()`."
        ],
        code: {
          lang: "text", file: "cấu trúc thư mục",
          src: `app/
├─ layout.tsx          # layout gốc, có <html> và <body>
├─ page.tsx            # /
└─ dashboard/
   ├─ layout.tsx       # sidebar dùng chung cho /dashboard/*
   ├─ loading.tsx      # skeleton khi đang tải
   ├─ error.tsx        # "use client", bắt lỗi của đoạn này
   ├─ page.tsx         # /dashboard
   └─ orders/
      └─ [id]/
         └─ page.tsx   # /dashboard/orders/123`
        }
      },
      {
        h: "Server Component và Client Component",
        p: [
          "Mặc định mọi component trong `app/` là Server Component: chạy trên server, có thể `async`, đọc database hay biến môi trường bí mật trực tiếp, và không gửi code xuống trình duyệt. Nhưng chúng không dùng được state, effect hay event handler.",
          "Khi cần tương tác, thêm chỉ thị `\"use client\"` ở đầu file. File đó và mọi thứ nó import trở thành một phần của bundle client. Hãy đẩy ranh giới client xuống càng sâu càng tốt: trang vẫn là Server Component, chỉ nút \"Thích\" hay ô tìm kiếm là Client Component. Server Component có thể truyền props (phải tuần tự hóa được) hoặc truyền Server Component khác qua `children` cho Client Component."
        ],
        code: {
          lang: "tsx", file: "app/dashboard/orders/page.tsx",
          src: `import { db } from "@/lib/db";
import { OrderFilter } from "./OrderFilter"; // file có "use client"

export default async function OrdersPage() {
  const orders = await db.order.findMany({ take: 20, orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>Đơn hàng</h1>
      <OrderFilter />
      <ul>
        {orders.map((o) => <li key={o.id}>{o.code}: {o.total}</li>)}
      </ul>
    </section>
  );
}`
        }
      },
      {
        h: "Server Actions",
        p: [
          "Server Action là hàm async đánh dấu `\"use server\"`, chạy trên server nhưng có thể gọi từ form hoặc Client Component. Next.js tự tạo endpoint và xử lý việc gửi dữ liệu. Với `<form action={createTodo}>`, form vẫn hoạt động kể cả khi JavaScript chưa tải xong (progressive enhancement).",
          "Hãy coi Server Action như một API công khai: ai cũng gọi được. Luôn kiểm tra đăng nhập, phân quyền và validate dữ liệu bên trong nó. Sau khi ghi dữ liệu, gọi `revalidatePath(\"/todos\")` hoặc `revalidateTag(\"todos\", \"max\")` để làm mới dữ liệu đã cache (từ Next.js 16, `revalidateTag` nhận tham số thứ hai là cache profile; dạng một tham số đã deprecated, còn `updateTag` dùng trong Server Action khi cần hết hạn ngay). Hook `useActionState` của React 19 giúp nhận kết quả và trạng thái đang gửi; khi dùng nó, action nhận thêm tham số đầu là state trước đó: `(prevState, formData)`.",
          "Tài liệu React hiện gọi chung các hàm `\"use server\"` là Server Functions; khi được truyền vào `action` của form hoặc gọi trong transition thì gọi là Server Action. Next.js vẫn dùng tên Server Actions trong tài liệu của mình."
        ],
        code: {
          lang: "tsx", file: "app/todos/actions.ts",
          src: `"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({ title: z.string().trim().min(1).max(200) });

export async function createTodo(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Chưa đăng nhập");

  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: "Tiêu đề không hợp lệ" };

  await db.todo.create({ data: { title: parsed.data.title, userId: session.userId } });
  revalidatePath("/todos");
  return { error: null };
}`
        }
      }
    ],
    summary: [
      "App Router định tuyến theo thư mục; `page`, `layout`, `loading`, `error` là file đặc biệt.",
      "Component mặc định là Server Component: async, truy cập dữ liệu trực tiếp, không có state.",
      "`\"use client\"` đánh dấu ranh giới client; đẩy ranh giới xuống thấp nhất có thể.",
      "Server Action chạy trên server, phải xác thực và validate như một API công khai."
    ],
    pitfalls: [
      "Thêm `\"use client\"` ở layout gốc khiến cả ứng dụng thành client, mất lợi ích của RSC. Chỉ đánh dấu component lá cần tương tác.",
      "Import module chứa bí mật (kết nối DB, API key) vào Client Component. Dùng gói `server-only` để build báo lỗi nếu lỡ import.",
      "Quên kiểm tra quyền trong Server Action vì nghĩ nó chỉ được gọi từ form của mình. Endpoint của nó có thể bị gọi trực tiếp."
    ],
    quiz: [
      { q: "Muốn dùng `useState` trong component thuộc thư mục `app/`, bạn cần làm gì?", options: ["Không cần gì", "Thêm \"use client\" ở đầu file", "Thêm \"use server\"", "Đổi tên file thành client.tsx"], answer: 1, explain: "Component trong app/ mặc định là Server Component và không dùng được hook state. \"use client\" đánh dấu file là Client Component." },
      { q: "`loading.tsx` hoạt động dựa trên cơ chế nào?", options: ["Một Suspense boundary bọc page của route", "Một middleware chạy trước mỗi request", "Một Service Worker cache trang đang tải", "Một Server Action trả về trạng thái chờ"], answer: 0, explain: "Next.js tự bọc page trong Suspense với fallback là loading.tsx, nên nội dung hiện ra ngay khi dữ liệu sẵn sàng qua streaming." },
      { q: "Vì sao phải kiểm tra xác thực bên trong Server Action?", options: ["Vì Next.js bắt buộc về mặt cú pháp", "Vì ai cũng gửi request tới endpoint của nó được", "Vì Server Action chạy trên trình duyệt", "Không cần, Next.js tự kiểm tra phiên"], answer: 1, explain: "Server Action được lộ ra dưới dạng endpoint. Kẻ xấu có thể gọi trực tiếp nên phải kiểm tra phiên và quyền như mọi API." }
    ]
  },
  "p02.m3.t2": {
    videos: [
      { id: "XyPNw_3jsLY", title: "How JavaScript package managers work: npm vs. yarn vs. pnpm vs. npx", channel: "Software Developer Diaries", lang: "en", minutes: 12, embed: true },
      { id: "TeOSuGRHq7k", title: "How to structure a JS/TS monorepo | From Zero to Turbo - Part 1", channel: "Anthony Shew", lang: "en", minutes: 12, embed: true }
    ],
    sections: [
      {
        h: "npm, pnpm và lockfile",
        p: [
          "Package manager tải thư viện từ registry và cài vào `node_modules`. npm đi kèm Node.js. pnpm lưu mỗi phiên bản gói một lần trong một kho chung trên máy rồi liên kết vào dự án, nên tiết kiệm dung lượng và cài nhanh. pnpm cũng chặt chẽ hơn: code chỉ import được gói khai báo trong `package.json` của nó, tránh lỗi dùng nhầm dependency gián tiếp.",
          "Lockfile (`package-lock.json`, `pnpm-lock.yaml`) ghi lại chính xác phiên bản của mọi gói, kể cả gói gián tiếp. Nhờ vậy máy bạn, máy đồng nghiệp và CI cài giống hệt nhau. Luôn commit lockfile. Trong CI dùng `npm ci` hoặc `pnpm install --frozen-lockfile` để cài đúng theo lockfile và báo lỗi nếu lockfile không khớp `package.json`."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `# Cài theo lockfile trong CI
npm ci
pnpm install --frozen-lockfile

# Thêm dependency
pnpm add @tanstack/react-query
pnpm add -D vitest

# Xem gói nào có phiên bản mới
pnpm outdated`
        }
      },
      {
        h: "Semantic versioning và range",
        p: [
          "Semver có dạng `MAJOR.MINOR.PATCH`. Tăng MAJOR khi có thay đổi phá vỡ tương thích, MINOR khi thêm tính năng tương thích ngược, PATCH khi sửa lỗi. Trong `package.json`, `^1.4.2` cho phép cài bản `>=1.4.2 <2.0.0`; `~1.4.2` chỉ cho phép `>=1.4.2 <1.5.0`; `1.4.2` là cố định. Với gói phiên bản `0.x`, dấu `^` chặt hơn: `^0.3.1` chỉ cho phép `<0.4.0` vì ở giai đoạn 0 mỗi bản minor có thể phá vỡ.",
          "Range quyết định lúc cập nhật lockfile có thể nâng lên bản nào. Semver chỉ là cam kết của tác giả, không phải bảo đảm, nên vẫn cần test khi nâng cấp."
        ]
      },
      {
        h: "Vite và monorepo với Turborepo",
        p: [
          "Vite là công cụ build cho frontend. Khi dev, nó phục vụ mã nguồn dưới dạng ES module native và chỉ biến đổi file khi trình duyệt yêu cầu, nên khởi động nhanh và HMR (cập nhật nóng) gần như tức thì. Khi build production, nó đóng gói, tách chunk và tối ưu code.",
          "Monorepo chứa nhiều ứng dụng và package trong một repository, ví dụ `apps/web`, `apps/api`, `packages/shared`. pnpm workspaces liên kết các package nội bộ với nhau. Turborepo chạy task (build, test, lint) theo thứ tự phụ thuộc, song song khi có thể, và cache kết quả: task nào có đầu vào không đổi sẽ lấy kết quả từ cache thay vì chạy lại."
        ],
        code: {
          lang: "json", file: "turbo.json",
          src: `{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}`
        }
      }
    ],
    summary: [
      "Lockfile đảm bảo mọi môi trường cài cùng phiên bản; luôn commit nó.",
      "CI dùng `npm ci` hoặc `pnpm install --frozen-lockfile`.",
      "`^` cho phép nâng minor/patch, `~` chỉ patch; gói 0.x được xử lý chặt hơn.",
      "Vite dev nhanh nhờ ES module native; Turborepo chạy task theo phụ thuộc và cache."
    ],
    pitfalls: [
      "Không commit lockfile, mỗi lần cài ra phiên bản khác và lỗi \"máy tôi chạy được\".",
      "Trộn nhiều package manager trong một dự án (vừa `package-lock.json` vừa `pnpm-lock.yaml`). Chọn một và khai báo trường `packageManager`.",
      "Khai báo `outputs` sai trong turbo.json, cache không khôi phục được file build. Liệt kê đúng thư mục đầu ra."
    ],
    quiz: [
      { q: "`\"react\": \"^19.1.0\"` cho phép cài phiên bản nào?", options: ["Chỉ 19.1.0", "19.1.x", ">=19.1.0 và <20.0.0", "Mọi phiên bản"], answer: 2, explain: "Dấu ^ với major khác 0 cho phép nâng minor và patch nhưng giữ nguyên major." },
      { q: "Vì sao dùng `npm ci` trong CI thay cho `npm install`?", options: ["Nó cài thêm nhiều gói tối ưu hơn", "Nó cài đúng theo lockfile, lệch thì báo lỗi", "Nó bỏ qua toàn bộ devDependencies", "Nó tự cập nhật lockfile lên bản mới"], answer: 1, explain: "npm ci xóa node_modules, cài chính xác theo lockfile và không sửa lockfile, giúp build lặp lại được." },
      { q: "Turborepo tăng tốc CI chủ yếu nhờ điều gì?", options: ["Biên dịch lại code ứng dụng bằng Rust", "Cache kết quả task và chạy song song", "Tắt bớt các bước test trong pipeline", "Nén node_modules trước khi cài"], answer: 1, explain: "Nếu đầu vào của task không đổi, Turborepo lấy kết quả từ cache. Task độc lập chạy song song theo đồ thị phụ thuộc." }
    ]
  },
  "p02.m3.t3": {
    videos: [
      { id: "6dOpQIwyV6g", title: "React Testing Full Course 2026 | Vitest and React Testing Library Tutorial", channel: "RoadsideCoder", lang: "en", minutes: 48, embed: true },
      { id: "3NW0Mz943_E", title: "React Testing with Playwright (Complete Tutorial)", channel: "Cosden Solutions", lang: "en", minutes: 33, embed: true }
    ],
    sections: [
      {
        h: "Test hành vi, không test chi tiết cài đặt",
        p: [
          "Một bài test tốt kiểm tra điều người dùng thấy và làm: có nút \"Đăng nhập\", gõ email sai thì hiện lỗi. Nó không kiểm tra state nội bộ tên gì hay component gọi hàm nào. Test như vậy vẫn đúng khi bạn refactor, và chỉ thất bại khi hành vi thật sự hỏng.",
          "Testing Library khuyến khích cách này qua các query theo vai trò và nhãn: `getByRole(\"button\", { name: \"Đăng nhập\" })`, `getByLabelText(\"Email\")`. Nếu query theo role khó dùng, thường là dấu hiệu component thiếu accessibility. Dùng `user-event` để mô phỏng thao tác thật như gõ phím, click, thay vì bắn sự kiện thủ công."
        ]
      },
      {
        h: "Vitest + Testing Library",
        p: [
          "Vitest là test runner tương thích API kiểu Jest, dùng chung cấu hình với Vite nên chạy nhanh và hỗ trợ TypeScript sẵn. Cấu hình `environment: \"jsdom\"` để có DOM giả lập. Các matcher như `toHaveTextContent`, `toBeInTheDocument` không có sẵn trong Vitest mà đến từ gói `@testing-library/jest-dom`; nạp nó trong file setup (`import \"@testing-library/jest-dom/vitest\"`, khai báo ở `setupFiles`). Với các hàm gọi API, bạn có thể mock bằng `vi.fn()` hoặc dùng MSW để chặn request ở tầng mạng."
        ],
        code: {
          lang: "tsx", file: "src/features/auth/LoginForm.test.tsx",
          src: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("báo lỗi khi email không hợp lệ", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("Email"), "abc");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email không hợp lệ");
  });

  it("gửi dữ liệu khi hợp lệ", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "an@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "secret123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(onSubmit).toHaveBeenCalledWith({ email: "an@example.com", password: "secret123" });
  });
});`
        }
      },
      {
        h: "Playwright cho end-to-end",
        p: [
          "Test e2e chạy ứng dụng thật trên trình duyệt thật (Chromium, Firefox, WebKit), đi qua cả frontend, backend và database. Playwright tự chờ phần tử sẵn sàng trước khi thao tác, giảm test chập chờn (flaky). Test e2e chậm và tốn công bảo trì hơn, nên chỉ viết cho vài luồng quan trọng nhất như đăng ký, đăng nhập, thanh toán. Phần lớn logic kiểm tra bằng unit và component test, theo mô hình kim tự tháp test."
        ],
        code: {
          lang: "typescript", file: "e2e/login.spec.ts",
          src: `import { test, expect } from "@playwright/test";

test("người dùng đăng nhập và thấy dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("an@example.com");
  await page.getByLabel("Mật khẩu").fill("secret123");
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL(/\\/dashboard/);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
});`
        }
      }
    ],
    summary: [
      "Test hành vi người dùng thấy, không test state hay hàm nội bộ.",
      "Ưu tiên query theo role và label; dùng user-event để mô phỏng thao tác.",
      "Vitest nhanh, dùng chung cấu hình Vite, chạy với jsdom.",
      "Playwright cho vài luồng e2e quan trọng; phần lớn test ở tầng thấp hơn."
    ],
    pitfalls: [
      "Query bằng class CSS hay `data-testid` khắp nơi khiến test gắn với cài đặt. Ưu tiên role, label, text.",
      "Dùng `getBy...` cho phần tử xuất hiện bất đồng bộ nên test thất bại. Dùng `findBy...` hoặc `waitFor`.",
      "Dùng `waitForTimeout` cứng trong Playwright làm test chậm và vẫn flaky. Dùng assertion tự chờ như `toBeVisible`."
    ],
    quiz: [
      { q: "Query nào được Testing Library khuyến khích nhất?", options: ["container.querySelector(\".btn\")", "getByTestId(\"submit\")", "getByRole(\"button\", { name: \"Gửi\" })", "getElementsByClassName"], answer: 2, explain: "getByRole phản ánh cách người dùng và công nghệ hỗ trợ nhận biết phần tử. testId và class là chi tiết cài đặt, chỉ dùng khi không còn cách khác." },
      { q: "Phần tử hiện ra sau khi API trả về, nên dùng query nào?", options: ["getByText", "queryByText", "findByText", "getAllByText"], answer: 2, explain: "findBy trả về Promise và chờ tới khi phần tử xuất hiện hoặc hết thời gian. getBy tìm ngay và thất bại nếu chưa có." },
      { q: "Vì sao không nên viết quá nhiều test e2e?", options: ["Playwright không ổn định trên CI", "E2e chậm và tốn công bảo trì hơn nhiều", "E2e không chạy được trong CI", "E2e không kiểm tra được backend"], answer: 1, explain: "E2e chạy toàn hệ thống nên chậm và dễ vỡ khi UI đổi. Dùng cho vài luồng quan trọng, còn lại kiểm tra ở tầng nhanh hơn." }
    ]
  },
  "p02.m3.t4": {
    videos: [
      { id: "AiiGjB2AxqA", title: "Deploying Next.js to Vercel", channel: "Vercel", lang: "en", minutes: 6, embed: true },
      { id: "nZrAgov_-D8", title: "Environments on Vercel", channel: "Vercel", lang: "en", minutes: 12, embed: true }
    ],
    sections: [
      {
        h: "PaaS cho frontend làm gì thay bạn",
        p: [
          "PaaS (Platform as a Service) cho frontend như Vercel, Netlify, Cloudflare Pages/Workers nhận mã nguồn từ Git, tự chạy lệnh build, rồi phân phối kết quả qua CDN toàn cầu. Bạn không phải tự dựng server, cấu hình Nginx hay xin chứng chỉ HTTPS. Với trang tĩnh (Vite build ra thư mục `dist`), nền tảng chỉ cần phục vụ file. Với Next.js có SSR, Server Actions hay ISR, nền tảng còn phải chạy phần code server dưới dạng hàm serverless hoặc edge function.",
          "Luồng làm việc chuẩn: kết nối repository, khai báo lệnh build và thư mục đầu ra (thường được nhận diện tự động theo framework), rồi mỗi lần push là một lần deploy. Nhánh production (thường là `main`) cập nhật domain chính; các nhánh khác và pull request nhận bản deploy riêng."
        ],
        list: [
          "Vercel: do đội phát triển Next.js làm, hỗ trợ đầy đủ tính năng Next.js mà gần như không cần cấu hình.",
          "Netlify: mạnh với site tĩnh và Jamstack, cấu hình bằng `netlify.toml`, có sẵn form và function.",
          "Cloudflare Pages/Workers: chạy trên mạng edge của Cloudflare. Workers không phải môi trường Node.js đầy đủ, nên framework có phần server như Next.js cần adapter; xem hướng dẫn framework trong tài liệu Cloudflare trước khi chọn."
        ]
      },
      {
        h: "Preview theo pull request",
        p: [
          "Preview deployment là bản deploy tạm thời với URL riêng cho từng pull request hoặc từng commit. Reviewer bấm link để xem giao diện thật thay vì đọc diff, designer và QA kiểm tra trước khi merge, và bạn có thể chạy test e2e Playwright nhắm vào URL preview đó. Khi PR được merge, nhánh production được build lại và lên domain chính.",
          "Hai điều cần nhớ: bản preview có thể công khai với bất kỳ ai có link, nên bật bảo vệ bằng mật khẩu hoặc đăng nhập nếu nội dung nhạy cảm; và preview nên trỏ tới API và database của môi trường staging, không phải production, để test không làm bẩn dữ liệu thật."
        ]
      },
      {
        h: "Biến môi trường và bí mật",
        p: [
          "Mỗi nền tảng cho phép đặt biến môi trường riêng cho production, preview và development. Điểm dễ sai nhất: biến có tiền tố `NEXT_PUBLIC_` (Next.js) hoặc `VITE_` (Vite) được chèn thẳng vào bundle JavaScript lúc build, ai mở DevTools cũng đọc được. Chỉ đặt vào đó giá trị công khai như URL API. Khóa bí mật (API key của bên thứ ba, chuỗi kết nối database) để ở biến không có tiền tố và chỉ đọc trong code chạy trên server (Server Component, Route Handler, Server Action).",
          "Vì biến công khai được chèn lúc build, đổi giá trị trên dashboard xong phải build lại mới có hiệu lực. Với SPA thuần (không có server), đừng quên cấu hình fallback về `index.html` để F5 ở đường dẫn con không bị 404."
        ],
        code: {
          lang: "text", file: "netlify.toml",
          src: `[build]
  command = "npm run build"
  publish = "dist"

# SPA: mọi đường dẫn không khớp file tĩnh đều trả về index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`
        }
      },
      {
        h: "Domain riêng và rollback",
        p: [
          "Để dùng domain riêng, bạn thêm domain trong dashboard của nền tảng rồi tạo bản ghi DNS theo hướng dẫn: subdomain như `app.example.com` thường dùng bản ghi CNAME trỏ tới nền tảng, còn domain gốc `example.com` dùng bản ghi A hoặc ALIAS/ANAME theo giá trị nền tảng cung cấp. Chứng chỉ HTTPS được cấp và gia hạn tự động sau khi DNS trỏ đúng.",
          "Mỗi lần deploy là bất biến (immutable) và được giữ lại, nên khi bản mới lỗi, bạn có thể đưa bản deploy trước đó lên production gần như tức thì thay vì build lại. Hãy biết rõ nút rollback nằm ở đâu trước khi cần tới nó."
        ]
      }
    ],
    summary: [
      "PaaS frontend build từ Git và phục vụ qua CDN; Next.js có phần server cần nền tảng chạy được function.",
      "Mỗi pull request có preview URL riêng để review và chạy e2e.",
      "Biến `NEXT_PUBLIC_`/`VITE_` lộ ra trình duyệt; bí mật chỉ đọc ở server.",
      "Domain riêng cấu hình bằng CNAME/A/ALIAS; HTTPS tự động.",
      "Deploy bất biến nên rollback về bản trước rất nhanh."
    ],
    pitfalls: [
      "Đặt API key bí mật vào biến `NEXT_PUBLIC_` hoặc `VITE_`: khóa bị đóng gói vào bundle và lộ công khai. Chuyển lời gọi đó về server.",
      "Preview deployment trỏ vào database production, test trên PR làm hỏng dữ liệu thật. Tách biến môi trường cho preview.",
      "Đổi biến môi trường trên dashboard rồi thắc mắc vì sao trang không đổi. Biến dùng lúc build cần một lần build lại."
    ],
    quiz: [
      { q: "Biến `NEXT_PUBLIC_API_KEY` trong dự án Next.js sẽ thế nào?", options: ["Chỉ đọc được trong Server Component", "Được chèn vào bundle client, ai cũng đọc được", "Được nền tảng mã hóa trước khi gửi đi", "Bị bỏ qua khi build ở môi trường production"], answer: 1, explain: "Tiền tố NEXT_PUBLIC_ báo Next.js chèn giá trị vào JavaScript gửi xuống trình duyệt. Bí mật phải dùng biến không có tiền tố và chỉ đọc ở server." },
      { q: "Lợi ích chính của preview deployment là gì?", options: ["Thay thế hoàn toàn cho test tự động", "Mỗi PR có URL riêng để xem và test trước khi merge", "Giúp bản production build nhanh hơn", "Tự động sửa lỗi giao diện trong PR"], answer: 1, explain: "Preview cho reviewer, QA xem bản chạy thật của từng PR và có thể chạy e2e nhắm vào URL đó. Nó bổ sung chứ không thay thế test tự động." },
      { q: "Bản deploy mới gây lỗi trên production. Cách phục hồi nhanh nhất trên PaaS thường là gì?", options: ["Sửa code rồi chờ pipeline build lại", "Đưa bản deploy trước đó lên production", "Xóa domain rồi thêm lại từ đầu", "Tắt CDN để người dùng tải trực tiếp"], answer: 1, explain: "Các bản deploy được giữ lại và bất biến, nên đưa bản cũ lên production gần như tức thì. Sửa code và build lại mất nhiều thời gian hơn khi người dùng đang bị ảnh hưởng." }
    ]
  },
  "p02.m2.t7": {
    videos: [
      { id: "sl3vJrgvU-U", title: "Học TypeScript cho React Developer (2024)", channel: "Holetex", lang: "vi", minutes: 39, embed: true },
      { id: "5s6dIkrv6Y4", title: "Learn React Generic Components In 6 Minutes", channel: "Web Dev Simplified", lang: "en", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Kiểu cho props và children",
        p: [
          "TypeScript trong React giúp bắt lỗi ngay khi gõ: quên truyền prop bắt buộc, truyền sai kiểu, gõ nhầm tên prop. Props của component chỉ là tham số đầu tiên của một hàm, nên bạn khai báo kiểu bằng `type` hoặc `interface` như với mọi hàm khác. Prop không bắt buộc đánh dấu `?` và gán giá trị mặc định ngay khi destructuring.",
          "Với `children`, dùng `React.ReactNode`: đây là union của mọi thứ JSX có thể render (chuỗi, số, element, mảng, `null`). `React.ReactElement` hẹp hơn, chỉ nhận JSX element, không nhận chuỗi hay số.",
          "Khi bọc một thẻ HTML như `button` hay `input`, đừng tự liệt kê lại hàng chục thuộc tính. Dùng `ComponentProps<'button'>` để lấy đầy đủ props gốc (kể cả `onClick`, `disabled`, `type`) rồi cộng thêm prop riêng. Dùng `Omit` nếu muốn thay kiểu của một prop có sẵn."
        ],
        code: {
          lang: "tsx",
          file: "src/components/Button.tsx",
          src: `import type { ComponentProps, ReactNode } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost';
  icon?: ReactNode;
};

export function Button({ variant = 'primary', icon, children, className, ...rest }: ButtonProps) {
  return (
    <button className={\`btn btn-\${variant} \${className ?? ''}\`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

// <Button variant="danger" />  -> lỗi kiểu: "danger" không thuộc union variant`
        }
      },
      {
        h: "Event và ref",
        p: [
          "Khi viết handler inline như `onChange={(e) => setQ(e.currentTarget.value)}`, TypeScript tự suy ra kiểu của `e`. Chỉ khi tách handler ra hàm riêng bạn mới cần ghi kiểu, ví dụ `React.ChangeEvent<HTMLInputElement>` hay `React.KeyboardEvent<HTMLInputElement>`. Đọc giá trị qua `currentTarget` vì nó có kiểu đúng là phần tử gắn handler.",
          "Với React 19, `useRef` bắt buộc có đối số. `useRef<HTMLInputElement>(null)` trả về `RefObject<HTMLInputElement | null>`, nên phải kiểm tra `ref.current?.focus()`. Component hàm nhận `ref` như một prop bình thường, không cần `forwardRef` nữa; `ComponentProps<'input'>` đã chứa sẵn prop `ref`. Ref callback không được trả về giá trị ngầm định, vì TypeScript hiểu giá trị trả về là hàm cleanup."
        ],
        code: {
          lang: "tsx",
          file: "src/components/SearchBox.tsx",
          src: `import { useRef, type ChangeEvent, type ComponentProps } from 'react';

type SearchBoxProps = Omit<ComponentProps<'input'>, 'onChange'> & {
  onQueryChange: (query: string) => void;
};

export function SearchBox({ onQueryChange, ref, ...rest }: SearchBoxProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onQueryChange(e.currentTarget.value.trim());
  }
  return <input type="search" ref={ref} onChange={handleChange} {...rest} />;
}

export function ProductFilter() {
  const inputRef = useRef<HTMLInputElement>(null); // RefObject<HTMLInputElement | null>
  return (
    <>
      <SearchBox ref={inputRef} placeholder="Tìm sản phẩm" onQueryChange={console.log} />
      <button onClick={() => inputRef.current?.focus()}>Tìm</button>
    </>
  );
}`
        }
      },
      {
        h: "Custom hook và component generic",
        p: [
          "Custom hook là hàm bình thường nên có thể dùng generic. Hook gọi API nên trả về discriminated union theo `status`: khi đã kiểm tra `status === 'success'`, TypeScript biết chắc `data` tồn tại, không cần `data!`.",
          "Component generic hữu ích cho bảng, danh sách, select dùng chung cho nhiều loại dữ liệu. Kiểu `T` được suy ra từ prop `items`, nên trong `renderItem` bạn có đầy đủ gợi ý thuộc tính. Trong file `.tsx`, arrow function generic phải viết `<T,>` để không bị hiểu nhầm là thẻ JSX; dùng `function` thì không gặp vấn đề này."
        ],
        code: {
          lang: "tsx",
          file: "src/features/orders/OrderList.tsx",
          src: `import { useEffect, useState, type ReactNode } from 'react';

type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetch(url, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<T>; // chỉ là ép kiểu, chưa kiểm tra dữ liệu
      })
      .then((data) => setState({ status: 'success', data }))
      .catch((err: unknown) => {
        if (!ctrl.signal.aborted) setState({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
      });
    return () => ctrl.abort();
  }, [url]);
  return state;
}

type ListProps<T> = { items: T[]; getKey: (item: T) => string | number; renderItem: (item: T) => ReactNode };

export function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
}

type Order = { id: number; total: number };

export function OrderList() {
  const orders = useFetch<Order[]>('/api/orders');
  if (orders.status === 'loading') return <p>Đang tải...</p>;
  if (orders.status === 'error') return <p>{orders.error.message}</p>;
  return <List items={orders.data} getKey={(o) => o.id} renderItem={(o) => <span>#{o.id}: {o.total}đ</span>} />;
}`
        }
      },
      {
        h: "Khi nào để TypeScript tự suy luận",
        p: [
          "Không cần ghi kiểu ở mọi nơi. `useState(false)` đã là `boolean`, `useState('')` đã là `string`; kiểu trả về của component cũng được suy ra từ JSX. Ghi kiểu thừa làm code dài và dễ lệch khi sửa.",
          "Hãy ghi kiểu rõ ràng khi giá trị ban đầu không nói hết: `useState<User | null>(null)`, `useState<Status>('idle')` với `type Status = 'idle' | 'loading' | 'error'`, `createContext<AuthContextValue | null>(null)`, và luôn ghi kiểu cho props, tham số hàm export ra ngoài."
        ]
      }
    ],
    summary: [
      "Khai báo kiểu props bằng type/interface; children dùng React.ReactNode",
      "Bọc thẻ HTML thì mở rộng từ ComponentProps<'button'> thay vì tự liệt kê thuộc tính",
      "React 19: useRef bắt buộc có đối số, ref là prop bình thường, không cần forwardRef cho component mới",
      "Custom hook trả về discriminated union giúp TypeScript thu hẹp kiểu theo status",
      "Để TypeScript tự suy luận khi giá trị ban đầu đủ rõ; ghi kiểu khi có null hoặc union"
    ],
    pitfalls: [
      "Dùng `res.json() as T` rồi tin tuyệt đối vào dữ liệu API; ép kiểu không kiểm tra lúc chạy, nên validate bằng zod hoặc schema khi dữ liệu quan trọng",
      "Viết `useState(null)` rồi gán object sau đó, TypeScript suy ra kiểu `null` và báo lỗi; cần `useState<User | null>(null)`",
      "Viết ref callback dạng `ref={(el) => (node = el)}` bị TypeScript báo lỗi ở React 19 vì trả về giá trị; dùng thân hàm có ngoặc nhọn"
    ],
    quiz: [
      {
        q: "Trong React 19, cách nên dùng để component hàm mới nhận `ref` từ component cha là gì?",
        options: [
          "Bắt buộc bọc component bằng `forwardRef`",
          "Khai báo `ref` như một prop bình thường",
          "Gọi `useImperativeHandle` mà không cần prop",
          "Chuyển component hàm thành class component"
        ],
        answer: 1,
        explain: "Từ React 19, component hàm đọc được `ref` trực tiếp từ props. `forwardRef` vẫn chạy nhưng không cần cho component mới và sẽ bị deprecate trong tương lai."
      },
      {
        q: "Với @types/react 19, `useRef<HTMLInputElement>(null)` trả về kiểu gì?",
        options: [
          "`MutableRefObject<HTMLInputElement>`",
          "`HTMLInputElement | null` trực tiếp",
          "`Ref<HTMLInputElement>` chỉ đọc",
          "`RefObject<HTMLInputElement | null>`"
        ],
        answer: 3,
        explain: "React 19 gộp về một kiểu `RefObject<T>` có `current` ghi được; overload cho đối số `null` trả về `RefObject<T | null>`. `MutableRefObject` đã bị đánh dấu deprecated."
      },
      {
        q: "Kiểu nào phù hợp cho prop `children` cần nhận cả chuỗi, số, JSX và mảng?",
        options: ["`React.ReactNode`", "`React.ReactElement`", "`React.CSSProperties`", "`string | number`"],
        answer: 0,
        explain: "`ReactNode` là union mọi thứ JSX render được. `ReactElement` chỉ nhận JSX element, còn `string | number` bỏ sót element và mảng."
      }
    ]
  },
});
