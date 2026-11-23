# Coding Playground Workspace

The Coding Playground provides a resizable split workspace with Monaco Editor, problem descriptions, progressive hints, editable test cases, submission history, and server-verified submissions.

## Run vs. Submit

- **Run (`Run` / `Run Testcase`)**: Executes your code against the currently editable test cases (all visible cases or only the selected case). JavaScript runs in an isolated browser Web Worker with a 3-second timeout; Python, TypeScript, C++, C, Java, and C# run through the external Paiza execution API. Run does not save a submission or change problem statistics.
- **Submit (`Submit` / `Ctrl/Cmd+Shift+Enter`)**: Sends only `{ code, language }` to `POST /api/problems/:problemId/submit`. The Express server loads the problem and its provided test cases directly from SQLite, generates the language runner wrapper, executes the code through the external Paiza execution service (never executing submitted code on the Alvio server), and calculates the authoritative verdict (`Passed`, `Failed`, or `Error`).

## Supported Languages

All seven languages from the workspace picker are wired into both Run and server-verified Submit:

- **JavaScript** (`javascript`) — full support across all provided problems via Paiza Node.js runtime on Submit (Web Worker on Run).
- **TypeScript** (`typescript`) — full support via Paiza TypeScript runtime.
- **Python / Python 3** (`python`, `python3`) — full support via Paiza Python 3 runtime.
- **C++** (`cpp`), **Java** (`java`), **C#** (`csharp`) — supported for standard primitive and array/matrix signatures via Paiza; problems with `TreeNode` or `null` elements inside integer arrays return a clear unsupported-type notice on Submit rather than a false pass.
- **C** (`c`) — supported for primitive, string, `integer[]`, and `char[]` signatures via Paiza; problems with complex nested types (e.g. `integer[][]`, `string[]`, `TreeNode`) return an explicit unsupported-type message on Submit while keeping Run available.

## Test Cases, History, and Guest Mode

- **Visible test cases only**: Server Submit evaluates the problem's provided test cases stored in SQLite. Client-edited test cases and client-sent verdicts/counts are ignored on Submit.
- **Submission history & statistics**: When signed in, every evaluated submission (`Passed`, `Failed`, or code `Error`) is saved to `user_submissions` with server-calculated status, passed/total counts, runtime, language, code, and timestamp. Problem acceptance statistics (`problem_stats`) are updated exclusively from server-calculated verdicts (never from provider outages).
- **Guest mode**: `POST /api/problems/:problemId/submit` uses optional authentication. Guests receive the full server-calculated verdict without signing up, and no fake account or `user_submissions` row is created.

## Honest Limitations & Future Isolated Judge Architecture

- **No hidden test judge**: Alvio currently evaluates only the provided SQLite test cases and does **not** run a LeetCode-style hidden test suite or custom container/Docker sandbox.
- **External execution provider**: Server Submit depends on the external Paiza API (`https://api.paiza.io`), subject to provider availability, rate limits, and execution timeouts. Provider outages return a clear `Error` (`Execution Service Unavailable`) and are never reported as Wrong Answer.
- **Metrics**: Memory usage and runtime percentiles are not measured by this runner and are not fabricated.
- **UI**: Monaco uses bundled editor and language definitions; drafts auto-save per problem/language with safe storage guards; divider positions persist locally.
- **Future isolated judge design**: Moving to competitive-grade hidden grading requires (1) a separate `problem_hidden_tests` table never returned by `GET /api/problems/:id`, (2) an asynchronous job queue + dedicated worker service separate from the Express API, and (3) ephemeral rootless containers/microVMs (`--network=none`, read-only rootfs, cgroups v2 CPU/RAM/PID caps) where the grading harness compares outputs outside user-writable space.

## Validation

- Server submission tests (mocked execution provider, no live API credentials needed): `npm run test:submissions`
- Full backend foundation suite: `npm run test:foundation`
- Coding workspace browser regressions: `node tests/coding-workspace.browser.cjs` and `node tests/coding-language.browser.cjs`
