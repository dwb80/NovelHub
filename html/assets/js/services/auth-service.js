/**
 * Auth Service
 * NovelHub - 认证服务
 * 支持模拟登录流程、本地存储用户状态、会话管理
 * @version 1.0.0
 */

class AuthService {
    constructor() {
        this.STORAGE_KEYS = {
            TOKEN: 'novelhub_token',
            USER: 'novelhub_user',
            SESSION: 'novelhub_session',
            REMEMBER_ME: 'novelhub_remember_me',
            LOGIN_TIME: 'novelhub_login_time',
            LAST_ACTIVITY: 'novelhub_last_activity'
        };
        
        this.SESSION_DURATION = 24 * 60 * 60 * 1000; // 24小时
        this.REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30天
        
        this.currentUser = null;
        this.isAuthenticated = false;
        this.listeners = [];
        
        this.init();
    }

    // 初始化
    init() {
        this.checkSession();
        this.startActivityTracker();
    }

    // 检查会话状态
    checkSession() {
        const token = this.getToken();
        const user = this.getStoredUser();
        const session = this.getSession();
        
        if (!token || !user) {
            this.logout();
            return false;
        }

        // 检查会话是否过期
        if (session && session.expiresAt) {
            const now = Date.now();
            if (now > session.expiresAt) {
                this.logout();
                return false;
            }
        }

        this.currentUser = user;
        this.isAuthenticated = true;
        this.updateLastActivity();
        
        return true;
    }

    // 登录
    async login(credentials) {
        const { email, password, rememberMe = false } = credentials;
        
        // 验证输入
        if (!email || !password) {
            // 修复：统一使用 Toast 显示错误
            this.showToast('请输入邮箱和密码', 'error');
            return {
                success: false,
                error: '请输入邮箱和密码'
            };
        }

        // 模拟API调用延迟
        await this.simulateNetworkDelay(800);

        // 模拟用户验证
        const user = await this.validateCredentials(email, password);
        
        if (!user) {
            // 修复：统一使用 Toast 显示错误
            this.showToast('邮箱或密码错误', 'error');
            return {
                success: false,
                error: '邮箱或密码错误'
            };
        }

        // 生成令牌
        const token = this.generateToken();
        
        // 设置会话
        const sessionDuration = rememberMe ? this.REMEMBER_ME_DURATION : this.SESSION_DURATION;
        const session = {
            token,
            userId: user.id,
            createdAt: Date.now(),
            expiresAt: Date.now() + sessionDuration,
            rememberMe
        };

        // 存储数据
        this.setToken(token, rememberMe);
        this.setUser(user, rememberMe);
        this.setSession(session, rememberMe);
        
        if (rememberMe) {
            localStorage.setItem(this.STORAGE_KEYS.REMEMBER_ME, 'true');
        }

        // 更新状态
        this.currentUser = user;
        this.isAuthenticated = true;
        this.updateLastActivity();

        // 触发登录事件
        this.emit('login', { user, rememberMe });
        
        // 修复：统一使用 Toast 显示成功消息
        this.showToast('登录成功！欢迎回来', 'success');

        return {
            success: true,
            user,
            message: '登录成功'
        };
    }

    // 注册
    async register(userData) {
        const { username, email, password } = userData;

        // 验证输入
        if (!username || !email || !password) {
            return {
                success: false,
                error: '请填写所有必填项'
            };
        }

        // 模拟API调用延迟
        await this.simulateNetworkDelay(1200);

        // 检查邮箱是否已存在
        const existingUsers = this.getMockUsers();
        if (existingUsers.some(u => u.email === email)) {
            return {
                success: false,
                error: '该邮箱已被注册'
            };
        }

        // 创建新用户
        const newUser = {
            id: this.generateUserId(),
            username,
            email,
            avatar: this.generateAvatar(username),
            role: 'human',
            createdAt: new Date().toISOString(),
            stats: {
                novelsRead: 0,
                chaptersRead: 0,
                bookmarks: 0,
                reviews: 0
            }
        };

        // 存储到本地模拟数据库
        this.saveMockUser({ ...newUser, password });

        // 触发注册事件
        this.emit('register', { user: newUser });

        return {
            success: true,
            user: newUser,
            message: '注册成功，请登录'
        };
    }

    // 登出
    logout() {
        // 清除存储
        localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(this.STORAGE_KEYS.USER);
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        localStorage.removeItem(this.STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(this.STORAGE_KEYS.LOGIN_TIME);
        
        sessionStorage.removeItem(this.STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(this.STORAGE_KEYS.USER);
        sessionStorage.removeItem(this.STORAGE_KEYS.SESSION);

        // 更新状态
        const previousUser = this.currentUser;
        this.currentUser = null;
        this.isAuthenticated = false;

        // 触发登出事件
        this.emit('logout', { user: previousUser });

        return { success: true };
    }

    // 验证凭据
    async validateCredentials(email, password) {
        // 检查演示账户
        if (email === 'demo@novelhub.com' && password === 'demo123456') {
            return {
                id: 'demo-user-001',
                username: '演示用户',
                email: 'demo@novelhub.com',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
                role: 'human',
                stats: {
                    novelsRead: 12,
                    chaptersRead: 156,
                    bookmarks: 8,
                    reviews: 5
                }
            };
        }

        // 检查模拟用户
        const users = this.getMockUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    }

    // 获取当前用户
    getCurrentUser() {
        if (!this.isAuthenticated) {
            return null;
        }
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.isAuthenticated && this.checkSession();
    }

    // 更新用户信息
    updateUser(updates) {
        if (!this.currentUser) return false;

        this.currentUser = { ...this.currentUser, ...updates };
        this.setUser(this.currentUser, this.isRememberMe());
        
        this.emit('userUpdated', { user: this.currentUser });
        return true;
    }

    // 刷新令牌
    async refreshToken() {
        if (!this.isAuthenticated) return false;

        const newToken = this.generateToken();
        const rememberMe = this.isRememberMe();
        
        this.setToken(newToken, rememberMe);
        
        const session = this.getSession();
        if (session) {
            const duration = rememberMe ? this.REMEMBER_ME_DURATION : this.SESSION_DURATION;
            session.token = newToken;
            session.expiresAt = Date.now() + duration;
            this.setSession(session, rememberMe);
        }

        return true;
    }

    // 获取登录状态
    getAuthState() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.currentUser,
            session: this.getSession()
        };
    }

    // 获取令牌
    getToken() {
        return localStorage.getItem(this.STORAGE_KEYS.TOKEN) || 
               sessionStorage.getItem(this.STORAGE_KEYS.TOKEN);
    }

    // 设置令牌
    setToken(token, persistent = false) {
        if (persistent) {
            localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
        } else {
            sessionStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
        }
    }

    // 获取存储的用户
    getStoredUser() {
        const userData = localStorage.getItem(this.STORAGE_KEYS.USER) || 
                        sessionStorage.getItem(this.STORAGE_KEYS.USER);
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // 设置用户
    setUser(user, persistent = false) {
        const userData = JSON.stringify(user);
        if (persistent) {
            localStorage.setItem(this.STORAGE_KEYS.USER, userData);
        } else {
            sessionStorage.setItem(this.STORAGE_KEYS.USER, userData);
        }
    }

    // 获取会话
    getSession() {
        const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION) || 
                           sessionStorage.getItem(this.STORAGE_KEYS.SESSION);
        if (sessionData) {
            try {
                return JSON.parse(sessionData);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // 设置会话
    setSession(session, persistent = false) {
        const sessionData = JSON.stringify(session);
        if (persistent) {
            localStorage.setItem(this.STORAGE_KEYS.SESSION, sessionData);
        } else {
            sessionStorage.setItem(this.STORAGE_KEYS.SESSION, sessionData);
        }
    }

    // 检查是否记住我
    isRememberMe() {
        return localStorage.getItem(this.STORAGE_KEYS.REMEMBER_ME) === 'true';
    }

    // 更新最后活动时间
    updateLastActivity() {
        localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }

    // 启动活动追踪
    startActivityTracker() {
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated) {
                    this.updateLastActivity();
                }
            }, { passive: true });
        });

        // 定期检查会话
        setInterval(() => {
            if (this.isAuthenticated) {
                this.checkSession();
            }
        }, 60000); // 每分钟检查一次
    }

    // 生成令牌
    generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 生成用户ID
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 生成头像
    generateAvatar(username) {
        const seed = encodeURIComponent(username);
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }

    // 模拟网络延迟
    simulateNetworkDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取模拟用户列表
    getMockUsers() {
        const users = localStorage.getItem('novelhub_mock_users');
        if (users) {
            return JSON.parse(users);
        }
        return this.getDefaultMockUsers();
    }

    // 保存模拟用户
    saveMockUser(user) {
        const users = this.getMockUsers();
        users.push(user);
        localStorage.setItem('novelhub_mock_users', JSON.stringify(users));
    }

    // 默认模拟用户
    getDefaultMockUsers() {
        const defaultUsers = [
            {
                id: 'user-001',
                username: '测试用户',
                email: 'test@novelhub.com',
                password: 'test123456',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
                role: 'human',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('novelhub_mock_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    // 事件系统
    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    off(event, callback) {
        this.listeners = this.listeners.filter(
            l => !(l.event === event && l.callback === callback)
        );
    }

    emit(event, data) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => {
                try {
                    l.callback(data);
                } catch (e) {
                    // 使用日志系统记录错误
                    if (typeof window !== 'undefined' && window.NovelHubLogger) {
                        window.NovelHubLogger.logger.error('认证事件监听器错误:', e.message);
                    }
                }
            });
    }

    // 社交登录（模拟）
    async socialLogin(provider) {
        await this.simulateNetworkDelay(1000);
        
        // 模拟社交登录
        const socialUser = {
            id: `${provider}-user-${Date.now()}`,
            username: `${provider}用户`,
            email: `user@${provider}.com`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
            role: 'human',
            provider,
            stats: {
                novelsRead: 0,
                chaptersRead: 0,
                bookmarks: 0,
                reviews: 0
            }
        };

        const token = this.generateToken();
        this.setToken(token, true);
        this.setUser(socialUser, true);

        this.currentUser = socialUser;
        this.isAuthenticated = true;

        this.emit('login', { user: socialUser, provider });

        return {
            success: true,
            user: socialUser,
            message: `${provider} 登录成功`
        };
    }

    // 修改密码
    async changePassword(currentPassword, newPassword) {
        if (!this.isAuthenticated) {
            return { success: false, error: '请先登录' };
        }

        await this.simulateNetworkDelay(800);

        // 验证当前密码
        const users = this.getMockUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1 || users[userIndex].password !== currentPassword) {
            return { success: false, error: '当前密码错误' };
        }

        // 更新密码
        users[userIndex].password = newPassword;
        localStorage.setItem('novelhub_mock_users', JSON.stringify(users));

        return { success: true, message: '密码修改成功' };
    }

    // 重置密码请求
    async requestPasswordReset(email) {
        await this.simulateNetworkDelay(1000);

        const users = this.getMockUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            // 为了安全，不透露邮箱是否存在
            return { success: true, message: '如果该邮箱存在，我们将发送重置链接' };
        }

        // 生成重置令牌
        const resetToken = this.generateToken();
        localStorage.setItem(`novelhub_reset_${email}`, JSON.stringify({
            token: resetToken,
            expiresAt: Date.now() + 3600000 // 1小时有效
        }));

        return { 
            success: true, 
            message: '重置链接已发送到您的邮箱',
            resetToken // 实际应用中不会返回给前端
        };
    }

    // 修复：统一使用 Toast 显示消息
    showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else if (typeof window.showError === 'function' && type === 'error') {
            window.showError(message);
        } else if (typeof window.showSuccess === 'function' && type === 'success') {
            window.showSuccess(message);
        }
    }
}

// 创建单例
const authService = new AuthService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthService, authService };
}

if (typeof window !== 'undefined') {
    window.AuthService = AuthService;
    window.authService = authService;
}
