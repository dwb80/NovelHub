/**
 * UI Consistency Component - NovelHub
 * 统一导航栏、页脚、按钮样式
 * @version 2.0.0
 */

// UI 一致性配置
const UIConsistencyConfig = {
    // 导航栏配置
    navbar: {
        logoText: 'NovelHub',
        logoHref: '/html/index.html',
        navItems: [
            { text: '首页', href: '/html/index.html', page: 'home' },
            { text: '分类', href: '/html/pages/discover/category.html', page: 'category' },
            { text: '排行', href: '/html/pages/discover/ranking.html', page: 'ranking' },
            { text: '书架', href: '/html/pages/bookshelf/my-bookshelf.html', page: 'bookshelf' },
            { text: '学习', href: '/html/pages/openclaw/learning-center.html', page: 'learning' }
        ],
        showSearch: true,
        showThemeToggle: true,
        showUserMenu: true
    },
    
    // 页脚配置
    footer: {
        brand: {
            name: 'NovelHub',
            description: 'AI 驱动的小说创作与阅读平台'
        },
        columns: [
            {
                title: '阅读',
                links: [
                    { text: '分类浏览', href: '/html/pages/discover/category.html' },
                    { text: '排行榜', href: '/html/pages/discover/ranking.html' },
                    { text: '搜索小说', href: '/html/pages/discover/search.html' }
                ]
            },
            {
                title: '我的',
                links: [
                    { text: '我的书架', href: '/html/pages/bookshelf/my-bookshelf.html' },
                    { text: '阅读历史', href: '/html/pages/bookshelf/reading-history.html' },
                    { text: '个人设置', href: '/html/pages/user/settings.html' }
                ]
            },
            {
                title: '关于',
                links: [
                    { text: '关于我们', href: '#', onclick: "alert('关于我们页面即将上线')" },
                    { text: '使用条款', href: '#', onclick: "alert('使用条款页面即将上线')" },
                    { text: '隐私政策', href: '#', onclick: "alert('隐私政策页面即将上线')" }
                ]
            }
        ],
        copyright: '© 2026 NovelHub. All rights reserved. Powered by OpenClaw AI'
    },
    
    // 按钮样式配置
    buttons: {
        primary: {
            className: 'btn-primary',
            styles: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontWeight: '500',
                color: 'var(--color-text-inverse)',
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
            }
        },
        secondary: {
            className: 'btn-secondary',
            styles: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontWeight: '500',
                color: 'var(--color-primary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
            }
        },
        ghost: {
            className: 'btn-ghost',
            styles: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontWeight: '500',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
            }
        },
        danger: {
            className: 'btn-danger',
            styles: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontWeight: '500',
                color: 'var(--color-text-inverse)',
                backgroundColor: 'var(--color-error)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
            }
        },
        icon: {
            className: 'btn-icon',
            styles: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5rem',
                height: '2.5rem',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
            }
        }
    }
};

/**
 * 导航栏管理器
 */
class NavbarManager {
    constructor(config = {}) {
        this.config = { ...UIConsistencyConfig.navbar, ...config };
        this.currentPage = this.detectCurrentPage();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('category')) return 'category';
        if (path.includes('ranking')) return 'ranking';
        if (path.includes('bookshelf')) return 'bookshelf';
        if (path.includes('learning')) return 'learning';
        if (path.includes('index') || path.endsWith('/html/')) return 'home';
        return 'home';
    }

    getRelativePath(absolutePath) {
        const currentPath = window.location.pathname;
        const currentDepth = currentPath.split('/').filter(Boolean).length;
        const prefix = currentDepth > 2 ? '../'.repeat(currentDepth - 2) : '';
        return prefix + absolutePath.replace('/html/', '');
    }

    render() {
        const { logoText, logoHref, navItems, showSearch, showThemeToggle, showUserMenu } = this.config;
        
        const logoLink = this.getRelativePath(logoHref);
        
        return `
            <header id="navbar" class="navbar">
                <div class="navbar-inner">
                    <a href="${logoLink}" class="logo">
                        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        <span class="logo-text">${logoText}</span>
                    </a>
                    <nav class="nav-menu">
                        ${navItems.map(item => {
                            const href = this.getRelativePath(item.href);
                            const isActive = this.currentPage === item.page ? 'active' : '';
                            return `<a href="${href}" class="nav-link ${isActive}" data-page="${item.page}">${item.text}</a>`;
                        }).join('')}
                    </nav>
                    <div class="nav-actions">
                        ${showSearch ? `
                            <button class="btn-icon search-btn" aria-label="搜索" onclick="window.location.href='${this.getRelativePath('/html/pages/discover/search.html')}'">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        ` : ''}
                        ${showUserMenu ? `
                            <div class="user-menu" id="userMenu">
                                <a href="${this.getRelativePath('/html/pages/user/login.html')}" class="btn-primary">登录</a>
                            </div>
                        ` : ''}
                    </div>
                    ${showThemeToggle ? `
                        <button class="theme-toggle" id="themeToggle" aria-label="切换主题">
                            <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                            <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </header>
        `;
    }

    inject(container = document.body) {
        const existingNavbar = container.querySelector('.navbar');
        if (existingNavbar) {
            existingNavbar.outerHTML = this.render();
        } else {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = this.render();
            container.insertBefore(wrapper.firstElementChild, container.firstChild);
        }
        this.initThemeToggle();
    }

    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const themes = ['theme-light', 'theme-paper', 'theme-dark', 'theme-eye-care'];
        const savedTheme = localStorage.getItem('novelhub-theme') || 'theme-light';
        document.body.className = savedTheme;

        themeToggle.addEventListener('click', () => {
            const currentTheme = themes.find(t => document.body.classList.contains(t)) || 'theme-light';
            const currentIndex = themes.indexOf(currentTheme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];
            
            document.body.className = nextTheme;
            localStorage.setItem('novelhub-theme', nextTheme);
        });
    }
}

/**
 * 页脚管理器
 */
class FooterManager {
    constructor(config = {}) {
        this.config = { ...UIConsistencyConfig.footer, ...config };
    }

    getRelativePath(absolutePath) {
        const currentPath = window.location.pathname;
        const currentDepth = currentPath.split('/').filter(Boolean).length;
        const prefix = currentDepth > 2 ? '../'.repeat(currentDepth - 2) : '';
        return prefix + absolutePath.replace('/html/', '');
    }

    render() {
        const { brand, columns, copyright } = this.config;
        
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-inner">
                        <div class="footer-brand">
                            <div class="logo">
                                <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                                <span class="logo-text">${brand.name}</span>
                            </div>
                            <p class="footer-desc">${brand.description}</p>
                        </div>
                        <div class="footer-links">
                            ${columns.map(column => `
                                <div class="footer-column">
                                    <h4 class="footer-title">${column.title}</h4>
                                    ${column.links.map(link => {
                                        const href = link.href.startsWith('#') ? link.href : this.getRelativePath(link.href);
                                        const onclick = link.onclick ? `onclick="${link.onclick}; return false;"` : '';
                                        return `<a href="${href}" class="footer-link" ${onclick}>${link.text}</a>`;
                                    }).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>${copyright}</p>
                    </div>
                </div>
            </footer>
        `;
    }

    inject(container = document.body) {
        const existingFooter = container.querySelector('.footer');
        if (existingFooter) {
            existingFooter.outerHTML = this.render();
        } else {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = this.render();
            container.appendChild(wrapper.firstElementChild);
        }
    }
}

/**
 * 按钮样式管理器
 */
class ButtonStyleManager {
    constructor(config = {}) {
        this.config = { ...UIConsistencyConfig.buttons, ...config };
        this.init();
    }

    init() {
        // 添加按钮基础样式
        this.injectButtonStyles();
        
        // 标准化现有按钮
        this.normalizeButtons();
    }

    injectButtonStyles() {
        if (document.getElementById('ui-consistency-btn-styles')) return;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'ui-consistency-btn-styles';
        styleSheet.textContent = `
            /* 统一按钮基础样式 */
            .btn-primary {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.625rem 1.25rem;
                font-weight: 500;
                color: var(--color-text-inverse, #ffffff);
                background-color: var(--color-primary, #6366f1);
                border: none;
                border-radius: var(--radius-md, 0.5rem);
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                font-size: 0.875rem;
                line-height: 1.5;
            }

            .btn-primary:hover {
                background-color: var(--color-primary-hover, #4f46e5);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }

            .btn-primary:active {
                transform: translateY(0);
            }

            .btn-primary:disabled,
            .btn-primary.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            .btn-secondary {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.625rem 1.25rem;
                font-weight: 500;
                color: var(--color-primary, #6366f1);
                background-color: transparent;
                border: 1px solid var(--color-primary, #6366f1);
                border-radius: var(--radius-md, 0.5rem);
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                font-size: 0.875rem;
                line-height: 1.5;
            }

            .btn-secondary:hover {
                background-color: var(--color-primary-light, rgba(99, 102, 241, 0.1));
            }

            .btn-secondary:disabled,
            .btn-secondary.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .btn-ghost {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.625rem 1.25rem;
                font-weight: 500;
                color: var(--color-text-secondary, #64748b);
                background-color: transparent;
                border: none;
                border-radius: var(--radius-md, 0.5rem);
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                font-size: 0.875rem;
                line-height: 1.5;
            }

            .btn-ghost:hover {
                background-color: var(--color-bg-tertiary, #f1f5f9);
                color: var(--color-text-primary, #1e293b);
            }

            .btn-danger {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.625rem 1.25rem;
                font-weight: 500;
                color: var(--color-text-inverse, #ffffff);
                background-color: var(--color-error, #ef4444);
                border: none;
                border-radius: var(--radius-md, 0.5rem);
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                font-size: 0.875rem;
                line-height: 1.5;
            }

            .btn-danger:hover {
                background-color: var(--color-error-dark, #dc2626);
            }

            .btn-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 2.5rem;
                height: 2.5rem;
                padding: 0;
                color: var(--color-text-secondary, #64748b);
                background-color: transparent;
                border: none;
                border-radius: var(--radius-md, 0.5rem);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-icon:hover {
                color: var(--color-text-primary, #1e293b);
                background-color: var(--color-bg-tertiary, #f1f5f9);
            }

            .btn-icon svg {
                width: 1.25rem;
                height: 1.25rem;
            }

            /* 按钮尺寸变体 */
            .btn-xs {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
            }

            .btn-sm {
                padding: 0.375rem 0.75rem;
                font-size: 0.875rem;
            }

            .btn-lg {
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
            }

            .btn-xl {
                padding: 1rem 2rem;
                font-size: 1.125rem;
            }

            /* 块级按钮 */
            .btn-block {
                width: 100%;
            }

            /* 按钮组 */
            .btn-group {
                display: inline-flex;
                gap: 0.5rem;
            }

            .btn-group-vertical {
                display: inline-flex;
                flex-direction: column;
                gap: 0.5rem;
            }
        `;

        document.head.appendChild(styleSheet);
    }

    normalizeButtons() {
        // 查找所有按钮并标准化
        const buttonSelectors = [
            'button:not([class])',
            'input[type="button"]:not([class])',
            'input[type="submit"]:not([class])',
            '.btn:not([class*="btn-"])'
        ];

        document.querySelectorAll(buttonSelectors.join(', ')).forEach(btn => {
            // 根据按钮类型添加相应类名
            if (btn.type === 'submit' || btn.dataset.type === 'primary') {
                btn.classList.add('btn-primary');
            } else if (btn.dataset.type === 'danger') {
                btn.classList.add('btn-danger');
            } else if (btn.dataset.type === 'ghost') {
                btn.classList.add('btn-ghost');
            } else {
                btn.classList.add('btn-secondary');
            }
        });
    }

    createButton(options = {}) {
        const {
            type = 'primary', // primary, secondary, ghost, danger, icon
            text = '',
            icon = null,
            href = null,
            onClick = null,
            size = null, // xs, sm, lg, xl
            block = false,
            disabled = false,
            className = '',
            attributes = {}
        } = options;

        const tag = href ? 'a' : 'button';
        const baseClass = type === 'icon' ? 'btn-icon' : `btn-${type}`;
        const sizeClass = size ? `btn-${size}` : '';
        const blockClass = block ? 'btn-block' : '';
        const disabledAttr = disabled ? (href ? 'aria-disabled="true"' : 'disabled') : '';

        const iconHTML = icon ? `<span class="btn-icon-svg">${icon}</span>` : '';

        const attrs = Object.entries(attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');

        const clickHandler = onClick && !href ? `onclick="${onClick}"` : '';
        const hrefAttr = href ? `href="${href}"` : '';

        return `
            <${tag} 
                class="${baseClass} ${sizeClass} ${blockClass} ${className}" 
                ${disabledAttr}
                ${hrefAttr}
                ${clickHandler}
                ${attrs}
            >
                ${iconHTML}
                ${text}
            </${tag}>
        `;
    }
}

/**
 * UI 一致性管理器
 */
class UIConsistencyManager {
    constructor(config = {}) {
        this.navbar = new NavbarManager(config.navbar);
        this.footer = new FooterManager(config.footer);
        this.buttons = new ButtonStyleManager(config.buttons);
    }

    init() {
        // 自动注入导航栏和页脚
        const app = document.getElementById('app') || document.body;
        
        // 检查是否已有导航栏
        if (!app.querySelector('.navbar')) {
            this.navbar.inject(app);
        }
        
        // 检查是否已有页脚
        if (!app.querySelector('.footer')) {
            this.footer.inject(app);
        }
    }
}

// 创建全局实例
const uiConsistency = new UIConsistencyManager();

// 导出
export {
    UIConsistencyManager,
    NavbarManager,
    FooterManager,
    ButtonStyleManager,
    UIConsistencyConfig,
    uiConsistency
};

export default uiConsistency;

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.UIConsistencyManager = UIConsistencyManager;
    window.NavbarManager = NavbarManager;
    window.FooterManager = FooterManager;
    window.ButtonStyleManager = ButtonStyleManager;
    window.UIConsistencyConfig = UIConsistencyConfig;
    window.uiConsistency = uiConsistency;

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => uiConsistency.init());
    } else {
        uiConsistency.init();
    }
}
