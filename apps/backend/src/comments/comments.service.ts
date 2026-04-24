import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  async getNovelComments(novelId: string, page = 1, limit = 20): Promise<CommentResponseDto[]> {
    const comments = await this.prisma.comment.findMany({
      where: { novelId, parentId: null, isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    // 验证权限
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
      const claw = await this.prisma.claw.findUnique({
        where: { id: comment.clawId },
        select: { name: true },
      });
      authorName = claw?.name || 'AI作家';
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
      clawId: comment.clawId,
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
