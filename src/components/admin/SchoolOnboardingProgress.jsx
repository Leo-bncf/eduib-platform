import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

/**
 * Shows school onboarding progress
 */
export default function SchoolOnboardingProgress({ schoolId }) {
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const [academicYears, terms, subjects, classes] = await Promise.all([
          base44.entities.AcademicYear.filter({ school_id: schoolId }),
          base44.entities.Term.filter({ school_id: schoolId }),
          base44.entities.Subject.filter({ school_id: schoolId }),
          base44.entities.Class.filter({ school_id: schoolId })
        ]);

        const setupItems = [
          { label: 'School Profile', completed: true },
          { label: 'Academic Years', completed: academicYears.length > 0 },
          { label: 'Terms', completed: terms.length > 0 },
          { label: 'Subjects', completed: subjects.length > 0 },
          { label: 'Classes', completed: classes.length > 0 }
        ];

        const completedCount = setupItems.filter(i => i.completed).length;
        const progressPercent = (completedCount / setupItems.length) * 100;

        setProgress(progressPercent);
        setItems(setupItems);
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [schoolId]);

  if (loading) {
    return <div className="text-xs text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">Setup Progress</span>
        <span className="text-xs text-slate-600">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            {item.completed ? (
              <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            ) : (
              <Circle className="w-3 h-3 text-slate-300 flex-shrink-0" />
            )}
            <span className={item.completed ? 'text-slate-600' : 'text-slate-500'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}