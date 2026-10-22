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

// The downloaded Google tag copies affiliate_click onto itself (the copy has
// no _ee / gtm_ee flag) and also emits page_view to linked destinations.
// Drop only those extra hits. A real click keeps _ee=1, and a later click is
// a new request with that flag, so it is not treated as a duplicate.
export function shouldDropGoogleCollect(rawUrl: string, body: string, ga4Id: string): boolean {
  let url: URL
  try {
    url = new URL(rawUrl, 'https://www.qolmedia.info')
  } catch {
    return false
  }
  let en = url.searchParams.get('en') || ''
  let tid = url.searchParams.get('tid') || ''
  let external = url.searchParams.get('_ee') || url.searchParams.get('gtm_ee') || ''
  if (body) {
    const extra = new URLSearchParams(body)
    en = en || extra.get('en') || ''
    tid = tid || extra.get('tid') || ''
    external = external || extra.get('_ee') || extra.get('gtm_ee') || ''
  }
  const copiedAffiliate =
    en === 'affiliate_click' &&
    tid === ga4Id &&
    !external &&
    (url.pathname === '/g/collect' || url.pathname === '/measurement/conversion')
  const extraPageView = en === 'page_view' && tid !== '' && tid !== ga4Id
  return copiedAffiliate || extraPageView
}

export function googleTagInlineScript(): string {
  return `
            window.dataLayer = window.dataLayer || [];
            if (typeof window.gtag !== 'function') {
              window.gtag = function(){window.dataLayer.push(arguments);};
            }
            if (!window.__qolGoogleTagConfigured) {
              window.__qolGoogleTagConfigured = true;
              var shouldDropGoogleCollect = ${shouldDropGoogleCollect.toString()};
              var ga4Id = '${GA4_MEASUREMENT_ID}';
              function qolCollectBody(url, body) {
                return shouldDropGoogleCollect(String(url || ''), typeof body === 'string' ? body : '', ga4Id);
              }
              if (typeof window.fetch === 'function') {
                var qolOrigFetch = window.fetch;
                window.fetch = function(input, init) {
                  var url = typeof input === 'string' ? input : (input && input.url);
                  var body = init && typeof init.body === 'string' ? init.body : '';
                  if (qolCollectBody(url, body)) return Promise.resolve(new Response('', {status: 204}));
                  return qolOrigFetch.apply(this, arguments);
                };
              }
              if (navigator.sendBeacon) {
                var qolOrigBeacon = navigator.sendBeacon.bind(navigator);
                navigator.sendBeacon = function(url, data) {
                  if (qolCollectBody(url, data)) return true;
                  return qolOrigBeacon(url, data);
                };
              }
              var qolXhrOpen = XMLHttpRequest.prototype.open;
              var qolXhrSend = XMLHttpRequest.prototype.send;
              XMLHttpRequest.prototype.open = function(method, url) {
                this.__qolUrl = url;
                return qolXhrOpen.apply(this, arguments);
              };
              XMLHttpRequest.prototype.send = function(body) {
                if (qolCollectBody(this.__qolUrl, body)) return;
                return qolXhrSend.apply(this, arguments);
              };
              var qolSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
              if (qolSrc && qolSrc.set && qolSrc.get) {
                Object.defineProperty(HTMLImageElement.prototype, 'src', {
                  configurable: true,
                  get: function() { return qolSrc.get.call(this); },
                  set: function(value) {
                    if (qolCollectBody(value, '')) return;
                    return qolSrc.set.call(this, value);
                  }
                });
              }
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

// A8 requires rel="nofollow" on px.a8.net. sponsored is allowed.
// href itself is not rewritten here.
export function articleLinkRel(href?: string): string | undefined {
  if (!href?.startsWith('http')) return undefined
  try {
    if (new URL(href).hostname === 'px.a8.net') {
      return 'nofollow sponsored noopener noreferrer'
    }
  } catch {
    return 'noopener noreferrer'
  }
  return 'noopener noreferrer'
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
