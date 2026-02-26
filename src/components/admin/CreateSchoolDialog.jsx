import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function CreateSchoolDialog({ open, onOpenChange, onSchoolCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    plan: 'starter',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || !formData.email) {
        setError('School name and email are required');
        setLoading(false);
        return;
      }

      // Create school
      const newSchool = await base44.entities.School.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        plan: formData.plan,
        status: 'onboarding',
        billing_status: 'trial',
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        plan: 'starter',
      });

      onOpenChange(false);
      if (onSchoolCreated) {
        onSchoolCreated(newSchool);
      }
    } catch (err) {
      console.error('Error creating school:', err);
      setError(err.message || 'Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New School</DialogTitle>
          <DialogDescription>
            Add a new school to the platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800 ml-3 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="text-sm font-semibold mb-1 block">School Name *</Label>
            <Input
              type="text"
              name="name"
              placeholder="e.g., International High School"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">Email *</Label>
            <Input
              type="email"
              name="email"
              placeholder="admin@school.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">Phone</Label>
            <Input
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">City</Label>
            <Input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">Country</Label>
            <Input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-1 block">Plan</Label>
            <select
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {loading ? 'Creating...' : 'Create School'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}