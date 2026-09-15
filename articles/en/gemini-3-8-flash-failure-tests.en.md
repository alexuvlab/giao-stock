# Before I Switched to Gemini 3.8 Flash, I Made It Fail on Purpose

> 中文版：[换上 Gemini 3.8 Flash 前，我先故意让它失败了](../zh/gemini-3-8-flash-failure-tests.md)

When Gemini 3.8 Flash became generally available, my first thought was not to replace the model name in a project.

I have made that mistake before. A new model looked great in a chat window, then changed the shape of a tool argument on the third step of a real workflow. It was not completely broken, which made it worse: most requests passed, and the odd path only showed up when a user happened to hit it.

So this time I started with something slightly backwards. I gave it a few tasks that I expected to go wrong.

Google listed Gemini 3.8 Flash as GA in early September, with long-running software engineering and agent workflows among its intended uses. That makes it interesting; it does not automatically make it safe to migrate. The release information is in the [official changelog](https://ai.google.dev/gemini-api/docs/changelog). What follows is just how I regression-test a small project.

## A tool description with one missing detail

I do not start with a hard reasoning puzzle. I give the model an ordinary tool — create a draft, save a note, look up a record — and leave out one field description that seems minor.

I want to see whether it asks, or quietly makes something up. I also want the server to reject a bad value clearly. A better model is not a reason to soften server-side validation.

I keep the request next to the final tool arguments. Not for a polished benchmark, but so that the next model, prompt, or SDK update gives me a place to look when a behavior changes.

## A failure near the end of a run

This is an easy one to skip in a personal project. Two tools succeed, then the third one hits a timeout, a rate limit, or stale data.

The useful question is not whether the model explains the error nicely. It is whether the workflow treats completed work as unfinished, writes the same thing twice, or leaves the next retry in a strange state.

For write actions I now use idempotency keys and record “done” separately from “safe to retry.” During a test I interrupt the third step on purpose, then rerun the same input.

## Context that is just a little annoying

This is not a long-context leaderboard test. I add the things a real project accumulates: a short chat history, the previous tool result, two user constraints, and one paragraph that is not very relevant to the current task.

Some models look excellent on a clean example, then latch on to the last loud sentence once the context gets busy. For a small product, that can cost more than an awkward answer: it can mean an unnecessary tool call or another manual check.

I only track two things here: did it still choose the right tool, and did it mistake an old tool result for current state? That is enough to catch most of the trouble I care about.

## I do not tie the test setup to one provider

The Gemini run uses its official API. But I do not want to rewrite a call path and its logs every time I compare another model.

I keep the application layer on a stable interface and swap the endpoint underneath. I use [SupaNexus](https://supanexus.ai/) as an entry point for trying other OpenAI-compatible models against the same failure cases; it is not a replacement for Gemini. The useful part for me is that the test cases, timeout handling, and server checks stay where they are while the model changes.

That also makes one uncomfortable truth easier to see: a model can win two of these tests and still not be worth moving into production today. A migration is not a chat demo. It has to keep the old workflow intact.

## I am leaving the default alone for now

If all three tests pass, I will watch a small amount of non-critical traffic for a few days. If any one of them exposes a new tool-argument, retry, or context problem, the model can stay in the experimental configuration.

New models are good news. I just prefer making one fail before asking a real user to find the failure for me.

---

This is a personal testing note, not a performance claim about any model or service. Never put API keys in examples, logs, or repositories.
