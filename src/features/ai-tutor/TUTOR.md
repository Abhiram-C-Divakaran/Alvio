# AI Tutor

The canonical `/ai-tutor` route uses the shared AI Tools shell. The Tutor keeps the existing Groq streaming `/api/chat` endpoint and generated animated-3d renderer. The current backend model is `llama-3.3-70b-versatile`.

`useTutor` manages streamed SSE deltas, cancellation, messages, per-user local conversation history, ratings, speech input, and text attachments. `TutorMarkdown` renders Markdown, tables, highlighted code with copy controls, and interactive examples. The resource drawer replaces the rail on narrow screens.

Teaching modes are validated server-side. Hint and quiz modes override the default requirement to provide full code/visualizations, avoiding premature solutions. Only concise topic progress context accompanies requests; account details are not included.

Conversation history and message ratings remain on this device (up to 30 conversations). File attachments are text/code only, limited to 40 KB, previewed before sending. Images are not supported by this endpoint. Stop cancels the browser request and preserves partial text; it does not promise provider-side billing cancellation.

Validation uses `tests/tutor.browser.cjs` and `tests/tutor-stream.browser.cjs` with controlled AI streams and a simulated speech recognizer. Live Groq output and physical microphones are not covered by those tests.
