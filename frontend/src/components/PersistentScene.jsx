import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshDistortMaterial, Icosahedron, TorusKnot, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useScrollSignal } from "../store/scrollStore";

/**
 * PersistentScene — a fixed-position WebGL canvas that lives behind
 * the entire home page. Everything is driven by scroll progress from
 * `useScrollSignal`:
 *   - Camera orbits + dollies as user scrolls
 *   - Icosahedron distorts, becomes wireframe, becomes glass, dissolves to particles
 *   - Lighting temperature shifts warm -> cool
 * This creates the "continuous film" feeling — sections never break,
 * only the surface treatment of the same object changes.
 */

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function SculptureRig() {
  const group = useRef(null);
  const meshRef = useRef(null);
  const wireRef = useRef(null);
  const glassRef = useRef(null);
  const knotRef = useRef(null);
  const particlesRef = useRef(null);
  const material = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const velocityBoost = useRef(0);

  // Particle field — becomes visible in later sections
  const particlePositions = useMemo(() => {
    const N = 900;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = Math.pow(Math.random(), 0.5) * 3.5 + 0.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  React.useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;

    // Read live scroll progress + velocity from store
    const st = useScrollSignal.getState();
    const p = clamp01(st.progress); // 0..1 over home total scroll
    const vel = st.velocity;

    // Smooth a velocity boost so quick scrolls stretch the object
    velocityBoost.current = lerp(velocityBoost.current, Math.min(Math.abs(vel) / 40, 1), 0.08);

    // ==== Camera orchestration ====
    const cam = state.camera;
    // 0..1 chapters:
    //  0.00-0.15 hero
    //  0.15-0.35 manifesto -> zoom-in
    //  0.35-0.55 stats -> orbit right
    //  0.55-0.75 philosophy -> pull back, glass
    //  0.75-1.00 ecosystem/timeline -> particles disperse
    const camTargetZ = lerp(4.4, 6.4, p);
    const camTargetX = Math.sin(p * Math.PI * 1.5) * 1.6;
    const camTargetY = -Math.cos(p * Math.PI) * 0.9 + 0.2;
    cam.position.x = lerp(cam.position.x, camTargetX + mouse.current.x * 0.35, 0.05);
    cam.position.y = lerp(cam.position.y, camTargetY + mouse.current.y * 0.2, 0.05);
    cam.position.z = lerp(cam.position.z, camTargetZ, 0.05);
    cam.lookAt(0, 0, 0);

    // ==== Object rotation ====
    g.rotation.y += dt * 0.15 + vel * 0.0005;
    g.rotation.x = lerp(g.rotation.x, mouse.current.y * 0.4 + p * 0.6, 0.05);

    // Master group scale — grows toward end
    const s = lerp(1, 1.35, p) * (1 + velocityBoost.current * 0.05);
    g.scale.set(s, s, s);

    // ==== Material state blending ====
    // Solid mesh — visible 0..0.65, opacity decays
    if (meshRef.current) {
      const op = clamp01(1 - (p - 0.55) * 4);
      meshRef.current.material.opacity = op;
      meshRef.current.material.transparent = true;
      // distortion scrubs with velocity
      const distort = 0.32 + velocityBoost.current * 0.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      if (meshRef.current.material.distort !== undefined) {
        meshRef.current.material.distort = distort;
      }
    }

    // Wireframe overlay — fades in 0.15..0.5
    if (wireRef.current) {
      const op = clamp01((p - 0.15) * 3) * clamp01(1 - (p - 0.5) * 4);
      wireRef.current.material.opacity = op * 0.6;
    }

    // Glass torus — appears 0.45..0.85
    if (glassRef.current) {
      const op = clamp01((p - 0.45) * 3.5) * clamp01(1 - (p - 0.85) * 6);
      glassRef.current.material.opacity = op;
      glassRef.current.rotation.z += dt * 0.4;
      glassRef.current.rotation.x += dt * 0.15;
      glassRef.current.scale.setScalar(0.6 + p * 0.4);
    }

    // Second geometry — appears 0.7..1
    if (knotRef.current) {
      const op = clamp01((p - 0.7) * 4);
      knotRef.current.material.opacity = op;
      knotRef.current.rotation.x += dt * 0.3;
      knotRef.current.rotation.y += dt * 0.6;
      knotRef.current.scale.setScalar(0.5 + p * 0.5);
    }

    // Particles — grow presence throughout, dominant at end
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.material.opacity = 0.15 + p * 0.75;
      particlesRef.current.material.size = 0.012 + p * 0.022;
    }
  });

  return (
    <group ref={group}>
      {/* Main sculpture */}
      <Icosahedron ref={meshRef} args={[1.55, 6]}>
        <MeshDistortMaterial
          ref={material}
          color="#ffffff"
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={1.4}
        />
      </Icosahedron>

      {/* Wireframe overlay of same shape */}
      <Icosahedron ref={wireRef} args={[1.65, 3]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0} />
      </Icosahedron>

      {/* Glass torus knot appears mid-story */}
      <TorusKnot ref={glassRef} args={[1.1, 0.28, 128, 24]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={0.6}
          roughness={0.05}
          ior={1.5}
          transparent
          opacity={0}
        />
      </TorusKnot>

      {/* End geometry — a small dense sphere */}
      <Sphere ref={knotRef} args={[0.4, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={1}
          transparent
          opacity={0}
        />
      </Sphere>

      {/* Persistent particle cloud */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.014} sizeAttenuation transparent opacity={0.2} />
      </points>
    </group>
  );
}

export default function PersistentScene() {
  const loaded = useScrollSignal((s) => s.loaded);
  const wrapRef = useRef(null);

  // Fade scene by scroll region so text-heavy sections stay legible.
  // Curve: hero 1.0 -> manifesto 0.42 -> stats 0.55 -> philosophy 0.9 -> ecosystem 0.32 -> timeline 0.28 -> cta 0.55
  React.useEffect(() => {
    let raf;
    const zones = [
      { at: 0.00, o: 1.00 },
      { at: 0.13, o: 0.42 },
      { at: 0.28, o: 0.55 },
      { at: 0.42, o: 0.90 },
      { at: 0.60, o: 0.32 },
      { at: 0.80, o: 0.30 },
      { at: 1.00, o: 0.55 },
    ];
    const sample = (p) => {
      for (let i = 0; i < zones.length - 1; i++) {
        if (p >= zones[i].at && p <= zones[i + 1].at) {
          const t = (p - zones[i].at) / (zones[i + 1].at - zones[i].at);
          return zones[i].o + (zones[i + 1].o - zones[i].o) * t;
        }
      }
      return zones[zones.length - 1].o;
    };
    const tick = () => {
      const el = wrapRef.current;
      if (el) {
        const p = useScrollSignal.getState().progress;
        el.style.opacity = String(loaded ? sample(p) : 0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-0 pointer-events-none"
      data-testid="persistent-scene"
      style={{
        opacity: 0,
        transition: "opacity 220ms linear",
      }}
    >
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4.4], fov: 45 }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 4, 2]} intensity={1.4} color="#ffffff" />
        <directionalLight position={[-3, -2, -1]} intensity={0.65} color="#e8e8ff" />
        <Suspense fallback={null}>
          <SculptureRig />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
