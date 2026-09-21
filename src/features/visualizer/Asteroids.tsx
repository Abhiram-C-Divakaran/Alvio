import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Asteroids({ count = 50, reducedMotion = false }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 40 - 20; // push behind

      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;

      const scale = 0.2 + Math.random() * 0.8;

      const speed = 0.01 + Math.random() * 0.02;

      temp.push({ x, y, z, rx, ry, rz, scale, speed });
    }
    return temp;
  }, [count]);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      asteroids.forEach((ast, i) => {
        ast.rx += reducedMotion ? 0 : ast.speed * delta;
        ast.ry += reducedMotion ? 0 : ast.speed * delta;

        // slow movement
        ast.x += reducedMotion ? 0 : ast.speed * delta * 2;
        if (ast.x > 30) ast.x = -30;

        dummy.position.set(ast.x, ast.y, ast.z);
        dummy.rotation.set(ast.rx, ast.ry, ast.rz);
        dummy.scale.set(ast.scale, ast.scale, ast.scale);
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
}
