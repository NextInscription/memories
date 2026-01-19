import { useState } from 'react';

interface SearchFiltersProps {
  onSearchChange: (searchTerm: string) => void;
}

export default function SearchFilters({ onSearchChange }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <section className="mb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-[#e8f1f3] dark:border-gray-800">
        <div className="w-full md:w-96 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm"
            placeholder="Search memories by name..."
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 text-primary px-5 text-sm font-semibold">
            All Moments
          </button>
        </div>
      </div>
    </section>
  );
}
