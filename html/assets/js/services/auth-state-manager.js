/**
 * AuthStateManager - 统一认证状态管理器
 * 修复UX-P0-001: 登录状态同步不一致
 */
class AuthStateManager {
    constructor() {
        this.STORAGE_KEYS = {
            TOKEN: 'novelhub_token',
            USER: 'novelhub_user',
            SESSION: 'novelhub_session',
            LAST_SYNC: 'novelhub_last_sync'
        };

        this.state = {
            isAuthenticated: false,
            user: null,
            isLoading: false
        };

        this.listeners = [];
        this.syncInterval = null;

        this.init();
    }

    init() {
        this.syncState();
        this.setupCrossTabSync();
        this.setupPeriodicSync();
        this.setupVisibilitySync();
    }

    // 同步状态
    syncState() {
        const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
        const userStr = localStorage.getItem(this.STORAGE_KEYS.USER);

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                this.state = {
                    isAuthenticated: true,
                    user: user,
                    isLoading: false
                };
            } catch (e) {
                this.clearState();
            }
        } else {
            this.state = {
                isAuthenticated: false,
                user: null,
                isLoading: false
            };
        }

        this.notifyListeners();
        this.updateUI();
    }

    // 跨标签页同步
    setupCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (Object.values(this.STORAGE_KEYS).includes(e.key)) {
                this.syncState();
            }
        });
    }

    // 定期同步
    setupPeriodicSync() {
        this.syncInterval = setInterval(() => {
            this.syncState();
        }, 30000);
    }

    // 页面可见性变化时同步
    setupVisibilitySync() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.syncState();
            }
        });
    }

    // 清除状态
    clearState() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.state = {
            isAuthenticated: false,
            user: null,
            isLoading: false
        };
        this.notifyListeners();
        this.updateUI();
    }

    // 设置登录状态
    setLoggedIn(user, token) {
        localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString());
        this.syncState();
    }

    // 设置登出状态
    setLoggedOut() {
        this.clearState();
    }

    // 更新用户信息
    updateUser(userData) {
        if (this.state.user) {
            const updatedUser = { ...this.state.user, ...userData };
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
            this.syncState();
        }
    }

    // 更新UI
    updateUI() {
        this.updateNavbarUI();
        this.updateSidebarUI();
    }

    // 更新导航栏UI
    updateNavbarUI() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const authSection = navbar.querySelector('.navbar-auth') || navbar.querySelector('.auth-section');
        if (!authSection) return;

        if (this.state.isAuthenticated && this.state.user) {
            authSection.innerHTML = `
                <div class="user-menu">
                    <button class="user-menu-trigger">
                        <img src="${this.state.user.avatar || 'assets/images/default-avatar.png'}" 
                             alt="${this.state.user.username}" class="user-avatar">
                        <span class="user-name">${this.state.user.username}</span>
                    </button>
                    <div class="user-dropdown">
                        <a href="profile.html">个人中心</a>
                        <a href="bookshelf.html">我的书架</a>
                        <a href="settings.html">账号设置</a>
                        <hr>
                        <a href="#" class="logout-link">退出登录</a>
                    </div>
                </div>
            `;

            // 绑定退出登录事件
            const logoutLink = authSection.querySelector('.logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        } else {
            authSection.innerHTML = `
                <a href="login.html" class="btn btn-outline">登录</a>
                <a href="register.html" class="btn btn-primary">注册</a>
            `;
        }
    }

    // 更新侧边栏UI
    updateSidebarUI() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        const userSection = sidebar.querySelector('.sidebar-user');
        if (!userSection) return;

        if (this.state.isAuthenticated && this.state.user) {
            userSection.innerHTML = `
                <div class="user-info">
                    <img src="${this.state.user.avatar || 'assets/images/default-avatar.png'}" 
                         alt="${this.state.user.username}" class="user-avatar-large">
                    <h4 class="user-name">${this.state.user.username}</h4>
                    <p class="user-level">${this.state.user.level || '普通用户'}</p>
                </div>
            `;
        } else {
            userSection.innerHTML = `
                <div class="guest-info">
                    <div class="guest-avatar">
                        <i class="icon-user"></i>
                    </div>
                    <p>登录后享受更多功能</p>
                    <a href="login.html" class="btn btn-primary btn-sm">立即登录</a>
                </div>
            `;
        }
    }

    // 退出登录
    async logout() {
        try {
            if (window.authService && typeof window.authService.logout === 'function') {
                await window.authService.logout();
            }
        } catch (e) {
            // 使用日志系统记录警告
            if (typeof window !== 'undefined' && window.NovelHubLogger) {
                window.NovelHubLogger.logger.warn('退出登录API调用失败:', e.message);
            }
        }
        this.setLoggedOut();
    }

    // 添加状态监听器
    addListener(callback) {
        this.listeners.push(callback);
        callback(this.state);
    }

    // 移除状态监听器
    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    // 通知所有监听器
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.state);
            } catch (e) {
                // 使用日志系统记录错误
                if (typeof window !== 'undefined' && window.NovelHubLogger) {
                    window.NovelHubLogger.logger.error('认证状态监听器错误:', e.message);
                }
            }
        });
    }

    // 获取当前状态
    getState() {
        return { ...this.state };
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.state.isAuthenticated;
    }

    // 获取当前用户
    getCurrentUser() {
        return this.state.user;
    }
}

// 创建全局实例
const authStateManager = new AuthStateManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthStateManager, authStateManager };
} else {
    window.AuthStateManager = AuthStateManager;
    window.authStateManager = authStateManager;
}
