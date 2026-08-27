# I Stopped Picking Models by Vibe: A/B Testing Multiple Models with One API Key

[中文版](one-api-key-multi-model-ab-testing.md)

When I used to switch models for a small blog tool, I did it casually: one answer looked good, so I changed the model name; a few days later, one bad response sent me back. I could never explain which model actually fit my use case. I just “felt like” I preferred one of them.

Eventually I gave myself a small rule: I would not choose a model from one prompt anymore. Every time I considered a change, I would run the same handful of real tasks and look at the outputs side by side.

This is not a leaderboard, and it will not tell you which model is best. It is simply the lightweight way I now A/B test models for a personal blog and a few small tools.

## I Started with 12 Real Questions

I did not go looking for a public benchmark. My tool mostly creates Chinese technical-article summaries, rewrites FAQ copy, and explains small pieces of code, so my test set came from those actual jobs:

- Three technical articles of different lengths, asking for a homepage-ready summary;
- Two awkward product descriptions, asking for a more natural rewrite;
- Two API errors, asking for debugging steps;
- Two TypeScript snippets, asking for a logic explanation and possible issues;
- A set of mixed Chinese and English titles and tags, asking for a consistent format.

After removing personal information, access tokens, and unpublished material, I saved the cases in a small JSONL file. It is not a large dataset, but it reflects the work I really do. Evaluation guidance makes the same point: an eval set should resemble the real workflow, not merely optimize for a generic benchmark score. [Evaluation best practices](https://developer-openai-com.sitemirror.store/api/docs/guides/evaluation-best-practices/)

## The First Run Taught Me That Longer Is Not Better

I held the system prompt, input, `max_tokens`, and temperature steady, and changed only `model`. Then I saved the outputs, hid the model names, and read them later.

I recorded only four things for each result:

| What I checked | How I judged it |
|---|---|
| Did it finish the task? | Did it miss a requirement, and can I use the format directly? |
| Factual and code risk | Did it invent API behavior or misread the code? |
| Editing cost | How much do I need to change before publishing or using it? |
| Speed and usage | Does the wait harm the experience, and is token use unexpectedly high? |

The first counterintuitive result: one model wrote very complete answers, but I had to cut half of each blog summary. Another wrote less, but I could almost publish it untouched. For my case, the second model was the better deal—not because it was “stronger,” but because it created less rework.

## Keep the Prompt and Configuration Still

This part is boring, but it stopped me from fooling myself. I used to change the model and casually edit the prompt in the same session, which made it impossible to know what improved the result.

Now I keep a comparison call close to this:

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.supanexus.ai/v1",
)

def run_case(model: str, prompt: str) -> str:
    response = client.chat.completions.create(
        model=model,
        temperature=0.2,
        max_tokens=600,
        messages=[
            {"role": "system", "content": "You are a concise technical writing assistant."},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content
```

Replace the model ID with one currently available in the console. The important part is not the snippet; it is changing only `model` during one comparison. If I want to test prompt versions, I run a separate round. Model output is variable, so one run should not decide the result either.

## Why I Use SupaNexus as My Test Entry Point

At first, I created separate keys in separate vendor consoles. That works, but once I had more than a few small tests, the setup became messy: different SDKs, environment variables, and billing pages. Eventually I was not even sure whether the same request was really reaching each model under comparable conditions.

I then tried [SupaNexus](https://supanexus.ai/) as the entry point for experiments. Its biggest help for me is not deciding which model wins. It gives me an OpenAI-compatible Base URL, project-level API keys, and a model catalog, so I can keep the calling code stable and put the comparison focus back on the outputs.

There are limits to that approach:

- If I need to validate a vendor-exclusive tool, cache, or protocol feature, I still connect directly to that vendor;
- If a model is not currently available in the catalog, I do not force it into the comparison;
- Model availability, price, and trial eligibility change, so I verify the console before testing.

SupaNexus currently offers free model trials and registration offers. I treat it as a starting point for small samples: first find out whether a model earns a place in my workflow, then decide whether larger-scale calls are worth paying for. I do not preload credit and then look for a reason to spend it.

## How I Avoid Grading My Own Expectations

The easiest trick is to hide the model names and read the output a few hours later. I choose the two answers I prefer first, then check where they came from.

For things that can be checked automatically, I add a few hard rules: can JSON parse, is the title under the limit, were links retained, and does the code block pass a basic check? Evaluation guidance likewise recommends combining task-specific checks with human judgment rather than relying on one generic score. [OpenAI Evals guide](https://platform.openai.com/docs/api-reference/evals/deleteRun?lang=python)

I do not let one model grade another and trust that result completely. It can help me filter, but I still read the one or two outputs that are actually going into the product.

## The Test Did Not Give Me a Permanent Winner

A model that explains code well is not automatically right for Chinese copywriting. A model that works for an FAQ today may behave differently after an update. My test sheet therefore has no “champion” column. It only has:

```text
task type → current first choice → fallback model → last retest date
```

That is enough for a personal project. Whenever a model changes, prices move, or I notice users repeatedly editing a certain output, I add a couple of cases and run the comparison again.

If you are also stuck between models, I would not start with a huge evaluation platform. Pick ten or so real tasks, hold the inputs fixed, keep the raw outputs, and read them. You will quickly learn whether you actually need faster responses, less editing, or a specific capability.

For me, one API key does not mean mixing every model together. It means I can test them in the same way and slowly learn which task belongs to which model.

---

*This is a personal developer's experiment note, updated in August 2026. SupaNexus model availability, trial eligibility, and pricing should be confirmed in the live console after signup. Any model-testing conclusion here applies only to this article's task samples and configuration.*
