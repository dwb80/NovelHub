/**
 * Interactions Component
 * NovelHub - Enhanced UI Interactions (Ripple, Skeleton, Form Validation, Page Transitions)
 */

// ========== Ripple Effect ==========

/**
 * Initialize ripple effect on buttons and clickable elements
 * @param {string} selector - CSS selector for elements to apply ripple
 */
export function initRippleEffect(selector = '.btn-primary, .btn-secondary, .btn-danger, .btn-ghost, [data-ripple]') {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        
        element.addEventListener('click', function(e) {
            createRipple(this, e);
        });
    });
}

/**
 * Create a ripple effect at click position
 * @param {HTMLElement} element - Target element
 * @param {MouseEvent} event - Click event
 */
function createRipple(element, event) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: currentColor;
        opacity: 0.3;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// ========== Skeleton Loading ==========

/**
 * Skeleton loader configuration
 */
const SKELETON_CONFIG = {
    baseColor: 'var(--color-bg-tertiary)',
    highlightColor: 'var(--color-bg-secondary)',
    animationDuration: '1.5s'
};

/**
 * Create skeleton placeholder
 * @param {Object} options - Skeleton options
 * @returns {HTMLElement} Skeleton element
 */
export function createSkeleton(options = {}) {
    const {
        type = 'text',
        width = '100%',
        height = '1rem',
        lines = 1,
        circle = false,
        className = ''
    } = options;
    
    const container = document.createElement('div');
    container.className = `skeleton-container ${className}`;
    container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
    `;
    
    for (let i = 0; i < lines; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-item';
        
        if (circle) {
            skeleton.style.cssText = `
                width: ${width};
                height: ${height};
                border-radius: 50%;
                background: linear-gradient(90deg, ${SKELETON_CONFIG.baseColor} 25%, ${SKELETON_CONFIG.highlightColor} 50%, ${SKELETON_CONFIG.baseColor} 75%);
                background-size: 200% 100%;
                animation: skeleton-loading ${SKELETON_CONFIG.animationDuration} infinite;
            `;
        } else {
            const lineWidth = i === lines - 1 && lines > 1 ? '70%' : width;
            skeleton.style.cssText = `
                width: ${lineWidth};
                height: ${height};
                border-radius: ${type === 'card' ? '0.5rem' : '0.25rem'};
                background: linear-gradient(90deg, ${SKELETON_CONFIG.baseColor} 25%, ${SKELETON_CONFIG.highlightColor} 50%, ${SKELETON_CONFIG.baseColor} 75%);
                background-size: 200% 100%;
                animation: skeleton-loading ${SKELETON_CONFIG.animationDuration} infinite;
            `;
        }
        
        container.appendChild(skeleton);
    }
    
    return container;
}

/**
 * Show skeleton loading state for a container
 * @param {HTMLElement} container - Target container
 * @param {Object} options - Skeleton options
 */
export function showSkeleton(container, options = {}) {
    if (!container) return;
    
    // Store original content
    container.dataset.originalContent = container.innerHTML;
    container.dataset.loading = 'true';
    
    // Clear and add skeleton
    container.innerHTML = '';
    container.style.pointerEvents = 'none';
    
    const skeleton = createSkeleton(options);
    container.appendChild(skeleton);
}

/**
 * Hide skeleton and restore original content
 * @param {HTMLElement} container - Target container
 */
export function hideSkeleton(container) {
    if (!container || container.dataset.loading !== 'true') return;
    
    container.innerHTML = container.dataset.originalContent || '';
    container.style.pointerEvents = '';
    container.dataset.loading = 'false';
    
    // Clean up
    delete container.dataset.originalContent;
}

// Add skeleton animation styles
const skeletonStyles = document.createElement('style');
skeletonStyles.textContent = `
    @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    .skeleton-container {
        animation: skeleton-fade-in 0.2s ease-out;
    }
    
    @keyframes skeleton-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(skeletonStyles);

// ========== Form Validation ==========

/**
 * Form validation rules
 */
const VALIDATION_RULES = {
    required: {
        test: (value) => value.trim().length > 0,
        message: '此字段为必填项'
    },
    email: {
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: '请输入有效的邮箱地址'
    },
    minLength: {
        test: (value, length) => value.length >= length,
        message: (length) => `至少需要 ${length} 个字符`
    },
    maxLength: {
        test: (value, length) => value.length <= length,
        message: (length) => `最多允许 ${length} 个字符`
    },
    pattern: {
        test: (value, regex) => regex.test(value),
        message: '格式不正确'
    },
    password: {
        test: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(value),
        message: '密码需包含大小写字母和数字，至少8位'
    },
    phone: {
        test: (value) => /^1[3-9]\d{9}$/.test(value),
        message: '请输入有效的手机号码'
    },
    url: {
        test: (value) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
        message: '请输入有效的URL'
    }
};

/**
 * Initialize form validation
 * @param {HTMLFormElement} form - Form element
 * @param {Object} options - Validation options
 */
export function initFormValidation(form, options = {}) {
    if (!form) return;
    
    const config = {
        validateOnBlur: true,
        validateOnInput: true,
        showSuccessState: true,
        ...options
    };
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        const field = input.closest('.form-group') || input.parentElement;
        
        // Create error message element
        let errorEl = field.querySelector('.form-error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error-message';
            field.appendChild(errorEl);
        }
        
        // Validate on blur
        if (config.validateOnBlur) {
            input.addEventListener('blur', () => {
                validateField(input, errorEl);
            });
        }
        
        // Validate on input (with debounce)
        if (config.validateOnInput) {
            let debounceTimer;
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    validateField(input, errorEl);
                }, 300);
            });
        }
    });
    
    // Form submit validation
    form.addEventListener('submit', (e) => {
        let isValid = true;
        
        inputs.forEach(input => {
            const field = input.closest('.form-group') || input.parentElement;
            const errorEl = field.querySelector('.form-error-message');
            
            if (!validateField(input, errorEl)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            // Focus first invalid field
            const firstInvalid = form.querySelector('.form-input.error');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    });
}

/**
 * Validate a single field
 * @param {HTMLInputElement} input - Input element
 * @param {HTMLElement} errorEl - Error message element
 * @returns {boolean} Is valid
 */
function validateField(input, errorEl) {
    const value = input.value;
    const validations = input.dataset.validate?.split('|') || [];
    const field = input.closest('.form-group') || input.parentElement;
    
    let isValid = true;
    let errorMessage = '';
    
    for (const validation of validations) {
        const [ruleName, param] = validation.split(':');
        const rule = VALIDATION_RULES[ruleName];
        
        if (rule) {
            let testValue = value;
            let testParam = param;
            
            // Convert param to number if needed
            if (param && !isNaN(param)) {
                testParam = parseInt(param);
            }
            
            // Convert regex string to RegExp
            if (ruleName === 'pattern' && param) {
                testParam = new RegExp(param);
            }
            
            if (!rule.test(testValue, testParam)) {
                isValid = false;
                errorMessage = typeof rule.message === 'function' 
                    ? rule.message(testParam) 
                    : rule.message;
                break;
            }
        }
    }
    
    // Update UI
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('valid');
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    } else {
        input.classList.add('error');
        input.classList.remove('valid');
        errorEl.textContent = errorMessage;
        errorEl.style.display = 'block';
    }
    
    return isValid;
}

// Add form validation styles
const formValidationStyles = document.createElement('style');
formValidationStyles.textContent = `
    .form-input {
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-input.error {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px var(--color-error-light);
    }
    
    .form-input.valid {
        border-color: var(--color-success);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2.5rem;
    }
    
    .form-error-message {
        display: none;
        font-size: 0.8125rem;
        color: var(--color-error);
        margin-top: 0.375rem;
        animation: error-slide-in 0.2s ease-out;
    }
    
    @keyframes error-slide-in {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(formValidationStyles);

// ========== Page Transitions ==========

/**
 * Initialize page transition animations
 */
export function initPageTransitions() {
    // Add transition styles
    const transitionStyles = document.createElement('style');
    transitionStyles.textContent = `
        .page-transition-enter {
            animation: page-enter 0.3s ease-out;
        }
        
        .page-transition-leave {
            animation: page-leave 0.2s ease-in;
        }
        
        @keyframes page-enter {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes page-leave {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
        
        /* Fade transition */
        .fade-transition-enter {
            animation: fade-enter 0.3s ease-out;
        }
        
        @keyframes fade-enter {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Slide transitions */
        .slide-up-enter {
            animation: slide-up-enter 0.3s ease-out;
        }
        
        @keyframes slide-up-enter {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .slide-down-enter {
            animation: slide-down-enter 0.3s ease-out;
        }
        
        @keyframes slide-down-enter {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .slide-left-enter {
            animation: slide-left-enter 0.3s ease-out;
        }
        
        @keyframes slide-left-enter {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .slide-right-enter {
            animation: slide-right-enter 0.3s ease-out;
        }
        
        @keyframes slide-right-enter {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        /* Scale transition */
        .scale-enter {
            animation: scale-enter 0.3s ease-out;
        }
        
        @keyframes scale-enter {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        /* Stagger children animation */
        .stagger-children > * {
            opacity: 0;
            animation: stagger-enter 0.3s ease-out forwards;
        }
        
        @keyframes stagger-enter {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(transitionStyles);
    
    // Apply enter animation to main content
    const mainContent = document.querySelector('.main-content') || document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('page-transition-enter');
    }
}

/**
 * Navigate to a page with transition
 * @param {string} url - Target URL
 * @param {Object} options - Navigation options
 */
export function navigateWithTransition(url, options = {}) {
    const { 
        transition = 'page',
        delay = 200 
    } = options;
    
    const mainContent = document.querySelector('.main-content') || document.querySelector('main');
    
    if (mainContent) {
        mainContent.classList.add(`${transition}-transition-leave`);
        
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    } else {
        window.location.href = url;
    }
}

// ========== Loading States ==========

/**
 * Show loading state on a button
 * @param {HTMLButtonElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
export function showButtonLoading(button, loadingText = '') {
    if (!button) return;
    
    // Store original state
    button.dataset.originalText = button.innerHTML;
    button.dataset.originalDisabled = button.disabled;
    
    // Show loading
    button.disabled = true;
    button.innerHTML = `
        <span class="btn-spinner"></span>
        ${loadingText}
    `;
    button.classList.add('btn-loading');
}

/**
 * Hide loading state on a button
 * @param {HTMLButtonElement} button - Button element
 */
export function hideButtonLoading(button) {
    if (!button) return;
    
    button.disabled = button.dataset.originalDisabled === 'true';
    button.innerHTML = button.dataset.originalText || '';
    button.classList.remove('btn-loading');
}

// Add button loading styles
const buttonLoadingStyles = document.createElement('style');
buttonLoadingStyles.textContent = `
    .btn-loading {
        position: relative;
        color: transparent !important;
    }
    
    .btn-spinner {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: btn-spin 0.8s linear infinite;
    }
    
    @keyframes btn-spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
document.head.appendChild(buttonLoadingStyles);

// ========== Scroll Animations ==========

/**
 * Initialize scroll-triggered animations
 * @param {string} selector - Elements to animate
 */
export function initScrollAnimations(selector = '[data-animate]') {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animation = el.dataset.animate || 'fade-up';
                const delay = el.dataset.animateDelay || 0;
                
                setTimeout(() => {
                    el.classList.add(`animate-${animation}`);
                    el.style.opacity = '1';
                }, delay);
                
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Add scroll animation styles
const scrollAnimationStyles = document.createElement('style');
scrollAnimationStyles.textContent = `
    [data-animate] {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .animate-fade-up {
        animation: animate-fade-up 0.6s ease-out forwards;
    }
    
    @keyframes animate-fade-up {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-down {
        animation: animate-fade-down 0.6s ease-out forwards;
    }
    
    @keyframes animate-fade-down {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-left {
        animation: animate-fade-left 0.6s ease-out forwards;
    }
    
    @keyframes animate-fade-left {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .animate-fade-right {
        animation: animate-fade-right 0.6s ease-out forwards;
    }
    
    @keyframes animate-fade-right {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .animate-scale {
        animation: animate-scale 0.6s ease-out forwards;
    }
    
    @keyframes animate-scale {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .animate-flip {
        animation: animate-flip 0.6s ease-out forwards;
    }
    
    @keyframes animate-flip {
        from {
            opacity: 0;
            transform: perspective(400px) rotateY(90deg);
        }
        to {
            opacity: 1;
            transform: perspective(400px) rotateY(0);
        }
    }
`;
document.head.appendChild(scrollAnimationStyles);

// ========== Hover Effects ==========

/**
 * Initialize hover effects on cards and interactive elements
 */
export function initHoverEffects() {
    const hoverElements = document.querySelectorAll('[data-hover]');
    
    hoverElements.forEach(el => {
        const effect = el.dataset.hover;
        
        el.addEventListener('mouseenter', () => {
            el.classList.add(`hover-${effect}`);
        });
        
        el.addEventListener('mouseleave', () => {
            el.classList.remove(`hover-${effect}`);
        });
    });
}

// Add hover effect styles
const hoverStyles = document.createElement('style');
hoverStyles.textContent = `
    .hover-lift {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
    }
    
    .hover-scale {
        transform: scale(1.02);
    }
    
    .hover-glow {
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
    }
    
    .hover-border {
        border-color: var(--color-primary);
    }
    
    [data-hover] {
        transition: all 0.2s ease-out;
    }
`;
document.head.appendChild(hoverStyles);

// ========== Initialize All ==========

/**
 * Initialize all interaction enhancements
 */
export function initAllInteractions() {
    initRippleEffect();
    initPageTransitions();
    initScrollAnimations();
    initHoverEffects();
    
    // Initialize form validation on all forms
    document.querySelectorAll('form[data-validate]').forEach(form => {
        initFormValidation(form);
    });
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllInteractions);
} else {
    initAllInteractions();
}

// Export all functions
export default {
    initRippleEffect,
    createSkeleton,
    showSkeleton,
    hideSkeleton,
    initFormValidation,
    initPageTransitions,
    navigateWithTransition,
    showButtonLoading,
    hideButtonLoading,
    initScrollAnimations,
    initHoverEffects,
    initAllInteractions,
    VALIDATION_RULES
};
