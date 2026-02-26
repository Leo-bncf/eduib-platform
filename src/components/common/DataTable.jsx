import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingStateBase from './LoadingStateBase';
import EmptyStateBase from './EmptyStateBase';

/**
 * Reusable data table component with pagination
 */
export default function DataTable({
  columns,
  data,
  isLoading,
  isEmpty,
  emptyMessage,
  onPageChange,
  currentPage,
  hasMore,
  isCompact = false,
}) {
  if (isLoading) {
    return <LoadingStateBase />;
  }

  if (isEmpty) {
    return (
      <EmptyStateBase
        title={emptyMessage?.title || 'No data'}
        description={emptyMessage?.description}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className={`w-full ${isCompact ? 'text-xs' : 'text-sm'}`}>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left py-2 px-3 font-semibold text-slate-700 ${col.width ? `w-${col.width}` : ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-2 px-3 text-slate-900">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Page {currentPage + 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasMore}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}