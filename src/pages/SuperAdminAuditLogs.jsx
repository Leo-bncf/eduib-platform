import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Search, Activity, School, Users, CreditCard, BookOpen,
  FileText, Building2, Info, AlertTriangle, AlertCircle, Shield
} from 'lucide-react';
import { format } from 'date-fns';

const levelColors = {
  info:     'bg-blue-900/50 text-blue-300 border-blue-800',
  warning:  'bg-amber-900/50 text-amber-300 border-amber-800',
  critical: 'bg-red-900/50 text-red-300 border-red-800',
};

const levelIcons = { info: Info, warning: AlertTriangle, critical: AlertCircle };

export default function SuperAdminAuditLogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');

  useEffect(() => {
    const check = async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/'); return; }
      const user = await base44.auth.me();
      if (user?.role !== 'super_admin' && user?.role !== 'admin') { navigate('/'); return; }
    };
    check();
  }, [navigate]);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 500),
    refetchInterval: 30000,
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['schools-list'],
    queryFn: () => base44.entities.School.list(),
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchQuery ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSchool = filterSchool === 'all' || log.school_id === filterSchool;
    return matchesSearch && matchesLevel && matchesSchool;
  });

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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors">
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium">
            <FileText className="w-4 h-4" /> Audit Logs
          </Link>
        </div>

        {/* Main */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
              <p className="text-slate-400 text-sm mt-1">Platform-wide activity monitoring and security audit trail</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Info', count: logs.filter(l => l.level === 'info').length, icon: Info, color: 'text-blue-400', border: 'border-slate-800' },
              { label: 'Warnings', count: logs.filter(l => l.level === 'warning').length, icon: AlertTriangle, color: 'text-amber-400', border: 'border-slate-800' },
              { label: 'Critical', count: logs.filter(l => l.level === 'critical').length, icon: AlertCircle, color: 'text-red-400', border: 'border-red-900' },
            ].map(({ label, count, icon: Icon, color, border }) => (
              <div key={label} className={`bg-slate-900 border ${border} rounded-xl p-4 flex items-center gap-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-slate-400 text-xs">{label}</p>
                  <p className="text-xl font-bold text-white">{count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by action, user, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">Level</p>
                <div className="flex gap-1">
                  {['all', 'info', 'warning', 'critical'].map(l => (
                    <button key={l}
                      onClick={() => setFilterLevel(l)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        filterLevel === l ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}>
                      {l === 'all' ? 'All Levels' : l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">School</p>
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Schools</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <span className="text-sm text-slate-400">
                <strong className="text-white">{filteredLogs.length}</strong> log entries
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No audit logs found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredLogs.map(log => {
                  const LevelIcon = levelIcons[log.level] || Info;
                  return (
                    <div key={log.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          log.level === 'critical' ? 'bg-red-900/50' :
                          log.level === 'warning' ? 'bg-amber-900/50' : 'bg-blue-900/50'
                        }`}>
                          <LevelIcon className={`w-4 h-4 ${
                            log.level === 'critical' ? 'text-red-400' :
                            log.level === 'warning' ? 'text-amber-400' : 'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-white">{log.action?.replace(/_/g, ' ').toUpperCase()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${levelColors[log.level] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                              {log.level}
                            </span>
                          </div>
                          {log.details && <p className="text-xs text-slate-400 mb-2">{log.details}</p>}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {log.user_email && <span>By: {log.user_email}</span>}
                            {log.entity_type && <span>Entity: {log.entity_type}</span>}
                            <span>{format(new Date(log.created_date), 'MMM d, yyyy HH:mm:ss')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}