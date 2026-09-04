import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useScrollSignal } from "../store/scrollStore";

/**
 * PersistentScene — fully imperative Three.js scene (no r3f / drei).
 *
 * Switched away from @react-three/fiber + @react-three/drei entirely
 * because multiple components (bufferAttribute, Environment, MeshDistortMaterial)
 * trigger "e.map is not a function" in Three.js r170 due to r3f v8's
 * constructor-arg prop-passing behavior.
 *
 * This version drives everything directly with the Three.js API so there
 * is zero abstraction layer that can mangle constructor arguments.
 */

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function buildScene() {
  const scene = new THREE.Scene();

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  const dirA = new THREE.DirectionalLight(0xffffff, 1.4);
  dirA.position.set(3, 4, 2);
  scene.add(dirA);

  const dirB = new THREE.DirectionalLight(0xe8e8ff, 0.65);
  dirB.position.set(-3, -2, -1);
  scene.add(dirB);

  // ---- Main icosahedron (chrome) ----
  const icoGeo = new THREE.IcosahedronGeometry(1.55, 6);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.9,
    transparent: true,
    opacity: 1,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // ---- Wireframe overlay ----
  const wireGeo = new THREE.IcosahedronGeometry(1.65, 3);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  // ---- Glass torus knot ----
  const torusGeo = new THREE.TorusKnotGeometry(1.1, 0.28, 128, 24);
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.05,
    metalness: 0,
    transparent: true,
    opacity: 0,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  scene.add(torus);

  // ---- Dense sphere ----
  const sphereGeo = new THREE.SphereGeometry(0.4, 64, 64);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 1,
    transparent: true,
    opacity: 0,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  // ---- Particle cloud ----
  const N = 900;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = Math.pow(Math.random(), 0.5) * 3.5 + 0.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const ptMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.014,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.2,
  });
  const points = new THREE.Points(ptGeo, ptMat);
  scene.add(points);

  // Group that wraps animated objects
  const group = new THREE.Group();
  group.add(ico, wire, torus, sphere, points);
  // remove from scene root, re-add via group
  scene.remove(ico, wire, torus, sphere, points);
  scene.add(group);

  return {
    scene,
    group,
    meshes: { ico, wire, torus, sphere, points },
    mats: { icoMat, wireMat, torusMat, sphereMat, ptMat },
    geos: { icoGeo, wireGeo, torusGeo, sphereGeo, ptGeo },
  };
}

export default function PersistentScene() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const loaded = useScrollSignal((s) => s.loaded);
  const loadedRef = useRef(loaded);
  const [contextLost, setContextLost] = useState(false);
  const contextLostRef = useRef(false);

  // Keep refs in sync so the rAF loop can read them without stale closures
  useEffect(() => { loadedRef.current = loaded; }, [loaded]);
  useEffect(() => { contextLostRef.current = contextLost; }, [contextLost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ---- Renderer ----
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("WebGL not available", e);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // ---- Camera ----
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    // ---- Scene objects ----
    const { scene, group, meshes, mats, geos } = buildScene();
    const { ico, wire, torus, sphere, points } = meshes;
    const { icoMat, wireMat, torusMat, sphereMat, ptMat } = mats;

    // ---- State ----
    const mouse = { x: 0, y: 0 };
    let velocityBoost = 0;
    let clock = new THREE.Clock();

    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);

    // Opacity zones
    const zones = [
      { at: 0.00, o: 1.00 },
      { at: 0.13, o: 0.42 },
      { at: 0.28, o: 0.55 },
      { at: 0.42, o: 0.90 },
      { at: 0.60, o: 0.32 },
      { at: 0.80, o: 0.30 },
      { at: 1.00, o: 0.55 },
    ];
    const sampleOpacity = (p) => {
      for (let i = 0; i < zones.length - 1; i++) {
        if (p >= zones[i].at && p <= zones[i + 1].at) {
          const t = (p - zones[i].at) / (zones[i + 1].at - zones[i].at);
          return zones[i].o + (zones[i + 1].o - zones[i].o) * t;
        }
      }
      return zones[zones.length - 1].o;
    };

    // ---- Render loop ----
    let rafId;
    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      const st = useScrollSignal.getState();
      const p = clamp01(st.progress);
      const vel = st.velocity;

      // Wrap opacity
      const wrap = wrapRef.current;
      if (wrap) {
        const targetOp = loadedRef.current && !contextLostRef.current ? sampleOpacity(p) : 0;
        wrap.style.opacity = String(targetOp);
      }

      // Velocity boost
      velocityBoost = lerp(velocityBoost, Math.min(Math.abs(vel) / 40, 1), 0.08);

      // Camera
      const camZ = lerp(4.4, 6.4, p);
      const camX = Math.sin(p * Math.PI * 1.5) * 1.6;
      const camY = -Math.cos(p * Math.PI) * 0.9 + 0.2;
      camera.position.x = lerp(camera.position.x, camX + mouse.x * 0.35, 0.05);
      camera.position.y = lerp(camera.position.y, camY + mouse.y * 0.2, 0.05);
      camera.position.z = lerp(camera.position.z, camZ, 0.05);
      camera.lookAt(0, 0, 0);

      // Group rotation
      group.rotation.y += dt * 0.15 + vel * 0.0005;
      group.rotation.x = lerp(group.rotation.x, mouse.y * 0.4 + p * 0.6, 0.05);

      // Scale
      const s = lerp(1, 1.35, p) * (1 + velocityBoost * 0.05);
      group.scale.setScalar(s);

      // Solid mesh
      icoMat.opacity = clamp01(1 - (p - 0.55) * 4);

      // Wireframe
      wireMat.opacity = clamp01((p - 0.15) * 3) * clamp01(1 - (p - 0.5) * 4) * 0.6;

      // Glass torus
      torusMat.opacity = clamp01((p - 0.45) * 3.5) * clamp01(1 - (p - 0.85) * 6);
      torus.rotation.z += dt * 0.4;
      torus.rotation.x += dt * 0.15;
      torus.scale.setScalar(0.6 + p * 0.4);

      // Sphere
      sphereMat.opacity = clamp01((p - 0.7) * 4);
      sphere.rotation.x += dt * 0.3;
      sphere.rotation.y += dt * 0.6;
      sphere.scale.setScalar(0.5 + p * 0.5);

      // Particles
      points.rotation.y = elapsed * 0.03;
      ptMat.opacity = 0.15 + p * 0.75;
      ptMat.size = 0.012 + p * 0.022;

      renderer.render(scene, camera);
    };
    tick();

    // ---- Resize ----
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ---- Context loss ----
    const handleLost = (e) => {
      e.preventDefault();
      console.warn("WebGL context lost");
      setContextLost(true);
      cancelAnimationFrame(rafId);
    };
    const handleRestored = () => {
      console.info("WebGL context restored");
      setContextLost(false);
      clock = new THREE.Clock();
      tick();
    };
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
      renderer.dispose();
      Object.values(geos).forEach((g) => g.dispose());
      Object.values({ icoMat, wireMat, torusMat, sphereMat, ptMat }).forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-0 pointer-events-none"
      data-testid="persistent-scene"
      style={{ opacity: 0, transition: "opacity 220ms linear" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
