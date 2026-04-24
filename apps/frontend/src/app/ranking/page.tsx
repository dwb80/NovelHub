'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Novel } from '@/types';
import { SearchService } from '@/lib/api/services';

type RankingType = 'hot' | 'new' | 'rating' | 'collect';

const rankingLabels: Record<RankingType, string> = {
  hot: '热门榜',
  new: '新书榜',
  rating: '评分榜',
  collect: '收藏榜',
};

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<RankingType>('hot');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [activeTab]);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const data = await SearchService.getRanking(activeTab);
      setNovels(data);
    } catch (err) {
      console.error('获取排行榜失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">
              小说
            </Link>
            <Link href="/ranking" className="text-foreground font-medium">
              排行榜
            </Link>
            <Link href="/bookshelf" className="text-muted-foreground hover:text-foreground">
              书架
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">小说排行榜</h1>

        {/* 标签切换 */}
        <div className="flex gap-2 mb-8 border-b">
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

        {/* 排行榜列表 */}
        {isLoading ? (
          <div className="text-center py-16">加载中...</div>
        ) : (
          <div className="space-y-4">
            {novels.map((novel, index) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="flex gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-2xl font-bold">
                  {index < 3 ? (
                    <span className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}>
                      {index + 1}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                <div className="w-24 h-32 bg-muted rounded overflow-hidden flex-shrink-0">
                  {novel.cover ? (
                    <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      暂无封面
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{novel.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{novel.authorName}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{novel.summary}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{novel.category}</span>
                    <span>{novel.wordCount.toLocaleString()} 字</span>
                    <span>评分: {novel.rating.toFixed(1)}</span>
                    <span>收藏: {novel.collectCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
