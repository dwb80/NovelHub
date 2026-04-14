/**
 * NovelHub 日志系统
 * 统一日志管理，支持不同日志级别和环境控制
 * @version 1.0.0
 */

// 日志级别定义
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// 当前日志级别（生产环境可设置为 WARN 或 ERROR）
const CURRENT_LOG_LEVEL = (() => {
    // 根据环境自动设置
    if (typeof window !== 'undefined') {
        // 本地开发环境显示所有日志
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return LOG_LEVELS.DEBUG;
        }
        // file:// 协议也显示日志（用于本地预览）
        if (window.location.protocol === 'file:') {
            return LOG_LEVELS.DEBUG;
        }
    }
    // 生产环境只显示警告和错误
    return LOG_LEVELS.WARN;
})();

// 日志样式配置
const LOG_STYLES = {
    DEBUG: 'color: #6b7280; font-weight: normal;',
    INFO: 'color: #3b82f6; font-weight: normal;',
    WARN: 'color: #f59e0b; font-weight: bold;',
    ERROR: 'color: #ef4444; font-weight: bold;'
};

// 前缀样式
const PREFIX_STYLE = 'color: #6366f1; font-weight: bold;';

/**
 * 日志记录器类
 */
class Logger {
    constructor(moduleName = 'NovelHub') {
        this.moduleName = moduleName;
        this.prefix = `[${moduleName}]`;
    }

    /**
     * 检查是否应该记录该级别的日志
     */
    shouldLog(level) {
        return level >= CURRENT_LOG_LEVEL;
    }

    /**
     * 格式化日志消息
     */
    formatMessage(message, data) {
        if (data === undefined) {
            return message;
        }
        return `${message}`, data;
    }

    /**
     * 调试日志
     */
    debug(message, ...data) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        
        if (data.length > 0) {
            console.log(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.DEBUG, ...data);
        } else {
            console.log(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.DEBUG);
        }
    }

    /**
     * 信息日志
     */
    info(message, ...data) {
        if (!this.shouldLog(LOG_LEVELS.INFO)) return;
        
        if (data.length > 0) {
            console.log(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.INFO, ...data);
        } else {
            console.log(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.INFO);
        }
    }

    /**
     * 警告日志
     */
    warn(message, ...data) {
        if (!this.shouldLog(LOG_LEVELS.WARN)) return;
        
        if (data.length > 0) {
            console.warn(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.WARN, ...data);
        } else {
            console.warn(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.WARN);
        }
    }

    /**
     * 错误日志
     */
    error(message, ...data) {
        if (!this.shouldLog(LOG_LEVELS.ERROR)) return;
        
        if (data.length > 0) {
            console.error(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.ERROR, ...data);
        } else {
            console.error(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.ERROR);
        }
    }

    /**
     * 成功日志（信息级别）
     */
    success(message, ...data) {
        if (!this.shouldLog(LOG_LEVELS.INFO)) return;
        
        const successStyle = 'color: #10b981; font-weight: normal;';
        if (data.length > 0) {
            console.log(`%c${this.prefix} %c${message}`, PREFIX_STYLE, successStyle, ...data);
        } else {
            console.log(`%c${this.prefix} %c${message}`, PREFIX_STYLE, successStyle);
        }
    }

    /**
     * 分组日志
     */
    group(label) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        console.group(`%c${this.prefix} %c${label}`, PREFIX_STYLE, LOG_STYLES.INFO);
    }

    /**
     * 结束分组
     */
    groupEnd() {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        console.groupEnd();
    }

    /**
     * 表格日志
     */
    table(data, columns) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        console.table(data, columns);
    }

    /**
     * 性能计时开始
     */
    time(label) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        console.time(`${this.prefix} ${label}`);
    }

    /**
     * 性能计时结束
     */
    timeEnd(label) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        console.timeEnd(`${this.prefix} ${label}`);
    }

    /**
     * 追踪日志
     */
    trace(message) {
        if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;
        console.trace(`%c${this.prefix} %c${message}`, PREFIX_STYLE, LOG_STYLES.DEBUG);
    }
}

// 创建默认日志实例
const logger = new Logger('NovelHub');

// 模块特定的日志记录器
const loggers = {
    performance: new Logger('Performance'),
    dataLoader: new Logger('DataLoader'),
    mockData: new Logger('MockData'),
    api: new Logger('API'),
    auth: new Logger('Auth'),
    ui: new Logger('UI'),
    reader: new Logger('Reader'),
    default: logger
};

/**
 * 获取模块日志记录器
 */
function getLogger(moduleName) {
    if (!loggers[moduleName]) {
        loggers[moduleName] = new Logger(moduleName);
    }
    return loggers[moduleName];
}

/**
 * 设置全局日志级别
 */
function setLogLevel(level) {
    if (typeof level === 'string') {
        const upperLevel = level.toUpperCase();
        if (LOG_LEVELS[upperLevel] !== undefined) {
            // 注意：这里只是演示，实际应该修改 CURRENT_LOG_LEVEL
            console.log(`%c[NovelHub] %c日志级别设置为: ${upperLevel}`, PREFIX_STYLE, LOG_STYLES.INFO);
        }
    }
}

// 导出
export {
    Logger,
    LOG_LEVELS,
    logger,
    getLogger,
    setLogLevel
};

// 浏览器环境全局暴露
if (typeof window !== 'undefined') {
    window.NovelHubLogger = {
        Logger,
        LOG_LEVELS,
        logger,
        getLogger,
        setLogLevel
    };
}
