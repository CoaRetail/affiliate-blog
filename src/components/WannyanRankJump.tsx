import {
  WANNYAN_JUMP_COLUMNS,
  WANNYAN_JUMP_NOTE,
  WANNYAN_WORRY_GROUPS,
  jumpRankHref,
  jumpRankLabel,
  type JumpRank,
  type WorryGroup,
} from '@/lib/wannyan-rank-jump'

function rankAria(group: WorryGroup, columnLabel: string, rank: JumpRank): string {
  const detail = rank.suffix ? `、ページの記載は${rank.suffix}` : ''
  return `${group.animal}の${columnLabel}、${rank.rank}位 ${rank.name}${detail}`
}

export function WannyanRankJump() {
  return (
    <nav id="worry-jump" className="worry-jump" aria-label="犬と猫の悩みから順位へ">
      <p>{WANNYAN_JUMP_NOTE}</p>
      <table>
        <thead>
          <tr>
            <th scope="col"><span className="worry-sr">動物</span></th>
            {WANNYAN_JUMP_COLUMNS.map(column => (
              <th key={column.key} scope="col">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WANNYAN_WORRY_GROUPS.map(group => (
            <tr key={group.id} id={group.id}>
              <th scope="row">{group.animal}</th>
              {group.links.map((link, index) => {
                const column = WANNYAN_JUMP_COLUMNS[index]
                if (!column) return null
                return (
                  <td key={link.id} id={link.id}>
                    {link.ranks.map(rank => (
                      <a
                        key={`${link.id}-${rank.rank}`}
                        href={jumpRankHref(rank.rank)}
                        aria-label={rankAria(group, column.label, rank)}
                      >
                        {jumpRankLabel(rank)}
                      </a>
                    ))}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <a className="worry-list" href="#rank-list">売れ筋10件の一覧</a>
    </nav>
  )
}
