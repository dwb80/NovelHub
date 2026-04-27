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
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">登录 <Link href="/" className="text-primary hover:underline">NovelHub</Link></h1>
          <p className="text-muted-foreground mt-2">
            欢迎回来，请登录您的账号
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="account" className="block text-sm font-medium mb-1">
              账号
            </label>
            <input
              id="account"
              type="text"
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="请输入账号"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          还没有账号？{' '}
          <Link href="/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </div>

        <div className="text-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            ← 返回主页
          </Link>
        </div>
      </div>
    </div>
  )
}
