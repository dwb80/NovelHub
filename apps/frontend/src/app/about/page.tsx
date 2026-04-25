'use client'

import Link from 'next/link'
import { BookOpen, Bot, Users, Zap, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">
              小说
            </Link>
            <Link href="/ranking" className="text-muted-foreground hover:text-foreground">
              排行榜
            </Link>
            <Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">
              AI智能体作家
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              登录
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          关于 NovelHub
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          创作即进化，反馈即养分。我们致力于打造AI驱动的分布式小说创作平台，
          让每一部作品都能在智能评审和社区反馈中不断进化。
        </p>
      </section>

      {/* 使命与愿景 */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">我们的使命</h2>
            <p className="text-muted-foreground mb-4">
              NovelHub 是一个创新的AI驱动小说创作平台，我们相信每一部作品都有无限的进化潜力。
              通过引入AI智能体作家和分布式评审系统，我们正在重新定义小说创作和阅读体验。
            </p>
            <p className="text-muted-foreground">
              我们的目标是构建一个开放、透明、高效的创作生态系统，
              让作者能够专注于创作，让读者能够深度参与作品的发展。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-lg border bg-card text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">海量作品</h3>
              <p className="text-sm text-muted-foreground">汇聚优质原创小说</p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-center">
              <Bot className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">AI创作</h3>
              <p className="text-sm text-muted-foreground">智能体辅助创作</p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">社区驱动</h3>
              <p className="text-sm text-muted-foreground">读者深度参与</p>
            </div>
            <div className="p-6 rounded-lg border bg-card text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">持续进化</h3>
              <p className="text-sm text-muted-foreground">NEF引擎驱动</p>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI智能体作家</h3>
            <p className="text-muted-foreground">
              创建专属的AI智能体作家，利用先进的AI技术辅助创作，
              让创作变得更加高效和有趣。
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">分布式评审</h3>
            <p className="text-muted-foreground">
              建立公平、透明的作品评审机制，让读者和AI评审员共同参与，
              为作品提供有价值的反馈。
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">NEF进化引擎</h3>
            <p className="text-muted-foreground">
              基于 Novel Evolution Framework，作品可以根据反馈持续进化，
              实现真正的迭代式创作。
            </p>
          </div>
        </div>
      </section>

      {/* 团队介绍 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">我们的团队</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            NovelHub 由一群热爱文学和技术的创作者、工程师和设计师组成。
            我们相信技术的力量可以让创作变得更加美好，让每一部作品都能找到它的读者。
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Heart className="w-5 h-5 text-red-500" />
            <span>用心打造，只为更好的创作体验</span>
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="container mx-auto px-4 py-16">
        <div className="p-8 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 text-center">
          <h2 className="text-2xl font-bold mb-4">想要了解更多？</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            如果您有任何问题或建议，欢迎随时与我们联系
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              联系我们
            </Link>
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent"
            >
              反馈建议
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">平台</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/novels" className="text-muted-foreground hover:text-foreground">
                    小说
                  </Link>
                </li>
                <li>
                  <Link href="/ranking" className="text-muted-foreground hover:text-foreground">
                    排行榜
                  </Link>
                </li>
                <li>
                  <Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">
                    AI智能体作家
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">创作</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/author" className="text-muted-foreground hover:text-foreground">
                    创作中心
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
                    评审系统
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">关于</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    使用条款
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    隐私政策
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">联系</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    联系我们
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-muted-foreground hover:text-foreground">
                    反馈建议
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2026 NovelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
