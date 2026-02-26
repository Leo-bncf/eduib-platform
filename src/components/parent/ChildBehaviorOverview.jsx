import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import BehaviorRecordsList from '@/components/behavior/BehaviorRecordsList';

export default function ChildBehaviorOverview({ schoolId, studentId }) {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['parent-child-behavior', schoolId, studentId],
    queryFn: () => base44.entities.BehaviorRecord.filter({
      school_id: schoolId,
      student_id: studentId,
      visible_to_parent: true
    }, '-date'),
    enabled: !!schoolId && !!studentId,
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
  }

  return <BehaviorRecordsList records={records} showVisibilityIndicators={false} />;
}