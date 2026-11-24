import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CurriculumTopic } from '../data/curriculumData';
import { createPlanetTexture, createRadialGlowTexture } from './planetTextures';

interface PlanetNodeProps {
  topic: CurriculumTopic;
  isSelected: boolean;
  onClick: (topic: CurriculumTopic) => void;
}

export default function PlanetNode({
  topic,
  isSelected,
  onClick,
}: PlanetNodeProps) {
  const orbitPivotRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const planetTexture = useMemo(() => {
    return createPlanetTexture(topic.id, topic.color, topic.secondaryColor);
  }, [topic.id, topic.color, topic.secondaryColor]);

  const radialGlowTexture = useMemo(() => {
    return createRadialGlowTexture(topic.color);
  }, [topic.color]);

  // Continuous orbital revolution and gentle axial rotation
  useFrame((_, delta) => {
    if (orbitPivotRef.current) {
      orbitPivotRef.current.rotation.y += topic.orbitSpeed * delta;
    }
    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y += 0.22 * delta;
    }
  });

  const baseRadius = topic.size;
  const currentScale = isSelected ? 1.15 : hovered ? 1.08 : 1.0;

  return (
    <group ref={orbitPivotRef} rotation={[0, topic.initialAngle, 0]}>
      <group
        position={[topic.orbitRadius, 0, 0]}
        scale={currentScale}
        onClick={(e) => {
          e.stopPropagation();
          onClick(topic);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {/* Selected Dynamic Radial Glow Halo */}
        {isSelected && (
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[baseRadius * 2.6, baseRadius * 2.6]} />
            <meshBasicMaterial
              map={radialGlowTexture}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* 1. Procedural Surface Sphere */}
        <mesh ref={planetMeshRef}>
          <sphereGeometry args={[baseRadius, 64, 64]} />
          <meshStandardMaterial
            map={planetTexture}
            roughness={0.52}
            metalness={0.04}
          />
        </mesh>

        {/* 2. Luminous Atmosphere Shell */}
        <mesh scale={1.06}>
          <sphereGeometry args={[baseRadius, 32, 32]} />
          <meshBasicMaterial
            color={topic.color}
            transparent
            opacity={isSelected ? 0.14 : hovered ? 0.08 : 0.04}
            side={THREE.BackSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* 3. Thin Translucent Planetary Ring */}
        {topic.hasRing && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[baseRadius * 1.35, baseRadius * 1.44, 96]} />
            <meshBasicMaterial
              color={topic.color}
              transparent
              opacity={isSelected ? 0.42 : 0.24}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* Attached 3D Badge on Planet Ring */}
        {topic.status === 'Completed' && (
          <Html position={[baseRadius * 1.15, baseRadius * 0.18, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
            <div className="w-3.5 h-3.5 rounded-full bg-[#36c978] flex items-center justify-center shadow-[0_0_8px_rgba(54,201,120,0.8)] border border-white/60 pointer-events-none">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </Html>
        )}

        {topic.status === 'Locked' && (
          <Html position={[baseRadius * 1.1, baseRadius * 0.18, 0]} center distanceFactor={14} zIndexRange={[100, 0]}>
            <div className="w-3.5 h-3.5 rounded-full bg-[#1c1228] flex items-center justify-center shadow-[0_0_6px_rgba(255,83,103,0.4)] border border-white/25 pointer-events-none">
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </Html>
        )}

        {/* HTML Floating Label (Readable screen-space size facing viewer) */}
        <Html
          position={[0, -baseRadius - 0.22, 0]}
          center
          distanceFactor={14}
          zIndexRange={[90, 0]}
        >
          <div
            className="pointer-events-none select-none text-center whitespace-nowrap"
            style={{ textShadow: '0 2px 8px #000, 0 0 12px rgba(0,0,0,.9)' }}
          >
            <div className="text-white text-[12px] font-[650] tracking-wide leading-tight">
              {topic.name}
            </div>

            <div className="mt-[2px]">
              {topic.status === 'Completed' && (
                <span className="text-[#36c978] text-[9.5px] font-medium tracking-tight">
                  Completed
                </span>
              )}
              {topic.status === 'In Progress' && (
                <span className="text-[#9b61ff] text-[9.5px] font-medium tracking-tight">
                  In Progress • {topic.progress}%
                </span>
              )}
              {topic.status === 'Locked' && (
                <span className="text-[#ff5367] text-[9.5px] font-medium tracking-tight">
                  Locked
                </span>
              )}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}
