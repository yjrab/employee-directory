
type Props = {
  department?: string | null;
  onChange: (v: string | null) => void;
};

const departments = ["All", "Engineering", "Design", "Product", "Quality", "People", "Sales"];

export default function Filters({ department, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-2">
      <label className="text-sm text-gray-600">Department</label>
      <select
        value={department ?? "All"}
        onChange={(e) => onChange(e.target.value === "All" ? null : e.target.value)}
        className="rounded-md bg-white px-3 py-2 text-sm ring-1 ring-gray-200 shadow-sm hover:bg-gray-50 active:shadow focus:outline-none cursor-pointer"
      >
        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
}
