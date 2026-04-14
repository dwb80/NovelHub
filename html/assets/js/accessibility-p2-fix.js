/**
 * P2级UX问题修复 - 可访问性增强模块
 * NovelHub - Accessibility P2 Fixes
 * 
 * 修复内容:
 * 1. 键盘导航顺序问题 - 优化Tab顺序，确保逻辑导航顺序
 * 2. 屏幕阅读器支持不完整 - 完善ARIA标签
 * 3. 缺少跳过导航链接 - 添加跳过导航链接
 * 
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        skipLinkText: '跳转到主要内容',
        skipLinkTarget: '#mainContent',
        focusableSelectors: [
            'a[href]:not([tabindex="-1"])',
            'button:not([disabled]):not([tabindex="-1"])',
            'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
            'textarea:not([disabled]):not([tabindex="-1"])',
            'select:not([disabled]):not([tabindex="-1"])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable]:not([contenteditable="false"])',
            'details summary:not([tabindex="-1"])'
        ].join(', '),
        logicalOrderSelectors: [
            // 导航区域
            { selector: '.skip-link', order: 0 },
            { selector: '.navbar .logo', order: 1 },
            { selector: '.navbar .nav-menu a', order: 2 },
            { selector: '.navbar .nav-actions button', order: 3 },
            // 主要内容区域
            { selector: 'main a, main button, main input, main textarea, main select', order: 10 },
            // 侧边栏
            { selector: 'aside a, aside button', order: 20 },
            // 页脚
            { selector: 'footer a, footer button', order: 30 }
        ]
    };

    // ========== 跳过导航链接管理器 ==========
    class SkipLinkManager {
        constructor() {
            this.skipLink = null;
            this.init();
        }

        init() {
            // 检查是否已存在跳过链接
            if (document.querySelector('.skip-link')) {
                this.enhanceExistingSkipLink();
            } else {
                this.createSkipLink();
            }
        }

        createSkipLink() {
            const skipLink = document.createElement('a');
            skipLink.href = CONFIG.skipLinkTarget;
            skipLink.className = 'skip-link';
            skipLink.textContent = CONFIG.skipLinkText;
            skipLink.setAttribute('aria-label', '跳过导航，直接跳转到主要内容');
            
            // 插入到 body 的第一个子元素
            const body = document.body;
            if (body.firstChild) {
                body.insertBefore(skipLink, body.firstChild);
            } else {
                body.appendChild(skipLink);
            }

            // 绑定点击事件
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.focusMainContent();
            });

            this.skipLink = skipLink;
        }

        enhanceExistingSkipLink() {
            const existingLink = document.querySelector('.skip-link');
            if (existingLink) {
                existingLink.setAttribute('aria-label', '跳过导航，直接跳转到主要内容');
                existingLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.focusMainContent();
                });
            }
        }

        focusMainContent() {
            const mainContent = document.querySelector(CONFIG.skipLinkTarget) || 
                               document.querySelector('main') ||
                               document.querySelector('[role="main"]') ||
                               document.querySelector('.main-content');
            
            if (mainContent) {
                // 确保目标可以接收焦点
                if (!mainContent.hasAttribute('tabindex')) {
                    mainContent.setAttribute('tabindex', '-1');
                }
                mainContent.focus({ preventScroll: true });
                mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // 添加焦点样式类
                mainContent.classList.add('skip-link-target');
                
                // 3秒后移除焦点样式
                setTimeout(() => {
                    mainContent.classList.remove('skip-link-target');
                }, 3000);
            }
        }
    }

    // ========== 键盘导航管理器 ==========
    class KeyboardNavigationManager {
        constructor() {
            this.focusHistory = [];
            this.currentFocusIndex = -1;
            this.init();
        }

        init() {
            this.setupKeyboardListeners();
            this.setupFocusTracking();
            this.enhanceTabOrder();
        }

        setupKeyboardListeners() {
            document.addEventListener('keydown', (e) => {
                // Tab 键处理
                if (e.key === 'Tab') {
                    this.handleTabNavigation(e);
                }
                
                // Escape 键处理
                if (e.key === 'Escape') {
                    this.handleEscapeKey(e);
                }

                // 方向键导航（用于列表和菜单）
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    this.handleArrowKeys(e);
                }
            });
        }

        setupFocusTracking() {
            document.addEventListener('focusin', (e) => {
                this.updateFocusHistory(e.target);
            });
        }

        updateFocusHistory(element) {
            // 记录焦点历史，用于焦点恢复
            this.focusHistory.push(element);
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        }

        handleTabNavigation(e) {
            const focusableElements = this.getFocusableElements();
            
            if (focusableElements.length === 0) return;

            const currentIndex = focusableElements.indexOf(document.activeElement);
            let nextIndex;

            if (e.shiftKey) {
                // Shift+Tab - 向后导航
                nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
            } else {
                // Tab - 向前导航
                nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
            }

            // 检查是否需要跳过某些元素
            const nextElement = focusableElements[nextIndex];
            if (this.shouldSkipElement(nextElement)) {
                e.preventDefault();
                this.skipToNextFocusable(focusableElements, nextIndex, e.shiftKey);
            }
        }

        getFocusableElements() {
            return Array.from(document.querySelectorAll(CONFIG.focusableSelectors))
                .filter(el => {
                    // 过滤不可见的元素
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && 
                           style.visibility !== 'hidden' &&
                           el.offsetWidth > 0 && 
                           el.offsetHeight > 0;
                })
                .sort((a, b) => {
                    // 按 DOM 顺序和 tabindex 排序
                    const aTabIndex = parseInt(a.getAttribute('tabindex')) || 0;
                    const bTabIndex = parseInt(b.getAttribute('tabindex')) || 0;
                    
                    if (aTabIndex !== bTabIndex) {
                        return aTabIndex - bTabIndex;
                    }
                    
                    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
                });
        }

        shouldSkipElement(element) {
            // 检查元素是否应该被跳过
            if (element.classList.contains('skip-on-tab')) return true;
            if (element.getAttribute('aria-hidden') === 'true') return true;
            if (element.closest('[aria-hidden="true"]')) return true;
            return false;
        }

        skipToNextFocusable(elements, startIndex, backward) {
            let index = startIndex;
            const direction = backward ? -1 : 1;
            
            for (let i = 0; i < elements.length; i++) {
                index = (index + direction + elements.length) % elements.length;
                if (!this.shouldSkipElement(elements[index])) {
                    elements[index].focus();
                    break;
                }
            }
        }

        handleEscapeKey(e) {
            // 关闭模态框
            const activeModal = document.querySelector('.modal-overlay.active, [role="dialog"][aria-modal="true"]');
            if (activeModal) {
                this.closeModal(activeModal);
                return;
            }

            // 关闭下拉菜单
            const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
            openDropdowns.forEach(dropdown => {
                dropdown.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('active');
            });

            // 关闭移动端菜单
            const mobileNav = document.querySelector('.mobile-nav-menu.active');
            if (mobileNav) {
                mobileNav.classList.remove('active');
                const toggle = document.getElementById('mobileMenuToggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            }
        }

        handleArrowKeys(e) {
            const target = e.target;
            
            // 处理轮播图导航
            if (target.closest('.banner-carousel')) {
                this.handleCarouselNavigation(e, target);
                return;
            }

            // 处理标签页导航
            if (target.matches('[role="tab"]')) {
                this.handleTabNavigationKeys(e, target);
                return;
            }

            // 处理列表导航
            if (target.matches('[role="listbox"] *, [role="menu"] *, [role="list"] *')) {
                this.handleListNavigation(e, target);
            }
        }

        handleCarouselNavigation(e, target) {
            const carousel = target.closest('.banner-carousel');
            const dots = carousel.querySelectorAll('.banner-dot');
            const currentDot = carousel.querySelector('.banner-dot.active');
            
            if (!currentDot || dots.length === 0) return;

            const currentIndex = Array.from(dots).indexOf(currentDot);
            let nextIndex;

            if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : dots.length - 1;
            } else if (e.key === 'ArrowRight') {
                nextIndex = currentIndex < dots.length - 1 ? currentIndex + 1 : 0;
            } else {
                return;
            }

            e.preventDefault();
            dots[nextIndex].click();
            dots[nextIndex].focus();
        }

        handleTabNavigationKeys(e, target) {
            const tabs = Array.from(target.parentElement.querySelectorAll('[role="tab"]'));
            const currentIndex = tabs.indexOf(target);
            let nextIndex;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            } else {
                return;
            }

            e.preventDefault();
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
        }

        handleListNavigation(e, target) {
            const list = target.closest('[role="list"], [role="listbox"], [role="menu"]');
            if (!list) return;

            const items = Array.from(list.querySelectorAll(':scope > *'));
            const currentIndex = items.indexOf(target.closest('a, button, [role="listitem"], [role="option"], [role="menuitem"]'));
            
            if (currentIndex === -1) return;

            let nextIndex;
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            } else {
                return;
            }

            e.preventDefault();
            const nextItem = items[nextIndex];
            const focusable = nextItem.querySelector('a, button') || nextItem;
            if (focusable && focusable.focus) {
                focusable.focus();
            }
        }

        closeModal(modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            // 恢复焦点到触发元素
            const triggerId = modal.getAttribute('data-trigger');
            if (triggerId) {
                const trigger = document.getElementById(triggerId);
                if (trigger) {
                    trigger.focus();
                }
            }
        }

        enhanceTabOrder() {
            // 为特定元素添加 tabindex 以优化 Tab 顺序
            const logicalElements = document.querySelectorAll('[data-tab-order]');
            logicalElements.forEach(el => {
                const order = el.getAttribute('data-tab-order');
                if (order) {
                    el.setAttribute('tabindex', order);
                }
            });
        }
    }

    // ========== ARIA 标签增强管理器 ==========
    class ARIAEnhancementManager {
        constructor() {
            this.init();
        }

        init() {
            this.enhanceNavigation();
            this.enhanceForms();
            this.enhanceInteractiveElements();
            this.enhanceDynamicContent();
            this.enhanceLandmarks();
        }

        enhanceNavigation() {
            // 增强导航链接
            const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
            navLinks.forEach(link => {
                // 确保当前页面有 aria-current
                if (link.classList.contains('active') && !link.hasAttribute('aria-current')) {
                    link.setAttribute('aria-current', 'page');
                }

                // 添加描述性标签
                if (!link.hasAttribute('aria-label')) {
                    const text = link.textContent.trim();
                    if (text) {
                        link.setAttribute('aria-label', `导航到${text}`);
                    }
                }
            });

            // 增强移动端菜单按钮
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            if (mobileMenuToggle && !mobileMenuToggle.hasAttribute('aria-controls')) {
                mobileMenuToggle.setAttribute('aria-controls', 'mobileNavMenu');
            }
        }

        enhanceForms() {
            // 增强表单输入
            const formInputs = document.querySelectorAll('input, textarea, select');
            formInputs.forEach(input => {
                // 确保必填字段有 aria-required
                if (input.required && !input.hasAttribute('aria-required')) {
                    input.setAttribute('aria-required', 'true');
                }

                // 确保有 aria-invalid 状态
                if (!input.hasAttribute('aria-invalid')) {
                    input.setAttribute('aria-invalid', 'false');
                }

                // 添加描述
                const id = input.id;
                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    const errorEl = document.getElementById(`${id}Error`);
                    
                    if (errorEl && !input.hasAttribute('aria-describedby')) {
                        input.setAttribute('aria-describedby', `${id}Error`);
                    }
                }
            });

            // 增强表单验证反馈
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('invalid', (e) => {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                        e.target.setAttribute('aria-invalid', 'true');
                    }
                }, true);

                form.addEventListener('input', (e) => {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                        e.target.setAttribute('aria-invalid', 'false');
                    }
                });
            });
        }

        enhanceInteractiveElements() {
            // 增强按钮
            const buttons = document.querySelectorAll('button:not([aria-label])');
            buttons.forEach(btn => {
                const text = btn.textContent.trim();
                const icon = btn.querySelector('svg, .icon');
                
                // 如果按钮只有图标没有文字，添加 aria-label
                if (icon && !text && !btn.hasAttribute('aria-label')) {
                    const title = btn.getAttribute('title');
                    if (title) {
                        btn.setAttribute('aria-label', title);
                    }
                }
            });

            // 增强卡片链接
            const cardLinks = document.querySelectorAll('.novel-card, .category-card, .agent-card');
            cardLinks.forEach(card => {
                if (!card.hasAttribute('aria-label')) {
                    const title = card.querySelector('.novel-title, .category-name, .agent-name');
                    if (title) {
                        card.setAttribute('aria-label', `查看${title.textContent.trim()}`);
                    }
                }
            });

            // 增强轮播图
            const carousel = document.getElementById('bannerCarousel');
            if (carousel) {
                if (!carousel.hasAttribute('role')) {
                    carousel.setAttribute('role', 'region');
                }
                if (!carousel.hasAttribute('aria-label')) {
                    carousel.setAttribute('aria-label', '热门推荐轮播');
                }

                // 增强轮播点
                const dots = carousel.querySelectorAll('.banner-dot');
                dots.forEach((dot, index) => {
                    if (!dot.hasAttribute('aria-label')) {
                        dot.setAttribute('aria-label', `查看第${index + 1}张推荐`);
                    }
                });
            }
        }

        enhanceDynamicContent() {
            // 为动态加载的内容添加 ARIA 属性
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.enhanceNewElements(node);
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        enhanceNewElements(container) {
            // 增强新添加的表单元素
            const newInputs = container.querySelectorAll ? 
                container.querySelectorAll('input:not([aria-required]), textarea:not([aria-required])') : [];
            newInputs.forEach(input => {
                if (input.required) {
                    input.setAttribute('aria-required', 'true');
                }
            });

            // 增强新添加的按钮
            const newButtons = container.querySelectorAll ? 
                container.querySelectorAll('button:not([aria-label])') : [];
            newButtons.forEach(btn => {
                const text = btn.textContent.trim();
                const icon = btn.querySelector('svg');
                if (icon && !text) {
                    const title = btn.getAttribute('title');
                    if (title) {
                        btn.setAttribute('aria-label', title);
                    }
                }
            });
        }

        enhanceLandmarks() {
            // 确保页面有正确的地标
            const landmarks = {
                'header[role="banner"]': 'banner',
                'nav[role="navigation"]': 'navigation',
                'main[role="main"]': 'main',
                'aside[role="complementary"]': 'complementary',
                'footer[role="contentinfo"]': 'contentinfo',
                '[role="search"]': 'search'
            };

            // 检查并添加缺失的地标
            if (!document.querySelector('main, [role="main"]')) {
                const mainContent = document.querySelector('.main-content, #mainContent');
                if (mainContent) {
                    mainContent.setAttribute('role', 'main');
                }
            }

            if (!document.querySelector('footer [role="contentinfo"], footer[role="contentinfo"]')) {
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.setAttribute('role', 'contentinfo');
                }
            }
        }
    }

    // ========== 焦点管理器 ==========
    class FocusManager {
        constructor() {
            this.previousFocus = null;
            this.init();
        }

        init() {
            this.setupFocusTrap();
            this.setupFocusIndicator();
        }

        setupFocusTrap() {
            // 为模态框和面板设置焦点陷阱
            const trapContainers = document.querySelectorAll('[data-focus-trap]');
            trapContainers.forEach(container => {
                this.makeFocusTrap(container);
            });
        }

        makeFocusTrap(container) {
            const focusableElements = Array.from(container.querySelectorAll(CONFIG.focusableSelectors));
            
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            container.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            });
        }

        setupFocusIndicator() {
            // 添加键盘导航指示器
            let isKeyboardNavigation = false;

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    isKeyboardNavigation = true;
                    document.body.classList.add('keyboard-nav-active');
                }
            });

            document.addEventListener('mousedown', () => {
                isKeyboardNavigation = false;
                document.body.classList.remove('keyboard-nav-active');
            });

            document.addEventListener('focusin', (e) => {
                if (isKeyboardNavigation) {
                    e.target.classList.add('keyboard-focus');
                }
            });

            document.addEventListener('focusout', (e) => {
                e.target.classList.remove('keyboard-focus');
            });
        }

        saveFocus() {
            this.previousFocus = document.activeElement;
        }

        restoreFocus() {
            if (this.previousFocus && this.previousFocus.focus) {
                this.previousFocus.focus();
            }
        }
    }

    // ========== 屏幕阅读器通知管理器 ==========
    class ScreenReaderAnnouncer {
        constructor() {
            this.announcer = null;
            this.init();
        }

        init() {
            this.createAnnouncer();
        }

        createAnnouncer() {
            // 创建 polite 通知区域
            this.announcer = document.createElement('div');
            this.announcer.id = 'sr-announcer';
            this.announcer.className = 'sr-only';
            this.announcer.setAttribute('aria-live', 'polite');
            this.announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.announcer);

            // 创建 assertive 通知区域（用于重要通知）
            this.assertiveAnnouncer = document.createElement('div');
            this.assertiveAnnouncer.id = 'sr-announcer-assertive';
            this.assertiveAnnouncer.className = 'sr-only';
            this.assertiveAnnouncer.setAttribute('aria-live', 'assertive');
            this.assertiveAnnouncer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.assertiveAnnouncer);
        }

        announce(message, priority = 'polite') {
            const announcer = priority === 'assertive' ? this.assertiveAnnouncer : this.announcer;
            
            // 清空后设置新内容，确保触发通知
            announcer.textContent = '';
            
            setTimeout(() => {
                announcer.textContent = message;
            }, 100);
        }

        announcePageLoad(pageName) {
            this.announce(`${pageName}页面已加载完成`);
        }

        announceNavigation(destination) {
            this.announce(`正在导航到${destination}`);
        }

        announceActionResult(action, success = true) {
            const result = success ? '成功' : '失败';
            this.announce(`${action}${result}`);
        }
    }

    // ========== 初始化 ==========
    function init() {
        // 等待 DOM 加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeModules);
        } else {
            initializeModules();
        }
    }

    function initializeModules() {
        // 初始化所有管理器
        window.skipLinkManager = new SkipLinkManager();
        window.keyboardNavigation = new KeyboardNavigationManager();
        window.ariaEnhancement = new ARIAEnhancementManager();
        window.focusManager = new FocusManager();
        window.srAnnouncer = new ScreenReaderAnnouncer();

        // 添加 CSS 样式
        addAccessibilityStyles();

        // 页面加载完成通知
        setTimeout(() => {
            const pageTitle = document.title.split(' - ')[0] || '当前';
            window.srAnnouncer.announcePageLoad(pageTitle);
        }, 1000);

        // 使用日志系统记录（开发环境输出）
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.info('P2级可访问性修复已加载');
        }
    }

    function addAccessibilityStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* 跳过导航链接样式 */
            .skip-link {
                position: absolute;
                top: -100px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                padding: 1rem 1.5rem;
                background-color: var(--color-primary, #6366f1);
                color: white;
                font-weight: 600;
                border-radius: var(--radius-md, 0.5rem);
                text-decoration: none;
                transition: top 0.2s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .skip-link:focus {
                top: 1rem;
                outline: 3px solid white;
                outline-offset: 2px;
            }

            /* 跳过链接目标样式 */
            .skip-link-target {
                outline: 3px solid var(--color-primary, #6366f1);
                outline-offset: 4px;
            }

            /* 键盘导航焦点样式 */
            .keyboard-nav-active *:focus {
                outline: 3px solid var(--color-primary, #6366f1);
                outline-offset: 2px;
                box-shadow: 0 0 0 4px var(--color-primary-light, rgba(99, 102, 241, 0.2));
            }

            .keyboard-focus {
                outline: 3px solid var(--color-primary, #6366f1) !important;
                outline-offset: 2px !important;
            }

            /* 屏幕阅读器专用 - 视觉隐藏但可被朗读 */
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }

            /* 焦点陷阱样式 */
            [data-focus-trap] {
                position: relative;
            }

            /* 高对比度模式支持 */
            @media (prefers-contrast: high) {
                .skip-link:focus {
                    outline: 4px solid currentColor;
                    outline-offset: 2px;
                }

                .keyboard-nav-active *:focus {
                    outline: 4px solid currentColor;
                    outline-offset: 2px;
                }
            }

            /* 减少动画偏好支持 */
            @media (prefers-reduced-motion: reduce) {
                .skip-link {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // 启动
    init();

    // 导出 API
    window.NovelHubAccessibility = {
        announce: (message, priority) => window.srAnnouncer?.announce(message, priority),
        focusMainContent: () => window.skipLinkManager?.focusMainContent(),
        saveFocus: () => window.focusManager?.saveFocus(),
        restoreFocus: () => window.focusManager?.restoreFocus()
    };

})();
