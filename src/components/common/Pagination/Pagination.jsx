import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../Button/Button';

const Pagination = ({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  className = ''
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className={`w-full flex items-center justify-between text-xs text-slate-500 ${className}`}>
      <div>
        Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800">{total}</span> entries
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange && onPageChange(page - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <span className="px-2 font-semibold text-slate-700">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange && onPageChange(page + 1)}
          icon={ChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
