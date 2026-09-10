import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import useProgressStore from '../../stores/useProgressStore';
import { restoreSessionProgress } from '../../services/sessionProgress';
import { progressData, type PracticeActivity } from './progressModel';
import { ProgressHero, GrowthScore, ProgressSummaryCards } from './ProgressOverview';
import { WeeklyMomentum, LearningPath, SkillFocus, PracticeHeatmap, NextBestActions } from './ProgressDetails';
import './progress.css';

export default function ProgressPage() {
  const userId = useAuthStore(s => String(s.user?.id || 'guest'));
  const token = useAuthStore(s => s.token);
  const { progress, stats } = useProgressStore();
  const [practice, setPractice] = useState<PracticeActivity[]>([]);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const ready = progress?.userId === userId;
  useEffect(() => {
    if (!ready) restoreSessionProgress(userId).catch(() => setError('Could not load your learning progress. Please retry.'));
  }, [userId, ready, retry]);
  useEffect(() => {
    setPractice([]); setError('');
    if (!token) return;
    const abort = new AbortController();
    fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` }, signal: abort.signal }).then(async response => {
      if (!response.ok) throw new Error('Practice activity could not be loaded. Your saved learning progress is still shown.');
      const profile = await response.json();
      if (profile.practiceActivity) setPractice(profile.practiceActivity);
      else setPractice((profile.solvedProblems || []).map((p: { solved_at: string }) => ({ recordedAt: p.solved_at.replace(' ', 'T') + (p.solved_at.endsWith('Z') ? '' : 'Z'), attempts: 1 })));
    }).catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => abort.abort();
  }, [token, retry]);
  if (!ready || !progress) return <div className="progress-page"><p role="status">{error || 'Loading your learning progress…'}</p>{error && <button onClick={() => { setError(''); setRetry(n => n + 1); }}>Retry</button>}</div>;
  const data = progressData(progress, stats, practice);
  return <div className="progress-page">
    <header className="pg-page-header"><div><h1>Progress Command Center</h1><p>See your growth, identify weak areas, and plan your next learning sprint.</p></div><blockquote>“Better skills. A brighter you.”<cite>— Alvio</cite></blockquote></header>
    {error && <div className="pg-notice" role="status">{error}<button onClick={() => setRetry(n => n + 1)}>Retry</button></div>}
    <div className="pg-overview"><ProgressHero data={data}/><GrowthScore data={data}/><ProgressSummaryCards data={data}/></div>
    <div className="pg-middle"><WeeklyMomentum data={data}/><LearningPath data={data}/></div>
    <div className="pg-bottom"><SkillFocus data={data}/><PracticeHeatmap data={data}/><NextBestActions data={data}/></div>
    <footer className="pg-footer"><Sparkles size={12}/>“Discipline today. Opportunities tomorrow.” — Alvio Academy</footer>
  </div>;
}
