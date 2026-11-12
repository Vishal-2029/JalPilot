import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function ThemesCataloguePage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0");

  const { data } = useQuery({
    queryKey: ["sa-themes"],
    queryFn: async () => (await apiClient.get("/super-admin/themes")).data.data as Array<{
      id: string; theme_name: string; theme_slug: string; price: number; theme_status: string;
    }>,
  });

  const createTheme = useMutation({
    mutationFn: async () =>
      apiClient.post("/super-admin/themes", {
        theme_name: name,
        theme_slug: slug,
        price: Number(price),
        configuration: { primary: "#0284c7", secondary: "#e0f2fe", surface: "#ffffff", layout: "sidebar" },
      }),
    onSuccess: () => {
      setName("");
      setSlug("");
      qc.invalidateQueries({ queryKey: ["sa-themes"] });
    },
  });

  const publishTheme = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/super-admin/themes/${id}/publish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sa-themes"] }),
  });

  return (
    <div>
      <PageHeader title="Theme Catalogue" description="Create, price, and publish customer portal themes" />
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600">Theme Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-lg border px-3 py-1.5 text-sm" placeholder="Glacier Blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 rounded-lg border px-3 py-1.5 text-sm" placeholder="glacier-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Price (INR)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-28 rounded-lg border px-3 py-1.5 text-sm" />
        </div>
        <button onClick={() => createTheme.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Create Draft
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(data || []).map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{t.theme_name}</h3>
                <p className="text-xs text-slate-500">{t.theme_slug}</p>
              </div>
              <span className="text-xs font-semibold rounded-full bg-slate-100 px-2 py-0.5">{t.theme_status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold text-sky-700">{t.price === 0 ? "Free" : `₹${t.price}`}</span>
              {t.theme_status !== "PUBLISHED" && (
                <button onClick={() => publishTheme.mutate(t.id)} className="text-xs font-semibold text-sky-600 hover:underline">
                  Publish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

