import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function CompaniesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["sa-tenants"],
    queryFn: async () => (await apiClient.get("/super-admin/tenants")).data.data as Array<{
      id: string; company_name: string; slug: string; email: string; phone: string; city: string; status: string;
    }>,
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "suspend" | "activate" }) =>
      apiClient.post(`/super-admin/tenants/${id}/${action}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sa-tenants"] }),
  });

  return (
    <div>
      <PageHeader title="Water Supply Companies" description="Manage registered tenants and workspace access" />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(data || []).map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium">{t.company_name}</td>
                <td className="px-4 py-3 text-slate-500">{t.slug}</td>
                <td className="px-4 py-3 text-slate-600">{t.email} · {t.phone}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{t.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {t.status === "SUSPENDED" ? (
                    <button onClick={() => toggleStatus.mutate({ id: t.id, action: "activate" })} className="text-xs font-semibold text-emerald-600 hover:underline">Activate</button>
                  ) : (
                    <button onClick={() => toggleStatus.mutate({ id: t.id, action: "suspend" })} className="text-xs font-semibold text-rose-600 hover:underline">Suspend</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

