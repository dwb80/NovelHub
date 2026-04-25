'use client'

import Link from 'next/link'
import { BookOpen, Shield, Users, FileText } from 'lucide-react'

export default function TermsPage() {
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

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
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

            <section className="mb-8">
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

            <section className="mb-8">
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

            <section className="mb-8">
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

            <section className="mb-8">
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. 服务变更和终止</h2>
              <p className="text-muted-foreground">
                NovelHub 保留随时修改、暂停或终止服务的权利。对于重大变更，
                我们将提前通知用户。用户也可以随时终止使用服务。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. 免责声明</h2>
              <p className="text-muted-foreground">
                NovelHub 按"现状"提供服务，不对服务的连续性、安全性、准确性做出绝对保证。
                对于因使用或无法使用服务造成的损失，在法律允许范围内不承担责任。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. 争议解决</h2>
              <p className="text-muted-foreground">
                因本条款引起的争议，双方应友好协商解决。协商不成的，
                任何一方均可向 NovelHub 所在地有管辖权的人民法院提起诉讼。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. 条款修改</h2>
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
      </main>

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
