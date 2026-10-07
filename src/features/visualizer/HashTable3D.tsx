import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { HashTableStructure } from '../../types/dataStructures';

interface HashTable3DProps {
  activeIndex?: number | number[] | null;
  activeItem?: string | null;
  variant?: string;
  dsState?: HashTableStructure | null;
  baseColor?: string;
  reducedMotion?: boolean;
}

export default function HashTable3D({ activeIndex = null, activeItem = null, variant = 'Chaining', dsState, baseColor, reducedMotion = false }: HashTable3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const buckets = dsState ? dsState.size : 5;
  const spacing = 1.8;
  const startX = -((buckets - 1) * spacing) / 2;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.5) * 0.1) - 1;
    }
  });

  const isChaining = variant === 'Chaining';
  const isOpenAddressing = variant === 'Open Addressing';
  const isConcurrent = variant === 'Concurrent Hash';

  return (
    <group ref={groupRef}>
      {/* Buckets */}
      {Array.from({ length: buckets }).map((_, index) => {
        const isActive = Array.isArray(activeIndex) ? activeIndex.includes(index) : activeIndex === index;
        const xPos = startX + index * spacing;
        
        return (
          <group key={index} position={[xPos, 0, 0]}>
            {/* Bucket Container */}
            <Box args={[1.4, isOpenAddressing ? 1.4 : 2, 1.4]}>
              <meshStandardMaterial 
                color={isActive ? '#14b8a6' : (baseColor || '#1e293b')} 
                roughness={0.1}
                metalness={0.9} 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
                emissive={isActive ? '#14b8a6' : '#000000'}
                emissiveIntensity={isActive ? 0.5 : 0}
              />
            </Box>
            
            {/* Glowing Base Ring */}
            <mesh position={[0, isOpenAddressing ? -0.7 : -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 0.9, 32]} />
              <meshStandardMaterial color={isActive ? '#14b8a6' : (baseColor || '#475569')} emissive={isActive ? '#14b8a6' : (baseColor || '#475569')} emissiveIntensity={isActive ? 2 : 0.5} />
            </mesh>
            
            <Billboard position={[0, isOpenAddressing ? -1.2 : -1.5, 0]}>
              <Text fontSize={0.4} color="#94a3b8" outlineWidth={0.02} outlineColor="#000">
                Index [{index}]
              </Text>
            </Billboard>

            {/* Concurrent Hash Locks */}
            {isConcurrent && (
              <Billboard position={[0, 1.5, 0]}>
                <Text fontSize={0.5} color={isActive ? "#ef4444" : "#22c55e"}>
                  {isActive ? '🔒' : '🔓'}
                </Text>
              </Billboard>
            )}

            {/* Dynamic Entries or Mock Entries */}
            {isChaining && (
              <group position={[0, -0.4, 0]}>
                {dsState 
                  ? dsState.buckets[index]?.entries.map((entry, eIdx) => (
                      <group key={entry.id} position={[0, -eIdx * 0.8, 0]}>
                        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                          <octahedronGeometry args={[0.35]} />
                          <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={1} roughness={0.1} metalness={0.8} />
                        </mesh>
                        <Billboard position={[0, 0, 0.5]}>
                          <Text fontSize={0.25} color="black" outlineWidth={0.01} outlineColor="#fff">
                            {entry.value}
                          </Text>
                        </Billboard>
                        {eIdx > 0 && (
                          <mesh position={[0, 0.4, 0]}>
                            <cylinderGeometry args={[0.01, 0.01, 0.4]} />
                            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
                          </mesh>
                        )}
                      </group>
                    ))
                  : (index % 2 === 0 && (
                      <>
                        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                          <octahedronGeometry args={[0.35]} />
                          <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={1} roughness={0.1} metalness={0.8} />
                        </mesh>
                        <mesh position={[0, 0.4, 0]}>
                          <cylinderGeometry args={[0.01, 0.01, 0.4]} />
                          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
                        </mesh>
                      </>
                    ))
                }
              </group>
            )}
          </group>
        );
      })}

      {/* Floating Item being hashed */}
      {activeItem && (
        <group position={[0, 3, 0]}>
          <Box args={[0.8, 0.8, 0.8]}>
            <meshStandardMaterial color="#f43f5e" />
          </Box>
          <Billboard position={[0, 0, 0.45]}>
            <Text fontSize={0.3} color="white">
              {activeItem}
            </Text>
          </Billboard>
          <Billboard position={[0, 0.8, 0]}>
            <Text fontSize={0.3} color="#f43f5e">
              Hashing...
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
}
