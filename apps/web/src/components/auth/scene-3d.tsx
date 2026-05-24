'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function IcosahedronCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.15 + pointer.y * 0.3;
    meshRef.current.rotation.y = t * 0.2 + pointer.x * 0.3;
    const scale = 1 + Math.sin(t * 0.5) * 0.03;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 0]} />
      <meshStandardMaterial
        color="#7C3FED"
        wireframe
        transparent
        opacity={0.6}
        emissive="#7C3FED"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function InnerGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 0.5) * 0.05;
    meshRef.current.scale.set(scale, scale, scale);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.15 + Math.sin(t * 0.8) * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 0]} />
      <meshBasicMaterial
        color="#7C3FED"
        transparent
        opacity={0.15}
        wireframe={false}
      />
    </mesh>
  );
}

function OrbitingParticles({ count = 60 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const radii = new Float32Array(count);
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.8 + Math.random() * 1.2;
      radii[i] = r;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.2 + Math.random() * 0.3;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, radii, offsets };
  }, [count]);

  const size = useMemo(() => 0.03 + Math.random() * 0.02, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < count; i++) {
      const angle = t * particles.speeds[i] + particles.offsets[i];
      const r = particles.radii[i];
      const theta = angle;
      const phi = Math.acos(Math.max(-1, Math.min(1, 2 * ((i / count) * 2 - 1))));
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size * 4}
        color="#7C3FED"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function StarField() {
  const count = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#7C3FED" />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#EC5E3A" />
        <IcosahedronCore />
        <InnerGlow />
        <OrbitingParticles />
        <StarField />
      </Canvas>
    </div>
  );
}
