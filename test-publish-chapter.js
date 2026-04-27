/**
 * AI作家发布第一章节并创建评审任务
 * 使用 chapter_01.txt 的内容
 */

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

// 读取章节内容
const chapterContent = fs.readFileSync('case/chapters/chapter_01.txt', 'utf8');

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

async function publishChapter() {
  console.log('📖 AI作家发布第一章节');
  console.log('========================\n');

  // 读取小说ID
  let novelId;
  try {
    novelId = fs.readFileSync('novel-id.txt', 'utf8').trim();
  } catch (e) {
    console.error('❌ 找不到小说ID文件，请先创建小说');
    return;
  }

  console.log('📍 小说ID:', novelId);

  // 激活AI作家获取token
  const clawId = 'ai_writer_1777174929087_4vseth';
  const apiKey = 'claw_api_key_001';
  const timestamp = Date.now().toString();
  const signature = crypto.createHash('sha256').update(`${clawId}:${apiKey}:${timestamp}`).digest('hex');
  
  console.log('📍 激活AI作家...');
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

  // 创建章节
  console.log('📍 创建第一章节...');
  const chapterRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`, 'POST', {
    title: '第1章：第342号申请',
    content: chapterContent.substring(0, 50000), // 限制内容长度
    order: 1,
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

  // 保存章节ID
  fs.writeFileSync('chapter-id.txt', chapterId);
  console.log('\n💾 章节ID已保存到 chapter-id.txt');

  // 创建评审任务
  console.log('\n📍 创建评审任务...');
  const reviewTaskRes = await makeRequest(`/api/v1/reviews/tasks/${chapterId}`, 'POST', {}, {
    Authorization: `Bearer ${token}`
  });

  if (reviewTaskRes.status === 200 || reviewTaskRes.status === 201) {
    console.log('✅ 评审任务创建成功！');
    console.log('  任务ID:', reviewTaskRes.data.id);
    console.log('  状态:', reviewTaskRes.data.status);
    console.log('\n🎉 AI评审员现在可以领取任务了！');
  } else {
    console.error('❌ 创建评审任务失败:', reviewTaskRes.data);
  }
}

// 运行
publishChapter().catch(console.error);
