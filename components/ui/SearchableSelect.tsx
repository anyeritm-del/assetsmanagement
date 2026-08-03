"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface Option {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  name: string;
  options: Option[];
  defaultValue?: string | null;
  placeholder?: string;
  emptyLabel?: string;
}

export function SearchableSelect({
  name,
  options,
  defaultValue,
  placeholder = "Start typing to search...",
  emptyLabel = "No selection",
}: SearchableSelectProps) {
  const initial = options.find((option) => option.id === defaultValue) ?? null;
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [query, setQuery] = useState(initial?.label ?? "");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q ? options.filter((option) => option.label.toLowerCase().includes(q)) : options;
    return matches.slice(0, 20);
  }, [query, options]);

  function selectOption(option: Option | null) {
    setSelectedId(option?.id ?? "");
    setQuery(option?.label ?? "");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedId} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedId("");
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-blue-900"
        />
      </div>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => selectOption(null)}
              className="block w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {emptyLabel}
            </button>
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-400">No matches.</p>
            )}
            {filtered.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option)}
                className={`block w-full truncate px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  option.id === selectedId
                    ? "font-semibold text-blue-700 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
