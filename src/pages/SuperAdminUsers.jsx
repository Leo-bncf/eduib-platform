import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, ChevronLeft, Shield, AlertCircle } from 'lucide-react';
import ManageUserDialog from '@/components/admin/ManageUserDialog';

const roleColors = {
  super_admin: 'bg-red-100 text-red-800',
  school_admin: 'bg-purple-100 text-purple-800',
  ib_coordinator: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  student: 'bg-indigo-100 text-indigo-800',
  parent: 'bg-amber-100 text-amber-800',
  user: 'bg-slate-100 text-slate-800',
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          navigate('/');
          return;
        }

        const user = await base44.auth.me();
        if (user.role !== 'super_admin') {
          navigate('/super-admin-dashboard');
          return;
        }

        // Load all schools
        const allSchools = await base44.entities.School.list();
        setSchools(allSchools);

        // Load all users
         const allUsers = await base44.asServiceRole.entities.User.list();
        
        // Enhance users with school info
        const usersWithSchools = await Promise.all(
          allUsers.map(async (u) => {
            if (u.active_school_id) {
              const schoolList = await base44.entities.School.filter({ id: u.active_school_id });
              return {
                ...u,
                school_name: schoolList.length > 0 ? schoolList[0].name : 'Unknown',
              };
            }
            return { ...u, school_name: 'N/A' };
          })
        );

        setUsers(usersWithSchools);
        setFilteredUsers(usersWithSchools);
        setLoading(false);
      } catch (error) {
        console.error('Error loading users:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    // School filter
    if (filterSchool !== 'all') {
      filtered = filtered.filter(u => u.active_school_id === filterSchool);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filterRole, filterSchool, users]);

  const handleUserUpdated = () => {
    setManageDialogOpen(false);
    // Reload users
    const reloadUsers = async () => {
      try {
        const allUsers = await base44.entities.User.list();
        const usersWithSchools = await Promise.all(
          allUsers.map(async (u) => {
            if (u.active_school_id) {
              const schoolList = await base44.entities.School.filter({ id: u.active_school_id });
              return {
                ...u,
                school_name: schoolList.length > 0 ? schoolList[0].name : 'Unknown',
              };
            }
            return { ...u, school_name: 'N/A' };
          })
        );
        setUsers(usersWithSchools);
      } catch (error) {
        console.error('Error reloading users:', error);
      }
    };
    reloadUsers();
  };

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
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button onClick={() => navigate('/SuperAdminDashboard')} variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">User Management</h1>
            </div>
            <p className="text-xs md:text-sm text-slate-600 ml-10">Manage all users across schools</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">Filter by Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="school_admin">School Admin</option>
                    <option value="ib_coordinator">IB Coordinator</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">Filter by School</label>
                  <select
                    value={filterSchool}
                    onChange={(e) => setFilterSchool(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Schools</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
         <div className="space-y-2 md:space-y-3">
           {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 p-4 md:p-6">
                <p className="text-center text-xs md:text-sm text-slate-600">No users found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">
                            {user.full_name || user.email}
                          </h3>
                          <Badge className={roleColors[user.role] || 'bg-slate-100 text-slate-800'}>
                            {user.role}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm mt-3">
                          <div className="min-w-0">
                            <p className="text-slate-600">Email</p>
                            <p className="font-semibold text-slate-900 truncate">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">School</p>
                            <p className="font-semibold text-slate-900 truncate">{user.school_name}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-slate-600">Joined</p>
                            <p className="font-semibold text-slate-900">
                              {user.created_date
                                ? new Date(user.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setManageDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs md:text-sm flex-shrink-0"
                      >
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
         <div className="mt-8 text-center text-sm text-slate-600">
           Showing {filteredUsers.length} of {users.length} users
         </div>

        {/* Manage User Dialog */}
        {selectedUser && (
          <ManageUserDialog
            open={manageDialogOpen}
            onOpenChange={setManageDialogOpen}
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
          />
        )}
      </div>
    </div>
  );
}