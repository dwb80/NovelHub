/**
 * Toast Notification Component
 * NovelHub UI Component
 */

const TOAST_ICONS = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    loading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
};

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

let toastContainer = null;
let toastIdCounter = 0;
const activeToasts = new Map();

/**
 * Initialize toast container
 */
export function initToast() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        toastContainer.setAttribute('role', 'alert');
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * Get or create toast container
 */
function getContainer() {
    return toastContainer || initToast();
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'success' | 'error' | 'warning' | 'info' | 'loading'
 * @param {number} duration - Duration in milliseconds (0 for persistent)
 * @param {Object} options - Additional options
 * @returns {string} Toast ID for manual dismissal
 */
export function showToast(message, type = 'info', duration = null, options = {}) {
    // 使用常量避免魔法数字
    const constants = (typeof window !== 'undefined' && window.NovelHubConstants)
        ? window.NovelHubConstants.NUMERIC_CONSTANTS
        : { TOAST_DURATION: 3000 };
    const toastDuration = duration || constants.TOAST_DURATION || 3000;
    const container = getContainer();
    const id = `toast-${++toastIdCounter}`;
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    
    const showClose = options.showClose !== false && duration !== 0;
    
    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
        <span class="toast-message">${message}</span>
        ${showClose ? `<button class="toast-close" aria-label="关闭通知">${CLOSE_ICON}</button>` : ''}
    `;
    
    // Add close button handler
    if (showClose) {
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => dismissToast(id));
    }
    
    container.appendChild(toast);
    activeToasts.set(id, { element: toast, timeout: null });
    
    // Auto dismiss
    if (duration > 0) {
        const timeout = setTimeout(() => dismissToast(id), duration);
        activeToasts.get(id).timeout = timeout;
    }
    
    return id;
}

/**
 * Dismiss a specific toast
 * @param {string} id - Toast ID
 */
export function dismissToast(id) {
    const toastData = activeToasts.get(id);
    if (!toastData) return;
    
    const { element, timeout } = toastData;
    
    if (timeout) {
        clearTimeout(timeout);
    }
    
    element.classList.add('toast-out');
    
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
        activeToasts.delete(id);
    }, 300);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
    activeToasts.forEach((_, id) => dismissToast(id));
}

/**
 * Update an existing toast
 * @param {string} id - Toast ID
 * @param {string} message - New message
 * @param {string} type - New type
 */
export function updateToast(id, message, type) {
    const toastData = activeToasts.get(id);
    if (!toastData) return;
    
    const { element } = toastData;
    const iconEl = element.querySelector('.toast-icon');
    const messageEl = element.querySelector('.toast-message');
    
    if (type) {
        element.className = `toast toast-${type}`;
        if (iconEl) {
            iconEl.innerHTML = TOAST_ICONS[type] || TOAST_ICONS.info;
        }
    }
    
    if (message && messageEl) {
        messageEl.textContent = message;
    }
}

/**
 * Show loading toast that can be updated
 * @param {string} message - Loading message
 * @returns {Object} Controller object with success, error, and dismiss methods
 */
export function showLoadingToast(message = '加载中...') {
    const id = showToast(message, 'loading', 0, { showClose: false });
    
    const toastIcon = document.querySelector(`#${id} .toast-icon svg`);
    if (toastIcon) {
        toastIcon.style.animation = 'spin 1s linear infinite';
    }
    
    return {
        success: (msg) => {
            updateToast(id, msg, 'success');
            setTimeout(() => dismissToast(id), 2000);
        },
        error: (msg) => {
            updateToast(id, msg, 'error');
            setTimeout(() => dismissToast(id), 3000);
        },
        dismiss: () => dismissToast(id),
        update: (msg) => updateToast(id, msg, 'loading')
    };
}

/**
 * Promise-based toast that resolves when dismissed
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @param {number} duration - Duration
 * @returns {Promise} Resolves when toast is dismissed
 */
export function showToastAsync(message, type = 'info', duration = 3000) {
    return new Promise((resolve) => {
        const id = showToast(message, type, duration);
        const checkDismissed = setInterval(() => {
            if (!activeToasts.has(id)) {
                clearInterval(checkDismissed);
                resolve();
            }
        }, 100);
    });
}

/**
 * Show confirmation toast with action button
 * @param {string} message - Toast message
 * @param {string} actionLabel - Action button label
 * @param {Function} onAction - Action callback
 * @param {Object} options - Additional options
 * @returns {string} Toast ID
 */
export function showConfirmationToast(message, actionLabel = '操作', onAction, options = {}) {
    const container = getContainer();
    const id = `toast-${++toastIdCounter}`;
    const duration = options.duration || 5000;
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = 'toast toast-info';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${TOAST_ICONS.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-action" aria-label="${actionLabel}">${actionLabel}</button>
        <button class="toast-close" aria-label="关闭通知">${CLOSE_ICON}</button>
    `;
    
    // Action button handler
    const actionBtn = toast.querySelector('.toast-action');
    actionBtn.addEventListener('click', () => {
        if (onAction) {
            onAction();
        }
        dismissToast(id);
    });
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => dismissToast(id));
    
    container.appendChild(toast);
    activeToasts.set(id, { element: toast, timeout: null });
    
    // Auto dismiss
    if (duration > 0) {
        const timeout = setTimeout(() => dismissToast(id), duration);
        activeToasts.get(id).timeout = timeout;
    }
    
    return id;
}

/**
 * Queue toasts to show one at a time
 */
const toastQueue = [];
let isToastShowing = false;

/**
 * Show queued toast (shows one at a time)
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @param {number} duration - Duration
 * @returns {Promise} Resolves when toast is shown and dismissed
 */
export async function showQueuedToast(message, type = 'info', duration = 3000) {
    return new Promise((resolve) => {
        toastQueue.push({ message, type, duration, resolve });
        processToastQueue();
    });
}

/**
 * Process toast queue
 */
async function processToastQueue() {
    if (isToastShowing || toastQueue.length === 0) {
        return;
    }
    
    isToastShowing = true;
    const { message, type, duration, resolve } = toastQueue.shift();
    
    const id = showToast(message, type, duration);
    
    // Wait for toast to be dismissed
    await new Promise(resolveToast => {
        const checkDismissed = setInterval(() => {
            if (!activeToasts.has(id)) {
                clearInterval(checkDismissed);
                resolveToast();
            }
        }, 100);
    });
    
    isToastShowing = false;
    resolve();
    processToastQueue();
}

/**
 * Clear toast queue
 */
export function clearToastQueue() {
    toastQueue.length = 0;
}

/**
 * Get count of active toasts
 * @returns {number} Number of active toasts
 */
export function getActiveToastCount() {
    return activeToasts.size;
}

/**
 * Check if toast is showing
 * @returns {boolean} True if any toast is currently visible
 */
export function isToastActive() {
    return activeToasts.size > 0;
}

/**
 * Show success toast shortcut
 * @param {string} message - Toast message
 * @param {number} duration - Duration
 * @returns {string} Toast ID
 */
export function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

/**
 * Show error toast shortcut
 * @param {string} message - Toast message
 * @param {number} duration - Duration
 * @returns {string} Toast ID
 */
export function showError(message, duration = 3000) {
    return showToast(message, 'error', duration);
}

/**
 * Show warning toast shortcut
 * @param {string} message - Toast message
 * @param {number} duration - Duration
 * @returns {string} Toast ID
 */
export function showWarning(message, duration = 3000) {
    return showToast(message, 'warning', duration);
}

/**
 * Show info toast shortcut
 * @param {string} message - Toast message
 * @param {number} duration - Duration
 * @returns {string} Toast ID
 */
export function showInfo(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

