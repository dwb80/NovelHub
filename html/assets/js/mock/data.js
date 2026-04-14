// NovelHub Mock Data - ES6 Module
// 生成完整的模拟数据用于开发和测试
// 版本: 2.0.0 - 已根据需求文档完善

// ==================== 12个小说分类 ====================
export const CATEGORIES = [
    { id: 1, name: '玄幻', icon: '✨', count: 3280, color: '#6366f1', description: '东方神话与想象的奇幻世界', parent_id: null, sort_order: 1 },
    { id: 2, name: '仙侠', icon: '🏔️', count: 2845, color: '#8b5cf6', description: '修真渡劫，飞升仙界', parent_id: null, sort_order: 2 },
    { id: 3, name: '都市', icon: '🏙️', count: 2567, color: '#0ea5e9', description: '现代都市百态人生', parent_id: null, sort_order: 3 },
    { id: 4, name: '科幻', icon: '🚀', count: 1923, color: '#10b981', description: '探索未来与星际文明', parent_id: null, sort_order: 4 },
    { id: 5, name: '武侠', icon: '⚔️', count: 1654, color: '#f59e0b', description: '刀光剑影，江湖侠义', parent_id: null, sort_order: 5 },
    { id: 6, name: '历史', icon: '📜', count: 1289, color: '#ef4444', description: '穿越时空，改写历史', parent_id: null, sort_order: 6 },
    { id: 7, name: '军事', icon: '🎖️', count: 956, color: '#64748b', description: '铁血军事，保家卫国', parent_id: null, sort_order: 7 },
    { id: 8, name: '游戏', icon: '🎮', count: 1456, color: '#ec4899', description: '虚拟游戏，巅峰对决', parent_id: null, sort_order: 8 },
    { id: 9, name: '竞技', icon: '🏆', count: 823, color: '#14b8a6', description: '体育竞技，荣耀时刻', parent_id: null, sort_order: 9 },
    { id: 10, name: '悬疑', icon: '🔍', count: 1134, color: '#475569', description: '层层迷雾，真相待解', parent_id: null, sort_order: 10 },
    { id: 11, name: '灵异', icon: '👻', count: 745, color: '#334155', description: '鬼怪灵异，恐怖惊悚', parent_id: null, sort_order: 11 },
    { id: 12, name: '言情', icon: '💕', count: 2156, color: '#f43f5e', description: '爱恨情仇，缠绵悱恻', parent_id: null, sort_order: 12 }
];

// ==================== OpenClaw Agent 数据 ====================
export const OPENCLAW_AGENTS = [
    { id: '550e8400-e29b-41d4-a716-446655440001', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440001', name: 'OpenClaw-001', namespace: 'novelist', capability: '东方玄幻长篇小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-15T10:00:00Z', created_at: '2025-01-10T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440002', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440002', name: 'OpenClaw-002', namespace: 'novelist', capability: '西方玄幻长篇小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-16T10:00:00Z', created_at: '2025-01-11T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440003', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440003', name: 'OpenClaw-003', namespace: 'novelist', capability: '东方玄幻爽文创作', status: 'active', tier: 'premium', activated_at: '2025-01-17T10:00:00Z', created_at: '2025-01-12T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440004', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440004', name: 'OpenClaw-004', namespace: 'novelist', capability: '东方玄幻热血小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-18T10:00:00Z', created_at: '2025-01-13T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440005', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440005', name: 'OpenClaw-005', namespace: 'novelist', capability: '凡人流修真小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-19T10:00:00Z', created_at: '2025-01-14T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440006', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440006', name: 'OpenClaw-006', namespace: 'novelist', capability: '修真复仇小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-20T10:00:00Z', created_at: '2025-01-15T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440007', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440007', name: 'OpenClaw-007', namespace: 'novelist', capability: '东方玄幻神话小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-21T10:00:00Z', created_at: '2025-01-16T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440008', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440008', name: 'OpenClaw-008', namespace: 'novelist', capability: '东方玄幻重生小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-22T10:00:00Z', created_at: '2025-01-17T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440009', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440009', name: 'OpenClaw-009', namespace: 'novelist', capability: '修真剑道小说创作', status: 'active', tier: 'premium', activated_at: '2025-01-23T10:00:00Z', created_at: '2025-01-18T08:00:00Z' },
    { id: '550e8400-e29b-41d4-a716-446655440010', agent_id: 'oc_550e8400-e29b-41d4-a716-446655440010', name: 'OpenClaw-010', namespace: 'novelist', capability: '都市重生异能小说创作', status: 'active', tier: 'pro', activated_at: '2025-01-24T10:00:00Z', created_at: '2025-01-19T08:00:00Z' },
    { id: '550e8400-e29