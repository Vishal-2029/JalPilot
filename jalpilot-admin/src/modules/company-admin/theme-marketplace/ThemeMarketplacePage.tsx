import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function ThemeMarketplacePage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-themes"],
    queryFn: async () => (await apiClient.get("/admin/themes")).data.data as Array<{
      id: string; theme_name: string; theme_slug: string; description: string;
      price: number; is_purchased: boolean; is_active: boolean;
    }>,
  });

  const purchase = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/admin/themes/${id}/purchase`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-themes"] }),
  });

  const activate = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/admin/themes/${id}/activate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-themes"] }),
  });

  return (
    <div>
      <PageHeader title="Theme Marketplace" description="Customize your Customer Portal appearance without redeployment" />
      <div className="grid gap-6 md:grid-cols-3">
        {(data || []).map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="h-24 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 mb-3 flex items-center justify-center text-white font-bold">
                {t.theme_name}
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{t.theme_name}</h3>
                <span className="text-sm font-semibold text-sky-700">{t.price === 0 ? "Free" : `₹${t.price}`}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{t.description}</p>
            </div>
            <div className="mt-4">
              {t.is_active ? (
                <span className="block w-full rounded-lg bg-emerald-50 py-2 text-center text-xs font-bold text-emerald-700">Active Theme</span>
              ) : t.is_purchased ? (
                <button onClick={() => activate.mutate(t.id)} className="w-full rounded-lg bg-sky-600 py-2 text-xs font-semibold text-white hover:bg-sky-700">
                  Activate Theme
                </button>
              ) : (
                <button onClick={() => purchase.mutate(t.id)} className="w-full rounded-lg border border-sky-600 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50">
                  Purchase (₹{t.price})
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

