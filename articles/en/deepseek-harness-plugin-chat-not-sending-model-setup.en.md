# DeepSeek Harness Plugin Installed, but Chat Still Wouldn’t Send: My Model Setup Debugging Notes

[中文版](../zh/deepseek-harness-plugin-chat-not-sending-model-setup.md)

I expected this to be quick.

Start DeepSeek Harness, add a model-picker plugin, open the web UI, and try a few models. The plugin did install. DSH did boot. Yet the first page was very honest: the composer could not send, and there was no useful model list to choose from.

The plugin was not broken. I had treated “the plugin is installed” and “this environment can call a model” as the same thing.

This is my installation-and-debugging note. It is not a tutorial for pasting keys around, and it does not assume every OpenAI-compatible service works after one copied URL.

## What does a successful plugin install actually mean?

I installed [`dsh-plugin-chat-enhance`](https://github.com/supanexus/dsh-plugin-chat-enhance), maintained by the SupaNexus team. It adds a few UI details I wanted in DeepSeek Harness: model search, recent-model chips, image-capability labels, and image upload in the composer.

The installation command itself is short:

```bash
dsh plugin --profile web add github:supanexus/dsh-plugin-chat-enhance#v0.3.0
```

Afterward, I checked DSH's composed configuration and confirmed that the plugin was loaded in the Web profile:

```yaml
id: supanexus-chat-enhance
name: '@supanexus/dsh-plugin-chat-enhance'
config:
  maxRecent: 4
```

That rules out “the plugin did not install.” It only proves that a UI extension has joined DSH. It does not mean a model provider already has credentials, available models, and the right API address.

That distinction matters. A model picker can make a long list easier to use; it cannot create an API key for me or infer what a gateway is allowed to serve.

## First blocker: the first run had no model credentials

DSH's first-run screen asks for an API key. The default screen presents the official DeepSeek provider; without a usable key saved there, the application can open but it cannot send a message to a model.

I did not paste a key into a terminal command, a project `.env`, a screenshot, or this post. The safer route is **Settings → Models**, where DSH can keep the credential in its own local configuration.

I kept one simple rule in front of me:

```text
Plugin repositories may be public
Model names may be public
Base URLs are usually public
API keys never belong in code, logs, screenshots, or GitHub
```

That sounds obvious, but the first time I just want to see a UI work is exactly when a test key is easiest to paste somewhere careless.

## Second blocker: plugin, provider, and model catalog are three layers

Once I separated the interface into three layers, the debugging became much less chaotic:

| Layer | What it owns | What a failure looks like |
| --- | --- | --- |
| DSH plugin | Search, recents, image labels, upload UI | The controls do not appear |
| Model provider | Protocol, base URL, API key | Models cannot load or calls fail authentication |
| Model catalog | Which models appear in the picker | The picker is empty, or a model ID must be entered manually |

My earlier mistake was seeing a working plugin screen and assuming the lower two layers were ready too. They are not substitutes for one another.

The `dsh-plugin-chat-enhance` README is clear about this. Model search and switching do not depend on SupaNexus Core. Image labels and uploads do require the selected model to explicitly declare image-input support. The UI does not quietly turn “I can upload a file” into “the model will definitely understand this image.”

## Third blocker: a disabled composer is not always a model error

Another state that was easy to misread was a composer that could not send at all. The page was asking me to select a workspace first.

That is separate from whether an API key is valid. The DSH Web UI needs a session workspace before the composer becomes usable; model configuration determines whether it receives an answer after a message is sent.

I no longer look only at the API when I see “cannot send”:

```text
[ ] Is a workspace selected?
[ ] Is a test session open?
[ ] Has a model-provider credential been saved?
[ ] Do the provider protocol and base URL match?
[ ] Is a model in the catalog, or is there a known model ID to use?
```

That order separates an interface-state problem from a network or authentication problem. It is much more useful than repeatedly reinstalling a plugin.

## For an OpenAI-compatible provider, I check three things first

DSH's “add custom provider” form asks for a provider ID, display name, API address, protocol, and API key. For compatible APIs, the UI offers `openai-completions`, `openai-responses`, and `anthropic-messages`; those are not interchangeable choices.

Before saving anything, I check the provider's own console or API documentation for:

1. whether the base URL already includes `/v1`;
2. whether the endpoint implements Chat Completions or Responses;
3. whether the model catalog can be fetched or needs model IDs added manually.

I treat [SupaNexus](https://supanexus.ai/) as one option in this custom-provider path because I use it for small OpenAI-compatible, multi-model experiments. It is not a requirement for the DSH plugin. The actual base URL, available models, image capability, trial status, and pricing should be verified in the signed-in console.

## What I ended up with was not a secret config, but a debugging order

There was no dramatic bug this time. The plugin installed correctly. What was missing was the model configuration needed to run a session, plus a selected workspace.

The next time I add a DSH plugin, I will do a minimal check before comparing models:

```text
1. Install the plugin and restart DSH Web
2. Confirm that it appears in settings or configuration
3. Select a workspace and create a test session
4. Save one working provider in settings
5. Verify one call with a short, non-sensitive message
6. Only then test search, recents, and image upload
```

It is not a glamorous sequence, but it tells me which layer is actually not ready.

---

*This is a personal developer's installation and debugging note, written in September 2026. DeepSeek Harness and community plugins are evolving quickly; commands, UI, and model configuration may change. Verify details in the [official DeepSeek Harness repository](https://github.com/deepseek-ai/deepseek-harness) and the relevant plugin README. Never publish an API key.*
