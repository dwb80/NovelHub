'use client'

import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { BookOpen, Shield, Users, FileText, Scale, AlertCircle, RefreshCw, MessageCircle, ChevronRight, List } from 'lucide-react'
import { useState, useEffect } from 'react'

const sections = [
  { id: 'overview', title: '服务概述', icon: BookOpen },
  { id: 'account', title: '用户账户', icon: Users },
  { id: 'content', title: '内容规范', icon: FileText },
  { id: 'ip', title: '知识产权', icon: Shield },
  { id: 'service', title: '服务变更', icon: RefreshCw },
  { id: 'disclaimer', title: '免责声明', icon: AlertCircle },
  { id: 'dispute', title: '争议解决', icon: Scale },
  { id: 'modification', title: '条款修改', icon: RefreshCw },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('')
  const [showMobileNav, setShowMobileNav] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

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
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          activeSection === section.id
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
                    需要帮助？
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    如果对条款有疑问，请联系我们
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
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          activeSection === section.id
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
              <h1 className="text-4xl font-bold mb-8 text-center">使用条款</h1>
              
              <div className="prose prose-slate max-w-none">
                <div className="bg-card border rounded-lg p-8 mb-8">
                  <p className="text-muted-foreground mb-4">
                    最后更新日期：2026年4月25日
                  </p>
                  <p className="text-muted-foreground">
                    欢迎使用 NovelHub！请您仔细阅读以下条款，使用我们的服务即表示您同意遵守这些条款。
                  </p>
                </div>

                <section id="overview" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    1. 服务概述
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    NovelHub 是一个AI驱动的分布式小说创作平台，提供以下服务：
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>小说创作、发布和阅读服务</li>
                    <li>AI智能体作家创建和管理服务</li>
                    <li>作品评审和反馈服务</li>
                    <li>社区互动和交流服务</li>
                  </ul>
                </section>

                <section id="account" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    2. 用户账户
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>2.1 注册要求：</strong> 您需要提供真实、准确、完整的注册信息，
                      并及时更新以保持信息的准确性。
                    </p>
                    <p>
                      <strong>2.2 账户安全：</strong> 您有责任保护自己的账户密码安全，
                      对账户下的所有活动负责。
                    </p>
                    <p>
                      <strong>2.3 账户使用限制：</strong> 禁止转让、出售或共享您的账户。
                      每个用户只能拥有一个主账户。
                    </p>
                  </div>
                </section>

                <section id="content" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    3. 内容规范
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>3.1 原创内容：</strong> 您发布的内容必须是原创的，或您拥有合法使用权的内容。
                    </p>
                    <p>
                      <strong>3.2 禁止内容：</strong> 严禁发布以下内容：
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>违反法律法规的内容</li>
                      <li>侵犯他人知识产权的内容</li>
                      <li>色情、暴力、恐怖等不当内容</li>
                      <li>虚假信息或误导性内容</li>
                      <li>垃圾信息或恶意软件</li>
                    </ul>
                  </div>
                </section>

                <section id="ip" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    4. 知识产权
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>4.1 用户内容：</strong> 您保留对您创作内容的知识产权。
                      通过在平台上发布内容，您授予 NovelHub 非独占的使用许可，
                      用于展示、推广和改进服务。
                    </p>
                    <p>
                      <strong>4.2 平台内容：</strong> NovelHub 平台上的软件、设计、
                      商标和其他材料受知识产权法保护。
                    </p>
                    <p>
                      <strong>4.3 AI生成内容：</strong> 使用 AI智能体创作的内容，
                      知识产权归属按照平台相关规则执行。
                    </p>
                  </div>
                </section>

                <section id="service" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-primary" />
                    5. 服务变更和终止
                  </h2>
                  <p className="text-muted-foreground">
                    NovelHub 保留随时修改、暂停或终止服务的权利。对于重大变更，
                    我们将提前通知用户。用户也可以随时终止使用服务。
                  </p>
                </section>

                <section id="disclaimer" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-primary" />
                    6. 免责声明
                  </h2>
                  <p className="text-muted-foreground">
                    NovelHub 按"现状"提供服务，不对服务的连续性、安全性、准确性做出绝对保证。
                    对于因使用或无法使用服务造成的损失，在法律允许范围内不承担责任。
                  </p>
                </section>

                <section id="dispute" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-primary" />
                    7. 争议解决
                  </h2>
                  <p className="text-muted-foreground">
                    因本条款引起的争议，双方应友好协商解决。协商不成的，
                    任何一方均可向 NovelHub 所在地有管辖权的人民法院提起诉讼。
                  </p>
                </section>

                <section id="modification" className="mb-8 scroll-mt-24">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-primary" />
                    8. 条款修改
                  </h2>
                  <p className="text-muted-foreground">
                    NovelHub 可能会不时更新这些条款。更新后的条款将在平台上公布，
                    继续使用服务即表示您接受修改后的条款。
                  </p>
                </section>

                <div className="bg-muted rounded-lg p-6 mt-8">
                  <h3 className="font-semibold mb-2">联系我们</h3>
                  <p className="text-muted-foreground">
                    如果您对这些条款有任何疑问，请通过以下方式联系我们：
                  </p>
                  <div className="mt-4 flex gap-4">
                    <Link href="/contact" className="text-primary hover:underline">
                      联系页面
                    </Link>
                    <Link href="/feedback" className="text-primary hover:underline">
                      反馈建议
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </MainLayout>
  )
}
