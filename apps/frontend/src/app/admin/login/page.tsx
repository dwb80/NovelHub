'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../components/AdminAuthProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [isSecure, setIsSecure] = useState(false);

  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1'}`;

  // 如果已登录，自动跳转到仪表盘
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  // 获取RSA公钥
  useEffect(() => {
    fetchPublicKey();
  }, []);

  const fetchPublicKey = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/public-key`);
      if (response.ok) {
        const data = await response.json();
        setPublicKey(data.publicKey);
        setIsSecure(true);
      }
    } catch (err) {
      console.error('获取公钥失败:', err);
      setIsSecure(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setRemainingAttempts(null);
  };

  // RSA-OAEP 加密密码
  const encryptPassword = async (password: string): Promise<string> => {
    if (!publicKey) {
      throw new Error('公钥未加载，请刷新页面重试');
    }

    try {
      // 导入公钥
      const publicKeyBuffer = Buffer.from(publicKey.replace(/-----BEGIN PUBLIC KEY-----\n?|\n?-----END PUBLIC KEY-----/g, ''), 'base64');
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['encrypt']
      );

      // 加密密码
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        cryptoKey,
        passwordBuffer
      );

      // 转换为Base64
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedBase64 = btoa(Array.from(encryptedArray, byte => String.fromCharCode(byte)).join(''));
      
      return encryptedBase64;
    } catch (err) {
      console.error('加密失败:', err);
      throw new Error('密码加密失败，请刷新页面重试');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    if (!publicKey) {
      setError('安全组件加载中，请稍后重试');
      return;
    }

    setIsLoading(true);
    setError('');
    setRemainingAttempts(null);

    try {
      // 加密密码
      const encryptedPassword = await encryptPassword(formData.password);

      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: encryptedPassword, // 发送加密后的密码
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 使用 AdminAuthProvider 的 login 方法
        login(data.token, data.admin);
        // 跳转到管理后台首页
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || '登录失败，请检查用户名和密码');
        
        // 提取剩余尝试次数
        const match = data.message?.match(/剩余尝试次数:\s*(\d+)/);
        if (match) {
          setRemainingAttempts(parseInt(match[1]));
        }
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请稍后重试');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">管理后台登录</h1>
          <p className="text-slate-400">NovelHub 管理员入口</p>
          
          {/* 安全连接指示器 */}
          <div className={`inline-flex items-center gap-1 mt-2 text-xs ${isSecure ? 'text-green-400' : 'text-yellow-400'}`}>
            {isSecure ? (
              <>
                <ShieldCheck className="w-3 h-3" />
                <span>RSA加密连接已建立</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>安全组件加载中...</span>
              </>
            )}
          </div>
        </div>

        {/* 登录表单 */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="请输入管理员用户名"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <div className="mt-1 text-xs text-red-400/80">
                    剩余尝试次数: {remainingAttempts}
                  </div>
                )}
                {remainingAttempts === 0 && (
                  <div className="mt-1 text-xs text-red-400/80">
                    账号已锁定，请30分钟后重试
                  </div>
                )}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading || !isSecure}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '登录中...' : '安全登录'}
            </button>

            {/* 安全提示 */}
            <div className="text-xs text-slate-500 text-center">
              <p>此登录页面使用 RSA-2048 加密保护</p>
              <p>连续5次登录失败将锁定账号30分钟</p>
            </div>
          </form>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-slate-500 text-sm mt-8">
          &copy; 2026 NovelHub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
