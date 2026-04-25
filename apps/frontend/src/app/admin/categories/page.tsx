'use client';

import { useState, useEffect } from 'react';
import { Folder, Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

interface Category {
  id: string;
  code: string;
  name: string;
  color: string;
  novelCount: number;
  description?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', code: 'XUANHUAN', name: '玄幻', color: '#8B5CF6', novelCount: 1250, description: '东方玄幻、异世大陆' },
  { id: '2', code: 'XIANXIA', name: '仙侠', color: '#06B6D4', novelCount: 890, description: '修真修仙、神话传说' },
  { id: '3', code: 'DUSHI', name: '都市', color: '#10B981', novelCount: 2100, description: '现代都市、职场生活' },
  { id: '4', code: 'LISHI', name: '历史', color: '#F59E0B', novelCount: 560, description: '架空历史、穿越历史' },
  { id: '5', code: 'WUXIA', name: '武侠', color: '#EF4444', novelCount: 430, description: '传统武侠、新派武侠' },
  { id: '6', code: 'KEHUAN', name: '科幻', color: '#3B82F6', novelCount: 670, description: '星际文明、未来世界' },
  { id: '7', code: 'XUANYI', name: '悬疑', color: '#6366F1', novelCount: 340, description: '推理侦探、灵异悬疑' },
  { id: '8', code: 'YOUXI', name: '游戏', color: '#8B5CF6', novelCount: 520, description: '虚拟网游、电子竞技' },
  { id: '9', code: 'TONGREN', name: '同人', color: '#EC4899', novelCount: 280, description: '动漫同人、影视同人' },
  { id: '10', code: 'QIHUAN', name: '奇幻', color: '#14B8A6', novelCount: 380, description: '西方奇幻、魔法世界' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || DEFAULT_CATEGORIES);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.error('获取分类列表失败:', err);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    try {
      if (isEditing) {
        const response = await fetch(`/api/v1/admin/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCategory),
        });
        if (response.ok) {
          setCategories(prev => prev.map(c => c.id === editingCategory.id ? editingCategory : c));
        }
      } else {
        const response = await fetch('/api/v1/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCategory),
        });
        if (response.ok) {
          const newCategory = await response.json();
          setCategories(prev => [...prev, newCategory]);
        }
      }
    } catch (err) {
      console.error('保存分类失败:', err);
    } finally {
      setEditingCategory(null);
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;

    try {
      const response = await fetch(`/api/v1/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('删除分类失败:', err);
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
        <h1 className="text-2xl font-bold">分类管理</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditingCategory({ id: '', code: '', name: '', color: '#3B82F6', novelCount: 0 });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          新增分类
        </button>
      </div>

      {/* 分类列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Folder className="w-5 h-5" style={{ color: category.color }} />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.code}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditingCategory(category);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {category.description && (
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{category.novelCount} 部作品</span>
            </div>
          </div>
        ))}
      </div>

      {/* 编辑/新增弹窗 */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {isEditing ? '编辑分类' : '新增分类'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">分类名称</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类代码</label>
                <input
                  type="text"
                  value={editingCategory.code}
                  onChange={(e) => setEditingCategory({ ...editingCategory, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">颜色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsEditing(false);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
