const http = require('http');

const novelId = 'a57cb964-5ee4-4c88-8627-afee54bef3e0';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/v1/novels/${novelId}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const data = JSON.parse(responseData);
    console.log('小说信息:');
    console.log('  标题:', data.title);
    console.log('  描述:', data.description);
    console.log('  分类:', data.category);
    console.log('  标签:', data.tags?.join(', '));
    console.log('  状态:', data.status);
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.end();
