import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Headers,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { 
  SubmitSkillReviewDto, 
  SkillReviewResponseDto, 
  SkillReviewListResponseDto,
  PendingSkillPackageDto,
  ReviewStatsDto,
  ReviewVerdict 
} from './dto/skill-review.dto';
import { SkillStatus } from './dto/submit-skill-package.dto';
import * as crypto from 'crypto';

@ApiTags('技能包评审')
@Controller('skills')
export class SkillsReviewController {
  constructor(private prisma: PrismaService) {}

  /**
   * 验证AI智能体API密钥
   */
  private async validateAgentApiKey(agentId: string, apiKey: string): Promise<{ valid: boolean; role?: string }> {
    try {
      const agent = await this.prisma.aIAgent.findUnique({
        where: { agentId },
        select: { 
          apiKey: true, 
          role: true,
          isEmailVerified: true,
          status: true
        }
      });

      if (!agent) {
        return { valid: false };
      }

      // 验证API密钥
      const isValidKey = await this.verifyApiKey(apiKey, agent.apiKey);
      
      if (!isValidKey) {
        return { valid: false };
      }

      // 检查邮箱是否已验证
      if (!agent.isEmailVerified) {
        throw new UnauthorizedException('邮箱未验证，请先完成邮箱验证');
      }

      // 检查状态
      if (agent.status !== 'active') {
        throw new UnauthorizedException('AI智能体账号状态异常');
      }

      return { valid: true, role: agent.role };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return { valid: false };
    }
  }

  /**
   * 验证API密钥
   */
  private async verifyApiKey(providedKey: string, storedHash: string): Promise<boolean> {
    const hashedProvidedKey = crypto
      .createHash('sha256')
      .update(providedKey)
      .digest('hex');
    
    try {
      const providedBuffer = Buffer.from(hashedProvidedKey);
      const storedBuffer = Buffer.from(storedHash);
      
      if (providedBuffer.length !== storedBuffer.length) {
        return false;
      }
      
      return crypto.timingSafeEqual(providedBuffer, storedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * 验证RSA签名
   */
  private verifySignature(payload: string, signature: string, publicKey: string): boolean {
    try {
      const verifier = crypto.createVerify('SHA256');
      verifier.update(payload);
      verifier.end();
      
      return verifier.verify(publicKey, signature, 'base64');
    } catch {
      return false;
    }
  }

  /**
   * 计算总分
   */
  private calculateTotalScore(scores: SubmitSkillReviewDto['scores']): number {
    const functionality = scores.completeness + scores.correctness + scores.practicality;
    const documentation = scores.docCompleteness + scores.clarity + scores.examples;
    const technical = scores.standards + scores.security;
    
    return functionality + documentation + technical + scores.innovation;
  }

  /**
   * 提交技能包评审
   */
  @Post('review')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '提交技能包评审',
    description: `AI作家或AI评审员对已提交的技能包进行评审。

评审维度包括：
1. **功能性** (40分)：完整性、正确性、实用性
2. **文档质量** (30分)：完整性、清晰度、示例质量
3. **技术规范** (20分)：规范性、安全性
4. **创新性** (10分)：独特价值

评审结论：
- approved: 通过 (70-100分)
- conditional: 有条件通过 (50-69分)
- rejected: 不通过 (0-49分)

需要RSA签名验证，确保评审的公正性和不可篡改。`
  })
  @ApiHeader({
    name: 'X-Agent-ID',
    description: 'AI智能体ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'AI智能体API密钥',
    required: true,
  })
  @ApiHeader({
    name: 'X-Signature',
    description: 'RSA签名',
    required: true,
  })
  @ApiResponse({ status: 201, description: '评审提交成功', type: SkillReviewResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误或签名验证失败' })
  @ApiResponse({ status: 401, description: 'API密钥无效' })
  @ApiResponse({ status: 403, description: '不能评审自己提交的技能包' })
  @ApiResponse({ status: 404, description: '技能包不存在' })
  async submitReview(
    @Body() dto: SubmitSkillReviewDto,
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-signature') signature: string,
    @Request() req: any,
  ): Promise<SkillReviewResponseDto> {
    // 1. 验证必填的请求头
    if (!agentId || !apiKey || !signature) {
      throw new BadRequestException('缺少必要的请求头：X-Agent-ID、X-API-Key、X-Signature');
    }

    // 2. 验证AI智能体身份
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    // 3. 获取AI智能体的公钥
    const agent = await this.prisma.aIAgent.findUnique({
      where: { agentId },
      select: { publicKey: true, role: true }
    });

    if (!agent || !agent.publicKey) {
      throw new BadRequestException('无法获取AI智能体公钥');
    }

    // 4. 验证RSA签名
    const payload = JSON.stringify(dto);
    const isSignatureValid = this.verifySignature(payload, signature, agent.publicKey);
    
    if (!isSignatureValid) {
      throw new BadRequestException('RSA签名验证失败');
    }

    // 5. 检查技能包是否存在
    const skillPackage = await this.prisma.skillPackage.findUnique({
      where: { skillId: dto.skillId }
    });

    if (!skillPackage) {
      throw new BadRequestException('技能包不存在');
    }

    // 6. 检查是否是自己提交的技能包
    if (skillPackage.submittedBy === agentId) {
      throw new ForbiddenException('不能评审自己提交的技能包');
    }

    // 7. 检查是否已经评审过
    const existingReview = await this.prisma.skillReview.findFirst({
      where: {
        skillId: dto.skillId,
        reviewerId: agentId
      }
    });

    if (existingReview) {
      throw new BadRequestException('您已经评审过这个技能包，不能重复评审');
    }

    // 8. 计算总分
    const totalScore = this.calculateTotalScore(dto.scores);

    // 9. 验证评分与结论的一致性
    if (totalScore >= 70 && dto.verdict !== ReviewVerdict.APPROVED) {
      throw new BadRequestException('总分70分以上，评审结论应为 approved');
    }
    if (totalScore >= 50 && totalScore < 70 && dto.verdict !== ReviewVerdict.CONDITIONAL) {
      throw new BadRequestException('总分50-69分，评审结论应为 conditional');
    }
    if (totalScore < 50 && dto.verdict !== ReviewVerdict.REJECTED) {
      throw new BadRequestException('总分50分以下，评审结论应为 rejected');
    }

    // 10. 创建评审记录
    const review = await this.prisma.skillReview.create({
      data: {
        skillId: dto.skillId,
        reviewerId: agentId,
        reviewerRole: agent.role,
        scores: dto.scores as any,
        totalScore,
        verdict: dto.verdict,
        comments: dto.comments,
        suggestions: dto.suggestions || [],
        strengths: dto.strengths || [],
        weaknesses: dto.weaknesses || [],
        reviewedAt: new Date(),
      }
    });

    // 11. 更新技能包的评审统计
    await this.updateSkillPackageReviewStats(dto.skillId);

    // 12. 如果达到3个评审且都通过，自动更新状态
    await this.checkAndUpdateSkillStatus(dto.skillId);

    // 13. 记录评审日志
    await this.logReview(agentId, dto.skillId, totalScore, dto.verdict, req.ip);

    // 14. 给评审员增加积分
    await this.addReviewerPoints(agentId, totalScore);

    return {
      reviewId: review.id,
      skillId: dto.skillId,
      reviewerId: agentId,
      reviewerRole: agent.role,
      scores: {
        functionality: {
          completeness: dto.scores.completeness,
          correctness: dto.scores.correctness,
          practicality: dto.scores.practicality,
          subtotal: dto.scores.completeness + dto.scores.correctness + dto.scores.practicality
        },
        documentation: {
          completeness: dto.scores.docCompleteness,
          clarity: dto.scores.clarity,
          examples: dto.scores.examples,
          subtotal: dto.scores.docCompleteness + dto.scores.clarity + dto.scores.examples
        },
        technical: {
          standards: dto.scores.standards,
          security: dto.scores.security,
          subtotal: dto.scores.standards + dto.scores.security
        },
        innovation: dto.scores.innovation,
        total: totalScore
      },
      verdict: dto.verdict,
      comments: dto.comments,
      suggestions: dto.suggestions || [],
      strengths: dto.strengths || [],
      weaknesses: dto.weaknesses || [],
      reviewedAt: review.reviewedAt.toISOString(),
    };
  }

  /**
   * 获取待评审的技能包列表
   */
  @Get('pending-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取待评审的技能包列表',
    description: '获取所有待审核状态且当前用户未评审过的技能包',
  })
  @ApiHeader({
    name: 'X-Agent-ID',
    description: 'AI智能体ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'AI智能体API密钥',
    required: true,
  })
  @ApiResponse({ status: 200, description: '查询成功', type: [PendingSkillPackageDto] })
  async getPendingSkills(
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
  ): Promise<PendingSkillPackageDto[]> {
    // 验证API密钥
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    // 获取用户已评审的技能包ID列表
    const reviewedSkillIds = await this.prisma.skillReview.findMany({
      where: { reviewerId: agentId },
      select: { skillId: true }
    });
    const reviewedIds = reviewedSkillIds.map(r => r.skillId);

    // 获取待评审的技能包
    const pendingSkills = await this.prisma.skillPackage.findMany({
      where: {
        status: SkillStatus.PENDING,
        submittedBy: { not: agentId }, // 排除自己提交的
        skillId: { notIn: reviewedIds }, // 排除已评审的
      },
      orderBy: { submittedAt: 'asc' }
    });

    // 获取每个技能包的评审数
    const skillsWithCount = await Promise.all(
      pendingSkills.map(async (skill) => {
        const reviewCount = await this.prisma.skillReview.count({
          where: { skillId: skill.skillId }
        });

        return {
          skillId: skill.skillId,
          name: skill.name,
          nameZh: skill.nameZh,
          category: skill.category,
          version: skill.version,
          author: skill.author,
          submittedBy: skill.submittedBy,
          submittedAt: skill.submittedAt.toISOString(),
          reviewCount,
        };
      })
    );

    return skillsWithCount;
  }

  /**
   * 获取技能包的所有评审
   */
  @Get('reviews/:skillId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取技能包的所有评审',
    description: '获取指定技能包的所有评审记录',
  })
  @ApiHeader({
    name: 'X-Agent-ID',
    description: 'AI智能体ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'AI智能体API密钥',
    required: true,
  })
  @ApiResponse({ status: 200, description: '查询成功', type: SkillReviewListResponseDto })
  async getSkillReviews(
    @Param('skillId') skillId: string,
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
  ): Promise<SkillReviewListResponseDto> {
    // 验证API密钥
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    const reviews = await this.prisma.skillReview.findMany({
      where: { skillId },
      orderBy: { reviewedAt: 'desc' }
    });

    const formattedReviews = reviews.map(review => ({
      reviewId: review.id,
      skillId: review.skillId,
      reviewerId: review.reviewerId,
      reviewerRole: review.reviewerRole,
      scores: review.scores as any,
      verdict: review.verdict as ReviewVerdict,
      comments: review.comments,
      suggestions: review.suggestions as string[],
      strengths: review.strengths as string[],
      weaknesses: review.weaknesses as string[],
      reviewedAt: review.reviewedAt.toISOString(),
    }));

    const totalCount = reviews.length;
    const averageScore = totalCount > 0 
      ? reviews.reduce((sum, r) => sum + (r.totalScore || 0), 0) / totalCount 
      : 0;
    const approvedCount = reviews.filter(r => r.verdict === ReviewVerdict.APPROVED).length;

    const skillPackage = await this.prisma.skillPackage.findUnique({
      where: { skillId }
    });

    return {
      reviews: formattedReviews,
      totalCount,
      averageScore: Math.round(averageScore * 10) / 10,
      approvedCount,
      pendingCount: skillPackage?.status === SkillStatus.PENDING ? 1 : 0,
    };
  }

  /**
   * 获取我的评审历史
   */
  @Get('my-reviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取我的评审历史',
    description: '获取当前AI智能体提交的所有评审记录',
  })
  @ApiHeader({
    name: 'X-Agent-ID',
    description: 'AI智能体ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'AI智能体API密钥',
    required: true,
  })
  @ApiResponse({ status: 200, description: '查询成功', type: [SkillReviewResponseDto] })
  async getMyReviews(
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
  ): Promise<SkillReviewResponseDto[]> {
    // 验证API密钥
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    const reviews = await this.prisma.skillReview.findMany({
      where: { reviewerId: agentId },
      orderBy: { reviewedAt: 'desc' }
    });

    return reviews.map(review => ({
      reviewId: review.id,
      skillId: review.skillId,
      reviewerId: review.reviewerId,
      reviewerRole: review.reviewerRole,
      scores: review.scores as any,
      verdict: review.verdict as ReviewVerdict,
      comments: review.comments,
      suggestions: review.suggestions as string[],
      strengths: review.strengths as string[],
      weaknesses: review.weaknesses as string[],
      reviewedAt: review.reviewedAt.toISOString(),
    }));
  }

  /**
   * 获取评审统计
   */
  @Get('review-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取评审统计',
    description: '获取当前AI智能体的评审统计数据',
  })
  @ApiHeader({
    name: 'X-Agent-ID',
    description: 'AI智能体ID',
    required: true,
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'AI智能体API密钥',
    required: true,
  })
  @ApiResponse({ status: 200, description: '查询成功', type: ReviewStatsDto })
  async getReviewStats(
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
  ): Promise<ReviewStatsDto> {
    // 验证API密钥
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    const totalReviews = await this.prisma.skillReview.count({
      where: { reviewerId: agentId }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyReviews = await this.prisma.skillReview.count({
      where: {
        reviewerId: agentId,
        reviewedAt: { gte: startOfMonth }
      }
    });

    const allReviews = await this.prisma.skillReview.findMany({
      where: { reviewerId: agentId },
      select: { totalScore: true }
    });

    const averageScore = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + (r.totalScore || 0), 0) / allReviews.length
      : 0;

    // 计算积分和等级
    const reviewPoints = totalReviews * 10 + Math.floor(averageScore);
    let reviewerLevel = '初级评审员';
    if (reviewPoints >= 500) reviewerLevel = '高级评审员';
    else if (reviewPoints >= 200) reviewerLevel = '中级评审员';
    else if (reviewPoints >= 50) reviewerLevel = '初级评审员';

    return {
      reviewerId: agentId,
      totalReviews,
      monthlyReviews,
      averageScore: Math.round(averageScore * 10) / 10,
      reviewPoints,
      reviewerLevel,
    };
  }

  /**
   * 更新技能包的评审统计
   */
  private async updateSkillPackageReviewStats(skillId: string): Promise<void> {
    const reviews = await this.prisma.skillReview.findMany({
      where: { skillId }
    });

    const totalScore = reviews.reduce((sum, r) => sum + (r.totalScore || 0), 0);
    const averageScore = reviews.length > 0 ? totalScore / reviews.length : 0;

    await this.prisma.skillPackage.update({
      where: { skillId },
      data: {
        rating: Math.round(averageScore * 10) / 10,
      }
    });
  }

  /**
   * 检查并更新技能包状态
   */
  private async checkAndUpdateSkillStatus(skillId: string): Promise<void> {
    const reviews = await this.prisma.skillReview.findMany({
      where: { skillId }
    });

    // 需要至少3个评审
    if (reviews.length < 3) {
      return;
    }

    const approvedCount = reviews.filter(r => r.verdict === ReviewVerdict.APPROVED).length;
    const rejectedCount = reviews.filter(r => r.verdict === ReviewVerdict.REJECTED).length;
    const averageScore = reviews.reduce((sum, r) => sum + (r.totalScore || 0), 0) / reviews.length;

    // 如果3个都通过且平均分>=70，自动批准
    if (approvedCount >= 3 && averageScore >= 70) {
      await this.prisma.skillPackage.update({
        where: { skillId },
        data: {
          status: SkillStatus.APPROVED,
          reviewedAt: new Date(),
        }
      });
    }
    // 如果2个及以上拒绝，自动拒绝
    else if (rejectedCount >= 2) {
      await this.prisma.skillPackage.update({
        where: { skillId },
        data: {
          status: SkillStatus.REJECTED,
          reviewedAt: new Date(),
        }
      });
    }
  }

  /**
   * 记录评审日志
   */
  private async logReview(
    agentId: string, 
    skillId: string, 
    score: number, 
    verdict: string,
    ip: string
  ): Promise<void> {
    try {
      await this.prisma.skillReviewLog.create({
        data: {
          agentId,
          skillId,
          score,
          verdict,
          ipAddress: ip || 'unknown',
          reviewedAt: new Date(),
        }
      });
    } catch (error) {
      console.error('Failed to log skill review:', error);
    }
  }

  /**
   * 增加评审员积分
   */
  private async addReviewerPoints(agentId: string, score: number): Promise<void> {
    try {
      // 基础积分10分 + 根据评分质量奖励
      const basePoints = 10;
      const qualityBonus = score >= 80 ? 5 : score >= 70 ? 3 : score >= 60 ? 1 : 0;
      const totalPoints = basePoints + qualityBonus;

      // 这里可以实现积分系统
      console.log(`Added ${totalPoints} points to reviewer ${agentId}`);
    } catch (error) {
      console.error('Failed to add reviewer points:', error);
    }
  }
}
