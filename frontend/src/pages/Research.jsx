import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SplitReveal from "../components/SplitReveal";
import { api } from "../lib/api";

export default function Research() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/research").then((r) => setItems(r.data || [])).catch(() => setItems([]));
  }, []);

  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-20">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Research & Innovation</div>
        <SplitReveal
          as="h1"
          testId="research-title"
          text="Research drives every innovation."
          className="font-display text-5xl md:text-8xl lg:text-[8vw] tracking-crush leading-[0.94]"
        />
        <p className="max-w-2xl mt-10 text-smoke text-lg leading-relaxed">
          A long-horizon research program spanning AI, robotics, semiconductors, creative systems
          and sustainable food systems. We publish sparingly and share when the work is durable.
        </p>
      </section>

      <section className="border-t border-graphite py-16" data-testid="research-list">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {items.map((r, i) => (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="border border-graphite bg-surface overflow-hidden group"
              data-testid={`research-card-${i}`}
            >
              {r.cover_image && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={r.cover_image}
                    alt={r.title}
                    className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1400ms] group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="text-[10px] uppercase tracking-[0.3em] text-smoke mb-3">{r.domain}</div>
                <h3 className="font-display text-2xl md:text-3xl tracking-tight2 leading-[1.1] mb-4">{r.title}</h3>
                <p className="text-smoke text-[15px] leading-relaxed">{r.summary}</p>
              </div>
            </motion.article>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-smoke text-sm">No research posts yet.</div>
          )}
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-graphite py-24 md:py-32 mt-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-10">Roadmap</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { year: "2026", title: "First custom silicon tape-out", body: "Domain-specific accelerator for edge inference." },
              { year: "2027", title: "AI foundation model release", body: "Multi-modal reasoning across product surfaces." },
              { year: "2028", title: "Sustainable food pilot expansion", body: "Vertical cultivation across multiple cities." },
            ].map((r) => (
              <div key={r.year} className="border-t border-graphite pt-6">
                <div className="font-display text-5xl tracking-crush">{r.year}</div>
                <div className="mt-4 font-display text-2xl tracking-tight2">{r.title}</div>
                <div className="mt-3 text-smoke text-sm">{r.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
