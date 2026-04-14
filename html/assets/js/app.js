import { initTheme, getCurrentTheme, setTheme } from './modules/theme.js';
import { showToast } from './components/toast.js';
import { initAuth } from './auth.js';
import { initHomePage, initSearch } from './pages/home.js';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuth();
    initNavigation();
    initModals();
    initSearch();
    initHomePage();
    registerServiceWorker();
});

/**
 * 注册Service Worker
 * 实现离线缓存和PWA功能
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    // 使用日志系统记录（开发环境输出）
                    if (typeof window !== 'undefined' && window.NovelHubLogger) {
                        window.NovelHubLogger.logger.info('Service Worker注册成功:', registration.scope);
                    }

                    // 监听Service Worker更新
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // 有新版本可用
                                showToast('检测到新版本，刷新页面后生效', 'info');
                            }
                        });
                    });
                })
                .catch((error) => {
                    // 使用日志系统记录错误
                    if (typeof window !== 'undefined' && window.NovelHubLogger) {
                        window.NovelHubLogger.logger.error('Service Worker注册失败:', error.message);
                    }
                });

            // 监听Service Worker消息
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'CACHE_UPDATED') {
                    showToast('缓存已更新', 'success');
                }
            });
        });
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            setActiveNav(link);
            navigateToPage(page);
        });
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function setActiveNav(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function navigateToPage(page) {
    switch (page) {
        case 'home':
            window.location.href = 'index.html';
            break;
        case 'category':
            window.location.href = 'pages/discover/category.html';
            break;
        case 'ranking':
            window.location.href = 'pages/discover/ranking.html';
            break;
        case 'bookshelf':
            window.location.href = 'pages/bookshelf/my-bookshelf.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const themes = ['light', 'paper', 'dark', 'eye-care'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);

    const themeNames = {
        'light': '浅色模式',
        'paper': '纸张模式',
        'dark': '深色模式',
        'eye-care': '护眼模式'
    };

    showToast(`已切换到${themeNames[nextTheme]}`, 'success');
}

function initModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLogin = document.getElementById('closeLogin');
    const goToRegister = document.getElementById('goToRegister');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.add('active');
        });
    }

    if (closeLogin && loginModal) {
        closeLogin.addEventListener('click', () => {
            loginModal.classList.remove('active');
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
            }
        });
    }

    if (goToRegister) {
        goToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.remove('active');
            showToast('注册功能开发中', 'info');
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loginModal.classList.remove('active');
            showToast('登录成功！', 'success');
            const userMenu = document.getElementById('userMenu');
            userMenu.innerHTML = `
                <div class="user-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
            `;
        });
    }
}

