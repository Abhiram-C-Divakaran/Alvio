export default function AuthSocialOptions() {
  return <div className="auth-social">
    <div className="auth-divider"><span />OR<span /></div>
    <button type="button" className="auth-social-button" disabled aria-describedby="auth-social-status">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.31 2.98-7.36Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.12H3.04v2.59A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.49H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.51l3.35-2.59Z" />
        <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.59C7.18 7.72 9.39 5.96 12 5.96Z" />
      </svg>
      Continue with Google
    </button>
    <button type="button" className="auth-social-button" disabled aria-describedby="auth-social-status">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.31c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
      </svg>
      Continue with GitHub
    </button>
    <p id="auth-social-status">Social sign-in is not available yet. Use email above.</p>
  </div>;
}
