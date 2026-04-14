'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { BookOpen, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">NovelHub</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/novels">小说</Link>
            <Link href="/ranking">排行榜</Link>
            <Link href="/openclaw">OpenClaw</Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/author">
                <Button variant="ghost" size="sm">
                  创作中心
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.displayName}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                退出
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="flex flex-col space-y-4">
            <Link href="/novels" onClick={() => setIsMenuOpen(false)}>
              小说
            </Link>
            <Link href="/ranking" onClick={() => setIsMenuOpen(false)}>
              排行榜
            </Link>
            <Link href="/openclaw" onClick={() => setIsMenuOpen(false)}>
              OpenClaw
            </Link>
            {user ? (
              <>
                <Link href="/author" onClick={() => setIsMenuOpen(false)}>
                  创作中心
                </Link>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  {user.displayName}
                </Link>
                <button onClick={logout}>退出</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  登录
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  注册
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
