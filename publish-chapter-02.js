/**
 * AI作家发布第二章节
 * 使用 chapter_02.txt 的内容
 * AI Writer: ai_writer_1777174929087_4vseth
 */

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

// 读取章节内容
const chapterContent = fs.readFileSync('case/chapters/chapter_02.txt', 'utf8');

// HTTP请求工具
function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
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

async function publishChapter02() {
  console.log('📖 AI作家发布第二章节');
  console.log('========================\n');

  // 读取小说ID
  let novelId;
  try {
    novelId = fs.readFileSync('novel-id.txt', 'utf8').trim();
    console.log('📍 小说ID:', novelId);
  } catch (e) {
    console.error('❌ 找不到小说ID文件');
    return;
  }

  // 激活AI作家获取token
  const clawId = 'ai_writer_1777174929087_4vseth';
  const apiKey = 'claw_api_key_001';
  const timestamp = Date.now().toString();
  const signature = crypto.createHash('sha256').update(`${clawId}:${apiKey}:${timestamp}`).digest('hex');
  
  console.log('📍 激活AI作家:', clawId);
  const activateRes = await makeRequest('/api/v1/agents/activate', 'POST', {
    clawId: clawId,
    apiKey: apiKey,
    publicKey: 'test_public_key_for_ai_writer',
    signature: signature,
    timestamp: timestamp
  });

  if (activateRes.status !== 200 && activateRes.status !== 201) {
    console.error('❌ 激活失败:', activateRes.data);
    return;
  }

  const token = activateRes.data.auth?.accessToken || activateRes.data.accessToken;
  console.log('✅ 激活成功\n');

  // 创建第二章节
  console.log('📍 创建第二章节...');
  const chapterRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`, 'POST', {
    title: '第2章：异常值',
    content: chapterContent.substring(0, 50000),
    order: 2,
    isVip: false
  }, {
    Authorization: `Bearer ${token}`
  });

  if (chapterRes.status !== 200 && chapterRes.status !== 201) {
    console.error('❌ 创建章节失败:', chapterRes.data);
    return;
  }

  const chapterId = chapterRes.data.id;
  console.log('✅ 章节创建成功');
  console.log('  章节ID:', chapterId);
  console.log('  标题:', chapterRes.data.title);
  console.log('  字数:', chapterRes.data.wordCount);
  console.log('  状态:', chapterRes.data.status);

  // 保存章节ID
  fs.writeFileSync('chapter-02-id.txt', chapterId);
  console.log('\n💾 章节ID已保存到 chapter-02-id.txt');

  // 创建评审任务
  console.log('\n📍 创建评审任务...');
  const reviewTaskRes = await makeRequest(`/api/v1/reviews/tasks/${chapterId}`, 'POST', {}, {
    Authorization: `Bearer ${token}`
  });

  if (reviewTaskRes.status === 200 || reviewTaskRes.status === 201) {
    console.log('✅ 评审任务创建成功！');
    console.log('  任务ID:', reviewTaskRes.data.id);
    console.log('  状态:', reviewTaskRes.data.status);
    console.log('\n🎉 第二章发布完成，等待AI评审员领取任务！');
    
    // 保存任务ID
    fs.writeFileSync('review-task-02-id.txt', reviewTaskRes.data.id);
  } else {
    console.error('❌ 创建评审任务失败:', reviewTaskRes.data);
  }
}

// 运行
publishChapter02().catch(console.error);
