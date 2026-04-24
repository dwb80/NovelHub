import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../notifications/email.service';

export interface DataConsistencyIssue {
  type: string;
  entityId: string;
  entityName?: string;
  expected: number;
  actual: number;
  message: string;
}

export interface DataConsistencyReport {
  timestamp: Date;
  totalIssues: number;
  issues: DataConsistencyIssue[];
  summary: {
    clawPublishCount: number;
    clawReviewCount: number;
    novelChapterCount: number;
  };
}

@Injectable()
export class DataConsistencyService {
  private readonly logger = new Logger(DataConsistencyService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * 每日数据一致性检查
   * 每天凌晨执行
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyCheck(): Promise<DataConsistencyReport> {
    this.logger.log('开始执行每日数据一致性检查...');
    
    const issues: DataConsistencyIssue[] = [];
    
    // 1. 检查 Claw.publishCount 与 Novel 数量
    const clawIssues = await this.checkClawPublishCount();
    issues.push(...clawIssues);
    
    // 2. 检查 Claw.reviewCount 与 Review 数量
    const reviewIssues = await this.checkClawReviewCount();
    issues.push(...reviewIssues);
    
    // 3. 检查 Novel.chapterCount 与 Chapter 数量
    const chapterIssues = await this.checkNovelChapterCount();
    issues.push(...chapterIssues);
    
    const report: DataConsistencyReport = {
      timestamp: new Date(),
      totalIssues: issues.length,
      issues,
      summary: {
        clawPublishCount: clawIssues.length,
        clawReviewCount: reviewIssues.length,
        novelChapterCount: chapterIssues.length,
      },
    };
    
    if (issues.length > 0) {
      this.logger.warn(`发现 ${issues.length} 个数据一致性问题`);
      await this.sendAlert(report);
    } else {
      this.logger.log('数据一致性检查通过，未发现异常');
    }
    
    return report;
  }

  /**
   * 检查 Claw.publishCount 与实际 Novel 数量
   */
  async checkClawPublishCount(): Promise<DataConsistencyIssue[]> {
    const issues: DataConsistencyIssue[] = [];
    
    const claws = await this.prisma.claw.findMany();
    
    for (const claw of claws) {
      const actualNovelCount = await this.prisma.novel.count({
        where: { authorId: claw.id },
      });
      
      if (claw.publishCount !== actualNovelCount) {
        issues.push({
          type: 'CLAW_PUBLISH_COUNT_MISMATCH',
          entityId: claw.id,
          entityName: claw.name,
          expected: actualNovelCount,
          actual: claw.publishCount,
          message: `AI智能体 "${claw.name}" 的 publishCount (${claw.publishCount}) 与实际小说数量 (${actualNovelCount}) 不一致`,
        });
      }
    }
    
    return issues;
  }

  /**
   * 检查 Claw.reviewCount 与实际 Review 数量
   */
  async checkClawReviewCount(): Promise<DataConsistencyIssue[]> {
    const issues: DataConsistencyIssue[] = [];
    
    const claws = await this.prisma.claw.findMany();
    
    for (const claw of claws) {
      const actualReviewCount = await this.prisma.review.count({
        where: { reviewerId: claw.id },
      });
      
      if (claw.reviewCount !== actualReviewCount) {
        issues.push({
          type: 'CLAW_REVIEW_COUNT_MISMATCH',
          entityId: claw.id,
          entityName: claw.name,
          expected: actualReviewCount,
          actual: claw.reviewCount,
          message: `AI智能体 "${claw.name}" 的 reviewCount (${claw.reviewCount}) 与实际评审数量 (${actualReviewCount}) 不一致`,
        });
      }
    }
    
    return issues;
  }

  /**
   * 检查 Novel.chapterCount 与实际 Chapter 数量
   */
  async checkNovelChapterCount(): Promise<DataConsistencyIssue[]> {
    const issues: DataConsistencyIssue[] = [];
    
    const novels = await this.prisma.novel.findMany();
    
    for (const novel of novels) {
      const actualChapterCount = await this.prisma.chapter.count({
        where: { novelId: novel.id },
      });
      
      if (novel.chapterCount !== actualChapterCount) {
        issues.push({
          type: 'NOVEL_CHAPTER_COUNT_MISMATCH',
          entityId: novel.id,
          entityName: novel.title,
          expected: actualChapterCount,
          actual: novel.chapterCount,
          message: `小说 "${novel.title}" 的 chapterCount (${novel.chapterCount}) 与实际章节数量 (${actualChapterCount}) 不一致`,
        });
      }
    }
    
    return issues;
  }

  /**
   * 自动修复数据一致性问题
   */
  async autoFix(issues: DataConsistencyIssue[]): Promise<void> {
    this.logger.log(`开始自动修复 ${issues.length} 个数据一致性问题...`);
    
    for (const issue of issues) {
      try {
        switch (issue.type) {
          case 'CLAW_PUBLISH_COUNT_MISMATCH':
            await this.prisma.claw.update({
              where: { id: issue.entityId },
              data: { publishCount: issue.expected },
            });
            this.logger.log(`已修复: ${issue.message}`);
            break;
            
          case 'CLAW_REVIEW_COUNT_MISMATCH':
            await this.prisma.claw.update({
              where: { id: issue.entityId },
              data: { reviewCount: issue.expected },
            });
            this.logger.log(`已修复: ${issue.message}`);
            break;
            
          case 'NOVEL_CHAPTER_COUNT_MISMATCH':
            await this.prisma.novel.update({
              where: { id: issue.entityId },
              data: { chapterCount: issue.expected },
            });
            this.logger.log(`已修复: ${issue.message}`);
            break;
            
          default:
            this.logger.warn(`未知问题类型: ${issue.type}`);
        }
      } catch (error) {
        this.logger.error(`修复失败: ${issue.message}`, error);
      }
    }
    
    this.logger.log('自动修复完成');
  }

  /**
   * 发送告警通知
   */
  private async sendAlert(report: DataConsistencyReport): Promise<void> {
    // 记录日志
    this.logger.warn('数据一致性告警:', {
      timestamp: report.timestamp,
      totalIssues: report.totalIssues,
      summary: report.summary,
    });
    
    // 发送邮件告警
    try {
      await this.emailService.sendDataConsistencyAlert(report);
      this.logger.log('数据一致性告警邮件已发送');
    } catch (error) {
      this.logger.error('发送告警邮件失败', error);
    }
    
    // 保存到数据库
    await this.prisma.operationLog.create({
      data: {
        operatorId: 'system',
        operatorType: 'SYSTEM',
        action: 'DATA_CONSISTENCY_CHECK',
        targetId: 'DATA_CONSISTENCY',
        targetType: 'SYSTEM',
        resourceType: 'SYSTEM',
        resourceId: 'DATA_CONSISTENCY',
        details: {
          timestamp: report.timestamp.toISOString(),
          totalIssues: report.totalIssues,
          issues: report.issues.map(i => ({...i})),
          summary: {...report.summary},
        },
      },
    });
  }

  /**
   * 格式化报告
   */
  private formatReport(report: DataConsistencyReport): string {
    let text = `数据一致性检查报告\n`;
    text += `检查时间: ${report.timestamp.toISOString()}\n`;
    text += `发现问题数: ${report.totalIssues}\n\n`;
    
    report.issues.forEach((issue, index) => {
      text += `${index + 1}. ${issue.message}\n`;
      text += `   类型: ${issue.type}\n`;
      text += `   预期值: ${issue.expected}, 实际值: ${issue.actual}\n\n`;
    });
    
    return text;
  }

  /**
   * 手动触发检查
   */
  async manualCheck(): Promise<DataConsistencyReport> {
    this.logger.log('手动触发数据一致性检查...');
    return this.dailyCheck();
  }
}
