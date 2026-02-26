import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ChevronRight, Edit2 } from 'lucide-react';
import SchoolStatusBadge from '@/components/admin/SchoolStatusBadge';
import SchoolOnboardingProgress from '@/components/admin/SchoolOnboardingProgress';
import SchoolFormSection from '@/components/admin/SchoolFormSection';
import SchoolQuickEdit from '@/components/admin/SchoolQuickEdit';

/**
 * Super admin school management view
 * Lists all schools with filtering and status indicators
 */
export default function SuperAdminSchools() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBilling, setFilterBilling] = useState('all');
  const [editingSchoolId, setEditingSchoolId] = useState(null);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate('/');
          return;
        }

        const user = await base44.auth.me();
        if (user?.role !== 'super_admin') {
          navigate('/');
          return;
        }

        const allSchools = await base44.entities.School.list();
        setSchools(allSchools);
        setFilteredSchools(allSchools);
        setLoading(false);
      } catch (error) {
        console.error('Error loading schools:', error);
        setLoading(false);
      }
    };

    loadSchools();
  }, [navigate]);

  const handleSchoolCreated = (newSchool) => {
    setSchools(prev => [newSchool, ...prev]);
    setFilteredSchools(prev => [newSchool, ...prev]);
  };

  const handleSchoolUpdated = () => {
    const reloadSchools = async () => {
      try {
        const allSchools = await base44.entities.School.list();
        setSchools(allSchools);
        setFilteredSchools(allSchools);
      } catch (error) {
        console.error('Error reloading schools:', error);
      }
    };
    reloadSchools();
    setEditingSchoolId(null);
  };

  // Filter schools
  useEffect(() => {
    let filtered = schools;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    // Billing filter
    if (filterBilling !== 'all') {
      filtered = filtered.filter(s => s.billing_status === filterBilling);
    }

    setFilteredSchools(filtered);
  }, [searchQuery, filterStatus, filterBilling, schools]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">School Management</h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 md:mt-2">Manage all schools and their lifecycle</p>
          </div>
          <Button onClick={() => navigate('/SuperAdminDashboard')} variant="outline" className="text-xs md:text-sm">
          Back to Dashboard
          </Button>
        </div>

        {/* Create School Form */}
        <SchoolFormSection onSchoolCreated={handleSchoolCreated} />

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'onboarding' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('onboarding')}
                  size="sm"
                >
                  In Setup
                </Button>
                <Button
                  variant={filterStatus === 'suspended' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('suspended')}
                  size="sm"
                >
                  Suspended
                </Button>
              </div>

              {/* Billing Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={filterBilling === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterBilling('all')}
                  size="sm"
                >
                  All Billing
                </Button>
                <Button
                  variant={filterBilling === 'trial' ? 'default' : 'outline'}
                  onClick={() => setFilterBilling('trial')}
                  size="sm"
                >
                  Trial
                </Button>
                <Button
                  variant={filterBilling === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterBilling('active')}
                  size="sm"
                >
                  Paid
                </Button>
                <Button
                  variant={filterBilling === 'past_due' ? 'default' : 'outline'}
                  onClick={() => setFilterBilling('past_due')}
                  size="sm"
                >
                  Past Due
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schools List */}
        <div className="space-y-2 md:space-y-3">
          {filteredSchools.length === 0 ? (
            <Card>
              <CardContent className="pt-6 p-4 md:p-6">
                <p className="text-center text-xs md:text-sm text-slate-600">No schools found</p>
              </CardContent>
            </Card>
          ) : (
            filteredSchools.map((school) => {
              const isEditing = editingSchoolId === school.id;
              
              return (
                <Card
                  key={school.id}
                  className={`transition-all ${isEditing ? 'ring-2 ring-indigo-500' : 'hover:shadow-md cursor-pointer'}`}
                >
                  <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                    {isEditing ? (
                      <SchoolQuickEdit
                        school={school}
                        onUpdated={handleSchoolUpdated}
                        onCancel={() => setEditingSchoolId(null)}
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">
                                {school.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <SchoolStatusBadge
                                  status={school.status}
                                  billingStatus={school.billing_status}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm mt-3">
                              <div className="min-w-0">
                                <p className="text-slate-600">Location</p>
                                <p className="font-semibold text-slate-900 truncate">
                                  {school.city || 'N/A'}, {school.country || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600">Plan</p>
                                <p className="font-semibold text-slate-900 capitalize">
                                  {school.plan || 'Starter'}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600">Created</p>
                                <p className="font-semibold text-slate-900 text-xs">
                                  {new Date(school.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600">Trial End</p>
                                <p className={`font-semibold text-xs ${
                                  school.trial_end_date ? 'text-slate-900' : 'text-slate-500'
                                }`}>
                                  {school.trial_end_date
                                    ? new Date(school.trial_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                            </div>

                            {/* Onboarding Progress */}
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                              <SchoolOnboardingProgress schoolId={school.id} />
                            </div>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSchoolId(school.id);
                              }}
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <button
                            onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}
                            className="text-slate-400 hover:text-slate-600"
                            >
                              <ChevronRight className="w-5 md:w-6 h-5 md:h-6" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 text-center text-sm text-slate-600">
          Showing {filteredSchools.length} of {schools.length} schools
        </div>
      </div>
    </div>
  );
}