/**
 * NovelHub Service Worker
 * 实现离线缓存和PWA功能
 * @version 1.0.0
 */

// 缓存名称和版本
const CACHE_NAME = 'novelhub-cache-v1';
const STATIC_CACHE_NAME = 'novelhub-static-v1';
const DYNAMIC_CACHE_NAME = 'novelhub-dynamic-v1';
const IMAGE_CACHE_NAME = 'novelhub-images-v1';

// 需要预缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/preview.html',
    '/assets/css/base.css',
    '/assets/css/layout.css',
    '/assets/css/components.css',
    '/assets/css/themes.css',
    '/assets/css/animations.css',
    '/assets/js/constants.js',
    '/assets/js/logger.js',
    '/assets/js/app.js',
    '/assets/js/utils/index.js',
    '/assets/js/modules/theme.js',
    '/assets/js/modules/error-handler.js',
    '/assets/js/components/toast.js',
    '/assets/js/components/modal.js',
    '/assets/js/components/dropdown.js'
];

// 缓存策略配置
const CACHE_STRATEGIES = {
    // 静态资源 - 缓存优先
    static: {
        pattern: /\.(css|js|woff2?|ttf|otf)$/,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
    },
    // 图片资源 - 缓存优先，带限制
    images: {
        pattern: /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
        maxEntries: 100,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    },
    // API请求 - 网络优先
    api: {
        pattern: /\/api\//,
        maxAge: 5 * 60 * 1000 // 5分钟
    },
    // 页面 - 网络优先，离线回退
    pages: {
        pattern: /\.html$/,
        maxAge: 24 * 60 * 60 * 1000 // 1天
    }
};

// ========== 安装阶段 ==========
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                // 预缓存静态资源
                return cache.addAll(STATIC_ASSETS.map(url => {
                    // 处理相对路径
                    return new Request(url, { cache: 'reload' });
                })).catch((error) => {
                    // 静默处理缓存失败，不阻止Service Worker安装
                    console.warn('部分静态资源缓存失败:', error);
                });
            })
            .then(() => {
                // 立即激活新的Service Worker
                return self.skipWaiting();
            })
    );
});

// ========== 激活阶段 ==========
self.addEventListener('activate', (event) => {
    event.waitUntil(
        // 清理旧版本缓存
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name.startsWith('novelhub-') &&
                            name !== STATIC_CACHE_NAME &&
                            name !== DYNAMIC_CACHE_NAME &&
                            name !== IMAGE_CACHE_NAME;
                    })
                    .map((name) => caches.delete(name))
            );
        }).then(() => {
            // 立即接管所有客户端
            return self.clients.claim();
        })
    );
});

// ========== 请求拦截 ==========
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非GET请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过浏览器扩展请求
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }

    // 根据资源类型选择缓存策略
    if (CACHE_STRATEGIES.static.pattern.test(url.pathname)) {
        event.respondWith(staticCacheStrategy(request));
    } else if (CACHE_STRATEGIES.images.pattern.test(url.pathname)) {
        event.respondWith(imageCacheStrategy(request));
    } else if (CACHE_STRATEGIES.api.pattern.test(url.pathname)) {
        event.respondWith(apiCacheStrategy(request));
    } else if (CACHE_STRATEGIES.pages.pattern.test(url.pathname)) {
        event.respondWith(pageCacheStrategy(request));
    } else {
        // 默认策略：网络优先
        event.respondWith(networkFirstStrategy(request));
    }
});

// ========== 缓存策略实现 ==========

/**
 * 静态资源缓存策略 - 缓存优先
 */
async function staticCacheStrategy(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        // 检查缓存是否过期
        const cachedDate = new Date(cached.headers.get('date') || 0);
        const maxAge = CACHE_STRATEGIES.static.maxAge;

        if (Date.now() - cachedDate.getTime() < maxAge) {
            // 后台更新缓存
            fetch(request).then((response) => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            }).catch(() => {
                // 静默处理更新失败
            });

            return cached;
        }
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        if (cached) {
            return cached;
        }
        throw error;
    }
}

/**
 * 图片缓存策略 - 缓存优先，带数量限制
 */
async function imageCacheStrategy(request) {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // 检查缓存条目数量
            const keys = await cache.keys();
            const maxEntries = CACHE_STRATEGIES.images.maxEntries;

            if (keys.length >= maxEntries) {
                // 删除最旧的缓存
                await cache.delete(keys[0]);
            }

            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // 返回占位图
        return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>',
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

/**
 * API缓存策略 - 网络优先
 */
async function apiCacheStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cached = await cache.match(request);

        if (cached) {
            // 检查缓存是否过期
            const cachedDate = new Date(cached.headers.get('date') || 0);
            const maxAge = CACHE_STRATEGIES.api.maxAge;

            if (Date.now() - cachedDate.getTime() < maxAge) {
                return cached;
            }
        }

        // 返回离线响应
        return new Response(
            JSON.stringify({
                success: false,
                error: {
                    code: 'OFFLINE',
                    message: '当前处于离线状态，请检查网络连接'
                }
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * 页面缓存策略 - 网络优先，离线回退
 */
async function pageCacheStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cached = await cache.match(request);

        if (cached) {
            return cached;
        }

        // 返回离线页面
        const offlinePage = await cache.match('/index.html');
        if (offlinePage) {
            return offlinePage;
        }

        // 返回简单的离线提示
        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>离线 - NovelHub</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f5f5f5;
                    }
                    .offline-container {
                        text-align: center;
                        padding: 2rem;
                    }
                    .offline-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 0.5rem;
                    }
                    p {
                        color: #666;
                        margin-bottom: 1.5rem;
                    }
                    .retry-btn {
                        padding: 0.75rem 1.5rem;
                        background: #6366f1;
                        color: white;
                        border: none;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    .retry-btn:hover {
                        background: #4f46e5;
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📡</div>
                    <h1>您已离线</h1>
                    <p>请检查网络连接后重试</p>
                    <button class="retry-btn" onclick="location.reload()">重新加载</button>
                </div>
            </body>
            </html>
            `,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

/**
 * 默认网络优先策略
 */
async function networkFirstStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

// ========== 后台同步 ==========
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reading-progress') {
        event.waitUntil(syncReadingProgress());
    } else if (event.tag === 'sync-bookmarks') {
        event.waitUntil(syncBookmarks());
    }
});

/**
 * 同步阅读进度
 */
async function syncReadingProgress() {
    // 从IndexedDB或本地存储获取待同步的阅读进度
    // 这里可以实现与后端API的同步逻辑
    return Promise.resolve();
}

/**
 * 同步书签
 */
async function syncBookmarks() {
    // 从IndexedDB或本地存储获取待同步的书签
    // 这里可以实现与后端API的同步逻辑
    return Promise.resolve();
}

// ========== 推送通知 ==========
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const options = {
        body: data.body || '您有新的消息',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        data: data.data || {}
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'NovelHub', options)
    );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data;
    let url = '/';

    if (notificationData.novelId) {
        url = `/pages/novel/detail.html?id=${notificationData.novelId}`;
    } else if (notificationData.chapterId) {
        url = `/pages/reader/reading.html?chapter=${notificationData.chapterId}`;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // 查找已打开的窗口
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // 打开新窗口
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// ========== 消息处理 ==========
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'CLEAR_CACHE':
                event.waitUntil(clearAllCaches());
                break;
            case 'GET_CACHE_STATUS':
                event.waitUntil(getCacheStatus().then((status) => {
                    event.ports[0].postMessage(status);
                }));
                break;
            default:
                break;
        }
    }
});

/**
 * 清除所有缓存
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames
            .filter((name) => name.startsWith('novelhub-'))
            .map((name) => caches.delete(name))
    );
}

/**
 * 获取缓存状态
 */
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {
        caches: {},
        totalSize: 0
    };

    for (const name of cacheNames) {
        if (name.startsWith('novelhub-')) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            status.caches[name] = {
                entries: keys.length
            };
            status.totalSize += keys.length;
        }
    }

    return status;
}
