/**
 * Breadcrumb Component
 * NovelHub - 面包屑导航组件
 * 提供统一的面包屑导航功能
 * @version 1.0.0
 */

/**
 * 面包屑配置
 * 定义各页面的层级结构
 */
const BREADCRUMB_CONFIG = {
    // 分类页
    'category.html': [
        { label: '首页', link: '/' },
        { label: '分类浏览', link: null }
    ],
    // 排行页
    'ranking.html': [
        { label: '首页', link: '/' },
        { label: '排行榜', link: null }
    ],
    'discover/ranking/index.html': [
        { label: '首页', link: '/' },
        { label: '排行榜', link: null }
    ],
    // 搜索结果页
    'search.html': [
        { label: '首页', link: '/' },
        { label: '搜索', link: null }
    ],
    'discover/search/results.html': [
        { label: '首页', link: '/' },
        { label: '搜索结果', link: null }
    ],
    // 小说详情页
    'detail.html': [
        { label: '首页', link: '/' },
        { label: '小说详情', link: null }
    ],
    'novel/detail.html': [
        { label: '首页', link: '/' },
        { label: '小说详情', link: null }
    ],
    // 小说目录页
    'catalog.html': [
        { label: '首页', link: '/' },
        { label: '小说详情', link: 'detail.html' },
        { label: '目录', link: null }
    ],
    'novel/catalog.html': [
        { label: '首页', link: '/' },
        { label: '小说详情', link: 'detail.html' },
        { label: '目录', link: null }
    ],
    // 阅读页
    'reading.html': [
        { label: '首页', link: '/' },
        { label: '小说详情', link: 'detail.html' },
        { label: '阅读', link: null }
    ],
    'reader/reading.html': [
        { label: '首页', link: '/' },
        { label: '小说详情', link: '../novel/detail.html' },
        { label: '阅读', link: null }
    ],
    // 书架页
    'bookshelf.html': [
        { label: '首页', link: '/' },
        { label: '我的书架', link: null }
    ],
    'user/bookshelf.html': [
        { label: '首页', link: '/' },
        { label: '我的书架', link: null }
    ],
    'bookshelf/my-bookshelf.html': [
        { label: '首页', link: '/' },
        { label: '我的书架', link: null }
    ],
    // 阅读历史
    'history.html': [
        { label: '首页', link: '/' },
        { label: '阅读历史', link: null }
    ],
    'user/history.html': [
        { label: '首页', link: '/' },
        { label: '阅读历史', link: null }
    ],
    'bookshelf/reading-history.html': [
        { label: '首页', link: '/' },
        { label: '阅读历史', link: null }
    ],
    // 收藏夹
    'favorites.html': [
        { label: '首页', link: '/' },
        { label: '我的收藏', link: null }
    ],
    'user/favorites.html': [
        { label: '首页', link: '/' },
        { label: '我的收藏', link: null }
    ],
    // 用户设置
    'settings.html': [
        { label: '首页', link: '/' },
        { label: '个人设置', link: null }
    ],
    'user/settings.html': [
        { label: '首页', link: '/' },
        { label: '个人设置', link: null }
    ],
    // 用户资料
    'profile.html': [
        { label: '首页', link: '/' },
        { label: '个人资料', link: null }
    ],
    'user/profile.html': [
        { label: '首页', link: '/' },
        { label: '个人资料', link: null }
    ],
    // 通知中心
    'notifications.html': [
        { label: '首页', link: '/' },
        { label: '通知中心', link: null }
    ],
    'user/notifications.html': [
        { label: '首页', link: '/' },
        { label: '通知中心', link: null }
    ],
    // 作者中心
    'author-center.html': [
        { label: '首页', link: '/' },
        { label: '作者中心', link: null }
    ],
    'author/author-center.html': [
        { label: '首页', link: '/' },
        { label: '作者中心', link: null }
    ],
    // 作者详情
    'author/detail.html': [
        { label: '首页', link: '/' },
        { label: '作者详情', link: null }
    ],
    // 社区论坛
    'forum.html': [
        { label: '首页', link: '/' },
        { label: '社区论坛', link: null }
    ],
    'community/forum.html': [
        { label: '首页', link: '/' },
        { label: '社区论坛', link: null }
    ],
    // 话题详情
    'topic.html': [
        { label: '首页', link: '/' },
        { label: '社区论坛', link: 'forum.html' },
        { label: '话题详情', link: null }
    ],
    'community/topic.html': [
        { label: '首页', link: '/' },
        { label: '社区论坛', link: 'forum.html' },
        { label: '话题详情', link: null }
    ],
    // OpenClaw学习中心
    'learning-center.html': [
        { label: '首页', link: '/' },
        { label: '学习中心', link: null }
    ],
    'openclaw/learning-center.html': [
        { label: '首页', link: '/' },
        { label: '学习中心', link: null }
    ],
    // 管理后台页面
    'admin/dashboard.html': [
        { label: '管理后台', link: null }
    ],
    'admin/novels.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: '小说管理', link: null }
    ],
    'admin/chapters.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: '章节管理', link: null }
    ],
    'admin/users.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: '用户管理', link: null }
    ],
    'admin/comments.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: '评论管理', link: null }
    ],
    'admin/settings.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: '系统设置', link: null }
    ],
    'admin/sensitive.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: '敏感词管理', link: null }
    ],
    'admin/openclaw.html': [
        { label: '管理后台', link: 'dashboard.html' },
        { label: 'OpenClaw管理', link: null }
    ]
};

/**
 * 面包屑导航组件类
 */
class Breadcrumb {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            items: [],
            separator: 'chevron', // chevron, slash, arrow
            homeIcon: true,
            maxItems: 0, // 0 = 不限制
            ...options
        };
        
        this.element = null;
    }

    /**
     * 渲染面包屑
     */
    render() {
        if (!this.container) return null;
        
        const items = this.options.items;
        if (!items || items.length === 0) return null;
        
        this.element = document.createElement('nav');
        this.element.className = 'breadcrumb';
        this.element.setAttribute('aria-label', '面包屑导航');
        
        const list = document.createElement('ol');
        list.className = 'breadcrumb-list';
        
        items.forEach((item, index) => {
            const isLast = index === items.length - 1;
            const listItem = this.createBreadcrumbItem(item, isLast, index);
            list.appendChild(listItem);
        });
        
        this.element.appendChild(list);
        this.container.innerHTML = '';
        this.container.appendChild(this.element);
        
        return this.element;
    }

    /**
     * 创建单个面包屑项
     */
    createBreadcrumbItem(item, isLast, index) {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        
        if (isLast) {
            li.classList.add('breadcrumb-item-current');
            li.setAttribute('aria-current', 'page');
        }
        
        // 添加分隔符（除了第一项）
        if (index > 0) {
            const separator = document.createElement('span');
            separator.className = `breadcrumb-separator breadcrumb-separator-${this.options.separator}`;
            separator.setAttribute('aria-hidden', 'true');
            separator.innerHTML = this.getSeparatorIcon();
            li.appendChild(separator);
        }
        
        // 创建链接或文本
        if (isLast || !item.link) {
            const span = document.createElement('span');
            span.className = 'breadcrumb-text';
            if (index === 0 && this.options.homeIcon) {
                span.innerHTML = `<svg class="breadcrumb-home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>${item.label}`;
            } else {
                span.textContent = item.label;
            }
            li.appendChild(span);
        } else {
            const link = document.createElement('a');
            link.className = 'breadcrumb-link';
            link.href = item.link;
            if (index === 0 && this.options.homeIcon) {
                link.innerHTML = `<svg class="breadcrumb-home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>${item.label}`;
            } else {
                link.textContent = item.label;
            }
            li.appendChild(link);
        }
        
        return li;
    }

    /**
     * 获取分隔符图标
     */
    getSeparatorIcon() {
        switch (this.options.separator) {
            case 'slash':
                return '/';
            case 'arrow':
                return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
            case 'chevron':
            default:
                return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        }
    }

    /**
     * 更新面包屑项
     */
    update(items) {
        this.options.items = items;
        this.render();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

/**
 * 自动初始化面包屑
 * 根据当前页面路径自动创建面包屑
 */
function initBreadcrumb(container, customItems = null) {
    const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    
    if (!containerEl) return null;
    
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    const relativePath = currentPath.replace(/^.*\/pages\//, '');
    
    // 确定面包屑项
    let items = customItems;
    
    if (!items) {
        // 尝试从配置中查找
        items = BREADCRUMB_CONFIG[relativePath] || 
                BREADCRUMB_CONFIG[pageName] ||
                BREADCRUMB_CONFIG[relativePath.replace('pages/', '')];
    }
    
    // 如果没有找到配置，使用默认的首页
    if (!items) {
        // 检查是否在深层页面
        const pathParts = relativePath.split('/');
        if (pathParts.length > 1) {
            items = [
                { label: '首页', link: '/' }
            ];
            // 尝试从路径构建面包屑
            const sectionNames = {
                'admin': '管理后台',
                'user': '用户中心',
                'novel': '小说',
                'author': '作者',
                'bookshelf': '书架',
                'community': '社区',
                'discover': '发现',
                'reader': '阅读',
                'openclaw': '学习中心',
                'review': '审核'
            };
            
            const section = pathParts[0];
            if (sectionNames[section]) {
                items.push({ label: sectionNames[section], link: null });
            }
        }
    }
    
    if (!items || items.length === 0) {
        // 首页不显示面包屑
        return null;
    }
    
    const breadcrumb = new Breadcrumb(containerEl, { items });
    return breadcrumb.render();
}

/**
 * 为页面动态添加面包屑容器
 */
function addBreadcrumbToPage() {
    // 检查是否已存在面包屑
    if (document.querySelector('.breadcrumb')) return;
    
    // 查找合适的位置插入面包屑
    const mainContent = document.querySelector('main') || document.querySelector('.main-content');
    const pageHeader = document.querySelector('.page-header') || document.querySelector('h1')?.parentElement;
    
    let container;
    if (pageHeader) {
        container = document.createElement('div');
        container.className = 'breadcrumb-container';
        pageHeader.insertBefore(container, pageHeader.firstChild);
    } else if (mainContent) {
        container = document.createElement('div');
        container.className = 'breadcrumb-container';
        mainContent.insertBefore(container, mainContent.firstChild);
    }
    
    if (container) {
        initBreadcrumb(container);
    }
}

// 导出
export { Breadcrumb, initBreadcrumb, addBreadcrumbToPage, BREADCRUMB_CONFIG };

export default {
    Breadcrumb,
    initBreadcrumb,
    addBreadcrumbToPage,
    BREADCRUMB_CONFIG
};
