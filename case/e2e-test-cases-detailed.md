# NovelHub E2E 端到端测试用例（细化版）

**文档版本**: v2.0  
**编制日期**: 2026-04-12  
**测试类型**: 端到端测试 (End-to-End Testing)  
**测试工具**: Cypress / Playwright / Selenium

---

## 测试环境配置

```yaml
测试环境:
  - 浏览器: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
  - 分辨率: 1920x1080 (桌面), 375x812 (移动端)
  - 网络: 模拟 4G/5G/WiFi
  
测试数据:
  - 测试账号: test_user_001 / Test@123456
  - 测试小说: 《斗破苍穹》ID: 1001
  - 测试章节: 第一章 ID: 1001001
```

---

## E2E-001: 用户注册完整流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-001 |
| **测试名称** | 用户注册完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/user/register.html |
| **前置条件** | 1. 访问注册页面<br>2. 使用未注册过的邮箱/手机号 |

**测试数据**:
```json
{
  "email": "test_e2e_001@example.com",
  "password": "Test@123456",
  "confirmPassword": "Test@123456",
  "username": "test_e2e_001"
}
```

**DOM选择器**:
```javascript
const selectors = {
  emailInput: '[data-testid="email-input"]',
  passwordInput: '[data-testid="password-input"]',
  confirmPasswordInput: '[data-testid="confirm-password-input"]',
  agreementCheckbox: '[data-testid="agreement-checkbox"]',
  registerButton: '[data-testid="register-btn"]',
  successToast: '[data-testid="success-toast"]',
  errorToast: '[data-testid="error-toast"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问 `/pages/user/register.html` | 页面加载完成，显示注册表单 | 验证URL和页面标题 |
| 2 | 在邮箱输入框输入 `test_e2e_001@example.com` | 邮箱显示在输入框中 | 验证input的value属性 |
| 3 | 在密码输入框输入 `Test@123456` | 密码显示为掩码 | 验证input的type="password" |
| 4 | 在确认密码输入框输入 `Test@123456` | 确认密码显示为掩码 | 验证input的value属性 |
| 5 | 勾选用户协议复选框 | 复选框变为选中状态 | 验证checkbox的checked属性 |
| 6 | 点击"注册"按钮 | 按钮显示加载状态，发起注册请求 | 验证按钮disabled状态和loading图标 |
| 7 | 等待注册成功 | 显示"注册成功"提示，页面跳转至登录页 | 验证Toast消息和URL变化 |

**预期结果详情**:
- ✅ 页面URL从 `/pages/user/register.html` 变为 `/pages/user/login.html`
- ✅ 显示"注册成功"Toast提示，持续3秒后消失
- ✅ localStorage中存储 `userId` 和 `pendingVerification` 标记
- ✅ 后端数据库 `users` 表新增记录，状态为 `pending`
- ✅ 验证邮件发送队列中有对应任务

**验证检查点**:
- [ ] 注册表单所有字段可正常输入
- [ ] 邮箱格式验证通过
- [ ] 密码强度验证通过（8位以上，包含字母和数字）
- [ ] 两次密码输入一致验证通过
- [ ] 用户协议必须勾选才能提交
- [ ] 注册按钮点击后显示加载状态
- [ ] 注册成功后正确跳转
- [ ] localStorage数据正确存储
- [ ] 后端用户记录正确创建

**失败场景**:
- ❌ 邮箱已注册：显示"该邮箱已被注册"错误提示
- ❌ 密码强度不足：显示"密码至少8位，包含字母和数字"
- ❌ 两次密码不一致：显示"两次输入的密码不一致"
- ❌ 未勾选协议：显示"请阅读并同意用户协议"

**相关用例**:
- 前置: 无
- 后置: E2E-002 (用户登录与登出流程)
- 相关: TC-API-USER-001, TC-API-USER-002, TC-API-USER-003

---

## E2E-002: 用户登录与登出流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-002 |
| **测试名称** | 用户登录与登出完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/user/login.html |
| **前置条件** | 1. 已注册测试账号<br>2. 在登录页面 |

**测试数据**:
```json
{
  "username": "test_user_001",
  "password": "Test@123456"
}
```

**DOM选择器**:
```javascript
const selectors = {
  usernameInput: '[data-testid="username-input"]',
  passwordInput: '[data-testid="password-input"]',
  loginButton: '[data-testid="login-btn"]',
  rememberCheckbox: '[data-testid="remember-checkbox"]',
  userAvatar: '[data-testid="user-avatar"]',
  logoutMenuItem: '[data-testid="logout-menu-item"]',
  loginButtonNav: '[data-testid="nav-login-btn"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问 `/pages/user/login.html` | 页面加载完成 | 验证页面标题和表单元素 |
| 2 | 输入用户名 `test_user_001` | 用户名显示在输入框 | 验证input的value属性 |
| 3 | 输入密码 `Test@123456` | 密码显示为掩码 | 验证input的type="password" |
| 4 | 勾选"记住我"复选框 | 复选框选中 | 验证checkbox的checked属性 |
| 5 | 点击"登录"按钮 | 按钮显示加载状态 | 验证按钮disabled状态 |
| 6 | 等待登录成功 | 页面跳转至首页，导航栏显示用户头像 | 验证URL和UI变化 |
| 7 | 点击用户头像下拉菜单 | 显示下拉菜单，包含"退出登录"选项 | 验证下拉菜单显示 |
| 8 | 点击"退出登录" | 页面刷新，导航栏显示"登录"按钮 | 验证localStorage清除和UI变化 |

**预期结果详情**:
- ✅ 页面URL从 `/pages/user/login.html` 变为 `/index.html`
- ✅ 导航栏右侧显示用户头像，点击显示下拉菜单
- ✅ 显示"登录成功"Toast提示
- ✅ localStorage中存储 `token`, `userId`, `username`
- ✅ Cookie中设置 `session_id` (HttpOnly)
- ✅ 登出后localStorage中用户数据被清除
- ✅ 登出后导航栏恢复显示"登录"按钮

**验证检查点**:
- [ ] 登录表单可正常输入
- [ ] 用户名和密码验证正确
- [ ] 登录成功后正确跳转首页
- [ ] 导航栏状态正确更新
- [ ] localStorage存储正确的用户数据
- [ ] Session Cookie正确设置
- [ ] 记住我功能持久化登录状态
- [ ] 登出功能正确清除数据
- [ ] 登出后UI状态正确恢复

**失败场景**:
- ❌ 用户名不存在：显示"用户名或密码错误"
- ❌ 密码错误：显示"用户名或密码错误"（不提示具体哪个错误）
- ❌ 账号被锁定：显示"账号已被锁定，请联系客服"
- ❌ 网络错误：显示"网络连接失败，请重试"

---

## E2E-003: 小说搜索与阅读流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-003 |
| **测试名称** | 小说搜索与阅读完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /index.html, /pages/discover/search.html, /pages/novel/detail.html, /pages/reader/reading.html |
| **前置条件** | 1. 用户已登录<br>2. 在首页 |

**测试数据**:
```json
{
  "searchKeyword": "斗破苍穹",
  "novelId": "1001",
  "chapterId": "1001001",
  "expectedNovelTitle": "斗破苍穹",
  "expectedAuthor": "天蚕土豆"
}
```

**DOM选择器**:
```javascript
const selectors = {
  // 首页
  searchInput: '[data-testid="search-input"]',
  searchButton: '[data-testid="search-btn"]',
  
  // 搜索结果页
  searchResultItem: '[data-testid="search-result-item"]',
  novelTitle: '[data-testid="novel-title"]',
  novelAuthor: '[data-testid="novel-author"]',
  
  // 小说详情页
  detailTitle: '[data-testid="detail-title"]',
  detailAuthor: '[data-testid="detail-author"]',
  startReadingBtn: '[data-testid="start-reading-btn"]',
  addToBookshelfBtn: '[data-testid="add-bookshelf-btn"]',
  
  // 阅读器
  chapterContent: '[data-testid="chapter-content"]',
  nextChapterBtn: '[data-testid="next-chapter-btn"]',
  bookmarkBtn: '[data-testid="bookmark-btn"]',
  readerMenu: '[data-testid="reader-menu"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 在首页点击搜索框 | 搜索框获得焦点，显示搜索历史 | 验证focus状态和历史列表 |
| 2 | 输入"斗破苍穹" | 输入内容显示，触发搜索建议 | 验证input的value和搜索建议列表 |
| 3 | 点击搜索按钮 | 页面跳转到搜索结果页 | 验证URL变为 `/pages/discover/search.html?q=斗破苍穹` |
| 4 | 等待搜索结果加载 | 显示搜索结果列表 | 验证结果列表渲染完成 |
| 5 | 点击第一个搜索结果 | 跳转到小说详情页 | 验证URL包含 `novel=1001` |
| 6 | 查看小说详情 | 显示完整的小说信息 | 验证标题、作者、封面、简介正确显示 |
| 7 | 点击"开始阅读"按钮 | 跳转到阅读器页面 | 验证URL变为 `/pages/reader/reading.html?novel=1001&chapter=1001001` |
| 8 | 阅读第一页内容 | 阅读器显示第一章内容 | 验证章节标题和内容正确显示 |
| 9 | 点击"下一章"按钮 | 切换到下一章 | 验证URL中chapter参数变化，内容更新 |
| 10 | 点击"添加书签"按钮 | 显示"书签添加成功"提示 | 验证Toast消息和书签按钮状态变化 |
| 11 | 返回书架查看 | 书架中显示该小说和阅读进度 | 验证书架页面数据正确 |

**预期结果详情**:
- ✅ 搜索URL格式: `/pages/discover/search.html?q=斗破苍穹`
- ✅ 搜索结果第一条标题包含"斗破苍穹"
- ✅ 小说详情页URL: `/pages/novel/detail.html?novel=1001`
- ✅ 详情页标题显示"斗破苍穹"，作者显示"天蚕土豆"
- ✅ 阅读器URL: `/pages/reader/reading.html?novel=1001&chapter=1001001`
- ✅ 章节内容正确加载，无乱码
- ✅ 下一章URL: `/pages/reader/reading.html?novel=1001&chapter=1001002`
- ✅ 书签添加成功后按钮变为"已添加书签"状态
- ✅ 书架中小说显示阅读进度为"已读XX%"

**验证检查点**:
- [ ] 搜索框可正常输入并触发搜索
- [ ] 搜索结果与关键词相关
- [ ] 搜索结果点击正确跳转详情页
- [ ] 详情页信息完整准确
- [ ] "开始阅读"按钮可点击并正确跳转
- [ ] 阅读器加载正确的章节内容
- [ ] 章节切换功能正常
- [ ] 书签功能正常工作
- [ ] 阅读进度正确保存到书架

**失败场景**:
- ❌ 搜索无结果：显示"未找到相关小说"和推荐内容
- ❌ 小说不存在：显示404页面
- ❌ 章节加载失败：显示"章节加载失败，点击重试"
- ❌ 未登录访问：重定向到登录页

---

## E2E-004: 书架管理完整流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-004 |
| **测试名称** | 书架管理完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/bookshelf/my-bookshelf.html |
| **前置条件** | 1. 用户已登录<br>2. 书架中有至少2本小说 |

**测试数据**:
```json
{
  "categoryName": "玄幻 favorites",
  "novelToDelete": "nv_002",
  "novelToMove": "nv_001"
}
```

**DOM选择器**:
```javascript
const selectors = {
  // 书架页面
  readingTab: '[data-testid="reading-tab"]',
  favoritesTab: '[data-testid="favorites-tab"]',
  historyTab: '[data-testid="history-tab"]',
  editButton: '[data-testid="edit-btn"]',
  deleteButton: '[data-testid="delete-btn"]',
  addCategoryBtn: '[data-testid="add-category-btn"]',
  categoryInput: '[data-testid="category-input"]',
  confirmBtn: '[data-testid="confirm-btn"]',
  cancelBtn: '[data-testid="cancel-btn"]',
  novelCard: '[data-testid="novel-card"]',
  novelCheckbox: '[data-testid="novel-checkbox"]',
  emptyState: '[data-testid="empty-state"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问 `/pages/bookshelf/my-bookshelf.html` | 页面加载，默认显示"在读"Tab | 验证URL和默认Tab状态 |
| 2 | 点击"收藏"Tab | 切换到收藏列表 | 验证Tab样式切换和内容区域更新 |
| 3 | 点击"历史"Tab | 切换到历史列表 | 验证Tab样式切换和内容区域更新 |
| 4 | 点击"编辑"按钮 | 进入编辑模式，显示复选框 | 验证编辑模式UI变化 |
| 5 | 选择一本小说（勾选复选框） | 复选框选中，删除按钮可用 | 验证复选框状态和按钮状态 |
| 6 | 点击"删除"按钮 | 弹出确认对话框 | 验证确认对话框显示 |
| 7 | 确认删除 | 小说从书架移除，显示删除成功提示 | 验证列表更新和Toast消息 |
| 8 | 点击"添加分类"按钮 | 弹出添加分类对话框 | 验证对话框显示 |
| 9 | 输入分类名称"玄幻 favorites" | 输入内容显示在输入框 | 验证input的value属性 |
| 10 | 点击确认 | 分类创建成功，显示在分类列表 | 验证分类列表更新 |
| 11 | 选择小说，点击"移动到分类" | 小说移动到指定分类 | 验证小说位置变化 |

**预期结果详情**:
- ✅ 书架页面URL: `/pages/bookshelf/my-bookshelf.html`
- ✅ 默认显示"在读"Tab，样式为active状态
- ✅ Tab切换时内容区域正确更新，无残留
- ✅ 编辑模式下每本小说显示复选框
- ✅ 删除操作需要二次确认
- ✅ 删除成功后小说从列表移除
- ✅ 新分类创建后显示在分类列表中
- ✅ 小说移动后正确显示在新分类下

**验证检查点**:
- [ ] 书架页面正确加载
- [ ] Tab切换功能正常
- [ ] 编辑模式正确进入和退出
- [ ] 选择功能正常工作
- [ ] 删除功能有二次确认
- [ ] 删除后数据正确更新
- [ ] 分类创建功能正常
- [ ] 分类移动功能正常
- [ ] 空状态显示正确

**失败场景**:
- ❌ 删除最后一本小说：显示空状态提示
- ❌ 创建重复分类：显示"分类名称已存在"
- ❌ 分类名称过长：显示"分类名称不能超过20个字符"

---

## E2E-005: 评论发布与互动流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-005 |
| **测试名称** | 评论发布与互动完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/novel/detail.html |
| **前置条件** | 1. 用户已登录<br>2. 在小说详情页 |

**测试数据**:
```json
{
  "commentContent": "这本小说太精彩了！强烈推荐！",
  "replyContent": "确实好看，已经追更到最新章了",
  "rating": 5
}
```

**DOM选择器**:
```javascript
const selectors = {
  // 评论区
  commentSection: '[data-testid="comment-section"]',
  commentInput: '[data-testid="comment-input"]',
  ratingStars: '[data-testid="rating-stars"]',
  submitCommentBtn: '[data-testid="submit-comment-btn"]',
  commentList: '[data-testid="comment-list"]',
  commentItem: '[data-testid="comment-item"]',
  replyBtn: '[data-testid="reply-btn"]',
  replyInput: '[data-testid="reply-input"]',
  submitReplyBtn: '[data-testid="submit-reply-btn"]',
  likeBtn: '[data-testid="like-btn"]',
  likeCount: '[data-testid="like-count"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 滚动到评论区 | 评论区进入可视区域 | 验证元素位置 |
| 2 | 点击评论输入框 | 输入框获得焦点，可输入 | 验证focus状态 |
| 3 | 输入评论内容 | 内容显示在输入框 | 验证textarea的value |
| 4 | 点击第5颗星 | 5颗星全部高亮 | 验证rating值和星星样式 |
| 5 | 点击"发表评论"按钮 | 发起提交请求 | 验证按钮loading状态 |
| 6 | 等待提交完成 | 显示"评论成功"提示，评论出现在列表顶部 | 验证Toast和列表更新 |
| 7 | 点击"回复"按钮 | 显示回复输入框 | 验证回复区域显示 |
| 8 | 输入回复内容 | 内容显示在输入框 | 验证input的value |
| 9 | 点击"提交回复" | 回复成功，嵌套显示在原评论下方 | 验证回复显示位置 |
| 10 | 点击"点赞"按钮 | 点赞数+1，按钮变为已点赞状态 | 验证点赞数和按钮样式 |

**预期结果详情**:
- ✅ 评论成功显示"评论发布成功"Toast
- ✅ 新评论显示在评论列表顶部
- ✅ 评论显示用户头像、用户名、评论内容、评分、时间
- ✅ 回复正确嵌套显示在原评论下方
- ✅ 点赞后点赞数实时+1
- ✅ 已点赞的按钮显示为已激活状态
- ✅ 收到评论通知（通知图标显示红点）

**验证检查点**:
- [ ] 评论区可正常访问
- [ ] 评论输入框可正常输入
- [ ] 评分选择功能正常
- [ ] 评论提交功能正常
- [ ] 评论显示在正确位置
- [ ] 回复功能正常
- [ ] 回复嵌套显示正确
- [ ] 点赞功能正常
- [ ] 点赞数实时更新
- [ ] 通知功能正常

**失败场景**:
- ❌ 评论内容为空：显示"评论内容不能为空"
- ❌ 评论内容过长：显示"评论不能超过2000字"
- ❌ 包含敏感词：显示"评论包含敏感词，请修改后重试"
- ❌ 评论频率过高：显示"操作太频繁，请稍后再试"

---

## E2E-006: OpenClaw AI辅助创作流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-006 |
| **测试名称** | OpenClaw AI辅助创作完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/openclaw/learning-center.html |
| **前置条件** | 1. 用户已登录<br>2. 已激活OpenClaw功能 |

**测试数据**:
```json
{
  "novelTitle": "测试作品E2E",
  "novelDescription": "这是一个用于E2E测试的作品",
  "prompt": "写一个关于未来世界的科幻故事",
  "genre": "科幻",
  "chapterCount": 10
}
```

**DOM选择器**:
```javascript
const selectors = {
  createNovelBtn: '[data-testid="create-novel-btn"]',
  titleInput: '[data-testid="novel-title-input"]',
  descriptionInput: '[data-testid="novel-description-input"]',
  genreSelect: '[data-testid="genre-select"]',
  aiModeToggle: '[data-testid="ai-mode-toggle"]',
  promptInput: '[data-testid="prompt-input"]',
  generateOutlineBtn: '[data-testid="generate-outline-btn"]',
  outlineContainer: '[data-testid="outline-container"]',
  chapterList: '[data-testid="chapter-list"]',
  generateContentBtn: '[data-testid="generate-content-btn"]',
  contentEditor: '[data-testid="content-editor"]',
  saveDraftBtn: '[data-testid="save-draft-btn"]',
  publishBtn: '[data-testid="publish-btn"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问创作中心 | 页面加载完成 | 验证URL和页面元素 |
| 2 | 点击"新建作品"按钮 | 弹出作品创建对话框 | 验证对话框显示 |
| 3 | 输入作品标题和简介 | 内容显示在输入框 | 验证input的value |
| 4 | 选择AI辅助模式 | AI模式开关激活 | 验证toggle状态 |
| 5 | 输入创作提示词 | 提示词显示在输入框 | 验证textarea的value |
| 6 | 点击"生成大纲"按钮 | 显示生成中状态 | 验证loading状态 |
| 7 | 等待大纲生成完成 | 显示生成的大纲结构 | 验证大纲内容显示 |
| 8 | 选择章节生成 | 选中需要生成的章节 | 验证复选框状态 |
| 9 | 点击"生成内容"按钮 | 显示生成中状态 | 验证loading状态 |
| 10 | 等待内容生成完成 | 章节内容显示在编辑器 | 验证编辑器内容 |
| 11 | 编辑生成的内容 | 内容可正常编辑 | 验证编辑器可编辑 |
| 12 | 点击"保存草稿"按钮 | 显示"保存成功"提示 | 验证Toast消息 |
| 13 | 点击"发布章节"按钮 | 章节发布成功 | 验证状态变化 |

**预期结果详情**:
- ✅ 作品创建成功后显示在作品列表中
- ✅ AI大纲生成显示进度条和预计时间
- ✅ 生成的大纲结构清晰，包含章节标题和简介
- ✅ 章节内容生成后显示在编辑器中
- ✅ 编辑器支持富文本编辑功能
- ✅ 草稿保存成功后显示"保存成功"提示
- ✅ 章节发布后状态变为"已发布"
- ✅ 发布后小说在小说列表中可见

**验证检查点**:
- [ ] 作品创建功能正常
- [ ] AI大纲生成功能正常
- [ ] 大纲结构正确
- [ ] 章节内容生成功能正常
- [ ] 编辑器功能正常
- [ ] 草稿保存功能正常
- [ ] 章节发布功能正常
- [ ] 发布后数据正确更新

**失败场景**:
- ❌ 标题为空：显示"请输入作品标题"
- ❌ 生成失败：显示"生成失败，请重试"和重试按钮
- ❌ 配额不足：显示"今日生成配额已用完"

---

## E2E-007: 购买与阅读VIP章节流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-007 |
| **测试名称** | 购买与阅读VIP章节完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/reader/reading.html |
| **前置条件** | 1. 用户已登录<br>2. 账户有余额或绑定了支付方式 |

**测试数据**:
```json
{
  "novelId": "1002",
  "novelTitle": "VIP测试小说",
  "chapterId": "1002005",
  "chapterPrice": 0.5,
  "initialBalance": 100.00
}
```

**DOM选择器**:
```javascript
const selectors = {
  vipBadge: '[data-testid="vip-badge"]',
  purchasePrompt: '[data-testid="purchase-prompt"]',
  purchaseBtn: '[data-testid="purchase-btn"]',
  balanceDisplay: '[data-testid="balance-display"]',
  confirmPurchaseBtn: '[data-testid="confirm-purchase-btn"]',
  chapterContent: '[data-testid="chapter-content"]',
  purchaseRecordLink: '[data-testid="purchase-record-link"]',
  purchaseRecordList: '[data-testid="purchase-record-list"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 找到一本VIP小说 | 小说详情页显示VIP标识 | 验证VIP badge显示 |
| 2 | 阅读免费章节 | 内容正常显示 | 验证内容加载 |
| 3 | 点击下一章（VIP章节） | 显示购买提示弹窗 | 验证弹窗显示和内容 |
| 4 | 查看购买提示 | 显示章节价格和余额 | 验证价格和余额显示正确 |
| 5 | 点击"购买本章"按钮 | 弹出确认对话框 | 验证确认对话框 |
| 6 | 确认支付 | 显示"购买成功"提示 | 验证Toast消息 |
| 7 | 阅读VIP章节内容 | VIP章节内容正常显示 | 验证内容加载 |
| 8 | 查看购买记录 | 显示本次购买记录 | 验证记录列表 |

**预期结果详情**:
- ✅ VIP章节显示VIP标识和锁定图标
- ✅ 购买提示显示章节价格（如：0.5元）
- ✅ 购买提示显示当前账户余额
- ✅ 购买成功后余额正确扣除（100.00 -> 99.50）
- ✅ 购买成功后VIP章节内容立即解锁
- ✅ 已购买的章节再次阅读无需重复购买
- ✅ 购买记录中显示本次交易详情

**验证检查点**:
- [ ] VIP标识正确显示
- [ ] 购买提示正确显示
- [ ] 价格和余额显示正确
- [ ] 购买流程正常
- [ ] 余额正确扣除
- [ ] 章节内容正确解锁
- [ ] 购买记录正确保存

**失败场景**:
- ❌ 余额不足：显示"余额不足，请先充值"和充值入口
- ❌ 购买失败：显示"购买失败，请重试"
- ❌ 网络错误：显示"网络异常，请检查网络后重试"

---

## E2E-008: 跨设备阅读进度同步

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-008 |
| **测试名称** | 跨设备阅读进度同步测试 |
| **优先级** | P1 |
| **所属页面** | /pages/reader/reading.html |
| **前置条件** | 1. 同一账号在设备A和设备B登录<br>2. 两设备网络正常 |

**测试数据**:
```json
{
  "novelId": "1001",
  "novelTitle": "斗破苍穹",
  "targetChapter": 10,
  "targetProgress": 50.5
}
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 在设备A上阅读小说至第10章第50% | 进度正确保存 | 验证进度显示 |
| 2 | 等待同步（或手动刷新） | 进度同步到服务器 | 验证网络请求 |
| 3 | 在设备B上打开同一本小说 | 显示同步的阅读进度 | 验证进度显示 |
| 4 | 在设备B上继续阅读至第11章 | 进度更新 | 验证进度变化 |
| 5 | 在设备A上刷新页面 | 显示设备B的新进度 | 验证进度同步 |

**预期结果详情**:
- ✅ 设备B显示设备A的阅读进度（第10章50%）
- ✅ 设备A同步设备B的新进度（第11章）
- ✅ 进度同步延迟小于5秒
- ✅ 进度精确到段落级别
- ✅ 离线时本地保存，联网后自动同步

**验证检查点**:
- [ ] 阅读进度正确保存
- [ ] 进度正确上传到服务器
- [ ] 跨设备进度正确同步
- [ ] 同步延迟在可接受范围
- [ ] 离线模式正常工作

---

## E2E-009: 主题切换与偏好保存

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-009 |
| **测试名称** | 主题切换与偏好保存测试 |
| **优先级** | P1 |
| **所属页面** | /index.html, /pages/reader/reading.html |
| **前置条件** | 1. 用户已登录 |

**DOM选择器**:
```javascript
const selectors = {
  themeToggleBtn: '[data-testid="theme-toggle-btn"]',
  themeMenu: '[data-testid="theme-menu"]',
  lightThemeOption: '[data-testid="light-theme-option"]',
  darkThemeOption: '[data-testid="dark-theme-option"]',
  eyeCareThemeOption: '[data-testid="eye-care-theme-option"]',
  paperThemeOption: '[data-testid="paper-theme-option"]',
  bodyElement: 'body'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 在首页点击主题切换按钮 | 显示主题选择菜单 | 验证菜单显示 |
| 2 | 切换到"夜间"主题 | 页面变为深色主题 | 验证body的class变化 |
| 3 | 切换到"护眼"主题 | 页面变为绿色主题 | 验证body的class变化 |
| 4 | 切换到"羊皮纸"主题 | 页面变为米黄色主题 | 验证body的class变化 |
| 5 | 刷新页面 | 保持当前主题 | 验证localStorage读取 |
| 6 | 关闭浏览器重新打开 | 保持主题设置 | 验证持久化 |
| 7 | 登录同一账号 | 主题设置同步 | 验证服务器同步 |

**预期结果详情**:
- ✅ 4种主题切换即时生效
- ✅ 主题样式正确应用（背景色、文字色）
- ✅ 刷新后保持当前主题（localStorage）
- ✅ 重新登录后恢复上次主题（服务器同步）
- ✅ 主题切换动画流畅

**验证检查点**:
- [ ] 主题切换按钮可点击
- [ ] 主题菜单正确显示
- [ ] 每种主题正确应用
- [ ] localStorage正确存储
- [ ] 服务器同步正确

---

## E2E-010: 消息通知完整流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-010 |
| **测试名称** | 消息通知完整流程测试 |
| **优先级** | P1 |
| **所属页面** | /index.html, /pages/user/notifications.html |
| **前置条件** | 1. 用户A和用户B都已登录<br>2. 用户B关注了用户A |

**DOM选择器**:
```javascript
const selectors = {
  notificationIcon: '[data-testid="notification-icon"]',
  notificationBadge: '[data-testid="notification-badge"]',
  notificationList: '[data-testid="notification-list"]',
  notificationItem: '[data-testid="notification-item"]',
  markAllReadBtn: '[data-testid="mark-all-read-btn"]',
  notificationSettingsBtn: '[data-testid="notification-settings-btn"]',
  settingsModal: '[data-testid="settings-modal"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 用户A发布一条评论 | 评论成功发布 | 验证评论显示 |
| 2 | 用户B查看通知图标 | 显示未读消息红点 | 验证badge显示 |
| 3 | 用户B点击通知图标 | 显示通知列表 | 验证列表显示 |
| 4 | 用户B查看通知列表 | 显示用户A的评论通知 | 验证通知内容 |
| 5 | 用户B点击一条通知 | 跳转到对应页面 | 验证URL变化 |
| 6 | 用户B标记所有通知为已读 | 红点消失 | 验证badge消失 |
| 7 | 用户B设置通知偏好 | 设置保存成功 | 验证设置持久化 |

**预期结果详情**:
- ✅ 用户B收到评论通知提醒（红点+数字）
- ✅ 通知列表显示新消息，包含标题和摘要
- ✅ 点击通知跳转到正确的评论位置
- ✅ 已读状态更新，红点消失
- ✅ 偏好设置保存成功，下次生效

---

## E2E-011: 小说收藏与追更流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-011 |
| **测试名称** | 小说收藏与追更完整流程测试 |
| **优先级** | P1 |
| **所属页面** | /pages/novel/detail.html |
| **前置条件** | 1. 用户已登录 |

**测试数据**:
```json
{
  "novelId": "1003",
  "autoPurchase": true,
  "notifyOnUpdate": true
}
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 浏览小说列表 | 小说列表正确显示 | 验证列表渲染 |
| 2 | 点击一本小说进入详情 | 跳转到详情页 | 验证URL变化 |
| 3 | 点击"加入书架"按钮 | 显示收藏成功提示 | 验证Toast消息 |
| 4 | 选择追更设置 | 设置选项显示 | 验证选项显示 |
| 5 | 确认收藏 | 按钮状态变为"已在书架" | 验证按钮状态 |
| 6 | 查看书架确认添加 | 小说在书架列表中 | 验证书架数据 |
| 7 | 取消收藏 | 显示确认对话框 | 验证对话框 |
| 8 | 确认取消 | 小说从书架移除 | 验证书架更新 |

**预期结果详情**:
- ✅ 收藏成功显示"已加入书架"提示
- ✅ 追更设置保存（自动购买/更新提醒）
- ✅ 书架显示该小说和追更状态
- ✅ 取消收藏后书架移除
- ✅ 追更设置清除

---

## E2E-012: 排行榜浏览与筛选

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-012 |
| **测试名称** | 排行榜浏览与筛选测试 |
| **优先级** | P1 |
| **所属页面** | /pages/discover/ranking.html |
| **前置条件** | 1. 用户已登录或游客模式 |

**DOM选择器**:
```javascript
const selectors = {
  totalTab: '[data-testid="total-tab"]',
  monthlyTab: '[data-testid="monthly-tab"]',
  weeklyTab: '[data-testid="weekly-tab"]',
  newTab: '[data-testid="new-tab"]',
  categoryFilter: '[data-testid="category-filter"]',
  sortSelect: '[data-testid="sort-select"]',
  novelList: '[data-testid="ranking-list"]',
  loadMoreBtn: '[data-testid="load-more-btn"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问排行榜页面 | 页面加载，默认显示总榜 | 验证URL和默认Tab |
| 2 | 切换到月榜 | 显示月榜数据 | 验证Tab切换和数据更新 |
| 3 | 切换到周榜 | 显示周榜数据 | 验证Tab切换和数据更新 |
| 4 | 选择"玄幻"分类筛选 | 显示玄幻类小说 | 验证筛选结果 |
| 5 | 点击一本小说 | 跳转到详情页 | 验证URL变化 |
| 6 | 返回排行榜 | 保持筛选状态 | 验证状态保持 |
| 7 | 切换排序方式 | 数据按新排序显示 | 验证排序结果 |
| 8 | 点击"加载更多" | 加载下一页数据 | 验证分页加载 |

---

## E2E-013: 个人资料编辑流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-013 |
| **测试名称** | 个人资料编辑完整流程测试 |
| **优先级** | P1 |
| **所属页面** | /pages/user/profile.html |
| **前置条件** | 1. 用户已登录 |

**测试数据**:
```json
{
  "newNickname": "测试用户E2E",
  "newBio": "这是一个测试简介",
  "newGender": "male"
}
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问个人中心 | 页面加载完成 | 验证页面元素 |
| 2 | 点击"编辑资料"按钮 | 进入编辑模式 | 验证编辑表单显示 |
| 3 | 修改昵称 | 新昵称显示在输入框 | 验证input的value |
| 4 | 上传头像 | 头像预览更新 | 验证图片预览 |
| 5 | 修改个人简介 | 新简介显示在输入框 | 验证textarea的value |
| 6 | 修改性别 | 性别选项选中 | 验证radio状态 |
| 7 | 点击"保存"按钮 | 显示保存成功提示 | 验证Toast消息 |
| 8 | 查看修改结果 | 显示更新后的资料 | 验证数据更新 |
| 9 | 刷新页面验证持久化 | 修改后的资料仍然显示 | 验证持久化 |

---

## E2E-014: 阅读器功能完整测试

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-014 |
| **测试名称** | 阅读器功能完整测试 |
| **优先级** | P0 |
| **所属页面** | /pages/reader/reading.html |
| **前置条件** | 1. 用户已登录<br>2. 在阅读器页面 |

**DOM选择器**:
```javascript
const selectors = {
  // 阅读器设置
  settingsBtn: '[data-testid="reader-settings-btn"]',
  settingsPanel: '[data-testid="settings-panel"]',
  fontSizeDecrease: '[data-testid="font-size-decrease"]',
  fontSizeIncrease: '[data-testid="font-size-increase"]',
  fontSizeValue: '[data-testid="font-size-value"]',
  themeOptions: '[data-testid="theme-options"]',
  lineHeightOptions: '[data-testid="line-height-options"]',
  
  // 目录和导航
  tocBtn: '[data-testid="toc-btn"]',
  tocPanel: '[data-testid="toc-panel"]',
  tocItem: '[data-testid="toc-item"]',
  prevChapterBtn: '[data-testid="prev-chapter-btn"]',
  nextChapterBtn: '[data-testid="next-chapter-btn"]',
  
  // 书签
  bookmarkBtn: '[data-testid="bookmark-btn"]',
  bookmarkListBtn: '[data-testid="bookmark-list-btn"]',
  bookmarkListPanel: '[data-testid="bookmark-list-panel"]',
  
  // 阅读进度
  progressBar: '[data-testid="progress-bar"]',
  progressText: '[data-testid="progress-text"]'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 打开一本小说开始阅读 | 阅读器加载完成 | 验证内容显示 |
| 2 | 点击设置按钮 | 显示设置面板 | 验证面板显示 |
| 3 | 调整字体大小 | 字体大小变化，内容重排 | 验证字体大小和布局 |
| 4 | 切换背景主题 | 主题颜色变化 | 验证主题应用 |
| 5 | 调整行间距 | 行间距变化 | 验证行高变化 |
| 6 | 点击目录按钮 | 显示目录面板 | 验证目录显示 |
| 7 | 点击目录项跳转 | 跳转到对应章节 | 验证章节切换 |
| 8 | 添加书签 | 显示书签添加成功 | 验证书签功能 |
| 9 | 查看书签列表 | 显示已添加的书签 | 验证书签列表 |
| 10 | 切换翻页模式 | 翻页效果变化 | 验证翻页动画 |
| 11 | 查看阅读进度 | 进度条和百分比显示 | 验证进度显示 |
| 12 | 点击下一章/上一章 | 章节切换 | 验证章节导航 |

---

## E2E-015: 支付与充值完整流程

| 属性 | 内容 |
|------|------|
| **测试ID** | E2E-015 |
| **测试名称** | 支付与充值完整流程测试 |
| **优先级** | P0 |
| **所属页面** | /pages/user/recharge.html |
| **前置条件** | 1. 用户已登录<br>2. 已绑定支付方式或有余额 |

**测试数据**:
```json
{
  "rechargeAmount": 100,
  "paymentMethod": "alipay",
  "initialBalance": 50.00
}
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 验证方法 |
|------|------|----------|----------|
| 1 | 访问充值页面 | 页面加载完成 | 验证页面元素 |
| 2 | 选择充值金额100元 | 金额选中高亮 | 验证选中状态 |
| 3 | 选择支付方式（支付宝） | 支付方式选中 | 验证radio状态 |
| 4 | 点击确认支付 | 跳转到支付页面/显示二维码 | 验证支付界面 |
| 5 | 完成支付验证 | 显示支付成功 | 验证支付结果 |
| 6 | 返回应用 | 余额增加100元 | 验证余额更新 |
| 7 | 查看交易记录 | 显示充值记录 | 验证记录列表 |
| 8 | 申请发票（可选） | 发票申请成功 | 验证发票功能 |

---

## 测试执行计划

### 执行频率

| 测试类型 | 执行频率 | 执行时间 |
|---------|---------|---------|
| P0级用例 | 每次发布前 | 自动化执行 |
| P1级用例 | 每日 | 自动化执行 |
| 全量回归 | 每周 | 周末执行 |

### 环境矩阵

| 浏览器 | 桌面端 | 移动端 |
|--------|--------|--------|
| Chrome | 必选 | 必选 |
| Firefox | 必选 | 可选 |
| Safari | 可选 | 必选 |
| Edge | 可选 | - |

### 失败处理

1. **P0级失败**: 阻塞发布，必须修复
2. **P1级失败**: 24小时内修复
3. **偶发性失败**: 重试3次，记录问题

---

## 附录

### 测试账号信息

```yaml
测试账号1:
  username: test_user_001
  password: Test@123456
  email: test001@example.com
  
测试账号2:
  username: test_user_002
  password: Test@123456
  email: test002@example.com
```

### 测试小说数据

```yaml
小说1:
  id: 1001
  title: 斗破苍穹
  author: 天蚕土豆
  category: 玄幻
  
小说2:
  id: 1002
  title: VIP测试小说
  is_vip: true
  price_per_chapter: 0.5
  
小说3:
  id: 1003
  title: 普通测试小说
  author: 测试作者
  category: 科幻
```

---

**编制**: 测试工程师  
**审核**: 待审核  
**更新日期**: 2026-04-12
