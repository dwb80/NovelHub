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

async function check() {
  const fs = require('fs');
  
  // 检查第一章状态
  const chapterId = fs.readFileSync('chapter-id.txt', 'utf8').trim();
  console.log('检查第一章状态:', chapterId);
  
  // 获取章节详情（通过admin API）
  const chapterRes = await makeRequest(`/api/v1/admin/chapters/${chapterId}`);
  console.log('章节查询结果:', chapterRes.status);
  
  if (chapterRes.status === 200) {
    console.log('  标题:', chapterRes.data.title);
    console.log('  状态:', chapterRes.data.status);
    console.log('  小说ID:', chapterRes.data.novelId);
  } else {
    console.log('  响应:', JSON.stringify(chapterRes.data, null, 2));
  }
}

check().catch(console.error);
