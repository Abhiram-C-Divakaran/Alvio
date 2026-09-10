# Mock interview

The setup and live session share the Alvio Dashboard shell and existing `/api/chat` Groq endpoint. `useInterviewSession` owns question/answer state, browser media, speech recognition, retry, and report persistence. `MockInterviewSession` renders the live interaction.

- Eight questions, advanced explicitly after feedback; a partial report can be requested through End Session confirmation.
- Response evaluation requests JSON with evidence-based score, criteria, tip, and next question. Invalid responses preserve the draft and offer retry. No placeholder scores or backend error strings are shown.
- Webcam is optional, audio dictation uses browser speech recognition, and typed input remains available. Tracks and recognizers are stopped on shutdown.
- Notes remain in session memory and are never included in API requests or saved reports. Completed reports and transcripts are saved under the current user's local storage key, up to 20 sessions.
- `/mock-interview`, `/ai-tutor`, and `/learn/ai-visualizer` remain canonical routes. Global AI Tools navigation and contextual subsections reuse the shared shell.
- The robot artwork is the supplied `codex-clipboard-b55803f8-4ef6-421d-a7ef-c1952b45f61b.png`, copied unchanged to `public/interview/ai-interviewer.png`.

Validation: `tests/interview-live.browser.cjs` covers the controlled AI flow, error/retry, notes privacy, confirmation, reports, and responsive widths. `tests/interview-devices.browser.cjs` simulates speech and webcam streams to check fallback and track cleanup. Neither test claims physical-device or live-provider verification.
