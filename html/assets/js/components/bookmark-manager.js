/**
 * NovelHub 书签管理器
 * 支持添加、删除、同步书签，支持跨设备同步
 * @version 2.0.0
 */

class BookmarkManager {
    constructor(options = {}) {
        // 使用常量避免魔法数字
        const constants = (typeof window !== 'undefined' && window.NovelHubConstants)
            ? window.NovelHubConstants.NUMERIC_CONSTANTS
            : { MAX_BOOKMARKS: 500, MILLISECONDS_PER_MINUTE: 60000 };

        this.config = {
            storageKey: 'novelhub_bookmarks',
            maxBookmarks: constants.MAX_BOOKMARKS || 500,
            syncInterval: (constants.MILLISECONDS_PER_MINUTE || 60000) / 2, // 30秒同步一次
            enableSync: true,
            ...options
        };

        this.bookmarks = [];
        this.listeners = [];
        this.syncTimer = null;

        this.init();
    }

    init() {
        this.loadBookmarks();
        this.startAutoSync();
    }

    // 加载书签
    loadBookmarks() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                this.bookmarks = JSON.parse(saved);
                // 清理过期书签（超过1年）
                this.cleanupOldBookmarks();
            }
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('加载书签失败:', e.message);
            }
            this.bookmarks = [];
        }
    }

    // 保存书签
    saveBookmarks() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.bookmarks));
            this.notifyListeners('save', this.bookmarks);
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('保存书签失败:', e.message);
            }
            // 如果存储空间不足，删除最旧的书签
            if (e.name === 'QuotaExceededError') {
                this.removeOldestBookmark();
                this.saveBookmarks();
            }
        }
    }

    // 添加书签
    addBookmark(bookmark) {
        // 验证必填字段
        if (!bookmark.novelId || !bookmark.chapterId) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('书签缺少必要字段');
            }
            return null;
        }

        // 检查是否已存在相同位置的书签
        const existingIndex = this.bookmarks.findIndex(b => 
            b.novelId === bookmark.novelId && b.chapterId === bookmark.chapterId
        );

        const newBookmark = {
            id: this.generateId(),
            novelId: bookmark.novelId,
            novelTitle: bookmark.novelTitle || '未知小说',
            chapterId: bookmark.chapterId,
            chapterTitle: bookmark.chapterTitle || '未知章节',
            position: bookmark.position || 0, // 页面内位置（百分比）
            scrollPosition: bookmark.scrollPosition || 0, // 滚动位置（像素）
            note: bookmark.note || '', // 书签备注
            color: bookmark.color || 'default', // 书签颜色标记
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...bookmark
        };

        if (existingIndex >= 0) {
            // 更新现有书签
            this.bookmarks[existingIndex] = {
                ...this.bookmarks[existingIndex],
                ...newBookmark,
                id: this.bookmarks[existingIndex].id // 保留原ID
            };
        } else {
            // 添加新书签
            this.bookmarks.unshift(newBookmark);
            
            // 限制书签数量
            if (this.bookmarks.length > this.config.maxBookmarks) {
                this.bookmarks = this.bookmarks.slice(0, this.config.maxBookmarks);
            }
        }

        this.saveBookmarks();
        this.notifyListeners('add', newBookmark);

        return newBookmark;
    }

    // 更新书签
    updateBookmark(id, updates) {
        const index = this.bookmarks.findIndex(b => b.id === id);
        if (index === -1) return null;

        this.bookmarks[index] = {
            ...this.bookmarks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveBookmarks();
        this.notifyListeners('update', this.bookmarks[index]);

        return this.bookmarks[index];
    }

    // 删除书签
    removeBookmark(id) {
        const index = this.bookmarks.findIndex(b => b.id === id);
        if (index === -1) return false;

        const removed = this.bookmarks.splice(index, 1)[0];
        this.saveBookmarks();
        this.notifyListeners('remove', removed);

        return true;
    }

    // 删除小说的所有书签
    removeNovelBookmarks(novelId) {
        const beforeCount = this.bookmarks.length;
        this.bookmarks = this.bookmarks.filter(b => b.novelId !== novelId);
        
        if (this.bookmarks.length !== beforeCount) {
            this.saveBookmarks();
            this.notifyListeners('removeNovel', { novelId });
        }

        return beforeCount - this.bookmarks.length;
    }

    // 获取所有书签
    getAllBookmarks() {
        return [...this.bookmarks];
    }

    // 获取小说的书签
    getNovelBookmarks(novelId) {
        return this.bookmarks.filter(b => b.novelId === novelId);
    }

    // 获取最近的书签
    getRecentBookmarks(limit = 10) {
        return this.bookmarks
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    // 获取书签统计
    getStats() {
        const stats = {
            total: this.bookmarks.length,
            byNovel: {},
            byColor: {
                default: 0,
                red: 0,
                yellow: 0,
                green: 0,
                blue: 0,
                purple: 0
            }
        };

        this.bookmarks.forEach(b => {
            // 按小说统计
            stats.byNovel[b.novelId] = (stats.byNovel[b.novelId] || 0) + 1;
            // 按颜色统计
            stats.byColor[b.color] = (stats.byColor[b.color] || 0) + 1;
        });

        return stats;
    }

    // 搜索书签
    searchBookmarks(query) {
        const lowerQuery = query.toLowerCase();
        return this.bookmarks.filter(b => 
            b.novelTitle.toLowerCase().includes(lowerQuery) ||
            b.chapterTitle.toLowerCase().includes(lowerQuery) ||
            (b.note && b.note.toLowerCase().includes(lowerQuery))
        );
    }

    // 跳转到书签
    jumpToBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return null;

        // 更新访问时间
        this.updateBookmark(id, { updatedAt: new Date().toISOString() });

        return {
            novelId: bookmark.novelId,
            chapterId: bookmark.chapterId,
            position: bookmark.position,
            scrollPosition: bookmark.scrollPosition
        };
    }

    // 导出书签
    exportBookmarks() {
        return {
            version: '2.0',
            exportDate: new Date().toISOString(),
            bookmarks: this.bookmarks
        };
    }

    // 导入书签
    importBookmarks(data) {
        try {
            let imported = [];
            
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            if (data.bookmarks && Array.isArray(data.bookmarks)) {
                imported = data.bookmarks;
            } else if (Array.isArray(data)) {
                imported = data;
            }

            // 验证和清理导入的书签
            const validBookmarks = imported.filter(b => 
                b.novelId && b.chapterId
            ).map(b => ({
                id: b.id || this.generateId(),
                novelId: b.novelId,
                novelTitle: b.novelTitle || '未知小说',
                chapterId: b.chapterId,
                chapterTitle: b.chapterTitle || '未知章节',
                position: b.position || 0,
                scrollPosition: b.scrollPosition || 0,
                note: b.note || '',
                color: b.color || 'default',
                createdAt: b.createdAt || new Date().toISOString(),
                updatedAt: b.updatedAt || new Date().toISOString()
            }));

            // 合并书签，避免重复
            const existingIds = new Set(this.bookmarks.map(b => b.id));
            const newBookmarks = validBookmarks.filter(b => !existingIds.has(b.id));
            
            this.bookmarks = [...newBookmarks, ...this.bookmarks];
            
            // 限制数量
            if (this.bookmarks.length > this.config.maxBookmarks) {
                this.bookmarks = this.bookmarks.slice(0, this.config.maxBookmarks);
            }

            this.saveBookmarks();
            this.notifyListeners('import', { count: newBookmarks.length });

            return {
                success: true,
                imported: newBookmarks.length,
                total: this.bookmarks.length
            };
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('导入书签失败:', e.message);
            }
            return {
                success: false,
                error: e.message
            };
        }
    }

    // 同步书签（模拟云端同步）
    async syncBookmarks() {
        if (!this.config.enableSync) return;

        try {
            // 这里可以接入真实的同步API
            // 目前仅模拟同步过程
            const lastSync = localStorage.getItem(`${this.config.storageKey}_lastSync`);
            const localData = this.exportBookmarks();

            // 模拟从服务器获取更新
            // const serverData = await fetchServerBookmarks();
            
            // 合并本地和服务器数据
            // this.mergeBookmarks(localData.bookmarks, serverData.bookmarks);

            localStorage.setItem(`${this.config.storageKey}_lastSync`, new Date().toISOString());
            this.notifyListeners('sync', { success: true });

            return { success: true };
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('同步书签失败:', e.message);
            }
            this.notifyListeners('sync', { success: false, error: e.message });
            return { success: false, error: e.message };
        }
    }

    // 清理旧书签
    cleanupOldBookmarks() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const beforeCount = this.bookmarks.length;
        this.bookmarks = this.bookmarks.filter(b => 
            new Date(b.updatedAt) > oneYearAgo
        );

        if (this.bookmarks.length !== beforeCount) {
            this.saveBookmarks();
        }
    }

    // 删除最旧的书签
    removeOldestBookmark() {
        if (this.bookmarks.length === 0) return;
        
        const oldest = this.bookmarks.reduce((min, b) => 
            new Date(b.updatedAt) < new Date(min.updatedAt) ? b : min
        );
        
        this.removeBookmark(oldest.id);
    }

    // 生成唯一ID
    generateId() {
        return 'bm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 开始自动同步
    startAutoSync() {
        if (!this.config.enableSync) return;
        
        this.syncTimer = setInterval(() => {
            this.syncBookmarks();
        }, this.config.syncInterval);
    }

    // 停止自动同步
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    // 添加监听器
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // 通知监听器
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('书签监听器错误:', e.message);
                }
            }
        });
    }

    // 清空所有书签
    clearAll() {
        this.bookmarks = [];
        this.saveBookmarks();
        this.notifyListeners('clear', {});
    }

    // 销毁
    destroy() {
        this.stopAutoSync();
        this.listeners = [];
    }
}

// 书签UI组件
class BookmarkUI {
    constructor(container, bookmarkManager) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.manager = bookmarkManager;
        this.currentNovelId = null;
        this.currentChapterId = null;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.buildUI();
        this.bindEvents();
        this.renderBookmarks();

        // 监听书签变化
        this.unsubscribe = this.manager.addListener((event, data) => {
            this.renderBookmarks();
        });
    }

    buildUI() {
        this.container.innerHTML = `
            <div class="bookmark-panel">
                <div class="bookmark-header">
                    <h3 class="bookmark-title">
                        <i class="fas fa-bookmark"></i>
                        书签
                        <span class="bookmark-count">0</span>
                    </h3>
                    <div class="bookmark-actions">
                        <button class="btn-icon add-bookmark-btn" title="添加书签">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-icon export-bookmarks-btn" title="导出书签">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-icon import-bookmarks-btn" title="导入书签">
                            <i class="fas fa-upload"></i>
                        </button>
                    </div>
                </div>
                <div class="bookmark-search">
                    <input type="text" class="bookmark-search-input" placeholder="搜索书签...">
                    <i class="fas fa-search"></i>
                </div>
                <div class="bookmark-list"></div>
                <input type="file" class="bookmark-file-input" accept=".json" style="display: none;">
            </div>
        `;

        this.elements = {
            count: this.container.querySelector('.bookmark-count'),
            list: this.container.querySelector('.bookmark-list'),
            searchInput: this.container.querySelector('.bookmark-search-input'),
            fileInput: this.container.querySelector('.bookmark-file-input')
        };
    }

    bindEvents() {
        // 添加书签
        this.container.querySelector('.add-bookmark-btn').addEventListener('click', () => {
            this.showAddBookmarkDialog();
        });

        // 导出书签
        this.container.querySelector('.export-bookmarks-btn').addEventListener('click', () => {
            this.exportBookmarks();
        });

        // 导入书签
        this.container.querySelector('.import-bookmarks-btn').addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            this.importBookmarks(e.target.files[0]);
        });

        // 搜索
        this.elements.searchInput.addEventListener('input', (e) => {
            this.renderBookmarks(e.target.value);
        });

        // 书签列表事件委托
        this.elements.list.addEventListener('click', (e) => {
            const item = e.target.closest('.bookmark-item');
            if (!item) return;

            const bookmarkId = item.dataset.id;

            if (e.target.closest('.delete-bookmark')) {
                this.manager.removeBookmark(bookmarkId);
            } else if (e.target.closest('.edit-bookmark')) {
                this.showEditBookmarkDialog(bookmarkId);
            } else {
                this.jumpToBookmark(bookmarkId);
            }
        });
    }

    renderBookmarks(searchQuery = '') {
        let bookmarks = this.manager.getAllBookmarks();

        if (searchQuery) {
            bookmarks = this.manager.searchBookmarks(searchQuery);
        }

        this.elements.count.textContent = bookmarks.length;

        if (bookmarks.length === 0) {
            this.elements.list.innerHTML = `
                <div class="bookmark-empty">
                    <i class="far fa-bookmark"></i>
                    <p>暂无书签</p>
                </div>
            `;
            return;
        }

        this.elements.list.innerHTML = bookmarks.map(b => `
            <div class="bookmark-item" data-id="${b.id}" data-color="${b.color}">
                <div class="bookmark-color-indicator"></div>
                <div class="bookmark-info">
                    <div class="bookmark-novel">${this.escapeHtml(b.novelTitle)}</div>
                    <div class="bookmark-chapter">${this.escapeHtml(b.chapterTitle)}</div>
                    ${b.note ? `<div class="bookmark-note">${this.escapeHtml(b.note)}</div>` : ''}
                    <div class="bookmark-time">${this.formatTime(b.updatedAt)}</div>
                </div>
                <div class="bookmark-item-actions">
                    <button class="btn-icon edit-bookmark" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-bookmark" title="删除">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showAddBookmarkDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'bookmark-dialog-overlay';
        dialog.innerHTML = `
            <div class="bookmark-dialog">
                <h4>添加书签</h4>
                <div class="form-group">
                    <label>备注（可选）</label>
                    <textarea class="bookmark-note-input" rows="3" placeholder="添加书签备注..."></textarea>
                </div>
                <div class="form-group">
                    <label>颜色标记</label>
                    <div class="bookmark-colors">
                        ${['default', 'red', 'yellow', 'green', 'blue', 'purple'].map(color => `
                            <button class="bookmark-color-btn ${color}" data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="btn-secondary cancel-btn">取消</button>
                    <button class="btn-primary save-btn">保存书签</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        let selectedColor = 'default';

        // 颜色选择
        dialog.querySelectorAll('.bookmark-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dialog.querySelectorAll('.bookmark-color-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedColor = btn.dataset.color;
            });
        });

        // 取消
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
        });

        // 保存
        dialog.querySelector('.save-btn').addEventListener('click', () => {
            const note = dialog.querySelector('.bookmark-note-input').value;
            
            // 触发添加书签事件，由阅读器处理具体位置
            const event = new CustomEvent('bookmark:add', {
                detail: { note, color: selectedColor }
            });
            document.dispatchEvent(event);

            dialog.remove();
        });

        // 点击遮罩关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.remove();
        });
    }

    showEditBookmarkDialog(bookmarkId) {
        const bookmark = this.manager.getAllBookmarks().find(b => b.id === bookmarkId);
        if (!bookmark) return;

        const dialog = document.createElement('div');
        dialog.className = 'bookmark-dialog-overlay';
        dialog.innerHTML = `
            <div class="bookmark-dialog">
                <h4>编辑书签</h4>
                <div class="form-group">
                    <label>备注</label>
                    <textarea class="bookmark-note-input" rows="3">${this.escapeHtml(bookmark.note || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>颜色标记</label>
                    <div class="bookmark-colors">
                        ${['default', 'red', 'yellow', 'green', 'blue', 'purple'].map(color => `
                            <button class="bookmark-color-btn ${color} ${bookmark.color === color ? 'selected' : ''}" data-color="${color}"></button>
                        `).join('')}
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="btn-secondary cancel-btn">取消</button>
                    <button class="btn-primary save-btn">保存</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        let selectedColor = bookmark.color;

        dialog.querySelectorAll('.bookmark-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                dialog.querySelectorAll('.bookmark-color-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedColor = btn.dataset.color;
            });
        });

        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
        });

        dialog.querySelector('.save-btn').addEventListener('click', () => {
            const note = dialog.querySelector('.bookmark-note-input').value;
            this.manager.updateBookmark(bookmarkId, { note, color: selectedColor });
            dialog.remove();
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) dialog.remove();
        });
    }

    exportBookmarks() {
        const data = this.manager.exportBookmarks();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `novelhub-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importBookmarks(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = this.manager.importBookmarks(e.target.result);
            if (result.success) {
                this.showToast(`成功导入 ${result.imported} 个书签`);
            } else {
                this.showToast('导入失败: ' + result.error, 'error');
            }
        };
        reader.readAsText(file);
    }

    jumpToBookmark(bookmarkId) {
        const location = this.manager.jumpToBookmark(bookmarkId);
        if (location) {
            const event = new CustomEvent('bookmark:jump', { detail: location });
            document.dispatchEvent(event);
        }
    }

    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(time) {
        const date = new Date(time);
        const now = new Date();
        const diff = now - date;

        const days = Math.floor(diff / 86400000);
        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days}天前`;
        if (days < 30) return `${Math.floor(days / 7)}周前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.container.innerHTML = '';
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BookmarkManager, BookmarkUI };
}

if (typeof window !== 'undefined') {
    window.BookmarkManager = BookmarkManager;
    window.BookmarkUI = BookmarkUI;
}
