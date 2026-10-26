import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
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

  const images = [
    [nell, '/products/nell-mattress-original.webp', 'NELL公式製品ページ'],
    [o2, '/products/o2charge-pet.png', 'オーツーチャージ公式レンタル案内'],
    [grands, '/products/grands-cat-chicken-salmon.webp', 'GRANDS公式LP'],
    [mogwan, '/products/mogwan-chicken-salmon.jpg', 'モグワン公式サイトの商品画像'],
  ] as const
  for (const [body, image, credit] of images) {
    assert.match(body, new RegExp(`image: "${image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
    assert.match(body, new RegExp(`src="${image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
    assert.match(body, /画像出典：/)
    assert.match(body, new RegExp(credit))
    assert.equal(existsSync(new URL(`../../public${image}`, import.meta.url)), true)
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
  const home = read('../app/page.tsx')
  assert.match(home, /featured\.slug === 'nell-mattress-erabikata'/)
  assert.match(home, /heroUsesDefault \? '\/fv-hero\.png'/)
  assert.match(home, /heroUsesDefault \? '\/fv-hero-mobile\.png'/)
  assert.match(home, /\{featured\.title\}/)
  assert.match(home, /getPickupImage\(post\)/)
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

test('the two LPs reuse the article A8 codes without moving the primary CTA', () => {
  const sleep = read('../../public/sleep-guide.html')
  const pet = read('../../public/pet-lp.html')
  const nellAt = sleep.indexOf('id="nell-mattress"')
  const sleepMain = sleep.indexOf('data-cta="sleep_mattress_main"')
  assert.ok(nellAt > 0 && sleepMain > nellAt)
  assert.match(sleep, /src="\/products\/nell-mattress-original\.webp"/)
  assert.match(sleep, /href="\/posts\/nell-mattress-erabikata"/)
  assert.match(sleep, /a8mat=4BEMLO\+58QH36\+4KD8\+5YJRM/)
  assert.match(sleep, /www17\.a8\.net\/0\.gif\?a8mat=4BEMLO\+58QH36\+4KD8\+5YJRM/)
  assert.match(sleep, /a8mat=4BEMLO\+58QH36\+4KD8\+61RI9/)
  assert.match(sleep, /www23\.a8\.net\/svt\/bgt\?aid=261022956317&wid=003&eno=01&mid=s00000021302001016000&mc=1/)
  assert.match(sleep, /width="468" height="60"/)
  assert.match(sleep, /data-cta="nell_mattress_lp"/)
  assert.match(sleep, /data-cta="sleep_mattress_sticky"/)

  const mainAt = pet.indexOf('data-cta="nexgard_spectra_main"')
  const careAt = pet.indexOf('id="food-care"')
  assert.ok(mainAt > 0 && careAt > mainAt)
  assert.match(pet, /href="https:\/\/mttag\.com\/s\/PadhsxDEeZQ" class="cta-btn affiliate-link" data-cta="nexgard_spectra_main"/)
  for (const piece of [
    '/products/o2charge-pet.png',
    '/products/grands-cat-chicken-salmon.webp',
    '/products/mogwan-chicken-salmon.jpg',
    '/posts/o2charge-pet-sansoshitsu-rental',
    '/posts/grands-catfood-erabikata',
    '/posts/mogwan-dogfood-erabikata',
    'a8mat=4BEMLO+56Y69U+59OW+BWVTE',
    'www19.a8.net/0.gif?a8mat=4BEMLO+56Y69U+59OW+BWVTE',
    'a8mat=4BEMLO+56Y69U+59OW+BXQOH',
    'www25.a8.net/svt/bgt?aid=261022956314&wid=003&eno=01&mid=s00000024584002005000&mc=1',
    'width="300" height="250"',
    'a8mat=4BEMLO+55RB2A+4KA6+5YJRM',
    'www18.a8.net/0.gif?a8mat=4BEMLO+55RB2A+4KA6+5YJRM',
    'a8mat=4BEMLO+55RB2A+4KA6+60H7L',
    'www21.a8.net/svt/bgt?aid=261022956312&wid=003&eno=01&mid=s00000021291001010000&mc=1',
    'a8mat=4BEMLO+3C9MIQ+3J8+1BP19U',
    'www15.a8.net/0.gif?a8mat=4BEMLO+3C9MIQ+3J8+1BP19U',
    'a8mat=4BEMLO+3C9MIQ+3J8+1BOTK1',
    'www28.a8.net/svt/bgt?aid=261022956202&wid=003&eno=01&mid=s00000000458008010000&mc=1',
    'data-cta="o2charge_lp"',
    'data-cta="grands_lp"',
    'data-cta="mogwan_lp"',
    'PR・広告',
  ]) {
    assert.ok(pet.includes(piece), piece)
  }
  const care = pet.split('id="food-care"')[1]?.split('id="faq"')[0] ?? ''
  assert.equal(care.includes('mttag.com'), false)
  for (const html of [sleep, pet]) {
    assert.match(html, /class="aio-yoten"/)
    assert.match(html, /SpeakableSpecification/)
    assert.match(html, /cssSelector":\["\.aio-yoten"\]/)
    assert.doesNotMatch(html, /AggregateRating|ratingValue|"@type":"Review"|"@type":"Offer"/)
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/g)]
    assert.ok(blocks.length >= 3)
    for (const block of blocks) JSON.parse(block[1])
  }
  assert.match(sleep, /"@type":"Product"/)
  assert.match(sleep, /NELLマットレスの選び方/)
  assert.match(pet, /予防薬とは別に確認するフードとケア/)
  assert.match(pet, /オーツーチャージ ペット用酸素室/)
  assert.match(read('../../public/llms.txt'), /sleep-guide\.html#nell-mattress/)
  assert.match(read('../../public/llms.txt'), /pet-lp\.html#food-care/)
  assert.match(read('../../public/llms-full.txt'), /posts\/nell-mattress-erabikata/)
  assert.match(read('../../public/llms-full.txt'), /pet-lp\.html#food-care/)
})
