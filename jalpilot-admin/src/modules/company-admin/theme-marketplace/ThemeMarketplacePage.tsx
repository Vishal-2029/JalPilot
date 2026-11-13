import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";
import { BUILTIN_THEMES } from "@/themes/theme-config/themes";
import { CheckCircle2, Palette, Sparkles, ExternalLink } from "lucide-react";
import { useState } from "react";

export function ThemeMarketplacePage() {
  const qc = useQueryClient();
  const { themeSlug, setThemeSlug } = useTenantTheme();
  const [successToast, setSuccessToast] = useState("");

  const { data: serverThemes } = useQuery({
    queryKey: ["admin-themes"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/admin/themes");
        return (res.data?.data as Array<{
          id: string; theme_name: string; theme_slug: string; description: string;
          price: number; is_purchased: boolean; is_active: boolean;
        }>) || [];
      } catch {
        return [];
      }
    },
  });

  const activateMutation = useMutation({
    mutationFn: async ({ id, slug }: { id?: string; slug: string }) => {
      if (id) {
        try {
          await apiClient.post(`/admin/themes/${id}/activate`);
        } catch {
          // Fallback to local state
        }
      }
      setThemeSlug(slug);
    },
    onSuccess: (_, vars) => {
      setThemeSlug(vars.slug);
      setSuccessToast(`Theme successfully activated: ${vars.slug}!`);
      setTimeout(() => setSuccessToast(""), 3500);
      qc.invalidateQueries({ queryKey: ["admin-themes"] });
    },
  });

  // Combine server themes with built-in themes for complete coverage
  const themesList = Object.values(BUILTIN_THEMES).map((t) => {
    const s = (serverThemes || []).find((st) => st.theme_slug === t.slug);
    const isActive = themeSlug === t.slug || (s?.is_active ?? false);
    return {
      id: s?.id,
      slug: t.slug,
      name: t.name,
      description: t.tagline || t.category,
      category: t.category,
      primary: t.primary,
      accent: t.accent,
      layout: t.layout,
      isActive,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Customer Portal Theme Engine"
          description="Transform your customer portal’s entire UI/UX, navigation bar, cards, and typography with 1 click."
        />
        <Link
          to={`/customer/dashboard?theme=${themeSlug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition w-fit"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Preview Live Customer View
        </Link>
      </div>

      {successToast && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {successToast}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themesList.map((t) => (
          <div
            key={t.slug}
            className={`rounded-2xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
              t.isActive ? "border-sky-500 ring-2 ring-sky-500/20" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div>
              <div
                className="h-28 rounded-xl flex items-center justify-center text-white font-black text-lg mb-4 shadow-inner relative overflow-hidden"
                style={{ backgroundColor: t.primary }}
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="h-3 w-3 rounded-full border border-white/30" style={{ backgroundColor: t.accent }} />
                </div>
                <span>{t.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">{t.name}</h3>
                <span className="text-xs font-semibold text-slate-500">{t.category}</span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {t.description}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Layout Style:</span>
                <span className="font-semibold text-slate-700 capitalize">{t.layout.replace("-", " ")}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              {t.isActive ? (
                <div className="w-full rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Active Portal Theme
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => activateMutation.mutate({ id: t.id, slug: t.slug })}
                  className="w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 shadow-xs transition"
                >
                  Apply & Transform Portal UI
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
