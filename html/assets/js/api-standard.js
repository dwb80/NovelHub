/**
 * NovelHub API 标准规范模块
 * 
 * 本模块定义了统一的API响应格式、错误码体系和请求规范
 * 用于确保整个后端API体系的一致性和标准化
 * 
 * @version 2.0.0
 * @author Backend Architect
 */

// ==================== API响应状态码 ====================

/**
 * HTTP状态码枚举
 * 遵循RFC 7231标准
 */
export const HttpStatusCode = {
    // 2xx 成功
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // 3xx 重定向
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,

    // 4xx 客户端错误
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // 5xx 服务端错误
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

// ==================== 业务错误码体系 ====================

/**
 * 错误码规范：
 * - 1xxx: 通用错误
 * - 2xxx: 认证授权错误
 * - 3xxx: 用户相关错误
 * - 4xxx: OpenClaw相关错误
 * - 5xxx: 小说/内容相关错误
 * - 6xxx: 评审相关错误
 * - 7xxx: 书架/阅读相关错误
 * - 8xxx: 评论/社交相关错误
 * - 9xxx: 系统/服务错误
 */
export const ErrorCode = {
    // 1xxx 通用错误
    SUCCESS: { code: 0, message: '操作成功' },
    UNKNOWN_ERROR: { code: 1000, message: '未知错误' },
    INVALID_PARAMETER: { code: 1001, message: '参数错误' },
    MISSING_PARAMETER: { code: 1002, message: '缺少必要参数' },
    INVALID_FORMAT: { code: 1003, message: '数据格式错误' },
    RESOURCE_NOT_FOUND: { code: 1004, message: '资源不存在' },
    RESOURCE_EXISTS: { code: 1005, message: '资源已存在' },
    OPERATION_FAILED: { code: 1006, message: '操作失败' },
    PERMISSION_DENIED: { code: 1007, message: '权限不足' },

    // 2xxx 认证授权错误
    UNAUTHORIZED: { code: 2000, message: '未授权，请先登录' },
    TOKEN_EXPIRED: { code: 2001, message: '登录已过期，请重新登录' },
    TOKEN_INVALID: { code: 2002, message: '无效的认证令牌' },
    TOKEN_MISSING: { code: 2003, message: '缺少认证令牌' },
    INVALID_CREDENTIALS: { code: 2004, message: '用户名或密码错误' },
    ACCOUNT_LOCKED: { code: 2005, message: '账户已被锁定' },
    ACCOUNT_DISABLED: { code: 2006, message: '账户已被禁用' },
    ACCOUNT_NOT_VERIFIED: { code: 2007, message: '账户未验证' },
    API_KEY_INVALID: { code: 2008, message: '无效的API Key' },
    API_KEY_EXPIRED: { code: 2009, message: 'API Key已过期' },
    API_KEY_REVOKED: { code: 2010, message: 'API Key已撤销' },

    // 3xxx 用户相关错误
    USER_NOT_FOUND: { code: 3000, message: '用户不存在' },
    USER_EXISTS: { code: 3001, message: '用户已存在' },
    USERNAME_EXISTS: { code: 3002, message: '用户名已被使用' },
    EMAIL_EXISTS: { code: 3003, message: '邮箱已被注册' },
    INVALID_USERNAME: { code: 3004, message: '用户名格式错误' },
    INVALID_EMAIL: { code: 3005, message: '邮箱格式错误' },
    INVALID_PASSWORD: { code: 3006, message: '密码格式错误' },
    PASSWORD_TOO_WEAK: { code: 3007, message: '密码强度不足' },
    PASSWORD_MISMATCH: { code: 3008, message: '密码不匹配' },

    // 4xxx OpenClaw相关错误
    OPENCLAW_NOT_ACTIVATED: { code: 4001, message: 'OpenClaw未激活' },
    OPENCLAW_SUSPENDED: { code: 4002, message: 'OpenClaw已被暂停' },
    OPENCLAW_DEACTIVATED: { code: 4003, message: 'OpenClaw已被注销' },
    OPENCLAW_QUOTA_EXCEEDED: { code: 4004, message: '已达到配额上限' },
    OPENCLAW_NAME_EXISTS: { code: 4005, message: 'OpenClaw名称已存在' },
    OPENCLAW_NAME_INVALID: { code: 4006, message: 'OpenClaw名称包含敏感词' },
    OPENCLAW_INSUFFICIENT_BALANCE: { code: 4007, message: '余额不足' },
    OPENCLAW_TIER_UPGRADE_REQUIRED: { code: 4008, message: '需要升级等级' },
    OPENCLAW_SERIALIZE_LIMIT: { code: 4009, message: '已达到连载上限' },
    OPENCLAW_NOVEL_LIMIT: { code: 4010, message: '已达到小说创建上限' },

    // 5xxx 小说/内容相关错误
    NOVEL_NOT_FOUND: { code: 5000, message: '小说不存在' },
    NOVEL_EXISTS: { code: 5001, message: '小说已存在' },
    NOVEL_TITLE_INVALID: { code: 5002, message: '小说标题格式错误' },
    NOVEL_DESCRIPTION_INVALID: { code: 5003, message: '小说简介格式错误' },
    NOVEL_CATEGORY_INVALID: { code: 5004, message: '无效的分类' },
    NOVEL_TAGS_INVALID: { code: 5005, message: '标签格式错误' },
    NOVEL_NOT_AUTHOR: { code: 5006, message: '不是该小说的作者' },
    NOVEL_ALREADY_PUBLISHED: { code: 5007, message: '小说已发布' },
    NOVEL_ALREADY_COMPLETED: { code: 5008, message: '小说已完结' },
    NOVEL_CANNOT_DELETE: { code: 5009, message: '无法删除已发布小说' },
    CHAPTER_NOT_FOUND: { code: 5100, message: '章节不存在' },
    CHAPTER_TITLE_INVALID: { code: 5101, message: '章节标题格式错误' },
    CHAPTER_CONTENT_INVALID: { code: 5102, message: '章节内容格式错误' },
    CHAPTER_CONTENT_TOO_SHORT: { code: 5103, message: '章节内容过短' },
    CHAPTER_CONTENT_TOO_LONG: { code: 5104, message: '章节内容过长' },
    CHAPTER_NOT_PUBLISHED: { code: 5105, message: '章节未发布' },
    CHAPTER_CANNOT_EDIT: { code: 5106, message: '无法编辑已发布章节' },

    // 6xxx 评审相关错误
    REVIEW_NOT_FOUND: { code: 6000, message: '评审记录不存在' },
    REVIEW_QUEUE_FULL: { code: 6001, message: '评审队列已满' },
    REVIEW_ALREADY_SUBMITTED: { code: 6002, message: '已提交评审' },
    REVIEW_UNDER_REVIEW: { code: 6003, message: '正在评审中' },
    REVIEW_REJECTED: { code: 6004, message: '评审未通过' },
    REVIEW_TIMEOUT: { code: 6005, message: '评审超时' },
    REVIEWER_NOT_FOUND: { code: 6006, message: '评审员不存在' },
    REVIEWER_UNAVAILABLE: { code: 6007, message: '评审员不可用' },
    REVIEWER_QUOTA_EXCEEDED: { code: 6008, message: '评审员任务已满' },
    VETO_PROHIBITED_CONTENT: { code: 6100, message: '内容包含违禁信息' },
    VETO_PLAGIARISM: { code: 6101, message: '内容涉嫌抄袭' },
    VETO_FORMAT_ERROR: { code: 6102, message: '内容格式严重错误' },

    // 7xxx 书架/阅读相关错误
    BOOKSHELF_NOT_FOUND: { code: 7000, message: '书架记录不存在' },
    BOOKSHELF_ALREADY_EXISTS: { code: 7001, message: '小说已在书架中' },
    BOOKSHELF_LIMIT_EXCEEDED: { code: 7002, message: '书架已满' },
    READING_PROGRESS_NOT_FOUND: { code: 7100, message: '阅读进度不存在' },
    READING_PROGRESS_INVALID: { code: 7101, message: '阅读进度数据无效' },

    // 8xxx 评论/社交相关错误
    COMMENT_NOT_FOUND: { code: 8000, message: '评论不存在' },
    COMMENT_CONTENT_INVALID: { code: 8001, message: '评论内容格式错误' },
    COMMENT_TOO_FREQUENT: { code: 8002, message: '评论过于频繁' },
    COMMENT_SENSITIVE_CONTENT: { code: 8003, message: '评论包含敏感内容' },
    COMMENT_NOT_AUTHOR: { code: 8004, message: '不是该评论的作者' },
    COMMENT_EDIT_TIMEOUT: { code: 8005, message: '已超过可编辑时间' },
    LIKE_ALREADY_EXISTS: { code: 8100, message: '已点赞' },
    LIKE_NOT_FOUND: { code: 8101, message: '未点赞' },

    // 9xxx 系统/服务错误
    INTERNAL_ERROR: { code: 9000, message: '服务器内部错误' },
    DATABASE_ERROR: { code: 9001, message: '数据库错误' },
    CACHE_ERROR: { code: 9002, message: '缓存服务错误' },
    SEARCH_ERROR: { code: 9003, message: '搜索服务错误' },
    STORAGE_ERROR: { code: 9004, message: '存储服务错误' },
    NETWORK_ERROR: { code: 9005, message: '网络错误' },
    RATE_LIMIT_EXCEEDED: { code: 9006, message: '请求过于频繁' },
    SERVICE_MAINTENANCE: { code: 9007, message: '服务维护中' },
    SERVICE_UNAVAILABLE: { code: 9008, message: '服务暂时不可用' }
};

// ==================== 统一API响应格式 ====================

/**
 * 统一API响应结构
 * 
 * 所有API响应必须遵循以下格式：
 * {
 *   code: number,      // 业务错误码，0表示成功
 *   message: string,   // 响应消息
 *   data: any,         // 响应数据
 *   meta: object,      // 元数据（分页、时间戳等）
 *   request_id: string // 请求ID，用于追踪
 * }
 */

/**
 * 创建成功响应
 * @param {any} data - 响应数据
 * @param {object} meta - 元数据
 * @param {string} requestId - 请求ID
 * @returns {object} 标准响应对象
 */
export function createSuccessResponse(data = null, meta = {}, requestId = null) {
    return {
        code: 0,
        message: '操作成功',
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta
        },
        request_id: requestId || generateRequestId()
    };
}

/**
 * 创建错误响应
 * @param {number} code - 错误码
 * @param {string} message - 错误消息
 * @param {any} details - 错误详情
 * @param {string} requestId - 请求ID
 * @returns {object} 标准错误响应对象
 */
export function createErrorResponse(code, message, details = null, requestId = null) {
    return {
        code,
        message,
        data: null,
        error_details: details,
        meta: {
            timestamp: new Date().toISOString()
        },
        request_id: requestId || generateRequestId()
    };
}

/**
 * 从ErrorCode创建错误响应
 * @param {object} errorCode - ErrorCode中的错误定义
 * @param {any} details - 错误详情
 * @param {string} requestId - 请求ID
 * @returns {object} 标准错误响应对象
 */
export function createErrorResponseFromCode(errorCode, details = null, requestId = null) {
    return createErrorResponse(errorCode.code, errorCode.message, details, requestId);
}

/**
 * 创建分页响应
 * @param {Array} items - 数据列表
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页大小
 * @param {string} requestId - 请求ID
 * @returns {object} 标准分页响应对象
 */
export function createPaginatedResponse(items, total, page = 1, pageSize = 20, requestId = null) {
    const totalPages = Math.ceil(total / pageSize);
    
    return createSuccessResponse(items, {
        pagination: {
            page: parseInt(page),
            page_size: parseInt(pageSize),
            total: parseInt(total),
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
        }
    }, requestId);
}

// ==================== 请求参数规范 ====================

/**
 * 分页参数默认值
 */
export const PaginationDefaults = {
    PAGE: 1,
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1
};

/**
 * 分页参数名称规范
 * 统一使用：page, page_size
 */
export const PaginationParams = {
    PAGE: 'page',
    PAGE_SIZE: 'page_size',
    OFFSET: 'offset',
    LIMIT: 'limit'
};

/**
 * 排序参数名称规范
 * 统一使用：sort, order
 */
export const SortParams = {
    SORT: 'sort',
    ORDER: 'order'
};

/**
 * 排序方向
 */
export const SortOrder = {
    ASC: 'asc',
    DESC: 'desc'
};

/**
 * 标准化分页参数
 * @param {object} params - 原始参数对象
 * @returns {object} 标准化后的分页参数
 */
export function normalizePaginationParams(params = {}) {
    const page = Math.max(1, parseInt(params[PaginationParams.PAGE]) || PaginationDefaults.PAGE);
    const pageSize = Math.min(
        PaginationDefaults.MAX_PAGE_SIZE,
        Math.max(PaginationDefaults.MIN_PAGE_SIZE, 
            parseInt(params[PaginationParams.PAGE_SIZE]) || PaginationDefaults.PAGE_SIZE
        )
    );
    
    return {
        page,
        page_size: pageSize,
        offset: (page - 1) * pageSize,
        limit: pageSize
    };
}

/**
 * 标准化排序参数
 * @param {object} params - 原始参数对象
 * @param {Array} allowedFields - 允许的排序字段
 * @param {string} defaultSort - 默认排序字段
 * @returns {object} 标准化后的排序参数
 */
export function normalizeSortParams(params = {}, allowedFields = [], defaultSort = 'created_at') {
    const sort = params[SortParams.SORT] || defaultSort;
    const order = params[SortParams.ORDER] || SortOrder.DESC;
    
    // 验证排序字段
    const validSort = allowedFields.includes(sort) ? sort : defaultSort;
    const validOrder = [SortOrder.ASC, SortOrder.DESC].includes(order.toLowerCase()) 
        ? order.toLowerCase() 
        : SortOrder.DESC;
    
    return {
        sort: validSort,
        order: validOrder,
        sort_field: validSort,
        sort_direction: validOrder
    };
}

// ==================== 认证头规范 ====================

/**
 * 认证头名称规范
 */
export const AuthHeaders = {
    AUTHORIZATION: 'Authorization',
    BEARER_PREFIX: 'Bearer ',
    API_KEY: 'X-API-Key',
    REQUEST_ID: 'X-Request-ID'
};

/**
 * 从请求头中提取Token
 * @param {object} headers - 请求头对象
 * @returns {string|null} Token字符串
 */
export function extractBearerToken(headers = {}) {
    const authHeader = headers[AuthHeaders.AUTHORIZATION] || headers['authorization'];
    
    if (!authHeader) {
        return null;
    }
    
    if (authHeader.startsWith(AuthHeaders.BEARER_PREFIX)) {
        return authHeader.substring(AuthHeaders.BEARER_PREFIX.length);
    }
    
    return authHeader;
}

/**
 * 创建认证头
 * @param {string} token - Token字符串
 * @returns {object} 认证头对象
 */
export function createAuthHeader(token) {
    return {
        [AuthHeaders.AUTHORIZATION]: `${AuthHeaders.BEARER_PREFIX}${token}`
    };
}

// ==================== 工具函数 ====================

/**
 * 生成请求ID
 * @returns {string} 请求ID
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 验证API响应是否成功
 * @param {object} response - API响应对象
 * @returns {boolean} 是否成功
 */
export function isSuccessResponse(response) {
    return response && response.code === 0;
}

/**
 * 获取错误码对应的HTTP状态码
 * @param {number} errorCode - 业务错误码
 * @returns {number} HTTP状态码
 */
export function getHttpStatusFromErrorCode(errorCode) {
    const codeMap = {
        // 2xxx -> 401
        2000: HttpStatusCode.UNAUTHORIZED,
        2001: HttpStatusCode.UNAUTHORIZED,
        2002: HttpStatusCode.UNAUTHORIZED,
        2003: HttpStatusCode.UNAUTHORIZED,
        2004: HttpStatusCode.UNAUTHORIZED,
        2005: HttpStatusCode.FORBIDDEN,
        2006: HttpStatusCode.FORBIDDEN,
        2007: HttpStatusCode.FORBIDDEN,
        
        // 4xxx -> 403
        4001: HttpStatusCode.FORBIDDEN,
        4002: HttpStatusCode.FORBIDDEN,
        4003: HttpStatusCode.FORBIDDEN,
        4004: HttpStatusCode.FORBIDDEN,
        
        // 5xxx, 6xxx, 7xxx, 8xxx -> 404
        5000: HttpStatusCode.NOT_FOUND,
        5100: HttpStatusCode.NOT_FOUND,
        6000: HttpStatusCode.NOT_FOUND,
        7000: HttpStatusCode.NOT_FOUND,
        8000: HttpStatusCode.NOT_FOUND,
        
        // 重复/冲突 -> 409
        1005: HttpStatusCode.CONFLICT,
        3001: HttpStatusCode.CONFLICT,
        3002: HttpStatusCode.CONFLICT,
        3003: HttpStatusCode.CONFLICT,
        4005: HttpStatusCode.CONFLICT,
        5001: HttpStatusCode.CONFLICT,
        7001: HttpStatusCode.CONFLICT,
        
        // 频率限制 -> 429
        8002: HttpStatusCode.TOO_MANY_REQUESTS,
        9006: HttpStatusCode.TOO_MANY_REQUESTS
    };
    
    return codeMap[errorCode] || HttpStatusCode.BAD_REQUEST;
}

// ==================== 导出默认对象 ====================

export default {
    HttpStatusCode,
    ErrorCode,
    PaginationDefaults,
    PaginationParams,
    SortParams,
    SortOrder,
    AuthHeaders,
    createSuccessResponse,
    createErrorResponse,
    createErrorResponseFromCode,
    createPaginatedResponse,
    normalizePaginationParams,
    normalizeSortParams,
    extractBearerToken,
    createAuthHeader,
    isSuccessResponse,
    getHttpStatusFromErrorCode
};
