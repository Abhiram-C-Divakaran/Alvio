const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/Abhiram/Downloads/al/src/features/visualizer/AIVisualizerEngine.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('useSpring')) {
  content = content.replace("import { useTransition, a }", "import { useTransition, useSpring, a }");
}

// GlowCube replace
const glowCubeRegex = /\/\/ ─── Single Primitive Element ────────────────────────────────────────────────\r?\nfunction GlowCube[\s\S]*?(?=\/\/ ─── HashBucket Element ──────────────────────────────────────────────────────)/;
const newGlowCube = `// ─── Single Primitive Element ────────────────────────────────────────────────
function GlowCube({ 
  value, 
  targetPos, 
  state = 'idle',
  pointers = [],
  life 
}: {
  value: any;
  targetPos: [number, number, number];
  state?: ElementState;
  pointers?: string[];
  life?: any;
}) {
  const colors = STATE_COLORS[state] || STATE_COLORS.idle;
  
  // Use a spring to smoothly transition position, color, emissive, and intensity
  const { position, color, emissive, intensity } = useSpring({
    position: [targetPos[0], targetPos[1] + (state === 'active' || state === 'comparing' || state === 'found' ? 0.3 : 0), targetPos[2]],
    color: colors.body,
    emissive: colors.emissive,
    intensity: colors.intensity,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  return (
    <a.group position={position as any} scale={life || 1}>
      <RoundedBox args={[1.9, 1.9, 1.9]} radius={0.15} smoothness={4}>
        <a.meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={intensity}
          metalness={0.1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      <Text
        position={[0, 0, 0.98]}
        fontSize={0.72}
        color="#ffffff"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="rgba(0,0,0,0.4)"
        anchorX="center"
        anchorY="middle"
      >
        {String(value)}
      </Text>

      {/* Pointers mapping */}
      {(pointers?.length || 0) > 0 && (
        <group position={[0, -1.8, 0]}>
          <Text
            fontSize={0.4}
            color="#A78BFA"
            anchorX="center"
            anchorY="top"
          >
            {pointers.join(', ')}
          </Text>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial color="#A78BFA" emissive="#A78BFA" emissiveIntensity={1} />
          </mesh>
        </group>
      )}
    </a.group>
  );
}

`;
content = content.replace(glowCubeRegex, newGlowCube);

// HashBucket replace
const hashBucketRegex = /\/\/ ─── HashBucket Element ──────────────────────────────────────────────────────\r?\nfunction HashBucket[\s\S]*?(?=\/\/ ─── Primitive Renderers ─────────────────────────────────────────────────────)/;
const newHashBucket = `// ─── HashBucket Element ──────────────────────────────────────────────────────
function HashBucket({ 
  value, 
  targetPos, 
  state = 'idle',
  pointers = [],
  index,
  life 
}: {
  value: any;
  targetPos: [number, number, number];
  state?: ElementState;
  pointers?: string[];
  index: number;
  life?: any;
}) {
  const isActive = state === 'active' || state === 'comparing' || state === 'found';
  
  const boxColor = isActive ? '#06b6d4' : '#111827';
  const boxEmissive = isActive ? '#06b6d4' : '#000000';
  const boxIntensity = isActive ? 0.8 : 0;
  
  const ringColor = isActive ? '#22d3ee' : '#4b5563';
  const ringEmissive = isActive ? '#22d3ee' : '#000000';

  const { position, bColor, bEmissive, bInt, rColor, rEmissive, rInt, opacity } = useSpring({
    position: targetPos,
    bColor: boxColor,
    bEmissive: boxEmissive,
    bInt: boxIntensity,
    rColor: ringColor,
    rEmissive: ringEmissive,
    rInt: isActive ? 2 : 0.5,
    opacity: isActive ? 0.4 : 0.8,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  return (
    <a.group position={position as any} scale={life || 1}>
      <RoundedBox args={[1.9, 1.9, 1.9]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
        <a.meshPhysicalMaterial
          color={bColor}
          emissive={bEmissive}
          emissiveIntensity={bInt}
          transparent
          opacity={opacity}
          metalness={0.2}
          roughness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </RoundedBox>

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.05, 16, 64]} />
        <a.meshStandardMaterial 
          color={rColor} 
          emissive={rEmissive} 
          emissiveIntensity={rInt} 
        />
      </mesh>

      <Text position={[0, -1.6, 0]} fontSize={0.35} color="#94a3b8" anchorX="center">
        Index [{index}]
      </Text>

      {value !== undefined && value !== null && value !== '' && (
        <Text position={[0, 0, 0]} fontSize={0.6} color="#ffffff" fontWeight="bold" anchorX="center" anchorY="middle">
          {String(value)}
        </Text>
      )}
      
      {(pointers?.length || 0) > 0 && (
        <group position={[0, -2.2, 0]}>
          <Text fontSize={0.35} color="#A78BFA" anchorX="center" anchorY="top">
            {pointers.join(', ')}
          </Text>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial color="#A78BFA" emissive="#A78BFA" emissiveIntensity={1} />
          </mesh>
        </group>
      )}
    </a.group>
  );
}

`;
content = content.replace(hashBucketRegex, newHashBucket);


// LinkedListNode replace
const llRegex = /\/\/ ─── LinkedList Element ────────────────────────────────────────────────────────\r?\nfunction LinkedListNode[\s\S]*?(?=\/\/ ─── Knapsack Element ──────────────────────────────────────────────────────────)/;
const newLL = `// ─── LinkedList Element ────────────────────────────────────────────────────────
function LinkedListNode({
  value,
  targetPos,
  state = 'idle',
  pointers = [],
  isHead,
  isTail,
  hasNext,
  life
}: {
  value: any;
  targetPos: [number, number, number];
  state?: ElementState;
  pointers?: string[];
  isHead: boolean;
  isTail: boolean;
  hasNext: boolean;
  life?: any;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame((stateObj, delta) => {
    // Rotate ring smoothly using frame
    if (groupRef.current && groupRef.current.children[1]) {
       groupRef.current.children[1].rotation.z += delta * 0.5;
    }
  });

  const isActive = state === 'active' || state === 'comparing' || state === 'found';
  const sphereColor = isActive ? '#06b6d4' : '#0284c7';
  const ringColor = isActive ? '#22d3ee' : '#38bdf8';
  
  const { position, sColor, rColor, ringInt } = useSpring({
    position: targetPos,
    sColor: sphereColor,
    rColor: ringColor,
    ringInt: isActive ? 2 : 1,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  return (
    <a.group ref={groupRef as any} position={position as any} scale={life || 1}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <a.meshPhysicalMaterial color={sColor} emissive={sColor} emissiveIntensity={0.2} transparent opacity={0.6} roughness={0.1} metalness={0.1} clearcoat={1} clearcoatRoughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 3.5, 0, 0]}>
        <torusGeometry args={[1.6, 0.04, 16, 64]} />
        <a.meshStandardMaterial color={rColor} emissive={rColor} emissiveIntensity={ringInt} />
      </mesh>

      {value !== undefined && value !== null && value !== '' && (
        <Text position={[0, 0, 1.25]} fontSize={0.7} color="#ffffff" fontWeight="bold" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          {String(value)}
        </Text>
      )}
      
      {hasNext && (
        <group position={[2.0, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.6]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.2, 0.4, 16]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.5} />
          </mesh>
        </group>
      )}
      
      {!hasNext && isTail && (
        <group position={[2.0, 0, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.6]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.2, 0.4, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
          </mesh>
          <Text position={[2.0, 0, 0]} fontSize={0.5} color="#ef4444" fontStyle="italic" anchorX="center" anchorY="middle">
            null
          </Text>
        </group>
      )}

      {/* Head/Tail Labels */}
      <group position={[0, -2, 0]}>
        {isHead && (
          <Text position={[0, 0, 0]} fontSize={0.35} color="#22c55e" anchorX="center" anchorY="top">
            HEAD ➔
          </Text>
        )}
        {isTail && !isHead && (
          <Text position={[0, 0, 0]} fontSize={0.35} color="#ef4444" anchorX="center" anchorY="top">
            TAIL ➔
          </Text>
        )}
      </group>

      {(pointers?.length || 0) > 0 && (
        <group position={[0, -2.8, 0]}>
          <Text fontSize={0.35} color="#A78BFA" anchorX="center" anchorY="top">
            {pointers.join(', ')}
          </Text>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.2, 0.4, 4]} />
            <meshStandardMaterial color="#A78BFA" emissive="#A78BFA" emissiveIntensity={1} />
          </mesh>
        </group>
      )}
    </a.group>
  );
}

`;
content = content.replace(llRegex, newLL);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Refactored animations to useSpring successfully.");
