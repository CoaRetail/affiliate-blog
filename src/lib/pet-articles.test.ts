import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const dog = readFileSync(new URL('../../content/posts/pet/dog-flea-tick-medicine-compare.md', import.meta.url), 'utf8')
const parasite = readFileSync(new URL('../../content/posts/pet/parasite-medicine-recommend-ranking.md', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8')

const BANNED = /効果が高く|人気No\.1|高評価を獲得|安全で信頼|100%|最強|確実に|\*\*/

test('revised pet articles lead with type differences and a vet consult', () => {
  for (const body of [dog, parasite]) {
    assert.match(body, /^faq:/m)
    assert.match(body, /獣医師の処方、投与前の検査/)
    assert.match(body, /直接の答え/)
    assert.match(body, /短い答え：/)
    assert.doesNotMatch(body, BANNED)
    assert.match(body, /PR・広告を含む記事です/)
  }
  assert.match(parasite, /updated: "2026-10-20"/)
  assert.match(dog, /updated: "2026-10-24"/)
  assert.match(dog, /スポット（滴下）、チュアブル（経口）、首輪/)
  assert.match(parasite, /フィラリア、回虫・鉤虫、条虫、ノミ・マダニ/)
})

test('dog flea choice guide stays within known links and states the heartworm check', () => {
  const guide = dog.split('迷ったときの見方')[1]?.split('product-carousel')[0] ?? ''
  assert.match(guide, /https:\/\/mttag\.com\/s\/PadhsxDEeZQ/)
  assert.match(guide, /https:\/\/mttag\.com\/s\/L7IrW864-jY/)
  assert.match(guide, /https:\/\/mttag\.com\/s\/1mFYeWhr6ZA/)
  assert.match(guide, /https:\/\/mttag\.com\/s\/MFppScuKzeM/)
  assert.match(guide, /https:\/\/mttag\.com\/s\/OITQJb-VRRc/)
  assert.match(guide, /target="_blank" rel="noopener noreferrer"/)
  assert.match(guide, /獣医師の処方と投与前の検査が必要です/)
  assert.match(guide, /使う前に獣医師へ相談してください/)
  assert.doesNotMatch(guide, /qMs9gxItGUg|YZNdYiBZb2U|OheDwBlk-9s/)
  assert.doesNotMatch(guide, BANNED)
  const textOnly = [...dog.matchAll(/<a href="https:\/\/mttag\.com\/s\/(OITQJb-VRRc|1mFYeWhr6ZA)"[^>]*class="product-card">[\s\S]*?<\/a>/g)]
  assert.equal(textOnly.length, 4)
  for (const card of textOnly) {
    assert.match(card[0], /<img src="data:image\/svg\+xml/)
    assert.doesNotMatch(card[0], /src="\/(?:nexgard|revolution|wannyan)/)
  }
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
