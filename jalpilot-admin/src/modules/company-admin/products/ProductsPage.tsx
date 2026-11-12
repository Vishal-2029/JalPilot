import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/services/api-client";
import { PageHeader } from "@/components/common/PageHeader";

export function ProductsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("40");
  const [size, setSize] = useState("20");
  const [qty, setQty] = useState("100");

  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await apiClient.get("/admin/products")).data.data as Array<{
      id: string; product_name: string; product_code: string; bottle_size_liters: number;
      default_price: number; full_quantity: number; empty_quantity: number; damaged_quantity: number;
    }>,
  });

  const createProduct = useMutation({
    mutationFn: async () =>
      apiClient.post("/admin/products", {
        product_name: name,
        bottle_size_liters: Number(size),
        default_price: Number(price),
        initial_full_quantity: Number(qty),
      }),
    onSuccess: () => {
      setName("");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  return (
    <div>
      <PageHeader title="Products & Bottle Inventory" description="Manage water jars, pricing, and full/empty stock" />
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-5 items-end">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="20L Mineral Jar" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Liters" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (INR)" className="rounded-lg border px-3 py-2 text-sm" />
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Initial Full Qty" className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={() => createProduct.mutate()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
          Add Product
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(data || []).map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex justify-between">
              <h3 className="font-bold">{p.product_name}</h3>
              <span className="font-semibold text-sky-700">₹{p.default_price}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{p.product_code} · {p.bottle_size_liters}L</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-50 p-2"><div className="font-bold text-emerald-700">{p.full_quantity}</div>Full</div>
              <div className="rounded-lg bg-slate-100 p-2"><div className="font-bold text-slate-700">{p.empty_quantity}</div>Empty</div>
              <div className="rounded-lg bg-rose-50 p-2"><div className="font-bold text-rose-700">{p.damaged_quantity}</div>Damaged</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

