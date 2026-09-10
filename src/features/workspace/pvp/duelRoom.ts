import type { CodingProblem } from '../../../data/codingProblems';

export type DuelPhase = 'lobby' | 'hosting' | 'joining' | 'playing' | 'ended' | 'disconnected';
export interface DuelSnapshot {
  phase: DuelPhase;
  room: string;
  client: string;
  role: 'host' | 'guest';
  peer: string | null;
  problem: CodingProblem | null;
  code: string;
  opponentCode: string;
  progress: number;
  opponentProgress: number;
  winner: string | null;
  startedAt: number;
  cooldownUntil: number;
  frozenUntil: number;
  error: string;
  reconnectable: boolean;
}
export const sessionKey = 'alvio-duel-session-v1';
export const roomPattern = /^[A-HJ-NP-Z2-9]{6}$/;
export function createRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), n => alphabet[n % alphabet.length]).join('');
}
export function initialDuel(): DuelSnapshot {
  return { phase: 'lobby', room: '', client: crypto.randomUUID(), role: 'host', peer: null, problem: null, code: '', opponentCode: '', progress: 0, opponentProgress: 0, winner: null, startedAt: 0, cooldownUntil: 0, frozenUntil: 0, error: '', reconnectable: true };
}
type Message = { type: string; from: string; target?: string; problem?: CodingProblem; startedAt?: number; code?: string; progress?: number; winner?: string | null };

/** The existing local BroadcastChannel transport, now isolated by room and stable for a whole match. */
export class DuelRoom {
  state: DuelSnapshot;
  private channel: BroadcastChannel;
  private timer: ReturnType<typeof setInterval>;
  private lastSeen = Date.now();
  private openedAt = Date.now();
  private lastFreeze = 0;
  private closed = false;
  private onChange: (state: DuelSnapshot) => void;

  constructor(state: DuelSnapshot, onChange: (state: DuelSnapshot) => void) {
    this.state = state;
    this.onChange = onChange;
    this.channel = new BroadcastChannel(`alvio-duel-${state.room}`);
    this.channel.onmessage = event => this.receive(event.data);
    this.timer = setInterval(() => this.tick(), 1000);
    this.tick();
  }
  private publish(update: Partial<DuelSnapshot>) {
    this.state = { ...this.state, ...update };
    this.onChange(this.state);
  }
  private send(message: Omit<Message, 'from'>) {
    if (!this.closed) this.channel.postMessage({ ...message, from: this.state.client });
  }
  private start(target: string) {
    this.send({ type: 'START', target, problem: this.state.problem!, startedAt: this.state.startedAt });
  }
  private tick() {
    const s = this.state;
    if (s.phase === 'joining' && !s.error) {
      if (Date.now() - this.openedAt > 6000) {
        this.publish({ error: 'Room not found. Check the code and try again.' });
      } else this.send({ type: 'JOIN' });
    }
    if (s.peer && s.reconnectable) {
      this.send({ type: 'PING', code: s.code, progress: s.progress, winner: s.role === 'host' ? s.winner : undefined });
      if (Date.now() - this.lastSeen > 7000 && s.phase === 'playing') {
        this.publish({ phase: 'disconnected', error: 'Connection interrupted. Waiting for your opponent to reconnect…' });
      }
    }
  }
  private receive(message: Message) {
    if (!message || typeof message !== 'object' || typeof message.from !== 'string' || message.from === this.state.client) return;
    if (message.target && message.target !== this.state.client) return;
    const s = this.state;
    if (message.type === 'JOIN' && s.role === 'host') {
      if (s.phase === 'hosting' && !s.peer) {
        this.lastSeen = Date.now();
        this.publish({ peer: message.from, phase: 'playing', startedAt: Date.now() });
        this.start(message.from);
      } else if (s.peer === message.from && s.reconnectable) this.start(message.from);
      else this.send({ type: 'FULL', target: message.from });
      return;
    }
    if (message.type === 'FULL' && s.phase === 'joining') {
      this.publish({ error: 'This room already has two players. Ask your friend for a new code.' });
      this.openedAt = 0;
      return;
    }
    if (message.type === 'START' && s.phase === 'joining' && message.problem?.id && message.problem.testCases?.length) {
      this.lastSeen = Date.now();
      this.publish({ phase: 'playing', peer: message.from, problem: message.problem, code: message.problem.starterCode.javascript, startedAt: message.startedAt || Date.now(), error: '' });
      this.tick();
      return;
    }
    if (message.from !== s.peer || !s.reconnectable) return;
    this.lastSeen = Date.now();
    if (message.type === 'PING') {
      const update: Partial<DuelSnapshot> = { opponentCode: message.code ?? s.opponentCode, opponentProgress: message.progress ?? s.opponentProgress };
      if (s.role === 'guest' && message.winner) { update.winner = message.winner; update.phase = 'ended'; }
      else if (s.phase === 'disconnected') { update.phase = s.winner ? 'ended' : 'playing'; update.error = ''; }
      this.publish(update);
    } else if (message.type === 'CODE' && s.phase !== 'ended') {
      this.publish({ opponentCode: message.code || '' });
    } else if (message.type === 'TESTS' && s.phase === 'playing') {
      const progress = Math.max(0, Math.min(100, Number(message.progress) || 0));
      this.publish({ opponentProgress: progress });
      if (s.role === 'host' && progress === 100) this.finish(message.from);
    } else if (message.type === 'RESULT' && s.role === 'guest' && message.winner) {
      this.publish({ phase: 'ended', winner: message.winner });
    } else if (message.type === 'FREEZE' && s.phase === 'playing' && Date.now() - this.lastFreeze >= 15000) {
      this.lastFreeze = Date.now();
      this.publish({ frozenUntil: Date.now() + 3000 });
    } else if (message.type === 'PAUSE' && s.phase === 'playing') {
      this.publish({ phase: 'disconnected', error: 'Connection interrupted. Waiting for your opponent to reconnect…' });
    } else if (message.type === 'LEAVE' && s.phase !== 'ended') {
      this.publish({ phase: 'disconnected', reconnectable: false, error: 'Your opponent left the match.' });
    }
  }
  updateCode(code: string) {
    if (this.state.phase !== 'playing' || this.state.frozenUntil > Date.now()) return;
    this.publish({ code });
    this.send({ type: 'CODE', code });
  }
  reportTests(progress: number) {
    // Freezing the keyboard must not discard a test run already in flight.
    if (this.state.phase !== 'playing') return;
    this.publish({ progress });
    this.send({ type: 'TESTS', progress });
    if (progress === 100 && this.state.role === 'host') this.finish(this.state.client);
  }
  private finish(winner: string) {
    if (this.state.winner) return;
    this.publish({ phase: 'ended', winner });
    this.send({ type: 'RESULT', winner });
  }
  freeze() {
    const s = this.state;
    if (s.phase !== 'playing' || s.cooldownUntil > Date.now() || s.frozenUntil > Date.now()) return;
    this.publish({ cooldownUntil: Date.now() + 15000 });
    this.send({ type: 'FREEZE' });
  }
  close(intentional = false) {
    if (this.closed) return;
    this.send({ type: intentional ? 'LEAVE' : 'PAUSE' });
    this.closed = true;
    clearInterval(this.timer);
    this.channel.close();
  }
}
