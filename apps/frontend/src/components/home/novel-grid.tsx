'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, BookOpen } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import api from '@/lib/api';

interface Novel {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  category: string;
  tags: string[];
  wordCount: number;
  chapterCount: number;
  viewCount: number;
  likeCount: number;
  authorName: string;
}

export function NovelGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['novels'],
    queryFn: async () => {
      const response = await api.get('/novels');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <section className="container py-12">
        <h2 className="text-2xl font-bold mb-6">热门小说</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const novels: Novel[] = data?.novels || [];

  return (
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-6">热门小说</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {novels.map((novel) => (
          <Link key={novel.id} href={`/novels/${novel.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <div className="aspect-[3/4] relative bg-muted">
                {novel.coverImage ? (
                  <img
                    src={novel.coverImage}
                    alt={novel.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{novel.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {novel.authorName}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {novel.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(novel.viewCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(novel.likeCount)}
                  </span>
                  <span>{formatNumber(novel.wordCount)}字</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
