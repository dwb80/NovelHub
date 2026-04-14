import { showToast, showSuccess, showError } from './components/toast.js';

// 修复：统一 localStorage 键名前缀（与 auth-state-manager.js 保持一致）
const STORAGE_KEYS = {
    TOKEN: 'novelhub_token',
    USER: 'novelhub_user'
};

/**
 * 初始化认证状态
 * 使用 authStateManager 进行统一状态管理
 */
export function initAuth() {
    // 兼容旧键名数据迁移
    migrateLegacyData();
    
    // 使用统一的状态管理器
    if (window.authStateManager) {
        window.authStateManager.syncState();
    } else {
        // 降级处理：如果状态管理器未加载，使用传统方式
        initAuthLegacy();
    }
}

/**
 * 迁移旧数据格式
 */
function migrateLegacyData() {
    const oldToken = localStorage.getItem('token');
    const oldUser = localStorage.getItem('user');
    
    if (oldToken && !localStorage.getItem(STORAGE_KEYS.TOKEN)) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, oldToken);
        localStorage.removeItem('token');
    }
    
    if (oldUser && !localStorage.getItem(STORAGE_KEYS.USER)) {
        localStorage.setItem(STORAGE_KEYS.USER, oldUser);
        localStorage.removeItem('user');
    }
}

/**
 * 传统认证初始化（降级方案）
 */
function initAuthLegacy() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (token && user) {
        try {
            const userData = JSON.parse(user);
            updateUserMenu(userData);
        } catch (e) {
            // 修复：统一使用 Toast 显示错误
            showError('登录状态已过期，请重新登录');
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    }
}

/**
 * 更新用户菜单UI
 */
function updateUserMenu(user) {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
        userMenu.innerHTML = `
            <div class="dropdown" id="userDropdown">
                <button class="user-avatar-btn" id="userAvatarBtn">
                    <span class="avatar avatar-sm">${user.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                    <span class="user-name">${user.username || '用户'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                <div class="dropdown-menu">
                    <a href="pages/user/settings.html" class="dropdown-item">
                        <span>账号设置</span>
                    </a>
                    <a href="pages/user/bookshelf.html" class="dropdown-item">
                        <span>我的书架</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item text-danger" id="logoutBtn">
                        <span>退出登录</span>
                    </a>
                </div>
            </div>
        `;

        // 绑定下拉菜单事件
        const avatarBtn = document.getElementById('userAvatarBtn');
        const dropdown = document.getElementById('userDropdown');
        
        if (avatarBtn && dropdown) {
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        }

        // 绑定退出登录
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    }
}

/**
 * 处理登录
 */
export async function handleLogin(email, password, remember = false) {
    try {
        const response = await mockLoginAPI(email, password);
        
        if (response.success) {
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem(STORAGE_KEYS.TOKEN, response.token);
            storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            
            // 使用统一状态管理器
            if (window.authStateManager) {
                window.authStateManager.setLoggedIn(response.user, response.token);
            }
            
            // 修复：统一使用 Toast 显示成功消息
            showSuccess('登录成功！欢迎回来');
            
            // 使用常量避免魔法数字
            const redirectDelay = (typeof window !== 'undefined' && window.NovelHubConstants)
                ? window.NovelHubConstants.NUMERIC_CONSTANTS.DELAY_REDIRECT
                : 1500;
            setTimeout(() => {
                const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
                window.location.href = redirect;
            }, redirectDelay);
            
            return true;
        } else {
            // 修复：统一使用 Toast 显示错误
            showError(response.message || '登录失败，请检查邮箱和密码');
            return false;
        }
    } catch (error) {
        // 使用日志系统记录错误（生产环境不输出）
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.error('登录失败:', error.message);
        }
        // 修复：统一使用 Toast 显示错误
        showError('网络错误，请稍后重试');
        return false;
    }
}

/**
 * 处理注册
 */
export async function handleRegister(username, email, password) {
    try {
        const response = await mockRegisterAPI(username, email, password);
        
        if (response.success) {
            // 修复：统一使用 Toast 显示成功消息
            showSuccess('注册成功！请登录');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            
            return true;
        } else {
            // 修复：统一使用 Toast 显示错误
            showError(response.message || '注册失败，请稍后重试');
            return false;
        }
    } catch (error) {
        // 使用日志系统记录错误（生产环境不输出）
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.error('注册失败:', error.message);
        }
        // 修复：统一使用 Toast 显示错误
        showError('网络错误，请稍后重试');
        return false;
    }
}

/**
 * 处理退出登录
 */
export async function handleLogout() {
    try {
        // 调用API退出登录
        await mockLogoutAPI();
    } catch (e) {
        // 使用日志系统记录警告（生产环境不输出）
        if (typeof window !== 'undefined' && window.NovelHubLogger) {
            window.NovelHubLogger.logger.warn('退出登录API调用失败:', e.message);
        }
    }
    
    // 清除本地存储
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    
    // 使用统一状态管理器
    if (window.authStateManager) {
        window.authStateManager.setLoggedOut();
    }
    
    // 修复：统一使用 Toast 显示成功消息
    showSuccess('已退出登录');
    
    // 使用常量避免魔法数字
    const redirectDelay = (typeof window !== 'undefined' && window.NovelHubConstants)
        ? window.NovelHubConstants.NUMERIC_CONSTANTS.DELAY_LONG
        : 1000;
    setTimeout(() => {
        window.location.href = 'index.html';
    }, redirectDelay);
}

/**
 * 检查登录状态
 */
export function checkAuth() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
}

/**
 * 获取当前用户
 */
export function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * 要求登录
 */
export function requireAuth(redirectUrl = window.location.href) {
    if (!checkAuth()) {
        // 修复：统一使用 Toast 显示提示
        showError('请先登录');
        setTimeout(() => {
            window.location.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
        }, 1500);
        return false;
    }
    return true;
}

// 模拟API调用
function mockLoginAPI(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 模拟验证
            if (email && password.length >= 6) {
                resolve({
                    success: true,
                    token: 'mock_token_' + Date.now(),
                    user: {
                        id: 1,
                        username: email.split('@')[0],
                        email: email,
                        avatar: null,
                        level: '普通用户'
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: '邮箱或密码错误'
                });
            }
        }, 500);
    });
}

function mockRegisterAPI(username, email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (username && email && password.length >= 6) {
                resolve({
                    success: true,
                    message: '注册成功'
                });
            } else {
                resolve({
                    success: false,
                    message: '请填写完整信息'
                });
            }
        }, 500);
    });
}

function mockLogoutAPI() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 200);
    });
}