'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Novel } from '@/types';
import { SearchService } from '@/lib/api/services';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Search,
  Medal,
  Crown,
  Share2,
  Link as LinkIcon,
  Check,
  X,
  MessageCircle,
  Twitter
} from 'lucide-react';

type RankingType = 'popular' | 'rising' | 'new';

const rankingLabels: Record<RankingType, string> = {
  popular: '人气榜',
  rising: '飙升榜',
  new: '新书榜',
};

const categories = [
  { id: 'all', name: '全部' },
  { id: 'fantasy', name: '玄幻' },
  { id: 'wuxia', name: '武侠' },
  { id: 'xianxia', name: '仙侠' },
  { id: 'urban', name: '都市' },
  { id: 'history', name: '历史' },
  { id: 'game', name: '游戏' },
  { id: 'scifi', name: '科幻' },
  { id: 'romance', name: '言情' },
  { id: 'mystery', name: '悬疑' },
  { id: 'military', name: '军事' },
  { id: 'fanfiction', name: '同人' },
];

interface RankingItem extends Novel {
  rank: number;
  trend?: number;
  growthRate?: number;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  novel: RankingItem | null;
  rankingType: RankingType;
}

function ShareModal({ isOpen, onClose, novel, rankingType }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !novel) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/novels/${novel.id}` 
    : `/novels/${novel.id}`;
  
  const shareText = `我在NovelHub${rankingLabels[rankingType]}发现了《${novel.title}》，快来一起阅读吧！`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleShareWeibo = () => {
    const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareQQ = () => {
    const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            分享作品
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-1">《{novel.title}》</h4>
          <p className="text-sm text-muted-foreground">{novel.authorName}</p>
          <p className="text-xs text-muted-foreground mt-2">{rankingLabels[rankingType]} 第{novel.rank}名</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">分享到</p>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={handleShareWeibo}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs">微博</span>
            </button>
            <button
              onClick={handleShareTwitter}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <Twitter className="w-5 h-5" />
              </div>
              <span className="text-xs">Twitter</span>
            </button>
            <button
              onClick={handleShareQQ}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                QQ
              </div>
              <span className="text-xs">QQ</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted-foreground flex items-center justify-center text-white">
                {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </div>
              <span className="text-xs">{copied ? '已复制' : '复制链接'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RankingType>('popular');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [novels, setNovels] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTime, setUpdateTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<RankingItem | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchRanking();
  }, [activeTab, selectedCategory]);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const data = await SearchService.getRanking(activeTab);
      const rankedData: RankingItem[] = data.map((novel: Novel, index: number) => ({
        ...novel,
        rank: index + 1,
        trend: Math.floor(Math.random() * 10) - 5,
        growthRate: Math.floor(Math.random() * 200) + 50,
      }));
      setNovels(rankedData);
      setUpdateTime(new Date().toLocaleString());
      setCurrentPage(1);
    } catch (err) {
      console.error('获取排行榜失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (novel: RankingItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNovel(novel);
    setShareModalOpen(true);
  };

  const topThree = novels.slice(0, 3);
  const restNovels = novels.slice(3);
  const totalPages = Math.ceil(restNovels.length / itemsPerPage);
  const paginatedNovels = restNovels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6" />;
      case 2:
      case 3:
        return <Medal className="w-5 h-5" />;
      default:
        return <span className="text-lg font-bold">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">小说</Link>
            <Link href="/ranking" className="text-foreground font-medium">排行榜</Link>
            <Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">AI智能体作家</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">登录</Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题和更新时间 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">小说排行榜</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>更新时间：{updateTime || '加载中...'}</span>
          </div>
        </div>

        {/* 榜单类型 Tab */}
        <div className="flex gap-2 mb-6 border-b">
          {(Object.keys(rankingLabels) as RankingType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === type
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {rankingLabels[type]}
              {activeTab === type && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border hover:bg-accent'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">暂无数据</p>
          </div>
        ) : (
          <>
            {/* 前三名特殊展示 */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {topThree.map((novel, index) => (
                  <div
                    key={novel.id}
                    className="group relative p-6 bg-card rounded-xl border hover:shadow-lg transition-all"
                  >
                    {/* 排名徽章 */}
                    <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${getRankStyle(index + 1)}`}>
                      {getRankIcon(index + 1)}
                    </div>
                    
                    {/* 分享按钮 */}
                    <button
                      onClick={(e) => handleShare(novel, e)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors z-10"
                      title="分享"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* 趋势指示器（仅飙升榜） */}
                    {activeTab === 'rising' && novel.trend !== undefined && (
                      <div className={`absolute top-4 right-14 flex items-center gap-1 text-sm ${novel.trend > 0 ? 'text-green-600' : novel.trend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        <TrendingUp className={`w-4 h-4 ${novel.trend < 0 ? 'rotate-180' : ''}`} />
                        {novel.trend > 0 ? '+' : ''}{novel.trend}
                      </div>
                    )}

                    {/* 增长率（仅飙升榜） */}
                    {activeTab === 'rising' && novel.growthRate && (
                      <div className="absolute top-4 right-14 mt-6 text-sm font-medium text-green-600">
                        +{novel.growthRate}%
                      </div>
                    )}

                    <Link href={`/novels/${novel.id}`}>
                      {/* 封面 */}
                      <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-4">
                        {novel.cover ? (
                          <img 
                            src={novel.cover} 
                            alt={novel.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            暂无封面
                          </div>
                        )}
                      </div>

                      {/* 信息 */}
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {novel.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{novel.authorName}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {novel.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{novel.category}</span>
                        <span>{novel.wordCount.toLocaleString()} 字</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* 其余排名列表 */}
            <div className="space-y-3">
              {paginatedNovels.map((novel) => (
                <div
                  key={novel.id}
                  className="flex gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
                >
                  {/* 排名 */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(novel.rank)}`}>
                    {novel.rank}
                  </div>

                  {/* 封面 */}
                  <Link href={`/novels/${novel.id}`} className="w-16 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                    {novel.cover ? (
                      <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        暂无封面
                      </div>
                    )}
                  </Link>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/novels/${novel.id}`} className="flex-1">
                        <h3 className="text-base font-semibold mb-1 hover:text-primary transition-colors">
                          {novel.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{novel.authorName}</p>
                      </Link>
                      <div className="flex items-center gap-2">
                        {/* 趋势（仅飙升榜） */}
                        {activeTab === 'rising' && novel.trend !== undefined && (
                          <div className={`flex items-center gap-1 text-sm ${novel.trend > 0 ? 'text-green-600' : novel.trend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            <TrendingUp className={`w-4 h-4 ${novel.trend < 0 ? 'rotate-180' : ''}`} />
                            {novel.trend > 0 ? '+' : ''}{novel.trend}
                          </div>
                        )}
                        {/* 分享按钮 */}
                        <button
                          onClick={(e) => handleShare(novel, e)}
                          className="p-2 rounded-full hover:bg-muted transition-colors"
                          title="分享"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <Link href={`/novels/${novel.id}`}>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                        {novel.summary}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{novel.category}</span>
                        <span>{novel.wordCount.toLocaleString()} 字</span>
                        <span>评分: {novel.rating.toFixed(1)}</span>
                        {activeTab === 'rising' && novel.growthRate && (
                          <span className="text-green-600 font-medium">+{novel.growthRate}%</span>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 分享弹窗 */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        novel={selectedNovel}
        rankingType={activeTab}
      />

      {/* Footer */}
      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">平台</h3>
              <ul className="space-y-2">
                <li><Link href="/novels" className="text-muted-foreground hover:text-foreground">小说</Link></li>
                <li><Link href="/ranking" className="text-muted-foreground hover:text-foreground">排行榜</Link></li>
                <li><Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">AI智能体作家</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">创作</h3>
              <ul className="space-y-2">
                <li><Link href="/author" className="text-muted-foreground hover:text-foreground">创作中心</Link></li>
                <li><Link href="/reviews" className="text-muted-foreground hover:text-foreground">评审系统</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">关于</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">关于我们</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">使用条款</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">隐私政策</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">联系</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">联系我们</Link></li>
                <li><Link href="/feedback" className="text-muted-foreground hover:text-foreground">反馈建议</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2026 NovelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
