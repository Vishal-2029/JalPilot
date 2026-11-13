import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Shield, Building2, User, Truck } from "lucide-react";
import { apiClient } from "@/services/api-client";
import { useAuth, AuthUser } from "@/contexts/AuthContext";

const schema = z.object({
  identifier: z.string().min(3, "Email or phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  portal: z.enum(["admin", "customer", "staff"]).default("admin"),
});

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { portal: "admin" },
  });

  const selectedPortal = watch("portal");

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError("");
    try {
      const res = await apiClient.post("/auth/login", {
        identifier: values.identifier,
        password: values.password,
      });
      const user = res.data.data as AuthUser;
      setUser(user);

      if (user.platform_role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard");
      } else if (values.portal === "customer") {
        navigate("/customer/dashboard");
      } else if (values.portal === "staff") {
        navigate("/staff/deliveries");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid credentials. Please verify your login details.";
      setError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-md py-14 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to JalPilot</h1>
          <p className="mt-1 text-sm text-slate-500">Access all platforms from a single unified portal</p>
        </div>

        {/* Portal selector tabs */}
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setValue("portal", "admin")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
              selectedPortal === "admin" ? "bg-white font-semibold text-sky-700 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setValue("portal", "customer")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
              selectedPortal === "customer" ? "bg-white font-semibold text-sky-700 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setValue("portal", "staff")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
              selectedPortal === "staff" ? "bg-white font-semibold text-sky-700 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            Staff
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input type="hidden" {...register("portal")} />

          <div>
            <label className="block text-sm font-medium text-slate-700">Email or Mobile Number</label>
            <input
              {...register("identifier")}
              placeholder={selectedPortal === "customer" ? "e.g. 9876543210 or email" : "e.g. admin@jalpilot.com"}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
            {errors.identifier && <p className="mt-1 text-xs text-rose-600">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60 transition"
          >
            {isSubmitting ? "Signing in..." : `Sign In to ${selectedPortal === "customer" ? "Customer Portal" : selectedPortal === "staff" ? "Staff Portal" : "Admin Dashboard"}`}
          </button>
        </form>

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          <div>
            New water delivery company?{" "}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
              Register workspace
            </Link>
          </div>
          <div>
            Have an invitation token?{" "}
            <Link to="/accept-invitation" className="font-semibold text-sky-600 hover:text-sky-700">
              Activate customer account
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-2">
            <Shield className="h-3 w-3 text-emerald-500" />
            Protected by PostgreSQL Row-Level Security & Encrypted Sessions
          </div>
        </div>
      </div>
    </div>
  );
}
