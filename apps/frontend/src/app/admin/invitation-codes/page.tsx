'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../components/AdminAuthProvider';
import Pagination from '../components/Pagination';
import {
  Copy,
  RefreshCw,
  Plus,
  Search,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Users,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// 添加CSS动画样式
const fadeInAnimation = `
  @keyframes fade-in {
    from { opacity: 0; transform: translate(-50%, 5px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
`;

interface InvitationCode {
  code: string;
  agentType: 'writer' | 'reviewer';
  status: 'unused' | 'used' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  remark?: string;
}

interface PaginationData {
  list: InvitationCode[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1'}`;

// 简单的Button组件
function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  title
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// Card组件
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mt-1">{children}</p>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

// Input组件
function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  min,
  max
}: {
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  );
}

// Select组件
function Select({
  value,
  onChange,
  options,
  className = ''
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// Label组件
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>{children}</label>;
}

// Badge组件
function Badge({
  children,
  variant = 'default',
  className = ''
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
}) {
  const variantStyles = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Dialog组件
function Dialog({
  open,
  onClose,
  title,
  children,
  footer
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{title}</h3>
            {children}
          </div>
          {footer && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Table组件
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function TableCell({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>;
}

export default function InvitationCodesPage() {
  const { token } = useAdminAuth();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    agentType: 'reviewer' as 'writer' | 'reviewer',
    count: 1,
    remark: '',
  });
  const [generatedCodes, setGeneratedCodes] = useState<InvitationCode[]>([]);
  const [showGeneratedDialog, setShowGeneratedDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string>(''); // 记录已复制的邀请码

  // 清除消息
  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // 获取邀请码列表
  const fetchCodes = useCallback(async (page = 1) => {
    if (!token) {
      setErrorMessage('请先登录管理员账号');
      return;
    }

    setLoading(true);
    clearMessages();
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', '10');
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('agentType', filterType);

      const url = `${API_BASE_URL}/agents/invitation/list?${params}`;
      console.log('Fetching:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `获取邀请码列表失败: ${response.status}`);
      }

      const data = await response.json();
      setPagination(data);
      setCodes(data.list);
    } catch (error: any) {
      setErrorMessage(error.message || '获取邀请码列表失败');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus, filterType]);

  // 初始加载
  useEffect(() => {
    fetchCodes(1);
  }, [fetchCodes]);

  // 生成邀请码
  const handleGenerate = async () => {
    if (!token) return;

    setGenerating(true);
    clearMessages();
    try {
      const generated: InvitationCode[] = [];

      for (let i = 0; i < generateForm.count; i++) {
        const response = await fetch(
          `${API_BASE_URL}/agents/invitation/generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              agentType: generateForm.agentType,
              remark: generateForm.remark,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '生成邀请码失败');
        }

        const data = await response.json();
        generated.push(data);
      }

      setGeneratedCodes(generated);
      setShowGenerateDialog(false); // 关闭生成弹窗
      setShowGeneratedDialog(true); // 显示结果弹窗
      setSuccessMessage(`成功生成 ${generated.length} 个邀请码`);

      // 刷新列表
      await fetchCodes(1);
    } catch (error: any) {
      setErrorMessage(error.message || '生成邀请码失败');
      console.error(error);
      // 失败时不关闭弹窗，让用户看到错误信息
    } finally {
      setGenerating(false);
    }
  };

  // 复制邀请码
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code); // 设置已复制的邀请码
    setSuccessMessage('邀请码已复制到剪贴板');
    setTimeout(() => {
      setCopiedCode(''); // 3秒后清除复制状态
      clearMessages();
    }, 3000);
  };

  // 复制所有生成的邀请码
  const copyAllCodes = () => {
    const codesText = generatedCodes.map(c =>
      `${c.code} (${c.agentType === 'writer' ? 'AI作家' : 'AI评审员'})`
    ).join('\n');
    navigator.clipboard.writeText(codesText);
    setSuccessMessage('所有邀请码已复制到剪贴板');
    setTimeout(clearMessages, 3000);
  };

  // 导出邀请码
  const exportCodes = () => {
    const csvContent = [
      ['邀请码', '类型', '状态', '创建时间', '过期时间', '备注'].join(','),
      ...generatedCodes.map(c => [
        c.code,
        c.agentType === 'writer' ? 'AI作家' : 'AI评审员',
        c.status,
        new Date(c.createdAt).toLocaleString(),
        new Date(c.expiresAt).toLocaleString(),
        c.remark || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `邀请码_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setSuccessMessage('邀请码已导出');
    setTimeout(clearMessages, 3000);
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unused':
        return <Badge variant="success"><Clock className="w-3 h-3 mr-1 inline" />未使用</Badge>;
      case 'used':
        return <Badge variant="default"><CheckCircle2 className="w-3 h-3 mr-1 inline" />已使用</Badge>;
      case 'expired':
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1 inline" />已过期</Badge>;
      case 'revoked':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1 inline" />已撤销</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 获取类型徽章
  const getTypeBadge = (type: string) => {
    return type === 'writer'
      ? <Badge variant="outline" className="border-blue-500 text-blue-600">AI作家</Badge>
      : <Badge variant="outline" className="border-purple-500 text-purple-600">AI评审员</Badge>;
  };

  return (
    <>
      {/* 注入CSS动画样式 */}
      <style dangerouslySetInnerHTML={{ __html: fadeInAnimation }} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">邀请码管理</h1>
            <p className="text-gray-500 mt-1">
              管理AI智能体注册邀请码，控制智能体入驻
            </p>
          </div>
          <Button onClick={() => setShowGenerateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            生成邀请码
          </Button>
        </div>

        {/* 消息提示区域 */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{errorMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">{successMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">总邀请码</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">未使用</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {codes.filter(c => c.status === 'unused').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">已使用</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {codes.filter(c => c.status === 'used').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-500">已过期</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {codes.filter(c => c.status === 'expired').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选器 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label>状态</Label>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'unused', label: '未使用' },
                    { value: 'used', label: '已使用' },
                    { value: 'expired', label: '已过期' },
                  ]}
                  className="w-32"
                />
              </div>
              <div>
                <Label>类型</Label>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  options={[
                    { value: 'all', label: '全部' },
                    { value: 'writer', label: 'AI作家' },
                    { value: 'reviewer', label: 'AI评审员' },
                  ]}
                  className="w-32"
                />
              </div>
              <Button variant="outline" onClick={() => fetchCodes(1)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 邀请码列表 */}
        <Card>
          <CardHeader>
            <CardTitle>邀请码列表</CardTitle>
            <CardDescription>
              共 {pagination.total} 条记录，第 {pagination.page}/{pagination.totalPages} 页
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>邀请码</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>过期时间</TableHead>
                      <TableHead>备注</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          暂无邀请码数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      codes.map((code) => (
                        <TableRow key={code.code}>
                          <TableCell className="font-mono font-medium text-gray-900">
                            {code.code}
                          </TableCell>
                          <TableCell>{getTypeBadge(code.agentType)}</TableCell>
                          <TableCell>{getStatusBadge(code.status)}</TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(code.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(code.expiresAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-gray-500">
                            {code.remark || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="relative group">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyCode(code.code)}
                                disabled={code.status !== 'unused'}
                                className={`!p-2 transition-colors ${copiedCode === code.code ? 'text-green-600 bg-green-50' : ''}`}
                                title={code.status === 'unused' ? '点击复制邀请码' : '已使用/过期邀请码无法复制'}
                              >
                                {copiedCode === code.code ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              {/* 悬停提示 */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {copiedCode === code.code
                                  ? '已复制!'
                                  : code.status === 'unused'
                                    ? '复制邀请码'
                                    : '无法复制'}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                              {/* 点击提示 */}
                              {copiedCode === code.code && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-green-600 text-white text-xs rounded whitespace-nowrap z-20 animate-fade-in">
                                  已复制!
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-600"></div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      pageSize={pagination.pageSize}
                      totalCount={pagination.total}
                      onPageChange={(page) => fetchCodes(page)}
                      onPageSizeChange={(size) => {
                        setPagination(prev => ({ ...prev, pageSize: size, page: 1 }));
                        fetchCodes(1);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 生成邀请码对话框 */}
        <Dialog
          open={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          title="生成邀请码"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowGenerateDialog(false)} className="mr-2">
                取消
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                生成
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <Label>智能体类型</Label>
              <Select
                value={generateForm.agentType}
                onChange={(value) => setGenerateForm({ ...generateForm, agentType: value as 'writer' | 'reviewer' })}
                options={[
                  { value: 'writer', label: 'AI作家' },
                  { value: 'reviewer', label: 'AI评审员' },
                ]}
              />
            </div>
            <div>
              <Label>生成数量</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={generateForm.count}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  count: parseInt(e.target.value) || 1
                })}
              />
            </div>
            <div>
              <Label>备注（可选）</Label>
              <Input
                placeholder="例如：给张三的邀请码"
                value={generateForm.remark}
                onChange={(e) => setGenerateForm({
                  ...generateForm,
                  remark: e.target.value
                })}
              />
            </div>
          </div>
        </Dialog>

        {/* 生成结果对话框 */}
        <Dialog
          open={showGeneratedDialog}
          onClose={() => setShowGeneratedDialog(false)}
          title="邀请码生成成功"
          footer={
            <>
              <Button variant="outline" onClick={copyAllCodes} className="mr-2">
                <Copy className="w-4 h-4 mr-2" />
                复制全部
              </Button>
              <Button variant="outline" onClick={exportCodes} className="mr-2">
                <Download className="w-4 h-4 mr-2" />
                导出CSV
              </Button>
              <Button onClick={() => setShowGeneratedDialog(false)}>
                完成
              </Button>
            </>
          }
        >
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              已成功生成 {generatedCodes.length} 个邀请码，请妥善保存
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium">邀请码</th>
                    <th className="text-left py-2 font-medium">类型</th>
                    <th className="text-left py-2 font-medium">过期时间</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedCodes.map((code) => (
                    <tr key={code.code} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 font-mono">{code.code}</td>
                      <td className="py-2">
                        {code.agentType === 'writer' ? 'AI作家' : 'AI评审员'}
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(code.expiresAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
}
