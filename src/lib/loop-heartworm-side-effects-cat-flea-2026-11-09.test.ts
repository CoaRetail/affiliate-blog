import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const sideEffectsPath = fileURLToPath(
  new URL('../../content/posts/pet/heartworm-medicine-side-effects.md', import.meta.url),
)
const catFleaPath = fileURLToPath(
  new URL('../../content/posts/pet/cat-flea-medicine-ranking.md', import.meta.url),
)

const sideEffects = readFileSync(sideEffectsPath, 'utf8')
const catFlea = readFileSync(catFleaPath, 'utf8')

const BANNED =
  /獣医師監修|半額|最大50%|No\.1|1%未満|-dlwkEXJ_Jg|QlCa-I83UNc|yDTdyhyFEoI|CiN-gOTx1i8/

test('loop 2026-11-09 both articles have purpose table and updated date', () => {
  for (const body of [sideEffects, catFlea]) {
    assert.match(body, /updated: "2026-11-09"/)
    assert.match(body, /目的別の見方/)
    assert.doesNotMatch(body, /\*\*/)
    assert.doesNotMatch(body, BANNED)
  }
})

test('heartworm side-effects article keeps dog ids and drops off-topic carousels', () => {
  assert.match(sideEffects, /PadhsxDEeZQ/)
  assert.match(sideEffects, /L7IrW864-jY/)
  assert.match(sideEffects, /qMs9gxItGUg/)
  assert.equal(sideEffects.includes('JgUCemnI7d4'), false)
  assert.equal(sideEffects.includes('yaFOovyO8ac'), false)
  assert.equal(sideEffects.includes('lr269oGXelI'), false)
})

test('cat flea article keeps cat product ids and drops dog carousel ids', () => {
  assert.match(catFlea, /1mFYeWhr6ZA/)
  assert.match(catFlea, /bEXlYyzm0WQ/)
  assert.equal(catFlea.includes('L7IrW864-jY'), false)
  assert.equal(catFlea.includes('PadhsxDEeZQ'), false)
  assert.equal(catFlea.includes('MFppScuKzeM'), false)
  assert.equal(catFlea.includes('lr269oGXelI'), false)
})
