import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Droplets, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/themes", label: "Themes" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Top announcement bar */}
      <div className="bg-sky-950 px-4 py-2 text-center text-xs text-sky-200">
        <span className="font-semibold text-white">🚀 JalPilot 2.0 is live!</span> Digitize your water delivery business with smart bottle tracking & customizable themes.{" "}
        <Link to="/register" className="font-bold text-sky-400 underline hover:text-sky-300 ml-1 inline-flex items-center gap-0.5">
          Get Started <ArrowRight className="h-3 w-3 inline" />
        </Link>
      </div>

      {/* Main sticky navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-sky-700 tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-sm shadow-sky-500/20">
              <Droplets className="h-5 w-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-lg font-black text-slate-900">
                Jal<span className="text-sky-600">Pilot</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">Water Cloud SaaS</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 transition"
            >
              Register Free
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-sky-50 text-sky-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-sky-600 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Register Company
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white">
                  <Droplets className="h-4 w-4" />
                </div>
                <span>JalPilot</span>
              </div>
              <p className="text-sm text-slate-400 max-w-md">
                JalPilot is the dedicated multi-tenant cloud platform built for drinking water jar suppliers, reverse-osmosis plants, and bulk delivery fleets. Replace lost paper registers with an automated digital system.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Multi-Tenant Architecture with PostgreSQL Row-Level Security
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/themes" className="hover:text-white transition">Portal Themes</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing Plans</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About JalPilot</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact & Support</Link></li>
              </ul>
            </div>

            {/* Portals & Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Portals & Legal</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition">Login to Portal</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Register Workspace</Link></li>
                <li><Link to="/accept-invitation" className="hover:text-white transition">Activate Customer Account</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <div>© {new Date().getFullYear()} JalPilot Technologies Inc. All rights reserved.</div>
            <div className="mt-2 sm:mt-0 flex gap-4">
              <span>Single Port Architecture (5173)</span>
              <span>•</span>
              <span>Made for Indian Water Suppliers 🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
