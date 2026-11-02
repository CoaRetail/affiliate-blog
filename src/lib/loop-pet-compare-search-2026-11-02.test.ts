import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const DOG = readFileSync(
  new URL('../../content/posts/pet/dog-flea-tick-medicine-compare.md', import.meta.url),
  'utf8',
)
const PARASITE = readFileSync(
  new URL('../../content/posts/pet/parasite-medicine-recommend-ranking.md', import.meta.url),
  'utf8',
)

const ALLOWED_IDS = new Set([
  'L7IrW864-jY',
  'PadhsxDEeZQ',
  'MFppScuKzeM',
  'JgUCemnI7d4',
  'yaFOovyO8ac',
  'lr269oGXelI',
  '1mFYeWhr6ZA',
  'OITQJb-VRRc',
  'bFyar6T99jA',
  'W6Qz6DSsTEY',
  'bEXlYyzm0WQ',
  'OheDwBlk-9s',
  'XuxaJbOu89I',
  'qMs9gxItGUg',
  'JcwocuM1lrE',
  '_M_b7FdnuAY',
  'YZNdYiBZb2U',
])

const FORBIDDEN_IDS = [
  'QlCa-I83UNc',
  'yDTdyhyFEoI',
  'CiN-gOTx1i8',
  'GERGlgYfF50',
  'A-OpDysFxl4',
  'yYP6UrhNh8Q',
  '-dlwkEXJ_Jg',
]

const BANNED = /最強|確実|100%|絶対|No\.1|人気No\.1|効果が高く|\*\*/

function purposeBlock(body: string): string {
  const start = body.indexOf('目的別の見方')
  assert.notEqual(start, -1, 'missing 目的別の見方')
  const end = body.indexOf('<div class="product-carousel">', start)
  return body.slice(start, end === -1 ? undefined : end)
}

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

for (const [label, body] of [
  ['dog-flea-tick-medicine-compare', DOG],
  ['parasite-medicine-recommend-ranking', PARASITE],
] as const) {
  test(`${label} loop 2026-11-02 disclosure and vet copy`, () => {
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /獣医師/)
    assert.match(body, /処方/)
    assert.match(body, /検査/)
    assert.match(body, /updated: "2026-11-02"/)
    assert.match(body, /目的別の見方/)
    assert.doesNotMatch(body, BANNED)
  })

  test(`${label} purpose block uses allowed shop ids only`, () => {
    const block = purposeBlock(body)
    assert.match(block, /効果の順位では並べません/)
    for (const id of FORBIDDEN_IDS) {
      assert.equal(block.includes(id), false, `forbidden id in purpose block: ${id}`)
    }
    for (const id of mttagIds(block)) {
      assert.equal(ALLOWED_IDS.has(id), true, `id not allowed: ${id}`)
    }
  })
}

test('dog article mttag ids stay within allowed set', () => {
  for (const id of mttagIds(DOG)) {
    assert.equal(ALLOWED_IDS.has(id), true, `dog id not allowed: ${id}`)
  }
})

test('parasite article legacy yDTdyhyFEoI unchanged outside purpose block', () => {
  const purposeIds = mttagIds(purposeBlock(PARASITE))
  assert.deepEqual([...new Set(purposeIds)].sort(), ['PadhsxDEeZQ', 'bEXlYyzm0WQ'].sort())
  const allIds = [...new Set(mttagIds(PARASITE))]
  assert.equal(allIds.includes('yDTdyhyFEoI'), true)
  for (const id of allIds) {
    const ok = ALLOWED_IDS.has(id) || id === 'yDTdyhyFEoI'
    assert.equal(ok, true, `parasite id not allowed: ${id}`)
  }
})
