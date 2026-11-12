import { Link } from "react-router-dom";
import { CheckCircle2, Droplets, Shield, Smartphone, TrendingUp } from "lucide-react";

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-50 to-white py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            <Droplets className="h-3.5 w-3.5" /> Multi-Tenant Water Supply SaaS
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Replace Paper Registers with <span className="text-sky-600">JalPilot</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Manage daily water jar deliveries, empty bottle balances, customer ledgers, staff collections,
            and launch a branded Customer Portal in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              to="/themes"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explore Portal Themes
            </Link>
          </div>
        </div>
      </section>

      {/* Why replace paper */}
      <section className="py-16 px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6">
            <TrendingUp className="h-8 w-8 text-sky-600" />
            <h3 className="mt-4 text-lg font-bold">Immutable Customer Ledger</h3>
            <p className="mt-2 text-sm text-slate-600">
              Every delivered jar and cash/UPI payment is recorded as an auditable ledger entry—zero lost bills or disputed balances.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <Smartphone className="h-8 w-8 text-sky-600" />
            <h3 className="mt-4 text-lg font-bold">Branded Customer Portal</h3>
            <p className="mt-2 text-sm text-slate-600">
              Customers log in via secure invitation links to check daily deliveries, bottle balances, invoices, and request leave pauses.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <Shield className="h-8 w-8 text-sky-600" />
            <h3 className="mt-4 text-lg font-bold">Strict Tenant Isolation</h3>
            <p className="mt-2 text-sm text-slate-600">
              Every water company operates in an isolated workspace backed by PostgreSQL Row-Level Security and role-based access.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-sky-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Ready to digitize your water delivery business?</h2>
            <ul className="mt-3 space-y-1 text-sm text-sky-100">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-300" /> Automatic customer account creation & invites</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sky-300" /> 5 switchable customer portal themes</li>
            </ul>
          </div>
          <Link to="/register" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-sky-900 hover:bg-sky-50">
            Register Your Company
          </Link>
        </div>
      </section>
    </div>
  );
}

