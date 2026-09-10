import { useRef } from 'react';

import { Text, Sphere, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { GraphStructure } from '../../types/dataStructures';

interface Graph3DProps {
  activeIndex?: string | string[] | null;
  variant?: string;
  dsState?: GraphStructure | null;
  baseColor?: string;
}

export default function Graph3D({ activeIndex = null, variant = 'Directed Graph', dsState, baseColor }: Graph3DProps) {
  const groupRef = useRef<THREE.Group>(null);



  const isDirected = variant === 'Directed Graph';
  const isWeighted = variant === 'Weighted Graph';

  // Simple 3D graph coordinates
  // Simple 3D graph coordinates
  let nodes: any[] = [];
  let edges: any[] = [];

  if (dsState && dsState.nodes.length > 0) {
    nodes = dsState.nodes.map(n => ({
      id: n.id,
      val: n.value,
      x: n.position.x,
      y: n.position.y,
      z: n.position.z || 0
    }));

    // Convert string IDs to indices for the mapping below
    edges = dsState.edges.map(e => ({
      from: nodes.findIndex(n => n.id === e.from),
      to: nodes.findIndex(n => n.id === e.to),
      weight: e.weight
    })).filter(e => e.from !== -1 && e.to !== -1);
  } else {
    nodes = [
      { id: 'A', val: 'A', x: 0, y: 2, z: 0 },
      { id: 'B', val: 'B', x: -2, y: -1, z: 1 },
      { id: 'C', val: 'C', x: 2, y: -1, z: -1 },
      { id: 'D', val: 'D', x: -1, y: -2, z: -2 },
      { id: 'E', val: 'E', x: 2, y: 1, z: 2 },
    ];

    edges = [
      { from: 0, to: 1, weight: 4 }, // A -> B
      { from: 0, to: 2, weight: 2 }, // A -> C
      { from: 0, to: 4, weight: 7 }, // A -> E
      { from: 1, to: 3, weight: 1 }, // B -> D
      { from: 2, to: 3, weight: 3 }, // C -> D
      { from: 2, to: 4, weight: 5 }, // C -> E
    ];
  }

  return (
    <group ref={groupRef}>
      {/* Edges */}
      {edges.map((edge, i) => {
        const p1 = new THREE.Vector3(nodes[edge.from].x, nodes[edge.from].y, nodes[edge.from].z);
        const p2 = new THREE.Vector3(nodes[edge.to].x, nodes[edge.to].y, nodes[edge.to].z);
        const distance = p1.distanceTo(p2);
        
        // Orient the cylinder along the direction vector
        const center = p1.clone().add(p2).divideScalar(2);
        const direction = p2.clone().sub(p1).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        const isEdgeActive = Array.isArray(activeIndex) && 
          activeIndex.includes(nodes[edge.from].id) && 
          activeIndex.includes(nodes[edge.to].id);
        const edgeColor = isEdgeActive ? '#f97316' : '#64748b';
        const edgeOpacity = isEdgeActive ? 0.9 : 0.4;

        return (
          <group key={`edge-${i}`}>
            <mesh position={[center.x, center.y, center.z]} quaternion={quaternion}>
              <cylinderGeometry args={[0.02, 0.02, distance, 8]} />
              <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={isEdgeActive ? 2 : 0.5} transparent opacity={edgeOpacity} />
            </mesh>
            
            {/* Directed Arrowhead */}
            {isDirected && (
              <mesh position={[center.x, center.y, center.z]} quaternion={quaternion}>
                <cylinderGeometry args={[0, 0.2, 0.4, 8]} />
                <meshStandardMaterial color={edgeColor} />
              </mesh>
            )}

            {/* Weighted Label */}
            {isWeighted && (
              <Billboard position={[center.x, center.y + 0.3, center.z]}>
                <Text
                  fontSize={0.3}
                  color="#fbbf24"
                  outlineWidth={0.02}
                  outlineColor="#000000"
                >
                  {edge.weight}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isActive = activeIndex === node.id || (Array.isArray(activeIndex) && activeIndex.includes(node.id));
        const color = isActive ? '#3B82F6' : (baseColor || '#8B5CF6'); // Blue active, Purple normal

        return (
          <group key={node.id} position={[node.x, node.y, node.z]}>
            <Sphere args={[0.5, 32, 32]}>
              <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={isActive ? 0.8 : 0.4}
                  roughness={0.15}
                  metalness={0.2}
                  transmission={0.4}
                  thickness={0.5}
                  clearcoat={1}
                  clearcoatRoughness={0.1}
              />
            </Sphere>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.7, 0.8, 32]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 2 : 0.5} side={THREE.DoubleSide} />
            </mesh>
            <Billboard position={[0, 0, 0.6]}>
              <Text fontSize={0.35} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
                {node.val}
              </Text>
            </Billboard>
            <Billboard position={[0, -0.3, 0.6]}>
              <Text fontSize={0.2} color="#38bdf8" anchorX="center" anchorY="middle">
                {isActive ? '^o^' : '•_•'}
              </Text>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
