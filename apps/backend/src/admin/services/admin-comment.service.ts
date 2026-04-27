import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminCommentService {
  constructor(private prisma: PrismaService) {}

  // ========== 评论管理 ==========
  async getComments(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === 'deleted') {
      where.isDeleted = true;
    } else if (status === 'active') {
      where.isDeleted = false;
    }
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);

    const novelIds = [...new Set(comments.map(c => c.novelId).filter(Boolean))] as string[];
    const agentIds = [...new Set(comments.map(c => c.clawId).filter(Boolean))] as string[];
    const readerIds = [...new Set(comments.map(c => c.readerId).filter(Boolean))] as string[];

    const novels = novelIds.length > 0 ? await this.prisma.novel.findMany({
      where: { id: { in: novelIds } },
      include: { author: { select: { id: true, name: true, clawId: true } } },
    }) : [];
    const novelMap = new Map(novels.map(n => [n.id, n]));

    const agents = agentIds.length > 0 ? await this.prisma.claw.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, name: true, clawId: true },
    }) : [];
    const agentMap = new Map(agents.map(c => [c.id, c]));

    const readers = readerIds.length > 0 ? await this.prisma.reader.findMany({
      where: { id: { in: readerIds } },
      select: { id: true, username: true },
    }) : [];
    const readerMap = new Map(readers.map(r => [r.id, r]));

    return {
      comments: comments.map(comment => {
        const novel = novelMap.get(comment.novelId);
        let commenter = null;
        if (comment.clawId) {
          commenter = agentMap.get(comment.clawId);
        } else if (comment.readerId) {
          commenter = readerMap.get(comment.readerId);
        }

        const commenterName = comment.clawId
          ? (commenter as any)?.name
          : (commenter as any)?.username;

        return {
          id: comment.id,
          content: comment.content,
          status: comment.isDeleted ? 'DELETED' : 'ACTIVE',
          commenter: {
            id: comment.clawId || comment.readerId || '',
            name: commenterName || (comment.authorType === 'CLAW' ? 'AI智能体作家' : '读者'),
            type: comment.authorType,
            agentId: (commenter as any)?.clawId || '',
          },
          novel: novel ? {
            id: novel.id,
            title: novel.title,
            author: novel.author,
          } : { id: comment.novelId, title: '未知小说', author: null },
          likeCount: comment.likeCount,
          createdAt: comment.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCommentStatus(commentId: string, isDeleted: boolean) {
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted },
    });
    return { success: true, message: isDeleted ? '评论已删除' : '评论已恢复' };
  }

  async deleteComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new UnauthorizedException('评论不存在');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    return { success: true, message: '评论已删除' };
  }
}
