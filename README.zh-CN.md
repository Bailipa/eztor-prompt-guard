# EZTor Prompt Guard

> 面向 LLM 应用的无依赖输入与输出安全工具。

[English](README.md) · 中文

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](./src) [![许可证](https://img.shields.io/badge/许可证-GPL--3.0-green)](./LICENSE)

## 在线 Demo

[打开交互式 Demo](https://bailipa.github.io/eztor-prompt-guard/)

Prompt Guard 是一个小型、可检查的安全层，适合放在用户文本进入语言模型之前。它可以检测常见 Prompt Injection，清理模型控制标记，限制输入长度，转义提示词参数，并校验模型结构化输出。

## 安装或复制

```bash
npm install @eztor/prompt-guard
```

```ts
import { detectPromptInjection, validateInput } from '@eztor/prompt-guard'

if (detectPromptInjection(userText).isInjection) throw new Error('Blocked input')
const safe = validateInput(userText)
```

## 覆盖范围

- 中英文角色设定和指令覆盖模式
- 常见聊天模板控制标记清理
- 有上限的词表清洗
- 词汇翻译结果的防御性校验
- 不依赖数据库、网络、框架或运行时服务

## 设计说明

这是确定性的第一道过滤器，不是完整的安全边界。授权、限流、模型供应商隔离和审计日志仍应由应用层负责，并根据真实事故持续补充规则。

## 许可证

GPL-3.0，详见 [`LICENSE`](LICENSE)。
