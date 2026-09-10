import { lazy, Suspense, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AcademyLeaderboard, HostRoomModal, JoinRoomModal, PvPFeatureGrid, PvPHeader, PvPHero, PvPResult } from './pvp/PvPComponents';
import { useDuel, useLivePlayers } from './pvp/useDuel';
import './pvp/pvp.css';
const PvPWorkspace = lazy(() => import('./pvp/PvPWorkspace'));

export default function PvPShowdown() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const duel = useDuel();
  const count = useLivePlayers();
  const [joining, setJoining] = useState(false);
  const [review, setReview] = useState(false);
  const { phase } = duel.state;
  useEffect(() => { if (phase === 'playing') setJoining(false); if (phase === 'lobby') setReview(false); }, [phase]);
  const board = params.get('view') === 'leaderboard';
  const setBoard = (open: boolean) => setParams(previous => { const next = new URLSearchParams(previous); if (open) next.set('view', 'leaderboard'); else next.delete('view'); return next; });
  return <div className="pvp-page"><PvPHeader count={count} onBack={() => { duel.leave(); navigate('/coding'); }}/>
    {(phase === 'playing' || phase === 'disconnected' || (phase === 'ended' && review)) && duel.state.problem ? <Suspense fallback={<div className="pvp-loading" role="status">Preparing your coding workspace…</div>}><PvPWorkspace duel={duel} review={review} onResult={() => setReview(false)}/></Suspense> : phase === 'ended' ? <PvPResult duel={duel} onReview={() => setReview(true)}/> : <><PvPHero onHost={duel.host} onJoin={() => setJoining(true)} loading={duel.loading}/>{duel.error && !joining && phase === 'lobby' && <p className="pvp-hub-error" role="alert">{duel.error}</p>}<PvPFeatureGrid onLeaderboard={() => setBoard(true)}/><blockquote className="pvp-quote">“Good developers challenge themselves. Great developers challenge others.”</blockquote></>}
    {phase === 'hosting' && <HostRoomModal duel={duel}/>}
    {(joining || phase === 'joining') && <JoinRoomModal duel={duel} onClose={() => { duel.leave(); setJoining(false); }}/>}
    {board && <AcademyLeaderboard onClose={() => setBoard(false)}/>}
  </div>;
}
