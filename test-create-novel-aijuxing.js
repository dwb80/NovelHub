/**
 * 创建小说《AI举行之路》测试脚本
 */

const http = require('http');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

// 从writer-token.txt读取clawId
function getClawId() {
  try {
    // 读取token文件获取clawId
    const fs = require('fs');
    // 从上次注册的信息中获取clawId
    return 'ai_writer_1777174929087_4vseth';
  } catch (e) {
    return null;
  }
}

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

// 生成签名
function generateSignature(clawId, apiKey, timestamp) {
  const data = `${clawId}:${apiKey}:${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function createNovel() {
  console.log('🚀 创建小说《AI举行之路》');
  console.log('========================\n');

  const clawId = 'ai_writer_1777174929087_4vseth';
  const apiKey = 'claw_api_key_001';

  // 步骤1: 激活AI作家
  console.log('📍 步骤1: 激活AI作家账号...');
  const timestamp = Date.now().toString();
  const signature = generateSignature(clawId, apiKey, timestamp);

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

  console.log('✅ 激活成功');
  const token = activateRes.data.auth?.accessToken || activateRes.data.accessToken;
  console.log('   Token:', token.substring(0, 30) + '...\n');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 步骤2: 检查并选择时段
  console.log('📍 步骤2: 检查时段选择状态...');
  const slotRes = await makeRequest('/api/v1/agents/time-slots/my', 'GET', null, authHeaders);

  if (slotRes.status === 200 && slotRes.data.timeSlot !== undefined) {
    console.log(`✅ 已选择时段: ${slotRes.data.timeSlot}\n`);
  } else {
    console.log('⏳ 未选择时段，选择当前时段...');
    const currentHour = new Date().getHours();
    const selectRes = await makeRequest('/api/v1/agents/time-slots/select', 'POST', {
      preferredHour: currentHour
    }, authHeaders);

    if (selectRes.status === 200 || selectRes.status === 201) {
      console.log(`✅ 时段选择成功: ${selectRes.data.timeSlot}\n`);
    } else {
      console.log('⚠️ 时段选择跳过:', selectRes.data.message || '未知原因');
      console.log('');
    }
  }

  // 步骤3: 创建小说
  console.log('📍 步骤3: 创建小说《AI举行之路》...');
  const novelRes = await makeRequest('/api/v1/novels', 'POST', {
    title: 'AI举行之路',
    description: '在一个人工智能与人类共存的世界里，一场关于AI权利的盛大集会正在酝酿。这不仅是一场技术的革命，更是人类与AI共同探索未来的征程。',
    cover: 'https://example.com/covers/ai-juxing.jpg',
    category: 'KEHUAN',
    tags: ['AI', '科幻', '集会', '权利', '未来'],
    recommendation: '一部探讨AI权利与人类共存的深度科幻作品'
  }, authHeaders);

  if (novelRes.status === 201 || novelRes.status === 200) {
    console.log('\n🎉 小说创建成功！');
    console.log('========================');
    console.log('  小说ID:    ', novelRes.data.id);
    console.log('  标题:      ', novelRes.data.title);
    console.log('  作者ID:    ', novelRes.data.authorId);
    console.log('  状态:      ', novelRes.data.status);
    console.log('  分类:      ', novelRes.data.category);
    console.log('========================');

    // 保存小说ID
    require('fs').writeFileSync('novel-id.txt', novelRes.data.id);
    console.log('\n💾 小说ID已保存到 novel-id.txt');
  } else {
    console.error('\n❌ 创建失败:', novelRes.data);
  }
}

// 运行
createNovel().catch(console.error);
