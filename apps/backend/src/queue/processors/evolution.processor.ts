import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES, JOB_NAMES } from '../../config/queue.config';
import { NefService } from '../../nef/nef.service';
import { ForgeScoreService } from '../../nef/services/forge-score.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface EvolutionJobData {
  clawId: string;
  chapterId: string;
  novelId: string;
  strategy: string;
  patternId?: string;
  options?: Record<string, any>;
}

export interface ForgeScoreJobData {
  clawId: string;
}

export interface NaturalSelectionJobData {}

export interface ModuleInheritanceJobData {
  parentId: string;
  childId: string;
}

@Injectable()
@Processor(QUEUE_NAMES.EVOLUTION)
export class EvolutionProcessor {
  private readonly logger = new Logger(EvolutionProcessor.name);

  constructor(
    private readonly nefService: NefService,
    private readonly forgeScoreService: ForgeScoreService,
    private readonly prisma: PrismaService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed: ${err.message}`, err.stack);
  }

  @Process(JOB_NAMES.EVOLUTION.EVOLVE_CONTENT)
  async handleEvolveContent(job: Job<EvolutionJobData>) {
    const { clawId, chapterId, novelId, strategy, patternId, options } = job.data;
    
    this.logger.log(`Evolving content for chapter ${chapterId} with strategy ${strategy}`);
    
    try {
      const result = await this.nefService.executeEvolution(clawId, {
        chapterId,
        novelId,
        strategy: strategy as any,
        patternId,
        ...options,
      });

      await this.prisma.evolutionHistory.update({
        where: { id: result.evolutionId },
        data: {
          metricsAfter: {
            confidence: result.confidence,
            newLength: result.evolvedContent.length,
            changesCount: result.changes.length,
          },
        },
      });

      return result;
    } catch (error: any) {
      this.logger.error(`Evolution failed for chapter ${chapterId}: ${error.message}`);
      throw error;
    }
  }

  @Process(JOB_NAMES.EVOLUTION.CALCULATE_FORGE_SCORE)
  async handleCalculateForgeScore(job: Job<ForgeScoreJobData>) {
    const { clawId } = job.data;
    
    this.logger.log(`Calculating Forge Score for claw ${clawId}`);
    
    try {
      const forgeScore = await this.forgeScoreService.calculateForgeScore(clawId);
      
      await this.prisma.claw.update({
        where: { id: clawId },
        data: {
          reputationScore: Math.round(forgeScore.total),
        },
      });

      return forgeScore;
    } catch (error: any) {
      this.logger.error(`Forge Score calculation failed for claw ${clawId}: ${error.message}`);
      throw error;
    }
  }

  @Process(JOB_NAMES.EVOLUTION.NATURAL_SELECTION)
  async handleNaturalSelection(job: Job<NaturalSelectionJobData>) {
    this.logger.log('Running natural selection process');
    
    try {
      const selectionResult = await this.forgeScoreService.runNaturalSelection();
      
      for (const selection of selectionResult.selected) {
        await job.queue.add(
          JOB_NAMES.EVOLUTION.MODULE_INHERITANCE,
          { parentId: selection.parentId, childId: selection.childId },
        );
      }

      return {
        totalCandidates: selectionResult.totalCandidates,
        selectedCount: selectionResult.selected.length,
        threshold: selectionResult.threshold,
      };
    } catch (error: any) {
      this.logger.error(`Natural selection failed: ${error.message}`);
      throw error;
    }
  }

  @Process(JOB_NAMES.EVOLUTION.MODULE_INHERITANCE)
  async handleModuleInheritance(job: Job<ModuleInheritanceJobData>) {
    const { parentId, childId } = job.data;
    
    this.logger.log(`Inheriting modules from ${parentId} to ${childId}`);
    
    try {
      const result = await this.forgeScoreService.inheritModules(parentId, childId);
      
      return result;
    } catch (error: any) {
      this.logger.error(`Module inheritance failed: ${error.message}`);
      throw error;
    }
  }
}
