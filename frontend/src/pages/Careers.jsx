import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Upload, Check, X, Brain, Users, Target, Sparkles, ArrowRight } from "lucide-react";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";
import CareersPrinciples from "../components/CareersPrinciples";
import { api, formatApiError } from "../lib/api";

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    api.get("/jobs").then((r) => setJobs(r.data || [])).catch(() => setJobs([]));
  }, []);

  const cards = [
    {
      num: "01",
      title: "Think Deeply",
      text: "We take time to understand the problem before building the solution. Curiosity, research, and thoughtful experimentation drive our work."
    },
    {
      num: "02",
      title: "Build Together",
      text: "Great ideas grow through collaboration. We work across disciplines, share knowledge openly, and learn from one another."
    },
    {
      num: "03",
      title: "Own the Outcome",
      text: "We trust people to take responsibility for their work. From the first idea to the final result, ownership matters."
    },
    {
      num: "04",
      title: "Keep Exploring",
      text: "Technology never stands still. We encourage continuous learning, experimentation, and the courage to explore what comes next."
    }
  ];

  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-20">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Careers</div>
        <SplitReveal
          as="h1"
          testId="careers-title"
          text="Life at AINTRIX."
          className="font-display text-5xl md:text-8xl lg:text-[8vw] tracking-crush leading-[0.94]"
        />
        <p className="max-w-2xl mt-10 text-smoke text-lg leading-relaxed">
          Compound organizations require compound people. We hire generalists with deep specialties,
          and we compensate for range as much as for depth.
        </p>
      </section>

      <CareersPrinciples />

      {/* Open Roles */}
      <section className="border-t border-graphite py-24" data-testid="jobs-list">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Open Roles</div>
              <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95]">
                {jobs.length} positions open.
              </h2>
            </div>
          </div>

          <div className="border-t border-graphite">
            {jobs.map((j, i) => (
              <motion.button
                key={j.id}
                onClick={() => setActiveJob(j)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: (i % 5) * 0.05 }}
                className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-4 py-8 border-b border-graphite group hover:bg-surface transition-colors duration-300"
                data-testid={`job-item-${i}`}
              >
                <div className="md:col-span-6 font-display text-2xl md:text-3xl tracking-tight2 leading-tight group-hover:text-white text-white">
                  {j.title}
                </div>
                <div className="md:col-span-3 text-smoke text-sm uppercase tracking-[0.2em] self-center">{j.department}</div>
                <div className="md:col-span-2 text-smoke text-sm self-center">{j.location}</div>
                <div className="md:col-span-1 text-smoke text-sm self-center">{j.type}</div>
              </motion.button>
            ))}
            {jobs.length === 0 && <div className="py-8 text-smoke text-sm">No roles listed yet — check back soon.</div>}
          </div>
        </div>
      </section>

      {/* Work Culture */}
      <section className="border-t border-graphite py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Work Culture</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-6">How we work.</h2>
          <p className="text-smoke text-lg leading-relaxed max-w-3xl mb-16">
            At AINTRIX, we believe great work comes from curious minds, meaningful collaboration, and the freedom to explore. We value people who think deeply, take ownership, and build with purpose.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 [perspective:2000px]">
            {[
              {
                num: "01",
                title: "Think Deeply",
                text: "We take time to understand the problem before building the solution. Curiosity, research, and thoughtful experimentation drive our work.",
                Icon: Brain,
                rotateY: 10
              },
              {
                num: "02",
                title: "Build Together",
                text: "Great ideas grow through collaboration. We work across disciplines, share knowledge openly, and learn from one another.",
                Icon: Users,
                rotateY: 4
              },
              {
                num: "03",
                title: "Own the Outcome",
                text: "We trust people to take responsibility for their work. From the first idea to the final result, ownership matters.",
                Icon: Target,
                rotateY: -4
              },
              {
                num: "04",
                title: "Keep Exploring",
                text: "Technology never stands still. We encourage continuous learning, experimentation, and the courage to explore what comes next.",
                Icon: Sparkles,
                rotateY: -10
              }
            ].map((card, i) => (
              <motion.div
                key={card.num}
                initial={{ opacity: 0, y: 30, rotateY: card.rotateY }}
                whileInView={{ opacity: 1, y: 0, rotateY: card.rotateY }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: (i % 5) * 0.1, ease: "easeOut" }}
                whileHover={{ rotateY: 0, scale: 1.05, y: -10, z: 20 }}
                className="relative flex flex-col min-h-[400px] group"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 1. Layered shapes behind the card (subtle glass depth) */}
                <div className="absolute -inset-4 bg-white/[0.02] blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ transform: "translateZ(-20px)" }} />
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/[0.04] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ transform: "translateZ(-10px)" }} />
                
                {/* 2. Main Glass Surface & Glow */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 ease-out shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:border-white/30 group-hover:bg-white/[0.03] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05),_0_20px_50px_rgba(0,0,0,0.9)]" />
                
                {/* 3. Soft inner highlight along the top/left edges */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_1px_0_1px_rgba(255,255,255,0.1)] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60" />

                {/* 4. Moving light reflection effect */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1.5s] ease-in-out" />
                </div>
                
                {/* Content Container (Elevated via translateZ) */}
                <div className="relative z-10 flex-1 flex flex-col p-8 md:p-10 transition-transform duration-500 group-hover:translate-z-[40px]" style={{ transform: "translateZ(25px)" }}>
                  <div className="flex justify-end items-start mb-10">
                    <span className="text-xl text-white/40 group-hover:text-white/90 font-light tracking-widest transition-colors duration-500">{card.num}</span>
                  </div>
                  
                  <h3 className="text-sm text-white uppercase tracking-[0.2em] mb-5 font-semibold drop-shadow-md">{card.title}</h3>
                  <p className="text-smoke/80 text-[14px] leading-relaxed flex-1 group-hover:text-white transition-colors duration-500">{card.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 md:mt-24 text-center">
            <h3 className="font-display text-3xl md:text-5xl tracking-crush leading-[0.95] mb-4">Different minds. One direction.</h3>
            <p className="text-smoke text-lg leading-relaxed max-w-2xl mx-auto">We bring together engineers, researchers, designers, and creators to build ideas that matter.</p>
          </div>
        </div>
      </section>

      {activeJob && <JobDrawer job={activeJob} onClose={() => setActiveJob(null)} />}
    </div>
  );
}

function JobDrawer({ job, onClose }) {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm({ defaultValues: { position: job.title } });
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/uploads/resume", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setResumeUrl(data.url);
      setResumeName(file.name);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values) => {
    setError("");
    try {
      await api.post("/career-applications", { ...values, position: job.title, resume_url: resumeUrl });
      setSubmitted(true);
      reset();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-y-0 right-0 z-[110] w-full md:w-[720px] bg-black border-l border-graphite overflow-y-auto"
      data-testid="job-drawer"
    >
      <div className="p-8 md:p-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke">{job.department} · {job.location}</div>
          <button onClick={onClose} data-testid="job-drawer-close" className="text-white"><X size={22} /></button>
        </div>

        <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-6">{job.title}</h2>
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="px-3 py-1 border border-graphite text-xs uppercase tracking-[0.2em]">{job.type}</span>
          <span className="px-3 py-1 border border-graphite text-xs uppercase tracking-[0.2em]">{job.location}</span>
        </div>

        <p className="text-smoke text-[15px] leading-relaxed mb-8">{job.description}</p>

        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Requirements</div>
        <ul className="space-y-2 mb-10">
          {(job.requirements || []).map((r, i) => (
            <li key={i} className="text-[15px] flex gap-3">
              <span className="text-smoke">—</span>{r}
            </li>
          ))}
        </ul>

        <div className="h-px bg-graphite my-10" />

        {submitted ? (
          <div className="border border-graphite p-8" data-testid="job-apply-success">
            <Check className="mb-5" />
            <div className="font-display text-3xl tracking-tight2 mb-3">Application submitted.</div>
            <div className="text-smoke">Thanks — our team will review and respond soon.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="job-apply-form">
            <input {...register("full_name", { required: true })} className="editorial-input" placeholder="Full name" data-testid="career-fullname" />
            <input {...register("email", { required: true })} type="email" className="editorial-input" placeholder="Email" data-testid="career-email" />
            <input {...register("phone")} className="editorial-input" placeholder="Phone" data-testid="career-phone" />
            <input {...register("linkedin")} className="editorial-input" placeholder="LinkedIn" data-testid="career-linkedin" />
            <input {...register("experience_years")} className="editorial-input" placeholder="Years of experience" data-testid="career-experience" />
            <input readOnly value={job.title} className="editorial-input" data-testid="career-position" />
            <textarea {...register("cover", { required: true })} className="editorial-textarea md:col-span-2" placeholder="Why this role? What have you built?" data-testid="career-cover" />
            <div className="md:col-span-2">
              <label className="flex items-center gap-4 border border-dashed border-graphite p-5 cursor-pointer hover:border-white transition-colors">
                <Upload size={18} />
                <div className="flex-1">
                  <div className="text-sm">{resumeName || "Upload resume (PDF, DOC, DOCX)"}</div>
                </div>
                <input type="file" className="hidden" onChange={onFile} accept=".pdf,.doc,.docx" data-testid="career-resume" />
                {uploading && <span className="text-smoke text-xs">Uploading…</span>}
                {resumeUrl && <Check size={16} />}
              </label>
            </div>
            {error && <div className="md:col-span-2 text-red-400 text-sm">{error}</div>}
            <div className="md:col-span-2 pt-4">
              <MagneticButton type="submit" disabled={isSubmitting} className="bg-white text-black px-8 py-4 rounded-full text-sm font-medium disabled:opacity-50" data-testid="career-submit">
                {isSubmitting ? "Submitting…" : "Submit application"}
              </MagneticButton>
            </div>
          </form>
        )}
      </div>
    </motion.aside>
  );
}
