/**
 * Reading Progress Service
 * NovelHub - 阅读进度管理服务
 * 支持本地存储、云端同步、恢复阅读进度、阅读统计
 * @version 2.0.0
 */

class ReadingProgressService {
    constructor() {
        // 存储键名
        this.STORAGE_KEY = 'novelhub_reading_progress';
        this.STATS_KEY = 'novelhub_reading_stats';
        this.BOOKMARKS_KEY = 'novelhub_bookmarks';
        this.HIGHLIGHTS_KEY = 'novelhub_highlights';
        this.HISTORY_KEY = 'novelhub_reading_history';
        this.SYNC_QUEUE_KEY = 'novelhub_sync_queue';
        this.DEVICES_KEY = 'novelhub_devices';
        this.LAST_SYNC_KEY = 'novelhub_last_sync';

        // 配置常量
        this.AUTO_SAVE_INTERVAL = 30000; // 30秒自动保存
        this.SYNC_INTERVAL = 60000; // 60秒同步一次
        this.MAX_HISTORY = 200; // 最大历史记录数
        this.MAX_SYNC_QUEUE = 50; // 最大同步队列长度

        // 状态管理
        this.listeners = [];
        this.currentNovel = null;
        this.currentChapter = null;
        this.currentChapterTitle = '';
        this.currentNovelTitle = '';
        this.totalChapters = 0;
        this.sessionStartTime = null;
        this.sessionReadChars = 0;
        this.lastSaveTime = 0;
        this.isReading = false;

        // 定时器
        this.autoSaveTimer = null;
        this.syncTimer = null;
        this.readingTimer = null;
        this.sessionTime = 0;

        // 阅读速度计算
        this.readingSpeedConfig = {
            minSpeed: 100,    // 最小阅读速度（字符/分钟）
            maxSpeed: 800,    // 最大阅读速度（字符/分钟）
            defaultSpeed: 300 // 默认阅读速度
        };

        this.init();
    }

    // ==================== 初始化 ====================

    init() {
        this.migrateOldData();
        this.initSession();
        this.setupEventListeners();
        this.startAutoSave();
        this.startSyncSimulation();
        this.registerDevice();
    }

    // 初始化会话
    initSession() {
        this.sessionStartTime = Date.now();
        this.sessionReadChars = 0;
        this.sessionTime = 0;
        this.isReading = false;
    }

    // 设置事件监听
    setupEventListeners() {
        // 页面关闭前保存
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // 页面可见性变化（切换标签页）
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // 页面加载完成
        window.addEventListener('load', () => {
            this.handlePageLoad();
        });

        // 滚动事件（用于计算阅读进度）
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 250);
        });

        // 在线/离线状态
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });
    }

    // ==================== 核心阅读进度管理 ====================

    /**
     * 开始阅读小说
     * @param {string} novelId - 小说ID
     * @param {Object} options - 配置选项
     */
    startReading(novelId, options = {}) {
        if (!novelId) return false;

        this.currentNovel = novelId;
        this.currentChapter = options.chapter || 1;
        this.currentChapterTitle = options.chapterTitle || '';
        this.currentNovelTitle = options.novelTitle || '';
        this.totalChapters = options.totalChapters || 0;

        this.initSession();
        this.isReading = true;

        // 记录阅读历史
        this.addToHistory({
            novelId,
            novelTitle: this.currentNovelTitle,
            chapter: this.currentChapter,
            chapterTitle: this.currentChapterTitle,
            action: 'start'
        });

        // 启动阅读计时器
        this.startReadingTimer();

        // 尝试恢复上次进度
        const savedProgress = this.getProgress(novelId);
        if (savedProgress && savedProgress.chapter === this.currentChapter) {
            // 延迟恢复滚动位置，确保内容已加载
            setTimeout(() => {
                this.restoreScrollPosition(savedProgress.scrollPosition);
            }, 500);
        }

        this.emit('readingStarted', {
            novelId,
            chapter: this.currentChapter,
            progress: savedProgress
        });

        return true;
    }

    /**
     * 切换章节
     * @param {number} chapter - 章节号
     * @param {string} chapterTitle - 章节标题
     */
    switchChapter(chapter, chapterTitle = '') {
        if (!this.currentNovel || chapter === this.currentChapter) return false;

        // 保存当前章节进度
        this.saveCurrentProgress();

        // 记录历史
        this.addToHistory({
            novelId: this.currentNovel,
            novelTitle: this.currentNovelTitle,
            chapter: this.currentChapter,
            chapterTitle: this.currentChapterTitle,
            action: 'leave',
            readTime: this.sessionTime,
            timestamp: new Date().toISOString()
        });

        // 更新当前章节
        const prevChapter = this.currentChapter;
        this.currentChapter = chapter;
        this.currentChapterTitle = chapterTitle;

        // 重置会话
        this.initSession();
        this.startReadingTimer();

        // 记录新章节历史
        this.addToHistory({
            novelId: this.currentNovel,
            novelTitle: this.currentNovelTitle,
            chapter: chapter,
            chapterTitle: chapterTitle,
            action: 'enter',
            timestamp: new Date().toISOString()
        });

        // 立即保存进度
        this.saveCurrentProgress();

        this.emit('chapterSwitched', {
            novelId: this.currentNovel,
            fromChapter: prevChapter,
            toChapter: chapter,
            chapterTitle
        });

        return true;
    }

    /**
     * 结束阅读
     */
    endReading() {
        if (!this.isReading) return false;

        // 保存最终进度
        this.saveCurrentProgress();

        // 记录历史
        this.addToHistory({
            novelId: this.currentNovel,
            novelTitle: this.currentNovelTitle,
            chapter: this.currentChapter,
            chapterTitle: this.currentChapterTitle,
            action: 'end',
            readTime: this.sessionTime,
            timestamp: new Date().toISOString()
        });

        // 更新统计
        this.updateReadingStats();

        // 停止计时器
        this.stopReadingTimer();
        this.isReading = false;

        this.emit('readingEnded', {
            novelId: this.currentNovel,
            chapter: this.currentChapter,
            totalSessionTime: this.sessionTime
        });

        // 清空当前状态
        this.currentNovel = null;
        this.currentChapter = null;

        return true;
    }

    /**
     * 保存当前进度
     */
    saveCurrentProgress() {
        if (!this.currentNovel || !this.isReading) return false;

        const scrollPosition = this.getCurrentScrollPosition();
        const readingPercentage = this.calculateReadingPercentage();

        const progress = {
            novelId: this.currentNovel,
            novelTitle: this.currentNovelTitle,
            chapter: this.currentChapter,
            chapterTitle: this.currentChapterTitle,
            scrollPosition: scrollPosition,
            readingPercentage: readingPercentage,
            totalChapters: this.totalChapters,
            readTime: this.sessionTime,
            totalChars: this.sessionReadChars,
            readingSpeed: this.calculateReadingSpeed(),
            timestamp: new Date().toISOString(),
            deviceId: this.getDeviceId()
        };

        // 保存到本地
        this.saveProgressToStorage(this.currentNovel, progress);

        // 添加到同步队列
        this.addToSyncQueue({
            type: 'progress',
            data: progress,
            timestamp: Date.now()
        });

        this.lastSaveTime = Date.now();

        this.emit('progressSaved', { novelId: this.currentNovel, progress });

        return true;
    }

    // ==================== 自动保存机制 ====================

    /**
     * 启动自动保存
     */
    startAutoSave() {
        // 清除现有定时器
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        // 每30秒自动保存
        this.autoSaveTimer = setInterval(() => {
            if (this.isReading && this.currentNovel) {
                this.saveCurrentProgress();
            }
        }, this.AUTO_SAVE_INTERVAL);
    }

    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * 启动阅读计时器
     */
    startReadingTimer() {
        if (this.readingTimer) {
            clearInterval(this.readingTimer);
        }

        this.readingTimer = setInterval(() => {
            if (this.isReading && document.visibilityState === 'visible') {
                this.sessionTime += 1;
            }
        }, 1000);
    }

    /**
     * 停止阅读计时器
     */
    stopReadingTimer() {
        if (this.readingTimer) {
            clearInterval(this.readingTimer);
            this.readingTimer = null;
        }
    }

    // ==================== 事件处理器 ====================

    /**
     * 页面关闭前处理
     */
    handleBeforeUnload(e) {
        if (this.isReading && this.currentNovel) {
            // 保存进度
            this.saveCurrentProgress();

            // 使用 sendBeacon 确保数据发送（模拟同步）
            this.syncBeforeUnload();

            // 标准提示（现代浏览器可能不显示自定义消息）
            const message = '您的阅读进度尚未保存，确定要离开吗？';
            e.returnValue = message;
            return message;
        }
    }

    /**
     * 页面可见性变化处理
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            // 页面隐藏时保存进度
            if (this.isReading) {
                this.saveCurrentProgress();
            }
        } else {
            // 页面显示时检查同步
            this.checkAndSync();
        }
    }

    /**
     * 页面加载处理
     */
    handlePageLoad() {
        // 检查是否有未完成的同步
        this.processSyncQueue();
    }

    /**
     * 滚动处理
     */
    handleScroll() {
        if (!this.isReading) return;

        // 更新阅读字符数（基于滚动位置估算）
        const visibleChars = this.calculateVisibleChars();
        if (visibleChars > this.sessionReadChars) {
            this.sessionReadChars = visibleChars;
        }
    }

    /**
     * 在线状态处理
     */
    handleOnline() {
        this.emit('online', {});
        // 恢复同步
        this.processSyncQueue();
    }

    /**
     * 离线状态处理
     */
    handleOffline() {
        this.emit('offline', {});
    }

    // ==================== 进度存储 ====================

    /**
     * 保存进度到本地存储
     */
    saveProgressToStorage(novelId, progress) {
        if (!novelId) return false;

        const allProgress = this.getAllProgress();
        const existingIndex = allProgress.findIndex(p => p.novelId === novelId);

        if (existingIndex >= 0) {
            // 合并阅读时间
            const existing = allProgress[existingIndex];
            progress.totalReadTime = (existing.totalReadTime || 0) + (progress.readTime || 0);
            allProgress[existingIndex] = progress;
        } else {
            allProgress.unshift(progress);
        }

        // 限制存储数量
        const maxHistory = (typeof window !== 'undefined' && window.NovelHubConstants)
            ? window.NovelHubConstants.NUMERIC_CONSTANTS.MAX_READING_HISTORY
            : 100;
        if (allProgress.length > maxHistory) {
            allProgress.splice(maxHistory);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProgress));
        return true;
    }

    /**
     * 获取阅读进度
     */
    getProgress(novelId) {
        const allProgress = this.getAllProgress();
        return allProgress.find(p => p.novelId === novelId) || null;
    }

    /**
     * 获取所有阅读进度
     */
    getAllProgress() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            this.logError('获取阅读进度失败:', e.message);
            return [];
        }
    }

    /**
     * 获取最近阅读
     */
    getRecentReading(limit = 10) {
        const allProgress = this.getAllProgress();
        return allProgress
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * 删除阅读进度
     */
    deleteProgress(novelId) {
        const allProgress = this.getAllProgress();
        const filtered = allProgress.filter(p => p.novelId !== novelId);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));

        // 同时删除相关的书签和高亮
        this.deleteNovelBookmarks(novelId);
        this.deleteNovelHighlights(novelId);

        this.emit('progressDeleted', { novelId });

        return true;
    }

    /**
     * 清除所有进度
     */
    clearAllProgress() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.BOOKMARKS_KEY);
        localStorage.removeItem(this.HIGHLIGHTS_KEY);
        localStorage.removeItem(this.HISTORY_KEY);
        localStorage.removeItem(this.SYNC_QUEUE_KEY);

        this.emit('allProgressCleared', {});

        return true;
    }

    // ==================== 进度恢复 ====================

    /**
     * 恢复阅读进度
     */
    restoreProgress(novelId) {
        const progress = this.getProgress(novelId);
        if (!progress) return null;

        this.currentNovel = novelId;
        this.currentChapter = progress.chapter;

        this.emit('progressRestored', { novelId, progress });

        return progress;
    }

    /**
     * 恢复滚动位置
     */
    restoreScrollPosition(position) {
        if (position && position > 0) {
            window.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        }
    }

    /**
     * 获取继续阅读信息
     */
    getContinueReading(novelId) {
        const progress = this.getProgress(novelId);
        if (!progress) return null;

        return {
            canContinue: true,
            chapter: progress.chapter,
            chapterTitle: progress.chapterTitle,
            readingPercentage: progress.readingPercentage || 0,
            lastReadAt: progress.timestamp,
            formattedLastRead: this.formatTimeAgo(progress.timestamp)
        };
    }

    // ==================== 阅读历史 ====================

    /**
     * 添加到阅读历史
     */
    addToHistory(record) {
        const history = this.getReadingHistory();

        const historyRecord = {
            id: this.generateId(),
            ...record,
            timestamp: record.timestamp || new Date().toISOString()
        };

        history.unshift(historyRecord);

        // 限制历史记录数量
        if (history.length > this.MAX_HISTORY) {
            history.splice(this.MAX_HISTORY);
        }

        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        this.emit('historyAdded', { record: historyRecord });

        return historyRecord;
    }

    /**
     * 获取阅读历史
     */
    getReadingHistory(limit = 50) {
        try {
            const data = localStorage.getItem(this.HISTORY_KEY);
            const history = data ? JSON.parse(data) : [];
            return limit ? history.slice(0, limit) : history;
        } catch (e) {
            return [];
        }
    }

    /**
     * 获取小说的阅读历史
     */
    getNovelHistory(novelId, limit = 20) {
        const history = this.getReadingHistory();
        const novelHistory = history.filter(h => h.novelId === novelId);
        return limit ? novelHistory.slice(0, limit) : novelHistory;
    }

    /**
     * 清除阅读历史
     */
    clearHistory() {
        localStorage.removeItem(this.HISTORY_KEY);
        this.emit('historyCleared', {});
        return true;
    }

    // ==================== 阅读统计 ====================

    /**
     * 更新阅读统计
     */
    updateReadingStats() {
        const currentStats = this.getStats();

        const newStats = {
            ...currentStats,
            lastReadAt: new Date().toISOString()
        };

        // 累计阅读时间
        if (this.sessionTime > 0) {
            newStats.totalReadTime = (currentStats.totalReadTime || 0) + this.sessionTime;
        }

        // 累计阅读章节
        if (this.sessionTime > 60) { // 至少阅读1分钟才算
            newStats.totalChaptersRead = (currentStats.totalChaptersRead || 0) + 1;
        }

        // 更新连续阅读天数
        newStats.streakDays = this.calculateStreakDays(currentStats);
        newStats.lastReadDate = new Date().toDateString();

        // 更新阅读速度统计
        const currentSpeed = this.calculateReadingSpeed();
        if (currentSpeed > 0) {
            const speeds = currentStats.readingSpeeds || [];
            speeds.push(currentSpeed);
            if (speeds.length > 10) speeds.shift(); // 保留最近10次
            newStats.readingSpeeds = speeds;
            newStats.averageReadingSpeed = Math.round(
                speeds.reduce((a, b) => a + b, 0) / speeds.length
            );
        }

        localStorage.setItem(this.STATS_KEY, JSON.stringify(newStats));
        this.emit('statsUpdated', { stats: newStats });

        return newStats;
    }

    /**
     * 获取阅读统计
     */
    getStats() {
        try {
            const data = localStorage.getItem(this.STATS_KEY);
            return data ? JSON.parse(data) : this.getDefaultStats();
        } catch (e) {
            return this.getDefaultStats();
        }
    }

    /**
     * 默认统计
     */
    getDefaultStats() {
        return {
            totalReadTime: 0,
            totalChaptersRead: 0,
            totalNovelsRead: 0,
            bookmarksCreated: 0,
            highlightsCreated: 0,
            lastReadAt: null,
            streakDays: 0,
            lastReadDate: null,
            readingSpeeds: [],
            averageReadingSpeed: 0
        };
    }

    /**
     * 计算连续阅读天数
     */
    calculateStreakDays(currentStats) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (currentStats.lastReadDate === today) {
            return currentStats.streakDays || 1;
        } else if (currentStats.lastReadDate === yesterday) {
            return (currentStats.streakDays || 0) + 1;
        } else {
            return 1;
        }
    }

    /**
     * 获取格式化的阅读时长
     */
    getFormattedReadTime(seconds = null) {
        const stats = this.getStats();
        const totalSeconds = seconds !== null ? seconds : (stats.totalReadTime || 0);
        const minutes = Math.floor(totalSeconds / 60);

        if (minutes < 60) {
            return `${minutes} 分钟`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours < 24) {
            return `${hours} 小时 ${remainingMinutes} 分钟`;
        }

        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        return `${days} 天 ${remainingHours} 小时`;
    }

    /**
     * 获取今日阅读时长
     */
    getTodayReadTime() {
        const history = this.getReadingHistory();
        const today = new Date().toDateString();

        return history
            .filter(h => {
                const date = new Date(h.timestamp);
                return date.toDateString() === today && h.readTime;
            })
            .reduce((total, h) => total + (h.readTime || 0), 0);
    }

    /**
     * 获取本周阅读统计
     */
    getWeeklyStats() {
        const history = this.getReadingHistory(100);
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        const weekHistory = history.filter(h =>
            new Date(h.timestamp) >= weekAgo
        );

        const dailyStats = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(now - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toDateString();
            dailyStats[dateStr] = {
                date: dateStr,
                readTime: 0,
                chapters: 0
            };
        }

        weekHistory.forEach(h => {
            const dateStr = new Date(h.timestamp).toDateString();
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].readTime += h.readTime || 0;
                if (h.action === 'end' || h.action === 'leave') {
                    dailyStats[dateStr].chapters += 1;
                }
            }
        });

        return Object.values(dailyStats).reverse();
    }

    // ==================== 阅读速度计算 ====================

    /**
     * 计算阅读速度（字符/分钟）
     */
    calculateReadingSpeed() {
        if (this.sessionTime < 30) { // 至少阅读30秒
            return this.readingSpeedConfig.defaultSpeed;
        }

        const minutes = this.sessionTime / 60;
        const speed = Math.round(this.sessionReadChars / minutes);

        // 限制在合理范围内
        return Math.max(
            this.readingSpeedConfig.minSpeed,
            Math.min(this.readingSpeedConfig.maxSpeed, speed)
        );
    }

    /**
     * 获取预估剩余阅读时间
     */
    getEstimatedRemainingTime(novelId) {
        const progress = this.getProgress(novelId);
        if (!progress) return null;

        const stats = this.getStats();
        const speed = stats.averageReadingSpeed || this.readingSpeedConfig.defaultSpeed;

        // 估算剩余字符数（假设每章平均3000字）
        const remainingChapters = progress.totalChapters - progress.chapter;
        const remainingChars = remainingChapters * 3000 * (1 - (progress.readingPercentage || 0) / 100);

        const remainingMinutes = Math.ceil(remainingChars / speed);

        return {
            minutes: remainingMinutes,
            formatted: this.getFormattedReadTime(remainingMinutes * 60)
        };
    }

    // ==================== 多设备同步（模拟）====================

    /**
     * 注册设备
     */
    registerDevice() {
        const devices = this.getDevices();
        const deviceId = this.getDeviceId();

        const deviceInfo = {
            id: deviceId,
            name: this.getDeviceName(),
            userAgent: navigator.userAgent,
            registeredAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        const existingIndex = devices.findIndex(d => d.id === deviceId);
        if (existingIndex >= 0) {
            devices[existingIndex] = { ...devices[existingIndex], ...deviceInfo };
        } else {
            devices.push(deviceInfo);
        }

        localStorage.setItem(this.DEVICES_KEY, JSON.stringify(devices));
    }

    /**
     * 获取设备列表
     */
    getDevices() {
        try {
            const data = localStorage.getItem(this.DEVICES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 获取当前设备ID
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('novelhub_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('novelhub_device_id', deviceId);
        }
        return deviceId;
    }

    /**
     * 获取设备名称
     */
    getDeviceName() {
        const platform = navigator.platform || 'Unknown';
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);

        if (isMobile) {
            if (/iPhone/i.test(navigator.userAgent)) return 'iPhone';
            if (/iPad/i.test(navigator.userAgent)) return 'iPad';
            if (/Android/i.test(navigator.userAgent)) return 'Android';
            return '移动设备';
        }

        if (/Win/i.test(platform)) return 'Windows';
        if (/Mac/i.test(platform)) return 'Mac';
        if (/Linux/i.test(platform)) return 'Linux';

        return '未知设备';
    }

    /**
     * 启动同步模拟
     */
    startSyncSimulation() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(() => {
            if (navigator.onLine) {
                this.processSyncQueue();
                this.checkAndSync();
            }
        }, this.SYNC_INTERVAL);
    }

    /**
     * 检查并同步
     */
    checkAndSync() {
        const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
        const lastSyncTime = lastSync ? parseInt(lastSync) : 0;

        // 如果超过5分钟没有同步，执行同步
        if (Date.now() - lastSyncTime > 5 * 60 * 1000) {
            this.performSync();
        }
    }

    /**
     * 执行同步（模拟）
     */
    performSync() {
        // 模拟从"服务器"获取其他设备的进度
        const syncData = this.simulateServerSync();

        if (syncData && syncData.length > 0) {
            this.mergeSyncedData(syncData);
        }

        localStorage.setItem(this.LAST_SYNC_KEY, Date.now().toString());
        this.emit('syncCompleted', { timestamp: Date.now() });
    }

    /**
     * 模拟服务器同步
     */
    simulateServerSync() {
        // 在实际应用中，这里会调用后端API
        // 现在模拟从其他设备获取数据
        const devices = this.getDevices();
        const currentDeviceId = this.getDeviceId();

        // 模拟其他设备的进度数据
        return devices
            .filter(d => d.id !== currentDeviceId)
            .map(device => ({
                deviceId: device.id,
                deviceName: device.name,
                progress: null // 实际应用中这里会有数据
            }));
    }

    /**
     * 合并同步数据
     */
    mergeSyncedData(syncData) {
        const allProgress = this.getAllProgress();

        syncData.forEach(syncItem => {
            if (!syncItem.progress) return;

            const existingIndex = allProgress.findIndex(
                p => p.novelId === syncItem.progress.novelId
            );

            if (existingIndex >= 0) {
                const existing = allProgress[existingIndex];
                const syncTime = new Date(syncItem.progress.timestamp);
                const existingTime = new Date(existing.timestamp);

                // 使用较新的数据
                if (syncTime > existingTime) {
                    allProgress[existingIndex] = {
                        ...syncItem.progress,
                        syncedFrom: syncItem.deviceName
                    };
                }
            }
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProgress));
    }

    /**
     * 添加到同步队列
     */
    addToSyncQueue(item) {
        const queue = this.getSyncQueue();

        queue.push({
            ...item,
            id: this.generateId(),
            addedAt: Date.now()
        });

        // 限制队列长度
        if (queue.length > this.MAX_SYNC_QUEUE) {
            queue.splice(0, queue.length - this.MAX_SYNC_QUEUE);
        }

        localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    }

    /**
     * 获取同步队列
     */
    getSyncQueue() {
        try {
            const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 处理同步队列
     */
    processSyncQueue() {
        const queue = this.getSyncQueue();
        if (queue.length === 0) return;

        // 模拟发送同步请求
        const processed = [];

        queue.forEach(item => {
            // 模拟同步成功
            processed.push(item.id);
        });

        // 移除已处理的项
        const remaining = queue.filter(item => !processed.includes(item.id));
        localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(remaining));

        if (processed.length > 0) {
            this.emit('syncQueueProcessed', { processed: processed.length });
        }
    }

    /**
     * 页面关闭前同步
     */
    syncBeforeUnload() {
        // 使用 sendBeacon API（如果可用）
        if (navigator.sendBeacon) {
            const syncData = {
                deviceId: this.getDeviceId(),
                progress: this.getAllProgress(),
                timestamp: Date.now()
            };
            // 模拟发送
            // navigator.sendBeacon('/api/sync', JSON.stringify(syncData));
        }

        // 保存同步队列到 sessionStorage（跨页面恢复）
        const queue = this.getSyncQueue();
        sessionStorage.setItem('novelhub_pending_sync', JSON.stringify(queue));
    }

    // ==================== 书签功能 ====================

    addBookmark(bookmark) {
        const bookmarks = this.getAllBookmarks();

        const existingIndex = bookmarks.findIndex(b =>
            b.novelId === bookmark.novelId &&
            b.chapter === bookmark.chapter &&
            Math.abs(b.position - bookmark.position) < 100
        );

        const bookmarkData = {
            id: this.generateId(),
            novelId: bookmark.novelId,
            novelTitle: bookmark.novelTitle || '未知小说',
            chapter: bookmark.chapter,
            chapterTitle: bookmark.chapterTitle || '',
            position: bookmark.position || 0,
            scrollPosition: bookmark.scrollPosition || 0,
            text: bookmark.text || '',
            note: bookmark.note || '',
            color: bookmark.color || 'yellow',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            bookmarks[existingIndex] = { ...bookmarks[existingIndex], ...bookmarkData };
        } else {
            bookmarks.unshift(bookmarkData);
        }

        if (bookmarks.length > 500) {
            bookmarks.splice(500);
        }

        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));

        // 添加到同步队列
        this.addToSyncQueue({
            type: 'bookmark',
            data: bookmarkData,
            timestamp: Date.now()
        });

        this.emit('bookmarkAdded', { bookmark: bookmarkData });

        return bookmarkData;
    }

    getAllBookmarks() {
        try {
            const data = localStorage.getItem(this.BOOKMARKS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    getNovelBookmarks(novelId) {
        const bookmarks = this.getAllBookmarks();
        return bookmarks.filter(b => b.novelId === novelId);
    }

    getChapterBookmarks(novelId, chapter) {
        const bookmarks = this.getAllBookmarks();
        return bookmarks.filter(b => b.novelId === novelId && b.chapter === chapter);
    }

    updateBookmark(bookmarkId, updates) {
        const bookmarks = this.getAllBookmarks();
        const index = bookmarks.findIndex(b => b.id === bookmarkId);

        if (index === -1) return null;

        bookmarks[index] = {
            ...bookmarks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
        this.emit('bookmarkUpdated', { bookmark: bookmarks[index] });

        return bookmarks[index];
    }

    deleteBookmark(bookmarkId) {
        const bookmarks = this.getAllBookmarks();
        const index = bookmarks.findIndex(b => b.id === bookmarkId);

        if (index === -1) return false;

        const deleted = bookmarks.splice(index, 1)[0];
        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
        this.emit('bookmarkDeleted', { bookmark: deleted });

        return true;
    }

    deleteNovelBookmarks(novelId) {
        const bookmarks = this.getAllBookmarks();
        const filtered = bookmarks.filter(b => b.novelId !== novelId);

        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(filtered));
        return bookmarks.length - filtered.length;
    }

    // ==================== 高亮功能 ====================

    addHighlight(highlight) {
        const highlights = this.getAllHighlights();

        const highlightData = {
            id: this.generateId(),
            novelId: highlight.novelId,
            chapter: highlight.chapter,
            startOffset: highlight.startOffset,
            endOffset: highlight.endOffset,
            text: highlight.text || '',
            color: highlight.color || 'yellow',
            note: highlight.note || '',
            createdAt: new Date().toISOString()
        };

        highlights.push(highlightData);

        if (highlights.length > 1000) {
            highlights.splice(0, highlights.length - 1000);
        }

        localStorage.setItem(this.HIGHLIGHTS_KEY, JSON.stringify(highlights));

        // 添加到同步队列
        this.addToSyncQueue({
            type: 'highlight',
            data: highlightData,
            timestamp: Date.now()
        });

        this.emit('highlightAdded', { highlight: highlightData });

        return highlightData;
    }

    getAllHighlights() {
        try {
            const data = localStorage.getItem(this.HIGHLIGHTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    getChapterHighlights(novelId, chapter) {
        const highlights = this.getAllHighlights();
        return highlights.filter(h => h.novelId === novelId && h.chapter === chapter);
    }

    deleteHighlight(highlightId) {
        const highlights = this.getAllHighlights();
        const index = highlights.findIndex(h => h.id === highlightId);

        if (index === -1) return false;

        const deleted = highlights.splice(index, 1)[0];
        localStorage.setItem(this.HIGHLIGHTS_KEY, JSON.stringify(highlights));
        this.emit('highlightDeleted', { highlight: deleted });

        return true;
    }

    deleteNovelHighlights(novelId) {
        const highlights = this.getAllHighlights();
        const filtered = highlights.filter(h => h.novelId !== novelId);

        localStorage.setItem(this.HIGHLIGHTS_KEY, JSON.stringify(filtered));
        return highlights.length - filtered.length;
    }

    // ==================== 数据导出/导入 ====================

    exportData() {
        return {
            version: '2.0',
            exportDate: new Date().toISOString(),
            deviceId: this.getDeviceId(),
            progress: this.getAllProgress(),
            bookmarks: this.getAllBookmarks(),
            highlights: this.getAllHighlights(),
            history: this.getReadingHistory(),
            stats: this.getStats()
        };
    }

    importData(data) {
        try {
            if (data.progress && Array.isArray(data.progress)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.progress));
            }
            if (data.bookmarks && Array.isArray(data.bookmarks)) {
                localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(data.bookmarks));
            }
            if (data.highlights && Array.isArray(data.highlights)) {
                localStorage.setItem(this.HIGHLIGHTS_KEY, JSON.stringify(data.highlights));
            }
            if (data.history && Array.isArray(data.history)) {
                localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
            }
            if (data.stats) {
                localStorage.setItem(this.STATS_KEY, JSON.stringify(data.stats));
            }

            this.emit('dataImported', { success: true });
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // ==================== 工具方法 ====================

    migrateOldData() {
        const oldProgress = localStorage.getItem('readingProgress');
        if (oldProgress) {
            try {
                const data = JSON.parse(oldProgress);
                this.saveProgressToStorage(data.novelId || 'unknown', {
                    chapter: data.chapter || 1,
                    scrollPosition: data.scrollPosition || 0,
                    timestamp: data.timestamp || new Date().toISOString()
                });
                localStorage.removeItem('readingProgress');
            } catch (e) {
                this.logError('迁移旧阅读进度失败:', e.message);
            }
        }
    }

    getCurrentScrollPosition() {
        return window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    calculateReadingPercentage() {
        const scrollTop = this.getCurrentScrollPosition();
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight <= 0) return 0;

        return Math.min(100, Math.round((scrollTop / docHeight) * 100));
    }

    calculateVisibleChars() {
        // 基于滚动位置估算已读字符数
        const content = document.querySelector('.chapter-content, .reading-content, article');
        if (!content) return 0;

        const text = content.innerText || '';
        const percentage = this.calculateReadingPercentage() / 100;

        return Math.floor(text.length * percentage);
    }

    formatTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes} 分钟前`;
        if (hours < 24) return `${hours} 小时前`;
        if (days < 7) return `${days} 天前`;

        return date.toLocaleDateString('zh-CN');
    }

    generateId() {
        return 'rp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    logError(...args) {
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.error(...args);
        } else {
            console.error(...args);
        }
    }

    // ==================== 事件系统 ====================

    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    off(event, callback) {
        this.listeners = this.listeners.filter(
            l => !(l.event === event && l.callback === callback)
        );
    }

    emit(event, data) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => {
                try {
                    l.callback(data);
                } catch (e) {
                    this.logError('阅读进度事件错误:', e.message);
                }
            });
    }

    // ==================== 存储使用情况 ====================

    getStorageUsage() {
        const keys = [
            this.STORAGE_KEY,
            this.STATS_KEY,
            this.BOOKMARKS_KEY,
            this.HIGHLIGHTS_KEY,
            this.HISTORY_KEY,
            this.SYNC_QUEUE_KEY,
            this.DEVICES_KEY
        ];

        const usage = {};
        let totalSize = 0;

        keys.forEach(key => {
            const data = localStorage.getItem(key) || '';
            usage[key.replace('novelhub_', '')] = {
                size: data.length,
                sizeKB: (data.length / 1024).toFixed(2)
            };
            totalSize += data.length;
        });

        usage.total = {
            size: totalSize,
            sizeKB: (totalSize / 1024).toFixed(2)
        };

        return usage;
    }

    // ==================== 销毁/清理 ====================

    destroy() {
        this.stopAutoSave();
        this.stopReadingTimer();

        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }

        this.listeners = [];
    }
}

// 创建单例
const readingProgressService = new ReadingProgressService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReadingProgressService, readingProgressService };
}

if (typeof window !== 'undefined') {
    window.ReadingProgressService = ReadingProgressService;
    window.readingProgressService = readingProgressService;
}