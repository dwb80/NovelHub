'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import { Search, MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  username: string;
  novelTitle: string;
  createdAt: string;
  status: number;
}

export default function AdminCommentsPage() {
  const { token } = useAdminAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComments();
  }, [currentPage, pageSize, filter]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (filter !== 'all') params.append('status', filter === 'pending' ? 'PENDING' : 'APPROVED');
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/v1/admin/comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('获取评论列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchComments();
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/v1/admin/comments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: false }),
      });
      fetchComments();
    } catch (err) {
      console.error('审核失败:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await fetch(`/api/v1/admin/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      fetchComments();
    } catch (err) {
      console.error('删除失败:', err);
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
        <h1 className="text-2xl font-bold">评论管理</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm ${filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-accent'
                }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待审核' : '已通过'}
            </button>
          ))}
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索评论内容、用户名或小说名..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
        />
      </div>

      {/* 评论统计 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">全部评论</span>
          </div>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">待审核</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {comments.filter(c => c.status === 0).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">ssName="flex items-center gap-2 text-muted-foreground mb-1">
          <span className="text-sm">已通过</span>
        </div>
                  ssName="text-2xl font-bold text-green-600">
        {comments.filter(c => c.status !== 0).length}
      </p>
    </div>
      </div >

    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? '没有找到匹配的评论' : '暂无评论数据'}
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="bg-card rounded-lg border p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.username}</span>
                <span className="text-muted-foreground">评论</span>
                <span className="font-medium">《{comment.novelTitle}》</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${comment.status === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
                }`}>
                {comment.status === 0 ? '待审核' : '已通过'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{comment.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString('zh-CN')}
              </span>
              <div className="flex gap-2">
                {comment.status === 0 && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    title="审核通过"
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    通过
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  title="删除评论"
                  className="px-3 py-1 text-xs border border-destructive text-destructive rounded hover:bg-destructive/10"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

  {/* 分页 */ }
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={setCurrentPage}
    onPageSizeChange={setPageSize}
  />
    </div >
  );
}
