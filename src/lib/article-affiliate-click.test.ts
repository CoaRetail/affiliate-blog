import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  articleAffiliateEvents,
  articleAffiliateGtagCalls,
  googleTagInlineScript,
  articleLinkRel,
  isExistingAffiliateHref,
  shouldDropGoogleCollect,
} from './article-affiliate-click.ts'

test('existing affiliate hosts used in articles match', () => {
  assert.equal(
    isExistingAffiliateHref('https://t.afi-b.com/visit.php?a=46393a-U221067n&p=e855734s'),
    true,
  )
  assert.equal(
    isExistingAffiliateHref('https://px.a8.net/svt/ejp?a8mat=4AZS0R+6C130I+4KU6+61Z81'),
    true,
  )
  assert.equal(isExistingAffiliateHref('https://mttag.com/s/L7IrW864-jY'), true)
  assert.equal(isExistingAffiliateHref('https://amzn.to/4c9wbXX'), true)
})

test('px.a8.net stays an affiliate click and keeps nofollow without rewriting href', () => {
  const href = 'https://px.a8.net/svt/ejp?a8mat=4BEMLO+58QH36+4KD8+5YJRM'
  assert.equal(isExistingAffiliateHref(href), true)
  assert.equal(articleLinkRel(href), 'nofollow sponsored noopener noreferrer')
  assert.equal(articleLinkRel('https://nell.life/products/mattress-original'), 'noopener noreferrer')
  assert.equal(articleLinkRel('/posts/makura-ranking-2026'), undefined)
})

test('internal links and other hosts are not affiliate clicks', () => {
  assert.equal(isExistingAffiliateHref('/hc-guide.html'), false)
  assert.equal(isExistingAffiliateHref('/posts/aga-hiyo-hikaku-2026'), false)
  assert.equal(isExistingAffiliateHref('https://www.qolmedia.info/sleep-guide.html'), false)
  assert.equal(isExistingAffiliateHref('https://example.com/out'), false)
  assert.equal(isExistingAffiliateHref('https://www.afi-b.com/upload_image/x.jpg'), false)
  assert.equal(isExistingAffiliateHref(''), false)
})

test('events match the LP payload and mark the click as article', () => {
  assert.deepEqual(articleAffiliateEvents('無料カウンセリングで総額の目安を聞く'), [
    {
      name: 'affiliate_click',
      params: {
        event_category: 'cv',
        event_label: '無料カウンセリングで総額の目安を聞く',
        worry_type: 'none',
        link_location: 'article',
      },
    },
    {
      name: 'cta_click',
      params: {
        event_category: 'affiliate',
        event_label: '無料カウンセリングで総額の目安を聞く',
        worry_type: 'none',
        cta_location: 'article',
      },
    },
  ])
})

test('one click emits affiliate_click once, only to GA4', () => {
  const calls = articleAffiliateGtagCalls('ネクスガードスペクトラ')
  const affiliate = calls.filter((call) => call.name === 'affiliate_click')
  assert.equal(affiliate.length, 1)
  assert.equal(calls.some((call) => (call.name as string) === 'page_view'), false)
  assert.equal(calls.filter((call) => call.name === 'cta_click').length, 1)
  assert.equal(affiliate[0].params.link_location, 'article')
  assert.equal(affiliate[0].params.event_category, 'cv')
  assert.equal(affiliate[0].params.event_label, 'ネクスガードスペクトラ')
  assert.equal(affiliate[0].params.send_to, 'G-BS30YQY1N7')
  assert.equal(calls[1].params.cta_location, 'article')
})

test('google tag sends page_view from GA4 only', () => {
  const script = googleTagInlineScript()
  assert.equal(script.match(/googletagmanager\.com\/gtag\/js/g), null)
  assert.equal((script.match(/gtag\('config', 'G-BS30YQY1N7'\)/g) || []).length, 1)
  assert.equal(
    (script.match(/gtag\('config', 'AW-18052634530', \{ send_page_view: false \}\)/g) || []).length,
    1,
  )
  assert.equal((script.match(/send_page_view: false/g) || []).length, 1)
  assert.match(script, /__qolGoogleTagConfigured/)
  assert.match(script, /shouldDropGoogleCollect/)
  assert.equal((script.match(/gtag\('event', 'page_view'/g) || []).length, 0)
})

test('copied affiliate_click and extra page_view hits are dropped', () => {
  const ga = 'G-BS30YQY1N7'
  const collect = (query: string) => `https://analytics.google.com/g/collect?${query}`
  assert.equal(
    shouldDropGoogleCollect(collect('en=affiliate_click&tid=G-BS30YQY1N7'), '', ga),
    true,
  )
  assert.equal(
    shouldDropGoogleCollect(collect('en=affiliate_click&tid=G-BS30YQY1N7&_ee=1&ep.event_label=x&ep.link_location=article'), '', ga),
    false,
  )
  assert.equal(
    shouldDropGoogleCollect(collect('en=affiliate_click&tid=G-BS30YQY1N7&_ee=1&ep.event_label=y'), '', ga),
    false,
  )
  assert.equal(
    shouldDropGoogleCollect('https://www.google.com/measurement/conversion?en=affiliate_click&tid=G-BS30YQY1N7', '', ga),
    true,
  )
  assert.equal(
    shouldDropGoogleCollect('https://www.google.com/measurement/conversion?en=affiliate_click&tid=G-BS30YQY1N7&gtm_ee=1', '', ga),
    false,
  )
  assert.equal(shouldDropGoogleCollect(collect('en=page_view&tid=G-BS30YQY1N7&_ee=1'), '', ga), false)
  assert.equal(shouldDropGoogleCollect(collect('en=page_view&tid=G-R3QVBJZ53S&_ee=1'), '', ga), true)
  assert.equal(
    shouldDropGoogleCollect('https://www.google.com/ccm/collect?en=page_view&tid=AW-18052634530', '', ga),
    true,
  )
  assert.equal(
    shouldDropGoogleCollect('https://www.google.com/ccm/collect?en=page_view&tid=AW-10787994850', '', ga),
    true,
  )
  assert.equal(shouldDropGoogleCollect(collect('en=cta_click&tid=G-BS30YQY1N7&_ee=1'), '', ga), false)
  assert.equal(shouldDropGoogleCollect(collect('en=scroll&tid=G-R3QVBJZ53S'), '', ga), false)
  assert.equal(shouldDropGoogleCollect('https://www.qolmedia.info/logo.png', '', ga), false)
  assert.equal(
    shouldDropGoogleCollect('https://analytics.google.com/g/collect?tid=G-BS30YQY1N7', 'en=affiliate_click', ga),
    true,
  )
})
