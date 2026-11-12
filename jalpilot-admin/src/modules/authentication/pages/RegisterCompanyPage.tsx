import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { useAuth, AuthUser } from "@/contexts/AuthContext";

const schema = z.object({
  company_name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(8),
  plan_code: z.string().default("starter"),
});

export function RegisterCompanyPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { plan_code: "starter" },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setError("");
    try {
      const res = await apiClient.post("/auth/register", values);
      setUser(res.data.data as AuthUser);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed";
      setError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-12 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <h1 className="text-2xl font-bold">Register Your Water Company</h1>
        <p className="mt-1 text-sm text-slate-500">Creates an isolated workspace with a 14-day free trial.</p>
        {error && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input {...register("company_name")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              {errors.company_name && <p className="text-xs text-rose-600">{errors.company_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Workspace Slug</label>
              <input {...register("slug")} placeholder="pure-aqua" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              {errors.slug && <p className="text-xs text-rose-600">{errors.slug.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Admin Full Name</label>
            <input {...register("full_name")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" {...register("email")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input {...register("phone")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" {...register("password")} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
            {isSubmitting ? "Creating Workspace..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}

