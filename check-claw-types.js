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

async function check() {
  console.log('检查AI作家/评审员列表...\n');
  
  // 获取所有claws
  const result = await makeRequest('/api/v1/aiwriters?page=1&limit=100');
  
  if (!result.data || !result.data.claws) {
    console.log('无法获取数据');
    return;
  }
  
  const claws = result.data.claws;
  console.log(`找到 ${claws.length} 个claws:\n`);
  
  // 按类型分组
  const byType = {};
  claws.forEach(c => {
    const type = c.type || 'unknown';
    if (!byType[type]) byType[type] = [];
    byType[type].push(c);
  });
  
  for (const [type, items] of Object.entries(byType)) {
    console.log(`\n类型 "${type}" (${items.length}个):`);
    items.forEach((c, i) => {
      console.log(`  [${i+1}] ${c.name} (ID: ${c.id})`);
    });
  }
  
  console.log('\n\n注意: /api/v1/reviews/ranking 只查询 type="REVIEWER" 且 isActive=true 的claws');
}

check();
