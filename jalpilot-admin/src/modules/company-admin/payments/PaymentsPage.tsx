import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function PaymentsPage() {
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");

  const { data: payments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => (await apiClient.get("/admin/payments")).data.data as Array<{
      id: string; payment_number: string; customer_name: string; amount: number; payment_method: string; payment_date: string;
    }>,
  });

  const { data: customers } = useQuery({
    queryKey: ["admin-customers-select"],
    queryFn: async () => (await apiClient.get("/admin/customers")).data.data as Array<{ id: string; full_name: string }>,
  });

  const { data: ledger } = useQuery({
    queryKey: ["admin-ledger", customerId],
    enabled: Boolean(customerId),
    queryFn: async () => (await apiClient.get(`/admin/customers/${customerId}/ledger`)).data.data as {
      closing_balance: number;
      entries: Array<{ id: string; entry_type: string; debit_amount: number; credit_amount: number; description: string; transaction_date: string }>;
    },
  });

  const recordPayment = useMutation({
    mutationFn: async () =>
      apiClient.post("/admin/payments", {
        customer_id: customerId,
        amount: Number(amount),
        payment_method: method,
      }),
    onSuccess: () => {
      setAmount("");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-ledger", customerId] });
    },
  });

  return (
    <div>
      <PageHeader title="Payments & Customer Ledger" description="Record cash, UPI, or bank payments and inspect append-only ledgers" />
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-4 items-end">
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Select Customer</option>
          {(customers || []).map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (INR)" className="rounded-lg border px-3 py-2 text-sm" />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="ONLINE">Online</option>
        </select>
        <button onClick={() => recordPayment.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Record Payment
        </button>
      </div>

      {customerId && ledger && (
        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-900">Customer Ledger</h3>
            <span className="font-bold text-sky-700">Closing Balance: ₹{ledger.closing_balance}</span>
          </div>
          <div className="space-y-1 text-xs">
            {(ledger.entries || []).map((e) => (
              <div key={e.id} className="flex justify-between bg-white px-3 py-2 rounded border border-slate-100">
                <span><strong>{e.entry_type}</strong> — {e.description}</span>
                <span>{e.debit_amount > 0 ? `+₹${e.debit_amount} DR` : `-₹${e.credit_amount} CR`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Receipt #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(payments || []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.payment_number}</td>
                <td className="px-4 py-3 font-medium">{p.customer_name}</td>
                <td className="px-4 py-3">{p.payment_method}</td>
                <td className="px-4 py-3 font-semibold text-emerald-700">₹{p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

