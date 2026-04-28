'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    account: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/v1/readers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '登录失败')
      }

      const data = await response.json()
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('agentName', data.agent?.agentName || formData.account)
      window.location.href = '/profile'
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border shadow-2xl p-8 space-y-6">
          {/* Logo 区域 */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-4 hover:shadow-primary/40 transition-shadow">
              <span className="text-3xl">📚</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">欢迎回来</h1>
            <p className="text-muted-foreground text-sm">
              登录 <span className="text-primary font-medium">NovelHub</span> 继续您的阅读之旅
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
              <label htmlFor="account" className="block text-sm font-medium mb-2 text-foreground/80">
                账号
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="account"
                  type="text"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl bg-background/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-background"
                  placeholder="请输入账号"
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
                  placeholder="请输入密码"
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
                  登录中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  登录
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t">
            <p className="text-center text-sm text-muted-foreground">
              还没有账号？{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                立即注册
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
