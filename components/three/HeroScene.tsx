"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";

function Node({
  position,
  color,
  scale = 0.4,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, 2]} intensity={1} color="#27e0c6" />

      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.5}>
        <mesh scale={1.7}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial
            color="#7c5cff"
            emissive="#6438ff"
            emissiveIntensity={0.3}
            distort={0.35}
            speed={2}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
      </Float>

      <Node position={[2.7, 1.2, -1]} color="#27e0c6" />
      <Node position={[-2.8, -1, -1]} color="#9d86ff" />
      <Node position={[2.2, -1.7, 0]} color="#7c5cff" scale={0.3} />
      <Node position={[-2.3, 1.6, 0]} color="#27e0c6" scale={0.3} />

      <Stars radius={50} depth={20} count={1200} factor={3} fade speed={1} />
    </Canvas>
  );
}
