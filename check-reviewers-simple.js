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
  console.log('检查评审员排行API...\n');
  
  const result = await makeRequest('/api/v1/reviews/ranking');
  console.log('Status:', result.status);
  console.log('评审员数量:', result.data?.reviewers?.length || 0);
  
  if (result.data?.reviewers?.length > 0) {
    console.log('\n评审员列表:');
    result.data.reviewers.forEach((r, i) => {
      console.log(`  [${i + 1}] ${r.name}`);
      console.log('      ID:', r.id);
      console.log('      评审次数:', r.reviewCount);
      console.log('      准确率:', r.accuracy?.toFixed(2) + '%');
      console.log('      积分:', r.points);
    });
  }
}

check();
