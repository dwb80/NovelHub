/**
 * Performance Optimizations - NovelHub
 * 图片懒加载、代码分割、资源预加载
 * @version 2.0.0
 */

// 性能监控配置
const PerformanceConfig = {
    // 懒加载配置
    lazyLoad: {
        rootMargin: '50px 0px',
        threshold: 0.01,
        placeholder: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1 1\'%3E%3C/svg%3E',
        errorImage: null // 加载失败时的默认图片
    },
    
    // 代码分割配置
    codeSplitting: {
        enabled: true,
        prefetchOnHover: true,
        prefetchDelay: 100
    },
    
    // 资源预加载配置
    prefetch: {
        enabled: true,
        maxConcurrent: 3,
        timeout: 5000
    },
    
    // 缓存配置
    cache: {
        enabled: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    }
};

/**
 * 图片懒加载管理器
 */
class LazyLoadManager {
    constructor(options = {}) {
        this.config = { ...PerformanceConfig.lazyLoad, ...options };
        this.imageQueue = new Set();
        this.observer = null;
        this.init();
    }

    init() {
        // 检查浏览器是否支持 IntersectionObserver
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: this.config.rootMargin,
                    threshold: this.config.threshold
                }
            );
        } else {
            // 降级方案：立即加载所有图片
            this.loadAllImages();
        }

        // 自动处理已有图片
        this.observeImages();
    }

    observeImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observe(img);
        });
    }

    observe(img) {
        if (!img.dataset.src) return;

        // 设置占位图
        if (!img.src || img.src === window.location.href) {
            img.src = this.config.placeholder;
        }

        // 添加加载状态类
        img.classList.add('lazy-image');
        img.classList.add('loading');

        if (this.observer) {
            this.observer.observe(img);
        } else {
            this.loadImage(img);
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 创建新图片对象进行预加载
        const preloadImg = new Image();
        
        preloadImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            
            // 触发自定义事件
            img.dispatchEvent(new CustomEvent('lazyloaded', {
                detail: { src }
            }));
        };

        preloadImg.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            
            if (this.config.errorImage) {
                img.src = this.config.errorImage;
            }
            
            img.dispatchEvent(new CustomEvent('lazyerror', {
                detail: { src }
            }));
        };

        preloadImg.src = src;
    }

    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
    }

    // 刷新观察（用于动态添加的内容）
    refresh() {
        this.observeImages();
    }

    // 销毁
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

/**
 * 代码分割管理器
 */
class CodeSplittingManager {
    constructor(options = {}) {
        this.config = { ...PerformanceConfig.codeSplitting, ...options };
        this.loadedModules = new Map();
        this.prefetchQueue = new Set();
        this.init();
    }

    init() {
        if (this.config.prefetchOnHover) {
            this.setupPrefetchOnHover();
        }
    }

    /**
     * 动态导入模块
     */
    async load(moduleName, moduleLoader) {
        // 检查是否已加载
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        try {
            const module = await moduleLoader();
            this.loadedModules.set(moduleName, module);
            return module;
        } catch (error) {
            // 使用日志系统记录模块加载错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error(`模块加载失败: ${moduleName}`, error);
            }
            throw error;
        }
    }

    /**
     * 预加载模块
     */
    prefetch(moduleName, moduleLoader) {
        if (this.loadedModules.has(moduleName) || this.prefetchQueue.has(moduleName)) {
            return;
        }

        this.prefetchQueue.add(moduleName);

        // 使用 requestIdleCallback 或 setTimeout 延迟加载
        const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        
        schedule(() => {
            this.load(moduleName, moduleLoader).then(() => {
                // 使用日志系统记录预加载成功
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.success(`预加载模块成功: ${moduleName}`);
                }
            }).catch(err => {
                // 使用日志系统记录预加载警告
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.warn(`预加载模块失败: ${moduleName}`, err);
                }
            });
        });
    }

    /**
     * 设置悬停预加载
     */
    setupPrefetchOnHover() {
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-prefetch]');
            if (!target) return;

            const moduleName = target.dataset.prefetch;
            if (!moduleName) return;

            // 延迟触发，避免快速滑动时频繁加载
            clearTimeout(this.prefetchTimeout);
            this.prefetchTimeout = setTimeout(() => {
                this.triggerPrefetch(moduleName);
            }, this.config.prefetchDelay);
        });
    }

    /**
     * 触发预加载
     */
    triggerPrefetch(moduleName) {
        // 这里可以根据模块名称映射到实际的加载器
        const moduleLoaders = {
            'tabs': () => import('./components/tabs.js'),
            'modal': () => import('./components/modal.js'),
            'dropdown': () => import('./components/dropdown.js'),
            'ui-consistency': () => import('./components/ui-consistency.js'),
            'api-client': () => import('./api-client.js'),
            'data-loader': () => import('./data-loader.js')
        };

        const loader = moduleLoaders[moduleName];
        if (loader) {
            this.prefetch(moduleName, loader);
        }
    }

    /**
     * 检查模块是否已加载
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
}

/**
 * 资源预加载管理器
 */
class ResourcePrefetchManager {
    constructor(options = {}) {
        this.config = { ...PerformanceConfig.prefetch, ...options };
        this.prefetchedResources = new Set();
        this.activeRequests = 0;
    }

    /**
     * DNS 预解析
     */
    dnsPrefetch(url) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * 预连接
     */
    preconnect(url, crossOrigin = false) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        if (crossOrigin) {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    }

    /**
     * 预加载资源
     */
    preload(href, as, type = null) {
        if (this.prefetchedResources.has(href)) return;

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        if (type) link.type = type;
        
        document.head.appendChild(link);
        this.prefetchedResources.add(href);
    }

    /**
     * 预获取资源
     */
    prefetch(href) {
        if (this.prefetchedResources.has(href)) return;

        // 使用 rel="prefetch" 或 XHR 获取
        if ('relList' in document.createElement('link') && 
            document.createElement('link').relList.supports('prefetch')) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
        } else {
            // 降级方案：使用 fetch
            this.fetchWithTimeout(href);
        }

        this.prefetchedResources.add(href);
    }

    /**
     * 带超时的 fetch
     */
    async fetchWithTimeout(url) {
        if (this.activeRequests >= this.config.maxConcurrent) {
            return;
        }

        this.activeRequests++;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            await fetch(url, { 
                signal: controller.signal,
                mode: 'no-cors'
            });
        } catch (e) {
            // 忽略错误
        } finally {
            clearTimeout(timeout);
            this.activeRequests--;
        }
    }

    /**
     * 预渲染页面
     */
    prerender(url) {
        if ('relList' in document.createElement('link') && 
            document.createElement('link').relList.supports('prerender')) {
            const link = document.createElement('link');
            link.rel = 'prerender';
            link.href = url;
            document.head.appendChild(link);
        }
    }

    /**
     * 智能预加载（基于用户行为预测）
     */
    smartPrefetch() {
        // 预加载当前页面可见区域内的链接
        const visibleLinks = this.getVisibleLinks();
        visibleLinks.forEach(link => {
            if (this.shouldPrefetch(link)) {
                this.prefetch(link);
            }
        });
    }

    /**
     * 获取可见区域内的链接
     */
    getVisibleLinks() {
        const links = [];
        document.querySelectorAll('a[href]').forEach(link => {
            const rect = link.getBoundingClientRect();
            if (rect.top < window.innerHeight * 2 && rect.bottom > 0) {
                links.push(link.href);
            }
        });
        return [...new Set(links)];
    }

    /**
     * 判断是否应预加载
     */
    shouldPrefetch(url) {
        // 只预加载同域链接
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === window.location.hostname &&
                   !url.includes('#') &&
                   !this.prefetchedResources.has(url);
        } catch {
            return false;
        }
    }
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // 监听页面加载性能
        if (window.performance) {
            window.addEventListener('load', () => {
                setTimeout(() => this.collectMetrics(), 0);
            });
        }

        // 监听长任务
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            // 使用日志系统记录长任务警告
                            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                                window.NovelHubLogger.logger.warn(`检测到长任务: ${entry.duration}ms`);
                            }
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // 浏览器不支持
            }
        }
    }

    collectMetrics() {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];

        this.metrics = {
            // DNS 查询时间
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            // TCP 连接时间
            tcp: timing.connectEnd - timing.connectStart,
            // 首字节时间
            ttfb: timing.responseStart - timing.requestStart,
            // DOM 解析时间
            domParse: timing.domInteractive - timing.responseEnd,
            // 首屏时间
            fcp: this.getFCP(),
            // 页面完全加载时间
            load: timing.loadEventEnd - timing.navigationStart,
            // DOM 准备就绪时间
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart
        };

        // 使用日志系统记录性能指标
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.info('性能指标', this.metrics);
        }
        return this.metrics;
    }

    getFCP() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }

    getMetrics() {
        return this.metrics;
    }
}

/**
 * 缓存管理器
 */
class CacheManager {
    constructor(options = {}) {
        this.config = { ...PerformanceConfig.cache, ...options };
        this.memoryCache = new Map();
        this.init();
    }

    init() {
        // 清理过期缓存
        this.cleanExpiredCache();
    }

    async get(key) {
        // 先检查内存缓存
        if (this.memoryCache.has(key)) {
            const item = this.memoryCache.get(key);
            if (!this.isExpired(item)) {
                return item.value;
            }
            this.memoryCache.delete(key);
        }

        // 再检查 localStorage
        try {
            const stored = localStorage.getItem(`cache_${key}`);
            if (stored) {
                const item = JSON.parse(stored);
                if (!this.isExpired(item)) {
                    // 恢复到内存缓存
                    this.memoryCache.set(key, item);
                    return item.value;
                }
                localStorage.removeItem(`cache_${key}`);
            }
        } catch (e) {
            // localStorage 不可用
        }

        return null;
    }

    async set(key, value, maxAge = this.config.maxAge) {
        const item = {
            value,
            timestamp: Date.now(),
            maxAge
        };

        // 保存到内存
        this.memoryCache.set(key, item);

        // 保存到 localStorage
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(item));
        } catch (e) {
            // localStorage 可能已满
        }
    }

    isExpired(item) {
        return Date.now() - item.timestamp > item.maxAge;
    }

    cleanExpiredCache() {
        // 清理内存缓存
        for (const [key, item] of this.memoryCache) {
            if (this.isExpired(item)) {
                this.memoryCache.delete(key);
            }
        }

        // 清理 localStorage
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        if (this.isExpired(item)) {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                }
            }
        } catch (e) {
            // localStorage 不可用
        }
    }

    clear() {
        this.memoryCache.clear();
        
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            // localStorage 不可用
        }
    }
}

// 创建全局实例
const lazyLoadManager = new LazyLoadManager();
const codeSplittingManager = new CodeSplittingManager();
const resourcePrefetchManager = new ResourcePrefetchManager();
const performanceMonitor = new PerformanceMonitor();
const cacheManager = new CacheManager();

/**
 * 初始化性能优化
 */
function initPerformance() {
    // 添加懒加载样式
    const style = document.createElement('style');
    style.textContent = `
        .lazy-image {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .lazy-image.loading {
            opacity: 0;
            background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s infinite;
        }
        
        .lazy-image.loaded {
            opacity: 1;
        }
        
        .lazy-image.error {
            opacity: 0.5;
        }
        
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(style);

    // 预加载关键资源
    resourcePrefetchManager.preconnect('https://fonts.googleapis.com', true);
    resourcePrefetchManager.preconnect('https://fonts.gstatic.com', true);

    // 监听滚动事件进行智能预加载
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            resourcePrefetchManager.smartPrefetch();
        }, 150);
    }, { passive: true });

    // 使用日志系统记录初始化成功
    if (typeof window !== 'undefined' && window.NovelHubLogger) {
        window.NovelHubLogger.logger.success('性能优化模块已初始化');
    }
}

// 导出
export {
    LazyLoadManager,
    CodeSplittingManager,
    ResourcePrefetchManager,
    PerformanceMonitor,
    CacheManager,
    lazyLoadManager,
    codeSplittingManager,
    resourcePrefetchManager,
    performanceMonitor,
    cacheManager,
    initPerformance,
    PerformanceConfig
};

export default {
    lazyLoad: lazyLoadManager,
    codeSplitting: codeSplittingManager,
    prefetch: resourcePrefetchManager,
    monitor: performanceMonitor,
    cache: cacheManager,
    init: initPerformance
};

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.LazyLoadManager = LazyLoadManager;
    window.CodeSplittingManager = CodeSplittingManager;
    window.ResourcePrefetchManager = ResourcePrefetchManager;
    window.PerformanceMonitor = PerformanceMonitor;
    window.CacheManager = CacheManager;
    window.lazyLoadManager = lazyLoadManager;
    window.codeSplittingManager = codeSplittingManager;
    window.resourcePrefetchManager = resourcePrefetchManager;
    window.performanceMonitor = performanceMonitor;
    window.cacheManager = cacheManager;
    window.initPerformance = initPerformance;

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerformance);
    } else {
        initPerformance();
    }
}
