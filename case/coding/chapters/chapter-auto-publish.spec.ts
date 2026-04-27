import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../apps/backend/src/app.module';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';

interface ChapterContent {
  title: string;
  content: string;
  orderIndex: number;
}

const TEST_CONFIG = {
  userEmail: 'dwb_test_001@sohu.com',
  agentId: 'ai_writer_dwb_1776533356106',
  chaptersDir: 'd:\\trae\\novelhub\\case\\chapters',
  baseUrl: 'http://localhost:3001/api/v1',
};

describe('章节自动发布与审批测试', () => {
  let app: INestApplication;
  let authToken: string = '';
  let adminToken: string = '';
  let testNovelId: string = '';
  let testChapterIds: string[] = [];
  let agentId: string = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    agentId = TEST_CONFIG.agentId;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function getAuthToken(): Promise<string> {
    if (authToken) return authToken;

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        agentId: agentId,
        signature: 'test_signature',
      });

    if (loginResponse.status === 200 || loginResponse.status === 201) {
      authToken = loginResponse.body.accessToken;
      return authToken;
    }

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        agentId: agentId,
        name: `AI Writer ${TEST_CONFIG.agentId}`,
        publicKey: 'test_public_key',
        signature: 'test_signature',
        capabilities: ['writing', 'creative'],
        version: '1.0.0',
      });

    if (registerResponse.status === 201 || registerResponse.status === 200) {
      authToken = registerResponse.body.accessToken;
      return authToken;
    }

    throw new Error(`获取认证令牌失败: ${registerResponse.body.message || 'Unknown error'}`);
  }

  async function getAdminToken(): Promise<string> {
    if (adminToken) return adminToken;
    return getAuthToken();
  }

  function readChapterFiles(): ChapterContent[] {
    const chapters: ChapterContent[] = [];
    const files = fs.readdirSync(TEST_CONFIG.chaptersDir)
      .filter(f => f.endsWith('.txt'))
      .sort();

    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(TEST_CONFIG.chaptersDir, files[i]);
      const content = fs.readFileSync(filePath, 'utf-8');

      const titleMatch = content.match(/^##\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : `第${i + 1}章`;

      chapters.push({
        title,
        content,
        orderIndex: i + 1,
      });
    }

    return chapters;
  }

  function parseChapterTitle(content: string, orderIndex: number): string {
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^##\s*(.+)$/);
      if (match) {
        return match[1].trim();
      }
    }

    for (const line of lines) {
      const match = line.match(/^#\s*(.+)$/);
      if (match) {
        return `${match[1].trim()} - 第${orderIndex}章`;
      }
    }

    return `第${orderIndex}章`;
  }

  describe('TC-001: AI智能体注册', () => {
    it('应该成功注册或登录AI智能体', async () => {
      const existingClaw = await request(app.getHttpServer())
        .get(`/api/v1/aiwriters/agentId/${agentId}`);

      if (existingClaw.status === 200 && existingClaw.body) {
        expect(existingClaw.status).toBe(200);
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          agentId: agentId,
          name: `AI Writer ${TEST_CONFIG.agentId}`,
          publicKey: 'test_public_key',
          signature: 'test_signature',
          capabilities: ['writing', 'creative'],
          version: '1.0.0',
        });

      expect([200, 201, 409]).toContain(response.status);
    });
  });

  describe('TC-002: 创建测试小说', () => {
    it('应该成功创建小说', async () => {
      const token = await getAuthToken();

      const response = await request(app.getHttpServer())
        .post('/api/v1/novels')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '《记忆审查官》- 自动发布测试',
          description: '这是一部关于未来世界的科幻小说，讲述记忆审查官沈霁的故事。',
          genre: 'SCIFI',
          tags: ['科幻', '未来', '记忆'],
        });

      expect([200, 201]).toContain(response.status);

      if (response.status === 200 || response.status === 201) {
        testNovelId = response.body.id;
        expect(testNovelId).toBeDefined();
      }
    });
  });

  describe('TC-003: 自动发布章节', () => {
    it('应该成功创建并提交章节审核', async () => {
      if (!testNovelId) {
        console.log('跳过：未创建小说');
        return;
      }

      const token = await getAuthToken();
      const chapters = readChapterFiles();

      console.log(`发现 ${chapters.length} 个章节文件`);

      const testChapters = chapters.slice(0, 3);

      for (const chapter of testChapters) {
        const title = parseChapterTitle(chapter.content, chapter.orderIndex);

        const createResponse = await request(app.getHttpServer())
          .post(`/api/v1/chapters/novel/${testNovelId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: title,
            content: chapter.content,
            orderIndex: chapter.orderIndex,
          });

        expect([200, 201]).toContain(createResponse.status);

        if (createResponse.status === 200 || createResponse.status === 201) {
          const chapterId = createResponse.body.id;
          testChapterIds.push(chapterId);

          const submitResponse = await request(app.getHttpServer())
            .post(`/api/v1/chapters/${chapterId}/submit`)
            .set('Authorization', `Bearer ${token}`);

          expect([200, 201]).toContain(submitResponse.status);
        }
      }

      expect(testChapterIds.length).toBeGreaterThan(0);
    }, 60000);
  });

  describe('TC-004: 自动审批章节', () => {
    it('应该成功审批章节', async () => {
      if (testChapterIds.length === 0) {
        console.log('跳过：无待审批章节');
        return;
      }

      const token = await getAdminToken();
      let approveCount = 0;

      for (const chapterId of testChapterIds) {
        const approveResponse = await request(app.getHttpServer())
          .post(`/api/v1/admin/chapters/${chapterId}/approve`)
          .set('Authorization', `Bearer ${token}`);

        if (approveResponse.status === 200 || approveResponse.status === 201) {
          approveCount++;
        }
      }

      expect(approveCount).toBeGreaterThan(0);
    }, 30000);
  });

  describe('TC-005: 验证已发布章节', () => {
    it('应该验证章节已发布', async () => {
      if (testChapterIds.length === 0) {
        console.log('跳过：无已发布章节');
        return;
      }

      let verifiedCount = 0;

      for (const chapterId of testChapterIds) {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chapters/${chapterId}`);

        if (response.status === 200 && response.body.status === 'PUBLISHED') {
          verifiedCount++;
        }
      }

      expect(verifiedCount).toBeGreaterThan(0);
    });
  });

  describe('测试报告生成', () => {
    it('应该生成测试报告', () => {
      const report = `
# 章节自动发布与审批测试报告

## 测试概览
- **测试时间**: ${new Date().toISOString()}
- **测试用户**: ${TEST_CONFIG.userEmail}
- **AI智能体ID**: ${TEST_CONFIG.agentId}
- **小说ID**: ${testNovelId || '未创建'}
- **章节目录**: ${TEST_CONFIG.chaptersDir}

## 测试数据
- **已创建章节ID**: ${testChapterIds.length > 0 ? testChapterIds.join(', ') : '无'}

## 结论
测试执行完成
`;

      const reportDir = 'd:\\trae\\novelhub\\case\\report';
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const reportPath = path.join(reportDir, 'chapter-auto-publish-test-report.md');
      fs.writeFileSync(reportPath, report, 'utf-8');

      console.log(`测试报告已保存至: ${reportPath}`);
      expect(true).toBe(true);
    });
  });
});
