import { Link, Outlet } from "react-router-dom";
import { Droplets } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-sky-700 text-xl">
            <Droplets className="h-6 w-6 text-sky-600" />
            <span>JalPilot</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/features" className="hover:text-sky-600">Features</Link>
            <Link to="/pricing" className="hover:text-sky-600">Pricing</Link>
            <Link to="/themes" className="hover:text-sky-600">Themes</Link>
            <Link to="/about" className="hover:text-sky-600">About</Link>
            <Link to="/contact" className="hover:text-sky-600">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-sky-600">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Register Company
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
            <Droplets className="h-4 w-4" /> JalPilot — Smart Water Supply Management Platform
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link to="/terms" className="hover:text-slate-900">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

