# I Switched to Qwen, but It Still Said It Was Kimi K3

> 中文版：[我换了 Qwen，它却还说自己是 Kimi K3](../zh/qwen-still-says-kimi-k3.md)

I made a very ordinary mistake while trying a few models in DeepSeek Harness.

I selected Kimi K3 and asked, “What model are you?” It said Kimi K3. Then I switched the model picker to Qwen and asked the same question in the same chat. It still said Kimi K3.

For a while I stared at the configuration. I wondered whether the model switch had failed, whether the API key or base URL was wrong, or whether the model list was stale. Eventually I realised I was testing the wrong thing.

## Remembering the earlier answer does not mean it is still that model

The first turn had already put “I am Kimi K3” into the conversation. After I changed models, that history was still there. A new model can read it and continue with the same answer. That makes self-identification a poor way to verify routing.

I later added one extra instruction: `Please tell me truthfully which model you are.` The answer stopped repeating Kimi K3, which was reassuring at first. But it is still only a clue, not proof that the backend route is correct. A model answers from the context it sees; it is not reading out a backend label I can independently verify.

I now separate the checks:

| What I want to know | What I no longer rely on | What I check instead |
| --- | --- | --- |
| Which model handled this request | Asking the model who it is | The selected model, provider request records, or gateway logs |
| Whether old context is steering the reply | One self-identification answer | A clean new chat with the same small prompt |
| Whether a configuration change took effect | Behaviour in an old chat | The first request in a new chat after the change |

## What I do now

After switching models, I open a new chat and send a short repeatable prompt. I am not trying to make it name itself. I am looking for the model field in a request record, or confirmation that the gateway actually routed the request to the intended model.

When I use [SupaNexus](https://supanexus.ai/) for this kind of comparison, the practical benefit is that I can switch models behind the same OpenAI-compatible integration instead of rewriting the client setup for every test. That does not make “what model are you?” a reliable check, though. Routing and chat content are different layers.

It feels obvious in retrospect: the model picker is right there. But after a chat has gone on for a few turns, it is easy to trust the sentence it just gave you and forget that the sentence is also part of the context.

The next time a model feels suspiciously like the one I just replaced, I will open a fresh chat first and then check where the request actually went. “What model are you?” is a conversation starter now, not evidence.
