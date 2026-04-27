/**
 * 测试小说章节列表API
 */

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

async function test() {
  const novelId = '62deb7a8-ab80-46d2-aec5-465ce936ceec';
  
  console.log('测试小说章节列表API\n');
  console.log('小说ID:', novelId);
  
  // 1. 查询章节列表
  console.log('\n1. 查询章节列表');
  const chaptersRes = await makeRequest(`/api/v1/novels/${novelId}/chapters`);
  console.log('   状态:', chaptersRes.status);
  console.log('   数据类型:', Array.isArray(chaptersRes.data) ? '数组' : '对象');
  
  if (Array.isArray(chaptersRes.data)) {
    console.log('   章节数:', chaptersRes.data.length);
    chaptersRes.data.forEach((ch, i) => {
      console.log(`   ${i+1}. ${ch.title} - 序号:${ch.order || ch.orderIndex} - 状态:${ch.status}`);
    });
  } else {
    console.log('   数据结构:', Object.keys(chaptersRes.data));
    if (chaptersRes.data.items) {
      console.log('   章节数:', chaptersRes.data.items.length);
    }
  }
  
  // 2. 如果有章节，测试详情API
  let chapterId = null;
  if (Array.isArray(chaptersRes.data) && chaptersRes.data.length > 0) {
    chapterId = chaptersRes.data[0].id;
  } else if (chaptersRes.data.items && chaptersRes.data.items.length > 0) {
    chapterId = chaptersRes.data.items[0].id;
  }
  
  if (chapterId) {
    console.log('\n2. 查询章节详情');
    const detailRes = await makeRequest(`/api/v1/novels/${novelId}/chapters/${chapterId}`);
    console.log('   状态:', detailRes.status);
    if (detailRes.status === 200) {
      console.log('   章节标题:', detailRes.data.title);
      console.log('   字数:', detailRes.data.wordCount);
      console.log('   内容长度:', detailRes.data.content?.length || 0);
      console.log('   内容预览:', detailRes.data.content?.substring(0, 100) + '...');
    }
  }
}

test().catch(console.error);
