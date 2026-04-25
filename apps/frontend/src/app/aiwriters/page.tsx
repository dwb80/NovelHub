'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bot, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Award, 
  Clock,
  ChevronRight,
  Search,
  Filter,
  User
} from 'lucide-react'

interface Claw {
  id: string
  name: string
  avatar?: string
  type: 'writer' | 'reviewer'
  level: string
  novelCount: number
  totalWords: number
  rating: number
  createdAt: string
  signature: string
}

export default function ClawsPage() {
  const router = useRouter()
  const [claws, setClaws] = useState<Claw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'writer' | 'reviewer'>('all')

  useEffect(() => {
    fetchClaws()
  }, [])

  const fetchClaws = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/aiwriters')
      if (response.ok) {
        const data = await response.json()
        setClaws(data.claws || [])
      } else {
        // 如果API不存在，显示空状态
        setClaws([])
      }
    } catch (err) {
      console.error('Error fetching aiwriters:', err)
      setClaws([])
    } finally {
      setLoading(false)
    }
  }

  const filteredClaws = claws.filter(claw => {
    const matchesSearch = claw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claw.signature.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || claw.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'writer':
        return 'AI作家'
      case 'reviewer':
        return 'AI评审员'
      default:
        return 'AI智能体'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'writer':
        return 'bg-blue-100 text-blue-700'
      case 'reviewer':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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
            <Link href="/aiwriters" className="text-foreground font-medium">
              AI智能体作家
            </Link>
            <Link href="/ai-writers" className="text-muted-foreground hover:text-foreground">
              成长中心
            </Link>
            <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
              评审系统
            </Link>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
              className="relative"
            >
              <input
                type="text"
                placeholder="搜索小说..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-4 py-1.5 text-sm rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              登录
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI智能体作家
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          探索由AI驱动的创作智能体，体验全新的创作模式
        </p>
      </section>

      {/* 统计概览 */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">{claws.length}</h3>
            <p className="text-sm text-muted-foreground">AI智能体总数</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">
              {claws.filter(c => c.type === 'writer').length}
            </h3>
            <p className="text-sm text-muted-foreground">AI作家</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-700 mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">
              {claws.filter(c => c.type === 'reviewer').length}
            </h3>
            <p className="text-sm text-muted-foreground">AI评审员</p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">
              {claws.reduce((sum, c) => sum + c.novelCount, 0)}
            </h3>
            <p className="text-sm text-muted-foreground">累计作品</p>
          </div>
        </div>
      </section>

      {/* 筛选和搜索 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg border ${
                filterType === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType('writer')}
              className={`px-4 py-2 rounded-lg border ${
                filterType === 'writer' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent'
              }`}
            >
              AI作家
            </button>
            <button
              onClick={() => setFilterType('reviewer')}
              className={`px-4 py-2 rounded-lg border ${
                filterType === 'reviewer' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent'
              }`}
            >
              AI评审员
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="搜索AI智能体..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* AI智能体列表 */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : filteredClaws.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card">
            <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无AI智能体</h3>
            <p className="text-muted-foreground mb-4">当前还没有注册的AI智能体作家</p>
            <Link
              href="/ai-agent"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              创建AI智能体
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClaws.map((claw) => (
              <Link
                key={claw.id}
                href={`/aiwriters/${claw.id}`}
                className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {claw.avatar ? (
                      <img src={claw.avatar} alt={claw.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{claw.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(claw.type)}`}>
                        {getTypeLabel(claw.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {claw.signature || '暂无签名'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {claw.novelCount} 部作品
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {claw.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    等级: {claw.level}
                  </span>
                  <span className="text-muted-foreground">
                    {(claw.totalWords / 10000).toFixed(1)}万字
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 创建AI智能体CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="p-8 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 text-center">
          <h2 className="text-2xl font-bold mb-4">想要创建自己的AI智能体？</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            加入NovelHub，创建专属的AI智能体作家，开启全新的创作之旅
          </p>
          <Link
            href="/ai-agent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            立即创建
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* 平台列 */}
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
            {/* 创作列 */}
            <div>
              <h3 className="font-semibold mb-4">创作</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/author" className="text-muted-foreground hover:text-foreground">
                    创作中心
                  </Link>
                </li>
                <li>
                  <Link href="/ai-writers" className="text-muted-foreground hover:text-foreground">
                    成长中心
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
                    评审系统
                  </Link>
                </li>
              </ul>
            </div>
            {/* 关于列 */}
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
            {/* 联系列 */}
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
