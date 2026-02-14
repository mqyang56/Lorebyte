# Lorebyte

[English](README.md) | [中文](README_zh.md)

基于 AI 的 VS Code Git 提交信息生成器。

Lorebyte 读取你的暂存更改，将 diff 发送给 LLM，然后将符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范的提交信息直接写入源代码管理输入框 — 一键搞定。

## 功能特性

- **一键生成** — 点击源代码管理标题栏中的 Lorebyte 图标，或通过命令面板运行
- **智能生成** — 输入框为空时从头生成提交信息；已有内容时基于暂存的 diff 优化和完善现有信息
- **Conventional Commits** — 生成符合 `<type>(<scope>): <description>` 格式的提交信息
- **中英文支持** — 提交信息可以生成中文或英文
- **模型选择** — 通过 API 浏览并切换可用模型
- **可配置的 Provider** — 内置 [OpenCode Zen](https://opencode.ai/docs/zen/) 支持，可通过 Provider 注册表扩展

## 快速开始

1. 安装扩展
2. 在设置中配置 API Key：**Lorebyte > Api Key**
3. 在 git 中暂存一些更改
4. 点击源代码管理标题栏中的 Lorebyte 图标（或在命令面板中运行 `Lorebyte: Generate Commit Message`）

生成的提交信息会出现在提交输入框中，可以直接提交。

## 命令

| 命令 | 说明 |
|------|------|
| `Lorebyte: Generate Commit Message` | 根据暂存更改生成提交信息 |
| `Lorebyte: List Available Models` | 浏览远程模型并切换当前使用的模型（需要 API Key） |

## 设置

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| `lorebyte.provider` | `opencode-zen` | LLM Provider ID |
| `lorebyte.model` | `minimax-m2.5-free` | 用于生成提交信息的模型 ID |
| `lorebyte.apiKey` | — | LLM Provider 的 API Key |
| `lorebyte.apiBaseUrl` | `https://opencode.ai/zen/v1/chat/completions` | API 端点 URL |
| `lorebyte.language` | `English` | 生成提交信息的语言（`English` / `Chinese`） |

## 开发

### 环境要求

- Node.js >= 18
- VS Code >= 1.85.0

### 构建

```bash
npm install
npm run compile
```

### 监听模式

```bash
npm run watch
```

### 代码检查

```bash
npm run lint
```

在 VS Code 中按 **F5** 启动扩展开发宿主，加载该扩展进行调试。

## 项目结构

```
src/
├── extension.ts              # 入口文件 — 注册命令和 Provider
├── commands/
│   ├── generateCommitMessage.ts  # 核心流程：diff → LLM → 提交信息
│   └── listModels.ts             # 浏览和选择模型
├── config/
│   └── configuration.ts         # 读取 VS Code 设置
├── git/
│   └── gitService.ts            # 通过 VS Code Git API 获取暂存 diff 和提交信息
├── prompt/
│   └── commitPrompt.ts          # 系统提示词和用户提示词构建
└── providers/
    ├── types.ts                 # LLMProvider 接口和消息类型
    ├── providerRegistry.ts      # Provider 注册表模式
    └── openCodeZenProvider.ts   # OpenCode Zen 实现
```

## 许可证

MIT
