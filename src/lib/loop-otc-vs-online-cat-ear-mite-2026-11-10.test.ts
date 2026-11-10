import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const otcPath = fileURLToPath(
  new URL('../../content/posts/pet/pet-medicine-otc-vs-online.md', import.meta.url),
)
const catEarMitePath = fileURLToPath(
  new URL('../../content/posts/pet/cat-ear-mite-medicine.md', import.meta.url),
)

const otc = readFileSync(otcPath, 'utf8')
const catEarMite = readFileSync(catEarMitePath, 'utf8')

const BANNED =
  /獣医師監修|半額|最大50%|No\.1|1%未満|圧倒的|確実|完全駆除|最も効果的|約50%|QlCa-I83UNc|yDTdyhyFEoI|CiN-gOTx1i8|-dlwkEXJ_Jg|yYP6UrhNh8Q|GERGlgYfF50|A-OpDysFxl4/

test('loop 2026-11-10 both articles have purpose table and updated date', () => {
  for (const body of [otc, catEarMite]) {
    assert.match(body, /updated: "2026-11-10"/)
    assert.match(body, /目的別の見方/)
    assert.doesNotMatch(body, /\*\*/)
    assert.doesNotMatch(body, BANNED)
  }
})

test('otc-vs-online article keeps dog ids and drops off-topic carousels', () => {
  assert.match(otc, /PadhsxDEeZQ/)
  assert.match(otc, /L7IrW864-jY/)
  assert.match(otc, /MFppScuKzeM/)
  assert.match(otc, /1mFYeWhr6ZA/)
  assert.equal(otc.includes('JgUCemnI7d4'), false)
  assert.equal(otc.includes('yaFOovyO8ac'), false)
  assert.equal(otc.includes('lr269oGXelI'), false)
})

test('cat ear mite article keeps cat product ids and drops dog carousel ids', () => {
  assert.match(catEarMite, /bEXlYyzm0WQ/)
  assert.match(catEarMite, /yaFOovyO8ac/)
  assert.match(catEarMite, /JgUCemnI7d4/)
  assert.equal(catEarMite.includes('L7IrW864-jY'), false)
  assert.equal(catEarMite.includes('PadhsxDEeZQ'), false)
  assert.equal(catEarMite.includes('MFppScuKzeM'), false)
  assert.equal(catEarMite.includes('lr269oGXelI'), false)
})
