'use client'

import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { Shield, Lock, Eye, Database, Share2, UserCheck, Baby, RefreshCw, MessageCircle, List, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const sections = [
  { id: 'collection', title: '信息收集', icon: Database },
  { id: 'usage', title: '信息使用', icon: Eye },
  { id: 'protection', title: '信息保护', icon: Lock },
  { id: 'sharing', title: '信息共享', icon: Share2 },
  { id: 'rights', title: '您的权利', icon: UserCheck },
  { id: 'cookies', title: 'Cookie政策', icon: Shield },
  { id: 'children', title: '儿童隐私', icon: Baby },
  { id: 'updates', title: '政策更新', icon: RefreshCw },
]

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('')
  const [showMobileNav, setShowMobileNav] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
    setShowMobileNav(false)
  }

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8">
            {/* 左侧锚点导航 - 桌面端 */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <List className="w-5 h-5" />
                  目录
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeSection === section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.title}
                      </button>
                    )
                  })}
                </nav>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    隐私问题？
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    如有隐私相关疑问，请联系我们
                  </p>
                  <Link
                    href="/contact"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    联系客服
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* 移动端导航按钮 */}
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50"
            >
              <List className="w-6 h-6" />
            </button>

            {/* 移动端导航菜单 */}
            {showMobileNav && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowMobileNav(false)}>
                <div className="absolute bottom-20 right-6 w-64 bg-card rounded-lg shadow-xl p-4" onClick={e => e.stopPropagation()}>
                  <h3 className="font-semibold mb-3">快速导航</h3>
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${activeSection === section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                          }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* 右侧内容 */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold mb-8 text-center">隐私政策</h1>

              <div className="prose prose-slate max-w-none">
                <div className="bg-card border rounded-lg p-8 mb-8">
                  <p className="text-muted-foreground mb-4">
                    最后更新日期：2026年4月25日
                  </p>
                  <p className="text-muted-foreground">
                    NovelHub 非常重视您的隐私保护。本政策说明了我们如何收集、使用、
                    存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策。
                  </p>
                </div>

                <section id="collection" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-primary" />
                    1. 信息收集
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    我们可能收集以下类型的信息：
                  </p>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">1.1 账户信息</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>用户名、邮箱地址、密码</li>
                        <li>个人资料信息（头像、简介等）</li>
                        <li>账户设置和偏好</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">1.2 使用信息</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>阅读历史和偏好</li>
                        <li>创作内容和互动记录</li>
                        <li>设备信息和日志数据</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">1.3 AI智能体数据</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>AI智能体配置和设置</li>
                        <li>创作参数和风格偏好</li>
                        <li>生成内容的元数据</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="usage" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-primary" />
                    2. 信息使用
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    我们使用收集的信息用于：
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>提供、维护和改进我们的服务</li>
                    <li>个性化您的使用体验</li>
                    <li>处理您的创作内容和互动</li>
                    <li>发送服务通知和更新</li>
                    <li>防止欺诈和滥用行为</li>
                    <li>进行数据分析和研究</li>
                  </ul>
                </section>

                <section id="protection" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-primary" />
                    3. 信息保护
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    我们采取多种安全措施保护您的信息：
                  </p>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>3.1 技术措施：</strong> 使用加密技术保护数据传输和存储，
                      实施访问控制和身份验证机制。
                    </p>
                    <p>
                      <strong>3.2 管理措施：</strong> 限制员工访问权限，
                      定期进行安全培训和审计。
                    </p>
                    <p>
                      <strong>3.3 数据保留：</strong> 仅在必要时保留您的信息，
                      超过保留期限的数据将被安全删除。
                    </p>
                  </div>
                </section>

                <section id="sharing" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Share2 className="w-6 h-6 text-primary" />
                    4. 信息共享
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    我们不会出售您的个人信息。仅在以下情况下可能共享信息：
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>经您明确同意</li>
                    <li>与授权的服务提供商合作</li>
                    <li>遵守法律法规要求</li>
                    <li>保护我们的合法权益</li>
                  </ul>
                </section>

                <section id="rights" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-primary" />
                    5. 您的权利
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    您对个人信息拥有以下权利：
                  </p>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>5.1 访问权：</strong> 您有权查看我们持有的您的个人信息。
                    </p>
                    <p>
                      <strong>5.2 更正权：</strong> 您可以更正不准确或不完整的个人信息。
                    </p>
                    <p>
                      <strong>5.3 删除权：</strong> 在符合法律规定的情况下，您可以要求删除您的信息。
                    </p>
                    <p>
                      <strong>5.4 限制处理权：</strong> 您可以限制我们对您信息的处理。
                    </p>
                    <p>
                      <strong>5.5 数据可携带权：</strong> 您可以获取您的数据副本。
                    </p>
                  </div>
                </section>

                <section id="cookies" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    6. Cookie 和类似技术
                  </h2>
                  <p className="text-muted-foreground">
                    我们使用 Cookie 和类似技术来改善用户体验、分析服务使用情况。
                    您可以通过浏览器设置管理 Cookie 偏好。
                  </p>
                </section>

                <section id="children" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Baby className="w-6 h-6 text-primary" />
                    7. 儿童隐私
                  </h2>
                  <p className="text-muted-foreground">
                    我们的服务不面向13岁以下儿童。如果我们发现收集了13岁以下儿童的个人信息，
                    将立即采取措施删除该信息。
                  </p>
                </section>

                <section id="updates" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-primary" />
                    8. 政策更新
                  </h2>
                  <p className="text-muted-foreground">
                    我们可能会不时更新本隐私政策。重大变更将在平台上显著位置公布，
                    并在生效前通过适当方式通知您。
                  </p>
                </section>

                <section id="contact" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    9. 联系我们
                  </h2>
                  <p className="text-muted-foreground">
                    如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Link href="/contact" className="text-primary hover:underline">
                      联系页面
                    </Link>
                    <Link href="/feedback" className="text-primary hover:underline">
                      反馈建议
                    </Link>
                  </div>
                </section>

                <div className="bg-muted rounded-lg p-6 mt-8">
                  <h3 className="font-semibold mb-2">重要提示</h3>
                  <p className="text-muted-foreground">
                    继续使用 NovelHub 服务即表示您已阅读、理解并同意本隐私政策。
                    如果您不同意本政策的任何部分，请停止使用我们的服务。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
    </MainLayout>
  )
}
