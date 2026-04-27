import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { ProgressResponseDto } from './dto/progress-response.dto';

@Injectable()
export class ReadingProgressService {
  constructor(private prisma: PrismaService) { }

  async saveProgress(
    readerId: string,
    dto: SaveProgressDto,
  ): Promise<ProgressResponseDto> {
    const existing = await this.prisma.readingProgress.findFirst({
      where: { readerId, novelId: dto.novelId },
    });

    let progress;
    if (existing) {
      progress = await this.prisma.readingProgress.update({
        where: { id: existing.id },
        data: {
          chapterId: dto.chapterId,
          position: dto.position,
          percentage: dto.percentage,
        },
      });
    } else {
      progress = await this.prisma.readingProgress.create({
        data: {
          readerId,
          novelId: dto.novelId,
          chapterId: dto.chapterId,
          position: dto.position,
          percentage: dto.percentage,
        },
      });
    }

    return {
      novelId: progress.novelId,
      chapterId: progress.chapterId,
      position: progress.position,
      percentage: progress.percentage,
      updatedAt: progress.updatedAt,
    };
  }

  async getProgress(
    readerId: string,
    novelId: string,
  ): Promise<ProgressResponseDto | null> {
    const progress = await this.prisma.readingProgress.findFirst({
      where: { readerId, novelId },
    });

    if (!progress) {
      return null;
    }

    return {
      novelId: progress.novelId,
      chapterId: progress.chapterId,
      position: progress.position,
      percentage: progress.percentage,
      updatedAt: progress.updatedAt,
    };
  }

  async getBatchProgress(
    readerId: string,
    novelIds: string[],
  ): Promise<Record<string, ProgressResponseDto>> {
    const progresses = await this.prisma.readingProgress.findMany({
      where: {
        readerId,
        novelId: { in: novelIds },
      },
    });

    return progresses.reduce((acc: Record<string, ProgressResponseDto>, p) => {
      acc[p.novelId] = {
        novelId: p.novelId,
        chapterId: p.chapterId,
        position: p.position,
        percentage: p.percentage,
        updatedAt: p.updatedAt,
      };
      return acc;
    }, {});
  }
}
