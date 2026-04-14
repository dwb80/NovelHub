/**
 * NovelHub 智能推荐算法模块
 * 提供基于用户行为、内容特征和协同过滤的推荐功能
 * @version 1.0.0
 */

// 推荐算法配置
const RECOMMENDATION_CONFIG = {
    // 权重配置
    weights: {
        viewHistory: 0.25,      // 浏览历史权重
        categoryPreference: 0.20, // 分类偏好权重
        ratingScore: 0.15,      // 评分权重
        popularity: 0.15,       // 热度权重
        recency: 0.15,          // 时效性权重
        diversity: 0.10         // 多样性权重
    },
    // 算法参数
    params: {
        maxRecommendations: 12,     // 最大推荐数量
        minScoreThreshold: 0.3,     // 最低推荐分数阈值
        timeDecayFactor: 0.95,      // 时间衰减因子
        categoryDiversityRatio: 0.3 // 分类多样性比例
    }
};

/**
 * 用户画像类 - 管理用户偏好和阅读历史
 */
class UserProfile {
    constructor() {
        this.readingHistory = this.loadReadingHistory();
        this.categoryPreferences = this.loadCategoryPreferences();
        this.tagPreferences = this.loadTagPreferences();
        this.authorPreferences = this.loadAuthorPreferences();
    }

    // 从 localStorage 加载阅读历史
    loadReadingHistory() {
        try {
            const saved = localStorage.getItem('novelhub_reading_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    // 加载分类偏好
    loadCategoryPreferences() {
        try {
            const saved = localStorage.getItem('novelhub_category_preferences');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    // 加载标签偏好
    loadTagPreferences() {
        try {
            const saved = localStorage.getItem('novelhub_tag_preferences');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    // 加载作者偏好
    loadAuthorPreferences() {
        try {
            const saved = localStorage.getItem('novelhub_author_preferences');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    // 记录阅读行为
    recordReading(novel) {
        const record = {
            novelId: novel.id,
            category: novel.category,
            tags: novel.tags,
            author: novel.author,
            timestamp: Date.now(),
            duration: 0 // 阅读时长，需要外部更新
        };

        this.readingHistory.unshift(record);
        // 只保留最近100条记录
        this.readingHistory = this.readingHistory.slice(0, 100);
        
        // 更新偏好
        this.updatePreferences(record);
        this.save();
    }

    // 更新偏好统计
    updatePreferences(record) {
        // 更新分类偏好
        this.categoryPreferences[record.category] = 
            (this.categoryPreferences[record.category] || 0) + 1;

        // 更新标签偏好（添加安全检查）
        if (record.tags && Array.isArray(record.tags)) {
            record.tags.forEach(tag => {
                this.tagPreferences[tag] = (this.tagPreferences[tag] || 0) + 1;
            });
        }

        // 更新作者偏好
        this.authorPreferences[record.author] = 
            (this.authorPreferences[record.author] || 0) + 1;
    }

    // 保存到 localStorage
    save() {
        localStorage.setItem('novelhub_reading_history', JSON.stringify(this.readingHistory));
        localStorage.setItem('novelhub_category_preferences', JSON.stringify(this.categoryPreferences));
        localStorage.setItem('novelhub_tag_preferences', JSON.stringify(this.tagPreferences));
        localStorage.setItem('novelhub_author_preferences', JSON.stringify(this.authorPreferences));
    }

    // 获取最偏好的分类
    getTopCategories(limit = 3) {
        return Object.entries(this.categoryPreferences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([category]) => category);
    }

    // 获取最偏好的标签
    getTopTags(limit = 5) {
        return Object.entries(this.tagPreferences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag]) => tag);
    }
}

/**
 * 内容相似度计算
 */
class ContentSimilarity {
    // 计算两个小说之间的相似度
    static calculate(novelA, novelB) {
        let score = 0;
        
        // 分类相同加分
        if (novelA.category === novelB.category) {
            score += 0.4;
        }
        
        // 标签相似度 (Jaccard 系数)
        const tagsA = new Set(novelA.tags);
        const tagsB = new Set(novelB.tags);
        const intersection = new Set([...tagsA].filter(x => tagsB.has(x)));
        const union = new Set([...tagsA, ...tagsB]);
        const tagSimilarity = intersection.size / union.size;
        score += tagSimilarity * 0.3;
        
        // 评分相似度
        const ratingDiff = Math.abs(novelA.rating - novelB.rating);
        const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5);
        score += ratingSimilarity * 0.1;
        
        // 字数相似度 (对数尺度)
        const wordCountA = Math.log10(novelA.wordCount + 1);
        const wordCountB = Math.log10(novelB.wordCount + 1);
        const wordCountDiff = Math.abs(wordCountA - wordCountB);
        const wordCountSimilarity = Math.max(0, 1 - wordCountDiff / 2);
        score += wordCountSimilarity * 0.2;
        
        return score;
    }

    // 基于内容的推荐
    static getSimilarNovels(targetNovel, allNovels, limit = 5) {
        return allNovels
            .filter(n => n.id !== targetNovel.id)
            .map(novel => ({
                novel,
                similarity: this.calculate(targetNovel, novel)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.novel);
    }
}

/**
 * 推荐引擎主类
 */
class RecommendationEngine {
    constructor(novels) {
        this.novels = novels;
        this.userProfile = new UserProfile();
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
    }

    // 获取个性化推荐
    getPersonalizedRecommendations(userId = null, limit = 12) {
        const cacheKey = `personalized_${userId}_${limit}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // 如果没有用户历史，返回热门推荐
        if (this.userProfile.readingHistory.length === 0) {
            const recommendations = this.getPopularRecommendations(limit);
            this.setCache(cacheKey, recommendations);
            return recommendations;
        }

        // 计算每本小说的推荐分数
        const scoredNovels = this.novels.map(novel => ({
            novel,
            score: this.calculateRecommendationScore(novel)
        }));

        // 过滤已读小说
        const readNovelIds = new Set(this.userProfile.readingHistory.map(h => h.novelId));
        const filteredNovels = scoredNovels.filter(item => !readNovelIds.has(item.novel.id));

        // 排序并获取前N个
        const recommendations = filteredNovels
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.novel);

        // 确保多样性
        const diversified = this.ensureDiversity(recommendations, limit);
        
        this.setCache(cacheKey, diversified);
        return diversified;
    }

    // 计算推荐分数
    calculateRecommendationScore(novel) {
        const config = RECOMMENDATION_CONFIG.weights;
        let score = 0;

        // 1. 基于浏览历史的协同过滤分数
        score += this.calculateCollaborativeScore(novel) * config.viewHistory;

        // 2. 分类偏好分数
        score += this.calculateCategoryScore(novel) * config.categoryPreference;

        // 3. 评分分数
        score += (novel.rating / 5) * config.ratingScore;

        // 4. 热度分数 (使用对数尺度)
        const popularityScore = Math.log10(novel.todayViews + 1) / Math.log10(100000);
        score += Math.min(popularityScore, 1) * config.popularity;

        // 5. 时效性分数
        score += this.calculateRecencyScore(novel) * config.recency;

        return score;
    }

    // 计算协同过滤分数
    calculateCollaborativeScore(novel) {
        let score = 0;
        let totalWeight = 0;

        this.userProfile.readingHistory.forEach(record => {
            const timeWeight = Math.pow(
                RECOMMENDATION_CONFIG.params.timeDecayFactor,
                (Date.now() - record.timestamp) / (24 * 60 * 60 * 1000)
            );

            // 分类匹配
            if (record.category === novel.category) {
                score += 0.6 * timeWeight;
            }

            // 标签匹配（添加安全检查）
            if (record.tags && Array.isArray(record.tags) && novel.tags && Array.isArray(novel.tags)) {
                const matchedTags = record.tags.filter(tag => novel.tags.includes(tag));
                const maxTags = Math.max(record.tags.length, novel.tags.length);
                score += (matchedTags.length / maxTags) * 0.4 * timeWeight;
            }

            totalWeight += timeWeight;
        });

        return totalWeight > 0 ? score / totalWeight : 0;
    }

    // 计算分类偏好分数
    calculateCategoryScore(novel) {
        const categoryCount = this.userProfile.categoryPreferences[novel.category] || 0;
        const totalReads = this.userProfile.readingHistory.length;
        return totalReads > 0 ? categoryCount / totalReads : 0;
    }

    // 计算时效性分数
    calculateRecencyScore(novel) {
        const now = Date.now();
        const publishTime = new Date(novel.published_at).getTime();
        const daysSincePublish = (now - publishTime) / (24 * 60 * 60 * 1000);
        
        if (novel.isNew) {
            return 1.0;
        } else if (daysSincePublish < 30) {
            return 0.8;
        } else if (daysSincePublish < 90) {
            return 0.6;
        } else if (daysSincePublish < 180) {
            return 0.4;
        } else {
            return 0.2;
        }
    }

    // 确保推荐多样性
    ensureDiversity(recommendations, limit) {
        const categoryCount = {};
        const diversified = [];
        const maxPerCategory = Math.ceil(limit * (1 - RECOMMENDATION_CONFIG.params.categoryDiversityRatio));

        for (const novel of recommendations) {
            const category = novel.category;
            categoryCount[category] = (categoryCount[category] || 0) + 1;

            if (categoryCount[category] <= maxPerCategory) {
                diversified.push(novel);
            }

            if (diversified.length >= limit) break;
        }

        // 如果多样性过滤后数量不足，补充其他小说
        if (diversified.length < limit) {
            const existingIds = new Set(diversified.map(n => n.id));
            const extras = this.novels
                .filter(n => !existingIds.has(n.id))
                .slice(0, limit - diversified.length);
            diversified.push(...extras);
        }

        return diversified;
    }

    // 获取热门推荐
    getPopularRecommendations(limit = 10) {
        return [...this.novels]
            .sort((a, b) => b.todayViews - a.todayViews)
            .slice(0, limit);
    }

    // 获取新书推荐
    getNewNovelRecommendations(limit = 10) {
        return this.novels
            .filter(n => n.isNew)
            .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
            .slice(0, limit);
    }

    // 获取同类推荐
    getSimilarRecommendations(novelId, limit = 5) {
        const targetNovel = this.novels.find(n => n.id === novelId);
        if (!targetNovel) return [];

        return ContentSimilarity.getSimilarNovels(targetNovel, this.novels, limit);
    }

    // 获取"猜你喜欢"推荐
    getGuessYouLike(limit = 6) {
        const topCategories = this.userProfile.getTopCategories(2);
        
        if (topCategories.length === 0) {
            return this.getPopularRecommendations(limit);
        }

        // 从偏好分类中随机选择
        const candidates = this.novels.filter(n => 
            topCategories.includes(n.category) && 
            !this.userProfile.readingHistory.some(h => h.novelId === n.id)
        );

        // 随机打乱并选择
        return this.shuffleArray(candidates).slice(0, limit);
    }

    // 获取每日推荐
    getDailyRecommendations(limit = 5) {
        const today = new Date().toDateString();
        const cacheKey = `daily_${today}`;
        
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // 结合热度、评分和新书
        const scored = this.novels.map(novel => ({
            novel,
            score: (novel.rating / 5) * 0.4 + 
                   Math.min(Math.log10(novel.todayViews + 1) / 5, 0.4) +
                   (novel.isNew ? 0.2 : 0)
        }));

        const recommendations = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.novel);

        this.setCache(cacheKey, recommendations);
        return recommendations;
    }

    // 缓存管理
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // 工具函数：数组随机打乱
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RecommendationEngine,
        UserProfile,
        ContentSimilarity,
        RECOMMENDATION_CONFIG
    };
}

// 浏览器环境挂载到全局
if (typeof window !== 'undefined') {
    window.NovelHubRecommendation = {
        RecommendationEngine,
        UserProfile,
        ContentSimilarity,
        RECOMMENDATION_CONFIG
    };
}
