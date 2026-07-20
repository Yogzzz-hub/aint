import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative border-t border-graphite mt-24 md:mt-32" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="font-display text-5xl md:text-7xl tracking-crush leading-[0.9]">
              Engineering
              <br />
              tomorrow.
            </div>
            <p className="mt-8 text-smoke max-w-md text-[15px] leading-relaxed">
              AINTRIX Global Private Limited — building intelligent technologies, creative
              infrastructure, and sustainable businesses across eight industries.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.2em] text-smoke mb-5">Company</div>
            <ul className="space-y-3 text-[14px]">
              <li><Link to="/about" className="text-white hover:text-smoke transition-colors">About</Link></li>
              <li><Link to="/ecosystem" className="text-white hover:text-smoke transition-colors">Ecosystem</Link></li>
              <li><Link to="/research" className="text-white hover:text-smoke transition-colors">Research</Link></li>
              <li><Link to="/news" className="text-white hover:text-smoke transition-colors">News</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.2em] text-smoke mb-5">Careers</div>
            <ul className="space-y-3 text-[14px]">
              <li><Link to="/careers" className="text-white hover:text-smoke transition-colors">Open Roles</Link></li>
              <li><Link to="/internships" className="text-white hover:text-smoke transition-colors">Internships</Link></li>
              <li><Link to="/contact" className="text-white hover:text-smoke transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.2em] text-smoke mb-5">Contact</div>
            <ul className="space-y-3 text-[14px]">
              <li className="text-white">hello@aintrix.com</li>
              <li className="text-white">invest@aintrix.com</li>
              <li className="text-smoke">Bangalore · Mumbai</li>
              <li className="text-smoke">India</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-graphite flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs uppercase tracking-[0.2em] text-smoke">
            © {new Date().getFullYear()} AINTRIX Global Private Limited — All Rights Reserved
          </div>
          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-smoke">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <Link to="/admin/login" data-testid="footer-admin-link" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
