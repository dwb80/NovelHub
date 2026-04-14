/**
 * Theme Management Module
 * NovelHub - Supports 4 themes: light, paper, dark, eye-care
 */

// 导入 constants.js 中的存储键名
import { STORAGE_KEYS, THEMES, THEME_CLASSES, THEME_LIST } from '../constants.js';

// 使用 constants.js 中的统一键名
const THEME_KEY = STORAGE_KEYS.THEME;
const THEME_TRANSITION_KEY = STORAGE_KEYS.THEME_TRANSITION;

// Theme definitions
export const THEMES = {
    light: {
        id: 'light',
        name: '浅色模式',
        icon: 'sun',
        description: '默认白色背景，适合日间阅读'
    },
    paper: {
        id: 'paper',
        name: '纸张模式',
        icon: 'file-text',
        description: '模拟实体书纸张质感'
    },
    dark: {
        id: 'dark',
        name: '深色模式',
        icon: 'moon',
        description: '深色背景，适合夜间阅读'
    },
    'eye-care': {
        id: 'eye-care',
        name: '护眼模式',
        icon: 'eye',
        description: '降低蓝光，保护视力'
    }
};

const THEME_IDS = Object.keys(THEMES);

/**
 * Initialize theme on page load
 */
export function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const theme = THEME_IDS.includes(savedTheme) ? savedTheme : 'light';
    applyTheme(theme, false);
}

/**
 * Get current theme ID
 * @returns {string} Current theme ID
 */
export function getCurrentTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

/**
 * Get current theme object
 * @returns {Object} Theme configuration object
 */
export function getCurrentThemeConfig() {
    return THEMES[getCurrentTheme()];
}

/**
 * Set active theme
 * @param {string} theme - Theme ID
 * @param {boolean} animate - Whether to animate transition
 */
export function setTheme(theme, animate = true) {
    if (!THEME_IDS.includes(theme)) {
        // 使用日志系统记录警告
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.warn(`无效的主题: ${theme}`);
        }
        return;
    }
    
    if (animate) {
        enableTransition();
    }
    
    applyTheme(theme, animate);
    
    if (animate) {
        setTimeout(disableTransition, 300);
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme, config: THEMES[theme] } 
    }));
}

/**
 * Apply theme to document
 */
function applyTheme(theme, animate) {
    // Remove all theme classes
    THEME_IDS.forEach(id => {
        document.body.classList.remove(`theme-${id}`);
    });
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme);
    
    // Save to localStorage
    localStorage.setItem(THEME_KEY, theme);
}

/**
 * Update meta theme-color
 */
function updateMetaThemeColor(theme) {
    const themeColors = {
        light: '#ffffff',
        paper: '#faf8f5',
        dark: '#0f172a',
        'eye-care': '#f5f0e6'
    };
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = themeColors[theme];
}

/**
 * Enable smooth theme transition
 */
function enableTransition() {
    document.body.classList.add('theme-transition');
}

/**
 * Disable theme transition
 */
function disableTransition() {
    document.body.classList.remove('theme-transition');
}

/**
 * Get theme name by ID
 * @param {string} theme - Theme ID
 * @returns {string} Theme display name
 */
export function getThemeName(theme) {
    return THEMES[theme]?.name || THEMES.light.name;
}

/**
 * Get theme icon name
 * @param {string} theme - Theme ID
 * @returns {string} Icon name
 */
export function getThemeIcon(theme) {
    return THEMES[theme]?.icon || THEMES.light.icon;
}

/**
 * Get all available themes
 * @returns {string[]} Array of theme IDs
 */
export function getAllThemes() {
    return [...THEME_IDS];
}

/**
 * Get all theme configurations
 * @returns {Object} All theme configs
 */
export function getAllThemeConfigs() {
    return { ...THEMES };
}

/**
 * Toggle between light and dark theme
 */
export function toggleDarkMode() {
    const current = getCurrentTheme();
    const isDark = current === 'dark';
    setTheme(isDark ? 'light' : 'dark');
    return !isDark;
}

/**
 * Check if system prefers dark mode
 * @returns {boolean}
 */
export function systemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Initialize with system preference
 */
export function initWithSystemPreference() {
    if (!localStorage.getItem(THEME_KEY)) {
        const prefersDark = systemPrefersDark();
        applyTheme(prefersDark ? 'dark' : 'light', false);
    }
}

/**
 * Listen for system theme changes
 */
export function listenSystemThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light', true);
        }
    });
}

/**
 * Reset to default theme
 */
export function resetTheme() {
    localStorage.removeItem(THEME_KEY);
    applyTheme('light', true);
}

/**
 * Check if theme is valid
 * @param {string} theme - Theme ID to check
 * @returns {boolean}
 */
export function isValidTheme(theme) {
    return THEME_IDS.includes(theme);
}

/**
 * Get next theme in cycle
 * @returns {string} Next theme ID
 */
export function getNextTheme() {
    const current = getCurrentTheme();
    const currentIndex = THEME_IDS.indexOf(current);
    return THEME_IDS[(currentIndex + 1) % THEME_IDS.length];
}

/**
 * Cycle to next theme
 */
export function cycleTheme() {
    const next = getNextTheme();
    setTheme(next);
    return next;
}

/**
 * Get all available themes with extended info
 * @returns {Array} Array of theme objects
 */
export function getAvailableThemes() {
    return [
        { id: 'light', name: '浅色', icon: '☀️', class: 'theme-light' },
        { id: 'paper', name: '纸质', icon: '📄', class: 'theme-paper' },
        { id: 'dark', name: '深色', icon: '🌙', class: 'theme-dark' },
        { id: 'eye-care', name: '护眼', icon: '🌿', class: 'theme-eye-care' },
        { id: 'sepia', name: '复古', icon: '📜', class: 'theme-sepia' },
        { id: 'midnight', name: '午夜', icon: '🌌', class: 'theme-midnight' },
        { id: 'high-contrast', name: '高对比', icon: '◐', class: 'theme-high-contrast' }
    ];
}

/**
 * Get theme by ID
 * @param {string} themeId - Theme ID
 * @returns {Object|null} Theme object or null
 */
export function getThemeById(themeId) {
    const themes = getAvailableThemes();
    return themes.find(theme => theme.id === themeId) || null;
}

/**
 * Get current theme object
 * @returns {Object|null} Current theme object
 */
export function getCurrentThemeObject() {
    const currentTheme = getCurrentTheme();
    return getThemeById(currentTheme);
}

/**
 * Check if theme is dark
 * @param {string} themeId - Theme ID to check
 * @returns {boolean} True if theme is dark
 */
export function isDarkTheme(themeId) {
    const darkThemes = ['dark', 'midnight'];
    return darkThemes.includes(themeId);
}

/**
 * Check if current theme is dark
 * @returns {boolean} True if current theme is dark
 */
export function isCurrentThemeDark() {
    return isDarkTheme(getCurrentTheme());
}

/**
 * Get next theme in rotation
 * @param {string} currentThemeId - Current theme ID
 * @returns {string} Next theme ID
 */
export function getNextThemeId(currentThemeId) {
    const themes = getAvailableThemes();
    const currentIndex = themes.findIndex(theme => theme.id === currentThemeId);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex].id;
}

/**
 * Get reader settings
 * @returns {Object} Reader settings object
 */
export function getReaderSettings() {
    const defaultSettings = {
        theme: 'light',
        fontSize: 'base',
        lineHeight: 'normal',
        fontFamily: 'sans',
        readingWidth: 'normal'
    };
    
    try {
        const stored = localStorage.getItem('novelhub_reader_settings');
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (e) {
        // 使用日志系统记录警告
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.warn('阅读器设置加载失败:', e.message);
        }
    }
    
    return defaultSettings;
}

/**
 * Save reader settings
 * @param {Object} settings - Settings to save
 */
export function saveReaderSettings(settings) {
    try {
        const currentSettings = getReaderSettings();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem('novelhub_reader_settings', JSON.stringify(newSettings));
    } catch (e) {
        // 使用日志系统记录警告
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.warn('阅读器设置保存失败:', e.message);
        }
    }
}

/**
 * Apply reader settings to container
 * @param {HTMLElement} container - Reader container
 * @param {Object} settings - Settings to apply
 */
export function applyReaderSettings(container, settings) {
    if (!container) return;
    
    // Apply theme
    if (settings.theme) {
        const theme = getThemeById(settings.theme);
        if (theme) {
            container.classList.remove(...getAvailableThemes().map(t => t.class));
            container.classList.add(theme.class);
        }
    }
    
    // Apply font size
    if (settings.fontSize) {
        container.classList.remove('font-xs', 'font-sm', 'font-base', 'font-lg', 'font-xl', 'font-2xl', 'font-3xl');
        container.classList.add(`font-${settings.fontSize}`);
    }
    
    // Apply line height
    if (settings.lineHeight) {
        container.classList.remove('leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose');
        container.classList.add(`leading-${settings.lineHeight}`);
    }
    
    // Apply font family
    if (settings.fontFamily) {
        container.classList.remove('font-sans-reader', 'font-serif-reader', 'font-mono-reader');
        container.classList.add(`font-${settings.fontFamily}-reader`);
    }
    
    // Apply reading width
    if (settings.readingWidth) {
        container.classList.remove('reading-narrow', 'reading-normal', 'reading-wide', 'reading-full');
        container.classList.add(`reading-${settings.readingWidth}`);
    }
}

/**
 * Initialize reader with saved settings
 * @param {HTMLElement} container - Reader container
 * @param {Object} options - Initialization options
 */
export function initReader(container, options = {}) {
    if (!container) return;
    
    const settings = getReaderSettings();
    applyReaderSettings(container, settings);
    
    // Apply options overrides
    if (options.theme) {
        setTheme(options.theme);
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            const currentSettings = getReaderSettings();
            if (currentSettings.theme === 'system') {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
            }
        });
    }
}

/**
 * Get available font sizes
 * @returns {Array} Array of font size options
 */
export function getFontSizes() {
    return [
        { id: 'xs', name: '超小', value: '14px' },
        { id: 'sm', name: '小', value: '16px' },
        { id: 'base', name: '标准', value: '18px' },
        { id: 'lg', name: '大', value: '20px' },
        { id: 'xl', name: '超大', value: '22px' },
        { id: '2xl', name: '特大', value: '24px' },
        { id: '3xl', name: '巨大', value: '28px' }
    ];
}

/**
 * Get available line heights
 * @returns {Array} Array of line height options
 */
export function getLineHeights() {
    return [
        { id: 'tight', name: '紧凑', value: '1.5' },
        { id: 'normal', name: '标准', value: '1.8' },
        { id: 'relaxed', name: '宽松', value: '2.0' },
        { id: 'loose', name: '极松', value: '2.2' }
    ];
}

/**
 * Get available font families
 * @returns {Array} Array of font family options
 */
export function getFontFamilies() {
    return [
        { id: 'sans', name: '无衬线', css: 'var(--font-sans)' },
        { id: 'serif', name: '有衬线', css: 'var(--font-serif)' },
        { id: 'mono', name: '等宽', css: 'var(--font-mono)' }
    ];
}

/**
 * Get available reading widths
 * @returns {Array} Array of reading width options
 */
export function getReadingWidths() {
    return [
        { id: 'narrow', name: '窄', value: '32rem' },
        { id: 'normal', name: '标准', value: '48rem' },
        { id: 'wide', name: '宽', value: '64rem' },
        { id: 'full', name: '全屏', value: '100%' }
    ];
}

/**
 * Increase font size
 * @param {HTMLElement} container - Reader container
 */
export function increaseFontSize(container) {
    if (!container) return;
    
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
    const currentSize = container.className.match(/font-(xs|sm|base|lg|xl|2xl|3xl)/);
    const currentIndex = currentSize ? sizes.indexOf(currentSize[1]) : 2;
    const newSize = sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    
    container.classList.remove(`font-${sizes[currentIndex]}`);
    container.classList.add(`font-${newSize}`);
    
    saveReaderSettings({ fontSize: newSize });
}

/**
 * Decrease font size
 * @param {HTMLElement} container - Reader container
 */
export function decreaseFontSize(container) {
    if (!container) return;
    
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
    const currentSize = container.className.match(/font-(xs|sm|base|lg|xl|2xl|3xl)/);
    const currentIndex = currentSize ? sizes.indexOf(currentSize[1]) : 2;
    const newSize = sizes[Math.max(currentIndex - 1, 0)];
    
    container.classList.remove(`font-${sizes[currentIndex]}`);
    container.classList.add(`font-${newSize}`);
    
    saveReaderSettings({ fontSize: newSize });
}

/**
 * Reset reader settings to default
 * @param {HTMLElement} container - Reader container
 */
export function resetReaderSettings(container) {
    const defaultSettings = {
        theme: 'light',
        fontSize: 'base',
        lineHeight: 'normal',
        fontFamily: 'sans',
        readingWidth: 'normal'
    };
    
    localStorage.removeItem('novelhub_reader_settings');
    
    if (container) {
        applyReaderSettings(container, defaultSettings);
    }
}

/**
 * Get theme recommendation based on time of day
 * @returns {string} Recommended theme ID
 */
export function getThemeRecommendation() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 18) {
        return 'light'; // Daytime
    } else if (hour >= 18 && hour < 22) {
        return 'eye-care'; // Evening
    } else {
        return 'dark'; // Night
    }
}

/**
 * Auto-set theme based on time of day
 */
export function setThemeByTimeOfDay() {
    const recommended = getThemeRecommendation();
    const current = getCurrentTheme();
    
    if (current !== recommended) {
        setTheme(recommended);
    }
}

/**
 * Export reader settings for backup
 * @returns {string} JSON string of settings
 */
export function exportReaderSettings() {
    const settings = getReaderSettings();
    return JSON.stringify(settings, null, 2);
}

/**
 * Import reader settings from JSON
 * @param {string} jsonString - JSON string of settings
 * @param {HTMLElement} container - Reader container to apply settings
 * @returns {boolean} Success status
 */
export function importReaderSettings(jsonString, container) {
    try {
        const settings = JSON.parse(jsonString);
        saveReaderSettings(settings);
        
        if (container) {
            applyReaderSettings(container, settings);
        }
        
        return true;
    } catch (e) {
        // 使用日志系统记录错误
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.error('阅读器设置导入失败:', e.message);
        }
        return false;
    }
}
