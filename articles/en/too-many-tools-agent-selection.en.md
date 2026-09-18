# Too Many Tools, and the Agent Starts Picking at Random.

> 中文版：[工具一多，Agent 就开始乱选](../zh/too-many-tools-agent-selection.md)

I hit an annoying problem in a small tool-calling workflow recently.

Same prompt, same model. A couple of days earlier it picked the right tool without much fuss. Then it started hesitating between operations with similar names. Sometimes it would fetch the right data, then call a nearly identical tool that did something slightly different. The output still looked plausible, so I first blamed the model.

It was less mysterious than that. I had shown it too many tools.

## A large API is fine. Showing all of it at once is not.

Once an API gets bigger, it is tempting to expose everything. Each operation has a schema; the model should be able to choose, and it saves writing a routing layer.

Real lists are not as tidy as a demo, though. There is `search_user`, `find_user`, and `get_user`, then several update, archive, and export operations with different permissions. Before the model can answer the task, it has to guess which of several similar descriptions deserves attention. Nothing is wrong with the tools, and the model has not suddenly become worse. Its workbench is just crowded.

The MCP tools specification allows a server's tool list to vary with authorization and to change over time; it does not require a client to put an entire capability catalog in front of the model. The [official tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) also notes that stable ordering helps client and prompt caching.

## I let it see a directory before the tools

My fix is not elaborate.

I keep a small card for each group of API operations: which service it belongs to, what it does, whether it reads or writes, and whether it carries risk. The model first uses those cards to narrow the current task to a few candidates. Only then do I give it the tools with their full parameter schemas.

It sounds like one extra layer, but debugging became much easier. If the tool is wrong, I check the candidate selection. If the arguments are wrong, I check the tool schema. Those are no longer the same problem.

I am stricter with writes. A lookup can have three or four candidates. For creating, changing, or deleting something, I usually expose one clear option and keep a confirmation step. A model should not get ten ways to try a write just because it saw ten endpoints.

## A shared model entry point is a different boundary

I use [SupaNexus](https://supanexus.ai/) as a testing entry point for different OpenAI-compatible models, which means less model-integration code changes during a comparison. That solves “which model am I trying?” It does not solve “which tools should the model see on this turn?”

Keeping those boundaries separate makes a test more honest. When I swap a model, the candidate tool set stays fixed. When I change the tool directory, the model endpoint stays fixed. If a model suddenly looks worse, I do not have to blame it immediately.

## What I removed was noise, not capability

I did not remove API features. I stopped making them all compete for attention in the same call. When it needs something, the model can still search and then receive the right tool; it just does not start every task by reading the whole manual.

Now, when tool calling gets worse, I start with a plain question: did it really need to see this much?

Most of the time, the answer is cheaper than switching to a larger model.

---

This is a personal tool-design note, not a performance claim about any model or service. Never put API keys in examples, logs, or repositories.
