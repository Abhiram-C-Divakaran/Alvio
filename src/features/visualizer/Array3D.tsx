import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Billboard, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';
import useVisualizationStore from '../../stores/useVisualizationStore';

interface Array3DProps {
  data?: number[];
  activeIndex?: number | number[] | null;
  variant?: string;
  capacity?: number;
  baseColor?: string;
  reducedMotion?: boolean;
}

export default function Array3D({ data = [], activeIndex = null, variant = 'Static Array', capacity, baseColor, reducedMotion = false }: Array3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const spacing = 1.5;

  // Variant logic
  const is2D = variant === '2D Array';
  const isDynamic = variant === 'Dynamic Array';
  
  // Fill empty capacity slots for dynamic arrays
  let renderData = [...data];
  if (isDynamic && capacity !== undefined && capacity > data.length) {
    const emptySlots = capacity - data.length;
    for (let i = 0; i < emptySlots; i++) {
      renderData.push(null as any);
    }
  }

  const totalWidth = (renderData.length - 1) * spacing;
  const startX = -totalWidth / 2;

  // Dynamically scale down if there are too many elements so they don't clip off screen
  const maxVisibleElements = 6;
  const scale = Math.min(1, maxVisibleElements / renderData.length);

  // Slowly animate the entire array group for a dynamic effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  // Convert 1D data array into 2D grid dynamically (3 columns)
  const cols = 3;
  const gridData: number[][] = [];
  for (let i = 0; i < data.length; i += cols) {
    gridData.push(data.slice(i, i + cols));
  }

  return (
    <group ref={groupRef}>
      {is2D ? (
        // --- 2D ARRAY RENDER ---
        <group position={[0, 0, 0]}>
          {gridData.map((row, rIndex) => {
            const startX_row = -((row.length - 1) * 1.6) / 2;
            const startY_col = ((gridData.length - 1) * 1.6) / 2;
            return row.map((val, cIndex) => {
              const flatIndex = rIndex * cols + cIndex;
              const isActive = activeIndex === flatIndex;
              const color = isActive ? '#3b82f6' : (baseColor || '#2dd4bf');
              return (
                <group key={`${rIndex}-${cIndex}`} position={[startX_row + cIndex * 1.6, startY_col - rIndex * 1.6, 0]}>
                  <RoundedBox args={[1.4, 1.4, 1.4]} radius={0.15} smoothness={4}>
                    <meshStandardMaterial 
                      color={color} 
                      roughness={0.1} 
                      metalness={0.8} 
                      envMapIntensity={2}
                      emissive={isActive ? '#3b82f6' : '#000000'}
                      emissiveIntensity={isActive ? 0.5 : 0}
                    />
                  </RoundedBox>
                  <Billboard position={[0, 0, 1.05]}>
                    <Text fontSize={0.6} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
                      {val}
                    </Text>
                  </Billboard>

                  {/* Array Index Property */}
                  <Billboard position={[0, -1.2, 0]}>
                    <Text fontSize={0.3} color="#94a3b8" anchorX="center" anchorY="middle">
                      [{rIndex}][{cIndex}]
                    </Text>
                  </Billboard>
                </group>
              );
            });
          })}
        </group>
      ) : (
        // --- 1D / DYNAMIC ARRAY RENDER ---
        <group scale={scale}>
          {renderData.map((value, index) => {
            const isGhost = value === null;
            const isActive = (Array.isArray(activeIndex) ? activeIndex.includes(index) : activeIndex === index) && !isGhost;
            const color = isGhost ? '#94a3b8' : (isActive ? '#3b82f6' : (baseColor || '#2dd4bf'));
            const xPos = startX + index * spacing;
            const yPos = isActive ? 0.4 : 0; // Lift active item slightly

            return (
              <AnimatedArrayItem reducedMotion={reducedMotion}
                key={`${index}-${value}`}
                index={index}
                value={value}
                xPos={xPos}
                yPos={yPos}
                color={color}
                isActive={isActive}
                isGhost={isGhost}
                isDynamic={isDynamic}
                baseColor={baseColor}
              />
            );
          })}
        </group>
      )}

      {/* Array Base Platform (moved back from inside item) */}
      {!is2D && (
        <group position={[0, -2.5, 0]}>
          <Text position={[0, 1.2, 0]} fontSize={0.3} color={baseColor || "#2dd4bf"} anchorX="center">
            {isDynamic ? `Capacity: ${capacity || data.length}` : `Size: ${data.length}`}
          </Text>
          <mesh position={[0, 0.5, -0.5]}>
            <boxGeometry args={[totalWidth + 2.5, 0.1, 1.5]} />
            <meshStandardMaterial color={baseColor || '#2dd4bf'} emissive={baseColor || '#2dd4bf'} emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function AnimatedArrayItem({ index, value, xPos, yPos, color, isActive, isGhost, isDynamic, baseColor, reducedMotion }: any) {
  const speed = useVisualizationStore((s) => s.timeline.speed);
  const { position } = useSpring({
    position: [xPos, yPos, 0],
    immediate: reducedMotion,
    config: { tension: 120 * speed, friction: 14 / speed }
  });

  return (
    <animated.group position={position as any}>
      <RoundedBox args={[1.4, 1.4, 1.4]} radius={0.15} smoothness={4}>
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.8} 
          envMapIntensity={2}
          transparent={isGhost}
          opacity={isGhost ? 0.2 : 1}
          emissive={isActive ? '#3b82f6' : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
        {/* Ghost wireframe effect for empty capacity slots */}

        {isGhost && (
          <Edges scale={1.01} threshold={15} color="#94a3b8" />
        )}
      </RoundedBox>
      
      {/* Tech Platform under each item */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshStandardMaterial color={isActive ? '#3b82f6' : (baseColor || '#2dd4bf')} emissive={isActive ? '#3b82f6' : (baseColor || '#2dd4bf')} emissiveIntensity={isActive ? 2 : 0.5} />
      </mesh>

      {!isGhost && (
        <Billboard position={[0, 0, 1.05]}>
          <Text fontSize={0.6} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
            {value}
          </Text>
        </Billboard>
      )}

      {/* Array Index Property */}
      {(!isGhost || isDynamic) && (
        <Billboard position={[0, -1.2, 0]}>
          <Text fontSize={0.3} color="#94a3b8" anchorX="center" anchorY="middle">
            [{index}]
          </Text>
        </Billboard>
      )}
    </animated.group>
  );
}
