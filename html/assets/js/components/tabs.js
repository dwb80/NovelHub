/**
 * Tabs Component - NovelHub
 * 标签页切换组件
 * @version 2.0.0
 */

class TabsManager {
    constructor() {
        this.instances = new Map();
        this.init();
    }

    init() {
        // 自动初始化所有带有 data-tabs 属性的元素
        document.querySelectorAll('[data-tabs]').forEach(container => {
            this.create(container);
        });
    }

    create(container, options = {}) {
        const id = container.id || `tabs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const config = {
            activeClass: 'active',
            tabSelector: '[data-tab]',
            panelSelector: '[data-tab-panel]',
            animation: true,
            animationDuration: 300,
            onChange: null,
            ...options
        };

        const instance = {
            id,
            container,
            config,
            tabs: [],
            panels: [],
            activeTab: null
        };

        this.instances.set(id, instance);
        this.setup(instance);
        
        return id;
    }

    setup(instance) {
        const { container, config } = instance;
        
        // 获取所有标签和面板
        instance.tabs = Array.from(container.querySelectorAll(config.tabSelector));
        instance.panels = Array.from(container.querySelectorAll(config.panelSelector));

        // 绑定点击事件
        instance.tabs.forEach((tab, index) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.activate(instance.id, index);
            });

            // 支持键盘导航
            tab.addEventListener('keydown', (e) => {
                this.handleKeydown(instance.id, e);
            });

            // 设置 ARIA 属性
            tab.setAttribute('role', 'tab');
            tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            const panel = instance.panels[index];
            if (panel) {
                const panelId = panel.id || `${instance.id}_panel_${index}`;
                panel.id = panelId;
                tab.setAttribute('aria-controls', panelId);
                panel.setAttribute('role', 'tabpanel');
                panel.setAttribute('aria-labelledby', tab.id || `${instance.id}_tab_${index}`);
                if (!tab.id) tab.id = `${instance.id}_tab_${index}`;
            }
        });

        // 初始化第一个标签为激活状态
        if (instance.tabs.length > 0 && !instance.tabs.some(t => t.classList.contains(config.activeClass))) {
            this.activate(instance.id, 0);
        } else {
            // 找到当前激活的标签
            const activeIndex = instance.tabs.findIndex(t => t.classList.contains(config.activeClass));
            if (activeIndex !== -1) {
                instance.activeTab = activeIndex;
                this.updatePanels(instance);
            }
        }
    }

    activate(instanceId, index) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        const { config, tabs, panels } = instance;
        
        if (index < 0 || index >= tabs.length) return;
        if (instance.activeTab === index) return;

        const previousIndex = instance.activeTab;
        instance.activeTab = index;

        // 更新标签状态
        tabs.forEach((tab, i) => {
            const isActive = i === index;
            tab.classList.toggle(config.activeClass, isActive);
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // 更新面板显示
        this.updatePanels(instance, config.animation);

        // 触发回调
        if (typeof config.onChange === 'function') {
            config.onChange(index, previousIndex, instance);
        }

        // 触发自定义事件
        container.dispatchEvent(new CustomEvent('tabs:change', {
            detail: { index, previousIndex, instance }
        }));
    }

    updatePanels(instance, animate = false) {
        const { config, panels, activeTab } = instance;

        panels.forEach((panel, index) => {
            const isActive = index === activeTab;
            
            if (animate && config.animation) {
                if (isActive) {
                    panel.style.display = 'block';
                    panel.style.opacity = '0';
                    panel.style.transform = 'translateY(10px)';
                    
                    requestAnimationFrame(() => {
                        panel.style.transition = `opacity ${config.animationDuration}ms ease, transform ${config.animationDuration}ms ease`;
                        panel.style.opacity = '1';
                        panel.style.transform = 'translateY(0)';
                    });

                    setTimeout(() => {
                        panel.style.transition = '';
                    }, config.animationDuration);
                } else {
                    if (panel.style.display !== 'none') {
                        panel.style.transition = `opacity ${config.animationDuration}ms ease, transform ${config.animationDuration}ms ease`;
                        panel.style.opacity = '0';
                        panel.style.transform = 'translateY(-10px)';
                        
                        setTimeout(() => {
                            panel.style.display = 'none';
                            panel.style.transition = '';
                        }, config.animationDuration);
                    }
                }
            } else {
                panel.style.display = isActive ? 'block' : 'none';
            }

            panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });
    }

    handleKeydown(instanceId, event) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        const { tabs, activeTab } = instance;
        let newIndex = activeTab;

        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = activeTab > 0 ? activeTab - 1 : tabs.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = activeTab < tabs.length - 1 ? activeTab + 1 : 0;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = tabs.length - 1;
                break;
            default:
                return;
        }

        this.activate(instanceId, newIndex);
        tabs[newIndex].focus();
    }

    destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;

        // 清理事件监听
        instance.tabs.forEach(tab => {
            tab.replaceWith(tab.cloneNode(true));
        });

        this.instances.delete(instanceId);
    }

    getActiveIndex(instanceId) {
        const instance = this.instances.get(instanceId);
        return instance ? instance.activeTab : -1;
    }
}

// 创建全局实例
const tabsManager = new TabsManager();

// 导出
export { TabsManager, tabsManager };
export default tabsManager;

// 兼容全局使用
if (typeof window !== 'undefined') {
    window.TabsManager = TabsManager;
    window.tabsManager = tabsManager;
}
