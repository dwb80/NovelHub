# 屏幕阅读器测试用例

## 测试概述

**测试目标**: 验证平台对屏幕阅读器的支持，确保视障用户能够正常访问所有功能
**测试范围**: ARIA标签、键盘导航、焦点管理、语义化HTML、屏幕阅读器兼容性
**关联需求**: ACC-VIS-001, ACC-VIS-002, ACC-VIS-003, ACC-VIS-004, SYS-ACC-001

---

## 测试用例列表

### TC-ACC-SR-001: ARIA标签完整性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-001 |
| **用例名称** | ARIA标签完整性验证 |
| **前置条件** | 1. 页面已加载<br>2. 屏幕阅读器（NVDA/JAWS）已启动 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 使用WAVE或axe工具扫描页面
2. 检查所有交互元素是否有aria-label
3. 验证动态内容的aria-live区域
4. 检查aria-expanded状态
5. 验证aria-selected状态

**预期结果**:
- 所有按钮有明确的aria-label
- 所有链接有描述性文本
- 表单元素有关联的label
- 动态更新区域有aria-live属性
- 无ARIA使用错误

---

### TC-ACC-SR-002: 页面标题和地标

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-002 |
| **用例名称** | 页面标题和地标导航 |
| **前置条件** | 1. 页面已加载<br>2. 屏幕阅读器已启动 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 检查页面标题是否描述页面内容
2. 使用屏幕阅读器导航到地标区域
3. 验证header、main、nav、footer地标
4. 测试跳转到主要内容区域
5. 验证标题层级结构（h1-h6）

**预期结果**:
- 每个页面有唯一的描述性标题
- 地标角色正确标记（role="main"等）
- 可使用快捷键跳转到各个地标
- 标题层级逻辑清晰（不跳过级别）
- 屏幕阅读器正确朗读地标信息

---

### TC-ACC-SR-003: 键盘导航完整性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-003 |
| **用例名称** | 键盘导航完整性测试 |
| **前置条件** | 1. 页面已加载<br>2. 仅使用键盘操作 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-003 |

**测试步骤**:
1. 使用Tab键遍历所有可交互元素
2. 使用Shift+Tab反向遍历
3. 使用Enter激活按钮和链接
4. 使用Space选择复选框
5. 使用方向键在菜单中导航

**预期结果**:
- 所有功能可通过键盘访问
- Tab顺序符合逻辑
- 焦点可见且明显
- 无键盘陷阱（无法Tab离开）
- 快捷键不冲突

---

### TC-ACC-SR-004: 焦点指示器可见性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-004 |
| **用例名称** | 焦点指示器可见性测试 |
| **前置条件** | 1. 页面已加载 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-004 |

**测试步骤**:
1. 使用Tab键移动焦点
2. 观察焦点指示器样式
3. 在不同主题下测试焦点可见性
4. 测试焦点在图片链接上的显示
5. 验证焦点不随页面滚动消失

**预期结果**:
- 焦点有清晰的视觉指示（边框或高亮）
- 焦点对比度符合WCAG AA标准（3:1）
- 焦点指示器不依赖颜色
- 所有可聚焦元素显示焦点
- 焦点状态持久可见

---

### TC-ACC-SR-005: 表单标签关联

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-005 |
| **用例名称** | 表单标签关联测试 |
| **前置条件** | 1. 表单页面已加载<br>2. 屏幕阅读器已启动 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 检查所有输入框是否有label
2. 验证label的for属性与input的id匹配
3. 测试屏幕阅读器朗读标签
4. 验证必填字段的aria-required
5. 测试错误提示的aria-describedby

**预期结果**:
- 所有表单字段有关联标签
- 屏幕阅读器正确朗读标签文本
- 必填字段标记清晰
- 错误信息与字段正确关联
- 字段组有fieldset和legend

---

### TC-ACC-SR-006: 图片替代文本

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-006 |
| **用例名称** | 图片替代文本测试 |
| **前置条件** | 1. 页面包含图片<br>2. 屏幕阅读器已启动 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 检查所有img标签的alt属性
2. 验证装饰性图片的alt=""
3. 测试信息性图片的描述性alt
4. 验证复杂图片的详细描述
5. 检查背景图片的内容替代

**预期结果**:
- 所有信息性图片有描述性alt
- 装饰性图片有空的alt属性
- 屏幕阅读器正确朗读图片描述
- 无缺失alt属性的图片
- 复杂图表有长描述

---

### TC-ACC-SR-007: 动态内容更新通知

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-007 |
| **用例名称** | 动态内容更新通知测试 |
| **前置条件** | 1. 页面有动态内容<br>2. 屏幕阅读器已启动 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 触发页面内容更新（如加载更多）
2. 验证aria-live区域通知
3. 测试搜索建议的动态显示
4. 验证错误消息的即时通知
5. 测试加载状态的aria-busy

**预期结果**:
- 重要更新通过aria-live通知
- 状态变化被屏幕阅读器朗读
- 不重要的更新不打扰用户
- 错误消息立即通知
- 加载状态明确指示

---

### TC-ACC-SR-008: 模态对话框焦点管理

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-008 |
| **用例名称** | 模态对话框焦点管理测试 |
| **前置条件** | 1. 页面有模态对话框<br>2. 屏幕阅读器已启动 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-003 |

**测试步骤**:
1. 打开模态对话框
2. 验证焦点移动到对话框内
3. 测试Tab键在对话框内循环
4. 按ESC键关闭对话框
5. 验证焦点返回到触发按钮

**预期结果**:
- 打开对话框时焦点进入对话框
- Tab在对话框内循环，不离开
- 对话框有aria-modal="true"
- ESC键可关闭对话框
- 关闭后焦点回到原位置

---

### TC-ACC-SR-009: 表格可访问性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-009 |
| **用例名称** | 表格可访问性测试 |
| **前置条件** | 1. 页面包含数据表格<br>2. 屏幕阅读器已启动 |
| **优先级** | P1 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 检查表格是否有caption
2. 验证表头使用th标签
3. 测试scope属性（row/col）
4. 使用屏幕阅读器导航表格
5. 验证复杂表格的headers属性

**预期结果**:
- 表格有描述性caption
- 表头正确标记为th
- 屏幕阅读器朗读行列标题
- 可在表格单元格间导航
- 数据与表头正确关联

---

### TC-ACC-SR-010: 屏幕阅读器兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-010 |
| **用例名称** | 多屏幕阅读器兼容性测试 |
| **前置条件** | 1. 安装多种屏幕阅读器 |
| **优先级** | P0 |
| **所属需求** | ACC-VIS-001 |

**测试步骤**:
1. 使用NVDA测试主要功能
2. 使用JAWS测试主要功能
3. 使用VoiceOver（Mac/iOS）测试
4. 使用TalkBack（Android）测试
5. 比较各阅读器的表现

**预期结果**:
- NVDA正确朗读所有内容
- JAWS正确朗读所有内容
- VoiceOver在Apple设备上正常工作
- TalkBack在Android设备上正常工作
- 各阅读器表现一致

---

## 测试数据

### ARIA属性检查清单

```json
{
  "aria_requirements": {
    "buttons": {
      "required": ["aria-label"],
      "optional": ["aria-pressed", "aria-expanded"]
    },
    "links": {
      "required": ["descriptive text"],
      "optional": ["aria-label"]
    },
    "forms": {
      "required": ["label association"],
      "optional": ["aria-required", "aria-invalid", "aria-describedby"]
    },
    "navigation": {
      "required": ["role=navigation or nav tag"],
      "optional": ["aria-label"]
    },
    "live_regions": {
      "required": ["aria-live"],
      "values": ["off", "polite", "assertive"]
    }
  }
}
```

### 屏幕阅读器快捷键

```json
{
  "nvda_shortcuts": {
    "heading_navigation": "H / Shift+H",
    "landmark_navigation": "D / Shift+D",
    "form_field": "F / Shift+F",
    "button": "B / Shift+B",
    "link": "K / Shift+K",
    "table": "T / Shift+T",
    "landmarks_list": "Insert+F7"
  },
  "jaws_shortcuts": {
    "heading_navigation": "H / Shift+H",
    "landmark_navigation": "R / Shift+R",
    "form_field": "F / Shift+F",
    "button": "B / Shift+B",
    "link": "Tab / Shift+Tab",
    "table": "T / Shift+T",
    "regions_list": "Insert+Ctrl+R"
  }
}
```

---

## 测试环境

- **屏幕阅读器**: NVDA 2024.x, JAWS 2024, VoiceOver, TalkBack
- **浏览器**: Chrome, Firefox, Edge, Safari
- **操作系统**: Windows 10/11, macOS, iOS, Android
- **测试工具**: WAVE, axe DevTools, Lighthouse

---

## 相关文档

- [用户需求报告 - 无障碍访问](../../requirement/用户需求报告.md#125-无障碍访问场景)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
