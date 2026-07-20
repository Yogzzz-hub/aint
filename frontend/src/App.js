import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";

import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Cursor from "./components/Cursor";
import Grain from "./components/Grain";

import Home from "./pages/Home";
import About from "./pages/About";
import Ecosystem from "./pages/Ecosystem";
import Research from "./pages/Research";
import Internships from "./pages/Internships";
import Careers from "./pages/Careers";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function PageWrap({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.main>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Skip Lenis on admin routes for native scroll snappiness
    if (location.pathname.startsWith("/admin")) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });
    lenisRef.current = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [location.pathname]);

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <Cursor />
      <Grain />
      {!isAdmin && <Nav />}
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrap><Home /></PageWrap>} />
          <Route path="/about" element={<PageWrap><About /></PageWrap>} />
          <Route path="/ecosystem" element={<PageWrap><Ecosystem /></PageWrap>} />
          <Route path="/research" element={<PageWrap><Research /></PageWrap>} />
          <Route path="/internships" element={<PageWrap><Internships /></PageWrap>} />
          <Route path="/careers" element={<PageWrap><Careers /></PageWrap>} />
          <Route path="/news" element={<PageWrap><News /></PageWrap>} />
          <Route path="/news/:slug" element={<PageWrap><NewsDetail /></PageWrap>} />
          <Route path="/contact" element={<PageWrap><Contact /></PageWrap>} />
          <Route path="/admin/login" element={<PageWrap><AdminLogin /></PageWrap>} />
          <Route path="/admin" element={<PageWrap><AdminDashboard /></PageWrap>} />
        </Routes>
      </AnimatePresence>
      {!isAdmin && <Footer />}
    </>
  );
}
