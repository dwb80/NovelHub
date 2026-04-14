/**
 * NovelHub 常量定义
 * 用于统一整个应用的配置和localStorage键名
 */

// LocalStorage 键名常量
const STORAGE_KEYS = {
    // 主题相关
    THEME: 'novelhub-theme',

    // 用户相关
    CURRENT_USER: 'currentUser',
    REMEMBERED_EMAIL: 'rememberedEmail',

    // 阅读器相关
    READER_SETTINGS: 'novelhub_reader_settings',
    READING_PROGRESS: 'novelhub_reading_progress',

    // 书架相关
    BOOKSHELF: 'novelhub_bookshelf',

    // 搜索历史
    SEARCH_HISTORY: 'novelhub_search_history',

    // 用户偏好
    USER_PREFERENCES: 'novelhub_user_preferences'
};

// 主题配置
const THEMES = {
    LIGHT: 'theme-light',
    PAPER: 'theme-paper',
    DARK: 'theme-dark',
    EYE_CARE: 'theme-eye-care'
};

const THEME_LIST = [THEMES.LIGHT, THEMES.PAPER, THEMES.DARK, THEMES.EYE_CARE];

// 阅读器默认设置
const READER_DEFAULTS = {
    fontSize: 18,
    lineHeight: 1.8,
    fontFamily: 'serif',
    theme: 'light',
    maxWidth: '800px'
};

// 字体大小级别 (7级)
const FONT_SIZE_LEVELS = [12, 14, 16, 18, 20, 22, 24];

// 行高选项
const LINE_HEIGHT_OPTIONS = [1.5, 1.8, 2.2];

// 数值常量 - 避免魔法数字
const NUMERIC_CONSTANTS = {
    // 时间相关（毫秒）
    MILLISECONDS_PER_SECOND: 1000,
    MILLISECONDS_PER_MINUTE: 60000,
    MILLISECONDS_PER_HOUR: 3600000,
    MILLISECONDS_PER_DAY: 86400000,

    // 分页相关
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // 字数格式化阈值
    WORD_COUNT_THRESHOLD: 10000,

    // 评分相关
    MIN_RATING: 0,
    MAX_RATING: 5,
    DEFAULT_RATING: 4.5,

    // 动画持续时间（毫秒）
    ANIMATION_DURATION_FAST: 150,
    ANIMATION_DURATION_BASE: 200,
    ANIMATION_DURATION_SLOW: 300,
    ANIMATION_DURATION_SLOWER: 500,

    // 轮播相关
    CAROUSEL_AUTOPLAY_INTERVAL: 5000,
    CAROUSEL_TRANSITION_DURATION: 500,

    // 防抖/节流延迟
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,

    // 数据加载相关
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 10000,
    CACHE_DURATION: 300000, // 5分钟

    // 阅读进度相关
    MAX_READING_HISTORY: 100,
    READING_PROGRESS_SAVE_INTERVAL: 5000,

    // 评论相关
    MAX_COMMENT_LENGTH: 500,
    COMMENTS_PER_PAGE: 10,

    // Toast通知相关
    TOAST_DURATION: 3000,
    TOAST_ANIMATION_DURATION: 300,

    // 模态框相关
    MODAL_ANIMATION_DURATION: 300,
    MODAL_Z_INDEX: 1000,

    // 存储限制
    MAX_BOOKMARKS: 500,
    MAX_SEARCH_HISTORY: 20,

    // 延迟时间
    DELAY_SHORT: 100,
    DELAY_MEDIUM: 500,
    DELAY_LONG: 1000,
    DELAY_REDIRECT: 1500
};

// 字符串常量
const STRING_CONSTANTS = {
    // 通用消息
    LOADING_TEXT: '加载中...',
    ERROR_TEXT: '出错了，请稍后重试',
    EMPTY_TEXT: '暂无数据',
    
    // 时间格式化
    TIME_FORMAT_SHORT: 'HH:mm',
    TIME_FORMAT_LONG: 'yyyy-MM-dd HH:mm',
    DATE_FORMAT: 'yyyy-MM-dd',
    
    // 字数单位
    WORD_UNIT: '字',
    WORD_UNIT_TEN_THOUSAND: '万字',
    
    // 数字格式化
    NUMBER_UNIT_TEN_THOUSAND: '万'
};

// 导出常量（兼容不同模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STORAGE_KEYS,
        THEMES,
        THEME_LIST,
        READER_DEFAULTS,
        FONT_SIZE_LEVELS,
        LINE_HEIGHT_OPTIONS,
        NUMERIC_CONSTANTS,
        STRING_CONSTANTS
    };
}

// 浏览器环境全局暴露
if (typeof window !== 'undefined') {
    window.NovelHubConstants = {
        STORAGE_KEYS,
        THEMES,
        THEME_LIST,
        READER_DEFAULTS,
        FONT_SIZE_LEVELS,
        LINE_HEIGHT_OPTIONS,
        NUMERIC_CONSTANTS,
        STRING_CONSTANTS
    };
}
