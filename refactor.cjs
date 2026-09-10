const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Abhiram/Downloads/al/src/features/visualizer/AIVisualizerPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useNavigate import
if (!content.includes("import { useNavigate }")) {
  content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { useNavigate } from 'react-router-dom';");
}

// 2. Add useNavigate hook
if (!content.includes("const navigate = useNavigate();")) {
  content = content.replace("export default function AIVisualizerPage() {", "export default function AIVisualizerPage() {\n  const navigate = useNavigate();");
}

// 3. Replace the layout block
const startMarker = "/* Main Workspace (Top Bar + Visualization) */";
const endMarker = "</div>\n      )}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newLayout = `/* Main Workspace (Full Screen 3D + Floating Widgets) */
        <div className="flex-1 relative w-full h-full overflow-hidden">
          
          {/* Background 3D Viewer */}
          {llmResult ? (
            <div className="absolute inset-0 z-0 bg-[#09090B]">
              <AnimatePresence mode="wait">
                <AIVisualizerEngine 
                  primitives={computedPrimitives} 
                  cameraFocus={currentStep?.cameraFocus}
                />
              </AnimatePresence>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#09090B]">
              <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
              <p className="text-white/70 text-lg">AI is storyboarding your visualization...</p>
            </div>
          )}

          {/* Floating UI Layer (Only visible when loaded) */}
          {llmResult && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              
              {/* Question & Complexity Box (Draggable) */}
              <motion.div 
                drag 
                dragMomentum={false}
                className="absolute top-6 left-6 pointer-events-auto bg-[#111827]/80 backdrop-blur-md rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3 w-80 cursor-grab active:cursor-grabbing hover:border-white/[0.15] transition-colors"
              >
                <h2 className="text-[16px] font-semibold text-white tracking-tight flex items-start gap-2">
                  <Box className="w-4 h-4 text-[#8B5CF6] mt-1 shrink-0" /> 
                  <span className="leading-tight">{llmResult.problem?.title || 'Unknown Problem'}</span>
                </h2>
                
                <div className="flex gap-2 text-[11px] font-mono mt-1 w-full">
                  <button 
                    onClick={() => navigate('/learn/complexity')}
                    className="flex-1 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded text-white/80 transition-colors text-center border border-white/5 hover:border-white/20 shadow-sm"
                  >
                    ⏱️ {llmResult.approach?.timeComplexity || 'O(?)'}
                  </button>
                  <button 
                    onClick={() => navigate('/learn/complexity')}
                    className="flex-1 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded text-white/80 transition-colors text-center border border-white/5 hover:border-white/20 shadow-sm"
                  >
                    💾 {llmResult.approach?.spaceComplexity || 'O(?)'}
                  </button>
                </div>
              </motion.div>

              {/* Trace Steps Box (Draggable) */}
              <motion.div 
                drag 
                dragMomentum={false}
                className="absolute bottom-[100px] left-6 pointer-events-auto bg-[#111827]/80 backdrop-blur-md rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col w-72 h-80 overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <div className="p-3 border-b border-white/[0.08] bg-[#09090B]/60 flex justify-between items-center z-10">
                  <span className="text-[13px] font-semibold text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#8B5CF6]" /> Trace Steps
                  </span>
                  <span className="text-[10px] font-mono text-white/40">{(llmResult.steps?.length || 0)} frames</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-[#09090B]/40" ref={timelineRef}>
                  <div className="relative">
                    <div className="absolute top-4 bottom-4 left-[11px] w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                    
                    {(llmResult.steps || []).map((step, idx) => {
                      const isActive = idx === currentStepIdx;
                      const isPast = idx < currentStepIdx;
                      return (
                        <div 
                          key={idx}
                          onClick={() => setCurrentStepIdx(idx)}
                          className={\`relative pl-8 pr-2 py-2 mb-1.5 rounded-lg cursor-pointer transition-all duration-300 \${isActive ? 'bg-white/[0.06] timeline-active' : 'hover:bg-white/[0.04]'}\`}
                        >
                          <div className="absolute left-[3px] top-[14px] -translate-y-1/2 z-10">
                            {isActive ? (
                              <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#8B5CF6] rounded-full blur-[6px] opacity-60 animate-pulse" />
                                <Circle className="w-3 h-3 fill-[#8B5CF6] text-[#8B5CF6] relative z-10" />
                              </div>
                            ) : isPast ? (
                              <CheckCircle2 className="w-3 h-3 text-white/30" />
                            ) : (
                              <Circle className="w-3 h-3 text-white/10" />
                            )}
                          </div>
                          
                          <span className={\`text-[12px] font-semibold tracking-tight transition-colors leading-tight block \${isActive ? 'text-white' : isPast ? 'text-white/60' : 'text-white/40'}\`}>
                            {step.stepIndex}. {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Code Editor Box (Draggable) */}
              <motion.div 
                drag 
                dragMomentum={false}
                className="absolute top-6 right-6 pointer-events-auto bg-[#111827]/80 backdrop-blur-md rounded-[18px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col w-96 h-[500px] overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <div className="p-3 border-b border-white/[0.08] bg-[#09090B]/60 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white tracking-tight">Solution</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#3B82F6]/20 text-[#3B82F6] uppercase border border-[#3B82F6]/30">
                      {llmResult.code?.language}
                    </span>
                  </div>
                  <button className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors" title="Copy Code">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-[#09090B]/60 p-3 custom-scrollbar">
                  <pre className="text-[12px] font-mono leading-[1.6]" ref={codeRef}>
                    {llmResult.code?.lines?.map((lineObj) => {
                      const idx = lineObj.line - 1;
                      const line = lineObj.text;
                      const activeLines = Array.isArray(currentStep?.codeLineActive) ? currentStep.codeLineActive : [currentStep?.codeLineActive];
                      const isCurrentLine = activeLines.includes(idx + 1);
                      return (
                        <div 
                          key={idx} 
                          data-line={idx + 1}
                          className={\`flex px-2 py-0.5 rounded-[4px] transition-all duration-300 \${
                            isCurrentLine 
                              ? 'bg-[#3B82F6]/20 border-l-[2px] border-[#3B82F6] shadow-[inset_10px_0_20px_rgba(59,130,246,0.1)]' 
                              : 'border-l-[2px] border-transparent hover:bg-white/[0.04]'
                          }\`}
                        >
                          <span className="text-white/20 select-none inline-block w-6 text-right pr-3 text-[11px]">{idx + 1}</span>
                          <span className={isCurrentLine ? 'text-white' : 'text-white/70'}>{line || ' '}</span>
                        </div>
                      );
                    })}
                  </pre>
                </div>
              </motion.div>

              {/* Subtitles Overlay (Not draggable, fixed bottom) */}
              <AnimatePresence>
                <motion.div 
                  key={currentStepIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute bottom-[100px] left-0 w-full px-12 pointer-events-none flex justify-center"
                >
                  <div className="max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-4 text-center justify-center">
                     <div className="mt-0.5 opacity-80 hidden md:block">
                       <Brain className="w-5 h-5 text-[#8B5CF6]" />
                     </div>
                     <p className="text-[15px] text-white/90 leading-relaxed font-medium">
                       {currentStep?.narration?.text || currentStep?.title}
                     </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Playback Controls (Not draggable, fixed bottom center) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/[0.12] rounded-[24px] p-2 flex flex-col gap-2 shadow-[0_16px_40px_rgba(0,0,0,0.6)] min-w-[340px]">
                  
                  {/* Progress Bar */}
                  <div className="px-4 pt-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, x / rect.width));
                      setCurrentStepIdx(Math.floor(ratio * ((llmResult.steps?.length || 0) - 1)));
                    }}>
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" 
                        initial={{ width: 0 }}
                        animate={{ width: \`\${progressPercent}%\` }}
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
                      <button onClick={() => setCurrentStepIdx(prev => Math.min((llmResult.steps?.length || 0) - 1, prev + 1))} disabled={currentStepIdx === (llmResult.steps?.length || 0) - 1} className="p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
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
                                className={\`w-full px-4 py-2 text-left text-[13px] font-mono rounded-lg transition-colors \${speed === s ? 'bg-[#3B82F6] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}\`}
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
          )}
        </div>
      )}`;

  content = content.substring(0, startIndex) + newLayout + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Refactored AIVisualizerPage successfully.");
} else {
  console.log("Markers not found");
}
