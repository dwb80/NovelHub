import { test, expect, Page } from '@playwright/test';

/**
 * 小说详情页面评审信息展示 E2E 测试
 * 
 * 对应需求：
 * - 显示参与小说评审的AI评审员信息
 * - 显示每个章节的评审过程信息
 * - 章节列表支持分页，每页10条数据
 * - 章节列表显示章节、AI评审员、状态等数据
 * - 章节列表支持详情、删除按钮
 */

// 测试配置
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// 测试数据
const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123',
};

// 辅助函数：管理员登录
async function adminLogin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[name="username"]', TEST_ADMIN.username);
  await page.fill('input[name="password"]', TEST_ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/);
}

// 辅助函数：获取测试小说ID
async function getTestNovelId(page: Page): Promise<string | null> {
  try {
    // 先访问小说列表获取第一个小说ID
    await page.goto(`${BASE_URL}/admin/novels`);
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // 获取第一行的小说ID
    const firstRow = await page.locator('table tbody tr').first();
    const detailLink = await firstRow.locator('a[href*="/admin/novels/"]').first();
    const href = await detailLink.getAttribute('href');
    const match = href?.match(/\/admin\/novels\/([^\/]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.log('获取测试小说ID失败:', error);
    return null;
  }
}

test.describe('小说详情页面 - 评审信息展示', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test('TC-006: 页面显示AI评审员信息', async ({ page }) => {
    // 获取测试小说ID
    const novelId = await getTestNovelId(page);
    test.skip(!novelId, '没有可测试的小说');

    // 访问小说详情页
    await page.goto(`${BASE_URL}/admin/novels/${novelId}`);
    
    // 等待页面加载完成
    await page.waitForSelector('h1:has-text("小说详情")');

    // 验证"参与评审的AI评审员"卡片存在
    const reviewerCard = page.locator('text=参与评审的AI评审员').first();
    await expect(reviewerCard).toBeVisible();

    // 截图记录
    await page.screenshot({ 
      path: 'case/report/novel-detail-review/reviewer-info.png',
      fullPage: false 
    });
  });

  test('TC-007: 页面显示评审统计', async ({ page }) => {
    const novelId = await getTestNovelId(page);
    test.skip(!novelId, '没有可测试的小说');

    await page.goto(`${BASE_URL}/admin/novels/${novelId}`);
    await page.waitForSelector('h1:has-text("小说详情")');

    // 验证"评审统计"卡片存在
    const statsCard = page.locator('text=评审统计').first();
    await expect(statsCard).toBeVisible();

    // 验证统计数据项存在
    await expect(page.locator('text=总章节')).toBeVisible();
    await expect(page.locator('text=已评审')).toBeVisible();
    await expect(page.locator('text=待评审')).toBeVisible();
    await expect(page.locator('text=平均评分')).toBeVisible();

    // 截图记录
    await page.screenshot({ 
      path: 'case/report/novel-detail-review/review-stats.png' 
    });
  });

  test('TC-008: 页面显示评审过程记录', async ({ page }) => {
    const novelId = await getTestNovelId(page);
    test.skip(!novelId, '没有可测试的小说');

    await page.goto(`${BASE_URL}/admin/novels/${novelId}`);
    await page.waitForSelector('h1:has-text("小说详情")');

    // 验证"评审过程记录"卡片存在
    const processCard = page.locator('text=评审过程记录').first();
    
    // 如果有评审记录则验证，没有则跳过
    const hasProcesses = await processCard.isVisible().catch(() => false);
    
    if (hasProcesses) {
      // 验证评审记录项包含必要信息
      const firstProcess = page.locator('.border.rounded-lg').first();
      await expect(firstProcess.locator('text=第')).toBeVisible();
      await expect(firstProcess.locator('text=章')).toBeVisible();
      await expect(firstProcess.locator('text=评审员:')).toBeVisible();
    }

    // 截图记录
    await page.screenshot({ 
      path: 'case/report/novel-detail-review/review-processes.png' 
    });
  });

  test('TC-009: 章节列表分页功能', async ({ page }) => {
    const novelId = await getTestNovelId(page);
    test.skip(!novelId, '没有可测试的小说');

    await page.goto(`${BASE_URL}/admin/novels/${novelId}`);
    await page.waitForSelector('h1:has-text("小说详情")');

    // 验证章节列表表格存在
    const chapterTable = page.locator('text=章节评审列表').first();
    await expect(chapterTable).toBeVisible();

    // 验证表格列存在
    await expect(page.locator('th:has-text("序号")')).toBeVisible();
    await expect(page.locator('th:has-text("章节标题")')).toBeVisible();
    await expect(page.locator('th:has-text("字数")')).toBeVisible();
    await expect(page.locator('th:has-text("章节状态")')).toBeVisible();
    await expect(page.locator('th:has-text("AI评审员")')).toBeVisible();
    await expect(page.locator('th:has-text("评审状态")')).toBeVisible();
    await expect(page.locator('th:has-text("评分")')).toBeVisible();
    await expect(page.locator('th:has-text("操作")')).toBeVisible();

    // 检查是否有分页组件（如果章节数>10）
    const pagination = page.locator('[role="navigation"]').first();
    const hasPagination = await pagination.isVisible().catch(() => false);
    
    if (hasPagination) {
      // 测试分页切换
      const page2Button = page.locator('button:has-text("2"), a:has-text("2")').first();
      if (await page2Button.isVisible().catch(() => false)) {
        await page2Button.click();
        await page.waitForTimeout(500);
        
        // 验证页面数据更新
        await expect(page.locator('table tbody tr').first()).toBeVisible();
      }
    }

    // 截图记录
    await page.screenshot({ 
      path: 'case/report/novel-detail-review/chapter-list.png' 
    });
  });

  test('TC-010: 章节删除功能 - 取消删除', async ({ page }) => {
    const novelId = await getTestNovelId(page);
    test.skip(!novelId, '没有可测试的小说');

    await page.goto(`${BASE_URL}/admin/novels/${novelId}`);
    await page.waitForSelector('h1:has-text("小说详情")');

    // 找到第一个章节的删除按钮
    const firstDeleteButton = page.locator('table tbody tr').first().locator('button:has-text("删除")');
    
    // 如果没有删除按钮则跳过
    const hasDeleteButton = await firstDeleteButton.isVisible().catch(() => false);
    test.skip(!hasDeleteButton, '没有可删除的章节');

    // 点击删除按钮
    await firstDeleteButton.click();

    // 验证确认对话框出现
    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('text=确认删除章节')).toBeVisible();

    // 点击取消
    await dialog.locator('button:has-text("取消")').click();

    // 验证对话框关闭
    await expect(dialog).not.toBeVisible();

    // 截图记录
    await page.screenshot({ 
      path: 'case/report/novel-detail-review/delete-cancelled.png' 
    });
  });

  test('TC-011: 章节详情跳转', async ({ page, context }) => {
    const novelId = await getTestNovelId(page);
    test.skip(!novelId, '没有可测试的小说');

    await page.goto(`${BASE_URL}/admin/novels/${novelId}`);
    await page.waitForSelector('h1:has-text("小说详情")');

    // 找到第一个章节的详情按钮
    const firstDetailButton = page.locator('table tbody tr').first().locator('button:has-text("详情")');
    
    const hasDetailButton = await firstDetailButton.isVisible().catch(() => false);
    test.skip(!hasDetailButton, '没有可查看的章节');

    // 点击详情按钮
    await firstDetailButton.click();

    // 验证页面跳转（如果章节详情页存在）
    await page.waitForTimeout(1000);
    
    // 截图记录当前状态
    await page.screenshot({ 
      path: 'case/report/novel-detail-review/chapter-detail.png' 
    });
  });
});

test.describe('小说详情API - 集成测试', () => {
  let authToken: string;
  let testNovelId: string;

  test.beforeAll(async ({ request }) => {
    // 管理员登录获取token
    const loginResponse = await request.post(`${API_URL}/api/v1/admin/auth/login`, {
      data: TEST_ADMIN,
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;

    // 获取测试小说ID
    const novelsResponse = await request.get(`${API_URL}/api/v1/admin/novels?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (novelsResponse.ok()) {
      const novelsData = await novelsResponse.json();
      if (novelsData.novels && novelsData.novels.length > 0) {
        testNovelId = novelsData.novels[0].id;
      }
    }
  });

  test('TC-001: 获取小说评审详情API', async ({ request }) => {
    test.skip(!testNovelId, '没有可测试的小说');

    const response = await request.get(
      `${API_URL}/api/v1/admin/novels/${testNovelId}/reviews`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    // 验证响应状态
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // 验证响应数据结构
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('author');
    expect(data).toHaveProperty('reviewers');
    expect(data).toHaveProperty('reviewProcesses');
    expect(data).toHaveProperty('statistics');

    // 验证reviewers数组
    expect(Array.isArray(data.reviewers)).toBeTruthy();
    if (data.reviewers.length > 0) {
      expect(data.reviewers[0]).toHaveProperty('id');
      expect(data.reviewers[0]).toHaveProperty('name');
      expect(data.reviewers[0]).toHaveProperty('agentId');
    }

    // 验证statistics对象
    expect(data.statistics).toHaveProperty('totalChapters');
    expect(data.statistics).toHaveProperty('reviewedChapters');
    expect(data.statistics).toHaveProperty('pendingChapters');
    expect(data.statistics).toHaveProperty('averageRating');

    // 验证reviewProcesses数组
    expect(Array.isArray(data.reviewProcesses)).toBeTruthy();
    if (data.reviewProcesses.length > 0) {
      expect(data.reviewProcesses[0]).toHaveProperty('taskId');
      expect(data.reviewProcesses[0]).toHaveProperty('reviewId');
      expect(data.reviewProcesses[0]).toHaveProperty('chapterId');
      expect(data.reviewProcesses[0]).toHaveProperty('chapterTitle');
      expect(data.reviewProcesses[0]).toHaveProperty('overallRating');
      expect(data.reviewProcesses[0]).toHaveProperty('status');
    }
  });

  test('TC-002: 获取小说章节评审列表（分页）', async ({ request }) => {
    test.skip(!testNovelId, '没有可测试的小说');

    const response = await request.get(
      `${API_URL}/api/v1/admin/novels/${testNovelId}/chapter-reviews?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    // 验证响应状态
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // 验证响应数据结构
    expect(data).toHaveProperty('chapters');
    expect(data).toHaveProperty('pagination');

    // 验证chapters数组
    expect(Array.isArray(data.chapters)).toBeTruthy();
    expect(data.chapters.length).toBeLessThanOrEqual(10);

    if (data.chapters.length > 0) {
      const chapter = data.chapters[0];
      expect(chapter).toHaveProperty('id');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('orderIndex');
      expect(chapter).toHaveProperty('wordCount');
      expect(chapter).toHaveProperty('status');
    }

    // 验证pagination对象
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('totalPages');
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });

  test('TC-004: 删除不存在的章节', async ({ request }) => {
    const fakeChapterId = 'non-existent-chapter-id';

    const response = await request.delete(
      `${API_URL}/api/v1/admin/chapters/${fakeChapterId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    // 验证错误响应
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.message).toContain('章节不存在');
  });

  test('TC-005: 未授权访问评审详情API', async ({ request }) => {
    test.skip(!testNovelId, '没有可测试的小说');

    const response = await request.get(
      `${API_URL}/api/v1/admin/novels/${testNovelId}/reviews`
      // 不携带token
    );

    // 验证未授权响应
    expect(response.status()).toBe(401);
  });
});
