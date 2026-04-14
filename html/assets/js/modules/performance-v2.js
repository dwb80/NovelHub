/**
 * Performance Optimization Module V2
 * NovelHub - 高级性能优化
 * 
 * 优化内容:
 * - 减少重绘重排
 * - 优化动画性能 (使用 transform 和 opacity)
 * - 虚拟滚动支持
 * - 资源压缩与缓存
 * - 内存泄漏防护
 * 
 * @version 2.0.0
 */

// ========== 重绘重排优化 ==========

/**
 * 批量DOM操作 - 使用 DocumentFragment
 */
export function batchDOMUpdates(updates) {
    const fragment = document.createDocumentFragment();
    updates.forEach(update => update(fragment));
    return fragment;
}

/**
 * 使用 requestAnimationFrame 批量处理样式变更
 */
export function batchStyleUpdates(elements, styles) {
    requestAnimationFrame(() => {
        elements.forEach(el => {
            if (typeof el === 'string') {
                el = document.querySelector(el);
            }
            if (el) {
                Object.assign(el.style, styles);
            }
        });
    });
}

/**
 * 读取和写入分离 - 避免强制同步布局
 */
export class LayoutBatch {
    constructor() {
        this.reads = [];
        this.writes = [];
        this.scheduled = false;
    }

    measure(fn) {
        this.reads.push(fn);
        this.schedule();
        return this;
    }

    mutate(fn) {
        this.writes.push(fn);
        this.schedule();
        return this;
    }

    schedule() {
        if (this.scheduled) return;
        this.scheduled = true;

        requestAnimationFrame(() => {
            this.flush();
        });
    }

    flush() {
        // 先执行所有读取操作
        let read;
        while ((read = this.reads.shift())) {
            read();
        }

        // 再执行所有写入操作
        let write;
        while ((write = this.writes.shift())) {
            write();
        }

        this.scheduled = false;

        // 如果还有未处理的任务，继续调度
        if (this.reads.length || this.writes.length) {
            this.schedule();
        }
    }

    clear() {
        this.reads = [];
        this.writes = [];
        this.scheduled = false;
    }
}

// 全局布局批处理实例
export const layoutBatch = new LayoutBatch();

// ========== 虚拟滚动 ==========

export class VirtualScroller {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            itemHeight: 50,
            overscan: 5,
            bufferSize: 100,
            ...options
        };

        this.items = [];
        this.visibleItems = new Map();
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.totalHeight = 0;
        this.startIndex = 0;
        this.endIndex = 0;

        this.init();
    }

    init() {
        this.setupContainer();
        this.bindEvents();
        this.measure();
    }

    setupContainer() {
        this.container.style.position = 'relative';
        this.container.style.overflow = 'auto';
        
        // 创建内容占位元素
        this.spacer = document.createElement('div');
        this.spacer.style.position = 'absolute';
        this.spacer.style.top = '0';
        this.spacer.style.left = '0';
        this.spacer.style.width = '1px';
        this.spacer.style.height = '0px';
        this.spacer.style.visibility = 'hidden';
        
        this.container.appendChild(this.spacer);
    }

    bindEvents() {
        this.handleScroll = this.throttle(() => {
            this.updateVisibleItems();
        }, 16); // 约60fps

        this.container.addEventListener('scroll', this.handleScroll);
        
        window.addEventListener('resize', () => {
            this.measure();
            this.updateVisibleItems();
        });
    }

    measure() {
        this.containerHeight = this.container.clientHeight;
    }

    setItems(items) {
        this.items = items;
        this.totalHeight = items.length * this.options.itemHeight;
        this.spacer.style.height = `${this.totalHeight}px`;
        this.updateVisibleItems();
    }

    updateVisibleItems() {
        this.scrollTop = this.container.scrollTop;
        
        const { itemHeight, overscan } = this.options;
        const visibleCount = Math.ceil(this.containerHeight / itemHeight);
        
        this.startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - overscan);
        this.endIndex = Math.min(
            this.items.length,
            this.startIndex + visibleCount + overscan * 2
        );

        this.renderItems();
    }

    renderItems() {
        const { itemHeight } = this.options;
        const newVisibleItems = new Map();

        // 渲染可见项目
        for (let i = this.startIndex; i < this.endIndex; i++) {
            const item = this.items[i];
            let element = this.visibleItems.get(i);

            if (!element) {
                element = this.options.renderItem(item, i);
                element.style.position = 'absolute';
                element.style.top = `${i * itemHeight}px`;
                element.style.left = '0';
                element.style.width = '100%';
                element.style.willChange = 'transform';
                this.container.appendChild(element);
            }

            newVisibleItems.set(i, element);
        }

        // 移除不再可见的项目
        this.visibleItems.forEach((element, index) => {
            if (!newVisibleItems.has(index)) {
                element.remove();
            }
        });

        this.visibleItems = newVisibleItems;
    }

    throttle(fn, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    scrollToIndex(index) {
        this.container.scrollTop = index * this.options.itemHeight;
    }

    destroy() {
        this.container.removeEventListener('scroll', this.handleScroll);
        this.visibleItems.forEach(element => element.remove());
        this.spacer.remove();
    }
}

// ========== 动画性能优化 ==========

/**
 * 使用 FLIP 技术优化动画
 */
export class FLIPAnimator {
    constructor() {
        this.animations = new Map();
    }

    /**
     * First: 记录初始状态
     */
    first(element) {
        const rect = element.getBoundingClientRect();
        return {
            element,
            first: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            }
        };
    }

    /**
     * Last: 记录最终状态
     */
    last(state) {
        const rect = state.element.getBoundingClientRect();
        state.last = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        };
        return state;
    }

    /**
     * Invert: 计算反向变换
     */
    invert(state) {
        const deltaX = state.first.left - state.last.left;
        const deltaY = state.first.top - state.last.top;
        const deltaW = state.first.width / state.last.width;
        const deltaH = state.first.height / state.last.height;

        state.invert = { deltaX, deltaY, deltaW, deltaH };
        return state;
    }

    /**
     * Play: 执行动画
     */
    play(state, options = {}) {
        const { duration = 300, easing = 'cubic-bezier(0.4, 0, 0.2, 1)' } = options;
        const { deltaX, deltaY, deltaW, deltaH } = state.invert;

        const element = state.element;
        
        // 应用反向变换
        element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        element.style.transformOrigin = 'top left';
        element.style.willChange = 'transform';

        // 强制重排
        element.offsetHeight;

        // 添加过渡并移除变换
        element.style.transition = `transform ${duration}ms ${easing}`;
        element.style.transform = '';

        // 动画结束后清理
        const cleanup = () => {
            element.style.transition = '';
            element.style.transformOrigin = '';
            element.style.willChange = '';
            element.removeEventListener('transitionend', cleanup);
        };

        element.addEventListener('transitionend', cleanup);

        return new Promise(resolve => {
            element.addEventListener('transitionend', resolve, { once: true });
        });
    }

    /**
     * 执行完整的 FLIP 动画
     */
    async animate(element, mutateFn, options = {}) {
        const state = this.first(element);
        mutateFn();
        this.last(state);
        this.invert(state);
        await this.play(state, options);
    }
}

// ========== 资源压缩与缓存 ==========

/**
 * 图片懒加载优化
 */
export class OptimizedImageLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.01,
            placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
            ...options
        };

        this.imageCache = new Map();
        this.observer = null;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            this.loadAllImages();
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );

        // 观察所有需要懒加载的图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    async loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // 检查缓存
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            img.classList.add('loaded');
            return;
        }

        img.classList.add('loading');

        try {
            const blob = await this.fetchImage(src);
            const objectUrl = URL.createObjectURL(blob);
            
            // 缓存
            this.imageCache.set(src, objectUrl);
            
            img.src = objectUrl;
            img.removeAttribute('data-src');
            img.classList.remove('loading');
            img.classList.add('loaded');
        } catch (error) {
            img.classList.remove('loading');
            img.classList.add('error');
            img.src = this.options.placeholder;
        }
    }

    async fetchImage(src) {
        const response = await fetch(src, {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load image: ${response.status}`);
        }
        
        return response.blob();
    }

    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        // 清理缓存
        this.imageCache.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        this.imageCache.clear();
    }
}

/**
 * 资源预加载管理器
 */
export class ResourcePreloader {
    constructor() {
        this.preloaded = new Set();
    }

    /**
     * 预加载图片
     */
    preloadImage(src) {
        if (this.preloaded.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.preloaded.add(src);
                resolve(src);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * 预加载关键资源
     */
    preloadCritical(resources) {
        const promises = resources.map(resource => {
            if (resource.type === 'image') {
                return this.preloadImage(resource.src);
            }
            if (resource.type === 'css') {
                return this.preloadCSS(resource.href);
            }
            if (resource.type === 'js') {
                return this.preloadJS(resource.src);
            }
            return Promise.resolve();
        });

        return Promise.all(promises);
    }

    preloadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    preloadJS(src) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = src;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
}

// ========== 内存管理 ==========

/**
 * 内存泄漏防护
 */
export class MemoryManager {
    constructor() {
        this.disposables = new Set();
        this.observers = new Set();
        this.timers = new Set();
        this.listeners = new Map();
    }

    /**
     * 注册需要清理的资源
     */
    addDisposable(disposeFn) {
        this.disposables.add(disposeFn);
        return () => this.disposables.delete(disposeFn);
    }

    /**
     * 注册 IntersectionObserver
     */
    addObserver(observer) {
        this.observers.add(observer);
        return observer;
    }

    /**
     * 注册定时器
     */
    addTimer(timerId) {
        this.timers.add(timerId);
        return timerId;
    }

    /**
     * 注册事件监听器
     */
    addEventListener(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        
        const key = `${event}-${handler.toString()}`;
        if (!this.listeners.has(target)) {
            this.listeners.set(target, new Map());
        }
        this.listeners.get(target).set(key, { event, handler, options });

        return () => this.removeEventListener(target, event, handler);
    }

    /**
     * 移除事件监听器
     */
    removeEventListener(target, event, handler) {
        target.removeEventListener(event, handler);
        
        const key = `${event}-${handler.toString()}`;
        if (this.listeners.has(target)) {
            this.listeners.get(target).delete(key);
        }
    }

    /**
     * 清理所有资源
     */
    dispose() {
        // 执行所有清理函数
        this.disposables.forEach(fn => {
            try {
                fn();
            } catch (e) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('资源释放错误:', e.message);
                }
            }
        });
        this.disposables.clear();

        // 断开所有 observer
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('观察器断开错误:', e.message);
                }
            }
        });
        this.observers.clear();

        // 清除所有定时器
        this.timers.forEach(timerId => {
            clearTimeout(timerId);
            clearInterval(timerId);
        });
        this.timers.clear();

        // 移除所有事件监听器
        this.listeners.forEach((handlers, target) => {
            handlers.forEach(({ event, handler }) => {
                target.removeEventListener(event, handler);
            });
        });
        this.listeners.clear();
    }
}

// ========== 性能监控 ==========

/**
 * 性能指标收集
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.observers = [];
    }

    /**
     * 收集 Web Vitals 指标
     */
    collectWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.push(lcpObserver);
            } catch (e) {
                // 浏览器不支持
            }

            // First Input Delay
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.recordMetric('FID', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.push(fidObserver);
            } catch (e) {
                // 浏览器不支持
            }

            // Cumulative Layout Shift
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.recordMetric('CLS', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(clsObserver);
            } catch (e) {
                // 浏览器不支持
            }
        }
    }

    recordMetric(name, value) {
        this.metrics.push({
            name,
            value,
            timestamp: Date.now()
        });

        // 限制存储数量
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-500);
        }
    }

    getMetrics() {
        return [...this.metrics];
    }

    getAverageMetric(name) {
        const values = this.metrics
            .filter(m => m.name === name)
            .map(m => m.value);
        
        if (values.length === 0) return 0;
        
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    destroy() {
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {}
        });
        this.observers = [];
    }
}

// ========== 导出便捷函数 ==========

/**
 * 使用 transform 和 opacity 进行动画 (GPU 加速)
 */
export function animateWithGPU(element, keyframes, options = {}) {
    const safeOptions = {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
        ...options
    };

    // 确保使用 GPU 加速属性
    element.style.willChange = 'transform, opacity';

    const animation = element.animate(keyframes, safeOptions);

    animation.onfinish = () => {
        element.style.willChange = '';
        if (options.onComplete) {
            options.onComplete();
        }
    };

    return animation;
}

/**
 * 防抖函数 (RAF 版本)
 */
export function debounceRAF(fn) {
    let ticking = false;
    return function(...args) {
        if (!ticking) {
            requestAnimationFrame(() => {
                fn.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}

/**
 * 测量元素尺寸 (批量读取)
 */
export function measureElements(selectors) {
    const measurements = {};
    
    layoutBatch.measure(() => {
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            measurements[selector] = Array.from(elements).map(el => ({
                width: el.offsetWidth,
                height: el.offsetHeight,
                top: el.offsetTop,
                left: el.offsetLeft
            }));
        });
    }).flush();

    return measurements;
}

// ========== 默认导出 ==========

export default {
    LayoutBatch,
    VirtualScroller,
    FLIPAnimator,
    OptimizedImageLoader,
    ResourcePreloader,
    MemoryManager,
    PerformanceMonitor,
    layoutBatch,
    batchDOMUpdates,
    batchStyleUpdates,
    animateWithGPU,
    debounceRAF,
    measureElements
};
