# SupaNexus

SupaNexus 是面向企业的统一大模型 API 聚合平台。它通过一个 OpenAI 兼容的 API 网关，聚合 DeepSeek、通义、智谱、Kimi 等主流模型，帮助团队统一接入、管理用量并控制成本。

## 核心能力

- **统一接入**：所有模型共用一个 Base URL，兼容 OpenAI API 调用方式。
- **多模型聚合**：在统一模型目录中选择已上架、当前组织可用的模型。
- **项目级管理**：通过组织、项目与 API Key 三级结构隔离业务、归因用量。
- **成本与治理**：提供用量计量、配额预算、余额与账单能力，并支持多 Provider 路由。

## 快速开始

1. 前往 [开发者控制台](https://console.supanexus.ai) 注册并创建组织与项目。
2. 在项目中创建 API Key，并妥善保存完整密钥。
3. 将客户端 Base URL 配置为 `https://api.supanexus.ai/v1`。
4. 使用 API Key 调用 `POST /v1/chat/completions`；模型列表可通过 `GET /v1/models` 获取。

> 请勿将 API Key 提交到代码仓库、日志或其他公开位置。

## 文章

- [DeepSeek Harness 最佳搭配：LLM API 精选与接入指南](articles/deepseek-harness-llm-api-guide.md)
- [The Best LLM API Pairing for DeepSeek Harness: A Practical Selection and Integration Guide](articles/deepseek-harness-llm-api-guide.en.md)
