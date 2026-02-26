import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Component for building/editing rubric criteria and scores
 * Used for creating grade item templates with multiple criteria
 */
export default function RubricBuilder({ open, onClose, onSave, initialRubric = null }) {
  const [criteria, setCriteria] = useState(initialRubric?.criteria || []);
  const [maxScore, setMaxScore] = useState(initialRubric?.max_score || 100);
  const [scoringType, setScoringType] = useState(initialRubric?.scoring_type || 'points');

  const handleAddCriterion = () => {
    const newCriterion = {
      id: `criterion-${Date.now()}`,
      name: '',
      description: '',
      max_score: 0,
      weight: 1
    };
    setCriteria([...criteria, newCriterion]);
  };

  const handleUpdateCriterion = (id, updates) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleRemoveCriterion = (id) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleSave = () => {
    onSave({
      criteria: criteria.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        max_score: parseInt(c.max_score) || 0,
        weight: parseFloat(c.weight) || 1
      })),
      max_score: parseInt(maxScore) || 0,
      scoring_type: scoringType
    });
    onClose();
  };

  const totalWeight = criteria.reduce((sum, c) => sum + (parseFloat(c.weight) || 1), 0);
  const totalMaxScore = criteria.reduce((sum, c) => sum + (parseInt(c.max_score) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Rubric</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Max Total Score</Label>
              <Input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Scoring Type</Label>
              <Select value={scoringType} onValueChange={setScoringType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="ib_grade">IB Grade (1-7)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-semibold">Criteria</Label>
              <Button size="sm" onClick={handleAddCriterion} className="gap-2">
                <Plus className="w-4 h-4" /> Add Criterion
              </Button>
            </div>

            {criteria.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                <p className="text-sm">No criteria yet. Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-3 items-start">
                      <GripVertical className="w-5 h-5 text-slate-400 mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Criterion name (e.g., 'Criterion A: Knowledge')"
                          value={criterion.name}
                          onChange={(e) => handleUpdateCriterion(criterion.id, { name: e.target.value })}
                          className="font-semibold"
                        />
                        <Textarea
                          placeholder="Description of what this criterion measures"
                          value={criterion.description}
                          onChange={(e) => handleUpdateCriterion(criterion.id, { description: e.target.value })}
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-600 font-medium">Max Score</label>
                            <Input
                              type="number"
                              value={criterion.max_score}
                              onChange={(e) => handleUpdateCriterion(criterion.id, { max_score: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600 font-medium">Weight</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={criterion.weight}
                              onChange={(e) => handleUpdateCriterion(criterion.id, { weight: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCriterion(criterion.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {criteria.length > 0 && (
              <div className="mt-4 pt-4 border-t text-sm text-slate-600">
                <p>Total Max Score: <span className="font-semibold">{totalMaxScore}</span></p>
                <p>Total Weight: <span className="font-semibold">{totalWeight.toFixed(1)}</span></p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            Save Rubric
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}