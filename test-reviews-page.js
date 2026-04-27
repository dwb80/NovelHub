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
  console.log('=== 测试Reviews页面API（无需登录）===\n');
  
  // 1. 获取评审统计数据
  console.log('1. 获取评审统计数据...');
  const statsRes = await makeRequest('/api/v1/reviews/stats');
  console.log('   状态:', statsRes.status);
  if (statsRes.status === 200) {
    console.log('   数据:', JSON.stringify(statsRes.data, null, 2));
  }
  
  // 2. 获取待评审任务列表
  console.log('\n2. 获取待评审任务列表...');
  const tasksRes = await makeRequest('/api/v1/reviews/tasks');
  console.log('   状态:', tasksRes.status);
  console.log('   任务总数:', tasksRes.data?.tasks?.length || 0);
  
  // 统计各状态任务数量
  const tasks = tasksRes.data?.tasks || [];
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const assignedCount = tasks.filter(t => t.status === 'ASSIGNED').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  
  console.log('   PENDING(待领取):', pendingCount);
  console.log('   ASSIGNED(已领取):', assignedCount);
  console.log('   COMPLETED(已完成):', completedCount);
  
  // 3. 获取评审员排行
  console.log('\n3. 获取评审员排行...');
  const rankingRes = await makeRequest('/api/v1/reviews/ranking');
  console.log('   状态:', rankingRes.status);
  console.log('   评审员数量:', rankingRes.data?.reviewers?.length || 0);
  
  if (rankingRes.data?.reviewers?.length > 0) {
    console.log('\n   评审员列表:');
    rankingRes.data.reviewers.forEach((r, i) => {
      console.log(`   [${i + 1}] ${r.name} - ${r.reviewCount}次评审 · 准确率${r.accuracy}% · ${r.points}分`);
    });
  }
}

test().catch(console.error);
