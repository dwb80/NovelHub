/**
 * Empty States Component
 * NovelHub - Empty State, Error State, and Loading State Components
 * UX-P1-002 Fix: 统一空状态图标风格
 * @version 2.0.0
 */

// ========== Unified Icon System ==========

/**
 * 统一图标库 - 使用一致的线条风格和尺寸
 * 所有图标使用 24x24 viewBox, stroke-width="1.5", 无填充
 */
const UNIFIED_ICONS = {
    /**
     * 书架/书籍图标
     */
    bookshelf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>`,
    
    /**
     * 搜索图标
     */
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>`,
    
    /**
     * 收藏/书签图标
     */
    favorites: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>`,
    
    /**
     * 历史/时钟图标
     */
    history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>`,
    
    /**
     * 通知/铃铛图标
     */
    notifications: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>`,
    
    /**
     * 评论/消息图标
     */
    comments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>`,
    
    /**
     * 网络错误图标
     */
    network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>`,
    
    /**
     * 错误/警告图标
     */
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>`,
    
    /**
     * 离线图标
     */
    offline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`,
    
    /**
     * 维护图标
     */
    maintenance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>`,
    
    /**
     * 未授权/锁定图标
     */
    unauthorized: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>`,
    
    /**
     * 禁止访问图标
     */
    forbidden: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`,
    
    /**
     * 404/未找到图标
     */
    notFound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`,
    
    /**
     * 文档/文件图标
     */
    document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>`,
    
    /**
     * 用户图标
     */
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>`,
    
    /**
     * 设置图标
     */
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>`,
    
    /**
     * 默认/通用图标
     */
    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>`,
    
    /**
     * 成功图标
     */
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`,
    
    /**
     * 信息图标
     */
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`,
    
    /**
     * 警告图标
     */
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>`
};

// ========== Empty State Templates ==========

const EMPTY_STATE_TEMPLATES = {
    bookshelf: {
        icon: UNIFIED_ICONS.bookshelf,
        title: '书架空空如也',
        description: '还没有收藏任何小说，快去发现精彩作品吧',
        actionText: '去发现好书',
        actionLink: '/',
        theme: 'default'
    },
    search: {
        icon: UNIFIED_ICONS.search,
        title: '未找到相关结果',
        description: '换个关键词试试，或者浏览推荐内容',
        actionText: '清除搜索',
        actionLink: null,
        theme: 'default'
    },
    favorites: {
        icon: UNIFIED_ICONS.favorites,
        title: '暂无收藏',
        description: '收藏喜欢的小说，方便下次快速阅读',
        actionText: '去浏览小说',
        actionLink: '/',
        theme: 'default'
    },
    history: {
        icon: UNIFIED_ICONS.history,
        title: '暂无阅读记录',
        description: '开始阅读小说，记录将显示在这里',
        actionText: '开始阅读',
        actionLink: '/',
        theme: 'default'
    },
    notifications: {
        icon: UNIFIED_ICONS.notifications,
        title: '暂无通知',
        description: '有新消息时会及时通知您',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    comments: {
        icon: UNIFIED_ICONS.comments,
        title: '暂无评论',
        description: '成为第一个评论的人吧',
        actionText: '发表评论',
        actionLink: null,
        theme: 'default'
    },
    network: {
        icon: UNIFIED_ICONS.network,
        title: '网络连接失败',
        description: '请检查网络设置后重试',
        actionText: '重新加载',
        actionLink: null,
        theme: 'error'
    },
    error: {
        icon: UNIFIED_ICONS.error,
        title: '加载失败',
        description: '内容加载出错，请稍后重试',
        actionText: '重新加载',
        actionLink: null,
        theme: 'error'
    },
    offline: {
        icon: UNIFIED_ICONS.offline,
        title: '离线状态',
        description: '您当前处于离线状态，部分功能可能无法使用',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'warning'
    },
    maintenance: {
        icon: UNIFIED_ICONS.maintenance,
        title: '系统维护中',
        description: '我们正在升级系统，请稍后再试',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'warning'
    },
    unauthorized: {
        icon: UNIFIED_ICONS.unauthorized,
        title: '需要登录',
        description: '请先登录后查看此内容',
        actionText: '立即登录',
        actionLink: '/pages/user/login.html',
        theme: 'warning'
    },
    forbidden: {
        icon: UNIFIED_ICONS.forbidden,
        title: '访问受限',
        description: '您没有权限访问此内容',
        actionText: '返回首页',
        actionLink: '/',
        theme: 'error'
    },
    notFound: {
        icon: UNIFIED_ICONS.notFound,
        title: '页面不存在',
        description: '您访问的页面可能已被删除或不存在',
        actionText: '返回首页',
        actionLink: '/',
        theme: 'error'
    },
    document: {
        icon: UNIFIED_ICONS.document,
        title: '暂无文档',
        description: '相关内容正在准备中，敬请期待',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    user: {
        icon: UNIFIED_ICONS.user,
        title: '暂无用户信息',
        description: '用户信息加载失败或不存在',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'default'
    },
    settings: {
        icon: UNIFIED_ICONS.settings,
        title: '暂无设置项',
        description: '设置内容正在准备中',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    default: {
        icon: UNIFIED_ICONS.default,
        title: '暂无数据',
        description: '相关内容为空',
        actionText: null,
        actionLink: null,
        theme: 'default'
    }
};

// ========== Empty State Component ==========

class EmptyState {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            type: 'default',
            icon: null,
            title: '',
            description: '',
            actionText: null,
            actionLink: null,
            actionCallback: null,
            theme: 'default',
            compact: false,
            ...options
        };
        
        this.element = null;
    }

    render() {
        if (!this.container) return;
        
        // Get template if type is specified
        let template = {};
        if (this.options.type && EMPTY_STATE_TEMPLATES[this.options.type]) {
            template = EMPTY_STATE_TEMPLATES[this.options.type];
        }
        
        // Merge options with template
        const config = {
            icon: this.options.icon || template.icon || UNIFIED_ICONS.default,
            title: this.options.title || template.title || '暂无数据',
            description: this.options.description || template.description || '',
            actionText: this.options.actionText !== undefined 
                ? this.options.actionText 
                : template.actionText,
            actionLink: this.options.actionLink !== undefined 
                ? this.options.actionLink 
                : template.actionLink,
            theme: this.options.theme || template.theme || 'default'
        };
        
        // Create element
        this.element = document.createElement('div');
        this.element.className = `empty-state empty-state-${config.theme} ${this.options.compact ? 'empty-state-compact' : ''}`;
        
        this.element.innerHTML = `
            <div class="empty-state-icon">
                ${config.icon}
            </div>
            <h3 class="empty-state-title">${config.title}</h3>
            ${config.description ? `<p class="empty-state-description">${config.description}</p>` : ''}
            ${config.actionText ? `
                <button class="empty-state-action btn-primary" data-action="empty-state-action">
                    ${config.actionText}
                </button>
            ` : ''}
        `;
        
        // Bind action
        const actionBtn = this.element.querySelector('[data-action="empty-state-action"]');
        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
                if (this.options.actionCallback) {
                    this.options.actionCallback(e);
                } else if (config.actionLink) {
                    window.location.href = config.actionLink;
                } else {
                    // Default retry action
                    this.retry();
                }
            });
        }
        
        // Clear container and append
        this.container.innerHTML = '';
        this.container.appendChild(this.element);
        
        return this.element;
    }

    retry() {
        // Default retry behavior - reload the page
        window.location.reload();
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }

    update(options) {
        this.options = { ...this.options, ...options };
        this.render();
    }
}

// ========== Error State Component ==========

class ErrorState extends EmptyState {
    constructor(container, options = {}) {
        super(container, {
            type: 'error',
            theme: 'error',
            ...options
        });
    }

    retry() {
        if (this.options.onRetry) {
            this.options.onRetry();
        } else {
            window.location.reload();
        }
    }
}

// ========== Network Error State ==========

class NetworkErrorState extends EmptyState {
    constructor(container, options = {}) {
        super(container, {
            type: 'network',
            theme: 'error',
            ...options
        });
    }

    checkConnection() {
        return navigator.onLine;
    }

    retry() {
        if (!this.checkConnection()) {
            this.showOfflineWarning();
            return;
        }

        if (this.options.onRetry) {
            this.options.onRetry();
        } else {
            window.location.reload();
        }
    }

    showOfflineWarning() {
        // Show toast or inline warning
        if (window.showToast) {
            window.showToast('网络连接不可用，请检查网络设置', 'warning');
        }
        
        // Update description temporarily
        const descEl = this.element?.querySelector('.empty-state-description');
        if (descEl) {
            const originalText = descEl.textContent;
            descEl.textContent = '网络连接不可用，请检查网络设置后重试';
            descEl.style.color = 'var(--color-error)';
            
            setTimeout(() => {
                descEl.textContent = originalText;
                descEl.style.color = '';
            }, 3000);
        }
    }
}

// ========== Loading State Component ==========

class LoadingState {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            type: 'spinner', // spinner, skeleton, dots
            text: '加载中...',
            fullscreen: false,
            overlay: false,
            ...options
        };
        
        this.element = null;
    }

    render() {
        if (!this.container) return;
        
        this.element = document.createElement('div');
        this.element.className = `loading-state loading-state-${this.options.type} ${this.options.fullscreen ? 'loading-state-fullscreen' : ''} ${this.options.overlay ? 'loading-state-overlay' : ''}`;
        
        let content = '';
        
        switch (this.options.type) {
            case 'spinner':
                content = `
                    <div class="loading-spinner"></div>
                    ${this.options.text ? `<p class="loading-text">${this.options.text}</p>` : ''}
                `;
                break;
            case 'dots':
                content = `
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    ${this.options.text ? `<p class="loading-text">${this.options.text}</p>` : ''}
                `;
                break;
            case 'skeleton':
                content = this.getSkeletonHTML();
                break;
            case 'pulse':
                content = `
                    <div class="loading-pulse"></div>
                    ${this.options.text ? `<p class="loading-text">${this.options.text}</p>` : ''}
                `;
                break;
        }
        
        this.element.innerHTML = content;
        
        this.container.innerHTML = '';
        this.container.appendChild(this.element);
        
        return this.element;
    }

    getSkeletonHTML() {
        const lines = this.options.lines || 3;
        let html = '<div class="loading-skeleton">';
        
        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? '70%' : '100%';
            html += `<div class="skeleton-line" style="width: ${width}"></div>`;
        }
        
        html += '</div>';
        return html;
    }

    show() {
        if (!this.element) {
            this.render();
        }
        this.element.style.display = 'flex';
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

// ========== Utility Functions ==========

/**
 * Show empty state in container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} options - Empty state options
 * @returns {EmptyState} Empty state instance
 */
export function showEmptyState(container, options = {}) {
    const emptyState = new EmptyState(container, options);
    emptyState.render();
    return emptyState;
}

/**
 * Show error state in container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} options - Error state options
 * @returns {ErrorState} Error state instance
 */
export function showErrorState(container, options = {}) {
    const errorState = new ErrorState(container, options);
    errorState.render();
    return errorState;
}

/**
 * Show network error state in container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} options - Network error options
 * @returns {NetworkErrorState} Network error state instance
 */
export function showNetworkError(container, options = {}) {
    const networkError = new NetworkErrorState(container, options);
    networkError.render();
    return networkError;
}

/**
 * Show loading state in container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Object} options - Loading state options
 * @returns {LoadingState} Loading state instance
 */
export function showLoading(container, options = {}) {
    const loading = new LoadingState(container, options);
    loading.render();
    return loading;
}

/**
 * Hide all states in container and restore original content
 * @param {HTMLElement|string} container - Container element or selector
 */
export function hideAllStates(container) {
    const el = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (el) {
        // Remove all state elements
        const states = el.querySelectorAll('.empty-state, .loading-state, .error-state');
        states.forEach(state => state.remove());
    }
}

/**
 * Check if online and show appropriate state
 * @param {HTMLElement|string} container - Container element or selector
 * @param {Function} onlineCallback - Callback when online
 * @param {Object} options - Options for offline state
 */
export function checkOnlineStatus(container, onlineCallback, options = {}) {
    if (navigator.onLine) {
        hideAllStates(container);
        if (onlineCallback) onlineCallback();
        return true;
    } else {
        showNetworkError(container, options);
        return false;
    }
}

// ========== Add Styles ==========

const emptyStateStyles = document.createElement('style');
emptyStateStyles.textContent = `
    /* Empty State Base - UX-P1-002 Fix: 统一空状态样式 */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
        animation: empty-state-fade-in 0.3s ease-out;
    }
    
    @keyframes empty-state-fade-in {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .empty-state-compact {
        padding: 2rem 1rem;
    }
    
    /* 统一图标尺寸和颜色 */
    .empty-state-icon {
        width: 80px;
        height: 80px;
        color: var(--color-text-muted, #94a3b8);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .empty-state-compact .empty-state-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 1rem;
    }
    
    .empty-state-icon svg {
        width: 100%;
        height: 100%;
        stroke-width: 1.5;
    }
    
    /* 统一标题样式 */
    .empty-state-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary, #1e293b);
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
    }
    
    .empty-state-compact .empty-state-title {
        font-size: 1rem;
    }
    
    /* 统一描述样式 */
    .empty-state-description {
        font-size: 0.9375rem;
        color: var(--color-text-secondary, #64748b);
        margin: 0 0 1.5rem 0;
        max-width: 320px;
        line-height: 1.6;
    }
    
    .empty-state-compact .empty-state-description {
        font-size: 0.875rem;
        margin-bottom: 1rem;
    }
    
    /* 统一操作按钮样式 */
    .empty-state-action {
        min-width: 140px;
        padding: 0.625rem 1.5rem;
        font-size: 0.9375rem;
        font-weight: 500;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.15s ease;
    }
    
    .empty-state-action:hover {
        transform: translateY(-1px);
    }
    
    .empty-state-action:active {
        transform: translateY(0);
    }
    
    /* Theme Variants - 统一主题色 */
    .empty-state-error .empty-state-icon {
        color: var(--color-error, #ef4444);
    }
    
    .empty-state-warning .empty-state-icon {
        color: var(--color-warning, #f59e0b);
    }
    
    .empty-state-success .empty-state-icon {
        color: var(--color-success, #10b981);
    }
    
    .empty-state-info .empty-state-icon {
        color: var(--color-info, #3b82f6);
    }
    
    /* Loading State */
    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        animation: loading-fade-in 0.2s ease-out;
    }
    
    @keyframes loading-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .loading-state-fullscreen {
        position: fixed;
        inset: 0;
        background: var(--color-bg-primary, #ffffff);
        z-index: 9999;
    }
    
    .loading-state-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        z-index: 100;
    }
    
    /* 统一加载动画 - 使用标准spinner */
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-bg-tertiary, #f1f5f9);
        border-top-color: var(--color-primary, #6366f1);
        border-radius: 50%;
        animation: loading-spin 0.8s linear infinite;
    }
    
    @keyframes loading-spin {
        to { transform: rotate(360deg); }
    }
    
    /* Dots Loading */
    .loading-dots {
        display: flex;
        gap: 0.5rem;
    }
    
    .loading-dots span {
        width: 10px;
        height: 10px;
        background: var(--color-primary, #6366f1);
        border-radius: 50%;
        animation: loading-dots 1.4s infinite ease-in-out both;
    }
    
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes loading-dots {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
    
    /* Pulse Loading */
    .loading-pulse {
        width: 48px;
        height: 48px;
        background: var(--color-primary, #6366f1);
        border-radius: 50%;
        animation: loading-pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes loading-pulse {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
    }
    
    /* Skeleton Loading */
    .loading-skeleton {
        width: 100%;
        max-width: 400px;
    }
    
    .skeleton-line {
        height: 1rem;
        background: linear-gradient(90deg, var(--color-bg-tertiary, #f1f5f9) 25%, var(--color-bg-secondary, #f8fafc) 50%, var(--color-bg-tertiary, #f1f5f9) 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 0.25rem;
        margin-bottom: 0.75rem;
    }
    
    @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    .loading-text {
        font-size: 0.9375rem;
        color: var(--color-text-secondary, #64748b);
        margin-top: 1rem;
    }
    
    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
        .empty-state,
        .loading-state,
        .loading-spinner,
        .loading-dots span,
        .loading-pulse,
        .skeleton-line {
            animation: none;
        }
        
        .skeleton-line {
            background: var(--color-bg-tertiary, #f1f5f9);
        }
    }
`;
document.head.appendChild(emptyStateStyles);

// ========== Exports ==========

export {
    EmptyState,
    ErrorState,
    NetworkErrorState,
    LoadingState,
    EMPTY_STATE_TEMPLATES,
    UNIFIED_ICONS
};

export default {
    EmptyState,
    ErrorState,
    NetworkErrorState,
    LoadingState,
    showEmptyState,
    showErrorState,
    showNetworkError,
    showLoading,
    hideAllStates,
    checkOnlineStatus,
    EMPTY_STATE_TEMPLATES,
    UNIFIED_ICONS
};
