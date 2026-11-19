import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const parasitePreventionPath = fileURLToPath(
  new URL('../../content/posts/pet/pet-parasite-prevention-guide.md', import.meta.url),
)
const overdosePath = fileURLToPath(
  new URL('../../content/posts/pet/pet-medicine-overdose-risk.md', import.meta.url),
)

const parasitePrevention = readFileSync(parasitePreventionPath, 'utf8')
const overdose = readFileSync(overdosePath, 'utf8')

const ALLOWED_IDS = new Set([
  'L7IrW864-jY',
  'PadhsxDEeZQ',
  'MFppScuKzeM',
  'JgUCemnI7d4',
  'yaFOovyO8ac',
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

const REMOVED_IDS = ['lr269oGXelI']

const BANNED =
  /獣医師監修|半額|最大\d+%|No\.1|1%未満|圧倒的|確実|完全駆除|最も効果的|約50%|最強|100%|徹底|ランキング形式|AIが選|AIがおすすめ|AIが分析|30〜40%|徹底解説|安全に購入/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

test('loop 2026-11-14 both articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [parasitePrevention, overdose]) {
    assert.match(body, /updated: "2026-11-14"/)
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

test('parasite prevention guide keeps theme-aligned shop ids and dog/cat labels', () => {
  assert.match(parasitePrevention, /PadhsxDEeZQ/)
  assert.match(parasitePrevention, /L7IrW864-jY/)
  assert.match(parasitePrevention, /MFppScuKzeM/)
  assert.match(parasitePrevention, /yaFOovyO8ac/)
  assert.match(parasitePrevention, /JgUCemnI7d4/)
  assert.match(parasitePrevention, /bFyar6T99jA/)
  assert.match(parasitePrevention, /1mFYeWhr6ZA/)
  assert.match(parasitePrevention, /犬用/)
  assert.match(parasitePrevention, /猫用/)
})

test('overdose risk article keeps prevention shop ids and vet-first copy', () => {
  assert.match(overdose, /PadhsxDEeZQ/)
  assert.match(overdose, /L7IrW864-jY/)
  assert.match(overdose, /MFppScuKzeM/)
  assert.match(overdose, /yaFOovyO8ac/)
  assert.match(overdose, /JgUCemnI7d4/)
  assert.match(overdose, /1mFYeWhr6ZA/)
  assert.match(overdose, /犬用/)
  assert.match(overdose, /猫用/)
  assert.match(overdose, /獣医/)
})