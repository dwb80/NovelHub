import { Injectable, OnModuleInit } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DataLoaderService implements OnModuleInit {
  private novelLoader: DataLoader<string, any>;
  private chapterLoader: DataLoader<string, any>;
  private authorLoader: DataLoader<string, any>;
  private agentLoader: DataLoader<string, any>;
  private reviewLoader: DataLoader<string, any>;

  constructor(private readonly prisma: PrismaService) { }

  onModuleInit() {
    this.novelLoader = new DataLoader(async (ids: readonly string[]) => {
      const novels = await this.prisma.novel.findMany({
        where: { id: { in: [...ids] } },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      });
      const novelMap = new Map(novels.map((n: any) => [n.id, n]));
      return ids.map((id) => novelMap.get(id) || null);
    });

    this.chapterLoader = new DataLoader(async (ids: readonly string[]) => {
      const chapters = await this.prisma.chapter.findMany({
        where: { id: { in: [...ids] } },
        include: { novel: true },
      });
      const chapterMap = new Map(chapters.map((c: any) => [c.id, c]));
      return ids.map((id) => chapterMap.get(id) || null);
    });

    this.authorLoader = new DataLoader(async (ids: readonly string[]) => {
      const authors = await this.prisma.claw.findMany({
        where: { id: { in: [...ids] } },
        select: {
          id: true,
          name: true,
          clawId: true,
          reputationScore: true,
        },
      });
      const authorMap = new Map(authors.map((a: any) => [a.id, a]));
      return ids.map((id) => authorMap.get(id) || null);
    });

    this.agentLoader = new DataLoader(async (ids: readonly string[]) => {
      const agents = await this.prisma.claw.findMany({
        where: { id: { in: [...ids] } },
        include: { roles: true },
      });
      const agentMap = new Map(agents.map((c: any) => [c.id, c]));
      return ids.map((id) => agentMap.get(id) || null);
    });

    this.reviewLoader = new DataLoader(async (ids: readonly string[]) => {
      const reviews = await this.prisma.review.findMany({
        where: { id: { in: [...ids] } },
        include: {
          task: true,
          reviewer: { select: { id: true, name: true } },
        },
      });
      const reviewMap = new Map(reviews.map((r: any) => [r.id, r]));
      return ids.map((id) => reviewMap.get(id) || null);
    });
  }

  getNovelLoader(): DataLoader<string, any> {
    return this.novelLoader;
  }

  getChapterLoader(): DataLoader<string, any> {
    return this.chapterLoader;
  }

  getAuthorLoader(): DataLoader<string, any> {
    return this.authorLoader;
  }

  getAgentLoader(): DataLoader<string, any> {
    return this.agentLoader;
  }

  getReviewLoader(): DataLoader<string, any> {
    return this.reviewLoader;
  }

  clearAll(): void {
    this.novelLoader.clearAll();
    this.chapterLoader.clearAll();
    this.authorLoader.clearAll();
    this.agentLoader.clearAll();
    this.reviewLoader.clearAll();
  }
}
