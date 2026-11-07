import Image from "next/image";
import runs from "@/data/runs.json";
import { tally, verdict } from "@/lib/runs";

const REPO = "https://github.com/cherylaurelia/traceroot-demo";
const PR = "https://github.com/traceroot-ai/traceroot/pull/2898";
const PATCH = "/traceroot-typed-model-id.patch";
const SRC = "https://github.com/traceroot-ai/traceroot/blob/4bf21665";
const PICKER = `${SRC}/frontend/ui/src/features/settings/workspace/components/ModelProvidersTab.tsx#L555-L579`;
const TEST_ROUTE = `${SRC}/frontend/ui/src/app/api/workspaces/%5BworkspaceId%5D/model-providers/test/route.ts#L153`;
const BYOK_DOC = "https://traceroot.ai/docs/ai-agent/byok";

const questions = runs.questions.map((r) => ({
  ...r,
  judge: verdict(r.judge),
}));
const score = tally(questions);

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Shot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="border border-line bg-card">
      <a href={src}>
        <Image
          src={src}
          alt={alt}
          width={1297}
          height={300}
          className="h-auto w-full"
        />
      </a>
      <figcaption className="border-t border-line px-4 py-2 text-xs text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto border border-line bg-card px-4 py-3 font-mono text-[13px] leading-relaxed">
      {children}
    </pre>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl space-y-14 px-5 py-12 sm:py-16">
      <header className="space-y-5">
        <p className="font-mono text-xs tracking-wide text-muted uppercase">
          Self-hosted TraceRoot · local judge · no cloud keys
        </p>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          TraceRoot with zero cloud keys
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed">
          <strong>Problem:</strong> an Ollama or vLLM judge can&apos;t be set up
          from the UI. The OpenAI provider has a Base URL field, but its model
          list holds only OpenAI IDs, Test Connection still says Connected, and
          then every judge run fails with a 404.
        </p>
        <p className="max-w-2xl text-lg leading-relaxed">
          <strong>Fix:</strong> when the Base URL points at another server than
          the provider&apos;s, the model field takes a typed ID (catalog IDs
          stay as suggestions). One component plus tests, checked on the same
          Ollama server before and after.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={PR}
            className="bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
          >
            The PR (#2898)
          </a>
          <a
            href={PATCH}
            className="border border-line px-4 py-2 text-sm font-medium hover:bg-card"
          >
            Patch file
          </a>
          <a
            href={REPO}
            className="border border-line px-4 py-2 text-sm font-medium hover:bg-card"
          >
            This demo&apos;s repo
          </a>
        </div>
        <div className="pt-4">
          <Shot
            src="/shots/07-same-detector-before-after-patch-crop.jpg"
            alt="Detector runs: two Failed rows at 22:59, then after the patch one Yes and one No at 23:19"
            caption="Status, bottom to top: Failed, Failed → Completed, Completed. Same detector, same Ollama server. 22:59: model gpt-6.1-sol, 404. 23:19, patched UI with qwen3-4b-local typed in: refusal Yes, correct answer No."
          />
        </div>
      </header>

      <Section id="catch" title="What a local judge caught">
        <p className="leading-relaxed text-muted">
          A small revenue agent (Qwen3-4B, one tool that sums{" "}
          <code>orders.csv</code> for Aug–Oct 2026) answered six questions.
          Twice it refused October as &ldquo;a future period&rdquo; without
          calling its tool: fast, no error, nothing a latency or error alert
          would see. A plain-English detector, judged by the same local model
          through TraceRoot&apos;s BYOK OpenAI provider pointed at llama.cpp,
          flagged both.
        </p>
        <Code>{`Detector "Answered without checking the data" (100% sampling, judge: local Qwen3-4B)
Report identified=true if the agent gave a final answer without calling revenue_by at least once,
or if it refused or said the data is unavailable or the date is in the future.`}</Code>
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-card text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Question</th>
                <th className="px-3 py-2 font-medium">Agent answer</th>
                <th className="px-3 py-2 font-medium">
                  Checked against the CSV
                </th>
                <th className="px-3 py-2 font-medium">Identified</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((r) => (
                <tr key={r.trace} className="border-t border-line align-top">
                  <td className="px-3 py-2">{r.q}</td>
                  <td className="px-3 py-2 text-muted">{r.answer}</td>
                  <td className="px-3 py-2">
                    {r.correct ? "Correct" : "Wrong"}: {r.truth}
                    {r.calledTool ? "" : " (tool never called)"}
                  </td>
                  <td
                    className={`px-3 py-2 font-medium ${r.judge === "yes" && !r.correct ? "text-yes" : ""}`}
                  >
                    {r.judge === "yes" ? "Yes" : "No"}
                    {r.judge === "yes" && r.correct ? (
                      <span className="block text-xs font-normal text-muted">
                        false positive
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="leading-relaxed">
          Caught {score.caught} of {score.wrong} wrong answers. A 4B judge is
          noisy: it also flagged {score.falseAlarms} of {score.right} correct
          answers. That&apos;s the small model, not the detector; the point is
          that it runs end to end with no data leaving the machine.
        </p>
        <Shot
          src="/shots/01-detector-runs-local-judge-crop.jpg"
          alt="TraceRoot detector runs table: three rows Identified Yes with summaries, three No"
          caption="The detector's runs in self-hosted TraceRoot (llama.cpp judge), 2026-11-06."
        />
      </Section>

      <Section id="trap" title="Where it stops: Ollama">
        <p className="leading-relaxed text-muted">
          The{" "}
          <a className="underline" href={BYOK_DOC}>
            BYOK docs
          </a>{" "}
          say step 4 is &ldquo;Optionally set a custom base URL for self-hosted
          or proxied models&rdquo;. llama.cpp ignores the model name, so any
          listed ID works there. Ollama and vLLM don&apos;t: the model name has
          to be theirs.
        </p>
        <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
          <li>
            Add Provider → OpenAI, Base URL{" "}
            <code>http://host.docker.internal:11434/v1</code>. The{" "}
            <a className="underline" href={PICKER}>
              Models field
            </a>{" "}
            offers only <code>gpt-6.1-sol</code> … <code>o3</code>.
          </li>
          <li>
            Test Connection: <span className="text-ok">Connected</span>. It only
            calls{" "}
            <a className="underline" href={TEST_ROUTE}>
              GET /models
            </a>
            , so it can&apos;t see that the model doesn&apos;t exist.
          </li>
          <li>
            Every judge run: <span className="text-yes">Failed</span>.
          </li>
        </ol>
        <Code>{`[Detector] Eval failed for detector Ollama judge (picker model) on trace e8e3e18d…:
${runs.ollama.before.error}`}</Code>
      </Section>

      <Section id="fix" title="The fix, before and after">
        <p className="leading-relaxed text-muted">
          PR #610 kept free-text model IDs for the pass-through adapters (Azure,
          Bedrock, OpenRouter). A custom Base URL is the same situation: the
          catalog can&apos;t know that server&apos;s model names. So{" "}
          <code>curatedModelsFor(adapter, baseUrl)</code> returns no catalog
          when the Base URL differs from the adapter&apos;s default, and the
          field becomes an input with the catalog IDs as{" "}
          <code>&lt;datalist&gt;</code> suggestions (same host with another
          path, like Google&apos;s <code>/v1beta</code>, keeps the dropdown).
          That applies to every catalog adapter with a default URL (OpenAI,
          Anthropic, Google, DeepSeek, xAI, Moonshot, Z.AI, TypeSafe); Azure,
          Bedrock and OpenRouter were already free text. Saved providers open
          with their stored ID instead of &ldquo;(Unsupported)&rdquo;. The API
          already accepted any ID; only the form blocked it.
        </p>

        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
          <li>
            New tests: the helper (default endpoint keeps the catalog, custom
            URL and trailing slash, pass-through adapters) and editing a saved
            Ollama provider. Both fail with the fix reverted.
          </li>
          <li>
            Full UI suite on Node 24 (their CI version): 417 files, 4,912 tests
            pass. Prettier, ESLint (no new warnings) and tsc clean.
          </li>
          <li>
            Not done: a warning when Test Connection&apos;s <code>/models</code>{" "}
            list lacks the chosen ID. That would close the false green too; left
            as a follow-up to keep the diff to one file.
          </li>
        </ul>
      </Section>

      <Section id="setup" title="Run it yourself">
        <Code>{`git clone https://github.com/traceroot-ai/traceroot && cd traceroot
cp .env.example .env && make prod-lite                 # localhost:3000

llama-server -m Qwen3-4B-Instruct-2507-Q4_K_M.gguf --jinja -c 32768 --port 8089 --host 0.0.0.0
#  or: ollama create qwen3-4b-local -f Modelfile && ollama serve

# Workspace settings → Model Providers → OpenAI
#   Base URL  http://host.docker.internal:8089/v1  (Ollama: :11434/v1)
#   Model     any listed ID for llama.cpp; with the patch, Ollama's own ID
# Detectors → New Detector → pick that model, write the prompt in plain English`}</Code>
        <p className="text-sm leading-relaxed text-muted">
          The agent was instrumented by{" "}
          <code>npx traceroot-cli@0.6.1 setup</code>, which ran Claude Code to
          add the Python SDK and waited for the first trace. Signals and
          root-cause analysis need <code>OPENAI_API_KEY</code> on the server, so
          they stayed off here. {runs.stack}; recorded {runs.recorded}.
        </p>
      </Section>

      <footer className="border-t border-line pt-6 text-sm text-muted">
        Unofficial demo by Cheryl Aurelia: not affiliated with TraceRoot.AI.
        Screenshots are from a local self-hosted instance.
      </footer>
    </main>
  );
}
