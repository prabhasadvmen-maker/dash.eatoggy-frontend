import React from 'react';
import Spinner from '../Loader/Spinner';
import Pagination from '../Pagination/Pagination';
import EmptyState from '../EmptyState/EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyState = null,
  emptyMessage = 'No data available.',
  pagination = false,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onRowClick,
  className = '',
  tableClassName = '',
  rowKey = '_id',
  id
}) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div id={id} className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className={`w-full text-left border-collapse ${tableClassName}`}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={`p-4 ${col.headerClassName || ''} ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} className="p-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Spinner size="md" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : safeData.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="p-8">
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

      {pagination && total > 0 && onPageChange && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DataTable;
