import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const mognyanPath = fileURLToPath(
  new URL('../../content/posts/pet/mognyan-catfood-erabikata.md', import.meta.url),
)
const grandsPath = fileURLToPath(
  new URL('../../content/posts/pet/grands-catfood-erabikata.md', import.meta.url),
)

const mognyan = readFileSync(mognyanPath, 'utf8')
const grands = readFileSync(grandsPath, 'utf8')

const BANNED =
  /獣医師監修|半額|最大\d+%|No\.1|1%未満|圧倒的|確実|完全|半額|最も効果的|約50%|最強|100%|徹底|ランキング形式|AIが選|AIがおすすめ|AIが分析|30〜40%|徹底解説|安全に購入|激安|格安|最新/

const MOGNYAN_A8 = '4BGAUY+B8UTOI+3J8+1TKWAA'
const GRANDS_A8_TEXT = '4BEMLO+55RB2A+4KA6+5YJRM'
const GRANDS_A8_BANNER = '4BEMLO+55RB2A+4KA6+60H7L'

function countSubstring(text: string, needle: string): number {
  let count = 0
  let pos = 0
  while (true) {
    const i = text.indexOf(needle, pos)
    if (i === -1) break
    count += 1
    pos = i + needle.length
  }
  return count
}

test('loop 2026-11-20 both catfood articles have purpose block, pr disclosure, and updated date', () => {
  for (const body of [mognyan, grands]) {
    assert.match(body, /updated: "2026-11-20"/)
    assert.match(body, /目的別の見方/)
    assert.match(body, /PR・広告を含む記事です/)
    assert.doesNotMatch(body, /\*\*/)
    assert.doesNotMatch(body, BANNED)
    assert.doesNotMatch(body, /GAAH|7YDKAQ/)
    assert.doesNotMatch(body, /mttag\.com/)
  }
})

test('mognyan article keeps A8 tracking unchanged', () => {
  assert.ok(countSubstring(mognyan, MOGNYAN_A8) >= 4, 'mognyan a8mat count')
})

test('grands article keeps A8 tracking unchanged', () => {
  assert.ok(countSubstring(grands, GRANDS_A8_TEXT) >= 6, 'grands text link a8mat count')
  assert.ok(countSubstring(grands, GRANDS_A8_BANNER) >= 2, 'grands banner a8mat count')
  assert.match(grands, /A8Banner html='/)
  assert.doesNotMatch(grands, /GRANDSの最新の原材料/)
})