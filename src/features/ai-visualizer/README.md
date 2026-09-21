# AI Visualizer

The shared Alvio AI Tools shell serves `/learn/ai-visualizer`; `/ai-tools/visualizer` redirects there. The old visualizer page is no longer the route target. The linked-list preview is an explicit built-in teaching example; submitting a question calls the AI service.

## Pipeline

`POST /api/visualizer` sends the student's problem to Groq. The model produces a bounded JSON trace using known structures and operation names. `compileSpecification` derives every before-state from the preceding after-state and maps exact code anchors to line numbers. `validateSpecification` runs on both server and client. It rejects invalid structure names, duplicate IDs, dangling edges, non-finite values, out-of-range code lines, discontinuous snapshots, missing grid coordinates, and oversized responses. Generated source is displayed, never executed.

The default model is `openai/gpt-oss-120b`; override with `GROQ_VISUALIZER_MODEL`. Credentials use the existing server-only `GROQ_API_KEY`. The former Llama model returned `model_not_found` during live testing. One bounded schema-repair attempt is allowed. Client cancellation cancels the provider request. Requests have timeouts and a per-process, per-IP limit of 12/minute; multi-instance deployment should enforce a shared gateway quota too.

## Rendering and interaction

Seventeen structure adapters expose relevant operations. Shared known geometry renders sequences, stacks, directed/undirected relationships, trees, tries, heaps, graphs, matrices, and DP/recursion states. Stable IDs preserve node identity. Graph edge weights/direction and explicit pointer changes are carried by snapshots. Rows/columns control table layouts. No model-defined geometry, scripts, shaders, or HTML are accepted.

Playback, timeline seeks, reasoning, current-step text, and highlighted code use one step index. `Space`, left/right arrows and `R` work when focus is outside controls. Walk Me Through pauses after each step. Hint mode withholds the solution scene/code. The 3D bundle is lazy-loaded; mobile/low-core devices start in 2D. A text-state view and WebGL failure fallback are provided. Reduced motion removes node interpolation.

Code language changes require generating matching code and steps explicitly, so old line mappings cannot be reused accidentally. Follow-up questions include the current step and do not replace the trace. Clicking a node/edge prepares a question about that element.

Sorting comparisons run instrumented Bubble/Merge/Quick Sort implementations on the same numeric input (up to 20 values), with real comparison/swap/write counts. This is not a timing benchmark or arbitrary generated-code execution.

## Persistence and platform links

Save to My Learning is explicit and stores the problem, validated trace, step index, generated language, notes and optional source URL in per-account browser storage (maximum 20 entries). This is device-local, not cloud synchronization. Sessions can be resumed or deleted. Changing accounts aborts in-flight requests and clears the visible session.

External URL import is deliberately unavailable: paste the full statement instead. Only a user-provided HTTPS URL on a supported platform host is linked. No inferred external problem URLs are fabricated. Practice navigation uses the existing Coding Playground.

## Limits and verification

AI-generated algorithm reasoning still requires review: schema validation guarantees renderability and structural consistency, not a proof of solution correctness. Scenes are capped at 80 nodes, 180 edges and 120 steps. Complex problems can be explained without a scene using `supported:false`. Provider, schema and renderer errors are presented as recoverable student-facing states.

Run `node tests/visualizer-model.cjs` for validation/compiler/layout/algorithm tests and `node tests/visualizer.browser.cjs` for the UI suite with mocked AI. The browser test expects the local app at port 3001 and the bundled Playwright installation. Live checks are separate and use the configured provider; they are not part of deterministic tests.
