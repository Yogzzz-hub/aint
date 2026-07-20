import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollSignal } from "../store/scrollStore";

/**
 * Cinematic loader — AINTRIX letters assemble from split positions,
 * a light sweep passes across, then the entire wordmark contracts
 * and the site fades in behind it.
 */
const LETTERS = ["A", "I", "N", "T", "R", "I", "X"];

export default function Loader() {
  const setSignal = useScrollSignal((s) => s.set);
  const [phase, setPhase] = useState(0); // 0=intro, 1=sweep, 2=exit, 3=done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => {
      setPhase(3);
      setSignal({ loaded: true });
    }, 3200);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [setSignal]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          key="loader"
          data-testid="cinematic-loader"
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 0.9, ease: [0.85, 0, 0.15, 1] },
          }}
        >
          {/* moving gradient orb behind letters */}
          <motion.div
            className="absolute w-[80vw] h-[80vw] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
            animate={{
              scale: phase === 0 ? 0.4 : phase === 1 ? 1.2 : 0.6,
              opacity: phase >= 2 ? 0 : 1,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* wordmark */}
          <div className="relative flex items-center gap-1 md:gap-2">
            {LETTERS.map((l, i) => (
              <motion.span
                key={i}
                className="font-display tracking-crush text-[16vw] md:text-[10vw] leading-none text-white inline-block"
                initial={{
                  y: (i % 2 === 0 ? -1 : 1) * (120 + i * 20),
                  x: (i - 3) * 40,
                  rotate: (i - 3) * 8,
                  opacity: 0,
                  filter: "blur(24px)",
                }}
                animate={{
                  y: phase >= 2 ? -20 : 0,
                  x: 0,
                  rotate: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 1.3,
                  delay: 0.05 * i,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {l}
              </motion.span>
            ))}
          </div>

          {/* light sweep */}
          {phase >= 1 && (
            <motion.div
              className="absolute inset-y-0 w-[40vw] pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }}
              initial={{ x: "-50vw" }}
              animate={{ x: "120vw" }}
              transition={{ duration: 1.1, ease: [0.85, 0, 0.15, 1] }}
            />
          )}

          {/* corner meta */}
          <div className="absolute top-6 left-6 md:top-8 md:left-10 text-[10px] uppercase tracking-[0.35em] text-smoke">
            AINTRIX Global · MMXXVI
          </div>
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 text-[10px] uppercase tracking-[0.35em] text-smoke">
            Loading experience…
          </div>
          <motion.div
            className="absolute bottom-8 left-6 md:left-10 h-px bg-white"
            initial={{ width: 0 }}
            animate={{ width: phase === 0 ? "20%" : phase === 1 ? "60%" : "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
