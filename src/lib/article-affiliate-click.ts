// Hosts already used as affiliate destinations in article bodies.
// sleep-guide.html trackAffiliateClick fires affiliate_click then cta_click.
const AFFILIATE_HOSTS = new Set([
  't.afi-b.com',
  'px.a8.net',
  'mttag.com',
  'amzn.to',
])

// One gtag.js load. GA4 config sends the only page_view. Ads stays configured
// but must not send a second page_view. Article events use send_to so one
// click is not fanned out to every configured tag.
export const GA4_MEASUREMENT_ID = 'G-BS30YQY1N7'
export const GOOGLE_ADS_ID = 'AW-18052634530'

export function googleTagInlineScript(): string {
  return `
            window.dataLayer = window.dataLayer || [];
            if (typeof window.gtag !== 'function') {
              window.gtag = function(){window.dataLayer.push(arguments);};
            }
            if (!window.__qolGoogleTagConfigured) {
              window.__qolGoogleTagConfigured = true;
              window.gtag('js', new Date());
              window.gtag('config', '${GA4_MEASUREMENT_ID}');
              window.gtag('config', '${GOOGLE_ADS_ID}', { send_page_view: false });
            }
          `
}

export const ARTICLE_CLICK_LOCATION = 'article'

export function isExistingAffiliateHref(href: string): boolean {
  try {
    const url = new URL(href, 'https://www.qolmedia.info')
    return AFFILIATE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export type AffiliateEventParams = {
  event_category: string
  event_label: string
  worry_type: string
  link_location?: string
  cta_location?: string
}

export function articleAffiliateEvents(label: string): Array<{
  name: 'affiliate_click' | 'cta_click'
  params: AffiliateEventParams
}> {
  const event_label = label || 'unknown'
  return [
    {
      name: 'affiliate_click' as const,
      params: {
        event_category: 'cv',
        event_label,
        worry_type: 'none',
        link_location: ARTICLE_CLICK_LOCATION,
      },
    },
    {
      name: 'cta_click' as const,
      params: {
        event_category: 'affiliate',
        event_label,
        worry_type: 'none',
        cta_location: ARTICLE_CLICK_LOCATION,
      },
    },
  ]
}

export type ArticleGtagCall = {
  command: 'event'
  name: 'affiliate_click' | 'cta_click'
  params: AffiliateEventParams & { send_to: string }
}

// One call per event name, routed only to GA4. A second gtag.js plus an Ads
// config was delivering the same affiliate_click three times.
export function articleAffiliateGtagCalls(label: string): ArticleGtagCall[] {
  return articleAffiliateEvents(label).map((item) => ({
    command: 'event' as const,
    name: item.name,
    params: { ...item.params, send_to: GA4_MEASUREMENT_ID },
  }))
}
