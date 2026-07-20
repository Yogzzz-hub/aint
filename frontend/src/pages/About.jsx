import React from "react";
import { motion } from "framer-motion";
import SplitReveal from "../components/SplitReveal";
import ProgressiveText from "../components/ProgressiveText";
import { TIMELINE, PHILOSOPHY } from "../lib/content";

export default function About() {
  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-24">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6" data-testid="about-eyebrow">
          About AINTRIX
        </div>
        <SplitReveal
          as="h1"
          testId="about-hero-title"
          text="A future engineered across disciplines."
          className="font-display text-5xl md:text-8xl lg:text-[9vw] tracking-crush leading-[0.94]"
        />
      </section>

      {/* Manifesto progressive */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-24 border-t border-graphite">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke sticky top-32">Vision</div>
          </div>
          <div className="md:col-span-9">
            <ProgressiveText
              as="p"
              testId="about-vision-text"
              className="font-display tracking-tight2 leading-[1.08] text-white text-3xl md:text-5xl"
              text="To be a globally scalable innovation company. To build the future across industries — with a commitment to sustainability, discipline, and continuous invention."
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-24 border-t border-graphite">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke sticky top-32">Mission</div>
          </div>
          <div className="md:col-span-9">
            <ProgressiveText
              as="p"
              testId="about-mission-text"
              className="font-display tracking-tight2 leading-[1.08] text-white text-3xl md:text-5xl"
              text="Create long-term impact through technology, research, innovation, and responsible business development. Build solutions across multiple industries while maintaining sustainability and continuous innovation."
            />
          </div>
        </div>
      </section>

      {/* Philosophy quote */}
      <section className="py-32 border-t border-graphite">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-8">Philosophy</div>
          <SplitReveal
            as="blockquote"
            text={`" ${PHILOSOPHY} "`}
            className="font-display text-4xl md:text-7xl lg:text-[8vw] tracking-crush leading-[0.98] text-white"
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-24 border-t border-graphite" data-testid="about-timeline">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-14">Timeline</div>
        <div className="space-y-10">
          {TIMELINE.map((t, i) => (
            <motion.div
              key={t.year}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-graphite pt-8"
            >
              <div className="md:col-span-3 font-display text-5xl md:text-7xl tracking-crush">{t.year}</div>
              <div className="md:col-span-5 font-display text-2xl md:text-4xl tracking-tight2">{t.title}</div>
              <div className="md:col-span-4 text-smoke text-[15px] leading-relaxed">{t.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Leadership placeholder */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-24 border-t border-graphite">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Leadership</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95]">
              Founders, engineers, designers, researchers.
            </h2>
          </div>
          <div className="md:col-span-8 text-smoke text-lg leading-relaxed space-y-6">
            <p>
              AINTRIX Global is led by a cross-disciplinary team spanning artificial intelligence,
              semiconductor design, robotics, creative infrastructure and industrial operations.
            </p>
            <p>
              Our organizational model is compound — leaders across divisions share infrastructure,
              research findings, and long-term strategy. What we build in one division informs what
              we ship in another.
            </p>
            <p>
              We hire from first principles: taste, discipline, and range. We prefer generalists with
              deep specialties over specialists with narrow curiosity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
