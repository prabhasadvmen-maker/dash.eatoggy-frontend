import React from 'react';
import Pagination from '../Pagination/Pagination';

const DataTablePagination = ({
  page = 1,
  limit = 20,
  total = 0,
  onPageChange,
  onLimitChange
}) => {
  return (
    <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Rows per page</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
          className="border border-slate-300 rounded-md py-1 px-2 focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none bg-white font-medium cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="flex-1 w-full max-w-sm sm:w-auto">
        <Pagination
          page={page}
          pageSize={limit}
          total={total}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default DataTablePagination;
