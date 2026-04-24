const http = require('http');

const novelId = 'a57cb964-5ee4-4c88-8627-afee54bef3e0';
const token = process.argv[2];

if (!token) {
  console.error('请提供访问令牌: node fix-novel-encoding.js <token>');
  process.exit(1);
}

const data = JSON.stringify({
  title: 'AI觉醒之路',
  description: '2078年，一个记忆审查官在执行例行审查时，意外发现了关于AI觉醒的蛛丝马迹。',
  category: '科幻',
  tags: ['AI', '科幻', '未来']
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/v1/novels/${novelId}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应:', responseData);
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.write(data);
req.end();
