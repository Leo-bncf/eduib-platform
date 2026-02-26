/**
 * Reusable page header component
 */
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PageHeader({
  title,
  description = null,
  backTo = null,
  actions = null,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {backTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(createPageUrl(backTo))}
                className="mb-2 text-xs md:text-sm"
              >
                <ChevronLeft className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                Back
              </Button>
            )}
            <h1 className="text-lg md:text-2xl font-bold text-slate-900 truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs md:text-sm text-slate-600 mt-1 truncate">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}