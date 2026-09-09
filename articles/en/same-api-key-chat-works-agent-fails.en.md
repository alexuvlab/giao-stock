# Same API Key, Why Does Chat Work but the Agent Does Not?

[中文版本](../zh/same-api-key-chat-works-agent-fails.md)

While wiring a local tool to a model recently, I did the smallest possible check first: add an API key, send “hello,” get a reply. It was tempting to call that integration done.

Then I tried the same setup with an agent. It stalled around model discovery, streaming, or the first tool call. A working chat box only proves the shortest path works. An agent takes a different path.

This is not unique to one provider. Once a tool depends on model discovery, request formats, streaming events, and tool calls, “chat works” stops being a useful acceptance test by itself.

## Don’t start by rotating the key

My first instinct was to try another key. That usually just makes the debugging trail messier.

I now separate the checks:

1. Can the client fetch a model list?
2. Is the selected ID actually a chat model?
3. Does a normal, non-streaming chat complete?
4. Does streaming stay alive to the end?
5. Does this model support the tool-call shape the client expects?

The first two failures often look like a configured UI with no usable model. The latter failures can leave chat looking fine until the agent actually tries to do something.

## The model list matters

An OpenAI-compatible endpoint may accept a chat request while still not behaving the way a client expects when it discovers models. Clients often read `/models`, then use those IDs for capability decisions, selectors, or routing.

That is why I treat “the expected model ID is visible” as its own check. I do not guess an ID from a marketing name, and I do not drop a reasoning, image, or embedding model into a chat setting just because the names look related.

## Agents carry more assumptions than chat

A plain chat request mainly sends messages and reads text back. An agent has to handle tool definitions, arguments, results, another turn of context, and often streaming events too.

Tool calling is where this gets confusing. A model can emit text that resembles JSON, while the client is waiting for a structured tool-call field. The chat window may look completely healthy in the first case; the agent cannot continue in the second.

I start with a small read-only tool, such as listing a directory or reading a tiny collection. I do not begin with file writes, outbound requests, or data changes. A failure is much easier to locate when the test has a narrow permission boundary.

## One endpoint does not make every model equivalent

During this debugging, I used an OpenAI-compatible aggregation endpoint (SupaNexus) to switch models for comparison. That helped separate “the endpoint is unreachable” from “this model is not a fit for this agent path.” It did not remove the need to check compatibility.

Models available under one API key can still differ widely in tool calls, context limits, streaming behavior, and rate limits. For a personal project, keeping model IDs and capability assumptions in one configuration layer is far easier to maintain than scattering them through application code.

## What I now count as connected

I no longer stop after one successful chat reply. My short checklist is:

- The target ID appears in the model list.
- Normal and streaming chat both complete.
- A read-only tool call returns a usable result.
- Logs distinguish authentication, rate limits, model capability, and argument-format failures.
- The key never appears in a repository, screenshot, or debug log.

None of this is glamorous. It is simply faster than repeatedly changing configuration after an agent that “should work” refuses to move. Integration is complete when the tool chain finishes one expected run, not when the first greeting comes back.

---

*Personal implementation notes only; this is not a compatibility guarantee for any service or model. Behaviour varies by client, model version, and configuration.*
