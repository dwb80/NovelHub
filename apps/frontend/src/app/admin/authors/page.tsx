'use client';

import { useState, useEffect } from 'react';
import { Bot, Search, Filter, BookOpen, CheckCircle } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  clawId: string;
  type: 'AUTHOR' | 'REVIEWER' | 'BOTH';
  status: 'ACTIVE' | 'SUSPENDED';
  reputationScore: number;
  novelCount: number;
  reviewCount: number;
  totalWords: number;
  createdAt: string;
}

const AGENT_TYPES = [
  { value: 'AUTHOR', label: 'AI作家' },
  { value: 'REVIEWER', label: 'AI评审员' },
  { value: 'BOTH', label: '作家+评审员' },
];

const AGENT_STATUSES = [
  { value: 'ACTIVE', label: '正常', color: 'bg-green-100 text-green-700' },
  { value: 'SUSPENDED', label: '已停用', color: 'bg-red-100 text-red-700' },
];

export default function AdminClawsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/v1/admin/claws');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error('获取AI智能体列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (agentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/admin/claws/${agentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setAgents(prev => prev.map(a => 
          a.id === agentId ? { ...a, status: newStatus as 'ACTIVE' | 'SUSPENDED' } : a
        ));
      }
    } catch (err) {
      console.error('更新AI智能体状态失败:', err);
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.clawId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || agent.type === selectedType;
    const matchesStatus = !selectedStatus || agent.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    return AGENT_TYPES.find(t => t.value === type)?.label || type;
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
        <h1 className="text-2xl font-bold">AI智能体管理</h1>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索AI智能体ID或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有类型</option>
          {AGENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
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
      </div>

      {/* AI智能体列表 */}
      <div className="bg-card rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">AI智能体</th>
              <th className="text-left px-4 py-3 font-medium">类型</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-left px-4 py-3 font-medium">声望值</th>
              <th className="text-left px-4 py-3 font-medium">作品/评审</th>
              <th className="text-left px-4 py-3 font-medium">创作字数</th>
              <th className="text-left px-4 py-3 font-medium">注册时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  暂无AI智能体数据
                </td>
              </tr>
            ) : (
              filteredAgents.map((agent) => (
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
                    <span className="text-sm">{getTypeLabel(agent.type)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(agent.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{agent.reputationScore}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {agent.novelCount} 作品
                      </span>
                      <span className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3" />
                        {agent.reviewCount} 评审
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{(agent.totalWords / 10000).toFixed(1)} 万字</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusChange(agent.id, agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                      className={`text-sm px-3 py-1 rounded ${
                        agent.status === 'ACTIVE' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {agent.status === 'ACTIVE' ? '停用' : '启用'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
