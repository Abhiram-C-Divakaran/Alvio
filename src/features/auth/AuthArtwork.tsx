export default function AuthArtwork() {
  return <aside className="auth-artwork" aria-label="Build your skills with Alvio">
    <picture>
      <source srcSet="/auth/coder-800.webp 800w, /auth/coder-1241.webp 1241w" sizes="(max-width: 767px) 100vw, 64.5vw" />
      <img src="/auth/coder-1241.webp" width="1241" height="1268" alt="A student coding in a violet-lit room overlooking the city" fetchPriority="high" />
    </picture>
    {/* The supplied artwork includes this copy. Keep an accessible text equivalent without a duplicate visual overlay. */}
    <div className="auth-artwork-content">
      <h2>Build skills that stay with you.</h2>
      <p>Learn concepts visually, practice them immediately, and see your progress improve over time.</p>
      <ul><li>Interactive DSA Learning</li><li>Real Coding Practice</li><li>AI-Powered Guidance</li></ul>
      <p>A small step today, a brighter tomorrow.</p>
    </div>
  </aside>;
}
