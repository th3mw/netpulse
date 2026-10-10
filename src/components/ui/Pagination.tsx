import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppleButton } from './AppleButton';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t text-xs ${className}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Range and count display */}
      <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
        <span>
          Showing <span className="font-semibold font-mono" style={{ color: 'var(--text-main)' }}>{startItem}</span> to{' '}
          <span className="font-semibold font-mono" style={{ color: 'var(--text-main)' }}>{endItem}</span> of{' '}
          <span className="font-semibold font-mono" style={{ color: 'var(--text-main)' }}>{totalItems}</span> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span style={{ color: 'var(--text-dim)' }}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border text-xs font-mono outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)' }}
                >
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        <AppleButton
          variant="glass"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 h-7 w-7 rounded-lg"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </AppleButton>

        {getPageNumbers().map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span key={`el-${idx}`} className="px-1 text-xs select-none" style={{ color: 'var(--text-dim)' }}>
                …
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                isActive ? 'border shadow-sm' : 'hover:bg-white/10 opacity-80 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                borderColor: isActive ? 'var(--accent-primary-border)' : 'transparent',
                color: isActive ? 'var(--accent-primary-fg)' : 'var(--text-main)',
              }}
            >
              {p}
            </button>
          );
        })}

        <AppleButton
          variant="glass"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 h-7 w-7 rounded-lg"
          aria-label="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </AppleButton>
      </div>
    </div>
  );
};
