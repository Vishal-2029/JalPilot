import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function StaffPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => (await apiClient.get("/admin/staff")).data.data as Array<{
      id: string; employee_code: string; full_name: string; phone: string; employment_status: string;
    }>,
  });

  const createStaff = useMutation({
    mutationFn: async () => apiClient.post("/admin/staff", { full_name: name, phone, password }),
    onSuccess: () => { setName(""); setPhone(""); setPassword(""); qc.invalidateQueries({ queryKey: ["admin-staff"] }); },
  });

  return (
    <div>
      <PageHeader title="Delivery Staff" description="Manage delivery employees and portal credentials" />
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-4 items-end">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Staff Name" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Initial Password" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={() => createStaff.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Add Staff</button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(data || []).map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-mono text-xs">{s.employee_code}</td>
                <td className="px-4 py-3 font-medium">{s.full_name}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3">{s.employment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

