import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const SLUG = 'mognyan-catfood-erabikata'
const body = readFileSync(
  new URL(`../../content/posts/pet/${SLUG}.md`, import.meta.url),
  'utf8',
)

const A8_HREF = 'https://px.a8.net/svt/ejp?a8mat=4BGAUY+B8UTOI+3J8+1TKWAA'
const A8_PIXEL = 'https://www16.a8.net/0.gif?a8mat=4BGAUY+B8UTOI+3J8+1TKWAA'

const FORBIDDEN_IDS = ['CiN-gOTx1i8', 'QlCa-I83UNc', '-dlwkEXJ_Jg']

const BANNED = /獣医師監修|CiN-gOTx1i8|QlCa-I83UNc|-dlwkEXJ_Jg|最強|確実に|効果が高く|人気No\.1|100%|mttag\.com/

test('mognyan catfood article exists with issued A8 links and compliance shell', () => {
  assert.equal(
    existsSync(new URL(`../../content/posts/pet/${SLUG}.md`, import.meta.url)),
    true,
  )
  assert.match(body, /updated: "2026-11-02"/)
  assert.match(body, /^faq:/m)
  assert.match(body, /PR・広告を含む記事です/)
  assert.match(body, /確認日：2026-11-02/)
  assert.match(body, /直接の答え/)
  assert.match(body, /短い答え：/)
  assert.match(body, /効果は保証/)
  assert.match(body, /\/pet-lp\.html/)
  assert.doesNotMatch(body, BANNED)
  assert.ok(body.length >= 1800, `body length ${body.length}`)

  assert.equal(body.split(A8_HREF).length - 1, 2)
  assert.equal(body.split(A8_PIXEL).length - 1, 2)
  assert.match(
    body,
    /<a href="https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=4BGAUY\+B8UTOI\+3J8\+1TKWAA" rel="nofollow sponsored">プレミアムキャットフード『モグニャン』<\/a>/,
  )
  assert.match(
    body,
    /<img border="0" width="1" height="1" src="https:\/\/www16\.a8\.net\/0\.gif\?a8mat=4BGAUY\+B8UTOI\+3J8\+1TKWAA" alt="" \/>/,
  )

  for (const bad of FORBIDDEN_IDS) {
    assert.equal(body.includes(bad), false, `includes ${bad}`)
  }

  const postLinks = body.match(/\/posts\/[a-z0-9-]+/g) ?? []
  assert.ok(postLinks.length >= 5, 'internal post links')

  assert.match(body, /\/posts\/grands-catfood-erabikata/)
  assert.match(body, /\/posts\/cat-no-appetite/)
})

test('mognyan article is listed for citation in llms-full', () => {
  const llmsFull = readFileSync(new URL('../../public/llms-full.txt', import.meta.url), 'utf8')
  assert.match(llmsFull, /mognyan-catfood-erabikata/)
})

test('grands article links to mognyan as another cat food option', () => {
  const grands = readFileSync(
    new URL('../../content/posts/pet/grands-catfood-erabikata.md', import.meta.url),
    'utf8',
  )
  assert.match(grands, /\/posts\/mognyan-catfood-erabikata/)
})

test('symptom articles link to mognyan catfood guide', () => {
  for (const slug of ['cat-no-appetite', 'cat-vomiting-yellow', 'cat-excessive-thirst'] as const) {
    const text = readFileSync(
      new URL(`../../content/posts/pet/${slug}.md`, import.meta.url),
      'utf8',
    )
    assert.match(text, /\/posts\/mognyan-catfood-erabikata/, slug)
  }
})
