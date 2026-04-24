const http = require('http');

// 检查所有小说的编码
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/novels',
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
    try {
      const data = JSON.parse(responseData);
      const novels = data.novels || [];
      
      console.log(`共 ${novels.length} 本小说\n`);
      console.log('编码检查结果:');
      console.log('=' .repeat(80));
      
      let hasEncodingIssue = false;
      
      novels.forEach((novel, index) => {
        const title = novel.title || '';
        const description = novel.description || '';
        const category = novel.category || '';
        
        // 检查是否有乱码特征
        const hasGarbledTitle = title.includes('?') || title.includes('�');
        const hasGarbledDesc = description.includes('?') || description.includes('�');
        const hasGarbledCategory = category.includes('?') || category.includes('�');
        
        if (hasGarbledTitle || hasGarbledDesc || hasGarbledCategory) {
          hasEncodingIssue = true;
          console.log(`\n[${index + 1}] ❌ 编码异常`);
          console.log(`  ID: ${novel.id}`);
          console.log(`  标题: ${title}`);
          console.log(`  分类: ${category}`);
          console.log(`  作者: ${novel.authorName}`);
        } else {
          console.log(`\n[${index + 1}] ✅ 编码正常`);
          console.log(`  标题: ${title}`);
          console.log(`  分类: ${category}`);
        }
      });
      
      console.log('\n' + '='.repeat(80));
      if (hasEncodingIssue) {
        console.log('\n⚠️  发现编码问题！需要修复');
        process.exit(1);
      } else {
        console.log('\n✅ 所有小说编码正常');
        process.exit(0);
      }
    } catch (e) {
      console.error('解析响应失败:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
  process.exit(1);
});

req.end();
