import useReducedMotion from '../visualizer/useReducedMotion';
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface DpGreedyAlgorithms3DProps {
  algoType: string;
  dpTable?: number[][];
  dpArray?: number[];
  intervals?: { id: string; start: number; end: number; selected: boolean; color?: string }[];
  huffmanNodes?: { id: string; label: string; freq: number; code?: string; x?: number; y?: number; left?: string; right?: string }[];
  pegs?: number[][];
}

export default function DpGreedyAlgorithms3D({
  algoType,
  dpTable,
  dpArray,
  intervals,
  huffmanNodes,
  pegs
}: DpGreedyAlgorithms3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion=useReducedMotion();

  // Slow rotation for visual dynamic effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = reducedMotion ? 0 : Math.sin(state.clock.getElapsedTime() * 0.15) * 0.15;
    }
  });

  // Render Fibonacci: A staircase of computed numbers
  if (algoType === 'fibonacci' && dpArray) {
    return (
      <group ref={groupRef} position={[0, -1, 0]}>
        {dpArray.map((val, idx) => {
          const height = idx * 0.5 + 0.5;
          const isCalculated = val > 0 || idx === 0;
          return (
            <group key={idx} position={[(idx - 3) * 1.5, idx * 0.3, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.2, height, 1.2]} />
                <meshStandardMaterial
                  color={isCalculated ? '#10b981' : '#1e293b'}
                  roughness={0.2}
                  metalness={0.8}
                  emissive={isCalculated ? '#047857' : '#000000'}
                  emissiveIntensity={0.3}
                />
              </mesh>
              <Billboard position={[0, height / 2 + 0.4, 0]}>
                <Text fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle">
                  {`F(${idx})`}
                </Text>
                <Text fontSize={0.5} position={[0, -0.4, 0]} color="#fbbf24" fontWeight="bold">
                  {isCalculated ? val.toString() : '?'}
                </Text>
              </Billboard>
            </group>
          );
        })}
      </group>
    );
  }

  // Render Knapsack/LCS 3D Grid Matrices
  if ((algoType === 'knapsack' || algoType === 'lcs') && dpTable) {
    const rows = dpTable.length;
    const cols = dpTable[0]?.length || 0;

    return (
      <group ref={groupRef} position={[-cols / 2 + 0.5, -rows / 2 + 0.5, 0]}>
        {dpTable.map((row, ri) =>
          row.map((val, ci) => {
            const hasValue = val > 0;
            const depth = hasValue ? 1 + val * 0.2 : 0.4;
            const color = algoType === 'knapsack'
              ? (ri === 2 && ci === 5 ? '#f43f5e' : hasValue ? '#3b82f6' : '#1e293b')
              : (val === 2 ? '#10b981' : val === 1 ? '#eab308' : '#1e293b');
            const emissive = hasValue ? color : '#000000';

            return (
              <group key={`${ri}-${ci}`} position={[ci * 1.5, ri * 1.5, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.1, 1.1, depth]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.7}
                    emissive={emissive}
                    emissiveIntensity={0.2}
                  />
                </mesh>
                <Billboard position={[0, 0, depth / 2 + 0.1]}>
                  <Text fontSize={0.4} color="#ffffff" fontWeight="bold">
                    {val.toString()}
                  </Text>
                </Billboard>
              </group>
            );
          })
        )}
      </group>
    );
  }

  // Render Activity Selection timelines
  if (algoType === 'activity-selection' && intervals) {
    return (
      <group ref={groupRef} position={[0, 0, 0]}>
        {intervals.map((act, idx) => {
          const width = act.end - act.start;
          const xPos = (act.start + act.end) / 2 - 4; // center alignment offset
          const yPos = idx * 1.2 - 2;
          const color = act.selected ? '#10b981' : act.color?.includes('239') ? '#ef4444' : '#3b82f6';

          return (
            <group key={act.id} position={[xPos, yPos, 0]}>
              <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
                <boxGeometry args={[width, 0.6, 0.6]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.2}
                  metalness={0.8}
                  emissive={color}
                  emissiveIntensity={act.selected ? 0.3 : 0.1}
                />
              </mesh>
              <Billboard position={[0, 0.6, 0]}>
                <Text fontSize={0.3} color="#ffffff">
                  {`${act.id} (${act.start}-${act.end})`}
                </Text>
              </Billboard>
            </group>
          );
        })}
      </group>
    );
  }

  // Render Huffman Binary Tree structure
  if (algoType === 'huffman-coding' && huffmanNodes) {
    return (
      <group ref={groupRef} position={[0, -0.5, 0]}>
        {huffmanNodes.map((node) => {
          const isCombine = node.id.length > 1;
          const color = isCombine ? '#eab308' : '#3b82f6';

          return (
            <group key={node.id} position={[node.x || 0, node.y || 0, 0]}>
              {/* Node Sphere */}
              <mesh castShadow>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.1}
                  metalness={0.9}
                  emissive={color}
                  emissiveIntensity={0.2}
                />
              </mesh>

              <Billboard position={[0, 0.7, 0]}>
                <Text fontSize={0.25} color="#ffffff" fontWeight="bold">
                  {node.label}
                </Text>
                <Text fontSize={0.2} position={[0, -0.2, 0]} color="#94a3b8">
                  {`f: ${node.freq}`}
                </Text>
                {node.code && (
                  <Text fontSize={0.25} position={[0, -0.4, 0]} color="#10b981" fontWeight="extrabold">
                    {`code: ${node.code}`}
                  </Text>
                )}
              </Billboard>
            </group>
          );
        })}
      </group>
    );
  }


  // Render Tower of Hanoi pegs and disks
  if (algoType === 'hanoi' && pegs) {
    const pegColors = ['#eab308', '#3b82f6', '#f43f5e'];
    return (
      <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* Render 3 Pegs */}
        {[-3, 0, 3].map((x, pIdx) => (
          <group key={pIdx} position={[x, 0, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.08, 0.08, 3.5, 16]} />
              <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 1.75, 0]} castShadow>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, -1.75, 0]} receiveShadow>
              <boxGeometry args={[2.2, 0.15, 2.2]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.5} />
            </mesh>
            <Billboard position={[0, 2.2, 0]}>
              <Text fontSize={0.35} color="#ffffff" fontWeight="bold">
                {pIdx === 0 ? 'Peg A' : pIdx === 1 ? 'Peg B' : 'Peg C'}
              </Text>
            </Billboard>

            {/* Render Disks on this Peg */}
            {(pegs[pIdx] || []).map((diskSize, dIdx) => {
              const radius = diskSize * 0.45;
              const yPos = -1.6 + dIdx * 0.35 + 0.15;
              const color = pegColors[diskSize - 1] || '#a855f7';

              return (
                <mesh key={diskSize} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
                  <torusGeometry args={[radius * 0.45, 0.18, 16, 32]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.15}
                    metalness={0.85}
                    emissive={color}
                    emissiveIntensity={0.25}
                  />
                </mesh>
              );
            })}
          </group>
        ))}
      </group>
    );
  }

  return null;
}
