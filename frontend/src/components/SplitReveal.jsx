import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * SplitReveal — splits text into word spans that reveal with stagger.
 * Uses framer-motion inView. Reduced-motion friendly.
 */
export default function SplitReveal({
  text,
  as: Tag = "h1",
  className = "",
  stagger = 0.06,
  delay = 0,
  once = true,
  testId,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });
  const words = String(text).split(" ");

  return (
    <Tag ref={ref} className={className} data-testid={testId}>
      {words.map((w, i) => (
        <span key={i} className="reveal-mask">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : { y: "110%" }}
            transition={{
              duration: 0.9,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
