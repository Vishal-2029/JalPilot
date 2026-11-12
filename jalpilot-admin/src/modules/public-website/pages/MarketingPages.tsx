import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { Link } from "react-router-dom";

export function FeaturesPage() {
  const features = [
    "Daily Water Supply & Bottle Return Tracking",
    "Append-Only Customer Ledger & Invoices",
    "Automatic Customer Account Invitations & OTP Linking",
    "Delivery Staff Mobile Portal & Cash/UPI Collection",
    "Customer Leave Requests & Automatic Delivery Pauses",
    "Company Expense Tracking & Financial Reports",
  ];
  return (
    <div className="mx-auto max-w-5xl py-16 px-4">
      <h1 className="text-3xl font-bold">Platform Features</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f} className="rounded-xl border border-slate-200 p-5 font-medium text-slate-800">{f}</div>
        ))}
      </div>
    </div>
  );
}

export function PricingPage() {
  const { data } = useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => (await apiClient.get("/public/plans")).data.data as Array<{
      id: string; plan_name: string; plan_code: string; monthly_price: number; annual_price: number; customer_limit: number; staff_limit: number;
    }>,
  });

  return (
    <div className="mx-auto max-w-6xl py-16 px-4">
      <h1 className="text-3xl font-bold text-center">Simple SaaS Pricing</h1>
      <p className="mt-2 text-center text-slate-600">Start with a 14-day free trial. Upgrade anytime.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(data || []).map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">{p.plan_name}</h3>
              <div className="mt-3 text-3xl font-extrabold text-sky-700">₹{p.monthly_price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                <li>Up to {p.customer_limit} customers</li>
                <li>Up to {p.staff_limit} delivery staff</li>
              </ul>
            </div>
            <Link to="/register" className="mt-6 block rounded-lg bg-sky-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-sky-700">
              Start Free Trial
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ThemesShowcasePage() {
  const { data } = useQuery({
    queryKey: ["public-themes"],
    queryFn: async () => (await apiClient.get("/public/themes")).data.data as Array<{
      id: string; theme_name: string; theme_slug: string; description: string; price: number;
    }>,
  });

  return (
    <div className="mx-auto max-w-6xl py-16 px-4">
      <h1 className="text-3xl font-bold text-center">Customer Portal Themes</h1>
      <p className="mt-2 text-center text-slate-600">Switch your customer portal look anytime without code deployments.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(data || []).map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-28 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 mb-4 flex items-center justify-center text-white font-bold">
              {t.theme_name}
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{t.theme_name}</h3>
              <span className="text-sm font-semibold text-sky-700">{t.price === 0 ? "Free" : `₹${t.price}`}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StaticInfoPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl py-16 px-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  );
}

