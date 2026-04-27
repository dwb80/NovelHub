'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import {
  FileText,
  Search,
  Filter,
  BookOpen,
  Eye,
  CheckCircle,
  XCircle,
  Trash2
} from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  novelId: string;
  novelTitle: string;
  authorName: string;
  wordCount: number;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  reviewStatus: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | null;
  reviewerName: string | null;
  isVIP: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const CHAPTER_STATUS = [
  { value: 'DRAFT', label: '草稿', color: 'bg-gray-100 text-gray-700' },
  { value: 'PENDING', label: '待审核', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'PUBLISHED', label: '已发布', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: '已拒绝', color: 'bg-red-100 text-red-700' },
];

const REVIEW_STATUS = [
  { value: 'PENDING', label: '待领取', color: 'bg-blue-100 text-blue-700' },
  { value: 'ASSIGNED', label: '已领取', color: 'bg-purple-100 text-purple-700' },
  { value: 'COMPLETED', label: '已完成', color: 'bg-green-100 text-green-700' },
];

export default function AdminChaptersPage() {
  const { token } = useAdminAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedNovel, setSelectedNovel] = useState('');
  const [viewingChapter, setViewingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    fetchChapters();
  }, [currentPage, pageSize, selectedStatus, selectedNovel]);

  const fetchChapters = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedNovel) params.append('novelId', selectedNovel);

      const response = await fetch(`/api/v1/admin/chapters?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChapters(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('获取章节列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (chapterId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/admin/chapters/${chapterId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setChapters(prev => prev.map(c =>
          c.id === chapterId ? { ...c, status: newStatus as Chapter['status'] } : c
        ));
      }
    } catch (err) {
      console.error('更新章节状态失败:', err);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm('确定要删除这个章节吗？此操作不可恢复。')) return;

    try {
      const response = await fetch(`/api/v1/admin/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setChapters(prev => prev.filter(c => c.id !== chapterId));
      }
    } catch (err) {
      console.error('删除章节失败:', err);
    }
  };

  const filteredChapters = chapters.filter(chapter => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      chapter.title.toLowerCase().includes(query) ||
      chapter.novelTitle.toLowerCase().includes(query) ||
      chapter.authorName.toLowerCase().includes(query)
    );
  });

  const getStatusLabel = (status: string) => {
    return CHAPTER_STATUS.find(s => s.value === status) || { label: status, color: 'bg-gray-100' };
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
        <h1 className="text-2xl font-bold">章节管理</h1>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索章节标题、小说名或作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有状态</option>
          {CHAPTER_STATUS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">总章节</span>
          </div>
          <p className="text-2xl font-bold">{chapters.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">待审核</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {chapters.filter(c => c.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">已发布</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {chapters.filter(c => c.status === 'PUBLISHED').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">VIP章节</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {chapters.filter(c => c.isVIP).length}
          </p>
        </div>
      </div>

      {/* 章节列表 */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">章节信息</th>
              <th className="text-left px-4 py-3 font-medium">所属小说</th>
              <th className="text-left px-4 py-3 font-medium">章节状态</th>
              <th className="text-left px-4 py-3 font-medium">评审状态</th>
              <th className="text-left px-4 py-3 font-medium">字数</th>
              <th className="text-left px-4 py-3 font-medium">阅读量</th>
              <th className="text-left px-4 py-3 font-medium">更新时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredChapters.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  暂无章节数据
                </td>
              </tr>
            ) : (
              filteredChapters.map((chapter) => (
                <tr key={chapter.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">
                        第{chapter.chapterNumber}章 {chapter.title}
                        {chapter.isVIP && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                            VIP
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{chapter.authorName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">《{chapter.novelTitle}》</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={chapter.status}
                      onChange={(e) => handleStatusChange(chapter.id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded border-0 cursor-pointer ${getStatusLabel(chapter.status).color}`}
                    >
                      {CHAPTER_STATUS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {chapter.reviewStatus ? (
                      <div>
                        <span className={`px-2 py-1 text-xs rounded ${REVIEW_STATUS.find(s => s.value === chapter.reviewStatus)?.color || 'bg-gray-100 text-gray-700'}`}>
                          {REVIEW_STATUS.find(s => s.value === chapter.reviewStatus)?.label || chapter.reviewStatus}
                        </span>
                        {chapter.reviewerName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            领取人: {chapter.reviewerName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {chapter.wordCount?.toLocaleString() || 0} 字
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {chapter.viewCount?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(chapter.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingChapter(chapter)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                        title="查看内容"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(chapter.id)}
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

      {/* 查看章节内容弹窗 */}
      {viewingChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold">
                  第{viewingChapter.chapterNumber}章 {viewingChapter.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  《{viewingChapter.novelTitle}》- {viewingChapter.authorName}
                </p>
              </div>
              <button
                onClick={() => setViewingChapter(null)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground">章节内容加载中...</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                {viewingChapter.wordCount?.toLocaleString() || 0} 字 |
                {viewingChapter.viewCount?.toLocaleString() || 0} 阅读
              </div>
              <div className="flex gap-2">
                {viewingChapter.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      handleStatusChange(viewingChapter.id, 'PUBLISHED');
                      setViewingChapter(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    审核通过
                  </button>
                )}
                <button
                  onClick={() => setViewingChapter(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-accent"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
