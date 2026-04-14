/**
 * Security Module
 * NovelHub - 安全加固模块
 * 
 * 功能:
 * - XSS 防护 (输入过滤、输出编码)
 * - CSRF 防护 (Token 管理)
 * - 内容安全策略 (CSP)
 * - 输入验证与净化
 * - 敏感数据加密
 * 
 * @version 1.0.0
 */

// ========== XSS 防护 ==========

/**
 * HTML 实体编码
 */
export function escapeHtml(input) {
    if (typeof input !== 'string') return input;
    
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, char => htmlEscapes[char]);
}

/**
 * 解码 HTML 实体
 */
export function unescapeHtml(input) {
    if (typeof input !== 'string') return input;
    
    const htmlUnescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '='
    };

    return input.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g, entity => htmlUnescapes[entity] || entity);
}

/**
 * JavaScript 字符串编码
 */
export function escapeJavaScript(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/\//g, '\\/');
}

/**
 * URL 编码
 */
export function escapeUrl(input) {
    if (typeof input !== 'string') return input;
    return encodeURIComponent(input);
}

/**
 * CSS 字符串编码
 */
export function escapeCss(input) {
    if (typeof input !== 'string') return input;
    
    return input.replace(/[<>'"&]/g, char => {
        return '\\' + char.charCodeAt(0).toString(16) + ' ';
    });
}

/**
 * DOMPurify 风格的 HTML 净化
 */
export function sanitizeHtml(input, options = {}) {
    if (typeof input !== 'string') return '';

    const defaultOptions = {
        allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
        allowedAttributes: {
            'a': ['href', 'title', 'target'],
            '*': ['class']
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        stripComments: true,
        ...options
    };

    // 创建临时 DOM 元素
    const temp = document.createElement('div');
    temp.innerHTML = input;

    // 清理节点
    function cleanNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode(true);
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            // 检查允许的标签
            if (!defaultOptions.allowedTags.includes(tagName)) {
                // 将不允许的标签替换为其子内容
                const fragment = document.createDocumentFragment();
                while (node.firstChild) {
                    const cleaned = cleanNode(node.firstChild);
                    if (cleaned) {
                        fragment.appendChild(cleaned);
                    }
                }
                return fragment;
            }

            // 创建新元素
            const newElement = document.createElement(tagName);

            // 处理属性
            Array.from(node.attributes).forEach(attr => {
                const attrName = attr.name.toLowerCase();
                const allowedAttrs = defaultOptions.allowedAttributes[tagName] || 
                                    defaultOptions.allowedAttributes['*'] || [];

                if (allowedAttrs.includes(attrName)) {
                    // 特殊处理 href 属性
                    if (attrName === 'href') {
                        const url = attr.value.trim();
                        const isAllowed = defaultOptions.allowedSchemes.some(scheme => 
                            url.toLowerCase().startsWith(scheme + ':')
                        );
                        if (isAllowed || url.startsWith('/') || url.startsWith('#')) {
                            newElement.setAttribute(attrName, attr.value);
                        }
                    } else {
                        newElement.setAttribute(attrName, attr.value);
                    }
                }
            });

            // 递归处理子节点
            while (node.firstChild) {
                const cleaned = cleanNode(node.firstChild);
                if (cleaned) {
                    newElement.appendChild(cleaned);
                }
            }

            return newElement;
        }

        return null;
    }

    // 清理所有子节点
    const fragment = document.createDocumentFragment();
    while (temp.firstChild) {
        const cleaned = cleanNode(temp.firstChild);
        if (cleaned) {
            fragment.appendChild(cleaned);
        }
    }

    temp.innerHTML = '';
    temp.appendChild(fragment);

    return temp.innerHTML;
}

// ========== 输入验证 ==========

/**
 * 输入验证器
 */
export class InputValidator {
    constructor(options = {}) {
        this.options = {
            maxLength: 10000,
            maxLines: 1000,
            ...options
        };
    }

    /**
     * 验证并净化文本输入
     */
    validateText(input, options = {}) {
        const config = { ...this.options, ...options };
        
        if (typeof input !== 'string') {
            return { valid: false, error: '输入必须是字符串', value: '' };
        }

        // 检查长度
        if (input.length > config.maxLength) {
            return { 
                valid: false, 
                error: `输入长度不能超过 ${config.maxLength} 个字符`,
                value: input.slice(0, config.maxLength)
            };
        }

        // 检查行数
        const lines = input.split('\n');
        if (lines.length > config.maxLines) {
            return { 
                valid: false, 
                error: `输入行数不能超过 ${config.maxLines} 行`,
                value: lines.slice(0, config.maxLines).join('\n')
            };
        }

        // 检查危险字符
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(input)) {
                return { 
                    valid: false, 
                    error: '输入包含不安全的字符或代码',
                    value: this.sanitizeDangerousInput(input)
                };
            }
        }

        return { valid: true, error: null, value: input };
    }

    /**
     * 净化危险输入
     */
    sanitizeDangerousInput(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, 'data-disabled-event=')
            .replace(/<iframe/gi, '&lt;iframe')
            .replace(/<object/gi, '&lt;object')
            .replace(/<embed/gi, '&lt;embed');
    }

    /**
     * 验证用户名
     */
    validateUsername(username) {
        if (typeof username !== 'string') {
            return { valid: false, error: '用户名必须是字符串' };
        }

        const trimmed = username.trim();

        if (trimmed.length < 3) {
            return { valid: false, error: '用户名至少需要 3 个字符' };
        }

        if (trimmed.length > 20) {
            return { valid: false, error: '用户名不能超过 20 个字符' };
        }

        // 只允许字母、数字、下划线、中文
        const validPattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
        if (!validPattern.test(trimmed)) {
            return { valid: false, error: '用户名只能包含字母、数字、下划线和中文' };
        }

        // 检查保留用户名
        const reservedNames = ['admin', 'root', 'system', 'moderator', 'support'];
        if (reservedNames.includes(trimmed.toLowerCase())) {
            return { valid: false, error: '该用户名已被保留' };
        }

        return { valid: true, error: null, value: trimmed };
    }

    /**
     * 验证密码强度
     */
    validatePassword(password) {
        if (typeof password !== 'string') {
            return { valid: false, error: '密码必须是字符串' };
        }

        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            noSpaces: !/\s/.test(password),
            noCommon: !this.isCommonPassword(password)
        };

        const strength = Object.values(checks).filter(Boolean).length;

        if (strength < 4) {
            const errors = [];
            if (!checks.length) errors.push('至少 8 个字符');
            if (!checks.lowercase) errors.push('包含小写字母');
            if (!checks.uppercase) errors.push('包含大写字母');
            if (!checks.number) errors.push('包含数字');
            if (!checks.special) errors.push('包含特殊字符');
            if (!checks.noSpaces) errors.push('不能包含空格');
            if (!checks.noCommon) errors.push('不能使用常见密码');

            return { 
                valid: false, 
                error: `密码强度不足: ${errors.join(', ')}`,
                strength,
                checks
            };
        }

        return { valid: true, error: null, strength, checks };
    }

    /**
     * 检查是否是常见密码
     */
    isCommonPassword(password) {
        const commonPasswords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'monkey', 'letmein', 'dragon', '111111', 'baseball',
            'iloveyou', 'trustno1', 'sunshine', 'princess', 'admin'
        ];
        return commonPasswords.includes(password.toLowerCase());
    }

    /**
     * 验证邮箱
     */
    validateEmail(email) {
        if (typeof email !== 'string') {
            return { valid: false, error: '邮箱必须是字符串' };
        }

        const trimmed = email.trim().toLowerCase();

        // RFC 5322 简化版正则
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        if (!emailPattern.test(trimmed)) {
            return { valid: false, error: '邮箱格式不正确' };
        }

        if (trimmed.length > 254) {
            return { valid: false, error: '邮箱长度不能超过 254 个字符' };
        }

        return { valid: true, error: null, value: trimmed };
    }

    /**
     * 验证搜索关键词
     */
    validateSearchQuery(query) {
        if (typeof query !== 'string') {
            return { valid: false, error: '搜索关键词必须是字符串', value: '' };
        }

        const trimmed = query.trim();

        if (trimmed.length === 0) {
            return { valid: false, error: '搜索关键词不能为空', value: '' };
        }

        if (trimmed.length > 100) {
            return { 
                valid: false, 
                error: '搜索关键词不能超过 100 个字符',
                value: trimmed.slice(0, 100)
            };
        }

        // 检查特殊搜索操作符
        const dangerousOperators = /(\b(union|select|insert|update|delete|drop|create|alter)\b)|(--|;|--|#|\/\*|\*\/)/gi;
        if (dangerousOperators.test(trimmed)) {
            return { 
                valid: false, 
                error: '搜索关键词包含非法字符',
                value: trimmed.replace(dangerousOperators, '')
            };
        }

        return { valid: true, error: null, value: trimmed };
    }
}

// ========== CSRF 防护 ==========

/**
 * CSRF Token 管理器
 */
export class CSRFManager {
    constructor() {
        this.tokenKey = 'novelhub-csrf-token';
        this.headerName = 'X-CSRF-Token';
    }

    /**
     * 生成 CSRF Token
     */
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 获取或创建 Token
     */
    getToken() {
        let token = sessionStorage.getItem(this.tokenKey);
        if (!token) {
            token = this.generateToken();
            this.setToken(token);
        }
        return token;
    }

    /**
     * 设置 Token
     */
    setToken(token) {
        sessionStorage.setItem(this.tokenKey, token);
    }

    /**
     * 清除 Token
     */
    clearToken() {
        sessionStorage.removeItem(this.tokenKey);
    }

    /**
     * 验证 Token
     */
    validateToken(token) {
        const storedToken = this.getToken();
        return token === storedToken;
    }

    /**
     * 获取请求头
     */
    getHeader() {
        return { [this.headerName]: this.getToken() };
    }

    /**
     * 将 Token 添加到表单
     */
    addToForm(form) {
        let input = form.querySelector(`input[name="${this.headerName}"]`);
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = this.headerName;
            form.appendChild(input);
        }
        input.value = this.getToken();
    }
}

// ========== 内容安全策略 ==========

/**
 * CSP 管理器
 */
export class CSPManager {
    constructor() {
        this.nonce = this.generateNonce();
    }

    /**
     * 生成随机 nonce
     */
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    /**
     * 获取 CSP 指令
     */
    getDirectives() {
        return {
            'default-src': ["'self'"],
            'script-src': ["'self'", `'nonce-${this.nonce}'`, "'strict-dynamic'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
            'font-src': ["'self'", 'https:', 'data:'],
            'connect-src': ["'self'", 'https:'],
            'media-src': ["'self'", 'https:'],
            'object-src': ["'none'"],
            'frame-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'upgrade-insecure-requests': []
        };
    }

    /**
     * 生成 CSP 字符串
     */
    generateCSPString() {
        const directives = this.getDirectives();
        return Object.entries(directives)
            .map(([key, values]) => {
                if (values.length === 0) return key;
                return `${key} ${values.join(' ')}`;
            })
            .join('; ');
    }

    /**
     * 应用 CSP
     */
    applyCSP() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = this.generateCSPString();
        document.head.appendChild(meta);
    }

    /**
     * 获取 nonce
     */
    getNonce() {
        return this.nonce;
    }
}

// ========== 安全存储 ==========

/**
 * 安全的本地存储
 */
export class SecureStorage {
    constructor(prefix = 'novelhub_') {
        this.prefix = prefix;
    }

    /**
     * 设置值 (自动序列化)
     */
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('安全存储设置错误:', e.message);
            }
            return false;
        }
    }

    /**
     * 获取值 (自动反序列化)
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('安全存储获取错误:', e.message);
            }
            return defaultValue;
        }
    }

    /**
     * 删除值
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('安全存储删除错误:', e.message);
            }
            return false;
        }
    }

    /**
     * 清空所有值
     */
    clear() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('安全存储清空错误:', e.message);
            }
            return false;
        }
    }
}

// ========== 安全工具函数 ==========

/**
 * 生成安全随机字符串
 */
export function generateSecureRandom(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36).padStart(2, '0')).join('').slice(0, length);
}

/**
 * 简单的哈希函数 (用于敏感数据脱敏)
 */
export async function hashString(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 脱敏处理
 */
export function maskSensitiveData(data, type) {
    if (typeof data !== 'string') return data;

    switch (type) {
        case 'email':
            const [local, domain] = data.split('@');
            if (!domain) return data;
            const maskedLocal = local.slice(0, 2) + '***';
            return `${maskedLocal}@${domain}`;

        case 'phone':
            return data.slice(0, 3) + '****' + data.slice(-4);

        case 'idCard':
            return data.slice(0, 4) + '**********' + data.slice(-4);

        case 'bankCard':
            return '**** **** **** ' + data.slice(-4);

        default:
            return data.slice(0, 2) + '***' + data.slice(-2);
    }
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse(input, defaultValue = null) {
    try {
        return JSON.parse(input);
    } catch (e) {
        return defaultValue;
    }
}

/**
 * 检查是否是安全的 URL
 */
export function isSafeUrl(url) {
    if (typeof url !== 'string') return false;

    try {
        const parsed = new URL(url, window.location.origin);
        
        // 禁止 javascript: 协议
        if (parsed.protocol === 'javascript:') {
            return false;
        }

        // 禁止 data: 协议的 HTML
        if (parsed.protocol === 'data:' && parsed.pathname.includes('text/html')) {
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}

// ========== 导出单例 ==========

export const inputValidator = new InputValidator();
export const csrfManager = new CSRFManager();
export const cspManager = new CSPManager();
export const secureStorage = new SecureStorage();

// ========== 默认导出 ==========

export default {
    // XSS 防护
    escapeHtml,
    unescapeHtml,
    escapeJavaScript,
    escapeUrl,
    escapeCss,
    sanitizeHtml,
    
    // 输入验证
    InputValidator,
    inputValidator,
    
    // CSRF 防护
    CSRFManager,
    csrfManager,
    
    // CSP
    CSPManager,
    cspManager,
    
    // 安全存储
    SecureStorage,
    secureStorage,
    
    // 工具函数
    generateSecureRandom,
    hashString,
    maskSensitiveData,
    safeJsonParse,
    isSafeUrl
};
