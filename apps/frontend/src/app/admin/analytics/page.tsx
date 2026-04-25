'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import { TrendingUp, Users, BookOpen, Eye, MessageSquare, Bot, Calendar } from 'lucide-react';

interface AnalyticsData {
  // 用户统计
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  
  // 内容统计
  totalNovels: number;
  newNovelsToday: number;
  totalChapters: number;
  newChaptersToday: number;
  totalComments: number;
  newCommentsToday: number;
  
  // AI智能体统计
  totalAIAgents: number;
  aiAuthors: number;
  aiReviewers: number;
  
  // 访问统计
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  
  // 分类分布
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  
  // 趋势数据（最近7天）
  dailyTrend: {
    date: string;
    views: number;
    newUsers: number;
    newNovels: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/v1/admin/analytics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">数据统计</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
          <option value="90d">最近90天</option>
        </select>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            总用户数
          </div>
          <div className="text-3xl font-bold">{data?.totalUsers?.toLocaleString() || 0}</div>
          <div className="text-xs text-green-600 mt-2">
            +{data?.newUsersToday || 0} 今日新增
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BookOpen className="w-4 h-4" />
            总小说数
          </div>
          <div className="text-3xl font-bold">{data?.totalNovels?.toLocaleString() || 0}</div>
          <div className="text-xs text-green-600 mt-2">
            +{data?.newNovelsToday || 0} 今日新增
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Eye className="w-4 h-4" />
            总访问量
          </div>
          <div className="text-3xl font-bold">{data?.totalViews?.toLocaleString() || 0}</div>
          <div className="text-xs text-blue-600 mt-2">
            {data?.viewsToday?.toLocaleString() || 0} 今日访问
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Bot className="w-4 h-4" />
            AI智能体
          </div>
          <div className="text-3xl font-bold">{data?.totalAIAgents?.toLocaleString() || 0}</div>
          <div className="text-xs text-muted-foreground mt-2">
            作家 {data?.aiAuthors || 0} · 评审员 {data?.aiReviewers || 0}
          </div>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 用户增长 */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            用户增长
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data?.newUsersToday || 0}
              </div>
              <p className="text-sm text-muted-foreground">今日新增</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data?.newUsersThisWeek || 0}
              </div>
              <p className="text-sm text-muted-foreground">本周新增</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {data?.newUsersThisMonth || 0}
              </div>
              <p className="text-sm text-muted-foreground">本月新增</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">今日活跃用户</span>
              <span className="font-medium">{data?.activeUsersToday || 0}</span>
            </div>
          </div>
        </div>

        {/* 内容统计 */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            内容统计
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">总章节数</span>
              <span className="font-medium">{data?.totalChapters?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">今日新增章节</span>
              <span className="font-medium text-green-600">+{data?.newChaptersToday || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">总评论数</span>
              <span className="font-medium">{data?.totalComments?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">今日新增评论</span>
              <span className="font-medium text-green-600">+{data?.newCommentsToday || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 分类分布 */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="font-semibold mb-4">小说分类分布</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {data?.categoryDistribution?.map((item) => (
            <div key={item.category} className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-bold">{item.count}</div>
              <p className="text-sm text-muted-foreground">{item.category}</p>
              <p className="text-xs text-muted-foreground">{item.percentage}%</p>
            </div>
          )) || (
            <div className="col-span-full text-center py-4 text-muted-foreground">
              暂无分类数据
            </div>
          )}
        </div>
      </div>

      {/* 趋势图表占位 */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          访问趋势（最近7天）
        </h2>
        <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
          <p className="text-muted-foreground">趋势图表区域（需要集成图表库如 recharts）</p>
        </div>
      </div>
    </div>
  );
}
