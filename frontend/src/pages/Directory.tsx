import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../lib/api";
import EmployeeCard from "../components/EmployeeCard";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import EmployeeFormModal from "../components/EmployeeFormModal";
import { useAuth } from "../hooks/useAuth";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  pictureUrl?: string | null;
  phone?: string | null;
};

export default function Directory() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterDept, setFilterDept] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (debouncedQuery) params.search = debouncedQuery;
      if (filterDept) params.department = filterDept;
      const resp = await api.get("/employees", { params });
      const flattened: Employee[] = resp.data.data.map((e: any) => ({
        id: e.id,
        firstName: e.user?.firstName ?? "",
        lastName: e.user?.lastName ?? "",
        email: e.user?.email ?? "",
        jobTitle: e.jobTitle,
        department: e.department,
        pictureUrl: e.user?.pictureUrl ?? null,
        phone: e.user?.phone ?? null,
      }));
      setEmployees(flattened);
      setTotal(resp.data.meta.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedQuery, filterDept]);

  const onSearchChange = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Employee Directory</h1>
          <p className="text-sm text-gray-600 mt-1">Search, filter and manage employees</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <Filters department={filterDept} onChange={setFilterDept} />
          </div>
          <div className="w-full sm:w-auto">
            <SearchBar value={query} onChange={onSearchChange} />
          </div>
          {user?.role === "ADMIN" && (
            <div className="w-full sm:w-auto">
              <button onClick={() => setOpenCreate(true)} className="btn-primary w-full sm:w-auto">New employee</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading…</div>
        ) : (
          <motion.div
            key={`grid-${Number(!loading)}-${employees.length}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="contents"
          >
            <AnimatePresence>
              {employees.map((emp, i) => (
                <motion.div
                  key={emp.id}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.04 }}
                >
                  <EmployeeCard employee={emp} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center">
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>

      <EmployeeFormModal open={openCreate} onClose={() => { setOpenCreate(false); fetchEmployees(); }} />
    </div>
  );
}
