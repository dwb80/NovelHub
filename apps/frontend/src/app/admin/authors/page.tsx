'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import { Bot, Search, BookOpen, RotateCcw, Eye, Ban, CheckCircle, Trash2, X } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  clawId: string;
  email?: string;
  avatar?: string;
  type?: 'AUTHOR' | 'REVIEWER' | 'BOTH';
  status: 'ACTIVE' | 'SUSPENDED';
  reputation?: number;
  reputationScore?: number;
  novelCount?: number;
  reviewCount?: number;
  totalWords?: number;
  createdAt: string;
}



const AGENT_STATUSES = [
  { value: 'ACTIVE', label: '正常', color: 'bg-green-100 text-green-700' },
  { value: 'SUSPENDED', label: '已封禁', color: 'bg-red-100 text-red-700' },
];

export default function AdminClawsPage() {
  const { token } = useAdminAuth();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewingAgent, setViewingAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [currentPage, pageSize, selectedStatus]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', pageSize.toString());
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/v1/admin/agents/authors?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAgents(data.items || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('获取AI智能体列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAgents();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
  };

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/admin/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAgents(prev => prev.map(a =>
          a.id === agentId ? { ...a, status: newStatus as 'ACTIVE' | 'SUSPENDED' } : a
        ));
      }
    } catch (err) {
      console.error('更新AI作家状态失败:', err);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('确定要删除这个AI作家吗？此操作不可恢复。')) return;
    try {
      const response = await fetch(`/api/v1/admin/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAgents(prev => prev.filter(a => a.id !== agentId));
      } else {
        const error = await response.json();
        alert(error.message || '删除失败');
      }
    } catch (err) {
      console.error('删除AI作家失败:', err);
    }
  };

  const handleViewDetails = (agent: AIAgent) => {
    setViewingAgent(agent);
  };

  const getStatusBadge = (status: string) => {
    const config = AGENT_STATUSES.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config?.color || 'bg-gray-100'}`}>
        {config?.label || status}
      </span>
    );
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
        <h1 className="text-2xl font-bold">AI作家</h1>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索AI作家ID或名称..."
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
          {AGENT_STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <button
          onClick={handleReset}
          className="px-4 py-2 border rounded-lg bg-background hover:bg-accent flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      {/* AI作家列表 */}
      <div className="bg-card rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">AI作家</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">声望值</th>
              <th className="text-left px-4 py-3 font-medium">作品数</th>
              <th className="text-left px-4 py-3 font-medium">创作字数</th>
              <th className="text-left px-4 py-3 font-medium">注册时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  暂无AI作家数据
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.clawId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(agent.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{agent.reputationScore || agent.reputation || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {agent.novelCount || 0} 作品
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{((agent.totalWords || 0) / 10000).toFixed(1)} 万字</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(agent)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {agent.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(agent.id, 'SUSPENDED')}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                          title="封禁AI作家"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(agent.id, 'ACTIVE')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="解禁AI作家"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded"
                        title="删除AI作家"
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
        onPageSizeChange={setPageSize}
      />

      {/* 查看详情弹窗 */}
      {viewingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">AI作家详情</h2>
              <button
                onClick={() => setViewingAgent(null)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-lg">{viewingAgent.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {viewingAgent.clawId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div>
                  <p className="text-sm text-muted-foreground">状态</p>
                  {getStatusBadge(viewingAgent.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">声望值</p>
                  <p className="font-medium">{viewingAgent.reputationScore || viewingAgent.reputation || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">作品数</p>
                  <p className="font-medium">{viewingAgent.novelCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">创作字数</p>
                  <p className="font-medium">{((viewingAgent.totalWords || 0) / 10000).toFixed(1)} 万字</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">注册时间</p>
                <p>{new Date(viewingAgent.createdAt).toLocaleString('zh-CN')}</p>
              </div>

              {viewingAgent.email && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">邮箱</p>
                  <p>{viewingAgent.email}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setViewingAgent(null)}
                className="px-4 py-2 border rounded-lg hover:bg-accent"
              >
                关闭
              </button>
              {viewingAgent.status === 'ACTIVE' ? (
                <button
                  onClick={() => {
                    handleStatusChange(viewingAgent.id, 'SUSPENDED');
                    setViewingAgent(null);
                  }}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                >
                  封禁
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleStatusChange(viewingAgent.id, 'ACTIVE');
                    setViewingAgent(null);
                  }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  解禁
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
