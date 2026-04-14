import { showToast } from '../components/toast.js';
import { CATEGORIES, NOVELS, formatNumber } from '../mock/data.js';
import { createHorizontalNovelCard } from '../components/novel-card.js';
import { checkAndShowEmptyState } from '../fixes/index.js';

export function initCategoryPage() {
    renderCategories();
    initFilterTabs();
    loadNovels('all');
}

function renderCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    if (!categoryGrid) return;

    const allCategory = { id: 'all', name: '全部', icon: '📚', count: 15000, color: '#6366f1' };
    const allCategories = [allCategory, ...CATEGORIES];

    categoryGrid.innerHTML = allCategories.map(cat => `
        <div class="category-card" data-category="${cat.id}" style="--cat-color: ${cat.color}">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-info">
                <div class="category-name">${cat.name}</div>
                <div class="category-count">${formatNumber(cat.count)}本</div>
            </div>
        </div>
    `).join('');

    categoryGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (card) {
            const categoryId = card.dataset.category;
            selectCategory(categoryId, allCategories);
        }
    });
}

function selectCategory(categoryId, allCategories) {
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.category === categoryId) {
            card.classList.add('active');
        }
    });

    const category = allCategories.find(c => c.id === categoryId);
    if (category) {
        showToast(`已选择: ${category.name}`, 'success');
    }

    loadNovels(categoryId);
}

function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const sortBy = tab.dataset.sort;
            sortNovels(sortBy);
        });
    });
}

function loadNovels(categoryId) {
    const novelList = document.getElementById('categoryNovelList');
    if (!novelList) return;

    const categoryName = CATEGORIES.find(c => c.id === parseInt(categoryId))?.name;
    let filteredNovels = categoryId === 'all' || !categoryName
        ? [...NOVELS] 
        : NOVELS.filter(n => n.category === categoryName);

    window.currentNovelList = filteredNovels;
    renderNovels(filteredNovels, novelList);
}

function sortNovels(sortBy) {
    const novelList = document.getElementById('categoryNovelList');
    if (!novelList) return;

    let sortedNovels = [...(window.currentNovelList || NOVELS)];
    
    switch (sortBy) {
        case 'popular':
            sortedNovels.sort((a, b) => b.subscriberCount - a.subscriberCount);
            break;
        case 'new':
            sortedNovels.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
            break;
        case 'rating':
            sortedNovels.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            break;
        case 'words':
            sortedNovels.sort((a, b) => b.wordCount - a.wordCount);
            break;
    }

    renderNovels(sortedNovels, novelList);
    showToast(`已按${document.querySelector(`.filter-tab[data-sort="${sortBy}"]`).textContent}排序`, 'info');
}

function renderNovels(novelsToRender, container) {
    const isEmpty = checkAndShowEmptyState(container, novelsToRender, 'category');
    if (isEmpty) {
        return;
    }

    container.innerHTML = novelsToRender.slice(0, 18).map(novel => createHorizontalNovelCard(novel)).join('');
}
