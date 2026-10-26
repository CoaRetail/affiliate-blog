// Jump targets for wannyan-bestseller-ranking.
// `mentioned` is a phrase that already appears in that rank's section.
// Ranks without an explicit target on the page are left out.

export type JumpRank = {
  rank: number
  name: string
  mentioned: string
  suffix?: string
}

export type WorryLink = {
  id: string
  ranks: JumpRank[]
}

export type WorryGroup = {
  id: 'dog' | 'cat'
  animal: '犬' | '猫'
  links: WorryLink[]
}

export const WANNYAN_JUMP_COLUMNS = [
  { key: 'flea', label: 'ノミ・ダニ' },
  { key: 'heartworm', label: 'フィラリア' },
  { key: 'worm', label: 'お腹の虫' },
] as const

export const WANNYAN_JUMP_NOTE =
  '犬用と猫用は別の商品です。効果は保証しません。フィラリア予防薬は獣医師の処方と投与前検査が必要です。販売ページに対象の記載がある順位へ移動します。'

export const WANNYAN_WORRY_GROUPS: WorryGroup[] = [
  {
    id: 'dog',
    animal: '犬',
    links: [
      {
        id: 'dog-flea',
        ranks: [
          { rank: 1, name: 'ネクスガードスペクトラ', mentioned: 'ノミ・マダニ' },
          { rank: 7, name: 'シンパリカトリオ', mentioned: 'ノミ・マダニ' },
        ],
      },
      {
        id: 'dog-heartworm',
        ranks: [
          { rank: 1, name: 'ネクスガードスペクトラ', mentioned: 'フィラリア' },
          { rank: 2, name: 'レボリューション(犬用)', mentioned: 'フィラリア' },
          { rank: 7, name: 'シンパリカトリオ', mentioned: 'フィラリア' },
          { rank: 9, name: 'プリノケート(犬用)', mentioned: 'フィラリア' },
        ],
      },
      {
        id: 'dog-worm',
        ranks: [
          { rank: 1, name: 'ネクスガードスペクトラ', mentioned: '犬回虫' },
          { rank: 7, name: 'シンパリカトリオ', mentioned: '回虫・鉤虫' },
        ],
      },
    ],
  },
  {
    id: 'cat',
    animal: '猫',
    links: [
      {
        id: 'cat-flea',
        ranks: [
          { rank: 4, name: 'レボリューション(猫用)', mentioned: 'ノミ・ダニ' },
          { rank: 8, name: 'アドボケート(猫用)', mentioned: 'ノミ', suffix: 'ノミ' },
        ],
      },
      {
        id: 'cat-heartworm',
        ranks: [
          { rank: 4, name: 'レボリューション(猫用)', mentioned: 'フィラリア' },
          { rank: 8, name: 'アドボケート(猫用)', mentioned: 'フィラリア' },
        ],
      },
      {
        id: 'cat-worm',
        ranks: [
          { rank: 4, name: 'レボリューション(猫用)', mentioned: 'おなかの虫' },
          { rank: 8, name: 'アドボケート(猫用)', mentioned: '猫回虫' },
        ],
      },
    ],
  },
]

export function jumpRankHref(rank: number): string {
  return `#rank-${rank}`
}

export function jumpRankLabel(rank: JumpRank): string {
  return rank.suffix ? `${rank.rank}位（${rank.suffix}）` : `${rank.rank}位`
}
