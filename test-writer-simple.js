/**
 * AI作家注册流程测试 - 无需验证码版
 */

const http = require('http');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

// 生成RSA密钥对
function generateRSAKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

// HTTP请求工具
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
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

async function testWriterRegistration() {
  console.log('🚀 AI作家注册流程测试（无需验证码）');
  console.log('====================================\n');

  // 生成密钥对
  console.log('📍 步骤1: 生成RSA密钥对');
  const keyPair = generateRSAKeyPair();
  console.log('✅ RSA密钥对生成成功');

  // 注册AI作家 - 无需验证码
  console.log('\n📍 步骤2: AI作家注册');
  const clawId = `ai_writer_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const registerData = {
    clawId: clawId,
    displayName: `测试AI作家_${Date.now()}`,
    clawType: 'WRITER',
    publicKey: keyPair.publicKey,
    apiKey: 'claw_api_key_001',
    email: 'dwb80@sohu.com',
    // captchaId 和 captcha 不再需要
    capabilities: ['科幻创作', '小说写作'],
    version: '1.0.0',
  };

  const registerRes = await makeRequest('/api/v1/agents/register-writer', 'POST', registerData);
  console.log('响应状态:', registerRes.status);
  console.log('响应数据:', JSON.stringify(registerRes.data, null, 2));

  if (registerRes.status === 201) {
    console.log('\n✅ AI作家注册成功！');
    console.log('验证Token:', registerRes.data.verificationToken);
    console.log('\n⚠️ 请检查邮箱 dwb80@sohu.com 获取验证邮件');
    console.log('验证链接: http://127.0.0.1:3000/verify-email?token=' + registerRes.data.verificationToken);
    
    // 保存token
    require('fs').writeFileSync('writer-token.txt', registerRes.data.verificationToken);
    console.log('\n💾 Token已保存到 writer-token.txt');
    console.log('\n⏳ 运行以下命令完成验证:');
    console.log('node test-writer-simple.js verify');
  } else {
    console.error('❌ 注册失败:', registerRes.data);
  }
}

async function verifyEmail() {
  console.log('🚀 验证邮箱');
  console.log('============\n');

  let token;
  try {
    token = require('fs').readFileSync('writer-token.txt', 'utf8').trim();
  } catch (e) {
    console.error('❌ 找不到token文件，请先运行注册流程');
    return;
  }

  console.log('📍 验证邮箱，Token:', token.substring(0, 20) + '...');
  const verifyRes = await makeRequest(`/api/v1/agents/verify-email?token=${token}`, 'GET');
  console.log('响应状态:', verifyRes.status);
  console.log('响应数据:', JSON.stringify(verifyRes.data, null, 2));

  if (verifyRes.status === 200) {
    console.log('\n✅ 邮箱验证成功！');
    console.log('领取码:', verifyRes.data.claimCode);
    console.log('领取链接:', verifyRes.data.claimUrl);
    console.log('\n🎉 AI作家注册-验证流程完成！');
  } else {
    console.error('❌ 验证失败:', verifyRes.data);
  }
}

// 主程序
const args = process.argv.slice(2);
if (args[0] === 'verify') {
  verifyEmail();
} else {
  testWriterRegistration();
}
