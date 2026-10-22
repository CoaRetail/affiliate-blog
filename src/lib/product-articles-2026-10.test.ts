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

  const banners = [
    [nell, '4BEMLO+58QH36+4KD8+61RI9', 'width="468" height="60"', 'https://www23.a8.net/svt/bgt?aid=261022956317&wid=003&eno=01&mid=s00000021302001016000&mc=1', 'https://www11.a8.net/0.gif?a8mat=4BEMLO+58QH36+4KD8+61RI9'],
    [o2, '4BEMLO+56Y69U+59OW+BXQOH', 'width="300" height="250"', 'https://www25.a8.net/svt/bgt?aid=261022956314&wid=003&eno=01&mid=s00000024584002005000&mc=1', 'https://www12.a8.net/0.gif?a8mat=4BEMLO+56Y69U+59OW+BXQOH'],
    [grands, '4BEMLO+55RB2A+4KA6+60H7L', 'width="300" height="250"', 'https://www21.a8.net/svt/bgt?aid=261022956312&wid=003&eno=01&mid=s00000021291001010000&mc=1', 'https://www11.a8.net/0.gif?a8mat=4BEMLO+55RB2A+4KA6+60H7L'],
    [mogwan, '4BEMLO+3C9MIQ+3J8+1BOTK1', 'width="300" height="250"', 'https://www28.a8.net/svt/bgt?aid=261022956202&wid=003&eno=01&mid=s00000000458008010000&mc=1', 'https://www16.a8.net/0.gif?a8mat=4BEMLO+3C9MIQ+3J8+1BOTK1'],
  ] as const
  for (const [body, mat, size, src, pixel] of banners) {
    assert.equal(body.split(mat).length - 1, 2)
    assert.equal(body.split(src).length - 1, 1)
    assert.equal(body.split(pixel).length - 1, 1)
    assert.match(body, new RegExp(`<img border="0" ${size} alt="" src="${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`))
  }

  for (const body of [nell, o2, grands, mogwan]) {
    assert.match(body, /<aside class="aio-yoten">/)
    assert.match(body, /<strong>要点：<\/strong>/)
    const headings = [...body.matchAll(/^## .+$/gm)].map((match) => match[0])
    assert.ok(headings.length >= 4)
    assert.ok(headings.every((heading) => heading.includes('？')))
  }

  const llms = read('../../public/llms.txt')
  const llmsFull = read('../../public/llms-full.txt')
  const sitemap = read('../app/sitemap.ts')
  for (const slug of [
    'nell-mattress-erabikata',
    'o2charge-pet-sansoshitsu-rental',
    'grands-catfood-erabikata',
    'mogwan-dogfood-erabikata',
  ]) {
    assert.match(llms, new RegExp(slug))
    assert.match(llmsFull, new RegExp(slug))
  }
  assert.match(sitemap, /ymd\(post\.updated \|\| post\.date\)/)
  assert.doesNotMatch(sitemap, /new Date\(/)
  assert.match(page, /'@type': 'Article'/)
  assert.match(page, /'@type': 'BreadcrumbList'/)
  assert.match(page, /'@type': 'FAQPage'/)
  assert.match(page, /articleSection: post\.category/)
  assert.match(page, /SpeakableSpecification/)
  assert.match(page, /canonical: `\/posts\/\$\{post\.slug\}`/)
  assert.match(page, /openGraph:/)
  assert.match(page, /twitter:/)
  assert.doesNotMatch(page, /AggregateRating|Review|ratingValue|priceCurrency|offers/)

  const related = [
    ['../../content/posts/sleep/makura-ranking-2026.md', '/posts/nell-mattress-erabikata'],
    ['../../public/sleep-guide.html', '/posts/nell-mattress-erabikata'],
    ['../../public/sleep-guide.html', '/posts/makura-ranking-2026'],
    ['../../public/pet-lp.html', '/posts/o2charge-pet-sansoshitsu-rental'],
    ['../../public/pet-lp.html', '/posts/grands-catfood-erabikata'],
    ['../../public/pet-lp.html', '/posts/mogwan-dogfood-erabikata'],
    ['../../content/posts/pet/dog-cough-cause.md', '/posts/o2charge-pet-sansoshitsu-rental'],
    ['../../content/posts/pet/cat-sneezing-cause.md', '/posts/o2charge-pet-sansoshitsu-rental'],
    ['../../content/posts/pet/dog-vomiting-cause.md', '/posts/mogwan-dogfood-erabikata'],
    ['../../content/posts/pet/dog-diarrhea-cause-treatment.md', '/posts/mogwan-dogfood-erabikata'],
    ['../../content/posts/pet/cat-no-appetite.md', '/posts/grands-catfood-erabikata'],
    ['../../content/posts/pet/cat-vomiting-yellow.md', '/posts/grands-catfood-erabikata'],
    ['../../content/posts/pet/cat-diarrhea-treatment.md', '/posts/grands-catfood-erabikata'],
    ['../../content/posts/pet/cat-excessive-thirst.md', '/posts/grands-catfood-erabikata'],
    ['../../content/posts/pet/cat-blood-in-urine.md', '/posts/grands-catfood-erabikata'],
  ] as const
  for (const [file, slug] of related) {
    assert.match(read(file), new RegExp(slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('pet articles with their own source line do not also get the medicine default', () => {
  assert.match(page, /各商品の販売ページの表示、および添付文書などの公開情報/)
  assert.match(page, /!post\.content\.includes\('確認日：'\)/)
})
