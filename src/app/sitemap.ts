import fs from 'fs'
import path from 'path'
import type { MetadataRoute } from 'next'
import { latestYmd, ymd } from '@/lib/content-dates'
import { getAllPosts } from '@/lib/posts'
import { ABOUT_UPDATED, CONTACT_UPDATED, HC_CLUSTER_POSTS, PET_CLUSTER_POSTS, PRIVACY_UPDATED } from '@/lib/site'

function getSiteUrl(): string {
  return 'https://www.qolmedia.info'
}

function readHtmlDateModified(fileName: string): string | undefined {
  const html = fs.readFileSync(path.join(process.cwd(), 'public', fileName), 'utf8')
  return ymd(html.match(/"dateModified"\s*:\s*"([^"]+)"/)?.[1])
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const posts = getAllPosts()

  const factoring = readHtmlDateModified('factoring-lp.html')
  const hcGuide = readHtmlDateModified('hc-guide.html')
  const sleepGuide = readHtmlDateModified('sleep-guide.html')
  const petLp = readHtmlDateModified('pet-lp.html')

  const latestByCategory = new Map<string, string>()
  for (const post of posts) {
    const day = ymd(post.updated || post.date)
    if (!day) continue
    const prev = latestByCategory.get(post.category)
    if (!prev || day > prev) latestByCategory.set(post.category, day)
  }

  const home = latestYmd([
    ...posts.map(post => ymd(post.updated || post.date)),
    factoring,
    hcGuide,
    sleepGuide,
    petLp,
    ABOUT_UPDATED,
    PRIVACY_UPDATED,
    CONTACT_UPDATED,
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    entry(`${siteUrl}/`, home, 'daily', 1),
    // public/ 配下の静的LPはNext.jsのルート自動検出に含まれないため明示する
    entry(`${siteUrl}/factoring-lp.html`, factoring, 'weekly', 0.8),
    entry(`${siteUrl}/hc-guide.html`, hcGuide, 'weekly', 0.9),
    entry(`${siteUrl}/sleep-guide.html`, sleepGuide, 'weekly', 0.8),
    entry(`${siteUrl}/pet-lp.html`, petLp, 'weekly', 0.85),
    entry(`${siteUrl}/pet`, latestByCategory.get('ペット'), 'daily', 0.8),
    entry(`${siteUrl}/health`, latestByCategory.get('健康'), 'daily', 0.8),
    entry(`${siteUrl}/life`, latestByCategory.get('暮らし'), 'daily', 0.8),
    entry(`${siteUrl}/sleep`, latestByCategory.get('睡眠'), 'daily', 0.8),
    entry(`${siteUrl}/about`, ABOUT_UPDATED, 'monthly', 0.3),
    entry(`${siteUrl}/privacy`, PRIVACY_UPDATED, 'monthly', 0.3),
    entry(`${siteUrl}/contact`, CONTACT_UPDATED, 'monthly', 0.3),
  ]

  const hcClusterSlugs = new Set<string>(HC_CLUSTER_POSTS.map(item => item.slug))
  const petClusterSlugs = new Set<string>(PET_CLUSTER_POSTS.map(item => item.slug))

  const postRoutes: MetadataRoute.Sitemap = posts.map(post => entry(
    `${siteUrl}/posts/${post.slug}`,
    ymd(post.updated || post.date),
    'weekly',
    hcClusterSlugs.has(post.slug)
      ? 0.85
      : post.slug === 'suimin-supplement-ranking-2026'
        ? 0.8
        : post.slug === 'heartworm-medicine-cheapest-ranking'
          || post.slug === 'wannyan-bestseller-ranking'
          || post.slug === 'dog-flea-tick-medicine-compare'
          || post.slug === 'parasite-medicine-recommend-ranking'
          ? 0.8
          : petClusterSlugs.has(post.slug)
            ? 0.7
            : 0.6,
  ))

  return [...staticRoutes, ...postRoutes]
}

function entry(
  url: string,
  lastModified: string | undefined,
  changeFrequency: 'daily' | 'weekly' | 'monthly',
  priority: number,
): MetadataRoute.Sitemap[number] {
  return lastModified
    ? { url, lastModified, changeFrequency, priority }
    : { url, changeFrequency, priority }
}
