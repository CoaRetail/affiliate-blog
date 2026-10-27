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

// Already in these articles and waiting on the user. Do not add them to files
// that did not have them. yYP6UrhNh8Q is not in these five articles.
const PREEXISTING_OUTSIDE: Record<string, readonly string[]> = {
  'heartworm-medicine-cheapest-ranking.md': ['-dlwkEXJ_Jg'],
  'dog-heartworm-medicine-recommend.md': ['-dlwkEXJ_Jg'],
  'flea-tick-medicine-danger.md': [],
  'dog-roundworm-treatment.md': [],
  'dog-ear-mite-treatment.md': ['-dlwkEXJ_Jg'],
}

const FILES = Object.keys(PREEXISTING_OUTSIDE)

const VET_CAUTION =
  '使用前に獣医師の診察・検査（例：フィラリア予防薬なら感染検査）を受け、処方・指示に従ってください。体重・年齢・持病によって使えない場合があります。'

const CTA = '商品ページを見る（わんにゃん薬局・PR）'
const SHOP_TOP = 'CiN-gOTx1i8'

function readPost(file: string) {
  return readFileSync(new URL(`../../content/posts/pet/${file}`, import.meta.url), 'utf8')
}

test('purchase-intent articles no longer send shop-top CTAs', () => {
  for (const file of FILES) {
    const body = readPost(file)
    assert.equal(body.includes(SHOP_TOP), false, file)
    assert.equal(body.includes('yDTdyhyFEoI'), false, file)
    assert.equal(body.includes('[['), false, file)
    assert.equal(body.includes('gtag('), false, file)
    assert.equal(body.includes('affiliate_click'), false, file)
    assert.equal(body.includes('onclick'), false, file)
    assert.equal(body.includes(VET_CAUTION), true, file)
    assert.doesNotMatch(body, /半額以下で|最安値で人気No\.1|最大1万円|正規品100%|約70%オフ|10,800円/)
    let from = 0
    let count = 0
    while (from < body.length) {
      const at = body.indexOf(CTA, from)
      if (at === -1) break
      count += 1
      const window = body.slice(Math.max(0, at - 700), at + CTA.length + 700)
      assert.equal(window.includes(VET_CAUTION), true, `${file} CTA at ${at}`)
      from = at + CTA.length
    }
    assert.ok(count > 0, file)
  }
})

test('mttag ids stay in the allowed table, plus the pre-existing unknown ids', () => {
  for (const file of FILES) {
    const body = readPost(file)
    const ids = [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
    const outside = new Set(PREEXISTING_OUTSIDE[file])
    assert.ok(ids.length > 0, file)
    for (const id of ids) {
      assert.equal(ALLOWED_IDS.has(id) || outside.has(id), true, `${file} uses ${id}`)
    }
    for (const id of outside) {
      assert.equal(body.includes(`mttag.com/s/${id}`), true, `${file} dropped ${id}`)
    }
    assert.equal(ids.includes(SHOP_TOP), false, file)
    assert.equal(ids.includes('yDTdyhyFEoI'), false, file)
    assert.equal(ids.includes('yYP6UrhNh8Q'), false, file)
  }
})
