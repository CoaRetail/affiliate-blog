import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const dog = readFileSync(new URL('../../content/posts/pet/dog-flea-tick-medicine-compare.md', import.meta.url), 'utf8')
const parasite = readFileSync(new URL('../../content/posts/pet/parasite-medicine-recommend-ranking.md', import.meta.url), 'utf8')
const thirst = readFileSync(new URL('../../content/posts/pet/cat-excessive-thirst.md', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8')

const BANNED = /効果が高く|人気No\.1|高評価を獲得|安全で信頼|100%|最強|確実に|\*\*/

test('revised pet articles lead with type differences and a vet consult', () => {
  for (const body of [dog, parasite]) {
    assert.match(body, /updated: "2026-10-20"/)
    assert.match(body, /^faq:/m)
    assert.match(body, /獣医師の処方、投与前の検査/)
    assert.match(body, /直接の答え/)
    assert.match(body, /短い答え：/)
    assert.doesNotMatch(body, BANNED)
    assert.match(body, /PR・広告を含む記事です/)
  }
  assert.match(dog, /スポット（滴下）、チュアブル（経口）、首輪/)
  assert.match(parasite, /フィラリア、回虫・鉤虫、条虫、ノミ・マダニ/)
})

test('cat excessive thirst leads with a vet visit and semintra only after diagnosis', () => {
  assert.match(thirst, /updated: "2026-10-21"/)
  assert.match(thirst, /^faq:/m)
  assert.match(thirst, /飲水量はどう測りますか/)
  assert.match(thirst, /動物病院へ行く目安は何ですか/)
  assert.match(thirst, /獣医師の診断・処方と事前検査が前提/)
  assert.match(thirst, /自己判断で始めないでください/)
  assert.match(thirst, /直接の答え/)
  assert.match(thirst, /短い答え：/)
  assert.match(thirst, /PR・広告を含む記事です/)
  assert.match(thirst, /商品ページで詳細を見る/)
  assert.match(thirst, /\/pet-lp\.html\?/)
  assert.match(thirst, /\/posts\/cat-flea-medicine-ranking\?/)
  assert.match(thirst, /\/posts\/cat-heartworm-prevention\?/)
  assert.match(thirst, /\/posts\/cat-tapeworm-medicine\?/)
  assert.doesNotMatch(thirst, BANNED)
  assert.doesNotMatch(thirst, /獣医師監修|30〜50%|30〜40%|死因第1位|5,000|10,000/)
  const ids = [...thirst.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
  assert.deepEqual([...new Set(ids)], ['lr269oGXelI'])
})

test('existing affiliate urls stay and no new shop links are added', () => {
  const dogIds = [...dog.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
  const parasiteIds = [...parasite.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
  assert.deepEqual([...new Set(dogIds)].sort(), ['1mFYeWhr6ZA', 'L7IrW864-jY', 'MFppScuKzeM', 'OITQJb-VRRc', 'PadhsxDEeZQ'].sort())
  assert.deepEqual([...new Set(parasiteIds)].sort(), ['PadhsxDEeZQ', 'bEXlYyzm0WQ', 'bFyar6T99jA', 'yDTdyhyFEoI'].sort())
})

test('sitemap lastmod uses page dates, not the build clock', () => {
  assert.doesNotMatch(sitemap, /new Date\(/)
  assert.match(sitemap, /post\.updated \|\| post\.date/)
  assert.match(sitemap, /readHtmlDateModified/)
})
