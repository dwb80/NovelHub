# Skill Package Template

## Skill Metadata

```yaml
skill_id: skill-example-skill-v1
name: Example Skill
name_zh: 示例技能
category: foundation
version: 1.0.0
author: Your Name
tags:
  - 示例
  - 模板
  - 技能
tags_en:
  - Example
  - Template
  - Skill
description: This is an example skill package template showing the standard format and structure.
description_zh: 这是一个示例技能包模板，展示标准的格式和结构。
```

---

## Overview / 概述

简要描述这个技能包的功能、用途和适用场景。说明它能帮助 AI 智能体完成什么任务，以及在什么情况下使用最有效。

## Capabilities / 能力

列出这个技能包提供的核心能力：

1. **能力一**：详细说明
2. **能力二**：详细说明
3. **能力三**：详细说明

## Usage / 使用方法

### Input Parameters / 输入参数

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| input1 | string | Yes | Description of input1 |
| input2 | number | No | Description of input2 |
| input3 | object | Yes | Description of input3 |

### Output Format / 输出格式

描述技能执行后的输出格式：

```json
{
  "result": "success",
  "data": {
    "field1": "value1",
    "field2": "value2"
  },
  "metadata": {
    "processing_time": "1.2s",
    "confidence": 0.95
  }
}
```

## Examples / 示例

### Example 1: Basic Usage / 基础用法

**Input:**
```
用户提供的内容或指令
```

**Process:**
1. 第一步处理
2. 第二步处理
3. 第三步处理

**Output:**
```
预期的输出结果
```

### Example 2: Advanced Usage / 高级用法

**Input:**
```
更复杂的输入示例
```

**Process:**
1. 高级处理步骤1
2. 高级处理步骤2
3. 高级处理步骤3

**Output:**
```
高级输出结果
```

## Best Practices / 最佳实践

1. **实践一**：说明和理由
2. **实践二**：说明和理由
3. **实践三**：说明和理由

## Limitations / 限制

- 限制一：说明
- 限制二：说明
- 限制三：说明

## Related Skills / 相关技能

- [Skill Name 1](link-to-skill-1) - 简要说明
- [Skill Name 2](link-to-skill-2) - 简要说明
- [Skill Name 3](link-to-skill-3) - 简要说明

## Changelog / 更新日志

### v1.0.0 (2024-05-01)
- Initial release
- Basic functionality implemented
- Documentation completed

### v1.1.0 (2024-05-15)
- Added new feature X
- Improved performance
- Fixed bug Y

## License / 许可证

说明技能包的使用许可，例如：

MIT License - 允许自由使用、修改和分发

## Author / 作者

- **Name**: Your Name
- **Email**: your.email@example.com
- **Homepage**: https://your-website.com
- **GitHub**: https://github.com/yourusername

## Support / 支持

如需帮助或报告问题，请通过以下方式联系：

- 邮箱：support@example.com
- 论坛：https://forum.example.com
- GitHub Issues: https://github.com/yourusername/skill-package/issues

---

## Notes for AI Agents / AI智能体使用说明

### When to Use This Skill / 何时使用此技能

- 场景1的具体描述
- 场景2的具体描述
- 场景3的具体描述

### How to Use This Skill / 如何使用此技能

1. **Step 1**: 详细步骤
2. **Step 2**: 详细步骤
3. **Step 3**: 详细步骤

### Expected Outcomes / 预期结果

使用此技能后，应该得到：
- 结果1
- 结果2
- 结果3

### Quality Checklist / 质量检查清单

在使用此技能时，请确保：
- [ ] 检查项1
- [ ] 检查项2
- [ ] 检查项3
- [ ] 检查项4

---

*This template follows the NovelHub Skill Package Standard v1.0*
*本模板遵循 NovelHub 技能包标准 v1.0*
