import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const mogwanPath = fileURLToPath(
  new URL('../../content/posts/pet/mogwan-dogfood-erabikata.md', import.meta.url),
)
const o2Path = fileURLToPath(
  new URL('../../content/posts/pet/o2charge-pet-sansoshitsu-rental.md', import.meta.url),
)

const mogwan = readFileSync(mogwanPath, 'utf8')
const o2 = readFileSync(o2Path, 'utf8')

const BANNED =
  /獣医師監修|半額|最大\d+%|No\.1|1%未満|圧倒的|確実|完全駆除|最も効果的|約50%|最強|100%|徹底|ランキング形式|AIが選|AIがおすすめ|AIが分析|30〜40%|徹底解説|安全に購入|最新|完全|激安|格安/

const FORBIDDEN_NEEDLES = ['GAAH', '7YDKAQ', 'mttag.com', '-dlwkEXJ_Jg'] as const

const A8_MIN = {
  mogwan: { '1BP19U': 6, '1BOTK1': 2 },
  o2: { BWVTE: 6, BXQOH: 2 },
} as const

function countMat(body: string, mat: string) {
  return (body.match(new RegExp(mat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
}

test('loop 2026-11-21 both articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [mogwan, o2]) {
    assert.match(body, /updated: "2026-11-21"/)
    assert.match(body, /目的別の見方/)
    assert.match(body, /PR・広告を含む記事です/)
    assert.doesNotMatch(body, /\*\*/)
    assert.doesNotMatch(body, BANNED)
    for (const needle of FORBIDDEN_NEEDLES) {
      assert.equal(body.includes(needle), false, `forbidden: ${needle}`)
    }
  }
})

test('mogwan dogfood keeps A8 affiliate codes and vet-first copy', () => {
  for (const [mat, min] of Object.entries(A8_MIN.mogwan)) {
    assert.ok(countMat(mogwan, mat) >= min, `${mat} expected >= ${min}, got ${countMat(mogwan, mat)}`)
  }
  assert.match(mogwan, /獣医/)
  assert.match(mogwan, /\/pet-lp\.html/)
  assert.match(mogwan, /総合栄養食/)
})

test('o2charge rental keeps A8 affiliate codes and is not medical treatment copy', () => {
  for (const [mat, min] of Object.entries(A8_MIN.o2)) {
    assert.ok(countMat(o2, mat) >= min, `${mat} expected >= ${min}, got ${countMat(o2, mat)}`)
  }
  assert.match(o2, /治療ではありません/)
  assert.match(o2, /医療機器ではない/)
  assert.match(o2, /獣医/)
  assert.match(o2, /\/pet-lp\.html/)
})