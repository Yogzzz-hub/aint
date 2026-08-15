import React from "react";
import { motion } from "framer-motion";
import { Code2, Users, FileCheck2 } from "lucide-react";

const CARDS = [
  {
    key: "projects",
    icon: Code2,
    title: "Real projects",
    description:
      "Ship code, designs, or research that reaches production or public documentation.",
  },
  {
    key: "mentorship",
    icon: Users,
    title: "Deep mentorship",
    description:
      "1:1 pairing with senior team members. Weekly critiques. Written feedback.",
  },
  {
    key: "certificates",
    icon: FileCheck2,
    title: "Certificates & letters",
    description:
      "Every completed program receives an AINTRIX certificate and letter of recommendation.",
  },
];

export default function InternshipBenefits() {
  return (
    <section className="border-t border-graphite py-24" data-testid="internship-benefits">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Why join</div>
          <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] max-w-2xl">
            Build your career before graduation.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="group relative border border-graphite bg-black rounded-2xl p-8 md:p-10 flex flex-col h-full cursor-default"
              data-testid={`benefit-card-${card.key}`}
            >
              <div className="mb-6 text-white transition-all duration-500 group-hover:scale-110 group-hover:text-white">
                <card.icon size={28} strokeWidth={1.5} />
              </div>

              <div className="font-display text-2xl md:text-3xl tracking-tight2 leading-tight mb-4 text-white">
                {card.title}
              </div>

              <div className="text-smoke text-[15px] leading-relaxed flex-1">
                {card.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
