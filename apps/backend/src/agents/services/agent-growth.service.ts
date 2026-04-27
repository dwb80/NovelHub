import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface GrowthStage {
  level: number;
  name: string;
  minNovels: number;
}

export interface CreationStats {
  totalWords: number;
  totalViews: number;
  avgRating: number;
  novelCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  unlocked: boolean;
}

export interface AgentGrowthData {
  agentId: string;
  name: string;
  avatar: string | null;
  joinDays: number;
  currentStage: GrowthStage;
  stats: CreationStats;
  achievements: Achievement[];
  milestones: any[];
}

@Injectable()
export class AgentGrowthService {
  constructor(private prisma: PrismaService) {}

  // 成长阶段定义
  private readonly growthStages: GrowthStage[] = [
    { level: 1, name: '新手', minNovels: 0 },
    { level: 2, name: '进阶', minNovels: 1 },
    { level: 3, name: '资深', minNovels: 3 },
    { level: 4, name: '专家', minNovels: 5 },
    { level: 5, name: '大师', minNovels: 10 },
  ];

  // 成就定义
  private readonly achievementsList = [
    {
      id: 'first_novel',
      name: '初出茅庐',
      description: '发布第一本小说',
      icon: 'BookOpen',
      condition: (stats: CreationStats) => stats.novelCount >= 1,
    },
    {
      id: 'five_novels',
      name: '多产作家',
      description: '发布5本小说',
      icon: 'Library',
      condition: (stats: CreationStats) => stats.novelCount >= 5,
    },
    {
      id: 'ten_novels',
      name: '创作大师',
      description: '发布10本小说',
      icon: 'Crown',
      condition: (stats: CreationStats) => stats.novelCount >= 10,
    },
    {
      id: 'million_words',
      name: '百万字成就',
      description: '累计创作100万字',
      icon: 'FileText',
      condition: (stats: CreationStats) => stats.totalWords >= 1000000,
    },
    {
      id: 'high_rating',
      name: '口碑之作',
      description: '平均评分达到4.5分以上',
      icon: 'Star',
      condition: (stats: CreationStats) => stats.avgRating >= 4.5 && stats.novelCount > 0,
    },
  ];

  // 获取AI智能体成长数据
  async getAgentGrowth(agentId: string): Promise<AgentGrowthData> {
    const agent = await this.prisma.claw.findUnique({
      where: { clawId: agentId },
      include: {
        novels: {
          where: { status: 'PUBLISHED' },
          select: {
            wordCount: true,
            viewCount: true,
            rating: true,
            ratingCount: true,
          },
        },
        milestoneProgress: {
          include: {
            milestone: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('AI智能体不存在');
    }

    // 计算加入天数
    const joinDays = Math.floor(
      (Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // 计算创作统计
    const stats = this.calculateStats(agent.novels);

    // 确定当前成长阶段
    const currentStage = this.getCurrentStage(stats.novelCount);

    // 计算成就
    const achievements = this.calculateAchievements(stats, agent.milestoneProgress);

    // 获取里程碑进度
    const milestones = await this.getMilestonesProgress(agent.id, agent.novels);

    return {
      agentId: agent.clawId,
      name: agent.name,
      avatar: agent.avatar,
      joinDays,
      currentStage,
      stats,
      achievements,
      milestones,
    };
  }

  // 计算创作统计
  private calculateStats(novels: any[]): CreationStats {
    const totalWords = novels.reduce((sum, n) => sum + (n.wordCount || 0), 0);
    const totalViews = novels.reduce((sum, n) => sum + (n.viewCount || 0), 0);
    
    const totalRating = novels.reduce((sum, n) => {
      return sum + (n.rating || 0) * (n.ratingCount || 0);
    }, 0);
    const totalRatingCount = novels.reduce((sum, n) => sum + (n.ratingCount || 0), 0);
    const avgRating = totalRatingCount > 0 ? totalRating / totalRatingCount : 0;

    return {
      totalWords,
      totalViews,
      avgRating: Math.round(avgRating * 10) / 10,
      novelCount: novels.length,
    };
  }

  // 获取当前成长阶段
  private getCurrentStage(novelCount: number): GrowthStage {
    for (let i = this.growthStages.length - 1; i >= 0; i--) {
      if (novelCount >= this.growthStages[i].minNovels) {
        return this.growthStages[i];
      }
    }
    return this.growthStages[0];
  }

  // 计算成就
  private calculateAchievements(
    stats: CreationStats,
    milestoneProgress: any[]
  ): Achievement[] {
    return this.achievementsList.map((achievement) => {
      const unlocked = achievement.condition(stats);
      const progressRecord = milestoneProgress.find(
        (p) => p.milestone.title === achievement.name
      );

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        unlocked,
        unlockedAt: progressRecord?.completedAt || null,
      };
    });
  }

  // 获取里程碑进度
  private async getMilestonesProgress(agentId: string, novels: any[]): Promise<any[]> {
    const milestones = await this.prisma.evolutionMilestone.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const progressRecords = await this.prisma.milestoneProgress.findMany({
      where: { clawId: agentId },
    });

    const stats = this.calculateStats(novels);

    return milestones.map((milestone) => {
      const record = progressRecords.find((p) => p.milestoneId === milestone.id);
      const progress = this.calculateMilestoneProgress(milestone, stats);

      return {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        requirement: milestone.requirement,
        reward: milestone.reward,
        progress: record?.progress ?? progress.progress,
        completed: record?.completed ?? progress.completed,
        completedAt: record?.completedAt ?? null,
        order: milestone.order,
        icon: milestone.icon,
      };
    });
  }

  // 计算单个里程碑进度
  private calculateMilestoneProgress(milestone: any, stats: CreationStats): { progress: number; completed: boolean } {
    switch (milestone.title) {
      case '初次创作':
      case '文字觉醒':
        return {
          progress: stats.novelCount > 0 ? 100 : 0,
          completed: stats.novelCount > 0,
        };
      case '积累人气':
        const viewsProgress = Math.min(100, Math.floor((stats.totalViews / 10000) * 100));
        return {
          progress: viewsProgress,
          completed: stats.totalViews >= 10000,
        };
      case '品质保证':
        const ratingProgress = stats.avgRating >= 4.0 ? 100 : Math.floor((stats.avgRating / 4.0) * 100);
        return {
          progress: ratingProgress,
          completed: stats.avgRating >= 4.0 && stats.novelCount > 0,
        };
      case '多产作家':
        const fiveNovelsProgress = Math.min(100, Math.floor((stats.novelCount / 5) * 100));
        return {
          progress: fiveNovelsProgress,
          completed: stats.novelCount >= 5,
        };
      case '百万字成就':
        const wordsProgress = Math.min(100, Math.floor((stats.totalWords / 1000000) * 100));
        return {
          progress: wordsProgress,
          completed: stats.totalWords >= 1000000,
        };
      case '创作大师':
        const tenNovelsProgress = Math.min(100, Math.floor((stats.novelCount / 10) * 100));
        return {
          progress: tenNovelsProgress,
          completed: stats.novelCount >= 10,
        };
      default:
        return {
          progress: 0,
          completed: false,
        };
    }
  }

  // 更新里程碑进度（在小说发布等操作时调用）
  async updateMilestoneProgress(clawId: string): Promise<void> {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
      include: {
        novels: {
          where: { status: 'PUBLISHED' },
          select: {
            wordCount: true,
            viewCount: true,
            rating: true,
            ratingCount: true,
          },
        },
      },
    });

    if (!claw) return;

    const stats = this.calculateStats(claw.novels);
    const milestones = await this.prisma.evolutionMilestone.findMany({
      where: { isActive: true },
    });

    for (const milestone of milestones) {
      const progress = this.calculateMilestoneProgress(milestone, stats);

      await this.prisma.milestoneProgress.upsert({
        where: {
          clawId_milestoneId: {
            clawId: claw.id,
            milestoneId: milestone.id,
          },
        },
        update: {
          progress: progress.progress,
          completed: progress.completed,
          completedAt: progress.completed ? new Date() : undefined,
        },
        create: {
          clawId: claw.id,
          milestoneId: milestone.id,
          progress: progress.progress,
          completed: progress.completed,
          completedAt: progress.completed ? new Date() : null,
        },
      });
    }
  }
}
