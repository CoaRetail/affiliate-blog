import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const fleaStepsPath = fileURLToPath(
  new URL('../../content/posts/pet/cat-flea-removal-home-steps.md', import.meta.url),
)
const heartwormCostPath = fileURLToPath(
  new URL('../../content/posts/pet/dog-heartworm-test-cost.md', import.meta.url),
)

const fleaSteps = readFileSync(fleaStepsPath, 'utf8')
const heartwormCost = readFileSync(heartwormCostPath, 'utf8')

const ALLOWED_IDS = new Set(['yaFOovyO8ac', 'PadhsxDEeZQ', 'L7IrW864-jY', 'MFppScuKzeM'])

const FORBIDDEN_IDS = [
  'CiN-gOTx1i8',
  '-dlwkEXJ_Jg',
  'QlCa-I83UNc',
  'yDTdyhyFEoI',
  'GERGlgYfF50',
  'A-OpDysFxl4',
  'yYP6UrhNh8Q',
  '7YDKAQ',
]

const BANNED =
  /獣医師監修|最強|確実|100%|必ず|最安|最新|\*\*/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

function internalAnchorIds(body: string): string[] {
  return [...body.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
}

function assertAnchorsExist(body: string) {
  for (const id of internalAnchorIds(body)) {
    assert.ok(
      body.includes(`id="${id}"`),
      `anchor target missing: #${id}`,
    )
  }
}

function assertPurposeOrdering(body: string, label: string) {
  const vetAt = body.indexOf('受診')
  const purposeAt = body.indexOf('目的別の見方')
  const productAt = body.indexOf('mttag.com')
  assert.ok(vetAt >= 0, `${label}: 受診 missing`)
  assert.ok(purposeAt > vetAt, `${label}: purpose must follow 受診`)
  assert.ok(productAt > purposeAt, `${label}: purpose must precede first mttag link`)
}

test('loop 2026-11-22 both articles have purpose block, pr disclosure, confirm date', () => {
  for (const body of [fleaSteps, heartwormCost]) {
    assert.match(body, /updated: "2026-11-22"/)
    assert.match(body, /目的別の見方/)
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /確認日：2026-10-31/)
    assert.doesNotMatch(body, BANNED)
    for (const id of FORBIDDEN_IDS) {
      assert.equal(body.includes(id), false, `forbidden id: ${id}`)
    }
    for (const id of mttagIds(body)) {
      assert.equal(ALLOWED_IDS.has(id), true, `id not allowed: ${id}`)
    }
    assertAnchorsExist(body)
  }
})

test('cat flea removal purpose ordering and single allowed shop id', () => {
  assertPurposeOrdering(fleaSteps, 'cat-flea-removal-home-steps')
  assert.deepEqual([...new Set(mttagIds(fleaSteps))].sort(), ['yaFOovyO8ac'])
  assert.match(fleaSteps, /体重・月齢・対象を確認したうえで/)
})

test('dog heartworm test cost purpose ordering and nexgard filaria disclaimer', () => {
  assertPurposeOrdering(heartwormCost, 'dog-heartworm-test-cost')
  assert.deepEqual(
    [...new Set(mttagIds(heartwormCost))].sort(),
    ['L7IrW864-jY', 'MFppScuKzeM', 'PadhsxDEeZQ'],
  )
  assert.match(heartwormCost, /フィラリア予防を含む商品は、投与前のフィラリア検査/)
  assert.match(heartwormCost, /ネクスガード単体はフィラリア予防を含まない/)
  assert.match(heartwormCost, /体重・月齢・対象を確認したうえで/)
})