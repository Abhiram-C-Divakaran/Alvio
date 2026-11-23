import { useSpring, animated } from '@react-spring/three';
import { RoundedBox, Text } from '@react-three/drei';

interface StackState {
  elements: (string | number)[];
  activeIndices?: number[]; // indices currently being pushed, popped, or peeked
}

export default function StackVisualizer({ state }: { state: StackState }) {
  const { elements = [], activeIndices = [] } = state || {};

  return (
    <group position={[0, -3, 0]}>
      {elements.map((val, idx) => (
        <StackElement 
          key={`${val}-${idx}`}
          value={val} 
          index={idx} 
          isActive={activeIndices.includes(idx)}
        />
      ))}
      
      {/* Glassy Base Plate */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshPhysicalMaterial 
          color="#1e293b" 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1} 
        />
      </mesh>
    </group>
  );
}

function StackElement({ value, index, isActive }: { value: any, index: number, isActive: boolean }) {
  const { position, emissiveIntensity, scale } = useSpring({
    position: [0, index * 1.5, 0],
    scale: isActive ? [1.1, 1.1, 1.1] : [1, 1, 1],
    emissiveIntensity: isActive ? 2.5 : 0.2,
    config: { tension: 120, friction: 14 }
  });

  const baseColor = isActive ? '#38bdf8' : '#818cf8'; // Blue highlight, Purple default

  return (
    <animated.group position={position as any} scale={scale as any}>
      <RoundedBox args={[2, 1.2, 2]} radius={0.15} smoothness={4}>
        <animated.meshPhysicalMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.1}
          transmission={0.6}
          thickness={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2.0}
        />
      </RoundedBox>

      <Text
        position={[0, 0, 1.01]}
        fontSize={0.6}
        color="#ffffff"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {String(value)}
      </Text>
    </animated.group>
  );
}
