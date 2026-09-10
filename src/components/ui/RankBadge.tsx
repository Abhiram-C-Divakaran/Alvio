
interface RankBadgeProps {
  level: string;
  size?: number;
  className?: string;
}

export default function RankBadge({ level, size = 32, className = '' }: RankBadgeProps) {
  // Determine gradient, emblem, and color details based on the PUBG level name
  let gradientId = 'bronze-grad';
  let stopColor1 = '#b45309'; // Amber/Bronze
  let stopColor2 = '#78350f';
  let stars = 1;
  let hasWings = false;
  let coreColor = '#fbbf24';

  if (level.includes('Bronze')) {
    gradientId = 'bronze-grad';
    stopColor1 = '#ca8a04';
    stopColor2 = '#854d0e';
    stars = level.includes('V') ? 1 : level.includes('IV') ? 2 : 3;
    hasWings = false;
    coreColor = '#eab308';
  } else if (level.includes('Silver')) {
    gradientId = 'silver-grad';
    stopColor1 = '#94a3b8';
    stopColor2 = '#475569';
    stars = level.includes('V') ? 1 : 3;
    hasWings = false;
    coreColor = '#cbd5e1';
  } else if (level.includes('Gold')) {
    gradientId = 'gold-grad';
    stopColor1 = '#eab308';
    stopColor2 = '#ca8a04';
    stars = level.includes('V') ? 2 : 4;
    hasWings = true;
    coreColor = '#facc15';
  } else if (level.includes('Platinum')) {
    gradientId = 'plat-grad';
    stopColor1 = '#38bdf8';
    stopColor2 = '#0284c7';
    stars = level.includes('V') ? 3 : 5;
    hasWings = true;
    coreColor = '#e0f2fe';
  } else if (level.includes('Diamond')) {
    gradientId = 'diamond-grad';
    stopColor1 = '#a855f7';
    stopColor2 = '#7e22ce';
    stars = 5;
    hasWings = true;
    coreColor = '#f3e8ff';
  } else if (level === 'Crown') {
    gradientId = 'crown-grad';
    stopColor1 = '#fb7185';
    stopColor2 = '#e11d48';
    stars = 5;
    hasWings = true;
    coreColor = '#ffe4e6';
  } else if (level === 'Ace') {
    gradientId = 'ace-grad';
    stopColor1 = '#f43f5e';
    stopColor2 = '#9f1239';
    stars = 5;
    hasWings = true;
    coreColor = '#fecdd3';
  } else if (level === 'Conqueror') {
    gradientId = 'conqueror-grad';
    stopColor1 = '#facc15';
    stopColor2 = '#b45309';
    stars = 5;
    hasWings = true;
    coreColor = '#fffbeb';
  }

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`inline-block select-none ${className}`}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stopColor1} />
          <stop offset="100%" stopColor={stopColor2} />
        </linearGradient>
        <radialGradient id="gold-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={coreColor} />
          <stop offset="100%" stopColor={stopColor2} />
        </radialGradient>
      </defs>

      {/* Decorative Wings for high ranks */}
      {hasWings && (
        <g stroke={stopColor1} strokeWidth="2" fill="none">
          {/* Left wing */}
          <path d="M 30,50 C 15,35 10,60 25,75 C 18,55 20,40 32,55" strokeWidth="3" />
          <path d="M 25,50 C 10,40 5,65 20,80" />
          {/* Right wing */}
          <path d="M 70,50 C 85,35 90,60 75,75 C 82,55 80,40 68,55" strokeWidth="3" />
          <path d="M 75,50 C 90,40 95,65 80,80" />
        </g>
      )}

      {/* Shield Base */}
      <path 
        d="M 50,15 L 75,25 L 75,55 C 75,75 50,88 50,88 C 50,88 25,75 25,55 L 25,25 Z" 
        fill={`url(#${gradientId})`} 
        stroke={coreColor}
        strokeWidth="3.5"
      />

      {/* Core Emblem / Star / Cross details */}
      {level.includes('Diamond') || level === 'Crown' ? (
        // Gem shape
        <polygon 
          points="50,28 65,42 50,72 35,42" 
          fill="url(#gold-core)" 
          stroke={coreColor} 
          strokeWidth="1.5" 
        />
      ) : level === 'Ace' || level === 'Conqueror' ? (
        // Elite Sunburst / Crossed swords
        <g>
          <path d="M 35,35 L 65,65 M 65,35 L 35,65" stroke={coreColor} strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="50" r="16" fill="url(#gold-core)" stroke={coreColor} strokeWidth="2" />
        </g>
      ) : (
        // Standard shield core
        <circle cx="50" cy="50" r="14" fill="url(#gold-core)" stroke={coreColor} strokeWidth="1.5" />
      )}

      {/* Level stars */}
      <g fill={coreColor}>
        {stars >= 1 && <polygon points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43" />}
        {stars >= 2 && <polygon points="36,44 38,48 42,48 39,51 40,55 36,52 32,55 34,51 31,48 35,48" />}
        {stars >= 3 && <polygon points="64,44 66,48 70,48 67,51 68,55 64,52 60,55 62,51 59,48 63,48" />}
        {stars >= 4 && <polygon points="50,56 52,60 56,60 53,63 54,67 50,65 46,67 47,63 44,60 48,60" />}
      </g>
    </svg>
  );
}
