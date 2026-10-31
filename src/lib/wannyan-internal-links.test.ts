import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { WANNYAN_JUMP_COLUMNS, WANNYAN_JUMP_NOTE, WANNYAN_WORRY_GROUPS } from './wannyan-rank-jump.ts'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

const ranking = read('../../content/posts/pet/wannyan-bestseller-ranking.md')
const thirst = read('../../content/posts/pet/cat-excessive-thirst.md')
const cough = read('../../content/posts/pet/dog-cough-cause.md')
const roundworm = read('../../content/posts/pet/dog-roundworm-treatment.md')
const parasite = read('../../content/posts/pet/parasite-medicine-recommend-ranking.md')

const BANNED = /効果が高く|人気No\.1|高評価を獲得|安全で信頼|100%|最強|確実に|\*\*/

function ids(body: string) {
  return [...body.matchAll(/mttag\.com\/s\/([A-Za-z0-9_-]+)/g)].map((match) => match[1])
}

function unique(values: string[]) {
  return [...new Set(values)].sort()
}

function section(rank: number) {
  const start = ranking.indexOf(`<h2 id="rank-${rank}">`)
  assert.notEqual(start, -1, `missing rank-${rank}`)
  const rest = ranking.slice(start + 1)
  const next = rest.search(/<h2 id="rank-\d+"/)
  return next === -1 ? ranking.slice(start) : ranking.slice(start, start + 1 + next)
}

test('worry jump only targets ranks whose section already names that concern', () => {
  assert.equal(WANNYAN_WORRY_GROUPS.length, 2)
  assert.deepEqual(WANNYAN_WORRY_GROUPS.map((group) => group.animal), ['犬', '猫'])
  assert.doesNotMatch(WANNYAN_JUMP_NOTE, BANNED)
  assert.match(WANNYAN_JUMP_NOTE, /獣医師の処方と投与前検査/)
  assert.match(ranking, /id="rank-list"/)
  for (const group of WANNYAN_WORRY_GROUPS) {
    assert.equal(group.links.length, WANNYAN_JUMP_COLUMNS.length)
    for (const link of group.links) {
      assert.equal(link.ranks.length > 0, true)
      for (const rank of link.ranks) {
        assert.match(section(rank.rank), new RegExp(rank.mentioned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
        if (group.id === 'dog') assert.equal([3, 4, 6, 8].includes(rank.rank), false)
        if (group.id === 'cat') assert.equal([1, 2, 5, 7, 9, 10].includes(rank.rank), false)
      }
    }
  }
})

test('searched pet pages link to the ranking without new affiliate ids', () => {
  assert.match(thirst, /wannyan-bestseller-ranking\?utm_source=article&amp;utm_medium=referral&amp;utm_campaign=pet_cluster&amp;utm_content=cat-excessive-thirst#cat/)
  assert.match(thirst, /data-track-event="article_click"/)
  assert.match(thirst, /犬用の商品は猫に使いません/)
  // Shop-top CiN-gOTx1i8 and the unrelated product carousel were removed.
  // Semintra (lr269oGXelI) stays. No new affiliate ids.
  assert.deepEqual(unique(ids(thirst)), ['lr269oGXelI'])

  assert.match(cough, /utm_content=dog-cough-cause#dog-heartworm/)
  assert.match(cough, /data-track-label="犬のフィラリア"/)
  // Shop-top CiN-gOTx1i8 and the unrelated product carousel were removed.
  // The pre-existing ivermectin link stays, with the same count.
  assert.deepEqual(unique(ids(cough)), ['-dlwkEXJ_Jg'])

  assert.match(roundworm, /utm_content=dog-roundworm-treatment#dog-worm/)
  assert.match(roundworm, /data-track-label="犬のお腹の虫"/)
  // Shop-top CiN-gOTx1i8 was replaced with drontal plus (bFyar6T99jA). Carousel ids are unchanged.
  assert.deepEqual(unique(ids(roundworm)), ['JgUCemnI7d4', 'L7IrW864-jY', 'MFppScuKzeM', 'PadhsxDEeZQ', 'QlCa-I83UNc', 'bFyar6T99jA', 'lr269oGXelI', 'yaFOovyO8ac'].sort())

  assert.match(parasite, /utm_content=parasite-medicine-recommend-ranking#dog/)
  assert.match(parasite, /utm_content=parasite-medicine-recommend-ranking#cat/)
  assert.equal((parasite.match(/data-track-event="article_click"/g) || []).length, 3)
  assert.deepEqual(unique(ids(parasite)), ['PadhsxDEeZQ', 'bEXlYyzm0WQ', 'bFyar6T99jA', 'yDTdyhyFEoI'].sort())

  for (const body of [thirst, cough, roundworm, parasite]) {
    const added = body.match(/<p>[\s\S]*?wannyan-bestseller-ranking[\s\S]*?<\/p>/g) || []
    assert.equal(added.length > 0, true)
    assert.doesNotMatch(added.join('\n'), BANNED)
  }
  assert.doesNotMatch(WANNYAN_JUMP_NOTE, BANNED)
  assert.deepEqual(unique(ids(ranking)), [
    '1mFYeWhr6ZA',
    'JcwocuM1lrE',
    'L7IrW864-jY',
    'MFppScuKzeM',
    'OITQJb-VRRc',
    'OheDwBlk-9s',
    'PadhsxDEeZQ',
    'W6Qz6DSsTEY',
    'XuxaJbOu89I',
    'YZNdYiBZb2U',
    '_M_b7FdnuAY',
    'bEXlYyzm0WQ',
    'qMs9gxItGUg',
  ].sort())
})

test('ranking stays in sitemap, pet cluster, and pet-lp, and untouched pages stay untouched', () => {
  const sitemap = read('../app/sitemap.ts')
  const site = read('./site.ts')
  const home = read('../app/page.tsx')
  const category = read('../app/[category]/page.tsx')
  const petLp = read('../../public/pet-lp.html')
  assert.match(sitemap, /wannyan-bestseller-ranking/)
  assert.match(site, /slug: 'wannyan-bestseller-ranking'/)
  assert.match(site, /犬用・猫用の並び/)
  assert.match(home, /utm_content=home-pet#worry-jump/)
  assert.match(category, /utm_content=pet-category#worry-jump/)
  assert.match(petLp, /\/posts\/wannyan-bestseller-ranking/)
  for (const file of [
    '../../content/posts/pet/cat-blood-in-urine.md',
    '../../content/posts/pet/o2charge-pet-sansoshitsu-rental.md',
    '../../content/posts/pet/grands-catfood-erabikata.md',
    '../../content/posts/pet/mogwan-dogfood-erabikata.md',
    '../../content/posts/sleep/nell-mattress-erabikata.md',
  ]) {
    assert.equal(read(file).includes('wannyan-bestseller-ranking'), false, file)
  }
  const diarrhea = read('../../content/posts/pet/cat-diarrhea-treatment.md')
  assert.match(
    diarrhea,
    /\/posts\/wannyan-bestseller-ranking\?utm_source=article&utm_medium=referral&utm_campaign=pet_cluster&utm_content=cat-diarrhea-treatment\)/,
  )
  assert.doesNotMatch(diarrhea, /wannyan-bestseller-ranking[^)\n]*#/)
  assert.doesNotMatch(diarrhea, /data-track-event="article_click"/)
})
