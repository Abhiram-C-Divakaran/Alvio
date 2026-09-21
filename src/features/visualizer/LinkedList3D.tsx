import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Cylinder, Billboard, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

interface LinkedList3DProps {
  data?: number[];
  activeIndex?: number | number[] | null;
  variant?: string;
  baseColor?: string;
  onNodeSelect?: (index: number) => void;
  selectedIndex?: number;
  reducedMotion?: boolean;
}

export default function LinkedList3D({ data = [], activeIndex = null, variant = 'Singly Linked', baseColor, onNodeSelect, selectedIndex = -1, reducedMotion = false }: LinkedList3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spacing = 2.5;
  const startX = -((data.length - 1) * spacing) / 2;

  const isDoubly = variant === 'Doubly Linked';
  const isCircular = variant === 'Circular Linked';

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {data.map((value, index) => {
        const isActive = selectedIndex === index || (Array.isArray(activeIndex) ? activeIndex.includes(index) : activeIndex === index);
        const color = isActive ? '#10b981' : (baseColor || '#0ea5e9'); // Emerald active, Sky blue normal
        const xPos = startX + index * spacing;

        return (
          <group key={index}>
            {/* Node Sphere */}
            <group position={[xPos, 0, 0]} scale={selectedIndex === index ? 1.1 : 1} onClick={event => { event.stopPropagation(); onNodeSelect?.(index); }}>
              <Sphere args={[0.7, 32, 32]}>
                <meshStandardMaterial
                  color={color}
                  roughness={0.1}
                  metalness={0.8}
                  envMapIntensity={3}
                  transparent
                  opacity={0.9}
                  emissive={isActive ? color : '#000000'}
                  emissiveIntensity={0.5}
                />
              </Sphere>

              {/* Data Text */}
              <Billboard position={[0, 0, 0.75]}>
                <Text
                  fontSize={0.5}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.05}
                  outlineColor="#000000"
                >
                  {value}
                </Text>
              </Billboard>

              {/* Cyberpunk Circuit rings */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.0, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 2 : 0.5} side={THREE.DoubleSide} />
              </mesh>

              {/* Head / Tail Labels */}
              <Billboard position={[0, -1.2, 0]}>
                {index === 0 && (
                  <Text fontSize={0.4} color="#10b981" outlineWidth={0.03} outlineColor="#000">
                    {data.length === 1 ? 'HEAD / TAIL' : 'HEAD'}
                  </Text>
                )}
                {index === data.length - 1 && index !== 0 && (
                  <Text fontSize={0.4} color="#f43f5e" outlineWidth={0.03} outlineColor="#000">
                    TAIL
                  </Text>
                )}
              </Billboard>
            </group>

            {/* Pointer (Laser) to next node */}
            {index < data.length - 1 && (
              <group position={[xPos + spacing / 2, isDoubly ? 0.2 : 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <Cylinder args={[0.02, 0.02, spacing - 1.4, 8]}>
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
                </Cylinder>
                {/* Arrowhead Forward */}
                <Cylinder args={[0, 0.15, 0.3, 8]} position={[0, (spacing - 1.4) / 2, 0]}>
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
                </Cylinder>
                {/* Data Packet moving along line */}
                {isActive && (
                  <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3} />
                  </mesh>
                )}
              </group>
            )}

            {/* Reverse Pointer (Doubly Linked) */}
            {isDoubly && index > 0 && (
              <group position={[xPos - spacing / 2, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <Cylinder args={[0.02, 0.02, spacing - 1.4, 8]}>
                  <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={2} />
                </Cylinder>
                <Cylinder args={[0, 0.15, 0.3, 8]} position={[0, (spacing - 1.4) / 2, 0]}>
                  <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={2} />
                </Cylinder>
              </group>
            )}
          </group>
        );
      })}

      {/* Circular Linked List Back Pointer */}
      {isCircular && data.length > 1 && (
        <group>
          <QuadraticBezierLine
            start={[startX + (data.length - 1) * spacing, -0.8, 0]}
            end={[startX, -0.8, 0]}
            mid={[0, -3.5, 0]}
            color="#cbd5e1"
            lineWidth={3}
            dashed={false}
          />
          {/* Arrow head pointing at head node */}
          <group position={[startX, -0.9, 0]} rotation={[0, 0, Math.PI / 8]}>
            <Cylinder args={[0, 0.15, 0.3, 8]}>
              <meshStandardMaterial color="#cbd5e1" />
            </Cylinder>
          </group>
        </group>
      )}

      {/* Explicit Null Terminator */}
      {!isCircular && data.length > 0 && (
        <group position={[startX + (data.length - 1) * spacing + spacing, 0, 0]}>
          <Text fontSize={0.4} color="#ef4444" outlineWidth={0.03} outlineColor="#000">
            null
          </Text>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
          </mesh>
        </group>
      )}

      {/* Pointer to Null Terminator */}
      {!isCircular && data.length > 0 && (
        <group position={[startX + (data.length - 1) * spacing + spacing / 2, isDoubly ? 0.2 : 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <Cylinder args={[0.02, 0.02, spacing - 1.4, 8]}>
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} transparent opacity={0.5} />
          </Cylinder>
          <Cylinder args={[0, 0.15, 0.3, 8]} position={[0, (spacing - 1.4) / 2, 0]}>
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} transparent opacity={0.5} />
          </Cylinder>
        </group>
      )}
    </group>
  );
}
