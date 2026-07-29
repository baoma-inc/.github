import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const workflow = readFileSync(new URL('../.github/workflows/org-stats.yml', import.meta.url), 'utf8')
const updater = readFileSync(new URL('./update-stats.mjs', import.meta.url), 'utf8')

test('workflow uses ORG_STATS_TOKEN for API reads and protected-branch pushes', () => {
  const checkoutStart = workflow.indexOf('- uses: actions/checkout@v4')
  const checkoutEnd = workflow.indexOf('\n\n      - ', checkoutStart)
  const checkoutStep = workflow.slice(checkoutStart, checkoutEnd)

  assert.notEqual(checkoutStart, -1)
  assert.match(checkoutStep, /token: \$\{\{ secrets\.ORG_STATS_TOKEN \}\}/)
  assert.match(workflow, /GH_TOKEN: \$\{\{ secrets\.ORG_STATS_TOKEN \}\}/)
  assert.doesNotMatch(workflow, /secrets\.GITHUB_TOKEN/)
})

test('updater fails when the token cannot see complete organization data', () => {
  assert.match(
    updater,
    /if \(!members\?\.length \|\| !repos \|\| repos\.length < 2\) \{\s+console\.(?:log|error)\('令牌看不到组织成员或私有仓库[^']*'\)\s+process\.exit\(1\)\s+\}/
  )
})
