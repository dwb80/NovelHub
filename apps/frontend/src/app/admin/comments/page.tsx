'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/admin/comments?filter=${filter}`);
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
      await fetch(`/api/admin/comments/${id}/approve`, { method: 'PUT' });
      fetchComments();
    } catch (err) {
      console.error('审核失败:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      fetchComments();
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-16">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
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

      <div className="space-y-4">
        {comments.map((comment) => (
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
        ))}
      </div>
    </div>
  );
}
