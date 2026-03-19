import React from 'react';
import { useImpersonation } from './ImpersonationContext';
import { useNavigate } from 'react-router-dom';
import { Eye, X } from 'lucide-react';

export default function ImpersonationBanner() {
  const { impersonation, exitImpersonation } = useImpersonation();
  const navigate = useNavigate();

  if (!impersonation) return null;

  const handleExit = () => {
    exitImpersonation();
    navigate('/SuperAdminSchools');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium shadow-md">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 shrink-0" />
        <span>
          Impersonating <strong>{impersonation.school?.name}</strong> as{' '}
          <strong className="capitalize">{impersonation.membershipRole.replace('_', ' ')}</strong>
        </span>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-xs transition-colors"
      >
        <X className="w-3.5 h-3.5" /> Exit Impersonation
      </button>
    </div>
  );
}