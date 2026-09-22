import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../Button/Button';

const DataTableToolbar = ({
  search = '',
  onSearchChange,
  placeholder = 'Search...',
  actions,
  filterConfig,
  onToggleFilters,
  showFilters,
  onClearFilters,
  hasActiveFilters
}) => {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, search]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-100 bg-white rounded-t-2xl">
      <div className="flex items-center gap-2 flex-1 w-full sm:max-w-md">
        {onSearchChange !== undefined && (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterConfig && filterConfig.length > 0 && (
          <>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-slate-500 hover:text-slate-800 h-9">
                Clear Filters
              </Button>
            )}
            <Button
              variant={hasActiveFilters ? 'primary' : 'secondary'}
              size="sm"
              icon={Filter}
              onClick={onToggleFilters}
              className={`h-9 ${hasActiveFilters ? 'bg-slate-800 hover:bg-slate-900 text-white border-transparent' : ''}`}
            >
              Filter {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-[#d4af37]"></span>}
            </Button>
          </>
        )}
        {actions}
      </div>
    </div>
  );
};

export default DataTableToolbar;
