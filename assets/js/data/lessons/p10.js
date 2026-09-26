/* Nội dung bài học chương p10 */
window.LESSON_CONTENT = window.LESSON_CONTENT || {};
Object.assign(window.LESSON_CONTENT, {
  "p10.m0.t0": {
    videos: [
      { id: "cfkHE0iTuSw", title: "✅ #4 | Cluster Architecture  | Học Kubernetes (K8s) và Amazon EKS Tiếng Việt Full", channel: "Viet Tran", lang: "vi", minutes: 12, embed: true },
      { id: "TlHvYWVUZyc", title: "Kubernetes Explained in 6 Minutes | k8s Architecture", channel: "ByteByteGo", lang: "en", minutes: 6, embed: true }
    ],
    sections: [
      {
        h: "Kubernetes giải quyết vấn đề gì",
        p: [
          "Chạy vài container trên một máy thì Docker Compose là đủ. Khi có hàng chục service trên nhiều máy, bạn cần một hệ thống quyết định container chạy ở máy nào, khởi động lại khi chết, thay thế khi máy hỏng, cân bằng tải và cập nhật không downtime. Kubernetes (K8s) là hệ thống đó.",
          "Cốt lõi của Kubernetes là vòng lặp điều hoà (reconciliation loop): bạn khai báo trạng thái mong muốn (\"cần 3 replica của image X\"), các controller liên tục so sánh với trạng thái thực tế và hành động để hai bên khớp nhau. Bạn không ra lệnh \"chạy container\", bạn nộp một object mô tả, và hệ thống tự lo phần còn lại."
        ]
      },
      {
        h: "Control plane: bộ não của cluster",
        list: [
          "`kube-apiserver`: cửa ngõ duy nhất. Mọi thành phần và `kubectl` đều nói chuyện qua REST API này; nó xác thực, phân quyền, kiểm tra hợp lệ rồi lưu object.",
          "`etcd`: kho key-value phân tán lưu toàn bộ trạng thái cluster. Mất etcd là mất cluster, nên cần backup và chạy nhiều node (thường 3 hoặc 5) để có quorum.",
          "`kube-scheduler`: chọn node cho Pod mới dựa trên requests tài nguyên, affinity, taint/toleration.",
          "`kube-controller-manager`: chạy các controller như Deployment, ReplicaSet, Node, Job; mỗi controller theo dõi một loại object và điều hoà nó."
        ],
        p: [
          "Trên dịch vụ managed như EKS, GKE, AKS, nhà cung cấp vận hành control plane cho bạn; bạn chỉ quản lý node và workload."
        ]
      },
      {
        h: "Node: nơi workload chạy",
        list: [
          "`kubelet`: agent trên mỗi node, nhận danh sách Pod được gán cho node, yêu cầu container runtime chạy chúng, chạy probe và báo trạng thái về apiserver.",
          "`kube-proxy`: lập trình quy tắc mạng (iptables/IPVS) để địa chỉ của Service chuyển tới đúng Pod. Một số CNI như Cilium có thể thay thế kube-proxy.",
          "Container runtime: containerd hoặc CRI-O, nói chuyện với kubelet qua CRI. Kubernetes đã bỏ dockershim từ 1.24, nhưng image build bằng Docker vẫn chạy bình thường vì cùng chuẩn OCI."
        ],
        p: [
          "Luồng khi bạn `kubectl apply` một Deployment: apiserver lưu vào etcd; Deployment controller tạo ReplicaSet; ReplicaSet controller tạo Pod; scheduler gán node; kubelet trên node đó kéo image và chạy container."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get nodes -o wide
kubectl get pods -n kube-system        # xem thành phần hệ thống (với kind/kubeadm)
kubectl api-resources | head -20       # các loại object API hỗ trợ
kubectl get events --sort-by=.lastTimestamp`
        }
      }
    ],
    summary: [
      "Kubernetes hoạt động theo vòng lặp điều hoà: khai báo trạng thái mong muốn, controller làm cho thực tế khớp.",
      "Control plane gồm apiserver, etcd, scheduler, controller-manager.",
      "Mỗi node có kubelet, kube-proxy và container runtime (containerd/CRI-O).",
      "Managed Kubernetes (EKS/GKE/AKS) vận hành control plane thay bạn."
    ],
    pitfalls: [
      "Tự dựng cluster production mà không có kế hoạch backup etcd.",
      "Nghĩ Kubernetes cần Docker trên node; runtime là containerd/CRI-O, image Docker vẫn tương thích.",
      "Dùng Kubernetes cho một ứng dụng nhỏ vài container, gánh thêm độ phức tạp vận hành không cần thiết."
    ],
    quiz: [
      { q: "Thành phần nào lưu toàn bộ trạng thái của cluster?", options: ["kubelet", "etcd", "kube-proxy", "scheduler"], answer: 1, explain: "etcd là kho dữ liệu của cluster. kubelet chạy Pod trên node, kube-proxy lập trình mạng cho Service, scheduler chọn node cho Pod." },
      { q: "Ai quyết định Pod mới chạy trên node nào?", options: ["kubelet", "kube-scheduler", "etcd", "container runtime"], answer: 1, explain: "Scheduler chọn node dựa trên tài nguyên và ràng buộc, rồi ghi kết quả qua apiserver. kubelet chỉ chạy những Pod đã được gán cho node của nó." },
      { q: "Vòng lặp điều hoà (reconciliation) nghĩa là gì?", options: ["Kubernetes chạy lệnh một lần rồi dừng", "Controller liên tục so sánh trạng thái mong muốn và thực tế rồi hành động để khớp", "Người dùng phải khởi động lại Pod bằng tay", "etcd tự đồng bộ với Git"], answer: 1, explain: "Controller chạy liên tục nên Pod chết sẽ được tạo lại mà không cần can thiệp. Đồng bộ với Git là việc của công cụ GitOps như Argo CD, không phải etcd." }
    ]
  },
  "p10.m0.t1": {
    videos: [
      { id: "OY9yzDmFNhs", title: "Bài 14. Pod Kubernetes | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 8, embed: true },
      { id: "yRiFq1ykBxc", title: "Day 11/40 - Multi Container Pod Kubernetes - Sidecar vs Init Container", channel: "Tech Tutorials with Piyush", lang: "en", minutes: 25, embed: true }
    ],
    sections: [
      {
        h: "Pod: đơn vị nhỏ nhất",
        p: [
          "Kubernetes không chạy container trực tiếp mà chạy Pod. Một Pod gồm một hoặc vài container luôn được đặt cùng node, dùng chung network namespace (cùng IP, gọi nhau qua `localhost`) và có thể chia sẻ volume. Mỗi Pod có IP riêng trong cluster.",
          "Pod là thứ dùng xong bỏ (ephemeral). Khi node chết hay Pod bị xoá, Pod không được \"sửa\" mà controller tạo Pod mới với tên mới, IP mới. Vì vậy bạn hầu như không bao giờ tạo Pod trực tiếp; bạn tạo Deployment, StatefulSet, Job để controller quản lý Pod. Cũng đừng `kubectl exec` vào để sửa file: thay đổi mất khi Pod bị thay, và các replica khác không có."
        ]
      },
      {
        h: "Init container và sidecar",
        p: [
          "Init container chạy tuần tự trước container chính và phải kết thúc thành công, dùng để chờ phụ thuộc hoặc chuẩn bị dữ liệu. Sidecar là container phụ chạy song song với container chính suốt vòng đời Pod: đẩy log, proxy của service mesh, đồng bộ cấu hình.",
          "Sidecar \"gốc\" (native sidecar) được khai báo là init container có `restartPolicy: Always`: nó khởi động trước container chính, chạy suốt vòng đời, và được dừng sau container chính. Tính năng này ra mắt dạng alpha ở Kubernetes 1.28, bật mặc định (beta) từ 1.29 và chính thức stable từ 1.33. Điều này giải quyết vấn đề cũ là Job không kết thúc vì sidecar vẫn chạy."
        ],
        code: {
          lang: "yaml", file: "pod-demo.yaml",
          src: `apiVersion: v1
kind: Pod
metadata:
  name: api-demo
  labels: { app: api-demo }
spec:
  initContainers:
    - name: wait-db
      image: busybox:1.36
      command: ["sh", "-c", "until nc -z postgres 5432; do echo chờ DB; sleep 2; done"]
    - name: log-shipper          # sidecar gốc (bật mặc định từ 1.29, stable từ 1.33)
      image: busybox:1.36
      restartPolicy: Always
      command: ["sh", "-c", "tail -F /var/log/app/app.log"]
      volumeMounts:
        - { name: logs, mountPath: /var/log/app }
  containers:
    - name: api
      image: ghcr.io/my-org/task-api:3f9c2ab
      ports: [{ containerPort: 3000 }]
      volumeMounts:
        - { name: logs, mountPath: /var/log/app }
  volumes:
    - name: logs
      emptyDir: {}`
        }
      },
      {
        h: "Vòng đời Pod",
        p: [
          "Pod đi qua các phase `Pending` (chờ lên lịch hoặc kéo image), `Running`, `Succeeded`/`Failed` (với container đã kết thúc). Khi Pod bị xoá, kubelet gửi SIGTERM cho container, chờ `terminationGracePeriodSeconds` (mặc định 30 giây), rồi gửi SIGKILL. Ứng dụng phải bắt SIGTERM để ngừng nhận request mới, hoàn thành request đang xử lý và đóng kết nối DB."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl apply -f pod-demo.yaml
kubectl get pod api-demo -w
kubectl logs api-demo -c wait-db
kubectl logs api-demo -c api
kubectl delete pod api-demo`
        }
      }
    ],
    summary: [
      "Pod gồm một hoặc vài container chung IP, chung node, có thể chung volume.",
      "Pod là tạm thời: bị thay chứ không được sửa; hãy để controller quản lý Pod.",
      "Init container chạy trước và phải thành công; sidecar chạy song song (K8s >= 1.29 dùng init container với `restartPolicy: Always`).",
      "Ứng dụng phải xử lý SIGTERM trong thời gian grace period."
    ],
    pitfalls: [
      "Tạo Pod trần bằng `kind: Pod` cho production: node chết là Pod mất, không ai tạo lại.",
      "Ghi dữ liệu quan trọng vào filesystem của container hoặc `emptyDir`; mất khi Pod bị xoá.",
      "Ứng dụng bỏ qua SIGTERM, bị SIGKILL giữa chừng và làm rơi request khi deploy."
    ],
    quiz: [
      { q: "Hai container trong cùng một Pod giao tiếp với nhau thế nào là đơn giản nhất?", options: ["Qua Service", "Qua `localhost` vì chung network namespace", "Qua IP của node", "Không thể giao tiếp"], answer: 1, explain: "Container trong một Pod chung IP và network namespace nên gọi nhau bằng `localhost:<port>`. Service dùng để gọi giữa các Pod khác nhau." },
      { q: "Vì sao không nên sửa file trực tiếp trong Pod bằng `kubectl exec`?", options: ["Vì `kubectl exec` bị cấm mặc định", "Vì thay đổi mất khi Pod bị thay", "Vì exec làm Pod chạy chậm hẳn đi", "Vì Pod không có filesystem để ghi"], answer: 1, explain: "Pod là tạm thời; thay đổi mất khi Pod bị thay và các replica khác cũng không có, nên phải đi qua image hoặc manifest. exec không bị cấm mặc định và vẫn hữu ích để debug." },
      { q: "Init container khác sidecar ở điểm nào?", options: ["Init container chạy song song suốt vòng đời Pod", "Init container phải chạy xong trước container chính", "Sidecar chỉ chạy sau khi container chính kết thúc", "Hai loại giống nhau, chỉ khác tên trường"], answer: 1, explain: "Init container thường chạy xong rồi thoát trước container chính. Sidecar chạy song song với container chính (native sidecar khai báo bằng init container `restartPolicy: Always`, stable từ 1.33)." }
    ]
  },
  "p10.m0.t2": {
    videos: [
      { id: "jaS7u6BQi1Y", title: "Bài 15. Deployment Kubernetes | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 14, embed: true },
      { id: "KPTMtsCYztk", title: "✅ #23 Rollout Deployment Kubernetes | Học Kubernetes & Amazon EKS Tiếng Việt", channel: "Viet Tran", lang: "vi", minutes: 7, embed: true }
    ],
    sections: [
      {
        h: "Deployment quản lý ReplicaSet, ReplicaSet quản lý Pod",
        p: [
          "Deployment là cách chuẩn để chạy ứng dụng stateless. Bạn khai báo template Pod và số replica. Deployment tạo một ReplicaSet cho mỗi phiên bản template; ReplicaSet đảm bảo luôn có đúng số Pod khớp selector. Khi bạn đổi image, Deployment tạo ReplicaSet mới và dần tăng nó lên, đồng thời giảm ReplicaSet cũ về 0. ReplicaSet cũ được giữ lại (theo `revisionHistoryLimit`) để rollback.",
          "Bạn gần như không bao giờ tạo ReplicaSet trực tiếp; hãy làm việc với Deployment.",
          "Deployment chỉ quản lý Pod qua `selector`. Nếu bạn tạo tay một Pod có cùng label, ReplicaSet sẽ coi nó là của mình và có thể xoá bớt để giữ đúng số replica. Vì vậy label của mỗi ứng dụng phải riêng biệt và `selector` không được thay đổi sau khi Deployment đã tạo."
        ]
      },
      {
        h: "Rolling update không downtime",
        p: [
          "`maxSurge` là số Pod được tạo vượt số replica trong lúc cập nhật; `maxUnavailable` là số Pod được phép thiếu. Với `maxUnavailable: 0, maxSurge: 1`, Kubernetes tạo một Pod mới, chờ nó ready, rồi mới xoá một Pod cũ: an toàn nhất nhưng chậm hơn. Readiness probe là điều kiện bắt buộc để rolling update thật sự không downtime; không có nó, Pod được coi là sẵn sàng ngay khi container chạy dù ứng dụng chưa khởi động xong."
        ],
        code: {
          lang: "yaml", file: "deployment.yaml",
          src: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
  labels: { app: task-api }
spec:
  replicas: 3
  revisionHistoryLimit: 5
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
  selector:
    matchLabels: { app: task-api }
  template:
    metadata:
      labels: { app: task-api }
    spec:
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:3f9c2ab
          ports: [{ containerPort: 3000 }]
          readinessProbe:
            httpGet: { path: /health/ready, port: 3000 }
            periodSeconds: 5`
        }
      },
      {
        h: "Lịch sử rollout và rollback",
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl apply -f deployment.yaml
kubectl set image deploy/task-api api=ghcr.io/my-org/task-api:8d1e4f0
kubectl annotate deploy/task-api kubernetes.io/change-cause="release 8d1e4f0"
kubectl rollout status deploy/task-api --timeout=5m
kubectl rollout history deploy/task-api
kubectl rollout undo deploy/task-api                 # về revision trước
kubectl rollout undo deploy/task-api --to-revision=3
kubectl rollout restart deploy/task-api              # tạo lại Pod, cùng image`
        },
        p: [
          "Chỉ thay đổi trong `spec.template` mới tạo revision mới; đổi `replicas` thì không. Trong quy trình GitOps, rollback đúng nghĩa là revert commit trong Git, vì `rollout undo` sẽ bị ghi đè ở lần đồng bộ tiếp theo. Strategy `Recreate` xoá hết Pod cũ trước khi tạo mới, gây downtime, chỉ dùng khi hai phiên bản không được chạy song song."
        ]
      }
    ],
    summary: [
      "Deployment → ReplicaSet → Pod; mỗi phiên bản template là một ReplicaSet.",
      "`maxSurge`/`maxUnavailable` điều khiển tốc độ và độ an toàn của rolling update.",
      "Readiness probe là điều kiện để rolling update không downtime.",
      "`kubectl rollout status/history/undo` để theo dõi và quay lui."
    ],
    pitfalls: [
      "Dùng tag `latest`: đổi code mà spec không đổi nên không có rollout, và không biết đang chạy phiên bản nào.",
      "Selector của Deployment không khớp label trong template, API từ chối manifest; và `selector` không đổi được sau khi tạo.",
      "Dùng `kubectl rollout undo` trong hệ thống GitOps rồi thấy phiên bản lỗi quay lại sau vài phút."
    ],
    quiz: [
      { q: "Với `maxUnavailable: 0` và `maxSurge: 1`, rolling update diễn ra thế nào?", options: ["Xoá hết Pod cũ rồi mới tạo Pod mới", "Thêm một Pod mới, chờ ready, rồi bớt một Pod cũ", "Tạo gấp đôi số Pod cùng một lúc", "Không cập nhật được vì không được thiếu Pod"], answer: 1, explain: "Không được thiếu Pod nào và chỉ được dư một Pod, nên cập nhật từng Pod một. Xoá hết là strategy `Recreate`." },
      { q: "Thay đổi nào tạo ra revision mới cho Deployment?", options: ["Đổi `replicas` từ 3 lên 5", "Đổi image trong `spec.template`", "Thêm annotation vào metadata của Deployment", "HPA scale"], answer: 1, explain: "Chỉ thay đổi trong template Pod mới tạo ReplicaSet mới. Scale (tay hay HPA) và metadata của Deployment không tạo revision." },
      { q: "Vì sao Deployment cần readiness probe để rolling update an toàn?", options: ["Để Pod mới dùng ít memory hơn", "Để Pod cũ chỉ bị xoá khi Pod mới sẵn sàng", "Để image được kéo về nhanh hơn", "Để Deployment tự rollback khi lỗi"], answer: 1, explain: "Không có readiness, Pod được coi là ready ngay khi container chạy, traffic đến trước khi app khởi động xong. Probe không ảnh hưởng memory, tốc độ kéo image, và Deployment không tự rollback." }
    ]
  },
  "p10.m0.t3": {
    videos: [
      { id: "jamOqeGR_5A", title: "✅ #30 Services | ClusterIP vs NodePort vs LoadBalancer vs ExternalName | Kubernetes", channel: "Viet Tran", lang: "vi", minutes: 17, embed: true },
      { id: "T4Z7visMM4E", title: "Kubernetes Services explained | ClusterIP vs NodePort vs LoadBalancer vs Headless Service", channel: "TechWorld with Nana", lang: "en", minutes: 24, embed: true }
    ],
    sections: [
      {
        h: "Vì sao cần Service",
        p: [
          "Pod đến rồi đi, IP thay đổi liên tục. Service cung cấp một địa chỉ ổn định (ClusterIP) và tên DNS đứng trước một nhóm Pod được chọn bằng label selector. Kubernetes duy trì danh sách endpoint (EndpointSlice) gồm các Pod khớp selector và đang ready; kube-proxy (hoặc CNI) chuyển traffic từ IP của Service tới một trong các Pod đó.",
          "Label là cặp key-value gắn lên object (`app: task-api`), selector là truy vấn trên label. Đây là cách các object Kubernetes \"tìm thấy\" nhau một cách lỏng lẻo: Service không biết Deployment nào, nó chỉ chọn Pod có label phù hợp."
        ]
      },
      {
        h: "Các loại Service",
        p: [
          "Các loại Service xếp chồng lên nhau: NodePort vẫn có ClusterIP, LoadBalancer vẫn có NodePort và ClusterIP. Chọn loại dựa trên câu hỏi: ai cần gọi tới service này, từ trong hay ngoài cluster? Với HTTP từ Internet, cách hiện đại là để một Gateway (bài sau) giữ load balancer duy nhất, các service phía sau đều là ClusterIP."
        ],
        list: [
          "`ClusterIP` (mặc định): chỉ truy cập từ trong cluster. Dùng cho giao tiếp giữa các service.",
          "`NodePort`: mở cùng một cổng (mặc định trong dải 30000–32767) trên mọi node. Hiếm khi dùng trực tiếp ở production.",
          "`LoadBalancer`: yêu cầu cloud tạo load balancer bên ngoài trỏ vào Service. Mỗi Service một load balancer nên tốn kém nếu có nhiều service; thường chỉ dùng cho Gateway/proxy ở cửa ngõ.",
          "Headless (`clusterIP: None`): không có IP ảo, DNS trả về trực tiếp IP của từng Pod. Dùng với StatefulSet."
        ],
        code: {
          lang: "yaml", file: "service.yaml",
          src: `apiVersion: v1
kind: Service
metadata:
  name: task-api
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: task-api
  ports:
    - name: http
      port: 80          # cổng của Service
      targetPort: 3000  # cổng container`
        }
      },
      {
        h: "DNS nội bộ và kiểm tra",
        p: [
          "CoreDNS cấp tên cho mỗi Service theo dạng `<service>.<namespace>.svc.cluster.local`. Pod trong cùng namespace gọi ngắn là `http://task-api`, khác namespace thì `http://task-api.prod`. Nhờ vậy cấu hình ứng dụng chỉ cần tên, không cần IP.",
          "Nếu Service không có endpoint, kiểm tra ba thứ: selector có khớp label của Pod không, Pod có ready không, `targetPort` có đúng cổng container đang nghe không."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get svc task-api -n prod
kubectl get endpointslices -n prod -l kubernetes.io/service-name=task-api
kubectl get pods -n prod -l app=task-api --show-labels
kubectl run tmp --rm -it --image=busybox:1.36 --restart=Never -n prod -- \\
  wget -qO- http://task-api/health`
        }
      }
    ],
    summary: [
      "Service cho nhóm Pod một địa chỉ và tên DNS ổn định, chọn Pod bằng label selector.",
      "Chỉ Pod ready mới nằm trong endpoint của Service.",
      "ClusterIP cho nội bộ, NodePort mở cổng trên node, LoadBalancer tạo LB của cloud, headless cho StatefulSet.",
      "DNS: `<service>.<namespace>.svc.cluster.local`."
    ],
    pitfalls: [
      "Selector gõ sai label, Service không có endpoint và mọi request timeout hoặc bị từ chối.",
      "Nhầm `port` với `targetPort`: `targetPort` phải là cổng container thật sự đang lắng nghe.",
      "Tạo `type: LoadBalancer` cho mọi service nội bộ, mỗi cái sinh một load balancer tính phí riêng."
    ],
    quiz: [
      { q: "Service biết gửi traffic tới Pod nào bằng cách nào?", options: ["Theo tên Deployment trong spec", "Theo label selector trên Pod", "Theo danh sách IP cố định", "Theo thứ tự tạo Pod"], answer: 1, explain: "Service chọn Pod theo label và chỉ đưa Pod ready vào endpoint. Nó không tham chiếu Deployment hay IP cố định." },
      { q: "Pod ở namespace `staging` muốn gọi Service `task-api` ở namespace `prod`. Dùng tên nào?", options: ["`task-api`", "`task-api.prod`", "`prod.task-api`", "Không gọi được giữa namespace"], answer: 1, explain: "Tên ngắn `task-api` chỉ phân giải trong cùng namespace. Khác namespace dùng `task-api.prod` hoặc tên đầy đủ `task-api.prod.svc.cluster.local`. Giữa namespace vẫn gọi được trừ khi NetworkPolicy chặn." },
      { q: "Loại Service nào phù hợp nhất cho giao tiếp giữa các microservice bên trong cluster?", options: ["NodePort", "LoadBalancer", "ClusterIP", "ExternalName"], answer: 2, explain: "ClusterIP chỉ truy cập nội bộ, không phơi ra ngoài và không tốn load balancer. ExternalName chỉ là bí danh DNS tới tên bên ngoài." }
    ]
  },
  "p10.m0.t4": {
    videos: [
      { id: "q76XVCTDZCY", title: "An Introduction to Gateway API for Beginners in Kubernetes", channel: "That DevOps Guy", lang: "en", minutes: 40, embed: true },
      { id: "xaZ87iSvMAI", title: "Gateway API Explained: The Future of Kubernetes Networking", channel: "KodeKloud", lang: "en", minutes: 45, embed: true }
    ],
    sections: [
      {
        h: "Vì sao chuyển từ Ingress sang Gateway API",
        p: [
          "Ingress là API cũ để đưa HTTP từ bên ngoài vào Service. Nó quá đơn giản nên mỗi controller thêm tính năng qua annotation riêng, cấu hình không mang sang controller khác được. Dự án Ingress NGINX (`ingress-nginx`) đã ngừng bảo trì từ tháng 3/2026, không còn bản vá bảo mật. Lưu ý: bản thân API Ingress vẫn còn trong Kubernetes (được giữ ổn định, không phát triển thêm) và vẫn có các controller khác hỗ trợ; thứ bị ngừng là dự án controller ingress-nginx. Dự án mới nên dùng Gateway API.",
          "Gateway API tách vai trò rõ ràng: đội hạ tầng quản lý GatewayClass và Gateway, đội ứng dụng tự quản HTTPRoute của mình. Các tính năng như routing theo header, chia traffic theo trọng số là một phần của spec chuẩn, không cần annotation. Có nhiều bản cài đặt: Envoy Gateway, NGINX Gateway Fabric, Istio, Cilium, Traefik."
        ],
        list: [
          "GatewayClass: loại gateway, trỏ tới controller (`gateway.envoyproxy.io/gatewayclass-controller` với Envoy Gateway).",
          "Gateway: một điểm vào cụ thể với listener (cổng, giao thức, hostname, chứng chỉ TLS). Controller tạo proxy và Service LoadBalancer cho nó.",
          "HTTPRoute: quy tắc routing theo host, path, header tới các Service backend, gắn vào Gateway qua `parentRefs`."
        ]
      },
      {
        h: "Ví dụ: HTTPS, routing theo path, canary theo trọng số",
        code: {
          lang: "yaml", file: "gateway.yaml",
          src: `apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata: { name: eg }
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web
  namespace: infra
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  gatewayClassName: eg
  listeners:
    - name: http                 # cổng 80: redirect và ACME HTTP-01
      protocol: HTTP
      port: 80
      hostname: api.example.com
      allowedRoutes:
        namespaces: { from: Same }
    - name: https
      protocol: HTTPS
      port: 443
      hostname: api.example.com
      tls:
        mode: Terminate
        certificateRefs: [{ name: api-example-com-tls }]   # Secret cùng namespace với Gateway
      allowedRoutes:
        namespaces: { from: All }
---
# Redirect mọi request HTTP sang HTTPS
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: http-to-https
  namespace: infra
spec:
  parentRefs: [{ name: web, sectionName: http }]
  rules:
    - filters:
        - type: RequestRedirect
          requestRedirect: { scheme: https, statusCode: 301 }
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: task-api
  namespace: prod
spec:
  parentRefs: [{ name: web, namespace: infra, sectionName: https }]
  hostnames: ["api.example.com"]
  rules:
    - matches: [{ path: { type: PathPrefix, value: /v1 } }]
      backendRefs:
        - { name: task-api, port: 80, weight: 90 }
        - { name: task-api-canary, port: 80, weight: 10 }
---
# Issuer của cert-manager giải HTTP-01 qua chính Gateway
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata: { name: letsencrypt }
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef: { name: letsencrypt-account-key }
    solvers:
      - http01:
          gatewayHTTPRoute:
            parentRefs:
              - { name: web, namespace: infra, kind: Gateway }`
        },
        p: [
          "`sectionName` chọn listener cụ thể của Gateway mà route gắn vào: route redirect chỉ gắn vào listener `http`, route ứng dụng chỉ gắn vào `https`. Route ở namespace `prod` gắn được vào Gateway ở `infra` nhờ `allowedRoutes`. Trong production, nên giới hạn bằng `from: Selector` thay vì `All`. Nếu `backendRefs` trỏ tới Service ở namespace khác thì cần thêm ReferenceGrant."
        ]
      },
      {
        h: "TLS tự động với cert-manager",
        p: [
          "cert-manager hỗ trợ Gateway API: khi Gateway có annotation `cert-manager.io/cluster-issuer`, nó tự tạo Certificate cho các listener HTTPS có hostname và `tls.mode: Terminate`, lưu vào Secret được tham chiếu trong `certificateRefs`, và tự gia hạn. Secret này phải nằm cùng namespace với Gateway. Từ cert-manager 1.15, hỗ trợ này không còn là feature gate nhưng vẫn phải bật bằng Helm value `config.gatewayAPI.enabled=true`, và CRD của Gateway API phải được cài trước khi cert-manager khởi động (nếu cài sau thì restart cert-manager).",
          "Với HTTP-01, cert-manager tạm tạo một HTTPRoute cho đường dẫn `/.well-known/acme-challenge/<token>` gắn vào Gateway (theo `gatewayHTTPRoute.parentRefs` của issuer), nên Gateway cần listener HTTP cổng 80. Route challenge dùng path khớp chính xác nên được ưu tiên hơn route redirect bắt mọi path. Trạng thái Gateway có điều kiện `Programmed`; `kubectl get gateway` phải báo `True`."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get gatewayclass
kubectl get gateway -A
kubectl describe httproute task-api -n prod   # xem Accepted, ResolvedRefs trong status
kubectl get certificate -n infra`
        }
      }
    ],
    summary: [
      "Ingress NGINX đã ngừng bảo trì từ 3/2026; dự án mới dùng Gateway API.",
      "GatewayClass → Gateway → HTTPRoute, tách vai trò giữa đội hạ tầng và đội ứng dụng.",
      "Routing theo host/path/header và chia traffic theo `weight` nằm trong spec chuẩn.",
      "cert-manager cấp và gia hạn chứng chỉ cho listener HTTPS của Gateway."
    ],
    pitfalls: [
      "Làm theo hướng dẫn cũ cài ingress-nginx cho dự án mới: không còn bản vá bảo mật.",
      "HTTPRoute ở namespace khác không gắn được vào Gateway vì thiếu `allowedRoutes`; xem điều kiện `Accepted` trong status của route.",
      "Trỏ `backendRefs` sang Service khác namespace mà không có ReferenceGrant, route báo `ResolvedRefs: False`."
    ],
    quiz: [
      { q: "Thứ tự các resource trong Gateway API là gì?", options: ["Ingress → Service → Pod", "GatewayClass → Gateway → HTTPRoute", "HTTPRoute → GatewayClass → Gateway", "Gateway → Ingress → HTTPRoute"], answer: 1, explain: "GatewayClass chọn controller, Gateway là điểm vào cụ thể, HTTPRoute định nghĩa routing và gắn vào Gateway qua `parentRefs`." },
      { q: "Muốn gửi 10% traffic tới bản canary với Gateway API, bạn làm gì?", options: ["Thêm annotation canary của controller", "Đặt `weight` trong `backendRefs` của route", "Tạo hai Gateway với hai địa chỉ riêng", "Scale bản canary lên đúng 10 Pod"], answer: 1, explain: "Chia traffic theo trọng số là tính năng chuẩn trong `backendRefs`. Annotation là cách của Ingress cũ; tạo hai Gateway hay chỉnh số Pod không chia traffic chính xác." },
      { q: "Vì sao dự án mới không nên dùng ingress-nginx?", options: ["Vì nó không hỗ trợ HTTP/1.1", "Vì dự án đã ngừng nhận bản vá bảo mật", "Vì nó chỉ chạy được trên AWS", "Vì Kubernetes đã xoá API Service"], answer: 1, explain: "ingress-nginx ngừng bảo trì từ 3/2026. Thành phần đứng ở cửa ngõ Internet mà không có bản vá bảo mật là rủi ro lớn. Kubernetes khuyến nghị Gateway API cho dự án mới." }
    ]
  },
  "p10.m0.t5": {
    videos: [
      { id: "pMOmDQ7K0O4", title: "✅ #39 - Resource Quotas | Học Kubernetes & Amazon EKS Tiếng Việt", channel: "Viet Tran", lang: "vi", minutes: 12, embed: true },
      { id: "REKxEvzkJ2g", title: "✅ #40 - Limit Ranges | Học Kubernetes & Amazon EKS Tiếng Việt", channel: "Viet Tran", lang: "vi", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Namespace: phân vùng logic trong cluster",
        p: [
          "Namespace chia cluster thành các vùng tên riêng: hai namespace có thể cùng có Service `api` mà không xung đột. Namespace là đơn vị để gắn quyền RBAC, quota tài nguyên và NetworkPolicy. Cách chia phổ biến: theo đội (`team-payments`), theo ứng dụng, hoặc theo môi trường (`dev`, `staging`).",
          "Namespace không phải ranh giới bảo mật mạnh: mặc định Pod ở namespace này vẫn gọi được Pod ở namespace khác, và các Pod vẫn chung node, chung kernel. Với prod, nhiều tổ chức dùng cluster riêng hoặc ít nhất tài khoản riêng thay vì chỉ một namespace. Một số object là cluster-scoped, không thuộc namespace nào: Node, PersistentVolume, StorageClass, ClusterRole, GatewayClass."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl create namespace team-a
kubectl get pods -n team-a
kubectl config set-context --current --namespace=team-a   # đặt namespace mặc định
kubectl api-resources --namespaced=false                  # các loại object cluster-scoped`
        }
      },
      {
        h: "ResourceQuota và LimitRange",
        p: [
          "ResourceQuota giới hạn tổng tài nguyên một namespace được dùng: tổng CPU/memory requests và limits, số Pod, số Service LoadBalancer, số PVC. Khi namespace có quota cho CPU/memory, mọi Pod mới phải khai báo requests/limits tương ứng, nếu không sẽ bị từ chối.",
          "LimitRange đặt giá trị mặc định và giới hạn cho từng container trong namespace. Nó tự điền requests/limits cho container không khai báo, giúp Pod không bị quota từ chối và không có container nào chạy \"vô hạn\"."
        ],
        code: {
          lang: "yaml", file: "team-a-quota.yaml",
          src: `apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-a-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "8"
    requests.memory: 16Gi
    limits.memory: 32Gi
    pods: "50"
    services.loadbalancers: "0"
    persistentvolumeclaims: "10"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: defaults
  namespace: team-a
spec:
  limits:
    - type: Container
      defaultRequest: { cpu: 100m, memory: 128Mi }
      default: { memory: 256Mi }
      max: { cpu: "2", memory: 2Gi }`
        }
      },
      {
        h: "Kiểm tra mức sử dụng",
        p: [
          "Quota cũng là công cụ kiểm soát chi phí: `services.loadbalancers: \"0\"` ngăn một đội vô tình tạo load balancer tính phí của cloud, buộc mọi traffic vào qua Gateway chung.",
          "`kubectl describe resourcequota -n team-a` cho thấy cột Used và Hard. Khi Pod bị từ chối do quota, lỗi xuất hiện ở event của ReplicaSet (không phải Pod, vì Pod chưa được tạo), dạng `exceeded quota`. Hãy xem `kubectl get events -n team-a` hoặc `kubectl describe rs`."
        ]
      }
    ],
    summary: [
      "Namespace tách tên, quyền, quota và policy; không phải ranh giới bảo mật mạnh.",
      "Một số object là cluster-scoped: Node, PV, StorageClass, ClusterRole, GatewayClass.",
      "ResourceQuota giới hạn tổng tài nguyên của namespace.",
      "LimitRange đặt requests/limits mặc định và tối đa cho từng container."
    ],
    pitfalls: [
      "Thêm quota CPU/memory mà không có LimitRange, các Deployment không khai báo resources bị từ chối tạo Pod.",
      "Tìm lỗi quota trong `describe pod` nhưng Pod chưa từng được tạo; lỗi nằm ở event của ReplicaSet.",
      "Nghĩ namespace đã cô lập mạng; cần NetworkPolicy để chặn traffic giữa namespace."
    ],
    quiz: [
      { q: "Namespace có quota `requests.cpu`, Deployment không khai báo resources và không có LimitRange. Chuyện gì xảy ra?", options: ["Pod chạy bình thường", "Pod bị từ chối tạo vì thiếu requests", "Pod dùng CPU vô hạn", "Namespace bị xoá"], answer: 1, explain: "Khi quota theo dõi một tài nguyên, Pod phải khai báo tài nguyên đó. LimitRange sẽ tự điền mặc định để tránh lỗi này." },
      { q: "Object nào dưới đây là cluster-scoped?", options: ["Deployment", "Service", "StorageClass", "ConfigMap"], answer: 2, explain: "StorageClass áp dụng cho toàn cluster. Deployment, Service, ConfigMap đều thuộc một namespace." },
      { q: "Mặc định, Pod ở namespace `dev` có gọi được Service ở namespace `prod` không?", options: ["Không, namespace chặn mạng", "Có, trừ khi có NetworkPolicy chặn", "Chỉ khi cùng node", "Chỉ qua LoadBalancer"], answer: 1, explain: "Namespace không cô lập mạng. Mạng Kubernetes mặc định phẳng; muốn chặn phải dùng NetworkPolicy với CNI hỗ trợ." }
    ]
  },
  "p10.m1.t0": {
    videos: [
      { id: "bSEmsOeQ4IM", title: "Bài 26. ConfigMap Kubernetes | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 12, embed: true },
      { id: "9rNaO5p_0zo", title: "Bài 27. Secret Kubernetes | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 11, embed: true }
    ],
    sections: [
      {
        h: "Tách cấu hình khỏi image",
        p: [
          "Cùng một image phải chạy được ở dev, staging, prod; chỉ cấu hình khác nhau. ConfigMap lưu cấu hình không nhạy cảm (log level, URL dịch vụ, feature flag). Secret lưu dữ liệu nhạy cảm (mật khẩu DB, API key, chứng chỉ TLS). Cả hai đều có thể đưa vào Pod dưới dạng biến môi trường hoặc file mount.",
          "Khác biệt quan trọng: biến môi trường chỉ được đọc lúc container khởi động, nên đổi ConfigMap không có tác dụng cho đến khi Pod được tạo lại (`kubectl rollout restart`). File mount từ volume thì kubelet cập nhật sau một khoảng trễ, nhưng ứng dụng phải tự đọc lại file. Mount bằng `subPath` thì không được cập nhật."
        ],
        code: {
          lang: "yaml", file: "config.yaml",
          src: `apiVersion: v1
kind: ConfigMap
metadata: { name: task-api-config }
data:
  LOG_LEVEL: info
  FEATURE_EXPORT: "true"
---
apiVersion: v1
kind: Secret
metadata: { name: task-api-secret }
type: Opaque
stringData:                      # viết dạng rõ, API server lưu dưới dạng base64
  DATABASE_URL: postgres://app:change-me@db:5432/tasks
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: task-api }
spec:
  selector: { matchLabels: { app: task-api } }
  template:
    metadata: { labels: { app: task-api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:3f9c2ab
          envFrom:
            - configMapRef: { name: task-api-config }
            - secretRef: { name: task-api-secret }`
        }
      },
      {
        h: "Secret chỉ là base64",
        p: [
          "Base64 là mã hoá để truyền dữ liệu nhị phân, không phải mã hoá bảo mật. Ai có quyền `get secret` trong namespace đều đọc được, và với cluster tự dựng (kubeadm, k3s...) Secret mặc định được lưu trong etcd không mã hoá. Managed Kubernetes thường mã hoá sẵn ở tầng lưu trữ, nhưng điều đó không giúp gì nếu ai đó có quyền đọc Secret qua API. Vì vậy manifest Secret thật không bao giờ được commit vào Git."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get secret task-api-secret -o jsonpath='{.data.DATABASE_URL}' | base64 -d`
        },
        list: [
          "Với cluster tự dựng, bật encryption at rest cho etcd (`EncryptionConfiguration`). EKS (Kubernetes 1.28 trở lên) đã mặc định mã hoá envelope mọi dữ liệu API bằng KMS; bạn có thể chỉ định khoá KMS của mình (customer managed key) nếu cần kiểm soát khoá.",
          "Giới hạn RBAC: chỉ ServiceAccount cần mới được đọc Secret.",
          "Không in biến môi trường ra log, không đưa Secret vào ConfigMap."
        ]
      },
      {
        h: "External Secrets và các lựa chọn",
        p: [
          "Cách phổ biến ở production là giữ secret trong kho chuyên dụng (AWS Secrets Manager, SSM Parameter Store, Vault, GCP Secret Manager) và dùng External Secrets Operator đồng bộ vào Secret của Kubernetes. Manifest trong Git chỉ chứa tham chiếu, không chứa giá trị. Các lựa chọn khác: Sealed Secrets (mã hoá bằng khoá của controller, file mã hoá commit được vào Git), hoặc Secrets Store CSI Driver (mount thẳng từ kho secret thành file)."
        ],
        code: {
          lang: "yaml", file: "external-secret.yaml",
          src: `apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata: { name: task-api-secret }
spec:
  refreshInterval: 1h
  secretStoreRef: { name: aws-secrets-manager, kind: ClusterSecretStore }
  target: { name: task-api-secret }
  data:
    - secretKey: DATABASE_URL
      remoteRef: { key: prod/task-api/database-url }`
        }
      }
    ],
    summary: [
      "ConfigMap cho cấu hình thường, Secret cho dữ liệu nhạy cảm; đưa vào Pod qua env hoặc file.",
      "Đổi ConfigMap không cập nhật biến môi trường của Pod đang chạy; cần rollout restart.",
      "Secret chỉ là base64: bật mã hoá etcd, giới hạn RBAC, không commit vào Git.",
      "Production: External Secrets Operator, Sealed Secrets hoặc Secrets Store CSI Driver."
    ],
    pitfalls: [
      "Commit file Secret YAML vào Git vì nghĩ base64 là \"đã mã hoá\".",
      "Sửa ConfigMap rồi chờ ứng dụng nhận giá trị mới trong khi ứng dụng đọc qua biến môi trường.",
      "Cấp quyền `get secrets` trên toàn namespace cho ServiceAccount của ứng dụng không cần đến."
    ],
    quiz: [
      { q: "Phát biểu nào về Kubernetes Secret là đúng?", options: ["Secret luôn được mã hoá mạnh ở mọi nơi", "Giá trị Secret chỉ được encode base64", "Secret không đọc được bằng kubectl", "Secret tự đồng bộ từ AWS Secrets Manager"], answer: 1, explain: "Base64 giải mã được ngay, nên cần mã hoá etcd và giới hạn RBAC. Ai có quyền đọc Secret đều xem được bằng kubectl; đồng bộ từ AWS cần công cụ như External Secrets Operator." },
      { q: "Ứng dụng đọc `LOG_LEVEL` qua `envFrom`. Bạn sửa ConfigMap, cần làm gì để áp dụng?", options: ["Không cần làm gì, Pod tự nhận", "Chạy `kubectl rollout restart deploy/task-api`", "Xoá ConfigMap rồi tạo lại", "Khởi động lại node đang chạy Pod"], answer: 1, explain: "Biến môi trường được nạp khi container khởi động. Chỉ file mount (không dùng subPath) mới được kubelet cập nhật dần." },
      { q: "External Secrets Operator giải quyết vấn đề gì?", options: ["Giúp Pod khởi động nhanh hơn", "Git chỉ chứa tham chiếu tới secret", "Thay thế hoàn toàn ConfigMap", "Mã hoá traffic giữa các Pod"], answer: 1, explain: "Operator đồng bộ từ Secrets Manager/Vault vào Kubernetes Secret, nên không có giá trị nhạy cảm trong repo. Nó không liên quan tốc độ, ConfigMap hay mã hoá mạng." }
    ]
  },
  "p10.m1.t1": {
    videos: [
      { id: "QNq_RRooAew", title: "✅ #35 - Requests & Limits | Học Kubernetes & Amazon EKS Tiếng Việt", channel: "Viet Tran", lang: "vi", minutes: 13, embed: true }
    ],
    sections: [
      {
        h: "Requests và limits khác nhau thế nào",
        p: [
          "`requests` là lượng tài nguyên Pod được đảm bảo. Scheduler chỉ dựa vào requests để xếp Pod: node còn đủ phần chưa \"đặt chỗ\" thì mới nhận Pod, không quan tâm mức dùng thực tế. `limits` là trần tối đa container được dùng khi chạy.",
          "CPU và memory bị xử lý khác nhau khi chạm limit. CPU là tài nguyên nén được: vượt limit thì container bị throttle (chạy chậm lại), không bị giết. Memory không nén được: vượt memory limit thì kernel giết process, Pod báo `OOMKilled` và bị khởi động lại. Nếu node cạn memory, kubelet còn có thể evict Pod."
        ],
        code: {
          lang: "yaml", file: "resources.yaml",
          src: `apiVersion: apps/v1
kind: Deployment
metadata: { name: task-api }
spec:
  selector: { matchLabels: { app: task-api } }
  template:
    metadata: { labels: { app: task-api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:3f9c2ab
          resources:
            requests: { cpu: 100m, memory: 128Mi }   # 100m = 0.1 vCPU
            limits:   { memory: 256Mi }             # không đặt CPU limit
          env:
            - name: NODE_OPTIONS
              value: "--max-old-space-size=192"      # heap nhỏ hơn memory limit`
        }
      },
      {
        h: "QoS class",
        list: [
          "`Guaranteed`: mọi container đều đặt limits cho cả CPU và memory, và requests bằng limits (nếu chỉ đặt limits, Kubernetes tự lấy requests bằng limits). Bị evict sau cùng.",
          "`Burstable`: ít nhất một container có requests hoặc limits CPU/memory nhưng Pod không thoả Guaranteed. Phổ biến nhất.",
          "`BestEffort`: không có requests hay limits nào. Bị evict đầu tiên khi node thiếu tài nguyên."
        ],
        p: [
          "Xem QoS bằng `kubectl get pod <tên> -o jsonpath='{.status.qosClass}'`."
        ]
      },
      {
        h: "Đặt con số thế nào",
        p: [
          "Đặt requests gần mức sử dụng bình thường đo được (từ `kubectl top pod` hoặc Prometheus), memory limit cao hơn mức đỉnh một khoảng an toàn. Requests quá thấp: scheduler dồn quá nhiều Pod lên một node, chúng tranh nhau. Requests quá cao: lãng phí node, tốn tiền.",
          "Nhiều đội chọn không đặt CPU limit để tránh throttle không cần thiết, chỉ đặt CPU requests; đây là một đánh đổi, một số tổ chức vẫn bắt buộc CPU limit để công bằng giữa các đội. Memory limit thì nên luôn đặt. Với runtime có heap riêng (Node.js, JVM), hãy cấu hình heap nhỏ hơn limit để ứng dụng tự GC trước khi bị OOMKilled."
        ]
      }
    ],
    summary: [
      "Scheduler xếp Pod theo requests, không theo mức dùng thực tế.",
      "Vượt CPU limit bị throttle; vượt memory limit bị OOMKilled.",
      "QoS: Guaranteed, Burstable, BestEffort; BestEffort bị evict trước.",
      "Đặt requests theo số liệu đo được, luôn có memory limit, cấu hình heap nhỏ hơn limit."
    ],
    pitfalls: [
      "Không đặt requests lẫn limits: Pod là BestEffort, dễ bị evict, và HPA không tính được phần trăm CPU.",
      "Memory limit 256Mi nhưng heap Node.js mặc định có thể vượt, Pod OOMKilled liên tục dưới tải.",
      "Đặt requests quá cao \"cho chắc\", cluster đầy mà node thực tế gần như rảnh."
    ],
    quiz: [
      { q: "Scheduler dựa vào gì để quyết định node có đủ chỗ cho Pod?", options: ["Mức CPU và memory đang dùng thực tế", "Tổng requests so với allocatable của node", "Tổng limits so với dung lượng của node", "Số Pod đang chạy trên node"], answer: 1, explain: "Scheduler cộng requests, không nhìn mức dùng thực tế hay limits. Số Pod có giới hạn riêng nhưng không phải tiêu chí chính về tài nguyên." },
      { q: "Container vượt memory limit thì sao?", options: ["Bị throttle, chạy chậm lại", "Bị kernel giết, báo `OOMKilled`", "Được cấp thêm memory từ node", "Không có gì, limit chỉ để tham khảo"], answer: 1, explain: "Memory không nén được nên process bị giết. Throttle là hành vi khi vượt CPU limit." },
      { q: "Pod có requests bằng limits cho cả CPU và memory ở mọi container thuộc QoS class nào?", options: ["BestEffort", "Burstable", "Guaranteed", "Critical"], answer: 2, explain: "Guaranteed yêu cầu requests = limits cho cả CPU và memory. Không có class Critical; `system-cluster-critical` là PriorityClass, khái niệm khác." }
    ]
  },
  "p10.m1.t2": {
    videos: [
      { id: "x2e6pIBLKzw", title: "Day 18/40 - Kubernetes Health Probes Explained | Liveness vs Readiness Probes", channel: "Tech Tutorials with Piyush", lang: "en", minutes: 29, embed: true }
    ],
    sections: [
      {
        h: "Ba loại probe và câu hỏi mỗi loại trả lời",
        list: [
          "`startupProbe`: ứng dụng đã khởi động xong chưa? Trong lúc startup probe chưa thành công, readiness và liveness bị tạm hoãn. Dùng cho ứng dụng khởi động chậm (chạy migration, nạp cache).",
          "`readinessProbe`: Pod có nên nhận traffic lúc này không? Thất bại thì Pod bị rút khỏi endpoint của Service, nhưng không bị restart. Có thể dùng để tạm ngừng nhận traffic khi quá tải hoặc đang tắt.",
          "`livenessProbe`: process có bị treo không thể tự hồi phục không? Thất bại liên tiếp `failureThreshold` lần thì kubelet restart container."
        ],
        p: [
          "Mỗi probe có thể là `httpGet`, `tcpSocket`, `exec` hoặc `grpc`, với các tham số `periodSeconds`, `timeoutSeconds` (mặc định 1 giây), `failureThreshold`."
        ]
      },
      {
        h: "Cấu hình khuyến nghị",
        code: {
          lang: "yaml", file: "probes.yaml",
          src: `apiVersion: apps/v1
kind: Deployment
metadata: { name: task-api }
spec:
  selector: { matchLabels: { app: task-api } }
  template:
    metadata: { labels: { app: task-api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:3f9c2ab
          ports: [{ containerPort: 3000 }]
          startupProbe:
            httpGet: { path: /health, port: 3000 }
            periodSeconds: 2
            failureThreshold: 30        # tối đa 60 giây để khởi động
          readinessProbe:
            httpGet: { path: /health/ready, port: 3000 }
            periodSeconds: 5
            timeoutSeconds: 2
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3`
        },
        p: [
          "`/health` (liveness) chỉ kiểm tra process còn phản hồi, không gọi phụ thuộc. `/health/ready` (readiness) có thể kiểm tra kết nối DB nhanh, vì nếu DB không dùng được thì Pod không nên nhận request."
        ]
      },
      {
        h: "Sai probe gây restart liên tục",
        p: [
          "Lỗi kinh điển: liveness probe gọi tới DB. Khi DB chậm vài giây, mọi Pod đồng loạt fail liveness và bị restart cùng lúc; lúc khởi động lại chúng mở kết nối mới làm DB càng quá tải. Một sự cố nhỏ của DB biến thành sập toàn hệ thống. Liveness phải chỉ phụ thuộc chính process.",
          "Lỗi thứ hai: không có startup probe và liveness có `initialDelaySeconds` quá ngắn, ứng dụng bị giết trước khi kịp khởi động, rơi vào CrashLoopBackOff. Lỗi thứ ba: `timeoutSeconds` mặc định 1 giây quá ngắn khi GC hoặc CPU bị throttle. Hãy xem `kubectl describe pod` để thấy event `Liveness probe failed` hoặc `Readiness probe failed`."
        ]
      }
    ],
    summary: [
      "startup: đã khởi động xong chưa; readiness: có nhận traffic không; liveness: có cần restart không.",
      "Readiness thất bại chỉ rút Pod khỏi Service; liveness thất bại thì restart container.",
      "Liveness không được gọi phụ thuộc bên ngoài như DB.",
      "Dùng startup probe cho ứng dụng khởi động chậm thay vì `initialDelaySeconds` lớn cho liveness."
    ],
    pitfalls: [
      "Liveness gọi DB: DB chậm làm mọi Pod restart đồng loạt, sự cố lan rộng.",
      "Không có startup probe, liveness giết ứng dụng khởi động chậm, Pod kẹt CrashLoopBackOff.",
      "Dùng cùng một endpoint nặng cho cả ba probe với timeout mặc định 1 giây."
    ],
    quiz: [
      { q: "Readiness probe thất bại thì điều gì xảy ra?", options: ["Container bị kubelet restart", "Pod bị rút khỏi endpoint của Service", "Pod bị xoá và tạo lại", "Node chứa Pod bị drain"], answer: 1, explain: "Readiness chỉ điều khiển việc nhận traffic. Restart là hành vi của liveness." },
      { q: "Vì sao không nên để liveness probe kiểm tra kết nối DB?", options: ["Vì probe không kết nối được ra mạng", "Vì DB chậm làm mọi Pod restart cùng lúc", "Vì kiểm tra DB tốn nhiều memory", "Vì DB không trả về mã HTTP"], answer: 1, explain: "Restart không sửa được DB mà còn tạo thêm tải kết nối. Kiểm tra phụ thuộc thuộc về readiness." },
      { q: "Ứng dụng cần 45 giây để khởi động. Cấu hình nào hợp lý?", options: ["livenessProbe `periodSeconds: 1, failureThreshold: 3`", "startupProbe `periodSeconds: 2, failureThreshold: 30`", "Bỏ hết probe để không bị restart nhầm", "readinessProbe `periodSeconds: 5, failureThreshold: 1`"], answer: 1, explain: "Startup probe cho tối đa 2 x 30 = 60 giây để khởi động, trong thời gian đó liveness chưa chạy. Liveness 1 giây x 3 lần sẽ giết app sau khoảng 3 giây; readiness không restart nên không bảo vệ được giai đoạn khởi động; bỏ probe làm mất khả năng tự hồi phục và rolling update an toàn." }
    ]
  },
  "p10.m1.t3": {
    videos: [
      { id: "Ofn942zoL7g", title: "Bài 29. Horizontal Pod Autoscaler (HPA) Kubernetes | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 16, embed: true },
      { id: "hsJ2qtwoWZw", title: "Kubernetes Autoscaling: HPA vs. VPA vs. Keda vs. CA vs. Karpenter vs. Fargate", channel: "Anton Putra", lang: "en", minutes: 15, embed: true }
    ],
    sections: [
      {
        h: "HPA hoạt động thế nào",
        p: [
          "HorizontalPodAutoscaler (HPA) định kỳ đọc metric, tính số replica cần thiết và cập nhật `replicas` của Deployment. Công thức cơ bản: `desired = ceil(current * currentMetric / targetMetric)`; nếu tỉ lệ `currentMetric / targetMetric` đủ gần 1 (mặc định trong khoảng dung sai 10%), HPA không đổi gì để tránh dao động. Với CPU, \"utilization\" là phần trăm so với requests, nên container không có CPU requests thì HPA không tính được.",
          "HPA cần nguồn metric: metrics-server cho CPU/memory (API `metrics.k8s.io`), hoặc adapter như Prometheus Adapter hay KEDA cho custom metric (độ dài hàng đợi, request mỗi giây)."
        ],
        code: {
          lang: "yaml", file: "hpa.yaml",
          src: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: task-api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: task-api }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # chờ 5 phút ổn định mới giảm
      policies:
        - { type: Percent, value: 50, periodSeconds: 60 }`
        }
      },
      {
        h: "Chọn metric và tránh dao động",
        p: [
          "CPU phù hợp với API xử lý tính toán. Memory thường là metric kém cho autoscaling vì nhiều runtime không trả lại memory sau khi tải giảm, HPA không scale down được. Với worker xử lý hàng đợi, số message tồn đọng là metric tốt hơn nhiều; KEDA có sẵn scaler cho SQS, Kafka, RabbitMQ và có thể scale về 0.",
          "`behavior` điều khiển tốc độ scale. Scale up nhanh để chịu tải đột biến, scale down chậm để tránh dao động (flapping). Đừng để trường `replicas` trong manifest Deployment (hay values Helm) \"đánh nhau\" với HPA: khi dùng HPA, nên bỏ `replicas` khỏi manifest được apply liên tục."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get hpa task-api -w
kubectl describe hpa task-api     # xem sự kiện scale và lý do
kubectl top pods -l app=task-api`
        }
      },
      {
        h: "Scale node: Cluster Autoscaler và Karpenter",
        p: [
          "HPA chỉ thêm Pod. Nếu cluster không còn chỗ, Pod mới nằm `Pending`. Cluster Autoscaler theo dõi Pod Pending do thiếu tài nguyên và tăng kích thước node group (ví dụ ASG trên AWS); nó cũng gỡ node rảnh. Karpenter (phổ biến trên EKS) không dùng node group cố định mà tạo node trực tiếp với loại instance phù hợp nhất cho các Pod đang chờ, và gom Pod để giải phóng node thừa.",
          "Thời gian thêm node thường tính bằng phút, lâu hơn nhiều so với thêm Pod. Hãy giữ `minReplicas` đủ cho tải nền và để dư một ít sức chứa."
        ]
      }
    ],
    summary: [
      "HPA điều chỉnh replicas theo metric; CPU utilization tính theo phần trăm của requests.",
      "Cần metrics-server cho CPU/memory, adapter hoặc KEDA cho custom metric.",
      "`behavior` giúp scale up nhanh, scale down chậm để tránh dao động.",
      "Cluster Autoscaler/Karpenter thêm node khi Pod Pending vì thiếu tài nguyên."
    ],
    pitfalls: [
      "Không đặt CPU requests, HPA báo `<unknown>` và không bao giờ scale.",
      "Apply lại manifest có `replicas: 2` sau mỗi lần deploy, reset số replica mà HPA vừa scale lên.",
      "Scale theo memory với runtime không trả memory, HPA tăng mà không bao giờ giảm."
    ],
    quiz: [
      { q: "HPA hiện `<unknown>/70%` cho CPU. Nguyên nhân phổ biến?", options: ["`maxReplicas` đặt quá cao so với cluster", "Thiếu metrics-server hoặc thiếu CPU requests", "Service của Deployment sai selector", "Manifest dùng `autoscaling/v2` thay vì v1"], answer: 1, explain: "HPA cần metric từ metrics-server và cần requests để tính phần trăm. maxReplicas và selector của Service không ảnh hưởng; autoscaling/v2 là API đúng." },
      { q: "Có 4 Pod, CPU trung bình 140% so với requests, target 70%. HPA muốn bao nhiêu replica?", options: ["4", "6", "8", "14"], answer: 2, explain: "ceil(4 * 140 / 70) = 8, sau đó bị giới hạn bởi min/max và behavior." },
      { q: "HPA tạo thêm Pod nhưng chúng nằm `Pending` vì node hết chỗ. Cần gì?", options: ["Tăng `averageUtilization` của HPA", "Cài Cluster Autoscaler hoặc Karpenter", "Xoá HPA và scale bằng tay", "Đổi Service sang kiểu NodePort"], answer: 1, explain: "HPA chỉ scale Pod; thêm node là việc của Cluster Autoscaler/Karpenter. Các lựa chọn khác không tạo thêm sức chứa." }
    ]
  },
  "p10.m1.t4": {
    videos: [
      { id: "mQpQOtaTneo", title: "Bài 33. StorageClass Kubernetes | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 9, embed: true },
      { id: "pPQKAR1pA9U", title: "Kubernetes StatefulSet simply explained | Deployment vs StatefulSet", channel: "TechWorld with Nana", lang: "en", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "StatefulSet khác Deployment ở đâu",
        p: [
          "Deployment coi các Pod là giống hệt và thay thế được. Ứng dụng có trạng thái như database, Kafka, Elasticsearch cần nhiều hơn: danh tính ổn định và ổ đĩa riêng gắn theo từng replica. StatefulSet cung cấp:"
        ],
        list: [
          "Tên Pod ổn định theo thứ tự: `pg-0`, `pg-1`, `pg-2`; Pod bị thay vẫn giữ tên cũ.",
          "DNS ổn định cho từng Pod qua headless Service: `pg-0.pg.default.svc.cluster.local`.",
          "Mỗi Pod có PVC riêng từ `volumeClaimTemplates`; Pod tạo lại vẫn gắn đúng PVC cũ.",
          "Mặc định tạo, xoá, cập nhật tuần tự theo thứ tự."
        ]
      },
      {
        h: "PV, PVC và StorageClass",
        p: [
          "PersistentVolumeClaim (PVC) là yêu cầu lưu trữ của workload (\"cần 20Gi, đọc ghi một node\"). PersistentVolume (PV) là ổ đĩa thật đáp ứng yêu cầu đó. StorageClass mô tả loại ổ và provisioner; với dynamic provisioning, tạo PVC là CSI driver tự tạo ổ (ví dụ EBS gp3 qua EBS CSI driver) và PV tương ứng. `reclaimPolicy` quyết định ổ bị xoá hay giữ lại khi PVC bị xoá.",
          "Access mode phổ biến: `ReadWriteOnce` (gắn đọc ghi vào một node, như EBS), `ReadWriteMany` (nhiều node cùng lúc, như EFS/NFS). Xoá StatefulSet không xoá PVC theo mặc định, để tránh mất dữ liệu; trường `persistentVolumeClaimRetentionPolicy` (stable từ 1.32) cho phép đổi hành vi này nếu thật sự muốn.",
          "Tên StorageClass (như `gp3` bên dưới) không có sẵn: cluster chỉ có những StorageClass được tạo ra, và tùy nền tảng có thể không có class mặc định nào. Hãy xem bằng `kubectl get storageclass`. Với EBS, đặt `volumeBindingMode: WaitForFirstConsumer` để ổ chỉ được tạo sau khi Pod đã được xếp lên node, nhờ vậy ổ nằm đúng AZ của node. Trên EKS dùng EBS CSI driver thì provisioner là `ebs.csi.aws.com`; EKS Auto Mode dùng provisioner riêng `ebs.csi.eks.amazonaws.com`."
        ],
        code: {
          lang: "yaml", file: "statefulset.yaml",
          src: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: { name: gp3 }
provisioner: ebs.csi.aws.com         # EBS CSI driver
parameters:
  type: gp3
  encrypted: "true"
reclaimPolicy: Delete                # đổi thành Retain nếu muốn giữ ổ khi xoá PVC
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
---
apiVersion: v1
kind: Service
metadata: { name: redis }
spec:
  clusterIP: None           # headless
  selector: { app: redis }
  ports: [{ port: 6379 }]
---
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: redis }
spec:
  serviceName: redis
  replicas: 1
  selector: { matchLabels: { app: redis } }
  template:
    metadata: { labels: { app: redis } }
    spec:
      containers:
        - name: redis
          image: redis:7.4
          args: ["--appendonly", "yes"]
          ports: [{ containerPort: 6379 }]
          volumeMounts:
            - { name: data, mountPath: /data }
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: gp3
        resources: { requests: { storage: 10Gi } }`
        }
      },
      {
        h: "Có nên chạy database trên Kubernetes?",
        p: [
          "Về kỹ thuật là được, và có operator trưởng thành như CloudNativePG cho Postgres. Nhưng chạy DB production đòi hỏi backup, point-in-time recovery, nâng cấp major version, failover, giám sát đĩa. Với đa số đội ứng dụng, dùng DB managed (RDS, Cloud SQL) đưa gánh nặng đó sang nhà cung cấp, cho phép cluster Kubernetes chỉ chạy workload stateless, dễ thay thế và nâng cấp.",
          "StatefulSet vẫn rất hữu ích cho môi trường dev/preview, cache có thể tái tạo, hoặc khi đội có chuyên môn vận hành và lý do rõ ràng (chi phí, on-premise)."
        ]
      }
    ],
    summary: [
      "StatefulSet cho tên Pod ổn định, DNS riêng từng Pod và PVC riêng từng replica.",
      "PVC là yêu cầu, PV là ổ thật, StorageClass mô tả loại ổ và provisioner.",
      "ReadWriteOnce gắn vào một node; ReadWriteMany cho nhiều node.",
      "Production: ưu tiên DB managed thay vì tự chạy DB trên Kubernetes."
    ],
    pitfalls: [
      "Chạy database bằng Deployment với `emptyDir`, Pod bị thay là mất sạch dữ liệu.",
      "Xoá namespace hoặc PVC với StorageClass `reclaimPolicy: Delete`, ổ đĩa và dữ liệu bị xoá vĩnh viễn.",
      "Dùng EBS (ReadWriteOnce, gắn một AZ) rồi Pod bị lên lịch sang node ở AZ khác, kẹt Pending; dùng `volumeBindingMode: WaitForFirstConsumer` và đảm bảo mỗi AZ đều có node."
    ],
    quiz: [
      { q: "Khi Pod `pg-1` của StatefulSet bị xoá, Pod mới sẽ thế nào?", options: ["Có tên ngẫu nhiên và PVC mới", "Vẫn tên `pg-1` và gắn lại PVC cũ", "Không được tạo lại", "Gắn PVC của `pg-0`"], answer: 1, explain: "StatefulSet giữ danh tính và ổ đĩa theo thứ tự. Tên ngẫu nhiên là hành vi của Deployment." },
      { q: "StorageClass đóng vai trò gì?", options: ["Trực tiếp lưu dữ liệu của Pod", "Mô tả loại ổ và provisioner để tạo PV", "Thay cho PVC khi khai báo workload", "Định nghĩa nơi lưu ConfigMap"], answer: 1, explain: "StorageClass là \"khuôn\" để provisioner (CSI driver) tạo ổ. PVC vẫn cần để yêu cầu dung lượng; ConfigMap không dùng StorageClass." },
      { q: "Với đa số đội ứng dụng, cách chạy Postgres production được khuyến nghị?", options: ["Deployment với emptyDir", "StatefulSet tự viết", "DB managed như RDS hoặc Cloud SQL", "Chạy trong sidecar"], answer: 2, explain: "DB managed lo backup, failover, nâng cấp. Tự vận hành trên K8s cần chuyên môn và operator; emptyDir và sidecar không bền vững." }
    ]
  },
  "p10.m1.t5": {
    videos: [
      { id: "cWUbkuzc8dM", title: "Jobs and CronJobs in Kubernetes", channel: "Pavan Elthepu", lang: "en", minutes: 17, embed: true }
    ],
    sections: [
      {
        h: "Job: chạy đến khi hoàn thành",
        p: [
          "Deployment giữ process chạy mãi; Job chạy Pod cho đến khi kết thúc thành công. Dùng cho migration DB, import dữ liệu, gửi email hàng loạt. Nếu Pod thất bại, Job tạo lại cho đến `backoffLimit` lần. `activeDeadlineSeconds` giới hạn tổng thời gian, `ttlSecondsAfterFinished` tự dọn Job đã xong để không tích tụ.",
          "Pod của Job phải có `restartPolicy: Never` hoặc `OnFailure`. Với `Never`, mỗi lần thử là một Pod mới, giữ được log của lần thất bại để xem.",
          "Job còn chạy song song được với `parallelism` và `completions`, ví dụ chia một lượng lớn bản ghi cho nhiều Pod xử lý. Đặt tên Job kèm phiên bản (như commit SHA) vì template của Job không sửa được sau khi tạo; muốn chạy lại phải xoá Job cũ hoặc tạo Job tên mới."
        ],
        code: {
          lang: "yaml", file: "migrate-job.yaml",
          src: `apiVersion: batch/v1
kind: Job
metadata:
  name: task-api-migrate-3f9c2ab
spec:
  backoffLimit: 2
  activeDeadlineSeconds: 600
  ttlSecondsAfterFinished: 3600
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/my-org/task-api:3f9c2ab
          command: ["node", "dist/migrate.js"]
          envFrom:
            - secretRef: { name: task-api-secret }`
        }
      },
      {
        h: "Migration trong quy trình deploy",
        p: [
          "Chạy migration như một Job riêng trước khi rollout Deployment, thay vì chạy lúc khởi động mỗi Pod (nhiều replica sẽ đua nhau migrate). Trong pipeline: apply Job, chờ hoàn thành, rồi mới cập nhật image của Deployment. Với Helm có thể dùng hook `pre-upgrade`; với Argo CD dùng hook `PreSync`.",
          "Migration nên tương thích ngược (expand/contract): thêm cột trước, code mới dùng cột mới, xoá cột cũ ở release sau. Trong rolling update, phiên bản cũ và mới chạy song song với cùng schema."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl apply -f migrate-job.yaml
kubectl wait --for=condition=complete job/task-api-migrate-3f9c2ab --timeout=10m
kubectl logs job/task-api-migrate-3f9c2ab
kubectl set image deploy/task-api api=ghcr.io/my-org/task-api:3f9c2ab`
        }
      },
      {
        h: "CronJob: tác vụ định kỳ",
        p: [
          "CronJob tạo Job theo lịch cron. `timeZone` chỉ định múi giờ (nếu không, dùng múi giờ của controller, thường là UTC). `concurrencyPolicy: Forbid` không cho chạy chồng khi lần trước chưa xong. Job có thể chạy hai lần hoặc bị bỏ lỡ trong vài trường hợp, nên tác vụ phải idempotent."
        ],
        code: {
          lang: "yaml", file: "cleanup-cronjob.yaml",
          src: `apiVersion: batch/v1
kind: CronJob
metadata: { name: cleanup-expired }
spec:
  schedule: "0 2 * * *"            # 2 giờ sáng mỗi ngày
  timeZone: "Asia/Ho_Chi_Minh"
  concurrencyPolicy: Forbid
  startingDeadlineSeconds: 300
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      backoffLimit: 1
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: cleanup
              image: ghcr.io/my-org/task-api:3f9c2ab
              command: ["node", "dist/jobs/cleanup.js"]`
        }
      }
    ],
    summary: [
      "Job chạy đến khi thành công, thử lại tới `backoffLimit`, tự dọn bằng `ttlSecondsAfterFinished`.",
      "Chạy migration bằng Job riêng trước khi rollout, không chạy trong mỗi Pod lúc khởi động.",
      "CronJob chạy theo lịch; đặt `timeZone`, `concurrencyPolicy: Forbid`.",
      "Tác vụ định kỳ phải idempotent vì có thể chạy hai lần."
    ],
    pitfalls: [
      "Chạy migration ở entrypoint của ứng dụng, nhiều replica cùng migrate gây lock hoặc lỗi.",
      "Quên `timeZone`, CronJob chạy theo UTC lệch 7 tiếng so với dự định.",
      "Không đặt `ttlSecondsAfterFinished` hoặc history limit, hàng trăm Job và Pod cũ tích tụ."
    ],
    quiz: [
      { q: "Vì sao nên chạy migration như một Job riêng thay vì trong entrypoint của ứng dụng?", options: ["Vì Job chạy migration nhanh hơn", "Vì chỉ chạy một lần, trước khi rollout", "Vì Deployment không chạy được lệnh", "Vì Job không cần image của ứng dụng"], answer: 1, explain: "Một Job chạy một lần, tránh nhiều replica cùng migrate, và pipeline chờ nó thành công rồi mới rollout. Job vẫn cần image; Deployment vẫn chạy lệnh được nhưng mỗi replica sẽ chạy." },
      { q: "`concurrencyPolicy: Forbid` trong CronJob nghĩa là gì?", options: ["CronJob bị tạm dừng hoàn toàn", "Bỏ qua lần mới nếu lần trước chưa xong", "Cho các lần chạy chồng lên nhau", "Huỷ lần trước để chạy lần mới"], answer: 1, explain: "Forbid bỏ qua lần mới; `Replace` mới là huỷ lần cũ; `Allow` (mặc định) cho chạy song song." },
      { q: "Pod của Job được phép dùng `restartPolicy` nào?", options: ["Chỉ `Always`", "`Never` hoặc `OnFailure`", "`Always` hoặc `OnFailure`", "Bất kỳ giá trị nào"], answer: 1, explain: "Job cần Pod kết thúc được, nên `Always` không hợp lệ cho Pod template của Job." }
    ]
  },
  "p10.m1.t6": {
    videos: [
      { id: "iE9Qb8dHqWI", title: "Kubernetes RBAC Explained", channel: "Anton Putra", lang: "en", minutes: 23, embed: true }
    ],
    sections: [
      {
        h: "RBAC: ai được làm gì",
        p: [
          "Mọi request tới apiserver đều qua xác thực (bạn là ai) và phân quyền (bạn được làm gì). RBAC mô tả quyền bằng các verb (`get`, `list`, `watch`, `create`, `update`, `patch`, `delete`) trên resource (`pods`, `deployments`, `secrets`) trong API group. RBAC chỉ có quy tắc cho phép, không có deny; mặc định không có quyền gì."
        ],
        list: [
          "Role: tập quyền trong một namespace.",
          "ClusterRole: tập quyền cho toàn cluster hoặc cho resource cluster-scoped; cũng có thể dùng lại trong từng namespace.",
          "RoleBinding: gán Role (hoặc ClusterRole) cho user, group hoặc ServiceAccount trong một namespace.",
          "ClusterRoleBinding: gán ClusterRole trên toàn cluster. Cẩn trọng nhất với loại này."
        ]
      },
      {
        h: "ServiceAccount cho Pod",
        p: [
          "ServiceAccount là danh tính của workload. Mỗi namespace có ServiceAccount `default`; Pod không chỉ định sẽ dùng nó. Kubelet mount token ngắn hạn vào Pod để gọi apiserver. Đa số ứng dụng web không cần gọi Kubernetes API, nên hãy tắt mount token bằng `automountServiceAccountToken: false`.",
          "Với ứng dụng cần gọi API, ví dụ một controller đọc ConfigMap, tạo ServiceAccount riêng với đúng quyền cần. Gán ServiceAccount cho Pod bằng `spec.serviceAccountName`; mỗi ứng dụng một ServiceAccount giúp audit log cho biết chính xác ứng dụng nào đã gọi gì."
        ],
        code: {
          lang: "yaml", file: "rbac.yaml",
          src: `apiVersion: v1
kind: ServiceAccount
metadata: { name: config-reader, namespace: prod }
automountServiceAccountToken: true
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: read-configmaps, namespace: prod }
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: config-reader, namespace: prod }
subjects:
  - kind: ServiceAccount
    name: config-reader
    namespace: prod
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: read-configmaps`
        }
      },
      {
        h: "Quyền cho CI và kiểm tra",
        p: [
          "Pipeline deploy chỉ nên có quyền trong namespace mà nó deploy, với verb vừa đủ trên Deployment, Service, ConfigMap, HTTPRoute..., không có `cluster-admin`. Trên EKS, CI nhận credential AWS qua OIDC rồi được ánh xạ vào danh tính Kubernetes bằng EKS access entries. Với Pod cần gọi AWS API (S3, SQS), dùng EKS Pod Identity hoặc IRSA để gắn IAM role vào ServiceAccount, không đặt access key trong Secret.",
          "Kiểm tra quyền thực tế bằng `kubectl auth can-i`."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl auth can-i list configmaps -n prod \\
  --as=system:serviceaccount:prod:config-reader      # yes
kubectl auth can-i get secrets -n prod \\
  --as=system:serviceaccount:prod:config-reader      # no
kubectl auth can-i --list -n prod --as=system:serviceaccount:prod:config-reader`
        }
      }
    ],
    summary: [
      "RBAC chỉ có allow: Role/ClusterRole định nghĩa quyền, RoleBinding/ClusterRoleBinding gán quyền.",
      "ServiceAccount là danh tính của Pod; tắt mount token nếu ứng dụng không gọi Kubernetes API.",
      "CI chỉ có quyền trong namespace cần deploy, không dùng cluster-admin.",
      "Kiểm tra bằng `kubectl auth can-i --as=...`."
    ],
    pitfalls: [
      "Gán `cluster-admin` cho ServiceAccount của CI hoặc ứng dụng cho nhanh; token lộ là mất cả cluster.",
      "Cấp quyền `list secrets` vì nghĩ vô hại; `list` trả về cả nội dung Secret.",
      "Dùng chung ServiceAccount `default` cho mọi ứng dụng, rồi cấp quyền cho nó, mọi Pod trong namespace đều có quyền đó."
    ],
    quiz: [
      { q: "Muốn cấp quyền đọc ConfigMap chỉ trong namespace `prod` cho một ServiceAccount, dùng gì?", options: ["ClusterRoleBinding tới `cluster-admin`", "Role và RoleBinding trong `prod`", "NetworkPolicy trong `prod`", "ResourceQuota trong `prod`"], answer: 1, explain: "Role và RoleBinding giới hạn trong namespace. ClusterRoleBinding cấp toàn cluster; NetworkPolicy và ResourceQuota không liên quan phân quyền API." },
      { q: "Vì sao quyền `list` trên `secrets` nguy hiểm tương đương `get`?", options: ["Vì `list` xoá Secret sau khi đọc", "Vì kết quả `list` chứa cả dữ liệu Secret", "Vì `list` làm apiserver quá tải", "Không nguy hiểm, `list` chỉ trả về tên"], answer: 1, explain: "API trả về object đầy đủ, gồm trường `data`, khi list. Vì vậy chỉ cấp khi thật cần." },
      { q: "Ứng dụng web không gọi Kubernetes API. Nên cấu hình gì với ServiceAccount token?", options: ["Cấp thêm quyền admin cho ServiceAccount", "Đặt `automountServiceAccountToken: false`", "Tạo token Secret dài hạn để mount", "Giữ mặc định, token không có rủi ro"], answer: 1, explain: "Không mount token nghĩa là nếu ứng dụng bị chiếm, kẻ tấn công không có credential gọi apiserver. Cấp thêm quyền hay token vĩnh viễn làm rủi ro tăng." }
    ]
  },
  "p10.m1.t7": {
    videos: [
      { id: "18FEA5xXBGY", title: "Kubernetes Network Policies Explained", channel: "DevOps & AI Toolkit", lang: "en", minutes: 19, embed: true },
      { id: "-CgB4bSkMYI", title: "How to Secure a Kubernetes pod in Minutes!", channel: "That DevOps Guy", lang: "en", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "NetworkPolicy: chặn mặc định, mở có chủ đích",
        p: [
          "Mạng Kubernetes mặc định phẳng: mọi Pod gọi được mọi Pod. Nếu một Pod bị chiếm, kẻ tấn công có thể dò tới DB, cache, Pod của đội khác. NetworkPolicy giới hạn traffic theo label, namespace và cổng. Nó chỉ có hiệu lực khi CNI hỗ trợ (Calico, Cilium, và trên EKS là VPC CNI khi bật tính năng network policy); với CNI không hỗ trợ, policy được tạo nhưng không có tác dụng.",
          "Khi một Pod được chọn bởi ít nhất một policy cho chiều ingress, mọi traffic vào không khớp policy nào đều bị chặn. Mô hình tốt: một policy deny-all cho namespace, rồi thêm policy mở từng luồng cần thiết. Nếu chặn egress, nhớ mở DNS (cổng 53 tới CoreDNS), nếu không mọi truy vấn tên đều hỏng."
        ],
        code: {
          lang: "yaml", file: "netpol.yaml",
          src: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: prod }
spec:
  podSelector: {}            # chọn mọi Pod trong namespace
  policyTypes: ["Ingress"]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-gateway-to-api, namespace: prod }
spec:
  podSelector: { matchLabels: { app: task-api } }
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - namespaceSelector:
            matchLabels: { kubernetes.io/metadata.name: envoy-gateway-system }
      ports: [{ protocol: TCP, port: 3000 }]`
        }
      },
      {
        h: "Pod Security: container chạy với ít quyền nhất",
        p: [
          "`securityContext` giảm thiệt hại nếu ứng dụng bị khai thác: không chạy root, không leo thang quyền, filesystem gốc chỉ đọc, bỏ mọi Linux capability. Với `readOnlyRootFilesystem: true`, ứng dụng cần thư mục ghi tạm thì mount `emptyDir` vào `/tmp`."
        ],
        code: {
          lang: "yaml", file: "secure-deployment.yaml",
          src: `apiVersion: apps/v1
kind: Deployment
metadata: { name: task-api, namespace: prod }
spec:
  selector: { matchLabels: { app: task-api } }
  template:
    metadata: { labels: { app: task-api } }
    spec:
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:3f9c2ab
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
          volumeMounts:
            - { name: tmp, mountPath: /tmp }
      volumes:
        - name: tmp
          emptyDir: {}`
        }
      },
      {
        h: "Pod Security Admission",
        p: [
          "Pod Security Admission (tích hợp sẵn, thay PodSecurityPolicy đã bị xoá từ 1.25) áp các chuẩn Pod Security Standards ở mức namespace qua label: `privileged`, `baseline`, `restricted`. Mỗi chuẩn có ba chế độ: `enforce` (từ chối Pod vi phạm), `warn` (cảnh báo khi apply), `audit` (ghi audit log). Manifest ở trên đáp ứng mức `restricted`.",
          "Nên bắt đầu bằng `warn` để thấy Pod nào vi phạm, sửa manifest, rồi mới bật `enforce`. Với chính sách chi tiết hơn (bắt buộc image từ registry nội bộ, cấm tag `latest`), dùng Kyverno hoặc ValidatingAdmissionPolicy."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl label namespace prod \\
  pod-security.kubernetes.io/enforce=restricted \\
  pod-security.kubernetes.io/warn=restricted --overwrite`
        }
      }
    ],
    summary: [
      "Mạng mặc định phẳng; NetworkPolicy deny-all rồi mở từng luồng, cần CNI hỗ trợ.",
      "Chặn egress thì phải mở DNS.",
      "`runAsNonRoot`, `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem`, drop ALL capabilities.",
      "Pod Security Admission áp chuẩn `baseline`/`restricted` theo label namespace; bắt đầu bằng `warn`."
    ],
    pitfalls: [
      "Tạo NetworkPolicy trên cluster có CNI không hỗ trợ và tưởng đã được bảo vệ.",
      "Policy chặn egress nhưng quên mở cổng 53 tới CoreDNS, mọi kết nối theo tên đều lỗi.",
      "Bật `readOnlyRootFilesystem` mà ứng dụng cần ghi `/tmp`, Pod crash; mount `emptyDir` cho thư mục ghi tạm."
    ],
    quiz: [
      { q: "Namespace có policy `podSelector: {}` với `policyTypes: [\"Ingress\"]` và không có rule ingress nào. Kết quả?", options: ["Mở mọi traffic vào các Pod", "Chặn mọi traffic vào các Pod", "Chặn mọi traffic ra từ các Pod", "Không có tác dụng vì thiếu rule"], answer: 1, explain: "Chọn mọi Pod và không có rule cho phép nghĩa là deny-all chiều vào. Chiều ra không bị ảnh hưởng vì không khai báo Egress." },
      { q: "PodSecurityPolicy đã được thay bằng gì?", options: ["NetworkPolicy", "Pod Security Admission", "RBAC", "ResourceQuota"], answer: 1, explain: "PSP bị xoá từ 1.25; Pod Security Admission tích hợp sẵn áp chuẩn privileged/baseline/restricted qua label namespace." },
      { q: "Thiết lập nào giúp kẻ tấn công không thể ghi đè binary trong container?", options: ["`runAsUser: 0`", "`readOnlyRootFilesystem: true`", "`privileged: true`", "`hostNetwork: true`"], answer: 1, explain: "Filesystem gốc chỉ đọc ngăn việc sửa file trong image. Các lựa chọn còn lại đều tăng quyền và rủi ro." }
    ]
  },
  "p10.m2.t0": {
    videos: [
      { id: "wS277TdV3f8", title: "Important Kubernetes kubectl Command with Examples in 20 minutes!", channel: "Cloud Champ", lang: "en", minutes: 24, embed: true },
      { id: "AMUQzyPvO04", title: "K9s | The BEST Terminal UI for Kubernetes (2025)", channel: "Better Stack", lang: "en", minutes: 5, embed: true }
    ],
    sections: [
      {
        h: "Nhóm lệnh dùng hằng ngày",
        p: [
          "`kubectl` là client gọi Kubernetes API. Gần như mọi thao tác theo mẫu `kubectl <verb> <resource> <tên> [-n namespace]`. Thành thạo vài chục lệnh dưới đây là đủ cho phần lớn công việc vận hành và debug.",
          "Resource có tên viết tắt (`po`, `deploy`, `svc`, `ns`, `cm`) và có thể viết dạng `loại/tên` như `deploy/task-api`. Với `logs` và `exec`, chỉ định `deploy/task-api` thì kubectl tự chọn một Pod của Deployment đó, tiện khi tên Pod thay đổi sau mỗi lần deploy.",
          "Nên ưu tiên `apply` với file manifest nằm trong Git (cách khai báo) thay vì các lệnh mệnh lệnh như `create`, `scale`, `set image` trên môi trường thật. Lệnh mệnh lệnh vẫn rất hữu ích để thử nghiệm và sinh YAML mẫu bằng `--dry-run=client -o yaml`."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `# Xem
kubectl get pods -n prod -o wide              # thêm IP, node
kubectl get deploy,svc,httproute -n prod
kubectl get pods -A -l app=task-api           # mọi namespace, lọc theo label
kubectl describe pod <tên-pod> -n prod        # chi tiết + Events
kubectl get pod <tên-pod> -o yaml             # object đầy đủ, gồm status

# Log và vào container
kubectl logs deploy/task-api -n prod -f --since=10m
kubectl logs <tên-pod> -c api --previous      # log của lần chạy trước khi crash
kubectl exec -it <tên-pod> -n prod -- sh

# Truy cập tạm thời từ máy bạn
kubectl port-forward svc/task-api 8080:80 -n prod

# Thay đổi
kubectl apply -f k8s/
kubectl diff -f k8s/                          # xem trước thay đổi
kubectl scale deploy/task-api --replicas=4 -n prod
kubectl delete -f k8s/old.yaml`
        }
      },
      {
        h: "Output và truy vấn",
        p: [
          "`-o yaml` hoặc `-o json` cho object đầy đủ, rất hữu ích để xem trường `status` và giá trị mặc định mà API server đã điền. `-o jsonpath` và `-o custom-columns` trích đúng trường cần. `kubectl explain` cho tài liệu của từng trường ngay trong terminal, chính xác theo phiên bản cluster của bạn."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get pods -n prod -o jsonpath='{range .items[*]}{.metadata.name}{"\\t"}{.status.phase}{"\\n"}{end}'
kubectl get pods -n prod -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName
kubectl explain deployment.spec.strategy.rollingUpdate
kubectl create deployment demo --image=nginx --dry-run=client -o yaml > demo.yaml`
        }
      },
      {
        h: "Context, namespace và k9s",
        p: [
          "File kubeconfig (`~/.kube/config`) chứa nhiều cluster, user và context. Context là bộ ba cluster + user + namespace mặc định. Nhầm context là cách phổ biến nhất để chạy lệnh dành cho staging lên production.",
          "k9s là giao diện terminal cho Kubernetes: duyệt resource, xem log, exec, xoá Pod bằng phím tắt. Nó tăng tốc thao tác đáng kể, nhưng vẫn cần hiểu lệnh kubectl bên dưới để viết script và làm việc trong CI."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl config get-contexts
kubectl config current-context
kubectl config use-context staging
kubectl config set-context --current --namespace=prod
k9s --context staging -n prod`
        }
      }
    ],
    summary: [
      "`get`, `describe`, `logs`, `exec`, `port-forward`, `apply`, `diff` là bộ lệnh cốt lõi.",
      "`-o yaml`, `jsonpath`, `custom-columns` để xem và trích dữ liệu; `explain` để tra trường.",
      "`logs --previous` xem log trước khi container crash.",
      "Luôn kiểm tra context hiện tại trước lệnh thay đổi; k9s giúp thao tác nhanh."
    ],
    pitfalls: [
      "Chạy `kubectl delete` hoặc `apply` khi context đang trỏ vào production; hiển thị context trên prompt shell để tránh.",
      "Xem log của container mới khởi động lại và không thấy lỗi; dùng `--previous` để xem lần chạy bị crash.",
      "Sửa trực tiếp bằng `kubectl edit` trên production, thay đổi không nằm trong Git và bị ghi đè ở lần deploy sau."
    ],
    quiz: [
      { q: "Pod vừa crash và khởi động lại. Lệnh nào xem log của lần chạy bị crash?", options: ["`kubectl logs <pod>`", "`kubectl logs <pod> --previous`", "`kubectl describe node`", "`kubectl get events -o yaml`"], answer: 1, explain: "`--previous` lấy log của container instance trước đó. Không có cờ này, bạn thấy log của lần chạy mới." },
      { q: "Muốn gọi thử Service trong cluster từ máy mình mà không phơi ra Internet, dùng gì?", options: ["Đổi Service sang `type: LoadBalancer`", "`kubectl port-forward svc/task-api 8080:80`", "`kubectl expose deploy/task-api --type=NodePort`", "Thêm bản ghi cho Service vào CoreDNS"], answer: 1, explain: "port-forward tạo đường hầm tạm từ máy bạn qua apiserver. LoadBalancer và expose tạo điểm truy cập lâu dài." },
      { q: "Context trong kubeconfig gồm những gì?", options: ["Chỉ tên và địa chỉ cluster", "Cluster, user và namespace mặc định", "Danh sách Pod và Service đang chạy", "Tài khoản root của các node"], answer: 1, explain: "Context gom cluster, thông tin xác thực người dùng và namespace mặc định; đổi context là đổi nơi lệnh được thực thi." }
    ]
  },
  "p10.m2.t1": {
    sections: [
      {
        h: "Quy trình debug chung",
        p: [
          "Hầu hết sự cố đều trả lời được bằng ba lệnh theo thứ tự: `kubectl get pods` để xem trạng thái, `kubectl describe pod` để đọc phần Events ở cuối (scheduler, kubelet ghi lý do vào đây), và `kubectl logs` (kèm `--previous`) để xem lỗi của ứng dụng. Đừng đoán trước khi đọc Events."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl get pods -n prod
kubectl describe pod <tên-pod> -n prod | sed -n '/Events:/,$p'
kubectl logs <tên-pod> -n prod --previous
kubectl get events -n prod --sort-by=.lastTimestamp | tail -20
kubectl get pod <tên-pod> -n prod -o jsonpath='{.status.containerStatuses[0].lastState}'`
        }
      },
      {
        h: "Bốn trạng thái lỗi kinh điển",
        p: [
          "Mỗi trạng thái chỉ ra một giai đoạn khác nhau trong vòng đời Pod: chưa được lên lịch, không kéo được image, chạy rồi chết, hay bị giết vì vượt tài nguyên. Xác định đúng giai đoạn giúp bạn biết nên nhìn vào đâu: Events của scheduler, cấu hình registry, log ứng dụng, hay biểu đồ memory."
        ],
        list: [
          "`CrashLoopBackOff`: container khởi động rồi thoát liên tục, kubelet chờ lâu dần giữa các lần thử. Xem `logs --previous` và exit code. Thường do thiếu biến môi trường, không kết nối được DB, lỗi code, hoặc liveness probe giết ứng dụng khởi động chậm.",
          "`ImagePullBackOff` / `ErrImagePull`: không kéo được image. Kiểm tra tên và tag có tồn tại, registry private có `imagePullSecrets` chưa, node có ra được Internet (NAT) không, và kiến trúc image (amd64/arm64) có khớp node không.",
          "`Pending`: Pod chưa được lên lịch. Events thường ghi `0/3 nodes are available: 3 Insufficient cpu` (requests quá lớn hoặc cluster đầy), taint không có toleration, hoặc PVC chưa bind được.",
          "`OOMKilled`: container vượt memory limit, exit code 137. Tăng limit dựa trên số liệu đo, hoặc tìm memory leak, cấu hình heap của runtime nhỏ hơn limit."
        ]
      },
      {
        h: "Lỗi mạng và công cụ debug",
        p: [
          "Pod chạy nhưng không truy cập được: kiểm tra Service có endpoint (`kubectl get endpointslices`), selector đúng label, `targetPort` đúng, readiness đang pass, NetworkPolicy không chặn, và HTTPRoute báo `Accepted`. Thử từ trong cluster để loại trừ từng lớp.",
          "Image distroless không có shell để exec. `kubectl debug` gắn một ephemeral container có công cụ vào Pod đang chạy, dùng chung namespace process với container đích."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl debug -it <tên-pod> -n prod --image=busybox:1.36 --target=api
kubectl run net-debug --rm -it -n prod --image=nicolaka/netshoot --restart=Never -- \\
  curl -sv http://task-api/health
kubectl get endpointslices -n prod -l kubernetes.io/service-name=task-api`
        }
      }
    ],
    summary: [
      "Thứ tự: `get` → `describe` (đọc Events) → `logs --previous`.",
      "CrashLoopBackOff: đọc log và exit code; ImagePullBackOff: tên/tag, quyền registry, mạng.",
      "Pending: thiếu tài nguyên, taint, PVC; OOMKilled: exit code 137, vượt memory limit.",
      "`kubectl debug` gắn ephemeral container để debug image không có shell."
    ],
    pitfalls: [
      "Xoá Pod lỗi liên tục hi vọng nó tự hết, trong khi nguyên nhân (thiếu Secret, sai tag) vẫn nằm trong manifest.",
      "Tăng memory limit mãi vì OOMKilled mà không xem biểu đồ memory, che giấu memory leak.",
      "Debug Pending bằng cách xem log ứng dụng; Pod chưa chạy nên không có log, hãy đọc Events."
    ],
    quiz: [
      { q: "Pod ở trạng thái `Pending`, Events báo `Insufficient memory`. Nguyên nhân?", options: ["Image được chỉ định sai tag", "Không node nào còn đủ memory theo requests", "Liveness probe cấu hình sai", "Ứng dụng bị rò rỉ memory"], answer: 1, explain: "Pending nghĩa là chưa lên lịch, scheduler không tìm được node đủ requests. Image sai là ImagePullBackOff; probe và leak chỉ xảy ra khi Pod đã chạy." },
      { q: "Container thoát với exit code 137 và lý do `OOMKilled`. Điều này nghĩa là gì?", options: ["Code ứng dụng có lỗi cú pháp", "Container vượt memory limit, bị giết", "Node không kéo được image", "Scheduler từ chối xếp Pod"], answer: 1, explain: "137 = 128 + 9 (SIGKILL); với lý do OOMKilled là vượt memory limit. Các lỗi khác có trạng thái riêng." },
      { q: "Pod dùng image distroless, không có shell. Cách debug bên trong Pod đang chạy?", options: ["`kubectl exec -it <pod> -- sh`", "`kubectl debug -it <pod> --image=busybox`", "Build image có shell rồi deploy lại", "Không thể debug image distroless"], answer: 1, explain: "Ephemeral container của `kubectl debug` mang công cụ vào Pod mà không đổi image (thêm `--target=<container>` để thấy process của container đó). exec cần shell có sẵn trong image; build lại image thay đổi thứ đang chạy và mất trạng thái lỗi cần điều tra." }
    ]
  },
  "p10.m2.t2": {
    videos: [
      { id: "NsHTam9pqBo", title: "[#helm] Hướng dẫn sử dụng helm trong kubernetes | DevOps Mentor", channel: "DevOps Mentor", lang: "vi", minutes: 26, embed: true },
      { id: "w51lDVuRWuk", title: "Helm and Helm Charts Explained - Helm Tutorial for Beginners", channel: "DevOps Journey", lang: "en", minutes: 10, embed: true }
    ],
    sections: [
      {
        h: "Helm: package manager của Kubernetes",
        p: [
          "Một ứng dụng thường cần Deployment, Service, HTTPRoute, HPA, ConfigMap... và khác nhau vài giá trị giữa môi trường. Helm đóng gói chúng thành chart: thư mục chứa template Go và file `values.yaml` mặc định. Mỗi lần cài chart vào cluster tạo ra một release có tên, có lịch sử revision, có thể nâng cấp và rollback.",
          "Helm cũng là cách phổ biến nhất để cài phần mềm của bên thứ ba như Envoy Gateway, cert-manager, Prometheus. Chart được phân phối qua repository HTTP hoặc registry OCI (như `oci://docker.io/envoyproxy/gateway-helm` trong Lab 06)."
        ],
        code: {
          lang: "text", file: "cấu trúc chart",
          src: `charts/task-api/
├── Chart.yaml
├── values.yaml
├── values-prod.yaml
└── templates/
    ├── _helpers.tpl
    ├── deployment.yaml
    ├── service.yaml
    └── hpa.yaml`
        }
      },
      {
        h: "Template và values theo môi trường",
        code: {
          lang: "text", file: "templates/deployment.yaml (template Helm, trích)",
          src: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
  labels:
    app: {{ .Release.Name }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}`
        },
        p: [
          "`values.yaml` chứa mặc định; `values-prod.yaml` chỉ chứa phần khác cho prod (replica, resources, hostname). Khi truyền nhiều `-f`, file sau ghi đè file trước; `--set` ghi đè tất cả. Template trên bỏ `replicas` khi bật autoscaling để không đánh nhau với HPA.",
          "Các object dựng sẵn hay dùng trong template: `.Values` (giá trị cấu hình), `.Release.Name` và `.Release.Namespace` (thông tin release), `.Chart.Version`. Hàm `toYaml` và `nindent` chèn một khối YAML với thụt lề đúng; `{{-` xoá khoảng trắng phía trước để output gọn. Vì template xử lý văn bản chứ không hiểu YAML, lỗi thụt lề là lỗi phổ biến nhất, nên luôn chạy `helm template` hoặc `helm lint` trước khi cài."
        ]
      },
      {
        h: "Vòng đời release",
        code: {
          lang: "bash", file: "terminal",
          src: `helm lint charts/task-api
helm template task-api charts/task-api -f charts/task-api/values-prod.yaml   # render ra YAML để xem
helm upgrade --install task-api charts/task-api -n prod --create-namespace \\
  -f charts/task-api/values-prod.yaml --set image.tag=3f9c2ab \\
  --rollback-on-failure --timeout 5m     # Helm 3: dùng --atomic
helm list -n prod
helm history task-api -n prod
helm rollback task-api 3 -n prod
helm uninstall task-api -n prod`
        },
        p: [
          "`upgrade --install` dùng được cho cả lần đầu lẫn các lần sau, rất hợp với CI. `--rollback-on-failure` chờ tài nguyên sẵn sàng và tự rollback nếu upgrade thất bại hoặc quá thời gian chờ. Đây là tên mới trong Helm 4 (phát hành 11/2025) của cờ `--atomic` ở Helm 3; `--atomic` vẫn chạy nhưng báo deprecated. Helm 3 chỉ còn nhận bản vá bảo mật đến 2/2027, nên dự án mới nên dùng Helm 4; Helm 4 cũng mặc định dùng server-side apply cho release mới. Helm lưu thông tin release dưới dạng Secret trong namespace của release. Đánh đổi: template Go dễ trở nên khó đọc khi quá nhiều `if`; với ứng dụng nội bộ đơn giản, Kustomize có thể dễ bảo trì hơn."
        ]
      }
    ],
    summary: [
      "Chart = template + `values.yaml`; mỗi lần cài là một release có lịch sử revision.",
      "Values theo môi trường qua nhiều `-f`; file sau ghi đè file trước, `--set` ghi đè tất cả.",
      "`helm template` để xem YAML render, `upgrade --install --rollback-on-failure` (Helm 3: `--atomic`) cho CI, `rollback` để quay lui.",
      "Helm còn là cách chuẩn để cài phần mềm bên thứ ba."
    ],
    pitfalls: [
      "Đặt secret thật trong `values.yaml` và commit vào Git.",
      "Không ghim `--version` khi cài chart bên thứ ba, mỗi lần cài ra phiên bản khác nhau.",
      "Sửa tay object do Helm quản lý bằng `kubectl edit`, lần upgrade sau bị ghi đè hoặc báo xung đột."
    ],
    quiz: [
      { q: "Lệnh nào render chart thành YAML để xem mà không cài vào cluster?", options: ["`helm install`", "`helm template`", "`helm rollback`", "`helm list`"], answer: 1, explain: "`helm template` render cục bộ. install cài thật, rollback quay revision, list liệt kê release." },
      { q: "Chạy `helm upgrade -f values.yaml -f values-prod.yaml --set image.tag=abc`. Giá trị `image.tag` cuối cùng lấy từ đâu?", options: ["values.yaml", "values-prod.yaml", "`--set` (abc)", "Chart.yaml"], answer: 2, explain: "`--set` có độ ưu tiên cao nhất, sau đó là các file `-f` theo thứ tự (file sau ghi đè file trước), cuối cùng là values mặc định của chart." },
      { q: "Cờ `--rollback-on-failure` (Helm 3 gọi là `--atomic`) trong `helm upgrade` có tác dụng gì?", options: ["Cài song song nhiều release một lúc", "Tự rollback khi upgrade lỗi hoặc quá hạn", "Xoá release cũ trước khi cài bản mới", "Mã hoá values trước khi lưu release"], answer: 1, explain: "Cờ này chờ tài nguyên sẵn sàng và rollback khi thất bại, tránh để release ở trạng thái hỏng. Nó không cài song song, không xoá release cũ và không mã hoá values." }
    ]
  },
  "p10.m2.t3": {
    videos: [
      { id: "vrrsIRwpKac", title: "Hướng dẫn sử dụng Kustomize để quản lý Kubernetes Manifest | Kustomize | Kubernetes | DevOps Mentor", channel: "DevOps Mentor", lang: "vi", minutes: 16, embed: true },
      { id: "spCdNeNCuFU", title: "Kustomize: The Best Way to Manage Your Kubernetes Configs", channel: "DevOps Journey", lang: "en", minutes: 25, embed: true }
    ],
    sections: [
      {
        h: "Kustomize: YAML thuần, không template",
        p: [
          "Kustomize tiếp cận ngược với Helm: không có ngôn ngữ template. Bạn viết manifest YAML hợp lệ làm base, rồi mỗi môi trường là một overlay mô tả những thay đổi áp lên base: đổi image tag, số replica, thêm label, patch một trường. Kết quả vẫn là YAML thuần, dễ đọc, dễ diff.",
          "Kustomize được tích hợp sẵn trong kubectl qua `kubectl apply -k` và `kubectl kustomize`, không cần cài thêm công cụ.",
          "Vì base luôn là YAML hợp lệ, bạn có thể `kubectl apply` trực tiếp base để thử, dùng công cụ lint và schema validation cho YAML thông thường, và reviewer đọc được manifest mà không cần hình dung template sẽ render ra gì. Overlay chỉ chứa phần khác biệt, nên nhìn vào overlay prod là biết ngay prod khác staging ở đâu."
        ],
        code: {
          lang: "text", file: "cấu trúc thư mục",
          src: `k8s/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    ├── staging/kustomization.yaml
    └── prod/
        ├── kustomization.yaml
        └── replicas-patch.yaml`
        }
      },
      {
        h: "Base và overlay",
        code: {
          lang: "yaml", file: "k8s/base/kustomization.yaml và k8s/overlays/prod/kustomization.yaml",
          src: `# k8s/base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
labels:
  - pairs: { app.kubernetes.io/name: task-api }
---
# k8s/overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: prod
resources:
  - ../../base
images:
  - name: ghcr.io/my-org/task-api
    newTag: 3f9c2ab
patches:
  - path: replicas-patch.yaml
configMapGenerator:
  - name: task-api-config
    literals:
      - LOG_LEVEL=warn`
        },
        p: [
          "Patch là một mảnh YAML có đủ `apiVersion`, `kind`, `metadata.name` để xác định object, cùng các trường cần đổi. `configMapGenerator` thêm hash nội dung vào tên ConfigMap; khi nội dung đổi, tên đổi, Deployment tham chiếu tới nó được cập nhật và Pod tự rollout."
        ]
      },
      {
        h: "Build, apply và chọn Helm hay Kustomize",
        code: {
          lang: "bash", file: "terminal",
          src: `kubectl kustomize k8s/overlays/prod          # in YAML kết quả
kubectl diff -k k8s/overlays/prod
kubectl apply -k k8s/overlays/prod

# Trong CI: đổi tag image của overlay
cd k8s/overlays/prod && kustomize edit set image ghcr.io/my-org/task-api=ghcr.io/my-org/task-api:8d1e4f0`
        },
        p: [
          "Kustomize hợp với ứng dụng nội bộ của đội, nơi bạn kiểm soát manifest và khác biệt giữa env không lớn. Helm hợp khi phân phối phần mềm cho người khác cấu hình, hoặc cần logic điều kiện nhiều. Hai công cụ kết hợp được: Kustomize có thể render Helm chart qua `helmCharts` (cần cờ `--enable-helm`), Argo CD hỗ trợ cả hai. Lưu ý phiên bản Kustomize nhúng trong kubectl có thể cũ hơn bản standalone."
        ]
      }
    ],
    summary: [
      "Kustomize: base YAML thuần + overlay theo môi trường, không có template.",
      "Tích hợp sẵn: `kubectl apply -k`, `kubectl kustomize`.",
      "`images`, `patches`, `configMapGenerator` (có hash trong tên) là công cụ chính.",
      "Kustomize cho manifest nội bộ; Helm cho phân phối phần mềm và logic cấu hình nhiều."
    ],
    pitfalls: [
      "Copy nguyên base sang từng overlay rồi sửa, các môi trường dần lệch nhau và mất lợi ích của Kustomize.",
      "Patch thiếu `metadata.name` hoặc sai `kind`, Kustomize báo không tìm thấy object để patch.",
      "Tự đặt tên ConfigMap cố định thay vì generator, đổi cấu hình mà Pod không rollout."
    ],
    quiz: [
      { q: "Khác biệt cốt lõi của Kustomize so với Helm là gì?", options: ["Kustomize dùng template Go như Helm", "Kustomize áp patch lên YAML thuần", "Kustomize chỉ chạy trên cluster cloud", "Kustomize không đặt được namespace"], answer: 1, explain: "Kustomize biến đổi YAML hợp lệ bằng overlay và patch. Template Go là của Helm; Kustomize chạy ở mọi nơi và có trường `namespace`." },
      { q: "Vì sao `configMapGenerator` giúp Pod tự rollout khi cấu hình đổi?", options: ["Nó khởi động lại các node", "Nó thêm hash nội dung vào tên ConfigMap", "Nó xoá các Pod đang dùng ConfigMap", "Nó bật HPA cho Deployment"], answer: 1, explain: "Nội dung đổi thì tên đổi; Kustomize cập nhật tham chiếu trong Deployment nên `spec.template` thay đổi, kích hoạt rolling update. Nó không restart node, không xoá Pod trực tiếp, không liên quan HPA." },
      { q: "Lệnh nào apply overlay prod bằng kubectl mà không cần cài công cụ khác?", options: ["`kubectl apply -f k8s/overlays/prod`", "`kubectl apply -k k8s/overlays/prod`", "`helm install prod`", "`kubectl kustomize apply`"], answer: 1, explain: "`-k` chỉ định thư mục kustomization. `-f` áp từng file thô mà không xử lý kustomization." }
    ]
  },
  "p10.m2.t4": {
    videos: [
      { id: "xS3SekxnlKo", title: "Bài 4. Các cách cài đặt Kubernetes cluster | Khoá học Kubernetes thực tế", channel: "DEVOPSEDU VN", lang: "vi", minutes: 4, embed: true },
      { id: "eKr75oClPZ4", title: "Kubernetes in Docker (KIND) Tutorial", channel: "Abhishek.Veeramalla", lang: "en", minutes: 26, embed: true }
    ],
    sections: [
      {
        h: "Cluster local khi phát triển",
        p: [
          "Bạn cần một cluster trên laptop để thử manifest, chart, và chạy test tích hợp trong CI. Ba lựa chọn phổ biến:"
        ],
        list: [
          "kind (Kubernetes IN Docker): mỗi node là một container Docker. Khởi động nhanh, dựng được cluster nhiều node, rất phổ biến trong CI. Lab 06 dùng kind.",
          "k3d: chạy k3s (bản Kubernetes nhẹ của Rancher) trong Docker. Rất nhẹ, có sẵn load balancer tích hợp để truy cập Service.",
          "minikube: chạy cluster trên VM hoặc container, nhiều addon bật bằng một lệnh (metrics-server, dashboard), thân thiện cho người mới."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `kind create cluster --name lab
kind load docker-image task-api:dev --name lab   # đưa image local vào cluster, không cần registry
kubectl cluster-info --context kind-lab
kind delete cluster --name lab

k3d cluster create dev --agents 2
minikube start && minikube addons enable metrics-server`
        }
      },
      {
        h: "Managed Kubernetes khi production",
        p: [
          "EKS (AWS), GKE (Google), AKS (Azure) vận hành control plane: etcd, apiserver sẵn sàng cao, nâng cấp phiên bản. Bạn vẫn chịu trách nhiệm node (hoặc dùng chế độ managed node như EKS Auto Mode, GKE Autopilot), add-on (CNI, CoreDNS, CSI driver), nâng cấp version theo lịch hỗ trợ, và mọi workload. Kubernetes phát hành minor mới vài lần mỗi năm và mỗi bản chỉ được hỗ trợ trong thời gian giới hạn; kế hoạch nâng cấp định kỳ là bắt buộc.",
          "Điểm mạnh của managed là tích hợp với cloud: IAM cho Pod (EKS Pod Identity), load balancer tự tạo cho Gateway/Service, ổ đĩa qua CSI (EBS, EFS). Control plane EKS tính phí theo giờ cho mỗi cluster, cộng chi phí node, xem bảng giá chính thức."
        ],
        code: {
          lang: "bash", file: "terminal",
          src: `aws eks update-kubeconfig --name prod --region ap-southeast-1
kubectl get nodes
aws eks describe-cluster --name prod --query cluster.version`
        }
      },
      {
        h: "Khác biệt cần lưu ý",
        p: [
          "Cluster local không có load balancer của cloud, nên Service `LoadBalancer` nằm `<pending>` (trừ khi dùng k3d hay cloud-provider-kind); Lab 06 dùng `port-forward` thay thế. StorageClass, CNI, NetworkPolicy cũng có thể khác production. Hãy chạy test chức năng trên local, nhưng luôn có môi trường staging trên cùng loại cluster managed với prod để bắt các khác biệt đó.",
          "Với đội nhỏ chỉ có vài service, hãy cân nhắc liệu có cần Kubernetes không: ECS Fargate hoặc Cloud Run đơn giản hơn nhiều."
        ]
      }
    ],
    summary: [
      "kind, k3d, minikube cho dev và CI; kind có `kind load docker-image` để dùng image local.",
      "EKS/GKE/AKS vận hành control plane; bạn vẫn lo node, add-on, nâng cấp và workload.",
      "Lên kế hoạch nâng cấp version định kỳ vì mỗi minor chỉ được hỗ trợ trong thời gian giới hạn.",
      "Local khác production ở load balancer, storage, CNI; cần staging cùng loại với prod."
    ],
    pitfalls: [
      "Service `LoadBalancer` trên kind nằm `<pending>` mãi và tưởng cấu hình sai; dùng `port-forward` hoặc công cụ LB cho local.",
      "Build image local rồi apply lên kind mà quên `kind load docker-image`, Pod báo ImagePullBackOff.",
      "Trì hoãn nâng cấp EKS đến khi phiên bản hết hỗ trợ tiêu chuẩn, phải nâng nhiều bản liên tiếp gấp gáp."
    ],
    quiz: [
      { q: "kind chạy các node Kubernetes như thế nào?", options: ["Mỗi node là một VM riêng", "Mỗi node là một container", "Mỗi node là một EC2 trên AWS", "kind không có khái niệm node"], answer: 1, explain: "kind = Kubernetes IN Docker; node là container. minikube có thể dùng VM; kind không cần cloud." },
      { q: "Với EKS, phần nào AWS vận hành thay bạn?", options: ["Toàn bộ workload và manifest", "Control plane (apiserver, etcd)", "Code và image của ứng dụng", "NetworkPolicy và RBAC của bạn"], answer: 1, explain: "Managed Kubernetes lo control plane. Workload, manifest, chính sách vẫn là trách nhiệm của bạn." },
      { q: "Vì sao Service `type: LoadBalancer` trên kind thường ở trạng thái `<pending>`?", options: ["Vì kind không hỗ trợ Service", "Vì không có controller tạo load balancer", "Vì chưa có Deployment phía sau", "Vì Service nằm sai namespace"], answer: 1, explain: "Trên cloud, controller của nhà cung cấp tạo LB. Local không có, nên cần port-forward hoặc công cụ như cloud-provider-kind, MetalLB." }
    ]
  },
  "p10.m2.t5": {
    videos: [
      { id: "16fgzklcF7Y", title: "Istio & Service Mesh - simply explained in 15 mins", channel: "TechWorld with Nana", lang: "en", minutes: 16, embed: true }
    ],
    sections: [
      {
        h: "Service mesh là gì",
        p: [
          "Khi có hàng chục service gọi nhau, những vấn đề chung xuất hiện: mã hoá traffic nội bộ, xác thực service với service, retry, timeout, circuit breaking, chia traffic canary, và quan sát ai gọi ai với độ trễ bao nhiêu. Thay vì mỗi service tự cài thư viện cho các việc đó, service mesh đưa chúng xuống tầng hạ tầng.",
          "Mesh có data plane (proxy chặn traffic của mỗi Pod) và control plane (cấp cấu hình và chứng chỉ cho proxy). Mô hình truyền thống đặt proxy sidecar vào mọi Pod: Istio dùng Envoy, Linkerd dùng proxy viết bằng Rust. Istio còn có chế độ ambient không dùng sidecar: một proxy ztunnel mỗi node lo mTLS tầng 4, và waypoint proxy tùy chọn cho tính năng tầng 7."
        ]
      },
      {
        h: "Tính năng chính",
        list: [
          "mTLS tự động: mọi kết nối giữa Pod được mã hoá và hai bên xác thực nhau bằng chứng chỉ do mesh cấp, xoay vòng tự động. Chính sách có thể nói \"chỉ service `orders` được gọi `payments`\".",
          "Traffic management: chia traffic theo trọng số, routing theo header, mirror traffic.",
          "Độ tin cậy: retry, timeout, circuit breaking cấu hình tập trung.",
          "Quan sát: metric chuẩn (request rate, error rate, latency) cho mọi luồng, tích hợp tracing."
        ],
        p: [
          "Cả Istio và Linkerd đều hỗ trợ Gateway API, bao gồm HTTPRoute cho traffic giữa các service (GAMMA), nên kiến thức ở bài Gateway API dùng lại được."
        ],
        code: {
          lang: "yaml", file: "mesh.yaml",
          src: `# Istio: bắt buộc mTLS cho mọi workload trong namespace prod
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata: { name: default, namespace: prod }
spec:
  mtls: { mode: STRICT }
---
# Chia 90/10 traffic nội bộ tới payments bằng Gateway API (GAMMA)
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: payments-canary, namespace: prod }
spec:
  parentRefs:
    - { group: "", kind: Service, name: payments, port: 80 }
  rules:
    - backendRefs:
        - { name: payments-v1, port: 80, weight: 90 }
        - { name: payments-v2, port: 80, weight: 10 }`
        }
      },
      {
        h: "Khi nào thực sự cần",
        p: [
          "Mesh không miễn phí: thêm độ trễ và tài nguyên cho proxy, thêm một hệ thống phức tạp cần nâng cấp và debug, và khi mesh lỗi, mọi traffic đều bị ảnh hưởng. Với vài service, retry và timeout trong code cùng NetworkPolicy và TLS ở Gateway thường là đủ.",
          "Hãy cân nhắc mesh khi có nhiều service và nhiều đội, yêu cầu compliance bắt buộc mã hoá traffic nội bộ (zero trust), hoặc cần quan sát thống nhất mà không sửa từng service. Nếu cần, Linkerd thường được đánh giá là đơn giản hơn để bắt đầu, Istio nhiều tính năng hơn. Trước khi chọn, hãy xem mô hình phát hành và hỗ trợ hiện tại của từng dự án (ví dụ từ 2024 Linkerd mã nguồn mở chỉ phát hành bản edge, bản stable do công ty Buoyant cung cấp), vì mesh là thành phần bạn sẽ phải nâng cấp đều đặn."
        ]
      }
    ],
    summary: [
      "Service mesh đưa mTLS, retry, timeout, traffic splitting, quan sát xuống tầng hạ tầng.",
      "Data plane là proxy (sidecar hoặc ambient ztunnel), control plane cấp cấu hình và chứng chỉ.",
      "Istio và Linkerd hỗ trợ Gateway API cho traffic nội bộ (GAMMA).",
      "Chỉ cần khi có nhiều service, nhiều đội, hoặc yêu cầu zero trust; nếu không, chi phí vận hành lớn hơn lợi ích."
    ],
    pitfalls: [
      "Cài mesh cho hệ thống ba service, thêm độ trễ và độ phức tạp mà không giải quyết vấn đề thực tế nào.",
      "Retry ở cả code, mesh và client cùng lúc, một lỗi nhỏ nhân lên thành bão request (retry storm).",
      "Bật mTLS `STRICT` trước khi mọi workload có proxy, các service chưa có proxy không gọi được nhau."
    ],
    quiz: [
      { q: "mTLS trong service mesh mang lại gì?", options: ["Nén dữ liệu giữa các service", "Mã hoá và xác thực hai chiều giữa service", "Tăng tốc phân giải DNS nội bộ", "Thay thế RBAC của Kubernetes"], answer: 1, explain: "Mutual TLS mã hoá và xác thực cả hai chiều. Nó không nén, không liên quan DNS, và không thay RBAC (quyền gọi Kubernetes API)." },
      { q: "Trường hợp nào service mesh đáng đầu tư nhất?", options: ["Một monolith duy nhất chạy 3 replica", "Hàng chục service của nhiều đội", "Một website tĩnh phục vụ qua CDN", "Một CronJob chạy mỗi đêm"], answer: 1, explain: "Lợi ích của mesh tăng theo số service và yêu cầu bảo mật. Với hệ thống nhỏ, chi phí vận hành lớn hơn lợi ích." },
      { q: "Chế độ ambient của Istio khác mô hình sidecar thế nào?", options: ["Ambient bỏ hẳn mTLS để nhẹ hơn", "Ambient không đặt proxy vào từng Pod", "Ambient chỉ chạy ngoài Kubernetes", "Ambient bắt buộc sửa code ứng dụng"], answer: 1, explain: "Ambient bỏ sidecar: ztunnel mỗi node lo mTLS tầng 4, waypoint proxy tùy chọn cho tầng 7, giảm tài nguyên và thao tác inject. Nó chạy trong Kubernetes và không cần sửa code." }
    ]
  },
  "p10.m1.t8": {
    videos: [
      { id: "e2HjRrmXMDw", title: "Kubernetes Pod Disruption Budget (Examples)", channel: "Anton Putra", lang: "en", minutes: 4, embed: true },
      { id: "vYPGWcIEeW0", title: "Pod Topology Spread Constraints | Kỹ thuật Scheduling hiệu quả trong Kubernetes | DevOps Mentor", channel: "DevOps Mentor", lang: "vi", minutes: 6, embed: true }
    ],
    sections: [
      {
        h: "Gián đoạn chủ ý và PodDisruptionBudget",
        p: [
          "Gián đoạn không chủ ý (involuntary) như node hỏng phần cứng, kernel panic thì không gì ngăn được. Gián đoạn chủ ý (voluntary) do người hoặc công cụ khởi xướng: `kubectl drain`, nâng cấp node group, Cluster Autoscaler hay Karpenter thu nhỏ cluster. PodDisruptionBudget (PDB, `policy/v1`) giới hạn loại thứ hai: \"ứng dụng này luôn cần tối thiểu bấy nhiêu Pod sẵn sàng\".",
          "Mỗi PDB chỉ đặt một trong hai trường `minAvailable` hoặc `maxUnavailable`, dạng số hoặc phần trăm. Phần trăm được làm tròn lên: 7 Pod với `minAvailable: 50%` nghĩa là phải còn 4. `maxUnavailable` tự đúng khi bạn đổi số replica.",
          "PDB chỉ tác động lên thao tác đi qua Eviction API. Nếu eviction làm vi phạm ngân sách, API server trả `429 Too Many Requests` và công cụ gọi sẽ thử lại sau. Rolling update của Deployment không bị PDB chặn; nó được điều khiển bằng `maxSurge`/`maxUnavailable` của chính Deployment."
        ]
      },
      {
        h: "Rải Pod ra nhiều zone và node",
        p: [
          "PDB bảo vệ số lượng chứ không quan tâm vị trí: ba replica chung một zone thì sự cố zone hạ cả ba. `topologySpreadConstraints` với `topologyKey: topology.kubernetes.io/zone` và `maxSkew: 1` bắt scheduler chia đều Pod giữa các zone; thêm một ràng buộc theo `kubernetes.io/hostname` để các replica tách node. `DoNotSchedule` là ràng buộc cứng, `ScheduleAnyway` chỉ là ưu tiên.",
          "Mặc định `unhealthyPodEvictionPolicy: IfHealthyBudget` chỉ cho evict Pod đang không Ready khi ngân sách còn dư, nên một ứng dụng đang CrashLoopBackOff có thể làm drain kẹt mãi. Tài liệu Kubernetes khuyến nghị `AlwaysAllow` để Pod hỏng luôn được evict."
        ],
        code: {
          lang: "yaml", file: "k8s/order-api-ha.yaml",
          src: `apiVersion: apps/v1
kind: Deployment
metadata: { name: order-api, namespace: prod }
spec:
  replicas: 3
  selector:
    matchLabels: { app: order-api }
  template:
    metadata:
      labels: { app: order-api }
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels: { app: order-api }
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels: { app: order-api }
      containers:
        - name: app
          image: registry.example.com/order-api:1.8.2
          readinessProbe:
            httpGet: { path: /healthz/ready, port: 8080 }
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: order-api, namespace: prod }
spec:
  maxUnavailable: 1            # mỗi lúc chỉ được evict 1 Pod
  unhealthyPodEvictionPolicy: AlwaysAllow
  selector:
    matchLabels: { app: order-api }`
        }
      },
      {
        h: "Drain một node an toàn",
        p: [
          "`kubectl drain` cordon node (không nhận Pod mới) rồi evict từng Pod qua Eviction API, nên tôn trọng PDB. Pod của DaemonSet phải bỏ qua bằng `--ignore-daemonsets`; Pod dùng `emptyDir` cần `--delete-emptydir-data` và dữ liệu đó sẽ mất. Trước khi drain, xem cột `ALLOWED DISRUPTIONS`: nếu bằng 0 kéo dài, drain sẽ đứng chờ."
        ],
        code: {
          lang: "bash", file: "drain.sh",
          src: `kubectl get pdb -A                      # ALLOWED DISRUPTIONS phải > 0
kubectl cordon ip-10-0-1-23.ec2.internal
kubectl drain ip-10-0-1-23.ec2.internal \\
  --ignore-daemonsets --delete-emptydir-data --timeout=10m
# ... bảo trì xong, nếu node còn dùng tiếp:
kubectl uncordon ip-10-0-1-23.ec2.internal`
        }
      },
      {
        h: "Nâng cấp cluster managed (EKS)",
        list: [
          "Chuẩn bị: tìm manifest và chart dùng API bị gỡ ở phiên bản đích, thử trước trên staging.",
          "Nâng control plane trước, từng minor một (1.33 lên 1.34, không nhảy bậc). Theo chính sách version skew, kubelet không được mới hơn API server và có thể cũ hơn tối đa 3 minor; kubectl lệch tối đa 1 minor.",
          "Nâng add-on (VPC CNI, CoreDNS, kube-proxy) lên bản tương thích.",
          "Nâng node group: EKS managed node group tạo node mới, cordon và drain node cũ theo PDB; Pod không rời node trong 15 phút (khi không dùng force) thì bước nâng cấp báo `PodEvictionFailure`. Cách khác: tạo node group mới rồi drain nhóm cũ (blue/green).",
          "Theo dõi lỗi và độ trễ suốt quá trình; readiness probe đúng và xử lý SIGTERM là điều kiện để không rớt request."
        ],
        p: [
          "Control plane EKS không hạ phiên bản được, nên chuẩn bị kỹ."
        ]
      }
    ],
    summary: [
      "PDB giới hạn gián đoạn chủ ý (drain, autoscaler thu nhỏ) qua Eviction API, không chặn được sự cố phần cứng hay rolling update.",
      "Chỉ dùng một trong `minAvailable`/`maxUnavailable`; phần trăm làm tròn lên; nên đặt `unhealthyPodEvictionPolicy: AlwaysAllow`.",
      "`topologySpreadConstraints` rải replica qua zone và node để một lần drain hay một sự cố zone không hạ cả ứng dụng.",
      "`kubectl drain --ignore-daemonsets` cordon rồi evict từng Pod, tự chờ khi PDB chưa cho phép.",
      "Nâng cấp theo thứ tự control plane, add-on, node group, từng minor một, tuân thủ version skew."
    ],
    pitfalls: [
      "Đặt `minAvailable` bằng số replica (hoặc `maxUnavailable: 0`), drain và nâng cấp node group không bao giờ hoàn tất.",
      "Deployment chỉ có 1 replica kèm PDB: hoặc drain kẹt, hoặc ngân sách cho phép evict và ứng dụng vẫn mất 100% trong lúc chuyển node.",
      "Nhiều PDB cùng chọn một Pod, Eviction API trả lỗi 500 và drain không evict được Pod đó."
    ],
    quiz: [
      { q: "Deployment có 4 replica, PDB đặt `minAvailable: 4`. Khi chạy `kubectl drain` trên node chứa một Pod của nó thì sao?", options: ["Pod bị xoá ngay rồi tạo lại trên node khác", "Drain bỏ qua PDB vì node đã được cordon", "Drain chờ mãi vì không Pod nào được evict", "Kubernetes tự tăng replica lên 5 rồi evict"], answer: 2, explain: "Evict bất kỳ Pod nào cũng làm số Pod sẵn sàng dưới 4, nên Eviction API trả 429 liên tục. Drain không tự scale Deployment và cordon không vô hiệu hoá PDB." },
      { q: "PodDisruptionBudget bảo vệ ứng dụng khỏi loại gián đoạn nào?", options: ["Drain node và autoscaler thu nhỏ cluster", "Node mất điện hoặc hỏng phần cứng", "Container vượt memory limit bị OOMKilled", "Rolling update của chính Deployment đó"], answer: 0, explain: "PDB chỉ giới hạn gián đoạn chủ ý đi qua Eviction API. Sự cố phần cứng, OOMKill không ngăn được (dù vẫn tính vào ngân sách), còn rolling update do cấu hình của Deployment điều khiển." },
      { q: "Control plane vừa nâng lên 1.34. Kubelet phiên bản nào KHÔNG được hỗ trợ?", options: ["kubelet 1.33", "kubelet 1.31", "kubelet 1.32", "kubelet 1.35"], answer: 3, explain: "Kubelet không được mới hơn kube-apiserver, và được phép cũ hơn tối đa 3 minor, nên 1.31 đến 1.34 đều hợp lệ còn 1.35 thì không." }
    ]
  },
});
