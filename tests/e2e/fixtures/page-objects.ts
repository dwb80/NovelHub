/**
 * Page Object Model - 页面对象模型
 * 封装页面元素和操作方法，提高测试可维护性
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * 基础页面类
 */
export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page, baseUrl: string = '') {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async navigate(path: string = '') {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getToastMessage(): Promise<string> {
    const toast = this.page.locator('.toast, .notification, [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    return toast.textContent() || '';
  }

  async expectToast(message: string) {
    await expect(this.page.locator('.toast, .notification').filter({ hasText: message })).toBeVisible();
  }
}

/**
 * 登录页面
 */
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.emailInput = page.locator('input[name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"], .btn-login').first();
    this.registerLink = page.locator('a[href*="register"], .link-register').first();
    this.forgotPasswordLink = page.locator('a[href*="forgot"], .link-forgot').first();
  }

  async goto() {
    await this.navigate('/pages/user/login.html');
    await this.waitForLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForTimeout(1500);
  }

  async expectLoginSuccess() {
    await expect(this.page).not.toHaveURL(/login/);
  }

  async expectLoginError(errorMessage?: string) {
    if (errorMessage) {
      await this.expectToast(errorMessage);
    } else {
      await expect(this.page.locator('.error, .alert-error, .form-error').first()).toBeVisible();
    }
  }
}

/**
 * 注册页面
 */
export class RegisterPage extends BasePage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly agreementCheckbox: Locator;
  readonly registerButton: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.usernameInput = page.locator('input[name="username"]').first();
    this.emailInput = page.locator('input[name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('input[name="password"]').first();
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirm_password"]').first();
    this.agreementCheckbox = page.locator('input[name="agreement"], input[type="checkbox"]').first();
    this.registerButton = page.locator('button[type="submit"], .btn-register').first();
  }

  async goto() {
    await this.navigate('/pages/user/register.html');
    await this.waitForLoad();
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    if (await this.agreementCheckbox.isVisible()) {
      await this.agreementCheckbox.check();
    }
    await this.registerButton.click();
    await this.page.waitForTimeout(1500);
  }
}

/**
 * 首页
 */
export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly userAvatar: Locator;
  readonly loginButton: Locator;
  readonly novelCards: Locator;
  readonly navigation: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.searchInput = page.locator('input[type="search"], .search-input, input[placeholder*="搜索"]').first();
    this.searchButton = page.locator('.search-button, button:has-text("搜索")').first();
    this.userAvatar = page.locator('.user-avatar, .avatar, [class*="avatar"]').first();
    this.loginButton = page.locator('.btn-login, a[href*="login"]').first();
    this.novelCards = page.locator('.novel-card, .book-card, [class*="novel-item"]');
    this.navigation = page.locator('nav, .navbar, .navigation').first();
  }

  async goto() {
    await this.navigate('/index.html');
    await this.waitForLoad();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.page.waitForTimeout(1000);
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.userAvatar.isVisible().catch(() => false);
  }

  async clickNovelCard(index: number = 0) {
    await this.novelCards.nth(index).click();
    await this.page.waitForTimeout(1000);
  }
}

/**
 * 小说详情页
 */
export class NovelDetailPage extends BasePage {
  readonly title: Locator;
  readonly author: Locator;
  readonly description: Locator;
  readonly readButton: Locator;
  readonly addToBookshelfButton: Locator;
  readonly commentSection: Locator;
  readonly commentInput: Locator;
  readonly submitCommentButton: Locator;
  readonly ratingStars: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.title = page.locator('h1, .novel-title, .book-title').first();
    this.author = page.locator('.author, .novel-author').first();
    this.description = page.locator('.description, .novel-description, .summary').first();
    this.readButton = page.locator('.btn-read, button:has-text("阅读"), button:has-text("开始阅读")').first();
    this.addToBookshelfButton = page.locator('.btn-add-bookshelf, button:has-text("加入书架")').first();
    this.commentSection = page.locator('.comments-section, .comment-area').first();
    this.commentInput = page.locator('.comment-input, textarea[placeholder*="评论"]').first();
    this.submitCommentButton = page.locator('.btn-submit-comment, button:has-text("发表评论")').first();
    this.ratingStars = page.locator('.rating-stars, .star-rating');
  }

  async goto(novelId: number) {
    await this.navigate(`/pages/novel/detail.html?id=${novelId}`);
    await this.waitForLoad();
  }

  async startReading() {
    await this.readButton.click();
    await this.page.waitForTimeout(1000);
  }

  async addToBookshelf() {
    await this.addToBookshelfButton.click();
    await this.page.waitForTimeout(1000);
  }

  async submitComment(content: string, rating: number = 5) {
    await this.commentInput.fill(content);
    // 选择评分
    const stars = this.ratingStars.locator('i, span, .star').nth(rating - 1);
    if (await stars.isVisible().catch(() => false)) {
      await stars.click();
    }
    await this.submitCommentButton.click();
    await this.page.waitForTimeout(1000);
  }
}

/**
 * 阅读器页面
 */
export class ReaderPage extends BasePage {
  readonly content: Locator;
  readonly chapterTitle: Locator;
  readonly nextChapterButton: Locator;
  readonly prevChapterButton: Locator;
  readonly settingsButton: Locator;
  readonly bookmarkButton: Locator;
  readonly catalogButton: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.content = page.locator('.reader-content, .chapter-content, .content').first();
    this.chapterTitle = page.locator('.chapter-title, h1, h2').first();
    this.nextChapterButton = page.locator('.btn-next, .next-chapter, button:has-text("下一章")').first();
    this.prevChapterButton = page.locator('.btn-prev, .prev-chapter, button:has-text("上一章")').first();
    this.settingsButton = page.locator('.btn-settings, .reader-settings, button:has-text("设置")').first();
    this.bookmarkButton = page.locator('.btn-bookmark, .add-bookmark').first();
    this.catalogButton = page.locator('.btn-catalog, .chapter-catalog').first();
  }

  async goto(novelId: number, chapterId?: number) {
    let url = `/pages/reader/reading.html?novelId=${novelId}`;
    if (chapterId) {
      url += `&chapterId=${chapterId}`;
    }
    await this.navigate(url);
    await this.waitForLoad();
  }

  async nextChapter() {
    await this.nextChapterButton.click();
    await this.page.waitForTimeout(1000);
  }

  async prevChapter() {
    await this.prevChapterButton.click();
    await this.page.waitForTimeout(1000);
  }

  async addBookmark() {
    await this.bookmarkButton.click();
    await this.page.waitForTimeout(500);
  }

  async getChapterTitle(): Promise<string> {
    return this.chapterTitle.textContent() || '';
  }
}

/**
 * 书架页面
 */
export class BookshelfPage extends BasePage {
  readonly novelList: Locator;
  readonly editButton: Locator;
  readonly addCategoryButton: Locator;
  readonly categoryItems: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.novelList = page.locator('.bookshelf-list, .novel-list, .book-list');
    this.editButton = page.locator('.btn-edit, button:has-text("编辑")').first();
    this.addCategoryButton = page.locator('.btn-add-category, button:has-text("添加分类")').first();
    this.categoryItems = page.locator('.category-item, .bookshelf-category');
  }

  async goto() {
    await this.navigate('/pages/user/bookshelf.html');
    await this.waitForLoad();
  }

  async getNovelCount(): Promise<number> {
    return this.novelList.locator('.novel-item, .book-item').count();
  }

  async deleteNovel(index: number = 0) {
    await this.editButton.click();
    const checkbox = this.novelList.locator('.novel-item, .book-item').nth(index).locator('input[type="checkbox"]').first();
    await checkbox.check();
    const deleteButton = this.page.locator('.btn-delete, button:has-text("删除")').first();
    await deleteButton.click();
    // 确认删除
    const confirmButton = this.page.locator('.btn-confirm, button:has-text("确认"), button:has-text("确定")').first();
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async addCategory(name: string) {
    await this.addCategoryButton.click();
    const input = this.page.locator('input[placeholder*="分类"], input[name="category"]').first();
    await input.fill(name);
    const confirmButton = this.page.locator('.btn-confirm, button:has-text("确认"), button:has-text("确定")').first();
    await confirmButton.click();
    await this.page.waitForTimeout(1000);
  }
}

/**
 * OpenClaw创作中心
 */
export class OpenClawPage extends BasePage {
  readonly newWorkButton: Locator;
  readonly titleInput: Locator;
  readonly promptInput: Locator;
  readonly genreSelect: Locator;
  readonly generateOutlineButton: Locator;
  readonly generateChapterButton: Locator;
  readonly saveDraftButton: Locator;
  readonly publishButton: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.newWorkButton = page.locator('.btn-new-work, button:has-text("新建作品")').first();
    this.titleInput = page.locator('input[name="title"], input[placeholder*="标题"]').first();
    this.promptInput = page.locator('textarea[name="prompt"], textarea[placeholder*="提示词"]').first();
    this.genreSelect = page.locator('select[name="genre"]').first();
    this.generateOutlineButton = page.locator('.btn-generate-outline, button:has-text("生成大纲")').first();
    this.generateChapterButton = page.locator('.btn-generate-chapter, button:has-text("生成章节")').first();
    this.saveDraftButton = page.locator('.btn-save-draft, button:has-text("保存草稿")').first();
    this.publishButton = page.locator('.btn-publish, button:has-text("发布")').first();
  }

  async goto() {
    await this.navigate('/pages/openclaw/learning-center.html');
    await this.waitForLoad();
  }

  async createNewWork(title: string, prompt: string, genre: string = '科幻') {
    await this.newWorkButton.click();
    await this.titleInput.fill(title);
    await this.promptInput.fill(prompt);
    if (await this.genreSelect.isVisible()) {
      await this.genreSelect.selectOption(genre);
    }
    await this.page.waitForTimeout(500);
  }

  async generateOutline() {
    await this.generateOutlineButton.click();
    // 等待AI生成完成
    await this.page.waitForTimeout(5000);
  }

  async saveDraft() {
    await this.saveDraftButton.click();
    await this.page.waitForTimeout(1000);
  }

  async publish() {
    await this.publishButton.click();
    await this.page.waitForTimeout(1000);
  }
}

/**
 * 搜索页面
 */
export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly resultItems: Locator;
  readonly filterOptions: Locator;

  constructor(page: Page, baseUrl: string = '') {
    super(page, baseUrl);
    this.searchInput = page.locator('input[type="search"], .search-input').first();
    this.searchButton = page.locator('.search-button, button:has-text("搜索")').first();
    this.resultItems = page.locator('.search-result, .result-item, .novel-card');
    this.filterOptions = page.locator('.filter-option, .filter-item');
  }

  async goto(keyword: string = '') {
    const url = keyword 
      ? `/pages/discover/search.html?q=${encodeURIComponent(keyword)}`
      : '/pages/discover/search.html';
    await this.navigate(url);
    await this.waitForLoad();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.page.waitForTimeout(1500);
  }

  async getResultCount(): Promise<number> {
    return this.resultItems.count();
  }
}
