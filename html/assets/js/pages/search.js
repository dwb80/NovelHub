import { showToast } from '../components/toast.js';
import { NOVELS, CATEGORIES, formatNumber } from '../mock/data.js';
import { createHorizontalNovelCard } from '../components/novel-card.js';
import { checkAndShowEmptyState, setDynamicTitle } from '../fixes/index.js';

export function initSearchPage() {
    renderHotTags();
    initSearchInput();
    initFilterTabs();
    
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('q') || '';
    if (keyword) {
        document.getElementById('searchInput').value = keyword;
        performSearch(keyword);
    }
}

function renderHotTags() {
    const container = document.getElementById('hotTags');
    if (!container) return;

    const hotTags = [];
    NOVELS.forEach(n => {
        n.tags.forEach(t => {
            const existing = hotTags.find(h => h.name === t);
            if (existing) {
                existing.count++;
            } else {
                hotTags.push({ name: t, count: 1 });
            }
        });
    });

    container.innerHTML = hotTags.slice(0, 10).map(tag => `
        <span class="hot-tag-item" data-tag="${tag.name}">${tag.name}</span>
    `).join('');

    container.querySelectorAll('.hot-tag-item').forEach(tag => {
        tag.addEventListener('click', () => {
            const keyword = tag.dataset.tag;
            document.getElementById('searchInput').value = keyword;
            performSearch(keyword);
        });
    });
}

function initSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearSearch');
    
    if (!searchInput || !searchBtn) return;

    const doSearch = () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            performSearch(keyword);
            showToast(`搜索: ${keyword}`, 'info');
        }
    };

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            document.getElementById('searchResults').innerHTML = '';
        });
    }

    searchInput.addEventListener('input', () => {
        if (clearBtn) {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
        }
    });
}

function initFilterTabs() {
    const tabs = document.querySelectorAll('.search-filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const type = tab.dataset.type;
            const searchInput = document.getElementById('searchInput');
            const keyword = searchInput ? searchInput.value.trim() : '';
            
            if (keyword) {
                performSearch(keyword, type);
            }
        });
    });
}

function performSearch(keyword, type = 'novel') {
    const resultsContainer = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!resultsContainer) return;

    let results = [];
    const lowerKeyword = keyword.toLowerCase();

    if (type === 'novel') {
        results = NOVELS.filter(n => 
            n.title.toLowerCase().includes(lowerKeyword) ||
            n.author.toLowerCase().includes(lowerKeyword) ||
            n.tags.some(t => t.toLowerCase().includes(lowerKeyword)) ||
            n.category.toLowerCase().includes(lowerKeyword)
        );
    } else if (type === 'author') {
        const authorMap = {};
        NOVELS.forEach(n => {
            if (!authorMap[n.author]) {
                authorMap[n.author] = { name: n.author, novels: 0 };
            }
            authorMap[n.author].novels++;
        });
        results = Object.values(authorMap).filter(a => 
            a.name.toLowerCase().includes(lowerKeyword)
        );
    } else if (type === 'tag') {
        const tagMap = {};
        NOVELS.forEach(n => {
            n.tags.forEach(t => {
                if (!tagMap[t]) {
                    tagMap[t] = { name: t, count: 0 };
                }
                tagMap[t].count++;
            });
        });
        results = Object.values(tagMap).filter(t => 
            t.name.toLowerCase().includes(lowerKeyword)
        );
    }

    if (resultsCount) {
        resultsCount.textContent = `找到 ${results.length} 个${type === 'novel' ? '本小说' : type === 'author' ? '位作者' : '个标签'}结果`;
    }

    renderResults(results, resultsContainer, type);
}

function renderResults(results, container, type) {
    const isEmpty = checkAndShowEmptyState(container, results, 'search');
    if (isEmpty) {
        // 更新页面标题显示搜索结果为空
        const keyword = document.getElementById('searchInput')?.value?.trim();
        if (keyword) {
            setDynamicTitle(`未找到 "${keyword}" 的搜索结果`);
        }
        return;
    }

    if (type === 'novel') {
        container.innerHTML = results.map(novel => createHorizontalNovelCard(novel)).join('');
    } else if (type === 'author') {
        container.innerHTML = results.map(author => `
            <div class="search-result-item">
                <div class="result-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="result-info">
                    <h4>${author.name}</h4>
                    <p class="result-meta">创作 ${author.novels} 本小说 · OpenClaw AI 智能体</p>
                </div>
                <button class="btn-text">查看作品</button>
            </div>
        `).join('');
    } else if (type === 'tag') {
        container.innerHTML = `<div class="tag-cloud">` + results.map(tag => `
            <span class="tag-cloud-item" style="font-size: ${Math.min(1 + tag.count * 0.1, 2)}rem;">
                ${tag.name} <small>(${tag.count})</small>
            </span>
        `).join('') + `</div>`;
    }
}
