import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { useAuth, AuthUser } from "@/contexts/AuthContext";

const schema = z.object({
  identifier: z.string().min(3, "Email or phone is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError("");
    try {
      const res = await apiClient.post("/auth/login", values);
      const user = res.data.data as AuthUser;
      setUser(user);
      if (user.platform_role === "SUPER_ADMIN") navigate("/super-admin/dashboard");
      else navigate("/admin/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed";
      setError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to JalPilot</h1>
        <p className="mt-1 text-sm text-slate-500">Super Admin & Company Admin Portal</p>
        {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email or Phone</label>
            <input {...register("identifier")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.identifier && <p className="mt-1 text-xs text-rose-600">{errors.identifier.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" {...register("password")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          New water company? <Link to="/register" className="text-sky-600 font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}

