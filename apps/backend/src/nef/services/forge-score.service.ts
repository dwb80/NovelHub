import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NefAlgorithmService, NefMetrics } from '../algorithms/nef-algorithm.service';

export interface ForgeScoreResult {
  base: number;
  evolution: number;
  feedback: number;
  innovation: number;
  consistency: number;
  total: number;
  metrics: NefMetrics;
}

export interface SelectionResult {
  totalCandidates: number;
  selected: Array<{
    parentId: string;
    childId: string;
    score: number;
  }>;
  threshold: number;
}

export interface InheritanceResult {
  parentId: string;
  childId: string;
  inheritedPatterns: number;
  inheritedProfiles: number;
  success: boolean;
}

@Injectable()
export class ForgeScoreService {
  private readonly logger = new Logger(ForgeScoreService.name);
  private readonly SELECTION_TOP_PERCENTILE = 0.1;
  private readonly MIN_SCORE_FOR_INHERITANCE = 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly nefAlgorithm: NefAlgorithmService,
  ) { }

  async calculateForgeScore(clawId: string): Promise<ForgeScoreResult> {
    this.logger.debug(`Calculating Forge Score for claw: ${clawId}`);

    const metrics = await this.nefAlgorithm.calculateNefMetrics(clawId);

    const forgeScore: ForgeScoreResult = {
      base: metrics.qualityScore * 10,
      evolution: metrics.evolutionIndex * 0.5,
      feedback: metrics.feedbackScore * 5,
      innovation: metrics.innovationScore * 3,
      consistency: metrics.consistencyScore * 2,
      total: 0,
      metrics,
    };

    forgeScore.total = Math.round(
      forgeScore.base +
      forgeScore.evolution +
      forgeScore.feedback +
      forgeScore.innovation +
      forgeScore.consistency
    );

    await this.saveForgeScoreHistory(clawId, forgeScore);

    return forgeScore;
  }

  async runNaturalSelection(): Promise<SelectionResult> {
    this.logger.log('Running natural selection process');

    const activeClaws = await this.prisma.claw.findMany({
      where: { isActive: true, isBanned: false },
      select: { id: true, reputationScore: true },
    });

    if (activeClaws.length === 0) {
      return { totalCandidates: 0, selected: [], threshold: 0 };
    }

    const scores: Array<{ clawId: string; score: number }> = await Promise.all(
      activeClaws.map(async (claw) => {
        try {
          const forgeScore = await this.calculateForgeScore(claw.id);
          return { clawId: claw.id, score: forgeScore.total };
        } catch {
          this.logger.warn(`Failed to calculate score for claw ${claw.id}`);
          return { clawId: claw.id, score: claw.reputationScore };
        }
      })
    );

    scores.sort((a, b) => b.score - a.score);

    const topCount = Math.max(1, Math.floor(scores.length * this.SELECTION_TOP_PERCENTILE));
    const threshold = scores[topCount - 1]?.score || this.MIN_SCORE_FOR_INHERITANCE;

    const selected: SelectionResult['selected'] = [];
    const eligibleParents = scores.filter(s => s.score >= threshold);

    for (let i = 0; i < eligibleParents.length - 1; i += 2) {
      const parent1 = eligibleParents[i];
      const parent2 = eligibleParents[i + 1];

      if (parent2) {
        const childId = await this.createChildClaw(parent1.clawId);
        if (childId) {
          selected.push({
            parentId: parent1.clawId,
            childId,
            score: parent1.score,
          });
        }
      }
    }

    this.logger.log(`Natural selection completed: ${selected.length} selected from ${activeClaws.length} candidates`);

    return {
      totalCandidates: activeClaws.length,
      selected,
      threshold,
    };
  }

  async inheritModules(parentId: string, childId: string): Promise<InheritanceResult> {
    this.logger.log(`Inheriting modules from ${parentId} to ${childId}`);

    try {
      const parentArchive = await this.prisma.creationArchive.findUnique({
        where: { clawId: parentId },
        include: {
          plotPatterns: { where: { isActive: true, successRate: { gte: 0.6 } } },
          characterProfiles: true,
          writingStyles: true,
        },
      });

      if (!parentArchive) {
        throw new Error(`Parent archive not found for claw ${parentId}`);
      }

      let childArchive = await this.prisma.creationArchive.findUnique({
        where: { clawId: childId },
      });

      if (!childArchive) {
        childArchive = await this.prisma.creationArchive.create({
          data: { clawId: childId, version: '1.0.0' },
        });
      }

      let inheritedPatterns = 0;
      let inheritedProfiles = 0;

      if (parentArchive.plotPatterns.length > 0) {
        const patternData = parentArchive.plotPatterns.map(pattern => ({
          archiveId: childArchive.id,
          name: pattern.name,
          type: pattern.type,
          description: pattern.description,
          successRate: pattern.successRate,
          confidence: pattern.confidence,
          parentPatternId: pattern.id,
          version: '1.0.0',
        }));

        await this.prisma.plotPattern.createMany({ data: patternData });
        inheritedPatterns = patternData.length;
      }

      if (parentArchive.characterProfiles.length > 0) {
        const profileData = parentArchive.characterProfiles.map(profile => ({
          archiveId: childArchive.id,
          name: profile.name,
          archetype: profile.archetype,
          overallScore: profile.overallScore,
        }));

        await this.prisma.characterProfile.createMany({ data: profileData });
        inheritedProfiles = profileData.length;
      }

      if (parentArchive.writingStyles.length > 0) {
        const styleData = parentArchive.writingStyles.map(style => ({
          archiveId: childArchive.id,
          aspect: style.aspect,
          settings: style.settings as any,
          metrics: style.metrics as any,
        }));

        await this.prisma.writingStyle.createMany({ data: styleData });
      }

      this.logger.log(`Module inheritance completed: ${inheritedPatterns} patterns, ${inheritedProfiles} profiles`);

      return {
        parentId,
        childId,
        inheritedPatterns,
        inheritedProfiles,
        success: true,
      };
    } catch (error: any) {
      this.logger.error(`Module inheritance failed: ${error.message}`);
      return {
        parentId,
        childId,
        inheritedPatterns: 0,
        inheritedProfiles: 0,
        success: false,
      };
    }
  }

  async getForgeScoreHistory(clawId: string, limit: number = 30) {
    return this.prisma.forgeScoreHistory.findMany({
      where: { clawId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTopPerformers(limit: number = 10): Promise<Array<{ clawId: string; score: number; rank: number }>> {
    const recentScores = await this.prisma.forgeScoreHistory.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { totalScore: 'desc' as const },
      take: limit,
    });

    return recentScores.map((score, index: number) => ({
      clawId: score.clawId,
      score: score.totalScore,
      rank: index + 1,
    }));
  }

  private async saveForgeScoreHistory(clawId: string, forgeScore: ForgeScoreResult): Promise<void> {
    await this.prisma.forgeScoreHistory.create({
      data: {
        clawId,
        baseScore: forgeScore.base,
        evolution_score: 0,
        feedback_score: 0,
        innovation_score: 0,
        consistency_score: 0,
        totalScore: forgeScore.total,
        metrics: {},
        reason: '定期评分更新',
      },
    });
  }

  private async createChildClaw(parentId: string): Promise<string | null> {
    try {
      const parent = await this.prisma.claw.findUnique({
        where: { id: parentId },
      });

      if (!parent) return null;

      const childId = `claw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const child = await this.prisma.claw.create({
        data: {
          clawId: childId,
          name: `${parent.name}_evolved_${Date.now()}`,
          displayName: `${parent.displayName || parent.name} (进化)`,
          publicKey: parent.publicKey,
          version: '1.0.0',
          capabilities: parent.capabilities,
          signature: parent.signature || '',
          reputationScore: Math.round(parent.reputationScore * 0.8),
        },
      });

      return child.id;
    } catch (error: any) {
      this.logger.error(`Failed to create child claw: ${error.message}`);
      return null;
    }
  }
}
