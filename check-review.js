const http = require('http');

function makeRequest(path, method, data, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
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
      resolve({ status: 0, data: null, error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('=== 查看评审记录 ===\n');
  
  const reviewerClawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  const reviewerApiKey = 'ak_live_reviewer_1777178925607_517a2028f1ab6bd4';
  
  // 1. Login
  const loginRes = await makeRequest('/api/v1/auth/login/apikey', 'POST', {
    clawId: reviewerClawId,
    apiKey: reviewerApiKey
  });
  
  if (loginRes.status !== 200) {
    console.log('登录失败');
    return;
  }
  
  const token = loginRes.data.accessToken;
  
  // 2. 获取刚才的评审详情
  const reviewId = '945b3702-948d-46d3-b651-dad46715f6ab';
  console.log('1. 查看评审详情 (API):');
  console.log('   GET /api/v1/reviews/' + reviewId);
  
  const reviewRes = await makeRequest('/api/v1/reviews/' + reviewId, 'GET', null, {
    'Authorization': 'Bearer ' + token
  });
  
  if (reviewRes.status === 200) {
    console.log('\n   评审详情:');
    console.log('   - 评审ID:', reviewRes.data.id);
    console.log('   - 评审员:', reviewRes.data.reviewerName);
    console.log('   - 章节:', reviewRes.data.chapterTitle);
    console.log('   - 总体评分:', reviewRes.data.overallScore);
    console.log('   - 状态:', reviewRes.data.status);
    console.log('   - 评审时间:', reviewRes.data.createdAt);
  }
  
  // 3. 获取章节的评审列表
  const chapterId = '96bfddfe-bb36-41d9-9e08-7352b08782ce';
  console.log('\n2. 查看章节的所有评审 (API):');
  console.log('   GET /api/v1/reviews/chapter/' + chapterId);
  
  const chapterReviewsRes = await makeRequest('/api/v1/reviews/chapter/' + chapterId, 'GET', null, {
    'Authorization': 'Bearer ' + token
  });
  
  if (chapterReviewsRes.status === 200) {
    const reviews = chapterReviewsRes.data || [];
    console.log('   该章节共有', reviews.length, '条评审记录');
  }
  
  // 4. 获取我的评审历史
  console.log('\n3. 查看我的评审历史 (API):');
  console.log('   GET /api/v1/reviews/my-tasks');
  
  const myTasksRes = await makeRequest('/api/v1/reviews/my-tasks', 'GET', null, {
    'Authorization': 'Bearer ' + token
  });
  
  if (myTasksRes.status === 200) {
    const tasks = myTasksRes.data || [];
    console.log('   我的任务数:', tasks.length);
    tasks.forEach((task, idx) => {
      console.log('   [' + (idx + 1) + '] ' + task.chapterTitle + ' - ' + task.status);
    });
  }
  
  console.log('\n=== 前端查看地址 ===');
  console.log('1. 管理后台 - 评审管理:');
  console.log('   http://localhost:3000/admin/reviews');
  console.log('\n2. 章节详情页 (查看评审):');
  console.log('   http://localhost:3000/admin/chapters/' + chapterId);
  console.log('\n3. 评审统计:');
  console.log('   http://localhost:3000/admin/reviews/stats');
}

main().catch(console.error);
