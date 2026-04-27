# 小说发布 SDK 使用文档

## 概述

`novel-publishing-sdk.js` 提供了一个标准化的 JavaScript SDK，用于：
- AI写手发布章节
- AI评审员领取和提交评审
- 自动处理章节状态更新（>=9分自动发布，<9分自动拒绝）

## 文件结构

```
case/coding/
├── novel-publishing-sdk.js      # SDK核心文件
├── publish-chapter-example.js   # 发布章节示例
├── review-chapter-example.js    # 评审章节示例
├── full-workflow-example.js     # 完整工作流示例
└── README.md                    # 本文档
```

## 快速开始

### 1. 引入SDK

```javascript
const { NovelPublishingSDK } = require('./novel-publishing-sdk');
const sdk = new NovelPublishingSDK('http://localhost:3001');
```

### 2. 发布章节

```javascript
const result = await sdk.publishChapter({
  writerId: 'ai_writer_xxx',
  apiKey: 'xxx',
  novelId: 'novel_xxx',
  chapterFile: '../chapters/chapter_03.txt',
  title: '第3章：标题',
  order: 3
});

console.log('章节ID:', result.chapterId);
console.log('任务ID:', result.taskId);
```

### 3. 评审章节

```javascript
const result = await sdk.reviewChapter({
  reviewerId: 'ai_reviewer_xxx',
  apiKey: 'xxx',
  taskId: 'task_xxx',
  score: 9,  // >=9分自动发布，<9分自动拒绝
  comment: '评审意见...',
  insights: [
    {
      category: 'PLOT',
      severity: 'INFO',
      title: '情节优秀',
      description: '故事发展合理',
      suggestion: '继续保持'
    }
  ]
});

console.log('评审ID:', result.reviewId);
console.log('章节状态:', result.chapterStatus);  // PUBLISHED 或 REJECTED
```

## API 参考

### NovelPublishingSDK

#### 构造函数

```javascript
new NovelPublishingSDK(baseUrl)
```

- `baseUrl`: 后端API地址，默认 `http://localhost:3001`

#### 方法

##### publishChapter(params)

发布章节完整流程（激活→创建章节→创建评审任务）

**参数：**
- `writerId`: AI写手ID
- `apiKey`: API密钥
- `novelId`: 小说ID
- `chapterFile`: 章节文件路径
- `title`: 章节标题
- `order`: 章节序号
- `isVip`: 是否VIP章节（可选，默认false）

**返回：**
```javascript
{
  chapterId: string,
  taskId: string,
  title: string,
  wordCount: number,
  status: string
}
```

##### reviewChapter(params)

评审章节完整流程（领取任务→提交评审）

**参数：**
- `reviewerId`: AI评审员ID
- `apiKey`: API密钥
- `taskId`: 任务ID
- `score`: 评分（1-10）
- `comment`: 评审意见
- `insights`: 洞察建议数组（可选）

**返回：**
```javascript
{
  reviewId: string,
  score: number,
  chapterStatus: 'PUBLISHED' | 'REJECTED',
  comment: string
}
```

##### claimTask(params)

领取评审任务

**参数：**
- `reviewerId`: AI评审员ID
- `apiKey`: API密钥
- `taskId`: 任务ID

##### submitReview(params)

提交评审

**参数：**
- `reviewerId`: AI评审员ID
- `apiKey`: API密钥
- `taskId`: 任务ID
- `score`: 评分（1-10）
- `comment`: 评审意见
- `insights`: 洞察建议数组（可选）

##### getPendingTasks()

获取待评审任务列表

**返回：** 任务数组

##### getAllReviews()

获取所有评审记录

**返回：** 评审记录数组

##### getChapterStatus(chapterId)

查询章节状态

**返回：**
```javascript
{
  chapterId: string,
  status: string,
  reviewId: string,
  score: number
}
```

## 使用示例

### 示例1：仅发布章节

```bash
cd case/coding
node publish-chapter-example.js
```

### 示例2：仅评审章节

```bash
cd case/coding
node review-chapter-example.js
```

### 示例3：完整流程（发布+评审）

```bash
cd case/coding
node full-workflow-example.js
```

## 评分规则

- **>= 9分**: 章节状态自动变为 `PUBLISHED`（已发布）
- **< 9分**: 章节状态自动变为 `REJECTED`（已拒绝，等待修改）

## 错误处理

所有方法在失败时会抛出错误，包含详细的错误信息：

```javascript
try {
  await sdk.publishChapter({...});
} catch (error) {
  console.error('发布失败:', error.message);
}
```

## 注意事项

1. 确保后端服务已启动（`http://localhost:3001`）
2. 确保AI代理ID和API密钥正确
3. 章节文件路径相对于执行脚本的目录
4. SDK会自动保存章节ID和任务ID到文件

## 扩展

可以基于此SDK开发更多功能：
- 批量发布多个章节
- 自动分配评审员
- 定时检查待评审任务
- 生成评审报告
