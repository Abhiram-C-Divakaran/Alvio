import useReducedMotion from '../visualizer/useReducedMotion';
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface AlgoTile3DProps {
  val: number;
  xTarget: number;
  yTarget: number;
  color: string;
  isActive: boolean;
  speed?: number;
}

function AlgoTile3D({ val, xTarget, yTarget, color, isActive, speed = 1 }: AlgoTile3DProps) {
  const ref = useRef<THREE.Group>(null);
  const reducedMotion=useReducedMotion();

  // Instantly place on mount so it doesn't animate from (0, 0, 0)
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(xTarget, yTarget, 0);
    }
  }, []);

  useFrame(() => {
    if (ref.current) {
      // Smoothly interpolate position towards target coordinates
      const lerpFactor = reducedMotion ? 1 : 0.12 * speed;
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, xTarget, lerpFactor);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, yTarget, lerpFactor);
    }
  });

  return (
    <group ref={ref}>
      {/* The Box */}
      <RoundedBox
        args={[1.1, 1.1, 1.1]}
        radius={0.15}
        smoothness={4}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={2}
          opacity={0.9}
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </RoundedBox>

      {/* Platform under each item */}
      <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 2 : 0.5} />
      </mesh>

      {/* Value Text (Front of Box) */}
      <Billboard position={[0, 0, 0.58]}>
        <Text
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {val}
        </Text>
      </Billboard>
    </group>
  );
}

interface Algorithms3DProps {
  step: any;
  algoType: string;
  speed?: number;
}

export default function Algorithms3D({ step, algoType, speed = 1 }: Algorithms3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion=useReducedMotion();

  const array = step ? step.array : [];
  const comparing = step ? step.comparing : [];
  const swapping = step ? step.swapping : [];
  const sorted = step ? step.sorted : [];
  const currentIndex = step ? step.currentIndex : -1;
  const foundIndex = step ? step.foundIndex : -1;
  const low = step ? step.low : -1;
  const high = step ? step.high : -1;

  const spacing = 1.5;
  const totalWidth = (array.length - 1) * spacing;
  const startX = -totalWidth / 2;

  const maxVisibleElements = Math.max(array.length, 10);
  const scale = Math.min(1, 10 / maxVisibleElements);

  // Slowly animate the entire array group for a dynamic floating effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={scale} position={[0, -0.5, 0]}>
      {/* Animated Array Tiles */}
      {(() => {
        const seenCount = new Map<number, number>();
        return array.map((val: number, i: number) => {
          const count = seenCount.get(val) || 0;
          seenCount.set(val, count + 1);
          const uniqueKey = `${val}-${count}`;

          const isSearching = algoType === 'linear-search' || algoType === 'binary-search';
          let color = isSearching ? '#ec4899' : '#3b82f6'; // pink for searching, blue for sorting
          let isActive = false;

          if (sorted.includes(i) || foundIndex === i) {
            color = '#10b981'; // green for sorted/found
            isActive = true;
          } else if (swapping.includes(i)) {
            color = '#f59e0b'; // amber for swapping
            isActive = true;
          } else if (comparing.includes(i)) {
            color = '#f43f5e'; // rose for comparing
            isActive = true;
          } else if (algoType === 'binary-search' && i >= low && i <= high) {
            color = '#ec4899'; // pink for active search space
            isActive = true;
          } else if (i === currentIndex) {
            color = '#eab308'; // yellow for current pointer
            isActive = true;
          } else if (algoType === 'binary-search') {
            color = '#475569'; // grayed out if outside search space
          }

          const xPos = startX + i * spacing;
          const yPos = isActive ? 0.4 : 0; // Lift active item slightly

          return (
            <AlgoTile3D
              key={uniqueKey}
              val={val}
              xTarget={xPos}
              yTarget={yPos}
              color={color}
              isActive={isActive}
              speed={speed}
            />
          );
        });
      })()}

      {/* Fixed Index Labels below Slots */}
      {array.map((_, i: number) => {
        const xPos = startX + i * spacing;
        return (
          <Billboard key={`idx-${i}`} position={[xPos, -1.5, 0]}>
            <Text
              fontSize={0.3}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              [{i}]
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}
