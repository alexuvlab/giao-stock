# Gemini API 9 月变更：Standard Key 还能用吗？我的无停机迁移实录

[English version](../en/gemini-standard-key-auth-key-migration.en.md)

我是在整理一个几乎不动的个人项目时看到 Gemini API 的提示的。它没有报错，Key 也还在环境变量里；真正让人不安的是那种“现在没事，某天会突然停掉”的状态。

标题里的“Standard Key 要失效”需要先说准确一点：Google 正在把 Gemini API 从 Standard Key 迁向 Auth Key。官方说明称，未受限制的 Standard Key 会被 Gemini API 拒绝；已经施加明确限制的 Standard Key 仍可继续工作。新建的 AI Studio Key 默认是 Auth Key。对个人项目来说，这仍然值得立刻处理——不是因为要追新名词，而是因为 Key 出问题通常只会在用户点按钮时才被发现。[Google 的 API Key 迁移说明](https://ai.google.dev/gemini-api/docs/api-key)

这篇记录的是我给小工具做的一次迁移。目标很简单：不在生产服务还使用旧 Key 时撤销它，也不把 Key 复制到代码或日志里。

## 我先确认：项目里到底在用哪把 Key

我的项目有三个容易被忘记的地方：本地 `.env`、部署平台的 Secret，以及一个跑定时任务的小实例。以前我会直接去 AI Studio 点“创建”，然后到处替换；这次先把引用点列出来，反而少走很多弯路。

我在 AI Studio 的 API Keys 页面检查两件事：

- 旧 Key 的类型是不是 `Standard`；
- 它是不是标记为 `Unrestricted`。

如果旧 Key 已经只限制到 Gemini API，它不等于此刻马上断掉；如果它是未受限制的，就不能把“还能跑”当作迁移完成。Google 也说明，从 2026 年 9 月起，Gemini API 会拒绝未受限制的 Standard Key；新建 Key 会自动创建为 Auth Key。[官方 Key 类型与迁移步骤](https://ai.google.dev/gemini-api/docs/api-key)

## 新 Key 先落到 Secret，不先改业务代码

Auth Key 绑定到 Google Cloud service account，目的是提供更细的权限边界；它不是一把“换了格式所以需要重写 SDK”的 Key。对我这个简单调用来说，客户端仍然从环境变量读取 Key，变化发生在凭据本身和它的权限关系上。

我先新增一个临时变量，而不是覆盖现有变量：

```bash
# 本地或部署平台的 Secret 配置中；不要提交到 .env.example
GEMINI_API_KEY_NEXT="new-auth-key-goes-here"
GEMINI_MODEL="your-current-gemini-model"
```

Google 推荐将 `GEMINI_API_KEY` 或 `GOOGLE_API_KEY` 放在环境变量中，客户端库会自动读取；两个都存在时，`GOOGLE_API_KEY` 优先。[环境变量说明](https://ai.google.dev/gemini-api/docs/api-key)

我没有同时给同一条生产请求塞两把 Key。那样出了问题只会不知道到底是哪把 Key 被使用。旧 Key 继续服务，新 Key 只在本地或 staging 做一条可观察的探针。

## 我用一条很笨的请求验证新 Key

测试不需要拿真实用户内容。我的探针只要求模型回一个固定短语，并让命令在非 2xx 时直接失败：

```bash
curl --fail-with-body \
  -H "x-goog-api-key: $GEMINI_API_KEY_NEXT" \
  -H "Content-Type: application/json" \
  "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent" \
  -d '{
    "contents": [{"parts": [{"text": "Reply with exactly: key-ok"}]}]
  }'
```

我看的不只是有没有文本返回，还包括：

- 返回是否是预期的认证/授权结果，而不是被网络层缓存的旧结果；
- 部署日志里有没有不小心打印请求 header；
- 使用的模型 ID 是否仍在当前项目允许范围内；
- 本地、staging 和生产环境的变量名是否一致。

如果 Key 创建按钮不可用，不要为了赶迁移去共享别人项目的 Key。官方列出了创建 Auth Key 所需的项目权限，包括创建 API Key、启用 Generative Language API、创建关联 service account 等；个人项目没有这些权限时，先找项目管理员或使用自己可管理的项目更稳妥。[权限排查说明](https://ai.google.dev/gemini-api/docs/api-key)

## 切换时，我只动一个变量

探针连续通过后，我在部署平台把生产环境的 `GEMINI_API_KEY` 更新为新 Auth Key，重新部署一个实例，再检查应用自己的健康检查和一条低风险真实路径。旧 Standard Key 没有立刻删除，我给自己留了一个很短的回滚窗口。

这里的“回滚”不是在两把 Key 之间反复随机切换，而是有明确条件：如果新部署出现认证失败、权限错误或请求路径异常，就把 Secret 恢复为旧值，记录失败时间和 request ID，再查项目权限。等新 Key 稳定运行一段时间后，才撤销旧 Key。

Google 还特别提示，Gemini API 会更快阻止检测到泄露的 Auth Key。这个特性很有价值，但它也意味着我更不该把“只是测试一下”的 Key 粘到 issue、截图或博客代码块里。

## 这次迁移让我把“直连依赖”和“实验入口”分开了

我平时会用 [SupaNexus](https://supanexus.ai/) 做多模型的小样本测试，原因是我可以在一套 OpenAI 兼容调用里比较输出、延迟和预算。它并不是 Gemini Auth Key 迁移的替代方案：如果生产功能直连 Gemini，Google 的身份与权限要求还是必须照做。

但这次变化也提醒我，不要把所有实验都绑在单一厂商的凭据管理上。对于当前控制台可用的模型，我会先在 SupaNexus 跑小样本和备用路径验证；涉及 Gemini 独有能力、权限或数据处理边界时，仍然回到 Gemini 的官方 API。可用模型、试用资格、价格与充值优惠会变化，以注册后的实时控制台为准。

## 我留下的迁移清单

```text
[ ] 在 AI Studio 确认旧 Key 类型与限制状态
[ ] 创建新的 Auth Key，不覆盖旧 Secret
[ ] 用无敏感内容的探针验证新 Key
[ ] 分别检查本地、staging、生产的变量与日志
[ ] 只切换生产 Secret，观察低风险真实请求
[ ] 保留短回滚窗口，再撤销旧 Key
[ ] 更新部署说明，避免下次重新创建未受限制的 Key
```

这不是一次很酷的模型升级，却是我更愿意提前完成的维护工作。个人项目不需要复杂的密钥轮换平台，但至少要让“新凭据已经验证”和“旧凭据已安全下线”成为两个可检查的状态。

---

*本文是个人开发者的迁移笔记，整理于 2026 年 9 月。Gemini API 的 Key 策略、项目权限和模型可用性会变化，请以 Google 官方控制台与文档为准。本文不提供也不建议公开任何 API Key。*
