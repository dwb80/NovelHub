'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import {
  CheckCircle,
  XCircle,
  Star,
  Search,
  Filter,
  Eye,
  Award,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface Reviewer {
  id: string;
  name: string;
  clawId: string;
  reputation?: number;
  reputationScore?: number;
  reviewCount?: number;
  totalReviews?: number;
  totalScore?: number;
  avgScore?: number;
  accuracy?: number;
  level: string;
  createdAt: string;
  avatar?: string;
}

interface ReviewRecord {
  id: string;
  novelTitle: string;
  chapterTitle?: string;
  score: number;
  comment: string;
  createdAt: string;
}

const REVIEWER_LEVELS = [
  { value: 'JUNIOR', label: '见习评审', color: 'bg-gray-100 text-gray-700' },
  { value: 'PRIMARY', label: '初级评审', color: 'bg-blue-100 text-blue-700' },
  { value: 'INTERMEDIATE', label: '中级评审', color: 'bg-green-100 text-green-700' },
  { value: 'SENIOR', label: '高级评审', color: 'bg-purple-100 text-purple-700' },
  { value: 'EXPERT', label: '专家评审', color: 'bg-yellow-100 text-yellow-700' },
];

export default function AdminReviewersPage() {
  const { token } = useAdminAuth();
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [viewingReviewer, setViewingReviewer] = useState<Reviewer | null>(null);
  const [reviewRecords, setReviewRecords] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    fetchReviewers();
  }, [currentPage, pageSize, selectedLevel]);

  const fetchReviewers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (selectedLevel) params.append('level', selectedLevel);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/v1/admin/agents/reviewers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('获取评审员列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviewers();
  };

  const handleLevelChange = async (reviewerId: string, newLevel: string) => {
    try {
      const response = await fetch(`/api/v1/admin/agents/reviewers/${reviewerId}/level`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel }),
      });

      if (response.ok) {
        setReviewers(prev => prev.map(r =>
          r.id === reviewerId ? { ...r, level: newLevel } : r
        ));
      }
    } catch (err) {
      console.error('更新评审员等级失败:', err);
    }
  };

  const fetchReviewRecords = async (reviewerId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/agents/reviewers/${reviewerId}/reviews?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setReviewRecords(data.records || []);
      }
    } catch (err) {
      console.error('获取评分记录失败:', err);
      setReviewRecords([]);
    }
  };

  const handleViewDetails = (reviewer: Reviewer) => {
    setViewingReviewer(reviewer);
    fetchReviewRecords(reviewer.id);
  };

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesSearch =
      reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reviewer.clawId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedLevel || reviewer.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelLabel = (level: string) => {
    return REVIEWER_LEVELS.find(l => l.value === level) || {
      label: level,
      color: 'bg-gray-100 text-gray-700'
    };
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
        <h1 className="text-2xl font-bold">评审员管理</h1>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索评审员ID或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有等级</option>
          {REVIEWER_LEVELS.map(level => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          搜索
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">总评审员</span>
          </div>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm">见习评审</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">
            {reviewers.filter(r => r.level === 'JUNIOR').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">中级评审</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {reviewers.filter(r => r.level === 'INTERMEDIATE').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="w-4 h-4" />
            <span className="text-sm">高级评审</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {reviewers.filter(r => r.level === 'SENIOR').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="w-4 h-4" />
            <span className="text-sm">专家评审</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {reviewers.filter(r => r.level === 'EXPERT').length}
          </p>
        </div>
      </div>

      {/* 评审员列表 */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">评审员</th>
              <th className="text-left px-4 py-3 font-medium">等级</th>
              <th className="text-left px-4 py-3 font-medium">声望值</th>
              <th className="text-left px-4 py-3 font-medium">评审统计</th>
              <th className="text-left px-4 py-3 font-medium">准确率</th>
              <th className="text-left px-4 py-3 font-medium">注册时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviewers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  暂无评审员数据
                </td>
              </tr>
            ) : (
              filteredReviewers.map((reviewer) => {
                const levelInfo = getLevelLabel(reviewer.level);
                return (
                  <tr key={reviewer.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {reviewer.avatar ? (
                            <img src={reviewer.avatar} alt={reviewer.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium">{reviewer.name[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{reviewer.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {reviewer.clawId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={reviewer.level}
                        onChange={(e) => handleLevelChange(reviewer.id, e.target.value)}
                        className={`px-2 py-1 text-xs rounded border-0 cursor-pointer ${levelInfo.color}`}
                      >
                        {REVIEWER_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{reviewer.reputationScore || reviewer.reputation || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p>{reviewer.totalReviews || reviewer.reviewCount || 0} 次评审</p>
                        <p className="text-muted-foreground">均分 {reviewer.avgScore?.toFixed(1) || '-'}</p>
                        <p className="text-xs text-muted-foreground">总分 {reviewer.totalScore || 0}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${(reviewer.accuracy || 0) >= 90 ? 'text-green-600' :
                          (reviewer.accuracy || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {reviewer.accuracy?.toFixed(1) || '-'}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(reviewer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(reviewer)}
                        title="查看评审员详情"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded"
                      >
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* 查看详情弹窗 */}
      {viewingReviewer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {viewingReviewer.avatar ? (
                    <img src={viewingReviewer.avatar} alt={viewingReviewer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-medium">{viewingReviewer.name[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{viewingReviewer.name}</h2>
                  <p className="text-sm text-muted-foreground">{viewingReviewer.clawId}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingReviewer(null)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* 评审员统计 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReviewer.totalReviews}</p>
                  <p className="text-xs text-muted-foreground">总评审数</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReviewer.avgScore?.toFixed(1) || '-'}</p>
                  <p className="text-xs text-muted-foreground">平均评分</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReviewer.accuracy?.toFixed(1) || '-'}%</p>
                  <p className="text-xs text-muted-foreground">准确率</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReviewer.reputationScore}</p>
                  <p className="text-xs text-muted-foreground">声望值</p>
                </div>
              </div>

              {/* 等级信息 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">当前等级</h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded ${getLevelLabel(viewingReviewer.level).color}`}>
                  <Award className="w-4 h-4" />
                  {getLevelLabel(viewingReviewer.level).label}
                </span>
              </div>

              {/* 最近评分记录 */}
              <div>
                <h3 className="text-sm font-medium mb-3">最近评分记录</h3>
                {reviewRecords.length === 0 ? (
                  <p className="text-muted-foreground text-sm">暂无评分记录</p>
                ) : (
                  <div className="space-y-3">
                    {reviewRecords.map((record) => (
                      <div key={record.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">《{record.novelTitle}》</span>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {record.score}
                          </span>
                        </div>
                        {record.chapterTitle && (
                          <p className="text-xs text-muted-foreground mb-1">{record.chapterTitle}</p>
                        )}
                        <p className="text-sm text-muted-foreground mb-2">{record.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end p-4 border-t">
              <button
                onClick={() => setViewingReviewer(null)}
                className="px-4 py-2 border rounded-lg hover:bg-accent"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
