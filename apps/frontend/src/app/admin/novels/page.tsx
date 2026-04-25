'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  BookOpen,
  MessageSquare,
  Heart,
  RotateCcw
} from 'lucide-react';

// 小说状态定义 - 与文档一致
const NOVEL_STATUS = [
  { value: 'DRAFT', label: '草稿', color: 'bg-gray-100 text-gray-700' },
  { value: 'PENDING', label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'REVIEWING', label: '审核中', color: 'bg-blue-100 text-blue-700' },
  { value: 'PUBLISHED', label: '已发布', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: '已拒绝', color: 'bg-red-100 text-red-700' },
  { value: 'ARCHIVED', label: '已下架', color: 'bg-purple-100 text-purple-700' },
  { value: 'COMPLETED', label: '已完成', color: 'bg-indigo-100 text-indigo-700' },
];

interface Novel {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  category: string;
  status: string;
  chapterCount: number;
  commentCount: number;
  viewCount: number;
  likeCount: number;
  wordCount: number;
  cover?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNovelsPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchNovels();
  }, [currentPage, pageSize, selectedStatus]);

  const fetchNovels = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/v1/admin/novels?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // 适配后端返回的数据结构
        const novelsData = data.novels || data.items || [];
        const pagination = data.pagination || {};
        setNovels(novelsData.map((novel: any) => ({
          ...novel,
          authorName: novel.author?.name || novel.authorName || '未知作者',
          authorId: novel.author?.id || novel.authorId || '',
        })));
        setTotalCount(pagination.total || data.total || 0);
        setTotalPages(pagination.totalPages || Math.ceil((pagination.total || data.total || 0) / pageSize));
      }
    } catch (err) {
      console.error('获取小说列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchNovels();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const handleStatusChange = async (novelId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/admin/novels/${novelId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setNovels(prev => prev.map(n =>
          n.id === novelId ? { ...n, status: newStatus } : n
        ));
      } else {
        console.error('更新状态失败:', await response.text());
      }
    } catch (err) {
      console.error('更新状态失败:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这部小说吗？此操作不可恢复。')) return;
    try {
      const response = await fetch(`/api/v1/admin/novels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchNovels();
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const getStatusLabel = (status: string) => {
    return NOVEL_STATUS.find(s => s.value === status) || { label: status, color: 'bg-gray-100' };
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
        <h1 className="text-2xl font-bold">小说管理</h1>
      </div>

      {/* 筛选和搜索栏 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索小说标题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          搜索
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border rounded-lg bg-background hover:bg-accent flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">总小说</span>
          </div>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">待审核</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {novels.filter(n => n.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">已发布</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {novels.filter(n => n.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">已拒绝</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {novels.filter(n => n.status === 'REJECTED').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">已完成</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {novels.filter(n => n.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* 小说列表 */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">小说</th>
              <th className="text-left px-4 py-3 font-medium">作者</th>
              <th className="text-left px-4 py-3 font-medium">分类</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">创建时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {novels.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无小说数据
                </td>
              </tr>
            ) : (
              novels.map((novel) => (
                <tr key={novel.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{novel.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{novel.authorName}</td>
                  <td className="px-4 py-3 text-sm">{novel.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusLabel(novel.status).color}`}>
                      {getStatusLabel(novel.status).label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(novel.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/novels/${novel.id}`)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {novel.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(novel.id, 'PUBLISHED')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                            title="审核通过"
                            type="button"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(novel.id, 'REJECTED')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="拒绝"
                            type="button"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(novel.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
    </div>
  );
}
