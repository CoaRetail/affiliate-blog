import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (slug: string) =>
  readFileSync(new URL(`../../content/posts/pet/${slug}.md`, import.meta.url), 'utf8')

const SLUGS = [
  'cat-flea-removal-home-steps',
  'cat-flea-human-bite',
  'indoor-cat-flea-cause',
  'cat-flea-recurrence',
  'cat-flea-tick-combined-care',
  'dog-heartworm-test-cost',
  'dog-flea-tick-prevention-start-time',
  'nexgard-dog-guide',
  'dog-flea-tick-heartworm-combined',
  'dog-tick-walk-prevention',
] as const

const BANNED =
  /獣医師監修|CiN-gOTx1i8|-dlwkEXJ_Jg|QlCa-I83UNc|効果が高く|人気No\.1|100%|最強|確実に|最安|\*\*/

const FORBIDDEN_IDS = ['CiN-gOTx1i8', '-dlwkEXJ_Jg', 'QlCa-I83UNc']

const ALLOWED_IDS: Record<(typeof SLUGS)[number], string[]> = {
  'cat-flea-removal-home-steps': ['yaFOovyO8ac'],
  'cat-flea-human-bite': ['yaFOovyO8ac'],
  'indoor-cat-flea-cause': ['yaFOovyO8ac', 'bEXlYyzm0WQ'],
  'cat-flea-recurrence': ['yaFOovyO8ac', 'yDTdyhyFEoI'],
  'cat-flea-tick-combined-care': ['yaFOovyO8ac', 'bEXlYyzm0WQ', 'yDTdyhyFEoI'],
  'dog-heartworm-test-cost': ['PadhsxDEeZQ', 'L7IrW864-jY', 'MFppScuKzeM'],
  'dog-flea-tick-prevention-start-time': ['MFppScuKzeM', 'PadhsxDEeZQ'],
  'nexgard-dog-guide': ['MFppScuKzeM'],
  'dog-flea-tick-heartworm-combined': ['PadhsxDEeZQ', 'L7IrW864-jY', 'MFppScuKzeM'],
  'dog-tick-walk-prevention': ['MFppScuKzeM', 'PadhsxDEeZQ'],
}

function ids(body: string) {
  return [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
}

function unique(values: string[]) {
  return [...new Set(values)].sort()
}

test('trend pet articles use the AEO shell, allowed ids, and vet-first ordering', () => {
  for (const slug of SLUGS) {
    const body = read(slug)
    assert.match(body, /updated: "2026-10-31"/)
    assert.match(body, /^faq:/m)
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /確認日：2026-10-31/)
    assert.match(body, /直接の答え/)
    assert.match(body, /短い答え：/)
    assert.match(body, /効果は保証/)
    assert.match(body, /\/pet-lp\.html/)
    assert.doesNotMatch(body, BANNED)
    assert.ok(body.length >= 1800, `${slug} body length ${body.length}`)
    const postLinks = body.match(/\/posts\/[a-z0-9-]+/g) ?? []
    assert.ok(postLinks.length >= 3, slug)

    for (const bad of FORBIDDEN_IDS) {
      assert.equal(body.includes(bad), false, `${slug} includes ${bad}`)
    }

    const found = unique(ids(body))
    assert.deepEqual(found, ALLOWED_IDS[slug].sort(), slug)

    const vetAt = Math.min(
      ...['受診', '動物病院'].map((word) => body.indexOf(word)).filter((index) => index >= 0),
    )
    const productAt = body.indexOf('mttag.com')
    assert.ok(vetAt >= 0 && productAt > vetAt, `${slug} vet section before affiliate links`)

    const productSection = body.slice(productAt)
    assert.match(productSection, /獣医師|自己判断で始めない|相談/)
  }
})

test('trend articles are listed for citation in llms-full', () => {
  const llmsFull = readFileSync(new URL('../../public/llms-full.txt', import.meta.url), 'utf8')
  for (const slug of SLUGS) {
    assert.match(llmsFull, new RegExp(slug))
  }
})
