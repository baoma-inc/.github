#!/usr/bin/env node
// 自动刷新 profile/README.md 标记区块内的组织统计数据：
// 徽章(成员/仓库/语言/关注者)、语言基因图谱、贡献者排行榜、成员头像墙。
// 令牌权限不足以看到组织成员与私有仓库时直接跳过，避免用残缺数据覆盖完整数据。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TOKEN = process.env.GH_TOKEN
const ORG = process.env.ORG || 'baoma-inc'
const README = fileURLToPath(new URL('../profile/README.md', import.meta.url))

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
    },
  })
  if (!res.ok) {
    console.warn(`GET ${path} -> ${res.status}`)
    return null
  }
  return res.json()
}

const [orgInfo, members, repos] = await Promise.all([
  api(`/orgs/${ORG}`),
  api(`/orgs/${ORG}/members?per_page=100`),
  api(`/orgs/${ORG}/repos?per_page=100&type=all&sort=pushed`),
])

if (!members?.length || !repos || repos.length < 2) {
  console.log('令牌看不到组织成员或私有仓库，跳过刷新（README 保持现有数据）')
  process.exit(0)
}

const contributors = new Map()
const langBytes = new Map()
for (const repo of repos) {
  const [contribs, langs] = await Promise.all([
    api(`/repos/${ORG}/${repo.name}/contributors?per_page=100`),
    api(`/repos/${ORG}/${repo.name}/languages`),
  ])
  for (const c of contribs ?? []) {
    if (c.type === 'Bot' || c.login.endsWith('[bot]')) continue
    contributors.set(c.login, (contributors.get(c.login) ?? 0) + c.contributions)
  }
  for (const [lang, bytes] of Object.entries(langs ?? {})) {
    langBytes.set(lang, (langBytes.get(lang) ?? 0) + bytes)
  }
}

// ---------- 渲染 ----------
const badge = (label, msg, color, logo) =>
  `<img src="https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(String(msg))}-${color}?style=for-the-badge&logo=${logo}&logoColor=white" alt="${label} ${msg}">`

const badges = [
  badge('团队成员', members.length, '8A2BE2', 'github'),
  badge('仓库', repos.length, '0969DA', 'git'),
  badge('编程语言', langBytes.size, 'F38020', 'gitbook'),
  badge('关注者', orgInfo?.followers ?? 0, 'EA4AAA', 'githubsponsors'),
  badge('创立于', '2026', '2EA043', 'rocket'),
].join('\n')

const fmtBytes = (n) =>
  n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : n >= 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`

const langTotal = [...langBytes.values()].reduce((s, n) => s + n, 0)
const langRanking = [...langBytes.entries()].sort((a, b) => b[1] - a[1])
const topLangs = langRanking.slice(0, 8)
const otherBytes = langRanking.slice(8).reduce((s, [, n]) => s + n, 0)
// 用 ASCII 标签保证代码块内等宽对齐（CJK 字符宽度不一致）
if (otherBytes > 0) topLangs.push(['Other', otherBytes])
const nameWidth = Math.max(...topLangs.map(([l]) => l.length)) + 2
const langLines = topLangs.map(([lang, bytes]) => {
  const ratio = bytes / langTotal
  const filled = Math.max(1, Math.round(ratio * 28))
  const bar = '█'.repeat(filled) + '░'.repeat(28 - filled)
  const pct = `${(ratio * 100).toFixed(1)}%`.padStart(6)
  return `${lang.padEnd(nameWidth)}${bar} ${pct}  ${fmtBytes(bytes)}`
})
const langsBlock = '```text\n' + langLines.join('\n') + '\n```'

const board = [...contributors.entries()].sort((a, b) => b[1] - a[1])
const commitTotal = board.reduce((s, [, n]) => s + n, 0)
const maxCommits = board[0]?.[1] ?? 1
const medal = (i) => ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`
const leaderboardRows = board
  .map(([login, n], i) => {
    const filled = Math.max(1, Math.round((n / maxCommits) * 14))
    const bar = '█'.repeat(filled) + '░'.repeat(14 - filled)
    const pct = ((n / commitTotal) * 100).toFixed(1)
    return `  <tr align="center"><td><b>${medal(i)}</b></td><td><a href="https://github.com/${login}"><img src="https://github.com/${login}.png" width="42" alt="${login}"><br><b>${login}</b></a></td><td><b>${n}</b></td><td><code>${bar}</code></td><td>${pct}%</td></tr>`
  })
  .join('\n')
const leaderboardBlock = `<table>
  <tr align="center"><th>排名</th><th>贡献者</th><th>Commits</th><th>火力值</th><th>占比</th></tr>
${leaderboardRows}
</table>`

const memberCells = members
  .map(
    (m) =>
      `  <a href="https://github.com/${m.login}" title="${m.login}"><img src="https://github.com/${m.login}.png" width="72" alt="${m.login}"></a>`
  )
  .join('\n')
const membersBlock = `<p>\n${memberCells}\n</p>\n<b>${members.length}</b> 位工程师 · 一台闲置设备都不放过`

// ---------- 注入 ----------
let md = readFileSync(README, 'utf8')
let failed = false
const inject = (name, content) => {
  const start = `<!-- ${name}:START -->`
  const end = `<!-- ${name}:END -->`
  const re = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  if (!re.test(md)) {
    console.error(`README 缺少标记 ${name}`)
    failed = true
    return
  }
  md = md.replace(re, `${start}\n${content}\n${end}`)
}

inject('STATS:BADGES', badges)
inject('LANGS', langsBlock)
inject('LEADERBOARD', leaderboardBlock)
inject('MEMBERS', membersBlock)
if (failed) process.exit(1)

writeFileSync(README, md)
console.log(`已刷新: 成员 ${members.length} | 仓库 ${repos.length} | 语言 ${langBytes.size} | 贡献者 ${board.length} (共 ${commitTotal} commits)`)
