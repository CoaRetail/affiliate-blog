import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), 'utf8')

const nell = read('../../content/posts/sleep/nell-mattress-erabikata.md')
const o2 = read('../../content/posts/pet/o2charge-pet-sansoshitsu-rental.md')
const grands = read('../../content/posts/pet/grands-catfood-erabikata.md')
const mogwan = read('../../content/posts/pet/mogwan-dogfood-erabikata.md')
const page = read('../app/posts/[slug]/page.tsx')

const BANNED =
  /獣医師監修|mttag\.com|amzn\.to|t\.afi-b\.com|効果が高く|人気No\.1|100%|最強|確実に|[0-9,]+\s*円|AFFILIATE_LINK_|loading="lazy"/

const LINKS = [
  [
    nell,
    'https://px.a8.net/svt/ejp?a8mat=4BEMLO+58QH36+4KD8+5YJRM',
    'https://www17.a8.net/0.gif?a8mat=4BEMLO+58QH36+4KD8+5YJRM',
  ],
  [
    o2,
    'https://px.a8.net/svt/ejp?a8mat=4BEMLO+56Y69U+59OW+BWVTE',
    'https://www19.a8.net/0.gif?a8mat=4BEMLO+56Y69U+59OW+BWVTE',
  ],
  [
    grands,
    'https://px.a8.net/svt/ejp?a8mat=4BEMLO+55RB2A+4KA6+5YJRM',
    'https://www18.a8.net/0.gif?a8mat=4BEMLO+55RB2A+4KA6+5YJRM',
  ],
  [
    mogwan,
    'https://px.a8.net/svt/ejp?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U',
    'https://www15.a8.net/0.gif?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U',
  ],
] as const

test('four product articles keep the AEO shell and issued A8 links', () => {
  for (const [body, href, pixel] of LINKS) {
    assert.match(body, /date: "2026-10-22"/)
    assert.match(body, /updated: "2026-10-22"/)
    assert.match(body, /^faq:/m)
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /確認日：2026-10-22/)
    assert.match(body, /出典：/)
    assert.match(body, /直接の答え/)
    assert.match(body, /短い答え/)
    assert.equal(body.split(href).length - 1, 3)
    assert.equal(body.split(pixel).length - 1, 3)
    assert.match(body, new RegExp(`<img src="${pixel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" alt="" width="1" height="1"`))
    assert.doesNotMatch(body, BANNED)
  }

  assert.match(nell, /\/posts\/makura-ranking-2026/)
  assert.match(nell, /\/sleep-guide\.html/)
  assert.match(o2, /\/pet-lp\.html/)
  assert.match(o2, /治療ではありません/)
  assert.match(o2, /獣医師/)
  assert.match(grands, /\/pet-lp\.html/)
  assert.match(grands, /\/posts\/cat-no-appetite/)
  assert.match(grands, /\/posts\/cat-vomiting-yellow/)
  assert.match(grands, /\/posts\/cat-diarrhea-treatment/)
  assert.match(grands, /\/posts\/cat-excessive-thirst/)
  assert.match(mogwan, /\/pet-lp\.html/)
  assert.doesNotMatch(nell, /#AFFILIATE_LINK_(O2CHARGE|GRANDS|MOGWAN)/)
  assert.doesNotMatch(o2, /#AFFILIATE_LINK_(NELL|GRANDS|MOGWAN)/)
  assert.doesNotMatch(grands, /#AFFILIATE_LINK_(NELL|O2CHARGE|MOGWAN)/)
  assert.doesNotMatch(mogwan, /#AFFILIATE_LINK_(NELL|O2CHARGE|GRANDS)/)
})

test('pet articles with their own source line do not also get the medicine default', () => {
  assert.match(page, /各商品の販売ページの表示、および添付文書などの公開情報/)
  assert.match(page, /!post\.content\.includes\('確認日：'\)/)
})
