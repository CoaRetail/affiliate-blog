import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Money Track ids allowed for these articles. yDTdyhyFEoI is in the table but
// out of stock, so these articles must not use it.
const ALLOWED_IDS = new Set([
  'L7IrW864-jY',
  'PadhsxDEeZQ',
  'MFppScuKzeM',
  'JgUCemnI7d4',
  'yaFOovyO8ac',
  'lr269oGXelI',
  'QlCa-I83UNc',
  '1mFYeWhr6ZA',
  'OITQJb-VRRc',
  'yDTdyhyFEoI',
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

const FILES = [
  'cat-flea-medicine-ranking.md',
  'cat-heartworm-prevention.md',
  'cat-ear-mite-medicine.md',
  'cat-worm-in-stool.md',
  'flea-tick-medicine-cost-compare.md',
  'heartworm-medicine-side-effects.md',
  'pet-parasite-prevention-guide.md',
  'pet-parasite-complete-guide.md',
]

const VET_CAUTION =
  '使用前に獣医師の診察・検査（例：フィラリア予防薬なら感染検査）を受け、処方・指示に従ってください。体重・年齢・持病によって使えない場合があります。'

const SHOP_TOP = 'CiN-gOTx1i8'

function readPost(file: string) {
  return readFileSync(new URL(`../../content/posts/pet/${file}`, import.meta.url), 'utf8')
}

test('parasite articles no longer send shop-top CTAs', () => {
  for (const file of FILES) {
    const body = readPost(file)
    assert.equal(body.includes(SHOP_TOP), false, file)
    assert.equal(body.includes('yDTdyhyFEoI'), false, file)
    assert.match(body, /商品ページを見る（わんにゃん薬局・PR）/)
    assert.equal(body.includes(VET_CAUTION), true, file)
    assert.equal(body.includes('gtag('), false, file)
    assert.equal(body.includes('affiliate_click'), false, file)
  }
})

test('every mttag id in the parasite articles is in the allowed table', () => {
  for (const file of FILES) {
    const body = readPost(file)
    const ids = [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
    assert.ok(ids.length > 0, file)
    for (const id of ids) {
      assert.equal(ALLOWED_IDS.has(id), true, `${file} uses ${id}`)
    }
    assert.equal(ids.includes(SHOP_TOP), false, file)
  }
})
