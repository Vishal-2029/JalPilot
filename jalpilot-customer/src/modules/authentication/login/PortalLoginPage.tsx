import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { useAuth, PortalUser } from "@/contexts/AuthContext";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
  mode: z.enum(["customer", "staff"]).default("customer"),
});

export function PortalLoginPage() {
  const { companyName } = useTenantTheme();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "customer" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError("");
    try {
      const res = await apiClient.post("/auth/login", { identifier: values.identifier, password: values.password });
      setUser(res.data.data as PortalUser);
      navigate(values.mode === "staff" ? "/staff/deliveries" : "/customer/dashboard");
    } catch {
      setError("Invalid email/phone or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <h1 className="text-2xl font-bold" style={{ color: "var(--jp-primary)" }}>{companyName}</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your Customer or Delivery Staff account</p>
        {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <select {...register("mode")} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="customer">Customer Portal</option>
            <option value="staff">Delivery Staff Portal</option>
          </select>
          <input {...register("identifier")} placeholder="Email or Mobile Number" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="password" {...register("password")} placeholder="Password" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "var(--jp-primary)" }}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

