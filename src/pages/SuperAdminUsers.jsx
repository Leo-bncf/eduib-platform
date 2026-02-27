import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Search, Users, Building2, ChevronLeft,
  User, Activity, School, BookOpen, CreditCard, FileText
} from 'lucide-react';
import ManageUserDialog from '@/components/admin/ManageUserDialog';

const roleColors = {
  super_admin: 'bg-red-900/50 text-red-300 border-red-800',
  school_admin: 'bg-purple-900/50 text-purple-300 border-purple-800',
  ib_coordinator: 'bg-blue-900/50 text-blue-300 border-blue-800',
  teacher: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  student: 'bg-indigo-900/50 text-indigo-300 border-indigo-800',
  parent: 'bg-amber-900/50 text-amber-300 border-amber-800',
  user: 'bg-slate-700/50 text-slate-400 border-slate-600',
};

export default function SuperAdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) { navigate('/'); return; }
      const user = await base44.auth.me();
      if (user.role !== 'super_admin') { navigate('/'); return; }

      const [allSchools, allUsers] = await Promise.all([
        base44.entities.School.list(),
        base44.asServiceRole.entities.User.filter({}, '', 10000),
      ]);

      setSchools(allSchools);

      const schoolMap = {};
      allSchools.forEach(s => { schoolMap[s.id] = s.name; });

      const usersWithSchools = allUsers.map(u => ({
        ...u,
        school_name: u.active_school_id ? (schoolMap[u.active_school_id] || 'Unknown') : '—',
      }));

      setUsers(usersWithSchools);
      setFilteredUsers(usersWithSchools);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [navigate]);

  useEffect(() => {
    let filtered = users;
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterRole !== 'all') filtered = filtered.filter(u => u.role === filterRole);
    if (filterSchool !== 'all') filtered = filtered.filter(u => u.active_school_id === filterSchool);
    setFilteredUsers(filtered);
  }, [searchQuery, filterRole, filterSchool, users]);

  const handleUserUpdated = () => {
    setManageDialogOpen(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const ROLES = ['all', 'super_admin', 'school_admin', 'ib_coordinator', 'teacher', 'student', 'parent', 'user'];

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
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium">
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
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-slate-400 text-sm mt-1">{users.length} total users across all schools</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Role filter */}
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">Role</p>
                <div className="flex flex-wrap gap-1">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filterRole === role
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {role === 'all' ? 'All Roles' : role.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* School filter */}
              <div>
                <p className="text-xs text-slate-500 mb-1 font-medium">School</p>
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Schools</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Showing <strong className="text-white">{filteredUsers.length}</strong> of <strong className="text-white">{users.length}</strong> users
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">User</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">School</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Role</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-slate-300">
                              {(user.full_name || user.email || '?')[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.full_name || '—'}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-slate-400">{user.school_name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleColors[user.role] || roleColors.user}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-500">
                          {user.created_date
                            ? new Date(user.created_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => { setSelectedUser(user); setManageDialogOpen(true); }}
                          variant="outline"
                          size="sm"
                          className="text-xs bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <ManageUserDialog
          open={manageDialogOpen}
          onOpenChange={setManageDialogOpen}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}