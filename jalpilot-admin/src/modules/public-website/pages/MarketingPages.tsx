import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import {
  Palette,
  Check,
  Shield,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Building,
  Award,
  CheckCircle2,
  ChevronDown,
  Droplets,
} from "lucide-react";

/* ------------------------------------------------------------------------- */
/* 1. THEMES SHOWCASE PAGE                                                   */
/* ------------------------------------------------------------------------- */
interface ThemePreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  category: string;
  bestFor: string;
}

const BUILTIN_THEMES: ThemePreset[] = [
  {
    id: "theme-aqua-express",
    name: "Aqua Express",
    slug: "aqua-express",
    description: "High-contrast energetic sky blue theme tailored for fast daily route deliveries and mobile screens.",
    primary: "#0284c7",
    secondary: "#e0f2fe",
    accent: "#0ea5e9",
    category: "Fast Logistics",
    bestFor: "High-density residential routes & independent delivery drivers",
  },
  {
    id: "theme-aqua-professional",
    name: "Aqua Professional",
    slug: "aqua-professional",
    description: "Crisp corporate styling with refined typography and balanced navy hues for commercial accounts.",
    primary: "#0369a1",
    secondary: "#f0f9ff",
    accent: "#38bdf8",
    category: "Corporate & B2B",
    bestFor: "Supplying offices, software parks, and corporate cafeterias",
  },
  {
    id: "theme-fresh-aqua",
    name: "Fresh Aqua",
    slug: "fresh-aqua",
    description: "Clean oceanic teal aesthetic emphasizing purity, wellness, and freshness for housing societies.",
    primary: "#0d9488",
    secondary: "#ccfbf1",
    accent: "#14b8a6",
    category: "Modern Residential",
    bestFor: "Gated communities, apartment complexes, and family subscriptions",
  },
  {
    id: "theme-ocean-premium",
    name: "Ocean Premium",
    slug: "ocean-premium",
    description: "Deep sapphire blue styling with royal elegance, crafted for premium mineral water distributors.",
    primary: "#1e3a8a",
    secondary: "#dbeafe",
    accent: "#3b82f6",
    category: "Luxury Mineral Water",
    bestFor: "Packaged mineral water plants and luxury hospitality suppliers",
  },
  {
    id: "theme-pure-luxury",
    name: "Pure Luxury",
    slug: "pure-luxury",
    description: "Prestige dark emerald theme with gold and mint accents designed for alkaline & glass jar water brands.",
    primary: "#064e3b",
    secondary: "#d1fae5",
    accent: "#10b981",
    category: "Artisanal & Alkaline",
    bestFor: "Copper-charged, alkaline, and premium glass bottle distributors",
  },
];

export function ThemesShowcasePage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(BUILTIN_THEMES[0]);

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-semibold text-sky-800">
          <Palette className="h-3.5 w-3.5 text-sky-600" />
          Full UI/UX Theme Engine
        </span>
        <h1 className="mt-4 text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
          More Than Color: Complete UI/UX Transformations
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Every theme completely redesigns the customer portal's layout, navigation bar, card shapes, typography, and button architecture to fit your drinking water brand personality.
        </p>
      </div>

      {/* Interactive Theme Previewer */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Interactive Full UI/UX Morph Preview</h2>
            <p className="text-sm text-slate-500">
              Notice how the navbar style, card radius, fonts, buttons, and layout change dramatically.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/customer/dashboard?theme=${selectedTheme.slug}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Open in Portal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Theme tabs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-8">
          {BUILTIN_THEMES.map((theme) => {
            const isSelected = selectedTheme.slug === theme.slug;
            return (
              <button
                key={theme.slug}
                onClick={() => setSelectedTheme(theme)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? "border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: theme.primary }} />
                  <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: theme.accent }} />
                </div>
                <span className="font-bold text-sm text-slate-900 truncate">{theme.name}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 truncate">{theme.category}</span>
                <span className="text-[10px] text-sky-600 font-semibold mt-1">
                  {theme.slug === "aqua-professional" && "Sidebar Layout"}
                  {theme.slug === "fresh-aqua" && "Floating Pill Nav"}
                  {theme.slug === "aqua-express" && "Tactical Dock"}
                  {theme.slug === "ocean-premium" && "Dark Marine Glass"}
                  {theme.slug === "pure-luxury" && "Editorial Gold"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Morphing Mock UI Container */}
        <div className="rounded-3xl border border-slate-200 p-6 sm:p-10 transition-colors duration-300" style={{
          backgroundColor: selectedTheme.slug === "ocean-premium" ? "#0b1329" : selectedTheme.slug === "pure-luxury" ? "#fbfaf8" : selectedTheme.slug === "fresh-aqua" ? "#f2fbf9" : selectedTheme.slug === "aqua-express" ? "#f1f5f9" : "#f8fafc"
        }}>
          {/* 1. FRESH AQUA MORPH */}
          {selectedTheme.slug === "fresh-aqua" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Floating Island Navbar */}
              <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-teal-200/80 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-teal-950">PureSpring Living</div>
                    <div className="text-[10px] text-teal-600 font-bold">Wellness Residential Portal</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-600 text-white px-3.5 py-1 text-xs font-bold">Home</span>
                  <span className="rounded-full bg-teal-50 text-teal-800 px-3.5 py-1 text-xs font-medium">Deliveries</span>
                </div>
              </div>

              {/* Ultra-rounded organic cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-3xl bg-white/90 border border-teal-100 p-5 shadow-sm text-center">
                  <div className="text-xs font-semibold text-teal-700">Intake This Month</div>
                  <div className="text-3xl font-black text-teal-600 mt-2">28 Jars</div>
                  <div className="text-[10px] text-slate-400 mt-1">20L Clean Spring Cans</div>
                </div>
                <div className="rounded-3xl bg-white/90 border border-teal-100 p-5 shadow-sm text-center">
                  <div className="text-xs font-semibold text-teal-700">Empty Bottles</div>
                  <div className="text-3xl font-black text-slate-800 mt-2">2</div>
                  <div className="text-[10px] text-slate-400 mt-1">Ready for pickup</div>
                </div>
                <div className="rounded-3xl bg-white/90 border border-teal-100 p-5 shadow-sm text-center">
                  <div className="text-xs font-semibold text-teal-700">Due Amount</div>
                  <div className="text-3xl font-black text-emerald-600 mt-2">₹0.00</div>
                  <div className="text-[10px] text-slate-400 mt-1">Auto-credited</div>
                </div>
              </div>

              {/* Pill Button */}
              <button type="button" className="w-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25">
                Schedule Vacation / Pause Supply
              </button>
            </div>
          )}

          {/* 2. AQUA EXPRESS MORPH */}
          {selectedTheme.slug === "aqua-express" && (
            <div className="max-w-2xl mx-auto space-y-4 font-mono">
              {/* Tactical Top Bar */}
              <div className="bg-slate-900 border-b-2 border-blue-500 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  RO-EXPRESS // ROUTE 04
                </div>
                <span className="bg-blue-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs">
                  DISPATCH ACTIVE
                </span>
              </div>

              {/* Sharp square high-density cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border-2 border-slate-300 bg-white p-3.5">
                  <div className="text-[10px] font-bold uppercase text-slate-500">MTH_SUPPLY</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">32 JARS</div>
                </div>
                <div className="rounded-md border-2 border-slate-300 bg-white p-3.5">
                  <div className="text-[10px] font-bold uppercase text-slate-500">CAN_HOLDING</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">04 CANS</div>
                </div>
                <div className="rounded-md border-2 border-slate-300 bg-white p-3.5">
                  <div className="text-[10px] font-bold uppercase text-slate-500">DUE_BALANCE</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">₹120.00</div>
                </div>
              </div>

              {/* Sharp tactical button */}
              <button type="button" className="w-full rounded-md bg-blue-600 py-2.5 text-xs font-mono font-black uppercase tracking-wider text-white hover:bg-blue-700">
                [CLICK TO SUBMIT IMMEDIATE ROUTE PAUSE]
              </button>
            </div>
          )}

          {/* 3. OCEAN PREMIUM MORPH */}
          {selectedTheme.slug === "ocean-premium" && (
            <div className="max-w-2xl mx-auto space-y-6 text-white">
              {/* Deep Oceanic Sapphire Glass Navbar */}
              <div className="rounded-2xl border border-cyan-900/60 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-wide text-white">Glacier Blue Mineral</div>
                    <div className="text-[10px] text-cyan-400 font-semibold">Premium Bottled Reserve</div>
                  </div>
                </div>
                <span className="rounded-full border border-cyan-400/40 bg-cyan-950 px-3 py-0.5 text-xs font-bold text-cyan-300">
                  Priority Client
                </span>
              </div>

              {/* Dark Sapphire Glass Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-center">
                  <div className="text-xs text-slate-400 font-medium">Delivered Supply</div>
                  <div className="text-3xl font-black text-cyan-400 mt-2">40 Cans</div>
                  <div className="text-[10px] text-slate-500 mt-1">Packaged Mineral</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-center">
                  <div className="text-xs text-slate-400 font-medium">Deposit Bottles</div>
                  <div className="text-3xl font-black text-white mt-2">3</div>
                  <div className="text-[10px] text-slate-500 mt-1">Bespoke Cans</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-center">
                  <div className="text-xs text-slate-400 font-medium">Account Status</div>
                  <div className="text-3xl font-black text-emerald-400 mt-2">₹0.00</div>
                  <div className="text-[10px] text-slate-500 mt-1">Auto-Settled</div>
                </div>
              </div>

              {/* Glowing Cyan Gradient Button */}
              <button type="button" className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/20">
                Pause Supply / Adjust Schedule
              </button>
            </div>
          )}

          {/* 4. PURE LUXURY MORPH */}
          {selectedTheme.slug === "pure-luxury" && (
            <div className="max-w-2xl mx-auto space-y-6 font-serif">
              {/* Obsidian Emerald & Gold Header */}
              <div className="rounded-lg border border-amber-500/30 bg-emerald-950 p-4 text-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 border border-amber-400/50 flex items-center justify-center text-amber-300">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-base tracking-widest text-amber-100 uppercase">AURA ALKALINE</div>
                    <div className="text-[9px] uppercase tracking-widest text-amber-300/70 font-sans">Glass Cask Concierge</div>
                  </div>
                </div>
                <span className="border border-amber-500/50 bg-amber-950/40 px-3 py-0.5 text-[10px] font-sans uppercase tracking-widest text-amber-200">
                  Private Member
                </span>
              </div>

              {/* Luxury Gold-Border Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-amber-900/20 bg-white p-5 text-center shadow-xs">
                  <div className="text-xs uppercase font-sans tracking-widest text-slate-400">Monthly Reserve</div>
                  <div className="text-3xl font-serif font-bold text-emerald-950 mt-2">24 Jars</div>
                  <div className="text-[10px] font-sans text-amber-800/80 mt-1">Alkaline 8.5 pH</div>
                </div>
                <div className="rounded-lg border border-amber-900/20 bg-white p-5 text-center shadow-xs">
                  <div className="text-xs uppercase font-sans tracking-widest text-slate-400">Glass Vessels</div>
                  <div className="text-3xl font-serif font-bold text-slate-800 mt-2">2</div>
                  <div className="text-[10px] font-sans text-slate-400 mt-1">Holding Balance</div>
                </div>
                <div className="rounded-lg border border-amber-900/20 bg-white p-5 text-center shadow-xs">
                  <div className="text-xs uppercase font-sans tracking-widest text-slate-400">Ledger Balance</div>
                  <div className="text-3xl font-serif font-bold text-amber-700 mt-2">₹0.00</div>
                  <div className="text-[10px] font-sans text-emerald-700 mt-1">Prestige Tier</div>
                </div>
              </div>

              {/* Bespoke Luxury Button */}
              <button type="button" className="w-full rounded-none border border-amber-600 bg-emerald-950 py-3 text-xs font-serif font-bold uppercase tracking-widest text-amber-200 hover:bg-emerald-900">
                Submit Concierge Supply Pause
              </button>
            </div>
          )}

          {/* 5. AQUA PROFESSIONAL (DEFAULT CORPORATE) */}
          {selectedTheme.slug === "aqua-professional" && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Corporate Header */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Neelkanth Commercial Supply</div>
                    <div className="text-xs text-slate-500">Corporate B2B Account</div>
                  </div>
                </div>
                <span className="rounded-md bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                  Verified Enterprise
                </span>
              </div>

              {/* Clean Structured Data Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Delivered Supply</div>
                  <div className="text-3xl font-bold text-sky-700 mt-2">45 Jars</div>
                  <div className="text-[10px] text-slate-400 mt-1">Office Floor 4</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Empty Bottles</div>
                  <div className="text-3xl font-bold text-slate-800 mt-2">5</div>
                  <div className="text-[10px] text-slate-400 mt-1">Cafeteria Hub</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Current Ledger</div>
                  <div className="text-3xl font-bold text-emerald-600 mt-2">₹0.00</div>
                  <div className="text-[10px] text-slate-400 mt-1">Net 30 Invoicing</div>
                </div>
              </div>

              {/* Corporate Button */}
              <button type="button" className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-sky-700">
                Submit Holiday / Delivery Adjustment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of all themes */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-slate-900">5 Distinct UI/UX Archetypes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Each theme features its own navigation bar type, card curvature, button design, and font hierarchy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BUILTIN_THEMES.map((theme) => (
            <div key={theme.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-24 rounded-xl flex items-center justify-center text-white font-black text-lg mb-4 shadow-inner" style={{ backgroundColor: theme.primary }}>
                  {theme.name}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{theme.name}</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Included Free</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{theme.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Best For:</div>
                  <div className="text-xs font-medium text-slate-700 mt-1">{theme.bestFor}</div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTheme(theme);
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Preview Morph ↑
                </button>
                <Link
                  to={`/customer/dashboard?theme=${theme.slug}`}
                  className="px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold"
                >
                  Live Portal
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 2. PRICING PAGE                                                           */
/* ------------------------------------------------------------------------- */
export function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      id: "starter",
      name: "Starter Plan",
      subtitle: "For independent water delivery operators & single-route suppliers",
      monthlyPrice: 499,
      annualPrice: 399,
      customerLimit: 100,
      staffLimit: 2,
      features: [
        "Up to 100 Active Customers",
        "Up to 2 Route Delivery Drivers",
        "Daily Supply & Empty Bottle Audits",
        "Customer Self-Service Login Link",
        "Immutable Balance Ledgers",
        "Standard Email Support",
      ],
      popular: false,
      cta: "Start 14-Day Free Trial",
    },
    {
      id: "growth",
      name: "Growth Plan",
      subtitle: "For growing water plants, fleet operators & multi-van businesses",
      monthlyPrice: 1299,
      annualPrice: 999,
      customerLimit: 500,
      staffLimit: 10,
      features: [
        "Up to 500 Active Customers",
        "Up to 10 Delivery Route Staff",
        "Full Access to All 5 Portal Themes",
        "Vehicle & Company Expense Ledger",
        "Monthly Profit & Loss Reports",
        "Customer Vacation / Pause Approvals",
        "Priority WhatsApp & Phone Support",
      ],
      popular: true,
      cta: "Get Started Free",
    },
    {
      id: "enterprise",
      name: "Enterprise Fleet",
      subtitle: "For major commercial suppliers, franchise fleets & bulk RO plants",
      monthlyPrice: 2999,
      annualPrice: 2399,
      customerLimit: 2500,
      staffLimit: 50,
      features: [
        "Up to 2,500+ Active Customers",
        "Up to 50 Delivery Staff & Drivers",
        "Custom Domain Support (e.g. portal.yourbrand.com)",
        "Custom Logo & Portal Branding",
        "Automated WhatsApp Bill Reminders",
        "Dedicated Database Snapshot Backups",
        "24/7 Dedicated Account Manager",
      ],
      popular: false,
      cta: "Contact Enterprise Sales",
    },
  ];

  const faqs = [
    {
      q: "Can I try JalPilot before paying?",
      a: "Yes! Every new company workspace comes with a 14-day free trial with full access to all features. No credit card or prepayment required.",
    },
    {
      q: "How does JalPilot track empty water bottle returns?",
      a: "When your delivery driver drops off water bottles, they enter the quantity delivered and the empty bottles retrieved. JalPilot automatically maintains a running balance per customer so zero bottles get lost.",
    },
    {
      q: "Can my delivery staff use it on their mobile phones?",
      a: "Yes! Delivery staff have their own dedicated mobile portal where they see their assigned daily customers, one-click mark deliveries, and log collected cash/UPI payments.",
    },
    {
      q: "How does the Customer Portal work?",
      a: "You can send an automated invitation link to your customers. Customers activate their account with a password and can view their daily delivery calendar, empty jar balances, and submit vacation delivery pauses.",
    },
    {
      q: "What payment methods are supported for billing?",
      a: "We support all major Indian payment methods including UPI (Google Pay, PhonePe, Paytm), Net Banking, RuPay, Visa, and Mastercard.",
    },
  ];

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Transparent Pricing</span>
        <h1 className="mt-3 text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
          Plans Designed for Every Water Business
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Scale from your first 50 customers to thousands across town. Simple, predictable subscriptions with zero hidden fees.
        </p>

        {/* Billing cycle switcher */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-xs font-bold transition ${
              !annual ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition ${
              annual ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual Billing
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold uppercase">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((p) => {
          const price = annual ? p.annualPrice : p.monthlyPrice;
          return (
            <div
              key={p.id}
              className={`relative rounded-3xl border bg-white p-8 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                p.popular ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
                  Most Popular for Fleet Operators
                </div>
              )}

              <div>
                <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">{p.subtitle}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹{price}</span>
                  <span className="text-sm font-medium text-slate-500">/ month</span>
                </div>
                {annual && (
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    Billed annually (₹{price * 12}/year)
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Included Features:</div>
                  <ul className="space-y-2.5 text-sm text-slate-600">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                to="/register"
                className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-bold shadow-xs transition ${
                  p.popular
                    ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/20"
                    : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-20 pt-10 border-t border-slate-200 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-slate-600">Everything you need to know about pricing, plans, and setup.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-600 shrink-0" />
                {faq.q}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 3. ABOUT PAGE                                                             */
/* ------------------------------------------------------------------------- */
export function AboutPage() {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Our Mission</span>
        <h1 className="mt-3 text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
          Empowering India’s Drinking Water Distribution
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed">
          Over 500 million liters of clean drinking water are delivered daily across Indian cities in 20-liter jars and bulk cans. Almost all of it is run on waterlogged paper diaries. JalPilot was created to replace this chaos with modern cloud software.
        </p>
      </div>

      {/* The Story & Why We Built This */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-xs grid gap-8 md:grid-cols-2 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">The Problem We Solved</span>
          <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            Born From Real Water Delivery Routes
          </h2>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Most software in India is built for e-commerce or large warehouses. Nobody was building dedicated tools for the water plant owner who wakes up at 5:00 AM to dispatch three mini-trucks with 600 jars.
          </p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            When a driver returns in the evening, reconciling which customer paid cash, who took 4 jars instead of 2, and who owes 10 empty jars took 2 hours of painful math every single night.
          </p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            JalPilot was designed ground-up for this exact reality. A clean 10-second driver mobile view, automatic customer balance reconciliation, and an auditable ledger that completely eliminates month-end arguments.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-2xl bg-sky-50 p-6 border border-sky-100">
            <div className="text-3xl font-black text-sky-700">50K+</div>
            <div className="text-xs font-medium text-slate-600 mt-1">Water Jars Tracked Daily</div>
          </div>
          <div className="rounded-2xl bg-cyan-50 p-6 border border-cyan-100">
            <div className="text-3xl font-black text-cyan-700">99.98%</div>
            <div className="text-xs font-medium text-slate-600 mt-1">Platform Cloud Uptime</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-6 border border-emerald-100">
            <div className="text-3xl font-black text-emerald-700">₹0</div>
            <div className="text-xs font-medium text-slate-600 mt-1">Lost Bottle Discrepancies</div>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-6 border border-indigo-100">
            <div className="text-3xl font-black text-indigo-700">5 Themes</div>
            <div className="text-xs font-medium text-slate-600 mt-1">Branded Customer Portals</div>
          </div>
        </div>
      </div>

      {/* Core Architectural Guarantees */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-black text-slate-900">Built on Enterprise Foundation</h2>
          <p className="mt-2 text-sm text-slate-600">We take your business records and customer data with serious security standards.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <Shield className="h-8 w-8 text-sky-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900">PostgreSQL Row-Level Security</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every query enforces strict database-level tenancy. Your competitor or another company on JalPilot can never query or inspect your records.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <Award className="h-8 w-8 text-cyan-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900">Double-Entry Ledger Integrity</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              All financial entries and deliveries are immutable. Changes create auditable compensating transactions, maintaining 100% accounting accuracy.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <Building className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900">Made for Indian SME Operators</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Works smoothly on budget Android phones, spotty 4G connections, and supports UPI, cash reconciliation, and vacation delivery holds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 4. CONTACT PAGE                                                           */
/* ------------------------------------------------------------------------- */
export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    fleetSize: "1-3 Vehicles",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Get in Touch</span>
        <h1 className="mt-3 text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
          We’re Here to Help Your Business Grow
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Have questions about onboarding, importing your existing customer list from Excel/paper, or need custom enterprise pricing? Our team is available 6 days a week.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-5">
        {/* Contact info channels */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-lg text-slate-900">Direct Contact Channels</h3>

            <div className="flex items-start gap-3 text-sm">
              <Mail className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Support & Inquiries</div>
                <a href="mailto:support@jalpilot.com" className="text-sky-600 hover:underline">
                  support@jalpilot.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Phone className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Phone & WhatsApp Support</div>
                <div className="text-slate-600">+91 (080) 4567-8900</div>
                <div className="text-xs text-emerald-600 font-semibold mt-0.5">WhatsApp: +91 98765 43210</div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Headquarters</div>
                <div className="text-slate-600">Sector 4, HSR Layout, Bengaluru, Karnataka 560102</div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800">Business Hours</div>
                <div className="text-slate-600">Monday – Saturday: 8:00 AM – 8:00 PM IST</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-tr from-sky-900 to-cyan-900 p-6 text-white">
            <div className="flex items-center gap-2 font-bold text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" /> Free Data Migration Assistance
            </div>
            <p className="mt-2 text-xs text-sky-100 leading-relaxed">
              Already have hundreds of customers written down on notebooks or Excel? Our onboarding team will format and upload your data for free within 2 hours.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <strong>{formData.name}</strong>. Our onboarding team will call or WhatsApp you at <strong>{formData.phone}</strong> within 2 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Send Us a Message</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Your Name *</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Mobile Number *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@aquapure.in"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase">Water Business Name</label>
                    <input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. AquaPure Enterprises"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">Fleet Size / Daily Delivery Volume</label>
                  <select
                    value={formData.fleetSize}
                    onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 bg-white"
                  >
                    <option value="1-3 Vehicles">1 - 3 Delivery Vehicles (50 - 300 jars/day)</option>
                    <option value="4-10 Vehicles">4 - 10 Delivery Vehicles (300 - 1,500 jars/day)</option>
                    <option value="10+ Vehicles">10+ Vehicles / Large RO Bottling Plant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase">How can we assist you?</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your current route delivery setup, problems with paper diaries, or requirements..."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition"
                >
                  <Send className="h-4 w-4" />
                  Submit Request & Talk to Team
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* 5. LEGAL PAGES (TERMS & PRIVACY)                                          */
/* ------------------------------------------------------------------------- */
export function TermsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Terms of Service</h1>
      <p className="text-sm text-slate-500">Last updated: November 2026</p>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-6">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By creating an account, registering a tenant workspace, or using JalPilot’s web portal, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Tenant Workspace & Data Ownership</h2>
          <p>
            Each registered water company operates as an isolated tenant. All customer records, delivery routes, and financial ledger data created within your workspace remain your exclusive property. JalPilot will never sell or share your customer databases.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Subscription & Billing</h2>
          <p>
            JalPilot is billed on a recurring monthly or annual basis according to the selected tier. You may cancel your subscription at any time through your Company Admin dashboard.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Service Availability & SLA</h2>
          <p>
            We strive to maintain 99.9% uptime. System maintenance windows are scheduled during off-peak hours and announced in advance via email.
          </p>
        </section>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: November 2026</p>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-6">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Data Isolation & Security</h2>
          <p>
            JalPilot uses PostgreSQL Row-Level Security (RLS) to enforce strict isolation between tenants. No tenant can view, modify, or access the records of another tenant workspace.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Information We Collect</h2>
          <p>
            We collect account registration data (name, email, phone number, company name), delivery logs, and payment records created by your authorized operators to provide water supply management services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Authentication & Cookies</h2>
          <p>
            We use secure HTTP-only session cookies and CSRF tokens to safeguard authenticated sessions. We do not use third-party tracking cookies for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Inquiries & Data Rights</h2>
          <p>
            For privacy inquiries or to request complete export or deletion of your tenant workspace records, contact our Data Protection Officer at privacy@jalpilot.com.
          </p>
        </section>
      </div>
    </div>
  );
}

export function FeaturesPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900">Platform Features</h1>
        <p className="mt-3 text-slate-600">Explore the comprehensive capabilities of the JalPilot cloud suite.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Daily Water Jar Tracking", desc: "Log every delivered 20L jar, bottle return, and damaged bottle with driver timestamps." },
          { title: "Immutable Customer Ledgers", desc: "Append-only double-entry ledgers prevent balance disputes and lost billing entries." },
          { title: "5 Dynamic Portal Themes", desc: "Brand your customer self-service portal to reflect your water company colors and logo." },
          { title: "Driver Route Portal", desc: "Lightweight mobile portal for route staff to mark deliveries and record cash/UPI collections." },
          { title: "Customer Leave / Vacation Pauses", desc: "Customers request delivery pauses online, automatically updating driver route sheets." },
          { title: "Expense & Net Profit Analytics", desc: "Track diesel, electricity, membrane filters, and staff wages to calculate true monthly profit." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
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
