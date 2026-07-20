import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero3D from "../components/Hero3D";
import SplitReveal from "../components/SplitReveal";
import ProgressiveText from "../components/ProgressiveText";
import MagneticButton from "../components/MagneticButton";
import { DIVISIONS, TIMELINE, STATS, PHILOSOPHY } from "../lib/content";

gsap.registerPlugin(ScrollTrigger);

function AnimatedNumber({ value, testId }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const numeric = parseInt(String(value).replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(numeric)) return;
    const suffix = String(value).replace(/[\d]/g, "");
    const obj = { n: 0 };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          n: numeric,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.n) + suffix;
          },
        });
      },
    });
    return () => st.kill();
  }, [value]);
  return <span ref={ref} data-testid={testId}>0{String(value).replace(/[\d]/g, "")}</span>;
}

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      {/* ============================================================ HERO */}
      <section
        ref={heroRef}
        className="relative h-[100svh] w-full overflow-hidden vignette"
        data-testid="hero-section"
      >
        <div className="absolute inset-0">
          <Hero3D />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 h-full max-w-[1600px] mx-auto px-6 md:px-10 flex flex-col justify-between pt-28 pb-16"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-smoke">
            <span data-testid="hero-eyebrow">AINTRIX Global · Est. 2025</span>
            <span className="hidden md:inline">India — Global</span>
          </div>

          <div className="max-w-[1200px]">
            <div className="text-[11px] uppercase tracking-[0.3em] text-smoke mb-6">
              A Multi-Sector Innovation Company
            </div>
            <h1
              className="font-display leading-[0.86] tracking-crush text-white"
              style={{ fontSize: "clamp(56px, 9.2vw, 200px)" }}
              data-testid="hero-title"
            >
              <SplitReveal as="span" text="Engineering" className="block" stagger={0.05} />
              <SplitReveal
                as="span"
                text="Tomorrow."
                className="block italic font-light"
                stagger={0.05}
                delay={0.2}
              />
            </h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="max-w-md text-smoke text-[15px] leading-relaxed">
              A future-focused multi-sector enterprise building intelligent technologies,
              creative infrastructure, and sustainable businesses across eight industries.
            </p>
            <div className="flex items-center gap-6">
              <MagneticButton
                as={Link}
                to="/ecosystem"
                data-testid="hero-cta-explore"
                className="bg-white text-black px-7 py-4 rounded-full text-sm font-medium tracking-wide"
              >
                Explore Ecosystem <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton
                as={Link}
                to="/contact"
                data-testid="hero-cta-contact"
                className="border border-graphite px-7 py-4 rounded-full text-sm text-white tracking-wide hover:bg-white hover:text-black transition-colors duration-500"
              >
                Contact <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </div>
        </motion.div>

        {/* corner meta */}
        <div className="absolute bottom-6 right-6 md:right-10 z-10 text-[10px] uppercase tracking-[0.3em] text-smoke">
          <div>Scroll ↓</div>
        </div>
      </section>

      {/* ============================================================ MARQUEE */}
      <section className="border-y border-graphite overflow-hidden py-6" data-testid="marquee-section">
        <div className="marquee-track font-display tracking-crush text-[64px] md:text-[96px] leading-none">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16 pr-16 whitespace-nowrap">
              <span>AI</span><span className="text-smoke">/</span>
              <span>Robotics</span><span className="text-smoke">/</span>
              <span>Semiconductors</span><span className="text-smoke">/</span>
              <span>RYZE</span><span className="text-smoke">/</span>
              <span>Fashion</span><span className="text-smoke">/</span>
              <span>Logistics</span><span className="text-smoke">/</span>
              <span>Food Systems</span><span className="text-smoke">/</span>
              <span>IT</span><span className="text-smoke">/</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ MANIFESTO — progressive bold */}
      <section className="py-32 md:py-48 max-w-[1600px] mx-auto px-6 md:px-10" data-testid="manifesto-section">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke sticky top-32">
              (01) Manifesto
            </div>
          </div>
          <div className="md:col-span-9">
            <ProgressiveText
              as="p"
              testId="manifesto-progressive"
              className="font-display tracking-tight2 leading-[1.08] text-white"
              text="AINTRIX Global was formed from a simple premise. The next century of technology will not belong to specialists. It will belong to organizations that move fluidly between silicon and cinema, between models and matter. We build compound value across disciplines, geographies, and time horizons — with the patience of research and the urgency of craft."
              minWeight={200}
              maxWeight={900}
            />
            <div className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-smoke">
              <span className="w-10 h-px bg-smoke" />
              <span>Read as you scroll</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ ECOSYSTEM PREVIEW */}
      <section className="border-t border-graphite py-24 md:py-32" data-testid="ecosystem-preview">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between mb-16 md:mb-24">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">(02) The Ecosystem</div>
              <SplitReveal
                as="h2"
                testId="ecosystem-preview-title"
                text="Eight industries. One discipline."
                className="font-display text-5xl md:text-7xl tracking-crush leading-[0.95] max-w-4xl"
              />
            </div>
            <Link
              to="/ecosystem"
              className="hidden md:inline-flex items-center gap-2 text-sm text-smoke hover:text-white transition-colors"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {DIVISIONS.map((d, i) => {
              const featured = d.featured;
              const span = featured ? "md:col-span-8" : i % 3 === 0 ? "md:col-span-8" : "md:col-span-4";
              return (
                <motion.div
                  key={d.key}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.8, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative group border border-graphite bg-surface overflow-hidden ${span} ${featured ? "md:col-span-8" : ""}`}
                  data-testid={`ecosystem-card-${d.key}`}
                >
                  <div className={`grid ${featured ? "md:grid-cols-5" : "grid-cols-1"} gap-0`}>
                    <div className={`relative ${featured ? "md:col-span-3 aspect-[4/3]" : "aspect-[4/3]"} overflow-hidden`}>
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-700" />
                      <div className="absolute top-4 left-4 text-[11px] uppercase tracking-[0.25em] text-white/80">
                        {d.n}
                      </div>
                      {featured && (
                        <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] px-2 py-1 border border-white/40 text-white">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className={`${featured ? "md:col-span-2" : ""} p-6 md:p-8 flex flex-col justify-between`}>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.25em] text-smoke mb-3">{d.tag}</div>
                        <h3 className={`font-display tracking-tight2 leading-[1.05] ${featured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
                          {d.name}
                        </h3>
                        <p className="mt-4 text-smoke text-sm leading-relaxed">{d.body}</p>
                      </div>
                      <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white">
                        Learn more <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ STATS */}
      <section className="border-t border-graphite py-24 md:py-32" data-testid="stats-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-16">(03) Research & Innovation</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="border-t border-graphite pt-6"
              >
                <div className="font-display text-6xl md:text-8xl tracking-crush leading-none">
                  <AnimatedNumber value={s.value} testId={`stat-${i}`} />
                </div>
                <div className="mt-4 text-xs uppercase tracking-[0.25em] text-smoke">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ PHILOSOPHY QUOTE */}
      <section className="py-32 md:py-48 border-t border-graphite" data-testid="philosophy-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-10">(04) Philosophy</div>
          <SplitReveal
            as="blockquote"
            testId="philosophy-quote"
            text={`" ${PHILOSOPHY} "`}
            className="font-display text-4xl md:text-7xl lg:text-[9vw] tracking-crush leading-[0.98] text-white max-w-[1500px]"
            stagger={0.045}
          />
          <div className="mt-12 flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-smoke">
            <span className="w-10 h-px bg-smoke" /> AINTRIX Corporate Doctrine
          </div>
        </div>
      </section>

      {/* ============================================================ TIMELINE */}
      <section className="border-t border-graphite py-24 md:py-32" data-testid="timeline-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-14">(05) Journey</div>
          <div className="space-y-6 md:space-y-10">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 border-t border-graphite pt-8 md:pt-10"
              >
                <div className="md:col-span-3 font-display text-5xl md:text-7xl tracking-crush leading-none">
                  {t.year}
                </div>
                <div className="md:col-span-5 font-display text-2xl md:text-4xl tracking-tight2 leading-[1.1]">
                  {t.title}
                </div>
                <div className="md:col-span-4 text-smoke text-[15px] leading-relaxed">
                  {t.body}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ CTA */}
      <section className="border-t border-graphite py-32 md:py-48" data-testid="cta-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-8">(06) Global Vision</div>
          <SplitReveal
            as="h2"
            testId="cta-title"
            text="Let's build the future together."
            className="font-display text-5xl md:text-8xl lg:text-[10vw] tracking-crush leading-[0.94] max-w-[1500px]"
          />
          <div className="mt-14 flex flex-col md:flex-row gap-6">
            <MagneticButton
              as={Link}
              to="/contact"
              data-testid="cta-contact-btn"
              className="bg-white text-black px-8 py-5 rounded-full text-sm font-medium"
            >
              Get in touch <ArrowUpRight size={16} />
            </MagneticButton>
            <MagneticButton
              as={Link}
              to="/careers"
              data-testid="cta-careers-btn"
              className="border border-graphite text-white px-8 py-5 rounded-full text-sm hover:bg-white hover:text-black transition-colors duration-500"
            >
              Join the team <ArrowRight size={16} />
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  );
}
