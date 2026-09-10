import { useEffect, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/languages/definitions/javascript/register';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import { ArrowLeft, Clock3, Play, ShieldAlert, Snowflake, Zap } from 'lucide-react';
import type { ExecutionResult } from '../../coding/CodeExecutionEngine';
import type { DuelController } from './useDuel';
(self as unknown as { MonacoEnvironment: { getWorker: () => Worker } }).MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });

export default function PvPWorkspace({ duel, review, onResult }: { duel: DuelController; review: boolean; onResult: () => void }) {
  const { state } = duel;
  const problem = state.problem!;
  const [now, setNow] = useState(Date.now());
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [opponent, setOpponent] = useState(false);
  const worker = useRef<Worker | null>(null);
  const deadline = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frozen = Math.max(0, Math.ceil((state.frozenUntil - now) / 1000));
  const cooldown = Math.max(0, Math.ceil((state.cooldownUntil - now) / 1000));
  const elapsed = Math.max(0, Math.floor((now - state.startedAt) / 1000));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 250); return () => { clearInterval(timer); worker.current?.terminate(); if (deadline.current) clearTimeout(deadline.current); }; }, []);
  const run = () => {
    if (running || frozen || review || state.phase !== 'playing') return;
    setRunning(true); setResult(null);
    const runner = new Worker(new URL('./duelRunner.worker.ts', import.meta.url), { type: 'module' });
    worker.current = runner;
    const finish = (value: ExecutionResult) => {
      if (deadline.current) clearTimeout(deadline.current);
      runner.terminate(); worker.current = null; setRunning(false); setResult(value);
      duel.reportTests(value.totalCount ? Math.round(value.passedCount / value.totalCount * 100) : 0);
    };
    runner.onmessage = event => finish(event.data);
    runner.onerror = () => finish({ status: 'Error', message: 'The code runner could not start. Please try again.', passedCount: 0, totalCount: problem.testCases.length, stdout: [], executionTimeMs: 0 });
    deadline.current = setTimeout(() => finish({ status: 'Error', message: 'Time limit exceeded (3 seconds). Check for an infinite loop.', passedCount: 0, totalCount: problem.testCases.length, stdout: [], executionTimeMs: 3000 }), 3000);
    runner.postMessage({ code: state.code, problem });
  };
  return <section className="pvp-workspace" aria-label="Duel workspace"><div className="pvp-battle-top"><div className="pvp-player blue"><span>You · Player {state.role === 'host' ? '1' : '2'}</span><strong>{state.progress}%</strong><progress max={100} value={state.progress}/></div><div className="pvp-timer"><Clock3 size={16}/>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}<small>Room {state.room}</small></div><div className="pvp-player red"><span>Opponent · Player {state.role === 'host' ? '2' : '1'}</span><strong>{state.opponentProgress}%</strong><progress max={100} value={state.opponentProgress}/></div></div>
  <div className="pvp-battle-columns"><article className="pvp-problem"><span className="pvp-eyebrow">SHARED CHALLENGE · JAVASCRIPT</span><h2>{problem.title}</h2><span className="pvp-difficulty">{problem.difficulty}</span><p>{problem.description}</p><p className="pvp-runner-note">This challenge's runner represents linked lists as integer arrays. Return the reversed array.</p><h3>Examples</h3>{problem.examples.map((example, i) => <div className="pvp-example" key={i}><code>Input: {example.input}<br/>Output: {example.output}</code></div>)}<h3>Constraints</h3><ul>{problem.constraints.map((constraint, i) => <li key={i}>{constraint}</li>)}</ul><div className="pvp-sabotage"><div><Snowflake size={19}/><strong>Freeze Keyboard</strong><span>3 seconds · 15s cooldown</span></div><p>Temporarily freeze your opponent's editor.</p><button className="pvp-secondary" onClick={duel.freeze} disabled={Boolean(cooldown || frozen || review || state.phase !== 'playing')}><Zap size={15}/>{cooldown ? `Cooldown · ${cooldown}s` : 'Deploy Freeze'}</button></div></article>
  <div className="pvp-editor-panel"><div className="pvp-editor-tabs"><button className={!opponent ? 'active' : ''} onClick={() => setOpponent(false)}>Your solution</button><button className={opponent ? 'active' : ''} onClick={() => setOpponent(true)}>Opponent · Live view</button><span>JavaScript</span></div><div className="pvp-editor"><Editor height="100%" language="javascript" theme="alvio-duel" beforeMount={editor => editor.editor.defineTheme('alvio-duel', { base: 'vs-dark', inherit: true, rules: [], colors: { 'editor.background': '#07101d', 'editor.lineHighlightBackground': '#111d31', 'editorLineNumber.foreground': '#52627d', 'editor.selectionBackground': '#7657ff40' } })} value={opponent ? state.opponentCode : state.code} onChange={value => { if (!opponent) duel.updateCode(value || ''); }} options={{ ariaLabel: opponent ? 'Opponent JavaScript solution' : 'Your JavaScript solution', readOnly: opponent || Boolean(frozen) || running || review || state.phase !== 'playing', minimap: { enabled: false }, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', padding: { top: 18 }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2 }}/>{frozen > 0 && !opponent && <div className="pvp-freeze-overlay" role="status"><Snowflake size={30}/><strong>Keyboard frozen</strong><span>{frozen}s remaining</span></div>}</div><div className="pvp-console"><div><strong>Test results</strong>{review ? <button className="pvp-secondary" onClick={onResult}><ArrowLeft size={14}/>Match result</button> : <button className="pvp-primary" onClick={run} disabled={Boolean(running || frozen || state.phase !== 'playing')}><Play size={14}/>{running ? 'Running tests…' : 'Run & Submit'}</button>}</div><div role="status" className="pvp-test-output">{result ? <><strong className={result.status === 'Passed' ? 'passed' : 'failed'}>{result.status} · {result.passedCount}/{result.totalCount} tests passed · {result.executionTimeMs}ms</strong><pre>{result.message || 'All test cases passed.'}{result.stdout.length ? '\n'+result.stdout.join('\n') : ''}</pre></> : <p>{review ? `${state.progress}% of tests passed in this duel.` : 'Run your solution against the shared problem’s test cases.'}</p>}</div></div></div></div>
  {state.phase === 'disconnected' && <div className="pvp-disconnected" role="alert"><ShieldAlert size={29}/><h2>Opponent disconnected</h2><p>{state.error}</p><button className="pvp-primary" onClick={duel.leave}>Return to PvP Hub</button></div>}</section>;
}
