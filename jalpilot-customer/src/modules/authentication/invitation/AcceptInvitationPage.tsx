import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api-client";

export function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      await apiClient.post("/public/invitations/accept", { token, password });
      setMsg("Account activated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error: unknown) {
      setErr((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Activation failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-bold">Activate Your Customer Account</h1>
        <p className="mt-1 text-sm text-slate-500">Set your password to link your existing customer profile.</p>
        {msg && <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{msg}</div>}
        {err && <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{err}</div>}
        <form onSubmit={submit} className="mt-5 space-y-4">
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Invitation Token" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create Password (min 8 chars)" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <button type="submit" className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "var(--jp-primary)" }}>
            Activate Account
          </button>
        </form>
      </div>
    </div>
  );
}

