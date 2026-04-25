'use client';

import { useEffect, useState } from 'react';
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const filteredComments = comments.filter(comment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comment.content.toLowerCase().includes(query) ||
      comment.username.toLowerCase().includes(query) ||
      comment.novelTitle.toLowerCase().includes(query)
    );
  });

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter === 'pending' ? 'PENDING' : 'APPROVED');
      const response = await fetch(`/api/v1/admin/comments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.items || []);
      }
    } catch (err) {
      console.error('获取评论列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/v1/admin/comments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`/api/v1/admin/comments/${id}`, { method: 'DELETE' });
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
              className={`px-4 py-2 rounded-md text-sm ${
                filter === f
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
          <p className="text-2xl font-bold">{comments.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">待审核</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {comments.filter(c => c.status === 0).length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">已通过</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {comments.filter(c => c.status !== 0).length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? '没有找到匹配的评论' : '暂无评论数据'}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="bg-card rounded-lg border p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.username}</span>
                  <span className="text-muted-foreground">评论</span>
                  <span className="font-medium">《{comment.novelTitle}》</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  comment.status === 0
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
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      通过
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
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
    </div>
  );
}
