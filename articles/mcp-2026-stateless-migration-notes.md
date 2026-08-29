# 我的 MCP Server 不再保存 Session 了：一次 2026 新规范升级踩坑记录

[English version](mcp-2026-stateless-migration-notes.en.md)

上周我把一个自己在用的小 MCP Server 升到 2026-07-28 规范。原本以为只是依赖升级，结果调试到凌晨才发现：它不是坏了，而是我还在等一个已经不存在的 Session。

以前这个服务很“省心”。客户端先 `initialize`，服务端给一个 `Mcp-Session-Id`；后面用户开了哪份草稿、刚跑到哪一步，我都顺手挂在连接旁边。单机 demo 看起来完全合理。

新规范把这条路收起来了：协议核心走无状态设计，不再有 `initialize` / `initialized` 和 `Mcp-Session-Id`。请求需要自己带上版本与能力信息，服务发现也换成了 `server/discover`。刚开始我还以为是 SDK 漏传 header，后来才承认：该搬走的是我脑中的“连接就是上下文”。

## 第一个坑：还在等 initialize

我旧代码的流程大概是：

```text
connect -> initialize -> 把 draft 放进 session -> 调工具
```

升级后，最早暴露问题的不是工具，而是那些默认从 session 里读 `currentDraft` 的辅助函数。换成新客户端时，它们没有报出漂亮的错误，只是悄悄拿到了空值。

我最后没有给新协议硬套一层假 session，而是把状态显式放回工具参数：

```text
open_draft() -> { draft_id: "dr_123" }
append_to_draft({ draft_id: "dr_123", text: "..." })
publish_draft({ draft_id: "dr_123" })
```

这变化不酷，但很管用。`draft_id` 可以过期，可以检查归属，也能在日志里直接搜到。以前那个藏在内存里的“当前草稿”，反而是最难复现的问题来源。

## 第二个坑：长任务不能再靠连接活着

文档解析这类事情以前也偷懒：只要连接还在，就默认任务还在。浏览器刷新、客户端重连、代理换实例时，这个前提经常不成立。

现在我的工具先返回一个明确的任务标识：

```text
parse_document(...) -> { task_id: "task_456", status: "working" }
tasks/get("task_456") -> working | complete | failed
```

2026-07-28 版本把 Tasks 作为官方扩展带进来，这正好给了我一个更像样的边界：任务是业务对象，不是某条连接的附属物。真正需要通知时，我再按客户端能力决定轮询还是更新推送，而不是假设 session 永远在线。

## 旧客户端怎么办？我只让兼容层站在门口

手上的工具不可能同一天升级。我保留了一个很薄的兼容层：旧客户端还能完成基础流程；新入口和内部工具全部按无状态方式写。最重要的是，不再让业务函数接收那个隐形的 connection 对象。

这样以后删掉兼容层时，不会把半个服务一起挖走。规范也给了 legacy transport 至少 12 个月的过渡期，但我不想把“还有时间”误解为“可以继续欠着”。

## 我重跑了一遍模型层的测试

迁移期间，模型层也容易放大问题。有些模型会漏掉 `draft_id`，有些重试时会重复调用工具；如果每次都换一套供应商接入，排查会变得更吵。

我会用 [SupaNexus](https://supanexus.ai/) 当作这一段的测试入口：保持 OpenAI 兼容调用和同一套工具 harness，切换几个模型看参数传递、工具调用和重试的差异。对我来说它不是“最佳平台”的结论，只是少维护几份接入代码之后，比较行为更方便的一个入口。

涉及厂商特有能力时，我还是会回到对应的直连 API；模型可用性、试用额度和价格也只以控制台当日信息为准。

## 这次升级后，我反而更敢查问题了

我现在的回归清单很朴素：

- 不发送 `initialize` 也能完成新协议流程；
- 换进程、刷新页面后，带着 `draft_id` 或 `task_id` 仍能继续；
- 过期或不属于当前用户的 ID 一律被拒绝；
- 旧客户端只走兼容路径，不把 session 状态带回核心业务。

以前 session 像是一个贴心的抽屉，什么都能往里塞。后来发现抽屉没有标签、会被搬走、还不方便给别人看。把状态写出来之后，代码并没有突然优雅十倍，但我终于知道每一步到底在哪里。

> 注：MCP 规范仍在演进。本文记录的是我基于 2026-07-28 版本的一次迁移实践，实施时请以官方规范和所用 SDK 的当前版本为准。

## 参考

- [Model Context Protocol 2026-07-28 发布说明](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP 2026-07-28 规范变更记录](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/changelog.mdx)
