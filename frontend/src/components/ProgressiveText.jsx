import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ProgressiveText — splits into words and scrubs font-weight from 200 -> 900
 * across the element's scroll viewport progress.
 * Uses inline fontWeight for compatibility across all fonts (fallback safe).
 */
export default function ProgressiveText({
  text,
  className = "",
  as: Tag = "p",
  minWeight = 200,
  maxWeight = 900,
  testId,
}) {
  const rootRef = useRef(null);
  const words = String(text).split(/(\s+)/);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const spans = el.querySelectorAll(".pw-word");
    if (!spans.length) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      end: "bottom 40%",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress; // 0 -> 1
        spans.forEach((span, i) => {
          const n = spans.length;
          // Each word "activates" over a fractional slice of scroll
          const localStart = i / n;
          const localEnd = (i + 1) / n;
          let local;
          if (p <= localStart) local = 0;
          else if (p >= localEnd) local = 1;
          else local = (p - localStart) / (localEnd - localStart);
          const weight = Math.round(minWeight + (maxWeight - minWeight) * local);
          span.style.fontWeight = weight;
          span.style.opacity = String(0.35 + 0.65 * local);
        });
      },
    });

    return () => st.kill();
  }, [text, minWeight, maxWeight]);

  return (
    <Tag ref={rootRef} className={className} data-testid={testId}>
      {words.map((w, i) =>
        w.trim() === "" ? (
          <span key={i}>{w}</span>
        ) : (
          <span key={i} className="pw-word" style={{ fontWeight: minWeight, opacity: 0.35 }}>
            {w}
          </span>
        )
      )}
    </Tag>
  );
}
