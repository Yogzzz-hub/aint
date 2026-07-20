import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/ecosystem", label: "Ecosystem" },
  { to: "/research", label: "Research" },
  { to: "/internships", label: "Internships" },
  { to: "/careers", label: "Careers" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        data-testid="site-nav"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? "backdrop-blur-md bg-black/60 border-b border-graphite" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
          <Link to="/" data-testid="brand-logo" className="font-display text-xl md:text-2xl tracking-crush">
            AINTRIX<span className="text-smoke">®</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {LINKS.slice(1).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-[13px] tracking-wide uppercase font-medium transition-colors duration-300 ${
                    isActive ? "text-white" : "text-smoke hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              data-testid="nav-cta"
              className="hidden md:inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] font-medium border border-graphite px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors duration-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Get in touch
            </Link>
            <button
              data-testid="nav-menu-toggle"
              className="lg:hidden text-white"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="mobile-menu"
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[99] bg-black flex flex-col justify-center px-8"
          >
            <nav className="flex flex-col gap-6">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `font-display text-4xl md:text-6xl tracking-crush ${isActive ? "text-white" : "text-smoke"}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
