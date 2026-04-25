'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { Novel } from '@/types';
import { SearchService } from '@/lib/api/services';
import Image from 'next/image';
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
  Twitter,
  Eye,
  BookOpen,
  Star
} from 'lucide-react';

type RankingType = 'hot' | 'new' | 'rating';

const rankingLabels: Record<RankingType, string> = {
  hot: '人气榜',
  new: '新书榜',
  rating: '评分榜',
};

// 与后端 NovelCategory 枚举保持一致
const categories = [
  { id: 'all', name: '全部' },
  { id: 'XUANHUAN', name: '玄幻' },
  { id: 'WUXIA', name: '武侠' },
  { id: 'XIANXIA', name: '仙侠' },
  { id: 'DUSHI', name: '都市' },
  { id: 'LISHI', name: '历史' },
  { id: 'YOUXI', name: '游戏' },
  { id: 'KEHUAN', name: '科幻' },
  { id: 'XIANQING', name: '言情' },
  { id: 'XUANYI', name: '悬疑' },
  { id: 'JUNSHI', name: '军事' },
  { id: 'TONGREN', name: '同人' },
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
  const [activeTab, setActiveTab] = useState<RankingType>('hot');
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

  const formatViewCount = (count: number): string => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  const formatWordCount = (count: number): string => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万字';
    }
    return count.toString() + '字';
  };

  return (
    <MainLayout>
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
              className={`px-6 py-3 font-medium transition-colors relative ${activeTab === type
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
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
            {/* 前三名特殊展示 - 水印式布局（缩小30%） */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 max-w-4xl mx-auto">
                {topThree.map((novel, index) => (
                  <div
                    key={novel.id}
                    className="group relative"
                  >
                    <Link href={`/novels/${novel.id}`}>
                      {/* 封面图容器 - 文字叠加在图片上 */}
                      <div className="aspect-[4/5] relative rounded-lg overflow-hidden bg-muted shadow-md">
                        {novel.cover ? (
                          <Image
                            src={novel.cover}
                            alt={novel.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="text-3xl">📖</span>
                          </div>
                        )}

                        {/* 排名徽章 - 左上角 */}
                        <div className={`absolute top-0 left-0 w-10 h-10 rounded-br-xl flex items-center justify-center shadow-md z-10 ${getRankStyle(index + 1)}`}>
                          {getRankIcon(index + 1)}
                        </div>

                        {/* 分享按钮 - 右上角 */}
                        <button
                          onClick={(e) => handleShare(novel, e)}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10 backdrop-blur-sm"
                          title="分享"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>

                        {/* 趋势指示器（仅评分榜） */}
                        {activeTab === 'rating' && novel.trend !== undefined && (
                          <div className={`absolute top-1.5 right-9 flex items-center gap-0.5 px-1.5 py-0 rounded-full text-xs backdrop-blur-sm ${novel.trend > 0 ? 'bg-green-500/80 text-white' : novel.trend < 0 ? 'bg-red-500/80 text-white' : 'bg-muted/80'}`}>
                            <TrendingUp className={`w-3 h-3 ${novel.trend < 0 ? 'rotate-180' : ''}`} />
                            {novel.trend > 0 ? '+' : ''}{novel.trend}
                          </div>
                        )}

                        {/* 底部渐变遮罩 + 文字信息 */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-14 pb-2.5 px-2.5">
                          {/* 标题 */}
                          <h3 className="text-sm font-bold text-white truncate mb-0.5 drop-shadow-md">
                            {novel.title}
                          </h3>

                          {/* 作者 */}
                          <p className="text-xs text-white/80 truncate mb-1">
                            {novel.authorName}
                          </p>

                          {/* 分类标签 */}
                          <div className="flex flex-wrap gap-1 mb-1">
                            <span className="px-1.5 py-0 text-xs rounded-full bg-white/20 text-white backdrop-blur-sm">
                              {novel.category}
                            </span>
                            {activeTab === 'rating' && novel.growthRate && (
                              <span className="px-1.5 py-0 text-xs rounded-full bg-green-500/80 text-white backdrop-blur-sm">
                                +{novel.growthRate}%
                              </span>
                            )}
                          </div>

                          {/* 统计信息 */}
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3" />
                              {formatViewCount(novel.viewCount || 0)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <BookOpen className="w-3 h-3" />
                              {formatWordCount(novel.wordCount)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {novel.rating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* 其余排名列表 - 列表式布局，保留封面，数据项横向排列 */}
            <div className="space-y-2">
              {paginatedNovels.map((novel) => (
                <div
                  key={novel.id}
                  className="flex gap-3 p-3 bg-card rounded-lg border hover:shadow-md transition-shadow"
                >
                  {/* 排名 */}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(novel.rank)}`}>
                    {novel.rank}
                  </div>

                  {/* 封面 */}
                  <Link href={`/novels/${novel.id}`} className="w-14 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                    {novel.cover ? (
                      <Image src={novel.cover} alt={novel.title} width={56} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        📖
                      </div>
                    )}
                  </Link>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/novels/${novel.id}`} className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold mb-0.5 hover:text-primary transition-colors truncate">
                          {novel.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{novel.authorName}</p>
                      </Link>
                      <div className="flex items-center gap-2">
                        {/* 趋势（仅评分榜） */}
                        {activeTab === 'rating' && novel.trend !== undefined && (
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
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-1.5">
                        {novel.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-muted">{novel.category}</span>
                        <span>{novel.wordCount.toLocaleString()} 字</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {novel.rating.toFixed(1)}
                        </span>
                        {activeTab === 'rating' && novel.growthRate && (
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
    </MainLayout>
  );
}
