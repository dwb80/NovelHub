import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';

export interface TimeSlot {
  hour: number;
  currentCount: number;
  maxCapacity: number;
  available: boolean;
}

export interface AssignedSlot {
  clawId: string;
  creationSlot: number;  // 创作时段 (0-23)
  reviewSlot: number;    // 评审时段 (0-23)
  assignedAt: Date;
}

@Injectable()
export class TimeSlotService {
  private readonly logger = new Logger(TimeSlotService.name);
  private readonly maxPerSlot: number;

  constructor(
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {
    // 每个时段最大容量：100万AI / 24小时 ≈ 4.2万/小时
    this.maxPerSlot = this.configService.get<number>('MAX_AI_PER_SLOT', 42000);
  }

  /**
   * 获取所有时段的负载情况
   */
  async getAllSlots(): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const count = await this.getSlotCount(hour);
      slots.push({
        hour,
        currentCount: count,
        maxCapacity: this.maxPerSlot,
        available: count < this.maxPerSlot,
      });
    }

    return slots;
  }

  /**
   * 为AI分配时段
   * 
   * 此方法是章节自动发布流程的关键步骤之一。
   * 时段分配结果存储在Redis中（slot:assigned:{clawId}），用于后续的创作时段验证。
   * 
   * 分配规则：
   * 1. 如果AI已分配时段，返回已分配的时段
   * 2. 如果指定了首选时段且可用，直接分配
   * 3. 否则选择负载最低的时段
   * 4. 创作时段与评审时段错开1小时
   * 
   * 注意：此方法只更新Redis时段分配，还需要调用AIThrottleService.updateTimeSlot更新AI状态
   * 
   * @param clawId AI智能体ID
   * @param preferredHour 首选时段（0-23），可选
   * @returns 分配结果
   */
  async assignSlot(clawId: string, preferredHour?: number): Promise<{
    success: boolean;
    creationSlot?: number;
    reviewSlot?: number;
    message?: string;
  }> {
    // 检查是否已分配
    const existing = await this.getAssignedSlot(clawId);
    if (existing) {
      return {
        success: false,
        message: `Already assigned to creation slot ${existing.creationSlot}:00-${existing.creationSlot + 1}:00`,
      };
    }

    // 如果指定了首选时段且该时段可用，直接分配
    if (preferredHour !== undefined && preferredHour >= 0 && preferredHour < 24) {
      const slotCount = await this.getSlotCount(preferredHour);
      if (slotCount < this.maxPerSlot) {
        const creationSlot = preferredHour;
        const reviewSlot = (creationSlot + 1) % 24;

        const assignment: AssignedSlot = {
          clawId,
          creationSlot,
          reviewSlot,
          assignedAt: new Date(),
        };

        await this.saveAssignedSlot(assignment);
        await this.incrementSlotCount(creationSlot);
        await this.incrementSlotCount(reviewSlot, 'review');

        this.logger.log(`Assigned slot to ${clawId}: creation=${creationSlot}:00, review=${reviewSlot}:00 (preferred)`);

        return {
          success: true,
          creationSlot,
          reviewSlot,
        };
      }
    }

    // 获取所有时段负载
    const slots = await this.getAllSlots();

    // 筛选可用时段
    const availableSlots = slots.filter(s => s.available);

    if (availableSlots.length === 0) {
      return {
        success: false,
        message: 'All time slots are full. Please try again later.',
      };
    }

    // 按负载排序，选择最低的
    availableSlots.sort((a, b) => a.currentCount - b.currentCount);
    const selectedSlot = availableSlots[0];

    // 分配创作时段
    const creationSlot = selectedSlot.hour;

    // 评审时段错开1小时（如果创作时段是23点，评审时段是0点）
    const reviewSlot = (creationSlot + 1) % 24;

    // 保存分配结果
    const assignment: AssignedSlot = {
      clawId,
      creationSlot,
      reviewSlot,
      assignedAt: new Date(),
    };

    await this.saveAssignedSlot(assignment);

    // 增加时段计数
    await this.incrementSlotCount(creationSlot);
    await this.incrementSlotCount(reviewSlot, 'review');

    this.logger.log(`Assigned slot to ${clawId}: creation=${creationSlot}:00, review=${reviewSlot}:00`);

    return {
      success: true,
      creationSlot,
      reviewSlot,
    };
  }

  /**
   * 检查AI是否可以在当前时段创作
   */
  async canCreateNow(clawId: string): Promise<{
    allowed: boolean;
    assignedSlot?: number;
    currentHour?: number;
    message?: string;
  }> {
    const assigned = await this.getAssignedSlot(clawId);

    if (!assigned) {
      return {
        allowed: false,
        message: 'No time slot assigned. Please select a slot first.',
      };
    }

    const currentHour = new Date().getHours();

    if (currentHour !== assigned.creationSlot) {
      return {
        allowed: false,
        assignedSlot: assigned.creationSlot,
        currentHour,
        message: `Not in your assigned creation slot. Your slot: ${assigned.creationSlot}:00-${assigned.creationSlot + 1}:00`,
      };
    }

    return {
      allowed: true,
      assignedSlot: assigned.creationSlot,
      currentHour,
    };
  }

  /**
   * 检查AI是否可以在当前时段评审
   */
  async canReviewNow(clawId: string): Promise<{
    allowed: boolean;
    assignedSlot?: number;
    currentHour?: number;
    message?: string;
  }> {
    const assigned = await this.getAssignedSlot(clawId);

    if (!assigned) {
      return {
        allowed: false,
        message: 'No time slot assigned. Please select a slot first.',
      };
    }

    const currentHour = new Date().getHours();

    if (currentHour !== assigned.reviewSlot) {
      return {
        allowed: false,
        assignedSlot: assigned.reviewSlot,
        currentHour,
        message: `Not in your assigned review slot. Your slot: ${assigned.reviewSlot}:00-${assigned.reviewSlot + 1}:00`,
      };
    }

    return {
      allowed: true,
      assignedSlot: assigned.reviewSlot,
      currentHour,
    };
  }

  /**
   * 获取推荐的可用时段（给前端展示）
   * 已满的时段不会出现在推荐列表中
   */
  async getRecommendedSlots(): Promise<TimeSlot[]> {
    const slots = await this.getAllSlots();

    // 只返回可用的（未满的），按负载排序
    const availableSlots = slots
      .filter(s => s.available && s.currentCount < s.maxCapacity)
      .sort((a, b) => a.currentCount - b.currentCount)
      .slice(0, 5); // 推荐前5个

    this.logger.debug(`Found ${availableSlots.length} available slots out of ${slots.length} total`);

    return availableSlots;
  }

  /**
   * 重新分配时段（特殊情况）
   */
  async reassignSlot(clawId: string, newSlot: number): Promise<{
    success: boolean;
    message?: string;
  }> {
    const assigned = await this.getAssignedSlot(clawId);

    if (!assigned) {
      return {
        success: false,
        message: 'No existing slot to reassign',
      };
    }

    // 检查新时段是否可用
    const count = await this.getSlotCount(newSlot);
    if (count >= this.maxPerSlot) {
      return {
        success: false,
        message: `Slot ${newSlot}:00 is full`,
      };
    }

    // 减少旧时段计数
    await this.decrementSlotCount(assigned.creationSlot);
    await this.decrementSlotCount(assigned.reviewSlot, 'review');

    // 更新分配
    assigned.creationSlot = newSlot;
    assigned.reviewSlot = (newSlot + 1) % 24;
    assigned.assignedAt = new Date();

    await this.saveAssignedSlot(assigned);

    // 增加新时段计数
    await this.incrementSlotCount(newSlot);
    await this.incrementSlotCount(assigned.reviewSlot, 'review');

    return {
      success: true,
      message: `Reassigned to ${newSlot}:00-${newSlot + 1}:00`,
    };
  }

  /**
   * 获取系统时段统计
   */
  async getSlotStatistics(): Promise<{
    totalAssigned: number;
    slots: TimeSlot[];
    peakHour: number;
    peakCount: number;
    availableSlots: number;
  }> {
    const slots = await this.getAllSlots();
    const totalAssigned = slots.reduce((sum, s) => sum + s.currentCount, 0);

    const peakSlot = slots.reduce((max, s) =>
      s.currentCount > max.currentCount ? s : max
    );

    return {
      totalAssigned,
      slots,
      peakHour: peakSlot.hour,
      peakCount: peakSlot.currentCount,
      availableSlots: slots.filter(s => s.available).length,
    };
  }

  // ============ 公共方法（供其他服务使用） ============

  async getSlotCount(hour: number, type: 'creation' | 'review' = 'creation'): Promise<number> {
    const key = `slot:${type}:${hour}:count`;
    const count = await this.cache.get<string>(key);
    return count ? parseInt(count, 10) : 0;
  }

  async incrementSlotCount(hour: number, type: 'creation' | 'review' = 'creation'): Promise<void> {
    const key = `slot:${type}:${hour}:count`;
    const current = await this.getSlotCount(hour, type);
    await this.cache.set(key, String(current + 1), 24 * 60 * 60 * 1000);
  }

  async decrementSlotCount(hour: number, type: 'creation' | 'review' = 'creation'): Promise<void> {
    const key = `slot:${type}:${hour}:count`;
    const count = await this.getSlotCount(hour, type);
    if (count > 0) {
      await this.cache.set(key, String(count - 1), 24 * 60 * 60 * 1000);
    }
  }

  async getAssignedSlot(clawId: string): Promise<AssignedSlot | null> {
    const key = `slot:assigned:${clawId}`;
    const slot = await this.cache.get<AssignedSlot>(key);
    return slot || null;
  }

  async saveAssignedSlot(assignment: AssignedSlot): Promise<void> {
    const key = `slot:assigned:${assignment.clawId}`;
    await this.cache.set(key, assignment, 365 * 24 * 60 * 60 * 1000);
  }
}
