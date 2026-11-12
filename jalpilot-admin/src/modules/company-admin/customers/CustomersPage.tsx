import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function CustomersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-customers", q],
    queryFn: async () => (await apiClient.get("/admin/customers", { params: { q } })).data.data as Array<{
      id: string; customer_code: string; full_name: string; phone: string; email?: string;
      status: string; account_activation_status: string;
    }>,
  });

  const createCustomer = useMutation({
    mutationFn: async () =>
      apiClient.post("/admin/customers", {
        full_name: fullName,
        phone,
        email,
        address_line: address,
        send_invite: true,
      }),
    onSuccess: () => {
      setFullName(""); setPhone(""); setEmail(""); setAddress("");
      qc.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });

  const resendInvite = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/admin/customers/${id}/invite`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-customers"] }),
  });

  return (
    <div>
      <PageHeader title="Customers" description="Adding a customer automatically creates their profile and sends an activation invite" />
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-5 items-end">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile Number" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address Line" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={() => createCustomer.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Add & Invite
        </button>
      </div>

      <div className="mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, phone, or code..." className="w-full max-w-sm rounded-lg border bg-white px-3 py-2 text-sm" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Portal Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(data || []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-mono text-xs">{c.customer_code}</td>
                <td className="px-4 py-3 font-medium">{c.full_name}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone} {c.email ? `· ${c.email}` : ""}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">{c.account_activation_status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {c.account_activation_status !== "ACTIVATED" && (
                    <button onClick={() => resendInvite.mutate(c.id)} className="text-xs font-semibold text-sky-600 hover:underline">
                      Resend Invite
                    </button>
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

