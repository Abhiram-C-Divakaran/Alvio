# PvP Coding Duel

The existing `/workspace/pvp` route now uses `PracticeShell`, alongside Coding Playground and Quizzes. The pre-match layout follows the supplied reference and uses `public/pvp/duel-arena.webp`. Buttons, typography, status and feature cards are React elements rather than baked-in image controls. Artwork was edited with the built-in imagegen tool; its source and prompt are documented in `public/pvp/artwork.md`.

## Supported gameplay

- Preserves the original same-browser, same-origin BroadcastChannel multiplayer mode. Two windows of one browser profile on the same device can play together; this is not cross-device networking.
- Cryptographically generated six-character room codes isolate independent matches. Only the first guest is admitted. Room validation, copying, cancellation, missing-room timeouts and full-room errors are handled in the UI.
- The host loads the existing `reverse-linked-list` problem through `/api/problems/reverse-linked-list` and synchronizes its full definition with the guest. The dataset represents this problem's inputs and outputs as integer arrays; the workspace explains that representation.
- Real JavaScript test execution reuses `CodeExecutionEngine` in a dedicated worker, with a three-second timeout. A run cannot win simply by clicking a button. The host resolves the first passing result.
- Live code, test progress, three-second keyboard freezes and 15-second sabotage cooldowns synchronize across the room. A stable room channel replaces the old effect that disconnected players on every game-state change.
- Heartbeats detect interrupted connections; refreshing a participating tab resumes its session and draft. Duplicating a tab opens a new player window rather than cloning the host. Disconnected players always have a return-to-hub action.
- Monaco is loaded from the installed package after the match begins; it no longer needs a remote editor CDN for this workspace.
- Connected-window presence is labelled “in this browser.” `/api/leaderboard` supplies the existing Academy XP leaderboard. No online populations, PvP ratings, wins, match histories or ranked XP rewards are fabricated. Local duels are explicitly unranked; remote/ranked competition would require a separate server-authoritative service.

## Validation

`tests/pvp.browser.cjs` exercises real local APIs and three browser pages: navigation, real leaderboard, copy/cancel, malformed/missing/full rooms, parallel room isolation, connection, shared problem, live code, sabotage/cooldown, actual failed execution, infinite-loop timeout, reload/reconnect, disconnect, guest victory, solution review, replay and responsive layouts at 1536, 1024, 768, 390 and 360 pixels.

`tests/pvp-multiplayer.cjs` additionally exercises host victory. `tests/practice.browser.cjs` covers the existing Coding Playground after shared-sidebar changes.

Client and server production bundles build. The repository-wide TypeScript check still reports pre-existing errors outside the changed PvP files. No diagnostics were reported for the new PvP components, hook, room service, runner or shared-shell integration. The installed lint native binary is blocked by Windows Application Control.
