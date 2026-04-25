'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { Lightbulb, Bug, Heart, MessageSquare, Send, CheckCircle, Star, Image, X, History, Clock, Check, Loader2, Eye } from 'lucide-react'

interface FeedbackItem {
  id: string
  type: string
  title: string
  content: string
  rating: number
  status: 'pending' | 'processing' | 'resolved' | 'rejected'
  createdAt: string
  images?: string[]
  reply?: string
}

const mockFeedbackHistory: FeedbackItem[] = [
  {
    id: 'FB-001',
    type: 'suggestion',
    title: '建议增加夜间模式',
    content: '希望能增加深色主题，晚上阅读对眼睛更友好',
    rating: 5,
    status: 'resolved',
    createdAt: '2026-04-20',
    reply: '感谢您的建议！夜间模式已在开发计划中，预计下个版本上线。'
  },
  {
    id: 'FB-002',
    type: 'bug',
    title: '评论无法提交',
    content: '在小说详情页点击提交评论后没有反应',
    rating: 3,
    status: 'processing',
    createdAt: '2026-04-22'
  },
  {
    id: 'FB-003',
    type: 'experience',
    title: '界面设计很棒',
    content: '整体设计风格很清新，使用体验很好',
    rating: 5,
    status: 'pending',
    createdAt: '2026-04-24'
  }
]

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    type: 'suggestion',
    rating: 0,
    title: '',
    content: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit')
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ type: 'suggestion', rating: 0, title: '', content: '' })
      setImages([])
    }, 3000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      if (images.length >= 5) return
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const feedbackTypes = [
    { id: 'suggestion', label: '功能建议', icon: Lightbulb },
    { id: 'bug', label: '问题反馈', icon: Bug },
    { id: 'experience', label: '使用体验', icon: Heart },
    { id: 'other', label: '其他', icon: MessageSquare },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    const labels = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
      rejected: '已驳回'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <MainLayout>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">反馈建议</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          您的反馈是我们进步的动力，帮助我们做得更好
        </p>
      </section>

      {/* 标签切换 */}
      <section className="container mx-auto px-4 pb-8">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'submit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            <Send className="w-4 h-4" />
            提交反馈
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border hover:bg-accent'
            }`}
          >
            <History className="w-4 h-4" />
            反馈历史
          </button>
        </div>
      </section>

      {activeTab === 'submit' ? (
        <>
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
                <h2 className="text-2xl font-bold mb-6 text-center">提交您的反馈</h2>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">提交成功！</h3>
                    <p className="text-muted-foreground">感谢您的宝贵反馈，我们会认真考虑您的建议</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 评分 */}
                    <div>
                      <label className="block text-sm font-medium mb-3">整体满意度评分</label>
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
                      <label className="block text-sm font-medium mb-2">标题 *</label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="请简要描述您的反馈..."
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{formData.title.length}/100</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">详细描述 *</label>
                      <textarea
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={6}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="请详细描述您的建议或遇到的问题..."
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{formData.content.length}/1000</p>
                    </div>

                    {/* 截图上传 */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        截图上传 (可选，最多5张)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img src={image} alt={`截图 ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {images.length < 5 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors"
                          >
                            <Image className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">添加图片</span>
                          </button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        支持 JPG、PNG 格式，单张不超过 5MB
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={formData.rating === 0}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      提交反馈
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </>
      ) : (
        /* 反馈历史 */
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">我的反馈历史</h2>
              <span className="text-sm text-muted-foreground">共 {mockFeedbackHistory.length} 条反馈</span>
            </div>
            
            <div className="space-y-4">
              {mockFeedbackHistory.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg bg-card overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedFeedback(expandedFeedback === feedback.id ? null : feedback.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(feedback.status)}
                          <span className="text-sm text-muted-foreground">{feedback.id}</span>
                        </div>
                        <h3 className="font-medium mb-1">{feedback.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {feedback.createdAt}
                          </span>
                          <span className="flex items-center gap-1">
                            {feedbackTypes.find(t => t.id === feedback.type)?.label}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {feedback.rating} 分
                          </span>
                        </div>
                      </div>
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {expandedFeedback === feedback.id && (
                    <div className="px-4 pb-4 border-t bg-muted/30">
                      <div className="pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">反馈内容</h4>
                          <p className="text-sm text-muted-foreground">{feedback.content}</p>
                        </div>
                        
                        {feedback.reply && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-green-700">
                              <Check className="w-4 h-4" />
                              官方回复
                            </h4>
                            <p className="text-sm text-green-700">{feedback.reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

    </MainLayout>
  )
}
