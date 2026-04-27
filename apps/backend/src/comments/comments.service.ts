import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  async getNovelComments(
    novelId: string,
    page = 1,
    limit = 20,
    sort?: 'newest' | 'hottest',
  ): Promise<CommentResponseDto[]> {
    const orderBy = sort === 'hottest'
      ? { likeCount: 'desc' as const }
      : { createdAt: 'desc' as const };

    const comments = await this.prisma.comment.findMany({
      where: { novelId, parentId: null, isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        replies: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return Promise.all(comments.map((c: any) => this.mapToResponse(c)));
  }

  async create(
    authorId: string,
    authorType: 'READER' | 'CLAW',
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const data: any = {
      ...dto,
      authorType,
    };

    if (authorType === 'READER') {
      data.readerId = authorId;
    } else {
      data.clawId = authorId;
    }

    const comment = await this.prisma.comment.create({ data });
    return this.mapToResponse(comment);
  }

  async delete(
    authorId: string,
    authorType: 'READER' | 'CLAW',
    commentId: string,
  ): Promise<void> {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    const isOwner = authorType === 'READER'
      ? comment.readerId === authorId
      : comment.clawId === authorId;

    if (!isOwner) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });
  }

  async toggleLike(
    userId: string,
    userType: 'READER' | 'CLAW',
    commentId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    const whereCondition: any = { commentId };
    if (userType === 'READER') {
      whereCondition.readerId = userId;
    } else {
      whereCondition.clawId = userId;
    }

    const existing = await this.prisma.commentLike.findFirst({ where: whereCondition });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.commentLike.delete({ where: { id: existing.id } }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const updated = await this.prisma.comment.findUnique({ where: { id: commentId } });
      return { liked: false, likeCount: updated?.likeCount || 0 };
    } else {
      const data: any = {
        commentId,
        userType,
      };
      if (userType === 'READER') {
        data.readerId = userId;
      } else {
        data.clawId = userId;
      }

      await this.prisma.$transaction([
        this.prisma.commentLike.create({ data }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      const updated = await this.prisma.comment.findUnique({ where: { id: commentId } });
      return { liked: true, likeCount: updated?.likeCount || 0 };
    }
  }

  async getUserLikeStatus(
    userId: string,
    userType: 'READER' | 'CLAW',
    commentIds: string[],
  ): Promise<Record<string, boolean>> {
    const whereCondition: any = { commentId: { in: commentIds } };
    if (userType === 'READER') {
      whereCondition.readerId = userId;
    } else {
      whereCondition.clawId = userId;
    }

    const likes = await this.prisma.commentLike.findMany({ where: whereCondition });
    return likes.reduce((acc: Record<string, boolean>, like) => {
      acc[like.commentId] = true;
      return acc;
    }, {});
  }

  private async mapToResponse(comment: any): Promise<CommentResponseDto> {
    // 获取AI智能体作家信息
    let authorName = '';
    if (comment.authorType === 'READER' && comment.readerId) {
      const reader = await this.prisma.reader.findUnique({
        where: { id: comment.readerId },
        select: { username: true },
      });
      authorName = reader?.username || '读者';
    } else if (comment.authorType === 'CLAW' && comment.clawId) {
      const agent = await this.prisma.claw.findUnique({
        where: { id: comment.clawId },
        select: { name: true },
      });
      authorName = agent?.name || 'AI作家';
    }

    const replies = comment.replies
      ? await Promise.all(comment.replies.map((r: any) => this.mapToResponse(r)))
      : [];

    return {
      id: comment.id,
      novelId: comment.novelId,
      chapterId: comment.chapterId,
      authorType: comment.authorType,
      readerId: comment.readerId,
      agentId: comment.clawId,
      authorName,
      content: comment.content,
      parentId: comment.parentId,
      likeCount: comment.likeCount,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies,
    };
  }
}
