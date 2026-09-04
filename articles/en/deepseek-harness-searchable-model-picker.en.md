# Too Many Models in DeepSeek Harness? Why I Started With a Searchable Model Picker

[中文版](../zh/deepseek-harness-searchable-model-picker.md)

The thing slowing me down in DeepSeek Harness lately has not been the model response. It has been choosing the model.

Once the list gets long, the friction becomes surprisingly ordinary: what was the model I used for code changes last time? Which ones can take an image? Are those two similarly named versions from the same provider actually different? I do not want to keep scanning a dropdown from memory, and I definitely do not want to open a console every time I want to try an alternative.

That is why I noticed the newly open-sourced [`dsh-plugin-chat-enhance`](https://github.com/supanexus/dsh-plugin-chat-enhance) from the SupaNexus team. It is not another chat shell and it is not trying to replace DeepSeek Harness. It makes the small part I touch every day—choosing a model and attaching an image—a little less awkward.

This is an installation-planning note for my own workflow, based on the repository's current `v0.3.0` README and public implementation notes. It is not a benchmark, and I am not going to pretend it has already been running in production for months.

## I do not want to memorize model names

For a personal project, model choice is rarely just “use the strongest one.”

I keep cheaper models for drafting, text cleanup, and repetitive tasks. I switch when I need steadier reasoning or code work. Sometimes I first need to know whether an image belongs in the request at all. The problem is not a lack of options. It is that the cost of switching quietly becomes high enough that I stop comparing.

The plugin addresses a few small but frequent actions:

- search the model selector by name;
- filter by provider instead of hunting through one long list;
- expose recently used models as quick choices;
- label models that declare image-input support;
- add an image-upload entry point beside the composer.

None of that makes a model smarter. It does make choosing a model for the task feel more like a two-second action.

## I would install it on the Web profile first

The repository provides a straightforward installation command:

```bash
dsh plugin --profile web add github:supanexus/dsh-plugin-chat-enhance#v0.3.0
```

After installation, dsh web or Desktop Host needs a **full restart**, then the tokenized `?token=` address printed at startup should be opened again. That is worth noting: with plugins, “I installed it but nothing appeared” is often an old web page still running, not a broken feature.

Before installing, I usually note one model and one simple conversation that already work. After the restart, I would verify only three things: the picker can search, recent models appear, and the normal send path is unchanged. Establish the basic path before testing image uploads or filters; it makes the later debugging much less noisy.

## A switching habit that fits a personal project

I do not treat a model list as a leaderboard. I prefer to keep three routes for common work:

| Situation | What I check first | Selection action |
| --- | --- | --- |
| Drafting and organizing material | Cost, speed, context size | Switch from a recent model |
| Editing code or investigating a bug | Code performance, tool-call reliability | Search for a specific model |
| Screenshots, charts, or UI issues | Explicit image-input support | Turn on the image-only filter |

That is why the combination of search and recents makes sense to me. Search is for a model I only use occasionally; recents preserve the few work options I have already verified. It stops every choice from competing for the same bit of memory.

The plugin's default `maxRecent` is `4`, and it can be changed in configuration or plugin settings:

```yaml
config:
  maxRecent: 4
```

Four is enough for me. Too many shortcuts just recreate the same question: which one should I click?

## An image label is not a magic switch

There is one detail I appreciate here: the plugin does not pretend every model can accept an image.

Its README says model search and switching do not depend on SupaNexus Core. Image labels and uploads, however, require the selected model to have declared image-input support. Without that declaration, those parts stay unavailable instead of accepting an image and making the user guess why the request failed.

That matches how I want to work: first ask whether the request path has the capability, then decide whether an image belongs on it.

I use [SupaNexus](https://supanexus.ai/) as one entry point for small multi-model experiments, mainly because it lets me compare a few samples through a compatible calling pattern. It is not a prerequisite for this plugin, and it does not mean every model automatically supports images. Available models, capability labels, trials, and pricing should be checked in the live console after sign-in. For sensitive images, I would also confirm that I accept the handling boundary of the selected model and service before uploading anything.

## My first check would use a low-risk example

I would not test a new plugin with a client screenshot or a project directory containing secrets.

A better first pass is a new test conversation, one public UI screenshot, and a model clearly labelled for image input. Ask it for three interface issues. Then switch to a non-image model and confirm that the UI does not mistakenly offer the upload path.

That checks three things at once: whether filtering is accurate, whether an image joins the draft correctly, and whether the boundary is clear when the capability is absent. Discovering any of those problems there is much cheaper than finding them inside real work.

## Why a small plugin is worth trying

DeepSeek Harness already handles the basic conversation and workflow layer. After using it for a while, the friction is often not one dramatic missing feature. It is the repeated small moves: finding a model, remembering the version I used last time, and checking whether it can see an image.

`dsh-plugin-chat-enhance` has a restrained goal: reduce that back-and-forth. I find that more useful than another abstraction that chooses everything for me. I still choose the model; the interface simply asks me to remember less.

If you regularly switch models in DeepSeek Harness, start with the installation notes in [`supanexus/dsh-plugin-chat-enhance`](https://github.com/supanexus/dsh-plugin-chat-enhance). My next step is to run a public-example check; once I have a real usage log, I can add which filters and image capabilities were most useful in my own environment.

---

*This is a personal developer's workflow note, written in September 2026. Plugin versions, model capabilities, and availability can change; verify them in the project README and your current console. Do not commit API keys, private images, or sensitive project files to repositories, logs, or public discussions.*
