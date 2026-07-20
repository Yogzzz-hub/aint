import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import SplitReveal from "../components/SplitReveal";
import ProgressiveText from "../components/ProgressiveText";
import MagneticButton from "../components/MagneticButton";
import { DIVISIONS, TIMELINE, STATS, PHILOSOPHY } from "../lib/content";
import { useScrollSignal } from "../store/scrollStore";

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------- KinetiveTitle */
/**
 * KineticTitle — letters that stretch / compress with scroll velocity
 * and progressively bold as the user reads.
 */
function KineticTitle({ text, className = "", testId }) {
  const rootRef = useRef(null);
  const chars = String(text).split("");

  useEffect(() => {
    let raf;
    const tick = () => {
      const st = useScrollSignal.getState();
      const vel = st.velocity;
      const el = rootRef.current;
      if (el) {
        // scaleY based on velocity — quick scroll stretches the type vertically
        const sy = 1 + Math.min(Math.abs(vel) / 260, 0.14) * Math.sign(vel || 1);
        const sx = 1 - Math.min(Math.abs(vel) / 500, 0.06);
        el.style.transform = `scale(${sx}, ${sy})`;
        el.style.letterSpacing = `${-0.055 + Math.min(Math.abs(vel) / 4000, 0.006)}em`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span ref={rootRef} className={`inline-block will-change-transform origin-center ${className}`} data-testid={testId} style={{ transformOrigin: "50% 50%" }}>
      {chars.map((c, i) =>
        c === " " ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.1, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
          >
            {c}
          </motion.span>
        )
      )}
    </span>
  );
}

/* -------------------------------------------------- AnimatedNumber */
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
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => { el.textContent = Math.round(obj.n) + suffix; },
        });
      },
    });
    return () => st.kill();
  }, [value]);
  return <span ref={ref} data-testid={testId}>0{String(value).replace(/[\d]/g, "")}</span>;
}

/* -------------------------------------------------- ProgressRail */
function ProgressRail() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const unsub = useScrollSignal.subscribe((s) => setP(s.progress));
    return () => unsub();
  }, []);
  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-6 z-30 pointer-events-none hidden md:flex flex-col items-end gap-3 text-[10px] uppercase tracking-[0.3em] text-smoke" data-testid="scroll-rail">
      <div className="h-40 w-px bg-graphite relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 bg-white" style={{ height: `${p * 100}%`, transition: "height 200ms linear" }} />
      </div>
      <div className="rotate-90 origin-right translate-y-6">{Math.round(p * 100).toString().padStart(2, "0")} / 100</div>
    </div>
  );
}

/* -------------------------------------------------- Home */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTitleY = useTransform(heroProgress, [0, 1], [0, -160]);
  const heroSubY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(heroProgress, [0, 0.85], [1, 0]);
  const heroBlur = useTransform(heroProgress, [0, 1], ["blur(0px)", "blur(6px)"]);

  return (
    <>
      <ProgressRail />

      {/* ============================================================ HERO
          overlays PersistentScene — no local canvas here */}
      <section
        ref={heroRef}
        className="relative h-[110svh] w-full overflow-hidden morph-section"
        data-testid="hero-section"
        data-cursor="scene"
        data-cursor-label="Move · Rotate"
      >
        <motion.div
          style={{ opacity: heroOpacity, filter: heroBlur }}
          className="relative z-10 h-[100svh] max-w-[1600px] mx-auto px-6 md:px-10 flex flex-col justify-between pt-28 pb-16"
        >
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-smoke">
            <span data-testid="hero-eyebrow">AINTRIX Global · Est. 2025</span>
            <span className="hidden md:inline">India — Global</span>
          </div>

          <motion.div style={{ y: heroTitleY }} className="max-w-[1400px]">
            <div className="text-[11px] uppercase tracking-[0.35em] text-smoke mb-6">
              A Multi-Sector Innovation Company
            </div>
            <h1
              className="font-display leading-[0.86] tracking-crush text-white select-none"
              style={{ fontSize: "clamp(56px, 10vw, 220px)" }}
              data-testid="hero-title"
            >
              <div className="overflow-hidden pb-2">
                <KineticTitle text="Engineering" testId="hero-title-word-1" />
              </div>
              <div className="overflow-hidden italic font-light">
                <KineticTitle text="Tomorrow." testId="hero-title-word-2" />
              </div>
            </h1>
          </motion.div>

          <motion.div style={{ y: heroSubY }} className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="max-w-md text-smoke text-[15px] leading-relaxed">
              A future-focused multi-sector enterprise building intelligent technologies,
              creative infrastructure, and sustainable businesses across eight industries.
            </p>
            <div className="flex items-center gap-6">
              <MagneticButton
                as={Link}
                to="/ecosystem"
                data-testid="hero-cta-explore"
                data-cursor="button"
                data-cursor-label="Enter ecosystem"
                className="bg-white text-black px-7 py-4 rounded-full text-sm font-medium"
              >
                Explore Ecosystem <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton
                as={Link}
                to="/contact"
                data-testid="hero-cta-contact"
                data-cursor="button"
                data-cursor-label="Get in touch"
                className="border border-graphite px-7 py-4 rounded-full text-sm text-white tracking-wide hover:bg-white hover:text-black transition-colors duration-500"
              >
                Contact <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          className="absolute bottom-6 right-6 md:right-10 z-10 text-[10px] uppercase tracking-[0.3em] text-smoke flex items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <span>Scroll to travel</span>
          <span className="w-6 h-px bg-smoke" />
        </motion.div>
      </section>

      {/* ============================================================ MARQUEE — dissolves into next scene */}
      <section className="relative overflow-hidden py-4 morph-section" data-testid="marquee-section">
        <div className="marquee-track font-display tracking-crush text-[64px] md:text-[104px] leading-none mix-blend-difference text-white">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16 pr-16 whitespace-nowrap">
              <span>Intelligence</span><span className="text-smoke">·</span>
              <span>Robotics</span><span className="text-smoke">·</span>
              <span>Silicon</span><span className="text-smoke">·</span>
              <span className="italic font-light">RYZE</span><span className="text-smoke">·</span>
              <span>Fashion</span><span className="text-smoke">·</span>
              <span>Logistics</span><span className="text-smoke">·</span>
              <span>Food Systems</span><span className="text-smoke">·</span>
              <span>IT</span><span className="text-smoke">·</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ MANIFESTO */}
      <section className="py-40 md:py-56 max-w-[1600px] mx-auto px-6 md:px-10 relative morph-section" data-testid="manifesto-section">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.35em] text-smoke sticky top-32 flex items-center gap-3">
              <span className="w-5 h-px bg-smoke" /> (01) Manifesto
            </div>
          </div>
          <div className="md:col-span-9">
            <ProgressiveText
              as="p"
              testId="manifesto-progressive"
              className="font-display tracking-tight2 leading-[1.08] text-white text-3xl md:text-5xl lg:text-6xl"
              text="AINTRIX Global was formed from a simple premise. The next century of technology will not belong to specialists. It will belong to organizations that move fluidly between silicon and cinema, between models and matter. We build compound value across disciplines, geographies, and time horizons — with the patience of research and the urgency of craft."
              minWeight={200}
              maxWeight={900}
            />
          </div>
        </div>
      </section>

      {/* ============================================================ STATS EMERGE */}
      <section className="py-32 md:py-40 relative morph-section" data-testid="stats-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-[10px] uppercase tracking-[0.35em] text-smoke mb-16 flex items-center gap-3">
            <span className="w-5 h-px bg-smoke" /> (02) Research & Innovation
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 60, filter: "blur(20px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-graphite pt-6"
              >
                <div className="font-display text-6xl md:text-8xl tracking-crush leading-none">
                  <AnimatedNumber value={s.value} testId={`stat-${i}`} />
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.35em] text-smoke">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ PHILOSOPHY QUOTE (glass phase) */}
      <section className="py-40 md:py-56 relative morph-section" data-testid="philosophy-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-[10px] uppercase tracking-[0.35em] text-smoke mb-10 flex items-center gap-3">
            <span className="w-5 h-px bg-smoke" /> (03) Philosophy
          </div>
          <SplitReveal
            as="blockquote"
            testId="philosophy-quote"
            text={`" ${PHILOSOPHY} "`}
            className="font-display text-4xl md:text-7xl lg:text-[9vw] tracking-crush leading-[0.98] text-white max-w-[1500px] mix-blend-difference"
            stagger={0.045}
          />
          <div className="mt-12 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-smoke">
            <span className="w-10 h-px bg-smoke" /> AINTRIX Corporate Doctrine
          </div>
        </div>
      </section>

      {/* ============================================================ ECOSYSTEM CARDS FLOAT */}
      <section className="py-32 md:py-40 relative morph-section" data-testid="ecosystem-preview">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between mb-16 md:mb-24">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-smoke mb-4 flex items-center gap-3">
                <span className="w-5 h-px bg-smoke" /> (04) The Ecosystem
              </div>
              <SplitReveal
                as="h2"
                testId="ecosystem-preview-title"
                text="Eight industries. One discipline."
                className="font-display text-5xl md:text-7xl tracking-crush leading-[0.95] max-w-4xl"
              />
            </div>
            <Link
              to="/ecosystem"
              data-cursor="button"
              data-cursor-label="View all"
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
                  initial={{ opacity: 0, y: 80, filter: "blur(14px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 1.1, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative group border border-graphite bg-black/60 backdrop-blur-md overflow-hidden ${span}`}
                  data-testid={`ecosystem-card-${d.key}`}
                  data-cursor="image"
                  data-cursor-label={d.name}
                >
                  <div className={`grid ${featured ? "md:grid-cols-5" : "grid-cols-1"} gap-0`}>
                    <div className={`relative ${featured ? "md:col-span-3 aspect-[4/3]" : "aspect-[4/3]"} overflow-hidden`}>
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-1000" />
                      <div className="absolute top-4 left-4 text-[11px] uppercase tracking-[0.3em] text-white/80">{d.n}</div>
                      {featured && (
                        <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.3em] px-2 py-1 border border-white/40 text-white">Featured</div>
                      )}
                    </div>
                    <div className={`${featured ? "md:col-span-2" : ""} p-6 md:p-8 flex flex-col justify-between`}>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-smoke mb-3">{d.tag}</div>
                        <h3 className={`font-display tracking-tight2 leading-[1.05] ${featured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>{d.name}</h3>
                        <p className="mt-4 text-smoke text-sm leading-relaxed">{d.body}</p>
                      </div>
                      <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white">
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

      {/* ============================================================ TIMELINE — evolves */}
      <section className="py-32 md:py-40 relative morph-section" data-testid="timeline-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-[10px] uppercase tracking-[0.35em] text-smoke mb-14 flex items-center gap-3">
            <span className="w-5 h-px bg-smoke" /> (05) Journey
          </div>
          <div className="space-y-6 md:space-y-10">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ============================================================ CTA — final chapter */}
      <section className="py-40 md:py-56 relative morph-section" data-testid="cta-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-[10px] uppercase tracking-[0.35em] text-smoke mb-8 flex items-center gap-3">
            <span className="w-5 h-px bg-smoke" /> (06) Global Vision
          </div>
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
              data-cursor="button"
              data-cursor-label="Send message"
              className="bg-white text-black px-8 py-5 rounded-full text-sm font-medium"
            >
              Get in touch <ArrowUpRight size={16} />
            </MagneticButton>
            <MagneticButton
              as={Link}
              to="/careers"
              data-testid="cta-careers-btn"
              data-cursor="button"
              data-cursor-label="See roles"
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
