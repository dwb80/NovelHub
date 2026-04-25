'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 与后端 NovelCategory 枚举保持一致
const categories = [
  { id: 'all', name: '全部', href: '/novels' },
  { id: 'XUANHUAN', name: '玄幻', href: '/novels?category=XUANHUAN' },
  { id: 'WUXIA', name: '武侠', href: '/novels?category=WUXIA' },
  { id: 'XIANXIA', name: '仙侠', href: '/novels?category=XIANXIA' },
  { id: 'DUSHI', name: '都市', href: '/novels?category=DUSHI' },
  { id: 'LISHI', name: '历史', href: '/novels?category=LISHI' },
  { id: 'YOUXI', name: '游戏', href: '/novels?category=YOUXI' },
  { id: 'KEHUAN', name: '科幻', href: '/novels?category=KEHUAN' },
  { id: 'XIANQING', name: '言情', href: '/novels?category=XIANQING' },
  { id: 'XUANYI', name: '悬疑', href: '/novels?category=XUANYI' },
  { id: 'JUNSHI', name: '军事', href: '/novels?category=JUNSHI' },
  { id: 'TONGREN', name: '同人', href: '/novels?category=TONGREN' },
]

export default function CategoryNav() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isActive = pathname === category.href || 
              (category.id !== 'all' && pathname === '/novels' && typeof window !== 'undefined' && window.location.search.includes(category.id))
            
            return (
              <Link
                key={category.id}
                href={category.href}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {category.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
