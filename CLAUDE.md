# CLAUDE.md

## 项目概述

**助盲跑** — 连接盲人跑者与志愿者/跑团的平台

**核心价值**：让有跑步需求的盲人在想跑步时，能快速找到志愿者或跑团来承接需求。

**一期策略**：优先吸引志愿者发布跑步活动，盲人用户再从中选择适配的需求。

**现状**：移动端原型 `prototype.html` 已完成，涵盖三种角色的核心页面流程。

## 技术选型（待确认）

| 决策项 | 选项 |
|--------|------|
| 前端框架 | React / Vue / 原生 HTML+JS |
| 后端 | 待定 |
| 部署 | 待定 |

详见 `docs/specs/decisions/`。

## 启动项目

```bash
# 原型预览
open prototype.html

# 正式开发（待实现）
npm install
npm run dev
```

## 文档管理规则

### 自动创建
- 技术选型决策 → ADR 到 docs/specs/decisions/
- 调研完成 → 报告到 docs/research/
- 需求探索 → 场景文档到 docs/design/
- 重要 bug → 错误复盘到 docs/logs/errors/
- 功能可用 → 使用指南到 docs/handbook/

### 自动更新
- 架构变更 → 更新 docs/specs/architecture.md
- 功能完成 → 更新 CHANGELOG + README
- 需求变更 → 更新 docs/specs/prd.md
- 功能行为变更 → 检查 docs/handbook/ 是否需要同步

### ADR 规则
技术决策前先读 docs/specs/decisions/，避免重提已否决方案。

### 写作规则
- audience 默认 both，需求侧 → human，开发侧 → ai
- 规格文档描述约束，不贴大段实现代码
- human 文档说人话
