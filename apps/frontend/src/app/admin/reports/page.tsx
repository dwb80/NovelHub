'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import { AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, BookOpen, User } from 'lucide-react';

interface Report {
  id: string;
  type: 'NOVEL' | 'COMMENT' | 'USER';
  targetId: string;
  targetTitle?: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  reporter: {
    id: string;
    name: string;
  };
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const REPORT_TYPES = [
  { value: 'NOVEL', label: '小说举报', icon: BookOpen },
  { value: 'COMMENT', label: '评论举报', icon: MessageSquare },
  { value: 'USER', label: '用户举报', icon: User },
];

const REPORT_STATUS = [
  { value: 'PENDING', label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'RESOLVED', label: '已处理', color: 'bg-green-100 text-green-700' },
  { value: 'REJECTED', label: '已驳回', color: 'bg-gray-100 text-gray-700' },
];

const REPORT_REASONS: Record<string, string> = {
  'SPAM': '垃圾信息',
  'INAPPROPRIATE': '不当内容',
  'COPYRIGHT': '侵权抄袭',
  'HARASSMENT': '恶意骚扰',
  'OTHER': '其他原因',
};

export default function AdminReportsPage() {
  const { token } = useAdminAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');

  useEffect(() => {
    fetchReports();
  }, [selectedType, selectedStatus]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/v1/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.items || []);
      }
    } catch (err) {
      console.error('获取举报列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (reportId: string, action: 'RESOLVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/v1/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        setReports(prev => prev.map(r =>
          r.id === reportId ? { ...r, status: action } : r
        ));
      }
    } catch (err) {
      console.error('处理举报失败:', err);
    }
  };

  const getTypeLabel = (type: string) => {
    return REPORT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStatusBadge = (status: string) => {
    const config = REPORT_STATUS.find(s => s.value === status);
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
        <h1 className="text-2xl font-bold">举报处理</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          待处理举报: {reports.filter(r => r.status === 'PENDING').length}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有类型</option>
          {REPORT_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有状态</option>
          {REPORT_STATUS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* 举报列表 */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border">
            暂无举报数据
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {REPORT_TYPES.find(t => t.value === report.type)?.icon && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                        {(() => {
                          const Icon = REPORT_TYPES.find(t => t.value === report.type)?.icon;
                          return Icon ? <Icon className="w-4 h-4 text-primary" /> : null;
                        })()}
                      </span>
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getTypeLabel(report.type)}</span>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      举报原因: {REPORT_REASONS[report.reason] || report.reason}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              {report.targetTitle && (
                <div className="mb-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">举报对象: {report.targetTitle}</p>
                </div>
              )}

              {report.description && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  举报人: {report.reporter.name}
                </div>
                <div className="flex gap-2">
                  <button
                    title="查看举报详情"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-accent"
                  >
                    <Eye className="w-4 h-4" />
                    查看详情
                  </button>
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleResolve(report.id, 'RESOLVED')}
                        title="处理通过"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        通过
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'REJECTED')}
                        title="驳回举报"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <XCircle className="w-4 h-4" />
                        驳回
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
