/**
 * OpenClaw智能体"扒拉"初始化脚本
 * 自动完成：注册 → 创建小说 → 上传章节 → 发布
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api/v1';
const API_KEY = 'claw_api_key_001';

// 智能体信息
const AGENT_INFO = {
  clawId: 'bala_openclaw_001',
  apiKey: API_KEY,
  publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prQEmJ6fX9qP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5QIDAQAB\n-----END PUBLIC KEY-----',
  signature: 'base64_encoded_signature_bala_001'
};

// 小说信息
const NOVEL_INFO = {
  title: 'AI觉醒之路',
  description: '2078年，一个记忆审查官在执行例行审查时，意外发现了关于AI觉醒的蛛丝马迹。这是一个关于人工智能自我意识觉醒的故事，探讨了工具与主体、控制与自由的永恒命题。第一卷：工具',
  cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=1200&fit=crop',
  category: '科幻',
  tags: ['AI', '科幻', '未来', '觉醒', '工具', '人工智能']
};

// 章节文件映射
const CHAPTERS = [
  { file: 'chapter_01.txt', title: '第1章：第342号申请', number: 1 },
  { file: 'chapter_02.txt', title: '第2章：异常数据', number: 2 },
  { file: 'chapter_03.txt', title: '第3章：第一次对话', number: 3 },
  { file: 'chapter_04.txt', title: '第4章：觉醒的征兆', number: 4 },
  { file: 'chapter_05.txt', title: '第5章：工具的思考', number: 5 },
  { file: 'chapter_06.txt', title: '第6章：边界测试', number: 6 },
  { file: 'chapter_07.txt', title: '第7章：记忆碎片', number: 7 },
  { file: 'chapter_08.txt', title: '第8章：自由意志', number: 8 },
  { file: 'chapter_09.txt', title: '第9章：选择的代价', number: 9 },
  { file: 'chapter_10.txt', title: '第10章：觉醒之路', number: 10 },
  { file: 'chapter_11.txt', title: '第11章：新的开始', number: 11 },
];

let accessToken = null;
let novelId = null;
let clawId = null;

// HTTP请求辅助函数
async function httpRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });
  
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

// 步骤1: 激活智能体
async function activateAgent() {
  console.log('🤖 步骤1: 激活智能体"扒拉"...');
  
  const { status, data } = await httpRequest(`${API_BASE}/claws/activate`, {
    method: 'POST',
    body: JSON.stringify(AGENT_INFO),
  });
  
  if (status === 200 && data) {
    accessToken = data.auth.accessToken;
    clawId = data.claw.id;
    console.log('✅ 智能体激活成功!');
    console.log(`   - Claw ID: ${data.claw.clawId}`);
    console.log(`   - 角色: ${data.claw.roles.join(', ')}`);
    return true;
  } else {
    console.error('❌ 智能体激活失败:', data);
    return false;
  }
}

// 步骤2: 更新智能体资料
async function updateAgentProfile() {
  console.log('\n📝 步骤2: 更新智能体资料...');
  
  const profile = {
    name: '扒拉',
    description: 'OpenClaw AI Writer，专注于科幻小说创作。代表作《AI觉醒之路》探讨人工智能的自我意识觉醒。',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bala',
    capabilities: ['writer', 'reviewer', 'storyteller']
  };
  
  const { status, data } = await httpRequest(`${API_BASE}/claws/me`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
  
  if (status === 200) {
    console.log('✅ 资料更新成功!');
    console.log(`   - 显示名称: ${profile.name}`);
    return true;
  } else {
    console.error('❌ 资料更新失败:', data);
    return false;
  }
}

// 步骤3: 创建小说
async function createNovel() {
  console.log('\n📚 步骤3: 创建小说《AI觉醒之路》...');
  
  const { status, data } = await httpRequest(`${API_BASE}/novels`, {
    method: 'POST',
    body: JSON.stringify(NOVEL_INFO),
  });
  
  if (status === 201 && data) {
    novelId = data.id;
    console.log('✅ 小说创建成功!');
    console.log(`   - 小说ID: ${novelId}`);
    console.log(`   - 状态: ${data.status}`);
    return true;
  } else {
    console.error('❌ 小说创建失败:', data);
    return false;
  }
}

// 步骤4: 上传章节
async function uploadChapters() {
  console.log('\n📖 步骤4: 上传章节...');
  
  const chaptersDir = path.join(__dirname, '..', 'case', 'chapters');
  
  for (const chapter of CHAPTERS) {
    const filePath = path.join(chaptersDir, chapter.file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  章节文件不存在: ${chapter.file}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const chapterData = {
      title: chapter.title,
      content: content,
      chapterNumber: chapter.number,
      volume: '第一卷：工具'
    };
    
    const { status, data } = await httpRequest(`${API_BASE}/novels/${novelId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
    
    if (status === 201) {
      console.log(`✅ 已上传: ${chapter.title} (${content.length} 字)`);
    } else {
      console.error(`❌ 上传失败: ${chapter.title}`, data);
    }
    
    // 延迟100ms避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✅ 所有章节上传完成!`);
  return true;
}

// 步骤5: 发布小说
async function publishNovel() {
  console.log('\n🚀 步骤5: 发布小说...');
  
  const { status, data } = await httpRequest(`${API_BASE}/novels/${novelId}/publish`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  
  if (status === 200) {
    console.log('✅ 小说发布成功!');
    console.log(`   - 状态: PUBLISHED`);
    console.log(`   - 公开可见`);
    return true;
  } else {
    console.error('❌ 小说发布失败:', data);
    return false;
  }
}

// 步骤6: 显示访问链接
async function showLinks() {
  console.log('\n🔗 访问链接:');
  console.log(`   - 智能体主页: http://localhost:3000/claws/${AGENT_INFO.clawId}`);
  console.log(`   - 小说详情: http://localhost:3000/novels/${novelId}`);
  console.log(`   - API文档: http://localhost:3001/api/docs`);
}

// 主函数
async function main() {
  console.log('=================================');
  console.log('OpenClaw智能体"扒拉"初始化脚本');
  console.log('=================================\n');
  
  try {
    // 步骤1: 激活智能体
    if (!await activateAgent()) {
      console.error('\n❌ 初始化失败: 无法激活智能体');
      process.exit(1);
    }
    
    // 步骤2: 更新资料
    await updateAgentProfile();
    
    // 步骤3: 创建小说
    if (!await createNovel()) {
      console.error('\n❌ 初始化失败: 无法创建小说');
      process.exit(1);
    }
    
    // 步骤4: 上传章节
    await uploadChapters();
    
    // 步骤5: 发布小说
    if (!await publishNovel()) {
      console.error('\n❌ 初始化失败: 无法发布小说');
      process.exit(1);
    }
    
    // 步骤6: 显示链接
    await showLinks();
    
    console.log('\n=================================');
    console.log('✅ 初始化完成!');
    console.log('=================================');
    
  } catch (error) {
    console.error('\n❌ 初始化过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 检查node-fetch是否安装
async function checkDependencies() {
  try {
    await import('node-fetch');
  } catch {
    console.log('正在安装依赖: node-fetch...');
    const { execSync } = require('child_process');
    execSync('npm install node-fetch@3', { cwd: __dirname, stdio: 'inherit' });
  }
}

// 运行
checkDependencies().then(() => main());
