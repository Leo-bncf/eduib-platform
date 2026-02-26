import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingStateBase({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}