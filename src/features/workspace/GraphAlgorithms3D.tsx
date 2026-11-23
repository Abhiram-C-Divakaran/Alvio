import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import Queue3D from '../visualizer/Queue3D';
import OutputArray3D from '../visualizer/OutputArray3D';

interface GraphAlgorithms3DProps {
  algoType?: string;
  activeNodes?: (string | number)[];
  visitedNodes?: (string | number)[];
  activeEdges?: string[][]; // pair of [from, to]
  queue?: string[];
  speed?: number;
}

export default function GraphAlgorithms3D({
  algoType = 'bfs',
  activeNodes = [],
  visitedNodes = [],
  activeEdges = [],
  queue,
}: GraphAlgorithms3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Intentionally removed auto-rotation so the user can manually inspect the graph
    // without it fighting their OrbitControls.
  });

  const isTree = algoType?.includes('traversal');
  const isKahns = algoType === 'kahns-algorithm';

  const kahnsNodes = [
    { id: 'A', val: 'A', x: 0, y: 3, z: -1 },
    { id: 'B', val: 'B', x: -2, y: 1, z: 1 },
    { id: 'C', val: 'C', x: 2, y: 1, z: 1 },
    { id: 'D', val: 'D', x: -2, y: -1, z: -1 },
    { id: 'E', val: 'E', x: 2, y: -1, z: -1 },
    { id: 'F', val: 'F', x: 0, y: -3, z: 1 },
  ];

  const nodes = isKahns ? kahnsNodes : isTree ? [
    { id: 'A', val: 'A', x: 0, y: 2.5, z: 0 },
    { id: 'B', val: 'B', x: -2, y: 0.5, z: 0 },
    { id: 'C', val: 'C', x: 2, y: 0.5, z: 0 },
    { id: 'D', val: 'D', x: -3, y: -1.5, z: 0 },
    { id: 'E', val: 'E', x: -1, y: -1.5, z: 0 },
    { id: 'F', val: 'F', x: 1, y: -1.5, z: 0 },
    { id: 'G', val: 'G', x: 3, y: -1.5, z: 0 },
  ] : [
    { id: 'A', val: 'A', x: 0, y: 2, z: 0 },
    { id: 'B', val: 'B', x: -2.2, y: 0.5, z: 1 },
    { id: 'C', val: 'C', x: 2.2, y: 0.5, z: -1 },
    { id: 'D', val: 'D', x: -1.8, y: -1.5, z: -1 },
    { id: 'E', val: 'E', x: 1.8, y: -1.5, z: 1 },
    { id: 'F', val: 'F', x: 0, y: -3, z: 0 },
  ];

  const treeEdges = [
    { from: 'A', to: 'B', weight: '' },
    { from: 'A', to: 'C', weight: '' },
    { from: 'B', to: 'D', weight: '' },
    { from: 'B', to: 'E', weight: '' },
    { from: 'C', to: 'F', weight: '' },
    { from: 'C', to: 'G', weight: '' },
  ];

  const defaultEdges = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'E', weight: 3 },
    { from: 'D', to: 'E', weight: 2 },
    { from: 'D', to: 'F', weight: 4 },
    { from: 'E', to: 'F', weight: 3 },
  ];

  const edges = isKahns ? [
    { from: 'A', to: 'C', weight: '' },
    { from: 'A', to: 'B', weight: '' },
    { from: 'B', to: 'D', weight: '' },
    { from: 'B', to: 'E', weight: '' },
    { from: 'C', to: 'E', weight: '' },
    { from: 'E', to: 'F', weight: '' },
  ] : isTree ? treeEdges : defaultEdges;

  return (
    <>
      <group ref={groupRef} position={[0, 1.2, 0]}>
        {/* Draw Edges */}
        {edges.map((e, idx) => {
          const n1 = nodes.find(n => n.id === e.from);
          const n2 = nodes.find(n => n.id === e.to);
          if (!n1 || !n2) return null;

          const p1 = new THREE.Vector3(n1.x, n1.y, n1.z);
          const p2 = new THREE.Vector3(n2.x, n2.y, n2.z);
          const distance = p1.distanceTo(p2);
          const center = p1.clone().add(p2).divideScalar(2);
          const direction = p2.clone().sub(p1).normalize();
          const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

          const isActive = activeEdges.some(ae =>
            (ae[0] === e.from && ae[1] === e.to) || (ae[0] === e.to && ae[1] === e.from)
          );

          const edgeColor = isActive ? '#fb923c' : '#475569';
          const edgeWidth = isActive ? 0.05 : 0.02;

          const isDirected = isKahns;
          const arrowPos = p1.clone().lerp(p2, 0.75);

          return (
            <group key={`edge-${idx}`}>
              <mesh position={[center.x, center.y, center.z]} quaternion={quaternion}>
                <cylinderGeometry args={[edgeWidth, edgeWidth, distance, 8]} />
                <meshStandardMaterial
                  color={edgeColor}
                  emissive={edgeColor}
                  emissiveIntensity={isActive ? 1.5 : 0}
                  transparent
                  opacity={isActive ? 0.95 : 0.4}
                />
              </mesh>
              {isDirected && (
                <mesh position={[arrowPos.x, arrowPos.y, arrowPos.z]} quaternion={quaternion}>
                  <coneGeometry args={[edgeWidth * 4, 0.4, 8]} />
                  <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={isActive ? 1.5 : 0} />
                </mesh>
              )}
              {e.weight && (
                <Billboard position={[center.x, center.y + 0.25, center.z]}>
                  <Text fontSize={0.22} color="#94a3b8" outlineColor="#000" outlineWidth={0.01}>
                    {e.weight}
                  </Text>
                </Billboard>
              )}
            </group>
          );
        })}

        {/* Draw Nodes */}
        {nodes.map((n) => {
          const isActive = activeNodes.includes(n.id);
          const isVisited = visitedNodes.includes(n.id);

          // Use the exact colors from the design
          let nodeColor = '#6366f1'; // Default: Indigo/Purple
          if (isActive) nodeColor = '#fb923c'; // Active: Orange
          else if (isVisited) nodeColor = '#10b981'; // Visited: Green

          return (
            <group key={n.id} position={[n.x, n.y, n.z]}>
              {/* Glassy Planet Sphere */}
              <Sphere args={[0.4, 32, 32]}>
                <meshPhysicalMaterial
                  color={nodeColor}
                  emissive={nodeColor}
                  emissiveIntensity={isActive ? 0.8 : 0.4}
                  roughness={0.15}
                  metalness={0.2}
                  transmission={0.4}
                  thickness={0.5}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
                />
              </Sphere>

              {/* Saturn Ring */}
              <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                <torusGeometry args={[0.55, 0.015, 16, 64]} />
                <meshStandardMaterial 
                  color={nodeColor} 
                  emissive={nodeColor} 
                  emissiveIntensity={isActive ? 2 : 1.5} 
                />
              </mesh>

              {/* Node Text & Emoticon */}
              <Billboard position={[0, 0, 0.45]}>
                <group position={[0, 0.05, 0]}>
                  <Text fontSize={0.3} color="white" fontWeight="bold" anchorX="center" anchorY="middle">
                    {n.id}
                  </Text>
                  <Text position={[0, -0.18, 0]} fontSize={0.14} color="#38bdf8" fontWeight="bold" anchorX="center" anchorY="middle">
                    {isActive ? '^o^' : '._.'}
                  </Text>
                </group>
              </Billboard>
            </group>
          );
        })}

      </group>

      {/* Result Row Title for Kahn's Algorithm */}
      {isKahns && (
        <group position={[0, -3.5, 0]} scale={0.9}>
          <OutputArray3D data={visitedNodes} capacity={nodes.length} />
        </group>
      )}

      {/* Draw Queue for Kahn's Algorithm */}
      {isKahns && queue !== undefined && (
        <group position={[0, -6.5, 0]} scale={0.9}>
          <Billboard position={[0, 1.5, 0]}>
            <Text fontSize={0.4} color="#007aff" fontWeight="bold">
              Queue: Simple Queue
            </Text>
          </Billboard>
          <group position={[0, -0.5, 0]}>
            <Queue3D data={queue as any} />
          </group>
        </group>
      )}
    </>
  );
}
