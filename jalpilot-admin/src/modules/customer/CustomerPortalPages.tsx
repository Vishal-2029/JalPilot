import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { useTenantTheme } from "@/themes/theme-provider/TenantThemeProvider";
import { CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

export function CustomerDeliveriesPage() {
  const { tokens } = useTenantTheme();
  const { data } = useQuery({
    queryKey: ["cust-deliveries"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/customer/deliveries");
        return res.data.data as Array<{
          id: string;
          delivery_date: string;
          delivery_status: string;
          quantity_delivered: number;
          empty_returned: number;
          total_amount: number;
        }>;
      } catch {
        return [
          { id: "1", delivery_date: "2026-11-13", delivery_status: "DELIVERED", quantity_delivered: 2, empty_returned: 2, total_amount: 100 },
          { id: "2", delivery_date: "2026-11-12", delivery_status: "DELIVERED", quantity_delivered: 2, empty_returned: 1, total_amount: 100 },
          { id: "3", delivery_date: "2026-11-10", delivery_status: "DELIVERED", quantity_delivered: 4, empty_returned: 3, total_amount: 200 },
        ];
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className={tokens.badgeClass}>Delivery Audit</span>
          <h1 className={`mt-1 text-2xl ${tokens.fontHeading}`}>Water Supply & Bottle History</h1>
        </div>
      </div>

      <div className={tokens.cardClass}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/60 text-xs uppercase text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Jars Delivered</th>
                <th className="px-4 py-3">Empty Returned</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data || []).map((d) => (
                <tr key={d.id} className="hover:bg-black/5 transition">
                  <td className="px-4 py-3.5 font-medium">{d.delivery_date}</td>
                  <td className="px-4 py-3.5 font-bold">{d.quantity_delivered} Cans</td>
                  <td className="px-4 py-3.5 font-bold text-slate-600">{d.empty_returned} Empty</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">₹{d.total_amount}</td>
                  <td className="px-4 py-3.5">
                    <span className={tokens.badgeClass}>
                      {d.delivery_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CustomerExpensesPage() {
  const { tokens } = useTenantTheme();
  const { data } = useQuery({
    queryKey: ["cust-expenses"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/customer/expenses");
        return res.data.data as Array<{
          id: string;
          entry_type: string;
          debit_amount: number;
          credit_amount: number;
          description: string;
          transaction_date: string;
        }>;
      } catch {
        return [
          { id: "1", entry_type: "WATER_DELIVERY", debit_amount: 100, credit_amount: 0, description: "2x 20L Water Jars Delivered", transaction_date: "2026-11-13" },
          { id: "2", entry_type: "PAYMENT_UPI", debit_amount: 0, credit_amount: 500, description: "UPI Advance Top-up Received", transaction_date: "2026-11-01" },
        ];
      }
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className={tokens.badgeClass}>Immutable Accounting</span>
        <h1 className={`mt-1 text-2xl ${tokens.fontHeading}`}>My Account Ledger</h1>
      </div>

      <div className="space-y-3">
        {(data || []).map((e) => (
          <div key={e.id} className={`${tokens.cardClass} flex items-center justify-between`}>
            <div>
              <div className="font-bold text-sm">{e.description}</div>
              <div className="text-xs text-slate-400 mt-0.5">{e.transaction_date} · {e.entry_type}</div>
            </div>
            <div className="text-right">
              <div className={`text-base font-black ${e.debit_amount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {e.debit_amount > 0 ? `+₹${e.debit_amount}` : `-₹${e.credit_amount}`}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {e.debit_amount > 0 ? "Debit (Supply)" : "Credit (Payment)"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerPaymentsPage() {
  const { tokens } = useTenantTheme();
  const { data } = useQuery({
    queryKey: ["cust-payments"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/customer/payments");
        return res.data.data as Array<{
          id: string;
          payment_number: string;
          amount: number;
          payment_method: string;
          payment_date: string;
        }>;
      } catch {
        return [
          { id: "1", payment_number: "PAY-2026-0891", amount: 500, payment_method: "UPI (Google Pay)", payment_date: "2026-11-01" },
          { id: "2", payment_number: "PAY-2026-0742", amount: 600, payment_method: "Cash Collection", payment_date: "2026-10-01" },
        ];
      }
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className={tokens.badgeClass}>Verified Receipts</span>
        <h1 className={`mt-1 text-2xl ${tokens.fontHeading}`}>Payment History</h1>
      </div>

      <div className="space-y-3">
        {(data || []).map((p) => (
          <div key={p.id} className={`${tokens.cardClass} flex items-center justify-between`}>
            <div>
              <div className="font-mono font-bold text-sm text-slate-800">{p.payment_number}</div>
              <div className="text-xs text-slate-400 mt-0.5">{p.payment_method} · {p.payment_date}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-emerald-600">₹{p.amount}</div>
              <span className={tokens.badgeClass}>SUCCESS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerLeavePage() {
  const { tokens } = useTenantTheme();
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data } = useQuery({
    queryKey: ["cust-leaves"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/customer/leave-requests");
        return res.data.data as Array<{
          id: string;
          start_date: string;
          end_date: string;
          reason: string;
          request_status: string;
        }>;
      } catch {
        return [
          { id: "1", start_date: "2026-11-20", end_date: "2026-11-25", reason: "Out of town / Vacation", request_status: "APPROVED" },
        ];
      }
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      return apiClient.post("/customer/leave-requests", { start_date: startDate, end_date: endDate, reason });
    },
    onSuccess: () => {
      setReason("");
      setStartDate("");
      setEndDate("");
      setSuccessMsg("Delivery pause scheduled! Your daily route driver will be notified automatically.");
      setTimeout(() => setSuccessMsg(""), 4000);
      qc.invalidateQueries({ queryKey: ["cust-leaves"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className={tokens.badgeClass}>Route Pause Request</span>
        <h1 className={`mt-1 text-2xl ${tokens.fontHeading}`}>Vacation & Delivery Pauses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Travelling or away from home? Pause your daily water jar delivery in advance so no extra bottles are dispatched.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Form Card */}
      <div className={tokens.cardClass}>
        <h3 className={`text-base mb-4 ${tokens.fontHeading}`}>Schedule New Delivery Pause</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Pause Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Resume Supply Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Reason / Note</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vacation / Travelling"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => submit.mutate()}
            disabled={!startDate || !endDate}
            className={`${tokens.buttonClass} disabled:opacity-50`}
          >
            Submit Pause Request
          </button>
        </div>
      </div>

      {/* Existing Requests */}
      <div className="space-y-3">
        <h3 className={`text-base ${tokens.fontHeading}`}>My Past & Scheduled Pauses</h3>
        {(data || []).map((l) => (
          <div key={l.id} className={`${tokens.cardClass} flex items-center justify-between`}>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {l.start_date} → {l.end_date}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{l.reason}</div>
            </div>
            <span className={tokens.badgeClass}>{l.request_status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
