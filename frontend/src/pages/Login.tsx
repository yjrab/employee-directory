import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav("/");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center pt-8">
      <div className="w-full max-w-md animate-[fadeIn_200ms_ease-out]">
        <div className="card p-6 md:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-lg bg-primary-600 text-white grid place-items-center font-bold">ED</div>
            <h2>Welcome back</h2>
            <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
          </div>
          {err && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm ring-1 ring-red-200">{err}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" type="email" placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" type="password" placeholder="••••••••" required />
            </div>
            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account? <a href="/register" className="font-medium text-primary-600 hover:text-primary-700">Register</a>
          </div>
        </div>
      </div>
    </div>
  );
}
