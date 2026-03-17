import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Headphones,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Search,
  Tag,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import SuperAdminLoadingState from '@/components/admin/super-admin/SuperAdminLoadingState';
import SuperAdminPageHeader from '@/components/admin/super-admin/SuperAdminPageHeader';
import SuperAdminShell from '@/components/admin/super-admin/SuperAdminShell';
import { useSuperAdminAccess } from '@/components/hooks/useSuperAdminAccess';

// ─── Sample data (KB only) ────────────────────────────────────────────────────

const SAMPLE_ARTICLES = [
  { id: 'kb-1', title: 'How to set up academic years and terms', category: 'Onboarding', views: 312, status: 'published', updated: '2026-02-20' },
  { id: 'kb-2', title: 'Configuring role-based access for staff', category: 'Administration', views: 204, status: 'published', updated: '2026-02-18' },
  { id: 'kb-3', title: 'Using the IB Gradebook with HL/SL subjects', category: 'Gradebook', views: 489, status: 'published', updated: '2026-03-01' },
  { id: 'kb-4', title: 'Integrating Google Drive for assignments', category: 'Integrations', views: 177, status: 'published', updated: '2026-03-10' },
  { id: 'kb-5', title: 'Troubleshooting parent portal access', category: 'Troubleshooting', views: 95, status: 'draft', updated: '2026-03-15' },
];

const PRIORITY_META = {
  high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const STATUS_META = {
  open: { label: 'Open', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

// ─── Ticket Management ────────────────────────────────────────────────────────

function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    base44.entities.SupportTicket.list('-created_date', 200).then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const filtered = tickets.filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.school.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleStatusChange = async (id, status) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    await base44.entities.SupportTicket.update(id, { status });
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open', value: openCount, color: 'text-rose-600' },
          { label: 'In Progress', value: inProgressCount, color: 'text-indigo-600' },
          { label: 'Resolved', value: resolvedCount, color: 'text-emerald-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'open', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filterPriority === p ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {p === 'all' ? 'All Priority' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No tickets match your filters.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ticket) => {
              const isExpanded = expandedId === ticket.id;
              const pm = PRIORITY_META[ticket.priority] || PRIORITY_META.low;
              const sm = STATUS_META[ticket.status] || STATUS_META.open;
              return (
                <div key={ticket.id} className="p-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ticket.id)}>
                    <Ticket className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                        <span className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ticket.school} · {ticket.created}</p>
                    </div>
                    <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full border font-medium ${pm.color}`}>{pm.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sm.color}`}>{sm.label}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-7 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div><p className="text-slate-400">Assignee</p><p className="text-slate-700 font-medium">{ticket.assignee}</p></div>
                        <div><p className="text-slate-400">Created</p><p className="text-slate-700 font-medium">{ticket.created}</p></div>
                        <div><p className="text-slate-400">Priority</p><p className="text-slate-700 font-medium capitalize">{ticket.priority}</p></div>
                      </div>
                      <div className="flex gap-2 flex-wrap pt-1">
                        <span className="text-xs text-slate-500 self-center">Change status:</span>
                        {['open', 'in_progress', 'resolved'].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(ticket.id, s)}
                            disabled={ticket.status === s}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium capitalize transition-colors ${ticket.status === s ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            {s === 'in_progress' ? 'In Progress' : s}
                          </button>
                        ))}
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
  );
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

function KnowledgeBase() {
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editing, setEditing] = useState(null); // { id, title, category, status } | 'new'
  const [saved, setSaved] = useState(false);

  const categories = ['all', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || a.category === filterCategory;
    return matchSearch && matchCat;
  });

  const handleSaveArticle = () => {
    if (!editing || !editing.title.trim()) return;
    if (editing.id === 'new') {
      setArticles((prev) => [
        { id: `kb-${Date.now()}`, title: editing.title, category: editing.category || 'General', views: 0, status: editing.status || 'draft', updated: new Date().toISOString().slice(0, 10) },
        ...prev,
      ]);
    } else {
      setArticles((prev) => prev.map((a) => a.id === editing.id ? { ...a, title: editing.title, category: editing.category, status: editing.status, updated: new Date().toISOString().slice(0, 10) } : a));
    }
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-5">
      {saved && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800 ml-3 text-sm">Article saved successfully.</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Articles', value: articles.length, color: 'text-indigo-600' },
          { label: 'Published', value: articles.filter((a) => a.status === 'published').length, color: 'text-emerald-600' },
          { label: 'Total Views', value: articles.reduce((s, a) => s + a.views, 0).toLocaleString(), color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${filterCategory === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 flex-shrink-0"
          onClick={() => setEditing({ id: 'new', title: '', category: 'General', status: 'draft' })}
        >
          <Plus className="w-3.5 h-3.5" /> New Article
        </Button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">{editing.id === 'new' ? 'New Article' : 'Edit Article'}</h3>
            <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-slate-400 hover:text-slate-700" /></button>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Title</Label>
            <Input value={editing.title} onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))} placeholder="Article title..." className="mt-1 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600">Category</Label>
              <Input value={editing.category} onChange={(e) => setEditing((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Onboarding" className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-slate-600">Status</Label>
              <select
                value={editing.status}
                onChange={(e) => setEditing((p) => ({ ...p, status: e.target.value }))}
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1" onClick={handleSaveArticle}>
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Articles list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No articles found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((article) => (
              <div key={article.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{article.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{article.category} · Updated {article.updated}</p>
                </div>
                <span className="hidden sm:inline text-xs text-slate-400">{article.views} views</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${article.status === 'published' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {article.status === 'published' ? 'Published' : 'Draft'}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditing({ id: article.id, title: article.title, category: article.category, status: article.status })}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(article.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'tickets', label: 'Ticket Management', icon: Ticket },
  { key: 'kb', label: 'Knowledge Base', icon: BookOpen },
];

export default function SuperAdminSupport() {
  const navigate = useNavigate();
  const { currentUser, isChecking } = useSuperAdminAccess(navigate);
  const [activeTab, setActiveTab] = useState('tickets');

  if (isChecking) return <SuperAdminLoadingState />;
  if (!currentUser) return null;

  return (
    <SuperAdminShell activeItem="support" currentUser={currentUser}>
      <SuperAdminPageHeader
        title="Support Tools"
        subtitle="Manage school support tickets and the platform knowledge base"
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'tickets' && <TicketManagement />}
      {activeTab === 'kb' && <KnowledgeBase />}
    </SuperAdminShell>
  );
}