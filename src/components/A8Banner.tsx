'use client'

// Official A8 banner HTML is inserted unchanged. Plain <img>, not next/image.
// This stays a client component so dangerouslySetInnerHTML is created here,
// not serialized from a server component into ArticleAffiliateClicks.
export function A8Banner({ html }: { html: string }) {
  return (
    <div className="a8-banner-slot">
      <p className="a8-banner-pr">PR・広告</p>
      <div className="a8-banner" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
