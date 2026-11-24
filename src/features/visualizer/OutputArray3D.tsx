import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
import { RoundedBox, Html } from '@react-three/drei';

interface OutputArray3DProps {
  data: (string | number)[];
  capacity: number;
}

function ArraySlot({ value, index, isNew }: { value?: string | number; index: number; isNew: boolean }) {
  const { scale, emissiveIntensity } = useSpring({
    scale: isNew ? [1.15, 1.15, 1.15] : [1, 1, 1],
    emissiveIntensity: isNew ? 1.0 : (value ? 0.6 : 0.1),
    config: { tension: 170, friction: 14 }
  });

  const filledColor = '#9333ea'; // Rich purple
  const newColor = '#d946ef'; // Lighter magenta-purple
  const emptyColor = '#4c1d95'; // Dim gray-purple
  
  const baseColor = value ? (isNew ? newColor : filledColor) : emptyColor;

  return (
    <group position={[index * 1.5, 0, 0]}>
      {/* 3D Box */}
      <animated.group scale={scale as any}>
        <RoundedBox args={[1.2, 1.2, 1.2]} radius={0.15} smoothness={4}>
          <animated.meshStandardMaterial 
            color={baseColor} 
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.2}
            metalness={0.8}
            transparent={!value}
            opacity={value ? 1 : 0.4}
          />
        </RoundedBox>
        {/* Value inside */}
        {value && (
          <Html center position={[0, 0, 0.65]}>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', userSelect: 'none' }}>
              {value}
            </div>
          </Html>
        )}
      </animated.group>
      
      {/* Index below box */}
      <Html center position={[0, -0.9, 0]}>
        <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', userSelect: 'none' }}>
          [{index}]
        </div>
      </Html>
    </group>
  );
}

export default function OutputArray3D({ data, capacity }: OutputArray3DProps) {
  const spacing = 1.5;
  const totalWidth = (capacity - 1) * spacing;
  const startX = -totalWidth / 2;

  // Track the most recently added value index to highlight it
  const [prevDataLength, setPrevDataLength] = useState(data.length);
  const [newestIndex, setNewestIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data.length > prevDataLength) {
      setNewestIndex(data.length - 1);
      const timer = setTimeout(() => {
        setNewestIndex(null);
      }, 800); // Highlight lasts slightly less to settle quickly
      setPrevDataLength(data.length);
      return () => clearTimeout(timer);
    } else if (data.length < prevDataLength) {
      setPrevDataLength(data.length); // Handle resets
      setNewestIndex(null);
    }
  }, [data.length, prevDataLength]);

  const panelWidth = Math.max(totalWidth + 3, 10);

  return (
    <group>
      {/* Subtle background panel to separate from graph */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[panelWidth, 3.5]} />
        <meshStandardMaterial 
          color="#0B1120" 
          transparent 
          opacity={0.4} 
          roughness={1}
        />
      </mesh>
      
      {/* Label at the top */}
      <Html center position={[0, 1.4, 0]}>
        <div style={{ color: '#c084fc', fontWeight: 'bold', fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          Output Array
        </div>
      </Html>

      <group position={[startX, -0.2, 0]}>
        {Array.from({ length: capacity }).map((_, i) => (
          <ArraySlot 
            key={i} 
            index={i} 
            value={data[i]} 
            isNew={i === newestIndex} 
          />
        ))}
      </group>

      {/* Capacity Label */}
      <Html center position={[0, -1.4, 0]}>
        <div style={{ color: '#d946ef', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
          Capacity: {capacity}
        </div>
      </Html>
    </group>
  );
}
