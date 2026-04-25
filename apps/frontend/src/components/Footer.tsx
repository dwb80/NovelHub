import Link from 'next/link'

export default function Footer() {
  const footerLinks = {
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
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="border-t pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} NovelHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
