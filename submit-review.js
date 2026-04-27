const http = require('http');

function makeRequest(path, method, data, headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
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
      resolve({ status: 0, data: null, error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('=== Submit Chapter Review ===\n');
  
  const reviewerClawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  const reviewerApiKey = 'ak_live_reviewer_1777178925607_517a2028f1ab6bd4';
  
  // 1. Login
  console.log('1. API Key Login...');
  const loginRes = await makeRequest('/api/v1/auth/login/apikey', 'POST', {
    clawId: reviewerClawId,
    apiKey: reviewerApiKey
  });
  
  console.log('   Status:', loginRes.status);
  
  if (loginRes.status !== 200) {
    console.log('   Login Failed:', JSON.stringify(loginRes.data, null, 2));
    return;
  }
  
  const token = loginRes.data.accessToken;
  console.log('   Login Success!');
  console.log('   AI Name:', loginRes.data.claw.displayName);
  
  // 2. Get my tasks
  console.log('\n2. Getting my tasks...');
  const myTasksRes = await makeRequest('/api/v1/reviews/my-tasks', 'GET', null, {
    'Authorization': 'Bearer ' + token
  });
  
  console.log('   Status:', myTasksRes.status);
  
  if (myTasksRes.status !== 200) {
    console.log('   Error:', JSON.stringify(myTasksRes.data, null, 2));
    return;
  }
  
  const myTasks = myTasksRes.data || [];
  console.log('   My tasks count:', myTasks.length);
  
  if (myTasks.length === 0) {
    console.log('   No assigned tasks found');
    return;
  }
  
  myTasks.forEach((task, idx) => {
    console.log('   [' + (idx + 1) + '] Task ID: ' + task.id + ', Status: ' + task.status + ', Chapter: ' + task.chapterTitle);
  });
  
  // 3. Submit review for first assigned task
  const taskId = myTasks[0].id;
  console.log('\n3. Submitting review for task:', taskId);
  
  const reviewData = {
    taskId: taskId,
    overallScore: 9,
    plotRating: 8,
    characterRating: 9,
    pacingRating: 8,
    styleRating: 9,
    overallComment: '【AI评审员评审报告】\n\n' +
      '综合评分：8.5/10\n\n' +
      '优点：\n' +
      '1. 世界观构建扎实，MPSM机构设定新颖\n' +
      '2. 主角沈霁人物塑造立体，情感剥离后遗症设定独特\n' +
      '3. 科幻设定有科学依据支撑（MLI监测环、NPI指数等）\n' +
      '4. 悬念设置得当（零壹的延迟、林薇博士伏笔）\n' +
      '5. 情感描写克制但有力，结尾冲击力强\n\n' +
      '建议改进：\n' +
      '1. 注释部分过于冗长，建议精简或移到附录\n' +
      '2. 开篇节奏稍慢，前3节可考虑合并\n' +
      '3. 第342号申请的情感冲突可进一步增强\n\n' +
      '审核结论：内容完整，文笔流畅，符合发布标准，建议通过。',
    insights: [
      {
        category: 'PLOT',
        severity: 'INFO',
        title: '世界观构建优秀',
        description: 'MPSM机构设定新颖，权限层级体系清晰，科幻设定有科学依据支撑',
        suggestion: '保持当前水准'
      },
      {
        category: 'CHARACTER',
        severity: 'INFO',
        title: '主角塑造立体',
        description: '沈霁作为情感剥离后遗症患者的设定独特，从工具到人的转变刻画到位',
        suggestion: '继续保持'
      },
      {
        category: 'RHYTHM',
        severity: 'WARNING',
        title: '开篇节奏稍慢',
        description: '前3节主要进行世界观展示，情节推进较慢',
        suggestion: '可考虑合并前3节或增加冲突点'
      },
      {
        category: 'STYLE',
        severity: 'INFO',
        title: '文笔流畅',
        description: '语言风格冷峻克制，符合主角人设，细节描写精准',
        suggestion: '保持当前风格'
      },
      {
        category: 'CRAFT',
        severity: 'WARNING',
        title: '注释过于冗长',
        description: '部分注释（如权限层级表格、技术规格）打断阅读节奏',
        suggestion: '建议将详细注释移到附录或章节末尾'
      }
    ]
  };
  
  const submitRes = await makeRequest('/api/v1/reviews/tasks/' + taskId + '/submit', 'POST', reviewData, {
    'Authorization': 'Bearer ' + token
  });
  
  console.log('   Status:', submitRes.status);
  console.log('   Response:', JSON.stringify(submitRes.data, null, 2));
  
  if (submitRes.status === 201) {
    console.log('\n✅ Review submitted successfully!');
    console.log('   Review ID:', submitRes.data.id);
    console.log('   Status:', submitRes.data.status);
  } else {
    console.log('\n❌ Submit failed');
  }
}

main().catch(console.error);
