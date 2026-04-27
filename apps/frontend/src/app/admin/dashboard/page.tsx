'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '../components/AdminAuthProvider';
import { 
  BookOpen, 
  Users, 
  Bot, 
  FileText, 
  MessageSquare, 
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

// 后端返回的数据结构
interface BackendStats {
  // 基础统计
  totalNovels: number;
  totalReaders: number;
  totalChapters?: number;
  totalComments?: number;
  // AI智能体统计
  totalAIAgents?: number;
  aiAuthors?: number;
  aiReviewers?: number;
  // 审核统计
  totalReviews?: number;
  pendingReviews: number;
  pendingNovels: number;
  // 今日数据
  todayNewNovels?: number;
  newReadersToday?: number;
  todayViews?: number;
  completedReviewsToday?: number;
}

// 前端使用的数据结构
interface DashboardStats {
  // 基础统计
  totalNovels: number;
  totalReaders: number;
  totalChapters: number;
  totalComments: number;
  // AI智能体统计
  totalAIAgents: number;
  aiAuthors: number;
  aiReviewers: number;
  // 审核统计
  totalReviews: number;
  pendingReviews: number;
  pendingNovels: number;
  // 今日数据
  todayNewNovels: number;
  newReadersToday: number;
  todayViews: number;
  completedReviewsToday: number;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data: BackendStats = await response.json();
        // 映射后端字段到前端字段
        setStats({
          // 基础统计
          totalNovels: data.totalNovels || 0,
          totalReaders: data.totalReaders || 0,
          totalChapters: data.totalChapters || 0,
          totalComments: data.totalComments || 0,
          // AI智能体统计
          totalAIAgents: data.totalAIAgents || 0,
          aiAuthors: data.aiAuthors || 0,
          aiReviewers: data.aiReviewers || 0,
          // 审核统计
          totalReviews: data.totalReviews || 0,
          pendingReviews: data.pendingReviews || 0,
          pendingNovels: data.pendingNovels || 0,
          // 今日数据
          todayNewNovels: data.todayNewNovels || 0,
          newReadersToday: data.newReadersToday || 0,
          todayViews: data.todayViews || 0,
          completedReviewsToday: data.completedReviewsToday || 0,
        });
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: '待审核小说',
      description: '查看待审核的小说列表',
      href: '/admin/novels?status=pending',
      icon: <BookOpen className="w-5 h-5" />,
      badge: stats?.pendingNovels,
    },
    {
      title: '待处理评审',
      description: '查看待处理的评审任务',
      href: '/admin/reviewers',
      icon: <ClipboardCheck className="w-5 h-5" />,
      badge: stats?.pendingReviews,
    },
    {
      title: '读者管理',
      description: '管理读者账号和权限',
      href: '/admin/readers',
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: '评论审核',
      description: '审核用户评论内容',
      href: '/admin/comments',
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">加载中...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理后台概览</h1>

      {/* 核心统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BookOpen className="w-4 h-4" />
            总小说数
          </div>
          <div className="text-3xl font-bold">{stats?.totalNovels?.toLocaleString() || 0}</div>
          <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +{stats?.todayNewNovels || 0} 今日新增
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            总读者数
          </div>
          <div className="text-3xl font-bold">{stats?.totalReaders?.toLocaleString() || 0}</div>
          <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +{stats?.newReadersToday || 0} 今日新增
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Bot className="w-4 h-4" />
            AI智能体
          </div>
          <div className="text-3xl font-bold">{stats?.totalAIAgents?.toLocaleString() || 0}</div>
          <div className="text-xs text-muted-foreground mt-2">
            作家 {stats?.aiAuthors || 0} · 评审员 {stats?.aiReviewers || 0}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileText className="w-4 h-4" />
            总章节数
          </div>
          <div className="text-3xl font-bold">{stats?.totalChapters?.toLocaleString() || 0}</div>
          <div className="text-xs text-muted-foreground mt-2">
            平均每部 {(stats?.totalChapters && stats?.totalNovels) 
              ? Math.round(stats.totalChapters / stats.totalNovels) 
              : 0} 章
          </div>
        </div>
      </div>

      {/* 第二行统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MessageSquare className="w-4 h-4" />
            总评论数
          </div>
          <div className="text-3xl font-bold">{stats?.totalComments?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <ClipboardCheck className="w-4 h-4" />
            总审核数
          </div>
          <div className="text-3xl font-bold">{stats?.totalReviews?.toLocaleString() || 0}</div>
          <div className="text-xs text-blue-600 mt-2">
            今日完成 {stats?.completedReviewsToday || 0}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertCircle className="w-4 h-4" />
            待审核
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {(stats?.pendingNovels || 0) + (stats?.pendingReviews || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            小说 {stats?.pendingNovels || 0} · 评审 {stats?.pendingReviews || 0}
          </div>
        </div>
      </div>

      {/* 今日数据 & 系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            今日数据
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-primary">
                {stats?.todayViews?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-muted-foreground">页面浏览</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {stats?.todayNewNovels || 0}
              </div>
              <p className="text-sm text-muted-foreground">新增小说</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4">系统状态</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">API 服务</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">正常</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">数据库</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">正常</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">缓存服务</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">正常</span>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-card rounded-lg border p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {action.icon}
                </div>
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                    {action.badge}
                  </span>
                )}
              </div>
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
              <div className="flex items-center text-sm text-primary">
                前往处理
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
