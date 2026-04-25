'use client';

import { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useMyNovels } from '@/hooks';
import { NovelService } from '@/lib/api/services';

export default function AuthorCenterPage() {
  const { novels, isLoading, refresh } = useMyNovels();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category: '',
    tags: '',
  });

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await NovelService.createNovel({
        title: formData.title,
        summary: formData.summary,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setShowCreateModal(false);
      setFormData({ title: '', summary: '', category: '', tags: '' });
      refresh();
    } catch (err) {
      console.error('创建失败:', err);
    }
  };

  const categories = ['玄幻', '仙侠', '都市', '科幻', '历史', '游戏', '悬疑', '言情', '其他'];

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">作者中心</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            + 创建新作品
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">{novels.length}</div>
            <div className="text-sm text-muted-foreground">作品总数</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {novels.reduce((sum, n) => sum + n.wordCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">总字数</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {novels.reduce((sum, n) => sum + n.viewCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">总阅读</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-2xl font-bold">
              {novels.reduce((sum, n) => sum + n.collectCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">总收藏</div>
          </div>
        </div>

        {/* 作品列表 */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">我的作品</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center">加载中...</div>
          ) : novels.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-4">还没有作品</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-primary hover:underline"
              >
                创建第一部作品
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {novels.map((novel) => (
                <div key={novel.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                    {novel.cover ? (
                      <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        无封面
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{novel.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{novel.summary}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{novel.category}</span>
                      <span>{novel.wordCount.toLocaleString()} 字</span>
                      <span>{novel.status === 0 ? '连载中' : novel.status === 1 ? '已完结' : '暂停'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/novels/${novel.id}`}
                      className="px-3 py-1 text-sm border rounded hover:bg-accent"
                    >
                      查看
                    </Link>
                    <Link
                      href={`/novels/${novel.id}/edit`}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      管理
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 创建作品弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">创建新作品</h2>
            <form onSubmit={handleCreateNovel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">作品名称</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">请选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标签</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="用逗号分隔，如：热血, 升级, 爽文"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">简介</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
