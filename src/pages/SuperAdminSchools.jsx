import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Loader2, Search, ChevronRight, Edit2,
  Activity, School, Users, CreditCard, BookOpen, FileText, Building2, Plus
} from 'lucide-react';
import SchoolOnboardingProgress from '@/components/admin/SchoolOnboardingProgress';
import SchoolQuickEdit from '@/components/admin/SchoolQuickEdit';
import CreateSchoolDialog from '@/components/admin/CreateSchoolDialog';

const statusConfig = {
  active:     { label: 'Active',      color: 'bg-emerald-900/50 text-emerald-300 border-emerald-800' },
  onboarding: { label: 'Onboarding',  color: 'bg-blue-900/50 text-blue-300 border-blue-800' },
  suspended:  { label: 'Suspended',   color: 'bg-red-900/50 text-red-300 border-red-800' },
  cancelled:  { label: 'Cancelled',   color: 'bg-slate-700/50 text-slate-400 border-slate-600' },
};

const billingConfig = {
  trial:    { label: 'Trial',     color: 'bg-amber-900/50 text-amber-300 border-amber-800' },
  active:   { label: 'Paid',      color: 'bg-emerald-900/50 text-emerald-300 border-emerald-800' },
  past_due: { label: 'Past Due',  color: 'bg-red-900/50 text-red-300 border-red-800' },
  incomplete:{ label: 'Incomplete',color: 'bg-orange-900/50 text-orange-300 border-orange-800' },
  canceled: { label: 'Canceled',  color: 'bg-slate-700/50 text-slate-400 border-slate-600' },
};

const STATUS_FILTERS = ['all', 'active', 'onboarding', 'suspended'];
const BILLING_FILTERS = ['all', 'trial', 'active', 'past_due'];

export default function SuperAdminSchools() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBilling, setFilterBilling] = useState('all');
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const loadSchools = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/'); return; }
      const user = await base44.auth.me();
      if (user?.role !== 'super_admin') { navigate('/'); return; }
      const allSchools = await base44.entities.School.list();
      setSchools(allSchools);
      setFilteredSchools(allSchools);
      setLoading(false);
    } catch (error) {
      console.error('Error loading schools:', error);
      setLoading(false);
    }
  };

  useEffect(() => { loadSchools(); }, [navigate]);

  const handleSchoolUpdated = async () => {
    const allSchools = await base44.entities.School.list();
    setSchools(allSchools);
    setEditingSchoolId(null);
  };

  useEffect(() => {
    let filtered = schools;
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterStatus !== 'all') filtered = filtered.filter(s => s.status === filterStatus);
    if (filterBilling !== 'all') filtered = filtered.filter(s => s.billing_status === filterBilling);
    setFilteredSchools(filtered);
  }, [searchQuery, filterStatus, filterBilling, schools]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Nav */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">IB Platform</span>
          <span className="text-slate-400 text-xs">Super Admin Console</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-1 flex-shrink-0">
          <Link to={createPageUrl('SuperAdminDashboard')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <Activity className="w-4 h-4" /> Overview
          </Link>
          <Link to={createPageUrl('SuperAdminSchools')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium">
            <School className="w-4 h-4" /> Schools
          </Link>
          <Link to={createPageUrl('SuperAdminUsers')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link to={createPageUrl('SuperAdminBilling')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <CreditCard className="w-4 h-4" /> Billing
          </Link>
          <Link to={createPageUrl('SuperAdminPlans')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <BookOpen className="w-4 h-4" /> Plans
          </Link>
          <Link to={createPageUrl('SuperAdminAuditLogs')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
            <FileText className="w-4 h-4" /> Audit Logs
          </Link>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">School Management</h1>
              <p className="text-slate-400 text-sm mt-1">{schools.length} total schools</p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
            >
              <Plus className="w-4 h-4" /> New School
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">Status</p>
                <div className="flex gap-1">
                  {STATUS_FILTERS.map(s => (
                    <button key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}>
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">Billing</p>
                <div className="flex gap-1">
                  {BILLING_FILTERS.map(b => (
                    <button key={b}
                      onClick={() => setFilterBilling(b)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        filterBilling === b ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}>
                      {b === 'all' ? 'All Billing' : b === 'past_due' ? 'Past Due' : b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schools List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <span className="text-sm text-slate-400">
                Showing <strong className="text-white">{filteredSchools.length}</strong> of <strong className="text-white">{schools.length}</strong> schools
              </span>
            </div>

            {filteredSchools.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No schools found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredSchools.map(school => {
                  const isEditing = editingSchoolId === school.id;
                  return (
                    <div key={school.id} className={`p-5 transition-colors ${isEditing ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}>
                      {isEditing ? (
                        <SchoolQuickEdit
                          school={school}
                          onUpdated={handleSchoolUpdated}
                          onCancel={() => setEditingSchoolId(null)}
                        />
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="text-base font-semibold text-white">{school.name}</h3>
                              {school.status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[school.status]?.color || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                  {statusConfig[school.status]?.label || school.status}
                                </span>
                              )}
                              {school.billing_status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${billingConfig[school.billing_status]?.color || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                  {billingConfig[school.billing_status]?.label || school.billing_status}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                              <div>
                                <p className="text-slate-500">Location</p>
                                <p className="text-slate-300 font-medium">{school.city || 'N/A'}, {school.country || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Plan</p>
                                <p className="text-slate-300 font-medium capitalize">{school.plan || 'Starter'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Created</p>
                                <p className="text-slate-300 font-medium">{new Date(school.created_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Trial End</p>
                                <p className="text-slate-300 font-medium">
                                  {school.trial_end_date ? new Date(school.trial_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-800">
                              <SchoolOnboardingProgress schoolId={school.id} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setEditingSchoolId(school.id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/SuperAdminSchoolDetail/${school.id}`)}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateSchoolDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSchoolCreated={() => loadSchools()}
      />
    </div>
  );
}