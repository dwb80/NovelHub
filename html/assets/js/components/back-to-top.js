/**
 * Back to Top Button Component
 * NovelHub - 返回顶部按钮组件
 * @version 1.0.0
 */

(function() {
    'use strict';

    // 默认配置
    const DEFAULT_CONFIG = {
        threshold: 300,           // 显示按钮的滚动阈值（像素）
        position: 'right',        // 按钮位置：'right' 或 'left'
        bottom: '2rem',          // 距离底部距离
        right: '2rem',           // 距离右侧距离
        left: 'auto',            // 距离左侧距离
        size: '3rem',            // 按钮大小
        background: 'var(--color-primary)',
        color: 'white',
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 999,
        transition: 'all 0.3s ease',
        showAnimation: 'fadeInUp',
        hideAnimation: 'fadeOutDown'
    };

    // 动画样式
    const ANIMATION_STYLES = `
        @keyframes backToTopFadeInUp {
            from {
                opacity: 0;
                transform: translate3d(0, 20px, 0);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }
        
        @keyframes backToTopFadeOutDown {
            from {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
            to {
                opacity: 0;
                transform: translate3d(0, 20px, 0);
            }
        }
        
        .back-to-top-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            outline: none;
            transition: all 0.3s ease;
        }
        
        .back-to-top-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .back-to-top-btn:active {
            transform: translateY(0);
        }
        
        .back-to-top-btn svg {
            width: 1.5rem;
            height: 1.5rem;
        }
        
        .back-to-top-visible {
            animation: backToTopFadeInUp 0.3s ease forwards;
        }
        
        .back-to-top-hidden {
            animation: backToTopFadeOutDown 0.3s ease forwards;
            pointer-events: none;
        }
        
        /* 移动端适配 */
        @media (max-width: 768px) {
            .back-to-top-btn {
                width: 2.5rem !important;
                height: 2.5rem !important;
                bottom: 1.5rem !important;
                right: 1rem !important;
            }
            
            .back-to-top-btn svg {
                width: 1.25rem;
                height: 1.25rem;
            }
        }
        
        /* 减少动画偏好 */
        @media (prefers-reduced-motion: reduce) {
            .back-to-top-btn,
            .back-to-top-visible,
            .back-to-top-hidden {
                animation: none;
                transition: none;
            }
        }
    `;

    class BackToTop {
        constructor(options = {}) {
            this.config = { ...DEFAULT_CONFIG, ...options };
            this.button = null;
            this.isVisible = false;
            this.scrollThreshold = this.config.threshold;
            
            this.init();
        }

        init() {
            this.injectStyles();
            this.createButton();
            this.bindEvents();
        }

        // 注入样式
        injectStyles() {
            if (document.getElementById('back-to-top-styles')) return;
            
            const styleSheet = document.createElement('style');
            styleSheet.id = 'back-to-top-styles';
            styleSheet.textContent = ANIMATION_STYLES;
            document.head.appendChild(styleSheet);
        }

        // 创建按钮
        createButton() {
            this.button = document.createElement('button');
            this.button.className = 'back-to-top-btn back-to-top-hidden';
            this.button.setAttribute('aria-label', '返回顶部');
            this.button.setAttribute('title', '返回顶部');
            this.button.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            `;

            // 应用样式
            const styles = {
                position: 'fixed',
                bottom: this.config.bottom,
                right: this.config.position === 'right' ? this.config.right : 'auto',
                left: this.config.position === 'left' ? this.config.left : 'auto',
                width: this.config.size,
                height: this.config.size,
                background: this.config.background,
                color: this.config.color,
                borderRadius: this.config.borderRadius,
                boxShadow: this.config.boxShadow,
                zIndex: this.config.zIndex
            };

            Object.assign(this.button.style, styles);

            document.body.appendChild(this.button);
        }

        // 绑定事件
        bindEvents() {
            // 滚动事件（使用 requestAnimationFrame 优化性能）
            let ticking = false;
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.handleScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });

            // 点击事件
            this.button.addEventListener('click', () => {
                this.scrollToTop();
            });

            // 键盘事件
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }

        // 处理滚动
        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > this.scrollThreshold && !this.isVisible) {
                this.show();
            } else if (scrollTop <= this.scrollThreshold && this.isVisible) {
                this.hide();
            }
        }

        // 显示按钮
        show() {
            this.isVisible = true;
            this.button.classList.remove('back-to-top-hidden');
            this.button.classList.add('back-to-top-visible');
        }

        // 隐藏按钮
        hide() {
            this.isVisible = false;
            this.button.classList.remove('back-to-top-visible');
            this.button.classList.add('back-to-top-hidden');
        }

        // 滚动到顶部
        scrollToTop() {
            const scrollOptions = {
                top: 0,
                behavior: 'smooth'
            };

            // 检查浏览器是否支持 smooth scroll
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo(scrollOptions);
            } else {
                // 降级方案
                this.smoothScrollPolyfill();
            }

            // 触发自定义事件
            window.dispatchEvent(new CustomEvent('backtotop', {
                detail: { timestamp: Date.now() }
            }));
        }

        // Smooth Scroll Polyfill
        smoothScrollPolyfill() {
            const startPosition = window.pageYOffset;
            const duration = 500;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                window.scrollTo(0, startPosition * (1 - easeOut));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }

        // 销毁组件
        destroy() {
            if (this.button && this.button.parentNode) {
                this.button.parentNode.removeChild(this.button);
            }
            this.button = null;
        }

        // 更新配置
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            
            // 重新创建按钮
            if (this.button) {
                this.destroy();
                this.createButton();
                this.bindEvents();
            }
        }
    }

    // 自动初始化
    function autoInit() {
        // 检查是否在长页面（页面高度大于视口高度 2 倍）
        const pageHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        const viewportHeight = window.innerHeight;
        
        if (pageHeight > viewportHeight * 2) {
            window.backToTop = new BackToTop();
        }
    }

    // DOM 加载完成后自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // 暴露到全局
    window.BackToTop = BackToTop;

})();
