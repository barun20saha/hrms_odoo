import React from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import EmptyState from './EmptyState'

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortField?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  
  // Sorting
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle,
  emptyMessage,
  sortField,
  sortDirection,
  onSort,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: TableProps<T>) {
  
  const handleSortClick = (col: Column<T>) => {
    if (col.sortable && onSort) {
      const field = col.sortField || (typeof col.accessor === 'string' ? (col.accessor as string) : '');
      if (field) onSort(field);
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/50">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="py-4 px-6 font-semibold text-gray-500 dark:text-gray-400">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-24 animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rIdx) => (
                <tr key={rIdx} className="border-t border-gray-100 dark:border-slate-800">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-md w-3/4 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Table grid wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800/40 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800">
            <tr>
              {columns.map((col, idx) => {
                const isSortActive = sortField && (col.sortField === sortField || (typeof col.accessor === 'string' && col.accessor === sortField));
                return (
                  <th
                    key={idx}
                    onClick={() => handleSortClick(col)}
                    className={`py-4 px-6 font-semibold tracking-wider transition-colors duration-155 select-none ${
                      col.sortable && onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-white' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && onSort && (
                        <div className="flex flex-col text-gray-400 group">
                          {isSortActive && sortDirection === 'asc' ? (
                            <ChevronUp size={14} className="text-blue-600" />
                          ) : isSortActive && sortDirection === 'desc' ? (
                            <ChevronDown size={14} className="text-blue-600" />
                          ) : (
                            <ChevronUp size={14} className="opacity-40 group-hover:opacity-100" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80">
            {data.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                {columns.map((col, cIdx) => {
                  const renderedValue = typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode);
                  return (
                    <td key={cIdx} className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">
                      {renderedValue}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination panel */}
      {onPageChange && totalPages > 1 && (
        <div className="py-4 px-6 bg-gray-50/40 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-750 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-750 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
