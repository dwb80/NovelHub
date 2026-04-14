/**
 * Error Handler Module
 * NovelHub - 异常场景处理与重试机制
 * 
 * 功能:
 * - 网络错误处理
 * - 自动重试机制
 * - 离线状态检测
 * - 错误日志上报
 * 
 * @version 1.0.0
 */

import { ApiError } from '../api.js';

// ========== 配置常量 ==========

const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    retryDelayMultiplier: 2,
    maxRetryDelay: 10000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['network_error', 'timeout', 'ECONNRESET', 'ETIMEDOUT']
};

const OFFLINE_CONFIG = {
    checkInterval: 30000, // 30秒检查一次网络状态
    offlineQueueKey: 'novelhub-offline-queue'
};

// ========== 网络状态管理器 ==========

class NetworkStatusManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = new Set();
        this.checkInterval = null;
        
        this.init();
    }

    init() {
        // 监听在线/离线事件
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // 定期检查网络状态
        this.startPeriodicCheck();
    }

    handleOnline() {
        if (!this.isOnline) {
            this.isOnline = true;
            this.notifyListeners('online');
            this.processOfflineQueue();
        }
    }

    handleOffline() {
        if (this.isOnline) {
            this.isOnline = false;
            this.notifyListeners('offline');
        }
    }

    startPeriodicCheck() {
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, OFFLINE_CONFIG.checkInterval);
    }

    async checkConnection() {
        try {
            // 使用轻量级请求检查网络
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/api/health', {
                method: 'HEAD',
                signal: controller.signal,
                cache: 'no-store'
            });
            
            clearTimeout(timeout);
            
            if (!this.isOnline && response.ok) {
                this.handleOnline();
            }
        } catch (error) {
            if (this.isOnline) {
                this.handleOffline();
            }
        }
    }

    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status);
            } catch (e) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('网络状态监听器错误:', e.message);
                }
            }
        });
    }

    processOfflineQueue() {
        const queue = this.getOfflineQueue();
        if (queue.length === 0) return;

        // 处理离线队列中的请求
        queue.forEach(async (item) => {
            try {
                await fetch(item.url, item.options);
                this.removeFromOfflineQueue(item.id);
            } catch (error) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('离线队列处理失败:', error.message);
                }
            }
        });
    }

    getOfflineQueue() {
        try {
            const queue = localStorage.getItem(OFFLINE_CONFIG.offlineQueueKey);
            return queue ? JSON.parse(queue) : [];
        } catch {
            return [];
        }
    }

    addToOfflineQueue(request) {
        const queue = this.getOfflineQueue();
        queue.push({
            id: Date.now() + Math.random(),
            url: request.url,
            options: request.options,
            timestamp: Date.now()
        });
        
        try {
            localStorage.setItem(OFFLINE_CONFIG.offlineQueueKey, JSON.stringify(queue));
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('离线队列保存失败:', e.message);
            }
        }
    }

    removeFromOfflineQueue(id) {
        const queue = this.getOfflineQueue().filter(item => item.id !== id);
        localStorage.setItem(OFFLINE_CONFIG.offlineQueueKey, JSON.stringify(queue));
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// ========== 重试管理器 ==========

class RetryManager {
    constructor(config = {}) {
        this.config = { ...RETRY_CONFIG, ...config };
        this.retryCount = new Map();
    }

    /**
     * 检查是否应该重试
     */
    shouldRetry(error, requestId) {
        // 检查重试次数
        const currentCount = this.retryCount.get(requestId) || 0;
        if (currentCount >= this.config.maxRetries) {
            this.retryCount.delete(requestId);
            return false;
        }

        // 检查错误类型
        if (error instanceof ApiError) {
            // 检查HTTP状态码
            if (this.config.retryableStatuses.includes(error.status)) {
                return true;
            }
            
            // 检查错误码
            if (error.code && this.config.retryableErrors.includes(error.code.toString())) {
                return true;
            }
        }

        // 检查网络错误
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return true;
        }

        // 检查超时错误
        if (error.name === 'AbortError') {
            return true;
        }

        return false;
    }

    /**
     * 获取重试延迟
     */
    getRetryDelay(requestId) {
        const currentCount = this.retryCount.get(requestId) || 0;
        const delay = Math.min(
            this.config.retryDelay * Math.pow(this.config.retryDelayMultiplier, currentCount),
            this.config.maxRetryDelay
        );
        
        // 添加随机抖动，避免雪崩
        const jitter = Math.random() * 0.3 * delay;
        return delay + jitter;
    }

    /**
     * 增加重试计数
     */
    incrementRetryCount(requestId) {
        const currentCount = this.retryCount.get(requestId) || 0;
        this.retryCount.set(requestId, currentCount + 1);
    }

    /**
     * 重置重试计数
     */
    resetRetryCount(requestId) {
        this.retryCount.delete(requestId);
    }

    /**
     * 执行带重试的请求
     */
    async executeWithRetry(requestFn, requestId = 'default') {
        try {
            const result = await requestFn();
            this.resetRetryCount(requestId);
            return result;
        } catch (error) {
            if (this.shouldRetry(error, requestId)) {
                this.incrementRetryCount(requestId);
                const delay = this.getRetryDelay(requestId);
                
                // 触发重试事件
                this.onRetry?.(error, this.retryCount.get(requestId), delay);
                
                await this.sleep(delay);
                return this.executeWithRetry(requestFn, requestId);
            }
            
            this.resetRetryCount(requestId);
            throw error;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ========== 错误处理器 ==========

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.listeners = new Map();
        
        this.init();
    }

    init() {
        // 监听全局错误
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));
    }

    /**
     * 处理API错误
     */
    handleApiError(error, context = {}) {
        const errorInfo = this.normalizeError(error, context);
        
        // 记录错误日志
        this.logError(errorInfo);
        
        // 根据错误类型处理
        if (error instanceof ApiError) {
            return this.handleApiErrorByType(error, context);
        }

        // 网络错误
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return this.handleNetworkError(error, context);
        }

        // 超时错误
        if (error.name === 'AbortError') {
            return this.handleTimeoutError(error, context);
        }

        return this.handleUnknownError(error, context);
    }

    /**
     * 根据API错误类型处理
     */
    handleApiErrorByType(error, context) {
        const { status, code, message } = error;

        // 认证错误
        if (status === 401 || (code >= 2000 && code < 3000)) {
            return {
                type: 'auth',
                message: message || '请先登录',
                action: 'login',
                canRetry: false
            };
        }

        // 权限错误
        if (status === 403 || code === 1007) {
            return {
                type: 'permission',
                message: message || '没有权限执行此操作',
                action: 'back',
                canRetry: false
            };
        }

        // 资源不存在
        if (status === 404 || code === 1004) {
            return {
                type: 'notFound',
                message: message || '请求的资源不存在',
                action: 'back',
                canRetry: false
            };
        }

        // 验证错误
        if (status === 400 || status === 422 || (code >= 1000 && code < 2000)) {
            return {
                type: 'validation',
                message: message || '请求参数错误',
                details: error.details,
                canRetry: true
            };
        }

        // 服务器错误
        if (status >= 500) {
            return {
                type: 'server',
                message: message || '服务器繁忙，请稍后重试',
                canRetry: true
            };
        }

        return {
            type: 'unknown',
            message: message || '操作失败，请稍后重试',
            canRetry: true
        };
    }

    /**
     * 处理网络错误
     */
    handleNetworkError(error, context) {
        return {
            type: 'network',
            message: '网络连接失败，请检查网络设置',
            action: 'retry',
            canRetry: true,
            isOffline: !navigator.onLine
        };
    }

    /**
     * 处理超时错误
     */
    handleTimeoutError(error, context) {
        return {
            type: 'timeout',
            message: '请求超时，请稍后重试',
            action: 'retry',
            canRetry: true
        };
    }

    /**
     * 处理未知错误
     */
    handleUnknownError(error, context) {
        return {
            type: 'unknown',
            message: '发生未知错误，请稍后重试',
            action: 'retry',
            canRetry: true
        };
    }

    /**
     * 规范化错误信息
     */
    normalizeError(error, context) {
        return {
            timestamp: new Date().toISOString(),
            type: error.name || 'Error',
            message: error.message,
            stack: error.stack,
            status: error.status,
            code: error.code,
            url: context.url,
            method: context.method,
            userAgent: navigator.userAgent,
            online: navigator.onLine
        };
    }

    /**
     * 记录错误日志
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // 限制日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // 使用日志系统记录错误（开发环境输出）
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.error('错误处理:', errorInfo);
        }
    }

    /**
     * 获取错误日志
     */
    getErrorLog() {
        return [...this.errorLog];
    }

    /**
     * 清空错误日志
     */
    clearErrorLog() {
        this.errorLog = [];
    }

    /**
     * 上报错误
     */
    reportError(errorInfo) {
        // 可以发送到错误监控服务，如 Sentry
        if (window.Sentry) {
            window.Sentry.captureException(errorInfo);
        }
    }

    /**
     * 处理全局错误
     */
    handleGlobalError(event) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            type: 'global',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error?.stack
        };
        
        this.logError(errorInfo);
    }

    /**
     * 处理未捕获的Promise错误
     */
    handleUnhandledRejection(event) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            type: 'unhandledrejection',
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack
        };
        
        this.logError(errorInfo);
    }
}

// ========== 空数据处理 ==========

class EmptyDataHandler {
    /**
     * 检查数据是否为空
     */
    static isEmpty(data) {
        if (data === null || data === undefined) return true;
        if (Array.isArray(data)) return data.length === 0;
        if (typeof data === 'object') return Object.keys(data).length === 0;
        if (typeof data === 'string') return data.trim().length === 0;
        return false;
    }

    /**
     * 获取空数据类型
     */
    static getEmptyType(data, context = {}) {
        const { expectedType, fieldName } = context;
        
        if (Array.isArray(data) && data.length === 0) {
            return 'empty_array';
        }
        
        if (typeof data === 'object' && Object.keys(data).length === 0) {
            return 'empty_object';
        }
        
        if (typeof data === 'string' && data.trim().length === 0) {
            return 'empty_string';
        }
        
        if (data === null) {
            return 'null';
        }
        
        if (data === undefined) {
            return 'undefined';
        }
        
        return 'unknown';
    }

    /**
     * 创建空数据响应
     */
    static createEmptyResponse(type, options = {}) {
        const templates = {
            empty_array: {
                data: [],
                pagination: {
                    page: 1,
                    page_size: 20,
                    total: 0,
                    total_pages: 0
                },
                message: options.message || '暂无数据'
            },
            empty_object: {
                data: {},
                message: options.message || '暂无数据'
            },
            empty_string: {
                data: '',
                message: options.message || '内容为空'
            },
            null: {
                data: null,
                message: options.message || '数据不存在'
            }
        };

        return templates[type] || templates.empty_array;
    }
}

// ========== 导出单例 ==========

export const networkStatus = new NetworkStatusManager();
export const retryManager = new RetryManager();
export const errorHandler = new ErrorHandler();

// ========== 便捷函数 ==========

/**
 * 执行带重试的请求
 */
export async function withRetry(requestFn, options = {}) {
    const { requestId = 'default', onRetry } = options;
    
    if (onRetry) {
        retryManager.onRetry = onRetry;
    }
    
    return retryManager.executeWithRetry(requestFn, requestId);
}

/**
 * 检查是否为空数据
 */
export function isEmptyData(data) {
    return EmptyDataHandler.isEmpty(data);
}

/**
 * 处理API错误
 */
export function handleApiError(error, context = {}) {
    return errorHandler.handleApiError(error, context);
}

/**
 * 显示错误提示
 */
export function showErrorToast(error, options = {}) {
    const errorInfo = errorHandler.handleApiError(error, options.context);
    
    if (window.showToast) {
        window.showToast(errorInfo.message, 'error');
    }
    
    return errorInfo;
}

/**
 * 创建带错误处理的包装函数
 */
export function withErrorHandling(fn, options = {}) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            const errorInfo = errorHandler.handleApiError(error, options.context);
            
            if (options.onError) {
                options.onError(errorInfo, error);
            }
            
            if (options.showToast !== false) {
                showErrorToast(error, options);
            }
            
            throw error;
        }
    };
}

// 默认导出
export default {
    NetworkStatusManager,
    RetryManager,
    ErrorHandler,
    EmptyDataHandler,
    networkStatus,
    retryManager,
    errorHandler,
    withRetry,
    isEmptyData,
    handleApiError,
    showErrorToast,
    withErrorHandling
};
