import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, FileText, Link2, FolderOpen, ExternalLink } from 'lucide-react';

export default function ClassMaterials({ classData, isTeacher }) {
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Course Syllabus', type: 'document', url: '#' },
    { id: 2, name: 'IB Assessment Criteria', type: 'document', url: '#' },
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Class Materials</h2>
        {isTeacher && (
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Upload className="w-4 h-4 mr-2" /> Upload Material
          </Button>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No materials yet</p>
          {isTeacher && <p className="text-sm mt-1">Upload your first resource</p>}
        </div>
      ) : (
        <div className="grid gap-3">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{m.type}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}