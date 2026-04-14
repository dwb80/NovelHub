/**
 * NovelHub 评论系统组件
 * 支持评论发布、回复、点赞、排序、筛选等功能
 * @version 2.0.0
 */

class CommentSystem {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('评论系统: 容器未找到');
            }
            return;
        }

        // 使用常量避免魔法数字
        const constants = (typeof window !== 'undefined' && window.NovelHubConstants)
            ? window.NovelHubConstants.NUMERIC_CONSTANTS
            : { COMMENTS_PER_PAGE: 10, MAX_COMMENT_LENGTH: 500 };

        this.config = {
            novelId: null,
            chapterId: null,
            pageSize: constants.COMMENTS_PER_PAGE || 10,
            maxCommentLength: constants.MAX_COMMENT_LENGTH || 500,
            enableReply: true,
            enableLike: true,
            enableSort: true,
            enableFilter: true,
            ...options
        };

        this.state = {
            comments: [],
            currentPage: 1,
            totalPages: 1,
            sortBy: 'newest', // newest, hottest
            filter: 'all', // all, positive, critical
            isLoading: false,
            hasMore: true,
            replyingTo: null,
            userLikedComments: new Set()
        };

        this.init();
    }

    init() {
        this.buildStructure();
        this.bindEvents();
        this.loadComments();
        this.loadUserLikes();
    }

    // 构建评论系统结构
    buildStructure() {
        this.container.classList.add('comment-system');
        this.container.innerHTML = `
            <div class="comment-header">
                <h3 class="comment-title">
                    <i class="fas fa-comments"></i>
                    评论 <span class="comment-count">0</span>
                </h3>
                <div class="comment-actions">
                    ${this.config.enableSort ? `
                        <div class="comment-sort">
                            <button class="sort-btn active" data-sort="newest">最新</button>
                            <button class="sort-btn" data-sort="hottest">最热</button>
                        </div>
                    ` : ''}
                    ${this.config.enableFilter ? `
                        <div class="comment-filter">
                            <select class="filter-select">
                                <option value="all">全部评论</option>
                                <option value="positive">好评</option>
                                <option value="critical">吐槽</option>
                            </select>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="comment-input-section">
                <div class="comment-input-wrapper">
                    <textarea 
                        class="comment-textarea" 
                        placeholder="发表你的评论..."
                        maxlength="${this.config.maxCommentLength}"
                        rows="3"
                    ></textarea>
                    <div class="comment-input-footer">
                        <span class="char-count">0/${this.config.maxCommentLength}</span>
                        <div class="comment-tools">
                            <button class="tool-btn emoji-btn" title="添加表情">
                                <i class="far fa-smile"></i>
                            </button>
                            <button class="tool-btn image-btn" title="添加图片">
                                <i class="far fa-image"></i>
                            </button>
                        </div>
                        <button class="submit-btn" disabled>
                            <i class="fas fa-paper-plane"></i>
                            发表评论
                        </button>
                    </div>
                </div>
            </div>

            <div class="comment-list-wrapper">
                <div class="comment-list"></div>
                <div class="comment-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <span>加载中...</span>
                </div>
                <div class="comment-empty" style="display: none;">
                    <i class="far fa-comment-dots"></i>
                    <p>暂无评论，快来抢沙发吧！</p>
                </div>
                <button class="load-more-btn" style="display: none;">
                    加载更多评论
                </button>
            </div>
        `;

        // 缓存DOM元素
        this.elements = {
            commentList: this.container.querySelector('.comment-list'),
            commentCount: this.container.querySelector('.comment-count'),
            textarea: this.container.querySelector('.comment-textarea'),
            charCount: this.container.querySelector('.char-count'),
            submitBtn: this.container.querySelector('.submit-btn'),
            loadingIndicator: this.container.querySelector('.comment-loading'),
            emptyState: this.container.querySelector('.comment-empty'),
            loadMoreBtn: this.container.querySelector('.load-more-btn')
        };
    }

    // 绑定事件
    bindEvents() {
        // 文本输入
        this.elements.textarea.addEventListener('input', (e) => {
            const length = e.target.value.length;
            this.elements.charCount.textContent = `${length}/${this.config.maxCommentLength}`;
            this.elements.submitBtn.disabled = length === 0;
        });

        // 提交评论
        this.elements.submitBtn.addEventListener('click', () => this.submitComment());

        // 排序切换
        this.container.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.container.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.sortBy = e.target.dataset.sort;
                this.refreshComments();
            });
        });

        // 筛选切换
        const filterSelect = this.container.querySelector('.filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.state.filter = e.target.value;
                this.refreshComments();
            });
        }

        // 加载更多
        this.elements.loadMoreBtn.addEventListener('click', () => this.loadMore());

        // 评论列表事件委托
        this.elements.commentList.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const commentId = target.closest('.comment-item')?.dataset.id;

            switch (action) {
                case 'like':
                    this.toggleLike(commentId);
                    break;
                case 'reply':
                    this.showReplyForm(commentId);
                    break;
                case 'delete':
                    this.deleteComment(commentId);
                    break;
                case 'report':
                    this.reportComment(commentId);
                    break;
                case 'load-replies':
                    this.loadReplies(commentId);
                    break;
            }
        });

        // 快捷键
        this.elements.textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.submitComment();
            }
        });
    }

    // 加载评论
    async loadComments() {
        if (this.state.isLoading) return;

        this.state.isLoading = true;
        this.elements.loadingIndicator.style.display = 'flex';

        try {
            // 模拟API调用
            const comments = await this.fetchComments();
            
            this.state.comments = comments;
            this.state.totalPages = Math.ceil(comments.length / this.config.pageSize);
            this.state.hasMore = this.state.currentPage < this.state.totalPages;

            this.renderComments();
            this.updateCommentCount(comments.length);
        } catch (error) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('加载评论失败:', error.message);
            }
            this.showError('加载评论失败，请重试');
        } finally {
            this.state.isLoading = false;
            this.elements.loadingIndicator.style.display = 'none';
        }
    }

    // 模拟获取评论数据
    async fetchComments() {
        // 从全局Mock数据获取
        let comments = [];
        if (window.MockData && window.MockData.COMMENTS) {
            comments = window.MockData.COMMENTS.filter(c => {
                if (this.config.novelId) {
                    return c.novel_id === this.config.novelId;
                }
                if (this.config.chapterId) {
                    return c.chapter_id === this.config.chapterId;
                }
                return true;
            });
        }

        // 排序
        if (this.state.sortBy === 'newest') {
            comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (this.state.sortBy === 'hottest') {
            comments.sort((a, b) => b.likes - a.likes);
        }

        // 筛选
        if (this.state.filter === 'positive') {
            comments = comments.filter(c => c.rating >= 4);
        } else if (this.state.filter === 'critical') {
            comments = comments.filter(c => c.rating <= 2);
        }

        return comments;
    }

    // 渲染评论列表
    renderComments() {
        const start = 0;
        const end = this.state.currentPage * this.config.pageSize;
        const displayComments = this.state.comments.slice(start, end);

        if (displayComments.length === 0) {
            this.elements.emptyState.style.display = 'block';
            this.elements.commentList.innerHTML = '';
            return;
        }

        this.elements.emptyState.style.display = 'none';
        this.elements.commentList.innerHTML = displayComments.map(comment => 
            this.renderCommentItem(comment)
        ).join('');

        // 更新加载更多按钮
        this.elements.loadMoreBtn.style.display = this.state.hasMore ? 'block' : 'none';
    }

    // 渲染单个评论
    renderCommentItem(comment, isReply = false) {
        const isLiked = this.state.userLikedComments.has(comment.id);
        const likeClass = isLiked ? 'liked' : '';
        const likeIcon = isLiked ? 'fas' : 'far';

        return `
            <div class="comment-item ${isReply ? 'comment-reply' : ''}" data-id="${comment.id}">
                <div class="comment-avatar">
                    <img src="${comment.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.userId}" alt="${comment.userName}">
                </div>
                <div class="comment-body">
                    <div class="comment-header-row">
                        <span class="comment-author">${comment.userName}</span>
                        ${comment.isAuthor ? '<span class="author-badge">作者</span>' : ''}
                        ${comment.isVip ? '<span class="vip-badge">VIP</span>' : ''}
                        <span class="comment-time">${this.formatTime(comment.time || comment.created_at)}</span>
                    </div>
                    <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                    <div class="comment-footer-row">
                        <button class="action-btn like-btn ${likeClass}" data-action="like">
                            <i class="${likeIcon} fa-thumbs-up"></i>
                            <span>${comment.likes || 0}</span>
                        </button>
                        ${this.config.enableReply ? `
                            <button class="action-btn reply-btn" data-action="reply">
                                <i class="far fa-comment-alt"></i>
                                <span>回复</span>
                            </button>
                        ` : ''}
                        <button class="action-btn report-btn" data-action="report">
                            <i class="far fa-flag"></i>
                        </button>
                        ${comment.isOwner ? `
                            <button class="action-btn delete-btn" data-action="delete">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        ` : ''}
                    </div>
                    ${comment.reply_count > 0 ? `
                        <div class="comment-replies">
                            <button class="load-replies-btn" data-action="load-replies">
                                查看 ${comment.reply_count} 条回复
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 提交评论
    async submitComment() {
        const content = this.elements.textarea.value.trim();
        if (!content) return;

        this.elements.submitBtn.disabled = true;
        this.elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';

        try {
            // 模拟API提交
            await this.simulateSubmit(content);

            // 清空输入框
            this.elements.textarea.value = '';
            this.elements.charCount.textContent = `0/${this.config.maxCommentLength}`;

            // 刷新评论列表
            this.refreshComments();

            // 显示成功提示
            this.showSuccess('评论发表成功！');
        } catch (error) {
            this.showError('评论发表失败，请重试');
        } finally {
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发表评论';
        }
    }

    // 模拟提交
    simulateSubmit(content) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newComment = {
                    id: 'new_' + Date.now(),
                    novel_id: this.config.novelId,
                    chapter_id: this.config.chapterId,
                    userId: 'current_user',
                    userName: '我',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
                    content: content,
                    time: '刚刚',
                    created_at: new Date().toISOString(),
                    likes: 0,
                    reply_count: 0,
                    isOwner: true
                };

                this.state.comments.unshift(newComment);
                resolve(newComment);
            }, 500);
        });
    }

    // 切换点赞
    async toggleLike(commentId) {
        const isLiked = this.state.userLikedComments.has(commentId);
        
        try {
            // 模拟API调用
            await this.simulateLike(commentId, !isLiked);

            if (isLiked) {
                this.state.userLikedComments.delete(commentId);
            } else {
                this.state.userLikedComments.add(commentId);
            }

            // 更新UI
            const comment = this.state.comments.find(c => c.id === commentId);
            if (comment) {
                comment.likes += isLiked ? -1 : 1;
            }

            this.renderComments();
            this.saveUserLikes();
        } catch (error) {
            this.showError('操作失败，请重试');
        }
    }

    // 模拟点赞
    simulateLike(commentId, isLike) {
        return new Promise(resolve => setTimeout(resolve, 200));
    }

    // 显示回复表单
    showReplyForm(commentId) {
        const commentItem = this.elements.commentList.querySelector(`[data-id="${commentId}"]`);
        if (!commentItem) return;

        // 移除其他回复表单
        this.container.querySelectorAll('.reply-form-wrapper').forEach(el => el.remove());

        const replyForm = document.createElement('div');
        replyForm.className = 'reply-form-wrapper';
        replyForm.innerHTML = `
            <div class="reply-form">
                <textarea 
                    class="reply-textarea" 
                    placeholder="回复Ta..."
                    maxlength="${this.config.maxCommentLength}"
                    rows="2"
                    autofocus
                ></textarea>
                <div class="reply-form-footer">
                    <span class="char-count">0/${this.config.maxCommentLength}</span>
                    <button class="cancel-reply-btn">取消</button>
                    <button class="submit-reply-btn" disabled>回复</button>
                </div>
            </div>
        `;

        commentItem.querySelector('.comment-body').appendChild(replyForm);

        // 绑定回复表单事件
        const textarea = replyForm.querySelector('.reply-textarea');
        const charCount = replyForm.querySelector('.char-count');
        const submitBtn = replyForm.querySelector('.submit-reply-btn');
        const cancelBtn = replyForm.querySelector('.cancel-reply-btn');

        textarea.addEventListener('input', (e) => {
            const length = e.target.value.length;
            charCount.textContent = `${length}/${this.config.maxCommentLength}`;
            submitBtn.disabled = length === 0;
        });

        submitBtn.addEventListener('click', () => {
            this.submitReply(commentId, textarea.value);
            replyForm.remove();
        });

        cancelBtn.addEventListener('click', () => {
            replyForm.remove();
        });

        textarea.focus();
    }

    // 提交回复
    async submitReply(parentId, content) {
        try {
            await this.simulateSubmit(content);
            this.refreshComments();
            this.showSuccess('回复成功！');
        } catch (error) {
            this.showError('回复失败，请重试');
        }
    }

    // 加载更多评论
    loadMore() {
        if (this.state.isLoading || !this.state.hasMore) return;

        this.state.currentPage++;
        this.renderComments();
    }

    // 刷新评论
    refreshComments() {
        this.state.currentPage = 1;
        this.loadComments();
    }

    // 更新评论数
    updateCommentCount(count) {
        this.elements.commentCount.textContent = count;
    }

    // 加载用户点赞记录
    loadUserLikes() {
        try {
            const saved = localStorage.getItem('novelhub_comment_likes');
            if (saved) {
                this.state.userLikedComments = new Set(JSON.parse(saved));
            }
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('加载点赞记录失败:', e.message);
            }
        }
    }

    // 保存用户点赞记录
    saveUserLikes() {
        try {
            localStorage.setItem('novelhub_comment_likes', 
                JSON.stringify([...this.state.userLikedComments]));
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('保存点赞记录失败:', e.message);
            }
        }
    }

    // 工具函数：格式化时间
    formatTime(time) {
        if (!time) return '';
        
        if (time === '刚刚') return time;
        
        if (time.includes('小时前') || time.includes('天前') || time.includes('分钟前')) {
            return time;
        }

        const date = new Date(time);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return date.toLocaleDateString('zh-CN');
    }

    // 工具函数：HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示错误提示 - 修复：统一使用 Toast 组件
    showError(message) {
        this.showToast(message, 'error');
    }

    // 显示成功提示 - 修复：统一使用 Toast 组件
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    // 显示Toast - 修复：统一使用 Toast 组件
    showToast(message, type = 'info') {
        // 优先使用全局的 showToast 函数
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else if (typeof window.showError === 'function' && type === 'error') {
            window.showError(message);
        } else if (typeof window.showSuccess === 'function' && type === 'success') {
            window.showSuccess(message);
        } else {
            // 降级方案：创建临时 toast 元素
            this.createFallbackToast(message, type);
        }
    }

    // 降级 Toast 实现
    createFallbackToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            error: '#ef4444',
            success: '#10b981',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 14px;
            animation: slideDown 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 销毁
    destroy() {
        this.container.innerHTML = '';
        this.container.classList.remove('comment-system');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommentSystem;
}

if (typeof window !== 'undefined') {
    window.CommentSystem = CommentSystem;
}
