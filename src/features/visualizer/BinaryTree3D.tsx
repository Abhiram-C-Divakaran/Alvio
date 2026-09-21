import { useRef, useEffect, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { BinaryTreeStructure } from '../../types/dataStructures';

interface BinaryTree3DProps {
  activeIndex?: number | number[] | string | string[] | null;
  visitedIndex?: number[] | string[] | null;
  variant?: string;
  dsState?: BinaryTreeStructure | null;
  baseColor?: string;
  onNodeSelect?: (id: string) => void;
  selectedId?: string | null;
  reducedMotion?: boolean;
}

export default function BinaryTree3D({ activeIndex = null, visitedIndex = null, variant = 'Binary Search Tree', dsState, baseColor, onNodeSelect, selectedId, reducedMotion = false }: BinaryTree3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const previousPositions = useRef(new Map<string, [number, number]>());

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  const isAVL = variant === 'AVL Tree';
  const isHeap = variant.includes('Heap');

  let nodes: any[] = [];
  let edges: any[] = [];

  if (dsState) {
    nodes = dsState.nodes.map((n, i) => ({
      id: n.id,
      val: n.value,
      x: n.position.x,
      y: n.position.y - 1.8, // adjust offset
      bf: n.balanceFactor ?? 0,
      index: i,
      operation: n.state
    }));

    // build edges from dsState
    dsState.nodes.forEach((n, i) => {
      const parentIdx = i;
      if (n.left) {
        const leftIdx = dsState.nodes.findIndex(ln => ln.id === n.left);
        if (leftIdx !== -1) edges.push({ from: parentIdx, to: leftIdx });
      }
      if (n.right) {
        const rightIdx = dsState.nodes.findIndex(rn => rn.id === n.right);
        if (rightIdx !== -1) edges.push({ from: parentIdx, to: rightIdx });
      }
    });
  } else {
    nodes = [
      { id: 1, val: isHeap ? 90 : 50, x: 0, y: 3, bf: 0, index: 0 },      // Root
      { id: 2, val: isHeap ? 80 : 30, x: -2, y: 1, bf: 0, index: 1 },     // L
      { id: 3, val: isHeap ? 70 : 70, x: 2, y: 1, bf: 0, index: 2 },      // R
      { id: 4, val: isHeap ? 60 : 20, x: -3, y: -1, bf: 0, index: 3 },    // LL
      { id: 5, val: isHeap ? 50 : 40, x: -1, y: -1, bf: 0, index: 4 },    // LR
      { id: 6, val: isHeap ? 40 : 60, x: 1, y: -1, bf: 0, index: 5 },     // RL
      { id: 7, val: isHeap ? 30 : 80, x: 3, y: -1, bf: 0, index: 6 },     // RR
    ];

    edges = [
      { from: 0, to: 1 }, // Root -> L
      { from: 0, to: 2 }, // Root -> R
      { from: 1, to: 3 }, // L -> LL
      { from: 1, to: 4 }, // L -> LR
      { from: 2, to: 5 }, // R -> RL
      { from: 2, to: 6 }, // R -> RR
    ];
  }

  useEffect(() => {
    previousPositions.current = new Map(nodes.map(n => [String(n.val), [n.x, n.y] as [number, number]]));
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Edges */}
      {edges.map((edge, i) => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        return (
          <group
            key={`edge-${i}`}
            position={[fromNode.x + dx/2, fromNode.y + dy/2, -0.2]}
            rotation={[0, 0, angle + Math.PI/2]}
          >
            <Cylinder args={[0.02, 0.02, distance, 8]}>
              <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={1} />
            </Cylinder>
          </group>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isActive = (Array.isArray(activeIndex) ? (activeIndex as any[]).includes(node.id) || (activeIndex as any[]).includes(node.val) : activeIndex === node.id || activeIndex === node.val);
        const isVisited = (Array.isArray(visitedIndex) ? (visitedIndex as any[]).includes(node.id) || (visitedIndex as any[]).includes(node.val) : false);

        let color = node.index === 0 && isHeap ? '#22baff' : baseColor || '#8B5CF6'; // Purple base
        if (node.operation?.color) color = node.operation.color;
        else if (node.operation?.active) color = '#fbbf24';
        else if (selectedId === node.id || node.operation?.highlighted || isActive) color = '#3B82F6'; // Blue active
        else if (isVisited) color = '#22C55E'; // Green visited

        return (
          <MovingTreeNode key={node.id} x={node.x} y={node.y} value={String(node.val)} from={previousPositions.current.get(String(node.val))} selected={selectedId === node.id} reducedMotion={reducedMotion} onSelect={() => onNodeSelect?.(String(node.id))}>
            <Sphere args={[0.6, 32, 32]}>
              <meshStandardMaterial
                color={color}
                roughness={0.2}
                metalness={0.8}
                envMapIntensity={3}
                transparent
                opacity={0.9}
                emissive={color}
                emissiveIntensity={0.5}
              />
            </Sphere>

            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 0.9, 32]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 2 : 0.5} side={THREE.DoubleSide} />
            </mesh>

            {/* Node Value */}
            <Billboard position={[0, 0, 0.61]}>
              <Text fontSize={0.35} color="white" anchorX="center" anchorY="middle">
                {node.val}
              </Text>
            </Billboard>

            {/* AVL Balance Factor */}
            {isAVL && (
              <Billboard position={[0.7, 0.5, 0]}>
                <Text fontSize={0.25} color="#4ade80" anchorX="center" anchorY="middle">
                  BF: {node.bf}
                </Text>
              </Billboard>
            )}

            {/* Root Label */}
            {node.index === 0 && (
              <Billboard position={[0, 1.2, 0]}>
                <Text fontSize={0.4} color="#facc15" outlineWidth={0.03} outlineColor="#000">
                  ROOT ↓
                </Text>
              </Billboard>
            )}

            {/* Heap Array Index */}
            {isHeap && (
              <Billboard position={[0, -0.9, 0]}>
                <Text fontSize={0.25} color="#94a3b8" anchorX="center" anchorY="middle">
                  [{node.index}]
                </Text>
              </Billboard>
            )}
          </MovingTreeNode>
        );
      })}
    </group>
  );
}

function MovingTreeNode({x, y, value, from, selected, reducedMotion, onSelect, children}: {x:number;y:number;value:string;from?:[number,number];selected:boolean;reducedMotion:boolean;onSelect:()=>void;children:ReactNode}) {
  const ref=useRef<THREE.Group>(null);
  useEffect(()=>{
    if(!ref.current) return;
    ref.current.position.set(reducedMotion ? x : from?.[0] ?? x, reducedMotion ? y : from?.[1] ?? y + .6, 0);
  },[value,x,y,reducedMotion]);
  useFrame((_,delta)=>{
    if(!ref.current) return;
    const t=reducedMotion?1:1-Math.exp(-10*delta);
    ref.current.position.x=THREE.MathUtils.lerp(ref.current.position.x,x,t);
    ref.current.position.y=THREE.MathUtils.lerp(ref.current.position.y,y,t);
    const scale=THREE.MathUtils.lerp(ref.current.scale.x,selected?1.12:1,t);
    ref.current.scale.setScalar(scale);
  });
  return <group ref={ref} position={[x,y,0]} onClick={event=>{event.stopPropagation();onSelect();}}>{children}</group>;
}
