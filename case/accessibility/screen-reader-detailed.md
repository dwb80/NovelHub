# 屏幕阅读器详细测试用例

## 测试概述

**测试目标**: 全面验证平台对主流屏幕阅读器的支持，确保视障用户能够无障碍访问所有核心功能
**测试范围**: NVDA、JAWS、VoiceOver、TalkBack 兼容性测试，ARIA 实现验证，键盘导航完整性
**关联需求**: ACC-SR-001, ACC-SR-002, ACC-SR-003, ACC-SR-004, ACC-ARIA-001
**优先级**: P2

---

## 测试用例列表

### TC-ACC-SR-D001: NVDA 屏幕阅读器兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D001 |
| **用例名称** | NVDA 屏幕阅读器兼容性测试 |
| **前置条件** | 1. Windows 10/11 系统<br>2. NVDA 2024.x 已安装<br>3. Chrome/Firefox 浏览器 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-001 |

**测试步骤**:
1. 启动 NVDA 屏幕阅读器
2. 打开网站首页，听取页面标题朗读
3. 使用 H 键导航标题
4. 使用 D 键导航地标区域
5. 使用 F 键导航表单字段
6. 使用 B 键导航按钮
7. 使用 K 键导航链接
8. 使用 T 键导航表格
9. 测试阅读器模式切换
10. 测试表单填写流程

**预期结果**:
- 页面标题正确朗读
- 所有标题按层级正确朗读
- 地标区域（banner, main, navigation, contentinfo）正确识别
- 表单字段标签正确关联
- 按钮和链接有描述性文本
- 表格行列标题正确朗读

**NVDA 快捷键测试**:
```json
{
  "nvda_shortcuts": {
    "heading_navigation": "H / Shift+H",
    "landmark_navigation": "D / Shift+D",
    "form_field": "F / Shift+F",
    "button": "B / Shift+B",
    "link": "K / Shift+K",
    "table": "T / Shift+T",
    "landmarks_list": "Insert+F7",
    "elements_list": "Insert+F7",
    "speak_focus": "NVDA+Tab",
    "document_format": "NVDA+D"
  }
}
```

---

### TC-ACC-SR-D002: JAWS 屏幕阅读器兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D002 |
| **用例名称** | JAWS 屏幕阅读器兼容性测试 |
| **前置条件** | 1. Windows 10/11 系统<br>2. JAWS 2024 已安装<br>3. Chrome/Edge 浏览器 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-001 |

**测试步骤**:
1. 启动 JAWS 屏幕阅读器
2. 打开网站首页
3. 使用 JAWS 快捷键导航页面
4. 测试虚拟光标模式
5. 测试表单模式
6. 测试阅读器功能菜单
7. 测试语音设置调整

**预期结果**:
- JAWS 正确识别页面结构
- 虚拟光标模式下可浏览所有内容
- 表单模式下可正确填写表单
- 快捷键导航正常工作

**JAWS 快捷键测试**:
```json
{
  "jaws_shortcuts": {
    "heading_navigation": "H / Shift+H",
    "landmark_navigation": "R / Shift+R",
    "form_field": "F / Shift+F",
    "button": "B / Shift+B",
    "link": "Tab / Shift+Tab",
    "table": "T / Shift+T",
    "regions_list": "Insert+Ctrl+R",
    "links_list": "Insert+F7",
    "headings_list": "Insert+F6"
  }
}
```

---

### TC-ACC-SR-D003: VoiceOver macOS 兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D003 |
| **用例名称** | VoiceOver macOS 兼容性测试 |
| **前置条件** | 1. macOS Sonoma+<br>2. VoiceOver 已启用（Cmd+F5）<br>3. Safari/Chrome 浏览器 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-002 |

**测试步骤**:
1. 启用 VoiceOver（Cmd+F5）
2. 打开网站首页
3. 使用 VoiceOver 转子（Ctrl+Option+U）导航
4. 测试标题导航（Ctrl+Option+Cmd+H）
5. 测试链接导航（Ctrl+Option+Cmd+L）
6. 测试表单控件导航（Ctrl+Option+Cmd+J）
7. 测试表格导航
8. 测试触摸板手势（如使用 MacBook）

**预期结果**:
- VoiceOver 正确识别页面元素
- 转子菜单显示正确的导航选项
- 所有交互元素可访问
- 触摸板手势正常工作

**VoiceOver macOS 快捷键**:
```json
{
  "voiceover_macos": {
    "toggle_voiceover": "Cmd+F5",
    "rotor": "Ctrl+Option+U",
    "next_heading": "Ctrl+Option+Cmd+H",
    "next_link": "Ctrl+Option+Cmd+L",
    "next_form_control": "Ctrl+Option+Cmd+J",
    "read_all": "Ctrl+Option+A",
    "interact": "Ctrl+Option+Shift+Down",
    "stop_interact": "Ctrl+Option+Shift+Up"
  }
}
```

---

### TC-ACC-SR-D004: VoiceOver iOS 兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D004 |
| **用例名称** | VoiceOver iOS 兼容性测试 |
| **前置条件** | 1. iOS 17+ 设备<br>2. VoiceOver 已启用<br>3. Safari 浏览器 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-002 |

**测试步骤**:
1. 在 iOS 设置中启用 VoiceOver
2. 打开 Safari 访问网站
3. 单指滑动浏览页面元素
4. 双指滑动滚动页面
5. 三指滑动切换页面
6. 双击激活元素
7. 测试转子导航（双指旋转）
8. 测试阅读器设置

**预期结果**:
- 单指滑动可浏览所有元素
- 双指滑动可滚动页面
- 双击正确激活按钮和链接
- 转子导航显示正确选项

**VoiceOver iOS 手势**:
```json
{
  "voiceover_ios": {
    "explore": "单指滑动",
    "activate": "双击",
    "scroll": "三指滑动",
    "go_back": "双指 Z 形手势",
    "rotor": "双指旋转",
    "read_all": "双指下滑",
    "pause": "双指单击",
    "home": "四指点击屏幕底部"
  }
}
```

---

### TC-ACC-SR-D005: TalkBack Android 兼容性

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D005 |
| **用例名称** | TalkBack Android 兼容性测试 |
| **前置条件** | 1. Android 14+ 设备<br>2. TalkBack 已启用<br>3. Chrome 浏览器 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-003 |

**测试步骤**:
1. 在 Android 设置中启用 TalkBack
2. 打开 Chrome 访问网站
3. 单指滑动浏览元素
4. 双击激活元素
5. 双指滑动滚动页面
6. 测试本地上下文菜单
7. 测试全局上下文菜单

**预期结果**:
- 单指滑动可浏览所有元素
- 双击正确激活元素
- 双指滑动可滚动页面
- 上下文菜单功能正常

**TalkBack 手势**:
```json
{
  "talkback": {
    "explore": "单指滑动",
    "activate": "双击",
    "scroll": "双指滑动",
    "local_menu": "单指下滑后右滑",
    "global_menu": "单指下滑后左滑",
    "read_all": "三指下滑",
    "pause": "单指双击并保持"
  }
}
```

---

### TC-ACC-SR-D006: ARIA Live 区域测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D006 |
| **用例名称** | ARIA Live 区域实时通知测试 |
| **前置条件** | 1. 屏幕阅读器已启动<br>2. 页面包含动态更新内容 |
| **优先级** | P2 |
| **所属需求** | ACC-ARIA-001 |

**测试步骤**:
1. 触发页面内容更新（如加载更多）
2. 验证 aria-live="polite" 区域通知
3. 验证 aria-live="assertive" 紧急通知
4. 测试搜索建议的动态显示
5. 验证错误消息的即时通知
6. 测试加载状态的 aria-busy
7. 测试 aria-relevant 属性

**预期结果**:
- polite 更新在不打断当前朗读时通知
- assertive 更新立即打断并通知
- 状态变化被屏幕阅读器朗读
- 不重要的更新不打扰用户
- 错误消息立即通知

**ARIA Live 配置**:
```html
<!--  polite: 非紧急更新  -->
<div aria-live="polite" aria-atomic="true" id="status-region">
  加载完成
</div>

<!--  assertive: 紧急更新  -->
<div aria-live="assertive" aria-atomic="true" id="error-region">
  保存失败，请重试
</div>

<!--  busy: 加载状态  -->
<div aria-live="polite" aria-busy="true" id="loading-region">
  <span class="sr-only">加载中...</span>
</div>
```

---

### TC-ACC-SR-D007: 阅读器无障碍测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D007 |
| **用例名称** | 小说阅读器屏幕阅读器支持测试 |
| **前置条件** | 1. 屏幕阅读器已启动<br>2. 存在可阅读的小说章节 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-004 |

**测试步骤**:
1. 打开小说阅读器页面
2. 听取章节标题朗读
3. 使用阅读器连续朗读功能
4. 测试章节导航按钮
5. 测试字体大小调整
6. 测试主题切换
7. 测试书签功能
8. 测试阅读进度保存

**预期结果**:
- 章节标题正确朗读
- 正文内容可连续朗读
- 导航按钮有清晰的 aria-label
- 设置调整有即时反馈
- 阅读进度正确保存和恢复

**阅读器 ARIA 配置**:
```html
<article aria-label="小说阅读器" role="main">
  <h1 aria-label="章节标题">第一章 觉醒</h1>
  <div role="region" aria-label="章节内容" tabindex="0">
    <p>正文内容...</p>
  </div>
  <nav aria-label="阅读器导航">
    <button aria-label="上一章">上一章</button>
    <button aria-label="下一章">下一章</button>
    <button aria-label="打开设置">设置</button>
  </nav>
</article>
```

---

### TC-ACC-SR-D008: 表单无障碍详细测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D008 |
| **用例名称** | 表单屏幕阅读器支持详细测试 |
| **前置条件** | 1. 屏幕阅读器已启动<br>2. 表单页面已加载 |
| **优先级** | P2 |
| **所属需求** | ACC-ARIA-001 |

**测试步骤**:
1. 导航到登录表单
2. 听取用户名输入框标签
3. 听取密码输入框标签
4. 测试输入验证错误提示
5. 测试表单提交反馈
6. 测试注册表单
7. 测试搜索表单
8. 测试评论表单

**预期结果**:
- 所有输入框有关联标签
- 必填字段标记清晰
- 错误信息与字段正确关联
- 提交成功/失败有明确反馈
- 表单验证状态正确传达

**表单 ARIA 配置**:
```html
<form aria-labelledby="form-title">
  <h2 id="form-title">用户登录</h2>
  
  <div>
    <label for="username">用户名 <span aria-label="必填">*</span></label>
    <input 
      id="username" 
      type="text" 
      aria-required="true"
      aria-invalid="false"
      aria-describedby="username-error"
    >
    <span id="username-error" role="alert" aria-live="assertive"></span>
  </div>
  
  <div>
    <label for="password">密码 <span aria-label="必填">*</span></label>
    <input 
      id="password" 
      type="password"
      aria-required="true"
      aria-describedby="password-hint"
    >
    <span id="password-hint">密码至少8位字符</span>
  </div>
  
  <button type="submit" aria-label="登录">登录</button>
</form>
```

---

### TC-ACC-SR-D009: 动态内容无障碍测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D009 |
| **用例名称** | 动态内容屏幕阅读器支持测试 |
| **前置条件** | 1. 屏幕阅读器已启动<br>2. 页面包含 AJAX 动态加载 |
| **优先级** | P2 |
| **所属需求** | ACC-ARIA-001 |

**测试步骤**:
1. 触发搜索建议加载
2. 听取动态搜索结果通知
3. 测试无限滚动加载
4. 听取新内容加载通知
5. 测试模态对话框打开
6. 测试模态对话框关闭
7. 测试 Toast 通知
8. 测试加载状态指示

**预期结果**:
- 搜索建议更新被通知
- 新内容加载有明确提示
- 模态对话框焦点管理正确
- Toast 通知被朗读
- 加载状态明确指示

---

### TC-ACC-SR-D010: 多屏幕阅读器对比测试

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-ACC-SR-D010 |
| **用例名称** | 多屏幕阅读器对比一致性测试 |
| **前置条件** | 1. 多种屏幕阅读器可用<br>2. 相同测试页面 |
| **优先级** | P2 |
| **所属需求** | ACC-SR-001 |

**测试矩阵**:

| 屏幕阅读器 | 浏览器 | 平台 | 核心功能 | 阅读器支持 |
|------------|--------|------|----------|------------|
| NVDA 2024.1 | Chrome 120 | Windows 11 | 待测试 | 待测试 |
| NVDA 2024.1 | Firefox 121 | Windows 11 | 待测试 | 待测试 |
| JAWS 2024 | Chrome 120 | Windows 11 | 待测试 | 待测试 |
| JAWS 2024 | Edge 120 | Windows 11 | 待测试 | 待测试 |
| VoiceOver | Safari 17 | macOS Sonoma | 待测试 | 待测试 |
| VoiceOver | Safari 17 | iOS 17 | 待测试 | 待测试 |
| TalkBack | Chrome 120 | Android 14 | 待测试 | 待测试 |

**测试内容**:
- 页面标题朗读一致性
- 地标导航一致性
- 表单标签关联一致性
- 动态内容通知一致性
- 焦点管理一致性

---

## 屏幕阅读器测试数据

### ARIA 属性完整检查清单

```json
{
  "aria_checklist": {
    "landmarks": {
      "banner": "[role='banner'] 或 <header>",
      "navigation": "[role='navigation'] 或 <nav>",
      "main": "[role='main'] 或 <main>",
      "complementary": "[role='complementary'] 或 <aside>",
      "contentinfo": "[role='contentinfo'] 或 <footer>",
      "search": "[role='search']",
      "article": "[role='article'] 或 <article>"
    },
    "form_elements": {
      "label_association": "label[for] 与 input[id] 匹配",
      "aria_label": "无可见标签时使用",
      "aria_labelledby": "引用其他元素作为标签",
      "aria_describedby": "描述性文本关联",
      "aria_required": "必填字段标记",
      "aria_invalid": "验证状态",
      "aria_errormessage": "错误消息关联"
    },
    "interactive_elements": {
      "button": "role='button' 或 <button>",
      "link": "role='link' 或 <a>",
      "aria_pressed": "切换按钮状态",
      "aria_expanded": "展开/折叠状态",
      "aria_haspopup": "弹出菜单指示",
      "aria_controls": "控制关系"
    },
    "live_regions": {
      "aria_live_polite": "非紧急更新",
      "aria_live_assertive": "紧急更新",
      "aria_atomic": "整体朗读",
      "aria_relevant": "相关更新类型",
      "aria_busy": "加载状态"
    }
  }
}
```

### 屏幕阅读器快捷键参考

```json
{
  "screen_reader_shortcuts": {
    "nvda": {
      "stop_speech": "Control",
      "pause_speech": "Shift",
      "read_title": "NVDA+T",
      "read_window": "NVDA+B",
      "read_document": "NVDA+Down",
      "elements_list": "NVDA+F7",
      "preferences": "NVDA+N"
    },
    "jaws": {
      "stop_speech": "Control",
      "read_title": "Insert+T",
      "read_window": "Insert+B",
      "virtual_cursor": "Insert+Z",
      "links_list": "Insert+F7",
      "headings_list": "Insert+F6"
    },
    "voiceover_macos": {
      "stop_speech": "Control",
      "read_all": "Control+Option+A",
      "read_item": "Control+Option+Space",
      "rotor": "Control+Option+U",
      "voiceover_menu": "Control+Option+M"
    },
    "voiceover_ios": {
      "read_all": "双指下滑",
      "pause": "双指单击",
      "rotor": "双指旋转",
      "explore": "单指滑动"
    }
  }
}
```

---

## 测试环境

### 硬件环境

- Windows 11 PC（NVDA、JAWS 测试）
- MacBook Pro（VoiceOver macOS 测试）
- iPhone 15（VoiceOver iOS 测试）
- Samsung Galaxy S24（TalkBack 测试）

### 软件环境

| 屏幕阅读器 | 版本 | 浏览器 | 平台 |
|------------|------|--------|------|
| NVDA | 2024.1 | Chrome 120, Firefox 121 | Windows 11 |
| JAWS | 2024 | Chrome 120, Edge 120 | Windows 11 |
| VoiceOver | 内置 | Safari 17, Chrome 120 | macOS Sonoma |
| VoiceOver | 内置 | Safari 17 | iOS 17 |
| TalkBack | 内置 | Chrome 120 | Android 14 |

### 辅助工具

- axe DevTools
- WAVE Evaluation Tool
- Lighthouse Accessibility Audit
- Screen Reader Testing Checklist

---

## 屏幕阅读器测试检查清单

### 预测试检查

- [ ] 屏幕阅读器已正确安装和配置
- [ ] 浏览器兼容性已确认
- [ ] 测试页面已准备就绪
- [ ] 测试数据已准备

### 功能测试检查

- [ ] 页面标题正确朗读
- [ ] 地标导航正常工作
- [ ] 标题层级正确识别
- [ ] 表单标签正确关联
- [ ] 按钮有描述性文本
- [ ] 链接文本有意义
- [ ] 图片有替代文本
- [ ] 表格结构正确
- [ ] 动态内容有通知
- [ ] 错误消息明确

### 兼容性测试检查

- [ ] NVDA 测试通过
- [ ] JAWS 测试通过
- [ ] VoiceOver macOS 测试通过
- [ ] VoiceOver iOS 测试通过
- [ ] TalkBack 测试通过

---

## 已知屏幕阅读器问题

### 常见问题及解决方案

| 问题 | 影响 | 解决方案 |
|------|------|----------|
| aria-live 不触发 | 动态更新不通知 | 确保元素先存在于 DOM |
| 焦点丢失 | 模态框关闭后焦点混乱 | 使用 focus-trap 和 restore-focus |
| 重复朗读 | 内容被朗读多次 | 检查 aria-atomic 设置 |
| 表格导航困难 | 复杂表格难以理解 | 添加 scope 和 headers 属性 |
| 图标无意义 | 图标按钮无标签 | 添加 aria-label 或 sr-only 文本 |

---

## 相关文档

- [屏幕阅读器基础测试](./screen-reader.md)
- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [NVDA 用户指南](https://www.nvaccess.org/download/)
- [JAWS 文档](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver 指南](https://www.apple.com/accessibility/mac/vision/)

---

**编制**: 无障碍测试工程师  
**审核**: 待审核  
**更新日期**: 2026-04-12
