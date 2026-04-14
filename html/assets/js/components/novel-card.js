/**
 * Novel Card Component
 * NovelHub UI Component
 */

// Default formatter if import fails
function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

/**
 * Create badge HTML based on novel properties
 * @param {Object} novel - Novel data object
 * @returns {string} Badge HTML string
 */
function createBadges(novel) {
    const badges = [];
    if (novel.isNew) badges.push('<span class="badge badge-primary novel-badge">新书</span>');
    if (novel.isHot) badges.push('<span class="badge badge-warning novel-badge">热门</span>');
    if (novel.status === '完结') badges.push('<span class="badge badge-success novel-badge">完结</span>');
    if (novel.status === '连载') badges.push('<span class="badge badge-info novel-badge">连载</span>');
    return badges.join('');
}

/**
 * Create star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @returns {string} Star rating HTML
 */
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    if (hasHalfStar) {
        starsHtml += '<svg viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon fill="url(#half)" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    
    return starsHtml;
}

/**
 * Create a grid-style novel card
 * @param {Object} novel - Novel data object
 * @param {Object} options - Optional configuration
 * @returns {string} Card HTML string
 */
export function createNovelCardGrid(novel, options = {}) {
    const { showRating = true, showWordCount = true, lazyLoad = true } = options;
    const badges = createBadges(novel);
    
    return `
        <article class="novel-card card card-clickable" data-novel-id="${novel.id}" role="article" aria-label="${novel.title}">
            <div class="novel-cover">
                <img src="${novel.cover}" alt="${novel.title}封面" ${lazyLoad ? 'loading="lazy"' : ''}>
                ${badges}
            </div>
            <div class="novel-info">
                <h3 class="novel-title" title="${novel.title}">${novel.title}</h3>
                <p class="novel-author">${novel.author}</p>
                <div class="novel-stats">
                    ${showWordCount ? `
                    <span class="novel-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        ${formatNumber(novel.wordCount)}字
                    </span>
                    ` : ''}
                    ${showRating ? `
                    <span class="novel-stat">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px; color: #f59e0b;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${novel.rating}
                    </span>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

/**
 * Create a horizontal/list-style novel card
 * @param {Object} novel - Novel data object
 * @param {Object} options - Optional configuration
 * @returns {string} Card HTML string
 */
export function createNovelCardHorizontal(novel, options = {}) {
    const { maxTags = 3, showDescription = true, maxDescriptionLength = 100 } = options;
    const badges = createBadges(novel);
    const truncatedDescription = showDescription && novel.description 
        ? novel.description.slice(0, maxDescriptionLength) + (novel.description.length > maxDescriptionLength ? '...' : '')
        : '';
    
    return `
        <article class="novel-card-horizontal card card-clickable" data-novel-id="${novel.id}" role="article" aria-label="${novel.title}">
            <div class="novel-card-cover">
                <img src="${novel.cover}" alt="${novel.title}封面" loading="lazy">
            </div>
            <div class="novel-card-info">
                <div class="novel-card-header">
                    <h3 class="novel-card-title" title="${novel.title}">${novel.title}</h3>
                    ${badges}
                </div>
                <p class="novel-card-author">${novel.author}</p>
                ${novel.tags ? `
                <div class="tag-list" style="margin: 0.5rem 0;">
                    ${novel.tags.slice(0, maxTags).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${novel.tags.length > maxTags ? `<span class="tag">+${novel.tags.length - maxTags}</span>` : ''}
                </div>
                ` : ''}
                ${showDescription && truncatedDescription ? `<p class="novel-card-description">${truncatedDescription}</p>` : ''}
                <div class="novel-card-meta">
                    <span class="novel-card-category">${novel.category || '未分类'}</span>
                    <span class="novel-card-status ${novel.status === '连载' ? 'ongoing' : 'completed'}">${novel.status}</span>
                    <span class="novel-card-words">${formatNumber(novel.wordCount)}字</span>
                    <span class="novel-card-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${novel.rating}
                    </span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Create a bookshelf card with reading progress
 * @param {Object} novel - Novel data object
 * @param {number} progress - Reading progress (0-100)
 * @param {Object} options - Optional configuration
 * @returns {string} Card HTML string
 */
export function createBookshelfCard(novel, progress, options = {}) {
    const { 
        showProgressBar = true, 
        showChapterInfo = true,
        currentChapter = Math.floor(progress * (novel.chapterCount || 100) / 100),
        onRemove = null 
    } = options;
    
    const progressPercent = Math.min(Math.max(progress, 0), 100);
    
    return `
        <article class="bookshelf-item card card-clickable" data-novel-id="${novel.id}" data-progress="${progressPercent}" role="article" aria-label="${novel.title}">
            <div class="bookshelf-cover">
                <img src="${novel.cover}" alt="${novel.title}封面" loading="lazy">
                ${showProgressBar ? `
                <div class="bookshelf-progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                    <div class="bookshelf-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                ` : ''}
            </div>
            <div class="bookshelf-info">
                <h3 class="bookshelf-title" title="${novel.title}">${novel.title}</h3>
                <p class="bookshelf-author">${novel.author}</p>
                ${showChapterInfo ? `<p class="bookshelf-chapter">读到：第${currentChapter}章</p>` : ''}
                <div class="bookshelf-actions">
                    <button class="btn-primary btn-sm" data-action="continue">继续阅读</button>
                    ${onRemove ? `<button class="btn-ghost btn-sm" data-action="remove" data-novel-id="${novel.id}">移除</button>` : ''}
                </div>
            </div>
        </article>
    `;
}

/**
 * Create a compact novel card for search results
 * @param {Object} novel - Novel data object
 * @returns {string} Card HTML string
 */
export function createNovelCardCompact(novel) {
    return `
        <article class="novel-card-compact card card-clickable" data-novel-id="${novel.id}" role="article" aria-label="${novel.title}">
            <div class="novel-card-compact-cover">
                <img src="${novel.cover}" alt="${novel.title}封面" loading="lazy">
            </div>
            <div class="novel-card-compact-info">
                <h4 class="novel-card-compact-title" title="${novel.title}">${novel.title}</h4>
                <p class="novel-card-compact-author">${novel.author}</p>
                <div class="novel-card-compact-meta">
                    <span>${novel.category || '未分类'}</span>
                    <span class="novel-card-compact-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 12px; height: 12px;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${novel.rating}
                    </span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Create a featured/large novel card
 * @param {Object} novel - Novel data object
 * @returns {string} Card HTML string
 */
export function createNovelCardFeatured(novel) {
    const badges = createBadges(novel);
    
    return `
        <article class="novel-card-featured card card-clickable" data-novel-id="${novel.id}" role="article" aria-label="${novel.title}">
            <div class="novel-card-featured-cover">
                <img src="${novel.cover}" alt="${novel.title}封面">
                ${badges}
            </div>
            <div class="novel-card-featured-content">
                <h2 class="novel-card-featured-title" title="${novel.title}">${novel.title}</h2>
                <p class="novel-card-featured-author">${novel.author}</p>
                ${novel.description ? `<p class="novel-card-featured-description">${novel.description.slice(0, 150)}...</p>` : ''}
                <div class="novel-card-featured-meta">
                    <span class="badge badge-primary">${novel.category || '未分类'}</span>
                    <span class="novel-card-featured-stats">
                        <span>${formatNumber(novel.wordCount)}字</span>
                        <span class="novel-card-featured-rating">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            ${novel.rating}
                        </span>
                    </span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Attach click handlers to novel cards
 * @param {HTMLElement} container - Container element
 * @param {Function} onCardClick - Callback when card is clicked
 * @param {Function} onActionClick - Callback for action buttons
 */
export function attachCardHandlers(container, onCardClick, onActionClick) {
    container.addEventListener('click', (e) => {
        const card = e.target.closest('[data-novel-id]');
        if (!card) return;
        
        const novelId = card.dataset.novelId;
        const actionBtn = e.target.closest('[data-action]');
        
        if (actionBtn) {
            e.stopPropagation();
            const action = actionBtn.dataset.action;
            if (onActionClick) {
                onActionClick(novelId, action, actionBtn);
            }
        } else if (onCardClick) {
            onCardClick(novelId, card);
        }
    });
}

/**
 * Render novel cards to container
 * @param {HTMLElement} container - Target container
 * @param {Array} novels - Array of novel objects
 * @param {string} type - Card type: 'grid' | 'horizontal' | 'bookshelf' | 'compact' | 'featured'
 * @param {Object} options - Render options
 */
export function renderNovelCards(container, novels, type = 'grid', options = {}) {
    if (!container || !Array.isArray(novels)) return;
    
    const cardCreators = {
        grid: createNovelCardGrid,
        horizontal: createNovelCardHorizontal,
        bookshelf: (novel, opts) => createBookshelfCard(novel, opts.progress || 0, opts),
        compact: createNovelCardCompact,
        featured: createNovelCardFeatured
    };
    
    const createCard = cardCreators[type] || createNovelCardGrid;
    const html = novels.map(novel => createCard(novel, options)).join('');
    
    container.innerHTML = html;
    
    // Attach handlers if callbacks provided
    if (options.onCardClick || options.onActionClick) {
        attachCardHandlers(container, options.onCardClick, options.onActionClick);
    }
}

/**
 * Create novel card skeleton for loading states
 * @param {string} type - Card type
 * @returns {string} Skeleton HTML string
 */
export function createNovelCardSkeleton(type = 'grid') {
    if (type === 'horizontal') {
        return `
            <article class="novel-card-horizontal card" aria-hidden="true">
                <div class="novel-card-cover skeleton" style="width: 4rem; height: 5.5rem;"></div>
                <div class="novel-card-info" style="flex: 1;">
                    <div class="skeleton" style="height: 1.25rem; width: 70%; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton" style="height: 1rem; width: 50%; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton" style="height: 1.5rem; width: 100%; margin-top: 0.5rem;"></div>
                </div>
            </article>
        `;
    }
    
    // Grid style skeleton
    return `
        <article class="novel-card card" aria-hidden="true">
            <div class="novel-cover skeleton"></div>
            <div class="novel-info" style="padding: 0.75rem 0;">
                <div class="skeleton" style="height: 1rem; width: 90%; margin-bottom: 0.5rem;"></div>
                <div class="skeleton" style="height: 0.875rem; width: 60%; margin-bottom: 0.5rem;"></div>
                <div class="skeleton" style="height: 0.75rem; width: 80%;"></div>
            </div>
        </article>
    `;
}

/**
 * Render skeleton cards for loading states
 * @param {HTMLElement} container - Target container
 * @param {number} count - Number of skeleton cards
 * @param {string} type - Card type
 */
export function renderSkeletonCards(container, count = 6, type = 'grid') {
    if (!container) return;
    
    const html = Array(count).fill(null).map(() => createNovelCardSkeleton(type)).join('');
    container.innerHTML = html;
}

/**
 * Create novel card with animation on scroll
 * @param {Object} novel - Novel data object
 * @param {number} index - Card index for staggered animation
 * @param {Object} options - Card options
 * @returns {string} Card HTML with animation classes
 */
export function createNovelCardAnimated(novel, index = 0, options = {}) {
    const baseCard = createNovelCardGrid(novel, options);
    
    // Wrap in animation container
    return `
        <div class="novel-card-animate" style="animation-delay: ${index * 0.1}s">
            ${baseCard}
        </div>
    `;
}

/**
 * Create horizontal list item for novel
 * @param {Object} novel - Novel data object
 * @param {number} rank - Ranking number (optional)
 * @returns {string} List item HTML
 */
export function createNovelListItem(novel, rank = null) {
    return `
        <article class="novel-list-item card card-clickable" data-novel-id="${novel.id}" role="article" aria-label="${novel.title}">
            ${rank ? `
            <div class="novel-rank" style="display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; font-weight: 700; color: ${rank <= 3 ? '#f59e0b' : 'var(--color-text-muted)'}; background-color: ${rank <= 3 ? '#fef3c7' : 'var(--color-bg-tertiary)'}; border-radius: var(--radius-md); font-size: 0.875rem;">
                ${rank}
            </div>
            ` : ''}
            <div class="novel-list-cover">
                <img src="${novel.cover}" alt="${novel.title}封面" loading="lazy">
            </div>
            <div class="novel-list-content">
                <h3 class="novel-list-title" style="font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${novel.title}</h3>
                <p class="novel-list-author" style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">${novel.author}</p>
                <div class="novel-list-meta" style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: var(--color-text-muted);">
                    <span>${novel.wordCount ? formatNumber(novel.wordCount) + '字' : ''}</span>
                    <span style="display: flex; align-items: center; gap: 0.25rem;">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 12px; height: 12px; color: #f59e0b;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${novel.rating || '0'}
                    </span>
                    <span>${novel.status || ''}</span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Create novel card with hover preview
 * @param {Object} novel - Novel data object
 * @param {Object} options - Card options
 * @returns {string} Card HTML with preview
 */
export function createNovelCardWithPreview(novel, options = {}) {
    const badges = createBadges(novel);
    
    return `
        <article class="novel-card-preview card card-clickable" data-novel-id="${novel.id}" role="article" aria-label="${novel.title}">
            <div class="novel-preview-cover">
                <img src="${novel.cover}" alt="${novel.title}封面" loading="lazy">
                ${badges}
                <div class="novel-preview-overlay" style="position: absolute; inset: 0; background-color: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <button class="btn-primary btn-sm" data-action="read">开始阅读</button>
                    <button class="btn-ghost btn-sm" style="color: white;" data-action="add">加入书架</button>
                </div>
            </div>
            <div class="novel-info">
                <h3 class="novel-title" style="font-size: 0.9375rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${novel.title}</h3>
                <p class="novel-author" style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">${novel.author}</p>
                <div class="novel-stats" style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: var(--color-text-muted);">
                    <span class="novel-stat" style="display: flex; align-items: center; gap: 0.25rem;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        ${formatNumber(novel.wordCount)}字
                    </span>
                    <span class="novel-stat" style="display: flex; align-items: center; gap: 0.25rem;">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 14px; height: 14px; color: #f59e0b;">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${novel.rating}
                    </span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Add hover effect to preview cards
 */
export function initPreviewCardHover() {
    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.novel-card-preview');
        if (!card) return;
        
        const overlay = card.querySelector('.novel-preview-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.novel-card-preview');
        if (!card) return;
        
        const overlay = card.querySelector('.novel-preview-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
        }
    });
}

/**
 * Compare two novels for sorting
 * @param {Object} a - First novel
 * @param {Object} b - Second novel
 * @param {string} sortBy - Sort field: 'rating' | 'wordCount' | 'title' | 'updatedAt'
 * @param {string} order - Sort order: 'asc' | 'desc'
 * @returns {number} Comparison result
 */
export function compareNovels(a, b, sortBy = 'rating', order = 'desc') {
    let comparison = 0;
    
    switch (sortBy) {
        case 'rating':
            comparison = (a.rating || 0) - (b.rating || 0);
            break;
        case 'wordCount':
            comparison = (a.wordCount || 0) - (b.wordCount || 0);
            break;
        case 'title':
            comparison = (a.title || '').localeCompare(b.title || '', 'zh-CN');
            break;
        case 'updatedAt':
            comparison = new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
            break;
        default:
            comparison = 0;
    }
    
    return order === 'desc' ? -comparison : comparison;
}

/**
 * Sort and render novels
 * @param {HTMLElement} container - Target container
 * @param {Array} novels - Array of novel objects
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order
 * @param {string} cardType - Card type
 * @param {Object} options - Render options
 */
export function sortAndRenderNovels(container, novels, sortBy = 'rating', order = 'desc', cardType = 'grid', options = {}) {
    if (!container || !Array.isArray(novels)) return;
    
    const sorted = [...novels].sort((a, b) => compareNovels(a, b, sortBy, order));
    renderNovelCards(container, sorted, cardType, options);
}
