import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const dog = readFileSync(new URL('../../content/posts/pet/dog-flea-tick-medicine-compare.md', import.meta.url), 'utf8')
const parasite = readFileSync(new URL('../../content/posts/pet/parasite-medicine-recommend-ranking.md', import.meta.url), 'utf8')
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

const urine = readFileSync(new URL('../../content/posts/pet/cat-blood-in-urine.md', import.meta.url), 'utf8')
const diarrhea = readFileSync(new URL('../../content/posts/pet/cat-diarrhea-treatment.md', import.meta.url), 'utf8')

const SHOP_OR_OFF_TOPIC = /CiN-gOTx1i8|L7IrW864-jY|PadhsxDEeZQ|MFppScuKzeM|OITQJb-VRRc|OheDwBlk-9s|qMs9gxItGUg|_M_b7FdnuAY|YZNdYiBZb2U|bFyar6T99jA|QlCa-I83UNc|GERGlgYfF50|A-OpDysFxl4|獣医師監修|100%|最強|確実|効果が高く|安全で信頼|\*\*/

test('cat hematuria and diarrhea articles lead with a vet visit and drop shop-top links', () => {
  for (const body of [urine, diarrhea]) {
    assert.match(body, /updated: "2026-10-22"/)
    assert.match(body, /^faq:/m)
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /直接の答え/)
    assert.match(body, /短い答え：/)
    assert.match(body, /人の薬/)
    assert.match(body, /効果は保証できません/)
    assert.match(body, /\/pet-lp\.html/)
    assert.doesNotMatch(body, SHOP_OR_OFF_TOPIC)
  }
  assert.doesNotMatch(urine, /mttag\.com/)
  assert.match(urine, /時間をおかず/)
  assert.match(urine, /\/posts\/cat-excessive-thirst/)
  assert.match(diarrhea, /獣医師の処方/)
  assert.match(diarrhea, /投与前の検査/)
  assert.match(diarrhea, /品切れ/)
  assert.match(diarrhea, /\/posts\/cat-tapeworm-medicine/)
  const diarrheaIds = [...diarrhea.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
  assert.deepEqual([...new Set(diarrheaIds)].sort(), ['JcwocuM1lrE', 'JgUCemnI7d4', 'bEXlYyzm0WQ', 'yDTdyhyFEoI'].sort())
})
