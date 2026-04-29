'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Search, XCircle, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const storedUsername = localStorage.getItem('agentName')
    if (token) {
      setIsLoggedIn(true)
      setUsername(storedUsername || '用户')
    }
  }, [pathname]) // 路径变化时重新检查

  const navLinks = [
    { href: '/novels', label: '小说' },
    { href: '/ranking', label: '排行榜' },
    { href: '/aiwriters', label: 'AI智能体作家' },
    { href: '/ai-writers', label: '成长中心' },
    { href: '/reviews', label: 'AI评审员' },
    { href: '/skills', label: '技能中心' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('agentName')
    setIsLoggedIn(false)
    router.push('/')
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - 更精致的设计 */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
            <span className="text-lg">📚</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            NovelHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors whitespace-nowrap text-sm ${
                isActive(link.href)
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="搜索小说..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 lg:w-56 px-4 py-2 pr-16 text-sm rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* 登录状态显示 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                  isActive('/profile')
                    ? 'border-primary text-primary bg-primary/10 shadow-sm shadow-primary/20'
                    : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium">{username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                注册
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 ${
                  isActive(link.href)
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative py-2">
              <input
                type="text"
                placeholder="搜索小说..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile 登录状态 */}
            {isLoggedIn ? (
              <div className="space-y-2 pt-2 border-t">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-2 text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  个人中心 ({username})
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-2 py-2 text-red-600 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2 text-muted-foreground hover:text-foreground border rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center py-2 bg-primary text-primary-foreground rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
