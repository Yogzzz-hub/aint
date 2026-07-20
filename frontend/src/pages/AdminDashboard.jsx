import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../store/authStore";
import { api, formatApiError } from "../lib/api";
import { LogOut, Users, Mail, Briefcase, GraduationCap, TrendingUp, Newspaper, Plus, Trash2 } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "contacts", label: "Contacts" },
  { key: "investors", label: "Investor Leads" },
  { key: "careers", label: "Career Apps" },
  { key: "internships", label: "Internships" },
  { key: "articles", label: "News CMS" },
  { key: "jobs", label: "Jobs" },
];

export default function AdminDashboard() {
  const nav = useNavigate();
  const { token, user, logout, fetchMe } = useAuth();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      nav("/admin/login");
      return;
    }
    fetchMe().then((u) => {
      if (!u) nav("/admin/login");
      setLoading(false);
    });
  }, [token, fetchMe, nav]);

  const doLogout = () => {
    logout();
    nav("/admin/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-smoke">Loading…</div>;

  return (
    <div className="min-h-screen bg-black text-white" data-testid="admin-dashboard">
      {/* Top bar */}
      <header className="border-b border-graphite">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-display text-xl tracking-crush">AINTRIX® Admin</div>
            <div className="hidden md:block text-xs uppercase tracking-[0.25em] text-smoke">Console</div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xs text-smoke hidden md:block">{user?.email}</div>
            <button onClick={doLogout} className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-smoke hover:text-white" data-testid="admin-logout">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-3" data-testid="admin-sidebar">
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                data-testid={`admin-tab-${t.key}`}
                className={`w-full text-left px-4 py-3 text-sm border transition-colors ${
                  tab === t.key
                    ? "bg-white text-black border-white"
                    : "border-graphite text-smoke hover:text-white hover:border-white/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="md:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {tab === "overview" && <Overview />}
              {tab === "contacts" && <Table url="/admin/contacts" title="Contact submissions" fields={["name","email","company","subject","message","created_at"]} testId="table-contacts" />}
              {tab === "investors" && <Table url="/admin/investor-leads" title="Investor leads" fields={["name","email","company","role","created_at"]} testId="table-investors" />}
              {tab === "careers" && <Table url="/admin/career-applications" title="Career applications" fields={["full_name","email","position","location","experience_years","resume_url","created_at"]} testId="table-careers" />}
              {tab === "internships" && <Table url="/admin/internships" title="Internship applications" fields={["full_name","email","university","program","year","interest","resume_url","created_at"]} testId="table-internships" />}
              {tab === "articles" && <ArticlesTab />}
              {tab === "jobs" && <JobsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data));
  }, []);
  const items = [
    { k: "contacts", label: "Contacts", icon: <Mail size={16} /> },
    { k: "investor_leads", label: "Investor Leads", icon: <TrendingUp size={16} /> },
    { k: "career_applications", label: "Career Applications", icon: <Briefcase size={16} /> },
    { k: "internships", label: "Internships", icon: <GraduationCap size={16} /> },
    { k: "articles", label: "Articles", icon: <Newspaper size={16} /> },
    { k: "jobs", label: "Jobs", icon: <Users size={16} /> },
  ];
  return (
    <div data-testid="overview-panel">
      <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Overview</div>
      <h1 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-10">Console.</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.k} className="border border-graphite bg-surface p-6" data-testid={`stat-${it.k}`}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-smoke">{it.icon}{it.label}</div>
            <div className="font-display text-5xl md:text-6xl tracking-crush mt-4">
              {stats ? (stats[it.k] ?? 0) : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Table({ url, title, fields, testId }) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api.get(url).then((r) => setRows(r.data || [])).catch((e) => setErr(formatApiError(e)));
  }, [url]);

  return (
    <div data-testid={testId}>
      <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Data</div>
      <h1 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-8">{title}</h1>
      {err && <div className="text-red-400 text-sm mb-4">{err}</div>}
      <div className="overflow-x-auto border border-graphite">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              {fields.map((f) => (
                <th key={f} className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] text-smoke font-medium border-b border-graphite">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id || i} className="border-b border-graphite hover:bg-surface">
                {fields.map((f) => (
                  <td key={f} className="px-4 py-3 align-top text-white/90 max-w-xs truncate" title={String(row[f] || "")}>
                    {String(row[f] ?? "—").slice(0, 200)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={fields.length} className="px-4 py-8 text-smoke text-center">No data yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArticlesTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", slug: "", category: "Editorial", excerpt: "", body: "", cover_image: "", author: "AINTRIX Editorial", published: true });
  const [msg, setMsg] = useState("");

  const load = () => api.get("/admin/articles").then((r) => setRows(r.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/admin/articles", form);
      setMsg("Published.");
      setForm({ title: "", slug: "", category: "Editorial", excerpt: "", body: "", cover_image: "", author: "AINTRIX Editorial", published: true });
      load();
    } catch (err) {
      setMsg(formatApiError(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    await api.delete(`/admin/articles/${id}`);
    load();
  };

  return (
    <div data-testid="articles-panel">
      <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">CMS</div>
      <h1 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-8">News CMS.</h1>

      <form onSubmit={create} className="border border-graphite p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" data-testid="article-form">
        <input placeholder="Title" className="editorial-input" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
        <input placeholder="Slug (unique)" className="editorial-input" value={form.slug} onChange={(e)=>setForm({...form,slug:e.target.value})} required />
        <input placeholder="Category" className="editorial-input" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
        <input placeholder="Author" className="editorial-input" value={form.author} onChange={(e)=>setForm({...form,author:e.target.value})} />
        <input placeholder="Cover image URL" className="editorial-input md:col-span-2" value={form.cover_image} onChange={(e)=>setForm({...form,cover_image:e.target.value})} />
        <input placeholder="Excerpt" className="editorial-input md:col-span-2" value={form.excerpt} onChange={(e)=>setForm({...form,excerpt:e.target.value})} required />
        <textarea placeholder="Body" className="editorial-textarea md:col-span-2" value={form.body} onChange={(e)=>setForm({...form,body:e.target.value})} required />
        <label className="text-xs text-smoke flex items-center gap-2">
          <input type="checkbox" checked={form.published} onChange={(e)=>setForm({...form,published:e.target.checked})} /> Published
        </label>
        <div className="md:col-span-2 flex items-center gap-4">
          <button type="submit" className="bg-white text-black px-6 py-3 rounded-full text-sm inline-flex items-center gap-2" data-testid="article-submit"><Plus size={14}/>Publish</button>
          {msg && <div className="text-smoke text-sm">{msg}</div>}
        </div>
      </form>

      <div className="border border-graphite" data-testid="articles-table">
        {rows.map((a) => (
          <div key={a.id} className="grid grid-cols-12 items-center gap-4 px-4 py-3 border-b border-graphite">
            <div className="col-span-6 truncate">{a.title}</div>
            <div className="col-span-3 text-xs uppercase tracking-[0.2em] text-smoke">{a.category}</div>
            <div className="col-span-2 text-xs text-smoke">{a.published ? "Published" : "Draft"}</div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => del(a.id)} className="text-smoke hover:text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-smoke text-sm">No articles.</div>}
      </div>
    </div>
  );
}

function JobsTab() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", published: true });
  const [msg, setMsg] = useState("");

  const load = () => api.get("/admin/jobs").then((r) => setRows(r.data || []));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/admin/jobs", { ...form, requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean) });
      setMsg("Created.");
      setForm({ title: "", department: "", location: "", type: "Full-time", description: "", requirements: "", published: true });
      load();
    } catch (err) {
      setMsg(formatApiError(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete job?")) return;
    await api.delete(`/admin/jobs/${id}`);
    load();
  };

  return (
    <div data-testid="jobs-panel">
      <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-4">Careers</div>
      <h1 className="font-display text-4xl md:text-6xl tracking-crush leading-[0.95] mb-8">Job listings.</h1>

      <form onSubmit={create} className="border border-graphite p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input placeholder="Title" className="editorial-input" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
        <input placeholder="Department" className="editorial-input" value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})} required />
        <input placeholder="Location" className="editorial-input" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} required />
        <input placeholder="Type (Full-time / Contract)" className="editorial-input" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} required />
        <textarea placeholder="Description" className="editorial-textarea md:col-span-2" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required />
        <textarea placeholder="Requirements (one per line)" className="editorial-textarea md:col-span-2" value={form.requirements} onChange={(e)=>setForm({...form,requirements:e.target.value})} />
        <div className="md:col-span-2 flex items-center gap-4">
          <button type="submit" className="bg-white text-black px-6 py-3 rounded-full text-sm inline-flex items-center gap-2"><Plus size={14}/>Add job</button>
          {msg && <div className="text-smoke text-sm">{msg}</div>}
        </div>
      </form>

      <div className="border border-graphite">
        {rows.map((j) => (
          <div key={j.id} className="grid grid-cols-12 items-center gap-4 px-4 py-3 border-b border-graphite">
            <div className="col-span-5 truncate">{j.title}</div>
            <div className="col-span-3 text-xs uppercase tracking-[0.2em] text-smoke">{j.department}</div>
            <div className="col-span-3 text-xs text-smoke">{j.location}</div>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => del(j.id)} className="text-smoke hover:text-red-400"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-smoke text-sm">No jobs.</div>}
      </div>
    </div>
  );
}
