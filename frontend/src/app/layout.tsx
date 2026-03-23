import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Fitto — 配慮マッチングプラットフォーム',
    template: '%s | Fitto',
  },
  description: '身体障害のある方と、配慮ある職場をつなぐマッチングサービス。あなたに合った働き方を一緒に見つけましょう。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--cream)', color: 'var(--ink)' }}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
