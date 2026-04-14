import { NOVELS, CHAPTERS, COMMENTS } from '../mock/data.js';
import { showToast } from '../components/toast.js';

function getNovelIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id')) || 1;
}

export function initDetailPage() {
    const novelId = getNovelIdFromUrl();
    const novel = NOVELS.find(n => n.id === novelId);

    if (!novel) {
        window.location.href = '../../index.html';
        return;
    }

    renderNovelDetail(novel);
    renderChapterList(novelId);
    renderComments(novelId);
    initActions(novel);
}

function renderNovelDetail(novel) {
    document.title = `${novel.title} - ${novel.category} | NovelHub`;

    const coverImg = document.querySelector('.novel-detail-cover img');
    if (coverImg) coverImg.src = novel.cover;

    const titleEl = document.querySelector('.novel-detail-title');
    if (titleEl) titleEl.textContent = novel.title;

    const authorEl = document.querySelector('.author-name');
    if (authorEl) authorEl.textContent = novel.author;

    const authorIdEl = document.querySelector('.author-id');
    if (authorIdEl) authorIdEl.textContent = novel.authorId;

    const badgesEl = document.querySelector('.novel-detail-tags');
    if (badgesEl) {
        const statusClass = novel.status === '完结' ? 'badge-success' : 'badge-warning';
        badgesEl.innerHTML = `
            <span class="badge badge-primary">${novel.category}</span>
            <span class="badge ${statusClass}">${novel.status}</span>
            ${novel.isHot ? '<span class="badge badge-danger">热门</span>' : ''}
            ${novel.isNew ? '<span class="badge badge-info">新书</span>' : ''}
        `;
    }

    const statsEl = document.querySelector('.novel-detail-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat">
                <span class="stat-value">${(novel.wordCount / 10000).toFixed(1)}</span>
                <span class="stat-label">万字</span>
            </div>
            <div class="stat">
                <span class="stat-value">${novel.chapterCount}</span>
                <span class="stat-label">章节</span>
            </div>
            <div class="stat">
                <span class="stat-value">${(novel.subscriberCount / 10000).toFixed(2)}</span>
                <span class="stat-label">万人在读</span>
            </div>
            <div class="stat">
                <span class="stat-value">${novel.rating}</span>
                <span class="stat-label">评分</span>
            </div>
        `;
    }

    const descEl = document.querySelector('.novel-description');
    if (descEl) descEl.textContent = novel.description;

    const countEl = document.querySelector('.comment-count');
    if (countEl) {
        const novelComments = COMMENTS.filter(c => c.novelId === novel.id);
        countEl.textContent = `(${novelComments.length})`;
    }
}

function renderChapterList(novelId) {
    const chapterList = document.getElementById('chapterList');
    if (!chapterList) return;

    const chapters = CHAPTERS.filter(c => c.novelId === novelId).slice(0, 15);

    chapterList.innerHTML = chapters.map((chapter, index) => {
        const isNew = index >= chapters.length - 3;
        return `
            <div class="chapter-item ${isNew ? 'chapter-new' : ''}">
                <a href="../reader/reading.html?id=${novelId}&chapter=${chapter.id}" class="chapter-link">
                    <span class="chapter-title">${chapter.title}</span>
                    <span class="chapter-meta">
                        ${isNew ? '<span class="chapter-status new">新</span>' : ''}
                        <span class="chapter-date">${chapter.publishTime}</span>
                        <span class="chapter-words">${chapter.wordCount}字</span>
                    </span>
                </a>
            </div>
        `;
    }).join('');
}

function renderComments(novelId) {
    const commentList = document.querySelector('.comment-list');
    if (!commentList) return;

    const novelComments = COMMENTS.filter(c => c.novelId === novelId);
    const hasFiltered = novelComments.some(c => c.isFiltered);

    const noticeEl = document.getElementById('filterNotice');
    if (noticeEl && hasFiltered) {
        noticeEl.style.display = 'flex';
    }

    commentList.innerHTML = novelComments.map(comment => `
        <div class="comment-item ${comment.isFiltered ? 'comment-filtered' : ''}">
            <div class="comment-avatar">
                <span class="avatar">${comment.userName.charAt(0)}</span>
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.userName}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <p class="comment-text">${comment.content}</p>
                <div class="comment-actions">
                    <button class="comment-action" data-comment-id="${comment.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        ${comment.likes}
                    </button>
                    <button class="comment-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        回复
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initActions(novel) {
    const startReadingBtn = document.getElementById('startReadingBtn');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', () => {
            window.location.href = `../reader/reading.html?id=${novel.id}&chapter=1`;
        });
    }

    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
        let subscribed = false;
        subscribeBtn.addEventListener('click', () => {
            subscribed = !subscribed;
            if (subscribed) {
                subscribeBtn.classList.add('btn-primary');
                subscribeBtn.classList.remove('btn-secondary');
                subscribeBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    已收藏
                `;
                showToast('已添加到书架', 'success');
            } else {
                subscribeBtn.classList.remove('btn-primary');
                subscribeBtn.classList.add('btn-secondary');
                subscribeBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 1.25rem; height: 1.25rem;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    收藏
                `;
                showToast('已取消收藏', 'info');
            }
        });
    }

    const loadMoreBtn = document.getElementById('loadMoreChapters');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            showToast('已加载全部章节', 'info');
        });
    }

    const submitComment = document.getElementById('submitComment');
    if (submitComment) {
        submitComment.addEventListener('click', () => {
            const input = document.getElementById('commentInput');
            if (input && input.value.trim()) {
                showToast('评论发布成功', 'success');
                input.value = '';
            } else {
                showToast('请输入评论内容', 'warning');
            }
        });
    }

    document.querySelectorAll('.comment-action').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.commentId) {
                showToast('点赞成功', 'success');
            }
        });
    });
}
