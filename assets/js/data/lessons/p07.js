/* Nội dung bài học chương p07 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p07.m0.t0": {
    videos: [
      { id: "a1M_thDTqmU", title: "Virtual Machine (VM) vs Docker", channel: "IBM Technology", lang: "en", minutes: 9, embed: true },
      { id: "xfBbLg6-4xY", title: "Tất tần tật về Docker trong 10 phút", channel: "Việt Nguyễn AI", lang: "vi", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "Vì sao cần container?",
        p: [
          "Câu kinh điển \"máy tôi chạy được mà\" xuất hiện vì mỗi máy có phiên bản Node, thư viện hệ thống và cấu hình khác nhau. Container đóng gói ứng dụng cùng toàn bộ phụ thuộc ở tầng user space (thư viện, runtime, file cấu hình) thành một đơn vị chạy giống nhau ở laptop, CI và production.",
          "Máy ảo (VM) cũng giải quyết được vấn đề này, nhưng mỗi VM chạy một hệ điều hành đầy đủ với kernel riêng trên hypervisor. Vì vậy VM nặng hàng GB, khởi động mất hàng chục giây, và mỗi VM chiếm một phần RAM cố định cho OS khách."
        ]
      },
      {
        h: "Container hoạt động thế nào bên trong",
        p: [
          "Container thực chất là một process bình thường trên host Linux, được kernel cô lập bằng hai cơ chế chính. Namespaces khiến process \"nhìn thấy\" một thế giới riêng. Cgroups (control groups) giới hạn lượng tài nguyên process được dùng.",
          "Vì mọi container chia sẻ chung kernel của host, container khởi động gần như tức thì và rất nhẹ. Đổi lại, mức cô lập yếu hơn VM: một lỗ hổng kernel có thể ảnh hưởng mọi container trên host. Trên macOS và Windows, Docker Desktop thực ra chạy một VM Linux nhỏ để có kernel Linux."
        ],
        list: [
          "`pid` namespace: container có cây process riêng, process chính là PID 1.",
          "`net` namespace: network interface, IP, bảng route, port riêng.",
          "`mnt` namespace: hệ thống file gốc riêng (từ image).",
          "`uts`, `ipc`, `user` namespace: hostname, IPC và ánh xạ UID riêng.",
          "cgroups: giới hạn memory, CPU, số process, I/O."
        ]
      },
      {
        h: "Tự kiểm chứng",
        p: [
          "Bạn có thể thấy tận mắt rằng container chỉ là process. Chạy một container rồi xem nó từ bên trong và từ host. Bên trong, process chính có PID 1; từ host, nó là một PID bình thường."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker run -d --name demo --memory 256m nginx:alpine
docker exec demo ps aux          # nginx master là PID 1 trong container
docker top demo                  # cùng process đó nhìn từ host, PID khác
docker exec demo uname -r        # kernel version giống hệt host (hoặc VM của Docker Desktop)
docker inspect demo --format '{{.HostConfig.Memory}}'   # 268435456 = giới hạn cgroup
docker rm -f demo`
        }
      },
      {
        h: "Khi nào chọn cái nào",
        p: [
          "Với backend hiện đại, container là lựa chọn mặc định để đóng gói API, worker, và chạy database khi dev. VM vẫn cần khi bạn muốn cô lập mạnh giữa các khách hàng (multi-tenant không tin cậy), cần kernel hoặc OS khác, hoặc chạy phần mềm cũ. Thực tế thường kết hợp: container chạy trên các VM (EC2, node Kubernetes)."
        ]
      }
    ],
    summary: [
      "Container là process được cô lập, chia sẻ kernel với host; VM có kernel riêng trên hypervisor.",
      "Namespaces cô lập những gì process nhìn thấy; cgroups giới hạn tài nguyên process dùng.",
      "Container nhẹ và khởi động nhanh, nhưng cô lập yếu hơn VM.",
      "Thực tế container thường chạy bên trong VM."
    ],
    pitfalls: [
      "Nghĩ container an toàn như VM rồi chạy code không tin cậy với quyền root: hãy dùng user non-root và cân nhắc sandbox mạnh hơn.",
      "Chạy image Linux trên macOS/Windows và bất ngờ vì hiệu năng bind mount chậm: đó là do có lớp VM ở giữa.",
      "Quên đặt giới hạn memory: một container rò rỉ bộ nhớ có thể làm cạn RAM của cả host."
    ],
    quiz: [
      {
        q: "Cơ chế nào của Linux kernel giới hạn lượng RAM một container được dùng?",
        options: ["Namespaces", "Cgroups", "Union filesystem", "Hypervisor"],
        answer: 1,
        explain: "Cgroups giới hạn và đo tài nguyên (memory, CPU, số process). Namespaces chỉ cô lập những gì process nhìn thấy, union filesystem liên quan đến layer image, còn hypervisor là thành phần của VM."
      },
      {
        q: "Vì sao container khởi động nhanh hơn VM rất nhiều?",
        options: ["Vì container được cấp ổ SSD riêng khi chạy", "Vì container chỉ là process trên kernel có sẵn của host", "Vì image container luôn được nén rất nhỏ", "Vì Docker giữ sẵn container trong RAM"],
        answer: 1,
        explain: "Container là process trên kernel có sẵn của host nên không phải boot OS. Các lựa chọn khác không phải lý do cốt lõi."
      },
      {
        q: "Chạy `uname -r` trong một container Linux trên host Linux sẽ cho kết quả gì?",
        options: ["Kernel version của base image", "Luôn là 'docker'", "Kernel version của host", "Lỗi vì container không có kernel"],
        answer: 2,
        explain: "Container chia sẻ kernel với host nên `uname -r` trả về kernel của host. Base image chỉ cung cấp user space (thư viện, shell), không có kernel riêng."
      }
    ]
  },
  "p07.m0.t1": {
    videos: [
      { id: "tQgpBRfr5EY", title: "What Are Docker Layers Anyway?", channel: "Depot", lang: "en", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Image là gì?",
        p: [
          "Image là một bản mẫu chỉ đọc chứa hệ thống file và metadata (lệnh chạy mặc định, biến môi trường, port, user). Container là một lần chạy của image: Docker thêm một lớp ghi được (writable layer) mỏng lên trên image. Từ một image bạn có thể chạy nhiều container giống nhau.",
          "Image không phải một file khổng lồ duy nhất mà gồm nhiều layer xếp chồng. Mỗi lệnh thay đổi file system trong Dockerfile như `RUN`, `COPY`, `ADD` tạo ra một layer mới chứa phần khác biệt so với layer trước. Các lệnh như `ENV`, `CMD`, `EXPOSE` chỉ thay đổi metadata."
        ]
      },
      {
        h: "Union filesystem và copy-on-write",
        p: [
          "Storage driver (thường là `overlay2`) ghép các layer thành một cây thư mục duy nhất mà container nhìn thấy. Khi container sửa một file có sẵn trong image, file đó được sao chép lên writable layer rồi mới sửa (copy-on-write). Layer gốc không bao giờ thay đổi.",
          "Hệ quả quan trọng: xoá file ở layer sau không làm image nhỏ đi, vì file vẫn nằm ở layer trước. Muốn không có file trong image, phải không tạo ra nó, hoặc tạo và xoá trong cùng một lệnh `RUN`, hoặc dùng multi-stage build."
        ]
      },
      {
        h: "Layer cache",
        p: [
          "Khi build, Docker kiểm tra từng lệnh: nếu lệnh và input (với `COPY` là nội dung file) giống lần trước, layer cũ được dùng lại. Khi một layer thay đổi, mọi layer phía sau phải build lại. Vì thế thứ tự lệnh quyết định tốc độ build.",
          "Các layer giống nhau cũng được chia sẻ giữa nhiều image trên cùng máy và trên registry, nên 10 image dùng chung `node:24-alpine` chỉ lưu base image một lần."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `FROM node:24-alpine
WORKDIR /app
# Layer ít thay đổi đặt trước
COPY package.json package-lock.json ./
RUN npm ci
# Source code thay đổi thường xuyên đặt sau
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]`
        }
      },
      {
        h: "Xem layer của một image",
        p: [
          "Lệnh `docker history` liệt kê từng layer, lệnh tạo ra nó và kích thước. Đây là cách nhanh nhất để tìm layer nào làm image phình to."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker build -t task-api:dev .
docker history task-api:dev
docker image inspect task-api:dev --format '{{json .RootFS.Layers}}'`
        }
      }
    ],
    summary: [
      "Image gồm nhiều layer chỉ đọc; container thêm một writable layer lên trên.",
      "RUN, COPY, ADD tạo layer; ENV, CMD, EXPOSE chỉ đổi metadata.",
      "Copy-on-write: xoá file ở layer sau không giảm kích thước image.",
      "Cache bị vô hiệu từ layer thay đổi trở đi, nên đặt lệnh ít thay đổi lên trước."
    ],
    pitfalls: [
      "Chạy `RUN apt-get install ...` rồi `RUN rm -rf /var/lib/apt/lists/*` ở lệnh riêng: cache apt vẫn nằm trong layer trước. Hãy gộp vào cùng một RUN.",
      "Ghi dữ liệu quan trọng vào writable layer của container: xoá container là mất. Dữ liệu bền phải dùng volume.",
      "COPY toàn bộ source trước khi cài dependency làm mất cache ở mỗi lần sửa code."
    ],
    quiz: [
      {
        q: "Bạn COPY một file 200MB, rồi ở lệnh RUN kế tiếp xoá nó. Kích thước image thay đổi thế nào?",
        options: ["Giảm 200MB vì file đã bị xoá", "Vẫn chứa 200MB vì file còn ở layer COPY", "Không đáng kể vì Docker tự nén layer", "Giảm một nửa nhờ copy-on-write"],
        answer: 1,
        explain: "Layer là bất biến. Lệnh xoá chỉ tạo một whiteout ở layer mới, còn dữ liệu vẫn nằm ở layer COPY. Muốn tránh, dùng multi-stage build hoặc không đưa file vào."
      },
      {
        q: "Khi bạn sửa một file source và build lại Dockerfile ở ví dụ trên, bước nào được lấy từ cache?",
        options: ["Không bước nào, vì context đã thay đổi", "Chỉ bước COPY . . và RUN npm run build", "Các bước từ FROM tới RUN npm ci", "Mọi bước, trừ RUN npm run build"],
        answer: 2,
        explain: "Các lệnh trước `COPY . .` có input không đổi nên dùng cache. Từ `COPY . .` trở đi input thay đổi nên phải build lại."
      },
      {
        q: "Copy-on-write nghĩa là gì trong ngữ cảnh container?",
        options: ["Mọi file của image được chép khi container khởi động", "File chỉ được chép lên lớp ghi khi container sửa nó", "Container ghi trực tiếp vào layer gốc của image", "Docker chụp snapshot container sau mỗi lần ghi"],
        answer: 1,
        explain: "Chỉ khi cần sửa, file mới được chép lên lớp ghi được. Nhờ vậy nhiều container dùng chung một image mà không tốn thêm dung lượng."
      }
    ]
  },
  "p07.m0.t2": {
    videos: [
      { id: "jC6J2-YJxbk", title: "Docker Concepts: What is a Registry?", channel: "Docker", lang: "en", minutes: 2, embed: true }
    ],
    sections: [
      {
        h: "Registry lưu trữ và phân phối image",
        p: [
          "Registry là máy chủ lưu image, giống npm registry nhưng dành cho container. Pipeline CI build image rồi push lên registry; server production, ECS hay Kubernetes pull image từ đó về chạy. Các registry phổ biến: Docker Hub (mặc định), GitHub Container Registry (GHCR, `ghcr.io`), Amazon ECR, Google Artifact Registry.",
          "Tên image đầy đủ có dạng `registry/namespace/repository:tag`. Khi bạn viết `postgres:18-alpine`, Docker hiểu là `docker.io/library/postgres:18-alpine`."
        ]
      },
      {
        h: "Push, pull và xác thực",
        p: [
          "Trước khi push lên registry riêng, bạn cần đăng nhập. Với GHCR, dùng Personal Access Token có quyền `write:packages`, hoặc `GITHUB_TOKEN` trong GitHub Actions. Với ECR, lệnh `aws ecr get-login-password` sinh mật khẩu tạm thời."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Đăng nhập GHCR (token đọc từ stdin, không lộ trong lịch sử shell)
echo "$GHCR_TOKEN" | docker login ghcr.io -u my-user --password-stdin

TAG=$(git rev-parse --short HEAD)
docker tag task-api:dev ghcr.io/my-org/task-api:$TAG
docker push ghcr.io/my-org/task-api:$TAG

# Xem digest của image vừa push
docker buildx imagetools inspect ghcr.io/my-org/task-api:$TAG`
        }
      },
      {
        h: "Tag có thể đổi, digest thì không",
        p: [
          "Tag chỉ là một nhãn trỏ tới image và có thể bị ghi đè: hôm nay `node:24-alpine` trỏ tới bản này, tuần sau trỏ tới bản vá mới. Digest là hash `sha256:...` của manifest image, xác định chính xác nội dung. Cùng một digest thì chắc chắn cùng nội dung.",
          "Khi cần tái lập tuyệt đối (production, base image trong Dockerfile), bạn có thể pin theo digest. Đánh đổi là phải chủ động cập nhật digest để nhận bản vá bảo mật; công cụ như Dependabot hoặc Renovate có thể tự mở PR cập nhật."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `# Pin theo digest: tag để người đọc hiểu, digest để đảm bảo bất biến
FROM node:24-alpine@sha256:<digest-lay-tu-registry>`
        }
      },
      {
        h: "Registry công khai hay riêng?",
        p: [
          "Image ứng dụng của công ty nên để ở registry riêng (private) gần nơi deploy, ví dụ ECR cùng region với ECS để pull nhanh và không tốn phí truyền dữ liệu ra ngoài. Docker Hub có giới hạn số lần pull cho người dùng ẩn danh, nên CI pull nhiều nên đăng nhập hoặc dùng mirror/pull-through cache."
        ]
      }
    ],
    summary: [
      "Registry lưu và phân phối image; CI push, môi trường chạy pull.",
      "Tên đầy đủ: registry/namespace/repo:tag; mặc định là docker.io.",
      "Tag có thể bị ghi đè; digest sha256 là định danh bất biến của nội dung.",
      "Dùng --password-stdin và token có quyền tối thiểu khi đăng nhập."
    ],
    pitfalls: [
      "Truyền mật khẩu bằng `-p` trên dòng lệnh: lộ trong lịch sử shell và log CI. Dùng `--password-stdin`.",
      "Deploy bằng tag có thể bị ghi đè rồi không biết production đang chạy bản nào. Hãy ghi lại digest hoặc dùng tag bất biến theo git SHA.",
      "Không kiểm tra visibility của package GHCR sau lần push đầu: package mới thường mặc định là private (tuỳ cách liên kết với repository và cấu hình của tổ chức), nên server deploy cần token có quyền `read:packages`; ngược lại, nếu ai đó chuyển package sang public thì image nội bộ bị lộ."
    ],
    quiz: [
      {
        q: "Điều gì đảm bảo hai lần pull cho ra đúng cùng một nội dung image?",
        options: ["Cùng tên tag", "Cùng digest sha256", "Cùng tên repository", "Cùng thời điểm build"],
        answer: 1,
        explain: "Digest là hash nội dung nên bất biến. Tag có thể bị trỏ sang image khác bất kỳ lúc nào."
      },
      {
        q: "`docker pull redis:8-alpine` thực chất kéo image từ đâu?",
        options: ["ghcr.io/redis/redis:8-alpine", "docker.io/library/redis:8-alpine", "localhost/library/redis:8-alpine", "quay.io/redis/redis:8-alpine"],
        answer: 1,
        explain: "Không ghi registry thì mặc định là Docker Hub (docker.io), và image chính thức nằm trong namespace `library`."
      },
      {
        q: "Cách đăng nhập registry an toàn nhất trong script CI là gì?",
        options: ["docker login -u user -p \"$TOKEN\"", "Ghi token vào Dockerfile bằng ENV", "echo \"$TOKEN\" | docker login -u user --password-stdin", "Lưu token trong file .env commit vào repo"],
        answer: 2,
        explain: "`--password-stdin` không đưa secret vào tham số dòng lệnh nên không lộ qua lịch sử hay danh sách process. Ghi vào Dockerfile là nhúng secret vào image."
      }
    ]
  },
  "p07.m0.t3": {
    videos: [
      { id: "21onkZfL2yM", title: "Docker vs Containerd: Understanding the Differences and Choosing the Right Containerization Tool", channel: "KodeKloud", lang: "en", minutes: 14, embed: true }
    ],
    sections: [
      {
        h: "OCI: tiêu chuẩn chung cho container",
        p: [
          "Open Container Initiative (OCI) là tổ chức định nghĩa các tiêu chuẩn mở để container không bị khoá vào một công cụ. Có ba đặc tả chính: Image Spec (định dạng image và manifest), Runtime Spec (cách chạy một container từ một bundle file system và config), và Distribution Spec (API để push/pull với registry).",
          "Nhờ OCI, image bạn build bằng Docker có thể chạy trên Kubernetes với containerd, trên Podman, hay được build bằng Buildah, Kaniko mà không cần chuyển đổi."
        ]
      },
      {
        h: "Các tầng bên dưới lệnh docker run",
        p: [
          "Docker không phải một khối duy nhất. Khi bạn gõ `docker run`, yêu cầu đi qua nhiều thành phần, mỗi thành phần có một nhiệm vụ rõ ràng."
        ],
        list: [
          "Docker CLI: gửi yêu cầu qua API tới daemon `dockerd`.",
          "dockerd: quản lý image, network, volume, build; giao việc chạy container cho containerd.",
          "containerd: high-level runtime, quản lý vòng đời container, pull và lưu image.",
          "containerd-shim: giữ container sống độc lập với containerd, nên khởi động lại daemon không giết container.",
          "runc: low-level runtime theo OCI Runtime Spec, gọi kernel để tạo namespaces, cgroups rồi thoát."
        ]
      },
      {
        h: "Kubernetes không cần Docker",
        p: [
          "Kubernetes giao tiếp với runtime qua CRI (Container Runtime Interface). Từ Kubernetes 1.24, thành phần dockershim bị gỡ bỏ, nên cluster thường dùng containerd hoặc CRI-O trực tiếp. Điều này không ảnh hưởng image của bạn: image Docker build vẫn là image OCI và chạy bình thường.",
          "Trên node Kubernetes, bạn debug bằng `crictl` thay cho `docker`. Trên máy dev, Podman là lựa chọn không cần daemon và chạy rootless, với cú pháp gần giống Docker."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker info --format '{{.DefaultRuntime}}'   # thường là runc
docker buildx imagetools inspect node:24-alpine  # xem manifest list (OCI index)

# Trên node Kubernetes dùng containerd
sudo crictl ps
sudo crictl images`
        }
      },
      {
        h: "Ý nghĩa thực tế với backend engineer",
        p: [
          "Bạn không cần thao tác trực tiếp với runc hay containerd hằng ngày. Nhưng hiểu các tầng này giúp bạn đọc log lỗi của Kubernetes (ví dụ lỗi từ runtime khi tạo container), chọn công cụ build trong CI không có Docker daemon, và không bị hoang mang khi nghe \"Kubernetes bỏ Docker\"."
        ]
      }
    ],
    summary: [
      "OCI định nghĩa chuẩn image, runtime và distribution.",
      "Luồng chạy: docker CLI → dockerd → containerd → shim → runc → kernel.",
      "Kubernetes dùng CRI với containerd/CRI-O; image Docker vẫn chạy được vì là image OCI.",
      "Podman, Buildah, Kaniko là các công cụ khác tuân chuẩn OCI."
    ],
    pitfalls: [
      "Nghĩ rằng phải cài Docker trên node Kubernetes để chạy image: runtime là containerd/CRI-O, không cần Docker.",
      "Mount `/var/run/docker.sock` vào container CI để build: cho container đó toàn quyền trên host. Cân nhắc builder rootless hoặc BuildKit riêng.",
      "Dùng `docker` trên node Kubernetes để debug rồi không thấy container: dùng `crictl`."
    ],
    quiz: [
      {
        q: "Thành phần nào trực tiếp gọi kernel để tạo namespaces và cgroups cho container?",
        options: ["Docker CLI", "dockerd", "runc", "containerd-shim"],
        answer: 2,
        explain: "runc là low-level runtime theo OCI Runtime Spec, thực hiện việc tạo container ở tầng kernel. CLI và dockerd chỉ điều phối."
      },
      {
        q: "Khi Kubernetes gỡ dockershim, image build bằng Docker có còn chạy được không?",
        options: ["Không, phải build lại bằng Podman hoặc Buildah", "Có, vì image Docker build ra theo chuẩn OCI", "Chỉ khi cài thêm Docker Engine trên mỗi node", "Chỉ khi image được chuyển đổi sang định dạng CRI"],
        answer: 1,
        explain: "Image Docker là image OCI, containerd và CRI-O đều chạy được. Chỉ cách Kubernetes nói chuyện với runtime thay đổi."
      },
      {
        q: "Vai trò của OCI Distribution Spec là gì?",
        options: ["Định nghĩa cú pháp của Dockerfile", "Định nghĩa API push/pull với registry", "Định nghĩa cách giới hạn CPU và RAM", "Định nghĩa định dạng file Compose"],
        answer: 1,
        explain: "Distribution Spec chuẩn hoá API registry. Dockerfile và Compose không thuộc OCI; giới hạn CPU là việc của runtime/cgroups."
      }
    ]
  },
  "p07.m1.t0": {
    videos: [
      { id: "T5MHC7WeU5Y", title: "Intern đánh bại Senior: Làm thế nào tối ưu Docker? Và cái kết là Docker image từ 500MB xuống 100MB", channel: "Tips Javascript", lang: "vi", minutes: 15, embed: true },
      { id: "t779DVjCKCs", title: "Docker Image BEST Practices - From 1.2GB to 10MB", channel: "Better Stack", lang: "en", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Vấn đề của Dockerfile một stage",
        p: [
          "Để build một ứng dụng NestJS bạn cần TypeScript compiler, Nest CLI, type definitions, công cụ test... tức là toàn bộ devDependencies. Nhưng khi chạy production, bạn chỉ cần thư mục `dist` đã biên dịch và các production dependency. Nếu dùng một stage duy nhất, image cuối chứa cả source TypeScript, devDependencies và cache npm, dễ nặng vài trăm MB.",
          "Image nặng làm pull chậm hơn khi scale, tốn dung lượng registry, và có bề mặt tấn công lớn hơn: mỗi package thừa là một nguồn CVE tiềm năng mà trình quét sẽ báo."
        ]
      },
      {
        h: "Multi-stage build hoạt động thế nào",
        p: [
          "Một Dockerfile có thể có nhiều lệnh `FROM`, mỗi lệnh bắt đầu một stage mới và có thể đặt tên bằng `AS`. Stage sau dùng `COPY --from=<stage>` để lấy đúng những file cần từ stage trước. Chỉ stage cuối cùng (hoặc stage chỉ định bằng `--target`) trở thành image kết quả; các stage trung gian bị bỏ lại.",
          "BuildKit còn tự bỏ qua những stage mà target không phụ thuộc vào, và build song song các stage độc lập."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `# syntax=docker/dockerfile:1
ARG NODE_VERSION=24

FROM node:\${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:\${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]`
        }
      },
      {
        h: "Giải thích từng stage",
        list: [
          "`deps`: chỉ copy file khai báo dependency rồi `npm ci`, nên được cache cho tới khi package-lock thay đổi.",
          "`build`: copy source, biên dịch ra `dist`, rồi `npm prune --omit=dev` để xoá devDependencies khỏi node_modules.",
          "`runtime`: bắt đầu lại từ base image sạch, chỉ nhận `node_modules` production và `dist`. Không có source TypeScript, không có compiler.",
          "`--chown=node:node` và `USER node` để ứng dụng không chạy bằng root."
        ],
        p: [
          "Bạn cũng có thể dùng target để tái sử dụng Dockerfile cho mục đích khác. Ví dụ trong Compose dev, service api dùng `target: build` để có đủ công cụ chạy `npm run start:dev` với hot reload."
        ]
      },
      {
        h: "Build và so sánh",
        p: [
          "Hãy build cả hai phiên bản và so sánh kích thước. Với một API NestJS điển hình trên alpine, image runtime thường nhỏ hơn đáng kể so với bản một stage; con số cụ thể phụ thuộc số dependency của bạn."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker build -t task-api:runtime .
docker build --target build -t task-api:build .
docker image ls task-api`
        }
      }
    ],
    summary: [
      "Mỗi FROM mở một stage; chỉ stage cuối (hoặc --target) thành image.",
      "COPY --from lấy đúng artifact cần từ stage trước.",
      "Stage runtime không chứa source, compiler, devDependencies.",
      "Image nhỏ hơn thì pull nhanh hơn và ít CVE hơn."
    ],
    pitfalls: [
      "Quên `npm prune --omit=dev` hoặc cài lại dependency ở stage runtime mà không có `--omit=dev`: devDependencies lọt vào image.",
      "Copy cả `/app` từ stage build sang runtime: kéo theo source và file thừa, mất lợi ích multi-stage.",
      "Dùng base khác nhau giữa stage build và runtime (glibc vs musl) khiến native module như `bcrypt` biên dịch ở stage build không chạy được ở runtime."
    ],
    quiz: [
      {
        q: "Trong multi-stage build, image kết quả chứa gì?",
        options: ["Layer của mọi stage, xếp chồng theo thứ tự", "Layer của stage cuối hoặc stage chọn bằng --target", "Layer của stage đầu tiên cộng file được COPY --from", "Layer của stage có nhiều lệnh RUN nhất"],
        answer: 1,
        explain: "Các stage trung gian chỉ dùng để tạo artifact. Image cuối là stage được chọn làm target, mặc định là stage cuối cùng."
      },
      {
        q: "Vì sao stage runtime bắt đầu bằng một FROM mới thay vì FROM build?",
        options: ["Để stage runtime build song song nhanh hơn", "Để không kế thừa source, compiler, devDependencies", "Vì Docker không cho FROM một stage đã đặt tên", "Vì lệnh USER chỉ dùng được sau FROM image gốc"],
        answer: 1,
        explain: "FROM build sẽ kế thừa mọi layer của stage build, gồm cả những thứ không cần khi chạy. Bắt đầu lại từ base giúp image gọn."
      },
      {
        q: "Lệnh `docker build --target build .` dùng để làm gì?",
        options: ["Build tới stage tên build và lấy nó làm image", "Build toàn bộ rồi push stage build lên registry", "Build mọi stage trừ stage tên build", "Gắn tag build cho image của stage cuối"],
        answer: 0,
        explain: "`--target` chọn stage làm image kết quả. Thường dùng để tạo image dev hoặc image chạy test từ cùng một Dockerfile."
      }
    ]
  },
  "p07.m1.t1": {
    videos: [
      { id: "_nMpndIyaBU", title: "Docker Crash Course #8 - Layer Caching", channel: "Net Ninja", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Cache quyết định tốc độ build",
        p: [
          "Mỗi lần build, Docker duyệt lệnh từ trên xuống. Với `COPY`, cache key dựa vào checksum nội dung các file được copy. Với `RUN`, cache key là chuỗi lệnh cùng layer cha. Ngay khi một lệnh không khớp cache, mọi lệnh sau đều chạy lại.",
          "`npm ci` với vài trăm package có thể mất cả phút. Nếu bạn `COPY . .` trước khi `npm ci`, chỉ cần sửa một dòng trong `src/` là toàn bộ dependency bị cài lại. Đó là lỗi phổ biến nhất khiến CI chậm."
        ]
      },
      {
        h: "Sắp xếp lệnh theo tần suất thay đổi",
        p: [
          "Nguyên tắc: thứ ít thay đổi đặt trên, thứ hay thay đổi đặt dưới. `package.json` và `package-lock.json` chỉ đổi khi thêm hoặc nâng cấp thư viện, còn source code đổi mỗi commit."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `FROM node:24-alpine AS deps
WORKDIR /app
# 1. Chỉ file khai báo dependency
COPY package.json package-lock.json ./
# 2. Cache mount giữ thư mục cache npm giữa các lần build
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS build
# 3. Source code: thay đổi thường xuyên
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build`
        }
      },
      {
        h: ".dockerignore: thu nhỏ build context",
        p: [
          "Trước khi build, Docker gửi build context (thư mục bạn chỉ định, thường là `.`) cho builder. Nếu context chứa `node_modules`, `.git`, `coverage`, build vừa chậm vừa có nguy cơ copy nhầm vào image. `node_modules` trên máy dev còn có thể chứa native binary sai kiến trúc so với container.",
          "File `.dockerignore` loại bỏ các đường dẫn này khỏi context, đồng thời giúp `COPY . .` không vô tình làm mất cache vì file log hay file tạm thay đổi."
        ],
        code: {
          lang: "text",
          file: ".dockerignore",
          src: `node_modules
dist
.git
.env*
coverage
*.log
Dockerfile*
docker-compose*`
        }
      },
      {
        h: "Kiểm tra cache có hoạt động",
        p: [
          "Sửa một file `.ts` rồi build lại. Trong output của BuildKit, các bước deps phải hiện `CACHED`. Trong CI, runner thường là máy mới nên không có cache cục bộ; bạn cần cache từ ngoài như `--cache-from type=gha` hoặc `type=registry` (xem bài BuildKit)."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker build -t task-api:dev .
echo "// touch" >> src/main.ts
docker build --progress=plain -t task-api:dev . 2>&1 | grep -E "CACHED|npm ci"`
        }
      }
    ],
    summary: [
      "Cache bị phá từ lệnh đầu tiên có input thay đổi trở xuống.",
      "COPY package*.json → npm ci → COPY source → build.",
      ".dockerignore giảm build context, tránh lọt secret và node_modules của host.",
      "Cache mount giữ cache npm giữa các lần build mà không nằm trong image.",
      "CI cần cache ngoài (gha, registry) vì runner không giữ cache."
    ],
    pitfalls: [
      "Dùng `npm install` thay `npm ci` trong image: kết quả có thể khác lockfile. `npm ci` cài đúng theo lockfile và báo lỗi nếu không khớp.",
      "Thiếu `.dockerignore` nên `node_modules` từ macOS/Windows bị copy vào image Linux, gây lỗi native module.",
      "Đặt `ARG` hoặc `ENV` có giá trị thay đổi mỗi lần build (như build time) ở đầu Dockerfile: với `ENV` mọi layer sau mất cache; với `ARG`, cache miss từ lệnh đầu tiên dùng nó, mà mọi lệnh `RUN` sau `ARG` đều ngầm nhận nó như biến môi trường. Khai báo các giá trị này càng gần cuối càng tốt."
    ],
    quiz: [
      {
        q: "Thứ tự nào tận dụng cache tốt nhất cho dự án Node?",
        options: ["COPY . . → npm ci → COPY package*.json → build", "COPY package*.json → npm ci → COPY source → build", "npm ci → COPY package*.json → COPY source → build", "COPY source → COPY package*.json → npm ci → build"],
        answer: 1,
        explain: "Dependency chỉ cài lại khi file khai báo thay đổi. Các thứ tự khác làm npm ci chạy lại mỗi lần sửa code hoặc không chạy được."
      },
      {
        q: "Ngoài tăng tốc, .dockerignore còn giúp gì?",
        options: ["Mã hoá các layer của image khi push", "Ngăn file như .env lọt vào context và image", "Giới hạn RAM mà builder dùng khi build", "Loại file khỏi image đã build trước đó"],
        answer: 1,
        explain: "File bị ignore không được gửi cho builder nên không thể bị COPY vào image."
      },
      {
        q: "Vì sao build trên CI thường không thấy CACHED dù Dockerfile tối ưu?",
        options: ["Vì runner CI không hỗ trợ BuildKit", "Vì runner thường là máy mới, chưa có cache cục bộ", "Vì base alpine không lưu được layer cache", "Vì BuildKit tắt cache khi biến CI=true"],
        answer: 1,
        explain: "Cache lưu trên máy build. Runner ephemeral cần import/export cache qua gha hoặc registry."
      }
    ]
  },
  "p07.m1.t2": {
    videos: [
      { id: "8vXoMqWgbQQ", title: "Top 8 Docker Best Practices for using Docker in Production", channel: "TechWorld with Nana", lang: "en", minutes: 18, embed: true }
    ],
    sections: [
      {
        h: "Chọn base image tối giản",
        p: [
          "Mỗi package có trong image là thứ có thể có lỗ hổng. Base image càng ít thành phần thì càng ít CVE, pull càng nhanh. Có ba lựa chọn phổ biến cho Node:"
        ],
        list: [
          "`node:24-slim`: Debian rút gọn, dùng glibc, tương thích tốt nhất với native module.",
          "`node:24-alpine`: rất nhỏ, dùng musl libc. Hầu hết package chạy tốt, nhưng một số native module cần build lại hoặc gặp khác biệt hành vi.",
          "Distroless (họ image `gcr.io/distroless/nodejs...` của Google): không có shell, không có package manager. Bề mặt tấn công nhỏ nhất nhưng debug khó hơn vì không `exec` vào shell được."
        ]
      },
      {
        h: "Không chạy bằng root",
        p: [
          "Mặc định process trong container chạy với UID 0. Nếu kẻ tấn công khai thác được lỗ hổng trong ứng dụng, họ có quyền root trong container, dễ ghi đè file và dễ leo thang hơn nếu có lỗ hổng runtime. Image `node` chính thức có sẵn user `node` (UID 1000), bạn chỉ cần `USER node` và cấp quyền file đúng bằng `--chown`.",
          "Trên Linux truyền thống, user thường không bind được port dưới 1024 (privileged port). Docker Engine từ 20.10 đặt sysctl `net.ipv4.ip_unprivileged_port_start=0` trong container nên non-root vẫn bind được port 80, nhưng không phải runtime hay cluster nào cũng cấu hình như vậy. Quy ước an toàn và dễ mang đi là để API nghe port cao như 3000 rồi ánh xạ ra ngoài."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]`
        }
      },
      {
        h: "Không nhúng secret vào image",
        p: [
          "Mọi thứ đi qua `COPY`, `ARG`, `ENV` đều có thể đọc lại được từ image, kể cả khi bạn xoá ở layer sau. `docker history` hiển thị giá trị ARG đã dùng trong lệnh RUN. Ai pull được image là đọc được secret.",
          "Secret như `DATABASE_URL`, `JWT_SECRET` phải được truyền lúc chạy: biến môi trường từ orchestrator, Docker secrets, hoặc secret manager như AWS Secrets Manager. Nếu cần secret lúc build (token npm private), dùng BuildKit secret mount."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Kiểm tra image của bạn
docker run --rm task-api:dev whoami              # phải là node
docker history --no-trunc task-api:dev | grep -iE "token|secret|password"

# Truyền secret lúc chạy, không lúc build
docker run -d --env-file .env.production task-api:dev`
        }
      },
      {
        h: "Siết thêm khi chạy",
        p: [
          "Ngoài Dockerfile, bạn có thể giảm quyền lúc chạy: `--read-only` làm root filesystem chỉ đọc (kèm `--tmpfs /tmp` nếu cần ghi tạm), `--cap-drop ALL` bỏ Linux capabilities không cần, `--security-opt no-new-privileges` chặn leo quyền qua setuid. Kubernetes có các trường tương ứng trong `securityContext`."
        ]
      }
    ],
    summary: [
      "Base tối giản (slim, alpine, distroless) giảm CVE và kích thước.",
      "Luôn USER non-root; image node có sẵn user node.",
      "Secret không bao giờ nằm trong COPY/ARG/ENV của image.",
      "Truyền secret lúc runtime; dùng secret mount nếu cần lúc build.",
      "Có thể siết thêm bằng read-only, cap-drop, no-new-privileges."
    ],
    pitfalls: [
      "COPY cả thư mục project có file `.env` vào image: thêm `.env*` vào .dockerignore.",
      "Dùng `ARG NPM_TOKEN` để cài package private: token hiện trong `docker history`. Dùng `RUN --mount=type=secret`.",
      "Đổi sang distroless rồi healthcheck dùng `wget`/`curl` bị lỗi vì image không có công cụ đó: viết healthcheck bằng chính Node hoặc để orchestrator kiểm tra qua HTTP."
    ],
    quiz: [
      {
        q: "Vì sao không nên truyền secret qua ARG khi build?",
        options: ["Vì ARG không nhận ký tự đặc biệt trong token", "Vì giá trị có thể lộ qua history của image", "Vì ARG làm mất toàn bộ cache của build", "Vì ARG chỉ dùng được trong lệnh FROM"],
        answer: 1,
        explain: "Giá trị ARG dùng trong RUN được ghi lại trong lịch sử build, ai có image đều xem được. Dùng secret mount của BuildKit."
      },
      {
        q: "Nhược điểm chính của distroless image là gì?",
        options: ["Phải tự cài Node bằng apt khi build", "Không có shell nên khó exec vào debug", "Chỉ chạy được Node bản LTS cũ", "Không có user nào khác ngoài root"],
        answer: 1,
        explain: "Distroless bỏ shell và package manager để giảm bề mặt tấn công, đánh đổi là debug khó hơn. Nó vẫn chạy Node và có user nonroot."
      },
      {
        q: "Sau khi thêm `USER node`, ứng dụng báo `EACCES` khi bind port 80 trên một runtime không cho non-root dùng privileged port. Cách xử lý hợp lý?",
        options: ["Bỏ USER node, quay lại chạy bằng root", "Nghe port 3000 trong container và map ra ngoài", "Tắt firewall trên host đang chạy container", "Xoá lệnh EXPOSE 80 khỏi Dockerfile"],
        answer: 1,
        explain: "Port dưới 1024 cần quyền đặc biệt trừ khi runtime hạ ngưỡng `ip_unprivileged_port_start` (Docker 20.10+ làm vậy, nhiều nơi khác thì không). Nghe port cao trong container rồi map ra ngoài (ví dụ -p 80:3000) chạy được ở mọi nơi. EXPOSE chỉ là metadata, không ảnh hưởng việc bind."
      }
    ]
  },
  "p07.m1.t3": {
    sections: [
      {
        h: "Container nhận tín hiệu dừng như thế nào",
        p: [
          "Khi bạn `docker stop` hoặc Kubernetes xoá Pod, runtime gửi SIGTERM tới PID 1 trong container, chờ một khoảng (mặc định 10 giây với Docker, `terminationGracePeriodSeconds` 30 giây với Kubernetes), rồi gửi SIGKILL. Ứng dụng cần nhận SIGTERM để graceful shutdown: ngừng nhận request, xử lý nốt request dở, đóng kết nối DB.",
          "PID 1 trong Linux có đặc điểm riêng: kernel không áp dụng hành vi mặc định cho tín hiệu mà PID 1 không đăng ký handler. Và PID 1 có trách nhiệm dọn process con zombie."
        ]
      },
      {
        h: "Dạng exec và dạng shell của CMD",
        p: [
          "`CMD npm start` (dạng shell) thực chất chạy `/bin/sh -c \"npm start\"`. PID 1 là shell, không phải Node. Tuỳ shell, SIGTERM có thể không được chuyển tới Node, container bị treo tới khi hết thời gian chờ rồi bị SIGKILL. Chạy qua `npm start` còn thêm một tầng process nữa.",
          "Dạng exec `CMD [\"node\", \"dist/main.js\"]` chạy trực tiếp Node làm PID 1, tín hiệu tới thẳng ứng dụng. Nhưng nhớ đặc điểm PID 1 ở trên: Node mặc định không đăng ký handler cho SIGTERM, nên nếu code của bạn không tự bắt SIGTERM (ví dụ NestJS chưa gọi `app.enableShutdownHooks()`), tín hiệu bị bỏ qua và container vẫn chờ tới SIGKILL. Để an toàn hơn, dùng init nhỏ như `tini` làm PID 1: nó chuyển tiếp tín hiệu và dọn zombie. Có thể thêm tini trong image hoặc dùng cờ `docker run --init`. Khi Node không còn là PID 1, SIGTERM không bị bỏ qua nữa: không có handler thì Node thoát ngay (không graceful), có handler thì code shutdown của bạn được chạy."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `FROM node:24-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \\
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]`
        }
      },
      {
        h: "HEALTHCHECK cho biết container có thực sự khỏe",
        p: [
          "Process còn sống chưa chắc ứng dụng còn phục vụ được (ví dụ event loop bị treo, mất kết nối DB). `HEALTHCHECK` chạy lệnh định kỳ trong container; exit code 0 là healthy, 1 là unhealthy. Trạng thái hiện ở cột STATUS của `docker ps` và được Compose dùng cho `depends_on: condition: service_healthy`.",
          "Lưu ý: Kubernetes bỏ qua HEALTHCHECK trong Dockerfile và dùng liveness/readiness probe riêng. Endpoint `/health` bạn viết vẫn dùng chung cho cả hai."
        ]
      },
      {
        h: "Kiểm chứng",
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker run -d --name api -p 3000:3000 task-api:dev
docker ps --filter name=api          # chờ STATUS hiện (healthy)
time docker stop api                 # nên dừng trong 1-2 giây, không phải 10 giây
docker inspect api --format '{{.State.ExitCode}}'`
        },
        p: [
          "Nếu `docker stop` luôn mất đúng khoảng 10 giây, gần như chắc chắn SIGTERM không tới được ứng dụng và container bị SIGKILL."
        ]
      }
    ],
    summary: [
      "docker stop gửi SIGTERM tới PID 1, hết thời gian chờ thì SIGKILL.",
      "Dùng CMD dạng exec; tránh dạng shell và npm start làm PID 1.",
      "tini (hoặc --init) chuyển tiếp tín hiệu và dọn zombie.",
      "HEALTHCHECK dùng cho Docker/Compose; Kubernetes dùng probe riêng."
    ],
    pitfalls: [
      "`CMD npm run start:prod` trong production: tín hiệu có thể không tới Node, mất graceful shutdown.",
      "Healthcheck gọi dịch vụ ngoài (DB, API bên thứ ba) khiến container bị đánh dấu unhealthy khi phụ thuộc chập chờn: tách liveness (process còn sống) và readiness (sẵn sàng nhận traffic).",
      "Healthcheck dùng `curl` trong image alpine không cài curl: alpine có sẵn `wget` của BusyBox, hoặc tự cài công cụ cần dùng."
    ],
    quiz: [
      {
        q: "Với `CMD npm start`, PID 1 trong container là gì?",
        options: ["node", "/bin/sh", "tini", "dockerd"],
        answer: 1,
        explain: "Dạng shell được bọc trong `/bin/sh -c`, nên PID 1 là shell. Node là process con và có thể không nhận được SIGTERM."
      },
      {
        q: "`docker stop` luôn mất khoảng 10 giây. Nguyên nhân khả dĩ nhất?",
        options: ["Image quá lớn nên gỡ layer chậm", "SIGTERM không được xử lý nên chờ tới SIGKILL", "Thiếu EXPOSE nên Docker không đóng được port", "Healthcheck chạy quá dày chặn lệnh stop"],
        answer: 1,
        explain: "10 giây là thời gian chờ mặc định trước SIGKILL. Dừng đúng mốc đó nghĩa là tín hiệu không được xử lý."
      },
      {
        q: "Kubernetes xử lý HEALTHCHECK trong Dockerfile thế nào?",
        options: ["Tự dùng nó làm liveness probe", "Bỏ qua, chỉ dùng probe khai báo trong Pod", "Tự chuyển nó thành readiness probe", "Từ chối deploy image có HEALTHCHECK"],
        answer: 1,
        explain: "Kubernetes không dùng HEALTHCHECK của image; bạn khai báo probe trong spec của Pod."
      }
    ]
  },
  "p07.m1.t4": {
    sections: [
      {
        h: "Vấn đề của tag latest",
        p: [
          "`latest` không có nghĩa là \"mới nhất\"; nó chỉ là tag mặc định khi bạn không ghi tag. Nếu deploy bằng `task-api:latest`, bạn không biết production đang chạy code của commit nào. Hai node pull ở hai thời điểm có thể chạy hai phiên bản khác nhau. Rollback cũng không làm được vì \"bản trước\" của latest đã bị ghi đè.",
          "Ngoài ra, Kubernetes mặc định `imagePullPolicy: Always` với tag latest, còn với tag khác là `IfNotPresent`, làm hành vi khó đoán hơn."
        ]
      },
      {
        h: "Tag theo git SHA: bất biến và truy vết được",
        p: [
          "Chiến lược phổ biến là tag mỗi image bằng git commit SHA (dạng ngắn hoặc đầy đủ). Một SHA ứng với đúng một trạng thái code, nên từ image bạn truy ngược được commit, PR và người thay đổi. Quy ước quan trọng: tag SHA không bao giờ bị ghi đè. Nhiều registry như ECR hỗ trợ bật tag immutability để cưỡng chế điều này.",
          "Cùng một image SHA đi từ staging lên production. Bạn không build lại cho production, nhờ vậy thứ đã test chính là thứ chạy thật."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `SHA=$(git rev-parse --short HEAD)
IMAGE=ghcr.io/my-org/task-api
docker build -t $IMAGE:$SHA .
docker push $IMAGE:$SHA

# Khi phát hành, gắn thêm tag semver cho cùng image (không build lại)
docker buildx imagetools create -t $IMAGE:1.4.0 $IMAGE:$SHA`
        }
      },
      {
        h: "Semver cho bản phát hành",
        p: [
          "Semver (`1.4.0`) dễ đọc với con người và phù hợp khi image được người khác dùng, ví dụ thư viện hoặc sản phẩm tự host. Có thể thêm tag trượt `1.4` và `1` để người dùng nhận bản vá tự động, nhưng deploy nội bộ vẫn nên dùng tag bất biến.",
          "Trong GitHub Actions, `docker/metadata-action` sinh tag tự động từ SHA, branch và git tag, giúp tránh viết script thủ công."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml (trích)",
          src: `- id: meta
  # Thực tế nên pin theo commit SHA (xem Lab 03)
  uses: docker/metadata-action@dc802804100637a589fabce1cb79ff13a1411302 # v6.2.0
  with:
    images: ghcr.io/\${{ github.repository }}
    tags: |
      type=sha,format=short,prefix=
      type=semver,pattern={{version}}`
        }
      },
      {
        h: "Gợi ý quy ước cho dự án",
        list: [
          "Mỗi commit trên main: tag SHA ngắn, dùng để deploy staging và production.",
          "Mỗi git tag `v1.4.0`: thêm tag `1.4.0` cho cùng image.",
          "Có thể giữ tag `main` hoặc `latest` cho tiện thử nghiệm, nhưng không bao giờ dùng nó trong manifest deploy.",
          "Ghi SHA vào label OCI (`org.opencontainers.image.revision`) để truy vết từ image."
        ],
        p: [
          "Với môi trường yêu cầu cao, bạn có thể deploy theo digest thay vì tag, đảm bảo tuyệt đối không ai đổi được nội dung."
        ]
      }
    ],
    summary: [
      "latest là tag mặc định, không đảm bảo mới nhất, không truy vết được.",
      "Tag theo git SHA: bất biến, ánh xạ 1-1 với commit.",
      "Promote cùng một image qua các môi trường, không build lại.",
      "Semver cho bản phát hành; bật tag immutability ở registry nếu có."
    ],
    pitfalls: [
      "Manifest Kubernetes dùng `:latest` rồi rollback không được: luôn ghi tag bất biến trong manifest.",
      "Build lại image cho production với cùng tag: dependency có thể khác, mất ý nghĩa đã test ở staging.",
      "Ghi đè tag SHA khi chạy lại pipeline: hãy bật immutability hoặc bỏ qua push nếu tag đã tồn tại."
    ],
    quiz: [
      {
        q: "Vì sao tag theo git SHA giúp rollback dễ dàng?",
        options: ["Vì tag SHA ngắn nên dễ gõ lại khi sự cố", "Vì mỗi tag ứng với một commit và không bị ghi đè", "Vì registry tự rollback khi image mới lỗi", "Vì image tag theo SHA được nén nhỏ hơn"],
        answer: 1,
        explain: "Tag bất biến giữ nguyên image cũ. Rollback chỉ là deploy lại tag SHA trước đó."
      },
      {
        q: "Thực hành đúng khi đưa code từ staging lên production là gì?",
        options: ["Build lại image từ cùng commit cho production", "Dùng lại chính image đã chạy ở staging", "Deploy tag latest vừa được cập nhật", "Build trên máy dev rồi push thẳng lên"],
        answer: 1,
        explain: "Promote cùng một artifact đảm bảo production chạy đúng thứ đã được kiểm thử."
      },
      {
        q: "Tag `latest` thực chất là gì?",
        options: ["Tag registry tự trỏ tới image push gần nhất", "Tag mặc định khi không ghi tag, trỏ đâu do người push", "Tag bất biến, được khoá sau lần push đầu tiên", "Bí danh của digest sha256 mới nhất"],
        answer: 1,
        explain: "latest chỉ là quy ước tên. Nếu ai đó push tag khác mà không cập nhật latest, latest vẫn trỏ về image cũ."
      }
    ]
  },
  "p07.m1.t5": {
    videos: [
      { id: "hWSHtHasJUI", title: "How to Build Multi-Architecture Docker Images with BuildX | Deploy containers to x86 and ARM!", channel: "DevOps Directive", lang: "en", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "BuildKit là gì",
        p: [
          "BuildKit là engine build mặc định của Docker Engine từ phiên bản 23 và Docker Desktop. So với builder cũ, BuildKit build các stage độc lập song song, bỏ qua stage không cần, và hỗ trợ các tính năng mới trong Dockerfile như cache mount và secret mount. Dòng `# syntax=docker/dockerfile:1` ở đầu file yêu cầu BuildKit dùng frontend Dockerfile mới nhất của nhánh 1.x, nhờ đó bạn dùng được cú pháp mới (ví dụ tuỳ chọn `env=` của secret mount cần frontend từ 1.10).",
          "`docker buildx` là CLI mở rộng để điều khiển BuildKit: tạo builder, build đa kiến trúc, và xuất/nhập cache ra nơi khác."
        ]
      },
      {
        h: "Cache mount và secret mount",
        p: [
          "`RUN --mount=type=cache` gắn một thư mục cache bền giữa các lần build nhưng không đưa vào layer. Khi package-lock thay đổi, `npm ci` vẫn phải chạy lại nhưng tải package từ cache cục bộ nên nhanh hơn nhiều.",
          "`RUN --mount=type=secret` gắn secret dưới dạng file chỉ trong thời gian chạy lệnh đó. Secret không nằm trong layer hay history. Đây là cách đúng để dùng token npm private khi build."
        ],
        code: {
          lang: "dockerfile",
          file: "Dockerfile",
          src: `# syntax=docker/dockerfile:1
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \\
    --mount=type=secret,id=npm_token,env=NPM_TOKEN \\
    npm ci`
        }
      },
      {
        h: "Build đa kiến trúc amd64/arm64",
        p: [
          "Máy Mac chip Apple, instance AWS Graviton chạy arm64, còn nhiều server khác chạy amd64. Image build trên một kiến trúc sẽ không chạy trực tiếp trên kiến trúc kia. Buildx build nhiều platform trong một lệnh và push một manifest list; khi pull, mỗi máy tự nhận đúng biến thể của mình.",
          "Build kiến trúc khác bằng giả lập QEMU có thể chậm, nhất là khi biên dịch native module. Cách nhanh hơn là dùng runner native cho mỗi kiến trúc, hoặc cross-compile nếu ngôn ngữ hỗ trợ."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `# File .npmrc tham chiếu token: //registry.npmjs.org/:_authToken=\${NPM_TOKEN}
docker buildx create --name multi --use
docker buildx build \\
  --platform linux/amd64,linux/arm64 \\
  --secret id=npm_token,env=NPM_TOKEN \\
  --cache-from type=registry,ref=ghcr.io/my-org/task-api:buildcache \\
  --cache-to type=registry,ref=ghcr.io/my-org/task-api:buildcache,mode=max \\
  -t ghcr.io/my-org/task-api:$(git rev-parse --short HEAD) \\
  --push .`
        }
      },
      {
        h: "Cache ngoài cho CI",
        p: [
          "Runner CI thường không giữ cache giữa các lần chạy. Buildx xuất cache ra `type=registry` (lưu thành một image cache trên registry) hoặc `type=gha` (cache của GitHub Actions). `mode=max` lưu cả layer của stage trung gian, giúp stage deps cũng được cache. Lưu ý cache mount (`type=cache` trong RUN) không được xuất theo cách này."
        ]
      }
    ],
    summary: [
      "BuildKit là builder mặc định: song song, bỏ stage thừa, cú pháp mount mới.",
      "Cache mount tăng tốc cài dependency mà không phình image.",
      "Secret mount dùng secret lúc build mà không lưu vào layer.",
      "buildx --platform tạo image đa kiến trúc dưới một tag.",
      "--cache-to/--cache-from giữ cache layer giữa các lần chạy CI."
    ],
    pitfalls: [
      "Build image trên Mac arm64 rồi deploy lên server amd64 gặp lỗi `exec format error`: chỉ định `--platform` rõ ràng.",
      "Dùng `COPY .npmrc` chứa token thật: token nằm trong layer. Chỉ để tham chiếu biến trong .npmrc và cấp token qua secret mount.",
      "Kỳ vọng cache mount được lưu qua `--cache-to`: không, nó chỉ tồn tại trên builder."
    ],
    quiz: [
      {
        q: "Cách an toàn để dùng token npm private khi build image?",
        options: ["ARG NPM_TOKEN rồi dùng trong RUN", "ENV NPM_TOKEN rồi unset ở cuối", "RUN --mount=type=secret,id=npm_token", "COPY file token rồi RUN rm ngay sau"],
        answer: 2,
        explain: "Secret mount chỉ tồn tại trong lúc chạy lệnh RUN, không vào layer. ARG/ENV/COPY đều để lại dấu vết trong image."
      },
      {
        q: "Deploy image lên server báo `exec format error`. Nguyên nhân thường gặp?",
        options: ["Container thiếu biến môi trường bắt buộc", "Image build cho kiến trúc CPU khác server", "Port của container bị trùng trên host", "Healthcheck của image trả về exit code 1"],
        answer: 1,
        explain: "Binary cho arm64 không chạy trên amd64 và ngược lại. Build đa kiến trúc hoặc chỉ định platform đúng."
      },
      {
        q: "`--cache-to type=registry,mode=max` có tác dụng gì?",
        options: ["Nén layer cache ở mức tối đa trước khi push", "Xuất cache cả layer của stage trung gian lên registry", "Xuất cả nội dung cache mount lên registry", "Chỉ xuất cache layer của image kết quả"],
        answer: 1,
        explain: "mode=max lưu cả layer stage trung gian; mode=min (mặc định) chỉ lưu layer của image kết quả."
      }
    ]
  },
  "p07.m2.t0": {
    videos: [
      { id: "HGKfE-cn9y4", title: "Master Docker Compose the Way I Wish I Did – Docker for Newbs EP 2", channel: "typecraft", lang: "en", minutes: 25, embed: true }
    ],
    sections: [
      {
        h: "Vì sao cần Docker Compose",
        p: [
          "Một backend thực tế hiếm khi chỉ có một process. API cần PostgreSQL, Redis cho cache và queue, một worker BullMQ xử lý job nền, và bước chạy migration. Gõ từng lệnh `docker run` với đủ network, volume, biến môi trường rất dễ sai. Docker Compose mô tả toàn bộ hệ thống trong một file YAML và dựng lên bằng một lệnh.",
          "File mặc định tên `compose.yaml` (vẫn nhận `docker-compose.yml`). Theo Compose Specification hiện hành, trường `version` ở đầu file đã lỗi thời và không cần ghi."
        ]
      },
      {
        h: "Một stack đầy đủ",
        code: {
          lang: "yaml",
          file: "compose.yaml",
          src: `services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes: [pgdata:/var/lib/postgresql]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 10

  redis:
    image: redis:8-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

  migrate:
    build: .
    command: ["npx", "prisma", "migrate", "deploy"]
    env_file: .env
    depends_on:
      db: { condition: service_healthy }

  api:
    build: .
    env_file: .env
    ports: ["3000:3000"]
    depends_on:
      migrate: { condition: service_completed_successfully }
      redis: { condition: service_healthy }

  worker:
    build: .
    command: ["node", "dist/worker.js"]
    env_file: .env
    depends_on:
      migrate: { condition: service_completed_successfully }
      redis: { condition: service_healthy }

volumes:
  pgdata:`
        },
        p: [
          "Lưu ý PostgreSQL 18: image chính thức đổi VOLUME sang `/var/lib/postgresql` và dữ liệu nằm ở `/var/lib/postgresql/18/docker`. Nếu bạn mount vào `/var/lib/postgresql/data` như hướng dẫn cũ, dữ liệu có thể không nằm trong volume như bạn nghĩ."
        ]
      },
      {
        h: "depends_on: thứ tự khởi động không bằng sẵn sàng",
        p: [
          "`depends_on` dạng đơn giản chỉ đảm bảo container db được khởi động trước, không đảm bảo Postgres đã nhận kết nối. Postgres cần vài giây để khởi tạo, API kết nối sớm sẽ lỗi. Dạng mở rộng với `condition` giải quyết việc này:"
        ],
        list: [
          "`service_started`: chỉ chờ container chạy (mặc định).",
          "`service_healthy`: chờ healthcheck của service phụ thuộc báo healthy.",
          "`service_completed_successfully`: chờ service chạy xong với exit code 0, phù hợp cho migration hoặc seed."
        ]
      },
      {
        h: "Chạy và quan sát",
        p: [
          "Service api và worker dùng chung image nhưng khác `command`. Đây là mô hình phổ biến: một codebase, nhiều process type. Dù có depends_on, ứng dụng vẫn nên có retry khi kết nối DB, vì trong production DB có thể khởi động lại bất kỳ lúc nào."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker compose up -d --build
docker compose ps              # xem STATUS healthy/exited (0)
docker compose logs -f api worker
docker compose down            # dừng, giữ volume`
        }
      }
    ],
    summary: [
      "Compose mô tả nhiều service, network, volume trong một file; không cần trường version.",
      "depends_on cần condition service_healthy để chờ DB thật sự sẵn sàng.",
      "service_completed_successfully phù hợp cho bước migration.",
      "API và worker có thể dùng chung image, khác command.",
      "Postgres 18 mount volume vào /var/lib/postgresql."
    ],
    pitfalls: [
      "Dùng depends_on không có healthcheck rồi API crash lúc khởi động vì DB chưa sẵn sàng.",
      "Mount volume vào `/var/lib/postgresql/data` với Postgres 18: hãy mount `/var/lib/postgresql` theo image mới.",
      "Chạy migration trong lệnh khởi động của API khi có nhiều replica: nhiều instance chạy migration đồng thời. Tách thành service/job riêng."
    ],
    quiz: [
      {
        q: "Để API chỉ khởi động khi Postgres đã nhận kết nối, bạn cấu hình gì?",
        options: ["depends_on: [db] dạng danh sách", "healthcheck cho db + condition: service_healthy", "restart: always cho service api", "links: [db] trong service api"],
        answer: 1,
        explain: "Dạng danh sách chỉ đảm bảo thứ tự khởi động container. Cần healthcheck kết hợp condition service_healthy để chờ sẵn sàng."
      },
      {
        q: "Condition nào phù hợp cho service migrate chạy một lần rồi thoát?",
        options: ["service_started", "service_healthy", "service_completed_successfully", "service_running"],
        answer: 2,
        explain: "service_completed_successfully chờ service kết thúc với exit code 0 rồi mới khởi động service phụ thuộc."
      },
      {
        q: "Trường `version: \"3.8\"` ở đầu compose.yaml hiện nay thế nào?",
        options: ["Bắt buộc, thiếu thì Compose báo lỗi", "Lỗi thời, Compose bỏ qua và in cảnh báo", "Quyết định phiên bản Docker Engine cần dùng", "Chọn giữa Compose v1 và Compose v2"],
        answer: 1,
        explain: "Compose Specification không dùng trường version nữa; Docker Compose v2 bỏ qua nó."
      }
    ]
  },
  "p07.m2.t1": {
    videos: [
      { id: "p2PH_YPCsis", title: "Docker Volumes explained in 6 minutes", channel: "TechWorld with Nana", lang: "en", minutes: 6, embed: true },
      { id: "W7X6u2BGVRY", title: "How Docker Networking Actually Works", channel: "KodeKloud", lang: "en", minutes: 9, embed: true }
    ],
    sections: [
      {
        h: "Dữ liệu trong container là tạm thời",
        p: [
          "Mọi thứ container ghi vào writable layer sẽ mất khi container bị xoá. Với database, điều này là thảm hoạ. Docker có hai cách chính để lưu dữ liệu bên ngoài container: named volume và bind mount.",
          "Named volume do Docker quản lý (thường nằm trong thư mục dữ liệu của Docker), tồn tại độc lập với container, được khởi tạo từ nội dung thư mục trong image nếu trống. Bind mount ánh xạ trực tiếp một thư mục trên host vào container, thay đổi hai phía thấy ngay."
        ]
      },
      {
        h: "Khi nào dùng loại nào",
        list: [
          "Named volume: dữ liệu database, Redis persistence, bất cứ thứ gì cần bền và không cần sửa tay. Hiệu năng tốt trên Docker Desktop.",
          "Bind mount: khi dev, mount `./src` vào container để hot reload. Dữ liệu thuộc về host, dễ bị ảnh hưởng quyền UID giữa host và container.",
          "tmpfs: dữ liệu tạm trong RAM, không ghi đĩa, phù hợp file tạm khi root filesystem chỉ đọc."
        ],
        code: {
          lang: "yaml",
          file: "compose.yaml (trích)",
          src: `services:
  db:
    image: postgres:18-alpine
    volumes:
      - pgdata:/var/lib/postgresql        # named volume
    networks: [backend]

  api:
    build: { context: ., target: build }
    command: npm run start:dev
    volumes:
      - ./src:/app/src                    # bind mount khi dev
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    ports: ["3000:3000"]
    networks: [backend, frontend]

networks:
  backend:
    internal: true    # không có đường ra Internet
  frontend:

volumes:
  pgdata:`
        },
        p: [
          "Lưu ý: nếu API cần gọi dịch vụ bên ngoài (email, S3), nó phải thuộc ít nhất một network không internal, như `frontend` ở ví dụ."
        ]
      },
      {
        h: "Network nội bộ và DNS theo tên service",
        p: [
          "Compose tự tạo một network mặc định cho project. Mỗi service được đăng ký DNS theo tên service, nên API kết nối Postgres bằng hostname `db`, không phải `localhost`. Bên trong container, `localhost` là chính container đó.",
          "`ports` công bố port ra host, chỉ cần cho service bạn muốn truy cập từ máy mình. Các service nói chuyện với nhau qua network nội bộ không cần `ports`. Không publish port DB ra ngoài ở môi trường chia sẻ là một lớp bảo vệ đơn giản."
        ]
      },
      {
        h: "Quản lý volume",
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker volume ls
docker volume inspect task-api_pgdata
docker compose down        # giữ volume, dữ liệu còn
docker compose down -v     # xoá cả named volume, mất dữ liệu
docker compose exec api getent hosts db   # kiểm tra DNS nội bộ`
        },
        p: [
          "Tên volume thực tế có tiền tố tên project (mặc định là tên thư mục), ví dụ `task-api_pgdata`."
        ]
      }
    ],
    summary: [
      "Named volume cho dữ liệu bền; bind mount cho code khi dev; tmpfs cho dữ liệu tạm.",
      "Service gọi nhau bằng tên service qua DNS nội bộ của Compose.",
      "localhost trong container là chính container đó.",
      "Chỉ publish port cần truy cập từ host; network internal chặn đường ra ngoài.",
      "down -v xoá volume, dùng cẩn thận."
    ],
    pitfalls: [
      "Đặt `DATABASE_URL=postgres://...@localhost:5432` cho service trong Compose: phải dùng `db`.",
      "Bind mount cả thư mục project đè lên `node_modules` đã cài trong image: chỉ mount `src` hoặc thêm anonymous volume cho `/app/node_modules`.",
      "Chạy `docker compose down -v` theo thói quen rồi mất dữ liệu dev đã seed công phu."
    ],
    quiz: [
      {
        q: "Trong Compose, API kết nối Postgres (service tên db) bằng host nào?",
        options: ["localhost", "127.0.0.1", "db", "host.docker.internal"],
        answer: 2,
        explain: "Compose đăng ký DNS theo tên service trong network chung. localhost chỉ trỏ tới chính container API."
      },
      {
        q: "Loại lưu trữ nào phù hợp cho dữ liệu PostgreSQL khi chạy Compose?",
        options: ["Writable layer của container", "Named volume do Docker quản lý", "tmpfs mount trong RAM", "Thư mục trong build context"],
        answer: 1,
        explain: "Named volume bền qua việc xoá/tạo lại container và do Docker quản lý. tmpfs mất khi dừng, writable layer mất khi xoá container."
      },
      {
        q: "Hai service trong cùng network Compose có cần khai báo `ports` để gọi nhau không?",
        options: ["Có, thiếu ports thì service khác không kết nối được", "Không, ports chỉ để công bố port ra host", "Chỉ cần khi hai service dùng giao thức TCP", "Chỉ cần khi service đích nằm ở network internal"],
        answer: 1,
        explain: "Giao tiếp nội bộ đi qua network của Compose tới port container. `ports` chỉ ánh xạ ra host."
      }
    ]
  },
  "p07.m2.t2": {
    videos: [
      { id: "pgf0Tc1ugEY", title: "Docker Compose v2 and Profiles Are the Best Thing Ever", channel: "Nick Janetakis", lang: "en", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "Hai loại .env dễ nhầm",
        p: [
          "Compose có hai cơ chế khác nhau đều liên quan tới file env. Thứ nhất, file `.env` cạnh `compose.yaml` được Compose đọc để nội suy biến trong chính file YAML, ví dụ `image: task-api:\${TAG}`. Thứ hai, `env_file:` trong một service nạp biến vào môi trường của container đó.",
          "Biến trong `.env` không tự động có trong container nếu bạn không truyền qua `environment` hoặc `env_file`. Hiểu rõ điều này tránh được nhiều giờ debug \"sao biến không có\"."
        ],
        code: {
          lang: "yaml",
          file: "compose.yaml (trích)",
          src: `services:
  api:
    image: ghcr.io/my-org/task-api:\${TAG:-dev}   # nội suy từ shell hoặc .env
    env_file:
      - .env                 # nạp vào container
    environment:
      LOG_LEVEL: debug       # ưu tiên hơn giá trị trong env_file`
        }
      },
      {
        h: "Override file cho dev và test",
        p: [
          "Compose tự động gộp `compose.yaml` với `compose.override.yaml` nếu file override tồn tại. Cách dùng phổ biến: `compose.yaml` mô tả cấu hình gần production, còn override thêm bind mount, hot reload, port debug cho dev. Với test, bạn chỉ định file rõ ràng bằng `-f`; khi đó file override mặc định không được nạp.",
          "Dùng `docker compose config` để xem cấu hình cuối cùng sau khi gộp và nội suy, rất hữu ích khi không chắc giá trị nào thắng."
        ],
        code: {
          lang: "yaml",
          file: "compose.override.yaml",
          src: `services:
  api:
    build: { context: ., target: build }
    command: npm run start:dev
    volumes: ["./src:/app/src"]
    ports: ["9229:9229"]     # Node inspector`
        }
      },
      {
        h: "Profiles bật tắt service tuỳ chọn",
        p: [
          "Không phải lúc nào bạn cũng cần mọi service. Công cụ như pgAdmin, Mailpit (bắt email khi dev) hay bộ chạy test e2e có thể gắn `profiles`. Service có profile chỉ khởi động khi profile đó được bật; service không có profile luôn chạy."
        ],
        code: {
          lang: "yaml",
          file: "compose.yaml (trích)",
          src: `services:
  mailpit:
    image: axllent/mailpit
    ports: ["8025:8025"]
    profiles: [tools]

  e2e:
    build: .
    command: ["npm", "run", "test:e2e"]
    profiles: [test]
    depends_on:
      api: { condition: service_healthy }`
        }
      },
      {
        h: "Lệnh thường dùng",
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker compose --profile tools up -d
docker compose -f compose.yaml -f compose.test.yaml --profile test run --rm e2e
docker compose config           # xem cấu hình đã gộp
TAG=a1b2c3d docker compose up -d`
        },
        p: [
          "Nhớ thêm `.env` vào `.gitignore` và commit một file mẫu `.env.example` chỉ chứa tên biến và giá trị giả, để người mới clone repo biết cần cấu hình gì."
        ]
      }
    ],
    summary: [
      ".env cạnh compose.yaml dùng để nội suy YAML; env_file nạp biến vào container.",
      "environment trong service ưu tiên hơn env_file.",
      "compose.override.yaml tự gộp; -f chỉ định file tường minh.",
      "profiles giúp bật tắt service công cụ hoặc test.",
      "docker compose config cho thấy cấu hình cuối cùng."
    ],
    pitfalls: [
      "Commit file `.env` chứa secret thật lên git: dùng `.env.example` và `.gitignore`.",
      "Nghĩ biến trong `.env` tự vào container: phải khai báo qua `env_file` hoặc `environment`.",
      "Dùng `-f compose.yaml` rồi thắc mắc vì sao override dev không áp dụng: khi có `-f`, Compose không tự nạp `compose.override.yaml`."
    ],
    quiz: [
      {
        q: "File `.env` nằm cạnh compose.yaml mặc định được dùng để làm gì?",
        options: ["Tự nạp biến vào mọi container", "Nội suy biến trong chính file compose.yaml", "Lưu secret dưới dạng mã hoá", "Chỉ nạp biến cho service có profile"],
        answer: 1,
        explain: "File .env của project dùng cho interpolation trong YAML. Muốn biến vào container cần env_file hoặc environment."
      },
      {
        q: "Service có `profiles: [tools]` sẽ chạy khi nào?",
        options: ["Luôn chạy cùng các service khác", "Khi profile tools được bật", "Chỉ khi biến CI=true được đặt", "Khi có file compose.override.yaml"],
        answer: 1,
        explain: "Service gắn profile chỉ được khởi động khi profile đó được kích hoạt, hoặc khi bạn chạy trực tiếp service đó."
      },
      {
        q: "Lệnh nào giúp xem cấu hình Compose cuối cùng sau khi gộp các file và nội suy biến?",
        options: ["docker compose ps", "docker compose config", "docker compose top", "docker inspect"],
        answer: 1,
        explain: "`docker compose config` in ra cấu hình đã chuẩn hoá, gộp và nội suy."
      }
    ]
  },
  "p07.m2.t3": {
    videos: [
      { id: "tLK9nNFHWH8", title: "Debugging Docker Containers with docker exec and docker logs || Docker Tutorial 5", channel: "TechWorld with Nana", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Bộ công cụ debug cơ bản",
        p: [
          "Khi container không chạy như mong đợi, hãy đi theo thứ tự: trạng thái → log → vào bên trong → cấu hình. Phần lớn lỗi lộ ra ngay ở hai bước đầu."
        ],
        list: [
          "`docker compose ps` / `docker ps -a`: container đang chạy, đã thoát với exit code nào, healthy hay không.",
          "`docker compose logs -f --tail=100 api`: xem log (ứng dụng nên log ra stdout/stderr).",
          "`docker compose exec api sh`: mở shell trong container đang chạy để kiểm tra file, biến môi trường, kết nối mạng.",
          "`docker inspect <container>`: cấu hình đầy đủ: env, mount, network, IP, trạng thái, lý do thoát.",
          "`docker stats`: CPU, memory, network I/O theo thời gian thực."
        ]
      },
      {
        h: "Đọc exit code",
        p: [
          "Exit code là manh mối đầu tiên khi container dừng. Code 0 là thoát bình thường. Code 1 thường là lỗi ứng dụng (xem log). Code 137 = 128 + 9, nghĩa là process bị SIGKILL, thường do OOM hoặc bị kill sau thời gian chờ dừng. Code 143 = 128 + 15, bị SIGTERM. Code 126/127 thường là lệnh không thực thi được hoặc không tìm thấy (sai `CMD`, thiếu file)."
        ],
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker compose ps -a
docker inspect task-api-api-1 --format '{{.State.ExitCode}} {{.State.OOMKilled}} {{.State.Error}}'
docker compose logs --tail=50 api

# Container crash ngay nên không exec được: chạy lại với shell để khám phá
docker compose run --rm --entrypoint sh api`
        }
      },
      {
        h: "Ba lỗi hay gặp nhất",
        p: [
          "Port: lỗi `port is already allocated` hoặc `address already in use` nghĩa là port trên host đã bị process khác (hay Postgres cài sẵn trên máy) chiếm. Đổi port host (`5433:5432`) hoặc tắt process kia. Ngược lại, nếu truy cập từ host không được dù container chạy, kiểm tra ứng dụng có nghe `0.0.0.0` không; nghe `127.0.0.1` trong container thì bên ngoài không vào được.",
          "Quyền: `EACCES: permission denied` khi ứng dụng chạy user `node` nhưng thư mục mount hoặc file được tạo bởi root. Sửa bằng `COPY --chown`, `chown` trong Dockerfile, hoặc chỉnh quyền thư mục trên host.",
          "DNS nội bộ: `getaddrinfo ENOTFOUND db` nghĩa là không phân giải được tên service. Kiểm tra hai service có cùng network không, tên service có đúng không, và bạn không dùng `localhost`."
        ]
      },
      {
        h: "Kiểm tra mạng từ bên trong",
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker compose exec api getent hosts db
docker compose exec api sh -c 'nc -zv db 5432'   # BusyBox nc trên alpine
docker compose exec api env | grep DATABASE_URL
docker network inspect task-api_default`
        },
        p: [
          "Nếu image tối giản thiếu công cụ, bạn có thể chạy một container debug tạm gắn vào cùng network, ví dụ `docker run --rm -it --network task-api_default alpine sh`."
        ]
      }
    ],
    summary: [
      "Thứ tự debug: ps → logs → exec → inspect → stats.",
      "Exit code 137 là SIGKILL (thường OOM), 143 là SIGTERM, 127 là không tìm thấy lệnh.",
      "Lỗi port: xung đột trên host hoặc app chỉ nghe 127.0.0.1.",
      "Lỗi quyền: user non-root không ghi được file của root.",
      "Lỗi DNS: sai tên service, khác network, hoặc dùng localhost."
    ],
    pitfalls: [
      "Ứng dụng NestJS gọi `app.listen(3000, 'localhost')` trong container: từ host không truy cập được. Dùng `app.listen(3000, '0.0.0.0')` hoặc bỏ tham số host.",
      "Chỉ nhìn log mà bỏ qua exit code và cờ OOMKilled, tưởng lỗi code trong khi container thiếu memory.",
      "Sửa file trong container bằng `exec` để \"fix nhanh\": mất khi container được tạo lại. Sửa ở Dockerfile hoặc compose."
    ],
    quiz: [
      {
        q: "Container thoát với exit code 137. Điều đó thường nghĩa là gì?",
        options: ["Lỗi cú pháp JavaScript khi khởi động", "Process bị SIGKILL, hay gặp do OOM", "Process thoát bình thường sau SIGTERM", "Không tìm thấy lệnh trong CMD"],
        answer: 1,
        explain: "137 = 128 + 9 (SIGKILL). Kiểm tra `State.OOMKilled` để biết có phải do OOM."
      },
      {
        q: "API trong container báo `getaddrinfo ENOTFOUND db`. Kiểm tra gì trước?",
        options: ["Dung lượng ổ đĩa còn trống của host", "Hai service có chung network và đúng tên không", "Phiên bản Node trong image của API", "Tag image của Postgres có đúng không"],
        answer: 1,
        explain: "ENOTFOUND là lỗi phân giải DNS. Trong Compose, tên service chỉ phân giải được khi hai container chung network."
      },
      {
        q: "Container chạy nhưng từ host gọi localhost:3000 không được, dù đã map `3000:3000`. Nguyên nhân khả dĩ?",
        options: ["Ứng dụng chỉ nghe 127.0.0.1 trong container", "Service chưa khai báo volume cho /app", "Dockerfile chưa có lệnh HEALTHCHECK", "Dockerfile thiếu lệnh EXPOSE 3000"],
        answer: 0,
        explain: "127.0.0.1 trong container là loopback riêng của container, traffic từ port mapping đi vào interface khác. Ứng dụng cần nghe 0.0.0.0."
      }
    ]
  },
  "p07.m2.t4": {
    sections: [
      {
        h: "Vì sao phải giới hạn tài nguyên",
        p: [
          "Mặc định container được dùng toàn bộ CPU và RAM của host. Một container rò rỉ bộ nhớ hoặc vòng lặp CPU có thể làm chậm hay treo mọi container khác trên cùng máy (hiện tượng noisy neighbor). Giới hạn tài nguyên, được thực thi bằng cgroups, giữ cho sự cố nằm gọn trong một container.",
          "Giới hạn còn giúp bạn biết trước ứng dụng cần bao nhiêu tài nguyên, là cơ sở để xếp lịch trên Kubernetes (requests/limits) và ước tính chi phí."
        ]
      },
      {
        h: "Memory và CPU hoạt động khác nhau",
        p: [
          "CPU là tài nguyên nén được: vượt giới hạn thì bị throttle, chạy chậm lại nhưng không chết. Memory không nén được: khi vượt giới hạn, kernel OOM killer giết process trong container. Docker báo `OOMKilled: true` và exit code 137; Kubernetes hiển thị lý do `OOMKilled`.",
          "Node.js có giới hạn heap V8 riêng. Các phiên bản Node gần đây tính giới hạn heap mặc định dựa trên memory khả dụng, kể cả giới hạn cgroup, nhưng bạn nên đặt `--max-old-space-size` rõ ràng, thấp hơn giới hạn container để chừa chỗ cho stack, buffer và bộ nhớ ngoài heap. Vượt heap thì Node báo lỗi `JavaScript heap out of memory`, dễ chẩn đoán hơn bị OOM kill âm thầm."
        ],
        code: {
          lang: "yaml",
          file: "compose.yaml (trích)",
          src: `services:
  api:
    build: .
    environment:
      NODE_OPTIONS: --max-old-space-size=384
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          memory: 256M`
        }
      },
      {
        h: "Theo dõi và chẩn đoán OOM",
        code: {
          lang: "bash",
          file: "terminal",
          src: `docker run -d --name api --memory 512m --cpus 1 task-api:dev
docker stats api --no-stream       # MEM USAGE / LIMIT
docker inspect api --format '{{.State.OOMKilled}} {{.State.ExitCode}}'

# Trên Kubernetes
kubectl describe pod <pod>          # Last State: Terminated, Reason: OOMKilled`
        },
        p: [
          "Khi gặp OOMKilled, đừng chỉ tăng giới hạn. Hãy xem memory tăng dần theo thời gian (rò rỉ: cache không giới hạn, listener không gỡ) hay tăng đột biến theo request (nạp file lớn vào RAM thay vì stream). Heap snapshot và metrics theo thời gian sẽ chỉ ra nguyên nhân."
        ]
      },
      {
        h: "Chọn con số hợp lý",
        list: [
          "Đo memory lúc tải bình thường và lúc cao điểm trong staging, đặt limit cao hơn đỉnh một khoảng an toàn.",
          "Với Node, một process chủ yếu dùng một core cho JavaScript; cấp nhiều CPU cho một process ít lợi, nên scale bằng nhiều replica.",
          "Đặt giới hạn cho cả Postgres và Redis, và cấu hình `maxmemory` thấp hơn memory limit của container Redis để Redis tự xử lý khi đầy thay vì bị kill. Redis làm cache thì chọn policy evict (ví dụ `allkeys-lru`); Redis dùng cho BullMQ phải để `noeviction` (khi đầy, lệnh ghi báo lỗi thay vì âm thầm xoá job)."
        ],
        p: [
          "Giới hạn quá chặt gây OOM và throttle liên tục; quá lỏng thì mất tác dụng bảo vệ. Hãy xem đây là con số cần điều chỉnh theo dữ liệu thực."
        ]
      }
    ],
    summary: [
      "Không giới hạn thì một container có thể chiếm hết tài nguyên host.",
      "Vượt CPU bị throttle; vượt memory bị OOM kill (exit 137).",
      "Đặt --max-old-space-size thấp hơn memory limit của container.",
      "OOMKilled là triệu chứng; tìm rò rỉ hoặc chỗ nạp dữ liệu lớn vào RAM."
    ],
    pitfalls: [
      "Đặt heap V8 bằng hoặc lớn hơn memory limit: container bị kill trước khi Node kịp báo lỗi heap.",
      "Tăng memory mỗi lần OOM mà không tìm rò rỉ: vấn đề chỉ bị trì hoãn.",
      "Chỉ đặt giới hạn cho API mà quên Redis/Postgres cùng host."
    ],
    quiz: [
      {
        q: "Container vượt giới hạn CPU thì điều gì xảy ra?",
        options: ["Bị kernel OOM kill", "Bị throttle, chạy chậm lại", "Bị Docker khởi động lại", "Bị chuyển sang core khác"],
        answer: 1,
        explain: "CPU là tài nguyên nén được; cgroups giới hạn thời gian CPU nên process chạy chậm hơn chứ không bị giết."
      },
      {
        q: "Vì sao nên đặt `--max-old-space-size` thấp hơn memory limit?",
        options: ["Để garbage collector chạy ít hơn và nhanh hơn", "Để chừa chỗ cho bộ nhớ ngoài heap như buffer", "Để Node dùng được nhiều core CPU hơn", "Vì Docker từ chối chạy nếu heap bằng limit"],
        answer: 1,
        explain: "Tổng memory của process lớn hơn heap V8. Heap thấp hơn limit giúp tránh OOM kill âm thầm."
      },
      {
        q: "Cách xác nhận container dừng vì OOM?",
        options: ["docker logs xem dòng log cuối", "docker inspect xem State.OOMKilled", "docker stats xem MEM USAGE hiện tại", "docker events lọc theo tên image"],
        answer: 1,
        explain: "State.OOMKilled = true (thường kèm exit code 137) xác nhận OOM. Log ứng dụng thường không ghi được gì vì process bị kill đột ngột."
      }
    ]
  },
  "p07.m2.t5": {
    videos: [
      { id: "-IH5inFyEqU", title: "Container Image Scanning with Trivy -- Ep. 1 Trivy Overview", channel: "Aqua Security Open Source", lang: "en", minutes: 6, embed: true }
    ],
    sections: [
      {
        h: "Image của bạn chứa lỗ hổng của người khác",
        p: [
          "Image không chỉ có code bạn viết. Nó chứa gói hệ điều hành của base image (openssl, busybox, libc...) và hàng trăm package npm. Mỗi thành phần có thể có lỗ hổng đã công bố, được định danh bằng mã CVE và chấm mức nghiêm trọng (LOW, MEDIUM, HIGH, CRITICAL).",
          "Trình quét image như Trivy (Aqua Security) hay Grype (Anchore) đọc danh sách package trong image, so với cơ sở dữ liệu lỗ hổng và báo cáo CVE kèm phiên bản đã vá nếu có."
        ]
      },
      {
        h: "Quét cục bộ",
        code: {
          lang: "bash",
          file: "terminal",
          src: `# Trivy
trivy image task-api:dev
trivy image --severity CRITICAL,HIGH --ignore-unfixed task-api:dev

# Grype
grype task-api:dev
grype task-api:dev --fail-on critical`
        },
        p: [
          "`--ignore-unfixed` bỏ qua CVE chưa có bản vá, vì bạn không làm gì được ngoài đổi thành phần. Việc này giảm nhiễu, nhưng vẫn nên xem định kỳ danh sách đầy đủ."
        ]
      },
      {
        h: "Chặn build trong CI",
        p: [
          "Quét phải là cổng chặn (gate), không chỉ là báo cáo. Build image, quét, và chỉ push khi không có lỗ hổng CRITICAL (tuỳ chính sách, có thể thêm HIGH). Thứ tự quan trọng: quét trước khi push, để image lỗi không bao giờ tới registry dùng cho deploy."
        ],
        code: {
          lang: "yaml",
          file: ".github/workflows/ci.yml (trích)",
          src: `- name: Trivy scan
  uses: aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25 # v0.36.0
  with:
    image-ref: ghcr.io/my-org/task-api:\${{ github.sha }}
    severity: CRITICAL,HIGH
    ignore-unfixed: true
    exit-code: "1"`
        }
      },
      {
        h: "Xử lý khi phát hiện CVE",
        list: [
          "Lỗ hổng trong base image: nâng base (`node:24-alpine` bản mới) hoặc chuyển base tối giản hơn.",
          "Lỗ hổng trong package npm: nâng phiên bản, hoặc dùng `overrides` trong package.json cho dependency bắc cầu.",
          "Không áp dụng hoặc chưa sửa được: ghi vào file bỏ qua (`.trivyignore`) kèm lý do và hạn xem lại, không tắt cả trình quét.",
          "Quét lại định kỳ image đang chạy production, vì CVE mới được công bố hằng ngày cho image cũ."
        ],
        p: [
          "Quét image chỉ là một lớp. Nó không phát hiện lỗi logic trong code của bạn; kết hợp với SAST, kiểm tra dependency và review."
        ]
      }
    ],
    summary: [
      "Image chứa package OS và npm, mỗi thứ có thể có CVE.",
      "Trivy và Grype quét image so với cơ sở dữ liệu lỗ hổng.",
      "Trong CI: build → scan → chỉ push khi đạt ngưỡng.",
      "Xử lý bằng cách nâng base/package; bỏ qua có lý do và hạn.",
      "Quét lại định kỳ image đang chạy."
    ],
    pitfalls: [
      "Push image lên registry rồi mới quét: image lỗi đã có thể được deploy.",
      "Chặn mọi mức độ kể cả LOW nên pipeline luôn đỏ, cả đội tắt luôn bước quét. Chọn ngưỡng thực tế như CRITICAL (và HIGH có bản vá).",
      "Dùng action quét theo tag có thể bị ghi đè: pin theo commit SHA như Lab 03."
    ],
    quiz: [
      {
        q: "Trong pipeline CI, bước quét image nên nằm ở đâu?",
        options: ["Sau khi deploy lên production", "Sau khi build, trước khi push", "Trước khi build, quét Dockerfile", "Sau khi push, trước khi deploy"],
        answer: 1,
        explain: "Quét trước push đảm bảo image có lỗ hổng nghiêm trọng không vào registry dùng để deploy."
      },
      {
        q: "`--ignore-unfixed` trong Trivy làm gì?",
        options: ["Ẩn CVE chưa có bản vá", "Ẩn CVE mức LOW và MEDIUM", "Tự nâng package lên bản đã vá", "Bỏ qua CVE trong base image"],
        answer: 0,
        explain: "Nó ẩn các CVE chưa có phiên bản sửa, giúp tập trung vào lỗ hổng bạn thực sự xử lý được."
      },
      {
        q: "CVE nằm trong openssl của base image. Cách xử lý phù hợp nhất?",
        options: ["Thêm CVE vào .trivyignore vĩnh viễn", "Nâng base image lên bản đã vá", "Xoá thư viện openssl bằng RUN rm", "Đổi FROM sang tag latest của base"],
        answer: 1,
        explain: "Lỗ hổng nằm ở base nên cần base đã vá. Xoá file ở layer sau không loại nó khỏi image và có thể làm hỏng ứng dụng."
      }
    ]
  },
});
