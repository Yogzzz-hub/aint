import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshDistortMaterial, Icosahedron, Float } from "@react-three/drei";
import * as THREE from "three";

function Blob({ scrollY }) {
  const ref = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, dt) => {
    if (!ref.current) return;
    // Smooth rotate toward mouse
    ref.current.rotation.y += (mouse.current.x * 0.6 - ref.current.rotation.y) * 0.06;
    ref.current.rotation.x += (-mouse.current.y * 0.4 - ref.current.rotation.x) * 0.06;
    ref.current.rotation.z += dt * 0.08;
    const s = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
    ref.current.scale.set(s, s, s);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <Icosahedron ref={ref} args={[1.6, 6]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#ffffff"
          roughness={0.15}
          metalness={0.9}
          distort={0.42}
          speed={1.4}
        />
      </Icosahedron>
    </Float>
  );
}

function Particles({ count = 220 }) {
  const points = useRef();
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);
  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.03;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.014} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0" data-testid="hero-webgl">
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4.4], fov: 45 }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 2]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-3, -2, -1]} intensity={0.7} color="#ffffff" />
        <Suspense fallback={null}>
          <Blob />
          <Particles />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
