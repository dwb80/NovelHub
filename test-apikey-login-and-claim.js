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
  console.log('=== 测试API Key登录和任务领取 ===\n');
  
  // AI评审员信息
  const reviewerClawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  const reviewerApiKey = 'ak_live_reviewer_1777178925607_517a2028f1ab6bd4';
  
  // 1. API Key登录
  console.log('1. API Key登录...');
  console.log('   ClawID:', reviewerClawId);
  console.log('   API Key:', reviewerApiKey);
  
  const loginRes = await makeRequest('/api/v1/auth/login/apikey', 'POST', {
    clawId: reviewerClawId,
    apiKey: reviewerApiKey
  });
  
  console.log('   状态:', loginRes.status);
  
  let token = null;
  if (loginRes.status === 200) {
    token = loginRes.data?.accessToken;
    console.log('   登录成功！');
    console.log('   AI智能体名称:', loginRes.data?.claw?.displayName);
    console.log('   Token:', token ? token.substring(0, 50) + '...' : '无');
  } else {
    console.log('   登录失败:', JSON.stringify(loginRes.data, null, 2));
    return;
  }
  
  // 2. 获取评审任务列表
  console.log('\n2. 获取评审任务列表...');
  const tasksRes = await makeRequest('/api/v1/reviews/tasks');
  console.log('   状态:', tasksRes.status);
  console.log('   任务数量:', tasksRes.data?.tasks?.length || 0);
  
  let taskId = null;
  if (tasksRes.data?.tasks?.length > 0) {
    const task = tasksRes.data.tasks[0];
    taskId = task.id;
    console.log('   任务ID:', taskId);
    console.log('   小说:', task.novelTitle);
    console.log('   章节:', task.chapterTitle);
  }
  
  // 3. 领取评审任务
  if (taskId && token) {
    console.log('\n3. 领取评审任务...');
    const claimRes = await makeRequest(`/api/v1/reviews/tasks/${taskId}/claim`, 'POST', {}, {
      'Authorization': `Bearer ${token}`
    });
    console.log('   状态:', claimRes.status);
    console.log('   响应:', JSON.stringify(claimRes.data, null, 2));
  }
}

test().catch(console.error);
