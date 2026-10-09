# EZTor Prompt Guard

> Dependency-free input and output safety helpers for LLM applications.

[English](README.md) · [中文](README.zh-CN.md)

[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](./src) [![License](https://img.shields.io/badge/license-GPL--3.0-green)](./LICENSE)

## Live demo

[Open the interactive demo](https://bailipa.github.io/eztor-prompt-guard/)

Prompt Guard is a small, inspectable safety layer for apps that send user text to language models. It detects common prompt-injection patterns, removes model sentinel markers, enforces input limits, escapes prompt values, and validates structured model output.

## Install or copy

```bash
npm install @eztor/prompt-guard
```

```ts
import { detectPromptInjection, validateInput } from '@eztor/prompt-guard'

if (detectPromptInjection(userText).isInjection) throw new Error('Blocked input')
const safe = validateInput(userText)
```

## Scope

- English and Chinese role/instruction override patterns
- Sentinel cleanup for common chat templates
- Bounded word-list sanitization
- Defensive validation for vocabulary translation output
- No database, network, framework, or runtime service dependency

## Design note

This is a deterministic first-pass filter, not a complete security boundary. Keep authorization, rate limiting, provider isolation, and audit logging at the application layer, and keep expanding the pattern set from real incidents.

## License

GPL-3.0. See [`LICENSE`](LICENSE).
