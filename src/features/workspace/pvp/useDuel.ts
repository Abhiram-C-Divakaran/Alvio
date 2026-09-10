import { useEffect, useRef, useState } from 'react';
import type { CodingProblem } from '../../../data/codingProblems';
import { createRoomCode, DuelRoom, initialDuel, roomPattern, sessionKey, type DuelSnapshot } from './duelRoom';

export function useDuel() {
  const [state, setState] = useState<DuelSnapshot>(initialDuel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const room = useRef<DuelRoom | null>(null);
  const request = useRef<AbortController | null>(null);
  const persist = (next: DuelSnapshot) => {
    setState(next);
    try { sessionStorage.setItem(sessionKey, JSON.stringify(next)); } catch { /* Play remains available when storage is full. */ }
  };
  useEffect(() => {
    try {
      const saved: DuelSnapshot = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
      // A duplicated tab inherits sessionStorage. Only a reload should resume a player;
      // a newly opened window must be free to join as the second player.
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (saved && navigation?.type === 'reload' && roomPattern.test(saved.room) && saved.client && saved.phase !== 'lobby') {
        persist(saved);
        room.current = new DuelRoom(saved, persist);
      } else sessionStorage.removeItem(sessionKey);
    } catch { sessionStorage.removeItem(sessionKey); }
    const pause = () => room.current?.close();
    window.addEventListener('pagehide', pause);
    return () => { window.removeEventListener('pagehide', pause); request.current?.abort(); room.current?.close(); room.current = null; };
  }, []);
  const leave = () => {
    request.current?.abort();
    room.current?.close(true);
    room.current = null;
    sessionStorage.removeItem(sessionKey);
    setState(initialDuel()); setError(''); setLoading(false);
  };
  const host = async () => {
    if (request.current && !request.current.signal.aborted) request.current.abort();
    const controller = new AbortController(); request.current = controller;
    setLoading(true); setError('');
    try {
      if (typeof BroadcastChannel === 'undefined') throw new Error('This browser does not support live duels. Try an up-to-date browser.');
      const response = await fetch('/api/problems/reverse-linked-list', { signal: controller.signal });
      if (!response.ok) throw new Error('The duel problem could not be loaded. Please try again.');
      const problem: CodingProblem = await response.json();
      if (!problem.testCases?.length || !problem.signature) throw new Error('This challenge is currently unavailable. Please try again later.');
      if (controller.signal.aborted) return;
      const next = { ...initialDuel(), phase: 'hosting' as const, room: createRoomCode(), problem, code: problem.starterCode.javascript };
      room.current?.close(true);
      persist(next); room.current = new DuelRoom(next, persist);
    } catch (e) { if (!controller.signal.aborted) setError((e as Error).message); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  };
  const join = (value: string) => {
    const code = value.trim().toUpperCase();
    if (!roomPattern.test(code)) { setError('Enter a valid 6-character room code.'); return; }
    if (typeof BroadcastChannel === 'undefined') { setError('This browser does not support live duels. Try an up-to-date browser.'); return; }
    setError(''); room.current?.close(true);
    const next = { ...initialDuel(), phase: 'joining' as const, role: 'guest' as const, room: code };
    persist(next); room.current = new DuelRoom(next, persist);
  };
  return { state, loading, error: error || state.error, host, join, leave, updateCode: (code: string) => room.current?.updateCode(code), reportTests: (progress: number) => room.current?.reportTests(progress), freeze: () => room.current?.freeze() };
}
export type DuelController = ReturnType<typeof useDuel>;

export function useLivePlayers() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const id = crypto.randomUUID(); const channel = new BroadcastChannel('alvio-duel-presence');
    const peers = new Map<string, number>();
    const publish = () => { for (const [peer, seen] of peers) if (Date.now() - seen > 7000) peers.delete(peer); setCount(peers.size + 1); };
    channel.onmessage = ({ data }) => {
      if (!data || data.id === id || typeof data.id !== 'string') return;
      if (data.type === 'LEAVE') peers.delete(data.id);
      else { peers.set(data.id, Date.now()); if (data.type === 'HELLO') channel.postMessage({ type: 'HERE', id }); }
      publish();
    };
    channel.postMessage({ type: 'HELLO', id }); publish();
    const timer = setInterval(() => { channel.postMessage({ type: 'HERE', id }); publish(); }, 2000);
    const leave = () => channel.postMessage({ type: 'LEAVE', id });
    window.addEventListener('pagehide', leave);
    return () => { window.removeEventListener('pagehide', leave); leave(); channel.close(); clearInterval(timer); };
  }, []);
  return count;
}
