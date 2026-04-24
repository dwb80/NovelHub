const http = require('http');
const fs = require('fs');

const baseUrl = 'localhost';
const port = 3001;
const clawId = 'ai_writer_1776896283422_a07f25862dd04461';
const novelId = 'd1187527-d2f3-4699-b0b4-6ff7b91b7e7f';

function makeRequest(path, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: port,
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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, data: parsed });
          }
        } catch (e) {
          resolve(responseData);
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
  console.log('==========================================');
  console.log('  发布小说第一章节');
  console.log('==========================================\n');

  try {
    // 步骤1: 激活AI作家
    console.log('[步骤1] 激活AI作家账号...');
    const activateRes = await makeRequest('/api/v1/claws/activate', 'POST', {
      clawId: clawId,
      apiKey: 'claw_api_key_001',
      publicKey: 'test_public_key',
      signature: 'test_signature'
    });
    console.log('[OK] 激活成功');
    const token = activateRes.auth.accessToken;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 步骤2: 读取章节内容
    console.log('\n[步骤2] 读取章节文件...');
    const chapterContent = fs.readFileSync('d:\\trae\\novelhub\\case\\chapters\\chapter_01.txt', 'utf8');
    console.log(`[OK] 章节内容读取成功，共 ${chapterContent.length} 字符`);

    // 提取章节标题
    const titleMatch = chapterContent.match(/第\d+章[：:](.+)/);
    const chapterTitle = titleMatch ? titleMatch[1].trim() : '第1章';
    console.log(`     章节标题: ${chapterTitle}`);

    // 步骤3: 发布章节
    console.log('\n[步骤3] 发布第一章节...');

    // 首先检查时段
    try {
      const slotRes = await makeRequest('/api/v1/claws/time-slots/my', 'GET', null, authHeaders);
      console.log(`[OK] 当前时段: ${slotRes.timeSlot}`);
    } catch (e) {
      console.log('[WARN] 未选择时段，选择当前时段...');
      const currentHour = new Date().getHours();
      await makeRequest('/api/v1/claws/time-slots/select', 'POST', {
        preferredHour: currentHour
      }, authHeaders);
      console.log('[OK] 时段选择成功');
    }

    // 发布章节 - 正确的API路径
    const chapterRes = await makeRequest(`/api/v1/chapters/novel/${novelId}`, 'POST', {
      title: chapterTitle,
      content: chapterContent,
      orderIndex: 1,
      isVip: false
    }, authHeaders);

    console.log('\n==========================================');
    console.log('  章节发布成功！');
    console.log('==========================================');
    console.log(`  章节ID:    ${chapterRes.id}`);
    console.log(`  标题:      ${chapterRes.title}`);
    console.log(`  小说ID:    ${chapterRes.novelId}`);
    console.log(`  字数:      ${chapterRes.wordCount}`);
    console.log(`  状态:      ${chapterRes.status}`);
    console.log(`  创建时间:  ${chapterRes.createdAt}`);
    console.log('==========================================');

  } catch (error) {
    console.error('\n[ERROR] 操作失败:', error.data || error.message || error);
    if (error.data) {
      console.error('错误详情:', JSON.stringify(error.data, null, 2));
    }
  }
}

publishChapter();
