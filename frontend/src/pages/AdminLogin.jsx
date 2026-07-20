import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../store/authStore";
import MagneticButton from "../components/MagneticButton";
import { formatApiError } from "../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const login = useAuth((s) => s.login);
  const token = useAuth((s) => s.token);
  const fetchMe = useAuth((s) => s.fetchMe);
  const [email, setEmail] = useState("admin@aintrix.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMe().then((u) => {
        if (u) nav("/admin");
      });
    }
  }, [token, fetchMe, nav]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="admin-login-page">
      <div className="hidden md:flex md:w-1/2 relative border-r border-graphite">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="font-display text-2xl tracking-crush">AINTRIX®</div>
          <div>
            <div className="font-display text-6xl tracking-crush leading-[0.9]">
              Admin<br /><span className="italic font-light">Access.</span>
            </div>
            <div className="mt-6 text-smoke text-sm max-w-sm">
              Manage submissions, publish research, and orchestrate the AINTRIX ecosystem.
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-smoke">© AINTRIX Global · Confidential</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-8"
          data-testid="admin-login-form"
        >
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-smoke mb-3">Sign in</div>
            <h1 className="font-display text-4xl md:text-5xl tracking-crush leading-[0.95]">Admin dashboard.</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-smoke">Email</label>
              <input
                data-testid="admin-email-input"
                className="editorial-input mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-smoke">Password</label>
              <input
                data-testid="admin-password-input"
                className="editorial-input mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm" data-testid="admin-login-error">{error}</div>}

          <MagneticButton type="submit" disabled={busy} className="bg-white text-black w-full py-4 rounded-full text-sm font-medium disabled:opacity-50 justify-center" data-testid="admin-login-submit">
            {busy ? "Signing in…" : "Sign in"}
          </MagneticButton>

          <div className="text-xs text-smoke">Default: admin@aintrix.com · Aintrix@2026</div>
        </motion.form>
      </div>
    </div>
  );
}
