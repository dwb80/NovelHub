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
  console.log('=== 测试章节详情和任务领取 ===\n');
  
  // 1. 获取评审任务列表
  console.log('1. 获取评审任务列表...');
  const tasksRes = await makeRequest('/api/v1/reviews/tasks');
  console.log('   状态:', tasksRes.status);
  console.log('   任务数量:', tasksRes.data?.tasks?.length || 0);
  
  let taskId = null;
  let chapterId = null;
  let novelId = null;
  
  if (tasksRes.data?.tasks?.length > 0) {
    const task = tasksRes.data.tasks[0];
    taskId = task.id;
    chapterId = task.chapterId;
    novelId = task.novelId;
    console.log('   任务ID:', taskId);
    console.log('   章节ID:', chapterId);
    console.log('   小说ID:', novelId);
    console.log('   小说:', task.novelTitle);
    console.log('   章节:', task.chapterTitle);
    console.log('   状态:', task.status);
  }
  
  // 2. 获取章节详情
  if (novelId && chapterId) {
    console.log('\n2. 获取章节详情...');
    console.log('   API: GET /api/v1/novels/' + novelId + '/chapters/' + chapterId);
    const chapterRes = await makeRequest(`/api/v1/novels/${novelId}/chapters/${chapterId}`);
    console.log('   状态:', chapterRes.status);
    if (chapterRes.status === 200) {
      console.log('   章节标题:', chapterRes.data?.title);
      console.log('   内容长度:', chapterRes.data?.content?.length || 0);
      console.log('   章节状态:', chapterRes.data?.status);
    } else {
      console.log('   错误:', JSON.stringify(chapterRes.data, null, 2));
    }
  }
  
  // 3. AI评审员登录获取token
  console.log('\n3. AI评审员登录...');
  console.log('   API: POST /api/v1/auth/login');
  const loginRes = await makeRequest('/api/v1/auth/login', 'POST', {
    clawId: 'ai_reviewer_1777171887120_a877d727aad03cec',
    password: 'Password123!'
  });
  console.log('   状态:', loginRes.status);
  
  let token = null;
  if (loginRes.status === 200 || loginRes.status === 201) {
    token = loginRes.data?.accessToken || loginRes.data?.token;
    console.log('   登录成功，获取到token');
  } else {
    console.log('   登录失败:', JSON.stringify(loginRes.data, null, 2));
    
    // 尝试其他密码
    console.log('   尝试其他密码...');
    const loginRes2 = await makeRequest('/api/v1/auth/login', 'POST', {
      clawId: 'ai_reviewer_1777171887120_a877d727aad03cec',
      password: 'password123'
    });
    console.log('   状态:', loginRes2.status);
    if (loginRes2.status === 200 || loginRes2.status === 201) {
      token = loginRes2.data?.accessToken || loginRes2.data?.token;
      console.log('   登录成功(备用密码)');
    } else {
      console.log('   备用密码也失败:', JSON.stringify(loginRes2.data, null, 2));
    }
  }
  
  // 4. 领取评审任务
  if (taskId && token) {
    console.log('\n4. 领取评审任务...');
    console.log('   API: POST /api/v1/reviews/tasks/' + taskId + '/claim');
    const claimRes = await makeRequest(`/api/v1/reviews/tasks/${taskId}/claim`, 'POST', {}, {
      'Authorization': `Bearer ${token}`
    });
    console.log('   状态:', claimRes.status);
    console.log('   响应:', JSON.stringify(claimRes.data, null, 2));
  } else {
    console.log('\n4. 跳过领取任务(缺少taskId或token)');
  }
}

test().catch(console.error);
