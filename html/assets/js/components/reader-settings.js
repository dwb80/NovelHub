/**
 * Reader Settings Component
 * NovelHub - Enhanced Reader Settings with Real-time Preview
 */

// 默认阅读器配置
const DEFAULT_READER_CONFIG = {
    fontSize: 18,
    lineHeight: 1.8,
    fontFamily: 'Noto Serif SC',
    theme: 'light',
    paragraphSpacing: 1.5,
    textIndent: 2,
    pageWidth: 800,
    autoScroll: false,
    scrollSpeed: 1
};

// 可用字体列表
const AVAILABLE_FONTS = [
    { value: 'Noto Serif SC', label: '思源宋体', category: 'serif' },
    { value: 'Noto Sans SC', label: '思源黑体', category: 'sans-serif' },
    { value: 'SimSun', label: '宋体', category: 'serif' },
    { value: 'Microsoft YaHei', label: '微软雅黑', category: 'sans-serif' },
    { value: 'PingFang SC', label: '苹方', category: 'sans-serif' },
    { value: 'Source Han Serif SC', label: 'Source Han Serif', category: 'serif' }
];

// 可用主题列表
const AVAILABLE_THEMES = [
    { value: 'light', label: '浅色', color: '#ffffff', textColor: '#1e293b' },
    { value: 'paper', label: '纸张', color: '#faf8f5', textColor: '#3d3a33' },
    { value: 'dark', label: '深色', color: '#0f172a', textColor: '#f1f5f9' },
    { value: 'eye-care', label: '护眼', color: '#f5f0e6', textColor: '#2d2a22' },
    { value: 'sepia', label: '羊皮纸', color: '#f4ecd8', textColor: '#5b4636' }
];

// 行高选项
const LINE_HEIGHT_OPTIONS = [
    { value: 1.4, label: '紧凑' },
    { value: 1.6, label: '适中' },
    { value: 1.8, label: '宽松' },
    { value: 2.0, label: '舒适' },
    { value: 2.2, label: '极宽' }
];

// 段落间距选项
const PARAGRAPH_SPACING_OPTIONS = [
    { value: 1.0, label: '紧凑' },
    { value: 1.25, label: '适中' },
    { value: 1.5, label: '宽松' },
    { value: 2.0, label: '舒适' }
];

// 页面宽度选项
const PAGE_WIDTH_OPTIONS = [
    { value: 600, label: '窄' },
    { value: 700, label: '适中' },
    { value: 800, label: '宽' },
    { value: 900, label: '超宽' },
    { value: '100%', label: '全宽' }
];

class ReaderSettings {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.targetContent = options.targetContent || document.querySelector('.reader-content');
        this.onChange = options.onChange || (() => {});
        
        this.config = this.loadConfig();
        this.isOpen = false;
        this.previewTimeout = null;
        
        this.init();
    }

    init() {
        this.createPanel();
        this.bindEvents();
        this.applySettings();
    }

    // 创建设置面板
    createPanel() {
        const panel = document.createElement('div');
        panel.className = 'reader-settings-panel';
        panel.id = 'readerSettingsPanel';
        panel.innerHTML = this.getPanelHTML();
        
        this.container.appendChild(panel);
        this.panel = panel;
        
        // 创建预览区域
        this.createPreviewArea();
    }

    // 获取面板HTML
    getPanelHTML() {
        return `
            <div class="settings-panel-header">
                <h3 class="settings-panel-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    阅读设置
                </h3>
                <button class="settings-panel-close" id="closeSettingsBtn" aria-label="关闭设置">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="settings-panel-body">
                <!-- 主题设置 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">主题颜色</h4>
                    <div class="theme-options">
                        ${AVAILABLE_THEMES.map(theme => `
                            <button class="theme-option ${this.config.theme === theme.value ? 'active' : ''}" 
                                    data-theme="${theme.value}"
                                    style="background-color: ${theme.color}; color: ${theme.textColor};"
                                    title="${theme.label}">
                                <span class="theme-option-label">${theme.label}</span>
                                ${this.config.theme === theme.value ? '<span class="theme-option-check">✓</span>' : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- 字体设置 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">字体</h4>
                    <div class="settings-control">
                        <select class="settings-select" id="fontFamilySelect">
                            ${AVAILABLE_FONTS.map(font => `
                                <option value="${font.value}" ${this.config.fontFamily === font.value ? 'selected' : ''}>
                                    ${font.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <!-- 字体大小 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">
                        字体大小
                        <span class="settings-value" id="fontSizeValue">${this.config.fontSize}px</span>
                    </h4>
                    <div class="settings-control">
                        <button class="settings-btn-decrease" id="decreaseFontSize" aria-label="减小字体">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <div class="settings-slider-wrapper">
                            <input type="range" class="settings-slider" id="fontSizeSlider"
                                   min="12" max="32" step="1" value="${this.config.fontSize}">
                            <div class="settings-slider-track">
                                <div class="settings-slider-fill" id="fontSizeFill"></div>
                            </div>
                        </div>
                        <button class="settings-btn-increase" id="increaseFontSize" aria-label="增大字体">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- 行高设置 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">
                        行高
                        <span class="settings-value" id="lineHeightValue">${this.getLineHeightLabel(this.config.lineHeight)}</span>
                    </h4>
                    <div class="settings-control">
                        <div class="settings-segmented" id="lineHeightOptions">
                            ${LINE_HEIGHT_OPTIONS.map(option => `
                                <button class="settings-segment ${this.config.lineHeight === option.value ? 'active' : ''}"
                                        data-value="${option.value}">
                                    ${option.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 段落间距 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">
                        段落间距
                        <span class="settings-value" id="paragraphSpacingValue">${this.getParagraphSpacingLabel(this.config.paragraphSpacing)}</span>
                    </h4>
                    <div class="settings-control">
                        <div class="settings-segmented" id="paragraphSpacingOptions">
                            ${PARAGRAPH_SPACING_OPTIONS.map(option => `
                                <button class="settings-segment ${this.config.paragraphSpacing === option.value ? 'active' : ''}"
                                        data-value="${option.value}">
                                    ${option.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 页面宽度 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">
                        页面宽度
                        <span class="settings-value" id="pageWidthValue">${this.getPageWidthLabel(this.config.pageWidth)}</span>
                    </h4>
                    <div class="settings-control">
                        <div class="settings-segmented" id="pageWidthOptions">
                            ${PAGE_WIDTH_OPTIONS.map(option => `
                                <button class="settings-segment ${this.config.pageWidth === option.value ? 'active' : ''}"
                                        data-value="${option.value}">
                                    ${option.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- 首行缩进 -->
                <div class="settings-section">
                    <h4 class="settings-section-title">首行缩进</h4>
                    <div class="settings-control">
                        <label class="settings-switch">
                            <input type="checkbox" id="textIndentToggle" ${this.config.textIndent > 0 ? 'checked' : ''}>
                            <span class="settings-switch-slider"></span>
                            <span class="settings-switch-label">启用首行缩进</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- 实时预览 -->
            <div class="settings-preview-section">
                <h4 class="settings-section-title">实时预览</h4>
                <div class="settings-preview" id="settingsPreview">
                    <p class="preview-text">这是一段预览文字，用于展示当前的阅读设置效果。您可以调整上方的各项参数，实时查看效果变化。</p>
                    <p class="preview-text">第二段预览文字，展示段落间距和行高的效果。合适的阅读设置可以让您获得更舒适的阅读体验。</p>
                </div>
            </div>

            <div class="settings-panel-footer">
                <button class="settings-btn-reset" id="resetSettingsBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    恢复默认
                </button>
                <button class="settings-btn-apply" id="applySettingsBtn">应用设置</button>
            </div>
        `;
    }

    // 创建预览区域
    createPreviewArea() {
        const preview = document.createElement('div');
        preview.className = 'reader-settings-preview';
        preview.id = 'readerSettingsPreview';
        preview.innerHTML = `
            <div class="preview-content">
                <h4>预览效果</h4>
                <p>调整设置后，此处将实时显示效果...</p>
            </div>
        `;
        this.container.appendChild(preview);
        this.previewArea = preview;
    }

    // 绑定事件
    bindEvents() {
        // 关闭按钮
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => this.close());

        // 主题选择
        this.panel.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleThemeChange(e.target.dataset.theme));
        });

        // 字体选择
        document.getElementById('fontFamilySelect')?.addEventListener('change', (e) => {
            this.handleFontFamilyChange(e.target.value);
        });

        // 字体大小滑块
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        fontSizeSlider?.addEventListener('input', (e) => this.handleFontSizeChange(parseInt(e.target.value)));

        // 字体大小按钮
        document.getElementById('decreaseFontSize')?.addEventListener('click', () => {
            const newSize = Math.max(12, this.config.fontSize - 1);
            this.handleFontSizeChange(newSize);
        });

        document.getElementById('increaseFontSize')?.addEventListener('click', () => {
            const newSize = Math.min(32, this.config.fontSize + 1);
            this.handleFontSizeChange(newSize);
        });

        // 行高选择
        this.panel.querySelectorAll('#lineHeightOptions .settings-segment').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLineHeightChange(parseFloat(e.target.dataset.value)));
        });

        // 段落间距选择
        this.panel.querySelectorAll('#paragraphSpacingOptions .settings-segment').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleParagraphSpacingChange(parseFloat(e.target.dataset.value)));
        });

        // 页面宽度选择
        this.panel.querySelectorAll('#pageWidthOptions .settings-segment').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePageWidthChange(e.target.dataset.value));
        });

        // 首行缩进开关
        document.getElementById('textIndentToggle')?.addEventListener('change', (e) => {
            this.handleTextIndentChange(e.target.checked ? 2 : 0);
        });

        // 重置按钮
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => this.resetSettings());

        // 应用按钮
        document.getElementById('applySettingsBtn')?.addEventListener('click', () => {
            this.saveConfig();
            this.close();
            this.showToast('设置已保存', 'success');
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !e.target.closest('.reader-settings-toggle')) {
                this.close();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    // 处理主题变化
    handleThemeChange(theme) {
        this.config.theme = theme;
        
        // 更新UI
        this.panel.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
            const check = btn.querySelector('.theme-option-check');
            if (btn.dataset.theme === theme && !check) {
                btn.innerHTML += '<span class="theme-option-check">✓</span>';
            } else if (btn.dataset.theme !== theme && check) {
                check.remove();
            }
        });

        this.applySettings();
        this.updatePreview();
    }

    // 处理字体变化
    handleFontFamilyChange(fontFamily) {
        this.config.fontFamily = fontFamily;
        this.applySettings();
        this.updatePreview();
    }

    // 处理字体大小变化
    handleFontSizeChange(size) {
        this.config.fontSize = size;
        
        // 更新滑块
        const slider = document.getElementById('fontSizeSlider');
        if (slider) slider.value = size;
        
        // 更新数值显示
        const valueEl = document.getElementById('fontSizeValue');
        if (valueEl) valueEl.textContent = `${size}px`;
        
        // 更新填充条
        this.updateSliderFill('fontSizeSlider', 'fontSizeFill');
        
        this.applySettings();
        this.updatePreview();
    }

    // 处理行高变化
    handleLineHeightChange(lineHeight) {
        this.config.lineHeight = lineHeight;
        
        // 更新UI
        this.panel.querySelectorAll('#lineHeightOptions .settings-segment').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.value) === lineHeight);
        });
        
        // 更新数值显示
        const valueEl = document.getElementById('lineHeightValue');
        if (valueEl) valueEl.textContent = this.getLineHeightLabel(lineHeight);
        
        this.applySettings();
        this.updatePreview();
    }

    // 处理段落间距变化
    handleParagraphSpacingChange(spacing) {
        this.config.paragraphSpacing = spacing;
        
        // 更新UI
        this.panel.querySelectorAll('#paragraphSpacingOptions .settings-segment').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.value) === spacing);
        });
        
        // 更新数值显示
        const valueEl = document.getElementById('paragraphSpacingValue');
        if (valueEl) valueEl.textContent = this.getParagraphSpacingLabel(spacing);
        
        this.applySettings();
        this.updatePreview();
    }

    // 处理页面宽度变化
    handlePageWidthChange(width) {
        this.config.pageWidth = width === '100%' ? '100%' : parseInt(width);
        
        // 更新UI
        this.panel.querySelectorAll('#pageWidthOptions .settings-segment').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(width));
        });
        
        // 更新数值显示
        const valueEl = document.getElementById('pageWidthValue');
        if (valueEl) valueEl.textContent = this.getPageWidthLabel(this.config.pageWidth);
        
        this.applySettings();
        this.updatePreview();
    }

    // 处理首行缩进变化
    handleTextIndentChange(indent) {
        this.config.textIndent = indent;
        this.applySettings();
        this.updatePreview();
    }

    // 更新滑块填充
    updateSliderFill(sliderId, fillId) {
        const slider = document.getElementById(sliderId);
        const fill = document.getElementById(fillId);
        if (slider && fill) {
            const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
            fill.style.width = `${percent}%`;
        }
    }

    // 应用设置到阅读内容
    applySettings() {
        if (!this.targetContent) return;

        // 应用字体大小
        this.targetContent.style.fontSize = `${this.config.fontSize}px`;
        
        // 应用行高
        this.targetContent.style.lineHeight = this.config.lineHeight;
        
        // 应用字体
        this.targetContent.style.fontFamily = this.config.fontFamily;
        
        // 应用页面宽度
        if (this.config.pageWidth === '100%') {
            this.targetContent.style.maxWidth = '100%';
        } else {
            this.targetContent.style.maxWidth = `${this.config.pageWidth}px`;
        }

        // 应用段落样式
        const paragraphs = this.targetContent.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.marginBottom = `${this.config.paragraphSpacing}em`;
            p.style.textIndent = this.config.textIndent > 0 ? `${this.config.textIndent}em` : '0';
        });

        // 应用主题
        this.applyTheme();

        // 触发回调
        this.onChange(this.config);
    }

    // 应用主题
    applyTheme() {
        const body = document.body;
        
        // 移除所有主题类
        body.classList.remove('theme-light', 'theme-paper', 'theme-dark', 'theme-eye-care', 'theme-sepia');
        
        // 添加当前主题类
        body.classList.add(`theme-${this.config.theme}`);

        // 设置CSS变量
        const theme = AVAILABLE_THEMES.find(t => t.value === this.config.theme);
        if (theme) {
            document.documentElement.style.setProperty('--reader-bg', theme.color);
            document.documentElement.style.setProperty('--reader-text', theme.textColor);
        }
    }

    // 更新预览
    updatePreview() {
        const preview = document.getElementById('settingsPreview');
        if (!preview) return;

        // 应用当前设置到预览区域
        preview.style.fontSize = `${this.config.fontSize}px`;
        preview.style.lineHeight = this.config.lineHeight;
        preview.style.fontFamily = this.config.fontFamily;

        const paragraphs = preview.querySelectorAll('.preview-text');
        paragraphs.forEach(p => {
            p.style.marginBottom = `${this.config.paragraphSpacing}em`;
            p.style.textIndent = this.config.textIndent > 0 ? `${this.config.textIndent}em` : '0';
        });

        // 应用主题背景
        const theme = AVAILABLE_THEMES.find(t => t.value === this.config.theme);
        if (theme) {
            preview.style.backgroundColor = theme.color;
            preview.style.color = theme.textColor;
        }
    }

    // 重置设置
    resetSettings() {
        this.config = { ...DEFAULT_READER_CONFIG };
        this.refreshUI();
        this.applySettings();
        this.updatePreview();
        this.showToast('已恢复默认设置', 'info');
    }

    // 刷新UI
    refreshUI() {
        // 更新主题选择
        this.panel.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.config.theme);
        });

        // 更新字体选择
        const fontSelect = document.getElementById('fontFamilySelect');
        if (fontSelect) fontSelect.value = this.config.fontFamily;

        // 更新字体大小
        this.handleFontSizeChange(this.config.fontSize);

        // 更新行高
        this.panel.querySelectorAll('#lineHeightOptions .settings-segment').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.value) === this.config.lineHeight);
        });
        const lineHeightValue = document.getElementById('lineHeightValue');
        if (lineHeightValue) lineHeightValue.textContent = this.getLineHeightLabel(this.config.lineHeight);

        // 更新段落间距
        this.panel.querySelectorAll('#paragraphSpacingOptions .settings-segment').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.value) === this.config.paragraphSpacing);
        });
        const paragraphSpacingValue = document.getElementById('paragraphSpacingValue');
        if (paragraphSpacingValue) paragraphSpacingValue.textContent = this.getParagraphSpacingLabel(this.config.paragraphSpacing);

        // 更新页面宽度
        this.panel.querySelectorAll('#pageWidthOptions .settings-segment').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(this.config.pageWidth));
        });
        const pageWidthValue = document.getElementById('pageWidthValue');
        if (pageWidthValue) pageWidthValue.textContent = this.getPageWidthLabel(this.config.pageWidth);

        // 更新首行缩进
        const textIndentToggle = document.getElementById('textIndentToggle');
        if (textIndentToggle) textIndentToggle.checked = this.config.textIndent > 0;
    }

    // 打开面板
    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 添加动画类
        setTimeout(() => {
            this.panel.querySelector('.settings-panel-body')?.classList.add('animate-in');
        }, 50);
    }

    // 关闭面板
    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 切换面板
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // 加载配置
    loadConfig() {
        try {
            const saved = localStorage.getItem('novelhub_reader_config');
            if (saved) {
                return { ...DEFAULT_READER_CONFIG, ...JSON.parse(saved) };
            }
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('阅读器配置加载失败:', e.message);
            }
        }
        return { ...DEFAULT_READER_CONFIG };
    }

    // 保存配置
    saveConfig() {
        try {
            localStorage.setItem('novelhub_reader_config', JSON.stringify(this.config));
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('阅读器配置保存失败:', e.message);
            }
        }
    }

    // 获取行高标签
    getLineHeightLabel(value) {
        const option = LINE_HEIGHT_OPTIONS.find(o => o.value === value);
        return option ? option.label : '适中';
    }

    // 获取段落间距标签
    getParagraphSpacingLabel(value) {
        const option = PARAGRAPH_SPACING_OPTIONS.find(o => o.value === value);
        return option ? option.label : '宽松';
    }

    // 获取页面宽度标签
    getPageWidthLabel(value) {
        const option = PAGE_WIDTH_OPTIONS.find(o => o.value === value);
        return option ? option.label : '宽';
    }

    // 显示Toast提示
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        }
    }

    // 获取当前配置
    getConfig() {
        return { ...this.config };
    }

    // 设置配置
    setConfig(config) {
        this.config = { ...this.config, ...config };
        this.refreshUI();
        this.applySettings();
        this.updatePreview();
    }
}

// 导出
export { ReaderSettings, DEFAULT_READER_CONFIG, AVAILABLE_FONTS, AVAILABLE_THEMES };
export default ReaderSettings;

// 初始化函数
export function initReaderSettings(options = {}) {
    return new ReaderSettings(options);
}
