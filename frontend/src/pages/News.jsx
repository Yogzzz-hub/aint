import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SplitReveal from "../components/SplitReveal";
import { api } from "../lib/api";

const CATEGORIES = ["All", "Editorial", "Announcements", "Research", "Product"];

export default function News() {
  const [articles, setArticles] = useState([]);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    api.get("/articles", { params: cat !== "All" ? { category: cat } : {} })
      .then((r) => setArticles(r.data || []))
      .catch(() => setArticles([]));
  }, [cat]);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="pt-32">
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 pb-16">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6">Newsroom</div>
        <SplitReveal
          as="h1"
          testId="news-title"
          text="Announcements, essays, research."
          className="font-display text-5xl md:text-8xl lg:text-[8vw] tracking-crush leading-[0.94]"
        />
      </section>

      {/* Category filters */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 border-t border-graphite py-6">
        <div className="flex flex-wrap items-center gap-3" data-testid="news-filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              data-testid={`filter-${c.toLowerCase()}`}
              className={`px-4 py-2 rounded-full border text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                cat === c ? "bg-white text-black border-white" : "border-graphite text-smoke hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="border-t border-graphite">
          <Link to={`/news/${featured.slug}`} className="block group" data-testid="news-featured">
            <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-7 relative aspect-[16/10] overflow-hidden border border-graphite">
                {featured.cover_image && (
                  <img
                    src={featured.cover_image}
                    alt={featured.title}
                    className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1600ms] group-hover:scale-105"
                  />
                )}
              </div>
              <div className="md:col-span-5 flex flex-col justify-end">
                <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">{featured.category} · Featured</div>
                <h2 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-6">{featured.title}</h2>
                <p className="text-smoke text-lg leading-relaxed max-w-lg">{featured.excerpt}</p>
                <div className="mt-8 text-xs uppercase tracking-[0.25em] text-white">Read essay →</div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Grid */}
      <section className="max-w-[1600px] mx-auto px-6 md:px-10 py-12 border-t border-graphite">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {rest.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.05 }}
            >
              <Link to={`/news/${a.slug}`} className="block group" data-testid={`news-card-${i}`}>
                {a.cover_image && (
                  <div className="aspect-[4/3] overflow-hidden border border-graphite mb-5">
                    <img
                      src={a.cover_image}
                      alt={a.title}
                      className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-[1400ms] group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-3">{a.category}</div>
                <h3 className="font-display text-2xl tracking-tight2 leading-[1.1] group-hover:text-white transition-colors">
                  {a.title}
                </h3>
                <p className="mt-3 text-smoke text-sm leading-relaxed">{a.excerpt}</p>
              </Link>
            </motion.div>
          ))}
          {articles.length === 0 && <div className="text-smoke text-sm">No articles yet.</div>}
        </div>
      </section>
    </div>
  );
}
