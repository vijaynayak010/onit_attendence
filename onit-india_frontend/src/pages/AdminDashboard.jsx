import { useState, useEffect } from 'react';
import { Users, Search, Download, RefreshCw, FileText, CheckCircle, Clock, AlertCircle, Plus, X, Calendar, LogIn, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { workService, adminService, adminAttendanceService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'attendance'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));

  // Create Employee Modal State
  const [showModal, setShowModal] = useState(false);
  const [empForm, setEmpForm] = useState({ email: '', password: '', role: 'employee' });
  const [empLoading, setEmpLoading] = useState(false);

  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await workService.getWorkUpdates();
      // The backend returns an array of objects: { employeeName, date, taskTitle, description, status }
      setRecords(res.data.data || []);
    } catch (err) {
      addToast('Failed to load work updates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (date) => {
    setAttendanceLoading(true);
    try {
      const res = await adminAttendanceService.getAll(date);
      setAttendanceRecords(res.data.data || []);
    } catch {
      addToast('Failed to load attendance records.', 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => { fetchData(); fetchAttendance(attendanceDate); }, []);
  // Re-fetch attendance when date changes
  useEffect(() => { fetchAttendance(attendanceDate); }, [attendanceDate]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!empForm.email || !empForm.password) {
      addToast('Email and Password are required', 'error');
      return;
    }
    setEmpLoading(true);
    try {
      await adminService.createEmployee(empForm);
      addToast('Employee created successfully!', 'success');
      setShowModal(false);
      setEmpForm({ email: '', password: '', role: 'employee' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create employee.', 'error');
    } finally {
      setEmpLoading(false);
    }
  };

  const filtered = records.filter(r => {
    // If backend only sets employeeName derived from email, we search that.
    const nameMatch = r.employeeName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return nameMatch && matchFilter;
  });

  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    inProgress: records.filter(r => r.status === 'in-progress').length,
    blocked: records.filter(r => r.status === 'blocked').length,
  };

  const statusBadge = (status) => {
    const map = {
      'completed': 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'review': 'bg-yellow-100 text-yellow-700',
      'blocked': 'bg-red-100 text-red-700',
    };
    const labels = { 'completed': 'Completed', 'in-progress': 'In Progress', 'review': 'In Review', 'blocked': 'Blocked' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const fmtMins = (m) => m == null ? '--' : `${Math.floor(m / 60)}h ${m % 60}m`;

  const attendanceStatusBadge = (status) => {
    const map = {
      'present':            { label: 'Present',           cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
      'partially-present':  { label: 'Partially Present', cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
      'absent':             { label: 'Absent',            cls: 'bg-red-100 text-red-600',    dot: 'bg-red-500' },
    };
    const s = map[status] || map['absent'];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  const attendanceStats = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    partial: attendanceRecords.filter(r => r.status === 'partially-present').length,
    absent:  attendanceRecords.filter(r => r.status === 'absent').length,
  };

  const filteredAttendance = attendanceRecords.filter(r =>
    r.employeeName?.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
    r.employeeEmail?.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor team work updates, attendance, and manage employees</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowModal(true)} variant="primary" icon={Plus} size="sm">
            Create Employee
          </Button>
          <Button onClick={() => { fetchData(); fetchAttendance(); }} variant="outline" icon={RefreshCw} size="sm" loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('work')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'work' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={15} /> Work Updates
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'attendance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={15} /> Attendance
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'work' && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Updates" value={stats.total} icon={FileText} color="bg-slate-700" sub="All time" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="bg-green-500" sub="Tasks wrapped up" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="bg-blue-500" sub="Currently active" />
        <StatCard label="Blocked" value={stats.blocked} icon={AlertCircle} color="bg-red-400" sub="Need attention" />
      </div>)}

      {/* Work Updates Table */}
      {activeTab === 'work' && (
      <Card padding="sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-50">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by employee name..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex gap-2 font-medium">
            {['all', 'in-progress', 'completed', 'blocked'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs transition-all capitalize
                  ${filter === f ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f === 'all' ? 'All' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
          <Button variant="outline" icon={Download} size="sm" className="shrink-0">Export</Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Loading work updates...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No records found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Employee', 'Date', 'Task', 'Description', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-green-700 text-xs font-bold">{r.employeeName?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{r.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-900">{r.taskTitle}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-sm text-gray-600" title={r.description}>
                      {r.description}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {filtered.length} of {records.length} records</p>
          </div>
        )}
      </Card>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
      <Card padding="sm">
        {/* Attendance Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-50 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </div>
            <input
              value={attendanceSearch}
              onChange={e => setAttendanceSearch(e.target.value)}
              placeholder="Search by employee name or email..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Date:</span>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Attendance Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/50 border-b border-gray-50">
          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
            <p className="text-xs text-gray-400 font-medium">Present</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{attendanceStats.present}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
            <p className="text-xs text-gray-400 font-medium font-nowrap">Partially Present</p>
            <p className="text-xl font-bold text-amber-500 mt-0.5">{attendanceStats.partial}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 text-center shadow-sm">
            <p className="text-xs text-gray-400 font-medium">Absent</p>
            <p className="text-xl font-bold text-red-500 mt-0.5">{attendanceStats.absent}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {attendanceLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No attendance records found</p>
              <p className="text-gray-400 text-xs mt-1">Check another date or search query</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Employee', 'Check In', 'Check Out', 'Total Hours', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAttendance.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{r.employeeName?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.employeeName}</p>
                          <p className="text-xs text-gray-400">{r.employeeEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <LogIn size={13} /> {r.checkIn ? fmtTime(r.checkIn) : '--:--'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                        <LogOut size={13} /> {r.checkOut ? fmtTime(r.checkOut) : '--:--'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">{fmtMins(r.totalHours)}</td>
                    <td className="px-4 py-3.5">
                      {attendanceStatusBadge(r.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filteredAttendance.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">Showing {filteredAttendance.length} records</p>
          </div>
        )}
      </Card>
      )}

      {/* Create Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Employee</h2>
                <p className="text-sm text-gray-500 mt-1">Add a new user to the platform.</p>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={e => setEmpForm(v => ({...v, email: e.target.value}))}
                    placeholder="email@company.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    required
                    value={empForm.password}
                    onChange={e => setEmpForm(v => ({...v, password: e.target.value}))}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={empForm.role}
                    onChange={e => setEmpForm(v => ({...v, role: e.target.value}))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" loading={empLoading} variant="primary" className="flex-1" icon={Users}>
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
