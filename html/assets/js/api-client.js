/**
 * API Client - NovelHub
 * 统一API接口返回格式、错误码处理和请求参数命名
 * @version 2.0.0
 */

// API 基础配置
const API_CONFIG = {
    baseURL: window.location.hostname === 'localhost' || window.location.protocol === 'file:' 
        ? '' 
        : 'https://api.novelhub.com',
    timeout: 30000,
    version: 'v1'
};

// 统一错误码定义
const ERROR_CODES = {
    // 成功
    SUCCESS: { code: 200, message: '操作成功' },
    CREATED: { code: 201, message: '创建成功' },
    ACCEPTED: { code: 202, message: '请求已接受' },
    NO_CONTENT: { code: 204, message: '无内容' },
    
    // 客户端错误
    BAD_REQUEST: { code: 400, message: '请求参数错误' },
    UNAUTHORIZED: { code: 401, message: '未授权，请先登录' },
    FORBIDDEN: { code: 403, message: '禁止访问' },
    NOT_FOUND: { code: 404, message: '资源不存在' },
    METHOD_NOT_ALLOWED: { code: 405, message: '请求方法不允许' },
    CONFLICT: { code: 409, message: '资源冲突' },
    VALIDATION_ERROR: { code: 422, message: '数据验证失败' },
    TOO_MANY_REQUESTS: { code: 429, message: '请求过于频繁' },
    
    // 服务器错误
    INTERNAL_ERROR: { code: 500, message: '服务器内部错误' },
    NOT_IMPLEMENTED: { code: 501, message: '功能尚未实现' },
    BAD_GATEWAY: { code: 502, message: '网关错误' },
    SERVICE_UNAVAILABLE: { code: 503, message: '服务不可用' },
    GATEWAY_TIMEOUT: { code: 504, message: '网关超时' },
    
    // 业务错误 (1000+)
    USER_NOT_FOUND: { code: 1001, message: '用户不存在' },
    USER_ALREADY_EXISTS: { code: 1002, message: '用户已存在' },
    INVALID_CREDENTIALS: { code: 1003, message: '用户名或密码错误' },
    ACCOUNT_LOCKED: { code: 1004, message: '账户已被锁定' },
    TOKEN_EXPIRED: { code: 1005, message: '登录已过期，请重新登录' },
    TOKEN_INVALID: { code: 1006, message: '无效的令牌' },
    
    NOVEL_NOT_FOUND: { code: 1101, message: '小说不存在' },
    CHAPTER_NOT_FOUND: { code: 1102, message: '章节不存在' },
    CHAPTER_LOCKED: { code: 1103, message: '章节已锁定' },
    INSUFFICIENT_BALANCE: { code: 1104, message: '余额不足' },
    
    COMMENT_NOT_FOUND: { code: 1201, message: '评论不存在' },
    COMMENT_BLOCKED: { code: 1202, message: '评论包含敏感词' },
    
    REVIEW_PENDING: { code: 1301, message: '评审中，请稍后' },
    REVIEW_REJECTED: { code: 1302, message: '内容未通过评审' },
    
    NETWORK_ERROR: { code: 9001, message: '网络连接失败' },
    TIMEOUT_ERROR: { code: 9002, message: '请求超时' },
    UNKNOWN_ERROR: { code: 9999, message: '未知错误' }
};

// 统一API响应格式
class ApiResponse {
    constructor(data = null, error = null, meta = null) {
        this.success = error === null;
        this.data = data;
        this.error = error;
        this.meta = meta || {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId()
        };
    }

    static success(data, meta = null) {
        return new ApiResponse(data, null, meta);
    }

    static error(errorCode, message = null, details = null) {
        const error = {
            code: errorCode.code || errorCode,
            message: message || errorCode.message || '未知错误',
            details: details
        };
        return new ApiResponse(null, error);
    }
}

// 生成请求ID
function generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 统一请求参数转换 (snake_case 转 camelCase 和反向)
const ParamConverter = {
    // camelCase 转 snake_case
    toSnakeCase(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.toSnakeCase(item));
        
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = this.toSnakeCase(obj[key]);
            return acc;
        }, {});
    },

    // snake_case 转 camelCase
    toCamelCase(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.toCamelCase(item));
        
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = this.toCamelCase(obj[key]);
            return acc;
        }, {});
    }
};

// API 客户端
class ApiClient {
    constructor(config = {}) {
        this.config = { ...API_CONFIG, ...config };
        this.interceptors = {
            request: [],
            response: []
        };
    }

    // 添加请求拦截器
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    // 添加响应拦截器
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }

    // 执行拦截器
    async runInterceptors(type, data) {
        let result = data;
        for (const interceptor of this.interceptors[type]) {
            result = await interceptor(result);
        }
        return result;
    }

    // 构建URL
    buildURL(endpoint) {
        if (endpoint.startsWith('http')) return endpoint;
        const base = this.config.baseURL;
        const version = this.config.version;
        return `${base}/api/${version}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }

    // 获取请求头
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Request-ID': generateRequestId(),
            ...customHeaders
        };

        // 添加认证令牌
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // 发送请求
    async request(method, endpoint, data = null, options = {}) {
        const url = this.buildURL(endpoint);
        const headers = this.getHeaders(options.headers);

        // 转换请求参数为 snake_case
        const requestData = data ? ParamConverter.toSnakeCase(data) : null;

        // 构建请求配置
        const config = {
            method: method.toUpperCase(),
            headers,
            ...options
        };

        if (requestData && method.toUpperCase() !== 'GET') {
            config.body = JSON.stringify(requestData);
        } else if (requestData && method.toUpperCase() === 'GET') {
            // GET 请求将参数附加到 URL
            const params = new URLSearchParams();
            Object.entries(requestData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
            if (params.toString()) {
                config.url = `${url}?${params.toString()}`;
            }
        }

        try {
            // 执行请求拦截器
            const finalConfig = await this.runInterceptors('request', config);

            // 发送请求
            const response = await fetch(config.url || url, finalConfig);
            
            // 处理响应
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = { data: await response.text() };
            }

            // 转换响应数据为 camelCase
            responseData = ParamConverter.toCamelCase(responseData);

            // 执行响应拦截器
            const finalResponse = await this.runInterceptors('response', responseData);

            // 统一处理错误
            if (!response.ok) {
                return this.handleErrorResponse(response, finalResponse);
            }

            // 标准化成功响应
            return this.normalizeSuccessResponse(finalResponse);

        } catch (error) {
            return this.handleNetworkError(error);
        }
    }

    // 处理错误响应
    handleErrorResponse(response, data) {
        let errorCode = ERROR_CODES.UNKNOWN_ERROR;
        
        switch (response.status) {
            case 400: errorCode = ERROR_CODES.BAD_REQUEST; break;
            case 401: errorCode = ERROR_CODES.UNAUTHORIZED; break;
            case 403: errorCode = ERROR_CODES.FORBIDDEN; break;
            case 404: errorCode = ERROR_CODES.NOT_FOUND; break;
            case 422: errorCode = ERROR_CODES.VALIDATION_ERROR; break;
            case 429: errorCode = ERROR_CODES.TOO_MANY_REQUESTS; break;
            case 500: errorCode = ERROR_CODES.INTERNAL_ERROR; break;
            case 503: errorCode = ERROR_CODES.SERVICE_UNAVAILABLE; break;
        }

        // 如果后端返回了具体的错误码，使用后端返回的
        if (data.error && data.error.code) {
            errorCode = Object.values(ERROR_CODES).find(e => e.code === data.error.code) || errorCode;
        }

        return ApiResponse.error(
            errorCode,
            data.error?.message || data.message || errorCode.message,
            data.error?.details || data.details
        );
    }

    // 处理网络错误
    handleNetworkError(error) {
        // 使用日志系统记录错误
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.error('网络错误:', error.message);
        }

        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            return ApiResponse.error(ERROR_CODES.TIMEOUT_ERROR);
        }
        
        return ApiResponse.error(ERROR_CODES.NETWORK_ERROR);
    }

    // 标准化成功响应
    normalizeSuccessResponse(data) {
        // 如果已经是标准格式，直接返回
        if (data.hasOwnProperty('success') && (data.hasOwnProperty('data') || data.hasOwnProperty('error'))) {
            return data;
        }

        // 包装为标准格式
        return ApiResponse.success(data);
    }

    // HTTP 方法快捷方式
    get(endpoint, params = null, options = {}) {
        return this.request('GET', endpoint, params, options);
    }

    post(endpoint, data = null, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    put(endpoint, data = null, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    patch(endpoint, data = null, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }

    delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }
}

// 创建默认客户端实例
const apiClient = new ApiClient();

// 添加默认拦截器
apiClient.addRequestInterceptor(async (config) => {
    // 可以在这里添加全局请求处理，如显示 loading
    return config;
});

apiClient.addResponseInterceptor(async (response) => {
    // 可以在这里添加全局响应处理，如隐藏 loading
    return response;
});

// 导出
export { ApiClient, ApiResponse, ERROR_CODES, ParamConverter, apiClient };
export default apiClient;

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
    window.ApiResponse = ApiResponse;
    window.ERROR_CODES = ERROR_CODES;
    window.ParamConverter = ParamConverter;
    window.apiClient = apiClient;
}
