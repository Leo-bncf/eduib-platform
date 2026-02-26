import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/auth/UserContext';
import RoleGuard from '@/components/auth/RoleGuard';
import AppSidebar from '@/components/app/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, Building2, Shield, 
  Loader2, Search, AlertTriangle, Info, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const sidebarLinks = [
  { label: 'Dashboard', page: 'SuperAdminDashboard', icon: LayoutDashboard },
  { label: 'Schools', page: 'SuperAdminSchools', icon: Building2 },
  { label: 'Audit Logs', page: 'SuperAdminAuditLogs', icon: Shield },
];

const levelColors = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200'
};

const levelIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle
};

export default function SuperAdminAuditLogs() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 500),
    refetchInterval: 30000, // Refresh every 30 seconds
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
    <RoleGuard allowedRoles={['super_admin', 'admin']}>
      <div className="min-h-screen bg-slate-50">
        <AppSidebar links={sidebarLinks} role="super_admin" schoolName="Platform Admin" userName={user?.full_name} userId={user?.id} schoolId={null} />
        
        <main className="ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Logs</h1>
              <p className="text-slate-600">Platform-wide activity monitoring and security audit trail</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by action, user, or details..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="border border-slate-200 rounded-lg px-4 py-2 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>

                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="border border-slate-200 rounded-lg px-4 py-2 text-sm"
                >
                  <option value="all">All Schools</option>
                  <option value="null">Platform-wide</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Info</p>
                    <p className="text-2xl font-bold text-slate-900">{logs.filter(l => l.level === 'info').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Warnings</p>
                    <p className="text-2xl font-bold text-slate-900">{logs.filter(l => l.level === 'warning').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Critical</p>
                    <p className="text-2xl font-bold text-slate-900">{logs.filter(l => l.level === 'critical').length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Recent Activity</h2>
                <p className="text-sm text-slate-500 mt-1">{filteredLogs.length} log entries</p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredLogs.map(log => {
                    const LevelIcon = levelIcons[log.level] || Info;
                    return (
                      <div key={log.id} className="px-6 py-4 hover:bg-slate-50">
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            log.level === 'critical' ? 'bg-red-100' :
                            log.level === 'warning' ? 'bg-amber-100' :
                            'bg-blue-100'
                          }`}>
                            <LevelIcon className={`w-4 h-4 ${
                              log.level === 'critical' ? 'text-red-600' :
                              log.level === 'warning' ? 'text-amber-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-slate-900">{log.action?.replace(/_/g, ' ').toUpperCase()}</p>
                                <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                              </div>
                              <Badge variant="outline" className={levelColors[log.level]}>
                                {log.level}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                              <span>By: {log.user_email}</span>
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
        </main>
      </div>
    </RoleGuard>
  );
}