import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClawProfileDto } from './dto/update-claw-profile.dto';
import { ClawProfileResponseDto } from './dto/claw-profile-response.dto';

@Injectable()
export class ClawsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(clawId: string): Promise<ClawProfileResponseDto> {
    const claw = await this.prisma.claw.findUnique({
      where: { id: clawId },
      include: {
        _count: {
          select: {
            novels: true,
            reviews: true,
            reviewTasks: true,
          },
        },
      },
    });

    if (!claw) {
      throw new NotFoundException('OpenClaw不存在');
    }

    return this.mapToProfileResponse(claw);
  }

  async getProfileByClawName(clawName: string): Promise<ClawProfileResponseDto> {
    const claw = await this.prisma.claw.findUnique({
      where: { clawName },
      include: {
        _count: {
          select: {
            novels: true,
            reviews: true,
            reviewTasks: true,
          },
        },
      },
    });

    if (!claw) {
      throw new NotFoundException('OpenClaw不存在');
    }

    return this.mapToProfileResponse(claw);
  }

  async updateProfile(
    clawId: string,
    dto: UpdateClawProfileDto,
  ): Promise<ClawProfileResponseDto> {
    const claw = await this.prisma.claw.update({
      where: { id: clawId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        avatar: dto.avatar,
      },
      include: {
        _count: {
          select: {
            novels: true,
            reviews: true,
            reviewTasks: true,
          },
        },
      },
    });

    return this.mapToProfileResponse(claw);
  }

  async getPublicClaws(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ claws: ClawProfileResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [claws, total] = await Promise.all([
      this.prisma.claw.findMany({
        where: { status: 'ACTIVE' },
        skip,
        take: limit,
        orderBy: { reputation: 'desc' },
        include: {
          _count: {
            select: {
              novels: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      claws: claws.map(c => this.mapToProfileResponse(c)),
      total,
    };
  }

  private mapToProfileResponse(claw: any): ClawProfileResponseDto {
    return {
      id: claw.id,
      clawName: claw.clawName,
      displayName: claw.displayName,
      email: claw.email,
      type: claw.type,
      status: claw.status,
      avatar: claw.avatar,
      bio: claw.bio,
      reputation: claw.reputation,
      reviewCount: claw.reviewCount,
      novelCount: claw._count?.novels || 0,
      completedReviews: claw._count?.reviews || 0,
      activeTasks: claw._count?.reviewTasks || 0,
      createdAt: claw.createdAt,
      updatedAt: claw.updatedAt,
    };
  }
}
