import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";

export function CustomerDeliveriesPage() {
  const { data } = useQuery({
    queryKey: ["cust-deliveries"],
    queryFn: async () => (await apiClient.get("/customer/deliveries")).data.data as Array<{
      id: string; delivery_date: string; delivery_status: string; quantity_delivered: number; empty_returned: number; total_amount: number;
    }>,
  });
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Water Supply & Delivery History</h1>
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Delivered</th><th className="px-4 py-3">Returned</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y">
            {(data || []).map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3">{d.delivery_date}</td>
                <td className="px-4 py-3">{d.quantity_delivered}</td>
                <td className="px-4 py-3">{d.empty_returned}</td>
                <td className="px-4 py-3 font-semibold">₹{d.total_amount}</td>
                <td className="px-4 py-3">{d.delivery_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CustomerExpensesPage() {
  const { data } = useQuery({
    queryKey: ["cust-expenses"],
    queryFn: async () => (await apiClient.get("/customer/expenses")).data.data as Array<{
      id: string; entry_type: string; debit_amount: number; credit_amount: number; description: string; transaction_date: string;
    }>,
  });
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Expenses & Ledger</h1>
      <div className="space-y-2">
        {(data || []).map((e) => (
          <div key={e.id} className="flex justify-between rounded-xl border bg-white p-4 text-sm">
            <div><div className="font-semibold">{e.entry_type}</div><div className="text-xs text-slate-500">{e.description}</div></div>
            <div className="font-bold">{e.debit_amount > 0 ? `+₹${e.debit_amount}` : `-₹${e.credit_amount}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerPaymentsPage() {
  const { data } = useQuery({
    queryKey: ["cust-payments"],
    queryFn: async () => (await apiClient.get("/customer/payments")).data.data as Array<{
      id: string; payment_number: string; amount: number; payment_method: string; payment_date: string;
    }>,
  });
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Payment History</h1>
      <div className="space-y-2">
        {(data || []).map((p) => (
          <div key={p.id} className="flex justify-between rounded-xl border bg-white p-4 text-sm">
            <div><div className="font-mono text-xs">{p.payment_number}</div><div className="text-xs text-slate-500">{p.payment_method} · {p.payment_date}</div></div>
            <div className="font-bold text-emerald-700">₹{p.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerLeavePage() {
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const { data } = useQuery({
    queryKey: ["cust-leaves"],
    queryFn: async () => (await apiClient.get("/customer/leave-requests")).data.data as Array<{
      id: string; start_date: string; end_date: string; reason: string; request_status: string;
    }>,
  });

  const submit = useMutation({
    mutationFn: async () => apiClient.post("/customer/leave-requests", { start_date: startDate, end_date: endDate, reason }),
    onSuccess: () => { setReason(""); qc.invalidateQueries({ queryKey: ["cust-leaves"] }); },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Leave / Delivery Pause Requests</h1>
      <div className="mb-6 rounded-xl border bg-white p-4 grid gap-3 sm:grid-cols-4 items-end">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g., Travelling)" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={() => submit.mutate()} className="rounded-lg py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--jp-primary)" }}>Request Pause</button>
      </div>
      <div className="space-y-2">
        {(data || []).map((l) => (
          <div key={l.id} className="flex justify-between rounded-xl border bg-white p-4 text-sm">
            <div><div className="font-semibold">{l.start_date} → {l.end_date}</div><div className="text-xs text-slate-500">{l.reason}</div></div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold h-fit">{l.request_status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

