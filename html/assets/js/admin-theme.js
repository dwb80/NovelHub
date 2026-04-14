/**
 * Admin Theme Manager - NovelHub
 * 管理后台主题管理模块
 * @version 1.0.0
 */

// 主题配置
const ADMIN_THEMES = {
    LIGHT: 'theme-light',
    PAPER: 'theme-paper',
    DARK: 'theme-dark',
    EYE_CARE: 'theme-eye-care'
};

const THEME_LIST = [ADMIN_THEMES.LIGHT, ADMIN_THEMES.PAPER, ADMIN_THEMES.DARK, ADMIN_THEMES.EYE_CARE];

// Storage Key - 使用 constants.js 中的标准键名
const THEME_STORAGE_KEY = 'novelhub-theme';

/**
 * 初始化管理后台主题
 */
function initAdminTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || ADMIN_THEMES.LIGHT;
    applyAdminTheme(savedTheme);
    initThemeToggle();
}

/**
 * 应用主题
 * @param {string} theme - 主题类名
 */
function applyAdminTheme(theme) {
    // 移除所有主题类
    THEME_LIST.forEach(t => document.body.classList.remove(t));
    // 添加新主题类
    document.body.classList.add(theme);
}

/**
 * 获取当前主题
 * @returns {string} 当前主题
 */
function getCurrentAdminTheme() {
    return THEME_LIST.find(t => document.body.classList.contains(t)) || ADMIN_THEMES.LIGHT;
}

/**
 * 切换到下一个主题
 */
function cycleAdminTheme() {
    const currentTheme = getCurrentAdminTheme();
    const currentIndex = THEME_LIST.indexOf(currentTheme);
    const nextTheme = THEME_LIST[(currentIndex + 1) % THEME_LIST.length];
    
    applyAdminTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('admin-theme-change', { 
        detail: { theme: nextTheme } 
    }));
    
    return nextTheme;
}

/**
 * 设置特定主题
 * @param {string} theme - 主题类名
 */
function setAdminTheme(theme) {
    if (THEME_LIST.includes(theme)) {
        applyAdminTheme(theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        
        window.dispatchEvent(new CustomEvent('admin-theme-change', { 
            detail: { theme } 
        }));
    }
}

/**
 * 初始化主题切换按钮
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('adminThemeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            cycleAdminTheme();
        });
    }
}

/**
 * 创建主题切换按钮HTML
 * @returns {string} 主题切换按钮HTML
 */
function createThemeToggleButton() {
    return `
        <button class="admin-theme-toggle" id="adminThemeToggle" aria-label="切换主题" title="切换主题">
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
    `;
}

/**
 * 获取主题图标
 * @param {string} theme - 主题名称
 * @returns {string} 主题图标HTML
 */
function getThemeIcon(theme) {
    const icons = {
        [ADMIN_THEMES.LIGHT]: '☀️',
        [ADMIN_THEMES.PAPER]: '📄',
        [ADMIN_THEMES.DARK]: '🌙',
        [ADMIN_THEMES.EYE_CARE]: '🌿'
    };
    return icons[theme] || '☀️';
}

/**
 * 获取主题显示名称
 * @param {string} theme - 主题类名
 * @returns {string} 主题名称
 */
function getThemeDisplayName(theme) {
    const names = {
        [ADMIN_THEMES.LIGHT]: '浅色',
        [ADMIN_THEMES.PAPER]: '纸质',
        [ADMIN_THEMES.DARK]: '深色',
        [ADMIN_THEMES.EYE_CARE]: '护眼'
    };
    return names[theme] || '浅色';
}

// DOMContentLoaded 时自动初始化
document.addEventListener('DOMContentLoaded', initAdminTheme);

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAdminTheme,
        applyAdminTheme,
        getCurrentAdminTheme,
        cycleAdminTheme,
        setAdminTheme,
        createThemeToggleButton,
        getThemeIcon,
        getThemeDisplayName,
        ADMIN_THEMES,
        THEME_LIST,
        THEME_STORAGE_KEY
    };
}

// 浏览器环境全局暴露
if (typeof window !== 'undefined') {
    window.AdminTheme = {
        init: initAdminTheme,
        apply: applyAdminTheme,
        getCurrent: getCurrentAdminTheme,
        cycle: cycleAdminTheme,
        set: setAdminTheme,
        createToggleButton: createThemeToggleButton,
        getIcon: getThemeIcon,
        getDisplayName: getThemeDisplayName,
        THEMES: ADMIN_THEMES,
        THEME_LIST,
        STORAGE_KEY: THEME_STORAGE_KEY
    };
}
