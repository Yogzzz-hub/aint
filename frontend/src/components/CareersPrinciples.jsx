import React, { useState } from "react";

const PRINCIPLES = [
  {
    key: "craft",
    heading: "Craft over speed",
    description:
      "We ship when the work is ready. We refuse to ship for the sake of shipping.",
    image:
      "https://images.pexels.com/photos/13978499/pexels-photo-13978499.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    key: "horizon",
    heading: "Long horizon",
    description:
      "We invest in research programs that take years to compound. No quarterly noise.",
    image:
      "https://images.unsplash.com/photo-1763372278600-fd0b0997a7b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwzfHxzZW1pY29uZHVjdG9yJTIwbWljcm9jaGlwJTIwY2xvc2UlMjB1cCUyMG1vbm9jaHJvbWV8ZW58MHx8fHwxNzg0NTU4MzE4fDA&ixlib=rb-4.1.0&q=85",
  },
  {
    key: "cross",
    heading: "Cross-discipline",
    description:
      "AI meets creative direction meets industrial engineering. Range wins.",
    image:
      "https://images.pexels.com/photos/29054365/pexels-photo-29054365.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

export default function CareersPrinciples() {
  const [active, setActive] = useState(0);

  return (
    <section className="border-t border-graphite py-16 md:py-24" data-testid="careers-principles">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-8 md:mb-10">
          Principles
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {PRINCIPLES.map((p, i) => {
            const isActive = active === i;
            return (
              <button
                key={p.key}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                className="relative overflow-hidden border border-graphite bg-black cursor-pointer select-none text-left"
                style={{
                  flexGrow: isActive ? 3 : 1,
                  flexShrink: 1,
                  flexBasis: "0%",
                  minWidth: 0,
                  transition:
                    "flex-grow 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                data-testid={`principle-panel-${p.key}`}
                type="button"
              >
                {/* Image layer */}
                <div className="absolute inset-0 pointer-events-none">
                  <img
                    src={p.image}
                    alt=""
                    className="w-full h-full object-cover grayscale contrast-125"
                    style={{
                      opacity: isActive ? 0.35 : 0.12,
                      transform: isActive
                        ? "scale(1)"
                        : "scale(1.15)",
                      transition:
                        "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 p-6 md:p-8 flex flex-col justify-end h-full min-h-[240px] md:min-h-[420px]">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 mb-3 md:mb-4">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="font-display text-3xl md:text-5xl tracking-crush leading-[0.95] text-white mb-3">
                      {p.heading}
                    </h3>
                    <p
                      className="text-smoke text-sm md:text-base leading-relaxed max-w-md"
                      style={{
                        opacity: isActive ? 1 : 0.4,
                        transition:
                          "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {p.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
