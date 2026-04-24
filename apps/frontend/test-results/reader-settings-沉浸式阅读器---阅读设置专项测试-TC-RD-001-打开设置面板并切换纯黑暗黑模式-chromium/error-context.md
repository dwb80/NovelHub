# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reader-settings.spec.ts >> 沉浸式阅读器 - 阅读设置专项测试 >> TC-RD-001: 打开设置面板并切换纯黑暗黑模式
- Location: e2e\reader-settings.spec.ts:11:7

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has(svg.lucide-settings)')

```

```
Tearing down "context" exceeded the test timeout of 60000ms.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img [ref=e4]
    - paragraph [ref=e6]: 加载中...
  - region "Notifications (F8)":
    - list
```