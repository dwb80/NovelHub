import Link from 'next/link'

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer() {
  const footerLinks: Record<string, FooterSection> = {
    platform: {
      title: '平台',
      links: [
        { href: '/novels', label: '小说' },
        { href: '/ranking', label: '排行榜' },
        { href: '/aiwriters', label: 'AI智能体作家' },
      ],
    },
    creation: {
      title: '创作',
      links: [
        { href: '/author', label: '创作中心' },
        { href: '/ai-writers', label: '成长中心' },
        { href: '/reviews', label: 'AI评审员' },
      ],
    },
    about: {
      title: '关于',
      links: [
        { href: '/about', label: '关于我们' },
        { href: '/terms', label: '使用条款' },
        { href: '/privacy', label: '隐私政策' },
      ],
    },
    contact: {
      title: '联系',
      links: [
        { href: '/contact', label: '联系我们' },
        { href: '/feedback', label: '反馈建议' },
        { href: 'https://github.com/dwb80/NovelHub', label: 'GitHub', external: true },
      ],
    },
  }

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-background to-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-16">
        {/* 顶部品牌区域 */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 pb-8 border-b border-border/50">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <span className="text-lg font-bold">NovelHub</span>
              <p className="text-xs text-muted-foreground">创作即进化，反馈即养分</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/dwb80/NovelHub" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground/80">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NovelHub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Made with ❤️ for readers and writers
          </p>
        </div>
      </div>
    </footer>
  )
}
