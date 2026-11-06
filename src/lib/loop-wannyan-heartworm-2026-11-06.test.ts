import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const rankingPath = fileURLToPath(
  new URL('../../content/posts/pet/wannyan-bestseller-ranking.md', import.meta.url),
)
const heartwormPath = fileURLToPath(
  new URL('../../content/posts/pet/dog-heartworm-medicine-recommend.md', import.meta.url),
)

const ranking = readFileSync(rankingPath, 'utf8')
const heartworm = readFileSync(heartwormPath, 'utf8')

/** Legacy ivermectin link count on dog-heartworm before this loop (do not add or remove). */
const HEARTWORM_IVERMECTIN_LINKS = 1

test('wannyan bestseller ranking has purpose table and updated date', () => {
  assert.match(ranking, /updated: "2026-11-06"/)
  assert.match(ranking, /目的別の見方/)
  assert.match(ranking, /効果の順位では並べません/)
  assert.match(ranking, /href="#rank-1"/)
  assert.match(ranking, /犬猫のノミダニ・フィラリア薬｜売れ筋TOP10の見方/)
  assert.doesNotMatch(ranking, /\*\*/)
})

test('dog heartworm article strips bold markdown and dog-only carousels', () => {
  assert.match(heartworm, /updated: "2026-11-06"/)
  assert.match(heartworm, /目的別の見方/)
  assert.doesNotMatch(heartworm, /\*\*/)
  assert.match(heartworm, /PadhsxDEeZQ/)
  assert.match(heartworm, /L7IrW864-jY/)
  assert.equal(heartworm.includes('JgUCemnI7d4'), false)
  assert.equal(heartworm.includes('yaFOovyO8ac'), false)
  assert.equal(heartworm.includes('lr269oGXelI'), false)
  const ivermectinCount = (heartworm.match(/-dlwkEXJ_Jg/g) || []).length
  assert.equal(ivermectinCount, HEARTWORM_IVERMECTIN_LINKS)
})
