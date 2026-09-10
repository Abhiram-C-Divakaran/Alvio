import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChartNoAxesColumnIncreasing, Copy, Cpu, Gamepad2, Swords, Trophy, Users, X, Zap } from 'lucide-react';
import type { DuelController } from './useDuel';

export function PvPHeader({ count, onBack }: { count: number | null; onBack: () => void }) {
  return <header className="pvp-header"><div className="pvp-header-left"><button className="pvp-back" onClick={onBack}><ArrowLeft size={14}/>Back to Practice</button><div><h1>PvP Coding <em>Duel</em><Swords size={24}/></h1><p>REAL-TIME 1V1 MULTIPLAYER</p></div></div>{count !== null && <div className="pvp-live"><Users size={21}/><div>Live Players<span><i/>{count} in this browser</span></div></div>}</header>;
}
export function PvPHero({ onHost, onJoin, loading }: { onHost: () => void; onJoin: () => void; loading: boolean }) {
  return <section className="pvp-hero"><div className="pvp-artwork" aria-hidden="true"/><div className="pvp-hero-copy"><h2>Real-Time 1v1 <em>Coding Duel</em></h2><p>Open this app in two separate windows side-by-side. One player will <strong>Host</strong><br className="pvp-desktop-break"/> and the other will <strong>Join</strong>. Race to complete the algorithmic challenge, and use<br className="pvp-desktop-break"/> sabotages to freeze your opponent's keyboard!</p></div><div className="pvp-actions" id="duel-actions"><button className="pvp-match-button host" onClick={onHost} disabled={loading}><Cpu size={22}/><span>{loading ? 'CREATING ROOM…' : 'HOST MATCH'}<small>Create a room & share code</small></span></button><button className="pvp-match-button join" onClick={onJoin} disabled={loading}><Users size={22}/><span>JOIN MATCH<small>Enter a room code</small></span></button></div></section>;
}
const features = [
  { title: 'Real-Time Battle', description: 'Solve the same problem at the same time.', Icon: Zap, color: 'red' },
  { title: 'Use Sabotages', description: 'Trigger fun attacks to slow your opponent.', Icon: Gamepad2, color: 'green' },
  { title: 'Track Performance', description: "See who's faster, smarter, and stronger.", Icon: ChartNoAxesColumnIncreasing, color: 'blue' },
  { title: 'Climb the Leaderboard', description: "Explore Alvio's top learners and keep improving.", Icon: Users, color: 'violet' },
];
export function PvPFeatureGrid({ onLeaderboard }: { onLeaderboard: () => void }) {
  return <section className="pvp-features" aria-label="Duel features">{features.map(({ title, description, Icon, color }, i) => <article className={`pvp-feature ${color}`} key={title}><span className="pvp-feature-icon"><Icon size={27}/></span><h3>{i === 3 ? <button onClick={onLeaderboard}>{title}</button> : title}</h3><p>{description}</p></article>)}</section>;
}
export function PvPDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement as HTMLElement | null; dialog.showModal(); return () => { dialog.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className="pvp-modal" aria-labelledby="pvp-dialog-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose(); } }}><div className="pvp-modal-top"><span className="pvp-modal-symbol"><Swords size={25}/></span><button onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div><h2 id="pvp-dialog-title">{title}</h2>{children}</dialog>;
}
export function HostRoomModal({ duel }: { duel: DuelController }) {
  const [copyStatus, setCopyStatus] = useState('');
  return <PvPDialog title="Room created" onClose={duel.leave}><p className="pvp-modal-description">Share this code with your opponent.</p><div className="pvp-room-code" aria-label="Room code">{duel.state.room}</div><button className="pvp-primary pvp-copy" onClick={async () => { try { await navigator.clipboard.writeText(duel.state.room); setCopyStatus('Code copied'); } catch { setCopyStatus('Select the room code above to copy it manually.'); } }}><Copy size={16}/>Copy Code</button><p className="pvp-copy-status" role="status">{copyStatus}</p><div className="pvp-connection" role="status"><i/>Waiting for opponent…</div><p className="pvp-local-note">Open Alvio in another window of this browser, then choose Join Match. This is a local practice duel; ranked rewards are not enabled.</p><button className="pvp-secondary pvp-wide" onClick={duel.leave}>Cancel room</button></PvPDialog>;
}
export function JoinRoomModal({ duel, onClose }: { duel: DuelController; onClose: () => void }) {
  const [code, setCode] = useState(duel.state.room);
  const connecting = duel.state.phase === 'joining' && !duel.error;
  return <PvPDialog title="Join Match" onClose={onClose}><p className="pvp-modal-description">Enter the code shared by your opponent.</p><form onSubmit={e => { e.preventDefault(); duel.join(code); }}><label className="pvp-room-label" htmlFor="pvp-room-input">Room Code</label><input id="pvp-room-input" className="pvp-room-input" autoFocus value={code} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={6} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABCD23" aria-invalid={Boolean(duel.error)} aria-describedby={duel.error ? 'pvp-join-error' : 'pvp-join-help'} disabled={connecting}/>{duel.error && <p id="pvp-join-error" className="pvp-inline-error" role="alert">{duel.error}</p>}<button className="pvp-primary pvp-wide" disabled={connecting} type="submit">{connecting ? 'Connecting to host…' : 'Join Duel'}<ArrowRight size={16}/></button></form><p id="pvp-join-help" className="pvp-local-note">Both players must use separate windows of the same browser on this device. Room codes are valid while the host is waiting.</p></PvPDialog>;
}
export function AcademyLeaderboard({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<{ name: string; xp: number }[]>([]);
  const [status, setStatus] = useState('Loading leaderboard…');
  const [retry, setRetry] = useState(0);
  useEffect(() => { const controller = new AbortController(); setStatus('Loading leaderboard…'); fetch('/api/leaderboard', { signal: controller.signal }).then(async r => { if (!r.ok) throw new Error('Unable to load the leaderboard.'); const rows = await r.json(); setEntries(rows); setStatus(rows.length ? '' : 'No ranked learners yet.'); }).catch(e => { if (e.name !== 'AbortError') setStatus(e.message); }); return () => controller.abort(); }, [retry]);
  return <PvPDialog title="Academy Leaderboard" onClose={onClose}><p className="pvp-modal-description">Alvio's top learners, ranked by earned XP.</p>{status && <p role="status">{status}</p>}{status.startsWith('Unable') && <button className="pvp-secondary" onClick={() => setRetry(n => n + 1)}>Retry</button>}<ol className="pvp-leaderboard">{entries.map((entry, index) => <li key={`${entry.name}-${index}`}><span>{index + 1}</span><strong>{entry.name}</strong><span>{entry.xp.toLocaleString()} XP</span></li>)}</ol><p className="pvp-local-note">Local practice duels do not award ranked XP or PvP ratings.</p><Link to="/progress" className="pvp-secondary">View your progress<ArrowRight size={15}/></Link></PvPDialog>;
}
export function PvPResult({ duel, onReview }: { duel: DuelController; onReview: () => void }) {
  const won = duel.state.winner === duel.state.client;
  return <section className={`pvp-result ${won ? 'victory' : ''}`}><span className="pvp-result-icon"><Trophy size={42}/></span><p className="pvp-eyebrow">MATCH COMPLETE</p><h2>{won ? 'Victory' : 'Duel Complete'}</h2><p>{won ? 'You solved the problem first.' : 'Your opponent finished first. Review your solution and try again.'}</p><div className="pvp-result-score"><span>You <strong>{duel.state.progress}%</strong></span><span>Opponent <strong>{duel.state.opponentProgress}%</strong></span></div><div className="pvp-result-actions"><button className="pvp-primary" onClick={onReview}>Review solution</button><button className="pvp-secondary" onClick={duel.leave}>Play Again</button><Link className="pvp-secondary" to="/coding" onClick={duel.leave}>Back to Practice</Link></div><small>Local practice duel · No ranked rewards</small></section>;
}
