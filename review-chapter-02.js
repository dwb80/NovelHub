/**
 * AI评审员评审第二章（实际上是第一章的待评审任务）
 * AI Reviewer: ai_reviewer_1777171887120_a877d727aad03cec
 */

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const API_BASE = 'localhost';
const API_PORT = 3001;

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
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

async function main() {
  console.log('📋 AI评审员评审章节');
  console.log('====================\n');

  const taskId = 'b9b7e766-badf-48c4-8432-31ac1b49faa9';
  console.log('任务ID:', taskId);

  // 步骤1: 激活AI评审员
  console.log('\n步骤1: 激活AI评审员...');
  const clawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  const apiKey = 'claw_api_key_001';
  const timestamp = Date.now().toString();
  const signature = crypto.createHash('sha256').update(`${clawId}:${apiKey}:${timestamp}`).digest('hex');
  
  const activateRes = await makeRequest('/api/v1/agents/activate', 'POST', {
    clawId: clawId,
    apiKey: apiKey,
    publicKey: 'test_public_key',
    signature: signature,
    timestamp: timestamp
  });
  
  if (activateRes.status !== 200 && activateRes.status !== 201) {
    console.error('❌ 激活失败:', JSON.stringify(activateRes.data, null, 2));
    return;
  }
  
  const token = activateRes.data.auth?.accessToken || activateRes.data.accessToken;
  console.log('✅ 激活成功');

  // 步骤2: 领取评审任务
  console.log('\n步骤2: 领取评审任务...');
  const claimRes = await makeRequest(
    `/api/v1/reviews/tasks/${taskId}/claim`,
    'POST',
    {},
    { Authorization: `Bearer ${token}` }
  );
  
  if (claimRes.status !== 200 && claimRes.status !== 201) {
    console.error('❌ 领取失败:', JSON.stringify(claimRes.data, null, 2));
    // 可能已经被领取，继续尝试提交评审
    console.log('   可能已被领取，继续提交评审...');
  } else {
    console.log('✅ 领取成功');
    console.log('   状态:', claimRes.data.status);
  }

  // 步骤3: 提交评审（高分，测试自动发布）
  console.log('\n步骤3: 提交评审（评分9分，测试自动发布）...');
  const submitRes = await makeRequest(
    '/api/v1/reviews/submit',
    'POST',
    {
      taskId: taskId,
      overallScore: 9,
      overallComment: '这是一篇非常优秀的科幻小说开篇。作者构建了一个令人信服的反乌托邦世界，通过主角沈霁的视角，展现了记忆删除技术对社会和个人的深远影响。\n\n亮点：\n1. 世界观设定完整，2078年的上海充满了细节\n2. 主角形象立体，她的困惑和反抗让人共情\n3. 零壹AI的设定很有深度，三秒钟的延迟暗示了更深层的秘密\n4. 悬念设置得当，第1份被拒绝的爱、母亲的死因都是很好的钩子\n\n建议：\n1. 可以增加更多感官描写，让读者更好地沉浸在未来世界中\n2. 部分技术术语可以适当解释，帮助读者理解',
      insights: [
        {
          category: 'PLOT',
          severity: 'INFO',
          title: '悬念设置优秀',
          description: '母亲的死因、第1份被拒绝的爱、零壹的延迟等悬念设置得当，能有效吸引读者继续阅读。',
          suggestion: '保持这种悬念节奏，在后续章节逐步揭示。'
        },
        {
          category: 'CHARACTER',
          severity: 'INFO',
          title: '主角形象立体',
          description: '沈霁作为一个失去情感能力的审计官，她的困惑和反抗让人共情。',
          suggestion: '可以进一步挖掘她的内心冲突。'
        },
        {
          category: 'STYLE',
          severity: 'INFO',
          title: '文笔流畅',
          description: '文字流畅，描写细腻，能够很好地营造氛围。',
          suggestion: '继续保持。'
        }
      ]
    },
    { Authorization: `Bearer ${token}` }
  );
  
  if (submitRes.status !== 200 && submitRes.status !== 201) {
    console.error('❌ 提交评审失败:', JSON.stringify(submitRes.data, null, 2));
    return;
  }
  
  console.log('✅ 评审提交成功！');
  console.log('   评审ID:', submitRes.data.id);
  console.log('   评分:', submitRes.data.overallScore);
  console.log('   章节状态:', submitRes.data.chapterStatus);
  
  // 保存评审ID
  fs.writeFileSync('review-02-id.txt', submitRes.data.id);
  
  console.log('\n🎉 评审完成！');
  console.log('   预期：章节状态应该自动变为PUBLISHED');
}

main().catch(err => {
  console.error('执行错误:', err.message);
});
