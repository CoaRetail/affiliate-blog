import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const wormPath = fileURLToPath(
  new URL('../../content/posts/pet/cat-worm-in-stool.md', import.meta.url),
)
const heartwormPath = fileURLToPath(
  new URL('../../content/posts/pet/cat-heartworm-prevention.md', import.meta.url),
)

const worm = readFileSync(wormPath, 'utf8')
const heartworm = readFileSync(heartwormPath, 'utf8')

const VET_CAUTION =
  '使用前に獣医師の診察・検査（例：フィラリア予防薬なら感染検査）を受け、処方・指示に従ってください。体重・年齢・持病によって使えない場合があります。'

const PRODUCT_CTA = '商品ページを見る（わんにゃん薬局・PR）'

test('cat worm in stool loop compliance', () => {
  assert.match(worm, /updated: "2026-11-08"/)
  assert.match(worm, /目的別の見方/)
  assert.doesNotMatch(worm, /\*\*/)
  assert.doesNotMatch(worm, /獣医師監修/)
  assert.doesNotMatch(worm, /半額以下/)
  assert.doesNotMatch(worm, /約半額/)
  assert.doesNotMatch(worm, /早急に駆虫/)

  assert.match(worm, /JgUCemnI7d4/)
  assert.match(worm, /1mFYeWhr6ZA/)
  assert.equal(worm.includes('L7IrW864-jY'), false)
  assert.equal(worm.includes('PadhsxDEeZQ'), false)
  assert.equal(worm.includes('MFppScuKzeM'), false)
  assert.equal(worm.includes('lr269oGXelI'), false)
  assert.equal(worm.includes('bFyar6T99jA'), false)
  assert.equal(worm.includes('-dlwkEXJ_Jg'), false)
  assert.equal(worm.includes('QlCa-I83UNc'), false)
  assert.equal(worm.includes('yDTdyhyFEoI'), false)
  assert.equal(worm.includes('CiN-gOTx1i8'), false)

  assert.match(worm, new RegExp(VET_CAUTION))
  assert.match(worm, new RegExp(PRODUCT_CTA))
})

test('cat heartworm prevention loop compliance', () => {
  assert.match(heartworm, /updated: "2026-11-08"/)
  assert.match(heartworm, /目的別の見方/)
  assert.doesNotMatch(heartworm, /\*\*/)
  assert.doesNotMatch(heartworm, /獣医師監修/)
  assert.doesNotMatch(heartworm, /半額以下/)
  assert.doesNotMatch(heartworm, /約半額/)
  assert.doesNotMatch(heartworm, /早急に駆虫/)

  assert.match(heartworm, /bEXlYyzm0WQ/)
  assert.match(heartworm, /JcwocuM1lrE/)
  assert.equal(heartworm.includes('L7IrW864-jY'), false)
  assert.equal(heartworm.includes('PadhsxDEeZQ'), false)
  assert.equal(heartworm.includes('MFppScuKzeM'), false)
  assert.equal(heartworm.includes('JgUCemnI7d4'), false)
  assert.equal(heartworm.includes('yaFOovyO8ac'), false)
  assert.equal(heartworm.includes('lr269oGXelI'), false)
  assert.equal(heartworm.includes('-dlwkEXJ_Jg'), false)
  assert.equal(heartworm.includes('QlCa-I83UNc'), false)
  assert.equal(heartworm.includes('yDTdyhyFEoI'), false)
  assert.equal(heartworm.includes('CiN-gOTx1i8'), false)

  assert.match(heartworm, new RegExp(VET_CAUTION))
  assert.match(heartworm, new RegExp(PRODUCT_CTA))
})
