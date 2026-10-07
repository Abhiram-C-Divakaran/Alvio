import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html, Environment, ContactShadows, Sparkles, Billboard } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Asteroids from '../visualizer/Asteroids';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Sparkles as SparklesIcon, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import Card from '../../components/ui/Card';

interface SkillNode {
  id: string;
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  angleOffset: number;
  color: string;
  path: string;
  desc: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hasRing: boolean;
  size: number;
}

const skillNodes: SkillNode[] = [
  { id: 'arrays', name: 'Arrays', orbitRadius: 4.0, orbitSpeed: 0.6, angleOffset: 0, color: '#60A5FA', path: '/learn/array', desc: 'Contiguous memory mapping, indexes and offset arithmetic.', difficulty: 'Easy', hasRing: false, size: 0.6 },
  { id: 'linked-lists', name: 'Linked Lists', orbitRadius: 6.0, orbitSpeed: 0.55, angleOffset: Math.PI / 4, color: '#A78BFA', path: '/learn/linked-list', desc: 'Dynamic node structures, single/double pointer links.', difficulty: 'Easy', hasRing: true, size: 0.6 },
  { id: 'stacks', name: 'Stacks', orbitRadius: 8.0, orbitSpeed: 0.5, angleOffset: Math.PI, color: '#F472B6', path: '/learn/stack', desc: 'LIFO operational models, rings and buffers.', difficulty: 'Easy', hasRing: false, size: 0.4 },
  { id: 'queues', name: 'Queues', orbitRadius: 10.0, orbitSpeed: 0.45, angleOffset: Math.PI * 1.5, color: '#34D399', path: '/learn/queue', desc: 'FIFO operational models, rings and buffers.', difficulty: 'Easy', hasRing: false, size: 0.4 },
  { id: 'graphs', name: 'Graphs', orbitRadius: 14.0, orbitSpeed: 0.35, angleOffset: Math.PI * 1.6, color: '#EC4899', path: '/learn/graph', desc: 'BFS, DFS traversals and Dijkstra shortest path bounds.', difficulty: 'Hard', hasRing: true, size: 1.1 },
  { id: 'binary-tree', name: 'Trees', orbitRadius: 16.0, orbitSpeed: 0.3, angleOffset: Math.PI * 0.75, color: '#F87171', path: '/learn/binary-tree', desc: 'Binary search trees, traversal recursions and AVL balance.', difficulty: 'Medium', hasRing: false, size: 0.9 },
  { id: 'hash-table', name: 'Hash Tables', orbitRadius: 18.0, orbitSpeed: 0.25, angleOffset: Math.PI * 0.2, color: '#FBBF24', path: '/learn/hash-table', desc: 'Key-value mapping with hash functions and collision handling.', difficulty: 'Medium', hasRing: false, size: 0.7 },
  { id: 'heap', name: 'Heap', orbitRadius: 20.0, orbitSpeed: 0.2, angleOffset: Math.PI * 1.2, color: '#F97316', path: '/learn/heap', desc: 'Priority queues, complete binary trees and heapify algorithms.', difficulty: 'Medium', hasRing: false, size: 0.5 }
];

function PlanetNode({ node, onHover, onClick }: { node: SkillNode; onHover: (n: SkillNode | null) => void; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Rotate planet and revolve around orbit
  useFrame((state, delta) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      const angle = (t * node.orbitSpeed) + node.angleOffset;
      groupRef.current.position.x = Math.cos(angle) * node.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * node.orbitRadius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(node);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Inner Core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[hovered ? node.size * 0.7 : node.size * 0.6, 0]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered ? 2.5 : 1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Outer Glass Shell */}
      <mesh>
        <sphereGeometry args={[hovered ? node.size * 1.2 : node.size, 64, 64]} />
        <meshPhysicalMaterial
          color={node.color}
          transmission={0.9}
          opacity={1}
          transparent={true}
          roughness={0.1}
          ior={1.5}
          thickness={1.5}
          emissive={node.color}
          emissiveIntensity={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Visual ring for aesthetic */}
      {node.hasRing && (
        <mesh rotation={[Math.PI / 2.2, Math.PI / 8, 0]}>
          <ringGeometry args={[node.size + 0.3, node.size + 0.45, 64]} />
          <meshStandardMaterial
            color={node.color}
            side={THREE.DoubleSide}
            transparent
            opacity={hovered ? 0.8 : 0.4}
            emissive={node.color}
            emissiveIntensity={1.5}
          />
        </mesh>
      )}

      <React.Suspense fallback={null}>
        <Text
          position={[0, 1.1, 0]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {node.name}
        </Text>
      </React.Suspense>
    </group>
  );
}

function SunNode() {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Sun Core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#FDE047"
          emissiveIntensity={2}
          roughness={0.2}
        />
      </mesh>

      {/* Sun Corona */}
      <mesh>
        <sphereGeometry args={[1.65, 64, 64]} />
        <meshBasicMaterial
          color="#FDE047"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Solar Flares / Sparkles */}
      <Sparkles count={80} scale={4.5} size={4} speed={0.4} opacity={0.4} color="#FEF08A" />

      <React.Suspense fallback={null}>
        <Text
          position={[0, 1.9, 0]}
          fontSize={0.45}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Data Structures & Algorithms
        </Text>
      </React.Suspense>
    </group>
  );
}

function OrbitRings() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {skillNodes.map(node => (
        <mesh key={node.id}>
          <ringGeometry args={[node.orbitRadius - 0.02, node.orbitRadius + 0.02, 128]} />
          <meshBasicMaterial
            color={node.color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function AsteroidBelt({ radius = 12, count = 200 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  const asteroids = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius + (Math.random() - 0.5) * 1.2;
      const y = (Math.random() - 0.5) * 0.8;
      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;
      const scale = 0.05 + Math.random() * 0.15;
      const speed = 0.02 + Math.random() * 0.04;
      temp.push({ angle, dist, y, rx, ry, rz, scale, speed });
    }
    return temp;
  }, [count, radius]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      asteroids.forEach((ast, i) => {
        ast.angle += ast.speed * delta;
        ast.rx += ast.speed * delta;
        ast.ry += ast.speed * delta;

        const x = Math.cos(ast.angle) * ast.dist;
        const z = Math.sin(ast.angle) * ast.dist;

        dummy.position.set(x, ast.y, z);
        dummy.rotation.set(ast.rx, ast.ry, ast.rz);
        dummy.scale.set(ast.scale, ast.scale, ast.scale);
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        navigate('/learn/algorithms');
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={hovered ? "#cbd5e1" : "#475569"} roughness={0.6} metalness={0.8} emissive={hovered ? "#334155" : "#000000"} />
      </instancedMesh>
      {/* Label for Asteroid Belt */}
      <React.Suspense fallback={null}>
        <Text
          position={[0, 1.2, radius]}
          fontSize={hovered ? 0.45 : 0.4}
          color={hovered ? "#ffffff" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 4, 0, 0]}
        >
          Algorithms (Click to Enter)
        </Text>
      </React.Suspense>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.7, radius + 0.7, 128]} />
        <meshBasicMaterial color="#64748b" side={THREE.DoubleSide} transparent opacity={hovered ? 0.15 : 0.05} />
      </mesh>
    </group>
  );
}

function CameraTransition({ zoomingTo, onComplete }: { zoomingTo: SkillNode | null, onComplete: () => void }) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  const target = new THREE.Vector3();

  useFrame((state, delta) => {
    if (zoomingTo) {
      const t = state.clock.getElapsedTime();
      const angle = (t * zoomingTo.orbitSpeed) + zoomingTo.angleOffset;
      const x = Math.cos(angle) * zoomingTo.orbitRadius;
      const z = Math.sin(angle) * zoomingTo.orbitRadius;

      target.set(x, 0, z);
      vec.set(x, zoomingTo.size * 0.5, z + zoomingTo.size + 2.0); // position right in front of it

      camera.position.lerp(vec, delta * 3.5); // smooth swish
      camera.lookAt(target);

      if (camera.position.distanceTo(vec) < 0.2) {
        onComplete();
      }
    }
  });
  return null;
}

export default function SkillTreeMap() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [zoomingTo, setZoomingTo] = useState<SkillNode | null>(null);
  const isNavigating = useRef(false);

  const handleZoomComplete = () => {
    if (!isNavigating.current && zoomingTo) {
      isNavigating.current = true;
      navigate(zoomingTo.path, { state: { planetColor: zoomingTo.color } });
    }
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-transparent text-white" style={{height:"calc(100dvh - var(--app-header-height) - 2 * var(--app-content-gutter))",minHeight:500}}>

      {/* 3D Canvas Viewport */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 1, 10.5], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#818cf8" />
          <Environment preset="night" />

          {/* Ambient Particles for Premium Feel */}
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <Asteroids count={150} />
          <Sparkles count={100} scale={15} size={2} speed={0.2} opacity={0.1} color="#818cf8" />

          <Billboard position={[0, 4.0, -3]}>
            <Text fontSize={0.6} color="#ffffff" outlineWidth={0.03} outlineColor="#000000" anchorX="center" anchorY="middle">
              Syllabus Constellation
            </Text>
          </Billboard>

          <SunNode />
          <OrbitRings />
          <AsteroidBelt radius={12} count={300} />

          {skillNodes.map(node => (
            <PlanetNode
              key={node.id}
              node={node}
              onHover={setSelectedNode}
              onClick={() => {
                if (!zoomingTo) setZoomingTo(node);
              }}
            />
          ))}

          <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={20} blur={2} far={4} color="#000000" />

          {zoomingTo && <CameraTransition zoomingTo={zoomingTo} onComplete={handleZoomComplete} />}

          {!zoomingTo && (
            <OrbitControls
              enableZoom={true}
              maxDistance={35}
              minDistance={4}
              enablePan={true}
              autoRotate
              autoRotateSpeed={0.15}
            />
          )}

          <EffectComposer>
            <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={2.0} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Floating UI HUD elements */}
      <div className="relative z-10 flex-shrink-0 px-8 py-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/5 pointer-events-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Syllabus Constellation <SparklesIcon className="text-indigo-400" size={16} />
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Interactive 3D Curriculum Sandbox</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <Info size={12} /> Drag to orbit, scroll to zoom. Click node to enter.
        </div>
      </div>

      {/* Dynamic Detail Tooltip Card */}
      <div className="absolute bottom-8 left-8 z-10 max-w-sm pointer-events-none">
        {selectedNode ? (
          <Card strong gradientBorder className="p-5 space-y-3.5 bg-black/50 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all scale-100 duration-200">
            <div className="flex justify-between items-center">
              <span
                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border"
                style={{ borderColor: selectedNode.color, color: selectedNode.color }}
              >
                {selectedNode.difficulty}
              </span>
              <span className="text-[9px] font-mono text-gray-500">ID: {selectedNode.id}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">{selectedNode.name}</h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed mt-1">{selectedNode.desc}</p>
            </div>
            <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 pt-1.5 border-t border-white/5">
              <SparklesIcon size={10} /> Click planet to open module
            </div>
          </Card>
        ) : (
          <Card strong className="p-5 bg-black/30 backdrop-blur-md border border-white/5 opacity-40 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <p className="text-xs font-semibold text-gray-400 italic">Hover over an orbital node planet to inspect curriculum parameters...</p>
          </Card>
        )}
      </div>

    </div>
  );
}
