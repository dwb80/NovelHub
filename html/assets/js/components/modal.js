/**
 * Modal Component - NovelHub
 * 模态框组件
 * @version 2.0.0
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.previousActiveElement = null;
        
        // 绑定键盘事件
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleBackdropClick = this.handleBackdropClick.bind(this);
        
        document.addEventListener('keydown', this.handleKeydown);
        
        // 自动初始化
        this.init();
    }

    init() {
        // 自动初始化所有带有 data-modal 属性的元素
        document.querySelectorAll('[data-modal]').forEach(modal => {
            const id = modal.id || `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!modal.id) modal.id = id;
            this.register(id, modal);
        });

        // 绑定触发按钮
        document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
            const modalId = trigger.dataset.modalTrigger;
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(modalId);
            });
        });

        // 绑定关闭按钮
        document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = closeBtn.closest('[data-modal]')?.id;
                if (modalId) {
                    this.close(modalId);
                } else if (this.activeModal) {
                    this.close(this.activeModal);
                }
            });
        });
    }

    register(id, element, options = {}) {
        const modal = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!modal) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error(`模态框元素未找到: ${element}`);
            }
            return null;
        }

        // 使用常量避免魔法数字
        const constants = (typeof window !== 'undefined' && window.NovelHubConstants)
            ? window.NovelHubConstants.NUMERIC_CONSTANTS
            : { MODAL_ANIMATION_DURATION: 300, MODAL_Z_INDEX: 1000 };

        const config = {
            closeOnBackdrop: true,
            closeOnEscape: true,
            focusTrap: true,
            animation: true,
            animationDuration: constants.MODAL_ANIMATION_DURATION || 300,
            onOpen: null,
            onClose: null,
            zIndex: constants.MODAL_Z_INDEX || 1000,
            ...options
        };

        // 确保模态框有正确的结构
        this.ensureModalStructure(modal);

        const instance = {
            id,
            element: modal,
            config,
            isOpen: false,
            focusableContent: []
        };

        this.modals.set(id, instance);

        // 绑定背景点击事件
        if (config.closeOnBackdrop) {
            modal.addEventListener('click', this.handleBackdropClick);
        }

        return id;
    }

    ensureModalStructure(modal) {
        // 确保模态框有 overlay 结构
        if (!modal.classList.contains('modal-overlay')) {
            modal.classList.add('modal-overlay');
        }

        // 确保有 modal 内容容器
        let content = modal.querySelector('.modal');
        if (!content) {
            // 将现有内容包装在 modal 容器中
            const children = Array.from(modal.children);
            content = document.createElement('div');
            content.className = 'modal';
            children.forEach(child => content.appendChild(child));
            modal.appendChild(content);
        }

        // 设置 ARIA 属性
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        // 确保有标题
        const title = modal.querySelector('.modal-title, h1, h2, h3');
        if (title && !modal.getAttribute('aria-labelledby')) {
            if (!title.id) title.id = `${modal.id}_title`;
            modal.setAttribute('aria-labelledby', title.id);
        }

        // 确保初始状态是隐藏的
        modal.style.display = 'none';
        modal.classList.remove('active');
    }

    open(id, options = {}) {
        const instance = this.modals.get(id);
        if (!instance) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error(`模态框未找到: ${id}`);
            }
            return Promise.reject(new Error(`Modal not found: ${id}`));
        }

        if (instance.isOpen) {
            return Promise.resolve();
        }

        // 保存当前焦点元素
        this.previousActiveElement = document.activeElement;

        // 关闭其他打开的模态框
        if (this.activeModal && this.activeModal !== id) {
            this.close(this.activeModal);
        }

        instance.isOpen = true;
        this.activeModal = id;

        const { element, config } = instance;

        // 显示模态框
        element.style.display = 'flex';
        element.style.zIndex = config.zIndex;

        // 获取可聚焦元素
        instance.focusableContent = Array.from(
            element.querySelectorAll(this.focusableElements)
        );

        // 触发动画
        if (config.animation) {
            requestAnimationFrame(() => {
                element.classList.add('active');
            });
        } else {
            element.classList.add('active');
        }

        // 禁止背景滚动
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');

        // 聚焦到第一个可聚焦元素或模态框本身
        if (config.focusTrap) {
            setTimeout(() => {
                const firstFocusable = instance.focusableContent[0];
                if (firstFocusable) {
                    firstFocusable.focus();
                } else {
                    element.focus();
                }
            }, config.animation ? config.animationDuration : 0);
        }

        // 触发回调
        if (typeof config.onOpen === 'function') {
            config.onOpen(instance, options);
        }

        // 触发自定义事件
        element.dispatchEvent(new CustomEvent('modal:open', {
            detail: { instance, options }
        }));

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(instance);
            }, config.animation ? config.animationDuration : 0);
        });
    }

    close(id, result = null) {
        const instance = this.modals.get(id);
        if (!instance || !instance.isOpen) {
            return Promise.resolve();
        }

        const { element, config } = instance;

        instance.isOpen = false;
        
        if (this.activeModal === id) {
            this.activeModal = null;
        }

        // 触发动画
        if (config.animation) {
            element.classList.remove('active');
        } else {
            element.classList.remove('active');
            element.style.display = 'none';
        }

        // 恢复背景滚动
        if (!this.activeModal) {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }

        // 恢复焦点
        if (this.previousActiveElement && config.focusTrap) {
            this.previousActiveElement.focus();
        }

        // 触发回调
        if (typeof config.onClose === 'function') {
            config.onClose(instance, result);
        }

        // 触发自定义事件
        element.dispatchEvent(new CustomEvent('modal:close', {
            detail: { instance, result }
        }));

        return new Promise(resolve => {
            if (config.animation) {
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve(instance);
                }, config.animationDuration);
            } else {
                resolve(instance);
            }
        });
    }

    toggle(id) {
        const instance = this.modals.get(id);
        if (instance && instance.isOpen) {
            return this.close(id);
        } else {
            return this.open(id);
        }
    }

    handleKeydown(event) {
        if (!this.activeModal) return;

        const instance = this.modals.get(this.activeModal);
        if (!instance) return;

        const { config, focusableContent } = instance;

        switch (event.key) {
            case 'Escape':
                if (config.closeOnEscape) {
                    event.preventDefault();
                    this.close(this.activeModal);
                }
                break;

            case 'Tab':
                if (config.focusTrap && focusableContent.length > 0) {
                    this.handleTabKey(instance, event);
                }
                break;
        }
    }

    handleTabKey(instance, event) {
        const { focusableContent } = instance;
        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    handleBackdropClick(event) {
        // 只有点击背景时才关闭
        if (event.target === event.currentTarget) {
            const modalId = event.currentTarget.id;
            const instance = this.modals.get(modalId);
            if (instance && instance.config.closeOnBackdrop) {
                this.close(modalId);
            }
        }
    }

    create(options = {}) {
        const {
            title = '',
            content = '',
            footer = '',
            size = 'medium', // small, medium, large, full
            ...config
        } = options;

        const id = `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const modalHTML = `
            <div id="${id}" class="modal-overlay" data-modal>
                <div class="modal modal-${size}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" data-modal-close aria-label="关闭">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        `;

        // 插入到 body
        const wrapper = document.createElement('div');
        wrapper.innerHTML = modalHTML;
        const modal = wrapper.firstElementChild;
        document.body.appendChild(modal);

        // 注册并返回控制对象
        this.register(id, modal, config);

        return {
            id,
            open: () => this.open(id),
            close: (result) => this.close(id, result),
            toggle: () => this.toggle(id),
            destroy: () => this.destroy(id),
            element: modal
        };
    }

    destroy(id) {
        const instance = this.modals.get(id);
        if (!instance) return;

        // 如果正在打开，先关闭
        if (instance.isOpen) {
            this.close(id);
        }

        // 移除事件监听
        instance.element.removeEventListener('click', this.handleBackdropClick);

        // 从 DOM 中移除
        instance.element.remove();

        // 从管理中移除
        this.modals.delete(id);
    }

    // 快捷方法：确认对话框
    confirm(options = {}) {
        const {
            title = '确认',
            message = '确定要执行此操作吗？',
            confirmText = '确定',
            cancelText = '取消',
            onConfirm,
            onCancel,
            type = 'warning' // info, success, warning, error
        } = options;

        const icons = {
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        };

        const footer = `
            <button class="btn-secondary" data-modal-close>${cancelText}</button>
            <button class="btn-primary btn-${type}" id="${id}_confirm">${confirmText}</button>
        `;

        const modal = this.create({
            title,
            content: `
                <div class="modal-confirm-content">
                    <div class="confirm-icon confirm-${type}">${icons[type]}</div>
                    <p class="confirm-message">${message}</p>
                </div>
            `,
            footer,
            size: 'small'
        });

        // 绑定确认按钮
        const confirmBtn = modal.element.querySelector(`#${modal.id}_confirm`);
        confirmBtn.addEventListener('click', () => {
            modal.close('confirm');
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });

        // 绑定取消
        modal.element.addEventListener('modal:close', (e) => {
            if (e.detail.result !== 'confirm' && typeof onCancel === 'function') {
                onCancel();
            }
        });

        modal.open();
        return modal;
    }

    // 快捷方法：提示对话框
    alert(options = {}) {
        const {
            title = '提示',
            message = '',
            confirmText = '确定',
            onConfirm,
            type = 'info'
        } = options;

        const footer = `
            <button class="btn-primary" id="${id}_confirm">${confirmText}</button>
        `;

        const modal = this.create({
            title,
            content: `<p>${message}</p>`,
            footer,
            size: 'small'
        });

        const confirmBtn = modal.element.querySelector(`#${modal.id}_confirm`);
        confirmBtn.addEventListener('click', () => {
            modal.close('confirm');
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });

        modal.open();
        return modal;
    }
}

// 创建全局实例
const modalManager = new ModalManager();

// 导出
export { ModalManager, modalManager };
export default modalManager;

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.ModalManager = ModalManager;
    window.modalManager = modalManager;
}
