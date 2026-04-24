import { Test, TestingModule } from '@nestjs/testing';
import { ForgeScoreService } from './forge-score.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NefAlgorithmService } from '../algorithms/nef-algorithm.service';
import { Logger } from '@nestjs/common';

describe('ForgeScoreService', () => {
  let service: ForgeScoreService;
  let prisma: PrismaService;
  let nefAlgorithm: NefAlgorithmService;

  const mockPrismaService = {
    claw: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    creationArchive: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    plotPattern: {
      createMany: jest.fn(),
    },
    characterProfile: {
      createMany: jest.fn(),
    },
    writingStyle: {
      createMany: jest.fn(),
    },
    forgeScoreHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    naturalSelectionHistory: {
      create: jest.fn(),
    },
    moduleInheritanceHistory: {
      create: jest.fn(),
    },
  };

  const mockNefAlgorithmService = {
    calculateNefMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgeScoreService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NefAlgorithmService,
          useValue: mockNefAlgorithmService,
        },
      ],
    }).compile();

    service = module.get<ForgeScoreService>(ForgeScoreService);
    prisma = module.get<PrismaService>(PrismaService);
    nefAlgorithm = module.get<NefAlgorithmService>(NefAlgorithmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateForgeScore', () => {
    it('should calculate forge score correctly', async () => {
      const mockMetrics = {
        qualityScore: 8,
        evolutionIndex: 0.9,
        feedbackScore: 7,
        innovationScore: 6,
        consistencyScore: 8,
      };

      mockNefAlgorithmService.calculateNefMetrics.mockResolvedValue(mockMetrics);
      mockPrismaService.forgeScoreHistory.create.mockResolvedValue({});

      const result = await service.calculateForgeScore('test-claw-id');

      expect(result).toHaveProperty('total');
      expect(result.base).toBe(80);
      expect(result.evolution).toBeCloseTo(0.45);
      expect(result.feedback).toBe(35);
      expect(result.innovation).toBe(18);
      expect(result.consistency).toBe(16);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should handle zero metrics', async () => {
      const mockMetrics = {
        qualityScore: 0,
        evolutionIndex: 0,
        feedbackScore: 0,
        innovationScore: 0,
        consistencyScore: 0,
      };

      mockNefAlgorithmService.calculateNefMetrics.mockResolvedValue(mockMetrics);
      mockPrismaService.forgeScoreHistory.create.mockResolvedValue({});

      const result = await service.calculateForgeScore('test-claw-id');

      expect(result.total).toBe(0);
    });
  });

  describe('runNaturalSelection', () => {
    it('should return empty result when no active claws', async () => {
      mockPrismaService.claw.findMany.mockResolvedValue([]);

      const result = await service.runNaturalSelection();

      expect(result.totalCandidates).toBe(0);
      expect(result.selected).toEqual([]);
      expect(result.threshold).toBe(0);
    });

    it('should select top performers', async () => {
      const mockClaws = [
        { id: 'claw-1', reputationScore: 90 },
        { id: 'claw-2', reputationScore: 80 },
        { id: 'claw-3', reputationScore: 70 },
        { id: 'claw-4', reputationScore: 60 },
      ];

      mockPrismaService.claw.findMany.mockResolvedValue(mockClaws);
      mockNefAlgorithmService.calculateNefMetrics.mockResolvedValue({
        qualityScore: 8,
        evolutionIndex: 0.9,
        feedbackScore: 7,
        innovationScore: 6,
        consistencyScore: 8,
      });
      mockPrismaService.claw.findUnique.mockResolvedValue({
        id: 'claw-1',
        name: 'Test Claw',
        publicKey: 'test-key',
        capabilities: ['write'],
        signature: 'test-sig',
        reputationScore: 90,
      });
      mockPrismaService.claw.create.mockResolvedValue({
        id: 'new-claw-id',
      });
      mockPrismaService.naturalSelectionHistory.create.mockResolvedValue({});

      const result = await service.runNaturalSelection();

      expect(result.totalCandidates).toBe(4);
      expect(result.threshold).toBeGreaterThan(0);
    });
  });

  describe('inheritModules', () => {
    it('should return failure result if parent archive not found', async () => {
      mockPrismaService.creationArchive.findUnique.mockResolvedValue(null);
      mockPrismaService.moduleInheritanceHistory.create.mockResolvedValue({});

      const result = await service.inheritModules('parent-id', 'child-id');

      expect(result.success).toBe(false);
      expect(result.inheritedPatterns).toBe(0);
      expect(result.inheritedProfiles).toBe(0);
    });

    it('should inherit modules successfully', async () => {
      const mockParentArchive = {
        id: 'archive-1',
        plotPatterns: [
          { id: 'pattern-1', type: 'HERO_JOURNEY', description: 'Test', successRate: 0.8, confidence: 0.9 },
        ],
        characterProfiles: [
          { id: 'profile-1', archetype: 'HERO', overallScore: 0.8 },
        ],
        writingStyles: [
          { id: 'style-1', aspect: 'RHYTHM', settings: {}, metrics: {} },
        ],
      };

      mockPrismaService.creationArchive.findUnique
        .mockResolvedValueOnce(mockParentArchive)
        .mockResolvedValueOnce({ id: 'child-archive' });

      mockPrismaService.plotPattern.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.characterProfile.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.writingStyle.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.moduleInheritanceHistory.create.mockResolvedValue({});

      const result = await service.inheritModules('parent-id', 'child-id');

      expect(result.success).toBe(true);
      expect(result.inheritedPatterns).toBe(1);
      expect(result.inheritedProfiles).toBe(1);
    });
  });

  describe('getForgeScoreHistory', () => {
    it('should return score history', async () => {
      const mockHistory = [
        { id: '1', clawId: 'claw-1', totalScore: 100, createdAt: new Date() },
        { id: '2', clawId: 'claw-1', totalScore: 95, createdAt: new Date() },
      ];

      mockPrismaService.forgeScoreHistory.findMany.mockResolvedValue(mockHistory);

      const result = await service.getForgeScoreHistory('claw-1', 10);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.forgeScoreHistory.findMany).toHaveBeenCalledWith({
        where: { clawId: 'claw-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });
  });

  describe('getTopPerformers', () => {
    it('should return top performers', async () => {
      const mockScores = [
        { clawId: 'claw-1', totalScore: 100, claw: { name: 'Top 1' } },
        { clawId: 'claw-2', totalScore: 95, claw: { name: 'Top 2' } },
      ];

      mockPrismaService.forgeScoreHistory.findMany.mockResolvedValue(mockScores);

      const result = await service.getTopPerformers(5);

      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
    });
  });
});
