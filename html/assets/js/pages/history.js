import { showToast } from '../components/toast.js';
import { NOVELS, BOOKSHELF_DATA, formatNumber } from '../mock/data.js';

export function initHistoryPage() {
    renderReadingHistory();
    initBatchActions();
}

function renderReadingHistory() {
    const container = document.getElementById('historyContent');
    const emptyState = document.getElementById('historyEmpty');
    const clearBtn = document.getElementById('clearHistoryBtn');
    
    if (!container) return;

    const historyData = BOOKSHELF_DATA.map((item, idx) => ({
        ...item,
        readTime: idx < 3 ? '今天' : idx < 5 ? '昨天' : '本周'
    }));

    if (historyData.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    const grouped = {};
    historyData.forEach(item => {
        if (!grouped[item.readTime]) {
            grouped[item.readTime] = [];
        }
        grouped[item.readTime].push(item);
    });

    let html = '';
    Object.entries(grouped).forEach(([date, items]) => {
        html += `
            <div class="history-date-group">
                <div class="history-date">${date}</div>
                ${items.map(item => renderHistoryItem(item)).join('')}
            </div>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-remove-history').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const novelId = parseInt(btn.dataset.id);
            removeHistoryItem(novelId);
        });
    });

    container.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            window.location.href = '../reader/reading.html';
        });
    });
}

function renderHistoryItem(item) {
    const novel = NOVELS.find(n => n.id === item.novelId) || item.novel;
    return `
        <div class="history-item" data-id="${novel.id}">
            <div class="history-cover">
                <img src="${novel.cover}" alt="${novel.title}">
            </div>
            <div class="history-info">
                <div class="history-title-row">
                    <h3 class="history-title">${novel.title}</h3>
                    <span class="history-category">${novel.category}</span>
                </div>
                <p class="history-chapter">读到：${item.lastChapterTitle}</p>
                <p class="history-progress">阅读进度：${item.progress}%</p>
                <p class="history-time">${item.lastReadAt} · 阅读 ${Math.floor(Math.random() * 120 + 10)} 分钟</p>
            </div>
            <div class="history-actions">
                <button class="btn-primary btn-small" onclick="event.stopPropagation();window.location.href='../reader/reading.html?id=${novel.id}'">继续阅读</button>
                <button class="btn-icon btn-remove-history" data-id="${novel.id}" aria-label="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function removeHistoryItem(novelId) {
    const item = document.querySelector(`.history-item[data-id="${novelId}"]`);
    if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(100%)';
        setTimeout(() => {
            item.remove();
            showToast('已从阅读历史中移除', 'success');
            checkEmptyState();
        }, 300);
    }
}

function checkEmptyState() {
    const items = document.querySelectorAll('.history-item');
    const container = document.getElementById('historyContent');
    const emptyState = document.getElementById('historyEmpty');
    
    if (items.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

function initBatchActions() {
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('确定要清空所有阅读历史吗？')) {
                const container = document.getElementById('historyContent');
                const emptyState = document.getElementById('historyEmpty');
                container.style.display = 'none';
                emptyState.style.display = 'block';
                showToast('阅读历史已清空', 'success');
            }
        });
    }

    const exportBtn = document.getElementById('exportHistoryBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showToast('阅读历史已导出到剪贴板', 'success');
        });
    }
}
