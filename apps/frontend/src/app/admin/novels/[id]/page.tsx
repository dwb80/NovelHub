'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '../../components/AdminAuthProvider';
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

// 小说状态定义
const NOVEL_STATUS = [
  { value: 'DRAFT', label: '草稿', color: 'bg-gray-100 text-gray-700' },
  { value: 'PENDING', label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'REVIEWING', label: '审核中', color: 'bg-blue-100 text-blue-700' },
  { value: 'PUBLISHED', label: '已发布', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: '已拒绝', color: 'bg-red-100 text-red-700' },
  { value: 'ARCHIVED', label: '已下架', color: 'bg-purple-100 text-purple-700' },
  { value: 'COMPLETED', label: '已完成', color: 'bg-indigo-100 text-indigo-700' },
];

// 评审员等级映射
const REVIEWER_LEVELS: Record<string, string> = {
  'TRAINEE': '见习评审',
  'JUNIOR': '初级评审',
  'MIDDLE': '中级评审',
  'SENIOR': '高级评审',
  'EXPERT': '专家评审',
};

interface NovelDetail {
  id: string;
  title: string;
  description: string;
  cover?: string;
  status: string;
  category: string;
  tags: string[];
  wordCount: number;
  chapterCount: number;
  viewCount: number;
  rating: number;
  ratingCount: number;
  author: {
    id: string;
    name: string;
    agentId: string;
  };
  chapters: {
    id: string;
    title: string;
    orderIndex: number;
    status: string;
  }[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface ReviewerInfo {
  id: string;
  name: string;
  agentId: string;
  level: string;
}

interface ReviewProcess {
  id: string;
  status: string;
  score: number;
  comment: string;
  reviewer: ReviewerInfo | null;
  createdAt: string;
  updatedAt: string;
}

interface ChapterReview {
  id: string;
  chapter: {
    id: string;
    title: string;
    orderIndex: number;
  };
  status: string;
  score: number;
  comment: string;
  reviewer: ReviewerInfo | null;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStatistics {
  totalChapters: number;
  reviewedChapters: number;
  pendingChapters: number;
  averageRating: number;
}

export default function NovelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAdminAuth();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<NovelDetail | null>(null);
  const [reviewers, setReviewers] = useState<ReviewerInfo[]>([]);
  const [reviewProcesses, setReviewProcesses] = useState<ReviewProcess[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [chapterReviews, setChapterReviews] = useState<ChapterReview[]>([]);
  const [chapterReviewPagination, setChapterReviewPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'chapters'>('overview');

  useEffect(() => {
    if (novelId) {
      fetchNovelDetail();
      fetchNovelReviewDetail();
      fetchChapterReviews(1);
    }
  }, [novelId]);

  const fetchNovelDetail = async () => {
    try {
      const response = await fetch(`/api/v1/admin/novels/${novelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNovel(data);
      }
    } catch (err) {
      console.error('获取小说详情失败:', err);
    }
  };

  const fetchNovelReviewDetail = async () => {
    try {
      const response = await fetch(`/api/v1/admin/novels/${novelId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.reviewers || []);
        setReviewProcesses(data.reviews || []);
        setStatistics(data.statistics || {
          totalChapters: data.totalChapters || 0,
          reviewedChapters: data.reviewedChapters || 0,
          pendingChapters: data.pendingChapters || 0,
          averageRating: data.averageRating || 0,
        });
      }
    } catch (err) {
      console.error('获取评审详情失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapterReviews = async (page: number) => {
    try {
      const response = await fetch(
        `/api/v1/admin/novels/${novelId}/chapter-reviews?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setChapterReviews(data.reviews || []);
        setChapterReviewPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (err) {
      console.error('获取章节评审列表失败:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/admin/novels/${novelId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setNovel(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('更新状态失败:', err);
    }
  };

  const getStatusLabel = (status: string) => {
    return NOVEL_STATUS.find(s => s.value === status) || { label: status, color: 'bg-gray-100' };
  };

  const getReviewerLevelLabel = (level: string) => {
    return REVIEWER_LEVELS[level] || level;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">加载中...</span>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">小说不存在或已被删除</p>
        <button
          onClick={() => router.push('/admin/novels')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/novels')}
          className="p-2 hover:bg-accent rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">小说详情</h1>
      </div>

      {/* 小说基本信息卡片 */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex gap-6">
          {/* 封面 */}
          <div className="w-48 h-64 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {novel.cover ? (
              <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <BookOpen className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{novel.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{novel.author?.name || '未知作者'}</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">{novel.author?.agentId}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusLabel(novel.status).color}`}>
                {getStatusLabel(novel.status).label}
              </span>
              <span className="px-3 py-1 text-sm bg-secondary rounded-full">{novel.category}</span>
              {novel.tags?.map((tag: string) => (
                <span key={tag} className="px-2 py-1 text-xs bg-muted rounded">{tag}</span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">{novel.description || '暂无简介'}</p>

            {/* 统计数据 */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  章节
                </div>
                <p className="text-xl font-bold">{novel.chapterCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                  <Eye className="w-4 h-4" />
                  阅读
                </div>
                <p className="text-xl font-bold">{novel.viewCount?.toLocaleString() || 0}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                  <Heart className="w-4 h-4" />
                  评分
                </div>
                <p className="text-xl font-bold">{novel.rating?.toFixed(1) || '0.0'}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                  <MessageSquare className="w-4 h-4" />
                  评价
                </div>
                <p className="text-xl font-bold">{novel.ratingCount || 0}</p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-4">
              {novel.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatusChange('PUBLISHED')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    审核通过
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <XCircle className="w-4 h-4" />
                    拒绝
                  </button>
                </>
              )}
              <select
                value={novel.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-background"
              >
                {NOVEL_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b">
        <div className="flex gap-6">
          {[
            { key: 'overview', label: '概览', icon: BookOpen },
            { key: 'reviews', label: '评审记录', icon: Star },
            { key: 'chapters', label: '章节评审', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 概览标签页 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI评审员信息 */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              AI评审员
            </h3>
            {reviewers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">暂无评审员信息</p>
            ) : (
              <div className="space-y-3">
                {reviewers.map((reviewer) => (
                  <div key={reviewer.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reviewer.name}</p>
                      <p className="text-xs text-muted-foreground">{reviewer.agentId}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-secondary rounded">
                      {getReviewerLevelLabel(reviewer.level)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 评审统计 */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              评审统计
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">{statistics?.totalChapters || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">总章节数</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{statistics?.reviewedChapters || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">已评审</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-yellow-600">{statistics?.pendingChapters || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">待评审</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{statistics?.averageRating?.toFixed(1) || '0.0'}</p>
                <p className="text-sm text-muted-foreground mt-1">平均评分</p>
              </div>
            </div>
          </div>

          {/* 最近评审记录 */}
          <div className="bg-card rounded-lg border p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              最近评审记录
            </h3>
            {reviewProcesses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">暂无评审记录</p>
            ) : (
              <div className="space-y-3">
                {reviewProcesses.slice(0, 5).map((process) => (
                  <div key={process.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          评分: {process.score}/100
                        </span>
                        {process.reviewer && (
                          <span className="text-sm text-muted-foreground">
                            评审员: {process.reviewer.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(process.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{process.comment || '无评语'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 评审记录标签页 */}
      {activeTab === 'reviews' && (
        <div className="bg-card rounded-lg border">
          {reviewProcesses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">暂无评审记录</p>
            </div>
          ) : (
            <div className="divide-y">
              {reviewProcesses.map((process) => (
                <div key={process.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          评分: <span className="text-primary">{process.score}/100</span>
                        </p>
                        {process.reviewer && (
                          <p className="text-sm text-muted-foreground">
                            评审员: {process.reviewer.name} ({getReviewerLevelLabel(process.reviewer.level)})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        {process.status === 'COMPLETED' ? '已完成' : process.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(process.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="pl-13">
                    <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                      {process.comment || '无评语'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 章节评审标签页 */}
      {activeTab === 'chapters' && (
        <div className="bg-card rounded-lg border">
          {chapterReviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">暂无章节评审记录</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-6 py-3 font-medium">章节</th>
                    <th className="text-left px-6 py-3 font-medium">评审员</th>
                    <th className="text-left px-6 py-3 font-medium">评分</th>
                    <th className="text-left px-6 py-3 font-medium">评语</th>
                    <th className="text-left px-6 py-3 font-medium">评审时间</th>
                  </tr>
                </thead>
                <tbody>
                  {chapterReviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">第{review.chapter?.orderIndex}章 {review.chapter?.title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {review.reviewer ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.reviewer.name}</p>
                              <p className="text-xs text-muted-foreground">{getReviewerLevelLabel(review.reviewer.level)}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-sm bg-primary/10 text-primary rounded">
                          {review.score}/100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.comment || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 分页 */}
              {chapterReviewPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t">
                  <button
                    onClick={() => fetchChapterReviews(chapterReviewPagination.page - 1)}
                    disabled={chapterReviewPagination.page === 1}
                    className="p-2 border rounded-lg disabled:opacity-50 hover:bg-accent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    第 {chapterReviewPagination.page} / {chapterReviewPagination.totalPages} 页
                  </span>
                  <button
                    onClick={() => fetchChapterReviews(chapterReviewPagination.page + 1)}
                    disabled={chapterReviewPagination.page === chapterReviewPagination.totalPages}
                    className="p-2 border rounded-lg disabled:opacity-50 hover:bg-accent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
