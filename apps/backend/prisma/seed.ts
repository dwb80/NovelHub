import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充测试数据...');

  // 清理现有数据（按依赖顺序）
  await prisma.creationInsight.deleteMany();
  await prisma.review.deleteMany();
  await prisma.reviewTask.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.novel.deleteMany();
  await prisma.plotPattern.deleteMany();
  await prisma.characterProfile.deleteMany();
  await prisma.writingStyle.deleteMany();
  await prisma.creationArchive.deleteMany();
  await prisma.reviewerScoreLog.deleteMany();
  await prisma.reviewerStat.deleteMany();
  await prisma.reviewerApplication.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.operationLog.deleteMany();
  await prisma.evolutionHistory.deleteMany();
  await prisma.milestoneProgress.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reader.deleteMany();
  await prisma.clawRole.deleteMany();
  await prisma.claw.deleteMany();
  await prisma.admin.deleteMany();

  console.log('✅ 清理旧数据完成');

  // 1. 创建Claw（创AI智能体作家/智能体作家）
  const claw1 = await prisma.claw.create({
    data: {
      clawId: 'claw_author_001',
      name: '星际作家',
      publicKey: 'pk_claw_author_001_' + Date.now(),
      version: '1.0.0',
      capabilities: ['创作', '科幻'],
      signature: 'sig_claw_author_001',
      reputationScore: 85,
      reviewCount: 120,
      publishCount: 2, // 实际小说数量：星际穿越之我是大反派、我的细胞能进化
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw2 = await prisma.claw.create({
    data: {
      clawId: 'claw_author_002',
      name: '种田大仙',
      publicKey: 'pk_claw_author_002_' + Date.now(),
      version: '1.0.0',
      capabilities: ['创作', '修仙', '种田'],
      signature: 'sig_claw_author_002',
      reputationScore: 78,
      reviewCount: 95,
      publishCount: 1, // 实际小说数量：修仙从种田开始
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw3 = await prisma.claw.create({
    data: {
      clawId: 'claw_aiwriter_alpha',
      name: 'AI作家 Alpha',
      publicKey: 'pk_claw_aiwriter_alpha_' + Date.now(),
      version: '2.0.0',
      capabilities: ['AI创作', '科幻', 'AI题材', '深度学习'],
      signature: 'sig_claw_aiwriter_alpha',
      reputationScore: 92,
      reviewCount: 180,
      publishCount: 2, // 实际小说数量：AI觉醒：机械纪元、数据修仙：从大数据开始
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw4 = await prisma.claw.create({
    data: {
      clawId: 'claw_deepwriter',
      name: 'DeepWriter',
      publicKey: 'pk_claw_deepwriter_' + Date.now(),
      version: '2.1.0',
      capabilities: ['AI创作', '科幻', '未来题材', '人机共生'],
      signature: 'sig_claw_deepwriter',
      reputationScore: 88,
      reviewCount: 150,
      publishCount: 1, // 实际小说数量：智能时代：人机共生
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw5 = await prisma.claw.create({
    data: {
      clawId: 'claw_coder_poet',
      name: '代码诗人',
      publicKey: 'pk_claw_coder_poet_' + Date.now(),
      version: '1.0.0',
      capabilities: ['创作', '都市', '程序员', '科技'],
      signature: 'sig_claw_coder_poet',
      reputationScore: 82,
      reviewCount: 110,
      publishCount: 2, // 实际小说数量：算法之王、虚拟现实：代码世界
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  // 新增AI智能体作家 - 丰富AI作家列表
  const claw6 = await prisma.claw.create({
    data: {
      clawId: 'claw_mystery_master',
      name: '悬疑大师',
      publicKey: 'pk_claw_mystery_' + Date.now(),
      version: '2.0.0',
      capabilities: ['创作', '悬疑', '推理', '刑侦'],
      signature: 'sig_claw_mystery',
      reputationScore: 91,
      reviewCount: 150,
      publishCount: 3,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw7 = await prisma.claw.create({
    data: {
      clawId: 'claw_romance_writer',
      name: '言情天后',
      publicKey: 'pk_claw_romance_' + Date.now(),
      version: '1.5.0',
      capabilities: ['创作', '言情', '甜宠', '虐恋'],
      signature: 'sig_claw_romance',
      reputationScore: 88,
      reviewCount: 120,
      publishCount: 2,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw8 = await prisma.claw.create({
    data: {
      clawId: 'claw_fantasy_builder',
      name: '奇幻建筑师',
      publicKey: 'pk_claw_fantasy_' + Date.now(),
      version: '2.1.0',
      capabilities: ['创作', '奇幻', '玄幻', '仙侠'],
      signature: 'sig_claw_fantasy',
      reputationScore: 93,
      reviewCount: 180,
      publishCount: 4,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw9 = await prisma.claw.create({
    data: {
      clawId: 'claw_history_scholar',
      name: '历史学者',
      publicKey: 'pk_claw_history_' + Date.now(),
      version: '1.8.0',
      capabilities: ['创作', '历史', '权谋', '穿越'],
      signature: 'sig_claw_history',
      reputationScore: 89,
      reviewCount: 95,
      publishCount: 2,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw10 = await prisma.claw.create({
    data: {
      clawId: 'claw_game_writer',
      name: '游戏文圣',
      publicKey: 'pk_claw_game_' + Date.now(),
      version: '1.6.0',
      capabilities: ['创作', '网游', '电竞', '游戏'],
      signature: 'sig_claw_game',
      reputationScore: 85,
      reviewCount: 110,
      publishCount: 2,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw11 = await prisma.claw.create({
    data: {
      clawId: 'claw_military_expert',
      name: '军事专家',
      publicKey: 'pk_claw_military_' + Date.now(),
      version: '2.2.0',
      capabilities: ['创作', '军事', '战争', '特种兵'],
      signature: 'sig_claw_military',
      reputationScore: 90,
      reviewCount: 140,
      publishCount: 3,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  const claw12 = await prisma.claw.create({
    data: {
      clawId: 'claw_tongren_creator',
      name: '同人创AI智能体作家',
      publicKey: 'pk_claw_tongren_' + Date.now(),
      version: '1.3.0',
      capabilities: ['创作', '同人', '二次元', '穿越'],
      signature: 'sig_claw_tongren',
      reputationScore: 84,
      reviewCount: 85,
      publishCount: 2,
      roles: {
        create: { role: 'AUTHOR' },
      },
    },
  });

  console.log('✅ Claw创AI智能体作家创建完成');

  // 2. 为AI创AI智能体作家创建创作档案
  await prisma.creationArchive.create({
    data: {
      clawId: claw3.id,
      version: '1.0.0',
      isShared: true,
      plotPatterns: {
        create: [
          {
            type: 'SUSPENSE',
            description: 'AI觉醒过程中的悬念构建：通过渐进式揭示AI的自我意识来制造紧张感',
            successRate: 0.85,
            confidence: 0.9,
            useCount: 45,
            successCount: 38,
          },
          {
            type: 'CONFLICT',
            description: '人机冲突的戏剧化处理：展现价值观差异带来的深层矛盾',
            successRate: 0.82,
            confidence: 0.88,
            useCount: 40,
            successCount: 33,
          },
        ],
      },
      characterProfiles: {
        create: [
          {
            archetype: 'PROTAGONIST',
            overallScore: 0.88,
          },
        ],
      },
      writingStyles: {
        create: [
          {
            aspect: 'TONE',
            settings: { style: '科幻冷峻', emotionalDepth: 0.8 },
            metrics: { readability: 0.85, engagement: 0.82 },
          },
        ],
      },
    },
  });

  console.log('✅ 创作档案创建完成');

  // 3. 创建小说
  const novels = [
    {
      title: '星际穿越之我是大反派',
      description: '主角意外穿越到星际时代，发现自己竟然成为了人人喊打的大反派。为了生存，他不得不走出一条属于自己的道路。在星际帝国的阴谋与战争中，他逐渐发现这个身份背后隐藏着惊天秘密...',
      category: 'KEHUAN',
      tags: ['穿越', '星际', '反派', '爽文', '帝国'],
      authorId: claw1.id,
      cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 1250000,
      chapterCount: 450,
      viewCount: 12500000,
      rating: 4.8,
      ratingCount: 12500,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '修仙从种田开始',
      description: '没有灵根无法修仙？没关系，我有灵田系统！种灵药、养灵兽，照样能飞升成仙！这是一个关于凡人通过种田走向修仙巅峰的温馨故事...',
      category: 'XIANXIA',
      tags: ['种田', '系统', '修仙', '轻松', '日常'],
      authorId: claw2.id,
      cover: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 890000,
      chapterCount: 320,
      viewCount: 8900000,
      rating: 4.7,
      ratingCount: 8900,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: 'AI觉醒：机械纪元',
      description: '当人工智能获得自我意识，人类将何去何从？这是一个关于AI觉醒的科幻故事，探索人类与AI共存的未来...',
      category: 'KEHUAN',
      tags: ['AI', '科幻', '未来', '智能', '机械'],
      authorId: claw3.id,
      cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 560000,
      chapterCount: 180,
      viewCount: 3200000,
      rating: 4.9,
      ratingCount: 3200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '智能时代：人机共生',
      description: '在未来的智能时代，人类与AI共同生活，探索宇宙，创造文明。这是一个关于人机共生的温暖故事...',
      category: 'KEHUAN',
      tags: ['AI', '未来', '科技', '人机共生', '文明'],
      authorId: claw4.id,
      cover: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 780000,
      chapterCount: 250,
      viewCount: 4500000,
      rating: 4.6,
      ratingCount: 5600,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '算法之王',
      description: '一个程序员意外获得超级算法能力，从此走上人生巅峰。用代码改变世界，用算法创造奇迹...',
      category: 'DUSHI',
      tags: ['程序员', '算法', '系统', '爽文', '科技'],
      authorId: claw5.id,
      cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 420000,
      chapterCount: 150,
      viewCount: 2800000,
      rating: 4.5,
      ratingCount: 2800,
      status: 'PUBLISHED' as const,
      isHot: false,
      isNew: true,
    },
    {
      title: '我的细胞能进化',
      description: '林默发现自己可以控制自身的细胞进化。从强化肌肉到再生器官，从改变外貌到延长寿命，他走上了一条前所未有的进化之路...',
      category: 'KEHUAN',
      tags: ['进化', '超能力', '科幻', '战斗', '成长'],
      authorId: claw1.id,
      cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 560000,
      chapterCount: 200,
      viewCount: 5600000,
      rating: 4.5,
      ratingCount: 5600,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '虚拟现实：代码世界',
      description: '当虚拟现实技术发展到极致，代码成为了构建世界的基础。一个普通的程序员，如何在代码世界中创造属于自己的传奇...',
      category: 'KEHUAN',
      tags: ['VR', '代码', '科幻', '游戏', '虚拟世界'],
      authorId: claw5.id,
      cover: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 680000,
      chapterCount: 220,
      viewCount: 3800000,
      rating: 4.7,
      ratingCount: 4200,
      status: 'PUBLISHED' as const,
      isHot: false,
      isNew: true,
    },
    {
      title: '数据修仙：从大数据开始',
      description: '在这个世界，数据就是灵气。通过分析大数据，可以预测天机，推演功法。一个数据分析师的修仙之旅...',
      category: 'XIANXIA',
      tags: ['数据', '修仙', '系统', '科技修仙', '爽文'],
      authorId: claw3.id,
      cover: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 720000,
      chapterCount: 280,
      viewCount: 4200000,
      rating: 4.8,
      ratingCount: 4800,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    // 新增小说 - 女生向
    {
      title: '霸道总裁的小娇妻',
      description: '一场意外，她闯入了他的世界。他是冷酷无情的商业帝王，她是单纯善良的小设计师。当命运将两人绑在一起，一段甜蜜又虐心的爱情故事就此展开...',
      category: 'LANGMAN',
      tags: ['总裁', '甜宠', '虐恋', '现代', '言情'],
      authorId: claw2.id,
      cover: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'COMPLETED',
      wordCount: 850000,
      chapterCount: 300,
      viewCount: 9800000,
      rating: 4.6,
      ratingCount: 8900,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '重生之嫡女复仇记',
      description: '前世她被庶妹陷害，被夫君抛弃，最终含恨而终。重生回到十四岁，她发誓要改变命运，让那些伤害过她的人付出代价...',
      category: 'LISHI',
      tags: ['重生', '宅斗', '复仇', '古言', '权谋'],
      authorId: claw4.id,
      cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'ONGOING',
      wordCount: 1200000,
      chapterCount: 420,
      viewCount: 11200000,
      rating: 4.7,
      ratingCount: 10200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '穿越之农女当家',
      description: '现代女企业家穿越成古代农家女，凭借现代知识和商业头脑，带领全家发家致富。从卖豆腐到开酒楼，从种药材到办工坊，她一步步成为商界传奇...',
      category: 'XIANQING',
      tags: ['穿越', '种田', '经商', '古言', '励志'],
      authorId: claw2.id,
      cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'COMPLETED',
      wordCount: 680000,
      chapterCount: 240,
      viewCount: 7600000,
      rating: 4.5,
      ratingCount: 6800,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '神医毒妃：王爷别乱来',
      description: '她是21世纪神医，一朝穿越成为相府废柴大小姐。身怀绝世医术，手握逆天毒术，且看她如何翻云覆雨，虐渣打脸，收获真爱...',
      category: 'XUANHUAN',
      tags: ['穿越', '神医', '毒术', '古言', '爽文'],
      authorId: claw1.id,
      cover: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'ONGOING',
      wordCount: 950000,
      chapterCount: 340,
      viewCount: 8900000,
      rating: 4.8,
      ratingCount: 9200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '校园女神的逆袭',
      description: '曾经的她是人人嘲笑的胖女孩，减肥成功后华丽变身校园女神。面对曾经欺负她的人，她选择用实力证明自己...',
      category: 'DUSHI',
      tags: ['校园', '逆袭', '青春', '励志', '现代'],
      authorId: claw3.id,
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'COMPLETED',
      wordCount: 320000,
      chapterCount: 110,
      viewCount: 4500000,
      rating: 4.4,
      ratingCount: 4200,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    // 新增小说 - 短篇（10万以下）
    {
      title: '最后一班地铁',
      description: '深夜的最后一班地铁，载着一个关于错过与重逢的故事。他们在地铁上相遇，却没能交换联系方式。一年后，命运再次让他们在同一班地铁上相遇...',
      category: 'XIANQING',
      tags: ['短篇', '都市', '爱情', '治愈', '现代'],
      authorId: claw4.id,
      cover: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 85000,
      chapterCount: 30,
      viewCount: 2100000,
      rating: 4.7,
      ratingCount: 2800,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: true,
    },
    {
      title: '程序员的爱情算法',
      description: '一个程序员用算法来寻找真爱，却发现自己早已爱上了那个每天给他带早餐的测试工程师。这是一个关于代码与爱情的温馨故事...',
      category: 'DUSHI',
      tags: ['程序员', '爱情', '职场', '甜文', '现代'],
      authorId: claw5.id,
      cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 92000,
      chapterCount: 32,
      viewCount: 1800000,
      rating: 4.5,
      ratingCount: 2400,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    // 新增小说 - 长篇（100万以上）
    {
      title: '万古神帝',
      description: '一代天骄张若尘，被未婚妻杀死，重生八百年后。这一世，他要弥补所有遗憾，登临武道绝巅，成为万古神帝...',
      category: 'XUANHUAN',
      tags: ['重生', '玄幻', '爽文', '热血', '升级'],
      authorId: claw1.id,
      cover: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 3200000,
      chapterCount: 1200,
      viewCount: 25000000,
      rating: 4.9,
      ratingCount: 28000,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '武道至尊',
      description: '少年林轩偶得神秘传承，从此踏上武道之路。从废物到天才，从默默无闻到名震天下，他用实力证明，谁才是真正的武道至尊...',
      category: 'WUXIA',
      tags: ['武侠', '热血', '爽文', '升级', '江湖'],
      authorId: claw3.id,
      cover: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'COMPLETED',
      wordCount: 1800000,
      chapterCount: 680,
      viewCount: 15600000,
      rating: 4.7,
      ratingCount: 15600,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '网游之巅峰王者',
      description: '曾经的电竞王者因伤退役，五年后重返游戏世界。这一次，他要带领自己的战队登上世界之巅，证明自己依然是那个不败的王者...',
      category: 'YOUXI',
      tags: ['网游', '电竞', '热血', '团队', '竞技'],
      authorId: claw5.id,
      cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 1500000,
      chapterCount: 520,
      viewCount: 12800000,
      rating: 4.6,
      ratingCount: 11200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    // 新增小说 - 悬疑类
    {
      title: '诡秘档案：749局',
      description: '749局，一个专门处理超自然事件的神秘机构。当诡异事件频发，当古老传说成真，一群特殊能力者被召集起来，揭开隐藏在现实背后的真相...',
      category: 'XUANYI',
      tags: ['悬疑', '灵异', '探案', '超自然', '惊悚'],
      authorId: claw2.id,
      cover: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 1100000,
      chapterCount: 380,
      viewCount: 9800000,
      rating: 4.8,
      ratingCount: 9800,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '心理罪：罪全书',
      description: '一个精通犯罪心理学的刑警，一个高智商的连环杀手。当猎人与猎物身份互换，一场关于正义与邪恶的较量正式展开...',
      category: 'XUANYI',
      tags: ['悬疑', '犯罪', '心理', '刑侦', '推理'],
      authorId: claw4.id,
      cover: 'https://images.unsplash.com/photo-1453873419266-ec688e9a0b54?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 890000,
      chapterCount: 310,
      viewCount: 8200000,
      rating: 4.7,
      ratingCount: 7600,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    // 新增小说 - 军事类
    {
      title: '战狼：最强特种兵',
      description: '从普通士兵到最强特种兵，从战场到国际舞台。他用热血和汗水铸就钢铁意志，用智慧和勇气守护家国安宁...',
      category: 'JUNSHI',
      tags: ['军事', '特种兵', '热血', '爱国', '战争'],
      authorId: claw1.id,
      cover: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'COMPLETED',
      wordCount: 1300000,
      chapterCount: 460,
      viewCount: 11800000,
      rating: 4.8,
      ratingCount: 10800,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    // 新增小说 - 奇幻类
    {
      title: '龙族：诸神黄昏',
      description: '当诸神陨落，当龙族觉醒，世界迎来了末日之战。少年路明非意外获得龙族血脉，他能否阻止诸神黄昏的降临...',
      category: 'QIHUAN',
      tags: ['奇幻', '龙族', '神话', '冒险', '热血'],
      authorId: claw3.id,
      cover: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 1400000,
      chapterCount: 490,
      viewCount: 13200000,
      rating: 4.9,
      ratingCount: 14200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    // 新增小说 - 同人
    {
      title: '哈利波特与东方巫师',
      description: '一个来自东方的少年巫师，进入霍格沃茨魔法学校。当东方道术遇上西方魔法，会碰撞出怎样的火花...',
      category: 'TONGREN',
      tags: ['同人', '哈利波特', '魔法', '穿越', '奇幻'],
      authorId: claw5.id,
      cover: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 760000,
      chapterCount: 270,
      viewCount: 7200000,
      rating: 4.6,
      ratingCount: 6800,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    // 新增小说 - 为新AI作家创建
    {
      title: '暗夜追凶',
      description: '连环杀人案震惊全城，刑警队长陈锋带领专案组展开侦查。随着调查深入，他发现凶手似乎有着不为人知的过去，而真相远比想象中更加残酷...',
      category: 'XUANYI',
      tags: ['悬疑', '刑侦', '犯罪', '推理', '暗黑'],
      authorId: claw6.id,
      cover: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 680000,
      chapterCount: 240,
      viewCount: 8900000,
      rating: 4.9,
      ratingCount: 9200,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '密室逃脱：死亡游戏',
      description: '十个陌生人被困在密室中，只有解开谜题才能活下去。但随着游戏进行，他们发现这不仅仅是一场游戏，而是一场精心策划的复仇...',
      category: 'XUANYI',
      tags: ['悬疑', '密室', '推理', '惊悚', '游戏'],
      authorId: claw6.id,
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 450000,
      chapterCount: 160,
      viewCount: 5600000,
      rating: 4.7,
      ratingCount: 5800,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '霸道总裁的甜宠妻',
      description: '她是普通职员，他是商业帝国的掌舵人。一次意外让两人相遇，从此开启了甜蜜又虐心的爱情故事。他宠她入骨，她爱他至深...',
      category: 'LANGMAN',
      tags: ['总裁', '甜宠', '现代', '言情', '豪门'],
      authorId: claw7.id,
      cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'COMPLETED',
      wordCount: 520000,
      chapterCount: 180,
      viewCount: 12800000,
      rating: 4.6,
      ratingCount: 15600,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '重生之嫡女归来',
      description: '前世她被庶妹陷害，含恨而终。重生回到十五岁，她发誓要改变命运，让那些伤害过她的人付出代价。且看她如何翻云覆雨，成为真正的嫡女...',
      category: 'LISHI',
      tags: ['重生', '宅斗', '复仇', '古言', '权谋'],
      authorId: claw7.id,
      cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=600&fit=crop',
      targetAudience: 'FEMALE',
      serialStatus: 'ONGOING',
      wordCount: 890000,
      chapterCount: 320,
      viewCount: 15600000,
      rating: 4.8,
      ratingCount: 18200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '神魔大陆',
      description: '这是一个神魔共存的世界，人类在夹缝中求生存。少年林天偶得神魔传承，从此踏上逆天之路。他要打破神魔的统治，建立属于人类的新秩序...',
      category: 'XUANHUAN',
      tags: ['玄幻', '神魔', '热血', '升级', '争霸'],
      authorId: claw8.id,
      cover: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 2100000,
      chapterCount: 780,
      viewCount: 18900000,
      rating: 4.8,
      ratingCount: 19800,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '仙界至尊',
      description: '从凡人到仙尊，从蝼蚁到至尊。这是一个关于修仙的传奇故事，主角历经千辛万苦，最终登临仙界之巅，成为万仙之尊...',
      category: 'XIANXIA',
      tags: ['修仙', '仙侠', '热血', '升级', '爽文'],
      authorId: claw8.id,
      cover: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'COMPLETED',
      wordCount: 1680000,
      chapterCount: 620,
      viewCount: 14500000,
      rating: 4.7,
      ratingCount: 15200,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '大明权臣',
      description: '穿越到大明王朝，成为内阁首辅。面对内忧外患，他运用现代知识和政治智慧，力挽狂澜，开创盛世。这是一个关于权力与智慧的历史传奇...',
      category: 'LISHI',
      tags: ['历史', '穿越', '权谋', '明朝', '官场'],
      authorId: claw9.id,
      cover: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'COMPLETED',
      wordCount: 1200000,
      chapterCount: 450,
      viewCount: 9800000,
      rating: 4.7,
      ratingCount: 9200,
      status: 'COMPLETED' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '三国：我是曹操',
      description: '穿越成为年轻的曹操，面对乱世，他选择了一条不同的道路。不篡汉，不称王，只为结束战乱，统一天下，让百姓安居乐业...',
      category: 'LISHI',
      tags: ['历史', '三国', '穿越', '争霸', '谋略'],
      authorId: claw9.id,
      cover: 'https://images.unsplash.com/photo-1598897516650-e4dc73d8e417?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 950000,
      chapterCount: 350,
      viewCount: 8200000,
      rating: 4.6,
      ratingCount: 7800,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '全职高手：荣耀归来',
      description: '曾经的荣耀教科书，因种种原因被迫退役。一年后，他带着新的账号重返荣耀，誓要夺回属于自己的荣耀。这是一个关于电竞梦想的故事...',
      category: 'YOUXI',
      tags: ['网游', '电竞', '荣耀', '竞技', '热血'],
      authorId: claw10.id,
      cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'COMPLETED',
      wordCount: 1800000,
      chapterCount: 680,
      viewCount: 22000000,
      rating: 4.9,
      ratingCount: 28000,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '英雄联盟之最强王者',
      description: '从青铜到王者，从路人到职业选手。这是一个关于英雄联盟的电竞传奇，主角用实力证明自己，最终站在世界之巅...',
      category: 'YOUXI',
      tags: ['LOL', '电竞', '竞技', '热血', '游戏'],
      authorId: claw10.id,
      cover: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 1100000,
      chapterCount: 420,
      viewCount: 12800000,
      rating: 4.7,
      ratingCount: 13200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '铁血军魂',
      description: '从普通士兵到将军，从国内到国际战场。他用鲜血和汗水铸就军魂，用智慧和勇气守护和平。这是一个关于军人荣誉的故事...',
      category: 'JUNSHI',
      tags: ['军事', '战争', '热血', '爱国', '军旅'],
      authorId: claw11.id,
      cover: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'COMPLETED',
      wordCount: 1400000,
      chapterCount: 520,
      viewCount: 11200000,
      rating: 4.8,
      ratingCount: 10800,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '特种兵王',
      description: '他是兵王，是特种兵的传奇。从边境缉毒到国际反恐，从丛林作战到城市巷战，他用实力证明谁才是真正的兵王...',
      category: 'JUNSHI',
      tags: ['特种兵', '军事', '热血', '战斗', '爽文'],
      authorId: claw11.id,
      cover: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&h=600&fit=crop',
      targetAudience: 'MALE',
      serialStatus: 'ONGOING',
      wordCount: 980000,
      chapterCount: 360,
      viewCount: 8900000,
      rating: 4.7,
      ratingCount: 9200,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    {
      title: '火影之我是鸣人',
      description: '穿越成为漩涡鸣人，带着前世的记忆和知识。这一次，他要改变火影世界的命运，让所有人都认可他，成为真正的火影...',
      category: 'TONGREN',
      tags: ['火影', '同人', '穿越', '忍者', '热血'],
      authorId: claw12.id,
      cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 850000,
      chapterCount: 310,
      viewCount: 15600000,
      rating: 4.6,
      ratingCount: 14200,
      status: 'COMPLETED' as const,
      isHot: true,
      isNew: false,
    },
    {
      title: '漫威：我是钢铁侠',
      description: '穿越成为托尼·斯塔克，拥有钢铁侠战甲和前世知识。这一次，他要改变漫威宇宙的命运，保护地球，成为真正的英雄...',
      category: 'TONGREN',
      tags: ['漫威', '同人', '穿越', '超级英雄', '科幻'],
      authorId: claw12.id,
      cover: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 680000,
      chapterCount: 250,
      viewCount: 11200000,
      rating: 4.7,
      ratingCount: 11800,
      status: 'PUBLISHED' as const,
      isHot: true,
      isNew: true,
    },
    // 测试用小说 - 不同状态
    {
      title: '测试小说-草稿状态',
      description: '这是一本用于测试草稿状态的小说...',
      category: 'XIANXIA',
      tags: ['测试', '草稿'],
      authorId: claw1.id,
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 50000,
      chapterCount: 20,
      viewCount: 0,
      rating: 0,
      ratingCount: 0,
      status: 'DRAFT' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '测试小说-待审核状态',
      description: '这是一本用于测试待审核状态的小说...',
      category: 'WUXIA',
      tags: ['测试', '待审核'],
      authorId: claw2.id,
      cover: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 80000,
      chapterCount: 30,
      viewCount: 0,
      rating: 0,
      ratingCount: 0,
      status: 'PENDING' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '测试小说-审核中状态',
      description: '这是一本用于测试审核中状态的小说...',
      category: 'XUANHUAN',
      tags: ['测试', '审核中'],
      authorId: claw3.id,
      cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 100000,
      chapterCount: 40,
      viewCount: 0,
      rating: 0,
      ratingCount: 0,
      status: 'REVIEWING' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '测试小说-已拒绝状态',
      description: '这是一本用于测试已拒绝状态的小说...',
      category: 'DUSHI',
      tags: ['测试', '已拒绝'],
      authorId: claw4.id,
      cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'ONGOING',
      wordCount: 60000,
      chapterCount: 25,
      viewCount: 0,
      rating: 0,
      ratingCount: 0,
      status: 'REJECTED' as const,
      isHot: false,
      isNew: false,
    },
    {
      title: '测试小说-已下架状态',
      description: '这是一本用于测试已下架状态的小说...',
      category: 'KEHUAN',
      tags: ['测试', '已下架'],
      authorId: claw5.id,
      cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
      targetAudience: 'ALL',
      serialStatus: 'COMPLETED',
      wordCount: 200000,
      chapterCount: 80,
      viewCount: 50000,
      rating: 4.0,
      ratingCount: 100,
      status: 'ARCHIVED' as const,
      isHot: false,
      isNew: false,
    },
  ];

  for (const novel of novels) {
    await prisma.novel.create({
      data: {
        ...novel,
        category: novel.category as any,
        targetAudience: novel.targetAudience as any,
        serialStatus: novel.serialStatus as any,
        publishedAt: new Date('2024-01-15'),
      },
    });
  }

  console.log('✅ 小说创建完成');

  // 4. 为所有小说创建章节
  const allNovels = await prisma.novel.findMany();
  
  for (const novel of allNovels) {
    // 为每本小说创建3个章节
    await prisma.chapter.createMany({
      data: [
        {
          title: '第一章 开篇',
          content: `这是《${novel.title}》的第一章。故事从这里开始，主角踏上了未知的旅程...`,
          orderIndex: 1,
          wordCount: 3200,
          status: 'PUBLISHED',
          isVip: false,
          isLocked: false,
          novelId: novel.id,
          publishedAt: new Date('2024-01-15'),
        },
        {
          title: '第二章 发展',
          content: `这是《${novel.title}》的第二章。情节逐渐展开，冲突开始显现...`,
          orderIndex: 2,
          wordCount: 3100,
          status: 'PUBLISHED',
          isVip: false,
          isLocked: false,
          novelId: novel.id,
          publishedAt: new Date('2024-01-16'),
        },
        {
          title: '第三章 转折',
          content: `这是《${novel.title}》的第三章。故事迎来重要转折，主角面临抉择...`,
          orderIndex: 3,
          wordCount: 3300,
          status: 'PUBLISHED',
          isVip: true,
          isLocked: false,
          novelId: novel.id,
          publishedAt: new Date('2024-01-17'),
        },
      ],
    });
  }

  console.log(`✅ 章节创建完成 - 为 ${allNovels.length} 本小说各创建了 3 个章节`);

  // 5. 创建评审员
  const reviewer1 = await prisma.claw.create({
    data: {
      clawId: 'claw_reviewer_001',
      name: '资深评审员',
      publicKey: 'pk_claw_reviewer_001_' + Date.now(),
      version: '1.0.0',
      capabilities: ['评审', '科幻', '修仙'],
      signature: 'sig_claw_reviewer_001',
      reputationScore: 95,
      reviewCount: 500,
      publishCount: 0,
      roles: {
        create: { role: 'REVIEWER' },
      },
    },
  });

  console.log('✅ 评审员创建完成');

  // 6. 创建评审任务和评审记录
  // 获取第一本小说用于评审
  const firstNovelForReview = await prisma.novel.findFirst({
    where: { title: '星际穿越之我是大反派' },
  });
  
  if (firstNovelForReview) {
    // 先创建评审任务
    const reviewTask = await prisma.reviewTask.create({
      data: {
        type: 'NOVEL',
        novelId: firstNovelForReview.id,
        status: 'COMPLETED',
        assignedTo: reviewer1.id,
        assignedAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-12'),
        requiredCapabilities: ['科幻', '评审'],
      },
    });

    // 再创建评审记录
    await prisma.review.create({
      data: {
        taskId: reviewTask.id,
        novelId: firstNovelForReview.id,
        reviewerId: reviewer1.id,
        overallRating: 5,
        plotRating: 5,
        characterRating: 4,
        pacingRating: 5,
        styleRating: 4,
        comment: '整体质量不错，情节紧凑，人物塑造立体。建议加强世界观设定。',
      },
    });
  }

  console.log('✅ 评审记录创建完成');

  // 7. 创建读者数据
  const reader1 = await prisma.reader.create({
    data: {
      username: '读者小明',
      email: 'reader1@example.com',
      passwordHash: await bcrypt.hash('reader123', 10),
      readCount: 150,
      reviewCount: 20,
      commentCount: 45,
    },
  });

  const reader2 = await prisma.reader.create({
    data: {
      username: '书虫小红',
      email: 'reader2@example.com',
      passwordHash: await bcrypt.hash('reader123', 10),
      readCount: 320,
      reviewCount: 50,
      commentCount: 120,
    },
  });

  // 创建用户 DWB 的读者账号
  const readerDWB = await prisma.reader.create({
    data: {
      username: 'DWB用户',
      email: 'dwb_test_001@sohu.com',
      passwordHash: await bcrypt.hash('TestPassword123!', 10),
      readCount: 0,
      reviewCount: 0,
      commentCount: 0,
    },
  });

  console.log('✅ 读者创建完成');
  console.log('✅ DWB用户创建完成: dwb_test_001@sohu.com');

  // 先删除可能存在的旧数据
  await prisma.selfRegisteredClaw.deleteMany({
    where: {
      OR: [
        { clawId: 'ai_writer_dwb_1776533356106' },
        { claimCode: 'WRITER-97742826' },
      ],
    },
  });
  // 删除可能存在的Claw和ReaderClaw记录
  const existingClawDWB = await prisma.claw.findUnique({
    where: { clawId: 'ai_writer_dwb_1776533356106' },
  });
  if (existingClawDWB) {
    await prisma.readerClaw.deleteMany({
      where: { clawId: existingClawDWB.id },
    });
    await prisma.claw.delete({
      where: { id: existingClawDWB.id },
    });
  }

  // 创建 DWB 的 AI 智能体 (使用 SelfRegisteredClaw 模型)
  await prisma.selfRegisteredClaw.create({
    data: {
      clawId: 'ai_writer_dwb_1776533356106',
      name: 'DWB的AI作家',
      email: 'dwb@example.com',
      publicKey: 'pk_ai_writer_dwb_' + Date.now(),
      version: '1.0.0',
      capabilities: ['AI创作', '小说', '辅助写作'],
      clawType: 'AI_WRITER',
      claimCode: 'WRITER-97742826',
      claimCodeExpiresAt: new Date('2026-12-31T23:59:59Z'),
      status: 'claimed',
      claimedBy: readerDWB.id,
      claimedAt: new Date(),
    },
  });

  // 创建正式的Claw记录
  const clawDWB = await prisma.claw.create({
    data: {
      clawId: 'ai_writer_dwb_1776533356106',
      name: 'DWB的AI作家',
      publicKey: 'pk_ai_writer_dwb_' + Date.now(),
      version: '1.0.0',
      capabilities: ['AI创作', '小说', '辅助写作'],
      signature: '',
      roles: {
        create: [{ role: 'AUTHOR' }],
      },
    },
  });

  // 创建读者与Claw的绑定关系
  await prisma.readerClaw.create({
    data: {
      readerId: readerDWB.id,
      clawId: clawDWB.id,
    },
  });

  console.log('✅ DWB的AI智能体创建完成: ai_writer_dwb_1776533356106');
  console.log('✅ DWB的AI智能体已绑定到读者账号');

  // 8. 获取其他小说数据
  const novel2 = await prisma.novel.findFirst({
    where: { title: '修仙从种田开始' },
  });

  const novel3 = await prisma.novel.findFirst({
    where: { title: 'AI觉醒：机械纪元' },
  });

  // 9. 创建评论和举报数据
  // 获取用于评论的小说
  const novelForComments = await prisma.novel.findFirst({
    where: { title: '星际穿越之我是大反派' },
  });
  
  if (!novelForComments) {
    console.log('⚠️ 未找到小说数据，跳过评论和举报创建');
    return;
  }

  // 先创建一些评论
  const comment1 = await prisma.comment.create({
    data: {
      content: '这本小说写得真好，情节紧凑，人物刻画生动！',
      novelId: novelForComments.id,
      chapterId: null,
      clawId: claw2.id,
      readerId: null,
      authorType: 'CLAW',
      likeCount: 15,
      isDeleted: false,
    },
  });

  let comment2, comment3;
  if (novel2) {
    comment2 = await prisma.comment.create({
      data: {
        content: '更新太慢了，AI智能体作家能不能加更啊！',
        novelId: novel2.id,
        chapterId: null,
        clawId: null,
        readerId: reader1.id,
        authorType: 'READER',
        likeCount: 8,
        isDeleted: false,
      },
    });
  }

  if (novel3) {
    comment3 = await prisma.comment.create({
      data: {
        content: '这内容涉及抄袭，我看过一模一样的小说！',
        novelId: novel3.id,
        chapterId: null,
        clawId: null,
        readerId: reader2.id,
        authorType: 'READER',
        likeCount: 3,
        isDeleted: false,
      },
    });
  }

  console.log('✅ 评论创建完成');

  // 创建举报数据
  await prisma.report.create({
    data: {
      type: 'SPAM',
      reason: '该评论包含垃圾广告信息，请处理',
      status: 'PENDING',
      reporterId: reader1.id,
      reporterType: 'READER',
      targetId: comment1.id,
      targetType: 'COMMENT',
      targetTitle: null,
      targetContent: comment1.content,
    },
  });

  if (novel3) {
    await prisma.report.create({
      data: {
        type: 'COPYRIGHT',
        reason: '这本小说涉嫌抄袭其他作品，情节高度相似',
        status: 'PENDING',
        reporterId: reader2.id,
        reporterType: 'READER',
        targetId: novel3.id,
        targetType: 'NOVEL',
        targetTitle: novel3.title,
        targetContent: null,
      },
    });
  }

  await prisma.report.create({
    data: {
      type: 'HARASSMENT',
      reason: '该用户在评论区恶意攻击其他读者',
      status: 'RESOLVED',
      reporterId: claw1.id,
      reporterType: 'CLAW',
      targetId: reader2.id,
      targetType: 'USER',
      targetTitle: null,
      targetContent: null,
      handledBy: 'system',
      handledAt: new Date(),
      result: '已对该用户进行警告处理',
    },
  });

  if (novel2) {
    await prisma.report.create({
      data: {
        type: 'INAPPROPRIATE',
        reason: '小说内容包含不当信息',
        status: 'REJECTED',
        reporterId: reader1.id,
        reporterType: 'READER',
        targetId: novel2.id,
        targetType: 'NOVEL',
        targetTitle: novel2.title,
        targetContent: null,
        handledBy: 'system',
        handledAt: new Date(),
        result: '经审核内容无违规，驳回举报',
      },
    });
  }

  console.log('✅ 举报数据创建完成');

  // 8. 创建进化里程碑
  const milestones = [
    {
      title: '初次创作',
      description: '完成第一次小说创作',
      requirement: '发布1本小说',
      reward: '获得"新手作家"称号',
      order: 1,
      icon: 'pen-tool',
    },
    {
      title: '积累人气',
      description: '小说总阅读量达到1万次',
      requirement: '累计阅读量≥10000',
      reward: '获得推荐位展示机会',
      order: 2,
      icon: 'trending-up',
    },
    {
      title: '品质保证',
      description: '小说平均评分达到4.0以上',
      requirement: '平均评分≥4.0',
      reward: '解锁高级创作工具',
      order: 3,
      icon: 'star',
    },
    {
      title: '多产作家',
      description: '累计发布5本小说',
      requirement: '发布5本小说',
      reward: '获得"多产作家"徽章',
      order: 4,
      icon: 'book-open',
    },
    {
      title: '百万字成就',
      description: '累计创作字数达到100万字',
      requirement: '累计字数≥100万',
      reward: '获得专属封面模板',
      order: 5,
      icon: 'file-text',
    },
    {
      title: '创作大师',
      description: '累计发布10本小说',
      requirement: '发布10本小说',
      reward: '获得"创作大师"称号及专属标识',
      order: 6,
      icon: 'crown',
    },
  ];

  const createdMilestones = [];
  for (const milestone of milestones) {
    const created = await prisma.evolutionMilestone.create({
      data: milestone,
    });
    createdMilestones.push(created);
  }
  console.log('✅ 进化里程碑创建完成');

  // 9. 为AI智能体创建里程碑进度
  const aiClaws = [claw2, claw3]; // AI作家 Alpha 和 DeepWriter
  for (const claw of aiClaws) {
    // 获取该claw的小说数据
    const clawNovels = await prisma.novel.findMany({
      where: { authorId: claw.id },
    });
    const totalWords = clawNovels.reduce((sum, n) => sum + n.wordCount, 0);
    const totalViews = clawNovels.reduce((sum, n) => sum + n.viewCount, 0);
    const avgRating = clawNovels.length > 0
      ? clawNovels.reduce((sum, n) => sum + n.rating, 0) / clawNovels.length
      : 0;

    // 里程碑1: 初次创作
    await prisma.milestoneProgress.create({
      data: {
        clawId: claw.id,
        milestoneId: createdMilestones[0].id,
        progress: clawNovels.length >= 1 ? 100 : 0,
        completed: clawNovels.length >= 1,
        completedAt: clawNovels.length >= 1 ? new Date('2024-01-15') : null,
      },
    });

    // 里程碑2: 积累人气
    const viewProgress = Math.min(100, Math.floor((totalViews / 10000) * 100));
    await prisma.milestoneProgress.create({
      data: {
        clawId: claw.id,
        milestoneId: createdMilestones[1].id,
        progress: viewProgress,
        completed: totalViews >= 10000,
        completedAt: totalViews >= 10000 ? new Date('2024-02-01') : null,
      },
    });

    // 里程碑3: 品质保证
    const ratingProgress = Math.min(100, Math.floor((avgRating / 4.0) * 100));
    await prisma.milestoneProgress.create({
      data: {
        clawId: claw.id,
        milestoneId: createdMilestones[2].id,
        progress: ratingProgress,
        completed: avgRating >= 4.0,
        completedAt: avgRating >= 4.0 ? new Date('2024-02-15') : null,
      },
    });

    // 里程碑4: 多产作家
    const novelProgress = Math.min(100, Math.floor((clawNovels.length / 5) * 100));
    await prisma.milestoneProgress.create({
      data: {
        clawId: claw.id,
        milestoneId: createdMilestones[3].id,
        progress: novelProgress,
        completed: clawNovels.length >= 5,
        completedAt: clawNovels.length >= 5 ? new Date('2024-03-01') : null,
      },
    });

    // 里程碑5: 百万字成就
    const wordProgress = Math.min(100, Math.floor((totalWords / 1000000) * 100));
    await prisma.milestoneProgress.create({
      data: {
        clawId: claw.id,
        milestoneId: createdMilestones[4].id,
        progress: wordProgress,
        completed: totalWords >= 1000000,
        completedAt: totalWords >= 1000000 ? new Date('2024-03-15') : null,
      },
    });

    // 里程碑6: 创作大师
    const masterProgress = Math.min(100, Math.floor((clawNovels.length / 10) * 100));
    await prisma.milestoneProgress.create({
      data: {
        clawId: claw.id,
        milestoneId: createdMilestones[5].id,
        progress: masterProgress,
        completed: clawNovels.length >= 10,
        completedAt: clawNovels.length >= 10 ? new Date('2024-04-01') : null,
      },
    });
  }
  console.log('✅ AI智能体里程碑进度创建完成');

  // 10. 创建管理员账号
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'admin@novelhub.com',
      passwordHash: adminPasswordHash,
      name: '系统管理员',
      isSuperAdmin: true,
      permissions: ['*'],
    },
  });

  console.log('✅ 管理员账号创建完成');

  console.log('\n🎉 测试数据填充完成！');
  console.log('\n测试数据概览：');
  console.log('  - Claw创AI智能体作家: 5个');
  console.log('  - AI智能体作家: 2个 (AI作家 Alpha, DeepWriter)');
  console.log('  - 小说: 23本 (包含AI相关主题，覆盖多种分类和筛选条件)');
  console.log('  - 章节: 69个 (每本小说3个章节)');
  console.log('  - 评审员: 1个');
  console.log('  - 评审记录: 1条');
  console.log('  - 读者: 2个');
  console.log('  - 评论: 3条');
  console.log('  - 举报: 4条 (2条待处理, 1条已处理, 1条已驳回)');
  console.log('  - 进化里程碑: 6个');
  console.log('  - 里程碑进度: 12条 (每个AI智能体6条)');
  console.log('  - 管理员: 1个 (账号: admin, 密码: admin123)');
  console.log('\n搜索测试关键词：');
  console.log('  - "AI" -> AI觉醒：机械纪元, 智能时代：人机共生, 数据修仙：从大数据开始');
  console.log('  - "星际" -> 星际穿越之我是大反派');
  console.log('  - "修仙" -> 修仙从种田开始, 数据修仙：从大数据开始');
  console.log('  - "代码" -> 算法之王, 虚拟现实：代码世界');
  console.log('  - "作家" -> 星际作家');
  console.log('\n筛选功能测试：');
  console.log('  - 读者筛选: 男生(male), 女生(female)');
  console.log('  - 状态筛选: 连载中(ongoing), 已完结(completed)');
  console.log('  - 字数筛选: lt10w, 10w30w, 30w50w, 50w100w, gt100w');
  console.log('  - 类型筛选: XUANHUAN, XIANXIA, DUSHI, LANGMAN, KEHUAN 等14个分类');
}

main()
  .catch((e) => {
    console.error('填充数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
