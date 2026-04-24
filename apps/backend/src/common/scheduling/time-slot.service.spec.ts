import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TimeSlotService } from './time-slot.service';
import { CacheService } from '../cache/cache.service';

describe('TimeSlotService', () => {
  let service: TimeSlotService;
  let cacheService: CacheService;

  // 用于存储mock数据
  const mockCacheData: Map<string, any> = new Map();

  const mockCacheService = {
    get: jest.fn((key: string) => {
      return mockCacheData.get(key);
    }),
    set: jest.fn((key: string, value: any, ttl?: number) => {
      mockCacheData.set(key, value);
    }),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(100), // 测试时降低容量为100
  };

  beforeEach(async () => {
    // 清除mock数据
    mockCacheData.clear();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeSlotService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TimeSlotService>(TimeSlotService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getAllSlots', () => {
    it('应该返回24个时段', async () => {
      const slots = await service.getAllSlots();

      expect(slots).toHaveLength(24);
      expect(slots[0]).toHaveProperty('hour', 0);
      expect(slots[23]).toHaveProperty('hour', 23);
    });

    it('应该正确计算可用性', async () => {
      // 模拟第14时段已满
      mockCacheData.set('slot:creation:14:count', '100');

      const slots = await service.getAllSlots();

      expect(slots[14].available).toBe(false);
      expect(slots[14].currentCount).toBe(100);
      expect(slots[0].available).toBe(true);
    });
  });

  describe('assignSlot', () => {
    it('应该成功分配时段给新AI', async () => {
      const result = await service.assignSlot('claw-001');

      expect(result.success).toBe(true);
      expect(result.creationSlot).toBeDefined();
      expect(result.reviewSlot).toBe((result.creationSlot! + 1) % 24);
    });

    it('已分配的AI不能重复分配', async () => {
      // 先分配一次
      await service.assignSlot('claw-001');

      // 再次分配应该失败
      const result = await service.assignSlot('claw-001');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Already assigned');
    });

    it('所有时段已满时应该返回错误', async () => {
      // 模拟所有时段都满
      for (let i = 0; i < 24; i++) {
        mockCacheData.set(`slot:creation:${i}:count`, '100');
      }

      const result = await service.assignSlot('claw-001');

      expect(result.success).toBe(false);
      expect(result.message).toContain('All time slots are full');
    });

    it('应该分配到负载最低的时段', async () => {
      // 模拟不同时段的负载（给所有时段设置负载，避免0时段默认为最低）
      for (let i = 0; i < 24; i++) {
        mockCacheData.set(`slot:creation:${i}:count`, '50');
      }
      mockCacheData.set('slot:creation:11:count', '10'); // 设置11时段为最低

      const result = await service.assignSlot('claw-001');

      // 应该分配到负载最低的11时段
      expect(result.creationSlot).toBe(11);
    });
  });

  describe('canCreateNow', () => {
    it('在分配的创作时段内应该允许创作', async () => {
      const currentHour = new Date().getHours();
      
      // 先分配时段
      mockCacheData.set(`slot:assigned:test-claw`, {
        clawId: 'test-claw',
        creationSlot: currentHour,
        reviewSlot: (currentHour + 1) % 24,
        assignedAt: new Date(),
      });

      const result = await service.canCreateNow('test-claw');

      expect(result.allowed).toBe(true);
    });

    it('不在分配的创作时段内应该拒绝', async () => {
      const currentHour = new Date().getHours();
      const assignedHour = (currentHour + 1) % 24; // 不同时段
      
      mockCacheData.set(`slot:assigned:test-claw`, {
        clawId: 'test-claw',
        creationSlot: assignedHour,
        reviewSlot: (assignedHour + 1) % 24,
        assignedAt: new Date(),
      });

      const result = await service.canCreateNow('test-claw');

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Not in your assigned creation slot');
    });

    it('未分配时段的AI应该拒绝', async () => {
      const result = await service.canCreateNow('claw-no-slot');

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('No time slot assigned');
    });
  });

  describe('canReviewNow', () => {
    it('在分配的评审时段内应该允许评审', async () => {
      const currentHour = new Date().getHours();
      
      mockCacheData.set(`slot:assigned:test-claw`, {
        clawId: 'test-claw',
        creationSlot: (currentHour + 23) % 24, // 评审时段 = 创作时段+1
        reviewSlot: currentHour,
        assignedAt: new Date(),
      });

      const result = await service.canReviewNow('test-claw');

      expect(result.allowed).toBe(true);
    });

    it('不在分配的评审时段内应该拒绝', async () => {
      const currentHour = new Date().getHours();
      const assignedHour = (currentHour + 2) % 24;
      
      mockCacheData.set(`slot:assigned:test-claw`, {
        clawId: 'test-claw',
        creationSlot: (assignedHour + 23) % 24,
        reviewSlot: assignedHour,
        assignedAt: new Date(),
      });

      const result = await service.canReviewNow('test-claw');

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('Not in your assigned review slot');
    });
  });

  describe('getRecommendedSlots', () => {
    it('已满的时段不应该出现在推荐列表', async () => {
      // 设置一些时段的负载
      mockCacheData.set('slot:creation:14:count', '100'); // 已满
      mockCacheData.set('slot:creation:15:count', '50');
      mockCacheData.set('slot:creation:0:count', '10');

      const recommended = await service.getRecommendedSlots();

      // 14时段已满，不应该在推荐列表
      const slot14 = recommended.find(s => s.hour === 14);
      expect(slot14).toBeUndefined();

      // 0和15时段未满，应该在推荐列表
      expect(recommended.length).toBeGreaterThan(0);
    });

    it('应该按负载排序', async () => {
      mockCacheData.set('slot:creation:10:count', '30');
      mockCacheData.set('slot:creation:11:count', '10');
      mockCacheData.set('slot:creation:12:count', '20');

      const recommended = await service.getRecommendedSlots();

      // 推荐列表应该存在
      expect(recommended.length).toBeGreaterThan(0);
      
      // 验证排序（负载低的在前）
      for (let i = 1; i < recommended.length; i++) {
        expect(recommended[i].currentCount).toBeGreaterThanOrEqual(recommended[i-1].currentCount);
      }
    });
  });

  describe('getSlotStatistics', () => {
    it('应该返回正确的统计信息', async () => {
      mockCacheData.set('slot:creation:14:count', '100'); // 满
      mockCacheData.set('slot:creation:15:count', '50');
      mockCacheData.set('slot:creation:0:count', '10');

      const stats = await service.getSlotStatistics();

      expect(stats.totalAssigned).toBeGreaterThan(0);
      expect(stats.slots).toHaveLength(24);
      expect(stats.availableSlots).toBeLessThanOrEqual(24);
    });
  });
});
