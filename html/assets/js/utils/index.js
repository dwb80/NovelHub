/**
 * NovelHub Utilities
 * 统一工具函数库 (第5次循环优化版)
 * 
 * 包含:
 * - DOM 操作工具
 * - 性能优化工具
 * - 数据格式化工具
 * - 事件处理工具
 */

// ============================================
// DOM 操作工具
// ============================================

/**
 * 安全地选择 DOM 元素
 * @param {string} selector - CSS 选择器
 * @param {Element} context - 上下文元素
 * @returns {Element|null}
 */
export function $(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * 安全地选择所有 DOM 元素
 * @param {string} selector - CSS 选择器
 * @param {Element} context - 上下文元素
 * @returns {NodeList}
 */
export function $$(selector, context = document) {
    return context.querySelectorAll(selector);
}

/**
 * 创建带属性的 DOM 元素
 * @param {string} tag - 标签名
 * @param {Object} attrs - 属性对象
 * @param {string|Element} content - 内容
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, content = '') {
    const el = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.assign(el.dataset, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });
    
    if (content) {
        if (typeof content === 'string') {
            el.innerHTML = content;
        } else {
            el.appendChild(content);
        }
    }
    
    return el;
}

/**
 * 检查元素是否在视口内
 * @param {Element} element - 要检查的元素
 * @param {number} threshold - 阈值 (0-1)
 * @returns {boolean}
 */
export function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top >= -rect.height * threshold &&
        rect.left >= -rect.width * threshold &&
        rect.bottom <= windowHeight + rect.height * threshold &&
        rect.right <= windowWidth + rect.width * threshold
    );
}

/**
 * 平滑滚动到元素
 * @param {Element} element - 目标元素
 * @param {Object} options - 选项
 */
export function scrollToElement(element, options = {}) {
    if (!element) return;
    
    const { offset = 0, behavior = 'smooth', block = 'start' } = options;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior
    });
}

// ============================================
// 性能优化工具
// ============================================

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间 (ms)
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间 (ms)
 * @returns {Function}
 */
export function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 使用 requestAnimationFrame 的节流函数
 * @param {Function} callback - 回调函数
 * @returns {Function}
 */
export function throttleRAF(callback) {
    let ticking = false;
    return function(...args) {
        if (!ticking) {
            requestAnimationFrame(() => {
                callback.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}

/**
 * 延迟执行 (Promise 版)
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 批量处理数组，避免阻塞主线程
 * @param {Array} items - 要处理的数组
 * @param {Function} processor - 处理函数
 * @param {number} batchSize - 每批大小
 */
export async function processInBatches(items, processor, batchSize = 10) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        batch.forEach(processor);
        
        // 让出主线程
        if (i + batchSize < items.length) {
            await sleep(0);
        }
    }
}

// ============================================
// 数据格式化工具
// ============================================

/**
 * 格式化数字 (添加千分位)
 * @param {number} num - 数字
 * @returns {string}
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化数字为中文单位 (万/亿)
 * @param {number} num - 数字
 * @returns {string}
 */
export function formatNumberCN(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    }
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

/**
 * 格式化字数
 * @param {number} count - 字数
 * @returns {string}
 */
export function formatWordCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万字';
    }
    return count + '字';
}

/**
 * 格式化相对时间
 * @param {Date|string} date - 日期
 * @returns {string}
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now - target;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期
 * @param {string} format - 格式
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string}
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + suffix;
}

// ============================================
// 事件处理工具
// ============================================

/**
 * 添加一次性事件监听器
 * @param {EventTarget} target - 事件目标
 * @param {string} event - 事件名
 * @param {Function} handler - 处理函数
 * @param {Object} options - 选项
 */
export function once(target, event, handler, options = {}) {
    target.addEventListener(event, handler, { once: true, ...options });
}

/**
 * 创建委托事件监听器
 * @param {Element} container - 容器元素
 * @param {string} selector - 选择器
 * @param {string} event - 事件名
 * @param {Function} handler - 处理函数
 */
export function delegate(container, selector, event, handler) {
    container.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target && container.contains(target)) {
            handler.call(target, e, target);
        }
    });
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            return true;
        } catch (e) {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

// ============================================
// URL 和查询参数工具
// ============================================

/**
 * 解析 URL 查询参数
 * @param {string} url - URL
 * @returns {Object}
 */
export function parseQueryParams(url = window.location.search) {
    const params = {};
    const queryString = url.includes('?') ? url.split('?')[1] : url;
    
    if (!queryString) return params;
    
    const pairs = queryString.split('&');
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
    }
    
    return params;
}

/**
 * 获取单个查询参数
 * @param {string} name - 参数名
 * @param {string} url - URL
 * @returns {string|null}
 */
export function getQueryParam(name, url = window.location.search) {
    const params = parseQueryParams(url);
    return params[name] || null;
}

/**
 * 构建带查询参数的 URL
 * @param {string} baseUrl - 基础 URL
 * @param {Object} params - 参数对象
 * @returns {string}
 */
export function buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.set(key, value);
        }
    });
    
    return url.toString();
}

// ============================================
// 设备检测工具
// ============================================

/**
 * 检测是否为移动设备
 * @returns {boolean}
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检测是否为平板设备
 * @returns {boolean}
 */
export function isTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
}

/**
 * 检测是否支持触摸
 * @returns {boolean}
 */
export function isTouchDevice() {
    return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * 检测是否偏好减少动画
 * @returns {boolean}
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================
// 存储工具
// ============================================

/**
 * 安全的 localStorage 操作
 */
export const storage = {
    /**
     * 设置值
     * @param {string} key - 键
     * @param {*} value - 值
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('存储设置错误:', e.message);
            }
        }
    },
    
    /**
     * 获取值
     * @param {string} key - 键
     * @param {*} defaultValue - 默认值
     * @returns {*}
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    /**
     * 删除值
     * @param {string} key - 键
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('存储删除错误:', e.message);
            }
        }
    },
    
    /**
     * 清空
     */
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('存储清空错误:', e.message);
            }
        }
    }
};

// ============================================
// 随机工具
// ============================================

/**
 * 生成随机 ID
 * @param {string} prefix - 前缀
 * @returns {string}
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
}

/**
 * 生成随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number}
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择
 * @param {Array} arr - 数组
 * @returns {*}
 */
export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================
// 验证工具
// ============================================

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证手机号格式 (中国大陆)
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证 URL 格式
 * @param {string} url - URL
 * @returns {boolean}
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ============================================
// 数组/对象工具
// ============================================

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*}
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}

/**
 * 按属性分组
 * @param {Array} array - 数组
 * @param {string|Function} key - 分组键
 * @returns {Object}
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        (result[groupKey] = result[groupKey] || []).push(item);
        return result;
    }, {});
}

/**
 * 数组去重
 * @param {Array} array - 数组
 * @param {string|Function} key - 去重键
 * @returns {Array}
 */
export function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const val = typeof key === 'function' ? key(item) : item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
    });
}

// 默认导出
export default {
    $, $$, createElement, isInViewport, scrollToElement,
    debounce, throttle, throttleRAF, sleep, processInBatches,
    formatNumber, formatNumberCN, formatWordCount, formatRelativeTime, formatDate, truncateText,
    once, delegate, copyToClipboard,
    parseQueryParams, getQueryParam, buildUrl,
    isMobile, isTablet, isTouchDevice, prefersReducedMotion,
    storage,
    generateId, randomInt, randomChoice,
    isValidEmail, isValidPhone, isValidUrl,
    deepClone, groupBy, uniqueBy
};
