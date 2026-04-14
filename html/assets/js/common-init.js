/**
 * 通用初始化模块
 * NovelHub - 所有页面共享的功能
 */

import { initTheme, getCurrentTheme, setTheme, getThemeName, getAllThemes } from './modules/theme.js';
import { initToast, showToast, showLoadingToast } from './components/toast.js';
import { STORAGE_KEYS, migrateStorageKeys } from './constants.js';

// 重新导出常用函数
export { showToast, showLoadingToast };

/**
 * Initialize all common functionality
 * Call this on every page load
 */
export function initCommon() {
    // 迁移旧的 localStorage 键名到新的统一格式
    migrateStorageKeys();

    initTheme();
    initToast();
    initPageThemeToggle();
    initGlobalClickHandlers();
    initSkipLink();
    initDropdowns();
    initModals();
    initReducedMotion();
}

/**
 * 初始化主题切换按钮
 */
function initPageThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', togglePageTheme);
        themeToggle.setAttribute('aria-label', '切换主题');
    }
    
    // 如果存在主题选择器，则初始化
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) {
        initThemeSelector(themeSelector);
    }
}

/**
 * Initialize theme selector component
 */
function initThemeSelector(selector) {
    const themes = getAllThemes();
    const currentTheme = getCurrentTheme();
    
    selector.innerHTML = themes.map(theme => `
        <button class="theme-option theme-option-${theme} ${theme === currentTheme ? 'active' : ''}" 
                data-theme="${theme}"
                aria-label="切换到${getThemeName(theme)}"
                title="${getThemeName(theme)}">
        </button>
    `).join('');
    
    selector.addEventListener('click', (e) => {
        const option = e.target.closest('.theme-option');
        if (option) {
            const theme = option.dataset.theme;
            setTheme(theme);
            
            // Update active state
            selector.querySelectorAll('.theme-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === theme);
            });
            
            showToast(`已切换到${getThemeName(theme)}`, 'success');
        }
    });
}

/**
 * 循环切换主题
 */
function togglePageTheme() {
    const themes = getAllThemes();
    const currentTheme = getCurrentTheme();
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    showToast(`已切换到${getThemeName(nextTheme)}`, 'success');
}

/**
 * 初始化全局点击事件处理器
 */
function initGlobalClickHandlers() {
    document.addEventListener('click', (e) => {
        // 登录按钮处理器
        const loginBtn = e.target.closest('#loginBtn');
        if (loginBtn) {
            e.preventDefault();
            window.location.href = 'auth.html';
        }
        
        // 点击外部时关闭下拉菜单
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
        
        // 点击遮罩层时关闭模态框
        const modalOverlay = e.target.closest('.modal-overlay.active');
        if (modalOverlay && e.target === modalOverlay) {
            closeModal(modalOverlay);
        }
    });
    
    // 键盘事件处理器
    document.addEventListener('keydown', (e) => {
        // ESC键关闭模态框
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

/**
 * Initialize skip link for accessibility
 */
function initSkipLink() {
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link sr-only';
        skipLink.textContent = '跳转到主要内容';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
}

/**
 * Initialize dropdown components
 */
function initDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.closest('.dropdown');
            const isActive = dropdown.classList.contains('active');
            
            // 关闭其他下拉菜单
            document.querySelectorAll('.dropdown.active').forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            
            dropdown.classList.toggle('active', !isActive);
            toggle.setAttribute('aria-expanded', !isActive);
        });
    });
}

/**
 * 初始化模态框组件
 */
function initModals() {
    // 打开模态框按钮
    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal);
            }
        });
    });
    
    // 关闭模态框按钮
    document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                closeModal(modal);
            }
        });
    });
}

/**
 * 打开模态框
 */
function openModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // 聚焦第一个可聚焦元素
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) {
        focusable.focus();
    }
}

/**
 * 关闭模态框
 */
function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/**
 * Handle reduced motion preference
 */
function initReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.documentElement.classList.add('reduced-motion');
    }
    
    prefersReducedMotion.addEventListener('change', (e) => {
        document.documentElement.classList.toggle('reduced-motion', e.matches);
    });
}

/**
 * Debounce utility function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle utility function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format relative time (e.g., "3小时前")
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return new Date(date).toLocaleDateString('zh-CN');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
        return true;
    } catch (err) {
        showToast('复制失败', 'error');
        return false;
    }
}

/**
 * Format number with Chinese units
 * @param {number} num - Number to format
 * @returns {string} Formatted string
 */
export function formatNumberWithUnit(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

/**
 * Parse URL query parameters
 * @returns {Object} Query parameters object
 */
export function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (!queryString) {
        return params;
    }
    
    const pairs = queryString.split('&');
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    
    return params;
}

/**
 * Get URL parameter by name
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value or null
 */
export function getQueryParam(name) {
    const params = getQueryParams();
    return params[name] || null;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Intersection threshold (0-1)
 * @returns {boolean} True if element is in viewport
 */
export function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll to element smoothly
 * @param {HTMLElement} element - Element to scroll to
 * @param {Object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
    if (!element) return;
    
    const {
        offset = 0,
        behavior = 'smooth',
        block = 'start'
    } = options;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior
    });
}

/**
 * Add scroll listener with throttle
 * @param {Function} handler - Scroll handler
 * @param {number} limit - Throttle limit in ms
 * @returns {Function} Cleanup function
 */
export function addThrottledScrollListener(handler, limit = 100) {
    let timeout = null;
    let lastExecution = 0;
    
    const onScroll = () => {
        const now = Date.now();
        
        if (now - lastExecution >= limit) {
            lastExecution = now;
            handler();
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                lastExecution = Date.now();
                handler();
            }, limit - (now - lastExecution));
        }
    };
    
    window.addEventListener('scroll', onScroll);
    
    return () => {
        window.removeEventListener('scroll', onScroll);
        clearTimeout(timeout);
    };
}

/**
 * Lazy load images in container
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Intersection Observer options
 */
export function lazyLoadImages(container = document, options = {}) {
    const defaultOptions = {
        rootMargin: '50px',
        threshold: 0
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
            
            observer.unobserve(img);
        });
    }, observerOptions);
    
    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
    
    return () => imageObserver.disconnect();
}

/**
 * Detect if user prefers dark mode
 * @returns {boolean} True if user prefers dark mode
 */
export function prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Detect if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get device pixel ratio
 * @returns {number} Device pixel ratio
 */
export function getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
}

/**
 * Check if device is mobile
 * @returns {boolean} True if device is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is tablet
 * @returns {boolean} True if device is tablet
 */
export function isTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
}

/**
 * Get current scroll position
 * @returns {Object} Scroll position {x, y}
 */
export function getScrollPosition() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
}

/**
 * Set scroll position
 * @param {number} x - X position
 * @param {number} y - Y position
 */
export function setScrollPosition(x = 0, y = 0) {
    window.scrollTo(x, y);
}

/**
 * Add body scroll lock
 */
export function lockBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

/**
 * Remove body scroll lock
 */
export function unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clamp number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Add event listener with once option
 * @param {EventTarget} target - Event target
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function addOnceListener(target, event, handler, options = {}) {
    target.addEventListener(event, handler, { once: true, ...options });
}

/**
 * Check if code is running in browser
 * @returns {boolean} True if in browser
 */
export function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Get current page URL without query params
 * @returns {string} Base URL
 */
export function getBaseUrl() {
    return window.location.origin + window.location.pathname;
}

/**
 * Navigate to URL
 * @param {string} url - URL to navigate to
 * @param {Object} options - Navigation options
 */
export function navigateTo(url, options = {}) {
    const {
        replace = false,
        scroll = true
    } = options;
    
    if (replace) {
        window.location.replace(url);
    } else {
        window.location.href = url;
    }
    
    if (!scroll) {
        window.scrollTo(0, 0);
    }
}

/**
 * Initialize lazy loading for all images on page
 */
export function initGlobalLazyLoad() {
    return lazyLoadImages(document, {
        rootMargin: '100px',
        threshold: 0
    });
}

/**
 * Initialize all common functionality with options
 * @param {Object} options - Initialization options
 */
export function initCommonWithOptions(options = {}) {
    const {
        initThemeModule = true,
        initToastModule = true,
        initThemeToggle = true,
        initClickHandlers = true,
        initSkipLink = true,
        initDropdowns = true,
        initModals = true,
        initReducedMotion = true,
        initLazyLoad = false
    } = options;
    
    if (initThemeModule && typeof initTheme === 'function') {
        initTheme();
    }
    
    if (initToastModule && typeof initToast === 'function') {
        initToast();
    }
    
    if (initThemeToggle) {
        initPageThemeToggle();
    }
    
    if (initClickHandlers) {
        initGlobalClickHandlers();
    }
    
    if (initSkipLink) {
        initSkipLink();
    }
    
    if (initDropdowns) {
        initDropdowns();
    }
    
    if (initModals) {
        initModals();
    }
    
    if (initReducedMotion) {
        initReducedMotion();
    }
    
    if (initLazyLoad) {
        initGlobalLazyLoad();
    }
}
