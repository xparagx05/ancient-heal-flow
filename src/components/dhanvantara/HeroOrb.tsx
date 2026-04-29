import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef, Suspense } from "react";
import type { Mesh } from "three";

function Orb() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
      ref.current.rotation.x += delta * 0.05;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={ref} args={[1.4, 96, 96]}>
        <MeshDistortMaterial
          color="#9b87f5"
          attach="material"
          distort={0.42}
          speed={1.6}
          roughness={0.08}
          metalness={0.7}
          emissive="#7c5fe6"
          emissiveIntensity={0.35}
        />
      </Sphere>
    </Float>
  );
}

function Particles() {
  const group = useRef<any>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });
  const items = Array.from({ length: 24 });
  return (
    <group ref={group}>
      {items.map((_, i) => {
        const angle = (i / items.length) * Math.PI * 2;
        const radius = 2.6 + Math.sin(i) * 0.4;
        return (
          <Float key={i} speed={2 + Math.random()} floatIntensity={2}>
            <mesh position={[Math.cos(angle) * radius, Math.sin(angle * 1.3) * 1.2, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.04 + Math.random() * 0.04, 16, 16]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#ffd28a" : i % 3 === 1 ? "#a5d8ff" : "#c8b6ff"}
                emissive={i % 3 === 0 ? "#ffd28a" : "#a5d8ff"}
                emissiveIntensity={0.8}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export default function HeroOrb() {
  return (
    <div className="absolute inset-0 -z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#c8b6ff" />
          <pointLight position={[-5, -3, 3]} intensity={0.8} color="#a5d8ff" />
          <pointLight position={[0, 4, 2]} intensity={0.6} color="#ffd28a" />
          <Orb />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}
