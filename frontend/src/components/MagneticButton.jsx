import React, { useRef } from "react";

/**
 * MagneticButton — element follows cursor within a radius on hover.
 * Wrap any content. Renders a <button> or <a> based on `as` prop.
 */
export default function MagneticButton({
  as: Tag = "button",
  strength = 0.35,
  children,
  className = "",
  ...rest
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0,0,0)";
  };

  return (
    <span
      className="magnetic"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-magnetic
    >
      <Tag
        ref={ref}
        className={`inline-flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
        {...rest}
      >
        {children}
      </Tag>
    </span>
  );
}
