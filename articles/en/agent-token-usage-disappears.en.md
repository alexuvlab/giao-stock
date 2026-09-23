# Where Did the Tokens Go While My Agent Was Running?

> 中文版：[Agent 跑着跑着，Token 怎么就没了？](../zh/agent-token-usage-disappears.md)

I was looking at one agent run the other day. It had not produced anything useful and had not finished the task, but the usage had moved far more than I expected.

My first thought was that the model was overthinking. After opening the logs, it was less mysterious: sometimes tool arguments kept generating; sometimes a failed step was retried by more than one layer; sometimes every new step carried a large block of history that had stopped being useful.

This is not a list of token-saving tricks. It is the short list I now check when an agent seems to burn through usage without much to show for it.

## A cheaper model is not the first answer

Token price answers one question: what each token costs. It does not answer whether a request actually stopped when it should have.

A recent DeepSeek Harness report describes a local compatible model that went off course while generating a tool argument. The argument streamed until the full output budget was gone, and the UI eventually showed only a generic `Output token limit reached` error. The model may have caused the bad generation, but bounding and labelling an abnormal tool argument earlier would at least make the spend visible. [Discussion](https://github.com/deepseek-ai/deepseek-harness/discussions/6059)

I now split a run into four things instead of reading only the final answer:

| Check | What I am looking for |
| --- | --- |
| Output | Is the answer long, or are tool arguments/reasoning failing to stop? |
| Retries | Is the SDK, queue, and agent all retrying the same work? |
| Context | Is every step carrying old logs, results, and finished topics? |
| Accounting | Does the usage view include failed attempts and compaction calls? |

That last question is easy to miss. Another Harness discussion notes that failed retries or context-compaction requests can be absent from session accounting if their events are not folded correctly. [Discussion](https://github.com/deepseek-ai/deepseek-harness/discussions/2426)

## Three brakes I leave on

**Tool calls get limits too.** I used to put a cap only on the final response. Now a tool argument, one tool result, and the number of tool turns each have their own ceiling. I do not want malformed JSON or a huge file result quietly consuming the rest of a run.

**One layer owns retries.** This is unglamorous but useful. When a request fails, I choose one owner: the SDK, queue, or agent. If all three helpfully retry, one failure can turn into several requests.

**Finished context gets packed away.** I do not keep sending complete logs, every tool result, and the previous topic forever. If a small summary is enough, I send that. A cache hit can make repeated context cheaper, but context that is no longer sent costs nothing.

## One useful log line

For a small personal project, I do not need a full billing system on day one. I leave myself something like this after each task:

```text
task=import-notes
model=...
attempts=2
tool_calls=5
input_tokens=...
output_tokens=...
result=failed_before_write
```

The next time usage looks strange, I can tell whether a model changed, a task grew, or failed work kept running. That is more actionable than one total number on an invoice.

## How I compare models

When I need to isolate model behavior, I keep the task, tool list, and context fixed and run a small non-critical sample with another model. An OpenAI-compatible entry point such as [SupaNexus](https://supanexus.ai/) is convenient for this because I do not have to keep rewriting client wiring just to compare completion rate, tool turns, and usage.

It does not control the agent or prove that any model is the cheapest. The useful separation is between “is this model expensive?” and “why did this task run for extra turns?”

The number I care about now is not just tokens per call. It is whether those tokens bought a result I can actually trust.
