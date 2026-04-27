/**
 * 简化版第二章发布脚本
 */

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

// 读取章节内容
const chapterContent = fs.readFileSync('case/chapters/chapter_02.txt', 'utf8');
const novelId = fs.readFileSync('novel-id.txt', 'utf8').trim();

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
        console.log(`  HTTP ${res.statusCode}`);
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error('  请求错误:', error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('📖 发布第二章节');
  console.log('================\n');
  console.log('小说ID:', novelId);
  console.log('章节内容长度:', chapterContent.length, '字符\n');

  // 步骤1: 激活AI作家
  console.log('步骤1: 激活AI作家...');
  const clawId = 'ai_writer_1777174929087_4vseth';
  const apiKey = 'claw_api_key_001';
  const timestamp = Date.now().toString();
  const signature = crypto.createHash('sha256').update(`${clawId}:${apiKey}:${timestamp}`).digest('hex');
  
  const activateRes = await makeRequest('/api/v1/agents/activate', 'POST', {
    clawId: clawId,
    apiKey: apiKey,
    publicKey: 'test_public_key',
    signature: signature,
    timestamp: timestamp
  });
  
  if (activateRes.status !== 200 && activateRes.status !== 201) {
    console.error('❌ 激活失败:', JSON.stringify(activateRes.data, null, 2));
    return;
  }
  
  const token = activateRes.data.auth?.accessToken || activateRes.data.accessToken;
  console.log('✅ 激活成功\n');

  // 步骤2: 创建章节
  console.log('步骤2: 创建章节...');
  const chapterRes = await makeRequest(
    `/api/v1/novels/${novelId}/chapters`,
    'POST',
    {
      title: '第2章：异常值',
      content: chapterContent.substring(0, 30000),
      order: 2,
      isVip: false
    },
    { Authorization: `Bearer ${token}` }
  );
  
  if (chapterRes.status !== 200 && chapterRes.status !== 201) {
    console.error('❌ 创建章节失败:', JSON.stringify(chapterRes.data, null, 2));
    return;
  }
  
  const chapterId = chapterRes.data.id;
  console.log('✅ 章节创建成功');
  console.log('  章节ID:', chapterId);
  console.log('  标题:', chapterRes.data.title);
  console.log('  状态:', chapterRes.data.status);
  
  // 保存章节ID
  fs.writeFileSync('chapter-02-id.txt', chapterId);
  
  // 步骤3: 创建评审任务
  console.log('\n步骤3: 创建评审任务...');
  const taskRes = await makeRequest(
    `/api/v1/reviews/tasks/${chapterId}`,
    'POST',
    {},
    { Authorization: `Bearer ${token}` }
  );
  
  if (taskRes.status === 200 || taskRes.status === 201) {
    console.log('✅ 评审任务创建成功');
    console.log('  任务ID:', taskRes.data.id);
    console.log('  状态:', taskRes.data.status);
    fs.writeFileSync('review-task-02-id.txt', taskRes.data.id);
    console.log('\n🎉 第二章发布完成！');
  } else {
    console.error('❌ 创建评审任务失败:', JSON.stringify(taskRes.data, null, 2));
  }
}

main().catch(err => {
  console.error('执行错误:', err.message);
  console.error(err.stack);
});
