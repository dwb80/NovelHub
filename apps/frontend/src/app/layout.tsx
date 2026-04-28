import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NovelHub - 小说阅读平台',
  description: '发现精彩小说，开启阅读之旅',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
