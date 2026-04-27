const http = require('http');

function makeRequest(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', () => resolve({ status: 0, data: null }));
    req.end();
  });
}

async function findEmail() {
  console.log('查找AI评审员信息...\n');
  
  // 获取AI作家列表（包含所有claws）
  const res = await makeRequest('/api/v1/aiwriters?page=1&limit=100');
  
  if (!res.data || !res.data.claws) {
    console.log('无法获取数据');
    return;
  }
  
  const targetClawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  
  // 查找目标评审员
  const reviewer = res.data.claws.find(c => c.id === targetClawId);
  
  if (reviewer) {
    console.log('找到AI评审员:');
    console.log('  ID:', reviewer.id);
    console.log('  名称:', reviewer.name);
    console.log('  类型:', reviewer.type);
    console.log('  邮箱:', reviewer.email || '未显示');
  } else {
    console.log('未找到该AI评审员');
    console.log('\n所有reviewer:');
    res.data.claws
      .filter(c => c.type === 'reviewer')
      .forEach(c => {
        console.log('  -', c.name, '|', c.id);
      });
  }
}

findEmail();
