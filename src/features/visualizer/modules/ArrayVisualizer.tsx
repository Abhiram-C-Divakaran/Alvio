import { useSpring, animated } from '@react-spring/three';
import { RoundedBox, Text } from '@react-three/drei';

export default function ArrayVisualizer({ state }: { state: any }) {
  let elements: any[] = [];
  
  if (state?.elements && Array.isArray(state.elements)) {
    elements = state.elements;
  } else if (typeof state?.elements === 'string') {
    elements = state.elements.split('');
  } else if (state?.entries && Array.isArray(state.entries)) {
    elements = state.entries.map((e: any) => `${e.key}:${e.value}`);
  } else if (state?.string && typeof state.string === 'string') {
    elements = state.string.split('');
  }

  // If we still have nothing but the LLM provided SOME array, just use it
  if (elements.length === 0 && state && typeof state === 'object') {
    const arrays = Object.values(state).filter(Array.isArray);
    if (arrays.length > 0) elements = arrays[0] as any[];
  }

  const activeIndices = state?.activeIndices || state?.activeKeys?.map((k: string) => elements.findIndex(e => e.startsWith(k))) || [];
  const pointers = state?.pointers || {};

  // Center the array
  const offsetX = (elements.length * 2.2) / 2 - 1.1;

  return (
    <group position={[-offsetX, 0, 0]}>
      {elements.map((val, idx) => (
        <ArrayElement 
          key={`${val}-${idx}`}
          value={val} 
          index={idx} 
          isActive={activeIndices.includes(idx)}
        />
      ))}
      
      {/* Pointers (e.g. left/right pointers for sliding window) */}
      {Object.entries(pointers).map(([name, idx], i) => (
        <Pointer key={name} name={name} index={idx as number} offset={i} />
      ))}
    </group>
  );
}

function ArrayElement({ value, index, isActive }: { value: any, index: number, isActive: boolean }) {
  const { position, scale, emissiveIntensity } = useSpring({
    position: [index * 2.2, 0, 0],
    scale: isActive ? [1.1, 1.1, 1.1] : [1, 1, 1],
    emissiveIntensity: isActive ? 2.5 : 0.2,
    config: { tension: 120, friction: 14 }
  });

  const baseColor = isActive ? '#10b981' : '#6366f1'; // Green active, Indigo default

  return (
    <animated.group position={position as any} scale={scale as any}>
      <RoundedBox args={[2, 2, 2]} radius={0.15} smoothness={4}>
        <animated.meshPhysicalMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.4}
          roughness={0.1}
          transmission={0.5}
          thickness={1.5}
          clearcoat={1}
        />
      </RoundedBox>

      <Text
        position={[0, 0, 1.01]}
        fontSize={0.8}
        color="#ffffff"
        fontWeight="bold"
      >
        {String(value)}
      </Text>
      
      <Text
        position={[0, -1.3, 1]}
        fontSize={0.3}
        color="#94a3b8"
      >
        {index}
      </Text>
    </animated.group>
  );
}

function Pointer({ name, index, offset }: { name: string, index: number, offset: number }) {
  const { position } = useSpring({
    position: [index * 2.2, 1.8 + (offset * 0.5), 0],
    config: { tension: 120, friction: 14 }
  });

  return (
    <animated.group position={position as any}>
      <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.4}
        color="#ef4444"
        fontWeight="bold"
      >
        {name}
      </Text>
    </animated.group>
  );
}
