/**
 * Performance Optimization Module
 * NovelHub - 性能优化与加载管理
 */

/**
 * 初始化全局性能优化
 */
export function initPerformance() {
    initLazyLoading();
    initResourceHints();
    initPrefetch();
    initImageOptimization();
    initLoadingStates();
}

/**
 * 图片懒加载 - 使用 Intersection Observer
 */
export function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // 降级处理：直接加载所有图片
        loadAllImages();
        return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // 观察所有需要懒加载的图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    // 观察动态添加的图片
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const images = node.querySelectorAll?.('img[data-src]') || [];
                    images.forEach(img => imageObserver.observe(img));
                }
            });
        });
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

/**
 * 加载单张图片
 */
function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // 添加加载状态
    img.classList.add('loading');

    const tempImg = new Image();
    tempImg.onload = () => {
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.remove('loading');
        img.classList.add('loaded');
    };
    tempImg.onerror = () => {
        img.classList.remove('loading');
        img.classList.add('error');
        // 使用占位图
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
    };
    tempImg.src = src;
}

/**
 * 加载所有图片（降级方案）
 */
function loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
        loadImage(img);
    });
}

/**
 * 初始化资源预加载提示
 */
function initResourceHints() {
    // 预连接到关键域名
    const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://picsum.photos'
    ];

    preconnectDomains.forEach(domain => {
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            if (domain.includes('gstatic')) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        }
    });
}

/**
 * 智能预加载
 */
function initPrefetch() {
    // 预加载用户可能访问的页面
    const prefetchLinks = document.querySelectorAll('a[data-prefetch]');
    
    prefetchLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            prefetchPage(link.href);
        }, { once: true });
    });

    // 可视区域内的链接预加载
    if ('IntersectionObserver' in window) {
        const linkObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    if (link.href && link.href.startsWith(window.location.origin)) {
                        prefetchPage(link.href);
                    }
                    linkObserver.unobserve(link);
                }
            });
        }, { rootMargin: '100px' });

        document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
            linkObserver.observe(link);
        });
    }
}

/**
 * 预加载页面
 */
function prefetchPage(url) {
    if (!url || document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
        return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
}

/**
 * 图片优化
 */
function initImageOptimization() {
    // 为所有图片添加适当的属性
    document.querySelectorAll('img:not([loading])').forEach(img => {
        // 添加原生懒加载
        if (!img.src || img.src === '') {
            img.loading = 'lazy';
        }
        
        // 添加解码异步
        img.decoding = 'async';
        
        // 确保有 alt 属性（无障碍）
        if (!img.hasAttribute('alt')) {
            img.alt = '';
        }
    });
}

/**
 * 加载状态管理
 */
function initLoadingStates() {
    // 页面加载完成后的处理
    window.addEventListener('load', () => {
        document.body.classList.add('page-loaded');
        
        // 移除加载遮罩
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    });
}

/**
 * 显示骨架屏
 */
export function showSkeleton(container, template = 'default') {
    if (!container) return;
    
    const skeletons = {
        default: '<div class="skeleton skeleton-text"></div>',
        card: `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        `,
        list: `
            <div class="skeleton-list">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        `
    };

    container.innerHTML = skeletons[template] || skeletons.default;
    container.classList.add('skeleton-container');
}

/**
 * 隐藏骨架屏
 */
export function hideSkeleton(container) {
    if (!container) return;
    container.classList.remove('skeleton-container');
}

/**
 * 延迟加载非关键资源
 */
export function deferNonCriticalResources() {
    // 延迟加载非关键 CSS
    const deferredStyles = document.querySelectorAll('link[data-defer]');
    deferredStyles.forEach(link => {
        link.rel = 'stylesheet';
        link.removeAttribute('data-defer');
    });

    // 延迟加载非关键 JS
    const deferredScripts = document.querySelectorAll('script[data-defer]');
    deferredScripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        newScript.async = true;
        script.parentNode.replaceChild(newScript, script);
    });
}

/**
 * 测量性能指标
 */
export function measurePerformance() {
    if (!window.performance) return null;

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];

    return {
        // 页面加载时间
        loadTime: timing.loadEventEnd - timing.navigationStart,
        // DOM 准备时间
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        // 首字节时间
        ttfb: timing.responseStart - timing.navigationStart,
        // 首次内容绘制
        fcp: navigation?.domContentLoadedEventStart - navigation?.startTime,
        // 最大内容绘制（如果可用）
        lcp: getLCP()
    };
}

/**
 * 获取 LCP (Largest Contentful Paint)
 */
function getLCP() {
    if (!window.PerformanceObserver) return null;
    
    let lcp = 0;
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        lcp = lastEntry.renderTime || lastEntry.loadTime;
    });
    
    try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        return null;
    }
    
    return lcp;
}

/**
 * 报告性能指标
 */
export function reportPerformance() {
    const metrics = measurePerformance();
    if (metrics) {
        // 使用日志系统记录性能指标（开发环境输出）
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.debug('性能指标:', metrics);
        }

        // 发送给分析服务（如果有）
        if (window.gtag) {
            window.gtag('event', 'page_performance', {
                load_time: metrics.loadTime,
                dom_ready: metrics.domReady,
                ttfb: metrics.ttfb
            });
        }
    }
}

/**
 * 清理未使用的资源
 */
export function cleanupUnusedResources() {
    // 清理未使用的图片
    document.querySelectorAll('img').forEach(img => {
        if (!img.isConnected) {
            img.src = '';
        }
    });
}
