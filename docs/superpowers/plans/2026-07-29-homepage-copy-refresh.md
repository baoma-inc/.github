# Homepage Copy Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the baoma-inc organization profile copy to describe the current five-project HomeLink Proxy system without changing the existing page layout.

**Architecture:** Make a content-only edit to `profile/README.md`. Preserve every top-level section, automation marker, table column, HTML wrapper, and visual asset while updating the banner, narrative, project rows, Mermaid nodes and edges, security wording, and footer line.

**Tech Stack:** GitHub Flavored Markdown, inline HTML, Mermaid, URL-encoded image query strings

## Global Constraints

- Do not add, remove, rename, or reorder top-level README sections.
- Preserve the centered header and footer, banner, logo, badges, technology badges, separators, contribution snake, and automation-managed blocks.
- Keep the current four-column project table and the existing Mermaid section and visual class style.
- Do not expose private hosts, ports, credentials, environment variables, deployment details, or unreleased procedures.
- Do not claim production readiness, achieved capacity, compliance certification, or security controls without repository evidence.
- Describe only the implemented mobile proxy product; do not imply additional proxy product lines.

---

### Task 1: Refresh Public Profile Copy

**Files:**
- Modify: `profile/README.md:3-202`

**Interfaces:**
- Consumes: the fixed layout contract in `docs/superpowers/specs/2026-07-29-homepage-copy-refresh-design.md`
- Produces: a public profile with the same section structure and an updated five-project system narrative

- [ ] **Step 1: Record layout invariants before editing**

Run:

~~~~bash
git show origin/main:profile/README.md | rg '^## |<!-- [A-Z]+:(START|END) -->|^<div align=|^</div>$|^---$'
~~~~

Expected: eight `##` headings in their current order, paired `STATS:BADGES`, `LANGS`, `LEADERBOARD`, and `MEMBERS` markers, and the current div/separator structure.

- [ ] **Step 2: Update the banner and typing animation copy**

Set the banner description to `移动代理平台 · 分布式边缘网络基础设施`.

Set the four rotating lines to:

~~~~text
用户授权设备 · 安全接入移动代理网络
Android × Go × TypeScript × Rust
分布式反向隧道 · 就近调度 · 高并发网关
客户控制台 · 审计分析 · 自动化运营
~~~~

Encode each query value with `encodeURIComponent`. Keep every other banner and typing-image query parameter unchanged.

- [ ] **Step 3: Replace the About section body**

Keep the heading and separators, and use this body:

~~~~markdown
欢迎来到 **baoma-inc（宝马研发中心）** —— 一个围绕 **HomeLink Proxy** 构建移动代理产品与分布式边缘基础设施的工程团队。

我们的核心方向：

- 📱 **授权设备网络化**：将用户授权的 Android 设备接入安全可控的移动网络节点池；
- 🌐 **移动代理产品化**：用统一的官网、客户控制台与运营后台承载账户、接入、用量和服务流程；
- ⚡ **分布式流量调度**：以 Go 构建反向隧道、就近调度与高并发代理网关；
- 📊 **可观测运营闭环**：通过 Rust、ClickHouse 与自动化运营系统连接审计、容量分析、财务和风控。

> 从用户授权的终端到客户可用的代理服务，我们让设备、流量、数据与运营形成可靠闭环。
~~~~

- [ ] **Step 4: Replace the project table rows**

Keep the existing four-column header and alignment row, then use these rows:

~~~~markdown
| 📱 [**baomao_android**](https://github.com/baoma-inc/baomao_android) | `Kotlin` `Gradle` `Foreground Service` | 用户授权的 Android 边缘节点客户端，以出站 TLS/WSS 长连接接入网关，在设备侧完成安全流量转发 | `MVP 0A` 骨架验证 |
| 🛰️ [**idlephone**](https://github.com/baoma-inc/idlephone) | `Go` `PostgreSQL` `Redis` `ClickHouse` `APISIX` | 移动代理控制平面与分布式网关：负责设备接入、就近调度、代理鉴权、反向隧道和流量计量 | `Active` 持续迭代 |
| 🌐 [**frontend**](https://github.com/baoma-inc/frontend) | `TypeScript` `Next.js` `React` `PostgreSQL` `Redis` | HomeLink Proxy 官网、客户控制台与运营后台，承载账户、接入凭据、用量、账单和服务流程 | `Active` 产品建设 |
| 🦀 [**rust**](https://github.com/baoma-inc/rust) | `Rust` `Axum` `Tokio` `ClickHouse` | 独立的 HTTPS 审计日志与容量事件接收服务，为网关提供有界队列写入和可观测数据入口 | `Active` 独立演进 |
| 💳 [**expense-flow**](https://github.com/baoma-inc/expense-flow) | `TypeScript` `Next.js` `Drizzle` `Cloudflare` | 企业内部财务与运营系统，覆盖报销审批、虚拟卡管理、对账和风险预警 | `Production` 生产运行 |
~~~~

- [ ] **Step 5: Replace the architecture introduction and Mermaid body**

Use this introduction:

~~~~markdown
五个项目围绕移动代理产品协同：**baomao_android** 提供边缘出口，**idlephone** 负责控制平面与流量网关，**frontend** 承载 HomeLink Proxy 产品入口，**rust** 接收审计与容量事件，**expense-flow** 支撑内部财务和风控运营。
~~~~

Use this exact Mermaid body:

~~~~mermaid
graph TD
    classDef client fill:#1f2d3d,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef backend fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef ops fill:#2d1a10,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef db fill:#0c2340,stroke:#64748b,stroke-width:2px,color:#fff;

    subgraph "产品、终端与流量入口"
        Android["📱 Android 边缘节点<br>(baomao_android)"]:::client
        Customer["👥 HomeLink Proxy 客户<br>控制台 / 代理请求"]:::client
        Web["🌐 官网与控制台<br>(frontend)"]:::client
    end

    subgraph "分布式边缘控制网关 (idlephone)"
        APISIX["⚡ APISIX 服务入口"]:::backend
        ProxyGW["🔄 Proxy Gateway"]:::backend
        TunnelGW["📡 Tunnel Gateway 集群"]:::backend
        NodeSvc["⚙️ Node Service 就近调度"]:::backend
        Access["🔑 代理凭据与配额"]:::backend
        DeviceSvc["🆔 Device Service"]:::backend
        AdminApi["🛡️ Admin API (RBAC)"]:::backend
    end

    subgraph "数据存储与可观测层"
        PG[("🐘 PostgreSQL<br>账户 / 设备 / 业务数据")]:::db
        Redis[("⚡ Redis<br>路由 / 在线态 / 配额")]:::db
        Logger["🦀 Capacity Logger<br>(rust)"]:::db
        CH[("📊 ClickHouse<br>审计 / 流量 / 容量事件")]:::db
    end

    subgraph "企业财务与运营"
        ExpenseFlow["💳 财务与对账<br>(expense-flow)"]:::ops
        DingTalk["🤖 运营风险预警"]:::ops
    end

    Customer -->|账户 / 账单 / 接入管理| Web
    Customer -->|HTTP / HTTPS CONNECT| ProxyGW
    Web <-->|账户、额度与用量同步| NodeSvc
    Web -->|在线节点与运营管理| AdminApi

    Android -->|TLS / WSS 反向隧道| APISIX
    APISIX --> TunnelGW
    ProxyGW -->|边缘内网桥接| TunnelGW
    TunnelGW -->|字节流双向转发| Android

    NodeSvc -->|就近选路与设备分配| DeviceSvc
    Access -->|凭据与配额校验| ProxyGW
    AdminApi -->|配置管理与审计| PG

    NodeSvc & DeviceSvc & AdminApi & Web & ExpenseFlow -->|业务事务| PG
    ProxyGW & TunnelGW & NodeSvc & Web -->|状态与路由| Redis
    ProxyGW & TunnelGW -->|HTTPS 审计与容量事件| Logger
    Logger -->|批量写入| CH

    ExpenseFlow -->|财务数据| PG
    ExpenseFlow -->|异常与中断告警| DingTalk
~~~~

- [ ] **Step 6: Calibrate security and footer copy**

Use this security list:

~~~~markdown
- 🔐 仓库禁止提交明文凭证，敏感配置通过环境变量与密钥管理注入；
- 🛡️ 核心服务以 CI 执行格式、静态检查、测试、依赖与镜像安全门禁；
- 🌐 设备仅建立出站加密连接，服务入口与内部组件按职责隔离。
~~~~

Replace the footer sentence with:

~~~~markdown
**⭐ 让每一台用户授权设备成为可靠的移动网络节点 ⭐**
~~~~

- [ ] **Step 7: Inspect and commit the content change**

Run:

~~~~bash
git diff -- profile/README.md
git diff --check
git add profile/README.md
git commit -m "docs: refresh organization profile copy"
~~~~

Expected: one commit containing only `profile/README.md`, with no whitespace errors.

---

### Task 2: Verify Layout, Diagram, Links, and Publication State

**Files:**
- Verify: `profile/README.md`

**Interfaces:**
- Consumes: the updated Markdown from Task 1 and the original file at `origin/main:profile/README.md`
- Produces: publication evidence that the layout contract and public-safety requirements hold

- [ ] **Step 1: Compare fixed structural tokens**

Run:

~~~~bash
diff <(git show origin/main:profile/README.md | rg '^## |<!-- [A-Z]+:(START|END) -->|^<div align=|^</div>$|^---$') <(rg '^## |<!-- [A-Z]+:(START|END) -->|^<div align=|^</div>$|^---$' profile/README.md)
~~~~

Expected: exit code 0 and no output.

- [ ] **Step 2: Verify table shape and required project names**

Run:

~~~~bash
rg '^\| .*\| .*\| .*\| .*\|$' profile/README.md
rg -n 'baomao_android|idlephone|frontend|rust|expense-flow' profile/README.md
~~~~

Expected: the project header, alignment row, and five project rows each have four columns; all five names appear in the project and system narrative.

- [ ] **Step 3: Compile the Mermaid graph**

Run:

~~~~bash
verify_dir=$(mktemp -d)
awk '/^`{3}mermaid$/{inside=1; next} inside && /^`{3}$/{exit} inside' profile/README.md > "$verify_dir/profile.mmd"
npx --yes @mermaid-js/mermaid-cli -i "$verify_dir/profile.mmd" -o "$verify_dir/profile.svg" -b transparent
test -s "$verify_dir/profile.svg"
~~~~

Expected: Mermaid CLI exits 0 and produces a non-empty SVG.

- [ ] **Step 4: Scan for private infrastructure and unsupported claims**

Run:

~~~~bash
rg -n '(https?://(localhost|127\.0\.0\.1|[0-9]{1,3}(\.[0-9]{1,3}){3})|:[0-9]{4,5}|TOKEN|SECRET|PASSWORD|十万级在线|合规认证)' profile/README.md
~~~~

Expected: no matches.

- [ ] **Step 5: Verify unchanged URLs**

Run:

~~~~bash
git show origin/main:profile/README.md | rg -o 'https://[^)>" ]+' | sort -u > "$verify_dir/before-urls.txt"
rg -o 'https://[^)>" ]+' profile/README.md | sort -u > "$verify_dir/after-urls.txt"
diff "$verify_dir/before-urls.txt" "$verify_dir/after-urls.txt"
~~~~

Expected: only the new `frontend` and `rust` repository URLs are added; all original image and repository URLs remain.

- [ ] **Step 6: Confirm clean publication state**

Run:

~~~~bash
git status --short --branch
git log -4 --oneline
~~~~

Expected: a clean working tree with the design, implementation plan, and profile refresh commits ahead of `origin/main`.
