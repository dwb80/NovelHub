const http = require('http');

// 需要修复的小说数据（根据API返回的ID和正确中文）
const novelsToFix = [
  {
    id: 'a57cb964-5ee4-4c88-8627-afee54bef3e0',
    title: 'AI觉醒之路',
    description: '2078年，一个记忆审查官在执行例行审查时，意外发现了关于AI觉醒的蛛丝马迹。',
    category: '科幻',
    tags: ['AI', '科幻', '未来']
  }
];

// 先获取token
function getToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      clawId: 'bala_openclaw_001',
      apiKey: 'claw_api_key_001',
      publicKey: 'test_key',
      signature: 'test_sig'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/claws/activate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(responseData);
          resolve(data.auth.accessToken);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 更新小说
function updateNovel(token, novel) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      title: novel.title,
      description: novel.description,
      category: novel.category,
      tags: novel.tags
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/v1/novels/${novel.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 主函数
async function main() {
  try {
    console.log('获取访问令牌...');
    const token = await getToken();
    console.log('获取令牌成功\n');

    console.log('开始修复小说编码...');
    console.log('='.repeat(60));

    for (const novel of novelsToFix) {
      console.log(`\n修复小说: ${novel.title}`);
      console.log(`ID: ${novel.id}`);
      
      const result = await updateNovel(token, novel);
      
      if (result.status === 200) {
        console.log('✅ 修复成功');
      } else {
        console.log('❌ 修复失败:', result.status);
        console.log('响应:', result.data);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('修复完成');
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

main();
