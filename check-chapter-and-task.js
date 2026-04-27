const http = require('http');
const fs = require('fs');

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

async function check() {
  console.log('检查章节和任务状态\n');
  
  // 读取ID
  const novelId = fs.readFileSync('novel-id.txt', 'utf8').trim();
  const chapterId = fs.readFileSync('chapter-id.txt', 'utf8').trim();
  
  console.log('小说ID:', novelId);
  console.log('章节ID:', chapterId);
  
  // 1. 查询小说章节列表
  console.log('\n1. 查询小说章节列表');
  const chaptersRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`);
  console.log('   状态:', chaptersRes.status);
  if (chaptersRes.status === 200) {
    console.log('   章节数:', chaptersRes.data.length);
    chaptersRes.data.forEach((ch, i) => {
      console.log(`   ${i+1}. ${ch.title} - 状态:${ch.status}`);
    });
  }
  
  // 2. 查询待评审任务
  console.log('\n2. 查询待评审任务');
  const pendingRes = await makeRequest('/api/v1/reviews/tasks/pending');
  console.log('   状态:', pendingRes.status);
  if (pendingRes.status === 200) {
    console.log('   任务数:', pendingRes.data.tasks?.length || 0);
    if (pendingRes.data.tasks?.length > 0) {
      pendingRes.data.tasks.forEach((task, i) => {
        console.log(`   ${i+1}. 任务ID:${task.id}`);
        console.log(`      章节:${task.chapterTitle}`);
        console.log(`      状态:${task.status}`);
      });
    }
  }
  
  // 3. 查询评审记录
  console.log('\n3. 查询评审记录');
  const reviewsRes = await makeRequest('/api/v1/reviews');
  console.log('   状态:', reviewsRes.status);
  if (reviewsRes.status === 200) {
    console.log('   记录数:', reviewsRes.data.reviews?.length || 0);
    if (reviewsRes.data.reviews?.length > 0) {
      reviewsRes.data.reviews.forEach((rev, i) => {
        console.log(`   ${i+1}. 评审ID:${rev.id}`);
        console.log(`      评分:${rev.overallScore}`);
        console.log(`      章节状态:${rev.chapterStatus}`);
      });
    }
  }
}

check().catch(console.error);
