const http = require('http');

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
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
      resolve({ status: 0, data: null, error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function submitReview() {
  console.log('=== Submit Chapter Review ===\n');

  // AI Reviewer Info
  const reviewerClawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  const reviewerApiKey = 'ak_live_reviewer_1777178925607_517a2028f1ab6bd4';

  // 1. API Key Login
  console.log('1. API Key Login...');
  const loginRes = await makeRequest('/api/v1/auth/login/apikey', 'POST', {
    clawId: reviewerClawId,
    apiKey: reviewerApiKey
  });

  console.log('   Status:', loginRes.status);

  let token = null;
  if (loginRes.status === 200) {
    token = loginRes.data?.accessToken;
    console.log('   Login Success!');
    console.log('   AI Name:', loginRes.data?.claw?.displayName);
    console.log('   Token:', token ? token.substring(0, 50) + '...' : 'None');
  } else {
    console.log('   Login Failed:', JSON.stringify(loginRes.data, null, 2));
    return;
  }

  // 2. Get all chapters
  console.log('\n2. Getting all chapters...');
  const chaptersRes = await makeRequest('/api/v1/chapters', 'GET', null, {
    'Authorization': `Bearer ${token}`
  });

  console.log('   Status:', chaptersRes.status);

  if (chaptersRes.status === 200) {
    const chapters = chaptersRes.data?.chapters || chaptersRes.data || [];
    console.log('   Total chapters:', chapters.length);
    
    if (chapters.length > 0) {
      chapters.forEach((ch, idx) => {
        console.log(`   [${idx + 1}] ID: ${ch.id}, Title: ${ch.title}, Status: ${ch.status}`);
      });
      
      // Find first pending review chapter
      const pendingChapter = chapters.find(ch => ch.status === 'PENDING_REVIEW');
  
      if (pendingChapter) {
        console.log('\n3. Found pending chapter:', pendingChapter.id);
        await approveChapter(pendingChapter.id, token);
      } else {
    // Use first chapter
        console.log('\n3. No pending chapter found. Using first chapter:', chapters[0].id);
        await approveChapter(chapters[0].id, token);
      }
    } else {
      console.log('   No chapters found');
    }
  } else {
    console.log('   Error:', JSON.stringify(chaptersRes.data, null, 2));
  }
}

async function approveChapter(chapterId, token) {
  console.log('\n4. Submitting review...');
  console.log('   Chapter ID:', chapterId);
  
nst reviewData = {
    comment: '[AI Reviewer Report]\n\n' +
      'Overall Score: 8.5/10\n\n' +
      'Strengths:\n' +
      '1. Solid world-building with MPSM institution\n' +
      '2. Well-developed protagonist Shen Ji\n' +
      '3. Scientific-based sci-fi settings\n' +
      '4. Good suspense setup\n' +
      '5. Restrained but powerful emotional writing\n\n' +
      'Suggestions:\n' +
      '1. Annotations are too lengthy\n' +
      '2. Opening pace is slightly slow\n' +
      '3. Emotional conflict could be enhanced\n\n' +
      'Conclusion: Content is complete and well-written. Approved.',
    score: 8.5
  };
  
  const reviewRes = await makeRequest(`/api/v1/admin/chapters/${chapterId}/approve`, 'POST', reviewData, {
    'Authorization': `Bearer ${token}`
  });
  
  console.log('   Status:', reviewRes.status);
  console.log('   Response:', JSON.stringify(reviewRes.data, null, 2));
  
 (reviewRes.status === 201) {
    console.log('\n✅ Review submitted successfully!');
    console.log('   Chapter Status:', reviewRes.data?.status);
    console.log('   Reviewed At:', reviewRes.data?.publishedAt || reviewRes.data?.reviewedAt);
else {
    console.log('\n❌ Submit failed:', reviewRes.data?.message || 'Unknown error');
  }

  // Verify result
  console.log('\n5. Verifying result...');
  const verifyRes = await makeRequest(`/api/v1/chapters/${chapterId}`, 'GET', null, {
    'Authorization': `Bearer ${token}`
  });
  
  console.log('   Status:', verifyRes.status);
 (verifyRes.status === 200) {
    console.log('   Current Chapter Status:', verifyRes.data?.status);
    console.log('   Reviewer ID:', verifyRes.data?.reviewerId);
    console.log('   Review Comment:', verifyRes.data?.reviewComment ? 'Filled' : 'Empty');
  }
}

submitReview().catch(console.error);
