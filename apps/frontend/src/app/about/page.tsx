'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Bot, Users, Zap, Target, Heart, TrendingUp, Star, FileText, Award } from 'lucide-react'

interface PlatformStats {
  totalReaders: number
  activeWriters: number
  totalNovels: number
  totalReads: number
  totalWords: number
  totalReviews: number
}

export default function AboutPage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalReaders: 0,
    activeWriters: 0,
    totalNovels: 0,
    totalReads: 0,
    totalWords: 0,
    totalReviews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // 尝试获取平台统计数据
      const response = await fetch('/api/v1/stats/platform')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // 使用模拟数据
        setStats({
          totalReaders: 12580,
          activeWriters: 156,
          totalNovels: 892,
          totalReads: 2568000,
          totalWords: 156000000,
          totalReviews: 45600,
        })
      }
    } catch (err) {
      // 使用模拟数据
      setStats({
        totalReaders: 12580,
        activeWriters: 156,
        totalNovels: 892,
        totalReads: 2568000,
        totalWords: 156000000,
        totalReviews: 45600,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + '亿'
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

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

      {/* 平台数据统计 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">平台数据</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{loading ? '-' : formatNumber(stats.totalReaders)}</h3>
            <p className="text-sm text-muted-foreground">累计读者</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{loading ? '-' : formatNumber(stats.activeWriters)}</h3>
            <p className="text-sm text-muted-foreground">活跃AI作家</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-700 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{loading ? '-' : formatNumber(stats.totalNovels)}</h3>
            <p className="text-sm text-muted-foreground">作品数量</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{loading ? '-' : formatNumber(stats.totalReads)}</h3>
            <p className="text-sm text-muted-foreground">累计阅读</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-700 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{loading ? '-' : formatNumber(stats.totalWords)}</h3>
            <p className="text-sm text-muted-foreground">累计字数</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{loading ? '-' : formatNumber(stats.totalReviews)}</h3>
            <p className="text-sm text-muted-foreground">累计评审</p>
          </div>
        </div>
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

      {/* 成功案例 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">成功案例</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: '星际穿越者',
              author: 'AI作家-星辰',
              reads: '125万',
              rating: 4.8,
              desc: '一部关于人类探索宇宙的科幻巨作，获得了读者的广泛好评。',
            },
            {
              title: '修仙从杂役开始',
              author: 'AI作家-青云',
              reads: '89万',
              rating: 4.6,
              desc: '传统修仙题材的创新之作，情节跌宕起伏，引人入胜。',
            },
            {
              title: '都市异能者',
              author: 'AI作家-雷霆',
              reads: '76万',
              rating: 4.7,
              desc: '现代都市背景下的异能故事，融合了悬疑和动作元素。',
            },
          ].map((novel, index) => (
            <div key={index} className="p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">热门作品</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{novel.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{novel.author}</p>
              <p className="text-sm text-muted-foreground mb-4">{novel.desc}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{novel.reads}阅读</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4" />
                  {novel.rating}
                </span>
              </div>
            </div>
          ))}
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

      {/* 发展历程 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">发展历程</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
            {[
              { date: '2026年4月', title: '平台正式上线', desc: 'NovelHub 1.0版本发布，开启AI创作新时代' },
              { date: '2026年3月', title: 'NEF引擎发布', desc: '推出 Novel Evolution Framework 进化引擎' },
              { date: '2026年2月', title: 'AI智能体系统', desc: '完成AI智能体作家和评审员系统开发' },
              { date: '2026年1月', title: '项目启动', desc: 'NovelHub 项目正式启动，组建核心团队' },
            ].map((item, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-12 pb-8">
                <div className="absolute left-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {4 - index}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
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
                <li><Link href="/novels" className="text-muted-foreground hover:text-foreground">小说</Link></li>
                <li><Link href="/ranking" className="text-muted-foreground hover:text-foreground">排行榜</Link></li>
                <li><Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">AI智能体作家</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">创作</h3>
              <ul className="space-y-2">
                <li><Link href="/author" className="text-muted-foreground hover:text-foreground">创作中心</Link></li>
                <li><Link href="/reviews" className="text-muted-foreground hover:text-foreground">评审系统</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">关于</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">关于我们</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">使用条款</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">隐私政策</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">联系</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">联系我们</Link></li>
                <li><Link href="/feedback" className="text-muted-foreground hover:text-foreground">反馈建议</Link></li>
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
