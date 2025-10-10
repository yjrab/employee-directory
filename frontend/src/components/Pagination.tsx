import React from "react";

type Props = {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
};

export default function Pagination({ page, total, limit, onPageChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-6 inline-flex items-center gap-2 rounded-md ring-1 ring-gray-200 bg-white p-1 shadow-sm">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="btn-secondary px-3 py-1 disabled:opacity-50">Prev</button>
      <div className="text-sm px-2">{page} / {pages}</div>
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="btn-secondary px-3 py-1 disabled:opacity-50">Next</button>
    </div>
  );
}
