import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Spinner from '../Loader/Spinner';
import EmptyState from '../EmptyState/EmptyState';
import DataTableToolbar from './DataTableToolbar';
import DataTableFilters from './DataTableFilters';
import DataTablePagination from './DataTablePagination';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
  emptyMessage = 'No data available.',
  
  // Pagination
  pagination = null, // { page, limit, total }
  onPageChange,
  onLimitChange,

  // Search & Filters
  search = null, // { value, placeholder }
  onSearchChange,
  filterConfig = [],
  filters = {},
  onFilterChange,
  onClearFilters,
  
  // Toolbar actions
  actions = null,

  // Sorting
  sorting = null, // { sortBy, sortOrder }
  onSortChange,

  onRowClick,
  className = '',
  tableClassName = '',
  rowKey = '_id',
  id
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const safeData = Array.isArray(data) ? data : [];
  
  const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== null && val !== '');

  const handleSortClick = (colKey) => {
    if (!onSortChange || !sorting) return;
    const isCurrentSort = sorting.sortBy === colKey;
    let newOrder = 'asc';
    if (isCurrentSort && sorting.sortOrder === 'asc') newOrder = 'desc';
    onSortChange(colKey, newOrder);
  };

  return (
    <div id={id} className={`bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col ${className}`}>
      {/* Toolbar */}
      {(search || actions || filterConfig.length > 0) && (
        <DataTableToolbar
          search={search?.value}
          placeholder={search?.placeholder}
          onSearchChange={onSearchChange}
          actions={actions}
          filterConfig={filterConfig}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      )}

      {/* Filters */}
      <DataTableFilters
        show={showFilters}
        filterConfig={filterConfig}
        filters={filters}
        onFilterChange={onFilterChange}
        onClose={() => setShowFilters(false)}
      />

      <div className="overflow-x-auto custom-scrollbar flex-1">
        <table className={`w-full text-left border-collapse ${tableClassName}`}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => {
                const isSortable = col.sortable && onSortChange;
                const isSorted = sorting?.sortBy === col.key;
                
                return (
                  <th
                    key={col.key || idx}
                    style={col.width ? { width: col.width } : undefined}
                    className={`p-4 ${col.headerClassName || ''} ${col.align === 'right' ? 'text-right' : ''} ${isSortable ? 'cursor-pointer hover:bg-slate-100 transition-colors select-none' : ''}`}
                    onClick={() => isSortable ? handleSortClick(col.key) : undefined}
                  >
                    <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      {col.label}
                      {isSortable && (
                        <div className="flex flex-col text-slate-300 ml-1">
                          {(!isSorted || (isSorted && sorting.sortOrder === 'asc')) && <ArrowUp size={10} className={isSorted && sorting.sortOrder === 'asc' ? 'text-slate-800' : 'mb-[1px]'} />}
                          {(!isSorted || (isSorted && sorting.sortOrder === 'desc')) && <ArrowDown size={10} className={isSorted && sorting.sortOrder === 'desc' ? 'text-slate-800' : 'mt-[1px]'} />}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm text-slate-700 relative">
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} className="p-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Spinner size="md" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : safeData.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="p-12">
                  {emptyState ? (
                    emptyState
                  ) : (
                    <EmptyState description={emptyMessage} />
                  )}
                </td>
              </tr>
            ) : (
              safeData.map((row, rowIndex) => {
                const keyVal = row[rowKey] || row.id || rowIndex;
                return (
                  <tr
                    key={keyVal}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-all ${
                      onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.key || colIndex}
                        className={`p-4 ${col.className || ''} ${col.align === 'right' ? 'text-right' : ''}`}
                      >
                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <DataTablePagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};

export default DataTable;
