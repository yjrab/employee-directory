import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Directory from "./pages/Directory";
import EmployeeDetail from "./pages/EmployeeDetail";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loading, logout } = useAuth();

  const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!user) return <>{children}</>;

    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr] grid-rows-[auto_1fr] lg:grid-rows-1">
        <header className="lg:hidden sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary-600 text-white grid place-items-center font-bold">ED</div>
              <span className="font-semibold">Employee Directory</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/" className="btn-secondary text-sm shadow-sm">Directory</Link>
              {user && user.role === 'EMPLOYEE' && (
                <Link to={`/employees/${user.employeeId || user.id}`} className="btn-secondary text-sm shadow-sm">Profile</Link>
              )}
              <button onClick={logout} className="btn-secondary text-sm">Logout</button>
            </div>
          </div>
        </header>

        <aside className="hidden lg:flex flex-col gap-2 border-r border-gray-200 bg-white p-4">
          <Link to="/" className="flex items-center gap-2 px-2 py-2">
            <div className="h-9 w-9 rounded bg-primary-600 text-white grid place-items-center font-bold">ED</div>
            <div className="font-semibold">Employee Directory</div>
          </Link>
          <nav className="mt-4 flex-1">
            <ul className="space-y-1">
              <li>
                <Link to="/" className="btn-secondary flex items-center gap-3 px-3 py-2"> 
                  <span>Directory</span>
                </Link>
              </li>
              {user && user.role === 'EMPLOYEE' && (
                <li>
                  <Link to={`/employees/${user.employeeId || user.id}`} className="btn-secondary flex items-center gap-3 px-3 py-2"> 
                    <span>Profile</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="mt-auto">
            <button onClick={logout} className="btn-secondary w-full">Logout</button>
          </div>
        </aside>

        <main className="min-h-0 bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 grid place-items-center">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Layout><Login /></Layout>} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Layout><Register /></Layout>} />
        <Route path="/" element={user ? <Layout><Directory /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/employees/:id" element={user ? <Layout><EmployeeDetail /></Layout> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}
