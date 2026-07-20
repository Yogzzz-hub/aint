import React from "react";
import { motion } from "framer-motion";
import SplitReveal from "../components/SplitReveal";
import { DIVISIONS } from "../lib/content";
import { ArrowUpRight } from "lucide-react";

export default function Ecosystem() {
  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-20">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">The Ecosystem</div>
        <SplitReveal
          as="h1"
          testId="ecosystem-title"
          text="Building the future across industries."
          className="font-display text-5xl md:text-8xl lg:text-[8.5vw] tracking-crush leading-[0.94]"
        />
        <p className="max-w-2xl mt-10 text-smoke text-lg leading-relaxed">
          Eight divisions. One shared discipline. AINTRIX operates as a compound organization —
          our research in one industry accelerates our craft in another.
        </p>
      </section>

      <section className="border-t border-graphite" data-testid="ecosystem-list">
        {DIVISIONS.map((d, i) => {
          const flip = i % 2 === 1;
          return (
            <div
              key={d.key}
              className="border-b border-graphite"
              data-testid={`ecosystem-item-${d.key}`}
            >
              <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-20 md:py-32">
                <div className={`grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center ${flip ? "md:[direction:rtl]" : ""}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-15%" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-7 [direction:ltr]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden border border-graphite group">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/0 transition-colors duration-1000" />
                      <div className="absolute top-6 left-6 text-[11px] uppercase tracking-[0.3em] text-white/80">{d.n} · {d.tag}</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-15%" }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-5 [direction:ltr]"
                  >
                    <div className="font-display text-7xl md:text-8xl tracking-crush text-graphite mb-6 leading-none">
                      {d.n}
                    </div>
                    <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-6">
                      {d.name}
                    </h2>
                    <p className="text-smoke text-lg leading-relaxed max-w-lg">{d.body}</p>
                    {d.featured && (
                      <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 border border-white text-white text-[10px] uppercase tracking-[0.3em]">
                        Featured Division
                      </div>
                    )}
                    <div className="mt-10 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white cursor-pointer">
                      Explore division <ArrowUpRight size={14} />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
