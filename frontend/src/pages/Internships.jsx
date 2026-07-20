import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Upload, Check } from "lucide-react";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";
import { api, formatApiError, API_BASE } from "../lib/api";

const FAQ = [
  {
    q: "Who can apply for an AINTRIX internship?",
    a: "Students in their pre-final or final year of undergraduate / postgraduate programs across engineering, design, business, and pure sciences. We hire for range as much as we hire for depth.",
  },
  {
    q: "Is the internship paid?",
    a: "Yes. All AINTRIX internships are paid. Compensation depends on program length, seniority, and location.",
  },
  {
    q: "What is the duration?",
    a: "Standard programs are 12 weeks. Selected candidates may extend to 6-month deep-work engagements or full-time offers.",
  },
  {
    q: "Do you offer certificates and recommendation letters?",
    a: "Yes. On successful program completion, interns receive an AINTRIX certificate and personalized recommendation from their mentor.",
  },
  {
    q: "Which divisions accept interns?",
    a: "All eight divisions accept interns, though intake varies by season and current research priorities.",
  },
];

export default function Internships() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [openFaq, setOpenFaq] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [resumeName, setResumeName] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
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
      await api.post("/internships", { ...values, resume_url: resumeUrl });
      setSubmitted(true);
      reset();
      setResumeUrl("");
      setResumeName("");
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-20">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Internships</div>
        <SplitReveal
          as="h1"
          testId="internships-title"
          text="Learn. Build. Innovate."
          className="font-display text-5xl md:text-8xl lg:text-[8vw] tracking-crush leading-[0.94]"
        />
        <p className="max-w-2xl mt-10 text-smoke text-lg leading-relaxed">
          Build your career before graduation. Work on real research and product problems across our eight divisions,
          mentored by senior engineers, designers, and researchers.
        </p>
      </section>

      {/* Why join */}
      <section className="border-t border-graphite py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { t: "Real projects", b: "Ship code, designs, or research that reaches production or public documentation." },
            { t: "Deep mentorship", b: "1:1 pairing with senior team members. Weekly critiques. Written feedback." },
            { t: "Certificates & letters", b: "Every completed program receives an AINTRIX certificate and letter of recommendation." },
          ].map((item, i) => (
            <motion.div
              key={item.t}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="border-t border-graphite pt-8"
            >
              <div className="font-display text-3xl md:text-4xl tracking-tight2">{item.t}</div>
              <div className="mt-4 text-smoke text-[15px] leading-relaxed">{item.b}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-graphite py-24" data-testid="internship-faq">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">FAQ</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95]">Questions we hear.</h2>
          </div>
          <div className="md:col-span-8">
            {FAQ.map((item, i) => (
              <button
                key={item.q}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full text-left border-t border-graphite py-6 group"
                data-testid={`faq-toggle-${i}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl md:text-2xl tracking-tight2 pr-6">{item.q}</div>
                  <div className="text-smoke text-2xl">{openFaq === i ? "−" : "+"}</div>
                </div>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 text-smoke text-[15px] leading-relaxed"
                  >
                    {item.a}
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="border-t border-graphite py-24" id="apply" data-testid="internship-form-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Apply</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95]">
              Tell us about yourself.
            </h2>
            <p className="mt-6 text-smoke text-[15px] leading-relaxed">
              We read every application. Expect a reply within 10 business days.
            </p>
          </div>

          <div className="md:col-span-8">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-graphite p-10 bg-surface"
                data-testid="internship-success"
              >
                <Check className="mb-5" />
                <div className="font-display text-3xl md:text-4xl tracking-tight2 mb-3">Application received.</div>
                <div className="text-smoke">We'll be in touch soon. Meanwhile, explore our research.</div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="internship-form">
                <input {...register("full_name", { required: true })} className="editorial-input" placeholder="Full name" data-testid="input-fullname" />
                <input {...register("email", { required: true })} className="editorial-input" placeholder="Email" type="email" data-testid="input-email" />
                <input {...register("phone")} className="editorial-input" placeholder="Phone" data-testid="input-phone" />
                <input {...register("university", { required: true })} className="editorial-input" placeholder="University" data-testid="input-university" />
                <input {...register("program", { required: true })} className="editorial-input" placeholder="Program / Major" data-testid="input-program" />
                <input {...register("year", { required: true })} className="editorial-input" placeholder="Year of study" data-testid="input-year" />
                <input {...register("interest", { required: true })} className="editorial-input md:col-span-2" placeholder="Division / area of interest" data-testid="input-interest" />
                <input {...register("portfolio")} className="editorial-input md:col-span-2" placeholder="Portfolio / GitHub / LinkedIn (optional)" data-testid="input-portfolio" />
                <textarea {...register("cover", { required: true })} className="editorial-textarea md:col-span-2" placeholder="A short cover note — why AINTRIX, what you want to build" data-testid="input-cover" />

                <div className="md:col-span-2">
                  <label className="flex items-center gap-4 border border-dashed border-graphite p-5 cursor-pointer hover:border-white transition-colors">
                    <Upload size={18} />
                    <div className="flex-1">
                      <div className="text-sm">{resumeName || "Upload resume (PDF, DOC, DOCX)"}</div>
                      <div className="text-xs text-smoke mt-1">Optional but recommended</div>
                    </div>
                    <input type="file" className="hidden" onChange={onFile} accept=".pdf,.doc,.docx" data-testid="input-resume" />
                    {uploading && <span className="text-smoke text-xs">Uploading…</span>}
                    {resumeUrl && <Check size={16} className="text-white" />}
                  </label>
                </div>

                {error && <div className="md:col-span-2 text-red-400 text-sm" data-testid="form-error">{error}</div>}

                <div className="md:col-span-2 flex items-center gap-6 pt-4">
                  <MagneticButton
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="internship-submit"
                    className="bg-white text-black px-8 py-4 rounded-full text-sm font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting…" : "Submit application"}
                  </MagneticButton>
                  <div className="text-xs text-smoke uppercase tracking-[0.25em]">All fields honest.</div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
