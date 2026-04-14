/**
 * Dropdown Component - NovelHub
 * 下拉菜单组件
 * @version 2.0.0
 */

class DropdownManager {
    constructor() {
        this.dropdowns = new Map();
        this.activeDropdown = null;
        
        // 绑定全局事件
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        
        document.addEventListener('click', this.handleDocumentClick);
        document.addEventListener('keydown', this.handleKeydown);
        
        // 自动初始化
        this.init();
    }

    init() {
        // 自动初始化所有带有 data-dropdown 属性的元素
        document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
            const id = dropdown.id || `dropdown_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!dropdown.id) dropdown.id = id;
            this.register(id, dropdown);
        });

        // 绑定触发按钮
        document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
            const dropdownId = trigger.dataset.dropdownTrigger;
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle(dropdownId);
            });
        });
    }

    register(id, element, options = {}) {
        const dropdown = typeof element === 'string' ? document.querySelector(element) : element;
        
        if (!dropdown) {
            // 使用日志系统记录错误
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.error(`下拉菜单元素未找到: ${element}`);
            }
            return null;
        }

        const config = {
            trigger: null, // 触发元素选择器或元素
            placement: 'bottom-end', // top-start, top-end, bottom-start, bottom-end, left, right
            offset: 8,
            closeOnClickOutside: true,
            closeOnEscape: true,
            closeOnSelect: true,
            animation: true,
            animationDuration: 200,
            onOpen: null,
            onClose: null,
            ...options
        };

        // 确保有 dropdown-menu 结构
        this.ensureDropdownStructure(dropdown);

        const instance = {
            id,
            element: dropdown,
            config,
            isOpen: false,
            trigger: null,
            menu: dropdown.querySelector('.dropdown-menu')
        };

        // 查找或设置触发元素
        if (config.trigger) {
            instance.trigger = typeof config.trigger === 'string' 
                ? document.querySelector(config.trigger) 
                : config.trigger;
        } else {
            // 查找前一个兄弟元素作为触发器
            instance.trigger = dropdown.previousElementSibling;
        }

        if (instance.trigger) {
            instance.trigger.setAttribute('aria-haspopup', 'true');
            instance.trigger.setAttribute('aria-expanded', 'false');
            instance.trigger.setAttribute('aria-controls', id);
        }

        this.dropdowns.set(id, instance);
        return id;
    }

    ensureDropdownStructure(dropdown) {
        if (!dropdown.classList.contains('dropdown')) {
            dropdown.classList.add('dropdown');
        }

        let menu = dropdown.querySelector('.dropdown-menu');
        if (!menu) {
            // 将子元素包装在 dropdown-menu 中
            const children = Array.from(dropdown.children);
            menu = document.createElement('div');
            menu.className = 'dropdown-menu';
            children.forEach(child => menu.appendChild(child));
            dropdown.appendChild(menu);
        }

        // 设置 ARIA 属性
        menu.setAttribute('role', 'menu');
        
        // 为菜单项设置 role
        menu.querySelectorAll('a, button').forEach((item, index) => {
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '-1');
            if (!item.id) item.id = `${dropdown.id}_item_${index}`;
        });
    }

    open(id) {
        const instance = this.dropdowns.get(id);
        if (!instance || instance.isOpen) return;

        // 关闭其他下拉菜单
        if (this.activeDropdown && this.activeDropdown !== id) {
            this.close(this.activeDropdown);
        }

        instance.isOpen = true;
        this.activeDropdown = id;

        const { element, menu, config, trigger } = instance;

        // 定位菜单
        this.positionMenu(instance);

        // 显示菜单
        element.classList.add('active');
        
        if (config.animation) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-8px)';
            
            requestAnimationFrame(() => {
                menu.style.transition = `opacity ${config.animationDuration}ms ease, transform ${config.animationDuration}ms ease`;
                menu.style.opacity = '1';
                menu.style.transform = 'translateY(0)';
            });
        }

        // 更新 ARIA 属性
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }

        // 聚焦到第一个菜单项
        const firstItem = menu.querySelector('[role="menuitem"]');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), config.animation ? config.animationDuration : 0);
        }

        // 触发回调
        if (typeof config.onOpen === 'function') {
            config.onOpen(instance);
        }

        // 触发自定义事件
        element.dispatchEvent(new CustomEvent('dropdown:open', {
            detail: { instance }
        }));
    }

    close(id) {
        const instance = this.dropdowns.get(id);
        if (!instance || !instance.isOpen) return;

        const { element, menu, config, trigger } = instance;

        instance.isOpen = false;
        
        if (this.activeDropdown === id) {
            this.activeDropdown = null;
        }

        // 隐藏菜单
        if (config.animation) {
            menu.style.transition = `opacity ${config.animationDuration}ms ease, transform ${config.animationDuration}ms ease`;
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-8px)';
            
            setTimeout(() => {
                element.classList.remove('active');
                menu.style.transition = '';
            }, config.animationDuration);
        } else {
            element.classList.remove('active');
        }

        // 更新 ARIA 属性
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }

        // 触发回调
        if (typeof config.onClose === 'function') {
            config.onClose(instance);
        }

        // 触发自定义事件
        element.dispatchEvent(new CustomEvent('dropdown:close', {
            detail: { instance }
        }));
    }

    toggle(id) {
        const instance = this.dropdowns.get(id);
        if (instance && instance.isOpen) {
            this.close(id);
        } else {
            this.open(id);
        }
    }

    positionMenu(instance) {
        const { element, menu, config, trigger } = instance;
        
        if (!trigger) return;

        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top, left;

        switch (config.placement) {
            case 'bottom-start':
                top = triggerRect.bottom + config.offset;
                left = triggerRect.left;
                break;
            case 'bottom-end':
                top = triggerRect.bottom + config.offset;
                left = triggerRect.right - menuRect.width;
                break;
            case 'top-start':
                top = triggerRect.top - menuRect.height - config.offset;
                left = triggerRect.left;
                break;
            case 'top-end':
                top = triggerRect.top - menuRect.height - config.offset;
                left = triggerRect.right - menuRect.width;
                break;
            case 'left':
                top = triggerRect.top;
                left = triggerRect.left - menuRect.width - config.offset;
                break;
            case 'right':
                top = triggerRect.top;
                left = triggerRect.right + config.offset;
                break;
            default:
                top = triggerRect.bottom + config.offset;
                left = triggerRect.right - menuRect.width;
        }

        // 边界检查
        if (left < 10) left = 10;
        if (left + menuRect.width > viewportWidth - 10) {
            left = viewportWidth - menuRect.width - 10;
        }
        if (top < 10) top = triggerRect.bottom + config.offset;
        if (top + menuRect.height > viewportHeight - 10) {
            top = triggerRect.top - menuRect.height - config.offset;
        }

        menu.style.position = 'fixed';
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.zIndex = '1000';
    }

    handleDocumentClick(event) {
        if (!this.activeDropdown) return;

        const instance = this.dropdowns.get(this.activeDropdown);
        if (!instance) return;

        const { element, config, trigger } = instance;

        // 检查点击是否在菜单或触发器内
        const isClickInside = element.contains(event.target) || 
                             (trigger && trigger.contains(event.target));

        if (!isClickInside && config.closeOnClickOutside) {
            this.close(this.activeDropdown);
        } else if (config.closeOnSelect && event.target.closest('[role="menuitem"]')) {
            // 点击菜单项时关闭
            this.close(this.activeDropdown);
        }
    }

    handleKeydown(event) {
        if (!this.activeDropdown) return;

        const instance = this.dropdowns.get(this.activeDropdown);
        if (!instance) return;

        const { menu, config, trigger } = instance;
        const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
        const currentIndex = items.indexOf(document.activeElement);

        switch (event.key) {
            case 'Escape':
                if (config.closeOnEscape) {
                    event.preventDefault();
                    this.close(this.activeDropdown);
                    if (trigger) trigger.focus();
                }
                break;

            case 'ArrowDown':
                event.preventDefault();
                if (currentIndex < items.length - 1) {
                    items[currentIndex + 1].focus();
                } else {
                    items[0].focus();
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1].focus();
                } else {
                    items[items.length - 1].focus();
                }
                break;

            case 'Home':
                event.preventDefault();
                items[0].focus();
                break;

            case 'End':
                event.preventDefault();
                items[items.length - 1].focus();
                break;

            case 'Tab':
                // Tab 键关闭下拉菜单
                this.close(this.activeDropdown);
                break;

            case 'Enter':
            case ' ':
                if (currentIndex !== -1) {
                    event.preventDefault();
                    items[currentIndex].click();
                }
                break;
        }
    }

    create(options = {}) {
        const {
            items = [],
            trigger,
            placement = 'bottom-end',
            ...config
        } = options;

        const id = `dropdown_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const dropdownHTML = `
            <div id="${id}" class="dropdown" data-dropdown>
                <div class="dropdown-menu">
                    ${items.map((item, index) => {
                        if (item.divider) {
                            return '<div class="dropdown-divider"></div>';
                        }
                        const icon = item.icon ? `<span class="dropdown-icon">${item.icon}</span>` : '';
                        const disabled = item.disabled ? 'disabled' : '';
                        return `
                            <${item.href ? 'a' : 'button'} 
                                class="dropdown-item ${disabled}" 
                                ${item.href ? `href="${item.href}"` : ''}
                                ${item.onClick ? `onclick="${item.onClick}"` : ''}
                                role="menuitem"
                                tabindex="-1"
                            >
                                ${icon}
                                <span>${item.text}</span>
                            </${item.href ? 'a' : 'button'}>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = dropdownHTML;
        const dropdown = wrapper.firstElementChild;
        document.body.appendChild(dropdown);

        this.register(id, dropdown, { trigger, placement, ...config });

        return {
            id,
            open: () => this.open(id),
            close: () => this.close(id),
            toggle: () => this.toggle(id),
            destroy: () => this.destroy(id),
            element: dropdown
        };
    }

    destroy(id) {
        const instance = this.dropdowns.get(id);
        if (!instance) return;

        if (instance.isOpen) {
            this.close(id);
        }

        instance.element.remove();
        this.dropdowns.delete(id);
    }

    // 更新窗口大小时重新定位
    updatePosition() {
        if (this.activeDropdown) {
            const instance = this.dropdowns.get(this.activeDropdown);
            if (instance) {
                this.positionMenu(instance);
            }
        }
    }
}

// 创建全局实例
const dropdownManager = new DropdownManager();

// 监听窗口大小变化
window.addEventListener('resize', () => {
    dropdownManager.updatePosition();
});

// 导出
export { DropdownManager, dropdownManager };
export default dropdownManager;

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.DropdownManager = DropdownManager;
    window.dropdownManager = dropdownManager;
}
