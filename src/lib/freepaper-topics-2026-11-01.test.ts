import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (slug: string) =>
  readFileSync(new URL(`../../content/posts/pet/${slug}.md`, import.meta.url), 'utf8')

const MOGWAN_REF = read('mogwan-dogfood-erabikata')
const GRANDS_REF = read('grands-catfood-erabikata')

const MOGWAN_TEXT_LINK = `<a href="https://px.a8.net/svt/ejp?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U" rel="nofollow sponsored">モグワンの原材料を確認する</a>
<img src="https://www15.a8.net/0.gif?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U" alt="" width="1" height="1" loading="eager" />`

const MOGWAN_TEXT_LINK_2 = `<a href="https://px.a8.net/svt/ejp?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U" rel="nofollow sponsored">モグワンのライン違いを確認する</a>
<img src="https://www15.a8.net/0.gif?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U" alt="" width="1" height="1" loading="eager" />`

const GRANDS_TEXT_LINK = `<a href="https://px.a8.net/svt/ejp?a8mat=4BEMLO+55RB2A+4KA6+5YJRM" rel="nofollow sponsored">GRANDSの原材料を確認する</a>
<img src="https://www18.a8.net/0.gif?a8mat=4BEMLO+55RB2A+4KA6+5YJRM" alt="" width="1" height="1" loading="eager" />`

const SLUGS = [
  'dog-flooring-slip-prevention',
  'senior-cat-appetite-hard-to-eat',
  'additive-free-domestic-dogfood-guide',
  'dog-treat-selection-overfeeding',
  'first-dog-run-preparation',
] as const

const BANNED =
  /獣医師監修|CiN-gOTx1i8|-dlwkEXJ_Jg|QlCa-I83UNc|効果が高く|人気No\.1|100%|最強|確実に|最安|\*\*/

const FORBIDDEN_IDS = ['CiN-gOTx1i8', '-dlwkEXJ_Jg', 'QlCa-I83UNc']

const NO_AFFILIATE: (typeof SLUGS)[number][] = [
  'dog-flooring-slip-prevention',
  'dog-treat-selection-overfeeding',
  'first-dog-run-preparation',
]

function ids(body: string) {
  return [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
}

function unique(values: string[]) {
  return [...new Set(values)].sort()
}

test('freepaper pet articles use AEO shell and compliance rules', () => {
  for (const slug of SLUGS) {
    const body = read(slug)
    assert.match(body, /updated: "2026-11-01"/)
    assert.match(body, /^faq:/m)
    assert.match(body, /確認日：2026-11-01/)
    assert.match(body, /直接の答え/)
    assert.match(body, /短い答え：/)
    assert.match(body, /効果は保証/)
    assert.doesNotMatch(body, BANNED)
    assert.ok(body.length >= 1800, `${slug} body length ${body.length}`)
    const postLinks = body.match(/\/posts\/[a-z0-9-]+/g) ?? []
    assert.ok(postLinks.length >= 3, slug)

    for (const bad of FORBIDDEN_IDS) {
      assert.equal(body.includes(bad), false, `${slug} includes ${bad}`)
    }

    assert.deepEqual(unique(ids(body)), [], `${slug} mttag ids`)

    if (NO_AFFILIATE.includes(slug)) {
      assert.doesNotMatch(body, /PR・広告を含む記事です/)
      assert.doesNotMatch(body, /px\.a8\.net/)
    } else {
      assert.match(body, /PR・広告を含む記事です/)
    }

    const vetAt = Math.min(
      ...['受診', '動物病院'].map((word) => body.indexOf(word)).filter((index) => index >= 0),
    )
    assert.ok(vetAt >= 0, `${slug} mentions vet care`)
  }
})

test('senior cat article uses unchanged GRANDS A8 markup once', () => {
  const body = read('senior-cat-appetite-hard-to-eat')
  assert.ok(GRANDS_REF.includes(GRANDS_TEXT_LINK.split('\n')[0]))
  assert.equal(body.includes(GRANDS_TEXT_LINK), true)
  assert.equal((body.match(/a8mat=4BEMLO\+55RB2A\+4KA6\+5YJRM/g) ?? []).length, 2)
  const vetAt = Math.min(
    ...['受診', '動物病院'].map((word) => body.indexOf(word)).filter((index) => index >= 0),
  )
  const productAt = body.indexOf('px.a8.net')
  assert.ok(productAt > vetAt)
})

test('additive-free dogfood article uses unchanged Mogwan A8 markup twice', () => {
  const body = read('additive-free-domestic-dogfood-guide')
  assert.ok(MOGWAN_REF.includes('a8mat=4BEMLO+3C9MIQ+3J8+1BP19U'))
  assert.equal(body.includes(MOGWAN_TEXT_LINK), true)
  assert.equal(body.includes(MOGWAN_TEXT_LINK_2), true)
  assert.equal((body.match(/a8mat=4BEMLO\+3C9MIQ\+3J8\+1BP19U/g) ?? []).length, 4)
  const vetAt = Math.min(
    ...['受診', '動物病院'].map((word) => body.indexOf(word)).filter((index) => index >= 0),
  )
  const productAt = body.indexOf('px.a8.net')
  assert.ok(productAt > vetAt)
})

test('dog run article links prevention cluster without new product ids', () => {
  const body = read('first-dog-run-preparation')
  assert.match(body, /\/posts\/dog-flea-tick-prevention-start-time/)
  assert.match(body, /\/posts\/nexgard-dog-guide/)
  assert.match(body, /\/posts\/dog-flea-tick-heartworm-combined/)
  assert.match(body, /\/pet-lp\.html/)
})

test('freepaper articles are listed for citation in llms-full', () => {
  const llmsFull = readFileSync(new URL('../../public/llms-full.txt', import.meta.url), 'utf8')
  for (const slug of SLUGS) {
    assert.match(llmsFull, new RegExp(slug))
  }
})
