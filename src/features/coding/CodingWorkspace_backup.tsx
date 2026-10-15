import { apiFetch } from '../../services/api';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Star,
  Share2,
  FileText,
  BookOpen,
  History,
  Terminal,
  Settings,
  HelpCircle,
  Code,
  Sparkles,
  Tag,
  Lightbulb,
  X,
  ChevronRight,
  ChevronUp,
  List,
  Clock,
  Cpu,
  Copy,
  PenLine,
  User,
  Brain,
  Maximize2,
  Lock,
  AlignLeft,
  Bookmark,
  Expand,
  RotateCcw,
  CheckSquare,
  XSquare,
  Plus,
  Maximize,
  Beaker
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import type { CodingProblem } from '../../data/codingProblems';
import { executeJavaScript, executePython, executeCpp, executeC, executeJava, executeTypescript, executeCsharp, extractFunctionName } from './CodeExecutionEngine';
import type { ExecutionResult } from './CodeExecutionEngine';

interface CodingWorkspaceProps {
  problem: CodingProblem;
  problemNumber: number;
  isSolved: boolean;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
}

export default function CodingWorkspace({ problem, problemNumber, isSolved, onBack, onNext, onPrev, onShuffle }: CodingWorkspaceProps) {
  const [code, setCode] = useState(problem.starterCode.javascript);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'python3' | 'cpp' | 'c' | 'java' | 'typescript' | 'csharp'>('javascript');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      editorContainerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };
  
  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackIssues, setFeedbackIssues] = useState<string[]>([]);
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const token = useAuthStore(s => s.token);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  // Tabs state
  const [leftTab, setLeftTab] = useState<'description' | 'submissions'>('description');
  const [rightBottomTab, setRightBottomTab] = useState<'testcases' | 'results' | 'hints'>('testcases');
  const [aiHints, setAiHints] = useState<string[]>(() => {
    const saved = localStorage.getItem(`ai_hints_${problem.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingHint, setLoadingHint] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<any>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [localTestCases, setLocalTestCases] = useState(() => 
    problem.testCases.map(tc => ({
      input: tc.input.map(val => JSON.stringify(val)),
      expected: JSON.stringify(tc.expected)
    }))
  );
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  // Interaction states
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`ai_hints_${problem.id}`);
    setAiHints(saved ? JSON.parse(saved) : []);

    // Fetch interaction data
    const fetchInteractions = async () => {
      try {
        const res = await apiFetch(`/api/problems/${problem.id}/interaction`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setLiked(data.liked);
          setDisliked(data.disliked);
          setStarred(data.starred);
          setLikesCount(data.totalLikes);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInteractions();

    const fetchLatestSubmission = async () => {
      if (!token) return;
      setLoadingSubmission(true);
      try {
        const res = await apiFetch(`/api/problems/${problem.id}/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLatestSubmission(data.submission);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSubmission(false);
      }
    };
    fetchLatestSubmission();
  }, [problem.id, token]);

  useEffect(() => {
    setLocalTestCases(problem.testCases.map(tc => ({
      input: tc.input.map(val => JSON.stringify(val)),
      expected: JSON.stringify(tc.expected)
    })));
    setSelectedCaseIdx(0);
  }, [problem.id, problem.testCases]);

  const askAiTutorForHint = async () => {
    if (aiHints.length >= 3) return;
    setLoadingHint(true);
    try {
      const hintCount = aiHints.length + 1;
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: `You are an expert DSA coding tutor. Provide hint #${hintCount} out of 3. If it's hint 1, give a very subtle nudge. If it's hint 2, give a bit more structure. If it's hint 3, give the closest thing to the solution algorithm without writing code. Keep it to 2-4 sentences.` 
            },
            { 
              role: 'user', 
              content: `Problem: ${problem.title}\nDescription: ${problem.description}\nDraft Code: ${code}\nLanguage: ${language}\nHelp me with hint #${hintCount}.` 
            }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const newHints = [...aiHints, data.text];
        setAiHints(newHints);
        localStorage.setItem(`ai_hints_${problem.id}`, JSON.stringify(newHints));
      }
    } catch (e) {
      console.error("Error fetching hint from AI Tutor.", e);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleTopHintClick = () => {
    setRightBottomTab('hints');
    if (aiHints.length === 0) {
      askAiTutorForHint();
    }
  };

  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'python3' | 'cpp' | 'c' | 'java' | 'typescript' | 'csharp') => {
    setLanguage(newLang);
    const key = newLang === 'python3' ? 'python' : newLang;
    setCode(problem.starterCode[key as keyof typeof problem.starterCode] || '');
    setResult(null);
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setResult(null);
    setRightBottomTab('results');

    if (language === 'javascript') {
      await new Promise(r => setTimeout(r, 600));
    }

    const functionName = extractFunctionName(code);
    let execResult: ExecutionResult;
    
    const parsedTestCases = localTestCases.map(tc => ({
      input: tc.input.map(val => {
        try { return JSON.parse(val); } catch (e) { return val; }
      }),
      expected: (() => {
        try { return JSON.parse(tc.expected); } catch (e) { return tc.expected; }
      })()
    }));

    if (language === 'javascript') {
      execResult = await executeJavaScript(code, parsedTestCases, functionName);
    } else if (language === 'python' || language === 'python3') {
      execResult = await executePython(code, parsedTestCases, functionName);
    } else if (language === 'java') {
      execResult = await executeJava(code, { ...problem, testCases: parsedTestCases });
    } else if (language === 'typescript') {
      execResult = await executeTypescript(code, parsedTestCases, functionName);
    } else if (language === 'csharp') {
      execResult = await executeCsharp(code, { ...problem, testCases: parsedTestCases });
    } else if (language === 'c') {
      execResult = await executeC(code, { ...problem, testCases: parsedTestCases });
    } else {
      execResult = await executeCpp(code, { ...problem, testCases: parsedTestCases });
    }

    setResult(execResult);
    if (execResult.status === 'Failed') {
      setSelectedCaseIdx(execResult.passedCount);
    } else {
      setSelectedCaseIdx(0);
    }
    setIsExecuting(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);
    setRightBottomTab('results');

    if (language === 'javascript') {
      await new Promise(r => setTimeout(r, 600));
    }

    const functionName = extractFunctionName(code);
    let execResult: ExecutionResult;

    const parsedTestCases = localTestCases.map(tc => ({
      input: tc.input.map(val => {
        try { return JSON.parse(val); } catch (e) { return val; }
      }),
      expected: (() => {
        try { return JSON.parse(tc.expected); } catch (e) { return tc.expected; }
      })()
    }));

    if (language === 'javascript') {
      execResult = await executeJavaScript(code, parsedTestCases, functionName);
    } else if (language === 'python' || language === 'python3') {
      execResult = await executePython(code, parsedTestCases, functionName);
    } else if (language === 'java') {
      execResult = await executeJava(code, { ...problem, testCases: parsedTestCases });
    } else if (language === 'typescript') {
      execResult = await executeTypescript(code, parsedTestCases, functionName);
    } else if (language === 'csharp') {
      execResult = await executeCsharp(code, { ...problem, testCases: parsedTestCases });
    } else if (language === 'c') {
      execResult = await executeC(code, { ...problem, testCases: parsedTestCases });
    } else {
      execResult = await executeCpp(code, { ...problem, testCases: parsedTestCases });
    }

    setResult(execResult);
    setIsSubmitting(false);

    if (execResult.status === 'Passed') {
      if (token) {
        try {
          await apiFetch(`/api/problems/${problem.id}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              status: execResult.status,
              language: language,
              code: code,
              runtimeMs: execResult.executionTimeMs,
              memoryMb: (Math.random() * 20 + 10).toFixed(2),
              passed_testcases: execResult.passedCount,
              total_testcases: execResult.totalCount
            })
          });

          // Refresh submission data
          const resSub = await apiFetch(`/api/problems/${problem.id}/submissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resSub.ok) {
            const dataSub = await resSub.json();
            setLatestSubmission(dataSub.submission);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1000);
    }
  };

  const resetCode = () => {
    const key = language === 'python3' ? 'python' : language;
    setCode(problem.starterCode[key as keyof typeof problem.starterCode] || '');
    setResult(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0a0a0a] text-gray-200 p-2 gap-2">
      <PanelGroup direction="horizontal" className="w-full h-full">

        <Panel defaultSize={45} minSize={30} className="flex flex-col bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 border-b border-white/5 bg-[#1e1e1e]">
          <div className="flex items-center gap-1.5 h-12">
            <div className="flex items-center mr-2 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => {}}
                className="px-2 py-1.5 hover:bg-white/10 transition-colors text-gray-300 font-medium text-xs flex items-center gap-1 border-r border-white/10"
              >
                <List size={14} />
                Problem List
              </button>
              <button
                onClick={onPrev}
                className="px-1.5 py-1.5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white border-r border-white/10"
                title="Previous Problem"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={onNext}
                className="px-1.5 py-1.5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                title="Next Problem"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {[
              { id: 'description', label: 'Description', icon: <FileText size={14} /> },
              { id: 'editorial', label: 'Editorial', icon: <BookOpen size={14} /> },
              { id: 'solutions', label: 'Solutions', icon: <Beaker size={14} /> },
              { id: 'submissions', label: 'Submissions', icon: <History size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLeftTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 h-full text-xs font-bold transition-all relative ${
                  leftTab === tab.id 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {leftTab === tab.id && (
                  <motion.div 
                    layoutId="activeLeftTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                const newState = !starred;
                setStarred(newState);
                if (token) {
                  try {
                    await apiFetch(`/api/problems/${problem.id}/interaction`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ type: 'star', action: newState ? 'add' : 'remove' })
                    });
                  } catch (e) { console.error(e); }
                }
              }} 
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${starred ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Star size={16} fill={starred ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <Share2 size={16} />
            </button>
            <button 
              onClick={() => setShowFeedbackModal(true)} 
              className="p-1.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              title="Provide Feedback"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        </div>
          


        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {leftTab === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h1 className="text-[24px] font-bold text-white mb-4">
                      {problemNumber}. {problem.title}
                    </h1>
                    {isSolved ? (
                      <div className="flex items-center gap-1.5 text-sm text-[#2cbb5d] font-semibold mt-1">
                        Solved <CheckCircle2 size={16} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-yellow-500 font-semibold mt-1">
                        Unsolved <XCircle size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'text-[#00b8a3] bg-[#00b8a3]/10' : problem.difficulty === 'Medium' ? 'text-[#ffc01e] bg-[#ffc01e]/10' : 'text-[#ef4743] bg-[#ef4743]/10'}`}>
                      {problem.difficulty}
                    </span>
                    <button 
                      onClick={handleTopHintClick}
                      className="flex items-center gap-1 text-[12px] font-medium text-gray-400 hover:text-gray-200 transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-full"
                    >
                      <Lightbulb size={12} /> Hint
                    </button>
                  </div>
                </div>

                <div className="text-[15px] text-[#bfc6ce] leading-relaxed space-y-4">
                  {problem.description.split('\n\n')
                    .filter((para: string) => !para.includes('**Follow-up:**'))
                    .map((para, i) => {
                    const parts = para.split(/`([^`]+)`/g);
                    return (
                      <p key={i}>
                        {parts.map((part, j) => 
                          j % 2 === 1 ? (
                            <code key={j} className="bg-white/10 px-1.5 py-0.5 rounded text-[#eff2f6] font-mono text-[13.5px] mx-0.5">{part}</code>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Examples</h3>
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="bg-[#1E1E22] border border-[#242428] rounded-xl p-5 text-sm font-mono space-y-3 shadow-inner">
                      <div className="text-xs font-extrabold text-blue-400">Example {i + 1}</div>
                      <div className="flex items-start">
                         <span className="text-gray-500 w-16 shrink-0 font-bold text-xs mt-0.5">Input:</span> 
                         <span className="text-gray-300 bg-black/40 px-2 py-0.5 rounded border border-white/5 font-medium">{ex.input}</span>
                      </div>
                      <div className="flex items-start">
                         <span className="text-gray-500 w-16 shrink-0 font-bold text-xs mt-0.5">Output:</span> 
                         <span className="text-gray-300 bg-black/40 px-2 py-0.5 rounded border border-white/5 font-medium">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="flex pt-3 border-t border-white/5 mt-3">
                          <span className="text-gray-500 w-16 shrink-0 font-bold text-xs mt-0.5">Explain:</span>
                          <span className="text-gray-400 font-sans text-sm">{ex.explanation}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4">
                  <div className="text-[15px] font-bold text-white">Constraints:</div>
                  <ul className="list-disc pl-5 space-y-2 text-[#bfc6ce]">
                    {problem.constraints.map((c, i) => {
                      const parts = c.split(/`([^`]+)`/g);
                      return (
                        <li key={i}>
                          {parts.length > 1 ? parts.map((part, j) => 
                            j % 2 === 1 ? (
                              <code key={j} className="bg-white/10 px-1.5 py-0.5 rounded text-[#eff2f6] font-mono text-[13.5px]">{part}</code>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          ) : (
                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-[#eff2f6] font-mono text-[13.5px]">{c}</code>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {problem.description.split('\n\n').find((p: string) => p.includes('**Follow-up:**')) && (
                  <div className="pt-6 border-t border-white/5 mt-6">
                    <div className="text-[15px] text-[#bfc6ce] leading-relaxed">
                      <span className="font-bold text-white mr-2">Follow-up:</span>
                      {problem.description.split('\n\n')
                        .find((p: string) => p.includes('**Follow-up:**'))
                        ?.replace('**Follow-up:**', '')
                        .trim()
                        .split(/`([^`]+)`/g).map((part, j) => 
                          j % 2 === 1 ? (
                            <code key={j} className="bg-white/10 px-1.5 py-0.5 rounded text-[#eff2f6] font-mono text-[13.5px] mx-0.5">{part}</code>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-8 border-t border-white/10">
                  <button 
                    onClick={() => setShowTopics(!showTopics)}
                    className="flex items-center justify-between w-full py-1 text-[#bfc6ce] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 text-[15px] font-medium">
                      <Tag size={16} /> Topics
                    </div>
                    <motion.div
                      animate={{ rotate: showTopics ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={18} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showTopics && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden flex flex-wrap gap-2"
                      >
                        {(problem.topic ? problem.topic.split(',') : ['Arrays', 'Algorithms']).map((topic, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-[13px] font-medium text-gray-300">
                            {topic.trim()}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {problem.stats && (
                  <div className="pt-6 mt-8 border-t border-white/10 flex flex-wrap gap-8 text-[13px] font-medium text-[#bfc6ce]">
                    <div>
                      Accepted
                      <div className="text-white text-[15px] font-semibold mt-0.5">{problem.stats.accepted.toLocaleString()}</div>
                    </div>
                    <div>
                      Submissions
                      <div className="text-white text-[15px] font-semibold mt-0.5">{problem.stats.submissions.toLocaleString()}</div>
                    </div>
                    <div>
                      Acceptance Rate
                      <div className="text-white text-[15px] font-semibold mt-0.5">
                        {problem.stats.submissions > 0 ? ((problem.stats.accepted / problem.stats.submissions) * 100).toFixed(1) : '0.0'}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <button 
                    onClick={async () => {
                      const newState = !liked;
                      setLiked(newState);
                      setDisliked(false);
                      setLikesCount(prev => newState ? prev + 1 : prev - 1);
                      if (token) {
                        try {
                          await apiFetch(`/api/problems/${problem.id}/interaction`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ type: 'like', action: newState ? 'add' : 'remove' })
                          });
                        } catch (e) { console.error(e); }
                      }
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                      liked ? 'bg-blue-500/10 border border-blue-500 text-blue-400' : 'bg-white/5 hover:bg-white/10 border border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    {likesCount}
                  </button>
                  <button 
                    onClick={async () => {
                      const newState = !disliked;
                      setDisliked(newState);
                      setLiked(false);
                      if (liked) setLikesCount(p => p - 1);
                      if (token) {
                        try {
                          await apiFetch(`/api/problems/${problem.id}/interaction`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ type: 'dislike', action: newState ? 'add' : 'remove' })
                          });
                        } catch (e) { console.error(e); }
                      }
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                      disliked ? 'bg-red-500/10 border border-red-500 text-red-400' : 'bg-white/5 hover:bg-white/10 border border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {leftTab === 'submissions' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6 pb-10"
              >
                {loadingSubmission ? (
                  <div className="text-gray-500 text-sm mt-4">Loading submission data...</div>
                ) : !latestSubmission ? (
                  <div className="text-gray-500 text-sm mt-4">No successful submissions yet. Submit a solution to see it here!</div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h2 className={`text-xl font-bold ${latestSubmission.status === 'Passed' ? 'text-[#2cbb5d]' : 'text-[#ef4743]'}`}>
                            {latestSubmission.status}
                          </h2>
                          <span className="text-[13px] text-gray-500 font-medium">{latestSubmission.passed_testcases} / {latestSubmission.total_testcases} testcases passed</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[13px] text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <User size={14} />
                            <span className="font-bold">{latestSubmission.user_name}</span>
                          </div>
                          <span>submitted at {new Date(latestSubmission.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3a2e5d] text-[#a48ee6] font-semibold text-[13px] hover:bg-[#4b3c78] transition-colors">
                          <Sparkles size={14} /> Analysis
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2cbb5d] text-white font-semibold text-[13px] hover:bg-[#34d36d] transition-colors">
                          <PenLine size={14} /> Solution
                        </button>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex flex-col gap-6 bg-[#262626] rounded-xl border border-white/5 p-4">
                      <div className="flex gap-4">
                        <div className="flex-1 bg-[#323232] rounded-lg p-4">
                          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-300 mb-2">
                            <Clock size={14} /> Runtime
                          </div>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-2xl font-bold text-white">{latestSubmission.runtime_ms}</span>
                            <span className="text-[13px] text-gray-400 font-medium mb-1">ms</span>
                            <span className="text-[#bfc6ce] text-[13px] ml-1 mb-1 border-l border-white/10 pl-3">
                              Beats <strong className="text-white">100.00%</strong> 🖐️
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 rounded-lg p-4">
                          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-400 mb-2">
                            <Cpu size={14} /> Memory
                          </div>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-300">{latestSubmission.memory_mb}</span>
                            <span className="text-[13px] text-gray-500 font-medium mb-1">MB</span>
                            <span className="text-[#8c949c] text-[13px] ml-1 mb-1 border-l border-white/10 pl-3">
                              Beats <strong className="text-gray-300">58.13%</strong> 🖐️
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code Block */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400 font-semibold px-1">
                        <span>Code</span> <span className="text-[#404040]">|</span> <span>{latestSubmission.language}</span>
                      </div>
                      
                      <div className="bg-[#1E1E22] rounded-xl border border-white/5 overflow-hidden relative group">
                        <div className="p-4 font-mono text-[13px] leading-relaxed relative">
                          <div className="flex">
                            <div className="text-gray-600 select-none pr-4 text-right shrink-0">
                              {latestSubmission.code.split('\n').map((_: any, i: number) => (
                                <div key={i}>{i + 1}</div>
                              ))}
                            </div>
                            <div className="overflow-x-auto whitespace-pre text-gray-300">
                              {latestSubmission.code}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </Panel>

        {/* Horizontal Resize Handle */}
        <PanelResizeHandle className="w-2 mx-0.5 hover:bg-blue-500/20 transition-colors rounded-full cursor-col-resize relative group flex items-center justify-center">
          <div className="w-1 h-8 bg-white/10 group-hover:bg-blue-400 rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* Right Pane: Split Code Editor & Interactive Console */}
        <Panel defaultSize={55} minSize={30}>
          <PanelGroup direction="vertical" className="w-full h-full">
            {/* Upper Part: Code Editor Workspace */}
            <Panel defaultSize={65} minSize={20} className="flex flex-col bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <div ref={editorContainerRef} className="flex flex-col w-full h-full bg-[#1e1e1e]">
          {/* Editor Header Top Bar */}
          <div className="h-10 bg-[#282828] flex items-center justify-between px-3 border-b border-[#363636] shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-[#2cbb5d] text-[14px]">{'</>'}</span>
              <span className="text-gray-200">Code</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <button onClick={toggleFullScreen} className="hover:text-gray-200 transition-colors">
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Editor Toolbar */}
          <div className="h-9 bg-[#1e1e1e] flex items-center justify-between px-3 border-b border-[#363636] shrink-0">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="bg-transparent text-xs text-gray-300 font-medium outline-none cursor-pointer hover:text-white transition-colors border-none"
              >
                <option value="cpp" className="bg-[#282828] text-gray-300">C++</option>
                <option value="java" className="bg-[#282828] text-gray-300">Java</option>
                <option value="python3" className="bg-[#282828] text-gray-300">Python 3</option>
                <option value="python" className="bg-[#282828] text-gray-300">Python</option>
                <option value="c" className="bg-[#282828] text-gray-300">C</option>
                <option value="csharp" className="bg-[#282828] text-gray-300">C#</option>
                <option value="javascript" className="bg-[#282828] text-gray-300">JavaScript</option>
                <option value="typescript" className="bg-[#282828] text-gray-300">TypeScript</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3.5 text-gray-400">
              <button className="hover:text-white transition-colors" title="Bookmark">
                <Bookmark size={14} />
              </button>
              <button onClick={resetCode} className="hover:text-white transition-colors" title="Reset to default">
                <RotateCcw size={14} />
              </button>
              <button onClick={toggleFullScreen} className="hover:text-white transition-colors" title="Full Screen">
                <Expand size={14} />
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                roundedSelection: false,
                scrollbar: { useShadows: false, verticalScrollbarSize: 8 },
              }}
            />
          </div>

          {/* Editor Footer */}
          <div className="h-8 bg-[#1e1e1e] flex items-center justify-between px-4 text-[11px] text-gray-500 font-medium shrink-0">
            <div></div>
            <div>Ln 1, Col 1</div>
          </div>
          </div>
        </Panel>

        {/* Vertical Resize Handle */}
        <PanelResizeHandle className="h-2 my-0.5 hover:bg-blue-500/20 transition-colors rounded-full cursor-row-resize relative group flex items-center justify-center">
          <div className="h-1 w-8 bg-white/10 group-hover:bg-blue-400 rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* Lower Part: Interactive Console (Testcase & Results) */}
        <Panel defaultSize={35} minSize={20} className="flex flex-col bg-[#1e1e1e] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Console Header Tabs */}
          <div className="h-10 bg-[#262626] flex items-center justify-between px-4 border-b border-white/5">
            <div className="flex items-center gap-4 h-full">
              {[
                { id: 'results', label: 'Test Result', icon: <span className="font-bold text-emerald-500 font-mono text-[14px] leading-none">{'>_'}</span> },
                { id: 'testcases', label: 'Testcase', icon: <CheckSquare size={14} className="text-emerald-600/70" /> },
                { id: 'hints', label: 'AI Hint', icon: <Sparkles size={14} className="text-blue-500/70" /> }
              ].map((tab, idx) => (
                <div key={tab.id} className="flex items-center gap-4 h-full">
                  <button
                    onClick={() => setRightBottomTab(tab.id as any)}
                    className={`flex items-center gap-1.5 h-full text-[13px] font-medium transition-colors ${
                      rightBottomTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                  {idx === 0 && <div className="h-3.5 w-[1px] bg-white/10" />}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-gray-500">
               <Maximize2 size={13} className="hover:text-gray-300 cursor-pointer transition-colors" />
               <ChevronUp size={16} className="hover:text-gray-300 cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs">
            {rightBottomTab === 'testcases' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {localTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCaseIdx(idx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                        selectedCaseIdx === idx 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      if (localTestCases.length >= 8) return;
                      const lastCase = localTestCases[localTestCases.length - 1] || { input: problem.signature?.params.map(() => '') || [], expected: '' };
                      setLocalTestCases([...localTestCases, { ...lastCase, input: [...lastCase.input] }]);
                      setSelectedCaseIdx(localTestCases.length);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors ml-1"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>

                {localTestCases[selectedCaseIdx] && (
                  <div className="space-y-4 mt-2">
                    {problem.signature?.params.map((p, idx) => (
                      <div key={p.name} className="space-y-2">
                        <div className="text-gray-400 text-[12px] ml-1">{p.name} =</div>
                        <input
                          type="text"
                          value={localTestCases[selectedCaseIdx].input[idx]}
                          onChange={(e) => {
                            const newTestCases = [...localTestCases];
                            newTestCases[selectedCaseIdx].input[idx] = e.target.value;
                            setLocalTestCases(newTestCases);
                          }}
                          className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl p-3.5 text-gray-200 text-[13px] font-mono outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {rightBottomTab === 'results' && (
              <div className="h-full">
                {!result && !isExecuting && (
                  <div className="text-gray-500 flex h-full items-center justify-center italic">
                    You must run your code first.
                  </div>
                )}
                
                {isExecuting && (
                  <div className="text-gray-300 flex items-center justify-center gap-2 h-full">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    Evaluating test cases...
                  </div>
                )}
                
                {result && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className={`text-[22px] font-semibold tracking-tight ${
                        result.status === 'Passed' ? 'text-emerald-500' : 
                        result.status === 'Failed' ? 'text-rose-500' : 'text-amber-500'
                      }`}>
                        {result.status === 'Passed' ? 'Accepted' : result.status === 'Failed' ? 'Wrong Answer' : 'Runtime Error'}
                      </span>
                      <span className="text-gray-400 text-[13px] font-medium">
                        Runtime: {result.executionTimeMs} ms
                      </span>
                    </div>

                    {result.status !== 'Error' && (
                      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                        {problem.testCases.map((_, idx) => {
                          const isSelected = selectedCaseIdx === idx;
                          const isPassed = result.status === 'Passed' || idx < result.passedCount;
                          const isFailed = result.status === 'Failed' && idx === result.passedCount;

                          const Icon = isPassed ? <CheckSquare size={15} className="text-emerald-500" /> : isFailed ? <XSquare size={15} className="text-rose-500" /> : <div className="w-[15px] h-[15px] rounded-sm bg-white/5 border border-white/10" />;

                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedCaseIdx(idx)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                                isSelected 
                                  ? 'bg-white/10 text-white' 
                                  : 'text-gray-400 hover:text-gray-300'
                              }`}
                            >
                              {Icon}
                              Case {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {result.status !== 'Error' && problem.testCases[selectedCaseIdx] && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-[12px] text-gray-400 font-medium ml-1">Input</div>
                          <div className="space-y-2">
                            {problem.signature?.params.map((p, idx) => (
                              <div key={p.name} className="bg-white/5 rounded-xl p-3.5 space-y-2">
                                <div className="text-gray-400 text-[12px]">{p.name} =</div>
                                <div className="text-gray-200 text-[13px] font-mono">{JSON.stringify(problem.testCases[selectedCaseIdx].input[idx])}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[12px] text-gray-400 font-medium ml-1">Output</div>
                          <div className="bg-white/5 rounded-xl p-3.5 text-gray-200 text-[13px] font-mono">
                            {result.status === 'Passed' || selectedCaseIdx < result.passedCount 
                              ? JSON.stringify(problem.testCases[selectedCaseIdx].expected) 
                              : result.status === 'Failed' && selectedCaseIdx === result.passedCount && result.message?.includes('Output: ')
                                ? result.message.split('Output: ')[1]?.split('\n')[0] || '...' 
                                : '...'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[12px] text-gray-400 font-medium ml-1">Expected</div>
                          <div className="bg-white/5 rounded-xl p-3.5 text-gray-200 text-[13px] font-mono">
                            {JSON.stringify(problem.testCases[selectedCaseIdx].expected)}
                          </div>
                        </div>
                        
                        <div className="flex justify-center mt-6 py-4">
                          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300 text-[13px] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            Contribute a testcase
                          </button>
                        </div>
                      </div>
                    )}

                    {result.status === 'Error' && result.message && (
                      <div className="bg-rose-950/20 text-rose-300 p-3.5 rounded-xl text-xs font-semibold whitespace-pre-wrap border border-rose-500/20 mt-4">
                        {result.message}
                      </div>
                    )}
                    {result.status === 'Error' && result.stdout && result.stdout.length > 0 && (
                      <div className="space-y-1.5 mt-4">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Stdout</span>
                        <div className="bg-[#1E1E22] text-gray-300 p-3.5 rounded-xl text-xs font-medium whitespace-pre-wrap border border-[#242428]">
                          {result.stdout.join('\n')}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {rightBottomTab === 'hints' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AI Coding Tutor Hint ({aiHints.length}/3)</div>
                  {aiHints.length < 3 ? (
                    <button 
                      onClick={askAiTutorForHint}
                      disabled={loadingHint}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {loadingHint ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {aiHints.length === 0 ? 'Generate Hint' : 'Get Another Hint'}
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-rose-400 border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 rounded-lg">
                      AI Shutdown (Max 3/3)
                    </div>
                  )}
                </div>
                
                {aiHints.length > 0 && (
                  <div className="space-y-3">
                    {aiHints.map((hint, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 leading-relaxed font-sans"
                      >
                        <div className="text-[10px] uppercase font-bold text-blue-400/70 mb-1">Hint {idx + 1}</div>
                        {hint}
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {loadingHint && (
                  <div className="text-gray-400 italic">Consulting AI Tutor...</div>
                )}
                
                {aiHints.length === 0 && !loadingHint && (
                  <div className="text-gray-500 italic text-center py-6">
                    Click "Generate Hint" to get step-by-step assistance from the AI Tutor. Max 3 hints allowed.
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action Bar merged into Console bottom */}
          <div className="h-14 bg-[#1E1E22] border-t border-white/5 flex items-center justify-end px-4 gap-3 shrink-0">
            <button
              onClick={handleRun}
              disabled={isExecuting || isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#2C2C32] hover:bg-[#3F3F46] border border-white/10 text-gray-200 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Play size={14} className="text-gray-400" />
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={isExecuting || isSubmitting}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Code size={14} />}
              Submit
            </button>
          </div>
        </Panel>
        </PanelGroup>
        </Panel>
      </PanelGroup>
      {/* Modals */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#2D2D2D] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#333333]">
                <h3 className="text-white font-bold text-lg">Feedback</h3>
                <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                
                <div>
                  <div className="text-gray-400 text-sm font-medium mb-1">Problem:</div>
                  <div className="text-white text-base">{problem.title}</div>
                </div>

                <div>
                  <div className="text-gray-300 text-sm font-medium mb-3">
                    <span className="text-red-500 mr-1">*</span>Issues Encountered:
                  </div>
                  <div className="space-y-3">
                    {[
                      "Description or examples are unclear or incorrect",
                      "Difficulty is inaccurate",
                      "Testcases are missing or incorrect",
                      "Runtime is too strict",
                      "Edge cases are too frustrating to solve",
                      "Other"
                    ].map(issue => (
                      <label key={issue} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${feedbackIssues.includes(issue) ? 'bg-blue-500' : 'bg-white/10 group-hover:bg-white/20'}`}>
                          {feedbackIssues.includes(issue) && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="text-gray-300 text-sm select-none">{issue}</span>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={feedbackIssues.includes(issue)}
                          onChange={(e) => {
                            if (e.target.checked) setFeedbackIssues(prev => [...prev, issue]);
                            else setFeedbackIssues(prev => prev.filter(i => i !== issue));
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-gray-300 text-sm font-medium mb-3">Rate this problem:</div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`transition-colors p-1 ${rating >= star ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-400'}`}
                      >
                        <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-gray-300 text-sm font-medium mb-2">Additional Feedback:</div>
                  <textarea 
                    value={additionalFeedback}
                    onChange={e => setAdditionalFeedback(e.target.value)}
                    className="w-full bg-[#3A3A3A] border border-transparent rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none h-24 transition-colors"
                    placeholder="Tell us more about your experience..."
                  />
                </div>

              </div>

              <div className="flex items-center justify-between p-4 border-t border-white/10 bg-[#333333]">
                <div className="text-xs text-gray-400">
                  You may also <a href="https://github.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">submit via Github</a> to get feedback in real time.
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#4A4A4A] hover:bg-[#5A5A5A] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      setIsSubmittingFeedback(true);
                      try {
                        await apiFetch(`/api/problems/${problem.id}/feedback`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ issues: feedbackIssues, additionalFeedback, rating })
                        });
                        setShowFeedbackModal(false);
                        setFeedbackIssues([]);
                        setAdditionalFeedback("");
                        setRating(0);
                        alert("Thank you for your feedback!");
                      } catch (err) {
                        console.error(err);
                        alert("Failed to submit feedback.");
                      } finally {
                        setIsSubmittingFeedback(false);
                      }
                    }}
                    disabled={isSubmittingFeedback || (feedbackIssues.length === 0 && !additionalFeedback && rating === 0)}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#22C55E] hover:bg-[#16A34A] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingFeedback && <Loader2 size={14} className="animate-spin" />}
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
