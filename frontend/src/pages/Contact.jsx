import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Check, Download, Mail, MapPin, Phone } from "lucide-react";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";
import { api, formatApiError, API_BASE } from "../lib/api";

export default function Contact() {
  const contact = useForm();
  const investor = useForm();
  const [contactDone, setContactDone] = useState(false);
  const [investorDone, setInvestorDone] = useState(false);
  const [contactErr, setContactErr] = useState("");
  const [investorErr, setInvestorErr] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const submitContact = async (v) => {
    setContactErr("");
    try {
      await api.post("/contacts", v);
      setContactDone(true);
      contact.reset();
    } catch (err) {
      setContactErr(formatApiError(err));
    }
  };

  const submitInvestor = async (v) => {
    setInvestorErr("");
    try {
      const { data } = await api.post("/investor-leads", v);
      const url = `${API_BASE}${data.download_url.replace("/api", "")}`;
      setDownloadUrl(url);
      setInvestorDone(true);
      // Auto-trigger download
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "AINTRIX_Investor_Deck.pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setInvestorErr(formatApiError(err));
    }
  };

  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-16">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Contact</div>
        <SplitReveal
          as="h1"
          testId="contact-title"
          text="Let's build the future together."
          className="font-display text-5xl md:text-8xl lg:text-[8vw] tracking-crush leading-[0.94]"
        />
      </section>

      {/* Info + Form */}
      <section className="border-t border-graphite py-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Info */}
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-8">Reach us</div>
            <div className="space-y-8">
              <div className="border-t border-graphite pt-6">
                <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-2 flex items-center gap-2"><Mail size={12}/> Email</div>
                <div className="font-display text-2xl md:text-3xl tracking-tight2">hello@aintrix.com</div>
                <div className="text-smoke text-sm mt-1">invest@aintrix.com · careers@aintrix.com</div>
              </div>
              <div className="border-t border-graphite pt-6">
                <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-2 flex items-center gap-2"><Phone size={12}/> Phone</div>
                <div className="font-display text-2xl md:text-3xl tracking-tight2">+91 · By appointment</div>
              </div>
              <div className="border-t border-graphite pt-6">
                <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-2 flex items-center gap-2"><MapPin size={12}/> Offices</div>
                <div className="font-display text-2xl md:text-3xl tracking-tight2">Bangalore · Mumbai</div>
                <div className="text-smoke text-sm mt-1">India — Global</div>
              </div>
              <div className="border-t border-graphite pt-6 aspect-[4/3] overflow-hidden">
                <iframe
                  title="AINTRIX Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.83!2d77.4661!3d12.9539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2sBangalore!5e0!3m2!1sen!2sin!4v1700000000000"
                  className="w-full h-full grayscale contrast-125 border border-graphite"
                  loading="lazy"
                  data-testid="contact-map"
                />
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-8">Send a message</div>
            {contactDone ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-graphite p-10 bg-surface" data-testid="contact-success">
                <Check className="mb-5" />
                <div className="font-display text-3xl tracking-tight2 mb-2">Message received.</div>
                <div className="text-smoke">We'll be in touch shortly.</div>
              </motion.div>
            ) : (
              <form onSubmit={contact.handleSubmit(submitContact)} className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="contact-form">
                <input {...contact.register("name", { required: true })} className="editorial-input" placeholder="Name" data-testid="contact-name" />
                <input {...contact.register("email", { required: true })} type="email" className="editorial-input" placeholder="Email" data-testid="contact-email" />
                <input {...contact.register("company")} className="editorial-input" placeholder="Company (optional)" data-testid="contact-company" />
                <input {...contact.register("subject")} className="editorial-input" placeholder="Subject" data-testid="contact-subject" />
                <textarea {...contact.register("message", { required: true })} className="editorial-textarea md:col-span-2" placeholder="Your message" data-testid="contact-message" />
                {contactErr && <div className="md:col-span-2 text-red-400 text-sm">{contactErr}</div>}
                <div className="md:col-span-2 flex items-center gap-6 pt-2">
                  <MagneticButton type="submit" disabled={contact.formState.isSubmitting} className="bg-white text-black px-8 py-4 rounded-full text-sm font-medium disabled:opacity-50" data-testid="contact-submit">
                    {contact.formState.isSubmitting ? "Sending…" : "Send message"}
                  </MagneticButton>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Investor deck gate */}
      <section className="border-t border-graphite py-24" data-testid="investor-section">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Investor Overview</div>
            <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95]">
              Request our investor deck.
            </h2>
            <p className="mt-6 text-smoke text-lg leading-relaxed max-w-md">
              Confidential document detailing AINTRIX's vision, ecosystem strategy, and long-horizon roadmap.
              Share your details and we'll deliver the deck to you.
            </p>
          </div>
          <div className="md:col-span-7">
            {investorDone ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-graphite p-10 bg-surface" data-testid="investor-success">
                <Check className="mb-5" />
                <div className="font-display text-3xl tracking-tight2 mb-2">Deck downloading.</div>
                <div className="text-smoke mb-6">If your download didn't start, click below.</div>
                <a href={downloadUrl} download className="inline-flex items-center gap-2 border border-graphite px-6 py-3 rounded-full text-sm hover:bg-white hover:text-black transition-colors duration-500" data-testid="investor-download-again">
                  <Download size={14} /> Download deck
                </a>
              </motion.div>
            ) : (
              <form onSubmit={investor.handleSubmit(submitInvestor)} className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="investor-form">
                <input {...investor.register("name", { required: true })} className="editorial-input" placeholder="Full name" data-testid="investor-name" />
                <input {...investor.register("email", { required: true })} type="email" className="editorial-input" placeholder="Email" data-testid="investor-email" />
                <input {...investor.register("company")} className="editorial-input" placeholder="Fund / Company" data-testid="investor-company" />
                <input {...investor.register("role")} className="editorial-input" placeholder="Role" data-testid="investor-role" />
                {investorErr && <div className="md:col-span-2 text-red-400 text-sm">{investorErr}</div>}
                <div className="md:col-span-2 flex items-center gap-6 pt-2">
                  <MagneticButton type="submit" disabled={investor.formState.isSubmitting} className="bg-white text-black px-8 py-4 rounded-full text-sm font-medium disabled:opacity-50" data-testid="investor-submit">
                    <Download size={14} className="mr-1" />
                    {investor.formState.isSubmitting ? "Preparing…" : "Enter email · Download deck"}
                  </MagneticButton>
                  <div className="text-xs text-smoke uppercase tracking-[0.25em]">Confidential document</div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
