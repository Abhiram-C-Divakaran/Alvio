# Quiz Arena

The setup, focused session, answer review, and results reuse all 3,000 questions from `quizQuestions.ts`. A Fisher–Yates shuffle selects unique questions and randomizes answer positions. Small question pools are capped transparently. Greedy maps to Greedy Algorithms; Recursion matches explicit recursion text in the real bank. String and Math currently have no source questions and show an unavailable state rather than fabricated content. Additional original topics remain under More topics.

Solo supports a 30-second timer or untimed play. Rapid Fire requires 15 seconds per question and advances after 1.8 seconds of feedback. Answers lock after selection/expiry. A–D/1–4 select answers, arrows navigate, and Enter advances when focus is outside a button. Skipped questions count as incorrect on submission.

Configuration, shuffled questions, answers, index, deadlines, and results persist per account in localStorage; timed deadlines do not reset on reload. Guest sessions stay separate from authenticated accounts. Quiz completions are idempotent in the existing progress store. Existing correct-answer rewards (20/50/100 XP) are preserved, and results show the actual XP delta including existing topic-score mastery XP. A quiz no longer marks unseen lessons complete. Completion updates topic scores, recommendations, elapsed study time, dated activity, streak, and cumulative quiz statistics; review cannot award XP again.

Verify with `node tests/quiz-model.test.mjs` and `node tests/quiz.browser.cjs`. Artwork editing provenance is in `public/quiz/artwork.md`.
