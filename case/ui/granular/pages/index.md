# NovelHub 首页 (index.html) 最小颗粒度测试文档

## 测试概览

| 属性 | 值 |
|------|-----|
| 页面路径 | html/index.html |
| 页面类型 | 首页/门户页 |
| 测试日期 | 2026-04-12 |
| 测试分析师 | Test Results Analyzer |

---

## 1. 页面加载与初始化测试

### 1.1 页面加载器 (Page Loader)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-LOAD-001 | #pageLoader | 页面加载时显示 | 显示旋转动画和"正在加载 NovelHub..."文本 | P0 |
| IDX-LOAD-002 | #pageLoader | 数据加载完成后隐藏 | 添加hidden类，500ms后移除DOM | P0 |
| IDX-LOAD-003 | .loader-spinner | 旋转动画正常 | CSS动画持续旋转 | P1 |
| IDX-LOAD-004 | .loader-text | 文本显示正确 | 显示"正在加载 NovelHub..." | P1 |
| IDX-LOAD-005 | 加载失败处理 | Mock数据加载失败 | 显示Toast错误提示"加载失败，请刷新页面重试" | P0 |

### 1.2 网络状态监测

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NET-001 | #networkStatus | 网络断开时显示 | 显示"⚠️ 网络已断开，部分功能可能无法使用" | P1 |
| IDX-NET-002 | #networkStatus | 网络恢复时显示 | 显示"✓ 网络已连接"，2秒后隐藏 | P1 |
| IDX-NET-003 | 离线事件监听 | window.offline事件 | 触发状态更新 | P2 |
| IDX-NET-004 | 在线事件监听 | window.online事件 | 触发状态更新 | P2 |

---

## 2. 导航栏 (Navbar) 组件测试

### 2.1 Logo区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NAV-LOGO-001 | .logo | 点击跳转 | 跳转至index.html | P0 |
| IDX-NAV-LOGO-002 | .logo-icon | SVG图标显示 | 书本图标正常渲染 | P1 |
| IDX-NAV-LOGO-003 | .logo-text | 文本显示 | 显示"NovelHub" | P1 |
| IDX-NAV-LOGO-004 | aria-label | 无障碍属性 | 显示"NovelHub 首页" | P2 |

### 2.2 主导航菜单 (.nav-menu)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NAV-MENU-001 | 首页链接 | 默认激活状态 | 有.active类，aria-current="page" | P0 |
| IDX-NAV-MENU-002 | 首页链接 | 点击跳转 | 跳转至index.html | P0 |
| IDX-NAV-MENU-003 | 分类链接 | 点击跳转 | 跳转至pages/discover/category.html | P0 |
| IDX-NAV-MENU-004 | 排行链接 | 点击跳转 | 跳转至pages/discover/ranking.html | P0 |
| IDX-NAV-MENU-005 | 书架链接 | 点击跳转 | 跳转至pages/bookshelf/my-bookshelf.html | P0 |
| IDX-NAV-MENU-006 | 学习链接 | 点击跳转 | 跳转至pages/openclaw/learning-center.html | P0 |
| IDX-NAV-MENU-007 | 悬停效果 | 鼠标悬停 | 颜色变化，背景色变化 | P1 |
| IDX-NAV-MENU-008 | 键盘导航 | Tab键切换 | 可以Tab到每个导航项 | P2 |

### 2.3 导航操作区 (.nav-actions)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NAV-ACT-001 | 搜索按钮(.search-btn) | 点击跳转 | 跳转至pages/discover/search.html | P0 |
| IDX-NAV-ACT-002 | 搜索按钮 | aria-label | 显示"搜索小说" | P2 |
| IDX-NAV-ACT-003 | 搜索图标 | SVG显示 | 放大镜图标正常渲染 | P1 |
| IDX-NAV-ACT-004 | 登录按钮(.btn-primary) | 点击跳转 | 跳转至pages/user/login.html | P0 |
| IDX-NAV-ACT-005 | 登录按钮 | 角色属性 | role="button" | P2 |

### 2.4 移动端菜单按钮 (#mobileMenuToggle)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NAV-MOB-001 | 汉堡菜单按钮 | 初始状态 | aria-expanded="false" | P0 |
| IDX-NAV-MOB-002 | 汉堡菜单按钮 | 点击打开 | 菜单展开，aria-expanded="true" | P0 |
| IDX-NAV-MOB-003 | 汉堡菜单按钮 | 三条横线 | 三条.hamburger-line元素 | P1 |
| IDX-NAV-MOB-004 | 汉堡菜单按钮 | 动画效果 | 点击时横线变X形 | P1 |
| IDX-NAV-MOB-005 | aria-label | 无障碍标签 | "打开导航菜单" | P2 |
| IDX-NAV-MOB-006 | aria-controls | 控制关系 | 指向mobileNavMenu | P2 |

### 2.5 主题切换按钮 (#themeToggle)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NAV-THEME-001 | 主题按钮 | 点击切换 | 循环切换4种主题 | P0 |
| IDX-NAV-THEME-002 | 主题顺序 | 切换序列 | light → paper → dark → eye-care → light | P0 |
| IDX-NAV-THEME-003 | localStorage | 主题保存 | 保存到'novelhub-theme'键 | P0 |
| IDX-NAV-THEME-004 | 页面加载 | 主题恢复 | 读取localStorage恢复主题 | P0 |
| IDX-NAV-THEME-005 | 太阳图标(.icon-sun) | light/paper主题 | 显示太阳图标 | P1 |
| IDX-NAV-THEME-006 | 月亮图标(.icon-moon) | dark/eye-care主题 | 显示月亮图标 | P1 |
| IDX-NAV-THEME-007 | aria-label | 无障碍标签 | "切换主题" | P2 |
| IDX-NAV-THEME-008 | title属性 | 提示文本 | "切换主题" | P2 |

---

## 3. 移动端导航菜单 (#mobileNavMenu)

### 3.1 菜单容器

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-MOB-NAV-001 | 菜单初始状态 | aria-hidden | "true" | P0 |
| IDX-MOB-NAV-002 | 菜单打开 | 添加active类 | 从右侧滑入 | P0 |
| IDX-MOB-NAV-003 | 遮罩层(.mobile-nav-overlay) | 点击关闭 | 关闭菜单 | P0 |
| IDX-MOB-NAV-004 | ESC键 | 键盘关闭 | 按ESC关闭菜单 | P0 |
| IDX-MOB-NAV-005 | body滚动 | 打开时锁定 | overflow: hidden | P1 |

### 3.2 菜单头部

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-MOB-HEAD-001 | 标题(.mobile-nav-title) | 文本显示 | "菜单" | P1 |
| IDX-MOB-HEAD-002 | 关闭按钮(#mobileNavClose) | 点击关闭 | 关闭菜单 | P0 |
| IDX-MOB-HEAD-003 | 关闭按钮 | aria-label | "关闭导航菜单" | P2 |
| IDX-MOB-HEAD-004 | 关闭图标 | SVG显示 | X形图标正常渲染 | P1 |

### 3.3 菜单链接

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-MOB-LINK-001 | 首页链接 | 默认激活 | .active类，aria-current="page" | P0 |
| IDX-MOB-LINK-002 | 首页链接 | 图标显示 | 房子图标+文本"首页" | P1 |
| IDX-MOB-LINK-003 | 分类链接 | 点击跳转 | 跳转并关闭菜单 | P0 |
| IDX-MOB-LINK-004 | 分类链接 | 图标显示 | 书本图标+文本"分类" | P1 |
| IDX-MOB-LINK-005 | 排行链接 | 点击跳转 | 跳转并关闭菜单 | P0 |
| IDX-MOB-LINK-006 | 排行链接 | 图标显示 | 柱状图图标+文本"排行" | P1 |
| IDX-MOB-LINK-007 | 书架链接 | 点击跳转 | 跳转并关闭菜单 | P0 |
| IDX-MOB-LINK-008 | 书架链接 | 图标显示 | 打开的书本图标+文本"书架" | P1 |
| IDX-MOB-LINK-009 | 学习链接 | 点击跳转 | 跳转并关闭菜单 | P0 |
| IDX-MOB-LINK-010 | 学习链接 | 图标显示 | 毕业帽图标+文本"学习" | P1 |

---

## 4. Banner轮播组件 (#bannerCarousel)

### 4.1 轮播容器

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-BANNER-001 | 容器角色 | role属性 | "region" | P2 |
| IDX-BANNER-002 | aria-label | 无障碍标签 | "热门推荐" | P2 |
| IDX-BANNER-003 | 高度(桌面) | CSS样式 | 320px | P1 |
| IDX-BANNER-004 | 高度(移动) | CSS媒体查询 | 200px (<768px) | P1 |

### 4.2 轮播幻灯片 (#bannerSlides)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-SLIDE-001 | 幻灯片数量 | 初始状态 | 3张幻灯片 | P0 |
| IDX-SLIDE-002 | 幻灯片1 | 图片加载 | banner1图片+标题+描述 | P0 |
| IDX-SLIDE-003 | 幻灯片2 | 图片加载 | banner2图片+标题+描述 | P0 |
| IDX-SLIDE-004 | 幻灯片3 | 图片加载 | banner3图片+标题+描述 | P0 |
| IDX-SLIDE-005 | 图片alt | 无障碍属性 | 每张图片有描述性alt文本 | P2 |
| IDX-SLIDE-006 | 图片loading | 性能优化 | 第一张eager，其余lazy | P1 |
| IDX-SLIDE-007 | 渐变遮罩 | 视觉效果 | 底部到顶部渐变 | P1 |
| IDX-SLIDE-008 | 标题样式 | .banner-title | 1.75rem，加粗 | P1 |
| IDX-SLIDE-009 | 描述截断(移动) | -webkit-line-clamp | 显示2行 | P1 |

### 4.3 轮播指示器 (#bannerDots)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-DOTS-001 | 指示器数量 | 初始状态 | 3个点 | P0 |
| IDX-DOTS-002 | 活动指示器 | .active类 | 宽度24px，白色背景 | P0 |
| IDX-DOTS-003 | 非活动指示器 | 默认样式 | 宽度8px，半透明背景 | P1 |
| IDX-DOTS-004 | 点击切换 | 点击点 | 切换到对应幻灯片 | P0 |
| IDX-DOTS-005 | role属性 | 无障碍 | "tablist" | P2 |
| IDX-DOTS-006 | aria-label | 无障碍 | "轮播图导航" | P2 |
| IDX-DOTS-007 | 每个点role | 无障碍 | "tab" | P2 |
| IDX-DOTS-008 | aria-selected | 无障碍 | 当前为"true" | P2 |
| IDX-DOTS-009 | aria-label | 每个点 | "第X张" | P2 |

### 4.4 轮播交互

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-AUTO-001 | 自动播放 | 初始状态 | 5秒自动切换 | P0 |
| IDX-AUTO-002 | 悬停暂停 | mouseenter | 暂停自动播放 | P0 |
| IDX-AUTO-003 | 离开恢复 | mouseleave | 恢复自动播放 | P0 |
| IDX-AUTO-004 | 点击重置 | 点击指示器 | 重置自动播放计时器 | P1 |
| IDX-KEY-001 | 左箭头 | ArrowLeft | 切换到上一张 | P1 |
| IDX-KEY-002 | 右箭头 | ArrowRight | 切换到下一张 | P1 |
| IDX-TOUCH-001 | 左滑 | touch事件 | 切换到下一张 | P1 |
| IDX-TOUCH-002 | 右滑 | touch事件 | 切换到上一张 | P1 |
| IDX-TOUCH-003 | 滑动阈值 | 最小距离 | 50px才触发切换 | P1 |

---

## 5. 分类网格 (#categoryGrid)

### 5.1 分类卡片

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-CAT-001 | 卡片数量 | 初始渲染 | 最多12个分类 | P0 |
| IDX-CAT-002 | 卡片结构 | 每个卡片 | 图标+名称+数量 | P0 |
| IDX-CAT-003 | 图标显示 | .category-icon | 2rem大小 | P1 |
| IDX-CAT-004 | 名称显示 | .category-name | 加粗文本 | P1 |
| IDX-CAT-005 | 数量显示 | .category-count | 格式化为"X万本" | P1 |
| IDX-CAT-006 | 边框颜色 | 动态样式 | 使用分类颜色的20%透明度 | P1 |
| IDX-CAT-007 | 点击跳转 | 卡片点击 | 跳转至category.html?id=X | P0 |

### 5.2 悬停效果

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-CAT-HOV-001 | 悬停上移 | transform | translateY(-4px) | P1 |
| IDX-CAT-HOV-002 | 悬停阴影 | box-shadow | 显示大阴影 | P1 |
| IDX-CAT-HOV-003 | 悬停边框 | border-color | 变为主色 | P1 |

### 5.3 响应式布局

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-CAT-RESP-001 | 桌面端(>1024px) | grid布局 | 6列 | P1 |
| IDX-CAT-RESP-002 | 平板端(768-1024px) | grid布局 | 4列 | P1 |
| IDX-CAT-RESP-003 | 移动端(480-768px) | grid布局 | 3列 | P1 |
| IDX-CAT-RESP-004 | 小屏(<480px) | grid布局 | 2列 | P1 |
| IDX-CAT-RESP-005 | 移动端间距 | gap | 0.75rem | P2 |
| IDX-CAT-RESP-006 | 移动端内边距 | padding | 1rem 0.5rem | P2 |

---

## 6. AI创作者展示 (.agent-showcase)

### 6.1 展示区域

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-AGENT-001 | 背景渐变 | CSS | 从主色到背景色的渐变 | P1 |
| IDX-AGENT-002 | 圆角 | border-radius | var(--radius-xl) | P1 |
| IDX-AGENT-003 | 内边距 | padding | 2rem | P1 |
| IDX-AGENT-004 | 标题 | #agent-heading | "OpenClaw AI 创作者" | P0 |
| IDX-AGENT-005 | 副标题 | span文本 | "30位智能体为您创作精彩内容" | P1 |

### 6.2 Agent网格 (#agentGrid)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-AGENT-006 | 网格布局 | grid | 5列 | P1 |
| IDX-AGENT-007 | 卡片数量 | 初始渲染 | 最多10个Agent | P0 |
| IDX-AGENT-008 | 卡片结构 | 每个卡片 | 头像+名称+能力 | P0 |
| IDX-AGENT-009 | 头像 | .agent-avatar | 48px圆形，渐变背景 | P1 |
| IDX-AGENT-010 | 头像文字 | 显示内容 | Agent名称后3个字 | P1 |
| IDX-AGENT-011 | 名称 | .agent-name | 加粗，0.875rem | P1 |
| IDX-AGENT-012 | 能力 | .agent-works | 截断显示前8字符 | P1 |

### 6.3 Agent卡片交互

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-AGENT-HOV-001 | 悬停上移 | transform | translateY(-4px) | P1 |
| IDX-AGENT-HOV-002 | 悬停阴影 | box-shadow | 显示大阴影 | P1 |

### 6.4 Agent网格响应式

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-AGENT-RESP-001 | 平板端(<1024px) | grid布局 | 3列 | P1 |
| IDX-AGENT-RESP-002 | 移动端(<768px) | grid布局 | 2列 | P1 |
| IDX-AGENT-RESP-003 | 移动端内边距 | padding | 1rem | P2 |

---

## 7. 热门推荐区域

### 7.1 Tab切换器 (.section-tabs)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-TAB-001 | Tab数量 | 初始状态 | 4个Tab | P0 |
| IDX-TAB-002 | Tab标签 | 文本内容 | 全部、最热、最新、完结 | P0 |
| IDX-TAB-003 | 默认激活 | .active类 | "全部"Tab激活 | P0 |
| IDX-TAB-004 | 点击切换 | 点击Tab | 切换激活状态，过滤小说 | P0 |
| IDX-TAB-005 | role属性 | 无障碍 | "tablist" | P2 |
| IDX-TAB-006 | aria-label | 无障碍 | "小说筛选" | P2 |
| IDX-TAB-007 | 每个Tab role | 无障碍 | "tab" | P2 |
| IDX-TAB-008 | aria-selected | 无障碍 | 当前为"true" | P2 |

### 7.2 Tab过滤逻辑

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-FILTER-001 | 全部 | data-filter="all" | 按订阅数排序 | P0 |
| IDX-FILTER-002 | 最热 | data-filter="hot" | 仅显示isHot=true，按views排序 | P0 |
| IDX-FILTER-003 | 最新 | data-filter="new" | 仅显示isNew=true，按时间排序 | P0 |
| IDX-FILTER-004 | 完结 | data-filter="completed" | 仅显示status="completed" | P0 |

### 7.3 小说网格 (#hotNovels)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NOVEL-001 | 卡片数量 | 初始渲染 | 最多10张卡片 | P0 |
| IDX-NOVEL-002 | 卡片结构 | 每个卡片 | 封面+标题+作者+统计 | P0 |
| IDX-NOVEL-003 | 封面图片 | .novel-cover img | 懒加载，显示封面 | P0 |
| IDX-NOVEL-004 | 热门标签 | .badge-error | isHot=true时显示"热门" | P1 |
| IDX-NOVEL-005 | 新书标签 | .badge-success | isNew=true时显示"新书" | P1 |
| IDX-NOVEL-006 | 标题 | .novel-title | 单行，超出截断 | P1 |
| IDX-NOVEL-007 | 作者 | .novel-author | 单行显示 | P1 |
| IDX-NOVEL-008 | 浏览量 | .novel-stat | 格式化为"X万" | P1 |
| IDX-NOVEL-009 | 评分 | .novel-stat | 显示星级和分数 | P1 |
| IDX-NOVEL-010 | 点击跳转 | 卡片点击 | 跳转至detail.html | P0 |
| IDX-NOVEL-011 | AI小说特殊处理 | 标题判断 | "AI觉醒之路"跳转至专用页面 | P0 |

---

## 8. 最近更新区域 (#updateList)

### 8.1 更新列表项

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-UPD-001 | 列表项数量 | 初始渲染 | 最多8项 | P0 |
| IDX-UPD-002 | 列表项结构 | 每项 | 封面+信息+时间 | P0 |
| IDX-UPD-003 | 封面 | .update-cover | 48x64px，圆角 | P1 |
| IDX-UPD-004 | 标题 | .update-title | 单行，超出截断 | P1 |
| IDX-UPD-005 | 章节 | .update-chapter | 显示最新章节名 | P1 |
| IDX-UPD-006 | 时间 | .update-time | 显示更新时间 | P1 |
| IDX-UPD-007 | 点击跳转 | 列表项点击 | 跳转至detail.html | P0 |
| IDX-UPD-008 | 查看更多 | .section-more | 跳转至ranking.html | P0 |

### 8.2 悬停效果

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-UPD-HOV-001 | 边框颜色 | border-color | 变为主色 | P1 |
| IDX-UPD-HOV-002 | 阴影 | box-shadow | 显示小阴影 | P1 |

---

## 9. 侧边栏排行榜

### 9.1 热门榜单 (#rankingList)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-RANK-001 | 榜单标题 | #ranking-heading | 星星图标+"热门榜单" | P0 |
| IDX-RANK-002 | 列表项数量 | 初始渲染 | 最多10项 | P0 |
| IDX-RANK-003 | 排名数字 | .ranking-number | 1-10显示 | P0 |
| IDX-RANK-004 | 前三名样式 | .top-3 | 金银铜渐变背景 | P1 |
| IDX-RANK-005 | 第一名 | nth-child(1) | 金色渐变 | P1 |
| IDX-RANK-006 | 第二名 | nth-child(2) | 银色渐变 | P1 |
| IDX-RANK-007 | 第三名 | nth-child(3) | 铜色渐变 | P1 |
| IDX-RANK-008 | 小说名称 | .ranking-name | 单行，超出截断 | P1 |
| IDX-RANK-009 | 作者 | .ranking-author | 小号灰色文本 | P1 |
| IDX-RANK-010 | 热度 | .ranking-heat | 红色，格式化为"X万" | P1 |
| IDX-RANK-011 | 点击跳转 | 列表项点击 | 跳转至detail.html | P0 |

### 9.2 新书速递 (#newBooksList)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-NEW-001 | 榜单标题 | #new-books-heading | 加号图标+"新书速递" | P0 |
| IDX-NEW-002 | 列表项数量 | 初始渲染 | 最多10项 | P0 |
| IDX-NEW-003 | 显示内容 | 每项 | 排名+名称+分类·作者 | P1 |
| IDX-NEW-004 | 点击跳转 | 列表项点击 | 跳转至detail.html | P0 |

---

## 10. 页脚 (Footer)

### 10.1 页脚内容

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-FOOT-001 | 品牌Logo | .footer-brand | 书本图标+"NovelHub" | P1 |
| IDX-FOOT-002 | 导航链接 | .footer-links | 4个链接 | P0 |
| IDX-FOOT-003 | 关于我们 | 链接 | 跳转至index.html | P0 |
| IDX-FOOT-004 | 使用条款 | 链接 | 跳转至index.html | P0 |
| IDX-FOOT-005 | 隐私政策 | 链接 | 跳转至index.html | P0 |
| IDX-FOOT-006 | 联系客服 | 链接 | 跳转至index.html | P0 |
| IDX-FOOT-007 | 版权信息 | .footer-copyright | "© 2026 NovelHub..." | P1 |
| IDX-FOOT-008 | role属性 | 无障碍 | "contentinfo" | P2 |

---

## 11. Toast通知系统

### 11.1 Toast容器

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-TOAST-001 | 容器 | #toastContainer | 固定在视口 | P0 |
| IDX-TOAST-002 | role属性 | 无障碍 | "status" | P2 |
| IDX-TOAST-003 | aria-live | 无障碍 | "polite" | P2 |
| IDX-TOAST-004 | aria-atomic | 无障碍 | "true" | P2 |

### 11.2 错误Toast

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-TOAST-ERR-001 | 错误样式 | .toast-error | 红色背景/边框 | P0 |
| IDX-TOAST-ERR-002 | 错误图标 | .toast-icon | 显示⚠️ | P1 |
| IDX-TOAST-ERR-003 | 错误消息 | .toast-message | "加载失败，请刷新页面重试" | P0 |
| IDX-TOAST-ERR-004 | 自动消失 | 定时器 | 5秒后自动移除 | P0 |

---

## 12. 无障碍功能测试

### 12.1 跳过导航

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-A11Y-001 | 跳过链接 | .skip-link | Tab键首次聚焦时显示 | P0 |
| IDX-A11Y-002 | 跳过目标 | href | 跳转到#mainContent | P0 |

### 12.2 ARIA属性

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-ARIA-001 | 导航栏 | role="banner" | 正确设置 | P2 |
| IDX-ARIA-002 | 主导航 | role="navigation" | 正确设置 | P2 |
| IDX-ARIA-003 | 主内容 | role="main" | 正确设置 | P2 |
| IDX-ARIA-004 | 侧边栏 | role="complementary" | 正确设置 | P2 |
| IDX-ARIA-005 | 页脚 | role="contentinfo" | 正确设置 | P2 |
| IDX-ARIA-006 | 轮播图 | role="list" | 正确设置 | P2 |
| IDX-ARIA-007 | 轮播项 | role="listitem" | 正确设置 | P2 |

---

## 13. 性能优化测试

### 13.1 图片懒加载

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-PERF-001 | IntersectionObserver | 支持检测 | 现代浏览器使用 | P1 |
| IDX-PERF-002 | 降级处理 | 不支持时 | 直接加载所有图片 | P1 |
| IDX-PERF-003 | 加载状态 | .loading类 | 加载时添加 | P2 |
| IDX-PERF-004 | 加载完成 | .loaded类 | 完成后添加 | P2 |
| IDX-PERF-005 | 加载失败 | .error类 | 失败时添加 | P2 |

### 13.2 滚动动画

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-ANIM-001 | IntersectionObserver | 初始化 | 观察.section等元素 | P1 |
| IDX-ANIM-002 | 动画触发 | 进入视口 | 添加.animate-in类 | P1 |
| IDX-ANIM-003 | 动画类 | .animate-on-scroll | 初始添加到元素 | P2 |
| IDX-ANIM-004 | 只触发一次 | unobserve | 动画完成后停止观察 | P1 |

---

## 14. 响应式布局测试

### 14.1 双栏布局 (.two-column-layout)

| 测试项ID | 元素 | 测试内容 | 期望结果 | 优先级 |
|---------|------|---------|---------|--------|
| IDX-LAYOUT-001 | 桌面端 | >1024px | 1fr 320px两列 | P0 |
| IDX-LAYOUT-002 | 平板/移动端 | <=1024px | 单列布局 | P0 |
| IDX-LAYOUT-003 | 侧边栏顺序 | <=1024px | order: -1置顶 | P1 |

---

## 15. 发现的问题汇总

### 15.1 功能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| IDX-ISSUE-001 | Medium | 页脚链接全部指向index.html | 页脚导航 | 应指向实际页面 |
| IDX-ISSUE-002 | Low | Agent卡片无点击跳转功能 | .agent-card | 建议添加跳转 |
| IDX-ISSUE-003 | Low | 分类卡片使用内联样式设置边框色 | .category-card | 建议移至CSS类 |

### 15.2 无障碍问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| IDX-A11Y-ISSUE-001 | Low | 轮播图缺少暂停按钮 | #bannerCarousel | 添加暂停/播放控制 |
| IDX-A11Y-ISSUE-002 | Low | 小说卡片缺少aria-label | .novel-card | 添加描述性标签 |

### 15.3 性能问题

| 问题ID | 严重程度 | 问题描述 | 位置 | 建议修复 |
|--------|---------|---------|------|---------|
| IDX-PERF-ISSUE-001 | Low | 所有分类同时渲染 | #categoryGrid | 考虑虚拟滚动(>12) |

---

## 16. 测试执行清单

### 16.1 必须测试 (P0)

- [ ] IDX-LOAD-001 ~ IDX-LOAD-005: 页面加载
- [ ] IDX-NAV-MENU-001 ~ IDX-NAV-MENU-006: 主导航链接
- [ ] IDX-NAV-ACT-001, IDX-NAV-ACT-004: 搜索和登录按钮
- [ ] IDX-NAV-MOB-001, IDX-NAV-MOB-002: 移动端菜单
- [ ] IDX-NAV-THEME-001 ~ IDX-NAV-THEME-004: 主题切换
- [ ] IDX-SLIDE-001 ~ IDX-SLIDE-004: Banner幻灯片
- [ ] IDX-DOTS-001 ~ IDX-DOTS-004: 轮播指示器
- [ ] IDX-AUTO-001 ~ IDX-AUTO-003: 自动播放
- [ ] IDX-CAT-001, IDX-CAT-002, IDX-CAT-007: 分类卡片
- [ ] IDX-TAB-001 ~ IDX-TAB-004: Tab切换
- [ ] IDX-FILTER-001 ~ IDX-FILTER-004: 过滤逻辑
- [ ] IDX-NOVEL-001 ~ IDX-NOVEL-003, IDX-NOVEL-010, IDX-NOVEL-011: 小说卡片
- [ ] IDX-UPD-001, IDX-UPD-002, IDX-UPD-007: 更新列表
- [ ] IDX-RANK-001, IDX-RANK-002, IDX-RANK-011: 排行榜
- [ ] IDX-TOAST-ERR-001, IDX-TOAST-ERR-003, IDX-TOAST-ERR-004: 错误提示

### 16.2 建议测试 (P1)

- [ ] 所有悬停效果测试
- [ ] 所有响应式布局测试
- [ ] 键盘导航测试
- [ ] 触摸滑动测试

### 16.3 可选测试 (P2)

- [ ] 所有ARIA属性测试
- [ ] 动画效果测试
- [ ] 性能优化测试

---

## 17. 测试环境要求

| 环境 | 版本/配置 |
|------|----------|
| 桌面浏览器 | Chrome 120+, Firefox 121+, Safari 17+ |
| 移动浏览器 | iOS Safari 17+, Chrome Android 120+ |
| 屏幕分辨率 | 1920x1080, 1366x768, 768x1024, 375x667 |
| 网络条件 | 正常、慢速3G、离线 |

---

**文档生成时间**: 2026-04-12
**测试分析师**: Test Results Analyzer
**下次更新**: 发现新问题或页面变更时
