import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const fleaPath = fileURLToPath(
  new URL('../../content/posts/pet/flea-tick-medicine-cost-compare.md', import.meta.url),
)
const aiPath = fileURLToPath(
  new URL('../../content/posts/pet/ai-recommended-pet-medicine.md', import.meta.url),
)

const flea = readFileSync(fleaPath, 'utf8')
const ai = readFileSync(aiPath, 'utf8')

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

const REMOVED_IDS = ['JgUCemnI7d4', 'lr269oGXelI']

const BANNED =
  /獣医師監修|半額|最大\d+%|No\.1|1%未満|圧倒的|確実|完全駆除|最も効果的|約50%|最強|100%|徹底比較|ランキング形式|AIが選|AIがおすすめ|AIが分析/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

test('loop 2026-11-11 both articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [flea, ai]) {
    assert.match(body, /updated: "2026-11-11"/)
    assert.match(body, /目的別の見方/)
    assert.match(body, /PR・広告を含む記事です/)
    assert.doesNotMatch(body, /\*\*/)
    assert.doesNotMatch(body, BANNED)
    for (const id of FORBIDDEN_IDS) {
      assert.equal(body.includes(id), false, `forbidden id: ${id}`)
    }
    for (const id of mttagIds(body)) {
      assert.equal(ALLOWED_IDS.has(id), true, `id not allowed: ${id}`)
    }
    for (const id of REMOVED_IDS) {
      assert.equal(body.includes(id), false, `removed id still present: ${id}`)
    }
  }
})

test('flea cost article keeps flea and heartworm shop ids', () => {
  assert.match(flea, /PadhsxDEeZQ/)
  assert.match(flea, /L7IrW864-jY/)
  assert.match(flea, /MFppScuKzeM/)
  assert.match(flea, /bEXlYyzm0WQ/)
  assert.match(flea, /yaFOovyO8ac/)
  assert.match(flea, /OITQJb-VRRc/)
  assert.match(flea, /1mFYeWhr6ZA/)
  assert.match(flea, /犬用/)
  assert.match(flea, /猫用/)
})

test('ai medicine article keeps theme-aligned shop ids', () => {
  assert.match(ai, /PadhsxDEeZQ/)
  assert.match(ai, /L7IrW864-jY/)
  assert.match(ai, /MFppScuKzeM/)
  assert.match(ai, /bEXlYyzm0WQ/)
  assert.match(ai, /yaFOovyO8ac/)
  assert.match(ai, /1mFYeWhr6ZA/)
})
