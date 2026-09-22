import React from 'react';
import { X } from 'lucide-react';

const DataTableFilters = ({
  filterConfig = [],
  filters = {},
  onFilterChange,
  show,
  onClose
}) => {
  if (!show || !filterConfig.length) return null;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-slate-50 border-b border-slate-100 px-4 pb-4">
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Advanced Filters</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-colors">
            <X size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filterConfig.map((config) => {
            const val = filters[config.key] || '';
            
            return (
              <div key={config.key} className="flex flex-col">
                <label className="text-xs font-semibold text-slate-600 mb-1.5">{config.label}</label>
                
                {config.type === 'select' ? (
                  <select
                    value={val}
                    onChange={(e) => handleChange(config.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all cursor-pointer"
                  >
                    <option value="">All {config.label}</option>
                    {config.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : config.type === 'date' ? (
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => handleChange(config.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all"
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => handleChange(config.key, e.target.value)}
                    placeholder={`Filter by ${config.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataTableFilters;
