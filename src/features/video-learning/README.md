# Video Lessons

The existing `/video-learning` route now uses the shared Learn shell and a responsive player/transcript/sidebar layout. All six original MP4s are retained, including fixing Binary Tree playback (it previously fell into an iframe branch). Actual media metadata determines duration; the existing videos are approximately 10 seconds, not the reference's 10–16 minutes.

Playback uses the native video element with accessible custom controls, bounded seeking, speed, mute, fullscreen, optional picture-in-picture, and player-scoped keyboard shortcuts. Notes and playback settings are lesson-specific and stored in the existing persisted progress store with IndexedDB sync. Completion is explicit and idempotent, updates syllabus completion and existing topic start status, and records learning activity. It does not complete an entire data-structure course or invent a new XP award. Coverage is tracked separately from seeking to suggest completion after 90% watched. Lessons remain freely navigable, as before.

The source supplied untimed summary text, not verified transcripts/caption files. These remain clearly labeled summaries; Transcript shows the requested unavailable state. The player supports timestamped transcript entries, seeking, active segment highlighting, VTT captions, and transcript download when verified entries are supplied. No invented timings or captions have been added.

All six lessons have Python, C++, Java and JavaScript examples, real reading/visualizer/practice links, summary downloads and handoff into the existing playground. Ask AI reuses useTutor and sends lesson title, topic, position and current segment/summary along with the question. A failed tutor request does not block playback.

Checks: `node tests/video-lessons.browser.cjs`; scoped TypeScript via `data/tsconfig-video.json`; Vite build. The browser test covers playback, speed/notes/completion persistence, switching lessons, all code languages, contextual AI failure, and mobile overflow.
