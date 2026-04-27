import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../apps/backend/src/prisma/prisma.service';
import { SearchModule } from '../../apps/backend/src/search/search.module';
import { SearchService } from '../../apps/backend/src/search/search.service';
import { SearchController } from '../../apps/backend/src/search/search.controller';

/**
 * 搜索API集成测试
 * 
 * 测试范围:
 * - 搜索API端点功能
 * - 参数验证
 * - 响应格式
 * - 安全性
 * 
 * 前置条件:
 * - 测试数据库已初始化
 * - 测试数据已填充
 */

describe('搜索API集成测试', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SearchModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    await app.init();
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TC-SEARCH-301: 后端API正常返回', () => {
    it('应该返回200状态码和正确格式的数据', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=AI')
        .expect(200);

      // 验证响应结构
      expect(response.body).toHaveProperty('code', 200);
      expect(response.body).toHaveProperty('message', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('novels');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('limit');
      expect(Array.isArray(response.body.data.novels)).toBe(true);
    });

    it('应该返回包含AI关键词的小说', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=AI')
        .expect(200);

      const { novels } = response.body.data;
      
      // 验证返回了AI相关小说
      expect(novels.length).toBeGreaterThan(0);
      
      // 验证每本小说都有必需的字段
      novels.forEach((novel: any) => {
        expect(novel).toHaveProperty('id');
        expect(novel).toHaveProperty('title');
        expect(novel).toHaveProperty('description');
        expect(novel).toHaveProperty('authorName');
        expect(novel).toHaveProperty('rating');
        expect(novel).toHaveProperty('wordCount');
        expect(novel).toHaveProperty('chapterCount');
      });
    });
  });

  describe('TC-SEARCH-302: 后端API参数验证', () => {
    it('缺少q参数应该返回400', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('空字符串q参数应该返回400', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('超长q参数应该返回400', async () => {
      const longQuery = 'a'.repeat(101);
      const response = await request(app.getHttpServer())
        .get(`/search/novels?q=${longQuery}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('无效的page参数应该被忽略或使用默认值', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=AI&page=abc')
        .expect(200);

      expect(response.body.data.page).toBe(1);
    });

    it('无效的limit参数应该被忽略或使用默认值', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=AI&limit=abc')
        .expect(200);

      expect(response.body.data.limit).toBe(20);
    });
  });

  describe('TC-SEARCH-303: 响应数据格式验证', () => {
    it('小说对象应该包含所有必需字段', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=AI')
        .expect(200);

      const novel = response.body.data.novels[0];
      
      // 验证所有必需字段
      const requiredFields = [
        'id',
        'title',
        'description',
        'cover',
        'category',
        'tags',
        'authorId',
        'authorName',
        'wordCount',
        'chapterCount',
        'viewCount',
        'rating',
        'ratingCount',
        'status',
        'publishedAt',
      ];

      requiredFields.forEach(field => {
        expect(novel).toHaveProperty(field);
      });

      // 验证字段类型
      expect(typeof novel.id).toBe('string');
      expect(typeof novel.title).toBe('string');
      expect(typeof novel.authorName).toBe('string');
      expect(typeof novel.rating).toBe('number');
      expect(typeof novel.wordCount).toBe('number');
      expect(Array.isArray(novel.tags)).toBe(true);
    });
  });

  describe('TC-SEARCH-104: SQL注入防护测试', () => {
    it('应该防止基本的SQL注入攻击', async () => {
      const maliciousQueries = [
        "' OR '1'='1",
        "'; DROP TABLE novels; --",
        "' UNION SELECT * FROM users --",
        "1' AND 1=1 --",
      ];

      for (const query of maliciousQueries) {
        const response = await request(app.getHttpServer())
          .get(`/search/novels?q=${encodeURIComponent(query)}`)
          .expect(200);

        // 验证返回结果数量合理（不会返回所有数据）
        expect(response.body.data.novels.length).toBeLessThan(100);
      }
    });
  });

  describe('搜索功能测试', () => {
    it('搜索"星际"应该返回星际穿越小说', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=星际')
        .expect(200);

      const titles = response.body.data.novels.map((n: any) => n.title);
      expect(titles).toContain('星际穿越之我是大反派');
    });

    it('搜索"修仙"应该返回修仙小说', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=修仙')
        .expect(200);

      const titles = response.body.data.novels.map((n: any) => n.title);
      const hasXianxia = titles.some((t: string) => t.includes('修仙'));
      expect(hasXianxia).toBe(true);
    });

    it('搜索AI智能体作家名应该返回该AI智能体作家的小说', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=AI作家')
        .expect(200);

      const authorNames = response.body.data.novels.map((n: any) => n.authorName);
      const hasAuthor = authorNames.some((name: string) => name.includes('AI作家'));
      expect(hasAuthor).toBe(true);
    });

    it('搜索不存在的关键词应该返回空数组', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=不存在的词xyz123456')
        .expect(200);

      expect(response.body.data.novels).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('分页测试', () => {
    it('应该支持分页参数', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=科幻&page=1&limit=5')
        .expect(200);

      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.novels.length).toBeLessThanOrEqual(5);
    });

    it('limit参数应该限制返回数量', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=科幻&limit=2')
        .expect(200);

      expect(response.body.data.novels.length).toBeLessThanOrEqual(2);
    });

    it('limit参数最大值应该被限制', async () => {
      const response = await request(app.getHttpServer())
        .get('/search/novels?q=科幻&limit=100')
        .expect(200);

      // limit应该被限制在50以内
      expect(response.body.data.limit).toBeLessThanOrEqual(50);
    });
  });

  describe('性能测试', () => {
    it('搜索响应时间应该小于500ms', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/search/novels?q=AI')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500);
    });

    it('并发搜索应该正常处理', async () => {
      const queries = ['AI', '星际', '修仙', '代码', '算法'];
      
      const promises = queries.map(q => 
        request(app.getHttpServer())
          .get(`/search/novels?q=${q}`)
          .expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('code', 200);
        expect(response.body.data).toHaveProperty('novels');
      });
    });
  });
});
