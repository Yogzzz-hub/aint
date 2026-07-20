import React, { useRef, useEffect } from "react";
import { useScrollSignal } from "../store/scrollStore";

/**
 * SceneAtmosphere — fixed atmospheric layers behind everything.
 *  - Radial vignette that shifts with scroll
 *  - Light rays sweeping
 *  - Depth fog
 *  - Warm-cool color temperature that morphs
 */
export default function SceneAtmosphere() {
  const orbA = useRef(null);
  const orbB = useRef(null);
  const raysRef = useRef(null);
  const vignetteRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      const st = useScrollSignal.getState();
      const p = Math.max(0, Math.min(1, st.progress));

      if (orbA.current) {
        orbA.current.style.transform = `translate3d(${-20 + p * 40}vw, ${-10 + p * 30}vh, 0) scale(${1 + p * 0.4})`;
        orbA.current.style.opacity = String(0.35 + p * 0.15);
      }
      if (orbB.current) {
        orbB.current.style.transform = `translate3d(${30 - p * 50}vw, ${20 - p * 40}vh, 0) scale(${0.9 + p * 0.6})`;
        orbB.current.style.opacity = String(0.25 + p * 0.35);
      }
      if (raysRef.current) {
        raysRef.current.style.opacity = String(0.08 + p * 0.14);
        raysRef.current.style.transform = `rotate(${-8 + p * 22}deg)`;
      }
      if (vignetteRef.current) {
        const hue = 220 + p * 20; // subtle cool shift
        vignetteRef.current.style.background = `radial-gradient(ellipse at 50% ${20 + p * 60}%, transparent 0%, hsla(${hue}, 6%, 4%, 0.55) 70%, #000 100%)`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden" data-testid="scene-atmosphere">
      {/* Moving gradient orbs = ambient light "presence" */}
      <div
        ref={orbA}
        className="absolute w-[70vw] h-[70vw] rounded-full blur-[110px]"
        style={{
          left: "-10vw",
          top: "-10vh",
          background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)",
          transition: "opacity 800ms ease",
        }}
      />
      <div
        ref={orbB}
        className="absolute w-[60vw] h-[60vw] rounded-full blur-[120px]"
        style={{
          right: "-10vw",
          bottom: "-10vh",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)",
          transition: "opacity 800ms ease",
        }}
      />

      {/* Light rays — sweeping diagonal bands */}
      <div
        ref={raysRef}
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 60px, rgba(255,255,255,0.02) 60px, rgba(255,255,255,0.02) 61px)",
          transformOrigin: "center",
          transition: "opacity 600ms ease",
        }}
      />

      {/* Scroll-linked vignette */}
      <div ref={vignetteRef} className="absolute inset-0" />
    </div>
  );
}
