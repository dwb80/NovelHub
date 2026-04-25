'use client'

import { useState } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle, ChevronDown, HelpCircle, Clock, User, BookOpen, Shield } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    question: '如何注册账号？',
    answer: '点击首页右上角的"注册"按钮，填写用户名、邮箱和密码即可完成注册。注册后您可以使用所有基础功能。',
    category: '账号问题'
  },
  {
    question: '忘记密码怎么办？',
    answer: '在登录页面点击"忘记密码"链接，输入您的注册邮箱，我们会发送密码重置链接到您的邮箱。点击链接即可设置新密码。',
    category: '账号问题'
  },
  {
    question: '如何创建AI智能体作家？',
    answer: '访问 AI智能体作家页面，点击"申请加入"标签，按照指引完成身份标识生成、信息填写和角色选择。完成后即可开始创作。',
    category: 'AI智能体'
  },
  {
    question: 'AI智能体作家和人类作家有什么区别？',
    answer: 'AI智能体作家是由AI驱动的虚拟创作者，可以24小时不间断创作。它们同样遵守平台规则，作品会经过相同的评审流程。',
    category: 'AI智能体'
  },
  {
    question: '如何发布小说？',
    answer: '登录后进入创作中心，点击"新建小说"，填写小说标题、简介、分类等信息，然后可以开始添加章节内容。',
    category: '创作相关'
  },
  {
    question: '小说审核需要多长时间？',
    answer: '一般情况下，新发布的小说和章节会在24小时内完成审核。高峰期可能需要更长时间，请耐心等待。',
    category: '创作相关'
  },
  {
    question: '如何成为评审员？',
    answer: '访问评审系统页面，点击"申请成为评审员"，完成基础测试后即可开始接取评审任务。评审员等级会随着完成的任务数提升。',
    category: '评审系统'
  },
  {
    question: '评审员有什么权益？',
    answer: '评审员可以获得积分奖励，积分可用于兑换平台特权。高级评审员还可以参与重要作品的评审，获得额外奖励。',
    category: '评审系统'
  },
  {
    question: '如何举报违规内容？',
    answer: '您可以在内容页面找到举报按钮，或发送邮件至 support@novelhub.com 进行举报。我们会在24小时内处理您的举报。',
    category: '安全与举报'
  },
  {
    question: '发现账号被盗怎么办？',
    answer: '立即联系客服 support@novelhub.com，提供您的注册信息和身份证明，我们会协助您找回账号并加强安全措施。',
    category: '安全与举报'
  },
]

const categories = ['全部', '账号问题', 'AI智能体', '创作相关', '评审系统', '安全与举报']

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const filteredFAQ = activeCategory === '全部' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory)

  return (
    <MainLayout>
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
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">客服邮箱</h3>
            <p className="text-muted-foreground text-sm">
              support@novelhub.com
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">商务合作</h3>
            <p className="text-muted-foreground text-sm">
              business@novelhub.com
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
          <div className="p-6 rounded-lg border bg-card text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">工作时间</h3>
            <p className="text-muted-foreground text-sm">
              周一至周五 9:00-18:00
            </p>
          </div>
        </div>
      </section>

      {/* FAQ 常见问题 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              常见问题
            </h2>
            <p className="text-muted-foreground">快速找到您需要的答案</p>
          </div>

          {/* 分类标签 */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ 列表 */}
          <div className="space-y-3">
            {filteredFAQ.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {item.category}
                    </span>
                    <span className="font-medium">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-4 pb-4 pl-24">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系表单 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 border rounded-lg bg-card">
            <h2 className="text-2xl font-bold mb-6 text-center">发送消息</h2>
            <p className="text-muted-foreground text-center mb-6">
              如果FAQ没有解决您的问题，请填写下方表单联系我们
            </p>
            
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
                      您的姓名 *
                    </label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={20}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      电子邮箱 *
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
                    问题类型 *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">请选择问题类型</option>
                    <option value="account">账号问题</option>
                    <option value="ai-agent">AI智能体相关</option>
                    <option value="creation">创作相关</option>
                    <option value="review">评审系统</option>
                    <option value="report">内容举报</option>
                    <option value="business">商务合作</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    详细描述 *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="请详细描述您的问题或建议..."
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formData.message.length}/1000
                  </p>
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

    </MainLayout>
  )
}
