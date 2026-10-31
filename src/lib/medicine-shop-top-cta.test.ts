import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

const PET_DIR = new URL('../../content/posts/pet/', import.meta.url)

const FILES = [
  'pet-medicine-overdose-risk.md',
  'dog-health-management-complete-guide.md',
  'pet-medicine-fake-identification.md',
  'pet-medicine-human-effect.md',
  'pet-medicine-genuine-selection.md',
  'pet-medicine-otc-vs-online.md',
  'overseas-pet-medicine-safety.md',
  'pet-medicine-online-shop-compare.md',
  'safe-pet-medicine-selection.md',
  'pet-medicine-personal-import-safe.md',
  'ai-recommended-pet-medicine.md',
  'dog-cat-same-medicine.md',
  'pet-medicine-online-legal.md',
] as const

const EMERGENCY = new Set([
  'pet-medicine-overdose-risk.md',
  'pet-medicine-human-effect.md',
  'dog-cat-same-medicine.md',
])

const SHOP_TOP = 'CiN-gOTx1i8'

const BANNED = /CiN-gOTx1i8|獣医師監修|100%|最強|確実|最安/

const ALLOWED_IDS = new Set([
  'L7IrW864-jY',
  'PadhsxDEeZQ',
  'MFppScuKzeM',
  'JgUCemnI7d4',
  'yaFOovyO8ac',
  'lr269oGXelI',
  'QlCa-I83UNc',
  '1mFYeWhr6ZA',
  'OITQJb-VRRc',
  'yDTdyhyFEoI',
  'bFyar6T99jA',
  'W6Qz6DSsTEY',
  'bEXlYyzm0WQ',
  'OheDwBlk-9s',
  'XuxaJbOu89I',
  'qMs9gxItGUg',
  'JcwocuM1lrE',
  '_M_b7FdnuAY',
  'YZNdYiBZb2U',
])

const PREEXISTING_OUTSIDE: Record<(typeof FILES)[number], readonly string[]> = {
  'pet-medicine-overdose-risk.md': [],
  'dog-health-management-complete-guide.md': [],
  'pet-medicine-fake-identification.md': [],
  'pet-medicine-human-effect.md': ['-dlwkEXJ_Jg'],
  'pet-medicine-genuine-selection.md': [],
  'pet-medicine-otc-vs-online.md': [],
  'overseas-pet-medicine-safety.md': [],
  'pet-medicine-online-shop-compare.md': ['-dlwkEXJ_Jg'],
  'safe-pet-medicine-selection.md': ['-dlwkEXJ_Jg'],
  'pet-medicine-personal-import-safe.md': [],
  'ai-recommended-pet-medicine.md': [],
  'dog-cat-same-medicine.md': ['-dlwkEXJ_Jg'],
  'pet-medicine-online-legal.md': ['-dlwkEXJ_Jg'],
}

function readPost(file: string) {
  return readFileSync(new URL(file, PET_DIR), 'utf8')
}

test('no pet article uses the wannyan shop-top link', () => {
  for (const name of readdirSync(PET_DIR)) {
    if (!name.endsWith('.md')) continue
    const body = readPost(name)
    assert.equal(body.includes(SHOP_TOP), false, name)
  }
})

test('medicine governance articles drop shop-top CTAs', () => {
  for (const file of FILES) {
    const body = readPost(file)
    assert.match(body, /updated: "2026-10-31"/)
    assert.match(body, /PR・広告を含む記事です/)
    assert.match(body, /\/pet-lp\.html/)
    assert.match(body, /効果は保証/)
    assert.doesNotMatch(body, BANNED)
    assert.equal(body.includes(SHOP_TOP), false, file)
    assert.equal(body.includes('yDTdyhyFEoI'), false, file)
    if (EMERGENCY.has(file)) {
      assert.match(body, /直接の答え/)
      assert.match(body, /人の薬は使わない/)
      const vetAt = Math.min(
        ...['動物病院', '医療機関'].map((word) => body.indexOf(word)).filter((i) => i >= 0),
      )
      const affiliateAt = body.indexOf('mttag.com')
      assert.ok(affiliateAt === -1 || vetAt < affiliateAt, `${file} vet before affiliate`)
      assert.doesNotMatch(body.slice(0, body.indexOf('## 次のステップ') || body.length), /product-carousel/)
    }
  }
})

test('mttag ids in medicine governance articles stay in the allowed table', () => {
  for (const file of FILES) {
    const body = readPost(file)
    const ids = [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
    const outside = new Set(PREEXISTING_OUTSIDE[file])
    for (const id of ids) {
      assert.equal(ALLOWED_IDS.has(id) || outside.has(id), true, `${file} uses ${id}`)
    }
    for (const id of outside) {
      assert.equal(body.includes(`mttag.com/s/${id}`), true, `${file} dropped ${id}`)
    }
    assert.equal(ids.includes(SHOP_TOP), false, file)
  }
})
