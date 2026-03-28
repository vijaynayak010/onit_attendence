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
  // Work updates state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));

  // Create Employee Modal State
  const [showModal, setShowModal] = useState(false);
  const [empForm, setEmpForm] = useState({ email: '', password: '', role: 'employee' });
  const [empLoading, setEmpLoading] = useState(false);

  // Employee Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [empAttendance, setEmpAttendance] = useState([]);
  const [empWorkUpdates, setEmpWorkUpdates] = useState([]);
  const [modalTab, setModalTab] = useState('work');
  const [selectedModalMonth, setSelectedModalMonth] = useState(new Date().toISOString().slice(0, 7));

  const { addToast } = useToast();

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const res = await workService.getWorkUpdates({ date: date || workDate });
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
      const res = await adminAttendanceService.getAll(date || attendanceDate);
      setAttendanceRecords(res.data.data || []);
    } catch {
      addToast('Failed to load attendance records.', 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Fetch data on mount and whenever the respective dates change
  useEffect(() => {
    fetchData(workDate);
  }, [workDate]);

  useEffect(() => {
    fetchAttendance(attendanceDate);
  }, [attendanceDate]);

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

  const fetchEmployeeDetails = async () => {
    if (!selectedEmp) return;
    setModalLoading(true);
    try {
      const [attendRes, workRes] = await Promise.all([
        adminAttendanceService.getEmployeeAttendance(selectedEmp.id, { month: selectedModalMonth }),
        workService.getWorkUpdates({ employeeId: selectedEmp.id, month: selectedModalMonth })
      ]);
      setEmpAttendance(attendRes.data.data || []);
      setEmpWorkUpdates(workRes.data.data || []);
    } catch (err) {
      addToast('Failed to load employee details.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (showDetailModal && selectedEmp) fetchEmployeeDetails();
  }, [selectedEmp, selectedModalMonth, showDetailModal]);

  const handleEmployeeClick = (empId, empName, joiningDate) => {
    setSelectedEmp({ id: empId, name: empName, joiningDate });
    setShowDetailModal(true);
    setModalTab('work');
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
              placeholder="Search by name..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Date:</span>
            <input
              type="date"
              value={workDate}
              onChange={e => setWorkDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
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
                        <button 
                          onClick={() => handleEmployeeClick(r.employeeId, r.employeeName, r.joiningDate)}
                          className="text-sm font-medium text-gray-900 hover:text-green-600 hover:underline text-left"
                        >
                          {r.employeeName}
                        </button>
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
                          <button 
                            onClick={() => handleEmployeeClick(r.employeeId, r.employeeName, r.joiningDate)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline text-left block"
                          >
                            {r.employeeName}
                          </button>
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

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-200">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmp.name}'s History</h2>
                  <p className="text-sm text-gray-500">Employee Activity Logs</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-white border border-gray-100 hover:border-gray-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs & Filter */}
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-50 bg-white">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setModalTab('work')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all
                    ${modalTab === 'work' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <FileText size={16} /> Work
                </button>
                <button
                  onClick={() => setModalTab('attendance')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all
                    ${modalTab === 'attendance' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Calendar size={16} /> Attendance
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Filter Month:</p>
                <input
                  type="month"
                  value={selectedModalMonth}
                  onChange={(e) => setSelectedModalMonth(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {modalLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 font-medium">Fetching historical records...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalTab === 'work' ? (
                    (() => {
                      const jDate = selectedEmp.joiningDate ? new Date(selectedEmp.joiningDate).toISOString().slice(0, 10) : '0000-00-00';
                      const filtered = empWorkUpdates.filter(u => u.date >= jDate);
                      
                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <FileText size={48} className="text-gray-100 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No work updates logged for this period</p>
                          </div>
                        );
                      }
                      
                      return filtered.map((u, idx) => (
                        <Card key={idx} padding="md" className="border-l-4 border-l-green-500">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                                  {u.date}
                                </span>
                                {statusBadge(u.status)}
                              </div>
                              <h4 className="font-bold text-gray-900 text-lg mb-1">{u.taskTitle}</h4>
                              <p className="text-gray-600 text-sm leading-relaxed">{u.description}</p>
                            </div>
                          </div>
                        </Card>
                      ));
                    })()
                  ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {['Date', 'Check In', 'Check Out', 'Total', 'Status'].map(h => (
                              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(() => {
                            const [year, month] = selectedModalMonth.split('-').map(Number);
                            const daysInMonth = new Date(year, month, 0).getDate();
                            const dates = [];
                             const today = new Date().toISOString().slice(0, 10);
                             const currentMonthStr = today.slice(0, 7);

                             // If selected month is in the future, show nothing
                             if (selectedModalMonth > currentMonthStr) {
                               return (
                                 <tr>
                                   <td colSpan={5} className="py-20 text-center text-gray-400 italic">
                                     No data available for future dates
                                   </td>
                                 </tr>
                               );
                             }

                             const isCurrentMonth = today.startsWith(selectedModalMonth);
                             const maxDay = isCurrentMonth ? parseInt(today.split('-')[2]) : daysInMonth;
 
                             // Filter based on joining date
                             const jDate = selectedEmp.joiningDate ? new Date(selectedEmp.joiningDate).toISOString().slice(0, 10) : '0000-00-00';
 
                             for (let i = 1; i <= maxDay; i++) {
                               const dStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                               if (dStr >= jDate) {
                                 dates.push(dStr);
                               }
                             }
 
                             if (dates.length === 0) {
                               return (
                                 <tr>
                                   <td colSpan={5} className="py-20 text-center">
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                          <Calendar size={24} />
                                        </div>
                                        <p className="text-gray-500 font-bold">No records found for this period</p>
                                        <p className="text-xs text-gray-400">
                                          {selectedModalMonth < jDate.slice(0, 7) 
                                            ? `Employee joined on ${new Date(selectedEmp.joiningDate).toLocaleDateString()}` 
                                            : "No data available"}
                                        </p>
                                      </div>
                                   </td>
                                 </tr>
                               );
                             }

                            return dates.reverse().map(date => {
                              const a = empAttendance.find(h => h.date === date);
                              const dayOfWeek = new Date(date).getDay();
                              const isWeekend = dayOfWeek === 0;

                              return (
                                <tr key={date} className={`transition-colors ${a ? 'hover:bg-blue-50/30' : 'bg-gray-50/20'}`}>
                                  <td className="py-3 px-4 text-xs font-bold text-gray-700">
                                    {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}
                                  </td>
                                  <td className="py-3 px-4 text-xs text-green-600 font-medium">{a?.checkIn ? fmtTime(a.checkIn) : '--:--'}</td>
                                  <td className="py-3 px-4 text-xs text-gray-500 font-medium">{a?.checkOut ? fmtTime(a.checkOut) : '--:--'}</td>
                                  <td className="py-3 px-4 text-xs font-semibold">{a ? fmtMins(a.totalHours) : '--'}</td>
                                  <td className="py-3 px-4">
                                    {a ? attendanceStatusBadge(a.status) : (
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                        ${isWeekend ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-500'}`}>
                                        {isWeekend ? 'Off Day' : 'Absent'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <Button onClick={() => setShowDetailModal(false)} variant="primary" className="px-8 rounded-2xl">
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
