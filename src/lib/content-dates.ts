export function ymd(value?: string | null): string | undefined {
  if (!value) return undefined
  const match = String(value).match(/(\d{4}-\d{2}-\d{2})/)
  return match?.[1]
}

export function latestYmd(values: Array<string | undefined>): string | undefined {
  let latest: string | undefined
  for (const value of values) {
    if (!value) continue
    if (!latest || value > latest) latest = value
  }
  return latest
}
