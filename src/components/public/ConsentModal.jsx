import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

export default function ConsentModal({ isOpen, onClose }) {
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  if (!isOpen) return null;

  const canAccept = agreedPrivacy && agreedTerms;

  const handleAccept = () => {
    localStorage.setItem('scholr_consent_accepted', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Scholr</h2>
          </div>
          <p className="text-slate-600 mt-2">Please review and agree to our policies to continue.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={agreedPrivacy}
                onCheckedChange={setAgreedPrivacy}
                className="mt-1"
              />
              <label htmlFor="privacy" className="flex-1 cursor-pointer">
                <p className="font-semibold text-slate-900">Privacy Policy</p>
                <p className="text-sm text-slate-600 mt-1">
                  I agree to Scholr's{' '}
                  <Link
                    to={createPageUrl('PrivacyPolicy')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  {' '}and understand how my data is collected, used, and protected.
                </p>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedTerms}
                onCheckedChange={setAgreedTerms}
                className="mt-1"
              />
              <label htmlFor="terms" className="flex-1 cursor-pointer">
                <p className="font-semibold text-slate-900">Terms of Service</p>
                <p className="text-sm text-slate-600 mt-1">
                  I agree to Scholr's{' '}
                  <Link
                    to={createPageUrl('TermsOfService')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline font-semibold"
                  >
                    Terms of Service
                  </Link>
                  {' '}and accept its terms and conditions.
                </p>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Links to the full documents open in a new tab so you can review them while keeping this dialog open.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!canAccept}
            onClick={handleAccept}
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}