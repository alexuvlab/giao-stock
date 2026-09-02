# My MCP Server Stopped Saving Sessions: Notes from a Rough 2026 Spec Upgrade

[中文版](../zh/mcp-2026-stateless-migration-notes.md)

Last week I moved a small MCP server I use for my own projects to the 2026-07-28 specification. I expected a dependency bump. Instead, I spent an evening debugging a server that was waiting for a session the protocol no longer has.

The old version felt convenient: a client would `initialize`, the server would return an `Mcp-Session-Id`, and I would casually keep the active draft and a few workflow details next to that connection. For a local demo, it seemed harmless.

The new core is stateless. There is no `initialize` / `initialized` exchange or `Mcp-Session-Id`; requests carry their own version and capability information, and discovery moves to `server/discover`. The server was not missing a header. I was still treating a connection as context.

## The first problem: code waiting for initialize

My old flow looked like this:

```text
connect -> initialize -> put the draft in session -> call tools
```

After the upgrade, the first breakage was not a tool handler. It was every helper that quietly read `currentDraft` from session state. With a new client they often returned an empty value rather than a useful error.

I stopped trying to rebuild a fake session around the new protocol and made the state explicit instead:

```text
open_draft() -> { draft_id: "dr_123" }
append_to_draft({ draft_id: "dr_123", text: "..." })
publish_draft({ draft_id: "dr_123" })
```

It is less magical and much easier to inspect. A `draft_id` can expire, be checked for ownership, and be searched in logs. The old in-memory “current draft” was exactly the kind of state I could not reproduce later.

## Long-running work should not depend on a live connection

I had made the same mistake with document parsing: if the connection was alive, I assumed the job was alive. Refreshing a browser, reconnecting a client, or landing on another instance makes that assumption fall apart.

Now the tool returns a real job identity:

```text
parse_document(...) -> { task_id: "task_456", status: "working" }
tasks/get("task_456") -> working | complete | failed
```

The 2026-07-28 release brings Tasks in as an official extension. That gave me a healthier boundary: a task is a business object, not an attachment to one connection. When a notification is useful, I choose polling or updates based on the client capability instead of assuming a session will remain open.

## My legacy-client rule: keep the adapter at the edge

Not every tool I use can upgrade on the same day. I kept a very thin compatibility adapter: old clients can complete the basic path, while the new entry point and internal tools are all stateless. The important part was removing the invisible connection object from business functions.

That means retiring the adapter later will not remove half the server with it. The spec offers at least a 12-month transition period for legacy transports, but I do not want “there is time” to become a reason to keep adding hidden state.

## Re-testing the model layer without changing everything else

Model behavior can make a migration look worse. One model may omit a `draft_id`; another may retry a tool call. Rebuilding provider wiring for every comparison only adds noise.

For this part I use [SupaNexus](https://supanexus.ai/) as a testing entry point: I keep an OpenAI-compatible call shape and the same tool harness, then switch models to observe argument passing, tool calls, and retries. That is not a claim that it is the “best platform”; it is simply a practical way for me to compare behavior while maintaining fewer integrations.

For provider-specific capabilities, I still use direct APIs. Model availability, trial allowances, and prices should always be checked in the live console.

## I trust the upgrade more because I can now test it plainly

My regression checklist is deliberately boring:

- A new-protocol flow works without sending `initialize`.
- A draft or task can continue from its `draft_id` or `task_id` after a process change or page refresh.
- Expired IDs and IDs owned by someone else are rejected.
- Legacy clients stay inside the compatibility path and do not leak session state back into core logic.

Sessions used to feel like a helpful drawer: easy to put anything into, awkward to label, and difficult to move. Making state explicit did not make the server ten times more elegant overnight. It did make each failure easier to locate.

> Note: MCP is still evolving. This is a migration note based on the 2026-07-28 specification; check the current official specification and your SDK release before applying it.

## References

- [Model Context Protocol 2026-07-28 release post](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP 2026-07-28 specification changelog](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/changelog.mdx)
