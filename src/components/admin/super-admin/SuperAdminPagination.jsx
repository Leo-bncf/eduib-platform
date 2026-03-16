import React from 'react';
import { Button } from '@/components/ui/button';

export default function SuperAdminPagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50/70">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="text-xs"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
}