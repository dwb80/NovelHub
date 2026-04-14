/**
 * Loading Component
 * NovelHub - 统一加载动画组件
 * UX-P1-003 Fix: 统一加载动画
 * @version 2.0.0
 */

/**
 * 加载动画类型枚举
 */
const LOADING_TYPES = {
    SPINNER: 'spinner',
    DOTS: 'dots',
    PULSE: 'pulse',
    SKELETON: 'skeleton',
    BAR: 'bar'
};

/**
 * 加载动画尺寸枚举
 */
const LOADING_SIZES = {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    XL: 'xl'
};

/**
 * 统一加载组件类
 */
class LoadingComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            type: LOADING_TYPES.SPINNER,
            size: LOADING_SIZES.MEDIUM,
            text: '',
            fullscreen: false,
            overlay: false,
            overlayBlur: false,
            color: 'primary', // primary, white, dark
            lines: 3, // for skeleton
            ...options
        };
        
        this.element = null;
        this.isVisible = false;
    }

    /**
     * 渲染加载组件
     */
    render() {
        if (!this.container) return null;
        
        // 如果已存在，先销毁
        if (this.element) {
            this.destroy();
        }
        
        this.element = document.createElement('div');
        this.element.className = this.getContainerClass();
        this.element.setAttribute('role', 'status');
        this.element.setAttribute('aria-live', 'polite');
        this.element.setAttribute('aria-label', this.options.text || '加载中');
        
        // 根据类型渲染不同内容
        let content = '';
        switch (this.options.type) {
            case LOADING_TYPES.SPINNER:
                content = this.getSpinnerHTML();
                break;
            case LOADING_TYPES.DOTS:
                content = this.getDotsHTML();
                break;
            case LOADING_TYPES.PULSE:
                content = this.getPulseHTML();
                break;
            case LOADING_TYPES.SKELETON:
                content = this.getSkeletonHTML();
                break;
            case LOADING_TYPES.BAR:
                content = this.getBarHTML();
                break;
            default:
                content = this.getSpinnerHTML();
        }
        
        this.element.innerHTML = content;
        
        // 添加到容器
        if (this.options.fullscreen || this.options.overlay) {
            document.body.appendChild(this.element);
        } else {
            this.container.innerHTML = '';
            this.container.appendChild(this.element);
        }
        
        this.isVisible = true;
        return this.element;
    }

    /**
     * 获取容器类名
     */
    getContainerClass() {
        const classes = ['nhub-loading'];
        classes.push(`nhub-loading--${this.options.type}`);
        classes.push(`nhub-loading--${this.options.size}`);
        classes.push(`nhub-loading--${this.options.color}`);
        
        if (this.options.fullscreen) {
            classes.push('nhub-loading--fullscreen');
        }
        
        if (this.options.overlay) {
            classes.push('nhub-loading--overlay');
        }
        
        if (this.options.overlayBlur) {
            classes.push('nhub-loading--blur');
        }
        
        return classes.join(' ');
    }

    /**
     * 获取Spinner HTML
     */
    getSpinnerHTML() {
        const text = this.options.text ? `<span class="nhub-loading__text">${this.options.text}</span>` : '';
        return `
            <div class="nhub-loading__spinner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
                </svg>
            </div>
            ${text}
        `;
    }

    /**
     * 获取Dots HTML
     */
    getDotsHTML() {
        const text = this.options.text ? `<span class="nhub-loading__text">${this.options.text}</span>` : '';
        return `
            <div class="nhub-loading__dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            ${text}
        `;
    }

    /**
     * 获取Pulse HTML
     */
    getPulseHTML() {
        const text = this.options.text ? `<span class="nhub-loading__text">${this.options.text}</span>` : '';
        return `
            <div class="nhub-loading__pulse"></div>
            ${text}
        `;
    }

    /**
     * 获取Skeleton HTML
     */
    getSkeletonHTML() {
        const lines = this.options.lines || 3;
        let html = '<div class="nhub-loading__skeleton">';
        
        for (let i = 0; i < lines; i++) {
            const width = i === lines - 1 ? '70%' : '100%';
            html += `<div class="nhub-skeleton-line" style="width: ${width}"></div>`;
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 获取Progress Bar HTML
     */
    getBarHTML() {
        return `
            <div class="nhub-loading__bar">
                <div class="nhub-loading__bar-progress"></div>
            </div>
            ${this.options.text ? `<span class="nhub-loading__text">${this.options.text}</span>` : ''}
        `;
    }

    /**
     * 显示加载
     */
    show() {
        if (!this.element) {
            this.render();
        } else {
            this.element.style.display = '';
            this.element.classList.remove('nhub-loading--hidden');
        }
        this.isVisible = true;
        return this;
    }

    /**
     * 隐藏加载
     */
    hide() {
        if (this.element) {
            this.element.classList.add('nhub-loading--hidden');
            setTimeout(() => {
                if (this.element) {
                    this.element.style.display = 'none';
                }
            }, 200);
        }
        this.isVisible = false;
        return this;
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
        return this;
    }

    /**
     * 更新文本
     */
    setText(text) {
        this.options.text = text;
        if (this.element) {
            const textEl = this.element.querySelector('.nhub-loading__text');
            if (textEl) {
                textEl.textContent = text;
            }
            this.element.setAttribute('aria-label', text || '加载中');
        }
        return this;
    }

    /**
     * 更新进度（用于进度条）
     */
    setProgress(percent) {
        if (this.options.type === LOADING_TYPES.BAR) {
            const progressEl = this.element?.querySelector('.nhub-loading__bar-progress');
            if (progressEl) {
                progressEl.style.width = `${percent}%`;
            }
        }
        return this;
    }
}

// ========== 便捷函数 ==========

/**
 * 显示全局加载
 * @param {Object} options - 配置选项
 * @returns {LoadingComponent} 加载组件实例
 */
export function showGlobalLoading(options = {}) {
    // 移除已存在的全局加载
    const existing = document.querySelector('.nhub-loading--fullscreen');
    if (existing) {
        existing.remove();
    }
    
    const loading = new LoadingComponent(document.body, {
        fullscreen: true,
        ...options
    });
    loading.render();
    return loading;
}

/**
 * 隐藏全局加载
 */
export function hideGlobalLoading() {
    const existing = document.querySelector('.nhub-loading--fullscreen');
    if (existing) {
        existing.classList.add('nhub-loading--hidden');
        setTimeout(() => {
            existing.remove();
        }, 200);
    }
}

/**
 * 显示容器加载
 * @param {HTMLElement|string} container - 容器
 * @param {Object} options - 配置选项
 * @returns {LoadingComponent} 加载组件实例
 */
export function showContainerLoading(container, options = {}) {
    const loading = new LoadingComponent(container, options);
    loading.render();
    return loading;
}

/**
 * 显示骨架屏
 * @param {HTMLElement|string} container - 容器
 * @param {number} lines - 行数
 * @returns {LoadingComponent} 加载组件实例
 */
export function showSkeleton(container, lines = 3) {
    const loading = new LoadingComponent(container, {
        type: LOADING_TYPES.SKELETON,
        lines,
        ...options
    });
    loading.render();
    return loading;
}

/**
 * 显示按钮加载状态
 * @param {HTMLElement} button - 按钮元素
 * @param {string} loadingText - 加载文本
 */
export function setButtonLoading(button, loadingText = '') {
    if (!button) return;
    
    button.classList.add('nhub-btn--loading');
    button.disabled = true;
    
    if (loadingText) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
    }
}

/**
 * 移除按钮加载状态
 * @param {HTMLElement} button - 按钮元素
 */
export function removeButtonLoading(button) {
    if (!button) return;
    
    button.classList.remove('nhub-btn--loading');
    button.disabled = false;
    
    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

// ========== 添加样式 ==========

const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    /* ========== Loading Component Styles - UX-P1-003 Fix ========== */
    
    /* 基础容器 */
    .nhub-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
    }
    
    .nhub-loading--hidden {
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    
    /* 全屏加载 */
    .nhub-loading--fullscreen {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.95);
        z-index: 9999;
        backdrop-filter: blur(4px);
    }
    
    .theme-dark .nhub-loading--fullscreen,
    [data-theme="dark"] .nhub-loading--fullscreen {
        background: rgba(15, 23, 42, 0.95);
    }
    
    /* 遮罩层加载 */
    .nhub-loading--overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.9);
        z-index: 100;
    }
    
    .nhub-loading--blur {
        backdrop-filter: blur(4px);
    }
    
    /* 尺寸变体 */
    .nhub-loading--sm .nhub-loading__spinner,
    .nhub-loading--sm .nhub-loading__spinner svg {
        width: 16px;
        height: 16px;
    }
    
    .nhub-loading--md .nhub-loading__spinner,
    .nhub-loading--md .nhub-loading__spinner svg {
        width: 24px;
        height: 24px;
    }
    
    .nhub-loading--lg .nhub-loading__spinner,
    .nhub-loading--lg .nhub-loading__spinner svg {
        width: 40px;
        height: 40px;
    }
    
    .nhub-loading--xl .nhub-loading__spinner,
    .nhub-loading--xl .nhub-loading__spinner svg {
        width: 64px;
        height: 64px;
    }
    
    /* 颜色变体 */
    .nhub-loading--primary {
        color: var(--color-primary, #6366f1);
    }
    
    .nhub-loading--white {
        color: #ffffff;
    }
    
    .nhub-loading--dark {
        color: var(--color-text-primary, #1e293b);
    }
    
    /* Spinner 动画 */
    .nhub-loading__spinner {
        animation: nhub-loading-spin 1s linear infinite;
    }
    
    @keyframes nhub-loading-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Dots 动画 */
    .nhub-loading__dots {
        display: flex;
        gap: 0.5rem;
    }
    
    .nhub-loading__dots span {
        width: 8px;
        height: 8px;
        background: currentColor;
        border-radius: 50%;
        animation: nhub-loading-dots 1.4s infinite ease-in-out both;
    }
    
    .nhub-loading__dots span:nth-child(1) { animation-delay: -0.32s; }
    .nhub-loading__dots span:nth-child(2) { animation-delay: -0.16s; }
    
    .nhub-loading--sm .nhub-loading__dots span {
        width: 6px;
        height: 6px;
    }
    
    .nhub-loading--lg .nhub-loading__dots span {
        width: 12px;
        height: 12px;
    }
    
    @keyframes nhub-loading-dots {
        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
    }
    
    /* Pulse 动画 */
    .nhub-loading__pulse {
        width: 40px;
        height: 40px;
        background: currentColor;
        border-radius: 50%;
        animation: nhub-loading-pulse 1.5s ease-in-out infinite;
    }
    
    .nhub-loading--sm .nhub-loading__pulse {
        width: 24px;
        height: 24px;
    }
    
    .nhub-loading--lg .nhub-loading__pulse {
        width: 64px;
        height: 64px;
    }
    
    @keyframes nhub-loading-pulse {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
    }
    
    /* Skeleton 动画 */
    .nhub-loading__skeleton {
        width: 100%;
    }
    
    .nhub-skeleton-line {
        height: 12px;
        background: linear-gradient(
            90deg,
            var(--color-bg-tertiary, #f1f5f9) 25%,
            var(--color-bg-secondary, #f8fafc) 50%,
            var(--color-bg-tertiary, #f1f5f9) 75%
        );
        background-size: 200% 100%;
        animation: nhub-loading-skeleton 1.5s ease-in-out infinite;
        border-radius: 4px;
        margin-bottom: 8px;
    }
    
    .nhub-skeleton-line:last-child {
        margin-bottom: 0;
    }
    
    @keyframes nhub-loading-skeleton {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    /* Progress Bar */
    .nhub-loading__bar {
        width: 200px;
        height: 4px;
        background: var(--color-bg-tertiary, #f1f5f9);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .nhub-loading__bar-progress {
        height: 100%;
        background: currentColor;
        border-radius: 2px;
        transition: width 0.3s ease;
        animation: nhub-loading-bar 2s ease-in-out infinite;
    }
    
    @keyframes nhub-loading-bar {
        0% { width: 0%; margin-left: 0%; }
        50% { width: 50%; margin-left: 25%; }
        100% { width: 0%; margin-left: 100%; }
    }
    
    /* 加载文本 */
    .nhub-loading__text {
        font-size: 0.875rem;
        color: var(--color-text-secondary, #64748b);
        text-align: center;
    }
    
    .nhub-loading--lg .nhub-loading__text {
        font-size: 1rem;
    }
    
    /* 按钮加载状态 */
    .nhub-btn--loading {
        position: relative;
        color: transparent !important;
        pointer-events: none;
    }
    
    .nhub-btn--loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1rem;
        height: 1rem;
        margin: -0.5rem 0 0 -0.5rem;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: nhub-loading-spin 0.8s linear infinite;
        color: inherit;
    }
    
    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
        .nhub-loading__spinner,
        .nhub-loading__dots span,
        .nhub-loading__pulse,
        .nhub-skeleton-line,
        .nhub-loading__bar-progress,
        .nhub-btn--loading::after {
            animation: none;
        }
        
        .nhub-skeleton-line {
            background: var(--color-bg-tertiary, #f1f5f9);
        }
        
        .nhub-loading__pulse {
            opacity: 0.5;
        }
    }
`;

document.head.appendChild(loadingStyles);

// ========== 导出 ==========

export {
    LoadingComponent,
    LOADING_TYPES,
    LOADING_SIZES
};

export default {
    LoadingComponent,
    LOADING_TYPES,
    LOADING_SIZES,
    showGlobalLoading,
    hideGlobalLoading,
    showContainerLoading,
    showSkeleton,
    setButtonLoading,
    removeButtonLoading
};
