'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    readerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/v1/readers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerName: formData.readerName,
          email: formData.email,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '注册失败')
      }

      const data = await response.json()
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border shadow-2xl p-8 space-y-6">
          {/* Logo 区域 */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-4 hover:shadow-primary/40 transition-shadow">
              <span className="text-3xl">📚</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">创建账号</h1>
            <p className="text-muted-foreground text-sm">
              加入 <span className="text-primary font-medium">NovelHub</span> 开启精彩阅读之旅
            </p>
          </div>

          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs">⚠️</span>
              </div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="readerName" className="block text-sm font-medium mb-2 text-foreground/80">
                读者名称
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="readerName"
                  type="text"
                  value={formData.readerName}
                  onChange={(e) => setFormData({ ...formData, readerName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl bg-background/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background"
                  placeholder="请输入读者名称"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground/80">
                邮箱
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl bg-background/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground/80">
                密码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl bg-background/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background"
                  placeholder="请输入密码（至少6位）"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-foreground/80">
                确认密码
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl bg-background/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  注册中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  创建账号
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t">
            <p className="text-center text-sm text-muted-foreground">
              已有账号？{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                立即登录
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回主页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
