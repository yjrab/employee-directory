import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", jobTitle: "", department: "", location: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed");
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
            <h2>Create your account</h2>
          </div>
          {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm ring-1 ring-red-200">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input mt-1" />
              </div>
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job title</label>
              <input placeholder="Senior Engineer" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="input mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input placeholder="Engineering" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location (optional)</label>
              <input placeholder="San Francisco" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
              <input placeholder="(555) 555-5555" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input placeholder="you@company.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input mt-1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input placeholder="••••••••" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input mt-1" required />
            </div>
            <button className="btn-primary w-full">{loading ? "Creating…" : "Create account"}</button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="font-medium text-primary-600 hover:text-primary-700">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
