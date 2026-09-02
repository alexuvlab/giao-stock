# DeepSeek Harness in Practice: From Demo to Controlled Cost

[中文版](../zh/deepseek-harness-demo-to-controlled-cost.md)

> This is not a “connect an agent and everything is solved” tutorial. It is a personal note on turning a DeepSeek Harness demo into something I can keep using: task scope expands, model calls get longer, and bills become hard to explain unless I design for those problems.

For an individual developer, the appeal of a harness is that it can connect a model, files, terminal commands, and MCP tools into an execution loop. The risk is the same: an apparently small request can become dozens of tool calls and far more tokens than expected. This is the workflow I currently use.

## Treat the Harness as a Bounded Executor

My first demo task is never “refactor the whole project.” It is a small job with a clear acceptance condition, such as:

- Add unit tests for one function;
- Trace an API error and propose the smallest fix;
- Write usage notes for one MCP tool;
- Extract repeated logic into one module.

This conservative start lets me measure four things: whether the model understands the repository, whether tool calls are reliable, how many turns the task takes, and whether the cost is acceptable. Only after I have those notes do I widen the scope.

DeepSeek currently offers OpenAI- and Anthropic-compatible APIs, with integration guides for agent tools such as Claude Code and OpenCode. Its documentation also makes clear that third-party agents are provided for reference and are not guaranteed for effectiveness or security. I treat a harness as an engineering component that needs validation—not an automatic delivery system. [DeepSeek API docs](https://api-docs.deepseek.com/quick_start/pricing-details-cny/) · [Agent integration guide](https://api-docs.deepseek.com/guides/coding_agents)

## The Demo Stage: Keep a Minimal Scorecard

For each experiment, I track five things instead of only asking whether code was generated:

| What I record | Why it matters |
|---|---|
| Task and acceptance criteria | Keeps the agent from silently expanding the goal |
| Model and mode | Separates high-quality reasoning from economical execution |
| Tool-call turns | Repeated file reads, searches, and retries often hide the real cost |
| Input / output tokens | Shows whether context or generation length drives the spend |
| Result after human review | Prevents “it runs” from being mistaken for “it is ready to merge” |

For example, if a “write tests for an endpoint” demo produces runnable tests in the first turn, I stop and review there. I do not immediately add “also refactor it, write docs, and change CI.” Splitting a large request into small, verifiable turns is usually less expensive than giving a model unlimited freedom.

## Six Guardrails That Made the Workflow Controllable

### 1. Define completion criteria for every task

I state the allowed file scope, commands, test command, and stop condition in the prompt. For example: “Only modify `src/auth`; run the specified tests when done; if a public interface must change, explain why and stop.” This reduces irrelevant context and leaves scope changes for a human decision.

### 2. Reserve expensive reasoning for critical steps

Not every step needs the strongest reasoning mode. I usually use a stronger model for planning, difficult debugging, and final review; a faster or more economical model can locate files, make simple changes, and handle sub-tasks. DeepSeek's agent examples likewise distinguish a primary model from a sub-agent model; the correct choice depends on current model capabilities and pricing. [Claude Code integration example](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/)

### 3. Bound context instead of endlessly appending history

A long context does not automatically produce a better completion rate. I let the harness read only necessary files, generate a short checkpoint summary at the end of a stage, and avoid repeatedly carrying build logs, full dependency trees, or unrelated conversation into later turns. For a personal project, small and precise context is easier to review.

### 4. Limit tool permissions and retry attempts

Expose only the commands and MCP tools the current task needs. Keep confirmation for network requests, configuration writes, or deletions, and set a maximum number of tool calls plus a clear stop condition after failures. This is not only about tokens; it keeps automation from expanding an error.

### 5. Treat 429s, timeouts, and failures as normal paths

A harness should handle rate limits and transient failures instead of assuming every request succeeds. I use exponential backoff, limited concurrency, recoverable task state, and a human or fallback-model path after repeated failures. Infinite retries are not a rate-limit strategy.

### 6. Review one cost metric per week

I start with one actionable number, such as average tokens per successful task or model spend per merged change. If it rises, I investigate whether tasks became larger, context grew, or a tool loop went out of control. That is more useful than watching only total spend.

## My Integration Choice: Direct API or a Unified Entry Point

When I am validating only DeepSeek and the tool needs Anthropic format, I begin with DeepSeek's official compatibility guidance. DeepSeek specifically notes that, in some tools, choosing the OpenAI provider can trigger a 400 error related to `reasoning_content`; protocol adaptation is not a minor implementation detail. [GitHub Copilot CLI integration notes](https://api-docs.deepseek.com/quick_start/agent_integrations/copilot_cli/)

When I want to compare DeepSeek with Qwen, Kimi, GLM, or other models in one project, I use a unified API entry point such as [SupaNexus](https://supanexus.ai/). It provides an OpenAI-compatible endpoint, project-level API keys, and a model catalog, which lets me keep model switching in configuration instead of rewriting provider SDK code in every script.

That does not mean a unified gateway is always better:

- **One model with vendor-specific features:** the direct API is often simpler;
- **Ongoing multi-model comparison or several personal projects:** a unified entry point can reduce maintenance;
- **Either way:** verify live model availability, capabilities, quotas, and pricing before you rely on a path.

SupaNexus currently offers free model trials and registration offers. I use it to validate a small task first, then decide whether to continue based on the models available in the console and my actual usage. Trial eligibility and top-up promotions should be confirmed in the console after registration.

## A Reusable Cost-Control Loop

```text
Break down task → run a narrow demo → record tokens / turns / outcome
       ↓
Human review → choose the right model → set context and tool boundaries
       ↓
Handle limits and failures → review one metric weekly → widen scope carefully
```

This loop does not make an agent “infinitely autonomous.” It does make me more willing to keep it in my daily work: every run has a clear purpose, every cost can be traced, and every model switch has a reason.

## Final Thought: Controlled Cost Is Not Just Choosing the Cheapest Model

The number I actually want to optimize is the total cost of finishing a trustworthy task: failed retries, human rework, and the time spent maintaining multiple integrations all count. A cheap model that drifts repeatedly is not necessarily cheaper than a model that completes a critical step once. Equally, a strong model should not repeatedly read irrelevant files.

Start with a small demo, record real data, retain human review, and keep a switchable integration path. That is a much more useful promise for an individual developer than “fully automated development.”

---

*This is a personal developer's practice note, updated in August 2026. Model capabilities, prices, trial offers, and third-party harness compatibility can change; verify live details in the relevant documentation and console.*
