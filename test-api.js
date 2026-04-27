const http = require('http');

function get(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    });
  });
}

async function test() {
  console.log('Testing API...\n');
  
  const ranking = await get('http://localhost:3001/api/v1/reviews/ranking');
  console.log('Ranking API:', ranking.status);
  console.log('Data:', ranking.data.substring(0, 500));
  
  console.log('\n---\n');
  
  const stats = await get('http://localhost:3001/api/v1/reviews/stats');
  console.log('Stats API:', stats.status);
  console.log('Data:', stats.data.substring(0, 500));
  
  console.log('\n---\n');
  
  const tasks = await get('http://localhost:3001/api/v1/reviews/tasks');
  console.log('Tasks API:', tasks.status);
  console.log('Data:', tasks.data.substring(0, 500));
}

test();
