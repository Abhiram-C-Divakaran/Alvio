// ============================================================
// Visualization3D — Premium 3D rendering of Data Structures
// Inspired by tactile, sculptural 3D geometry with rich lighting,
// realistic materials, and carefully chosen shapes per structure.
// ============================================================
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Float, Environment, Lightformer, RoundedBox, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type {
  DataStructure,
  DSANode,
  DSAEdge,
  Position3D,
} from '../../types/dataStructures';

// ---- Palette ----
const PALETTE = {
  indigo:    '#6366f1',
  purple:    '#a855f7',
  violet:    '#8b5cf6',
  amber:     '#f59e0b',
  emerald:   '#10b981',
  sky:       '#0ea5e9',
  rose:      '#f43f5e',
  stone:     '#d6d3d1',
  edge:      '#818cf8',
};

// ---- Subtle rotation animation ----
function SlowRotate({ children, speed = 0.003 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += speed;
  });
  return <group ref={ref}>{children}</group>;
}

// ---- Ground plane with grid ----
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0d0d1a"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
      <gridHelper args={[30, 30, '#1e1e3a', '#13131f']} position={[0, -2.2, 0]} />
    </group>
  );
}

// ---- Individual node shapes per structure type ----
interface NodeMeshProps {
  node: DSANode;
  shape?: 'sphere' | 'box' | 'rounded-box' | 'ico' | 'cylinder' | 'bucket';
  color?: string;
  size?: number;
}

function NodeMesh({ node, shape = 'sphere', color, size = 1 }: NodeMeshProps) {
  const baseColor = color || (node.state.highlighted ? PALETTE.amber : PALETTE.indigo);
  const emissiveIntensity = node.state.highlighted ? 0.8 : 0.3;
  const pos: [number, number, number] = [node.position.x, node.position.y, node.position.z];

  const material = (
    <meshStandardMaterial
      color={baseColor}
      emissive={baseColor}
      emissiveIntensity={emissiveIntensity}
      roughness={0.25}
      metalness={0.65}
      envMapIntensity={1.2}
    />
  );

  const label = (
    <Text
      position={[0, 0, size * 0.7]}
      fontSize={0.22 * size}
      color="#f0f0f8"
      anchorX="center"
      anchorY="middle"
      font={undefined}
      outlineWidth={0.01}
      outlineColor="#000000"
    >
      {String(node.value)}
    </Text>
  );

  return (
    <Float
      speed={1.4 + Math.random() * 0.4}
      floatIntensity={node.state.highlighted ? 0.55 : 0.2}
      rotationIntensity={0.15}
    >
      <group position={pos} castShadow>
        {shape === 'sphere' && (
          <mesh castShadow>
            <sphereGeometry args={[0.38 * size, 48, 48]} />
            {material}
          </mesh>
        )}
        {shape === 'ico' && (
          <mesh castShadow>
            <icosahedronGeometry args={[0.42 * size, 1]} />
            {material}
          </mesh>
        )}
        {shape === 'box' && (
          <mesh castShadow>
            <boxGeometry args={[0.72 * size, 0.72 * size, 0.72 * size]} />
            {material}
          </mesh>
        )}
        {shape === 'rounded-box' && (
          <RoundedBox args={[0.72 * size, 0.72 * size, 0.72 * size]} radius={0.12} smoothness={4} castShadow>
            {material}
          </RoundedBox>
        )}
        {shape === 'cylinder' && (
          <mesh castShadow>
            <cylinderGeometry args={[0.32 * size, 0.38 * size, 0.55 * size, 32]} />
            {material}
          </mesh>
        )}
        {shape === 'bucket' && (
          <mesh castShadow>
            <cylinderGeometry args={[0.28 * size, 0.36 * size, 0.8 * size, 32, 1, true]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={baseColor}
              emissiveIntensity={emissiveIntensity * 0.5}
              roughness={0.4}
              metalness={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        {label}
      </group>
    </Float>
  );
}

// ---- Edge connector ----
function EdgeLine({ from, to, color = PALETTE.edge, width = 1.5 }: { from: Position3D; to: Position3D; color?: string; width?: number }) {
  return (
    <Line
      points={[[from.x, from.y, from.z], [to.x, to.y, to.z]]}
      color={color}
      lineWidth={width}
      transparent
      opacity={0.55}
      dashed={false}
    />
  );
}

// ---- Array: hovering rounded boxes in a row with connectors ----
function ArrayScene({ structure }: { structure: Extract<DataStructure, { type: 'array' }> }) {
  return (
    <>
      {structure.elements.map((n, i) => (
        <NodeMesh
          key={n.id}
          node={n}
          shape="rounded-box"
          color={n.state.highlighted ? PALETTE.amber : (i % 2 === 0 ? PALETTE.indigo : PALETTE.violet)}
        />
      ))}
      {structure.elements.map((n, i) =>
        i < structure.elements.length - 1 ? (
          <EdgeLine
            key={`arr-edge-${i}`}
            from={n.position}
            to={structure.elements[i + 1].position}
            color={PALETTE.edge}
            width={1}
          />
        ) : null
      )}
    </>
  );
}

// ---- Stack: vertical cylinder column ----
function StackScene({ structure }: { structure: Extract<DataStructure, { type: 'stack' }> }) {
  const n = structure.elements.length;
  return (
    <>
      {structure.elements.map((el, i) => (
        <NodeMesh
          key={el.id}
          node={{ ...el, position: { x: 0, y: -((n - 1) / 2) + i, z: 0 } }}
          shape="cylinder"
          color={i === n - 1 ? PALETTE.amber : PALETTE.indigo}
          size={1.1}
        />
      ))}
    </>
  );
}

// ---- Queue: spheres in a line with direction arrow ----
function QueueScene({ structure }: { structure: Extract<DataStructure, { type: 'queue' }> }) {
  const len = structure.elements.length;
  return (
    <>
      {structure.elements.map((n, i) => (
        <NodeMesh
          key={n.id}
          node={n}
          shape="sphere"
          color={i === 0 ? PALETTE.emerald : i === len - 1 ? PALETTE.amber : PALETTE.sky}
        />
      ))}
      {structure.elements.map((n, i) =>
        i < len - 1 ? (
          <EdgeLine key={`q-${i}`} from={n.position} to={structure.elements[i + 1].position} color={PALETTE.sky} width={2} />
        ) : null
      )}
    </>
  );
}

// ---- Linked List: spheres connected by glowing lines ----
function LinkedListScene({ structure }: { structure: Extract<DataStructure, { type: 'linked-list' }> }) {
  const byId = new Map(structure.nodes.map(n => [n.id, n]));
  return (
    <>
      {structure.nodes.map((n, i) => (
        <NodeMesh
          key={n.id}
          node={n}
          shape="sphere"
          color={i === 0 ? PALETTE.emerald : PALETTE.indigo}
        />
      ))}
      {structure.nodes.map(n =>
        n.next && byId.has(n.next) ? (
          <EdgeLine key={`${n.id}-e`} from={n.position} to={byId.get(n.next)!.position} color={PALETTE.violet} width={2} />
        ) : null
      )}
    </>
  );
}

// ---- Binary / AVL Tree: icosahedra with connecting edges ----
function TreeScene({ structure }: { structure: Extract<DataStructure, { type: 'binary-tree' | 'avl-tree' }> }) {
  const byId = new Map(structure.nodes.map(n => [n.id, n]));
  return (
    <>
      {structure.nodes.map((n, i) => (
        <NodeMesh
          key={n.id}
          node={n}
          shape="ico"
          color={n.state.highlighted ? PALETTE.amber : i === 0 ? PALETTE.rose : PALETTE.indigo}
        />
      ))}
      {structure.nodes.flatMap(n => [
        n.left && byId.has(n.left) && (
          <EdgeLine key={`${n.id}-l`} from={n.position} to={byId.get(n.left)!.position} color={PALETTE.violet} />
        ),
        n.right && byId.has(n.right) && (
          <EdgeLine key={`${n.id}-r`} from={n.position} to={byId.get(n.right)!.position} color={PALETTE.violet} />
        ),
      ])}
    </>
  );
}

// ---- Graph: spheres with purple edges ----
function GraphScene({ structure }: { structure: Extract<DataStructure, { type: 'graph' }> }) {
  const byId = new Map(structure.nodes.map(n => [n.id, n]));
  return (
    <>
      {structure.nodes.map((n, i) => (
        <NodeMesh
          key={n.id}
          node={n}
          shape="sphere"
          color={[PALETTE.indigo, PALETTE.violet, PALETTE.sky, PALETTE.emerald, PALETTE.rose][i % 5]}
        />
      ))}
      {structure.edges.map((e: DSAEdge) =>
        byId.has(e.from) && byId.has(e.to) ? (
          <EdgeLine key={e.id} from={byId.get(e.from)!.position} to={byId.get(e.to)!.position} color={PALETTE.purple} width={2} />
        ) : null
      )}
    </>
  );
}

// ---- Hash Table: bucket cylinders with entries stacked above ----
function HashTableScene({ structure }: { structure: Extract<DataStructure, { type: 'hash-table' }> }) {
  const gap = 1.5;
  const start = -((structure.buckets.length - 1) * gap) / 2;
  return (
    <>
      {structure.buckets.map((bucket, bi) => {
        const bx = start + bi * gap;
        return (
          <group key={bucket.index}>
            {/* bucket label */}
            <Text position={[bx, 1.6, 0]} fontSize={0.22} color="#a0a0b8" anchorX="center">
              {`[${bucket.index}]`}
            </Text>
            {/* bucket base cylinder */}
            <mesh position={[bx, -0.9, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 0.25, 32]} />
              <meshStandardMaterial color={PALETTE.violet} emissive={PALETTE.violet} emissiveIntensity={0.2} roughness={0.4} metalness={0.5} />
            </mesh>
            {/* entries */}
            {bucket.entries.map((entry, ei) => (
              <NodeMesh
                key={entry.id}
                shape="rounded-box"
                node={{ ...entry, position: { x: bx, y: 0.5 - ei * 0.9, z: 0 } }}
                color={PALETTE.indigo}
                size={0.85}
              />
            ))}
          </group>
        );
      })}
    </>
  );
}

// ---- Scene router ----
function SceneContent({ structure }: { structure: DataStructure }) {
  switch (structure.type) {
    case 'array':
      return <ArrayScene structure={structure} />;
    case 'stack':
      return <StackScene structure={structure} />;
    case 'queue':
      return <QueueScene structure={structure} />;
    case 'linked-list':
      return <LinkedListScene structure={structure} />;
    case 'binary-tree':
    case 'avl-tree':
      return <TreeScene structure={structure} />;
    case 'graph':
      return <GraphScene structure={structure} />;
    case 'hash-table':
      return <HashTableScene structure={structure} />;
    default:
      return null;
  }
}

// ---- Main export ----
export default function Visualization3D({ structure }: { structure: DataStructure | null }) {
  if (!structure) return null;

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 2, 9], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting rig — warm key + cool fill + rim */}
        <ambientLight intensity={0.35} color="#c8c8ff" />
        <directionalLight
          position={[6, 10, 6]}
          intensity={1.4}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-6, 4, 4]} intensity={1.0} color="#6366f1" />
        <pointLight position={[4, -4, 6]} intensity={0.7} color="#a855f7" />
        <pointLight position={[0, 6, -4]} intensity={0.5} color="#818cf8" />

        {/* HDR environment for reflections */}
        <Environment resolution={128} frames={1}>
          <Lightformer position={[0, 5, -5]} scale={[12, 5, 1]} intensity={3} color="#b7cdff" />
          <Lightformer position={[-5, 1, 3]} rotation={[0, Math.PI / 2, 0]} scale={[5, 8, 1]} intensity={4} color="#7257ff" />
          <Lightformer position={[5, 2, 3]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 8, 1]} intensity={3} color="#55cfff" />
        </Environment>

        {/* Ground */}
        <Ground />

        {/* Slow scene rotation wrapper */}
        <SlowRotate speed={0.004}>
          <SceneContent structure={structure} />
        </SlowRotate>

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={16}
          autoRotate={false}
          enableDamping
          dampingFactor={0.06}
        />
      </Canvas>
    </div>
  );
}
