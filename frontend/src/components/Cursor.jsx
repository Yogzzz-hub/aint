import React, { useEffect, useRef } from "react";

/**
 * Custom dot + ring cursor with lerp follow.
 * mix-blend-mode:difference is set via CSS.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const setHover = (v) => {
      dotRef.current?.classList.toggle("hover", v);
      ringRef.current?.classList.toggle("hover", v);
    };

    const overHandler = (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const interactive = t.closest("a, button, [data-magnetic], input, textarea, [data-cursor-hover]");
      setHover(!!interactive);
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.5;
      pos.current.y += (target.current.y - pos.current.y) * 0.5;
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.18;

      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${pos.current.x - 3}px, ${pos.current.y - 3}px, 0)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - 17}px, ${ringPos.current.y - 17}px, 0)`;

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", overHandler);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", overHandler);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" data-testid="custom-cursor-dot" />
      <div ref={ringRef} className="cursor-ring" data-testid="custom-cursor-ring" />
    </>
  );
}
