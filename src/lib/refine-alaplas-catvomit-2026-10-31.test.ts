import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const ALAPLAS = readFileSync(
  new URL('../../content/posts/sleep/asa-okitemo-tsukare-alaplas.md', import.meta.url),
  'utf8',
)
const CAT_VOMIT = readFileSync(
  new URL('../../content/posts/pet/cat-vomiting-yellow.md', import.meta.url),
  'utf8',
)

const A8_ALAPLAS = 'https://px.a8.net/svt/ejp?a8mat=4AZS0R+691WZM+43JO+NTJWY'
const FORBIDDEN_IDS = ['CiN-gOTx1i8', '-dlwkEXJ_Jg', 'QlCa-I83UNc']
const UNSOURCED_STATS = /約4割|約15%|5人に1人/
const BANNED_ALAPLAS = /科学的根拠|根本から|医学的にも|コスパ最強|最も重要/

test('alaplas article keeps A8 affiliate URLs unchanged', () => {
  const matches = ALAPLAS.match(new RegExp(A8_ALAPLAS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))
  assert.equal(matches?.length, 3, 'expected three unchanged A8 links')
  assert.equal(ALAPLAS.includes('a8mat=4AZS0R+691WZM+43JO+NTJWY'), true)
})

test('refined articles avoid forbidden shop ids and unsourced stats', () => {
  for (const body of [ALAPLAS, CAT_VOMIT]) {
    for (const id of FORBIDDEN_IDS) {
      assert.equal(body.includes(id), false, `forbidden id ${id}`)
    }
    assert.doesNotMatch(body, UNSOURCED_STATS)
    assert.match(body, /updated: "2026-10-31"/)
    assert.match(body, /確認日：2026-10-31/)
  }
  assert.doesNotMatch(ALAPLAS, BANNED_ALAPLAS)
  assert.match(ALAPLAS, /^faq:/m)
  assert.match(ALAPLAS, /直接の答え/)
  assert.match(ALAPLAS, /\/sleep-guide\.html/)
  assert.match(ALAPLAS, /\/posts\/makura-ranking-2026/)
  assert.match(ALAPLAS, /\/posts\/suimin-shitsu-ageru-matome/)
  assert.match(CAT_VOMIT, /^faq:/m)
  assert.match(CAT_VOMIT, /猫が黄色い液を吐く原因/)
  assert.match(CAT_VOMIT, /すぐ受診する症状/)
  assert.match(CAT_VOMIT, /様子を見るときの記録/)
  assert.match(CAT_VOMIT, /やってはいけないこと/)
  assert.match(CAT_VOMIT, /## Q&A/)
  assert.match(CAT_VOMIT, /\/posts\/cat-excessive-thirst/)
  assert.match(CAT_VOMIT, /\/posts\/dog-vomiting-cause/)
  assert.match(CAT_VOMIT, /\/posts\/cat-flea-removal-home-steps/)
  assert.match(CAT_VOMIT, /\/posts\/cat-worm-in-stool/)
  assert.equal(CAT_VOMIT.includes('mttag.com'), false)
})
