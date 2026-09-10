import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RefreshCcw, Loader2, ChevronDown, CheckCircle2, Circle, Zap, Activity, Brain, Box, Copy, Download, UserCircle, Crown, Sparkles, ArrowRight, Search } from 'lucide-react';
import AIVisualizerEngine from './AIVisualizerEngine';
import { motion, AnimatePresence } from 'framer-motion';

interface TraceStep {
  step: number;
  line: number;
  description: string;
  narration?: string;
  cameraPosition?: [number, number, number];
  dataState: any;
}

interface LLMResponse {
  language: string;
  dataStructureType: string;
  code: string;
  trace: TraceStep[];
}

export default function AIVisualizerPage() {
  const [problemText, setProblemText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [llmResult, setLlmResult] = useState<LLMResponse | null>(null);
  
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  // Synchronize TTS and Playback
  useEffect(() => {
    if (!isPlaying || !llmResult) return;
    const currentStep = llmResult.trace[currentStepIdx];
    
    window.speechSynthesis.cancel();
    
    const textToSpeak = currentStep.narration || currentStep.description || "Next step.";
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speed;
    
    let fallbackTimer: any;
    const fallbackDuration = Math.max(2000, textToSpeak.length * 60) / speed;
    
    let hasAdvanced = false;
    const advance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      clearTimeout(fallbackTimer);
      setCurrentStepIdx(prev => {
        if (prev >= llmResult.trace.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    };

    utterance.onend = () => setTimeout(advance, 800 / speed);
    utterance.onerror = (e) => console.warn("TTS Error, falling back to timer:", e);

    (window as any)._currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    
    fallbackTimer = setTimeout(advance, fallbackDuration + 500);

    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(fallbackTimer);
    };
  }, [isPlaying, currentStepIdx, llmResult, speed]);

  // Auto-scroll Timeline and Code
  useEffect(() => {
    if (timelineRef.current) {
      const activeEl = timelineRef.current.querySelector('.timeline-active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (codeRef.current && llmResult) {
      const activeLine = llmResult.trace[currentStepIdx]?.line;
      if (activeLine) {
        const lineEl = codeRef.current.querySelector(`[data-line="${activeLine}"]`);
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentStepIdx, llmResult]);

  const handleGenerate = async () => {
    if (!problemText.trim()) return;
    
    setIsGenerating(true);
    setLlmResult(null);
    setCurrentStepIdx(0);
    setIsPlaying(false);

    try {
      const res = await fetch('/api/generate-trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problemText })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setLlmResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate trace: " + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStep = llmResult?.trace[currentStepIdx];
  const progressPercent = llmResult ? ((currentStepIdx + 1) / llmResult.trace.length) * 100 : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#09090B] overflow-hidden text-[#E2E8F0] font-sans">
      
      {/* Empty State / Search Engine View */}
      {!llmResult && !isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
          {/* Background glow effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-900/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none" />

          {/* Main Content */}
          <div className="z-10 flex flex-col items-center max-w-3xl w-full px-6 -mt-20">
            {/* Sparkle Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#1a0b2e] border border-fuchsia-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
              <Sparkles className="w-8 h-8 text-fuchsia-400" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-300 to-blue-300 mb-4 tracking-tight text-center">
              Ask AI to Visualize
            </h1>

            {/* Subtitle */}
            <p className="text-gray-300 text-sm md:text-base text-center max-w-lg mb-10 leading-relaxed font-medium">
              Type any programming problem like "Two Sum" or "Shortest Path" and let the AI generate the perfect 3D visualization to explain it.
            </p>

            {/* Search Bar */}
            <div className="w-full relative group mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 to-blue-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex items-center bg-[#18181B] rounded-full p-1.5 pr-1.5 pl-6">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text"
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') handleGenerate(); }}
                  placeholder="e.g., How does the Two Sum algorithm work?"
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-base md:text-lg py-3 min-w-0"
                />
                <button 
                  onClick={handleGenerate}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c026d3] to-[#d946ef] hover:from-[#a21caf] hover:to-[#c026d3] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(217,70,239,0.5)] shrink-0 ml-2"
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Suggested Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["Two Sum", "Fibonacci Sequence", "Dijkstra shortest path", "Tower of Hanoi", "Binary Search"].map(tag => (
                <button 
                  key={tag}
                  onClick={() => { setProblemText(tag); }}
                  className="px-4 py-2 rounded-full bg-[#18181B] border border-white/5 text-gray-300 text-xs md:text-sm hover:bg-white/10 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Main Workspace (Top Bar + Visualization) */
        <div className="flex-1 flex flex-col p-6 gap-6 max-w-[2000px] mx-auto w-full min-h-0">
          
          {/* Input Card Area */}
          <div className="flex-shrink-0 bg-[#111827] rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <div className="flex-1 flex flex-col gap-3">
                <h2 className="text-[18px] font-semibold text-white tracking-tight flex items-center gap-2">
                  <Box className="w-5 h-5 text-[#8B5CF6]" /> Define Problem
                </h2>
                <textarea 
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="Paste any algorithm problem (e.g. Restore IP Addresses) here..."
                  className="w-full h-[72px] bg-[#09090B] border border-white/[0.08] rounded-xl p-4 text-[15px] text-white/90 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all resize-none shadow-inner placeholder:text-white/20 custom-scrollbar"
                />
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-[#1F2937] border border-white/5 text-[12px] font-medium text-white/60">Length ≤ 20</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#1F2937] border border-white/5 text-[12px] font-medium text-white/60">Digits Only</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[12px] font-medium text-[#8B5CF6]">Backtracking</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[12px] font-medium text-[#3B82F6]">DFS</span>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !problemText.trim()}
                  className="w-full h-[52px] bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_24px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:grayscale active:scale-[0.98]"
                >
                  {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Zap className="w-5 h-5 fill-white/20" /> Visualize</>}
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setProblemText(""); setLlmResult(null); }}
                    className="flex-1 h-[40px] bg-[#1F2937] hover:bg-white/10 text-white/70 hover:text-white text-[13px] font-medium rounded-xl transition-colors border border-white/5"
                  >
                    Clear
                  </button>
                  <button className="flex-1 h-[40px] bg-[#1F2937] hover:bg-white/10 text-white/70 hover:text-white text-[13px] font-medium rounded-xl transition-colors border border-white/5">
                    Options
                  </button>
                </div>
              </div>
            </div>
          </div>


        {/* Core Visualization Area */}
        {llmResult && (
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
            
            {/* Left Column (22%): Timeline */}
            <div className="w-full md:w-[22%] bg-[#111827] rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative">
              <div className="p-5 border-b border-white/[0.08] bg-[#09090B]/40 flex justify-between items-center backdrop-blur-sm z-10">
                <h3 className="font-semibold text-[16px] text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#22C55E]" /> Execution Steps
                </h3>
                <span className="text-[12px] font-mono text-white/40">{currentStepIdx + 1}/{llmResult.trace.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative" ref={timelineRef}>
                <div className="absolute left-[31px] top-6 bottom-6 w-[2px] bg-white/[0.05]" />
                
                <div className="flex flex-col gap-6 relative z-10">
                  {llmResult.trace.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex gap-4 cursor-pointer group ${isCurrent ? 'timeline-active' : ''}`}
                        onClick={() => {
                          setCurrentStepIdx(idx);
                          setIsPlaying(false);
                        }}
                      >
                        <div className="flex flex-col items-center gap-2 mt-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-[#111827] z-10 transition-colors duration-300 ${
                            isCompleted ? 'ring-2 ring-[#22C55E]' : 
                            isCurrent ? 'ring-2 ring-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 
                            'ring-2 ring-white/10 group-hover:ring-white/30'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> : 
                             isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> : 
                             <Circle className="w-2.5 h-2.5 text-white/20" />}
                          </div>
                        </div>
                        <div className={`flex-1 flex flex-col gap-1 p-3 rounded-xl border transition-all duration-300 ${
                          isCurrent ? 'bg-[#3B82F6]/5 border-[#3B82F6]/30 shadow-inner' : 'bg-transparent border-transparent group-hover:bg-white/[0.02]'
                        }`}>
                          <span className={`text-[12px] font-bold tracking-wide uppercase ${isCompleted ? 'text-[#22C55E]' : isCurrent ? 'text-[#3B82F6]' : 'text-white/40'}`}>
                            Step {idx + 1}
                          </span>
                          <span className={`text-[14px] leading-snug ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                            {step.description.length > 50 ? step.description.substring(0, 50) + '...' : step.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center Column (53%): Hero Canvas */}
            <div className="w-full md:w-[53%] bg-[#111827] rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative group">
              <AIVisualizerEngine 
                 dataStructureType={llmResult.dataStructureType} 
                 currentDataState={currentStep?.dataState} 
                 cameraPosition={currentStep?.cameraPosition}
              />
              
              {/* Floating Explanation Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIdx}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[600px] z-20 pointer-events-none"
                >
                  <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-start gap-4">
                     <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-inner">
                       <Brain className="w-5 h-5 text-[#8B5CF6]" />
                     </div>
                     <p className="text-[16px] text-white/90 leading-relaxed font-medium">
                       {currentStep?.narration || currentStep?.description}
                     </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Playback Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/[0.12] rounded-[24px] p-2 flex flex-col gap-2 shadow-[0_16px_40px_rgba(0,0,0,0.6)] min-w-[340px]">
                  
                  {/* Progress Bar */}
                  <div className="px-4 pt-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, x / rect.width));
                      setCurrentStepIdx(Math.floor(ratio * (llmResult.trace.length - 1)));
                    }}>
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-between px-2 pb-1">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { window.speechSynthesis.cancel(); setCurrentStepIdx(0); setIsPlaying(false); }} className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Restart">
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                      <button onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))} disabled={currentStepIdx === 0} className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
                        <SkipBack className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center transition-transform active:scale-95 shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>

                    <div className="flex items-center gap-1 relative">
                      <button onClick={() => setCurrentStepIdx(prev => Math.min(llmResult.trace.length - 1, prev + 1))} disabled={currentStepIdx === llmResult.trace.length - 1} className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
                        <SkipForward className="w-4 h-4 fill-current" />
                      </button>
                      
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white text-[13px] font-mono transition-colors"
                      >
                        {speed}x <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      <AnimatePresence>
                        {showSpeedMenu && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full right-0 mb-2 bg-[#1F2937] border border-white/10 rounded-xl p-1 shadow-2xl overflow-hidden"
                          >
                            {[0.5, 1, 2, 4].map(s => (
                              <button
                                key={s}
                                onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                                className={`w-full px-4 py-2 text-left text-[13px] font-mono rounded-lg transition-colors ${speed === s ? 'bg-[#3B82F6] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                              >
                                {s}x
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (25%): Code Editor */}
            <div className="w-full md:w-[25%] bg-[#111827] rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative">
              <div className="p-4 border-b border-white/[0.08] bg-[#09090B]/40 flex justify-between items-center backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-semibold text-white tracking-tight">Solution.js</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#3B82F6]/20 text-[#3B82F6] uppercase border border-[#3B82F6]/30">
                    {llmResult.language}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors" title="Copy Code">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-[#09090B]/60 p-4 custom-scrollbar">
                <pre className="text-[13px] font-mono leading-[1.6]" ref={codeRef}>
                  {llmResult.code?.split('\n').map((line, idx) => {
                    const isCurrentLine = currentStep?.line === idx + 1;
                    return (
                      <div 
                        key={idx} 
                        data-line={idx + 1}
                        className={`flex px-2 py-0.5 rounded-[6px] transition-all duration-300 ${
                          isCurrentLine 
                            ? 'bg-[#3B82F6]/10 border-l-[3px] border-[#3B82F6] shadow-[inset_20px_0_40px_rgba(59,130,246,0.05)]' 
                            : 'border-l-[3px] border-transparent hover:bg-white/[0.02]'
                        }`}
                      >
                        <span className="text-white/20 select-none inline-block w-8 text-right pr-4 text-[12px]">{idx + 1}</span>
                        <span className={isCurrentLine ? 'text-white' : 'text-white/70'}>{line || ' '}</span>
                      </div>
                    );
                  })}
                </pre>
              </div>
            </div>

          </div>
        )}

        </div>
      )}
    </div>
  );
}
