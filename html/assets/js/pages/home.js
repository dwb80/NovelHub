import { NOVELS } from '../mock/data.js';
import { createNovelCardGrid, createNovelCardHorizontal } from '../components/novel-card.js';
import { checkAndShowEmptyState } from '../fixes/index.js';

export async function initHomePage() {
    const recommendedContainer = document.getElementById('recommendedNovels');
    const latestContainer = document.getElementById('latestNovels');
    const personalizedContainer = document.getElementById('personalizedNovels');

    if (recommendedContainer) {
        const recommended = NOVELS.filter(n => n.isHot).slice(0, 6);
        const isEmpty = checkAndShowEmptyState(recommendedContainer, recommended, 'default', {
            title: '暂无推荐小说',
            description: '推荐内容正在准备中，请稍后再来',
            actionText: '浏览全部',
            actionLink: 'pages/novel/category.html'
        });
        if (!isEmpty) {
            recommendedContainer.innerHTML = recommended.map(novel => createNovelCardGrid(novel)).join('');
        }
    }

    if (latestContainer) {
        const latest = NOVELS.filter(n => n.isNew).slice(0, 6);
        const isEmpty = checkAndShowEmptyState(latestContainer, latest, 'default', {
            title: '暂无新书',
            description: '新书正在上架中，敬请期待',
            actionText: '查看热门',
            actionLink: 'pages/novel/ranking.html'
        });
        if (!isEmpty) {
            latestContainer.innerHTML = latest.map(novel => createNovelCardGrid(novel)).join('');
        }
    }

    if (personalizedContainer) {
        const personalized = NOVELS.slice(0, 5);
        const isEmpty = checkAndShowEmptyState(personalizedContainer, personalized, 'default', {
            title: '暂无个性化推荐',
            description: '阅读更多小说以获取个性化推荐',
            actionText: '去发现好书',
            actionLink: 'pages/novel/category.html'
        });
        if (!isEmpty) {
            personalizedContainer.innerHTML = personalized.map(novel => createNovelCardHorizontal(novel)).join('');
        }
    }
}

export function initSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            searchInput.focus();
        });
    }

    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length === 0) {
                searchResults.innerHTML = '<div class="search-hint">输入关键词开始搜索</div>';
                return;
            }

            const results = NOVELS.filter(novel => 
                novel.title.toLowerCase().includes(query) ||
                novel.author.toLowerCase().includes(query) ||
                novel.tags.some(tag => tag.toLowerCase().includes(query))
            ).slice(0, 8);

            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-hint">未找到相关小说</div>';
                return;
            }

            searchResults.innerHTML = results.map(novel => `
                <div class="search-result-item" onclick="window.location.href='pages/novel/detail.html?id=${novel.id}'">
                    <img src="${novel.cover}" alt="${novel.title}" class="search-result-cover">
                    <div class="search-result-info">
                        <h4 class="search-result-title">${novel.title}</h4>
                        <p class="search-result-author">${novel.author}</p>
                        <div class="search-result-tags">
                            ${novel.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }
}

