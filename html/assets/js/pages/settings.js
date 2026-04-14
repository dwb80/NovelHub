import { USER_DATA } from '../mock/data.js';
import { showToast } from '../components/toast.js';

const NOTIFICATION_CONFIG = {
    update: { label: '作品更新提醒', description: '订阅的小说有更新时推送通知' },
    comment: { label: '评论回复提醒', description: '有人回复你的评论时推送通知' },
    weekly: { label: '每周精选推荐', description: '每周为您推荐精选作品' },
    activity: { label: '平台活动通知', description: '参与平台活动获取奖励' }
};

const PRIVACY_CONFIG = {
    onlineStatus: { label: '显示在线状态', description: '允许其他用户看到您的在线状态' },
    readingHistory: { label: '公开阅读记录', description: '允许其他用户查看您的阅读历史' },
    commentPublic: { label: '公开评论内容', description: '您的评论将对所有用户可见' },
    dataAnalysis: { label: '参与数据统计', description: '帮助我们改进产品体验' }
};

export function initSettingsPage() {
    renderUserProfile();
    initNotificationSettings();
    initPrivacySettings();
    initThemeSettings();
    initDataManagement();
    initFormActions();
}

function renderUserProfile() {
    const user = USER_DATA;

    const avatarEl = document.querySelector('.user-avatar-large');
    if (avatarEl) {
        avatarEl.textContent = user.nickname.charAt(0);
    }

    document.getElementById('nickname').value = user.nickname;
    document.getElementById('email').value = user.email;
    document.getElementById('bio').value = user.bio;
}

function initNotificationSettings() {
    const container = document.getElementById('notificationSettings');
    if (!container) return;

    container.innerHTML = Object.entries(NOTIFICATION_CONFIG).map(([key, config]) => `
        <div class="setting-item">
            <div class="setting-info">
                <div class="setting-label">${config.label}</div>
                <div class="setting-description">${config.description}</div>
            </div>
            <label class="switch">
                <input type="checkbox" class="switch-input" data-setting="notification" data-key="${key}" ${USER_DATA.notificationSettings[key] ? 'checked' : ''}>
                <span class="switch-slider"></span>
            </label>
        </div>
    `).join('');

    initSwitchHandlers('notification');
}

function initPrivacySettings() {
    const container = document.getElementById('privacySettings');
    if (!container) return;

    container.innerHTML = Object.entries(PRIVACY_CONFIG).map(([key, config]) => `
        <div class="setting-item">
            <div class="setting-info">
                <div class="setting-label">${config.label}</div>
                <div class="setting-description">${config.description}</div>
            </div>
            <label class="switch">
                <input type="checkbox" class="switch-input" data-setting="privacy" data-key="${key}" ${USER_DATA.privacySettings[key] ? 'checked' : ''}>
                <span class="switch-slider"></span>
            </label>
        </div>
    `).join('');

    initSwitchHandlers('privacy');
}

function initSwitchHandlers(settingType) {
    document.querySelectorAll(`[data-setting="${settingType}"]`).forEach(input => {
        input.addEventListener('change', (e) => {
            const key = e.target.dataset.key;
            const settings = settingType === 'notification' 
                ? USER_DATA.notificationSettings 
                : USER_DATA.privacySettings;
            
            settings[key] = e.target.checked;
            showToast('设置已保存', 'success');
        });
    });
}

function initThemeSettings() {
    const defaultThemeSelect = document.getElementById('defaultTheme');
    if (defaultThemeSelect) {
        defaultThemeSelect.value = USER_DATA.defaultTheme;
        defaultThemeSelect.addEventListener('change', (e) => {
            USER_DATA.defaultTheme = e.target.value;
            showToast('主题设置已保存', 'success');
        });
    }

    const fontSizeSelect = document.getElementById('fontSize');
    if (fontSizeSelect) {
        fontSizeSelect.value = USER_DATA.defaultFontSize;
        fontSizeSelect.addEventListener('change', (e) => {
            USER_DATA.defaultFontSize = e.target.value;
            showToast('字体设置已保存', 'success');
        });
    }
}

function initDataManagement() {
    const exportBtn = document.getElementById('exportData');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const clearCacheBtn = document.getElementById('clearCache');

    exportBtn?.addEventListener('click', () => {
        showToast('正在准备数据导出，请稍候...', 'info');
        setTimeout(() => {
            showToast('数据导出完成', 'success');
        }, 1500);
    });

    clearHistoryBtn?.addEventListener('click', () => {
        if (confirm('确定要清除所有阅读历史吗？此操作不可撤销。')) {
            showToast('阅读历史已清除', 'success');
        }
    });

    clearCacheBtn?.addEventListener('click', () => {
        showToast('正在清理缓存...', 'info');
        setTimeout(() => {
            showToast('缓存已清理，共释放 256MB 空间', 'success');
        }, 1000);
    });
}

function initFormActions() {
    const saveBtn = document.getElementById('saveProfile');
    const changePasswordBtn = document.getElementById('changePassword');
    const logoutBtn = document.getElementById('logoutBtn');

    saveBtn?.addEventListener('click', () => {
        const nickname = document.getElementById('nickname').value;
        const email = document.getElementById('email').value;
        const bio = document.getElementById('bio').value;

        if (!nickname.trim()) {
            showToast('请输入昵称', 'warning');
            return;
        }

        USER_DATA.nickname = nickname;
        USER_DATA.email = email;
        USER_DATA.bio = bio;

        showToast('个人资料已保存', 'success');
    });

    changePasswordBtn?.addEventListener('click', () => {
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!oldPassword || !newPassword || !confirmPassword) {
            showToast('请填写完整的密码信息', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('两次输入的密码不一致', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('密码长度不能少于6位', 'warning');
            return;
        }

        showToast('密码修改成功', 'success');
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });

    logoutBtn?.addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
            showToast('已退出登录', 'success');
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);
        }
    });
}
