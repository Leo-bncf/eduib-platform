import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Presentation, Table, Upload, Link as LinkIcon } from 'lucide-react';

const FORMAT_OPTIONS = [
  { value: 'google_doc', label: 'Google Doc', icon: FileText, description: 'Written work, essays, reports' },
  { value: 'google_slides', label: 'Google Slides', icon: Presentation, description: 'Presentations, visual projects' },
  { value: 'google_sheet', label: 'Google Sheet', icon: Table, description: 'Spreadsheets, data analysis' },
  { value: 'file_upload', label: 'File Upload', icon: Upload, description: 'PDFs, images, or other files' },
  { value: 'link', label: 'Link', icon: LinkIcon, description: 'External website or resource' },
];

export default function SubmissionFormatSelector({ selectedFormats, onChange }) {
  const handleToggle = (format) => {
    if (selectedFormats.includes(format)) {
      onChange(selectedFormats.filter(f => f !== format));
    } else {
      onChange([...selectedFormats, format]);
    }
  };

  return (
    <div>
      <Label className="text-sm font-semibold mb-3 block">Expected Submission Format</Label>
      <p className="text-xs text-slate-500 mb-3">
        Select how students should submit their work. Choose multiple formats if you want to give students options.
      </p>
      <div className="space-y-2">
        {FORMAT_OPTIONS.map(({ value, label, icon: Icon, description }) => (
          <div
            key={value}
            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedFormats.includes(value)
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => handleToggle(value)}
          >
            <Checkbox
              checked={selectedFormats.includes(value)}
              onCheckedChange={() => handleToggle(value)}
              className="mt-0.5"
            />
            <Icon className={`w-5 h-5 mt-0.5 ${selectedFormats.includes(value) ? 'text-indigo-600' : 'text-slate-400'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}