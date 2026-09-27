/* Labs thực hành: Docker → CI → CD → IaC → K8s → GitOps → Observability.
 * Mỗi lab: mục tiêu, các bước (có code), cách kiểm chứng, lỗi hay gặp.
 * Lưu ý: "\${{ }}" được escape để không bị template literal của JS nội suy.
 */
window.LABS = [
  {
    id: "lab01",
    phase: "p07",
    title: "Dockerfile multi-stage cho NestJS",
    level: "Cơ bản",
    minutes: 60,
    goal: "Đóng gói API Node/NestJS thành image < 150MB, chạy user non-root, có healthcheck, build cache tối ưu.",
    steps: [
      {
        t: "Tạo .dockerignore",
        d: "Loại bỏ những thứ không cần trong build context để build nhanh hơn và không lộ secret.",
        lang: "text", file: ".dockerignore",
        code: `node_modules
dist
.git
.env*
coverage
*.log
Dockerfile*
docker-compose*`
      },
      {
        t: "Viết Dockerfile 3 stage",
        d: "Stage deps cài dependency (được cache), stage build biên dịch TypeScript, stage runtime chỉ chứa production dependency + dist.",
        lang: "dockerfile", file: "Dockerfile",
        code: `# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=24

FROM node:\${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:\${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \\
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]`
      },
      {
        t: "Build & kiểm tra",
        d: "Tag theo git SHA ngắn. Dùng `docker image ls` xem kích thước, `docker run` kiểm tra health.",
        lang: "bash", file: "terminal",
        code: `TAG=$(git rev-parse --short HEAD)
docker build -t task-api:$TAG .
docker image ls task-api
docker run -d --name api -p 3000:3000 -e DATABASE_URL=postgres://... task-api:$TAG
docker ps          # cột STATUS phải hiện (healthy)
docker exec api whoami   # => node (không phải root)`
      }
    ],
    verify: ["Image < 150MB", "`whoami` trả về node", "Sửa 1 file .ts rồi build lại: bước npm ci được lấy từ cache (CACHED)", "`docker stop api` dừng trong < 2 giây (tín hiệu SIGTERM được xử lý)"],
    pitfalls: ["COPY . . trước npm ci làm mất cache mỗi lần sửa code", "Dùng CMD dạng shell (`CMD npm start`) khiến SIGTERM không tới được Node", "Để lọt file .env vào image"]
  },
  {
    id: "lab02",
    phase: "p07",
    title: "Docker Compose cho môi trường dev",
    level: "Cơ bản",
    minutes: 45,
    goal: "Một lệnh dựng toàn bộ API + worker + Postgres + Redis, có healthcheck và chạy migration tự động.",
    steps: [
      {
        t: "compose.yaml",
        d: "depends_on với condition service_healthy giúp API chỉ khởi động khi DB thực sự sẵn sàng.",
        lang: "yaml", file: "compose.yaml",
        code: `services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    ports: ["5432:5432"]
    # Postgres 18+ đổi VOLUME từ /var/lib/postgresql/data sang /var/lib/postgresql
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
    build: { context: ., target: build }
    command: npm run start:dev
    env_file: .env
    ports: ["3000:3000"]
    volumes: ["./src:/app/src"]
    depends_on:
      migrate: { condition: service_completed_successfully }
      redis: { condition: service_healthy }

  worker:
    build: .
    command: ["node", "dist/worker.js"]
    env_file: .env
    depends_on:
      migrate: { condition: service_completed_successfully }

volumes:
  pgdata:`
      },
      {
        t: "Chạy & debug",
        d: "Các lệnh bạn sẽ dùng hằng ngày.",
        lang: "bash", file: "terminal",
        code: `docker compose up -d --build
docker compose ps
docker compose logs -f api
docker compose exec db psql -U app -c '\\dt'
docker compose down        # giữ dữ liệu
docker compose down -v     # xoá cả volume`
      }
    ],
    verify: ["`docker compose up` từ repo mới clone là chạy được", "API gọi DB bằng hostname `db` (DNS nội bộ của compose)"],
    pitfalls: ["Dùng localhost trong DATABASE_URL bên trong container (phải dùng tên service)", "Quên healthcheck nên API khởi động trước khi DB sẵn sàng"]
  },
  {
    id: "lab03",
    phase: "p08",
    title: "GitHub Actions CI: lint, test, build, scan, push",
    level: "Trung cấp",
    minutes: 120,
    goal: "Mỗi PR phải qua lint, type-check, unit + integration test với Postgres thật; merge vào main thì build image, quét Trivy, đẩy lên GHCR.",
    steps: [
      {
        t: "Workflow CI",
        d: "Job `test` dùng service container Postgres. Job `image` chỉ chạy khi push lên main và phụ thuộc vào `test`. Mọi action đều được pin theo commit SHA, không theo tag (xem mục Lỗi hay gặp).",
        lang: "yaml", file: ".github/workflows/ci.yml",
        code: `name: CI
on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  test:
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
          --health-interval 5s --health-retries 10
    env:
      DATABASE_URL: postgres://app:app@localhost:5432/app_test
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npx prisma migrate deploy
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: coverage
          path: coverage/

  image:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      tag: \${{ steps.meta.outputs.version }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1
      - uses: docker/login-action@dbcb813823bdd20940b903addbd779551569679f # v4.6.0
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@dc802804100637a589fabce1cb79ff13a1411302 # v6.2.0
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: type=sha,format=short,prefix=
      - name: Build (chưa push)
        uses: docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0
        with:
          context: .
          load: true
          tags: \${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - name: Trivy scan
        uses: aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25 # v0.36.0
        with:
          image-ref: \${{ steps.meta.outputs.tags }}
          severity: CRITICAL,HIGH
          exit-code: "1"
          ignore-unfixed: true
      - name: Push
        run: docker push \${{ steps.meta.outputs.tags }}`
      },
      {
        t: "Bật branch protection",
        d: "Settings → Branches → Add rule cho `main`: Require PR, Require status checks (chọn job `test`), Require linear history, không cho force push.",
        lang: "text", file: "GitHub Settings",
        code: `Branch name pattern: main
[x] Require a pull request before merging (1 approval)
[x] Require status checks to pass: test
[x] Require branches to be up to date
[x] Require linear history
[ ] Allow force pushes`
      }
    ],
    verify: ["PR có test fail thì không merge được", "Commit mới trên cùng PR tự huỷ run cũ (concurrency)", "Lần build thứ 2 nhanh hơn rõ rệt nhờ cache type=gha", "Image xuất hiện ở tab Packages với tag là SHA"],
    pitfalls: ["Dùng action theo tag (`@v7`, `@0.28.0`): tag có thể bị ghi đè. Ngày 19/3/2026, 76/77 tag của aquasecurity/trivy-action bị force-push thành mã độc đánh cắp secret. Hãy pin theo commit SHA (kèm comment ghi version) và bật Dependabot để cập nhật SHA. Lưu ý pin SHA chỉ khoá đúng action đó: các commit trivy-action trước 4/2025 bên trong vẫn gọi setup-trivy theo tag nên vẫn bị nhiễm, vì vậy hãy dùng bản mới (v0.36.0 như trên) và rà cả action con", "Cấp `permissions: write-all`: phải cấp quyền tối thiểu cho từng job", "Push image trước khi scan", "Test phụ thuộc thứ tự chạy, dữ liệu dùng chung giữa các test"]
  },
  {
    id: "lab04",
    phase: "p08",
    title: "CD: staging tự động, production có duyệt, OIDC AWS & rollback",
    level: "Nâng cao",
    minutes: 150,
    goal: "Sau khi CI thành công: tự deploy staging, chạy smoke test, chờ người duyệt, deploy production; smoke test lỗi thì tự rollback. Không lưu AWS key trong GitHub.",
    steps: [
      {
        t: "Tạo IAM Role cho GitHub OIDC (Terraform)",
        d: "Trust policy chỉ cho phép repo và environment cụ thể assume role.",
        lang: "hcl", file: "infra/github-oidc.tf",
        code: `resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:my-org/task-api:environment:*"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "github-deploy-task-api"
  assume_role_policy = data.aws_iam_policy_document.trust.json
}`
      },
      {
        t: "Reusable workflow deploy",
        d: "Một workflow deploy dùng chung cho mọi môi trường; chỉ khác tham số environment.",
        lang: "yaml", file: ".github/workflows/deploy.yml",
        code: `name: Deploy
on:
  workflow_call:
    inputs:
      environment: { type: string, required: true }
      image_tag:   { type: string, required: true }

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    permissions:
      id-token: write   # bắt buộc cho OIDC
      contents: read
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0
        with:
          role-to-assume: \${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ap-southeast-1

      - name: Chạy migration (ECS one-off task)
        run: ./scripts/run-migration.sh "\${{ inputs.image_tag }}"

      - name: Lưu task definition hiện tại để rollback
        id: prev
        run: |
          PREV=$(aws ecs describe-services --cluster \${{ vars.ECS_CLUSTER }} \\
            --services task-api --query 'services[0].taskDefinition' --output text)
          echo "task_def=$PREV" >> "$GITHUB_OUTPUT"

      - name: Deploy image mới
        run: ./scripts/ecs-deploy.sh "ghcr.io/\${{ github.repository }}:\${{ inputs.image_tag }}"

      - name: Smoke test
        run: ./scripts/smoke.sh "\${{ vars.BASE_URL }}"

      - name: Rollback nếu thất bại
        if: failure() && steps.prev.outputs.task_def != ''
        run: |
          aws ecs update-service --cluster \${{ vars.ECS_CLUSTER }} \\
            --service task-api --task-definition \${{ steps.prev.outputs.task_def }}
          aws ecs wait services-stable --cluster \${{ vars.ECS_CLUSTER }} --services task-api`
      },
      {
        t: "Nối CI → staging → production",
        d: "Thêm vào cuối ci.yml. Environment `production` được cấu hình Required reviewers trong Settings → Environments.",
        lang: "yaml", file: ".github/workflows/ci.yml (thêm)",
        code: `  deploy-staging:
    needs: image
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
      image_tag: \${{ needs.image.outputs.tag }}
    secrets: inherit

  deploy-production:
    needs: [image, deploy-staging]
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
      image_tag: \${{ needs.image.outputs.tag }}
    secrets: inherit`
      },
      {
        t: "Smoke test script",
        d: "Kiểm tra nhanh các endpoint then chốt, có retry để chờ service ổn định.",
        lang: "bash", file: "scripts/smoke.sh",
        code: `#!/usr/bin/env bash
set -euo pipefail
BASE="$1"
for i in {1..10}; do
  if curl -fsS "$BASE/health" | grep -q '"status":"ok"'; then break; fi
  echo "chờ service... ($i)"; sleep 6
  [ "$i" -eq 10 ] && exit 1
done
curl -fsS -o /dev/null -w "%{http_code}\\n" "$BASE/v1/projects?limit=1" | grep -q 200
echo "Smoke test OK"`
      }
    ],
    verify: ["Trong repo không có AWS_ACCESS_KEY_ID", "Production chờ người duyệt, hiển thị nút Review deployments", "Cố tình làm /health trả 500 → pipeline tự rollback về task definition cũ", "Cùng một image SHA chạy ở cả staging và production"],
    pitfalls: ["Trust policy dùng `repo:org/*` quá rộng", "Migration phá vỡ tương thích với code cũ nên rollback code thì lỗi (dùng expand–contract)", "Build lại image cho production thay vì dùng lại image đã test", "Repo private trên gói GitHub Free/Pro/Team không dùng được Required reviewers và wait timer cho environment (gói Free còn không có environment secrets cho repo private). Khi đó hãy làm lab trên repo public, hoặc thay bước duyệt bằng job production chỉ chạy qua `workflow_dispatch` do người có quyền bấm"]
  },
  {
    id: "lab05",
    phase: "p09",
    title: "Terraform: VPC + ECS Fargate + RDS",
    level: "Nâng cao",
    minutes: 180,
    goal: "Dựng hạ tầng production-like bằng code, remote state có khoá, và pipeline plan/apply.",
    steps: [
      {
        t: "Backend & provider",
        d: "State lưu trên S3 và khoá bằng S3 native lock (`use_lockfile`), tính năng chính thức từ Terraform 1.11 nên không cần DynamoDB nữa. Nhớ bật versioning cho bucket để khôi phục state khi cần.",
        lang: "hcl", file: "infra/envs/staging/main.tf",
        code: `terraform {
  required_version = ">= 1.11"
  backend "s3" {
    bucket       = "myorg-tfstate"
    key          = "task-api/staging.tfstate"
    region       = "ap-southeast-1"
    use_lockfile = true
    encrypt      = true
  }
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
}

provider "aws" {
  region = "ap-southeast-1"
  default_tags { tags = { project = "task-api", env = "staging" } }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"
  name    = "task-staging"
  cidr    = "10.0.0.0/16"
  azs             = ["ap-southeast-1a", "ap-southeast-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24"]
  enable_nat_gateway = true
  single_nat_gateway = true   # tiết kiệm chi phí cho staging
}

module "db" {
  source         = "../../modules/rds-postgres"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnets
  instance_class = "db.t4g.micro"
  allowed_sg_ids = [module.app.service_sg_id]
}

module "app" {
  source          = "../../modules/ecs-service"
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
  private_subnets = module.vpc.private_subnets
  image           = var.image
  desired_count   = 2
  db_secret_arn   = module.db.secret_arn
}`
      },
      {
        t: "Pipeline Terraform",
        d: "PR thì chạy plan và comment kết quả; merge vào main thì apply qua environment có duyệt.",
        lang: "yaml", file: ".github/workflows/terraform.yml",
        code: `name: Terraform
on:
  pull_request:
    paths: ["infra/**"]
  push:
    branches: [main]
    paths: ["infra/**"]

jobs:
  plan:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read, pull-requests: write }
    defaults: { run: { working-directory: infra/envs/staging } }
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: hashicorp/setup-terraform@dfe3c3f87815947d99a8997f908cb6525fc44e9e # v4.0.1
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0
        with:
          role-to-assume: \${{ vars.AWS_TF_ROLE_ARN }}
          aws-region: ap-southeast-1
      - run: terraform fmt -check -recursive
      - run: terraform init -input=false
      - run: terraform validate
      - uses: bridgecrewio/checkov-action@444c9db6fa75e2d9c19ebf1fde7322089be9009e # v12.3125.0
        with: { directory: infra, soft_fail: false }
      - run: terraform plan -input=false -out=tfplan
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with: { name: tfplan, path: infra/envs/staging/tfplan }

  apply:
    if: github.event_name == 'push'
    needs: plan
    runs-on: ubuntu-latest
    environment: infra-staging
    permissions: { id-token: write, contents: read }
    defaults: { run: { working-directory: infra/envs/staging } }
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: hashicorp/setup-terraform@dfe3c3f87815947d99a8997f908cb6525fc44e9e # v4.0.1
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd # v6.3.0
        with:
          role-to-assume: \${{ vars.AWS_TF_ROLE_ARN }}
          aws-region: ap-southeast-1
      - uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with: { name: tfplan, path: infra/envs/staging }
      - run: terraform init -input=false
      - run: terraform apply -input=false tfplan`
      }
    ],
    verify: ["`terraform plan` lần 2 báo No changes", "RDS không có public IP, chỉ nhận kết nối từ security group của ECS", "Hai người chạy apply cùng lúc thì một người bị chặn bởi lock", "`terraform destroy` xoá sạch, hoá đơn không còn phát sinh"],
    pitfalls: ["Commit file .tfstate hoặc .tfvars chứa secret", "Mở security group 0.0.0.0/0 cho cổng 5432", "Quên NAT Gateway: tính phí theo giờ (khoảng 30–45 USD/tháng tuỳ region, chưa kể phí xử lý dữ liệu, xem aws.amazon.com/vpc/pricing). Hãy destroy khi không dùng"]
  },
  {
    id: "lab06",
    phase: "p10",
    title: "Kubernetes: Deployment, Service, Gateway API, HPA",
    level: "Trung cấp",
    minutes: 120,
    goal: "Chạy API trên cluster kind với probes, resource limits, cấu hình tách biệt, Gateway API và autoscaling.",
    steps: [
      {
        t: "Tạo cluster local",
        d: "kind chạy Kubernetes bên trong Docker. Cài Envoy Gateway (một bản cài đặt Gateway API) và metrics-server. Không dùng ingress-nginx nữa vì dự án này đã ngừng bảo trì từ tháng 3/2026.",
        lang: "bash", file: "terminal",
        code: `kind create cluster --name lab
# Gateway API controller (Envoy Gateway), chart đã kèm CRD của Gateway API
helm install eg oci://docker.io/envoyproxy/gateway-helm --version v1.9.1 \\
  -n envoy-gateway-system --create-namespace
kubectl wait --timeout=5m -n envoy-gateway-system deployment/envoy-gateway --for=condition=Available
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# kind cần thêm cờ --kubelet-insecure-tls cho metrics-server
kubectl patch deploy metrics-server -n kube-system --type=json \\
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'`
      },
      {
        t: "Manifest ứng dụng",
        d: "readiness quyết định khi nào Pod nhận traffic; liveness quyết định khi nào restart; startup bảo vệ quá trình khởi động chậm.",
        lang: "yaml", file: "k8s/api.yaml",
        code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
  labels: { app: task-api }
spec:
  replicas: 2
  strategy:
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
  selector:
    matchLabels: { app: task-api }
  template:
    metadata:
      labels: { app: task-api }
    spec:
      terminationGracePeriodSeconds: 30
      securityContext: { runAsNonRoot: true, runAsUser: 1000 }
      containers:
        - name: api
          image: ghcr.io/my-org/task-api:3f9c2ab
          ports: [{ containerPort: 3000 }]
          envFrom:
            - configMapRef: { name: task-api-config }
            - secretRef:    { name: task-api-secret }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { memory: 256Mi }
          startupProbe:
            httpGet: { path: /health, port: 3000 }
            failureThreshold: 30
            periodSeconds: 2
          readinessProbe:
            httpGet: { path: /health/ready, port: 3000 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
---
apiVersion: v1
kind: Service
metadata: { name: task-api }
spec:
  selector: { app: task-api }
  ports: [{ port: 80, targetPort: 3000 }]
---
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata: { name: eg }
spec:
  controllerName: gateway.envoyproxy.io/gatewayclass-controller
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata: { name: web }
spec:
  gatewayClassName: eg
  listeners:
    - { name: http, protocol: HTTP, port: 80 }
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: task-api }
spec:
  parentRefs: [{ name: web }]
  hostnames: ["api.localtest.me"]
  rules:
    - matches: [{ path: { type: PathPrefix, value: / } }]
      backendRefs: [{ name: task-api, port: 80 }]
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: task-api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: task-api }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }`
      },
      {
        t: "Deploy, quan sát, rollback",
        d: "Các lệnh debug quan trọng nhất.",
        lang: "bash", file: "terminal",
        code: `kubectl create configmap task-api-config --from-literal=LOG_LEVEL=info
kubectl create secret generic task-api-secret --from-literal=DATABASE_URL=postgres://...
kubectl apply -f k8s/api.yaml
kubectl rollout status deploy/task-api
kubectl get pods -o wide
kubectl describe pod <tên-pod>      # xem Events khi lỗi
kubectl logs -f deploy/task-api
kubectl get gateway web             # PROGRAMMED phải là True
# Truy cập qua Envoy (kind không có LoadBalancer nên dùng port-forward)
SVC=$(kubectl get svc -n envoy-gateway-system \\
  -l gateway.envoyproxy.io/owning-gateway-name=web -o jsonpath='{.items[0].metadata.name}')
kubectl -n envoy-gateway-system port-forward svc/$SVC 8888:80 &
curl -H "Host: api.localtest.me" http://localhost:8888/health
kubectl get hpa -w                  # quan sát khi chạy k6
kubectl rollout history deploy/task-api
kubectl rollout undo deploy/task-api`
      }
    ],
    verify: ["Chạy k6 trong lúc `kubectl set image` mà không có request lỗi", "HPA tăng replica khi CPU > 70%", "Pod bị OOMKilled khi vượt 256Mi (thử bằng endpoint gây leak)"],
    pitfalls: ["Liveness gọi tới DB: khi DB chậm, mọi Pod bị restart cùng lúc", "Không đặt requests nên HPA không tính được % CPU", "Dùng tag `latest` nên rollout không có gì thay đổi", "Làm theo hướng dẫn cũ dùng ingress-nginx: dự án đã ngừng bảo trì từ 3/2026, không còn bản vá bảo mật"]
  },
  {
    id: "lab07",
    phase: "p08",
    title: "GitOps với Argo CD",
    level: "Nâng cao",
    minutes: 120,
    goal: "CI không `kubectl apply` trực tiếp nữa. CI chỉ cập nhật tag image trong repo config, còn Argo CD tự đồng bộ cluster theo Git.",
    steps: [
      {
        t: "Cài Argo CD",
        d: "Cài vào namespace riêng và lấy mật khẩu admin ban đầu.",
        lang: "bash", file: "terminal",
        code: `kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
kubectl -n argocd port-forward svc/argocd-server 8080:443`
      },
      {
        t: "Application trỏ vào repo config",
        d: "Repo `task-config` chứa Helm values cho từng môi trường. selfHeal hoàn tác thay đổi tay; prune xoá tài nguyên thừa.",
        lang: "yaml", file: "argocd/task-api-staging.yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: task-api-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/task-config.git
    targetRevision: main
    path: charts/task-api
    helm:
      valueFiles: [values-staging.yaml]
  destination:
    server: https://kubernetes.default.svc
    namespace: staging
  syncPolicy:
    automated: { prune: true, selfHeal: true }
    syncOptions: [CreateNamespace=true]`
      },
      {
        t: "CI cập nhật tag image",
        d: "Job cuối của CI trong repo app: sửa values-staging.yaml trong repo config và commit. Với production thì mở PR để có người duyệt.",
        lang: "yaml", file: ".github/workflows/ci.yml (job bump)",
        code: `  bump-staging:
    needs: image
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          repository: my-org/task-config
          token: \${{ secrets.CONFIG_REPO_TOKEN }}
      - name: Cập nhật tag
        run: |
          yq -i '.image.tag = "\${{ needs.image.outputs.tag }}"' charts/task-api/values-staging.yaml
          git config user.name "ci-bot"
          git config user.email "ci-bot@users.noreply.github.com"
          git commit -am "chore(staging): task-api \${{ needs.image.outputs.tag }}"
          git push`
      }
    ],
    verify: ["Merge vào main → vài phút sau Argo CD hiển thị Synced/Healthy với tag mới", "Thử `kubectl scale` tay → Argo CD tự đưa về số replica trong Git", "Rollback = `git revert` commit bump"],
    pitfalls: ["Để secret dạng plain trong repo config (dùng Sealed Secrets hoặc External Secrets)", "Dùng PAT quyền quá rộng; nên dùng GitHub App hoặc deploy key chỉ cho repo config"]
  },
  {
    id: "lab08",
    phase: "p08",
    title: "Cùng pipeline đó trên GitLab CI",
    level: "Trung cấp",
    minutes: 60,
    goal: "Hiểu rằng các khái niệm CI/CD giống nhau giữa các công cụ: stage, job, service, artifact, environment, duyệt tay.",
    steps: [
      {
        t: ".gitlab-ci.yml",
        d: "`when: manual` cùng environment protected tương đương với required reviewers của GitHub.",
        lang: "yaml", file: ".gitlab-ci.yml",
        code: `stages: [test, build, deploy]

variables:
  IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

test:
  stage: test
  image: node:24-alpine
  services:
    - name: postgres:18-alpine
      alias: db
  variables:
    POSTGRES_USER: app
    POSTGRES_PASSWORD: app
    POSTGRES_DB: app_test
    DATABASE_URL: postgres://app:app@db:5432/app_test
  cache:
    key: { files: [package-lock.json] }
    paths: [.npm/]
  script:
    - npm ci --cache .npm
    - npm run lint
    - npx prisma migrate deploy
    - npm test
  artifacts:
    reports:
      junit: reports/junit.xml

build:
  stage: build
  image: docker:29
  services: [docker:29-dind]
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE .
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.74.0 image --exit-code 1 --severity CRITICAL $IMAGE
    - docker push $IMAGE

deploy_staging:
  stage: deploy
  environment: { name: staging, url: https://staging.example.com }
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  script: ./scripts/deploy.sh staging $IMAGE

deploy_production:
  stage: deploy
  needs: [deploy_staging]
  environment: { name: production, url: https://example.com }
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
  script: ./scripts/deploy.sh production $IMAGE`
      }
    ],
    verify: ["Pipeline hiển thị 3 stage; deploy_production có nút chạy tay", "Test report hiển thị trong Merge Request"],
    pitfalls: ["Docker-in-Docker cần runner privileged; có thể dùng Kaniko hoặc Buildah thay thế"]
  },
  {
    id: "lab09",
    phase: "p08",
    title: "Jenkinsfile declarative",
    level: "Trung cấp",
    minutes: 60,
    goal: "Đọc hiểu và viết pipeline Jenkins, loại pipeline vẫn phổ biến trong ngân hàng, viễn thông và doanh nghiệp lớn tại Việt Nam.",
    steps: [
      {
        t: "Chạy Jenkins bằng Docker",
        d: "Dùng cho mục đích học; production nên tách controller và agent.",
        lang: "bash", file: "terminal",
        code: `docker run -d --name jenkins -p 8081:8080 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
      },
      {
        t: "Jenkinsfile",
        d: "Credentials lưu trong Jenkins, không đặt trong code; bước `input` là cổng duyệt tay.",
        lang: "groovy", file: "Jenkinsfile",
        code: `pipeline {
  agent any
  options { timeout(time: 30, unit: 'MINUTES'); disableConcurrentBuilds() }
  environment {
    IMAGE = "registry.example.com/task-api:\${env.GIT_COMMIT.take(7)}"
  }
  stages {
    stage('Install') { steps { sh 'npm ci' } }
    stage('Quality') {
      parallel {
        stage('Lint') { steps { sh 'npm run lint' } }
        stage('Test') { steps { sh 'npm test -- --reporters=default --reporters=jest-junit' } }
      }
    }
    stage('Build & Push') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'registry', usernameVariable: 'U', passwordVariable: 'P')]) {
          sh 'echo $P | docker login registry.example.com -u $U --password-stdin'
          sh 'docker build -t $IMAGE . && docker push $IMAGE'
        }
      }
    }
    stage('Deploy staging') {
      when { branch 'main' }
      steps { sh './scripts/deploy.sh staging $IMAGE' }
    }
    stage('Approve production') {
      when { branch 'main' }
      steps { input message: 'Deploy lên production?', ok: 'Deploy' }
    }
    stage('Deploy production') {
      when { branch 'main' }
      steps { sh './scripts/deploy.sh production $IMAGE' }
    }
  }
  post {
    always { junit allowEmptyResults: true, testResults: 'junit.xml' }
    failure { echo 'Gửi cảnh báo Slack/Teams tại đây' }
  }
}`
      }
    ],
    verify: ["Multibranch pipeline tự phát hiện nhánh mới", "Stage Lint và Test chạy song song"],
    pitfalls: ["Dùng dấu nháy kép trong sh làm Groovy nội suy secret vào log", "Chạy build trên controller thay vì agent", "Bước input nằm trong pipeline có agent any giữ executor suốt lúc chờ duyệt; Lab 12 dùng agent none và directive input ở cấp stage"]
  },
  {
    id: "lab10",
    phase: "p09",
    title: "Nginx reverse proxy + TLS + Blue-Green trên VPS",
    level: "Trung cấp",
    minutes: 90,
    goal: "Tự vận hành một VPS: HTTPS miễn phí, chuyển đổi blue/green không downtime bằng cách reload Nginx.",
    steps: [
      {
        t: "Cấu hình Nginx",
        d: "Upstream trỏ tới container đang active. Script deploy đổi file upstream rồi reload Nginx.",
        lang: "nginx", file: "/etc/nginx/sites-available/api.conf",
        code: `include /etc/nginx/upstreams/task-api.conf;   # upstream task_api { server 127.0.0.1:3001; }

server {
  listen 80;
  server_name api.example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  http2 on;
  server_name api.example.com;

  ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
  add_header Strict-Transport-Security "max-age=31536000" always;

  client_max_body_size 10m;

  location / {
    proxy_pass http://task_api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}`
      },
      {
        t: "Script blue-green",
        d: "Khởi động màu mới, chờ healthy, chuyển upstream, reload Nginx, rồi mới tắt màu cũ.",
        lang: "bash", file: "deploy-bluegreen.sh",
        code: `#!/usr/bin/env bash
set -euo pipefail
IMAGE="$1"
CURRENT=$(grep -o '300[12]' /etc/nginx/upstreams/task-api.conf)
if [ "$CURRENT" = "3001" ]; then NEW=3002; COLOR=green; OLD=blue; else NEW=3001; COLOR=blue; OLD=green; fi

docker pull "$IMAGE"
docker rm -f "api-$COLOR" 2>/dev/null || true
docker run -d --name "api-$COLOR" --env-file /opt/app/.env -p "127.0.0.1:$NEW:3000" "$IMAGE"

for i in {1..30}; do
  curl -fs "http://127.0.0.1:$NEW/health" && break
  sleep 2; [ "$i" -eq 30 ] && { echo "Màu mới không healthy"; exit 1; }
done

echo "upstream task_api { server 127.0.0.1:$NEW; }" > /etc/nginx/upstreams/task-api.conf
nginx -t && systemctl reload nginx
sleep 10 && docker stop "api-$OLD" || true
echo "Đã chuyển sang $COLOR ($NEW)"`
      },
      {
        t: "Cấp chứng chỉ",
        d: "Certbot tự cài timer gia hạn.",
        lang: "bash", file: "terminal",
        code: `sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
sudo systemctl list-timers | grep certbot`
      }
    ],
    verify: ["Chạy `k6` hoặc `hey` trong lúc deploy: 0 request lỗi", "SSL Labs đạt hạng A", "Rollback = chạy lại script với image cũ"],
    pitfalls: ["Publish port container ra 0.0.0.0 nên có thể vượt qua Nginx (chỉ nên bind 127.0.0.1)", "Quên `nginx -t` trước khi reload"]
  },
  {
    id: "lab11",
    phase: "p11",
    title: "Metrics Prometheus + Grafana + Alert",
    level: "Trung cấp",
    minutes: 90,
    goal: "Expose metric RED từ API, thu thập bằng Prometheus, dashboard p95, cảnh báo khi error rate vượt ngưỡng.",
    steps: [
      {
        t: "Instrument API bằng prom-client",
        d: "Histogram cho độ trễ; label là route (template) chứ không phải URL thật để tránh bùng nổ cardinality.",
        lang: "typescript", file: "src/metrics.ts",
        code: `import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

client.collectDefaultMetrics();

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Độ trễ HTTP',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path ?? 'unknown', status: res.statusCode });
  });
  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}`
      },
      {
        t: "Prometheus scrape + alert rule",
        d: "Cảnh báo theo triệu chứng: tỉ lệ 5xx > 2% trong 5 phút.",
        lang: "yaml", file: "prometheus/prometheus.yml + rules.yml",
        code: `# prometheus.yml
global: { scrape_interval: 15s }
rule_files: [rules.yml]
scrape_configs:
  - job_name: task-api
    static_configs: [{ targets: ["api:3000"] }]

# rules.yml
groups:
  - name: task-api
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
            / sum(rate(http_request_duration_seconds_count[5m])) > 0.02
        for: 5m
        labels: { severity: page }
        annotations:
          summary: "Tỉ lệ lỗi 5xx > 2%"
          runbook: "https://wiki.example.com/runbooks/high-error-rate"`
      },
      {
        t: "Truy vấn PromQL cho dashboard",
        d: "Ba panel cơ bản của phương pháp RED.",
        lang: "text", file: "Grafana panels",
        code: `# Rate (RPS)
sum(rate(http_request_duration_seconds_count[1m])) by (route)

# Errors (%)
100 * sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
    / sum(rate(http_request_duration_seconds_count[5m]))

# Duration p95
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))`
      }
    ],
    verify: ["Gọi /metrics thấy http_request_duration_seconds_bucket", "Tạo lỗi 500 hàng loạt → alert chuyển trạng thái Pending rồi Firing", "Dashboard hiển thị p95 theo route"],
    pitfalls: ["Dùng req.url làm label (có ID nên cardinality tăng vô hạn)", "Cảnh báo theo CPU thay vì theo trải nghiệm người dùng"]
  },
  {
    id: "lab12",
    phase: "p08",
    title: "Jenkins dựng bằng code: JCasC + agent SSH + multibranch",
    level: "Nâng cao",
    minutes: 120,
    goal: "Dựng một Jenkins hoàn toàn bằng file: image có plugin, JCasC cấu hình bảo mật, agent và job; pipeline multibranch có test, đóng gói, duyệt và deploy giả lập có khoá. Xoá sạch rồi dựng lại được trong vài phút.",
    steps: [
      {
        t: "Cấu trúc thư mục và khoá SSH cho agent",
        d: "Controller dùng khoá riêng để SSH vào agent; agent nhận khoá công khai qua biến môi trường. File .env và thư mục keys/ không được commit.",
        lang: "bash", file: "terminal",
        code: `mkdir -p jenkins-lab/controller/casc jenkins-lab/agent jenkins-lab/keys
cd jenkins-lab
ssh-keygen -t ed25519 -N "" -C jenkins-agent -f keys/agent

echo "ADMIN_PASSWORD=doi-mat-khau-nay" > .env
echo "JENKINS_AGENT_SSH_PUBKEY=$(cat keys/agent.pub)" >> .env
echo "DEMO_REPO_URL=https://github.com/<tai-khoan-cua-ban>/task-api.git" >> .env
printf ".env\\nkeys/\\n" > .gitignore`
      },
      {
        t: "Image controller có sẵn plugin",
        d: "Không chạy setup wizard; JCasC đặt ngoài JENKINS_HOME để mỗi lần build image mới là cấu hình mới có hiệu lực.",
        lang: "dockerfile", file: "controller/Dockerfile",
        code: `FROM jenkins/jenkins:2.568.3-jdk21
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG=/var/jenkins_casc
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
COPY --chown=jenkins:jenkins casc/ /var/jenkins_casc/`
      },
      {
        t: "Danh sách plugin",
        d: "Lần đầu để plugin không kèm phiên bản cho dễ chạy; bước cuối sẽ xuất phiên bản đang cài để pin.",
        lang: "text", file: "controller/plugins.txt",
        code: `configuration-as-code
workflow-aggregator
git
ssh-slaves
credentials-binding
matrix-auth
job-dsl
pipeline-graph-view
junit
lockable-resources
timestamper
ws-cleanup`
      },
      {
        t: "Cấu hình JCasC",
        d: "Không build trên controller, phân quyền theo ma trận, agent SSH với credential scope SYSTEM đọc từ file secret, và job multibranch tạo bằng Job DSL. JCasC thay biến dạng \${TEN} bằng biến môi trường, kể cả bên trong script Job DSL.",
        lang: "yaml", file: "controller/casc/jenkins.yaml",
        code: `jenkins:
  systemMessage: "Lab 12: Jenkins được cấu hình bằng JCasC"
  numExecutors: 0
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: "admin"
          password: "\${ADMIN_PASSWORD}"
  authorizationStrategy:
    globalMatrix:
      entries:
        - user:
            name: "admin"
            permissions: ["Overall/Administer"]
        - group:
            name: "authenticated"
            permissions: ["Overall/Read", "Job/Read", "Job/Build"]
  nodes:
    - permanent:
        name: "agent-1"
        labelString: "linux node"
        numExecutors: 2
        remoteFS: "/home/jenkins/agent"
        launcher:
          ssh:
            host: "agent"
            port: 22
            credentialsId: "agent-ssh"
            sshHostKeyVerificationStrategy:
              manuallyTrustedKeyVerificationStrategy:
                requireInitialManualTrust: false

credentials:
  system:
    domainCredentials:
      - credentials:
          - basicSSHUserPrivateKey:
              scope: SYSTEM
              id: "agent-ssh"
              username: "jenkins"
              privateKeySource:
                directEntry:
                  privateKey: "\${readFile:/run/secrets/agent_key}"

unclassified:
  location:
    url: "http://localhost:8080/"

jobs:
  - script: |
      multibranchPipelineJob('task-api') {
        branchSources {
          git {
            id('task-api')
            remote('\${DEMO_REPO_URL}')
          }
        }
        orphanedItemStrategy { discardOldItems { numToKeep(10) } }
      }`
      },
      {
        t: "Image agent có Node.js",
        d: "Dựa trên image SSH agent chính thức (có sẵn Java 21 và git), thêm Node.js để chạy test của task-api.",
        lang: "dockerfile", file: "agent/Dockerfile",
        code: `FROM jenkins/ssh-agent:9.0.0-jdk21
RUN apt-get update \\
 && apt-get install -y --no-install-recommends nodejs npm \\
 && rm -rf /var/lib/apt/lists/*`
      },
      {
        t: "Docker Compose",
        d: "Khoá riêng đi vào controller dưới dạng secret file, không nằm trong image hay biến môi trường. Không cần mở cổng 50000 vì agent kết nối qua SSH.",
        lang: "yaml", file: "compose.yaml",
        code: `services:
  jenkins:
    build: ./controller
    ports: ["8080:8080"]
    environment:
      ADMIN_PASSWORD: \${ADMIN_PASSWORD}
      DEMO_REPO_URL: \${DEMO_REPO_URL}
    volumes: [jenkins_home:/var/jenkins_home]
    secrets: [agent_key]
  agent:
    build: ./agent
    environment:
      JENKINS_AGENT_SSH_PUBKEY: \${JENKINS_AGENT_SSH_PUBKEY}

secrets:
  agent_key:
    file: ./keys/agent

volumes:
  jenkins_home: {}`
      },
      {
        t: "Jenkinsfile trong repo task-api",
        d: "Commit file này vào nhánh main của repo task-api (cần devDependency jest-junit). Stage duyệt không có agent nên không giữ executor khi chờ.",
        lang: "groovy", file: "Jenkinsfile",
        code: `pipeline {
  agent none
  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timestamps()
  }
  stages {
    stage('Test') {
      agent { label 'linux' }
      steps {
        sh 'node --version && npm ci'
        sh 'npm test -- --reporters=default --reporters=jest-junit'
      }
      post {
        always  { junit allowEmptyResults: true, testResults: 'junit.xml' }
        cleanup { cleanWs() }
      }
    }
    stage('Đóng gói') {
      when { branch 'main'; beforeAgent true }
      agent { label 'linux' }
      steps {
        sh 'npm ci && npm pack'
        archiveArtifacts artifacts: '*.tgz', fingerprint: true
      }
    }
    stage('Duyệt') {
      when { branch 'main'; beforeInput true }
      options { timeout(time: 30, unit: 'MINUTES') }
      input {
        message 'Deploy bản này lên staging?'
        ok 'Deploy'
        submitter 'admin'
        submitterParameter 'APPROVER'
      }
      steps { echo "Duyệt bởi \${env.APPROVER}" }
    }
    stage('Deploy (giả lập)') {
      when { branch 'main'; beforeAgent true }
      agent { label 'linux' }
      steps {
        lock('lab-staging') {
          sh 'echo "Deploy commit $GIT_COMMIT lên staging" && sleep 20'
        }
      }
    }
  }
  post {
    fixed   { echo 'Pipeline đã xanh trở lại' }
    failure { echo "Lỗi, xem \${env.BUILD_URL}" }
  }
}`
      },
      {
        t: "Chạy, kiểm tra và pin phiên bản plugin",
        d: "Sau khi mọi thứ chạy ổn, xuất phiên bản plugin đang cài và ghi đè plugins.txt để các lần build sau giống hệt nhau. Tạo API token ở trang người dùng admin → Security.",
        lang: "bash", file: "terminal",
        code: `docker compose up -d --build
docker compose logs -f jenkins        # chờ dòng "Jenkins is fully up and running"

# Xuất danh sách plugin kèm phiên bản để pin
curl -fsS -u "admin:$JENKINS_TOKEN" \\
  "http://localhost:8080/pluginManager/api/json?depth=1&tree=plugins%5BshortName,version%5D" \\
  | jq -r '.plugins[] | "\\(.shortName):\\(.version)"' | sort > controller/plugins.txt

# Thử dựng lại từ đầu: xoá cả volume, cấu hình phải quay lại y nguyên
docker compose down -v && docker compose up -d --build`
      }
    ],
    verify: [
      "Đăng nhập bằng admin; trang Nodes có agent-1 online, Built-In Node có 0 executor",
      "Job task-api tự xuất hiện, quét thấy nhánh main và chạy pipeline",
      "Stage Duyệt dừng chờ, trong lúc chờ agent-1 không bị chiếm executor",
      "Chạy hai build main gần nhau: build sau chờ khoá lab-staging",
      "Sau docker compose down -v và up lại, cấu hình, agent và job vẫn đầy đủ"
    ],
    pitfalls: [
      "Trên Linux, file keys/agent chỉ user trên máy host đọc được; nếu uid khác 1000, controller không đọc được secret và agent không kết nối. Kiểm tra quyền file",
      "Git plugin chặn checkout từ đường dẫn file cục bộ vì lý do bảo mật; repo phải là URL (GitHub, GitLab)",
      "Sửa cấu hình trên giao diện rồi quên đưa vào jenkins.yaml, lần khởi động sau bị ghi đè",
      "Muốn Job DSL giữ nguyên chuỗi \${...} mà không để JCasC thay biến thì phải viết ^\${...}"
    ]
  },
  {
    id: "lab13",
    phase: "p08",
    title: "GitLab → Jenkins: nhánh builds/dev và builds/prod",
    level: "Nâng cao",
    minutes: 120,
    goal: "Dựng lại trên máy mình đúng quy trình hay gặp ở công ty: GitLab tự host, push vào builds/dev hay builds/prod thì webhook gọi job Jenkins tương ứng, build image, đẩy lên registry, deploy lên máy chủ dev hoặc prod. Prod có nhánh được bảo vệ, bước duyệt, và dùng lại đúng image đã chạy ở dev.",
    steps: [
      {
        t: "Chuẩn bị thư mục, khoá SSH và file .env",
        d: "Lab chạy trên Docker Desktop, cần cấp cho Docker ít nhất 4GB RAM vì GitLab khá nặng. Token GitLab tạm để trống, sẽ điền ở bước cấu hình GitLab.",
        lang: "bash", file: "terminal",
        code: `mkdir -p gitlab-jenkins-lab/controller/casc gitlab-jenkins-lab/agent gitlab-jenkins-lab/keys gitlab-jenkins-lab/demo-app
cd gitlab-jenkins-lab
ssh-keygen -t ed25519 -N "" -C jenkins-agent -f keys/agent

echo "GITLAB_ROOT_PASSWORD=DevPath-Lab-2026!" > .env
echo "ADMIN_PASSWORD=doi-mat-khau-nay" >> .env
echo "GITLAB_TOKEN=dien-sau" >> .env
echo "WEBHOOK_TOKEN_DEV=$(openssl rand -hex 16)" >> .env
echo "WEBHOOK_TOKEN_PROD=$(openssl rand -hex 16)" >> .env
echo "JENKINS_AGENT_SSH_PUBKEY=$(cat keys/agent.pub)" >> .env`
      },
      {
        t: "Docker Compose: GitLab, Jenkins, agent, registry và máy chủ giả lập",
        d: "GitLab tự host như ở công ty; registry đóng vai AWS ECR hoặc registry trên FPT Cloud; container docker (Docker-in-Docker) đóng vai máy chủ chạy app, dev ở cổng 8081, prod ở cổng 8082.",
        lang: "yaml", file: "compose.yaml",
        code: `services:
  gitlab:
    image: gitlab/gitlab-ce:19.4.1-ce.0
    hostname: gitlab
    shm_size: 256m
    ports: ["8929:8929"]
    environment:
      GITLAB_ROOT_PASSWORD: \${GITLAB_ROOT_PASSWORD}
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://gitlab:8929'
        gitlab_rails['initial_root_password'] = ENV['GITLAB_ROOT_PASSWORD']
        # Cấu hình cho máy ít RAM (theo tài liệu GitLab "memory-constrained environments")
        puma['worker_processes'] = 0
        sidekiq['concurrency'] = 10
        prometheus_monitoring['enable'] = false
        gitlab_kas['enable'] = false
        gitlab_rails['env'] = { 'MALLOC_CONF' => 'dirty_decay_ms:1000,muzzy_decay_ms:1000' }
    volumes:
      - gitlab_config:/etc/gitlab
      - gitlab_data:/var/opt/gitlab
      - gitlab_logs:/var/log/gitlab

  jenkins:
    build: ./controller
    ports: ["8080:8080"]
    environment:
      ADMIN_PASSWORD: \${ADMIN_PASSWORD}
      GITLAB_TOKEN: \${GITLAB_TOKEN}
      WEBHOOK_TOKEN_DEV: \${WEBHOOK_TOKEN_DEV}
      WEBHOOK_TOKEN_PROD: \${WEBHOOK_TOKEN_PROD}
    volumes: [jenkins_home:/var/jenkins_home]
    secrets: [agent_key]

  agent:
    build: ./agent
    environment:
      JENKINS_AGENT_SSH_PUBKEY: \${JENKINS_AGENT_SSH_PUBKEY}

  # "Máy chủ" giả lập: Docker riêng để build image và chạy app dev/prod
  docker:
    image: docker:29-dind
    privileged: true
    command: ["--insecure-registry=registry:5000"]
    environment:
      DOCKER_TLS_CERTDIR: ""
    ports: ["8081:8081", "8082:8082"]

  # Kho image, đóng vai trò như AWS ECR hoặc registry trên cloud của công ty
  registry:
    image: registry:3

secrets:
  agent_key:
    file: ./keys/agent

volumes:
  gitlab_config: {}
  gitlab_data: {}
  gitlab_logs: {}
  jenkins_home: {}`
      },
      {
        t: "Image Jenkins có plugin GitLab",
        d: "Giống Lab 12, thêm gitlab-plugin để nhận webhook dạng /project/TEN_JOB.",
        lang: "dockerfile", file: "controller/Dockerfile",
        code: `FROM jenkins/jenkins:2.568.3-jdk21
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG=/var/jenkins_casc
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
COPY --chown=jenkins:jenkins casc/ /var/jenkins_casc/`
      },
      {
        t: "Danh sách plugin",
        d: "gitlab-plugin cung cấp trigger \"Build when a change is pushed to GitLab\" giống job ở công ty.",
        lang: "text", file: "controller/plugins.txt",
        code: `configuration-as-code
workflow-aggregator
git
ssh-slaves
credentials-binding
matrix-auth
job-dsl
pipeline-graph-view
lockable-resources
timestamper
ws-cleanup
gitlab-plugin`
      },
      {
        t: "JCasC: hai job app-dev và app-prod",
        d: "Mỗi job cố định một nhánh (Branch Specifier) và chỉ nhận push của nhánh đó (includeBranchesSpec), có secret token riêng. Agent được cấp biến DOCKER_HOST trỏ tới máy chủ giả lập.",
        lang: "yaml", file: "controller/casc/jenkins.yaml",
        code: `jenkins:
  systemMessage: "Lab 13: GitLab → Jenkins, nhánh builds/dev và builds/prod"
  numExecutors: 0
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: "admin"
          password: "\${ADMIN_PASSWORD}"
  authorizationStrategy:
    globalMatrix:
      entries:
        - user:
            name: "admin"
            permissions: ["Overall/Administer"]
        - group:
            name: "authenticated"
            permissions: ["Overall/Read", "Job/Read", "Job/Build"]
  nodes:
    - permanent:
        name: "agent-1"
        labelString: "linux docker"
        numExecutors: 2
        remoteFS: "/home/jenkins/agent"
        nodeProperties:
          - envVars:
              env:
                - key: "DOCKER_HOST"
                  value: "tcp://docker:2375"
        launcher:
          ssh:
            host: "agent"
            port: 22
            credentialsId: "agent-ssh"
            sshHostKeyVerificationStrategy:
              manuallyTrustedKeyVerificationStrategy:
                requireInitialManualTrust: false

credentials:
  system:
    domainCredentials:
      - credentials:
          - basicSSHUserPrivateKey:
              scope: SYSTEM
              id: "agent-ssh"
              username: "jenkins"
              privateKeySource:
                directEntry:
                  privateKey: "\${readFile:/run/secrets/agent_key}"
          - usernamePassword:
              scope: GLOBAL
              id: "gitlab-clone"
              description: "Access token để Jenkins kéo code từ GitLab"
              username: "oauth2"
              password: "\${GITLAB_TOKEN}"

unclassified:
  location:
    url: "http://jenkins:8080/"

jobs:
  - script: |
      pipelineJob('app-dev') {
        description('Build và deploy môi trường DEV khi có push vào nhánh builds/dev')
        properties {
          pipelineTriggers {
            triggers {
              gitlab {
                triggerOnPush(true)
                triggerOnMergeRequest(false)
                branchFilterType('NameBasedFilter')
                includeBranchesSpec('builds/dev')
                secretToken('\${WEBHOOK_TOKEN_DEV}')
              }
            }
          }
        }
        definition {
          cpsScm {
            scm {
              git {
                remote {
                  url('http://gitlab:8929/root/demo-app.git')
                  credentials('gitlab-clone')
                }
                branch('*/builds/dev')
              }
            }
            scriptPath('Jenkinsfile')
          }
        }
      }
      pipelineJob('app-prod') {
        description('Build và deploy môi trường PROD khi có push vào nhánh builds/prod')
        properties {
          pipelineTriggers {
            triggers {
              gitlab {
                triggerOnPush(true)
                triggerOnMergeRequest(false)
                branchFilterType('NameBasedFilter')
                includeBranchesSpec('builds/prod')
                secretToken('\${WEBHOOK_TOKEN_PROD}')
              }
            }
          }
        }
        definition {
          cpsScm {
            scm {
              git {
                remote {
                  url('http://gitlab:8929/root/demo-app.git')
                  credentials('gitlab-clone')
                }
                branch('*/builds/prod')
              }
            }
            scriptPath('Jenkinsfile')
          }
        }
      }`
      },
      {
        t: "Image agent: Node.js và Docker CLI",
        d: "Agent chạy test bằng Node và ra lệnh build/chạy container trên máy chủ giả lập qua DOCKER_HOST.",
        lang: "dockerfile", file: "agent/Dockerfile",
        code: `FROM jenkins/ssh-agent:9.0.0-jdk21
RUN apt-get update \\
 && apt-get install -y --no-install-recommends nodejs npm docker-cli curl \\
 && rm -rf /var/lib/apt/lists/*`
      },
      {
        t: "Ứng dụng mẫu",
        d: "Một API nhỏ trả lời theo môi trường, có endpoint /health cho smoke test.",
        lang: "javascript", file: "demo-app/server.js",
        code: `const http = require('node:http');

const APP_ENV = process.env.APP_ENV || 'local';

function handler(req, res) {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', env: APP_ENV }));
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(\`Xin chào từ môi trường \${APP_ENV}\\n\`);
}

if (require.main === module) http.createServer(handler).listen(3000);
module.exports = { handler };`
      },
      {
        t: "Test của ứng dụng",
        d: "Test chạy bằng test runner có sẵn của Node, không cần cài thư viện.",
        lang: "javascript", file: "demo-app/server.test.js",
        code: `const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { handler } = require('./server');

test('GET /health trả về ok', async () => {
  const server = http.createServer(handler).listen(0);
  const { port } = server.address();
  const res = await fetch(\`http://127.0.0.1:\${port}/health\`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
  server.close();
});`
      },
      {
        t: "package.json",
        d: "Script test gọi node --test.",
        lang: "json", file: "demo-app/package.json",
        code: `{
  "name": "demo-app",
  "version": "1.0.0",
  "private": true,
  "scripts": { "test": "node --test" }
}`
      },
      {
        t: "Dockerfile của ứng dụng",
        d: "Image chạy bằng user node, không phải root.",
        lang: "dockerfile", file: "demo-app/Dockerfile",
        code: `FROM node:24-alpine
WORKDIR /app
COPY package.json server.js ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]`
      },
      {
        t: "Jenkinsfile dùng chung cho hai nhánh",
        d: "Môi trường suy ra từ nhánh. Image tag theo commit; nếu image của commit đó đã có trên registry (đã build ở dev) thì prod dùng lại, không build lại. Prod phải bấm duyệt trước khi deploy.",
        lang: "groovy", file: "demo-app/Jenkinsfile",
        code: `// Một Jenkinsfile dùng chung cho cả nhánh builds/dev và builds/prod.
// Job app-dev kéo nhánh builds/dev, job app-prod kéo nhánh builds/prod.
pipeline {
  agent none
  options {
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
    timestamps()
  }
  environment {
    REGISTRY = 'registry:5000'
    APP      = 'demo-app'
  }
  stages {
    stage('Xác định môi trường') {
      agent { label 'linux' }
      steps {
        script {
          // GIT_BRANCH có dạng origin/builds/dev hoặc origin/builds/prod
          env.DEPLOY_ENV = env.GIT_BRANCH.endsWith('builds/prod') ? 'prod' : 'dev'
          env.APP_PORT   = env.DEPLOY_ENV == 'prod' ? '8082' : '8081'
          env.IMAGE      = "\${env.REGISTRY}/\${env.APP}:\${env.GIT_COMMIT.take(12)}"
        }
        echo "Nhánh \${env.GIT_BRANCH} → môi trường \${env.DEPLOY_ENV}, image \${env.IMAGE}"
      }
    }
    stage('Test') {
      agent { label 'linux' }
      steps { sh 'npm test' }
    }
    stage('Build & push image') {
      agent { label 'docker' }
      steps {
        sh '''
          if docker pull "$IMAGE" > /dev/null 2>&1; then
            echo "Image $IMAGE đã có sẵn (đã build ở dev với cùng commit), dùng lại, không build lại"
          else
            docker build -t "$IMAGE" .
            docker push "$IMAGE"
          fi
        '''
      }
    }
    stage('Duyệt production') {
      when {
        beforeInput true
        expression { env.DEPLOY_ENV == 'prod' }
      }
      options { timeout(time: 1, unit: 'HOURS') }
      input {
        message 'Deploy bản này lên PRODUCTION?'
        ok 'Deploy'
        submitter 'admin'
        submitterParameter 'APPROVER'
      }
      steps { echo "Duyệt bởi \${env.APPROVER}" }
    }
    stage('Deploy') {
      agent { label 'docker' }
      steps {
        lock("demo-\${env.DEPLOY_ENV}") {
          sh '''
            docker rm -f "demo-$DEPLOY_ENV" > /dev/null 2>&1 || true
            docker run -d --name "demo-$DEPLOY_ENV" --restart unless-stopped \\
              -e APP_ENV="$DEPLOY_ENV" -p "$APP_PORT:3000" "$IMAGE"
            curl -fsS --retry 10 --retry-delay 2 --retry-all-errors "http://docker:$APP_PORT/health"
          '''
        }
      }
    }
  }
  post {
    success { echo "Đã deploy \${env.IMAGE} lên \${env.DEPLOY_ENV}" }
    failure { echo "Pipeline lỗi, xem \${env.BUILD_URL}" }
  }
}`
      },
      {
        t: "Khởi động và cấu hình GitLab",
        d: "Mở http://localhost:8929, đăng nhập root với mật khẩu trong .env, rồi làm trên giao diện: (1) Admin → Settings → Network → Outbound requests: bật \"Allow requests to the local network from webhooks and integrations\" vì Jenkins nằm cùng mạng nội bộ. (2) Ảnh đại diện → Edit profile → Access → Personal access tokens → Generate token → Legacy token, chọn scope read_repository; dán token vào GITLAB_TOKEN trong .env. (3) Tạo project trống tên demo-app, bỏ chọn tạo README. (4) Trong project: Settings → Merge requests → Merge method: Fast-forward merge.",
        lang: "bash", file: "terminal",
        code: `docker compose up -d --build
docker compose logs -f gitlab     # chờ khoảng 3-5 phút tới khi trang đăng nhập mở được

# Sau khi điền GITLAB_TOKEN vào .env:
docker compose up -d jenkins      # tạo lại container Jenkins để JCasC đọc token mới`
      },
      {
        t: "Đẩy code vào hai nhánh, bảo vệ prod và tạo webhook",
        d: "Sau khi đẩy code: (1) Settings → Repository → Branch rules → Add branch rule cho builds/prod: Allowed to merge = Maintainers, Allowed to push and merge = No one. (2) Settings → Webhooks → Add new webhook: URL http://jenkins:8080/project/app-dev, Secret token là WEBHOOK_TOKEN_DEV, tick Push events và lọc nhánh builds/dev, bỏ Enable SSL verification vì lab dùng http. Tạo webhook thứ hai tương tự cho http://jenkins:8080/project/app-prod với WEBHOOK_TOKEN_PROD và nhánh builds/prod.",
        lang: "bash", file: "terminal",
        code: `cd demo-app
git init -b builds/dev
git add . && git commit -m "Khởi tạo demo-app"
# Nhập user root và mật khẩu root khi được hỏi
git push http://localhost:8929/root/demo-app.git builds/dev builds/dev:builds/prod`
      },
      {
        t: "Chạy thử cả quy trình",
        d: "Push vào builds/dev: app-dev tự chạy và deploy lên cổng 8081. Tạo merge request builds/dev → builds/prod trên GitLab và merge: app-prod tự chạy, log báo dùng lại image, dừng chờ bạn bấm Deploy trên Jenkins (http://localhost:8080), rồi deploy lên cổng 8082.",
        lang: "bash", file: "terminal",
        code: `echo "# demo-app" > README.md
git add README.md && git commit -m "Thêm README"
git push http://localhost:8929/root/demo-app.git builds/dev

curl http://localhost:8081/      # Xin chào từ môi trường dev
# Sau khi merge MR lên prod và bấm Deploy trên Jenkins:
curl http://localhost:8082/      # Xin chào từ môi trường prod

# Thử push thẳng vào prod: GitLab phải từ chối
git commit --allow-empty -m "thu push thang"
git push http://localhost:8929/root/demo-app.git builds/dev:builds/prod

# Dọn dẹp khi học xong (xoá cả dữ liệu)
cd .. && docker compose down -v`
      }
    ],
    verify: [
      "Push vào builds/dev chỉ kích hoạt app-dev; log ghi \"Started by GitLab push\" và Checking out Revision ... (refs/remotes/origin/builds/dev)",
      "http://localhost:8081 trả lời \"Xin chào từ môi trường dev\"",
      "Merge request builds/dev → builds/prod kích hoạt app-prod; log ghi image đã có sẵn và dùng lại, không build lại",
      "Trong lúc app-prod chờ duyệt, agent-1 không bị chiếm executor",
      "Sau khi bấm Deploy, http://localhost:8082 trả lời \"Xin chào từ môi trường prod\"",
      "Push thẳng vào builds/prod bị GitLab từ chối: You are not allowed to push code to protected branches"
    ],
    pitfalls: [
      "Lần khởi động đầu, GitLab đôi khi dừng giữa chừng khi tự cấu hình (lỗi reload sidekiq log). Chạy lại docker compose up -d là được",
      "Docker Desktop cấp dưới 4GB RAM, GitLab chạy rất chậm hoặc bị kill",
      "Quên bật cho phép webhook tới mạng nội bộ, GitLab từ chối lưu webhook trỏ tới http://jenkins:8080",
      "Webhook trỏ tới /job/app-dev/build thay vì /project/app-dev, bỏ qua plugin GitLab và bộ lọc nhánh",
      "Điền token vào .env nhưng chỉ docker compose restart, container giữ biến môi trường cũ; phải dùng docker compose up -d jenkins",
      "Chọn Merge commit hoặc squash khi merge lên prod: commit SHA đổi nên prod build lại image mới"
    ]
  }
];
