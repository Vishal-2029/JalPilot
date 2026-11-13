import { Link } from "react-router-dom";
import {
  Droplets,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Truck,
  Receipt,
  Users,
  Sparkles,
  Palette,
  Clock,
  Coins
} from "lucide-react";

export function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-cyan-50/30 to-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100/80 px-4 py-1.5 text-xs font-semibold text-sky-800 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            Next-Gen Water Supply SaaS Platform
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-tight">
            Stop Losing Bottles & Money in <br />
            <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
              Manual Paper Registers
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
            JalPilot is the all-in-one cloud management software for drinking water jar suppliers, RO plants, and delivery fleets. Track daily supplies, empty bottle deposits, staff collections, and launch a branded customer portal.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 transition"
            >
              Start 14-Day Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/themes"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <Palette className="h-4 w-4 text-sky-600" />
              Explore Portal Themes
            </Link>
          </div>

          {/* Quick stats pills */}
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto pt-8 border-t border-slate-200">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Empty Bottle Balance Audit</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-sky-600">5 Themes</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Customer Portal Engine</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">&lt; 30 Sec</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Daily Route Dispatch</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">RLS Secured</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">Multi-Tenant Isolation</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Why Water Suppliers Switch</span>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Paper Registers Bleed 15%–20% of Water Business Revenue
          </h2>
          <p className="mt-3 text-slate-600">
            Lost bottle deposits, missing cash collections, and disputed month-end bills disappear the day you switch to JalPilot.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Paper register flaws */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 uppercase">
              The Old Way: Paper Diaries
            </div>
            <ul className="mt-6 space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs">✕</span>
                <span><strong>Lost Bottle Tracking:</strong> Customers claim they returned 4 jars; your diary says 2. You lose ₹150 per unreturned 20L jar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs">✕</span>
                <span><strong>Billing Disputes at Month-End:</strong> Hours wasted manually calculating who drank how many bottles and cross-checking payments.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold text-xs">✕</span>
                <span><strong>Driver Cash Leakage:</strong> Cash collected on delivery routes has no live timestamp or auditable ledger entry.</span>
              </li>
            </ul>
          </div>

          {/* JalPilot solution */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-8 shadow-xs">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 uppercase">
              The New Way: JalPilot Cloud
            </div>
            <ul className="mt-6 space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                <span><strong>Real-Time Bottle Accounting:</strong> Every delivery logs jars given and empty bottles retrieved. Balances reconcile automatically.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                <span><strong>Instant Digital Invoicing:</strong> Append-only ledgers generate zero-dispute customer invoices with UPI payment links.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                <span><strong>Driver Delivery Portal:</strong> Route staff mark completed deliveries on mobile with live timestamped payment logs.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Complete Platform Suite</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Everything Your Water Business Needs to Scale
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Daily Route Management</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Assign drivers to customer routes, view delivery status in real-time, and handle pause requests when customers go on vacation.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Automated Ledgers & Invoices</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Immutable financial entries for every debit (jar supplied) and credit (payment collected) with month-end PDF statement generation.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Self-Service Customer Portal</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Customers log in to review their daily water intake, empty jars with them, outstanding balances, and submit delivery pause dates.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">5 Customer Portal Themes</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Pick from Aqua Express, Professional, Fresh Aqua, Ocean Premium, or Pure Luxury to style your portal with zero custom coding.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Company Expenses & Profits</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Record vehicle fuel, staff wages, RO membrane replacements, and electricity costs to view true monthly net profit.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7 border border-slate-200 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Bank-Grade Multi-Tenancy</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Built on PostgreSQL Row-Level Security (RLS) guaranteeing that customer records and financial records are strictly isolated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Theme Preview Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-sky-900 via-sky-800 to-cyan-900 p-8 sm:p-12 text-white">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                <Palette className="h-3.5 w-3.5" /> Branded Experience
              </span>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl text-white">
                Give Customers a Modern App With Your Own Brand Look
              </h2>
              <p className="mt-4 text-sky-100 leading-relaxed">
                Your customers don't see a generic tool. With JalPilot's dynamic theme engine, your customer portal reflects your company colours, logos, and identity.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/themes"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-sky-900 hover:bg-sky-50 transition shadow-sm"
                >
                  View All 5 Themes
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-xl border border-sky-400/40 bg-sky-950/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                >
                  See Pricing Plans
                </Link>
              </div>
            </div>

            {/* Visual preview mock */}
            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-cyan-300" />
                  <span className="font-bold text-sm text-white">AquaPure Water Supply</span>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">Active Tenant</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-[11px] text-sky-200">This Month</div>
                  <div className="text-xl font-bold text-white mt-1">28 Jars</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-[11px] text-sky-200">Bottles With You</div>
                  <div className="text-xl font-bold text-white mt-1">2 Cans</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <div className="text-[11px] text-sky-200">Due Balance</div>
                  <div className="text-xl font-bold text-emerald-300 mt-1">₹0.00</div>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/10 p-3 flex items-center justify-between text-xs text-sky-100">
                <span>Next Scheduled Supply</span>
                <span className="font-semibold text-white">Tomorrow, 7:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
          Get Started with JalPilot Today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Join modern drinking water distributors across India. Set up your workspace in under 2 minutes. No credit card required.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-sky-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition"
          >
            Create Your Company Workspace
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Talk to Sales
          </Link>
        </div>
      </section>
    </div>
  );
}
