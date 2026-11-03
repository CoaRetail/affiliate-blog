import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const ROUNDWORM = readFileSync(
  new URL('../../content/posts/pet/dog-roundworm-treatment.md', import.meta.url),
  'utf8',
)
const COUGH = readFileSync(
  new URL('../../content/posts/pet/dog-cough-cause.md', import.meta.url),
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
]

const BANNED = /最強|確実|100%|絶対|No\.1|人気No\.1|効果が高く|\*\*/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

function purposeBlock(body: string): string {
  const start = body.indexOf('目的別の見方')
  assert.notEqual(start, -1, 'missing 目的別の見方')
  const end = body.indexOf('<div class="product-carousel">', start)
  return body.slice(start, end === -1 ? undefined : end)
}

for (const [label, body] of [
  ['dog-roundworm-treatment', ROUNDWORM],
  ['dog-cough-cause', COUGH],
] as const) {
  test(`${label} loop 2026-11-03 disclosure and vet copy`, () => {
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /獣医師/)
    assert.match(body, /処方/)
    assert.match(body, /検査/)
    assert.match(body, /updated: "2026-11-03"/)
    assert.doesNotMatch(body, BANNED)
  })
}

test('dog-roundworm-treatment purpose block and no zithromax id', () => {
  assert.equal(ROUNDWORM.includes('QlCa-I83UNc'), false)
  const block = purposeBlock(ROUNDWORM)
  assert.match(block, /効果の順位では並べません/)
  for (const id of FORBIDDEN_IDS) {
    assert.equal(block.includes(id), false, `forbidden id in purpose block: ${id}`)
  }
  for (const id of mttagIds(block)) {
    assert.equal(ALLOWED_IDS.has(id), true, `id not allowed: ${id}`)
  }
  for (const id of mttagIds(ROUNDWORM)) {
    assert.equal(ALLOWED_IDS.has(id), true, `roundworm id not allowed: ${id}`)
  }
})

test('dog-cough-cause keeps single legacy ivermectin link and adds nexgard spectra once', () => {
  assert.equal(COUGH.includes('-dlwkEXJ_Jg'), true)
  const dlwk = [...COUGH.matchAll(/mttag\.com\/s\/-dlwkEXJ_Jg/g)]
  assert.equal(dlwk.length, 1)
  for (const id of FORBIDDEN_IDS) {
    assert.equal(COUGH.includes(id), false, `forbidden id in cough: ${id}`)
  }
  const ids = [...new Set(mttagIds(COUGH))].sort()
  assert.deepEqual(ids, ['-dlwkEXJ_Jg', 'PadhsxDEeZQ'].sort())
  for (const id of ids) {
    const ok = ALLOWED_IDS.has(id) || id === '-dlwkEXJ_Jg'
    assert.equal(ok, true, `cough id not allowed: ${id}`)
  }
})
