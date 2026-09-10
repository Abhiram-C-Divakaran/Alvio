
export default function Logo({ className = "w-10 h-10", variant }: { className?: string; variant?: 'academy' }) {
  if (variant === 'academy') return <svg viewBox="0 0 44 40" className={className} aria-hidden="true"><path d="M22 2 44 35H29L22 24 14 35H0Z" fill="#7254f5"/><path d="m22 2 7 10-7 5-7-5Z" fill="#d1c4ff"/><path d="m15 12 7 5-8 18H0Z" fill="#a18aff"/><path d="m22 24 7 11H14Z" fill="#101627"/></svg>;
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#1F2937" />
      
      {/* Neon Green Code Lines */}
      <line x1="15" y1="25" x2="35" y2="25" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 4" />
      <line x1="15" y1="35" x2="45" y2="35" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="12 4 4" />
      <line x1="15" y1="45" x2="30" y2="45" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
      <line x1="15" y1="55" x2="25" y2="55" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="10" />
      
      <line x1="65" y1="25" x2="85" y2="25" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="10 4" />
      <line x1="55" y1="35" x2="85" y2="35" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6 15" />
      <line x1="70" y1="45" x2="85" y2="45" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
      <line x1="75" y1="55" x2="85" y2="55" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="10" />

      {/* Girl - Back Hair */}
      <path d="M 28,50 C 28,20 72,20 72,50 C 72,65 68,70 65,70 C 62,70 62,60 62,60 C 50,60 50,60 38,60 C 38,60 38,70 35,70 C 32,70 28,65 28,50 Z" fill="#78350F" />
      
      {/* Hoodie Back */}
      <path d="M 30,100 C 30,70 70,70 70,100 Z" fill="#F472B6" />
      
      {/* Face */}
      <rect x="33" y="30" width="34" height="32" rx="14" fill="#FDE68A" />
      
      {/* Hair Bangs */}
      <path d="M 30,40 C 40,42 60,42 70,40 C 70,25 30,25 30,40 Z" fill="#78350F" />
      
      {/* Side Hair (Bob) */}
      <path d="M 28,40 C 25,65 33,68 33,68 L 35,40 Z" fill="#78350F" />
      <path d="M 72,40 C 75,65 67,68 67,68 L 65,40 Z" fill="#78350F" />

      {/* Glasses */}
      <rect x="37" y="42" width="10" height="8" rx="2" fill="none" stroke="#1E3A8A" strokeWidth="2.5" />
      <rect x="53" y="42" width="10" height="8" rx="2" fill="none" stroke="#1E3A8A" strokeWidth="2.5" />
      <line x1="47" y1="46" x2="53" y2="46" stroke="#1E3A8A" strokeWidth="2.5" />
      
      {/* Eyes */}
      <circle cx="42" cy="46" r="1.5" fill="#1E3A8A" />
      <circle cx="58" cy="46" r="1.5" fill="#1E3A8A" />
      
      {/* Smile */}
      <path d="M 47,54 Q 50,57 53,54" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" />

      {/* Hoodie Front Collar */}
      <path d="M 42,62 L 50,68 L 58,62" fill="none" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Laptop (Silver) */}
      <path d="M 25,75 L 75,75 L 78,100 L 22,100 Z" fill="#E2E8F0" />
      <path d="M 25,75 L 75,75 L 75,78 L 25,78 Z" fill="#CBD5E1" />
      
      {/* Red Sticker */}
      <circle cx="50" cy="87" r="7" fill="#EF4444" />
      <text x="50" y="89.5" fontSize="6" fill="#FFFFFF" fontWeight="bold" fontFamily="monospace" textAnchor="middle">&lt;/&gt;</text>
    </svg>
  );
}
