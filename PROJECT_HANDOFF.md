# Giao Stock GitHub Blog · 交接说明

> 用途：交给新的 Codex / GPT 账号继续维护本仓库和发布文章。本文不包含任何 Token、API Key、密码或其他凭据。

## 项目定位

- GitHub 账号：`alexuvlab`
- 仓库名称：`giao-stock`
- 仓库地址：[https://github.com/alexuvlab/giao-stock.git](https://github.com/alexuvlab/giao-stock.git)
- 默认分支：`main`
- 本地项目目录：`/Users/giao/Desktop/SupaNexusAlexwu/giao-stock`
- 博客名称：**Alex UV Lab**
- 博客身份：个人开发者技术博客，分享 AI 工具、LLM API、MCP Server、Agent 工作流与自动化实践。

这个仓库不是 SupaNexus 的官方产品站。文章应保持个人实践、选型、排障或复盘的叙述视角；SupaNexus 作为个人开发者会采用的统一 LLM API 入口之一自然出现，而不是硬性广告。

## SupaNexus 信息

- 海外官网：[https://supanexus.ai/](https://supanexus.ai/)
- 开发者控制台：[https://console.supanexus.ai/](https://console.supanexus.ai/)
- OpenAI 兼容 Base URL：`https://api.supanexus.ai/v1`
- 能力表述：统一 API 入口、项目级 API Key、模型目录、按量计费与多模型接入。
- 可提及：免费模型试用、注册优惠和充值活动；**具体资格、模型与活动规则必须写“以注册后的控制台为准”**。

不要写成以下无法证明的承诺：

- “不限流、不限速”
- “永久免费”
- “绕过某厂商的 API 限制”
- 未经验证的模型价格、性能、可用性或兼容性结论

## 当前进度

最新已推送提交：`9b15647 docs: add Kimi K3 rate limit guide`

当前已发布文章全部为中英文互链：

| 中文文章 | English article | 主题 |
|---|---|---|
| `articles/deepseek-harness-llm-api-guide.md` | `articles/deepseek-harness-llm-api-guide.en.md` | DeepSeek Harness 的 LLM API 选型与接入 |
| `articles/5-free-llm-api-platforms.md` | `articles/5-free-llm-api-platforms.en.md` | 个人开发者的免费 LLM API 平台选择 |
| `articles/deepseek-harness-demo-to-controlled-cost.md` | `articles/deepseek-harness-demo-to-controlled-cost.en.md` | DeepSeek Harness 从 Demo 到成本控制 |
| `articles/kimi-k3-api-429-fixes.md` | `articles/kimi-k3-api-429-fixes.en.md` | Kimi K3 API 429 的重试、限流与 fallback |

`README.md` 是博客首页，已经列出所有文章。新增文章时，要同时：

1. 创建中文 Markdown；
2. 创建英文 Markdown；
3. 在两篇标题下添加相互链接；
4. 在 `README.md` 的 `## Articles` 中添加一条中英文入口；
5. 使用相对路径，保证 GitHub 渲染正常。

## 当前文章写作规范

- 以“我在个人项目中遇到的问题 / 我的测试 / 我的选择”为主线。
- 先提供可执行的技术价值，再说明 SupaNexus 是何时适合的可选方案。
- 对近期模型、价格、API 限流、MCP 规范等时效性信息，先查官方文档或可信一手来源。
- 不复制其他 GitHub 文章内容；可参考其“标题、逐项介绍、常见问题、总结”的可读结构。
- 默认创建中英文版本，且内容应自然翻译，不是机械逐字翻译。
- 文章不必使用图片，除非任务明确要求；已有 DeepSeek API 选型文章使用了 `assets/` 下的 SupaNexus 官网截图。

## 下一篇文章建议

优先延续“真实个人开发者问题”方向，例如：

- Kimi K3 API 429 怎么办后的进阶篇：多模型 fallback 如何设计；
- MCP 2026 新规范：个人开发者升级 Server 时需要注意什么；
- 同一任务比较 DeepSeek、Kimi、Qwen：质量、延迟、成本如何记录；
- 给个人博客增加 AI 问答：流式输出、预算控制和 fallback；
- 一个 API Key 如何管理多个个人 AI 项目。

## 新账号接手步骤

### 1. 获取代码

如果本地目录已存在：

```bash
cd /Users/giao/Desktop/SupaNexusAlexwu/giao-stock
git pull --ff-only origin main
```

如果重新克隆：

```bash
git clone https://github.com/alexuvlab/giao-stock.git
cd giao-stock
```

### 2. 配置 Git 身份

将下面占位内容替换成 GitHub 账号对应的公开身份：

```bash
git config --local user.name "YOUR_GITHUB_NAME"
git config --local user.email "YOUR_GITHUB_EMAIL"
```

### 3. 配置 GitHub 身份验证

不要将 GitHub Personal Access Token 写进远程 URL、Markdown、源代码或 Git 提交。

推荐使用 GitHub CLI 登录：

```bash
gh auth login
```

或者在首次执行 `git push` 时，通过系统凭据管理器完成 HTTPS 登录。请使用拥有该仓库写入权限的 GitHub 账号。

### 4. 发布文章

完成中英文文章与 README 更新后：

```bash
git add README.md articles/
git diff --cached --check
git commit -m "docs: add <article topic> guide"
git push origin main
```

推送前检查：

```bash
git status --short
git remote -v
git branch --show-current
```

应确认远程是 `https://github.com/alexuvlab/giao-stock.git`，分支是 `main`。

## 工作区注意事项

当前工作区可能有不属于已发布博客内容的未跟踪文件，例如 `.DS_Store` 或 `DeepSeek_LLM_API_Workflow_SupaNexus.md`。发布新文章时，只 `git add` 本次明确修改的文件，避免意外提交它们。

## 可直接交给新 GPT / Codex 的任务提示

```text
请继续维护 Giao Stock GitHub 个人技术博客。

项目仓库：https://github.com/alexuvlab/giao-stock.git
默认分支：main
项目定位：Alex UV Lab 是个人开发者博客，分享 AI 工具、LLM API、MCP Server、Agent 与自动化实践。

请先阅读 PROJECT_HANDOFF.md 和 README.md，确认已有文章与写作风格。新增文章必须创建中英文两个 Markdown 文件、在标题下建立双向语言链接，并更新 README.md 的 Articles 列表。文章要以个人开发者的真实问题、测试或复盘切入，先提供技术价值，再客观说明 SupaNexus 何时适合作为统一 LLM API 入口。

SupaNexus 海外官网：https://supanexus.ai/
开发者控制台：https://console.supanexus.ai/
OpenAI-compatible Base URL：https://api.supanexus.ai/v1

不要在任何文件、命令输出或提交中写入 Token、API Key、密码。不要承诺“不限流不限速”“永久免费”或“绕过供应商限制”。所有时效性模型、价格、限额与活动信息都要先查官方资料，并注明以实时控制台为准。
```
