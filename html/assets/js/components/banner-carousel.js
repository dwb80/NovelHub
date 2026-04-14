/**
 * NovelHub 高性能Banner轮播组件
 * 支持触摸滑动、自动播放、懒加载、性能优化
 * @version 2.0.0
 */

class BannerCarousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error('轮播组件: 容器未找到');
            }
            return;
        }

        // 默认配置
        this.config = {
            autoplay: true,
            autoplayInterval: 5000,
            transitionDuration: 500,
            loop: true,
            lazyLoad: true,
            touchEnabled: true,
            pauseOnHover: true,
            indicators: true,
            arrows: true,
            preloadCount: 1, // 预加载相邻图片数量
            ...options
        };

        // 状态
        this.currentIndex = 0;
        this.slides = [];
        this.isPlaying = false;
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.autoplayTimer = null;
        this.rafId = null;

        // 性能优化相关
        this.observer = null;
        this.visibleSlides = new Set();

        this.init();
    }

    init() {
        this.parseSlides();
        this.buildStructure();
        this.bindEvents();
        this.setupIntersectionObserver();
        
        if (this.config.autoplay) {
            this.startAutoplay();
        }

        // 初始显示第一张
        this.goTo(0, false);
    }

    // 解析原始幻灯片数据
    parseSlides() {
        const slideElements = this.container.querySelectorAll('.banner-slide');
        this.slides = Array.from(slideElements).map(el => ({
            element: el,
            image: el.dataset.image || el.querySelector('img')?.src,
            title: el.dataset.title || el.querySelector('.banner-title')?.textContent,
            subtitle: el.dataset.subtitle || el.querySelector('.banner-subtitle')?.textContent,
            link: el.dataset.link || el.querySelector('a')?.href || '#',
            loaded: false
        }));

        // 清空容器
        this.container.innerHTML = '';
    }

    // 构建轮播结构
    buildStructure() {
        this.container.classList.add('banner-carousel');

        // 创建视口
        this.viewport = document.createElement('div');
        this.viewport.className = 'banner-viewport';

        // 创建轨道
        this.track = document.createElement('div');
        this.track.className = 'banner-track';

        // 创建幻灯片
        this.slides.forEach((slide, index) => {
            const slideEl = document.createElement('div');
            slideEl.className = 'banner-slide';
            slideEl.dataset.index = index;

            // 图片容器
            const imgContainer = document.createElement('div');
            imgContainer.className = 'banner-image-container';

            // 图片
            const img = document.createElement('img');
            img.className = 'banner-image';
            img.alt = slide.title || '';
            img.dataset.src = slide.image;
            
            if (!this.config.lazyLoad || index <= this.config.preloadCount) {
                img.src = slide.image;
                slide.loaded = true;
            }

            imgContainer.appendChild(img);
            slideEl.appendChild(imgContainer);

            // 内容覆盖层
            const content = document.createElement('div');
            content.className = 'banner-content';
            content.innerHTML = `
                <h2 class="banner-title">${slide.title || ''}</h2>
                <p class="banner-subtitle">${slide.subtitle || ''}</p>
                <a href="${slide.link}" class="banner-btn">立即阅读</a>
            `;
            slideEl.appendChild(content);

            this.track.appendChild(slideEl);
            slide.element = slideEl;
            slide.imageEl = img;
        });

        this.viewport.appendChild(this.track);
        this.container.appendChild(this.viewport);

        // 指示器
        if (this.config.indicators && this.slides.length > 1) {
            this.buildIndicators();
        }

        // 箭头
        if (this.config.arrows && this.slides.length > 1) {
            this.buildArrows();
        }

        // 进度条
        if (this.config.autoplay) {
            this.buildProgressBar();
        }
    }

    // 创建指示器
    buildIndicators() {
        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'banner-indicators';

        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'banner-indicator';
            dot.setAttribute('aria-label', `切换到第 ${index + 1} 张`);
            dot.addEventListener('click', () => this.goTo(index));
            this.indicatorsContainer.appendChild(dot);
        });

        this.container.appendChild(this.indicatorsContainer);
    }

    // 创建箭头
    buildArrows() {
        this.prevArrow = document.createElement('button');
        this.prevArrow.className = 'banner-arrow banner-arrow-prev';
        this.prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        this.prevArrow.setAttribute('aria-label', '上一张');
        this.prevArrow.addEventListener('click', () => this.prev());

        this.nextArrow = document.createElement('button');
        this.nextArrow.className = 'banner-arrow banner-arrow-next';
        this.nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        this.nextArrow.setAttribute('aria-label', '下一张');
        this.nextArrow.addEventListener('click', () => this.next());

        this.container.appendChild(this.prevArrow);
        this.container.appendChild(this.nextArrow);
    }

    // 创建进度条
    buildProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'banner-progress';
        this.progressBar.innerHTML = '<div class="banner-progress-bar"></div>';
        this.container.appendChild(this.progressBar);
        this.progressBarInner = this.progressBar.querySelector('.banner-progress-bar');
    }

    // 绑定事件
    bindEvents() {
        // 触摸事件
        if (this.config.touchEnabled) {
            this.viewport.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            this.viewport.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
            this.viewport.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        }

        // 鼠标事件
        if (this.config.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());
        }

        // 键盘事件
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // 可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else if (this.config.autoplay) {
                this.startAutoplay();
            }
        });

        // 窗口大小变化
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.handleResize(), 250);
        });
    }

    // 设置交叉观察器 (懒加载)
    setupIntersectionObserver() {
        if (!this.config.lazyLoad || !('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const index = parseInt(entry.target.dataset.index);
                
                if (entry.isIntersecting) {
                    this.visibleSlides.add(index);
                    this.loadSlideImage(index);
                    
                    // 预加载相邻图片
                    this.loadSlideImage(index - 1);
                    this.loadSlideImage(index + 1);
                } else {
                    this.visibleSlides.delete(index);
                }
            });
        }, {
            root: this.viewport,
            threshold: 0.1
        });

        this.slides.forEach(slide => {
            this.observer.observe(slide.element);
        });
    }

    // 加载幻灯片图片
    loadSlideImage(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        const slide = this.slides[index];
        if (slide.loaded || !slide.imageEl.dataset.src) return;

        const img = new Image();
        img.onload = () => {
            slide.imageEl.src = slide.imageEl.dataset.src;
            slide.loaded = true;
            slide.element.classList.add('loaded');
        };
        img.src = slide.imageEl.dataset.src;
    }

    // 触摸事件处理
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.pauseAutoplay();
    }

    handleTouchMove(e) {
        if (!this.touchStartX) return;
        
        const currentX = e.touches[0].clientX;
        const diff = this.touchStartX - currentX;
        
        // 添加视觉反馈
        if (Math.abs(diff) > 10) {
            this.track.style.transform = `translateX(calc(-${this.currentIndex * 100}% - ${diff}px))`;
        }
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        const diff = this.touchStartX - this.touchEndX;
        const threshold = 50;

        // 重置 transform
        this.track.style.transform = '';

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }

        this.touchStartX = 0;
        this.startAutoplay();
    }

    // 切换到指定幻灯片
    goTo(index, animate = true) {
        if (this.isTransitioning || index === this.currentIndex) return;

        // 边界处理
        if (this.config.loop) {
            if (index < 0) index = this.slides.length - 1;
            if (index >= this.slides.length) index = 0;
        } else {
            index = Math.max(0, Math.min(index, this.slides.length - 1));
        }

        this.isTransitioning = true;

        // 更新轨道位置
        if (animate) {
            this.track.style.transition = `transform ${this.config.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        } else {
            this.track.style.transition = 'none';
        }

        this.track.style.transform = `translateX(-${index * 100}%)`;

        // 更新状态
        this.updateSlideStates(index);
        this.currentIndex = index;

        // 更新指示器
        if (this.indicatorsContainer) {
            this.updateIndicators();
        }

        // 动画结束
        setTimeout(() => {
            this.isTransitioning = false;
            this.track.style.transition = '';
        }, this.config.transitionDuration);

        // 触发事件
        this.emit('change', { index, slide: this.slides[index] });
    }

    // 更新幻灯片状态
    updateSlideStates(activeIndex) {
        this.slides.forEach((slide, index) => {
            slide.element.classList.remove('active', 'prev', 'next');
            
            if (index === activeIndex) {
                slide.element.classList.add('active');
            } else if (index === activeIndex - 1 || (activeIndex === 0 && index === this.slides.length - 1)) {
                slide.element.classList.add('prev');
            } else if (index === activeIndex + 1 || (activeIndex === this.slides.length - 1 && index === 0)) {
                slide.element.classList.add('next');
            }
        });
    }

    // 更新指示器
    updateIndicators() {
        const dots = this.indicatorsContainer.querySelectorAll('.banner-indicator');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    // 下一张
    next() {
        this.goTo(this.currentIndex + 1);
        this.resetProgressBar();
    }

    // 上一张
    prev() {
        this.goTo(this.currentIndex - 1);
        this.resetProgressBar();
    }

    // 开始自动播放
    startAutoplay() {
        if (!this.config.autoplay || this.isPlaying || this.slides.length <= 1) return;

        this.isPlaying = true;
        this.animateProgressBar();

        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.config.autoplayInterval);
    }

    // 暂停自动播放
    pauseAutoplay() {
        this.isPlaying = false;
        clearInterval(this.autoplayTimer);
        cancelAnimationFrame(this.rafId);
        
        if (this.progressBarInner) {
            this.progressBarInner.style.transition = 'none';
            this.progressBarInner.style.width = '0%';
        }
    }

    // 重置进度条
    resetProgressBar() {
        if (!this.progressBarInner) return;
        
        this.progressBarInner.style.transition = 'none';
        this.progressBarInner.style.width = '0%';
        
        if (this.isPlaying) {
            setTimeout(() => this.animateProgressBar(), 50);
        }
    }

    // 进度条动画
    animateProgressBar() {
        if (!this.progressBarInner) return;

        this.progressBarInner.style.transition = `width ${this.config.autoplayInterval}ms linear`;
        this.progressBarInner.style.width = '100%';
    }

    // 处理窗口大小变化
    handleResize() {
        // 重新计算位置
        this.track.style.transition = 'none';
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    // 事件发射
    emit(eventName, data) {
        const event = new CustomEvent(`carousel:${eventName}`, { detail: data });
        this.container.dispatchEvent(event);
    }

    // 监听事件
    on(eventName, callback) {
        this.container.addEventListener(`carousel:${eventName}`, (e) => callback(e.detail));
    }

    // 销毁
    destroy() {
        this.pauseAutoplay();
        
        if (this.observer) {
            this.observer.disconnect();
        }

        // 清理事件监听
        // ... 清理代码

        this.container.innerHTML = '';
        this.container.classList.remove('banner-carousel');
    }

    // 公共API
    getCurrentIndex() {
        return this.currentIndex;
    }

    getCurrentSlide() {
        return this.slides[this.currentIndex];
    }

    getSlidesCount() {
        return this.slides.length;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BannerCarousel;
}

if (typeof window !== 'undefined') {
    window.BannerCarousel = BannerCarousel;
}
