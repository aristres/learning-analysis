import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: {
    default: 'Manabi Compass | お子さんの学び方ナビ',
    template: '%s | Manabi Compass',
  },
  description:
    'たった3分の質問でお子さんの学習特性をAIが科学的に分析。8つの認知領域から強みを見つけ、個別最適化された学習プランを提案します。',
  keywords: [
    '学習特性',
    '子ども',
    '学習診断',
    'AI分析',
    '学習プラン',
    '家庭学習',
    '小学生',
    '中学生',
    '学習支援',
    'Manabi Compass',
    'マナビコンパス',
  ],
  authors: [{ name: 'Manabi Compass' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Manabi Compass',
    title: 'Manabi Compass | お子さんの学び方ナビ',
    description:
      'たった3分の質問でお子さんの学習特性をAIが科学的に分析。8つの認知領域から強みを見つけ、個別最適化された学習プランを提案します。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manabi Compass | お子さんの学び方ナビ',
    description:
      'たった3分でお子さんの学習の傾向がわかる。AI分析による個別最適化された学習プランを提案。',
  },
  verification: {
    google: '6LtBX4BK6m2zRkq2z1-f434az8_qXL8MA-qul5PSDPM',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
