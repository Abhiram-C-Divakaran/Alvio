import { useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { initAudio, playPing, playSwoosh } from '../../utils/audio';
import Asteroids from '../visualizer/Asteroids';
import Array3D from '../visualizer/Array3D';
import Graph3D from '../visualizer/Graph3D';
import BinaryTree3D from '../visualizer/BinaryTree3D';
import LinkedList3D from '../visualizer/LinkedList3D';
import VisualizerToolbar from '../visualizer/VisualizerToolbar';
import { insertValue, deleteValue } from '../workspace/dataStructureOps';
import type { DataStructure, DSANode, DSAEdge } from '../../types/dataStructures';

interface AnimatedStep {
  values?: any[];
  nodes?: string[];
  edges?: [string, string][];
  highlight?: (number | string)[];
  activeLine?: number;
  description: string;
}

interface AnimatedData {
  type: string;
  code?: string;
  steps: AnimatedStep[];
}

interface AnimatedGenerativeVisualizerProps {
  data: string;
}

function CinematicCamera({ isPlaying }: { isPlaying: boolean }) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    if (isPlaying) {
      const time = state.clock.getElapsedTime();
      const radius = 12 + Math.sin(time * 0.2) * 2; // subtle zoom in/out
      const height = 4 + Math.sin(time * 0.4) * 1.5;
      
      const targetX = Math.sin(time * 0.15) * radius;
      const targetZ = Math.cos(time * 0.15) * radius;
      
      vec.set(targetX, height, targetZ);
      
      camera.position.lerp(vec, delta * 1.5);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

export function AnimatedGenerativeVisualizer({ data }: AnimatedGenerativeVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localStructure, setLocalStructure] = useState<DataStructure | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<any>([]);

  const parsedData = useMemo<AnimatedData | null>(() => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.type || !parsed.steps || !Array.isArray(parsed.steps)) return null;
      return parsed as AnimatedData;
    } catch (e) {
      console.error("Failed to parse animated 3D data", e);
      return null;
    }
  }, [data]);

  const baseStructure = useMemo<DataStructure | null>(() => {
    if (!parsedData || parsedData.steps.length === 0) return null;
    
    const type = parsedData.type;
    const stepIndex = Math.min(currentStep, parsedData.steps.length - 1);
    const step = parsedData.steps[stepIndex];
    const highlightSet = new Set(step.highlight || []);

    if (type === 'graph') {
      const nodesList = step.nodes || [];
      const nodes: DSANode[] = nodesList.map((n: string, i: number, arr: any[]) => {
        const angle = (i / Math.max(1, arr.length)) * Math.PI * 2;
        const radius = 2;
        return {
          id: String(n),
          value: String(n),
          position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: 0 },
          state: { highlighted: highlightSet.has(i) || highlightSet.has(n), active: false }
        };
      });

      const edges: DSAEdge[] = (step.edges || []).map((e: [string, string], i: number) => ({
        id: `e${i}`,
        from: String(e[0]),
        to: String(e[1]),
        directed: false,
        state: { highlighted: false, active: false }
      }));

      return { type: 'graph', nodes, edges, directed: false, weighted: false };
    }

    if (type === 'array') {
      const values = step.values || [];
      const elements: DSANode[] = values.map((v: any, i: number) => ({
        id: String(i),
        value: v,
        position: { x: i - (values.length - 1) / 2, y: 0, z: 0 },
        state: { highlighted: highlightSet.has(i), active: false }
      }));
      return { type: 'array', elements, capacity: Math.max(5, values.length) };
    }

    if (type === 'linked-list') {
      const values = step.values || [];
      const nodes = values.map((v: any, i: number) => ({
        id: String(i),
        value: v,
        position: { x: (i - (values.length - 1) / 2) * 1.5, y: 0, z: 0 },
        state: { highlighted: highlightSet.has(i), active: false },
        next: i < values.length - 1 ? String(i + 1) : null
      }));
      return { type: 'linked-list', head: nodes.length > 0 ? '0' : null, nodes };
    }

    if (type === 'binary-tree') {
      const values = step.values || [];
      if (values.length === 0) return null;
      
      const nodes: any[] = [];
      const buildTree = (index: number, level: number, xOffset: number): string | null => {
        if (index >= values.length || values[index] === null) return null;
        
        const id = String(index);
        const xSpacing = 2 / (level + 1);
        
        nodes.push({
          id,
          value: values[index],
          position: { x: xOffset, y: 3 - level * 1.5, z: 0 },
          state: { highlighted: highlightSet.has(index), active: false },
          left: buildTree(2 * index + 1, level + 1, xOffset - xSpacing),
          right: buildTree(2 * index + 2, level + 1, xOffset + xSpacing)
        });
        
        return id;
      };
      
      buildTree(0, 0, 0);
      return { type: 'binary-tree', root: '0', nodes };
    }

    return null;
  }, [parsedData, currentStep]);

  useEffect(() => {
    setLocalStructure(baseStructure);
  }, [baseStructure]);

  if (!parsedData || !baseStructure) {
    return (
      <div className="my-4 rounded-xl overflow-hidden bg-red-900/20 border border-red-500/30 p-4 text-xs text-red-400">
        Could not generate 3D animation. Invalid data format.
      </div>
    );
  }

  const stepCount = parsedData.steps.length;
  const currentStepData = parsedData.steps[Math.min(currentStep, stepCount - 1)];

  // Audio & Voice Narration
  useEffect(() => {
    if (!soundEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    // Play SFX
    if (currentStepData.activeLine || (currentStepData.highlight && currentStepData.highlight.length > 0)) {
      playPing();
    }
    playSwoosh();

    // Text to Speech
    window.speechSynthesis.cancel();
    if (currentStepData.description) {
      const utterance = new SpeechSynthesisUtterance(currentStepData.description);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentStep, soundEnabled, currentStepData]);

  // Auto-play interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= stepCount - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500); // 3.5 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying, stepCount]);

  // Update Monaco Editor decorations for active line highlighting
  useEffect(() => {
    if (editorRef.current && monaco && currentStepData?.activeLine) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monaco.Range(currentStepData.activeLine, 1, currentStepData.activeLine, 1),
            options: {
              isWholeLine: true,
              className: 'bg-blue-500/20 border-l-2 border-blue-400'
            }
          }
        ]
      );
    } else if (editorRef.current && monaco) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [currentStepData?.activeLine, monaco]);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleInsert = (val: string, idx?: number) => {
    if (localStructure) {
      setLocalStructure(insertValue(localStructure, val, idx, ''));
    }
  };

  const handleDelete = (val: string, idx?: number) => {
    if (localStructure) {
      setLocalStructure(deleteValue(localStructure, val, idx));
    }
  };

  const render3DComponent = () => {
    if (!parsedData || !localStructure) return null;
    const type = parsedData.type;
    const step = parsedData.steps[Math.min(currentStep, parsedData.steps.length - 1)];
    const activeIndex = step.highlight || [];
    
    // Extract linear data from the mutated structure instead of static step values
    const linearData = (localStructure.type === 'array' || localStructure.type === 'stack' || localStructure.type === 'queue')
      ? localStructure.elements.map(e => Number(e.value) || e.value)
      : (localStructure.type === 'linked-list' ? localStructure.nodes.map(n => Number(n.value) || n.value) : []);


    switch (type) {
      case 'array':
        return <Array3D data={linearData as any} activeIndex={activeIndex as number[]} variant="Dynamic Array" capacity={(localStructure as any).capacity || 10} />;
      case 'linked-list':
        return <LinkedList3D data={linearData as any} activeIndex={activeIndex as number[]} variant="Singly Linked" />;
      case 'binary-tree':
        return <BinaryTree3D activeIndex={activeIndex as number[]} variant="Standard BST" dsState={localStructure as any} />;
      case 'graph':
        return <Graph3D activeIndex={activeIndex as any} variant="Directed" dsState={localStructure as any} />;
      default:
        return null;
    }
  };

  // Convert the type string into a readable format for the Toolbar
  const activeDsFormatted = parsedData.type === 'linked-list' ? 'Linked List' : parsedData.type === 'binary-tree' ? 'Binary Tree' : parsedData.type === 'graph' ? 'Graph' : 'Array';

  return (
    <div className="my-6 rounded-xl overflow-hidden bg-black/40 border border-[var(--color-border-subtle)] shadow-lg relative flex flex-col w-full">
      <div className="absolute top-2 left-3 z-10 flex flex-col gap-1">
        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md shadow-sm w-max">
          🎬 AI Animated 3D Simulation
        </div>
      </div>

      <div className="absolute top-2 right-2 z-10">
        <VisualizerToolbar onInsert={handleInsert} onDelete={handleDelete} activeDs={activeDsFormatted} />
      </div>
      
      {/* 3D Scene and Code Layout */}
      <div className={`w-full relative z-0 flex ${parsedData.code ? 'flex-col lg:flex-row' : 'flex-col'}`}>
        
        {/* Canvas Area */}
        <div className={`${parsedData.code ? 'h-[300px] lg:h-[400px] lg:flex-1' : 'h-[350px] w-full'} pointer-events-auto relative bg-gradient-to-b from-[#0f172a] to-[#1e293b]`}>
          <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />
            <Environment preset="city" />
            
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            <Asteroids count={100} />
            <Sparkles count={50} scale={12} size={2} speed={0.4} opacity={0.2} color="#818cf8" />

            {render3DComponent()}
            <CinematicCamera isPlaying={isPlaying} />

            <ContactShadows 
              position={[0, -2, 0]} 
              opacity={0.5} 
              scale={20} 
              blur={2} 
              far={4} 
              color="#000000"
            />

            <OrbitControls 
              makeDefault
              enablePan={false}
              minDistance={5}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2 + 0.1}
            />
          </Canvas>
        </div>

        {/* Live Code Viewer Area */}
        {parsedData.code && (
          <div className="lg:w-[400px] h-[300px] lg:h-[400px] border-t lg:border-t-0 lg:border-l border-[var(--color-border-subtle)] bg-[#1e1e1e] relative">
            <div className="absolute top-0 left-0 right-0 bg-[#252526] text-[10px] uppercase font-bold text-gray-400 px-3 py-1 border-b border-[#3c3c3c] flex justify-between items-center z-10">
              <span>Execution State</span>
              {currentStepData.activeLine && <span className="text-blue-400">Line: {currentStepData.activeLine}</span>}
            </div>
            <div className="h-full pt-6">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={parsedData.code}
                theme="vs-dark"
                onMount={handleEditorMount}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: 'none',
                  scrollbar: { alwaysConsumeMouseWheel: false }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls & Description */}
      <div className="p-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-subtle)] flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-gray-300">
            Step {currentStep + 1} of {stepCount}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!soundEnabled) initAudio();
                setSoundEnabled(!soundEnabled);
              }}
              className={`px-3 py-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                soundEnabled ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
              }`}
            >
              {soundEnabled ? <><Volume2 size={14} /> Sound On</> : <><VolumeX size={14} /> Muted</>}
            </button>
            <button
              onClick={() => {
                if (!isPlaying) initAudio();
                setIsPlaying(!isPlaying);
              }}
              className="px-3 py-1.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Auto-Play</>}
            </button>
            <button
              onClick={() => { 
                initAudio();
                setCurrentStep(prev => Math.max(0, prev - 1)); 
                setIsPlaying(false); 
              }}
              disabled={currentStep === 0}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={() => { 
                initAudio();
                setCurrentStep(prev => Math.min(stepCount - 1, prev + 1)); 
                setIsPlaying(false); 
              }}
              disabled={currentStep === stepCount - 1}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-200 leading-relaxed font-medium min-h-[40px]">
          {currentStepData.description}
        </p>
      </div>
    </div>
  );
}
