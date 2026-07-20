import React, { useEffect, useRef, useState } from "react";

/**
 * Contextual cursor — supports modes via `data-cursor` attribute:
 *   default | hover | drag | read | explore | button | image | scene
 * Displays a label when a `data-cursor-label` is present.
 * Speed of the ring is scroll-velocity aware.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [mode, setMode] = useState("default");
  const [label, setLabel] = useState("");

  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    const overHandler = (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const el =
        t.closest("[data-cursor]") ||
        t.closest("a") ||
        t.closest("button") ||
        t.closest("input, textarea");

      if (!el) {
        setMode("default");
        setLabel("");
        return;
      }
      const m = el.getAttribute("data-cursor");
      if (m) {
        setMode(m);
      } else if (el.tagName === "A" || el.tagName === "BUTTON") {
        setMode("button");
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        setMode("read");
      } else {
        setMode("hover");
      }
      const l = el.getAttribute("data-cursor-label");
      setLabel(l || "");
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.55;
      pos.current.y += (target.current.y - pos.current.y) * 0.55;
      ringPos.current.x += (target.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (target.current.y - ringPos.current.y) * 0.16;

      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%,-50%)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%,-50%)`;
      if (labelRef.current)
        labelRef.current.style.transform = `translate3d(${ringPos.current.x + 30}px, ${ringPos.current.y + 30}px, 0)`;

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
      <div
        ref={dotRef}
        className={`cursor-dot mode-${mode}`}
        data-testid="custom-cursor-dot"
      />
      <div
        ref={ringRef}
        className={`cursor-ring mode-${mode}`}
        data-testid="custom-cursor-ring"
      >
        <span className="cursor-inner" />
      </div>
      {label && (
        <div
          ref={labelRef}
          className="cursor-label"
          data-testid="cursor-label"
        >
          {label}
        </div>
      )}
    </>
  );
}
