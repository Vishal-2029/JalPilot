import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function ExpensesPage() {
  const qc = useQueryClient();
  const [catName, setCatName] = useState("");
  const [catId, setCatId] = useState("");
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["admin-exp-cats"],
    queryFn: async () => (await apiClient.get("/admin/expense-categories")).data.data as Array<{ id: string; name: string }>,
  });

  const { data: expenses } = useQuery({
    queryKey: ["admin-expenses"],
    queryFn: async () => (await apiClient.get("/admin/expenses")).data.data as Array<{
      id: string; category: string; description: string; amount: number; expense_date: string;
    }>,
  });

  const addCat = useMutation({
    mutationFn: async () => apiClient.post("/admin/expense-categories", { name: catName }),
    onSuccess: () => { setCatName(""); qc.invalidateQueries({ queryKey: ["admin-exp-cats"] }); },
  });

  const addExp = useMutation({
    mutationFn: async () => apiClient.post("/admin/expenses", { category_id: catId, description: desc, amount: Number(amt) }),
    onSuccess: () => { setDesc(""); setAmt(""); qc.invalidateQueries({ queryKey: ["admin-expenses"] }); },
  });

  return (
    <div>
      <PageHeader title="Company Expenses" description="Track operational expenses separate from customer billing" />
      <div className="mb-4 flex gap-2">
        <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="New Category (e.g., Fuel)" className="rounded-lg border bg-white px-3 py-2 text-sm" />
        <button onClick={() => addCat.mutate()} className="rounded-lg border border-sky-600 px-3 py-2 text-sm font-semibold text-sky-700">Add Category</button>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-4 items-end">
        <select value={catId} onChange={(e) => setCatId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Select Category</option>
          {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Amount (INR)" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={() => addExp.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Record Expense</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(expenses || []).map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3">{e.expense_date}</td>
                <td className="px-4 py-3 font-medium">{e.category}</td>
                <td className="px-4 py-3">{e.description}</td>
                <td className="px-4 py-3 font-semibold text-rose-700">₹{e.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

