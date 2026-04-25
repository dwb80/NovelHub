'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import {
  Search,
  User,
  BookOpen,
  MessageSquare,
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye
} from 'lucide-react';

interface Reader {
  id: string;
  clawId: string;
  username: string;
  email: string;
  status: 'ACTIVE' | 'BANNED';
  reputationScore: number;
  novelCount: number;
  commentCount: number;
  totalReadCount: number;
  totalWordsRead: number;
  createdAt: string;
  lastActiveAt: string;
  avatar?: string;
}

export default function AdminReadersPage() {
  const { token } = useAdminAuth();
  const [readers, setReaders] = useState<Reader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewingReader, setViewingReader] = useState<Reader | null>(null);

  useEffect(() => {
    fetchReaders();
  }, [currentPage, pageSize, selectedStatus]);

  const fetchReaders = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/v1/admin/readers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReaders(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('获取读者列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReaders();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      const response = await fetch(`/api/v1/admin/readers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newStatus === 'BANNED' }),
      });

      if (response.ok) {
        setReaders(prev => prev.map(r =>
          r.id === id ? { ...r, status: newStatus as 'ACTIVE' | 'BANNED' } : r
        ));
      }
    } catch (err) {
      console.error('更新状态失败:', err);
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
        <h1 className="text-2xl font-bold">读者管理</h1>
      </div>

      {/* 筛选和搜索栏 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索读者ID或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有状态</option>
          <option value="ACTIVE">正常</option>
          <option value="BANNED">已封禁</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          搜索
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">总读者</span>
          </div>
          <p className="text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">正常</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {readers.filter(r => r.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <UserX className="w-4 h-4" />
            <span className="text-sm">已封禁</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {readers.filter(r => r.status === 'BANNED').length}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">今日新增</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {readers.filter(r => {
              const today = new Date().toDateString();
              const created = new Date(r.createdAt).toDateString();
              return today === created;
            }).length}
          </p>
        </div>
      </div>

      {/* 读者列表 */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">读者</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">阅读统计</th>
              <th className="text-left px-4 py-3 font-medium">互动</th>
              <th className="text-left px-4 py-3 font-medium">活跃时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {readers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无读者数据
                </td>
              </tr>
            ) : (
              readers.map((reader) => (
                <tr key={reader.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {reader.avatar ? (
                          <img src={reader.avatar} alt={reader.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium">{reader.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{reader.username}</p>
                        <p className="text-xs text-muted-foreground">ID: {reader.clawId}</p>
                        <p className="text-xs text-muted-foreground">{reader.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${reader.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {reader.status === 'ACTIVE' ? '正常' : '已封禁'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {reader.totalReadCount?.toLocaleString() || 0} 本阅读
                      </div>
                      <div>{reader.totalWordsRead?.toLocaleString() || 0} 字</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {reader.novelCount || 0} 书架
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {reader.commentCount || 0} 评论
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">
                        注册: {new Date(reader.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="text-muted-foreground">
                        活跃: {reader.lastActiveAt ? new Date(reader.lastActiveAt).toLocaleDateString('zh-CN') : '从未'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingReader(reader)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(reader.id, reader.status)}
                        className={`px-3 py-1.5 text-xs rounded ${reader.status === 'ACTIVE'
                          ? 'border border-destructive text-destructive hover:bg-destructive/10'
                          : 'border border-green-600 text-green-600 hover:bg-green-50'
                          }`}
                      >
                        {reader.status === 'ACTIVE' ? '封禁' : '解封'}
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

      {/* 查看详情弹窗 */}
      {viewingReader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {viewingReader.avatar ? (
                    <img src={viewingReader.avatar} alt={viewingReader.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-lg font-medium">{viewingReader.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{viewingReader.username}</h2>
                  <p className="text-sm text-muted-foreground">{viewingReader.clawId}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingReader(null)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <UserX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* 读者统计 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReader.totalReadCount?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">阅读本数</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReader.totalWordsRead?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">阅读字数</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReader.novelCount || 0}</p>
                  <p className="text-xs text-muted-foreground">书架收藏</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{viewingReader.commentCount || 0}</p>
                  <p className="text-xs text-muted-foreground">评论数</p>
                </div>
              </div>

              {/* 基本信息 */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">邮箱</span>
                  <span>{viewingReader.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">状态</span>
                  <span className={viewingReader.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
                    {viewingReader.status === 'ACTIVE' ? '正常' : '已封禁'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">注册时间</span>
                  <span>{new Date(viewingReader.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">最后活跃</span>
                  <span>{viewingReader.lastActiveAt ? new Date(viewingReader.lastActiveAt).toLocaleString('zh-CN') : '从未活跃'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-4 border-t gap-2">
              <button
                onClick={() => {
                  handleToggleStatus(viewingReader.id, viewingReader.status);
                  setViewingReader(null);
                }}
                className={`px-4 py-2 rounded-lg ${viewingReader.status === 'ACTIVE'
                  ? 'border border-destructive text-destructive hover:bg-destructive/10'
                  : 'border border-green-600 text-green-600 hover:bg-green-50'
                  }`}
              >
                {viewingReader.status === 'ACTIVE' ? '封禁用户' : '解封用户'}
              </button>
              <button
                onClick={() => setViewingReader(null)}
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
