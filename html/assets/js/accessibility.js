/**
 * ============================================
 * 无障碍访问工具库 (Accessibility Utilities)
 * ============================================
 */

// 键盘导航管理
class KeyboardNavigation {
    constructor() {
        this.focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'textarea:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            'details',
            'summary'
        ].join(', ');
        
        this.init();
    }
    
    init() {
        // 检测键盘使用
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav-active');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav-active');
        });
        
        // Esc 键关闭对话框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });
        
        // 跳过导航链接
        this.createSkipLinks();
    }
    
    handleEscapeKey(e) {
        const activeModal = document.querySelector('.modal-overlay.active');
        const activePanel = document.querySelector('.annotation-panel.active');
        const activeExport = document.querySelector('.export-panel.active');
        
        if (activeModal) {
            this.closeModal(activeModal);
        } else if (activePanel) {
            this.closePanel(activePanel);
        } else if (activeExport) {
            this.closePanel(activeExport);
        }
    }
    
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // 恢复焦点
        const triggerId = modal.getAttribute('data-trigger');
        if (triggerId) {
            const trigger = document.getElementById(triggerId);
            if (trigger) {
                trigger.focus();
            }
        }
    }
    
    closePanel(panel) {
        const overlay = panel.previousElementSibling;
        if (overlay && overlay.classList.contains('overlay')) {
            overlay.classList.remove('active');
        }
        panel.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    createSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = '跳到主要内容';
        skipLink.setAttribute('aria-label', '跳过导航到主要内容');
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(this.focusableSelectors);
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        container.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
        
        // 自动聚焦第一个元素
        firstFocusable.focus();
    }
    
    // 管理焦点
    manageFocus(newElement) {
        if (newElement) {
            const focusable = newElement.querySelector(this.focusableSelectors);
            if (focusable) {
                focusable.focus();
            }
        }
    }
    
    // 宣布更新给屏幕阅读器
    announce(message, priority = 'polite') {
        let announcer = document.getElementById('aria-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'aria-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = message;
    }
}

/**
 * ============================================
 * 文字选中工具栏 (Text Selection Toolbar)
 * ============================================
 */

class TextSelectionToolbar {
    constructor() {
        this.toolbar = null;
        this.selectedText = '';
        this.selectionRange = null;
        this.highlights = [];
        this.annotations = [];
        
        this.init();
    }
    
    init() {
        this.createToolbar();
        this.bindEvents();
        this.loadHighlights();
    }
    
    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'text-selection-toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', '文字选择工具栏');
        
        toolbar.innerHTML = `
            <button class="toolbar-btn highlight-btn" aria-label="高亮文字" title="高亮">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
            </button>
            <div class="highlight-color-picker">
                <button class="highlight-color-btn active" aria-label="选择高亮颜色">
                    <span class="highlight-color-dot" style="background-color: #fef3c7;"></span>
                </button>
                <div class="highlight-color-dropdown">
                    <button class="color-option" data-color="#fef3c7" style="background-color: #fef3c7;"></button>
                    <button class="color-option" data-color="#d1fae5" style="background-color: #d1fae5;"></button>
                    <button class="color-option" data-color="#dbeafe" style="background-color: #dbeafe;"></button>
                    <button class="color-option" data-color="#fee2e2" style="background-color: #fee2e2;"></button>
                </div>
            </div>
            <div class="toolbar-divider"></div>
            <button class="toolbar-btn note-btn" aria-label="添加笔记" title="笔记">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="toolbar-btn copy-btn" aria-label="复制文字" title="复制">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        `;
        
        document.body.appendChild(toolbar);
        this.toolbar = toolbar;
        
        // 绑定颜色选择器事件
        const colorPicker = toolbar.querySelector('.highlight-color-picker');
        const colorBtn = colorPicker.querySelector('.highlight-color-btn');
        
        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorPicker.classList.toggle('active');
        });
        
        const colorOptions = colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = option.getAttribute('data-color');
                this.applyHighlight(color);
                colorPicker.classList.remove('active');
                
                // 更新按钮颜色
                const dot = colorBtn.querySelector('.highlight-color-dot');
                dot.style.backgroundColor = color;
            });
        });
        
        // 点击其他地方关闭颜色选择器
        document.addEventListener('click', () => {
            colorPicker.classList.remove('active');
        });
    }
    
    bindEvents() {
        // 监听文字选择
        document.addEventListener('mouseup', (e) => this.handleSelection(e));
        
        // 工具栏按钮事件
        this.toolbar.querySelector('.highlight-btn').addEventListener('click', () => {
            this.applyHighlight();
        });
        
        this.toolbar.querySelector('.note-btn').addEventListener('click', () => {
            this.showAnnotationPanel();
        });
        
        this.toolbar.querySelector('.copy-btn').addEventListener('click', () => {
            this.copySelection();
        });
    }
    
    handleSelection(e) {
        const selection = window.getSelection();
        this.selectedText = selection.toString().trim();
        this.selectionRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        if (this.selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // 显示工具栏
            this.showToolbar(rect);
        } else {
            this.hideToolbar();
        }
    }
    
    showToolbar(rect) {
        if (!this.toolbar) return;
        
        const toolbarWidth = 280;
        let left = rect.left + (rect.width / 2);
        let top = rect.top - 50;
        
        // 检查是否超出屏幕
        if (left < toolbarWidth / 2) {
            left = toolbarWidth / 2 + 10;
        }
        if (left > window.innerWidth - toolbarWidth / 2) {
            left = window.innerWidth - toolbarWidth / 2 - 10;
        }
        if (top < 60) {
            top = rect.bottom + 10;
        }
        
        this.toolbar.style.left = `${left}px`;
        this.toolbar.style.top = `${top}px`;
        this.toolbar.classList.add('active');
    }
    
    hideToolbar() {
        if (this.toolbar) {
            this.toolbar.classList.remove('active');
        }
    }
    
    applyHighlight(color = '#fef3c7') {
        if (!this.selectionRange) return;
        
        const range = this.selectionRange;
        const selectedText = range.toString();
        
        // 创建高亮标记
        const mark = document.createElement('mark');
        mark.className = 'highlight-mark';
        mark.style.setProperty('--highlight-color', color);
        mark.setAttribute('data-note', '');
        mark.setAttribute('data-color', color);
        mark.setAttribute('data-date', new Date().toISOString());
        
        try {
            range.surroundContents(mark);
            
            // 保存高亮信息
            this.highlights.push({
                id: Date.now(),
                text: selectedText,
                color: color,
                date: new Date().toISOString(),
                note: ''
            });
            
            this.saveHighlights();
            this.hideToolbar();
            
            // 宣布给屏幕阅读器
            if (window.keyboardNav) {
                window.keyboardNav.announce('已添加高亮');
            }
        } catch (e) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('高亮失败:', e.message);
            }
        }
    }
    
    showAnnotationPanel() {
        // 创建或显示笔记面板
        let panel = document.querySelector('.annotation-panel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'annotation-panel';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-label', '笔记面板');
            
            panel.innerHTML = `
                <div class="annotation-panel-overlay" onclick="this.nextElementSibling.classList.remove('active')"></div>
                <div class="annotation-panel">
                    <div class="annotation-panel-header">
                        <h3 class="annotation-panel-title">添加笔记</h3>
                        <button class="annotation-panel-close" aria-label="关闭">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="annotation-panel-body">
                        <div class="annotation-form">
                            <textarea class="annotation-textarea" placeholder="写下你的笔记..."></textarea>
                        </div>
                        <div class="annotation-list" style="margin-top: 1.5rem;"></div>
                    </div>
                    <div class="annotation-panel-footer">
                        <button class="btn-secondary" onclick="exportAnnotations()">导出笔记</button>
                        <button class="btn-primary" onclick="saveAnnotation()">保存</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(panel);
        }
        
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 聚焦到文本框
        const textarea = panel.querySelector('.annotation-textarea');
        textarea.value = this.selectedText;
        textarea.focus();
        
        // 陷阱焦点
        if (window.keyboardNav) {
            window.keyboardNav.trapFocus(panel);
        }
    }
    
    copySelection() {
        if (this.selectedText) {
            navigator.clipboard.writeText(this.selectedText).then(() => {
                this.hideToolbar();
                
                if (window.showToast) {
                    showToast('已复制到剪贴板', 'success');
                }
            });
        }
    }
    
    saveHighlights() {
        localStorage.setItem('reading-highlights', JSON.stringify(this.highlights));
    }
    
    loadHighlights() {
        const saved = localStorage.getItem('reading-highlights');
        if (saved) {
            this.highlights = JSON.parse(saved);
        }
    }
}

/**
 * ============================================
 * 主题切换管理 (Theme Manager)
 * ============================================
 */

class ThemeManager {
    constructor() {
        // 修复：统一使用 'novelhub-theme' 作为 localStorage key
        const savedTheme = localStorage.getItem('novelhub-theme') || localStorage.getItem('theme');
        this.currentTheme = savedTheme || 'theme-light';
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme, false);
        this.bindEvents();
        this.preloadResources();
    }
    
    applyTheme(theme, animate = true) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // 添加过渡类
        if (animate) {
            document.body.classList.add('theme-transition-active');
            document.body.classList.add('theme-fade-in');
        }
        
        // 移除所有主题类
        document.body.classList.remove('theme-light', 'theme-paper', 'theme-dark', 'theme-eye-care');
        
        // 应用新主题
        document.body.classList.add(theme);
        
        // 修复：统一使用 'novelhub-theme' 作为 localStorage key
        localStorage.setItem('novelhub-theme', theme);
        // 清理旧键名
        localStorage.removeItem('theme');
        this.currentTheme = theme;
        
        // 移除过渡类
        setTimeout(() => {
            document.body.classList.remove('theme-transition-active');
            document.body.classList.remove('theme-fade-in');
            this.isTransitioning = false;
        }, 300);
        
        // 宣布给屏幕阅读器
        if (window.keyboardNav) {
            const themeNames = {
                'theme-light': '浅色',
                'theme-paper': '纸质',
                'theme-dark': '深色',
                'theme-eye-care': '护眼'
            };
            keyboardNav.announce(`已切换到${themeNames[theme] || theme}模式`);
        }
    }
    
    bindEvents() {
        // 监听主题切换按钮
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const themes = ['theme-light', 'theme-paper', 'theme-dark', 'theme-eye-care'];
                const currentIndex = themes.indexOf(this.currentTheme);
                const nextIndex = (currentIndex + 1) % themes.length;
                this.applyTheme(themes[nextIndex]);
            });
        }
    }
    
    preloadResources() {
        // 预加载其他主题的字体和资源
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'style';
        preloadLink.href = '../../assets/css/themes.css';
        document.head.appendChild(preloadLink);
    }
}

/**
 * ============================================
 * 字体大小管理 (Font Size Manager)
 * ============================================
 */

class FontSizeManager {
    constructor() {
        this.currentSize = localStorage.getItem('reading-font-size') || 'base';
        this.presets = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
        
        this.init();
    }
    
    init() {
        this.applySize(this.currentSize);
    }
    
    applySize(size) {
        if (!this.presets.includes(size)) return;
        
        document.body.classList.remove(
            ...this.presets.map(s => `font-level-${s}`)
        );
        
        document.body.classList.add(`font-level-${size}`);
        this.currentSize = size;
        
        localStorage.setItem('reading-font-size', size);
        
        // 宣布给屏幕阅读器
        if (window.keyboardNav) {
            keyboardNav.announce(`字体大小已调整为${this.getSizeLabel(size)}`);
        }
    }
    
    getSizeLabel(size) {
        const labels = {
            'xs': '超小',
            'sm': '小',
            'base': '中',
            'lg': '大',
            'xl': '超大',
            '2xl': '特大',
            '3xl': '巨大'
        };
        return labels[size] || size;
    }
    
    increase() {
        const currentIndex = this.presets.indexOf(this.currentSize);
        if (currentIndex < this.presets.length - 1) {
            this.applySize(this.presets[currentIndex + 1]);
        }
    }
    
    decrease() {
        const currentIndex = this.presets.indexOf(this.currentSize);
        if (currentIndex > 0) {
            this.applySize(this.presets[currentIndex - 1]);
        }
    }
}

/**
 * ============================================
 * 全局工具函数
 * ============================================
 */

// 导出笔记函数
function exportAnnotations() {
    const textSelection = window.textSelection;
    if (!textSelection || textSelection.highlights.length === 0) {
        showToast('没有可导出的笔记', 'warning');
        return;
    }
    
    const exportData = {
        exportedAt: new Date().toISOString(),
        highlights: textSelection.highlights
    };
    
    // 创建 JSON 下载
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('笔记导出成功', 'success');
}

// 保存笔记函数
function saveAnnotation() {
    const panel = document.querySelector('.annotation-panel');
    const textarea = panel.querySelector('.annotation-textarea');
    const textSelection = window.textSelection;
    
    if (textSelection && textSelection.selectionRange) {
        const note = textarea.value.trim();
        
        if (note) {
            // 更新最后一个高亮的笔记
            const lastHighlight = textSelection.highlights[textSelection.highlights.length - 1];
            if (lastHighlight) {
                lastHighlight.note = note;
                textSelection.saveHighlights();
            }
            
            showToast('笔记已保存', 'success');
            panel.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            showToast('请输入笔记内容', 'warning');
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化工具
    window.keyboardNav = new KeyboardNavigation();
    window.textSelection = new TextSelectionToolbar();
    window.themeManager = new ThemeManager();
    window.fontSizeManager = new FontSizeManager();
});
