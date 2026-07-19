#!/usr/bin/env node
// 自动刷新 profile/README.md 标记区块内的组织统计数据，并生成自托管 SVG 徽章。
// 徽章不用 shields.io（其对 GitHub camo 代理限流，页面上会随机裂图），
// 而是直接生成 SVG 存入 profile/assets/badges/，走 raw.githubusercontent.com 稳定渲染。
// 令牌权限不足以看到组织成员与私有仓库时跳过统计刷新，避免用残缺数据覆盖完整数据；
// 但徽章文件仍会按需生成（技术栈徽章为静态内容）。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TOKEN = process.env.GH_TOKEN
const ORG = process.env.ORG || 'baoma-inc'
const README = fileURLToPath(new URL('../profile/README.md', import.meta.url))
const BADGE_DIR = fileURLToPath(new URL('../profile/assets/badges', import.meta.url))
const RAW_BASE = `https://raw.githubusercontent.com/${ORG}/.github/main/profile/assets/badges`

// ---------- SVG 徽章生成 ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// 近似文本宽度：CJK 按全宽、ASCII 按半宽估算（加粗系统字体）
const textWidth = (s, fontSize) =>
  [...String(s)].reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e80 ? fontSize * 1.05 : fontSize * 0.62), 0)

function badgeSVG({ label, value, color, big = false }) {
  const fs = big ? 12 : 11
  const h = big ? 28 : 20
  const pad = big ? 12 : 8
  const lw = Math.round(textWidth(label, fs) + pad * 2)
  const vw = Math.round(textWidth(value, fs) + pad * 2)
  const w = lw + vw
  const ty = big ? 18.5 : 14
  const font = `-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei','Helvetica Neue',Arial,sans-serif`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" role="img" aria-label="${esc(label)}: ${esc(value)}">
<clipPath id="r"><rect width="${w}" height="${h}" rx="4"/></clipPath>
<g clip-path="url(#r)">
<rect width="${lw}" height="${h}" fill="#30363d"/>
<rect x="${lw}" width="${vw}" height="${h}" fill="${color}"/>
</g>
<g fill="#ffffff" text-anchor="middle" font-family="${font}" font-weight="600" font-size="${fs}">
<text x="${lw / 2}" y="${ty}">${esc(label)}</text>
<text x="${lw + vw / 2}" y="${ty}">${esc(value)}</text>
</g>
</svg>`
}

mkdirSync(BADGE_DIR, { recursive: true })
const writeBadge = (file, opts) => writeFileSync(`${BADGE_DIR}/${file}.svg`, badgeSVG(opts))

// 技术栈徽章（静态，幂等生成）
const TECH = [
  ['kotlin', 'Kotlin', '1.9+', '#7F52FF'],
  ['go', 'Go', '1.22+', '#00ADD8'],
  ['typescript', 'TypeScript', '5.0+', '#3178C6'],
  ['nextjs', 'Next.js', '15+', '#111111'],
  ['postgresql', 'PostgreSQL', '16+', '#4169E1'],
  ['redis', 'Redis', '7+', '#FF4438'],
  ['clickhouse', 'ClickHouse', 'LTS', '#F5B800'],
  ['docker', 'Docker', 'Ready', '#2496ED'],
  ['apisix', 'APISIX', 'Gateway', '#e8433e'],
  ['cloudflare', 'Cloudflare', 'Edge', '#F38020'],
]
for (const [file, label, value, color] of TECH) writeBadge(file, { label, value, color })

// ---------- 拉取组织数据 ----------
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
  console.log('令牌看不到组织成员或私有仓库，跳过统计刷新（README 保持现有数据，技术栈徽章已生成）')
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

// ---------- 统计徽章（动态生成 SVG） ----------
const STATS = [
  ['members', '团队成员', String(members.length), '#8A2BE2'],
  ['repos', '仓库', String(repos.length), '#0969DA'],
  ['languages', '编程语言', String(langBytes.size), '#F38020'],
  ['followers', '关注者', String(orgInfo?.followers ?? 0), '#EA4AAA'],
  ['since', '创立于', '2026', '#2EA043'],
]
for (const [file, label, value, color] of STATS) writeBadge(file, { label, value, color, big: true })
const badgesBlock = STATS.map(
  ([file, label, value]) => `<img src="${RAW_BASE}/${file}.svg" alt="${label} ${value}" height="28">`
).join('\n')

// ---------- 语言基因图谱 ----------
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

// ---------- 贡献者排行榜 ----------
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

// ---------- 成员头像墙 ----------
const memberCells = members
  .map(
    (m) =>
      `  <a href="https://github.com/${m.login}" title="${m.login}"><img src="https://github.com/${m.login}.png" width="72" alt="${m.login}"></a>`
  )
  .join('\n')
const membersBlock = `<p>\n${memberCells}\n</p>\n<b>${members.length}</b> 位工程师 · 一台闲置设备都不放过`

// ---------- 注入 README ----------
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

inject('STATS:BADGES', badgesBlock)
inject('LANGS', langsBlock)
inject('LEADERBOARD', leaderboardBlock)
inject('MEMBERS', membersBlock)
if (failed) process.exit(1)

writeFileSync(README, md)
console.log(`已刷新: 成员 ${members.length} | 仓库 ${repos.length} | 语言 ${langBytes.size} | 贡献者 ${board.length} (共 ${commitTotal} commits)`)
