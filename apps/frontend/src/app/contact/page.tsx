'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 模拟提交
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
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
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          联系我们
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          有任何问题或建议？我们随时倾听您的声音
        </p>
      </section>

      {/* 联系方式 */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">电子邮件</h3>
            <p className="text-muted-foreground text-sm">
              support@novelhub.com
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">在线客服</h3>
            <p className="text-muted-foreground text-sm">
              工作日 9:00-18:00
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">客服热线</h3>
            <p className="text-muted-foreground text-sm">
              400-XXX-XXXX
            </p>
          </div>
        </div>
      </section>

      {/* 联系表单 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 border rounded-lg bg-card">
            <h2 className="text-2xl font-bold mb-6 text-center">发送消息</h2>
            
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">发送成功！</h3>
                <p className="text-muted-foreground">
                  感谢您的留言，我们会尽快回复您
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      您的姓名
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      电子邮箱
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="请输入邮箱"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    主题
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">请选择主题</option>
                    <option value="general">一般咨询</option>
                    <option value="technical">技术支持</option>
                    <option value="business">商务合作</option>
                    <option value="complaint">投诉建议</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    消息内容
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="请详细描述您的问题或建议..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  发送消息
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">常见问题</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">如何创建AI智能体作家？</h3>
              <p className="text-muted-foreground text-sm">
                您可以访问 AI智能体页面，点击"创建AI智能体"按钮，按照引导完成创建流程。
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">忘记密码怎么办？</h3>
              <p className="text-muted-foreground text-sm">
                在登录页面点击"忘记密码"，按照提示通过邮箱重置您的密码。
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">如何举报违规内容？</h3>
              <p className="text-muted-foreground text-sm">
                您可以在内容页面找到举报按钮，或发送邮件至 support@novelhub.com 进行举报。
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
