import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

const html = readFileSync(new URL('../../public/pet-lp.html', import.meta.url), 'utf8')

const ALLOWED_PIDS = [
  'PadhsxDEeZQ',
  'L7IrW864-jY',
  'W6Qz6DSsTEY',
  'bEXlYyzm0WQ',
  'OheDwBlk-9s',
]

test('pet LP has one H1 and the SEO/AEO tags', () => {
  assert.equal(html.match(/<h1[\s>]/g)?.length, 1)
  assert.match(html, /<title>犬・猫のノミ・マダニ・フィラリア予防薬の通販比較 \| QOL media<\/title>/)
  assert.match(html, /name="description" content="[^"]*犬・猫のノミ・マダニ・フィラリア予防薬/)
  assert.match(html, /rel="canonical" href="https:\/\/www\.qolmedia\.info\/pet-lp\.html"/)
  assert.match(html, /property="og:image" content="https:\/\/www\.qolmedia\.info\/og\/pet-og\.jpg"/)
  assert.match(html, /property="og:image:width" content="1200"/)
  assert.match(html, /name="twitter:card" content="summary_large_image"/)
  assert.match(html, /"dateModified":"2026-10-20"/)
  assert.match(html, /"@type":"FAQPage"/)
  assert.match(html, /"@type":"BreadcrumbList"/)
  assert.match(html, /"@type":"ItemList"/)
  assert.doesNotMatch(html, /AggregateRating|Review|ratingValue/)
  assert.equal(existsSync(new URL('../../public/og/pet-og.jpg', import.meta.url)), true)
  assert.equal(existsSync(new URL('../../public/pet-hero.jpg', import.meta.url)), true)
  assert.equal(existsSync(new URL('../../public/pet-hero.png', import.meta.url)), false)
})

test('outbound affiliate links are verified product pages only', () => {
  const found = [...html.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
  assert.ok(found.length >= ALLOWED_PIDS.length)
  for (const pid of found) assert.ok(ALLOWED_PIDS.includes(pid), pid)
  for (const pid of ALLOWED_PIDS) assert.ok(found.includes(pid), pid)
  assert.doesNotMatch(html, /CiN-gOTx1i8|ブロードライン|yDTdyhyFEoI|ジスロマック|QlCa-I83UNc|セミントラ|biodiversityexplorer|mttag\.com\/banner|\*\*/)
})

test('readers are routed by need and clicks are counted once', () => {
  assert.match(html, /\/posts\/dog-flea-tick-medicine-compare/)
  assert.match(html, /\/posts\/parasite-medicine-recommend-ranking/)
  assert.match(html, /\/posts\/wannyan-bestseller-ranking/)
  assert.match(html, /function trackAffiliateClick/)
  assert.match(html, /shouldDropGoogleCollect/)
  assert.match(html, /send_to: GA4/)
  assert.match(html, /cta_location: loc/)
  const handler = html.split("document.querySelectorAll('a.affiliate-link')")[1]?.split('article-cta-link')[0] ?? ''
  assert.equal(handler.match(/trackAffiliateClick\(/g)?.length, 1)
  assert.equal(handler.match(/gtag\(/g)?.length ?? 0, 0)
})

test('FAQ JSON-LD matches the visible answers', () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/g)].map((match) => JSON.parse(match[1]) as { '@type': string; mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> })
  const faq = blocks.find((block) => block['@type'] === 'FAQPage')
  assert.ok(faq?.mainEntity && faq.mainEntity.length >= 8)
  for (const question of faq.mainEntity) {
    assert.equal(html.split(question.acceptedAnswer.text).length > 2, true, question.name)
  }
})

test('comparison table uses on-site product facts without prices or reviews', () => {
  const table = html.split('id="compare"')[1]?.split('</table>')[0] ?? ''
  assert.match(table, /商品/)
  assert.match(table, /犬\/猫/)
  assert.match(table, /タイプ/)
  assert.match(table, /対象の寄生虫/)
  assert.match(table, /確認日/)
  assert.match(table, /ネクスガードスペクトラ/)
  assert.match(table, /2026-10-19/)
  assert.doesNotMatch(table, /mttag\.com|円|★|ratingValue|@type":"Product"|@type":"Review"/)
})

test('bestseller images declare alt, size, and lazy loading', () => {
  const images = [...html.matchAll(/<img [^>]*src="\/wannyan\/[^"]+"[^>]*>/g)].map((match) => match[0])
  assert.equal(images.length, 5)
  for (const image of images) {
    assert.match(image, /alt="[^"]+"/)
    assert.match(image, /width="\d+"/)
    assert.match(image, /height="\d+"/)
    assert.match(image, /loading="lazy"/)
  }
})

test('internal article links point at posts that exist', () => {
  const slugs = new Set([...html.matchAll(/\/posts\/([a-z0-9-]+)/g)].map((match) => match[1]))
  const files = new Set(readdirSync(new URL('../../content/posts/pet', import.meta.url)).map((file) => file.replace(/\.mdx?$/, '')))
  for (const slug of slugs) assert.ok(files.has(slug), slug)
})
