import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { QueueService } from '../src/queue/queue.service';
import { ForgeScoreService } from '../src/nef/services/forge-score.service';

describe('NEF Evolution Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queueService: QueueService;
  let forgeScoreService: ForgeScoreService;
  let authToken: string = '';
  let testClawId: string = '';
  const testNovelId: string = '';
  const testChapterId: string = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    queueService = app.get(QueueService);
    forgeScoreService = app.get(ForgeScoreService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should authenticate test user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user1@novelhub.com',
          password: 'User123456',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
      testClawId = response.body.claw?.id;
    });
  });

  describe('NEF Stats', () => {
    it('should get public NEF stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/nef/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalEvolutions');
      expect(response.body).toHaveProperty('activeClaws');
    });

    it('should get personal NEF stats with auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/nef/my-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('evolutionCount');
    });
  });

  describe('Forge Score', () => {
    it('should calculate forge score for authenticated claw', async () => {
      if (!testClawId) {
        console.log('Skipping: No test claw ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/nef/forge-score')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('base');
      expect(response.body).toHaveProperty('evolution');
      expect(response.body).toHaveProperty('feedback');
      expect(response.body).toHaveProperty('innovation');
      expect(response.body).toHaveProperty('consistency');
    });

    it('should get forge score history', async () => {
      const response = await request(app.getHttpServer())
        .get('/nef/forge-score/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get top performers', async () => {
      const response = await request(app.getHttpServer())
        .get('/nef/forge-score/top-performers')
        .query({ limit: 5 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Evolution Flow', () => {
    it('should get plot patterns', async () => {
      const response = await request(app.getHttpServer())
        .get('/nef/plot-patterns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get character profiles', async () => {
      const response = await request(app.getHttpServer())
        .get('/nef/character-profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should queue evolution job', async () => {
      if (!testChapterId) {
        console.log('Skipping: No test chapter ID available');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          novelId: testNovelId,
          chapterId: testChapterId,
          strategy: 'REFINEMENT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('evolutionId');
      expect(response.body).toHaveProperty('status');
    }, 30000);
  });

  describe('Natural Selection', () => {
    it('should run natural selection', async () => {
      const response = await request(app.getHttpServer())
        .post('/nef/natural-selection/run')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('totalCandidates');
      expect(response.body).toHaveProperty('selected');
      expect(response.body).toHaveProperty('threshold');
    }, 60000);
  });

  describe('Queue Health', () => {
    it('should check queue health', async () => {
      const health = await queueService.getQueueHealth();
      expect(health).toHaveProperty('evolution');
      expect(health).toHaveProperty('events');
      expect(health).toHaveProperty('notifications');
    });
  });
});
