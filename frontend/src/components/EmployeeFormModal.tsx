import React, { useState } from "react";
import api from "../lib/api";

type Props = { open: boolean; onClose: () => void };

export default function EmployeeFormModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", jobTitle: "", department: "", location: ""
  });
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/employees", {
        jobTitle: form.jobTitle,
        department: form.department,
        location: form.location,
        user: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <form onSubmit={submit} className="relative z-50 card w-full max-w-lg p-6 md:p-8 animate-[fadeIn_200ms_ease-out]">
        <h3 className="mb-4">New employee</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">First name</label>
            <input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last name</label>
            <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input placeholder="(555) 555-5555" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Job title</label>
            <input placeholder="Senior Engineer" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input placeholder="Engineering" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required className="input mt-1" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input placeholder="San Francisco" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input mt-1" />
          </div>
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button disabled={loading} type="submit" className="btn-primary">{loading ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
