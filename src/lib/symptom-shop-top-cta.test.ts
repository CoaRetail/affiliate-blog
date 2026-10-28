import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Money Track ids allowed anywhere in the repo's product table. Symptom
// articles should not gain new ones. yDTdyhyFEoI is in the table but out of
// stock, so these articles must not use it.
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

// Already in dog-cough-cause and left untouched. Do not add it to other files.
const PREEXISTING_OUTSIDE: Record<string, readonly string[]> = {
  'cat-disease-treatment-guide.md': [],
  'cat-eye-discharge.md': [],
  'cat-hair-loss.md': [],
  'cat-no-appetite.md': [],
  'cat-skin-inflammation.md': [],
  'cat-sneezing-cause.md': [],
  'cat-vomiting-yellow.md': [],
  'dog-bloating-cause.md': [],
  'dog-body-odor.md': [],
  'dog-cough-cause.md': ['-dlwkEXJ_Jg'],
  'dog-dandruff-cause.md': [],
  'dog-diarrhea-cause-treatment.md': [],
  'dog-frequent-urination.md': [],
  'dog-itching-cause.md': [],
  'dog-lethargy-cause.md': [],
  'dog-shaking-cause.md': [],
  'dog-vomiting-cause.md': [],
}

const FILES = Object.keys(PREEXISTING_OUTSIDE)

const SHOP_TOP = 'CiN-gOTx1i8'
const IVERMECTIN_LINE =
  '| [イベルメクチン](https://mttag.com/s/-dlwkEXJ_Jg)製剤 | フィラリア幼虫を駆除 | 経口投与（月1回） |'

const PARASITE_CONTEXT: Record<string, readonly string[]> = {
  'dog-diarrhea-cause-treatment.md': [
    '/posts/dog-roundworm-treatment',
    '/posts/parasite-medicine-recommend-ranking',
  ],
  'dog-bloating-cause.md': ['/posts/dog-roundworm-treatment'],
  'dog-vomiting-cause.md': ['/posts/dog-roundworm-treatment'],
  'cat-vomiting-yellow.md': ['/posts/cat-worm-in-stool'],
  'dog-cough-cause.md': ['/posts/dog-heartworm-medicine-recommend'],
  'dog-itching-cause.md': ['/posts/dog-flea-tick-medicine-compare'],
  'dog-dandruff-cause.md': ['/posts/dog-flea-tick-medicine-compare'],
  'cat-hair-loss.md': ['/posts/cat-flea-medicine-ranking'],
  'cat-skin-inflammation.md': ['/posts/cat-flea-medicine-ranking'],
  'dog-lethargy-cause.md': ['/posts/dog-heartworm-medicine-recommend'],
  'cat-no-appetite.md': ['/posts/cat-worm-in-stool'],
  'cat-disease-treatment-guide.md': [
    '/posts/cat-flea-medicine-ranking',
    '/posts/parasite-medicine-recommend-ranking',
  ],
}

const NO_PARASITE_PUSH = [
  'dog-body-odor.md',
  'cat-eye-discharge.md',
  'cat-sneezing-cause.md',
  'dog-shaking-cause.md',
  'dog-frequent-urination.md',
]

const PARASITE_SLUGS = [
  'dog-flea-tick-medicine-compare',
  'parasite-medicine-recommend-ranking',
  'dog-roundworm-treatment',
  'cat-flea-medicine-ranking',
  'wannyan-bestseller-ranking',
  'dog-heartworm-medicine-recommend',
  'cat-tapeworm-medicine',
  'cat-worm-in-stool',
  'heartworm-medicine-cheapest-ranking',
]

function readPost(file: string) {
  return readFileSync(new URL(`../../content/posts/pet/${file}`, import.meta.url), 'utf8')
}

test('symptom articles no longer send shop-top CTAs', () => {
  for (const file of FILES) {
    const body = readPost(file)
    assert.equal(body.includes(SHOP_TOP), false, file)
    assert.equal(body.includes('yDTdyhyFEoI'), false, file)
    assert.equal(body.includes('yYP6UrhNh8Q'), false, file)
    assert.equal(body.includes('GERGlgYfF50'), false, file)
    assert.equal(body.includes('A-OpDysFxl4'), false, file)
    assert.equal(body.includes('[['), false, file)
    assert.equal(body.includes('gtag('), false, file)
    assert.equal(body.includes('affiliate_click'), false, file)
    assert.equal(body.includes('onclick'), false, file)
    assert.equal(body.includes('**'), false, file)
    assert.equal(body.includes('まずは動物病院で受診・相談してください'), true, file)
    assert.equal(body.includes('PR・広告を含む記事です'), true, file)
    assert.equal(body.includes('効果は保証できません'), true, file)
    assert.equal(body.includes('人の薬は使わないでください'), true, file)
    assert.match(body, /\/pet-lp\.html/)
    assert.doesNotMatch(body, /100%|最強|確実|最安|半額|節約|獣医師監修|円|product-carousel/)
  }
  const cough = readPost('dog-cough-cause.md')
  assert.equal(cough.split(IVERMECTIN_LINE).length - 1, 1)
})

test('mttag ids stay in the allowed table, plus the pre-existing ivermectin id', () => {
  for (const file of FILES) {
    const body = readPost(file)
    const ids = [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
    const outside = PREEXISTING_OUTSIDE[file]
    assert.deepEqual(ids, [...outside], file)
    for (const id of ids) {
      assert.equal(ALLOWED_IDS.has(id) || outside.includes(id), true, `${file} uses ${id}`)
    }
    assert.equal(ids.includes(SHOP_TOP), false, file)
    assert.equal(ids.includes('yDTdyhyFEoI'), false, file)
    assert.equal(ids.includes('yYP6UrhNh8Q'), false, file)
  }
})

test('parasite internal links stay in context, and unrelated symptoms do not push them', () => {
  for (const [file, paths] of Object.entries(PARASITE_CONTEXT)) {
    const body = readPost(file)
    for (const path of paths) {
      assert.equal(body.includes(path), true, `${file} missing ${path}`)
    }
  }
  for (const file of NO_PARASITE_PUSH) {
    const body = readPost(file)
    for (const slug of PARASITE_SLUGS) {
      assert.equal(body.includes(slug), false, `${file} links ${slug}`)
    }
    assert.equal(body.includes('mttag.com'), false, file)
  }
})
