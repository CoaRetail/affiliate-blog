import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const petDir = fileURLToPath(new URL('../../content/posts/pet', import.meta.url))

const ZITHROMAX_ID = 'QlCa-I83UNc'
const BROADLINE_ID = 'yDTdyhyFEoI'
const ROUNDWORM_SLUG = 'dog-roundworm-treatment.md'
const NO_BROADLINE_SLUGS = ['cat-flea-recurrence.md', 'cat-flea-tick-combined-care.md'] as const

const ALLOWED_IDS = new Set([
  'L7IrW864-jY',
  'PadhsxDEeZQ',
  'MFppScuKzeM',
  'JgUCemnI7d4',
  'yaFOovyO8ac',
  'lr269oGXelI',
  '1mFYeWhr6ZA',
  'OITQJb-VRRc',
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

/** Pre-existing ids outside the shop allowlist; do not add new ones. */
const LEGACY_IDS = new Set(['-dlwkEXJ_Jg', ZITHROMAX_ID, BROADLINE_ID])

function mttagIds(text: string): string[] {
  return [...text.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((m) => m[1])
}

const petMarkdown = readdirSync(petDir).filter((name) => name.endsWith('.md'))

test('QlCa-I83UNc remains only on dog-roundworm-treatment (carousel removal elsewhere)', () => {
  for (const file of petMarkdown) {
    const body = readFileSync(join(petDir, file), 'utf8')
    if (file === ROUNDWORM_SLUG) continue
    assert.equal(
      body.includes(ZITHROMAX_ID),
      false,
      `${file} must not link to zithromax (${ZITHROMAX_ID})`,
    )
  }
  const roundworm = readFileSync(join(petDir, ROUNDWORM_SLUG), 'utf8')
  assert.equal(roundworm.includes(ZITHROMAX_ID), false, 'dog-roundworm-treatment no longer links zithromax after PR #43')
})

test('out-of-stock Broadline id removed from cat flea recurrence articles only', () => {
  for (const file of NO_BROADLINE_SLUGS) {
    const body = readFileSync(join(petDir, file), 'utf8')
    assert.equal(body.includes(BROADLINE_ID), false, `${file} must not link to Broadline`)
  }
})

test('pet posts do not introduce mttag ids outside allowlist and known legacy', () => {
  for (const file of petMarkdown) {
    const body = readFileSync(join(petDir, file), 'utf8')
    for (const id of mttagIds(body)) {
      if (ALLOWED_IDS.has(id)) continue
      if (!LEGACY_IDS.has(id)) {
        assert.fail(`${file} uses unknown mttag id ${id}`)
      }
      if (id === ZITHROMAX_ID) {
        assert.equal(file, ROUNDWORM_SLUG, `${file} must not use ${ZITHROMAX_ID}`)
      }
    }
  }
})
