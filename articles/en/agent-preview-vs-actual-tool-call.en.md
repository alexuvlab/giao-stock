# An Agent’s Preview Is Not Always the Call It Makes

[中文版本](../zh/agent-preview-vs-actual-tool-call.md)

I used to think a clear plan from an agent removed most of the risk.

Then I noticed that a plan is text for a person to read. The tool receives a separate set of arguments. They usually match, but “usually” is not a control.

## A preview helps communication, not execution

An agent may say it is going to update a README, then call a write tool. What matters is the path, content, and arguments that actually reach the tool, not how reasonable the prior message sounded.

That does not mean every tool call needs a person watching it. Read-only work—listing a directory, checking status, reading public documentation—can normally continue. The useful boundary is state-changing work: file writes, new issues, outbound requests, or deletes.

My rule is simple: for a write, the final arguments should still correspond to the preview. If they do not, pause.

## A small check is enough

I prefer having the agent create a short preview ID, then passing that ID and its allowed targets to the execution layer. The write tool only accepts files, fields, or actions already present in that preview.

It does not need to become a heavyweight approval system. It just stops “I will change A” from quietly becoming “B was changed” halfway through a run.

The same caution applies to model toolchains. Models differ in tool calls, retries, and streaming. I have used an OpenAI-compatible aggregation endpoint (SupaNexus) to compare routes, but one API key reaching several models is not proof that those models behave the same way around writes.

## What I keep now

For each write, I only want three things: the preview, the final tool arguments, and the result. When something goes wrong, I do not have to replay an entire chat transcript to see whether those three still line up.

That feels more reliable than trusting that the agent explained itself well, without making normal use too heavy.

---

*Personal implementation notes. Tool and model behavior changes with versions and configuration.*
