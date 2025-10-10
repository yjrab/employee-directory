import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    location: "",
  });
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const resp = await api.get(`/employees/${id}`);
        const e = resp.data;
        setData({
          id: e.id,
          firstName: e.user?.firstName ?? e.firstName,
          lastName: e.user?.lastName ?? e.lastName,
          email: e.user?.email ?? e.email,
          phone: e.user?.phone ?? null,
          pictureUrl: e.user?.pictureUrl ?? e.pictureUrl,
          jobTitle: e.jobTitle,
          department: e.department,
          location: e.location,
          hireDate: e.hireDate,
        });
      } catch (e) { console.error(e); }
    })();
  }, [id]);

  if (!data) return <div className="p-6 text-gray-600">Loading…</div>;

  const handleEditStart = () => {
    setForm({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phone: data.phone || "",
      jobTitle: data.jobTitle || "",
      department: data.department || "",
      location: data.location || "",
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.put(`/employees/${id}`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          jobTitle: form.jobTitle,
          department: form.department,
          location: form.location,
        }
      );
      const resp = await api.get(`/employees/${id}`);
      const e = resp.data;
      setData({
        id: e.id,
        firstName: e.user?.firstName ?? e.firstName,
        lastName: e.user?.lastName ?? e.lastName,
        email: e.user?.email ?? e.email,
        phone: e.user?.phone ?? null,
        pictureUrl: e.user?.pictureUrl ?? e.pictureUrl,
        jobTitle: e.jobTitle,
        department: e.department,
        location: e.location,
        hireDate: e.hireDate,
      });
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      window.history.back();
    } catch (err) { console.error(err); alert("Failed to delete"); }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto card p-6 md:p-8 relative">
        {(user?.role === "ADMIN" || user?.employeeId === data.id) && (
          <div className="absolute top-4 right-4 flex gap-2">
            {!editMode ? (
              <button
                className="rounded-md bg-white p-2 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 active:shadow focus:outline-none"
                onClick={handleEditStart}
                aria-label="Edit"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-700"><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM3 21a.75.75 0 0 0 .75.75h3.9a.75.75 0 0 0 .53-.22l11.2-11.2-3.712-3.712-11.2 11.2a.75.75 0 0 0-.22.53v3.9A.75.75 0 0 0 3 21Z"/></svg>
              </button>
            ) : (
              <>
                <button
                  className="rounded-md bg-white px-3 py-2 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 active:shadow focus:outline-none text-sm"
                  onClick={handleCancel}
                >Cancel</button>
                <button
                  className="btn-primary px-3 py-2 text-sm"
                  onClick={handleSave}
                  disabled={saving}
                >{saving ? "Saving…" : "Save"}</button>
              </>
            )}
            {user?.role === "ADMIN" && (
              <button
                className="rounded-md bg-red-600 p-2 text-white shadow-sm hover:bg-red-700 active:shadow focus:outline-none"
                onClick={handleDelete}
                aria-label="Delete"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16.5 4.5V6h3.75a.75.75 0 0 1 0 1.5h-.324l-1.18 12.077A2.25 2.25 0 0 1 16.505 22h-9.01a2.25 2.25 0 0 1-2.241-2.423L4.074 7.5H3.75a.75.75 0 0 1 0-1.5H7.5V4.5A2.25 2.25 0 0 1 9.75 2.25h4.5A2.25 2.25 0 0 1 16.5 4.5Zm-6 0v1.5h3V4.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75ZM9 9.75a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 9 9.75Zm6 0a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5a.75.75 0 0 1 .75-.75Z"/></svg>
              </button>
            )}
          </div>
        )}
        <div className="flex items-start gap-5">
          <img
            src={data.pictureUrl && data.pictureUrl.trim() !== "" ? data.pictureUrl : "/avatar-placeholder.svg"}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/avatar-placeholder.svg"; }}
            alt=""
            className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="min-w-0">
            {!editMode ? (
              <>
                <h2>{data.firstName} {data.lastName}</h2>
                <div className="mt-2 text-sm text-gray-700">{data.email}</div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500">First name</label>
                  <input className="input mt-1" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Last name</label>
                  <input className="input mt-1" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500">Email</label>
                  <input className="input mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-8">
          <h3 className="mb-3">Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
              <div className="text-xs uppercase text-gray-500">Job title</div>
              {!editMode ? (
                <div className="mt-1 text-sm">{data.jobTitle || "—"}</div>
              ) : (
                <input className="input mt-2" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
              <div className="text-xs uppercase text-gray-500">Department</div>
              {!editMode ? (
                <div className="mt-1 text-sm">{data.department || "—"}</div>
              ) : (
                <input className="input mt-2" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
              <div className="text-xs uppercase text-gray-500">Phone</div>
              {!editMode ? (
                <div className="mt-1 text-sm">{data.phone || "—"}</div>
              ) : (
                <input className="input mt-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
              <div className="text-xs uppercase text-gray-500">Location</div>
              {!editMode ? (
                <div className="mt-1 text-sm">{data.location || "—"}</div>
              ) : (
                <input className="input mt-2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              )}
            </div>
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
              <div className="text-xs uppercase text-gray-500">Hire date</div>
              <div className="mt-1 text-sm">{new Date(data.hireDate).toLocaleDateString()}</div>
            </div>
          </div>
        </section>

        
      </div>
    </div>
  );
}
