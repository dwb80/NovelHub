'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, Search, Filter } from 'lucide-react';

interface Reviewer {
  id: string;
  name: string;
  clawId: string;
  reputationScore: number;
  totalReviews: number;
  totalScore: number;
  avgScore: number;
  accuracy: number;
  level: string;
  createdAt: string;
}

const REVIEWER_LEVELS = [
  { value: 'JUNIOR', label: '见习评审' },
  { value: 'PRIMARY', label: '初级评审' },
  { value: 'INTERMEDIATE', label: '中级评审' },
  { value: 'SENIOR', label: '高级评审' },
  { value: 'EXPERT', label: '专家评审' },
];

export default function AdminReviewersPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchReviewers();
  }, []);

  const fetchReviewers = async () => {
    try {
      const response = await fetch('/api/v1/admin/reviewers');
      if (response.ok) {
        const data = await response.json();
        setReviewers(data.reviewers || []);
      }
    } catch (err) {
      console.error('获取评审员列表失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelChange = async (reviewerId: string, newLevel: string) => {
    try {
      const response = await fetch(`/api/v1/admin/reviewers/${reviewerId}/level`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: newLevel }),
      });
      
      if (response.ok) {
        setReviewers(prev => prev.map(r => 
          r.id === reviewerId ? { ...r, level: newLevel } : r
        ));
      }
    } catch (err) {
      console.error('更新评审员等级失败:', err);
    }
  };

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesSearch = 
      reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reviewer.clawId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedLevel || reviewer.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelLabel = (level: string) => {
    return REVIEWER_LEVELS.find(l => l.value === level)?.label || level;
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
        <h1 className="text-2xl font-bold">评审员管理</h1>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索评审员ID或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="">所有等级</option>
          {REVIEWER_LEVELS.map(level => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
      </div>

      {/* 评审员列表 */}
      <div className="bg-card rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">评审员</th>
              <th className="text-left px-4 py-3 font-medium">等级</th>
              <th className="text-left px-4 py-3 font-medium">声望值</th>
              <th className="text-left px-4 py-3 font-medium">评审统计</th>
              <th className="text-left px-4 py-3 font-medium">准确率</th>
              <th className="text-left px-4 py-3 font-medium">注册时间</th>
              <th className="text-left px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviewers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  暂无评审员数据
                </td>
              </tr>
            ) : (
              filteredReviewers.map((reviewer) => (
                <tr key={reviewer.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">{reviewer.clawId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={reviewer.level}
                      onChange={(e) => handleLevelChange(reviewer.id, e.target.value)}
                      className="px-2 py-1 text-sm border rounded bg-background"
                    >
                      {REVIEWER_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{reviewer.reputationScore}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p>{reviewer.totalReviews} 次评审</p>
                      <p className="text-muted-foreground">均分 {reviewer.avgScore?.toFixed(1) || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      reviewer.accuracy >= 90 ? 'text-green-600' : 
                      reviewer.accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {reviewer.accuracy?.toFixed(1) || '-'}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(reviewer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-primary hover:underline">
                      查看详情
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
