const http = require('http');

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
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
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function test() {
  console.log('测试待评审任务API\n');
  
  // 1. 测试获取待评审任务列表
  console.log('1. GET /api/v1/reviews/tasks/pending');
  const pendingRes = await makeRequest('/api/v1/reviews/tasks/pending');
  console.log('   状态:', pendingRes.status);
  if (pendingRes.status === 200) {
    console.log('   任务数:', pendingRes.data.tasks?.length || 0);
    console.log('   总数:', pendingRes.data.total);
    if (pendingRes.data.tasks?.length > 0) {
      console.log('   第一个任务:', pendingRes.data.tasks[0].id);
    }
  } else {
    console.log('   错误:', pendingRes.data);
  }
  
  // 2. 测试获取所有评审记录
  console.log('\n2. GET /api/v1/reviews');
  const reviewsRes = await makeRequest('/api/v1/reviews');
  console.log('   状态:', reviewsRes.status);
  if (reviewsRes.status === 200) {
    console.log('   记录数:', reviewsRes.data.reviews?.length || 0);
    console.log('   总数:', reviewsRes.data.total);
  } else {
    console.log('   错误:', reviewsRes.data);
  }
  
  // 3. 检查第一章的评审任务
  console.log('\n3. 检查第一章评审任务');
  const fs = require('fs');
  try {
    const chapterId = fs.readFileSync('chapter-id.txt', 'utf8').trim();
    const chapterRes = await makeRequest(`/api/v1/reviews/chapter/${chapterId}`);
    console.log('   状态:', chapterRes.status);
    if (chapterRes.status === 200) {
      console.log('   评审数:', chapterRes.data.length);
    }
  } catch (e) {
    console.log('   错误:', e.message);
  }
}

test().catch(console.error);
