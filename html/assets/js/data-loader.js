/**
 * Data Loader - NovelHub
 * 动态数据加载 + Fallback 机制
 * 支持 ES6 Module 和 file:// 协议
 * @version 2.0.0
 */

// 数据加载状态
const DataLoadingState = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    FALLBACK: 'fallback'
};

// 数据加载器配置 - 使用常量避免魔法数字
const DataLoaderConfig = {
    retryAttempts: (typeof window !== 'undefined' && window.NovelHubConstants)
        ? window.NovelHubConstants.NUMERIC_CONSTANTS.RETRY_ATTEMPTS
        : 3,
    retryDelay: (typeof window !== 'undefined' && window.NovelHubConstants)
        ? window.NovelHubConstants.NUMERIC_CONSTANTS.RETRY_DELAY
        : 1000,
    timeout: (typeof window !== 'undefined' && window.NovelHubConstants)
        ? window.NovelHubConstants.NUMERIC_CONSTANTS.TIMEOUT
        : 10000,
    cacheEnabled: true,
    cacheDuration: (typeof window !== 'undefined' && window.NovelHubConstants)
        ? window.NovelHubConstants.NUMERIC_CONSTANTS.CACHE_DURATION
        : 300000 // 5分钟
};

// 内存缓存
const memoryCache = new Map();

/**
 * 数据加载器类
 */
class DataLoader {
    constructor(options = {}) {
        this.config = { ...DataLoaderConfig, ...options };
        this.state = DataLoadingState.IDLE;
        this.listeners = new Map();
    }

    /**
     * 添加状态监听器
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return this;
    }

    /**
     * 触发事件
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    // 使用日志系统记录错误
                    if (typeof window !== 'undefined' && window.NovelHubLogger) {
                        window.NovelHubLogger.logger.error('事件监听器错误:', e.message);
                    }
                }
            });
        }
    }

    /**
     * 获取缓存键
     */
    getCacheKey(source) {
        return `data_${typeof source === 'string' ? source : JSON.stringify(source)}`;
    }

    /**
     * 从缓存获取数据
     */
    getFromCache(key) {
        if (!this.config.cacheEnabled) return null;
        
        const cached = memoryCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
            return cached.data;
        }
        
        // 尝试从 localStorage 获取
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < this.config.cacheDuration) {
                    return parsed.data;
                }
            }
        } catch (e) {
            // localStorage 不可用
        }
        
        return null;
    }

    /**
     * 保存到缓存
     */
    saveToCache(key, data) {
        if (!this.config.cacheEnabled) return;
        
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        
        // 保存到内存
        memoryCache.set(key, cacheData);
        
        // 尝试保存到 localStorage
        try {
            localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (e) {
            // localStorage 可能已满或不可用
        }
    }

    /**
     * 动态加载 JS 模块
     */
    async loadModule(source) {
        // 如果已经是模块对象，直接返回
        if (typeof source === 'object' && source !== null) {
            return source;
        }

        // 检查缓存
        const cacheKey = this.getCacheKey(source);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        this.state = DataLoadingState.LOADING;
        this.emit('loading', { source });

        try {
            let data;

            // 判断是否为 file:// 协议
            const isFileProtocol = window.location.protocol === 'file:';

            if (isFileProtocol) {
                // file:// 协议下使用 script 标签加载
                data = await this.loadViaScriptTag(source);
            } else {
                // 正常 ES6 动态导入
                data = await this.loadViaDynamicImport(source);
            }

            // 保存到缓存
            this.saveToCache(cacheKey, data);
            
            this.state = DataLoadingState.SUCCESS;
            this.emit('success', { source, data });
            
            return data;

        } catch (error) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('模块加载错误:', error.message);
            }
            this.state = DataLoadingState.ERROR;
            this.emit('error', { source, error });
            throw error;
        }
    }

    /**
     * 使用动态导入加载模块
     */
    async loadViaDynamicImport(source) {
        const module = await import(source);
        return module.default || module;
    }

    /**
     * 使用 script 标签加载 (用于 file:// 协议)
     */
    loadViaScriptTag(src) {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (window.MockData) {
                resolve(window.MockData);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            const timeout = setTimeout(() => {
                reject(new Error('Script load timeout'));
            }, this.config.timeout);

            script.onload = () => {
                clearTimeout(timeout);
                // 等待全局变量设置
                setTimeout(() => {
                    if (window.MockData) {
                        resolve(window.MockData);
                    } else {
                        reject(new Error('MockData not found after script load'));
                    }
                }, 100);
            };

            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * 加载数据并带 fallback
     */
    async loadWithFallback(primarySource, fallbackSource) {
        try {
            // 尝试加载主数据源
            return await this.loadModule(primarySource);
        } catch (primaryError) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('主数据源失败，尝试备用源:', primaryError.message);
            }

            this.state = DataLoadingState.FALLBACK;
            this.emit('fallback', { primaryError });

            try {
                // 尝试 fallback 数据源
                if (typeof fallbackSource === 'function') {
                    return await fallbackSource();
                }
                return await this.loadModule(fallbackSource);
            } catch (fallbackError) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('备用源也失败:', fallbackError.message);
                }
                throw new Error('主数据源和备用源都失败');
            }
        }
    }

    /**
     * 重试加载
     */
    async loadWithRetry(source, attempts = this.config.retryAttempts) {
        for (let i = 0; i < attempts; i++) {
            try {
                return await this.loadModule(source);
            } catch (error) {
                if (i === attempts - 1) throw error;

                // 使用日志系统记录警告
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.warn(`第${i + 1}次尝试失败，正在重试...`);
                }
                await this.delay(this.config.retryDelay * (i + 1));
            }
        }
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 全局数据管理器
 */
class DataManager {
    constructor() {
        this.loader = new DataLoader();
        this.data = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * 注册数据源
     */
    register(name, source, options = {}) {
        this.data.set(name, {
            source,
            options,
            loaded: false,
            value: null
        });
        return this;
    }

    /**
     * 获取数据 (带自动加载)
     */
    async get(name, forceReload = false) {
        const config = this.data.get(name);
        if (!config) {
            throw new Error(`Data source '${name}' not registered`);
        }

        // 如果已加载且不强制重载，返回缓存
        if (config.loaded && !forceReload && config.value) {
            return config.value;
        }

        // 如果正在加载，返回现有 promise
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        // 开始加载
        const loadPromise = this.load(name, config);
        this.loadingPromises.set(name, loadPromise);

        try {
            const result = await loadPromise;
            return result;
        } finally {
            this.loadingPromises.delete(name);
        }
    }

    /**
     * 加载数据
     */
    async load(name, config) {
        try {
            const data = await this.loader.loadWithFallback(
                config.source,
                config.options.fallback
            );

            config.value = data;
            config.loaded = true;

            return data;
        } catch (error) {
            config.error = error;
            throw error;
        }
    }

    /**
     * 批量获取数据
     */
    async getMultiple(names) {
        const results = await Promise.allSettled(
            names.map(name => this.get(name))
        );

        return names.reduce((acc, name, index) => {
            const result = results[index];
            acc[name] = result.status === 'fulfilled' ? result.value : result.reason;
            return acc;
        }, {});
    }

    /**
     * 检查数据是否已加载
     */
    isLoaded(name) {
        const config = this.data.get(name);
        return config ? config.loaded : false;
    }

    /**
     * 清除数据缓存
     */
    clear(name) {
        if (name) {
            const config = this.data.get(name);
            if (config) {
                config.loaded = false;
                config.value = null;
            }
        } else {
            this.data.forEach(config => {
                config.loaded = false;
                config.value = null;
            });
        }
    }
}

// 创建全局数据管理器实例
const dataManager = new DataManager();

// 预定义的数据源配置
const DataSources = {
    MOCK_DATA: {
        name: 'mockData',
        source: '../mock/data.js',
        fallback: () => {
            // 内联 fallback 数据
            return Promise.resolve({
                CATEGORIES: [],
                NOVELS: [],
                CHAPTERS: [],
                USERS: [],
                COMMENTS: []
            });
        }
    },
    GLOBAL_DATA: {
        name: 'globalData',
        source: '../mock/data-global.js',
        fallback: () => {
            if (window.MockData) {
                return Promise.resolve(window.MockData);
            }
            return Promise.reject(new Error('Global MockData not available'));
        }
    }
};

/**
 * 初始化数据加载
 */
async function initDataLoading() {
    // 注册默认数据源
    dataManager.register('mock', DataSources.MOCK_DATA.source, {
        fallback: DataSources.MOCK_DATA.fallback
    });

    dataManager.register('global', DataSources.GLOBAL_DATA.source, {
        fallback: DataSources.GLOBAL_DATA.fallback
    });

    // 尝试加载全局数据
    try {
        const globalData = await dataManager.get('global');
        // 使用日志系统记录成功
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.info('全局数据加载成功');
        }
        return globalData;
    } catch (error) {
        // 使用日志系统记录警告
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.warn('全局数据加载失败:', error.message);
        }
        return null;
    }
}

/**
 * 渲染加载状态
 */
function renderLoadingState(container, options = {}) {
    const { type = 'spinner', message = '加载中...' } = options;
    
    if (!container) return;

    const loadingHTML = {
        spinner: `
            <div class="data-loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `,
        skeleton: `
            <div class="data-loading-state skeleton-state">
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
            </div>
        `,
        dots: `
            <div class="data-loading-state">
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                <p class="loading-message">${message}</p>
            </div>
        `
    };

    container.innerHTML = loadingHTML[type] || loadingHTML.spinner;
}

/**
 * 渲染错误状态
 */
function renderErrorState(container, error, onRetry) {
    if (!container) return;

    container.innerHTML = `
        <div class="data-error-state">
            <div class="error-icon">⚠️</div>
            <p class="error-message">${error.message || '加载失败'}</p>
            ${onRetry ? `<button class="btn-primary retry-btn">重试</button>` : ''}
        </div>
    `;

    const retryBtn = container.querySelector('.retry-btn');
    if (retryBtn && onRetry) {
        retryBtn.addEventListener('click', onRetry);
    }
}

/**
 * 渲染空状态
 */
function renderEmptyState(container, message = '暂无数据') {
    if (!container) return;

    container.innerHTML = `
        <div class="data-empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-message">${message}</p>
        </div>
    `;
}

// 添加样式
const dataLoaderStyles = document.createElement('style');
dataLoaderStyles.textContent = `
    .data-loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: var(--color-text-secondary);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-bg-tertiary);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .loading-message {
        margin-top: 1rem;
        font-size: 0.875rem;
    }

    .loading-dots {
        display: flex;
        gap: 0.5rem;
    }

    .loading-dots span {
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
    }

    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }

    .skeleton-state {
        gap: 0.75rem;
    }

    .skeleton {
        background: linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: var(--radius-md);
    }

    .skeleton-text {
        height: 1rem;
        width: 100%;
    }

    @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    .data-error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
    }

    .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .error-message {
        color: var(--color-error);
        margin-bottom: 1rem;
    }

    .data-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        color: var(--color-text-secondary);
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
`;
document.head.appendChild(dataLoaderStyles);

// 导出
export {
    DataLoader,
    DataManager,
    DataLoadingState,
    DataSources,
    dataManager,
    initDataLoading,
    renderLoadingState,
    renderErrorState,
    renderEmptyState
};

export default dataManager;

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.DataLoader = DataLoader;
    window.DataManager = DataManager;
    window.DataLoadingState = DataLoadingState;
    window.DataSources = DataSources;
    window.dataManager = dataManager;
    window.initDataLoading = initDataLoading;
    window.renderLoadingState = renderLoadingState;
    window.renderErrorState = renderErrorState;
    window.renderEmptyState = renderEmptyState;
}
