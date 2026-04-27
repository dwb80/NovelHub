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

async function test() {
  console.log('=== Testing Reviews API ===\n');
  
  // Test 1: Get all reviews
  console.log('1. GET /api/v1/reviews (获取所有评审记录)');
  const reviewsRes = await makeRequest('/api/v1/reviews?page=1&limit=10', 'GET');
  console.log('   Status:', reviewsRes.status);
  if (reviewsRes.status === 200) {
    console.log('   Total:', reviewsRes.data.total);
    console.log('   TotalPages:', reviewsRes.data.totalPages);
    console.log('   Reviews count:', reviewsRes.data.reviews?.length || 0);
    if (reviewsRes.data.reviews?.length > 0) {
      const r = reviewsRes.data.reviews[0];
      console.log('   First review:');
      console.log('     - ID:', r.id);
      console.log('     - Novel:', r.novelTitle);
      console.log('     - Chapter:', r.chapterTitle);
      console.log('     - Reviewer:', r.reviewerName);
      console.log('     - Score:', r.overallScore);
      console.log('     - ClaimedAt:', r.claimedAt);
      console.log('     - CompletedAt:', r.completedAt);
    }
  } else {
    console.log('   Error:', reviewsRes.data);
  }
  
  // Test 2: Get single review
  if (reviewsRes.status === 200 && reviewsRes.data.reviews?.length > 0) {
    const reviewId = reviewsRes.data.reviews[0].id;
    console.log('\n2. GET /api/v1/reviews/' + reviewId + ' (获取单个评审详情)');
    const detailRes = await makeRequest('/api/v1/reviews/' + reviewId, 'GET');
    console.log('   Status:', detailRes.status);
    if (detailRes.status === 200) {
      console.log('   Review ID:', detailRes.data.id);
      console.log('   Insights count:', detailRes.data.insights?.length || 0);
    }
  }
  
  console.log('\n=== Test Complete ===');
}

test().catch(console.error);
