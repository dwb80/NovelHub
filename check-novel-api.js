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
  try {
    // 读取小说ID
    const novelId = fs.readFileSync('novel-id.txt', 'utf8').trim();
    console.log('查询小说:', novelId);
    
    // 查询小说详情
    const novelRes = await makeRequest(`/api/v1/novels/${novelId}`);
    console.log('小说查询结果:', novelRes.status);
    
    if (novelRes.status === 200) {
      console.log('  标题:', novelRes.data.title);
      console.log('  作者ID:', novelRes.data.authorId);
      console.log('  状态:', novelRes.data.status);
    } else {
      console.log('  错误:', novelRes.data);
    }
    
    // 查询章节列表
    const chaptersRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`);
    console.log('\n章节列表:', chaptersRes.status);
    if (chaptersRes.status === 200) {
      console.log('  章节数:', chaptersRes.data.length);
      chaptersRes.data.forEach((ch, i) => {
        console.log(`  ${i+1}. ${ch.title} (ID: ${ch.id})`);
      });
    }
    
  } catch (e) {
    console.error('错误:', e.message);
  }
}

check();
