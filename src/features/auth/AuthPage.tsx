import { confirmEmailVerification, confirmPasswordReset, login, requestPasswordReset, signup } from '../../services/authApi';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Mail, LockKeyhole, UserRound, LoaderCircle, X } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import Logo from '../../components/ui/Logo';
import { bootstrapSession } from '../../services/sessionBootstrap';
import AuthArtwork from './AuthArtwork';
import AuthSocialOptions from './AuthSocialOptions';
import { authDestination } from './authDestination';
import './auth.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const isSignup = tab === 'signup';
  const resetToken = searchParams.get('resetToken') || '';
  const verifyToken = searchParams.get('verifyToken') || '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const recoveryDialog = useRef<HTMLDialogElement>(null);
  const { setUser, setError, error, isLoading, setLoading } = useAuthStore();
  const stateFrom = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const requestedDestination = stateFrom?.pathname
    ? `${stateFrom.pathname}${stateFrom.search ?? ''}${stateFrom.hash ?? ''}`
    : searchParams.get('next');
  const from = authDestination(requestedDestination, window.location.origin);
  const switchParams = new URLSearchParams(location.search);
  switchParams.delete('resetToken');
  switchParams.delete('verifyToken');
  switchParams.set('mode', isSignup ? 'login' : 'signup');
  switchParams.set('next', from);

  useEffect(() => {
    if (useAuthStore.getState().error !== 'Your session expired. Sign in to continue.') setError(null);
    setPassword('');
    setShowPassword(false);
  }, [tab, setError]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${resetToken ? 'Reset password' : isSignup ? 'Create account' : 'Sign in'} — Alvio Academy`;
    return () => { document.title = previousTitle; };
  }, [isSignup, resetToken]);

  useEffect(() => {
    if (!verifyToken) return;
    let active = true;
    void confirmEmailVerification(verifyToken)
      .then(() => { if (active) setActionBanner('Your email has been verified. You can sign in below.'); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Verification link is invalid or expired.'); });
    return () => { active = false; };
  }, [verifyToken, setError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const credentials = { email: email.trim(), password };
      const data = await (isSignup ? signup({ ...credentials, name: name.trim() }) : login(credentials));
      setUser(data.user, data.token);
      await bootstrapSession();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecoveryRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recoveryEmail.trim() || recoveryBusy) return;
    setRecoveryBusy(true);
    setRecoveryStatus(null);
    try {
      const res = await requestPasswordReset(recoveryEmail.trim());
      setRecoveryStatus(res.message);
    } catch (err: unknown) {
      setRecoveryStatus(err instanceof Error ? err.message : 'Unable to send reset link right now.');
    } finally {
      setRecoveryBusy(false);
    }
  }

  async function handleConfirmReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetToken || !resetPasswordInput || isLoading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await confirmPasswordReset(resetToken, resetPasswordInput);
      setActionBanner(res.message);
      setResetPasswordInput('');
      navigate('/auth?mode=login', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="alvio-auth">
    <section className="auth-panel" aria-labelledby="auth-title">
      <div className="auth-panel-inner">
        <Link to="/" className="auth-brand" aria-label="Alvio Academy home">
          <Logo variant="academy" className="auth-logo" />
          <span><strong>Alvio Academy</strong><small>Learn. Solve. Build. Grow.</small></span>
        </Link>
        <div className="auth-form-area">
          <Link to="/" className="auth-back"><ArrowLeft size={17} />Back to Alvio</Link>
          <div className="auth-heading" key={resetToken ? 'reset' : tab}>
            <h1 id="auth-title">{resetToken ? <>Reset <span>password</span></> : isSignup ? <>Join <span>Alvio</span></> : <>Welcome <span>back</span></>}</h1>
            <p>{resetToken ? 'Choose a new password for your Alvio account.' : isSignup ? 'Start building stronger problem-solving skills.' : 'Continue building your problem-solving skills.'}</p>
          </div>
          {actionBanner && <p className="auth-reassurance" role="status">{actionBanner}</p>}
          {resetToken ? (
            <form className="auth-form" onSubmit={handleConfirmReset} aria-busy={isLoading}>
              <div className="auth-field">
                <label htmlFor="auth-reset-password">New password</label>
                <div className="auth-input"><LockKeyhole size={19} aria-hidden="true" /><input id="auth-reset-password" name="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter a new password (8+ chars)" value={resetPasswordInput} onChange={e => setResetPasswordInput(e.target.value)} required minLength={8} disabled={isLoading} /></div>
              </div>
              {error && <p ref={errorRef} id="auth-error" className="auth-error" role="alert" tabIndex={-1}><AlertCircle size={16} /><span>{error}</span></p>}
              <button className="auth-submit" type="submit" disabled={isLoading}>{isLoading ? 'Updating password…' : 'Update password'}<ArrowRight size={19} /></button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} aria-busy={isLoading}>
              {isSignup && <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <div className="auth-input"><UserRound size={20} aria-hidden="true" /><input id="auth-name" name="name" autoComplete="name" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required disabled={isLoading} /></div>
              </div>}
              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <div className="auth-input"><Mail size={20} aria-hidden="true" /><input id="auth-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} aria-describedby={error ? 'auth-error' : undefined} /></div>
              </div>
              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <div className="auth-input"><LockKeyhole size={19} aria-hidden="true" /><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Create your password' : 'Enter your password'} value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} aria-describedby={error ? 'auth-error' : undefined} /><button className="auth-visibility" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
              </div>
              {!isSignup && <button className="auth-forgot" type="button" onClick={() => { setRecoveryStatus(null); recoveryDialog.current?.showModal(); }}>Forgot password?</button>}
              {error && <p ref={errorRef} id="auth-error" className="auth-error" role="alert" tabIndex={-1}><AlertCircle size={16} /><span>{error}</span></p>}
              <button className="auth-submit" type="submit" disabled={isLoading}>{isLoading ? <><LoaderCircle size={18} />{isSignup ? 'Creating your account…' : 'Signing in…'}</> : <>{isSignup ? 'Create account' : 'Sign in'}<ArrowRight size={19} /></>}</button>
            </form>
          )}
          <AuthSocialOptions />
          <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to Alvio?'} <Link to={{ pathname: '/auth', search: `?${switchParams}` }} state={location.state}>{isSignup ? 'Sign in' : 'Create an account'}</Link></p>
        </div>
        <p className="auth-reassurance"><LockKeyhole size={15} />Your account keeps your learning progress in one place.</p>
      </div>
    </section>
    <AuthArtwork />
    <dialog ref={recoveryDialog} className="auth-recovery" aria-labelledby="auth-recovery-title" onClick={e => { if (e.target === recoveryDialog.current) recoveryDialog.current?.close(); }}>
      <button className="auth-dialog-close" type="button" aria-label="Close password help" onClick={() => recoveryDialog.current?.close()}><X size={20} /></button>
      <LockKeyhole size={26} />
      <h2 id="auth-recovery-title">Need help signing in?</h2>
      <p>Enter your account email to request a single-use password reset link when email delivery is configured on this server.</p>
      <form className="auth-form" onSubmit={handleRecoveryRequest}>
        <div className="auth-field">
          <label htmlFor="auth-recovery-email">Account email</label>
          <div className="auth-input"><Mail size={18} aria-hidden="true" /><input id="auth-recovery-email" type="email" placeholder="you@example.com" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required disabled={recoveryBusy} /></div>
        </div>
        {recoveryStatus && <p role="status">{recoveryStatus}</p>}
        <button className="auth-submit" type="submit" disabled={recoveryBusy}>{recoveryBusy ? 'Sending…' : 'Send reset link'}<ArrowRight size={17} /></button>
      </form>
      <button className="auth-forgot" type="button" onClick={() => recoveryDialog.current?.close()}>Back to sign in</button>
    </dialog>
  </main>;
}
