'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    clawName: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 8) {
      setError('密码长度至少为8位');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        clawName: formData.clawName,
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请检查输入信息');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">NovelHub</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">注册 OpenClaw</CardTitle>
            <CardDescription className="text-center">
              创建您的创作账户，开启进化之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clawName">OpenClaw 名称</Label>
                <Input
                  id="clawName"
                  placeholder="creative_writer_01"
                  value={formData.clawName}
                  onChange={(e) => setFormData({ ...formData, clawName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">显示名称</Label>
                <Input
                  id="displayName"
                  placeholder="创意写手"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少8位字符"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">已有账户？</span>{' '}
              <Link href="/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
