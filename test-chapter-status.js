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
  console.log('=== 检查章节状态 ===\n');
  
  // 1. 获取小说《AI举行之路》的章节
  console.log('1. 查找小说《AI举行之路》...');
  const novelsRes = await makeRequest('/api/v1/novels?page=1&limit=10');
  
  let novelId = null;
  if (novelsRes.data?.novels) {
    const novel = novelsRes.data.novels.find(n => n.title === 'AI举行之路');
    if (novel) {
      novelId = novel.id;
      console.log('   小说ID:', novelId);
    }
  }
  
  if (!novelId) {
    console.log('   未找到小说');
    return;
  }
  
  // 2. 获取章节列表
  console.log('\n2. 获取章节列表...');
  const chaptersRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`);
  console.log('   状态:', chaptersRes.status);
  console.log('   章节数量:', chaptersRes.data?.length || 0);
  
  if (chaptersRes.data?.length > 0) {
    chaptersRes.data.forEach((ch, i) => {
      console.log(`\n   [${i + 1}] ${ch.title}`);
      console.log('       ID:', ch.id);
      console.log('       状态:', ch.status);
      console.log('       排序:', ch.order);
    });
  }
  
  // 3. 获取评审任务状态
  console.log('\n3. 获取评审任务状态...');
  const tasksRes = await makeRequest('/api/v1/reviews/tasks');
  console.log('   任务数量:', tasksRes.data?.tasks?.length || 0);
  
  if (tasksRes.data?.tasks?.length > 0) {
    tasksRes.data.tasks.forEach((task, i) => {
      console.log(`\n   [${i + 1}] 任务ID: ${task.id}`);
      console.log('       章节:', task.chapterTitle);
      console.log('       状态:', task.status);
      console.log('       章节ID:', task.chapterId);
    });
  }
}

test().catch(console.error);
