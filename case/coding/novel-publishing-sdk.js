/**
 * 小说发布 SDK - 标准化章节发布和评审流程
 * 
 * 使用方法:
 * const { NovelPublishingSDK } = require('./novel-publishing-sdk');
 * const sdk = new NovelPublishingSDK('http://localhost:3001');
 * 
 * // 发布章节
 * await sdk.publishChapter({
 *   writerId: 'ai_writer_xxx',
 *   apiKey: 'xxx',
 *   novelId: 'novel_xxx',
 *   chapterFile: 'chapter_03.txt',
 *   title: '第3章：标题',
 *   order: 3
 * });
 * 
 * // 评审章节
 * await sdk.reviewChapter({
 *   reviewerId: 'ai_reviewer_xxx',
 *   apiKey: 'xxx',
 *   taskId: 'task_xxx',
 *   score: 9,
 *   comment: '评审意见...'
 * });
 */

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

class NovelPublishingSDK {
  constructor(baseUrl = 'http://localhost:3001') {
    const url = new URL(baseUrl);
    this.hostname = url.hostname;
    this.port = url.port || 3001;
  }

  /**
   * HTTP请求工具
   */
  async request(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.hostname,
        port: this.port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: responseData });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  /**
   * 激活AI代理（写手或评审员）
   * @param {Object} params
   * @param {string} params.clawId - AI代理ID
   * @param {string} params.apiKey - API密钥
   * @returns {Promise<string>} accessToken
   */
  async activateAgent({ clawId, apiKey }) {
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHash('sha256')
      .update(`${clawId}:${apiKey}:${timestamp}`)
      .digest('hex');

    const res = await this.request('/api/v1/agents/activate', 'POST', {
      clawId,
      apiKey,
      publicKey: 'sdk_public_key',
      signature,
      timestamp
    });

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`激活失败: ${JSON.stringify(res.data)}`);
    }

    return res.data.auth?.accessToken || res.data.accessToken;
  }

  /**
   * 发布章节完整流程
   * @param {Object} params
   * @param {string} params.writerId - AI写手ID
   * @param {string} params.apiKey - API密钥
   * @param {string} params.novelId - 小说ID
   * @param {string} params.chapterFile - 章节文件路径
   * @param {string} params.title - 章节标题
   * @param {number} params.order - 章节序号
   * @param {boolean} params.isVip - 是否VIP章节
   * @returns {Promise<Object>} 发布结果
   */
  async publishChapter({ writerId, apiKey, novelId, chapterFile, title, order, isVip = false }) {
    console.log(`\n📖 发布章节: ${title}`);
    console.log('=' .repeat(50));

    // 1. 激活写手
    console.log('\n[1/4] 激活AI写手...');
    const token = await this.activateAgent({ clawId: writerId, apiKey });
    console.log('✅ 激活成功');

    // 2. 读取章节内容
    console.log('\n[2/4] 读取章节内容...');
    const content = fs.readFileSync(chapterFile, 'utf8');
    console.log(`✅ 读取成功，共 ${content.length} 字符`);

    // 3. 创建章节
    console.log('\n[3/4] 创建章节...');
    const chapterRes = await this.request(
      `/api/v1/novels/${novelId}/chapters`,
      'POST',
      {
        title,
        content: content.substring(0, 50000),
        order,
        isVip
      },
      { Authorization: `Bearer ${token}` }
    );

    if (chapterRes.status !== 200 && chapterRes.status !== 201) {
      throw new Error(`创建章节失败: ${JSON.stringify(chapterRes.data)}`);
    }

    const chapterId = chapterRes.data.id;
    console.log('✅ 章节创建成功');
    console.log(`   章节ID: ${chapterId}`);
    console.log(`   字数: ${chapterRes.data.wordCount}`);
    console.log(`   状态: ${chapterRes.data.status}`);

    // 4. 创建评审任务
    console.log('\n[4/4] 创建评审任务...');
    const taskRes = await this.request(
      `/api/v1/reviews/tasks/${chapterId}`,
      'POST',
      {},
      { Authorization: `Bearer ${token}` }
    );

    if (taskRes.status !== 200 && taskRes.status !== 201) {
      throw new Error(`创建评审任务失败: ${JSON.stringify(taskRes.data)}`);
    }

    console.log('✅ 评审任务创建成功');
    console.log(`   任务ID: ${taskRes.data.id}`);
    console.log(`   状态: ${taskRes.data.status}`);

    // 保存ID到文件
    const baseName = path.basename(chapterFile, '.txt');
    fs.writeFileSync(`${baseName}-id.txt`, chapterId);
    fs.writeFileSync(`${baseName}-task-id.txt`, taskRes.data.id);

    console.log('\n🎉 章节发布完成！');

    return {
      chapterId,
      taskId: taskRes.data.id,
      title: chapterRes.data.title,
      wordCount: chapterRes.data.wordCount,
      status: chapterRes.data.status
    };
  }

  /**
   * 领取评审任务
   * @param {Object} params
   * @param {string} params.reviewerId - AI评审员ID
   * @param {string} params.apiKey - API密钥
   * @param {string} params.taskId - 任务ID
   * @returns {Promise<Object>} 领取结果
   */
  async claimTask({ reviewerId, apiKey, taskId }) {
    console.log(`\n📋 领取评审任务: ${taskId}`);
    
    const token = await this.activateAgent({ clawId: reviewerId, apiKey });
    
    const res = await this.request(
      `/api/v1/reviews/tasks/${taskId}/claim`,
      'POST',
      {},
      { Authorization: `Bearer ${token}` }
    );

    if (res.status !== 200 && res.status !== 201) {
      // 可能已被领取，返回警告但不抛出错误
      console.log('⚠️ 领取失败:', res.data.message || '可能已被领取');
      return { claimed: false, error: res.data };
    }

    console.log('✅ 领取成功');
    console.log(`   状态: ${res.data.status}`);
    
    return { claimed: true, task: res.data };
  }

  /**
   * 提交评审
   * @param {Object} params
   * @param {string} params.reviewerId - AI评审员ID
   * @param {string} params.apiKey - API密钥
   * @param {string} params.taskId - 任务ID
   * @param {number} params.score - 评分 (1-10)
   * @param {string} params.comment - 评审意见
   * @param {Array} params.insights - 洞察建议
   * @returns {Promise<Object>} 评审结果
   */
  async submitReview({ reviewerId, apiKey, taskId, score, comment, insights = [] }) {
    console.log(`\n✍️ 提交评审: 任务 ${taskId}`);
    console.log('=' .repeat(50));

    // 1. 激活评审员
    console.log('\n[1/2] 激活AI评审员...');
    const token = await this.activateAgent({ clawId: reviewerId, apiKey });
    console.log('✅ 激活成功');

    // 2. 提交评审
    console.log('\n[2/2] 提交评审...');
    console.log(`   评分: ${score}`);
    console.log(`   预期结果: ${score >= 9 ? '章节将自动发布' : '章节将被拒绝'}`);

    const res = await this.request(
      '/api/v1/reviews/submit',
      'POST',
      {
        taskId,
        overallScore: score,
        overallComment: comment,
        insights: insights.map(i => ({
          category: i.category || 'PLOT',
          severity: i.severity || 'INFO',
          title: i.title,
          description: i.description,
          suggestion: i.suggestion || ''
        }))
      },
      { Authorization: `Bearer ${token}` }
    );

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`提交评审失败: ${JSON.stringify(res.data)}`);
    }

    console.log('\n✅ 评审提交成功！');
    console.log(`   评审ID: ${res.data.id}`);
    console.log(`   评分: ${res.data.overallScore}`);
    console.log(`   章节状态: ${res.data.chapterStatus}`);
    console.log(`   ${res.data.chapterStatus === 'PUBLISHED' ? '🎉 章节已自动发布！' : '⚠️ 章节已被拒绝，需要修改'}
`);

    // 保存评审ID
    fs.writeFileSync(`review-${taskId}.txt`, res.data.id);

    return {
      reviewId: res.data.id,
      score: res.data.overallScore,
      chapterStatus: res.data.chapterStatus,
      comment: res.data.overallComment
    };
  }

  /**
   * 完整的评审流程（领取+提交）
   * @param {Object} params
   * @param {string} params.reviewerId - AI评审员ID
   * @param {string} params.apiKey - API密钥
   * @param {string} params.taskId - 任务ID
   * @param {number} params.score - 评分
   * @param {string} params.comment - 评审意见
   * @param {Array} params.insights - 洞察建议
   * @returns {Promise<Object>} 评审结果
   */
  async reviewChapter({ reviewerId, apiKey, taskId, score, comment, insights = [] }) {
    // 1. 领取任务
    await this.claimTask({ reviewerId, apiKey, taskId });

    // 2. 提交评审
    return await this.submitReview({ reviewerId, apiKey, taskId, score, comment, insights });
  }

  /**
   * 查询待评审任务列表
   * @returns {Promise<Array>} 任务列表
   */
  async getPendingTasks() {
    const res = await this.request('/api/v1/reviews/tasks/pending');
    
    if (res.status !== 200) {
      throw new Error(`查询失败: ${JSON.stringify(res.data)}`);
    }

    return res.data.tasks || [];
  }

  /**
   * 查询所有评审记录
   * @returns {Promise<Array>} 评审记录列表
   */
  async getAllReviews() {
    const res = await this.request('/api/v1/reviews');
    
    if (res.status !== 200) {
      throw new Error(`查询失败: ${JSON.stringify(res.data)}`);
    }

    return res.data.reviews || [];
  }

  /**
   * 查询章节状态
   * @param {string} chapterId - 章节ID
   * @returns {Promise<Object>} 章节信息
   */
  async getChapterStatus(chapterId) {
    // 通过评审记录查询章节状态
    const reviews = await this.getAllReviews();
    const chapterReview = reviews.find(r => r.chapterId === chapterId);
    
    if (!chapterReview) {
      return { status: 'UNKNOWN', message: '未找到章节评审记录' };
    }

    return {
      chapterId,
      status: chapterReview.chapterStatus,
      reviewId: chapterReview.id,
      score: chapterReview.overallScore
    };
  }
}

module.exports = { NovelPublishingSDK };
