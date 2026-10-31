'use client'

import type { CSSProperties, ReactNode } from 'react'
import { clickEventsForAnchor } from '@/lib/article-affiliate-click'

type Gtag = (
  command: 'event',
  name: string,
  params?: Record<string, string | undefined>,
) => void

type Props = {
  href: string
  label: string
  location: string
  children: ReactNode
  style?: CSSProperties
}

export function ArticleClickLink({ href, label, location, children, style }: Props) {
  function onClick() {
    const gtag = (window as Window & { gtag?: Gtag }).gtag
    if (typeof gtag !== 'function') return
    const calls = clickEventsForAnchor({
      href,
      trackEvent: 'article_click',
      label,
      location,
    })
    for (const call of calls) {
      gtag(call.command, call.name, call.params)
    }
  }

  return (
    <a href={href} style={style} onClick={onClick}>
      {children}
    </a>
  )
}
