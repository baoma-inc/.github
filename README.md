# baoma-inc/.github

**baoma-inc** 组织的 [GitHub Organization Profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile) 特殊仓库。

[profile/README.md](profile/README.md) 的内容公开展示在组织主页：[github.com/baoma-inc](https://github.com/baoma-inc)。

## 仓库结构

```text
.github/
├── README.md                      # 本文件（仓库说明）
├── profile/
│   ├── README.md                  # 组织主页（含自动刷新的统计区块）
│   └── bmw_logo.png               # 组织 Logo
├── scripts/
│   └── update-stats.mjs           # 组织统计数据刷新脚本（徽章/语言/排行榜/成员）
└── .github/workflows/
    ├── snake.yml                  # 🐍 每日生成贡献蛇 SVG → output 分支
    └── org-stats.yml              # 📊 每日刷新组织统计数据 → profile/README.md
```

## 自动化说明

| Workflow | 触发 | 产出 |
| :--- | :--- | :--- |
| `snake.yml` | 每天北京时间 0:00 / push main / 手动 | 生成 `github-snake.svg`（亮/暗双主题）推送到 `output` 分支 |
| `org-stats.yml` | 每天北京时间 0:20 / 手动 | 刷新 `profile/README.md` 中的成员数、语言统计、贡献者排行榜 |

> **注意**：默认 `GITHUB_TOKEN` 看不到组织成员与私有仓库，`org-stats.yml` 会自动跳过刷新（保留上次数据）。
> 如需全自动每日刷新，请在组织或本仓库 Secrets 中配置 `ORG_STATS_TOKEN`（具备 `read:org` + 私有仓库只读权限的 PAT）。

### 手动刷新统计

```bash
GH_TOKEN=$(gh auth token) ORG=baoma-inc node scripts/update-stats.mjs
```

## 更新组织主页

1. 克隆本仓库并修改 [profile/README.md](profile/README.md)（标记区块 `<!-- XXX:START/END -->` 内的内容由脚本维护，请勿手改）；
2. 提交并推送到 `main` 分支；
3. 在 [github.com/baoma-inc](https://github.com/baoma-inc) 验证效果。

## 安全

发现任何凭证泄露或安全问题，请立即联系安全负责人或在内部私有渠道反馈，切勿在公开 Issue 中张贴凭证。
