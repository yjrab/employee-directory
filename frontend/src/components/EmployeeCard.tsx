import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type Props = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    pictureUrl?: string | null;
    email: string;
    phone?: string | null;
  };
};

export default function EmployeeCard({ employee }: Props) {
  return (
    <Link to={`/employees/${employee.id}`} className="block">
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="card p-4 md:p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <img
            src={employee.pictureUrl && employee.pictureUrl.trim() !== "" ? employee.pictureUrl : "/avatar-placeholder.svg"}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/avatar-placeholder.svg"; }}
            alt=""
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
          />
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{employee.firstName} {employee.lastName}</div>
          <div className="text-sm text-gray-600 truncate">{employee.jobTitle}</div>
          <div className="text-xs text-gray-400 truncate">{employee.department}</div>
          <div className="text-xs text-gray-400 truncate">{employee.email}</div>
        </div>
      </div>
      </motion.div>
    </Link>
  );
}
