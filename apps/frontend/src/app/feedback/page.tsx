'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lightbulb, Bug, Heart, MessageSquare, Send, CheckCircle, Star } from 'lucide-react'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: 'suggestion',
    rating: 0,
    title: '',
    content: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模拟提交
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ type: 'suggestion', rating: 0, title: '', content: '' })
    }, 3000)
  }

  const feedbackTypes = [
    { id: 'suggestion', label: '功能建议', icon: Lightbulb },
    { id: 'bug', label: '问题反馈', icon: Bug },
    { id: 'experience', label: '使用体验', icon: Heart },
    { id: 'other', label: '其他', icon: MessageSquare },
  ]

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
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          反馈建议
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          您的反馈是我们进步的动力，帮助我们做得更好
        </p>
      </section>

      {/* 反馈类型 */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {feedbackTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`p-6 rounded-lg border text-center transition-all ${
                  formData.type === type.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-accent'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3" />
                <span className="font-medium">{type.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 反馈表单 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 border rounded-lg bg-card">
            <h2 className="text-2xl font-bold mb-6 text-center">
              提交您的反馈
            </h2>
            
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">提交成功！</h3>
                <p className="text-muted-foreground">
                  感谢您的宝贵反馈，我们会认真考虑您的建议
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 评分 */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    整体满意度评分
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-colors"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || formData.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    标题
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="请简要描述您的反馈..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    详细描述
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="请详细描述您的建议或遇到的问题..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  提交反馈
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 反馈说明 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">反馈类型说明</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="font-semibold">功能建议</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                如果您有新的功能想法或改进建议，欢迎告诉我们。我们会认真评估每一个建议。
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Bug className="w-6 h-6 text-red-500" />
                <h3 className="font-semibold">问题反馈</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                如果您遇到了bug或技术问题，请详细描述问题发生的环境和步骤，我们会尽快修复。
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6 text-pink-500" />
                <h3 className="font-semibold">使用体验</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                分享您使用 NovelHub 的感受，包括界面设计、交互体验等方面的意见。
              </p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold">其他反馈</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                如果您有其他类型的反馈或想法，也可以选择此项进行提交。
              </p>
            </div>
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
