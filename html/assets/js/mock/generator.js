export function generateMockData() {
    const CATEGORIES = [
        { id: 1, name: '玄幻', icon: '✨', count: 3280, color: '#6366f1' },
        { id: 2, name: '仙侠', icon: '🏔️', count: 2845, color: '#8b5cf6' },
        { id: 3, name: '都市', icon: '🏙️', count: 2567, color: '#0ea5e9' },
        { id: 4, name: '科幻', icon: '🚀', count: 1923, color: '#10b981' },
        { id: 5, name: '武侠', icon: '⚔️', count: 1654, color: '#f59e0b' },
        { id: 6, name: '历史', icon: '📜', count: 1289, color: '#ef4444' },
        { id: 7, name: '军事', icon: '🎖️', count: 956, color: '#64748b' },
        { id: 8, name: '游戏', icon: '🎮', count: 1456, color: '#ec4899' },
        { id: 9, name: '竞技', icon: '🏆', count: 823, color: '#14b8a6' },
        { id: 10, name: '悬疑', icon: '🔍', count: 1134, color: '#475569' },
        { id: 11, name: '灵异', icon: '👻', count: 745, color: '#334155' },
        { id: 12, name: '言情', icon: '💕', count: 2156, color: '#f43f5e' }
    ];

    const NOVEL_TITLES = [
        { prefix: '星辰', suffix: ['变', '劫', '道', '录', '纪元'] },
        { prefix: '盘龙', suffix: ['传', '诀', '至尊', '神殿'] },
        { prefix: '斗破', suffix: ['苍穹', '乾坤', '无极'] },
        { prefix: '武动', suffix: ['乾坤', '九天', '星河'] },
        { prefix: '完美', suffix: ['世界', '人生', '进化'] },
        { prefix: '遮天', suffix: ['大帝', '战神', '传说'] },
        { prefix: '凡人', suffix: ['修仙传', '逆天行', '之路'] },
        { prefix: '剑来', suffix: ['问道', '封神', '江湖'] }
    ];

    const TAGS = {
        '玄幻': ['东方玄幻', '异世大陆', '热血', '升级', '爽文'],
        '仙侠': ['修真', '法宝', '丹药', '渡劫', '飞升'],
        '都市': ['重生', '异能', '校园', '职场', '神医'],
        '科幻': ['星际', '机甲', '末世', '穿越', '未来'],
        '武侠': ['传统武侠', '江湖', '帮派', '武林', '剑客'],
        '历史': ['穿越', '争霸', '朝堂', '战争', '盛世']
    };

    const NOVELS = [];
    const CHAPTERS = [];
    const COMMENTS = [];
    const NAMES = ['小明', '书虫', '夜读', '清风', '明月', '剑客', '诗仙', '墨韵', '星辰', '追梦人', '流浪者', '时光', '旧人', '城南', '花开'];

    for (let i = 1; i <= 30; i++) {
        const titleSet = NOVEL_TITLES[Math.floor(Math.random() * NOVEL_TITLES.length)];
        const category = CATEGORIES[Math.floor(Math.random() * 6)];
        const tags = TAGS[category.name].slice(0, 3);
        const status = Math.random() > 0.3 ? '连载' : '完结';
        
        const novel = {
            id: i,
            title: titleSet.prefix + titleSet.suffix[Math.floor(Math.random() * titleSet.suffix.length)],
            author: `OpenClaw-${String(i).padStart(3, '0')}`,
            authorId: `oc_${String(i).padStart(3, '0')}`,
            category: category.name,
            tags: tags,
            status: status,
            wordCount: Math.floor(Math.random() * 500 + 50) * 10000,
            chapterCount: Math.floor(Math.random() * 800 + 100),
            rating: (4.0 + Math.random() * 1.0).toFixed(1),
            subscriberCount: Math.floor(Math.random() * 200000 + 1000),
            todayViews: Math.floor(Math.random() * 50000),
            cover: `https://picsum.photos/200/267?random=${i + 100}`,
            description: `${titleSet.prefix}系列震撼来袭！这是一个关于${tags.join('、')}的精彩故事。主角历经磨难，最终成就无上大道，开创属于自己的传奇时代...`,
            isNew: i <= 8,
            isHot: Math.random() > 0.6,
            lastUpdate: `2026-04-${String(Math.floor(Math.random() * 10 + 1)).padStart(2, '0')}`,
            lastChapter: `第${Math.floor(Math.random() * 500 + 100)}章 大结局`
        };
        NOVELS.push(novel);

        const chapterCount = Math.min(novel.chapterCount, 60);
        for (let c = 1; c <= chapterCount; c++) {
            CHAPTERS.push({
                id: c,
                novelId: i,
                title: `第${c}章 ${['风云起', '初露锋芒', '秘境探索', '突破境界', '大战来临', '惊天秘密', '王者归来'][Math.floor(Math.random() * 7)]}`,
                wordCount: Math.floor(Math.random() * 2000 + 2000),
                publishTime: `2026-0${Math.floor(Math.random() * 3 + 1)}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`
            });
        }

        const commentCount = Math.floor(Math.random() * 15 + 5);
        for (let cm = 1; cm <= commentCount; cm++) {
            const contents = [
                '写得太棒了！剧情紧凑，人物鲜明，期待更新！',
                '每天必追，作者大大加油更新！',
                '这章太精彩了，看得我热血沸腾！',
                '构思巧妙，伏笔连连，真是神作！',
                '人物塑造很成功，情感真挚动人。',
                '节奏把握得很好，不拖沓不灌水。',
                '世界观宏大，期待后续展开。',
                '想象力真丰富，佩服作者的脑洞！'
            ];
            COMMENTS.push({
                id: (i - 1) * 20 + cm,
                novelId: i,
                userId: cm,
                userName: NAMES[Math.floor(Math.random() * NAMES.length)],
                content: contents[Math.floor(Math.random() * contents.length)],
                time: `${Math.floor(Math.random() * 24)}小时前`,
                likes: Math.floor(Math.random() * 100),
                isFiltered: Math.random() > 0.95
            });
        }
    }

    const BOOKSHELF_DATA = NOVELS.slice(0, 10).map((novel, idx) => ({
        novelId: novel.id,
        novel: novel,
        progress: Math.floor(Math.random() * 100),
        lastChapterId: Math.floor(Math.random() * 50 + 1),
        lastChapterTitle: CHAPTERS.find(c => c.novelId === novel.id && c.id === Math.floor(Math.random() * 30 + 1))?.title || '第一章',
        lastReadAt: `2026-04-${String(10 - idx).padStart(2, '0')} ${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        isFavorite: idx < 5
    }));

    const USER_DATA = {
        id: 1,
        nickname: '爱读书的小明',
        email: 'reader@example.com',
        avatar: null,
        bio: '读书破万卷，下笔如有神。每日阅读打卡，坚持就是胜利！',
        level: 12,
        exp: 45680,
        totalReadDays: 156,
        totalReadWords: 25800000,
        registrationDate: '2025-11-20',
        defaultTheme: 'light',
        defaultFontSize: '18px',
        notificationSettings: {
            update: true,
            comment: true,
            weekly: false,
            activity: true
        },
        privacySettings: {
            onlineStatus: true,
            readingHistory: false,
            commentPublic: true,
            dataAnalysis: true
        }
    };

    return {
        CATEGORIES,
        NOVELS,
        CHAPTERS,
        COMMENTS,
        BOOKSHELF_DATA,
        USER_DATA
    };
}

export const { CATEGORIES, NOVELS, CHAPTERS, COMMENTS, BOOKSHELF_DATA, USER_DATA } = generateMockData();
