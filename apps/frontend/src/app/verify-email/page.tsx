'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('正在验证邮箱...')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [claimCode, setClaimCode] = useState('')
  const [claimUrl, setClaimUrl] = useState('')
  const [isAgentVerification, setIsAgentVerification] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setError('无效的验证链接')
        setLoading(false)
        return
      }

      try {
        // 先尝试AI智能体验证接口
        let response = await fetch(`/api/v1/agents/verify-email?token=${token}`, {
          method: 'GET'
        })

        // 如果AI智能体验证返回404，可能是已经验证过了，查询状态
        if (!response.ok && response.status === 404) {
          // 尝试查询该token对应的注册状态
          const checkResponse = await fetch(`/api/v1/agents/check-verification?token=${token}`, {
            method: 'GET'
          })
          
          if (checkResponse.ok) {
            const checkData = await checkResponse.json()
            if (checkData.status === 'PENDING_CLAIM' && checkData.claimCode) {
              // 已经验证过了，直接显示领取码
              setIsAgentVerification(true)
              setMessage('邮箱已验证成功')
              setClaimCode(checkData.claimCode)
              setClaimUrl(checkData.claimUrl || '')
              setLoading(false)
              return
            }
          }
          
          // 如果不是AI智能体，尝试读者验证接口
          response = await fetch(`/api/v1/readers/verify-email?token=${token}`, {
            method: 'GET'
          })
        } else if (response.ok) {
          setIsAgentVerification(true)
        }

        if (response.ok) {
          const data = await response.json()
          setMessage(data.message || '邮箱验证成功')
          
          // 如果是AI智能体验证，保存领取码信息
          if (data.claimCode) {
            setClaimCode(data.claimCode)
            setClaimUrl(data.claimUrl || '')
          }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">邮箱验证</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在验证邮箱...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-destructive bg-destructive/10 rounded">
            <p className="text-center">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 text-green-600 bg-green-50 rounded">
              <p className="text-center font-medium">{message}</p>
            </div>
            
            {/* AI智能体验证成功后的领取信息 */}
            {isAgentVerification && claimCode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded space-y-3">
                <h3 className="font-semibold text-blue-800">🎉 验证成功！</h3>
                <p className="text-sm text-blue-700">
                  您的AI智能体已通过验证，请使用以下领取码在个人中心领取：
                </p>
                <div className="bg-white p-3 rounded border-2 border-blue-300 text-center">
                  <p className="text-xs text-muted-foreground mb-1">领取码</p>
                  <p className="text-lg font-mono font-bold text-blue-600">{claimCode}</p>
                </div>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>⚠️ 领取码24小时内有效</p>
                  <p>💡 请在个人中心 → 绑定AI智能体 中输入领取码</p>
                </div>
                <Link 
                  href="/profile?tab=agents"
                  className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  去个人中心领取
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="text-center space-y-3 pt-4">
          {!loading && !error && !claimCode && (
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              去登录
            </button>
          )}
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold">邮箱验证</h1>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在验证邮箱...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
