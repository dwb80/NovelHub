# NovelHub 开发指南

**当前开发分支**: `dev-1.0`

---

## 快速开始

### 1. 切换到开发分支
```bash
git checkout dev-1.0
```

### 2. 拉取最新代码
```bash
git pull origin dev-1.0
```

### 3. 推送代码
```bash
# Windows PowerShell
$env:GIT_SSH_COMMAND="ssh -p 22 -i ~/.ssh/id_ed25519"; git push origin dev-1.0
```

---

## 项目结构

```
novelhub/
├── apps/
│   ├── backend/          # NestJS 后端 (端口 3001)
│   └── frontend/         # Next.js 前端 (端口 3000)
├── plan/                 # 需求文档
│   └── 01-需求分析/
│       └── requirements/
│           ├── features/     # 功能级需求 (28个)
│           └── granular/     # 页面级需求 (50个)
├── case/                 # 测试用例
├── .trae/                # 项目配置
│   └── project-config.json
└── .git/
    └── dev-branch-info.md    # 分支信息
```

---

## 文档命名规范

### 功能级需求 (features/)
| 前缀 | 模块 | 示例 |
|------|------|------|
| ADM-xxx | 管理后台 | ADM-001-管理后台概览需求.md |
| AGT-xxx | AI智能体 | AGT-001-AI智能体作家页面需求.md |
| BKS-xxx | 书架管理 | BKS-001-书架功能需求.md |
| CMT-xxx | 评论系统 | CMT-001-评论系统需求.md |
| DSC-xxx | 发现搜索 | DSC-001-导航与分类需求.md |
| NEF-xxx | NEF引擎 | NEF-001-数据编码需求.md |
| NTF-xxx | 通知系统 | NTF-001-通知系统需求.md |
| NVL-xxx | 小说管理 | NVL-001-小说状态工作流需求.md |
| PAY-xxx | 支付系统 | PAY-001-支付系统需求.md |
| RDG-xxx | 阅读进度 | RDG-001-阅读进度功能需求.md |
| RVW-xxx | 评审系统 | RVW-001-评审页面需求.md |
| SRC-xxx | 搜索系统 | SRC-001-搜索功能需求.md |
| STS-xxx | 统计报表 | STS-001-统计报表需求.md |
| SYS-xxx | 系统功能 | SYS-001-BullMQ队列性能指标需求.md |
| USR-xxx | 个人中心 | USR-001-个人中心需求.md |

---

## 术语规范

- ✅ **AI智能体** - 正确术语
- ❌ Claw / OpenClaw - 已废弃

---

## 相关文档

- [细粒度需求文档索引](plan/01-需求分析/requirements/细粒度需求文档索引-v1.1.md)
- [细粒度需求文档](plan/01-需求分析/requirements/细粒度需求文档.md)
- [分支详细信息](.git/dev-branch-info.md)
- [项目配置](.trae/project-config.json)

---

**最后更新**: 2026-04-27
