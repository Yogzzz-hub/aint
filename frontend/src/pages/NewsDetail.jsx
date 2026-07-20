import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SplitReveal from "../components/SplitReveal";
import { api } from "../lib/api";

export default function NewsDetail() {
  const { slug } = useParams();
  const [a, setA] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get(`/articles/${slug}`).then((r) => setA(r.data)).catch(() => setErr("Article not found"));
  }, [slug]);

  if (err) return <div className="pt-40 max-w-[900px] mx-auto px-6 text-smoke">{err}</div>;
  if (!a) return <div className="pt-40 max-w-[900px] mx-auto px-6 text-smoke">Loading…</div>;

  return (
    <div className="pt-32">
      <article className="max-w-[900px] mx-auto px-6 md:px-10 pt-16 pb-24">
        <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-6" data-testid="article-category">
          {a.category} · {a.author}
        </div>
        <SplitReveal
          as="h1"
          text={a.title}
          className="font-display text-4xl md:text-7xl tracking-crush leading-[0.98] mb-10"
        />
        {a.cover_image && (
          <img src={a.cover_image} alt={a.title} className="w-full aspect-[16/9] object-cover grayscale contrast-125 border border-graphite mb-12" />
        )}
        <div className="prose prose-invert max-w-none text-smoke text-lg leading-relaxed whitespace-pre-line">
          {a.body}
        </div>
        <div className="mt-16 border-t border-graphite pt-8">
          <Link to="/news" className="text-xs uppercase tracking-[0.25em] text-white hover:text-smoke transition-colors">← Back to Newsroom</Link>
        </div>
      </article>
    </div>
  );
}
