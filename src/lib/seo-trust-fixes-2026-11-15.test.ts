import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(`../../${rel}`, import.meta.url)), 'utf8')

const SLEEP = [
  'content/posts/sleep/nemurenaiy-genin-taisho.md',
  'content/posts/sleep/netsuki-warui-theanine.md',
  'content/posts/sleep/neru-mae-routine-aroma.md',
  'content/posts/sleep/josei-suimin-supplement.md',
  'content/posts/sleep/alaplas-fukainemuri-kuchikomi.md',
  'public/sleep-guide.html',
]

test('sleep pages no longer claim a supervisor the site does not have', () => {
  for (const rel of SLEEP) {
    const body = read(rel)
    assert.doesNotMatch(body, /医師監修|専門家監修|獣医師監修/, rel)
  }
})

test('alaplas review drops definitive efficacy wording and bold markers', () => {
  const body = read('content/posts/sleep/alaplas-fukainemuri-kuchikomi.md')
  for (const phrase of ['科学的に認められた', '医学的にも睡眠の質を高める効果が確認', '確実に向上', '科学的に効果が認められた', '徹底解説']) {
    assert.ok(!body.includes(phrase), phrase)
  }
  assert.ok(!body.includes('**'))
  assert.ok(body.includes('個人差'))
  assert.ok(body.includes('https://px.a8.net/svt/ejp?a8mat=4AZS0R+691WZM+43JO+NTJWY'))
})

test('about and privacy are indexable with self canonical', () => {
  for (const [rel, path] of [['src/app/about/page.tsx', '/about'], ['src/app/privacy/page.tsx', '/privacy']]) {
    const src = read(rel)
    assert.ok(src.includes('index: true, follow: true'), rel)
    assert.ok(!src.includes('index: false'), rel)
    assert.ok(src.includes(`canonical: \`\${SITE_URL}${path}\``), rel)
    assert.doesNotMatch(src, /title: '[^']*\| QOL media',\n  description/, rel)
  }
})

test('contact has its own title and canonical', () => {
  const src = read('src/app/contact/layout.tsx')
  assert.ok(src.includes("title: 'お問い合わせ'"))
  assert.ok(src.includes('canonical: `${SITE_URL}/contact`'))
})

test('header and footer use the light logo with fixed size', () => {
  const src = read('src/app/layout.tsx')
  assert.equal((src.match(/src="\/QOL_logo\.webp"/g) || []).length, 2)
  assert.ok(!src.includes('<img src="/QOL_logo_transparent.png"'))
})

test('top page keeps the default FV image', () => {
  const src = read('src/app/page.tsx')
  assert.ok(src.includes("'/fv-hero.png'"))
  assert.ok(src.includes("'/fv-hero-mobile.png'"))
})
