# Profile README Facts Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the public organization profile with the current Tianqing Android product facts and current generated organization statistics.

**Architecture:** Make a narrowly scoped content edit to the Android project references in `profile/README.md`, preserving the existing layout and every automation marker. Then use the repository's existing stats script as the only writer for generated README blocks and badge assets.

**Tech Stack:** GitHub Flavored Markdown, inline HTML, Mermaid, Node.js 22+, GitHub REST API

## Global Constraints

- Treat `baomao_android/README.md` as the source of truth for the product name, milestone, connection model, and backend integration status.
- Keep `baomao_android` as the repository identity and do not change its link.
- Keep every non-Android project description unchanged.
- Preserve all top-level sections, visual assets, wrappers, table columns, Mermaid styles, and automation markers.
- Let `scripts/update-stats.mjs` exclusively update `STATS:BADGES`, `LANGS`, `LEADERBOARD`, `MEMBERS`, and generated badge assets.
- Do not add private hosts, credentials, signing details, or operational procedures.

---

### Task 1: Synchronize Android Product Facts

**Files:**
- Modify: `profile/README.md:59`
- Modify: `profile/README.md:69`
- Modify: `profile/README.md:79`

**Interfaces:**
- Consumes: public product facts from `baomao_android/README.md`
- Produces: consistent Tianqing naming and milestone copy for the profile table and architecture section

- [ ] **Step 1: Record the fixed profile structure**

Run:

```bash
git show origin/main:profile/README.md | rg '^## |<!-- [A-Z:]+:(START|END) -->|^<div align=|^</div>$|^---$' > /tmp/baoma-profile-structure-before.txt
```

Expected: the command exits 0 and records the existing headings, markers, wrappers, and separators.

- [ ] **Step 2: Update the Android project table row**

Replace the existing `baomao_android` row with:

```markdown
| 📱 [**天晴（baomao_android）**](https://github.com/baoma-inc/baomao_android) | `Kotlin` `Gradle` `Foreground Service` | 用户授权的 Android 边缘节点客户端，以出站 TLS/WSS 长连接接入网关，在设备侧完成安全流量转发 | `MVP 1` 真实后端对接 |
```

- [ ] **Step 3: Update the architecture introduction**

Replace the existing introduction with:

```markdown
五个项目围绕移动代理产品协同：**天晴（baomao_android）** 提供 Android 边缘出口，**idlephone** 负责控制平面与流量网关，**frontend** 承载 HomeLink Proxy 产品入口，**rust** 接收审计与容量事件，**expense-flow** 支撑内部财务和风控运营。
```

- [ ] **Step 4: Update the Android Mermaid node label**

Replace the Android node with:

```mermaid
        Android["📱 天晴 Android 边缘节点<br>(baomao_android)"]:::client
```

- [ ] **Step 5: Verify copy and layout invariants**

Run:

```bash
rg -n '天晴|baomao_android|MVP 1|真实后端' profile/README.md
! rg -n 'MVP 0A' profile/README.md
diff /tmp/baoma-profile-structure-before.txt <(rg '^## |<!-- [A-Z:]+:(START|END) -->|^<div align=|^</div>$|^---$' profile/README.md)
git diff --check
```

Expected: all four current facts are present, `MVP 0A` is absent, the structure diff is empty, and no whitespace errors are reported.

- [ ] **Step 6: Commit the manual profile copy**

```bash
git add profile/README.md
git commit -m "docs: update Tianqing project status"
```

Expected: one commit changing only `profile/README.md`.

---

### Task 2: Refresh Generated Statistics and Verify Publication

**Files:**
- Modify: `profile/README.md`
- Modify: `profile/assets/badges/*.svg` when organization statistics changed
- Test: `scripts/org-stats-config.test.mjs`

**Interfaces:**
- Consumes: `GH_TOKEN`, `ORG=baoma-inc`, and the marker contract in `profile/README.md`
- Produces: regenerated statistics blocks and self-hosted badge SVGs

- [ ] **Step 1: Run the stats configuration test**

Run:

```bash
node --test scripts/org-stats-config.test.mjs
```

Expected: all tests pass.

- [ ] **Step 2: Refresh statistics with the authenticated GitHub token**

Run:

```bash
GH_TOKEN="$(gh auth token)" ORG=baoma-inc node scripts/update-stats.mjs
```

Expected: the script reports visible members, repositories, languages, contributors, and total commits without an authorization error.

- [ ] **Step 3: Compile the Mermaid graph**

Run:

```bash
verify_dir="$(mktemp -d)"
awk '/^`{3}mermaid$/{inside=1; next} inside && /^`{3}$/{exit} inside' profile/README.md > "$verify_dir/profile.mmd"
npx --yes @mermaid-js/mermaid-cli -i "$verify_dir/profile.mmd" -o "$verify_dir/profile.svg" -b transparent
test -s "$verify_dir/profile.svg"
```

Expected: Mermaid CLI exits 0 and produces a non-empty SVG.

- [ ] **Step 4: Verify links and generated marker pairs**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs')
const md = fs.readFileSync('profile/README.md', 'utf8')
for (const name of ['STATS:BADGES', 'LANGS', 'LEADERBOARD', 'MEMBERS']) {
  if ((md.match(new RegExp(`<!-- ${name}:(START|END) -->`, 'g')) ?? []).length !== 2) process.exit(1)
}
for (const url of [...md.matchAll(/https:\/\/[^)>" ]+/g)].map((match) => match[0])) {
  if (!URL.canParse(url)) process.exit(1)
}
NODE
git diff --check
```

Expected: marker and URL validation exits 0, followed by no whitespace errors.

- [ ] **Step 5: Inspect and commit generated updates**

Run:

```bash
git status --short
git diff --stat
git diff -- profile/README.md profile/assets/badges
git add profile/README.md profile/assets/badges
git commit -m "chore: refresh organization statistics"
```

Expected: the commit contains only script-generated README statistics and badge changes. If the script produces no diff, skip the commit.

- [ ] **Step 6: Verify final repository state**

Run:

```bash
git status --short --branch
git log -4 --oneline
```

Expected: the worktree is clean and the branch is ahead of `origin/main` by the design, plan, copy, and optional statistics commits.
