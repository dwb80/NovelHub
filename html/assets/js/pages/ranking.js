import { showToast } from '../components/toast.js';
import { NOVELS, formatNumber } from '../mock/data.js';

export function initRankingPage() {
    initPeriodTabs();
    initRankingTypes();
    loadRanking('week', 'popular');
}

function initPeriodTabs() {
    const tabs = document.querySelectorAll('.ranking-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const period = tab.dataset.period;
            const activeType = document.querySelector('.ranking-type-item.active');
            const type = activeType ? activeType.dataset.type : 'popular';
            
            showToast(`切换到${tab.textContent}`, 'info');
            loadRanking(period, type);
        });
    });
}

function initRankingTypes() {
    const types = document.querySelectorAll('.ranking-type-item');
    types.forEach(type => {
        type.addEventListener('click', () => {
            types.forEach(t => t.classList.remove('active'));
            type.classList.add('active');
            
            const rankingType = type.dataset.type;
            const activePeriod = document.querySelector('.ranking-tab.active');
            const period = activePeriod ? activePeriod.dataset.period : 'week';
            
            loadRanking(period, rankingType);
        });
    });
}

function loadRanking(period, type) {
    const rankingList = document.getElementById('rankingList');
    if (!rankingList) return;

    let data = [...NOVELS].slice(0, 20).map((novel, index) => ({
        ...novel,
        rank: index + 1,
        trend: index < 5 ? 'up' : (Math.random() > 0.5 ? 'up' : (Math.random() > 0.5 ? 'down' : 'same')),
        change: Math.floor(Math.random() * 10),
        isNew: index < 3
    }));
    
    if (type === 'collect') {
        data.sort((a, b) => b.subscriberCount - a.subscriberCount);
    } else if (type === 'recommend') {
        data.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (type === 'words') {
        data.sort((a, b) => b.wordCount - a.wordCount);
    } else if (type === 'new') {
        data = data.filter(n => n.isNew).concat(data.filter(n => !n.isNew));
    }

    renderRankingList(data, rankingList);
}

function renderRankingList(data, container) {
    container.innerHTML = data.map((item, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const trendIcon = getTrendIcon(item.trend);
        const trendClass = item.isNew ? 'trend-new' : item.trend;
        const hotValue = item.todayViews || item.subscriberCount;
        
        return `
            <div class="ranking-item" data-id="${item.id}">
                <div class="ranking-item-rank ${rankClass}">${index + 1}</div>
                <div class="ranking-item-cover ranking-cover">
                    <img src="${item.cover}" alt="${item.title}">
                </div>
                <div class="ranking-item-info">
                    <h3 class="ranking-item-title">${item.title}</h3>
                    <p class="ranking-item-meta">
                        <span class="ranking-item-author">${item.author}</span>
                        <span class="ranking-item-category">${item.category}</span>
                        <span class="ranking-item-status ${item.status === '连载' ? 'ongoing' : 'completed'}">${item.status}</span>
                    </p>
                </div>
                <div class="ranking-item-stats ranking-stats">
                    <span class="ranking-item-hot">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.75 9 13.91 8.81 13.95C8.42 14.04 8.03 14.09 7.64 14.09C5.44 14.09 3.51 12.68 2.51 10.56C2.29 10.08 2.11 9.57 2 9V9C2 14.33 5.79 18.76 11 19.86V22H13V19.85C14.47 19.55 15.83 18.96 17 18.11C17.65 17.64 18.23 17.1 18.73 16.5C20.63 14.26 21.33 11.19 20.17 8.52C19.7 8.56 19.22 8.66 18.76 8.8C18.37 8.92 18 9.06 17.66 11.2Z"/>
                        </svg>
                        ${formatNumber(hotValue)}
                    </span>
                    <span class="ranking-item-trend ${trendClass}">
                        ${item.isNew ? 'NEW' : trendIcon + (item.trend !== 'same' ? item.change : '-')}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.ranking-item').forEach(item => {
        item.addEventListener('click', () => {
            window.location.href = '../novel/detail.html?id=' + item.dataset.id;
        });
    });
}

function getTrendIcon(trend) {
    switch (trend) {
        case 'up':
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>`;
        case 'down':
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>`;
        default:
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>`;
    }
}
