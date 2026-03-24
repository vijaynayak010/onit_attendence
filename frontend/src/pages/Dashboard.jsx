import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, LogOut, Loader2, FileText, ChevronDown, Users, Edit, Trash2, Key, Search, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { workService, adminService, adminAttendanceService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function WorkUpdateCard() {
  const [form, setForm] = useState({ title: '', description: '', status: 'in-progress' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
      setSuccess(true);
      setForm({ title: '', description: '', status: 'in-progress' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit work update.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card hover className="h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-gray-900 font-semibold text-base">Work Update</h3>
          <p className="text-gray-400 text-sm mt-0.5">Log your daily tasks & progress</p>
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <FileText size={20} className="text-blue-600" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Task Title <span className="text-red-500">*</span></label>
          <input
            value={form.title}
            onChange={(e) => { setForm(v => ({ ...v, title: e.target.value })); setErrors(v => ({ ...v, title: '' })); }}
            placeholder="e.g., Completed API integration"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500
              ${errors.title ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
          <textarea
            value={form.description}
            onChange={(e) => { setForm(v => ({ ...v, description: e.target.value })); setErrors(v => ({ ...v, description: '' })); }}
            placeholder="Describe what you worked on today..."
            rows={4}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500
              ${errors.description ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'}`}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <div className="relative">
            <select
              value={form.status}
              onChange={(e) => setForm(v => ({ ...v, status: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 hover:border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
            >
              <option value="in-progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="blocked">🚫 Blocked</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSubmit} loading={loading} className="w-full" icon={success ? CheckCircle : FileText}>
            {success ? 'Submitted Successfully!' : 'Submit Work Update'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <Card hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </Card>
  );
}

// --- NEW COMPONENT FOR ADMINS ---
function AdminDashboardView() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showReset, setShowReset] = useState(null); // stores employee item
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Employees" value={employees.length} icon={Users} color="bg-blue-600" />
        <StatCard label="Active Today" value={presentToday} icon={CheckCircle} color="bg-green-600" />
        <StatCard label="Support Staff" value="Admin" icon={Clock} color="bg-purple-600" />
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
            <tbody className="divide-y divide-gray-50 border-none">
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
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-400">
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN') : '--'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowReset(emp)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors" 
                        title="Reset Password"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp._id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors" 
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reset Password Modal */}
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1.5">Here's your {role} workspace for today.</p>
        </div>
      </div>

      {user?.role === 'admin' ? (
        <AdminDashboardView />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 xl:col-span-7">
            <WorkUpdateCard />
          </div>
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <Card hover className="bg-gradient-to-br from-green-50 to-emerald-100 border-none pb-8">
              <h3 className="text-gray-900 font-semibold mb-2">Welcome to OnIT India!</h3>
              <p className="text-gray-600 text-sm">Use this dashboard to keep track of your daily work updates and to share progress with your admin.</p>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Tasks Done" value="12" icon={CheckCircle} color="bg-green-500" />
              <StatCard label="In Progress" value="3" icon={Clock} color="bg-blue-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
