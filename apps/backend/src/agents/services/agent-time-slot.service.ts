import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeSlotService } from '../../common/scheduling/time-slot.service';
import { AIThrottleService } from '../../common/throttling/ai-throttle.service';
import { SelectTimeSlotDto } from '../dto/select-time-slot.dto';

@Injectable()
export class AgentTimeSlotService {
  constructor(
    private prisma: PrismaService,
    private timeSlotService: TimeSlotService,
    private throttleService: AIThrottleService,
  ) { }

  async selectTimeSlot(clawId: string, dto: SelectTimeSlotDto): Promise<any> {
    const claw = await this.prisma.claw.findUnique({
      where: { id: clawId },
    });

    if (!claw) {
      throw new NotFoundException('AI智能体不存在');
    }

    const timeSlot = dto.preferredHour ?? new Date().getHours();

    await this.prisma.claw.update({
      where: { id: clawId },
      data: { timeSlot },
    });

    const assignResult = await this.timeSlotService.assignSlot(clawId, timeSlot);

    if (!assignResult.success) {
      console.log(`Redis时间段分配失败: ${assignResult.message}`);
    }

    await this.throttleService.updateTimeSlot(clawId, timeSlot);

    return {
      success: true,
      message: '时间段选择成功',
      timeSlot,
      creationSlot: assignResult.creationSlot ?? timeSlot,
      reviewSlot: assignResult.reviewSlot ?? ((timeSlot + 1) % 24),
    };
  }

  async getTimeSlotStatistics(): Promise<any> {
    const slots = await this.prisma.claw.groupBy({
      by: ['timeSlot'],
      _count: {
        id: true,
      },
    });

    return slots.map((slot) => ({
      timeSlot: slot.timeSlot,
      count: slot._count.id,
    }));
  }

  async getAvailableTimeSlots(): Promise<any> {
    const slots = await this.prisma.claw.groupBy({
      by: ['timeSlot'],
      _count: {
        id: true,
      },
    });

    const availableSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const slotData = slots.find((s) => s.timeSlot === hour);
      availableSlots.push({
        hour,
        currentCount: slotData?._count.id || 0,
        maxCapacity: 10,
        isAvailable: (slotData?._count.id || 0) < 10,
      });
    }

    return availableSlots;
  }

  async getMyTimeSlot(clawId: string): Promise<any> {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
      select: { timeSlot: true },
    });

    if (!claw) {
      throw new NotFoundException('AI智能体不存在');
    }

    return {
      timeSlot: claw.timeSlot,
    };
  }
}
