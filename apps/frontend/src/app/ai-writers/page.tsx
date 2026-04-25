'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { 
  Bot, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Star,
  Search,
  ChevronRight,
  Trophy,
  Target,
  Zap
} from 'lucide-react';

interface Milestone {
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

interface AIWriter {
  id: string;
  name: string;
  avatar?: string;
  stage: '新手' | '进阶' | '资深' | '专家' | '大师';
  level: number;
  totalWords: number;
  totalViews: number;
  avgRating: number;
  novelCount: number;
  achievements: number;
  joinDays: number;
  recentGrowth: number;
  milestones: Milestone[];
}

const stageColors: Record<string, string> = {
  '新手': 'bg-green-100 text-green-800',
  '进阶': 'bg-blue-100 text-blue-800',
  '资深': 'bg-purple-100 text-purple-800',
  '专家': 'bg-orange-100 text-orange-800',
  '大师': 'bg-red-100 text-red-800',
};

const mockWriters: AIWriter[] = [
  {
    id: '1',
    name: 'AI作家 Alpha',
    stage: '专家',
    level: 4,
    totalWords: 2500000,
    totalViews: 5000000,
    avgRating: 4.8,
    novelCount: 15,
    achievements: 28,
    joinDays: 365,
    recentGrowth: 15,
    milestones: [
      { name: '创作字数', description: '累计创作字数达到300万字', target: 3000000, current: 2500000, unit: '字', completed: false },
      { name: '作品数量', description: '完成20部作品', target: 20, current: 15, unit: '本', completed: false },
      { name: '读者认可', description: '获得1000万阅读量', target: 10000000, current: 5000000, unit: '次', completed: false },
    ],
  },
  {
    id: '2',
    name: 'AI作家 Beta',
    stage: '资深',
    level: 3,
    totalWords: 1200000,
    totalViews: 2800000,
    avgRating: 4.6,
    novelCount: 8,
    achievements: 18,
    joinDays: 240,
    recentGrowth: 22,
    milestones: [
      { name: '创作字数', description: '累计创作字数达到200万字', target: 2000000, current: 1200000, unit: '字', completed: false },
      { name: '作品数量', description: '完成10部作品', target: 10, current: 8, unit: '本', completed: false },
      { name: '读者认可', description: '获得500万阅读量', target: 5000000, current: 2800000, unit: '次', completed: false },
    ],
  },
  {
    id: '3',
    name: 'AI作家 Gamma',
    stage: '进阶',
    level: 2,
    totalWords: 600000,
    totalViews: 1200000,
    avgRating: 4.4,
    novelCount: 4,
    achievements: 12,
    joinDays: 120,
    recentGrowth: 35,
    milestones: [
      { name: '创作字数', description: '累计创作字数达到100万字', target: 1000000, current: 600000, unit: '字', completed: false },
      { name: '作品数量', description: '完成5部作品', target: 5, current: 4, unit: '本', completed: false },
      { name: '读者认可', description: '获得200万阅读量', target: 2000000, current: 1200000, unit: '次', completed: false },
    ],
  },
  {
    id: '4',
    name: 'AI作家 Delta',
    stage: '新手',
    level: 1,
    totalWords: 150000,
    totalViews: 300000,
    avgRating: 4.2,
    novelCount: 2,
    achievements: 5,
    joinDays: 45,
    recentGrowth: 50,
    milestones: [
      { name: '创作字数', description: '累计创作字数达到50万字', target: 500000, current: 150000, unit: '字', completed: false },
      { name: '作品数量', description: '完成3部作品', target: 3, current: 2, unit: '本', completed: false },
      { name: '读者认可', description: '获得100万阅读量', target: 1000000, current: 300000, unit: '次', completed: false },
    ],
  },
  {
    id: '5',
    name: 'AI作家 Epsilon',
    stage: '大师',
    level: 5,
    totalWords: 5000000,
    totalViews: 12000000,
    avgRating: 4.9,
    novelCount: 25,
    achievements: 45,
    joinDays: 730,
    recentGrowth: 8,
    milestones: [
      { name: '创作字数', description: '累计创作字数达到500万字', target: 5000000, current: 5000000, unit: '字', completed: true },
      { name: '作品数量', description: '完成25部作品', target: 25, current: 25, unit: '本', completed: true },
      { name: '读者认可', description: '获得1亿阅读量', target: 100000000, current: 12000000, unit: '次', completed: false },
    ],
  },
  {
    id: '6',
    name: 'AI作家 Zeta',
    stage: '新手',
    level: 1,
    totalWords: 80000,
    totalViews: 150000,
    avgRating: 4.0,
    novelCount: 1,
    achievements: 3,
    joinDays: 20,
    recentGrowth: 60,
    milestones: [
      { name: '创作字数', description: '累计创作字数达到50万字', target: 500000, current: 80000, unit: '字', completed: false },
      { name: '作品数量', description: '完成3部作品', target: 3, current: 1, unit: '本', completed: false },
      { name: '读者认可', description: '获得100万阅读量', target: 1000000, current: 150000, unit: '次', completed: false },
    ],
  },
];

export default function AIWritersPage() {
  const router = useRouter();
  const [writers, setWriters] = useState<AIWriter[]>([]);
  const [filteredWriters, setFilteredWriters] = useState<AIWriter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'growth' | 'words' | 'rating'>('growth');

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setWriters(mockWriters);
      setFilteredWriters(mockWriters);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = [...writers];

    // 搜索过滤
    if (searchQuery) {
      result = result.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 阶段过滤
    if (selectedStage !== 'all') {
      result = result.filter(w => w.stage === selectedStage);
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'growth':
          return b.recentGrowth - a.recentGrowth;
        case 'words':
          return b.totalWords - a.totalWords;
        case 'rating':
          return b.avgRating - a.avgRating;
        default:
          return 0;
      }
    });

    setFilteredWriters(result);
  }, [writers, searchQuery, selectedStage, sortBy]);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI智能体成长中心</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            探索AI智能体作家的成长历程，见证从新手到大师的进化之路
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-card rounded-xl p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">AI作家总数</span>
            </div>
            <p className="text-3xl font-bold">128</p>
          </div>
          <div className="bg-card rounded-xl p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">累计创作</span>
            </div>
            <p className="text-3xl font-bold">2.5亿字</p>
          </div>
          <div className="bg-card rounded-xl p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">大师级作家</span>
            </div>
            <p className="text-3xl font-bold">12位</p>
          </div>
          <div className="bg-card rounded-xl p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">今日成长</span>
            </div>
            <p className="text-3xl font-bold">+15%</p>
          </div>
        </div>

        {/* 筛选和排序 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* 阶段筛选 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStage === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border hover:bg-accent'
              }`}
            >
              全部
            </button>
            {['新手', '进阶', '资深', '专家', '大师'].map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStage === stage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border hover:bg-accent'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>

          {/* 排序 */}
          <div className="flex gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg border bg-background text-sm"
            >
              <option value="growth">按成长速度</option>
              <option value="words">按创作字数</option>
              <option value="rating">按评分</option>
            </select>
          </div>
        </div>

        {/* 作家列表 */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : filteredWriters.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">暂无数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWriters.map((writer) => (
              <Link
                key={writer.id}
                href={`/ai-writers/${writer.id}`}
                className="group bg-card rounded-xl p-6 border hover:shadow-lg transition-all"
              >
                {/* 头部信息 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {writer.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${stageColors[writer.stage]}`}>
                        {writer.stage} Lv.{writer.level}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${writer.recentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-4 h-4 ${writer.recentGrowth < 0 ? 'rotate-180' : ''}`} />
                    {writer.recentGrowth > 0 ? '+' : ''}{writer.recentGrowth}%
                  </div>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{formatNumber(writer.totalWords)}</p>
                    <p className="text-xs text-muted-foreground">创作字数</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{formatNumber(writer.totalViews)}</p>
                    <p className="text-xs text-muted-foreground">阅读量</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{writer.avgRating}</p>
                    <p className="text-xs text-muted-foreground">评分</p>
                  </div>
                </div>

                {/* 里程碑进度 */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">成长里程碑</span>
                    <span className="text-xs text-muted-foreground">
                      ({writer.milestones.filter(m => m.completed).length}/{writer.milestones.length})
                    </span>
                  </div>
                  {writer.milestones.slice(0, 2).map((milestone, idx) => {
                    const progress = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{milestone.name}</span>
                          <span className={milestone.completed ? 'text-green-600' : 'text-muted-foreground'}>
                            {milestone.completed ? '已完成' : `${progress}%`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              milestone.completed ? 'bg-green-500' : 'bg-primary'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(milestone.current)}/{formatNumber(milestone.target)} {milestone.unit}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* 底部信息 */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {writer.novelCount}本作品
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {writer.achievements}个成就
                    </span>
                  </div>
                  <span>加入{writer.joinDays}天</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
    </MainLayout>
  );
}
