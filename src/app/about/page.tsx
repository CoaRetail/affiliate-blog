import type { Metadata } from 'next'
import Link from 'next/link'
import { ABOUT_UPDATED } from '@/lib/site'

function jaDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

export const metadata: Metadata = {
  title: '運営について | QOL media',
  description: 'QOL mediaの運営方針・サイト概要についてご説明します。',
  robots: { index: false, follow: false },
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 20px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none' }}>← トップに戻る</Link>
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>運営について</h1>
      <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '40px' }}>最終更新日：{jaDate(ABOUT_UPDATED)}</p>

      <div style={{ fontSize: '15px', lineHeight: '1.9', color: '#374151' }}>

        <Section title="サイト概要">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            {[
              ['サイト名', 'QOL media'],
              ['URL', 'https://www.qolmedia.info'],
              ['コンセプト', 'QOL（生活の質）を高める情報をわかりやすく届けるメディア'],
              ['主なテーマ', 'ペットケア・睡眠・健康・暮らし'],
              ['開設', '2026年3月'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px 10px 0', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap', width: '30%' }}>{label}</td>
                <td style={{ padding: '10px 0' }}>{value}</td>
              </tr>
            ))}
          </table>
        </Section>

        <Section title="運営者情報">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            {[
              ['運営者', 'QOL media（組織名。個人の監修者・著者は置いていません）'],
              ['運営会社', '合同会社コア・リテール'],
              ['所在地', '東京都港区麻布十番1-2-7 ラフィネ麻布十番7F'],
              ['設立', '2018年2月'],
              ['事業内容', 'デジタルマーケティング・コンテンツ制作'],
              ['お問い合わせ', 'contact'],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px 10px 0', fontWeight: '600', color: '#6b7280', whiteSpace: 'nowrap', width: '30%' }}>{label}</td>
                <td style={{ padding: '10px 0' }}>
                  {label === 'お問い合わせ'
                    ? <Link href="/contact" style={{ color: '#2563eb' }}>お問い合わせフォームはこちら</Link>
                    : value}
                </td>
              </tr>
            ))}
          </table>
        </Section>

        <Section title="サイトの方針">
          <p>QOL mediaは、読者が日々の生活の質を少しでも上げるための情報を、わかりやすく、確認できる形で届けることを目的としています。</p>
          <ul style={{ paddingLeft: '24px', margin: '12px 0' }}>
            <li style={{ marginBottom: '8px' }}>書いた内容は、確認できる情報と、確認した日が分かるようにします。</li>
            <li style={{ marginBottom: '8px' }}>アフィリエイトリンクを含む記事には、冒頭のPR表記を残します。</li>
            <li style={{ marginBottom: '8px' }}>記事の結論は、広告報酬の有無では決めません。</li>
            <li style={{ marginBottom: '8px' }}>効能の保証、根拠のない数字、「最強」「確実」「100%」といった言い切りは使いません。</li>
          </ul>
        </Section>

        <Section title="情報源の考え方">
          <p>ペットの薬の記事では、対象動物、タイプ、対象の寄生虫を、販売ページの表示と添付文書などの公開情報から確認できる範囲で書きます。リポジトリに記載がない対象や価格は足しません。</p>
          <p>各ペット記事には、確認日と出典の行を置きます。確認日は、その記事の改訂日（frontmatterのupdated）です。改訂日がない記事は公開日（date）です。</p>
          <p>動物用医薬品は、獣医師の処方、投与前の検査、使用前の獣医師への相談が必要です。このサイトの文章は診断や処方の代わりではありません。効果や安全性は保証しません。</p>
          <p>著者と監修は、組織名のQOL mediaです。実在の確認ができない個人名は出しません。</p>
        </Section>

        <Section title="広告（アフィリエイト）方針">
          <p>当サイトはアフィリエイトプログラムに参加しており、紹介した商品・サービスの購入により報酬を得ることがあります。</p>
          <p>広告を含む記事には、冒頭に「PR・広告を含む記事です」と書きます。報酬があることを理由に、効能を保証したり、人気や安全性を断定したりはしません。</p>
          <p>リンク先の在庫と料金は変動します。金額の最終確認は、各販売ページで行ってください。</p>
        </Section>

        <Section title="更新方針">
          <p>文章を改めた日を、記事の frontmatter の updated に書きます。updated がない記事は、公開日の date をその記事の日付として扱います。</p>
          <p>sitemap.xml の lastmod は、その日付を使います。ビルドした日を、全ページに同じ日付として入れません。</p>
          <p>価格は変わるため、確認していない金額は記事に固定しません。ペット記事の商品情報を直したときは、確認日をその改訂日に更新します。</p>
        </Section>

        <Section title="免責事項">
          <p>当サイトの情報は可能な限り正確を期していますが、内容の完全性・正確性を保証するものではありません。掲載情報を参考にした行動により生じた損害について、当サイトは一切の責任を負いません。</p>
          <p>特に医療・健康・ペットの治療に関する情報は参考情報であり、具体的な判断は必ず専門家（医師・獣医師等）にご相談ください。</p>
        </Section>

        <Section title="お問い合わせ">
          <p>ご意見・ご質問・記事内容の誤りのご指摘は、お問い合わせページまたは下記メールアドレスよりご連絡ください。</p>
          <p style={{ marginTop: '12px' }}>
            <Link href="/contact" style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: '600', padding: '10px 24px', borderRadius: '6px', textDecoration: 'none' }}>
              お問い合わせフォームはこちら
            </Link>
          </p>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #f3f4f6' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
