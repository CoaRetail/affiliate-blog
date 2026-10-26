import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), 'utf8')

const article = read('../../content/posts/life/paytner-seikyuusho-sakibarai.md')
const lp = read('../../public/factoring-lp.html')
const life = read('../app/[category]/page.tsx')

const A8_HREF = 'https://px.a8.net/svt/ejp?a8mat=4BEMLO+5B47IA+4PF6+609HU'
const A8_PIXEL = 'https://www11.a8.net/0.gif?a8mat=4BEMLO+5B47IA+4PF6+609HU'
const A8_SNIPPET = `<a href="${A8_HREF}" rel="nofollow">フリーランスの請求書を先払い 【ペイトナー】</a><img border="0" width="1" height="1" src="${A8_PIXEL}" alt="">`

const FACTORING_MATS = [
  'a8mat=4B1G9M+5GH3YA+4EKW+TRVYQ',
  'a8mat=4B1G9M+5L8KSI+3V6A+5YJRM',
  'a8mat=3N82JP+4YM3SY+4HV8+5YJRM',
  'a8mat=3N83C4+6J6A9U+4OPW+5YRHE',
  'a8mat=3N81RK+6JRPVM+4S8A+5YJRM',
  'a8mat=3N81RK+6JRPVM+4S8A+5ZMCH',
  'a8mat=4B1G9M+5GH3YA+4EKW+TS3OI',
] as const

test('paytner article keeps the issued A8 tags and does not assert terms', () => {
  assert.equal(article.split(A8_SNIPPET).length - 1, 3)
  assert.equal(article.split(A8_HREF).length - 1, 3)
  assert.equal(article.split(A8_PIXEL).length - 1, 3)
  assert.equal(article.split('rel="nofollow"').length - 1, 3)
  assert.doesNotMatch(article, /rel="nofollow sponsored"/)
  assert.match(article, /PR・広告を含む記事です/)
  assert.match(article, /<aside class="aio-yoten">/)
  assert.match(article, /<strong>要点：<\/strong>/)
  assert.match(article, /直接の答え/)
  assert.match(article, /短い答え/)
  assert.match(article, /^faq:/m)
  assert.match(article, /確認日：2026-10-26/)
  assert.match(article, /専門家/)
  assert.match(article, /公式/)
  assert.match(article, /\/factoring-lp\.html/)
  assert.doesNotMatch(article, /必ず|安い|審査に通|即日|最短|通過率|円|%|mttag\.com|amzn\.to/)
  assert.doesNotMatch(article, /4BEMLO\+58QH36|4BEMLO\+56Y69U|4BEMLO\+55RB2A|4BEMLO\+3C9MIQ|4B1G9M\+5GH3YA/)

  const headings = [...article.matchAll(/^## .+$/gm)].map((match) => match[0])
  assert.ok(headings.length >= 4)
  assert.ok(headings.every((heading) => heading.includes('？')))
})

test('factoring hub and life category link to the paytner article without replacing other A8 tags', () => {
  assert.equal(lp.split('/posts/paytner-seikyuusho-sakibarai').length - 1, 2)
  assert.equal(lp.includes('4BEMLO+5B47IA+4PF6+609HU'), false)
  for (const mat of FACTORING_MATS) {
    assert.equal(lp.includes(mat), true)
  }
  assert.match(life, /\/posts\/paytner-seikyuusho-sakibarai/)
  assert.match(life, /\/factoring-lp\.html/)

  const llms = read('../../public/llms.txt')
  const llmsFull = read('../../public/llms-full.txt')
  assert.match(llms, /posts\/paytner-seikyuusho-sakibarai/)
  assert.match(llmsFull, /posts\/paytner-seikyuusho-sakibarai/)
  assert.match(llms, /入金されること、審査の結果、手数料の高低は断定しない/)

  const amazon = read('../../content/posts/sleep/makura-ranking-2026.md')
  assert.match(amazon, /https:\/\/amzn\.to\/4c9wbXX/)
  const nell = read('../../content/posts/sleep/nell-mattress-erabikata.md')
  assert.match(nell, /https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=4BEMLO\+58QH36\+4KD8\+5YJRM/)
})
