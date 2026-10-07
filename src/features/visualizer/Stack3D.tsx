import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface Stack3DProps {
  data?: number[];
  activeIndex?: number | number[] | null;
  variant?: string;
  baseColor?: string;
  reducedMotion?: boolean;
}

// Sub-component to handle the fly-out animation of popped items
function PoppedItem({ value, index, isLinked }: { value: number; index: number; isLinked: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const color = '#ef4444'; // Red for deleted

  useFrame((state, delta) => {
    if (ref.current) {
      // Fly up and to the right, spin, and shrink
      ref.current.position.y += delta * 6;
      ref.current.position.x += delta * 4;
      ref.current.rotation.x += delta * 5;
      ref.current.rotation.y += delta * 5;
      ref.current.scale.multiplyScalar(0.92);
    }
  });

  return (
    <group ref={ref} position={[0, index * 1.2, 0]}>
      {isLinked ? (
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0.2} metalness={0.8} />
        </mesh>
      ) : (
        <RoundedBox args={[1.8, 1, 1.8]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0.2} metalness={0.8} envMapIntensity={2} />
        </RoundedBox>
      )}
      <Billboard position={[0, 0, isLinked ? 0.75 : 0.95]}>
        <Text fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
          {value}
        </Text>
      </Billboard>
    </group>
  );
}

export default function Stack3D({ data = [], activeIndex = null, variant = 'Array Stack', baseColor, reducedMotion = false }: Stack3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [poppingItems, setPoppingItems] = useState<{ id: string; value: number; index: number }[]>([]);
  const prevDataRef = useRef<number[]>(data);

  useEffect(() => {
    if (!reducedMotion && data.length < prevDataRef.current.length) {
      // An item was removed (popped)
      const prevTop = prevDataRef.current[prevDataRef.current.length - 1];
      const prevTopIndex = prevDataRef.current.length - 1;
      
      const newPopped = { id: Math.random().toString(), value: prevTop, index: prevTopIndex };
      setPoppingItems((prev) => [...prev, newPopped]);

      setTimeout(() => {
        setPoppingItems((prev) => prev.filter((p) => p.id !== newPopped.id));
      }, 1000);
    }
    prevDataRef.current = data;
  }, [data]);
  
  // Animation for the entire stack
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime) * 0.1) - (data.length * 0.6); // keep centered
      groupRef.current.rotation.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const isLinked = variant === 'Linked Stack';
  const isMonotonic = variant === 'Monotonic Stack';

  return (
    <group ref={groupRef}>
      {/* Base / Floor of Stack */}
      {!isLinked && (
        <group position={[0, -0.6, 0]}>
          <mesh>
            <cylinderGeometry args={[1.5, 1.5, 0.2, 32]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} roughness={0.5} metalness={0.5} />
          </mesh>
          {/* Glowing Containment Ring */}
          <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.6, 1.7, 32]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Monotonic Label */}
      {isMonotonic && (
        <Billboard position={[2.5, data.length * 0.6, 0]}>
          <Text fontSize={0.3} color="#fbbf24" anchorX="left">
            Strictly Increasing
          </Text>
        </Billboard>
      )}
      
      {/* Popping Items (Animating out) */}
      {poppingItems.map((item) => (
        <PoppedItem key={item.id} value={item.value} index={item.index} isLinked={isLinked} />
      ))}
      
      {/* Stack Items */}
      {data.map((value, index) => {
        // Stack grows upwards. Index 0 is bottom.
        const isActive = Array.isArray(activeIndex) ? activeIndex.includes(index) : activeIndex === index;
        const color = isActive ? '#ef4444' : (baseColor || '#f59e0b'); // Red when active, baseColor otherwise
        const yPos = index * 1.2;

        return (
          <group key={index} position={[0, yPos, 0]}>
            {isLinked ? (
              // Linked List Node visualization
              <mesh>
                <sphereGeometry args={[0.7, 32, 32]} />
                <meshStandardMaterial color={color} emissive={isActive ? color : '#000000'} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
              </mesh>
            ) : (
              // Array Box visualization
              <RoundedBox args={[1.8, 1, 1.8]} radius={0.1} smoothness={4}>
                <meshStandardMaterial color={color} emissive={isActive ? color : '#000000'} emissiveIntensity={isActive ? 0.5 : 0} roughness={0.2} metalness={0.8} envMapIntensity={2} transparent opacity={isActive ? 1 : 0.9} />
              </RoundedBox>
            )}
            
            <Billboard position={[0, 0, isLinked ? 0.75 : 0.95]}>
              <Text fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
                {value}
              </Text>
            </Billboard>

            {/* Downward Pointer for Linked Stack */}
            {isLinked && index > 0 && (
              <group position={[0, -0.6, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
                  <meshStandardMaterial color="#cbd5e1" />
                </mesh>
                <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
                  <cylinderGeometry args={[0, 0.15, 0.3, 8]} />
                  <meshStandardMaterial color="#cbd5e1" />
                </mesh>
              </group>
            )}
            
            {/* Top Label (for the top item) */}
            <Billboard position={[-2, 0, 0]}>
              {index === data.length - 1 && (
                <Text
                  fontSize={0.6}
                  color="#ec4899"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.03}
                  outlineColor="#000"
                >
                  TOP ➜
                </Text>
              )}
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
