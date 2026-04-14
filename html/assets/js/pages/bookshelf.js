import { BOOKSHELF_DATA } from '../mock/data.js';
import { createBookshelfCard } from '../components/novel-card.js';
import { showToast } from '../components/toast.js';
import { checkAndShowEmptyState } from '../fixes/index.js';

const TAB_CONFIG = {
    reading: { label: '正在阅读', filter: item => item.progress > 0 && item.progress < 100 },
    finished: { label: '已读完', filter: item => item.progress >= 100 },
    favorite: { label: '我的收藏', filter: item => item.isFavorite }
};

export function initBookshelfPage() {
    initTabs();
    renderBookshelf('reading');
    initBatchActions();
}

function initTabs() {
    const tabs = document.querySelectorAll('.bookshelf-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.dataset.tab;
            renderBookshelf(tabType);
        });
    });
}

function renderBookshelf(tabType) {
    const container = document.getElementById('bookshelfGrid');
    if (!container) return;

    const config = TAB_CONFIG[tabType];
    const items = BOOKSHELF_DATA.filter(config.filter);

    // 根据标签类型设置不同的空状态提示
    const emptyStateConfig = {
        reading: { title: '暂无正在阅读的小说', description: '开始阅读小说，进度将显示在这里' },
        finished: { title: '暂无已读完的小说', description: '读完的小说会显示在这里' },
        favorite: { title: '暂无收藏的小说', description: '收藏喜欢的小说，方便下次快速阅读' }
    };

    const isEmpty = checkAndShowEmptyState(container, items, 'bookshelf', emptyStateConfig[tabType] || {});
    if (isEmpty) {
        return;
    }

    container.innerHTML = items.map(item => createBookshelfCard(item)).join('');

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const novelId = parseInt(btn.dataset.novelId);
            removeFromBookshelf(novelId);
        });
    });

    container.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const novelId = parseInt(btn.dataset.novelId);
            toggleFavorite(novelId);
        });
    });
}

function removeFromBookshelf(novelId) {
    const index = BOOKSHELF_DATA.findIndex(item => item.novelId === novelId);
    if (index !== -1) {
        BOOKSHELF_DATA.splice(index, 1);

        const activeTab = document.querySelector('.bookshelf-tab.active');
        renderBookshelf(activeTab.dataset.tab);

        showToast('已从书架移除', 'success');
    }
}

function toggleFavorite(novelId) {
    const item = BOOKSHELF_DATA.find(item => item.novelId === novelId);
    if (item) {
        item.isFavorite = !item.isFavorite;

        const activeTab = document.querySelector('.bookshelf-tab.active');
        renderBookshelf(activeTab.dataset.tab);

        showToast(item.isFavorite ? '已添加收藏' : '已取消收藏', 'success');
    }
}

function initBatchActions() {
    const editBtn = document.getElementById('editBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const batchActions = document.querySelector('.batch-actions');
    const actionBar = document.querySelector('.bookshelf-actions');

    let isEditMode = false;

    editBtn?.addEventListener('click', () => {
        isEditMode = !isEditMode;
        batchActions.classList.toggle('active', isEditMode);
        actionBar.classList.toggle('edit-mode', isEditMode);

        const checkboxes = document.querySelectorAll('.bookshelf-checkbox');
        checkboxes.forEach(cb => cb.classList.toggle('visible', isEditMode));
    });

    cancelBtn?.addEventListener('click', () => {
        isEditMode = false;
        batchActions.classList.remove('active');
        actionBar.classList.remove('edit-mode');

        const checkboxes = document.querySelectorAll('.bookshelf-checkbox');
        checkboxes.forEach(cb => {
            cb.classList.remove('visible');
            cb.classList.remove('checked');
        });
    });

    selectAllBtn?.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.bookshelf-checkbox.visible');
        const allChecked = Array.from(checkboxes).every(cb => cb.classList.contains('checked'));

        checkboxes.forEach(cb => cb.classList.toggle('checked', !allChecked));
        selectAllBtn.textContent = allChecked ? '全选' : '取消全选';
    });

    deleteBtn?.addEventListener('click', () => {
        const checkedBoxes = document.querySelectorAll('.bookshelf-checkbox.checked');
        const count = checkedBoxes.length;

        if (count === 0) {
            showToast('请先选择要删除的书籍', 'warning');
            return;
        }

        checkedBoxes.forEach(cb => {
            const novelId = parseInt(cb.dataset.novelId);
            const index = BOOKSHELF_DATA.findIndex(item => item.novelId === novelId);
            if (index !== -1) {
                BOOKSHELF_DATA.splice(index, 1);
            }
        });

        isEditMode = false;
        batchActions.classList.remove('active');
        actionBar.classList.remove('edit-mode');

        const activeTab = document.querySelector('.bookshelf-tab.active');
        renderBookshelf(activeTab.dataset.tab);

        showToast(`已删除 ${count} 本书籍`, 'success');
    });
}
