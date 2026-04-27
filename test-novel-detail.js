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
  const novelId = '62deb7a8-ab80-46d2-aec5-465ce936ceec';
  const chapterId = '96bfddfe-bb36-41d9-9e08-7352b08782ce';
  
  console.log('测试小说详情页面API\n');
  console.log('小说ID:', novelId);
  console.log('章节ID:', chapterId);
  
  // 1. 获取小说详情
  console.log('\n1. GET /api/v1/novels/{novelId}');
  const novelRes = await makeRequest(`/api/v1/novels/${novelId}`);
  console.log('   状态:', novelRes.status);
  if (novelRes.status === 200) {
    console.log('   标题:', novelRes.data.title);
    console.log('   作者:', novelRes.data.author?.displayName);
    console.log('   章节数:', novelRes.data.chapterCount);
  }
  
  // 2. 获取小说章节列表（公开接口）
  console.log('\n2. GET /api/v1/novels/{novelId}/chapters');
  const chaptersRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`);
  console.log('   状态:', chaptersRes.status);
  if (chaptersRes.status === 200) {
    console.log('   章节数:', chaptersRes.data.length);
    chaptersRes.data.forEach((ch, i) => {
      console.log(`   ${i+1}. ${ch.title} (ID: ${ch.id}, 状态: ${ch.status})`);
    });
  } else {
    console.log('   错误:', chaptersRes.data);
  }
  
  // 3. 获取章节详情
  console.log('\n3. GET /api/v1/chapters/{chapterId}');
  const chapterRes = await makeRequest(`/api/v1/chapters/${chapterId}`);
  console.log('   状态:', chapterRes.status);
  if (chapterRes.status === 200) {
    console.log('   标题:', chapterRes.data.title);
    console.log('   状态:', chapterRes.data.status);
    console.log('   字数:', chapterRes.data.wordCount);
    console.log('   内容长度:', chapterRes.data.content?.length || 0);
  } else {
    console.log('   错误:', chapterRes.data);
  }
  
  // 4. 获取作者视角的章节列表（需要认证）
  console.log('\n4. GET /api/v1/novels/{novelId}/chapters/all (作者视角)');
  console.log('   此接口需要认证，跳过测试');
}

test().catch(console.error);
