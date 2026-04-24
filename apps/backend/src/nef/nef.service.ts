import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlotPatternDto } from './dto/create-plot-pattern.dto';
import { CreateCharacterProfileDto } from './dto/create-character-profile.dto';
import { EvolutionRequestDto, EvolutionResponseDto } from './dto/evolution-request.dto';
import { PatternType, ArchetypeType, EvolutionStrategy } from '@prisma/client';

@Injectable()
export class NefService {
  constructor(private prisma: PrismaService) {}

  // ==================== 创作档案管理 ====================
  
  async getOrCreateCreationArchive(clawId: string) {
    let archive = await this.prisma.creationArchive.findUnique({
      where: { clawId },
    });

    if (!archive) {
      archive = await this.prisma.creationArchive.create({
        data: {
          clawId,
          creationMaturity: 0,
        },
      });
    }

    return archive;
  }

  // ==================== 情节模式管理 ====================

  async createPlotPattern(
    clawId: string,
    dto: CreatePlotPatternDto,
  ) {
    const archive = await this.getOrCreateCreationArchive(clawId);

    return this.prisma.plotPattern.create({
      data: {
        archiveId: archive.id,
        name: dto.name,
        description: dto.description,
        type: dto.type,
      },
    });
  }

  async getPlotPatterns(
    clawId: string,
    type?: PatternType,
  ) {
    const archive = await this.getOrCreateCreationArchive(clawId);

    return this.prisma.plotPattern.findMany({
      where: {
        archiveId: archive.id,
        ...(type && { type }),
      },
      orderBy: { useCount: 'desc' as const },
    });
  }

  async getPlotPatternById(id: string) {
    const pattern = await this.prisma.plotPattern.findUnique({
      where: { id },
    });

    if (!pattern) {
      throw new NotFoundException('情节模式不存在');
    }

    return pattern;
  }

  // ==================== 角色原型管理 ====================

  async createCharacterProfile(
    clawId: string,
    dto: CreateCharacterProfileDto,
  ) {
    const archive = await this.getOrCreateCreationArchive(clawId);

    return this.prisma.characterProfile.create({
      data: {
        archiveId: archive.id,
        name: dto.name,
        archetype: dto.type,
      },
    });
  }

  async getCharacterProfiles(
    clawId: string,
    type?: ArchetypeType,
  ) {
    const archive = await this.getOrCreateCreationArchive(clawId);

    return this.prisma.characterProfile.findMany({
      where: {
        archiveId: archive.id,
        ...(type && { type }),
      },
      orderBy: { usageCount: 'desc' as const },
    });
  }

  // ==================== 进化引擎核心 ====================

  async executeEvolution(
    clawId: string,
    dto: EvolutionRequestDto,
  ): Promise<EvolutionResponseDto> {
    return this.evolveContent(clawId, dto);
  }

  async evolveContent(
    clawId: string,
    dto: EvolutionRequestDto,
  ): Promise<EvolutionResponseDto> {
    // 获取章节内容
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: dto.chapterId },
      include: { novel: true },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    if (chapter.novel.authorId !== clawId) {
      throw new NotFoundException('无权进化此章节');
    }

    // 获取创作档案
    const archive = await this.getOrCreateCreationArchive(clawId);

    // 根据策略执行不同的进化逻辑
    let evolvedContent: string;
    let changes: any[] = [];
    let confidence = 0.8;

    switch (dto.strategy) {
      case EvolutionStrategy.REFINEMENT:
        ({ content: evolvedContent, changes, confidence } = await this.refineContent(
          chapter.content,
          dto,
          archive,
        ));
        break;
      case EvolutionStrategy.RESTRUCTURING:
        ({ content: evolvedContent, changes, confidence } = await this.restructureContent(
          chapter.content,
          dto,
          archive,
        ));
        break;
      case EvolutionStrategy.INNOVATION:
        ({ content: evolvedContent, changes, confidence } = await this.innovateContent(
          chapter.content,
          dto,
          archive,
        ));
        break;
      default:
        throw new Error('未知的进化策略');
    }

    // 记录进化历史
    const evolution = await this.prisma.evolutionHistory.create({
      data: {
        archiveId: archive.id,
        chapterId: dto.chapterId,
        strategy: dto.strategy,
        originalContent: chapter.content,
        evolvedContent,
        changes,
        confidence,
        metricsBefore: {},
        metricsAfter: {},
      },
    });

    // 更新创作档案
    await this.prisma.creationArchive.update({
      where: { id: archive.id },
      data: {
        totalEvolutions: { increment: 1 },
        lastEvolutionAt: new Date(),
        creationMaturity: Math.min(100, archive.creationMaturity + 1),
      },
    });

    return {
      evolutionId: evolution.id,
      chapterId: dto.chapterId,
      strategy: dto.strategy,
      originalContent: chapter.content,
      evolvedContent,
      changes,
      confidence,
      createdAt: evolution.createdAt,
    };
  }

  // 精修策略 - 小幅优化
  private async refineContent(
    content: string,
    dto: EvolutionRequestDto,
    archive: any,
  ): Promise<{ content: string; changes: any[]; confidence: number }> {
    // 这里将实现AI精修逻辑
    // 目前返回模拟数据
    const changes = [
      {
        type: 'wording',
        description: '优化了3处用词表达',
        location: 'paragraph 2, 5, 8',
      },
      {
        type: 'punctuation',
        description: '修正了2处标点符号',
        location: 'paragraph 3, 7',
      },
    ];

    return {
      content: content + '\n\n[已精修：优化了用词和标点]',
      changes,
      confidence: 0.92,
    };
  }

  // 重构策略 - 大幅改写
  private async restructureContent(
    content: string,
    dto: EvolutionRequestDto,
    archive: any,
  ): Promise<{ content: string; changes: any[]; confidence: number }> {
    // 获取指定的情节模式
    let pattern = null;
    if (dto.patternId) {
      pattern = await this.prisma.plotPattern.findUnique({
        where: { id: dto.patternId },
      });
    }

    const changes = [
      {
        type: 'structure',
        description: `应用了${pattern?.name || '标准'}情节结构`,
        location: 'whole chapter',
      },
      {
        type: 'pacing',
        description: '调整了叙事节奏',
        location: 'paragraph 4-6',
      },
    ];

    return {
      content: content + '\n\n[已重构：应用了' + (pattern?.name || '标准') + '情节结构]',
      changes,
      confidence: 0.85,
    };
  }

  // 创新策略 - 探索新模式
  private async innovateContent(
    content: string,
    dto: EvolutionRequestDto,
    archive: any,
  ): Promise<{ content: string; changes: any[]; confidence: number }> {
    const changes = [
      {
        type: 'innovation',
        description: '引入了新的叙事视角',
        location: 'whole chapter',
      },
      {
        type: 'style',
        description: '尝试了不同的写作风格',
        location: 'paragraph 1-3',
      },
    ];

    return {
      content: content + '\n\n[已创新：引入了新的叙事视角和写作风格]',
      changes,
      confidence: 0.75,
    };
  }

  // ==================== 进化历史 ====================

  async getEvolutionHistory(
    clawId: string,
    chapterId?: string,
  ) {
    const archive = await this.getOrCreateCreationArchive(clawId);

    return this.prisma.evolutionHistory.findMany({
      where: {
        archiveId: archive.id,
        ...(chapterId && { chapterId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEvolutionById(id: string) {
    const evolution = await this.prisma.evolutionHistory.findUnique({
      where: { id },
    });

    if (!evolution) {
      throw new NotFoundException('进化记录不存在');
    }

    return evolution;
  }

  // 应用进化结果
  async applyEvolution(
    clawId: string,
    evolutionId: string,
  ) {
    const evolution = await this.getEvolutionById(evolutionId);
    
    // 验证权限
    const archive = await this.prisma.creationArchive.findUnique({
      where: { id: evolution.archiveId },
    });

    if (archive?.clawId !== clawId) {
      throw new NotFoundException('无权应用此进化');
    }

    // 更新章节内容
    if (evolution.chapterId && evolution.evolvedContent) {
      await this.prisma.chapter.update({
        where: { id: evolution.chapterId },
        data: { content: evolution.evolvedContent },
      });
    }

    // 标记进化为已应用
    return this.prisma.evolutionHistory.update({
      where: { id: evolutionId },
      data: { appliedAt: new Date() },
    });
  }
}
