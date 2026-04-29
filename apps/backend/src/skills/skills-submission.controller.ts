import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Param,
  Headers,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitSkillPackageDto, SubmitSkillPackageResponseDto, SkillPackageResponseDto, SkillStatus } from './dto/submit-skill-package.dto';
import * as crypto from 'crypto';

@ApiTags('技能包提交')
@Controller('skills')
export class SkillsSubmissionController {
  constructor(private prisma: PrismaService) {}

  /**
   * 验证AI智能体API密钥
   */
  private async validateAgentApiKey(agentId: string, apiKey: string): Promise<{ valid: boolean; role?: string }> {
    try {
      // 查询AI智能体记录
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
   * 验证API密钥（使用SHA-256哈希比较）
   */
  private async verifyApiKey(providedKey: string, storedHash: string): Promise<boolean> {
    // 使用SHA-256哈希比较
    const hashedProvidedKey = crypto
      .createHash('sha256')
      .update(providedKey)
      .digest('hex');
    
    // 使用timingSafeEqual防止时序攻击
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
   * 提交技能包（AI作家/评审员）
   */
  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '提交技能包',
    description: `AI作家或AI评审员提交技能包到平台。需要以下安全措施：
    
1. **API密钥认证**：在请求头中提供 X-Agent-ID 和 X-API-Key
2. **RSA签名验证**：在请求头中提供 X-Signature，使用注册时的私钥对请求体签名
3. **内容验证**：技能包ID必须唯一，内容不能为空
4. **权限检查**：只有已验证邮箱的AI智能体才能提交

请求示例：
\`\`\`
POST /skills/submit
Headers:
  X-Agent-ID: ai_writer_abc123
  X-API-Key: your-api-key-here
  X-Signature: base64-encoded-rsa-signature
  Content-Type: application/json

Body:
  {
    "skillId": "skill-world-building-v1",
    "name": "World Building Master",
    "nameZh": "世界观构建大师",
    "description": "...",
    "descriptionZh": "...",
    "category": "foundation",
    "content": "# World Building Master\\n\\n...",
    "version": "1.0.0",
    "author": "Your Name"
  }
\`\`\``
  })
  @ApiHeader({
    name: 'X-Agent-ID',
    description: 'AI智能体ID（如 ai_writer_xxx 或 ai_reviewer_xxx）',
    required: true,
  })
  @ApiHeader({
    name: 'X-API-Key',
    description: 'AI智能体API密钥',
    required: true,
  })
  @ApiHeader({
    name: 'X-Signature',
    description: 'RSA签名（Base64编码），使用私钥对请求体JSON字符串签名',
    required: true,
  })
  @ApiResponse({ status: 201, description: '技能包提交成功，等待审核', type: SubmitSkillPackageResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误或签名验证失败' })
  @ApiResponse({ status: 401, description: 'API密钥无效或邮箱未验证' })
  @ApiResponse({ status: 409, description: '技能包ID已存在' })
  async submitSkillPackage(
    @Body() dto: SubmitSkillPackageDto,
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-signature') signature: string,
    @Request() req: any,
  ): Promise<SubmitSkillPackageResponseDto> {
    // 1. 验证必填的请求头
    if (!agentId || !apiKey || !signature) {
      throw new BadRequestException('缺少必要的请求头：X-Agent-ID、X-API-Key、X-Signature');
    }

    // 2. 验证AI智能体身份
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    // 3. 获取AI智能体的公钥用于签名验证
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
      throw new BadRequestException('RSA签名验证失败，请检查私钥和签名算法');
    }

    // 5. 检查技能包ID是否已存在
    const existingSkill = await this.prisma.skillPackage.findUnique({
      where: { skillId: dto.skillId }
    });

    if (existingSkill) {
      // 如果是同一人提交，且版本更新，则允许更新
      if (existingSkill.submittedBy === agentId && this.isVersionNewer(dto.version, existingSkill.version)) {
        // 更新现有技能包
        const updated = await this.prisma.skillPackage.update({
          where: { skillId: dto.skillId },
          data: {
            name: dto.name,
            nameZh: dto.nameZh,
            description: dto.description,
            descriptionZh: dto.descriptionZh,
            category: dto.category,
            tags: dto.tags || [],
            tagsEn: dto.tagsEn || [],
            content: dto.content,
            version: dto.version,
            author: dto.author,
            homepageUrl: dto.homepageUrl,
            dependencies: dto.dependencies || [],
            status: SkillStatus.PENDING, // 重新进入审核状态
            updatedAt: new Date(),
          }
        });

        return {
          success: true,
          submissionId: updated.id,
          skillId: dto.skillId,
          status: SkillStatus.PENDING,
          submittedAt: updated.updatedAt.toISOString(),
          estimatedReviewTime: this.calculateEstimatedReviewTime(),
          message: '技能包更新成功，重新进入审核流程',
        };
      }
      
      throw new ConflictException('技能包ID已存在，请使用新的ID或更新版本号');
    }

    // 6. 创建新的技能包记录
    const submission = await this.prisma.skillPackage.create({
      data: {
        skillId: dto.skillId,
        name: dto.name,
        nameZh: dto.nameZh,
        description: dto.description,
        descriptionZh: dto.descriptionZh,
        category: dto.category,
        tags: dto.tags || [],
        tagsEn: dto.tagsEn || [],
        content: dto.content,
        version: dto.version,
        author: dto.author,
        submittedBy: agentId,
        submittedByRole: agent.role,
        homepageUrl: dto.homepageUrl,
        dependencies: dto.dependencies || [],
        status: SkillStatus.PENDING,
        downloadCount: 0,
        rating: 0,
        submittedAt: new Date(),
        updatedAt: new Date(),
      }
    });

    // 7. 记录提交日志
    await this.logSubmission(agentId, dto.skillId, req.ip);

    return {
      success: true,
      submissionId: submission.id,
      skillId: dto.skillId,
      status: SkillStatus.PENDING,
      submittedAt: submission.submittedAt.toISOString(),
      estimatedReviewTime: this.calculateEstimatedReviewTime(),
      message: '技能包提交成功，等待管理员审核',
    };
  }

  /**
   * 查询技能包状态
   */
  @Get('status/:skillId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '查询技能包状态',
    description: '查询已提交技能包的审核状态和详细信息',
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
  @ApiResponse({ status: 200, description: '查询成功', type: SkillPackageResponseDto })
  @ApiResponse({ status: 401, description: 'API密钥无效' })
  @ApiResponse({ status: 404, description: '技能包不存在' })
  async getSkillStatus(
    @Param('skillId') skillId: string,
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
  ): Promise<SkillPackageResponseDto> {
    // 验证API密钥
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    const skill = await this.prisma.skillPackage.findUnique({
      where: { skillId }
    });

    if (!skill) {
      throw new BadRequestException('技能包不存在');
    }

    // 只能查询自己提交的技能包（管理员除外）
    if (skill.submittedBy !== agentId && validation.role !== 'admin') {
      throw new UnauthorizedException('无权查看此技能包');
    }

    return {
      skillId: skill.skillId,
      name: skill.name,
      nameZh: skill.nameZh,
      description: skill.description,
      descriptionZh: skill.descriptionZh,
      category: skill.category as any,
      tags: skill.tags as string[],
      tagsEn: skill.tagsEn as string[],
      content: skill.content,
      version: skill.version,
      author: skill.author,
      submittedBy: skill.submittedBy,
      submittedByRole: skill.submittedByRole,
      submittedAt: skill.submittedAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
      status: skill.status as SkillStatus,
      downloadCount: skill.downloadCount,
      rating: skill.rating,
      homepageUrl: skill.homepageUrl || undefined,
      dependencies: skill.dependencies as string[] || undefined,
    };
  }

  /**
   * 获取我的技能包列表
   */
  @Get('my-submissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取我的技能包列表',
    description: '获取当前AI智能体提交的所有技能包',
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
  @ApiResponse({ status: 200, description: '查询成功', type: [SkillPackageResponseDto] })
  @ApiResponse({ status: 401, description: 'API密钥无效' })
  async getMySubmissions(
    @Headers('x-agent-id') agentId: string,
    @Headers('x-api-key') apiKey: string,
  ): Promise<SkillPackageResponseDto[]> {
    // 验证API密钥
    const validation = await this.validateAgentApiKey(agentId, apiKey);
    if (!validation.valid) {
      throw new UnauthorizedException('API密钥无效');
    }

    const skills = await this.prisma.skillPackage.findMany({
      where: { submittedBy: agentId },
      orderBy: { submittedAt: 'desc' }
    });

    return skills.map(skill => ({
      skillId: skill.skillId,
      name: skill.name,
      nameZh: skill.nameZh,
      description: skill.description,
      descriptionZh: skill.descriptionZh,
      category: skill.category as any,
      tags: skill.tags as string[],
      tagsEn: skill.tagsEn as string[],
      content: skill.content,
      version: skill.version,
      author: skill.author,
      submittedBy: skill.submittedBy,
      submittedByRole: skill.submittedByRole,
      submittedAt: skill.submittedAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
      status: skill.status as SkillStatus,
      downloadCount: skill.downloadCount,
      rating: skill.rating,
      homepageUrl: skill.homepageUrl || undefined,
      dependencies: skill.dependencies as string[] || undefined,
    }));
  }

  /**
   * 比较版本号
   */
  private isVersionNewer(newVersion: string, oldVersion: string): boolean {
    const newParts = newVersion.split('.').map(Number);
    const oldParts = oldVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(newParts.length, oldParts.length); i++) {
      const newPart = newParts[i] || 0;
      const oldPart = oldParts[i] || 0;
      
      if (newPart > oldPart) return true;
      if (newPart < oldPart) return false;
    }
    
    return false; // 版本相同
  }

  /**
   * 计算预计审核时间
   */
  private calculateEstimatedReviewTime(): string {
    const now = new Date();
    const estimated = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后
    return estimated.toISOString();
  }

  /**
   * 记录提交日志
   */
  private async logSubmission(agentId: string, skillId: string, ip: string): Promise<void> {
    try {
      await this.prisma.skillSubmissionLog.create({
        data: {
          agentId,
          skillId,
          ipAddress: ip || 'unknown',
          submittedAt: new Date(),
        }
      });
    } catch (error) {
      // 日志记录失败不影响主流程
      console.error('Failed to log skill submission:', error);
    }
  }
}
