# Gemini API's September Change: Will My Standard Key Still Work? A No-Downtime Migration Log

[中文版](gemini-standard-key-auth-key-migration.md)

I noticed the Gemini API notice while tidying up a personal project that almost never changes. Nothing was failing. The key was still in an environment variable. That was exactly the uncomfortable part: it was the kind of dependency that looks fine until a user is the first person to discover it is not.

The phrase “Standard Keys are going away” needs one important qualification. Google is moving the Gemini API from Standard Keys to Auth Keys. Its documentation says unrestricted Standard Keys are rejected by the Gemini API, while Standard Keys with explicit restrictions can continue to work. New keys created in AI Studio are Auth Keys by default. That is still enough reason to migrate a personal project now: a key problem is rarely found at a convenient time. [Google's key migration guidance](https://ai.google.dev/gemini-api/docs/api-key)

This is the small migration I made for one of my tools. The goal was modest: do not revoke the old key while production still depends on it, and do not let a key leak into code or logs.

## First, I checked which key the project was actually using

My project had three easy-to-forget references: a local `.env`, a deployment secret, and a small scheduled-job instance. I used to create a replacement key first and search later. This time I listed the references before touching anything.

In the AI Studio API Keys page, I checked two things:

- Is the old key listed as `Standard`?
- Is it labelled `Unrestricted`?

An old key restricted to the Gemini API does not necessarily break immediately. An unrestricted key that still happens to work is not a migration plan. Google says the Gemini API will reject unrestricted Standard Keys during September 2026, and that newly created keys are Auth Keys automatically. [Key types and migration steps](https://ai.google.dev/gemini-api/docs/api-key)

## I put the new key in a secret before changing application code

An Auth Key is bound to a Google Cloud service account for more granular permission control. It is not a new SDK format. For this small integration, the client still reads a key from an environment variable; the difference is in the credential and its identity boundary.

I added a temporary variable instead of overwriting the current one:

```bash
# In local or deployment-secret configuration. Never commit this to .env.example.
GEMINI_API_KEY_NEXT="new-auth-key-goes-here"
GEMINI_MODEL="your-current-gemini-model"
```

Google recommends `GEMINI_API_KEY` or `GOOGLE_API_KEY` as environment variables, which its client libraries discover automatically. If both are set, `GOOGLE_API_KEY` takes precedence. [Environment-variable guidance](https://ai.google.dev/gemini-api/docs/api-key)

I did not send both keys with the same production request. That makes failures harder to interpret. The old key kept serving traffic, while the new one was used only for a visible probe in local development or staging.

## I verified the new key with one deliberately boring request

The probe did not need real user data. I asked the model for a fixed short response and made the command fail on a non-2xx result:

```bash
curl --fail-with-body \
  -H "x-goog-api-key: $GEMINI_API_KEY_NEXT" \
  -H "Content-Type: application/json" \
  "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent" \
  -d '{
    "contents": [{"parts": [{"text": "Reply with exactly: key-ok"}]}]
  }'
```

I checked more than whether text came back:

- Was this the expected authentication and authorization result, rather than a misleading cached outcome?
- Did any deployment log accidentally print a request header?
- Is the model ID still permitted for this project?
- Are the local, staging, and production variable names actually consistent?

If the key-creation button is unavailable, I would not borrow a key from someone else's project just to finish the migration. Google's documentation lists the needed project permissions, including API-key creation, enabling the Generative Language API, and creating the linked service account. For a personal project without those permissions, asking the project owner or using a project I control is safer. [Permission troubleshooting](https://ai.google.dev/gemini-api/docs/api-key)

## At cutover, I changed one variable

After the probe passed repeatedly, I updated `GEMINI_API_KEY` in the deployment platform to the new Auth Key, redeployed one instance, and checked the app's own health check plus one low-risk real path. I did not immediately delete the old Standard Key; I kept a short, intentional rollback window.

“Rollback” here did not mean randomly swapping keys on every error. I set a simple condition: if the new deployment showed authentication failures, permission errors, or an unexpected request-path problem, restore the previous secret, record the time and request ID, then investigate the project's permissions. Only after the new key had been stable for a while would I revoke the old key.

Google also notes that leaked Auth Keys can be blocked quickly. That is valuable, but it is another reason not to paste a “test-only” key into an issue, a screenshot, or a blog code block.

## This made me separate direct dependencies from my experiment entry point

I use [SupaNexus](https://supanexus.ai/) for small multi-model experiments because it lets me compare output, latency, and budget through one OpenAI-compatible calling pattern. It is not a substitute for this Gemini Auth Key migration: if a production feature calls Gemini directly, Google's identity and permission requirements still apply.

The change did remind me not to bind every experiment to one vendor's credential setup. For models currently available in the console, I use SupaNexus for small samples and fallback-path checks. When I need Gemini-specific capabilities, permissions, or data-handling boundaries, I still go to Gemini's official API. Model availability, trials, prices, and top-up offers change, so I check the live console after signup.

## The checklist I kept

```text
[ ] Confirm the old key's type and restriction state in AI Studio
[ ] Create an Auth Key without overwriting the old secret
[ ] Verify it with a probe that contains no sensitive content
[ ] Check variables and logs in local, staging, and production
[ ] Change only the production secret and observe a low-risk real request
[ ] Keep a short rollback window, then revoke the old key
[ ] Update deployment notes so an unrestricted key is not recreated later
```

This was not an exciting model upgrade, but it was maintenance I am glad to do early. A personal project does not need an elaborate key-rotation platform. It does need “the new credential was verified” and “the old credential was safely retired” to be two separate, checkable states.

---

*This is a personal developer's migration note, written in September 2026. Gemini API key policy, project permissions, and model availability can change; verify them in Google's current console and documentation. This post never provides, and does not recommend publishing, any API key.*
