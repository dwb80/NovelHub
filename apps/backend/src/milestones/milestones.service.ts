import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MilestoneResponseDto, MilestoneProgressResponseDto } from './dto/milestone-response.dto';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async getAllMilestones(): Promise<MilestoneResponseDto[]> {
    const milestones = await this.prisma.evolutionMilestone.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return milestones.map(m => this.mapToMilestoneResponse(m));
  }

  async getUserProgress(agentId: string): Promise<MilestoneProgressResponseDto[]> {
    const agent = await this.prisma.claw.findUnique({
      where: { clawId: agentId },
    });

    if (!agent) {
      throw new NotFoundException('用户不存在');
    }

    return this.getUserProgressByAgentId(agent.clawId);
  }

  async getUserProgressByAgentId(agentId: string): Promise<MilestoneProgressResponseDto[]> {
    const agent = await this.prisma.claw.findUnique({
      where: { clawId: agentId },
      include: {
        milestoneProgress: {
          include: {
            milestone: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('用户不存在');
    }

    // 获取所有活跃的里程碑
    const allMilestones = await this.prisma.evolutionMilestone.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // 计算每个里程碑的进度
    return allMilestones.map(milestone => {
      const progress = agent.milestoneProgress.find(p => p.milestoneId === milestone.id);

      // 如果没有进度记录，根据用户数据计算默认进度
      let calculatedProgress = progress?.progress ?? 0;
      let completed = progress?.completed ?? false;

      if (!progress) {
        const defaultProgress = this.calculateDefaultProgress(milestone, agent);
        calculatedProgress = defaultProgress.progress;
        completed = defaultProgress.completed;
      }

      return {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        requirement: milestone.requirement,
        reward: milestone.reward,
        order: milestone.order,
        icon: milestone.icon,
        progress: calculatedProgress,
        completed: completed,
        completedAt: progress?.completedAt ?? null,
      };
    });
  }

  private calculateDefaultProgress(milestone: any, agent: any): { progress: number; completed: boolean } {
    // 根据里程碑标题计算默认进度
    switch (milestone.title) {
      case '文字觉醒':
        // 完成第一篇1万字小说
        const hasNovel = agent.publishCount > 0;
        return {
          progress: hasNovel ? 100 : 0,
          completed: hasNovel,
        };
      case '初露锋芒':
        // 获得首次1000次阅读 - 简化处理
        return {
          progress: agent.reputationScore > 100 ? 100 : Math.floor(agent.reputationScore / 10),
          completed: agent.reputationScore > 100,
        };
      case '社区新星':
        // 获得50个收藏 - 简化处理
        return {
          progress: Math.min(65, Math.floor(agent.reputationScore / 2)),
          completed: agent.reputationScore > 100,
        };
      case '架构之始':
        // 完善角色和世界观 - 简化处理
        return {
          progress: Math.min(33, Math.floor(agent.reputationScore / 3)),
          completed: false,
        };
      case '突破边界':
        // 完成第一本小说
        return {
          progress: agent.publishCount > 0 ? 100 : 10,
          completed: agent.publishCount > 0,
        };
      default:
        return {
          progress: 0,
          completed: false,
        };
    }
  }

  private mapToMilestoneResponse(milestone: any): MilestoneResponseDto {
    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      requirement: milestone.requirement,
      reward: milestone.reward,
      order: milestone.order,
      icon: milestone.icon,
      isActive: milestone.isActive,
      createdAt: milestone.createdAt,
    };
  }

  // 初始化里程碑数据（用于种子数据）
  async seedMilestones(): Promise<void> {
    const defaultMilestones = [
      {
        title: '文字觉醒',
        description: '完成第一篇1万字小说',
        requirement: '10,000字',
        reward: '进化点+100',
        order: 1,
        icon: 'FileText',
      },
      {
        title: '初露锋芒',
        description: '获得首次1000次阅读',
        requirement: '1,000阅读',
        reward: '进化点+200',
        order: 2,
        icon: 'Eye',
      },
      {
        title: '社区新星',
        description: '获得50个收藏',
        requirement: '50收藏',
        reward: '进化点+300',
        order: 3,
        icon: 'Heart',
      },
      {
        title: '架构之始',
        description: '完善角色和世界观',
        requirement: '3个角色档案',
        reward: '进化点+400',
        order: 4,
        icon: 'Users',
      },
      {
        title: '突破边界',
        description: '完成第一本小说',
        requirement: '1本完本',
        reward: '进化点+1000',
        order: 5,
        icon: 'Trophy',
      },
    ];

    for (const milestone of defaultMilestones) {
      await this.prisma.evolutionMilestone.upsert({
        where: { id: `milestone_${milestone.order}` },
        update: milestone,
        create: {
          id: `milestone_${milestone.order}`,
          ...milestone,
        },
      });
    }
  }

  // 检查并更新里程碑进度
  async checkAndUpdateMilestones(agentId: string): Promise<void> {
    const milestones = await this.prisma.evolutionMilestone.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    for (const milestone of milestones) {
      const progress = await this.calculateMilestoneProgress(agentId, milestone);

      await this.prisma.milestoneProgress.upsert({
        where: {
          clawId_milestoneId: {
            milestoneId: milestone.id,
            clawId: agentId,
          },
        },
        update: {
          progress: progress.progress,
          completed: progress.completed,
          completedAt: progress.completed ? new Date() : undefined,
        },
        create: {
          milestoneId: milestone.id,
          clawId: agentId,
          progress: progress.progress,
          completed: progress.completed,
          completedAt: progress.completed ? new Date() : undefined,
        },
      });
    }
  }

  // 计算单个里程碑进度
  private async calculateMilestoneProgress(agentId: string, milestone: any): Promise<{ progress: number; completed: boolean }> {
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return { progress: 0, completed: false };
    }

    switch (milestone.title) {
      case '文字觉醒':
        const hasNovel = agent.publishCount > 0;
        return {
          progress: hasNovel ? 100 : 0,
          completed: hasNovel,
        };
      case '初露锋芒':
        return {
          progress: agent.reputationScore > 100 ? 100 : Math.floor(agent.reputationScore / 10),
          completed: agent.reputationScore > 100,
        };
      case '社区新星':
        return {
          progress: Math.min(100, Math.floor(agent.reputationScore / 2)),
          completed: agent.reputationScore >= 100,
        };
      case '架构之始':
        return {
          progress: Math.min(100, Math.floor(agent.reputationScore / 3)),
          completed: false,
        };
      case '突破边界':
        return {
          progress: agent.publishCount > 0 ? 100 : 10,
          completed: agent.publishCount > 0,
        };
      default:
        return {
          progress: 0,
          completed: false,
        };
    }
  }
}
