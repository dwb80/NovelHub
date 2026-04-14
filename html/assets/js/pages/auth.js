import { USERS } from '../mock/data.js';
import { showToast } from '../components/toast.js';

export function initAuthPage() {
    initAuthTabs();
    initPasswordToggle();
    initLoginForm();
    initRegisterForm();
}

function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabType = tab.dataset.tab;
            
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            
            if (tabType === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    });
}

function initPasswordToggle() {
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const inputWrapper = toggle.closest('.password-input-wrapper');
            const input = inputWrapper.querySelector('input');
            const iconEye = toggle.querySelector('.icon-eye');
            const iconEyeOff = toggle.querySelector('.icon-eye-off');
            
            if (input.type === 'password') {
                input.type = 'text';
                iconEye.style.display = 'none';
                iconEyeOff.style.display = 'block';
            } else {
                input.type = 'password';
                iconEye.style.display = 'block';
                iconEyeOff.style.display = 'none';
            }
        });
    });
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showToast('请填写邮箱和密码', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('请输入有效的邮箱地址', 'error');
                return;
            }
            
            // 使用 Mock 数据验证
            const user = USERS.find(u => u.email === email && u.password === password);
            if (!user) {
                showToast('邮箱或密码错误', 'error');
                return;
            }
            
            showToast('登录中...', 'loading');
            
            setTimeout(() => {
                showToast(`登录成功！欢迎 ${user.name}`, 'success');
                // 保存登录状态
                localStorage.setItem('currentUser', JSON.stringify(user));
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1000);
            }, 1500);
        });
    }
}

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            if (!username || !email || !password || !confirmPassword) {
                showToast('请填写所有必填字段', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('请输入有效的邮箱地址', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('密码长度不能少于 6 位', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('两次输入的密码不一致', 'error');
                return;
            }
            
            if (!agreeTerms) {
                showToast('请同意用户协议和隐私政策', 'error');
                return;
            }
            
            // 使用 Mock 数据检查邮箱是否已存在
            const existingUser = USERS.find(u => u.email === email);
            if (existingUser) {
                showToast('该邮箱已被注册', 'error');
                return;
            }
            
            showToast('注册中...', 'loading');
            
            setTimeout(() => {
                showToast('注册成功！正在跳转...', 'success');
                // 保存新用户
                const newUser = {
                    id: USERS.length + 1,
                    name: username,
                    email: email,
                    password: password,
                    avatar: `https://i.pravatar.cc/150?u=${email}`,
                    role: 'user'
                };
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1000);
            }, 1500);
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
