import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const recurrencePath = fileURLToPath(
  new URL('../../content/posts/pet/cat-flea-recurrence.md', import.meta.url),
)
const humanBitePath = fileURLToPath(
  new URL('../../content/posts/pet/cat-flea-human-bite.md', import.meta.url),
)

const recurrence = readFileSync(recurrencePath, 'utf8')
const humanBite = readFileSync(humanBitePath, 'utf8')

const ALLOWED_IDS = new Set(['yaFOovyO8ac'])

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
  /獣医師監修|最強|確実|100%|最安|最新|\*\*/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

function internalAnchorIds(body: string): string[] {
  return [...body.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
}

function assertAnchorsExist(body: string) {
  for (const id of internalAnchorIds(body)) {
    assert.ok(body.includes(`id="${id}"`), `anchor target missing: #${id}`)
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

test('loop 2026-11-24 both articles have purpose block, pr disclosure, confirm date', () => {
  for (const body of [recurrence, humanBite]) {
    assert.match(body, /updated: "2026-11-24"/)
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

test('cat flea recurrence purpose ordering and shop link copy', () => {
  assertPurposeOrdering(recurrence, 'cat-flea-recurrence')
  assert.deepEqual([...new Set(mttagIds(recurrence))].sort(), ['yaFOovyO8ac'])
  assert.match(recurrence, /体重・月齢・対象を確認したうえで/)
  assert.match(recurrence, /id="cat-flea-recurrence-spot"/)
})

test('cat flea human bite purpose ordering and shop link copy', () => {
  assertPurposeOrdering(humanBite, 'cat-flea-human-bite')
  assert.deepEqual([...new Set(mttagIds(humanBite))].sort(), ['yaFOovyO8ac'])
  assert.match(humanBite, /体重・月齢・対象を確認したうえで/)
  assert.match(humanBite, /id="cat-flea-human-spot"/)
})