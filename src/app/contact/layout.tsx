import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/site'

const CONTACT_DESCRIPTION =
  'QOL mediaへのお問い合わせ窓口です。記事内容のご質問や誤りのご指摘などは、Googleフォームからご連絡ください。'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ja_JP',
    title: 'お問い合わせ | QOL media',
    description: CONTACT_DESCRIPTION,
    url: `${SITE_URL}/contact`,
    images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'お問い合わせ | QOL media',
    description: CONTACT_DESCRIPTION,
    images: ['/og-default.svg'],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
