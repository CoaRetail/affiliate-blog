import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const genuinePath = fileURLToPath(
  new URL('../../content/posts/pet/pet-medicine-genuine-selection.md', import.meta.url),
)
const parasitePath = fileURLToPath(
  new URL('../../content/posts/pet/pet-parasite-complete-guide.md', import.meta.url),
)

const genuine = readFileSync(genuinePath, 'utf8')
const parasite = readFileSync(parasitePath, 'utf8')

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

const REMOVED_IDS = ['lr269oGXelI']

const BANNED =
  /獣医師監修|半額|最大\d+%|No\.1|1%未満|圧倒的|確実|完全駆除|最も効果的|約50%|最強|100%|徹底|ランキング形式|AIが選|AIがおすすめ|AIが分析|30〜40%|徹底解説|安全に購入/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

test('loop 2026-11-12 both articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [genuine, parasite]) {
    assert.match(body, /updated: "2026-11-12"/)
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

test('genuine selection article keeps theme-aligned shop ids and dog/cat labels', () => {
  assert.match(genuine, /PadhsxDEeZQ/)
  assert.match(genuine, /L7IrW864-jY/)
  assert.match(genuine, /MFppScuKzeM/)
  assert.match(genuine, /yaFOovyO8ac/)
  assert.match(genuine, /JgUCemnI7d4/)
  assert.match(genuine, /1mFYeWhr6ZA/)
  assert.match(genuine, /犬用/)
  assert.match(genuine, /猫用/)
})

test('parasite guide keeps heartworm, flea, and intestinal worm shop ids', () => {
  assert.match(parasite, /PadhsxDEeZQ/)
  assert.match(parasite, /L7IrW864-jY/)
  assert.match(parasite, /MFppScuKzeM/)
  assert.match(parasite, /yaFOovyO8ac/)
  assert.match(parasite, /JgUCemnI7d4/)
  assert.match(parasite, /bFyar6T99jA/)
  assert.match(parasite, /1mFYeWhr6ZA/)
})
