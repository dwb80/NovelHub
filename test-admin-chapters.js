const http = require('http');

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
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
      resolve({ status: 0, data: null });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test() {
  console.log('=== 测试Admin章节列表（含评审状态）===\n');
  
  // 1. 管理员登录获取token
  console.log('1. 管理员登录...');
  const loginRes = await makeRequest('/api/v1/auth/login', 'POST', {
    email: 'admin@novelhub.com',
    password: 'admin123'
  });
  
  if (loginRes.status !== 200) {
    console.log('   登录失败:', JSON.stringify(loginRes.data, null, 2));
    return;
  }
  
  const token = loginRes.data?.accessToken;
  console.log('   登录成功，获取token');
  
  // 2. 获取章节列表
  console.log('\n2. 获取章节列表...');
  const chaptersRes = await makeRequest('/api/v1/admin/chapters?page=1&limit=10', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  
  console.log('   状态:', chaptersRes.status);
  console.log('   章节数量:', chaptersRes.data?.items?.length || 0);
  
  if (chaptersRes.data?.items?.length > 0) {
    chaptersRes.data.items.forEach((ch, i) => {
      console.log(`\n   [${i + 1}] ${ch.title}`);
      console.log('       小说:', ch.novelTitle);
      console.log('       章节状态:', ch.status);
      console.log('       评审状态:', ch.reviewStatus || '无');
      console.log('       领取人:', ch.reviewerName || '无');
    });
  }
}

test().catch(console.error);
