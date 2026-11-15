import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const dogHealthPath = fileURLToPath(
  new URL('../../content/posts/pet/dog-health-management-complete-guide.md', import.meta.url),
)
const overseasPath = fileURLToPath(
  new URL('../../content/posts/pet/overseas-pet-medicine-safety.md', import.meta.url),
)

const dogHealth = readFileSync(dogHealthPath, 'utf8')
const overseas = readFileSync(overseasPath, 'utf8')

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

test('loop 2026-11-15 both articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [dogHealth, overseas]) {
    assert.match(body, /updated: "2026-11-15"/)
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

test('dog health guide is dog-only in carousels and shop links', () => {
  for (const id of DOG_ONLY_REMOVED) {
    assert.equal(dogHealth.includes(id), false, `dog article must not include cat id: ${id}`)
  }
  assert.match(dogHealth, /PadhsxDEeZQ/)
  assert.match(dogHealth, /L7IrW864-jY/)
  assert.match(dogHealth, /MFppScuKzeM/)
  assert.match(dogHealth, /1mFYeWhr6ZA/)
  assert.match(dogHealth, /犬用/)
  assert.match(dogHealth, /獣医/)
  assert.match(dogHealth, /人の薬は犬に使わない/)
})

test('overseas safety article keeps dog and cat labels without semintra', () => {
  assert.match(overseas, /PadhsxDEeZQ/)
  assert.match(overseas, /L7IrW864-jY/)
  assert.match(overseas, /MFppScuKzeM/)
  assert.match(overseas, /yaFOovyO8ac/)
  assert.match(overseas, /JgUCemnI7d4/)
  assert.match(overseas, /犬用/)
  assert.match(overseas, /猫用/)
  assert.match(overseas, /獣医/)
})