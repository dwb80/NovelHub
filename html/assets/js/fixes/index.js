/**
 * NovelHub 统一修复模块
 * 包含：空状态处理、移动端菜单、图片占位符、表单验证、页面标题
 * @version 2.0.0
 */

// ========== 1. 空数据状态处理增强 ==========

/**
 * 统一图标库 - 使用一致的线条风格和尺寸
 * 所有图标使用 24x24 viewBox, stroke-width="1.5", 无填充
 */
const UNIFIED_ICONS = {
    bookshelf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    favorites: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    notifications: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    comments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    category: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    ranking: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
    network: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    offline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    maintenance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    unauthorized: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    forbidden: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    notFound: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    loading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>`,
    chapter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    bookmark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
    reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    author: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    review: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    admin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    novel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    ai: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12L2.5 12"/><circle cx="12" cy="12" r="3"/></svg>`,
    community: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    discover: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    sort: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
    arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
    chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>`,
    chevronUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="18 15 12 9 6 15"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6 9 12 15 18 9"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    trendingUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    trendingDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
    activity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    barChart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
    pieChart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
    database: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    shieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/></svg>`,
    alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    helpCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
    flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
    crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`,
    gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
    music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    volumeMute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    wifiOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
    bluetooth: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/></svg>`,
    cast: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><line x1="2" y1="20" x2="2.01" y2="20"/></svg>`,
    airplay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>`,
    monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    smartphone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    tablet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    laptop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    desktop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    printer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
    hardDrive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>`,
    cpu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    navigation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    anchor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    layout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    sidebar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`,
    slider: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
    tool: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    codepen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><polyline points="2 15.5 12 8.5 22 15.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
    gitlab: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>`,
    figma: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>`,
    slack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>`,
    chrome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>`,
    twitch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 6.498a2.25 2.25 0 0 0 .126 4.27l3.9 1.207a.75.75 0 0 0 .815-.244l3.3-4.047a.75.75 0 0 1 1.057-.135l.14.104 2.565 2.22a.75.75 0 0 0 .781.127l4.35-1.673a2.25 2.25 0 0 0 .99-3.625l-6.082-6.082a2.25 2.25 0 0 0-1.62-.66z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    wechat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c.89.31 1.87.5 2.91.5.39 0 .77-.03 1.14-.08-.19-.55-.29-1.13-.29-1.73 0-3.04 3.04-5.5 6.79-5.5.46 0 .91.04 1.34.11C17.6 5.67 13.89 4 9.5 4z"/><path d="M16.5 11c-3.04 0-5.5 2.01-5.5 4.5s2.46 4.5 5.5 4.5c.91 0 1.76-.17 2.5-.46L21 21l-.61-1.83c1.28-.95 2.11-2.35 2.11-3.92 0-2.49-2.46-4.25-5-4.25z"/></svg>`,
    weibo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.578-.172-.4-.621.386-.973.425-1.812.008-2.408-.781-1.114-2.92-1.054-5.362-.034 0 0-.768.334-.571-.271.378-1.207.32-2.217-.266-2.8-1.331-1.32-4.869.047-7.91 3.052C1.904 10.335.589 12.532.589 14.418c0 3.607 4.636 5.799 9.166 5.799 5.944 0 9.896-3.451 9.896-6.191 0-1.653-1.397-2.591-2.592-2.977z"/></svg>`,
    qq: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M12 17c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>`,
    alipay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5.5 2C3.57 2 2 3.57 2 5.5v13C2 20.43 3.57 22 5.5 22h13c1.93 0 3.5-1.57 3.5-3.5v-13C22 3.57 20.43 2 18.5 2h-13z"/><path d="M7 7h10M7 11h10M7 15h7"/></svg>`,
    wechatPay: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.56 2.78 4.66L4 17l2.5-1.5c.89.31 1.87.5 2.91.5.39 0 .77-.03 1.14-.08-.19-.55-.29-1.13-.29-1.73 0-3.04 3.04-5.5 6.79-5.5.46 0 .91.04 1.34.11C17.6 5.67 13.89 4 9.5 4z"/><path d="M16.5 11c-3.04 0-5.5 2.01-5.5 4.5s2.46 4.5 5.5 4.5c.91 0 1.76-.17 2.5-.46L21 21l-.61-1.83c1.28-.95 2.11-2.35 2.11-3.92 0-2.49-2.46-4.25-5-4.25z"/></svg>`,
    apple: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,
    android: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5.5 2C3.57 2 2 3.57 2 5.5v13C2 20.43 3.57 22 5.5 22h13c1.93 0 3.5-1.57 3.5-3.5v-13C22 3.57 20.43 2 18.5 2h-13z"/><path d="M7 7h10M7 11h10M7 15h7"/></svg>`,
    windows: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 5.5l7-.9v6.9H3V5.5z"/><path d="M11 4.5l10-1.5v8.5H11V4.5z"/><path d="M3 12.5h7v6.9l-7-.9v-6z"/><path d="M11 12.5h10V21l-10-1.5v-7z"/></svg>`,
    linux: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c-1.5 0-2.7.8-3.2 2-.3.7-.3 1.5-.2 2.2.1.7.4 1.4.7 2 .3.6.6 1.2.8 1.8.2.6.3 1.2.2 1.8-.1.6-.4 1.1-.8 1.5-.4.4-.9.7-1.4.9-.5.2-1 .3-1.5.3-.5 0-1-.1-1.5-.3-.5-.2-.9-.5-1.3-.9-.4-.4-.6-.9-.7-1.5-.1-.6 0-1.2.2-1.8.2-.6.5-1.2.8-1.8.3-.6.6-1.3.7-2 .1-.7.1-1.5-.2-2.2-.5-1.2-1.7-2-3.2-2C3.5 3 2 4.5 2 6.5c0 1.1.4 2.1 1.1 2.9.7.8 1.6 1.4 2.6 1.7 1 .3 2 .3 3 0 1-.3 1.9-.9 2.6-1.7.7-.8 1.1-1.8 1.1-2.9 0-2-1.5-3.5-3.5-3.5z"/></svg>`
};

// 空状态配置
const EMPTY_STATE_CONFIG = {
    bookshelf: {
        icon: 'bookshelf',
        title: '书架空空如也',
        description: '还没有收藏任何小说，快去发现精彩作品吧',
        actionText: '去发现好书',
        actionLink: '/',
        theme: 'default'
    },
    search: {
        icon: 'search',
        title: '未找到相关结果',
        description: '换个关键词试试，或者浏览推荐内容',
        actionText: '清除搜索',
        actionLink: null,
        theme: 'default'
    },
    favorites: {
        icon: 'favorites',
        title: '暂无收藏',
        description: '收藏喜欢的小说，方便下次快速阅读',
        actionText: '去浏览小说',
        actionLink: '/',
        theme: 'default'
    },
    history: {
        icon: 'history',
        title: '暂无阅读记录',
        description: '开始阅读小说，记录将显示在这里',
        actionText: '开始阅读',
        actionLink: '/',
        theme: 'default'
    },
    notifications: {
        icon: 'notifications',
        title: '暂无通知',
        description: '有新消息时会及时通知您',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    comments: {
        icon: 'comments',
        title: '暂无评论',
        description: '成为第一个评论的人吧',
        actionText: '发表评论',
        actionLink: null,
        theme: 'default'
    },
    category: {
        icon: 'category',
        title: '该分类暂无小说',
        description: '去看看其他分类吧',
        actionText: '返回全部',
        actionLink: null,
        theme: 'default'
    },
    ranking: {
        icon: 'ranking',
        title: '暂无排行数据',
        description: '排行榜数据正在统计中',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    network: {
        icon: 'network',
        title: '网络连接失败',
        description: '请检查网络设置后重试',
        actionText: '重新加载',
        actionLink: null,
        theme: 'error'
    },
    error: {
        icon: 'error',
        title: '加载失败',
        description: '内容加载出错，请稍后重试',
        actionText: '重新加载',
        actionLink: null,
        theme: 'error'
    },
    offline: {
        icon: 'offline',
        title: '离线状态',
        description: '您当前处于离线状态，部分功能可能无法使用',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'warning'
    },
    maintenance: {
        icon: 'maintenance',
        title: '系统维护中',
        description: '我们正在升级系统，请稍后再试',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'warning'
    },
    unauthorized: {
        icon: 'unauthorized',
        title: '需要登录',
        description: '请先登录后查看此内容',
        actionText: '立即登录',
        actionLink: '/pages/user/login.html',
        theme: 'warning'
    },
    forbidden: {
        icon: 'forbidden',
        title: '访问受限',
        description: '您没有权限访问此内容',
        actionText: '返回首页',
        actionLink: '/',
        theme: 'error'
    },
    notFound: {
        icon: 'notFound',
        title: '页面不存在',
        description: '您访问的页面可能已被删除或不存在',
        actionText: '返回首页',
        actionLink: '/',
        theme: 'error'
    },
    document: {
        icon: 'document',
        title: '暂无文档',
        description: '相关内容正在准备中，敬请期待',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    user: {
        icon: 'user',
        title: '暂无用户信息',
        description: '用户信息加载失败或不存在',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'default'
    },
    settings: {
        icon: 'settings',
        title: '暂无设置项',
        description: '设置内容正在准备中',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    chapter: {
        icon: 'chapter',
        title: '暂无章节',
        description: '该小说暂时没有章节内容',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    bookmark: {
        icon: 'bookmark',
        title: '暂无书签',
        description: '添加书签可以快速回到阅读位置',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    reading: {
        icon: 'reading',
        title: '暂无阅读记录',
        description: '开始阅读，记录会在这里显示',
        actionText: '开始阅读',
        actionLink: '/',
        theme: 'default'
    },
    author: {
        icon: 'author',
        title: '暂无作者信息',
        description: '作者信息加载失败或不存在',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'default'
    },
    review: {
        icon: 'review',
        title: '暂无审核内容',
        description: '目前没有需要审核的内容',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    admin: {
        icon: 'admin',
        title: '暂无管理数据',
        description: '管理数据加载失败或不存在',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'default'
    },
    novel: {
        icon: 'novel',
        title: '暂无小说',
        description: '该分类或筛选条件下暂无小说',
        actionText: '返回首页',
        actionLink: '/',
        theme: 'default'
    },
    ai: {
        icon: 'ai',
        title: '暂无AI内容',
        description: 'AI相关内容正在准备中',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    community: {
        icon: 'community',
        title: '暂无社区内容',
        description: '社区内容正在准备中',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    discover: {
        icon: 'discover',
        title: '暂无发现内容',
        description: '发现内容正在准备中',
        actionText: null,
        actionLink: null,
        theme: 'default'
    },
    home: {
        icon: 'home',
        title: '暂无内容',
        description: '首页内容加载失败',
        actionText: '刷新页面',
        actionLink: null,
        theme: 'default'
    },
    default: {
        icon: 'default',
        title: '暂无数据',
        description: '相关内容为空',
        actionText: null,
        actionLink: null,
        theme: 'default'
    }
};

/**
 * 获取空状态HTML
 * @param {string} type - 空状态类型
 * @param {Object} options - 自定义选项
 * @returns {string} HTML字符串
 */
function getEmptyStateHTML(type, options = {}) {
    const config = { ...EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG.default, ...options };
    const icon = UNIFIED_ICONS[config.icon] || UNIFIED_ICONS.default;
    
    const actionButton = config.actionText ? `
        <button class="empty-state-action btn-primary" data-action="empty-state-action" ${config.actionLink ? `data-link="${config.actionLink}"` : ''}>
            ${config.actionText}
        </button>
    ` : '';
    
    return `
        <div class="empty-state empty-state-${config.theme}" data-empty-type="${type}">
            <div class="empty-state-icon">
                ${icon}
            </div>
            <h3 class="empty-state-title">${config.title}</h3>
            ${config.description ? `<p class="empty-state-description">${config.description}</p>` : ''}
            ${actionButton}
        </div>
    `;
}

/**
 * 检查并显示空状态
 * @param {HTMLElement} container - 容器元素
 * @param {Array} data - 数据数组
 * @param {string} type - 空状态类型
 * @param {Object} options - 额外选项
 * @returns {boolean} 是否为空
 */
function checkAndShowEmptyState(container, data, type = 'default', options = {}) {
    if (!container) return false;
    
    const isEmpty = !data || data.length === 0;
    
    if (isEmpty) {
        const emptyStateHTML = getEmptyStateHTML(type, options);
        container.innerHTML = emptyStateHTML;
        
        // 绑定操作按钮事件
        const actionBtn = container.querySelector('[data-action="empty-state-action"]');
        if (actionBtn) {
            actionBtn.addEventListener('click', (e) => {
                const link = e.target.dataset.link;
                if (link) {
                    window.location.href = link;
                } else if (options.onAction) {
                    options.onAction(e);
                } else {
                    window.location.reload();
                }
            });
        }
    }
    
    return isEmpty;
}

// ========== 2. 移动端菜单修复 ==========

/**
 * 初始化移动端菜单
 * 修复部分页面移动端菜单无法展开的问题
 */
function initMobileMenuFix() {
    // 查找或创建移动端菜单按钮
    let mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (!mobileMenuToggle) {
        // 在导航栏中创建移动端菜单按钮
        const navbar = document.querySelector('.navbar-inner');
        if (navbar) {
            mobileMenuToggle = document.createElement('button');
            mobileMenuToggle.id = 'mobileMenuToggle';
            mobileMenuToggle.className = 'mobile-menu-toggle';
            mobileMenuToggle.setAttribute('aria-label', '打开菜单');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-controls', 'mobileNavMenu');
            mobileMenuToggle.innerHTML = UNIFIED_ICONS.menu;
            navbar.appendChild(mobileMenuToggle);
        }
    }
    
    // 查找或创建移动端菜单
    let mobileNavMenu = document.getElementById('mobileNavMenu');
    
    if (!mobileNavMenu) {
        mobileNavMenu = document.createElement('nav');
        mobileNavMenu.id = 'mobileNavMenu';
        mobileNavMenu.className = 'mobile-nav-menu';
        mobileNavMenu.setAttribute('role', 'navigation');
        mobileNavMenu.setAttribute('aria-label', '移动端导航');
        mobileNavMenu.setAttribute('aria-hidden', 'true');
        
        // 复制桌面端导航链接
        const navLinks = document.querySelectorAll('.nav-menu .nav-link');
        const linksHTML = Array.from(navLinks).map(link => {
            const href = link.getAttribute('href') || '#';
            const text = link.textContent || '';
            const isActive = link.classList.contains('active');
            return `<a href="${href}" class="mobile-nav-link ${isActive ? 'active' : ''}">${text}</a>`;
        }).join('');
        
        mobileNavMenu.innerHTML = `
            <div class="mobile-nav-overlay"></div>
            <div class="mobile-nav-content">
                <div class="mobile-nav-header">
                    <span class="mobile-nav-title">菜单</span>
                    <button class="mobile-nav-close" aria-label="关闭菜单">
                        ${UNIFIED_ICONS.close}
                    </button>
                </div>
                <nav class="mobile-nav-links">
                    ${linksHTML}
                </nav>
            </div>
        `;
        
        document.body.appendChild(mobileNavMenu);
    }
    
    // 绑定事件
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    const closeBtn = mobileNavMenu?.querySelector('.mobile-nav-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }
    
    const overlay = mobileNavMenu?.querySelector('.mobile-nav-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
    
    // 点击导航链接后关闭菜单
    const mobileNavLinks = mobileNavMenu?.querySelectorAll('.mobile-nav-link');
    mobileNavLinks?.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (mobileNavMenu?.classList.contains('active') && 
            !mobileNavMenu.contains(e.target) && 
            !mobileMenuToggle?.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // ESC键关闭菜单
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNavMenu?.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (mobileNavMenu) {
        const isActive = mobileNavMenu.classList.toggle('active');
        mobileMenuToggle?.setAttribute('aria-expanded', isActive.toString());
        mobileNavMenu.setAttribute('aria-hidden', (!isActive).toString());
        document.body.classList.toggle('mobile-menu-open', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (mobileNavMenu) {
        mobileNavMenu.classList.remove('active');
        mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        mobileNavMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('mobile-menu-open');
        document.body.style.overflow = '';
    }
}

// ========== 3. 图片加载失败占位符修复 ==========

/**
 * 图片加载错误处理
 * 为所有图片添加错误处理，显示占位符
 */
function initImageErrorHandler() {
    // 创建全局图片错误处理器
    const handleImageError = (img) => {
        // 避免重复处理
        if (img.dataset.errorHandled) return;
        img.dataset.errorHandled = 'true';
        
        // 根据图片类型选择不同的占位符
        const isCover = img.closest('.novel-cover, .bookshelf-cover, .novel-card-cover, .ranking-cover, .update-cover');
        const isAvatar = img.closest('.avatar, .user-avatar, .author-avatar, .agent-avatar');
        
        if (isCover) {
            img.src = createPlaceholderSVG('cover', img.alt || '小说封面');
        } else if (isAvatar) {
            img.src = createPlaceholderSVG('avatar', img.alt || '用户头像');
        } else {
            img.src = createPlaceholderSVG('default', img.alt || '图片');
        }
        
        img.classList.add('image-error');
    };
    
    // 处理现有图片
    document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
            img.addEventListener('error', () => handleImageError(img));
        }
    });
    
    // 使用 MutationObserver 处理动态添加的图片
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'IMG') {
                        node.addEventListener('error', () => handleImageError(node));
                    }
                    node.querySelectorAll?.('img').forEach(img => {
                        img.addEventListener('error', () => handleImageError(img));
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * 创建占位符 SVG
 */
function createPlaceholderSVG(type, text) {
    const colors = {
        cover: { bg: '#e5e7eb', fg: '#9ca3af' },
        avatar: { bg: '#dbeafe', fg: '#3b82f6' },
        default: { bg: '#f3f4f6', fg: '#6b7280' }
    };
    
    const { bg, fg } = colors[type] || colors.default;
    const shortText = text.slice(0, 2);
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
        <rect width="200" height="280" fill="${bg}"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-size="48" font-family="system-ui, -apple-system, sans-serif">${shortText}</text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="${fg}" font-size="12" font-family="system-ui, -apple-system, sans-serif">加载失败</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// ========== 4. 表单验证样式统一 ==========

/**
 * 统一表单验证样式
 */
function initFormValidationStyles() {
    // 添加统一的表单验证样式
    const styleId = 'form-validation-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* 统一表单验证错误样式 */
        .form-error {
            border-color: #ef4444 !important;
            background-color: #fef2f2 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        .form-error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.375rem;
            display: flex;
            align-items: center;
            gap: 0.375rem;
        }
        
        .form-error-message::before {
            content: '';
            display: inline-block;
            width: 16px;
            height: 16px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='12'/%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'/%3E%3C/svg%3E");
            background-size: contain;
        }
        
        /* 统一表单验证成功样式 */
        .form-success {
            border-color: #22c55e !important;
            background-color: #f0fdf4 !important;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
        }
        
        /* 表单输入框基础样式统一 */
        .form-input {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            font-size: 0.9375rem;
            transition: all 0.2s;
            background-color: #fff;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .form-input:disabled {
            background-color: #f3f4f6;
            cursor: not-allowed;
        }
        
        /* 表单标签样式 */
        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.375rem;
        }
        
        .form-label-required::after {
            content: '*';
            color: #ef4444;
            margin-left: 0.25rem;
        }
        
        /* 表单组样式 */
        .form-group {
            margin-bottom: 1rem;
        }
        
        /* 帮助文本样式 */
        .form-help {
            font-size: 0.8125rem;
            color: #6b7280;
            margin-top: 0.375rem;
        }
        
        /* 空状态样式 */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            animation: empty-state-fade-in 0.3s ease-out;
        }
        
        @keyframes empty-state-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .empty-state-icon {
            width: 80px;
            height: 80px;
            color: #94a3b8;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .empty-state-icon svg {
            width: 100%;
            height: 100%;
            stroke-width: 1.5;
        }
        
        .empty-state-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 0.5rem 0;
            line-height: 1.4;
        }
        
        .empty-state-description {
            font-size: 0.9375rem;
            color: #64748b;
            margin: 0 0 1.5rem 0;
            max-width: 320px;
            line-height: 1.6;
        }
        
        .empty-state-action {
            min-width: 140px;
            padding: 0.625rem 1.5rem;
            font-size: 0.9375rem;
            font-weight: 500;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.15s ease;
            background: #6366f1;
            color: white;
            border: none;
        }
        
        .empty-state-action:hover {
            transform: translateY(-1px);
            background: #4f46e5;
        }
        
        .empty-state-action:active {
            transform: translateY(0);
        }
        
        .empty-state-error .empty-state-icon {
            color: #ef4444;
        }
        
        .empty-state-warning .empty-state-icon {
            color: #f59e0b;
        }
        
        .empty-state-success .empty-state-icon {
            color: #10b981;
        }
        
        .empty-state-info .empty-state-icon {
            color: #3b82f6;
        }
        
        /* 移动端菜单样式 */
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            color: #374151;
        }
        
        .mobile-menu-toggle svg {
            width: 24px;
            height: 24px;
        }
        
        .mobile-nav-menu {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            pointer-events: none;
        }
        
        .mobile-nav-menu.active {
            pointer-events: auto;
        }
        
        .mobile-nav-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .mobile-nav-menu.active .mobile-nav-overlay {
            opacity: 1;
        }
        
        .mobile-nav-content {
            position: absolute;
            top: 0;
            right: 0;
            width: 280px;
            height: 100%;
            background: white;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        
        .mobile-nav-menu.active .mobile-nav-content {
            transform: translateX(0);
        }
        
        .mobile-nav-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .mobile-nav-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1e293b;
        }
        
        .mobile-nav-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            color: #6b7280;
        }
        
        .mobile-nav-close svg {
            width: 24px;
            height: 24px;
        }
        
        .mobile-nav-links {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            gap: 0.5rem;
            overflow-y: auto;
        }
        
        .mobile-nav-link {
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            color: #374151;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .mobile-nav-link:hover {
            background: #f3f4f6;
        }
        
        .mobile-nav-link.active {
            background: #eef2ff;
            color: #6366f1;
        }
        
        @media (max-width: 768px) {
            .mobile-menu-toggle {
                display: block;
            }
            
            .mobile-nav-menu {
                display: block;
            }
        }
        
        /* 图片错误样式 */
        .image-error {
            opacity: 0.7;
            filter: grayscale(0.5);
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * 验证单个表单字段
 */
function validateField(input, rules = {}) {
    const value = input.value.trim();
    const errors = [];
    
    // 清除之前的错误状态
    clearFieldError(input);
    
    // 必填验证
    if (rules.required && !value) {
        errors.push(rules.requiredMessage || '此字段为必填项');
    }
    
    // 最小长度验证
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`最少需要 ${rules.minLength} 个字符`);
    }
    
    // 最大长度验证
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`最多允许 ${rules.maxLength} 个字符`);
    }
    
    // 正则验证
    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMessage || '格式不正确');
    }
    
    // 邮箱验证
    if (rules.email && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            errors.push('请输入有效的邮箱地址');
        }
    }
    
    // 手机号验证
    if (rules.phone && value) {
        const phonePattern = /^1[3-9]\d{9}$/;
        if (!phonePattern.test(value)) {
            errors.push('请输入有效的手机号码');
        }
    }
    
    // 自定义验证
    if (rules.validator && typeof rules.validator === 'function') {
        const customError = rules.validator(value);
        if (customError) {
            errors.push(customError);
        }
    }
    
    // 显示错误
    if (errors.length > 0) {
        showFieldError(input, errors[0]);
        return false;
    }
    
    // 标记成功
    input.classList.add('form-success');
    return true;
}

/**
 * 显示字段错误
 */
function showFieldError(input, message) {
    input.classList.add('form-error');
    input.classList.remove('form-success');
    
    // 查找或创建错误消息元素
    const formGroup = input.closest('.form-group') || input.parentElement;
    let errorEl = formGroup.querySelector('.form-error-message');
    
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error-message';
        input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'flex';
    
    // 添加 aria 属性
    input.setAttribute('aria-invalid', 'true');
    const errorId = `error-${input.id || Math.random().toString(36).substr(2, 9)}`;
    errorEl.id = errorId;
    input.setAttribute('aria-describedby', errorId);
}

/**
 * 清除字段错误
 */
function clearFieldError(input) {
    input.classList.remove('form-error');
    input.classList.remove('form-success');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    
    const formGroup = input.closest('.form-group') || input.parentElement;
    const errorEl = formGroup?.querySelector('.form-error-message');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

/**
 * 验证整个表单
 */
function validateForm(form, fieldRules = {}) {
    let isValid = true;
    
    Object.entries(fieldRules).forEach(([fieldName, rules]) => {
        const input = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (input) {
            const fieldValid = validateField(input, rules);
            if (!fieldValid) isValid = false;
        }
    });
    
    return isValid;
}

// ========== 5. 页面标题动态更新 ==========

/**
 * 页面标题配置
 */
const PAGE_TITLES = {
    // 首页
    'index.html': 'NovelHub - 发现精彩小说',
    '/': 'NovelHub - 发现精彩小说',
    
    // 小说相关
    'detail.html': (params) => {
        const novelName = params.get('name') || '小说详情';
        return `${novelName} - NovelHub`;
    },
    'reading.html': (params) => {
        const novelName = params.get('name') || '阅读';
        const chapter = params.get('chapter') || '';
        return chapter ? `${novelName} - 第${chapter}章 - NovelHub` : `${novelName} - NovelHub`;
    },
    'catalog.html': '章节目录 - NovelHub',
    
    // 分类和排行
    'category.html': '分类浏览 - NovelHub',
    'ranking.html': '排行榜 - NovelHub',
    'search.html': (params) => {
        const keyword = params.get('q') || params.get('keyword');
        return keyword ? `"${keyword}" 的搜索结果 - NovelHub` : '搜索小说 - NovelHub';
    },
    
    // 用户相关
    'bookshelf.html': '我的书架 - NovelHub',
    'my-bookshelf.html': '我的书架 - NovelHub',
    'history.html': '阅读历史 - NovelHub',
    'reading-history.html': '阅读历史 - NovelHub',
    'favorites.html': '我的收藏 - NovelHub',
    'profile.html': '个人中心 - NovelHub',
    'settings.html': '账号设置 - NovelHub',
    'notifications.html': '消息通知 - NovelHub',
    
    // 认证相关
    'login.html': '登录 - NovelHub',
    'register.html': '注册 - NovelHub',
    'forgot-password.html': '找回密码 - NovelHub',
    'reset-password.html': '重置密码 - NovelHub',
    'auth.html': '用户认证 - NovelHub',
    
    // 作者相关
    'author-center.html': '作者中心 - NovelHub',
    'detail.html': (params) => {
        const authorId = params.get('id');
        return authorId ? `作者详情 - NovelHub` : '小说详情 - NovelHub';
    },
    
    // 学习/OpenClaw
    'learning-center.html': '学习中心 - NovelHub',
    'writer-growth.html': '作家成长 - NovelHub',
    
    // 社区
    'forum.html': '社区论坛 - NovelHub',
    'topic.html': '话题详情 - NovelHub',
    
    // 管理后台
    'dashboard.html': '管理后台 - NovelHub',
    'users.html': '用户管理 - NovelHub',
    'novels.html': '小说管理 - NovelHub',
    'chapters.html': '章节管理 - NovelHub',
    'comments.html': '评论管理 - NovelHub',
    'openclaw.html': 'OpenClaw管理 - NovelHub',
    'sensitive.html': '敏感词管理 - NovelHub',
    'settings.html': '系统设置 - NovelHub',
    'book-detail.html': '书籍详情 - NovelHub',
    'rankings.html': '排行榜管理 - NovelHub',
    
    // 审核
    'pending.html': '待审核内容 - NovelHub',
    
    // 其他
    'about.html': '关于我们 - NovelHub',
    'contact.html': '联系我们 - NovelHub',
    'privacy.html': '隐私政策 - NovelHub',
    'terms.html': '用户协议 - NovelHub',
    'help.html': '帮助中心 - NovelHub',
    'feedback.html': '意见反馈 - NovelHub'
};

/**
 * 更新页面标题
 */
function updatePageTitle(customTitle) {
    const baseTitle = 'NovelHub';
    
    if (customTitle) {
        document.title = customTitle.includes(baseTitle) ? customTitle : `${customTitle} - ${baseTitle}`;
        return;
    }
    
    // 自动根据当前页面设置标题
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    const searchParams = new URLSearchParams(window.location.search);
    
    const titleConfig = PAGE_TITLES[filename];
    
    if (typeof titleConfig === 'function') {
        document.title = titleConfig(searchParams);
    } else if (typeof titleConfig === 'string') {
        document.title = titleConfig;
    } else {
        // 默认标题
        document.title = baseTitle;
    }
}

/**
 * 设置动态标题（用于详情页等）
 */
function setDynamicTitle(title, suffix = 'NovelHub') {
    if (title) {
        document.title = `${title} - ${suffix}`;
    }
}

/**
 * 恢复默认标题
 */
function restoreDefaultTitle() {
    updatePageTitle();
}

// ========== 6. 统一初始化入口 ==========

/**
 * 初始化所有修复
 */
function initAllFixes() {
    // 1. 初始化表单验证样式
    initFormValidationStyles();
    
    // 2. 初始化移动端菜单修复
    initMobileMenuFix();
    
    // 3. 初始化图片错误处理
    initImageErrorHandler();
    
    // 4. 更新页面标题
    updatePageTitle();
    
    console.log('[NovelHub Fixes] 所有修复模块已初始化');
}

// 自动初始化（如果直接引入）
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllFixes);
    } else {
        initAllFixes();
    }
}

// 导出所有功能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAllFixes,
        getEmptyStateHTML,
        checkAndShowEmptyState,
        initMobileMenuFix,
        initImageErrorHandler,
        initFormValidationStyles,
        updatePageTitle,
        setDynamicTitle,
        restoreDefaultTitle,
        validateField,
        validateForm,
        showFieldError,
        clearFieldError,
        UNIFIED_ICONS,
        EMPTY_STATE_CONFIG
    };
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.NovelHubFixes = {
        initAllFixes,
        getEmptyStateHTML,
        checkAndShowEmptyState,
        initMobileMenuFix,
        initImageErrorHandler,
        initFormValidationStyles,
        updatePageTitle,
        setDynamicTitle,
        restoreDefaultTitle,
        validateField,
        validateForm,
        showFieldError,
        clearFieldError,
        UNIFIED_ICONS,
        EMPTY_STATE_CONFIG
    };
}
