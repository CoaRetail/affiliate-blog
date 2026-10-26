import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))

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
  const pictured = [...dog.matchAll(/<a href="https:\/\/mttag\.com\/s\/(OITQJb-VRRc|1mFYeWhr6ZA)"[^>]*class="product-card">[\s\S]*?<\/a>/g)]
  assert.equal(pictured.length, 4)
  for (const card of pictured) {
    const expected = card[1] === 'OITQJb-VRRc'
      ? '<img src="/products/simparica_1.webp" alt="シンパリカ" />'
      : '<img src="/products/frontlineplus_dog_1.webp" alt="フロントラインプラス（犬用）" />'
    assert.equal(card[0].includes(expected), true)
    assert.equal((card[0].match(/<img /g) || []).length, 1)
    assert.doesNotMatch(card[0], /data:image\/svg\+xml|dog-flea-blank|product-card-img|product-card-source/)
  }
  assert.equal(existsSync(join(root, 'public/products/simparica_1.webp')), true)
  assert.equal(existsSync(join(root, 'public/products/frontlineplus_dog_1.webp')), true)
})

function repoTextFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git' || name === '.next') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      repoTextFiles(full, acc)
      continue
    }
    if (name.endsWith('.test.ts')) continue
    if (/\.(md|mdx|ts|tsx|js|mjs|cjs|py|csv|txt|html|json|css)$/.test(name)) acc.push(full)
  }
  return acc
}

test('drontal is pid 91 drontal plus, and pid 7 is strongheart plus', () => {
  const sheet = readFileSync(join(root, 'product_link_sheet.csv'), 'utf8')
  const maker = readFileSync(join(root, 'make_product_link_sheet.py'), 'utf8')
  assert.match(sheet, /ストロングハートプラス,https:\/\/biodiversityexplorer\.org\/product\.php\?pid=7,,ストロングハートプラス/)
  assert.match(sheet, /ドロンタールプラス,https:\/\/biodiversityexplorer\.org\/product\.php\?pid=91,https:\/\/mttag\.com\/s\/bFyar6T99jA,ドロンタールプラス/)
  assert.match(maker, /\("ストロングハートプラス",\s+"https:\/\/biodiversityexplorer\.org\/product\.php\?pid=7"\)/)
  assert.match(maker, /\("ドロンタールプラス",\s+"https:\/\/biodiversityexplorer\.org\/product\.php\?pid=91"\)/)
  const bad: string[] = []
  for (const file of repoTextFiles(root)) {
    readFileSync(file, 'utf8').split('\n').forEach((line, index) => {
      if (/ドロンタール/.test(line) && /product\.php\?pid=7/.test(line)) {
        bad.push(`${file}:${index + 1}`)
      }
    })
  }
  assert.deepEqual(bad, [])
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
