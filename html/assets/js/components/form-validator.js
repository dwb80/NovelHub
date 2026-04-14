/**
 * Form Validator Component
 * NovelHub - 表单验证组件
 * UX-P1-004 Fix: 统一表单错误提示位置
 * 支持实时验证、错误提示、成功状态
 * @version 2.0.0
 */

/**
 * 预编译的正则表达式
 * 避免在验证过程中重复创建正则对象，提升性能
 */
const PRECOMPILED_REGEX = {
    // 邮箱验证正则
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // 密码强度检测正则
    PASSWORD_LOWERCASE: /[a-z]/,
    PASSWORD_UPPERCASE: /[A-Z]/,
    PASSWORD_NUMBER: /\d/,
    PASSWORD_SPECIAL: /[^a-zA-Z0-9]/
};

/**
 * 表单验证配置
 */
const FORM_VALIDATOR_CONFIG = {
    // 错误提示位置: 'inline' (输入框下方), 'tooltip' (悬浮提示), 'summary' (表单顶部汇总)
    errorPosition: 'inline',
    // 错误提示显示时机: 'immediate' (立即), 'onBlur' (失焦时), 'onSubmit' (提交时)
    showErrorOn: 'onBlur',
    // 是否显示成功状态
    showSuccessState: true,
    // 是否自动聚焦到第一个错误字段
    scrollToFirstError: true,
    // 错误提示动画
    errorAnimation: 'shake',
    // 错误提示样式类
    errorClass: 'form-error',
    // 成功提示样式类
    successClass: 'form-success'
};

class FormValidator {
    constructor(formElement, options = {}) {
        this.form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
        this.options = {
            ...FORM_VALIDATOR_CONFIG,
            validateOnBlur: true,
            validateOnInput: false,
            ...options
        };
        
        this.fields = new Map();
        this.validators = new Map();
        this.errorSummaryElement = null;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.setupFields();
        this.bindEvents();
        this.createErrorSummaryContainer();
    }

    /**
     * 创建错误汇总容器（用于表单顶部显示所有错误）
     */
    createErrorSummaryContainer() {
        if (this.options.errorPosition === 'summary') {
            this.errorSummaryElement = document.createElement('div');
            this.errorSummaryElement.className = 'form-error-summary';
            this.errorSummaryElement.style.display = 'none';
            this.form.insertBefore(this.errorSummaryElement, this.form.firstChild);
        }
    }

    // 设置表单字段
    setupFields() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const fieldName = input.name || input.id;
            if (fieldName) {
                this.fields.set(fieldName, {
                    element: input,
                    errorElement: null,
                    successElement: null,
                    touched: false,
                    valid: false,
                    wrapper: this.getFieldWrapper(input)
                });
                
                // 为每个字段创建错误元素
                this.createErrorElement(fieldName);
            }
        });
    }

    /**
     * 获取字段包装器
     */
    getFieldWrapper(input) {
        // 查找 .form-group 或 .form-field 包装器
        let wrapper = input.closest('.form-group') || 
                      input.closest('.form-field') || 
                      input.closest('.nhub-form-group') ||
                      input.parentElement;
        return wrapper;
    }

    /**
     * 创建错误提示元素
     */
    createErrorElement(fieldName) {
        const field = this.fields.get(fieldName);
        if (!field) return;

        const { element, wrapper } = field;
        
        // 创建错误提示元素
        const errorEl = document.createElement('div');
        errorEl.className = this.options.errorClass;
        errorEl.id = `${fieldName}-error`;
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
        errorEl.style.display = 'none';
        
        // 根据配置决定错误提示位置
        switch (this.options.errorPosition) {
            case 'inline':
                // 默认：插入到输入框后面
                this.insertErrorElementInline(wrapper, errorEl, element);
                break;
            case 'tooltip':
                // 悬浮提示模式
                errorEl.classList.add('form-error--tooltip');
                wrapper.appendChild(errorEl);
                break;
            case 'summary':
                // 汇总模式，不需要单独的错误元素
                break;
            default:
                this.insertErrorElementInline(wrapper, errorEl, element);
        }
        
        field.errorElement = errorEl;
        
        // 设置 aria-describedby
        element.setAttribute('aria-describedby', errorEl.id);
        
        // 创建成功状态元素
        if (this.options.showSuccessState) {
            const successEl = document.createElement('span');
            successEl.className = this.options.successClass;
            successEl.innerHTML = '✓';
            successEl.style.display = 'none';
            wrapper.appendChild(successEl);
            field.successElement = successEl;
        }
    }

    /**
     * 内联插入错误元素
     */
    insertErrorElementInline(wrapper, errorEl, input) {
        // 查找输入框后的元素
        const nextSibling = input.nextElementSibling;
        
        if (nextSibling && nextSibling.classList.contains('form-hint')) {
            // 如果有提示文字，插入到提示文字后面
            wrapper.insertBefore(errorEl, nextSibling.nextSibling);
        } else {
            // 否则直接插入到输入框后面
            wrapper.insertBefore(errorEl, nextSibling);
        }
    }

    // 绑定事件
    bindEvents() {
        this.fields.forEach((field, name) => {
            const { element } = field;

            // 输入时验证（如果配置为立即验证）
            if (this.options.validateOnInput || this.options.showErrorOn === 'immediate') {
                element.addEventListener('input', () => {
                    this.validateField(name);
                });
            }

            // 失去焦点时验证
            if (this.options.validateOnBlur || this.options.showErrorOn === 'onBlur') {
                element.addEventListener('blur', () => {
                    field.touched = true;
                    this.validateField(name);
                });
            }

            // 获得焦点时清除错误（可选）
            element.addEventListener('focus', () => {
                if (this.options.errorPosition === 'tooltip') {
                    this.clearError(name);
                }
            });
        });

        // 表单提交
        this.form.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    // 添加验证规则
    addRule(fieldName, rules) {
        this.validators.set(fieldName, rules);
        return this;
    }

    // 验证单个字段
    validateField(fieldName) {
        const field = this.fields.get(fieldName);
        if (!field) return true;

        const rules = this.validators.get(fieldName);
        if (!rules) return true;

        const { element } = field;
        const value = element.value.trim();
        
        let isValid = true;
        let errorMessage = '';

        // 执行所有验证规则
        for (const rule of rules) {
            const result = this.executeRule(rule, value, element);
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message;
                break;
            }
        }

        field.valid = isValid;

        if (isValid) {
            this.showSuccess(fieldName);
        } else if (field.touched || this.options.showErrorOn === 'immediate') {
            this.showError(fieldName, errorMessage);
        }

        return isValid;
    }

    // 执行验证规则
    executeRule(rule, value, element) {
        const { type, message, params } = rule;

        switch (type) {
            case 'required':
                return { valid: value.length > 0, message: message || '此字段为必填项' };
            
            case 'email':
                return { valid: PRECOMPILED_REGEX.EMAIL.test(value), message: message || '请输入有效的邮箱地址' };
            
            case 'minLength':
                const minLen = params || 1;
                return { valid: value.length >= minLen, message: message || `至少需要 ${minLen} 个字符` };
            
            case 'maxLength':
                const maxLen = params || 100;
                return { valid: value.length <= maxLen, message: message || `最多 ${maxLen} 个字符` };
            
            case 'pattern':
                const regex = new RegExp(params);
                return { valid: regex.test(value), message: message || '格式不正确' };
            
            case 'match':
                const targetElement = document.querySelector(params);
                const targetValue = targetElement ? targetElement.value : '';
                return { valid: value === targetValue, message: message || '两次输入不一致' };
            
            case 'custom':
                const customResult = params(value, element);
                return { valid: customResult.valid, message: customResult.message || message };
            
            default:
                return { valid: true, message: '' };
        }
    }

    // 验证所有字段
    validateAll() {
        let allValid = true;
        let firstErrorField = null;
        const errors = [];

        this.fields.forEach((field, name) => {
            field.touched = true;
            const isValid = this.validateField(name);
            if (!isValid) {
                allValid = false;
                if (!firstErrorField) {
                    firstErrorField = field.element;
                }
                
                // 收集错误信息用于汇总显示
                const errorEl = field.errorElement;
                if (errorEl && errorEl.textContent) {
                    errors.push({
                        field: name,
                        message: errorEl.textContent,
                        label: this.getFieldLabel(field.element)
                    });
                }
            }
        });

        // 显示错误汇总
        if (!allValid && this.options.errorPosition === 'summary') {
            this.showErrorSummary(errors);
        }

        if (!allValid && firstErrorField && this.options.scrollToFirstError) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return allValid;
    }

    /**
     * 获取字段标签
     */
    getFieldLabel(input) {
        const id = input.id;
        const name = input.name;
        
        // 尝试查找 label
        let label = document.querySelector(`label[for="${id}"]`);
        if (label) return label.textContent.trim();
        
        // 尝试从 placeholder 获取
        if (input.placeholder) return input.placeholder;
        
        // 返回字段名
        return name || id;
    }

    /**
     * 显示错误汇总
     */
    showErrorSummary(errors) {
        if (!this.errorSummaryElement) return;
        
        if (errors.length === 0) {
            this.errorSummaryElement.style.display = 'none';
            return;
        }
        
        const errorList = errors.map(e => 
            `<li><a href="#${e.field}" onclick="document.getElementById('${e.field}').focus(); return false;">${e.label}: ${e.message}</a></li>`
        ).join('');
        
        this.errorSummaryElement.innerHTML = `
            <div class="form-error-summary__content">
                <strong>请修正以下错误：</strong>
                <ul>${errorList}</ul>
            </div>
        `;
        this.errorSummaryElement.style.display = 'block';
        
        // 添加动画
        this.errorSummaryElement.classList.add('form-error-summary--visible');
    }

    // 显示错误
    showError(fieldName, message) {
        const field = this.fields.get(fieldName);
        if (!field) return;

        const { element, errorElement, wrapper, successElement } = field;

        // 添加错误样式
        element.classList.add('error');
        element.classList.remove('success');
        element.setAttribute('aria-invalid', 'true');
        
        // 添加错误动画
        if (this.options.errorAnimation === 'shake') {
            wrapper.classList.add('form-field--shake');
            setTimeout(() => wrapper.classList.remove('form-field--shake'), 500);
        }

        // 显示错误信息
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.classList.add('form-error--visible');
        }

        // 隐藏成功状态
        if (successElement) {
            successElement.style.display = 'none';
        }

        // 触发错误事件
        this.emit('error', { field: fieldName, message, element });
    }

    // 显示成功状态
    showSuccess(fieldName) {
        if (!this.options.showSuccessState) return;

        const field = this.fields.get(fieldName);
        if (!field) return;

        const { element, errorElement, successElement } = field;

        // 添加成功样式
        element.classList.remove('error');
        element.classList.add('success');
        element.setAttribute('aria-invalid', 'false');

        // 清除错误信息
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            errorElement.classList.remove('form-error--visible');
        }

        // 显示成功状态
        if (successElement) {
            successElement.style.display = 'inline-flex';
        }

        // 触发成功事件
        this.emit('success', { field: fieldName, element });
    }

    // 清除错误
    clearError(fieldName) {
        const field = this.fields.get(fieldName);
        if (!field) return;

        const { element, errorElement, successElement } = field;

        element.classList.remove('error');
        element.removeAttribute('aria-invalid');

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
            errorElement.classList.remove('form-error--visible');
        }
        
        if (successElement) {
            successElement.style.display = 'none';
        }
    }

    // 清除所有错误
    clearAllErrors() {
        this.fields.forEach((_, name) => this.clearError(name));
        
        if (this.errorSummaryElement) {
            this.errorSummaryElement.style.display = 'none';
        }
    }

    // 获取字段值
    getValue(fieldName) {
        const field = this.fields.get(fieldName);
        return field ? field.element.value.trim() : null;
    }

    // 获取所有值
    getAllValues() {
        const values = {};
        this.fields.forEach((field, name) => {
            values[name] = field.element.value.trim();
        });
        return values;
    }

    // 设置字段值
    setValue(fieldName, value) {
        const field = this.fields.get(fieldName);
        if (field) {
            field.element.value = value;
        }
    }

    // 重置表单
    reset() {
        this.form.reset();
        this.clearAllErrors();
        this.fields.forEach(field => {
            field.touched = false;
            field.valid = false;
            field.element.classList.remove('success');
        });
    }

    // 事件系统
    emit(eventName, data) {
        const event = new CustomEvent(`validator:${eventName}`, { detail: data });
        this.form.dispatchEvent(event);
    }

    on(eventName, callback) {
        this.form.addEventListener(`validator:${eventName}`, (e) => callback(e.detail));
    }

    // 销毁
    destroy() {
        this.fields.clear();
        this.validators.clear();
        if (this.errorSummaryElement) {
            this.errorSummaryElement.remove();
        }
    }
}

// 预设验证规则
FormValidator.Rules = {
    required: (message) => ({ type: 'required', message }),
    email: (message) => ({ type: 'email', message }),
    minLength: (length, message) => ({ type: 'minLength', params: length, message }),
    maxLength: (length, message) => ({ type: 'maxLength', params: length, message }),
    pattern: (regex, message) => ({ type: 'pattern', params: regex, message }),
    match: (selector, message) => ({ type: 'match', params: selector, message }),
    custom: (validator, message) => ({ type: 'custom', params: validator, message })
};

// 密码强度检测
FormValidator.checkPasswordStrength = (password) => {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: PRECOMPILED_REGEX.PASSWORD_LOWERCASE.test(password),
        uppercase: PRECOMPILED_REGEX.PASSWORD_UPPERCASE.test(password),
        number: PRECOMPILED_REGEX.PASSWORD_NUMBER.test(password),
        special: PRECOMPILED_REGEX.PASSWORD_SPECIAL.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    let level = 'weak';
    if (strength >= 5) level = 'strong';
    else if (strength >= 4) level = 'good';
    else if (strength >= 3) level = 'fair';

    return { strength, level, checks };
};

// 添加统一样式
const formValidatorStyles = document.createElement('style');
formValidatorStyles.textContent = `
    /* ========== Form Validator Styles - UX-P1-004 Fix ========== */
    
    /* 表单字段包装器 */
    .form-group,
    .form-field,
    .nhub-form-group {
        position: relative;
        margin-bottom: 1.25rem;
    }
    
    /* 输入框基础样式 */
    .form-group input,
    .form-group textarea,
    .form-group select,
    .form-field input,
    .form-field textarea,
    .form-field select,
    .nhub-form-group input,
    .nhub-form-group textarea,
    .nhub-form-group select {
        width: 100%;
        padding: 0.625rem 0.875rem;
        font-size: 0.9375rem;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 0.5rem;
        background: white;
        transition: all 0.15s ease;
    }
    
    /* 错误状态 */
    .form-group input.error,
    .form-field input.error,
    .nhub-form-group input.error,
    .form-group textarea.error,
    .form-field textarea.error,
    .nhub-form-group textarea.error {
        border-color: var(--color-error, #ef4444);
        background-color: var(--color-error-light, #fef2f2);
        padding-right: 2.5rem;
    }
    
    /* 成功状态 */
    .form-group input.success,
    .form-field input.success,
    .nhub-form-group input.success,
    .form-group textarea.success,
    .form-field textarea.success,
    .nhub-form-group textarea.success {
        border-color: var(--color-success, #10b981);
        padding-right: 2.5rem;
    }
    
    /* 错误提示 - 统一位置在输入框下方 */
    .form-error {
        display: none;
        margin-top: 0.375rem;
        font-size: 0.8125rem;
        color: var(--color-error, #ef4444);
        line-height: 1.4;
        animation: form-error-fade-in 0.2s ease;
    }
    
    .form-error--visible {
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }
    
    .form-error::before {
        content: '⚠';
        font-size: 0.875rem;
    }
    
    @keyframes form-error-fade-in {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* 悬浮提示模式 */
    .form-error--tooltip {
        position: absolute;
        left: 100%;
        top: 0;
        margin-left: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--color-error, #ef4444);
        color: white;
        border-radius: 0.375rem;
        white-space: nowrap;
        z-index: 100;
    }
    
    .form-error--tooltip::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 4px 4px 4px 0;
        border-style: solid;
        border-color: transparent var(--color-error, #ef4444) transparent transparent;
    }
    
    /* 成功状态图标 */
    .form-success {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.25rem;
        height: 1.25rem;
        display: none;
        align-items: center;
        justify-content: center;
        color: var(--color-success, #10b981);
        font-weight: bold;
        pointer-events: none;
    }
    
    .form-group input.success ~ .form-success,
    .form-field input.success ~ .form-success,
    .nhub-form-group input.success ~ .form-success {
        display: inline-flex;
    }
    
    /* 错误汇总 */
    .form-error-summary {
        margin-bottom: 1rem;
        padding: 1rem;
        background: var(--color-error-light, #fef2f2);
        border: 1px solid var(--color-error, #ef4444);
        border-radius: 0.5rem;
        animation: form-error-fade-in 0.3s ease;
    }
    
    .form-error-summary__content {
        color: var(--color-error, #ef4444);
    }
    
    .form-error-summary__content strong {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .form-error-summary__content ul {
        margin: 0;
        padding-left: 1.25rem;
    }
    
    .form-error-summary__content li {
        margin-bottom: 0.25rem;
    }
    
    .form-error-summary__content a {
        color: var(--color-error, #ef4444);
        text-decoration: underline;
    }
    
    .form-error-summary__content a:hover {
        text-decoration: none;
    }
    
    /* 抖动动画 */
    .form-field--shake {
        animation: form-field-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
    
    @keyframes form-field-shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    
    /* 响应式调整 */
    @media (max-width: 640px) {
        .form-error--tooltip {
            position: static;
            margin-left: 0;
            margin-top: 0.375rem;
        }
        
        .form-error--tooltip::before {
            display: none;
        }
    }
`;
document.head.appendChild(formValidatorStyles);

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}

if (typeof window !== 'undefined') {
    window.FormValidator = FormValidator;
}

export { FormValidator, FORM_VALIDATOR_CONFIG };
export default FormValidator;
