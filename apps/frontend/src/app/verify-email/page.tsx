'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('正在验证邮箱...')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('无效的验证链接')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/v1/readers/verify-email?token=${token}`, {
          method: 'GET'
        })

        if (response.ok) {
          const data = await response.json()
          setMessage(data.message || '邮箱验证成功')
        } else {
          const errorData = await response.json().catch(() => ({}))
          setError(errorData.message || '验证失败')
        }
      } catch (err) {
        setError('网络错误，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const handleRedirect = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">邮箱验证</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">正在验证邮箱...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-destructive bg-destructive/10 rounded">
            <p className="text-center">{error}</p>
          </div>
        ) : (
          <div className="p-4 text-success bg-success/10 rounded">
            <p className="text-center">{message}</p>
          </div>
        )}

        <div className="text-center space-y-4">
          <button
            onClick={handleRedirect}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            去登录
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary/5"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}