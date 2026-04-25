import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export default function MainLayout({ children, className = '' }: MainLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-background to-muted ${className}`}>
      {/* 上：头部导航 */}
      <Navbar />

      {/* 中：主体内容区 - 自动撑开占满剩余空间 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 下：底部页脚 */}
      <Footer />
    </div>
  )
}
