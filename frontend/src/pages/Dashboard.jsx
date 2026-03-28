import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, FileText, ChevronDown, Users, Key, Search, Trash2, Calendar, LayoutDashboard, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { workService, adminService, adminAttendanceService, attendanceService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function WorkUpdateForm({ onUpdate }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'in-progress' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Task title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await workService.addWork(form);
      addToast('Work update submitted successfully!', 'success');
      setForm({ title: '', description: '', status: 'in-progress' });
      if (onUpdate) onUpdate();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit work update.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-gray-900 font-semibold text-base">New Work Update</h3>
          <p className="text-gray-400 text-sm mt-0.5">Log your current task</p>
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Plus size={20} className="text-blue-600" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Task Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm(v => ({ ...v, title: e.target.value }))}
            placeholder="What are you working on?"
            className="w-full rounded-xl border border-gray-200 hover:border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(v => ({ ...v, description: e.target.value }))}
            placeholder="Details of the work..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 hover:border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm(v => ({ ...v, status: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        <Button onClick={handleSubmit} loading={loading} className="w-full">Submit Update</Button>
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <Card hover className={`border-none shadow-premium relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute top-0 right-0 w-24 h-24 translate-x-12 -translate-y-12 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ${color}`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </Card>
  );
}

function EmployeeDashboardView() {
  const [updates, setUpdates] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(null);
  const { addToast } = useToast();

  // Live elapsed time tracker for active sessions
  useEffect(() => {
    let timer;
    if (attendance && attendance.checkIn && !attendance.checkOut) {
      const updateElapsed = () => {
        const diff = Date.now() - new Date(attendance.checkIn).getTime();
        const mins = Math.max(0, Math.floor(diff / 60000));
        setElapsed(`${Math.floor(mins / 60)}h ${mins % 60}m`);
      };
      updateElapsed();
      timer = setInterval(updateElapsed, 60000);
    } else {
      setElapsed(null);
    }
    return () => clearInterval(timer);
  }, [attendance]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [updRes, attRes] = await Promise.all([
        workService.getMyWorkUpdates(),
        attendanceService.getMyAttendance()
      ]);
      setUpdates(updRes.data.data || []);
      // Get today's attendance record
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attRes.data.data.find(r => r.date === today);
      setAttendance(todayRecord);
    } catch (err) {
      addToast('Failed to load activity data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-500" size={30} /></div>;

  const stats = {
    total: updates.length,
    completed: updates.filter(u => u.status === 'completed').length,
    inProgress: updates.filter(u => u.status === 'in-progress').length,
    blocked: updates.filter(u => u.status === 'blocked').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Work Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Updates" value={stats.total} icon={FileText} color="bg-slate-600" delay={100} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="bg-emerald-500" delay={200} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="bg-blue-500" delay={300} />
        <StatCard label="Blocked" value={stats.blocked} icon={XCircle} color="bg-red-500" delay={400} />
      </div>

      {/* Attendance Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today's Attendance</h2>
          <Button variant="secondary" size="sm" onClick={() => window.location.href='/attendance'}>
            Check-in/Out
          </Button>
        </div>
        
        <Card padding="lg">
          {attendance ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-in</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <Clock size={16} className="text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-out</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Duration</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Loader2 size={16} className="text-purple-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {attendance.totalHours !== null 
                      ? `${Math.floor(attendance.totalHours / 60)}h ${attendance.totalHours % 60}m` 
                      : (elapsed || 'Calculating...')}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                <div className="flex items-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm
                    ${attendance.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {attendance.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Calendar size={32} className="text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">No Attendance Record</h4>
              <p className="text-gray-500 text-sm mt-1">You haven't checked in for today yet.</p>
              <Button className="mt-6" variant="primary" onClick={() => window.location.href='/attendance'}>Check-in Now</Button>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h2>
          <Button variant="ghost" size="sm" onClick={() => window.location.href='/work-updates'} className="text-[10px] uppercase font-bold tracking-widest">
            View All History
          </Button>
        </div>
        
        {updates.length === 0 ? (
          <Card className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <FileText size={24} className="text-gray-200" />
            </div>
            <p className="text-gray-500 font-bold">No updates logged yet</p>
            <p className="text-gray-400 text-sm mt-1">Your work logs will appear here</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {updates.slice(0, 6).map((u, i) => (
              <Card key={i} padding="md" className="border-l-4 border-l-green-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                      <Calendar size={10} />
                      {new Date(u.createdAt || u.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md shadow-sm">{u.status}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">{u.title || u.taskTitle}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{u.description}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboardView() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showReset, setShowReset] = useState(null);
  const [newPass, setNewPass] = useState('');
  
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        adminService.getEmployees(),
        adminAttendanceService.getAll()
      ]);
      setEmployees(empRes.data.data || []);
      setAttendance(attRes.data.data || []);
    } catch {
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    try {
      await adminService.deleteEmployee(id);
      addToast('Employee removed successfully', 'success');
      setEmployees(employees.filter(e => e._id !== id));
    } catch {
      addToast('Failed to delete employee.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPass) return;
    try {
      await adminService.resetPassword(showReset._id, newPass);
      addToast('Password reset successfully!', 'success');
      setShowReset(null);
      setNewPass('');
    } catch {
      addToast('Failed to reset password.', 'error');
    }
  };

  const filtered = employees.filter(e => e.email.toLowerCase().includes(search.toLowerCase()));
  const presentToday = attendance.filter(a => a.status === 'present' || a.status === 'partially-present').length;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-500" size={30} /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Employees" value={employees.length} icon={Users} color="bg-blue-600" delay={100} />
        <StatCard label="Active Today" value={presentToday} icon={CheckCircle} color="bg-emerald-500" delay={200} />
        <StatCard label="Management" value="Admin" icon={Clock} color="bg-brand-800" delay={300} />
      </div>

      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-50 items-center justify-between">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"><Search size={15} /></div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Employee', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <span className="text-green-700 text-xs font-bold">{emp.email[0]?.toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{emp.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">{emp.role}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400">
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN') : '--'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowReset(emp)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"><Key size={16} /></button>
                      <button onClick={() => handleDelete(emp._id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button onClick={() => setShowReset(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-sm text-gray-500 mt-1">Set a new password for <strong>{showReset.email}</strong></p>
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button type="submit" className="w-full" icon={CheckCircle}>Reset Now</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.name || 'there';
  const role = user?.role || 'Employee';

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Premium Header/Greeting */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <Card glass padding="lg" className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-emerald-500">{name.split(' ')[0]}</span> <span className="inline-block animate-bounce-slow">👋</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
              <LayoutDashboard size={14} className="text-emerald-500" />
              Your {role} Perspective • {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status</p>
                <p className="text-emerald-500 text-xs font-bold flex items-center justify-end gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   All Systems Operational
                </p>
             </div>
          </div>
        </Card>
      </div>

      {user?.role === 'admin' ? (
        <AdminDashboardView />
      ) : (
        <EmployeeDashboardView />
      )}
    </div>
  );
}
