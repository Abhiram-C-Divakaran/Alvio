import { BookOpen, Flame, Target, ChartNoAxesColumnIncreasing, Layers, Settings, UserRound, Zap, Clock3, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { questionBank } from '../../data/quizQuestions';
import { topics, extraTopics, type QuizConfig } from './quizModel';
import type { LearningProgress } from '../../types/user';

type SelectorProps = { config: QuizConfig; onChange: (change: Partial<QuizConfig>) => void };
export function QuizStats({ totals }: { totals?: LearningProgress['quizTotals'] }) {
  const stats = [
    { Icon: BookOpen, value: questionBank.length.toLocaleString(), label: 'Questions', tone: 'violet' },
    { Icon: Flame, value: totals?.bestStreak || 0, label: 'Best Streak', tone: 'orange' },
    { Icon: Target, value: totals?.questions ? `${Math.round(totals.correct / totals.questions * 100)}%` : '—', label: 'Avg. Accuracy', tone: 'cyan' },
    { Icon: ChartNoAxesColumnIncreasing, value: totals?.completed || 0, label: 'Quizzes Solved', tone: 'blue' },
  ];
  return <dl className="quiz-stats">{stats.map(({ Icon, value, label, tone }) => <div key={label}><span className={`quiz-icon ${tone}`}><Icon size={25}/></span><div><dd>{value}</dd><dt>{label}</dt></div></div>)}</dl>;
}
export function QuizHero({ totals }: { totals?: LearningProgress['quizTotals'] }) {
  const reduced = useReducedMotion();
  return <motion.section className="quiz-hero" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .2 }} aria-labelledby="quiz-title">
    <div className="quiz-art" aria-hidden="true"/>
    <div className="quiz-hero-copy"><div className="quiz-eyebrow">PRACTICE <span/></div><h1 id="quiz-title">Quiz <span>Arena</span></h1>
      <h2>Test your algorithmic reflexes. Master DSA concepts.</h2>
      <p>Quick quizzes. Real progress. Strengthen your fundamentals<br className="quiz-desktop-break"/> and become a faster, sharper problem solver.</p>
      <QuizStats totals={totals}/>
    </div>
  </motion.section>;
}
function CardHeading({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <div className="quiz-card-heading"><span className="quiz-icon violet">{icon}</span><div><h2>{title}</h2><p>{children}</p></div></div>;
}
export function TopicSelector({ config, onChange }: SelectorProps) {
  const chip = (topic: string) => <button key={topic} type="button" aria-pressed={config.topic === topic} onClick={() => onChange({ topic })}>{topic}</button>;
  return <section className="quiz-config-card quiz-topics"><CardHeading icon={<Layers/>} title="1. Choose Topic">Pick a topic to focus on, or go with all.</CardHeading>
    <div className="quiz-chips" role="group" aria-label="Choose topic">{topics.map(chip)}</div>
    <details open={extraTopics.includes(config.topic) || undefined}><summary>More topics</summary><div className="quiz-chips" role="group" aria-label="More topics">{extraTopics.map(chip)}</div></details>
  </section>;
}
export function DifficultySelector({ config, onChange }: SelectorProps) {
  const choices = [{ value: 'easy', label: 'Easy', detail: 'Build your fundamentals' }, { value: 'medium', label: 'Medium', detail: 'A balanced challenge' }, { value: 'hard', label: 'Hard', detail: 'For experienced learners' }, { value: 'mixed', label: 'Mixed', detail: 'A mix of all difficulties' }] as const;
  return <section className="quiz-config-card"><CardHeading icon={<ChartNoAxesColumnIncreasing/>} title="2. Select Difficulty">Choose the challenge level.</CardHeading>
    <fieldset className="quiz-difficulty"><legend className="quiz-sr-only">Select difficulty</legend>{choices.map(c => <label key={c.value} className={`quiz-radio ${config.difficulty === c.value ? 'selected' : ''}`}><input type="radio" name="difficulty" value={c.value} checked={config.difficulty === c.value} onChange={() => onChange({ difficulty: c.value })}/><span className={`quiz-status-dot ${c.value}`}/><span><strong>{c.label}</strong><small>{c.detail}</small></span></label>)}</fieldset>
  </section>;
}
export function QuizSettings({ config, onChange }: SelectorProps) {
  return <section className="quiz-config-card quiz-settings"><CardHeading icon={<Settings/>} title="3. Quiz Settings">Customize your quiz experience.</CardHeading>
    <div className="quiz-settings-inner"><fieldset><legend>Quiz Mode</legend><div className="quiz-mode-grid">{([{ value: 'solo', label: 'Solo Challenge', detail: 'Test your own skills', Icon: UserRound }, { value: 'rapid', label: 'Rapid Fire', detail: '15 seconds · auto next', Icon: Zap }] as const).map(({ value, label, detail, Icon }) => <label key={value} className={`quiz-radio quiz-mode ${config.mode === value ? 'selected' : ''}`}><input type="radio" name="mode" value={value} checked={config.mode === value} onChange={() => onChange({ mode: value, ...(value === 'rapid' ? { timed: true } : {}) })}/><Icon size={23}/><span><strong>{label}</strong><small>{detail}</small></span></label>)}</div></fieldset>
    <fieldset><legend>Number of Questions</legend><div className="quiz-count-grid">{[5, 10, 20, 50].map(count => <label key={count} className={`quiz-count ${config.count === count ? 'selected' : ''}`}><input type="radio" name="count" checked={config.count === count} onChange={() => onChange({ count })}/><span>{count}</span></label>)}</div></fieldset>
    <label className="quiz-timed"><Clock3 size={23}/><span><strong>Timed Mode</strong><small>{config.mode === 'rapid' ? 'Required for Rapid Fire · 15s each' : '30 seconds per question'}</small></span><input type="checkbox" role="switch" aria-label="Timed Mode" checked={config.timed} disabled={config.mode === 'rapid'} onChange={e => onChange({ timed: e.target.checked })}/><span className="quiz-switch" aria-hidden="true"/></label>
    </div>
  </section>;
}
export function StartQuizButton({ disabled, onClick, loading }: { disabled: boolean; onClick: () => void; loading: boolean }) {
  return <button className="quiz-primary quiz-start" disabled={disabled} onClick={onClick}><Play size={22} fill="currentColor"/>{loading ? 'Loading progress…' : 'Start Quiz'}</button>;
}
