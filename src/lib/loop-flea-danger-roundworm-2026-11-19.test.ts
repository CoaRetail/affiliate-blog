import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const fleaPath = fileURLToPath(
  new URL('../../content/posts/pet/flea-tick-medicine-danger.md', import.meta.url),
)
const roundwormPath = fileURLToPath(
  new URL('../../content/posts/pet/dog-roundworm-treatment.md', import.meta.url),
)

const flea = readFileSync(fleaPath, 'utf8')
const roundworm = readFileSync(roundwormPath, 'utf8')

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

const DOG_ONLY_REMOVED = ['JgUCemnI7d4', 'yaFOovyO8ac']

const BANNED =
  /獣医師監修|半額|最大\d+%|No\.1|1%未満|圧倒的|確実|完全駆除|最も効果的|約50%|最強|100%|徹底|ランキング形式|AIが選|AIがおすすめ|AIが分析|30〜40%|徹底解説|安全に購入/

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

test('loop 2026-11-19 both articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [flea, roundworm]) {
    assert.match(body, /updated: "2026-11-19"/)
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

test('flea danger article keeps flea and heartworm shop ids without semintra', () => {
  assert.match(flea, /PadhsxDEeZQ/)
  assert.match(flea, /L7IrW864-jY/)
  assert.match(flea, /MFppScuKzeM/)
  assert.match(flea, /yaFOovyO8ac/)
  assert.match(flea, /JgUCemnI7d4/)
  assert.match(flea, /1mFYeWhr6ZA/)
  assert.match(flea, /犬用/)
  assert.match(flea, /猫用/)
  assert.match(flea, /獣医/)
  assert.match(flea, /人の薬/)
})

test('dog roundworm article is dog-only in carousels and shop links', () => {
  for (const id of DOG_ONLY_REMOVED) {
    assert.equal(roundworm.includes(id), false, `dog article must not include cat id: ${id}`)
  }
  assert.match(roundworm, /PadhsxDEeZQ/)
  assert.match(roundworm, /L7IrW864-jY/)
  assert.match(roundworm, /MFppScuKzeM/)
  assert.match(roundworm, /bFyar6T99jA/)
  assert.match(roundworm, /犬用/)
  assert.match(roundworm, /獣医/)
  assert.match(roundworm, /人の薬/)
})