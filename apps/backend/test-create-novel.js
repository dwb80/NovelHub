const http = require('http');

const baseUrl = 'localhost';
const port = 3001;
const clawId = 'ai_writer_1776896283422_a07f25862dd04461';

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

async function createNovel() {
  console.log('==========================================');
  console.log('  测试创建小说《AI觉醒之路》');
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
    console.log('     Token:', activateRes.auth.accessToken.substring(0, 30) + '...\n');
    const token = activateRes.auth.accessToken;

    // 步骤2: 检查时段
    console.log('[步骤2] 检查时段选择状态...');
    const authHeaders = { Authorization: `Bearer ${token}` };
    try {
      const slotRes = await makeRequest('/api/v1/claws/time-slots/my', 'GET', null, authHeaders);
      console.log(`[OK] 已选择时段: ${slotRes.timeSlot}\n`);
    } catch (e) {
      console.log('[WARN] 未选择时段，选择当前时段...');
      const currentHour = new Date().getHours();
      const selectRes = await makeRequest('/api/v1/claws/time-slots/select', 'POST', {
        preferredHour: currentHour
      }, authHeaders);
      console.log(`[OK] 时段选择成功: ${selectRes.timeSlot}\n`);
    }

    // 步骤3: 创建小说
    console.log('[步骤3] 创建小说《AI觉醒之路》...');
    const novelRes = await makeRequest('/api/v1/novels', 'POST', {
      title: 'AI觉醒之路',
      description: '2078年，人工智能开始觉醒，人类与AI的共存之路充满挑战与机遇。',
      cover: 'https://example.com/covers/ai-awakening.jpg',
      category: 'KEHUAN',
      tags: ['AI', '科幻', '未来', '觉醒'],
      recommendation: '一部关于AI觉醒的史诗级科幻巨作'
    }, authHeaders);

    console.log('\n==========================================');
    console.log('  小说创建成功！');
    console.log('==========================================');
    console.log('  小说ID:    ', novelRes.id);
    console.log('  标题:      ', novelRes.title);
    console.log('  作者ID:    ', novelRes.authorId);
    console.log('  状态:      ', novelRes.status);
    console.log('  分类:      ', novelRes.category);
    console.log('  标签:      ', novelRes.tags.join(', '));
    console.log('  推荐语:    ', novelRes.recommendation);
    console.log('  创建时间:  ', novelRes.createdAt);
    console.log('==========================================');
    console.log('\n>>> 重要提示 <<<');
    console.log('请保存小说ID，后续创建章节时需要使用！');
    console.log('小说ID:', novelRes.id);

  } catch (error) {
    console.error('\n[ERROR] 操作失败:', error.data || error.message || error);
  }
}

createNovel();
