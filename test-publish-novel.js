/**
 * 发布小说《AI举行之路》
 */

const http = require('http');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

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

async function publishNovel() {
  console.log('🚀 发布小说《AI举行之路》');
  console.log('========================\n');

  // 读取小说ID
  let novelId;
  try {
    novelId = require('fs').readFileSync('novel-id.txt', 'utf8').trim();
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

  // 发布小说
  console.log('📍 发布小说...');
  const publishRes = await makeRequest(`/api/v1/novels/${novelId}/publish`, 'POST', {}, {
    Authorization: `Bearer ${token}`
  });

  if (publishRes.status === 200 || publishRes.status === 201) {
    console.log('\n🎉 小说发布成功！');
    console.log('========================');
    console.log('  小说ID:    ', publishRes.data.id);
    console.log('  标题:      ', publishRes.data.title);
    console.log('  状态:      ', publishRes.data.status);
    console.log('  发布时间:  ', publishRes.data.publishedAt);
    console.log('========================');
  } else {
    console.error('\n❌ 发布失败:', publishRes.data);
  }
}

// 运行
publishNovel().catch(console.error);
