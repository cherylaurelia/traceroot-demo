# TraceRoot with zero cloud keys

Unofficial demo by Cheryl Aurelia, not affiliated with TraceRoot.AI.

Self-hosted [TraceRoot](https://github.com/traceroot-ai/traceroot) (main @ 4bf2166, `make prod-lite`) with a
local model as the detector judge, and the one setting that stops it on Ollama.

## What it shows
- A small revenue agent on Qwen3-4B (llama.cpp) answered 6 questions. Twice it refused October as "a future
  period" without calling its tool. A plain-English detector judged by the same local model, through the BYOK
  OpenAI provider with a custom Base URL, flagged both (and one correct answer: a 4B judge is noisy).
- The gap: the [BYOK docs](https://traceroot.ai/docs/ai-agent/byok) say step 4 is "Optionally set a custom base
  URL for self-hosted or proxied models", but the OpenAI provider's model field is a fixed list of OpenAI IDs
  (since #610). Ollama and vLLM need their own model names, so with Ollama, Test Connection says Connected (it
  only calls `GET /models`) and every judge run fails with `404 model 'gpt-6.1-sol' not found`.
- The fix ([branch](https://github.com/cherylaurelia/traceroot/compare/main...fix/openai-base-url-model-id),
  [patch](public/traceroot-typed-model-id.patch)): a Base URL other than the adapter's default gets the free-text
  model input the pass-through adapters already use, with the catalog IDs as `<datalist>` suggestions. Same
  detector, same Ollama server: Failed before, Completed (refusal Yes, correct answer No) after.

All rows in `data/runs.json` come from the recorded run on 2026-11-06; answers were checked by hand against
the CSV.

## Run the page
```
npm install
npm run build && npm start
npm test        # node --test lib/*.test.ts
```

## Reproduce the setup
See the "Run it yourself" section on the page: `make prod-lite`, `llama-server` or `ollama serve`, then
Workspace settings → Model Providers → OpenAI with `http://host.docker.internal:<port>/v1`.
