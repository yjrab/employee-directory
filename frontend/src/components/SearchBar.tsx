
type Props = { value: string; onChange: (v: string) => void };

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, title, email..."
        className="input pl-9 pr-3 py-2 w-64"
      />
      <svg className="pointer-events-none absolute left-2.5 top-2.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 104.473 8.59l2.968 2.969a.75.75 0 101.06-1.06l-2.969-2.97A5.5 5.5 0 009 3.5zM5.5 9a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" clipRule="evenodd" />
      </svg>
    </div>
  );
}
