import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function DeliveriesPage() {
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("2");
  const [emptyRet, setEmptyRet] = useState("2");

  const { data: deliveries } = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: async () => (await apiClient.get("/admin/deliveries")).data.data as Array<{
      id: string; customer_name: string; delivery_date: string; delivery_status: string;
      quantity_delivered: number; empty_returned: number; total_amount: number;
    }>,
  });

  const { data: customers } = useQuery({
    queryKey: ["admin-customers-select"],
    queryFn: async () => (await apiClient.get("/admin/customers")).data.data as Array<{ id: string; full_name: string }>,
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-select"],
    queryFn: async () => (await apiClient.get("/admin/products")).data.data as Array<{ id: string; product_name: string }>,
  });

  const recordDelivery = useMutation({
    mutationFn: async () =>
      apiClient.post("/admin/deliveries", {
        customer_id: customerId,
        product_id: productId,
        quantity: Number(qty),
        empty_returned: Number(emptyRet),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-deliveries"] }),
  });

  return (
    <div>
      <PageHeader title="Daily Water Deliveries" description="Automatically updates bottle inventory and posts immutable ledger charges" />
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-5 items-end">
        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Select Customer</option>
          {(customers || []).map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Select Product</option>
          {(products || []).map((p) => <option key={p.id} value={p.id}>{p.product_name}</option>)}
        </select>
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Delivered Qty" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" value={emptyRet} onChange={(e) => setEmptyRet(e.target.value)} placeholder="Empty Returned" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={() => recordDelivery.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Record Delivery
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Delivered</th>
              <th className="px-4 py-3">Empty Returned</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(deliveries || []).map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3">{d.delivery_date}</td>
                <td className="px-4 py-3 font-medium">{d.customer_name}</td>
                <td className="px-4 py-3">{d.quantity_delivered}</td>
                <td className="px-4 py-3">{d.empty_returned}</td>
                <td className="px-4 py-3 font-semibold">₹{d.total_amount}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{d.delivery_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

