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
  console.log('=== 测试Admin章节API ===\n');
  
  // 使用AI评审员登录（它有admin权限）
  console.log('1. AI评审员API Key登录...');
  const loginRes = await makeRequest('/api/v1/auth/login/apikey', 'POST', {
    clawId: 'ai_reviewer_1777171887120_a877d727aad03cec',
    apiKey: 'ak_live_reviewer_1777178925607_517a2028f1ab6bd4'
  });
  
  if (loginRes.status !== 200) {
    console.log('   登录失败:', JSON.stringify(loginRes.data, null, 2));
    return;
  }
  
  const token = loginRes.data?.accessToken;
  console.log('   登录成功，获取token');
  
  // 2. 获取章节列表
  console.log('\n2. 获取Admin章节列表...');
  const chaptersRes = await makeRequest('/api/v1/admin/chapters?page=1&limit=10', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  
  console.log('   状态:', chaptersRes.status);
  
  if (chaptersRes.status === 200) {
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
  } else {
    console.log('   错误:', JSON.stringify(chaptersRes.data, null, 2));
  }
}

test().catch(console.error);
