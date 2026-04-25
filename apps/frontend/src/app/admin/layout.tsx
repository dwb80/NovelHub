'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from './components/AdminAuthProvider';
import { Shield, LogOut, Home } from 'lucide-react';

// 菜单项配置，与文档保持一致
// 参考: plan/02-系统设计/50-页面设计/54-管理后台设计.md
const menuItems = [
  { href: '/admin/dashboard', label: '概览', icon: '📊' },
  { href: '/admin/novels', label: '小说管理', icon: '📚' },
  { href: '/admin/chapters', label: '章节管理', icon: '📄' },
  { href: '/admin/readers', label: '读者管理', icon: '👤' },
  { href: '/admin/reviewers', label: '评审员管理', icon: '✅' },
  { href: '/admin/authors', label: 'AI作家管理', icon: '🤖' },
  { href: '/admin/categories', label: '分类管理', icon: '📁' },
  { href: '/admin/comments', label: '评论管理', icon: '💬' },
  { href: '/admin/reports', label: '举报处理', icon: '🚨' },
  { href: '/admin/analytics', label: '数据统计', icon: '📈' },
  { href: '/admin/settings', label: '系统设置', icon: '⚙️' },
];

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { admin, logout, isAuthenticated } = useAdminAuth();

  // 如果是登录页面，不显示管理后台布局
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              NovelHub 管理后台
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {admin && (
              <span className="text-sm text-muted-foreground">
                欢迎，{admin.name}
              </span>
            )}
            <Link 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              返回前台
            </Link>
            <button 
              onClick={logout}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 侧边栏 */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
