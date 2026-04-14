import { NOVELS, CHAPTERS, READING_PROGRESS } from '../mock/data.js';
import { initTheme, getCurrentTheme, setTheme } from '../modules/theme.js';
import { showToast } from '../components/toast.js';

function getParamsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return {
        novelId: parseInt(params.get('id')) || 1,
        chapterId: parseInt(params.get('chapter')) || 1
    };
}

export function initReadingPage() {
    initTheme();
    const { novelId, chapterId } = getParamsFromUrl();
    const novel = NOVELS.find(n => n.id === novelId);
    const chapter = CHAPTERS.find(c => c.novelId === novelId && c.id === chapterId);

    if (!novel || !chapter) {
        window.location.href = '../../index.html';
        return;
    }

    renderReadingContent(novel, chapter);
    initNavigation(novelId, chapterId);
    initSettings();
    initReadingProgress();
    startProgressSync(novelId, chapterId);
}

function renderReadingContent(novel, chapter) {
    document.title = `阅读 - ${novel.title} ${chapter.title} | NovelHub`;

    const titleEl = document.querySelector('.reader-title');
    if (titleEl) {
        titleEl.textContent = `${novel.title} · ${chapter.title}`;
    }

    const indicatorEl = document.querySelector('.chapter-indicator');
    if (indicatorEl) {
        const chapterIndex = CHAPTERS.filter(c => c.novelId === novel.id).findIndex(c => c.id === chapter.id) + 1;
        indicatorEl.textContent = `第 ${chapterIndex} / ${novel.chapterCount} 章`;
    }

    const contentEl = document.getElementById('readerContent');
    if (contentEl) {
        contentEl.innerHTML = generateChapterContent(novel, chapter);
    }
}

function generateChapterContent(novel, chapter) {
    const paragraphs = [
        `第${chapter.id}章的内容开始了……`,
        '',
        `这是${novel.title}的精彩章节。晨光透过窗户洒落在房间里，新的一天开始了。`,
        '',
        '主角缓缓睁开眼睛，感受着体内的力量流动。经过一夜的修炼，他的境界又有了新的突破。',
        '',
        '“终于突破了！”主角心中一阵激动。这一步，他已经等待了太久。',
        '',
        '门外传来敲门声，是他的忠实追随者。“主人，有人送来一份邀请函。”',
        '',
        '主角接过邀请函，上面印着古老的纹章。这是来自上古世家的邀请，邀请他参加三年一度的秘境试炼。',
        '',
        '“秘境试炼……”主角眼中闪过一丝精光。据说在那秘境之中，藏着无数天材地宝，甚至有可能找到传说中的突破契机。',
        '',
        '他站起身，望向窗外。远方的天空中，乌云正在聚集，一场风暴即将来临。',
        '',
        '“看来，平静的日子结束了。”主角微微一笑，眼中充满了期待。',
        '',
        '他知道，这将是一场艰难的旅程。但他也相信，只有在风雨之中，才能真正成长。',
        '',
        '收拾好行装，主角踏上了新的征程。前方的路充满了未知，但他无所畏惧。',
        '',
        '因为他知道，每一次挑战，都是一次成长的机会。',
        '',
        '（本章完）'
    ];

    return paragraphs.map(p => p ? `<p>${p}</p>` : '<p><br></p>').join('');
}

function initNavigation(novelId, chapterId) {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = `../novel/detail.html?id=${novelId}`;
        });
    }

    const chapters = CHAPTERS.filter(c => c.novelId === novelId);
    const currentIndex = chapters.findIndex(c => c.id === chapterId);

    const prevBtn = document.getElementById('prevChapter');
    const nextBtn = document.getElementById('nextChapter');

    if (prevBtn) {
        if (currentIndex > 0) {
            prevBtn.disabled = false;
            prevBtn.addEventListener('click', () => {
                window.location.href = `reading.html?id=${novelId}&chapter=${chapters[currentIndex - 1].id}`;
            });
        } else {
            prevBtn.disabled = true;
        }
    }

    if (nextBtn) {
        if (currentIndex < chapters.length - 1) {
            nextBtn.disabled = false;
            nextBtn.addEventListener('click', () => {
                window.location.href = `reading.html?id=${novelId}&chapter=${chapters[currentIndex + 1].id}`;
            });
        } else {
            nextBtn.disabled = true;
        }
    }
}

function initSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');

    if (settingsBtn && settingsPanel) {
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#settingsBtn') && !e.target.closest('#settingsPanel')) {
                settingsPanel.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.settings-option[data-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);

            document.querySelectorAll('.settings-option[data-theme]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });

    let currentFontSize = 18;
    const fontSizeValue = document.getElementById('fontSizeValue');

    document.getElementById('increaseFontSize')?.addEventListener('click', () => {
        if (currentFontSize < 28) {
            currentFontSize += 2;
            updateFontSize(currentFontSize, fontSizeValue);
        }
    });

    document.getElementById('decreaseFontSize')?.addEventListener('click', () => {
        if (currentFontSize > 12) {
            currentFontSize -= 2;
            updateFontSize(currentFontSize, fontSizeValue);
        }
    });
}

function updateFontSize(size, valueEl) {
    const contentEl = document.getElementById('readerContent');
    if (contentEl) {
        contentEl.style.fontSize = `${size}px`;
    }
    if (valueEl) {
        valueEl.textContent = `${size}px`;
    }
}

function initReadingProgress() {
    const progressEl = document.getElementById('readingProgress');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min((scrollTop / docHeight) * 100, 100);

        if (progressEl) {
            progressEl.style.width = `${progress}%`;
        }
    });
}

function startProgressSync(novelId, chapterId) {
    const syncStatus = document.getElementById('syncStatus');
    let syncAttempts = 0;
    const maxAttempts = 3;

    const sync = () => {
        syncAttempts++;

        if (syncAttempts <= maxAttempts) {
            syncStatus.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" style="animation: spin 1s linear infinite;"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span>同步中...</span>
            `;

            setTimeout(() => {
                syncStatus.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-success);">
                        <polyline points="23 4 23 10 17 10"/>
                        <polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    <span>已同步</span>
                `;
                showToast('阅读进度已同步', 'success');
            }, 1000);
        } else {
            syncStatus.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-error);">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>同步失败</span>
            `;
            showToast('阅读进度同步失败，将重试', 'warning');
        }
    };

    setTimeout(sync, 500);
    setInterval(sync, 60000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
