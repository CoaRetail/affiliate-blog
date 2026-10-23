'use client'

import type { MouseEvent, ReactNode } from 'react'
import {
  clickEventsForAnchor,
  type ArticleGtagCall,
  type ArticleNavigationGtagCall,
} from '@/lib/article-affiliate-click'

type Gtag = (
  command: 'event',
  name: string,
  params?: ArticleGtagCall['params'] | ArticleNavigationGtagCall['params'],
) => void

const trackedClicks = new WeakSet<Event>()

function labelFromAnchor(anchor: HTMLAnchorElement) {
  const text = (anchor.textContent || '').replace(/\s+/g, ' ').trim()
  if (text) return text.slice(0, 100)
  const alt = anchor.querySelector('img')?.getAttribute('alt')?.trim()
  if (alt) return alt.slice(0, 100)
  return 'unknown'
}

export function ArticleAffiliateClicks({ children }: { children: ReactNode }) {
  function onClick(event: MouseEvent<HTMLDivElement>) {
    if (trackedClicks.has(event.nativeEvent)) return
    trackedClicks.add(event.nativeEvent)

    const target = event.target
    if (!(target instanceof Element)) return
    const anchor = target.closest('a')
    if (!anchor || !event.currentTarget.contains(anchor)) return

    const calls = clickEventsForAnchor({
      href: anchor.href,
      trackEvent: anchor.dataset.trackEvent,
      label: anchor.dataset.trackLabel || labelFromAnchor(anchor),
      location: anchor.dataset.trackLocation,
    })
    if (calls.length === 0) return

    const gtag = (window as Window & { gtag?: Gtag }).gtag
    if (typeof gtag !== 'function') return

    for (const call of calls) {
      gtag(call.command, call.name, call.params)
    }
  }

  return (
    <div onClick={onClick} style={{fontSize:'15px', lineHeight:'1.9', color:'#374151'}}>
      {children}
    </div>
  )
}
