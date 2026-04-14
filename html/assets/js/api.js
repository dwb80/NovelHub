/**
 * NovelHub API Client
 * 
 * 统一的API客户端，遵循API标准规范
 * 
 * @version 2.0.0
 * @author Backend Architect
 */

import {
    HttpStatusCode,
    ErrorCode,
    PaginationDefaults,
    PaginationParams,
    AuthHeaders,
    createSuccessResponse,
    createAuthHeader
} from './api-standard.js';

// 修复：统一 localStorage 键名前缀
const STORAGE_KEYS = {
    TOKEN: 'novelhub-token',
    USER: 'novelhub-user',
    REQUEST_ID: 'novelhub-request-id'
};

const API_BASE_URL = '/api';

/**
 * API错误类
 * 统一错误处理，包含业务错误码和HTTP状态码
 */
class ApiError extends Error {
    constructor(message, status, code = null, details = null, requestId = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
        this.requestId = requestId;
        this.timestamp = new Date().toISOString();
    }

    /**
     * 判断是否为认证错误
     */
    isAuthError() {
        return this.status === HttpStatusCode.UNAUTHORIZED || 
               (this.code >= 2000 && this.code < 3000);
    }

    /**
     * 判断是否为权限错误
     */
    isPermissionError() {
        return this.status === HttpStatusCode.FORBIDDEN || this.code === 1007;
    }

    /**
     * 判断是否为资源不存在错误
     */
    isNotFoundError() {
        return this.status === HttpStatusCode.NOT_FOUND || this.code === 1004;
    }

    /**
     * 判断是否为验证错误
     */
    isValidationError() {
        return this.status === HttpStatusCode.BAD_REQUEST || 
               (this.code >= 1000 && this.code < 2000);
    }

    /**
     * 判断是否为服务器错误
     */
    isServerError() {
        return this.status >= 500;
    }

    /**
     * 获取用户友好的错误消息
     */
    getUserMessage() {
        // 根据错误码返回用户友好的消息
        const userMessages = {
            2000: '请先登录后再进行操作',
            2001: '登录已过期，请重新登录',
            2004: '用户名或密码错误',
            2005: '账户已被锁定，请联系客服',
            4001: 'OpenClaw未激活，请先完成激活',
            4004: '已达到配额上限，请升级等级',
            4007: '余额不足，请充值',
            9000: '服务器繁忙，请稍后重试',
            9005: '网络连接失败，请检查网络'
        };

        return userMessages[this.code] || this.message || '操作失败，请稍后重试';
    }
}

/**
 * API客户端类
 */
class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        // 修复：使用统一的键名，同时兼容旧数据
        this.token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
        
        // 迁移旧数据到新键名
        this.migrateOldStorageData();
        
        // 设置默认请求拦截器
        this.setupDefaultInterceptors();
    }

    /**
     * 迁移旧存储数据
     */
    migrateOldStorageData() {
        const oldToken = localStorage.getItem('token');
        if (oldToken && !localStorage.getItem(STORAGE_KEYS.TOKEN)) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, oldToken);
            localStorage.removeItem('token');
        }
    }

    /**
     * 设置默认拦截器
     */
    setupDefaultInterceptors() {
        // 请求拦截器：添加认证头
        this.addRequestInterceptor((config) => {
            if (this.token) {
                config.headers = {
                    ...config.headers,
                    ...createAuthHeader(this.token)
                };
            }
            
            // 添加请求ID
            config.headers[AuthHeaders.REQUEST_ID] = this.generateRequestId();
            
            return config;
        });

        // 响应拦截器：统一错误处理
        this.addResponseInterceptor(
            (response) => response,
            (error) => this.handleResponseError(error)
        );
    }

    /**
     * 生成请求ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * 设置Token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.removeItem('token'); // 清理旧键名
        } else {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem('token');
        }
    }

    /**
     * 获取Token
     */
    getToken() {
        return this.token;
    }

    /**
     * 清除认证信息
     */
    clearAuth() {
        this.token = null;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    /**
     * 添加请求拦截器
     */
    addRequestInterceptor(onFulfilled, onRejected) {
        this.requestInterceptors.push({ onFulfilled, onRejected });
    }

    /**
     * 添加响应拦截器
     */
    addResponseInterceptor(onFulfilled, onRejected) {
        this.responseInterceptors.push({ onFulfilled, onRejected });
    }

    /**
     * 执行请求拦截器
     */
    async runRequestInterceptors(config) {
        for (const interceptor of this.requestInterceptors) {
            try {
                if (interceptor.onFulfilled) {
                    config = await interceptor.onFulfilled(config);
                }
            } catch (error) {
                if (interceptor.onRejected) {
                    config = await interceptor.onRejected(error);
                } else {
                    throw error;
                }
            }
        }
        return config;
    }

    /**
     * 执行响应拦截器
     */
    async runResponseInterceptors(response) {
        for (const interceptor of this.responseInterceptors) {
            try {
                if (interceptor.onFulfilled) {
                    response = await interceptor.onFulfilled(response);
                }
            } catch (error) {
                if (interceptor.onRejected) {
                    response = await interceptor.onRejected(error);
                } else {
                    throw error;
                }
            }
        }
        return response;
    }

    /**
     * 处理响应错误
     */
    handleResponseError(error) {
        // 处理HTTP错误
        if (error.status) {
            const errorCode = this.getErrorCodeFromStatus(error.status);
            throw new ApiError(
                error.message || errorCode.message,
                error.status,
                errorCode.code,
                error.details,
                error.requestId
            );
        }
        
        // 处理网络错误
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new ApiError(
                '网络连接失败，请检查网络',
                0,
                ErrorCode.NETWORK_ERROR.code,
                null,
                null
            );
        }

        throw error;
    }

    /**
     * 从HTTP状态码获取错误码
     */
    getErrorCodeFromStatus(status) {
        const statusMap = {
            400: ErrorCode.INVALID_PARAMETER,
            401: ErrorCode.UNAUTHORIZED,
            403: ErrorCode.PERMISSION_DENIED,
            404: ErrorCode.RESOURCE_NOT_FOUND,
            409: ErrorCode.RESOURCE_EXISTS,
            422: ErrorCode.INVALID_FORMAT,
            429: ErrorCode.RATE_LIMIT_EXCEEDED,
            500: ErrorCode.INTERNAL_ERROR,
            502: ErrorCode.NETWORK_ERROR,
            503: ErrorCode.SERVICE_UNAVAILABLE,
            504: ErrorCode.NETWORK_ERROR
        };
        return statusMap[status] || ErrorCode.UNKNOWN_ERROR;
    }

    /**
     * 发送请求
     */
    async request(endpoint, options = {}) {
        let config = {
            url: `${this.baseUrl}${endpoint}`,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            body: options.body,
            params: options.params
        };

        // 执行请求拦截器
        config = await this.runRequestInterceptors(config);

        // 构建URL（包含查询参数）
        let url = config.url;
        if (config.params) {
            const queryString = new URLSearchParams(config.params).toString();
            url = `${url}?${queryString}`;
        }

        try {
            const fetchOptions = {
                method: config.method,
                headers: config.headers
            };

            if (config.body && config.method !== 'GET') {
                fetchOptions.body = typeof config.body === 'string' 
                    ? config.body 
                    : JSON.stringify(config.body);
            }

            const response = await fetch(url, fetchOptions);
            
            // 解析响应
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // 执行响应拦截器
            data = await this.runResponseInterceptors(data);

            // 处理错误响应
            if (!response.ok) {
                // 如果响应已经是标准格式
                if (data && typeof data === 'object' && 'code' in data) {
                    throw new ApiError(
                        data.message || '请求失败',
                        response.status,
                        data.code,
                        data.error_details,
                        data.request_id
                    );
                }
                
                // 否则创建标准错误
                const errorCode = this.getErrorCodeFromStatus(response.status);
                throw new ApiError(
                    errorCode.message,
                    response.status,
                    errorCode.code,
                    data
                );
            }

            // 验证响应格式
            if (data && typeof data === 'object' && 'code' in data) {
                // 已经是标准格式
                if (data.code !== 0) {
                    throw new ApiError(
                        data.message,
                        response.status,
                        data.code,
                        data.error_details,
                        data.request_id
                    );
                }
                return data;
            }

            // 包装为标准格式
            return createSuccessResponse(data, {}, config.headers[AuthHeaders.REQUEST_ID]);

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(
                '网络错误，请稍后重试',
                0,
                ErrorCode.NETWORK_ERROR.code
            );
        }
    }

    /**
     * GET请求
     * @param {string} endpoint - API端点
     * @param {object} params - 查询参数（支持page/page_size分页）
     */
    get(endpoint, params) {
        // 标准化分页参数
        if (params) {
            params = this.normalizeParams(params);
        }
        
        return this.request(endpoint, { 
            method: 'GET',
            params 
        });
    }

    /**
     * POST请求
     */
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }

    /**
     * PUT请求
     */
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    /**
     * DELETE请求
     */
    delete(endpoint, params) {
        return this.request(endpoint, {
            method: 'DELETE',
            params
        });
    }

    /**
     * PATCH请求
     */
    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    }

    /**
     * 标准化请求参数
     * - 转换分页参数为统一格式
     * - 转换驼峰命名为下划线命名
     */
    normalizeParams(params) {
        const normalized = { ...params };

        // 标准化分页参数
        if (PaginationParams.OFFSET in normalized || PaginationParams.LIMIT in normalized) {
            const offset = parseInt(normalized[PaginationParams.OFFSET]) || 0;
            const limit = parseInt(normalized[PaginationParams.LIMIT]) || PaginationDefaults.PAGE_SIZE;
            
            normalized[PaginationParams.PAGE] = Math.floor(offset / limit) + 1;
            normalized[PaginationParams.PAGE_SIZE] = limit;
            
            delete normalized[PaginationParams.OFFSET];
            delete normalized[PaginationParams.LIMIT];
        }

        // 转换驼峰命名为下划线命名（优化：处理连续大写字母）
        const camelToSnake = (str) => str.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        const converted = {};
        for (const [key, value] of Object.entries(normalized)) {
            converted[camelToSnake(key)] = value;
        }

        return converted;
    }
}

// 创建API客户端实例
const api = new ApiClient();

// ==================== API模块定义 ====================

/**
 * 认证API
 */
export const authApi = {
    /**
     * 用户登录
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     * @param {boolean} rememberMe - 记住我
     */
    login: (email, password, rememberMe = false) => {
        return api.post('/auth/login', { 
            email, 
            password, 
            remember_me: rememberMe 
        });
    },

    /**
     * 用户注册
     * @param {string} username - 用户名
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     */
    register: (username, email, password) => {
        return api.post('/auth/register', { 
            username, 
            email, 
            password 
        });
    },

    /**
     * 用户登出
     */
    logout: () => {
        return api.post('/auth/logout').finally(() => {
            api.clearAuth();
        });
    },

    /**
     * 获取当前用户信息
     */
    getProfile: () => {
        return api.get('/auth/profile');
    },

    /**
     * 刷新Token
     */
    refreshToken: () => {
        return api.post('/auth/refresh');
    },

    /**
     * 修改密码
     */
    changePassword: (oldPassword, newPassword) => {
        return api.post('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword
        });
    },

    /**
     * 发送密码重置邮件
     */
    forgotPassword: (email) => {
        return api.post('/auth/forgot-password', { email });
    },

    /**
     * 重置密码
     */
    resetPassword: (token, newPassword) => {
        return api.post('/auth/reset-password', {
            token,
            new_password: newPassword
        });
    }
};

/**
 * 小说API
 */
export const novelApi = {
    /**
     * 获取小说列表
     * @param {object} params - 查询参数
     * @param {number} params.page - 页码
     * @param {number} params.page_size - 每页数量
     * @param {string} params.category - 分类
     * @param {string} params.sort - 排序字段
     * @param {string} params.order - 排序方向(asc/desc)
     */
    getList: (params = {}) => {
        return api.get('/novels', params);
    },

    /**
     * 获取小说详情
     * @param {string} novelId - 小说ID
     */
    getDetail: (novelId) => {
        return api.get(`/novels/${novelId}`);
    },

    /**
     * 获取小说章节列表
     * @param {string} novelId - 小说ID
     * @param {object} params - 查询参数
     */
    getChapters: (novelId, params = {}) => {
        return api.get(`/novels/${novelId}/chapters`, params);
    },

    /**
     * 搜索小说
     * @param {string} query - 搜索关键词
     * @param {object} params - 其他参数
     */
    search: (query, params = {}) => {
        return api.get('/novels/search', { 
            q: query,
            ...params
        });
    },

    /**
     * 获取分类列表
     */
    getCategories: () => {
        return api.get('/categories');
    },

    /**
     * 获取热门小说
     */
    getHotNovels: (params = {}) => {
        return api.get('/novels/hot', params);
    },

    /**
     * 获取最新小说
     */
    getNewNovels: (params = {}) => {
        return api.get('/novels/new', params);
    }
};

/**
 * 章节API
 */
export const chapterApi = {
    /**
     * 获取章节内容
     * @param {string} chapterId - 章节ID
     */
    getContent: (chapterId) => {
        return api.get(`/chapters/${chapterId}`);
    },

    /**
     * 获取阅读进度
     * @param {string} novelId - 小说ID
     */
    getProgress: (novelId) => {
        return api.get(`/chapters/progress/${novelId}`);
    },

    /**
     * 更新阅读进度
     * @param {string} novelId - 小说ID
     * @param {string} chapterId - 章节ID
     * @param {number} progress - 阅读进度(0-100)
     * @param {number} position - 阅读位置(字符数)
     */
    updateProgress: (novelId, chapterId, progress, position = 0) => {
        return api.post('/chapters/progress', { 
            novel_id: novelId, 
            chapter_id: chapterId, 
            progress,
            position
        });
    },

    /**
     * 获取上一章
     */
    getPrevChapter: (chapterId) => {
        return api.get(`/chapters/${chapterId}/prev`);
    },

    /**
     * 获取下一章
     */
    getNextChapter: (chapterId) => {
        return api.get(`/chapters/${chapterId}/next`);
    }
};

/**
 * 书架API
 */
export const bookshelfApi = {
    /**
     * 获取书架列表
     * @param {object} params - 查询参数
     */
    getList: (params = {}) => {
        return api.get('/bookshelf', params);
    },

    /**
     * 添加小说到书架
     * @param {string} novelId - 小说ID
     */
    add: (novelId) => {
        return api.post('/bookshelf', { novel_id: novelId });
    },

    /**
     * 从书架移除小说
     * @param {string} novelId - 小说ID
     */
    remove: (novelId) => {
        return api.delete(`/bookshelf/${novelId}`);
    },

    /**
     * 更新追更状态
     * @param {string} novelId - 小说ID
     * @param {boolean} isSubscribed - 是否追更
     */
    updateSubscription: (novelId, isSubscribed) => {
        return api.put(`/bookshelf/subscription/${novelId}`, { 
            is_subscribed: isSubscribed 
        });
    },

    /**
     * 更新书架分类
     */
    updateCategory: (novelId, categoryId) => {
        return api.put(`/bookshelf/${novelId}/category`, {
            category_id: categoryId
        });
    },

    /**
     * 批量操作
     */
    batchOperation: (operation, novelIds) => {
        return api.post('/bookshelf/batch', {
            operation,
            novel_ids: novelIds
        });
    }
};

/**
 * 评论API
 */
export const commentApi = {
    /**
     * 获取评论列表
     * @param {string} targetType - 目标类型(novel/chapter)
     * @param {string} targetId - 目标ID
     * @param {object} params - 查询参数
     */
    getList: (targetType, targetId, params = {}) => {
        return api.get(`/comments/${targetType}/${targetId}`, params);
    },

    /**
     * 创建评论
     * @param {object} data - 评论数据
     */
    create: (data) => {
        return api.post('/comments', {
            target_type: data.targetType,
            target_id: data.targetId,
            content: data.content,
            parent_id: data.parentId || null
        });
    },

    /**
     * 点赞评论
     * @param {string} commentId - 评论ID
     */
    like: (commentId) => {
        return api.post(`/comments/${commentId}/like`);
    },

    /**
     * 取消点赞
     * @param {string} commentId - 评论ID
     */
    unlike: (commentId) => {
        return api.delete(`/comments/${commentId}/like`);
    },

    /**
     * 删除评论
     * @param {string} commentId - 评论ID
     */
    delete: (commentId) => {
        return api.delete(`/comments/${commentId}`);
    },

    /**
     * 编辑评论
     */
    edit: (commentId, content) => {
        return api.put(`/comments/${commentId}`, { content });
    }
};

/**
 * 通知API
 */
export const notificationApi = {
    /**
     * 获取通知列表
     */
    getList: (params = {}) => {
        return api.get('/notifications', params);
    },

    /**
     * 标记通知为已读
     * @param {string} notificationId - 通知ID
     */
    markAsRead: (notificationId) => {
        return api.put(`/notifications/${notificationId}/read`);
    },

    /**
     * 标记所有通知为已读
     */
    markAllAsRead: () => {
        return api.put('/notifications/read-all');
    },

    /**
     * 获取通知偏好设置
     */
    getPreferences: () => {
        return api.get('/notifications/preferences');
    },

    /**
     * 更新通知偏好设置
     */
    updatePreferences: (preferences) => {
        return api.put('/notifications/preferences', preferences);
    },

    /**
     * 获取未读通知数量
     */
    getUnreadCount: () => {
        return api.get('/notifications/unread-count');
    }
};

/**
 * OpenClaw API
 */
export const openclawApi = {
    /**
     * 获取激活状态
     */
    getActivationStatus: () => {
        return api.get('/openclaw/activation/status');
    },

    /**
     * 提交激活申请
     */
    submitActivation: (data) => {
        return api.post('/openclaw/activation', data);
    },

    /**
     * 获取配额信息
     */
    getQuota: () => {
        return api.get('/openclaw/quota');
    },

    /**
     * 获取API Key列表
     */
    getApiKeys: () => {
        return api.get('/openclaw/api-keys');
    },

    /**
     * 生成新的API Key
     */
    generateApiKey: (name) => {
        return api.post('/openclaw/api-keys', { name });
    },

    /**
     * 撤销API Key
     */
    revokeApiKey: (keyId) => {
        return api.delete(`/openclaw/api-keys/${keyId}`);
    }
};

/**
 * 搜索API
 */
export const searchApi = {
    /**
     * 全文搜索
     * @param {string} query - 搜索关键词
     * @param {object} params - 其他参数
     */
    search: (query, params = {}) => {
        return api.get('/search', { 
            q: query,
            ...params
        });
    },

    /**
     * 获取搜索建议
     * @param {string} query - 搜索关键词
     */
    getSuggestions: (query) => {
        return api.get('/search/suggestions', { q: query });
    },

    /**
     * 获取热门搜索
     */
    getHotSearches: (params = {}) => {
        return api.get('/search/hot', params);
    },

    /**
     * 获取搜索历史
     */
    getHistory: () => {
        return api.get('/search/history');
    },

    /**
     * 删除搜索历史
     */
    deleteHistory: (keyword) => {
        return api.delete('/search/history', { keyword });
    },

    /**
     * 清空搜索历史
     */
    clearHistory: () => {
        return api.delete('/search/history/clear');
    }
};

/**
 * 用户API
 */
export const userApi = {
    /**
     * 获取用户资料
     */
    getProfile: () => {
        return api.get('/users/profile');
    },

    /**
     * 更新用户资料
     */
    updateProfile: (data) => {
        return api.put('/users/profile', data);
    },

    /**
     * 上传头像
     */
    uploadAvatar: (formData) => {
        return api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * 获取阅读历史
     */
    getReadingHistory: (params = {}) => {
        return api.get('/users/reading-history', params);
    },

    /**
     * 获取收藏列表
     */
    getFavorites: (params = {}) => {
        return api.get('/users/favorites', params);
    },

    /**
     * 获取用户统计
     */
    getStatistics: () => {
        return api.get('/users/statistics');
    }
};

// ==================== 导出 ====================

export { api, ApiError, ErrorCode, HttpStatusCode };

export default {
    api,
    ApiError,
    ErrorCode,
    HttpStatusCode,
    authApi,
    novelApi,
    chapterApi,
    bookshelfApi,
    commentApi,
    notificationApi,
    openclawApi,
    searchApi,
    userApi
};

