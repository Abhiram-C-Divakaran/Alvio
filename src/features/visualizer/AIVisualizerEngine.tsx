import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTransition, useSpring, a } from '@react-spring/three';
import { RoundedBox, Text, Stars, OrbitControls, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Import interfaces from page
import type { AIPrimitive } from './aiSceneTypes';
import { linkedListLayout, treeLayout, graphLayout, matrixLayout } from './aiScene';
import type { SceneEdge, ScenePosition } from './aiScene';

// Color map for solid, glossy material states
const STATE_COLORS = {
  idle: { body: '#0d9488', emissive: '#0f766e', intensity: 0.6 },
  active: { body: '#3b82f6', emissive: '#2563eb', intensity: 1.0 },
  comparing: { body: '#f59e0b', emissive: '#d97706', intensity: 1.0 },
  visited: { body: '#10b981', emissive: '#059669', intensity: 0.8 },
  rejected: { body: '#ef4444', emissive: '#dc2626', intensity: 1.0 },
  found: { body: '#10b981', emissive: '#10b981', intensity: 1.5 },
  swapping: { body: '#d946ef', emissive: '#c026d3', intensity: 1.2 }
};

type ElementState = keyof typeof STATE_COLORS;

// ─── Single Primitive Element ────────────────────────────────────────────────
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

// ─── HashBucket Element ──────────────────────────────────────────────────────
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

// ─── Primitive Renderers ─────────────────────────────────────────────────────

function ArrayRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  const elements = primitive?.initialElements || [];
  const SPACING = 2.6;
  const totalCount = elements?.length || 0;
  const offset = ((totalCount - 1) * SPACING) / 2;

  const transitions = useTransition(elements, {
    keys: (item: any) => item.id,
    from: { life: 0 },
    enter: { life: 1 },
    update: { life: 1 },
    leave: { life: 0 },
    config: { mass: 1, tension: 170, friction: 20 }
  });

  const plateWidth = totalCount > 0 ? totalCount * SPACING + 0.4 : 0;

  return (
    <group position={[0, offsetY, 0]}>
      {/* Primitive Label */}
      <Text position={[0, 2.5, 0]} fontSize={0.8} color="white" anchorX="center">
        {primitive.id}
      </Text>

      {/* Base Plate */}
      {totalCount > 0 && (
        <mesh position={[0, -1.1, 0]}>
          <boxGeometry args={[plateWidth, 0.15, 2.2]} />
          <meshPhysicalMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} transparent opacity={0.9} />
        </mesh>
      )}

      {/* Size Indicator */}
      {totalCount > 0 && (
        <Text position={[0, -2.0, 0]} fontSize={0.4} color="#06b6d4" anchorX="center">
          Size: {totalCount}
        </Text>
      )}

      {transitions((style, item, t, i) => {
        const targetX = i * SPACING - offset;
        return (
          <group key={item.id}>
            <GlowCube
              value={item.value !== undefined ? item.value : item.val}
              targetPos={[targetX, 0, 0]}
              state={item.state}
              pointers={item.pointerLabels}
              life={style.life}
            />
            {/* Array Index */}
            <Text position={[targetX, -1.6, 1.2]} fontSize={0.32} color="#94a3b8" anchorX="center">
              [{i}]
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function HashMapRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  const elements = primitive?.initialElements || [];
  const SPACING_X = 2.4;
  const SPACING_Y = 3.5;
  const COLS = 7;

  const totalCount = elements?.length || 0;
  const offsetTotalX = ((Math.min(totalCount, COLS) - 1) * SPACING_X) / 2;

  const transitions = useTransition(elements, {
    keys: (item: any) => item.id,
    from: { life: 0 },
    enter: { life: 1 },
    update: { life: 1 },
    leave: { life: 0 },
    config: { mass: 1, tension: 170, friction: 20 }
  });

  return (
    <group position={[0, offsetY, 0]}>
      <Text position={[0, 3, 0]} fontSize={0.8} color="white" anchorX="center">
        {primitive.id} (HashMap)
      </Text>

      {transitions((style, item, t, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const targetX = col * SPACING_X - offsetTotalX;
        const targetY = -row * SPACING_Y;

        // Show key:value
        const displayVal = item.key !== undefined ? `${item.key}:${item.value}` : item.value;

        return (
          <HashBucket
            key={item.id}
            value={displayVal}
            targetPos={[targetX, targetY, 0]}
            state={item.state}
            pointers={item.pointerLabels}
            index={i}
            life={style.life}
          />
        );
      })}
    </group>
  );
}

// ─── LinkedList Element ────────────────────────────────────────────────────────
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

// ─── Knapsack Element ──────────────────────────────────────────────────────────
function KnapsackRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  const elements = primitive.initialElements || [];
  const capacity = (primitive as any).capacity;

  const transitions = useTransition(elements, {
    keys: (item: any) => item.id,
    from: { life: 0 },
    enter: { life: 1 },
    update: { life: 1 },
    leave: { life: 0 },
    config: { mass: 1, tension: 170, friction: 20 }
  });

  return (
    <group position={[0, offsetY, 0]}>
      <Text position={[0, 4, 0]} fontSize={0.8} color="white" anchorX="center">
        {primitive.id} (Knapsack{capacity !== undefined ? ` Cap: ${capacity}` : ''})
      </Text>

      {/* The Backpack / Container */}
      <mesh position={[0, 0, -1]}>
        <boxGeometry args={[10, 4, 3]} />
        <meshPhysicalMaterial color="#a855f7" transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Container base */}
      <mesh position={[0, -1.9, -1]}>
        <boxGeometry args={[10.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#9333ea" />
      </mesh>

      {transitions((style, item, t, i) => {
        const isActive = item.state === 'active' || item.state === 'found';

        // Items outside the knapsack are laid out in a row in front
        const outsideX = (i - elements.length / 2) * 2.2 + 1;
        const outsideY = -4;
        const outsideZ = 2;

        // Items inside the bag
        const insideX = (i % 4 - 1.5) * 2;
        const insideY = Math.floor(i / 4) * 1.5 - 1;
        const insideZ = -1;

        const targetX = isActive ? insideX : outsideX;
        const targetY = isActive ? insideY : outsideY;
        const targetZ = isActive ? insideZ : outsideZ;

        const displayVal = item.value !== undefined ? item.value : '';

        return (
          <group key={item.id}>
             <GlowCube
               value={displayVal}
               targetPos={[targetX, targetY, targetZ]}
               state={item.state}
               pointers={item.pointerLabels}
               life={style.life}
             />
             {(item.weight !== undefined || item.value !== undefined) && (
               <Text position={[targetX, targetY - 1.4, targetZ + 1]} fontSize={0.3} color="#cbd5e1" anchorX="center">
                 {item.weight !== undefined ? `W: ${item.weight}` : ''} {item.value !== undefined ? `V: ${item.value}` : ''}
               </Text>
             )}
          </group>
        );
      })}
    </group>
  );
}

function RelationshipLines({ edges, positions }: { edges: SceneEdge[], positions: Map<string, ScenePosition> }) {
  return <>{edges.map(edge => {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) return null;
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start).normalize();
    start.addScaledVector(direction, 1.1);
    end.addScaledVector(direction, -1.1);
    const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    const color = STATE_COLORS[edge.state as ElementState]?.body ?? '#94a3b8';
    return <group key={edge.id}>
      <Line points={[start, end]} color={color} lineWidth={2} />
      {edge.directed && <mesh position={end} quaternion={rotation}><coneGeometry args={[0.16, 0.4, 8]} /><meshStandardMaterial color={color} /></mesh>}
      {edge.weight !== undefined && <Text position={start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.3, 0))} fontSize={0.3}>{String(edge.weight)}</Text>}
    </group>;
  })}</>;
}

function ConnectedRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  const layout = primitive.type === 'linkedlist' ? linkedListLayout(primitive) : primitive.type === 'tree' ? treeLayout(primitive) : graphLayout(primitive);
  return <group position={[0, offsetY, 0]}>
    <RelationshipLines edges={layout.edges} positions={layout.positions} />
    {layout.elements.map((node: any) => <GlowCube key={node.id} value={node.value} targetPos={layout.positions.get(node.id)!} state={node.state} pointers={node.pointerLabels} />)}
  </group>;
}

function LinkedListRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  const layout = linkedListLayout(primitive);
  return <group position={[0, offsetY, 0]}>
    <RelationshipLines edges={layout.edges} positions={layout.positions} />
    {layout.elements.map((node: any) => <LinkedListNode key={node.id} value={node.value}
      targetPos={layout.positions.get(node.id)!} state={node.state} pointers={node.pointerLabels}
      isHead={node.id === layout.head} isTail={layout.tails.has(node.id)} hasNext={false} />)}
  </group>;
}

function MatrixRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  const layout = matrixLayout(primitive);
  return <group position={[0, offsetY, 0]}>{layout.elements.map((cell: any) =>
    <GlowCube key={cell.id} value={cell.value} targetPos={layout.positions.get(cell.id)!} state={cell.state} pointers={cell.pointerLabels} />
  )}</group>;
}

// Render supported relationships rather than flattening them into hash buckets.
function GenericRenderer({ primitive, offsetY }: { primitive: AIPrimitive, offsetY: number }) {
  if (primitive.type === 'tree' || primitive.type === 'graph') return <ConnectedRenderer primitive={primitive} offsetY={offsetY} />;
  return <HashMapRenderer primitive={primitive} offsetY={offsetY} />;
}

// ─── Camera Controller ───────────────────────────────────────────────────────
// We removed manual camera overrides here to allow OrbitControls to work properly.
// The floating/alive effect is now handled by autoRotate on the OrbitControls.
function CameraController({ cameraFocus }: { cameraFocus?: string }) {
  return null;
}

// ─── Main Engine ─────────────────────────────────────────────────────────────
export default function AIVisualizerEngine({ primitives = [], cameraFocus }: { primitives: AIPrimitive[], cameraFocus?: string }) {
  return (
    <div className="w-full h-full relative bg-[#09090B]">
      <Canvas camera={{ position: [0, 2, 14], fov: 45 }} dpr={[1, 2]}>

        <color attach="background" args={['#09090B']} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#8B5CF6" />
        <directionalLight position={[-10, 20, -10]} intensity={1} color="#3B82F6" />
        <pointLight position={[0, 0, 5]} intensity={2} color="#D946EF" distance={20} />

        <Stars radius={50} depth={20} count={3000} factor={4} saturation={1} fade speed={1} />

        <CameraController cameraFocus={cameraFocus} />

        <group position={[0, ((primitives.length - 1) * 6) / 2, 0]}>
          {primitives.map((prim, idx) => {
            // Stack primitives on Y-axis if multiple exist
            const offsetY = idx * -6;

            if (prim.type === 'array' || prim.type === 'stack' || prim.type === 'queue') {
              return <ArrayRenderer key={prim.id} primitive={prim} offsetY={offsetY} />;
            }
            if (prim.type === 'matrix') return <MatrixRenderer key={prim.id} primitive={prim} offsetY={offsetY} />;
            if (prim.type === 'hashmap') {
              return <HashMapRenderer key={prim.id} primitive={prim} offsetY={offsetY} />;
            }
            if (prim.type === 'knapsack') {
              return <KnapsackRenderer key={prim.id} primitive={prim} offsetY={offsetY} />;
            }
            if (prim.type === 'linkedlist') {
              return <LinkedListRenderer key={prim.id} primitive={prim} offsetY={offsetY} />;
            }
            return <GenericRenderer key={prim.id} primitive={prim} offsetY={offsetY} />;
          })}
        </group>

        <EffectComposer multisampling={4}>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.2}
            mipmapBlur
          />
        </EffectComposer>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
          minDistance={5}
          maxDistance={40}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
