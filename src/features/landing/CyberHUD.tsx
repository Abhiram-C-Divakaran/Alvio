import { motion } from 'framer-motion';

export default function CyberHUD() {
  return (
    <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
      {/* Central glow */}
      <div className="absolute inset-0 bg-fuchsia-500/20 blur-[100px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-[0_0_30px_10px_rgba(255,255,255,0.8)] rounded-full z-10" />

      {/* Rotating concentric circles */}
      <motion.svg
        viewBox="0 0 500 500"
        className="w-full h-full absolute z-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <circle cx="250" cy="250" r="120" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeDasharray="10 20" />
        <circle cx="250" cy="250" r="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Arc segments */}
        <path d="M 250 80 A 170 170 0 0 1 420 250" fill="none" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" />
        <path d="M 80 250 A 170 170 0 0 0 250 420" fill="none" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 8" />
        
        {/* Outer dashed ring */}
        <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="2 12" />
      </motion.svg>

      {/* Counter rotating elements */}
      <motion.svg
        viewBox="0 0 500 500"
        className="w-full h-full absolute z-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeDasharray="50 100" />
        
        {/* Thick purple blocks */}
        <path d="M 250 30 A 220 220 0 0 1 360 60" fill="none" stroke="#a855f7" strokeWidth="25" strokeDasharray="15 10" />
        <path d="M 60 360 A 220 220 0 0 1 120 440" fill="none" stroke="#8b5cf6" strokeWidth="25" strokeDasharray="20 15" />
      </motion.svg>

      {/* Radial spikes */}
      <motion.svg
        viewBox="0 0 500 500"
        className="w-full h-full absolute z-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <line x1="250" y1="250" x2="250" y2="10" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
        <line x1="250" y1="250" x2="480" y2="180" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        <line x1="250" y1="250" x2="420" y2="450" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        <line x1="250" y1="250" x2="80" y2="420" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        <line x1="250" y1="250" x2="20" y2="150" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      </motion.svg>
    </div>
  );
}
