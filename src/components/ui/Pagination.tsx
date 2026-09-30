// src/components/ui/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = 'items',
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600 font-sans ${className}`}>
      
      {/* Left: Range and total count */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span>
          Showing <span className="font-semibold text-slate-900 font-mono tabular-nums">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900 font-mono tabular-nums">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900 font-mono tabular-nums">{totalItems}</span> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200">
            <span className="text-slate-500 text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 outline-none cursor-pointer hover:border-slate-400 font-mono"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[26px] h-6 px-1.5 rounded text-xs font-medium font-mono tabular-nums transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
