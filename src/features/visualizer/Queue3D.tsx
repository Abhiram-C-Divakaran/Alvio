import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface Queue3DProps {
  data?: any[];
  activeIndex?: number | number[] | null;
  variant?: string;
  baseColor?: string;
  reducedMotion?: boolean;
}

export default function Queue3D({ data = [], activeIndex = null, variant = 'Linear Queue', baseColor, reducedMotion = false }: Queue3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spacing = 1.5;
  const totalWidth = (data.length - 1) * spacing;
  const startX = totalWidth / 2; // Front is at the right, Rear is at the left

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
      if (variant === 'Circular Queue') {
        groupRef.current.rotation.z = reducedMotion ? 0 : state.clock.elapsedTime * 0.2;
      }
    }
  });

  const isCircular = variant === 'Circular Queue';
  const isPriority = variant === 'Priority Queue';
  const isDeque = variant === 'Deque';
  const isGhost = false;

  return (
    <group ref={groupRef}>
      {/* Glowing Portals for Enqueue/Dequeue */}
      {!isCircular && (
        <>
          {/* Dequeue Portal (Front) */}
          <group position={[startX + 1.5, 0, 0]}>
            <Billboard position={[0, 1.8, 0]}>
              <Text fontSize={0.3} color="#22d3ee" outlineWidth={0.02} outlineColor="#000">
                {isDeque ? 'FRONT ↔' : 'DEQUEUE →'}
              </Text>
            </Billboard>
          </group>

          {/* Enqueue Portal (Rear) */}
          <group position={[-startX - 1.5, 0, 0]}>
            <Billboard position={[0, 1.8, 0]}>
              <Text fontSize={0.3} color="#f472b6" outlineWidth={0.02} outlineColor="#000">
                {isDeque ? '↔ REAR' : '← ENQUEUE'}
              </Text>
            </Billboard>
          </group>
        </>
      )}

      {isCircular && (
        <mesh>
          <torusGeometry args={[2.5, 0.06, 16, 100]} />
          <meshStandardMaterial 
            color="#a855f7" 
            emissive="#a855f7" 
            emissiveIntensity={1} 
            roughness={0.2}
            metalness={0.8}
            transparent 
            opacity={0.4} 
          />
        </mesh>
      )}

      {/* Queue items */}
      {data.map((value, index) => {
        const isActive = (Array.isArray(activeIndex) ? activeIndex.includes(index) : activeIndex === index) && !isGhost;
        const color = isActive ? '#a855f7' : (baseColor || '#8b5cf6'); // Purple variations
        // Positions
        let xPos = startX - index * spacing;
        let yPos = 0;
        
        if (isCircular) {
          const angle = (index / data.length) * Math.PI * 2;
          const radius = 2.5;
          xPos = Math.cos(angle) * radius;
          yPos = Math.sin(angle) * radius;
        }

        return (
          <group key={index} position={[xPos, yPos, 0]}>
            {/* Robot Body */}
            <RoundedBox args={[1.1, 1.1, 1.1]} radius={0.2} smoothness={4}>
              <meshStandardMaterial 
                color={color} 
                roughness={0.2} 
                metalness={0.8} 
                envMapIntensity={3}
                emissive={isActive ? '#a855f7' : '#000000'}
                emissiveIntensity={0.2}
              />
            </RoundedBox>
            
            {/* Value Display */}
            <Billboard position={[0, 0, 0.58]}>
              <Text fontSize={0.35} color="white" anchorX="center" anchorY="middle">
                [{value}]
              </Text>
            </Billboard>

            {/* Priority Queue Labels */}
            {isPriority && (
              <Billboard position={[0.4, 0.4, 0.6]}>
                <Text fontSize={0.25} color="#fbbf24" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="black">
                  ★ P{index + 1}
                </Text>
              </Billboard>
            )}

            {/* Front & Rear Indicators */}
            <Billboard position={[0, 1.2, 0]}>
              {index === 0 && (
                <Text fontSize={0.4} color="#06b6d4" anchorX="center" anchorY="bottom" outlineWidth={0.03} outlineColor="#000">
                  FRONT
                </Text>
              )}
              {index === data.length - 1 && index !== 0 && (
                <Text fontSize={0.4} color="#ec4899" anchorX="center" anchorY="bottom" outlineWidth={0.03} outlineColor="#000">
                  REAR
                </Text>
              )}
              {index === 0 && index === data.length - 1 && (
                <Text fontSize={0.4} color="#facc15" anchorX="center" anchorY="bottom" outlineWidth={0.03} outlineColor="#000">
                  FRONT & REAR
                </Text>
              )}
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
