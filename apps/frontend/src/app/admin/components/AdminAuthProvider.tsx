'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
}

interface TokenValidationResult {
  valid: boolean;
  expiresIn: number;
  admin: AdminUser;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: AdminUser | null;
  token: string | null;
  login: (token: string, admin: AdminUser) => void;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const PUBLIC_ADMIN_PATHS = ['/admin/login'];

// Token 过期前多久开始刷新（毫秒）
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5分钟
// 权限刷新间隔（毫秒）
const PERMISSION_REFRESH_INTERVAL = 10 * 60 * 1000; // 10分钟

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // 使用 ref 存储定时器，避免重复创建
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const permissionRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除认证状态
  const clearAuth = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    
    // 清除定时器
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;
    }
    if (permissionRefreshTimerRef.current) {
      clearInterval(permissionRefreshTimerRef.current);
      permissionRefreshTimerRef.current = null;
    }
  }, []);

  // 向后端验证 Token 有效性
  const validateTokenWithBackend = useCallback(async (currentToken: string): Promise<TokenValidationResult | null> => {
    try {
      const response = await fetch('/api/v1/admin/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data as TokenValidationResult;
      }
      
      // Token 无效或过期
      if (response.status === 401) {
        console.warn('Token 验证失败：', await response.text());
      }
      return null;
    } catch (error) {
      console.error('Token 验证请求失败：', error);
      // 网络错误时，允许继续使用本地 Token（离线模式）
      return null;
    }
  }, []);

  // 刷新权限
  const refreshPermissions = useCallback(async (): Promise<void> => {
    const currentToken = localStorage.getItem('admin_token');
    if (!currentToken) {
      throw new Error('No token available');
    }

    try {
      const response = await fetch('/api/v1/admin/auth/refresh-permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // 更新 Token 和管理员信息
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        setToken(data.token);
        setAdmin(data.admin);
        console.log('权限已刷新');
      } else if (response.status === 401) {
        // Token 已失效，需要重新登录
        clearAuth();
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('刷新权限失败：', error);
    }
  }, [clearAuth, router]);

  // 设置 Token 自动刷新定时器
  const setupTokenRefreshTimer = useCallback((expiresIn: number) => {
    // 清除现有定时器
    if (tokenRefreshTimerRef.current) {
      clearTimeout(tokenRefreshTimerRef.current);
    }

    // 在 Token 过期前 5 分钟刷新
    const refreshTime = Math.max(0, (expiresIn * 1000) - TOKEN_REFRESH_THRESHOLD);
    
    tokenRefreshTimerRef.current = setTimeout(() => {
      console.log('Token 即将过期，正在刷新权限...');
      refreshPermissions();
    }, refreshTime);
  }, [refreshPermissions]);

  // 设置权限定期刷新定时器
  const setupPermissionRefreshTimer = useCallback(() => {
    // 清除现有定时器
    if (permissionRefreshTimerRef.current) {
      clearInterval(permissionRefreshTimerRef.current);
    }

    // 每 10 分钟刷新一次权限
    permissionRefreshTimerRef.current = setInterval(() => {
      console.log('定期刷新权限...');
      refreshPermissions();
    }, PERMISSION_REFRESH_INTERVAL);
  }, [refreshPermissions]);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      const storedAdmin = localStorage.getItem('admin_user');
      
      if (storedToken && storedAdmin) {
        try {
          const parsedAdmin = JSON.parse(storedAdmin);
          
          // 先设置本地状态，让用户可以快速看到页面
          setToken(storedToken);
          setAdmin(parsedAdmin);
          setIsAuthenticated(true);
          
          // 异步向后端验证 Token 有效性
          const validationResult = await validateTokenWithBackend(storedToken);
          
          if (validationResult && validationResult.valid) {
            // Token 有效，更新为后端返回的最新信息
            setAdmin(validationResult.admin);
            
            // 设置自动刷新定时器
            setupTokenRefreshTimer(validationResult.expiresIn);
            setupPermissionRefreshTimer();
            
            console.log('Token 验证成功，有效期剩余：', validationResult.expiresIn, '秒');
          } else {
            // Token 无效或过期，清除本地存储并重定向
            console.warn('Token 已失效，需要重新登录');
            clearAuth();
          }
        } catch (err) {
          console.error('Failed to parse admin user:', err);
          clearAuth();
        }
      }
      
      // 确保在检查完成后设置 isLoading 为 false
      setIsLoading(false);
    };

    initAuth();

    // 清理函数
    return () => {
      if (tokenRefreshTimerRef.current) {
        clearTimeout(tokenRefreshTimerRef.current);
      }
      if (permissionRefreshTimerRef.current) {
        clearInterval(permissionRefreshTimerRef.current);
      }
    };
  }, [clearAuth, setupTokenRefreshTimer, setupPermissionRefreshTimer, validateTokenWithBackend]);

  // 路由守卫：未登录时重定向到登录页
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = PUBLIC_ADMIN_PATHS.some(path => pathname?.startsWith(path));
    
    if (!isAuthenticated && !isPublicPath) {
      router.push('/admin/login');
    }
    
    if (isAuthenticated && pathname === '/admin/login') {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // 登录
  const login = useCallback(async (newToken: string, newAdmin: AdminUser) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
    setIsAuthenticated(true);
    
    // 验证新 Token 并设置刷新定时器
    const validationResult = await validateTokenWithBackend(newToken);
    if (validationResult) {
      setupTokenRefreshTimer(validationResult.expiresIn);
      setupPermissionRefreshTimer();
    }
  }, [setupTokenRefreshTimer, setupPermissionRefreshTimer, validateTokenWithBackend]);

  // 登出
  const logout = useCallback(() => {
    clearAuth();
    router.push('/admin/login');
  }, [clearAuth, router]);

  // 检查权限
  const checkPermission = useCallback((permission: string): boolean => {
    if (!admin) return false;
    return admin.permissions.includes(permission) || admin.role === 'SUPER_ADMIN';
  }, [admin]);

  // 手动验证 Token
  const validateToken = useCallback(async (): Promise<boolean> => {
    const currentToken = localStorage.getItem('admin_token');
    if (!currentToken) return false;

    const validationResult = await validateTokenWithBackend(currentToken);
    if (validationResult && validationResult.valid) {
      setAdmin(validationResult.admin);
      setupTokenRefreshTimer(validationResult.expiresIn);
      return true;
    }
    return false;
  }, [setupTokenRefreshTimer, validateTokenWithBackend]);

  // 公开页面无需验证
  const isPublicPath = PUBLIC_ADMIN_PATHS.some(path => pathname?.startsWith(path));
  
  // 未登录且不是公开页面，显示加载状态
  if (!isAuthenticated && !isPublicPath && isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">检查登录状态...</p>
        </div>
      </div>
    );
  }

  // 未登录且不是公开页面，立即执行跳转
  if (!isAuthenticated && !isPublicPath) {
    // 立即执行跳转，不使用 useEffect 延迟
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4 text-slate-400">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        admin,
        token,
        login,
        logout,
        checkPermission,
        refreshPermissions,
        validateToken,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
