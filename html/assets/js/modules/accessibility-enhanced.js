/**
 * Accessibility Enhanced Module
 * NovelHub - 可访问性增强模块
 * 
 * 功能:
 * - 完善的 ARIA 标签管理
 * - 键盘导航优化
 * - 高对比度模式支持
 * - 屏幕阅读器优化
 * - 焦点管理
 * 
 * @version 2.0.0
 */

// ========== ARIA 管理器 ==========

/**
 * ARIA 属性管理器
 */
export class ARIAManager {
    constructor() {
        this.liveRegions = new Map();
        this.announcer = null;
        this.init();
    }

    init() {
        this.createAnnouncer();
    }

    /**
     * 创建屏幕阅读器通知区域
     */
    createAnnouncer() {
        this.announcer = document.createElement('div');
        this.announcer.id = 'aria-live-announcer';
        this.announcer.className = 'sr-only';
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.announcer);
    }

    /**
     * 向屏幕阅读器宣布消息
     */
    announce(message, priority = 'polite') {
        if (!this.announcer) return;

        // 更新 aria-live 优先级
        this.announcer.setAttribute('aria-live', priority);
        
        // 清空后设置新内容，确保触发通知
        this.announcer.textContent = '';
        
        setTimeout(() => {
            this.announcer.textContent = message;
        }, 100);
    }

    /**
     * 设置元素的 ARIA 标签
     */
    setLabel(element, label) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('aria-label', label);
        }
    }

    /**
     * 设置元素的 ARIA 描述
     */
    setDescription(element, description) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            const descId = `aria-desc-${Date.now()}`;
            let descEl = document.getElementById(descId);
            
            if (!descEl) {
                descEl = document.createElement('div');
                descEl.id = descId;
                descEl.className = 'sr-only';
                document.body.appendChild(descEl);
            }
            
            descEl.textContent = description;
            element.setAttribute('aria-describedby', descId);
        }
    }

    /**
     * 设置展开/折叠状态
     */
    setExpanded(element, expanded) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
    }

    /**
     * 设置选中状态
     */
    setSelected(element, selected) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('aria-selected', selected ? 'true' : 'false');
        }
    }

    /**
     * 设置隐藏状态
     */
    setHidden(element, hidden) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            if (hidden) {
                element.setAttribute('aria-hidden', 'true');
            } else {
                element.removeAttribute('aria-hidden');
            }
        }
    }

    /**
     * 设置禁用状态
     */
    setDisabled(element, disabled) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('aria-disabled', disabled ? 'true' : 'false');
            if (disabled) {
                element.setAttribute('tabindex', '-1');
            } else {
                element.removeAttribute('tabindex');
            }
        }
    }

    /**
     * 设置忙状态
     */
    setBusy(element, busy) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('aria-busy', busy ? 'true' : 'false');
        }
    }

    /**
     * 创建 Live Region
     */
    createLiveRegion(id, priority = 'polite') {
        let region = document.getElementById(id);
        if (!region) {
            region = document.createElement('div');
            region.id = id;
            region.className = 'sr-only';
            region.setAttribute('aria-live', priority);
            region.setAttribute('aria-atomic', 'true');
            document.body.appendChild(region);
        }
        this.liveRegions.set(id, region);
        return region;
    }

    /**
     * 更新 Live Region
     */
    updateLiveRegion(id, message) {
        const region = this.liveRegions.get(id) || document.getElementById(id);
        if (region) {
            region.textContent = message;
        }
    }
}

// ========== 键盘导航管理器 ==========

/**
 * 增强的键盘导航管理器
 */
export class KeyboardNavigationManager {
    constructor() {
        this.focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled]):not([type="hidden"])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable]:not([contenteditable="false"])',
            'details',
            'summary'
        ].join(', ');
        
        this.shortcuts = new Map();
        this.trapContainers = new Set();
        this.init();
    }

    init() {
        this.setupKeyboardListeners();
        this.setupFocusIndicator();
        this.createSkipLinks();
    }

    /**
     * 设置键盘监听器
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * 处理键盘事件
     */
    handleKeyDown(e) {
        // 全局快捷键
        this.handleGlobalShortcuts(e);

        // Escape 键处理
        if (e.key === 'Escape') {
            this.handleEscape(e);
        }

        // Tab 键处理
        if (e.key === 'Tab') {
            this.handleTab(e);
        }

        // 方向键导航
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            this.handleArrowKeys(e);
        }
    }

    /**
     * 处理全局快捷键
     */
    handleGlobalShortcuts(e) {
        const key = this.getKeyCombo(e);
        const handler = this.shortcuts.get(key);
        if (handler) {
            e.preventDefault();
            handler(e);
        }
    }

    /**
     * 获取按键组合
     */
    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Meta');
        parts.push(e.key);
        return parts.join('+');
    }

    /**
     * 注册快捷键
     */
    registerShortcut(keys, handler) {
        this.shortcuts.set(keys, handler);
        return () => this.shortcuts.delete(keys);
    }

    /**
     * 处理 Escape 键
     */
    handleEscape(e) {
        // 关闭模态框
        const activeModal = document.querySelector('.modal-overlay.active, [role="dialog"][aria-modal="true"]');
        if (activeModal) {
            this.closeModal(activeModal);
            return;
        }

        // 关闭下拉菜单
        const openDropdowns = document.querySelectorAll('.dropdown.active, [aria-expanded="true"]');
        openDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
            dropdown.setAttribute('aria-expanded', 'false');
        });

        // 关闭面板
        const activePanels = document.querySelectorAll('.panel.active, .sidebar.active');
        activePanels.forEach(panel => {
            panel.classList.remove('active');
        });
    }

    /**
     * 处理 Tab 键
     */
    handleTab(e) {
        const trapContainer = this.getActiveTrapContainer();
        if (trapContainer) {
            this.trapFocus(e, trapContainer);
        }
    }

    /**
     * 处理方向键
     */
    handleArrowKeys(e) {
        const target = e.target;
        
        // 处理列表导航
        if (target.matches('[role="listbox"] *, [role="menu"] *, [role="tablist"] *')) {
            this.handleListNavigation(e);
        }

        // 处理滑块
        if (target.matches('[role="slider"]')) {
            this.handleSliderNavigation(e);
        }

        // 处理单选按钮组
        if (target.matches('[role="radio"]')) {
            this.handleRadioNavigation(e);
        }
    }

    /**
     * 处理列表导航
     */
    handleListNavigation(e) {
        const items = Array.from(e.target.parentElement.querySelectorAll(
            '[role="option"], [role="menuitem"], [role="tab"]'
        ));
        const currentIndex = items.indexOf(e.target);
        
        let nextIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % items.length;
        } else {
            nextIndex = (currentIndex - 1 + items.length) % items.length;
        }
        
        e.preventDefault();
        items[nextIndex].focus();
        items[nextIndex].setAttribute('aria-selected', 'true');
        items[currentIndex]?.setAttribute('aria-selected', 'false');
    }

    /**
     * 处理滑块导航
     */
    handleSliderNavigation(e) {
        const slider = e.target;
        const min = parseFloat(slider.getAttribute('aria-valuemin')) || 0;
        const max = parseFloat(slider.getAttribute('aria-valuemax')) || 100;
        const step = parseFloat(slider.getAttribute('aria-valuenow')) || 1;
        const currentValue = parseFloat(slider.getAttribute('aria-valuenow')) || min;
        
        let newValue;
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            newValue = Math.min(currentValue + step, max);
        } else {
            newValue = Math.max(currentValue - step, min);
        }
        
        e.preventDefault();
        slider.setAttribute('aria-valuenow', newValue);
        slider.dispatchEvent(new CustomEvent('slider-change', { detail: { value: newValue } }));
    }

    /**
     * 处理单选按钮组导航
     */
    handleRadioNavigation(e) {
        const group = e.target.getAttribute('name') || e.target.getAttribute('aria-label');
        const radios = Array.from(document.querySelectorAll(`[name="${group}"], [aria-label="${group}"]`));
        const currentIndex = radios.indexOf(e.target);
        
        let nextIndex;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % radios.length;
        } else {
            nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        }
        
        e.preventDefault();
        radios.forEach(radio => radio.setAttribute('aria-checked', 'false'));
        radios[nextIndex].setAttribute('aria-checked', 'true');
        radios[nextIndex].focus();
    }

    /**
     * 设置焦点指示器
     */
    setupFocusIndicator() {
        document.body.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        document.body.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
    }

    /**
     * 创建跳过链接
     */
    createSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = '跳到主要内容';
        skipLink.setAttribute('aria-label', '跳过导航到主要内容');
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content') || 
                               document.querySelector('main') ||
                               document.querySelector('[role="main"]');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * 陷阱焦点到容器内
     */
    trapFocus(e, container) {
        const focusableElements = Array.from(container.querySelectorAll(this.focusableSelectors));
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * 开始焦点陷阱
     */
    startFocusTrap(container) {
        this.trapContainers.add(container);
        
        // 聚焦第一个可聚焦元素
        const firstFocusable = container.querySelector(this.focusableSelectors);
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    /**
     * 结束焦点陷阱
     */
    endFocusTrap(container) {
        this.trapContainers.delete(container);
    }

    /**
     * 获取活动的焦点陷阱容器
     */
    getActiveTrapContainer() {
        return Array.from(this.trapContainers).pop();
    }

    /**
     * 关闭模态框
     */
    closeModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // 恢复焦点
        const triggerId = modal.getAttribute('data-trigger');
        if (triggerId) {
            const trigger = document.getElementById(triggerId);
            if (trigger) {
                trigger.focus();
            }
        }

        this.endFocusTrap(modal);
    }
}

// ========== 高对比度模式 ==========

/**
 * 高对比度模式管理器
 */
export class HighContrastManager {
    constructor() {
        this.isHighContrast = false;
        this.mediaQuery = window.matchMedia('(prefers-contrast: high)');
        this.init();
    }

    init() {
        // 监听系统高对比度设置
        this.mediaQuery.addEventListener('change', (e) => {
            this.handleSystemChange(e.matches);
        });

        // 检查初始状态
        if (this.mediaQuery.matches) {
            this.enableHighContrast();
        }

        // 检查用户手动设置
        const userPreference = localStorage.getItem('novelhub-high-contrast');
        if (userPreference === 'true') {
            this.enableHighContrast();
        } else if (userPreference === 'false') {
            this.disableHighContrast();
        }
    }

    /**
     * 处理系统设置变化
     */
    handleSystemChange(isHighContrast) {
        if (localStorage.getItem('novelhub-high-contrast') === null) {
            if (isHighContrast) {
                this.enableHighContrast();
            } else {
                this.disableHighContrast();
            }
        }
    }

    /**
     * 启用高对比度模式
     */
    enableHighContrast() {
        this.isHighContrast = true;
        document.body.classList.add('high-contrast');
        document.documentElement.style.setProperty('--high-contrast-active', 'true');
        
        // 更新 ARIA 属性
        const toggle = document.querySelector('[data-high-contrast-toggle]');
        if (toggle) {
            toggle.setAttribute('aria-pressed', 'true');
        }

        // 通知屏幕阅读器
        if (window.ariaManager) {
            window.ariaManager.announce('已启用高对比度模式');
        }
    }

    /**
     * 禁用高对比度模式
     */
    disableHighContrast() {
        this.isHighContrast = false;
        document.body.classList.remove('high-contrast');
        document.documentElement.style.removeProperty('--high-contrast-active');

        // 更新 ARIA 属性
        const toggle = document.querySelector('[data-high-contrast-toggle]');
        if (toggle) {
            toggle.setAttribute('aria-pressed', 'false');
        }

        // 通知屏幕阅读器
        if (window.ariaManager) {
            window.ariaManager.announce('已禁用高对比度模式');
        }
    }

    /**
     * 切换高对比度模式
     */
    toggle() {
        if (this.isHighContrast) {
            this.disableHighContrast();
            localStorage.setItem('novelhub-high-contrast', 'false');
        } else {
            this.enableHighContrast();
            localStorage.setItem('novelhub-high-contrast', 'true');
        }
    }
}

// ========== 减少动画偏好 ==========

/**
 * 减少动画偏好管理器
 */
export class ReducedMotionManager {
    constructor() {
        this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.init();
    }

    init() {
        this.handleChange(this.mediaQuery.matches);
        this.mediaQuery.addEventListener('change', (e) => {
            this.handleChange(e.matches);
        });
    }

    handleChange(shouldReduce) {
        if (shouldReduce) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    }

    /**
     * 检查是否应该减少动画
     */
    shouldReduceMotion() {
        return this.mediaQuery.matches;
    }
}

// ========== 导出单例 ==========

export const ariaManager = new ARIAManager();
export const keyboardNavigation = new KeyboardNavigationManager();
export const highContrastManager = new HighContrastManager();
export const reducedMotionManager = new ReducedMotionManager();

// ========== 便捷函数 ==========

/**
 * 宣布消息给屏幕阅读器
 */
export function announce(message, priority = 'polite') {
    ariaManager.announce(message, priority);
}

/**
 * 注册键盘快捷键
 */
export function registerShortcut(keys, handler) {
    return keyboardNavigation.registerShortcut(keys, handler);
}

/**
 * 开始焦点陷阱
 */
export function trapFocus(container) {
    keyboardNavigation.startFocusTrap(container);
}

/**
 * 结束焦点陷阱
 */
export function releaseFocus(container) {
    keyboardNavigation.endFocusTrap(container);
}

/**
 * 设置元素的 ARIA 标签
 */
export function setAriaLabel(element, label) {
    ariaManager.setLabel(element, label);
}

/**
 * 设置展开/折叠状态
 */
export function setAriaExpanded(element, expanded) {
    ariaManager.setExpanded(element, expanded);
}

/**
 * 切换高对比度模式
 */
export function toggleHighContrast() {
    highContrastManager.toggle();
}

// ========== 默认导出 ==========

export default {
    ARIAManager,
    KeyboardNavigationManager,
    HighContrastManager,
    ReducedMotionManager,
    ariaManager,
    keyboardNavigation,
    highContrastManager,
    reducedMotionManager,
    announce,
    registerShortcut,
    trapFocus,
    releaseFocus,
    setAriaLabel,
    setAriaExpanded,
    toggleHighContrast
};
