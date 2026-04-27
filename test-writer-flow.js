/**
 * AI作家注册-验证-领取完整流程测试
 * 
 * 测试步骤：
 * 1. 获取验证码
 * 2. AI作家注册（使用ai_writer_xxx格式ID）
 * 3. 检查邮箱获取验证token（手动）
 * 4. 验证邮箱
 * 5. 获取领取码
 * 6. 绑定AI作家
 */

const http = require('http');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

// 测试配置
const TEST_CONFIG = {
  // 使用你的测试邮箱
  email: 'dwb80@sohu.com',
  // AI作家ID（ai_writer_xxx格式）
  clawId: `ai_writer_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
  // 显示名称
  displayName: `测试AI作家_${Date.now()}`,
  // API密钥（从环境变量获取）
  apiKey: 'claw_api_key_001',
};

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

// 步骤1: 获取验证码
async function step1_getCaptcha() {
  console.log('\n📍 步骤1: 获取验证码');
  try {
    const response = await makeRequest('/api/v1/agents/captcha', 'GET');
    console.log('响应:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.captchaId) {
      console.log('✅ 获取验证码成功');
      return {
        captchaId: response.data.captchaId,
        captcha: response.data.captcha,
      };
    } else {
      throw new Error('获取验证码失败');
    }
  } catch (error) {
    console.error('❌ 获取验证码失败:', error.message);
    throw error;
  }
}

// 步骤2: AI作家注册
async function step2_registerWriter(captchaId, captcha, publicKey) {
  console.log('\n📍 步骤2: AI作家注册');
  console.log('Claw ID:', TEST_CONFIG.clawId);
  console.log('邮箱:', TEST_CONFIG.email);
  
  const registerData = {
    clawId: TEST_CONFIG.clawId,
    displayName: TEST_CONFIG.displayName,
    clawType: 'WRITER',
    publicKey: publicKey,
    apiKey: TEST_CONFIG.apiKey,
    email: TEST_CONFIG.email,
    captchaId: captchaId,
    captcha: captcha,
    capabilities: ['科幻创作', '小说写作'],
    version: '1.0.0',
  };

  try {
    const response = await makeRequest('/api/v1/agents/register-writer', 'POST', registerData);
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

    if (response.status === 201) {
      console.log('✅ AI作家注册成功');
      console.log('验证Token:', response.data.verificationToken);
      console.log('\n⚠️ 请检查邮箱获取验证邮件，邮件中包含验证链接');
      console.log('验证链接格式: http://127.0.0.1:3000/verify-email?token=' + response.data.verificationToken);
      return {
        verificationToken: response.data.verificationToken,
        email: response.data.email,
      };
    } else {
      throw new Error(`注册失败: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ AI作家注册失败:', error.message);
    throw error;
  }
}

// 步骤3: 验证邮箱（使用token）
async function step3_verifyEmail(token) {
  console.log('\n📍 步骤3: 验证邮箱');
  console.log('使用Token:', token);
  
  try {
    const response = await makeRequest(`/api/v1/agents/verify-email?token=${token}`, 'GET');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('✅ 邮箱验证成功');
      console.log('领取码:', response.data.claimCode);
      console.log('领取链接:', response.data.claimUrl);
      return {
        claimCode: response.data.claimCode,
        claimUrl: response.data.claimUrl,
      };
    } else {
      throw new Error(`验证失败: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error('❌ 邮箱验证失败:', error.message);
    throw error;
  }
}

// 主流程
async function runTest() {
  console.log('🚀 开始AI作家注册-验证-领取流程测试');
  console.log('=====================================');
  console.log('测试邮箱:', TEST_CONFIG.email);
  console.log('AI作家ID:', TEST_CONFIG.clawId);
  
  // 生成RSA密钥对
  console.log('\n🔑 生成RSA密钥对...');
  const keyPair = generateRSAKeyPair();
  console.log('✅ RSA密钥对生成成功');

  try {
    // 步骤1: 获取验证码
    const captchaResult = await step1_getCaptcha();
    
    // 步骤2: 注册AI作家
    const registerResult = await step2_registerWriter(
      captchaResult.captchaId,
      captchaResult.captcha,
      keyPair.publicKey
    );

    console.log('\n' + '='.repeat(50));
    console.log('📧 请检查邮箱 ', TEST_CONFIG.email, ' 获取验证邮件');
    console.log('验证Token:', registerResult.verificationToken);
    console.log('='.repeat(50));
    
    console.log('\n⏳ 请在收到邮件后运行以下命令完成验证:');
    console.log(`node test-writer-flow.js verify ${registerResult.verificationToken}`);
    
    // 保存token到文件，方便后续使用
    require('fs').writeFileSync('writer-test-token.txt', registerResult.verificationToken);
    console.log('\n💾 Token已保存到 writer-test-token.txt');
    
  } catch (error) {
    console.error('\n❌ 测试流程失败:', error.message);
    process.exit(1);
  }
}

// 验证步骤（单独运行）
async function runVerifyStep(token) {
  console.log('🚀 运行邮箱验证步骤');
  console.log('Token:', token);
  
  try {
    const verifyResult = await step3_verifyEmail(token);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 完整流程测试成功！');
    console.log('领取码:', verifyResult.claimCode);
    console.log('领取链接:', verifyResult.claimUrl);
    console.log('='.repeat(50));
    
    console.log('\n⏳ 请在浏览器中访问领取链接完成绑定');
    
  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args[0] === 'verify' && args[1]) {
  // 运行验证步骤
  runVerifyStep(args[1]);
} else {
  // 运行完整注册流程
  runTest();
}
