/**
 * NovelHub 阅读统计组件
 * 提供详细的阅读数据统计和可视化
 * @version 2.0.0
 */

class ReadingStats {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.config = {
            userId: null,
            ...options
        };

        this.stats = {
            totalReadDays: 0,
            totalReadWords: 0,
            totalReadBooks: 0,
            totalReadTime: 0, // 分钟
            dailyStats: {},
            categoryStats: {},
            hourlyStats: new Array(24).fill(0),
            weeklyStats: new Array(7).fill(0),
            monthlyStats: new Array(30).fill(0),
            streakDays: 0,
            longestStreak: 0,
            averageDailyWords: 0,
            favoriteCategory: null,
            peakReadingHour: null
        };

        this.init();
    }

    init() {
        this.loadStats();
        if (this.container) {
            this.render();
        }
    }

    // 加载统计数据
    loadStats() {
        try {
            const saved = localStorage.getItem('novelhub_reading_stats');
            if (saved) {
                const data = JSON.parse(saved);
                this.stats = { ...this.stats, ...data };
            }
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('加载阅读统计失败:', e.message);
            }
        }

        // 从阅读历史计算补充数据
        this.calculateFromHistory();
    }

    // 从阅读历史计算统计数据
    calculateFromHistory() {
        if (!window.MockData || !window.MockData.READING_HISTORY) return;

        const history = window.MockData.READING_HISTORY;
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // 计算总阅读天数
        const readDates = new Set(history.map(h => h.readAt.split(' ')[0]));
        this.stats.totalReadDays = readDates.size;

        // 计算总阅读字数
        this.stats.totalReadWords = history.reduce((sum, h) => {
            return sum + (h.readDuration * 300); // 假设每分钟300字
        }, 0);

        // 计算阅读书籍数
        const readBooks = new Set(history.map(h => h.novelId));
        this.stats.totalReadBooks = readBooks.size;

        // 计算总阅读时长
        this.stats.totalReadTime = history.reduce((sum, h) => sum + (h.readDuration || 0), 0);

        // 计算连续阅读天数
        this.calculateStreak(Array.from(readDates).sort());

        // 计算分类统计
        this.calculateCategoryStats(history);

        // 计算时段统计
        this.calculateHourlyStats(history);

        // 计算日均阅读字数
        this.stats.averageDailyWords = this.stats.totalReadDays > 0 
            ? Math.floor(this.stats.totalReadWords / this.stats.totalReadDays)
            : 0;
    }

    // 计算连续阅读天数
    calculateStreak(dates) {
        if (dates.length === 0) {
            this.stats.streakDays = 0;
            this.stats.longestStreak = 0;
            return;
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let lastDate = null;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 检查今天是否阅读
        const hasReadToday = dates.includes(today);
        const hasReadYesterday = dates.includes(yesterday);

        if (hasReadToday) {
            currentStreak = 1;
            lastDate = new Date(today);
        } else if (hasReadYesterday) {
            currentStreak = 1;
            lastDate = new Date(yesterday);
        }

        // 计算当前连续天数
        for (let i = dates.length - 1; i >= 0; i--) {
            const date = new Date(dates[i]);
            
            if (lastDate) {
                const diffDays = Math.floor((lastDate - date) / 86400000);
                if (diffDays === 1) {
                    currentStreak++;
                    lastDate = date;
                } else if (diffDays > 1) {
                    break;
                }
            }
        }

        // 计算最长连续天数
        let tempStreak = 1;
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = Math.floor((currDate - prevDate) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        this.stats.streakDays = currentStreak;
        this.stats.longestStreak = Math.max(longestStreak, currentStreak);
    }

    // 计算分类统计
    calculateCategoryStats(history) {
        const categoryCount = {};
        
        history.forEach(h => {
            if (h.novel && h.novel.category) {
                const category = h.novel.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        });

        this.stats.categoryStats = categoryCount;

        // 找出最喜欢的分类
        let maxCount = 0;
        let favoriteCategory = null;
        
        Object.entries(categoryCount).forEach(([category, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteCategory = category;
            }
        });

        this.stats.favoriteCategory = favoriteCategory;
    }

    // 计算时段统计
    calculateHourlyStats(history) {
        const hourlyStats = new Array(24).fill(0);

        history.forEach(h => {
            const hour = new Date(h.read_at).getHours();
            hourlyStats[hour]++;
        });

        this.stats.hourlyStats = hourlyStats;

        // 找出阅读高峰时段
        let maxCount = 0;
        let peakHour = null;
        
        hourlyStats.forEach((count, hour) => {
            if (count > maxCount) {
                maxCount = count;
                peakHour = hour;
            }
        });

        this.stats.peakReadingHour = peakHour;
    }

    // 记录阅读
    recordReading(novelId, chapterId, words, duration) {
        const today = new Date().toISOString().split('T')[0];
        
        // 更新每日统计
        if (!this.stats.dailyStats[today]) {
            this.stats.dailyStats[today] = {
                words: 0,
                duration: 0,
                chapters: 0
            };
        }

        this.stats.dailyStats[today].words += words;
        this.stats.dailyStats[today].duration += duration;
        this.stats.dailyStats[today].chapters += 1;

        // 更新总统计
        this.stats.totalReadWords += words;
        this.stats.totalReadTime += duration;

        // 更新时段统计
        const hour = new Date().getHours();
        this.stats.hourlyStats[hour]++;

        this.saveStats();
    }

    // 保存统计数据
    saveStats() {
        try {
            localStorage.setItem('novelhub_reading_stats', JSON.stringify(this.stats));
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('保存阅读统计失败:', e.message);
            }
        }
    }

    // 获取统计数据
    getStats() {
        return { ...this.stats };
    }

    // 获取本周统计
    getWeeklyStats() {
        const weekData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = this.stats.dailyStats[dateStr] || { words: 0, duration: 0 };
            
            weekData.push({
                date: dateStr,
                day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
                words: dayData.words,
                duration: dayData.duration
            });
        }

        return weekData;
    }

    // 获取阅读成就
    getAchievements() {
        const achievements = [];
        const stats = this.stats;

        // 连续阅读成就
        if (stats.streakDays >= 7) {
            achievements.push({
                id: 'streak_7',
                name: '持之以恒',
                description: '连续阅读7天',
                icon: '🔥',
                level: stats.streakDays >= 30 ? 3 : stats.streakDays >= 14 ? 2 : 1
            });
        }

        // 阅读量成就
        if (stats.totalReadWords >= 1000000) {
            achievements.push({
                id: 'words_1m',
                name: '百万字阅读者',
                description: '累计阅读超过100万字',
                icon: '📚',
                level: stats.totalReadWords >= 10000000 ? 3 : stats.totalReadWords >= 5000000 ? 2 : 1
            });
        }

        // 阅读天数成就
        if (stats.totalReadDays >= 30) {
            achievements.push({
                id: 'days_30',
                name: '月度阅读者',
                description: '累计阅读30天',
                icon: '📅',
                level: stats.totalReadDays >= 365 ? 3 : stats.totalReadDays >= 100 ? 2 : 1
            });
        }

        // 阅读书籍成就
        if (stats.totalReadBooks >= 10) {
            achievements.push({
                id: 'books_10',
                name: '博览群书',
                description: '阅读超过10本书',
                icon: '📖',
                level: stats.totalReadBooks >= 100 ? 3 : stats.totalReadBooks >= 50 ? 2 : 1
            });
        }

        // 夜猫子成就
        if (stats.peakReadingHour >= 22 || stats.peakReadingHour <= 4) {
            achievements.push({
                id: 'night_owl',
                name: '夜猫子',
                description: '深夜阅读达人',
                icon: '🦉',
                level: 1
            });
        }

        return achievements;
    }

    // 渲染统计面板
    render() {
        if (!this.container) return;

        const stats = this.getStats();
        const weeklyData = this.getWeeklyStats();
        const achievements = this.getAchievements();

        this.container.innerHTML = `
            <div class="reading-stats-panel">
                <div class="stats-overview">
                    <div class="stat-card primary">
                        <div class="stat-icon">📚</div>
                        <div class="stat-value">${this.formatNumber(stats.totalReadWords)}</div>
                        <div class="stat-label">阅读字数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📖</div>
                        <div class="stat-value">${stats.totalReadBooks}</div>
                        <div class="stat-label">阅读书籍</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-value">${stats.totalReadDays}</div>
                        <div class="stat-label">阅读天数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🔥</div>
                        <div class="stat-value">${stats.streakDays}</div>
                        <div class="stat-label">连续天数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">${this.formatDuration(stats.totalReadTime)}</div>
                        <div class="stat-label">阅读时长</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${this.formatNumber(stats.averageDailyWords)}</div>
                        <div class="stat-label">日均阅读</div>
                    </div>
                </div>

                <div class="stats-charts">
                    <div class="chart-container">
                        <h4 class="chart-title">本周阅读趋势</h4>
                        <div class="weekly-chart">
                            ${weeklyData.map(day => `
                                <div class="chart-bar-wrapper">
                                    <div class="chart-bar" style="height: ${this.calculateBarHeight(day.words)}%">
                                        <span class="chart-value">${this.formatCompactNumber(day.words)}</span>
                                    </div>
                                    <span class="chart-label">${day.day}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="chart-container">
                        <h4 class="chart-title">阅读时段分布</h4>
                        <div class="hourly-chart">
                            ${stats.hourlyStats.map((count, hour) => `
                                <div class="hourly-bar-wrapper" title="${hour}:00 - ${count}次">
                                    <div class="hourly-bar" style="height: ${this.calculateHourlyHeight(count)}%"></div>
                                    ${hour % 4 === 0 ? `<span class="hourly-label">${hour}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                ${Object.keys(stats.categoryStats).length > 0 ? `
                    <div class="category-stats">
                        <h4 class="stats-section-title">分类阅读统计</h4>
                        <div class="category-list">
                            ${Object.entries(stats.categoryStats)
                                .sort((a, b) => b[1] - a[1])
                                .map(([category, count]) => `
                                    <div class="category-item">
                                        <span class="category-name">${category}</span>
                                        <div class="category-bar-wrapper">
                                            <div class="category-bar" style="width: ${this.calculateCategoryWidth(count)}%"></div>
                                        </div>
                                        <span class="category-count">${count}次</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${achievements.length > 0 ? `
                    <div class="achievements-section">
                        <h4 class="stats-section-title">阅读成就 (${achievements.length})</h4>
                        <div class="achievements-grid">
                            ${achievements.map(achievement => `
                                <div class="achievement-card level-${achievement.level}">
                                    <div class="achievement-icon">${achievement.icon}</div>
                                    <div class="achievement-info">
                                        <div class="achievement-name">${achievement.name}</div>
                                        <div class="achievement-desc">${achievement.description}</div>
                                    </div>
                                    ${achievement.level > 1 ? `<div class="achievement-level">Lv.${achievement.level}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // 计算柱状图高度
    calculateBarHeight(words) {
        const maxWords = Math.max(...this.getWeeklyStats().map(d => d.words), 1);
        return Math.max((words / maxWords) * 100, 5);
    }

    // 计算时段图高度
    calculateHourlyHeight(count) {
        const maxCount = Math.max(...this.stats.hourlyStats, 1);
        return Math.max((count / maxCount) * 100, 2);
    }

    // 计算分类宽度
    calculateCategoryWidth(count) {
        const maxCount = Math.max(...Object.values(this.stats.categoryStats), 1);
        return (count / maxCount) * 100;
    }

    // 格式化数字
    formatNumber(num) {
        if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
        if (num >= 10000) return (num / 10000).toFixed(1) + '万';
        return num.toString();
    }

    // 格式化紧凑数字
    formatCompactNumber(num) {
        if (num >= 10000) return (num / 10000).toFixed(0) + 'w';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
        return num.toString();
    }

    // 格式化时长
    formatDuration(minutes) {
        if (minutes >= 1440) {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return `${days}天${hours}小时`;
        }
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}小时${mins}分钟`;
        }
        return `${minutes}分钟`;
    }

    // 导出统计数据
    exportStats() {
        return {
            exportDate: new Date().toISOString(),
            stats: this.stats,
            achievements: this.getAchievements()
        };
    }

    // 重置统计数据
    resetStats() {
        this.stats = {
            totalReadDays: 0,
            totalReadWords: 0,
            totalReadBooks: 0,
            totalReadTime: 0,
            dailyStats: {},
            categoryStats: {},
            hourlyStats: new Array(24).fill(0),
            weeklyStats: new Array(7).fill(0),
            monthlyStats: new Array(30).fill(0),
            streakDays: 0,
            longestStreak: 0,
            averageDailyWords: 0,
            favoriteCategory: null,
            peakReadingHour: null
        };
        this.saveStats();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReadingStats;
}

if (typeof window !== 'undefined') {
    window.ReadingStats = ReadingStats;
}
